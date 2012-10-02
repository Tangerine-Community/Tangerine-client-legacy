ResultOfQuestion = (name) ->
  $("#question-#{name}").attr("data-result")

class SurveyRunView extends Backbone.View
  events:
    'change input'        : 'updateSkipLogic'
    'change textarea'     : 'updateSkipLogic'

  initialize: (options) ->
    @model         = @options.model
    @parent        = @options.parent
    @isObservation = @options.isObservation
    @questionViews = []
    @answered      = []
    @questions     = new Questions
    @questions.fetch
      key: @model.get "assessmentId"
      success: (collection) =>
        @questions = new Questions(@questions.where { subtestId : @model.id })
        @questions.sort()
        @render()

  # when a question is answered
  onQuestionAnswer: (event) =>
    if @isObservation

      # find the view of the question
      cid = $(event.target).attr("data-cid")
      for view in @questionViews
        if view.cid == cid && view.type != "multiple" # if it's multiple don't go scrollin

          # find last or next not skipped
          next = $(view.el).next()
          while next.length != 0 && next.hasClass("disabled_skipped")
            next = $(next).next()
          
          # if it's not the last, scroll to it
          if next.length != 0
            next.scrollTo()

  updateSkipLogic: =>
    @questions.each (question) ->
      skipLogic = question.get "skipLogic"
      if skipLogic?
        result = CoffeeScript.eval "#{skipLogic}"
        if result
          $("#question-#{question.get "name"}").addClass "disabled_skipped"
        else
          $("#question-#{question.get "name"}").removeClass "disabled_skipped"
    _.each @questionViews, (questionView) ->
      questionView.updateValidity()
      
  isValid: ->
    for qv, i in @questionViews
      qv.updateValidity()
      # does it have a method? otherwise it's a string
      if qv.isValid?
        # can we skip it?
        if not ( qv.model.get("skippable") == "true" || qv.model.get("skippable") == true )
          # is it valid
          if not qv.isValid
            # red alert!!
            return false
    return true

  getSkipped: ->
    result = {}
    result[@questions.models[i].get("name")] = "skipped" for qv, i in @questionViews
    return result

  getResult: =>
    result = {}
    for qv, i in @questionViews
      result[@questions.models[i].get("name")] =
        if qv.notAsked # because of grid score
          qv.notAskedResult
        else if not _.isEmpty(qv.answer) # use answer
          qv.answer
        else if qv.skipped # 
          qv.skippedResult
        else if qv.$el.hasClass("disabled_skipped")
          qv.logicSkippedResult
        else
          qv.answer
    return result

  getSum: ->
    counts =
      correct   : 0
      incorrect : 0
      missing   : 0
      total     : 0

    for qv, i in @questionViews
      if _.isString(qv)
        counts.missing++
      else
        counts['correct']   += 1 if qv.isValid
        counts['incorrect'] += 1 if not qv.isValid
        counts['missing']   += 1 if not qv.isValid && ( qv.model.get "skippable" == 'true' || qv.model.get "skippable" == true )
        counts['total']     += 1 if true

    return {
      correct   : counts['correct']
      incorrect : counts['incorrect']
      missing   : counts['missing']
      total     : counts['total']
    }

  showErrors: ->
    @$el.find('.message').remove()
    first = true
    for qv, i in @questionViews
      if not _.isString(qv)
        message = ""
        if not qv.isValid
          message = "Please answer this question"
          if first == true
            qv.$el.scrollTo()
            Utils.midAlert "Please correct the errors on this page"
            first = false
        qv.setMessage message


  render: ->
    notAskedCount = 0
    @questions.sort()
    if @questions.models?
      for question, i in @questions.models
        # skip the rest if score not high enough

        required = parseInt(question.get("linkedGridScore")) || 0

        isNotAsked = (required != 0 && @parent.getGridScore() < required) || @parent.gridWasAutostopped()

        if isNotAsked then notAskedCount++

        oneView = new QuestionRunView 
          model         : question
          parent        : @
          notAsked      : isNotAsked
          isObservation : @isObservation
        oneView.on "rendered", @onQuestionRendered
        oneView.on "answer scroll",   @onQuestionAnswer

        oneView.render()
        @questionViews[i] = oneView
        @$el.append oneView.el

    @updateSkipLogic()
    if @questions.length == notAskedCount then @parent.next?()
    @trigger "rendered"

  onQuestionRendered: =>
    @trigger "subRendered"

  onClose:->
    for qv in @questionViews
      qv.close?()
    @questionViews = []

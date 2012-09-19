class SurveyRunView extends Backbone.View
  events:
    'change input'        : 'updateSkipLogic'
    'change textarea'     : 'updateSkipLogic'

  initialize: (options) ->
    @model         = @options.model
    @parent        = @options.parent
    @questionViews = []
    @questions     = new Questions
    @questions.fetch
      key: @model.get "assessmentId"
      success: (collection) =>
        @questions = new Questions(@questions.where { subtestId : @model.id })
        @questions.sort()
        @render()

  questionResult: (label) =>
    # Should really return the label, not the value, too much indirection. Maybe the GUI will help.
    @getResult()[name]

  updateSkipLogic: =>
    @questions.each (question) ->
      skipLogic = question.get "skipLogic"
      if skipLogic?
        result = CoffeeScript.eval "#{skipLogic}"
        if result is false
          $("#question-#{question.get "name"}").addClass "disabled_skipped"
        else
          $("#question-#{question.get "name"}").removeClass "disabled_skipped"
    _.each @questionViews, (questionView) ->
      questionView.updateValidity()
      
  isValid: ->
    for qv, i in @questionViews
      console.log qv.isValid
      qv.updateValidity()
      console.log qv.isValid
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
    if ( model.get("skippable") == "true" || model.get("skippable") == true )
      result = {}
      for qv, i in @questionViews
        result[@questions.models[i].get("name")] = qv.answer
      return result

  getResult: =>
    console.log @
    result = {}
    for qv, i in @questionViews
      console.log i
      result[@questions.models[i].get("name")] = qv.answer
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
    @questions.sort()
    if @questions.models?
      for question, i in @questions.models
        # skip the rest if score not high enough

        required = parseInt(question.get("linkedGridScore")) || 0

        isNotAsked = (required != 0 && @parent.getGridScore() < required)
        oneView = new QuestionRunView
          model  : question
          parent : @
          notAsked : isNotAsked
        oneView.on "rendered", @onQuestionRendered
        oneView.render()
        @questionViews[i] = oneView
        @$el.append oneView.el

    @updateSkipLogic()
    @trigger "rendered"

  onQuestionRendered: =>
    @trigger "rendered"

  onClose:->
    for qv in @questionViews
      qv.close?()
    @questionViews = []

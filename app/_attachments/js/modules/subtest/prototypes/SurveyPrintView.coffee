class SurveyPrintView extends Backbone.View
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

  render: ->
    notAskedCount = 0
    @questions.sort()
    if @questions.models?
      for question, i in @questions.models
        # skip the rest if score not high enough

        required = parseInt(question.get("linkedGridScore")) || 0

        isNotAsked = (required != 0 && @parent.getGridScore() < required) || @parent.gridWasAutostopped()

        if isNotAsked then notAskedCount++

        oneView = new QuestionPrintView 
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

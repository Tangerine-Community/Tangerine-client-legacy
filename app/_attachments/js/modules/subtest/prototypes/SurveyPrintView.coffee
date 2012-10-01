class SurveyPrintView extends Backbone.View

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

        oneView = new QuestionPrintView 
          model         : question
          parent        : @
          isObservation : @isObservation
        oneView.on "rendered", @onQuestionRendered

        oneView.render()
        @questionViews[i] = oneView
        @$el.append oneView.el

    if @questions.length == notAskedCount then @parent.next?()
    @trigger "rendered"

  onQuestionRendered: =>
    @trigger "subRendered"

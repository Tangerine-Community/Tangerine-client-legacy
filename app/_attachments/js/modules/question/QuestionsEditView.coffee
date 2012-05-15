class QuestionsEditView extends Backbone.View

  tagName : "ul"
  className : "questions_edit_view"

  initialize: ( options ) ->

    @views = []

    @questions = options.questions
    @isPreview = []
    @views = []
    for question, i in @questions.models
      @isPreview[i] = true
      @views.push new QuestionEditView
        model     : question
        parent    : @
        index     : i
        isPreview : @isPreview[i]

  render: ->
    for view, i in @views
      view.render @isPreview[i]
      @$el.append view.el
    console.log @el

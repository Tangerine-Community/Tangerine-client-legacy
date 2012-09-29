class AssessmentPrintView extends Backbone.View
  
  initialize: (options) ->
    @abortAssessment = false
    @index = 0
    @model = options.model

    Tangerine.activity = "assessment print"
    @subtestViews = []
    @model.subtests.sort()
    @model.subtests.each (model) =>
      @subtestViews.push new SubtestPrintView
        model  : model
        parent : @
  
  render: ->
 
    
    if @model.subtests.length == 0
      @$el.append "<h1>Oops...</h1><p>This assessment is blank. Perhaps you meant to add some subtests.</p>"
    else

      _.each @subtestViews , (subtestView) =>

        subtestView.render()
        @$el.append subtestView.el

    @trigger "rendered"

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
 
    currentView = @subtestViews[@index]
    
    if @model.subtests.length == 0
      @$el.append "<h1>Oops...</h1><p>This assessment is blank. Perhaps you meant to add some subtests.</p>"
    else
      @$el.html "
        <h1>#{@model.get 'name'}</h1>
        <div id='progress'></div>
      "
      @$el.find('#progress').progressbar value : ( ( @index + 1 ) / ( @model.subtests.length + 1 ) * 100 )

      currentView.on "rendered", => @trigger "rendered"
      currentView.on "subRendered", => @trigger "subRendered"

      currentView.render()
      @$el.append currentView.el

    @trigger "rendered"

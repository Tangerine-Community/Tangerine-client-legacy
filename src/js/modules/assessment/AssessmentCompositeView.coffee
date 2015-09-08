AssessmentCompositeView = Backbone.Marionette.CompositeView.extend
  childView: SubtestRunItemView,
  childViewContainer: '#survey',
  template: JST["src/templates/HomeView.handlebars"]
#  el:'content'

  initialize: (options) ->

    @abortAssessment = false
    @index = 0
    @model = options.model
    @orderMap = []
    @enableCorrections = false  # toggled if user hits the back button.

    Tangerine.tempData = {}

    @rendered = {
      "assessment" : false
      "subtest" : false
    }

    Tangerine.activity = "assessment run"
    @subtestViews = []
#    @model.parent = @
    @model.subtests.sort()
    @model.subtests.each (model) =>
      model.parent = @
      @subtestViews.push new SubtestRunView
        model  : model
        parent : @

    @collection = @model.subtests

    hasSequences = @model.has("sequences") && not _.isEmpty(_.compact(_.flatten(@model.get("sequences"))))

    if hasSequences
      sequences = @model.get("sequences")

      # get or initialize sequence places
      places = Tangerine.settings.get("sequencePlaces")
      places = {} unless places?
      places[@model.id] = 0 unless places[@model.id]?

      if places[@model.id] < sequences.length - 1
        places[@model.id]++
      else
        places[@model.id] = 0

      Tangerine.settings.save("sequencePlaces", places)

      @orderMap = sequences[places[@model.id]]
      @orderMap[@orderMap.length] = @subtestViews.length
    else
      for i in [0..@subtestViews.length]
        @orderMap[i] = i

    @result = new Result
      assessmentId   : @model.id
      assessmentName : @model.get "name"
      blank          : true

    if hasSequences then @result.set("order_map" : @orderMap)

    resultView = new ResultView
      model          : @result
      assessment     : @model
      assessmentView : @
    @subtestViews.push resultView

  onRender:->
    currentView = @subtestViews[@orderMap[@index]]
    @$el.find('#progress').progressbar value : ( ( @index + 1 ) / ( @model.subtests.length + 1 ) * 100 )
    currentView.on "rendered",    => @flagRender "subtest"
    currentView.on "subRendered", => @trigger "subRendered"

    currentView.on "next",    => @step 1
    currentView.on "back",    => @step -1

  skip: =>
    currentView = @subtestViews[@orderMap[@index]]
    @result.add
      name      : currentView.model.get "name"
      data      : currentView.getSkipped()
      subtestId : currentView.model.id
      skipped   : true
      prototype : currentView.model.get "prototype"
    ,
      success: =>
        @reset 1

  step: (increment) =>

    if @abortAssessment
      currentView = @subtestViews[@orderMap[@index]]
      @saveResult( currentView )
      return

    currentView = @subtestViews[@orderMap[@index]]
    if currentView.isValid()
      @saveResult( currentView, increment )
    else
      currentView.showErrors()



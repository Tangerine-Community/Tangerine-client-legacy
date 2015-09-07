AssessmentCompositeView = Backbone.Marionette.CompositeView.extend
  childView: SubtestRunItemView,
  childViewContainer: '#records',
  template: JST["src/templates/HomeView.handlebars"]

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
    @model.subtests.sort()
    @model.subtests.each (model) =>
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

  events:
    "change #formDropdown": "chooseForm"

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

  chooseForm: ->
    form = $('#formDropdown').val();
    if form == 'TrichiasisSurgery'
      this.trichiasisSurgery()
    else if form == 'PostOperativeFollowup'
      this.postOperativeFollowup()
    else if form == 'PostOperativeEpilation'
      this.postOperativeEpilation()
    else if form == 'PostOperativeFollowup_1day'
      this.postOperativeFollowup_1day()
    else if form == 'PostOperativeFollowup_7_14_days'
      this.postOperativeFollowup_7_14_days()
    else if form == 'PostOperativeFollowup_3_6_months'
      this.postOperativeFollowup_3_6_months()
    return

  trichiasisSurgery: ->
    console.log "trichiasisSurgery"
#    Coconut.router.navigate "#new/result/Trichiasis%20Surgery",true
    return
#
#  postOperativeFollowup: ->
#    console.log "postOperativeFollowup"
#    Coconut.router.navigate "#new/result/Post-Operative%20Followup",true
#    return
#
  postOperativeEpilation: ->
    console.log "postOperativeEpilation"
#    Coconut.router.navigate "#new/result/PostOperativeEpilation",true
    return


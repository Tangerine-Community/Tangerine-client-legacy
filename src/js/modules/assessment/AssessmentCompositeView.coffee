#
# AssessmentCompositeView
#
# AssessmentCompositeView renders every time a new subtest is shown. When next
# or back is clicked, the reset(incrementTomoveToSubtestViewIndex) method is
# eventually called which calls render. `reset` method seems familiar because
# there is `reset` on Backbone.Collection, but this reset on a View is it's own
# thing. `AssessmentCompositeView.reset` and `AssessmentCompositeView.initialize`
# ensure that there is only one model in `AssessmentCompositeView.collection` for
# `AssessmentCompositeView.render` to render. Which Model should be in that
# `AssessmentCompositeView.collection` is determined by `AssessmentCompositeView.index`.


AssessmentCompositeView = Backbone.Marionette.CompositeView.extend

  #
  # AssessmentCompositeView.initialize overrides Backbone.View.initialize
  #
  # @param options = {
  #   assessment: An Assessment Model.
  #   result: A Result Model.
  # }
  #
  initialize: (options) ->

    @i18n()

    @assessment = options.assessment
    @result = options.result

    # Set up models and collection for display in this Composite View.
    # The Assessment is our branch, AKA the model in the Composite View.
    @model = @assessment
    # Only one model in the collection at a time for performance reasons, the
    # rest of the models store off to the side in @frames.
    @collection = new Backbone.Collection()
    @frames = new Backbone.Collection()

    # Load up the @frames and set our first model in the @collection for rendering.
    # Start with the subtests as frames.
    @frames.add(@assessment.subtests.models)
    # Now push results on the last frame.
    @frames.add(@result)

    # Figure out the order map of the frames and our current index, which may exist if there are already
    # results, but if not then we look for a sequence to use on the assessment.
    @orderMap = []
    @index = 0
    if @result.has("order_map")
      # save the order map of previous randomization
      @orderMap = @result.get("order_map").slice() # clone array
      # restore the previous ordermap
      @index = @orderMap[@result.get("subtestData").length]
    else if this.assessment.get("sequence")
      @orderMap = @model.get("sequence")[0]
      @index = 0
    else
      limit = @frames.length
      i = 0
      while i <= limit
        @orderMap.push(i)
        i++

    # Set the current frame
    @collection.add(@frames.models[@orderMap[@index]])

    @on('render', =>
      @currentChildView = @children.findByModel(@collection.models[0])
    )

    # Set some states.
    @abortAssessment = false
    @enableCorrections = false  # toggled if user hits the back button.
    @rendered = {
      "assessment" : false
      "subtest" : false
    }

    # @todo Do we need globals here?
    # Set global variables
    Tangerine.progress = {}
    Tangerine.progress.index = @index
    Tangerine.tempData = {}
    Tangerine.activity = "assessment run"
    Tangerine.assessmentView = @

  events:
    'click .subtest-next' : 'next'
    'click .subtest-back' : 'back'
    'click .subtest_help' : 'toggleHelp'
    'click .skip'         : 'skip'
    'click .next_question' : 'nextQuestion'
    'click .prev_question' : 'prevQuestion'

  template: JST["AssessmentView"]

  # Populate the questions in the model of the subtest.
  childViewOptions: (model, index) ->
    model.questions.fetch
      viewOptions:
        key: "question-#{model.id}"
      success: (collection) =>
        model.questions.sort()
        model.collection = model.questions
        @collection.models = collection.models
      error: (model, err, cb) ->
        console.log("childViewOptions id: " +  model.id + " err:" + JSON.stringify(err))

  getChildView: (model) ->
    model.parent = @
    if !model.questions
      model.questions     = new Questions()
    if model.get("collection") == 'result'
      currentSubview =  ResultItemView
    else
      prototypeName = model.get('prototype').titleize() + "RunItemView"
      if  (prototypeName == 'SurveyRunItemView')
        currentSubview = SurveyRunItemView
      else if  (prototypeName == 'GridRunItemView')
        currentSubview = GridRunItemView
      else if  (prototypeName == 'DatetimeRunItemView')
        currentSubview = DatetimeRunItemView
      else if  (prototypeName == 'IdRunItemView')
        currentSubview = IdRunItemView
      else if  (prototypeName == 'LocationRunItemView')
        currentSubview = LocationRunItemView
      else if  (prototypeName == 'ConsentRunItemView')
        currentSubview = ConsentRunItemView
      else
        currentSubview =  null
        console.log(prototypeName + "  Subview is not defined.")
    @ready = true
    return currentSubview


  childViewContainer: '#subtest_wrapper',

  nextQuestion: ->
    currentSubtest = @children.findByIndex(0)

    currentQuestionView = currentSubtest.questionViews[currentSubtest.questionIndex]

    # show errors before doing anything if there are any
    return currentSubtest.showErrors(currentQuestionView) unless currentSubtest.isValid(currentQuestionView)

    # find the non-skipped questions
    isAvailable = []
    for qv, i in currentSubtest.questionViews
      isAvailable.push i if not (qv.isAutostopped or qv.isSkipped)
    isAvailable  = _.filter isAvailable, (e) => e > currentSubtest.questionIndex

    # don't go anywhere unless we have somewhere to go
    if isAvailable.length == 0
      plannedIndex = currentSubtest.questionIndex
    else
      plannedIndex = Math.min.apply(plannedIndex, isAvailable)

    if currentSubtest.questionIndex != plannedIndex
      currentSubtest.questionIndex = plannedIndex
      currentSubtest.updateQuestionVisibility()
      currentSubtest.updateProgressButtons()

  prevQuestion: ->

    currentSubtest = @children.findByIndex(0)

    currentQuestionView = currentSubtest.questionViews[currentSubtest.questionIndex]

    # show errors before doing anything if there are any
    return currentSubtest.showErrors(currentQuestionView) unless currentSubtest.isValid(currentQuestionView)

    # find the non-skipped questions
    isAvailable = []
    for qv, i in currentSubtest.questionViews
      isAvailable.push i if not (qv.isAutostopped or qv.isSkipped)
    isAvailable  = _.filter isAvailable, (e) => e < currentSubtest.questionIndex

    # don't go anywhere unless we have somewhere to go
    if isAvailable.length == 0
      plannedIndex = currentSubtest.questionIndex
    else
      plannedIndex = Math.max.apply(plannedIndex, isAvailable)

    if currentSubtest.questionIndex != plannedIndex
      currentSubtest.questionIndex = plannedIndex
      currentSubtest.updateQuestionVisibility()
      currentSubtest.updateProgressButtons()


  onBeforeRender:->
    @model.set('subtest', @frames.models[@orderMap[@index]].toJSON())

  onRender:->
    @$el.find('#progress').progressbar value : ( ( @index + 1 ) / ( @model.subtests.length + 1 ) * 100 )


  flagRender: (object) ->
    @rendered[object] = true

    if @rendered.assessment && @rendered.subtest
      @trigger "rendered"

  abort: ->
    @abortAssessment = true
    @step 1

  skip: =>
    currentView = Tangerine.progress.currentSubview
    @result.add
      name      : @currentChildView.model.get "name"
      data      : @currentChildView.getSkipped()
      subtestId : @currentChildView.model.id
      skipped   : true
      prototype : @currentChildView.model.get "prototype"
    ,
      success: =>
        @reset 1

  step: (increment) ->

    if @abortAssessment
      @saveResult( @currentChildView )
      return

    if @currentChildView.testValid?
      valid = @currentChildView.testValid()
      if valid
        @saveResult( @currentChildView, increment )
      else
        @currentChildView.showErrors()
    else
      @currentChildView.showErrors()

  next: ->
    @step 1

  back: ->
    @step -1

  toggleHelp: -> @$el.find(".enumerator_help").fadeToggle(250)

  getGridScore: ->
    link = @model.get("subtest").gridLinkId || ""
    if link == "" then return
    grid = @model.subtests.get @model.get("subtest").gridLinkId
    gridScore = @result.getGridScore grid.id
    gridScore

  gridWasAutostopped: ->
    link = @model.get("subtest").gridLinkId || ""
    if link == "" then return
    grid = @model.subtests.get @model.get("subtest").gridLinkId
    gridWasAutostopped = @result.gridWasAutostopped grid.id

  reset: (increment) ->
    @rendered.subtest = false
    @rendered.assessment = false
    @currentChildView.close();
    @index =
      if @abortAssessment == true
        @subtestViews.length-1
      else
        @index + increment
    # Reassign this view's collection.model array to contain just the current
    # subtest model.
    if (@collection.models.length > 0)
      @collection.remove(@collection.models[0].id)
    @collection.add(@frames.models[@orderMap[@index]])
    @render()
    window.scrollTo 0, 0

  saveResult: ( currentView, increment ) ->
    subtestResult = currentView.getResult()
    subtestId = currentView.model.id
    prototype = currentView.model.get "prototype"
    subtestReplace = null

    for result, i in @result.get('subtestData')
      if subtestId == result.subtestId
        subtestReplace = i

    if subtestReplace != null
      if typeof currentView.getSum != 'function'
        getSum = {correct:0,incorrect:0,missing:0,total:0}

      # Don't update the gps subtest.
      if prototype != 'gps'
        @result.insert
          name        : currentView.model.get "name"
          data        : subtestResult.body
          subtestHash : subtestResult.meta.hash
          subtestId   : currentView.model.id
          prototype   : currentView.model.get "prototype"
          sum         : getSum
      @reset increment

    else
      @result.add
        name        : currentView.model.get "name"
        data        : subtestResult.body
        subtestHash : subtestResult.meta.hash
        subtestId   : currentView.model.id
        prototype   : currentView.model.get "prototype"
        sum         : getSum
      ,
        success : =>
          @reset increment

  getSum: ->
    if @currentChildView.getSum?
      return @currentChildView.getSum()
    else
      # maybe a better fallback
      return {correct:0,incorrect:0,missing:0,total:0}

  displaySkip: (skippable)->
    if skippable
      $( ".skip" ).show();
    else
      $( ".skip" ).hide();

  displayBack: (backable)->
    if backable
      $( ".subtest-back" ).removeClass("hidden");
    else
      $( ".subtest-back" ).addClass("hidden");

  i18n: ->
    @text =
      "next" : t("SubtestRunView.button.next")
      "back" : t("SubtestRunView.button.back")
      "skip" : t("SubtestRunView.button.skip")
      "help" : t("SubtestRunView.button.help")
      "previousQuestion" : t("SurveyRunView.button.previous_question")
      "nextQuestion" : t("SurveyRunView.button.next_question")

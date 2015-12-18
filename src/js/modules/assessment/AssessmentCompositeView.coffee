#
# AssessmentCompositeView
#
# AssessmentCompositeView renders every time a new subtest is shown. When next
# or back is clicked, the reset(incrementTomoveToSubtestViewIndex) method is
# eventually called which calls render. `reset` method seems familiar because
# there is `reset` on Backbone.Collection, but this reset on a View is it's own
# thing.

AssessmentCompositeView = Backbone.Marionette.CompositeView.extend

  template: JST["AssessmentView"],

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

#    @listenTo(currentSubview, 'skipable:changed', displaySkip());
#    @listenTo(currentSubview, 'backable:changed', displayBack());

    @ready = true
    return currentSubview

#  Populate the questions in the model of the subtest.
  childViewOptions: (model, index) ->
#    console.log("fetching model.questions -  " + JSON.stringify(model))
    model.questions.fetch
      viewOptions:
        key: "question-#{model.id}"
      success: (collection) =>
#        console.log "collection: " + JSON.stringify(collection)
        model.questions.sort()
        model.collection = model.questions
        @collection.models = collection.models
      error: (model, err, cb) ->
        console.log("childViewOptions id: " +  model.id + " err:" + JSON.stringify(err))

  childViewContainer: '#subtest_wrapper',

#  collectionEvents:->
#    "backable:changed": ->
#      console.log("backable:changed")
#      @displayBack

  events:
    'click .subtest-next' : 'next'
    'click .subtest-back' : 'back'
    'click .subtest_help' : 'toggleHelp'
    'click .skip'         : 'skip'
    'click .next_question' : 'nextQuestion'
    'click .prev_question' : 'prevQuestion'


  childEvents:
    'add:child': 'addChildPostRender'

  addChildPostRender: ->
#    currentSubtest = @children.findByIndex(0)
#    currentSubtest.updateQuestionVisibility()
#    currentSubtest.updateProgressButtons()

  nextQuestion: ->
#    console.log("nextQuestion")

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

  i18n: ->
    @text =
      "next" : t("SubtestRunView.button.next")
      "back" : t("SubtestRunView.button.back")
      "skip" : t("SubtestRunView.button.skip")
      "help" : t("SubtestRunView.button.help")

  initialize: (options) ->

    @i18n()

    @on "before:render", @setChromeData

    Tangerine.progress = {}
    Tangerine.progress.index = 0
    @index = Tangerine.progress.index

    @abortAssessment = false
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
    @model.parent = @
    @model.subtests.sort()
    @model.subtests.each (model) =>
      model.parent = @
      @subtestViews.push new SubtestRunItemView
        model  : model
        parent : @

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

    col = {}
    col.models = []
    #    model = @model.subtests.models[@index]
    model = @subtestViews[@orderMap[@index]].model
#    @collection.models = [model]
    col.models.push model
    @collection = col

    ui = {}
    ui.enumeratorHelp = if (@model.get("enumeratorHelp") || "") != "" then "<button class='subtest_help command'>#{@text.help}</button><div class='enumerator_help' #{@fontStyle || ""}>#{@model.get 'enumeratorHelp'}</div>" else ""
    ui.studentDialog  = if (@model.get("studentDialog")  || "") != "" then "<div class='student_dialog' #{@fontStyle || ""}>#{@model.get 'studentDialog'}</div>" else ""
    ui.transitionComment  = if (@model.get("transitionComment")  || "") != "" then "<div class='student_dialog' #{@fontStyle || ""}>#{@model.get 'transitionComment'}</div> <br>" else ""

#    skippable = @model.get("skippable") == true || @model.get("skippable") == "true"
#    backable = ( @model.get("backButton") == true || @model.get("backButton") == "true" ) and @parent.index isnt 0

    ui.text = @text
    @model.set('ui', ui)

  setChromeData:->
    @model.set('subtest', @subtestViews[@index].model.toJSON())

  onRender:->
#    Tangerine.progress.currentSubview?.updateExecuteReady?(true)
    @$el.find('#progress').progressbar value : ( ( @index + 1 ) / ( @model.subtests.length + 1 ) * 100 )
    Tangerine.progress.currentSubview.on "rendered",    => @flagRender "subtest"
    Tangerine.progress.currentSubview.on "subRendered", => @trigger "subRendered"

    Tangerine.progress.currentSubview.on "next",    =>
      console.log("currentView next")
      @step 1
    Tangerine.progress.currentSubview.on "back",    => @step -1
#    Tangerine.progress.currentSubview.on "render:collection",    ->
#      console.log("collection rendered")
    @flagRender "assessment"

  flagRender: (object) ->
    @rendered[object] = true

    if @rendered.assessment && @rendered.subtest
      @trigger "rendered"

  afterRender: ->
    @subtestViews[@orderMap[@index]]?.afterRender?()

  onClose: ->
    for view in @subtestViews
      view.close()
    @result.clear()
    Tangerine.nav.setStudent ""

  abort: ->
    @abortAssessment = true
    @step 1

  skip: =>
    currentView = Tangerine.progress.currentSubview
    @result.add
      name      : currentView.model.get "name"
      data      : currentView.getSkipped()
      subtestId : currentView.model.id
      skipped   : true
      prototype : currentView.model.get "prototype"
    ,
      success: =>
        @reset 1

  step: (increment) ->

    if @abortAssessment
      currentView = Tangerine.progress.currentSubview
      @saveResult( currentView )
      return

    currentView = Tangerine.progress.currentSubview

    if currentView.testValid?
      valid = currentView.testValid()
#      console.log("valid: " + valid)
      if valid
#        console.log("ok to saveResult")
        @saveResult( currentView, increment )
      else
#        console.log("not valid")
        currentView.showErrors()
    else
#      console.log("no testValid")
      currentView.showErrors()

#      from SubtestRunView
  next: ->
#    console.log("next")
    #    @trigger "next"
    @step 1
#  back: -> @trigger "back"
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
    Tangerine.progress.currentSubview.close();
    @index =
      if @abortAssessment == true
        @subtestViews.length-1
      else
        @index + increment
    model = @subtestViews[@orderMap[@index]].model
    @collection.models = [model]
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
    if Tangerine.progress.currentSubview.getSum?
      return Tangerine.progress.currentSubview.getSum()
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
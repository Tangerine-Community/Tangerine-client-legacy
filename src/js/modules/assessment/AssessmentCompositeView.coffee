AssessmentCompositeView = Backbone.Marionette.CompositeView.extend
  getChildView: (model) ->

    console.log("@index: " + @index)
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
      else
        currentSubview =  null
        console.log("currentSubview is not defined.")
    model.questions.fetch
      viewOptions:
        key: "question-#{model.id}"
      success: (collection) =>
        model.questions.sort()
        model.collection = model.questions
        @collection.models = collection.models
    @ready = true
    return currentSubview

    next: ->
      console.log("childEvents next")
      @step 1

  collectionEvents:->
    "add": ->
      console.log("model added")

  childViewContainer: '#subtest_wrapper',
  template: JST["src/templates/AssessmentView.handlebars"]

  events:
    'click .subtest-next' : 'next'
    'click .subtest-back' : 'back'
    'click .subtest_help' : 'toggleHelp'
    'click .skip'         : 'skip'

  i18n: ->
    @text =
      "next" : t("SubtestRunView.button.next")
      "back" : t("SubtestRunView.button.back")
      "skip" : t("SubtestRunView.button.skip")
      "help" : t("SubtestRunView.button.help")

  initialize: (options) ->

    @i18n()

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
      @subtestViews.push new SubtestRunView
        model  : model
        parent : @

    col = {}
    col.models = []
    model = @model.subtests.models[@index]
    col.models.push model
    @collection = col

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

    ui = {}
#    ui.enumeratorHelp = if (@model.get("enumeratorHelp") || "") != "" then "<button class='subtest_help command'>#{@text.help}</button><div class='enumerator_help' #{@fontStyle || ""}>#{@model.get 'enumeratorHelp'}</div>" else ""
    ui.studentDialog  = if (@model.get("studentDialog")  || "") != "" then "<div class='student_dialog' #{@fontStyle || ""}>#{@model.get 'studentDialog'}</div>" else ""
    ui.transitionComment  = if (@model.get("transitionComment")  || "") != "" then "<div class='student_dialog' #{@fontStyle || ""}>#{@model.get 'transitionComment'}</div> <br>" else ""

    skippable = @model.get("skippable") == true || @model.get("skippable") == "true"
    backable = ( @model.get("backButton") == true || @model.get("backButton") == "true" ) and @parent.index isnt 0

    ui.skipButton = "<button class='skip navigation'>#{@text.skip}</button>" if skippable
    ui.backButton = "<button class='subtest-back navigation'>#{@text.back}</button>" if backable
    ui.text = @text
    @model.set('ui', ui)

  onRender:->
    @$el.find('#progress').progressbar value : ( ( @index + 1 ) / ( @model.subtests.length + 1 ) * 100 )

    Tangerine.progress.currentSubview.on "rendered",    => @flagRender "subtest"
    Tangerine.progress.currentSubview.on "subRendered", => @trigger "subRendered"

    Tangerine.progress.currentSubview.on "next",    =>
      console.log("currentView next")
      @step 1
    Tangerine.progress.currentSubview.on "back",    => @step -1
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
#    if currentView.isValid()
    @saveResult( currentView, increment )
#    else
#      currentView.showErrors()

#      from SubtestRunView

  next: ->
    console.log("next")
    #    @trigger "next"
    @step 1
  back: -> @trigger "back"
  toggleHelp: -> @$el.find(".enumerator_help").fadeToggle(250)

  gridWasAutostopped: ->
    link = @model.get("gridLinkId") || ""
    if link == "" then return
    grid = @parent.model.subtests.get @model.get("gridLinkId")
    gridWasAutostopped = @parent.result.gridWasAutostopped grid.id

  reset: (increment) ->
    @rendered.subtest = false
    @rendered.assessment = false
    Tangerine.progress.currentSubview.close();
    @index =
      if @abortAssessment == true
        @subtestViews.length-1
      else
        @index + increment
    model = @subtestViews[@index].model
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
# Don't update the gps subtest.
      if prototype != 'gps'
        @result.insert
          name        : currentView.model.get "name"
          data        : subtestResult.body
          subtestHash : subtestResult.meta.hash
          subtestId   : currentView.model.id
          prototype   : currentView.model.get "prototype"
          sum         : currentView.getSum()
      @reset increment

    else
      @result.add
        name        : currentView.model.get "name"
        data        : subtestResult.body
        subtestHash : subtestResult.meta.hash
        subtestId   : currentView.model.id
        prototype   : currentView.model.get "prototype"
        sum         : currentView.getSum()
      ,
        success : =>
          @reset increment

  getSum: ->
    if Tangerine.progress.currentSubview.getSum?
      return Tangerine.progress.currentSubview.getSum()
    else
# maybe a better fallback
      return {correct:0,incorrect:0,missing:0,total:0}

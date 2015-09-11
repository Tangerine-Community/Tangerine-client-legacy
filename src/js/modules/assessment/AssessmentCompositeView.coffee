AssessmentCompositeView = Backbone.Marionette.CompositeView.extend
#  childView: SubtestRunItemView,
  getChildView: (model) ->

    collection = model.collection
    currentModel = @model.subtests.models[@index]
    currentModel.questions     = new Questions()
    #    @collection = @questions

    # @questions.db.view = "questionsBySubtestId" Bring this back when prototypes make sense again
    currentModel.questions.fetch
      viewOptions:
        key: "question-#{currentModel.id}"
      success: (collection) =>
        currentModel.questions.sort()
#        if currentModel.questions.models?
#          currentModel.questions.models.forEach (question, i) ->
#            question.parent = @
        prototypeName = currentModel.get('prototype').titleize() + "RunItemView"
    currentSubview =  SubtestRunItemView
    if  (prototypeName = 'SurveyRunItemView')
      currentSubview = SurveyRunItemView
    else
      currentSubview =  SubtestRunItemView
    Tangerine.progress.currentSubview = currentSubview
    @ready = true
    return currentSubview
  ,
  attachHtml: (collectionView, childView, index) ->
#    collectionView.$("#subtest_wrapper").append(childView.el);
    if (collectionView.isBuffering)
      collectionView._bufferedChildren.splice(index, 0, childView);
    else
      if (!collectionView._insertBefore(childView, index))
        collectionView._insertAfter(childView);

#  childViewOptions: (model, index)->
#      foo: "bar",
#      childIndex: index

#  childViewEventPrefix: "childView:happen"
  childEvents: ->
    render: ->
      console.log("childEvents render")
    next: ->
      console.log("childEvents next")
      @step 1

  childViewContainer: '#subtest_wrapper',
  template: JST["src/templates/AssessmentView.handlebars"]

  events:
    'click .subtest-next' : 'next'
    'click .subtest-back' : 'back'
    'click .subtest_help' : 'toggleHelp'
    'click .skip'         : 'skip'

#  el:'content'

#  this.on "childView:happen:next", ->
#    console.log("currentView next")
#    @step 1

#    Tangerine.progress.currentSubview.on "rendered",    => @flagRender "subtest"
#    Tangerine.progress.currentSubview.on "subRendered", => @trigger "subRendered"
#
#    Tangerine.progress.currentSubview.on "next",    =>
#      console.log("currentView next")
#      @step 1
#    Tangerine.progress.currentSubview.on "back",    => @step -1
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
#    @index = Tangerine.progress.index
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
#    @model.subtests.models.sort()
    @model.subtests.each (model) =>
#    @model.subtests.models.each (model) =>
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

    ui = {}
    ui.enumeratorHelp = if (@model.get("enumeratorHelp") || "") != "" then "<button class='subtest_help command'>#{@text.help}</button><div class='enumerator_help' #{@fontStyle || ""}>#{@model.get 'enumeratorHelp'}</div>" else ""
    ui.studentDialog  = if (@model.get("studentDialog")  || "") != "" then "<div class='student_dialog' #{@fontStyle || ""}>#{@model.get 'studentDialog'}</div>" else ""
    ui.transitionComment  = if (@model.get("transitionComment")  || "") != "" then "<div class='student_dialog' #{@fontStyle || ""}>#{@model.get 'transitionComment'}</div> <br>" else ""

    skippable = @model.get("skippable") == true || @model.get("skippable") == "true"
    backable = ( @model.get("backButton") == true || @model.get("backButton") == "true" ) and @parent.index isnt 0

    ui.skipButton = "<button class='skip navigation'>#{@text.skip}</button>" if skippable
    ui.backButton = "<button class='subtest-back navigation'>#{@text.back}</button>" if backable
    ui.text = @text
    @model.set('ui', ui)

#  onRender:->
##      currentView = @subtestViews[@orderMap[@index]]
##      console.log("currentView: " + currentView)
#    Tangerine.progress.currentSubview.on "rendered",    => @flagRender "subtest"
#    Tangerine.progress.currentSubview.on "subRendered", => @trigger "subRendered"
#
#    Tangerine.progress.currentSubview.on "next",    =>
#      console.log("currentView next")
#      @step 1
#    Tangerine.progress.currentSubview.on "back",    => @step -1

  next: ->
    console.log("next")
    @trigger "next"
  back: -> @trigger "back"
  toggleHelp: -> @$el.find(".enumerator_help").fadeToggle(250)

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

#      from SubtestRunView

  gridWasAutostopped: ->
    link = @model.get("gridLinkId") || ""
    if link == "" then return
    grid = @parent.model.subtests.get @model.get("gridLinkId")
    gridWasAutostopped = @parent.result.gridWasAutostopped grid.id



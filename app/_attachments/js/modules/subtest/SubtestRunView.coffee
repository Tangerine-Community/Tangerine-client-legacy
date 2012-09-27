class SubtestRunView extends Backbone.View
  
  events:
    'click .next'         : 'next'
    'click .subtest_help' : 'toggleHelp'
    'click .skip'         : 'skip'

  toggleHelp: -> @$el.find(".enumerator_help").fadeToggle(250)

  initialize: (options) ->
    @protoViews  = Tangerine.config.prototypeViews
    @model       = options.model
    @parent      = options.parent

    @prototypeRendered = false

  render: ->
      
    enumeratorHelp = if (@model.get("enumeratorHelp") || "") != "" then "<button class='subtest_help command'>help</button><div class='enumerator_help'>#{@model.get 'enumeratorHelp'}</div>" else ""
    studentDialog  = if (@model.get("studentDialog")  || "") != "" then "<div class='student_dialog'>#{@model.get 'studentDialog'}</div>" else ""
    skipButton = "<button class='skip navigation'>Skip</button>"
    skippable = @model.get("skippable") == true || @model.get("skippable") == "true"

    @$el.html "
      <h2>#{@model.get 'name'}</h2>
      #{enumeratorHelp}
      #{studentDialog}
      <div id='prototype_wrapper'></div>
      <div class='controlls'>
        <button class='next navigation'>Next</button>#{if skippable then skipButton else "" }
      </div>
    "
  
    # Use prototype specific views here
    @prototypeView = new window[@protoViews[@model.get 'prototype']['run']]
      model: @model
      parent: @
    @prototypeView.on "rendered",    => @trigger "rendered"
    @prototypeView.on "subRendered", => @trigger "subRendered"
    @prototypeView.on "showNext",    => @showNext()
    @prototypeView.on "hideNext",    => @hideNext()
    @prototypeView.setElement(@$el.find('#prototype_wrapper'))
    @prototypeView.render()
    @prototypeRendered = true

    @trigger "rendered"

  showNext: => @$el.find(".controlls").show() 
  hideNext: => @$el.find(".controlls").hide()


  getGridScore: ->
    link = @model.get("gridLinkId") || ""
    if link == "" then return
    grid = @parent.model.subtests.get @model.get("gridLinkId")
    gridScore = @parent.result.getGridScore grid.id
    gridScore

  gridWasAutostopped: ->
    link = @model.get("gridLinkId") || ""
    if link == "" then return
    grid = @parent.model.subtests.get @model.get("gridLinkId")
    gridWasAutostopped = @parent.result.gridWasAutostopped grid.id    

  onClose: ->
    @prototypeView?.close?()

  isValid: ->
    if not @prototypeRendered then return false
    if @prototypeView.isValid?
      return @prototypeView.isValid()
    else
      return false
    true

  showErrors: ->
    @prototypeView.showErrors()

  getSum: ->
    if @prototypeView.getSum?
      return @prototypeView.getSum()
    else
      # maybe a better fallback
      return {correct:0,incorrect:0,missing:0,total:0}

  abort: ->
    @parent.abort()

  getResult: ->
    return @prototypeView.getResult()

  getSkipped: ->
    if @prototypeView.getSkipped?
      return @prototypeView.getSkipped()
    else
      throw "Prototype skipping not implemented"

  next: ->
    @parent.next()
  
  skip: ->
    @parent.skip()

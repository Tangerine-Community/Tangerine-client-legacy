class KlassSubtestRunView extends Backbone.View

  events:
    'click .done'         : 'done'
    'click .cancel'       : 'cancel'

    'click .subtest_help' : 'toggleHelp'

  toggleHelp: -> @$el.find(".enumerator_help").fadeToggle(250)

  initialize: (options) ->
    @protoViews  = Tangerine.config.prototypeViews
    @prototypeRendered = false

    @result = new KlassResult
      resultBucket : options.subtest.get("resultBucket")
      reportType   : options.subtest.get("reportType")
      studentId    : options.student.id
      subtestId    : options.subtest.id
      part         : options.subtest.get("part")
      klassId      : options.student.get("klassId")

  render: ->

    enumeratorHelp = if (@options.subtest.get("enumeratorHelp") || "") != "" then "<button class='subtest_help command'>help</button><div class='enumerator_help'>#{@options.subtest.get 'enumeratorHelp'}</div>" else ""
    studentDialog  = if (@options.subtest.get("studentDialog")  || "") != "" then "<div class='student_dialog'>#{@options.subtest.get 'studentDialog'}</div>" else ""

    @$el.html "
      <h2>#{@options.subtest.get 'name'}</h2>
      #{enumeratorHelp}
      #{studentDialog}
    "

    # Use prototype specific views here
    @prototypeView = new window[@protoViews[@options.subtest.get 'prototype']['run']]
      model: @options.subtest
      parent: @
    @prototypeView.on "rendered", @onPrototypeRendered
    @prototypeView.render()
    @$el.append @prototypeView.el
    @prototypeRendered = true

    @$el.append "<button class='done navigation'>Done</button> <button class='cancel navigation'>Cancel</button>"

    @trigger "rendered"

  onPrototypeRendered: =>
    @trigger "rendered"

  onClose: ->
    @prototypeView?.close?()

  isValid: ->
    if not @prototypeRendered then return false
    if @prototypeView.isValid?
      return @prototypeView.isValid()
    else
      return false
    true

  getResult: ->
    result = @prototypeView.getResult()
    return result

  getSkipped: ->
    if @prototypeView.getSkipped?
      return @prototypeView.getSkipped()
    else
      throw "Prototype skipping not implemented"

  cancel: ->
    Tangerine.router.navigate "class/#{@options.student.get('klassId')}/#{@options.subtest.get('part')}", true

  done: ->
    if @isValid()
      @result.add(@getResult())
      Tangerine.router.navigate "class/#{@options.student.get('klassId')}/#{@options.subtest.get('part')}", true
    else
      @prototypeView.showErrors()
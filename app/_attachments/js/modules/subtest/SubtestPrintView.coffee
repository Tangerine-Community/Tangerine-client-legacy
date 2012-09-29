class SubtestPrintView extends Backbone.View

  initialize: (options) ->
    @protoViews  = Tangerine.config.prototypeViews
    @model       = options.model
    @parent      = options.parent

    @prototypeRendered = false

  render: ->
      
    enumeratorHelp = if (@model.get("enumeratorHelp") || "") != "" then "<div class='enumerator_help_print'>#{@model.get 'enumeratorHelp'}</div>" else ""
    studentDialog  = if (@model.get("studentDialog")  || "") != "" then "<div class='student_dialog_print'>#{@model.get 'studentDialog'}</div>" else ""
    skipButton = "<button class='skip navigation'>Skip</button>"
    skippable = @model.get("skippable") == true || @model.get("skippable") == "true"

    @$el.html "
      <h2>#{@model.get 'name'}</h2>
      Enumerator Help:<br/>
      #{enumeratorHelp}
      Student Dialog:<br/>
      #{studentDialog}
      <div id='prototype_wrapper'></div>
      <hr/>
    "
  
    # Use prototype specific views here
    @prototypeView = new window[@model.get('prototype').humanize() + 'PrintView']
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

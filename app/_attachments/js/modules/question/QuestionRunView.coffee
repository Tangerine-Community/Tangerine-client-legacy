class QuestionRunView extends Backbone.View

  className: "question buttonset"

  events:
    'change input'           : 'update'
    'change textarea'        : 'update'
    'click .autoscroll_icon' : 'scroll'


  scroll: (event) ->
    @trigger "scroll", event, @model.get("order")

  initialize: (options) ->
    @model = options.model
    @parent = options.parent
    console.log @parent.model.get("fontFamily")
    @fontStyle = "style=\"font-family: #{@parent.model.get('fontFamily')} !important;\"" if @parent.model.get("fontFamily") != "" 

    @answer   = {}
    @name     = @model.escape("name").replace /[^A-Za-z0-9_]/g, "-"
    @type     = @model.get "type"
    @options  = @model.get "options"
    @notAsked = options.notAsked
    @isObservation = options.isObservation

    @defineSpecialCaseResults()

    if @model.getBoolean("skippable")
      @isValid = true
      @skipped = true
    else
      @isValid = false
      @skipped = false
    
    if @notAsked == true
      @isValid = true
      @updateResult()
    
  update: (event) ->
    @updateResult()
    @updateValidity()
    @trigger "answer", event, @model.get("order")

  updateResult: ->
    if @type == "open"
      if @notAsked == true
        @answer = "not_asked"
      else
        @answer = @$el.find("##{@cid}_#{@name}").val()
    else if @type == "single"
      if @notAsked == true
        @answer = "not_asked"
      else
        @answer = @$el.find(".#{@cid}_#{@name}:checked").val()
    else if @type == "multiple"
      if @notAsked == true
        for option, i in @options
          @answer[@options[i].value] = "not_asked"
      else
        for option, i in @options
          @answer[@options[i].value] = if @$el.find("##{@cid}_#{@name}_#{i}").is(":checked") then "checked" else "unchecked"
    @$el.attr "data-result", if _.isString(@answer) then @answer else JSON.stringify(@answer)

  updateValidity: ->

    isSkippable    = @model.getBoolean("skippable")
    isAutostopped  = @$el.hasClass("disabled_autostop")
    isLogicSkipped = @$el.hasClass("disabled_skipped")

    # have we or can we be skipped?
    if isSkippable or ( isLogicSkipped or isAutostopped )
      # YES, ok, I guess we're valid
      @isValid = true
      @skipped = if _.isEmpty(@answer) then true else false
    else
      # NO, some kind of validation must occur now
      customValidationCode = @model.get("customValidationCode")

      if not _.isEmpty(customValidationCode)
        try
          @isValid = CoffeeScript.eval.apply(@, [customValidationCode])
        catch e
          alert "Custom Validation error\n\n#{e}"
      else
        @isValid = if _.isEmpty(@answer) then false else true


  setMessage: (message) =>
    @$el.find(".error_message").html message

  render: ->

    @$el.attr "id", "question-#{@name}"

    if not @notAsked

      html = "<div class='error_message'></div><div class='prompt' #{@fontStyle || ""}>#{@model.get 'prompt'}</div>
      <div class='hint' #{@fontStyle || ""}>#{(@model.get('hint') || "")}</div>"

      if @type == "open"
        if @model.get("multiline")
          html += "<div><textarea id='#{@cid}_#{@name}' data-cid='#{@cid}'></textarea></div>"
        else
          html += "<div><input id='#{@cid}_#{@name}' data-cid='#{@cid}'></div>"
      
      else
        checkOrRadio = if @type == "multiple" then "checkbox" else "radio"
        for option, i in @options
          html += "
            <label for='#{@cid}_#{@name}_#{i}' #{@fontStyle || ""}>#{option.label}</label>
            <input id='#{@cid}_#{@name}_#{i}' class='#{@cid}_#{@name}' data-cid='#{@cid}' name='#{@name}' value='#{option.value}' type='#{checkOrRadio}'>
          "
      html += "<img src='images/icon_scroll.png' class='icon autoscroll_icon' data-cid='#{@cid}'>" if @isObservation
      @$el.html html

    else
      @$el.hide()

    @trigger "rendered"
  
  defineSpecialCaseResults: ->
    list = ["missing", "notAsked", "skipped", "logicSkipped", "notAskedAutostop"]
    for element in list
      if @type == "single" || @type == "open"
        @[element+"Result"] = element
      if @type == "multiple"
        @[element+"Result"] = {}
        @[element+"Result"][@options[i].value] = element for option, i in @options
    return





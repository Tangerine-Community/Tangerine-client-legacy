class QuestionRunView extends Backbone.View

  className: "question buttonset"

  events:
    'change input'           : 'update'
    'change textarea'        : 'update'
    'click .autoscroll_icon' : 'scroll'

  scroll: (event) ->
    @trigger "scroll", event, @model.get("order")

  initialize: (options) ->
    @on "show", => @onShow()
    @model = options.model
    @parent = options.parent
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

  previousAnswer: =>
    @parent.questionViews[@parent.questionIndex-1].answer if @parent.questionIndex >= 0

  onShow: =>

    showCode = @model.getString("displayCode")

    return if _.isEmptyString(showCode)

    try
      CoffeeScript.eval.apply(@, [showCode])
    catch error
      name = ((/function (.{1,})\(/).exec(error.constructor.toString())[1])
      message = error.message
      alert "Display code error\n\n#{name}\n\n#{message}"


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


  updateValidity: ->

    isSkippable    = @model.getBoolean("skippable")
    isAutostopped  = @$el.hasClass("disabled_autostop")
    isLogicSkipped = @$el.hasClass("disabled_skipped")

    # have we or can we be skipped?
    if isSkippable or ( isLogicSkipped or isAutostopped )
      # YES, ok, I guess we're valid
      @isValid = true
      @skipped = if _.isEmptyString(@answer) then true else false
    else
      # NO, some kind of validation must occur now
      customValidationCode = @model.get("customValidationCode")

      if not _.isEmptyString(customValidationCode)
        try
          @isValid = CoffeeScript.eval.apply(@, [customValidationCode])
        catch e
          alert "Custom Validation error\n\n#{e}"
      else
        if @type == "open"
          @isValid = if _.isEmptyString(@answer) then false else true # don't use isEmpty here
        else if @type == "multiple"
          @isValid = if ~_.values(@answer).indexOf("checked") then true else false
        else if @type == "single"
          @isValid = if _.isEmptyString(@answer) then false else true
          

  setOptions: (options) =>
    @options = options
    @render()

  setAnswer: (answer) =>
    alert "setAnswer Error\nTried to set #{@type} type #{@name} question to string answer." if _.isString(answer) && @type == "multiple"
    alert "setAnswer Error\n#{@name} question requires an object" if not _.isObject(answer) && @type == "multiple"
    
    if @type == "mulitple"
      @answer = $.extend(@answer, answer)
    else
      @answer = answer
    @updateValidity()
    @render()

  setMessage: (message) =>
    @$el.find(".error_message").html message

  setPrompt: (prompt) =>
    @$el.find(".prompt").html prompt

  setHint: (hint) =>
    @$el.find(".hint").html hint

  render: ->

    @$el.attr "id", "question-#{@name}"

    if not @notAsked

      html = "<div class='error_message'></div><div class='prompt' #{@fontStyle || ""}>#{@model.get 'prompt'}</div>
      <div class='hint' #{@fontStyle || ""}>#{(@model.get('hint') || "")}</div>"

      if @type == "open"
        if _.isString(@answer) && not _.isEmpty(@answer)
          answerValue = @answer
        if @model.get("multiline")
          html += "<div><textarea id='#{@cid}_#{@name}' data-cid='#{@cid}' value='#{answerValue || ''}'></textarea></div>"
        else
          html += "<div><input id='#{@cid}_#{@name}' data-cid='#{@cid}' value='#{answerValue || ''}'></div>"
      
      else
        checkOrRadio = if @type == "multiple" then "checkbox" else "radio"
        for option, i in @options
          selected = 
            if @type == "multiple" && @answer[@options[i].value] == "checked"
              "checked='checked'"
            else if @type == "single" && @answer == @options[i].value
              "checked='checked'"
            else 
              ""

          html += "
            <label for='#{@cid}_#{@name}_#{i}' #{@fontStyle || ""}>#{option.label}</label>
            <input id='#{@cid}_#{@name}_#{i}' class='#{@cid}_#{@name}' data-cid='#{@cid}' name='#{@name}' value='#{option.value}' type='#{checkOrRadio}' #{selected}>
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


class SurveyReviewView extends Backbone.View

  className: "QuestionReviewView"

  initialize: (options) ->
    @views = options.views

  render: ->

    answers = ("
      <div class='label_value'>
        <h3></h3>
      </div>

    " for view in @views).join("")

    @$el.html "

      <h2>Please review your answers and press next when ready.</h2>

      #{answers}
    "

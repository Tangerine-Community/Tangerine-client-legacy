class QuestionRunView extends Backbone.View

  className: "question buttonset"

  events:
    'change input'    : 'update'
    'change textarea' : 'update'

  initialize: (options) ->
    @model = options.model
    @answer = {}
    @name    = @model.escape("name").replace /[^A-Za-z0-9]/g, "-"
    @type    = @model.get "type"
    @options = @model.get "options"
    @notAsked = options.notAsked

    if @model.get("skippable") == "true" || @model.get("skippable") == true
      @isValid = true
    else
      @isValid = false
    
    if @notAsked == true
      @isValid = true
      @updateResult()
    
  update: ->
    @updateResult()
    @updateValidity()

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
    if @model.get("skippable") is true or $("#question-#{@name}").hasClass("disabled_skipped")
      @isValid = true
    else
      if _.isEmpty(@answer)
        @isValid = false
      else
        @isValid = true
    
  setMessage: (message) =>
    @$el.find(".error_message").html message


  render: ->

    @$el.attr "id", "question-#{@name}"

    if not @notAsked
      html = "<div class='error_message'></div><div class='prompt'>#{@model.get 'prompt'}</div>
      <div class='hint'>#{(@model.get('hint') || "")}</div>"

      if @type == "open"
        if @model.get("multiline")
          html += "<div><textarea id='#{@cid}_#{@name}'></textarea></div>"
        else
          html += "<div><input id='#{@cid}_#{@name}'></div>"
        @$el.html html

      else
        checkOrRadio = if @type == "multiple" then "checkbox" else "radio"
        for option, i in @options
          html += "
            <label for='#{@cid}_#{@name}_#{i}'>#{option.label}</label>
            <input id='#{@cid}_#{@name}_#{i}' class='#{@cid}_#{@name}' name='#{@name}' value='#{option.value}' type='#{checkOrRadio}'>
          "
        @$el.html html

    else
      @$el.hide()

    @trigger "rendered"




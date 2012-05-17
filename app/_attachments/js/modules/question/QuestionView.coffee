class QuestionView extends Backbone.View

  className: "question"
  events:
    'change input'    : 'update'
    'change textarea' : 'update'

  initialize: (options) ->
    @model = options.model
    @result = {}
    @name    = @model.get "name"
    @type    = @model.get "type"
    @options = @model.get "options"

    if @model.get("skippable") == "true" || @model.get("skippable") == true
      @isValid = true
    else
      @isValid = false
  update: ->
    @updateResult()
    @updateValidity()

  updateResult: ->
    if @type == "open"
      @result[@name] = @$el.find("##{@cid}_#{@name}").val()
    else
      inputs = @$el.find("textarea, input:radio")
      for input, i in inputs
        $input = $(input)
        @result[@options[i].value] = if $input.is(":checked") then "checked" else "unchecked"

  updateValidity: ->
    console.log @model.get("skippable") + " for " + @name
    if @model.get("skippable") == "true" || @model.get("skippable") == true
      @isValid = true
    else
      @isValid = false if _.values(@result).indexOf("checked") < @options.length
      @isValid = true

  setMessage: (message) =>
    @$el.find(".error_message").html message

  render: ->

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
          <label for='#{@name}_#{i}'>#{option.label}</label>
          <input id='#{@name}_#{i}' name='#{@name}' value='#{option.value}' type='#{checkOrRadio}'>
        "
      @$el.html html
      @$el.buttonset()

    @trigger "rendered"




class QuestionPrintView extends Backbone.View

  className: "question buttonset"

  initialize: (options) ->
    @model = options.model

    @answer   = {}
    @name     = @model.escape("name").replace /[^A-Za-z0-9_]/g, "-"
    @type     = @model.get "type"
    @options  = @model.get "options"
    @notAsked = options.notAsked
    @isObservation = options.isObservation


    if @model.get("skippable") == "true" || @model.get("skippable") == true
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

  render: ->

    @$el.attr "id", "question-#{@name}"

    if not @notAsked

      html = "<div class='error_message'></div><div class='prompt'>#{@model.get 'prompt'}</div>
      <div class='hint'>#{(@model.get('hint') || "")}</div>"

      if @type == "open"
        if @model.get("multiline")
          html += "<div><textarea id='#{@cid}_#{@name}' data-cid='#{@cid}'></textarea></div>"
        else
          html += "<div><input id='#{@cid}_#{@name}' data-cid='#{@cid}'></div>"
      
      else
        checkOrRadio = if @type == "multiple" then "checkbox" else "radio"
        for option, i in @options
          html += "
            <label for='#{@cid}_#{@name}_#{i}'>#{option.label}</label>
            <input id='#{@cid}_#{@name}_#{i}' class='#{@cid}_#{@name}'  data-cid='#{@cid}' name='#{@name}' value='#{option.value}' type='#{checkOrRadio}'>
          "
      html += "<img src='images/icon_scroll.png' class='icon autoscroll_icon' data-cid='#{@cid}'>" if @isObservation
      @$el.html html

    else
      @$el.hide()


    @trigger "rendered"
  

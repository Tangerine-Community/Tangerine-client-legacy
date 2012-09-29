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

      @$el.html "
        Prompt: #{@model.get 'prompt'}<br/>
        Variable Name: #{@model.get 'name'}<br/>
        Hint: #{@model.get 'hint'}<br/>
        Type: #{@model.get 'type'}<br/>
        Options:<br/>
        #{_.map(@model.get('options'), (option) ->
          "Label: #{option.label}, Value: #{option.value}"
        ).join("<br/>")
        }<br/>
      "



    else
      @$el.hide()


    @trigger "rendered"
  

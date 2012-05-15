class QuestionView extends Backbone.View

  className: "question"

  initialize: (options) ->
    @model = options.model

  render: ->
    name    = @model.get "name"
    type    = @model.get "type"
    options = @model.get "options"
    
    checkOrRadio = if type == "multiple" then "checkbox" else "radio"
    
    @$el.html "<div class='prompt'>#{@model.get 'prompt'}</div>
    <div class='hint'>#{(@model.get('hint') || "")}</div>"
    
    if type == "open"
      @$el.append "<textarea id='#{name}' name='#{name}'></textarea>"
    else
      for option, i in options
        @$el.append "<label for='#{name}_#{i}'>#{option.label}</label><input id='#{name}_#{i}' name='#{name}' value='#{option.value}' type='#{checkOrRadio}'>"
        @$el.buttonset()

    @trigger "rendered"




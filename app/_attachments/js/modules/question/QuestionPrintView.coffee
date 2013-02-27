class QuestionPrintView extends Backbone.View

#  className: "question buttonset"

  initialize: (options) ->
    @model = options.model

    @answer   = {}
    @name     = @model.escape("name").replace /[^A-Za-z0-9_]/g, "-"
    @type     = @model.get "type"
    @options  = @model.get "options"
    @notAsked = options.notAsked
    @isObservation = options.isObservation
    @parent = options.parent


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

    unless @notAsked

      if @parent.format is "stimuli"
        @$el.html "
          <div class='stimuli-question'>#{@model.get 'prompt'}</div>
        "

      if @parent.format is "backup"
        @$el.html "
          <div class='backup-question'>
            <p>
              #{@model.get 'prompt'}
              #{ if @model.get('hint') isnt "" then "(#{@model.get 'hint'})" else ""}
            </p>
            <table>
            #{
              if @model.get('type') is "open"
                "<tr>
                  <td class='print-question-label'></td> 
                  <td>
                    <div class='free-text'></div>
                  </td>
                </tr>"
              else
                _.map(@model.get('options'), (option) =>
                  spanClass = "print-question-option"
                  markingArea = "<div class='checkbox'></div>"
                  "
                    <tr>
                      <td class='print-question-label'><span class='#{spanClass}'>#{option.label}<span></td> 
                      <td>#{markingArea}</td>
                    </tr>
                  "
                ).join("")
            }
            </table>
          </div>
        "

      if @parent.format is "content"

        @$el.html "
          <table class='print-content question-attributes'>
            #{
              _("prompt, name, hint, type, skipLogic, skippable, customValidationCode, customValidationMessage".split(/, */)).map( (attribute) =>
                "
                  <tr>
                    <td class='question-attribute'>#{attribute.underscore().titleize()}</td>
                    <td>#{@model.get attribute}</td>
                  </tr>
                "
              ).join("")
            }
            <tr>
              <td>Options</td>
              <td>
                <!-- Hail Flying Spaghetti Monster, Please forgive me for my nested table -->
                <table class='print-content question-options'>
                  <tbody>
                    <tr>
                      <td>Label</td>
                      <td>Value</td>
                    </tr>
                    #{
                      _.map(@model.get('options'), (option) ->
                        "
                          <tr>
                            <td>#{option.label}</td>
                            <td>#{option.value}</td>
                          </tr>
                        "
                      ).join("")
                    }
                  </tbody>
                </table>
              </td>
            </tr>
          </table>
        "

    else
      @$el.hide()


    @trigger "rendered"
  

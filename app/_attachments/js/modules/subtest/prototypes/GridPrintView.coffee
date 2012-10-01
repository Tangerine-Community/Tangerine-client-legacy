class GridPrintView extends Backbone.View

  initialize: (options) ->
    @model         = @options.model
    @parent        = @options.parent

  className: "grid_prototype"

  render: ->
    fields = "autostop
    captureAfterSeconds
    captureItemAtTime
    columns
    endOfLine
    fontSize
    layoutMode
    order
    randomize
    timer
    variableName"

    fields = fields.split(/\ +/)

    @$el.html "
      Properties:<br/>
      <table>
      #{
        _.map(fields, (field) =>
          "<tr><td>#{field}</td><td>#{@model.get field}</td></tr>"
        ).join("")
      }
      </table>
      Items:<br/>
      #{
        _.map(@model.get("items"), (item) ->
          item
        ).join(", ")
      }
    "

    @trigger "rendered"
    

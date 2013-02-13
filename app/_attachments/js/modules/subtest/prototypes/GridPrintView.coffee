class GridPrintView extends Backbone.View

  className: "grid_prototype"

  initialize: (options) ->
    @model         = @options.model
    @parent        = @options.parent

  render: ->
    switch @format
      when "content" then @renderContent()
      when "stimuli" then @renderStimuli()
      when "backup"  then @renderBackup()
    @parent.trigger "rendered", @

  
  renderStimuli: ->
    @$el.html "
      <div id='#{@model.get "_id"}' class='print-page'>
        <table>
          <tr>
            #{
              index = 0
              _.map(@model.get("items"), (item) =>
                index += 1
                itemText = "<td class='item'>#{item}</td>"
                if index % @model.get("columns") is 0 and index isnt @model.get("items").length then itemText += "</tr><tr>" else ""
                itemText
              ).join("")
            }
          </tr>
        </table>
      </div>
    "

    _.delay =>
      overflow = 100
      while $("##{@model.get "_id"}")[0].scrollWidth > $("##{@model.get "_id"} table").innerWidth() and  $("##{@model.get "_id"}")[0].scrollHeight > $("##{@model.get "_id"} table").innerHeight()
        break if (overflow-=1) is 0
        console.log $("##{@model.get "_id"}")[0].scrollWidth
        console.log $("##{@model.get "_id"} table").innerWidth()
        currentSize = $("##{@model.get "_id"} td").css("font-size")
        $("##{@model.get "_id"} td").css("font-size", "#{parseInt(currentSize)+5}px")
        # More hackiness
        $("#navigation").hide()
        $("#footer").hide()
      currentSize = $("##{@model.get "_id"} td").css("font-size")
      $("##{@model.get "_id"} td").css("font-size", "#{parseInt(currentSize)-10}px")
    ,1000

  renderContent: ->
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
    

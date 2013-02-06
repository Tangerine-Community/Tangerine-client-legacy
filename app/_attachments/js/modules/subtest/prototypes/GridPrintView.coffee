class GridPrintView extends Backbone.View

  initialize: (options) ->
    @model         = @options.model
    @parent        = @options.parent

  className: "grid_prototype"

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
                if index % @model.get("columns") is 0 then itemText += "</tr><tr>" else ""
                itemText
              ).join("")
            }
          </tr>
        </table>
      </div>
    "
    console.log @$el
    overflow = 100
    while @$el.find("##{@model.get "_id"}")[0].scrollWidth > @$el.find("##{@model.get "_id"} table").innerWidth() and  @$el.find("##{@model.get "_id"}")[0].scrollHeight > @$el.find("##{@model.get "_id"} table").innerHeight()
      break if (overflow-=1) is 0
      console.log @$el.find("##{@model.get "_id"}")[0].scrollWidth
      console.log @$el.find("##{@model.get "_id"} table").innerWidth()
      currentSize = @$el.find("##{@model.get "_id"} td").css("font-size")
      @$el.find("##{@model.get "_id"} td").css("font-size", "#{parseInt(currentSize)+5}px")
      # More hackiness
      @$el.find("#navigation").hide()
      @$el.find("#footer").hide()
    currentSize = @$el.find("##{@model.get "_id"} td").css("font-size")
    @$el.find("##{@model.get "_id"} td").css("font-size", "#{parseInt(currentSize)-10}px")

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
    

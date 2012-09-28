class GridPrintView extends Backbone.View

  className: "grid_prototype"

  render: ->
    @$el.html "asdasd"
    
    return "FPP"
    done = 0

    startTimerHTML = "<div class='timer_wrapper'><button class='start_time time'>Start</button><div class='timer'>#{@timer}</div></div>"

    disabling = if @untimed then "" else "disabled"

    html = if not @untimed then startTimerHTML else ""
    
    gridHTML = ""
    
    if @layoutMode == "fixed"
      gridHTML += "<table class='grid #{disabling}'>"
      firstRow = true
      loop
        break if done > @items.length
        gridHTML += "<tr>"
        for i in [1..@columns]
          if done < @items.length
            gridHTML += @gridElement { label : _.escape(@items[@itemMap[done]]), i: done+1 }
          done++
        # don't show the skip row button for the first row
        if firstRow
          gridHTML += "<td></td>" if done < ( @items.length + 1 ) && @endOfLine
          firstRow = false
        else
          gridHTML += @endOfGridLine({i:done}) if done < ( @items.length + 1 ) && @endOfLine

        gridHTML += "</tr>"
      gridHTML += "</table>"
    else
      gridHTML += "<div class='grid #{disabling}'>"
      for item, i in @items
        gridHTML += @variableGridElement
          "label" : _.escape(@items[@itemMap[i]])
          "i"     : i+1
      gridHTML += "</div>"
    html += gridHTML
    stopTimerHTML = "<div class='timer_wrapper'><button class='stop_time time'>Stop</button><div class='timer'>#{@timer}</div></div>"

    resetButton = "
    <div>
      <button class='restart command'>Restart</button>
      <br>
    </div>"


    #
    # Mode selector
    #

    modeSelector = ""
    # if any other option is avaialbe other than mark, then show the selector
    if @captureLastAttempted || @captureItemAtTime

      minuteItemButton =  ""
      if @captureItemAtTime
        minuteItemButton = "
          <label for='minute_item'>Item at #{@captureAfterSeconds} seconds</label>
          <input class='grid_mode' name='grid_mode' id='minute_item' type='radio' value='minuteItem'>
        "

      captureLastButton = ""
      if @captureLastAttempted
        captureLastButton = "
          <label for='last_attempted'>Last attempted</label>
          <input class='grid_mode' name='grid_mode' id='last_attempted' type='radio' value='last'>
        "


      modeSelector = "
        <div id='grid_mode' class='question buttonset clearfix'>
          <label>Input mode</label><br>
          <label for='mark'>Mark</label>
          <input class='grid_mode' name='grid_mode' id='mark' type='radio' value='mark'>
          #{minuteItemButton}
          #{captureLastButton}
        </div>
      "


    html += "
      #{if not @untimed then stopTimerHTML else ""}
      #{if not @untimed then resetButton else ""}
      #{modeSelector}
    "

    @$el.html html

    @trigger "rendered"
    

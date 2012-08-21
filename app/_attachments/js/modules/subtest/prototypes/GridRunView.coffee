class GridRunView extends Backbone.View

  className: "grid_prototype"

  events: if Tangerine.settings.context == "mobile" then {
    'touchstart .grid_element' : 'gridClick'
    'touchstart .end_of_grid_line' : 'endOfGridLineClick'
    'click .grid_mode'   : 'updateMode'
    'click .start_time'  : 'startTimer'
    'click .stop_time'   : 'stopTimer'
    'click .restart'     : 'restartTimer'
  } else {
    'click .end_of_grid_line' : 'endOfGridLineClick'
    'click .grid_element'     : 'gridClick'
    'click .grid_mode'        : 'updateMode'
    'click .start_time'       : 'startTimer'
    'click .stop_time'        : 'stopTimer'
    'click .restart'          : 'restartTimer'
  }
  
  restartTimer: ->
    @resetVariables()
    @$el.find(".element_wrong").removeClass "element_wrong"

  gridClick: (event) =>
    @modeHandlers[@mode]?(event)

  markHandler: (event) =>
    $target = $(event.target)
    index = $target.attr('data-index')
    if @lastAttempted != 0 && index > @lastAttempted
      return
    @markElement(index)
    if @autostop != 0
      @checkAutostop()
      
  checkAutostop: ->
    if @timeRunning
      autoCount = 0
      for i in [0..@autostop-1]
        if @gridOutput[i] == "correct" then break
        autoCount++
      if @autostopped == false
        if autoCount == @autostop then @autostopTest()
      if @autostopped == true && autoCount < @autostop && @undoable == true then @unAutostopTest()

  markElement: (index, value = null) ->
    $target = @$el.find("div.grid_element[data-index=#{index}]")
    @markRecord.push index
    if value == null
      @gridOutput[index-1] = if (@gridOutput[index-1] == "correct" || @autostopped) then "incorrect" else "correct"
      $target.toggleClass "element_wrong"
    else
      if !@autostopped || value == "correct"
        @gridOutput[index-1] = value
        if value == "incorrect"
          $target.addClass "element_wrong"
        else if value == "correct"
          $target.removeClass "element_wrong"
        
  endOfGridLineClick: (event) ->
    if @mode == "mark"
      $target = $(event.target)
      if $target.hasClass("element_wrong") 
        $target.removeClass "element_wrong" 
        value = "correct"
        index = $target.attr('data-index')
        for i in [index..(index-(@columns-1))]
          @markElement i, value
      else if !$target.hasClass("element_wrong") && !@autostopped
        $target.addClass "element_wrong"
        value = "incorrect"
        index = $target.attr('data-index')
        for i in [index..(index-(@columns-1))]
          @markElement i, value
      if @autostop != 0
        @checkAutostop()

  lastHandler: (event) =>
    $target = $(event.target)
    index = $target.attr('data-index')
    if index - 1 >= @gridOutput.lastIndexOf("incorrect")
      @$el.find("table.grid .element_last").removeClass "element_last"
      $target.addClass "element_last"
      @lastAttempted = index

  startTimer: ->
    if @timerStopped == false && @timeRunning == false
      @updateMode null, "mark"
      @interval = setInterval( @updateCountdown,1000 )
      @startTime = @getTime()
      @timeRunning = true
      @enableGrid()
      @updateCountdown()

  enableGrid: ->
    @$el.find("table.disabled").removeClass("disabled")

  stopTimer: (event, message = false) ->
    if @timeRunning == true
      Utils.flash()
      clearInterval @interval
      @stopTime = @getTime()
      @timeRunning = false
      @timerStopped = true
      @updateCountdown()
      @updateMode null, "last" if @captureLastAttempted
      if message
        Utils.topAlert message
      else
        Utils.midAlert "Please mark <br>last item attempted" if @captureLastAttempted

  autostopTest: ->
    Utils.flash()
    clearInterval @interval
    @stopTime = @getTime()
    @autostopped = true
    @timerStopped = true
    @timeRunning = false
    @$el.find(".grid_element").slice(@autostop-1,@autostop).addClass "element_last" #jquery is weird sometimes
    @lastAttempted = @autostop
    @timeout = setTimeout(@removeUndo, 3000) # give them 3 seconds to undo
    Utils.topAlert "Autostop activated. Discontinue test."

  removeUndo: =>
    @undoable = false
    @updateMode null, "disabled"
    clearTimeout(@timeout)

  unAutostopTest: ->
    @interval = setInterval(@updateCountdown,1000 )
    @updateCountdown()
    @autostopped = false
    @lastAttempted = 0
    @$el.find(".grid_element").slice(@autostop-1,@autostop).removeClass "element_last"
    @timeRunning = true
    @updateMode null, "mark"
    Utils.topAlert "Autostop removed. Continue."

  updateCountdown: =>
    @timeElapsed = @getTime() - @startTime
    @timeRemaining = @timer - @timeElapsed
    
    @$el.find(".timer").html @timeRemaining
    if @timeRemaining <= 0 && @timeRunning == true && @captureLastAttempted then @stopTimer null, "Time<br><br>Please mark<br>last item attempted"

  updateMode: (event, mode = null) =>
    if mode?
      @mode = mode
      @$el.find("#grid_mode :radio[value=#{mode}]").attr("checked", "checked")
      @$el.find("#grid_mode").buttonset("refresh").click @updateMode
      return
    @mode = $(event.target).val() unless @autostopped

  getTime: ->
    Math.round((new Date()).getTime() / 1000)

  resetVariables: ->

    @markRecord = []

    @timerStopped = false

    @startTime = 0
    @stopTime  = 0
    @timeElapsed = 0
    @timeRemaining = @timer
    @lastAttempted = 0

    @interval = null

    @undoable = true

    @timeRunning = false

    @timer    = parseInt(@model.get("timer")) || 0
    @untimed  = @timer == 0

    @items    = _.compact(@model.get("items")) # mild sanitization, happens at save too

    @itemMap = []
    @mapItem = []
    
    if @model.has("randomize") && @model.get("randomize")
      for item, i in @items
        @itemMap[i] = i
      for item, i in @items
        temp = Math.floor(Math.random() * @items.length)
        tempValue = @itemMap[temp]
        @itemMap[temp] = @itemMap[i]
        @itemMap[i] = tempValue

      for item, i in @itemMap
        @mapItem[@itemMap[i]] = i
    else
      for item, i in @items
        @itemMap[i] = i
        @mapItem[i] = i

    @mode     = if @untimed then "mark" else "disabled"


    @gridOutput = []
    for item, i in @items
      @gridOutput[i] = 'correct'
    @columns  = parseInt(@model.get("columns")) || 3
    
    @autostop = if @untimed then 0 else (parseInt(@model.get("autostop")) || 0)
    @autostopped = false

    @$el.find(".grid_element").removeClass("element_wrong").removeClass("element_last").addClass("disabled")
    @$el.find("table").addClass("disabled")
    
    @$el.find(".timer").html @timer
    
    @updateMode( null, @mode )

  initialize: (options) ->


    @captureLastAttempted = if @model.has("captureLastAttempted") then @model.get("captureLastAttempted") else true
    @endOfLine            = if @model.has("endOfLine")            then @model.get("endOfLine")            else true

    @totalTime = @model.get("timer") || 0

    @modeHandlers =
      mark : @markHandler
      last : @lastHandler
      disabled : $.noop

    @model  = @options.model
    @parent = @options.parent

    @resetVariables()

    @gridElement = _.template "<td><div data-label='{{label}}' data-index='{{i}}' class='grid_element'>{{label}}</div></td>"
    @endOfGridLine = _.template "<td><div data-index='{{i}}' class='end_of_grid_line'>*</div></td>"

  render: ->
    done = 0

    startTimerHTML = "<div class='timer_wrapper'><button class='start_time time'>Start</button><div class='timer'>#{@timer}</div></div>"

    disabling = if @untimed then "" else "disabled"

    html = "
    #{if not @untimed then startTimerHTML else ""}
    <table class='grid #{disabling}'>"
    loop
      break if done > @items.length
      html += "<tr>"
      for i in [1..@columns]
        if done < @items.length
          html += @gridElement { label : _.escape(@items[@itemMap[done]]), i: done+1 }
        done++
      html += @endOfGridLine({i:done}) if done < ( @items.length + 1 ) && @endOfLine
      html += "</tr>"
    html += "</table>"
    
    stopTimerHTML = "<div class='timer_wrapper'><button class='stop_time time'>Stop</button><div class='timer'>#{@timer}</div></div>"

    resetButton = "
    <div>
      <button class='restart command'>Restart</button>
      <br>
    </div>"

    modeSelector = "
    <div id='grid_mode' class='question buttonset clearfix'>
      <label>Input mode</label><br>
      <label for='mark'>Mark</label>
      <input class='grid_mode' name='grid_mode' id='mark' type='radio' value='mark' checked='checked'>
      <label for='last_attempted'>Last attempted</label>
      <input class='grid_mode' name='grid_mode' id='last_attempted' type='radio' value='last'>
    </div>
    "

    html += "
      #{if not @untimed then stopTimerHTML else ""}
      #{if not @untimed then resetButton else ""}
      #{if @captureLastAttempted then modeSelector else ""}
    "

    @$el.html html

    @trigger "rendered"
    
  isValid: ->
    if @captureLastAttempted && @lastAttempted == 0 then return false
    # might need to let it know if it's timed or untimed too ::shrug::
    if @timeRunning == true then return false
    true
    
  showErrors: ->
    if @captureLastAttempted && @lastAttempted == 0
      Utils.midAlert "Please touch<br>last item read."
      @updateMode null, "last"
    Utils.midAlert "Time still running." if @timeRuning == true
  
  getResult: ->
    completeResults = []
    itemResults = []
    @lastAttempted = @items.length if not @captureLastAttempted

    for item, i in @items
      
      if @mapItem[i] < @lastAttempted
        itemResults[i] =
          itemResult : @gridOutput[@mapItem[i]]
          itemLabel  : item
      else
        itemResults[i] =
          itemResult : "missing"
          itemLabel : @items[@mapItem[i]]

    @lastAttempted = false if not @captureLastAttempted

    result =
      "capture_last_attempted" : @captureLastAttempted
      "auto_stop"     : @autostopped
      "attempted"     : @lastAttempted
      "items"         : itemResults
      "time_remain"   : @timeRemaining
      "mark_record"   : @markRecord
      "variable_name" : @model.get("variableName")

  getSkippedResult: ->
    return "skipped"

  onClose: ->
    clearInterval(@interval)

  getSum: ->
    counts =
      correct   : 0
      incorrect : 0
      missing   : @items.length - @lastAttempted
      total     : @items.length

    for i in @gridOutput
      counts['correct']   += 1 if i == "correct"
      counts['incorrect'] += 1 if i == "incorrect"
      
    return {
      correct   : counts['correct']
      incorrect : counts['incorrect']
      missing   : counts['missing']
      total     : counts['total']
    }


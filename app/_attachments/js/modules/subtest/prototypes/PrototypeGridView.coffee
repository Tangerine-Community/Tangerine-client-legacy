class PrototypeGridView extends Backbone.View

  className: "grid_prototype"

  events: if Tangerine.context.kindle then  {
    'touchstart .grid_element' : 'gridClick'
    'touchstart .end_of_grid_line' : 'endOfGridLineClick'
    'click .grid_mode input'   : 'updateMode'
    'click .start_time'        : 'startTimer'
    'click .stop_time'         : 'stopTimer'
  } else {
    'click .end_of_grid_line' : 'endOfGridLineClick'
    'click .grid_element'    : 'gridClick'
    'click .grid_mode input' : 'updateMode'
    'click .start_time'      : 'startTimer'
    'click .stop_time'       : 'stopTimer'
    
  }
  
  gridClick: (event) ->
    @modeHandlers[@mode](event)

  markHandler: (event) =>
    $target = $(event.target)
    index = $target.attr('data-index')
    if @lastAttempted != 0 && index > @lastAttempted
      return
    @markElement(index)
    if @autostop != 0
      @checkAutostop()
      
  checkAutostop: ->
    autoCount = 0
    for i in [0..@autostop-1]
      if @gridOutput[i] == "correct" then break
      autoCount++
    if @autostopped == false
      if autoCount == @autostop then @autostopTest()
    if @autostopped == true && autoCount < @autostop && @undoable == true then @unAutostopTest()

  markElement: (index, value = null) ->
    $target = @$el.find("div[data-index=#{index}]")
    @markRecord.push index
    if value == null
      @gridOutput[index-1] = if (@gridOutput[index-1] == "correct") then "incorrect" else "correct"
      $target.toggleClass "element_wrong"
    else
      @gridOutput[index-1] = value
      if value == "incorrect"
        $target.addClass "element_wrong"
      else if value == "correct"
        $target.removeClass "element_wrong"
        
  endOfGridLineClick: (event) ->
    if @mode == "mark"
      if $(event.target).hasClass("element_wrong")
        value = "correct"
      else
        value = "incorrect"
      index = $(event.target).attr('data-index')
      for i in [index..(index-10)]
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
    @updateMode null, "mark"
    @interval = setInterval(@updateCountdown,1000 )
    @startTime = @getTime()
    @timeRunning = true
    @$el.find("table.disabled").removeClass("disabled")
    @updateCountdown()

  stopTimer: (event, message = false) ->
    if @timeRunning == true
      clearInterval @interval
      @stopTime = @getTime()
      @timeRunning = false
      @updateCountdown()
      @updateMode null, "last"
      if message
        Utils.topAlert message
      else
        Utils.topAlert "Please mark <br>last item attempted"

  autostopTest: ->
    clearInterval @interval
    @stopTime = @getTime()
    @autostopped = true
    @timeRunning = false
    @$el.find(".grid_element").slice(@autostop-1,@autostop).addClass "element_last" #jquery is weird sometimes
    @lastAttempted = @autostop
    @timeout = setTimeout(@removeUndo, 7000) # give them 7 seconds to undo
    Utils.topAlert "Autostop activated. Discontinue test."

  removeUndo: =>
    @undoable = false
    clearTimeout(@timeout)

  unAutostopTest: ->
    @interval = setInterval(@updateCountdown,1000 )
    @updateCountdown()
    @autostopped = false
    @lastAttempted = 0
    @$el.find(".grid_element").slice(@autostop-1,@autostop).removeClass "element_last"
    @timeRunning = false
    @updateMode null, "mark"
    Utils.topAlert "Autostop removed. Continue."

  updateCountdown: =>
    @elapsedTime = @getTime() - @startTime
    @timeRemaining = @timer - @elapsedTime
    @$el.find(".timer").html @timeRemaining
    if @timeRemaining == 0 && @timeRunning == true then @stopTimer null, "Time<br><br>Please mark<br>last item attempted"
      
  getTime: ->
    Math.round((new Date()).getTime() / 1000)

  updateMode: (event, mode) =>
    if mode?
      @mode = mode
      @$el.find("#grid_mode :radio[value=#{mode}]").attr("checked", "checked")
      @$el.find("#grid_mode").buttonset("refresh").click @updateMode
      return
    @mode = $(event.target).val()

  initialize: (options) ->
    @markRecord = []


    @modeHandlers =
      mark : @markHandler
      last : @lastHandler
      disabled : $.noop

    @model  = @options.model
    @parent = @options.parent

    @startTime = 0
    @stopTime  = 0
    @timeElapsed = 0
    @lastAttempted = 0

    @interval = null

    @undoable = true

    @timer    = @model.get("timer") || 0
    @items    = _.compact(@model.get("items")) # mild sanitization, happens at save too
    @mode     = "disabled"
    @gridOutput = []
    for item, i in @items
      @gridOutput[i] = 'correct'
    @columns  = @model.get("columns") || 0

    @autostop = parseInt(@model.get("autostop")) || 0
    @autostopped = false

    @gridElement = _.template "<td><div data-label='{{label}}' data-index='{{i}}' class='grid_element'>{{label}}</div></td>"
    @endOfGridLine = _.template "<td><div data-index='{{i}}' class='end_of_grid_line'>*</div></td>"
  render: ->
    done = 0
    html = "
    
    <div class='timer_wrapper'><button class='start_time time'>Start</button><div class='timer'>#{@timer}</div></div>
    <table class='grid disabled'>"
    loop
      break if done > @items.length
      html += "<tr>"
      for i in [1..@columns]
        if done < @items.length
          html += @gridElement { label : @items[done], i: done+1 }
        done++
      html += @endOfGridLine({i:done})+"</tr>"
    html += "</table>
    
    <div class='timer_wrapper'><button class='stop_time time'>Stop</button><div class='timer'>#{@timer}</div></div>

    
    <div id='grid_mode' class='question clearfix'>
      <label>Input mode</label>
      <label for='mark'>Mark</label>
      <input name='grid_mode' id='mark' type='radio' value='mark' checked='checked'>
      <label for='last_attempted'>Last attempted</label>
      <input name='grid_mode' id='last_attempted' type='radio' value='last'>
    </div>
    "

    @$el.html html

    @$el.find("#grid_mode").buttonset()

    @trigger "rendered"
    
  isValid: ->
    if @lastAttempted == 0 then return false
    if @timeRunning == true then return false
    true
    
  showErrors: ->
    Utils.midAlert "Please select<br>last item attempted." if @lastAttempted == 0
    Utils.midAlert "Time still running." if @timeRuning == true
  
  getResult: ->
    letterResults = {}
    for item, i in @items
      if i < (@lastAttempted)
        letterResults[item] = @gridOutput[i]
      else
        letterResults[item] = "missing"

    result =
      "autostopped" : @autostopped
      "last_attempted" : @lastAttempted
      "letters_results" : letterResults
      "time_remaining" : @timeRemaining
      "time_elapsed" : @timeElapsed
      "mark_record" : @markRecord

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

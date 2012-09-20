class ObservationRunView extends Backbone.View


  events:
    "click .start_time" : "startObservations"
    "click .stop_time"  : "stopObservations"
    "click .done" : "completeObservation"

  @FORCE = 1

  initialize: (options) ->
    @model  = @options.model
    @parent = @options.parent

    @warningSeconds = 5

    @initializeFlags()
    @initializeSurvey()
    @initializeEventHandlers()

  initializeSurvey: ->
    @onClose() if @survey? # if we're REinitializing close the old views first
    
    attributes = $.extend(@model.get('surveyAttributes'), { "_id" : @model.id })
    
    # makes an array of identical models based on the above attributes
    models = (new Backbone.Model attributes for i in [1..parseInt(@model.get('totalSeconds')/@model.get('intervalLength'))])
    
    @survey =
      "models"    : models
      "results"   : []

  initializeFlags: ->
    @iAm =
      "counting" : false
      "recording" : false
    @iHavent =
      "warned" : true
    @iHave =
      "runOnce" : false
      "finished" : false
    @my =
      "time" :
        "start"   : 0
        "elapsed" : 0
      "observation" :
        "index"     : 0
        "oldIndex"  : 0
        "completed" : 0
        "total"     : parseInt( @model.get('totalSeconds') / @model.get('intervalLength') )

  initializeEventHandlers: ->
    @on "tick", @checkIfOver
    @on "tick", @updateObservationIndex
    @on "tick", @updateProgressDisplay
    @on "tick", @checkSurveyDisplay
    @on "tick", @checkObservationPace
    @on "tick", @checkWarning

  startObservations: ->
    # don't respond for these reasons
    if @iAm.counting || @iHave.runOnce then return

    @$el.find(".stop_button_wrapper, .next_display, .completed_display").removeClass("confirmation")
    @$el.find(".start_button_wrapper").addClass("confirmation")
    @timerInterval   = setInterval @tick, 1000
    @iAm.counting    = true
    @my.time.start   = @getTime()
    @my.time.elapsed = 0

  stopObservations: (e) ->
    isntPrematureStop = ! e?
    if isntPrematureStop && !@iHave.finished
      @renderSurvey()
    else
      Utils.midAlert "Observations finished"
      
    @$el.find(".next_display").addClass("confirmation")
    @iHave.finished = true
    @iHave.runOnce = true
    
    clearInterval @timerInterval

  # runs every second the timer is running
  tick: =>
    @my.time.elapsed = @getTime() - @my.time.start
    @trigger "tick"

  checkObservationPace: =>
    # if we're still entering observations and it's time for the next one
    if @iAm.recording && @my.observation.completed < (@my.observation.index-1) && @my.observation.index > 1 # starts at 0, then goes to 1
      @iHave.forcedProgression = true
      @completeObservation @FORCE

  checkWarning: =>
    projectedIndex = Math.floor( (@my.time.elapsed + @warningSeconds) / @model.get('intervalLength') )
    iShouldWarn = @my.observation.index < projectedIndex && ! @iHave.finished
    # if we're still entering observations, warn the user
    if @iAm.recording && @iHavent.warned && iShouldWarn && @my.observation.index != 0 # first one doesn't count
      Utils.midAlert "Observation ending soon"
      @iHavent.warned = false

  checkIfOver: =>
    if @my.time.elapsed >= @model.get("totalSeconds")
      @stopObservations()

  checkSurveyDisplay: =>
    # change, needs to display new survey
    if @my.observation.oldIndex != @my.observation.index && !@iHave.finished
      @renderSurvey()
      @my.observation.oldIndex = @my.observation.index

  updateObservationIndex: =>
    @my.observation.index = Math.floor( ( @my.time.elapsed ) / @model.get('intervalLength') )
    if @my.observation.index > @survey.models.length - 1
      @my.observation.index = @survey.models.length - 1

  updateProgressDisplay: ->
    # backbone.js, y u no have data bindings? abstract more
    @$el.find(".current_observation").html @my.observation.index
    @$el.find(".completed_count").html     @my.observation.completed

    timeTillNext = ((@my.observation.index + 1) * @model.get('intervalLength')) - @my.time.elapsed
    @$el.find(".time_till_next").html timeTillNext

    if not (@iAm.recording && @iHave.finished)
      @$el.find(".next_display, .completed_display").removeClass "confirmation" 

  resetObservationFlags: ->
    @iAm.recording  = false
    @iHavent.warned = true

  getTime: -> parseInt( ( new Date() ).getTime() / 1000 )

  completeObservation: (option) ->
    if @survey.view.isValid() || option == @FORCE
      @resetObservationFlags()
      @my.observation.completed++
      @survey.results.push
        observationNumber : @survey.view.index # view's index
        data              : @survey.view.getResult()
        saveTime          : @my.time.elapsed
      @survey.view.close()
      if option == @FORCE && !@iHave.finished
        @renderSurvey()

    else
      @survey.view.showErrors()

    @trigger "tick" # update displays

  render: ->
    totalSeconds = @model.get("totalSeconds")

    @$el.html "
      <div class='timer_wrapper'>
        <div class='progress clearfix'>
          <span class='completed_display confirmation'>Completed <div class='info_box completed_count'>#{@my.observation.completed}</div></span>
          <span class='next_display confirmation'>Next observation <div class='info_box time_till_next'>#{@model.get('intervalLength')}</div></span>
        </div>
        <div>
          <div class='start_button_wrapper'><button class='start_time command'>Start</button></div>
          <div class='stop_button_wrapper confirmation'><button class='stop_time command'>Finish all observations</button></div>
        </div>
      </div>
      <div id='current_survey'></div>
    "

    @trigger "rendered"

  renderSurvey: (e) ->
    if not @iAm.counting then return
    @iAm.recording = true
    @survey.view  = new SurveyRunView
      "model"         : @survey.models[@my.observation.index]
      "parent"        : @
      "isObservation" : true
    @survey.view.index = @my.observation.index # add an index for reference

    # listen for render events, pass them up
    @survey.view.on "rendered", => @trigger "rendered"
    @survey.view.on "subRendered", => @trigger "subRendered"

    @survey.view.render()

    @$el.find("#current_survey").html("<span class='observation_display confirmation'>Observation <div class='info_box current_observation'>#{@my.observation.index}</div></span>")
    @$el.find("#current_survey").append @survey.view.el
    @$el.find("#current_survey").append "<button class='command done'>Done observation</button>"
    
    @$el.find("#current_survey").scrollTo 250, => 
      if @iHave.forcedProgression
        Utils.midAlert "Please continue with the next observation."
        @iHave.forcedProgression = false
      else if @iHave.finished
        Utils.midAlert "Please enter last observation"


  onClose: ->
    @survey.view?.close()

  getResult: ->
    {
      "surveys"               : @survey.results
      "variableName"          : @model.get("variableName")
      "totalTime"             : @model.get("totalTime")
      "intervalLength"        : @model.get("intervalTime")
      "completedObservations" : @my.observation.completed
    }

  getSum: ->
    {}

  isValid: ->
    @iHave.finished

  showErrors: ->
    @$el.find("messages").html @validator.getErrors().join(", ")

  updateNavigation: ->
    Tangerine.nav.setStudent @$el.find('#participant_id').val()
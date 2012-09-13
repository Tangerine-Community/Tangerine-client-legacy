class ObservationRunView extends Backbone.View


  events:
    "click .start_time" : "startObservations"
    "click .stop_time"  : "stopObservations"

  initialize: (options) ->
    @model  = @options.model
    @parent = @options.parent

    @initializeFlags()
    @initializeSurvey()
  

  initializeSurvey: ->
    @onClose() if @survey? # if we're REinitializing close the old views first
    
    attributes = $.extend(@model.get('surveyAttributes'), { "_id" : @model.id })
    
    # makes an array of identical models based on the above attributes
    models = (new Backbone.Model attributes for i in [0..parseInt(@model.get('totalSeconds')/@model.get('intervalLength'))])
    
    # makes an array of views for each model, with an index variable
    views  = (new SurveyRunView {"model"  : model,"parent" : @} for model in models)
    view.index = i for view, i in views
    
    @survey =
      "models"     : models
      "views"      : views
      "results"    : []

  initializeFlags: ->
    @iAm =
      "counting" : false
    #@iHave =
    #  "started" : false
    @my =
      "time" :
        "start"   : 0
        "elapsed" : 0
      "observation" :
        "index"     : 0
        "completed" : 0

  startObservations: ->
    @timerInterval   = setInterval @tick, 1000
    @iAm.counting    = true
    @my.time.start   = @getTime()
    @my.time.elapsed = 0

  stopObservations: ->
    clearInterval @timerInterval

  # runs every second the timer is running
  tick: ->
    @my.time.elapsed = @getTime() - @my.time.start
    @updateTimeDisplay()
    @updateObservationIndex()
  
  updateObservationIndex: ->
    @my.observation.index = Math.floor( @my.time.elapsed / @model.get('intervalLength') )

  updateTimeDisplay: ->
    @$el.find(".timer").html @my.time.elapsed

  getTime: -> return (new Date()).getSeconds

  completeObservation: ->
    current = @survey.views[@my.observation.index]
    if current.isValid()
      @survey.result.push
        observationNumber : current.index # view's index
        data              : current.getResult()
      current.close()
      @render()
      window.scrollTo 0, 0
    else
      current.showErrors()


  render: ->
    totalSeconds = @model.get("totalSeconds")
    startTimerHTML = "<div class='timer_wrapper'><button class='start_time time'>Start</button><div class='timer'>#{totalSeconds}</div></div>"
    stopTimerHTML  = "<div class='timer_wrapper'><button class='stop_time time'>Stop</button><div class='timer'>#{totalSeconds}</div></div>"

    @$el.html "
      #{startTimerHTML}
      <div id='current_survey'></div>
      #{stopTimerHTML}
    "
    
    @renderSurvey()

    @trigger "rendered"

  renderSurvey: ->
    current = @survey.views[@my.observation.index]
    current.render()
    @$el.find("#current_survey").append current.el

  onClose: ->
    for surveyView in @survey.views
      surveyView.close()

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
    true

  showErrors: ->
    @$el.find("messages").html @validator.getErrors().join(", ")

  updateNavigation: ->
    Tangerine.nav.setStudent @$el.find('#participant_id').val()
class Result extends Backbone.Model

  url: "result"
  
  # name : currentView.model.get "name"
  # data : currentView.getResult()
  # subtestId : currentView.model.id
  # sum : currentView.getSum()
  #   { correct, incorrect, missing, total }
  #   

  initialize: ( options ) ->
    # could use defaults but it messes things up
    if options.blank == true
      @set
        'subtestData' : []
        'start_time'  : (new Date()).getTime()
        'enumerator'  : Tangerine.user.name

      @unset "blank" # options automatically get added to the model. Lame.

  add: ( subtestDataElement ) ->
    subtestData = @get 'subtestData'
    subtestData['timestamp'] = (new Date()).getTime()
    subtestData.push subtestDataElement
    @save
      'subtestData' : subtestData

  getVariable: ( key ) ->
    for subtest in @get("subtestData")
      data = subtest.data
      for variable, value of data
        if variable == key
          if _.isObject(value)
            return _.compact(((name if state == "checked") for name, state of value))
          else
            return value
    return null

  getGridScore: (id) ->
    for datum in @get 'subtestData'
      return parseInt(datum.data.attempted) if datum.subtestId == id

  gridWasAutostopped: (id) ->
    for datum in @get 'subtestData'
      return datum.data.auto_stop if datum.subtestId == id

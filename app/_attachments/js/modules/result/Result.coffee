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
    @set
      subtestData : []

  add: ( subtestDataElement ) ->
    subtestData = @get 'subtestData'
    subtestData.push subtestDataElement
    @set 
      'subtestData' : subtestData
      'timestamp'   : (new Date()).getTime()
      'enumerator'  : Tangerine.user.name


  getGridScore: (id) ->
    for datum in @get 'subtestData'
      return parseInt(datum.data.last_attempted) if datum.subtestId == id

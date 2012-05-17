class Result extends Backbone.Model

  url: "result"
  
  # name : currentView.model.get "name"
  # data : currentView.getResult()
  # subtestId : currentView.model.id
  # sum : currentView.getSum()
  #   { correct, incorrect, missing, total }
  #   

  defaults:
    subtestData : []  

  initialize: ( options ) ->

  add: ( subtestDataElement ) ->
    subtestData = @get 'subtestData'
    subtestData.push subtestDataElement
    @set 'subtestData', subtestData
    @set "timestamp", (new Date()).getTime()
    @set "enumerator" : Tangerine.user.name


  getGridScore: (id) ->
    for datum in @get 'subtestData'
      return datum.data.last_attempted if datum.subtestId == id

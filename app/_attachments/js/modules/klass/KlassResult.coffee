class KlassResult extends Backbone.Model

  url : "result"

  initialize: (options) ->
    @set
      'timestamp' : (new Date()).getTime()

  add: ( subtestDataElement ) ->
    @save 
      'subtestData' : subtestDataElement

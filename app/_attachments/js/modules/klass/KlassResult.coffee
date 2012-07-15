class KlassResult extends Backbone.Model

  url : "result"

  initialize: (options) ->
    @studentId = options.studentId
    @klassId   = options.klassId
    @subtestId = options.subtestId

    @set
      'timestamp' : (new Date()).getTime()
      'studentId' : @studentId
      'subtestId' : @subtestId
      'klassId'   : @klassId

  add: ( subtestDataElement ) ->
    @save 
      'subtestData' : subtestDataElement

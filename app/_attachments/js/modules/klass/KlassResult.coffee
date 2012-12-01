class KlassResult extends Backbone.Model

  url : "result"

  add: ( subtestDataElement ) ->
    @save
      'subtestData' : subtestDataElement

  get: (options) ->

    @assertSubtestData()

    if options == "correct"     then return @gridCount "correct"
    if options == "incorrect"   then return @gridCount "incorrect"
    if options == "missing"     then return @gridCount "missing"
    if options == "total"       then return @attributes.subtestData.items.length
    
    if options == "attempted"   then return @getAttempted()
    if options == "time_remain" then return @getTimeRemain()

    # if no special properties detected let's go with super
    result = KlassResult.__super__.get.apply @, arguments
    return result

  gridCount: (value) ->
    if not @get("subtestData").items? then throw "No items"
    # count correct
    count = 0
    (count++ if item.itemResult == value) for item in @get("subtestData").items 
    return count

  getAttempted: ->
    return parseInt( @get("subtestData").attempted )

  getTimeRemain: ->
    return parseInt( @get("subtestData").time_remain )

  getCorrectPerSeconds: ( secondsAllowed ) ->
    Math.round( @get("correct") / ( secondsAllowed - @getTimeRemain() ) ) * secondsAllowed

  assertSubtestData: ->
    if not @attributes.subtestData? then throw "No subtest data."

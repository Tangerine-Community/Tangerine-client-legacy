class Result extends Backbone.Model
  url: "/result"
  
  defaults =
    assessment  : "none"
    subtestData : []
  
  initialize: ( options ) ->
    @set
      assessment  : options?.assessment  ? defaults.assessment
      subtestData : options?.subtestData ? defaults.subtestData
  
  add: ( name, data ) ->
    subtestDataElement = { "name" : name, "data" : data }
    @set 'subtestData', @get('subtestData').push subtestDataElement
    
    
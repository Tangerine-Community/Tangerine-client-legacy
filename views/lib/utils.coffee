utils = 
  
  exportValueMap :
    "correct" : 1
    "checked" : 1

    "incorrect" : "0"
    "unchecked" : "0"

    "missing"   : "."
    "not_asked" : "."
    
    "skipped"   : 999

  exportValue : ( databaseValue = "no_record" ) ->
    if utils.exportValueMap[databaseValue]?
      return utils.exportValueMap[databaseValue]
    else
      return String(databaseValue)

  # returns an object {key: value}
  pair : (key, value) ->
    if value == undefined then value = "no_record"
    o = {}
    o[key] = value
    return o

  unpair : (pair) ->
    for key, value of pair
      return [key, value]
    "object not found" # coffeescript return weirdness

  # Makes an object that descrbes a csv value
  cell : ( subtest, key, value ) ->
    if typeof subtest is "string"
      machineName = "#{subtest}-#{key}"
    else
      machineName = "#{subtest.subtestId}-#{key}"
    return {
      key : key
      value : value
      machineName : machineName
    }

if typeof(exports) == "object"
  exports.cell        = utils.cell
  exports.clone       = utils.clone
  exports.exportValue = utils.exportValue
  exports.pair        = utils.pair
  exports.unpair      = utils.unpair
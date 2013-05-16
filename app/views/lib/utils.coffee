utils = 
  clone : (item) ->
    return item unless item?
    types = [ Number, String, Boolean ]
    result = null

    # normalize
    types.forEach (type) -> result = type(item) if item instanceof type


    if typeof result == "undefined"
      if Object.prototype.toString.call( item ) == "[object Array]"
        result = []
        item.forEach (child, index, array) ->
          result[index] = Utils.clone child
      else if typeof item == "object"
        if (item.nodeType && typeof item.cloneNode == "function")
          result = item.cloneNode( true )
        else if !item.prototype
          if item instanceof Date
            result = new Date(item)
          else # Object
            result = {}
            for key, value of item
                result[key] = utils.clone value
        else
          result = if false && item.constructor then new item.constructor() else item
      else
        result = item

    return result

  exportValueMap :
    "correct" : 1
    "checked" : 1

    "incorrect" : "0"
    "unchecked" : "0"

    "missing"   : "."
    "not_asked" : "."
    
    "skipped"   : 999

  exportValue : (databaseValue="no_record") ->

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


if typeof(exports) == "object"
  exports.clone = utils.clone
  exports.exportValue = utils.exportValue
  exports.pair = utils.pair
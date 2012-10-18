(head, req) ->

  log req

  start
    "headers" : {
      "content-type": "application/json"
    }
    
  `unpair = function(pair) { for (var key in pair) {return [key, pair[key]] }} `
  dump = (obj) ->
    out = ""
    for i in obj
        out += i + ": " + obj[i] + "\n"

  columnKeys = []
  columnNames = []
  columnsBySubtest = []

  #
  # Create column headings
  #

  firstRows = []
  firstRowsCount = 0

  while row = getRow()

    for subtest, subtestIndex in row.value
      columnsBySubtest[subtestIndex] = [] if not columnsBySubtest[subtestIndex]?
      for pair in subtest
        undone = unpair(pair)
        continue if not undone?
        key   = undone[0] || ""
        value = undone[1] || ""
        if not ~columnsBySubtest[subtestIndex].indexOf(key)
          columnsBySubtest[subtestIndex].push key


  #
  # Send column headings
  #

  for subtest in columnsBySubtest
    for key in subtest
      columnKeys.push key
      columnNames.push "\"" + key + "\""

  send JSON.stringify(columnKeys)

  return
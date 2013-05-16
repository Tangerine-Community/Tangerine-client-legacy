(head, req) ->

  start
    "headers" : {
      "Content-Type": "text/csv; charset=UTF-8"
      "Content-Disposition": 
        if req.query.download == "false"
          ""
        else
          "attachment; filename=\"#{req.query.filename}.csv\""
    }

  `unpair = function(pair) { for (var key in pair) {return [key, pair[key]] }} `

  dump = (obj) ->
    out = ""
    for i in obj
        out += i + ": " + obj[i] + "\n"

  rowCache = []

  columnsBySubtest = {}

  #
  # same results to create column headings
  #
  

  #
  # Create column headings
  #

  toSample = 50
  while true

    row = getRow()
    break if not row?

    rowCache.push row

    for subtestIndex, subtestValue of row.value
      columnsBySubtest[subtestIndex] = [] if not columnsBySubtest[subtestIndex]?
      
      for pair in subtestValue

        undone = unpair(pair)
        continue if not undone?

        key   = undone[0] || ""
        value = undone[1] || ""
        if not ~columnsBySubtest[subtestIndex].indexOf(key)
          columnsBySubtest[subtestIndex].push key

    break if toSample-- == 0

  #
  # Flatten and send column headings
  #

  columnNames = []
  columnKeys  = []
  for subtestKey, subtest of columnsBySubtest
    for key in subtest
      columnKeys.push key
      columnNames.push "\"" + key + "\""
  send columnNames.join(",") + "\n"

  row = true

  #limit = 50

  while true

    #break if limit-- == 0

    if rowCache.length != 0
      row = rowCache.shift()
    else
      row = getRow()

    break if not row?

    # flatten
    oneRow = {}
    for subtestIndex, subtest of row.value
      for pair in subtest
        undone = unpair(pair)
        continue if not undone?
        key   = undone[0]
        value = undone[1]
        
        oneRow[key] = value

    # send one csv row
    csvRow = []
    for columnKey in columnKeys
      rawCell = oneRow[columnKey]
      if rawCell != undefined
        csvRow.push  '"' + String(rawCell).replace(/"/g,'”') + '"'
      else
        csvRow.push null
    send csvRow.join(",") + "\n"

  return

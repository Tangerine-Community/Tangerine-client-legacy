(head, req) ->

  start
    "headers" : {
      "content-type": "text/csv; charset=UTF-8"
      "Content-Disposition": "attachment; filename=\"#{req.query.filename}.csv\""
    }

  `unpair = function(pair) { for (var key in pair) {return [key, pair[key]] }} `

  dump = (obj) ->
    out = ""
    for i in obj
        out += i + ": " + obj[i] + "\n"

  rowCache = []

  columnsBySubtest = []

  #
  # same results to create column headings
  #
  

  #
  # Create column headings
  #

  toSample = 50
  while true

    if toSample == 48 then log row

    row = getRow()
    break if not row?

    rowCache.push row
    for subtest, subtestIndex in row.value
      columnsBySubtest[subtestIndex] = [] if not columnsBySubtest[subtestIndex]?
      for pair in subtest
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
  for subtest in columnsBySubtest
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
    for subtest, subtestIndex in row.value
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
        csvRow.push  "\"" + String(rawCell).replace(/"/g,"\"") + "\""
      else
        csvRow.push null
    send csvRow.join(",")+"\n"

  return

(head, req) ->
  log req
  start
    "headers" : {
      "content-type": "text/csv"
      "Content-Disposition": "attachment; filename=\"#{req.query.filename}.csv\""
    }
    
  `unpack = function(tuple) { for (var key in tuple) {return [key, tuple[key]] }} `
    

  columnNames = []
  columnsBySubtest = []
  rowData = []

  rowIndex = 0
  while row = getRow()
    rowData[rowIndex] = []
    for subtest, subtestIndex in row.value
      columnsBySubtest[subtestIndex] = [] if not columnsBySubtest[subtestIndex]?
      for tuple in subtest
        undone = unpack(tuple)
        continue if not undone?
        key   = undone[0] || ""
        value = undone[1] || ""
        if not ~columnsBySubtest[subtestIndex].indexOf(key)
          columnsBySubtest[subtestIndex].push key
        rowData[rowIndex][key] = value
    rowIndex++

  for subtest in columnsBySubtest
    for key in subtest
      columnNames.push key

  send columnNames.join(",") + "\n"

  for row, i in rowData
    csvRow = []
    for columnName in columnNames
      csvRow.push row[columnName]

    send csvRow.join(",")+"\n"

  return

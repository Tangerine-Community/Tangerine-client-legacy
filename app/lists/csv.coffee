(head, req) ->
  log req
  start
    "headers" : {
      "content-type": "text/csv"
      "Content-Disposition": "attachment; filename=#{req.query.filename}.csv"
    }

  columns = {}
  csvRowData = []

  while row = getRow()
    csvRowData.push(row.value)
    for key in Object.keys(row.value)
      columns[key] = true

  columnNames = for key,value of columns
    key

  send columnNames.join(",") + "\n"

  for row in csvRowData
    rowData = for columnName in columnNames
      row[columnName]
    send rowData.join(",") + "\n"
  return


(function(head, req) {
  var columnName, columnNames, columnsBySubtest, csvRow, i, key, row, rowData, rowIndex, subtest, subtestIndex, tuple, undone, value, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _ref;
  log(req);
  start({
    "headers": {
      "content-type": "text/csv",
      "Content-Disposition": "attachment; filename=\"" + req.query.filename + ".csv\""
    }
  });
  unpack = function(tuple) { for (var key in tuple) {return [key, tuple[key]] }} ;
  columnNames = [];
  columnsBySubtest = [];
  rowData = [];
  rowIndex = 0;
  while (row = getRow()) {
    rowData[rowIndex] = [];
    _ref = row.value;
    for (subtestIndex = 0, _len = _ref.length; subtestIndex < _len; subtestIndex++) {
      subtest = _ref[subtestIndex];
      if (!(columnsBySubtest[subtestIndex] != null)) {
        columnsBySubtest[subtestIndex] = [];
      }
      for (_i = 0, _len2 = subtest.length; _i < _len2; _i++) {
        tuple = subtest[_i];
        undone = unpack(tuple);
        if (!(undone != null)) continue;
        key = undone[0] || "";
        value = undone[1] || "";
        if (!~columnsBySubtest[subtestIndex].indexOf(key)) {
          columnsBySubtest[subtestIndex].push(key);
        }
        rowData[rowIndex][key] = value;
      }
    }
    rowIndex++;
  }
  for (_j = 0, _len3 = columnsBySubtest.length; _j < _len3; _j++) {
    subtest = columnsBySubtest[_j];
    for (_k = 0, _len4 = subtest.length; _k < _len4; _k++) {
      key = subtest[_k];
      columnNames.push(key);
    }
  }
  send(columnNames.join(",") + "\n");
  for (i = 0, _len5 = rowData.length; i < _len5; i++) {
    row = rowData[i];
    csvRow = [];
    for (_l = 0, _len6 = columnNames.length; _l < _len6; _l++) {
      columnName = columnNames[_l];
      csvRow.push("\"" + String(row[columnName] || "").replace(/"/g, "\"") + "\"");
    }
    send(csvRow.join(",") + "\n");
  }
});


(function(head, req) {
  var columnKey, columnKeys, columnNames, columnsBySubtest, csvRow, dump, i, key, rawCell, row, rowData, rowIndex, subtest, subtestIndex, tuple, undone, value, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _ref;
  start({
    "headers": {
      "content-type": "text/csv",
      "Content-Disposition": "attachment; filename=\"" + req.query.filename + ".csv\""
    }
  });
  unpack = function(tuple) { for (var key in tuple) {return [key, tuple[key]] }} ;
  dump = function(obj) {
    var i, out, _i, _len, _results;
    out = "";
    _results = [];
    for (_i = 0, _len = obj.length; _i < _len; _i++) {
      i = obj[_i];
      _results.push(out += i + ": " + obj[i] + "\n");
    }
    return _results;
  };
  columnKeys = [];
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
      columnKeys.push(key);
      columnNames.push("\"" + key + "\"");
    }
  }
  send(columnNames.join(",") + "\n");
  for (i = 0, _len5 = rowData.length; i < _len5; i++) {
    row = rowData[i];
    csvRow = [];
    for (_l = 0, _len6 = columnKeys.length; _l < _len6; _l++) {
      columnKey = columnKeys[_l];
      rawCell = row[columnKey];
      if (i === 1) log(rawCell);
      if (rawCell !== void 0) {
        csvRow.push("\"" + String(rawCell).replace(/"/g, "\"") + "\"");
      } else {
        csvRow.push(null);
      }
    }
    send(csvRow.join(",") + "\n");
  }
});

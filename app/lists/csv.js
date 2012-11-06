
(function(head, req) {
  var columnKey, columnKeys, columnNames, columnsBySubtest, csvRow, dump, key, oneRow, pair, rawCell, row, rowCache, subtest, subtestIndex, toSample, undone, value, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _len7, _m, _ref, _ref2;
  start({
    "headers": {
      "content-type": "text/csv; charset=UTF-8",
      "Content-Disposition": "attachment; filename=\"" + req.query.filename + ".csv\""
    }
  });
  unpair = function(pair) { for (var key in pair) {return [key, pair[key]] }} ;
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
  rowCache = [];
  columnsBySubtest = [];
  toSample = 50;
  while (true) {
    if (toSample === 48) log(row);
    row = getRow();
    if (!(row != null)) break;
    rowCache.push(row);
    _ref = row.value;
    for (subtestIndex = 0, _len = _ref.length; subtestIndex < _len; subtestIndex++) {
      subtest = _ref[subtestIndex];
      if (!(columnsBySubtest[subtestIndex] != null)) {
        columnsBySubtest[subtestIndex] = [];
      }
      for (_i = 0, _len2 = subtest.length; _i < _len2; _i++) {
        pair = subtest[_i];
        undone = unpair(pair);
        if (!(undone != null)) continue;
        key = undone[0] || "";
        value = undone[1] || "";
        if (!~columnsBySubtest[subtestIndex].indexOf(key)) {
          columnsBySubtest[subtestIndex].push(key);
        }
      }
    }
    if (toSample-- === 0) break;
  }
  columnNames = [];
  columnKeys = [];
  for (_j = 0, _len3 = columnsBySubtest.length; _j < _len3; _j++) {
    subtest = columnsBySubtest[_j];
    for (_k = 0, _len4 = subtest.length; _k < _len4; _k++) {
      key = subtest[_k];
      columnKeys.push(key);
      columnNames.push("\"" + key + "\"");
    }
  }
  send(columnNames.join(",") + "\n");
  row = true;
  while (true) {
    if (rowCache.length !== 0) {
      row = rowCache.shift();
    } else {
      row = getRow();
    }
    if (!(row != null)) break;
    oneRow = {};
    _ref2 = row.value;
    for (subtestIndex = 0, _len5 = _ref2.length; subtestIndex < _len5; subtestIndex++) {
      subtest = _ref2[subtestIndex];
      for (_l = 0, _len6 = subtest.length; _l < _len6; _l++) {
        pair = subtest[_l];
        undone = unpair(pair);
        if (!(undone != null)) continue;
        key = undone[0];
        value = undone[1];
        oneRow[key] = value;
      }
    }
    csvRow = [];
    for (_m = 0, _len7 = columnKeys.length; _m < _len7; _m++) {
      columnKey = columnKeys[_m];
      rawCell = oneRow[columnKey];
      if (rawCell !== void 0) {
        csvRow.push("\"" + String(rawCell).replace(/"/g, "\"") + "\"");
      } else {
        csvRow.push(null);
      }
    }
    send(csvRow.join(",") + "\n");
  }
});

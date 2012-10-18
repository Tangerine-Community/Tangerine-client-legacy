
(function(head, req) {
  var columnKeys, columnNames, columnsBySubtest, dump, firstRows, firstRowsCount, key, pair, row, subtest, subtestIndex, undone, value, _i, _j, _k, _len, _len2, _len3, _len4, _ref;
  log(req);
  start({
    "headers": {
      "content-type": "application/json"
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
  columnKeys = [];
  columnNames = [];
  columnsBySubtest = [];
  firstRows = [];
  firstRowsCount = 0;
  while (row = getRow()) {
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
  }
  for (_j = 0, _len3 = columnsBySubtest.length; _j < _len3; _j++) {
    subtest = columnsBySubtest[_j];
    for (_k = 0, _len4 = subtest.length; _k < _len4; _k++) {
      key = subtest[_k];
      columnKeys.push(key);
      columnNames.push("\"" + key + "\"");
    }
  }
  send(JSON.stringify(columnKeys));
});

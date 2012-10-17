
(function(doc) {
  var bySubtest, datetimeCount, datetimeSuffix, exportValue, exportValueMap, i, item, label, metaData, metaKey, metaKeys, monthData, months, observationData, observations, optionKey, optionValue, orderMap, pair, prototype, rawIndex, row, subtest, subtestIndex, surveyValue, surveyVariable, variableName, _i, _j, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _results;
  if (doc.collection === "result") {
    exportValueMap = {
      "correct": 1,
      "checked": 1,
      "incorrect": 0,
      "unchecked": 0,
      "missing": ".",
      "not_asked": ".",
      "skipped": 999
    };
    metaKeys = ["enumerator", "start_time", "order_map"];
    exportValue = function(databaseValue) {
      if (exportValueMap[databaseValue] != null) {
        return exportValueMap[databaseValue];
      } else {
        return databaseValue;
      }
    };
    pair = function(key, value) {
      var o;
      o = {};
      o[key] = value;
      return o;
    };
    metaData = [];
    for (_i = 0, _len = metaKeys.length; _i < _len; _i++) {
      metaKey = metaKeys[_i];
      if (doc[metaKey] != null) metaData.push(pair(metaKey, doc[metaKey]));
    }
    metaData.push(pair("start_time", doc['starttime'] != null ? doc['starttime'] != null : doc['start_time']));
    metaData.push(pair("order_map", doc['order_map'] != null ? doc['order_map'].join(",") : "no_record"));
    bySubtest = [metaData];
    datetimeCount = 0;
    orderMap = doc["order_map"] != null ? doc["order_map"] : (function() {
      _results = [];
      for (var _j = 0, _ref = doc.subtestData.length - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; 0 <= _ref ? _j++ : _j--){ _results.push(_j); }
      return _results;
    }).apply(this);
    for (rawIndex = 0, _ref2 = doc.subtestData.length - 1; 0 <= _ref2 ? rawIndex <= _ref2 : rawIndex >= _ref2; 0 <= _ref2 ? rawIndex++ : rawIndex--) {
      row = [];
      subtestIndex = orderMap.indexOf(rawIndex);
      subtest = doc.subtestData[subtestIndex];
      if (!(subtest != null)) continue;
      prototype = subtest.prototype;
      if (prototype === "id") {
        row.push(pair("id", subtest.data.participant_id));
      } else if (prototype === "location") {
        _ref3 = subtest.data.labels;
        for (i = 0, _len2 = _ref3.length; i < _len2; i++) {
          label = _ref3[i];
          row.push(pair(label, subtestData.data.location[i]));
        }
      } else if (prototype === "datetime") {
        months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        if (~months.indexOf(subtest.data.month.toLowerCase())) {
          monthData = months.indexOf(subtest.data.month.toLowerCase()) + 1;
        } else {
          monthData = subtest.data.month;
        }
        datetimeSuffix = datetimeCount > 0 ? "_" + datetimeCount : "";
        row.push(pair("year" + datetimeSuffix, subtest.data.year));
        row.push(pair("month" + datetimeSuffix, monthData));
        row.push(pair("date" + datetimeSuffix, subtest.data.day));
        row.push(pair("assess_time" + datetimeSuffix, subtest.data.time));
        datetimeCount++;
      } else if (prototype === "consent") {
        row.push(pair("consent", subtest.data.consent));
      } else if (prototype === "grid") {
        variableName = subtest.data.variable_name;
        row.push(pair("" + variableName + "_auto_stop", subtest.data.auto_stop));
        row.push(pair("" + variableName + "_time_remain", subtest.data.time_remain));
        row.push(pair("" + variableName + "_attempted", subtest.data.attempted));
        row.push(pair("" + variableName + "_item_at_time", subtest.data.item_at_time));
        row.push(pair("" + variableName + "_time_intermediate_captured", subtest.data.time_intermediate_captured));
        row.push(pair("" + variableName + "_correct_per_minute", subtest.sum.correct_per_minute));
        _ref4 = subtest.data.items;
        for (i = 0, _len3 = _ref4.length; i < _len3; i++) {
          item = _ref4[i];
          row.push(pair("" + variableName + (i + 1), exportValue(item.itemResult)));
        }
      } else if (prototype === "survey") {
        _ref5 = subtest.data;
        for (surveyVariable in _ref5) {
          surveyValue = _ref5[surveyVariable];
          if (surveyValue === Object(surveyValue)) {
            for (optionKey in surveyValue) {
              optionValue = surveyValue[optionKey];
              row.push(pair("" + surveyVariable + "_" + optionKey, exportValue(optionValue)));
            }
          } else {
            row.push(pair(surveyVariable, exportValue(surveyValue)));
          }
        }
      } else if (prototype === "observation") {
        _ref6 = subtest.data.surveys;
        for (i = 0, _len4 = _ref6.length; i < _len4; i++) {
          observations = _ref6[i];
          observationData = observations.data;
          for (surveyVariable in observationData) {
            surveyValue = observationData[surveyVariable];
            if (surveyValue === Object(surveyValue)) {
              for (optionKey in surveyValue) {
                optionValue = surveyValue[optionKey];
                row.push(pair("" + surveyVariable + "_" + optionKey + "_" + (i + 1), exportValue(optionValue)));
              }
            } else {
              row.push(pair("" + surveyVariable + "_" + (i + 1), exportValue(surveyValue)));
            }
          }
        }
      } else if (prototype === "complete") {
        row.push(pair("additional_comments", subtest.data.comment));
        row.push(pair("end_time", subtest.data.end_time));
        if (subtest.data.gps != null) {
          row.push(pair("gps_latitude", subtest.data.gps.latitude));
          row.push(pair("gps_longitude", subtest.data.gps.longitude));
          row.push(pair("gps_accuracy", subtest.data.gps.accuracy));
        }
      }
      bySubtest.push(row);
    }
    return emit(doc.assessmentId, bySubtest);
  }
});

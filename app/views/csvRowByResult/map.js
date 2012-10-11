
(function(doc) {
  var datetimeCount, datetimeSuffix, exportValue, exportValueMap, i, item, label, metaKey, metaKeys, monthData, months, observationData, observations, optionKey, optionValue, prototype, row, subtest, surveyValue, surveyVariable, variableName, _i, _j, _len, _len2, _len3, _len4, _len5, _ref, _ref2, _ref3, _ref4, _ref5;
  if (doc.collection === "result") {
    exportValueMap = {
      "correct": 1,
      "checked": 1,
      "incorrect": 0,
      "unchecked": 0,
      "missing": ".",
      "not_asked": "."
    };
    row = {};
    metaKeys = ["enumerator", "start_time", "order_map"];
    exportValue = function(databaseValue) {
      if (exportValueMap[databaseValue] != null) {
        return exportValueMap[databaseValue];
      } else {
        return databaseValue;
      }
    };
    for (_i = 0, _len = metaKeys.length; _i < _len; _i++) {
      metaKey = metaKeys[_i];
      if (doc[metaKey] != null) row[metaKey] = doc[metaKey];
    }
    row["start_time"] = doc['starttime'] != null ? doc['starttime'] != null : doc['start_time'];
    row["order_map"] = doc['order_map'] != null ? doc['order_map'] != null : "no_record";
    datetimeCount = 0;
    _ref = doc.subtestData;
    for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
      subtest = _ref[_j];
      prototype = subtest.prototype;
      if (prototype === "id") {
        row["id"] = subtest.data.participant_id;
      } else if (prototype === "location") {
        _ref2 = subtest.data.labels;
        for (i = 0, _len3 = _ref2.length; i < _len3; i++) {
          label = _ref2[i];
          row[label] = subtest.data.location[i];
        }
      } else if (prototype === "datetime") {
        months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        if (~months.indexOf(subtest.data.month.toLowerCase())) {
          monthData = months.indexOf(subtest.data.month.toLowerCase()) + 1;
        } else {
          monthData = subtest.data.month;
        }
        datetimeSuffix = datetimeCount > 0 ? "_" + datetimeCount : "";
        row["year" + datetimeSuffix] = subtest.data.year;
        row["month" + datetimeSuffix] = monthData;
        row["date" + datetimeSuffix] = subtest.data.day;
        row["assess_time" + datetimeSuffix] = subtest.data.time;
        datetimeCount++;
      } else if (prototype === "consent") {
        row["consent"] = subtest.data.consent;
      } else if (prototype === "grid") {
        variableName = subtest.data.variable_name;
        row["" + variableName + "_auto_stop"] = subtest.data.auto_stop;
        row["" + variableName + "_time_remain"] = subtest.data.time_remain;
        row["" + variableName + "_attempted"] = subtest.data.attempted;
        row["" + variableName + "_item_at_time"] = subtest.data.item_at_time;
        row["" + variableName + "_time_intermediate_captured"] = subtest.data.time_intermediate_captured;
        row["" + variableName + "_correct_per_minute"] = subtest.sum.correct_per_minute;
        _ref3 = subtest.data.items;
        for (i = 0, _len4 = _ref3.length; i < _len4; i++) {
          item = _ref3[i];
          row["" + variableName + (i + 1)] = exportValue(item.itemResult);
        }
      } else if (prototype === "survey") {
        _ref4 = subtest.data;
        for (surveyVariable in _ref4) {
          surveyValue = _ref4[surveyVariable];
          if (surveyValue === Object(surveyValue)) {
            for (optionKey in surveyValue) {
              optionValue = surveyValue[optionKey];
              row["" + surveyVariable + "_" + optionKey] = exportValue(optionValue);
            }
          } else {
            row["" + surveyVariable] = exportValue(surveyValue);
          }
        }
      } else if (prototype === "observation") {
        _ref5 = subtest.data.surveys;
        for (i = 0, _len5 = _ref5.length; i < _len5; i++) {
          observations = _ref5[i];
          observationData = observations.data;
          for (surveyVariable in observationData) {
            surveyValue = observationData[surveyVariable];
            if (surveyValue === Object(surveyValue)) {
              for (optionKey in surveyValue) {
                optionValue = surveyValue[optionKey];
                row["" + surveyVariable + "_" + optionKey + "_" + (i + 1)] = exportValue(optionValue);
              }
            } else {
              row["" + surveyVariable + "_" + (i + 1)] = exportValue(surveyValue);
            }
          }
        }
      } else if (prototype === "complete") {
        row["additional_comments"] = subtest.data.comment;
        row["end_time"] = subtest.data.end_time;
        if (subtest.data.gps != null) {
          row["gps_latitude"] = subtest.data.gps.latitude;
          row["gps_longitude"] = subtest.data.gps.longitude;
          row["gps_accuracy"] = subtest.data.gps.accuracy;
        }
      }
    }
    return emit(doc.assessmentId, row);
  }
});

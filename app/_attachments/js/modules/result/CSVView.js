var CSVView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

CSVView = (function(_super) {

  __extends(CSVView, _super);

  function CSVView() {
    CSVView.__super__.constructor.apply(this, arguments);
  }

  CSVView.prototype.exportValueMap = {
    "correct": 1,
    "checked": 1,
    "incorrect": 0,
    "unchecked": 0,
    "missing": ".",
    "not_asked": "."
  };

  CSVView.prototype.initialize = function(options) {
    var allResults,
      _this = this;
    this.assessmentId = Utils.cleanURL(options.assessmentId);
    allResults = new Results;
    allResults.fetch({
      key: this.assessmentId,
      success: function(collection) {
        _this.results = collection.models;
        return _this.render();
      }
    });
    return this.metaKeys = ["enumerator"];
  };

  CSVView.prototype.exportValue = function(databaseValue) {
    if (this.exportValueMap[databaseValue] != null) {
      return this.exportValueMap[databaseValue];
    } else {
      return databaseValue;
    }
  };

  CSVView.prototype.render = function() {
    var columns, count, csvFile, csvRowData, d, i, index, item, keyBucket, keyChain, label, metaKey, monthData, months, observationData, observations, optionKey, optionValue, orderMap, prototype, rawIndex, result, row, subtest, subtestIndex, subtestName, surveyValue, surveyVariable, tableHTML, variableName, _i, _j, _k, _l, _len, _len10, _len11, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _ref, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _results,
      _this = this;
    if ((this.results != null) && (this.results[0] != null)) {
      tableHTML = "";
      csvRowData = [];
      columns = [];
      keyChain = [];
      _ref = this.results;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        result = _ref[_i];
        orderMap = result.has("order_map") ? result.get("order_map") : (function() {
          _results = [];
          for (var _j = 0, _ref2 = result.attributes.subtestData.length - 1; 0 <= _ref2 ? _j <= _ref2 : _j >= _ref2; 0 <= _ref2 ? _j++ : _j--){ _results.push(_j); }
          return _results;
        }).apply(this);
        for (rawIndex = 0, _ref3 = result.attributes.subtestData.length - 1; 0 <= _ref3 ? rawIndex <= _ref3 : rawIndex >= _ref3; 0 <= _ref3 ? rawIndex++ : rawIndex--) {
          subtestIndex = orderMap.indexOf(rawIndex);
          subtest = result.attributes.subtestData[subtestIndex];
          subtestName = subtest.name.toLowerCase().dasherize();
          prototype = subtest.prototype;
          keyBucket = [];
          if (prototype === "id") {
            keyBucket.push("id");
          } else if (prototype === "datetime") {
            keyBucket.push("year", "month", "date", "assess_time");
          } else if (prototype === "location") {
            _ref4 = subtest.data.labels;
            for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
              label = _ref4[_k];
              keyBucket.push(label);
            }
          } else if (prototype === "consent") {
            keyBucket.push("consent");
          } else if (prototype === "grid") {
            variableName = subtest.data.variable_name;
            keyBucket.push("" + variableName + "_auto_stop", "" + variableName + "_time_remain", "" + variableName + "_attempted", "" + variableName + "_item_at_time", "" + variableName + "_time_intermediate_captured", "" + variableName + "_correct_per_minute");
            _ref5 = subtest.data.items;
            for (i = 0, _len3 = _ref5.length; i < _len3; i++) {
              item = _ref5[i];
              keyBucket.push("" + variableName + (i + 1));
            }
          } else if (prototype === "survey") {
            _ref6 = subtest.data;
            for (surveyVariable in _ref6) {
              surveyValue = _ref6[surveyVariable];
              if (_.isObject(surveyValue)) {
                for (optionKey in surveyValue) {
                  optionValue = surveyValue[optionKey];
                  keyBucket.push("" + surveyVariable + "_" + optionKey);
                }
              } else {
                keyBucket.push(surveyVariable);
              }
            }
          } else if (prototype === "observation") {
            _ref7 = subtest.data.surveys;
            for (i = 0, _len4 = _ref7.length; i < _len4; i++) {
              observations = _ref7[i];
              observationData = observations.data;
              for (surveyVariable in observationData) {
                surveyValue = observationData[surveyVariable];
                if (_.isObject(surveyValue)) {
                  for (optionKey in surveyValue) {
                    optionValue = surveyValue[optionKey];
                    keyBucket.push("" + surveyVariable + "_" + optionKey + "_" + (i + 1));
                  }
                } else {
                  keyBucket.push("" + surveyVariable + "_" + (i + 1));
                }
              }
            }
          } else if (prototype === "complete") {
            keyBucket.push("additional_comments", "end_time", "gps_latitude", "gps_longitude", "gps_accuracy");
          }
          if (!(keyChain[rawIndex] != null)) keyChain[rawIndex] = [];
          if (keyChain[rawIndex].length < keyBucket.length) {
            keyChain[rawIndex] = keyBucket;
          }
        }
      }
      this.metaKeys.push("start_time", "order_map");
      columns = this.metaKeys.concat(_.flatten(keyChain));
      csvRowData.push(columns);
      _ref8 = this.results;
      for (d = 0, _len5 = _ref8.length; d < _len5; d++) {
        result = _ref8[d];
        row = [];
        _ref9 = this.metaKeys;
        for (_l = 0, _len6 = _ref9.length; _l < _len6; _l++) {
          metaKey = _ref9[_l];
          if (result.attributes[metaKey] != null) {
            row.push(result.attributes[metaKey]);
          }
        }
        row[columns.indexOf("start_time")] = result.has('starttime') ? result.get('starttime') : result.get('start_time');
        row[columns.indexOf("order_map")] = result.has('order_map') ? result.get('order_map') : "no_record";
        _ref10 = result.attributes.subtestData;
        for (_m = 0, _len7 = _ref10.length; _m < _len7; _m++) {
          subtest = _ref10[_m];
          prototype = subtest.prototype;
          if (prototype === "id") {
            row[columns.indexOf("id")] = subtest.data.participant_id;
          } else if (prototype === "location") {
            _ref11 = subtest.data.labels;
            for (i = 0, _len8 = _ref11.length; i < _len8; i++) {
              label = _ref11[i];
              row[columns.indexOf(label)] = subtest.data.location[i];
            }
          } else if (prototype === "datetime") {
            months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
            if (~months.indexOf(subtest.data.month.toLowerCase())) {
              monthData = months.indexOf(subtest.data.month.toLowerCase()) + 1;
            } else {
              monthData = subtest.data.month;
            }
            row[columns.indexOf("year")] = subtest.data.year;
            row[columns.indexOf("month")] = monthData;
            row[columns.indexOf("date")] = subtest.data.day;
            row[columns.indexOf("assess_time")] = subtest.data.time;
          } else if (prototype === "consent") {
            row[columns.indexOf("consent")] = subtest.data.consent;
          } else if (prototype === "grid") {
            variableName = subtest.data.variable_name;
            row[columns.indexOf("" + variableName + "_auto_stop")] = subtest.data.auto_stop;
            row[columns.indexOf("" + variableName + "_time_remain")] = subtest.data.time_remain;
            row[columns.indexOf("" + variableName + "_attempted")] = subtest.data.attempted;
            row[columns.indexOf("" + variableName + "_item_at_time")] = subtest.data.item_at_time;
            row[columns.indexOf("" + variableName + "_time_intermediate_captured")] = subtest.data.time_intermediate_captured;
            row[columns.indexOf("" + variableName + "_correct_per_minute")] = subtest.sum.correct_per_minute;
            _ref12 = subtest.data.items;
            for (i = 0, _len9 = _ref12.length; i < _len9; i++) {
              item = _ref12[i];
              row[columns.indexOf("" + variableName + (i + 1))] = this.exportValue(item.itemResult);
            }
          } else if (prototype === "survey") {
            _ref13 = subtest.data;
            for (surveyVariable in _ref13) {
              surveyValue = _ref13[surveyVariable];
              if (_.isObject(surveyValue)) {
                for (optionKey in surveyValue) {
                  optionValue = surveyValue[optionKey];
                  row[columns.indexOf("" + surveyVariable + "_" + optionKey)] = this.exportValue(optionValue);
                }
              } else {
                row[columns.indexOf("" + surveyVariable)] = this.exportValue(surveyValue);
              }
            }
          } else if (prototype === "observation") {
            _ref14 = subtest.data.surveys;
            for (i = 0, _len10 = _ref14.length; i < _len10; i++) {
              observations = _ref14[i];
              observationData = observations.data;
              for (surveyVariable in observationData) {
                surveyValue = observationData[surveyVariable];
                if (_.isObject(surveyValue)) {
                  for (optionKey in surveyValue) {
                    optionValue = surveyValue[optionKey];
                    row[columns.indexOf("" + surveyVariable + "_" + optionKey + "_" + (i + 1))] = this.exportValue(optionValue);
                  }
                } else {
                  row[columns.indexOf("" + surveyVariable + "_" + (i + 1))] = this.exportValue(surveyValue);
                }
              }
            }
          } else if (prototype === "complete") {
            row[columns.indexOf("additional_comments")] = subtest.data.comment;
            row[columns.indexOf("end_time")] = subtest.data.end_time;
            if (subtest.data.gps != null) {
              row[columns.indexOf("gps_latitude")] = subtest.data.gps.latitude;
              row[columns.indexOf("gps_longitude")] = subtest.data.gps.longitude;
              row[columns.indexOf("gps_accuracy")] = subtest.data.gps.accuracy;
            }
          }
        }
        csvRowData.push(row);
      }
      for (i = 0, _len11 = csvRowData.length; i < _len11; i++) {
        row = csvRowData[i];
        tableHTML += "<tr>";
        count = 0;
        for (index = 0, _ref15 = row.length - 1; 0 <= _ref15 ? index <= _ref15 : index >= _ref15; 0 <= _ref15 ? index++ : index--) {
          tableHTML += "<td>" + row[index] + "</td>";
          count++;
        }
        tableHTML += "</tr>";
      }
      tableHTML = tableHTML.replace(/undefined/g, "no_record");
      this.csv = $("<table>" + tableHTML + "</table>").table2CSV({
        "delivery": "value"
      });
      csvFile = new Backbone.Model({
        "_id": "Tangerine-" + (this.assessmentId.substr(-5, 5)) + ".csv"
      });
      csvFile.url = "csv";
      csvFile.fetch({
        complete: function() {
          return csvFile.save({
            "csv": _this.csv
          }, {
            complete: function() {
              return window.open("/tangerine/_design/tangerine/_show/csv/Tangerine-" + (_this.assessmentId.substr(-5, 5)) + ".csv", "_blank");
            }
          });
        }
      });
    }
    return this.trigger("rendered");
  };

  return CSVView;

})(Backbone.View);

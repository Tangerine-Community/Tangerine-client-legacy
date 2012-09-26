var CSVView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

CSVView = (function(_super) {

  __extends(CSVView, _super);

  function CSVView() {
    CSVView.__super__.constructor.apply(this, arguments);
  }

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
    this.disallowedKeys = ["mark_record"];
    return this.metaKeys = ["enumerator", "starttime", "timestamp"];
  };

  CSVView.prototype.exportValueMap = {
    "correct": 1,
    "checked": 1,
    "incorrect": 0,
    "unchecked": 0,
    "missing": ".",
    "not_asked": "."
  };

  CSVView.prototype.exportValue = function(databaseValue) {
    if (this.exportValueMap[databaseValue] != null) {
      return this.exportValueMap[databaseValue];
    } else {
      return databaseValue;
    }
  };

  CSVView.prototype.render = function() {
    var count, csvFile, d, i, index, item, keys, label, maxIndex, maxLength, metaKey, monthData, months, observationData, observations, optionKey, optionValue, prototype, result, resultDataArray, row, subtest, subtestName, surveyValue, surveyVariable, tableHTML, values, variableName, _i, _j, _k, _l, _len, _len10, _len11, _len12, _len13, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _ref, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
      _this = this;
    if ((this.results != null) && (this.results[0] != null)) {
      tableHTML = "";
      resultDataArray = [];
      keys = [];
      _ref = this.metaKeys;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        metaKey = _ref[_i];
        keys.push(metaKey);
      }
      maxIndex = 0;
      maxLength = 0;
      _ref2 = this.results;
      for (i = 0, _len2 = _ref2.length; i < _len2; i++) {
        subtest = _ref2[i];
        if (subtest.attributes.subtestData.length > maxLength) {
          maxIndex = i;
          maxLength = subtest.attributes.subtestData.length;
        }
      }
      _ref3 = this.results[maxIndex].attributes.subtestData;
      for (_j = 0, _len3 = _ref3.length; _j < _len3; _j++) {
        subtest = _ref3[_j];
        subtestName = subtest.name.toLowerCase().dasherize();
        prototype = subtest.prototype;
        if (prototype === "id") {
          keys.push("id");
        } else if (prototype === "datetime") {
          keys.push("year", "month", "date", "assess_time");
        } else if (prototype === "location") {
          _ref4 = subtest.data.labels;
          for (_k = 0, _len4 = _ref4.length; _k < _len4; _k++) {
            label = _ref4[_k];
            keys.push(label);
          }
        } else if (prototype === "consent") {
          keys.push("consent");
        } else if (prototype === "grid") {
          variableName = subtest.data.variable_name;
          keys.push("" + variableName + "_auto_stop", "" + variableName + "_time_remain", "" + variableName + "_attempted", "" + variableName + "_item_at_time", "" + variableName + "_time_intermediate_captured", "" + variableName + "_correct_per_minute");
          _ref5 = subtest.data.items;
          for (i = 0, _len5 = _ref5.length; i < _len5; i++) {
            item = _ref5[i];
            keys.push("" + variableName + (i + 1));
          }
        } else if (prototype === "survey") {
          _ref6 = subtest.data;
          for (surveyVariable in _ref6) {
            surveyValue = _ref6[surveyVariable];
            if (_.isObject(surveyValue)) {
              for (optionKey in surveyValue) {
                optionValue = surveyValue[optionKey];
                keys.push("" + surveyVariable + "_" + optionKey);
              }
            } else {
              keys.push(surveyVariable);
            }
          }
        } else if (prototype === "observation") {
          _ref7 = subtest.data.surveys;
          for (i = 0, _len6 = _ref7.length; i < _len6; i++) {
            observations = _ref7[i];
            observationData = observations.data;
            for (surveyVariable in observationData) {
              surveyValue = observationData[surveyVariable];
              if (_.isObject(surveyValue)) {
                for (optionKey in surveyValue) {
                  optionValue = surveyValue[optionKey];
                  keys.push("" + surveyVariable + "_" + optionKey + "_" + (i + 1));
                }
              } else {
                keys.push("" + surveyVariable + "_" + (i + 1));
              }
            }
          }
        } else if (prototype === "complete") {
          keys.push("additional_comments", "end_time", "gps_latitude", "gps_longitude", "gps_accuracy");
        }
      }
      resultDataArray.push(keys);
      _ref8 = this.results;
      for (d = 0, _len7 = _ref8.length; d < _len7; d++) {
        result = _ref8[d];
        values = [];
        _ref9 = this.metaKeys;
        for (_l = 0, _len8 = _ref9.length; _l < _len8; _l++) {
          metaKey = _ref9[_l];
          values.push(result.attributes[metaKey]);
        }
        _ref10 = result.attributes.subtestData;
        for (_m = 0, _len9 = _ref10.length; _m < _len9; _m++) {
          subtest = _ref10[_m];
          prototype = subtest.prototype;
          if (prototype === "id") {
            values[keys.indexOf("id")] = subtest.data.participant_id;
          } else if (prototype === "location") {
            _ref11 = subtest.data.labels;
            for (i = 0, _len10 = _ref11.length; i < _len10; i++) {
              label = _ref11[i];
              values[keys.indexOf(label)] = subtest.data.location[i];
            }
          } else if (prototype === "datetime") {
            months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
            if (~months.indexOf(subtest.data.month.toLowerCase())) {
              monthData = months.indexOf(subtest.data.month.toLowerCase()) + 1;
            } else {
              monthData = subtest.data.month;
            }
            values[keys.indexOf("year")] = subtest.data.year;
            values[keys.indexOf("month")] = monthData;
            values[keys.indexOf("date")] = subtest.data.day;
            values[keys.indexOf("assess_time")] = subtest.data.time;
          } else if (prototype === "consent") {
            values[keys.indexOf("consent")] = subtest.data.consent;
          } else if (prototype === "grid") {
            variableName = subtest.data.variable_name;
            values[keys.indexOf("" + variableName + "_auto_stop")] = subtest.data.auto_stop;
            values[keys.indexOf("" + variableName + "_time_remain")] = subtest.data.time_remain;
            values[keys.indexOf("" + variableName + "_attempted")] = subtest.data.attempted;
            values[keys.indexOf("" + variableName + "_item_at_time")] = subtest.data.item_at_time;
            values[keys.indexOf("" + variableName + "_time_intermediate_captured")] = subtest.data.time_intermediate_captured;
            values[keys.indexOf("" + variableName + "_correct_per_minute")] = subtest.sum.correct_per_minute;
            _ref12 = subtest.data.items;
            for (i = 0, _len11 = _ref12.length; i < _len11; i++) {
              item = _ref12[i];
              values[keys.indexOf("" + variableName + (i + 1))] = this.exportValue(item.itemResult);
            }
          } else if (prototype === "survey") {
            _ref13 = subtest.data;
            for (surveyVariable in _ref13) {
              surveyValue = _ref13[surveyVariable];
              if (_.isObject(surveyValue)) {
                for (optionKey in surveyValue) {
                  optionValue = surveyValue[optionKey];
                  values[keys.indexOf("" + surveyVariable + "_" + optionKey)] = this.exportValue(optionValue);
                }
              } else {
                values[keys.indexOf("" + surveyVariable)] = this.exportValue(surveyValue);
              }
            }
          } else if (prototype === "observation") {
            _ref14 = subtest.data.surveys;
            for (i = 0, _len12 = _ref14.length; i < _len12; i++) {
              observations = _ref14[i];
              observationData = observations.data;
              for (surveyVariable in observationData) {
                surveyValue = observationData[surveyVariable];
                if (_.isObject(surveyValue)) {
                  for (optionKey in surveyValue) {
                    optionValue = surveyValue[optionKey];
                    values[keys.indexOf("" + surveyVariable + "_" + optionKey + "_" + (i + 1))] = this.exportValue(optionValue);
                  }
                } else {
                  values[keys.indexOf("" + surveyVariable + "_" + (i + 1))] = this.exportValue(surveyValue);
                }
              }
            }
          } else if (prototype === "complete") {
            values[keys.indexOf("additional_comments")] = subtest.data.comment;
            values[keys.indexOf("end_time")] = subtest.data.end_time;
            if (subtest.data.gps != null) {
              values[keys.indexOf("gps_latitude")] = subtest.data.gps.latitude;
              values[keys.indexOf("gps_longitude")] = subtest.data.gps.longitude;
              values[keys.indexOf("gps_accuracy")] = subtest.data.gps.accuracy;
            }
          }
        }
        resultDataArray.push(values);
      }
      for (i = 0, _len13 = resultDataArray.length; i < _len13; i++) {
        row = resultDataArray[i];
        tableHTML += "<tr>";
        count = 0;
        for (index = 0, _ref15 = row.length - 1; 0 <= _ref15 ? index <= _ref15 : index >= _ref15; 0 <= _ref15 ? index++ : index--) {
          tableHTML += "<td>" + row[index] + "</td>";
          count++;
        }
        tableHTML += "</tr>";
      }
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

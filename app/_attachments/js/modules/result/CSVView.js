var CSVView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
      success: function(collection) {
        var allSubtests;
        _this.results = collection.where({
          assessmentId: _this.assessmentId
        });
        allSubtests = new Subtests;
        return allSubtests.fetch({
          success: function(collection) {
            var grid, grids, gridsByName, i, item, k, key, markIndex, newGridData, result, subtestKey, subtestValue, v, _i, _j, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _ref4, _ref5;
            grids = collection.where({
              assessmentId: _this.assessmentId,
              prototype: "grid"
            });
            gridsByName = {};
            for (_i = 0, _len = grids.length; _i < _len; _i++) {
              grid = grids[_i];
              gridsByName[grid.attributes.name] = grid.attributes;
            }
            _ref = _this.results;
            for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
              result = _ref[_j];
              _ref2 = result.attributes.subtestData;
              for (subtestKey in _ref2) {
                subtestValue = _ref2[subtestKey];
                if (subtestValue.data.letters_results != null) {
                  newGridData = [];
                  if (_.keys(subtestValue.data.letters_results).length !== gridsByName[subtestValue.name].items.length) {
                    console.log("" + subtestValue.name + " reconstructing from mark_record");
                    subtestValue.data.letters_results = [];
                    _ref3 = gridsByName[subtestValue.name].items;
                    for (i = 0, _len3 = _ref3.length; i < _len3; i++) {
                      item = _ref3[i];
                      subtestValue.data.letters_results[i] = {};
                      subtestValue.data.letters_results[i][item] = i < parseInt(subtestValue.data.last_attempted) ? "correct" : "missing";
                    }
                    _ref4 = subtestValue.data.mark_record;
                    for (i = 0, _len4 = _ref4.length; i < _len4; i++) {
                      markIndex = _ref4[i];
                      markIndex--;
                      key = "";
                      _ref5 = subtestValue.data.letters_results[markIndex];
                      for (k in _ref5) {
                        v = _ref5[k];
                        key = k;
                      }
                      subtestValue.data.letters_results[markIndex][key] = subtestValue.data.letters_results[markIndex][key] === "correct" ? "incorrect" : "correct";
                    }
                  }
                }
              }
            }
            return _this.render();
          }
        });
      }
    });
    this.disallowedKeys = ["mark_record"];
    return this.metaKeys = ["enumerator", "starttime", "timestamp"];
  };

  CSVView.prototype.render = function() {
    var dataKey, dataValue, firstIndex, i, itemCount, k, key, keyIndex, keys, metaKey, questionVariable, result, resultDataArray, row, subtestKey, subtestName, subtestValue, tableHTML, v, value, valueIndex, valueName, values, variableName, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    if (this.results != null) {
      tableHTML = "";
      resultDataArray = [];
      keys = [];
      _ref = this.metaKeys;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        metaKey = _ref[_i];
        keys.push(metaKey);
      }
      _ref2 = this.results[0].attributes.subtestData;
      for (i = 0, _len2 = _ref2.length; i < _len2; i++) {
        subtestValue = _ref2[i];
        subtestName = subtestValue.name.toLowerCase().dasherize();
        _ref3 = subtestValue.data;
        for (dataKey in _ref3) {
          dataValue = _ref3[dataKey];
          if (!(__indexOf.call(this.disallowedKeys, dataKey) >= 0)) {
            if (_.isObject(dataValue)) {
              questionVariable = dataKey.toLowerCase().dasherize();
              for (key in dataValue) {
                value = dataValue[key];
                if (_.isObject(value)) {
                  for (k in value) {
                    v = value[k];
                    valueName = k;
                    variableName = subtestName + ":" + questionVariable + ":" + valueName;
                    keys.push(variableName);
                  }
                } else {
                  valueName = key;
                  variableName = subtestName + ":" + questionVariable + ":" + valueName;
                  keys.push(variableName);
                }
              }
            } else {
              valueName = dataKey;
              variableName = subtestName + ":" + valueName;
              keys.push(variableName);
            }
          }
        }
      }
      resultDataArray.push(keys);
      _ref4 = this.results;
      for (_j = 0, _len3 = _ref4.length; _j < _len3; _j++) {
        result = _ref4[_j];
        values = [];
        _ref5 = this.metaKeys;
        for (_k = 0, _len4 = _ref5.length; _k < _len4; _k++) {
          metaKey = _ref5[_k];
          values.push(result.attributes[metaKey]);
        }
        _ref6 = result.attributes.subtestData;
        for (subtestKey in _ref6) {
          subtestValue = _ref6[subtestKey];
          subtestName = subtestValue.name.toLowerCase().dasherize();
          _ref7 = subtestValue.data;
          for (dataKey in _ref7) {
            dataValue = _ref7[dataKey];
            if (!(__indexOf.call(this.disallowedKeys, dataKey) >= 0)) {
              if (_.isObject(dataValue)) {
                questionVariable = dataKey.toLowerCase().dasherize();
                itemCount = 0;
                for (key in dataValue) {
                  value = dataValue[key];
                  if (_.isObject(value)) {
                    for (k in value) {
                      v = value[k];
                      valueName = k;
                      variableName = subtestName + ":" + questionVariable + ":" + valueName;
                      valueIndex = keys.indexOf(variableName);
                      firstIndex = null;
                      for (keyIndex = 0, _len5 = keys.length; keyIndex < _len5; keyIndex++) {
                        key = keys[keyIndex];
                        if (~key.indexOf(subtestName + ":" + questionVariable) && firstIndex === null) {
                          firstIndex = keyIndex;
                        }
                      }
                      values[firstIndex + itemCount] = v;
                    }
                    itemCount++;
                  } else {
                    valueName = key;
                    variableName = subtestName + ":" + questionVariable + ":" + valueName;
                    valueIndex = keys.indexOf(variableName);
                    if (keys.indexOf(variableName) === -1) {} else {
                      values[valueIndex] = value;
                    }
                  }
                }
              } else {
                valueName = dataKey;
                variableName = subtestName + ":" + valueName;
                valueIndex = keys.indexOf(variableName);
                if (valueIndex === -1) {} else {
                  values[valueIndex] = dataValue;
                }
              }
            }
          }
        }
        resultDataArray.push(values);
      }
      for (_l = 0, _len6 = resultDataArray.length; _l < _len6; _l++) {
        row = resultDataArray[_l];
        tableHTML += "<tr>";
        for (key in row) {
          value = row[key];
          tableHTML += "<td>" + value + "</td>";
        }
        tableHTML += "</tr>";
      }
      tableHTML = "<table>" + tableHTML + "</table>";
      this.$el.html(tableHTML);
      this.csv = this.$el.table2CSV({
        delivery: "value"
      });
      this.$el.html("        <div id='csv_view'>        <h1>Result CSV</h1>        <textarea>" + this.csv + "</textarea><br>        <a href='data:text/octet-stream;base64," + (Base64.encode(this.csv)) + "' download='" + this.assessmentId + ".csv'>Download file</a>        (Right click and click <i>Save Link As...</i>)        </div>        ");
    }
    return this.trigger("rendered");
  };

  return CSVView;

})(Backbone.View);

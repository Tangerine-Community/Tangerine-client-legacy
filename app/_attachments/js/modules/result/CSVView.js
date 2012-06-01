var CSVView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

CSVView = (function(_super) {

  __extends(CSVView, _super);

  function CSVView() {
    CSVView.__super__.constructor.apply(this, arguments);
  }

  CSVView.prototype.events = {
    'click .option_reduce': 'toggleReduce'
  };

  CSVView.prototype.toggleReduce = function(event) {
    var value;
    value = $(event.target).val();
    this.reduceExclusive = value === "true" ? true : false;
    return this.initialize({
      assessmentId: this.assessmentId
    });
  };

  CSVView.prototype.initialize = function(options) {
    var allResults,
      _this = this;
    this.assessmentId = Utils.cleanURL(options.assessmentId);
    allResults = new Results;
    allResults.fetch({
      success: function(collection) {
        var allQuestions;
        _this.results = collection.where({
          assessmentId: _this.assessmentId
        });
        allQuestions = new Questions;
        return allQuestions.fetch({
          success: function(collection) {
            var allSubtests, q, questions, _i, _len;
            questions = collection.where({
              assessmentId: _this.assessmentId
            });
            _this.singleQuestions = [];
            for (_i = 0, _len = questions.length; _i < _len; _i++) {
              q = questions[_i];
              if (q.attributes.type === "single") {
                _this.singleQuestions.push(q.attributes.name);
              }
            }
            allSubtests = new Subtests;
            return allSubtests.fetch({
              success: function(collection) {
                var dataKey, dataValue, grid, grids, gridsByName, i, item, k, key, markIndex, newGridData, option, question, questionVariable, result, singleResult, subtest, subtestKey, subtestName, subtestValue, subtests, surveys, v, valueName, _j, _k, _l, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _o, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
                _this.surveyColumns = {};
                subtests = collection.where({
                  assessmentId: _this.assessmentId
                });
                surveys = collection.where({
                  assessmentId: _this.assessmentId,
                  prototype: "survey"
                });
                for (_j = 0, _len2 = surveys.length; _j < _len2; _j++) {
                  subtest = surveys[_j];
                  subtestName = subtest.attributes.name.toLowerCase().dasherize();
                  _this.surveyColumns[subtestName] = [];
                  _ref = allQuestions.where({
                    subtestId: subtest.id
                  });
                  for (_k = 0, _len3 = _ref.length; _k < _len3; _k++) {
                    question = _ref[_k];
                    questionVariable = question.attributes.name.toLowerCase().dasherize();
                    if ((_this.reduceExclusive != null) && _this.reduceExclusive === true && question.attributes.type === "single") {
                      _this.surveyColumns[subtestName].push(subtestName + ":" + questionVariable);
                    } else if (question.attributes.type === "single") {
                      _ref2 = question.attributes.options;
                      for (_l = 0, _len4 = _ref2.length; _l < _len4; _l++) {
                        option = _ref2[_l];
                        valueName = option.value;
                        _this.surveyColumns[subtestName].push(subtestName + ":" + questionVariable + ":" + valueName);
                      }
                    } else if (question.attributes.type === "multiple") {
                      _ref3 = question.attributes.options;
                      for (_m = 0, _len5 = _ref3.length; _m < _len5; _m++) {
                        option = _ref3[_m];
                        valueName = option.value;
                        _this.surveyColumns[subtestName].push(subtestName + ":" + questionVariable + ":" + valueName);
                      }
                    } else if (question.attributes.type === "open") {
                      _this.surveyColumns[subtestName].push(subtestName + ":" + questionVariable + ":" + question.attributes.name);
                    }
                  }
                }
                grids = collection.where({
                  assessmentId: _this.assessmentId,
                  prototype: "grid"
                });
                gridsByName = {};
                for (_n = 0, _len6 = grids.length; _n < _len6; _n++) {
                  grid = grids[_n];
                  gridsByName[grid.attributes.name] = grid.attributes;
                }
                _ref4 = _this.results;
                for (_o = 0, _len7 = _ref4.length; _o < _len7; _o++) {
                  result = _ref4[_o];
                  _ref5 = result.attributes.subtestData;
                  for (subtestKey in _ref5) {
                    subtestValue = _ref5[subtestKey];
                    if (subtestValue.data.letters_results != null) {
                      newGridData = [];
                      if ((gridsByName[subtestValue.name] != null) && _.keys(subtestValue.data.letters_results).length !== gridsByName[subtestValue.name].items.length) {
                        subtestValue.data.letters_results = [];
                        _ref6 = gridsByName[subtestValue.name].items;
                        for (i = 0, _len8 = _ref6.length; i < _len8; i++) {
                          item = _ref6[i];
                          subtestValue.data.letters_results[i] = {};
                          subtestValue.data.letters_results[i][item] = i < parseInt(subtestValue.data.last_attempted) ? "correct" : "missing";
                        }
                        _ref7 = subtestValue.data.mark_record;
                        for (i = 0, _len9 = _ref7.length; i < _len9; i++) {
                          markIndex = _ref7[i];
                          markIndex--;
                          key = "";
                          _ref8 = subtestValue.data.letters_results[markIndex];
                          for (k in _ref8) {
                            v = _ref8[k];
                            key = k;
                          }
                          subtestValue.data.letters_results[markIndex][key] = subtestValue.data.letters_results[markIndex][key] === "correct" ? "incorrect" : "correct";
                        }
                      }
                    }
                    if ((_this.reduceExclusive != null) && _this.reduceExclusive === true) {
                      _ref9 = subtestValue.data;
                      for (dataKey in _ref9) {
                        dataValue = _ref9[dataKey];
                        if (__indexOf.call(_this.singleQuestions, dataKey) >= 0) {
                          for (k in dataValue) {
                            v = dataValue[k];
                            if (v === "checked") singleResult = k;
                          }
                          subtestValue.data[dataKey] = singleResult;
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
      }
    });
    this.disallowedKeys = ["mark_record"];
    return this.metaKeys = ["enumerator", "starttime", "timestamp"];
  };

  CSVView.prototype.render = function() {
    var checkedString, count, d, dataKey, dataValue, firstIndex, i, index, itemCount, k, key, keyIndex, keys, maxIndex, maxSubtests, metaKey, oneKey, questionVariable, result, resultDataArray, row, subtest, subtestLength, subtestName, subtestValue, tableHTML, v, value, valueIndex, valueName, values, variableName, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    if (this.results != null) {
      tableHTML = "";
      resultDataArray = [];
      keys = [];
      _ref = this.metaKeys;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        metaKey = _ref[_i];
        keys.push(metaKey);
      }
      maxIndex = 0;
      maxSubtests = -1;
      _ref2 = this.results;
      for (i = 0, _len2 = _ref2.length; i < _len2; i++) {
        subtest = _ref2[i];
        subtestLength = subtest.attributes.subtestData.length;
        if (subtestLength >= maxSubtests) {
          maxSubtests = subtestLength;
          maxIndex = i;
        }
      }
      _ref3 = this.results[maxIndex].attributes.subtestData;
      for (_j = 0, _len3 = _ref3.length; _j < _len3; _j++) {
        subtestValue = _ref3[_j];
        subtestName = subtestValue.name.toLowerCase().dasherize();
        if (__indexOf.call(_.keys(this.surveyColumns), subtestName) >= 0) {
          keys = keys.concat(this.surveyColumns[subtestName]);
        } else {
          _ref4 = subtestValue.data;
          for (dataKey in _ref4) {
            dataValue = _ref4[dataKey];
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
                valueName = dataKey.toLowerCase().dasherize();
                variableName = subtestName + ":" + valueName;
                keys.push(variableName);
              }
            }
          }
        }
      }
      resultDataArray.push(keys);
      _ref5 = this.results;
      for (d = 0, _len4 = _ref5.length; d < _len4; d++) {
        result = _ref5[d];
        values = [];
        _ref6 = this.metaKeys;
        for (_k = 0, _len5 = _ref6.length; _k < _len5; _k++) {
          metaKey = _ref6[_k];
          values.push(result.attributes[metaKey]);
        }
        _ref7 = result.attributes.subtestData;
        for (_l = 0, _len6 = _ref7.length; _l < _len6; _l++) {
          subtestValue = _ref7[_l];
          subtestName = subtestValue.name.toLowerCase().dasherize();
          _ref8 = subtestValue.data;
          for (dataKey in _ref8) {
            dataValue = _ref8[dataKey];
            if (!(__indexOf.call(this.disallowedKeys, dataKey) >= 0)) {
              if (_.isObject(dataValue)) {
                questionVariable = dataKey.toLowerCase().dasherize();
                itemCount = 0;
                for (key in dataValue) {
                  value = dataValue[key];
                  if (_.isObject(value)) {
                    firstIndex = null;
                    for (keyIndex = 0, _len7 = keys.length; keyIndex < _len7; keyIndex++) {
                      oneKey = keys[keyIndex];
                      if (~oneKey.indexOf(subtestName + ":" + questionVariable) && firstIndex === null) {
                        firstIndex = keyIndex;
                      }
                    }
                    for (k in value) {
                      v = value[k];
                      valueName = k;
                      variableName = subtestName + ":" + questionVariable + ":" + valueName;
                      valueIndex = keys.indexOf(variableName);
                      values[firstIndex + itemCount] = v;
                    }
                    itemCount++;
                  } else {
                    valueName = key;
                    variableName = subtestName + ":" + questionVariable + ":" + valueName;
                    valueIndex = keys.indexOf(variableName);
                    if (keys.indexOf(variableName) !== -1) {
                      values[valueIndex] = value;
                    }
                  }
                }
              } else {
                valueName = dataKey.toLowerCase().dasherize();
                variableName = subtestName + ":" + valueName;
                valueIndex = keys.indexOf(variableName);
                if (valueIndex !== -1) values[valueIndex] = dataValue;
              }
            }
          }
        }
        resultDataArray.push(values);
      }
      for (i = 0, _len8 = resultDataArray.length; i < _len8; i++) {
        row = resultDataArray[i];
        tableHTML += "<tr>";
        count = 0;
        for (index = 0, _ref9 = row.length; 0 <= _ref9 ? index <= _ref9 : index >= _ref9; 0 <= _ref9 ? index++ : index--) {
          tableHTML += "<td>" + row[index] + "</td>";
          count++;
        }
        tableHTML += "</tr>";
      }
      tableHTML = "<table>" + tableHTML + "</table>";
      this.$el.html(tableHTML);
      this.csv = this.$el.table2CSV({
        delivery: "value"
      });
      checkedString = "checked='checked'";
      this.$el.html("        <div id='csv_view'>        <h1>Result CSV</h1>        <h2>Options</h2>        <div class='menu_box'>          <label>Reduce exclusive</label>          <div id='output_options'>            <label for='reduce_on'>On</label>            <input class='option_reduce' name='reduce' type='radio' value='true' id='reduce_on' " + (this.reduceExclusive ? checkedString : void 0) + ">            <label for='reduce_off'>Off</label>            <input class='option_reduce' name='reduce' type='radio' value='false' id='reduce_off' " + (!this.reduceExclusive ? checkedString : void 0) + ">          </div>        </div>        <textarea>" + this.csv + "</textarea><br>        <a href='data:text/octet-stream;base64," + (Base64.encode(this.csv)) + "' download='" + this.assessmentId + ".csv'>Download file</a>        (Right click and click <i>Save Link As...</i>)        </div>        ");
      this.$el.find("#output_options").buttonset();
    }
    return this.trigger("rendered");
  };

  return CSVView;

})(Backbone.View);

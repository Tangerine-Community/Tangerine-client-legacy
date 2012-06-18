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
    this.reduceExclusive = options.reduceExclusive;
    this.assessmentId = Utils.cleanURL(options.assessmentId);
    this.malawi2012EGRA = false;
    if (this.assessmentId === "b6faf1dcbe0aac8e66fc4607aa2c348b") {
      this.reduceExclusive = true;
      this.malawi2012EGRA = true;
      console.log("Malawi 2012 May EGRA");
      this.replaceMapValues = {
        "1": ["yes", "true", "TRUE", "True", "correct", "checked", "mkazi"],
        "0": ["no", "false", "FALSE", "False", "incorrect", "unchecked", "mwamuna"],
        ".": ["missing", "na", "Na", "NA", "undefined", "not_asked", "no_response", "skip"]
      };
      this.replaceMapKeys = {
        "enumerator": "admin_name",
        "starttime": "start_time",
        "endtime": "end_time",
        "date-and-time:year": "year",
        "date-and-time:month": "month",
        "date-and-time:day": "day",
        "date-and-time:time": "assess_time",
        "school:province": "region",
        "school:district": "district",
        "school:name": "school",
        "school:school-id": "school_code",
        "student-consent:participant-consents": "consent",
        "student-information:school-shift": "shift",
        "student-information:zaka-zakubadwa": "age",
        "student-information:mkazi": "gender",
        "letter-name:autostopped": "letter_auto_stop",
        "letter-name:last-attempted": "letter_attempted",
        "letter-name:time-remaining": "letter_time_remain",
        "letter-name:time-elapsed": "NOT USED - time_elapsed",
        "syllables:autostopped": "syllable_sound_auto_stop",
        "syllables:last-attempted": "syllable_sound_attempted",
        "syllables:time-remaining": "syllable_sound_time_remain",
        "syllables:time-elapsed": "NOT USED - time_elapsed",
        "invented-words:autostopped": "invent_word_auto_stop",
        "invented-words:last-attempted": "invent_word_attempted",
        "invented-words:time-remaining": "invent_word_time_remain",
        "invented-words:time-elapsed": "NOT USED - time_elapsed",
        "oral-passage-reading:autostopped": "oral_read_auto_stop",
        "oral-passage-reading:last-attempted": "oral_read_attempted",
        "oral-passage-reading:time-remaining": "oral_read_time_remain",
        "oral-passage-reading:time-elapsed": "NOT USED - time_elapsed",
        "student-information:stream:stream": "section"
      };
      this.replaceWithNumbering = {
        "initial-sounds": "pa_init_sound",
        "letter-name:letters-results": "letter",
        "syllables:letters-results": "syllable_sound",
        "invented-words:letters-results": "invent_word",
        "oral-passage-reading:letters-results": "oral_read_word",
        "reading-comprehension:comp": "read_comp"
      };
      this.abnormalNamingTag = "pupil-context-interview";
      this.abnormalNamingReplacement = "exit_interview";
      this.alphabetLetters = ["", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];
      this.betweenColonsIgnore = [":lang-spec", ":kodi-kunyumba-kwanu-kuli-zinthu-ngati-izi", ":16b"];
    }
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
                          subtestValue.data.letters_results[i][item] = i < parseInt(subtestValue.data.last_attempted) ? "checked" : "missing";
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
                          subtestValue.data.letters_results[markIndex][key] = subtestValue.data.letters_results[markIndex][key] === "checked" ? "unchecked" : "checked";
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
    var betweenColons, checkedString, count, d, dataKey, dataValue, firstIndex, i, index, indexFirstColon, indexLastColon, itemCount, k, key, keyIndex, keys, lastAbnormalReplace, lastNumberedReplace, letterIndex, mapKey, mapValue, maxIndex, maxSubtests, metaKey, prefixTag, questionVariable, replacement, result, resultDataArray, row, rowNumber, subtest, subtestKey, subtestLength, subtestName, subtestValue, tableHTML, v, value, valueIndex, valueName, values, variableName, _i, _j, _k, _len, _len2, _len3, _len4, _len5, _len6, _len7, _ref, _ref10, _ref11, _ref12, _ref13, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
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
        if (result != null) {
          _ref7 = result.attributes.subtestData;
          for (subtestKey in _ref7) {
            subtestValue = _ref7[subtestKey];
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
                      for (k in value) {
                        v = value[k];
                        valueName = k;
                        variableName = subtestName + ":" + questionVariable + ":" + valueName;
                        valueIndex = keys.indexOf(variableName);
                        firstIndex = null;
                        for (keyIndex = 0, _len6 = keys.length; keyIndex < _len6; keyIndex++) {
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
        }
        resultDataArray.push(values);
      }
      for (rowNumber in resultDataArray) {
        row = resultDataArray[rowNumber];
        if (this.malawi2012EGRA) {
          if (rowNumber === "0") {
            lastNumberedReplace = "**TRASHVALUE**";
            lastAbnormalReplace = "**TRASHVALUE**";
            index = 0;
            letterIndex = 0;
            _ref9 = resultDataArray[0];
            for (i in _ref9) {
              key = _ref9[i];
              if (this.replaceMapKeys[key] != null) {
                resultDataArray[0][i] = this.replaceMapKeys[key];
                index = 0;
              } else {
                _ref10 = this.replaceWithNumbering;
                for (prefixTag in _ref10) {
                  replacement = _ref10[prefixTag];
                  if (~key.indexOf(prefixTag)) {
                    if (lastNumberedReplace === prefixTag) {
                      index++;
                    } else {
                      lastNumberedReplace = prefixTag;
                      index = 1;
                    }
                    resultDataArray[0][i] = replacement + index.toString();
                  }
                }
                if (~key.indexOf(this.abnormalNamingTag)) {
                  if (lastNumberedReplace !== this.abnormalNamingTag) {
                    index = 0;
                    lastNumberedReplace = this.abnormalNamingTag;
                  }
                  indexFirstColon = key.indexOf(":");
                  indexLastColon = key.lastIndexOf(":");
                  betweenColons = key.substring(indexFirstColon, indexLastColon);
                  if (indexFirstColon === indexLastColon || ~this.betweenColonsIgnore.indexOf(betweenColons)) {
                    index++;
                    letterIndex = 0;
                  } else if (betweenColons !== lastAbnormalReplace) {
                    letterIndex = 1;
                    index++;
                    lastAbnormalReplace = betweenColons;
                  } else {
                    letterIndex++;
                    if (letterIndex === 1) index++;
                  }
                  resultDataArray[0][i] = this.abnormalNamingReplacement + index.toString() + this.alphabetLetters[letterIndex];
                }
              }
            }
          } else {
            _ref11 = resultDataArray[rowNumber];
            for (i in _ref11) {
              value = _ref11[i];
              _ref12 = this.replaceMapValues;
              for (mapKey in _ref12) {
                mapValue = _ref12[mapKey];
                if (_.isBoolean(value)) value = value.toString();
                if (~mapValue.indexOf(value)) {
                  resultDataArray[rowNumber][i] = mapKey;
                }
              }
            }
          }
        }
      }
      for (i = 0, _len7 = resultDataArray.length; i < _len7; i++) {
        row = resultDataArray[i];
        tableHTML += "<tr>";
        count = 0;
        for (index = 0, _ref13 = row.length - 1; 0 <= _ref13 ? index <= _ref13 : index >= _ref13; 0 <= _ref13 ? index++ : index--) {
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

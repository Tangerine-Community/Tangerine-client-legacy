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
      success: function(collection) {
        _this.results = collection.where({
          assessmentId: _this.assessmentId
        });
        return _this.render();
      }
    });
    this.disallowedKeys = ["_id", "_rev", "collection", "assessmentId", "subtestType"];
    return this.metaKeys = ["timestamp", "enumerator"];
  };

  CSVView.prototype.render = function() {
    var dataKey, dataValue, key, keys, result, resultDataArray, row, subtestKey, subtestValue, tableHTML, value, values, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _ref5;
    console.log(this.results);
    if (this.results != null) {
      tableHTML = "";
      resultDataArray = [];
      keys = [];
      keys.push("enumerator");
      keys.push("starttime");
      keys.push("timestamp");
      _ref = this.results[0].attributes.subtestData;
      for (subtestKey in _ref) {
        subtestValue = _ref[subtestKey];
        _ref2 = subtestValue.data;
        for (dataKey in _ref2) {
          dataValue = _ref2[dataKey];
          if (_.isObject(dataValue)) {
            for (key in dataValue) {
              value = dataValue[key];
              keys.push(key);
            }
          }
        }
      }
      resultDataArray.push(keys);
      _ref3 = this.results;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        result = _ref3[_i];
        values = [];
        values.push(result.attributes.enumerator);
        values.push(result.attributes.starttime);
        values.push(result.attributes.timestamp);
        _ref4 = result.attributes.subtestData;
        for (subtestKey in _ref4) {
          subtestValue = _ref4[subtestKey];
          _ref5 = subtestValue.data;
          for (dataKey in _ref5) {
            dataValue = _ref5[dataKey];
            if (_.isObject(dataValue)) {
              for (key in dataValue) {
                value = dataValue[key];
                values.push(value);
              }
            }
          }
        }
        resultDataArray.push(values);
      }
      for (_j = 0, _len2 = resultDataArray.length; _j < _len2; _j++) {
        row = resultDataArray[_j];
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

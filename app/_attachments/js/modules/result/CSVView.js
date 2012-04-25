var CSVView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

CSVView = (function(_super) {

  __extends(CSVView, _super);

  function CSVView() {
    CSVView.__super__.constructor.apply(this, arguments);
  }

  CSVView.prototype.el = "#content";

  CSVView.prototype.initialize = function(options) {
    var _this = this;
    this.disallowedKeys = ["_id", "_rev", "collection", "assessmentId", "subtestType"];
    this.metaKeys = ["timestamp", "enumerator"];
    this.assessmentId = options.assessmentId;
    return $.couch.db(Tangerine.config.db_name).view("tangerine/results", {
      keys: [this.assessmentId],
      success: function(data) {
        var withNewLines, withoutNewLines;
        withNewLines = JSON.stringify(data);
        withoutNewLines = withNewLines.replace(/\\r\\n|\\n/g, " ");
        console.log(withoutNewLines);
        _this.resultData = JSON.parse(withoutNewLines);
        return _this.render();
      },
      error: function(status) {
        return console.log("error: " + status);
      }
    });
  };

  CSVView.prototype.render = function() {
    var csvRow, filteredData, key, metaData, oneResult, results, resultsName, row, subKey, subValue, tableHTML, value, _i, _j, _len, _len2, _ref, _ref2, _ref3;
    results = [];
    tableHTML = "";
    resultsName = this.resultData.rows[0].key.replace(".", " ").titleize();
    _ref = this.resultData.rows;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      oneResult = _ref[_i];
      filteredData = {};
      metaData = {};
      _ref2 = oneResult.value;
      for (key in _ref2) {
        value = _ref2[key];
        if (_.indexOf(this.metaKeys, key) !== -1) {
          metaData[key] = value;
        } else if (_.indexOf(this.disallowedKeys, key) === -1) {
          if (_.isObject(value)) {
            for (subKey in value) {
              subValue = value[subKey];
              if (_.indexOf(this.disallowedKeys, subKey) === -1) {
                if (_.isArray(subValue)) {
                  filteredData["" + key + "." + subKey] = subValue.join(",");
                } else {
                  filteredData["" + key + "." + subKey] = subValue;
                }
              }
            }
          }
        }
      }
      csvRow = {};
      for (key in metaData) {
        value = metaData[key];
        csvRow[key] = value;
      }
      for (key in filteredData) {
        value = filteredData[key];
        csvRow[key] = value;
      }
      results.push(csvRow);
    }
    tableHTML += "<tr>";
    _ref3 = results[0];
    for (key in _ref3) {
      value = _ref3[key];
      tableHTML += "<td>" + key + "</td>";
    }
    tableHTML += "</tr>";
    for (_j = 0, _len2 = results.length; _j < _len2; _j++) {
      row = results[_j];
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
    return this.$el.html("      <div id='csv_view'>      <h1>" + resultsName + "</h1>      <textarea>" + this.csv + "</textarea><br>      <a href='data:text/octet-stream;base64," + (Base64.encode(this.csv)) + "' download='" + this.assessmentId + ".csv'>Download file</a>      (Right click and click <i>Save Link As...</i>)      </div>      ");
  };

  return CSVView;

})(Backbone.View);

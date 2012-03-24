var ResultsView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ResultsView = (function(_super) {

  __extends(ResultsView, _super);

  function ResultsView() {
    this.render = __bind(this.render, this);
    ResultsView.__super__.constructor.apply(this, arguments);
  }

  ResultsView.prototype.el = $('#content');

  ResultsView.prototype.render = function() {
    var _this = this;
    this.el.html("      <div id='message'></div>      <h2>" + (this.assessment.get("name")) + "</h2>      <div>Last save to cloud: <span id='lastCloudReplicationTime'></span></div>      <button>Detect save options</button>      <div id='saveOptions'>      </div>      <button>CSV/Excel</button>      <hr/>      Results saved by " + $.enumerator + ":      <div id='results'></div>    ");
    this.detectCloud();
    this.updateLastCloudReplication();
    _.each(this.results, function(result) {
      var finishTime;
      if (Tangerine.resultView == null) Tangerine.resultView = new ResultView();
      Tangerine.resultView.model = result;
      finishTime = new moment(result.get("timestamp"));
      return $("#results").append("        <div><button>" + (finishTime.format("D-MMM-YY")) + " (" + (finishTime.fromNow()) + ")</button></div>        <div class='result'>" + (Tangerine.resultView.render()) + "</div>      ");
    });
    $("#results").accordion({
      collapsible: true,
      active: false
    });
    return $("#results").bind("accordionchange", function(event, ui) {
      if (ui.newContent.find("canvas").length > 0) return;
      return $('.sparkline').sparkline('html', {
        type: 'pie',
        sliceColors: ['black', '#F7C942', 'orangered']
      });
    });
  };

  ResultsView.prototype.events = {
    "click button:contains(Cloud save)": "save",
    "click button:contains(Local save)": "save",
    "click button:contains(CSV/Excel)": "csv",
    "click button:contains(Detect save options)": "detect",
    "click button:contains(update table)": "updateTable",
    "click button:contains(Download as CSV)": "downloadCSV"
  };

  ResultsView.prototype.updateLastCloudReplication = function() {
    return this.assessment.lastCloudReplication({
      success: function(result) {
        return $("#lastCloudReplicationTime").html(new moment(result.timestamp).fromNow());
      },
      error: function() {
        return $("#lastCloudReplicationTime").html("Unknown");
      }
    });
  };

  ResultsView.prototype.save = function(event) {
    return this.replicate($(event.target).attr("saveTarget"));
  };

  ResultsView.prototype.detect = function() {
    $("#saveOptions").html("<span id='saveMessage'>Detecting</span>");
    this.detectCloud();
    return this.detectSubnet();
  };

  ResultsView.prototype.detectCloud = function() {
    return this.detectIP({
      url: Tangerine.cloud.url,
      successButton: "<button type='button' class='save' saveTarget='" + Tangerine.cloud.url + "'>Cloud save</button>"
    });
  };

  ResultsView.prototype.detectSubnet = function() {
    var buttonText, subnetIP, url, _ref, _ref2, _results;
    _results = [];
    for (subnetIP = _ref = Tangerine.subnet.start, _ref2 = Tangerine.subnet.finish; _ref <= _ref2 ? subnetIP <= _ref2 : subnetIP >= _ref2; _ref <= _ref2 ? subnetIP++ : subnetIP--) {
      url = Tangerine.subnet.base + subnetIP + ":" + Tangerine.port;
      buttonText = "Local save <span style='font-size:50%'>" + (url.substring(7, url.lastIndexOf(":"))) + "</span>";
      _results.push(this.detectIP({
        url: url,
        successButton: "<button type='button' class='save' saveTarget='" + url + "'>" + buttonText
      }));
    }
    return _results;
  };

  ResultsView.prototype.detectIP = function(options) {
    return $.ajax({
      dataType: "jsonp",
      url: options.url,
      success: function() {
        $("#saveMessage").html("");
        return $("#saveOptions").append(options.successButton);
      },
      error: function(a, b, c) {
        if (b === 'parsererror') {
          $("#saveMessage").html("");
          return $("#saveOptions").append(options.successButton);
        }
      }
    });
  };

  ResultsView.prototype.replicate = function(target) {
    var _this = this;
    return this.assessment.replicate(target, {
      success: function() {
        $("#message").html("Save successful");
        return _this.updateLastCloudReplication();
      }
    });
  };

  ResultsView.prototype.csv = function() {
    return Tangerine.router.navigate("results/tabular/" + (this.assessment.get("_id")), true);
  };

  ResultsView.prototype.updateTable = function() {
    var options, tableConfigQueryString, urlHashClean;
    tableConfigQueryString = $('form').serialize();
    if (document.location.hash.indexOf("?") > 0) {
      urlHashClean = document.location.hash.substring(0, document.location.hash.indexOf("?"));
    } else {
      urlHashClean = document.location.hash;
    }
    Tangerine.router.navigate(urlHashClean + "/?" + tableConfigQueryString);
    options = jQuery.deparam.querystring(jQuery.param.fragment());
    this.renderTable(options);
    return false;
  };

  ResultsView.prototype.downloadCSV = function() {
    return $("table#results").table2CSV();
  };

  ResultsView.prototype.renderTable = function(options) {
    var combines, count, ignoreResultList, table, table_rows, uniqueFields, _ref;
    if (options.ignoreColumn == null) options.ignoreColumn = "_rev";
    if (options.ignoreResult == null) options.ignoreResult = "";
    ignoreResultList = options.ignoreResult.split(/, */);
    if (options.combine != null) {
      combines = _.map(options.combine.split(/; */), function(combine) {
        var alias, targets, _ref;
        _ref = combine.split(/: */), alias = _ref[0], targets = _ref[1];
        return {
          alias: alias,
          targets: targets.split(/, */)
        };
      });
    } else {
      combines = "";
    }
    uniqueFields = _.difference(this.uniqueFields, (_ref = options.ignoreColumn) != null ? _ref.split(/, */) : void 0);
    uniqueFields = _.map(uniqueFields, function(field) {
      _.each(combines, function(combine) {
        if (_.include(combine.targets, field)) return field = combine.alias;
      });
      return field;
    });
    uniqueFields = _.unique(uniqueFields);
    table_rows = {};
    _.each(this.tableResults.rows, function(row) {
      return table_rows[row._id] = {
        "id": row._id
      };
    });
    _.each(this.tableResults.rows, function(row) {
      var fieldname;
      fieldname = row.value.fieldname;
      _.each(combines, function(combine) {
        if (_.include(combine.targets, fieldname)) {
          return fieldname = combine.alias;
        }
      });
      if (table_rows[row._id][fieldname] != null) {
        return table_rows[row._id][fieldname] += ", " + row.value.result;
      } else {
        return table_rows[row._id][fieldname] = row.value.result;
      }
    });
    table = "      <table id='results' class='tablesorter'>        <thead>          <tr>    ";
    table += _.map(uniqueFields, function(field) {
      return "<th>" + field + "</th>";
    }).join("");
    table += "          </tr>        </thead>        <tbody>    ";
    count = 0;
    _.each(table_rows, function(row) {
      count++;
      table += "<tr>";
      _.each(uniqueFields, function(field) {
        var item;
        item = row[field] || "";
        return table += "<td>" + (_.include(ignoreResultList, item) ? "" : item) + "</td>";
      });
      return table += "</tr>";
    });
    table += "        </tbody>      </table>    ";
    $("#content").html(("      <script type='text/javascript' src='js-libraries/table2CSV.js'></script>      <script type='text/javascript' src='js-libraries/picnet.table.filter.min.js'></script>      <style>        form{          font-size:8pt;        }        input{          width: 500px;        }      </style>      <div>Instructions: Ignore the configuration section for now - but it can be used to map column names to specific codes and more - it just needs a better interface. Each column may be sorted by clicking on it. The text box below each column name allows you to filter for results (to search for a specific student ID, or filter by gender). The Download as CSV button takes the current state of the table (including filters and sorting) and creates a CSV text that can be pasted into a spreadsheet for further analysis.</div>      <form>        <fieldset>        <legend>Configuration</legend>          <table id='configuration'>            <tr>              <td>Alias (original_name, display_name)</td><td><input type='text' name='alias' value='" + (options.alias || "") + "'></input></td>            </tr><tr>              <td>Combine (alias: original_name/alias, original_name/alias; alias: orig...) </td><td><input type='text' name='combine' value='" + (options.combine || "") + "'></input></td>            </tr><tr>              <td>Column to Ignore (text to ignore ,i.e. _id) </td><td><input type='text' name='ignoreColumn' value='" + (options.ignoreColumn || "") + "'></input></td>            </tr><tr>              <td>Results to Ignore (text to ignore ,i.e. undefined) </td><td><input type='text' name='ignoreResult' value='" + (options.ignoreResult || "") + "'></input></td>            </table>          </tr>          <button>update table</button>        </fieldset>      </form>      <button>Download as CSV</button>      <div>Total Number of Rows:" + count + "</div>        ") + table);
    return $("#results").tablesorter();
  };

  return ResultsView;

})(Backbone.View);

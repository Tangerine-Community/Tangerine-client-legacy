var ProgressView, SortedCollection,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ProgressView = (function(_super) {

  __extends(ProgressView, _super);

  function ProgressView() {
    this.updateFlot = __bind(this.updateFlot, this);
    this.afterRender = __bind(this.afterRender, this);
    ProgressView.__super__.constructor.apply(this, arguments);
  }

  ProgressView.prototype.INDIVIDUAL = 1;

  ProgressView.prototype.AGGREGATE = 2;

  ProgressView.prototype.className = "ProgressView";

  ProgressView.prototype.events = {
    'click .back': 'goBack',
    'click .select_itemType': 'selectItemType'
  };

  ProgressView.prototype.selectItemType = function(event) {
    this.selected.itemType = $(event.target).attr('data-itemType');
    this.updateTable();
    return this.updateFlot();
  };

  ProgressView.prototype.goBack = function() {
    return history.go(-1);
  };

  ProgressView.prototype.initialize = function(options) {
    var data, dataForBenchmark, i, itemType, itemTypes, key, name, part, parts, pointsByItemType, result, row, subtest, subtests, _i, _j, _k, _len, _len2, _len3, _len4, _len5, _len6, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    this.results = options.results;
    this.student = options.student;
    this.subtests = options.subtests;
    this.klass = options.klass;
    if (!(this.klass != null)) Utils.log(this, "No klass.");
    if (!(this.subtests != null)) Utils.log(this, "No progress type subtests.");
    if (this.results.length === 0) Utils.log(this, "No result data.");
    this.mode = this.student != null ? this.INDIVIDUAL : this.AGGREGATE;
    this.subtestNames = {};
    this.benchmarkScore = {};
    this.rows = [];
    this.partCount = 0;
    this.flot = null;
    this.lastPart = Math.max.apply(this, _.compact(this.subtests.pluck("part")));
    this.resultsByPart = [];
    this.itemTypeList = {};
    this.selected = {
      "itemType": null,
      "week": 0
    };
    parts = [];
    _ref = this.subtests.models;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subtest = _ref[_i];
      if (!~parts.indexOf(subtest.get("part"))) parts.push(subtest.get("part"));
      i = parts.indexOf(subtest.get("part"));
      if (!(this.subtestNames[i] != null)) this.subtestNames[i] = {};
      this.subtestNames[i][subtest.get("itemType")] = subtest.get("name");
    }
    this.partCount = parts.length;
    this.resultsByPart = this.results.indexBy("part");
    _ref2 = this.results.models;
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      result = _ref2[_j];
      this.itemTypeList[result.get("itemType").toLowerCase()] = true;
    }
    this.itemTypeList = _.keys(this.itemTypeList);
    for (part = 1, _ref3 = this.lastPart; 1 <= _ref3 ? part <= _ref3 : part >= _ref3; 1 <= _ref3 ? part++ : part--) {
      if (this.resultsByPart[part] === void 0) continue;
      itemTypes = {};
      _ref4 = this.resultsByPart[part];
      for (i = 0, _len3 = _ref4.length; i < _len3; i++) {
        result = _ref4[i];
        if (this.mode === this.INDIVIDUAL && result.get("studentId") !== this.student.id) {
          continue;
        }
        itemType = result.get("itemType");
        if (!(this.selected.itemType != null)) this.selected.itemType = itemType;
        if (!(itemTypes[itemType] != null)) itemTypes[itemType] = [];
        itemTypes[itemType].push({
          "name": itemType.titleize(),
          "key": itemType,
          "correct": result.get("correct"),
          "attempted": result.get("attempted"),
          "itemsPerMinute": result.getCorrectPerSeconds(60)
        });
        this.benchmarkScore[itemType] = this.subtests.get(result.get("subtestId")).getNumber("scoreTarget");
      }
      this.rows.push({
        "part": part,
        "itemTypes": _.values(itemTypes)
      });
    }
    this.rows = this.aggregate(this.rows);
    pointsByItemType = {};
    _ref5 = this.rows;
    for (i = 0, _len4 = _ref5.length; i < _len4; i++) {
      row = _ref5[i];
      _ref6 = row.itemTypes;
      for (_k = 0, _len5 = _ref6.length; _k < _len5; _k++) {
        itemType = _ref6[_k];
        key = itemType.name;
        if (!(pointsByItemType[key] != null)) pointsByItemType[key] = [];
        pointsByItemType[key].push([i + 1, itemType.itemsPerMinute]);
      }
    }
    this.flotData = [];
    this.benchmarkData = [];
    i = 0;
    for (name in pointsByItemType) {
      data = pointsByItemType[name];
      key = name;
      this.flotData[key] = {
        "data": data,
        "label": name.titleize(),
        "key": key,
        "lines": {
          "show": true
        },
        "points": {
          "show": true
        }
      };
    }
    this.benchmarkData = [];
    this.warningThresholds = {};
    _ref7 = this.subtests.indexBy("itemType");
    for (itemType in _ref7) {
      subtests = _ref7[itemType];
      dataForBenchmark = [];
      this.warningThresholds[itemType] = [];
      for (i = 0, _len6 = subtests.length; i < _len6; i++) {
        subtest = subtests[i];
        this.warningThresholds[itemType].push({
          target: subtest.getNumber("scoreTarget"),
          spread: subtest.getNumber("scoreSpread")
        });
        dataForBenchmark.push([i + 1, subtest.getNumber("scoreTarget")]);
      }
      this.benchmarkData[itemType] = {
        "label": "Progress benchmark",
        "data": dataForBenchmark,
        "lines": {
          "show": true,
          "color": "green"
        }
      };
    }
    this.renderReady = true;
    return this.render();
  };

  ProgressView.prototype.render = function() {
    var $window, flotObject, html, key, win, _ref;
    if (!this.renderReady) return;
    $window = $(window);
    win = {
      h: $window.height(),
      w: $window.width()
    };
    html = "      <h1>Progress table</h1>      <h2>" + (this.mode === this.INDIVIDUAL ? this.student.get("name") : "") + "</h2>    ";
    html += "      <div id='flot-menu'>      ";
    _ref = this.flotData;
    for (key in _ref) {
      flotObject = _ref[key];
      html += "<button class='command select_itemType' data-itemType='" + flotObject.key + "'>" + flotObject.label + "</button>";
    }
    html += "      </div>      <div id='flot-container' style='width: " + (window.w * 0.8) + "px; height:300px;'></div>    ";
    html += "    <div id='table_container'></div>    <button class='navigation back'>" + (t('back')) + "</button>    ";
    this.$el.html(html);
    this.updateTable();
    return this.trigger("rendered");
  };

  ProgressView.prototype.afterRender = function() {
    return this.updateFlot();
  };

  ProgressView.prototype.updateTable = function() {
    var adjective, data, datum, difference, high, html, i, itemType, low, result, row, score, selectedType, threshold, warnings, _i, _j, _len, _len2, _len3, _ref, _ref2;
    console.log("test");
    console.log(this.rows);
    console.log(this.subtestNames);
    selectedType = this.selected.itemType;
    html = "<table class='tabular'>";
    _ref = this.rows;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      row = _ref[i];
      if (!~_.pluck(row.itemTypes, "key").indexOf(selectedType)) continue;
      html += "<tr><th>" + this.subtestNames[i][selectedType] + "</th></tr><tr>";
      _ref2 = row.itemTypes;
      for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
        itemType = _ref2[_i];
        if (itemType.key !== selectedType) continue;
        html += "          <tr>            <td>" + itemType.name + " correct</td><td>" + itemType.correct + "/" + itemType.attempted + "</td>            <td>" + itemType.name + " per minute</td><td>" + itemType.itemsPerMinute + "</td>          </tr>         ";
      }
    }
    html += "</table>";
    score = 0;
    data = this.flotData[selectedType] != null ? this.flotData[selectedType].data : [];
    console.log(data);
    for (_j = 0, _len3 = data.length; _j < _len3; _j++) {
      datum = data[_j];
      if (datum[0] === this.selected.week + 1) score = datum[1];
    }
    threshold = this.warningThresholds[selectedType][this.selected.week];
    high = threshold.target + threshold.spread;
    low = threshold.target - threshold.spread;
    difference = score - threshold.target;
    if (score > high) {
      result = "" + difference + " above the benchmark";
      warnings = "Your class is doing well, " + result + ", continue with the reading program. Share your and your class’ great work with parents. Reward your class with some fun reading activities such as reading marathons or competitions. However, look at a student grouping report for this assessment and make sure that those children performing below average get extra attention and practice and don’t fall behind.";
    } else if (score < low) {
      result = "" + (Math.abs(difference)) + " below the benchmark";
      warnings = "Your class is performing below the grade-level target, " + result + ". Plan for additional lesson time focusing on reading in consultation with your principal. Encourage parents to spend more time with reading materials at home – remind them that you are a team working together to help their children learning to read. Think about organizing other events and opportunities for practice, e.g., reading marathons or competitions to motivate students to read more.";
    } else {
      if (difference * -1 === Math.abs(difference)) {
        adjective = "above";
      } else {
        adjective = "below";
      }
      result = (score - threshold.score) + (" " + adjective + " the benchmark");
      warnings = "Your class is in line with expectations, " + result + ", continue with the reading program and keep up the good work! Look at a student grouping report for this assessment and make sure that those children performing below average get extra attention and practice and don’t fall behind.";
    }
    html += "      <section>        " + warnings + "      </section>    ";
    return this.$el.find("#table_container").html(html);
  };

  ProgressView.prototype.updateFlot = function() {
    var displayData, i,
      _this = this;
    this.flotOptions = {
      "xaxis": {
        "min": 0.5,
        "max": this.partCount + 0.5,
        "ticks": (function() {
          var _ref, _results;
          _results = [];
          for (i = 1, _ref = this.partCount; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
            _results.push(String(i));
          }
          return _results;
        }).call(this),
        "tickDecimals": 0,
        "tickFormatter": function(num) {
          return "<button class='xtick' data-index='" + num + "'>" + _this.subtestNames[num - 1][_this.selected.itemType] + "</button>";
        }
      },
      "grid": {
        "markings": {
          "color": "#ffc",
          "xaxis": {
            "to": this.selected.week + 0.5,
            "from": this.selected.week - 0.5
          }
        }
      }
    };
    displayData = [this.flotData[this.selected.itemType], this.benchmarkData[this.selected.itemType]];
    return this.flot = $.plot(this.$el.find("#flot-container"), displayData, this.flotOptions);
  };

  ProgressView.prototype.aggregate = function(oldRows) {
    var i, mean, newRows, result, results, row, _i, _j, _len, _len2, _len3, _ref;
    newRows = [];
    for (i = 0, _len = oldRows.length; i < _len; i++) {
      row = oldRows[i];
      newRows[i] = {
        "part": row.part,
        "itemTypes": []
      };
      _ref = row.itemTypes;
      for (_i = 0, _len2 = _ref.length; _i < _len2; _i++) {
        results = _ref[_i];
        mean = {
          "name": "",
          "key": "",
          "correct": 0,
          "attempted": 0,
          "itemsPerMinute": 0
        };
        for (_j = 0, _len3 = results.length; _j < _len3; _j++) {
          result = results[_j];
          mean.name = result.name;
          mean.key = result.key;
          mean.correct += result.correct;
          mean.attempted += result.attempted;
          mean.itemsPerMinute += result.itemsPerMinute;
        }
        mean.correct /= results.length;
        mean.attempted /= results.length;
        mean.itemsPerMinute /= results.length;
        mean.correct = Math.round(mean.correct);
        mean.attempted = Math.round(mean.attempted);
        mean.itemsPerMinute = Math.round(mean.itemsPerMinute);
        newRows[i].itemTypes.push(mean);
      }
    }
    return newRows;
  };

  return ProgressView;

})(Backbone.View);

SortedCollection = (function() {

  function SortedCollection(options) {
    this.sorted = [];
    this.models = options.models;
    this.attribute = options.attribute;
  }

  return SortedCollection;

})();

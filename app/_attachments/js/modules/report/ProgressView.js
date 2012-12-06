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
    var data, firstResultInItemType, i, itemType, itemTypes, key, name, part, parts, pointsByItemType, result, row, subtest, _i, _j, _k, _len, _len2, _len3, _len4, _len5, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
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
      "week": null
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
        this.benchmarkScore[itemType] = this.subtests.get(result.get("subtestId")).get("benchmarkScore") || 60;
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
        key = itemType.name.toLowerCase();
        if (!(pointsByItemType[key] != null)) pointsByItemType[key] = [];
        pointsByItemType[key].push([i + 1, itemType.itemsPerMinute]);
      }
    }
    this.flotData = [];
    this.benchmarkData = [];
    i = 0;
    for (name in pointsByItemType) {
      data = pointsByItemType[name];
      key = name.toLowerCase();
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
      firstResultInItemType = data[0][1];
      this.benchmarkData[key] = {
        "label": "Progress benchmark",
        "data": [[1, firstResultInItemType], [this.partCount, this.benchmarkScore[key]]],
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
    var html, i, itemType, row, _i, _len, _len2, _ref, _ref2;
    html = "<table class='tabular'>";
    _ref = this.rows;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      row = _ref[i];
      if (!~_.pluck(row.itemTypes, "key").indexOf(this.selected.itemType)) {
        continue;
      }
      html += "<tr><th>" + this.subtestNames[i][this.selected.itemType] + "</th><tr><tr>";
      _ref2 = row.itemTypes;
      for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
        itemType = _ref2[_i];
        if (itemType.key !== this.selected.itemType) continue;
        html += "<td>" + itemType.name + " correct</td><td>" + itemType.correct + "/" + itemType.attempted + "</td>";
        html += "<td>" + itemType.name + " per minute</td><td>" + itemType.itemsPerMinute + "</td>";
      }
    }
    html += "</table>";
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

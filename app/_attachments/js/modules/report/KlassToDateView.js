var KlassToDateView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassToDateView = (function(_super) {

  __extends(KlassToDateView, _super);

  function KlassToDateView() {
    this.afterRender = __bind(this.afterRender, this);
    KlassToDateView.__super__.constructor.apply(this, arguments);
  }

  KlassToDateView.prototype.initialize = function(options) {
    var correctItems, i, item, j, maxPart, milisecondsPerPart, result, results, resultsByPart, subtest, subtestPart, subtests, subtestsByPart, totalItems, _i, _j, _k, _len, _len2, _len3, _len4, _len5, _len6, _ref, _ref2, _ref3;
    milisecondsPerPart = 604800000;
    this.currentPart = Math.round(((new Date()).getTime() - options.klass.get("startDate")) / milisecondsPerPart);
    this.range = (function() {
      var _ref, _results;
      _results = [];
      for (i = 1, _ref = this.currentPart; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
        _results.push(i);
      }
      return _results;
    }).call(this);
    subtestsByPart = [];
    maxPart = 0;
    _ref = options.subtests;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subtest = _ref[_i];
      subtestPart = typeof subtest.get === "function" ? subtest.get("part") : void 0;
      maxPart = subtestPart;
      if (subtestsByPart[subtestPart] != null) {
        subtestsByPart[subtestPart].push(subtest);
      } else {
        subtestsByPart[subtestPart] = [subtest];
      }
    }
    resultsByPart = [];
    for (i = 0, _len2 = subtestsByPart.length; i < _len2; i++) {
      subtests = subtestsByPart[i];
      if (!(subtests != null)) continue;
      for (j = 0, _len3 = subtests.length; j < _len3; j++) {
        subtest = subtests[j];
        if (resultsByPart[i] != null) {
          resultsByPart[i] = resultsByPart[i].concat(options.results.where({
            "subtestId": subtest.id
          }));
        } else {
          resultsByPart[i] = options.results.where({
            "subtestId": subtest.id
          });
        }
      }
    }
    this.percentageCorrectByPart = [];
    this.collectionCompleteByPart = [];
    for (i = 0, _len4 = resultsByPart.length; i < _len4; i++) {
      results = resultsByPart[i];
      this.collectionCompleteByPart[i] = 0;
      this.percentageCorrectByPart[i] = 0;
      if (!(results != null)) continue;
      this.collectionCompleteByPart[i] = (results.length / (options.studentCount * subtestsByPart[i].length)) * 100;
      totalItems = 0;
      correctItems = 0;
      for (_j = 0, _len5 = results.length; _j < _len5; _j++) {
        result = results[_j];
        _ref2 = result.get("subtestData").items;
        for (_k = 0, _len6 = _ref2.length; _k < _len6; _k++) {
          item = _ref2[_k];
          if (item.itemResult === "correct") correctItems++;
          totalItems++;
        }
      }
      if (totalItems !== 0) {
        this.percentageCorrectByPart[i] = (correctItems / totalItems) * 100;
      }
    }
    j = 0;
    for (i = 1, _ref3 = this.currentPart + 1; 1 <= _ref3 ? i <= _ref3 : i >= _ref3; 1 <= _ref3 ? i++ : i--) {
      this.percentageCorrectByPart[j] = [i, this.percentageCorrectByPart[i]];
      this.collectionCompleteByPart[j] = [i, this.collectionCompleteByPart[i]];
      j++;
    }
    this.flotData = [
      {
        "label": "% Correct",
        "data": this.percentageCorrectByPart,
        "lines": {
          "show": true,
          "steps": true
        }
      }, {
        "label": "General Threshold",
        "data": [[1, Tangerine.settings.generalThreshold * 100], [this.currentPart + 1, Tangerine.settings.generalThreshold * 100]],
        "lines": {
          "show": true
        }
      }
    ];
    /*{ 
      "label": "% Collected"
      "data": @collectionCompleteByPart
      "lines" :
        "show":true
        "steps": true
    }*/;
    return this.flotOptions = {
      "yaxis": {
        min: 0,
        max: 100,
        ticks: 10
      },
      "xaxis": {
        ticks: (function() {
          var _ref4, _results;
          _results = [];
          for (i = 1, _ref4 = this.currentPart; 1 <= _ref4 ? i <= _ref4 : i >= _ref4; 1 <= _ref4 ? i++ : i--) {
            _results.push(String(i));
          }
          return _results;
        }).call(this),
        tickDecimals: 0
      }
    };
  };

  KlassToDateView.prototype.render = function() {
    var lineColor;
    this.$el.html("      <h1>" + (t('class progress report')) + "</h1>      <div id='chart' style='width:450px; height:300px;'></div>    ");
    this.trigger("rendered");
    return lineColor = "#BDDC93";
  };

  KlassToDateView.prototype.afterRender = function() {
    return $.plot(this.$el.find("#chart"), this.flotData, this.flotOptions);
  };

  return KlassToDateView;

})(Backbone.View);

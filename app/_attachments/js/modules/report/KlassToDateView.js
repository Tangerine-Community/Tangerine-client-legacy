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
    var correctItems, i, item, j, maxWeek, milisecondsPerWeek, result, results, resultsByWeek, subtest, subtestWeek, subtests, subtestsByWeek, totalItems, _i, _j, _k, _len, _len2, _len3, _len4, _len5, _len6, _ref, _ref2, _results;
    milisecondsPerWeek = 604800000;
    this.currentWeek = Math.round(((new Date()).getTime() - options.klass.get("startDate")) / milisecondsPerWeek);
    this.range = (function() {
      var _ref, _results;
      _results = [];
      for (i = 1, _ref = this.currentWeek; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
        _results.push(i);
      }
      return _results;
    }).call(this);
    subtestsByWeek = [];
    maxWeek = 0;
    _ref = options.subtests;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subtest = _ref[_i];
      subtestWeek = typeof subtest.get === "function" ? subtest.get("week") : void 0;
      maxWeek = subtestWeek;
      if (subtestsByWeek[subtestWeek] != null) {
        subtestsByWeek[subtestWeek].push(subtest);
      } else {
        subtestsByWeek[subtestWeek] = [subtest];
      }
    }
    resultsByWeek = [];
    for (i = 0, _len2 = subtestsByWeek.length; i < _len2; i++) {
      subtests = subtestsByWeek[i];
      if (!(subtests != null)) continue;
      for (j = 0, _len3 = subtests.length; j < _len3; j++) {
        subtest = subtests[j];
        if (resultsByWeek[i] != null) {
          resultsByWeek[i] = resultsByWeek[i].concat(options.results.where({
            "subtestId": subtest.id
          }));
        } else {
          resultsByWeek[i] = options.results.where({
            "subtestId": subtest.id
          });
        }
      }
    }
    this.percentageCorrectByWeek = [];
    this.collectionCompleteByWeek = [];
    _results = [];
    for (i = 0, _len4 = resultsByWeek.length; i < _len4; i++) {
      results = resultsByWeek[i];
      this.collectionCompleteByWeek[i] = 0;
      this.percentageCorrectByWeek[i] = 0;
      if (!(results != null)) continue;
      if (results.length !== 0) {
        this.collectionCompleteByWeek[i] = (results.length / (options.studentCount * subtestsByWeek.length)) * 100;
      }
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
        _results.push(this.percentageCorrectByWeek[i] = (correctItems / totalItems) * 100);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  KlassToDateView.prototype.render = function() {
    var lineColor;
    this.$el.html("      <h1>Class to date</h1>      <div id='chart' style='width:450px; height:300px;'></div>    ");
    this.trigger("rendered");
    return lineColor = "#BDDC93";
  };

  KlassToDateView.prototype.afterRender = function() {
    return $.plot(this.$el.find("#chart"), [this.collectionCompleteByWeek.slice(1, this.currentWeek + 1 || 9e9), this.percentageCorrectByWeek.slice(1, this.currentWeek + 1 || 9e9)]);
  };

  return KlassToDateView;

})(Backbone.View);

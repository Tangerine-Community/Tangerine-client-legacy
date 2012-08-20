var KlassToDateView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassToDateView = (function(_super) {

  __extends(KlassToDateView, _super);

  function KlassToDateView() {
    KlassToDateView.__super__.constructor.apply(this, arguments);
  }

  KlassToDateView.prototype.initialize = function(options) {
    var correctItems, i, itemResult, j, maxWeek, milisecondsPerWeek, result, results, resultsByWeek, subtest, subtestWeek, subtests, subtestsByWeek, totalItems, _i, _j, _k, _len, _len2, _len3, _len4, _len5, _len6, _ref, _ref2, _results;
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
        if (!(result.get != null)) continue;
        _ref2 = result.get("subtestData").items;
        for (_k = 0, _len6 = _ref2.length; _k < _len6; _k++) {
          itemResult = _ref2[_k];
          if (itemResult === "correct") correctItems++;
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
    var html, i, lineColor, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
    html = "      <h1>Class to date</h1>    ";
    html += "    <table id='chart'>    <caption>Wicked chart</caption>    <thead>      <tr>      ";
    _ref = this.range;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      html += "<th scope='col'>" + i + "</th>";
    }
    html += "    </tr>    </thead>    <tbody>      <tr>        <th scope='row'>Collection Complete</th>";
    _ref2 = this.range;
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      i = _ref2[_j];
      html += "<td>" + this.collectionCompleteByWeek[i] + "</td>";
    }
    html += "      </tr>      <tr>        <th scope='row'>Percentage Correct</th>";
    _ref3 = this.range;
    for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
      i = _ref3[_k];
      html += "<td>" + this.percentageCorrectByWeek[i] + "</td>";
    }
    html += "      </tr>    </tbody>    </table>    ";
    this.$el.html(html);
    this.trigger("rendered");
    return lineColor = "#BDDC93";
  };

  KlassToDateView.prototype.afterRender = function() {
    this.$el.find('#chart').visualize({
      "type": "line"
    });
    return this.$el.find('#chart').hide();
  };

  return KlassToDateView;

})(Backbone.View);

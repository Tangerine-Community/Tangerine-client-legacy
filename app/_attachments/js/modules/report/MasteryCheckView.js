// Generated by CoffeeScript 1.3.3
var MasteryCheckView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MasteryCheckView = (function(_super) {

  __extends(MasteryCheckView, _super);

  function MasteryCheckView() {
    return MasteryCheckView.__super__.constructor.apply(this, arguments);
  }

  MasteryCheckView.prototype.initialize = function(options) {
    var bucketList, milisecondsPerPart, part, result, _i, _len, _ref;
    this.results = options.results;
    this.student = options.student;
    this.klass = options.klass;
    this.resultsByPart = [];
    bucketList = {};
    _ref = this.results.models;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      result = _ref[_i];
      bucketList[result.get("resultBucket")] = true;
      part = result.get("part");
      if (!(this.resultsByPart[part] != null)) {
        this.resultsByPart[part] = [];
      }
      this.resultsByPart[part].push(result);
      this.resultsByPart[part].sort(function(a, b) {
        return a.attributes.reportType < b.attributes.reportType;
      });
    }
    bucketList = _.keys(bucketList);
    milisecondsPerPart = 604800000;
    return this.currentPart = Math.round(((new Date()).getTime() - this.klass.get("startDate")) / milisecondsPerPart);
  };

  MasteryCheckView.prototype.render = function() {
    var bucketName, bucketResult, correct, html, item, part, total, _i, _j, _k, _len, _len1, _ref, _ref1, _ref2;
    html = "      <h1>Mastery check report</h1>      <h2>" + (this.student.get("name")) + "</h2>      <table class='mastery_check'>    ";
    for (part = _i = 1, _ref = this.currentPart; 1 <= _ref ? _i <= _ref : _i >= _ref; part = 1 <= _ref ? ++_i : --_i) {
      if (this.resultsByPart[part] === void 0) {
        continue;
      }
      html += "<tr>";
      html += "<td>Week</td><td>" + part + "</td>";
      _ref1 = this.resultsByPart[part];
      for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
        bucketResult = _ref1[_j];
        bucketName = bucketResult.attributes.resultBucket.titleize();
        correct = 0;
        _ref2 = bucketResult.attributes.subtestData.items;
        for (_k = 0, _len1 = _ref2.length; _k < _len1; _k++) {
          item = _ref2[_k];
          if (item.itemResult === "correct") {
            correct++;
          }
        }
        total = bucketResult.attributes.subtestData.items.length;
        html += "<td>" + bucketName + " correct</td><td>" + correct + "/" + total + "</td>";
      }
    }
    html += "</table>";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return MasteryCheckView;

})(Backbone.View);
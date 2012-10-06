var ProgressView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ProgressView = (function(_super) {

  __extends(ProgressView, _super);

  function ProgressView() {
    ProgressView.__super__.constructor.apply(this, arguments);
  }

  ProgressView.prototype.initialize = function(options) {
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
      if (!(this.resultsByPart[part] != null)) this.resultsByPart[part] = [];
      this.resultsByPart[part].push(result);
      this.resultsByPart[part].sort(function(a, b) {
        return a.attributes.reportType < b.attributes.reportType;
      });
    }
    bucketList = _.keys(bucketList);
    milisecondsPerPart = 604800000;
    return this.currentPart = Math.round(((new Date()).getTime() - this.klass.get("startDate")) / milisecondsPerPart);
  };

  ProgressView.prototype.render = function() {
    var attempted, bucketName, bucketResult, correct, html, item, itemsPerMinute, part, timeAllowed, timeRemain, _i, _j, _len, _len2, _ref, _ref2, _ref3;
    html = "      <h1>Progress table</h1>      <h2>" + (this.student.get("name")) + "</h2>      <table class='mastery_check'>    ";
    for (part = 1, _ref = this.currentPart; 1 <= _ref ? part <= _ref : part >= _ref; 1 <= _ref ? part++ : part--) {
      if (this.resultsByPart[part] === void 0) continue;
      html += "<tr>";
      html += "<td>Week</td><td>" + part + "</td>";
      _ref2 = this.resultsByPart[part];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        bucketResult = _ref2[_i];
        bucketName = bucketResult.attributes.resultBucket.titleize();
        correct = 0;
        _ref3 = bucketResult.attributes.subtestData.items;
        for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
          item = _ref3[_j];
          if (item.itemResult === "correct") correct++;
        }
        attempted = bucketResult.attributes.subtestData.attempted;
        timeRemain = bucketResult.attributes.subtestData.time_remain;
        timeAllowed = 60;
        itemsPerMinute = Math.round((correct / (timeAllowed - timeRemain)) * timeAllowed);
        html += "<td>" + bucketName + " correct</td><td>" + correct + "/" + attempted + "</td>";
        html += "<td>" + bucketName + " per minute</td><td>" + itemsPerMinute + "</td>";
      }
    }
    html += "</table>";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return ProgressView;

})(Backbone.View);

var AssessmentPrintView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentPrintView = (function(_super) {

  __extends(AssessmentPrintView, _super);

  function AssessmentPrintView() {
    AssessmentPrintView.__super__.constructor.apply(this, arguments);
  }

  AssessmentPrintView.prototype.initialize = function(options) {
    var _this = this;
    this.abortAssessment = false;
    this.index = 0;
    this.model = options.model;
    Tangerine.activity = "assessment print";
    this.subtestViews = [];
    this.model.subtests.sort();
    return this.model.subtests.each(function(model) {
      return _this.subtestViews.push(new SubtestPrintView({
        model: model,
        parent: _this
      }));
    });
  };

  AssessmentPrintView.prototype.render = function() {
    var _this = this;
    if (this.model.subtests.length === 0) {
      this.$el.append("<h1>Oops...</h1><p>This assessment is blank. Perhaps you meant to add some subtests.</p>");
    } else {
      _.each(this.subtestViews, function(subtestView) {
        subtestView.render();
        return _this.$el.append(subtestView.el);
      });
    }
    return this.trigger("rendered");
  };

  return AssessmentPrintView;

})(Backbone.View);

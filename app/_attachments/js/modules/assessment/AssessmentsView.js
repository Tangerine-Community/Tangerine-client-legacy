var AssessmentsView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentsView = (function(_super) {

  __extends(AssessmentsView, _super);

  function AssessmentsView() {
    AssessmentsView.__super__.constructor.apply(this, arguments);
  }

  AssessmentsView.prototype.tagName = "ul";

  AssessmentsView.prototype.initialize = function(options) {
    this.group = options.group;
    this.allAssessments = options.allAssessments;
    this.parent = options.parent;
    return this.refresh();
  };

  AssessmentsView.prototype.refresh = function(doRender) {
    var assessment;
    if (doRender == null) doRender = false;
    if (this.group === false) {
      this.assessments = this.allAssessments;
    } else {
      this.assessments = new Assessments(this.allAssessments.where({
        "group": this.options.group
      }));
    }
    this.closeViews();
    this.assessmentViews = (function() {
      var _i, _len, _ref, _results;
      _ref = this.assessments.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        assessment = _ref[_i];
        _results.push(new AssessmentListElementView({
          "model": assessment,
          "parent": this
        }));
      }
      return _results;
    }).call(this);
    if (doRender) return this.render();
  };

  AssessmentsView.prototype.render = function() {
    var view, _i, _len, _ref;
    if (this.assessmentViews.length === 0) {
      this.$el.html("<p class='grey'>No assessments yet. Click <b>new</b> to start making one.</p>");
    } else {
      _ref = this.assessmentViews;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        view = _ref[_i];
        view.render();
        this.$el.append(view.el);
      }
    }
    return this.trigger("rendered");
  };

  AssessmentsView.prototype.closeViews = function() {
    var view, _i, _len, _ref, _results;
    if (this.assessmentViews != null) {
      _ref = this.assessmentViews;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        view = _ref[_i];
        _results.push(view.close());
      }
      return _results;
    }
  };

  AssessmentsView.prototype.onClose = function() {
    return this.closeViews();
  };

  return AssessmentsView;

})(Backbone.View);

var AssessmentsView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentsView = (function(_super) {

  __extends(AssessmentsView, _super);

  function AssessmentsView() {
    AssessmentsView.__super__.constructor.apply(this, arguments);
  }

  AssessmentsView.prototype.tagName = "ul";

  AssessmentsView.prototype.events = {
    "click .hidden_toggle": "toggleHidden"
  };

  AssessmentsView.prototype.toggleHidden = function() {
    var $container;
    $container = this.$el.find(".hidden_container");
    if ($container.is(":visible")) {
      $container.fadeOut(150);
      return this.$el.find(".hidden_toggle").html("Show");
    } else {
      $container.fadeIn(150);
      return this.$el.find(".hidden_toggle").html("Hide");
    }
  };

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
      this.assessments.filter(function(a) {
        return a.get("archived") === "false" || a.get("archived") === false;
      });
      this.hidden = new Assessments(this.allAssessments.where({
        "group": this.options.group,
        "archived": true
      }));
      this.hidden.filter(function(a) {
        return a.get("archived") === "true" || a.get("archived") === true;
      });
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
    this.hiddenViews = (function() {
      var _i, _len, _ref, _results;
      _ref = this.hidden.models;
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
    var view, _i, _j, _len, _len2, _ref, _ref2;
    if (this.assessmentViews.length === 0) {
      this.$el.html("<p class='grey'>No assessments yet. Click <b>new</b> to start making one.</p>");
    } else {
      this.$el.html("");
      _ref = this.assessmentViews;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        view = _ref[_i];
        view.render();
        this.$el.append(view.el);
      }
      if (this.hiddenViews.length !== 0) {
        this.$el.append("<h2>Archived (" + this.hiddenViews.length + ") <button class='command hidden_toggle'>Show</button></h2><div class='hidden_container confirmation'></div>");
        _ref2 = this.hiddenViews;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          view = _ref2[_j];
          view.render();
          this.$el.find(".hidden_container").append(view.el);
        }
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

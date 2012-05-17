var AssessmentRunView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentRunView = (function(_super) {

  __extends(AssessmentRunView, _super);

  function AssessmentRunView() {
    this.restart = __bind(this.restart, this);
    AssessmentRunView.__super__.constructor.apply(this, arguments);
  }

  AssessmentRunView.prototype.initialize = function(options) {
    var resultView,
      _this = this;
    this.abortAssessment = false;
    this.index = 0;
    this.model = options.model;
    this.result = new Result({
      assessmentId: this.model.id,
      assessmentName: this.model.get("name")
    });
    this.subtestViews = [];
    this.model.subtests.sort();
    this.model.subtests.each(function(model) {
      return _this.subtestViews.push(new SubtestRunView({
        model: model,
        parent: _this
      }));
    });
    resultView = new ResultView({
      model: this.result,
      assessment: this.model,
      assessmentView: this
    });
    resultView.on("assessment:restart", this.restart);
    return this.subtestViews.push(resultView);
  };

  AssessmentRunView.prototype.render = function() {
    var currentView;
    currentView = this.subtestViews[this.index];
    if (this.model.subtests.length === 0) {
      this.$el.append("<h1>Oops...</h1><p>This assessment is blank. Perhaps you meant to add some subtests.</p>");
    } else {
      this.$el.html("        <h1>" + (this.model.get('name')) + "</h1>        <div id='progress'></div>      ");
      this.$el.find('#progress').progressbar({
        value: (this.index + 1) / (this.model.subtests.length + 1) * 100
      });
      currentView.render();
      this.$el.append(currentView.el);
    }
    return this.trigger("rendered");
  };

  AssessmentRunView.prototype.onClose = function() {
    var view, _i, _len, _ref;
    _ref = this.subtestViews;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      view.close();
    }
    this.result.clear();
    $("#current_student_id").fadeOut(250, function() {
      return $(this).html("");
    });
    return $("#current_student").fadeOut(250);
  };

  AssessmentRunView.prototype.abort = function() {
    this.abortAssessment = true;
    return this.next();
  };

  AssessmentRunView.prototype.restart = function() {
    return alert('assessment restart not implemented');
  };

  AssessmentRunView.prototype.next = function() {
    var currentView;
    currentView = this.subtestViews[this.index];
    if (currentView.isValid()) {
      this.result.add({
        name: currentView.model.get("name"),
        data: currentView.getResult(),
        subtestId: currentView.model.id,
        sum: currentView.getSum()
      });
      currentView.close();
      if (this.abortAssessment !== true) this.index++;
      if (this.abortAssessment === true) this.index = this.subtestViews.length - 1;
      this.render();
      return window.scrollTo(0, 0);
    } else {
      return currentView.showErrors();
    }
  };

  return AssessmentRunView;

})(Backbone.View);

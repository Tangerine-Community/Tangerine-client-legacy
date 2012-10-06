var AssessmentRunView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentRunView = (function(_super) {

  __extends(AssessmentRunView, _super);

  function AssessmentRunView() {
    AssessmentRunView.__super__.constructor.apply(this, arguments);
  }

  AssessmentRunView.prototype.initialize = function(options) {
    var hasSequences, i, resultView, sequences, _ref,
      _this = this;
    this.abortAssessment = false;
    this.index = 0;
    this.model = options.model;
    this.orderMap = [];
    Tangerine.activity = "assessment run";
    this.subtestViews = [];
    this.model.subtests.sort();
    this.model.subtests.each(function(model) {
      return _this.subtestViews.push(new SubtestRunView({
        model: model,
        parent: _this
      }));
    });
    hasSequences = this.model.has("sequences") && !_.isEmpty(_.compact(_.flatten(this.model.get("sequences"))));
    if (hasSequences) {
      sequences = this.model.get("sequences");
      this.orderMap = sequences[Math.floor(Math.random() * sequences.length)];
      this.orderMap[this.orderMap.length] = this.orderMap.length;
    } else {
      for (i = 0, _ref = this.subtestViews.length; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        this.orderMap[i] = i;
      }
    }
    this.result = new Result({
      assessmentId: this.model.id,
      assessmentName: this.model.get("name"),
      blank: true
    });
    if (hasSequences) {
      this.result.set({
        "order_map": this.orderMap
      });
    }
    resultView = new ResultView({
      model: this.result,
      assessment: this.model,
      assessmentView: this
    });
    return this.subtestViews.push(resultView);
  };

  AssessmentRunView.prototype.render = function() {
    var currentView,
      _this = this;
    currentView = this.subtestViews[this.orderMap[this.index]];
    if (this.model.subtests.length === 0) {
      this.$el.append("<h1>Oops...</h1><p>This assessment is blank. Perhaps you meant to add some subtests.</p>");
    } else {
      this.$el.html("        <h1>" + (this.model.get('name')) + "</h1>        <div id='progress'></div>      ");
      this.$el.find('#progress').progressbar({
        value: (this.index + 1) / (this.model.subtests.length + 1) * 100
      });
      currentView.on("rendered", function() {
        return _this.trigger("rendered");
      });
      currentView.on("subRendered", function() {
        return _this.trigger("subRendered");
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
      return $(this).html("").show();
    });
    return $("#current_student").fadeOut(250);
  };

  AssessmentRunView.prototype.abort = function() {
    this.abortAssessment = true;
    return this.next();
  };

  AssessmentRunView.prototype.skip = function() {
    var currentView;
    currentView = this.subtestViews[this.orderMap[this.index]];
    this.result.add({
      name: currentView.model.get("name"),
      data: currentView.getSkipped(),
      subtestId: currentView.model.id,
      skipped: true,
      prototype: currentView.model.get("prototype"),
      sum: currentView.getSum()
    });
    currentView.close();
    if (this.abortAssessment !== true) this.index++;
    if (this.abortAssessment === true) this.index = this.subtestViews.length - 1;
    this.render();
    return window.scrollTo(0, 0);
  };

  AssessmentRunView.prototype.next = function() {
    var currentView;
    currentView = this.subtestViews[this.orderMap[this.index]];
    if (currentView.isValid()) {
      this.result.add({
        name: currentView.model.get("name"),
        data: currentView.getResult(),
        subtestId: currentView.model.id,
        prototype: currentView.model.get("prototype"),
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

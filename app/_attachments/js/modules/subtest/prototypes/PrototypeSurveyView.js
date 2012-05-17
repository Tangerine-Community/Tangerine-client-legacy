var PrototypeSurveyView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

PrototypeSurveyView = (function(_super) {

  __extends(PrototypeSurveyView, _super);

  function PrototypeSurveyView() {
    PrototypeSurveyView.__super__.constructor.apply(this, arguments);
  }

  PrototypeSurveyView.prototype.initialize = function(options) {
    var questions,
      _this = this;
    this.model = this.options.model;
    this.parent = this.options.parent;
    this.questionViews = [];
    this.questions = [];
    questions = new Questions;
    return questions.fetch({
      success: function(collection) {
        var filteredCollection;
        filteredCollection = collection.where({
          subtestId: _this.model.id
        });
        _this.questions = new Questions(filteredCollection);
        _this.questions.sort();
        return _this.render();
      }
    });
  };

  PrototypeSurveyView.prototype.isValid = function() {
    var i, qv, _len, _ref;
    _ref = this.questionViews;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      qv = _ref[i];
      if (qv.isValid != null) {
        if (!(qv.model.get("skippable") === "true" || qv.model.get("skippable") === true)) {
          if (!qv.isValid) return false;
        }
      }
    }
    return true;
  };

  PrototypeSurveyView.prototype.getResult = function() {
    var i, qv, result, _len, _ref;
    result = {};
    _ref = this.questionViews;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      qv = _ref[i];
      if (_.isString(qv)) {
        result[this.questions.models[i].get("name")] === qv;
      } else {
        result = $.extend(result, qv.result);
      }
    }
    return result;
  };

  PrototypeSurveyView.prototype.getSum = function() {
    var counts, i, qv, _len, _ref;
    counts = {
      correct: 0,
      incorrect: 0,
      missing: 0,
      total: 0
    };
    _ref = this.questionViews;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      qv = _ref[i];
      if (_.isString(qv)) {
        counts.missing++;
      } else {
        if (qv.isValid) counts['correct'] += 1;
        if (!qv.isValid) counts['incorrect'] += 1;
        if (!qv.isValid && (qv.model.get("skippable" === 'true' || qv.model.get("skippable" === true)))) {
          counts['missing'] += 1;
        }
        if (true) counts['total'] += 1;
      }
    }
    return {
      correct: counts['correct'],
      incorrect: counts['incorrect'],
      missing: counts['missing'],
      total: counts['total']
    };
  };

  PrototypeSurveyView.prototype.showErrors = function() {
    var first, i, message, qv, _len, _ref, _results;
    this.$el.find('.message').remove();
    first = true;
    _ref = this.questionViews;
    _results = [];
    for (i = 0, _len = _ref.length; i < _len; i++) {
      qv = _ref[i];
      if (!_.isString(qv)) {
        message = "";
        if (!qv.isValid) {
          message = "Please answer this question";
          if (first === true) {
            qv.$el.scrollTo();
            Utils.midAlert("Please correct the errors on this page");
            first = false;
          }
        }
        _results.push(qv.setMessage(message));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  PrototypeSurveyView.prototype.render = function() {
    var i, oneView, question, required, _len, _ref;
    this.questions.sort();
    if (this.questions.models != null) {
      _ref = this.questions.models;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        question = _ref[i];
        required = parseInt(question.get("linkedGridScore")) || 0;
        if (required !== 0 && this.parent.getGridScore() < required) {
          this.questionViews[i] = "not_asked";
        } else {
          oneView = new QuestionView({
            model: question,
            parent: this
          });
          oneView.render();
          this.questionViews[i] = oneView;
          this.$el.append(oneView.el);
        }
      }
    }
    return this.trigger("rendered");
  };

  PrototypeSurveyView.prototype.onClose = function() {
    var qv, _i, _len, _ref;
    _ref = this.questionViews;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      qv = _ref[_i];
      qv.close();
    }
    return this.questionViews = [];
  };

  return PrototypeSurveyView;

})(Backbone.View);

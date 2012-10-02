var ResultOfQuestion, SurveyRunView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ResultOfQuestion = function(name) {
  return $("#question-" + name).attr("data-result");
};

SurveyRunView = (function(_super) {

  __extends(SurveyRunView, _super);

  function SurveyRunView() {
    this.onQuestionRendered = __bind(this.onQuestionRendered, this);
    this.getResult = __bind(this.getResult, this);
    this.updateSkipLogic = __bind(this.updateSkipLogic, this);
    this.onQuestionAnswer = __bind(this.onQuestionAnswer, this);
    SurveyRunView.__super__.constructor.apply(this, arguments);
  }

  SurveyRunView.prototype.events = {
    'change input': 'updateSkipLogic',
    'change textarea': 'updateSkipLogic'
  };

  SurveyRunView.prototype.initialize = function(options) {
    var _this = this;
    this.model = this.options.model;
    this.parent = this.options.parent;
    this.isObservation = this.options.isObservation;
    this.questionViews = [];
    this.answered = [];
    this.questions = new Questions;
    return this.questions.fetch({
      key: this.model.get("assessmentId"),
      success: function(collection) {
        _this.questions = new Questions(_this.questions.where({
          subtestId: _this.model.id
        }));
        _this.questions.sort();
        return _this.render();
      }
    });
  };

  SurveyRunView.prototype.onQuestionAnswer = function(event) {
    var cid, next, view, _i, _len, _ref, _results;
    if (this.isObservation) {
      cid = $(event.target).attr("data-cid");
      _ref = this.questionViews;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        view = _ref[_i];
        if (view.cid === cid && view.type !== "multiple") {
          next = $(view.el).next();
          while (next.length !== 0 && next.hasClass("disabled_skipped")) {
            next = $(next).next();
          }
          if (next.length !== 0) {
            _results.push(next.scrollTo());
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  SurveyRunView.prototype.updateSkipLogic = function() {
    this.questions.each(function(question) {
      var result, skipLogic;
      skipLogic = question.get("skipLogic");
      if (skipLogic != null) {
        result = CoffeeScript.eval("" + skipLogic);
        if (result) {
          return $("#question-" + (question.get("name"))).addClass("disabled_skipped");
        } else {
          return $("#question-" + (question.get("name"))).removeClass("disabled_skipped");
        }
      }
    });
    return _.each(this.questionViews, function(questionView) {
      return questionView.updateValidity();
    });
  };

  SurveyRunView.prototype.isValid = function() {
    var i, qv, _len, _ref;
    _ref = this.questionViews;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      qv = _ref[i];
      qv.updateValidity();
      if (qv.isValid != null) {
        if (!(qv.model.get("skippable") === "true" || qv.model.get("skippable") === true)) {
          if (!qv.isValid) return false;
        }
      }
    }
    return true;
  };

  SurveyRunView.prototype.getSkipped = function() {
    var i, qv, result, _len, _ref;
    result = {};
    _ref = this.questionViews;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      qv = _ref[i];
      result[this.questions.models[i].get("name")] = "skipped";
    }
    return result;
  };

  SurveyRunView.prototype.getResult = function() {
    var i, qv, result, _len, _ref;
    result = {};
    _ref = this.questionViews;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      qv = _ref[i];
      result[this.questions.models[i].get("name")] = qv.notAsked ? qv.notAskedResult : !_.isEmpty(qv.answer) ? qv.answer : qv.skipped ? qv.skippedResult : qv.$el.hasClass("disabled_skipped") ? qv.logicSkippedResult : qv.answer;
    }
    return result;
  };

  SurveyRunView.prototype.getSum = function() {
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

  SurveyRunView.prototype.showErrors = function() {
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

  SurveyRunView.prototype.render = function() {
    var i, isNotAsked, notAskedCount, oneView, question, required, _base, _len, _ref;
    notAskedCount = 0;
    this.questions.sort();
    if (this.questions.models != null) {
      _ref = this.questions.models;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        question = _ref[i];
        required = parseInt(question.get("linkedGridScore")) || 0;
        isNotAsked = (required !== 0 && this.parent.getGridScore() < required) || this.parent.gridWasAutostopped();
        if (isNotAsked) notAskedCount++;
        oneView = new QuestionRunView({
          model: question,
          parent: this,
          notAsked: isNotAsked,
          isObservation: this.isObservation
        });
        oneView.on("rendered", this.onQuestionRendered);
        oneView.on("answer scroll", this.onQuestionAnswer);
        oneView.render();
        this.questionViews[i] = oneView;
        this.$el.append(oneView.el);
      }
    }
    this.updateSkipLogic();
    if (this.questions.length === notAskedCount) {
      if (typeof (_base = this.parent).next === "function") _base.next();
    }
    return this.trigger("rendered");
  };

  SurveyRunView.prototype.onQuestionRendered = function() {
    return this.trigger("subRendered");
  };

  SurveyRunView.prototype.onClose = function() {
    var qv, _i, _len, _ref;
    _ref = this.questionViews;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      qv = _ref[_i];
      if (typeof qv.close === "function") qv.close();
    }
    return this.questionViews = [];
  };

  return SurveyRunView;

})(Backbone.View);

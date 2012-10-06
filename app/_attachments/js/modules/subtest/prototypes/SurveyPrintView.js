var SurveyPrintView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SurveyPrintView = (function(_super) {

  __extends(SurveyPrintView, _super);

  function SurveyPrintView() {
    this.onQuestionRendered = __bind(this.onQuestionRendered, this);
    SurveyPrintView.__super__.constructor.apply(this, arguments);
  }

  SurveyPrintView.prototype.initialize = function(options) {
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

  SurveyPrintView.prototype.render = function() {
    var i, notAskedCount, oneView, question, _base, _len, _ref;
    notAskedCount = 0;
    this.questions.sort();
    if (this.questions.models != null) {
      _ref = this.questions.models;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        question = _ref[i];
        oneView = new QuestionPrintView({
          model: question,
          parent: this,
          isObservation: this.isObservation
        });
        oneView.on("rendered", this.onQuestionRendered);
        oneView.render();
        this.questionViews[i] = oneView;
        this.$el.append(oneView.el);
      }
    }
    if (this.questions.length === notAskedCount) {
      if (typeof (_base = this.parent).next === "function") _base.next();
    }
    return this.trigger("rendered");
  };

  SurveyPrintView.prototype.onQuestionRendered = function() {
    return this.trigger("subRendered");
  };

  return SurveyPrintView;

})(Backbone.View);

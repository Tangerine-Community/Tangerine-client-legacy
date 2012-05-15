var QuestionsEditView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

QuestionsEditView = (function(_super) {

  __extends(QuestionsEditView, _super);

  function QuestionsEditView() {
    QuestionsEditView.__super__.constructor.apply(this, arguments);
  }

  QuestionsEditView.prototype.tagName = "ul";

  QuestionsEditView.prototype.className = "questions_edit_view";

  QuestionsEditView.prototype.initialize = function(options) {
    var i, question, _len, _ref, _results;
    this.views = [];
    this.questions = options.questions;
    this.isPreview = [];
    this.views = [];
    _ref = this.questions.models;
    _results = [];
    for (i = 0, _len = _ref.length; i < _len; i++) {
      question = _ref[i];
      this.isPreview[i] = true;
      _results.push(this.views.push(new QuestionEditView({
        model: question,
        parent: this,
        index: i,
        isPreview: this.isPreview[i]
      })));
    }
    return _results;
  };

  QuestionsEditView.prototype.render = function() {
    var i, view, _len, _ref;
    _ref = this.views;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      view = _ref[i];
      view.render(this.isPreview[i]);
      this.$el.append(view.el);
    }
    return console.log(this.el);
  };

  return QuestionsEditView;

})(Backbone.View);

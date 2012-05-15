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

  QuestionsEditView.prototype.events = {
    'click .edit': 'edit'
  };

  QuestionsEditView.prototype.edit = function(event) {
    var id;
    id = $(event.target).parent().attr('data-id');
    Tangerine.router.navigate("question/" + id, true);
    return false;
  };

  QuestionsEditView.prototype.initialize = function(options) {
    this.questions = options.questions;
    return console.log(this.questions);
  };

  QuestionsEditView.prototype.render = function() {
    var html, i, question, _len, _ref,
      _this = this;
    html = "";
    _ref = this.questions.models;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      question = _ref[i];
      html += "        <li class='question_list_element' data-id='" + question.id + "'>          <img src='images/icon_drag.png' class='sortable_handle'><span>" + (question.get('prompt')) + "</span> <span>[" + (question.get('name')) + "]</span> <button class='edit command'>Edit</button>        </li>      ";
    }
    this.$el.html(html);
    return this.$el.sortable({
      handle: '.sortable_handle',
      update: function(event, ui) {
        var i, id, li, oneQuestion, _len2, _ref2, _results;
        _ref2 = (function() {
          var _i, _len2, _ref2, _results2;
          _ref2 = this.$el.find("li.question_list_element");
          _results2 = [];
          for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
            li = _ref2[_i];
            _results2.push($(li).attr("data-id"));
          }
          return _results2;
        }).call(_this);
        _results = [];
        for (i = 0, _len2 = _ref2.length; i < _len2; i++) {
          id = _ref2[i];
          oneQuestion = _this.questions.get(id);
          _results.push(_this.questions.get(id).set({
            "order": i
          }, {
            silent: true
          }).save(null, {
            silent: true
          }));
        }
        return _results;
      }
    });
  };

  return QuestionsEditView;

})(Backbone.View);

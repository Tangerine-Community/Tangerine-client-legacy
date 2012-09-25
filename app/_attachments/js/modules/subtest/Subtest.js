var Subtest,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Subtest = (function(_super) {

  __extends(Subtest, _super);

  function Subtest() {
    Subtest.__super__.constructor.apply(this, arguments);
  }

  Subtest.prototype.url = "subtest";

  Subtest.prototype.initialize = function(options) {
    this.templates = Tangerine.templates.prototypeTemplates;
    if (this.has("surveyAttributes")) {
      if (this.get("assessmentId") !== this.get("surveyAttributes").assessmentId) {
        return this.save("surveyAttributes", {
          "_id": this.id,
          "assessmentId": this.get("assessmentId")
        });
      }
    }
  };

  Subtest.prototype.loadPrototypeTemplate = function(prototype) {
    var key, value, _ref;
    _ref = this.templates[prototype];
    for (key in _ref) {
      value = _ref[key];
      this.set(key, value);
    }
    return this.save();
  };

  Subtest.prototype.copyTo = function(assessmentId) {
    var newId, newSubtest, questions,
      _this = this;
    newSubtest = this.clone();
    newId = Utils.guid();
    if (newSubtest.has("surveyAttributes")) {
      newSubtest.set("surveyAttributes", {
        "_id": newId,
        "assessmentId": assessmentId
      });
    }
    newSubtest.save({
      "_id": newId,
      "assessmentId": assessmentId,
      "order": 0,
      "gridLinkId": ""
    });
    questions = new Questions;
    return questions.fetch({
      key: this.get("assessmentId"),
      success: function(questionCollection) {
        var newQuestion, question, subtestQuestions, _i, _len;
        subtestQuestions = questionCollection.where({
          "subtestId": _this.id
        });
        for (_i = 0, _len = subtestQuestions.length; _i < _len; _i++) {
          question = subtestQuestions[_i];
          newQuestion = question.clone();
          newQuestion.save({
            "assessmentId": assessmentId,
            "_id": Utils.guid(),
            "subtestId": newId
          });
        }
        Tangerine.router.navigate("edit/" + assessmentId, true);
        return Utils.midAlert("Subtest copied");
      }
    });
  };

  return Subtest;

})(Backbone.Model);

var Assessment,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Assessment = (function(_super) {

  __extends(Assessment, _super);

  function Assessment() {
    this.superFetch = __bind(this.superFetch, this);
    Assessment.__super__.constructor.apply(this, arguments);
  }

  Assessment.prototype.url = 'assessment';

  Assessment.prototype.defaults = {
    name: "Untitled",
    group: "default"
  };

  Assessment.prototype.initialize = function(options) {
    if (options == null) options = {};
    return this.subtests = new Subtests;
  };

  Assessment.prototype.fetch = function(options) {
    var allAssessments,
      _this = this;
    if (options.name != null) options.name = Utils.cleanURL(options.name);
    allAssessments = new Assessments;
    return allAssessments.fetch({
      success: function(collection) {
        var allSubtests, assessment, results, _i, _len;
        results = collection.where({
          "name": options.name
        });
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          assessment = results[_i];
          if (Tangerine.context.server) {
            if (~Tangerine.user.get("groups").indexOf(assessment.get("group"))) {
              _this.constructor(assessment.attributes);
            }
          } else {
            _this.constructor(assessment.attributes);
          }
        }
        allSubtests = new Subtests;
        return allSubtests.fetch({
          key: _this.id,
          success: function(collection) {
            _this.subtests = collection.models;
            _this.subtests.maintainOrder();
            return options.success(_this);
          }
        });
      }
    });
  };

  Assessment.prototype.superFetch = function(options) {
    var _this = this;
    return Assessment.__super__.fetch.call(this, {
      success: function(model) {
        var allSubtests;
        allSubtests = new Subtests;
        return allSubtests.fetch({
          key: _this.id,
          success: function(collection) {
            _this.subtests = collection.models;
            _this.subtests.maintainOrder();
            return options.success(_this);
          }
        });
      }
    });
  };

  Assessment.prototype.duplicate = function(assessmentAttributes, subtestAttributes, questionAttributes, callback) {
    var newModel, originalId, questions,
      _this = this;
    originalId = this.id;
    newModel = this.clone();
    newModel.set(assessmentAttributes);
    newModel.set("_id", Utils.guid());
    newModel.save();
    questions = new Questions;
    return questions.fetch({
      success: function(questions) {
        var filteredQuestions, subtests;
        filteredQuestions = questions.where({
          "assessmentId": originalId
        });
        subtests = new Subtests;
        return subtests.fetch({
          key: originalId,
          success: function(subtests) {
            var filteredSubtests, gridId, i, model, newQuestion, newSubtest, newSubtestId, newSubtests, oldId, question, subtestIdMap, _i, _len, _len2, _len3;
            filteredSubtests = subtests.models;
            subtestIdMap = {};
            newSubtests = [];
            for (i = 0, _len = filteredSubtests.length; i < _len; i++) {
              model = filteredSubtests[i];
              newSubtest = model.clone();
              newSubtest.set("assessmentId", newModel.id);
              newSubtestId = Utils.guid();
              subtestIdMap[newSubtest.get("_id")] = newSubtestId;
              newSubtest.set("_id", newSubtestId);
              newSubtests.push(newSubtest);
            }
            for (i = 0, _len2 = newSubtests.length; i < _len2; i++) {
              model = newSubtests[i];
              gridId = model.get("gridLinkId");
              if ((gridId || "") !== "") {
                model.set("gridLinkId", subtestIdMap[gridId]);
              }
              model.save();
            }
            for (_i = 0, _len3 = filteredQuestions.length; _i < _len3; _i++) {
              question = filteredQuestions[_i];
              newQuestion = question.clone();
              oldId = newQuestion.get("subtestId");
              newQuestion.set("assessmentId", newModel.id);
              newQuestion.set("_id", Utils.guid());
              newQuestion.set("subtestId", subtestIdMap[oldId]);
              newQuestion.save();
            }
            return callback();
          }
        });
      }
    });
  };

  return Assessment;

})(Backbone.Model);

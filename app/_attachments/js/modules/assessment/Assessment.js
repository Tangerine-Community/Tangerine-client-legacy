var Assessment,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Assessment = (function(_super) {

  __extends(Assessment, _super);

  function Assessment() {
    this.updateFromServer = __bind(this.updateFromServer, this);
    this.fetch = __bind(this.fetch, this);
    Assessment.__super__.constructor.apply(this, arguments);
  }

  Assessment.prototype.url = 'assessment';

  Assessment.prototype.initialize = function(options) {
    if (options == null) options = {};
    return this.subtests = new Subtests;
  };

  Assessment.prototype.fetch = function(options) {
    var oldSuccess,
      _this = this;
    oldSuccess = options.success;
    options.success = function(model) {
      var allSubtests;
      allSubtests = new Subtests;
      return allSubtests.fetch({
        key: _this.id,
        success: function(collection) {
          _this.subtests = collection;
          _this.subtests.maintainOrder();
          return typeof oldSuccess === "function" ? oldSuccess(_this) : void 0;
        }
      });
    };
    return Assessment.__super__.fetch.call(this, options);
  };

  Assessment.prototype.updateFromServer = function(dKey) {
    var dKeys,
      _this = this;
    if (dKey == null) dKey = this.id.substr(-5, 5);
    this.trigger("status", "import lookup");
    dKeys = JSON.stringify(dKey.replace(/[^a-f0-9]/g, " ").split(/\s+/));
    $.ajax("http://tangerine.iriscouch.com/tangerine/_design/tangerine/_view/byDKey", {
      type: "POST",
      dataType: "jsonp",
      data: {
        keys: dKeys
      },
      success: function(data) {
        var datum, docList, _i, _len, _ref;
        docList = [];
        _ref = data.rows;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          datum = _ref[_i];
          docList.push(datum.id);
        }
        return $.couch.replicate(Tangerine.config.address.cloud.host + "/" + Tangerine.config.address.cloud.dbName, Tangerine.config.address.local.dbName, {
          success: function() {
            return _this.trigger("status", "import success");
          },
          error: function(a, b) {
            return _this.trigger("status", "import error", "" + a + " " + b);
          }
        }, {
          doc_ids: docList
        });
      }
    });
    return false;
  };

  Assessment.prototype.duplicate = function(assessmentAttributes, subtestAttributes, questionAttributes, callback) {
    var newId, newModel, originalId, questions,
      _this = this;
    originalId = this.id;
    newModel = this.clone();
    newModel.set(assessmentAttributes);
    newId = Utils.guid();
    newModel.set({
      "_id": newId,
      "assessmentId": newId
    });
    newModel.save(null, {
      "wait": true
    });
    questions = new Questions;
    return questions.fetch({
      key: this.id,
      success: function(questions) {
        var subtests;
        subtests = new Subtests;
        return subtests.fetch({
          key: originalId,
          success: function(subtests) {
            var filteredSubtests, gridId, i, model, newQuestion, newQuestions, newSubtest, newSubtestId, newSubtests, oldId, question, subtestIdMap, _i, _len, _len2, _len3, _ref;
            filteredSubtests = subtests.models;
            subtestIdMap = {};
            newSubtests = [];
            for (i = 0, _len = filteredSubtests.length; i < _len; i++) {
              model = filteredSubtests[i];
              newSubtest = model.clone();
              newSubtest.set("assessmentId", newModel.id);
              newSubtestId = Utils.guid();
              subtestIdMap[newSubtest.id] = newSubtestId;
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
            newQuestions = [];
            _ref = questions.models;
            for (_i = 0, _len3 = _ref.length; _i < _len3; _i++) {
              question = _ref[_i];
              newQuestion = question.clone();
              oldId = newQuestion.get("subtestId");
              newQuestion.set("assessmentId", newModel.id);
              newQuestion.set("_id", Utils.guid());
              newQuestion.set("subtestId", subtestIdMap[oldId]);
              newQuestions.push(newQuestion);
              newQuestion.save();
            }
            return callback();
          }
        });
      }
    });
  };

  Assessment.prototype.destroy = function() {
    var assessmentId, questions, subtests;
    assessmentId = this.id;
    subtests = new Subtests;
    subtests.fetch({
      key: assessmentId,
      success: function(collection) {
        var _results;
        _results = [];
        while (collection.length !== 0) {
          _results.push(collection.pop().destroy());
        }
        return _results;
      }
    });
    questions = new Questions;
    questions.fetch({
      key: this.id,
      success: function(collection) {
        var _results;
        _results = [];
        while (collection.length !== 0) {
          _results.push(collection.pop().destroy());
        }
        return _results;
      }
    });
    return Assessment.__super__.destroy.call(this);
  };

  return Assessment;

})(Backbone.Model);

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
        return _this.render();
      }
    });
  };

  PrototypeSurveyView.prototype.isValid = function() {
    var field, _i, _j, _len, _len2, _ref, _ref2;
    this.names = {};
    this.filled = {};
    _ref = this.$el.find("input:radio, input:checkbox");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      field = _ref[_i];
      this.names[$(field).attr("name")] = 1;
      if ($(field).is(":checked")) this.filled[$(field).attr("name")] = 1;
    }
    _ref2 = $("input:text");
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      field = _ref2[_j];
      this.names[$(field).attr('name')] = 1;
      if ($(field).val() !== "") this.filled[$(field).attr('name')] = 1;
    }
    if (_.keys(this.names).length !== _.keys(this.filled).length) return false;
    return true;
  };

  PrototypeSurveyView.prototype.getResult = function() {
    var p, point, result, _i, _j, _len, _len2, _ref, _ref2;
    result = {};
    _ref = this.$el.find("input:radio, input:checkbox");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      point = $(p);
      if (result[point.attr("name")] != null) {
        if (point.is(":checked")) {
          result[point.attr("name")][point.val()] = "checked";
        } else {
          result[point.attr("name")][point.val()] = "unchecked";
        }
      } else {
        result[point.attr("name")] = {};
        if (point.is(":checked")) {
          result[point.attr("name")][point.val()] = "checked";
        } else {
          result[point.attr("name")][point.val()] = "unchecked";
        }
      }
    }
    _ref2 = this.$el.find("input:text");
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      p = _ref2[_j];
      point = $(p);
      result[point.attr('name')] = point.val();
    }
    return result;
  };

  PrototypeSurveyView.prototype.getSum = function() {
    var $p, counts, p, _i, _len, _ref;
    counts = {
      correct: 0,
      incorrect: 0,
      missing: 0,
      total: 0
    };
    _ref = this.$el.find("input:radio, input:checkbox, textarea");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      $p = $(p);
      if ($p.val() === "1" || $p.val() === "correct") counts['correct'] += 1;
      if ($p.val() === "0" || $p.val() === "incorrect") counts['incorrect'] += 1;
      if (($p.val() || "") === "" || $p.val() === "99" || $p.val() === "9" || $p.val() === "8" || $p.val() === ".") {
        counts['missing'] += 1;
      }
      if (true) counts['total'] += 1;
    }
    return {
      correct: counts['correct'],
      incorrect: counts['incorrect'],
      missing: counts['missing'],
      total: counts['total']
    };
  };

  PrototypeSurveyView.prototype.showErrors = function() {
    var $input, filledKeys, first, key, value, _ref;
    this.$el.find('.message').remove();
    filledKeys = _.keys(this.filled);
    first = true;
    _ref = this.names;
    for (key in _ref) {
      value = _ref[key];
      if (!~filledKeys.indexOf(key)) {
        $input = this.$el.find("input[name='" + key + "']");
        if (first) {
          $input.parent().scrollTo();
          first = false;
        }
        $input.parent().prepend("<div class='message'>Please select one</div>");
      }
    }
    if (_.keys(this.names).length !== _.keys(this.filled).length) {
      return Utils.midAlert("Please fill in all questions");
    }
  };

  PrototypeSurveyView.prototype.render = function() {
    var oneView, question, required, _i, _len, _ref;
    this.resetViews();
    this.$el.html("<form>");
    if (this.questions.models != null) {
      _ref = this.questions.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        question = _ref[_i];
        required = parseInt(question.get("linkedGridScore")) || 0;
        if (required !== 0 && this.parent.getGridScore() < required) {
          this.$el.append("<input type='hidden' name='" + (question.get('name')) + "' value='not_asked'>");
        } else {
          oneView = new QuestionView({
            model: question,
            parent: this
          });
          oneView.render();
          this.questionViews.push(oneView);
          this.$el.append(oneView.el);
        }
      }
    }
    this.$el.append("</form>");
    return this.trigger("rendered");
  };

  PrototypeSurveyView.prototype.onClose = function() {
    return this.resetViews();
  };

  PrototypeSurveyView.prototype.resetViews = function() {
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

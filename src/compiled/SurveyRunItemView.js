var SurveyRunItemView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SurveyRunItemView = (function(superClass) {
  extend(SurveyRunItemView, superClass);

  function SurveyRunItemView() {
    return SurveyRunItemView.__super__.constructor.apply(this, arguments);
  }

  SurveyRunItemView.prototype.template = JST["Survey"];

  SurveyRunItemView.prototype.childView = QuestionRunItemView;

  SurveyRunItemView.prototype.tagName = "p";

  SurveyRunItemView.prototype.className = "SurveyRunItemView";

  SurveyRunItemView.prototype.events = {
    'click .next_question': 'nextQuestion',
    'click .prev_question': 'prevQuestion'
  };

  SurveyRunItemView.prototype.initialize = function(options) {
    var labels;
    this.model = options.model;
    this.parent = this.model.parent;
    this.dataEntry = options.dataEntry;
    this.isObservation = options.isObservation;
    this.focusMode = this.model.getBoolean("focusMode");
    if (this.focusMode) {
      this.questionIndex = 0;
    }
    this.questionViews = [];
    this.answered = [];
    this.renderCount = 0;
    this.i18n();
    this.collection = this.model.questions;
    this.questions = this.collection;
    Tangerine.progress.currentSubview = this;
    labels = {};
    labels.text = this.text;
    return this.model.set('labels', labels);
  };

  SurveyRunItemView.prototype.nextQuestion = function() {
    var currentQuestionView, i, isAvailable, j, len, plannedIndex, qv, ref;
    currentQuestionView = this.questionViews[this.questionIndex];
    if (!this.isValid(currentQuestionView)) {
      return this.showErrors(currentQuestionView);
    }
    isAvailable = [];
    ref = this.questionViews;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      qv = ref[i];
      if (!(qv.isAutostopped || qv.isSkipped)) {
        isAvailable.push(i);
      }
    }
    isAvailable = _.filter(isAvailable, (function(_this) {
      return function(e) {
        return e > _this.questionIndex;
      };
    })(this));
    if (isAvailable.length === 0) {
      plannedIndex = this.questionIndex;
    } else {
      plannedIndex = Math.min.apply(plannedIndex, isAvailable);
    }
    if (this.questionIndex !== plannedIndex) {
      this.questionIndex = plannedIndex;
      this.updateQuestionVisibility();
      return this.updateProgressButtons();
    }
  };

  SurveyRunItemView.prototype.prevQuestion = function() {
    var currentQuestionView, i, isAvailable, j, len, plannedIndex, qv, ref;
    currentQuestionView = this.questionViews[this.questionIndex];
    if (!this.isValid(currentQuestionView)) {
      return this.showErrors(currentQuestionView);
    }
    isAvailable = [];
    ref = this.questionViews;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      qv = ref[i];
      if (!(qv.isAutostopped || qv.isSkipped)) {
        isAvailable.push(i);
      }
    }
    isAvailable = _.filter(isAvailable, (function(_this) {
      return function(e) {
        return e < _this.questionIndex;
      };
    })(this));
    if (isAvailable.length === 0) {
      plannedIndex = this.questionIndex;
    } else {
      plannedIndex = Math.max.apply(plannedIndex, isAvailable);
    }
    if (this.questionIndex !== plannedIndex) {
      this.questionIndex = plannedIndex;
      this.updateQuestionVisibility();
      return this.updateProgressButtons();
    }
  };

  SurveyRunItemView.prototype.updateProgressButtons = function() {
    var $next, $prev, i, isAvailable, j, len, maximum, minimum, qv, ref;
    isAvailable = [];
    ref = this.questionViews;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      qv = ref[i];
      if (!(qv.isAutostopped || qv.isSkipped)) {
        isAvailable.push(i);
      }
    }
    isAvailable.push(this.questionIndex);
    $prev = this.$el.find(".prev_question");
    $next = this.$el.find(".next_question");
    minimum = Math.min.apply(minimum, isAvailable);
    maximum = Math.max.apply(maximum, isAvailable);
    if (this.questionIndex === minimum) {
      $prev.hide();
    } else {
      $prev.show();
    }
    if (this.questionIndex === maximum) {
      return $next.hide();
    } else {
      return $next.show();
    }
  };

  SurveyRunItemView.prototype.updateExecuteReady = function(ready) {
    var index, j, len, ref, ref1;
    this.executeReady = ready;
    if (this.triggerShowList == null) {
      return;
    }
    if (this.triggerShowList.length > 0) {
      ref = this.triggerShowList;
      for (j = 0, len = ref.length; j < len; j++) {
        index = ref[j];
        if ((ref1 = this.questionViews[index]) != null) {
          ref1.trigger("show");
        }
      }
      this.triggerShowList = [];
    }
    if (this.executeReady) {
      return this.updateSkipLogic();
    }
  };

  SurveyRunItemView.prototype.updateQuestionVisibility = function() {
    var $questions;
    if (!this.model.get("focusMode")) {
      return;
    }
    if (this.questionIndex === this.questionViews.length) {
      this.$el.find("#summary_container").html("last page here");
      this.$el.find("#next_question").hide();
    } else {
      this.$el.find("#summary_container").empty();
      this.$el.find("#next_question").show();
    }
    $questions = this.$el.find(".question");
    $questions.hide();
    $questions.eq(this.questionIndex).show();
    if (this.executeReady) {
      return this.questionViews[this.questionIndex].trigger("show");
    } else {
      if (!this.triggerShowList) {
        this.triggerShowList = [];
      }
      return this.triggerShowList.push(this.questionIndex);
    }
  };

  SurveyRunItemView.prototype.showQuestion = function(index) {
    if (_.isNumber(index) && index < this.questionViews.length && index > 0) {
      this.questionIndex = index;
    }
    this.updateQuestionVisibility();
    return this.updateProgressButtons();
  };

  SurveyRunItemView.prototype.i18n = function() {
    return this.text = {
      pleaseAnswer: t("SurveyRunView.message.please_answer"),
      correctErrors: t("SurveyRunView.message.correct_errors"),
      notEnough: _(t("SurveyRunView.message.not_enough")).escape(),
      previousQuestion: t("SurveyRunView.button.previous_question"),
      nextQuestion: t("SurveyRunView.button.next_question"),
      "next": t("SubtestRunView.button.next"),
      "back": t("SubtestRunView.button.back"),
      "skip": t("SubtestRunView.button.skip"),
      "help": t("SubtestRunView.button.help")
    };
  };

  SurveyRunItemView.prototype.onQuestionAnswer = function(element) {
    var autostopCount, autostopLimit, currentAnswer, i, j, longestSequence, ref;
    if (!(this.renderCount >= this.questions.length)) {
      return;
    }
    this.autostopped = false;
    autostopLimit = this.model.getNumber("autostopLimit");
    longestSequence = 0;
    autostopCount = 0;
    if (autostopLimit > 0) {
      for (i = j = 1, ref = this.questionViews.length; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        currentAnswer = this.questionViews[i - 1].answer;
        if (currentAnswer === "0" || currentAnswer === "9") {
          autostopCount++;
        } else {
          autostopCount = 0;
        }
        longestSequence = Math.max(longestSequence, autostopCount);
        if (autostopLimit !== 0 && longestSequence >= autostopLimit && !this.autostopped) {
          this.autostopped = true;
          this.autostopIndex = i;
        }
      }
    }
    this.updateAutostop();
    return this.updateSkipLogic();
  };

  SurveyRunItemView.prototype.updateAutostop = function() {
    var autostopLimit;
    autostopLimit = this.model.getNumber("autostopLimit");
    return this.questionViews.forEach(function(view, i) {
      if (i > (this.autostopIndex - 1)) {
        if (this.autostopped) {
          view.isAutostopped = true;
          return view.$el.addClass("disabled_autostop");
        } else {
          view.isAutostopped = false;
          return view.$el.removeClass("disabled_autostop");
        }
      }
    }, this);
  };

  SurveyRunItemView.prototype.updateSkipLogic = function() {
    return this.questionViews.forEach(function(qv) {
      var error, error1, message, name, question, result, skipLogicCode;
      question = qv.model;
      skipLogicCode = question.getString("skipLogic");
      if (skipLogicCode !== "") {
        try {
          result = CoffeeScript["eval"].apply(this, [skipLogicCode]);
        } catch (error1) {
          error = error1;
          name = (/function (.{1,})\(/.exec(error.constructor.toString())[1]);
          message = error.message;
          alert("Skip logic error in question " + (question.get('name')) + "\n\n" + name + "\n\n" + message);
        }
        if (result) {
          qv.$el.addClass("disabled_skipped");
          qv.isSkipped = true;
        } else {
          qv.$el.removeClass("disabled_skipped");
          qv.isSkipped = false;
        }
      }
      return qv.updateValidity();
    }, this);
  };

  SurveyRunItemView.prototype.isValid = function(views) {
    var i, j, len, qv;
    if (views == null) {
      views = this.questionViews;
    }
    if (views == null) {
      return true;
    }
    if (!_.isArray(views)) {
      views = [views];
    }
    for (i = j = 0, len = views.length; j < len; i = ++j) {
      qv = views[i];
      qv.updateValidity();
      if (!qv.model.getBoolean("skippable")) {
        if (!qv.isValid) {
          return false;
        }
      }
    }
    return true;
  };

  SurveyRunItemView.prototype.testValid = function() {
    return this.isValid();
  };

  SurveyRunItemView.prototype.getSkipped = function() {
    var result;
    result = {};
    this.questionViews.forEach(function(qv, i) {
      return result[this.questions.models[i].get("name")] = "skipped";
    }, this);
    return result;
  };

  SurveyRunItemView.prototype.getResult = function() {
    var hash, result, subtestResult;
    result = {};
    this.questionViews.forEach(function(qv, i) {
      return result[qv.name] = qv.notAsked ? qv.notAskedResult : !_.isEmpty(qv.answer) ? qv.answer : qv.skipped ? qv.skippedResult : qv.isSkipped ? qv.logicSkippedResult : qv.isAutostopped ? qv.notAskedAutostopResult : qv.answer;
    }, this);
    if (this.model.has("hash")) {
      hash = this.model.get("hash");
    }
    return subtestResult = {
      'body': result,
      'meta': {
        'hash': hash
      }
    };
  };

  SurveyRunItemView.prototype.showErrors = function(views) {
    var first;
    if (views == null) {
      views = this.questionViews;
    }
    this.$el.find('.message').remove();
    first = true;
    if (!_.isArray(views)) {
      views = [views];
    }
    return views.forEach(function(qv, i) {
      var customMessage, message;
      if (!_.isString(qv)) {
        message = "";
        if (!qv.isValid) {
          customMessage = qv.model.get("customValidationMessage");
          if (!_.isEmpty(customMessage)) {
            message = customMessage;
          } else {
            message = this.text.pleaseAnswer;
          }
          if (first === true) {
            if (views === this.questionViews) {
              this.showQuestion(i);
            }
            qv.$el.scrollTo();
            Utils.midAlert(this.text.correctErrors);
            first = false;
          }
        }
        return qv.setMessage(message);
      }
    }, this);
  };

  SurveyRunItemView.prototype.getSum = function() {
    return {
      correct: 0,
      incorrect: 0,
      missing: 0,
      total: 0
    };
  };

  SurveyRunItemView.prototype.childEvents = {
    'answer scroll': 'onQuestionAnswer',
    'answer': 'onQuestionAnswer',
    'rendered': 'onQuestionRendered'
  };

  SurveyRunItemView.prototype.buildChildView = function(child, ChildViewClass, childViewOptions) {
    var options, view;
    options = _.extend({
      model: child
    }, childViewOptions);
    view = new ChildViewClass(options);
    this.questionViews[childViewOptions.index] = view;
    return view;
  };

  SurveyRunItemView.prototype.childViewOptions = function(model, index) {
    var answer, isNotAsked, labels, name, notAskedCount, options, previous, required;
    if (!this.dataEntry) {
      previous = this.model.parent.result.getByHash(this.model.get('hash'));
    }
    notAskedCount = 0;
    required = model.getNumber("linkedGridScore");
    isNotAsked = ((required !== 0 && this.model.parent.getGridScore() < required) || this.model.parent.gridWasAutostopped()) && this.model.parent.getGridScore() !== false;
    if (isNotAsked) {
      notAskedCount++;
    }
    name = model.escape("name").replace(/[^A-Za-z0-9_]/g, "-");
    if (previous) {
      answer = previous[name];
    }
    labels = {};
    labels.text = this.text;
    model.set('labels', labels);
    options = {
      model: model,
      parent: this,
      dataEntry: this.dataEntry,
      notAsked: isNotAsked,
      isObservation: this.isObservation,
      answer: answer,
      index: index
    };
    return options;
  };

  SurveyRunItemView.prototype.onBeforeRender = function() {};

  SurveyRunItemView.prototype.onRender = function() {
    this.trigger("ready");
    return this.trigger("subRendered");
  };

  SurveyRunItemView.prototype.onRenderCollection = function() {
    return this.updateExecuteReady(true);
  };

  SurveyRunItemView.prototype.onQuestionRendered = function() {
    this.renderCount++;
    if (this.renderCount === this.questions.length) {
      this.trigger("ready");
      this.updateSkipLogic();
    }
    return this.trigger("subRendered");
  };

  SurveyRunItemView.prototype.onClose = function() {
    var j, len, qv, ref;
    ref = this.questionViews;
    for (j = 0, len = ref.length; j < len; j++) {
      qv = ref[j];
      if (typeof qv.close === "function") {
        qv.close();
      }
    }
    return this.questionViews = [];
  };

  SurveyRunItemView.prototype.reset = function(increment) {
    this.rendered.subtest = false;
    this.rendered.assessment = false;
    Tangerine.progress.currentSubview.close();
    this.index = this.abortAssessment === true ? this.subtestViews.length - 1 : this.index + increment;
    this.render();
    return window.scrollTo(0, 0);
  };

  return SurveyRunItemView;

})(Backbone.Marionette.CompositeView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1bkl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzhCQUVKLFFBQUEsR0FBVSxHQUFJLENBQUEsUUFBQTs7OEJBQ2QsU0FBQSxHQUFXOzs4QkFDWCxPQUFBLEdBQVM7OzhCQUNULFNBQUEsR0FBVzs7OEJBRVgsTUFBQSxHQUNFO0lBQUEsc0JBQUEsRUFBeUIsY0FBekI7SUFDQSxzQkFBQSxFQUF5QixjQUR6Qjs7OzhCQUdGLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFFVixRQUFBO0lBQUEsSUFBQyxDQUFBLEtBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxNQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFDeEIsSUFBQyxDQUFBLFNBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxhQUFELEdBQWlCLE9BQU8sQ0FBQztJQUN6QixJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBa0IsV0FBbEI7SUFDakIsSUFBc0IsSUFBQyxDQUFBLFNBQXZCO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsRUFBakI7O0lBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFdBQUQsR0FBaUI7SUFJakIsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUtBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUNyQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQTtJQVVkLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBbkIsR0FBb0M7SUFDcEMsTUFBQSxHQUFTO0lBQ1QsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUE7V0FDZixJQUFDLENBQUEsS0FBSyxDQUFD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QUFELEdBQ0ssSUFBQyxDQUFBLGVBQUQsS0FBb0IsSUFBdkIsR0FDRSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsR0FBcUIsQ0FEdkIsR0FHRSxJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ2IsSUFBQyxDQUFBLE1BQUQsQ0FBQTtXQUNBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQWhCLEVBQW1CLENBQW5CO0VBYks7Ozs7R0F4WndCLFFBQVEsQ0FBQyxVQUFVLENBQUMiLCJmaWxlIjoibW9kdWxlcy9zdWJ0ZXN0L3Byb3RvdHlwZXMvU3VydmV5UnVuSXRlbVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdXJ2ZXlSdW5JdGVtVmlldyBleHRlbmRzICBCYWNrYm9uZS5NYXJpb25ldHRlLkNvbXBvc2l0ZVZpZXdcblxuICB0ZW1wbGF0ZTogSlNUW1wiU3VydmV5XCJdLFxuICBjaGlsZFZpZXc6IFF1ZXN0aW9uUnVuSXRlbVZpZXcsXG4gIHRhZ05hbWU6IFwicFwiLFxuICBjbGFzc05hbWU6IFwiU3VydmV5UnVuSXRlbVZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLm5leHRfcXVlc3Rpb24nIDogJ25leHRRdWVzdGlvbidcbiAgICAnY2xpY2sgLnByZXZfcXVlc3Rpb24nIDogJ3ByZXZRdWVzdGlvbidcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBtb2RlbCAgICAgICAgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgICAgICAgID0gQG1vZGVsLnBhcmVudFxuICAgIEBkYXRhRW50cnkgICAgID0gb3B0aW9ucy5kYXRhRW50cnlcbiAgICBAaXNPYnNlcnZhdGlvbiA9IG9wdGlvbnMuaXNPYnNlcnZhdGlvblxuICAgIEBmb2N1c01vZGUgICAgID0gQG1vZGVsLmdldEJvb2xlYW4oXCJmb2N1c01vZGVcIilcbiAgICBAcXVlc3Rpb25JbmRleCA9IDAgaWYgQGZvY3VzTW9kZVxuICAgIEBxdWVzdGlvblZpZXdzID0gW11cbiAgICBAYW5zd2VyZWQgICAgICA9IFtdXG4gICAgQHJlbmRlckNvdW50ICAgPSAwXG4jICAgIEBjaGlsZFZpZXdPcHRpb25zID1cbiMgICAgICAgIHBhcmVudDogdGhpc1xuXG4gICAgQGkxOG4oKVxuIyAgICB0aGlzLmxpc3RlblRvKEBtb2RlbC5jb2xsZWN0aW9uLCdjaGFuZ2UnLCB0aGlzLnZpZXdSZW5kZXIpXG4jICAgICAgdGhpcy5saXN0ZW5Ubyhtb2RlbC5jb2xsZWN0aW9uLCAncmVzZXQnLCB0aGlzLnJlbmRlcik7XG4jICAgIGlmIEBtb2RlbC5xdWVzdGlvbnMubGVuZ3RoID09IDBcbiMgICAgICBjb25zb2xlLmxvZyhcIk5vIHF1ZXN0aW9ucy5cIilcbiAgICBAY29sbGVjdGlvbiA9IEBtb2RlbC5xdWVzdGlvbnNcbiAgICBAcXVlc3Rpb25zID0gQGNvbGxlY3Rpb25cbiMgICAgQG1vZGVsLnF1ZXN0aW9ucy5mZXRjaFxuIyAgICAgIHZpZXdPcHRpb25zOlxuIyAgICAgICAga2V5OiBcInF1ZXN0aW9uLSN7QG1vZGVsLmlkfVwiXG4jICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pID0+XG4jIyAgICAgICAgQG1vZGVsLnF1ZXN0aW9ucy5zb3J0KClcbiMgICAgICAgIGNvbGxlY3Rpb24uc29ydCgpXG4jICAgICAgICBAbW9kZWwuY29sbGVjdGlvbi5tb2RlbHMgPSBjb2xsZWN0aW9uLm1vZGVsc1xuIyAgICAgICAgQHJlbmRlcigpXG5cbiAgICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcgPSBAXG4gICAgbGFiZWxzID0ge31cbiAgICBsYWJlbHMudGV4dCA9IEB0ZXh0XG4gICAgQG1vZGVsLnNldCgnbGFiZWxzJywgbGFiZWxzKVxuXG4jICBmaWx0ZXI6IChjaGlsZCwgaW5kZXgsIGNvbGxlY3Rpb24pIC0+XG4jICAgIHJldHVybiBjaGlsZC5nZXQoJ3ZhbHVlJykgJSAyID09IDBcblxuIyAgbW9kZWxBZGRlZDotPlxuIyAgICBjb25zb2xlLmxvZyhcIm1vZGVsIGFkZGVkXCIpXG5cbiAgbmV4dFF1ZXN0aW9uOiAtPlxuIyAgICBjb25zb2xlLmxvZyhcIm5leHRRdWVzdGlvblwiKVxuXG4gICAgY3VycmVudFF1ZXN0aW9uVmlldyA9IEBxdWVzdGlvblZpZXdzW0BxdWVzdGlvbkluZGV4XVxuXG4gICAgIyBzaG93IGVycm9ycyBiZWZvcmUgZG9pbmcgYW55dGhpbmcgaWYgdGhlcmUgYXJlIGFueVxuICAgIHJldHVybiBAc2hvd0Vycm9ycyhjdXJyZW50UXVlc3Rpb25WaWV3KSB1bmxlc3MgQGlzVmFsaWQoY3VycmVudFF1ZXN0aW9uVmlldylcblxuICAgICMgZmluZCB0aGUgbm9uLXNraXBwZWQgcXVlc3Rpb25zXG4gICAgaXNBdmFpbGFibGUgPSBbXVxuICAgIGZvciBxdiwgaSBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgaXNBdmFpbGFibGUucHVzaCBpIGlmIG5vdCAocXYuaXNBdXRvc3RvcHBlZCBvciBxdi5pc1NraXBwZWQpXG4gICAgaXNBdmFpbGFibGUgID0gXy5maWx0ZXIgaXNBdmFpbGFibGUsIChlKSA9PiBlID4gQHF1ZXN0aW9uSW5kZXhcblxuICAgICMgZG9uJ3QgZ28gYW55d2hlcmUgdW5sZXNzIHdlIGhhdmUgc29tZXdoZXJlIHRvIGdvXG4gICAgaWYgaXNBdmFpbGFibGUubGVuZ3RoID09IDBcbiAgICAgIHBsYW5uZWRJbmRleCA9IEBxdWVzdGlvbkluZGV4XG4gICAgZWxzZVxuICAgICAgcGxhbm5lZEluZGV4ID0gTWF0aC5taW4uYXBwbHkocGxhbm5lZEluZGV4LCBpc0F2YWlsYWJsZSlcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ICE9IHBsYW5uZWRJbmRleFxuICAgICAgQHF1ZXN0aW9uSW5kZXggPSBwbGFubmVkSW5kZXhcbiAgICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuICAgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG5cbiAgcHJldlF1ZXN0aW9uOiAtPlxuXG4gICAgY3VycmVudFF1ZXN0aW9uVmlldyA9IEBxdWVzdGlvblZpZXdzW0BxdWVzdGlvbkluZGV4XVxuXG4gICAgIyBzaG93IGVycm9ycyBiZWZvcmUgZG9pbmcgYW55dGhpbmcgaWYgdGhlcmUgYXJlIGFueVxuICAgIHJldHVybiBAc2hvd0Vycm9ycyhjdXJyZW50UXVlc3Rpb25WaWV3KSB1bmxlc3MgQGlzVmFsaWQoY3VycmVudFF1ZXN0aW9uVmlldylcblxuICAgICMgZmluZCB0aGUgbm9uLXNraXBwZWQgcXVlc3Rpb25zXG4gICAgaXNBdmFpbGFibGUgPSBbXVxuICAgIGZvciBxdiwgaSBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgaXNBdmFpbGFibGUucHVzaCBpIGlmIG5vdCAocXYuaXNBdXRvc3RvcHBlZCBvciBxdi5pc1NraXBwZWQpXG4gICAgaXNBdmFpbGFibGUgID0gXy5maWx0ZXIgaXNBdmFpbGFibGUsIChlKSA9PiBlIDwgQHF1ZXN0aW9uSW5kZXhcblxuICAgICMgZG9uJ3QgZ28gYW55d2hlcmUgdW5sZXNzIHdlIGhhdmUgc29tZXdoZXJlIHRvIGdvXG4gICAgaWYgaXNBdmFpbGFibGUubGVuZ3RoID09IDBcbiAgICAgIHBsYW5uZWRJbmRleCA9IEBxdWVzdGlvbkluZGV4XG4gICAgZWxzZVxuICAgICAgcGxhbm5lZEluZGV4ID0gTWF0aC5tYXguYXBwbHkocGxhbm5lZEluZGV4LCBpc0F2YWlsYWJsZSlcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ICE9IHBsYW5uZWRJbmRleFxuICAgICAgQHF1ZXN0aW9uSW5kZXggPSBwbGFubmVkSW5kZXhcbiAgICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuICAgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG5cbiAgdXBkYXRlUHJvZ3Jlc3NCdXR0b25zOiAtPlxuXG4gICAgaXNBdmFpbGFibGUgPSBbXVxuICAgIGZvciBxdiwgaSBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgaXNBdmFpbGFibGUucHVzaCBpIGlmIG5vdCAocXYuaXNBdXRvc3RvcHBlZCBvciBxdi5pc1NraXBwZWQpXG4gICAgaXNBdmFpbGFibGUucHVzaCBAcXVlc3Rpb25JbmRleFxuXG4gICAgJHByZXYgPSBAJGVsLmZpbmQoXCIucHJldl9xdWVzdGlvblwiKVxuICAgICRuZXh0ID0gQCRlbC5maW5kKFwiLm5leHRfcXVlc3Rpb25cIilcblxuICAgIG1pbmltdW0gPSBNYXRoLm1pbi5hcHBseSggbWluaW11bSwgaXNBdmFpbGFibGUgKVxuICAgIG1heGltdW0gPSBNYXRoLm1heC5hcHBseSggbWF4aW11bSwgaXNBdmFpbGFibGUgKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggPT0gbWluaW11bVxuICAgICAgJHByZXYuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgJHByZXYuc2hvdygpXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCA9PSBtYXhpbXVtXG4gICAgICAkbmV4dC5oaWRlKClcbiAgICBlbHNlXG4gICAgICAkbmV4dC5zaG93KClcblxuICB1cGRhdGVFeGVjdXRlUmVhZHk6IChyZWFkeSkgLT5cblxuIyAgICBjb25zb2xlLmxvZyhcInVwZGF0ZUV4ZWN1dGVSZWFkeTogXCIgKyByZWFkeSArIFwiIEB0cmlnZ2VyU2hvd0xpc3Q/IFwiICsgQHRyaWdnZXJTaG93TGlzdD8pXG4gICAgQGV4ZWN1dGVSZWFkeSA9IHJlYWR5XG5cbiAgICByZXR1cm4gaWYgbm90IEB0cmlnZ2VyU2hvd0xpc3Q/XG5cbiAgICBpZiBAdHJpZ2dlclNob3dMaXN0Lmxlbmd0aCA+IDBcbiAgICAgIGZvciBpbmRleCBpbiBAdHJpZ2dlclNob3dMaXN0XG4gICAgICAgIEBxdWVzdGlvblZpZXdzW2luZGV4XT8udHJpZ2dlciBcInNob3dcIlxuICAgICAgQHRyaWdnZXJTaG93TGlzdCA9IFtdXG5cbiAgICBAdXBkYXRlU2tpcExvZ2ljKCkgaWYgQGV4ZWN1dGVSZWFkeVxuXG5cbiAgdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5OiAtPlxuXG4gICAgcmV0dXJuIHVubGVzcyBAbW9kZWwuZ2V0KFwiZm9jdXNNb2RlXCIpXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCA9PSBAcXVlc3Rpb25WaWV3cy5sZW5ndGhcbiAgICAgIEAkZWwuZmluZChcIiNzdW1tYXJ5X2NvbnRhaW5lclwiKS5odG1sIFwiXG4gICAgICAgIGxhc3QgcGFnZSBoZXJlXG4gICAgICBcIlxuICAgICAgQCRlbC5maW5kKFwiI25leHRfcXVlc3Rpb25cIikuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI3N1bW1hcnlfY29udGFpbmVyXCIpLmVtcHR5KClcbiAgICAgIEAkZWwuZmluZChcIiNuZXh0X3F1ZXN0aW9uXCIpLnNob3coKVxuXG4gICAgJHF1ZXN0aW9ucyA9IEAkZWwuZmluZChcIi5xdWVzdGlvblwiKVxuICAgICRxdWVzdGlvbnMuaGlkZSgpXG4gICAgJHF1ZXN0aW9ucy5lcShAcXVlc3Rpb25JbmRleCkuc2hvdygpXG5cbiAgICAjIHRyaWdnZXIgdGhlIHF1ZXN0aW9uIHRvIHJ1biBpdCdzIGRpc3BsYXkgY29kZSBpZiB0aGUgc3VidGVzdCdzIGRpc3BsYXljb2RlIGhhcyBhbHJlYWR5IHJhblxuICAgICMgaWYgbm90LCBhZGQgaXQgdG8gYSBsaXN0IHRvIHJ1biBsYXRlci5cbiAgICBpZiBAZXhlY3V0ZVJlYWR5XG4gICAgICBAcXVlc3Rpb25WaWV3c1tAcXVlc3Rpb25JbmRleF0udHJpZ2dlciBcInNob3dcIlxuICAgIGVsc2VcbiAgICAgIEB0cmlnZ2VyU2hvd0xpc3QgPSBbXSBpZiBub3QgQHRyaWdnZXJTaG93TGlzdFxuICAgICAgQHRyaWdnZXJTaG93TGlzdC5wdXNoIEBxdWVzdGlvbkluZGV4XG5cbiAgc2hvd1F1ZXN0aW9uOiAoaW5kZXgpIC0+XG4gICAgQHF1ZXN0aW9uSW5kZXggPSBpbmRleCBpZiBfLmlzTnVtYmVyKGluZGV4KSAmJiBpbmRleCA8IEBxdWVzdGlvblZpZXdzLmxlbmd0aCAmJiBpbmRleCA+IDBcbiAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIHBsZWFzZUFuc3dlciA6IHQoXCJTdXJ2ZXlSdW5WaWV3Lm1lc3NhZ2UucGxlYXNlX2Fuc3dlclwiKVxuICAgICAgY29ycmVjdEVycm9ycyA6IHQoXCJTdXJ2ZXlSdW5WaWV3Lm1lc3NhZ2UuY29ycmVjdF9lcnJvcnNcIilcbiAgICAgIG5vdEVub3VnaCA6IF8odChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5ub3RfZW5vdWdoXCIpKS5lc2NhcGUoKVxuXG4gICAgICBwcmV2aW91c1F1ZXN0aW9uIDogdChcIlN1cnZleVJ1blZpZXcuYnV0dG9uLnByZXZpb3VzX3F1ZXN0aW9uXCIpXG4gICAgICBuZXh0UXVlc3Rpb24gOiB0KFwiU3VydmV5UnVuVmlldy5idXR0b24ubmV4dF9xdWVzdGlvblwiKVxuICAgICAgXCJuZXh0XCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLm5leHRcIilcbiAgICAgIFwiYmFja1wiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5iYWNrXCIpXG4gICAgICBcInNraXBcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uc2tpcFwiKVxuICAgICAgXCJoZWxwXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLmhlbHBcIilcblxuICAjIHdoZW4gYSBxdWVzdGlvbiBpcyBhbnN3ZXJlZFxuICBvblF1ZXN0aW9uQW5zd2VyOiAoZWxlbWVudCkgLT5cbiMgICAgY29uc29sZS5sb2coXCJvblF1ZXN0aW9uQW5zd2VyIEByZW5kZXJDb3VudDpcIiArIEByZW5kZXJDb3VudCArIFwiICBAcXVlc3Rpb25zLmxlbmd0aDogXCIgKyAgQHF1ZXN0aW9ucy5sZW5ndGgpXG4jICAgIHRoaXMgaXMgbm90IGdvb2QuIFNob3VsZCB0ZXN0IGZvciA9PVxuICAgIHJldHVybiB1bmxlc3MgQHJlbmRlckNvdW50ID49IEBxdWVzdGlvbnMubGVuZ3RoXG5cbiAgICAjIGF1dG8gc3RvcCBhZnRlciBsaW1pdFxuICAgIEBhdXRvc3RvcHBlZCAgICA9IGZhbHNlXG4gICAgYXV0b3N0b3BMaW1pdCAgID0gQG1vZGVsLmdldE51bWJlciBcImF1dG9zdG9wTGltaXRcIlxuICAgIGxvbmdlc3RTZXF1ZW5jZSA9IDBcbiAgICBhdXRvc3RvcENvdW50ICAgPSAwXG5cbiAgICBpZiBhdXRvc3RvcExpbWl0ID4gMFxuICAgICAgZm9yIGkgaW4gWzEuLkBxdWVzdGlvblZpZXdzLmxlbmd0aF0gIyBqdXN0IGluIGNhc2UgdGhleSBjYW4ndCBjb3VudFxuICAgICAgICBjdXJyZW50QW5zd2VyID0gQHF1ZXN0aW9uVmlld3NbaS0xXS5hbnN3ZXJcbiAgICAgICAgaWYgY3VycmVudEFuc3dlciA9PSBcIjBcIiBvciBjdXJyZW50QW5zd2VyID09IFwiOVwiXG4gICAgICAgICAgYXV0b3N0b3BDb3VudCsrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhdXRvc3RvcENvdW50ID0gMFxuICAgICAgICBsb25nZXN0U2VxdWVuY2UgPSBNYXRoLm1heChsb25nZXN0U2VxdWVuY2UsIGF1dG9zdG9wQ291bnQpXG4gICAgICAgICMgaWYgdGhlIHZhbHVlIGlzIHNldCwgd2UndmUgZ290IGEgdGhyZXNob2xkIGV4Y2VlZGluZyBydW4sIGFuZCBpdCdzIG5vdCBhbHJlYWR5IGF1dG9zdG9wcGVkXG4gICAgICAgIGlmIGF1dG9zdG9wTGltaXQgIT0gMCAmJiBsb25nZXN0U2VxdWVuY2UgPj0gYXV0b3N0b3BMaW1pdCAmJiBub3QgQGF1dG9zdG9wcGVkXG4gICAgICAgICAgQGF1dG9zdG9wcGVkID0gdHJ1ZVxuICAgICAgICAgIEBhdXRvc3RvcEluZGV4ID0gaVxuICAgIEB1cGRhdGVBdXRvc3RvcCgpXG4gICAgQHVwZGF0ZVNraXBMb2dpYygpXG5cbiAgdXBkYXRlQXV0b3N0b3A6IC0+XG4gICAgYXV0b3N0b3BMaW1pdCA9IEBtb2RlbC5nZXROdW1iZXIgXCJhdXRvc3RvcExpbWl0XCJcbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoICh2aWV3LCBpKSAtPlxuICAgICAgaWYgaSA+IChAYXV0b3N0b3BJbmRleCAtIDEpXG4gICAgICAgIGlmIEBhdXRvc3RvcHBlZFxuICAgICAgICAgIHZpZXcuaXNBdXRvc3RvcHBlZCA9IHRydWVcbiAgICAgICAgICB2aWV3LiRlbC5hZGRDbGFzcyAgICBcImRpc2FibGVkX2F1dG9zdG9wXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpZXcuaXNBdXRvc3RvcHBlZCA9IGZhbHNlXG4gICAgICAgICAgdmlldy4kZWwucmVtb3ZlQ2xhc3MgXCJkaXNhYmxlZF9hdXRvc3RvcFwiXG4gICAgLCBAXG5cbiAgdXBkYXRlU2tpcExvZ2ljOiAtPlxuIyAgICBjb25zb2xlLmxvZyhcInVwZGF0ZVNraXBMb2dpY1wiKVxuIyAgICBjb25zb2xlLmxvZyhcIkBxdWVzdGlvblZpZXdzXCIgKyBAcXVlc3Rpb25WaWV3cy5sZW5ndGgpXG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAocXYpIC0+XG4gICAgICBxdWVzdGlvbiA9IHF2Lm1vZGVsXG4gICAgICBza2lwTG9naWNDb2RlID0gcXVlc3Rpb24uZ2V0U3RyaW5nIFwic2tpcExvZ2ljXCJcbiAgICAgIHVubGVzcyBza2lwTG9naWNDb2RlIGlzIFwiXCJcbiAgICAgICAgdHJ5XG4gICAgICAgICAgcmVzdWx0ID0gQ29mZmVlU2NyaXB0LmV2YWwuYXBwbHkoQCwgW3NraXBMb2dpY0NvZGVdKVxuIyAgICAgICAgICBjb25zb2xlLmxvZyhcInNraXBMb2dpY0NvZGU6IFwiICsgc2tpcExvZ2ljQ29kZSlcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICBuYW1lID0gKCgvZnVuY3Rpb24gKC57MSx9KVxcKC8pLmV4ZWMoZXJyb3IuY29uc3RydWN0b3IudG9TdHJpbmcoKSlbMV0pXG4gICAgICAgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgICBhbGVydCBcIlNraXAgbG9naWMgZXJyb3IgaW4gcXVlc3Rpb24gI3txdWVzdGlvbi5nZXQoJ25hbWUnKX1cXG5cXG4je25hbWV9XFxuXFxuI3ttZXNzYWdlfVwiXG5cbiAgICAgICAgaWYgcmVzdWx0XG4gICAgICAgICAgcXYuJGVsLmFkZENsYXNzIFwiZGlzYWJsZWRfc2tpcHBlZFwiXG4gICAgICAgICAgcXYuaXNTa2lwcGVkID0gdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcXYuJGVsLnJlbW92ZUNsYXNzIFwiZGlzYWJsZWRfc2tpcHBlZFwiXG4gICAgICAgICAgcXYuaXNTa2lwcGVkID0gZmFsc2VcbiAgICAgIHF2LnVwZGF0ZVZhbGlkaXR5KClcbiAgICAsIEBcblxuICBpc1ZhbGlkOiAodmlld3MgPSBAcXVlc3Rpb25WaWV3cykgLT5cbiAgICByZXR1cm4gdHJ1ZSBpZiBub3Qgdmlld3M/ICMgaWYgdGhlcmUncyBub3RoaW5nIHRvIGNoZWNrLCBpdCBtdXN0IGJlIGdvb2RcbiAgICB2aWV3cyA9IFt2aWV3c10gaWYgbm90IF8uaXNBcnJheSh2aWV3cylcbiAgICBmb3IgcXYsIGkgaW4gdmlld3NcbiAgICAgIHF2LnVwZGF0ZVZhbGlkaXR5KClcbiAgICAgICMgY2FuIHdlIHNraXAgaXQ/XG4gICAgICBpZiBub3QgcXYubW9kZWwuZ2V0Qm9vbGVhbihcInNraXBwYWJsZVwiKVxuICAgICAgICAjIGlzIGl0IHZhbGlkXG4gICAgICAgIGlmIG5vdCBxdi5pc1ZhbGlkXG4gICAgICAgICAgIyByZWQgYWxlcnQhIVxuIyAgICAgICAgICBjb25zb2xlLmxvZyhcInBvcCB1cCBhbiBlcnJvclwiKVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuIyAgICAsIEBcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHRlc3RWYWxpZDogLT5cbiMgICAgY29uc29sZS5sb2coXCJTdXJ2ZXlSaW5JdGVtIHRlc3RWYWxpZC5cIilcbiMgICAgaWYgbm90IEBwcm90b3R5cGVSZW5kZXJlZCB0aGVuIHJldHVybiBmYWxzZVxuIyAgICBjdXJyZW50VmlldyA9IFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1xuIyAgICBpZiBAaXNWYWxpZD9cbiMgICAgY29uc29sZS5sb2coXCJ0ZXN0dmFsaWQ6IFwiICsgQGlzVmFsaWQ/KVxuICAgIHJldHVybiBAaXNWYWxpZCgpXG4jICAgIGVsc2VcbiMgICAgICByZXR1cm4gZmFsc2VcbiMgICAgdHJ1ZVxuXG5cbiAgIyBAVE9ETyB0aGlzIHNob3VsZCBwcm9iYWJseSBiZSByZXR1cm5pbmcgbXVsdGlwbGUsIHNpbmdsZSB0eXBlIGhhc2ggdmFsdWVzXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgcmVzdWx0ID0ge31cbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoIChxdiwgaSkgLT5cbiAgICAgIHJlc3VsdFtAcXVlc3Rpb25zLm1vZGVsc1tpXS5nZXQoXCJuYW1lXCIpXSA9IFwic2tpcHBlZFwiXG4gICAgLCBAXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIGdldFJlc3VsdDogLT5cbiAgICByZXN1bHQgPSB7fVxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuIyAgICAgIHJlc3VsdFtAcXVlc3Rpb25zLm1vZGVsc1tpXS5nZXQoXCJuYW1lXCIpXSA9XG4gICAgICByZXN1bHRbcXYubmFtZV0gPVxuICAgICAgICBpZiBxdi5ub3RBc2tlZCAjIGJlY2F1c2Ugb2YgZ3JpZCBzY29yZVxuICAgICAgICAgIHF2Lm5vdEFza2VkUmVzdWx0XG4gICAgICAgIGVsc2UgaWYgbm90IF8uaXNFbXB0eShxdi5hbnN3ZXIpICMgdXNlIGFuc3dlclxuICAgICAgICAgIHF2LmFuc3dlclxuICAgICAgICBlbHNlIGlmIHF2LnNraXBwZWRcbiAgICAgICAgICBxdi5za2lwcGVkUmVzdWx0XG4gICAgICAgIGVsc2UgaWYgcXYuaXNTa2lwcGVkXG4gICAgICAgICAgcXYubG9naWNTa2lwcGVkUmVzdWx0XG4gICAgICAgIGVsc2UgaWYgcXYuaXNBdXRvc3RvcHBlZFxuICAgICAgICAgIHF2Lm5vdEFza2VkQXV0b3N0b3BSZXN1bHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHF2LmFuc3dlclxuICAgICwgQFxuICAgIGhhc2ggPSBAbW9kZWwuZ2V0KFwiaGFzaFwiKSBpZiBAbW9kZWwuaGFzKFwiaGFzaFwiKVxuICAgIHN1YnRlc3RSZXN1bHQgPVxuICAgICAgJ2JvZHknIDogcmVzdWx0XG4gICAgICAnbWV0YScgOlxuICAgICAgICAnaGFzaCcgOiBoYXNoXG4jICAgIHJldHVybiByZXN1bHRcblxuICBzaG93RXJyb3JzOiAodmlld3MgPSBAcXVlc3Rpb25WaWV3cykgLT5cbiAgICBAJGVsLmZpbmQoJy5tZXNzYWdlJykucmVtb3ZlKClcbiAgICBmaXJzdCA9IHRydWVcbiAgICB2aWV3cyA9IFt2aWV3c10gaWYgbm90IF8uaXNBcnJheSh2aWV3cylcbiAgICB2aWV3cy5mb3JFYWNoIChxdiwgaSkgLT5cbiAgICAgIGlmIG5vdCBfLmlzU3RyaW5nKHF2KVxuICAgICAgICBtZXNzYWdlID0gXCJcIlxuICAgICAgICBpZiBub3QgcXYuaXNWYWxpZFxuICAgICAgICAgICMgaGFuZGxlIGN1c3RvbSB2YWxpZGF0aW9uIGVycm9yIG1lc3NhZ2VzXG4gICAgICAgICAgY3VzdG9tTWVzc2FnZSA9IHF2Lm1vZGVsLmdldChcImN1c3RvbVZhbGlkYXRpb25NZXNzYWdlXCIpXG4gICAgICAgICAgaWYgbm90IF8uaXNFbXB0eShjdXN0b21NZXNzYWdlKVxuICAgICAgICAgICAgbWVzc2FnZSA9IGN1c3RvbU1lc3NhZ2VcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBtZXNzYWdlID0gQHRleHQucGxlYXNlQW5zd2VyXG5cbiAgICAgICAgICBpZiBmaXJzdCA9PSB0cnVlXG4gICAgICAgICAgICBAc2hvd1F1ZXN0aW9uKGkpIGlmIHZpZXdzID09IEBxdWVzdGlvblZpZXdzXG4gICAgICAgICAgICBxdi4kZWwuc2Nyb2xsVG8oKVxuICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgQHRleHQuY29ycmVjdEVycm9yc1xuICAgICAgICAgICAgZmlyc3QgPSBmYWxzZVxuICAgICAgICBxdi5zZXRNZXNzYWdlIG1lc3NhZ2VcbiAgICAsIEBcblxuXG4gIGdldFN1bTogLT5cbiMgICAgaWYgQHByb3RvdHlwZVZpZXcuZ2V0U3VtP1xuIyAgICAgIHJldHVybiBAcHJvdG90eXBlVmlldy5nZXRTdW0oKVxuIyAgICBlbHNlXG4jIG1heWJlIGEgYmV0dGVyIGZhbGxiYWNrXG4jICAgIGNvbnNvbGUubG9nKFwiVGhpcyB2aWV3IGRvZXMgbm90IHJldHVybiBhIHN1bSwgY29ycmVjdD9cIilcbiAgICByZXR1cm4ge2NvcnJlY3Q6MCxpbmNvcnJlY3Q6MCxtaXNzaW5nOjAsdG90YWw6MH1cblxuICBjaGlsZEV2ZW50czpcbiAgICAnYW5zd2VyIHNjcm9sbCc6ICdvblF1ZXN0aW9uQW5zd2VyJ1xuICAgICdhbnN3ZXInOiAnb25RdWVzdGlvbkFuc3dlcidcbiAgICAncmVuZGVyZWQnOiAnb25RdWVzdGlvblJlbmRlcmVkJ1xuXG4gIGJ1aWxkQ2hpbGRWaWV3OiAoY2hpbGQsIENoaWxkVmlld0NsYXNzLCBjaGlsZFZpZXdPcHRpb25zKSAtPlxuICAgIG9wdGlvbnMgPSBfLmV4dGVuZCh7bW9kZWw6IGNoaWxkfSwgY2hpbGRWaWV3T3B0aW9ucyk7XG4gICAgdmlldyA9IG5ldyBDaGlsZFZpZXdDbGFzcyhvcHRpb25zKVxuXG4jICAgIEBsaXN0ZW5UbyB2aWV3LCBcInJlbmRlcmVkXCIsICAgICAgQG9uUXVlc3Rpb25SZW5kZXJlZFxuIyAgICBAbGlzdGVuVG8gY2hpbGQsIFwiYW5zd2VyIHNjcm9sbFwiLCBAb25RdWVzdGlvbkFuc3dlclxuXG4gICAgQHF1ZXN0aW9uVmlld3NbY2hpbGRWaWV3T3B0aW9ucy5pbmRleF0gPSB2aWV3XG5cbiAgICByZXR1cm4gdmlld1xuICAsXG5cbiMgIFBhc3NlcyBvcHRpb25zIHRvIGVhY2ggY2hpbGRWaWV3IGluc3RhbmNlXG4gIGNoaWxkVmlld09wdGlvbnM6IChtb2RlbCwgaW5kZXgpLT5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgcHJldmlvdXMgPSBAbW9kZWwucGFyZW50LnJlc3VsdC5nZXRCeUhhc2goQG1vZGVsLmdldCgnaGFzaCcpKVxuICAgIG5vdEFza2VkQ291bnQgPSAwXG4gICAgcmVxdWlyZWQgPSBtb2RlbC5nZXROdW1iZXIgXCJsaW5rZWRHcmlkU2NvcmVcIlxuXG4gICAgaXNOb3RBc2tlZCA9ICggKCByZXF1aXJlZCAhPSAwICYmIEBtb2RlbC5wYXJlbnQuZ2V0R3JpZFNjb3JlKCkgPCByZXF1aXJlZCApIHx8IEBtb2RlbC5wYXJlbnQuZ3JpZFdhc0F1dG9zdG9wcGVkKCkgKSAmJiBAbW9kZWwucGFyZW50LmdldEdyaWRTY29yZSgpICE9IGZhbHNlXG5cbiAgICBpZiBpc05vdEFza2VkIHRoZW4gbm90QXNrZWRDb3VudCsrXG5cbiAgICBuYW1lICAgPSBtb2RlbC5lc2NhcGUoXCJuYW1lXCIpLnJlcGxhY2UgL1teQS1aYS16MC05X10vZywgXCItXCJcbiAgICBhbnN3ZXIgPSBwcmV2aW91c1tuYW1lXSBpZiBwcmV2aW91c1xuICAgIGxhYmVscyA9IHt9XG4gICAgbGFiZWxzLnRleHQgPSBAdGV4dFxuICAgIG1vZGVsLnNldCgnbGFiZWxzJywgbGFiZWxzKVxuICAgIG9wdGlvbnMgPVxuICAgICAgbW9kZWwgICAgICAgICA6IG1vZGVsXG4gICAgICBwYXJlbnQgICAgICAgIDogQFxuICAgICAgZGF0YUVudHJ5ICAgICA6IEBkYXRhRW50cnlcbiAgICAgIG5vdEFza2VkICAgICAgOiBpc05vdEFza2VkXG4gICAgICBpc09ic2VydmF0aW9uIDogQGlzT2JzZXJ2YXRpb25cbiAgICAgIGFuc3dlciAgICAgICAgOiBhbnN3ZXJcbiAgICAgIGluZGV4ICA6IGluZGV4XG4gICAgcmV0dXJuIG9wdGlvbnNcblxuICBvbkJlZm9yZVJlbmRlcjogLT5cbiMgICAgQHF1ZXN0aW9ucy5zb3J0KClcblxuICBvblJlbmRlcjogLT5cbiMgICAgQHVwZGF0ZVNraXBMb2dpYygpXG4gICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4gICAgQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG4jICAgIEBsaXN0ZW5UbyBvbmVWaWV3LCBcImFuc3dlciBzY3JvbGxcIiwgQG9uUXVlc3Rpb25BbnN3ZXJcblxuICBvblJlbmRlckNvbGxlY3Rpb246LT5cbiAgICBAdXBkYXRlRXhlY3V0ZVJlYWR5KHRydWUpXG4jICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuIyAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuICBvblF1ZXN0aW9uUmVuZGVyZWQ6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwib25RdWVzdGlvblJlbmRlcmVkIEByZW5kZXJDb3VudDogXCIgKyBAcmVuZGVyQ291bnQpXG4gICAgQHJlbmRlckNvdW50KytcbiMgICAgY29uc29sZS5sb2coXCJvblF1ZXN0aW9uUmVuZGVyZWQgQHJlbmRlckNvdW50IGluY3JlbWVudGVkOiBcIiArIEByZW5kZXJDb3VudClcbiAgICBpZiBAcmVuZGVyQ291bnQgPT0gQHF1ZXN0aW9ucy5sZW5ndGhcbiAgICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuICAgICAgQHVwZGF0ZVNraXBMb2dpYygpXG4gICAgQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG5cbiAgb25DbG9zZTotPlxuICAgIGZvciBxdiBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgcXYuY2xvc2U/KClcbiAgICBAcXVlc3Rpb25WaWV3cyA9IFtdXG5cbiAgcmVzZXQ6IChpbmNyZW1lbnQpIC0+XG4jICAgIGNvbnNvbGUubG9nKFwicmVzZXRcIilcbiAgICBAcmVuZGVyZWQuc3VidGVzdCA9IGZhbHNlXG4gICAgQHJlbmRlcmVkLmFzc2Vzc21lbnQgPSBmYWxzZVxuICAgICMgICAgY3VycmVudFZpZXcgPSBAc3VidGVzdFZpZXdzW0BvcmRlck1hcFtAaW5kZXhdXVxuICAgICMgICAgY3VycmVudFZpZXcuY2xvc2UoKVxuICAgIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlldy5jbG9zZSgpO1xuICAgIEBpbmRleCA9XG4gICAgICBpZiBAYWJvcnRBc3Nlc3NtZW50ID09IHRydWVcbiAgICAgICAgQHN1YnRlc3RWaWV3cy5sZW5ndGgtMVxuICAgICAgZWxzZVxuICAgICAgICBAaW5kZXggKyBpbmNyZW1lbnRcbiAgICBAcmVuZGVyKClcbiAgICB3aW5kb3cuc2Nyb2xsVG8gMCwgMFxuIl19

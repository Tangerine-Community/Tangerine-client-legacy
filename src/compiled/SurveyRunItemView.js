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
    this.model.set('labels', labels);
    this.skippable = this.model.get("skippable") === true || this.model.get("skippable") === "true";
    this.backable = (this.model.get("backButton") === true || this.model.get("backButton") === "true") && this.parent.index !== 0;
    this.parent.displaySkip(this.skippable);
    return this.parent.displayBack(this.backable);
  };

  SurveyRunItemView.prototype.updateProgressButtons = function() {
    var $next, $prev, i, isAvailable, maximum, minimum, qv, ref;
    isAvailable = [];
    ref = this.questionViews;
    for (qv in ref) {
      i = ref[qv];
      if (!(qv.isAutostopped || qv.isSkipped)) {
        isAvailable.push(i);
      }
    }
    isAvailable.push(this.questionIndex);
    $prev = this.parent.$el.find(".prev_question");
    $next = this.parent.$el.find(".next_question");
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

  SurveyRunItemView.prototype.updateQuestionVisibility = function() {
    var $questions;
    if (!this.model.get("focusMode")) {
      return;
    }
    if (this.questionIndex === this.questionViews.length) {
      $(".next_question").hide();
    } else {
      $("#summary_container").empty();
      $(".next_question").show();
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
    'rendered': 'onQuestionRendered',
    'add:child': 'foo'
  };

  SurveyRunItemView.prototype.foo = function() {
    return console.log("test 123 SV child add");
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
    if (this.focusMode) {
      $('#subtest_wrapper').after($("<div id='summary_container'></div> <button class='navigation prev_question'>" + this.text.previousQuestion + "</button> <button class='navigation next_question'>" + this.text.nextQuestion + "</button>"));
    }
    return this.trigger("ready");
  };

  SurveyRunItemView.prototype.onRenderCollection = function() {
    console.log("onRenderCollection");
    this.updateExecuteReady(true);
    return this.trigger("subRendered");
  };

  SurveyRunItemView.prototype.onQuestionRendered = function() {
    this.renderCount++;
    if (this.renderCount === this.questions.length) {
      this.trigger("ready");
      return this.updateSkipLogic();
    }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1bkl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzhCQUVKLFFBQUEsR0FBVSxHQUFJLENBQUEsUUFBQTs7OEJBQ2QsU0FBQSxHQUFXOzs4QkFDWCxPQUFBLEdBQVM7OzhCQUNULFNBQUEsR0FBVzs7OEJBRVgsTUFBQSxHQUNFO0lBQUEsc0JBQUEsRUFBeUIsY0FBekI7SUFDQSxzQkFBQSxFQUF5QixjQUR6Qjs7OzhCQUdGLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFFVixRQUFBO0lBQUEsSUFBQyxDQUFBLEtBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxNQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFDeEIsSUFBQyxDQUFBLFNBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxhQUFELEdBQWlCLE9BQU8sQ0FBQztJQUN6QixJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBa0IsV0FBbEI7SUFDakIsSUFBc0IsSUFBQyxDQUFBLFNBQXZCO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsRUFBakI7O0lBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFdBQUQsR0FBaUI7SUFJakIsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUtBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUNyQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQTtJQVVkLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBbkIsR0FBb0M7SUFDcEMsTUFBQSxHQUFTO0lBQ1QsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUE7SUFDZixJQUFDLENBQUEsS0FBSyxDQUFD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SUFBQyxDQUFBLEtBQUQsR0FDSyxJQUFDLENBQUEsZUFBRCxLQUFvQixJQUF2QixHQUNFLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxHQUFxQixDQUR2QixHQUdFLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDYixJQUFDLENBQUEsTUFBRCxDQUFBO1dBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkI7RUFiSzs7OztHQXhYdUIsUUFBUSxDQUFDLFVBQVUsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9TdXJ2ZXlSdW5JdGVtVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFN1cnZleVJ1bkl0ZW1WaWV3IGV4dGVuZHMgQmFja2JvbmUuTWFyaW9uZXR0ZS5Db21wb3NpdGVWaWV3XG5cbiAgdGVtcGxhdGU6IEpTVFtcIlN1cnZleVwiXSxcbiAgY2hpbGRWaWV3OiBRdWVzdGlvblJ1bkl0ZW1WaWV3LFxuICB0YWdOYW1lOiBcInBcIixcbiAgY2xhc3NOYW1lOiBcIlN1cnZleVJ1bkl0ZW1WaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5uZXh0X3F1ZXN0aW9uJyA6ICduZXh0UXVlc3Rpb24nXG4gICAgJ2NsaWNrIC5wcmV2X3F1ZXN0aW9uJyA6ICdwcmV2UXVlc3Rpb24nXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAbW9kZWwgICAgICAgICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ICAgICAgICA9IEBtb2RlbC5wYXJlbnRcbiAgICBAZGF0YUVudHJ5ICAgICA9IG9wdGlvbnMuZGF0YUVudHJ5XG4gICAgQGlzT2JzZXJ2YXRpb24gPSBvcHRpb25zLmlzT2JzZXJ2YXRpb25cbiAgICBAZm9jdXNNb2RlICAgICA9IEBtb2RlbC5nZXRCb29sZWFuKFwiZm9jdXNNb2RlXCIpXG4gICAgQHF1ZXN0aW9uSW5kZXggPSAwIGlmIEBmb2N1c01vZGVcbiAgICBAcXVlc3Rpb25WaWV3cyA9IFtdXG4gICAgQGFuc3dlcmVkICAgICAgPSBbXVxuICAgIEByZW5kZXJDb3VudCAgID0gMFxuIyAgICBAY2hpbGRWaWV3T3B0aW9ucyA9XG4jICAgICAgICBwYXJlbnQ6IHRoaXNcblxuICAgIEBpMThuKClcbiMgICAgdGhpcy5saXN0ZW5UbyhAbW9kZWwuY29sbGVjdGlvbiwnY2hhbmdlJywgdGhpcy52aWV3UmVuZGVyKVxuIyAgICAgIHRoaXMubGlzdGVuVG8obW9kZWwuY29sbGVjdGlvbiwgJ3Jlc2V0JywgdGhpcy5yZW5kZXIpO1xuIyAgICBpZiBAbW9kZWwucXVlc3Rpb25zLmxlbmd0aCA9PSAwXG4jICAgICAgY29uc29sZS5sb2coXCJObyBxdWVzdGlvbnMuXCIpXG4gICAgQGNvbGxlY3Rpb24gPSBAbW9kZWwucXVlc3Rpb25zXG4gICAgQHF1ZXN0aW9ucyA9IEBjb2xsZWN0aW9uXG4jICAgIEBtb2RlbC5xdWVzdGlvbnMuZmV0Y2hcbiMgICAgICB2aWV3T3B0aW9uczpcbiMgICAgICAgIGtleTogXCJxdWVzdGlvbi0je0Btb2RlbC5pZH1cIlxuIyAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuIyMgICAgICAgIEBtb2RlbC5xdWVzdGlvbnMuc29ydCgpXG4jICAgICAgICBjb2xsZWN0aW9uLnNvcnQoKVxuIyAgICAgICAgQG1vZGVsLmNvbGxlY3Rpb24ubW9kZWxzID0gY29sbGVjdGlvbi5tb2RlbHNcbiMgICAgICAgIEByZW5kZXIoKVxuXG4gICAgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3ID0gQFxuICAgIGxhYmVscyA9IHt9XG4gICAgbGFiZWxzLnRleHQgPSBAdGV4dFxuICAgIEBtb2RlbC5zZXQoJ2xhYmVscycsIGxhYmVscylcblxuICAgIEBza2lwcGFibGUgPSBAbW9kZWwuZ2V0KFwic2tpcHBhYmxlXCIpID09IHRydWUgfHwgQG1vZGVsLmdldChcInNraXBwYWJsZVwiKSA9PSBcInRydWVcIlxuICAgIEBiYWNrYWJsZSA9ICggQG1vZGVsLmdldChcImJhY2tCdXR0b25cIikgPT0gdHJ1ZSB8fCBAbW9kZWwuZ2V0KFwiYmFja0J1dHRvblwiKSA9PSBcInRydWVcIiApIGFuZCBAcGFyZW50LmluZGV4IGlzbnQgMFxuICAgIEBwYXJlbnQuZGlzcGxheVNraXAoQHNraXBwYWJsZSlcbiAgICBAcGFyZW50LmRpc3BsYXlCYWNrKEBiYWNrYWJsZSlcblxuICB1cGRhdGVQcm9ncmVzc0J1dHRvbnM6IC0+XG5cbiAgICBpc0F2YWlsYWJsZSA9IFtdXG4gICAgZm9yIHF2LCBpIG9mIEBxdWVzdGlvblZpZXdzXG4gICAgICBpc0F2YWlsYWJsZS5wdXNoIGkgaWYgbm90IChxdi5pc0F1dG9zdG9wcGVkIG9yIHF2LmlzU2tpcHBlZClcbiAgICBpc0F2YWlsYWJsZS5wdXNoIEBxdWVzdGlvbkluZGV4XG5cbiAgICAkcHJldiA9IEBwYXJlbnQuJGVsLmZpbmQoXCIucHJldl9xdWVzdGlvblwiKVxuICAgICRuZXh0ID0gQHBhcmVudC4kZWwuZmluZChcIi5uZXh0X3F1ZXN0aW9uXCIpXG5cbiAgICBtaW5pbXVtID0gTWF0aC5taW4uYXBwbHkoIG1pbmltdW0sIGlzQXZhaWxhYmxlIClcbiAgICBtYXhpbXVtID0gTWF0aC5tYXguYXBwbHkoIG1heGltdW0sIGlzQXZhaWxhYmxlIClcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IG1pbmltdW1cbiAgICAgICRwcmV2LmhpZGUoKVxuICAgIGVsc2VcbiAgICAgICRwcmV2LnNob3coKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggPT0gbWF4aW11bVxuICAgICAgJG5leHQuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgJG5leHQuc2hvdygpXG5cbiAgdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5OiAtPlxuXG4gICAgcmV0dXJuIHVubGVzcyBAbW9kZWwuZ2V0KFwiZm9jdXNNb2RlXCIpXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCA9PSBAcXVlc3Rpb25WaWV3cy5sZW5ndGhcbiMgICAgICAkKFwiI3N1bW1hcnlfY29udGFpbmVyXCIpLmh0bWwgXCJcbiMgICAgICAgIGxhc3QgcGFnZSBoZXJlXG4jICAgICAgXCJcbiAgICAgICQoXCIubmV4dF9xdWVzdGlvblwiKS5oaWRlKClcbiAgICBlbHNlXG4gICAgICAkKFwiI3N1bW1hcnlfY29udGFpbmVyXCIpLmVtcHR5KClcbiAgICAgICQoXCIubmV4dF9xdWVzdGlvblwiKS5zaG93KClcblxuICAgICRxdWVzdGlvbnMgPSBAJGVsLmZpbmQoXCIucXVlc3Rpb25cIilcbiAgICAkcXVlc3Rpb25zLmhpZGUoKVxuICAgICRxdWVzdGlvbnMuZXEoQHF1ZXN0aW9uSW5kZXgpLnNob3coKVxuXG4gICAgIyB0cmlnZ2VyIHRoZSBxdWVzdGlvbiB0byBydW4gaXQncyBkaXNwbGF5IGNvZGUgaWYgdGhlIHN1YnRlc3QncyBkaXNwbGF5Y29kZSBoYXMgYWxyZWFkeSByYW5cbiAgICAjIGlmIG5vdCwgYWRkIGl0IHRvIGEgbGlzdCB0byBydW4gbGF0ZXIuXG4gICAgaWYgQGV4ZWN1dGVSZWFkeVxuICAgICAgQHF1ZXN0aW9uVmlld3NbQHF1ZXN0aW9uSW5kZXhdLnRyaWdnZXIgXCJzaG93XCJcbiAgICBlbHNlXG4gICAgICBAdHJpZ2dlclNob3dMaXN0ID0gW10gaWYgbm90IEB0cmlnZ2VyU2hvd0xpc3RcbiAgICAgIEB0cmlnZ2VyU2hvd0xpc3QucHVzaCBAcXVlc3Rpb25JbmRleFxuXG4gIHNob3dRdWVzdGlvbjogKGluZGV4KSAtPlxuICAgIEBxdWVzdGlvbkluZGV4ID0gaW5kZXggaWYgXy5pc051bWJlcihpbmRleCkgJiYgaW5kZXggPCBAcXVlc3Rpb25WaWV3cy5sZW5ndGggJiYgaW5kZXggPiAwXG4gICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4gICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG5cbiAgdXBkYXRlRXhlY3V0ZVJlYWR5OiAocmVhZHkpIC0+XG4gICAgQGV4ZWN1dGVSZWFkeSA9IHJlYWR5XG5cbiAgICByZXR1cm4gaWYgbm90IEB0cmlnZ2VyU2hvd0xpc3Q/XG5cbiAgICBpZiBAdHJpZ2dlclNob3dMaXN0Lmxlbmd0aCA+IDBcbiAgICAgIGZvciBpbmRleCBpbiBAdHJpZ2dlclNob3dMaXN0XG4gICAgICAgIEBxdWVzdGlvblZpZXdzW2luZGV4XT8udHJpZ2dlciBcInNob3dcIlxuICAgICAgQHRyaWdnZXJTaG93TGlzdCA9IFtdXG5cbiAgICBAdXBkYXRlU2tpcExvZ2ljKCkgaWYgQGV4ZWN1dGVSZWFkeVxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgcGxlYXNlQW5zd2VyIDogdChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5wbGVhc2VfYW5zd2VyXCIpXG4gICAgICBjb3JyZWN0RXJyb3JzIDogdChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5jb3JyZWN0X2Vycm9yc1wiKVxuICAgICAgbm90RW5vdWdoIDogXyh0KFwiU3VydmV5UnVuVmlldy5tZXNzYWdlLm5vdF9lbm91Z2hcIikpLmVzY2FwZSgpXG5cbiAgICAgIHByZXZpb3VzUXVlc3Rpb24gOiB0KFwiU3VydmV5UnVuVmlldy5idXR0b24ucHJldmlvdXNfcXVlc3Rpb25cIilcbiAgICAgIG5leHRRdWVzdGlvbiA6IHQoXCJTdXJ2ZXlSdW5WaWV3LmJ1dHRvbi5uZXh0X3F1ZXN0aW9uXCIpXG4gICAgICBcIm5leHRcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24ubmV4dFwiKVxuICAgICAgXCJiYWNrXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLmJhY2tcIilcbiAgICAgIFwic2tpcFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5za2lwXCIpXG4gICAgICBcImhlbHBcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uaGVscFwiKVxuXG4gICMgd2hlbiBhIHF1ZXN0aW9uIGlzIGFuc3dlcmVkXG4gIG9uUXVlc3Rpb25BbnN3ZXI6IChlbGVtZW50KSAtPlxuIyAgICBjb25zb2xlLmxvZyhcIm9uUXVlc3Rpb25BbnN3ZXIgQHJlbmRlckNvdW50OlwiICsgQHJlbmRlckNvdW50ICsgXCIgIEBxdWVzdGlvbnMubGVuZ3RoOiBcIiArICBAcXVlc3Rpb25zLmxlbmd0aClcbiMgICAgdGhpcyBpcyBub3QgZ29vZC4gU2hvdWxkIHRlc3QgZm9yID09XG4gICAgcmV0dXJuIHVubGVzcyBAcmVuZGVyQ291bnQgPj0gQHF1ZXN0aW9ucy5sZW5ndGhcblxuICAgICMgYXV0byBzdG9wIGFmdGVyIGxpbWl0XG4gICAgQGF1dG9zdG9wcGVkICAgID0gZmFsc2VcbiAgICBhdXRvc3RvcExpbWl0ICAgPSBAbW9kZWwuZ2V0TnVtYmVyIFwiYXV0b3N0b3BMaW1pdFwiXG4gICAgbG9uZ2VzdFNlcXVlbmNlID0gMFxuICAgIGF1dG9zdG9wQ291bnQgICA9IDBcblxuICAgIGlmIGF1dG9zdG9wTGltaXQgPiAwXG4gICAgICBmb3IgaSBpbiBbMS4uQHF1ZXN0aW9uVmlld3MubGVuZ3RoXSAjIGp1c3QgaW4gY2FzZSB0aGV5IGNhbid0IGNvdW50XG4gICAgICAgIGN1cnJlbnRBbnN3ZXIgPSBAcXVlc3Rpb25WaWV3c1tpLTFdLmFuc3dlclxuICAgICAgICBpZiBjdXJyZW50QW5zd2VyID09IFwiMFwiIG9yIGN1cnJlbnRBbnN3ZXIgPT0gXCI5XCJcbiAgICAgICAgICBhdXRvc3RvcENvdW50KytcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGF1dG9zdG9wQ291bnQgPSAwXG4gICAgICAgIGxvbmdlc3RTZXF1ZW5jZSA9IE1hdGgubWF4KGxvbmdlc3RTZXF1ZW5jZSwgYXV0b3N0b3BDb3VudClcbiAgICAgICAgIyBpZiB0aGUgdmFsdWUgaXMgc2V0LCB3ZSd2ZSBnb3QgYSB0aHJlc2hvbGQgZXhjZWVkaW5nIHJ1biwgYW5kIGl0J3Mgbm90IGFscmVhZHkgYXV0b3N0b3BwZWRcbiAgICAgICAgaWYgYXV0b3N0b3BMaW1pdCAhPSAwICYmIGxvbmdlc3RTZXF1ZW5jZSA+PSBhdXRvc3RvcExpbWl0ICYmIG5vdCBAYXV0b3N0b3BwZWRcbiAgICAgICAgICBAYXV0b3N0b3BwZWQgPSB0cnVlXG4gICAgICAgICAgQGF1dG9zdG9wSW5kZXggPSBpXG4gICAgQHVwZGF0ZUF1dG9zdG9wKClcbiAgICBAdXBkYXRlU2tpcExvZ2ljKClcblxuICB1cGRhdGVBdXRvc3RvcDogLT5cbiAgICBhdXRvc3RvcExpbWl0ID0gQG1vZGVsLmdldE51bWJlciBcImF1dG9zdG9wTGltaXRcIlxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHZpZXcsIGkpIC0+XG4gICAgICBpZiBpID4gKEBhdXRvc3RvcEluZGV4IC0gMSlcbiAgICAgICAgaWYgQGF1dG9zdG9wcGVkXG4gICAgICAgICAgdmlldy5pc0F1dG9zdG9wcGVkID0gdHJ1ZVxuICAgICAgICAgIHZpZXcuJGVsLmFkZENsYXNzICAgIFwiZGlzYWJsZWRfYXV0b3N0b3BcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgdmlldy5pc0F1dG9zdG9wcGVkID0gZmFsc2VcbiAgICAgICAgICB2aWV3LiRlbC5yZW1vdmVDbGFzcyBcImRpc2FibGVkX2F1dG9zdG9wXCJcbiAgICAsIEBcblxuICB1cGRhdGVTa2lwTG9naWM6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwidXBkYXRlU2tpcExvZ2ljXCIpXG4jICAgIGNvbnNvbGUubG9nKFwiQHF1ZXN0aW9uVmlld3NcIiArIEBxdWVzdGlvblZpZXdzLmxlbmd0aClcbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoIChxdikgLT5cbiAgICAgIHF1ZXN0aW9uID0gcXYubW9kZWxcbiAgICAgIHNraXBMb2dpY0NvZGUgPSBxdWVzdGlvbi5nZXRTdHJpbmcgXCJza2lwTG9naWNcIlxuICAgICAgdW5sZXNzIHNraXBMb2dpY0NvZGUgaXMgXCJcIlxuICAgICAgICB0cnlcbiAgICAgICAgICByZXN1bHQgPSBDb2ZmZWVTY3JpcHQuZXZhbC5hcHBseShALCBbc2tpcExvZ2ljQ29kZV0pXG4jICAgICAgICAgIGNvbnNvbGUubG9nKFwic2tpcExvZ2ljQ29kZTogXCIgKyBza2lwTG9naWNDb2RlKVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIG5hbWUgPSAoKC9mdW5jdGlvbiAoLnsxLH0pXFwoLykuZXhlYyhlcnJvci5jb25zdHJ1Y3Rvci50b1N0cmluZygpKVsxXSlcbiAgICAgICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgICAgICAgIGFsZXJ0IFwiU2tpcCBsb2dpYyBlcnJvciBpbiBxdWVzdGlvbiAje3F1ZXN0aW9uLmdldCgnbmFtZScpfVxcblxcbiN7bmFtZX1cXG5cXG4je21lc3NhZ2V9XCJcblxuICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICBxdi4kZWwuYWRkQ2xhc3MgXCJkaXNhYmxlZF9za2lwcGVkXCJcbiAgICAgICAgICBxdi5pc1NraXBwZWQgPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBxdi4kZWwucmVtb3ZlQ2xhc3MgXCJkaXNhYmxlZF9za2lwcGVkXCJcbiAgICAgICAgICBxdi5pc1NraXBwZWQgPSBmYWxzZVxuICAgICAgcXYudXBkYXRlVmFsaWRpdHkoKVxuICAgICwgQFxuXG4gIGlzVmFsaWQ6ICh2aWV3cyA9IEBxdWVzdGlvblZpZXdzKSAtPlxuICAgIHJldHVybiB0cnVlIGlmIG5vdCB2aWV3cz8gIyBpZiB0aGVyZSdzIG5vdGhpbmcgdG8gY2hlY2ssIGl0IG11c3QgYmUgZ29vZFxuICAgIHZpZXdzID0gW3ZpZXdzXSBpZiBub3QgXy5pc0FycmF5KHZpZXdzKVxuICAgIGZvciBxdiwgaSBpbiB2aWV3c1xuICAgICAgcXYudXBkYXRlVmFsaWRpdHkoKVxuICAgICAgIyBjYW4gd2Ugc2tpcCBpdD9cbiAgICAgIGlmIG5vdCBxdi5tb2RlbC5nZXRCb29sZWFuKFwic2tpcHBhYmxlXCIpXG4gICAgICAgICMgaXMgaXQgdmFsaWRcbiAgICAgICAgaWYgbm90IHF2LmlzVmFsaWRcbiAgICAgICAgICAjIHJlZCBhbGVydCEhXG4jICAgICAgICAgIGNvbnNvbGUubG9nKFwicG9wIHVwIGFuIGVycm9yXCIpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4jICAgICwgQFxuICAgIHJldHVybiB0cnVlXG5cbiAgdGVzdFZhbGlkOiAtPlxuIyAgICBjb25zb2xlLmxvZyhcIlN1cnZleVJpbkl0ZW0gdGVzdFZhbGlkLlwiKVxuIyAgICBpZiBub3QgQHByb3RvdHlwZVJlbmRlcmVkIHRoZW4gcmV0dXJuIGZhbHNlXG4jICAgIGN1cnJlbnRWaWV3ID0gVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XG4jICAgIGlmIEBpc1ZhbGlkP1xuIyAgICBjb25zb2xlLmxvZyhcInRlc3R2YWxpZDogXCIgKyBAaXNWYWxpZD8pXG4gICAgcmV0dXJuIEBpc1ZhbGlkKClcbiMgICAgZWxzZVxuIyAgICAgIHJldHVybiBmYWxzZVxuIyAgICB0cnVlXG5cblxuICAjIEBUT0RPIHRoaXMgc2hvdWxkIHByb2JhYmx5IGJlIHJldHVybmluZyBtdWx0aXBsZSwgc2luZ2xlIHR5cGUgaGFzaCB2YWx1ZXNcbiAgZ2V0U2tpcHBlZDogLT5cbiAgICByZXN1bHQgPSB7fVxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuICAgICAgcmVzdWx0W0BxdWVzdGlvbnMubW9kZWxzW2ldLmdldChcIm5hbWVcIildID0gXCJza2lwcGVkXCJcbiAgICAsIEBcbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgZ2V0UmVzdWx0OiAtPlxuICAgIHJlc3VsdCA9IHt9XG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAocXYsIGkpIC0+XG4jICAgICAgcmVzdWx0W0BxdWVzdGlvbnMubW9kZWxzW2ldLmdldChcIm5hbWVcIildID1cbiAgICAgIHJlc3VsdFtxdi5uYW1lXSA9XG4gICAgICAgIGlmIHF2Lm5vdEFza2VkICMgYmVjYXVzZSBvZiBncmlkIHNjb3JlXG4gICAgICAgICAgcXYubm90QXNrZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBub3QgXy5pc0VtcHR5KHF2LmFuc3dlcikgIyB1c2UgYW5zd2VyXG4gICAgICAgICAgcXYuYW5zd2VyXG4gICAgICAgIGVsc2UgaWYgcXYuc2tpcHBlZFxuICAgICAgICAgIHF2LnNraXBwZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBxdi5pc1NraXBwZWRcbiAgICAgICAgICBxdi5sb2dpY1NraXBwZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBxdi5pc0F1dG9zdG9wcGVkXG4gICAgICAgICAgcXYubm90QXNrZWRBdXRvc3RvcFJlc3VsdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgcXYuYW5zd2VyXG4gICAgLCBAXG4gICAgaGFzaCA9IEBtb2RlbC5nZXQoXCJoYXNoXCIpIGlmIEBtb2RlbC5oYXMoXCJoYXNoXCIpXG4gICAgc3VidGVzdFJlc3VsdCA9XG4gICAgICAnYm9keScgOiByZXN1bHRcbiAgICAgICdtZXRhJyA6XG4gICAgICAgICdoYXNoJyA6IGhhc2hcbiMgICAgcmV0dXJuIHJlc3VsdFxuXG4gIHNob3dFcnJvcnM6ICh2aWV3cyA9IEBxdWVzdGlvblZpZXdzKSAtPlxuICAgIEAkZWwuZmluZCgnLm1lc3NhZ2UnKS5yZW1vdmUoKVxuICAgIGZpcnN0ID0gdHJ1ZVxuICAgIHZpZXdzID0gW3ZpZXdzXSBpZiBub3QgXy5pc0FycmF5KHZpZXdzKVxuICAgIHZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuICAgICAgaWYgbm90IF8uaXNTdHJpbmcocXYpXG4gICAgICAgIG1lc3NhZ2UgPSBcIlwiXG4gICAgICAgIGlmIG5vdCBxdi5pc1ZhbGlkXG4gICAgICAgICAgIyBoYW5kbGUgY3VzdG9tIHZhbGlkYXRpb24gZXJyb3IgbWVzc2FnZXNcbiAgICAgICAgICBjdXN0b21NZXNzYWdlID0gcXYubW9kZWwuZ2V0KFwiY3VzdG9tVmFsaWRhdGlvbk1lc3NhZ2VcIilcbiAgICAgICAgICBpZiBub3QgXy5pc0VtcHR5KGN1c3RvbU1lc3NhZ2UpXG4gICAgICAgICAgICBtZXNzYWdlID0gY3VzdG9tTWVzc2FnZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBAdGV4dC5wbGVhc2VBbnN3ZXJcblxuICAgICAgICAgIGlmIGZpcnN0ID09IHRydWVcbiAgICAgICAgICAgIEBzaG93UXVlc3Rpb24oaSkgaWYgdmlld3MgPT0gQHF1ZXN0aW9uVmlld3NcbiAgICAgICAgICAgIHF2LiRlbC5zY3JvbGxUbygpXG4gICAgICAgICAgICBVdGlscy5taWRBbGVydCBAdGV4dC5jb3JyZWN0RXJyb3JzXG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlXG4gICAgICAgIHF2LnNldE1lc3NhZ2UgbWVzc2FnZVxuICAgICwgQFxuXG5cbiAgZ2V0U3VtOiAtPlxuIyAgICBpZiBAcHJvdG90eXBlVmlldy5nZXRTdW0/XG4jICAgICAgcmV0dXJuIEBwcm90b3R5cGVWaWV3LmdldFN1bSgpXG4jICAgIGVsc2VcbiMgbWF5YmUgYSBiZXR0ZXIgZmFsbGJhY2tcbiMgICAgY29uc29sZS5sb2coXCJUaGlzIHZpZXcgZG9lcyBub3QgcmV0dXJuIGEgc3VtLCBjb3JyZWN0P1wiKVxuICAgIHJldHVybiB7Y29ycmVjdDowLGluY29ycmVjdDowLG1pc3Npbmc6MCx0b3RhbDowfVxuXG4gIGNoaWxkRXZlbnRzOlxuICAgICdhbnN3ZXIgc2Nyb2xsJzogJ29uUXVlc3Rpb25BbnN3ZXInXG4gICAgJ2Fuc3dlcic6ICdvblF1ZXN0aW9uQW5zd2VyJ1xuICAgICdyZW5kZXJlZCc6ICdvblF1ZXN0aW9uUmVuZGVyZWQnXG4gICAgJ2FkZDpjaGlsZCc6ICdmb28nXG5cbiAgZm9vOiAtPlxuICAgIGNvbnNvbGUubG9nKFwidGVzdCAxMjMgU1YgY2hpbGQgYWRkXCIpXG5cbiAgIyBwb3B1bGF0ZXMgQHF1ZXN0aW9uVmlld3MgZm9yIHRoaXMgdmlldy5cbiAgYnVpbGRDaGlsZFZpZXc6IChjaGlsZCwgQ2hpbGRWaWV3Q2xhc3MsIGNoaWxkVmlld09wdGlvbnMpIC0+XG4gICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHttb2RlbDogY2hpbGR9LCBjaGlsZFZpZXdPcHRpb25zKTtcbiAgICB2aWV3ID0gbmV3IENoaWxkVmlld0NsYXNzKG9wdGlvbnMpXG5cbiMgICAgQGxpc3RlblRvIHZpZXcsIFwicmVuZGVyZWRcIiwgICAgICBAb25RdWVzdGlvblJlbmRlcmVkXG4jICAgIEBsaXN0ZW5UbyBjaGlsZCwgXCJhbnN3ZXIgc2Nyb2xsXCIsIEBvblF1ZXN0aW9uQW5zd2VyXG5cbiAgICBAcXVlc3Rpb25WaWV3c1tjaGlsZFZpZXdPcHRpb25zLmluZGV4XSA9IHZpZXdcblxuICAgIHJldHVybiB2aWV3XG4gICxcblxuIyAgUGFzc2VzIG9wdGlvbnMgdG8gZWFjaCBjaGlsZFZpZXcgaW5zdGFuY2VcbiAgY2hpbGRWaWV3T3B0aW9uczogKG1vZGVsLCBpbmRleCktPlxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG4gICAgICBwcmV2aW91cyA9IEBtb2RlbC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG4gICAgbm90QXNrZWRDb3VudCA9IDBcbiAgICByZXF1aXJlZCA9IG1vZGVsLmdldE51bWJlciBcImxpbmtlZEdyaWRTY29yZVwiXG5cbiAgICBpc05vdEFza2VkID0gKCAoIHJlcXVpcmVkICE9IDAgJiYgQG1vZGVsLnBhcmVudC5nZXRHcmlkU2NvcmUoKSA8IHJlcXVpcmVkICkgfHwgQG1vZGVsLnBhcmVudC5ncmlkV2FzQXV0b3N0b3BwZWQoKSApICYmIEBtb2RlbC5wYXJlbnQuZ2V0R3JpZFNjb3JlKCkgIT0gZmFsc2VcblxuICAgIGlmIGlzTm90QXNrZWQgdGhlbiBub3RBc2tlZENvdW50KytcblxuICAgIG5hbWUgICA9IG1vZGVsLmVzY2FwZShcIm5hbWVcIikucmVwbGFjZSAvW15BLVphLXowLTlfXS9nLCBcIi1cIlxuICAgIGFuc3dlciA9IHByZXZpb3VzW25hbWVdIGlmIHByZXZpb3VzXG4gICAgbGFiZWxzID0ge31cbiAgICBsYWJlbHMudGV4dCA9IEB0ZXh0XG4gICAgbW9kZWwuc2V0KCdsYWJlbHMnLCBsYWJlbHMpXG4gICAgb3B0aW9ucyA9XG4gICAgICBtb2RlbCAgICAgICAgIDogbW9kZWxcbiAgICAgIHBhcmVudCAgICAgICAgOiBAXG4gICAgICBkYXRhRW50cnkgICAgIDogQGRhdGFFbnRyeVxuICAgICAgbm90QXNrZWQgICAgICA6IGlzTm90QXNrZWRcbiAgICAgIGlzT2JzZXJ2YXRpb24gOiBAaXNPYnNlcnZhdGlvblxuICAgICAgYW5zd2VyICAgICAgICA6IGFuc3dlclxuICAgICAgaW5kZXggIDogaW5kZXhcbiAgICByZXR1cm4gb3B0aW9uc1xuXG4gIG9uQmVmb3JlUmVuZGVyOiAtPlxuIyAgICBAcXVlc3Rpb25zLnNvcnQoKVxuXG4gIG9uUmVuZGVyOiAtPlxuIyAgICBAb25SZW5kZXJDb2xsZWN0aW9uKClcbiAgICBpZiBAZm9jdXNNb2RlXG4gICAgICAkKCcjc3VidGVzdF93cmFwcGVyJykuYWZ0ZXIgJCBcIlxuICAgICAgICAgIDxkaXYgaWQ9J3N1bW1hcnlfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIHByZXZfcXVlc3Rpb24nPiN7QHRleHQucHJldmlvdXNRdWVzdGlvbn08L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIG5leHRfcXVlc3Rpb24nPiN7QHRleHQubmV4dFF1ZXN0aW9ufTwvYnV0dG9uPlxuICAgICAgICBcIlxuIyAgICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuIyAgICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuIyAgICBAdXBkYXRlU2tpcExvZ2ljKClcbiAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiMgICAgQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG4jICAgIEBsaXN0ZW5UbyBvbmVWaWV3LCBcImFuc3dlciBzY3JvbGxcIiwgQG9uUXVlc3Rpb25BbnN3ZXJcblxuICBvblJlbmRlckNvbGxlY3Rpb246LT5cbiAgICBjb25zb2xlLmxvZyhcIm9uUmVuZGVyQ29sbGVjdGlvblwiKVxuICAgIEB1cGRhdGVFeGVjdXRlUmVhZHkodHJ1ZSlcbiMgICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4gICAgQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG5cbiAgb25RdWVzdGlvblJlbmRlcmVkOi0+XG4jICAgIGNvbnNvbGUubG9nKFwib25RdWVzdGlvblJlbmRlcmVkIEByZW5kZXJDb3VudDogXCIgKyBAcmVuZGVyQ291bnQpXG4gICAgQHJlbmRlckNvdW50KytcbiMgICAgY29uc29sZS5sb2coXCJvblF1ZXN0aW9uUmVuZGVyZWQgQHJlbmRlckNvdW50IGluY3JlbWVudGVkOiBcIiArIEByZW5kZXJDb3VudClcbiAgICBpZiBAcmVuZGVyQ291bnQgPT0gQHF1ZXN0aW9ucy5sZW5ndGhcbiAgICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuICAgICAgQHVwZGF0ZVNraXBMb2dpYygpXG4jICAgICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4jICAgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG4jICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4jICBvblNob3c6LT5cbiMgICAgY29uc29sZS5sb2coXCJpU2hvd24hXCIpXG4jICAgIEBvblJlbmRlckNvbGxlY3Rpb24oKVxuXG4gIG9uQ2xvc2U6LT5cbiAgICBmb3IgcXYgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgIHF2LmNsb3NlPygpXG4gICAgQHF1ZXN0aW9uVmlld3MgPSBbXVxuXG4gIHJlc2V0OiAoaW5jcmVtZW50KSAtPlxuIyAgICBjb25zb2xlLmxvZyhcInJlc2V0XCIpXG4gICAgQHJlbmRlcmVkLnN1YnRlc3QgPSBmYWxzZVxuICAgIEByZW5kZXJlZC5hc3Nlc3NtZW50ID0gZmFsc2VcbiAgICAjICAgIGN1cnJlbnRWaWV3ID0gQHN1YnRlc3RWaWV3c1tAb3JkZXJNYXBbQGluZGV4XV1cbiAgICAjICAgIGN1cnJlbnRWaWV3LmNsb3NlKClcbiAgICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcuY2xvc2UoKTtcbiAgICBAaW5kZXggPVxuICAgICAgaWYgQGFib3J0QXNzZXNzbWVudCA9PSB0cnVlXG4gICAgICAgIEBzdWJ0ZXN0Vmlld3MubGVuZ3RoLTFcbiAgICAgIGVsc2VcbiAgICAgICAgQGluZGV4ICsgaW5jcmVtZW50XG4gICAgQHJlbmRlcigpXG4gICAgd2luZG93LnNjcm9sbFRvIDAsIDBcbiJdfQ==

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
    this.notAskedCount = 0;
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
    this.parent.displayBack(this.backable);
    return this.listenTo;
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
    return this.updateQuestionVisibility();
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
    var childView, isNotAsked, options, required;
    options = _.extend({
      model: child
    }, childViewOptions);
    childView = new ChildViewClass(options);
    required = child.getNumber("linkedGridScore");
    isNotAsked = ((required !== 0 && this.parent.getGridScore() < required) || this.parent.gridWasAutostopped()) && this.parent.getGridScore() !== false;
    child.set("notAsked", isNotAsked);
    if (isNotAsked) {
      this.notAskedCount++;
    }
    Marionette.MonitorDOMRefresh(childView);
    this.questionViews[childViewOptions.index] = childView;
    return childView;
  };

  SurveyRunItemView.prototype.childViewOptions = function(model, index) {
    var answer, labels, name, options, previous;
    if (!this.dataEntry) {
      previous = this.model.parent.result.getByHash(this.model.get('hash'));
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
      notAsked: model.get("notAsked"),
      isObservation: this.isObservation,
      answer: answer,
      index: index
    };
    return options;
  };

  SurveyRunItemView.prototype.onBeforeRender = function() {};

  SurveyRunItemView.prototype.onRender = function() {
    var notAskedCount;
    notAskedCount = 0;
    if (this.model.questions != null) {
      this.model.questions.models.forEach((function(_this) {
        return function(question, i) {
          var isNotAsked, required;
          required = question.getNumber("linkedGridScore");
          isNotAsked = ((required !== 0 && _this.parent.getGridScore() < required) || _this.parent.gridWasAutostopped()) && _this.parent.getGridScore() !== false;
          question.set("notAsked", isNotAsked);
          if (isNotAsked) {
            return _this.notAskedCount++;
          }
        };
      })(this));
    }
    return this.trigger("ready");
  };

  SurveyRunItemView.prototype.onRenderCollection = function() {
    var base;
    if (this.focusMode) {
      $('#subtest_wrapper').after($("<div id='summary_container'></div> <button class='navigation prev_question'>" + this.text.previousQuestion + "</button> <button class='navigation next_question'>" + this.text.nextQuestion + "</button>"));
    }
    this.updateExecuteReady(true);
    this.updateQuestionVisibility();
    this.updateProgressButtons();
    if (this.questions.length === this.notAskedCount) {
      if (Tangerine.settings.get("context") !== "class") {
        if (typeof (base = this.parent).next === "function") {
          base.next();
        }
      } else {
        alert(this.text.notEnough);
      }
    }
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
    console.log("reset");
    this.rendered.subtest = false;
    this.rendered.assessment = false;
    Tangerine.progress.currentSubview.close();
    this.index = this.abortAssessment === true ? this.subtestViews.length - 1 : this.index + increment;
    this.render();
    return window.scrollTo(0, 0);
  };

  return SurveyRunItemView;

})(Backbone.Marionette.CompositeView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1bkl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzhCQUVKLFFBQUEsR0FBVSxHQUFJLENBQUEsUUFBQTs7OEJBQ2QsU0FBQSxHQUFXOzs4QkFDWCxPQUFBLEdBQVM7OzhCQUNULFNBQUEsR0FBVzs7OEJBRVgsTUFBQSxHQUNFO0lBQUEsc0JBQUEsRUFBeUIsY0FBekI7SUFDQSxzQkFBQSxFQUF5QixjQUR6Qjs7OzhCQUdGLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFFVixRQUFBO0lBQUEsSUFBQyxDQUFBLEtBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxNQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFDeEIsSUFBQyxDQUFBLFNBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxhQUFELEdBQWlCLE9BQU8sQ0FBQztJQUN6QixJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBa0IsV0FBbEI7SUFDakIsSUFBc0IsSUFBQyxDQUFBLFNBQXZCO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsRUFBakI7O0lBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFdBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFJakIsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUtBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUNyQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQTtJQVdkLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBbkIsR0FBb0M7SUFDcEMsTUFBQSxHQUFTO0lBQ1QsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENB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QixJQUF2QixHQUNFLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxHQUFxQixDQUR2QixHQUdFLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDYixJQUFDLENBQUEsTUFBRCxDQUFBO1dBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkI7RUFiSzs7OztHQS9YdUIsUUFBUSxDQUFDLFVBQVUsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9TdXJ2ZXlSdW5JdGVtVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFN1cnZleVJ1bkl0ZW1WaWV3IGV4dGVuZHMgQmFja2JvbmUuTWFyaW9uZXR0ZS5Db21wb3NpdGVWaWV3XG5cbiAgdGVtcGxhdGU6IEpTVFtcIlN1cnZleVwiXSxcbiAgY2hpbGRWaWV3OiBRdWVzdGlvblJ1bkl0ZW1WaWV3LFxuICB0YWdOYW1lOiBcInBcIixcbiAgY2xhc3NOYW1lOiBcIlN1cnZleVJ1bkl0ZW1WaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5uZXh0X3F1ZXN0aW9uJyA6ICduZXh0UXVlc3Rpb24nXG4gICAgJ2NsaWNrIC5wcmV2X3F1ZXN0aW9uJyA6ICdwcmV2UXVlc3Rpb24nXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAbW9kZWwgICAgICAgICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ICAgICAgICA9IEBtb2RlbC5wYXJlbnRcbiAgICBAZGF0YUVudHJ5ICAgICA9IG9wdGlvbnMuZGF0YUVudHJ5XG4gICAgQGlzT2JzZXJ2YXRpb24gPSBvcHRpb25zLmlzT2JzZXJ2YXRpb25cbiAgICBAZm9jdXNNb2RlICAgICA9IEBtb2RlbC5nZXRCb29sZWFuKFwiZm9jdXNNb2RlXCIpXG4gICAgQHF1ZXN0aW9uSW5kZXggPSAwIGlmIEBmb2N1c01vZGVcbiAgICBAcXVlc3Rpb25WaWV3cyA9IFtdXG4gICAgQGFuc3dlcmVkICAgICAgPSBbXVxuICAgIEByZW5kZXJDb3VudCAgID0gMFxuICAgIEBub3RBc2tlZENvdW50ID0gMFxuIyAgICBAY2hpbGRWaWV3T3B0aW9ucyA9XG4jICAgICAgICBwYXJlbnQ6IHRoaXNcblxuICAgIEBpMThuKClcbiMgICAgdGhpcy5saXN0ZW5UbyhAbW9kZWwuY29sbGVjdGlvbiwnY2hhbmdlJywgdGhpcy52aWV3UmVuZGVyKVxuIyAgICAgIHRoaXMubGlzdGVuVG8obW9kZWwuY29sbGVjdGlvbiwgJ3Jlc2V0JywgdGhpcy5yZW5kZXIpO1xuIyAgICBpZiBAbW9kZWwucXVlc3Rpb25zLmxlbmd0aCA9PSAwXG4jICAgICAgY29uc29sZS5sb2coXCJObyBxdWVzdGlvbnMuXCIpXG4gICAgQGNvbGxlY3Rpb24gPSBAbW9kZWwucXVlc3Rpb25zXG4gICAgQHF1ZXN0aW9ucyA9IEBjb2xsZWN0aW9uXG5cbiMgICAgQG1vZGVsLnF1ZXN0aW9ucy5mZXRjaFxuIyAgICAgIHZpZXdPcHRpb25zOlxuIyAgICAgICAga2V5OiBcInF1ZXN0aW9uLSN7QG1vZGVsLmlkfVwiXG4jICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pID0+XG4jIyAgICAgICAgQG1vZGVsLnF1ZXN0aW9ucy5zb3J0KClcbiMgICAgICAgIGNvbGxlY3Rpb24uc29ydCgpXG4jICAgICAgICBAbW9kZWwuY29sbGVjdGlvbi5tb2RlbHMgPSBjb2xsZWN0aW9uLm1vZGVsc1xuIyAgICAgICAgQHJlbmRlcigpXG5cbiAgICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcgPSBAXG4gICAgbGFiZWxzID0ge31cbiAgICBsYWJlbHMudGV4dCA9IEB0ZXh0XG4gICAgQG1vZGVsLnNldCgnbGFiZWxzJywgbGFiZWxzKVxuXG4gICAgQHNraXBwYWJsZSA9IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gdHJ1ZSB8fCBAbW9kZWwuZ2V0KFwic2tpcHBhYmxlXCIpID09IFwidHJ1ZVwiXG4gICAgQGJhY2thYmxlID0gKCBAbW9kZWwuZ2V0KFwiYmFja0J1dHRvblwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IFwidHJ1ZVwiICkgYW5kIEBwYXJlbnQuaW5kZXggaXNudCAwXG4gICAgQHBhcmVudC5kaXNwbGF5U2tpcChAc2tpcHBhYmxlKVxuICAgIEBwYXJlbnQuZGlzcGxheUJhY2soQGJhY2thYmxlKVxuXG4gICAgQGxpc3RlblRvXG5cbiAgdXBkYXRlUHJvZ3Jlc3NCdXR0b25zOiAtPlxuXG4gICAgaXNBdmFpbGFibGUgPSBbXVxuICAgIGZvciBxdiwgaSBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgaXNBdmFpbGFibGUucHVzaCBpIGlmIG5vdCAocXYuaXNBdXRvc3RvcHBlZCBvciBxdi5pc1NraXBwZWQpXG4gICAgaXNBdmFpbGFibGUucHVzaCBAcXVlc3Rpb25JbmRleFxuXG4gICAgJHByZXYgPSBAcGFyZW50LiRlbC5maW5kKFwiLnByZXZfcXVlc3Rpb25cIilcbiAgICAkbmV4dCA9IEBwYXJlbnQuJGVsLmZpbmQoXCIubmV4dF9xdWVzdGlvblwiKVxuXG4gICAgbWluaW11bSA9IE1hdGgubWluLmFwcGx5KCBtaW5pbXVtLCBpc0F2YWlsYWJsZSApXG4gICAgbWF4aW11bSA9IE1hdGgubWF4LmFwcGx5KCBtYXhpbXVtLCBpc0F2YWlsYWJsZSApXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCA9PSBtaW5pbXVtXG4gICAgICAkcHJldi5oaWRlKClcbiAgICBlbHNlXG4gICAgICAkcHJldi5zaG93KClcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IG1heGltdW1cbiAgICAgICRuZXh0LmhpZGUoKVxuICAgIGVsc2VcbiAgICAgICRuZXh0LnNob3coKVxuXG4gIHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eTogLT5cblxuICAgIHJldHVybiB1bmxlc3MgQG1vZGVsLmdldChcImZvY3VzTW9kZVwiKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggPT0gQHF1ZXN0aW9uVmlld3MubGVuZ3RoXG4jICAgICAgJChcIiNzdW1tYXJ5X2NvbnRhaW5lclwiKS5odG1sIFwiXG4jICAgICAgICBsYXN0IHBhZ2UgaGVyZVxuIyAgICAgIFwiXG4gICAgICAkKFwiLm5leHRfcXVlc3Rpb25cIikuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgJChcIiNzdW1tYXJ5X2NvbnRhaW5lclwiKS5lbXB0eSgpXG4gICAgICAkKFwiLm5leHRfcXVlc3Rpb25cIikuc2hvdygpXG5cbiAgICAkcXVlc3Rpb25zID0gQCRlbC5maW5kKFwiLnF1ZXN0aW9uXCIpXG4gICAgJHF1ZXN0aW9ucy5oaWRlKClcbiAgICAkcXVlc3Rpb25zLmVxKEBxdWVzdGlvbkluZGV4KS5zaG93KClcblxuICAgICMgdHJpZ2dlciB0aGUgcXVlc3Rpb24gdG8gcnVuIGl0J3MgZGlzcGxheSBjb2RlIGlmIHRoZSBzdWJ0ZXN0J3MgZGlzcGxheWNvZGUgaGFzIGFscmVhZHkgcmFuXG4gICAgIyBpZiBub3QsIGFkZCBpdCB0byBhIGxpc3QgdG8gcnVuIGxhdGVyLlxuICAgIGlmIEBleGVjdXRlUmVhZHlcbiAgICAgIEBxdWVzdGlvblZpZXdzW0BxdWVzdGlvbkluZGV4XS50cmlnZ2VyIFwic2hvd1wiXG4gICAgZWxzZVxuICAgICAgQHRyaWdnZXJTaG93TGlzdCA9IFtdIGlmIG5vdCBAdHJpZ2dlclNob3dMaXN0XG4gICAgICBAdHJpZ2dlclNob3dMaXN0LnB1c2ggQHF1ZXN0aW9uSW5kZXhcblxuICBzaG93UXVlc3Rpb246IChpbmRleCkgLT5cbiAgICBAcXVlc3Rpb25JbmRleCA9IGluZGV4IGlmIF8uaXNOdW1iZXIoaW5kZXgpICYmIGluZGV4IDwgQHF1ZXN0aW9uVmlld3MubGVuZ3RoICYmIGluZGV4ID4gMFxuICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuIyAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICB1cGRhdGVFeGVjdXRlUmVhZHk6IChyZWFkeSkgLT5cbiAgICBAZXhlY3V0ZVJlYWR5ID0gcmVhZHlcblxuICAgIHJldHVybiBpZiBub3QgQHRyaWdnZXJTaG93TGlzdD9cblxuICAgIGlmIEB0cmlnZ2VyU2hvd0xpc3QubGVuZ3RoID4gMFxuICAgICAgZm9yIGluZGV4IGluIEB0cmlnZ2VyU2hvd0xpc3RcbiAgICAgICAgQHF1ZXN0aW9uVmlld3NbaW5kZXhdPy50cmlnZ2VyIFwic2hvd1wiXG4gICAgICBAdHJpZ2dlclNob3dMaXN0ID0gW11cblxuICAgIEB1cGRhdGVTa2lwTG9naWMoKSBpZiBAZXhlY3V0ZVJlYWR5XG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICBwbGVhc2VBbnN3ZXIgOiB0KFwiU3VydmV5UnVuVmlldy5tZXNzYWdlLnBsZWFzZV9hbnN3ZXJcIilcbiAgICAgIGNvcnJlY3RFcnJvcnMgOiB0KFwiU3VydmV5UnVuVmlldy5tZXNzYWdlLmNvcnJlY3RfZXJyb3JzXCIpXG4gICAgICBub3RFbm91Z2ggOiBfKHQoXCJTdXJ2ZXlSdW5WaWV3Lm1lc3NhZ2Uubm90X2Vub3VnaFwiKSkuZXNjYXBlKClcblxuICAgICAgcHJldmlvdXNRdWVzdGlvbiA6IHQoXCJTdXJ2ZXlSdW5WaWV3LmJ1dHRvbi5wcmV2aW91c19xdWVzdGlvblwiKVxuICAgICAgbmV4dFF1ZXN0aW9uIDogdChcIlN1cnZleVJ1blZpZXcuYnV0dG9uLm5leHRfcXVlc3Rpb25cIilcbiAgICAgIFwibmV4dFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5uZXh0XCIpXG4gICAgICBcImJhY2tcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uYmFja1wiKVxuICAgICAgXCJza2lwXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLnNraXBcIilcbiAgICAgIFwiaGVscFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5oZWxwXCIpXG5cbiAgIyB3aGVuIGEgcXVlc3Rpb24gaXMgYW5zd2VyZWRcbiAgb25RdWVzdGlvbkFuc3dlcjogKGVsZW1lbnQpIC0+XG4jICAgIGNvbnNvbGUubG9nKFwib25RdWVzdGlvbkFuc3dlciBAcmVuZGVyQ291bnQ6XCIgKyBAcmVuZGVyQ291bnQgKyBcIiAgQHF1ZXN0aW9ucy5sZW5ndGg6IFwiICsgIEBxdWVzdGlvbnMubGVuZ3RoKVxuIyAgICB0aGlzIGlzIG5vdCBnb29kLiBTaG91bGQgdGVzdCBmb3IgPT1cbiAgICByZXR1cm4gdW5sZXNzIEByZW5kZXJDb3VudCA+PSBAcXVlc3Rpb25zLmxlbmd0aFxuXG4gICAgIyBhdXRvIHN0b3AgYWZ0ZXIgbGltaXRcbiAgICBAYXV0b3N0b3BwZWQgICAgPSBmYWxzZVxuICAgIGF1dG9zdG9wTGltaXQgICA9IEBtb2RlbC5nZXROdW1iZXIgXCJhdXRvc3RvcExpbWl0XCJcbiAgICBsb25nZXN0U2VxdWVuY2UgPSAwXG4gICAgYXV0b3N0b3BDb3VudCAgID0gMFxuXG4gICAgaWYgYXV0b3N0b3BMaW1pdCA+IDBcbiAgICAgIGZvciBpIGluIFsxLi5AcXVlc3Rpb25WaWV3cy5sZW5ndGhdICMganVzdCBpbiBjYXNlIHRoZXkgY2FuJ3QgY291bnRcbiAgICAgICAgY3VycmVudEFuc3dlciA9IEBxdWVzdGlvblZpZXdzW2ktMV0uYW5zd2VyXG4gICAgICAgIGlmIGN1cnJlbnRBbnN3ZXIgPT0gXCIwXCIgb3IgY3VycmVudEFuc3dlciA9PSBcIjlcIlxuICAgICAgICAgIGF1dG9zdG9wQ291bnQrK1xuICAgICAgICBlbHNlXG4gICAgICAgICAgYXV0b3N0b3BDb3VudCA9IDBcbiAgICAgICAgbG9uZ2VzdFNlcXVlbmNlID0gTWF0aC5tYXgobG9uZ2VzdFNlcXVlbmNlLCBhdXRvc3RvcENvdW50KVxuICAgICAgICAjIGlmIHRoZSB2YWx1ZSBpcyBzZXQsIHdlJ3ZlIGdvdCBhIHRocmVzaG9sZCBleGNlZWRpbmcgcnVuLCBhbmQgaXQncyBub3QgYWxyZWFkeSBhdXRvc3RvcHBlZFxuICAgICAgICBpZiBhdXRvc3RvcExpbWl0ICE9IDAgJiYgbG9uZ2VzdFNlcXVlbmNlID49IGF1dG9zdG9wTGltaXQgJiYgbm90IEBhdXRvc3RvcHBlZFxuICAgICAgICAgIEBhdXRvc3RvcHBlZCA9IHRydWVcbiAgICAgICAgICBAYXV0b3N0b3BJbmRleCA9IGlcbiAgICBAdXBkYXRlQXV0b3N0b3AoKVxuICAgIEB1cGRhdGVTa2lwTG9naWMoKVxuXG4gIHVwZGF0ZUF1dG9zdG9wOiAtPlxuICAgIGF1dG9zdG9wTGltaXQgPSBAbW9kZWwuZ2V0TnVtYmVyIFwiYXV0b3N0b3BMaW1pdFwiXG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAodmlldywgaSkgLT5cbiAgICAgIGlmIGkgPiAoQGF1dG9zdG9wSW5kZXggLSAxKVxuICAgICAgICBpZiBAYXV0b3N0b3BwZWRcbiAgICAgICAgICB2aWV3LmlzQXV0b3N0b3BwZWQgPSB0cnVlXG4gICAgICAgICAgdmlldy4kZWwuYWRkQ2xhc3MgICAgXCJkaXNhYmxlZF9hdXRvc3RvcFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB2aWV3LmlzQXV0b3N0b3BwZWQgPSBmYWxzZVxuICAgICAgICAgIHZpZXcuJGVsLnJlbW92ZUNsYXNzIFwiZGlzYWJsZWRfYXV0b3N0b3BcIlxuICAgICwgQFxuXG4gIHVwZGF0ZVNraXBMb2dpYzogLT5cbiMgICAgY29uc29sZS5sb2coXCJ1cGRhdGVTa2lwTG9naWNcIilcbiMgICAgY29uc29sZS5sb2coXCJAcXVlc3Rpb25WaWV3c1wiICsgQHF1ZXN0aW9uVmlld3MubGVuZ3RoKVxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHF2KSAtPlxuICAgICAgcXVlc3Rpb24gPSBxdi5tb2RlbFxuICAgICAgc2tpcExvZ2ljQ29kZSA9IHF1ZXN0aW9uLmdldFN0cmluZyBcInNraXBMb2dpY1wiXG4gICAgICB1bmxlc3Mgc2tpcExvZ2ljQ29kZSBpcyBcIlwiXG4gICAgICAgIHRyeVxuICAgICAgICAgIHJlc3VsdCA9IENvZmZlZVNjcmlwdC5ldmFsLmFwcGx5KEAsIFtza2lwTG9naWNDb2RlXSlcbiMgICAgICAgICAgY29uc29sZS5sb2coXCJza2lwTG9naWNDb2RlOiBcIiArIHNraXBMb2dpY0NvZGUpXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgbmFtZSA9ICgoL2Z1bmN0aW9uICguezEsfSlcXCgvKS5leGVjKGVycm9yLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkpWzFdKVxuICAgICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgICAgYWxlcnQgXCJTa2lwIGxvZ2ljIGVycm9yIGluIHF1ZXN0aW9uICN7cXVlc3Rpb24uZ2V0KCduYW1lJyl9XFxuXFxuI3tuYW1lfVxcblxcbiN7bWVzc2FnZX1cIlxuXG4gICAgICAgIGlmIHJlc3VsdFxuICAgICAgICAgIHF2LiRlbC5hZGRDbGFzcyBcImRpc2FibGVkX3NraXBwZWRcIlxuICAgICAgICAgIHF2LmlzU2tpcHBlZCA9IHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHF2LiRlbC5yZW1vdmVDbGFzcyBcImRpc2FibGVkX3NraXBwZWRcIlxuICAgICAgICAgIHF2LmlzU2tpcHBlZCA9IGZhbHNlXG4gICAgICBxdi51cGRhdGVWYWxpZGl0eSgpXG4gICAgLCBAXG5cbiAgaXNWYWxpZDogKHZpZXdzID0gQHF1ZXN0aW9uVmlld3MpIC0+XG4gICAgcmV0dXJuIHRydWUgaWYgbm90IHZpZXdzPyAjIGlmIHRoZXJlJ3Mgbm90aGluZyB0byBjaGVjaywgaXQgbXVzdCBiZSBnb29kXG4gICAgdmlld3MgPSBbdmlld3NdIGlmIG5vdCBfLmlzQXJyYXkodmlld3MpXG4gICAgZm9yIHF2LCBpIGluIHZpZXdzXG4gICAgICBxdi51cGRhdGVWYWxpZGl0eSgpXG4gICAgICAjIGNhbiB3ZSBza2lwIGl0P1xuICAgICAgaWYgbm90IHF2Lm1vZGVsLmdldEJvb2xlYW4oXCJza2lwcGFibGVcIilcbiAgICAgICAgIyBpcyBpdCB2YWxpZFxuICAgICAgICBpZiBub3QgcXYuaXNWYWxpZFxuICAgICAgICAgICMgcmVkIGFsZXJ0ISFcbiMgICAgICAgICAgY29uc29sZS5sb2coXCJwb3AgdXAgYW4gZXJyb3JcIilcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiMgICAgLCBAXG4gICAgcmV0dXJuIHRydWVcblxuICB0ZXN0VmFsaWQ6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwiU3VydmV5UmluSXRlbSB0ZXN0VmFsaWQuXCIpXG4jICAgIGlmIG5vdCBAcHJvdG90eXBlUmVuZGVyZWQgdGhlbiByZXR1cm4gZmFsc2VcbiMgICAgY3VycmVudFZpZXcgPSBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXdcbiMgICAgaWYgQGlzVmFsaWQ/XG4jICAgIGNvbnNvbGUubG9nKFwidGVzdHZhbGlkOiBcIiArIEBpc1ZhbGlkPylcbiAgICByZXR1cm4gQGlzVmFsaWQoKVxuIyAgICBlbHNlXG4jICAgICAgcmV0dXJuIGZhbHNlXG4jICAgIHRydWVcblxuXG4gICMgQFRPRE8gdGhpcyBzaG91bGQgcHJvYmFibHkgYmUgcmV0dXJuaW5nIG11bHRpcGxlLCBzaW5nbGUgdHlwZSBoYXNoIHZhbHVlc1xuICBnZXRTa2lwcGVkOiAtPlxuICAgIHJlc3VsdCA9IHt9XG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAocXYsIGkpIC0+XG4gICAgICByZXN1bHRbQHF1ZXN0aW9ucy5tb2RlbHNbaV0uZ2V0KFwibmFtZVwiKV0gPSBcInNraXBwZWRcIlxuICAgICwgQFxuICAgIHJldHVybiByZXN1bHRcblxuICBnZXRSZXN1bHQ6IC0+XG4gICAgcmVzdWx0ID0ge31cbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoIChxdiwgaSkgLT5cbiMgICAgICByZXN1bHRbQHF1ZXN0aW9ucy5tb2RlbHNbaV0uZ2V0KFwibmFtZVwiKV0gPVxuICAgICAgcmVzdWx0W3F2Lm5hbWVdID1cbiAgICAgICAgaWYgcXYubm90QXNrZWQgIyBiZWNhdXNlIG9mIGdyaWQgc2NvcmVcbiAgICAgICAgICBxdi5ub3RBc2tlZFJlc3VsdFxuICAgICAgICBlbHNlIGlmIG5vdCBfLmlzRW1wdHkocXYuYW5zd2VyKSAjIHVzZSBhbnN3ZXJcbiAgICAgICAgICBxdi5hbnN3ZXJcbiAgICAgICAgZWxzZSBpZiBxdi5za2lwcGVkXG4gICAgICAgICAgcXYuc2tpcHBlZFJlc3VsdFxuICAgICAgICBlbHNlIGlmIHF2LmlzU2tpcHBlZFxuICAgICAgICAgIHF2LmxvZ2ljU2tpcHBlZFJlc3VsdFxuICAgICAgICBlbHNlIGlmIHF2LmlzQXV0b3N0b3BwZWRcbiAgICAgICAgICBxdi5ub3RBc2tlZEF1dG9zdG9wUmVzdWx0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBxdi5hbnN3ZXJcbiAgICAsIEBcbiAgICBoYXNoID0gQG1vZGVsLmdldChcImhhc2hcIikgaWYgQG1vZGVsLmhhcyhcImhhc2hcIilcbiAgICBzdWJ0ZXN0UmVzdWx0ID1cbiAgICAgICdib2R5JyA6IHJlc3VsdFxuICAgICAgJ21ldGEnIDpcbiAgICAgICAgJ2hhc2gnIDogaGFzaFxuIyAgICByZXR1cm4gcmVzdWx0XG5cbiAgc2hvd0Vycm9yczogKHZpZXdzID0gQHF1ZXN0aW9uVmlld3MpIC0+XG4gICAgQCRlbC5maW5kKCcubWVzc2FnZScpLnJlbW92ZSgpXG4gICAgZmlyc3QgPSB0cnVlXG4gICAgdmlld3MgPSBbdmlld3NdIGlmIG5vdCBfLmlzQXJyYXkodmlld3MpXG4gICAgdmlld3MuZm9yRWFjaCAocXYsIGkpIC0+XG4gICAgICBpZiBub3QgXy5pc1N0cmluZyhxdilcbiAgICAgICAgbWVzc2FnZSA9IFwiXCJcbiAgICAgICAgaWYgbm90IHF2LmlzVmFsaWRcbiAgICAgICAgICAjIGhhbmRsZSBjdXN0b20gdmFsaWRhdGlvbiBlcnJvciBtZXNzYWdlc1xuICAgICAgICAgIGN1c3RvbU1lc3NhZ2UgPSBxdi5tb2RlbC5nZXQoXCJjdXN0b21WYWxpZGF0aW9uTWVzc2FnZVwiKVxuICAgICAgICAgIGlmIG5vdCBfLmlzRW1wdHkoY3VzdG9tTWVzc2FnZSlcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBjdXN0b21NZXNzYWdlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgbWVzc2FnZSA9IEB0ZXh0LnBsZWFzZUFuc3dlclxuXG4gICAgICAgICAgaWYgZmlyc3QgPT0gdHJ1ZVxuICAgICAgICAgICAgQHNob3dRdWVzdGlvbihpKSBpZiB2aWV3cyA9PSBAcXVlc3Rpb25WaWV3c1xuICAgICAgICAgICAgcXYuJGVsLnNjcm9sbFRvKClcbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IEB0ZXh0LmNvcnJlY3RFcnJvcnNcbiAgICAgICAgICAgIGZpcnN0ID0gZmFsc2VcbiAgICAgICAgcXYuc2V0TWVzc2FnZSBtZXNzYWdlXG4gICAgLCBAXG5cblxuICBnZXRTdW06IC0+XG4gICAgcmV0dXJuIHtjb3JyZWN0OjAsaW5jb3JyZWN0OjAsbWlzc2luZzowLHRvdGFsOjB9XG5cbiAgY2hpbGRFdmVudHM6XG4gICAgJ2Fuc3dlciBzY3JvbGwnOiAnb25RdWVzdGlvbkFuc3dlcidcbiAgICAnYW5zd2VyJzogJ29uUXVlc3Rpb25BbnN3ZXInXG4gICAgJ3JlbmRlcmVkJzogJ29uUXVlc3Rpb25SZW5kZXJlZCdcbiAgICAnYWRkOmNoaWxkJzogJ2ZvbydcblxuICAjIFRoaXMgdGVzdHMgaWYgYWRkOmNoaWxkIGlzIHRyaWdnZXJlZCBvbiB0aGUgc3VidGVzdCBpbnN0ZWFkIG9mIG9uIEFzc2Vzc21lbnRDb21wb3NpdGVWaWV3LlxuICBmb286IC0+XG4gICAgY29uc29sZS5sb2coXCJ0ZXN0IDEyMyBTViBjaGlsZCBhZGRcIilcblxuICAjIHBvcHVsYXRlcyBAcXVlc3Rpb25WaWV3cyBmb3IgdGhpcyB2aWV3LlxuICBidWlsZENoaWxkVmlldzogKGNoaWxkLCBDaGlsZFZpZXdDbGFzcywgY2hpbGRWaWV3T3B0aW9ucykgLT5cbiAgICBvcHRpb25zID0gXy5leHRlbmQoe21vZGVsOiBjaGlsZH0sIGNoaWxkVmlld09wdGlvbnMpO1xuICAgIGNoaWxkVmlldyA9IG5ldyBDaGlsZFZpZXdDbGFzcyhvcHRpb25zKVxuICAgIHJlcXVpcmVkID0gY2hpbGQuZ2V0TnVtYmVyIFwibGlua2VkR3JpZFNjb3JlXCJcbiAgICBpc05vdEFza2VkID0gKCAoIHJlcXVpcmVkICE9IDAgJiYgQHBhcmVudC5nZXRHcmlkU2NvcmUoKSA8IHJlcXVpcmVkICkgfHwgQHBhcmVudC5ncmlkV2FzQXV0b3N0b3BwZWQoKSApICYmIEBwYXJlbnQuZ2V0R3JpZFNjb3JlKCkgIT0gZmFsc2VcbiAgICBjaGlsZC5zZXQgIFwibm90QXNrZWRcIiwgaXNOb3RBc2tlZFxuICAgIGlmIGlzTm90QXNrZWQgdGhlbiBAbm90QXNrZWRDb3VudCsrXG4gICAgTWFyaW9uZXR0ZS5Nb25pdG9yRE9NUmVmcmVzaChjaGlsZFZpZXcpO1xuICAgIEBxdWVzdGlvblZpZXdzW2NoaWxkVmlld09wdGlvbnMuaW5kZXhdID0gY2hpbGRWaWV3XG5cbiAgICByZXR1cm4gY2hpbGRWaWV3XG4gICxcblxuIyAgUGFzc2VzIG9wdGlvbnMgdG8gZWFjaCBjaGlsZFZpZXcgaW5zdGFuY2VcbiAgY2hpbGRWaWV3T3B0aW9uczogKG1vZGVsLCBpbmRleCktPlxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG4gICAgICBwcmV2aW91cyA9IEBtb2RlbC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG5cbiAgICBuYW1lICAgPSBtb2RlbC5lc2NhcGUoXCJuYW1lXCIpLnJlcGxhY2UgL1teQS1aYS16MC05X10vZywgXCItXCJcbiAgICBhbnN3ZXIgPSBwcmV2aW91c1tuYW1lXSBpZiBwcmV2aW91c1xuICAgIGxhYmVscyA9IHt9XG4gICAgbGFiZWxzLnRleHQgPSBAdGV4dFxuICAgIG1vZGVsLnNldCgnbGFiZWxzJywgbGFiZWxzKVxuICAgIG9wdGlvbnMgPVxuICAgICAgbW9kZWwgICAgICAgICA6IG1vZGVsXG4gICAgICBwYXJlbnQgICAgICAgIDogQFxuICAgICAgZGF0YUVudHJ5ICAgICA6IEBkYXRhRW50cnlcbiAgICAgIG5vdEFza2VkICAgICAgOiBtb2RlbC5nZXQgXCJub3RBc2tlZFwiXG4gICAgICBpc09ic2VydmF0aW9uIDogQGlzT2JzZXJ2YXRpb25cbiAgICAgIGFuc3dlciAgICAgICAgOiBhbnN3ZXJcbiAgICAgIGluZGV4ICA6IGluZGV4XG4gICAgcmV0dXJuIG9wdGlvbnNcblxuICBvbkJlZm9yZVJlbmRlcjogLT5cbiMgICAgQHF1ZXN0aW9ucy5zb3J0KClcblxuICBvblJlbmRlcjogLT5cblxuICAgIG5vdEFza2VkQ291bnQgPSAwXG4gICAgaWYgQG1vZGVsLnF1ZXN0aW9ucz9cbiAgICAgIEBtb2RlbC5xdWVzdGlvbnMubW9kZWxzLmZvckVhY2ggKHF1ZXN0aW9uLCBpKSA9PlxuIyBza2lwIHRoZSByZXN0IGlmIHNjb3JlIG5vdCBoaWdoIGVub3VnaFxuICAgICAgICByZXF1aXJlZCA9IHF1ZXN0aW9uLmdldE51bWJlciBcImxpbmtlZEdyaWRTY29yZVwiXG4gICAgICAgIGlzTm90QXNrZWQgPSAoICggcmVxdWlyZWQgIT0gMCAmJiBAcGFyZW50LmdldEdyaWRTY29yZSgpIDwgcmVxdWlyZWQgKSB8fCBAcGFyZW50LmdyaWRXYXNBdXRvc3RvcHBlZCgpICkgJiYgQHBhcmVudC5nZXRHcmlkU2NvcmUoKSAhPSBmYWxzZVxuICAgICAgICBxdWVzdGlvbi5zZXQgIFwibm90QXNrZWRcIiwgaXNOb3RBc2tlZFxuICAgICAgICBpZiBpc05vdEFza2VkIHRoZW4gQG5vdEFza2VkQ291bnQrK1xuICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuXG4gIG9uUmVuZGVyQ29sbGVjdGlvbjotPlxuICAgIGlmIEBmb2N1c01vZGVcbiAgICAgICQoJyNzdWJ0ZXN0X3dyYXBwZXInKS5hZnRlciAkIFwiXG4gICAgICAgICAgICA8ZGl2IGlkPSdzdW1tYXJ5X2NvbnRhaW5lcic+PC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIHByZXZfcXVlc3Rpb24nPiN7QHRleHQucHJldmlvdXNRdWVzdGlvbn08L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gbmV4dF9xdWVzdGlvbic+I3tAdGV4dC5uZXh0UXVlc3Rpb259PC9idXR0b24+XG4gICAgICAgICAgXCJcbiAgICBAdXBkYXRlRXhlY3V0ZVJlYWR5KHRydWUpXG4gICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4gICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG5cbiAgICBpZiBAcXVlc3Rpb25zLmxlbmd0aCA9PSBAbm90QXNrZWRDb3VudFxuICAgICAgaWYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgIT0gXCJjbGFzc1wiXG4gICAgICAgIEBwYXJlbnQubmV4dD8oKVxuICAgICAgZWxzZVxuIyAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkICQgXCI8cCBjbGFzcz0nZ3JleSc+I3tAdGV4dC5ub3RFbm91Z2h9PC9wPlwiXG4gICAgICAgIGFsZXJ0IEB0ZXh0Lm5vdEVub3VnaFxuXG4jICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4gIG9uUXVlc3Rpb25SZW5kZXJlZDotPlxuIyAgICBjb25zb2xlLmxvZyhcIm9uUXVlc3Rpb25SZW5kZXJlZCBAcmVuZGVyQ291bnQ6IFwiICsgQHJlbmRlckNvdW50KVxuICAgIEByZW5kZXJDb3VudCsrXG4jICAgIGNvbnNvbGUubG9nKFwib25RdWVzdGlvblJlbmRlcmVkIEByZW5kZXJDb3VudCBpbmNyZW1lbnRlZDogXCIgKyBAcmVuZGVyQ291bnQpXG4gICAgaWYgQHJlbmRlckNvdW50ID09IEBxdWVzdGlvbnMubGVuZ3RoXG4gICAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiAgICAgIEB1cGRhdGVTa2lwTG9naWMoKVxuIyAgICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuIyAgICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuIyAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuIyAgb25TaG93Oi0+XG4jICAgIGNvbnNvbGUubG9nKFwiaVNob3duIVwiKVxuIyAgICBAb25SZW5kZXJDb2xsZWN0aW9uKClcblxuICBvbkNsb3NlOi0+XG4gICAgZm9yIHF2IGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBxdi5jbG9zZT8oKVxuICAgIEBxdWVzdGlvblZpZXdzID0gW11cblxuICByZXNldDogKGluY3JlbWVudCkgLT5cbiAgICBjb25zb2xlLmxvZyhcInJlc2V0XCIpXG4gICAgQHJlbmRlcmVkLnN1YnRlc3QgPSBmYWxzZVxuICAgIEByZW5kZXJlZC5hc3Nlc3NtZW50ID0gZmFsc2VcbiAgICAjICAgIGN1cnJlbnRWaWV3ID0gQHN1YnRlc3RWaWV3c1tAb3JkZXJNYXBbQGluZGV4XV1cbiAgICAjICAgIGN1cnJlbnRWaWV3LmNsb3NlKClcbiAgICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcuY2xvc2UoKTtcbiAgICBAaW5kZXggPVxuICAgICAgaWYgQGFib3J0QXNzZXNzbWVudCA9PSB0cnVlXG4gICAgICAgIEBzdWJ0ZXN0Vmlld3MubGVuZ3RoLTFcbiAgICAgIGVsc2VcbiAgICAgICAgQGluZGV4ICsgaW5jcmVtZW50XG4gICAgQHJlbmRlcigpXG4gICAgd2luZG93LnNjcm9sbFRvIDAsIDBcbiJdfQ==

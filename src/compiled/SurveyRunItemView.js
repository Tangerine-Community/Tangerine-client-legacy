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
      if (qv != null) {
        if (!(qv.isAutostopped || qv.isSkipped)) {
          isAvailable.push(i);
        }
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
    'rendered': 'onQuestionRendered'
  };

  SurveyRunItemView.prototype.foo = function() {
    return console.log("test 123 SV child foo");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1bkl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzhCQUVKLFFBQUEsR0FBVSxHQUFJLENBQUEsUUFBQTs7OEJBQ2QsU0FBQSxHQUFXOzs4QkFDWCxPQUFBLEdBQVM7OzhCQUNULFNBQUEsR0FBVzs7OEJBRVgsTUFBQSxHQUNFO0lBQUEsc0JBQUEsRUFBeUIsY0FBekI7SUFDQSxzQkFBQSxFQUF5QixjQUR6Qjs7OzhCQUdGLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFFVixRQUFBO0lBQUEsSUFBQyxDQUFBLEtBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxNQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFDeEIsSUFBQyxDQUFBLFNBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxhQUFELEdBQWlCLE9BQU8sQ0FBQztJQUN6QixJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBa0IsV0FBbEI7SUFDakIsSUFBc0IsSUFBQyxDQUFBLFNBQXZCO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsRUFBakI7O0lBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFdBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFJakIsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUtBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUNyQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQTtJQVdkLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBbkIsR0FBb0M7SUFDcEMsTUFBQSxHQUFTO0lBQ1QsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUE7SUFDZixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLEVBQXFCLE1BQXJCO0lBRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxXQUFYLENBQUEsS0FBMkIsSUFBM0IsSUFBbUMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsV0FBWCxDQUFBLEtBQTJCO0lBQzNFLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBRSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLENBQUEsS0FBNEIsSUFBNUIsSUFBb0MsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxDQUFBLEtBQTRCLE1BQWxFLENBQUEsSUFBK0UsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLEtBQW1CO0lBQzlHLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFvQixJQUFDLENBQUEsU0FBckI7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBb0IsSUFBQyxDQUFBLFFBQXJCO1dBRUEsSUFBQyxDQUFBO0VBMUNTOzs4QkE0Q1oscUJBQUEsR0FBdUIsU0FBQTtBQUVyQixRQUFBO0lBQUEsV0FBQSxHQUFjO0FBQ2Q7QUFBQSxTQUFBLDZDQUFBOztNQUNFLElBQUcsVUFBSDtRQUNFLElBQXNCLENBQUksQ0FBQyxFQUFFLENBQUMsYUFBSCxJQUFvQixFQUFFLENBQUMsU0FBeEIsQ0FBMUI7VUFBQSxXQUFXLENBQUMsSUFBWixDQUFpQixDQUFqQixFQUFBO1NBREY7O0FBREY7SUFHQSxXQUFXLENBQUMsSUFBWixDQUFpQixJQUFDLENBQUEsYUFBbEI7SUFFQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBWixDQUFpQixnQkFBakI7SUFDUixLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBWixDQUFpQixnQkFBakI7SUFFUixPQUFBLEdBQVUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFULENBQWdCLE9BQWhCLEVBQXlCLFdBQXpCO0lBQ1YsT0FBQSxHQUFVLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBVCxDQUFnQixPQUFoQixFQUF5QixXQUF6QjtJQUVWLElBQUcsSUFBQyxDQUFBLGFBQUQsS0FBa0IsT0FBckI7TUFDRSxLQUFLLENBQUMsSUFBTixDQUFBLEVBREY7S0FBQSxNQUFBO01BR0UsS0FBSyxDQUFDLElBQU4sQ0FBQSxFQUhGOztJQUtBLElBQUcsSUFBQyxDQUFBLGFBQUQsS0FBa0IsT0FBckI7YUFDRSxLQUFLLENBQUMsSUFBTixDQUFBLEVBREY7S0FBQSxNQUFBO2FBR0UsS0FBSyxDQUFDLElBQU4sQ0FBQSxFQUhGOztFQW5CcUI7OzhCQXdCdkIsd0JBQUEsR0FBMEIsU0FBQTtBQUV4QixRQUFBO0lBQUEsSUFBQSxDQUFjLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBZDtBQUFBLGFBQUE7O0lBRUEsSUFBRyxJQUFDLENBQUEsYUFBRCxLQUFrQixJQUFDLENBQUEsYUFBYSxDQUFDLE1BQXBDO01BSUUsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQSxFQUpGO0tBQUEsTUFBQTtNQU1FLENBQUEsQ0FBRSxvQkFBRixDQUF1QixDQUFDLEtBQXhCLENBQUE7TUFDQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxJQUFwQixDQUFBLEVBUEY7O0lBU0EsVUFBQSxHQUFhLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFdBQVY7SUFDYixVQUFVLENBQUMsSUFBWCxDQUFBO0lBQ0EsVUFBVSxDQUFDLEVBQVgsQ0FBYyxJQUFDLENBQUEsYUFBZixDQUE2QixDQUFDLElBQTlCLENBQUE7SUFJQSxJQUFHLElBQUMsQ0FBQSxZQUFKO2FBQ0UsSUFBQyxDQUFBLGFBQWMsQ0FBQSxJQUFDLENBQUEsYUFBRCxDQUFlLENBQUMsT0FBL0IsQ0FBdUMsTUFBdkMsRUFERjtLQUFBLE1BQUE7TUFHRSxJQUF5QixDQUFJLElBQUMsQ0FBQSxlQUE5QjtRQUFBLElBQUMsQ0FBQSxlQUFELEdBQW1CLEdBQW5COzthQUNBLElBQUMsQ0FBQSxlQUFlLENBQUMsSUFBakIsQ0FBc0IsSUFBQyxDQUFBLGFBQXZCLEVBSkY7O0VBbkJ3Qjs7OEJBeUIxQixZQUFBLEdBQWMsU0FBQyxLQUFEO0lBQ1osSUFBMEIsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxLQUFYLENBQUEsSUFBcUIsS0FBQSxHQUFRLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBNUMsSUFBc0QsS0FBQSxHQUFRLENBQXhGO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsTUFBakI7O1dBQ0EsSUFBQyxDQUFBLHdCQUFELENBQUE7RUFGWTs7OEJBS2Qsa0JBQUEsR0FBb0IsU0FBQyxLQUFEO0FBQ2xCLFFBQUE7SUFBQSxJQUFDLENBQUEsWUFBRCxHQUFnQjtJQUVoQixJQUFjLDRCQUFkO0FBQUEsYUFBQTs7SUFFQSxJQUFHLElBQUMsQ0FBQSxlQUFlLENBQUMsTUFBakIsR0FBMEIsQ0FBN0I7QUFDRTtBQUFBLFdBQUEscUNBQUE7OztjQUN1QixDQUFFLE9BQXZCLENBQStCLE1BQS9COztBQURGO01BRUEsSUFBQyxDQUFBLGVBQUQsR0FBbUIsR0FIckI7O0lBS0EsSUFBc0IsSUFBQyxDQUFBLFlBQXZCO2FBQUEsSUFBQyxDQUFBLGVBQUQsQ0FBQSxFQUFBOztFQVZrQjs7OEJBWXBCLElBQUEsR0FBTSxTQUFBO1dBQ0osSUFBQyxDQUFBLElBQUQsR0FDRTtNQUFBLFlBQUEsRUFBZSxDQUFBLENBQUUscUNBQUYsQ0FBZjtNQUNBLGFBQUEsRUFBZ0IsQ0FBQSxDQUFFLHNDQUFGLENBRGhCO01BRUEsU0FBQSxFQUFZLENBQUEsQ0FBRSxDQUFBLENBQUUsa0NBQUYsQ0FBRixDQUF3QyxDQUFDLE1BQXpDLENBQUEsQ0FGWjtNQUlBLGdCQUFBLEVBQW1CLENBQUEsQ0FBRSx3Q0FBRixDQUpuQjtNQUtBLFlBQUEsRUFBZSxDQUFBLENBQUUsb0NBQUYsQ0FMZjtNQU1BLE1BQUEsRUFBUyxDQUFBLENBQUUsNEJBQUYsQ0FOVDtNQU9BLE1BQUEsRUFBUyxDQUFBLENBQUUsNEJBQUYsQ0FQVDtNQVFBLE1BQUEsRUFBUyxDQUFBLENBQUUsNEJBQUYsQ0FSVDtNQVNBLE1BQUEsRUFBUyxDQUFBLENBQUUsNEJBQUYsQ0FUVDs7RUFGRTs7OEJBY04sZ0JBQUEsR0FBa0IsU0FBQyxPQUFEO0FBR2hCLFFBQUE7SUFBQSxJQUFBLENBQUEsQ0FBYyxJQUFDLENBQUEsV0FBRCxJQUFnQixJQUFDLENBQUEsU0FBUyxDQUFDLE1BQXpDLENBQUE7QUFBQSxhQUFBOztJQUdBLElBQUMsQ0FBQSxXQUFELEdBQWtCO0lBQ2xCLGFBQUEsR0FBa0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQWlCLGVBQWpCO0lBQ2xCLGVBQUEsR0FBa0I7SUFDbEIsYUFBQSxHQUFrQjtJQUVsQixJQUFHLGFBQUEsR0FBZ0IsQ0FBbkI7QUFDRSxXQUFTLG9HQUFUO1FBQ0UsYUFBQSxHQUFnQixJQUFDLENBQUEsYUFBYyxDQUFBLENBQUEsR0FBRSxDQUFGLENBQUksQ0FBQztRQUNwQyxJQUFHLGFBQUEsS0FBaUIsR0FBakIsSUFBd0IsYUFBQSxLQUFpQixHQUE1QztVQUNFLGFBQUEsR0FERjtTQUFBLE1BQUE7VUFHRSxhQUFBLEdBQWdCLEVBSGxCOztRQUlBLGVBQUEsR0FBa0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxlQUFULEVBQTBCLGFBQTFCO1FBRWxCLElBQUcsYUFBQSxLQUFpQixDQUFqQixJQUFzQixlQUFBLElBQW1CLGFBQXpDLElBQTBELENBQUksSUFBQyxDQUFBLFdBQWxFO1VBQ0UsSUFBQyxDQUFBLFdBQUQsR0FBZTtVQUNmLElBQUMsQ0FBQSxhQUFELEdBQWlCLEVBRm5COztBQVJGLE9BREY7O0lBWUEsSUFBQyxDQUFBLGNBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxlQUFELENBQUE7RUF4QmdCOzs4QkEwQmxCLGNBQUEsR0FBZ0IsU0FBQTtBQUNkLFFBQUE7SUFBQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFpQixlQUFqQjtXQUNoQixJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBdUIsU0FBQyxJQUFELEVBQU8sQ0FBUDtNQUNyQixJQUFHLENBQUEsR0FBSSxDQUFDLElBQUMsQ0FBQSxhQUFELEdBQWlCLENBQWxCLENBQVA7UUFDRSxJQUFHLElBQUMsQ0FBQSxXQUFKO1VBQ0UsSUFBSSxDQUFDLGFBQUwsR0FBcUI7aUJBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBVCxDQUFxQixtQkFBckIsRUFGRjtTQUFBLE1BQUE7VUFJRSxJQUFJLENBQUMsYUFBTCxHQUFxQjtpQkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFULENBQXFCLG1CQUFyQixFQUxGO1NBREY7O0lBRHFCLENBQXZCLEVBUUUsSUFSRjtFQUZjOzs4QkFZaEIsZUFBQSxHQUFpQixTQUFBO1dBR2YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQXVCLFNBQUMsRUFBRDtBQUNyQixVQUFBO01BQUEsUUFBQSxHQUFXLEVBQUUsQ0FBQztNQUNkLGFBQUEsR0FBZ0IsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsV0FBbkI7TUFDaEIsSUFBTyxhQUFBLEtBQWlCLEVBQXhCO0FBQ0U7VUFDRSxNQUFBLEdBQVMsWUFBWSxDQUFDLE1BQUQsQ0FBSyxDQUFDLEtBQWxCLENBQXdCLElBQXhCLEVBQTJCLENBQUMsYUFBRCxDQUEzQixFQURYO1NBQUEsY0FBQTtVQUdNO1VBQ0osSUFBQSxHQUFPLENBQUUsb0JBQXFCLENBQUMsSUFBdkIsQ0FBNEIsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFsQixDQUFBLENBQTVCLENBQTBELENBQUEsQ0FBQSxDQUEzRDtVQUNQLE9BQUEsR0FBVSxLQUFLLENBQUM7VUFDaEIsS0FBQSxDQUFNLCtCQUFBLEdBQStCLENBQUMsUUFBUSxDQUFDLEdBQVQsQ0FBYSxNQUFiLENBQUQsQ0FBL0IsR0FBcUQsTUFBckQsR0FBMkQsSUFBM0QsR0FBZ0UsTUFBaEUsR0FBc0UsT0FBNUUsRUFORjs7UUFRQSxJQUFHLE1BQUg7VUFDRSxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVAsQ0FBZ0Isa0JBQWhCO1VBQ0EsRUFBRSxDQUFDLFNBQUgsR0FBZSxLQUZqQjtTQUFBLE1BQUE7VUFJRSxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVAsQ0FBbUIsa0JBQW5CO1VBQ0EsRUFBRSxDQUFDLFNBQUgsR0FBZSxNQUxqQjtTQVRGOzthQWVBLEVBQUUsQ0FBQyxjQUFILENBQUE7SUFsQnFCLENBQXZCLEVBbUJFLElBbkJGO0VBSGU7OzhCQXdCakIsT0FBQSxHQUFTLFNBQUMsS0FBRDtBQUNQLFFBQUE7O01BRFEsUUFBUSxJQUFDLENBQUE7O0lBQ2pCLElBQW1CLGFBQW5CO0FBQUEsYUFBTyxLQUFQOztJQUNBLElBQW1CLENBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFWLENBQXZCO01BQUEsS0FBQSxHQUFRLENBQUMsS0FBRCxFQUFSOztBQUNBLFNBQUEsK0NBQUE7O01BQ0UsRUFBRSxDQUFDLGNBQUgsQ0FBQTtNQUVBLElBQUcsQ0FBSSxFQUFFLENBQUMsS0FBSyxDQUFDLFVBQVQsQ0FBb0IsV0FBcEIsQ0FBUDtRQUVFLElBQUcsQ0FBSSxFQUFFLENBQUMsT0FBVjtBQUdFLGlCQUFPLE1BSFQ7U0FGRjs7QUFIRjtBQVVBLFdBQU87RUFiQTs7OEJBZVQsU0FBQSxHQUFXLFNBQUE7QUFNVCxXQUFPLElBQUMsQ0FBQSxPQUFELENBQUE7RUFORTs7OEJBYVgsVUFBQSxHQUFZLFNBQUE7QUFDVixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQXVCLFNBQUMsRUFBRCxFQUFLLENBQUw7YUFDckIsTUFBTyxDQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEdBQXJCLENBQXlCLE1BQXpCLENBQUEsQ0FBUCxHQUEyQztJQUR0QixDQUF2QixFQUVFLElBRkY7QUFHQSxXQUFPO0VBTEc7OzhCQU9aLFNBQUEsR0FBVyxTQUFBO0FBQ1QsUUFBQTtJQUFBLE1BQUEsR0FBUztJQUNULElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUF1QixTQUFDLEVBQUQsRUFBSyxDQUFMO2FBRXJCLE1BQU8sQ0FBQSxFQUFFLENBQUMsSUFBSCxDQUFQLEdBQ0ssRUFBRSxDQUFDLFFBQU4sR0FDRSxFQUFFLENBQUMsY0FETCxHQUVRLENBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxFQUFFLENBQUMsTUFBYixDQUFQLEdBQ0gsRUFBRSxDQUFDLE1BREEsR0FFRyxFQUFFLENBQUMsT0FBTixHQUNILEVBQUUsQ0FBQyxhQURBLEdBRUcsRUFBRSxDQUFDLFNBQU4sR0FDSCxFQUFFLENBQUMsa0JBREEsR0FFRyxFQUFFLENBQUMsYUFBTixHQUNILEVBQUUsQ0FBQyxzQkFEQSxHQUdILEVBQUUsQ0FBQztJQWRjLENBQXZCLEVBZUUsSUFmRjtJQWdCQSxJQUE2QixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQTdCO01BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsRUFBUDs7V0FDQSxhQUFBLEdBQ0U7TUFBQSxNQUFBLEVBQVMsTUFBVDtNQUNBLE1BQUEsRUFDRTtRQUFBLE1BQUEsRUFBUyxJQUFUO09BRkY7O0VBcEJPOzs4QkF5QlgsVUFBQSxHQUFZLFNBQUMsS0FBRDtBQUNWLFFBQUE7O01BRFcsUUFBUSxJQUFDLENBQUE7O0lBQ3BCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFVBQVYsQ0FBcUIsQ0FBQyxNQUF0QixDQUFBO0lBQ0EsS0FBQSxHQUFRO0lBQ1IsSUFBbUIsQ0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLEtBQVYsQ0FBdkI7TUFBQSxLQUFBLEdBQVEsQ0FBQyxLQUFELEVBQVI7O1dBQ0EsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFDLEVBQUQsRUFBSyxDQUFMO0FBQ1osVUFBQTtNQUFBLElBQUcsQ0FBSSxDQUFDLENBQUMsUUFBRixDQUFXLEVBQVgsQ0FBUDtRQUNFLE9BQUEsR0FBVTtRQUNWLElBQUcsQ0FBSSxFQUFFLENBQUMsT0FBVjtVQUVFLGFBQUEsR0FBZ0IsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFULENBQWEseUJBQWI7VUFDaEIsSUFBRyxDQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsYUFBVixDQUFQO1lBQ0UsT0FBQSxHQUFVLGNBRFo7V0FBQSxNQUFBO1lBR0UsT0FBQSxHQUFVLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFIbEI7O1VBS0EsSUFBRyxLQUFBLEtBQVMsSUFBWjtZQUNFLElBQW9CLEtBQUEsS0FBUyxJQUFDLENBQUEsYUFBOUI7Y0FBQSxJQUFDLENBQUEsWUFBRCxDQUFjLENBQWQsRUFBQTs7WUFDQSxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVAsQ0FBQTtZQUNBLEtBQUssQ0FBQyxRQUFOLENBQWUsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUFyQjtZQUNBLEtBQUEsR0FBUSxNQUpWO1dBUkY7O2VBYUEsRUFBRSxDQUFDLFVBQUgsQ0FBYyxPQUFkLEVBZkY7O0lBRFksQ0FBZCxFQWlCRSxJQWpCRjtFQUpVOzs4QkF3QlosTUFBQSxHQUFRLFNBQUE7QUFDTixXQUFPO01BQUMsT0FBQSxFQUFRLENBQVQ7TUFBVyxTQUFBLEVBQVUsQ0FBckI7TUFBdUIsT0FBQSxFQUFRLENBQS9CO01BQWlDLEtBQUEsRUFBTSxDQUF2Qzs7RUFERDs7OEJBR1IsV0FBQSxHQUNFO0lBQUEsZUFBQSxFQUFpQixrQkFBakI7SUFDQSxRQUFBLEVBQVUsa0JBRFY7SUFFQSxVQUFBLEVBQVksb0JBRlo7Ozs4QkFLRixHQUFBLEdBQUssU0FBQTtXQUNILE9BQU8sQ0FBQyxHQUFSLENBQVksdUJBQVo7RUFERzs7OEJBSUwsY0FBQSxHQUFnQixTQUFDLEtBQUQsRUFBUSxjQUFSLEVBQXdCLGdCQUF4QjtBQUNkLFFBQUE7SUFBQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLE1BQUYsQ0FBUztNQUFDLEtBQUEsRUFBTyxLQUFSO0tBQVQsRUFBeUIsZ0JBQXpCO0lBQ1YsU0FBQSxHQUFnQixJQUFBLGNBQUEsQ0FBZSxPQUFmO0lBQ2hCLFFBQUEsR0FBVyxLQUFLLENBQUMsU0FBTixDQUFnQixpQkFBaEI7SUFDWCxVQUFBLEdBQWEsQ0FBRSxDQUFFLFFBQUEsS0FBWSxDQUFaLElBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFBLENBQUEsR0FBeUIsUUFBNUMsQ0FBQSxJQUEwRCxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQUEsQ0FBNUQsQ0FBQSxJQUE4RixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBQSxDQUFBLEtBQTBCO0lBQ3JJLEtBQUssQ0FBQyxHQUFOLENBQVcsVUFBWCxFQUF1QixVQUF2QjtJQUNBLElBQUcsVUFBSDtNQUFtQixJQUFDLENBQUEsYUFBRCxHQUFuQjs7SUFDQSxVQUFVLENBQUMsaUJBQVgsQ0FBNkIsU0FBN0I7SUFDQSxJQUFDLENBQUEsYUFBYyxDQUFBLGdCQUFnQixDQUFDLEtBQWpCLENBQWYsR0FBeUM7QUFFekMsV0FBTztFQVZPOzs4QkFjaEIsZ0JBQUEsR0FBa0IsU0FBQyxLQUFELEVBQVEsS0FBUjtBQUNoQixRQUFBO0lBQUEsSUFBQSxDQUFPLElBQUMsQ0FBQSxTQUFSO01BQ0UsUUFBQSxHQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFyQixDQUErQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQS9CLEVBRGI7O0lBR0EsSUFBQSxHQUFTLEtBQUssQ0FBQyxNQUFOLENBQWEsTUFBYixDQUFvQixDQUFDLE9BQXJCLENBQTZCLGdCQUE3QixFQUErQyxHQUEvQztJQUNULElBQTJCLFFBQTNCO01BQUEsTUFBQSxHQUFTLFFBQVMsQ0FBQSxJQUFBLEVBQWxCOztJQUNBLE1BQUEsR0FBUztJQUNULE1BQU0sQ0FBQyxJQUFQLEdBQWMsSUFBQyxDQUFBO0lBQ2YsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFWLEVBQW9CLE1BQXBCO0lBQ0EsT0FBQSxHQUNFO01BQUEsS0FBQSxFQUFnQixLQUFoQjtNQUNBLE1BQUEsRUFBZ0IsSUFEaEI7TUFFQSxTQUFBLEVBQWdCLElBQUMsQ0FBQSxTQUZqQjtNQUdBLFFBQUEsRUFBZ0IsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFWLENBSGhCO01BSUEsYUFBQSxFQUFnQixJQUFDLENBQUEsYUFKakI7TUFLQSxNQUFBLEVBQWdCLE1BTGhCO01BTUEsS0FBQSxFQUFTLEtBTlQ7O0FBT0YsV0FBTztFQWpCUzs7OEJBbUJsQixjQUFBLEdBQWdCLFNBQUEsR0FBQTs7OEJBR2hCLFFBQUEsR0FBVSxTQUFBO0FBRVIsUUFBQTtJQUFBLGFBQUEsR0FBZ0I7SUFDaEIsSUFBRyw0QkFBSDtNQUNFLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUF4QixDQUFnQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsUUFBRCxFQUFXLENBQVg7QUFFOUIsY0FBQTtVQUFBLFFBQUEsR0FBVyxRQUFRLENBQUMsU0FBVCxDQUFtQixpQkFBbkI7VUFDWCxVQUFBLEdBQWEsQ0FBRSxDQUFFLFFBQUEsS0FBWSxDQUFaLElBQWlCLEtBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFBLENBQUEsR0FBeUIsUUFBNUMsQ0FBQSxJQUEwRCxLQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQUEsQ0FBNUQsQ0FBQSxJQUE4RixLQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBQSxDQUFBLEtBQTBCO1VBQ3JJLFFBQVEsQ0FBQyxHQUFULENBQWMsVUFBZCxFQUEwQixVQUExQjtVQUNBLElBQUcsVUFBSDttQkFBbUIsS0FBQyxDQUFBLGFBQUQsR0FBbkI7O1FBTDhCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQyxFQURGOztXQU9BLElBQUMsQ0FBQSxPQUFELENBQVMsT0FBVDtFQVZROzs4QkFtQlYsa0JBQUEsR0FBbUIsU0FBQTtBQU9qQixRQUFBO0lBQUEsSUFBQyxDQUFBLGtCQUFELENBQW9CLElBQXBCO0lBQ0EsSUFBQyxDQUFBLHdCQUFELENBQUE7SUFDQSxJQUFDLENBQUEscUJBQUQsQ0FBQTtJQUVBLElBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLEtBQXFCLElBQUMsQ0FBQSxhQUF6QjtNQUNFLElBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFuQixDQUF1QixTQUF2QixDQUFBLEtBQXFDLE9BQXhDOztjQUNTLENBQUM7U0FEVjtPQUFBLE1BQUE7UUFJRSxLQUFBLENBQU0sSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFaLEVBSkY7T0FERjs7V0FRQSxJQUFDLENBQUEsT0FBRCxDQUFTLGFBQVQ7RUFuQmlCOzs4QkE0Q25CLGtCQUFBLEdBQW1CLFNBQUE7SUFFakIsSUFBQyxDQUFBLFdBQUQ7SUFFQSxJQUFHLElBQUMsQ0FBQSxXQUFELEtBQWdCLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBOUI7TUFDRSxJQUFDLENBQUEsT0FBRCxDQUFTLE9BQVQ7YUFDQSxJQUFDLENBQUEsZUFBRCxDQUFBLEVBRkY7O0VBSmlCOzs4QkFlbkIsT0FBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBOzs7UUFDRSxFQUFFLENBQUM7O0FBREw7V0FFQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtFQUhYOzs4QkFLUixLQUFBLEdBQU8sU0FBQyxTQUFEO0lBQ0wsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaO0lBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLEdBQW9CO0lBQ3BCLElBQUMsQ0FBQSxRQUFRLENBQUMsVUFBVixHQUF1QjtJQUd2QixTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFsQyxDQUFBO0lBQ0EsSUFBQyxDQUFBLEtBQUQsR0FDSyxJQUFDLENBQUEsZUFBRCxLQUFvQixJQUF2QixHQUNFLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxHQUFxQixDQUR2QixHQUdFLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDYixJQUFDLENBQUEsTUFBRCxDQUFBO1dBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkI7RUFiSzs7OztHQTdadUIsUUFBUSxDQUFDLFVBQVUsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9TdXJ2ZXlSdW5JdGVtVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFN1cnZleVJ1bkl0ZW1WaWV3IGV4dGVuZHMgQmFja2JvbmUuTWFyaW9uZXR0ZS5Db21wb3NpdGVWaWV3XG5cbiAgdGVtcGxhdGU6IEpTVFtcIlN1cnZleVwiXSxcbiAgY2hpbGRWaWV3OiBRdWVzdGlvblJ1bkl0ZW1WaWV3LFxuICB0YWdOYW1lOiBcInBcIixcbiAgY2xhc3NOYW1lOiBcIlN1cnZleVJ1bkl0ZW1WaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5uZXh0X3F1ZXN0aW9uJyA6ICduZXh0UXVlc3Rpb24nXG4gICAgJ2NsaWNrIC5wcmV2X3F1ZXN0aW9uJyA6ICdwcmV2UXVlc3Rpb24nXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAbW9kZWwgICAgICAgICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ICAgICAgICA9IEBtb2RlbC5wYXJlbnRcbiAgICBAZGF0YUVudHJ5ICAgICA9IG9wdGlvbnMuZGF0YUVudHJ5XG4gICAgQGlzT2JzZXJ2YXRpb24gPSBvcHRpb25zLmlzT2JzZXJ2YXRpb25cbiAgICBAZm9jdXNNb2RlICAgICA9IEBtb2RlbC5nZXRCb29sZWFuKFwiZm9jdXNNb2RlXCIpXG4gICAgQHF1ZXN0aW9uSW5kZXggPSAwIGlmIEBmb2N1c01vZGVcbiAgICBAcXVlc3Rpb25WaWV3cyA9IFtdXG4gICAgQGFuc3dlcmVkICAgICAgPSBbXVxuICAgIEByZW5kZXJDb3VudCAgID0gMFxuICAgIEBub3RBc2tlZENvdW50ID0gMFxuIyAgICBAY2hpbGRWaWV3T3B0aW9ucyA9XG4jICAgICAgICBwYXJlbnQ6IHRoaXNcblxuICAgIEBpMThuKClcbiMgICAgdGhpcy5saXN0ZW5UbyhAbW9kZWwuY29sbGVjdGlvbiwnY2hhbmdlJywgdGhpcy52aWV3UmVuZGVyKVxuIyAgICAgIHRoaXMubGlzdGVuVG8obW9kZWwuY29sbGVjdGlvbiwgJ3Jlc2V0JywgdGhpcy5yZW5kZXIpO1xuIyAgICBpZiBAbW9kZWwucXVlc3Rpb25zLmxlbmd0aCA9PSAwXG4jICAgICAgY29uc29sZS5sb2coXCJObyBxdWVzdGlvbnMuXCIpXG4gICAgQGNvbGxlY3Rpb24gPSBAbW9kZWwucXVlc3Rpb25zXG4gICAgQHF1ZXN0aW9ucyA9IEBjb2xsZWN0aW9uXG5cbiMgICAgQG1vZGVsLnF1ZXN0aW9ucy5mZXRjaFxuIyAgICAgIHZpZXdPcHRpb25zOlxuIyAgICAgICAga2V5OiBcInF1ZXN0aW9uLSN7QG1vZGVsLmlkfVwiXG4jICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pID0+XG4jIyAgICAgICAgQG1vZGVsLnF1ZXN0aW9ucy5zb3J0KClcbiMgICAgICAgIGNvbGxlY3Rpb24uc29ydCgpXG4jICAgICAgICBAbW9kZWwuY29sbGVjdGlvbi5tb2RlbHMgPSBjb2xsZWN0aW9uLm1vZGVsc1xuIyAgICAgICAgQHJlbmRlcigpXG5cbiAgICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcgPSBAXG4gICAgbGFiZWxzID0ge31cbiAgICBsYWJlbHMudGV4dCA9IEB0ZXh0XG4gICAgQG1vZGVsLnNldCgnbGFiZWxzJywgbGFiZWxzKVxuXG4gICAgQHNraXBwYWJsZSA9IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gdHJ1ZSB8fCBAbW9kZWwuZ2V0KFwic2tpcHBhYmxlXCIpID09IFwidHJ1ZVwiXG4gICAgQGJhY2thYmxlID0gKCBAbW9kZWwuZ2V0KFwiYmFja0J1dHRvblwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IFwidHJ1ZVwiICkgYW5kIEBwYXJlbnQuaW5kZXggaXNudCAwXG4gICAgQHBhcmVudC5kaXNwbGF5U2tpcChAc2tpcHBhYmxlKVxuICAgIEBwYXJlbnQuZGlzcGxheUJhY2soQGJhY2thYmxlKVxuXG4gICAgQGxpc3RlblRvXG5cbiAgdXBkYXRlUHJvZ3Jlc3NCdXR0b25zOiAtPlxuXG4gICAgaXNBdmFpbGFibGUgPSBbXVxuICAgIGZvciBxdiwgaSBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgaWYgcXY/XG4gICAgICAgIGlzQXZhaWxhYmxlLnB1c2ggaSBpZiBub3QgKHF2LmlzQXV0b3N0b3BwZWQgb3IgcXYuaXNTa2lwcGVkKVxuICAgIGlzQXZhaWxhYmxlLnB1c2ggQHF1ZXN0aW9uSW5kZXhcblxuICAgICRwcmV2ID0gQHBhcmVudC4kZWwuZmluZChcIi5wcmV2X3F1ZXN0aW9uXCIpXG4gICAgJG5leHQgPSBAcGFyZW50LiRlbC5maW5kKFwiLm5leHRfcXVlc3Rpb25cIilcblxuICAgIG1pbmltdW0gPSBNYXRoLm1pbi5hcHBseSggbWluaW11bSwgaXNBdmFpbGFibGUgKVxuICAgIG1heGltdW0gPSBNYXRoLm1heC5hcHBseSggbWF4aW11bSwgaXNBdmFpbGFibGUgKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggPT0gbWluaW11bVxuICAgICAgJHByZXYuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgJHByZXYuc2hvdygpXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCA9PSBtYXhpbXVtXG4gICAgICAkbmV4dC5oaWRlKClcbiAgICBlbHNlXG4gICAgICAkbmV4dC5zaG93KClcblxuICB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHk6IC0+XG5cbiAgICByZXR1cm4gdW5sZXNzIEBtb2RlbC5nZXQoXCJmb2N1c01vZGVcIilcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IEBxdWVzdGlvblZpZXdzLmxlbmd0aFxuIyAgICAgICQoXCIjc3VtbWFyeV9jb250YWluZXJcIikuaHRtbCBcIlxuIyAgICAgICAgbGFzdCBwYWdlIGhlcmVcbiMgICAgICBcIlxuICAgICAgJChcIi5uZXh0X3F1ZXN0aW9uXCIpLmhpZGUoKVxuICAgIGVsc2VcbiAgICAgICQoXCIjc3VtbWFyeV9jb250YWluZXJcIikuZW1wdHkoKVxuICAgICAgJChcIi5uZXh0X3F1ZXN0aW9uXCIpLnNob3coKVxuXG4gICAgJHF1ZXN0aW9ucyA9IEAkZWwuZmluZChcIi5xdWVzdGlvblwiKVxuICAgICRxdWVzdGlvbnMuaGlkZSgpXG4gICAgJHF1ZXN0aW9ucy5lcShAcXVlc3Rpb25JbmRleCkuc2hvdygpXG5cbiAgICAjIHRyaWdnZXIgdGhlIHF1ZXN0aW9uIHRvIHJ1biBpdCdzIGRpc3BsYXkgY29kZSBpZiB0aGUgc3VidGVzdCdzIGRpc3BsYXljb2RlIGhhcyBhbHJlYWR5IHJhblxuICAgICMgaWYgbm90LCBhZGQgaXQgdG8gYSBsaXN0IHRvIHJ1biBsYXRlci5cbiAgICBpZiBAZXhlY3V0ZVJlYWR5XG4gICAgICBAcXVlc3Rpb25WaWV3c1tAcXVlc3Rpb25JbmRleF0udHJpZ2dlciBcInNob3dcIlxuICAgIGVsc2VcbiAgICAgIEB0cmlnZ2VyU2hvd0xpc3QgPSBbXSBpZiBub3QgQHRyaWdnZXJTaG93TGlzdFxuICAgICAgQHRyaWdnZXJTaG93TGlzdC5wdXNoIEBxdWVzdGlvbkluZGV4XG5cbiAgc2hvd1F1ZXN0aW9uOiAoaW5kZXgpIC0+XG4gICAgQHF1ZXN0aW9uSW5kZXggPSBpbmRleCBpZiBfLmlzTnVtYmVyKGluZGV4KSAmJiBpbmRleCA8IEBxdWVzdGlvblZpZXdzLmxlbmd0aCAmJiBpbmRleCA+IDBcbiAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiMgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG5cbiAgdXBkYXRlRXhlY3V0ZVJlYWR5OiAocmVhZHkpIC0+XG4gICAgQGV4ZWN1dGVSZWFkeSA9IHJlYWR5XG5cbiAgICByZXR1cm4gaWYgbm90IEB0cmlnZ2VyU2hvd0xpc3Q/XG5cbiAgICBpZiBAdHJpZ2dlclNob3dMaXN0Lmxlbmd0aCA+IDBcbiAgICAgIGZvciBpbmRleCBpbiBAdHJpZ2dlclNob3dMaXN0XG4gICAgICAgIEBxdWVzdGlvblZpZXdzW2luZGV4XT8udHJpZ2dlciBcInNob3dcIlxuICAgICAgQHRyaWdnZXJTaG93TGlzdCA9IFtdXG5cbiAgICBAdXBkYXRlU2tpcExvZ2ljKCkgaWYgQGV4ZWN1dGVSZWFkeVxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgcGxlYXNlQW5zd2VyIDogdChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5wbGVhc2VfYW5zd2VyXCIpXG4gICAgICBjb3JyZWN0RXJyb3JzIDogdChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5jb3JyZWN0X2Vycm9yc1wiKVxuICAgICAgbm90RW5vdWdoIDogXyh0KFwiU3VydmV5UnVuVmlldy5tZXNzYWdlLm5vdF9lbm91Z2hcIikpLmVzY2FwZSgpXG5cbiAgICAgIHByZXZpb3VzUXVlc3Rpb24gOiB0KFwiU3VydmV5UnVuVmlldy5idXR0b24ucHJldmlvdXNfcXVlc3Rpb25cIilcbiAgICAgIG5leHRRdWVzdGlvbiA6IHQoXCJTdXJ2ZXlSdW5WaWV3LmJ1dHRvbi5uZXh0X3F1ZXN0aW9uXCIpXG4gICAgICBcIm5leHRcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24ubmV4dFwiKVxuICAgICAgXCJiYWNrXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLmJhY2tcIilcbiAgICAgIFwic2tpcFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5za2lwXCIpXG4gICAgICBcImhlbHBcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uaGVscFwiKVxuXG4gICMgd2hlbiBhIHF1ZXN0aW9uIGlzIGFuc3dlcmVkXG4gIG9uUXVlc3Rpb25BbnN3ZXI6IChlbGVtZW50KSAtPlxuIyAgICBjb25zb2xlLmxvZyhcIm9uUXVlc3Rpb25BbnN3ZXIgQHJlbmRlckNvdW50OlwiICsgQHJlbmRlckNvdW50ICsgXCIgIEBxdWVzdGlvbnMubGVuZ3RoOiBcIiArICBAcXVlc3Rpb25zLmxlbmd0aClcbiMgICAgdGhpcyBpcyBub3QgZ29vZC4gU2hvdWxkIHRlc3QgZm9yID09XG4gICAgcmV0dXJuIHVubGVzcyBAcmVuZGVyQ291bnQgPj0gQHF1ZXN0aW9ucy5sZW5ndGhcblxuICAgICMgYXV0byBzdG9wIGFmdGVyIGxpbWl0XG4gICAgQGF1dG9zdG9wcGVkICAgID0gZmFsc2VcbiAgICBhdXRvc3RvcExpbWl0ICAgPSBAbW9kZWwuZ2V0TnVtYmVyIFwiYXV0b3N0b3BMaW1pdFwiXG4gICAgbG9uZ2VzdFNlcXVlbmNlID0gMFxuICAgIGF1dG9zdG9wQ291bnQgICA9IDBcblxuICAgIGlmIGF1dG9zdG9wTGltaXQgPiAwXG4gICAgICBmb3IgaSBpbiBbMS4uQHF1ZXN0aW9uVmlld3MubGVuZ3RoXSAjIGp1c3QgaW4gY2FzZSB0aGV5IGNhbid0IGNvdW50XG4gICAgICAgIGN1cnJlbnRBbnN3ZXIgPSBAcXVlc3Rpb25WaWV3c1tpLTFdLmFuc3dlclxuICAgICAgICBpZiBjdXJyZW50QW5zd2VyID09IFwiMFwiIG9yIGN1cnJlbnRBbnN3ZXIgPT0gXCI5XCJcbiAgICAgICAgICBhdXRvc3RvcENvdW50KytcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGF1dG9zdG9wQ291bnQgPSAwXG4gICAgICAgIGxvbmdlc3RTZXF1ZW5jZSA9IE1hdGgubWF4KGxvbmdlc3RTZXF1ZW5jZSwgYXV0b3N0b3BDb3VudClcbiAgICAgICAgIyBpZiB0aGUgdmFsdWUgaXMgc2V0LCB3ZSd2ZSBnb3QgYSB0aHJlc2hvbGQgZXhjZWVkaW5nIHJ1biwgYW5kIGl0J3Mgbm90IGFscmVhZHkgYXV0b3N0b3BwZWRcbiAgICAgICAgaWYgYXV0b3N0b3BMaW1pdCAhPSAwICYmIGxvbmdlc3RTZXF1ZW5jZSA+PSBhdXRvc3RvcExpbWl0ICYmIG5vdCBAYXV0b3N0b3BwZWRcbiAgICAgICAgICBAYXV0b3N0b3BwZWQgPSB0cnVlXG4gICAgICAgICAgQGF1dG9zdG9wSW5kZXggPSBpXG4gICAgQHVwZGF0ZUF1dG9zdG9wKClcbiAgICBAdXBkYXRlU2tpcExvZ2ljKClcblxuICB1cGRhdGVBdXRvc3RvcDogLT5cbiAgICBhdXRvc3RvcExpbWl0ID0gQG1vZGVsLmdldE51bWJlciBcImF1dG9zdG9wTGltaXRcIlxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHZpZXcsIGkpIC0+XG4gICAgICBpZiBpID4gKEBhdXRvc3RvcEluZGV4IC0gMSlcbiAgICAgICAgaWYgQGF1dG9zdG9wcGVkXG4gICAgICAgICAgdmlldy5pc0F1dG9zdG9wcGVkID0gdHJ1ZVxuICAgICAgICAgIHZpZXcuJGVsLmFkZENsYXNzICAgIFwiZGlzYWJsZWRfYXV0b3N0b3BcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgdmlldy5pc0F1dG9zdG9wcGVkID0gZmFsc2VcbiAgICAgICAgICB2aWV3LiRlbC5yZW1vdmVDbGFzcyBcImRpc2FibGVkX2F1dG9zdG9wXCJcbiAgICAsIEBcblxuICB1cGRhdGVTa2lwTG9naWM6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwidXBkYXRlU2tpcExvZ2ljXCIpXG4jICAgIGNvbnNvbGUubG9nKFwiQHF1ZXN0aW9uVmlld3NcIiArIEBxdWVzdGlvblZpZXdzLmxlbmd0aClcbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoIChxdikgLT5cbiAgICAgIHF1ZXN0aW9uID0gcXYubW9kZWxcbiAgICAgIHNraXBMb2dpY0NvZGUgPSBxdWVzdGlvbi5nZXRTdHJpbmcgXCJza2lwTG9naWNcIlxuICAgICAgdW5sZXNzIHNraXBMb2dpY0NvZGUgaXMgXCJcIlxuICAgICAgICB0cnlcbiAgICAgICAgICByZXN1bHQgPSBDb2ZmZWVTY3JpcHQuZXZhbC5hcHBseShALCBbc2tpcExvZ2ljQ29kZV0pXG4jICAgICAgICAgIGNvbnNvbGUubG9nKFwic2tpcExvZ2ljQ29kZTogXCIgKyBza2lwTG9naWNDb2RlKVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIG5hbWUgPSAoKC9mdW5jdGlvbiAoLnsxLH0pXFwoLykuZXhlYyhlcnJvci5jb25zdHJ1Y3Rvci50b1N0cmluZygpKVsxXSlcbiAgICAgICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgICAgICAgIGFsZXJ0IFwiU2tpcCBsb2dpYyBlcnJvciBpbiBxdWVzdGlvbiAje3F1ZXN0aW9uLmdldCgnbmFtZScpfVxcblxcbiN7bmFtZX1cXG5cXG4je21lc3NhZ2V9XCJcblxuICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICBxdi4kZWwuYWRkQ2xhc3MgXCJkaXNhYmxlZF9za2lwcGVkXCJcbiAgICAgICAgICBxdi5pc1NraXBwZWQgPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBxdi4kZWwucmVtb3ZlQ2xhc3MgXCJkaXNhYmxlZF9za2lwcGVkXCJcbiAgICAgICAgICBxdi5pc1NraXBwZWQgPSBmYWxzZVxuICAgICAgcXYudXBkYXRlVmFsaWRpdHkoKVxuICAgICwgQFxuXG4gIGlzVmFsaWQ6ICh2aWV3cyA9IEBxdWVzdGlvblZpZXdzKSAtPlxuICAgIHJldHVybiB0cnVlIGlmIG5vdCB2aWV3cz8gIyBpZiB0aGVyZSdzIG5vdGhpbmcgdG8gY2hlY2ssIGl0IG11c3QgYmUgZ29vZFxuICAgIHZpZXdzID0gW3ZpZXdzXSBpZiBub3QgXy5pc0FycmF5KHZpZXdzKVxuICAgIGZvciBxdiwgaSBpbiB2aWV3c1xuICAgICAgcXYudXBkYXRlVmFsaWRpdHkoKVxuICAgICAgIyBjYW4gd2Ugc2tpcCBpdD9cbiAgICAgIGlmIG5vdCBxdi5tb2RlbC5nZXRCb29sZWFuKFwic2tpcHBhYmxlXCIpXG4gICAgICAgICMgaXMgaXQgdmFsaWRcbiAgICAgICAgaWYgbm90IHF2LmlzVmFsaWRcbiAgICAgICAgICAjIHJlZCBhbGVydCEhXG4jICAgICAgICAgIGNvbnNvbGUubG9nKFwicG9wIHVwIGFuIGVycm9yXCIpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4jICAgICwgQFxuICAgIHJldHVybiB0cnVlXG5cbiAgdGVzdFZhbGlkOiAtPlxuIyAgICBjb25zb2xlLmxvZyhcIlN1cnZleVJpbkl0ZW0gdGVzdFZhbGlkLlwiKVxuIyAgICBpZiBub3QgQHByb3RvdHlwZVJlbmRlcmVkIHRoZW4gcmV0dXJuIGZhbHNlXG4jICAgIGN1cnJlbnRWaWV3ID0gVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XG4jICAgIGlmIEBpc1ZhbGlkP1xuIyAgICBjb25zb2xlLmxvZyhcInRlc3R2YWxpZDogXCIgKyBAaXNWYWxpZD8pXG4gICAgcmV0dXJuIEBpc1ZhbGlkKClcbiMgICAgZWxzZVxuIyAgICAgIHJldHVybiBmYWxzZVxuIyAgICB0cnVlXG5cblxuICAjIEBUT0RPIHRoaXMgc2hvdWxkIHByb2JhYmx5IGJlIHJldHVybmluZyBtdWx0aXBsZSwgc2luZ2xlIHR5cGUgaGFzaCB2YWx1ZXNcbiAgZ2V0U2tpcHBlZDogLT5cbiAgICByZXN1bHQgPSB7fVxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuICAgICAgcmVzdWx0W0BxdWVzdGlvbnMubW9kZWxzW2ldLmdldChcIm5hbWVcIildID0gXCJza2lwcGVkXCJcbiAgICAsIEBcbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgZ2V0UmVzdWx0OiAtPlxuICAgIHJlc3VsdCA9IHt9XG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAocXYsIGkpIC0+XG4jICAgICAgcmVzdWx0W0BxdWVzdGlvbnMubW9kZWxzW2ldLmdldChcIm5hbWVcIildID1cbiAgICAgIHJlc3VsdFtxdi5uYW1lXSA9XG4gICAgICAgIGlmIHF2Lm5vdEFza2VkICMgYmVjYXVzZSBvZiBncmlkIHNjb3JlXG4gICAgICAgICAgcXYubm90QXNrZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBub3QgXy5pc0VtcHR5KHF2LmFuc3dlcikgIyB1c2UgYW5zd2VyXG4gICAgICAgICAgcXYuYW5zd2VyXG4gICAgICAgIGVsc2UgaWYgcXYuc2tpcHBlZFxuICAgICAgICAgIHF2LnNraXBwZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBxdi5pc1NraXBwZWRcbiAgICAgICAgICBxdi5sb2dpY1NraXBwZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBxdi5pc0F1dG9zdG9wcGVkXG4gICAgICAgICAgcXYubm90QXNrZWRBdXRvc3RvcFJlc3VsdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgcXYuYW5zd2VyXG4gICAgLCBAXG4gICAgaGFzaCA9IEBtb2RlbC5nZXQoXCJoYXNoXCIpIGlmIEBtb2RlbC5oYXMoXCJoYXNoXCIpXG4gICAgc3VidGVzdFJlc3VsdCA9XG4gICAgICAnYm9keScgOiByZXN1bHRcbiAgICAgICdtZXRhJyA6XG4gICAgICAgICdoYXNoJyA6IGhhc2hcbiMgICAgcmV0dXJuIHJlc3VsdFxuXG4gIHNob3dFcnJvcnM6ICh2aWV3cyA9IEBxdWVzdGlvblZpZXdzKSAtPlxuICAgIEAkZWwuZmluZCgnLm1lc3NhZ2UnKS5yZW1vdmUoKVxuICAgIGZpcnN0ID0gdHJ1ZVxuICAgIHZpZXdzID0gW3ZpZXdzXSBpZiBub3QgXy5pc0FycmF5KHZpZXdzKVxuICAgIHZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuICAgICAgaWYgbm90IF8uaXNTdHJpbmcocXYpXG4gICAgICAgIG1lc3NhZ2UgPSBcIlwiXG4gICAgICAgIGlmIG5vdCBxdi5pc1ZhbGlkXG4gICAgICAgICAgIyBoYW5kbGUgY3VzdG9tIHZhbGlkYXRpb24gZXJyb3IgbWVzc2FnZXNcbiAgICAgICAgICBjdXN0b21NZXNzYWdlID0gcXYubW9kZWwuZ2V0KFwiY3VzdG9tVmFsaWRhdGlvbk1lc3NhZ2VcIilcbiAgICAgICAgICBpZiBub3QgXy5pc0VtcHR5KGN1c3RvbU1lc3NhZ2UpXG4gICAgICAgICAgICBtZXNzYWdlID0gY3VzdG9tTWVzc2FnZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBAdGV4dC5wbGVhc2VBbnN3ZXJcblxuICAgICAgICAgIGlmIGZpcnN0ID09IHRydWVcbiAgICAgICAgICAgIEBzaG93UXVlc3Rpb24oaSkgaWYgdmlld3MgPT0gQHF1ZXN0aW9uVmlld3NcbiAgICAgICAgICAgIHF2LiRlbC5zY3JvbGxUbygpXG4gICAgICAgICAgICBVdGlscy5taWRBbGVydCBAdGV4dC5jb3JyZWN0RXJyb3JzXG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlXG4gICAgICAgIHF2LnNldE1lc3NhZ2UgbWVzc2FnZVxuICAgICwgQFxuXG5cbiAgZ2V0U3VtOiAtPlxuICAgIHJldHVybiB7Y29ycmVjdDowLGluY29ycmVjdDowLG1pc3Npbmc6MCx0b3RhbDowfVxuXG4gIGNoaWxkRXZlbnRzOlxuICAgICdhbnN3ZXIgc2Nyb2xsJzogJ29uUXVlc3Rpb25BbnN3ZXInXG4gICAgJ2Fuc3dlcic6ICdvblF1ZXN0aW9uQW5zd2VyJ1xuICAgICdyZW5kZXJlZCc6ICdvblF1ZXN0aW9uUmVuZGVyZWQnXG5cbiAgIyBUaGlzIHRlc3RzIGlmIGFkZDpjaGlsZCBpcyB0cmlnZ2VyZWQgb24gdGhlIHN1YnRlc3QgaW5zdGVhZCBvZiBvbiBBc3Nlc3NtZW50Q29tcG9zaXRlVmlldy5cbiAgZm9vOiAtPlxuICAgIGNvbnNvbGUubG9nKFwidGVzdCAxMjMgU1YgY2hpbGQgZm9vXCIpXG5cbiAgIyBwb3B1bGF0ZXMgQHF1ZXN0aW9uVmlld3MgZm9yIHRoaXMgdmlldy5cbiAgYnVpbGRDaGlsZFZpZXc6IChjaGlsZCwgQ2hpbGRWaWV3Q2xhc3MsIGNoaWxkVmlld09wdGlvbnMpIC0+XG4gICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHttb2RlbDogY2hpbGR9LCBjaGlsZFZpZXdPcHRpb25zKTtcbiAgICBjaGlsZFZpZXcgPSBuZXcgQ2hpbGRWaWV3Q2xhc3Mob3B0aW9ucylcbiAgICByZXF1aXJlZCA9IGNoaWxkLmdldE51bWJlciBcImxpbmtlZEdyaWRTY29yZVwiXG4gICAgaXNOb3RBc2tlZCA9ICggKCByZXF1aXJlZCAhPSAwICYmIEBwYXJlbnQuZ2V0R3JpZFNjb3JlKCkgPCByZXF1aXJlZCApIHx8IEBwYXJlbnQuZ3JpZFdhc0F1dG9zdG9wcGVkKCkgKSAmJiBAcGFyZW50LmdldEdyaWRTY29yZSgpICE9IGZhbHNlXG4gICAgY2hpbGQuc2V0ICBcIm5vdEFza2VkXCIsIGlzTm90QXNrZWRcbiAgICBpZiBpc05vdEFza2VkIHRoZW4gQG5vdEFza2VkQ291bnQrK1xuICAgIE1hcmlvbmV0dGUuTW9uaXRvckRPTVJlZnJlc2goY2hpbGRWaWV3KTtcbiAgICBAcXVlc3Rpb25WaWV3c1tjaGlsZFZpZXdPcHRpb25zLmluZGV4XSA9IGNoaWxkVmlld1xuXG4gICAgcmV0dXJuIGNoaWxkVmlld1xuICAsXG5cbiMgIFBhc3NlcyBvcHRpb25zIHRvIGVhY2ggY2hpbGRWaWV3IGluc3RhbmNlXG4gIGNoaWxkVmlld09wdGlvbnM6IChtb2RlbCwgaW5kZXgpLT5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgcHJldmlvdXMgPSBAbW9kZWwucGFyZW50LnJlc3VsdC5nZXRCeUhhc2goQG1vZGVsLmdldCgnaGFzaCcpKVxuXG4gICAgbmFtZSAgID0gbW9kZWwuZXNjYXBlKFwibmFtZVwiKS5yZXBsYWNlIC9bXkEtWmEtejAtOV9dL2csIFwiLVwiXG4gICAgYW5zd2VyID0gcHJldmlvdXNbbmFtZV0gaWYgcHJldmlvdXNcbiAgICBsYWJlbHMgPSB7fVxuICAgIGxhYmVscy50ZXh0ID0gQHRleHRcbiAgICBtb2RlbC5zZXQoJ2xhYmVscycsIGxhYmVscylcbiAgICBvcHRpb25zID1cbiAgICAgIG1vZGVsICAgICAgICAgOiBtb2RlbFxuICAgICAgcGFyZW50ICAgICAgICA6IEBcbiAgICAgIGRhdGFFbnRyeSAgICAgOiBAZGF0YUVudHJ5XG4gICAgICBub3RBc2tlZCAgICAgIDogbW9kZWwuZ2V0IFwibm90QXNrZWRcIlxuICAgICAgaXNPYnNlcnZhdGlvbiA6IEBpc09ic2VydmF0aW9uXG4gICAgICBhbnN3ZXIgICAgICAgIDogYW5zd2VyXG4gICAgICBpbmRleCAgOiBpbmRleFxuICAgIHJldHVybiBvcHRpb25zXG5cbiAgb25CZWZvcmVSZW5kZXI6IC0+XG4jICAgIEBxdWVzdGlvbnMuc29ydCgpXG5cbiAgb25SZW5kZXI6IC0+XG5cbiAgICBub3RBc2tlZENvdW50ID0gMFxuICAgIGlmIEBtb2RlbC5xdWVzdGlvbnM/XG4gICAgICBAbW9kZWwucXVlc3Rpb25zLm1vZGVscy5mb3JFYWNoIChxdWVzdGlvbiwgaSkgPT5cbiMgc2tpcCB0aGUgcmVzdCBpZiBzY29yZSBub3QgaGlnaCBlbm91Z2hcbiAgICAgICAgcmVxdWlyZWQgPSBxdWVzdGlvbi5nZXROdW1iZXIgXCJsaW5rZWRHcmlkU2NvcmVcIlxuICAgICAgICBpc05vdEFza2VkID0gKCAoIHJlcXVpcmVkICE9IDAgJiYgQHBhcmVudC5nZXRHcmlkU2NvcmUoKSA8IHJlcXVpcmVkICkgfHwgQHBhcmVudC5ncmlkV2FzQXV0b3N0b3BwZWQoKSApICYmIEBwYXJlbnQuZ2V0R3JpZFNjb3JlKCkgIT0gZmFsc2VcbiAgICAgICAgcXVlc3Rpb24uc2V0ICBcIm5vdEFza2VkXCIsIGlzTm90QXNrZWRcbiAgICAgICAgaWYgaXNOb3RBc2tlZCB0aGVuIEBub3RBc2tlZENvdW50KytcbiAgICBAdHJpZ2dlciBcInJlYWR5XCJcblxuIyAgICBpZiBAZm9jdXNNb2RlXG4jICAgICAgJCgnI3N1YnRlc3Rfd3JhcHBlcicpLmFmdGVyICQgXCJcbiMgICAgICAgICAgICA8ZGl2IGlkPSdzdW1tYXJ5X2NvbnRhaW5lcic+PC9kaXY+XG4jICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBwcmV2X3F1ZXN0aW9uJz4je0B0ZXh0LnByZXZpb3VzUXVlc3Rpb259PC9idXR0b24+XG4jICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBuZXh0X3F1ZXN0aW9uJz4je0B0ZXh0Lm5leHRRdWVzdGlvbn08L2J1dHRvbj5cbiMgICAgICAgICAgXCJcblxuICBvblJlbmRlckNvbGxlY3Rpb246LT5cbiMgICAgaWYgQGZvY3VzTW9kZVxuIyAgICAgICQoJyNzdWJ0ZXN0X3dyYXBwZXInKS5hZnRlciAkIFwiXG4jICAgICAgICAgICAgPGRpdiBpZD0nc3VtbWFyeV9jb250YWluZXInPjwvZGl2PlxuIyAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gcHJldl9xdWVzdGlvbic+I3tAdGV4dC5wcmV2aW91c1F1ZXN0aW9ufTwvYnV0dG9uPlxuIyAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gbmV4dF9xdWVzdGlvbic+I3tAdGV4dC5uZXh0UXVlc3Rpb259PC9idXR0b24+XG4jICAgICAgICAgIFwiXG4gICAgQHVwZGF0ZUV4ZWN1dGVSZWFkeSh0cnVlKVxuICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuXG4gICAgaWYgQHF1ZXN0aW9ucy5sZW5ndGggPT0gQG5vdEFza2VkQ291bnRcbiAgICAgIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpICE9IFwiY2xhc3NcIlxuICAgICAgICBAcGFyZW50Lm5leHQ/KClcbiAgICAgIGVsc2VcbiMgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCAkIFwiPHAgY2xhc3M9J2dyZXknPiN7QHRleHQubm90RW5vdWdofTwvcD5cIlxuICAgICAgICBhbGVydCBAdGV4dC5ub3RFbm91Z2hcblxuIyAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuIyAgb25TaG93OiAtPlxuIyAgICBjb25zb2xlLmxvZyhcIm9uU2hvd1wiKVxuIyAgICBpZiBAZm9jdXNNb2RlXG4jICAgICAgJCgnI3N1YnRlc3Rfd3JhcHBlcicpLmFmdGVyICQgXCJcbiMgICAgICAgICAgICA8ZGl2IGlkPSdzdW1tYXJ5X2NvbnRhaW5lcic+PC9kaXY+XG4jICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBwcmV2X3F1ZXN0aW9uJz4je0B0ZXh0LnByZXZpb3VzUXVlc3Rpb259PC9idXR0b24+XG4jICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBuZXh0X3F1ZXN0aW9uJz4je0B0ZXh0Lm5leHRRdWVzdGlvbn08L2J1dHRvbj5cbiMgICAgICAgICAgXCJcbiMgICAgQHVwZGF0ZUV4ZWN1dGVSZWFkeSh0cnVlKVxuIyAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiMgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG4jXG4jICAgIGlmIEBxdWVzdGlvbnMubGVuZ3RoID09IEBub3RBc2tlZENvdW50XG4jICAgICAgaWYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgIT0gXCJjbGFzc1wiXG4jICAgICAgICBAcGFyZW50Lm5leHQ/KClcbiMgICAgICBlbHNlXG4jIyAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkICQgXCI8cCBjbGFzcz0nZ3JleSc+I3tAdGV4dC5ub3RFbm91Z2h9PC9wPlwiXG4jICAgICAgICBhbGVydCBAdGV4dC5ub3RFbm91Z2hcbiNcbiMgICAgIyAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiMgICAgQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG5cbiAgIyBEb3VidCB0aGlzIGlzIGhhcHBlbmluZyBhZnRlciB0aGUgcXVlc3Rpb24gd2FzIHJlbmRlcmVkLiBUT0RPOiBmaW5kIHRoZSByaWdodCBwbGFjZS5cbiAgb25RdWVzdGlvblJlbmRlcmVkOi0+XG4jICAgIGNvbnNvbGUubG9nKFwib25RdWVzdGlvblJlbmRlcmVkIEByZW5kZXJDb3VudDogXCIgKyBAcmVuZGVyQ291bnQpXG4gICAgQHJlbmRlckNvdW50KytcbiMgICAgY29uc29sZS5sb2coXCJvblF1ZXN0aW9uUmVuZGVyZWQgQHJlbmRlckNvdW50IGluY3JlbWVudGVkOiBcIiArIEByZW5kZXJDb3VudClcbiAgICBpZiBAcmVuZGVyQ291bnQgPT0gQHF1ZXN0aW9ucy5sZW5ndGhcbiAgICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuICAgICAgQHVwZGF0ZVNraXBMb2dpYygpXG4jICAgICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4jICAgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG4jICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4jICBvblNob3c6LT5cbiMgICAgY29uc29sZS5sb2coXCJpU2hvd24hXCIpXG4jICAgIEBvblJlbmRlckNvbGxlY3Rpb24oKVxuXG4gIG9uQ2xvc2U6LT5cbiAgICBmb3IgcXYgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgIHF2LmNsb3NlPygpXG4gICAgQHF1ZXN0aW9uVmlld3MgPSBbXVxuXG4gIHJlc2V0OiAoaW5jcmVtZW50KSAtPlxuICAgIGNvbnNvbGUubG9nKFwicmVzZXRcIilcbiAgICBAcmVuZGVyZWQuc3VidGVzdCA9IGZhbHNlXG4gICAgQHJlbmRlcmVkLmFzc2Vzc21lbnQgPSBmYWxzZVxuICAgICMgICAgY3VycmVudFZpZXcgPSBAc3VidGVzdFZpZXdzW0BvcmRlck1hcFtAaW5kZXhdXVxuICAgICMgICAgY3VycmVudFZpZXcuY2xvc2UoKVxuICAgIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlldy5jbG9zZSgpO1xuICAgIEBpbmRleCA9XG4gICAgICBpZiBAYWJvcnRBc3Nlc3NtZW50ID09IHRydWVcbiAgICAgICAgQHN1YnRlc3RWaWV3cy5sZW5ndGgtMVxuICAgICAgZWxzZVxuICAgICAgICBAaW5kZXggKyBpbmNyZW1lbnRcbiAgICBAcmVuZGVyKClcbiAgICB3aW5kb3cuc2Nyb2xsVG8gMCwgMFxuIl19

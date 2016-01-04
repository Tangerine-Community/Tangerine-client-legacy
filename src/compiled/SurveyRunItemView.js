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
    'click .prev_question': 'prevQuestion',
    'render:collection': 'foo'
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
    'rendered': 'onQuestionRendered',
    'add:child': 'foo',
    'collection:rendered': 'foo',
    'render:collection': 'foo'
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1bkl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzhCQUVKLFFBQUEsR0FBVSxHQUFJLENBQUEsUUFBQTs7OEJBQ2QsU0FBQSxHQUFXOzs4QkFDWCxPQUFBLEdBQVM7OzhCQUNULFNBQUEsR0FBVzs7OEJBRVgsTUFBQSxHQUNFO0lBQUEsc0JBQUEsRUFBeUIsY0FBekI7SUFDQSxzQkFBQSxFQUF5QixjQUR6QjtJQUVBLG1CQUFBLEVBQXFCLEtBRnJCOzs7OEJBSUYsVUFBQSxHQUFZLFNBQUMsT0FBRDtBQUVWLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFpQixPQUFPLENBQUM7SUFDekIsSUFBQyxDQUFBLE1BQUQsR0FBaUIsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUN4QixJQUFDLENBQUEsU0FBRCxHQUFpQixPQUFPLENBQUM7SUFDekIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxDQUFrQixXQUFsQjtJQUNqQixJQUFzQixJQUFDLENBQUEsU0FBdkI7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixFQUFqQjs7SUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsUUFBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsV0FBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUlqQixJQUFDLENBQUEsSUFBRCxDQUFBO0lBS0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsS0FBSyxDQUFDO0lBQ3JCLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBO0lBV2QsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFuQixHQUFvQztJQUNwQyxNQUFBLEdBQVM7SUFDVCxNQUFNLENBQUMsSUFBUCxHQUFjLElBQUMsQ0FBQTtJQUNmLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFFBQVgsRUFBcUIsTUFBckI7SUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBQSxLQUEyQixJQUEzQixJQUFtQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxXQUFYLENBQUEsS0FBMkI7SUFDM0UsSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFFLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsQ0FBQSxLQUE0QixJQUE1QixJQUFvQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLENBQUEsS0FBNEIsTUFBbEUsQ0FBQSxJQUErRSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsS0FBbUI7SUFDOUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQW9CLElBQUMsQ0FBQSxTQUFyQjtJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFvQixJQUFDLENBQUEsUUFBckI7V0FFQSxJQUFDLENBQUE7RUExQ1M7OzhCQTRDWixxQkFBQSxHQUF1QixTQUFBO0FBRXJCLFFBQUE7SUFBQSxXQUFBLEdBQWM7QUFDZDtBQUFBLFNBQUEsNkNBQUE7O01BQ0UsSUFBRyxVQUFIO1FBQ0UsSUFBc0IsQ0FBSSxDQUFDLEVBQUUsQ0FBQyxhQUFILElBQW9CLEVBQUUsQ0FBQyxTQUF4QixDQUExQjtVQUFBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLENBQWpCLEVBQUE7U0FERjs7QUFERjtJQUdBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSxhQUFsQjtJQUVBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFaLENBQWlCLGdCQUFqQjtJQUNSLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFaLENBQWlCLGdCQUFqQjtJQUVSLE9BQUEsR0FBVSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQVQsQ0FBZ0IsT0FBaEIsRUFBeUIsV0FBekI7SUFDVixPQUFBLEdBQVUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFULENBQWdCLE9BQWhCLEVBQXlCLFdBQXpCO0lBRVYsSUFBRyxJQUFDLENBQUEsYUFBRCxLQUFrQixPQUFyQjtNQUNFLEtBQUssQ0FBQyxJQUFOLENBQUEsRUFERjtLQUFBLE1BQUE7TUFHRSxLQUFLLENBQUMsSUFBTixDQUFBLEVBSEY7O0lBS0EsSUFBRyxJQUFDLENBQUEsYUFBRCxLQUFrQixPQUFyQjthQUNFLEtBQUssQ0FBQyxJQUFOLENBQUEsRUFERjtLQUFBLE1BQUE7YUFHRSxLQUFLLENBQUMsSUFBTixDQUFBLEVBSEY7O0VBbkJxQjs7OEJBd0J2Qix3QkFBQSxHQUEwQixTQUFBO0FBRXhCLFFBQUE7SUFBQSxJQUFBLENBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsV0FBWCxDQUFkO0FBQUEsYUFBQTs7SUFFQSxJQUFHLElBQUMsQ0FBQSxhQUFELEtBQWtCLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBcEM7TUFJRSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxJQUFwQixDQUFBLEVBSkY7S0FBQSxNQUFBO01BTUUsQ0FBQSxDQUFFLG9CQUFGLENBQXVCLENBQUMsS0FBeEIsQ0FBQTtNQUNBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQUEsRUFQRjs7SUFTQSxVQUFBLEdBQWEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsV0FBVjtJQUNiLFVBQVUsQ0FBQyxJQUFYLENBQUE7SUFDQSxVQUFVLENBQUMsRUFBWCxDQUFjLElBQUMsQ0FBQSxhQUFmLENBQTZCLENBQUMsSUFBOUIsQ0FBQTtJQUlBLElBQUcsSUFBQyxDQUFBLFlBQUo7YUFDRSxJQUFDLENBQUEsYUFBYyxDQUFBLElBQUMsQ0FBQSxhQUFELENBQWUsQ0FBQyxPQUEvQixDQUF1QyxNQUF2QyxFQURGO0tBQUEsTUFBQTtNQUdFLElBQXlCLENBQUksSUFBQyxDQUFBLGVBQTlCO1FBQUEsSUFBQyxDQUFBLGVBQUQsR0FBbUIsR0FBbkI7O2FBQ0EsSUFBQyxDQUFBLGVBQWUsQ0FBQyxJQUFqQixDQUFzQixJQUFDLENBQUEsYUFBdkIsRUFKRjs7RUFuQndCOzs4QkF5QjFCLFlBQUEsR0FBYyxTQUFDLEtBQUQ7SUFDWixJQUEwQixDQUFDLENBQUMsUUFBRixDQUFXLEtBQVgsQ0FBQSxJQUFxQixLQUFBLEdBQVEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUE1QyxJQUFzRCxLQUFBLEdBQVEsQ0FBeEY7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixNQUFqQjs7V0FDQSxJQUFDLENBQUEsd0JBQUQsQ0FBQTtFQUZZOzs4QkFLZCxrQkFBQSxHQUFvQixTQUFDLEtBQUQ7QUFDbEIsUUFBQTtJQUFBLElBQUMsQ0FBQSxZQUFELEdBQWdCO0lBRWhCLElBQWMsNEJBQWQ7QUFBQSxhQUFBOztJQUVBLElBQUcsSUFBQyxDQUFBLGVBQWUsQ0FBQyxNQUFqQixHQUEwQixDQUE3QjtBQUNFO0FBQUEsV0FBQSxxQ0FBQTs7O2NBQ3VCLENBQUUsT0FBdkIsQ0FBK0IsTUFBL0I7O0FBREY7TUFFQSxJQUFDLENBQUEsZUFBRCxHQUFtQixHQUhyQjs7SUFLQSxJQUFzQixJQUFDLENBQUEsWUFBdkI7YUFBQSxJQUFDLENBQUEsZUFBRCxDQUFBLEVBQUE7O0VBVmtCOzs4QkFZcEIsSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsSUFBRCxHQUNFO01BQUEsWUFBQSxFQUFlLENBQUEsQ0FBRSxxQ0FBRixDQUFmO01BQ0EsYUFBQSxFQUFnQixDQUFBLENBQUUsc0NBQUYsQ0FEaEI7TUFFQSxTQUFBLEVBQVksQ0FBQSxDQUFFLENBQUEsQ0FBRSxrQ0FBRixDQUFGLENBQXdDLENBQUMsTUFBekMsQ0FBQSxDQUZaO01BSUEsZ0JBQUEsRUFBbUIsQ0FBQSxDQUFFLHdDQUFGLENBSm5CO01BS0EsWUFBQSxFQUFlLENBQUEsQ0FBRSxvQ0FBRixDQUxmO01BTUEsTUFBQSxFQUFTLENBQUEsQ0FBRSw0QkFBRixDQU5UO01BT0EsTUFBQSxFQUFTLENBQUEsQ0FBRSw0QkFBRixDQVBUO01BUUEsTUFBQSxFQUFTLENBQUEsQ0FBRSw0QkFBRixDQVJUO01BU0EsTUFBQSxFQUFTLENBQUEsQ0FBRSw0QkFBRixDQVRUOztFQUZFOzs4QkFjTixnQkFBQSxHQUFrQixTQUFDLE9BQUQ7QUFHaEIsUUFBQTtJQUFBLElBQUEsQ0FBQSxDQUFjLElBQUMsQ0FBQSxXQUFELElBQWdCLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBekMsQ0FBQTtBQUFBLGFBQUE7O0lBR0EsSUFBQyxDQUFBLFdBQUQsR0FBa0I7SUFDbEIsYUFBQSxHQUFrQixJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBaUIsZUFBakI7SUFDbEIsZUFBQSxHQUFrQjtJQUNsQixhQUFBLEdBQWtCO0lBRWxCLElBQUcsYUFBQSxHQUFnQixDQUFuQjtBQUNFLFdBQVMsb0dBQVQ7UUFDRSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxhQUFjLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBSSxDQUFDO1FBQ3BDLElBQUcsYUFBQSxLQUFpQixHQUFqQixJQUF3QixhQUFBLEtBQWlCLEdBQTVDO1VBQ0UsYUFBQSxHQURGO1NBQUEsTUFBQTtVQUdFLGFBQUEsR0FBZ0IsRUFIbEI7O1FBSUEsZUFBQSxHQUFrQixJQUFJLENBQUMsR0FBTCxDQUFTLGVBQVQsRUFBMEIsYUFBMUI7UUFFbEIsSUFBRyxhQUFBLEtBQWlCLENBQWpCLElBQXNCLGVBQUEsSUFBbUIsYUFBekMsSUFBMEQsQ0FBSSxJQUFDLENBQUEsV0FBbEU7VUFDRSxJQUFDLENBQUEsV0FBRCxHQUFlO1VBQ2YsSUFBQyxDQUFBLGFBQUQsR0FBaUIsRUFGbkI7O0FBUkYsT0FERjs7SUFZQSxJQUFDLENBQUEsY0FBRCxDQUFBO1dBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBQTtFQXhCZ0I7OzhCQTBCbEIsY0FBQSxHQUFnQixTQUFBO0FBQ2QsUUFBQTtJQUFBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQWlCLGVBQWpCO1dBQ2hCLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUF1QixTQUFDLElBQUQsRUFBTyxDQUFQO01BQ3JCLElBQUcsQ0FBQSxHQUFJLENBQUMsSUFBQyxDQUFBLGFBQUQsR0FBaUIsQ0FBbEIsQ0FBUDtRQUNFLElBQUcsSUFBQyxDQUFBLFdBQUo7VUFDRSxJQUFJLENBQUMsYUFBTCxHQUFxQjtpQkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFULENBQXFCLG1CQUFyQixFQUZGO1NBQUEsTUFBQTtVQUlFLElBQUksQ0FBQyxhQUFMLEdBQXFCO2lCQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVQsQ0FBcUIsbUJBQXJCLEVBTEY7U0FERjs7SUFEcUIsQ0FBdkIsRUFRRSxJQVJGO0VBRmM7OzhCQVloQixlQUFBLEdBQWlCLFNBQUE7V0FHZixJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBdUIsU0FBQyxFQUFEO0FBQ3JCLFVBQUE7TUFBQSxRQUFBLEdBQVcsRUFBRSxDQUFDO01BQ2QsYUFBQSxHQUFnQixRQUFRLENBQUMsU0FBVCxDQUFtQixXQUFuQjtNQUNoQixJQUFPLGFBQUEsS0FBaUIsRUFBeEI7QUFDRTtVQUNFLE1BQUEsR0FBUyxZQUFZLENBQUMsTUFBRCxDQUFLLENBQUMsS0FBbEIsQ0FBd0IsSUFBeEIsRUFBMkIsQ0FBQyxhQUFELENBQTNCLEVBRFg7U0FBQSxjQUFBO1VBR007VUFDSixJQUFBLEdBQU8sQ0FBRSxvQkFBcUIsQ0FBQyxJQUF2QixDQUE0QixLQUFLLENBQUMsV0FBVyxDQUFDLFFBQWxCLENBQUEsQ0FBNUIsQ0FBMEQsQ0FBQSxDQUFBLENBQTNEO1VBQ1AsT0FBQSxHQUFVLEtBQUssQ0FBQztVQUNoQixLQUFBLENBQU0sK0JBQUEsR0FBK0IsQ0FBQyxRQUFRLENBQUMsR0FBVCxDQUFhLE1BQWIsQ0FBRCxDQUEvQixHQUFxRCxNQUFyRCxHQUEyRCxJQUEzRCxHQUFnRSxNQUFoRSxHQUFzRSxPQUE1RSxFQU5GOztRQVFBLElBQUcsTUFBSDtVQUNFLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUCxDQUFnQixrQkFBaEI7VUFDQSxFQUFFLENBQUMsU0FBSCxHQUFlLEtBRmpCO1NBQUEsTUFBQTtVQUlFLEVBQUUsQ0FBQyxHQUFHLENBQUMsV0FBUCxDQUFtQixrQkFBbkI7VUFDQSxFQUFFLENBQUMsU0FBSCxHQUFlLE1BTGpCO1NBVEY7O2FBZUEsRUFBRSxDQUFDLGNBQUgsQ0FBQTtJQWxCcUIsQ0FBdkIsRUFtQkUsSUFuQkY7RUFIZTs7OEJBd0JqQixPQUFBLEdBQVMsU0FBQyxLQUFEO0FBQ1AsUUFBQTs7TUFEUSxRQUFRLElBQUMsQ0FBQTs7SUFDakIsSUFBbUIsYUFBbkI7QUFBQSxhQUFPLEtBQVA7O0lBQ0EsSUFBbUIsQ0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLEtBQVYsQ0FBdkI7TUFBQSxLQUFBLEdBQVEsQ0FBQyxLQUFELEVBQVI7O0FBQ0EsU0FBQSwrQ0FBQTs7TUFDRSxFQUFFLENBQUMsY0FBSCxDQUFBO01BRUEsSUFBRyxDQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsVUFBVCxDQUFvQixXQUFwQixDQUFQO1FBRUUsSUFBRyxDQUFJLEVBQUUsQ0FBQyxPQUFWO0FBR0UsaUJBQU8sTUFIVDtTQUZGOztBQUhGO0FBVUEsV0FBTztFQWJBOzs4QkFlVCxTQUFBLEdBQVcsU0FBQTtBQU1ULFdBQU8sSUFBQyxDQUFBLE9BQUQsQ0FBQTtFQU5FOzs4QkFhWCxVQUFBLEdBQVksU0FBQTtBQUNWLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFDVCxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBdUIsU0FBQyxFQUFELEVBQUssQ0FBTDthQUNyQixNQUFPLENBQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBckIsQ0FBeUIsTUFBekIsQ0FBQSxDQUFQLEdBQTJDO0lBRHRCLENBQXZCLEVBRUUsSUFGRjtBQUdBLFdBQU87RUFMRzs7OEJBT1osU0FBQSxHQUFXLFNBQUE7QUFDVCxRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQXVCLFNBQUMsRUFBRCxFQUFLLENBQUw7YUFFckIsTUFBTyxDQUFBLEVBQUUsQ0FBQyxJQUFILENBQVAsR0FDSyxFQUFFLENBQUMsUUFBTixHQUNFLEVBQUUsQ0FBQyxjQURMLEdBRVEsQ0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLEVBQUUsQ0FBQyxNQUFiLENBQVAsR0FDSCxFQUFFLENBQUMsTUFEQSxHQUVHLEVBQUUsQ0FBQyxPQUFOLEdBQ0gsRUFBRSxDQUFDLGFBREEsR0FFRyxFQUFFLENBQUMsU0FBTixHQUNILEVBQUUsQ0FBQyxrQkFEQSxHQUVHLEVBQUUsQ0FBQyxhQUFOLEdBQ0gsRUFBRSxDQUFDLHNCQURBLEdBR0gsRUFBRSxDQUFDO0lBZGMsQ0FBdkIsRUFlRSxJQWZGO0lBZ0JBLElBQTZCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBN0I7TUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxFQUFQOztXQUNBLGFBQUEsR0FDRTtNQUFBLE1BQUEsRUFBUyxNQUFUO01BQ0EsTUFBQSxFQUNFO1FBQUEsTUFBQSxFQUFTLElBQVQ7T0FGRjs7RUFwQk87OzhCQXlCWCxVQUFBLEdBQVksU0FBQyxLQUFEO0FBQ1YsUUFBQTs7TUFEVyxRQUFRLElBQUMsQ0FBQTs7SUFDcEIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsVUFBVixDQUFxQixDQUFDLE1BQXRCLENBQUE7SUFDQSxLQUFBLEdBQVE7SUFDUixJQUFtQixDQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBVixDQUF2QjtNQUFBLEtBQUEsR0FBUSxDQUFDLEtBQUQsRUFBUjs7V0FDQSxLQUFLLENBQUMsT0FBTixDQUFjLFNBQUMsRUFBRCxFQUFLLENBQUw7QUFDWixVQUFBO01BQUEsSUFBRyxDQUFJLENBQUMsQ0FBQyxRQUFGLENBQVcsRUFBWCxDQUFQO1FBQ0UsT0FBQSxHQUFVO1FBQ1YsSUFBRyxDQUFJLEVBQUUsQ0FBQyxPQUFWO1VBRUUsYUFBQSxHQUFnQixFQUFFLENBQUMsS0FBSyxDQUFDLEdBQVQsQ0FBYSx5QkFBYjtVQUNoQixJQUFHLENBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxhQUFWLENBQVA7WUFDRSxPQUFBLEdBQVUsY0FEWjtXQUFBLE1BQUE7WUFHRSxPQUFBLEdBQVUsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUhsQjs7VUFLQSxJQUFHLEtBQUEsS0FBUyxJQUFaO1lBQ0UsSUFBb0IsS0FBQSxLQUFTLElBQUMsQ0FBQSxhQUE5QjtjQUFBLElBQUMsQ0FBQSxZQUFELENBQWMsQ0FBZCxFQUFBOztZQUNBLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUCxDQUFBO1lBQ0EsS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFDLENBQUEsSUFBSSxDQUFDLGFBQXJCO1lBQ0EsS0FBQSxHQUFRLE1BSlY7V0FSRjs7ZUFhQSxFQUFFLENBQUMsVUFBSCxDQUFjLE9BQWQsRUFmRjs7SUFEWSxDQUFkLEVBaUJFLElBakJGO0VBSlU7OzhCQXdCWixNQUFBLEdBQVEsU0FBQTtBQUNOLFdBQU87TUFBQyxPQUFBLEVBQVEsQ0FBVDtNQUFXLFNBQUEsRUFBVSxDQUFyQjtNQUF1QixPQUFBLEVBQVEsQ0FBL0I7TUFBaUMsS0FBQSxFQUFNLENBQXZDOztFQUREOzs4QkFHUixXQUFBLEdBQ0U7SUFBQSxlQUFBLEVBQWlCLGtCQUFqQjtJQUNBLFFBQUEsRUFBVSxrQkFEVjtJQUVBLFVBQUEsRUFBWSxvQkFGWjtJQUdBLFdBQUEsRUFBYSxLQUhiO0lBSUEscUJBQUEsRUFBdUIsS0FKdkI7SUFLQSxtQkFBQSxFQUFxQixLQUxyQjs7OzhCQVNGLEdBQUEsR0FBSyxTQUFBO1dBQ0gsT0FBTyxDQUFDLEdBQVIsQ0FBWSx1QkFBWjtFQURHOzs4QkFJTCxjQUFBLEdBQWdCLFNBQUMsS0FBRCxFQUFRLGNBQVIsRUFBd0IsZ0JBQXhCO0FBQ2QsUUFBQTtJQUFBLE9BQUEsR0FBVSxDQUFDLENBQUMsTUFBRixDQUFTO01BQUMsS0FBQSxFQUFPLEtBQVI7S0FBVCxFQUF5QixnQkFBekI7SUFDVixTQUFBLEdBQWdCLElBQUEsY0FBQSxDQUFlLE9BQWY7SUFDaEIsUUFBQSxHQUFXLEtBQUssQ0FBQyxTQUFOLENBQWdCLGlCQUFoQjtJQUNYLFVBQUEsR0FBYSxDQUFFLENBQUUsUUFBQSxLQUFZLENBQVosSUFBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQUEsQ0FBQSxHQUF5QixRQUE1QyxDQUFBLElBQTBELElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBQSxDQUE1RCxDQUFBLElBQThGLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFBLENBQUEsS0FBMEI7SUFDckksS0FBSyxDQUFDLEdBQU4sQ0FBVyxVQUFYLEVBQXVCLFVBQXZCO0lBQ0EsSUFBRyxVQUFIO01BQW1CLElBQUMsQ0FBQSxhQUFELEdBQW5COztJQUNBLFVBQVUsQ0FBQyxpQkFBWCxDQUE2QixTQUE3QjtJQUNBLElBQUMsQ0FBQSxhQUFjLENBQUEsZ0JBQWdCLENBQUMsS0FBakIsQ0FBZixHQUF5QztBQUV6QyxXQUFPO0VBVk87OzhCQWNoQixnQkFBQSxHQUFrQixTQUFDLEtBQUQsRUFBUSxLQUFSO0FBQ2hCLFFBQUE7SUFBQSxJQUFBLENBQU8sSUFBQyxDQUFBLFNBQVI7TUFDRSxRQUFBLEdBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQXJCLENBQStCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBL0IsRUFEYjs7SUFHQSxJQUFBLEdBQVMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxNQUFiLENBQW9CLENBQUMsT0FBckIsQ0FBNkIsZ0JBQTdCLEVBQStDLEdBQS9DO0lBQ1QsSUFBMkIsUUFBM0I7TUFBQSxNQUFBLEdBQVMsUUFBUyxDQUFBLElBQUEsRUFBbEI7O0lBQ0EsTUFBQSxHQUFTO0lBQ1QsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUE7SUFDZixLQUFLLENBQUMsR0FBTixDQUFVLFFBQVYsRUFBb0IsTUFBcEI7SUFDQSxPQUFBLEdBQ0U7TUFBQSxLQUFBLEVBQWdCLEtBQWhCO01BQ0EsTUFBQSxFQUFnQixJQURoQjtNQUVBLFNBQUEsRUFBZ0IsSUFBQyxDQUFBLFNBRmpCO01BR0EsUUFBQSxFQUFnQixLQUFLLENBQUMsR0FBTixDQUFVLFVBQVYsQ0FIaEI7TUFJQSxhQUFBLEVBQWdCLElBQUMsQ0FBQSxhQUpqQjtNQUtBLE1BQUEsRUFBZ0IsTUFMaEI7TUFNQSxLQUFBLEVBQVMsS0FOVDs7QUFPRixXQUFPO0VBakJTOzs4QkFtQmxCLGNBQUEsR0FBZ0IsU0FBQSxHQUFBOzs4QkFHaEIsUUFBQSxHQUFVLFNBQUE7QUFFUixRQUFBO0lBQUEsYUFBQSxHQUFnQjtJQUNoQixJQUFHLDRCQUFIO01BQ0UsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQXhCLENBQWdDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxRQUFELEVBQVcsQ0FBWDtBQUU5QixjQUFBO1VBQUEsUUFBQSxHQUFXLFFBQVEsQ0FBQyxTQUFULENBQW1CLGlCQUFuQjtVQUNYLFVBQUEsR0FBYSxDQUFFLENBQUUsUUFBQSxLQUFZLENBQVosSUFBaUIsS0FBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQUEsQ0FBQSxHQUF5QixRQUE1QyxDQUFBLElBQTBELEtBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBQSxDQUE1RCxDQUFBLElBQThGLEtBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFBLENBQUEsS0FBMEI7VUFDckksUUFBUSxDQUFDLEdBQVQsQ0FBYyxVQUFkLEVBQTBCLFVBQTFCO1VBQ0EsSUFBRyxVQUFIO21CQUFtQixLQUFDLENBQUEsYUFBRCxHQUFuQjs7UUFMOEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDLEVBREY7O1dBT0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxPQUFUO0VBVlE7OzhCQW1CVixrQkFBQSxHQUFtQixTQUFBO0FBT2pCLFFBQUE7SUFBQSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsSUFBcEI7SUFDQSxJQUFDLENBQUEsd0JBQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxxQkFBRCxDQUFBO0lBRUEsSUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsS0FBcUIsSUFBQyxDQUFBLGFBQXpCO01BQ0UsSUFBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQW5CLENBQXVCLFNBQXZCLENBQUEsS0FBcUMsT0FBeEM7O2NBQ1MsQ0FBQztTQURWO09BQUEsTUFBQTtRQUlFLEtBQUEsQ0FBTSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQVosRUFKRjtPQURGOztXQVFBLElBQUMsQ0FBQSxPQUFELENBQVMsYUFBVDtFQW5CaUI7OzhCQTRDbkIsa0JBQUEsR0FBbUIsU0FBQTtJQUVqQixJQUFDLENBQUEsV0FBRDtJQUVBLElBQUcsSUFBQyxDQUFBLFdBQUQsS0FBZ0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUE5QjtNQUNFLElBQUMsQ0FBQSxPQUFELENBQVMsT0FBVDthQUNBLElBQUMsQ0FBQSxlQUFELENBQUEsRUFGRjs7RUFKaUI7OzhCQWVuQixPQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7QUFBQTtBQUFBLFNBQUEscUNBQUE7OztRQUNFLEVBQUUsQ0FBQzs7QUFETDtXQUVBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0VBSFg7OzhCQUtSLEtBQUEsR0FBTyxTQUFDLFNBQUQ7SUFDTCxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVo7SUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsR0FBb0I7SUFDcEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxVQUFWLEdBQXVCO0lBR3ZCLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEtBQWxDLENBQUE7SUFDQSxJQUFDLENBQUEsS0FBRCxHQUNLLElBQUMsQ0FBQSxlQUFELEtBQW9CLElBQXZCLEdBQ0UsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLEdBQXFCLENBRHZCLEdBR0UsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNiLElBQUMsQ0FBQSxNQUFELENBQUE7V0FDQSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUFtQixDQUFuQjtFQWJLOzs7O0dBbGF1QixRQUFRLENBQUMsVUFBVSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1bkl0ZW1WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU3VydmV5UnVuSXRlbVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5NYXJpb25ldHRlLkNvbXBvc2l0ZVZpZXdcblxuICB0ZW1wbGF0ZTogSlNUW1wiU3VydmV5XCJdLFxuICBjaGlsZFZpZXc6IFF1ZXN0aW9uUnVuSXRlbVZpZXcsXG4gIHRhZ05hbWU6IFwicFwiLFxuICBjbGFzc05hbWU6IFwiU3VydmV5UnVuSXRlbVZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLm5leHRfcXVlc3Rpb24nIDogJ25leHRRdWVzdGlvbidcbiAgICAnY2xpY2sgLnByZXZfcXVlc3Rpb24nIDogJ3ByZXZRdWVzdGlvbidcbiAgICAncmVuZGVyOmNvbGxlY3Rpb24nOiAnZm9vJ1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQG1vZGVsICAgICAgICAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCAgICAgICAgPSBAbW9kZWwucGFyZW50XG4gICAgQGRhdGFFbnRyeSAgICAgPSBvcHRpb25zLmRhdGFFbnRyeVxuICAgIEBpc09ic2VydmF0aW9uID0gb3B0aW9ucy5pc09ic2VydmF0aW9uXG4gICAgQGZvY3VzTW9kZSAgICAgPSBAbW9kZWwuZ2V0Qm9vbGVhbihcImZvY3VzTW9kZVwiKVxuICAgIEBxdWVzdGlvbkluZGV4ID0gMCBpZiBAZm9jdXNNb2RlXG4gICAgQHF1ZXN0aW9uVmlld3MgPSBbXVxuICAgIEBhbnN3ZXJlZCAgICAgID0gW11cbiAgICBAcmVuZGVyQ291bnQgICA9IDBcbiAgICBAbm90QXNrZWRDb3VudCA9IDBcbiMgICAgQGNoaWxkVmlld09wdGlvbnMgPVxuIyAgICAgICAgcGFyZW50OiB0aGlzXG5cbiAgICBAaTE4bigpXG4jICAgIHRoaXMubGlzdGVuVG8oQG1vZGVsLmNvbGxlY3Rpb24sJ2NoYW5nZScsIHRoaXMudmlld1JlbmRlcilcbiMgICAgICB0aGlzLmxpc3RlblRvKG1vZGVsLmNvbGxlY3Rpb24sICdyZXNldCcsIHRoaXMucmVuZGVyKTtcbiMgICAgaWYgQG1vZGVsLnF1ZXN0aW9ucy5sZW5ndGggPT0gMFxuIyAgICAgIGNvbnNvbGUubG9nKFwiTm8gcXVlc3Rpb25zLlwiKVxuICAgIEBjb2xsZWN0aW9uID0gQG1vZGVsLnF1ZXN0aW9uc1xuICAgIEBxdWVzdGlvbnMgPSBAY29sbGVjdGlvblxuXG4jICAgIEBtb2RlbC5xdWVzdGlvbnMuZmV0Y2hcbiMgICAgICB2aWV3T3B0aW9uczpcbiMgICAgICAgIGtleTogXCJxdWVzdGlvbi0je0Btb2RlbC5pZH1cIlxuIyAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuIyMgICAgICAgIEBtb2RlbC5xdWVzdGlvbnMuc29ydCgpXG4jICAgICAgICBjb2xsZWN0aW9uLnNvcnQoKVxuIyAgICAgICAgQG1vZGVsLmNvbGxlY3Rpb24ubW9kZWxzID0gY29sbGVjdGlvbi5tb2RlbHNcbiMgICAgICAgIEByZW5kZXIoKVxuXG4gICAgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3ID0gQFxuICAgIGxhYmVscyA9IHt9XG4gICAgbGFiZWxzLnRleHQgPSBAdGV4dFxuICAgIEBtb2RlbC5zZXQoJ2xhYmVscycsIGxhYmVscylcblxuICAgIEBza2lwcGFibGUgPSBAbW9kZWwuZ2V0KFwic2tpcHBhYmxlXCIpID09IHRydWUgfHwgQG1vZGVsLmdldChcInNraXBwYWJsZVwiKSA9PSBcInRydWVcIlxuICAgIEBiYWNrYWJsZSA9ICggQG1vZGVsLmdldChcImJhY2tCdXR0b25cIikgPT0gdHJ1ZSB8fCBAbW9kZWwuZ2V0KFwiYmFja0J1dHRvblwiKSA9PSBcInRydWVcIiApIGFuZCBAcGFyZW50LmluZGV4IGlzbnQgMFxuICAgIEBwYXJlbnQuZGlzcGxheVNraXAoQHNraXBwYWJsZSlcbiAgICBAcGFyZW50LmRpc3BsYXlCYWNrKEBiYWNrYWJsZSlcblxuICAgIEBsaXN0ZW5Ub1xuXG4gIHVwZGF0ZVByb2dyZXNzQnV0dG9uczogLT5cblxuICAgIGlzQXZhaWxhYmxlID0gW11cbiAgICBmb3IgcXYsIGkgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgIGlmIHF2P1xuICAgICAgICBpc0F2YWlsYWJsZS5wdXNoIGkgaWYgbm90IChxdi5pc0F1dG9zdG9wcGVkIG9yIHF2LmlzU2tpcHBlZClcbiAgICBpc0F2YWlsYWJsZS5wdXNoIEBxdWVzdGlvbkluZGV4XG5cbiAgICAkcHJldiA9IEBwYXJlbnQuJGVsLmZpbmQoXCIucHJldl9xdWVzdGlvblwiKVxuICAgICRuZXh0ID0gQHBhcmVudC4kZWwuZmluZChcIi5uZXh0X3F1ZXN0aW9uXCIpXG5cbiAgICBtaW5pbXVtID0gTWF0aC5taW4uYXBwbHkoIG1pbmltdW0sIGlzQXZhaWxhYmxlIClcbiAgICBtYXhpbXVtID0gTWF0aC5tYXguYXBwbHkoIG1heGltdW0sIGlzQXZhaWxhYmxlIClcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IG1pbmltdW1cbiAgICAgICRwcmV2LmhpZGUoKVxuICAgIGVsc2VcbiAgICAgICRwcmV2LnNob3coKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggPT0gbWF4aW11bVxuICAgICAgJG5leHQuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgJG5leHQuc2hvdygpXG5cbiAgdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5OiAtPlxuXG4gICAgcmV0dXJuIHVubGVzcyBAbW9kZWwuZ2V0KFwiZm9jdXNNb2RlXCIpXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCA9PSBAcXVlc3Rpb25WaWV3cy5sZW5ndGhcbiMgICAgICAkKFwiI3N1bW1hcnlfY29udGFpbmVyXCIpLmh0bWwgXCJcbiMgICAgICAgIGxhc3QgcGFnZSBoZXJlXG4jICAgICAgXCJcbiAgICAgICQoXCIubmV4dF9xdWVzdGlvblwiKS5oaWRlKClcbiAgICBlbHNlXG4gICAgICAkKFwiI3N1bW1hcnlfY29udGFpbmVyXCIpLmVtcHR5KClcbiAgICAgICQoXCIubmV4dF9xdWVzdGlvblwiKS5zaG93KClcblxuICAgICRxdWVzdGlvbnMgPSBAJGVsLmZpbmQoXCIucXVlc3Rpb25cIilcbiAgICAkcXVlc3Rpb25zLmhpZGUoKVxuICAgICRxdWVzdGlvbnMuZXEoQHF1ZXN0aW9uSW5kZXgpLnNob3coKVxuXG4gICAgIyB0cmlnZ2VyIHRoZSBxdWVzdGlvbiB0byBydW4gaXQncyBkaXNwbGF5IGNvZGUgaWYgdGhlIHN1YnRlc3QncyBkaXNwbGF5Y29kZSBoYXMgYWxyZWFkeSByYW5cbiAgICAjIGlmIG5vdCwgYWRkIGl0IHRvIGEgbGlzdCB0byBydW4gbGF0ZXIuXG4gICAgaWYgQGV4ZWN1dGVSZWFkeVxuICAgICAgQHF1ZXN0aW9uVmlld3NbQHF1ZXN0aW9uSW5kZXhdLnRyaWdnZXIgXCJzaG93XCJcbiAgICBlbHNlXG4gICAgICBAdHJpZ2dlclNob3dMaXN0ID0gW10gaWYgbm90IEB0cmlnZ2VyU2hvd0xpc3RcbiAgICAgIEB0cmlnZ2VyU2hvd0xpc3QucHVzaCBAcXVlc3Rpb25JbmRleFxuXG4gIHNob3dRdWVzdGlvbjogKGluZGV4KSAtPlxuICAgIEBxdWVzdGlvbkluZGV4ID0gaW5kZXggaWYgXy5pc051bWJlcihpbmRleCkgJiYgaW5kZXggPCBAcXVlc3Rpb25WaWV3cy5sZW5ndGggJiYgaW5kZXggPiAwXG4gICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4jICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuXG4gIHVwZGF0ZUV4ZWN1dGVSZWFkeTogKHJlYWR5KSAtPlxuICAgIEBleGVjdXRlUmVhZHkgPSByZWFkeVxuXG4gICAgcmV0dXJuIGlmIG5vdCBAdHJpZ2dlclNob3dMaXN0P1xuXG4gICAgaWYgQHRyaWdnZXJTaG93TGlzdC5sZW5ndGggPiAwXG4gICAgICBmb3IgaW5kZXggaW4gQHRyaWdnZXJTaG93TGlzdFxuICAgICAgICBAcXVlc3Rpb25WaWV3c1tpbmRleF0/LnRyaWdnZXIgXCJzaG93XCJcbiAgICAgIEB0cmlnZ2VyU2hvd0xpc3QgPSBbXVxuXG4gICAgQHVwZGF0ZVNraXBMb2dpYygpIGlmIEBleGVjdXRlUmVhZHlcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIHBsZWFzZUFuc3dlciA6IHQoXCJTdXJ2ZXlSdW5WaWV3Lm1lc3NhZ2UucGxlYXNlX2Fuc3dlclwiKVxuICAgICAgY29ycmVjdEVycm9ycyA6IHQoXCJTdXJ2ZXlSdW5WaWV3Lm1lc3NhZ2UuY29ycmVjdF9lcnJvcnNcIilcbiAgICAgIG5vdEVub3VnaCA6IF8odChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5ub3RfZW5vdWdoXCIpKS5lc2NhcGUoKVxuXG4gICAgICBwcmV2aW91c1F1ZXN0aW9uIDogdChcIlN1cnZleVJ1blZpZXcuYnV0dG9uLnByZXZpb3VzX3F1ZXN0aW9uXCIpXG4gICAgICBuZXh0UXVlc3Rpb24gOiB0KFwiU3VydmV5UnVuVmlldy5idXR0b24ubmV4dF9xdWVzdGlvblwiKVxuICAgICAgXCJuZXh0XCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLm5leHRcIilcbiAgICAgIFwiYmFja1wiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5iYWNrXCIpXG4gICAgICBcInNraXBcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uc2tpcFwiKVxuICAgICAgXCJoZWxwXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLmhlbHBcIilcblxuICAjIHdoZW4gYSBxdWVzdGlvbiBpcyBhbnN3ZXJlZFxuICBvblF1ZXN0aW9uQW5zd2VyOiAoZWxlbWVudCkgLT5cbiMgICAgY29uc29sZS5sb2coXCJvblF1ZXN0aW9uQW5zd2VyIEByZW5kZXJDb3VudDpcIiArIEByZW5kZXJDb3VudCArIFwiICBAcXVlc3Rpb25zLmxlbmd0aDogXCIgKyAgQHF1ZXN0aW9ucy5sZW5ndGgpXG4jICAgIHRoaXMgaXMgbm90IGdvb2QuIFNob3VsZCB0ZXN0IGZvciA9PVxuICAgIHJldHVybiB1bmxlc3MgQHJlbmRlckNvdW50ID49IEBxdWVzdGlvbnMubGVuZ3RoXG5cbiAgICAjIGF1dG8gc3RvcCBhZnRlciBsaW1pdFxuICAgIEBhdXRvc3RvcHBlZCAgICA9IGZhbHNlXG4gICAgYXV0b3N0b3BMaW1pdCAgID0gQG1vZGVsLmdldE51bWJlciBcImF1dG9zdG9wTGltaXRcIlxuICAgIGxvbmdlc3RTZXF1ZW5jZSA9IDBcbiAgICBhdXRvc3RvcENvdW50ICAgPSAwXG5cbiAgICBpZiBhdXRvc3RvcExpbWl0ID4gMFxuICAgICAgZm9yIGkgaW4gWzEuLkBxdWVzdGlvblZpZXdzLmxlbmd0aF0gIyBqdXN0IGluIGNhc2UgdGhleSBjYW4ndCBjb3VudFxuICAgICAgICBjdXJyZW50QW5zd2VyID0gQHF1ZXN0aW9uVmlld3NbaS0xXS5hbnN3ZXJcbiAgICAgICAgaWYgY3VycmVudEFuc3dlciA9PSBcIjBcIiBvciBjdXJyZW50QW5zd2VyID09IFwiOVwiXG4gICAgICAgICAgYXV0b3N0b3BDb3VudCsrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhdXRvc3RvcENvdW50ID0gMFxuICAgICAgICBsb25nZXN0U2VxdWVuY2UgPSBNYXRoLm1heChsb25nZXN0U2VxdWVuY2UsIGF1dG9zdG9wQ291bnQpXG4gICAgICAgICMgaWYgdGhlIHZhbHVlIGlzIHNldCwgd2UndmUgZ290IGEgdGhyZXNob2xkIGV4Y2VlZGluZyBydW4sIGFuZCBpdCdzIG5vdCBhbHJlYWR5IGF1dG9zdG9wcGVkXG4gICAgICAgIGlmIGF1dG9zdG9wTGltaXQgIT0gMCAmJiBsb25nZXN0U2VxdWVuY2UgPj0gYXV0b3N0b3BMaW1pdCAmJiBub3QgQGF1dG9zdG9wcGVkXG4gICAgICAgICAgQGF1dG9zdG9wcGVkID0gdHJ1ZVxuICAgICAgICAgIEBhdXRvc3RvcEluZGV4ID0gaVxuICAgIEB1cGRhdGVBdXRvc3RvcCgpXG4gICAgQHVwZGF0ZVNraXBMb2dpYygpXG5cbiAgdXBkYXRlQXV0b3N0b3A6IC0+XG4gICAgYXV0b3N0b3BMaW1pdCA9IEBtb2RlbC5nZXROdW1iZXIgXCJhdXRvc3RvcExpbWl0XCJcbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoICh2aWV3LCBpKSAtPlxuICAgICAgaWYgaSA+IChAYXV0b3N0b3BJbmRleCAtIDEpXG4gICAgICAgIGlmIEBhdXRvc3RvcHBlZFxuICAgICAgICAgIHZpZXcuaXNBdXRvc3RvcHBlZCA9IHRydWVcbiAgICAgICAgICB2aWV3LiRlbC5hZGRDbGFzcyAgICBcImRpc2FibGVkX2F1dG9zdG9wXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpZXcuaXNBdXRvc3RvcHBlZCA9IGZhbHNlXG4gICAgICAgICAgdmlldy4kZWwucmVtb3ZlQ2xhc3MgXCJkaXNhYmxlZF9hdXRvc3RvcFwiXG4gICAgLCBAXG5cbiAgdXBkYXRlU2tpcExvZ2ljOiAtPlxuIyAgICBjb25zb2xlLmxvZyhcInVwZGF0ZVNraXBMb2dpY1wiKVxuIyAgICBjb25zb2xlLmxvZyhcIkBxdWVzdGlvblZpZXdzXCIgKyBAcXVlc3Rpb25WaWV3cy5sZW5ndGgpXG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAocXYpIC0+XG4gICAgICBxdWVzdGlvbiA9IHF2Lm1vZGVsXG4gICAgICBza2lwTG9naWNDb2RlID0gcXVlc3Rpb24uZ2V0U3RyaW5nIFwic2tpcExvZ2ljXCJcbiAgICAgIHVubGVzcyBza2lwTG9naWNDb2RlIGlzIFwiXCJcbiAgICAgICAgdHJ5XG4gICAgICAgICAgcmVzdWx0ID0gQ29mZmVlU2NyaXB0LmV2YWwuYXBwbHkoQCwgW3NraXBMb2dpY0NvZGVdKVxuIyAgICAgICAgICBjb25zb2xlLmxvZyhcInNraXBMb2dpY0NvZGU6IFwiICsgc2tpcExvZ2ljQ29kZSlcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICBuYW1lID0gKCgvZnVuY3Rpb24gKC57MSx9KVxcKC8pLmV4ZWMoZXJyb3IuY29uc3RydWN0b3IudG9TdHJpbmcoKSlbMV0pXG4gICAgICAgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgICBhbGVydCBcIlNraXAgbG9naWMgZXJyb3IgaW4gcXVlc3Rpb24gI3txdWVzdGlvbi5nZXQoJ25hbWUnKX1cXG5cXG4je25hbWV9XFxuXFxuI3ttZXNzYWdlfVwiXG5cbiAgICAgICAgaWYgcmVzdWx0XG4gICAgICAgICAgcXYuJGVsLmFkZENsYXNzIFwiZGlzYWJsZWRfc2tpcHBlZFwiXG4gICAgICAgICAgcXYuaXNTa2lwcGVkID0gdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcXYuJGVsLnJlbW92ZUNsYXNzIFwiZGlzYWJsZWRfc2tpcHBlZFwiXG4gICAgICAgICAgcXYuaXNTa2lwcGVkID0gZmFsc2VcbiAgICAgIHF2LnVwZGF0ZVZhbGlkaXR5KClcbiAgICAsIEBcblxuICBpc1ZhbGlkOiAodmlld3MgPSBAcXVlc3Rpb25WaWV3cykgLT5cbiAgICByZXR1cm4gdHJ1ZSBpZiBub3Qgdmlld3M/ICMgaWYgdGhlcmUncyBub3RoaW5nIHRvIGNoZWNrLCBpdCBtdXN0IGJlIGdvb2RcbiAgICB2aWV3cyA9IFt2aWV3c10gaWYgbm90IF8uaXNBcnJheSh2aWV3cylcbiAgICBmb3IgcXYsIGkgaW4gdmlld3NcbiAgICAgIHF2LnVwZGF0ZVZhbGlkaXR5KClcbiAgICAgICMgY2FuIHdlIHNraXAgaXQ/XG4gICAgICBpZiBub3QgcXYubW9kZWwuZ2V0Qm9vbGVhbihcInNraXBwYWJsZVwiKVxuICAgICAgICAjIGlzIGl0IHZhbGlkXG4gICAgICAgIGlmIG5vdCBxdi5pc1ZhbGlkXG4gICAgICAgICAgIyByZWQgYWxlcnQhIVxuIyAgICAgICAgICBjb25zb2xlLmxvZyhcInBvcCB1cCBhbiBlcnJvclwiKVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuIyAgICAsIEBcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHRlc3RWYWxpZDogLT5cbiMgICAgY29uc29sZS5sb2coXCJTdXJ2ZXlSaW5JdGVtIHRlc3RWYWxpZC5cIilcbiMgICAgaWYgbm90IEBwcm90b3R5cGVSZW5kZXJlZCB0aGVuIHJldHVybiBmYWxzZVxuIyAgICBjdXJyZW50VmlldyA9IFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1xuIyAgICBpZiBAaXNWYWxpZD9cbiMgICAgY29uc29sZS5sb2coXCJ0ZXN0dmFsaWQ6IFwiICsgQGlzVmFsaWQ/KVxuICAgIHJldHVybiBAaXNWYWxpZCgpXG4jICAgIGVsc2VcbiMgICAgICByZXR1cm4gZmFsc2VcbiMgICAgdHJ1ZVxuXG5cbiAgIyBAVE9ETyB0aGlzIHNob3VsZCBwcm9iYWJseSBiZSByZXR1cm5pbmcgbXVsdGlwbGUsIHNpbmdsZSB0eXBlIGhhc2ggdmFsdWVzXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgcmVzdWx0ID0ge31cbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoIChxdiwgaSkgLT5cbiAgICAgIHJlc3VsdFtAcXVlc3Rpb25zLm1vZGVsc1tpXS5nZXQoXCJuYW1lXCIpXSA9IFwic2tpcHBlZFwiXG4gICAgLCBAXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIGdldFJlc3VsdDogLT5cbiAgICByZXN1bHQgPSB7fVxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuIyAgICAgIHJlc3VsdFtAcXVlc3Rpb25zLm1vZGVsc1tpXS5nZXQoXCJuYW1lXCIpXSA9XG4gICAgICByZXN1bHRbcXYubmFtZV0gPVxuICAgICAgICBpZiBxdi5ub3RBc2tlZCAjIGJlY2F1c2Ugb2YgZ3JpZCBzY29yZVxuICAgICAgICAgIHF2Lm5vdEFza2VkUmVzdWx0XG4gICAgICAgIGVsc2UgaWYgbm90IF8uaXNFbXB0eShxdi5hbnN3ZXIpICMgdXNlIGFuc3dlclxuICAgICAgICAgIHF2LmFuc3dlclxuICAgICAgICBlbHNlIGlmIHF2LnNraXBwZWRcbiAgICAgICAgICBxdi5za2lwcGVkUmVzdWx0XG4gICAgICAgIGVsc2UgaWYgcXYuaXNTa2lwcGVkXG4gICAgICAgICAgcXYubG9naWNTa2lwcGVkUmVzdWx0XG4gICAgICAgIGVsc2UgaWYgcXYuaXNBdXRvc3RvcHBlZFxuICAgICAgICAgIHF2Lm5vdEFza2VkQXV0b3N0b3BSZXN1bHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHF2LmFuc3dlclxuICAgICwgQFxuICAgIGhhc2ggPSBAbW9kZWwuZ2V0KFwiaGFzaFwiKSBpZiBAbW9kZWwuaGFzKFwiaGFzaFwiKVxuICAgIHN1YnRlc3RSZXN1bHQgPVxuICAgICAgJ2JvZHknIDogcmVzdWx0XG4gICAgICAnbWV0YScgOlxuICAgICAgICAnaGFzaCcgOiBoYXNoXG4jICAgIHJldHVybiByZXN1bHRcblxuICBzaG93RXJyb3JzOiAodmlld3MgPSBAcXVlc3Rpb25WaWV3cykgLT5cbiAgICBAJGVsLmZpbmQoJy5tZXNzYWdlJykucmVtb3ZlKClcbiAgICBmaXJzdCA9IHRydWVcbiAgICB2aWV3cyA9IFt2aWV3c10gaWYgbm90IF8uaXNBcnJheSh2aWV3cylcbiAgICB2aWV3cy5mb3JFYWNoIChxdiwgaSkgLT5cbiAgICAgIGlmIG5vdCBfLmlzU3RyaW5nKHF2KVxuICAgICAgICBtZXNzYWdlID0gXCJcIlxuICAgICAgICBpZiBub3QgcXYuaXNWYWxpZFxuICAgICAgICAgICMgaGFuZGxlIGN1c3RvbSB2YWxpZGF0aW9uIGVycm9yIG1lc3NhZ2VzXG4gICAgICAgICAgY3VzdG9tTWVzc2FnZSA9IHF2Lm1vZGVsLmdldChcImN1c3RvbVZhbGlkYXRpb25NZXNzYWdlXCIpXG4gICAgICAgICAgaWYgbm90IF8uaXNFbXB0eShjdXN0b21NZXNzYWdlKVxuICAgICAgICAgICAgbWVzc2FnZSA9IGN1c3RvbU1lc3NhZ2VcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBtZXNzYWdlID0gQHRleHQucGxlYXNlQW5zd2VyXG5cbiAgICAgICAgICBpZiBmaXJzdCA9PSB0cnVlXG4gICAgICAgICAgICBAc2hvd1F1ZXN0aW9uKGkpIGlmIHZpZXdzID09IEBxdWVzdGlvblZpZXdzXG4gICAgICAgICAgICBxdi4kZWwuc2Nyb2xsVG8oKVxuICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgQHRleHQuY29ycmVjdEVycm9yc1xuICAgICAgICAgICAgZmlyc3QgPSBmYWxzZVxuICAgICAgICBxdi5zZXRNZXNzYWdlIG1lc3NhZ2VcbiAgICAsIEBcblxuXG4gIGdldFN1bTogLT5cbiAgICByZXR1cm4ge2NvcnJlY3Q6MCxpbmNvcnJlY3Q6MCxtaXNzaW5nOjAsdG90YWw6MH1cblxuICBjaGlsZEV2ZW50czpcbiAgICAnYW5zd2VyIHNjcm9sbCc6ICdvblF1ZXN0aW9uQW5zd2VyJ1xuICAgICdhbnN3ZXInOiAnb25RdWVzdGlvbkFuc3dlcidcbiAgICAncmVuZGVyZWQnOiAnb25RdWVzdGlvblJlbmRlcmVkJ1xuICAgICdhZGQ6Y2hpbGQnOiAnZm9vJ1xuICAgICdjb2xsZWN0aW9uOnJlbmRlcmVkJzogJ2ZvbydcbiAgICAncmVuZGVyOmNvbGxlY3Rpb24nOiAnZm9vJ1xuXG5cbiAgIyBUaGlzIHRlc3RzIGlmIGFkZDpjaGlsZCBpcyB0cmlnZ2VyZWQgb24gdGhlIHN1YnRlc3QgaW5zdGVhZCBvZiBvbiBBc3Nlc3NtZW50Q29tcG9zaXRlVmlldy5cbiAgZm9vOiAtPlxuICAgIGNvbnNvbGUubG9nKFwidGVzdCAxMjMgU1YgY2hpbGQgZm9vXCIpXG5cbiAgIyBwb3B1bGF0ZXMgQHF1ZXN0aW9uVmlld3MgZm9yIHRoaXMgdmlldy5cbiAgYnVpbGRDaGlsZFZpZXc6IChjaGlsZCwgQ2hpbGRWaWV3Q2xhc3MsIGNoaWxkVmlld09wdGlvbnMpIC0+XG4gICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHttb2RlbDogY2hpbGR9LCBjaGlsZFZpZXdPcHRpb25zKTtcbiAgICBjaGlsZFZpZXcgPSBuZXcgQ2hpbGRWaWV3Q2xhc3Mob3B0aW9ucylcbiAgICByZXF1aXJlZCA9IGNoaWxkLmdldE51bWJlciBcImxpbmtlZEdyaWRTY29yZVwiXG4gICAgaXNOb3RBc2tlZCA9ICggKCByZXF1aXJlZCAhPSAwICYmIEBwYXJlbnQuZ2V0R3JpZFNjb3JlKCkgPCByZXF1aXJlZCApIHx8IEBwYXJlbnQuZ3JpZFdhc0F1dG9zdG9wcGVkKCkgKSAmJiBAcGFyZW50LmdldEdyaWRTY29yZSgpICE9IGZhbHNlXG4gICAgY2hpbGQuc2V0ICBcIm5vdEFza2VkXCIsIGlzTm90QXNrZWRcbiAgICBpZiBpc05vdEFza2VkIHRoZW4gQG5vdEFza2VkQ291bnQrK1xuICAgIE1hcmlvbmV0dGUuTW9uaXRvckRPTVJlZnJlc2goY2hpbGRWaWV3KTtcbiAgICBAcXVlc3Rpb25WaWV3c1tjaGlsZFZpZXdPcHRpb25zLmluZGV4XSA9IGNoaWxkVmlld1xuXG4gICAgcmV0dXJuIGNoaWxkVmlld1xuICAsXG5cbiMgIFBhc3NlcyBvcHRpb25zIHRvIGVhY2ggY2hpbGRWaWV3IGluc3RhbmNlXG4gIGNoaWxkVmlld09wdGlvbnM6IChtb2RlbCwgaW5kZXgpLT5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgcHJldmlvdXMgPSBAbW9kZWwucGFyZW50LnJlc3VsdC5nZXRCeUhhc2goQG1vZGVsLmdldCgnaGFzaCcpKVxuXG4gICAgbmFtZSAgID0gbW9kZWwuZXNjYXBlKFwibmFtZVwiKS5yZXBsYWNlIC9bXkEtWmEtejAtOV9dL2csIFwiLVwiXG4gICAgYW5zd2VyID0gcHJldmlvdXNbbmFtZV0gaWYgcHJldmlvdXNcbiAgICBsYWJlbHMgPSB7fVxuICAgIGxhYmVscy50ZXh0ID0gQHRleHRcbiAgICBtb2RlbC5zZXQoJ2xhYmVscycsIGxhYmVscylcbiAgICBvcHRpb25zID1cbiAgICAgIG1vZGVsICAgICAgICAgOiBtb2RlbFxuICAgICAgcGFyZW50ICAgICAgICA6IEBcbiAgICAgIGRhdGFFbnRyeSAgICAgOiBAZGF0YUVudHJ5XG4gICAgICBub3RBc2tlZCAgICAgIDogbW9kZWwuZ2V0IFwibm90QXNrZWRcIlxuICAgICAgaXNPYnNlcnZhdGlvbiA6IEBpc09ic2VydmF0aW9uXG4gICAgICBhbnN3ZXIgICAgICAgIDogYW5zd2VyXG4gICAgICBpbmRleCAgOiBpbmRleFxuICAgIHJldHVybiBvcHRpb25zXG5cbiAgb25CZWZvcmVSZW5kZXI6IC0+XG4jICAgIEBxdWVzdGlvbnMuc29ydCgpXG5cbiAgb25SZW5kZXI6IC0+XG5cbiAgICBub3RBc2tlZENvdW50ID0gMFxuICAgIGlmIEBtb2RlbC5xdWVzdGlvbnM/XG4gICAgICBAbW9kZWwucXVlc3Rpb25zLm1vZGVscy5mb3JFYWNoIChxdWVzdGlvbiwgaSkgPT5cbiMgc2tpcCB0aGUgcmVzdCBpZiBzY29yZSBub3QgaGlnaCBlbm91Z2hcbiAgICAgICAgcmVxdWlyZWQgPSBxdWVzdGlvbi5nZXROdW1iZXIgXCJsaW5rZWRHcmlkU2NvcmVcIlxuICAgICAgICBpc05vdEFza2VkID0gKCAoIHJlcXVpcmVkICE9IDAgJiYgQHBhcmVudC5nZXRHcmlkU2NvcmUoKSA8IHJlcXVpcmVkICkgfHwgQHBhcmVudC5ncmlkV2FzQXV0b3N0b3BwZWQoKSApICYmIEBwYXJlbnQuZ2V0R3JpZFNjb3JlKCkgIT0gZmFsc2VcbiAgICAgICAgcXVlc3Rpb24uc2V0ICBcIm5vdEFza2VkXCIsIGlzTm90QXNrZWRcbiAgICAgICAgaWYgaXNOb3RBc2tlZCB0aGVuIEBub3RBc2tlZENvdW50KytcbiAgICBAdHJpZ2dlciBcInJlYWR5XCJcblxuIyAgICBpZiBAZm9jdXNNb2RlXG4jICAgICAgJCgnI3N1YnRlc3Rfd3JhcHBlcicpLmFmdGVyICQgXCJcbiMgICAgICAgICAgICA8ZGl2IGlkPSdzdW1tYXJ5X2NvbnRhaW5lcic+PC9kaXY+XG4jICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBwcmV2X3F1ZXN0aW9uJz4je0B0ZXh0LnByZXZpb3VzUXVlc3Rpb259PC9idXR0b24+XG4jICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBuZXh0X3F1ZXN0aW9uJz4je0B0ZXh0Lm5leHRRdWVzdGlvbn08L2J1dHRvbj5cbiMgICAgICAgICAgXCJcblxuICBvblJlbmRlckNvbGxlY3Rpb246LT5cbiMgICAgaWYgQGZvY3VzTW9kZVxuIyAgICAgICQoJyNzdWJ0ZXN0X3dyYXBwZXInKS5hZnRlciAkIFwiXG4jICAgICAgICAgICAgPGRpdiBpZD0nc3VtbWFyeV9jb250YWluZXInPjwvZGl2PlxuIyAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gcHJldl9xdWVzdGlvbic+I3tAdGV4dC5wcmV2aW91c1F1ZXN0aW9ufTwvYnV0dG9uPlxuIyAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gbmV4dF9xdWVzdGlvbic+I3tAdGV4dC5uZXh0UXVlc3Rpb259PC9idXR0b24+XG4jICAgICAgICAgIFwiXG4gICAgQHVwZGF0ZUV4ZWN1dGVSZWFkeSh0cnVlKVxuICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuXG4gICAgaWYgQHF1ZXN0aW9ucy5sZW5ndGggPT0gQG5vdEFza2VkQ291bnRcbiAgICAgIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpICE9IFwiY2xhc3NcIlxuICAgICAgICBAcGFyZW50Lm5leHQ/KClcbiAgICAgIGVsc2VcbiMgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCAkIFwiPHAgY2xhc3M9J2dyZXknPiN7QHRleHQubm90RW5vdWdofTwvcD5cIlxuICAgICAgICBhbGVydCBAdGV4dC5ub3RFbm91Z2hcblxuIyAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuIyAgb25TaG93OiAtPlxuIyAgICBjb25zb2xlLmxvZyhcIm9uU2hvd1wiKVxuIyAgICBpZiBAZm9jdXNNb2RlXG4jICAgICAgJCgnI3N1YnRlc3Rfd3JhcHBlcicpLmFmdGVyICQgXCJcbiMgICAgICAgICAgICA8ZGl2IGlkPSdzdW1tYXJ5X2NvbnRhaW5lcic+PC9kaXY+XG4jICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBwcmV2X3F1ZXN0aW9uJz4je0B0ZXh0LnByZXZpb3VzUXVlc3Rpb259PC9idXR0b24+XG4jICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBuZXh0X3F1ZXN0aW9uJz4je0B0ZXh0Lm5leHRRdWVzdGlvbn08L2J1dHRvbj5cbiMgICAgICAgICAgXCJcbiMgICAgQHVwZGF0ZUV4ZWN1dGVSZWFkeSh0cnVlKVxuIyAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiMgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG4jXG4jICAgIGlmIEBxdWVzdGlvbnMubGVuZ3RoID09IEBub3RBc2tlZENvdW50XG4jICAgICAgaWYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgIT0gXCJjbGFzc1wiXG4jICAgICAgICBAcGFyZW50Lm5leHQ/KClcbiMgICAgICBlbHNlXG4jIyAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkICQgXCI8cCBjbGFzcz0nZ3JleSc+I3tAdGV4dC5ub3RFbm91Z2h9PC9wPlwiXG4jICAgICAgICBhbGVydCBAdGV4dC5ub3RFbm91Z2hcbiNcbiMgICAgIyAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiMgICAgQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG5cbiAgIyBEb3VidCB0aGlzIGlzIGhhcHBlbmluZyBhZnRlciB0aGUgcXVlc3Rpb24gd2FzIHJlbmRlcmVkLiBUT0RPOiBmaW5kIHRoZSByaWdodCBwbGFjZS5cbiAgb25RdWVzdGlvblJlbmRlcmVkOi0+XG4jICAgIGNvbnNvbGUubG9nKFwib25RdWVzdGlvblJlbmRlcmVkIEByZW5kZXJDb3VudDogXCIgKyBAcmVuZGVyQ291bnQpXG4gICAgQHJlbmRlckNvdW50KytcbiMgICAgY29uc29sZS5sb2coXCJvblF1ZXN0aW9uUmVuZGVyZWQgQHJlbmRlckNvdW50IGluY3JlbWVudGVkOiBcIiArIEByZW5kZXJDb3VudClcbiAgICBpZiBAcmVuZGVyQ291bnQgPT0gQHF1ZXN0aW9ucy5sZW5ndGhcbiAgICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuICAgICAgQHVwZGF0ZVNraXBMb2dpYygpXG4jICAgICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4jICAgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG4jICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4jICBvblNob3c6LT5cbiMgICAgY29uc29sZS5sb2coXCJpU2hvd24hXCIpXG4jICAgIEBvblJlbmRlckNvbGxlY3Rpb24oKVxuXG4gIG9uQ2xvc2U6LT5cbiAgICBmb3IgcXYgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgIHF2LmNsb3NlPygpXG4gICAgQHF1ZXN0aW9uVmlld3MgPSBbXVxuXG4gIHJlc2V0OiAoaW5jcmVtZW50KSAtPlxuICAgIGNvbnNvbGUubG9nKFwicmVzZXRcIilcbiAgICBAcmVuZGVyZWQuc3VidGVzdCA9IGZhbHNlXG4gICAgQHJlbmRlcmVkLmFzc2Vzc21lbnQgPSBmYWxzZVxuICAgICMgICAgY3VycmVudFZpZXcgPSBAc3VidGVzdFZpZXdzW0BvcmRlck1hcFtAaW5kZXhdXVxuICAgICMgICAgY3VycmVudFZpZXcuY2xvc2UoKVxuICAgIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlldy5jbG9zZSgpO1xuICAgIEBpbmRleCA9XG4gICAgICBpZiBAYWJvcnRBc3Nlc3NtZW50ID09IHRydWVcbiAgICAgICAgQHN1YnRlc3RWaWV3cy5sZW5ndGgtMVxuICAgICAgZWxzZVxuICAgICAgICBAaW5kZXggKyBpbmNyZW1lbnRcbiAgICBAcmVuZGVyKClcbiAgICB3aW5kb3cuc2Nyb2xsVG8gMCwgMFxuIl19

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1bkl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzhCQUVKLFFBQUEsR0FBVSxHQUFJLENBQUEsUUFBQTs7OEJBQ2QsU0FBQSxHQUFXOzs4QkFDWCxPQUFBLEdBQVM7OzhCQUNULFNBQUEsR0FBVzs7OEJBRVgsTUFBQSxHQUNFO0lBQUEsc0JBQUEsRUFBeUIsY0FBekI7SUFDQSxzQkFBQSxFQUF5QixjQUR6Qjs7OzhCQUdGLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFFVixRQUFBO0lBQUEsSUFBQyxDQUFBLEtBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxNQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFDeEIsSUFBQyxDQUFBLFNBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxhQUFELEdBQWlCLE9BQU8sQ0FBQztJQUN6QixJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBa0IsV0FBbEI7SUFDakIsSUFBc0IsSUFBQyxDQUFBLFNBQXZCO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsRUFBakI7O0lBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFdBQUQsR0FBaUI7SUFJakIsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUtBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUNyQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQTtJQVVkLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBbkIsR0FBb0M7SUFDcEMsTUFBQSxHQUFTO0lBQ1QsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUE7SUFDZixJQUFDLENBQUEsS0FBSyxDQUFD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RyxJQUFDLENBQUEsV0FBRCxLQUFnQixJQUFDLENBQUEsU0FBUyxDQUFDLE1BQTlCO01BQ0UsSUFBQyxDQUFBLE9BQUQsQ0FBUyxPQUFUO01BQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBQSxFQUZGOztXQUdBLElBQUMsQ0FBQSxPQUFELENBQVMsYUFBVDtFQVBrQjs7OEJBU3BCLE9BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtBQUFBO0FBQUEsU0FBQSxxQ0FBQTs7O1FBQ0UsRUFBRSxDQUFDOztBQURMO1dBRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUI7RUFIWDs7OEJBS1IsS0FBQSxHQUFPLFNBQUMsU0FBRDtJQUVMLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixHQUFvQjtJQUNwQixJQUFDLENBQUEsUUFBUSxDQUFDLFVBQVYsR0FBdUI7SUFHdkIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBbEMsQ0FBQTtJQUNBLElBQUMsQ0FBQSxLQUFELEdBQ0ssSUFBQyxDQUFBLGVBQUQsS0FBb0IsSUFBdkIsR0FDRSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsR0FBcUIsQ0FEdkIsR0FHRSxJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ2IsSUFBQyxDQUFBLE1BQUQsQ0FBQTtXQUNBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQWhCLEVBQW1CLENBQW5CO0VBYks7Ozs7R0E3WnVCLFFBQVEsQ0FBQyxVQUFVLENBQUMiLCJmaWxlIjoibW9kdWxlcy9zdWJ0ZXN0L3Byb3RvdHlwZXMvU3VydmV5UnVuSXRlbVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdXJ2ZXlSdW5JdGVtVmlldyBleHRlbmRzIEJhY2tib25lLk1hcmlvbmV0dGUuQ29tcG9zaXRlVmlld1xuXG4gIHRlbXBsYXRlOiBKU1RbXCJTdXJ2ZXlcIl0sXG4gIGNoaWxkVmlldzogUXVlc3Rpb25SdW5JdGVtVmlldyxcbiAgdGFnTmFtZTogXCJwXCIsXG4gIGNsYXNzTmFtZTogXCJTdXJ2ZXlSdW5JdGVtVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAubmV4dF9xdWVzdGlvbicgOiAnbmV4dFF1ZXN0aW9uJ1xuICAgICdjbGljayAucHJldl9xdWVzdGlvbicgOiAncHJldlF1ZXN0aW9uJ1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQG1vZGVsICAgICAgICAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCAgICAgICAgPSBAbW9kZWwucGFyZW50XG4gICAgQGRhdGFFbnRyeSAgICAgPSBvcHRpb25zLmRhdGFFbnRyeVxuICAgIEBpc09ic2VydmF0aW9uID0gb3B0aW9ucy5pc09ic2VydmF0aW9uXG4gICAgQGZvY3VzTW9kZSAgICAgPSBAbW9kZWwuZ2V0Qm9vbGVhbihcImZvY3VzTW9kZVwiKVxuICAgIEBxdWVzdGlvbkluZGV4ID0gMCBpZiBAZm9jdXNNb2RlXG4gICAgQHF1ZXN0aW9uVmlld3MgPSBbXVxuICAgIEBhbnN3ZXJlZCAgICAgID0gW11cbiAgICBAcmVuZGVyQ291bnQgICA9IDBcbiMgICAgQGNoaWxkVmlld09wdGlvbnMgPVxuIyAgICAgICAgcGFyZW50OiB0aGlzXG5cbiAgICBAaTE4bigpXG4jICAgIHRoaXMubGlzdGVuVG8oQG1vZGVsLmNvbGxlY3Rpb24sJ2NoYW5nZScsIHRoaXMudmlld1JlbmRlcilcbiMgICAgICB0aGlzLmxpc3RlblRvKG1vZGVsLmNvbGxlY3Rpb24sICdyZXNldCcsIHRoaXMucmVuZGVyKTtcbiMgICAgaWYgQG1vZGVsLnF1ZXN0aW9ucy5sZW5ndGggPT0gMFxuIyAgICAgIGNvbnNvbGUubG9nKFwiTm8gcXVlc3Rpb25zLlwiKVxuICAgIEBjb2xsZWN0aW9uID0gQG1vZGVsLnF1ZXN0aW9uc1xuICAgIEBxdWVzdGlvbnMgPSBAY29sbGVjdGlvblxuIyAgICBAbW9kZWwucXVlc3Rpb25zLmZldGNoXG4jICAgICAgdmlld09wdGlvbnM6XG4jICAgICAgICBrZXk6IFwicXVlc3Rpb24tI3tAbW9kZWwuaWR9XCJcbiMgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgPT5cbiMjICAgICAgICBAbW9kZWwucXVlc3Rpb25zLnNvcnQoKVxuIyAgICAgICAgY29sbGVjdGlvbi5zb3J0KClcbiMgICAgICAgIEBtb2RlbC5jb2xsZWN0aW9uLm1vZGVscyA9IGNvbGxlY3Rpb24ubW9kZWxzXG4jICAgICAgICBAcmVuZGVyKClcblxuICAgIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3VidmlldyA9IEBcbiAgICBsYWJlbHMgPSB7fVxuICAgIGxhYmVscy50ZXh0ID0gQHRleHRcbiAgICBAbW9kZWwuc2V0KCdsYWJlbHMnLCBsYWJlbHMpXG5cbiAgICBAc2tpcHBhYmxlID0gQG1vZGVsLmdldChcInNraXBwYWJsZVwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gXCJ0cnVlXCJcbiAgICBAYmFja2FibGUgPSAoIEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IHRydWUgfHwgQG1vZGVsLmdldChcImJhY2tCdXR0b25cIikgPT0gXCJ0cnVlXCIgKSBhbmQgQHBhcmVudC5pbmRleCBpc250IDBcbiAgICBAcGFyZW50LmRpc3BsYXlTa2lwKEBza2lwcGFibGUpXG4gICAgQHBhcmVudC5kaXNwbGF5QmFjayhAYmFja2FibGUpXG5cbiMgIGZpbHRlcjogKGNoaWxkLCBpbmRleCwgY29sbGVjdGlvbikgLT5cbiMgICAgcmV0dXJuIGNoaWxkLmdldCgndmFsdWUnKSAlIDIgPT0gMFxuXG4jICBtb2RlbEFkZGVkOi0+XG4jICAgIGNvbnNvbGUubG9nKFwibW9kZWwgYWRkZWRcIilcblxuICBuZXh0UXVlc3Rpb246IC0+XG4jICAgIGNvbnNvbGUubG9nKFwibmV4dFF1ZXN0aW9uXCIpXG5cbiAgICBjdXJyZW50UXVlc3Rpb25WaWV3ID0gQHF1ZXN0aW9uVmlld3NbQHF1ZXN0aW9uSW5kZXhdXG5cbiAgICAjIHNob3cgZXJyb3JzIGJlZm9yZSBkb2luZyBhbnl0aGluZyBpZiB0aGVyZSBhcmUgYW55XG4gICAgcmV0dXJuIEBzaG93RXJyb3JzKGN1cnJlbnRRdWVzdGlvblZpZXcpIHVubGVzcyBAaXNWYWxpZChjdXJyZW50UXVlc3Rpb25WaWV3KVxuXG4gICAgIyBmaW5kIHRoZSBub24tc2tpcHBlZCBxdWVzdGlvbnNcbiAgICBpc0F2YWlsYWJsZSA9IFtdXG4gICAgZm9yIHF2LCBpIGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBpc0F2YWlsYWJsZS5wdXNoIGkgaWYgbm90IChxdi5pc0F1dG9zdG9wcGVkIG9yIHF2LmlzU2tpcHBlZClcbiAgICBpc0F2YWlsYWJsZSAgPSBfLmZpbHRlciBpc0F2YWlsYWJsZSwgKGUpID0+IGUgPiBAcXVlc3Rpb25JbmRleFxuXG4gICAgIyBkb24ndCBnbyBhbnl3aGVyZSB1bmxlc3Mgd2UgaGF2ZSBzb21ld2hlcmUgdG8gZ29cbiAgICBpZiBpc0F2YWlsYWJsZS5sZW5ndGggPT0gMFxuICAgICAgcGxhbm5lZEluZGV4ID0gQHF1ZXN0aW9uSW5kZXhcbiAgICBlbHNlXG4gICAgICBwbGFubmVkSW5kZXggPSBNYXRoLm1pbi5hcHBseShwbGFubmVkSW5kZXgsIGlzQXZhaWxhYmxlKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggIT0gcGxhbm5lZEluZGV4XG4gICAgICBAcXVlc3Rpb25JbmRleCA9IHBsYW5uZWRJbmRleFxuICAgICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4gICAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICBwcmV2UXVlc3Rpb246IC0+XG5cbiAgICBjdXJyZW50UXVlc3Rpb25WaWV3ID0gQHF1ZXN0aW9uVmlld3NbQHF1ZXN0aW9uSW5kZXhdXG5cbiAgICAjIHNob3cgZXJyb3JzIGJlZm9yZSBkb2luZyBhbnl0aGluZyBpZiB0aGVyZSBhcmUgYW55XG4gICAgcmV0dXJuIEBzaG93RXJyb3JzKGN1cnJlbnRRdWVzdGlvblZpZXcpIHVubGVzcyBAaXNWYWxpZChjdXJyZW50UXVlc3Rpb25WaWV3KVxuXG4gICAgIyBmaW5kIHRoZSBub24tc2tpcHBlZCBxdWVzdGlvbnNcbiAgICBpc0F2YWlsYWJsZSA9IFtdXG4gICAgZm9yIHF2LCBpIGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBpc0F2YWlsYWJsZS5wdXNoIGkgaWYgbm90IChxdi5pc0F1dG9zdG9wcGVkIG9yIHF2LmlzU2tpcHBlZClcbiAgICBpc0F2YWlsYWJsZSAgPSBfLmZpbHRlciBpc0F2YWlsYWJsZSwgKGUpID0+IGUgPCBAcXVlc3Rpb25JbmRleFxuXG4gICAgIyBkb24ndCBnbyBhbnl3aGVyZSB1bmxlc3Mgd2UgaGF2ZSBzb21ld2hlcmUgdG8gZ29cbiAgICBpZiBpc0F2YWlsYWJsZS5sZW5ndGggPT0gMFxuICAgICAgcGxhbm5lZEluZGV4ID0gQHF1ZXN0aW9uSW5kZXhcbiAgICBlbHNlXG4gICAgICBwbGFubmVkSW5kZXggPSBNYXRoLm1heC5hcHBseShwbGFubmVkSW5kZXgsIGlzQXZhaWxhYmxlKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggIT0gcGxhbm5lZEluZGV4XG4gICAgICBAcXVlc3Rpb25JbmRleCA9IHBsYW5uZWRJbmRleFxuICAgICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4gICAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICB1cGRhdGVQcm9ncmVzc0J1dHRvbnM6IC0+XG5cbiAgICBpc0F2YWlsYWJsZSA9IFtdXG4gICAgZm9yIHF2LCBpIGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBpc0F2YWlsYWJsZS5wdXNoIGkgaWYgbm90IChxdi5pc0F1dG9zdG9wcGVkIG9yIHF2LmlzU2tpcHBlZClcbiAgICBpc0F2YWlsYWJsZS5wdXNoIEBxdWVzdGlvbkluZGV4XG5cbiAgICAkcHJldiA9IEAkZWwuZmluZChcIi5wcmV2X3F1ZXN0aW9uXCIpXG4gICAgJG5leHQgPSBAJGVsLmZpbmQoXCIubmV4dF9xdWVzdGlvblwiKVxuXG4gICAgbWluaW11bSA9IE1hdGgubWluLmFwcGx5KCBtaW5pbXVtLCBpc0F2YWlsYWJsZSApXG4gICAgbWF4aW11bSA9IE1hdGgubWF4LmFwcGx5KCBtYXhpbXVtLCBpc0F2YWlsYWJsZSApXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCA9PSBtaW5pbXVtXG4gICAgICAkcHJldi5oaWRlKClcbiAgICBlbHNlXG4gICAgICAkcHJldi5zaG93KClcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IG1heGltdW1cbiAgICAgICRuZXh0LmhpZGUoKVxuICAgIGVsc2VcbiAgICAgICRuZXh0LnNob3coKVxuXG4gIHVwZGF0ZUV4ZWN1dGVSZWFkeTogKHJlYWR5KSAtPlxuXG4jICAgIGNvbnNvbGUubG9nKFwidXBkYXRlRXhlY3V0ZVJlYWR5OiBcIiArIHJlYWR5ICsgXCIgQHRyaWdnZXJTaG93TGlzdD8gXCIgKyBAdHJpZ2dlclNob3dMaXN0PylcbiAgICBAZXhlY3V0ZVJlYWR5ID0gcmVhZHlcblxuICAgIHJldHVybiBpZiBub3QgQHRyaWdnZXJTaG93TGlzdD9cblxuICAgIGlmIEB0cmlnZ2VyU2hvd0xpc3QubGVuZ3RoID4gMFxuICAgICAgZm9yIGluZGV4IGluIEB0cmlnZ2VyU2hvd0xpc3RcbiAgICAgICAgQHF1ZXN0aW9uVmlld3NbaW5kZXhdPy50cmlnZ2VyIFwic2hvd1wiXG4gICAgICBAdHJpZ2dlclNob3dMaXN0ID0gW11cblxuICAgIEB1cGRhdGVTa2lwTG9naWMoKSBpZiBAZXhlY3V0ZVJlYWR5XG5cblxuICB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHk6IC0+XG5cbiAgICByZXR1cm4gdW5sZXNzIEBtb2RlbC5nZXQoXCJmb2N1c01vZGVcIilcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IEBxdWVzdGlvblZpZXdzLmxlbmd0aFxuICAgICAgQCRlbC5maW5kKFwiI3N1bW1hcnlfY29udGFpbmVyXCIpLmh0bWwgXCJcbiAgICAgICAgbGFzdCBwYWdlIGhlcmVcbiAgICAgIFwiXG4gICAgICBAJGVsLmZpbmQoXCIjbmV4dF9xdWVzdGlvblwiKS5oaWRlKClcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIjc3VtbWFyeV9jb250YWluZXJcIikuZW1wdHkoKVxuICAgICAgQCRlbC5maW5kKFwiI25leHRfcXVlc3Rpb25cIikuc2hvdygpXG5cbiAgICAkcXVlc3Rpb25zID0gQCRlbC5maW5kKFwiLnF1ZXN0aW9uXCIpXG4gICAgJHF1ZXN0aW9ucy5oaWRlKClcbiAgICAkcXVlc3Rpb25zLmVxKEBxdWVzdGlvbkluZGV4KS5zaG93KClcblxuICAgICMgdHJpZ2dlciB0aGUgcXVlc3Rpb24gdG8gcnVuIGl0J3MgZGlzcGxheSBjb2RlIGlmIHRoZSBzdWJ0ZXN0J3MgZGlzcGxheWNvZGUgaGFzIGFscmVhZHkgcmFuXG4gICAgIyBpZiBub3QsIGFkZCBpdCB0byBhIGxpc3QgdG8gcnVuIGxhdGVyLlxuICAgIGlmIEBleGVjdXRlUmVhZHlcbiAgICAgIEBxdWVzdGlvblZpZXdzW0BxdWVzdGlvbkluZGV4XS50cmlnZ2VyIFwic2hvd1wiXG4gICAgZWxzZVxuICAgICAgQHRyaWdnZXJTaG93TGlzdCA9IFtdIGlmIG5vdCBAdHJpZ2dlclNob3dMaXN0XG4gICAgICBAdHJpZ2dlclNob3dMaXN0LnB1c2ggQHF1ZXN0aW9uSW5kZXhcblxuICBzaG93UXVlc3Rpb246IChpbmRleCkgLT5cbiAgICBAcXVlc3Rpb25JbmRleCA9IGluZGV4IGlmIF8uaXNOdW1iZXIoaW5kZXgpICYmIGluZGV4IDwgQHF1ZXN0aW9uVmlld3MubGVuZ3RoICYmIGluZGV4ID4gMFxuICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgcGxlYXNlQW5zd2VyIDogdChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5wbGVhc2VfYW5zd2VyXCIpXG4gICAgICBjb3JyZWN0RXJyb3JzIDogdChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5jb3JyZWN0X2Vycm9yc1wiKVxuICAgICAgbm90RW5vdWdoIDogXyh0KFwiU3VydmV5UnVuVmlldy5tZXNzYWdlLm5vdF9lbm91Z2hcIikpLmVzY2FwZSgpXG5cbiAgICAgIHByZXZpb3VzUXVlc3Rpb24gOiB0KFwiU3VydmV5UnVuVmlldy5idXR0b24ucHJldmlvdXNfcXVlc3Rpb25cIilcbiAgICAgIG5leHRRdWVzdGlvbiA6IHQoXCJTdXJ2ZXlSdW5WaWV3LmJ1dHRvbi5uZXh0X3F1ZXN0aW9uXCIpXG4gICAgICBcIm5leHRcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24ubmV4dFwiKVxuICAgICAgXCJiYWNrXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLmJhY2tcIilcbiAgICAgIFwic2tpcFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5za2lwXCIpXG4gICAgICBcImhlbHBcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uaGVscFwiKVxuXG4gICMgd2hlbiBhIHF1ZXN0aW9uIGlzIGFuc3dlcmVkXG4gIG9uUXVlc3Rpb25BbnN3ZXI6IChlbGVtZW50KSAtPlxuIyAgICBjb25zb2xlLmxvZyhcIm9uUXVlc3Rpb25BbnN3ZXIgQHJlbmRlckNvdW50OlwiICsgQHJlbmRlckNvdW50ICsgXCIgIEBxdWVzdGlvbnMubGVuZ3RoOiBcIiArICBAcXVlc3Rpb25zLmxlbmd0aClcbiMgICAgdGhpcyBpcyBub3QgZ29vZC4gU2hvdWxkIHRlc3QgZm9yID09XG4gICAgcmV0dXJuIHVubGVzcyBAcmVuZGVyQ291bnQgPj0gQHF1ZXN0aW9ucy5sZW5ndGhcblxuICAgICMgYXV0byBzdG9wIGFmdGVyIGxpbWl0XG4gICAgQGF1dG9zdG9wcGVkICAgID0gZmFsc2VcbiAgICBhdXRvc3RvcExpbWl0ICAgPSBAbW9kZWwuZ2V0TnVtYmVyIFwiYXV0b3N0b3BMaW1pdFwiXG4gICAgbG9uZ2VzdFNlcXVlbmNlID0gMFxuICAgIGF1dG9zdG9wQ291bnQgICA9IDBcblxuICAgIGlmIGF1dG9zdG9wTGltaXQgPiAwXG4gICAgICBmb3IgaSBpbiBbMS4uQHF1ZXN0aW9uVmlld3MubGVuZ3RoXSAjIGp1c3QgaW4gY2FzZSB0aGV5IGNhbid0IGNvdW50XG4gICAgICAgIGN1cnJlbnRBbnN3ZXIgPSBAcXVlc3Rpb25WaWV3c1tpLTFdLmFuc3dlclxuICAgICAgICBpZiBjdXJyZW50QW5zd2VyID09IFwiMFwiIG9yIGN1cnJlbnRBbnN3ZXIgPT0gXCI5XCJcbiAgICAgICAgICBhdXRvc3RvcENvdW50KytcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGF1dG9zdG9wQ291bnQgPSAwXG4gICAgICAgIGxvbmdlc3RTZXF1ZW5jZSA9IE1hdGgubWF4KGxvbmdlc3RTZXF1ZW5jZSwgYXV0b3N0b3BDb3VudClcbiAgICAgICAgIyBpZiB0aGUgdmFsdWUgaXMgc2V0LCB3ZSd2ZSBnb3QgYSB0aHJlc2hvbGQgZXhjZWVkaW5nIHJ1biwgYW5kIGl0J3Mgbm90IGFscmVhZHkgYXV0b3N0b3BwZWRcbiAgICAgICAgaWYgYXV0b3N0b3BMaW1pdCAhPSAwICYmIGxvbmdlc3RTZXF1ZW5jZSA+PSBhdXRvc3RvcExpbWl0ICYmIG5vdCBAYXV0b3N0b3BwZWRcbiAgICAgICAgICBAYXV0b3N0b3BwZWQgPSB0cnVlXG4gICAgICAgICAgQGF1dG9zdG9wSW5kZXggPSBpXG4gICAgQHVwZGF0ZUF1dG9zdG9wKClcbiAgICBAdXBkYXRlU2tpcExvZ2ljKClcblxuICB1cGRhdGVBdXRvc3RvcDogLT5cbiAgICBhdXRvc3RvcExpbWl0ID0gQG1vZGVsLmdldE51bWJlciBcImF1dG9zdG9wTGltaXRcIlxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHZpZXcsIGkpIC0+XG4gICAgICBpZiBpID4gKEBhdXRvc3RvcEluZGV4IC0gMSlcbiAgICAgICAgaWYgQGF1dG9zdG9wcGVkXG4gICAgICAgICAgdmlldy5pc0F1dG9zdG9wcGVkID0gdHJ1ZVxuICAgICAgICAgIHZpZXcuJGVsLmFkZENsYXNzICAgIFwiZGlzYWJsZWRfYXV0b3N0b3BcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgdmlldy5pc0F1dG9zdG9wcGVkID0gZmFsc2VcbiAgICAgICAgICB2aWV3LiRlbC5yZW1vdmVDbGFzcyBcImRpc2FibGVkX2F1dG9zdG9wXCJcbiAgICAsIEBcblxuICB1cGRhdGVTa2lwTG9naWM6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwidXBkYXRlU2tpcExvZ2ljXCIpXG4jICAgIGNvbnNvbGUubG9nKFwiQHF1ZXN0aW9uVmlld3NcIiArIEBxdWVzdGlvblZpZXdzLmxlbmd0aClcbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoIChxdikgLT5cbiAgICAgIHF1ZXN0aW9uID0gcXYubW9kZWxcbiAgICAgIHNraXBMb2dpY0NvZGUgPSBxdWVzdGlvbi5nZXRTdHJpbmcgXCJza2lwTG9naWNcIlxuICAgICAgdW5sZXNzIHNraXBMb2dpY0NvZGUgaXMgXCJcIlxuICAgICAgICB0cnlcbiAgICAgICAgICByZXN1bHQgPSBDb2ZmZWVTY3JpcHQuZXZhbC5hcHBseShALCBbc2tpcExvZ2ljQ29kZV0pXG4jICAgICAgICAgIGNvbnNvbGUubG9nKFwic2tpcExvZ2ljQ29kZTogXCIgKyBza2lwTG9naWNDb2RlKVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIG5hbWUgPSAoKC9mdW5jdGlvbiAoLnsxLH0pXFwoLykuZXhlYyhlcnJvci5jb25zdHJ1Y3Rvci50b1N0cmluZygpKVsxXSlcbiAgICAgICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgICAgICAgIGFsZXJ0IFwiU2tpcCBsb2dpYyBlcnJvciBpbiBxdWVzdGlvbiAje3F1ZXN0aW9uLmdldCgnbmFtZScpfVxcblxcbiN7bmFtZX1cXG5cXG4je21lc3NhZ2V9XCJcblxuICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICBxdi4kZWwuYWRkQ2xhc3MgXCJkaXNhYmxlZF9za2lwcGVkXCJcbiAgICAgICAgICBxdi5pc1NraXBwZWQgPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBxdi4kZWwucmVtb3ZlQ2xhc3MgXCJkaXNhYmxlZF9za2lwcGVkXCJcbiAgICAgICAgICBxdi5pc1NraXBwZWQgPSBmYWxzZVxuICAgICAgcXYudXBkYXRlVmFsaWRpdHkoKVxuICAgICwgQFxuXG4gIGlzVmFsaWQ6ICh2aWV3cyA9IEBxdWVzdGlvblZpZXdzKSAtPlxuICAgIHJldHVybiB0cnVlIGlmIG5vdCB2aWV3cz8gIyBpZiB0aGVyZSdzIG5vdGhpbmcgdG8gY2hlY2ssIGl0IG11c3QgYmUgZ29vZFxuICAgIHZpZXdzID0gW3ZpZXdzXSBpZiBub3QgXy5pc0FycmF5KHZpZXdzKVxuICAgIGZvciBxdiwgaSBpbiB2aWV3c1xuICAgICAgcXYudXBkYXRlVmFsaWRpdHkoKVxuICAgICAgIyBjYW4gd2Ugc2tpcCBpdD9cbiAgICAgIGlmIG5vdCBxdi5tb2RlbC5nZXRCb29sZWFuKFwic2tpcHBhYmxlXCIpXG4gICAgICAgICMgaXMgaXQgdmFsaWRcbiAgICAgICAgaWYgbm90IHF2LmlzVmFsaWRcbiAgICAgICAgICAjIHJlZCBhbGVydCEhXG4jICAgICAgICAgIGNvbnNvbGUubG9nKFwicG9wIHVwIGFuIGVycm9yXCIpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4jICAgICwgQFxuICAgIHJldHVybiB0cnVlXG5cbiAgdGVzdFZhbGlkOiAtPlxuIyAgICBjb25zb2xlLmxvZyhcIlN1cnZleVJpbkl0ZW0gdGVzdFZhbGlkLlwiKVxuIyAgICBpZiBub3QgQHByb3RvdHlwZVJlbmRlcmVkIHRoZW4gcmV0dXJuIGZhbHNlXG4jICAgIGN1cnJlbnRWaWV3ID0gVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XG4jICAgIGlmIEBpc1ZhbGlkP1xuIyAgICBjb25zb2xlLmxvZyhcInRlc3R2YWxpZDogXCIgKyBAaXNWYWxpZD8pXG4gICAgcmV0dXJuIEBpc1ZhbGlkKClcbiMgICAgZWxzZVxuIyAgICAgIHJldHVybiBmYWxzZVxuIyAgICB0cnVlXG5cblxuICAjIEBUT0RPIHRoaXMgc2hvdWxkIHByb2JhYmx5IGJlIHJldHVybmluZyBtdWx0aXBsZSwgc2luZ2xlIHR5cGUgaGFzaCB2YWx1ZXNcbiAgZ2V0U2tpcHBlZDogLT5cbiAgICByZXN1bHQgPSB7fVxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuICAgICAgcmVzdWx0W0BxdWVzdGlvbnMubW9kZWxzW2ldLmdldChcIm5hbWVcIildID0gXCJza2lwcGVkXCJcbiAgICAsIEBcbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgZ2V0UmVzdWx0OiAtPlxuICAgIHJlc3VsdCA9IHt9XG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAocXYsIGkpIC0+XG4jICAgICAgcmVzdWx0W0BxdWVzdGlvbnMubW9kZWxzW2ldLmdldChcIm5hbWVcIildID1cbiAgICAgIHJlc3VsdFtxdi5uYW1lXSA9XG4gICAgICAgIGlmIHF2Lm5vdEFza2VkICMgYmVjYXVzZSBvZiBncmlkIHNjb3JlXG4gICAgICAgICAgcXYubm90QXNrZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBub3QgXy5pc0VtcHR5KHF2LmFuc3dlcikgIyB1c2UgYW5zd2VyXG4gICAgICAgICAgcXYuYW5zd2VyXG4gICAgICAgIGVsc2UgaWYgcXYuc2tpcHBlZFxuICAgICAgICAgIHF2LnNraXBwZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBxdi5pc1NraXBwZWRcbiAgICAgICAgICBxdi5sb2dpY1NraXBwZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBxdi5pc0F1dG9zdG9wcGVkXG4gICAgICAgICAgcXYubm90QXNrZWRBdXRvc3RvcFJlc3VsdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgcXYuYW5zd2VyXG4gICAgLCBAXG4gICAgaGFzaCA9IEBtb2RlbC5nZXQoXCJoYXNoXCIpIGlmIEBtb2RlbC5oYXMoXCJoYXNoXCIpXG4gICAgc3VidGVzdFJlc3VsdCA9XG4gICAgICAnYm9keScgOiByZXN1bHRcbiAgICAgICdtZXRhJyA6XG4gICAgICAgICdoYXNoJyA6IGhhc2hcbiMgICAgcmV0dXJuIHJlc3VsdFxuXG4gIHNob3dFcnJvcnM6ICh2aWV3cyA9IEBxdWVzdGlvblZpZXdzKSAtPlxuICAgIEAkZWwuZmluZCgnLm1lc3NhZ2UnKS5yZW1vdmUoKVxuICAgIGZpcnN0ID0gdHJ1ZVxuICAgIHZpZXdzID0gW3ZpZXdzXSBpZiBub3QgXy5pc0FycmF5KHZpZXdzKVxuICAgIHZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuICAgICAgaWYgbm90IF8uaXNTdHJpbmcocXYpXG4gICAgICAgIG1lc3NhZ2UgPSBcIlwiXG4gICAgICAgIGlmIG5vdCBxdi5pc1ZhbGlkXG4gICAgICAgICAgIyBoYW5kbGUgY3VzdG9tIHZhbGlkYXRpb24gZXJyb3IgbWVzc2FnZXNcbiAgICAgICAgICBjdXN0b21NZXNzYWdlID0gcXYubW9kZWwuZ2V0KFwiY3VzdG9tVmFsaWRhdGlvbk1lc3NhZ2VcIilcbiAgICAgICAgICBpZiBub3QgXy5pc0VtcHR5KGN1c3RvbU1lc3NhZ2UpXG4gICAgICAgICAgICBtZXNzYWdlID0gY3VzdG9tTWVzc2FnZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBAdGV4dC5wbGVhc2VBbnN3ZXJcblxuICAgICAgICAgIGlmIGZpcnN0ID09IHRydWVcbiAgICAgICAgICAgIEBzaG93UXVlc3Rpb24oaSkgaWYgdmlld3MgPT0gQHF1ZXN0aW9uVmlld3NcbiAgICAgICAgICAgIHF2LiRlbC5zY3JvbGxUbygpXG4gICAgICAgICAgICBVdGlscy5taWRBbGVydCBAdGV4dC5jb3JyZWN0RXJyb3JzXG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlXG4gICAgICAgIHF2LnNldE1lc3NhZ2UgbWVzc2FnZVxuICAgICwgQFxuXG5cbiAgZ2V0U3VtOiAtPlxuIyAgICBpZiBAcHJvdG90eXBlVmlldy5nZXRTdW0/XG4jICAgICAgcmV0dXJuIEBwcm90b3R5cGVWaWV3LmdldFN1bSgpXG4jICAgIGVsc2VcbiMgbWF5YmUgYSBiZXR0ZXIgZmFsbGJhY2tcbiMgICAgY29uc29sZS5sb2coXCJUaGlzIHZpZXcgZG9lcyBub3QgcmV0dXJuIGEgc3VtLCBjb3JyZWN0P1wiKVxuICAgIHJldHVybiB7Y29ycmVjdDowLGluY29ycmVjdDowLG1pc3Npbmc6MCx0b3RhbDowfVxuXG4gIGNoaWxkRXZlbnRzOlxuICAgICdhbnN3ZXIgc2Nyb2xsJzogJ29uUXVlc3Rpb25BbnN3ZXInXG4gICAgJ2Fuc3dlcic6ICdvblF1ZXN0aW9uQW5zd2VyJ1xuICAgICdyZW5kZXJlZCc6ICdvblF1ZXN0aW9uUmVuZGVyZWQnXG5cbiAgYnVpbGRDaGlsZFZpZXc6IChjaGlsZCwgQ2hpbGRWaWV3Q2xhc3MsIGNoaWxkVmlld09wdGlvbnMpIC0+XG4gICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHttb2RlbDogY2hpbGR9LCBjaGlsZFZpZXdPcHRpb25zKTtcbiAgICB2aWV3ID0gbmV3IENoaWxkVmlld0NsYXNzKG9wdGlvbnMpXG5cbiMgICAgQGxpc3RlblRvIHZpZXcsIFwicmVuZGVyZWRcIiwgICAgICBAb25RdWVzdGlvblJlbmRlcmVkXG4jICAgIEBsaXN0ZW5UbyBjaGlsZCwgXCJhbnN3ZXIgc2Nyb2xsXCIsIEBvblF1ZXN0aW9uQW5zd2VyXG5cbiAgICBAcXVlc3Rpb25WaWV3c1tjaGlsZFZpZXdPcHRpb25zLmluZGV4XSA9IHZpZXdcblxuICAgIHJldHVybiB2aWV3XG4gICxcblxuIyAgUGFzc2VzIG9wdGlvbnMgdG8gZWFjaCBjaGlsZFZpZXcgaW5zdGFuY2VcbiAgY2hpbGRWaWV3T3B0aW9uczogKG1vZGVsLCBpbmRleCktPlxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG4gICAgICBwcmV2aW91cyA9IEBtb2RlbC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG4gICAgbm90QXNrZWRDb3VudCA9IDBcbiAgICByZXF1aXJlZCA9IG1vZGVsLmdldE51bWJlciBcImxpbmtlZEdyaWRTY29yZVwiXG5cbiAgICBpc05vdEFza2VkID0gKCAoIHJlcXVpcmVkICE9IDAgJiYgQG1vZGVsLnBhcmVudC5nZXRHcmlkU2NvcmUoKSA8IHJlcXVpcmVkICkgfHwgQG1vZGVsLnBhcmVudC5ncmlkV2FzQXV0b3N0b3BwZWQoKSApICYmIEBtb2RlbC5wYXJlbnQuZ2V0R3JpZFNjb3JlKCkgIT0gZmFsc2VcblxuICAgIGlmIGlzTm90QXNrZWQgdGhlbiBub3RBc2tlZENvdW50KytcblxuICAgIG5hbWUgICA9IG1vZGVsLmVzY2FwZShcIm5hbWVcIikucmVwbGFjZSAvW15BLVphLXowLTlfXS9nLCBcIi1cIlxuICAgIGFuc3dlciA9IHByZXZpb3VzW25hbWVdIGlmIHByZXZpb3VzXG4gICAgbGFiZWxzID0ge31cbiAgICBsYWJlbHMudGV4dCA9IEB0ZXh0XG4gICAgbW9kZWwuc2V0KCdsYWJlbHMnLCBsYWJlbHMpXG4gICAgb3B0aW9ucyA9XG4gICAgICBtb2RlbCAgICAgICAgIDogbW9kZWxcbiAgICAgIHBhcmVudCAgICAgICAgOiBAXG4gICAgICBkYXRhRW50cnkgICAgIDogQGRhdGFFbnRyeVxuICAgICAgbm90QXNrZWQgICAgICA6IGlzTm90QXNrZWRcbiAgICAgIGlzT2JzZXJ2YXRpb24gOiBAaXNPYnNlcnZhdGlvblxuICAgICAgYW5zd2VyICAgICAgICA6IGFuc3dlclxuICAgICAgaW5kZXggIDogaW5kZXhcbiAgICByZXR1cm4gb3B0aW9uc1xuXG4gIG9uQmVmb3JlUmVuZGVyOiAtPlxuIyAgICBAcXVlc3Rpb25zLnNvcnQoKVxuXG4gIG9uUmVuZGVyOiAtPlxuIyAgICBAdXBkYXRlU2tpcExvZ2ljKClcbiAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcbiMgICAgQGxpc3RlblRvIG9uZVZpZXcsIFwiYW5zd2VyIHNjcm9sbFwiLCBAb25RdWVzdGlvbkFuc3dlclxuXG4gIG9uUmVuZGVyQ29sbGVjdGlvbjotPlxuICAgIEB1cGRhdGVFeGVjdXRlUmVhZHkodHJ1ZSlcbiMgICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4jICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4gIG9uUXVlc3Rpb25SZW5kZXJlZDogLT5cbiMgICAgY29uc29sZS5sb2coXCJvblF1ZXN0aW9uUmVuZGVyZWQgQHJlbmRlckNvdW50OiBcIiArIEByZW5kZXJDb3VudClcbiAgICBAcmVuZGVyQ291bnQrK1xuIyAgICBjb25zb2xlLmxvZyhcIm9uUXVlc3Rpb25SZW5kZXJlZCBAcmVuZGVyQ291bnQgaW5jcmVtZW50ZWQ6IFwiICsgQHJlbmRlckNvdW50KVxuICAgIGlmIEByZW5kZXJDb3VudCA9PSBAcXVlc3Rpb25zLmxlbmd0aFxuICAgICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4gICAgICBAdXBkYXRlU2tpcExvZ2ljKClcbiAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuICBvbkNsb3NlOi0+XG4gICAgZm9yIHF2IGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBxdi5jbG9zZT8oKVxuICAgIEBxdWVzdGlvblZpZXdzID0gW11cblxuICByZXNldDogKGluY3JlbWVudCkgLT5cbiMgICAgY29uc29sZS5sb2coXCJyZXNldFwiKVxuICAgIEByZW5kZXJlZC5zdWJ0ZXN0ID0gZmFsc2VcbiAgICBAcmVuZGVyZWQuYXNzZXNzbWVudCA9IGZhbHNlXG4gICAgIyAgICBjdXJyZW50VmlldyA9IEBzdWJ0ZXN0Vmlld3NbQG9yZGVyTWFwW0BpbmRleF1dXG4gICAgIyAgICBjdXJyZW50Vmlldy5jbG9zZSgpXG4gICAgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3LmNsb3NlKCk7XG4gICAgQGluZGV4ID1cbiAgICAgIGlmIEBhYm9ydEFzc2Vzc21lbnQgPT0gdHJ1ZVxuICAgICAgICBAc3VidGVzdFZpZXdzLmxlbmd0aC0xXG4gICAgICBlbHNlXG4gICAgICAgIEBpbmRleCArIGluY3JlbWVudFxuICAgIEByZW5kZXIoKVxuICAgIHdpbmRvdy5zY3JvbGxUbyAwLCAwXG4iXX0=

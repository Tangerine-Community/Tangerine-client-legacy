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
    console.log("@focusMode:" + this.focusMode);
    if (this.focusMode) {
      $('#subtest_wrapper').after($("<div id='summary_container'></div> <button class='navigation prev_question'>" + this.text.previousQuestion + "</button> <button class='navigation next_question'>" + this.text.nextQuestion + "</button>"));
      this.updateQuestionVisibility();
      this.updateProgressButtons();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1bkl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzhCQUVKLFFBQUEsR0FBVSxHQUFJLENBQUEsUUFBQTs7OEJBQ2QsU0FBQSxHQUFXOzs4QkFDWCxPQUFBLEdBQVM7OzhCQUNULFNBQUEsR0FBVzs7OEJBRVgsTUFBQSxHQUNFO0lBQUEsc0JBQUEsRUFBeUIsY0FBekI7SUFDQSxzQkFBQSxFQUF5QixjQUR6Qjs7OzhCQUdGLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFFVixRQUFBO0lBQUEsSUFBQyxDQUFBLEtBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxNQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFDeEIsSUFBQyxDQUFBLFNBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxhQUFELEdBQWlCLE9BQU8sQ0FBQztJQUN6QixJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBa0IsV0FBbEI7SUFDakIsSUFBc0IsSUFBQyxDQUFBLFNBQXZCO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsRUFBakI7O0lBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFdBQUQsR0FBaUI7SUFJakIsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUtBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUNyQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQTtJQVVkLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBbkIsR0FBb0M7SUFDcEMsTUFBQSxHQUFTO0lBQ1QsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUE7SUFDZixJQUFDLENBQUEsS0FBSyxDQUFD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UyxPQUFUO0VBWlE7OzhCQWdCVixrQkFBQSxHQUFtQixTQUFBO0lBQ2pCLE9BQU8sQ0FBQyxHQUFSLENBQVksb0JBQVo7SUFDQSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsSUFBcEI7V0FFQSxJQUFDLENBQUEsT0FBRCxDQUFTLGFBQVQ7RUFKaUI7OzhCQU1uQixrQkFBQSxHQUFtQixTQUFBO0lBRWpCLElBQUMsQ0FBQSxXQUFEO0lBRUEsSUFBRyxJQUFDLENBQUEsV0FBRCxLQUFnQixJQUFDLENBQUEsU0FBUyxDQUFDLE1BQTlCO01BQ0UsSUFBQyxDQUFBLE9BQUQsQ0FBUyxPQUFUO2FBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBQSxFQUZGOztFQUppQjs7OEJBYW5CLE9BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtBQUFBO0FBQUEsU0FBQSxxQ0FBQTs7O1FBQ0UsRUFBRSxDQUFDOztBQURMO1dBRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUI7RUFIWDs7OEJBS1IsS0FBQSxHQUFPLFNBQUMsU0FBRDtJQUVMLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixHQUFvQjtJQUNwQixJQUFDLENBQUEsUUFBUSxDQUFDLFVBQVYsR0FBdUI7SUFHdkIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBbEMsQ0FBQTtJQUNBLElBQUMsQ0FBQSxLQUFELEdBQ0ssSUFBQyxDQUFBLGVBQUQsS0FBb0IsSUFBdkIsR0FDRSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsR0FBcUIsQ0FEdkIsR0FHRSxJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ2IsSUFBQyxDQUFBLE1BQUQsQ0FBQTtXQUNBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQWhCLEVBQW1CLENBQW5CO0VBYks7Ozs7R0E1YXVCLFFBQVEsQ0FBQyxVQUFVLENBQUMiLCJmaWxlIjoibW9kdWxlcy9zdWJ0ZXN0L3Byb3RvdHlwZXMvU3VydmV5UnVuSXRlbVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdXJ2ZXlSdW5JdGVtVmlldyBleHRlbmRzIEJhY2tib25lLk1hcmlvbmV0dGUuQ29tcG9zaXRlVmlld1xuXG4gIHRlbXBsYXRlOiBKU1RbXCJTdXJ2ZXlcIl0sXG4gIGNoaWxkVmlldzogUXVlc3Rpb25SdW5JdGVtVmlldyxcbiAgdGFnTmFtZTogXCJwXCIsXG4gIGNsYXNzTmFtZTogXCJTdXJ2ZXlSdW5JdGVtVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAubmV4dF9xdWVzdGlvbicgOiAnbmV4dFF1ZXN0aW9uJ1xuICAgICdjbGljayAucHJldl9xdWVzdGlvbicgOiAncHJldlF1ZXN0aW9uJ1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQG1vZGVsICAgICAgICAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCAgICAgICAgPSBAbW9kZWwucGFyZW50XG4gICAgQGRhdGFFbnRyeSAgICAgPSBvcHRpb25zLmRhdGFFbnRyeVxuICAgIEBpc09ic2VydmF0aW9uID0gb3B0aW9ucy5pc09ic2VydmF0aW9uXG4gICAgQGZvY3VzTW9kZSAgICAgPSBAbW9kZWwuZ2V0Qm9vbGVhbihcImZvY3VzTW9kZVwiKVxuICAgIEBxdWVzdGlvbkluZGV4ID0gMCBpZiBAZm9jdXNNb2RlXG4gICAgQHF1ZXN0aW9uVmlld3MgPSBbXVxuICAgIEBhbnN3ZXJlZCAgICAgID0gW11cbiAgICBAcmVuZGVyQ291bnQgICA9IDBcbiMgICAgQGNoaWxkVmlld09wdGlvbnMgPVxuIyAgICAgICAgcGFyZW50OiB0aGlzXG5cbiAgICBAaTE4bigpXG4jICAgIHRoaXMubGlzdGVuVG8oQG1vZGVsLmNvbGxlY3Rpb24sJ2NoYW5nZScsIHRoaXMudmlld1JlbmRlcilcbiMgICAgICB0aGlzLmxpc3RlblRvKG1vZGVsLmNvbGxlY3Rpb24sICdyZXNldCcsIHRoaXMucmVuZGVyKTtcbiMgICAgaWYgQG1vZGVsLnF1ZXN0aW9ucy5sZW5ndGggPT0gMFxuIyAgICAgIGNvbnNvbGUubG9nKFwiTm8gcXVlc3Rpb25zLlwiKVxuICAgIEBjb2xsZWN0aW9uID0gQG1vZGVsLnF1ZXN0aW9uc1xuICAgIEBxdWVzdGlvbnMgPSBAY29sbGVjdGlvblxuIyAgICBAbW9kZWwucXVlc3Rpb25zLmZldGNoXG4jICAgICAgdmlld09wdGlvbnM6XG4jICAgICAgICBrZXk6IFwicXVlc3Rpb24tI3tAbW9kZWwuaWR9XCJcbiMgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgPT5cbiMjICAgICAgICBAbW9kZWwucXVlc3Rpb25zLnNvcnQoKVxuIyAgICAgICAgY29sbGVjdGlvbi5zb3J0KClcbiMgICAgICAgIEBtb2RlbC5jb2xsZWN0aW9uLm1vZGVscyA9IGNvbGxlY3Rpb24ubW9kZWxzXG4jICAgICAgICBAcmVuZGVyKClcblxuICAgIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3VidmlldyA9IEBcbiAgICBsYWJlbHMgPSB7fVxuICAgIGxhYmVscy50ZXh0ID0gQHRleHRcbiAgICBAbW9kZWwuc2V0KCdsYWJlbHMnLCBsYWJlbHMpXG5cbiAgICBAc2tpcHBhYmxlID0gQG1vZGVsLmdldChcInNraXBwYWJsZVwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gXCJ0cnVlXCJcbiAgICBAYmFja2FibGUgPSAoIEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IHRydWUgfHwgQG1vZGVsLmdldChcImJhY2tCdXR0b25cIikgPT0gXCJ0cnVlXCIgKSBhbmQgQHBhcmVudC5pbmRleCBpc250IDBcbiAgICBAcGFyZW50LmRpc3BsYXlTa2lwKEBza2lwcGFibGUpXG4gICAgQHBhcmVudC5kaXNwbGF5QmFjayhAYmFja2FibGUpXG5cbiMgIGZpbHRlcjogKGNoaWxkLCBpbmRleCwgY29sbGVjdGlvbikgLT5cbiMgICAgcmV0dXJuIGNoaWxkLmdldCgndmFsdWUnKSAlIDIgPT0gMFxuXG4jICBtb2RlbEFkZGVkOi0+XG4jICAgIGNvbnNvbGUubG9nKFwibW9kZWwgYWRkZWRcIilcblxuICBuZXh0UXVlc3Rpb246IC0+XG4jICAgIGNvbnNvbGUubG9nKFwibmV4dFF1ZXN0aW9uXCIpXG5cbiAgICBjdXJyZW50UXVlc3Rpb25WaWV3ID0gQHF1ZXN0aW9uVmlld3NbQHF1ZXN0aW9uSW5kZXhdXG5cbiAgICAjIHNob3cgZXJyb3JzIGJlZm9yZSBkb2luZyBhbnl0aGluZyBpZiB0aGVyZSBhcmUgYW55XG4gICAgcmV0dXJuIEBzaG93RXJyb3JzKGN1cnJlbnRRdWVzdGlvblZpZXcpIHVubGVzcyBAaXNWYWxpZChjdXJyZW50UXVlc3Rpb25WaWV3KVxuXG4gICAgIyBmaW5kIHRoZSBub24tc2tpcHBlZCBxdWVzdGlvbnNcbiAgICBpc0F2YWlsYWJsZSA9IFtdXG4gICAgZm9yIHF2LCBpIGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBpc0F2YWlsYWJsZS5wdXNoIGkgaWYgbm90IChxdi5pc0F1dG9zdG9wcGVkIG9yIHF2LmlzU2tpcHBlZClcbiAgICBpc0F2YWlsYWJsZSAgPSBfLmZpbHRlciBpc0F2YWlsYWJsZSwgKGUpID0+IGUgPiBAcXVlc3Rpb25JbmRleFxuXG4gICAgIyBkb24ndCBnbyBhbnl3aGVyZSB1bmxlc3Mgd2UgaGF2ZSBzb21ld2hlcmUgdG8gZ29cbiAgICBpZiBpc0F2YWlsYWJsZS5sZW5ndGggPT0gMFxuICAgICAgcGxhbm5lZEluZGV4ID0gQHF1ZXN0aW9uSW5kZXhcbiAgICBlbHNlXG4gICAgICBwbGFubmVkSW5kZXggPSBNYXRoLm1pbi5hcHBseShwbGFubmVkSW5kZXgsIGlzQXZhaWxhYmxlKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggIT0gcGxhbm5lZEluZGV4XG4gICAgICBAcXVlc3Rpb25JbmRleCA9IHBsYW5uZWRJbmRleFxuICAgICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4gICAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICBwcmV2UXVlc3Rpb246IC0+XG5cbiAgICBjdXJyZW50UXVlc3Rpb25WaWV3ID0gQHF1ZXN0aW9uVmlld3NbQHF1ZXN0aW9uSW5kZXhdXG5cbiAgICAjIHNob3cgZXJyb3JzIGJlZm9yZSBkb2luZyBhbnl0aGluZyBpZiB0aGVyZSBhcmUgYW55XG4gICAgcmV0dXJuIEBzaG93RXJyb3JzKGN1cnJlbnRRdWVzdGlvblZpZXcpIHVubGVzcyBAaXNWYWxpZChjdXJyZW50UXVlc3Rpb25WaWV3KVxuXG4gICAgIyBmaW5kIHRoZSBub24tc2tpcHBlZCBxdWVzdGlvbnNcbiAgICBpc0F2YWlsYWJsZSA9IFtdXG4gICAgZm9yIHF2LCBpIGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBpc0F2YWlsYWJsZS5wdXNoIGkgaWYgbm90IChxdi5pc0F1dG9zdG9wcGVkIG9yIHF2LmlzU2tpcHBlZClcbiAgICBpc0F2YWlsYWJsZSAgPSBfLmZpbHRlciBpc0F2YWlsYWJsZSwgKGUpID0+IGUgPCBAcXVlc3Rpb25JbmRleFxuXG4gICAgIyBkb24ndCBnbyBhbnl3aGVyZSB1bmxlc3Mgd2UgaGF2ZSBzb21ld2hlcmUgdG8gZ29cbiAgICBpZiBpc0F2YWlsYWJsZS5sZW5ndGggPT0gMFxuICAgICAgcGxhbm5lZEluZGV4ID0gQHF1ZXN0aW9uSW5kZXhcbiAgICBlbHNlXG4gICAgICBwbGFubmVkSW5kZXggPSBNYXRoLm1heC5hcHBseShwbGFubmVkSW5kZXgsIGlzQXZhaWxhYmxlKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggIT0gcGxhbm5lZEluZGV4XG4gICAgICBAcXVlc3Rpb25JbmRleCA9IHBsYW5uZWRJbmRleFxuICAgICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4gICAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICB1cGRhdGVQcm9ncmVzc0J1dHRvbnM6IC0+XG5cbiAgICBpc0F2YWlsYWJsZSA9IFtdXG4gICAgZm9yIHF2LCBpIGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBpc0F2YWlsYWJsZS5wdXNoIGkgaWYgbm90IChxdi5pc0F1dG9zdG9wcGVkIG9yIHF2LmlzU2tpcHBlZClcbiAgICBpc0F2YWlsYWJsZS5wdXNoIEBxdWVzdGlvbkluZGV4XG5cbiAgICAkcHJldiA9IEAkZWwuZmluZChcIi5wcmV2X3F1ZXN0aW9uXCIpXG4gICAgJG5leHQgPSBAJGVsLmZpbmQoXCIubmV4dF9xdWVzdGlvblwiKVxuXG4gICAgbWluaW11bSA9IE1hdGgubWluLmFwcGx5KCBtaW5pbXVtLCBpc0F2YWlsYWJsZSApXG4gICAgbWF4aW11bSA9IE1hdGgubWF4LmFwcGx5KCBtYXhpbXVtLCBpc0F2YWlsYWJsZSApXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCA9PSBtaW5pbXVtXG4gICAgICAkcHJldi5oaWRlKClcbiAgICBlbHNlXG4gICAgICAkcHJldi5zaG93KClcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IG1heGltdW1cbiAgICAgICRuZXh0LmhpZGUoKVxuICAgIGVsc2VcbiAgICAgICRuZXh0LnNob3coKVxuXG4gIHVwZGF0ZUV4ZWN1dGVSZWFkeTogKHJlYWR5KSAtPlxuXG4jICAgIGNvbnNvbGUubG9nKFwidXBkYXRlRXhlY3V0ZVJlYWR5OiBcIiArIHJlYWR5ICsgXCIgQHRyaWdnZXJTaG93TGlzdD8gXCIgKyBAdHJpZ2dlclNob3dMaXN0PylcbiAgICBAZXhlY3V0ZVJlYWR5ID0gcmVhZHlcblxuICAgIHJldHVybiBpZiBub3QgQHRyaWdnZXJTaG93TGlzdD9cblxuICAgIGlmIEB0cmlnZ2VyU2hvd0xpc3QubGVuZ3RoID4gMFxuICAgICAgZm9yIGluZGV4IGluIEB0cmlnZ2VyU2hvd0xpc3RcbiAgICAgICAgQHF1ZXN0aW9uVmlld3NbaW5kZXhdPy50cmlnZ2VyIFwic2hvd1wiXG4gICAgICBAdHJpZ2dlclNob3dMaXN0ID0gW11cblxuICAgIEB1cGRhdGVTa2lwTG9naWMoKSBpZiBAZXhlY3V0ZVJlYWR5XG5cblxuICB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHk6IC0+XG5cbiAgICByZXR1cm4gdW5sZXNzIEBtb2RlbC5nZXQoXCJmb2N1c01vZGVcIilcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IEBxdWVzdGlvblZpZXdzLmxlbmd0aFxuIyAgICAgICQoXCIjc3VtbWFyeV9jb250YWluZXJcIikuaHRtbCBcIlxuIyAgICAgICAgbGFzdCBwYWdlIGhlcmVcbiMgICAgICBcIlxuICAgICAgJChcIi5uZXh0X3F1ZXN0aW9uXCIpLmhpZGUoKVxuICAgIGVsc2VcbiAgICAgICQoXCIjc3VtbWFyeV9jb250YWluZXJcIikuZW1wdHkoKVxuICAgICAgJChcIi5uZXh0X3F1ZXN0aW9uXCIpLnNob3coKVxuXG4gICAgJHF1ZXN0aW9ucyA9IEAkZWwuZmluZChcIi5xdWVzdGlvblwiKVxuICAgICRxdWVzdGlvbnMuaGlkZSgpXG4gICAgJHF1ZXN0aW9ucy5lcShAcXVlc3Rpb25JbmRleCkuc2hvdygpXG5cbiAgICAjIHRyaWdnZXIgdGhlIHF1ZXN0aW9uIHRvIHJ1biBpdCdzIGRpc3BsYXkgY29kZSBpZiB0aGUgc3VidGVzdCdzIGRpc3BsYXljb2RlIGhhcyBhbHJlYWR5IHJhblxuICAgICMgaWYgbm90LCBhZGQgaXQgdG8gYSBsaXN0IHRvIHJ1biBsYXRlci5cbiAgICBpZiBAZXhlY3V0ZVJlYWR5XG4gICAgICBAcXVlc3Rpb25WaWV3c1tAcXVlc3Rpb25JbmRleF0udHJpZ2dlciBcInNob3dcIlxuICAgIGVsc2VcbiAgICAgIEB0cmlnZ2VyU2hvd0xpc3QgPSBbXSBpZiBub3QgQHRyaWdnZXJTaG93TGlzdFxuICAgICAgQHRyaWdnZXJTaG93TGlzdC5wdXNoIEBxdWVzdGlvbkluZGV4XG5cbiAgc2hvd1F1ZXN0aW9uOiAoaW5kZXgpIC0+XG4gICAgQHF1ZXN0aW9uSW5kZXggPSBpbmRleCBpZiBfLmlzTnVtYmVyKGluZGV4KSAmJiBpbmRleCA8IEBxdWVzdGlvblZpZXdzLmxlbmd0aCAmJiBpbmRleCA+IDBcbiAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIHBsZWFzZUFuc3dlciA6IHQoXCJTdXJ2ZXlSdW5WaWV3Lm1lc3NhZ2UucGxlYXNlX2Fuc3dlclwiKVxuICAgICAgY29ycmVjdEVycm9ycyA6IHQoXCJTdXJ2ZXlSdW5WaWV3Lm1lc3NhZ2UuY29ycmVjdF9lcnJvcnNcIilcbiAgICAgIG5vdEVub3VnaCA6IF8odChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5ub3RfZW5vdWdoXCIpKS5lc2NhcGUoKVxuXG4gICAgICBwcmV2aW91c1F1ZXN0aW9uIDogdChcIlN1cnZleVJ1blZpZXcuYnV0dG9uLnByZXZpb3VzX3F1ZXN0aW9uXCIpXG4gICAgICBuZXh0UXVlc3Rpb24gOiB0KFwiU3VydmV5UnVuVmlldy5idXR0b24ubmV4dF9xdWVzdGlvblwiKVxuICAgICAgXCJuZXh0XCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLm5leHRcIilcbiAgICAgIFwiYmFja1wiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5iYWNrXCIpXG4gICAgICBcInNraXBcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uc2tpcFwiKVxuICAgICAgXCJoZWxwXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLmhlbHBcIilcblxuICAjIHdoZW4gYSBxdWVzdGlvbiBpcyBhbnN3ZXJlZFxuICBvblF1ZXN0aW9uQW5zd2VyOiAoZWxlbWVudCkgLT5cbiMgICAgY29uc29sZS5sb2coXCJvblF1ZXN0aW9uQW5zd2VyIEByZW5kZXJDb3VudDpcIiArIEByZW5kZXJDb3VudCArIFwiICBAcXVlc3Rpb25zLmxlbmd0aDogXCIgKyAgQHF1ZXN0aW9ucy5sZW5ndGgpXG4jICAgIHRoaXMgaXMgbm90IGdvb2QuIFNob3VsZCB0ZXN0IGZvciA9PVxuICAgIHJldHVybiB1bmxlc3MgQHJlbmRlckNvdW50ID49IEBxdWVzdGlvbnMubGVuZ3RoXG5cbiAgICAjIGF1dG8gc3RvcCBhZnRlciBsaW1pdFxuICAgIEBhdXRvc3RvcHBlZCAgICA9IGZhbHNlXG4gICAgYXV0b3N0b3BMaW1pdCAgID0gQG1vZGVsLmdldE51bWJlciBcImF1dG9zdG9wTGltaXRcIlxuICAgIGxvbmdlc3RTZXF1ZW5jZSA9IDBcbiAgICBhdXRvc3RvcENvdW50ICAgPSAwXG5cbiAgICBpZiBhdXRvc3RvcExpbWl0ID4gMFxuICAgICAgZm9yIGkgaW4gWzEuLkBxdWVzdGlvblZpZXdzLmxlbmd0aF0gIyBqdXN0IGluIGNhc2UgdGhleSBjYW4ndCBjb3VudFxuICAgICAgICBjdXJyZW50QW5zd2VyID0gQHF1ZXN0aW9uVmlld3NbaS0xXS5hbnN3ZXJcbiAgICAgICAgaWYgY3VycmVudEFuc3dlciA9PSBcIjBcIiBvciBjdXJyZW50QW5zd2VyID09IFwiOVwiXG4gICAgICAgICAgYXV0b3N0b3BDb3VudCsrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhdXRvc3RvcENvdW50ID0gMFxuICAgICAgICBsb25nZXN0U2VxdWVuY2UgPSBNYXRoLm1heChsb25nZXN0U2VxdWVuY2UsIGF1dG9zdG9wQ291bnQpXG4gICAgICAgICMgaWYgdGhlIHZhbHVlIGlzIHNldCwgd2UndmUgZ290IGEgdGhyZXNob2xkIGV4Y2VlZGluZyBydW4sIGFuZCBpdCdzIG5vdCBhbHJlYWR5IGF1dG9zdG9wcGVkXG4gICAgICAgIGlmIGF1dG9zdG9wTGltaXQgIT0gMCAmJiBsb25nZXN0U2VxdWVuY2UgPj0gYXV0b3N0b3BMaW1pdCAmJiBub3QgQGF1dG9zdG9wcGVkXG4gICAgICAgICAgQGF1dG9zdG9wcGVkID0gdHJ1ZVxuICAgICAgICAgIEBhdXRvc3RvcEluZGV4ID0gaVxuICAgIEB1cGRhdGVBdXRvc3RvcCgpXG4gICAgQHVwZGF0ZVNraXBMb2dpYygpXG5cbiAgdXBkYXRlQXV0b3N0b3A6IC0+XG4gICAgYXV0b3N0b3BMaW1pdCA9IEBtb2RlbC5nZXROdW1iZXIgXCJhdXRvc3RvcExpbWl0XCJcbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoICh2aWV3LCBpKSAtPlxuICAgICAgaWYgaSA+IChAYXV0b3N0b3BJbmRleCAtIDEpXG4gICAgICAgIGlmIEBhdXRvc3RvcHBlZFxuICAgICAgICAgIHZpZXcuaXNBdXRvc3RvcHBlZCA9IHRydWVcbiAgICAgICAgICB2aWV3LiRlbC5hZGRDbGFzcyAgICBcImRpc2FibGVkX2F1dG9zdG9wXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpZXcuaXNBdXRvc3RvcHBlZCA9IGZhbHNlXG4gICAgICAgICAgdmlldy4kZWwucmVtb3ZlQ2xhc3MgXCJkaXNhYmxlZF9hdXRvc3RvcFwiXG4gICAgLCBAXG5cbiAgdXBkYXRlU2tpcExvZ2ljOiAtPlxuIyAgICBjb25zb2xlLmxvZyhcInVwZGF0ZVNraXBMb2dpY1wiKVxuIyAgICBjb25zb2xlLmxvZyhcIkBxdWVzdGlvblZpZXdzXCIgKyBAcXVlc3Rpb25WaWV3cy5sZW5ndGgpXG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAocXYpIC0+XG4gICAgICBxdWVzdGlvbiA9IHF2Lm1vZGVsXG4gICAgICBza2lwTG9naWNDb2RlID0gcXVlc3Rpb24uZ2V0U3RyaW5nIFwic2tpcExvZ2ljXCJcbiAgICAgIHVubGVzcyBza2lwTG9naWNDb2RlIGlzIFwiXCJcbiAgICAgICAgdHJ5XG4gICAgICAgICAgcmVzdWx0ID0gQ29mZmVlU2NyaXB0LmV2YWwuYXBwbHkoQCwgW3NraXBMb2dpY0NvZGVdKVxuIyAgICAgICAgICBjb25zb2xlLmxvZyhcInNraXBMb2dpY0NvZGU6IFwiICsgc2tpcExvZ2ljQ29kZSlcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICBuYW1lID0gKCgvZnVuY3Rpb24gKC57MSx9KVxcKC8pLmV4ZWMoZXJyb3IuY29uc3RydWN0b3IudG9TdHJpbmcoKSlbMV0pXG4gICAgICAgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgICBhbGVydCBcIlNraXAgbG9naWMgZXJyb3IgaW4gcXVlc3Rpb24gI3txdWVzdGlvbi5nZXQoJ25hbWUnKX1cXG5cXG4je25hbWV9XFxuXFxuI3ttZXNzYWdlfVwiXG5cbiAgICAgICAgaWYgcmVzdWx0XG4gICAgICAgICAgcXYuJGVsLmFkZENsYXNzIFwiZGlzYWJsZWRfc2tpcHBlZFwiXG4gICAgICAgICAgcXYuaXNTa2lwcGVkID0gdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcXYuJGVsLnJlbW92ZUNsYXNzIFwiZGlzYWJsZWRfc2tpcHBlZFwiXG4gICAgICAgICAgcXYuaXNTa2lwcGVkID0gZmFsc2VcbiAgICAgIHF2LnVwZGF0ZVZhbGlkaXR5KClcbiAgICAsIEBcblxuICBpc1ZhbGlkOiAodmlld3MgPSBAcXVlc3Rpb25WaWV3cykgLT5cbiAgICByZXR1cm4gdHJ1ZSBpZiBub3Qgdmlld3M/ICMgaWYgdGhlcmUncyBub3RoaW5nIHRvIGNoZWNrLCBpdCBtdXN0IGJlIGdvb2RcbiAgICB2aWV3cyA9IFt2aWV3c10gaWYgbm90IF8uaXNBcnJheSh2aWV3cylcbiAgICBmb3IgcXYsIGkgaW4gdmlld3NcbiAgICAgIHF2LnVwZGF0ZVZhbGlkaXR5KClcbiAgICAgICMgY2FuIHdlIHNraXAgaXQ/XG4gICAgICBpZiBub3QgcXYubW9kZWwuZ2V0Qm9vbGVhbihcInNraXBwYWJsZVwiKVxuICAgICAgICAjIGlzIGl0IHZhbGlkXG4gICAgICAgIGlmIG5vdCBxdi5pc1ZhbGlkXG4gICAgICAgICAgIyByZWQgYWxlcnQhIVxuIyAgICAgICAgICBjb25zb2xlLmxvZyhcInBvcCB1cCBhbiBlcnJvclwiKVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuIyAgICAsIEBcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHRlc3RWYWxpZDogLT5cbiMgICAgY29uc29sZS5sb2coXCJTdXJ2ZXlSaW5JdGVtIHRlc3RWYWxpZC5cIilcbiMgICAgaWYgbm90IEBwcm90b3R5cGVSZW5kZXJlZCB0aGVuIHJldHVybiBmYWxzZVxuIyAgICBjdXJyZW50VmlldyA9IFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1xuIyAgICBpZiBAaXNWYWxpZD9cbiMgICAgY29uc29sZS5sb2coXCJ0ZXN0dmFsaWQ6IFwiICsgQGlzVmFsaWQ/KVxuICAgIHJldHVybiBAaXNWYWxpZCgpXG4jICAgIGVsc2VcbiMgICAgICByZXR1cm4gZmFsc2VcbiMgICAgdHJ1ZVxuXG5cbiAgIyBAVE9ETyB0aGlzIHNob3VsZCBwcm9iYWJseSBiZSByZXR1cm5pbmcgbXVsdGlwbGUsIHNpbmdsZSB0eXBlIGhhc2ggdmFsdWVzXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgcmVzdWx0ID0ge31cbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoIChxdiwgaSkgLT5cbiAgICAgIHJlc3VsdFtAcXVlc3Rpb25zLm1vZGVsc1tpXS5nZXQoXCJuYW1lXCIpXSA9IFwic2tpcHBlZFwiXG4gICAgLCBAXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIGdldFJlc3VsdDogLT5cbiAgICByZXN1bHQgPSB7fVxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuIyAgICAgIHJlc3VsdFtAcXVlc3Rpb25zLm1vZGVsc1tpXS5nZXQoXCJuYW1lXCIpXSA9XG4gICAgICByZXN1bHRbcXYubmFtZV0gPVxuICAgICAgICBpZiBxdi5ub3RBc2tlZCAjIGJlY2F1c2Ugb2YgZ3JpZCBzY29yZVxuICAgICAgICAgIHF2Lm5vdEFza2VkUmVzdWx0XG4gICAgICAgIGVsc2UgaWYgbm90IF8uaXNFbXB0eShxdi5hbnN3ZXIpICMgdXNlIGFuc3dlclxuICAgICAgICAgIHF2LmFuc3dlclxuICAgICAgICBlbHNlIGlmIHF2LnNraXBwZWRcbiAgICAgICAgICBxdi5za2lwcGVkUmVzdWx0XG4gICAgICAgIGVsc2UgaWYgcXYuaXNTa2lwcGVkXG4gICAgICAgICAgcXYubG9naWNTa2lwcGVkUmVzdWx0XG4gICAgICAgIGVsc2UgaWYgcXYuaXNBdXRvc3RvcHBlZFxuICAgICAgICAgIHF2Lm5vdEFza2VkQXV0b3N0b3BSZXN1bHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHF2LmFuc3dlclxuICAgICwgQFxuICAgIGhhc2ggPSBAbW9kZWwuZ2V0KFwiaGFzaFwiKSBpZiBAbW9kZWwuaGFzKFwiaGFzaFwiKVxuICAgIHN1YnRlc3RSZXN1bHQgPVxuICAgICAgJ2JvZHknIDogcmVzdWx0XG4gICAgICAnbWV0YScgOlxuICAgICAgICAnaGFzaCcgOiBoYXNoXG4jICAgIHJldHVybiByZXN1bHRcblxuICBzaG93RXJyb3JzOiAodmlld3MgPSBAcXVlc3Rpb25WaWV3cykgLT5cbiAgICBAJGVsLmZpbmQoJy5tZXNzYWdlJykucmVtb3ZlKClcbiAgICBmaXJzdCA9IHRydWVcbiAgICB2aWV3cyA9IFt2aWV3c10gaWYgbm90IF8uaXNBcnJheSh2aWV3cylcbiAgICB2aWV3cy5mb3JFYWNoIChxdiwgaSkgLT5cbiAgICAgIGlmIG5vdCBfLmlzU3RyaW5nKHF2KVxuICAgICAgICBtZXNzYWdlID0gXCJcIlxuICAgICAgICBpZiBub3QgcXYuaXNWYWxpZFxuICAgICAgICAgICMgaGFuZGxlIGN1c3RvbSB2YWxpZGF0aW9uIGVycm9yIG1lc3NhZ2VzXG4gICAgICAgICAgY3VzdG9tTWVzc2FnZSA9IHF2Lm1vZGVsLmdldChcImN1c3RvbVZhbGlkYXRpb25NZXNzYWdlXCIpXG4gICAgICAgICAgaWYgbm90IF8uaXNFbXB0eShjdXN0b21NZXNzYWdlKVxuICAgICAgICAgICAgbWVzc2FnZSA9IGN1c3RvbU1lc3NhZ2VcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBtZXNzYWdlID0gQHRleHQucGxlYXNlQW5zd2VyXG5cbiAgICAgICAgICBpZiBmaXJzdCA9PSB0cnVlXG4gICAgICAgICAgICBAc2hvd1F1ZXN0aW9uKGkpIGlmIHZpZXdzID09IEBxdWVzdGlvblZpZXdzXG4gICAgICAgICAgICBxdi4kZWwuc2Nyb2xsVG8oKVxuICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgQHRleHQuY29ycmVjdEVycm9yc1xuICAgICAgICAgICAgZmlyc3QgPSBmYWxzZVxuICAgICAgICBxdi5zZXRNZXNzYWdlIG1lc3NhZ2VcbiAgICAsIEBcblxuXG4gIGdldFN1bTogLT5cbiMgICAgaWYgQHByb3RvdHlwZVZpZXcuZ2V0U3VtP1xuIyAgICAgIHJldHVybiBAcHJvdG90eXBlVmlldy5nZXRTdW0oKVxuIyAgICBlbHNlXG4jIG1heWJlIGEgYmV0dGVyIGZhbGxiYWNrXG4jICAgIGNvbnNvbGUubG9nKFwiVGhpcyB2aWV3IGRvZXMgbm90IHJldHVybiBhIHN1bSwgY29ycmVjdD9cIilcbiAgICByZXR1cm4ge2NvcnJlY3Q6MCxpbmNvcnJlY3Q6MCxtaXNzaW5nOjAsdG90YWw6MH1cblxuICBjaGlsZEV2ZW50czpcbiAgICAnYW5zd2VyIHNjcm9sbCc6ICdvblF1ZXN0aW9uQW5zd2VyJ1xuICAgICdhbnN3ZXInOiAnb25RdWVzdGlvbkFuc3dlcidcbiAgICAncmVuZGVyZWQnOiAnb25RdWVzdGlvblJlbmRlcmVkJ1xuXG4gIGJ1aWxkQ2hpbGRWaWV3OiAoY2hpbGQsIENoaWxkVmlld0NsYXNzLCBjaGlsZFZpZXdPcHRpb25zKSAtPlxuICAgIG9wdGlvbnMgPSBfLmV4dGVuZCh7bW9kZWw6IGNoaWxkfSwgY2hpbGRWaWV3T3B0aW9ucyk7XG4gICAgdmlldyA9IG5ldyBDaGlsZFZpZXdDbGFzcyhvcHRpb25zKVxuXG4jICAgIEBsaXN0ZW5UbyB2aWV3LCBcInJlbmRlcmVkXCIsICAgICAgQG9uUXVlc3Rpb25SZW5kZXJlZFxuIyAgICBAbGlzdGVuVG8gY2hpbGQsIFwiYW5zd2VyIHNjcm9sbFwiLCBAb25RdWVzdGlvbkFuc3dlclxuXG4gICAgQHF1ZXN0aW9uVmlld3NbY2hpbGRWaWV3T3B0aW9ucy5pbmRleF0gPSB2aWV3XG5cbiAgICByZXR1cm4gdmlld1xuICAsXG5cbiMgIFBhc3NlcyBvcHRpb25zIHRvIGVhY2ggY2hpbGRWaWV3IGluc3RhbmNlXG4gIGNoaWxkVmlld09wdGlvbnM6IChtb2RlbCwgaW5kZXgpLT5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgcHJldmlvdXMgPSBAbW9kZWwucGFyZW50LnJlc3VsdC5nZXRCeUhhc2goQG1vZGVsLmdldCgnaGFzaCcpKVxuICAgIG5vdEFza2VkQ291bnQgPSAwXG4gICAgcmVxdWlyZWQgPSBtb2RlbC5nZXROdW1iZXIgXCJsaW5rZWRHcmlkU2NvcmVcIlxuXG4gICAgaXNOb3RBc2tlZCA9ICggKCByZXF1aXJlZCAhPSAwICYmIEBtb2RlbC5wYXJlbnQuZ2V0R3JpZFNjb3JlKCkgPCByZXF1aXJlZCApIHx8IEBtb2RlbC5wYXJlbnQuZ3JpZFdhc0F1dG9zdG9wcGVkKCkgKSAmJiBAbW9kZWwucGFyZW50LmdldEdyaWRTY29yZSgpICE9IGZhbHNlXG5cbiAgICBpZiBpc05vdEFza2VkIHRoZW4gbm90QXNrZWRDb3VudCsrXG5cbiAgICBuYW1lICAgPSBtb2RlbC5lc2NhcGUoXCJuYW1lXCIpLnJlcGxhY2UgL1teQS1aYS16MC05X10vZywgXCItXCJcbiAgICBhbnN3ZXIgPSBwcmV2aW91c1tuYW1lXSBpZiBwcmV2aW91c1xuICAgIGxhYmVscyA9IHt9XG4gICAgbGFiZWxzLnRleHQgPSBAdGV4dFxuICAgIG1vZGVsLnNldCgnbGFiZWxzJywgbGFiZWxzKVxuICAgIG9wdGlvbnMgPVxuICAgICAgbW9kZWwgICAgICAgICA6IG1vZGVsXG4gICAgICBwYXJlbnQgICAgICAgIDogQFxuICAgICAgZGF0YUVudHJ5ICAgICA6IEBkYXRhRW50cnlcbiAgICAgIG5vdEFza2VkICAgICAgOiBpc05vdEFza2VkXG4gICAgICBpc09ic2VydmF0aW9uIDogQGlzT2JzZXJ2YXRpb25cbiAgICAgIGFuc3dlciAgICAgICAgOiBhbnN3ZXJcbiAgICAgIGluZGV4ICA6IGluZGV4XG4gICAgcmV0dXJuIG9wdGlvbnNcblxuICBvbkJlZm9yZVJlbmRlcjogLT5cbiMgICAgQHF1ZXN0aW9ucy5zb3J0KClcblxuICBvblJlbmRlcjogLT5cbiMgICAgQG9uUmVuZGVyQ29sbGVjdGlvbigpXG4gICAgY29uc29sZS5sb2coXCJAZm9jdXNNb2RlOlwiICsgQGZvY3VzTW9kZSlcbiAgICBpZiBAZm9jdXNNb2RlXG4gICAgICAkKCcjc3VidGVzdF93cmFwcGVyJykuYWZ0ZXIgJCBcIlxuICAgICAgICAgIDxkaXYgaWQ9J3N1bW1hcnlfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIHByZXZfcXVlc3Rpb24nPiN7QHRleHQucHJldmlvdXNRdWVzdGlvbn08L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIG5leHRfcXVlc3Rpb24nPiN7QHRleHQubmV4dFF1ZXN0aW9ufTwvYnV0dG9uPlxuICAgICAgICBcIlxuICAgICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4gICAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcbiMgICAgQHVwZGF0ZVNraXBMb2dpYygpXG4gICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4jICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuIyAgICBAbGlzdGVuVG8gb25lVmlldywgXCJhbnN3ZXIgc2Nyb2xsXCIsIEBvblF1ZXN0aW9uQW5zd2VyXG5cbiAgb25SZW5kZXJDb2xsZWN0aW9uOi0+XG4gICAgY29uc29sZS5sb2coXCJvblJlbmRlckNvbGxlY3Rpb25cIilcbiAgICBAdXBkYXRlRXhlY3V0ZVJlYWR5KHRydWUpXG4jICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4gIG9uUXVlc3Rpb25SZW5kZXJlZDotPlxuIyAgICBjb25zb2xlLmxvZyhcIm9uUXVlc3Rpb25SZW5kZXJlZCBAcmVuZGVyQ291bnQ6IFwiICsgQHJlbmRlckNvdW50KVxuICAgIEByZW5kZXJDb3VudCsrXG4jICAgIGNvbnNvbGUubG9nKFwib25RdWVzdGlvblJlbmRlcmVkIEByZW5kZXJDb3VudCBpbmNyZW1lbnRlZDogXCIgKyBAcmVuZGVyQ291bnQpXG4gICAgaWYgQHJlbmRlckNvdW50ID09IEBxdWVzdGlvbnMubGVuZ3RoXG4gICAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiAgICAgIEB1cGRhdGVTa2lwTG9naWMoKVxuIyAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuIyAgb25TaG93Oi0+XG4jICAgIGNvbnNvbGUubG9nKFwiaVNob3duIVwiKVxuIyAgICBAb25SZW5kZXJDb2xsZWN0aW9uKClcblxuICBvbkNsb3NlOi0+XG4gICAgZm9yIHF2IGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBxdi5jbG9zZT8oKVxuICAgIEBxdWVzdGlvblZpZXdzID0gW11cblxuICByZXNldDogKGluY3JlbWVudCkgLT5cbiMgICAgY29uc29sZS5sb2coXCJyZXNldFwiKVxuICAgIEByZW5kZXJlZC5zdWJ0ZXN0ID0gZmFsc2VcbiAgICBAcmVuZGVyZWQuYXNzZXNzbWVudCA9IGZhbHNlXG4gICAgIyAgICBjdXJyZW50VmlldyA9IEBzdWJ0ZXN0Vmlld3NbQG9yZGVyTWFwW0BpbmRleF1dXG4gICAgIyAgICBjdXJyZW50Vmlldy5jbG9zZSgpXG4gICAgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3LmNsb3NlKCk7XG4gICAgQGluZGV4ID1cbiAgICAgIGlmIEBhYm9ydEFzc2Vzc21lbnQgPT0gdHJ1ZVxuICAgICAgICBAc3VidGVzdFZpZXdzLmxlbmd0aC0xXG4gICAgICBlbHNlXG4gICAgICAgIEBpbmRleCArIGluY3JlbWVudFxuICAgIEByZW5kZXIoKVxuICAgIHdpbmRvdy5zY3JvbGxUbyAwLCAwXG4iXX0=

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
    var childView, options;
    options = _.extend({
      model: child
    }, childViewOptions);
    childView = new ChildViewClass(options);
    Marionette.MonitorDOMRefresh(childView);
    this.questionViews[childViewOptions.index] = childView;
    return childView;
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
    return this.trigger("ready");
  };

  SurveyRunItemView.prototype.onRenderCollection = function() {
    if (this.focusMode) {
      $('#subtest_wrapper').after($("<div id='summary_container'></div> <button class='navigation prev_question'>" + this.text.previousQuestion + "</button> <button class='navigation next_question'>" + this.text.nextQuestion + "</button>"));
    }
    this.updateExecuteReady(true);
    this.updateQuestionVisibility();
    this.updateProgressButtons();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1bkl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzhCQUVKLFFBQUEsR0FBVSxHQUFJLENBQUEsUUFBQTs7OEJBQ2QsU0FBQSxHQUFXOzs4QkFDWCxPQUFBLEdBQVM7OzhCQUNULFNBQUEsR0FBVzs7OEJBRVgsTUFBQSxHQUNFO0lBQUEsc0JBQUEsRUFBeUIsY0FBekI7SUFDQSxzQkFBQSxFQUF5QixjQUR6Qjs7OzhCQUdGLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFFVixRQUFBO0lBQUEsSUFBQyxDQUFBLEtBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxNQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFDeEIsSUFBQyxDQUFBLFNBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxhQUFELEdBQWlCLE9BQU8sQ0FBQztJQUN6QixJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBa0IsV0FBbEI7SUFDakIsSUFBc0IsSUFBQyxDQUFBLFNBQXZCO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsRUFBakI7O0lBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFdBQUQsR0FBaUI7SUFJakIsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUtBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUNyQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQTtJQVVkLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBbkIsR0FBb0M7SUFDcEMsTUFBQSxHQUFTO0lBQ1QsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUE7SUFDZixJQUFDLENBQUEsS0FBSyxDQUFD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QVYsR0FBdUI7SUFHdkIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBbEMsQ0FBQTtJQUNBLElBQUMsQ0FBQSxLQUFELEdBQ0ssSUFBQyxDQUFBLGVBQUQsS0FBb0IsSUFBdkIsR0FDRSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsR0FBcUIsQ0FEdkIsR0FHRSxJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ2IsSUFBQyxDQUFBLE1BQUQsQ0FBQTtXQUNBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQWhCLEVBQW1CLENBQW5CO0VBYks7Ozs7R0ExWHVCLFFBQVEsQ0FBQyxVQUFVLENBQUMiLCJmaWxlIjoibW9kdWxlcy9zdWJ0ZXN0L3Byb3RvdHlwZXMvU3VydmV5UnVuSXRlbVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdXJ2ZXlSdW5JdGVtVmlldyBleHRlbmRzIEJhY2tib25lLk1hcmlvbmV0dGUuQ29tcG9zaXRlVmlld1xuXG4gIHRlbXBsYXRlOiBKU1RbXCJTdXJ2ZXlcIl0sXG4gIGNoaWxkVmlldzogUXVlc3Rpb25SdW5JdGVtVmlldyxcbiAgdGFnTmFtZTogXCJwXCIsXG4gIGNsYXNzTmFtZTogXCJTdXJ2ZXlSdW5JdGVtVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAubmV4dF9xdWVzdGlvbicgOiAnbmV4dFF1ZXN0aW9uJ1xuICAgICdjbGljayAucHJldl9xdWVzdGlvbicgOiAncHJldlF1ZXN0aW9uJ1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQG1vZGVsICAgICAgICAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCAgICAgICAgPSBAbW9kZWwucGFyZW50XG4gICAgQGRhdGFFbnRyeSAgICAgPSBvcHRpb25zLmRhdGFFbnRyeVxuICAgIEBpc09ic2VydmF0aW9uID0gb3B0aW9ucy5pc09ic2VydmF0aW9uXG4gICAgQGZvY3VzTW9kZSAgICAgPSBAbW9kZWwuZ2V0Qm9vbGVhbihcImZvY3VzTW9kZVwiKVxuICAgIEBxdWVzdGlvbkluZGV4ID0gMCBpZiBAZm9jdXNNb2RlXG4gICAgQHF1ZXN0aW9uVmlld3MgPSBbXVxuICAgIEBhbnN3ZXJlZCAgICAgID0gW11cbiAgICBAcmVuZGVyQ291bnQgICA9IDBcbiMgICAgQGNoaWxkVmlld09wdGlvbnMgPVxuIyAgICAgICAgcGFyZW50OiB0aGlzXG5cbiAgICBAaTE4bigpXG4jICAgIHRoaXMubGlzdGVuVG8oQG1vZGVsLmNvbGxlY3Rpb24sJ2NoYW5nZScsIHRoaXMudmlld1JlbmRlcilcbiMgICAgICB0aGlzLmxpc3RlblRvKG1vZGVsLmNvbGxlY3Rpb24sICdyZXNldCcsIHRoaXMucmVuZGVyKTtcbiMgICAgaWYgQG1vZGVsLnF1ZXN0aW9ucy5sZW5ndGggPT0gMFxuIyAgICAgIGNvbnNvbGUubG9nKFwiTm8gcXVlc3Rpb25zLlwiKVxuICAgIEBjb2xsZWN0aW9uID0gQG1vZGVsLnF1ZXN0aW9uc1xuICAgIEBxdWVzdGlvbnMgPSBAY29sbGVjdGlvblxuIyAgICBAbW9kZWwucXVlc3Rpb25zLmZldGNoXG4jICAgICAgdmlld09wdGlvbnM6XG4jICAgICAgICBrZXk6IFwicXVlc3Rpb24tI3tAbW9kZWwuaWR9XCJcbiMgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgPT5cbiMjICAgICAgICBAbW9kZWwucXVlc3Rpb25zLnNvcnQoKVxuIyAgICAgICAgY29sbGVjdGlvbi5zb3J0KClcbiMgICAgICAgIEBtb2RlbC5jb2xsZWN0aW9uLm1vZGVscyA9IGNvbGxlY3Rpb24ubW9kZWxzXG4jICAgICAgICBAcmVuZGVyKClcblxuICAgIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3VidmlldyA9IEBcbiAgICBsYWJlbHMgPSB7fVxuICAgIGxhYmVscy50ZXh0ID0gQHRleHRcbiAgICBAbW9kZWwuc2V0KCdsYWJlbHMnLCBsYWJlbHMpXG5cbiAgICBAc2tpcHBhYmxlID0gQG1vZGVsLmdldChcInNraXBwYWJsZVwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gXCJ0cnVlXCJcbiAgICBAYmFja2FibGUgPSAoIEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IHRydWUgfHwgQG1vZGVsLmdldChcImJhY2tCdXR0b25cIikgPT0gXCJ0cnVlXCIgKSBhbmQgQHBhcmVudC5pbmRleCBpc250IDBcbiAgICBAcGFyZW50LmRpc3BsYXlTa2lwKEBza2lwcGFibGUpXG4gICAgQHBhcmVudC5kaXNwbGF5QmFjayhAYmFja2FibGUpXG5cbiAgdXBkYXRlUHJvZ3Jlc3NCdXR0b25zOiAtPlxuXG4gICAgaXNBdmFpbGFibGUgPSBbXVxuICAgIGZvciBxdiwgaSBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgaXNBdmFpbGFibGUucHVzaCBpIGlmIG5vdCAocXYuaXNBdXRvc3RvcHBlZCBvciBxdi5pc1NraXBwZWQpXG4gICAgaXNBdmFpbGFibGUucHVzaCBAcXVlc3Rpb25JbmRleFxuXG4gICAgJHByZXYgPSBAcGFyZW50LiRlbC5maW5kKFwiLnByZXZfcXVlc3Rpb25cIilcbiAgICAkbmV4dCA9IEBwYXJlbnQuJGVsLmZpbmQoXCIubmV4dF9xdWVzdGlvblwiKVxuXG4gICAgbWluaW11bSA9IE1hdGgubWluLmFwcGx5KCBtaW5pbXVtLCBpc0F2YWlsYWJsZSApXG4gICAgbWF4aW11bSA9IE1hdGgubWF4LmFwcGx5KCBtYXhpbXVtLCBpc0F2YWlsYWJsZSApXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCA9PSBtaW5pbXVtXG4gICAgICAkcHJldi5oaWRlKClcbiAgICBlbHNlXG4gICAgICAkcHJldi5zaG93KClcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IG1heGltdW1cbiAgICAgICRuZXh0LmhpZGUoKVxuICAgIGVsc2VcbiAgICAgICRuZXh0LnNob3coKVxuXG4gIHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eTogLT5cblxuICAgIHJldHVybiB1bmxlc3MgQG1vZGVsLmdldChcImZvY3VzTW9kZVwiKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggPT0gQHF1ZXN0aW9uVmlld3MubGVuZ3RoXG4jICAgICAgJChcIiNzdW1tYXJ5X2NvbnRhaW5lclwiKS5odG1sIFwiXG4jICAgICAgICBsYXN0IHBhZ2UgaGVyZVxuIyAgICAgIFwiXG4gICAgICAkKFwiLm5leHRfcXVlc3Rpb25cIikuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgJChcIiNzdW1tYXJ5X2NvbnRhaW5lclwiKS5lbXB0eSgpXG4gICAgICAkKFwiLm5leHRfcXVlc3Rpb25cIikuc2hvdygpXG5cbiAgICAkcXVlc3Rpb25zID0gQCRlbC5maW5kKFwiLnF1ZXN0aW9uXCIpXG4gICAgJHF1ZXN0aW9ucy5oaWRlKClcbiAgICAkcXVlc3Rpb25zLmVxKEBxdWVzdGlvbkluZGV4KS5zaG93KClcblxuICAgICMgdHJpZ2dlciB0aGUgcXVlc3Rpb24gdG8gcnVuIGl0J3MgZGlzcGxheSBjb2RlIGlmIHRoZSBzdWJ0ZXN0J3MgZGlzcGxheWNvZGUgaGFzIGFscmVhZHkgcmFuXG4gICAgIyBpZiBub3QsIGFkZCBpdCB0byBhIGxpc3QgdG8gcnVuIGxhdGVyLlxuICAgIGlmIEBleGVjdXRlUmVhZHlcbiAgICAgIEBxdWVzdGlvblZpZXdzW0BxdWVzdGlvbkluZGV4XS50cmlnZ2VyIFwic2hvd1wiXG4gICAgZWxzZVxuICAgICAgQHRyaWdnZXJTaG93TGlzdCA9IFtdIGlmIG5vdCBAdHJpZ2dlclNob3dMaXN0XG4gICAgICBAdHJpZ2dlclNob3dMaXN0LnB1c2ggQHF1ZXN0aW9uSW5kZXhcblxuICBzaG93UXVlc3Rpb246IChpbmRleCkgLT5cbiAgICBAcXVlc3Rpb25JbmRleCA9IGluZGV4IGlmIF8uaXNOdW1iZXIoaW5kZXgpICYmIGluZGV4IDwgQHF1ZXN0aW9uVmlld3MubGVuZ3RoICYmIGluZGV4ID4gMFxuICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuIyAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICB1cGRhdGVFeGVjdXRlUmVhZHk6IChyZWFkeSkgLT5cbiAgICBAZXhlY3V0ZVJlYWR5ID0gcmVhZHlcblxuICAgIHJldHVybiBpZiBub3QgQHRyaWdnZXJTaG93TGlzdD9cblxuICAgIGlmIEB0cmlnZ2VyU2hvd0xpc3QubGVuZ3RoID4gMFxuICAgICAgZm9yIGluZGV4IGluIEB0cmlnZ2VyU2hvd0xpc3RcbiAgICAgICAgQHF1ZXN0aW9uVmlld3NbaW5kZXhdPy50cmlnZ2VyIFwic2hvd1wiXG4gICAgICBAdHJpZ2dlclNob3dMaXN0ID0gW11cblxuICAgIEB1cGRhdGVTa2lwTG9naWMoKSBpZiBAZXhlY3V0ZVJlYWR5XG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICBwbGVhc2VBbnN3ZXIgOiB0KFwiU3VydmV5UnVuVmlldy5tZXNzYWdlLnBsZWFzZV9hbnN3ZXJcIilcbiAgICAgIGNvcnJlY3RFcnJvcnMgOiB0KFwiU3VydmV5UnVuVmlldy5tZXNzYWdlLmNvcnJlY3RfZXJyb3JzXCIpXG4gICAgICBub3RFbm91Z2ggOiBfKHQoXCJTdXJ2ZXlSdW5WaWV3Lm1lc3NhZ2Uubm90X2Vub3VnaFwiKSkuZXNjYXBlKClcblxuICAgICAgcHJldmlvdXNRdWVzdGlvbiA6IHQoXCJTdXJ2ZXlSdW5WaWV3LmJ1dHRvbi5wcmV2aW91c19xdWVzdGlvblwiKVxuICAgICAgbmV4dFF1ZXN0aW9uIDogdChcIlN1cnZleVJ1blZpZXcuYnV0dG9uLm5leHRfcXVlc3Rpb25cIilcbiAgICAgIFwibmV4dFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5uZXh0XCIpXG4gICAgICBcImJhY2tcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uYmFja1wiKVxuICAgICAgXCJza2lwXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLnNraXBcIilcbiAgICAgIFwiaGVscFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5oZWxwXCIpXG5cbiAgIyB3aGVuIGEgcXVlc3Rpb24gaXMgYW5zd2VyZWRcbiAgb25RdWVzdGlvbkFuc3dlcjogKGVsZW1lbnQpIC0+XG4jICAgIGNvbnNvbGUubG9nKFwib25RdWVzdGlvbkFuc3dlciBAcmVuZGVyQ291bnQ6XCIgKyBAcmVuZGVyQ291bnQgKyBcIiAgQHF1ZXN0aW9ucy5sZW5ndGg6IFwiICsgIEBxdWVzdGlvbnMubGVuZ3RoKVxuIyAgICB0aGlzIGlzIG5vdCBnb29kLiBTaG91bGQgdGVzdCBmb3IgPT1cbiAgICByZXR1cm4gdW5sZXNzIEByZW5kZXJDb3VudCA+PSBAcXVlc3Rpb25zLmxlbmd0aFxuXG4gICAgIyBhdXRvIHN0b3AgYWZ0ZXIgbGltaXRcbiAgICBAYXV0b3N0b3BwZWQgICAgPSBmYWxzZVxuICAgIGF1dG9zdG9wTGltaXQgICA9IEBtb2RlbC5nZXROdW1iZXIgXCJhdXRvc3RvcExpbWl0XCJcbiAgICBsb25nZXN0U2VxdWVuY2UgPSAwXG4gICAgYXV0b3N0b3BDb3VudCAgID0gMFxuXG4gICAgaWYgYXV0b3N0b3BMaW1pdCA+IDBcbiAgICAgIGZvciBpIGluIFsxLi5AcXVlc3Rpb25WaWV3cy5sZW5ndGhdICMganVzdCBpbiBjYXNlIHRoZXkgY2FuJ3QgY291bnRcbiAgICAgICAgY3VycmVudEFuc3dlciA9IEBxdWVzdGlvblZpZXdzW2ktMV0uYW5zd2VyXG4gICAgICAgIGlmIGN1cnJlbnRBbnN3ZXIgPT0gXCIwXCIgb3IgY3VycmVudEFuc3dlciA9PSBcIjlcIlxuICAgICAgICAgIGF1dG9zdG9wQ291bnQrK1xuICAgICAgICBlbHNlXG4gICAgICAgICAgYXV0b3N0b3BDb3VudCA9IDBcbiAgICAgICAgbG9uZ2VzdFNlcXVlbmNlID0gTWF0aC5tYXgobG9uZ2VzdFNlcXVlbmNlLCBhdXRvc3RvcENvdW50KVxuICAgICAgICAjIGlmIHRoZSB2YWx1ZSBpcyBzZXQsIHdlJ3ZlIGdvdCBhIHRocmVzaG9sZCBleGNlZWRpbmcgcnVuLCBhbmQgaXQncyBub3QgYWxyZWFkeSBhdXRvc3RvcHBlZFxuICAgICAgICBpZiBhdXRvc3RvcExpbWl0ICE9IDAgJiYgbG9uZ2VzdFNlcXVlbmNlID49IGF1dG9zdG9wTGltaXQgJiYgbm90IEBhdXRvc3RvcHBlZFxuICAgICAgICAgIEBhdXRvc3RvcHBlZCA9IHRydWVcbiAgICAgICAgICBAYXV0b3N0b3BJbmRleCA9IGlcbiAgICBAdXBkYXRlQXV0b3N0b3AoKVxuICAgIEB1cGRhdGVTa2lwTG9naWMoKVxuXG4gIHVwZGF0ZUF1dG9zdG9wOiAtPlxuICAgIGF1dG9zdG9wTGltaXQgPSBAbW9kZWwuZ2V0TnVtYmVyIFwiYXV0b3N0b3BMaW1pdFwiXG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAodmlldywgaSkgLT5cbiAgICAgIGlmIGkgPiAoQGF1dG9zdG9wSW5kZXggLSAxKVxuICAgICAgICBpZiBAYXV0b3N0b3BwZWRcbiAgICAgICAgICB2aWV3LmlzQXV0b3N0b3BwZWQgPSB0cnVlXG4gICAgICAgICAgdmlldy4kZWwuYWRkQ2xhc3MgICAgXCJkaXNhYmxlZF9hdXRvc3RvcFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB2aWV3LmlzQXV0b3N0b3BwZWQgPSBmYWxzZVxuICAgICAgICAgIHZpZXcuJGVsLnJlbW92ZUNsYXNzIFwiZGlzYWJsZWRfYXV0b3N0b3BcIlxuICAgICwgQFxuXG4gIHVwZGF0ZVNraXBMb2dpYzogLT5cbiMgICAgY29uc29sZS5sb2coXCJ1cGRhdGVTa2lwTG9naWNcIilcbiMgICAgY29uc29sZS5sb2coXCJAcXVlc3Rpb25WaWV3c1wiICsgQHF1ZXN0aW9uVmlld3MubGVuZ3RoKVxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHF2KSAtPlxuICAgICAgcXVlc3Rpb24gPSBxdi5tb2RlbFxuICAgICAgc2tpcExvZ2ljQ29kZSA9IHF1ZXN0aW9uLmdldFN0cmluZyBcInNraXBMb2dpY1wiXG4gICAgICB1bmxlc3Mgc2tpcExvZ2ljQ29kZSBpcyBcIlwiXG4gICAgICAgIHRyeVxuICAgICAgICAgIHJlc3VsdCA9IENvZmZlZVNjcmlwdC5ldmFsLmFwcGx5KEAsIFtza2lwTG9naWNDb2RlXSlcbiMgICAgICAgICAgY29uc29sZS5sb2coXCJza2lwTG9naWNDb2RlOiBcIiArIHNraXBMb2dpY0NvZGUpXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgbmFtZSA9ICgoL2Z1bmN0aW9uICguezEsfSlcXCgvKS5leGVjKGVycm9yLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkpWzFdKVxuICAgICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgICAgYWxlcnQgXCJTa2lwIGxvZ2ljIGVycm9yIGluIHF1ZXN0aW9uICN7cXVlc3Rpb24uZ2V0KCduYW1lJyl9XFxuXFxuI3tuYW1lfVxcblxcbiN7bWVzc2FnZX1cIlxuXG4gICAgICAgIGlmIHJlc3VsdFxuICAgICAgICAgIHF2LiRlbC5hZGRDbGFzcyBcImRpc2FibGVkX3NraXBwZWRcIlxuICAgICAgICAgIHF2LmlzU2tpcHBlZCA9IHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHF2LiRlbC5yZW1vdmVDbGFzcyBcImRpc2FibGVkX3NraXBwZWRcIlxuICAgICAgICAgIHF2LmlzU2tpcHBlZCA9IGZhbHNlXG4gICAgICBxdi51cGRhdGVWYWxpZGl0eSgpXG4gICAgLCBAXG5cbiAgaXNWYWxpZDogKHZpZXdzID0gQHF1ZXN0aW9uVmlld3MpIC0+XG4gICAgcmV0dXJuIHRydWUgaWYgbm90IHZpZXdzPyAjIGlmIHRoZXJlJ3Mgbm90aGluZyB0byBjaGVjaywgaXQgbXVzdCBiZSBnb29kXG4gICAgdmlld3MgPSBbdmlld3NdIGlmIG5vdCBfLmlzQXJyYXkodmlld3MpXG4gICAgZm9yIHF2LCBpIGluIHZpZXdzXG4gICAgICBxdi51cGRhdGVWYWxpZGl0eSgpXG4gICAgICAjIGNhbiB3ZSBza2lwIGl0P1xuICAgICAgaWYgbm90IHF2Lm1vZGVsLmdldEJvb2xlYW4oXCJza2lwcGFibGVcIilcbiAgICAgICAgIyBpcyBpdCB2YWxpZFxuICAgICAgICBpZiBub3QgcXYuaXNWYWxpZFxuICAgICAgICAgICMgcmVkIGFsZXJ0ISFcbiMgICAgICAgICAgY29uc29sZS5sb2coXCJwb3AgdXAgYW4gZXJyb3JcIilcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiMgICAgLCBAXG4gICAgcmV0dXJuIHRydWVcblxuICB0ZXN0VmFsaWQ6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwiU3VydmV5UmluSXRlbSB0ZXN0VmFsaWQuXCIpXG4jICAgIGlmIG5vdCBAcHJvdG90eXBlUmVuZGVyZWQgdGhlbiByZXR1cm4gZmFsc2VcbiMgICAgY3VycmVudFZpZXcgPSBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXdcbiMgICAgaWYgQGlzVmFsaWQ/XG4jICAgIGNvbnNvbGUubG9nKFwidGVzdHZhbGlkOiBcIiArIEBpc1ZhbGlkPylcbiAgICByZXR1cm4gQGlzVmFsaWQoKVxuIyAgICBlbHNlXG4jICAgICAgcmV0dXJuIGZhbHNlXG4jICAgIHRydWVcblxuXG4gICMgQFRPRE8gdGhpcyBzaG91bGQgcHJvYmFibHkgYmUgcmV0dXJuaW5nIG11bHRpcGxlLCBzaW5nbGUgdHlwZSBoYXNoIHZhbHVlc1xuICBnZXRTa2lwcGVkOiAtPlxuICAgIHJlc3VsdCA9IHt9XG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAocXYsIGkpIC0+XG4gICAgICByZXN1bHRbQHF1ZXN0aW9ucy5tb2RlbHNbaV0uZ2V0KFwibmFtZVwiKV0gPSBcInNraXBwZWRcIlxuICAgICwgQFxuICAgIHJldHVybiByZXN1bHRcblxuICBnZXRSZXN1bHQ6IC0+XG4gICAgcmVzdWx0ID0ge31cbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoIChxdiwgaSkgLT5cbiMgICAgICByZXN1bHRbQHF1ZXN0aW9ucy5tb2RlbHNbaV0uZ2V0KFwibmFtZVwiKV0gPVxuICAgICAgcmVzdWx0W3F2Lm5hbWVdID1cbiAgICAgICAgaWYgcXYubm90QXNrZWQgIyBiZWNhdXNlIG9mIGdyaWQgc2NvcmVcbiAgICAgICAgICBxdi5ub3RBc2tlZFJlc3VsdFxuICAgICAgICBlbHNlIGlmIG5vdCBfLmlzRW1wdHkocXYuYW5zd2VyKSAjIHVzZSBhbnN3ZXJcbiAgICAgICAgICBxdi5hbnN3ZXJcbiAgICAgICAgZWxzZSBpZiBxdi5za2lwcGVkXG4gICAgICAgICAgcXYuc2tpcHBlZFJlc3VsdFxuICAgICAgICBlbHNlIGlmIHF2LmlzU2tpcHBlZFxuICAgICAgICAgIHF2LmxvZ2ljU2tpcHBlZFJlc3VsdFxuICAgICAgICBlbHNlIGlmIHF2LmlzQXV0b3N0b3BwZWRcbiAgICAgICAgICBxdi5ub3RBc2tlZEF1dG9zdG9wUmVzdWx0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBxdi5hbnN3ZXJcbiAgICAsIEBcbiAgICBoYXNoID0gQG1vZGVsLmdldChcImhhc2hcIikgaWYgQG1vZGVsLmhhcyhcImhhc2hcIilcbiAgICBzdWJ0ZXN0UmVzdWx0ID1cbiAgICAgICdib2R5JyA6IHJlc3VsdFxuICAgICAgJ21ldGEnIDpcbiAgICAgICAgJ2hhc2gnIDogaGFzaFxuIyAgICByZXR1cm4gcmVzdWx0XG5cbiAgc2hvd0Vycm9yczogKHZpZXdzID0gQHF1ZXN0aW9uVmlld3MpIC0+XG4gICAgQCRlbC5maW5kKCcubWVzc2FnZScpLnJlbW92ZSgpXG4gICAgZmlyc3QgPSB0cnVlXG4gICAgdmlld3MgPSBbdmlld3NdIGlmIG5vdCBfLmlzQXJyYXkodmlld3MpXG4gICAgdmlld3MuZm9yRWFjaCAocXYsIGkpIC0+XG4gICAgICBpZiBub3QgXy5pc1N0cmluZyhxdilcbiAgICAgICAgbWVzc2FnZSA9IFwiXCJcbiAgICAgICAgaWYgbm90IHF2LmlzVmFsaWRcbiAgICAgICAgICAjIGhhbmRsZSBjdXN0b20gdmFsaWRhdGlvbiBlcnJvciBtZXNzYWdlc1xuICAgICAgICAgIGN1c3RvbU1lc3NhZ2UgPSBxdi5tb2RlbC5nZXQoXCJjdXN0b21WYWxpZGF0aW9uTWVzc2FnZVwiKVxuICAgICAgICAgIGlmIG5vdCBfLmlzRW1wdHkoY3VzdG9tTWVzc2FnZSlcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBjdXN0b21NZXNzYWdlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgbWVzc2FnZSA9IEB0ZXh0LnBsZWFzZUFuc3dlclxuXG4gICAgICAgICAgaWYgZmlyc3QgPT0gdHJ1ZVxuICAgICAgICAgICAgQHNob3dRdWVzdGlvbihpKSBpZiB2aWV3cyA9PSBAcXVlc3Rpb25WaWV3c1xuICAgICAgICAgICAgcXYuJGVsLnNjcm9sbFRvKClcbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IEB0ZXh0LmNvcnJlY3RFcnJvcnNcbiAgICAgICAgICAgIGZpcnN0ID0gZmFsc2VcbiAgICAgICAgcXYuc2V0TWVzc2FnZSBtZXNzYWdlXG4gICAgLCBAXG5cblxuICBnZXRTdW06IC0+XG4jICAgIGlmIEBwcm90b3R5cGVWaWV3LmdldFN1bT9cbiMgICAgICByZXR1cm4gQHByb3RvdHlwZVZpZXcuZ2V0U3VtKClcbiMgICAgZWxzZVxuIyBtYXliZSBhIGJldHRlciBmYWxsYmFja1xuIyAgICBjb25zb2xlLmxvZyhcIlRoaXMgdmlldyBkb2VzIG5vdCByZXR1cm4gYSBzdW0sIGNvcnJlY3Q/XCIpXG4gICAgcmV0dXJuIHtjb3JyZWN0OjAsaW5jb3JyZWN0OjAsbWlzc2luZzowLHRvdGFsOjB9XG5cbiAgY2hpbGRFdmVudHM6XG4gICAgJ2Fuc3dlciBzY3JvbGwnOiAnb25RdWVzdGlvbkFuc3dlcidcbiAgICAnYW5zd2VyJzogJ29uUXVlc3Rpb25BbnN3ZXInXG4gICAgJ3JlbmRlcmVkJzogJ29uUXVlc3Rpb25SZW5kZXJlZCdcbiAgICAnYWRkOmNoaWxkJzogJ2ZvbydcblxuICBmb286IC0+XG4gICAgY29uc29sZS5sb2coXCJ0ZXN0IDEyMyBTViBjaGlsZCBhZGRcIilcblxuICAjIHBvcHVsYXRlcyBAcXVlc3Rpb25WaWV3cyBmb3IgdGhpcyB2aWV3LlxuICBidWlsZENoaWxkVmlldzogKGNoaWxkLCBDaGlsZFZpZXdDbGFzcywgY2hpbGRWaWV3T3B0aW9ucykgLT5cbiAgICBvcHRpb25zID0gXy5leHRlbmQoe21vZGVsOiBjaGlsZH0sIGNoaWxkVmlld09wdGlvbnMpO1xuICAgIGNoaWxkVmlldyA9IG5ldyBDaGlsZFZpZXdDbGFzcyhvcHRpb25zKVxuICAgIE1hcmlvbmV0dGUuTW9uaXRvckRPTVJlZnJlc2goY2hpbGRWaWV3KTtcbiAgICBAcXVlc3Rpb25WaWV3c1tjaGlsZFZpZXdPcHRpb25zLmluZGV4XSA9IGNoaWxkVmlld1xuIyAgICBjb25zb2xlLmxvZyhcInRoaXMucXVlc3Rpb25JbmRleDpcIiArIHRoaXMucXVlc3Rpb25JbmRleClcbiMgICAgQHF1ZXN0aW9uVmlld3NbQHF1ZXN0aW9uSW5kZXhdID0gY2hpbGRWaWV3XG4jICAgIEBxdWVzdGlvblZpZXdzLnB1c2ggY2hpbGRWaWV3XG4jICAgIGNvbnNvbGUubG9nKFwiY2hpbGRWaWV3T3B0aW9ucy5pbmRleDogXCIgKyBjaGlsZFZpZXdPcHRpb25zLmluZGV4ICsgXCIgQHF1ZXN0aW9uVmlld3MgbGVuOiBcIiArIEBxdWVzdGlvblZpZXdzLmxlbmd0aClcbiAgICByZXR1cm4gY2hpbGRWaWV3XG4gICxcblxuIyAgUGFzc2VzIG9wdGlvbnMgdG8gZWFjaCBjaGlsZFZpZXcgaW5zdGFuY2VcbiAgY2hpbGRWaWV3T3B0aW9uczogKG1vZGVsLCBpbmRleCktPlxuIyAgICBjb25zb2xlLmxvZyhcImluZGV4OiBcIiArIGluZGV4KVxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG4gICAgICBwcmV2aW91cyA9IEBtb2RlbC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG4gICAgbm90QXNrZWRDb3VudCA9IDBcbiAgICByZXF1aXJlZCA9IG1vZGVsLmdldE51bWJlciBcImxpbmtlZEdyaWRTY29yZVwiXG5cbiAgICBpc05vdEFza2VkID0gKCAoIHJlcXVpcmVkICE9IDAgJiYgQG1vZGVsLnBhcmVudC5nZXRHcmlkU2NvcmUoKSA8IHJlcXVpcmVkICkgfHwgQG1vZGVsLnBhcmVudC5ncmlkV2FzQXV0b3N0b3BwZWQoKSApICYmIEBtb2RlbC5wYXJlbnQuZ2V0R3JpZFNjb3JlKCkgIT0gZmFsc2VcblxuICAgIGlmIGlzTm90QXNrZWQgdGhlbiBub3RBc2tlZENvdW50KytcblxuICAgIG5hbWUgICA9IG1vZGVsLmVzY2FwZShcIm5hbWVcIikucmVwbGFjZSAvW15BLVphLXowLTlfXS9nLCBcIi1cIlxuICAgIGFuc3dlciA9IHByZXZpb3VzW25hbWVdIGlmIHByZXZpb3VzXG4gICAgbGFiZWxzID0ge31cbiAgICBsYWJlbHMudGV4dCA9IEB0ZXh0XG4gICAgbW9kZWwuc2V0KCdsYWJlbHMnLCBsYWJlbHMpXG4gICAgb3B0aW9ucyA9XG4gICAgICBtb2RlbCAgICAgICAgIDogbW9kZWxcbiAgICAgIHBhcmVudCAgICAgICAgOiBAXG4gICAgICBkYXRhRW50cnkgICAgIDogQGRhdGFFbnRyeVxuICAgICAgbm90QXNrZWQgICAgICA6IGlzTm90QXNrZWRcbiAgICAgIGlzT2JzZXJ2YXRpb24gOiBAaXNPYnNlcnZhdGlvblxuICAgICAgYW5zd2VyICAgICAgICA6IGFuc3dlclxuICAgICAgaW5kZXggIDogaW5kZXhcbiAgICByZXR1cm4gb3B0aW9uc1xuXG4gIG9uQmVmb3JlUmVuZGVyOiAtPlxuIyAgICBAcXVlc3Rpb25zLnNvcnQoKVxuXG4gIG9uUmVuZGVyOiAtPlxuIyAgICBAb25SZW5kZXJDb2xsZWN0aW9uKClcbiMgICAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiMgICAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcbiMgICAgQHVwZGF0ZVNraXBMb2dpYygpXG4gICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4jICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuIyAgICBAbGlzdGVuVG8gb25lVmlldywgXCJhbnN3ZXIgc2Nyb2xsXCIsIEBvblF1ZXN0aW9uQW5zd2VyXG5cbiAgb25SZW5kZXJDb2xsZWN0aW9uOi0+XG4gICAgaWYgQGZvY3VzTW9kZVxuICAgICAgJCgnI3N1YnRlc3Rfd3JhcHBlcicpLmFmdGVyICQgXCJcbiAgICAgICAgICAgIDxkaXYgaWQ9J3N1bW1hcnlfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gcHJldl9xdWVzdGlvbic+I3tAdGV4dC5wcmV2aW91c1F1ZXN0aW9ufTwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBuZXh0X3F1ZXN0aW9uJz4je0B0ZXh0Lm5leHRRdWVzdGlvbn08L2J1dHRvbj5cbiAgICAgICAgICBcIlxuICAgIEB1cGRhdGVFeGVjdXRlUmVhZHkodHJ1ZSlcbiAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcbiMgICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4gICAgQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG5cbiAgb25RdWVzdGlvblJlbmRlcmVkOi0+XG4jICAgIGNvbnNvbGUubG9nKFwib25RdWVzdGlvblJlbmRlcmVkIEByZW5kZXJDb3VudDogXCIgKyBAcmVuZGVyQ291bnQpXG4gICAgQHJlbmRlckNvdW50KytcbiMgICAgY29uc29sZS5sb2coXCJvblF1ZXN0aW9uUmVuZGVyZWQgQHJlbmRlckNvdW50IGluY3JlbWVudGVkOiBcIiArIEByZW5kZXJDb3VudClcbiAgICBpZiBAcmVuZGVyQ291bnQgPT0gQHF1ZXN0aW9ucy5sZW5ndGhcbiAgICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuICAgICAgQHVwZGF0ZVNraXBMb2dpYygpXG4jICAgICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4jICAgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG4jICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4jICBvblNob3c6LT5cbiMgICAgY29uc29sZS5sb2coXCJpU2hvd24hXCIpXG4jICAgIEBvblJlbmRlckNvbGxlY3Rpb24oKVxuXG4gIG9uQ2xvc2U6LT5cbiAgICBmb3IgcXYgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgIHF2LmNsb3NlPygpXG4gICAgQHF1ZXN0aW9uVmlld3MgPSBbXVxuXG4gIHJlc2V0OiAoaW5jcmVtZW50KSAtPlxuICAgIGNvbnNvbGUubG9nKFwicmVzZXRcIilcbiAgICBAcmVuZGVyZWQuc3VidGVzdCA9IGZhbHNlXG4gICAgQHJlbmRlcmVkLmFzc2Vzc21lbnQgPSBmYWxzZVxuICAgICMgICAgY3VycmVudFZpZXcgPSBAc3VidGVzdFZpZXdzW0BvcmRlck1hcFtAaW5kZXhdXVxuICAgICMgICAgY3VycmVudFZpZXcuY2xvc2UoKVxuICAgIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlldy5jbG9zZSgpO1xuICAgIEBpbmRleCA9XG4gICAgICBpZiBAYWJvcnRBc3Nlc3NtZW50ID09IHRydWVcbiAgICAgICAgQHN1YnRlc3RWaWV3cy5sZW5ndGgtMVxuICAgICAgZWxzZVxuICAgICAgICBAaW5kZXggKyBpbmNyZW1lbnRcbiAgICBAcmVuZGVyKClcbiAgICB3aW5kb3cuc2Nyb2xsVG8gMCwgMFxuIl19

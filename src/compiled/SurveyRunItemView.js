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
    'rendered': 'onQuestionRendered',
    'add:child': 'foo',
    'collection:rendered': 'foo'
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1bkl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzhCQUVKLFFBQUEsR0FBVSxHQUFJLENBQUEsUUFBQTs7OEJBQ2QsU0FBQSxHQUFXOzs4QkFDWCxPQUFBLEdBQVM7OzhCQUNULFNBQUEsR0FBVzs7OEJBRVgsTUFBQSxHQUNFO0lBQUEsc0JBQUEsRUFBeUIsY0FBekI7SUFDQSxzQkFBQSxFQUF5QixjQUR6Qjs7OzhCQUdGLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFFVixRQUFBO0lBQUEsSUFBQyxDQUFBLEtBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxNQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFDeEIsSUFBQyxDQUFBLFNBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxhQUFELEdBQWlCLE9BQU8sQ0FBQztJQUN6QixJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBa0IsV0FBbEI7SUFDakIsSUFBc0IsSUFBQyxDQUFBLFNBQXZCO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsRUFBakI7O0lBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFdBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFJakIsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUtBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUNyQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQTtJQVdkLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBbkIsR0FBb0M7SUFDcEMsTUFBQSxHQUFTO0lBQ1QsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENB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O0VBYks7Ozs7R0FoYXVCLFFBQVEsQ0FBQyxVQUFVLENBQUMiLCJmaWxlIjoibW9kdWxlcy9zdWJ0ZXN0L3Byb3RvdHlwZXMvU3VydmV5UnVuSXRlbVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdXJ2ZXlSdW5JdGVtVmlldyBleHRlbmRzIEJhY2tib25lLk1hcmlvbmV0dGUuQ29tcG9zaXRlVmlld1xuXG4gIHRlbXBsYXRlOiBKU1RbXCJTdXJ2ZXlcIl0sXG4gIGNoaWxkVmlldzogUXVlc3Rpb25SdW5JdGVtVmlldyxcbiAgdGFnTmFtZTogXCJwXCIsXG4gIGNsYXNzTmFtZTogXCJTdXJ2ZXlSdW5JdGVtVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAubmV4dF9xdWVzdGlvbicgOiAnbmV4dFF1ZXN0aW9uJ1xuICAgICdjbGljayAucHJldl9xdWVzdGlvbicgOiAncHJldlF1ZXN0aW9uJ1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQG1vZGVsICAgICAgICAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCAgICAgICAgPSBAbW9kZWwucGFyZW50XG4gICAgQGRhdGFFbnRyeSAgICAgPSBvcHRpb25zLmRhdGFFbnRyeVxuICAgIEBpc09ic2VydmF0aW9uID0gb3B0aW9ucy5pc09ic2VydmF0aW9uXG4gICAgQGZvY3VzTW9kZSAgICAgPSBAbW9kZWwuZ2V0Qm9vbGVhbihcImZvY3VzTW9kZVwiKVxuICAgIEBxdWVzdGlvbkluZGV4ID0gMCBpZiBAZm9jdXNNb2RlXG4gICAgQHF1ZXN0aW9uVmlld3MgPSBbXVxuICAgIEBhbnN3ZXJlZCAgICAgID0gW11cbiAgICBAcmVuZGVyQ291bnQgICA9IDBcbiAgICBAbm90QXNrZWRDb3VudCA9IDBcbiMgICAgQGNoaWxkVmlld09wdGlvbnMgPVxuIyAgICAgICAgcGFyZW50OiB0aGlzXG5cbiAgICBAaTE4bigpXG4jICAgIHRoaXMubGlzdGVuVG8oQG1vZGVsLmNvbGxlY3Rpb24sJ2NoYW5nZScsIHRoaXMudmlld1JlbmRlcilcbiMgICAgICB0aGlzLmxpc3RlblRvKG1vZGVsLmNvbGxlY3Rpb24sICdyZXNldCcsIHRoaXMucmVuZGVyKTtcbiMgICAgaWYgQG1vZGVsLnF1ZXN0aW9ucy5sZW5ndGggPT0gMFxuIyAgICAgIGNvbnNvbGUubG9nKFwiTm8gcXVlc3Rpb25zLlwiKVxuICAgIEBjb2xsZWN0aW9uID0gQG1vZGVsLnF1ZXN0aW9uc1xuICAgIEBxdWVzdGlvbnMgPSBAY29sbGVjdGlvblxuXG4jICAgIEBtb2RlbC5xdWVzdGlvbnMuZmV0Y2hcbiMgICAgICB2aWV3T3B0aW9uczpcbiMgICAgICAgIGtleTogXCJxdWVzdGlvbi0je0Btb2RlbC5pZH1cIlxuIyAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuIyMgICAgICAgIEBtb2RlbC5xdWVzdGlvbnMuc29ydCgpXG4jICAgICAgICBjb2xsZWN0aW9uLnNvcnQoKVxuIyAgICAgICAgQG1vZGVsLmNvbGxlY3Rpb24ubW9kZWxzID0gY29sbGVjdGlvbi5tb2RlbHNcbiMgICAgICAgIEByZW5kZXIoKVxuXG4gICAgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3ID0gQFxuICAgIGxhYmVscyA9IHt9XG4gICAgbGFiZWxzLnRleHQgPSBAdGV4dFxuICAgIEBtb2RlbC5zZXQoJ2xhYmVscycsIGxhYmVscylcblxuICAgIEBza2lwcGFibGUgPSBAbW9kZWwuZ2V0KFwic2tpcHBhYmxlXCIpID09IHRydWUgfHwgQG1vZGVsLmdldChcInNraXBwYWJsZVwiKSA9PSBcInRydWVcIlxuICAgIEBiYWNrYWJsZSA9ICggQG1vZGVsLmdldChcImJhY2tCdXR0b25cIikgPT0gdHJ1ZSB8fCBAbW9kZWwuZ2V0KFwiYmFja0J1dHRvblwiKSA9PSBcInRydWVcIiApIGFuZCBAcGFyZW50LmluZGV4IGlzbnQgMFxuICAgIEBwYXJlbnQuZGlzcGxheVNraXAoQHNraXBwYWJsZSlcbiAgICBAcGFyZW50LmRpc3BsYXlCYWNrKEBiYWNrYWJsZSlcblxuICAgIEBsaXN0ZW5Ub1xuXG4gIHVwZGF0ZVByb2dyZXNzQnV0dG9uczogLT5cblxuICAgIGlzQXZhaWxhYmxlID0gW11cbiAgICBmb3IgcXYsIGkgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgIGlmIHF2P1xuICAgICAgICBpc0F2YWlsYWJsZS5wdXNoIGkgaWYgbm90IChxdi5pc0F1dG9zdG9wcGVkIG9yIHF2LmlzU2tpcHBlZClcbiAgICBpc0F2YWlsYWJsZS5wdXNoIEBxdWVzdGlvbkluZGV4XG5cbiAgICAkcHJldiA9IEBwYXJlbnQuJGVsLmZpbmQoXCIucHJldl9xdWVzdGlvblwiKVxuICAgICRuZXh0ID0gQHBhcmVudC4kZWwuZmluZChcIi5uZXh0X3F1ZXN0aW9uXCIpXG5cbiAgICBtaW5pbXVtID0gTWF0aC5taW4uYXBwbHkoIG1pbmltdW0sIGlzQXZhaWxhYmxlIClcbiAgICBtYXhpbXVtID0gTWF0aC5tYXguYXBwbHkoIG1heGltdW0sIGlzQXZhaWxhYmxlIClcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IG1pbmltdW1cbiAgICAgICRwcmV2LmhpZGUoKVxuICAgIGVsc2VcbiAgICAgICRwcmV2LnNob3coKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggPT0gbWF4aW11bVxuICAgICAgJG5leHQuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgJG5leHQuc2hvdygpXG5cbiAgdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5OiAtPlxuXG4gICAgcmV0dXJuIHVubGVzcyBAbW9kZWwuZ2V0KFwiZm9jdXNNb2RlXCIpXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCA9PSBAcXVlc3Rpb25WaWV3cy5sZW5ndGhcbiMgICAgICAkKFwiI3N1bW1hcnlfY29udGFpbmVyXCIpLmh0bWwgXCJcbiMgICAgICAgIGxhc3QgcGFnZSBoZXJlXG4jICAgICAgXCJcbiAgICAgICQoXCIubmV4dF9xdWVzdGlvblwiKS5oaWRlKClcbiAgICBlbHNlXG4gICAgICAkKFwiI3N1bW1hcnlfY29udGFpbmVyXCIpLmVtcHR5KClcbiAgICAgICQoXCIubmV4dF9xdWVzdGlvblwiKS5zaG93KClcblxuICAgICRxdWVzdGlvbnMgPSBAJGVsLmZpbmQoXCIucXVlc3Rpb25cIilcbiAgICAkcXVlc3Rpb25zLmhpZGUoKVxuICAgICRxdWVzdGlvbnMuZXEoQHF1ZXN0aW9uSW5kZXgpLnNob3coKVxuXG4gICAgIyB0cmlnZ2VyIHRoZSBxdWVzdGlvbiB0byBydW4gaXQncyBkaXNwbGF5IGNvZGUgaWYgdGhlIHN1YnRlc3QncyBkaXNwbGF5Y29kZSBoYXMgYWxyZWFkeSByYW5cbiAgICAjIGlmIG5vdCwgYWRkIGl0IHRvIGEgbGlzdCB0byBydW4gbGF0ZXIuXG4gICAgaWYgQGV4ZWN1dGVSZWFkeVxuICAgICAgQHF1ZXN0aW9uVmlld3NbQHF1ZXN0aW9uSW5kZXhdLnRyaWdnZXIgXCJzaG93XCJcbiAgICBlbHNlXG4gICAgICBAdHJpZ2dlclNob3dMaXN0ID0gW10gaWYgbm90IEB0cmlnZ2VyU2hvd0xpc3RcbiAgICAgIEB0cmlnZ2VyU2hvd0xpc3QucHVzaCBAcXVlc3Rpb25JbmRleFxuXG4gIHNob3dRdWVzdGlvbjogKGluZGV4KSAtPlxuICAgIEBxdWVzdGlvbkluZGV4ID0gaW5kZXggaWYgXy5pc051bWJlcihpbmRleCkgJiYgaW5kZXggPCBAcXVlc3Rpb25WaWV3cy5sZW5ndGggJiYgaW5kZXggPiAwXG4gICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4jICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuXG4gIHVwZGF0ZUV4ZWN1dGVSZWFkeTogKHJlYWR5KSAtPlxuICAgIEBleGVjdXRlUmVhZHkgPSByZWFkeVxuXG4gICAgcmV0dXJuIGlmIG5vdCBAdHJpZ2dlclNob3dMaXN0P1xuXG4gICAgaWYgQHRyaWdnZXJTaG93TGlzdC5sZW5ndGggPiAwXG4gICAgICBmb3IgaW5kZXggaW4gQHRyaWdnZXJTaG93TGlzdFxuICAgICAgICBAcXVlc3Rpb25WaWV3c1tpbmRleF0/LnRyaWdnZXIgXCJzaG93XCJcbiAgICAgIEB0cmlnZ2VyU2hvd0xpc3QgPSBbXVxuXG4gICAgQHVwZGF0ZVNraXBMb2dpYygpIGlmIEBleGVjdXRlUmVhZHlcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIHBsZWFzZUFuc3dlciA6IHQoXCJTdXJ2ZXlSdW5WaWV3Lm1lc3NhZ2UucGxlYXNlX2Fuc3dlclwiKVxuICAgICAgY29ycmVjdEVycm9ycyA6IHQoXCJTdXJ2ZXlSdW5WaWV3Lm1lc3NhZ2UuY29ycmVjdF9lcnJvcnNcIilcbiAgICAgIG5vdEVub3VnaCA6IF8odChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5ub3RfZW5vdWdoXCIpKS5lc2NhcGUoKVxuXG4gICAgICBwcmV2aW91c1F1ZXN0aW9uIDogdChcIlN1cnZleVJ1blZpZXcuYnV0dG9uLnByZXZpb3VzX3F1ZXN0aW9uXCIpXG4gICAgICBuZXh0UXVlc3Rpb24gOiB0KFwiU3VydmV5UnVuVmlldy5idXR0b24ubmV4dF9xdWVzdGlvblwiKVxuICAgICAgXCJuZXh0XCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLm5leHRcIilcbiAgICAgIFwiYmFja1wiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5iYWNrXCIpXG4gICAgICBcInNraXBcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uc2tpcFwiKVxuICAgICAgXCJoZWxwXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLmhlbHBcIilcblxuICAjIHdoZW4gYSBxdWVzdGlvbiBpcyBhbnN3ZXJlZFxuICBvblF1ZXN0aW9uQW5zd2VyOiAoZWxlbWVudCkgLT5cbiMgICAgY29uc29sZS5sb2coXCJvblF1ZXN0aW9uQW5zd2VyIEByZW5kZXJDb3VudDpcIiArIEByZW5kZXJDb3VudCArIFwiICBAcXVlc3Rpb25zLmxlbmd0aDogXCIgKyAgQHF1ZXN0aW9ucy5sZW5ndGgpXG4jICAgIHRoaXMgaXMgbm90IGdvb2QuIFNob3VsZCB0ZXN0IGZvciA9PVxuICAgIHJldHVybiB1bmxlc3MgQHJlbmRlckNvdW50ID49IEBxdWVzdGlvbnMubGVuZ3RoXG5cbiAgICAjIGF1dG8gc3RvcCBhZnRlciBsaW1pdFxuICAgIEBhdXRvc3RvcHBlZCAgICA9IGZhbHNlXG4gICAgYXV0b3N0b3BMaW1pdCAgID0gQG1vZGVsLmdldE51bWJlciBcImF1dG9zdG9wTGltaXRcIlxuICAgIGxvbmdlc3RTZXF1ZW5jZSA9IDBcbiAgICBhdXRvc3RvcENvdW50ICAgPSAwXG5cbiAgICBpZiBhdXRvc3RvcExpbWl0ID4gMFxuICAgICAgZm9yIGkgaW4gWzEuLkBxdWVzdGlvblZpZXdzLmxlbmd0aF0gIyBqdXN0IGluIGNhc2UgdGhleSBjYW4ndCBjb3VudFxuICAgICAgICBjdXJyZW50QW5zd2VyID0gQHF1ZXN0aW9uVmlld3NbaS0xXS5hbnN3ZXJcbiAgICAgICAgaWYgY3VycmVudEFuc3dlciA9PSBcIjBcIiBvciBjdXJyZW50QW5zd2VyID09IFwiOVwiXG4gICAgICAgICAgYXV0b3N0b3BDb3VudCsrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhdXRvc3RvcENvdW50ID0gMFxuICAgICAgICBsb25nZXN0U2VxdWVuY2UgPSBNYXRoLm1heChsb25nZXN0U2VxdWVuY2UsIGF1dG9zdG9wQ291bnQpXG4gICAgICAgICMgaWYgdGhlIHZhbHVlIGlzIHNldCwgd2UndmUgZ290IGEgdGhyZXNob2xkIGV4Y2VlZGluZyBydW4sIGFuZCBpdCdzIG5vdCBhbHJlYWR5IGF1dG9zdG9wcGVkXG4gICAgICAgIGlmIGF1dG9zdG9wTGltaXQgIT0gMCAmJiBsb25nZXN0U2VxdWVuY2UgPj0gYXV0b3N0b3BMaW1pdCAmJiBub3QgQGF1dG9zdG9wcGVkXG4gICAgICAgICAgQGF1dG9zdG9wcGVkID0gdHJ1ZVxuICAgICAgICAgIEBhdXRvc3RvcEluZGV4ID0gaVxuICAgIEB1cGRhdGVBdXRvc3RvcCgpXG4gICAgQHVwZGF0ZVNraXBMb2dpYygpXG5cbiAgdXBkYXRlQXV0b3N0b3A6IC0+XG4gICAgYXV0b3N0b3BMaW1pdCA9IEBtb2RlbC5nZXROdW1iZXIgXCJhdXRvc3RvcExpbWl0XCJcbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoICh2aWV3LCBpKSAtPlxuICAgICAgaWYgaSA+IChAYXV0b3N0b3BJbmRleCAtIDEpXG4gICAgICAgIGlmIEBhdXRvc3RvcHBlZFxuICAgICAgICAgIHZpZXcuaXNBdXRvc3RvcHBlZCA9IHRydWVcbiAgICAgICAgICB2aWV3LiRlbC5hZGRDbGFzcyAgICBcImRpc2FibGVkX2F1dG9zdG9wXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpZXcuaXNBdXRvc3RvcHBlZCA9IGZhbHNlXG4gICAgICAgICAgdmlldy4kZWwucmVtb3ZlQ2xhc3MgXCJkaXNhYmxlZF9hdXRvc3RvcFwiXG4gICAgLCBAXG5cbiAgdXBkYXRlU2tpcExvZ2ljOiAtPlxuIyAgICBjb25zb2xlLmxvZyhcInVwZGF0ZVNraXBMb2dpY1wiKVxuIyAgICBjb25zb2xlLmxvZyhcIkBxdWVzdGlvblZpZXdzXCIgKyBAcXVlc3Rpb25WaWV3cy5sZW5ndGgpXG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAocXYpIC0+XG4gICAgICBxdWVzdGlvbiA9IHF2Lm1vZGVsXG4gICAgICBza2lwTG9naWNDb2RlID0gcXVlc3Rpb24uZ2V0U3RyaW5nIFwic2tpcExvZ2ljXCJcbiAgICAgIHVubGVzcyBza2lwTG9naWNDb2RlIGlzIFwiXCJcbiAgICAgICAgdHJ5XG4gICAgICAgICAgcmVzdWx0ID0gQ29mZmVlU2NyaXB0LmV2YWwuYXBwbHkoQCwgW3NraXBMb2dpY0NvZGVdKVxuIyAgICAgICAgICBjb25zb2xlLmxvZyhcInNraXBMb2dpY0NvZGU6IFwiICsgc2tpcExvZ2ljQ29kZSlcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICBuYW1lID0gKCgvZnVuY3Rpb24gKC57MSx9KVxcKC8pLmV4ZWMoZXJyb3IuY29uc3RydWN0b3IudG9TdHJpbmcoKSlbMV0pXG4gICAgICAgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgICBhbGVydCBcIlNraXAgbG9naWMgZXJyb3IgaW4gcXVlc3Rpb24gI3txdWVzdGlvbi5nZXQoJ25hbWUnKX1cXG5cXG4je25hbWV9XFxuXFxuI3ttZXNzYWdlfVwiXG5cbiAgICAgICAgaWYgcmVzdWx0XG4gICAgICAgICAgcXYuJGVsLmFkZENsYXNzIFwiZGlzYWJsZWRfc2tpcHBlZFwiXG4gICAgICAgICAgcXYuaXNTa2lwcGVkID0gdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcXYuJGVsLnJlbW92ZUNsYXNzIFwiZGlzYWJsZWRfc2tpcHBlZFwiXG4gICAgICAgICAgcXYuaXNTa2lwcGVkID0gZmFsc2VcbiAgICAgIHF2LnVwZGF0ZVZhbGlkaXR5KClcbiAgICAsIEBcblxuICBpc1ZhbGlkOiAodmlld3MgPSBAcXVlc3Rpb25WaWV3cykgLT5cbiAgICByZXR1cm4gdHJ1ZSBpZiBub3Qgdmlld3M/ICMgaWYgdGhlcmUncyBub3RoaW5nIHRvIGNoZWNrLCBpdCBtdXN0IGJlIGdvb2RcbiAgICB2aWV3cyA9IFt2aWV3c10gaWYgbm90IF8uaXNBcnJheSh2aWV3cylcbiAgICBmb3IgcXYsIGkgaW4gdmlld3NcbiAgICAgIHF2LnVwZGF0ZVZhbGlkaXR5KClcbiAgICAgICMgY2FuIHdlIHNraXAgaXQ/XG4gICAgICBpZiBub3QgcXYubW9kZWwuZ2V0Qm9vbGVhbihcInNraXBwYWJsZVwiKVxuICAgICAgICAjIGlzIGl0IHZhbGlkXG4gICAgICAgIGlmIG5vdCBxdi5pc1ZhbGlkXG4gICAgICAgICAgIyByZWQgYWxlcnQhIVxuIyAgICAgICAgICBjb25zb2xlLmxvZyhcInBvcCB1cCBhbiBlcnJvclwiKVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuIyAgICAsIEBcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHRlc3RWYWxpZDogLT5cbiMgICAgY29uc29sZS5sb2coXCJTdXJ2ZXlSaW5JdGVtIHRlc3RWYWxpZC5cIilcbiMgICAgaWYgbm90IEBwcm90b3R5cGVSZW5kZXJlZCB0aGVuIHJldHVybiBmYWxzZVxuIyAgICBjdXJyZW50VmlldyA9IFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1xuIyAgICBpZiBAaXNWYWxpZD9cbiMgICAgY29uc29sZS5sb2coXCJ0ZXN0dmFsaWQ6IFwiICsgQGlzVmFsaWQ/KVxuICAgIHJldHVybiBAaXNWYWxpZCgpXG4jICAgIGVsc2VcbiMgICAgICByZXR1cm4gZmFsc2VcbiMgICAgdHJ1ZVxuXG5cbiAgIyBAVE9ETyB0aGlzIHNob3VsZCBwcm9iYWJseSBiZSByZXR1cm5pbmcgbXVsdGlwbGUsIHNpbmdsZSB0eXBlIGhhc2ggdmFsdWVzXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgcmVzdWx0ID0ge31cbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoIChxdiwgaSkgLT5cbiAgICAgIHJlc3VsdFtAcXVlc3Rpb25zLm1vZGVsc1tpXS5nZXQoXCJuYW1lXCIpXSA9IFwic2tpcHBlZFwiXG4gICAgLCBAXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIGdldFJlc3VsdDogLT5cbiAgICByZXN1bHQgPSB7fVxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuIyAgICAgIHJlc3VsdFtAcXVlc3Rpb25zLm1vZGVsc1tpXS5nZXQoXCJuYW1lXCIpXSA9XG4gICAgICByZXN1bHRbcXYubmFtZV0gPVxuICAgICAgICBpZiBxdi5ub3RBc2tlZCAjIGJlY2F1c2Ugb2YgZ3JpZCBzY29yZVxuICAgICAgICAgIHF2Lm5vdEFza2VkUmVzdWx0XG4gICAgICAgIGVsc2UgaWYgbm90IF8uaXNFbXB0eShxdi5hbnN3ZXIpICMgdXNlIGFuc3dlclxuICAgICAgICAgIHF2LmFuc3dlclxuICAgICAgICBlbHNlIGlmIHF2LnNraXBwZWRcbiAgICAgICAgICBxdi5za2lwcGVkUmVzdWx0XG4gICAgICAgIGVsc2UgaWYgcXYuaXNTa2lwcGVkXG4gICAgICAgICAgcXYubG9naWNTa2lwcGVkUmVzdWx0XG4gICAgICAgIGVsc2UgaWYgcXYuaXNBdXRvc3RvcHBlZFxuICAgICAgICAgIHF2Lm5vdEFza2VkQXV0b3N0b3BSZXN1bHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHF2LmFuc3dlclxuICAgICwgQFxuICAgIGhhc2ggPSBAbW9kZWwuZ2V0KFwiaGFzaFwiKSBpZiBAbW9kZWwuaGFzKFwiaGFzaFwiKVxuICAgIHN1YnRlc3RSZXN1bHQgPVxuICAgICAgJ2JvZHknIDogcmVzdWx0XG4gICAgICAnbWV0YScgOlxuICAgICAgICAnaGFzaCcgOiBoYXNoXG4jICAgIHJldHVybiByZXN1bHRcblxuICBzaG93RXJyb3JzOiAodmlld3MgPSBAcXVlc3Rpb25WaWV3cykgLT5cbiAgICBAJGVsLmZpbmQoJy5tZXNzYWdlJykucmVtb3ZlKClcbiAgICBmaXJzdCA9IHRydWVcbiAgICB2aWV3cyA9IFt2aWV3c10gaWYgbm90IF8uaXNBcnJheSh2aWV3cylcbiAgICB2aWV3cy5mb3JFYWNoIChxdiwgaSkgLT5cbiAgICAgIGlmIG5vdCBfLmlzU3RyaW5nKHF2KVxuICAgICAgICBtZXNzYWdlID0gXCJcIlxuICAgICAgICBpZiBub3QgcXYuaXNWYWxpZFxuICAgICAgICAgICMgaGFuZGxlIGN1c3RvbSB2YWxpZGF0aW9uIGVycm9yIG1lc3NhZ2VzXG4gICAgICAgICAgY3VzdG9tTWVzc2FnZSA9IHF2Lm1vZGVsLmdldChcImN1c3RvbVZhbGlkYXRpb25NZXNzYWdlXCIpXG4gICAgICAgICAgaWYgbm90IF8uaXNFbXB0eShjdXN0b21NZXNzYWdlKVxuICAgICAgICAgICAgbWVzc2FnZSA9IGN1c3RvbU1lc3NhZ2VcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBtZXNzYWdlID0gQHRleHQucGxlYXNlQW5zd2VyXG5cbiAgICAgICAgICBpZiBmaXJzdCA9PSB0cnVlXG4gICAgICAgICAgICBAc2hvd1F1ZXN0aW9uKGkpIGlmIHZpZXdzID09IEBxdWVzdGlvblZpZXdzXG4gICAgICAgICAgICBxdi4kZWwuc2Nyb2xsVG8oKVxuICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgQHRleHQuY29ycmVjdEVycm9yc1xuICAgICAgICAgICAgZmlyc3QgPSBmYWxzZVxuICAgICAgICBxdi5zZXRNZXNzYWdlIG1lc3NhZ2VcbiAgICAsIEBcblxuXG4gIGdldFN1bTogLT5cbiAgICByZXR1cm4ge2NvcnJlY3Q6MCxpbmNvcnJlY3Q6MCxtaXNzaW5nOjAsdG90YWw6MH1cblxuICBjaGlsZEV2ZW50czpcbiAgICAnYW5zd2VyIHNjcm9sbCc6ICdvblF1ZXN0aW9uQW5zd2VyJ1xuICAgICdhbnN3ZXInOiAnb25RdWVzdGlvbkFuc3dlcidcbiAgICAncmVuZGVyZWQnOiAnb25RdWVzdGlvblJlbmRlcmVkJ1xuICAgICdhZGQ6Y2hpbGQnOiAnZm9vJ1xuICAgICdjb2xsZWN0aW9uOnJlbmRlcmVkJzogJ2ZvbydcblxuXG4gICMgVGhpcyB0ZXN0cyBpZiBhZGQ6Y2hpbGQgaXMgdHJpZ2dlcmVkIG9uIHRoZSBzdWJ0ZXN0IGluc3RlYWQgb2Ygb24gQXNzZXNzbWVudENvbXBvc2l0ZVZpZXcuXG4gIGZvbzogLT5cbiAgICBjb25zb2xlLmxvZyhcInRlc3QgMTIzIFNWIGNoaWxkIGZvb1wiKVxuXG4gICMgcG9wdWxhdGVzIEBxdWVzdGlvblZpZXdzIGZvciB0aGlzIHZpZXcuXG4gIGJ1aWxkQ2hpbGRWaWV3OiAoY2hpbGQsIENoaWxkVmlld0NsYXNzLCBjaGlsZFZpZXdPcHRpb25zKSAtPlxuICAgIG9wdGlvbnMgPSBfLmV4dGVuZCh7bW9kZWw6IGNoaWxkfSwgY2hpbGRWaWV3T3B0aW9ucyk7XG4gICAgY2hpbGRWaWV3ID0gbmV3IENoaWxkVmlld0NsYXNzKG9wdGlvbnMpXG4gICAgcmVxdWlyZWQgPSBjaGlsZC5nZXROdW1iZXIgXCJsaW5rZWRHcmlkU2NvcmVcIlxuICAgIGlzTm90QXNrZWQgPSAoICggcmVxdWlyZWQgIT0gMCAmJiBAcGFyZW50LmdldEdyaWRTY29yZSgpIDwgcmVxdWlyZWQgKSB8fCBAcGFyZW50LmdyaWRXYXNBdXRvc3RvcHBlZCgpICkgJiYgQHBhcmVudC5nZXRHcmlkU2NvcmUoKSAhPSBmYWxzZVxuICAgIGNoaWxkLnNldCAgXCJub3RBc2tlZFwiLCBpc05vdEFza2VkXG4gICAgaWYgaXNOb3RBc2tlZCB0aGVuIEBub3RBc2tlZENvdW50KytcbiAgICBNYXJpb25ldHRlLk1vbml0b3JET01SZWZyZXNoKGNoaWxkVmlldyk7XG4gICAgQHF1ZXN0aW9uVmlld3NbY2hpbGRWaWV3T3B0aW9ucy5pbmRleF0gPSBjaGlsZFZpZXdcblxuICAgIHJldHVybiBjaGlsZFZpZXdcbiAgLFxuXG4jICBQYXNzZXMgb3B0aW9ucyB0byBlYWNoIGNoaWxkVmlldyBpbnN0YW5jZVxuICBjaGlsZFZpZXdPcHRpb25zOiAobW9kZWwsIGluZGV4KS0+XG4gICAgdW5sZXNzIEBkYXRhRW50cnlcbiAgICAgIHByZXZpb3VzID0gQG1vZGVsLnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcblxuICAgIG5hbWUgICA9IG1vZGVsLmVzY2FwZShcIm5hbWVcIikucmVwbGFjZSAvW15BLVphLXowLTlfXS9nLCBcIi1cIlxuICAgIGFuc3dlciA9IHByZXZpb3VzW25hbWVdIGlmIHByZXZpb3VzXG4gICAgbGFiZWxzID0ge31cbiAgICBsYWJlbHMudGV4dCA9IEB0ZXh0XG4gICAgbW9kZWwuc2V0KCdsYWJlbHMnLCBsYWJlbHMpXG4gICAgb3B0aW9ucyA9XG4gICAgICBtb2RlbCAgICAgICAgIDogbW9kZWxcbiAgICAgIHBhcmVudCAgICAgICAgOiBAXG4gICAgICBkYXRhRW50cnkgICAgIDogQGRhdGFFbnRyeVxuICAgICAgbm90QXNrZWQgICAgICA6IG1vZGVsLmdldCBcIm5vdEFza2VkXCJcbiAgICAgIGlzT2JzZXJ2YXRpb24gOiBAaXNPYnNlcnZhdGlvblxuICAgICAgYW5zd2VyICAgICAgICA6IGFuc3dlclxuICAgICAgaW5kZXggIDogaW5kZXhcbiAgICByZXR1cm4gb3B0aW9uc1xuXG4gIG9uQmVmb3JlUmVuZGVyOiAtPlxuIyAgICBAcXVlc3Rpb25zLnNvcnQoKVxuXG4gIG9uUmVuZGVyOiAtPlxuXG4gICAgbm90QXNrZWRDb3VudCA9IDBcbiAgICBpZiBAbW9kZWwucXVlc3Rpb25zP1xuICAgICAgQG1vZGVsLnF1ZXN0aW9ucy5tb2RlbHMuZm9yRWFjaCAocXVlc3Rpb24sIGkpID0+XG4jIHNraXAgdGhlIHJlc3QgaWYgc2NvcmUgbm90IGhpZ2ggZW5vdWdoXG4gICAgICAgIHJlcXVpcmVkID0gcXVlc3Rpb24uZ2V0TnVtYmVyIFwibGlua2VkR3JpZFNjb3JlXCJcbiAgICAgICAgaXNOb3RBc2tlZCA9ICggKCByZXF1aXJlZCAhPSAwICYmIEBwYXJlbnQuZ2V0R3JpZFNjb3JlKCkgPCByZXF1aXJlZCApIHx8IEBwYXJlbnQuZ3JpZFdhc0F1dG9zdG9wcGVkKCkgKSAmJiBAcGFyZW50LmdldEdyaWRTY29yZSgpICE9IGZhbHNlXG4gICAgICAgIHF1ZXN0aW9uLnNldCAgXCJub3RBc2tlZFwiLCBpc05vdEFza2VkXG4gICAgICAgIGlmIGlzTm90QXNrZWQgdGhlbiBAbm90QXNrZWRDb3VudCsrXG4gICAgQHRyaWdnZXIgXCJyZWFkeVwiXG5cbiMgICAgaWYgQGZvY3VzTW9kZVxuIyAgICAgICQoJyNzdWJ0ZXN0X3dyYXBwZXInKS5hZnRlciAkIFwiXG4jICAgICAgICAgICAgPGRpdiBpZD0nc3VtbWFyeV9jb250YWluZXInPjwvZGl2PlxuIyAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gcHJldl9xdWVzdGlvbic+I3tAdGV4dC5wcmV2aW91c1F1ZXN0aW9ufTwvYnV0dG9uPlxuIyAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gbmV4dF9xdWVzdGlvbic+I3tAdGV4dC5uZXh0UXVlc3Rpb259PC9idXR0b24+XG4jICAgICAgICAgIFwiXG5cbiAgb25SZW5kZXJDb2xsZWN0aW9uOi0+XG4jICAgIGlmIEBmb2N1c01vZGVcbiMgICAgICAkKCcjc3VidGVzdF93cmFwcGVyJykuYWZ0ZXIgJCBcIlxuIyAgICAgICAgICAgIDxkaXYgaWQ9J3N1bW1hcnlfY29udGFpbmVyJz48L2Rpdj5cbiMgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIHByZXZfcXVlc3Rpb24nPiN7QHRleHQucHJldmlvdXNRdWVzdGlvbn08L2J1dHRvbj5cbiMgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIG5leHRfcXVlc3Rpb24nPiN7QHRleHQubmV4dFF1ZXN0aW9ufTwvYnV0dG9uPlxuIyAgICAgICAgICBcIlxuICAgIEB1cGRhdGVFeGVjdXRlUmVhZHkodHJ1ZSlcbiAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICAgIGlmIEBxdWVzdGlvbnMubGVuZ3RoID09IEBub3RBc2tlZENvdW50XG4gICAgICBpZiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiY29udGV4dFwiKSAhPSBcImNsYXNzXCJcbiAgICAgICAgQHBhcmVudC5uZXh0PygpXG4gICAgICBlbHNlXG4jICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQgJCBcIjxwIGNsYXNzPSdncmV5Jz4je0B0ZXh0Lm5vdEVub3VnaH08L3A+XCJcbiAgICAgICAgYWxlcnQgQHRleHQubm90RW5vdWdoXG5cbiMgICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4gICAgQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG5cbiMgIG9uU2hvdzogLT5cbiMgICAgY29uc29sZS5sb2coXCJvblNob3dcIilcbiMgICAgaWYgQGZvY3VzTW9kZVxuIyAgICAgICQoJyNzdWJ0ZXN0X3dyYXBwZXInKS5hZnRlciAkIFwiXG4jICAgICAgICAgICAgPGRpdiBpZD0nc3VtbWFyeV9jb250YWluZXInPjwvZGl2PlxuIyAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gcHJldl9xdWVzdGlvbic+I3tAdGV4dC5wcmV2aW91c1F1ZXN0aW9ufTwvYnV0dG9uPlxuIyAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gbmV4dF9xdWVzdGlvbic+I3tAdGV4dC5uZXh0UXVlc3Rpb259PC9idXR0b24+XG4jICAgICAgICAgIFwiXG4jICAgIEB1cGRhdGVFeGVjdXRlUmVhZHkodHJ1ZSlcbiMgICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4jICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuI1xuIyAgICBpZiBAcXVlc3Rpb25zLmxlbmd0aCA9PSBAbm90QXNrZWRDb3VudFxuIyAgICAgIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpICE9IFwiY2xhc3NcIlxuIyAgICAgICAgQHBhcmVudC5uZXh0PygpXG4jICAgICAgZWxzZVxuIyMgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCAkIFwiPHAgY2xhc3M9J2dyZXknPiN7QHRleHQubm90RW5vdWdofTwvcD5cIlxuIyAgICAgICAgYWxlcnQgQHRleHQubm90RW5vdWdoXG4jXG4jICAgICMgICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4jICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4gICMgRG91YnQgdGhpcyBpcyBoYXBwZW5pbmcgYWZ0ZXIgdGhlIHF1ZXN0aW9uIHdhcyByZW5kZXJlZC4gVE9ETzogZmluZCB0aGUgcmlnaHQgcGxhY2UuXG4gIG9uUXVlc3Rpb25SZW5kZXJlZDotPlxuIyAgICBjb25zb2xlLmxvZyhcIm9uUXVlc3Rpb25SZW5kZXJlZCBAcmVuZGVyQ291bnQ6IFwiICsgQHJlbmRlckNvdW50KVxuICAgIEByZW5kZXJDb3VudCsrXG4jICAgIGNvbnNvbGUubG9nKFwib25RdWVzdGlvblJlbmRlcmVkIEByZW5kZXJDb3VudCBpbmNyZW1lbnRlZDogXCIgKyBAcmVuZGVyQ291bnQpXG4gICAgaWYgQHJlbmRlckNvdW50ID09IEBxdWVzdGlvbnMubGVuZ3RoXG4gICAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiAgICAgIEB1cGRhdGVTa2lwTG9naWMoKVxuIyAgICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuIyAgICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuIyAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuIyAgb25TaG93Oi0+XG4jICAgIGNvbnNvbGUubG9nKFwiaVNob3duIVwiKVxuIyAgICBAb25SZW5kZXJDb2xsZWN0aW9uKClcblxuICBvbkNsb3NlOi0+XG4gICAgZm9yIHF2IGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBxdi5jbG9zZT8oKVxuICAgIEBxdWVzdGlvblZpZXdzID0gW11cblxuICByZXNldDogKGluY3JlbWVudCkgLT5cbiAgICBjb25zb2xlLmxvZyhcInJlc2V0XCIpXG4gICAgQHJlbmRlcmVkLnN1YnRlc3QgPSBmYWxzZVxuICAgIEByZW5kZXJlZC5hc3Nlc3NtZW50ID0gZmFsc2VcbiAgICAjICAgIGN1cnJlbnRWaWV3ID0gQHN1YnRlc3RWaWV3c1tAb3JkZXJNYXBbQGluZGV4XV1cbiAgICAjICAgIGN1cnJlbnRWaWV3LmNsb3NlKClcbiAgICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcuY2xvc2UoKTtcbiAgICBAaW5kZXggPVxuICAgICAgaWYgQGFib3J0QXNzZXNzbWVudCA9PSB0cnVlXG4gICAgICAgIEBzdWJ0ZXN0Vmlld3MubGVuZ3RoLTFcbiAgICAgIGVsc2VcbiAgICAgICAgQGluZGV4ICsgaW5jcmVtZW50XG4gICAgQHJlbmRlcigpXG4gICAgd2luZG93LnNjcm9sbFRvIDAsIDBcbiJdfQ==

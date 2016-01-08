var SurveyRunItemView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SurveyRunItemView = (function(superClass) {
  extend(SurveyRunItemView, superClass);

  function SurveyRunItemView() {
    this.skip = bind(this.skip, this);
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

  SurveyRunItemView.prototype.onShow = function() {
    var displayCode, error, error1, message, name, ref;
    displayCode = this.model.getString("displayCode");
    if (!_.isEmptyString(displayCode)) {
      try {
        CoffeeScript["eval"].apply(this, [displayCode]);
      } catch (error1) {
        error = error1;
        name = (/function (.{1,})\(/.exec(error.constructor.toString())[1]);
        message = error.message;
        alert(name + "\n\n" + message);
        console.log("displayCode Error: " + JSON.stringify(error));
      }
    }
    return (ref = this.prototypeView) != null ? typeof ref.updateExecuteReady === "function" ? ref.updateExecuteReady(true) : void 0 : void 0;
  };

  SurveyRunItemView.prototype.skip = function() {
    var currentView;
    currentView = Tangerine.progress.currentSubview;
    return this.parent.result.add({
      name: currentView.model.get("name"),
      data: currentView.getSkipped(),
      subtestId: currentView.model.id,
      skipped: true,
      prototype: currentView.model.get("prototype")
    }, {
      success: (function(_this) {
        return function() {
          return _this.parent.reset(1);
        };
      })(this)
    });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1bkl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7OEJBRUosUUFBQSxHQUFVLEdBQUksQ0FBQSxRQUFBOzs4QkFDZCxTQUFBLEdBQVc7OzhCQUNYLE9BQUEsR0FBUzs7OEJBQ1QsU0FBQSxHQUFXOzs4QkFFWCxNQUFBLEdBQ0U7SUFBQSxzQkFBQSxFQUF5QixjQUF6QjtJQUNBLHNCQUFBLEVBQXlCLGNBRHpCOzs7OEJBR0YsVUFBQSxHQUFZLFNBQUMsT0FBRDtBQUVWLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFpQixPQUFPLENBQUM7SUFDekIsSUFBQyxDQUFBLE1BQUQsR0FBaUIsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUN4QixJQUFDLENBQUEsU0FBRCxHQUFpQixPQUFPLENBQUM7SUFDekIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxDQUFrQixXQUFsQjtJQUNqQixJQUFzQixJQUFDLENBQUEsU0FBdkI7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixFQUFqQjs7SUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsUUFBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsV0FBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUlqQixJQUFDLENBQUEsSUFBRCxDQUFBO0lBS0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsS0FBSyxDQUFDO0lBQ3JCLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBO0lBV2QsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFuQixHQUFvQztJQUNwQyxNQUFBLEdBQVM7SUFDVCxNQUFNLENBQUMsSUFBUCxHQUFjLElBQUMs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UCxDQUFnQixDQUFoQixFQUFtQixDQUFuQjtFQWJLOzs7O0dBM2J1QixRQUFRLENBQUMsVUFBVSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1bkl0ZW1WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU3VydmV5UnVuSXRlbVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5NYXJpb25ldHRlLkNvbXBvc2l0ZVZpZXdcblxuICB0ZW1wbGF0ZTogSlNUW1wiU3VydmV5XCJdLFxuICBjaGlsZFZpZXc6IFF1ZXN0aW9uUnVuSXRlbVZpZXcsXG4gIHRhZ05hbWU6IFwicFwiLFxuICBjbGFzc05hbWU6IFwiU3VydmV5UnVuSXRlbVZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLm5leHRfcXVlc3Rpb24nIDogJ25leHRRdWVzdGlvbidcbiAgICAnY2xpY2sgLnByZXZfcXVlc3Rpb24nIDogJ3ByZXZRdWVzdGlvbidcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBtb2RlbCAgICAgICAgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgICAgICAgID0gQG1vZGVsLnBhcmVudFxuICAgIEBkYXRhRW50cnkgICAgID0gb3B0aW9ucy5kYXRhRW50cnlcbiAgICBAaXNPYnNlcnZhdGlvbiA9IG9wdGlvbnMuaXNPYnNlcnZhdGlvblxuICAgIEBmb2N1c01vZGUgICAgID0gQG1vZGVsLmdldEJvb2xlYW4oXCJmb2N1c01vZGVcIilcbiAgICBAcXVlc3Rpb25JbmRleCA9IDAgaWYgQGZvY3VzTW9kZVxuICAgIEBxdWVzdGlvblZpZXdzID0gW11cbiAgICBAYW5zd2VyZWQgICAgICA9IFtdXG4gICAgQHJlbmRlckNvdW50ICAgPSAwXG4gICAgQG5vdEFza2VkQ291bnQgPSAwXG4jICAgIEBjaGlsZFZpZXdPcHRpb25zID1cbiMgICAgICAgIHBhcmVudDogdGhpc1xuXG4gICAgQGkxOG4oKVxuIyAgICB0aGlzLmxpc3RlblRvKEBtb2RlbC5jb2xsZWN0aW9uLCdjaGFuZ2UnLCB0aGlzLnZpZXdSZW5kZXIpXG4jICAgICAgdGhpcy5saXN0ZW5Ubyhtb2RlbC5jb2xsZWN0aW9uLCAncmVzZXQnLCB0aGlzLnJlbmRlcik7XG4jICAgIGlmIEBtb2RlbC5xdWVzdGlvbnMubGVuZ3RoID09IDBcbiMgICAgICBjb25zb2xlLmxvZyhcIk5vIHF1ZXN0aW9ucy5cIilcbiAgICBAY29sbGVjdGlvbiA9IEBtb2RlbC5xdWVzdGlvbnNcbiAgICBAcXVlc3Rpb25zID0gQGNvbGxlY3Rpb25cblxuIyAgICBAbW9kZWwucXVlc3Rpb25zLmZldGNoXG4jICAgICAgdmlld09wdGlvbnM6XG4jICAgICAgICBrZXk6IFwicXVlc3Rpb24tI3tAbW9kZWwuaWR9XCJcbiMgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgPT5cbiMjICAgICAgICBAbW9kZWwucXVlc3Rpb25zLnNvcnQoKVxuIyAgICAgICAgY29sbGVjdGlvbi5zb3J0KClcbiMgICAgICAgIEBtb2RlbC5jb2xsZWN0aW9uLm1vZGVscyA9IGNvbGxlY3Rpb24ubW9kZWxzXG4jICAgICAgICBAcmVuZGVyKClcblxuICAgIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3VidmlldyA9IEBcbiAgICBsYWJlbHMgPSB7fVxuICAgIGxhYmVscy50ZXh0ID0gQHRleHRcbiAgICBAbW9kZWwuc2V0KCdsYWJlbHMnLCBsYWJlbHMpXG5cbiAgICBAc2tpcHBhYmxlID0gQG1vZGVsLmdldChcInNraXBwYWJsZVwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gXCJ0cnVlXCJcbiAgICBAYmFja2FibGUgPSAoIEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IHRydWUgfHwgQG1vZGVsLmdldChcImJhY2tCdXR0b25cIikgPT0gXCJ0cnVlXCIgKSBhbmQgQHBhcmVudC5pbmRleCBpc250IDBcbiAgICBAcGFyZW50LmRpc3BsYXlTa2lwKEBza2lwcGFibGUpXG4gICAgQHBhcmVudC5kaXNwbGF5QmFjayhAYmFja2FibGUpXG5cbiAgICBAbGlzdGVuVG9cblxuICB1cGRhdGVQcm9ncmVzc0J1dHRvbnM6IC0+XG5cbiAgICBpc0F2YWlsYWJsZSA9IFtdXG4gICAgZm9yIHF2LCBpIGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBpZiBxdj9cbiAgICAgICAgaXNBdmFpbGFibGUucHVzaCBpIGlmIG5vdCAocXYuaXNBdXRvc3RvcHBlZCBvciBxdi5pc1NraXBwZWQpXG4gICAgaXNBdmFpbGFibGUucHVzaCBAcXVlc3Rpb25JbmRleFxuXG4gICAgJHByZXYgPSBAcGFyZW50LiRlbC5maW5kKFwiLnByZXZfcXVlc3Rpb25cIilcbiAgICAkbmV4dCA9IEBwYXJlbnQuJGVsLmZpbmQoXCIubmV4dF9xdWVzdGlvblwiKVxuXG4gICAgbWluaW11bSA9IE1hdGgubWluLmFwcGx5KCBtaW5pbXVtLCBpc0F2YWlsYWJsZSApXG4gICAgbWF4aW11bSA9IE1hdGgubWF4LmFwcGx5KCBtYXhpbXVtLCBpc0F2YWlsYWJsZSApXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCA9PSBtaW5pbXVtXG4gICAgICAkcHJldi5oaWRlKClcbiAgICBlbHNlXG4gICAgICAkcHJldi5zaG93KClcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IG1heGltdW1cbiAgICAgICRuZXh0LmhpZGUoKVxuICAgIGVsc2VcbiAgICAgICRuZXh0LnNob3coKVxuXG4gIHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eTogLT5cblxuICAgIHJldHVybiB1bmxlc3MgQG1vZGVsLmdldChcImZvY3VzTW9kZVwiKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggPT0gQHF1ZXN0aW9uVmlld3MubGVuZ3RoXG4jICAgICAgJChcIiNzdW1tYXJ5X2NvbnRhaW5lclwiKS5odG1sIFwiXG4jICAgICAgICBsYXN0IHBhZ2UgaGVyZVxuIyAgICAgIFwiXG4gICAgICAkKFwiLm5leHRfcXVlc3Rpb25cIikuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgJChcIiNzdW1tYXJ5X2NvbnRhaW5lclwiKS5lbXB0eSgpXG4gICAgICAkKFwiLm5leHRfcXVlc3Rpb25cIikuc2hvdygpXG5cbiAgICAkcXVlc3Rpb25zID0gQCRlbC5maW5kKFwiLnF1ZXN0aW9uXCIpXG4gICAgJHF1ZXN0aW9ucy5oaWRlKClcbiAgICAkcXVlc3Rpb25zLmVxKEBxdWVzdGlvbkluZGV4KS5zaG93KClcblxuICAgICMgdHJpZ2dlciB0aGUgcXVlc3Rpb24gdG8gcnVuIGl0J3MgZGlzcGxheSBjb2RlIGlmIHRoZSBzdWJ0ZXN0J3MgZGlzcGxheWNvZGUgaGFzIGFscmVhZHkgcmFuXG4gICAgIyBpZiBub3QsIGFkZCBpdCB0byBhIGxpc3QgdG8gcnVuIGxhdGVyLlxuICAgIGlmIEBleGVjdXRlUmVhZHlcbiAgICAgIEBxdWVzdGlvblZpZXdzW0BxdWVzdGlvbkluZGV4XS50cmlnZ2VyIFwic2hvd1wiXG4gICAgZWxzZVxuICAgICAgQHRyaWdnZXJTaG93TGlzdCA9IFtdIGlmIG5vdCBAdHJpZ2dlclNob3dMaXN0XG4gICAgICBAdHJpZ2dlclNob3dMaXN0LnB1c2ggQHF1ZXN0aW9uSW5kZXhcblxuICBzaG93UXVlc3Rpb246IChpbmRleCkgLT5cbiAgICBAcXVlc3Rpb25JbmRleCA9IGluZGV4IGlmIF8uaXNOdW1iZXIoaW5kZXgpICYmIGluZGV4IDwgQHF1ZXN0aW9uVmlld3MubGVuZ3RoICYmIGluZGV4ID4gMFxuICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuIyAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICB1cGRhdGVFeGVjdXRlUmVhZHk6IChyZWFkeSkgLT5cbiAgICBAZXhlY3V0ZVJlYWR5ID0gcmVhZHlcblxuICAgIHJldHVybiBpZiBub3QgQHRyaWdnZXJTaG93TGlzdD9cblxuICAgIGlmIEB0cmlnZ2VyU2hvd0xpc3QubGVuZ3RoID4gMFxuICAgICAgZm9yIGluZGV4IGluIEB0cmlnZ2VyU2hvd0xpc3RcbiAgICAgICAgQHF1ZXN0aW9uVmlld3NbaW5kZXhdPy50cmlnZ2VyIFwic2hvd1wiXG4gICAgICBAdHJpZ2dlclNob3dMaXN0ID0gW11cblxuICAgIEB1cGRhdGVTa2lwTG9naWMoKSBpZiBAZXhlY3V0ZVJlYWR5XG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICBwbGVhc2VBbnN3ZXIgOiB0KFwiU3VydmV5UnVuVmlldy5tZXNzYWdlLnBsZWFzZV9hbnN3ZXJcIilcbiAgICAgIGNvcnJlY3RFcnJvcnMgOiB0KFwiU3VydmV5UnVuVmlldy5tZXNzYWdlLmNvcnJlY3RfZXJyb3JzXCIpXG4gICAgICBub3RFbm91Z2ggOiBfKHQoXCJTdXJ2ZXlSdW5WaWV3Lm1lc3NhZ2Uubm90X2Vub3VnaFwiKSkuZXNjYXBlKClcblxuICAgICAgcHJldmlvdXNRdWVzdGlvbiA6IHQoXCJTdXJ2ZXlSdW5WaWV3LmJ1dHRvbi5wcmV2aW91c19xdWVzdGlvblwiKVxuICAgICAgbmV4dFF1ZXN0aW9uIDogdChcIlN1cnZleVJ1blZpZXcuYnV0dG9uLm5leHRfcXVlc3Rpb25cIilcbiAgICAgIFwibmV4dFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5uZXh0XCIpXG4gICAgICBcImJhY2tcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uYmFja1wiKVxuICAgICAgXCJza2lwXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLnNraXBcIilcbiAgICAgIFwiaGVscFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5oZWxwXCIpXG5cbiAgIyB3aGVuIGEgcXVlc3Rpb24gaXMgYW5zd2VyZWRcbiAgb25RdWVzdGlvbkFuc3dlcjogKGVsZW1lbnQpIC0+XG4jICAgIGNvbnNvbGUubG9nKFwib25RdWVzdGlvbkFuc3dlciBAcmVuZGVyQ291bnQ6XCIgKyBAcmVuZGVyQ291bnQgKyBcIiAgQHF1ZXN0aW9ucy5sZW5ndGg6IFwiICsgIEBxdWVzdGlvbnMubGVuZ3RoKVxuIyAgICB0aGlzIGlzIG5vdCBnb29kLiBTaG91bGQgdGVzdCBmb3IgPT1cbiAgICByZXR1cm4gdW5sZXNzIEByZW5kZXJDb3VudCA+PSBAcXVlc3Rpb25zLmxlbmd0aFxuXG4gICAgIyBhdXRvIHN0b3AgYWZ0ZXIgbGltaXRcbiAgICBAYXV0b3N0b3BwZWQgICAgPSBmYWxzZVxuICAgIGF1dG9zdG9wTGltaXQgICA9IEBtb2RlbC5nZXROdW1iZXIgXCJhdXRvc3RvcExpbWl0XCJcbiAgICBsb25nZXN0U2VxdWVuY2UgPSAwXG4gICAgYXV0b3N0b3BDb3VudCAgID0gMFxuXG4gICAgaWYgYXV0b3N0b3BMaW1pdCA+IDBcbiAgICAgIGZvciBpIGluIFsxLi5AcXVlc3Rpb25WaWV3cy5sZW5ndGhdICMganVzdCBpbiBjYXNlIHRoZXkgY2FuJ3QgY291bnRcbiAgICAgICAgY3VycmVudEFuc3dlciA9IEBxdWVzdGlvblZpZXdzW2ktMV0uYW5zd2VyXG4gICAgICAgIGlmIGN1cnJlbnRBbnN3ZXIgPT0gXCIwXCIgb3IgY3VycmVudEFuc3dlciA9PSBcIjlcIlxuICAgICAgICAgIGF1dG9zdG9wQ291bnQrK1xuICAgICAgICBlbHNlXG4gICAgICAgICAgYXV0b3N0b3BDb3VudCA9IDBcbiAgICAgICAgbG9uZ2VzdFNlcXVlbmNlID0gTWF0aC5tYXgobG9uZ2VzdFNlcXVlbmNlLCBhdXRvc3RvcENvdW50KVxuICAgICAgICAjIGlmIHRoZSB2YWx1ZSBpcyBzZXQsIHdlJ3ZlIGdvdCBhIHRocmVzaG9sZCBleGNlZWRpbmcgcnVuLCBhbmQgaXQncyBub3QgYWxyZWFkeSBhdXRvc3RvcHBlZFxuICAgICAgICBpZiBhdXRvc3RvcExpbWl0ICE9IDAgJiYgbG9uZ2VzdFNlcXVlbmNlID49IGF1dG9zdG9wTGltaXQgJiYgbm90IEBhdXRvc3RvcHBlZFxuICAgICAgICAgIEBhdXRvc3RvcHBlZCA9IHRydWVcbiAgICAgICAgICBAYXV0b3N0b3BJbmRleCA9IGlcbiAgICBAdXBkYXRlQXV0b3N0b3AoKVxuICAgIEB1cGRhdGVTa2lwTG9naWMoKVxuXG4gIHVwZGF0ZUF1dG9zdG9wOiAtPlxuICAgIGF1dG9zdG9wTGltaXQgPSBAbW9kZWwuZ2V0TnVtYmVyIFwiYXV0b3N0b3BMaW1pdFwiXG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAodmlldywgaSkgLT5cbiAgICAgIGlmIGkgPiAoQGF1dG9zdG9wSW5kZXggLSAxKVxuICAgICAgICBpZiBAYXV0b3N0b3BwZWRcbiAgICAgICAgICB2aWV3LmlzQXV0b3N0b3BwZWQgPSB0cnVlXG4gICAgICAgICAgdmlldy4kZWwuYWRkQ2xhc3MgICAgXCJkaXNhYmxlZF9hdXRvc3RvcFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB2aWV3LmlzQXV0b3N0b3BwZWQgPSBmYWxzZVxuICAgICAgICAgIHZpZXcuJGVsLnJlbW92ZUNsYXNzIFwiZGlzYWJsZWRfYXV0b3N0b3BcIlxuICAgICwgQFxuXG4gIHVwZGF0ZVNraXBMb2dpYzogLT5cbiMgICAgY29uc29sZS5sb2coXCJ1cGRhdGVTa2lwTG9naWNcIilcbiMgICAgY29uc29sZS5sb2coXCJAcXVlc3Rpb25WaWV3c1wiICsgQHF1ZXN0aW9uVmlld3MubGVuZ3RoKVxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHF2KSAtPlxuICAgICAgcXVlc3Rpb24gPSBxdi5tb2RlbFxuICAgICAgc2tpcExvZ2ljQ29kZSA9IHF1ZXN0aW9uLmdldFN0cmluZyBcInNraXBMb2dpY1wiXG4gICAgICB1bmxlc3Mgc2tpcExvZ2ljQ29kZSBpcyBcIlwiXG4gICAgICAgIHRyeVxuICAgICAgICAgIHJlc3VsdCA9IENvZmZlZVNjcmlwdC5ldmFsLmFwcGx5KEAsIFtza2lwTG9naWNDb2RlXSlcbiMgICAgICAgICAgY29uc29sZS5sb2coXCJza2lwTG9naWNDb2RlOiBcIiArIHNraXBMb2dpY0NvZGUpXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgbmFtZSA9ICgoL2Z1bmN0aW9uICguezEsfSlcXCgvKS5leGVjKGVycm9yLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkpWzFdKVxuICAgICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgICAgYWxlcnQgXCJTa2lwIGxvZ2ljIGVycm9yIGluIHF1ZXN0aW9uICN7cXVlc3Rpb24uZ2V0KCduYW1lJyl9XFxuXFxuI3tuYW1lfVxcblxcbiN7bWVzc2FnZX1cIlxuXG4gICAgICAgIGlmIHJlc3VsdFxuICAgICAgICAgIHF2LiRlbC5hZGRDbGFzcyBcImRpc2FibGVkX3NraXBwZWRcIlxuICAgICAgICAgIHF2LmlzU2tpcHBlZCA9IHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHF2LiRlbC5yZW1vdmVDbGFzcyBcImRpc2FibGVkX3NraXBwZWRcIlxuICAgICAgICAgIHF2LmlzU2tpcHBlZCA9IGZhbHNlXG4gICAgICBxdi51cGRhdGVWYWxpZGl0eSgpXG4gICAgLCBAXG5cbiAgaXNWYWxpZDogKHZpZXdzID0gQHF1ZXN0aW9uVmlld3MpIC0+XG4gICAgcmV0dXJuIHRydWUgaWYgbm90IHZpZXdzPyAjIGlmIHRoZXJlJ3Mgbm90aGluZyB0byBjaGVjaywgaXQgbXVzdCBiZSBnb29kXG4gICAgdmlld3MgPSBbdmlld3NdIGlmIG5vdCBfLmlzQXJyYXkodmlld3MpXG4gICAgZm9yIHF2LCBpIGluIHZpZXdzXG4gICAgICBxdi51cGRhdGVWYWxpZGl0eSgpXG4gICAgICAjIGNhbiB3ZSBza2lwIGl0P1xuICAgICAgaWYgbm90IHF2Lm1vZGVsLmdldEJvb2xlYW4oXCJza2lwcGFibGVcIilcbiAgICAgICAgIyBpcyBpdCB2YWxpZFxuICAgICAgICBpZiBub3QgcXYuaXNWYWxpZFxuICAgICAgICAgICMgcmVkIGFsZXJ0ISFcbiMgICAgICAgICAgY29uc29sZS5sb2coXCJwb3AgdXAgYW4gZXJyb3JcIilcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiMgICAgLCBAXG4gICAgcmV0dXJuIHRydWVcblxuICB0ZXN0VmFsaWQ6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwiU3VydmV5UmluSXRlbSB0ZXN0VmFsaWQuXCIpXG4jICAgIGlmIG5vdCBAcHJvdG90eXBlUmVuZGVyZWQgdGhlbiByZXR1cm4gZmFsc2VcbiMgICAgY3VycmVudFZpZXcgPSBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXdcbiMgICAgaWYgQGlzVmFsaWQ/XG4jICAgIGNvbnNvbGUubG9nKFwidGVzdHZhbGlkOiBcIiArIEBpc1ZhbGlkPylcbiAgICByZXR1cm4gQGlzVmFsaWQoKVxuIyAgICBlbHNlXG4jICAgICAgcmV0dXJuIGZhbHNlXG4jICAgIHRydWVcblxuXG4gICMgQFRPRE8gdGhpcyBzaG91bGQgcHJvYmFibHkgYmUgcmV0dXJuaW5nIG11bHRpcGxlLCBzaW5nbGUgdHlwZSBoYXNoIHZhbHVlc1xuICBnZXRTa2lwcGVkOiAtPlxuICAgIHJlc3VsdCA9IHt9XG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAocXYsIGkpIC0+XG4gICAgICByZXN1bHRbQHF1ZXN0aW9ucy5tb2RlbHNbaV0uZ2V0KFwibmFtZVwiKV0gPSBcInNraXBwZWRcIlxuICAgICwgQFxuICAgIHJldHVybiByZXN1bHRcblxuICBnZXRSZXN1bHQ6IC0+XG4gICAgcmVzdWx0ID0ge31cbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoIChxdiwgaSkgLT5cbiMgICAgICByZXN1bHRbQHF1ZXN0aW9ucy5tb2RlbHNbaV0uZ2V0KFwibmFtZVwiKV0gPVxuICAgICAgcmVzdWx0W3F2Lm5hbWVdID1cbiAgICAgICAgaWYgcXYubm90QXNrZWQgIyBiZWNhdXNlIG9mIGdyaWQgc2NvcmVcbiAgICAgICAgICBxdi5ub3RBc2tlZFJlc3VsdFxuICAgICAgICBlbHNlIGlmIG5vdCBfLmlzRW1wdHkocXYuYW5zd2VyKSAjIHVzZSBhbnN3ZXJcbiAgICAgICAgICBxdi5hbnN3ZXJcbiAgICAgICAgZWxzZSBpZiBxdi5za2lwcGVkXG4gICAgICAgICAgcXYuc2tpcHBlZFJlc3VsdFxuICAgICAgICBlbHNlIGlmIHF2LmlzU2tpcHBlZFxuICAgICAgICAgIHF2LmxvZ2ljU2tpcHBlZFJlc3VsdFxuICAgICAgICBlbHNlIGlmIHF2LmlzQXV0b3N0b3BwZWRcbiAgICAgICAgICBxdi5ub3RBc2tlZEF1dG9zdG9wUmVzdWx0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBxdi5hbnN3ZXJcbiAgICAsIEBcbiAgICBoYXNoID0gQG1vZGVsLmdldChcImhhc2hcIikgaWYgQG1vZGVsLmhhcyhcImhhc2hcIilcbiAgICBzdWJ0ZXN0UmVzdWx0ID1cbiAgICAgICdib2R5JyA6IHJlc3VsdFxuICAgICAgJ21ldGEnIDpcbiAgICAgICAgJ2hhc2gnIDogaGFzaFxuIyAgICByZXR1cm4gcmVzdWx0XG5cbiAgc2hvd0Vycm9yczogKHZpZXdzID0gQHF1ZXN0aW9uVmlld3MpIC0+XG4gICAgQCRlbC5maW5kKCcubWVzc2FnZScpLnJlbW92ZSgpXG4gICAgZmlyc3QgPSB0cnVlXG4gICAgdmlld3MgPSBbdmlld3NdIGlmIG5vdCBfLmlzQXJyYXkodmlld3MpXG4gICAgdmlld3MuZm9yRWFjaCAocXYsIGkpIC0+XG4gICAgICBpZiBub3QgXy5pc1N0cmluZyhxdilcbiAgICAgICAgbWVzc2FnZSA9IFwiXCJcbiAgICAgICAgaWYgbm90IHF2LmlzVmFsaWRcbiAgICAgICAgICAjIGhhbmRsZSBjdXN0b20gdmFsaWRhdGlvbiBlcnJvciBtZXNzYWdlc1xuICAgICAgICAgIGN1c3RvbU1lc3NhZ2UgPSBxdi5tb2RlbC5nZXQoXCJjdXN0b21WYWxpZGF0aW9uTWVzc2FnZVwiKVxuICAgICAgICAgIGlmIG5vdCBfLmlzRW1wdHkoY3VzdG9tTWVzc2FnZSlcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBjdXN0b21NZXNzYWdlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgbWVzc2FnZSA9IEB0ZXh0LnBsZWFzZUFuc3dlclxuXG4gICAgICAgICAgaWYgZmlyc3QgPT0gdHJ1ZVxuICAgICAgICAgICAgQHNob3dRdWVzdGlvbihpKSBpZiB2aWV3cyA9PSBAcXVlc3Rpb25WaWV3c1xuICAgICAgICAgICAgcXYuJGVsLnNjcm9sbFRvKClcbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IEB0ZXh0LmNvcnJlY3RFcnJvcnNcbiAgICAgICAgICAgIGZpcnN0ID0gZmFsc2VcbiAgICAgICAgcXYuc2V0TWVzc2FnZSBtZXNzYWdlXG4gICAgLCBAXG5cblxuICBnZXRTdW06IC0+XG4gICAgcmV0dXJuIHtjb3JyZWN0OjAsaW5jb3JyZWN0OjAsbWlzc2luZzowLHRvdGFsOjB9XG5cbiAgY2hpbGRFdmVudHM6XG4gICAgJ2Fuc3dlciBzY3JvbGwnOiAnb25RdWVzdGlvbkFuc3dlcidcbiAgICAnYW5zd2VyJzogJ29uUXVlc3Rpb25BbnN3ZXInXG4gICAgJ3JlbmRlcmVkJzogJ29uUXVlc3Rpb25SZW5kZXJlZCdcblxuICAjIFRoaXMgdGVzdHMgaWYgYWRkOmNoaWxkIGlzIHRyaWdnZXJlZCBvbiB0aGUgc3VidGVzdCBpbnN0ZWFkIG9mIG9uIEFzc2Vzc21lbnRDb21wb3NpdGVWaWV3LlxuICBmb286IC0+XG4gICAgY29uc29sZS5sb2coXCJ0ZXN0IDEyMyBTViBjaGlsZCBmb29cIilcblxuICAjIHBvcHVsYXRlcyBAcXVlc3Rpb25WaWV3cyBmb3IgdGhpcyB2aWV3LlxuICBidWlsZENoaWxkVmlldzogKGNoaWxkLCBDaGlsZFZpZXdDbGFzcywgY2hpbGRWaWV3T3B0aW9ucykgLT5cbiAgICBvcHRpb25zID0gXy5leHRlbmQoe21vZGVsOiBjaGlsZH0sIGNoaWxkVmlld09wdGlvbnMpO1xuICAgIGNoaWxkVmlldyA9IG5ldyBDaGlsZFZpZXdDbGFzcyhvcHRpb25zKVxuICAgIHJlcXVpcmVkID0gY2hpbGQuZ2V0TnVtYmVyIFwibGlua2VkR3JpZFNjb3JlXCJcbiAgICBpc05vdEFza2VkID0gKCAoIHJlcXVpcmVkICE9IDAgJiYgQHBhcmVudC5nZXRHcmlkU2NvcmUoKSA8IHJlcXVpcmVkICkgfHwgQHBhcmVudC5ncmlkV2FzQXV0b3N0b3BwZWQoKSApICYmIEBwYXJlbnQuZ2V0R3JpZFNjb3JlKCkgIT0gZmFsc2VcbiAgICBjaGlsZC5zZXQgIFwibm90QXNrZWRcIiwgaXNOb3RBc2tlZFxuICAgIGlmIGlzTm90QXNrZWQgdGhlbiBAbm90QXNrZWRDb3VudCsrXG4gICAgTWFyaW9uZXR0ZS5Nb25pdG9yRE9NUmVmcmVzaChjaGlsZFZpZXcpO1xuICAgIEBxdWVzdGlvblZpZXdzW2NoaWxkVmlld09wdGlvbnMuaW5kZXhdID0gY2hpbGRWaWV3XG5cbiAgICByZXR1cm4gY2hpbGRWaWV3XG4gICxcblxuIyAgUGFzc2VzIG9wdGlvbnMgdG8gZWFjaCBjaGlsZFZpZXcgaW5zdGFuY2VcbiAgY2hpbGRWaWV3T3B0aW9uczogKG1vZGVsLCBpbmRleCktPlxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG4gICAgICBwcmV2aW91cyA9IEBtb2RlbC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG5cbiAgICBuYW1lICAgPSBtb2RlbC5lc2NhcGUoXCJuYW1lXCIpLnJlcGxhY2UgL1teQS1aYS16MC05X10vZywgXCItXCJcbiAgICBhbnN3ZXIgPSBwcmV2aW91c1tuYW1lXSBpZiBwcmV2aW91c1xuICAgIGxhYmVscyA9IHt9XG4gICAgbGFiZWxzLnRleHQgPSBAdGV4dFxuICAgIG1vZGVsLnNldCgnbGFiZWxzJywgbGFiZWxzKVxuICAgIG9wdGlvbnMgPVxuICAgICAgbW9kZWwgICAgICAgICA6IG1vZGVsXG4gICAgICBwYXJlbnQgICAgICAgIDogQFxuICAgICAgZGF0YUVudHJ5ICAgICA6IEBkYXRhRW50cnlcbiAgICAgIG5vdEFza2VkICAgICAgOiBtb2RlbC5nZXQgXCJub3RBc2tlZFwiXG4gICAgICBpc09ic2VydmF0aW9uIDogQGlzT2JzZXJ2YXRpb25cbiAgICAgIGFuc3dlciAgICAgICAgOiBhbnN3ZXJcbiAgICAgIGluZGV4ICA6IGluZGV4XG4gICAgcmV0dXJuIG9wdGlvbnNcblxuICBvbkJlZm9yZVJlbmRlcjogLT5cbiMgICAgQHF1ZXN0aW9ucy5zb3J0KClcblxuICBvblJlbmRlcjogLT5cblxuICAgIG5vdEFza2VkQ291bnQgPSAwXG4gICAgaWYgQG1vZGVsLnF1ZXN0aW9ucz9cbiAgICAgIEBtb2RlbC5xdWVzdGlvbnMubW9kZWxzLmZvckVhY2ggKHF1ZXN0aW9uLCBpKSA9PlxuIyBza2lwIHRoZSByZXN0IGlmIHNjb3JlIG5vdCBoaWdoIGVub3VnaFxuICAgICAgICByZXF1aXJlZCA9IHF1ZXN0aW9uLmdldE51bWJlciBcImxpbmtlZEdyaWRTY29yZVwiXG4gICAgICAgIGlzTm90QXNrZWQgPSAoICggcmVxdWlyZWQgIT0gMCAmJiBAcGFyZW50LmdldEdyaWRTY29yZSgpIDwgcmVxdWlyZWQgKSB8fCBAcGFyZW50LmdyaWRXYXNBdXRvc3RvcHBlZCgpICkgJiYgQHBhcmVudC5nZXRHcmlkU2NvcmUoKSAhPSBmYWxzZVxuICAgICAgICBxdWVzdGlvbi5zZXQgIFwibm90QXNrZWRcIiwgaXNOb3RBc2tlZFxuICAgICAgICBpZiBpc05vdEFza2VkIHRoZW4gQG5vdEFza2VkQ291bnQrK1xuICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuXG4jICAgIGlmIEBmb2N1c01vZGVcbiMgICAgICAkKCcjc3VidGVzdF93cmFwcGVyJykuYWZ0ZXIgJCBcIlxuIyAgICAgICAgICAgIDxkaXYgaWQ9J3N1bW1hcnlfY29udGFpbmVyJz48L2Rpdj5cbiMgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIHByZXZfcXVlc3Rpb24nPiN7QHRleHQucHJldmlvdXNRdWVzdGlvbn08L2J1dHRvbj5cbiMgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIG5leHRfcXVlc3Rpb24nPiN7QHRleHQubmV4dFF1ZXN0aW9ufTwvYnV0dG9uPlxuIyAgICAgICAgICBcIlxuXG4gIG9uUmVuZGVyQ29sbGVjdGlvbjotPlxuIyAgICBpZiBAZm9jdXNNb2RlXG4jICAgICAgJCgnI3N1YnRlc3Rfd3JhcHBlcicpLmFmdGVyICQgXCJcbiMgICAgICAgICAgICA8ZGl2IGlkPSdzdW1tYXJ5X2NvbnRhaW5lcic+PC9kaXY+XG4jICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBwcmV2X3F1ZXN0aW9uJz4je0B0ZXh0LnByZXZpb3VzUXVlc3Rpb259PC9idXR0b24+XG4jICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBuZXh0X3F1ZXN0aW9uJz4je0B0ZXh0Lm5leHRRdWVzdGlvbn08L2J1dHRvbj5cbiMgICAgICAgICAgXCJcbiAgICBAdXBkYXRlRXhlY3V0ZVJlYWR5KHRydWUpXG4gICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4gICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG5cbiAgICBpZiBAcXVlc3Rpb25zLmxlbmd0aCA9PSBAbm90QXNrZWRDb3VudFxuICAgICAgaWYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgIT0gXCJjbGFzc1wiXG4gICAgICAgIEBwYXJlbnQubmV4dD8oKVxuICAgICAgZWxzZVxuIyAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkICQgXCI8cCBjbGFzcz0nZ3JleSc+I3tAdGV4dC5ub3RFbm91Z2h9PC9wPlwiXG4gICAgICAgIGFsZXJ0IEB0ZXh0Lm5vdEVub3VnaFxuXG4jICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG5cblxuIyAgb25TaG93OiAtPlxuIyAgICBjb25zb2xlLmxvZyhcIm9uU2hvd1wiKVxuIyAgICBpZiBAZm9jdXNNb2RlXG4jICAgICAgJCgnI3N1YnRlc3Rfd3JhcHBlcicpLmFmdGVyICQgXCJcbiMgICAgICAgICAgICA8ZGl2IGlkPSdzdW1tYXJ5X2NvbnRhaW5lcic+PC9kaXY+XG4jICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBwcmV2X3F1ZXN0aW9uJz4je0B0ZXh0LnByZXZpb3VzUXVlc3Rpb259PC9idXR0b24+XG4jICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBuZXh0X3F1ZXN0aW9uJz4je0B0ZXh0Lm5leHRRdWVzdGlvbn08L2J1dHRvbj5cbiMgICAgICAgICAgXCJcbiMgICAgQHVwZGF0ZUV4ZWN1dGVSZWFkeSh0cnVlKVxuIyAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiMgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG4jXG4jICAgIGlmIEBxdWVzdGlvbnMubGVuZ3RoID09IEBub3RBc2tlZENvdW50XG4jICAgICAgaWYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgIT0gXCJjbGFzc1wiXG4jICAgICAgICBAcGFyZW50Lm5leHQ/KClcbiMgICAgICBlbHNlXG4jIyAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkICQgXCI8cCBjbGFzcz0nZ3JleSc+I3tAdGV4dC5ub3RFbm91Z2h9PC9wPlwiXG4jICAgICAgICBhbGVydCBAdGV4dC5ub3RFbm91Z2hcbiNcbiMgICAgIyAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiMgICAgQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG5cbiAgb25TaG93OiAtPlxuICAgIGRpc3BsYXlDb2RlID0gQG1vZGVsLmdldFN0cmluZyhcImRpc3BsYXlDb2RlXCIpXG5cbiAgICBpZiBub3QgXy5pc0VtcHR5U3RyaW5nKGRpc3BsYXlDb2RlKVxuXG4gICAgICB0cnlcbiAgICAgICAgQ29mZmVlU2NyaXB0LmV2YWwuYXBwbHkoQCwgW2Rpc3BsYXlDb2RlXSlcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIG5hbWUgPSAoKC9mdW5jdGlvbiAoLnsxLH0pXFwoLykuZXhlYyhlcnJvci5jb25zdHJ1Y3Rvci50b1N0cmluZygpKVsxXSlcbiAgICAgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgYWxlcnQgXCIje25hbWV9XFxuXFxuI3ttZXNzYWdlfVwiXG4gICAgICAgIGNvbnNvbGUubG9nIFwiZGlzcGxheUNvZGUgRXJyb3I6IFwiICsgSlNPTi5zdHJpbmdpZnkoZXJyb3IpXG5cbiAgICBAcHJvdG90eXBlVmlldz8udXBkYXRlRXhlY3V0ZVJlYWR5Pyh0cnVlKVxuXG4jIEB0b2RvIERvY3VtZW50YXRpb25cbiAgc2tpcDogPT5cbiAgICBjdXJyZW50VmlldyA9IFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1xuICAgIEBwYXJlbnQucmVzdWx0LmFkZFxuICAgICAgbmFtZSAgICAgIDogY3VycmVudFZpZXcubW9kZWwuZ2V0IFwibmFtZVwiXG4gICAgICBkYXRhICAgICAgOiBjdXJyZW50Vmlldy5nZXRTa2lwcGVkKClcbiAgICAgIHN1YnRlc3RJZCA6IGN1cnJlbnRWaWV3Lm1vZGVsLmlkXG4gICAgICBza2lwcGVkICAgOiB0cnVlXG4gICAgICBwcm90b3R5cGUgOiBjdXJyZW50Vmlldy5tb2RlbC5nZXQgXCJwcm90b3R5cGVcIlxuICAgICxcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIEBwYXJlbnQucmVzZXQgMVxuXG4gICMgRG91YnQgdGhpcyBpcyBoYXBwZW5pbmcgYWZ0ZXIgdGhlIHF1ZXN0aW9uIHdhcyByZW5kZXJlZC4gVE9ETzogZmluZCB0aGUgcmlnaHQgcGxhY2UuXG4gIG9uUXVlc3Rpb25SZW5kZXJlZDotPlxuIyAgICBjb25zb2xlLmxvZyhcIm9uUXVlc3Rpb25SZW5kZXJlZCBAcmVuZGVyQ291bnQ6IFwiICsgQHJlbmRlckNvdW50KVxuICAgIEByZW5kZXJDb3VudCsrXG4jICAgIGNvbnNvbGUubG9nKFwib25RdWVzdGlvblJlbmRlcmVkIEByZW5kZXJDb3VudCBpbmNyZW1lbnRlZDogXCIgKyBAcmVuZGVyQ291bnQpXG4gICAgaWYgQHJlbmRlckNvdW50ID09IEBxdWVzdGlvbnMubGVuZ3RoXG4gICAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiAgICAgIEB1cGRhdGVTa2lwTG9naWMoKVxuIyAgICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuIyAgICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuIyAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuIyAgb25TaG93Oi0+XG4jICAgIGNvbnNvbGUubG9nKFwiaVNob3duIVwiKVxuIyAgICBAb25SZW5kZXJDb2xsZWN0aW9uKClcblxuICBvbkNsb3NlOi0+XG4gICAgZm9yIHF2IGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBxdi5jbG9zZT8oKVxuICAgIEBxdWVzdGlvblZpZXdzID0gW11cblxuICByZXNldDogKGluY3JlbWVudCkgLT5cbiAgICBjb25zb2xlLmxvZyhcInJlc2V0XCIpXG4gICAgQHJlbmRlcmVkLnN1YnRlc3QgPSBmYWxzZVxuICAgIEByZW5kZXJlZC5hc3Nlc3NtZW50ID0gZmFsc2VcbiAgICAjICAgIGN1cnJlbnRWaWV3ID0gQHN1YnRlc3RWaWV3c1tAb3JkZXJNYXBbQGluZGV4XV1cbiAgICAjICAgIGN1cnJlbnRWaWV3LmNsb3NlKClcbiAgICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcuY2xvc2UoKTtcbiAgICBAaW5kZXggPVxuICAgICAgaWYgQGFib3J0QXNzZXNzbWVudCA9PSB0cnVlXG4gICAgICAgIEBzdWJ0ZXN0Vmlld3MubGVuZ3RoLTFcbiAgICAgIGVsc2VcbiAgICAgICAgQGluZGV4ICsgaW5jcmVtZW50XG4gICAgQHJlbmRlcigpXG4gICAgd2luZG93LnNjcm9sbFRvIDAsIDBcbiJdfQ==

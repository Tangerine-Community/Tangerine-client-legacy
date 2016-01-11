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
    vm.currentView = Tangerine.progress.currentSubview;
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
    var displayCode, displaycodeFixed, error, error1, message, name, ref;
    displayCode = this.model.getString("displayCode");
    if (!_.isEmptyString(displayCode)) {
      displaycodeFixed = displayCode.replace("vm.currentView.subtestViews[vm.currentView.index].prototypeView", "Tangerine.progress.currentSubview");
      try {
        CoffeeScript["eval"].apply(this, [displaycodeFixed]);
      } catch (error1) {
        error = error1;
        name = (/function (.{1,})\(/.exec(error.constructor.toString())[1]);
        message = error.message;
        alert(name + "\n\n" + message);
        console.log("displaycodeFixed Error: " + JSON.stringify(error));
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

  SurveyRunItemView.prototype.next = function() {
    var base;
    console.log("next");
    return typeof (base = this.model.parent).next === "function" ? base.next() : void 0;
  };

  return SurveyRunItemView;

})(Backbone.Marionette.CompositeView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1bkl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7OEJBRUosUUFBQSxHQUFVLEdBQUksQ0FBQSxRQUFBOzs4QkFDZCxTQUFBLEdBQVc7OzhCQUNYLE9BQUEsR0FBUzs7OEJBQ1QsU0FBQSxHQUFXOzs4QkFFWCxNQUFBLEdBQ0U7SUFBQSxzQkFBQSxFQUF5QixjQUF6QjtJQUNBLHNCQUFBLEVBQXlCLGNBRHpCOzs7OEJBR0YsVUFBQSxHQUFZLFNBQUMsT0FBRDtBQUVWLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFpQixPQUFPLENBQUM7SUFDekIsSUFBQyxDQUFBLE1BQUQsR0FBaUIsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUN4QixJQUFDLENBQUEsU0FBRCxHQUFpQixPQUFPLENBQUM7SUFDekIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxDQUFrQixXQUFsQjtJQUNqQixJQUFzQixJQUFDLENBQUEsU0FBdkI7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixFQUFqQjs7SUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsUUFBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsV0FBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUNqQixFQUFFLENBQUMsV0FBSCxHQUFpQixTQUFTLENBQUMsUUFBUSxDQUFDO0lBSXBDLElBQUMsQ0FBQSxJQUFELENBQUE7SUFLQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFDckIsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUE7SUFXZCxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQW5CLEdBQW9D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RSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsR0FBcUIsQ0FEdkIsR0FHRSxJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ2IsSUFBQyxDQUFBLE1BQUQsQ0FBQTtXQUNBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQWhCLEVBQW1CLENBQW5CO0VBYks7OzhCQWVQLElBQUEsR0FBTSxTQUFBO0FBQ0osUUFBQTtJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWjt1RUFDYSxDQUFDO0VBRlY7Ozs7R0EzY3dCLFFBQVEsQ0FBQyxVQUFVLENBQUMiLCJmaWxlIjoibW9kdWxlcy9zdWJ0ZXN0L3Byb3RvdHlwZXMvU3VydmV5UnVuSXRlbVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdXJ2ZXlSdW5JdGVtVmlldyBleHRlbmRzIEJhY2tib25lLk1hcmlvbmV0dGUuQ29tcG9zaXRlVmlld1xuXG4gIHRlbXBsYXRlOiBKU1RbXCJTdXJ2ZXlcIl0sXG4gIGNoaWxkVmlldzogUXVlc3Rpb25SdW5JdGVtVmlldyxcbiAgdGFnTmFtZTogXCJwXCIsXG4gIGNsYXNzTmFtZTogXCJTdXJ2ZXlSdW5JdGVtVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAubmV4dF9xdWVzdGlvbicgOiAnbmV4dFF1ZXN0aW9uJ1xuICAgICdjbGljayAucHJldl9xdWVzdGlvbicgOiAncHJldlF1ZXN0aW9uJ1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQG1vZGVsICAgICAgICAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCAgICAgICAgPSBAbW9kZWwucGFyZW50XG4gICAgQGRhdGFFbnRyeSAgICAgPSBvcHRpb25zLmRhdGFFbnRyeVxuICAgIEBpc09ic2VydmF0aW9uID0gb3B0aW9ucy5pc09ic2VydmF0aW9uXG4gICAgQGZvY3VzTW9kZSAgICAgPSBAbW9kZWwuZ2V0Qm9vbGVhbihcImZvY3VzTW9kZVwiKVxuICAgIEBxdWVzdGlvbkluZGV4ID0gMCBpZiBAZm9jdXNNb2RlXG4gICAgQHF1ZXN0aW9uVmlld3MgPSBbXVxuICAgIEBhbnN3ZXJlZCAgICAgID0gW11cbiAgICBAcmVuZGVyQ291bnQgICA9IDBcbiAgICBAbm90QXNrZWRDb3VudCA9IDBcbiAgICB2bS5jdXJyZW50VmlldyA9IFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1xuIyAgICBAY2hpbGRWaWV3T3B0aW9ucyA9XG4jICAgICAgICBwYXJlbnQ6IHRoaXNcblxuICAgIEBpMThuKClcbiMgICAgdGhpcy5saXN0ZW5UbyhAbW9kZWwuY29sbGVjdGlvbiwnY2hhbmdlJywgdGhpcy52aWV3UmVuZGVyKVxuIyAgICAgIHRoaXMubGlzdGVuVG8obW9kZWwuY29sbGVjdGlvbiwgJ3Jlc2V0JywgdGhpcy5yZW5kZXIpO1xuIyAgICBpZiBAbW9kZWwucXVlc3Rpb25zLmxlbmd0aCA9PSAwXG4jICAgICAgY29uc29sZS5sb2coXCJObyBxdWVzdGlvbnMuXCIpXG4gICAgQGNvbGxlY3Rpb24gPSBAbW9kZWwucXVlc3Rpb25zXG4gICAgQHF1ZXN0aW9ucyA9IEBjb2xsZWN0aW9uXG5cbiMgICAgQG1vZGVsLnF1ZXN0aW9ucy5mZXRjaFxuIyAgICAgIHZpZXdPcHRpb25zOlxuIyAgICAgICAga2V5OiBcInF1ZXN0aW9uLSN7QG1vZGVsLmlkfVwiXG4jICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pID0+XG4jIyAgICAgICAgQG1vZGVsLnF1ZXN0aW9ucy5zb3J0KClcbiMgICAgICAgIGNvbGxlY3Rpb24uc29ydCgpXG4jICAgICAgICBAbW9kZWwuY29sbGVjdGlvbi5tb2RlbHMgPSBjb2xsZWN0aW9uLm1vZGVsc1xuIyAgICAgICAgQHJlbmRlcigpXG5cbiAgICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcgPSBAXG4gICAgbGFiZWxzID0ge31cbiAgICBsYWJlbHMudGV4dCA9IEB0ZXh0XG4gICAgQG1vZGVsLnNldCgnbGFiZWxzJywgbGFiZWxzKVxuXG4gICAgQHNraXBwYWJsZSA9IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gdHJ1ZSB8fCBAbW9kZWwuZ2V0KFwic2tpcHBhYmxlXCIpID09IFwidHJ1ZVwiXG4gICAgQGJhY2thYmxlID0gKCBAbW9kZWwuZ2V0KFwiYmFja0J1dHRvblwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IFwidHJ1ZVwiICkgYW5kIEBwYXJlbnQuaW5kZXggaXNudCAwXG4gICAgQHBhcmVudC5kaXNwbGF5U2tpcChAc2tpcHBhYmxlKVxuICAgIEBwYXJlbnQuZGlzcGxheUJhY2soQGJhY2thYmxlKVxuXG4gICAgQGxpc3RlblRvXG5cbiAgdXBkYXRlUHJvZ3Jlc3NCdXR0b25zOiAtPlxuXG4gICAgaXNBdmFpbGFibGUgPSBbXVxuICAgIGZvciBxdiwgaSBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgaWYgcXY/XG4gICAgICAgIGlzQXZhaWxhYmxlLnB1c2ggaSBpZiBub3QgKHF2LmlzQXV0b3N0b3BwZWQgb3IgcXYuaXNTa2lwcGVkKVxuICAgIGlzQXZhaWxhYmxlLnB1c2ggQHF1ZXN0aW9uSW5kZXhcblxuICAgICRwcmV2ID0gQHBhcmVudC4kZWwuZmluZChcIi5wcmV2X3F1ZXN0aW9uXCIpXG4gICAgJG5leHQgPSBAcGFyZW50LiRlbC5maW5kKFwiLm5leHRfcXVlc3Rpb25cIilcblxuICAgIG1pbmltdW0gPSBNYXRoLm1pbi5hcHBseSggbWluaW11bSwgaXNBdmFpbGFibGUgKVxuICAgIG1heGltdW0gPSBNYXRoLm1heC5hcHBseSggbWF4aW11bSwgaXNBdmFpbGFibGUgKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggPT0gbWluaW11bVxuICAgICAgJHByZXYuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgJHByZXYuc2hvdygpXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCA9PSBtYXhpbXVtXG4gICAgICAkbmV4dC5oaWRlKClcbiAgICBlbHNlXG4gICAgICAkbmV4dC5zaG93KClcblxuICB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHk6IC0+XG5cbiAgICByZXR1cm4gdW5sZXNzIEBtb2RlbC5nZXQoXCJmb2N1c01vZGVcIilcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IEBxdWVzdGlvblZpZXdzLmxlbmd0aFxuIyAgICAgICQoXCIjc3VtbWFyeV9jb250YWluZXJcIikuaHRtbCBcIlxuIyAgICAgICAgbGFzdCBwYWdlIGhlcmVcbiMgICAgICBcIlxuICAgICAgJChcIi5uZXh0X3F1ZXN0aW9uXCIpLmhpZGUoKVxuICAgIGVsc2VcbiAgICAgICQoXCIjc3VtbWFyeV9jb250YWluZXJcIikuZW1wdHkoKVxuICAgICAgJChcIi5uZXh0X3F1ZXN0aW9uXCIpLnNob3coKVxuXG4gICAgJHF1ZXN0aW9ucyA9IEAkZWwuZmluZChcIi5xdWVzdGlvblwiKVxuICAgICRxdWVzdGlvbnMuaGlkZSgpXG4gICAgJHF1ZXN0aW9ucy5lcShAcXVlc3Rpb25JbmRleCkuc2hvdygpXG5cbiAgICAjIHRyaWdnZXIgdGhlIHF1ZXN0aW9uIHRvIHJ1biBpdCdzIGRpc3BsYXkgY29kZSBpZiB0aGUgc3VidGVzdCdzIGRpc3BsYXljb2RlIGhhcyBhbHJlYWR5IHJhblxuICAgICMgaWYgbm90LCBhZGQgaXQgdG8gYSBsaXN0IHRvIHJ1biBsYXRlci5cbiAgICBpZiBAZXhlY3V0ZVJlYWR5XG4gICAgICBAcXVlc3Rpb25WaWV3c1tAcXVlc3Rpb25JbmRleF0udHJpZ2dlciBcInNob3dcIlxuICAgIGVsc2VcbiAgICAgIEB0cmlnZ2VyU2hvd0xpc3QgPSBbXSBpZiBub3QgQHRyaWdnZXJTaG93TGlzdFxuICAgICAgQHRyaWdnZXJTaG93TGlzdC5wdXNoIEBxdWVzdGlvbkluZGV4XG5cbiAgc2hvd1F1ZXN0aW9uOiAoaW5kZXgpIC0+XG4gICAgQHF1ZXN0aW9uSW5kZXggPSBpbmRleCBpZiBfLmlzTnVtYmVyKGluZGV4KSAmJiBpbmRleCA8IEBxdWVzdGlvblZpZXdzLmxlbmd0aCAmJiBpbmRleCA+IDBcbiAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiMgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG5cbiAgdXBkYXRlRXhlY3V0ZVJlYWR5OiAocmVhZHkpIC0+XG4gICAgQGV4ZWN1dGVSZWFkeSA9IHJlYWR5XG5cbiAgICByZXR1cm4gaWYgbm90IEB0cmlnZ2VyU2hvd0xpc3Q/XG5cbiAgICBpZiBAdHJpZ2dlclNob3dMaXN0Lmxlbmd0aCA+IDBcbiAgICAgIGZvciBpbmRleCBpbiBAdHJpZ2dlclNob3dMaXN0XG4gICAgICAgIEBxdWVzdGlvblZpZXdzW2luZGV4XT8udHJpZ2dlciBcInNob3dcIlxuICAgICAgQHRyaWdnZXJTaG93TGlzdCA9IFtdXG5cbiAgICBAdXBkYXRlU2tpcExvZ2ljKCkgaWYgQGV4ZWN1dGVSZWFkeVxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgcGxlYXNlQW5zd2VyIDogdChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5wbGVhc2VfYW5zd2VyXCIpXG4gICAgICBjb3JyZWN0RXJyb3JzIDogdChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5jb3JyZWN0X2Vycm9yc1wiKVxuICAgICAgbm90RW5vdWdoIDogXyh0KFwiU3VydmV5UnVuVmlldy5tZXNzYWdlLm5vdF9lbm91Z2hcIikpLmVzY2FwZSgpXG5cbiAgICAgIHByZXZpb3VzUXVlc3Rpb24gOiB0KFwiU3VydmV5UnVuVmlldy5idXR0b24ucHJldmlvdXNfcXVlc3Rpb25cIilcbiAgICAgIG5leHRRdWVzdGlvbiA6IHQoXCJTdXJ2ZXlSdW5WaWV3LmJ1dHRvbi5uZXh0X3F1ZXN0aW9uXCIpXG4gICAgICBcIm5leHRcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24ubmV4dFwiKVxuICAgICAgXCJiYWNrXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLmJhY2tcIilcbiAgICAgIFwic2tpcFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5za2lwXCIpXG4gICAgICBcImhlbHBcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uaGVscFwiKVxuXG4gICMgd2hlbiBhIHF1ZXN0aW9uIGlzIGFuc3dlcmVkXG4gIG9uUXVlc3Rpb25BbnN3ZXI6IChlbGVtZW50KSAtPlxuIyAgICBjb25zb2xlLmxvZyhcIm9uUXVlc3Rpb25BbnN3ZXIgQHJlbmRlckNvdW50OlwiICsgQHJlbmRlckNvdW50ICsgXCIgIEBxdWVzdGlvbnMubGVuZ3RoOiBcIiArICBAcXVlc3Rpb25zLmxlbmd0aClcbiMgICAgdGhpcyBpcyBub3QgZ29vZC4gU2hvdWxkIHRlc3QgZm9yID09XG4gICAgcmV0dXJuIHVubGVzcyBAcmVuZGVyQ291bnQgPj0gQHF1ZXN0aW9ucy5sZW5ndGhcblxuICAgICMgYXV0byBzdG9wIGFmdGVyIGxpbWl0XG4gICAgQGF1dG9zdG9wcGVkICAgID0gZmFsc2VcbiAgICBhdXRvc3RvcExpbWl0ICAgPSBAbW9kZWwuZ2V0TnVtYmVyIFwiYXV0b3N0b3BMaW1pdFwiXG4gICAgbG9uZ2VzdFNlcXVlbmNlID0gMFxuICAgIGF1dG9zdG9wQ291bnQgICA9IDBcblxuICAgIGlmIGF1dG9zdG9wTGltaXQgPiAwXG4gICAgICBmb3IgaSBpbiBbMS4uQHF1ZXN0aW9uVmlld3MubGVuZ3RoXSAjIGp1c3QgaW4gY2FzZSB0aGV5IGNhbid0IGNvdW50XG4gICAgICAgIGN1cnJlbnRBbnN3ZXIgPSBAcXVlc3Rpb25WaWV3c1tpLTFdLmFuc3dlclxuICAgICAgICBpZiBjdXJyZW50QW5zd2VyID09IFwiMFwiIG9yIGN1cnJlbnRBbnN3ZXIgPT0gXCI5XCJcbiAgICAgICAgICBhdXRvc3RvcENvdW50KytcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGF1dG9zdG9wQ291bnQgPSAwXG4gICAgICAgIGxvbmdlc3RTZXF1ZW5jZSA9IE1hdGgubWF4KGxvbmdlc3RTZXF1ZW5jZSwgYXV0b3N0b3BDb3VudClcbiAgICAgICAgIyBpZiB0aGUgdmFsdWUgaXMgc2V0LCB3ZSd2ZSBnb3QgYSB0aHJlc2hvbGQgZXhjZWVkaW5nIHJ1biwgYW5kIGl0J3Mgbm90IGFscmVhZHkgYXV0b3N0b3BwZWRcbiAgICAgICAgaWYgYXV0b3N0b3BMaW1pdCAhPSAwICYmIGxvbmdlc3RTZXF1ZW5jZSA+PSBhdXRvc3RvcExpbWl0ICYmIG5vdCBAYXV0b3N0b3BwZWRcbiAgICAgICAgICBAYXV0b3N0b3BwZWQgPSB0cnVlXG4gICAgICAgICAgQGF1dG9zdG9wSW5kZXggPSBpXG4gICAgQHVwZGF0ZUF1dG9zdG9wKClcbiAgICBAdXBkYXRlU2tpcExvZ2ljKClcblxuICB1cGRhdGVBdXRvc3RvcDogLT5cbiAgICBhdXRvc3RvcExpbWl0ID0gQG1vZGVsLmdldE51bWJlciBcImF1dG9zdG9wTGltaXRcIlxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHZpZXcsIGkpIC0+XG4gICAgICBpZiBpID4gKEBhdXRvc3RvcEluZGV4IC0gMSlcbiAgICAgICAgaWYgQGF1dG9zdG9wcGVkXG4gICAgICAgICAgdmlldy5pc0F1dG9zdG9wcGVkID0gdHJ1ZVxuICAgICAgICAgIHZpZXcuJGVsLmFkZENsYXNzICAgIFwiZGlzYWJsZWRfYXV0b3N0b3BcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgdmlldy5pc0F1dG9zdG9wcGVkID0gZmFsc2VcbiAgICAgICAgICB2aWV3LiRlbC5yZW1vdmVDbGFzcyBcImRpc2FibGVkX2F1dG9zdG9wXCJcbiAgICAsIEBcblxuICB1cGRhdGVTa2lwTG9naWM6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwidXBkYXRlU2tpcExvZ2ljXCIpXG4jICAgIGNvbnNvbGUubG9nKFwiQHF1ZXN0aW9uVmlld3NcIiArIEBxdWVzdGlvblZpZXdzLmxlbmd0aClcbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoIChxdikgLT5cbiAgICAgIHF1ZXN0aW9uID0gcXYubW9kZWxcbiAgICAgIHNraXBMb2dpY0NvZGUgPSBxdWVzdGlvbi5nZXRTdHJpbmcgXCJza2lwTG9naWNcIlxuICAgICAgdW5sZXNzIHNraXBMb2dpY0NvZGUgaXMgXCJcIlxuICAgICAgICB0cnlcbiAgICAgICAgICByZXN1bHQgPSBDb2ZmZWVTY3JpcHQuZXZhbC5hcHBseShALCBbc2tpcExvZ2ljQ29kZV0pXG4jICAgICAgICAgIGNvbnNvbGUubG9nKFwic2tpcExvZ2ljQ29kZTogXCIgKyBza2lwTG9naWNDb2RlKVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIG5hbWUgPSAoKC9mdW5jdGlvbiAoLnsxLH0pXFwoLykuZXhlYyhlcnJvci5jb25zdHJ1Y3Rvci50b1N0cmluZygpKVsxXSlcbiAgICAgICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgICAgICAgIGFsZXJ0IFwiU2tpcCBsb2dpYyBlcnJvciBpbiBxdWVzdGlvbiAje3F1ZXN0aW9uLmdldCgnbmFtZScpfVxcblxcbiN7bmFtZX1cXG5cXG4je21lc3NhZ2V9XCJcblxuICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICBxdi4kZWwuYWRkQ2xhc3MgXCJkaXNhYmxlZF9za2lwcGVkXCJcbiAgICAgICAgICBxdi5pc1NraXBwZWQgPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBxdi4kZWwucmVtb3ZlQ2xhc3MgXCJkaXNhYmxlZF9za2lwcGVkXCJcbiAgICAgICAgICBxdi5pc1NraXBwZWQgPSBmYWxzZVxuICAgICAgcXYudXBkYXRlVmFsaWRpdHkoKVxuICAgICwgQFxuXG4gIGlzVmFsaWQ6ICh2aWV3cyA9IEBxdWVzdGlvblZpZXdzKSAtPlxuICAgIHJldHVybiB0cnVlIGlmIG5vdCB2aWV3cz8gIyBpZiB0aGVyZSdzIG5vdGhpbmcgdG8gY2hlY2ssIGl0IG11c3QgYmUgZ29vZFxuICAgIHZpZXdzID0gW3ZpZXdzXSBpZiBub3QgXy5pc0FycmF5KHZpZXdzKVxuICAgIGZvciBxdiwgaSBpbiB2aWV3c1xuICAgICAgcXYudXBkYXRlVmFsaWRpdHkoKVxuICAgICAgIyBjYW4gd2Ugc2tpcCBpdD9cbiAgICAgIGlmIG5vdCBxdi5tb2RlbC5nZXRCb29sZWFuKFwic2tpcHBhYmxlXCIpXG4gICAgICAgICMgaXMgaXQgdmFsaWRcbiAgICAgICAgaWYgbm90IHF2LmlzVmFsaWRcbiAgICAgICAgICAjIHJlZCBhbGVydCEhXG4jICAgICAgICAgIGNvbnNvbGUubG9nKFwicG9wIHVwIGFuIGVycm9yXCIpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4jICAgICwgQFxuICAgIHJldHVybiB0cnVlXG5cbiAgdGVzdFZhbGlkOiAtPlxuIyAgICBjb25zb2xlLmxvZyhcIlN1cnZleVJpbkl0ZW0gdGVzdFZhbGlkLlwiKVxuIyAgICBpZiBub3QgQHByb3RvdHlwZVJlbmRlcmVkIHRoZW4gcmV0dXJuIGZhbHNlXG4jICAgIGN1cnJlbnRWaWV3ID0gVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XG4jICAgIGlmIEBpc1ZhbGlkP1xuIyAgICBjb25zb2xlLmxvZyhcInRlc3R2YWxpZDogXCIgKyBAaXNWYWxpZD8pXG4gICAgcmV0dXJuIEBpc1ZhbGlkKClcbiMgICAgZWxzZVxuIyAgICAgIHJldHVybiBmYWxzZVxuIyAgICB0cnVlXG5cblxuICAjIEBUT0RPIHRoaXMgc2hvdWxkIHByb2JhYmx5IGJlIHJldHVybmluZyBtdWx0aXBsZSwgc2luZ2xlIHR5cGUgaGFzaCB2YWx1ZXNcbiAgZ2V0U2tpcHBlZDogLT5cbiAgICByZXN1bHQgPSB7fVxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuICAgICAgcmVzdWx0W0BxdWVzdGlvbnMubW9kZWxzW2ldLmdldChcIm5hbWVcIildID0gXCJza2lwcGVkXCJcbiAgICAsIEBcbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgZ2V0UmVzdWx0OiAtPlxuICAgIHJlc3VsdCA9IHt9XG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAocXYsIGkpIC0+XG4jICAgICAgcmVzdWx0W0BxdWVzdGlvbnMubW9kZWxzW2ldLmdldChcIm5hbWVcIildID1cbiAgICAgIHJlc3VsdFtxdi5uYW1lXSA9XG4gICAgICAgIGlmIHF2Lm5vdEFza2VkICMgYmVjYXVzZSBvZiBncmlkIHNjb3JlXG4gICAgICAgICAgcXYubm90QXNrZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBub3QgXy5pc0VtcHR5KHF2LmFuc3dlcikgIyB1c2UgYW5zd2VyXG4gICAgICAgICAgcXYuYW5zd2VyXG4gICAgICAgIGVsc2UgaWYgcXYuc2tpcHBlZFxuICAgICAgICAgIHF2LnNraXBwZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBxdi5pc1NraXBwZWRcbiAgICAgICAgICBxdi5sb2dpY1NraXBwZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBxdi5pc0F1dG9zdG9wcGVkXG4gICAgICAgICAgcXYubm90QXNrZWRBdXRvc3RvcFJlc3VsdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgcXYuYW5zd2VyXG4gICAgLCBAXG4gICAgaGFzaCA9IEBtb2RlbC5nZXQoXCJoYXNoXCIpIGlmIEBtb2RlbC5oYXMoXCJoYXNoXCIpXG4gICAgc3VidGVzdFJlc3VsdCA9XG4gICAgICAnYm9keScgOiByZXN1bHRcbiAgICAgICdtZXRhJyA6XG4gICAgICAgICdoYXNoJyA6IGhhc2hcbiMgICAgcmV0dXJuIHJlc3VsdFxuXG4gIHNob3dFcnJvcnM6ICh2aWV3cyA9IEBxdWVzdGlvblZpZXdzKSAtPlxuICAgIEAkZWwuZmluZCgnLm1lc3NhZ2UnKS5yZW1vdmUoKVxuICAgIGZpcnN0ID0gdHJ1ZVxuICAgIHZpZXdzID0gW3ZpZXdzXSBpZiBub3QgXy5pc0FycmF5KHZpZXdzKVxuICAgIHZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuICAgICAgaWYgbm90IF8uaXNTdHJpbmcocXYpXG4gICAgICAgIG1lc3NhZ2UgPSBcIlwiXG4gICAgICAgIGlmIG5vdCBxdi5pc1ZhbGlkXG4gICAgICAgICAgIyBoYW5kbGUgY3VzdG9tIHZhbGlkYXRpb24gZXJyb3IgbWVzc2FnZXNcbiAgICAgICAgICBjdXN0b21NZXNzYWdlID0gcXYubW9kZWwuZ2V0KFwiY3VzdG9tVmFsaWRhdGlvbk1lc3NhZ2VcIilcbiAgICAgICAgICBpZiBub3QgXy5pc0VtcHR5KGN1c3RvbU1lc3NhZ2UpXG4gICAgICAgICAgICBtZXNzYWdlID0gY3VzdG9tTWVzc2FnZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBAdGV4dC5wbGVhc2VBbnN3ZXJcblxuICAgICAgICAgIGlmIGZpcnN0ID09IHRydWVcbiAgICAgICAgICAgIEBzaG93UXVlc3Rpb24oaSkgaWYgdmlld3MgPT0gQHF1ZXN0aW9uVmlld3NcbiAgICAgICAgICAgIHF2LiRlbC5zY3JvbGxUbygpXG4gICAgICAgICAgICBVdGlscy5taWRBbGVydCBAdGV4dC5jb3JyZWN0RXJyb3JzXG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlXG4gICAgICAgIHF2LnNldE1lc3NhZ2UgbWVzc2FnZVxuICAgICwgQFxuXG5cbiAgZ2V0U3VtOiAtPlxuICAgIHJldHVybiB7Y29ycmVjdDowLGluY29ycmVjdDowLG1pc3Npbmc6MCx0b3RhbDowfVxuXG4gIGNoaWxkRXZlbnRzOlxuICAgICdhbnN3ZXIgc2Nyb2xsJzogJ29uUXVlc3Rpb25BbnN3ZXInXG4gICAgJ2Fuc3dlcic6ICdvblF1ZXN0aW9uQW5zd2VyJ1xuICAgICdyZW5kZXJlZCc6ICdvblF1ZXN0aW9uUmVuZGVyZWQnXG5cbiAgIyBUaGlzIHRlc3RzIGlmIGFkZDpjaGlsZCBpcyB0cmlnZ2VyZWQgb24gdGhlIHN1YnRlc3QgaW5zdGVhZCBvZiBvbiBBc3Nlc3NtZW50Q29tcG9zaXRlVmlldy5cbiAgZm9vOiAtPlxuICAgIGNvbnNvbGUubG9nKFwidGVzdCAxMjMgU1YgY2hpbGQgZm9vXCIpXG5cbiAgIyBwb3B1bGF0ZXMgQHF1ZXN0aW9uVmlld3MgZm9yIHRoaXMgdmlldy5cbiAgYnVpbGRDaGlsZFZpZXc6IChjaGlsZCwgQ2hpbGRWaWV3Q2xhc3MsIGNoaWxkVmlld09wdGlvbnMpIC0+XG4gICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHttb2RlbDogY2hpbGR9LCBjaGlsZFZpZXdPcHRpb25zKTtcbiAgICBjaGlsZFZpZXcgPSBuZXcgQ2hpbGRWaWV3Q2xhc3Mob3B0aW9ucylcbiAgICByZXF1aXJlZCA9IGNoaWxkLmdldE51bWJlciBcImxpbmtlZEdyaWRTY29yZVwiXG4gICAgaXNOb3RBc2tlZCA9ICggKCByZXF1aXJlZCAhPSAwICYmIEBwYXJlbnQuZ2V0R3JpZFNjb3JlKCkgPCByZXF1aXJlZCApIHx8IEBwYXJlbnQuZ3JpZFdhc0F1dG9zdG9wcGVkKCkgKSAmJiBAcGFyZW50LmdldEdyaWRTY29yZSgpICE9IGZhbHNlXG4gICAgY2hpbGQuc2V0ICBcIm5vdEFza2VkXCIsIGlzTm90QXNrZWRcbiAgICBpZiBpc05vdEFza2VkIHRoZW4gQG5vdEFza2VkQ291bnQrK1xuICAgIE1hcmlvbmV0dGUuTW9uaXRvckRPTVJlZnJlc2goY2hpbGRWaWV3KTtcbiAgICBAcXVlc3Rpb25WaWV3c1tjaGlsZFZpZXdPcHRpb25zLmluZGV4XSA9IGNoaWxkVmlld1xuXG4gICAgcmV0dXJuIGNoaWxkVmlld1xuICAsXG5cbiMgIFBhc3NlcyBvcHRpb25zIHRvIGVhY2ggY2hpbGRWaWV3IGluc3RhbmNlXG4gIGNoaWxkVmlld09wdGlvbnM6IChtb2RlbCwgaW5kZXgpLT5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgcHJldmlvdXMgPSBAbW9kZWwucGFyZW50LnJlc3VsdC5nZXRCeUhhc2goQG1vZGVsLmdldCgnaGFzaCcpKVxuXG4gICAgbmFtZSAgID0gbW9kZWwuZXNjYXBlKFwibmFtZVwiKS5yZXBsYWNlIC9bXkEtWmEtejAtOV9dL2csIFwiLVwiXG4gICAgYW5zd2VyID0gcHJldmlvdXNbbmFtZV0gaWYgcHJldmlvdXNcbiAgICBsYWJlbHMgPSB7fVxuICAgIGxhYmVscy50ZXh0ID0gQHRleHRcbiAgICBtb2RlbC5zZXQoJ2xhYmVscycsIGxhYmVscylcbiAgICBvcHRpb25zID1cbiAgICAgIG1vZGVsICAgICAgICAgOiBtb2RlbFxuICAgICAgcGFyZW50ICAgICAgICA6IEBcbiAgICAgIGRhdGFFbnRyeSAgICAgOiBAZGF0YUVudHJ5XG4gICAgICBub3RBc2tlZCAgICAgIDogbW9kZWwuZ2V0IFwibm90QXNrZWRcIlxuICAgICAgaXNPYnNlcnZhdGlvbiA6IEBpc09ic2VydmF0aW9uXG4gICAgICBhbnN3ZXIgICAgICAgIDogYW5zd2VyXG4gICAgICBpbmRleCAgOiBpbmRleFxuICAgIHJldHVybiBvcHRpb25zXG5cbiAgb25CZWZvcmVSZW5kZXI6IC0+XG4jICAgIEBxdWVzdGlvbnMuc29ydCgpXG5cbiAgb25SZW5kZXI6IC0+XG5cbiAgICBub3RBc2tlZENvdW50ID0gMFxuICAgIGlmIEBtb2RlbC5xdWVzdGlvbnM/XG4gICAgICBAbW9kZWwucXVlc3Rpb25zLm1vZGVscy5mb3JFYWNoIChxdWVzdGlvbiwgaSkgPT5cbiMgc2tpcCB0aGUgcmVzdCBpZiBzY29yZSBub3QgaGlnaCBlbm91Z2hcbiAgICAgICAgcmVxdWlyZWQgPSBxdWVzdGlvbi5nZXROdW1iZXIgXCJsaW5rZWRHcmlkU2NvcmVcIlxuICAgICAgICBpc05vdEFza2VkID0gKCAoIHJlcXVpcmVkICE9IDAgJiYgQHBhcmVudC5nZXRHcmlkU2NvcmUoKSA8IHJlcXVpcmVkICkgfHwgQHBhcmVudC5ncmlkV2FzQXV0b3N0b3BwZWQoKSApICYmIEBwYXJlbnQuZ2V0R3JpZFNjb3JlKCkgIT0gZmFsc2VcbiAgICAgICAgcXVlc3Rpb24uc2V0ICBcIm5vdEFza2VkXCIsIGlzTm90QXNrZWRcbiAgICAgICAgaWYgaXNOb3RBc2tlZCB0aGVuIEBub3RBc2tlZENvdW50KytcbiAgICBAdHJpZ2dlciBcInJlYWR5XCJcblxuIyAgICBpZiBAZm9jdXNNb2RlXG4jICAgICAgJCgnI3N1YnRlc3Rfd3JhcHBlcicpLmFmdGVyICQgXCJcbiMgICAgICAgICAgICA8ZGl2IGlkPSdzdW1tYXJ5X2NvbnRhaW5lcic+PC9kaXY+XG4jICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBwcmV2X3F1ZXN0aW9uJz4je0B0ZXh0LnByZXZpb3VzUXVlc3Rpb259PC9idXR0b24+XG4jICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBuZXh0X3F1ZXN0aW9uJz4je0B0ZXh0Lm5leHRRdWVzdGlvbn08L2J1dHRvbj5cbiMgICAgICAgICAgXCJcblxuICBvblJlbmRlckNvbGxlY3Rpb246LT5cbiMgICAgaWYgQGZvY3VzTW9kZVxuIyAgICAgICQoJyNzdWJ0ZXN0X3dyYXBwZXInKS5hZnRlciAkIFwiXG4jICAgICAgICAgICAgPGRpdiBpZD0nc3VtbWFyeV9jb250YWluZXInPjwvZGl2PlxuIyAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gcHJldl9xdWVzdGlvbic+I3tAdGV4dC5wcmV2aW91c1F1ZXN0aW9ufTwvYnV0dG9uPlxuIyAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gbmV4dF9xdWVzdGlvbic+I3tAdGV4dC5uZXh0UXVlc3Rpb259PC9idXR0b24+XG4jICAgICAgICAgIFwiXG4gICAgQHVwZGF0ZUV4ZWN1dGVSZWFkeSh0cnVlKVxuICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuXG4gICAgaWYgQHF1ZXN0aW9ucy5sZW5ndGggPT0gQG5vdEFza2VkQ291bnRcbiAgICAgIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpICE9IFwiY2xhc3NcIlxuICAgICAgICBAcGFyZW50Lm5leHQ/KClcbiAgICAgIGVsc2VcbiMgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCAkIFwiPHAgY2xhc3M9J2dyZXknPiN7QHRleHQubm90RW5vdWdofTwvcD5cIlxuICAgICAgICBhbGVydCBAdGV4dC5ub3RFbm91Z2hcblxuIyAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuXG5cbiMgIG9uU2hvdzogLT5cbiMgICAgY29uc29sZS5sb2coXCJvblNob3dcIilcbiMgICAgaWYgQGZvY3VzTW9kZVxuIyAgICAgICQoJyNzdWJ0ZXN0X3dyYXBwZXInKS5hZnRlciAkIFwiXG4jICAgICAgICAgICAgPGRpdiBpZD0nc3VtbWFyeV9jb250YWluZXInPjwvZGl2PlxuIyAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gcHJldl9xdWVzdGlvbic+I3tAdGV4dC5wcmV2aW91c1F1ZXN0aW9ufTwvYnV0dG9uPlxuIyAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gbmV4dF9xdWVzdGlvbic+I3tAdGV4dC5uZXh0UXVlc3Rpb259PC9idXR0b24+XG4jICAgICAgICAgIFwiXG4jICAgIEB1cGRhdGVFeGVjdXRlUmVhZHkodHJ1ZSlcbiMgICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4jICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuI1xuIyAgICBpZiBAcXVlc3Rpb25zLmxlbmd0aCA9PSBAbm90QXNrZWRDb3VudFxuIyAgICAgIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpICE9IFwiY2xhc3NcIlxuIyAgICAgICAgQHBhcmVudC5uZXh0PygpXG4jICAgICAgZWxzZVxuIyMgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCAkIFwiPHAgY2xhc3M9J2dyZXknPiN7QHRleHQubm90RW5vdWdofTwvcD5cIlxuIyAgICAgICAgYWxlcnQgQHRleHQubm90RW5vdWdoXG4jXG4jICAgICMgICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4jICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4gIG9uU2hvdzogLT5cbiAgICBkaXNwbGF5Q29kZSA9IEBtb2RlbC5nZXRTdHJpbmcoXCJkaXNwbGF5Q29kZVwiKVxuXG4gICAgaWYgbm90IF8uaXNFbXB0eVN0cmluZyhkaXNwbGF5Q29kZSlcbiAgICAgIGRpc3BsYXljb2RlRml4ZWQgPSBkaXNwbGF5Q29kZS5yZXBsYWNlKFwidm0uY3VycmVudFZpZXcuc3VidGVzdFZpZXdzW3ZtLmN1cnJlbnRWaWV3LmluZGV4XS5wcm90b3R5cGVWaWV3XCIsXCJUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXdcIilcbiAgICAgIHRyeVxuICAgICAgICBDb2ZmZWVTY3JpcHQuZXZhbC5hcHBseShALCBbZGlzcGxheWNvZGVGaXhlZF0pXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICBuYW1lID0gKCgvZnVuY3Rpb24gKC57MSx9KVxcKC8pLmV4ZWMoZXJyb3IuY29uc3RydWN0b3IudG9TdHJpbmcoKSlbMV0pXG4gICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgIGFsZXJ0IFwiI3tuYW1lfVxcblxcbiN7bWVzc2FnZX1cIlxuICAgICAgICBjb25zb2xlLmxvZyBcImRpc3BsYXljb2RlRml4ZWQgRXJyb3I6IFwiICsgSlNPTi5zdHJpbmdpZnkoZXJyb3IpXG5cbiAgICBAcHJvdG90eXBlVmlldz8udXBkYXRlRXhlY3V0ZVJlYWR5Pyh0cnVlKVxuXG4jIEB0b2RvIERvY3VtZW50YXRpb25cbiAgc2tpcDogPT5cbiAgICBjdXJyZW50VmlldyA9IFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1xuICAgIEBwYXJlbnQucmVzdWx0LmFkZFxuICAgICAgbmFtZSAgICAgIDogY3VycmVudFZpZXcubW9kZWwuZ2V0IFwibmFtZVwiXG4gICAgICBkYXRhICAgICAgOiBjdXJyZW50Vmlldy5nZXRTa2lwcGVkKClcbiAgICAgIHN1YnRlc3RJZCA6IGN1cnJlbnRWaWV3Lm1vZGVsLmlkXG4gICAgICBza2lwcGVkICAgOiB0cnVlXG4gICAgICBwcm90b3R5cGUgOiBjdXJyZW50Vmlldy5tb2RlbC5nZXQgXCJwcm90b3R5cGVcIlxuICAgICxcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIEBwYXJlbnQucmVzZXQgMVxuXG4gICMgRG91YnQgdGhpcyBpcyBoYXBwZW5pbmcgYWZ0ZXIgdGhlIHF1ZXN0aW9uIHdhcyByZW5kZXJlZC4gVE9ETzogZmluZCB0aGUgcmlnaHQgcGxhY2UuXG4gIG9uUXVlc3Rpb25SZW5kZXJlZDotPlxuIyAgICBjb25zb2xlLmxvZyhcIm9uUXVlc3Rpb25SZW5kZXJlZCBAcmVuZGVyQ291bnQ6IFwiICsgQHJlbmRlckNvdW50KVxuICAgIEByZW5kZXJDb3VudCsrXG4jICAgIGNvbnNvbGUubG9nKFwib25RdWVzdGlvblJlbmRlcmVkIEByZW5kZXJDb3VudCBpbmNyZW1lbnRlZDogXCIgKyBAcmVuZGVyQ291bnQpXG4gICAgaWYgQHJlbmRlckNvdW50ID09IEBxdWVzdGlvbnMubGVuZ3RoXG4gICAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiAgICAgIEB1cGRhdGVTa2lwTG9naWMoKVxuIyAgICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuIyAgICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuIyAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuIyAgb25TaG93Oi0+XG4jICAgIGNvbnNvbGUubG9nKFwiaVNob3duIVwiKVxuIyAgICBAb25SZW5kZXJDb2xsZWN0aW9uKClcblxuICBvbkNsb3NlOi0+XG4gICAgZm9yIHF2IGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBxdi5jbG9zZT8oKVxuICAgIEBxdWVzdGlvblZpZXdzID0gW11cblxuICByZXNldDogKGluY3JlbWVudCkgLT5cbiAgICBjb25zb2xlLmxvZyhcInJlc2V0XCIpXG4gICAgQHJlbmRlcmVkLnN1YnRlc3QgPSBmYWxzZVxuICAgIEByZW5kZXJlZC5hc3Nlc3NtZW50ID0gZmFsc2VcbiAgICAjICAgIGN1cnJlbnRWaWV3ID0gQHN1YnRlc3RWaWV3c1tAb3JkZXJNYXBbQGluZGV4XV1cbiAgICAjICAgIGN1cnJlbnRWaWV3LmNsb3NlKClcbiAgICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcuY2xvc2UoKTtcbiAgICBAaW5kZXggPVxuICAgICAgaWYgQGFib3J0QXNzZXNzbWVudCA9PSB0cnVlXG4gICAgICAgIEBzdWJ0ZXN0Vmlld3MubGVuZ3RoLTFcbiAgICAgIGVsc2VcbiAgICAgICAgQGluZGV4ICsgaW5jcmVtZW50XG4gICAgQHJlbmRlcigpXG4gICAgd2luZG93LnNjcm9sbFRvIDAsIDBcblxuICBuZXh0OiAoKSAtPlxuICAgIGNvbnNvbGUubG9nKFwibmV4dFwiKVxuICAgIEBtb2RlbC5wYXJlbnQubmV4dD8oKVxuIl19

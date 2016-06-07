var SurveyRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SurveyRunView = (function(superClass) {
  extend(SurveyRunView, superClass);

  function SurveyRunView() {
    this.onQuestionRendered = bind(this.onQuestionRendered, this);
    this.getResult = bind(this.getResult, this);
    this.updateSkipLogic = bind(this.updateSkipLogic, this);
    this.onQuestionAnswer = bind(this.onQuestionAnswer, this);
    this.updateExecuteReady = bind(this.updateExecuteReady, this);
    return SurveyRunView.__super__.constructor.apply(this, arguments);
  }

  SurveyRunView.prototype.className = "SurveyRunView";

  SurveyRunView.prototype.events = {
    'click .next_question': 'nextQuestion',
    'click .prev_question': 'prevQuestion'
  };

  SurveyRunView.prototype.nextQuestion = function() {
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

  SurveyRunView.prototype.prevQuestion = function() {
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

  SurveyRunView.prototype.updateProgressButtons = function() {
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

  SurveyRunView.prototype.updateExecuteReady = function(ready) {
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

  SurveyRunView.prototype.updateQuestionVisibility = function() {
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

  SurveyRunView.prototype.showQuestion = function(index) {
    if (_.isNumber(index) && index < this.questionViews.length && index > 0) {
      this.questionIndex = index;
    }
    this.updateQuestionVisibility();
    return this.updateProgressButtons();
  };

  SurveyRunView.prototype.i18n = function() {
    return this.text = {
      pleaseAnswer: t("SurveyRunView.message.please_answer"),
      correctErrors: t("SurveyRunView.message.correct_errors"),
      notEnough: _(t("SurveyRunView.message.not_enough")).escape(),
      previousQuestion: t("SurveyRunView.button.previous_question"),
      nextQuestion: t("SurveyRunView.button.next_question")
    };
  };

  SurveyRunView.prototype.initialize = function(options) {
    this.model = options.model;
    this.parent = options.parent;
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
    this.questions = new Questions();
    return this.questions.fetch({
      viewOptions: {
        key: "question-" + this.model.id
      },
      success: (function(_this) {
        return function(collection) {
          _this.questions.sort();
          _this.ready = true;
          return _this.render();
        };
      })(this)
    });
  };

  SurveyRunView.prototype.onQuestionAnswer = function(element) {
    var autostopCount, autostopLimit, currentAnswer, i, j, longestSequence, ref;
    if (this.renderCount !== this.questions.length) {
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

  SurveyRunView.prototype.updateAutostop = function() {
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

  SurveyRunView.prototype.updateSkipLogic = function() {
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

  SurveyRunView.prototype.isValid = function(views) {
    if (views == null) {
      views = this.questionViews;
    }
    if (views == null) {
      return true;
    }
    if (!_.isArray(views)) {
      views = [views];
    }
    views.forEach(function(qv, i) {
      qv.updateValidity();
      if (!qv.model.getBoolean("skippable")) {
        if (!qv.isValid) {
          return false;
        }
      }
    }, this);
    return true;
  };

  SurveyRunView.prototype.getSkipped = function() {
    var result;
    result = {};
    this.questionViews.forEach(function(qv, i) {
      return result[this.questions.models[i].get("name")] = "skipped";
    }, this);
    return result;
  };

  SurveyRunView.prototype.getResult = function() {
    var result;
    result = {};
    this.questionViews.forEach(function(qv, i) {
      return result[this.questions.models[i].get("name")] = qv.notAsked ? qv.notAskedResult : !_.isEmpty(qv.answer) ? qv.answer : qv.skipped ? qv.skippedResult : qv.isSkipped ? qv.logicSkippedResult : qv.isAutostopped ? qv.notAskedAutostopResult : qv.answer;
    }, this);
    return result;
  };

  SurveyRunView.prototype.showErrors = function(views) {
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

  SurveyRunView.prototype.render = function() {
    var base, container, notAskedCount, previous;
    if (!this.ready) {
      return;
    }
    this.$el.empty();
    container = document.createDocumentFragment();
    if (!this.dataEntry) {
      previous = this.parent.parent.result.getByHash(this.model.get('hash'));
    }
    notAskedCount = 0;
    this.questions.sort();
    if (this.questions.models != null) {
      this.questions.models.forEach(function(question, i) {
        var answer, isNotAsked, name, oneView, required;
        required = question.getNumber("linkedGridScore");
        isNotAsked = ((required !== 0 && this.parent.getGridScore() < required) || this.parent.gridWasAutostopped()) && this.parent.getGridScore() !== false;
        if (isNotAsked) {
          notAskedCount++;
        }
        name = question.escape("name").replace(/[^A-Za-z0-9_]/g, "-");
        if (previous) {
          answer = previous[name];
        }
        oneView = new QuestionRunView({
          model: question,
          parent: this,
          dataEntry: this.dataEntry,
          notAsked: isNotAsked,
          isObservation: this.isObservation,
          answer: answer
        });
        this.listenTo(oneView, "rendered", this.onQuestionRendered);
        this.listenTo(oneView, "answer scroll", this.onQuestionAnswer);
        this.questionViews[i] = oneView;
        return container.appendChild(oneView.el);
      }, this);
      this.questionViews.forEach(function(questionView) {
        return questionView.render();
      });
      if (this.focusMode) {
        this.updateQuestionVisibility();
        container.appendChild($("<div id='summary_container'></div> <button class='navigation prev_question'>" + this.text.previousQuestion + "</button> <button class='navigation next_question'>" + this.text.nextQuestion + "</button>"));
        this.updateProgressButtons();
      }
    }
    if (this.questions.length === notAskedCount) {
      if (Tangerine.settings.get("context") !== "class") {
        if (typeof (base = this.parent).next === "function") {
          base.next();
        }
      } else {
        container.appendChild($("<p class='grey'>" + this.text.notEnough + "</p>"));
      }
    }
    this.$el.append(container);
    return this.trigger("rendered");
  };

  SurveyRunView.prototype.onQuestionRendered = function() {
    this.renderCount++;
    if (this.renderCount === this.questions.length) {
      this.trigger("ready");
      this.updateSkipLogic();
    }
    return this.trigger("subRendered");
  };

  SurveyRunView.prototype.onClose = function() {
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

  return SurveyRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1blZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsYUFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7OzswQkFFSixTQUFBLEdBQVc7OzBCQUVYLE1BQUEsR0FDRTtJQUFBLHNCQUFBLEVBQXlCLGNBQXpCO0lBQ0Esc0JBQUEsRUFBeUIsY0FEekI7OzswQkFHRixZQUFBLEdBQWMsU0FBQTtBQUVaLFFBQUE7SUFBQSxtQkFBQSxHQUFzQixJQUFDLENBQUEsYUFBYyxDQUFBLElBQUMsQ0FBQSxhQUFEO0lBR3JDLElBQUEsQ0FBK0MsSUFBQyxDQUFBLE9BQUQsQ0FBUyxtQkFBVCxDQUEvQztBQUFBLGFBQU8sSUFBQyxDQUFBLFVBQUQsQ0FBWSxtQkFBWixFQUFQOztJQUdBLFdBQUEsR0FBYztBQUNkO0FBQUEsU0FBQSw2Q0FBQTs7TUFDRSxJQUFzQixDQUFJLENBQUMsRUFBRSxDQUFDLGFBQUgsSUFBb0IsRUFBRSxDQUFDLFNBQXhCLENBQTFCO1FBQUEsV0FBVyxDQUFDLElBQVosQ0FBaUIsQ0FBakIsRUFBQTs7QUFERjtJQUVBLFdBQUEsR0FBZSxDQUFDLENBQUMsTUFBRixDQUFTLFdBQVQsRUFBc0IsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBTyxDQUFBLEdBQUksS0FBQyxDQUFBO01BQVo7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBR2YsSUFBRyxXQUFXLENBQUMsTUFBWixLQUFzQixDQUF6QjtNQUNFLFlBQUEsR0FBZSxJQUFDLENBQUEsY0FEbEI7S0FBQSxNQUFBO01BR0UsWUFBQSxHQUFlLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBVCxDQUFlLFlBQWYsRUFBNkIsV0FBN0IsRUFIakI7O0lBS0EsSUFBRyxJQUFDLENBQUEsYUFBRCxLQUFrQixZQUFyQjtNQUNFLElBQUMsQ0FBQSxhQUFELEdBQWlCO01BQ2pCLElBQUMsQ0FBQSx3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QUEsQ0FBRSw4RUFBQSxHQUVxQixJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUYzQixHQUU0QyxxREFGNUMsR0FHcUIsSUFBQyxDQUFBLElBQUksQ0FBQyxZQUgzQixHQUd3QyxXQUgxQyxDQUF0QjtRQUtBLElBQUMsQ0FBQSxxQkFBRCxDQUFBLEVBUEY7T0E5QkY7O0lBdUNBLElBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLEtBQXFCLGFBQXhCO01BQ0UsSUFBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQW5CLENBQXVCLFNBQXZCLENBQUEsS0FBcUMsT0FBeEM7O2NBQ1MsQ0FBQztTQURWO09BQUEsTUFBQTtRQUdFLFNBQVMsQ0FBQyxXQUFWLENBQXNCLENBQUEsQ0FBRSxrQkFBQSxHQUFtQixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQXpCLEdBQW1DLE1BQXJDLENBQXRCLEVBSEY7T0FERjs7SUFNQSxJQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBWSxTQUFaO1dBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBMURNOzswQkE0RFIsa0JBQUEsR0FBb0IsU0FBQTtJQUNsQixJQUFDLENBQUEsV0FBRDtJQUNBLElBQUcsSUFBQyxDQUFBLFdBQUQsS0FBZ0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUE5QjtNQUNFLElBQUMsQ0FBQSxPQUFELENBQVMsT0FBVDtNQUNBLElBQUMsQ0FBQSxlQUFELENBQUEsRUFGRjs7V0FHQSxJQUFDLENBQUEsT0FBRCxDQUFTLGFBQVQ7RUFMa0I7OzBCQU9wQixPQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7QUFBQTtBQUFBLFNBQUEscUNBQUE7OztRQUNFLEVBQUUsQ0FBQzs7QUFETDtXQUVBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0VBSFg7Ozs7R0E5VmtCLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9TdXJ2ZXlSdW5WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU3VydmV5UnVuVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiU3VydmV5UnVuVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAubmV4dF9xdWVzdGlvbicgOiAnbmV4dFF1ZXN0aW9uJ1xuICAgICdjbGljayAucHJldl9xdWVzdGlvbicgOiAncHJldlF1ZXN0aW9uJ1xuXG4gIG5leHRRdWVzdGlvbjogLT5cblxuICAgIGN1cnJlbnRRdWVzdGlvblZpZXcgPSBAcXVlc3Rpb25WaWV3c1tAcXVlc3Rpb25JbmRleF1cblxuICAgICMgc2hvdyBlcnJvcnMgYmVmb3JlIGRvaW5nIGFueXRoaW5nIGlmIHRoZXJlIGFyZSBhbnlcbiAgICByZXR1cm4gQHNob3dFcnJvcnMoY3VycmVudFF1ZXN0aW9uVmlldykgdW5sZXNzIEBpc1ZhbGlkKGN1cnJlbnRRdWVzdGlvblZpZXcpXG5cbiAgICAjIGZpbmQgdGhlIG5vbi1za2lwcGVkIHF1ZXN0aW9uc1xuICAgIGlzQXZhaWxhYmxlID0gW11cbiAgICBmb3IgcXYsIGkgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgIGlzQXZhaWxhYmxlLnB1c2ggaSBpZiBub3QgKHF2LmlzQXV0b3N0b3BwZWQgb3IgcXYuaXNTa2lwcGVkKVxuICAgIGlzQXZhaWxhYmxlICA9IF8uZmlsdGVyIGlzQXZhaWxhYmxlLCAoZSkgPT4gZSA+IEBxdWVzdGlvbkluZGV4XG5cbiAgICAjIGRvbid0IGdvIGFueXdoZXJlIHVubGVzcyB3ZSBoYXZlIHNvbWV3aGVyZSB0byBnb1xuICAgIGlmIGlzQXZhaWxhYmxlLmxlbmd0aCA9PSAwXG4gICAgICBwbGFubmVkSW5kZXggPSBAcXVlc3Rpb25JbmRleFxuICAgIGVsc2VcbiAgICAgIHBsYW5uZWRJbmRleCA9IE1hdGgubWluLmFwcGx5KHBsYW5uZWRJbmRleCwgaXNBdmFpbGFibGUpXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCAhPSBwbGFubmVkSW5kZXhcbiAgICAgIEBxdWVzdGlvbkluZGV4ID0gcGxhbm5lZEluZGV4XG4gICAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiAgICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuXG4gIHByZXZRdWVzdGlvbjogLT5cblxuICAgIGN1cnJlbnRRdWVzdGlvblZpZXcgPSBAcXVlc3Rpb25WaWV3c1tAcXVlc3Rpb25JbmRleF1cblxuICAgICMgc2hvdyBlcnJvcnMgYmVmb3JlIGRvaW5nIGFueXRoaW5nIGlmIHRoZXJlIGFyZSBhbnlcbiAgICByZXR1cm4gQHNob3dFcnJvcnMoY3VycmVudFF1ZXN0aW9uVmlldykgdW5sZXNzIEBpc1ZhbGlkKGN1cnJlbnRRdWVzdGlvblZpZXcpXG5cbiAgICAjIGZpbmQgdGhlIG5vbi1za2lwcGVkIHF1ZXN0aW9uc1xuICAgIGlzQXZhaWxhYmxlID0gW11cbiAgICBmb3IgcXYsIGkgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgIGlzQXZhaWxhYmxlLnB1c2ggaSBpZiBub3QgKHF2LmlzQXV0b3N0b3BwZWQgb3IgcXYuaXNTa2lwcGVkKVxuICAgIGlzQXZhaWxhYmxlICA9IF8uZmlsdGVyIGlzQXZhaWxhYmxlLCAoZSkgPT4gZSA8IEBxdWVzdGlvbkluZGV4XG5cbiAgICAjIGRvbid0IGdvIGFueXdoZXJlIHVubGVzcyB3ZSBoYXZlIHNvbWV3aGVyZSB0byBnb1xuICAgIGlmIGlzQXZhaWxhYmxlLmxlbmd0aCA9PSAwXG4gICAgICBwbGFubmVkSW5kZXggPSBAcXVlc3Rpb25JbmRleFxuICAgIGVsc2VcbiAgICAgIHBsYW5uZWRJbmRleCA9IE1hdGgubWF4LmFwcGx5KHBsYW5uZWRJbmRleCwgaXNBdmFpbGFibGUpXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCAhPSBwbGFubmVkSW5kZXhcbiAgICAgIEBxdWVzdGlvbkluZGV4ID0gcGxhbm5lZEluZGV4XG4gICAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiAgICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuXG4gIHVwZGF0ZVByb2dyZXNzQnV0dG9uczogLT5cblxuICAgIGlzQXZhaWxhYmxlID0gW11cbiAgICBmb3IgcXYsIGkgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgIGlzQXZhaWxhYmxlLnB1c2ggaSBpZiBub3QgKHF2LmlzQXV0b3N0b3BwZWQgb3IgcXYuaXNTa2lwcGVkKVxuICAgIGlzQXZhaWxhYmxlLnB1c2ggQHF1ZXN0aW9uSW5kZXhcblxuICAgICRwcmV2ID0gQCRlbC5maW5kKFwiLnByZXZfcXVlc3Rpb25cIilcbiAgICAkbmV4dCA9IEAkZWwuZmluZChcIi5uZXh0X3F1ZXN0aW9uXCIpXG5cbiAgICBtaW5pbXVtID0gTWF0aC5taW4uYXBwbHkoIG1pbmltdW0sIGlzQXZhaWxhYmxlIClcbiAgICBtYXhpbXVtID0gTWF0aC5tYXguYXBwbHkoIG1heGltdW0sIGlzQXZhaWxhYmxlIClcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IG1pbmltdW1cbiAgICAgICRwcmV2LmhpZGUoKVxuICAgIGVsc2VcbiAgICAgICRwcmV2LnNob3coKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggPT0gbWF4aW11bVxuICAgICAgJG5leHQuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgJG5leHQuc2hvdygpXG5cbiAgdXBkYXRlRXhlY3V0ZVJlYWR5OiAocmVhZHkpID0+XG5cbiAgICBAZXhlY3V0ZVJlYWR5ID0gcmVhZHlcblxuICAgIHJldHVybiBpZiBub3QgQHRyaWdnZXJTaG93TGlzdD9cblxuICAgIGlmIEB0cmlnZ2VyU2hvd0xpc3QubGVuZ3RoID4gMFxuICAgICAgZm9yIGluZGV4IGluIEB0cmlnZ2VyU2hvd0xpc3RcbiAgICAgICAgQHF1ZXN0aW9uVmlld3NbaW5kZXhdPy50cmlnZ2VyIFwic2hvd1wiXG4gICAgICBAdHJpZ2dlclNob3dMaXN0ID0gW11cblxuICAgIEB1cGRhdGVTa2lwTG9naWMoKSBpZiBAZXhlY3V0ZVJlYWR5XG5cblxuICB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHk6IC0+XG5cbiAgICByZXR1cm4gdW5sZXNzIEBtb2RlbC5nZXQoXCJmb2N1c01vZGVcIilcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IEBxdWVzdGlvblZpZXdzLmxlbmd0aFxuICAgICAgQCRlbC5maW5kKFwiI3N1bW1hcnlfY29udGFpbmVyXCIpLmh0bWwgXCJcbiAgICAgICAgbGFzdCBwYWdlIGhlcmVcbiAgICAgIFwiXG4gICAgICBAJGVsLmZpbmQoXCIjbmV4dF9xdWVzdGlvblwiKS5oaWRlKClcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIjc3VtbWFyeV9jb250YWluZXJcIikuZW1wdHkoKVxuICAgICAgQCRlbC5maW5kKFwiI25leHRfcXVlc3Rpb25cIikuc2hvdygpXG5cbiAgICAkcXVlc3Rpb25zID0gQCRlbC5maW5kKFwiLnF1ZXN0aW9uXCIpXG4gICAgJHF1ZXN0aW9ucy5oaWRlKClcbiAgICAkcXVlc3Rpb25zLmVxKEBxdWVzdGlvbkluZGV4KS5zaG93KClcblxuICAgICMgdHJpZ2dlciB0aGUgcXVlc3Rpb24gdG8gcnVuIGl0J3MgZGlzcGxheSBjb2RlIGlmIHRoZSBzdWJ0ZXN0J3MgZGlzcGxheWNvZGUgaGFzIGFscmVhZHkgcmFuXG4gICAgIyBpZiBub3QsIGFkZCBpdCB0byBhIGxpc3QgdG8gcnVuIGxhdGVyLlxuICAgIGlmIEBleGVjdXRlUmVhZHlcbiAgICAgIEBxdWVzdGlvblZpZXdzW0BxdWVzdGlvbkluZGV4XS50cmlnZ2VyIFwic2hvd1wiXG4gICAgZWxzZVxuICAgICAgQHRyaWdnZXJTaG93TGlzdCA9IFtdIGlmIG5vdCBAdHJpZ2dlclNob3dMaXN0XG4gICAgICBAdHJpZ2dlclNob3dMaXN0LnB1c2ggQHF1ZXN0aW9uSW5kZXhcblxuICBzaG93UXVlc3Rpb246IChpbmRleCkgLT5cbiAgICBAcXVlc3Rpb25JbmRleCA9IGluZGV4IGlmIF8uaXNOdW1iZXIoaW5kZXgpICYmIGluZGV4IDwgQHF1ZXN0aW9uVmlld3MubGVuZ3RoICYmIGluZGV4ID4gMFxuICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgcGxlYXNlQW5zd2VyIDogdChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5wbGVhc2VfYW5zd2VyXCIpXG4gICAgICBjb3JyZWN0RXJyb3JzIDogdChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5jb3JyZWN0X2Vycm9yc1wiKVxuICAgICAgbm90RW5vdWdoIDogXyh0KFwiU3VydmV5UnVuVmlldy5tZXNzYWdlLm5vdF9lbm91Z2hcIikpLmVzY2FwZSgpXG5cbiAgICAgIHByZXZpb3VzUXVlc3Rpb24gOiB0KFwiU3VydmV5UnVuVmlldy5idXR0b24ucHJldmlvdXNfcXVlc3Rpb25cIilcbiAgICAgIG5leHRRdWVzdGlvbiA6IHQoXCJTdXJ2ZXlSdW5WaWV3LmJ1dHRvbi5uZXh0X3F1ZXN0aW9uXCIpXG5cblxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQG1vZGVsICAgICAgICAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCAgICAgICAgPSBvcHRpb25zLnBhcmVudFxuICAgIEBkYXRhRW50cnkgICAgID0gb3B0aW9ucy5kYXRhRW50cnlcbiAgICBAaXNPYnNlcnZhdGlvbiA9IG9wdGlvbnMuaXNPYnNlcnZhdGlvblxuICAgIEBmb2N1c01vZGUgICAgID0gQG1vZGVsLmdldEJvb2xlYW4oXCJmb2N1c01vZGVcIilcbiAgICBAcXVlc3Rpb25JbmRleCA9IDAgaWYgQGZvY3VzTW9kZVxuICAgIEBxdWVzdGlvblZpZXdzID0gW11cbiAgICBAYW5zd2VyZWQgICAgICA9IFtdXG4gICAgQHJlbmRlckNvdW50ICAgPSAwXG5cbiAgICBAaTE4bigpXG5cbiAgICBAcXVlc3Rpb25zICAgICA9IG5ldyBRdWVzdGlvbnMoKVxuICAgICMgQHF1ZXN0aW9ucy5kYi52aWV3ID0gXCJxdWVzdGlvbnNCeVN1YnRlc3RJZFwiIEJyaW5nIHRoaXMgYmFjayB3aGVuIHByb3RvdHlwZXMgbWFrZSBzZW5zZSBhZ2FpblxuICAgIEBxdWVzdGlvbnMuZmV0Y2hcbiAgICAgIHZpZXdPcHRpb25zOlxuICAgICAgICBrZXk6IFwicXVlc3Rpb24tI3tAbW9kZWwuaWR9XCJcbiAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuICAgICAgICBAcXVlc3Rpb25zLnNvcnQoKVxuICAgICAgICBAcmVhZHkgPSB0cnVlXG4gICAgICAgIEByZW5kZXIoKVxuXG4gICMgd2hlbiBhIHF1ZXN0aW9uIGlzIGFuc3dlcmVkXG4gIG9uUXVlc3Rpb25BbnN3ZXI6IChlbGVtZW50KSA9PlxuXG4gICAgcmV0dXJuIHVubGVzcyBAcmVuZGVyQ291bnQgPT0gQHF1ZXN0aW9ucy5sZW5ndGhcblxuICAgICMgYXV0byBzdG9wIGFmdGVyIGxpbWl0XG4gICAgQGF1dG9zdG9wcGVkICAgID0gZmFsc2VcbiAgICBhdXRvc3RvcExpbWl0ICAgPSBAbW9kZWwuZ2V0TnVtYmVyIFwiYXV0b3N0b3BMaW1pdFwiXG4gICAgbG9uZ2VzdFNlcXVlbmNlID0gMFxuICAgIGF1dG9zdG9wQ291bnQgICA9IDBcblxuICAgIGlmIGF1dG9zdG9wTGltaXQgPiAwXG4gICAgICBmb3IgaSBpbiBbMS4uQHF1ZXN0aW9uVmlld3MubGVuZ3RoXSAjIGp1c3QgaW4gY2FzZSB0aGV5IGNhbid0IGNvdW50XG4gICAgICAgIGN1cnJlbnRBbnN3ZXIgPSBAcXVlc3Rpb25WaWV3c1tpLTFdLmFuc3dlclxuICAgICAgICBpZiBjdXJyZW50QW5zd2VyID09IFwiMFwiIG9yIGN1cnJlbnRBbnN3ZXIgPT0gXCI5XCJcbiAgICAgICAgICBhdXRvc3RvcENvdW50KytcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGF1dG9zdG9wQ291bnQgPSAwXG4gICAgICAgIGxvbmdlc3RTZXF1ZW5jZSA9IE1hdGgubWF4KGxvbmdlc3RTZXF1ZW5jZSwgYXV0b3N0b3BDb3VudClcbiAgICAgICAgIyBpZiB0aGUgdmFsdWUgaXMgc2V0LCB3ZSd2ZSBnb3QgYSB0aHJlc2hvbGQgZXhjZWVkaW5nIHJ1biwgYW5kIGl0J3Mgbm90IGFscmVhZHkgYXV0b3N0b3BwZWRcbiAgICAgICAgaWYgYXV0b3N0b3BMaW1pdCAhPSAwICYmIGxvbmdlc3RTZXF1ZW5jZSA+PSBhdXRvc3RvcExpbWl0ICYmIG5vdCBAYXV0b3N0b3BwZWRcbiAgICAgICAgICBAYXV0b3N0b3BwZWQgPSB0cnVlXG4gICAgICAgICAgQGF1dG9zdG9wSW5kZXggPSBpXG4gICAgQHVwZGF0ZUF1dG9zdG9wKClcbiAgICBAdXBkYXRlU2tpcExvZ2ljKClcblxuICB1cGRhdGVBdXRvc3RvcDogLT5cbiAgICBhdXRvc3RvcExpbWl0ID0gQG1vZGVsLmdldE51bWJlciBcImF1dG9zdG9wTGltaXRcIlxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHZpZXcsIGkpIC0+XG4gICAgICBpZiBpID4gKEBhdXRvc3RvcEluZGV4IC0gMSlcbiAgICAgICAgaWYgQGF1dG9zdG9wcGVkXG4gICAgICAgICAgdmlldy5pc0F1dG9zdG9wcGVkID0gdHJ1ZVxuICAgICAgICAgIHZpZXcuJGVsLmFkZENsYXNzICAgIFwiZGlzYWJsZWRfYXV0b3N0b3BcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgdmlldy5pc0F1dG9zdG9wcGVkID0gZmFsc2VcbiAgICAgICAgICB2aWV3LiRlbC5yZW1vdmVDbGFzcyBcImRpc2FibGVkX2F1dG9zdG9wXCJcbiAgICAsIEBcblxuICB1cGRhdGVTa2lwTG9naWM6ID0+XG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAocXYpIC0+XG4gICAgICBxdWVzdGlvbiA9IHF2Lm1vZGVsXG4gICAgICBza2lwTG9naWNDb2RlID0gcXVlc3Rpb24uZ2V0U3RyaW5nIFwic2tpcExvZ2ljXCJcbiAgICAgIHVubGVzcyBza2lwTG9naWNDb2RlIGlzIFwiXCJcbiAgICAgICAgdHJ5XG4gICAgICAgICAgcmVzdWx0ID0gQ29mZmVlU2NyaXB0LmV2YWwuYXBwbHkoQCwgW3NraXBMb2dpY0NvZGVdKVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIG5hbWUgPSAoKC9mdW5jdGlvbiAoLnsxLH0pXFwoLykuZXhlYyhlcnJvci5jb25zdHJ1Y3Rvci50b1N0cmluZygpKVsxXSlcbiAgICAgICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgICAgICAgIGFsZXJ0IFwiU2tpcCBsb2dpYyBlcnJvciBpbiBxdWVzdGlvbiAje3F1ZXN0aW9uLmdldCgnbmFtZScpfVxcblxcbiN7bmFtZX1cXG5cXG4je21lc3NhZ2V9XCJcblxuICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICBxdi4kZWwuYWRkQ2xhc3MgXCJkaXNhYmxlZF9za2lwcGVkXCJcbiAgICAgICAgICBxdi5pc1NraXBwZWQgPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBxdi4kZWwucmVtb3ZlQ2xhc3MgXCJkaXNhYmxlZF9za2lwcGVkXCJcbiAgICAgICAgICBxdi5pc1NraXBwZWQgPSBmYWxzZVxuICAgICAgcXYudXBkYXRlVmFsaWRpdHkoKVxuICAgICwgQFxuXG4gIGlzVmFsaWQ6ICh2aWV3cyA9IEBxdWVzdGlvblZpZXdzKSAtPlxuICAgIHJldHVybiB0cnVlIGlmIG5vdCB2aWV3cz8gIyBpZiB0aGVyZSdzIG5vdGhpbmcgdG8gY2hlY2ssIGl0IG11c3QgYmUgZ29vZFxuICAgIHZpZXdzID0gW3ZpZXdzXSBpZiBub3QgXy5pc0FycmF5KHZpZXdzKVxuICAgIHZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuICAgICAgcXYudXBkYXRlVmFsaWRpdHkoKVxuICAgICAgIyBjYW4gd2Ugc2tpcCBpdD9cbiAgICAgIGlmIG5vdCBxdi5tb2RlbC5nZXRCb29sZWFuKFwic2tpcHBhYmxlXCIpXG4gICAgICAgICMgaXMgaXQgdmFsaWRcbiAgICAgICAgaWYgbm90IHF2LmlzVmFsaWRcbiAgICAgICAgICAjIHJlZCBhbGVydCEhXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgLCBAXG4gICAgcmV0dXJuIHRydWVcblxuXG4gICMgQFRPRE8gdGhpcyBzaG91bGQgcHJvYmFibHkgYmUgcmV0dXJuaW5nIG11bHRpcGxlLCBzaW5nbGUgdHlwZSBoYXNoIHZhbHVlc1xuICBnZXRTa2lwcGVkOiAtPlxuICAgIHJlc3VsdCA9IHt9XG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAocXYsIGkpIC0+XG4gICAgICByZXN1bHRbQHF1ZXN0aW9ucy5tb2RlbHNbaV0uZ2V0KFwibmFtZVwiKV0gPSBcInNraXBwZWRcIlxuICAgICwgQFxuICAgIHJldHVybiByZXN1bHRcblxuICBnZXRSZXN1bHQ6ID0+XG4gICAgcmVzdWx0ID0ge31cbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoIChxdiwgaSkgLT5cbiAgICAgIHJlc3VsdFtAcXVlc3Rpb25zLm1vZGVsc1tpXS5nZXQoXCJuYW1lXCIpXSA9XG4gICAgICAgIGlmIHF2Lm5vdEFza2VkICMgYmVjYXVzZSBvZiBncmlkIHNjb3JlXG4gICAgICAgICAgcXYubm90QXNrZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBub3QgXy5pc0VtcHR5KHF2LmFuc3dlcikgIyB1c2UgYW5zd2VyXG4gICAgICAgICAgcXYuYW5zd2VyXG4gICAgICAgIGVsc2UgaWYgcXYuc2tpcHBlZFxuICAgICAgICAgIHF2LnNraXBwZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBxdi5pc1NraXBwZWRcbiAgICAgICAgICBxdi5sb2dpY1NraXBwZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBxdi5pc0F1dG9zdG9wcGVkXG4gICAgICAgICAgcXYubm90QXNrZWRBdXRvc3RvcFJlc3VsdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgcXYuYW5zd2VyXG4gICAgLCBAXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIHNob3dFcnJvcnM6ICh2aWV3cyA9IEBxdWVzdGlvblZpZXdzKSAtPlxuICAgIEAkZWwuZmluZCgnLm1lc3NhZ2UnKS5yZW1vdmUoKVxuICAgIGZpcnN0ID0gdHJ1ZVxuICAgIHZpZXdzID0gW3ZpZXdzXSBpZiBub3QgXy5pc0FycmF5KHZpZXdzKVxuICAgIHZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuICAgICAgaWYgbm90IF8uaXNTdHJpbmcocXYpXG4gICAgICAgIG1lc3NhZ2UgPSBcIlwiXG4gICAgICAgIGlmIG5vdCBxdi5pc1ZhbGlkXG5cbiAgICAgICAgICAjIGhhbmRsZSBjdXN0b20gdmFsaWRhdGlvbiBlcnJvciBtZXNzYWdlc1xuICAgICAgICAgIGN1c3RvbU1lc3NhZ2UgPSBxdi5tb2RlbC5nZXQoXCJjdXN0b21WYWxpZGF0aW9uTWVzc2FnZVwiKVxuICAgICAgICAgIGlmIG5vdCBfLmlzRW1wdHkoY3VzdG9tTWVzc2FnZSlcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBjdXN0b21NZXNzYWdlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgbWVzc2FnZSA9IEB0ZXh0LnBsZWFzZUFuc3dlclxuXG4gICAgICAgICAgaWYgZmlyc3QgPT0gdHJ1ZVxuICAgICAgICAgICAgQHNob3dRdWVzdGlvbihpKSBpZiB2aWV3cyA9PSBAcXVlc3Rpb25WaWV3c1xuICAgICAgICAgICAgcXYuJGVsLnNjcm9sbFRvKClcbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IEB0ZXh0LmNvcnJlY3RFcnJvcnNcbiAgICAgICAgICAgIGZpcnN0ID0gZmFsc2VcbiAgICAgICAgcXYuc2V0TWVzc2FnZSBtZXNzYWdlXG4gICAgLCBAXG5cbiAgcmVuZGVyOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHJlYWR5XG4gICAgQCRlbC5lbXB0eSgpXG5cbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG4gICAgICBwcmV2aW91cyA9IEBwYXJlbnQucGFyZW50LnJlc3VsdC5nZXRCeUhhc2goQG1vZGVsLmdldCgnaGFzaCcpKVxuXG4gICAgbm90QXNrZWRDb3VudCA9IDBcblxuICAgIEBxdWVzdGlvbnMuc29ydCgpXG4gICAgaWYgQHF1ZXN0aW9ucy5tb2RlbHM/XG4gICAgICBAcXVlc3Rpb25zLm1vZGVscy5mb3JFYWNoIChxdWVzdGlvbiwgaSkgLT5cbiAgICAgICAgIyBza2lwIHRoZSByZXN0IGlmIHNjb3JlIG5vdCBoaWdoIGVub3VnaFxuXG4gICAgICAgIHJlcXVpcmVkID0gcXVlc3Rpb24uZ2V0TnVtYmVyIFwibGlua2VkR3JpZFNjb3JlXCJcblxuICAgICAgICBpc05vdEFza2VkID0gKCAoIHJlcXVpcmVkICE9IDAgJiYgQHBhcmVudC5nZXRHcmlkU2NvcmUoKSA8IHJlcXVpcmVkICkgfHwgQHBhcmVudC5ncmlkV2FzQXV0b3N0b3BwZWQoKSApICYmIEBwYXJlbnQuZ2V0R3JpZFNjb3JlKCkgIT0gZmFsc2VcblxuICAgICAgICBpZiBpc05vdEFza2VkIHRoZW4gbm90QXNrZWRDb3VudCsrXG5cbiAgICAgICAgbmFtZSAgID0gcXVlc3Rpb24uZXNjYXBlKFwibmFtZVwiKS5yZXBsYWNlIC9bXkEtWmEtejAtOV9dL2csIFwiLVwiXG4gICAgICAgIGFuc3dlciA9IHByZXZpb3VzW25hbWVdIGlmIHByZXZpb3VzXG5cbiAgICAgICAgb25lVmlldyA9IG5ldyBRdWVzdGlvblJ1blZpZXdcbiAgICAgICAgICBtb2RlbCAgICAgICAgIDogcXVlc3Rpb25cbiAgICAgICAgICBwYXJlbnQgICAgICAgIDogQFxuICAgICAgICAgIGRhdGFFbnRyeSAgICAgOiBAZGF0YUVudHJ5XG4gICAgICAgICAgbm90QXNrZWQgICAgICA6IGlzTm90QXNrZWRcbiAgICAgICAgICBpc09ic2VydmF0aW9uIDogQGlzT2JzZXJ2YXRpb25cbiAgICAgICAgICBhbnN3ZXIgICAgICAgIDogYW5zd2VyXG5cbiAgICAgICAgQGxpc3RlblRvIG9uZVZpZXcsIFwicmVuZGVyZWRcIiwgICAgICBAb25RdWVzdGlvblJlbmRlcmVkXG4gICAgICAgIEBsaXN0ZW5UbyBvbmVWaWV3LCBcImFuc3dlciBzY3JvbGxcIiwgQG9uUXVlc3Rpb25BbnN3ZXJcblxuICAgICAgICBAcXVlc3Rpb25WaWV3c1tpXSA9IG9uZVZpZXdcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkIG9uZVZpZXcuZWxcbiAgICAgICwgQFxuXG4gICAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoIChxdWVzdGlvblZpZXcpIC0+IHF1ZXN0aW9uVmlldy5yZW5kZXIoKVxuXG4gICAgICBpZiBAZm9jdXNNb2RlXG4gICAgICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQgJCBcIlxuICAgICAgICAgIDxkaXYgaWQ9J3N1bW1hcnlfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIHByZXZfcXVlc3Rpb24nPiN7QHRleHQucHJldmlvdXNRdWVzdGlvbn08L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIG5leHRfcXVlc3Rpb24nPiN7QHRleHQubmV4dFF1ZXN0aW9ufTwvYnV0dG9uPlxuICAgICAgICBcIlxuICAgICAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICAgIGlmIEBxdWVzdGlvbnMubGVuZ3RoID09IG5vdEFza2VkQ291bnRcbiAgICAgIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpICE9IFwiY2xhc3NcIlxuICAgICAgICBAcGFyZW50Lm5leHQ/KClcbiAgICAgIGVsc2VcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkICQgXCI8cCBjbGFzcz0nZ3JleSc+I3tAdGV4dC5ub3RFbm91Z2h9PC9wPlwiXG5cbiAgICBAJGVsLmFwcGVuZCBjb250YWluZXJcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICBvblF1ZXN0aW9uUmVuZGVyZWQ6ID0+XG4gICAgQHJlbmRlckNvdW50KytcbiAgICBpZiBAcmVuZGVyQ291bnQgPT0gQHF1ZXN0aW9ucy5sZW5ndGhcbiAgICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuICAgICAgQHVwZGF0ZVNraXBMb2dpYygpXG4gICAgQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG5cbiAgb25DbG9zZTotPlxuICAgIGZvciBxdiBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgcXYuY2xvc2U/KClcbiAgICBAcXVlc3Rpb25WaWV3cyA9IFtdXG4iXX0=

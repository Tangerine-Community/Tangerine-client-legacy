var QuestionRunView, SurveyReviewView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

QuestionRunView = (function(superClass) {
  extend(QuestionRunView, superClass);

  function QuestionRunView() {
    this.getName = bind(this.getName, this);
    this.setName = bind(this.setName, this);
    this.setHint = bind(this.setHint, this);
    this.setPrompt = bind(this.setPrompt, this);
    this.setMessage = bind(this.setMessage, this);
    this.setAnswer = bind(this.setAnswer, this);
    this.setOptions = bind(this.setOptions, this);
    this.updateResult = bind(this.updateResult, this);
    this.update = bind(this.update, this);
    this.onShow = bind(this.onShow, this);
    this.previousAnswer = bind(this.previousAnswer, this);
    return QuestionRunView.__super__.constructor.apply(this, arguments);
  }

  QuestionRunView.prototype.className = "question";

  QuestionRunView.prototype.events = {
    'change input': 'update',
    'change textarea': 'update',
    'click .autoscroll_icon': 'scroll'
  };

  QuestionRunView.prototype.scroll = function(event) {
    return this.trigger("scroll", event, this.model.get("order"));
  };

  QuestionRunView.prototype.initialize = function(options) {
    this.on("show", (function(_this) {
      return function() {
        return _this.onShow();
      };
    })(this));
    this.model = options.model;
    this.parent = options.parent;
    this.dataEntry = options.dataEntry;
    this.fontFamily = this.parent.model.get('fontFamily');
    if (this.parent.model.get("fontFamily") !== "") {
      this.fontStyle = "style=\"font-family: " + (this.parent.model.get('fontFamily')) + " !important;\"";
    }
    if (!this.dataEntry) {
      this.answer = options.answer;
    } else {
      this.answer = {};
    }
    this.name = this.model.escape("name").replace(/[^A-Za-z0-9_]/g, "-");
    this.type = this.model.get("type");
    this.options = this.model.get("options");
    this.notAsked = options.notAsked;
    this.isObservation = options.isObservation;
    this.defineSpecialCaseResults();
    if (this.model.getBoolean("skippable")) {
      this.isValid = true;
      this.skipped = true;
    } else {
      this.isValid = false;
      this.skipped = false;
    }
    if (this.notAsked === true) {
      this.isValid = true;
      this.updateResult();
    }
    if (this.type === "single" || this.type === "multiple") {
      this.button = new ButtonView({
        options: this.options,
        mode: this.type,
        dataEntry: this.dataEntry,
        answer: this.answer,
        fontFamily: this.fontFamily
      });
      return this.button.on("change rendered", (function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    }
  };

  QuestionRunView.prototype.previousAnswer = function() {
    if (this.parent.questionIndex >= 0) {
      return this.parent.questionViews[this.parent.questionIndex - 1].answer;
    }
  };

  QuestionRunView.prototype.onShow = function() {
    var error, error1, message, name, showCode;
    showCode = this.model.getString("displayCode");
    if (_.isEmptyString(showCode)) {
      return;
    }
    try {
      return CoffeeScript["eval"].apply(this, [showCode]);
    } catch (error1) {
      error = error1;
      name = (/function (.{1,})\(/.exec(error.constructor.toString())[1]);
      message = error.message;
      return alert("Display code error\n\n" + name + "\n\n" + message);
    }
  };

  QuestionRunView.prototype.update = function(event) {
    this.updateResult();
    this.updateValidity();
    return this.trigger("answer", event, this.model.get("order"));
  };

  QuestionRunView.prototype.updateResult = function() {
    var i, j, len, option, ref, results;
    if (this.notAsked === true) {
      if (this.type === "multiple") {
        ref = this.options;
        results = [];
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          option = ref[i];
          results.push(this.answer[this.options[i].value] = "not_asked");
        }
        return results;
      } else {
        return this.answer = "not_asked";
      }
    } else {
      if (this.type === "open") {
        return this.answer = this.$el.find("#" + this.cid + "_" + this.name).val();
      } else {
        return this.answer = this.button.answer;
      }
    }
  };

  QuestionRunView.prototype.updateValidity = function() {
    var customValidationCode, e, error1, isAutostopped, isLogicSkipped, isSkippable;
    isSkippable = this.model.getBoolean("skippable");
    isAutostopped = this.$el.hasClass("disabled_autostop");
    isLogicSkipped = this.$el.hasClass("disabled_skipped");
    if (isSkippable || (isLogicSkipped || isAutostopped)) {
      this.isValid = true;
      return this.skipped = _.isEmptyString(this.answer) ? true : false;
    } else {
      customValidationCode = this.model.get("customValidationCode");
      if (!this.answer) {
        this.answer = "";
      }
      if (!_.isEmptyString(customValidationCode)) {
        try {
          return this.isValid = CoffeeScript["eval"].apply(this, [customValidationCode]);
        } catch (error1) {
          e = error1;
          return alert("Custom Validation error\n\n" + e);
        }
      } else {
        return this.isValid = (function() {
          switch (this.type) {
            case "open":
              if (_.isEmptyString(this.answer) || (_.isEmpty(this.answer) && _.isObject(this.answer))) {
                return false;
              } else {
                return true;
              }
              break;
            case "multiple":
              if (~_.values(this.answer).indexOf("checked")) {
                return true;
              } else {
                return false;
              }
              break;
            case "single":
              if (_.isEmptyString(this.answer) || (_.isEmpty(this.answer) && _.isObject(this.answer))) {
                return false;
              } else {
                return true;
              }
          }
        }).call(this);
      }
    }
  };

  QuestionRunView.prototype.setOptions = function(options) {
    this.button.options = options;
    return this.button.render();
  };

  QuestionRunView.prototype.setAnswer = function(answer) {
    if (_.isString(answer) && this.type === "multiple") {
      alert("setAnswer Error\nTried to set " + this.type + " type " + this.name + " question to string answer.");
    }
    if (!_.isObject(answer) && this.type === "multiple") {
      alert("setAnswer Error\n" + this.name + " question requires an object");
    }
    if (this.type === "multiple") {
      this.button.answer = $.extend(this.button.answer, answer);
    } else if (this.type === "single") {
      this.button.answer = answer;
    } else {
      this.answer = answer;
    }
    this.updateValidity();
    return this.button.render();
  };

  QuestionRunView.prototype.setMessage = function(message) {
    return this.$el.find(".error_message").html(message);
  };

  QuestionRunView.prototype.setPrompt = function(prompt) {
    return this.$el.find(".prompt").html(prompt);
  };

  QuestionRunView.prototype.setHint = function(hint) {
    return this.$el.find(".hint").html(hint);
  };

  QuestionRunView.prototype.setName = function(newName) {
    if (newName == null) {
      newName = this.model.get('name');
    }
    this.model.set("name", newName);
    return this.name = this.model.escape("name").replace(/[^A-Za-z0-9_]/g, "-");
  };

  QuestionRunView.prototype.getName = function() {
    return this.model.get("name");
  };

  QuestionRunView.prototype.render = function() {
    var answerValue, html;
    this.$el.attr("id", "question-" + this.name);
    if (!this.notAsked) {
      html = "<div class='error_message'></div><div class='prompt' " + (this.fontStyle || "") + ">" + (this.model.get('prompt')) + "</div> <div class='hint' " + (this.fontStyle || "") + ">" + (this.model.get('hint') || "") + "</div>";
      if (this.type === "open") {
        if (_.isString(this.answer) && !_.isEmpty(this.answer)) {
          answerValue = this.answer;
        }
        if (this.model.get("multiline")) {
          html += "<div><textarea id='" + this.cid + "_" + this.name + "' data-cid='" + this.cid + "' value='" + (answerValue || '') + "'></textarea></div>";
        } else {
          html += "<div><input id='" + this.cid + "_" + this.name + "' data-cid='" + this.cid + "' value='" + (answerValue || '') + "'></div>";
        }
      } else {
        html += "<div class='button_container'></div>";
      }
      if (this.isObservation) {
        html += "<img src='images/icon_scroll.png' class='icon autoscroll_icon' data-cid='" + this.cid + "'>";
      }
      this.$el.html(html);
      if (this.type === "single" || this.type === "multiple") {
        this.button.setElement(this.$el.find(".button_container"));
        this.button.on("rendered", (function(_this) {
          return function() {
            return _this.trigger("rendered");
          };
        })(this));
        return this.button.render();
      } else {
        return this.trigger("rendered");
      }
    } else {
      this.$el.hide();
      return this.trigger("rendered");
    }
  };

  QuestionRunView.prototype.defineSpecialCaseResults = function() {
    var element, i, j, k, len, len1, list, option, ref;
    list = ["missing", "notAsked", "skipped", "logicSkipped", "notAskedAutostop"];
    for (j = 0, len = list.length; j < len; j++) {
      element = list[j];
      if (this.type === "single" || this.type === "open") {
        this[element + "Result"] = element;
      }
      if (this.type === "multiple") {
        this[element + "Result"] = {};
        ref = this.options;
        for (i = k = 0, len1 = ref.length; k < len1; i = ++k) {
          option = ref[i];
          this[element + "Result"][this.options[i].value] = element;
        }
      }
    }
  };

  return QuestionRunView;

})(Backbone.View);

SurveyReviewView = (function(superClass) {
  extend(SurveyReviewView, superClass);

  function SurveyReviewView() {
    return SurveyReviewView.__super__.constructor.apply(this, arguments);
  }

  SurveyReviewView.prototype.className = "QuestionReviewView";

  SurveyReviewView.prototype.initialize = function(options) {
    return this.views = options.views;
  };

  SurveyReviewView.prototype.render = function() {
    var answers, view;
    answers = ((function() {
      var j, len, ref, results;
      ref = this.views;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        view = ref[j];
        results.push("<div class='label_value'> <h3></h3> </div>");
      }
      return results;
    }).call(this)).join("");
    return this.$el.html("<h2>Please review your answers and press next when ready.</h2> " + answers);
  };

  return SurveyReviewView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcXVlc3Rpb24vUXVlc3Rpb25SdW5WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlDQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQUVKLFNBQUEsR0FBVzs7NEJBRVgsTUFBQSxHQUNFO0lBQUEsY0FBQSxFQUEyQixRQUEzQjtJQUNBLGlCQUFBLEVBQTJCLFFBRDNCO0lBRUEsd0JBQUEsRUFBMkIsUUFGM0I7Ozs0QkFJRixNQUFBLEdBQVEsU0FBQyxLQUFEO1dBQ04sSUFBQyxDQUFBLE9BQUQsQ0FBUyxRQUFULEVBQW1CLEtBQW5CLEVBQTBCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE9BQVgsQ0FBMUI7RUFETTs7NEJBR1IsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxFQUFELENBQUksTUFBSixFQUFZLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtlQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7TUFBSDtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWjtJQUNBLElBQUMsQ0FBQSxLQUFELEdBQWEsT0FBTyxDQUFDO0lBQ3JCLElBQUMsQ0FBQSxNQUFELEdBQWEsT0FBTyxDQUFDO0lBQ3JCLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDO0lBQ3JCLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBZCxDQUFrQixZQUFsQjtJQUNkLElBQXdGLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQWQsQ0FBa0IsWUFBbEIsQ0FBQSxLQUFtQyxFQUEzSDtNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsdUJBQUEsR0FBdUIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFkLENBQWtCLFlBQWxCLENBQUQsQ0FBdkIsR0FBd0QsaUJBQXJFOztJQUVBLElBQUEsQ0FBTyxJQUFDLENBQUEs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SUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUM7RUFEUDs7NkJBR1osTUFBQSxHQUFRLFNBQUE7QUFFTixRQUFBO0lBQUEsT0FBQSxHQUFVOztBQUFDO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQUE7QUFBQTs7aUJBQUQsQ0FLVyxDQUFDLElBTFosQ0FLaUIsRUFMakI7V0FPVixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpRUFBQSxHQUlOLE9BSko7RUFUTTs7OztHQVBxQixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9xdWVzdGlvbi9RdWVzdGlvblJ1blZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBRdWVzdGlvblJ1blZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcInF1ZXN0aW9uXCJcblxuICBldmVudHM6XG4gICAgJ2NoYW5nZSBpbnB1dCcgICAgICAgICAgIDogJ3VwZGF0ZSdcbiAgICAnY2hhbmdlIHRleHRhcmVhJyAgICAgICAgOiAndXBkYXRlJ1xuICAgICdjbGljayAuYXV0b3Njcm9sbF9pY29uJyA6ICdzY3JvbGwnXG5cbiAgc2Nyb2xsOiAoZXZlbnQpIC0+XG4gICAgQHRyaWdnZXIgXCJzY3JvbGxcIiwgZXZlbnQsIEBtb2RlbC5nZXQoXCJvcmRlclwiKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBvbiBcInNob3dcIiwgPT4gQG9uU2hvdygpXG4gICAgQG1vZGVsICAgICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ICAgID0gb3B0aW9ucy5wYXJlbnRcbiAgICBAZGF0YUVudHJ5ID0gb3B0aW9ucy5kYXRhRW50cnlcbiAgICBAZm9udEZhbWlseSA9IEBwYXJlbnQubW9kZWwuZ2V0KCdmb250RmFtaWx5JylcbiAgICBAZm9udFN0eWxlID0gXCJzdHlsZT1cXFwiZm9udC1mYW1pbHk6ICN7QHBhcmVudC5tb2RlbC5nZXQoJ2ZvbnRGYW1pbHknKX0gIWltcG9ydGFudDtcXFwiXCIgaWYgQHBhcmVudC5tb2RlbC5nZXQoXCJmb250RmFtaWx5XCIpICE9IFwiXCIgXG5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgQGFuc3dlciA9IG9wdGlvbnMuYW5zd2VyXG4gICAgZWxzZVxuICAgICAgQGFuc3dlciA9IHt9XG5cbiAgICBAbmFtZSAgICAgPSBAbW9kZWwuZXNjYXBlKFwibmFtZVwiKS5yZXBsYWNlIC9bXkEtWmEtejAtOV9dL2csIFwiLVwiXG4gICAgQHR5cGUgICAgID0gQG1vZGVsLmdldCBcInR5cGVcIlxuICAgIEBvcHRpb25zICA9IEBtb2RlbC5nZXQgXCJvcHRpb25zXCJcbiAgICBAbm90QXNrZWQgPSBvcHRpb25zLm5vdEFza2VkXG4gICAgQGlzT2JzZXJ2YXRpb24gPSBvcHRpb25zLmlzT2JzZXJ2YXRpb25cblxuICAgIEBkZWZpbmVTcGVjaWFsQ2FzZVJlc3VsdHMoKVxuXG4gICAgaWYgQG1vZGVsLmdldEJvb2xlYW4oXCJza2lwcGFibGVcIilcbiAgICAgIEBpc1ZhbGlkID0gdHJ1ZVxuICAgICAgQHNraXBwZWQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgQGlzVmFsaWQgPSBmYWxzZVxuICAgICAgQHNraXBwZWQgPSBmYWxzZVxuICAgIFxuICAgIGlmIEBub3RBc2tlZCA9PSB0cnVlXG4gICAgICBAaXNWYWxpZCA9IHRydWVcbiAgICAgIEB1cGRhdGVSZXN1bHQoKVxuXG4gICAgaWYgQHR5cGUgPT0gXCJzaW5nbGVcIiBvciBAdHlwZSA9PSBcIm11bHRpcGxlXCJcbiAgICAgIEBidXR0b24gPSBuZXcgQnV0dG9uVmlld1xuICAgICAgICBvcHRpb25zIDogQG9wdGlvbnNcbiAgICAgICAgbW9kZSAgICA6IEB0eXBlXG4gICAgICAgIGRhdGFFbnRyeSAgOiBAZGF0YUVudHJ5XG4gICAgICAgIGFuc3dlciAgICAgOiBAYW5zd2VyXG4gICAgICAgIGZvbnRGYW1pbHkgOiBAZm9udEZhbWlseVxuXG4gICAgICBAYnV0dG9uLm9uIFwiY2hhbmdlIHJlbmRlcmVkXCIsID0+IEB1cGRhdGUoKVxuXG4gIHByZXZpb3VzQW5zd2VyOiA9PlxuICAgIEBwYXJlbnQucXVlc3Rpb25WaWV3c1tAcGFyZW50LnF1ZXN0aW9uSW5kZXggLSAxXS5hbnN3ZXIgaWYgQHBhcmVudC5xdWVzdGlvbkluZGV4ID49IDBcblxuICBvblNob3c6ID0+XG5cbiAgICBzaG93Q29kZSA9IEBtb2RlbC5nZXRTdHJpbmcoXCJkaXNwbGF5Q29kZVwiKVxuXG4gICAgcmV0dXJuIGlmIF8uaXNFbXB0eVN0cmluZyhzaG93Q29kZSlcblxuICAgIHRyeVxuICAgICAgQ29mZmVlU2NyaXB0LmV2YWwuYXBwbHkoQCwgW3Nob3dDb2RlXSlcbiAgICBjYXRjaCBlcnJvclxuICAgICAgbmFtZSA9ICgoL2Z1bmN0aW9uICguezEsfSlcXCgvKS5leGVjKGVycm9yLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkpWzFdKVxuICAgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICAgIGFsZXJ0IFwiRGlzcGxheSBjb2RlIGVycm9yXFxuXFxuI3tuYW1lfVxcblxcbiN7bWVzc2FnZX1cIlxuXG4gIHVwZGF0ZTogKGV2ZW50KSA9PlxuICAgIEB1cGRhdGVSZXN1bHQoKVxuICAgIEB1cGRhdGVWYWxpZGl0eSgpXG4gICAgQHRyaWdnZXIgXCJhbnN3ZXJcIiwgZXZlbnQsIEBtb2RlbC5nZXQoXCJvcmRlclwiKVxuXG4gIHVwZGF0ZVJlc3VsdDogPT5cbiAgICBpZiBAbm90QXNrZWQgPT0gdHJ1ZVxuICAgICAgaWYgQHR5cGUgPT0gXCJtdWx0aXBsZVwiXG4gICAgICAgIGZvciBvcHRpb24sIGkgaW4gQG9wdGlvbnNcbiAgICAgICAgICBAYW5zd2VyW0BvcHRpb25zW2ldLnZhbHVlXSA9IFwibm90X2Fza2VkXCJcbiAgICAgIGVsc2VcbiAgICAgICAgQGFuc3dlciA9IFwibm90X2Fza2VkXCJcbiAgICBlbHNlXG4gICAgICBpZiBAdHlwZSA9PSBcIm9wZW5cIlxuICAgICAgICBAYW5zd2VyID0gQCRlbC5maW5kKFwiIyN7QGNpZH1fI3tAbmFtZX1cIikudmFsKClcbiAgICAgIGVsc2VcbiAgICAgICAgQGFuc3dlciA9IEBidXR0b24uYW5zd2VyXG5cbiAgdXBkYXRlVmFsaWRpdHk6IC0+XG5cbiAgICBpc1NraXBwYWJsZSAgICA9IEBtb2RlbC5nZXRCb29sZWFuKFwic2tpcHBhYmxlXCIpXG4gICAgaXNBdXRvc3RvcHBlZCAgPSBAJGVsLmhhc0NsYXNzKFwiZGlzYWJsZWRfYXV0b3N0b3BcIilcbiAgICBpc0xvZ2ljU2tpcHBlZCA9IEAkZWwuaGFzQ2xhc3MoXCJkaXNhYmxlZF9za2lwcGVkXCIpXG5cbiAgICAjIGhhdmUgd2Ugb3IgY2FuIHdlIGJlIHNraXBwZWQ/XG4gICAgaWYgaXNTa2lwcGFibGUgb3IgKCBpc0xvZ2ljU2tpcHBlZCBvciBpc0F1dG9zdG9wcGVkIClcbiAgICAgICMgWUVTLCBvaywgSSBndWVzcyB3ZSdyZSB2YWxpZFxuICAgICAgQGlzVmFsaWQgPSB0cnVlXG4gICAgICBAc2tpcHBlZCA9IGlmIF8uaXNFbXB0eVN0cmluZyhAYW5zd2VyKSB0aGVuIHRydWUgZWxzZSBmYWxzZVxuICAgIGVsc2VcbiAgICAgICMgTk8sIHNvbWUga2luZCBvZiB2YWxpZGF0aW9uIG11c3Qgb2NjdXIgbm93XG4gICAgICBjdXN0b21WYWxpZGF0aW9uQ29kZSA9IEBtb2RlbC5nZXQoXCJjdXN0b21WYWxpZGF0aW9uQ29kZVwiKVxuXG4gICAgICBAYW5zd2VyID0gXCJcIiB1bmxlc3MgQGFuc3dlclxuXG4gICAgICBpZiBub3QgXy5pc0VtcHR5U3RyaW5nKGN1c3RvbVZhbGlkYXRpb25Db2RlKVxuICAgICAgICB0cnlcbiAgICAgICAgICBAaXNWYWxpZCA9IENvZmZlZVNjcmlwdC5ldmFsLmFwcGx5KEAsIFtjdXN0b21WYWxpZGF0aW9uQ29kZV0pXG4gICAgICAgIGNhdGNoIGVcbiAgICAgICAgICBhbGVydCBcIkN1c3RvbSBWYWxpZGF0aW9uIGVycm9yXFxuXFxuI3tlfVwiXG4gICAgICBlbHNlXG4gICAgICAgIEBpc1ZhbGlkID0gXG4gICAgICAgICAgc3dpdGNoIEB0eXBlXG4gICAgICAgICAgICB3aGVuIFwib3BlblwiXG4gICAgICAgICAgICAgIGlmIF8uaXNFbXB0eVN0cmluZyhAYW5zd2VyKSB8fCAoXy5pc0VtcHR5KEBhbnN3ZXIpICYmIF8uaXNPYmplY3QoQGFuc3dlcikpIHRoZW4gZmFsc2UgZWxzZSB0cnVlICMgZG9uJ3QgdXNlIGlzRW1wdHkgaGVyZVxuICAgICAgICAgICAgd2hlbiBcIm11bHRpcGxlXCJcbiAgICAgICAgICAgICAgaWYgfl8udmFsdWVzKEBhbnN3ZXIpLmluZGV4T2YoXCJjaGVja2VkXCIpIHRoZW4gdHJ1ZSAgZWxzZSBmYWxzZVxuICAgICAgICAgICAgd2hlbiBcInNpbmdsZVwiXG4gICAgICAgICAgICAgIGlmIF8uaXNFbXB0eVN0cmluZyhAYW5zd2VyKSB8fCAoXy5pc0VtcHR5KEBhbnN3ZXIpICYmIF8uaXNPYmplY3QoQGFuc3dlcikpIHRoZW4gZmFsc2UgZWxzZSB0cnVlXG5cblxuICBzZXRPcHRpb25zOiAob3B0aW9ucykgPT5cbiAgICBAYnV0dG9uLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgQGJ1dHRvbi5yZW5kZXIoKVxuXG4gIHNldEFuc3dlcjogKGFuc3dlcikgPT5cbiAgICBhbGVydCBcInNldEFuc3dlciBFcnJvclxcblRyaWVkIHRvIHNldCAje0B0eXBlfSB0eXBlICN7QG5hbWV9IHF1ZXN0aW9uIHRvIHN0cmluZyBhbnN3ZXIuXCIgaWYgXy5pc1N0cmluZyhhbnN3ZXIpICYmIEB0eXBlID09IFwibXVsdGlwbGVcIlxuICAgIGFsZXJ0IFwic2V0QW5zd2VyIEVycm9yXFxuI3tAbmFtZX0gcXVlc3Rpb24gcmVxdWlyZXMgYW4gb2JqZWN0XCIgaWYgbm90IF8uaXNPYmplY3QoYW5zd2VyKSAmJiBAdHlwZSA9PSBcIm11bHRpcGxlXCJcblxuICAgIGlmIEB0eXBlID09IFwibXVsdGlwbGVcIlxuICAgICAgQGJ1dHRvbi5hbnN3ZXIgPSAkLmV4dGVuZChAYnV0dG9uLmFuc3dlciwgYW5zd2VyKVxuICAgIGVsc2UgaWYgQHR5cGUgPT0gXCJzaW5nbGVcIlxuICAgICAgQGJ1dHRvbi5hbnN3ZXIgPSBhbnN3ZXJcbiAgICBlbHNlXG4gICAgICBAYW5zd2VyID0gYW5zd2VyXG5cbiAgICBAdXBkYXRlVmFsaWRpdHkoKVxuICAgIEBidXR0b24ucmVuZGVyKClcblxuICBzZXRNZXNzYWdlOiAobWVzc2FnZSkgPT5cbiAgICBAJGVsLmZpbmQoXCIuZXJyb3JfbWVzc2FnZVwiKS5odG1sIG1lc3NhZ2VcblxuICBzZXRQcm9tcHQ6IChwcm9tcHQpID0+XG4gICAgQCRlbC5maW5kKFwiLnByb21wdFwiKS5odG1sIHByb21wdFxuXG4gIHNldEhpbnQ6IChoaW50KSA9PlxuICAgIEAkZWwuZmluZChcIi5oaW50XCIpLmh0bWwgaGludFxuXG4gIHNldE5hbWU6ICggbmV3TmFtZSA9IEBtb2RlbC5nZXQoJ25hbWUnKSApID0+XG4gICAgQG1vZGVsLnNldChcIm5hbWVcIiwgbmV3TmFtZSlcbiAgICBAbmFtZSA9IEBtb2RlbC5lc2NhcGUoXCJuYW1lXCIpLnJlcGxhY2UgL1teQS1aYS16MC05X10vZywgXCItXCJcblxuICBnZXROYW1lOiA9PlxuICAgIEBtb2RlbC5nZXQoXCJuYW1lXCIpXG5cbiAgcmVuZGVyOiAtPlxuICAgIEAkZWwuYXR0ciBcImlkXCIsIFwicXVlc3Rpb24tI3tAbmFtZX1cIlxuXG4gICAgaWYgbm90IEBub3RBc2tlZFxuXG4gICAgICBodG1sID0gXCI8ZGl2IGNsYXNzPSdlcnJvcl9tZXNzYWdlJz48L2Rpdj48ZGl2IGNsYXNzPSdwcm9tcHQnICN7QGZvbnRTdHlsZSB8fCBcIlwifT4je0Btb2RlbC5nZXQgJ3Byb21wdCd9PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPSdoaW50JyAje0Bmb250U3R5bGUgfHwgXCJcIn0+I3soQG1vZGVsLmdldCgnaGludCcpIHx8IFwiXCIpfTwvZGl2PlwiXG5cbiAgICAgIGlmIEB0eXBlID09IFwib3BlblwiXG4gICAgICAgIGlmIF8uaXNTdHJpbmcoQGFuc3dlcikgJiYgbm90IF8uaXNFbXB0eShAYW5zd2VyKVxuICAgICAgICAgIGFuc3dlclZhbHVlID0gQGFuc3dlclxuICAgICAgICBpZiBAbW9kZWwuZ2V0KFwibXVsdGlsaW5lXCIpXG4gICAgICAgICAgaHRtbCArPSBcIjxkaXY+PHRleHRhcmVhIGlkPScje0BjaWR9XyN7QG5hbWV9JyBkYXRhLWNpZD0nI3tAY2lkfScgdmFsdWU9JyN7YW5zd2VyVmFsdWUgfHwgJyd9Jz48L3RleHRhcmVhPjwvZGl2PlwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBodG1sICs9IFwiPGRpdj48aW5wdXQgaWQ9JyN7QGNpZH1fI3tAbmFtZX0nIGRhdGEtY2lkPScje0BjaWR9JyB2YWx1ZT0nI3thbnN3ZXJWYWx1ZSB8fCAnJ30nPjwvZGl2PlwiXG5cbiAgICAgIGVsc2VcbiAgICAgICAgaHRtbCArPSBcIjxkaXYgY2xhc3M9J2J1dHRvbl9jb250YWluZXInPjwvZGl2PlwiXG5cbiAgICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2ljb25fc2Nyb2xsLnBuZycgY2xhc3M9J2ljb24gYXV0b3Njcm9sbF9pY29uJyBkYXRhLWNpZD0nI3tAY2lkfSc+XCIgaWYgQGlzT2JzZXJ2YXRpb25cbiAgICAgIEAkZWwuaHRtbCBodG1sXG5cbiAgICAgIGlmIEB0eXBlID09IFwic2luZ2xlXCIgb3IgQHR5cGUgPT0gXCJtdWx0aXBsZVwiXG4gICAgICAgIEBidXR0b24uc2V0RWxlbWVudChAJGVsLmZpbmQoXCIuYnV0dG9uX2NvbnRhaW5lclwiKSlcbiAgICAgICAgQGJ1dHRvbi5vbiBcInJlbmRlcmVkXCIsID0+IEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgICAgICBAYnV0dG9uLnJlbmRlcigpXG4gICAgICBlbHNlXG4gICAgICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gICAgZWxzZVxuICAgICAgQCRlbC5oaWRlKClcbiAgICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICBcbiAgZGVmaW5lU3BlY2lhbENhc2VSZXN1bHRzOiAtPlxuICAgIGxpc3QgPSBbXCJtaXNzaW5nXCIsIFwibm90QXNrZWRcIiwgXCJza2lwcGVkXCIsIFwibG9naWNTa2lwcGVkXCIsIFwibm90QXNrZWRBdXRvc3RvcFwiXVxuICAgIGZvciBlbGVtZW50IGluIGxpc3RcbiAgICAgIGlmIEB0eXBlID09IFwic2luZ2xlXCIgfHwgQHR5cGUgPT0gXCJvcGVuXCJcbiAgICAgICAgQFtlbGVtZW50K1wiUmVzdWx0XCJdID0gZWxlbWVudFxuICAgICAgaWYgQHR5cGUgPT0gXCJtdWx0aXBsZVwiXG4gICAgICAgIEBbZWxlbWVudCtcIlJlc3VsdFwiXSA9IHt9XG4gICAgICAgIEBbZWxlbWVudCtcIlJlc3VsdFwiXVtAb3B0aW9uc1tpXS52YWx1ZV0gPSBlbGVtZW50IGZvciBvcHRpb24sIGkgaW4gQG9wdGlvbnNcbiAgICByZXR1cm5cblxuXG5jbGFzcyBTdXJ2ZXlSZXZpZXdWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJRdWVzdGlvblJldmlld1ZpZXdcIlxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEB2aWV3cyA9IG9wdGlvbnMudmlld3NcblxuICByZW5kZXI6IC0+XG5cbiAgICBhbnN3ZXJzID0gKFwiXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxoMz48L2gzPlxuICAgICAgPC9kaXY+XG5cbiAgICBcIiBmb3IgdmlldyBpbiBAdmlld3MpLmpvaW4oXCJcIilcblxuICAgIEAkZWwuaHRtbCBcIlxuXG4gICAgICA8aDI+UGxlYXNlIHJldmlldyB5b3VyIGFuc3dlcnMgYW5kIHByZXNzIG5leHQgd2hlbiByZWFkeS48L2gyPlxuXG4gICAgICAje2Fuc3dlcnN9XG4gICAgXCJcbiJdfQ==

var QuestionRunItemView, SurveyReviewView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

QuestionRunItemView = Backbone.Marionette.ItemView.extend({
  template: JST["QuestionView"],
  className: "question",
  events: {
    'change input': 'update',
    'change textarea': 'update',
    'click .autoscroll_icon': 'scroll'
  },
  scroll: function(event) {
    return this.trigger("scroll", event, this.model.get("order"));
  },
  initialize: function(options) {
    var model;
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
      model = new Button({
        foo: "bar"
      });
      this.button = new ButtonItemView({
        model: model,
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
  },
  previousAnswer: (function(_this) {
    return function() {
      if (_this.parent.questionIndex >= 0) {
        return _this.parent.questionViews[_this.parent.questionIndex - 1].answer;
      }
    };
  })(this),
  onShow: function() {
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
      return alert("Display code error\n\n" + name + "\n\n" + message + "\n\n" + showCode);
    }
  },
  update: function(event) {
    this.updateResult();
    this.updateValidity();
    return this.trigger("answer", event, this.model.get("order"));
  },
  updateResult: function() {
    var i, id, j, len, option, ref, results;
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
        this.answer = this.$el.find("#" + this.cid + "_" + this.name).val();
        id = "#_" + this.name;
        return this.answer = $(id).val();
      } else {
        return this.answer = this.button.answer;
      }
    }
  },
  updateValidity: function() {
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
      if ((customValidationCode != null) && !_.isEmptyString(customValidationCode)) {
        try {
          return this.isValid = CoffeeScript["eval"].apply(this, [customValidationCode]);
        } catch (error1) {
          e = error1;
          return alert("Custom Validation error from customValidationCode: " + customValidationCode + ("\n\n" + e));
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
  },
  setOptions: (function(_this) {
    return function(options) {
      _this.button.options = options;
      return _this.button.render();
    };
  })(this),
  setAnswer: (function(_this) {
    return function(answer) {
      if (_.isString(answer) && _this.type === "multiple") {
        alert("setAnswer Error\nTried to set " + _this.type + " type " + _this.name + " question to string answer.");
      }
      if (!_.isObject(answer) && _this.type === "multiple") {
        alert("setAnswer Error\n" + _this.name + " question requires an object");
      }
      if (_this.type === "multiple") {
        _this.button.answer = $.extend(_this.button.answer, answer);
      } else if (_this.type === "single") {
        _this.button.answer = answer;
      } else {
        _this.answer = answer;
      }
      _this.updateValidity();
      return _this.button.render();
    };
  })(this),
  setMessage: function(message) {
    return this.$el.find(".error_message").html(message);
  },
  setPrompt: (function(_this) {
    return function(prompt) {
      return $(".prompt").html(prompt);
    };
  })(this),
  setHint: (function(_this) {
    return function(hint) {
      return $(".hint").html(hint);
    };
  })(this),
  setName: (function(_this) {
    return function(newName) {
      if (newName == null) {
        newName = _this.model.get('name');
      }
      _this.model.set("name", newName);
      return _this.name = _this.model.escape("name").replace(/[^A-Za-z0-9_]/g, "-");
    };
  })(this),
  getName: (function(_this) {
    return function() {
      return _this.model.get("name");
    };
  })(this),
  onBeforeRender: function() {
    var answerValue;
    this.$el.attr("id", "question-" + this.name);
    if (!this.notAsked) {
      if (this.type === "open") {
        this.model.set('isOpen', true);
        if (_.isString(this.answer) && !_.isEmpty(this.answer)) {
          answerValue = this.answer;
          this.model.set('answerValue', this.answer);
        }
        if (this.model.get("multiline")) {
          return this.model.set('isMultiline', true);
        }
      }
    } else {
      return this.$el.hide();
    }
  },
  onRender: function() {
    if (this.type === "single" || this.type === "multiple") {
      this.button.setElement(this.$el.find(".button_container"));
      this.button.on("rendered", (function(_this) {
        return function() {
          return _this.trigger("rendered");
        };
      })(this));
      return this.button.render();
    } else if (this.type === "open") {
      return this.trigger("rendered");
    }
  },
  renderNOT: function() {
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
  },
  defineSpecialCaseResults: function() {
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
  }
});

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcXVlc3Rpb24vUXVlc3Rpb25SdW5JdGVtVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxxQ0FBQTtFQUFBOzs7QUFBQSxtQkFBQSxHQUFzQixRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUE3QixDQUNwQjtFQUFBLFFBQUEsRUFBVSxHQUFJLENBQUEsY0FBQSxDQUFkO0VBQ0EsU0FBQSxFQUFXLFVBRFg7RUFHQSxNQUFBLEVBQ0U7SUFBQSxjQUFBLEVBQTJCLFFBQTNCO0lBQ0EsaUJBQUEsRUFBMkIsUUFEM0I7SUFFQSx3QkFBQSxFQUEyQixRQUYzQjtHQUpGO0VBUUEsTUFBQSxFQUFRLFNBQUMsS0FBRDtXQUNOLElBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQUFtQixLQUFuQixFQUEwQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxPQUFYLENBQTFCO0VBRE0sQ0FSUjtFQVdBLFVBQUEsRUFBWSxTQUFDLE9BQUQ7QUFDVixRQUFBO0lBQUEsSUFBQyxDQUFBLEVBQUQsQ0FBSSxNQUFKLEVBQVksQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO2VBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtNQUFIO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaO0lBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLE1BQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFkLENBQWtCLFlBQWxCO0lBQ2QsSUFBd0YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBZCxDQUFrQixZQUFsQixDQUFBLEtBQW1DLEVBQTNIO01BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSx1QkFBQSxHQUF1QixDQUFDLElBQUMs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QTtBQUFBOztpQkFBRCxDQUtXLENBQUMsSUFMWixDQUtpQixFQUxqQjtXQU9WLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlFQUFBLEdBSU4sT0FKSjtFQVRNOzs7O0dBUHFCLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3F1ZXN0aW9uL1F1ZXN0aW9uUnVuSXRlbVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJRdWVzdGlvblJ1bkl0ZW1WaWV3ID0gQmFja2JvbmUuTWFyaW9uZXR0ZS5JdGVtVmlldy5leHRlbmRcbiAgdGVtcGxhdGU6IEpTVFtcIlF1ZXN0aW9uVmlld1wiXSxcbiAgY2xhc3NOYW1lOiBcInF1ZXN0aW9uXCJcblxuICBldmVudHM6XG4gICAgJ2NoYW5nZSBpbnB1dCcgICAgICAgICAgIDogJ3VwZGF0ZSdcbiAgICAnY2hhbmdlIHRleHRhcmVhJyAgICAgICAgOiAndXBkYXRlJ1xuICAgICdjbGljayAuYXV0b3Njcm9sbF9pY29uJyA6ICdzY3JvbGwnXG5cbiAgc2Nyb2xsOiAoZXZlbnQpIC0+XG4gICAgQHRyaWdnZXIgXCJzY3JvbGxcIiwgZXZlbnQsIEBtb2RlbC5nZXQoXCJvcmRlclwiKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBvbiBcInNob3dcIiwgPT4gQG9uU2hvdygpXG4gICAgQG1vZGVsICAgICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ICAgID0gb3B0aW9ucy5wYXJlbnRcbiAgICBAZGF0YUVudHJ5ID0gb3B0aW9ucy5kYXRhRW50cnlcbiAgICBAZm9udEZhbWlseSA9IEBwYXJlbnQubW9kZWwuZ2V0KCdmb250RmFtaWx5JylcbiAgICBAZm9udFN0eWxlID0gXCJzdHlsZT1cXFwiZm9udC1mYW1pbHk6ICN7QHBhcmVudC5tb2RlbC5nZXQoJ2ZvbnRGYW1pbHknKX0gIWltcG9ydGFudDtcXFwiXCIgaWYgQHBhcmVudC5tb2RlbC5nZXQoXCJmb250RmFtaWx5XCIpICE9IFwiXCJcbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgQGFuc3dlciA9IG9wdGlvbnMuYW5zd2VyXG4gICAgZWxzZVxuICAgICAgQGFuc3dlciA9IHt9XG5cbiAgICBAbmFtZSAgICAgPSBAbW9kZWwuZXNjYXBlKFwibmFtZVwiKS5yZXBsYWNlIC9bXkEtWmEtejAtOV9dL2csIFwiLVwiXG4gICAgQHR5cGUgICAgID0gQG1vZGVsLmdldCBcInR5cGVcIlxuICAgIEBvcHRpb25zICA9IEBtb2RlbC5nZXQgXCJvcHRpb25zXCJcbiAgICBAbm90QXNrZWQgPSBvcHRpb25zLm5vdEFza2VkXG4gICAgQGlzT2JzZXJ2YXRpb24gPSBvcHRpb25zLmlzT2JzZXJ2YXRpb25cblxuICAgIEBkZWZpbmVTcGVjaWFsQ2FzZVJlc3VsdHMoKVxuXG4gICAgaWYgQG1vZGVsLmdldEJvb2xlYW4oXCJza2lwcGFibGVcIilcbiAgICAgIEBpc1ZhbGlkID0gdHJ1ZVxuICAgICAgQHNraXBwZWQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgQGlzVmFsaWQgPSBmYWxzZVxuICAgICAgQHNraXBwZWQgPSBmYWxzZVxuXG4gICAgaWYgQG5vdEFza2VkID09IHRydWVcbiAgICAgIEBpc1ZhbGlkID0gdHJ1ZVxuICAgICAgQHVwZGF0ZVJlc3VsdCgpXG5cbiAgICBpZiBAdHlwZSA9PSBcInNpbmdsZVwiIG9yIEB0eXBlID09IFwibXVsdGlwbGVcIlxuICAgICAgbW9kZWwgPSBuZXcgQnV0dG9uKHtmb286IFwiYmFyXCJ9KVxuICAgICAgQGJ1dHRvbiA9IG5ldyBCdXR0b25JdGVtVmlld1xuICAgICAgICBtb2RlbCAgIDogbW9kZWxcbiAgICAgICAgb3B0aW9ucyA6IEBvcHRpb25zXG4gICAgICAgIG1vZGUgICAgOiBAdHlwZVxuICAgICAgICBkYXRhRW50cnkgIDogQGRhdGFFbnRyeVxuICAgICAgICBhbnN3ZXIgICAgIDogQGFuc3dlclxuICAgICAgICBmb250RmFtaWx5IDogQGZvbnRGYW1pbHlcblxuICAgICAgQGJ1dHRvbi5vbiBcImNoYW5nZSByZW5kZXJlZFwiLCA9PiBAdXBkYXRlKClcblxuICBwcmV2aW91c0Fuc3dlcjogPT5cbiAgICBAcGFyZW50LnF1ZXN0aW9uVmlld3NbQHBhcmVudC5xdWVzdGlvbkluZGV4IC0gMV0uYW5zd2VyIGlmIEBwYXJlbnQucXVlc3Rpb25JbmRleCA+PSAwXG5cbiAgb25TaG93OiAtPlxuXG4gICAgc2hvd0NvZGUgPSBAbW9kZWwuZ2V0U3RyaW5nKFwiZGlzcGxheUNvZGVcIilcblxuICAgIHJldHVybiBpZiBfLmlzRW1wdHlTdHJpbmcoc2hvd0NvZGUpXG5cbiAgICB0cnlcbiAgICAgIENvZmZlZVNjcmlwdC5ldmFsLmFwcGx5KEAsIFtzaG93Q29kZV0pXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIG5hbWUgPSAoKC9mdW5jdGlvbiAoLnsxLH0pXFwoLykuZXhlYyhlcnJvci5jb25zdHJ1Y3Rvci50b1N0cmluZygpKVsxXSlcbiAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgICBhbGVydCBcIkRpc3BsYXkgY29kZSBlcnJvclxcblxcbiN7bmFtZX1cXG5cXG4je21lc3NhZ2V9XFxuXFxuI3tzaG93Q29kZX1cIlxuXG4gIHVwZGF0ZTogKGV2ZW50KSAtPlxuICAgIEB1cGRhdGVSZXN1bHQoKVxuICAgIEB1cGRhdGVWYWxpZGl0eSgpXG4gICAgQHRyaWdnZXIgXCJhbnN3ZXJcIiwgZXZlbnQsIEBtb2RlbC5nZXQoXCJvcmRlclwiKVxuXG4gIHVwZGF0ZVJlc3VsdDogLT5cbiAgICBpZiBAbm90QXNrZWQgPT0gdHJ1ZVxuICAgICAgaWYgQHR5cGUgPT0gXCJtdWx0aXBsZVwiXG4gICAgICAgIGZvciBvcHRpb24sIGkgaW4gQG9wdGlvbnNcbiAgICAgICAgICBAYW5zd2VyW0BvcHRpb25zW2ldLnZhbHVlXSA9IFwibm90X2Fza2VkXCJcbiAgICAgIGVsc2VcbiAgICAgICAgQGFuc3dlciA9IFwibm90X2Fza2VkXCJcbiAgICBlbHNlXG4gICAgICBpZiBAdHlwZSA9PSBcIm9wZW5cIlxuICAgICAgICBAYW5zd2VyID0gQCRlbC5maW5kKFwiIyN7QGNpZH1fI3tAbmFtZX1cIikudmFsKClcblxuICAgICAgICBpZCA9IFwiI18je0BuYW1lfVwiXG4jICAgICAgICBjb25zb2xlLmxvZyhcIkBhbnN3ZXI6IFwiICsgQGFuc3dlciArIFwiIGlkOiBcIiArIGlkKVxuICAgICAgICBAYW5zd2VyID0gJChpZCkudmFsKClcbiMgICAgICAgIGNvbnNvbGUubG9nKFwiQGFuc3dlcjogXCIgKyBAYW5zd2VyKVxuICAgICAgZWxzZVxuICAgICAgICBAYW5zd2VyID0gQGJ1dHRvbi5hbnN3ZXJcblxuICB1cGRhdGVWYWxpZGl0eTogLT5cblxuICAgIGlzU2tpcHBhYmxlICAgID0gQG1vZGVsLmdldEJvb2xlYW4oXCJza2lwcGFibGVcIilcbiAgICBpc0F1dG9zdG9wcGVkICA9IEAkZWwuaGFzQ2xhc3MoXCJkaXNhYmxlZF9hdXRvc3RvcFwiKVxuICAgIGlzTG9naWNTa2lwcGVkID0gQCRlbC5oYXNDbGFzcyhcImRpc2FibGVkX3NraXBwZWRcIilcblxuICAgICMgaGF2ZSB3ZSBvciBjYW4gd2UgYmUgc2tpcHBlZD9cbiAgICBpZiBpc1NraXBwYWJsZSBvciAoIGlzTG9naWNTa2lwcGVkIG9yIGlzQXV0b3N0b3BwZWQgKVxuICAgICAgIyBZRVMsIG9rLCBJIGd1ZXNzIHdlJ3JlIHZhbGlkXG4gICAgICBAaXNWYWxpZCA9IHRydWVcbiAgICAgIEBza2lwcGVkID0gaWYgXy5pc0VtcHR5U3RyaW5nKEBhbnN3ZXIpIHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG4gICAgZWxzZVxuICAgICAgIyBOTywgc29tZSBraW5kIG9mIHZhbGlkYXRpb24gbXVzdCBvY2N1ciBub3dcbiAgICAgIGN1c3RvbVZhbGlkYXRpb25Db2RlID0gQG1vZGVsLmdldChcImN1c3RvbVZhbGlkYXRpb25Db2RlXCIpXG4gICAgICBAYW5zd2VyID0gXCJcIiB1bmxlc3MgQGFuc3dlclxuICAgICAgaWYgY3VzdG9tVmFsaWRhdGlvbkNvZGU/ICYmIG5vdCBfLmlzRW1wdHlTdHJpbmcoY3VzdG9tVmFsaWRhdGlvbkNvZGUpXG4gICAgICAgIHRyeVxuICAgICAgICAgIEBpc1ZhbGlkID0gQ29mZmVlU2NyaXB0LmV2YWwuYXBwbHkoQCwgW2N1c3RvbVZhbGlkYXRpb25Db2RlXSlcbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgIGFsZXJ0IFwiQ3VzdG9tIFZhbGlkYXRpb24gZXJyb3IgZnJvbSBjdXN0b21WYWxpZGF0aW9uQ29kZTogXCIgKyBjdXN0b21WYWxpZGF0aW9uQ29kZSArIFwiXFxuXFxuI3tlfVwiXG4gICAgICBlbHNlXG4gICAgICAgIEBpc1ZhbGlkID1cbiAgICAgICAgICBzd2l0Y2ggQHR5cGVcbiAgICAgICAgICAgIHdoZW4gXCJvcGVuXCJcbiMgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiIHByb21wdDogXCIgKyBAbW9kZWwuZ2V0KFwicHJvbXB0XCIpICsgXCIgQG5hbWU6IFwiICsgQG5hbWUgKyBcIiBAYW5zd2VyOiBcIiArIEBhbnN3ZXIpXG4gICAgICAgICAgICAgIGlmIF8uaXNFbXB0eVN0cmluZyhAYW5zd2VyKSB8fCAoXy5pc0VtcHR5KEBhbnN3ZXIpICYmIF8uaXNPYmplY3QoQGFuc3dlcikpIHRoZW4gZmFsc2UgZWxzZSB0cnVlICMgZG9uJ3QgdXNlIGlzRW1wdHkgaGVyZVxuICAgICAgICAgICAgd2hlbiBcIm11bHRpcGxlXCJcbiAgICAgICAgICAgICAgaWYgfl8udmFsdWVzKEBhbnN3ZXIpLmluZGV4T2YoXCJjaGVja2VkXCIpIHRoZW4gdHJ1ZSAgZWxzZSBmYWxzZVxuICAgICAgICAgICAgd2hlbiBcInNpbmdsZVwiXG4jICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkBhbnN3ZXI6IFwiICsgQGFuc3dlciArIFwiIF8uaXNFbXB0eVN0cmluZyhAYW5zd2VyKVwiICsgXy5pc0VtcHR5U3RyaW5nKEBhbnN3ZXIpICsgXCIgXy5pc0VtcHR5KEBhbnN3ZXIpOiBcIiArIFwiIF8uaXNPYmplY3QoQGFuc3dlcik6XCIgKyBfLmlzT2JqZWN0KEBhbnN3ZXIpKVxuICAgICAgICAgICAgICBpZiBfLmlzRW1wdHlTdHJpbmcoQGFuc3dlcikgfHwgKF8uaXNFbXB0eShAYW5zd2VyKSAmJiBfLmlzT2JqZWN0KEBhbnN3ZXIpKSB0aGVuIGZhbHNlIGVsc2UgdHJ1ZVxuXG4gIHNldE9wdGlvbnM6IChvcHRpb25zKSA9PlxuICAgIEBidXR0b24ub3B0aW9ucyA9IG9wdGlvbnNcbiAgICBAYnV0dG9uLnJlbmRlcigpXG5cbiAgc2V0QW5zd2VyOiAoYW5zd2VyKSA9PlxuICAgIGFsZXJ0IFwic2V0QW5zd2VyIEVycm9yXFxuVHJpZWQgdG8gc2V0ICN7QHR5cGV9IHR5cGUgI3tAbmFtZX0gcXVlc3Rpb24gdG8gc3RyaW5nIGFuc3dlci5cIiBpZiBfLmlzU3RyaW5nKGFuc3dlcikgJiYgQHR5cGUgPT0gXCJtdWx0aXBsZVwiXG4gICAgYWxlcnQgXCJzZXRBbnN3ZXIgRXJyb3JcXG4je0BuYW1lfSBxdWVzdGlvbiByZXF1aXJlcyBhbiBvYmplY3RcIiBpZiBub3QgXy5pc09iamVjdChhbnN3ZXIpICYmIEB0eXBlID09IFwibXVsdGlwbGVcIlxuXG4gICAgaWYgQHR5cGUgPT0gXCJtdWx0aXBsZVwiXG4gICAgICBAYnV0dG9uLmFuc3dlciA9ICQuZXh0ZW5kKEBidXR0b24uYW5zd2VyLCBhbnN3ZXIpXG4gICAgZWxzZSBpZiBAdHlwZSA9PSBcInNpbmdsZVwiXG4gICAgICBAYnV0dG9uLmFuc3dlciA9IGFuc3dlclxuICAgIGVsc2VcbiAgICAgIEBhbnN3ZXIgPSBhbnN3ZXJcblxuICAgIEB1cGRhdGVWYWxpZGl0eSgpXG4gICAgQGJ1dHRvbi5yZW5kZXIoKVxuXG4gIHNldE1lc3NhZ2U6IChtZXNzYWdlKSAtPlxuICAgIEAkZWwuZmluZChcIi5lcnJvcl9tZXNzYWdlXCIpLmh0bWwgbWVzc2FnZVxuIyAgICAkKFwiLmVycm9yX21lc3NhZ2VcIikuaHRtbCBtZXNzYWdlXG4jICAgICQoXCIjXCIgKyBAZWwuaWQgKyBcIiAuZXJyb3JfbWVzc2FnZVwiKS5odG1sICBtZXNzYWdlXG5cbiAgc2V0UHJvbXB0OiAocHJvbXB0KSA9PlxuIyAgICBAJGVsLmZpbmQoXCIucHJvbXB0XCIpLmh0bWwgcHJvbXB0XG4gICAgJChcIi5wcm9tcHRcIikuaHRtbCBwcm9tcHRcblxuICBzZXRIaW50OiAoaGludCkgPT5cbiMgICAgQCRlbC5maW5kKFwiLmhpbnRcIikuaHRtbCBoaW50XG4gICAgJChcIi5oaW50XCIpLmh0bWwgaGludFxuXG4gIHNldE5hbWU6ICggbmV3TmFtZSA9IEBtb2RlbC5nZXQoJ25hbWUnKSApID0+XG4gICAgQG1vZGVsLnNldChcIm5hbWVcIiwgbmV3TmFtZSlcbiAgICBAbmFtZSA9IEBtb2RlbC5lc2NhcGUoXCJuYW1lXCIpLnJlcGxhY2UgL1teQS1aYS16MC05X10vZywgXCItXCJcblxuICBnZXROYW1lOiA9PlxuICAgIEBtb2RlbC5nZXQoXCJuYW1lXCIpXG5cbiAgb25CZWZvcmVSZW5kZXI6IC0+XG4gICAgQCRlbC5hdHRyIFwiaWRcIiwgXCJxdWVzdGlvbi0je0BuYW1lfVwiXG4gICAgaWYgbm90IEBub3RBc2tlZFxuICAgICAgaWYgQHR5cGUgPT0gXCJvcGVuXCJcbiAgICAgICAgQG1vZGVsLnNldCgnaXNPcGVuJywgdHJ1ZSlcbiAgICAgICAgaWYgXy5pc1N0cmluZyhAYW5zd2VyKSAmJiBub3QgXy5pc0VtcHR5KEBhbnN3ZXIpXG4gICAgICAgICAgYW5zd2VyVmFsdWUgPSBAYW5zd2VyXG4gICAgICAgICAgQG1vZGVsLnNldCgnYW5zd2VyVmFsdWUnLCBAYW5zd2VyKVxuICAgICAgICBpZiBAbW9kZWwuZ2V0KFwibXVsdGlsaW5lXCIpXG4gICAgICAgICAgQG1vZGVsLnNldCgnaXNNdWx0aWxpbmUnLCB0cnVlKVxuIyAgICAgIGlmIEB0eXBlID09IFwic2luZ2xlXCIgb3IgQHR5cGUgPT0gXCJtdWx0aXBsZVwiXG4jICAgICAgICBAYnV0dG9uLnNldEVsZW1lbnQoQCRlbC5maW5kKFwiLmJ1dHRvbl9jb250YWluZXJcIikpXG4jICAgICAgICBAYnV0dG9uLm9uIFwicmVuZGVyZWRcIiwgPT4gQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4jICAgICAgICBAYnV0dG9uLnJlbmRlcigpXG4jICAgICAgZWxzZVxuIyAgICAgICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgZWxzZVxuICAgICAgQCRlbC5oaWRlKClcbiMgICAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICBvblJlbmRlcjogLT5cbiMgICAgY29uc29sZS5sb2coXCJvblJlbmRlciBuYW1lOlwiICsgQG1vZGVsLmdldChcIm5hbWVcIikgKyBcIiBhbnN3ZXI6IFwiICsgQG1vZGVsLmdldChcInByb21wdFwiKSlcbiAgICBpZiBAdHlwZSA9PSBcInNpbmdsZVwiIG9yIEB0eXBlID09IFwibXVsdGlwbGVcIlxuICAgICAgQGJ1dHRvbi5zZXRFbGVtZW50IEAkZWwuZmluZCBcIi5idXR0b25fY29udGFpbmVyXCJcbiAgICAgIEBidXR0b24ub24gXCJyZW5kZXJlZFwiLCA9PiBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgICAgIEBidXR0b24ucmVuZGVyKClcbiAgICBlbHNlIGlmIEB0eXBlID09IFwib3BlblwiXG4gICAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICByZW5kZXJOT1Q6IC0+XG4gICAgQCRlbC5hdHRyIFwiaWRcIiwgXCJxdWVzdGlvbi0je0BuYW1lfVwiXG5cbiAgICBpZiBub3QgQG5vdEFza2VkXG5cbiAgICAgIGh0bWwgPSBcIjxkaXYgY2xhc3M9J2Vycm9yX21lc3NhZ2UnPjwvZGl2PjxkaXYgY2xhc3M9J3Byb21wdCcgI3tAZm9udFN0eWxlIHx8IFwiXCJ9PiN7QG1vZGVsLmdldCAncHJvbXB0J308L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2hpbnQnICN7QGZvbnRTdHlsZSB8fCBcIlwifT4jeyhAbW9kZWwuZ2V0KCdoaW50JykgfHwgXCJcIil9PC9kaXY+XCJcblxuICAgICAgaWYgQHR5cGUgPT0gXCJvcGVuXCJcbiAgICAgICAgaWYgXy5pc1N0cmluZyhAYW5zd2VyKSAmJiBub3QgXy5pc0VtcHR5KEBhbnN3ZXIpXG4gICAgICAgICAgYW5zd2VyVmFsdWUgPSBAYW5zd2VyXG4gICAgICAgIGlmIEBtb2RlbC5nZXQoXCJtdWx0aWxpbmVcIilcbiAgICAgICAgICBodG1sICs9IFwiPGRpdj48dGV4dGFyZWEgaWQ9JyN7QGNpZH1fI3tAbmFtZX0nIGRhdGEtY2lkPScje0BjaWR9JyB2YWx1ZT0nI3thbnN3ZXJWYWx1ZSB8fCAnJ30nPjwvdGV4dGFyZWE+PC9kaXY+XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGh0bWwgKz0gXCI8ZGl2PjxpbnB1dCBpZD0nI3tAY2lkfV8je0BuYW1lfScgZGF0YS1jaWQ9JyN7QGNpZH0nIHZhbHVlPScje2Fuc3dlclZhbHVlIHx8ICcnfSc+PC9kaXY+XCJcblxuICAgICAgZWxzZVxuICAgICAgICBodG1sICs9IFwiPGRpdiBjbGFzcz0nYnV0dG9uX2NvbnRhaW5lcic+PC9kaXY+XCJcblxuICAgICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvaWNvbl9zY3JvbGwucG5nJyBjbGFzcz0naWNvbiBhdXRvc2Nyb2xsX2ljb24nIGRhdGEtY2lkPScje0BjaWR9Jz5cIiBpZiBAaXNPYnNlcnZhdGlvblxuICAgICAgQCRlbC5odG1sIGh0bWxcblxuICAgICAgaWYgQHR5cGUgPT0gXCJzaW5nbGVcIiBvciBAdHlwZSA9PSBcIm11bHRpcGxlXCJcbiAgICAgICAgQGJ1dHRvbi5zZXRFbGVtZW50KEAkZWwuZmluZChcIi5idXR0b25fY29udGFpbmVyXCIpKVxuICAgICAgICBAYnV0dG9uLm9uIFwicmVuZGVyZWRcIiwgPT4gQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgICAgIEBidXR0b24ucmVuZGVyKClcbiAgICAgIGVsc2VcbiAgICAgICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgICBlbHNlXG4gICAgICBAJGVsLmhpZGUoKVxuICAgICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgZGVmaW5lU3BlY2lhbENhc2VSZXN1bHRzOiAtPlxuICAgIGxpc3QgPSBbXCJtaXNzaW5nXCIsIFwibm90QXNrZWRcIiwgXCJza2lwcGVkXCIsIFwibG9naWNTa2lwcGVkXCIsIFwibm90QXNrZWRBdXRvc3RvcFwiXVxuICAgIGZvciBlbGVtZW50IGluIGxpc3RcbiAgICAgIGlmIEB0eXBlID09IFwic2luZ2xlXCIgfHwgQHR5cGUgPT0gXCJvcGVuXCJcbiAgICAgICAgQFtlbGVtZW50K1wiUmVzdWx0XCJdID0gZWxlbWVudFxuICAgICAgaWYgQHR5cGUgPT0gXCJtdWx0aXBsZVwiXG4gICAgICAgIEBbZWxlbWVudCtcIlJlc3VsdFwiXSA9IHt9XG4gICAgICAgIEBbZWxlbWVudCtcIlJlc3VsdFwiXVtAb3B0aW9uc1tpXS52YWx1ZV0gPSBlbGVtZW50IGZvciBvcHRpb24sIGkgaW4gQG9wdGlvbnNcbiAgICByZXR1cm5cblxuXG5jbGFzcyBTdXJ2ZXlSZXZpZXdWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJRdWVzdGlvblJldmlld1ZpZXdcIlxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEB2aWV3cyA9IG9wdGlvbnMudmlld3NcblxuICByZW5kZXI6IC0+XG5cbiAgICBhbnN3ZXJzID0gKFwiXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxoMz48L2gzPlxuICAgICAgPC9kaXY+XG5cbiAgICBcIiBmb3IgdmlldyBpbiBAdmlld3MpLmpvaW4oXCJcIilcblxuICAgIEAkZWwuaHRtbCBcIlxuXG4gICAgICA8aDI+UGxlYXNlIHJldmlldyB5b3VyIGFuc3dlcnMgYW5kIHByZXNzIG5leHQgd2hlbiByZWFkeS48L2gyPlxuXG4gICAgICAje2Fuc3dlcnN9XG4gICAgXCJcbiJdfQ==

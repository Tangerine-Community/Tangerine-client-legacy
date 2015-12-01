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
  setMessage: (function(_this) {
    return function(message) {
      return $(".error_message").html(message);
    };
  })(this),
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcXVlc3Rpb24vUXVlc3Rpb25SdW5JdGVtVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxxQ0FBQTtFQUFBOzs7QUFBQSxtQkFBQSxHQUFzQixRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUE3QixDQUNwQjtFQUFBLFFBQUEsRUFBVSxHQUFJLENBQUEsY0FBQSxDQUFkO0VBQ0EsU0FBQSxFQUFXLFVBRFg7RUFHQSxNQUFBLEVBQ0U7SUFBQSxjQUFBLEVBQTJCLFFBQTNCO0lBQ0EsaUJBQUEsRUFBMkIsUUFEM0I7SUFFQSx3QkFBQSxFQUEyQixRQUYzQjtHQUpGO0VBUUEsTUFBQSxFQUFRLFNBQUMsS0FBRDtXQUNOLElBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQUFtQixLQUFuQixFQUEwQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxPQUFYLENBQTFCO0VBRE0sQ0FSUjtFQVdBLFVBQUEsRUFBWSxTQUFDLE9BQUQ7QUFDVixRQUFBO0lBQUEsSUFBQyxDQUFBLEVBQUQsQ0FBSSxNQUFKLEVBQVksQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO2VBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtNQUFIO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaO0lBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLE1BQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFkLENBQWtCLFlBQWxCO0lBQ2QsSUFBd0YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBZCxDQUFrQixZQUFsQixDQUFBLEtBQW1DLEVBQTNIO01BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSx1QkFBQSxHQUF1QixDQUFDLElBQUMs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LENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpRUFBQSxHQUlOLE9BSko7RUFUTTs7OztHQVBxQixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9xdWVzdGlvbi9RdWVzdGlvblJ1bkl0ZW1WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiUXVlc3Rpb25SdW5JdGVtVmlldyA9IEJhY2tib25lLk1hcmlvbmV0dGUuSXRlbVZpZXcuZXh0ZW5kXG4gIHRlbXBsYXRlOiBKU1RbXCJRdWVzdGlvblZpZXdcIl0sXG4gIGNsYXNzTmFtZTogXCJxdWVzdGlvblwiXG5cbiAgZXZlbnRzOlxuICAgICdjaGFuZ2UgaW5wdXQnICAgICAgICAgICA6ICd1cGRhdGUnXG4gICAgJ2NoYW5nZSB0ZXh0YXJlYScgICAgICAgIDogJ3VwZGF0ZSdcbiAgICAnY2xpY2sgLmF1dG9zY3JvbGxfaWNvbicgOiAnc2Nyb2xsJ1xuXG4gIHNjcm9sbDogKGV2ZW50KSAtPlxuICAgIEB0cmlnZ2VyIFwic2Nyb2xsXCIsIGV2ZW50LCBAbW9kZWwuZ2V0KFwib3JkZXJcIilcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAb24gXCJzaG93XCIsID0+IEBvblNob3coKVxuICAgIEBtb2RlbCAgICAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCAgICA9IG9wdGlvbnMucGFyZW50XG4gICAgQGRhdGFFbnRyeSA9IG9wdGlvbnMuZGF0YUVudHJ5XG4gICAgQGZvbnRGYW1pbHkgPSBAcGFyZW50Lm1vZGVsLmdldCgnZm9udEZhbWlseScpXG4gICAgQGZvbnRTdHlsZSA9IFwic3R5bGU9XFxcImZvbnQtZmFtaWx5OiAje0BwYXJlbnQubW9kZWwuZ2V0KCdmb250RmFtaWx5Jyl9ICFpbXBvcnRhbnQ7XFxcIlwiIGlmIEBwYXJlbnQubW9kZWwuZ2V0KFwiZm9udEZhbWlseVwiKSAhPSBcIlwiXG4gICAgdW5sZXNzIEBkYXRhRW50cnlcbiAgICAgIEBhbnN3ZXIgPSBvcHRpb25zLmFuc3dlclxuICAgIGVsc2VcbiAgICAgIEBhbnN3ZXIgPSB7fVxuXG4gICAgQG5hbWUgICAgID0gQG1vZGVsLmVzY2FwZShcIm5hbWVcIikucmVwbGFjZSAvW15BLVphLXowLTlfXS9nLCBcIi1cIlxuICAgIEB0eXBlICAgICA9IEBtb2RlbC5nZXQgXCJ0eXBlXCJcbiAgICBAb3B0aW9ucyAgPSBAbW9kZWwuZ2V0IFwib3B0aW9uc1wiXG4gICAgQG5vdEFza2VkID0gb3B0aW9ucy5ub3RBc2tlZFxuICAgIEBpc09ic2VydmF0aW9uID0gb3B0aW9ucy5pc09ic2VydmF0aW9uXG5cbiAgICBAZGVmaW5lU3BlY2lhbENhc2VSZXN1bHRzKClcblxuICAgIGlmIEBtb2RlbC5nZXRCb29sZWFuKFwic2tpcHBhYmxlXCIpXG4gICAgICBAaXNWYWxpZCA9IHRydWVcbiAgICAgIEBza2lwcGVkID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIEBpc1ZhbGlkID0gZmFsc2VcbiAgICAgIEBza2lwcGVkID0gZmFsc2VcblxuICAgIGlmIEBub3RBc2tlZCA9PSB0cnVlXG4gICAgICBAaXNWYWxpZCA9IHRydWVcbiAgICAgIEB1cGRhdGVSZXN1bHQoKVxuXG4gICAgaWYgQHR5cGUgPT0gXCJzaW5nbGVcIiBvciBAdHlwZSA9PSBcIm11bHRpcGxlXCJcbiAgICAgIG1vZGVsID0gbmV3IEJ1dHRvbih7Zm9vOiBcImJhclwifSlcbiAgICAgIEBidXR0b24gPSBuZXcgQnV0dG9uSXRlbVZpZXdcbiAgICAgICAgbW9kZWwgICA6IG1vZGVsXG4gICAgICAgIG9wdGlvbnMgOiBAb3B0aW9uc1xuICAgICAgICBtb2RlICAgIDogQHR5cGVcbiAgICAgICAgZGF0YUVudHJ5ICA6IEBkYXRhRW50cnlcbiAgICAgICAgYW5zd2VyICAgICA6IEBhbnN3ZXJcbiAgICAgICAgZm9udEZhbWlseSA6IEBmb250RmFtaWx5XG5cbiAgICAgIEBidXR0b24ub24gXCJjaGFuZ2UgcmVuZGVyZWRcIiwgPT4gQHVwZGF0ZSgpXG5cbiAgcHJldmlvdXNBbnN3ZXI6ID0+XG4gICAgQHBhcmVudC5xdWVzdGlvblZpZXdzW0BwYXJlbnQucXVlc3Rpb25JbmRleCAtIDFdLmFuc3dlciBpZiBAcGFyZW50LnF1ZXN0aW9uSW5kZXggPj0gMFxuXG4gIG9uU2hvdzogLT5cblxuICAgIHNob3dDb2RlID0gQG1vZGVsLmdldFN0cmluZyhcImRpc3BsYXlDb2RlXCIpXG5cbiAgICByZXR1cm4gaWYgXy5pc0VtcHR5U3RyaW5nKHNob3dDb2RlKVxuXG4gICAgdHJ5XG4gICAgICBDb2ZmZWVTY3JpcHQuZXZhbC5hcHBseShALCBbc2hvd0NvZGVdKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICBuYW1lID0gKCgvZnVuY3Rpb24gKC57MSx9KVxcKC8pLmV4ZWMoZXJyb3IuY29uc3RydWN0b3IudG9TdHJpbmcoKSlbMV0pXG4gICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgICAgYWxlcnQgXCJEaXNwbGF5IGNvZGUgZXJyb3JcXG5cXG4je25hbWV9XFxuXFxuI3ttZXNzYWdlfVxcblxcbiN7c2hvd0NvZGV9XCJcblxuICB1cGRhdGU6IChldmVudCkgLT5cbiAgICBAdXBkYXRlUmVzdWx0KClcbiAgICBAdXBkYXRlVmFsaWRpdHkoKVxuICAgIEB0cmlnZ2VyIFwiYW5zd2VyXCIsIGV2ZW50LCBAbW9kZWwuZ2V0KFwib3JkZXJcIilcblxuICB1cGRhdGVSZXN1bHQ6IC0+XG4gICAgaWYgQG5vdEFza2VkID09IHRydWVcbiAgICAgIGlmIEB0eXBlID09IFwibXVsdGlwbGVcIlxuICAgICAgICBmb3Igb3B0aW9uLCBpIGluIEBvcHRpb25zXG4gICAgICAgICAgQGFuc3dlcltAb3B0aW9uc1tpXS52YWx1ZV0gPSBcIm5vdF9hc2tlZFwiXG4gICAgICBlbHNlXG4gICAgICAgIEBhbnN3ZXIgPSBcIm5vdF9hc2tlZFwiXG4gICAgZWxzZVxuICAgICAgaWYgQHR5cGUgPT0gXCJvcGVuXCJcbiAgICAgICAgQGFuc3dlciA9IEAkZWwuZmluZChcIiMje0BjaWR9XyN7QG5hbWV9XCIpLnZhbCgpXG5cbiAgICAgICAgaWQgPSBcIiNfI3tAbmFtZX1cIlxuIyAgICAgICAgY29uc29sZS5sb2coXCJAYW5zd2VyOiBcIiArIEBhbnN3ZXIgKyBcIiBpZDogXCIgKyBpZClcbiAgICAgICAgQGFuc3dlciA9ICQoaWQpLnZhbCgpXG4jICAgICAgICBjb25zb2xlLmxvZyhcIkBhbnN3ZXI6IFwiICsgQGFuc3dlcilcbiAgICAgIGVsc2VcbiAgICAgICAgQGFuc3dlciA9IEBidXR0b24uYW5zd2VyXG5cbiAgdXBkYXRlVmFsaWRpdHk6IC0+XG5cbiAgICBpc1NraXBwYWJsZSAgICA9IEBtb2RlbC5nZXRCb29sZWFuKFwic2tpcHBhYmxlXCIpXG4gICAgaXNBdXRvc3RvcHBlZCAgPSBAJGVsLmhhc0NsYXNzKFwiZGlzYWJsZWRfYXV0b3N0b3BcIilcbiAgICBpc0xvZ2ljU2tpcHBlZCA9IEAkZWwuaGFzQ2xhc3MoXCJkaXNhYmxlZF9za2lwcGVkXCIpXG5cbiAgICAjIGhhdmUgd2Ugb3IgY2FuIHdlIGJlIHNraXBwZWQ/XG4gICAgaWYgaXNTa2lwcGFibGUgb3IgKCBpc0xvZ2ljU2tpcHBlZCBvciBpc0F1dG9zdG9wcGVkIClcbiAgICAgICMgWUVTLCBvaywgSSBndWVzcyB3ZSdyZSB2YWxpZFxuICAgICAgQGlzVmFsaWQgPSB0cnVlXG4gICAgICBAc2tpcHBlZCA9IGlmIF8uaXNFbXB0eVN0cmluZyhAYW5zd2VyKSB0aGVuIHRydWUgZWxzZSBmYWxzZVxuICAgIGVsc2VcbiAgICAgICMgTk8sIHNvbWUga2luZCBvZiB2YWxpZGF0aW9uIG11c3Qgb2NjdXIgbm93XG4gICAgICBjdXN0b21WYWxpZGF0aW9uQ29kZSA9IEBtb2RlbC5nZXQoXCJjdXN0b21WYWxpZGF0aW9uQ29kZVwiKVxuICAgICAgQGFuc3dlciA9IFwiXCIgdW5sZXNzIEBhbnN3ZXJcbiAgICAgIGlmIGN1c3RvbVZhbGlkYXRpb25Db2RlPyAmJiBub3QgXy5pc0VtcHR5U3RyaW5nKGN1c3RvbVZhbGlkYXRpb25Db2RlKVxuICAgICAgICB0cnlcbiAgICAgICAgICBAaXNWYWxpZCA9IENvZmZlZVNjcmlwdC5ldmFsLmFwcGx5KEAsIFtjdXN0b21WYWxpZGF0aW9uQ29kZV0pXG4gICAgICAgIGNhdGNoIGVcbiAgICAgICAgICBhbGVydCBcIkN1c3RvbSBWYWxpZGF0aW9uIGVycm9yIGZyb20gY3VzdG9tVmFsaWRhdGlvbkNvZGU6IFwiICsgY3VzdG9tVmFsaWRhdGlvbkNvZGUgKyBcIlxcblxcbiN7ZX1cIlxuICAgICAgZWxzZVxuICAgICAgICBAaXNWYWxpZCA9XG4gICAgICAgICAgc3dpdGNoIEB0eXBlXG4gICAgICAgICAgICB3aGVuIFwib3BlblwiXG4jICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIiBwcm9tcHQ6IFwiICsgQG1vZGVsLmdldChcInByb21wdFwiKSArIFwiIEBuYW1lOiBcIiArIEBuYW1lICsgXCIgQGFuc3dlcjogXCIgKyBAYW5zd2VyKVxuICAgICAgICAgICAgICBpZiBfLmlzRW1wdHlTdHJpbmcoQGFuc3dlcikgfHwgKF8uaXNFbXB0eShAYW5zd2VyKSAmJiBfLmlzT2JqZWN0KEBhbnN3ZXIpKSB0aGVuIGZhbHNlIGVsc2UgdHJ1ZSAjIGRvbid0IHVzZSBpc0VtcHR5IGhlcmVcbiAgICAgICAgICAgIHdoZW4gXCJtdWx0aXBsZVwiXG4gICAgICAgICAgICAgIGlmIH5fLnZhbHVlcyhAYW5zd2VyKS5pbmRleE9mKFwiY2hlY2tlZFwiKSB0aGVuIHRydWUgIGVsc2UgZmFsc2VcbiAgICAgICAgICAgIHdoZW4gXCJzaW5nbGVcIlxuIyAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJAYW5zd2VyOiBcIiArIEBhbnN3ZXIgKyBcIiBfLmlzRW1wdHlTdHJpbmcoQGFuc3dlcilcIiArIF8uaXNFbXB0eVN0cmluZyhAYW5zd2VyKSArIFwiIF8uaXNFbXB0eShAYW5zd2VyKTogXCIgKyBcIiBfLmlzT2JqZWN0KEBhbnN3ZXIpOlwiICsgXy5pc09iamVjdChAYW5zd2VyKSlcbiAgICAgICAgICAgICAgaWYgXy5pc0VtcHR5U3RyaW5nKEBhbnN3ZXIpIHx8IChfLmlzRW1wdHkoQGFuc3dlcikgJiYgXy5pc09iamVjdChAYW5zd2VyKSkgdGhlbiBmYWxzZSBlbHNlIHRydWVcblxuICBzZXRPcHRpb25zOiAob3B0aW9ucykgPT5cbiAgICBAYnV0dG9uLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgQGJ1dHRvbi5yZW5kZXIoKVxuXG4gIHNldEFuc3dlcjogKGFuc3dlcikgPT5cbiAgICBhbGVydCBcInNldEFuc3dlciBFcnJvclxcblRyaWVkIHRvIHNldCAje0B0eXBlfSB0eXBlICN7QG5hbWV9IHF1ZXN0aW9uIHRvIHN0cmluZyBhbnN3ZXIuXCIgaWYgXy5pc1N0cmluZyhhbnN3ZXIpICYmIEB0eXBlID09IFwibXVsdGlwbGVcIlxuICAgIGFsZXJ0IFwic2V0QW5zd2VyIEVycm9yXFxuI3tAbmFtZX0gcXVlc3Rpb24gcmVxdWlyZXMgYW4gb2JqZWN0XCIgaWYgbm90IF8uaXNPYmplY3QoYW5zd2VyKSAmJiBAdHlwZSA9PSBcIm11bHRpcGxlXCJcblxuICAgIGlmIEB0eXBlID09IFwibXVsdGlwbGVcIlxuICAgICAgQGJ1dHRvbi5hbnN3ZXIgPSAkLmV4dGVuZChAYnV0dG9uLmFuc3dlciwgYW5zd2VyKVxuICAgIGVsc2UgaWYgQHR5cGUgPT0gXCJzaW5nbGVcIlxuICAgICAgQGJ1dHRvbi5hbnN3ZXIgPSBhbnN3ZXJcbiAgICBlbHNlXG4gICAgICBAYW5zd2VyID0gYW5zd2VyXG5cbiAgICBAdXBkYXRlVmFsaWRpdHkoKVxuICAgIEBidXR0b24ucmVuZGVyKClcblxuXG4gIHNldE1lc3NhZ2U6IChtZXNzYWdlKSA9PlxuIyAgICBAJGVsLmZpbmQoXCIuZXJyb3JfbWVzc2FnZVwiKS5odG1sIG1lc3NhZ2VcbiAgICAkKFwiLmVycm9yX21lc3NhZ2VcIikuaHRtbCBtZXNzYWdlXG5cbiAgc2V0UHJvbXB0OiAocHJvbXB0KSA9PlxuIyAgICBAJGVsLmZpbmQoXCIucHJvbXB0XCIpLmh0bWwgcHJvbXB0XG4gICAgJChcIi5wcm9tcHRcIikuaHRtbCBwcm9tcHRcblxuICBzZXRIaW50OiAoaGludCkgPT5cbiMgICAgQCRlbC5maW5kKFwiLmhpbnRcIikuaHRtbCBoaW50XG4gICAgJChcIi5oaW50XCIpLmh0bWwgaGludFxuXG4gIHNldE5hbWU6ICggbmV3TmFtZSA9IEBtb2RlbC5nZXQoJ25hbWUnKSApID0+XG4gICAgQG1vZGVsLnNldChcIm5hbWVcIiwgbmV3TmFtZSlcbiAgICBAbmFtZSA9IEBtb2RlbC5lc2NhcGUoXCJuYW1lXCIpLnJlcGxhY2UgL1teQS1aYS16MC05X10vZywgXCItXCJcblxuICBnZXROYW1lOiA9PlxuICAgIEBtb2RlbC5nZXQoXCJuYW1lXCIpXG5cbiAgb25CZWZvcmVSZW5kZXI6IC0+XG4gICAgQCRlbC5hdHRyIFwiaWRcIiwgXCJxdWVzdGlvbi0je0BuYW1lfVwiXG4gICAgaWYgbm90IEBub3RBc2tlZFxuICAgICAgaWYgQHR5cGUgPT0gXCJvcGVuXCJcbiAgICAgICAgQG1vZGVsLnNldCgnaXNPcGVuJywgdHJ1ZSlcbiAgICAgICAgaWYgXy5pc1N0cmluZyhAYW5zd2VyKSAmJiBub3QgXy5pc0VtcHR5KEBhbnN3ZXIpXG4gICAgICAgICAgYW5zd2VyVmFsdWUgPSBAYW5zd2VyXG4gICAgICAgICAgQG1vZGVsLnNldCgnYW5zd2VyVmFsdWUnLCBAYW5zd2VyKVxuICAgICAgICBpZiBAbW9kZWwuZ2V0KFwibXVsdGlsaW5lXCIpXG4gICAgICAgICAgQG1vZGVsLnNldCgnaXNNdWx0aWxpbmUnLCB0cnVlKVxuIyAgICAgIGlmIEB0eXBlID09IFwic2luZ2xlXCIgb3IgQHR5cGUgPT0gXCJtdWx0aXBsZVwiXG4jICAgICAgICBAYnV0dG9uLnNldEVsZW1lbnQoQCRlbC5maW5kKFwiLmJ1dHRvbl9jb250YWluZXJcIikpXG4jICAgICAgICBAYnV0dG9uLm9uIFwicmVuZGVyZWRcIiwgPT4gQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4jICAgICAgICBAYnV0dG9uLnJlbmRlcigpXG4jICAgICAgZWxzZVxuIyAgICAgICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgZWxzZVxuICAgICAgQCRlbC5oaWRlKClcbiMgICAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICBvblJlbmRlcjogLT5cbiMgICAgY29uc29sZS5sb2coXCJvblJlbmRlciBuYW1lOlwiICsgQG1vZGVsLmdldChcIm5hbWVcIikgKyBcIiBhbnN3ZXI6IFwiICsgQG1vZGVsLmdldChcInByb21wdFwiKSlcbiAgICBpZiBAdHlwZSA9PSBcInNpbmdsZVwiIG9yIEB0eXBlID09IFwibXVsdGlwbGVcIlxuICAgICAgQGJ1dHRvbi5zZXRFbGVtZW50IEAkZWwuZmluZCBcIi5idXR0b25fY29udGFpbmVyXCJcbiAgICAgIEBidXR0b24ub24gXCJyZW5kZXJlZFwiLCA9PiBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgICAgIEBidXR0b24ucmVuZGVyKClcblxuICByZW5kZXJOT1Q6IC0+XG4gICAgQCRlbC5hdHRyIFwiaWRcIiwgXCJxdWVzdGlvbi0je0BuYW1lfVwiXG5cbiAgICBpZiBub3QgQG5vdEFza2VkXG5cbiAgICAgIGh0bWwgPSBcIjxkaXYgY2xhc3M9J2Vycm9yX21lc3NhZ2UnPjwvZGl2PjxkaXYgY2xhc3M9J3Byb21wdCcgI3tAZm9udFN0eWxlIHx8IFwiXCJ9PiN7QG1vZGVsLmdldCAncHJvbXB0J308L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2hpbnQnICN7QGZvbnRTdHlsZSB8fCBcIlwifT4jeyhAbW9kZWwuZ2V0KCdoaW50JykgfHwgXCJcIil9PC9kaXY+XCJcblxuICAgICAgaWYgQHR5cGUgPT0gXCJvcGVuXCJcbiAgICAgICAgaWYgXy5pc1N0cmluZyhAYW5zd2VyKSAmJiBub3QgXy5pc0VtcHR5KEBhbnN3ZXIpXG4gICAgICAgICAgYW5zd2VyVmFsdWUgPSBAYW5zd2VyXG4gICAgICAgIGlmIEBtb2RlbC5nZXQoXCJtdWx0aWxpbmVcIilcbiAgICAgICAgICBodG1sICs9IFwiPGRpdj48dGV4dGFyZWEgaWQ9JyN7QGNpZH1fI3tAbmFtZX0nIGRhdGEtY2lkPScje0BjaWR9JyB2YWx1ZT0nI3thbnN3ZXJWYWx1ZSB8fCAnJ30nPjwvdGV4dGFyZWE+PC9kaXY+XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGh0bWwgKz0gXCI8ZGl2PjxpbnB1dCBpZD0nI3tAY2lkfV8je0BuYW1lfScgZGF0YS1jaWQ9JyN7QGNpZH0nIHZhbHVlPScje2Fuc3dlclZhbHVlIHx8ICcnfSc+PC9kaXY+XCJcblxuICAgICAgZWxzZVxuICAgICAgICBodG1sICs9IFwiPGRpdiBjbGFzcz0nYnV0dG9uX2NvbnRhaW5lcic+PC9kaXY+XCJcblxuICAgICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvaWNvbl9zY3JvbGwucG5nJyBjbGFzcz0naWNvbiBhdXRvc2Nyb2xsX2ljb24nIGRhdGEtY2lkPScje0BjaWR9Jz5cIiBpZiBAaXNPYnNlcnZhdGlvblxuICAgICAgQCRlbC5odG1sIGh0bWxcblxuICAgICAgaWYgQHR5cGUgPT0gXCJzaW5nbGVcIiBvciBAdHlwZSA9PSBcIm11bHRpcGxlXCJcbiAgICAgICAgQGJ1dHRvbi5zZXRFbGVtZW50KEAkZWwuZmluZChcIi5idXR0b25fY29udGFpbmVyXCIpKVxuICAgICAgICBAYnV0dG9uLm9uIFwicmVuZGVyZWRcIiwgPT4gQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgICAgIEBidXR0b24ucmVuZGVyKClcbiAgICAgIGVsc2VcbiAgICAgICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgICBlbHNlXG4gICAgICBAJGVsLmhpZGUoKVxuICAgICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgZGVmaW5lU3BlY2lhbENhc2VSZXN1bHRzOiAtPlxuICAgIGxpc3QgPSBbXCJtaXNzaW5nXCIsIFwibm90QXNrZWRcIiwgXCJza2lwcGVkXCIsIFwibG9naWNTa2lwcGVkXCIsIFwibm90QXNrZWRBdXRvc3RvcFwiXVxuICAgIGZvciBlbGVtZW50IGluIGxpc3RcbiAgICAgIGlmIEB0eXBlID09IFwic2luZ2xlXCIgfHwgQHR5cGUgPT0gXCJvcGVuXCJcbiAgICAgICAgQFtlbGVtZW50K1wiUmVzdWx0XCJdID0gZWxlbWVudFxuICAgICAgaWYgQHR5cGUgPT0gXCJtdWx0aXBsZVwiXG4gICAgICAgIEBbZWxlbWVudCtcIlJlc3VsdFwiXSA9IHt9XG4gICAgICAgIEBbZWxlbWVudCtcIlJlc3VsdFwiXVtAb3B0aW9uc1tpXS52YWx1ZV0gPSBlbGVtZW50IGZvciBvcHRpb24sIGkgaW4gQG9wdGlvbnNcbiAgICByZXR1cm5cblxuXG5jbGFzcyBTdXJ2ZXlSZXZpZXdWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJRdWVzdGlvblJldmlld1ZpZXdcIlxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEB2aWV3cyA9IG9wdGlvbnMudmlld3NcblxuICByZW5kZXI6IC0+XG5cbiAgICBhbnN3ZXJzID0gKFwiXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxoMz48L2gzPlxuICAgICAgPC9kaXY+XG5cbiAgICBcIiBmb3IgdmlldyBpbiBAdmlld3MpLmpvaW4oXCJcIilcblxuICAgIEAkZWwuaHRtbCBcIlxuXG4gICAgICA8aDI+UGxlYXNlIHJldmlldyB5b3VyIGFuc3dlcnMgYW5kIHByZXNzIG5leHQgd2hlbiByZWFkeS48L2gyPlxuXG4gICAgICAje2Fuc3dlcnN9XG4gICAgXCJcbiJdfQ==

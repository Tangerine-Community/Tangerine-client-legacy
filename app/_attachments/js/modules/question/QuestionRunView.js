var QuestionRunView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

QuestionRunView = (function(_super) {

  __extends(QuestionRunView, _super);

  function QuestionRunView() {
    this.setMessage = __bind(this.setMessage, this);
    QuestionRunView.__super__.constructor.apply(this, arguments);
  }

  QuestionRunView.prototype.className = "question buttonset";

  QuestionRunView.prototype.events = {
    'change input': 'update',
    'change textarea': 'update',
    'click .autoscroll_icon': 'scroll'
  };

  QuestionRunView.prototype.scroll = function(event) {
    return this.trigger("scroll", event, this.model.get("order"));
  };

  QuestionRunView.prototype.initialize = function(options) {
    this.model = options.model;
    this.answer = {};
    this.name = this.model.escape("name").replace(/[^A-Za-z0-9_]/g, "-");
    this.type = this.model.get("type");
    this.options = this.model.get("options");
    this.notAsked = options.notAsked;
    this.isObservation = options.isObservation;
    this.defineSpecialCaseResults();
    if (this.model.get("skippable") === "true" || this.model.get("skippable") === true) {
      this.isValid = true;
      this.skipped = true;
    } else {
      this.isValid = false;
      this.skipped = false;
    }
    if (this.notAsked === true) {
      this.isValid = true;
      return this.updateResult();
    }
  };

  QuestionRunView.prototype.update = function(event) {
    this.updateResult();
    this.updateValidity();
    return this.trigger("answer", event, this.model.get("order"));
  };

  QuestionRunView.prototype.updateResult = function() {
    var i, option, _len, _len2, _ref, _ref2;
    if (this.type === "open") {
      if (this.notAsked === true) {
        this.answer = "not_asked";
      } else {
        this.answer = this.$el.find("#" + this.cid + "_" + this.name).val();
      }
    } else if (this.type === "single") {
      if (this.notAsked === true) {
        this.answer = "not_asked";
      } else {
        this.answer = this.$el.find("." + this.cid + "_" + this.name + ":checked").val();
      }
    } else if (this.type === "multiple") {
      if (this.notAsked === true) {
        _ref = this.options;
        for (i = 0, _len = _ref.length; i < _len; i++) {
          option = _ref[i];
          this.answer[this.options[i].value] = "not_asked";
        }
      } else {
        _ref2 = this.options;
        for (i = 0, _len2 = _ref2.length; i < _len2; i++) {
          option = _ref2[i];
          this.answer[this.options[i].value] = this.$el.find("#" + this.cid + "_" + this.name + "_" + i).is(":checked") ? "checked" : "unchecked";
        }
      }
    }
    return this.$el.attr("data-result", _.isString(this.answer) ? this.answer : JSON.stringify(this.answer));
  };

  QuestionRunView.prototype.updateValidity = function() {
    if (this.model.get("skippable") === true || $("#question-" + this.name).hasClass("disabled_skipped")) {
      this.isValid = true;
      return this.skipped = _.isEmpty(this.answer) ? true : false;
    } else {
      return this.isValid = _.isEmpty(this.answer) ? false : true;
    }
  };

  QuestionRunView.prototype.setMessage = function(message) {
    return this.$el.find(".error_message").html(message);
  };

  QuestionRunView.prototype.render = function() {
    var checkOrRadio, html, i, option, _len, _ref;
    this.$el.attr("id", "question-" + this.name);
    if (!this.notAsked) {
      html = "<div class='error_message'></div><div class='prompt'>" + (this.model.get('prompt')) + "</div>      <div class='hint'>" + (this.model.get('hint') || "") + "</div>";
      if (this.type === "open") {
        if (this.model.get("multiline")) {
          html += "<div><textarea id='" + this.cid + "_" + this.name + "' data-cid='" + this.cid + "'></textarea></div>";
        } else {
          html += "<div><input id='" + this.cid + "_" + this.name + "' data-cid='" + this.cid + "'></div>";
        }
      } else {
        checkOrRadio = this.type === "multiple" ? "checkbox" : "radio";
        _ref = this.options;
        for (i = 0, _len = _ref.length; i < _len; i++) {
          option = _ref[i];
          html += "            <label for='" + this.cid + "_" + this.name + "_" + i + "'>" + option.label + "</label>            <input id='" + this.cid + "_" + this.name + "_" + i + "' class='" + this.cid + "_" + this.name + "'  data-cid='" + this.cid + "' name='" + this.name + "' value='" + option.value + "' type='" + checkOrRadio + "'>          ";
        }
      }
      if (this.isObservation) {
        html += "<img src='images/icon_scroll.png' class='icon autoscroll_icon' data-cid='" + this.cid + "'>";
      }
      this.$el.html(html);
    } else {
      this.$el.hide();
    }
    return this.trigger("rendered");
  };

  QuestionRunView.prototype.defineSpecialCaseResults = function() {
    var element, i, list, option, _i, _len, _len2, _ref;
    list = ["missing", "notAsked", "skipped", "logicSkipped"];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      element = list[_i];
      if (this.type === "single" || this.type === "open") {
        this[element + "Result"] = element;
      }
      if (this.type === "multiple") {
        this[element + "Result"] = {};
        _ref = this.options;
        for (i = 0, _len2 = _ref.length; i < _len2; i++) {
          option = _ref[i];
          this[element + "Result"][this.options[i].value] = element;
        }
      }
    }
  };

  return QuestionRunView;

})(Backbone.View);

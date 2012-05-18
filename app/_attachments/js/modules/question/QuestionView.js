var QuestionView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

QuestionView = (function(_super) {

  __extends(QuestionView, _super);

  function QuestionView() {
    this.setMessage = __bind(this.setMessage, this);
    QuestionView.__super__.constructor.apply(this, arguments);
  }

  QuestionView.prototype.className = "question";

  QuestionView.prototype.events = {
    'change input': 'update',
    'change textarea': 'update'
  };

  QuestionView.prototype.initialize = function(options) {
    this.model = options.model;
    this.result = {};
    this.name = this.model.get("name");
    this.type = this.model.get("type");
    this.options = this.model.get("options");
    if (this.model.get("skippable") === "true" || this.model.get("skippable") === true) {
      return this.isValid = true;
    } else {
      return this.isValid = false;
    }
  };

  QuestionView.prototype.update = function() {
    this.updateResult();
    return this.updateValidity();
  };

  QuestionView.prototype.updateResult = function() {
    var $input, i, input, inputs, _len, _results;
    if (this.type === "open") {
      return this.result[this.name] = this.$el.find("#" + this.cid + "_" + this.name).val();
    } else {
      inputs = this.$el.find("textarea, input:radio");
      _results = [];
      for (i = 0, _len = inputs.length; i < _len; i++) {
        input = inputs[i];
        $input = $(input);
        _results.push(this.result[this.options[i].value] = $input.is(":checked") ? "checked" : "unchecked");
      }
      return _results;
    }
  };

  QuestionView.prototype.updateValidity = function() {
    if (this.model.has("skippable") === "true" || this.model.get("skippable") === true) {
      return this.isValid = true;
    } else {
      if (_.values(this.result).indexOf("checked") < this.options.length) {
        this.isValid = false;
      }
      return this.isValid = true;
    }
  };

  QuestionView.prototype.setMessage = function(message) {
    return this.$el.find(".error_message").html(message);
  };

  QuestionView.prototype.render = function() {
    var checkOrRadio, html, i, option, _len, _ref;
    html = "<div class='error_message'></div><div class='prompt'>" + (this.model.get('prompt')) + "</div>    <div class='hint'>" + (this.model.get('hint') || "") + "</div>";
    if (this.type === "open") {
      if (this.model.get("multiline")) {
        html += "<div><textarea id='" + this.cid + "_" + this.name + "'></textarea></div>";
      } else {
        html += "<div><input id='" + this.cid + "_" + this.name + "'></div>";
      }
      this.$el.html(html);
    } else {
      checkOrRadio = this.type === "multiple" ? "checkbox" : "radio";
      _ref = this.options;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        option = _ref[i];
        html += "          <label for='" + this.name + "_" + i + "'>" + option.label + "</label>          <input id='" + this.name + "_" + i + "' name='" + this.name + "' value='" + option.value + "' type='" + checkOrRadio + "'>        ";
      }
      this.$el.html(html);
      this.$el.buttonset();
    }
    return this.trigger("rendered");
  };

  return QuestionView;

})(Backbone.View);

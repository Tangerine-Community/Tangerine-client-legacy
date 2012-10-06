var QuestionPrintView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

QuestionPrintView = (function(_super) {

  __extends(QuestionPrintView, _super);

  function QuestionPrintView() {
    QuestionPrintView.__super__.constructor.apply(this, arguments);
  }

  QuestionPrintView.prototype.className = "question buttonset";

  QuestionPrintView.prototype.initialize = function(options) {
    this.model = options.model;
    this.answer = {};
    this.name = this.model.escape("name").replace(/[^A-Za-z0-9_]/g, "-");
    this.type = this.model.get("type");
    this.options = this.model.get("options");
    this.notAsked = options.notAsked;
    this.isObservation = options.isObservation;
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

  QuestionPrintView.prototype.update = function(event) {
    this.updateResult();
    this.updateValidity();
    return this.trigger("answer", event, this.model.get("order"));
  };

  QuestionPrintView.prototype.render = function() {
    this.$el.attr("id", "question-" + this.name);
    if (!this.notAsked) {
      this.$el.html("        Prompt: " + (this.model.get('prompt')) + "<br/>        Variable Name: " + (this.model.get('name')) + "<br/>        Hint: " + (this.model.get('hint')) + "<br/>        Type: " + (this.model.get('type')) + "<br/>        Options:<br/>        " + (_.map(this.model.get('options'), function(option) {
        return "Label: " + option.label + ", Value: " + option.value;
      }).join("<br/>")) + "<br/>      ");
    } else {
      this.$el.hide();
    }
    return this.trigger("rendered");
  };

  return QuestionPrintView;

})(Backbone.View);

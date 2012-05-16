var QuestionView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

QuestionView = (function(_super) {

  __extends(QuestionView, _super);

  function QuestionView() {
    QuestionView.__super__.constructor.apply(this, arguments);
  }

  QuestionView.prototype.className = "question";

  QuestionView.prototype.initialize = function(options) {
    return this.model = options.model;
  };

  QuestionView.prototype.render = function() {
    var checkOrRadio, i, name, option, options, type, _len;
    name = this.model.get("name");
    type = this.model.get("type");
    options = this.model.get("options");
    checkOrRadio = type === "multiple" ? "checkbox" : "radio";
    this.$el.html("<div class='prompt'>" + (this.model.get('prompt')) + "</div>    <div class='hint'>" + (this.model.get('hint') || "") + "</div>");
    if (type === "open") {
      this.$el.append("<div><textarea id='" + name + "' name='" + name + "'></textarea></div>");
    } else {
      for (i = 0, _len = options.length; i < _len; i++) {
        option = options[i];
        this.$el.append("<label for='" + name + "_" + i + "'>" + option.label + "</label><input id='" + name + "_" + i + "' name='" + name + "' value='" + option.value + "' type='" + checkOrRadio + "'>");
        this.$el.buttonset();
      }
    }
    return this.trigger("rendered");
  };

  return QuestionView;

})(Backbone.View);

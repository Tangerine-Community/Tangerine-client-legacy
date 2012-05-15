var PrototypeIdView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

PrototypeIdView = (function(_super) {

  __extends(PrototypeIdView, _super);

  function PrototypeIdView() {
    PrototypeIdView.__super__.constructor.apply(this, arguments);
  }

  PrototypeIdView.prototype.className = "id";

  PrototypeIdView.prototype.events = {
    'click #generate': 'generate',
    'change #student_id': 'setValidator'
  };

  PrototypeIdView.prototype.initialize = function(options) {
    this.model = this.options.model;
    this.parent = this.options.parent;
    return this.validator = new CheckDigit;
  };

  PrototypeIdView.prototype.render = function() {
    this.$el.html("    <form>      <label for='student_id'>Random Identifier</label>      <input id='student_id' name='student_id'>      <button id='generate' class='command'>Generate</button>      <div class='messages'></div>    </form>");
    return this.trigger("rendered");
  };

  PrototypeIdView.prototype.getSum = function() {
    return {
      correct: 1,
      incorrect: 0,
      missing: 0,
      total: 1
    };
  };

  PrototypeIdView.prototype.setValidator = function() {
    return this.validator.set(this.$el.find('#student_id').val());
  };

  PrototypeIdView.prototype.isValid = function() {
    this.setValidator();
    if (!this.validator.isValid()) return false;
    return this.updateNavigation();
  };

  PrototypeIdView.prototype.showErrors = function() {
    return this.$el.find(".messages").html(this.validator.getErrors().join(", "));
  };

  PrototypeIdView.prototype.generate = function() {
    this.$el.find(".messages").empty();
    this.$el.find('#student_id').val(this.validator.generate());
    return false;
  };

  PrototypeIdView.prototype.updateNavigation = function() {
    return Tangerine.nav.setStudent(this.$el.find('#student_id').val());
  };

  return PrototypeIdView;

})(Backbone.View);

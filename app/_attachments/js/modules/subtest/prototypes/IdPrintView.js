var IdPrintView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

IdPrintView = (function(_super) {

  __extends(IdPrintView, _super);

  function IdPrintView() {
    IdPrintView.__super__.constructor.apply(this, arguments);
  }

  IdPrintView.prototype.className = "id";

  IdPrintView.prototype.initialize = function(options) {};

  IdPrintView.prototype.render = function() {
    this.$el.html("      ID    ");
    return this.trigger("rendered");
  };

  return IdPrintView;

})(Backbone.View);

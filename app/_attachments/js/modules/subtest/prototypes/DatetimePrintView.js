var DatetimePrintView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

DatetimePrintView = (function(_super) {

  __extends(DatetimePrintView, _super);

  function DatetimePrintView() {
    DatetimePrintView.__super__.constructor.apply(this, arguments);
  }

  DatetimePrintView.prototype.className = "datetime";

  DatetimePrintView.prototype.initialize = function(options) {
    this.model = this.options.model;
    return this.parent = this.options.parent;
  };

  DatetimePrintView.prototype.render = function() {
    this.$el.html("        DateTime      ");
    return this.trigger("rendered");
  };

  return DatetimePrintView;

})(Backbone.View);

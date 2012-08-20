var KlassToDateMenuView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassToDateMenuView = (function(_super) {

  __extends(KlassToDateMenuView, _super);

  function KlassToDateMenuView() {
    KlassToDateMenuView.__super__.constructor.apply(this, arguments);
  }

  KlassToDateMenuView.prototype.initialize = function(options) {
    return Tangerine.router.navigate("report/classToDate/" + options.parent.options.klass.id, true);
  };

  return KlassToDateMenuView;

})(Backbone.View);

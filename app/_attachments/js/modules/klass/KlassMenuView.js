var KlassMenuView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassMenuView = (function(_super) {

  __extends(KlassMenuView, _super);

  function KlassMenuView() {
    KlassMenuView.__super__.constructor.apply(this, arguments);
  }

  KlassMenuView.prototype.events = {
    'click .registration': 'gotoKlasses'
  };

  KlassMenuView.prototype.gotoKlasses = function() {
    return Tangerine.router.navigate("class", true);
  };

  KlassMenuView.prototype.initialize = function(options) {};

  KlassMenuView.prototype.render = function() {
    this.$el.html("    <h1>Tangerine Class</h1>    <button class='collect command'>Collect</button>    <button class='manage command'>Manage</button>    <button class='reports command'>Reports</button>    <button class='advice command'>Advice</button>    <button class='registration command'>Class Registration</button>        ");
    return this.trigger("rendered");
  };

  return KlassMenuView;

})(Backbone.View);

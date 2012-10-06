var LocationPrintView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

LocationPrintView = (function(_super) {

  __extends(LocationPrintView, _super);

  function LocationPrintView() {
    LocationPrintView.__super__.constructor.apply(this, arguments);
  }

  LocationPrintView.prototype.initialize = function(options) {
    this.model = this.options.model;
    this.parent = this.options.parent;
    this.levels = this.model.get("levels") || [];
    this.locations = this.model.get("locations") || [];
    if (this.levels.length === 1 && this.levels[0] === "") this.levels = [];
    if (this.locations.length === 1 && this.locations[0] === "") {
      return this.locations = [];
    }
  };

  LocationPrintView.prototype.render = function() {
    var schoolListElements;
    schoolListElements = "";
    this.$el.html("      School Locations<br/>      Levels: " + this.levels + "<br/>      Available Locations:<br/>      " + (this.locations.join("<br/>")) + "<br/>    ");
    return this.trigger("rendered");
  };

  return LocationPrintView;

})(Backbone.View);

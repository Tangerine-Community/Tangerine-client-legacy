var LocationEditView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

LocationEditView = (function(_super) {

  __extends(LocationEditView, _super);

  function LocationEditView() {
    LocationEditView.__super__.constructor.apply(this, arguments);
  }

  LocationEditView.prototype.events = {
    'click .level_comma_to_tab': 'levelCommaToTab',
    'click .level_tab_to_comma': 'levelTabToComma',
    'click .location_comma_to_tab': 'locationCommaToTab',
    'click .location_tab_to_comma': 'locationTabToComma'
  };

  LocationEditView.prototype.initialize = function(options) {
    return this.model = options.model;
  };

  LocationEditView.prototype.locationTabToComma = function() {
    return this.$el.find("#location_data").val(String(this.$el.find("#location_data").val()).replace(/\t/g, ","));
  };

  LocationEditView.prototype.locationCommaToTab = function() {
    return this.$el.find("#location_data").val(this.$el.find("#location_data").val().replace(/,/g, "\t"));
  };

  LocationEditView.prototype.levelTabToComma = function() {
    return this.$el.find("#location_levels").val(String(this.$el.find("#location_levels").val()).replace(/\t/g, ","));
  };

  LocationEditView.prototype.levelCommaToTab = function() {
    return this.$el.find("#location_levels").val(this.$el.find("#location_levels").val().replace(/,/g, "\t"));
  };

  LocationEditView.prototype.save = function() {
    var i, level, levels, location, locations, _len, _len2;
    levels = this.$el.find("#location_levels").val().split(",");
    for (i = 0, _len = levels.length; i < _len; i++) {
      level = levels[i];
      levels[i] = $.trim(level);
    }
    console.log("before");
    console.log(locations);
    locations = this.$el.find("#location_data").val().split("\n");
    for (i = 0, _len2 = locations.length; i < _len2; i++) {
      location = locations[i];
      locations[i] = location.split(",");
    }
    console.log("after");
    console.log(locations);
    return this.model.set({
      "levels": levels,
      "locations": locations
    });
  };

  LocationEditView.prototype.render = function() {
    var i, levels, location, locations, _len;
    levels = this.model.get("levels") || [];
    locations = this.model.get("locations") || [];
    levels = levels.join(", ");
    locations = locations.join("\n");
    if (_.isArray(locations)) {
      for (i = 0, _len = locations.length; i < _len; i++) {
        location = locations[i];
        locations[i] = location.join(", ");
      }
    }
    return this.$el.html("      <div class='label_value'>        <label for='location_levels'>Geographic Levels <small>(CSV)</small></label>        <textarea id='location_levels'>" + levels + "</textarea>        <button class='command level_tab_to_comma'>Tabs to Commas</button>        <button class='command level_tab_to_comma'>Commas to tabs</button>      </div>      <div class='label_value'>        <label for='location_data'>Location data <small>(CSV)</small></label>        <textarea id='location_data'>" + locations + "</textarea><br>        <button class='command location_tab_to_comma'>Tabs to Commas</button>        <button class='command location_tab_to_comma'>Commas to tabs</button>      </div>    ");
  };

  return LocationEditView;

})(Backbone.View);

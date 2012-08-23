var Settings,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Settings = (function(_super) {

  __extends(Settings, _super);

  function Settings() {
    Settings.__super__.constructor.apply(this, arguments);
  }

  Settings.prototype.url = "settings";

  Settings.prototype.save = function() {
    Settings.__super__.save.call(this, arguments);
    return Tangerine.settings = this.attributes;
  };

  return Settings;

})(Backbone.Model);

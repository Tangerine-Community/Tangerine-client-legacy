var SettingsView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SettingsView = (function(_super) {

  __extends(SettingsView, _super);

  function SettingsView() {
    SettingsView.__super__.constructor.apply(this, arguments);
  }

  SettingsView.prototype.events = {
    "click .save": "save"
  };

  SettingsView.prototype.initialize = function(options) {
    return this.settings = options.settings;
  };

  SettingsView.prototype.updateModel = function() {
    return this.settings.set({
      context: this.$el.find('#context').val(),
      generalThreshold: parseFloat(this.$el.find('#generalThreshold').val())
    });
  };

  SettingsView.prototype.save = function() {
    this.updateModel();
    if (this.settings.save()) {
      return Utils.midAlert("Settings saved");
    } else {
      return Utils.midAlert("Error. Settings weren't saved");
    }
  };

  SettingsView.prototype.render = function() {
    var context, generalThreshold;
    context = this.settings.escape("context");
    generalThreshold = this.settings.escape("generalThreshold");
    this.$el.html("<h1>" + (t("settings")) + "</h1>    <p>Please be careful with the following settings.</p>    <div class='menu_box'>      <div class='label_value'>        <label for='context'>Context</label>        <input id='context' type='text' value='" + context + "'>      </div>      <div class='label_value'>        <label for='context'>General Threshold</label>        <input id='generalThreshold' type='number' value='" + generalThreshold + "'>      </div>    </div>    <button class='command save'>Save</button>    ");
    return this.trigger("rendered");
  };

  return SettingsView;

})(Backbone.View);

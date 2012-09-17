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
      generalThreshold: parseFloat(this.$el.find('#generalThreshold').val()),
      language: this.$el.find('#language').val()
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
    var context, generalThreshold, language;
    context = this.settings.escape("context");
    generalThreshold = this.settings.escape("generalThreshold");
    language = this.settings.escape("language");
    this.$el.html("<h1>" + (t("settings")) + "</h1>    <p>Please be careful with the following settings.</p>    <div class='menu_box'>      <div class='label_value'>        <label for='context'>Context</label><br>        <input id='context' type='text' value='" + context + "'>      </div>      <div class='label_value'>        <label for='context'>General Threshold</label><br>        <input id='generalThreshold' type='number' value='" + generalThreshold + "'>      </div>      <div class='label_value'>        <label for='context'>Language</label><br>        <input id='language' type='number' value='" + language + "'>      </div>    </div><br>        <button class='command save'>Save</button>    ");
    return this.trigger("rendered");
  };

  return SettingsView;

})(Backbone.View);

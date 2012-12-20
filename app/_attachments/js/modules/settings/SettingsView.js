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
      language: this.$el.find('#language').val(),
      groupName: this.$el.find("#group_name").val(),
      groupHost: this.$el.find("#group_host").val(),
      upPass: this.$el.find("#up_pass").val(),
      log: this.$el.find("#log").val().split(/[\s,]+/)
    });
  };

  SettingsView.prototype.save = function() {
    this.updateModel();
    return this.settings.save({
      success: function() {
        return Utils.midAlert("Settings saved");
      },
      error: function() {
        return Utils.midAlert("Error. Settings weren't saved");
      }
    });
  };

  SettingsView.prototype.render = function() {
    var context, groupHost, groupName, language, log, upPass;
    context = this.settings.escape("context");
    language = this.settings.escape("language");
    groupName = this.settings.escape("groupName");
    groupHost = this.settings.escape("groupHost");
    upPass = this.settings.escape("upPass");
    log = _.escape(this.settings.getArray("log").join(", "));
    this.$el.html("<h1>" + (t("settings")) + "</h1>    <p><img src='images/icon_warn.png' title='Warning'>Please be careful with the following settings.</p>    <div class='menu_box'>      <div class='label_value'>        <label for='context'>Context</label><br>        <input id='context' type='text' value='" + context + "'>      </div>      <div class='label_value'>        <label for='language'>Language code</label><br>        <input id='language' type='text' value='" + language + "'>      </div>      <div class='label_value'>        <label for='group_name'>Group name</label><br>        <input id='group_name' type='text' value='" + groupName + "' disabled='disabled'>      </div>      <div class='label_value'>        <label for='group_host'>Group host</label><br>        <input id='group_host' type='text' value='" + groupHost + "'>      </div>      <div class='label_value'>        <label for='up_pass'>Upload password</label><br>        <input id='up_pass' type='text' value='" + upPass + "'>      </div>      <div class='label_value'>        <label for='context' title='app, ui, db, err'>Log events</label><br>        <input id='language' value='" + log + "'>      </div>    </div><br>        <button class='command save'>Save</button>    ");
    return this.trigger("rendered");
  };

  return SettingsView;

})(Backbone.View);

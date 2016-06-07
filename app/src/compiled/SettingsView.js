var SettingsView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SettingsView = (function(superClass) {
  extend(SettingsView, superClass);

  function SettingsView() {
    return SettingsView.__super__.constructor.apply(this, arguments);
  }

  SettingsView.prototype.className = "SettingsView";

  SettingsView.prototype.events = {
    'click .save': 'save',
    'click .back': 'goBack'
  };

  SettingsView.prototype.goBack = function() {
    return window.history.back();
  };

  SettingsView.prototype.i18n = function() {
    return this.text = {
      save: t("Tangerine.actions.button.save"),
      back: t("Tangerine.navigation.button.back"),
      saved: t("Tangerine.message.saved"),
      saveError: t("Tangerine.message.save_error"),
      settings: t("SettingsView.label.settings"),
      warning: t("SettingsView.message.warning"),
      contextHelp: t("SettingsView.help.context"),
      languageHelp: t("SettingsView.help.language"),
      groupHandleHelp: t("SettingsView.help.group_handle"),
      groupNameHelp: t("SettingsView.help.group_name"),
      groupHostHelp: t("SettingsView.help.group_host"),
      uploadPasswordHelp: t("SettingsView.help.upload_password"),
      logEventsHelp: t("SettingsView.help.log_events"),
      context: t("SettingsView.label.context"),
      language: t("SettingsView.label.language"),
      groupHandle: t("SettingsView.label.group_handle"),
      groupName: t("SettingsView.label.group_name"),
      groupHost: t("SettingsView.label.group_host"),
      uploadPassword: t("SettingsView.label.upload_password"),
      logEvents: t("SettingsView.label.log_events")
    };
  };

  SettingsView.prototype.initialize = function(options) {
    this.i18n();
    return this.settings = Tangerine.settings;
  };

  SettingsView.prototype.save = function() {
    return this.settings.save({
      groupHandle: this.$el.find('#group_handle').val(),
      context: this.$el.find('#context').val(),
      language: this.$el.find('#language').val(),
      groupName: this.$el.find("#group_name").val(),
      groupHost: this.$el.find("#group_host").val(),
      upPass: this.$el.find("#up_pass").val(),
      log: this.$el.find("#log").val().split(/[\s,]+/)
    }, {
      success: (function(_this) {
        return function() {
          return Utils.midAlert(_this.text.saved);
        };
      })(this),
      error: function() {
        return Utils.midAlert(this.text.saveError);
      }
    });
  };

  SettingsView.prototype.render = function() {
    var context, groupHandle, groupHost, groupName, language, log, upPass;
    context = this.settings.getEscapedString("context");
    language = this.settings.getEscapedString("language");
    groupName = this.settings.getEscapedString("groupName");
    groupHandle = this.settings.getEscapedString("groupHandle");
    groupHost = this.settings.getEscapedString("groupHost");
    upPass = this.settings.getEscapedString("upPass");
    log = _.escape(this.settings.getArray("log").join(", "));
    this.$el.html("<button class='back navigation'>" + this.text.back + "</button> <h1>" + this.text.settings + "</h1> <p><img src='images/icon_warn.png' title='Warning'>" + this.text.warning + "</p> <div class='menu_box'> <div class='label_value'> <label for='context' title='" + this.text.contextHelp + "'>" + this.text.context + "</label><br> <input id='context' type='text' value='" + context + "'> </div> <div class='label_value'> <label for='language' title='" + this.text.languageHelp + "'>" + this.text.language + "</label><br> <input id='language' type='text' value='" + language + "'> </div> <div class='label_value'> <label for='group_handle' title='" + this.text.groupHandleHelp + "'>" + this.text.groupHandle + "</label><br> <input id='group_handle' type='text' value='" + groupHandle + "'> </div> <div class='label_value'> <label for='group_name' title='" + this.text.groupNameHelp + "'>" + this.text.groupName + "</label><br> <input id='group_name' type='text' value='" + groupName + "'> </div> <div class='label_value'> <label for='group_host' title='" + this.text.groupHostHelp + "'>" + this.text.groupHost + "</label><br> <input id='group_host' type='text' value='" + groupHost + "'> </div> <div class='label_value'> <label for='up_pass' title='" + this.text.uploadPasswordHelp + "'>" + this.text.uploadPassword + "</label><br> <input id='up_pass' type='text' value='" + upPass + "'> </div> <div class='label_value'> <label for='log' title='" + this.text.logEventsHelp + "'>" + this.text.logEvents + "</label><br> <input id='log' value='" + log + "'> </div> </div><br> <button class='command save'>" + this.text.save + "</button>");
    return this.trigger("rendered");
  };

  return SettingsView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc2V0dGluZ3MvU2V0dGluZ3NWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFlBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7eUJBRUosU0FBQSxHQUFZOzt5QkFFWixNQUFBLEdBQ0U7SUFBQSxhQUFBLEVBQWdCLE1BQWhCO0lBQ0EsYUFBQSxFQUFnQixRQURoQjs7O3lCQUdGLE1BQUEsR0FBUSxTQUFBO1dBQ04sTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFmLENBQUE7RUFETTs7eUJBR1IsSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsSUFBRCxHQUVFO01BQUEsSUFBQSxFQUFPLENBQUEsQ0FBRSwrQkFBRixDQUFQO01BRUEsSUFBQSxFQUFPLENBQUEsQ0FBRSxrQ0FBRixDQUZQO01BSUEsS0FBQSxFQUFRLENBQUEsQ0FBRSx5QkFBRixDQUpSO01BS0EsU0FBQSxFQUFZLENBQUEsQ0FBRSw4QkFBRixDQUxaO01BT0EsUUFBQSxFQUFVLENBQUEsQ0FBRSw2QkFBRixDQVBWO01BU0EsT0FBQSxFQUFTLENBQUEsQ0FBRSw4QkFBRixDQVRUO01BV0EsV0FBQSxFQUFhLENBQUEsQ0FBRSwyQkFBRixDQVhiO01BWUEsWUFBQSxFQUFlLENBQUEsQ0FBRSw0QkFBRixDQVpmO01BYUEsZUFBQSxFQUFrQixDQUFBLENBQUUsZ0NBQUYsQ0FibEI7TUFjQSxhQUFBLEVBQWdCLENBQUEsQ0FBRSw4QkFBRixDQWRoQjtNQWVBLGFBQUEsRUFBZ0IsQ0FBQSxDQUFFLDhCQUFGLENBZmhCO01BZ0JBLGtCQUFBLEVBQXFCLENBQUEsQ0FBRSxtQ0FBRixDQWhCckI7TUFpQkEsYUFBQSxFQUFnQixDQUFBLENBQUUsOEJBQUYsQ0FqQmhCO01BbUJBLE9BQUEsRUFBUyxDQUFBLENBQUUsNEJBQUYsQ0FuQlQ7TUFvQkEsUUFBQSxFQUFVLENBQUEsQ0FBRSw2QkFBRixDQXBCVjtNQXFCQSxXQUFBLEVBQWEsQ0FBQSxDQUFFLGlDQUFGLENB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b2R1bGVzL3NldHRpbmdzL1NldHRpbmdzVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFNldHRpbmdzVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIlNldHRpbmdzVmlld1wiXG5cbiAgZXZlbnRzOiBcbiAgICAnY2xpY2sgLnNhdmUnIDogJ3NhdmUnXG4gICAgJ2NsaWNrIC5iYWNrJyA6ICdnb0JhY2snXG5cbiAgZ29CYWNrOiAtPlxuICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKVxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPSBcblxuICAgICAgc2F2ZSA6IHQoXCJUYW5nZXJpbmUuYWN0aW9ucy5idXR0b24uc2F2ZVwiKVxuICAgICAgICBcbiAgICAgIGJhY2sgOiB0KFwiVGFuZ2VyaW5lLm5hdmlnYXRpb24uYnV0dG9uLmJhY2tcIilcblxuICAgICAgc2F2ZWQgOiB0KFwiVGFuZ2VyaW5lLm1lc3NhZ2Uuc2F2ZWRcIilcbiAgICAgIHNhdmVFcnJvciA6IHQoXCJUYW5nZXJpbmUubWVzc2FnZS5zYXZlX2Vycm9yXCIpXG5cbiAgICAgIHNldHRpbmdzOiB0KFwiU2V0dGluZ3NWaWV3LmxhYmVsLnNldHRpbmdzXCIpXG5cbiAgICAgIHdhcm5pbmc6IHQoXCJTZXR0aW5nc1ZpZXcubWVzc2FnZS53YXJuaW5nXCIpXG5cbiAgICAgIGNvbnRleHRIZWxwOiB0KFwiU2V0dGluZ3NWaWV3LmhlbHAuY29udGV4dFwiKVxuICAgICAgbGFuZ3VhZ2VIZWxwIDogdChcIlNldHRpbmdzVmlldy5oZWxwLmxhbmd1YWdlXCIpXG4gICAgICBncm91cEhhbmRsZUhlbHAgOiB0KFwiU2V0dGluZ3NWaWV3LmhlbHAuZ3JvdXBfaGFuZGxlXCIpXG4gICAgICBncm91cE5hbWVIZWxwIDogdChcIlNldHRpbmdzVmlldy5oZWxwLmdyb3VwX25hbWVcIilcbiAgICAgIGdyb3VwSG9zdEhlbHAgOiB0KFwiU2V0dGluZ3NWaWV3LmhlbHAuZ3JvdXBfaG9zdFwiKVxuICAgICAgdXBsb2FkUGFzc3dvcmRIZWxwIDogdChcIlNldHRpbmdzVmlldy5oZWxwLnVwbG9hZF9wYXNzd29yZFwiKVxuICAgICAgbG9nRXZlbnRzSGVscCA6IHQoXCJTZXR0aW5nc1ZpZXcuaGVscC5sb2dfZXZlbnRzXCIpXG5cbiAgICAgIGNvbnRleHQ6IHQoXCJTZXR0aW5nc1ZpZXcubGFiZWwuY29udGV4dFwiKVxuICAgICAgbGFuZ3VhZ2U6IHQoXCJTZXR0aW5nc1ZpZXcubGFiZWwubGFuZ3VhZ2VcIilcbiAgICAgIGdyb3VwSGFuZGxlOiB0KFwiU2V0dGluZ3NWaWV3LmxhYmVsLmdyb3VwX2hhbmRsZVwiKVxuICAgICAgZ3JvdXBOYW1lOiB0KFwiU2V0dGluZ3NWaWV3LmxhYmVsLmdyb3VwX25hbWVcIilcbiAgICAgIGdyb3VwSG9zdDogdChcIlNldHRpbmdzVmlldy5sYWJlbC5ncm91cF9ob3N0XCIpXG4gICAgICB1cGxvYWRQYXNzd29yZDogdChcIlNldHRpbmdzVmlldy5sYWJlbC51cGxvYWRfcGFzc3dvcmRcIilcbiAgICAgIGxvZ0V2ZW50cyA6IHQoXCJTZXR0aW5nc1ZpZXcubGFiZWwubG9nX2V2ZW50c1wiKVxuICAgICAgXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQGkxOG4oKVxuXG4gICAgQHNldHRpbmdzID0gVGFuZ2VyaW5lLnNldHRpbmdzXG5cbiAgc2F2ZTogLT5cbiAgICBAc2V0dGluZ3Muc2F2ZVxuICAgICAgZ3JvdXBIYW5kbGUgOiBAJGVsLmZpbmQoJyNncm91cF9oYW5kbGUnKS52YWwoKVxuICAgICAgY29udGV4dCAgICAgOiBAJGVsLmZpbmQoJyNjb250ZXh0JykudmFsKClcbiAgICAgIGxhbmd1YWdlICAgIDogQCRlbC5maW5kKCcjbGFuZ3VhZ2UnKS52YWwoKVxuICAgICAgZ3JvdXBOYW1lICAgOiBAJGVsLmZpbmQoXCIjZ3JvdXBfbmFtZVwiKS52YWwoKVxuICAgICAgZ3JvdXBIb3N0ICAgOiBAJGVsLmZpbmQoXCIjZ3JvdXBfaG9zdFwiKS52YWwoKVxuICAgICAgdXBQYXNzICAgICAgOiBAJGVsLmZpbmQoXCIjdXBfcGFzc1wiKS52YWwoKVxuICAgICAgbG9nICAgICAgICAgOiBAJGVsLmZpbmQoXCIjbG9nXCIpLnZhbCgpLnNwbGl0KC9bXFxzLF0rLylcbiAgICAsXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBVdGlscy5taWRBbGVydCBAdGV4dC5zYXZlZFxuICAgICAgZXJyb3I6IC0+XG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IEB0ZXh0LnNhdmVFcnJvclxuXG4gIHJlbmRlcjogLT5cbiAgICBjb250ZXh0ICAgICA9IEBzZXR0aW5ncy5nZXRFc2NhcGVkU3RyaW5nIFwiY29udGV4dFwiXG4gICAgbGFuZ3VhZ2UgICAgPSBAc2V0dGluZ3MuZ2V0RXNjYXBlZFN0cmluZyBcImxhbmd1YWdlXCJcbiAgICBncm91cE5hbWUgICA9IEBzZXR0aW5ncy5nZXRFc2NhcGVkU3RyaW5nIFwiZ3JvdXBOYW1lXCJcbiAgICBncm91cEhhbmRsZSA9IEBzZXR0aW5ncy5nZXRFc2NhcGVkU3RyaW5nIFwiZ3JvdXBIYW5kbGVcIlxuICAgIGdyb3VwSG9zdCAgID0gQHNldHRpbmdzLmdldEVzY2FwZWRTdHJpbmcgXCJncm91cEhvc3RcIlxuICAgIHVwUGFzcyAgICAgID0gQHNldHRpbmdzLmdldEVzY2FwZWRTdHJpbmcgXCJ1cFBhc3NcIlxuICAgIGxvZyAgICAgICAgID0gXy5lc2NhcGUoIEBzZXR0aW5ncy5nZXRBcnJheShcImxvZ1wiKS5qb2luKFwiLCBcIikgKVxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8YnV0dG9uIGNsYXNzPSdiYWNrIG5hdmlnYXRpb24nPiN7QHRleHQuYmFja308L2J1dHRvbj5cbiAgICAgIDxoMT4je0B0ZXh0LnNldHRpbmdzfTwvaDE+XG4gICAgICA8cD48aW1nIHNyYz0naW1hZ2VzL2ljb25fd2Fybi5wbmcnIHRpdGxlPSdXYXJuaW5nJz4je0B0ZXh0Lndhcm5pbmd9PC9wPlxuICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nY29udGV4dCcgdGl0bGU9JyN7QHRleHQuY29udGV4dEhlbHB9Jz4je0B0ZXh0LmNvbnRleHR9PC9sYWJlbD48YnI+XG4gICAgICAgICAgPGlucHV0IGlkPSdjb250ZXh0JyB0eXBlPSd0ZXh0JyB2YWx1ZT0nI3tjb250ZXh0fSc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nbGFuZ3VhZ2UnIHRpdGxlPScje0B0ZXh0Lmxhbmd1YWdlSGVscH0nPiN7QHRleHQubGFuZ3VhZ2V9PC9sYWJlbD48YnI+XG4gICAgICAgICAgPGlucHV0IGlkPSdsYW5ndWFnZScgdHlwZT0ndGV4dCcgdmFsdWU9JyN7bGFuZ3VhZ2V9Jz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdncm91cF9oYW5kbGUnIHRpdGxlPScje0B0ZXh0Lmdyb3VwSGFuZGxlSGVscH0nPiN7QHRleHQuZ3JvdXBIYW5kbGV9PC9sYWJlbD48YnI+XG4gICAgICAgICAgPGlucHV0IGlkPSdncm91cF9oYW5kbGUnIHR5cGU9J3RleHQnIHZhbHVlPScje2dyb3VwSGFuZGxlfSc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nZ3JvdXBfbmFtZScgdGl0bGU9JyN7QHRleHQuZ3JvdXBOYW1lSGVscH0nPiN7QHRleHQuZ3JvdXBOYW1lfTwvbGFiZWw+PGJyPlxuICAgICAgICAgIDxpbnB1dCBpZD0nZ3JvdXBfbmFtZScgdHlwZT0ndGV4dCcgdmFsdWU9JyN7Z3JvdXBOYW1lfSc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nZ3JvdXBfaG9zdCcgdGl0bGU9JyN7QHRleHQuZ3JvdXBIb3N0SGVscH0nPiN7QHRleHQuZ3JvdXBIb3N0fTwvbGFiZWw+PGJyPlxuICAgICAgICAgIDxpbnB1dCBpZD0nZ3JvdXBfaG9zdCcgdHlwZT0ndGV4dCcgdmFsdWU9JyN7Z3JvdXBIb3N0fSc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0ndXBfcGFzcycgdGl0bGU9JyN7QHRleHQudXBsb2FkUGFzc3dvcmRIZWxwfSc+I3tAdGV4dC51cGxvYWRQYXNzd29yZH08L2xhYmVsPjxicj5cbiAgICAgICAgICA8aW5wdXQgaWQ9J3VwX3Bhc3MnIHR5cGU9J3RleHQnIHZhbHVlPScje3VwUGFzc30nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J2xvZycgdGl0bGU9JyN7QHRleHQubG9nRXZlbnRzSGVscH0nPiN7QHRleHQubG9nRXZlbnRzfTwvbGFiZWw+PGJyPlxuICAgICAgICAgIDxpbnB1dCBpZD0nbG9nJyB2YWx1ZT0nI3tsb2d9Jz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj48YnI+XG5cbiAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQgc2F2ZSc+I3tAdGV4dC5zYXZlfTwvYnV0dG9uPlxuICAgIFwiXG4gICAgXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiIl19

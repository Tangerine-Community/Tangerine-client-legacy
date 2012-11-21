var AccountView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AccountView = (function(_super) {

  __extends(AccountView, _super);

  function AccountView() {
    this.renderGroups = __bind(this.renderGroups, this);
    AccountView.__super__.constructor.apply(this, arguments);
  }

  AccountView.prototype.events = {
    'click .leave': 'leaveGroup',
    'click .join_cancel': 'joinToggle',
    'click .join': 'joinToggle',
    'click .join_group': 'join',
    'click .back': 'goBack',
    'click #mode_buttons input': 'changeMode'
  };

  AccountView.prototype.changeMode = function(event) {
    var settings,
      _this = this;
    settings = new Settings({
      "_id": "TangerineSettings"
    });
    return settings.fetch({
      success: function(settingsModel) {
        settingsModel.set({
          "context": $(event.target).val()
        });
        return settingsModel.save();
      }
    });
  };

  AccountView.prototype.goBack = function() {
    return window.history.back();
  };

  AccountView.prototype.joinToggle = function() {
    this.$el.find(".join, .join_confirmation").fadeToggle(0);
    return this.$el.find("#group_name").val("");
  };

  AccountView.prototype.join = function() {
    var group;
    group = this.$el.find("#group_name").val().databaseSafetyDance();
    if (group.length === 0) return;
    this.user.joinGroup(group);
    return this.joinToggle();
  };

  AccountView.prototype.leaveGroup = function(event) {
    var group;
    group = $(event.target).parent().attr('data-group');
    return this.user.leaveGroup(group);
  };

  AccountView.prototype.initialize = function(options) {
    this.user = options.user;
    return this.user.on("group-join group-leave group-refresh", this.renderGroups);
  };

  AccountView.prototype.renderGroups = function() {
    var group, html, _i, _len, _ref;
    html = "<ul>";
    _ref = this.user.get("groups") || [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      html += "<li data-group='" + (_.escape(group)) + "'>" + group + " <button class='command leave'>Leave</button></li>";
    }
    html += "</ul>";
    return this.$el.find("#group_wrapper").html(html);
  };

  AccountView.prototype.render = function() {
    var html;
    html = "      <button class='back navigation'>Back</button>      <h1>Account</h1>      <section>        <div class='label_value'>          <label>Name</label>          <div>" + this.user.name + "</div>        </div>      </section>      <section>        <div class='label_value'>          <label>Groups</label>          <div id='group_wrapper'></div>          <button class='command join'>Join or create a group</button>          <div class='confirmation join_confirmation'>            <div class='menu_box'>              <input id='group_name' placeholder='Group name'>              <div class='small_grey'>Please be specific.<br>              Good examples: malawi_jun_2012, mike_test_group_2012, egra_group_aug-2012<br>              Bad examples: group, test, mine</div><br>              <button class='command join_group'>Join Group</button>              <button class='command join_cancel'>Cancel</button>            </div>          </div>        </section>      </div><br>      <!--button class='command confirmation'>Report a bug</button>      <div class='confirmation' id='bug'>        <label for='where'>What broke?        <input id='where' placeholder='where'>        <label for='where'>What happened?        <input id='where' placeholder='what'>        <label for='where'>What should have happened?        <input id='should' placeholder='should'>        <button>Send</button>      </div-->      ";
    this.$el.html(html);
    this.renderGroups();
    return this.trigger("rendered");
  };

  return AccountView;

})(Backbone.View);

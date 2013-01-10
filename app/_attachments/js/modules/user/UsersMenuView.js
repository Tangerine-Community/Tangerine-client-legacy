var UsersMenuView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

UsersMenuView = (function(_super) {

  __extends(UsersMenuView, _super);

  function UsersMenuView() {
    UsersMenuView.__super__.constructor.apply(this, arguments);
  }

  UsersMenuView.prototype.events = {
    "click .admin": "selectAdmin",
    "click .reader": "selectReader",
    "click #add_admin": "addAdmin",
    "click #remove_admin": "removeAdmin",
    "click #add_reader": "addReader",
    "click #remove_reader": "removeReader"
  };

  UsersMenuView.prototype.selectAdmin = function(event) {
    console.log($(event.target).attr("data-name"));
    return this.$el.find("#selected_admin").val($(event.target).attr("data-name"));
  };

  UsersMenuView.prototype.selectReader = function(event) {
    return this.$el.find("#selected_reader").val($(event.target).attr("data-name"));
  };

  UsersMenuView.prototype.addAdmin = function() {
    var user;
    user = this.$el.find("#selected_admin").val();
    return this.useRobbert("add_admin", user);
  };

  UsersMenuView.prototype.removeAdmin = function() {
    var user;
    user = this.$el.find("#selected_admin").val();
    return this.useRobbert("remove_admin", user);
  };

  UsersMenuView.prototype.addReader = function() {
    var user;
    user = this.$el.find("#selected_reader").val();
    return this.useRobbert("add_reader", user);
  };

  UsersMenuView.prototype.removeReader = function() {
    var user;
    user = this.$el.find("#selected_reader").val();
    return this.useRobbert("remove_reader", user);
  };

  UsersMenuView.prototype.useRobbert = function(action, user) {
    var _this = this;
    return Utils.passwordPrompt(function(auth_p) {
      return Robbert.request({
        "action": action,
        "user": user,
        "group": _.last(Tangerine.settings.get("groupName").split("group-")),
        "auth_u": Tangerine.user.get("name"),
        "auth_p": auth_p,
        success: function(response) {
          Utils.midAlert(response.message);
          return Tangerine.user.fetch({
            success: function() {
              return _this.render();
            }
          });
        },
        error: function(error) {
          return Utils.midAlert("Error creating group\n\n" + error[1] + "\n" + error[2]);
        }
      });
    });
  };

  UsersMenuView.prototype.initialize = function() {};

  UsersMenuView.prototype.render = function() {
    var admin, adminOptions, admins, html, reader, readerOptions, readers;
    admins = Tangerine.user.dbAdmins;
    readers = Tangerine.user.dbReaders;
    adminOptions = ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = admins.length; _i < _len; _i++) {
        admin = admins[_i];
        _results.push("<li data-name='" + (_.escape(admin)) + "' class='admin icon'>" + (_.escape(admin)) + "</li>");
      }
      return _results;
    })()).join("");
    readerOptions = readers.length > 0 ? ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = readers.length; _i < _len; _i++) {
        reader = readers[_i];
        _results.push("<li data-name='" + (_.escape(reader)) + "' class='reader icon'>" + (_.escape(reader)) + "</li>");
      }
      return _results;
    })()).join("") : "<span class='grey'>No readers yet.</span>";
    html = "      <h1>Users</h1>      <table>      <tr>        <th>Admins</th>        <th>Members</th>      </tr>      <tr>        <td>          <input id='selected_admin'  value=''>          <button id='add_admin' class='command'>+</button>          <button id='remove_admin' class='command'>-</button>        </td>        <td>          <input id='selected_reader' value=''>          <button id='add_reader' class='command'>+</button>          <button id='remove_reader' class='command'>-</button>        </td>      </tr>      <tr>        <td>          <ul id='member_select' multiple='multiple' size='5'>            " + adminOptions + "          </ul>        </td>        <td>          <ul id='reader_select' multiple='multiple' size='5'>            " + readerOptions + "          </ul>        </td>      </tr>    ";
    return this.$el.html(html);
  };

  return UsersMenuView;

})(Backbone.View);

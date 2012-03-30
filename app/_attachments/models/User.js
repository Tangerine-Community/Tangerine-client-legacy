var User,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

User = (function(_super) {

  __extends(User, _super);

  function User() {
    User.__super__.constructor.apply(this, arguments);
  }

  User.prototype.defaults = {
    name: "not logged in",
    roles: []
  };

  User.prototype.initialize = function() {
    this.name = this.defaults.name;
    return this.roles = this.defaults.roles;
  };

  User.prototype.signup = function(name, password) {
    return $.couch.signup({
      name: name
    }, password, {
      success: function() {
        return Utils.okBox("Registration", "New user " + name + " created.</p><p>Welcome to mandarin.");
      },
      error: function() {
        return Utils.okBox("Registration", "Error username " + name + " already taken.</p><p>Please try another name.");
      }
    });
  };

  User.prototype.login = function(name, password) {
    var _this = this;
    return $.couch.login({
      name: name,
      password: password,
      success: function(user) {
        return Utils.okBox("Login", "password accepted");
      },
      error: function(code, error, message) {
        return Utils.okBox("Login failed", message);
      }
    });
  };

  User.prototype.isVerified = function() {
    var result,
      _this = this;
    result = false;
    $.couch.session({
      success: function(resp) {
        result = true;
        _this.name = resp.userCtx.name;
        return _this.roles = resp.userCtx.roles;
      },
      error: function(status, error, reason) {
        return Utils.okBox("Session Error", "User does not appear to be logged in.</p><p>" + error + ":<br>" + reason);
      }
    });
    return result;
  };

  User.prototype.isAdmin = function() {
    return _.indexOf(this.roles, "_admin" !== -1);
  };

  User.prototype.logout = function() {
    return $.couch.logout();
  };

  return User;

})(Backbone.Model);

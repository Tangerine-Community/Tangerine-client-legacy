var User,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

User = (function(_super) {

  __extends(User, _super);

  function User() {
    User.__super__.constructor.apply(this, arguments);
  }

  User.prototype.url = 'user';

  User.prototype["default"] = {
    name: null,
    roles: null,
    groups: ["default"]
  };

  User.prototype.initialize = function() {
    this.name = this["default"].name;
    this.roles = this["default"].roles;
    this.groups = [];
    this.messages = [];
    this.temp = {};
    return this.fetch();
  };

  User.prototype.signup = function(name, pass) {
    var _this = this;
    return $.couch.signup({
      name: name
    }, pass, {
      success: function(a, b, c) {
        if (_this.temp.intent === "login") {
          _this.temp.intent = "retry_login";
          return _this.login(_this.temp.name, _this.temp.pass);
        } else {
          return _this.addMessage("New user " + temp['name'] + " created. Welcome to Tangerine.");
        }
      },
      error: function(status, error, message) {
        if ((_this.temp.intent != null) && _this.temp.intent === "login") {
          return _this.showMessage("Password incorrect, please try again.");
        } else {
          return _this.showMessage("Error username " + _this.temp.name + " already taken. Please try another name.");
        }
      }
    });
  };

  User.prototype.login = function(name, pass) {
    var _this = this;
    this.temp = {
      name: name,
      pass: pass
    };
    return $.couch.login({
      name: this.temp.name,
      password: this.temp.pass,
      success: function(user) {
        var groupName, role, _i, _len, _ref;
        _this.name = _this.temp.name;
        _this.roles = [];
        _this.groups = [];
        _ref = user.roles;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          role = _ref[_i];
          groupName = role.split("group.");
          if ($.isArray(groupName) && groupName.length > 1) {
            _this.groups.push(groupName[1]);
          } else {
            _this.roles.push(role);
          }
        }
        _this.clearAttempt();
        _this.trigger("change:authentication");
        return Tangerine.router.navigate("", true);
      },
      error: function(status, error, message) {
        _this.name = _this["default"].name;
        _this.roles = _this["default"].roles;
        _this.groups = _this["default"].groups;
        if ((_this.temp.intent != null) && _this.temp.intent === "retry_login") {
          return _this.addMessage(message);
        } else {
          _this.temp.intent = "login";
          return _this.signup(_this.temp.name, _this.temp.pass);
        }
      }
    });
  };

  User.prototype.verify = function(callbacks) {
    if (this.name === null) {
      if ((callbacks != null ? callbacks.isUnregistered : void 0) != null) {
        callbacks.isUnregistered();
        return Tangerine.router.navigate("login", true);
      }
    } else {
      if (callbacks != null) {
        if (typeof callbacks.isRegistered === "function") callbacks.isRegistered();
      }
      if (this.isAdmin()) {
        return callbacks != null ? typeof callbacks.isAdmin === "function" ? callbacks.isAdmin() : void 0 : void 0;
      } else {
        return callbacks != null ? typeof callbacks.isUser === "function" ? callbacks.isUser() : void 0 : void 0;
      }
    }
  };

  User.prototype.fetch = function(options) {
    var _this = this;
    return $.couch.session({
      success: function(resp) {
        var groupName, role, _i, _len, _ref;
        if (resp.userCtx.name !== null) {
          _this.id = resp.userCtx.name;
          _this.name = resp.userCtx.name;
          _this.roles = [];
          _this.groups = [];
          _ref = resp.userCtx.roles;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            role = _ref[_i];
            groupName = role.split("group.");
            if ($.isArray(groupName) && groupName.length > 1) {
              _this.groups.push(groupName[1]);
            } else {
              _this.roles.push(role);
            }
          }
          return _this.trigger("change:authentication");
        }
      },
      error: function(status, error, reason) {
        this.trigger("change:authentication");
        throw "" + status + " Session Error\n" + error + "\n" + reason;
      }
    });
  };

  User.prototype.isAdmin = function() {
    return __indexOf.call(this.roles, '_admin') >= 0;
  };

  User.prototype.logout = function() {
    var _this = this;
    return $.couch.logout({
      success: function() {
        $.cookie("AuthSession", null);
        _this.name = _this["default"].name;
        _this.roles = _this["default"].roles;
        _this.groups = _this["default"].groups;
        _this.clear();
        return _this.trigger("change:authentication");
      }
    });
  };

  User.prototype.clearAttempt = function() {
    return this.temp = this["default"].temp;
  };

  User.prototype.addMessage = function(content) {
    return this.set("messages", this.get("messages").push(content));
  };

  User.prototype.showMessage = function(content) {
    return this.set("messages", [content]);
  };

  User.prototype.clearMessages = function(content) {
    return this.set("messages", []);
  };

  return User;

})(Backbone.Model);

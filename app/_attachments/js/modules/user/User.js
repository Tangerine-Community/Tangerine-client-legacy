var User,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

User = (function(_super) {

  __extends(User, _super);

  function User() {
    this.fetch = __bind(this.fetch, this);
    this.sessionRefresh = __bind(this.sessionRefresh, this);
    this.login = __bind(this.login, this);
    User.__super__.constructor.apply(this, arguments);
  }

  User.prototype.url = 'user';

  User.prototype.initialize = function(options) {
    this.roles = [];
    this.dbAdmins = [];
    return this.name = null;
  };

  User.prototype.signup = function(name, pass) {
    var _this = this;
    if (Tangerine.settings.get("context") === "server") {
      return $.ajax({
        url: Tangerine.config.get("robbert"),
        type: "POST",
        dataType: "json",
        data: {
          action: "new_user",
          auth_u: name,
          auth_p: pass
        },
        success: function(data) {
          if (_this.intent === "login") {
            _this.intent = "retry_login";
            return _this.login(name, pass);
          }
        }
      });
    } else {
      return $.couch.signup({
        name: name
      }, pass, {
        success: function(data) {
          if (_this.intent === "login") {
            _this.intent = "retry_login";
            return _this.login(name, pass);
          }
        },
        error: function() {
          _this.intent = "";
          return _this.trigger("pass-error", "Password incorrect");
        }
      });
    }
  };

  User.prototype.login = function(name, pass, callbacks) {
    var _this = this;
    if (callbacks == null) callbacks = {};
    return $.couch.login({
      name: name,
      password: pass,
      success: function(user) {
        _this.intent = "";
        _this.name = name;
        _this.roles = user.roles;
        return _this.fetch({
          success: function() {
            if (typeof callbacks.success === "function") callbacks.success();
            return _this.trigger("login");
          }
        });
      },
      error: function(status, error, message) {
        if (_this.intent === "retry_login") {
          _this.intent = "";
          return _this.trigger("password-error", message);
        } else {
          _this.intent = "login";
          return _this.signup(name, pass);
        }
      }
    });
  };

  User.prototype.sessionRefresh = function(callbacks) {
    var _this = this;
    return $.couch.session({
      success: function(response) {
        if (response.userCtx.name != null) {
          _this.name = response.userCtx.name;
          _this.roles = response.userCtx.roles;
          return _this.fetch({
            success: function() {
              _this.trigger("login");
              return callbacks['success'].apply(_this, arguments);
            }
          });
        } else {
          return callbacks['success'].apply(_this, arguments);
        }
      },
      error: function() {
        return alert("Couch session error.\n\n" + (arguments.join("\n")));
      }
    });
  };

  User.prototype.verify = function(callbacks) {
    if (this.name === null) {
      if ((callbacks != null ? callbacks.isUnregistered : void 0) != null) {
        return callbacks.isUnregistered();
      } else {
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

  User.prototype.isAdmin = function() {
    var _ref;
    return (_ref = this.name, __indexOf.call(this.dbAdmins, _ref) >= 0) || __indexOf.call(this.roles, "_admin") >= 0;
  };

  User.prototype.logout = function() {
    var _this = this;
    return $.couch.logout({
      success: function() {
        $.cookie("AuthSession", null);
        _this.name = null;
        _this.roles = [];
        _this.clear();
        _this.trigger("logout");
        if (Tangerine.settings.context === "server") {
          return window.location = Tangerine.settings.urlIndex("trunk");
        } else {
          return Tangerine.router.navigate("login", true);
        }
      }
    });
  };

  /*
      Saves to the `_users` database
      usage: either `@save("key", "value", options)` or `@save({"key":"value"}, options)`
      @override (Backbone.Model.save)
  */

  User.prototype.save = function(keyObject, valueOptions) {
    var attrs, options,
      _this = this;
    attrs = {};
    if (_.isObject(keyObject)) {
      attrs = $.extend(attrs, keyObject);
      options = valueOptions;
    } else {
      attrs[keyObject] = value;
    }
    return $.couch.userDb(function(db) {
      var _ref;
      db.saveDoc($.extend(_this.attributes, attrs));
      return (_ref = options.success) != null ? _ref.apply(_this, arguments) : void 0;
    });
  };

  /*
      Fetches user's doc from _users, loads into @attributes
  */

  User.prototype.fetch = function(callbacks) {
    var _this = this;
    if (callbacks == null) callbacks = {};
    return $.couch.userDb(function(db) {
      return db.openDoc("org.couchdb.user:" + _this.name, {
        success: function(userDoc) {
          return Tangerine.$db.openDoc("_security", {
            success: function(securityDoc) {
              var _ref, _ref2, _ref3;
              _this.dbAdmins = (securityDoc != null ? (_ref = securityDoc.admins) != null ? _ref.names : void 0 : void 0) || [];
              _this.dbReaders = (securityDoc != null ? (_ref2 = securityDoc.members) != null ? _ref2.names : void 0 : void 0) || [];
              _this.dbReaders = _.filter(_this.dbReaders, function(a) {
                return a.substr(0, 8) !== "uploader";
              });
              _this.set(userDoc);
              if ((_ref3 = callbacks.success) != null) {
                _ref3.apply(_this, arguments);
              }
              return _this.trigger('group-refresh');
            }
          });
        },
        error: function() {
          var _ref;
          return (_ref = callbacks.error) != null ? _ref.apply(_this, arguments) : void 0;
        }
      });
    });
  };

  /*
    
    Groups
  */

  User.prototype.joinGroup = function(group, callback) {
    var _this = this;
    if (callback == null) callback = {};
    return Utils.passwordPrompt(function(auth_p) {
      return Robbert.request({
        action: "new_group",
        group: group,
        auth_u: Tangerine.user.get("name"),
        auth_p: auth_p,
        success: function(response) {
          if (response.status === "success") {
            _this.login(_this.get("name"), auth_p, {
              success: callback
            });
            return _this.trigger("group-join");
          } else {
            return Utils.midAlert(status.message);
          }
        },
        error: function(error) {
          Utils.midAlert("Error creating group\n\n" + error[1] + "\n" + error[2]);
          return _this.fetch({
            success: callback
          });
        }
      });
    });
  };

  User.prototype.leaveGroup = function(group, callback) {
    var _this = this;
    if (callback == null) callback = {};
    return Utils.passwordPrompt(function(auth_p) {
      return Robbert.request({
        action: "remove_group",
        user: _this.get("name"),
        group: group,
        auth_u: Tangerine.user.get("name"),
        auth_p: auth_p,
        success: function(response) {
          var _ref;
          _this.login(_this.get("name"), auth_p, {
            success: callback
          });
          return _this.trigger(("group-leave" === (_ref = response.status) && _ref === "success"));
        },
        error: function(response) {
          return typeof callback.error === "function" ? callback.error(response) : void 0;
        }
      });
    });
  };

  User.prototype.ghostLogin = function(user, pass) {
    return document.location = "http://tangerine.iriscouch.com:5984/uploader/_design/uploader/uploader.html?name=" + user + "&pass=" + pass;
  };

  return User;

})(Backbone.Model);

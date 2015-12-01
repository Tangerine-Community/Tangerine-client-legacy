var User,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

User = (function(superClass) {
  extend(User, superClass);

  function User() {
    this.fetch = bind(this.fetch, this);
    this.sessionRefresh = bind(this.sessionRefresh, this);
    this.login = bind(this.login, this);
    this.signup = bind(this.signup, this);
    return User.__super__.constructor.apply(this, arguments);
  }

  User.prototype.url = 'user';

  User.prototype.initialize = function(options) {
    this.myRoles = [];
    this.dbAdmins = [];
    return this.myName = null;
  };


  /*
    Accessors
   */

  User.prototype.name = function() {
    return this.myName || null;
  };

  User.prototype.roles = function() {
    return this.myRoles || null;
  };

  User.prototype.recentUsers = function() {
    return ($.cookie("recentUsers") || '').split(",");
  };

  User.prototype.signup = function(name, pass) {
    Tangerine.log.app("User-signup", name);
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
        success: (function(_this) {
          return function(data) {
            if (_this.intent === "login") {
              _this.intent = "retry_login";
              return _this.login(name, pass);
            }
          };
        })(this)
      });
    } else {
      return $.couch.signup({
        name: name
      }, pass, {
        success: (function(_this) {
          return function(data) {
            if (_this.intent === "login" && Tangerine.settings.get("context") === "class" && name !== "admin") {
              return $.couch.login({
                name: name,
                password: pass,
                success: function(user) {
                  var view;
                  _this.intent = "";
                  _this.myName = name;
                  _this.myRoles = user.roles;
                  view = new RegisterTeacherView({
                    name: name,
                    pass: pass
                  });
                  vm.show(view);
                  return Tangerine.log.app("User-teacher-register", name);
                }
              });
            } else if (_this.intent === "login") {
              _this.intent = "retry_login";
              return _this.login(name, pass);
            }
          };
        })(this),
        error: (function(_this) {
          return function() {
            _this.intent = "";
            return _this.trigger("pass-error", t("LoginView.message.error_password_incorrect"));
          };
        })(this)
      });
    }
  };

  User.prototype.login = function(name, pass, callbacks) {
    if (callbacks == null) {
      callbacks = {};
    }
    Tangerine.log.app("User-login-attempt", name);
    return $.couch.login({
      name: name,
      password: pass,
      success: (function(_this) {
        return function(user) {
          _this.intent = "";
          _this.myName = name;
          _this.myRoles = user.roles;
          Tangerine.log.app("User-login-success", name);
          return _this.fetch({
            success: function() {
              var recentUsers;
              if (typeof callbacks.success === "function") {
                callbacks.success();
              }
              _this.trigger("login");
              recentUsers = _this.recentUsers().filter(function(a) {
                return !~a.indexOf(_this.name());
              });
              recentUsers.unshift(_this.name());
              if (recentUsers.length >= _this.RECENT_USER_MAX) {
                recentUsers.pop();
              }
              return $.cookie("recentUsers", recentUsers);
            }
          });
        };
      })(this),
      error: (function(_this) {
        return function(status, error, message) {
          if (_this.intent === "retry_login") {
            _this.intent = "";
            _this.trigger("pass-error", t("LoginView.message.error_password_incorrect"));
            return Tangerine.log.app("User-login-fail", name + " password incorrect");
          } else {
            _this.intent = "login";
            return _this.signup(name, pass);
          }
        };
      })(this)
    });
  };

  User.prototype.sessionRefresh = function(callbacks) {
    return $.couch.session({
      success: (function(_this) {
        return function(response) {
          if (response.userCtx.name != null) {
            _this.myName = response.userCtx.name;
            _this.myRoles = response.userCtx.roles;
            return _this.fetch({
              success: function() {
                _this.trigger("login");
                callbacks.success.apply(_this, arguments);
                return Tangerine.log.app("User-login", "Resumed session");
              }
            });
          } else {
            return callbacks.success.apply(_this, arguments);
          }
        };
      })(this),
      error: function() {
        return alert("Couch session error.\n\n" + (arguments.join("\n")));
      }
    });
  };

  User.prototype.verify = function(callbacks) {
    if (this.myName === null) {
      if ((callbacks != null ? callbacks.isUnregistered : void 0) != null) {
        return callbacks.isUnregistered();
      } else {
        return Tangerine.router.navigate("login", true);
      }
    } else {
      if (callbacks != null) {
        if (typeof callbacks.isAuthenticated === "function") {
          callbacks.isAuthenticated();
        }
      }
      if (this.isAdmin()) {
        return callbacks != null ? typeof callbacks.isAdmin === "function" ? callbacks.isAdmin() : void 0 : void 0;
      } else {
        return callbacks != null ? typeof callbacks.isUser === "function" ? callbacks.isUser() : void 0 : void 0;
      }
    }
  };

  User.prototype.isAdmin = function() {
    var ref;
    return (ref = this.myName, indexOf.call(this.dbAdmins, ref) >= 0) || indexOf.call(this.myRoles, "_admin") >= 0;
  };

  User.prototype.logout = function() {
    return $.couch.logout({
      success: (function(_this) {
        return function() {
          $.cookie("AuthSession", null);
          _this.myName = null;
          _this.myRoles = [];
          _this.clear();
          _this.trigger("logout");
          if (Tangerine.settings.get("context") === "server") {
            window.location = Tangerine.settings.urlIndex("trunk");
          } else {
            Tangerine.router.navigate("login", true);
          }
          return Tangerine.log.app("User-logout", "logout");
        };
      })(this)
    });
  };


  /*
    Saves to the `_users` database
    usage: either `@save("key", "value", options)` or `@save({"key":"value"}, options)`
    @override (Backbone.Model.save)
   */

  User.prototype.save = function(keyObject, valueOptions, options) {
    var attrs;
    attrs = {};
    if (_.isObject(keyObject)) {
      attrs = $.extend(attrs, keyObject);
      options = valueOptions;
    } else {
      attrs[keyObject] = value;
    }
    return $.couch.userDb((function(_this) {
      return function(db) {
        return db.saveDoc($.extend(_this.attributes, attrs), {
          success: function() {
            var ref;
            return (ref = options.success) != null ? ref.apply(_this, arguments) : void 0;
          }
        });
      };
    })(this));
  };


  /*
    Fetches user's doc from _users, loads into @attributes
   */

  User.prototype.fetch = function(callbacks) {
    if (callbacks == null) {
      callbacks = {};
    }
    return $.couch.userDb((function(_this) {
      return function(db) {
        return db.openDoc("org.couchdb.user:" + _this.myName, {
          success: function(userDoc) {
            return Tangerine.$db.openDoc("_security", {
              success: function(securityDoc) {
                var ref, ref1, ref2;
                _this.dbAdmins = (securityDoc != null ? (ref = securityDoc.admins) != null ? ref.names : void 0 : void 0) || [];
                _this.dbReaders = (securityDoc != null ? (ref1 = securityDoc.members) != null ? ref1.names : void 0 : void 0) || [];
                _this.dbReaders = _.filter(_this.dbReaders, function(a) {
                  return a.substr(0, 8) !== "uploader";
                });
                _this.set(userDoc);
                if ((ref2 = callbacks.success) != null) {
                  ref2.apply(_this, arguments);
                }
                return _this.trigger('group-refresh');
              }
            });
          },
          error: function() {
            var ref;
            return (ref = callbacks.error) != null ? ref.apply(_this, arguments) : void 0;
          }
        });
      };
    })(this));
  };


  /*
  
  Groups
   */

  User.prototype.joinGroup = function(group, callback) {
    if (callback == null) {
      callback = {};
    }
    Utils.working(true);
    return Utils.passwordPrompt((function(_this) {
      return function(auth_p) {
        return Robbert.request({
          action: "new_group",
          group: group,
          auth_u: Tangerine.user.get("name"),
          auth_p: auth_p,
          success: function(response) {
            Utils.working(false);
            if (response.status === "success") {
              _this.login(_this.get("name"), auth_p, {
                success: callback
              });
              _this.trigger("group-join");
            }
            return Utils.midAlert(response.message);
          },
          error: function(error) {
            Utils.working(false);
            Utils.midAlert("Error creating group\n\n" + error[1] + "\n" + error[2]);
            return _this.fetch({
              success: callback
            });
          }
        });
      };
    })(this));
  };

  User.prototype.leaveGroup = function(group, callback) {
    if (callback == null) {
      callback = {};
    }
    Utils.working(true);
    return Utils.passwordPrompt((function(_this) {
      return function(auth_p) {
        return Robbert.request({
          action: "leave_group",
          user: _this.get("name"),
          group: group,
          auth_u: Tangerine.user.get("name"),
          auth_p: auth_p,
          success: function(response) {
            Utils.working(false);
            _this.login(_this.get("name"), auth_p, {
              success: callback
            });
            if (response.status === "success") {
              _this.trigger("group-leave");
            }
            return Utils.midAlert(response.message);
          },
          error: function(response) {
            Utils.working(false);
            Utils.midAlert(response.message);
            return typeof callback.error === "function" ? callback.error(response) : void 0;
          }
        });
      };
    })(this));
  };

  User.prototype.ghostLogin = function(user, pass) {
    var location;
    Tangerine.log.db("User", "ghostLogin");
    location = encodeURIComponent(window.location.toString());
    return document.location = Tangerine.settings.location.group.url.replace(/\:\/\/.*@/, '://') + ("_ghost/" + user + "/" + pass + "/" + location);
  };

  return User;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvdXNlci9Vc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxJQUFBLElBQUE7RUFBQTs7Ozs7QUFBTTs7Ozs7Ozs7Ozs7aUJBRUosR0FBQSxHQUFLOztpQkFFTCxVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLE9BQUQsR0FBWTtJQUNaLElBQUMsQ0FBQSxRQUFELEdBQVk7V0FDWixJQUFDLENBQUEsTUFBRCxHQUFVO0VBSEE7OztBQUtaOzs7O2lCQUdBLElBQUEsR0FBTyxTQUFBO1dBQUcsSUFBQyxDQUFBLE1BQUQsSUFBWTtFQUFmOztpQkFDUCxLQUFBLEdBQU8sU0FBQTtXQUFHLElBQUMsQ0FBQSxPQUFELElBQVk7RUFBZjs7aUJBQ1AsV0FBQSxHQUFhLFNBQUE7V0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFGLENBQVMsYUFBVCxDQUFBLElBQXlCLEVBQTFCLENBQTZCLENBQUMsS0FBOUIsQ0FBb0MsR0FBcEM7RUFBSDs7aUJBR2IsTUFBQSxHQUFRLFNBQUUsSUFBRixFQUFRLElBQVI7SUFDTixTQUFTLENBQUMsR0FBRyxDQUFDLEdBQWQsQ0FBa0IsYUFBbEIsRUFBaUMsSUFBakM7SUFDQSxJQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBbkIsQ0FBdUIsU0FBdkIsQ0FBQSxLQUFxQyxRQUF4QzthQUNFLENBQUMsQ0FBQyxJQUFGLENBQ0U7UUFBQSxHQUFBLEVBQWMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFqQixDQUFxQixTQUFyQixDQUFkO1FBQ0EsSUFBQSxFQUFjLE1BRGQ7UUFFQSxRQUFBLEVBQWMsTUFGZDtRQUdBLElBQUEsRUFDRTtVQUFBLE1BQUEsRUFBUyxVQUFUO1VBQ0EsTUFBQSxFQUFTLElBRFQ7VUFFQSxNQUFBLEVBQVMsSUFGVDtTQUpGO1FBT0EsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUUsSUFBRjtZQUNQLElBQUcsS0FBQyxDQUFBLE1BQUQsS0FBVyxPQUFkO2NB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LEdBQXZCLEdBQTBCLFFBQTFCO0VBSDNFOzs7O0dBdk9LLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3VzZXIvVXNlci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMgRXZlbnR1YWxseSB3ZSdsbCBtYWtlIEJhY2tib25lLlVzZXIgYmFzZWQgb24gdGhpcy5cbiMgJC5jb3VjaC5zZXNzaW9uIG5lZWRzIHRvIGJlIGFzeW5jOiBmYWxzZVxuY2xhc3MgVXNlciBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cbiAgdXJsOiAndXNlcidcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAbXlSb2xlcyAgPSBbXVxuICAgIEBkYkFkbWlucyA9IFtdXG4gICAgQG15TmFtZSA9IG51bGxcblxuICAjIyNcbiAgICBBY2Nlc3NvcnNcbiAgIyMjXG4gIG5hbWU6ICAtPiBAbXlOYW1lICB8fCBudWxsXG4gIHJvbGVzOiAtPiBAbXlSb2xlcyB8fCBudWxsXG4gIHJlY2VudFVzZXJzOiAtPiAoJC5jb29raWUoXCJyZWNlbnRVc2Vyc1wiKXx8JycpLnNwbGl0KFwiLFwiKVxuXG5cbiAgc2lnbnVwOiAoIG5hbWUsIHBhc3MgKSA9PlxuICAgIFRhbmdlcmluZS5sb2cuYXBwIFwiVXNlci1zaWdudXBcIiwgbmFtZVxuICAgIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpID09IFwic2VydmVyXCJcbiAgICAgICQuYWpheFxuICAgICAgICB1cmwgICAgICAgICA6IFRhbmdlcmluZS5jb25maWcuZ2V0KFwicm9iYmVydFwiKVxuICAgICAgICB0eXBlICAgICAgICA6IFwiUE9TVFwiXG4gICAgICAgIGRhdGFUeXBlICAgIDogXCJqc29uXCJcbiAgICAgICAgZGF0YSA6XG4gICAgICAgICAgYWN0aW9uIDogXCJuZXdfdXNlclwiXG4gICAgICAgICAgYXV0aF91IDogbmFtZVxuICAgICAgICAgIGF1dGhfcCA6IHBhc3NcbiAgICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgICBpZiBAaW50ZW50ID09IFwibG9naW5cIlxuICAgICAgICAgICAgQGludGVudCA9IFwicmV0cnlfbG9naW5cIlxuICAgICAgICAgICAgQGxvZ2luIG5hbWUsIHBhc3NcbiAgICBlbHNlXG4gICAgICAjIHNpZ24gdXAgd2l0aCB1c2VyIGRvY3NcbiAgICAgICQuY291Y2guc2lnbnVwIG5hbWUgOiBuYW1lLCBwYXNzLFxuICAgICAgICBzdWNjZXNzOiAoIGRhdGEgKSA9PlxuXG4gICAgICAgICAgaWYgQGludGVudCA9PSBcImxvZ2luXCIgJiYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgPT0gXCJjbGFzc1wiICYmIG5hbWUgIT0gXCJhZG1pblwiXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIFJlZ2lzdGVyIG5ldyB0ZWFjaGVyIGluIGNsYXNzXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAkLmNvdWNoLmxvZ2luXG4gICAgICAgICAgICAgIG5hbWUgICAgIDogbmFtZVxuICAgICAgICAgICAgICBwYXNzd29yZCA6IHBhc3NcbiAgICAgICAgICAgICAgc3VjY2VzczogKCB1c2VyICkgPT5cbiAgICAgICAgICAgICAgICBAaW50ZW50ID0gXCJcIlxuICAgICAgICAgICAgICAgIEBteU5hbWUgICA9IG5hbWVcbiAgICAgICAgICAgICAgICBAbXlSb2xlcyAgPSB1c2VyLnJvbGVzXG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBSZWdpc3RlclRlYWNoZXJWaWV3XG4gICAgICAgICAgICAgICAgICBuYW1lIDogbmFtZVxuICAgICAgICAgICAgICAgICAgcGFzcyA6IHBhc3NcbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgICAgICAgICAgICBUYW5nZXJpbmUubG9nLmFwcCBcIlVzZXItdGVhY2hlci1yZWdpc3RlclwiLCBuYW1lXG4gICAgICAgICAgZWxzZSBpZiBAaW50ZW50ID09IFwibG9naW5cIlxuICAgICAgICAgICAgIyBtb2JpbGUgbG9naW5cbiAgICAgICAgICAgIEBpbnRlbnQgPSBcInJldHJ5X2xvZ2luXCJcbiAgICAgICAgICAgIEBsb2dpbiBuYW1lLCBwYXNzXG4gICAgICAgIGVycm9yOiA9PlxuICAgICAgICAgIEBpbnRlbnQgPSBcIlwiXG4gICAgICAgICAgQHRyaWdnZXIgXCJwYXNzLWVycm9yXCIsIHQoXCJMb2dpblZpZXcubWVzc2FnZS5lcnJvcl9wYXNzd29yZF9pbmNvcnJlY3RcIilcblxuXG4gIGxvZ2luOiAoIG5hbWUsIHBhc3MsIGNhbGxiYWNrcyA9IHt9KSA9PlxuICAgIFRhbmdlcmluZS5sb2cuYXBwIFwiVXNlci1sb2dpbi1hdHRlbXB0XCIsIG5hbWVcbiAgICAkLmNvdWNoLmxvZ2luXG4gICAgICBuYW1lICAgICA6IG5hbWVcbiAgICAgIHBhc3N3b3JkIDogcGFzc1xuICAgICAgc3VjY2VzczogKCB1c2VyICkgPT5cbiAgICAgICAgQGludGVudCA9IFwiXCJcbiAgICAgICAgQG15TmFtZSAgID0gbmFtZVxuICAgICAgICBAbXlSb2xlcyAgPSB1c2VyLnJvbGVzXG4gICAgICAgIFRhbmdlcmluZS5sb2cuYXBwIFwiVXNlci1sb2dpbi1zdWNjZXNzXCIsIG5hbWVcbiAgICAgICAgQGZldGNoXG4gICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgIGNhbGxiYWNrcy5zdWNjZXNzPygpXG4gICAgICAgICAgICBAdHJpZ2dlciBcImxvZ2luXCJcbiAgICAgICAgICAgIHJlY2VudFVzZXJzID0gQHJlY2VudFVzZXJzKCkuZmlsdGVyKCAoYSkgPT4gIX5hLmluZGV4T2YoQG5hbWUoKSkpXG4gICAgICAgICAgICByZWNlbnRVc2Vycy51bnNoaWZ0KEBuYW1lKCkpXG4gICAgICAgICAgICByZWNlbnRVc2Vycy5wb3AoKSBpZiByZWNlbnRVc2Vycy5sZW5ndGggPj0gQFJFQ0VOVF9VU0VSX01BWFxuICAgICAgICAgICAgJC5jb29raWUoXCJyZWNlbnRVc2Vyc1wiLCByZWNlbnRVc2VycylcblxuICAgICAgZXJyb3I6ICggc3RhdHVzLCBlcnJvciwgbWVzc2FnZSApID0+XG4gICAgICAgIGlmIEBpbnRlbnQgPT0gXCJyZXRyeV9sb2dpblwiXG4gICAgICAgICAgQGludGVudCA9IFwiXCJcbiAgICAgICAgICBAdHJpZ2dlciBcInBhc3MtZXJyb3JcIiwgdChcIkxvZ2luVmlldy5tZXNzYWdlLmVycm9yX3Bhc3N3b3JkX2luY29ycmVjdFwiKVxuICAgICAgICAgIFRhbmdlcmluZS5sb2cuYXBwIFwiVXNlci1sb2dpbi1mYWlsXCIsIG5hbWUgKyBcIiBwYXNzd29yZCBpbmNvcnJlY3RcIlxuICAgICAgICBlbHNlIFxuICAgICAgICAgIEBpbnRlbnQgPSBcImxvZ2luXCJcbiAgICAgICAgICBAc2lnbnVwIG5hbWUsIHBhc3NcblxuICAjIGF0dGVtcHQgdG8gcmVzdG9yZSBhIHVzZXIncyBsb2dpbiBzdGF0ZSBmcm9tIGNvdWNoIHNlc3Npb25cbiAgc2Vzc2lvblJlZnJlc2g6IChjYWxsYmFja3MpID0+XG4gICAgJC5jb3VjaC5zZXNzaW9uXG4gICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+XG4gICAgICAgIGlmIHJlc3BvbnNlLnVzZXJDdHgubmFtZT9cbiAgICAgICAgICBAbXlOYW1lICA9IHJlc3BvbnNlLnVzZXJDdHgubmFtZVxuICAgICAgICAgIEBteVJvbGVzID0gcmVzcG9uc2UudXNlckN0eC5yb2xlc1xuICAgICAgICAgIEBmZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgICAgQHRyaWdnZXIgXCJsb2dpblwiXG4gICAgICAgICAgICAgIGNhbGxiYWNrcy5zdWNjZXNzLmFwcGx5KEAsIGFyZ3VtZW50cylcbiAgICAgICAgICAgICAgVGFuZ2VyaW5lLmxvZy5hcHAgXCJVc2VyLWxvZ2luXCIsIFwiUmVzdW1lZCBzZXNzaW9uXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNhbGxiYWNrcy5zdWNjZXNzLmFwcGx5KEAsIGFyZ3VtZW50cylcbiAgICAgIGVycm9yOiAtPlxuICAgICAgICBhbGVydCBcIkNvdWNoIHNlc3Npb24gZXJyb3IuXFxuXFxuI3thcmd1bWVudHMuam9pbihcIlxcblwiKX1cIlxuXG4gICMgQGNhbGxiYWNrcyBTdXBwb3J0cyBpc0FkbWluLCBpc1VzZXIsIGlzQXV0aGVudGljYXRlZCwgaXNVbnJlZ2lzdGVyZWRcbiAgdmVyaWZ5OiAoIGNhbGxiYWNrcyApIC0+XG4gICAgaWYgQG15TmFtZSA9PSBudWxsXG4gICAgICBpZiBjYWxsYmFja3M/LmlzVW5yZWdpc3RlcmVkP1xuICAgICAgICBjYWxsYmFja3MuaXNVbnJlZ2lzdGVyZWQoKVxuICAgICAgZWxzZVxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwibG9naW5cIiwgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGNhbGxiYWNrcz8uaXNBdXRoZW50aWNhdGVkPygpXG4gICAgICBpZiBAaXNBZG1pbigpXG4gICAgICAgIGNhbGxiYWNrcz8uaXNBZG1pbj8oKVxuICAgICAgZWxzZVxuICAgICAgICBjYWxsYmFja3M/LmlzVXNlcj8oKVxuXG4gIGlzQWRtaW46IC0+IEBteU5hbWUgaW4gQGRiQWRtaW5zIG9yIFwiX2FkbWluXCIgaW4gQG15Um9sZXNcblxuICBsb2dvdXQ6IC0+XG4gICAgJC5jb3VjaC5sb2dvdXRcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICQuY29va2llIFwiQXV0aFNlc3Npb25cIiwgbnVsbFxuICAgICAgICBAbXlOYW1lICA9IG51bGxcbiAgICAgICAgQG15Um9sZXMgPSBbXVxuICAgICAgICBAY2xlYXIoKVxuICAgICAgICBAdHJpZ2dlciBcImxvZ291dFwiXG4gICAgICAgIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpID09IFwic2VydmVyXCJcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsSW5kZXggXCJ0cnVua1wiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwibG9naW5cIiwgdHJ1ZVxuICAgICAgICBUYW5nZXJpbmUubG9nLmFwcCBcIlVzZXItbG9nb3V0XCIsIFwibG9nb3V0XCJcblxuICAjIyNcbiAgICBTYXZlcyB0byB0aGUgYF91c2Vyc2AgZGF0YWJhc2VcbiAgICB1c2FnZTogZWl0aGVyIGBAc2F2ZShcImtleVwiLCBcInZhbHVlXCIsIG9wdGlvbnMpYCBvciBgQHNhdmUoe1wia2V5XCI6XCJ2YWx1ZVwifSwgb3B0aW9ucylgXG4gICAgQG92ZXJyaWRlIChCYWNrYm9uZS5Nb2RlbC5zYXZlKVxuICAjIyNcbiAgc2F2ZTogKGtleU9iamVjdCwgdmFsdWVPcHRpb25zLCBvcHRpb25zICkgLT5cbiAgICBhdHRycyA9IHt9XG4gICAgaWYgXy5pc09iamVjdCBrZXlPYmplY3RcbiAgICAgIGF0dHJzID0gJC5leHRlbmQgYXR0cnMsIGtleU9iamVjdCBcbiAgICAgIG9wdGlvbnMgPSB2YWx1ZU9wdGlvbnNcbiAgICBlbHNlIFxuICAgICAgYXR0cnNba2V5T2JqZWN0XSA9IHZhbHVlXG4gICAgIyBnZXQgdXNlciBEQlxuICAgICQuY291Y2gudXNlckRiIChkYikgPT5cbiAgICAgIGRiLnNhdmVEb2MgJC5leHRlbmQoQGF0dHJpYnV0ZXMsIGF0dHJzKSxcbiAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICBvcHRpb25zLnN1Y2Nlc3M/LmFwcGx5KEAsIGFyZ3VtZW50cylcblxuICAjIyNcbiAgICBGZXRjaGVzIHVzZXIncyBkb2MgZnJvbSBfdXNlcnMsIGxvYWRzIGludG8gQGF0dHJpYnV0ZXNcbiAgIyMjXG4gIGZldGNoOiAoIGNhbGxiYWNrcz17fSApID0+XG4gICAgJC5jb3VjaC51c2VyRGIgKGRiKSA9PlxuICAgICAgZGIub3BlbkRvYyBcIm9yZy5jb3VjaGRiLnVzZXI6I3tAbXlOYW1lfVwiLFxuICAgICAgICBzdWNjZXNzOiAoIHVzZXJEb2MgKSA9PlxuICAgICAgICAgIFRhbmdlcmluZS4kZGIub3BlbkRvYyBcIl9zZWN1cml0eVwiLFxuICAgICAgICAgICAgc3VjY2VzczogKHNlY3VyaXR5RG9jKSA9PlxuICAgICAgICAgICAgICBAZGJBZG1pbnMgID0gc2VjdXJpdHlEb2M/LmFkbWlucz8ubmFtZXMgIHx8IFtdXG4gICAgICAgICAgICAgIEBkYlJlYWRlcnMgPSBzZWN1cml0eURvYz8ubWVtYmVycz8ubmFtZXMgfHwgW11cbiAgICAgICAgICAgICAgQGRiUmVhZGVycyA9IF8uZmlsdGVyKEBkYlJlYWRlcnMsKGEpPT5hLnN1YnN0cigwLCA4KSE9XCJ1cGxvYWRlclwiKVxuICAgICAgICAgICAgICBAc2V0IHVzZXJEb2NcbiAgICAgICAgICAgICAgY2FsbGJhY2tzLnN1Y2Nlc3M/LmFwcGx5KEAsIGFyZ3VtZW50cylcbiAgICAgICAgICAgICAgQHRyaWdnZXIgJ2dyb3VwLXJlZnJlc2gnXG5cbiAgICAgICAgZXJyb3I6ID0+XG4gICAgICAgICAgY2FsbGJhY2tzLmVycm9yPy5hcHBseShALCBhcmd1bWVudHMpXG5cblxuXG4gICMjI1xuICBcbiAgR3JvdXBzXG4gIFxuICAjIyNcblxuICBqb2luR3JvdXA6IChncm91cCwgY2FsbGJhY2sgPSB7fSkgLT5cbiAgICBVdGlscy53b3JraW5nIHRydWVcbiAgICBVdGlscy5wYXNzd29yZFByb21wdCAoYXV0aF9wKSA9PlxuICAgICAgICBSb2JiZXJ0LnJlcXVlc3RcbiAgICAgICAgICBhY3Rpb24gOiBcIm5ld19ncm91cFwiXG4gICAgICAgICAgZ3JvdXAgIDogZ3JvdXBcbiAgICAgICAgICBhdXRoX3UgOiBUYW5nZXJpbmUudXNlci5nZXQoXCJuYW1lXCIpXG4gICAgICAgICAgYXV0aF9wIDogYXV0aF9wXG4gICAgICAgICAgc3VjY2VzcyA6ICggcmVzcG9uc2UgKSA9PlxuICAgICAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICAgICAgIyBAVE9ET1xuICAgICAgICAgICAgIyBXZSBzaG91bGQgbm90IGhhdmUgdG8gbG9nIGJhY2sgaW4gaGVyZS5cbiAgICAgICAgICAgICMgQWZ0ZXIgUm9iYmVydCBjcmVhdGVzIGEgZ3JvdXAsIFRISVMgc2Vzc2lvbiBlbmRzLlxuICAgICAgICAgICAgIyBSb2JiZXJ0IGRvZXMgbm90IGludGVyYWN0IHdpdGggdGhlIHNlc3Npb24uXG4gICAgICAgICAgICBpZiByZXNwb25zZS5zdGF0dXMgPT0gXCJzdWNjZXNzXCJcbiAgICAgICAgICAgICAgQGxvZ2luIEBnZXQoXCJuYW1lXCIpLCBhdXRoX3AsIHN1Y2Nlc3M6Y2FsbGJhY2tcbiAgICAgICAgICAgICAgQHRyaWdnZXIgXCJncm91cC1qb2luXCIgXG5cbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IHJlc3BvbnNlLm1lc3NhZ2VcbiAgICAgICAgICBlcnJvciA6IChlcnJvcikgPT5cbiAgICAgICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiRXJyb3IgY3JlYXRpbmcgZ3JvdXBcXG5cXG4je2Vycm9yWzFdfVxcbiN7ZXJyb3JbMl19XCJcbiAgICAgICAgICAgIEBmZXRjaCBzdWNjZXNzOmNhbGxiYWNrXG5cbiAgbGVhdmVHcm91cDogKGdyb3VwLCBjYWxsYmFjayA9IHt9KSAtPlxuICAgIFV0aWxzLndvcmtpbmcgdHJ1ZVxuICAgIFV0aWxzLnBhc3N3b3JkUHJvbXB0ICggYXV0aF9wICkgPT5cbiAgICAgIFJvYmJlcnQucmVxdWVzdFxuICAgICAgICBhY3Rpb24gOiBcImxlYXZlX2dyb3VwXCIgIyBhdHRlbXB0cyB0byBsZWF2ZSBmaXJzdCwgaWYgbGFzdCBwZXJzb24sIGRlbGV0ZXMgZ3JvdXBcbiAgICAgICAgdXNlciAgIDogQGdldChcIm5hbWVcIilcbiAgICAgICAgZ3JvdXAgIDogZ3JvdXBcbiAgICAgICAgYXV0aF91IDogVGFuZ2VyaW5lLnVzZXIuZ2V0KFwibmFtZVwiKVxuICAgICAgICBhdXRoX3AgOiBhdXRoX3BcbiAgICAgICAgc3VjY2VzcyA6IChyZXNwb25zZSkgPT5cbiAgICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICAgICAgIyBAVE9ET1xuICAgICAgICAgICMgV2Ugc2hvdWxkIG5vdCBoYXZlIHRvIGxvZyBiYWNrIGluIGhlcmUuXG4gICAgICAgICAgIyBBZnRlciBSb2JiZXJ0IGNyZWF0ZXMgYSBncm91cCwgVEhJUyBzZXNzaW9uIGVuZHMuXG4gICAgICAgICAgIyBSb2JiZXJ0IGRvZXMgbm90IGludGVyYWN0IHdpdGggdGhlIHNlc3Npb24uXG4gICAgICAgICAgQGxvZ2luIEBnZXQoXCJuYW1lXCIpLCBhdXRoX3AsIHN1Y2Nlc3M6Y2FsbGJhY2tcblxuICAgICAgICAgIEB0cmlnZ2VyIFwiZ3JvdXAtbGVhdmVcIiBpZiByZXNwb25zZS5zdGF0dXMgPT0gXCJzdWNjZXNzXCJcbiAgICAgICAgICBVdGlscy5taWRBbGVydCByZXNwb25zZS5tZXNzYWdlXG5cbiAgICAgICAgZXJyb3IgOiAocmVzcG9uc2UpID0+XG4gICAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IHJlc3BvbnNlLm1lc3NhZ2VcbiAgICAgICAgICBjYWxsYmFjay5lcnJvcj8oIHJlc3BvbnNlIClcblxuICBnaG9zdExvZ2luOiAodXNlciwgcGFzcykgLT5cbiAgICBUYW5nZXJpbmUubG9nLmRiIFwiVXNlclwiLCBcImdob3N0TG9naW5cIlxuICAgIGxvY2F0aW9uID0gZW5jb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi50b1N0cmluZygpKVxuICAgIGRvY3VtZW50LmxvY2F0aW9uID0gVGFuZ2VyaW5lLnNldHRpbmdzLmxvY2F0aW9uLmdyb3VwLnVybC5yZXBsYWNlKC9cXDpcXC9cXC8uKkAvLCc6Ly8nKStcIl9naG9zdC8je3VzZXJ9LyN7cGFzc30vI3tsb2NhdGlvbn1cIlxuIl19

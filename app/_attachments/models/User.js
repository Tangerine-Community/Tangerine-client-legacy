var User,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

User = (function(_super) {

  __extends(User, _super);

  function User() {
    User.__super__.constructor.apply(this, arguments);
  }

  User.prototype.defaults = {
    name: null,
    roles: null,
    temp: {},
    messages: []
  };

  User.prototype.initialize = function() {
    this.set({
      name: this.defaults.name,
      roles: this.defaults.roles,
      messages: this.defaults.messages
    });
    this.temp = this.defaults.temp;
    return this.verify();
  };

  User.prototype.signup = function(name, pass) {
    var _this = this;
    return $.couch.signup({
      name: name
    }, pass, {
      success: function() {
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
        _this.clearAttempt();
        _this.set({
          name: user.name,
          roles: user.roles
        });
        return Tangerine.router.navigate("assessments", true);
      },
      error: function(status, error, message) {
        if ((_this.temp.intent != null) && _this.temp.intent === "retry_login") {
          return _this.addMessage(message);
        } else {
          _this.temp.intent = "login";
          return _this.signup(_this.temp.name, _this.temp.pass);
        }
      }
    });
  };

  User.prototype.isVerified = function(options) {
    return this.get('name') != null;
  };

  User.prototype.verify = function() {
    var _this = this;
    return $.couch.session({
      success: function(resp) {
        var result;
        if (resp.userCtx.name === null) {
          result = false;
        } else {
          _this.set({
            name: resp.userCtx.name,
            roles: resp.userCtx.roles
          });
          result = true;
        }
        return typeof options !== "undefined" && options !== null ? options.success(resp) : void 0;
      },
      error: function(status, error, reason) {
        console.log(["Session Error", "User does not appear to be logged in. " + error + ":<br>" + reason]);
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  User.prototype.isAdmin = function() {
    return _.indexOf(this.get('roles'), '_admin') !== -1;
  };

  User.prototype.logout = function() {
    var _this = this;
    return $.couch.logout({
      success: function() {
        _this.clear();
        return Tangerine.router.navigate("login", true);
      },
      error: function() {}
    });
  };

  User.prototype.clearAttempt = function() {
    return this.temp = this.defaults.temp;
  };

  User.prototype.addMessage = function(content) {
    var messages;
    messages = this.get("messages");
    messages.push(content);
    return this.set("messages", messages);
  };

  User.prototype.showMessage = function(content) {
    return this.set('messages', [content]);
  };

  User.prototype.save = function() {
    return console.log("User.save not implemented");
  };

  User.prototype.sync = function() {
    return console.log("User.sync not implemented");
  };

  return User;

})(Backbone.Model);

var Session, TabletUser,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Session = (function() {
  function Session() {}

  Session.prototype.set = function(user) {
    return window.localStorage.setItem("user", user);
  };

  Session.prototype.get = function() {
    return window.localStorage.getItem("user");
  };

  Session.prototype["delete"] = function() {
    return window.localStorage.removeItem("user");
  };

  Session.prototype.exists = function() {
    return window.localStorage.getItem("user") !== null;
  };

  return Session;

})();

TabletUser = (function(superClass) {
  extend(TabletUser, superClass);

  function TabletUser() {
    this.signup = bind(this.signup, this);
    return TabletUser.__super__.constructor.apply(this, arguments);
  }

  TabletUser.prototype.url = 'user';

  TabletUser.prototype.RECENT_USER_MAX = 3;

  TabletUser.prototype.initialize = function(options) {
    return this.myRoles = [];
  };


  /*
    Accessors
   */

  TabletUser.prototype.name = function() {
    return this.get("name") || null;
  };

  TabletUser.prototype.roles = function() {
    return this.getArray("roles");
  };

  TabletUser.prototype.isAdmin = function() {
    return indexOf.call(this.roles(), "_admin") >= 0;
  };

  TabletUser.prototype.recentUsers = function() {
    return Tangerine.settings.getArray("recentUsers");
  };


  /*
    Mutators
   */

  TabletUser.prototype.setPassword = function(pass) {
    var hashes, salt;
    if (pass === "") {
      this.trigger("pass-error", "Password cannot be empty");
    }
    hashes = TabletUser.generateHash(pass);
    salt = hashes['salt'];
    pass = hashes['pass'];
    this.set({
      "pass": pass,
      "salt": salt
    });
    return this;
  };

  TabletUser.prototype.setId = function(name) {
    return this.set({
      "_id": TabletUser.calcId(name),
      "name": name
    });
  };


  /*
    Static methods
   */

  TabletUser.calcId = function(name) {
    return "user-" + name;
  };

  TabletUser.generateHash = function(pass, salt) {
    if (salt == null) {
      salt = hex_sha1("" + Math.random());
    }
    pass = hex_sha1(pass + salt);
    return {
      pass: pass,
      salt: salt
    };
  };


  /*
    helpers
   */

  TabletUser.prototype.verifyPassword = function(providedPass) {
    var realHash, salt, testHash;
    salt = this.get("salt");
    realHash = this.get("pass");
    testHash = TabletUser.generateHash(providedPass, salt)['pass'];
    return testHash === realHash;
  };


  /*
    controller type
   */

  TabletUser.prototype.ghostLogin = function(user, pass) {
    var location;
    Tangerine.log.db("User", "ghostLogin");
    location = encodeURIComponent(window.location.toString());
    return document.location = Tangerine.settings.location.group.url.replace(/\:\/\/.*@/, '://') + ("_ghost/" + user + "/" + pass + "/" + location);
  };

  TabletUser.prototype.signup = function(name, pass, attributes, callbacks) {
    if (callbacks == null) {
      callbacks = {};
    }
    this.set({
      "_id": TabletUser.calcId(name)
    });
    return this.fetch({
      success: (function(_this) {
        return function() {
          return _this.trigger("name-error", "User already exists.");
        };
      })(this),
      error: (function(_this) {
        return function() {
          _this.set({
            "name": name
          });
          _this.setPassword(pass);
          return _this.save(attributes, {
            success: function() {
              var view;
              if (Tangerine.settings.get("context") === "class") {
                view = new RegisterTeacherView({
                  name: name,
                  pass: pass
                });
                return vm.show(view);
              } else {
                Tangerine.session.set(_this.id);
                _this.trigger("login");
                return typeof callbacks.success === "function" ? callbacks.success() : void 0;
              }
            }
          });
        };
      })(this)
    });
  };

  TabletUser.prototype.login = function(name, pass, callbacks) {
    if (callbacks == null) {
      callbacks = {};
    }
    if (Tangerine.session.exists()) {
      this.trigger("name-error", "User already logged in");
    }
    if (_.isEmpty(this.attributes) || this.get("name") !== name) {
      this.setId(name);
      return this.fetch({
        success: (function(_this) {
          return function() {
            return _this.attemptLogin(pass, callbacks);
          };
        })(this),
        error: function(a, b) {
          return Utils.midAlert("User does not exist.");
        }
      });
    } else {
      return this.attemptLogin(pass, callbacks);
    }
  };

  TabletUser.prototype.attemptLogin = function(pass, callbacks) {
    var recentUsers;
    if (callbacks == null) {
      callbacks = {};
    }
    if (this.verifyPassword(pass)) {
      Tangerine.session.set(this.id);
      this.trigger("login");
      if (typeof callbacks.success === "function") {
        callbacks.success();
      }
      recentUsers = this.recentUsers().filter((function(_this) {
        return function(a) {
          return !~a.indexOf(_this.name());
        };
      })(this));
      recentUsers.unshift(this.name());
      if (recentUsers.length > this.RECENT_USER_MAX) {
        recentUsers.pop();
      }
      Tangerine.settings.save({
        "recentUsers": recentUsers
      });
      return true;
    } else {
      this.trigger("pass-error", t("LoginView.message.error_password_incorrect"));
      Tangerine.session["delete"]();
      if (typeof callbacks.error === "function") {
        callbacks.error();
      }
      return false;
    }
  };

  TabletUser.prototype.sessionRefresh = function(callbacks) {
    if (Tangerine.session.exists()) {
      this.set({
        "_id": Tangerine.session.get()
      });
      return this.fetch({
        error: function() {
          return typeof callbacks.error === "function" ? callbacks.error() : void 0;
        },
        success: function() {
          return callbacks.success();
        }
      });
    } else {
      return callbacks.success();
    }
  };

  TabletUser.prototype.verify = function(callbacks) {
    if (this.name() === null) {
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

  TabletUser.prototype.logout = function() {
    this.clear();
    Tangerine.session["delete"]();
    Tangerine.router.navigate("login", true);
    return Tangerine.log.app("User-logout", "logout");
  };

  return TabletUser;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvdXNlci9UYWJsZXRVc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLG1CQUFBO0VBQUE7Ozs7O0FBQU07OztvQkFDSixHQUFBLEdBQUssU0FBQyxJQUFEO1dBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFwQixDQUE0QixNQUE1QixFQUFvQyxJQUFwQztFQURHOztvQkFFTCxHQUFBLEdBQUssU0FBQTtXQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBcEIsQ0FBNEIsTUFBNUI7RUFBSDs7b0JBQ0wsU0FBQSxHQUFRLFNBQUE7V0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLFVBQXBCLENBQStCLE1BQS9CO0VBQUg7O29CQUNSLE1BQUEsR0FBUSxTQUFBO1dBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFwQixDQUE0QixNQUE1QixDQUFBLEtBQXVDO0VBQTFDOzs7Ozs7QUFFSjs7Ozs7Ozs7dUJBRUosR0FBQSxHQUFLOzt1QkFFTCxlQUFBLEdBQWlCOzt1QkFFakIsVUFBQSxHQUFZLFNBQUUsT0FBRjtXQUNWLElBQUMsQ0FBQSxPQUFELEdBQVc7RUFERDs7O0FBR1o7Ozs7dUJBR0EsSUFBQSxHQUFhLFNBQUE7V0FBRyxJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUwsQ0FBQSxJQUFnQjtFQUFuQjs7dUJBQ2IsS0FBQSxHQUFhLFNBQUE7V0FBRyxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVY7RUFBSDs7dUJBQ2IsT0FBQSxHQUFhLFNBQUE7V0FBRyxhQUFZLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FBWixFQUFBLFFBQUE7RUFBSDs7dUJBQ2IsV0FBQSxHQUFhLFNBQUE7V0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQW5CLENBQTRCLGFBQTVCO0VBQUg7OztBQUViOzs7O3VCQUdBLFdBQUEsR0FBYSxTQUFFLElBQUY7QUFFWCxRQUFBO0lBQUEsSUFBRyxJQUFBLEtBQVEsRUFBWDtNQUNFLElBQUMsQ0FBQSxPQUFELENB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UUFETCxDQUFQO1FBRUEsT0FBQSxFQUFTLFNBQUE7aUJBQ1AsU0FBUyxDQUFDLE9BQVYsQ0FBQTtRQURPLENBRlQ7T0FERixFQUZGO0tBQUEsTUFBQTthQVFFLFNBQVMsQ0FBQyxPQUFWLENBQUEsRUFSRjs7RUFEYzs7dUJBWWhCLE1BQUEsR0FBUSxTQUFFLFNBQUY7SUFDTixJQUFHLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBQSxLQUFXLElBQWQ7TUFDRSxJQUFHLCtEQUFIO2VBQ0UsU0FBUyxDQUFDLGNBQVYsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBMEIsT0FBMUIsRUFBbUMsSUFBbkMsRUFIRjtPQURGO0tBQUEsTUFBQTs7O1VBTUUsU0FBUyxDQUFFOzs7TUFDWCxJQUFHLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBSDs2RUFDRSxTQUFTLENBQUUsNEJBRGI7T0FBQSxNQUFBOzRFQUdFLFNBQVMsQ0FBRSwyQkFIYjtPQVBGOztFQURNOzt1QkFhUixNQUFBLEdBQVEsU0FBQTtJQUVOLElBQUMsQ0FBQSxLQUFELENBQUE7SUFFQSxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQUQsQ0FBakIsQ0FBQTtJQUVBLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBMEIsT0FBMUIsRUFBbUMsSUFBbkM7V0FFQSxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQWQsQ0FBa0IsYUFBbEIsRUFBaUMsUUFBakM7RUFSTTs7OztHQXZKZSxRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy91c2VyL1RhYmxldFVzZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTZXNzaW9uXG4gIHNldDogKHVzZXIpIC0+XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtIFwidXNlclwiLCB1c2VyXG4gIGdldDogLT4gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtIFwidXNlclwiXG4gIGRlbGV0ZTogLT4gd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtIFwidXNlclwiXG4gIGV4aXN0czogLT4gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidXNlclwiKSAhPSBudWxsXG5cbmNsYXNzIFRhYmxldFVzZXIgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG4gIHVybDogJ3VzZXInXG5cbiAgUkVDRU5UX1VTRVJfTUFYOiAzXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cbiAgICBAbXlSb2xlcyA9IFtdXG5cbiAgIyMjXG4gICAgQWNjZXNzb3JzXG4gICMjI1xuICBuYW1lOiAgICAgICAgLT4gQGdldChcIm5hbWVcIikgfHwgbnVsbFxuICByb2xlczogICAgICAgLT4gQGdldEFycmF5KFwicm9sZXNcIilcbiAgaXNBZG1pbjogICAgIC0+IFwiX2FkbWluXCIgaW4gQHJvbGVzKClcbiAgcmVjZW50VXNlcnM6IC0+IFRhbmdlcmluZS5zZXR0aW5ncy5nZXRBcnJheShcInJlY2VudFVzZXJzXCIpXG5cbiAgIyMjXG4gICAgTXV0YXRvcnNcbiAgIyMjXG4gIHNldFBhc3N3b3JkOiAoIHBhc3MgKSAtPlxuXG4gICAgaWYgcGFzcyBpcyBcIlwiXG4gICAgICBAdHJpZ2dlciBcInBhc3MtZXJyb3JcIiwgXCJQYXNzd29yZCBjYW5ub3QgYmUgZW1wdHlcIlxuXG4gICAgaGFzaGVzID0gVGFibGV0VXNlci5nZW5lcmF0ZUhhc2gocGFzcylcbiAgICBzYWx0ID0gaGFzaGVzWydzYWx0J11cbiAgICBwYXNzID0gaGFzaGVzWydwYXNzJ11cblxuICAgIEBzZXRcbiAgICAgIFwicGFzc1wiIDogcGFzc1xuICAgICAgXCJzYWx0XCIgOiBzYWx0XG5cbiAgICByZXR1cm4gQFxuXG4gIHNldElkIDogKG5hbWUpIC0+IFxuICAgIEBzZXRcbiAgICAgIFwiX2lkXCIgIDogVGFibGV0VXNlci5jYWxjSWQobmFtZSlcbiAgICAgIFwibmFtZVwiIDogbmFtZVxuXG4gICMjI1xuICAgIFN0YXRpYyBtZXRob2RzXG4gICMjI1xuXG4gIEBjYWxjSWQ6IChuYW1lKSAtPiBcInVzZXItI3tuYW1lfVwiXG5cbiAgQGdlbmVyYXRlSGFzaDogKCBwYXNzLCBzYWx0ICkgLT5cbiAgICBzYWx0ID0gaGV4X3NoYTEoXCJcIitNYXRoLnJhbmRvbSgpKSBpZiBub3Qgc2FsdD9cbiAgICBwYXNzID0gaGV4X3NoYTEocGFzcytzYWx0KVxuICAgIHJldHVybiB7XG4gICAgICBwYXNzIDogcGFzc1xuICAgICAgc2FsdCA6IHNhbHRcbiAgICB9XG5cblxuICAjIyNcbiAgICBoZWxwZXJzXG4gICMjI1xuICB2ZXJpZnlQYXNzd29yZDogKCBwcm92aWRlZFBhc3MgKSAtPlxuICAgIHNhbHQgICAgID0gQGdldCBcInNhbHRcIlxuICAgIHJlYWxIYXNoID0gQGdldCBcInBhc3NcIlxuICAgIHRlc3RIYXNoID0gVGFibGV0VXNlci5nZW5lcmF0ZUhhc2goIHByb3ZpZGVkUGFzcywgc2FsdCApWydwYXNzJ11cbiAgICByZXR1cm4gdGVzdEhhc2ggaXMgcmVhbEhhc2hcblxuICAjIyNcbiAgICBjb250cm9sbGVyIHR5cGVcbiAgIyMjXG5cbiAgZ2hvc3RMb2dpbjogKHVzZXIsIHBhc3MpIC0+XG4gICAgVGFuZ2VyaW5lLmxvZy5kYiBcIlVzZXJcIiwgXCJnaG9zdExvZ2luXCJcbiAgICBsb2NhdGlvbiA9IGVuY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24udG9TdHJpbmcoKSlcbiAgICBkb2N1bWVudC5sb2NhdGlvbiA9IFRhbmdlcmluZS5zZXR0aW5ncy5sb2NhdGlvbi5ncm91cC51cmwucmVwbGFjZSgvXFw6XFwvXFwvLipALywnOi8vJykrXCJfZ2hvc3QvI3t1c2VyfS8je3Bhc3N9LyN7bG9jYXRpb259XCJcblxuXG4gIHNpZ251cDogKCBuYW1lLCBwYXNzLCBhdHRyaWJ1dGVzLCBjYWxsYmFja3M9e30gKSA9PlxuICAgIEBzZXQgXCJfaWRcIiA6IFRhYmxldFVzZXIuY2FsY0lkKG5hbWUpXG4gICAgQGZldGNoXG4gICAgICBzdWNjZXNzOiA9PiBAdHJpZ2dlciBcIm5hbWUtZXJyb3JcIiwgXCJVc2VyIGFscmVhZHkgZXhpc3RzLlwiXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgQHNldCBcIm5hbWVcIiA6IG5hbWVcbiAgICAgICAgQHNldFBhc3N3b3JkIHBhc3NcbiAgICAgICAgQHNhdmUgYXR0cmlidXRlcyxcbiAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgaWYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgaXMgXCJjbGFzc1wiXG4gICAgICAgICAgICAgIHZpZXcgPSBuZXcgUmVnaXN0ZXJUZWFjaGVyVmlld1xuICAgICAgICAgICAgICAgIG5hbWUgOiBuYW1lXG4gICAgICAgICAgICAgICAgcGFzcyA6IHBhc3NcbiAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIFRhbmdlcmluZS5zZXNzaW9uLnNldCBAaWRcbiAgICAgICAgICAgICAgQHRyaWdnZXIgXCJsb2dpblwiXG4gICAgICAgICAgICAgIGNhbGxiYWNrcy5zdWNjZXNzPygpXG5cbiAgbG9naW46ICggbmFtZSwgcGFzcywgY2FsbGJhY2tzID0ge30gKSAtPlxuXG4gICAgaWYgVGFuZ2VyaW5lLnNlc3Npb24uZXhpc3RzKClcbiAgICAgIEB0cmlnZ2VyIFwibmFtZS1lcnJvclwiLCBcIlVzZXIgYWxyZWFkeSBsb2dnZWQgaW5cIlxuICAgIFxuICAgIGlmIF8uaXNFbXB0eShAYXR0cmlidXRlcykgb3IgQGdldChcIm5hbWVcIikgaXNudCBuYW1lXG4gICAgICBAc2V0SWQgbmFtZVxuICAgICAgQGZldGNoXG4gICAgICAgIHN1Y2Nlc3MgOiA9PlxuICAgICAgICAgIEBhdHRlbXB0TG9naW4gcGFzcywgY2FsbGJhY2tzXG4gICAgICAgIGVycm9yIDogKGEsIGIpIC0+XG4gICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJVc2VyIGRvZXMgbm90IGV4aXN0LlwiXG4gICAgZWxzZVxuICAgICAgQGF0dGVtcHRMb2dpbiBwYXNzLCBjYWxsYmFja3NcblxuICBhdHRlbXB0TG9naW46ICggcGFzcywgY2FsbGJhY2tzPXt9ICkgLT5cbiAgICBpZiBAdmVyaWZ5UGFzc3dvcmQgcGFzc1xuICAgICAgVGFuZ2VyaW5lLnNlc3Npb24uc2V0IEBpZFxuICAgICAgQHRyaWdnZXIgXCJsb2dpblwiXG4gICAgICBjYWxsYmFja3Muc3VjY2Vzcz8oKVxuICAgICAgXG4gICAgICByZWNlbnRVc2VycyA9IEByZWNlbnRVc2VycygpLmZpbHRlciggKGEpID0+ICF+YS5pbmRleE9mKEBuYW1lKCkpKVxuICAgICAgcmVjZW50VXNlcnMudW5zaGlmdChAbmFtZSgpKVxuICAgICAgcmVjZW50VXNlcnMucG9wKCkgaWYgcmVjZW50VXNlcnMubGVuZ3RoID4gQFJFQ0VOVF9VU0VSX01BWFxuICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLnNhdmUgXCJyZWNlbnRVc2Vyc1wiIDogcmVjZW50VXNlcnNcblxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlXG4gICAgICBAdHJpZ2dlciBcInBhc3MtZXJyb3JcIiwgdChcIkxvZ2luVmlldy5tZXNzYWdlLmVycm9yX3Bhc3N3b3JkX2luY29ycmVjdFwiKVxuICAgICAgVGFuZ2VyaW5lLnNlc3Npb24uZGVsZXRlKClcbiAgICAgIGNhbGxiYWNrcy5lcnJvcj8oKVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgc2Vzc2lvblJlZnJlc2g6IChjYWxsYmFja3MpIC0+XG4gICAgaWYgVGFuZ2VyaW5lLnNlc3Npb24uZXhpc3RzKClcbiAgICAgIEBzZXQgXCJfaWRcIjogVGFuZ2VyaW5lLnNlc3Npb24uZ2V0KClcbiAgICAgIEBmZXRjaFxuICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICBjYWxsYmFja3MuZXJyb3I/KClcbiAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICBjYWxsYmFja3Muc3VjY2VzcygpXG4gICAgZWxzZVxuICAgICAgY2FsbGJhY2tzLnN1Y2Nlc3MoKVxuXG4gICMgQGNhbGxiYWNrcyBTdXBwb3J0cyBpc0FkbWluLCBpc1VzZXIsIGlzQXV0aGVudGljYXRlZCwgaXNVbnJlZ2lzdGVyZWRcbiAgdmVyaWZ5OiAoIGNhbGxiYWNrcyApIC0+XG4gICAgaWYgQG5hbWUoKSA9PSBudWxsXG4gICAgICBpZiBjYWxsYmFja3M/LmlzVW5yZWdpc3RlcmVkP1xuICAgICAgICBjYWxsYmFja3MuaXNVbnJlZ2lzdGVyZWQoKVxuICAgICAgZWxzZVxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwibG9naW5cIiwgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGNhbGxiYWNrcz8uaXNBdXRoZW50aWNhdGVkPygpXG4gICAgICBpZiBAaXNBZG1pbigpXG4gICAgICAgIGNhbGxiYWNrcz8uaXNBZG1pbj8oKVxuICAgICAgZWxzZVxuICAgICAgICBjYWxsYmFja3M/LmlzVXNlcj8oKVxuXG4gIGxvZ291dDogLT5cblxuICAgIEBjbGVhcigpXG5cbiAgICBUYW5nZXJpbmUuc2Vzc2lvbi5kZWxldGUoKVxuXG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImxvZ2luXCIsIHRydWVcblxuICAgIFRhbmdlcmluZS5sb2cuYXBwIFwiVXNlci1sb2dvdXRcIiwgXCJsb2dvdXRcIiJdfQ==

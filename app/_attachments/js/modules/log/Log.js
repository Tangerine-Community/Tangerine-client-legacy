var Log, LogView, Logs,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Log = (function(_super) {

  __extends(Log, _super);

  function Log() {
    Log.__super__.constructor.apply(this, arguments);
  }

  Log.prototype.url = "log";

  Log.prototype.initialize = function() {
    return this.ensure();
  };

  Log.prototype.app = function(code, details) {
    var _this = this;
    if (code == null) code = "";
    if (details == null) details = "";
    if (~Tangerine.settings.get("log").indexOf("app")) {
      return this.ensure(function() {
        return Tangerine.log.add({
          "type": "app",
          "code": code,
          "details": details,
          "timestamp": (new Date()).getTime()
        });
      });
    }
  };

  Log.prototype.db = function(code, details) {
    var _this = this;
    if (code == null) code = "";
    if (details == null) details = "";
    if (~Tangerine.settings.get("log").indexOf("db")) {
      return this.ensure(function() {
        return Tangerine.log.add({
          "type": "db",
          "code": code,
          "details": details,
          "timestamp": (new Date()).getTime()
        });
      });
    }
  };

  Log.prototype.ui = function(code, details) {
    var _this = this;
    if (code == null) code = "";
    if (details == null) details = "";
    if (~Tangerine.settings.get("log").indexOf("ui")) {
      return this.ensure(function() {
        return Tangerine.log.add({
          "type": "ui",
          "code": code,
          "details": details,
          "timestamp": (new Date()).getTime()
        });
      });
    }
  };

  Log.prototype.err = function(code, details) {
    var _this = this;
    if (code == null) code = "";
    if (details == null) details = "";
    if (~Tangerine.settings.get("log").indexOf("err")) {
      return this.ensure(function() {
        return Tangerine.log.add({
          "type": "err",
          "code": code,
          "details": details,
          "timestamp": (new Date()).getTime()
        });
      });
    }
  };

  Log.prototype.ensure = function(callback) {
    var desiredId,
      _this = this;
    if (callback == null) callback = {};
    desiredId = this.calcFileName();
    if (!(Tangerine.log != null)) {
      Tangerine.log = this;
      Tangerine.log.set({
        "_id": desiredId
      });
      return Tangerine.log.fetch({
        success: function(model, response, options) {
          return typeof callback === "function" ? callback() : void 0;
        },
        error: function(model, xhr, options) {
          return _this.save({
            success: function() {
              return typeof callback === "function" ? callback() : void 0;
            }
          });
        }
      });
    } else {
      if (Tangerine.log.id === desiredId) {
        return typeof callback === "function" ? callback() : void 0;
      } else {
        Tangerine.log = this;
        return typeof callback === "function" ? callback() : void 0;
      }
    }
  };

  Log.prototype.add = function(logEvent) {
    var d, logEvents;
    d = new Date();
    if (!this.has("year")) this.set("year", d.getFullYear());
    if (!this.has("month")) this.set("month", d.getMonth());
    if (!this.has("date")) this.set("date", d.getDate());
    if (!this.has("user")) this.set("user", Tangerine.user.name);
    logEvents = this.getArray("logEvents");
    logEvents.push(logEvent);
    this.set("logEvents", logEvents);
    return this.save();
  };

  Log.prototype.calcFileName = function() {
    var d, user;
    d = new Date();
    user = Tangerine.user.name != null ? Tangerine.user.name : "not-signed-in";
    return hex_sha1("" + user + "_" + (d.getFullYear()) + "-" + (d.getMonth()) + "-" + (d.getDate()));
  };

  return Log;

})(Backbone.Model);

Logs = (function(_super) {

  __extends(Logs, _super);

  function Logs() {
    Logs.__super__.constructor.apply(this, arguments);
  }

  Logs.prototype.url = "log";

  Logs.prototype.model = Log;

  Logs.prototype.comparator = function(model) {
    return model.get("timestamp");
  };

  return Logs;

})(Backbone.Collection);

LogView = (function(_super) {

  __extends(LogView, _super);

  function LogView() {
    LogView.__super__.constructor.apply(this, arguments);
  }

  LogView.prototype.initialize = function(options) {
    return this.logs = options.logs.models;
  };

  LogView.prototype.render = function() {
    var html, k, log, oneEvent, v, _i, _j, _len, _len2, _ref, _ref2, _ref3;
    html = "";
    _ref = this.logs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      log = _ref[_i];
      _ref2 = log.attributes;
      for (k in _ref2) {
        v = _ref2[k];
        if (k === "_rev" || k === "_id" || k === "collection" || k === "hash" || k === "updated" || k === "logEvents") {
          continue;
        }
        html += "<b>" + k + "</b> " + v + "<br><br>";
      }
      _ref3 = log.attributes.logEvents;
      for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
        oneEvent = _ref3[_j];
        for (k in oneEvent) {
          v = oneEvent[k];
          if (k === "timestamp") v = (new Date(parseInt(v))).toString();
          html += "<b>" + k + "</b> " + v + "<br>";
        }
        html += "<br>";
      }
    }
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return LogView;

})(Backbone.View);

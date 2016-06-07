var Log, LogView, Logs,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Log = (function(superClass) {
  extend(Log, superClass);

  function Log() {
    return Log.__super__.constructor.apply(this, arguments);
  }

  Log.prototype.url = "log";

  Log.prototype.app = function(code, details) {
    if (code == null) {
      code = "";
    }
    if (details == null) {
      details = "";
    }
    if (!~Tangerine.settings.get("log").indexOf("app")) {
      return;
    }
    return this.add({
      "type": "app",
      "code": code,
      "details": details,
      "timestamp": (new Date()).getTime()
    });
  };

  Log.prototype.db = function(code, details) {
    if (code == null) {
      code = "";
    }
    if (details == null) {
      details = "";
    }
    if (!~Tangerine.settings.get("log").indexOf("db")) {
      return;
    }
    return this.add({
      "type": "db",
      "code": code,
      "details": details,
      "timestamp": (new Date()).getTime()
    });
  };

  Log.prototype.ui = function(code, details) {
    if (code == null) {
      code = "";
    }
    if (details == null) {
      details = "";
    }
    if (!~Tangerine.settings.get("log").indexOf("ui")) {
      return;
    }
    return this.add({
      "type": "ui",
      "code": code,
      "details": details,
      "timestamp": (new Date()).getTime()
    });
  };

  Log.prototype.err = function(code, details) {
    if (code == null) {
      code = "";
    }
    if (details == null) {
      details = "";
    }
    return !~Tangerine.settings.get("log").indexOf("err");
    return this.add({
      "type": "err",
      "code": code,
      "details": details,
      "timestamp": (new Date()).getTime()
    });
  };

  Log.prototype.add = function(logEvent) {
    var d, name;
    d = new Date();
    name = "not-signed-in";
    if (Tangerine.user.name() != null) {
      name = Tangerine.user.name();
    }
    this.unset("_rev");
    return this.save({
      "_id": this.calcName(),
      "year": d.getFullYear(),
      "month": d.getMonth(),
      "date": d.getDate(),
      "timestamp": d.getTime(),
      "user": name,
      "event": logEvent
    });
  };

  Log.prototype.calcName = function() {
    var d, user;
    d = new Date();
    user = "not-signed-in";
    if (Tangerine.user.name() != null) {
      user = Tangerine.user.name();
    }
    return hex_sha1(user + "_" + (d.getTime()));
  };

  return Log;

})(Backbone.Model);

Logs = (function(superClass) {
  extend(Logs, superClass);

  function Logs() {
    return Logs.__super__.constructor.apply(this, arguments);
  }

  Logs.prototype.url = "log";

  Logs.prototype.model = Log;

  Logs.prototype.pouch = {
    viewOptions: {
      key: 'log'
    }
  };

  Logs.prototype.comparator = function(model) {
    return model.get("timestamp");
  };

  return Logs;

})(Backbone.Collection);

LogView = (function(superClass) {
  extend(LogView, superClass);

  function LogView() {
    this.render = bind(this.render, this);
    return LogView.__super__.constructor.apply(this, arguments);
  }

  LogView.prototype.className = "LogView";

  LogView.prototype.events = {
    "change #user_selector": "update"
  };

  LogView.prototype.initialize = function(options) {
    this.logs = options.logs;
    this.logsByUser = this.logs.indexBy("user");
    return this.selectedUser = _.first(_.keys(this.logsByUser));
  };

  LogView.prototype.render = function() {
    var htmlOptions, user;
    htmlOptions = ((function() {
      var i, len, ref, results;
      ref = _.keys(this.logsByUser);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        user = ref[i];
        results.push("<option data-user='" + user + "' " + ((this.selectedUser === user ? "selected='selected'" : void 0) || "") + ">" + user + "</option>");
      }
      return results;
    }).call(this)).join("");
    this.$el.html("<h1>Logs</h1> <select id='user_selector'>" + htmlOptions + "</select> <div class='log_container'></div>");
    this.update();
    return this.trigger("rendered");
  };

  LogView.prototype.update = function() {
    var code, details, ev, htmlTable, i, len, log, logs, name, time;
    this.selectedUser = this.$el.find("#user_selector option:selected").attr("data-user");
    logs = this.logsByUser[this.selectedUser];
    htmlTable = "<h2>User " + this.selectedUser + "</h2> <table> <tr> <th>Code</th> <th>Details</th> <th>Time</th> </tr>";
    for (i = 0, len = logs.length; i < len; i++) {
      log = logs[i];
      if (log.get("event") == null) {
        return;
      }
      ev = log.get("event");
      name = log.get("user");
      code = ev.code;
      details = ev.details;
      time = (new Date(parseInt(ev.timestamp))).toString();
      htmlTable += "<tr> <td>" + code + "</td> <td>" + details + "</td> <td>" + time + "</td> </tr>";
    }
    htmlTable += "</table>";
    return this.$el.find(".log_container").html(htmlTable);
  };

  return LogView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvbG9nL0xvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxrQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Z0JBRUosR0FBQSxHQUFLOztnQkFPTCxHQUFBLEdBQUssU0FBRSxJQUFGLEVBQWEsT0FBYjs7TUFBRSxPQUFPOzs7TUFBSSxVQUFVOztJQUMxQixJQUFVLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQW5CLENBQXVCLEtBQXZCLENBQTZCLENBQUMsT0FBOUIsQ0FBc0MsS0FBdEMsQ0FBWjtBQUFBLGFBQUE7O1dBQ0EsSUFBQyxDQUFBLEdBQUQsQ0FDRTtNQUFBLE1BQUEsRUFBYyxLQUFkO01BQ0EsTUFBQSxFQUFjLElBRGQ7TUFFQSxTQUFBLEVBQWMsT0FGZDtNQUdBLFdBQUEsRUFBYyxDQUFLLElBQUEsSUFBQSxDQUFBLENBQUwsQ0FBWSxDQUFDLE9BQWIsQ0FBQSxDQUhkO0tBREY7RUFGRzs7Z0JBU0wsRUFBQSxHQUFJLFNBQUUsSUFBRixFQUFhLE9BQWI7O01BQUUsT0FBTzs7O01BQUksVUFBVTs7SUFDekIsSUFBVSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFuQixDQUF1QixLQUF2QixDQUE2QixDQUFDLE9BQTlCLENBQXNDLElBQXRDLENBQVo7QUFBQSxhQUFBOztXQUNBLElBQUMsQ0FBQSxHQUFELENBQ0U7TUFBQSxNQUFBLEVBQWMsSUFBZDtNQUNBLE1BQUEsRUFBYyxJQURkO01BRUEsU0FBQSxFQUFjLE9BRmQ7TUFHQSxXQUFBLEVBQWMsQ0FBSyxJQUFBLElBQUEsQ0FBQSxDQUFMLENBQVksQ0FBQyxPQUFiLENBQUEsQ0FIZDtLQURGO0VBRkU7O2dCQVNKLEVBQUEsR0FBSSxTQUFFLElBQUYsRUFBYSxPQUFiOztNQUFFLE9BQU87OztNQUFJLFVBQVU7O0lBQ3pCLElBQVUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBbkIsQ0FBdUIsS0FBdkIsQ0FBNkIs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QVYsQ0FBMkIsQ0FBQyxJQUE1QixDQUFpQyxTQUFqQztFQXJDTTs7OztHQXZCWSxRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9sb2cvTG9nLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTG9nIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuICB1cmw6IFwibG9nXCJcblxuICAjXG4gICMgTG9nIHVzaW5nIHRoZXNlIGZvdXIgZnVuY3Rpb25zXG4gICNcblxuICAjIGxhcmdlciBhcHBsaWNhdGlvbiBmdW5jdGlvbnNcbiAgYXBwOiAoIGNvZGUgPSBcIlwiLCBkZXRhaWxzID0gXCJcIiApIC0+XG4gICAgcmV0dXJuIGlmICF+VGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImxvZ1wiKS5pbmRleE9mKFwiYXBwXCIpXG4gICAgQGFkZFxuICAgICAgXCJ0eXBlXCIgICAgICA6IFwiYXBwXCJcbiAgICAgIFwiY29kZVwiICAgICAgOiBjb2RlXG4gICAgICBcImRldGFpbHNcIiAgIDogZGV0YWlsc1xuICAgICAgXCJ0aW1lc3RhbXBcIiA6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcblxuICAjIGNvbW11bmljYXRpb25zIHdpdGggZGF0YWJhc2VzXG4gIGRiOiAoIGNvZGUgPSBcIlwiLCBkZXRhaWxzID0gXCJcIiApIC0+XG4gICAgcmV0dXJuIGlmICF+VGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImxvZ1wiKS5pbmRleE9mKFwiZGJcIilcbiAgICBAYWRkXG4gICAgICBcInR5cGVcIiAgICAgIDogXCJkYlwiXG4gICAgICBcImNvZGVcIiAgICAgIDogY29kZVxuICAgICAgXCJkZXRhaWxzXCIgICA6IGRldGFpbHNcbiAgICAgIFwidGltZXN0YW1wXCIgOiAobmV3IERhdGUoKSkuZ2V0VGltZSgpXG5cbiAgIyBzcGVjaWZpYyBVSSBpbnRlcmFjdGlvbnNcbiAgdWk6ICggY29kZSA9IFwiXCIsIGRldGFpbHMgPSBcIlwiICkgLT5cbiAgICByZXR1cm4gaWYgIX5UYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwibG9nXCIpLmluZGV4T2YoXCJ1aVwiKVxuICAgIEBhZGRcbiAgICAgIFwidHlwZVwiICAgICAgOiBcInVpXCJcbiAgICAgIFwiY29kZVwiICAgICAgOiBjb2RlXG4gICAgICBcImRldGFpbHNcIiAgIDogZGV0YWlsc1xuICAgICAgXCJ0aW1lc3RhbXBcIiA6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcblxuICAjIGVycm9ycywgaGFuZGxlZCBvciBvdGhlcndpc2VcbiAgZXJyOiAoIGNvZGUgPSBcIlwiLCBkZXRhaWxzID0gXCJcIiApIC0+XG4gICAgcmV0dXJuICF+VGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImxvZ1wiKS5pbmRleE9mKFwiZXJyXCIpXG4gICAgQGFkZFxuICAgICAgXCJ0eXBlXCIgICAgICA6IFwiZXJyXCJcbiAgICAgIFwiY29kZVwiICAgICAgOiBjb2RlXG4gICAgICBcImRldGFpbHNcIiAgIDogZGV0YWlsc1xuICAgICAgXCJ0aW1lc3RhbXBcIiA6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcblxuICAjIHJlcXVpcmVzIHRoYXQgVEhJUywgQCwgaXMgdXAgdG8gZGF0ZS4gXG4gICMgaGFzIGEgc2lkZSBlZmZlY3QsIGl0IHNhdmVzXG4gIGFkZDogKCBsb2dFdmVudCApIC0+XG4gICAgZCA9IG5ldyBEYXRlKClcbiAgICBuYW1lID0gXCJub3Qtc2lnbmVkLWluXCJcbiAgICBuYW1lID0gVGFuZ2VyaW5lLnVzZXIubmFtZSgpIGlmIFRhbmdlcmluZS51c2VyLm5hbWUoKT9cbiAgICBAdW5zZXQgXCJfcmV2XCJcbiAgICBAc2F2ZSBcbiAgICAgIFwiX2lkXCIgICAgICAgOiBAY2FsY05hbWUoKVxuICAgICAgXCJ5ZWFyXCIgICAgICA6IGQuZ2V0RnVsbFllYXIoKVxuICAgICAgXCJtb250aFwiICAgICA6IGQuZ2V0TW9udGgoKVxuICAgICAgXCJkYXRlXCIgICAgICA6IGQuZ2V0RGF0ZSgpXG4gICAgICBcInRpbWVzdGFtcFwiIDogZC5nZXRUaW1lKClcbiAgICAgIFwidXNlclwiICAgICAgOiBuYW1lXG4gICAgICBcImV2ZW50XCIgICAgIDogbG9nRXZlbnRcblxuICBjYWxjTmFtZTogLT5cbiAgICBkID0gbmV3IERhdGUoKVxuICAgIHVzZXIgPSBcIm5vdC1zaWduZWQtaW5cIlxuICAgIHVzZXIgPSBUYW5nZXJpbmUudXNlci5uYW1lKCkgaWYgVGFuZ2VyaW5lLnVzZXIubmFtZSgpP1xuICAgIHJldHVybiBoZXhfc2hhMSBcIiN7dXNlcn1fI3tkLmdldFRpbWUoKX1cIlxuXG5jbGFzcyBMb2dzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuICB1cmw6IFwibG9nXCJcbiAgbW9kZWw6IExvZ1xuICBwb3VjaDpcbiAgICB2aWV3T3B0aW9uczpcbiAgICAgIGtleSA6ICdsb2cnXG5cbiAgY29tcGFyYXRvcjogKG1vZGVsKSAtPiByZXR1cm4gbW9kZWwuZ2V0KFwidGltZXN0YW1wXCIpXG5cbmNsYXNzIExvZ1ZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJMb2dWaWV3XCJcbiAgZXZlbnRzIDpcbiAgICBcImNoYW5nZSAjdXNlcl9zZWxlY3RvclwiIDogXCJ1cGRhdGVcIlxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBsb2dzID0gb3B0aW9ucy5sb2dzXG4gICAgQGxvZ3NCeVVzZXIgID0gQGxvZ3MuaW5kZXhCeSBcInVzZXJcIlxuICAgIEBzZWxlY3RlZFVzZXIgPSBfLmZpcnN0IF8ua2V5cyBAbG9nc0J5VXNlclxuXG4gIHJlbmRlcjogPT5cblxuICAgIGh0bWxPcHRpb25zID0gKFwiPG9wdGlvbiBkYXRhLXVzZXI9JyN7dXNlcn0nICN7KFwic2VsZWN0ZWQ9J3NlbGVjdGVkJ1wiIGlmIEBzZWxlY3RlZFVzZXIgPT0gdXNlcikgfHwgXCJcIn0+I3t1c2VyfTwvb3B0aW9uPlwiIGZvciB1c2VyIGluIF8ua2V5cyhAbG9nc0J5VXNlcikpLmpvaW4gXCJcIlxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGgxPkxvZ3M8L2gxPlxuXG4gICAgICA8c2VsZWN0IGlkPSd1c2VyX3NlbGVjdG9yJz4je2h0bWxPcHRpb25zfTwvc2VsZWN0PlxuICAgICAgPGRpdiBjbGFzcz0nbG9nX2NvbnRhaW5lcic+PC9kaXY+XG4gICAgXCJcbiAgICBAdXBkYXRlKClcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICB1cGRhdGU6IC0+XG5cbiAgICBAc2VsZWN0ZWRVc2VyID0gQCRlbC5maW5kKFwiI3VzZXJfc2VsZWN0b3Igb3B0aW9uOnNlbGVjdGVkXCIpLmF0dHIoXCJkYXRhLXVzZXJcIilcblxuICAgIGxvZ3MgPSBAbG9nc0J5VXNlcltAc2VsZWN0ZWRVc2VyXVxuXG4gICAgaHRtbFRhYmxlID0gXCJcbiAgICA8aDI+VXNlciAje0BzZWxlY3RlZFVzZXJ9PC9oMj5cblxuICAgICAgPHRhYmxlPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPkNvZGU8L3RoPlxuICAgICAgICAgIDx0aD5EZXRhaWxzPC90aD5cbiAgICAgICAgICA8dGg+VGltZTwvdGg+XG4gICAgICAgIDwvdHI+XG4gICAgXCJcblxuXG4gICAgZm9yIGxvZyBpbiBsb2dzXG4gICAgICByZXR1cm4gaWYgbm90IGxvZy5nZXQoXCJldmVudFwiKT8gXG5cbiAgICAgIGV2ICAgICAgPSBsb2cuZ2V0IFwiZXZlbnRcIlxuICAgICAgbmFtZSAgICA9IGxvZy5nZXQoXCJ1c2VyXCIpXG4gICAgICBjb2RlICAgID0gZXYuY29kZVxuICAgICAgZGV0YWlscyA9IGV2LmRldGFpbHNcbiAgICAgIHRpbWUgICAgPSAobmV3IERhdGUocGFyc2VJbnQoZXYudGltZXN0YW1wKSkpLnRvU3RyaW5nKClcblxuICAgICAgaHRtbFRhYmxlICs9IFwiXG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+I3tjb2RlfTwvdGQ+XG4gICAgICAgICAgPHRkPiN7ZGV0YWlsc308L3RkPlxuICAgICAgICAgIDx0ZD4je3RpbWV9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgIFwiXG5cbiAgICBodG1sVGFibGUgKz0gXCI8L3RhYmxlPlwiXG5cbiAgICBAJGVsLmZpbmQoXCIubG9nX2NvbnRhaW5lclwiKS5odG1sIGh0bWxUYWJsZVxuIl19

var Settings,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Settings = (function(_super) {

  __extends(Settings, _super);

  function Settings() {
    this.update = __bind(this.update, this);
    Settings.__super__.constructor.apply(this, arguments);
  }

  Settings.prototype.url = "settings";

  Settings.prototype.initialize = function() {
    var _this = this;
    this.config = Tangerine.config;
    return this.on("all", function() {
      return _this.update();
    });
  };

  Settings.prototype.update = function() {
    var designDoc, groupDDoc, groupHost, groupName, local, port, prefix, splitGroup, subnetBase, upPass, upUser, update, x;
    groupHost = this.get("groupHost");
    groupName = this.get("groupName");
    groupDDoc = this.get("groupDDoc");
    upUser = "uploader-" + groupName;
    upPass = this.get("upPass");
    update = this.config.get("update");
    local = this.config.get("local");
    port = this.config.get("port");
    designDoc = this.config.get("designDoc");
    prefix = this.config.get("groupDBPrefix");
    subnetBase = this.config.get("subnet").base;
    if (Tangerine.settings.get("context") === "mobile") {
      splitGroup = groupHost.split("://");
      groupHost = "" + splitGroup[0] + "://" + upUser + ":" + upPass + "@" + splitGroup[1];
    }
    this.location = {
      local: {
        url: "" + local.host + ":" + port + "/",
        db: "/" + local.dbName + "/"
      },
      group: {
        url: "" + groupHost + ":" + port + "/",
        db: "" + groupHost + ":" + port + "/" + prefix + groupName + "/"
      },
      update: {
        url: "http://" + update.login + "@" + update.host + ":" + port + "/",
        db: "http://" + update.login + "@" + update.host + ":" + port + "/" + update.dbName + "/"
      },
      subnet: {
        url: (function() {
          var _results;
          _results = [];
          for (x = 0; x <= 255; x++) {
            _results.push("http://" + subnetBase + "." + x + ":" + port + "/");
          }
          return _results;
        })(),
        db: (function() {
          var _results;
          _results = [];
          for (x = 0; x <= 255; x++) {
            _results.push("http://" + subnetBase + "." + x + ":" + port + "/" + local.dbName + "/");
          }
          return _results;
        })()
      },
      satellite: {
        url: (function() {
          var _results;
          _results = [];
          for (x = 0; x <= 255; x++) {
            _results.push("" + subnetBase + "." + x + ":" + port + "/");
          }
          return _results;
        })(),
        db: (function() {
          var _results;
          _results = [];
          for (x = 0; x <= 255; x++) {
            _results.push("" + subnetBase + "." + x + ":" + port + "/" + prefix + groupName + "/");
          }
          return _results;
        })()
      }
    };
    this.couch = {
      view: "_design/" + designDoc + "/_view/",
      show: "_design/" + designDoc + "/_show/",
      list: "_design/" + designDoc + "/_list/",
      index: "_design/" + designDoc + "/index.html"
    };
    return this.groupCouch = {
      view: "_design/" + groupDDoc + "/_view/",
      show: "_design/" + groupDDoc + "/_show/",
      list: "_design/" + groupDDoc + "/_list/",
      index: "_design/" + groupDDoc + "/index.html"
    };
  };

  Settings.prototype.urlIndex = function(groupName, hash) {
    var groupHost, port, prefix;
    if (hash == null) hash = null;
    groupHost = this.get("groupHost");
    port = this.config.get("port");
    prefix = groupName !== "tangerine" ? this.config.get("groupDBPrefix") : "";
    hash = hash != null ? "#" + hash : "";
    return "" + groupHost + ":" + port + "/" + prefix + groupName + "/" + this.couch.index + hash;
  };

  Settings.prototype.urlHost = function(location) {
    return "" + this.location[location].url;
  };

  Settings.prototype.urlDB = function(location) {
    if (location === "local") {
      return ("" + this.location[location].db).slice(1, -1);
    } else {
      return ("" + this.location[location].db).slice(0, -1);
    }
  };

  Settings.prototype.urlView = function(location, view) {
    if (location === "group" || Tangerine.settings.get("context") === "server") {
      return "" + this.location[location].db + this.groupCouch.view + view;
    } else {
      return "" + this.location[location].db + this.couch.view + view;
    }
  };

  Settings.prototype.urlList = function(location, list) {
    if (location === "group" || Tangerine.settings.get("context") === "server") {
      return "" + this.location[location].db + this.groupCouch.list + list;
    } else {
      return "" + this.location[location].db + this.couch.list + list;
    }
  };

  Settings.prototype.urlShow = function(location, show) {
    if (location === "group" || Tangerine.settings.get("context") === "server") {
      return "" + this.location[location].db + this.groupCouch.show + show;
    } else {
      return "" + this.location[location].db + this.couch.show + show;
    }
  };

  Settings.prototype.urlSubnet = function(ip) {
    var dbName, port;
    port = this.config.get("port");
    dbName = this.config.get("local").dbName;
    return "http://" + ip + ":" + port + "/" + dbName;
  };

  Settings.prototype.subnetIP = function(index) {
    var base;
    base = this.config.get("subnet").base;
    return "" + base + "." + index;
  };

  return Settings;

})(Backbone.Model);

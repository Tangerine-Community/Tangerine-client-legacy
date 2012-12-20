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
    var designDoc, groupHost, groupName, local, port, prefix, subnetBase, x;
    groupHost = this.get("groupHost");
    groupName = this.get("groupName");
    local = this.config.get("local");
    port = this.config.get("port");
    designDoc = this.config.get("designDoc");
    prefix = this.config.get("groupDBPrefix");
    subnetBase = this.config.get("subnet").base;
    this.location = {
      local: {
        url: "" + local.host + ":" + port + "/",
        db: "/" + local.dbName + "/"
      },
      group: {
        url: "" + groupHost + ":" + port + "/",
        db: "" + groupHost + ":" + port + "/" + prefix + groupName + "/"
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
    return this.couch = {
      view: "_design/" + designDoc + "/_view/",
      show: "_design/" + designDoc + "/_show/",
      list: "_design/" + designDoc + "/_list/"
    };
  };

  Settings.prototype.urlHost = function(location) {
    return "" + this.location[location].url;
  };

  Settings.prototype.urlDB = function(location) {
    return "" + this.location[location].db;
  };

  Settings.prototype.urlView = function(location, view) {
    return "" + this.location[location].db + this.couch.view + view;
  };

  Settings.prototype.urlList = function(location, list) {
    return "" + this.location[location].db + this.couch.show + list;
  };

  Settings.prototype.urlShow = function(location, show) {
    return "" + this.location[location].db + this.couch.list + show;
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

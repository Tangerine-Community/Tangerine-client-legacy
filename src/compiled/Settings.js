var Settings,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Settings = (function(superClass) {
  extend(Settings, superClass);

  function Settings() {
    this.update = bind(this.update, this);
    return Settings.__super__.constructor.apply(this, arguments);
  }

  Settings.prototype.url = "settings";

  Settings.prototype.initialize = function() {
    var x;
    this.ipRange = _.uniq(((function() {
      var i, results;
      results = [];
      for (x = i = 100; i <= 200; x = ++i) {
        results.push(x);
      }
      return results;
    })()).concat((function() {
      var i, results;
      results = [];
      for (x = i = 0; i <= 255; x = ++i) {
        results.push(x);
      }
      return results;
    })()));
    this.config = Tangerine.config;
    return this.on("change", (function(_this) {
      return function() {
        return _this.update();
      };
    })(this));
  };

  Settings.prototype.update = function() {
    var designDoc, groupDDoc, groupHost, groupName, port, prefix, splitGroup, subnetBase, x;
    groupHost = this.getString("groupHost");
    groupName = this.getString("groupName");
    groupDDoc = this.getString("groupDDoc");
    this.upUser = "uploader-" + groupName;
    this.upPass = this.get("upPass");
    designDoc = Tangerine.design_doc;
    prefix = Tangerine.conf.groupPrefix;
    this.groupDB = "" + prefix + groupName;
    subnetBase = Tangerine.conf.subnet_base;
    port = Tangerine.conf.tablet_port;
    if (Tangerine.settings.get("context") !== "server") {
      splitGroup = groupHost.split("://");
      groupHost = splitGroup[0] + "://" + this.upUser + ":" + this.upPass + "@" + splitGroup[1];
    }
    this.location = {
      group: {
        url: groupHost + "/",
        db: groupHost + "/" + prefix + groupName + "/"
      },
      subnet: {
        url: (function() {
          var i, results;
          results = [];
          for (x = i = 0; i <= 255; x = ++i) {
            results.push("http://" + subnetBase + this.ipRange[x] + ":" + port + "/");
          }
          return results;
        }).call(this),
        db: (function() {
          var i, results;
          results = [];
          for (x = i = 0; i <= 255; x = ++i) {
            results.push("http://" + subnetBase + this.ipRange[x] + ":" + port + "/" + Tangerine.db_name + "/");
          }
          return results;
        }).call(this)
      }
    };
    this.couch = {
      view: "_design/" + designDoc + "/_view/",
      index: "_design/" + designDoc + "/index.html"
    };
    return this.groupCouch = {
      view: "_design/" + groupDDoc + "/_view/",
      index: "_design/" + groupDDoc + "/index.html"
    };
  };

  Settings.prototype.urlBulkDocs = function() {
    var bulkDocsURL;
    return bulkDocsURL = "/" + Tangerine.db_name + "/_bulk_docs";
  };

  Settings.prototype.urlIndex = function(groupName, hash) {
    var groupHost, port;
    if (hash == null) {
      hash = null;
    }
    groupHost = this.get("groupHost");
    port = groupName === "local" ? ":" + Tangerine.conf.tablet_port : "";
    hash = hash != null ? "#" + hash : "";
    if (groupName === "trunk") {
      groupName = "tangerine";
    } else {
      groupName = Tangerine.conf.groupPrefix + groupName;
    }
    return "" + groupHost + port + "/" + groupName + "/" + this.couch.index + hash;
  };

  Settings.prototype.urlHost = function(location) {
    return "" + this.location[location].url;
  };

  Settings.prototype.urlDB = function(location, pass) {
    var result, splitDB;
    if (pass == null) {
      pass = null;
    }
    if (location === "local") {
      result = ("" + this.location[location].db).slice(1, -1);
    } else {
      result = ("" + this.location[location].db).slice(0, -1);
    }
    splitDB = result.split("://");
    if (pass === true) {
      result = splitDB[0] + "://" + this.upUser + ":" + this.upPass + "@" + splitDB[1];
    } else if (pass != null) {
      result = splitDB[0] + "://" + (Tangerine.user.name()) + ":" + pass + "@" + splitDB[1];
    }
    return result;
  };

  Settings.prototype.urlDDoc = function(location) {
    var dDoc;
    dDoc = Tangerine.designDoc;
    return (this.urlDB('trunk')) + "/_design/" + dDoc;
  };

  Settings.prototype.urlView = function(location, view) {
    if (location === "group") {
      return "" + this.location[location].db + this.groupCouch.view + view;
    } else {
      return "" + this.location[location].db + this.couch.view + view;
    }
  };

  Settings.prototype.urlList = function(location, list) {
    if (location === "group") {
      return "" + this.location[location].db + this.groupCouch.list + list;
    } else {
      return "" + this.location[location].db + this.couch.list + list;
    }
  };

  Settings.prototype.urlShow = function(location, show) {
    if (location === "group") {
      return "" + this.location[location].db + this.groupCouch.show + show;
    } else {
      return "" + this.location[location].db + this.couch.show + show;
    }
  };

  Settings.prototype.urlSubnet = function(ip) {
    var dbName, port;
    port = Tangerine.conf.tablet_port;
    dbName = Tangerine.conf.db_name;
    return "http://" + ip + ":" + port + "/" + dbName;
  };

  Settings.prototype.subnetIP = function(index) {
    var base;
    base = Tangerine.conf.subnet_base;
    return "" + base + this.ipRange[index];
  };

  return Settings;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc2V0dGluZ3MvU2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLElBQUEsUUFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7O3FCQUVKLEdBQUEsR0FBTTs7cUJBRU4sVUFBQSxHQUFZLFNBQUE7QUFFVixRQUFBO0lBQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFDLENBQUMsSUFBRixDQUFPOztBQUFDO1dBQVcsOEJBQVg7cUJBQUE7QUFBQTs7UUFBRCxDQUF1QixDQUFDLE1BQXhCOztBQUFnQztXQUFXLDRCQUFYO3FCQUFBO0FBQUE7O1FBQWhDLENBQVA7SUFDWCxJQUFDLENBQUEsTUFBRCxHQUFVLFNBQVMsQ0FBQztXQUNwQixJQUFDLENBQUEsRUFBRCxDQUFJLFFBQUosRUFBYyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7ZUFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO01BQUg7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQ7RUFKVTs7cUJBT1osTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxTQUFELENBQVcsV0FBWDtJQUNaLFNBQUEsR0FBWSxJQUFDLENBQUEsU0FBRCxDQUFXLFdBQVg7SUFDWixTQUFBLEdBQVksSUFBQyxDQUFBLFNBQUQsQ0FBVyxXQUFYO0lBRVosSUFBQyxDQUFBLE1BQUQsR0FBVSxXQUFBLEdBQVk7SUFDdEIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsR0FBRCxDQUFLLFFBQUw7SUFFVixTQUFBLEdBQWEsU0FBUyxDQUFDO0lBRXZCLE1BQUEsR0FBYSxTQUFTLENBQUMsSUFBSSxDQUFDO0lBRTVCLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFBQSxHQUFHLE1BQUgsR0FBWTtJQUV2QixVQUFBLEdBQWEsU0FBUyxDQUFDLElBQUksQ0FBQztJQUU1QixJQUFBLEdBQU8sU0FBUyxDQUFDLElBQUksQ0FBQztJQUd0QixJQUFHLFNBQVMsQ0FB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Z3MuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjIGhhbmRsZXMgc2V0dGluZ3MgdGhhdCBhcmUgZ3JvdXAgc3BlY2lmaWNcbmNsYXNzIFNldHRpbmdzIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuICB1cmwgOiBcInNldHRpbmdzXCJcblxuICBpbml0aWFsaXplOiAtPlxuXG4gICAgQGlwUmFuZ2UgPSBfLnVuaXEoKHggZm9yIHggaW4gWzEwMC4uMjAwXSkuY29uY2F0KCh4IGZvciB4IGluIFswLi4yNTVdKSkpXG4gICAgQGNvbmZpZyA9IFRhbmdlcmluZS5jb25maWdcbiAgICBAb24gXCJjaGFuZ2VcIiwgPT4gQHVwZGF0ZSgpXG5cblxuICB1cGRhdGU6ID0+XG4gICAgZ3JvdXBIb3N0ID0gQGdldFN0cmluZyBcImdyb3VwSG9zdFwiXG4gICAgZ3JvdXBOYW1lID0gQGdldFN0cmluZyBcImdyb3VwTmFtZVwiXG4gICAgZ3JvdXBERG9jID0gQGdldFN0cmluZyBcImdyb3VwRERvY1wiXG5cbiAgICBAdXBVc2VyID0gXCJ1cGxvYWRlci0je2dyb3VwTmFtZX1cIlxuICAgIEB1cFBhc3MgPSBAZ2V0IFwidXBQYXNzXCJcblxuICAgIGRlc2lnbkRvYyAgPSBUYW5nZXJpbmUuZGVzaWduX2RvY1xuXG4gICAgcHJlZml4ICAgICA9IFRhbmdlcmluZS5jb25mLmdyb3VwUHJlZml4XG5cbiAgICBAZ3JvdXBEQiA9IFwiI3twcmVmaXh9I3tncm91cE5hbWV9XCJcblxuICAgIHN1Ym5ldEJhc2UgPSBUYW5nZXJpbmUuY29uZi5zdWJuZXRfYmFzZVxuXG4gICAgcG9ydCA9IFRhbmdlcmluZS5jb25mLnRhYmxldF9wb3J0XG5cblxuICAgIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpICE9IFwic2VydmVyXCJcbiAgICAgIHNwbGl0R3JvdXAgPSBncm91cEhvc3Quc3BsaXQoXCI6Ly9cIilcbiAgICAgIGdyb3VwSG9zdCA9IFwiI3tzcGxpdEdyb3VwWzBdfTovLyN7QHVwVXNlcn06I3tAdXBQYXNzfUAje3NwbGl0R3JvdXBbMV19XCJcblxuICAgIEBsb2NhdGlvbiA9XG4gICAgICBncm91cDpcbiAgICAgICAgdXJsIDogXCIje2dyb3VwSG9zdH0vXCJcbiAgICAgICAgZGIgIDogXCIje2dyb3VwSG9zdH0vI3twcmVmaXh9I3tncm91cE5hbWV9L1wiXG4gICAgICBzdWJuZXQgOiBcbiAgICAgICAgdXJsIDogKFwiaHR0cDovLyN7c3VibmV0QmFzZX0je0BpcFJhbmdlW3hdfToje3BvcnR9L1wiICAgICAgICAgICAgICAgICAgICAgIGZvciB4IGluIFswLi4yNTVdKVxuICAgICAgICBkYiAgOiAoXCJodHRwOi8vI3tzdWJuZXRCYXNlfSN7QGlwUmFuZ2VbeF19OiN7cG9ydH0vI3tUYW5nZXJpbmUuZGJfbmFtZX0vXCIgZm9yIHggaW4gWzAuLjI1NV0pXG5cbiAgICBAY291Y2ggPSBcbiAgICAgIHZpZXcgIDogXCJfZGVzaWduLyN7ZGVzaWduRG9jfS9fdmlldy9cIlxuICAgICAgaW5kZXggOiBcIl9kZXNpZ24vI3tkZXNpZ25Eb2N9L2luZGV4Lmh0bWxcIlxuXG4gICAgQGdyb3VwQ291Y2ggPSBcbiAgICAgIHZpZXcgIDogXCJfZGVzaWduLyN7Z3JvdXBERG9jfS9fdmlldy9cIlxuICAgICAgaW5kZXggOiBcIl9kZXNpZ24vI3tncm91cEREb2N9L2luZGV4Lmh0bWxcIlxuXG4gIHVybEJ1bGtEb2NzIDogLT5cbiAgICBidWxrRG9jc1VSTCA9IFwiL1wiICsgVGFuZ2VyaW5lLmRiX25hbWUgKyBcIi9fYnVsa19kb2NzXCJcblxuICB1cmxJbmRleCA6ICggZ3JvdXBOYW1lLCBoYXNoID0gbnVsbCApIC0+XG4gICAgZ3JvdXBIb3N0ID0gQGdldCBcImdyb3VwSG9zdFwiXG5cbiAgICAjIHBvcnQgbnVtYmVyIG9ubHkgZm9yIGxvY2FsLCBpcmlzY291Y2ggYWx3YXlzIHVzZXMgODAsIGNvbmZ1c2VzIGNvcnNcbiAgICBwb3J0ICAgPSBpZiBncm91cE5hbWUgPT0gXCJsb2NhbFwiIHRoZW4gXCI6XCIrVGFuZ2VyaW5lLmNvbmYudGFibGV0X3BvcnQgZWxzZSBcIlwiXG4gICAgaGFzaCAgID0gaWYgaGFzaD8gdGhlbiBcIiMje2hhc2h9XCIgZWxzZSBcIlwiXG5cbiAgICBpZiBncm91cE5hbWUgPT0gXCJ0cnVua1wiXG4gICAgICBncm91cE5hbWUgPSBcInRhbmdlcmluZVwiXG4gICAgZWxzZSBcbiAgICAgIGdyb3VwTmFtZSA9IFRhbmdlcmluZS5jb25mLmdyb3VwUHJlZml4ICsgZ3JvdXBOYW1lXG5cbiAgICByZXR1cm4gXCIje2dyb3VwSG9zdH0je3BvcnR9LyN7Z3JvdXBOYW1lfS8je0Bjb3VjaC5pbmRleH0je2hhc2h9XCJcblxuICB1cmxIb3N0ICA6ICggbG9jYXRpb24gKSAtPiBcIiN7QGxvY2F0aW9uW2xvY2F0aW9uXS51cmx9XCJcbiAgXG4gIHVybERCICAgIDogKCBsb2NhdGlvbiwgcGFzcyA9IG51bGwgKSAtPiBcbiAgICBpZiBsb2NhdGlvbiA9PSBcImxvY2FsXCJcbiAgICAgIHJlc3VsdCA9IFwiI3tAbG9jYXRpb25bbG9jYXRpb25dLmRifVwiLnNsaWNlKDEsLTEpXG4gICAgZWxzZVxuICAgICAgcmVzdWx0ID0gXCIje0Bsb2NhdGlvbltsb2NhdGlvbl0uZGJ9XCIuc2xpY2UoMCwgLTEpXG5cbiAgICBzcGxpdERCID0gcmVzdWx0LnNwbGl0KFwiOi8vXCIpXG5cbiAgICBpZiBwYXNzIGlzIHRydWVcbiAgICAgIHJlc3VsdCA9IFwiI3tzcGxpdERCWzBdfTovLyN7QHVwVXNlcn06I3tAdXBQYXNzfUAje3NwbGl0REJbMV19XCJcbiAgICBlbHNlIGlmIHBhc3M/XG4gICAgICByZXN1bHQgPSBcIiN7c3BsaXREQlswXX06Ly8je1RhbmdlcmluZS51c2VyLm5hbWUoKX06I3twYXNzfUAje3NwbGl0REJbMV19XCJcblxuICAgIHJldHVybiByZXN1bHRcblxuICB1cmxERG9jIDogKCBsb2NhdGlvbiApIC0+XG4gICAgZERvYyA9IFRhbmdlcmluZS5kZXNpZ25Eb2NcbiAgICByZXR1cm4gXCIje0B1cmxEQigndHJ1bmsnKX0vX2Rlc2lnbi8je2REb2N9XCJcblxuICB1cmxWaWV3ICA6ICggbG9jYXRpb24sIHZpZXcgKSAtPlxuICAgIGlmIGxvY2F0aW9uID09IFwiZ3JvdXBcIlxuICAgICAgXCIje0Bsb2NhdGlvbltsb2NhdGlvbl0uZGJ9I3tAZ3JvdXBDb3VjaC52aWV3fSN7dmlld31cIlxuICAgIGVsc2VcbiAgICAgIFwiI3tAbG9jYXRpb25bbG9jYXRpb25dLmRifSN7QGNvdWNoLnZpZXd9I3t2aWV3fVwiXG5cbiAgdXJsTGlzdCAgOiAoIGxvY2F0aW9uLCBsaXN0ICkgLT5cbiAgICBpZiBsb2NhdGlvbiA9PSBcImdyb3VwXCJcbiAgICAgIFwiI3tAbG9jYXRpb25bbG9jYXRpb25dLmRifSN7QGdyb3VwQ291Y2gubGlzdH0je2xpc3R9XCJcbiAgICBlbHNlXG4gICAgICBcIiN7QGxvY2F0aW9uW2xvY2F0aW9uXS5kYn0je0Bjb3VjaC5saXN0fSN7bGlzdH1cIlxuXG4gIHVybFNob3cgIDogKCBsb2NhdGlvbiwgc2hvdyApIC0+XG4gICAgaWYgbG9jYXRpb24gPT0gXCJncm91cFwiXG4gICAgICBcIiN7QGxvY2F0aW9uW2xvY2F0aW9uXS5kYn0je0Bncm91cENvdWNoLnNob3d9I3tzaG93fVwiXG4gICAgZWxzZVxuICAgICAgXCIje0Bsb2NhdGlvbltsb2NhdGlvbl0uZGJ9I3tAY291Y2guc2hvd30je3Nob3d9XCJcbiAgXG4gICMgdGhlc2UgdHdvIGFyZSBhIGxpdHRsZSB3ZWlyZC4gSSBmZWVsIGxpa2Ugc3VibmV0QWRkcmVzcyBzaG91bGQgYmUgYSBjbGFzcyB3aXRoIHByb3BlcnRpZXMgSVAsIFVSTCBhbmQgaW5kZXhcbiAgdXJsU3VibmV0OiAoIGlwICkgLT5cbiAgICBwb3J0ICAgPSBUYW5nZXJpbmUuY29uZi50YWJsZXRfcG9ydFxuICAgIGRiTmFtZSA9IFRhbmdlcmluZS5jb25mLmRiX25hbWVcblxuICAgIFwiaHR0cDovLyN7aXB9OiN7cG9ydH0vI3tkYk5hbWV9XCJcblxuICBzdWJuZXRJUDogKCBpbmRleCApIC0+XG4gICAgYmFzZSA9IFRhbmdlcmluZS5jb25mLnN1Ym5ldF9iYXNlXG4gICAgXCIje2Jhc2V9I3tAaXBSYW5nZVtpbmRleF19XCJcblxuXG5cblxuXG4iXX0=

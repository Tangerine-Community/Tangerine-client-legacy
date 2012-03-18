var MapReduce, Utils;

MapReduce = (function() {

  function MapReduce() {}

  MapReduce.mapFields = function(doc, req) {
    ({
      concatNodes: function(parent, object) {
        var emitDoc, index, key, prefix, typeofobject, value, _len, _ref, _results, _results2;
        if (object instanceof Array) {
          _results = [];
          for (index = 0, _len = object.length; index < _len; index++) {
            value = object[index];
            if (typeof object !== "string") {
              _results.push(concatNodes(parent + "." + index, value));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        } else {
          typeofobject = typeof object;
          if (typeofobject === "boolean" || typeofobject === "string" || typeofobject === "number") {
            emitDoc = {
              studentID: (_ref = doc.DateTime) != null ? _ref["student-id"] : void 0,
              fieldname: parent
            };
            if (typeofobject === "boolean") {
              emitDoc.result = object ? "true" : "false";
            }
            if (typeofobject === "string" || typeofobject === "number") {
              emitDoc.result = object;
            }
            return emit(parent, emitDoc);
          } else {
            _results2 = [];
            for (key in object) {
              value = object[key];
              prefix = (parent === "" ? key : parent + "." + key);
              _results2.push(concatNodes(prefix, value));
            }
            return _results2;
          }
        }
      }
    });
    if (!((doc.type != null) && doc.type === "replicationLog")) {
      return concatNodes("", doc);
    }
  };

  MapReduce.reduceFields = function(keys, values, rereduce) {
    return true;
  };

  MapReduce.mapByEnumerator = function(doc, req) {
    if ((doc.enumerator != null) && (doc.timestamp != null)) {
      return emit(doc.enumerator, null);
    }
  };

  MapReduce.countByEnumerator = function(keys, values, rereduce) {
    return keys.length;
  };

  MapReduce.mapReplicationLog = function(doc, req) {
    if (doc.type === "replicationLog") return emit(doc.timestamp, doc);
  };

  return MapReduce;

})();

Utils = (function() {

  function Utils() {}

  Utils.resultViewsDesignDocument = {
    "_id": "_design/results",
    "language": "javascript",
    "views": {
      "byEnumerator": {
        "map": MapReduce.mapByEnumerator.toString(),
        "reduce": MapReduce.countByEnumerator.toString()
      },
      "replicationLog": {
        "map": MapReduce.mapReplicationLog.toString()
      }
    }
  };

  Utils.reportViewsDesignDocument = {
    "_id": "_design/reports",
    "language": "javascript",
    "views": {
      "fields": {
        "map": MapReduce.mapFields.toString(),
        "reduce": MapReduce.reduceFields.toString()
      }
    }
  };

  Utils.createResultsDatabase = function(databaseName) {
    console.log("trying to create a database");
    $('#message').append("<br/>Logging in as administrator");
    return this.sudo({
      success: function() {
        var _this = this;
        $('#message').append("<br/>Creating database [" + databaseName + "]");
        return $.couch.db(databaseName).create({
          success: function() {
            createResultViews(databaseName);
            return createDesignDocumentViews(databaseName, _this.resultViewsDesignDocument);
          }
        });
      }
    });
  };

  Utils.createResultViews = function(databaseName) {
    var _this = this;
    console.log("trying to create result views");
    this.sudo({
      success: function() {
        $('#message').append("<br/>Creating result views in [" + databaseName + "]");
        return console.log("Good, created design views");
      },
      error: function(a, b, c) {
        return console.log(["error", a, b, c]);
      }
    });
    return this.createDesignDocumentViews(databaseName, this.resultViewsDesignDocument);
  };

  Utils.createReportViews = function(databaseName) {
    var _this = this;
    return this.sudo({
      success: function() {
        $('#message').append("<br/>Creating report views in [" + databaseName + "]");
        return _this.createDesignDocumentViews(databaseName, _this.reportsViewsDesignDocument);
      }
    });
  };

  Utils.createDesignDocumentViews = function(databaseName, designDocument) {
    return $.couch.db(databaseName).openDoc(designDocument["_id"], {
      success: function(doc) {
        designDocument._rev = doc._rev;
        return $.couch.db(databaseName).saveDoc(designDocument, {
          success: function() {
            return $('#message').append("<br/>Views updated for [" + databaseName + "]");
          }
        });
      },
      error: function() {
        return $.couch.db(databaseName).saveDoc(designDocument, {
          success: function() {
            return $('#message').append("<br/>Views created for [" + databaseName + "]");
          }
        });
      }
    });
  };

  Utils.sudo = function(options) {
    var credentials;
    console.log("Logging in...");
    credentials = {
      name: Tangerine.config.user_with_database_create_permission,
      password: Tangerine.config.password_with_database_create_permission
    };
    options = _.extend(options, credentials);
    return $.couch.login(options);
  };

  return Utils;

})();

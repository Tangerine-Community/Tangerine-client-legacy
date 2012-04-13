var MapReduce, Utils;

jQuery.fn.topCenter = function() {
  this.css("position", "absolute");
  this.css("top", $(window).scrollTop() + "px");
  return this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
};

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
            return emit(doc.assessment, emitDoc);
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
    var fieldAndResult, key, rv, value;
    rv = [];
    for (key in values) {
      value = values[key];
      fieldAndResult = {};
      fieldAndResult[value.fieldname] = value.result;
      rv.push(fieldAndResult);
    }
    return rv;
  };

  return MapReduce;

})();

Utils = (function() {

  function Utils() {}

  Utils.sudo = function(options) {
    var credentials;
    credentials = {
      name: Tangerine.config.user_with_database_create_permission,
      password: Tangerine.config.password_with_database_create_permission
    };
    options = _.extend(options, credentials);
    return $.couch.login(options);
  };

  Utils.getValues = function(selector) {
    var values;
    values = {};
    $(selector + " input").each(function(index, element) {
      return values[element.id] = element.value;
    });
    return values;
  };

  Utils.okBox = function(title, message) {
    return console.log([title, message]);
  };

  Utils.cleanURL = function(url) {
    if ((typeof url.indexOf === "function" ? url.indexOf("%") : void 0) !== -1) {
      return url = decodeURIComponent(url);
    } else {
      return url;
    }
  };

  Utils.importAssessmentFromIris = function(dKey) {
    var repOps;
    repOps = {
      'filter': 'tangerine/downloadFilter',
      'create_target': true,
      'query_params': {
        'dKey': dKey
      }
    };
    return $.couch.replicate(Tangerine.iris.host + "/tangerine", "tangerine", {
      success: function(a, b) {
        return console.log([" success", a, b]);
      }
    }, repOps);
  };

  Utils.disposableAlert = function(alert_text) {
    return $("<div class='disposable_alert'>" + alert_text + "</div>").appendTo("#content").topCenter().delay(2000).fadeOut(250, function() {
      return $(this).remove();
    });
  };

  return Utils;

})();

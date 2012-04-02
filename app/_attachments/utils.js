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

  Utils.handleMenu = function() {
    Tangerine.user.verify();
    $('#enumerator').html(Tangerine.user.get("name"));
    if (Tangerine.user.isAdmin()) {
      $("#main_nav a").hide();
      $("#navigation").show();
      return $("#collect_link, #manage_link, #logout_link").show();
    } else if (!Tangerine.user.isVerified()) {
      return $("#navigation").hide();
    } else {
      $("#main_nav a").hide();
      $("#navigation").show();
      return $("#collect_link, #logout_link").show();
    }
  };

  Utils.handleNavigation = function() {
    if (window.location.href.toLowerCase().indexOf("assessment") !== -1) {
      $("nav#main_nav a").removeClass("border_on");
      $("#collect_link").addClass("border_on");
    }
    if (window.location.href.toLowerCase().indexOf("manage") !== -1) {
      $("nav#main_nav a").removeClass("border_on");
      return $("#manage_link").addClass("border_on");
    }
  };

  return Utils;

})();

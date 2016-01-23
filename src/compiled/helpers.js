var ResultOfGrid, ResultOfMultiple, ResultOfPrevious, ResultOfQuestion, Robbert, TangerineTree, Utils,
  slice = [].slice;

ResultOfQuestion = function(name) {
  var returnView;
  returnView = null;
  Tangerine.progress.currentSubview.questionViews.forEach(function(candidateView) {
    if (candidateView.model.get("name") === name) {
      return returnView = candidateView;
    }
  });
  if (returnView === null) {
    throw new ReferenceError("ResultOfQuestion could not find variable " + name);
  }
  if (returnView.answer) {
    return returnView.answer;
  }
  return null;
};

ResultOfMultiple = function(name) {
  var key, ref, result, returnView, value;
  returnView = null;
  Tangerine.progress.currentSubview.questionViews.forEach(function(candidateView) {
    if (candidateView.model.get("name") === name) {
      return returnView = candidateView;
    }
  });
  if (returnView === null) {
    throw new ReferenceError("ResultOfQuestion could not find variable " + name);
  }
  result = [];
  ref = returnView.answer;
  for (key in ref) {
    value = ref[key];
    if (value === "checked") {
      result.push(key);
    }
  }
  return result;
};

ResultOfPrevious = function(name) {
  if (typeof vm.currentView.result === 'undefined') {
    console.log("Using Tangerine.progress.currentSubview");
    return Tangerine.progress.currentSubview.model.parent.result.getVariable(name);
  } else {
    return vm.currentView.result.getVariable(name);
  }
};

ResultOfGrid = function(name) {
  if (typeof vm.currentView.result === 'undefined') {
    console.log("Using Tangerine.progress.currentSubview");
    return Tangerine.progress.currentSubview.model.parent.result.getItemResultCountByVariableName(name, "correct");
  } else {
    return vm.currentView.result.getVariable(name);
  }
};

$.extend(Tangerine, TangerineVersion);

Tangerine.onBackButton = function(event) {
  if (Tangerine.activity === "assessment run") {
    if (confirm(t("NavigationView.message.incomplete_main_screen"))) {
      Tangerine.activity = "";
      return window.history.back();
    } else {
      return false;
    }
  } else {
    return window.history.back();
  }
};

Backbone.View.prototype.close = function() {
  this.remove();
  this.unbind();
  return typeof this.onClose === "function" ? this.onClose() : void 0;
};

Backbone.Collection.prototype.indexBy = function(attr) {
  var result;
  result = {};
  this.models.forEach(function(oneModel) {
    var key;
    if (oneModel.has(attr)) {
      key = oneModel.get(attr);
      if (result[key] == null) {
        result[key] = [];
      }
      return result[key].push(oneModel);
    }
  });
  return result;
};

Backbone.Collection.prototype.indexArrayBy = function(attr) {
  var result;
  result = [];
  this.models.forEach(function(oneModel) {
    var key;
    if (oneModel.has(attr)) {
      key = oneModel.get(attr);
      if (result[key] == null) {
        result[key] = [];
      }
      return result[key].push(oneModel);
    }
  });
  return result;
};

Backbone.Collection.prototype.parse = function(result) {
  return _.pluck(result.rows, 'doc');
};

Backbone.Model.prototype._save = Backbone.Model.prototype.save;

Backbone.Model.prototype.save = function() {
  if (typeof this.beforeSave === "function") {
    this.beforeSave();
  }
  this.stamp();
  return this._save.apply(this, arguments);
};

Backbone.Model.prototype.stamp = function() {
  var ref;
  return this.set({
    editedBy: (typeof Tangerine !== "undefined" && Tangerine !== null ? (ref = Tangerine.user) != null ? ref.name() : void 0 : void 0) || "unknown",
    updated: (new Date()).toString(),
    fromInstanceId: Tangerine.settings.getString("instanceId"),
    collection: this.url
  }, {
    silent: true
  });
};

Backbone.Model.prototype.getNumber = function(key, fallback) {
  if (fallback == null) {
    fallback = 0;
  }
  if (this.has(key)) {
    return parseInt(this.get(key));
  } else {
    return fallback;
  }
};

Backbone.Model.prototype.getArray = function(key, fallback) {
  if (fallback == null) {
    fallback = [];
  }
  if (this.has(key)) {
    return this.get(key);
  } else {
    return fallback;
  }
};

Backbone.Model.prototype.getString = function(key, fallback) {
  if (fallback == null) {
    fallback = '';
  }
  if (this.has(key)) {
    return this.get(key);
  } else {
    return fallback;
  }
};

Backbone.Model.prototype.getEscapedString = function(key, fallback) {
  if (fallback == null) {
    fallback = '';
  }
  if (this.has(key)) {
    return this.escape(key);
  } else {
    return fallback;
  }
};

Backbone.Model.prototype.getBoolean = function(key) {
  if (this.has(key)) {
    return this.get(key) === true || this.get(key) === 'true';
  }
};

(function($) {
  $.fn.scrollTo = function(speed, callback) {
    var e, error1;
    if (speed == null) {
      speed = 250;
    }
    try {
      $('html, body').animate({
        scrollTop: $(this).offset().top + 'px'
      }, speed, null, callback);
    } catch (error1) {
      e = error1;
      console.log("error", e);
      console.log("Scroll error with 'this'", this);
    }
    return this;
  };
  $.fn.topCenter = function() {
    this.css("position", "absolute");
    this.css("top", $(window).scrollTop() + "px");
    return this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
  };
  return $.fn.middleCenter = function() {
    this.css("position", "absolute");
    this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
    return this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
  };
})(jQuery);

String.prototype.safetyDance = function() {
  return this.replace(/\s/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
};

String.prototype.databaseSafetyDance = function() {
  return this.replace(/\s/g, "_").toLowerCase().replace(/[^a-z0-9_-]/g, "");
};

String.prototype.count = function(substring) {
  var ref;
  return ((ref = this.match(new RegExp(substring, "g"))) != null ? ref.length : void 0) || 0;
};

Math.ave = function() {
  var i, len, result, x;
  result = 0;
  for (i = 0, len = arguments.length; i < len; i++) {
    x = arguments[i];
    result += x;
  }
  result /= arguments.length;
  return result;
};

Math.isInt = function() {
  return typeof n === 'number' && parseFloat(n) === parseInt(n, 10) && !isNaN(n);
};

Math.decimals = function(num, decimals) {
  var m;
  m = Math.pow(10, decimals);
  num *= m;
  num = num + num<0?-0.5:+0.5 >> 0;
  return num /= m;
};

Math.commas = function(num) {
  return parseInt(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

Math.limit = function(min, num, max) {
  return Math.max(min, Math.min(num, max));
};

_.isEmptyString = function(aString) {
  if (aString === null) {
    return true;
  }
  if (!(_.isString(aString) || _.isNumber(aString))) {
    return false;
  }
  if (_.isNumber(aString)) {
    aString = String(aString);
  }
  if (aString.replace(/\s*/, '') === '') {
    return true;
  }
  return false;
};

_.indexBy = function(propertyName, objectArray) {
  var i, key, len, oneObject, result;
  result = {};
  for (i = 0, len = objectArray.length; i < len; i++) {
    oneObject = objectArray[i];
    if (oneObject[propertyName] != null) {
      key = oneObject[propertyName];
      if (result[key] == null) {
        result[key] = [];
      }
      result[key].push(oneObject);
    }
  }
  return result;
};

Utils = (function() {
  function Utils() {}

  Utils.execute = function(functions) {
    var step;
    step = function() {
      var nextFunction;
      nextFunction = functions.shift();
      return typeof nextFunction === "function" ? nextFunction(step) : void 0;
    };
    return step();
  };

  Utils.changeLanguage = function(code, callback) {
    return i18n.setLng(code, callback);
  };

  Utils.uploadCompressed = function(docList) {
    var a, allDocsUrl;
    a = document.createElement("a");
    a.href = Tangerine.settings.get("groupHost");
    allDocsUrl = a.protocol + "//" + a.host + "/_cors_bulk_docs/check/" + Tangerine.settings.groupDB;
    return $.ajax({
      url: allDocsUrl,
      type: "POST",
      dataType: "json",
      data: {
        keys: JSON.stringify(docList),
        user: Tangerine.settings.upUser,
        pass: Tangerine.settings.upPass
      },
      error: function(a) {
        return alert("Error connecting");
      },
      success: (function(_this) {
        return function(response) {
          var i, leftToUpload, len, row, rows;
          rows = response.rows;
          leftToUpload = [];
          for (i = 0, len = rows.length; i < len; i++) {
            row = rows[i];
            if (row.error != null) {
              leftToUpload.push(row.key);
            }
          }
          return Tangerine.db.allDocs({
            include_docs: true,
            keys: leftToUpload
          }).then(function(response) {
            var bulkDocsUrl, compressedData, docs;
            docs = {
              "docs": response.rows.map(function(el) {
                return el.doc;
              })
            };
            compressedData = LZString.compressToBase64(JSON.stringify(docs));
            a = document.createElement("a");
            a.href = Tangerine.settings.get("groupHost");
            bulkDocsUrl = a.protocol + "//" + a.host + "/_cors_bulk_docs/upload/" + Tangerine.settings.groupDB;
            return $.ajax({
              type: "POST",
              url: bulkDocsUrl,
              data: compressedData,
              error: (function(_this) {
                return function() {
                  return alert("Server bulk docs error");
                };
              })(this),
              success: (function(_this) {
                return function() {
                  Utils.sticky("Results uploaded");
                };
              })(this)
            });
          });
        };
      })(this)
    });
  };

  Utils.universalUpload = function() {
    var results;
    results = new Results;
    return results.fetch({
      success: function() {
        var docList;
        docList = results.pluck("_id");
        return Utils.uploadCompressed(docList);
      }
    });
  };

  Utils.saveDocListToFile = function() {
    var results;
    results = new Results;
    return results.fetch({
      success: function() {
        var docList;
        docList = results.pluck("_id");
        return Utils.saveRecordsToFile(docList);
      }
    });
  };

  Utils.checkSession = function(url, options) {
    options = options || {};
    return $.ajax({
      type: "GET",
      url: url,
      async: true,
      data: "",
      beforeSend: function(xhr) {
        return xhr.setRequestHeader('Accept', 'application/json');
      },
      complete: function(req) {
        var resp;
        resp = $.parseJSON(req.responseText);
        if (req.status === 200) {
          console.log("Logged in.");
          if (options.success) {
            return options.success(resp);
          }
        } else if (options.error) {
          console.log("Error:" + req.status + " resp.error: " + resp.error);
          return options.error(req.status, resp.error, resp.reason);
        } else {
          return alert("An error occurred getting session info: " + resp.reason);
        }
      }
    });
  };

  Utils.restartTangerine = function(message, callback) {
    Utils.midAlert("" + (message || 'Restarting Tangerine'));
    return _.delay(function() {
      document.location.reload();
      return typeof callback === "function" ? callback() : void 0;
    }, 2000);
  };

  Utils.onUpdateSuccess = function(totalDocs) {
    Utils.documentCounter++;
    if (Utils.documentCounter === totalDocs) {
      Utils.restartTangerine("Update successful", function() {
        Tangerine.router.navigate("", false);
        if (Tangerine.settings.get("context") !== "server") {
          return Utils.askToLogout();
        }
      });
      return Utils.documentCounter = null;
    }
  };

  Utils.log = function(self, error) {
    var className;
    className = self.constructor.toString().match(/function\s*(\w+)/)[1];
    return console.log(className + ": " + error);
  };

  Utils.data = function() {
    var arg, args, key, value;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (args.length === 1) {
      arg = args[0];
      if (_.isString(arg)) {
        return Tangerine.tempData[arg];
      } else if (_.isObject(arg)) {
        return Tangerine.tempData = $.extend(Tangerine.tempData, arg);
      } else if (arg === null) {
        return Tangerine.tempData = {};
      }
    } else if (args.length === 2) {
      key = args[0];
      value = args[1];
      Tangerine.tempData[key] = value;
      return Tangerine.tempData;
    } else if (args.length === 0) {
      return Tangerine.tempData;
    }
  };

  Utils.working = function(isWorking) {
    if (isWorking) {
      if (Tangerine.loadingTimer == null) {
        return Tangerine.loadingTimer = setTimeout(Utils.showLoadingIndicator, 3000);
      }
    } else {
      if (Tangerine.loadingTimer != null) {
        clearTimeout(Tangerine.loadingTimer);
        Tangerine.loadingTimer = null;
      }
      return $(".loading_bar").remove();
    }
  };

  Utils.showLoadingIndicator = function() {
    return $("<div class='loading_bar'><img class='loading' src='images/loading.gif'></div>").appendTo("body").middleCenter();
  };

  Utils.confirm = function(message, options) {
    var ref;
    if (((ref = navigator.notification) != null ? ref.confirm : void 0) != null) {
      navigator.notification.confirm(message, function(input) {
        if (input === 1) {
          return options.callback(true);
        } else if (input === 2) {
          return options.callback(false);
        } else {
          return options.callback(input);
        }
      }, options.title, options.action + ",Cancel");
    } else {
      if (window.confirm(message)) {
        options.callback(true);
        return true;
      } else {
        options.callback(false);
        return false;
      }
    }
    return 0;
  };

  Utils.getValues = function(selector) {
    var values;
    values = {};
    $(selector).find("input[type=text], input[type=password], textarea").each(function(index, element) {
      return values[element.id] = element.value;
    });
    return values;
  };

  Utils.cleanURL = function(url) {
    if ((typeof url.indexOf === "function" ? url.indexOf("%") : void 0) !== -1) {
      return url = decodeURIComponent(url);
    } else {
      return url;
    }
  };

  Utils.topAlert = function(alertText, delay) {
    if (delay == null) {
      delay = 2000;
    }
    return Utils.alert("top", alertText, delay);
  };

  Utils.midAlert = function(alertText, delay) {
    if (delay == null) {
      delay = 2000;
    }
    return Utils.alert("middle", alertText, delay);
  };

  Utils.alert = function(where, alertText, delay) {
    var $alert, aligner, selector;
    if (delay == null) {
      delay = 2000;
    }
    switch (where) {
      case "top":
        selector = ".top_alert";
        aligner = function($el) {
          return $el.topCenter();
        };
        break;
      case "middle":
        selector = ".mid_alert";
        aligner = function($el) {
          return $el.middleCenter();
        };
    }
    if (Utils[where + "AlertTimer"] != null) {
      clearTimeout(Utils[where + "AlertTimer"]);
      $alert = $(selector);
      $alert.html($alert.html() + "<br>" + alertText);
    } else {
      $alert = $("<div class='" + (selector.substring(1)) + " disposable_alert'>" + alertText + "</div>").appendTo("#content");
    }
    aligner($alert);
    return (function($alert, selector, delay) {
      var computedDelay;
      computedDelay = (("" + $alert.html()).match(/<br>/g) || []).length * 1500;
      return Utils[where + "AlertTimer"] = setTimeout(function() {
        Utils[where + "AlertTimer"] = null;
        return $alert.fadeOut(250, function() {
          return $(this).remove();
        });
      }, Math.max(computedDelay, delay));
    })($alert, selector, delay);
  };

  Utils.sticky = function(html, buttonText, callback, position) {
    var div;
    if (buttonText == null) {
      buttonText = "Close";
    }
    if (position == null) {
      position = "middle";
    }
    div = $("<div class='sticky_alert'>" + html + "<br><button class='command parent_remove'>" + buttonText + "</button></div>").appendTo("#content");
    if (position === "middle") {
      div.middleCenter();
    } else if (position === "top") {
      div.topCenter();
    }
    return div.on("keyup", function(event) {
      if (event.which === 27) {
        return $(this).remove();
      }
    }).find("button").click(callback);
  };

  Utils.topSticky = function(html, buttonText, callback) {
    if (buttonText == null) {
      buttonText = "Close";
    }
    return Utils.sticky(html, buttonText, callback, "top");
  };

  Utils.modal = function(html) {
    if (html === false) {
      $("#modal_back, #modal").remove();
      return;
    }
    $("body").prepend("<div id='modal_back'></div>");
    return $("<div id='modal'>" + html + "</div>").appendTo("#content").middleCenter().on("keyup", function(event) {
      if (event.which === 27) {
        return $("#modal_back, #modal").remove();
      }
    });
  };

  Utils.passwordPrompt = function(callback) {
    var $button, $pass, html;
    html = "<div id='pass_form' title='User verification'> <label for='password'>Please re-enter your password</label> <input id='pass_val' type='password' name='password' id='password' value=''> <button class='command' data-verify='true'>Verify</button> <button class='command'>Cancel</button> </div>";
    Utils.modal(html);
    $pass = $("#pass_val");
    $button = $("#pass_valform button");
    $pass.on("keyup", function(event) {
      if (event.which !== 13) {
        return true;
      }
      $button.off("click");
      $pass.off("change");
      callback($pass.val());
      return Utils.modal(false);
    });
    return $button.on("click", function(event) {
      $button.off("click");
      $pass.off("change");
      if ($(event.target).attr("data-verify") === "true") {
        callback($pass.val());
      }
      return Utils.modal(false);
    });
  };

  Utils.guid = function() {
    return this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4();
  };

  Utils.S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  Utils.humanGUID = function() {
    return this.randomLetters(4) + "-" + this.randomLetters(4) + "-" + this.randomLetters(4);
  };

  Utils.safeLetters = "abcdefghijlmnopqrstuvwxyz".split("");

  Utils.randomLetters = function(length) {
    var result;
    result = "";
    while (length--) {
      result += Utils.safeLetters[Math.floor(Math.random() * Utils.safeLetters.length)];
    }
    return result;
  };

  Utils.flash = function(color, shouldTurnItOn) {
    if (color == null) {
      color = "red";
    }
    if (shouldTurnItOn == null) {
      shouldTurnItOn = null;
    }
    if (shouldTurnItOn == null) {
      Utils.background(color);
      return setTimeout(function() {
        return Utils.background("");
      }, 1000);
    }
  };

  Utils.background = function(color) {
    if (color != null) {
      return $("#content_wrapper").css({
        "backgroundColor": color
      });
    } else {
      return $("#content_wrapper").css("backgroundColor");
    }
  };

  Utils.$_GET = function(q, s) {
    var parts, vars;
    vars = {};
    parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
      value = ~value.indexOf("#") ? value.split("#")[0] : value;
      return vars[key] = value.split("#")[0];
    });
    return vars;
  };

  Utils.resizeScrollPane = function() {
    return $(".scroll_pane").height($(window).height() - ($("#navigation").height() + $("#footer").height() + 100));
  };

  Utils.askToLogout = function() {
    if (confirm("Would you like to logout now?")) {
      return Tangerine.user.logout();
    }
  };

  Utils.updateFromServer = function(model) {
    var dKey, sourceDB, sourceDKey, targetDB;
    dKey = model.id.substr(-5, 5);
    this.trigger("status", "import lookup");
    sourceDB = Tangerine.settings.urlDB("group");
    targetDB = Tangerine.conf.db_name;
    sourceDKey = Tangerine.settings.urlView("group", "byDKey");

    /*
    Gets a list of documents on both the server and locally. Then replicates all by id.
     */
    return $.ajax({
      url: sourceDKey,
      type: "POST",
      dataType: "json",
      data: JSON.stringify({
        keys: dKey
      }),
      error: function(a, b) {
        return model.trigger("status", "import error", a + " " + b);
      },
      success: function(data) {
        var docList;
        docList = data.rows.reduce((function(obj, cur) {
          return obj[cur.id] = true;
        }), {});
        return Tangerine.db.query(Tangerine.conf.design_doc + "/byDKey", {
          key: dKey
        }).then(function(response) {
          if (response.rows == null) {
            console.warn(response);
          }
          docList = data.rows.reduce((function(obj, cur) {
            return obj[cur.id] = true;
          }), docList);
          docList = Object.keys(docList);
          return $.couch.replicate(sourceDB, targetDB, {
            success: function(response) {
              return model.trigger("status", "import success", response);
            },
            error: function(a, b) {
              return model.trigger("status", "import error", a + " " + b);
            }
          }, {
            doc_ids: docList
          });
        });
      }
    });
  };

  Utils.loadDevelopmentPacks = function(callback) {
    return $.ajax({
      dataType: "json",
      url: "packs.json",
      error: function(res) {
        return callback(res);
      },
      success: function(res) {
        return Tangerine.db.bulkDocs(res, function(error, doc) {
          if (error) {
            return callback(error);
          } else {
            return callback();
          }
        });
      }
    });
  };

  return Utils;

})();

Robbert = (function() {
  function Robbert() {}

  Robbert.request = function(options) {
    var error, success;
    success = options.success;
    error = options.error;
    delete options.success;
    delete options.error;
    return $.ajax({
      type: "POST",
      crossDomain: true,
      url: Tangerine.config.get("robbert"),
      dataType: "json",
      data: options,
      success: (function(_this) {
        return function(data) {
          return success(data);
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return error(data);
        };
      })(this)
    });
  };

  return Robbert;

})();

TangerineTree = (function() {
  function TangerineTree() {}

  TangerineTree.make = function(options) {
    var error, success;
    Utils.working(true);
    success = options.success;
    error = options.error;
    delete options.success;
    delete options.error;
    options.user = Tangerine.user.name();
    return $.ajax({
      type: "POST",
      crossDomain: true,
      url: Tangerine.config.get("tree") + ("make/" + (Tangerine.settings.get('groupName'))),
      dataType: "json",
      data: options,
      success: (function(_this) {
        return function(data) {
          return success(data);
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return error(data, JSON.parse(data.responseText));
        };
      })(this),
      complete: function() {
        return Utils.working(false);
      }
    });
  };

  return TangerineTree;

})();

$(function() {
  $("#content").on("click", ".clear_message", null, function(a) {
    return $(a.target).parent().fadeOut(250, function() {
      return $(this).empty().show();
    });
  });
  $("#content").on("click", ".parent_remove", null, function(a) {
    return $(a.target).parent().fadeOut(250, function() {
      return $(this).remove();
    });
  });
  $("#content").on("click", ".alert_button", function() {
    var alert_text;
    alert_text = $(this).attr("data-alert") ? $(this).attr("data-alert") : $(this).val();
    return Utils.disposableAlert(alert_text);
  });
  return $("#content").on("click", ".disposable_alert", function() {
    return $(this).stop().fadeOut(100, function() {
      return $(this).remove();
    });
  });
});

Handlebars.registerHelper('gridLabel', function(items, itemMap, index) {
  return _.escape(items[itemMap[index]]);
});

Handlebars.registerHelper('startRow', function(index) {
  console.log("index: " + index);
  if (index === 0) {
    return "<tr>";
  }
});

Handlebars.registerHelper('endRow', function(index) {
  console.log("index: " + index);
  if (index === 0) {
    return "</tr>";
  }
});

Handlebars.registerHelper('startCell', function(index) {
  console.log("index: " + index);
  if (index === 0) {
    return "<td></td>";
  }
});

Handlebars.logger.log = function(level) {
  if (level >= Handlebars.logger.level) {
    return console.log.apply(console, [].concat(["Handlebars: "], _.toArray(arguments)));
  }
};

Handlebars.registerHelper('log', Handlebars.logger.log);

Handlebars.logger.level = 3;

Handlebars.registerHelper("debug", function(optionalValue) {
  console.log("Current Context");
  console.log("====================");
  console.log(this);
  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    return console.log(optionalValue);
  }
});

Handlebars.registerHelper('monthDropdown', function(months, currentMonth) {
  var i, len, month, renderOption, results1;
  renderOption = function(month, currentMonth) {
    var out;
    out = "<option value='" + month + "'";
    if (month === currentMonth) {
      out = out + "selected='selected'";
    }
    out = out + ">" + month.titleize() + "</option>";
    return out;
  };
  results1 = [];
  for (i = 0, len = months.length; i < len; i++) {
    month = months[i];
    results1.push(renderOption(month, currentMonth));
  }
  return results1;
});

//# sourceMappingURL=data:application/json;base64,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QW1DLFNBQUMsYUFBRDtFQUNqQyxPQUFPLENBQUMsR0FBUixDQUFZLGlCQUFaO0VBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxzQkFBWjtFQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWjtFQUVBLElBQUcsYUFBSDtJQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWjtJQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksc0JBQVo7V0FDQSxPQUFPLENBQUMsR0FBUixDQUFZLGFBQVosRUFIRjs7QUFMaUMsQ0FBbkM7O0FBV0EsVUFBVSxDQUFDLGNBQVgsQ0FBMEIsZUFBMUIsRUFBMkMsU0FBQyxNQUFELEVBQVMsWUFBVDtBQUN6QyxNQUFBO0VBQUEsWUFBQSxHQUFlLFNBQUMsS0FBRCxFQUFRLFlBQVI7QUFDYixRQUFBO0lBQUEsR0FBQSxHQUFNLGlCQUFBLEdBQW9CLEtBQXBCLEdBQTRCO0lBQ2xDLElBQUcsS0FBQSxLQUFTLFlBQVo7TUFDRSxHQUFBLEdBQU0sR0FBQSxHQUFNLHNCQURkOztJQUVBLEdBQUEsR0FBTSxHQUFBLEdBQU8sR0FBUCxHQUFhLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBYixHQUFnQztBQUN0QyxXQUFPO0VBTE07QUFNZjtPQUFBLHdDQUFBOztrQkFBQSxZQUFBLENBQWEsS0FBYixFQUFvQixZQUFwQjtBQUFBOztBQVB5QyxDQUEzQyIsImZpbGUiOiJoZWxwZXJzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiI1xuIyBTa2lwIGxvZ2ljXG4jXG5cbiMgdGhlc2UgY291bGQgZWFzaWx5IGJlIHJlZmFjdG9yZWQgaW50byBvbmUuXG5cblJlc3VsdE9mUXVlc3Rpb24gPSAobmFtZSkgLT5cbiAgcmV0dXJuVmlldyA9IG51bGxcbiMgIHZpZXdNYXN0ZXIuc3VidGVzdFZpZXdzW2luZGV4XS5wcm90b3R5cGVWaWV3LnF1ZXN0aW9uVmlld3MuZm9yRWFjaCAoY2FuZGlkYXRlVmlldykgLT5cbiAgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3LnF1ZXN0aW9uVmlld3MuZm9yRWFjaCAoY2FuZGlkYXRlVmlldykgLT5cbiAgICBpZiBjYW5kaWRhdGVWaWV3Lm1vZGVsLmdldChcIm5hbWVcIikgPT0gbmFtZVxuICAgICAgcmV0dXJuVmlldyA9IGNhbmRpZGF0ZVZpZXdcbiAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiUmVzdWx0T2ZRdWVzdGlvbiBjb3VsZCBub3QgZmluZCB2YXJpYWJsZSAje25hbWV9XCIpIGlmIHJldHVyblZpZXcgPT0gbnVsbFxuICByZXR1cm4gcmV0dXJuVmlldy5hbnN3ZXIgaWYgcmV0dXJuVmlldy5hbnN3ZXJcbiAgcmV0dXJuIG51bGxcblxuUmVzdWx0T2ZNdWx0aXBsZSA9IChuYW1lKSAtPlxuICByZXR1cm5WaWV3ID0gbnVsbFxuIyAgdmlld01hc3Rlci5zdWJ0ZXN0Vmlld3NbaW5kZXhdLnByb3RvdHlwZVZpZXcucXVlc3Rpb25WaWV3cy5mb3JFYWNoIChjYW5kaWRhdGVWaWV3KSAtPlxuICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcucXVlc3Rpb25WaWV3cy5mb3JFYWNoIChjYW5kaWRhdGVWaWV3KSAtPlxuICAgIGlmIGNhbmRpZGF0ZVZpZXcubW9kZWwuZ2V0KFwibmFtZVwiKSA9PSBuYW1lXG4gICAgICByZXR1cm5WaWV3ID0gY2FuZGlkYXRlVmlld1xuICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJSZXN1bHRPZlF1ZXN0aW9uIGNvdWxkIG5vdCBmaW5kIHZhcmlhYmxlICN7bmFtZX1cIikgaWYgcmV0dXJuVmlldyA9PSBudWxsXG5cbiAgcmVzdWx0ID0gW11cbiAgZm9yIGtleSwgdmFsdWUgb2YgcmV0dXJuVmlldy5hbnN3ZXJcbiAgICByZXN1bHQucHVzaCBrZXkgaWYgdmFsdWUgPT0gXCJjaGVja2VkXCJcbiAgcmV0dXJuIHJlc3VsdFxuXG5SZXN1bHRPZlByZXZpb3VzID0gKG5hbWUpIC0+XG4gIGlmIHR5cGVvZiB2bS5jdXJyZW50Vmlldy5yZXN1bHQgPT0gJ3VuZGVmaW5lZCdcbiAgICBjb25zb2xlLmxvZyhcIlVzaW5nIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1wiKVxuICAgIHJldHVybiBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcubW9kZWwucGFyZW50LnJlc3VsdC5nZXRWYXJpYWJsZShuYW1lKVxuICBlbHNlXG4gICAgcmV0dXJuIHZtLmN1cnJlbnRWaWV3LnJlc3VsdC5nZXRWYXJpYWJsZShuYW1lKVxuXG5SZXN1bHRPZkdyaWQgPSAobmFtZSkgLT5cbiAgaWYgdHlwZW9mIHZtLmN1cnJlbnRWaWV3LnJlc3VsdCA9PSAndW5kZWZpbmVkJ1xuICAgIGNvbnNvbGUubG9nKFwiVXNpbmcgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XCIpXG4gICAgcmV0dXJuIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlldy5tb2RlbC5wYXJlbnQucmVzdWx0LmdldEl0ZW1SZXN1bHRDb3VudEJ5VmFyaWFibGVOYW1lKG5hbWUsIFwiY29ycmVjdFwiKVxuICBlbHNlXG4gICAgcmV0dXJuIHZtLmN1cnJlbnRWaWV3LnJlc3VsdC5nZXRWYXJpYWJsZShuYW1lKVxuI1xuIyBUYW5nZXJpbmUgYmFja2J1dHRvbiBoYW5kbGVyXG4jXG4kLmV4dGVuZChUYW5nZXJpbmUsVGFuZ2VyaW5lVmVyc2lvbilcblRhbmdlcmluZS5vbkJhY2tCdXR0b24gPSAoZXZlbnQpIC0+XG4gIGlmIFRhbmdlcmluZS5hY3Rpdml0eSA9PSBcImFzc2Vzc21lbnQgcnVuXCJcbiAgICBpZiBjb25maXJtIHQoXCJOYXZpZ2F0aW9uVmlldy5tZXNzYWdlLmluY29tcGxldGVfbWFpbl9zY3JlZW5cIilcbiAgICAgIFRhbmdlcmluZS5hY3Rpdml0eSA9IFwiXCJcbiAgICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICBlbHNlXG4gICAgd2luZG93Lmhpc3RvcnkuYmFjaygpXG5cblxuXG4jIEV4dGVuZCBldmVyeSB2aWV3IHdpdGggYSBjbG9zZSBtZXRob2QsIHVzZWQgYnkgVmlld01hbmFnZXJcbkJhY2tib25lLlZpZXcucHJvdG90eXBlLmNsb3NlID0gLT5cbiAgQHJlbW92ZSgpXG4gIEB1bmJpbmQoKVxuICBAb25DbG9zZT8oKVxuXG5cblxuIyBSZXR1cm5zIGFuIG9iamVjdCBoYXNoZWQgYnkgYSBnaXZlbiBhdHRyaWJ1dGUuXG5CYWNrYm9uZS5Db2xsZWN0aW9uLnByb3RvdHlwZS5pbmRleEJ5ID0gKCBhdHRyICkgLT5cbiAgcmVzdWx0ID0ge31cbiAgQG1vZGVscy5mb3JFYWNoIChvbmVNb2RlbCkgLT5cbiAgICBpZiBvbmVNb2RlbC5oYXMoYXR0cilcbiAgICAgIGtleSA9IG9uZU1vZGVsLmdldChhdHRyKVxuICAgICAgcmVzdWx0W2tleV0gPSBbXSBpZiBub3QgcmVzdWx0W2tleV0/XG4gICAgICByZXN1bHRba2V5XS5wdXNoKG9uZU1vZGVsKVxuICByZXR1cm4gcmVzdWx0XG5cbiMgUmV0dXJucyBhbiBvYmplY3QgaGFzaGVkIGJ5IGEgZ2l2ZW4gYXR0cmlidXRlLlxuQmFja2JvbmUuQ29sbGVjdGlvbi5wcm90b3R5cGUuaW5kZXhBcnJheUJ5ID0gKCBhdHRyICkgLT5cbiAgcmVzdWx0ID0gW11cbiAgQG1vZGVscy5mb3JFYWNoIChvbmVNb2RlbCkgLT5cbiAgICBpZiBvbmVNb2RlbC5oYXMoYXR0cilcbiAgICAgIGtleSA9IG9uZU1vZGVsLmdldChhdHRyKVxuICAgICAgcmVzdWx0W2tleV0gPSBbXSBpZiBub3QgcmVzdWx0W2tleV0/XG4gICAgICByZXN1bHRba2V5XS5wdXNoKG9uZU1vZGVsKVxuICByZXR1cm4gcmVzdWx0XG5cblxuIyBUaGlzIGlzIGZvciBQb3VjaERCJ3Mgc3R5bGUgb2YgcmV0dXJuaW5nIGRvY3VtZW50c1xuQmFja2JvbmUuQ29sbGVjdGlvbi5wcm90b3R5cGUucGFyc2UgPSAocmVzdWx0KSAtPlxuICByZXR1cm4gXy5wbHVjayByZXN1bHQucm93cywgJ2RvYydcblxuXG4jIGJ5IGRlZmF1bHQgYWxsIG1vZGVscyB3aWxsIHNhdmUgYSB0aW1lc3RhbXAgYW5kIGhhc2ggb2Ygc2lnbmlmaWNhbnQgYXR0cmlidXRlc1xuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLl9zYXZlID0gQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnNhdmVcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5zYXZlID0gLT5cbiAgQGJlZm9yZVNhdmU/KClcbiAgQHN0YW1wKClcbiAgQF9zYXZlLmFwcGx5KEAsIGFyZ3VtZW50cylcblxuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnN0YW1wID0gLT5cbiAgQHNldFxuICAgIGVkaXRlZEJ5IDogVGFuZ2VyaW5lPy51c2VyPy5uYW1lKCkgfHwgXCJ1bmtub3duXCJcbiAgICB1cGRhdGVkIDogKG5ldyBEYXRlKCkpLnRvU3RyaW5nKClcbiAgICBmcm9tSW5zdGFuY2VJZCA6IFRhbmdlcmluZS5zZXR0aW5ncy5nZXRTdHJpbmcoXCJpbnN0YW5jZUlkXCIpXG4gICAgY29sbGVjdGlvbiA6IEB1cmxcbiAgLCBzaWxlbnQ6IHRydWVcblxuXG4jXG4jIFRoaXMgc2VyaWVzIG9mIGZ1bmN0aW9ucyByZXR1cm5zIHByb3BlcnRpZXMgd2l0aCBkZWZhdWx0IHZhbHVlcyBpZiBubyBwcm9wZXJ0eSBpcyBmb3VuZFxuIyBAZ290Y2hhIGJlIG1pbmRmdWwgb2YgdGhlIGRlZmF1bHQgXCJibGFua1wiIHZhbHVlcyBzZXQgaGVyZVxuI1xuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldE51bWJlciA9ICAgICAgICAoa2V5LCBmYWxsYmFjayA9IDApICAtPiByZXR1cm4gaWYgQGhhcyhrZXkpIHRoZW4gcGFyc2VJbnQoQGdldChrZXkpKSBlbHNlIGZhbGxiYWNrXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZ2V0QXJyYXkgPSAgICAgICAgIChrZXksIGZhbGxiYWNrID0gW10pIC0+IHJldHVybiBpZiBAaGFzKGtleSkgdGhlbiBAZ2V0KGtleSkgICAgICAgICAgIGVsc2UgZmFsbGJhY2tcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5nZXRTdHJpbmcgPSAgICAgICAgKGtleSwgZmFsbGJhY2sgPSAnJykgLT4gcmV0dXJuIGlmIEBoYXMoa2V5KSB0aGVuIEBnZXQoa2V5KSAgICAgICAgICAgZWxzZSBmYWxsYmFja1xuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldEVzY2FwZWRTdHJpbmcgPSAoa2V5LCBmYWxsYmFjayA9ICcnKSAtPiByZXR1cm4gaWYgQGhhcyhrZXkpIHRoZW4gQGVzY2FwZShrZXkpICAgICAgICBlbHNlIGZhbGxiYWNrXG4jIHRoaXMgc2VlbXMgdG9vIGltcG9ydGFudCB0byB1c2UgYSBkZWZhdWx0XG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZ2V0Qm9vbGVhbiA9ICAgICAgIChrZXkpIC0+IHJldHVybiBpZiBAaGFzKGtleSkgdGhlbiAoQGdldChrZXkpID09IHRydWUgb3IgQGdldChrZXkpID09ICd0cnVlJylcblxuXG4jXG4jIGhhbmR5IGpxdWVyeSBmdW5jdGlvbnNcbiNcbiggKCQpIC0+XG5cbiAgJC5mbi5zY3JvbGxUbyA9IChzcGVlZCA9IDI1MCwgY2FsbGJhY2spIC0+XG4gICAgdHJ5XG4gICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSB7XG4gICAgICAgIHNjcm9sbFRvcDogJChAKS5vZmZzZXQoKS50b3AgKyAncHgnXG4gICAgICAgIH0sIHNwZWVkLCBudWxsLCBjYWxsYmFja1xuICAgIGNhdGNoIGVcbiAgICAgIGNvbnNvbGUubG9nIFwiZXJyb3JcIiwgZVxuICAgICAgY29uc29sZS5sb2cgXCJTY3JvbGwgZXJyb3Igd2l0aCAndGhpcydcIiwgQFxuXG4gICAgcmV0dXJuIEBcblxuICAjIHBsYWNlIHNvbWV0aGluZyB0b3AgYW5kIGNlbnRlclxuICAkLmZuLnRvcENlbnRlciA9IC0+XG4gICAgQGNzcyBcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIlxuICAgIEBjc3MgXCJ0b3BcIiwgJCh3aW5kb3cpLnNjcm9sbFRvcCgpICsgXCJweFwiXG4gICAgQGNzcyBcImxlZnRcIiwgKCgkKHdpbmRvdykud2lkdGgoKSAtIEBvdXRlcldpZHRoKCkpIC8gMikgKyAkKHdpbmRvdykuc2Nyb2xsTGVmdCgpICsgXCJweFwiXG5cbiAgIyBwbGFjZSBzb21ldGhpbmcgbWlkZGxlIGNlbnRlclxuICAkLmZuLm1pZGRsZUNlbnRlciA9IC0+XG4gICAgQGNzcyBcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIlxuICAgIEBjc3MgXCJ0b3BcIiwgKCgkKHdpbmRvdykuaGVpZ2h0KCkgLSB0aGlzLm91dGVySGVpZ2h0KCkpIC8gMikgKyAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgKyBcInB4XCJcbiAgICBAY3NzIFwibGVmdFwiLCAoKCQod2luZG93KS53aWR0aCgpIC0gdGhpcy5vdXRlcldpZHRoKCkpIC8gMikgKyAkKHdpbmRvdykuc2Nyb2xsTGVmdCgpICsgXCJweFwiXG5cblxuKShqUXVlcnkpXG5cblxuU3RyaW5nLnByb3RvdHlwZS5zYWZldHlEYW5jZSA9IC0+IHRoaXMucmVwbGFjZSgvXFxzL2csIFwiX1wiKS5yZXBsYWNlKC9bXmEtekEtWjAtOV9dL2csXCJcIilcblN0cmluZy5wcm90b3R5cGUuZGF0YWJhc2VTYWZldHlEYW5jZSA9IC0+IHRoaXMucmVwbGFjZSgvXFxzL2csIFwiX1wiKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teYS16MC05Xy1dL2csXCJcIilcblN0cmluZy5wcm90b3R5cGUuY291bnQgPSAoc3Vic3RyaW5nKSAtPiB0aGlzLm1hdGNoKG5ldyBSZWdFeHAgc3Vic3RyaW5nLCBcImdcIik/Lmxlbmd0aCB8fCAwXG5cblxuTWF0aC5hdmUgPSAtPlxuICByZXN1bHQgPSAwXG4gIHJlc3VsdCArPSB4IGZvciB4IGluIGFyZ3VtZW50c1xuICByZXN1bHQgLz0gYXJndW1lbnRzLmxlbmd0aFxuICByZXR1cm4gcmVzdWx0XG5cbk1hdGguaXNJbnQgICAgPSAtPiByZXR1cm4gdHlwZW9mIG4gPT0gJ251bWJlcicgJiYgcGFyc2VGbG9hdChuKSA9PSBwYXJzZUludChuLCAxMCkgJiYgIWlzTmFOKG4pXG5NYXRoLmRlY2ltYWxzID0gKG51bSwgZGVjaW1hbHMpIC0+IG0gPSBNYXRoLnBvdyggMTAsIGRlY2ltYWxzICk7IG51bSAqPSBtOyBudW0gPSAgbnVtKyhgbnVtPDA/LTAuNTorMC41YCk+PjA7IG51bSAvPSBtXG5NYXRoLmNvbW1hcyAgID0gKG51bSkgLT4gcGFyc2VJbnQobnVtKS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLFwiKVxuTWF0aC5saW1pdCAgICA9IChtaW4sIG51bSwgbWF4KSAtPiBNYXRoLm1heChtaW4sIE1hdGgubWluKG51bSwgbWF4KSlcblxuIyBtZXRob2QgbmFtZSBzbGlnaHRseSBtaXNsZWFkaW5nXG4jIHJldHVybnMgdHJ1ZSBmb3IgZmFsc3kgdmFsdWVzXG4jICAgbnVsbCwgdW5kZWZpbmVkLCBhbmQgJ1xccyonXG4jIG90aGVyIGZhbHNlIHZhbHVlcyBsaWtlXG4jICAgZmFsc2UsIDBcbiMgcmV0dXJuIGZhbHNlXG5fLmlzRW1wdHlTdHJpbmcgPSAoIGFTdHJpbmcgKSAtPlxuICByZXR1cm4gdHJ1ZSBpZiBhU3RyaW5nIGlzIG51bGxcbiAgcmV0dXJuIGZhbHNlIHVubGVzcyBfLmlzU3RyaW5nKGFTdHJpbmcpIG9yIF8uaXNOdW1iZXIoYVN0cmluZylcbiAgYVN0cmluZyA9IFN0cmluZyhhU3RyaW5nKSBpZiBfLmlzTnVtYmVyKGFTdHJpbmcpXG4gIHJldHVybiB0cnVlIGlmIGFTdHJpbmcucmVwbGFjZSgvXFxzKi8sICcnKSA9PSAnJ1xuICByZXR1cm4gZmFsc2VcblxuXy5pbmRleEJ5ID0gKCBwcm9wZXJ0eU5hbWUsIG9iamVjdEFycmF5ICkgLT5cbiAgcmVzdWx0ID0ge31cbiAgZm9yIG9uZU9iamVjdCBpbiBvYmplY3RBcnJheVxuICAgIGlmIG9uZU9iamVjdFtwcm9wZXJ0eU5hbWVdP1xuICAgICAga2V5ID0gb25lT2JqZWN0W3Byb3BlcnR5TmFtZV1cbiAgICAgIHJlc3VsdFtrZXldID0gW10gaWYgbm90IHJlc3VsdFtrZXldP1xuICAgICAgcmVzdWx0W2tleV0ucHVzaChvbmVPYmplY3QpXG4gIHJldHVybiByZXN1bHRcblxuXG5jbGFzcyBVdGlsc1xuXG4gIEBleGVjdXRlOiAoIGZ1bmN0aW9ucyApIC0+XG5cbiAgICBzdGVwID0gLT5cbiAgICAgIG5leHRGdW5jdGlvbiA9IGZ1bmN0aW9ucy5zaGlmdCgpXG4gICAgICBuZXh0RnVuY3Rpb24/KHN0ZXApXG4gICAgc3RlcCgpXG5cbiAgQGNoYW5nZUxhbmd1YWdlIDogKGNvZGUsIGNhbGxiYWNrKSAtPlxuICAgIGkxOG4uc2V0TG5nIGNvZGUsIGNhbGxiYWNrXG5cblxuICBAdXBsb2FkQ29tcHJlc3NlZDogKGRvY0xpc3QpIC0+XG5cbiAgICBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIilcbiAgICBhLmhyZWYgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBIb3N0XCIpXG4gICAgYWxsRG9jc1VybCA9IFwiI3thLnByb3RvY29sfS8vI3thLmhvc3R9L19jb3JzX2J1bGtfZG9jcy9jaGVjay8je1RhbmdlcmluZS5zZXR0aW5ncy5ncm91cERCfVwiXG5cbiAgICByZXR1cm4gJC5hamF4XG4gICAgICB1cmw6IGFsbERvY3NVcmxcbiAgICAgIHR5cGU6IFwiUE9TVFwiXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIGRhdGE6XG4gICAgICAgIGtleXM6IEpTT04uc3RyaW5naWZ5KGRvY0xpc3QpXG4gICAgICAgIHVzZXI6IFRhbmdlcmluZS5zZXR0aW5ncy51cFVzZXJcbiAgICAgICAgcGFzczogVGFuZ2VyaW5lLnNldHRpbmdzLnVwUGFzc1xuICAgICAgZXJyb3I6IChhKSAtPlxuICAgICAgICBhbGVydCBcIkVycm9yIGNvbm5lY3RpbmdcIlxuICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PlxuXG4gICAgICAgIHJvd3MgPSByZXNwb25zZS5yb3dzXG4gICAgICAgIGxlZnRUb1VwbG9hZCA9IFtdXG4gICAgICAgIGZvciByb3cgaW4gcm93c1xuICAgICAgICAgIGxlZnRUb1VwbG9hZC5wdXNoKHJvdy5rZXkpIGlmIHJvdy5lcnJvcj9cblxuICAgICAgICAjIGlmIGl0J3MgYWxyZWFkeSBmdWxseSB1cGxvYWRlZFxuICAgICAgICAjIG1ha2Ugc3VyZSBpdCdzIGluIHRoZSBsb2dcblxuICAgICAgICBUYW5nZXJpbmUuZGIuYWxsRG9jcyhpbmNsdWRlX2RvY3M6dHJ1ZSxrZXlzOmxlZnRUb1VwbG9hZFxuICAgICAgICApLnRoZW4oIChyZXNwb25zZSkgLT5cbiAgICAgICAgICBkb2NzID0ge1wiZG9jc1wiOnJlc3BvbnNlLnJvd3MubWFwKChlbCktPmVsLmRvYyl9XG4gICAgICAgICAgY29tcHJlc3NlZERhdGEgPSBMWlN0cmluZy5jb21wcmVzc1RvQmFzZTY0KEpTT04uc3RyaW5naWZ5KGRvY3MpKVxuICAgICAgICAgIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKVxuICAgICAgICAgIGEuaHJlZiA9IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJncm91cEhvc3RcIilcbiAgICAgICAgICBidWxrRG9jc1VybCA9IFwiI3thLnByb3RvY29sfS8vI3thLmhvc3R9L19jb3JzX2J1bGtfZG9jcy91cGxvYWQvI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ3JvdXBEQn1cIlxuXG4gICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICB0eXBlIDogXCJQT1NUXCJcbiAgICAgICAgICAgIHVybCA6IGJ1bGtEb2NzVXJsXG4gICAgICAgICAgICBkYXRhIDogY29tcHJlc3NlZERhdGFcbiAgICAgICAgICAgIGVycm9yOiA9PlxuICAgICAgICAgICAgICBhbGVydCBcIlNlcnZlciBidWxrIGRvY3MgZXJyb3JcIlxuICAgICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgICAgVXRpbHMuc3RpY2t5IFwiUmVzdWx0cyB1cGxvYWRlZFwiXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICApXG5cblxuICBAdW5pdmVyc2FsVXBsb2FkOiAtPlxuICAgIHJlc3VsdHMgPSBuZXcgUmVzdWx0c1xuICAgIHJlc3VsdHMuZmV0Y2hcbiAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgIGRvY0xpc3QgPSByZXN1bHRzLnBsdWNrKFwiX2lkXCIpXG4gICAgICAgIFV0aWxzLnVwbG9hZENvbXByZXNzZWQoZG9jTGlzdClcblxuICBAc2F2ZURvY0xpc3RUb0ZpbGU6IC0+XG4gICAgcmVzdWx0cyA9IG5ldyBSZXN1bHRzXG4gICAgcmVzdWx0cy5mZXRjaFxuICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgZG9jTGlzdCA9IHJlc3VsdHMucGx1Y2soXCJfaWRcIilcbiAgICAgICAgVXRpbHMuc2F2ZVJlY29yZHNUb0ZpbGUoZG9jTGlzdClcblxuICBAY2hlY2tTZXNzaW9uOiAodXJsLCBvcHRpb25zKSAtPlxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICQuYWpheFxuICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgIHVybDogIHVybCxcbiAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgZGF0YTogXCJcIixcbiAgICAgIGJlZm9yZVNlbmQ6ICh4aHIpLT5cbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICxcbiAgICAgIGNvbXBsZXRlOiAocmVxKSAtPlxuICAgICAgICByZXNwID0gJC5wYXJzZUpTT04ocmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIGlmIChyZXEuc3RhdHVzID09IDIwMClcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dlZCBpbi5cIilcbiAgICAgICAgICBpZiBvcHRpb25zLnN1Y2Nlc3NcbiAgICAgICAgICAgIG9wdGlvbnMuc3VjY2VzcyhyZXNwKVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmVycm9yKVxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6XCIgKyByZXEuc3RhdHVzICsgXCIgcmVzcC5lcnJvcjogXCIgKyByZXNwLmVycm9yKVxuICAgICAgICAgIG9wdGlvbnMuZXJyb3IocmVxLnN0YXR1cywgcmVzcC5lcnJvciwgcmVzcC5yZWFzb24pO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgYWxlcnQoXCJBbiBlcnJvciBvY2N1cnJlZCBnZXR0aW5nIHNlc3Npb24gaW5mbzogXCIgKyByZXNwLnJlYXNvbilcblxuICBAcmVzdGFydFRhbmdlcmluZTogKG1lc3NhZ2UsIGNhbGxiYWNrKSAtPlxuICAgIFV0aWxzLm1pZEFsZXJ0IFwiI3ttZXNzYWdlIHx8ICdSZXN0YXJ0aW5nIFRhbmdlcmluZSd9XCJcbiAgICBfLmRlbGF5KCAtPlxuICAgICAgZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKClcbiAgICAgIGNhbGxiYWNrPygpXG4gICAgLCAyMDAwIClcblxuICBAb25VcGRhdGVTdWNjZXNzOiAodG90YWxEb2NzKSAtPlxuICAgIFV0aWxzLmRvY3VtZW50Q291bnRlcisrXG4gICAgaWYgVXRpbHMuZG9jdW1lbnRDb3VudGVyID09IHRvdGFsRG9jc1xuICAgICAgVXRpbHMucmVzdGFydFRhbmdlcmluZSBcIlVwZGF0ZSBzdWNjZXNzZnVsXCIsIC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJcIiwgZmFsc2VcbiAgICAgICAgVXRpbHMuYXNrVG9Mb2dvdXQoKSB1bmxlc3MgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgPT0gXCJzZXJ2ZXJcIlxuICAgICAgVXRpbHMuZG9jdW1lbnRDb3VudGVyID0gbnVsbFxuXG5cbiAgQGxvZzogKHNlbGYsIGVycm9yKSAtPlxuICAgIGNsYXNzTmFtZSA9IHNlbGYuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvZnVuY3Rpb25cXHMqKFxcdyspLylbMV1cbiAgICBjb25zb2xlLmxvZyBcIiN7Y2xhc3NOYW1lfTogI3tlcnJvcn1cIlxuXG4gICMgaWYgYXJncyBpcyBvbmUgb2JqZWN0IHNhdmUgaXQgdG8gdGVtcG9yYXJ5IGhhc2hcbiAgIyBpZiB0d28gc3RyaW5ncywgc2F2ZSBrZXkgdmFsdWUgcGFpclxuICAjIGlmIG9uZSBzdHJpbmcsIHVzZSBhcyBrZXksIHJldHVybiB2YWx1ZVxuICBAZGF0YTogKGFyZ3MuLi4pIC0+XG4gICAgaWYgYXJncy5sZW5ndGggPT0gMVxuICAgICAgYXJnID0gYXJnc1swXVxuICAgICAgaWYgXy5pc1N0cmluZyhhcmcpXG4gICAgICAgIHJldHVybiBUYW5nZXJpbmUudGVtcERhdGFbYXJnXVxuICAgICAgZWxzZSBpZiBfLmlzT2JqZWN0KGFyZylcbiAgICAgICAgVGFuZ2VyaW5lLnRlbXBEYXRhID0gJC5leHRlbmQoVGFuZ2VyaW5lLnRlbXBEYXRhLCBhcmcpXG4gICAgICBlbHNlIGlmIGFyZyA9PSBudWxsXG4gICAgICAgIFRhbmdlcmluZS50ZW1wRGF0YSA9IHt9XG4gICAgZWxzZSBpZiBhcmdzLmxlbmd0aCA9PSAyXG4gICAgICBrZXkgPSBhcmdzWzBdXG4gICAgICB2YWx1ZSA9IGFyZ3NbMV1cbiAgICAgIFRhbmdlcmluZS50ZW1wRGF0YVtrZXldID0gdmFsdWVcbiAgICAgIHJldHVybiBUYW5nZXJpbmUudGVtcERhdGFcbiAgICBlbHNlIGlmIGFyZ3MubGVuZ3RoID09IDBcbiAgICAgIHJldHVybiBUYW5nZXJpbmUudGVtcERhdGFcblxuXG4gIEB3b3JraW5nOiAoaXNXb3JraW5nKSAtPlxuICAgIGlmIGlzV29ya2luZ1xuICAgICAgaWYgbm90IFRhbmdlcmluZS5sb2FkaW5nVGltZXI/XG4gICAgICAgIFRhbmdlcmluZS5sb2FkaW5nVGltZXIgPSBzZXRUaW1lb3V0KFV0aWxzLnNob3dMb2FkaW5nSW5kaWNhdG9yLCAzMDAwKVxuICAgIGVsc2VcbiAgICAgIGlmIFRhbmdlcmluZS5sb2FkaW5nVGltZXI/XG4gICAgICAgIGNsZWFyVGltZW91dCBUYW5nZXJpbmUubG9hZGluZ1RpbWVyXG4gICAgICAgIFRhbmdlcmluZS5sb2FkaW5nVGltZXIgPSBudWxsXG5cbiAgICAgICQoXCIubG9hZGluZ19iYXJcIikucmVtb3ZlKClcblxuICBAc2hvd0xvYWRpbmdJbmRpY2F0b3I6IC0+XG4gICAgJChcIjxkaXYgY2xhc3M9J2xvYWRpbmdfYmFyJz48aW1nIGNsYXNzPSdsb2FkaW5nJyBzcmM9J2ltYWdlcy9sb2FkaW5nLmdpZic+PC9kaXY+XCIpLmFwcGVuZFRvKFwiYm9keVwiKS5taWRkbGVDZW50ZXIoKVxuXG4gICMgYXNrcyBmb3IgY29uZmlybWF0aW9uIGluIHRoZSBicm93c2VyLCBhbmQgdXNlcyBwaG9uZWdhcCBmb3IgY29vbCBjb25maXJtYXRpb25cbiAgQGNvbmZpcm06IChtZXNzYWdlLCBvcHRpb25zKSAtPlxuICAgIGlmIG5hdmlnYXRvci5ub3RpZmljYXRpb24/LmNvbmZpcm0/XG4gICAgICBuYXZpZ2F0b3Iubm90aWZpY2F0aW9uLmNvbmZpcm0gbWVzc2FnZSxcbiAgICAgICAgKGlucHV0KSAtPlxuICAgICAgICAgIGlmIGlucHV0ID09IDFcbiAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2sgdHJ1ZVxuICAgICAgICAgIGVsc2UgaWYgaW5wdXQgPT0gMlxuICAgICAgICAgICAgb3B0aW9ucy5jYWxsYmFjayBmYWxzZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2sgaW5wdXRcbiAgICAgICwgb3B0aW9ucy50aXRsZSwgb3B0aW9ucy5hY3Rpb24rXCIsQ2FuY2VsXCJcbiAgICBlbHNlXG4gICAgICBpZiB3aW5kb3cuY29uZmlybSBtZXNzYWdlXG4gICAgICAgIG9wdGlvbnMuY2FsbGJhY2sgdHJ1ZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBvcHRpb25zLmNhbGxiYWNrIGZhbHNlXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiAwXG5cbiAgIyB0aGlzIGZ1bmN0aW9uIGlzIGEgbG90IGxpa2UgalF1ZXJ5LnNlcmlhbGl6ZUFycmF5LCBleGNlcHQgdGhhdCBpdCByZXR1cm5zIHVzZWZ1bCBvdXRwdXRcbiAgIyB3b3JrcyBvbiB0ZXh0YXJlYXMsIGlucHV0IHR5cGUgdGV4dCBhbmQgcGFzc3dvcmRcbiAgQGdldFZhbHVlczogKCBzZWxlY3RvciApIC0+XG4gICAgdmFsdWVzID0ge31cbiAgICAkKHNlbGVjdG9yKS5maW5kKFwiaW5wdXRbdHlwZT10ZXh0XSwgaW5wdXRbdHlwZT1wYXNzd29yZF0sIHRleHRhcmVhXCIpLmVhY2ggKCBpbmRleCwgZWxlbWVudCApIC0+XG4gICAgICB2YWx1ZXNbZWxlbWVudC5pZF0gPSBlbGVtZW50LnZhbHVlXG4gICAgcmV0dXJuIHZhbHVlc1xuXG4gICMgY29udmVydHMgdXJsIGVzY2FwZWQgY2hhcmFjdGVyc1xuICBAY2xlYW5VUkw6ICh1cmwpIC0+XG4gICAgaWYgdXJsLmluZGV4T2Y/KFwiJVwiKSAhPSAtMVxuICAgICAgdXJsID0gZGVjb2RlVVJJQ29tcG9uZW50IHVybFxuICAgIGVsc2VcbiAgICAgIHVybFxuXG4gICMgRGlzcG9zYWJsZSBhbGVydHNcbiAgQHRvcEFsZXJ0OiAoYWxlcnRUZXh0LCBkZWxheSA9IDIwMDApIC0+XG4gICAgVXRpbHMuYWxlcnQgXCJ0b3BcIiwgYWxlcnRUZXh0LCBkZWxheVxuXG4gIEBtaWRBbGVydDogKGFsZXJ0VGV4dCwgZGVsYXk9MjAwMCkgLT5cbiAgICBVdGlscy5hbGVydCBcIm1pZGRsZVwiLCBhbGVydFRleHQsIGRlbGF5XG5cbiAgQGFsZXJ0OiAoIHdoZXJlLCBhbGVydFRleHQsIGRlbGF5ID0gMjAwMCApIC0+XG5cbiAgICBzd2l0Y2ggd2hlcmVcbiAgICAgIHdoZW4gXCJ0b3BcIlxuICAgICAgICBzZWxlY3RvciA9IFwiLnRvcF9hbGVydFwiXG4gICAgICAgIGFsaWduZXIgPSAoICRlbCApIC0+IHJldHVybiAkZWwudG9wQ2VudGVyKClcbiAgICAgIHdoZW4gXCJtaWRkbGVcIlxuICAgICAgICBzZWxlY3RvciA9IFwiLm1pZF9hbGVydFwiXG4gICAgICAgIGFsaWduZXIgPSAoICRlbCApIC0+IHJldHVybiAkZWwubWlkZGxlQ2VudGVyKClcblxuXG4gICAgaWYgVXRpbHNbXCIje3doZXJlfUFsZXJ0VGltZXJcIl0/XG4gICAgICBjbGVhclRpbWVvdXQgVXRpbHNbXCIje3doZXJlfUFsZXJ0VGltZXJcIl1cbiAgICAgICRhbGVydCA9ICQoc2VsZWN0b3IpXG4gICAgICAkYWxlcnQuaHRtbCggJGFsZXJ0Lmh0bWwoKSArIFwiPGJyPlwiICsgYWxlcnRUZXh0IClcbiAgICBlbHNlXG4gICAgICAkYWxlcnQgPSAkKFwiPGRpdiBjbGFzcz0nI3tzZWxlY3Rvci5zdWJzdHJpbmcoMSl9IGRpc3Bvc2FibGVfYWxlcnQnPiN7YWxlcnRUZXh0fTwvZGl2PlwiKS5hcHBlbmRUbyhcIiNjb250ZW50XCIpXG5cbiAgICBhbGlnbmVyKCRhbGVydClcblxuICAgIGRvICgkYWxlcnQsIHNlbGVjdG9yLCBkZWxheSkgLT5cbiAgICAgIGNvbXB1dGVkRGVsYXkgPSAoKFwiXCIrJGFsZXJ0Lmh0bWwoKSkubWF0Y2goLzxicj4vZyl8fFtdKS5sZW5ndGggKiAxNTAwXG4gICAgICBVdGlsc1tcIiN7d2hlcmV9QWxlcnRUaW1lclwiXSA9IHNldFRpbWVvdXQgLT5cbiAgICAgICAgICBVdGlsc1tcIiN7d2hlcmV9QWxlcnRUaW1lclwiXSA9IG51bGxcbiAgICAgICAgICAkYWxlcnQuZmFkZU91dCgyNTAsIC0+ICQodGhpcykucmVtb3ZlKCkgKVxuICAgICAgLCBNYXRoLm1heChjb21wdXRlZERlbGF5LCBkZWxheSlcblxuXG5cbiAgQHN0aWNreTogKGh0bWwsIGJ1dHRvblRleHQgPSBcIkNsb3NlXCIsIGNhbGxiYWNrLCBwb3NpdGlvbiA9IFwibWlkZGxlXCIpIC0+XG4gICAgZGl2ID0gJChcIjxkaXYgY2xhc3M9J3N0aWNreV9hbGVydCc+I3todG1sfTxicj48YnV0dG9uIGNsYXNzPSdjb21tYW5kIHBhcmVudF9yZW1vdmUnPiN7YnV0dG9uVGV4dH08L2J1dHRvbj48L2Rpdj5cIikuYXBwZW5kVG8oXCIjY29udGVudFwiKVxuICAgIGlmIHBvc2l0aW9uID09IFwibWlkZGxlXCJcbiAgICAgIGRpdi5taWRkbGVDZW50ZXIoKVxuICAgIGVsc2UgaWYgcG9zaXRpb24gPT0gXCJ0b3BcIlxuICAgICAgZGl2LnRvcENlbnRlcigpXG4gICAgZGl2Lm9uKFwia2V5dXBcIiwgKGV2ZW50KSAtPiBpZiBldmVudC53aGljaCA9PSAyNyB0aGVuICQodGhpcykucmVtb3ZlKCkpLmZpbmQoXCJidXR0b25cIikuY2xpY2sgY2FsbGJhY2tcblxuICBAdG9wU3RpY2t5OiAoaHRtbCwgYnV0dG9uVGV4dCA9IFwiQ2xvc2VcIiwgY2FsbGJhY2spIC0+XG4gICAgVXRpbHMuc3RpY2t5KGh0bWwsIGJ1dHRvblRleHQsIGNhbGxiYWNrLCBcInRvcFwiKVxuXG5cblxuICBAbW9kYWw6IChodG1sKSAtPlxuICAgIGlmIGh0bWwgPT0gZmFsc2VcbiAgICAgICQoXCIjbW9kYWxfYmFjaywgI21vZGFsXCIpLnJlbW92ZSgpXG4gICAgICByZXR1cm5cblxuICAgICQoXCJib2R5XCIpLnByZXBlbmQoXCI8ZGl2IGlkPSdtb2RhbF9iYWNrJz48L2Rpdj5cIilcbiAgICAkKFwiPGRpdiBpZD0nbW9kYWwnPiN7aHRtbH08L2Rpdj5cIikuYXBwZW5kVG8oXCIjY29udGVudFwiKS5taWRkbGVDZW50ZXIoKS5vbihcImtleXVwXCIsIChldmVudCkgLT4gaWYgZXZlbnQud2hpY2ggPT0gMjcgdGhlbiAkKFwiI21vZGFsX2JhY2ssICNtb2RhbFwiKS5yZW1vdmUoKSlcblxuICBAcGFzc3dvcmRQcm9tcHQ6IChjYWxsYmFjaykgLT5cbiAgICBodG1sID0gXCJcbiAgICAgIDxkaXYgaWQ9J3Bhc3NfZm9ybScgdGl0bGU9J1VzZXIgdmVyaWZpY2F0aW9uJz5cbiAgICAgICAgPGxhYmVsIGZvcj0ncGFzc3dvcmQnPlBsZWFzZSByZS1lbnRlciB5b3VyIHBhc3N3b3JkPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdwYXNzX3ZhbCcgdHlwZT0ncGFzc3dvcmQnIG5hbWU9J3Bhc3N3b3JkJyBpZD0ncGFzc3dvcmQnIHZhbHVlPScnPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kJyBkYXRhLXZlcmlmeT0ndHJ1ZSc+VmVyaWZ5PC9idXR0b24+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQnPkNhbmNlbDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgXCJcblxuICAgIFV0aWxzLm1vZGFsIGh0bWxcblxuICAgICRwYXNzID0gJChcIiNwYXNzX3ZhbFwiKVxuICAgICRidXR0b24gPSAkKFwiI3Bhc3NfdmFsZm9ybSBidXR0b25cIilcblxuICAgICRwYXNzLm9uIFwia2V5dXBcIiwgKGV2ZW50KSAtPlxuICAgICAgcmV0dXJuIHRydWUgdW5sZXNzIGV2ZW50LndoaWNoID09IDEzXG4gICAgICAkYnV0dG9uLm9mZiBcImNsaWNrXCJcbiAgICAgICRwYXNzLm9mZiBcImNoYW5nZVwiXG5cbiAgICAgIGNhbGxiYWNrICRwYXNzLnZhbCgpXG4gICAgICBVdGlscy5tb2RhbCBmYWxzZVxuXG4gICAgJGJ1dHRvbi5vbiBcImNsaWNrXCIsIChldmVudCkgLT5cbiAgICAgICRidXR0b24ub2ZmIFwiY2xpY2tcIlxuICAgICAgJHBhc3Mub2ZmIFwiY2hhbmdlXCJcblxuICAgICAgY2FsbGJhY2sgJHBhc3MudmFsKCkgaWYgJChldmVudC50YXJnZXQpLmF0dHIoXCJkYXRhLXZlcmlmeVwiKSA9PSBcInRydWVcIlxuXG4gICAgICBVdGlscy5tb2RhbCBmYWxzZVxuXG5cblxuICAjIHJldHVybnMgYSBHVUlEXG4gIEBndWlkOiAtPlxuICAgcmV0dXJuIEBTNCgpK0BTNCgpK1wiLVwiK0BTNCgpK1wiLVwiK0BTNCgpK1wiLVwiK0BTNCgpK1wiLVwiK0BTNCgpK0BTNCgpK0BTNCgpXG4gIEBTNDogLT5cbiAgIHJldHVybiAoICggKCAxICsgTWF0aC5yYW5kb20oKSApICogMHgxMDAwMCApIHwgMCApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSlcblxuICBAaHVtYW5HVUlEOiAtPiByZXR1cm4gQHJhbmRvbUxldHRlcnMoNCkrXCItXCIrQHJhbmRvbUxldHRlcnMoNCkrXCItXCIrQHJhbmRvbUxldHRlcnMoNClcbiAgQHNhZmVMZXR0ZXJzID0gXCJhYmNkZWZnaGlqbG1ub3BxcnN0dXZ3eHl6XCIuc3BsaXQoXCJcIilcbiAgQHJhbmRvbUxldHRlcnM6IChsZW5ndGgpIC0+XG4gICAgcmVzdWx0ID0gXCJcIlxuICAgIHdoaWxlIGxlbmd0aC0tXG4gICAgICByZXN1bHQgKz0gVXRpbHMuc2FmZUxldHRlcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKlV0aWxzLnNhZmVMZXR0ZXJzLmxlbmd0aCldXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gICMgdHVybnMgdGhlIGJvZHkgYmFja2dyb3VuZCBhIGNvbG9yIGFuZCB0aGVuIHJldHVybnMgdG8gd2hpdGVcbiAgQGZsYXNoOiAoY29sb3I9XCJyZWRcIiwgc2hvdWxkVHVybkl0T24gPSBudWxsKSAtPlxuXG4gICAgaWYgbm90IHNob3VsZFR1cm5JdE9uP1xuICAgICAgVXRpbHMuYmFja2dyb3VuZCBjb2xvclxuICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICBVdGlscy5iYWNrZ3JvdW5kIFwiXCJcbiAgICAgICwgMTAwMFxuXG4gIEBiYWNrZ3JvdW5kOiAoY29sb3IpIC0+XG4gICAgaWYgY29sb3I/XG4gICAgICAkKFwiI2NvbnRlbnRfd3JhcHBlclwiKS5jc3MgXCJiYWNrZ3JvdW5kQ29sb3JcIiA6IGNvbG9yXG4gICAgZWxzZVxuICAgICAgJChcIiNjb250ZW50X3dyYXBwZXJcIikuY3NzIFwiYmFja2dyb3VuZENvbG9yXCJcblxuICAjIFJldHJpZXZlcyBHRVQgdmFyaWFibGVzXG4gICMgaHR0cDovL2Vqb2huLm9yZy9ibG9nL3NlYXJjaC1hbmQtZG9udC1yZXBsYWNlL1xuICBAJF9HRVQ6IChxLCBzKSAtPlxuICAgIHZhcnMgPSB7fVxuICAgIHBhcnRzID0gd2luZG93LmxvY2F0aW9uLmhyZWYucmVwbGFjZSgvWz8mXSsoW149Jl0rKT0oW14mXSopL2dpLCAobSxrZXksdmFsdWUpIC0+XG4gICAgICAgIHZhbHVlID0gaWYgfnZhbHVlLmluZGV4T2YoXCIjXCIpIHRoZW4gdmFsdWUuc3BsaXQoXCIjXCIpWzBdIGVsc2UgdmFsdWVcbiAgICAgICAgdmFyc1trZXldID0gdmFsdWUuc3BsaXQoXCIjXCIpWzBdO1xuICAgIClcbiAgICB2YXJzXG5cblxuICAjIG5vdCBjdXJyZW50bHkgaW1wbGVtZW50ZWQgYnV0IHdvcmtpbmdcbiAgQHJlc2l6ZVNjcm9sbFBhbmU6IC0+XG4gICAgJChcIi5zY3JvbGxfcGFuZVwiKS5oZWlnaHQoICQod2luZG93KS5oZWlnaHQoKSAtICggJChcIiNuYXZpZ2F0aW9uXCIpLmhlaWdodCgpICsgJChcIiNmb290ZXJcIikuaGVpZ2h0KCkgKyAxMDApIClcblxuICAjIGFza3MgdXNlciBpZiB0aGV5IHdhbnQgdG8gbG9nb3V0XG4gIEBhc2tUb0xvZ291dDogLT4gVGFuZ2VyaW5lLnVzZXIubG9nb3V0KCkgaWYgY29uZmlybShcIldvdWxkIHlvdSBsaWtlIHRvIGxvZ291dCBub3c/XCIpXG5cbiAgQHVwZGF0ZUZyb21TZXJ2ZXI6IChtb2RlbCkgLT5cblxuICAgIGRLZXkgPSBtb2RlbC5pZC5zdWJzdHIoLTUsIDUpXG5cbiAgICBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBsb29rdXBcIlxuXG4gICAgc291cmNlREIgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJncm91cFwiKVxuICAgIHRhcmdldERCID0gVGFuZ2VyaW5lLmNvbmYuZGJfbmFtZVxuXG4gICAgc291cmNlREtleSA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwiZ3JvdXBcIiwgXCJieURLZXlcIilcblxuICAgICMjI1xuICAgIEdldHMgYSBsaXN0IG9mIGRvY3VtZW50cyBvbiBib3RoIHRoZSBzZXJ2ZXIgYW5kIGxvY2FsbHkuIFRoZW4gcmVwbGljYXRlcyBhbGwgYnkgaWQuXG4gICAgIyMjXG5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogc291cmNlREtleSxcbiAgICAgIHR5cGU6IFwiUE9TVFwiXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGtleXM6ZEtleSlcbiAgICAgIGVycm9yOiAoYSwgYikgLT4gbW9kZWwudHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgZG9jTGlzdCA9IGRhdGEucm93cy5yZWR1Y2UgKChvYmosIGN1cikgLT4gb2JqW2N1ci5pZF0gPSB0cnVlKSwge31cblxuICAgICAgICBUYW5nZXJpbmUuZGIucXVlcnkoXCIje1RhbmdlcmluZS5jb25mLmRlc2lnbl9kb2N9L2J5REtleVwiLFxuICAgICAgICAgIGtleTogZEtleVxuICAgICAgICApLnRoZW4gKHJlc3BvbnNlKSAtPlxuICAgICAgICAgIGNvbnNvbGUud2FybiByZXNwb25zZSB1bmxlc3MgcmVzcG9uc2Uucm93cz9cbiAgICAgICAgICBkb2NMaXN0ID0gZGF0YS5yb3dzLnJlZHVjZSAoKG9iaiwgY3VyKSAtPiBvYmpbY3VyLmlkXSA9IHRydWUpLCBkb2NMaXN0XG4gICAgICAgICAgZG9jTGlzdCA9IE9iamVjdC5rZXlzKGRvY0xpc3QpXG4gICAgICAgICAgJC5jb3VjaC5yZXBsaWNhdGUoXG4gICAgICAgICAgICBzb3VyY2VEQixcbiAgICAgICAgICAgIHRhcmdldERCLCB7XG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICBtb2RlbC50cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IHN1Y2Nlc3NcIiwgcmVzcG9uc2VcbiAgICAgICAgICAgICAgZXJyb3I6IChhLCBiKSAgICAgIC0+IG1vZGVsLnRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgZXJyb3JcIiwgXCIje2F9ICN7Yn1cIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZG9jX2lkczogZG9jTGlzdFxuICAgICAgICAgIClcblxuICBAbG9hZERldmVsb3BtZW50UGFja3M6IChjYWxsYmFjaykgLT5cbiAgICAkLmFqYXhcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgdXJsOiBcInBhY2tzLmpzb25cIlxuICAgICAgZXJyb3I6IChyZXMpIC0+XG4gICAgICAgIGNhbGxiYWNrKHJlcylcbiAgICAgIHN1Y2Nlc3M6IChyZXMpIC0+XG4gICAgICAgIFRhbmdlcmluZS5kYi5idWxrRG9jcyByZXMsIChlcnJvciwgZG9jKSAtPlxuICAgICAgICAgIGlmIGVycm9yIHRoZW4gY2FsbGJhY2soZXJyb3IpIGVsc2UgY2FsbGJhY2soKVxuXG5cblxuXG4jIFJvYmJlcnQgaW50ZXJmYWNlXG5jbGFzcyBSb2JiZXJ0XG5cbiAgQHJlcXVlc3Q6IChvcHRpb25zKSAtPlxuXG4gICAgc3VjY2VzcyA9IG9wdGlvbnMuc3VjY2Vzc1xuICAgIGVycm9yICAgPSBvcHRpb25zLmVycm9yXG5cbiAgICBkZWxldGUgb3B0aW9ucy5zdWNjZXNzXG4gICAgZGVsZXRlIG9wdGlvbnMuZXJyb3JcblxuICAgICQuYWpheFxuICAgICAgdHlwZSAgICAgICAgOiBcIlBPU1RcIlxuICAgICAgY3Jvc3NEb21haW4gOiB0cnVlXG4gICAgICB1cmwgICAgICAgICA6IFRhbmdlcmluZS5jb25maWcuZ2V0KFwicm9iYmVydFwiKVxuICAgICAgZGF0YVR5cGUgICAgOiBcImpzb25cIlxuICAgICAgZGF0YSAgICAgICAgOiBvcHRpb25zXG4gICAgICBzdWNjZXNzOiAoIGRhdGEgKSA9PlxuICAgICAgICBzdWNjZXNzIGRhdGFcbiAgICAgIGVycm9yOiAoIGRhdGEgKSA9PlxuICAgICAgICBlcnJvciBkYXRhXG5cbiMgVHJlZSBpbnRlcmZhY2VcbmNsYXNzIFRhbmdlcmluZVRyZWVcblxuICBAbWFrZTogKG9wdGlvbnMpIC0+XG5cbiAgICBVdGlscy53b3JraW5nIHRydWVcbiAgICBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzXG4gICAgZXJyb3IgICA9IG9wdGlvbnMuZXJyb3JcblxuICAgIGRlbGV0ZSBvcHRpb25zLnN1Y2Nlc3NcbiAgICBkZWxldGUgb3B0aW9ucy5lcnJvclxuXG4gICAgb3B0aW9ucy51c2VyID0gVGFuZ2VyaW5lLnVzZXIubmFtZSgpXG5cbiAgICAkLmFqYXhcbiAgICAgIHR5cGUgICAgIDogXCJQT1NUXCJcbiAgICAgIGNyb3NzRG9tYWluIDogdHJ1ZVxuICAgICAgdXJsICAgICAgOiBUYW5nZXJpbmUuY29uZmlnLmdldChcInRyZWVcIikgKyBcIm1ha2UvI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KCdncm91cE5hbWUnKX1cIlxuICAgICAgZGF0YVR5cGUgOiBcImpzb25cIlxuICAgICAgZGF0YSAgICAgOiBvcHRpb25zXG4gICAgICBzdWNjZXNzOiAoIGRhdGEgKSA9PlxuICAgICAgICBzdWNjZXNzIGRhdGFcbiAgICAgIGVycm9yOiAoIGRhdGEgKSA9PlxuICAgICAgICBlcnJvciBkYXRhLCBKU09OLnBhcnNlKGRhdGEucmVzcG9uc2VUZXh0KVxuICAgICAgY29tcGxldGU6IC0+XG4gICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcblxuXG5cbiMjVUkgaGVscGVyc1xuJCAtPlxuICAjICMjIy5jbGVhcl9tZXNzYWdlXG4gICMgVGhpcyBsaXR0bGUgZ3V5IHdpbGwgZmFkZSBvdXQgYW5kIGNsZWFyIGhpbSBhbmQgaGlzIHBhcmVudHMuIFdyYXAgaGltIHdpc2VseS5cbiAgIyBgPHNwYW4+IG15IG1lc3NhZ2UgPGJ1dHRvbiBjbGFzcz1cImNsZWFyX21lc3NhZ2VcIj5YPC9idXR0b24+YFxuICAkKFwiI2NvbnRlbnRcIikub24oXCJjbGlja1wiLCBcIi5jbGVhcl9tZXNzYWdlXCIsICBudWxsLCAoYSkgLT4gJChhLnRhcmdldCkucGFyZW50KCkuZmFkZU91dCgyNTAsIC0+ICQodGhpcykuZW1wdHkoKS5zaG93KCkgKSApXG4gICQoXCIjY29udGVudFwiKS5vbihcImNsaWNrXCIsIFwiLnBhcmVudF9yZW1vdmVcIiwgbnVsbCwgKGEpIC0+ICQoYS50YXJnZXQpLnBhcmVudCgpLmZhZGVPdXQoMjUwLCAtPiAkKHRoaXMpLnJlbW92ZSgpICkgKVxuXG4gICMgZGlzcG9zYWJsZSBhbGVydHMgPSBhIG5vbi1mYW5jeSBib3hcbiAgJChcIiNjb250ZW50XCIpLm9uIFwiY2xpY2tcIixcIi5hbGVydF9idXR0b25cIiwgLT5cbiAgICBhbGVydF90ZXh0ID0gaWYgJCh0aGlzKS5hdHRyKFwiZGF0YS1hbGVydFwiKSB0aGVuICQodGhpcykuYXR0cihcImRhdGEtYWxlcnRcIikgZWxzZSAkKHRoaXMpLnZhbCgpXG4gICAgVXRpbHMuZGlzcG9zYWJsZUFsZXJ0IGFsZXJ0X3RleHRcbiAgJChcIiNjb250ZW50XCIpLm9uIFwiY2xpY2tcIiwgXCIuZGlzcG9zYWJsZV9hbGVydFwiLCAtPlxuICAgICQodGhpcykuc3RvcCgpLmZhZGVPdXQgMTAwLCAtPlxuICAgICAgJCh0aGlzKS5yZW1vdmUoKVxuXG4gICMgJCh3aW5kb3cpLnJlc2l6ZSBVdGlscy5yZXNpemVTY3JvbGxQYW5lXG4gICMgVXRpbHMucmVzaXplU2Nyb2xsUGFuZSgpXG5cbiMgSGFuZGxlYmFycyBwYXJ0aWFsc1xuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZ3JpZExhYmVsJywgKGl0ZW1zLGl0ZW1NYXAsaW5kZXgpIC0+XG4jICBfLmVzY2FwZShpdGVtc1tpdGVtTWFwW2RvbmVdXSlcbiAgXy5lc2NhcGUoaXRlbXNbaXRlbU1hcFtpbmRleF1dKVxuKVxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignc3RhcnRSb3cnLCAoaW5kZXgpIC0+XG4gIGNvbnNvbGUubG9nKFwiaW5kZXg6IFwiICsgaW5kZXgpXG4gIGlmIGluZGV4ID09IDBcbiAgICBcIjx0cj5cIlxuKVxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZW5kUm93JywgKGluZGV4KSAtPlxuICBjb25zb2xlLmxvZyhcImluZGV4OiBcIiArIGluZGV4KVxuICBpZiBpbmRleCA9PSAwXG4gICAgXCI8L3RyPlwiXG4pXG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3N0YXJ0Q2VsbCcsIChpbmRleCkgLT5cbiAgY29uc29sZS5sb2coXCJpbmRleDogXCIgKyBpbmRleClcbiAgaWYgaW5kZXggPT0gMFxuICAgIFwiPHRkPjwvdGQ+XCJcbilcblxuIy8qXG4jICAgKiBVc2UgdGhpcyB0byB0dXJuIG9uIGxvZ2dpbmc6XG4jICAgKi9cbkhhbmRsZWJhcnMubG9nZ2VyLmxvZyA9IChsZXZlbCktPlxuICBpZiAgbGV2ZWwgPj0gSGFuZGxlYmFycy5sb2dnZXIubGV2ZWxcbiAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBbXS5jb25jYXQoW1wiSGFuZGxlYmFyczogXCJdLCBfLnRvQXJyYXkoYXJndW1lbnRzKSkpXG5cbiMjLy8gREVCVUc6IDAsIElORk86IDEsIFdBUk46IDIsIEVSUk9SOiAzLFxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbG9nJywgSGFuZGxlYmFycy5sb2dnZXIubG9nKTtcbiMjLy8gU3RkIGxldmVsIGlzIDMsIHdoZW4gc2V0IHRvIDAsIGhhbmRsZWJhcnMgd2lsbCBsb2cgYWxsIGNvbXBpbGF0aW9uIHJlc3VsdHNcbkhhbmRsZWJhcnMubG9nZ2VyLmxldmVsID0gMztcblxuIy8qXG4jICAgKiBMb2cgY2FuIGFsc28gYmUgdXNlZCBpbiB0ZW1wbGF0ZXM6ICd7e2xvZyAwIHRoaXMgXCJteVN0cmluZ1wiIGFjY291bnROYW1lfX0nXG4jICAgKiBMb2dzIGFsbCB0aGUgcGFzc2VkIGRhdGEgd2hlbiBsb2dnZXIubGV2ZWwgPSAwXG4jICAgKi9cblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihcImRlYnVnXCIsIChvcHRpb25hbFZhbHVlKS0+XG4gIGNvbnNvbGUubG9nKFwiQ3VycmVudCBDb250ZXh0XCIpXG4gIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT1cIilcbiAgY29uc29sZS5sb2codGhpcylcblxuICBpZiBvcHRpb25hbFZhbHVlXG4gICAgY29uc29sZS5sb2coXCJWYWx1ZVwiKVxuICAgIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT1cIilcbiAgICBjb25zb2xlLmxvZyhvcHRpb25hbFZhbHVlKVxuKVxuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdtb250aERyb3Bkb3duJywgKG1vbnRocywgY3VycmVudE1vbnRoKS0+XG4gIHJlbmRlck9wdGlvbiA9IChtb250aCwgY3VycmVudE1vbnRoKS0+XG4gICAgb3V0ID0gXCI8b3B0aW9uIHZhbHVlPSdcIiArIG1vbnRoICsgXCInXCJcbiAgICBpZiBtb250aCA9PSBjdXJyZW50TW9udGhcbiAgICAgIG91dCA9IG91dCArIFwic2VsZWN0ZWQ9J3NlbGVjdGVkJ1wiXG4gICAgb3V0ID0gb3V0ICsgIFwiPlwiICsgbW9udGgudGl0bGVpemUoKSArIFwiPC9vcHRpb24+XCJcbiAgICByZXR1cm4gb3V0XG4gIHJlbmRlck9wdGlvbihtb250aCwgY3VycmVudE1vbnRoKSBmb3IgbW9udGggaW4gbW9udGhzXG4pXG4iXX0=

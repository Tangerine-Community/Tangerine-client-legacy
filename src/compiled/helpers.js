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
    if (Tangerine.settings.get("groupHost") === "localhost") {
      allDocsUrl = "http://" + (Tangerine.settings.get("groupHost")) + "/_cors_bulk_docs/check/" + Tangerine.settings.groupDB;
    } else {
      allDocsUrl = a.protocol + "//" + a.host + "/_cors_bulk_docs/check/" + Tangerine.settings.groupDB;
    }
    $("#upload_results").append('Count of results to check if available on server: ' + docList.length + '<br/>');
    return $.ajax({
      url: allDocsUrl,
      type: "POST",
      dataType: "json",
      data: {
        keys: JSON.stringify(docList),
        user: Tangerine.settings.upUser,
        pass: Tangerine.settings.upPass
      },
      error: function(e) {
        var errorMessage;
        errorMessage = JSON.stringify(e);
        alert("Error connecting" + errorMessage);
        return $("#upload_results").append('Error connecting to : ' + allDocsUrl + ' - Error: ' + errorMessage + '<br/>');
      },
      success: (function(_this) {
        return function(response) {
          var i, leftToUpload, len, row, rows;
          $("#upload_results").append('Received response from server.');
          rows = response.rows;
          leftToUpload = [];
          for (i = 0, len = rows.length; i < len; i++) {
            row = rows[i];
            if (row.error != null) {
              leftToUpload.push(row.key);
            }
          }
          $("#upload_results").append('Count of results to upload: ' + leftToUpload.length + '<br/>');
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
            if (Tangerine.settings.get("groupHost") === "localhost") {
              bulkDocsUrl = "http://" + (Tangerine.settings.get("groupHost")) + "/_cors_bulk_docs/upload/" + Tangerine.settings.groupDB;
            } else {
              bulkDocsUrl = a.protocol + "//" + a.host + "/_cors_bulk_docs/upload/" + Tangerine.settings.groupDB;
            }
            return $.ajax({
              type: "POST",
              url: bulkDocsUrl,
              data: compressedData,
              error: (function(_this) {
                return function(e) {
                  var errorMessage;
                  errorMessage = JSON.stringify(e);
                  alert("Server bulk docs error" + errorMessage);
                  return $("#upload_results").append('Server bulk docs error : ' + bulkDocsUrl + ' - Error: ' + errorMessage + '<br/>');
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
    return Tangerine.db.allDocs({
      include_docs: true
    }).then(function(response) {
      return Utils.saveRecordsToFile(JSON.stringify(response));
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

//# sourceMappingURL=data:application/json;base64,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S0FBbEIsR0FBMEI7O0FBTzFCLFVBQVUsQ0FBQyxjQUFYLENBQTBCLE9BQTFCLEVBQW1DLFNBQUMsYUFBRDtFQUNqQyxPQUFPLENBQUMsR0FBUixDQUFZLGlCQUFaO0VBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxzQkFBWjtFQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWjtFQUVBLElBQUcsYUFBSDtJQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWjtJQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksc0JBQVo7V0FDQSxPQUFPLENBQUMsR0FBUixDQUFZLGFBQVosRUFIRjs7QUFMaUMsQ0FBbkM7O0FBV0EsVUFBVSxDQUFDLGNBQVgsQ0FBMEIsZUFBMUIsRUFBMkMsU0FBQyxNQUFELEVBQVMsWUFBVDtBQUN6QyxNQUFBO0VBQUEsWUFBQSxHQUFlLFNBQUMsS0FBRCxFQUFRLFlBQVI7QUFDYixRQUFBO0lBQUEsR0FBQSxHQUFNLGlCQUFBLEdBQW9CLEtBQXBCLEdBQTRCO0lBQ2xDLElBQUcsS0FBQSxLQUFTLFlBQVo7TUFDRSxHQUFBLEdBQU0sR0FBQSxHQUFNLHNCQURkOztJQUVBLEdBQUEsR0FBTSxHQUFBLEdBQU8sR0FBUCxHQUFhLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBYixHQUFnQztBQUN0QyxXQUFPO0VBTE07QUFNZjtPQUFBLHdDQUFBOztrQkFBQSxZQUFBLENBQWEsS0FBYixFQUFvQixZQUFwQjtBQUFBOztBQVB5QyxDQUEzQyIsImZpbGUiOiJoZWxwZXJzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiI1xuIyBTa2lwIGxvZ2ljXG4jXG5cbiMgdGhlc2UgY291bGQgZWFzaWx5IGJlIHJlZmFjdG9yZWQgaW50byBvbmUuXG5cblJlc3VsdE9mUXVlc3Rpb24gPSAobmFtZSkgLT5cbiAgcmV0dXJuVmlldyA9IG51bGxcbiMgIHZpZXdNYXN0ZXIuc3VidGVzdFZpZXdzW2luZGV4XS5wcm90b3R5cGVWaWV3LnF1ZXN0aW9uVmlld3MuZm9yRWFjaCAoY2FuZGlkYXRlVmlldykgLT5cbiAgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3LnF1ZXN0aW9uVmlld3MuZm9yRWFjaCAoY2FuZGlkYXRlVmlldykgLT5cbiAgICBpZiBjYW5kaWRhdGVWaWV3Lm1vZGVsLmdldChcIm5hbWVcIikgPT0gbmFtZVxuICAgICAgcmV0dXJuVmlldyA9IGNhbmRpZGF0ZVZpZXdcbiAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiUmVzdWx0T2ZRdWVzdGlvbiBjb3VsZCBub3QgZmluZCB2YXJpYWJsZSAje25hbWV9XCIpIGlmIHJldHVyblZpZXcgPT0gbnVsbFxuICByZXR1cm4gcmV0dXJuVmlldy5hbnN3ZXIgaWYgcmV0dXJuVmlldy5hbnN3ZXJcbiAgcmV0dXJuIG51bGxcblxuUmVzdWx0T2ZNdWx0aXBsZSA9IChuYW1lKSAtPlxuICByZXR1cm5WaWV3ID0gbnVsbFxuIyAgdmlld01hc3Rlci5zdWJ0ZXN0Vmlld3NbaW5kZXhdLnByb3RvdHlwZVZpZXcucXVlc3Rpb25WaWV3cy5mb3JFYWNoIChjYW5kaWRhdGVWaWV3KSAtPlxuICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcucXVlc3Rpb25WaWV3cy5mb3JFYWNoIChjYW5kaWRhdGVWaWV3KSAtPlxuICAgIGlmIGNhbmRpZGF0ZVZpZXcubW9kZWwuZ2V0KFwibmFtZVwiKSA9PSBuYW1lXG4gICAgICByZXR1cm5WaWV3ID0gY2FuZGlkYXRlVmlld1xuICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJSZXN1bHRPZlF1ZXN0aW9uIGNvdWxkIG5vdCBmaW5kIHZhcmlhYmxlICN7bmFtZX1cIikgaWYgcmV0dXJuVmlldyA9PSBudWxsXG5cbiAgcmVzdWx0ID0gW11cbiAgZm9yIGtleSwgdmFsdWUgb2YgcmV0dXJuVmlldy5hbnN3ZXJcbiAgICByZXN1bHQucHVzaCBrZXkgaWYgdmFsdWUgPT0gXCJjaGVja2VkXCJcbiAgcmV0dXJuIHJlc3VsdFxuXG5SZXN1bHRPZlByZXZpb3VzID0gKG5hbWUpIC0+XG4gIGlmIHR5cGVvZiB2bS5jdXJyZW50Vmlldy5yZXN1bHQgPT0gJ3VuZGVmaW5lZCdcbiAgICBjb25zb2xlLmxvZyhcIlVzaW5nIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1wiKVxuICAgIHJldHVybiBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcubW9kZWwucGFyZW50LnJlc3VsdC5nZXRWYXJpYWJsZShuYW1lKVxuICBlbHNlXG4gICAgcmV0dXJuIHZtLmN1cnJlbnRWaWV3LnJlc3VsdC5nZXRWYXJpYWJsZShuYW1lKVxuXG5SZXN1bHRPZkdyaWQgPSAobmFtZSkgLT5cbiAgaWYgdHlwZW9mIHZtLmN1cnJlbnRWaWV3LnJlc3VsdCA9PSAndW5kZWZpbmVkJ1xuICAgIGNvbnNvbGUubG9nKFwiVXNpbmcgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XCIpXG4gICAgcmV0dXJuIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlldy5tb2RlbC5wYXJlbnQucmVzdWx0LmdldEl0ZW1SZXN1bHRDb3VudEJ5VmFyaWFibGVOYW1lKG5hbWUsIFwiY29ycmVjdFwiKVxuICBlbHNlXG4gICAgcmV0dXJuIHZtLmN1cnJlbnRWaWV3LnJlc3VsdC5nZXRWYXJpYWJsZShuYW1lKVxuI1xuIyBUYW5nZXJpbmUgYmFja2J1dHRvbiBoYW5kbGVyXG4jXG4kLmV4dGVuZChUYW5nZXJpbmUsVGFuZ2VyaW5lVmVyc2lvbilcblRhbmdlcmluZS5vbkJhY2tCdXR0b24gPSAoZXZlbnQpIC0+XG4gIGlmIFRhbmdlcmluZS5hY3Rpdml0eSA9PSBcImFzc2Vzc21lbnQgcnVuXCJcbiAgICBpZiBjb25maXJtIHQoXCJOYXZpZ2F0aW9uVmlldy5tZXNzYWdlLmluY29tcGxldGVfbWFpbl9zY3JlZW5cIilcbiAgICAgIFRhbmdlcmluZS5hY3Rpdml0eSA9IFwiXCJcbiAgICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICBlbHNlXG4gICAgd2luZG93Lmhpc3RvcnkuYmFjaygpXG5cblxuXG4jIEV4dGVuZCBldmVyeSB2aWV3IHdpdGggYSBjbG9zZSBtZXRob2QsIHVzZWQgYnkgVmlld01hbmFnZXJcbkJhY2tib25lLlZpZXcucHJvdG90eXBlLmNsb3NlID0gLT5cbiAgQHJlbW92ZSgpXG4gIEB1bmJpbmQoKVxuICBAb25DbG9zZT8oKVxuXG5cblxuIyBSZXR1cm5zIGFuIG9iamVjdCBoYXNoZWQgYnkgYSBnaXZlbiBhdHRyaWJ1dGUuXG5CYWNrYm9uZS5Db2xsZWN0aW9uLnByb3RvdHlwZS5pbmRleEJ5ID0gKCBhdHRyICkgLT5cbiAgcmVzdWx0ID0ge31cbiAgQG1vZGVscy5mb3JFYWNoIChvbmVNb2RlbCkgLT5cbiAgICBpZiBvbmVNb2RlbC5oYXMoYXR0cilcbiAgICAgIGtleSA9IG9uZU1vZGVsLmdldChhdHRyKVxuICAgICAgcmVzdWx0W2tleV0gPSBbXSBpZiBub3QgcmVzdWx0W2tleV0/XG4gICAgICByZXN1bHRba2V5XS5wdXNoKG9uZU1vZGVsKVxuICByZXR1cm4gcmVzdWx0XG5cbiMgUmV0dXJucyBhbiBvYmplY3QgaGFzaGVkIGJ5IGEgZ2l2ZW4gYXR0cmlidXRlLlxuQmFja2JvbmUuQ29sbGVjdGlvbi5wcm90b3R5cGUuaW5kZXhBcnJheUJ5ID0gKCBhdHRyICkgLT5cbiAgcmVzdWx0ID0gW11cbiAgQG1vZGVscy5mb3JFYWNoIChvbmVNb2RlbCkgLT5cbiAgICBpZiBvbmVNb2RlbC5oYXMoYXR0cilcbiAgICAgIGtleSA9IG9uZU1vZGVsLmdldChhdHRyKVxuICAgICAgcmVzdWx0W2tleV0gPSBbXSBpZiBub3QgcmVzdWx0W2tleV0/XG4gICAgICByZXN1bHRba2V5XS5wdXNoKG9uZU1vZGVsKVxuICByZXR1cm4gcmVzdWx0XG5cblxuIyBUaGlzIGlzIGZvciBQb3VjaERCJ3Mgc3R5bGUgb2YgcmV0dXJuaW5nIGRvY3VtZW50c1xuQmFja2JvbmUuQ29sbGVjdGlvbi5wcm90b3R5cGUucGFyc2UgPSAocmVzdWx0KSAtPlxuICByZXR1cm4gXy5wbHVjayByZXN1bHQucm93cywgJ2RvYydcblxuXG4jIGJ5IGRlZmF1bHQgYWxsIG1vZGVscyB3aWxsIHNhdmUgYSB0aW1lc3RhbXAgYW5kIGhhc2ggb2Ygc2lnbmlmaWNhbnQgYXR0cmlidXRlc1xuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLl9zYXZlID0gQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnNhdmVcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5zYXZlID0gLT5cbiAgQGJlZm9yZVNhdmU/KClcbiAgQHN0YW1wKClcbiAgQF9zYXZlLmFwcGx5KEAsIGFyZ3VtZW50cylcblxuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnN0YW1wID0gLT5cbiAgQHNldFxuICAgIGVkaXRlZEJ5IDogVGFuZ2VyaW5lPy51c2VyPy5uYW1lKCkgfHwgXCJ1bmtub3duXCJcbiAgICB1cGRhdGVkIDogKG5ldyBEYXRlKCkpLnRvU3RyaW5nKClcbiAgICBmcm9tSW5zdGFuY2VJZCA6IFRhbmdlcmluZS5zZXR0aW5ncy5nZXRTdHJpbmcoXCJpbnN0YW5jZUlkXCIpXG4gICAgY29sbGVjdGlvbiA6IEB1cmxcbiAgLCBzaWxlbnQ6IHRydWVcblxuXG4jXG4jIFRoaXMgc2VyaWVzIG9mIGZ1bmN0aW9ucyByZXR1cm5zIHByb3BlcnRpZXMgd2l0aCBkZWZhdWx0IHZhbHVlcyBpZiBubyBwcm9wZXJ0eSBpcyBmb3VuZFxuIyBAZ290Y2hhIGJlIG1pbmRmdWwgb2YgdGhlIGRlZmF1bHQgXCJibGFua1wiIHZhbHVlcyBzZXQgaGVyZVxuI1xuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldE51bWJlciA9ICAgICAgICAoa2V5LCBmYWxsYmFjayA9IDApICAtPiByZXR1cm4gaWYgQGhhcyhrZXkpIHRoZW4gcGFyc2VJbnQoQGdldChrZXkpKSBlbHNlIGZhbGxiYWNrXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZ2V0QXJyYXkgPSAgICAgICAgIChrZXksIGZhbGxiYWNrID0gW10pIC0+IHJldHVybiBpZiBAaGFzKGtleSkgdGhlbiBAZ2V0KGtleSkgICAgICAgICAgIGVsc2UgZmFsbGJhY2tcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5nZXRTdHJpbmcgPSAgICAgICAgKGtleSwgZmFsbGJhY2sgPSAnJykgLT4gcmV0dXJuIGlmIEBoYXMoa2V5KSB0aGVuIEBnZXQoa2V5KSAgICAgICAgICAgZWxzZSBmYWxsYmFja1xuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldEVzY2FwZWRTdHJpbmcgPSAoa2V5LCBmYWxsYmFjayA9ICcnKSAtPiByZXR1cm4gaWYgQGhhcyhrZXkpIHRoZW4gQGVzY2FwZShrZXkpICAgICAgICBlbHNlIGZhbGxiYWNrXG4jIHRoaXMgc2VlbXMgdG9vIGltcG9ydGFudCB0byB1c2UgYSBkZWZhdWx0XG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZ2V0Qm9vbGVhbiA9ICAgICAgIChrZXkpIC0+IHJldHVybiBpZiBAaGFzKGtleSkgdGhlbiAoQGdldChrZXkpID09IHRydWUgb3IgQGdldChrZXkpID09ICd0cnVlJylcblxuXG4jXG4jIGhhbmR5IGpxdWVyeSBmdW5jdGlvbnNcbiNcbiggKCQpIC0+XG5cbiAgJC5mbi5zY3JvbGxUbyA9IChzcGVlZCA9IDI1MCwgY2FsbGJhY2spIC0+XG4gICAgdHJ5XG4gICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSB7XG4gICAgICAgIHNjcm9sbFRvcDogJChAKS5vZmZzZXQoKS50b3AgKyAncHgnXG4gICAgICAgIH0sIHNwZWVkLCBudWxsLCBjYWxsYmFja1xuICAgIGNhdGNoIGVcbiAgICAgIGNvbnNvbGUubG9nIFwiZXJyb3JcIiwgZVxuICAgICAgY29uc29sZS5sb2cgXCJTY3JvbGwgZXJyb3Igd2l0aCAndGhpcydcIiwgQFxuXG4gICAgcmV0dXJuIEBcblxuICAjIHBsYWNlIHNvbWV0aGluZyB0b3AgYW5kIGNlbnRlclxuICAkLmZuLnRvcENlbnRlciA9IC0+XG4gICAgQGNzcyBcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIlxuICAgIEBjc3MgXCJ0b3BcIiwgJCh3aW5kb3cpLnNjcm9sbFRvcCgpICsgXCJweFwiXG4gICAgQGNzcyBcImxlZnRcIiwgKCgkKHdpbmRvdykud2lkdGgoKSAtIEBvdXRlcldpZHRoKCkpIC8gMikgKyAkKHdpbmRvdykuc2Nyb2xsTGVmdCgpICsgXCJweFwiXG5cbiAgIyBwbGFjZSBzb21ldGhpbmcgbWlkZGxlIGNlbnRlclxuICAkLmZuLm1pZGRsZUNlbnRlciA9IC0+XG4gICAgQGNzcyBcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIlxuICAgIEBjc3MgXCJ0b3BcIiwgKCgkKHdpbmRvdykuaGVpZ2h0KCkgLSB0aGlzLm91dGVySGVpZ2h0KCkpIC8gMikgKyAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgKyBcInB4XCJcbiAgICBAY3NzIFwibGVmdFwiLCAoKCQod2luZG93KS53aWR0aCgpIC0gdGhpcy5vdXRlcldpZHRoKCkpIC8gMikgKyAkKHdpbmRvdykuc2Nyb2xsTGVmdCgpICsgXCJweFwiXG5cblxuKShqUXVlcnkpXG5cblxuU3RyaW5nLnByb3RvdHlwZS5zYWZldHlEYW5jZSA9IC0+IHRoaXMucmVwbGFjZSgvXFxzL2csIFwiX1wiKS5yZXBsYWNlKC9bXmEtekEtWjAtOV9dL2csXCJcIilcblN0cmluZy5wcm90b3R5cGUuZGF0YWJhc2VTYWZldHlEYW5jZSA9IC0+IHRoaXMucmVwbGFjZSgvXFxzL2csIFwiX1wiKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teYS16MC05Xy1dL2csXCJcIilcblN0cmluZy5wcm90b3R5cGUuY291bnQgPSAoc3Vic3RyaW5nKSAtPiB0aGlzLm1hdGNoKG5ldyBSZWdFeHAgc3Vic3RyaW5nLCBcImdcIik/Lmxlbmd0aCB8fCAwXG5cblxuTWF0aC5hdmUgPSAtPlxuICByZXN1bHQgPSAwXG4gIHJlc3VsdCArPSB4IGZvciB4IGluIGFyZ3VtZW50c1xuICByZXN1bHQgLz0gYXJndW1lbnRzLmxlbmd0aFxuICByZXR1cm4gcmVzdWx0XG5cbk1hdGguaXNJbnQgICAgPSAtPiByZXR1cm4gdHlwZW9mIG4gPT0gJ251bWJlcicgJiYgcGFyc2VGbG9hdChuKSA9PSBwYXJzZUludChuLCAxMCkgJiYgIWlzTmFOKG4pXG5NYXRoLmRlY2ltYWxzID0gKG51bSwgZGVjaW1hbHMpIC0+IG0gPSBNYXRoLnBvdyggMTAsIGRlY2ltYWxzICk7IG51bSAqPSBtOyBudW0gPSAgbnVtKyhgbnVtPDA/LTAuNTorMC41YCk+PjA7IG51bSAvPSBtXG5NYXRoLmNvbW1hcyAgID0gKG51bSkgLT4gcGFyc2VJbnQobnVtKS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLFwiKVxuTWF0aC5saW1pdCAgICA9IChtaW4sIG51bSwgbWF4KSAtPiBNYXRoLm1heChtaW4sIE1hdGgubWluKG51bSwgbWF4KSlcblxuIyBtZXRob2QgbmFtZSBzbGlnaHRseSBtaXNsZWFkaW5nXG4jIHJldHVybnMgdHJ1ZSBmb3IgZmFsc3kgdmFsdWVzXG4jICAgbnVsbCwgdW5kZWZpbmVkLCBhbmQgJ1xccyonXG4jIG90aGVyIGZhbHNlIHZhbHVlcyBsaWtlXG4jICAgZmFsc2UsIDBcbiMgcmV0dXJuIGZhbHNlXG5fLmlzRW1wdHlTdHJpbmcgPSAoIGFTdHJpbmcgKSAtPlxuICByZXR1cm4gdHJ1ZSBpZiBhU3RyaW5nIGlzIG51bGxcbiAgcmV0dXJuIGZhbHNlIHVubGVzcyBfLmlzU3RyaW5nKGFTdHJpbmcpIG9yIF8uaXNOdW1iZXIoYVN0cmluZylcbiAgYVN0cmluZyA9IFN0cmluZyhhU3RyaW5nKSBpZiBfLmlzTnVtYmVyKGFTdHJpbmcpXG4gIHJldHVybiB0cnVlIGlmIGFTdHJpbmcucmVwbGFjZSgvXFxzKi8sICcnKSA9PSAnJ1xuICByZXR1cm4gZmFsc2VcblxuXy5pbmRleEJ5ID0gKCBwcm9wZXJ0eU5hbWUsIG9iamVjdEFycmF5ICkgLT5cbiAgcmVzdWx0ID0ge31cbiAgZm9yIG9uZU9iamVjdCBpbiBvYmplY3RBcnJheVxuICAgIGlmIG9uZU9iamVjdFtwcm9wZXJ0eU5hbWVdP1xuICAgICAga2V5ID0gb25lT2JqZWN0W3Byb3BlcnR5TmFtZV1cbiAgICAgIHJlc3VsdFtrZXldID0gW10gaWYgbm90IHJlc3VsdFtrZXldP1xuICAgICAgcmVzdWx0W2tleV0ucHVzaChvbmVPYmplY3QpXG4gIHJldHVybiByZXN1bHRcblxuXG5jbGFzcyBVdGlsc1xuXG4gIEBleGVjdXRlOiAoIGZ1bmN0aW9ucyApIC0+XG5cbiAgICBzdGVwID0gLT5cbiAgICAgIG5leHRGdW5jdGlvbiA9IGZ1bmN0aW9ucy5zaGlmdCgpXG4gICAgICBuZXh0RnVuY3Rpb24/KHN0ZXApXG4gICAgc3RlcCgpXG5cbiAgQGNoYW5nZUxhbmd1YWdlIDogKGNvZGUsIGNhbGxiYWNrKSAtPlxuICAgIGkxOG4uc2V0TG5nIGNvZGUsIGNhbGxiYWNrXG5cblxuICBAdXBsb2FkQ29tcHJlc3NlZDogKGRvY0xpc3QpIC0+XG5cbiAgICBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIilcbiAgICBhLmhyZWYgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBIb3N0XCIpXG4gICAgaWYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImdyb3VwSG9zdFwiKSA9PSBcImxvY2FsaG9zdFwiXG4gICAgICBhbGxEb2NzVXJsID0gXCJodHRwOi8vI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBIb3N0XCIpfS9fY29yc19idWxrX2RvY3MvY2hlY2svI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ3JvdXBEQn1cIlxuICAgIGVsc2VcbiAgICAgIGFsbERvY3NVcmwgPSBcIiN7YS5wcm90b2NvbH0vLyN7YS5ob3N0fS9fY29yc19idWxrX2RvY3MvY2hlY2svI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ3JvdXBEQn1cIlxuXG4gICAgJChcIiN1cGxvYWRfcmVzdWx0c1wiKS5hcHBlbmQoJ0NvdW50IG9mIHJlc3VsdHMgdG8gY2hlY2sgaWYgYXZhaWxhYmxlIG9uIHNlcnZlcjogJyArIGRvY0xpc3QubGVuZ3RoICsgJzxici8+JylcblxuICAgIHJldHVybiAkLmFqYXhcbiAgICAgIHVybDogYWxsRG9jc1VybFxuICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgZGF0YTpcbiAgICAgICAga2V5czogSlNPTi5zdHJpbmdpZnkoZG9jTGlzdClcbiAgICAgICAgdXNlcjogVGFuZ2VyaW5lLnNldHRpbmdzLnVwVXNlclxuICAgICAgICBwYXNzOiBUYW5nZXJpbmUuc2V0dGluZ3MudXBQYXNzXG4gICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgIGVycm9yTWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5IGVcbiAgICAgICAgYWxlcnQgXCJFcnJvciBjb25uZWN0aW5nXCIgKyBlcnJvck1lc3NhZ2VcbiAgICAgICAgJChcIiN1cGxvYWRfcmVzdWx0c1wiKS5hcHBlbmQoJ0Vycm9yIGNvbm5lY3RpbmcgdG8gOiAnICsgYWxsRG9jc1VybCArICcgLSBFcnJvcjogJyArIGVycm9yTWVzc2FnZSArICc8YnIvPicpXG4gICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+XG4gICAgICAgICQoXCIjdXBsb2FkX3Jlc3VsdHNcIikuYXBwZW5kKCdSZWNlaXZlZCByZXNwb25zZSBmcm9tIHNlcnZlci4nKVxuICAgICAgICByb3dzID0gcmVzcG9uc2Uucm93c1xuICAgICAgICBsZWZ0VG9VcGxvYWQgPSBbXVxuICAgICAgICBmb3Igcm93IGluIHJvd3NcbiAgICAgICAgICBsZWZ0VG9VcGxvYWQucHVzaChyb3cua2V5KSBpZiByb3cuZXJyb3I/XG5cbiAgICAgICAgJChcIiN1cGxvYWRfcmVzdWx0c1wiKS5hcHBlbmQoJ0NvdW50IG9mIHJlc3VsdHMgdG8gdXBsb2FkOiAnICsgbGVmdFRvVXBsb2FkLmxlbmd0aCArICc8YnIvPicpXG5cbiAgICAgICAgIyBpZiBpdCdzIGFscmVhZHkgZnVsbHkgdXBsb2FkZWRcbiAgICAgICAgIyBtYWtlIHN1cmUgaXQncyBpbiB0aGUgbG9nXG5cbiAgICAgICAgVGFuZ2VyaW5lLmRiLmFsbERvY3MoaW5jbHVkZV9kb2NzOnRydWUsa2V5czpsZWZ0VG9VcGxvYWRcbiAgICAgICAgKS50aGVuKCAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgZG9jcyA9IHtcImRvY3NcIjpyZXNwb25zZS5yb3dzLm1hcCgoZWwpLT5lbC5kb2MpfVxuICAgICAgICAgIGNvbXByZXNzZWREYXRhID0gTFpTdHJpbmcuY29tcHJlc3NUb0Jhc2U2NChKU09OLnN0cmluZ2lmeShkb2NzKSlcbiAgICAgICAgICBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIilcbiAgICAgICAgICBhLmhyZWYgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBIb3N0XCIpXG4gICAgICAgICAgaWYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImdyb3VwSG9zdFwiKSA9PSBcImxvY2FsaG9zdFwiXG4gICAgICAgICAgICBidWxrRG9jc1VybCA9IFwiaHR0cDovLyN7VGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImdyb3VwSG9zdFwiKX0vX2NvcnNfYnVsa19kb2NzL3VwbG9hZC8je1RhbmdlcmluZS5zZXR0aW5ncy5ncm91cERCfVwiXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnVsa0RvY3NVcmwgPSBcIiN7YS5wcm90b2NvbH0vLyN7YS5ob3N0fS9fY29yc19idWxrX2RvY3MvdXBsb2FkLyN7VGFuZ2VyaW5lLnNldHRpbmdzLmdyb3VwREJ9XCJcblxuICAgICAgICAgICQuYWpheFxuICAgICAgICAgICAgdHlwZSA6IFwiUE9TVFwiXG4gICAgICAgICAgICB1cmwgOiBidWxrRG9jc1VybFxuICAgICAgICAgICAgZGF0YSA6IGNvbXByZXNzZWREYXRhXG4gICAgICAgICAgICBlcnJvcjogKGUpID0+XG4gICAgICAgICAgICAgIGVycm9yTWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5IGVcbiAgICAgICAgICAgICAgYWxlcnQgXCJTZXJ2ZXIgYnVsayBkb2NzIGVycm9yXCIgKyBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgJChcIiN1cGxvYWRfcmVzdWx0c1wiKS5hcHBlbmQoJ1NlcnZlciBidWxrIGRvY3MgZXJyb3IgOiAnICsgYnVsa0RvY3NVcmwgKyAnIC0gRXJyb3I6ICcgKyBlcnJvck1lc3NhZ2UgKyAnPGJyLz4nKVxuICAgICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgICAgVXRpbHMuc3RpY2t5IFwiUmVzdWx0cyB1cGxvYWRlZFwiXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICApXG5cblxuICBAdW5pdmVyc2FsVXBsb2FkOiAtPlxuICAgIHJlc3VsdHMgPSBuZXcgUmVzdWx0c1xuICAgIHJlc3VsdHMuZmV0Y2hcbiAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgIGRvY0xpc3QgPSByZXN1bHRzLnBsdWNrKFwiX2lkXCIpXG4gICAgICAgIFV0aWxzLnVwbG9hZENvbXByZXNzZWQoZG9jTGlzdClcblxuICBAc2F2ZURvY0xpc3RUb0ZpbGU6IC0+XG4gICAgVGFuZ2VyaW5lLmRiLmFsbERvY3MoaW5jbHVkZV9kb2NzOnRydWUpLnRoZW4oIChyZXNwb25zZSkgLT5cbiAgICAgIFV0aWxzLnNhdmVSZWNvcmRzVG9GaWxlKEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSlcbiAgICApXG5cbiAgQGNoZWNrU2Vzc2lvbjogKHVybCwgb3B0aW9ucykgLT5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAkLmFqYXhcbiAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICB1cmw6ICB1cmwsXG4gICAgICBhc3luYzogdHJ1ZSxcbiAgICAgIGRhdGE6IFwiXCIsXG4gICAgICBiZWZvcmVTZW5kOiAoeGhyKS0+XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAsXG4gICAgICBjb21wbGV0ZTogKHJlcSkgLT5cbiAgICAgICAgcmVzcCA9ICQucGFyc2VKU09OKHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICBpZiAocmVxLnN0YXR1cyA9PSAyMDApXG4gICAgICAgICAgY29uc29sZS5sb2coXCJMb2dnZWQgaW4uXCIpXG4gICAgICAgICAgaWYgb3B0aW9ucy5zdWNjZXNzXG4gICAgICAgICAgICBvcHRpb25zLnN1Y2Nlc3MocmVzcClcbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5lcnJvcilcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOlwiICsgcmVxLnN0YXR1cyArIFwiIHJlc3AuZXJyb3I6IFwiICsgcmVzcC5lcnJvcilcbiAgICAgICAgICBvcHRpb25zLmVycm9yKHJlcS5zdGF0dXMsIHJlc3AuZXJyb3IsIHJlc3AucmVhc29uKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGFsZXJ0KFwiQW4gZXJyb3Igb2NjdXJyZWQgZ2V0dGluZyBzZXNzaW9uIGluZm86IFwiICsgcmVzcC5yZWFzb24pXG5cbiAgQHJlc3RhcnRUYW5nZXJpbmU6IChtZXNzYWdlLCBjYWxsYmFjaykgLT5cbiAgICBVdGlscy5taWRBbGVydCBcIiN7bWVzc2FnZSB8fCAnUmVzdGFydGluZyBUYW5nZXJpbmUnfVwiXG4gICAgXy5kZWxheSggLT5cbiAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICBjYWxsYmFjaz8oKVxuICAgICwgMjAwMCApXG5cbiAgQG9uVXBkYXRlU3VjY2VzczogKHRvdGFsRG9jcykgLT5cbiAgICBVdGlscy5kb2N1bWVudENvdW50ZXIrK1xuICAgIGlmIFV0aWxzLmRvY3VtZW50Q291bnRlciA9PSB0b3RhbERvY3NcbiAgICAgIFV0aWxzLnJlc3RhcnRUYW5nZXJpbmUgXCJVcGRhdGUgc3VjY2Vzc2Z1bFwiLCAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiXCIsIGZhbHNlXG4gICAgICAgIFV0aWxzLmFza1RvTG9nb3V0KCkgdW5sZXNzIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpID09IFwic2VydmVyXCJcbiAgICAgIFV0aWxzLmRvY3VtZW50Q291bnRlciA9IG51bGxcblxuXG4gIEBsb2c6IChzZWxmLCBlcnJvcikgLT5cbiAgICBjbGFzc05hbWUgPSBzZWxmLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL2Z1bmN0aW9uXFxzKihcXHcrKS8pWzFdXG4gICAgY29uc29sZS5sb2cgXCIje2NsYXNzTmFtZX06ICN7ZXJyb3J9XCJcblxuICAjIGlmIGFyZ3MgaXMgb25lIG9iamVjdCBzYXZlIGl0IHRvIHRlbXBvcmFyeSBoYXNoXG4gICMgaWYgdHdvIHN0cmluZ3MsIHNhdmUga2V5IHZhbHVlIHBhaXJcbiAgIyBpZiBvbmUgc3RyaW5nLCB1c2UgYXMga2V5LCByZXR1cm4gdmFsdWVcbiAgQGRhdGE6IChhcmdzLi4uKSAtPlxuICAgIGlmIGFyZ3MubGVuZ3RoID09IDFcbiAgICAgIGFyZyA9IGFyZ3NbMF1cbiAgICAgIGlmIF8uaXNTdHJpbmcoYXJnKVxuICAgICAgICByZXR1cm4gVGFuZ2VyaW5lLnRlbXBEYXRhW2FyZ11cbiAgICAgIGVsc2UgaWYgXy5pc09iamVjdChhcmcpXG4gICAgICAgIFRhbmdlcmluZS50ZW1wRGF0YSA9ICQuZXh0ZW5kKFRhbmdlcmluZS50ZW1wRGF0YSwgYXJnKVxuICAgICAgZWxzZSBpZiBhcmcgPT0gbnVsbFxuICAgICAgICBUYW5nZXJpbmUudGVtcERhdGEgPSB7fVxuICAgIGVsc2UgaWYgYXJncy5sZW5ndGggPT0gMlxuICAgICAga2V5ID0gYXJnc1swXVxuICAgICAgdmFsdWUgPSBhcmdzWzFdXG4gICAgICBUYW5nZXJpbmUudGVtcERhdGFba2V5XSA9IHZhbHVlXG4gICAgICByZXR1cm4gVGFuZ2VyaW5lLnRlbXBEYXRhXG4gICAgZWxzZSBpZiBhcmdzLmxlbmd0aCA9PSAwXG4gICAgICByZXR1cm4gVGFuZ2VyaW5lLnRlbXBEYXRhXG5cblxuICBAd29ya2luZzogKGlzV29ya2luZykgLT5cbiAgICBpZiBpc1dvcmtpbmdcbiAgICAgIGlmIG5vdCBUYW5nZXJpbmUubG9hZGluZ1RpbWVyP1xuICAgICAgICBUYW5nZXJpbmUubG9hZGluZ1RpbWVyID0gc2V0VGltZW91dChVdGlscy5zaG93TG9hZGluZ0luZGljYXRvciwgMzAwMClcbiAgICBlbHNlXG4gICAgICBpZiBUYW5nZXJpbmUubG9hZGluZ1RpbWVyP1xuICAgICAgICBjbGVhclRpbWVvdXQgVGFuZ2VyaW5lLmxvYWRpbmdUaW1lclxuICAgICAgICBUYW5nZXJpbmUubG9hZGluZ1RpbWVyID0gbnVsbFxuXG4gICAgICAkKFwiLmxvYWRpbmdfYmFyXCIpLnJlbW92ZSgpXG5cbiAgQHNob3dMb2FkaW5nSW5kaWNhdG9yOiAtPlxuICAgICQoXCI8ZGl2IGNsYXNzPSdsb2FkaW5nX2Jhcic+PGltZyBjbGFzcz0nbG9hZGluZycgc3JjPSdpbWFnZXMvbG9hZGluZy5naWYnPjwvZGl2PlwiKS5hcHBlbmRUbyhcImJvZHlcIikubWlkZGxlQ2VudGVyKClcblxuICAjIGFza3MgZm9yIGNvbmZpcm1hdGlvbiBpbiB0aGUgYnJvd3NlciwgYW5kIHVzZXMgcGhvbmVnYXAgZm9yIGNvb2wgY29uZmlybWF0aW9uXG4gIEBjb25maXJtOiAobWVzc2FnZSwgb3B0aW9ucykgLT5cbiAgICBpZiBuYXZpZ2F0b3Iubm90aWZpY2F0aW9uPy5jb25maXJtP1xuICAgICAgbmF2aWdhdG9yLm5vdGlmaWNhdGlvbi5jb25maXJtIG1lc3NhZ2UsXG4gICAgICAgIChpbnB1dCkgLT5cbiAgICAgICAgICBpZiBpbnB1dCA9PSAxXG4gICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrIHRydWVcbiAgICAgICAgICBlbHNlIGlmIGlucHV0ID09IDJcbiAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2sgZmFsc2VcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrIGlucHV0XG4gICAgICAsIG9wdGlvbnMudGl0bGUsIG9wdGlvbnMuYWN0aW9uK1wiLENhbmNlbFwiXG4gICAgZWxzZVxuICAgICAgaWYgd2luZG93LmNvbmZpcm0gbWVzc2FnZVxuICAgICAgICBvcHRpb25zLmNhbGxiYWNrIHRydWVcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgb3B0aW9ucy5jYWxsYmFjayBmYWxzZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gMFxuXG4gICMgdGhpcyBmdW5jdGlvbiBpcyBhIGxvdCBsaWtlIGpRdWVyeS5zZXJpYWxpemVBcnJheSwgZXhjZXB0IHRoYXQgaXQgcmV0dXJucyB1c2VmdWwgb3V0cHV0XG4gICMgd29ya3Mgb24gdGV4dGFyZWFzLCBpbnB1dCB0eXBlIHRleHQgYW5kIHBhc3N3b3JkXG4gIEBnZXRWYWx1ZXM6ICggc2VsZWN0b3IgKSAtPlxuICAgIHZhbHVlcyA9IHt9XG4gICAgJChzZWxlY3RvcikuZmluZChcImlucHV0W3R5cGU9dGV4dF0sIGlucHV0W3R5cGU9cGFzc3dvcmRdLCB0ZXh0YXJlYVwiKS5lYWNoICggaW5kZXgsIGVsZW1lbnQgKSAtPlxuICAgICAgdmFsdWVzW2VsZW1lbnQuaWRdID0gZWxlbWVudC52YWx1ZVxuICAgIHJldHVybiB2YWx1ZXNcblxuICAjIGNvbnZlcnRzIHVybCBlc2NhcGVkIGNoYXJhY3RlcnNcbiAgQGNsZWFuVVJMOiAodXJsKSAtPlxuICAgIGlmIHVybC5pbmRleE9mPyhcIiVcIikgIT0gLTFcbiAgICAgIHVybCA9IGRlY29kZVVSSUNvbXBvbmVudCB1cmxcbiAgICBlbHNlXG4gICAgICB1cmxcblxuICAjIERpc3Bvc2FibGUgYWxlcnRzXG4gIEB0b3BBbGVydDogKGFsZXJ0VGV4dCwgZGVsYXkgPSAyMDAwKSAtPlxuICAgIFV0aWxzLmFsZXJ0IFwidG9wXCIsIGFsZXJ0VGV4dCwgZGVsYXlcblxuICBAbWlkQWxlcnQ6IChhbGVydFRleHQsIGRlbGF5PTIwMDApIC0+XG4gICAgVXRpbHMuYWxlcnQgXCJtaWRkbGVcIiwgYWxlcnRUZXh0LCBkZWxheVxuXG4gIEBhbGVydDogKCB3aGVyZSwgYWxlcnRUZXh0LCBkZWxheSA9IDIwMDAgKSAtPlxuXG4gICAgc3dpdGNoIHdoZXJlXG4gICAgICB3aGVuIFwidG9wXCJcbiAgICAgICAgc2VsZWN0b3IgPSBcIi50b3BfYWxlcnRcIlxuICAgICAgICBhbGlnbmVyID0gKCAkZWwgKSAtPiByZXR1cm4gJGVsLnRvcENlbnRlcigpXG4gICAgICB3aGVuIFwibWlkZGxlXCJcbiAgICAgICAgc2VsZWN0b3IgPSBcIi5taWRfYWxlcnRcIlxuICAgICAgICBhbGlnbmVyID0gKCAkZWwgKSAtPiByZXR1cm4gJGVsLm1pZGRsZUNlbnRlcigpXG5cblxuICAgIGlmIFV0aWxzW1wiI3t3aGVyZX1BbGVydFRpbWVyXCJdP1xuICAgICAgY2xlYXJUaW1lb3V0IFV0aWxzW1wiI3t3aGVyZX1BbGVydFRpbWVyXCJdXG4gICAgICAkYWxlcnQgPSAkKHNlbGVjdG9yKVxuICAgICAgJGFsZXJ0Lmh0bWwoICRhbGVydC5odG1sKCkgKyBcIjxicj5cIiArIGFsZXJ0VGV4dCApXG4gICAgZWxzZVxuICAgICAgJGFsZXJ0ID0gJChcIjxkaXYgY2xhc3M9JyN7c2VsZWN0b3Iuc3Vic3RyaW5nKDEpfSBkaXNwb3NhYmxlX2FsZXJ0Jz4je2FsZXJ0VGV4dH08L2Rpdj5cIikuYXBwZW5kVG8oXCIjY29udGVudFwiKVxuXG4gICAgYWxpZ25lcigkYWxlcnQpXG5cbiAgICBkbyAoJGFsZXJ0LCBzZWxlY3RvciwgZGVsYXkpIC0+XG4gICAgICBjb21wdXRlZERlbGF5ID0gKChcIlwiKyRhbGVydC5odG1sKCkpLm1hdGNoKC88YnI+L2cpfHxbXSkubGVuZ3RoICogMTUwMFxuICAgICAgVXRpbHNbXCIje3doZXJlfUFsZXJ0VGltZXJcIl0gPSBzZXRUaW1lb3V0IC0+XG4gICAgICAgICAgVXRpbHNbXCIje3doZXJlfUFsZXJ0VGltZXJcIl0gPSBudWxsXG4gICAgICAgICAgJGFsZXJ0LmZhZGVPdXQoMjUwLCAtPiAkKHRoaXMpLnJlbW92ZSgpIClcbiAgICAgICwgTWF0aC5tYXgoY29tcHV0ZWREZWxheSwgZGVsYXkpXG5cblxuXG4gIEBzdGlja3k6IChodG1sLCBidXR0b25UZXh0ID0gXCJDbG9zZVwiLCBjYWxsYmFjaywgcG9zaXRpb24gPSBcIm1pZGRsZVwiKSAtPlxuICAgIGRpdiA9ICQoXCI8ZGl2IGNsYXNzPSdzdGlja3lfYWxlcnQnPiN7aHRtbH08YnI+PGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBwYXJlbnRfcmVtb3ZlJz4je2J1dHRvblRleHR9PC9idXR0b24+PC9kaXY+XCIpLmFwcGVuZFRvKFwiI2NvbnRlbnRcIilcbiAgICBpZiBwb3NpdGlvbiA9PSBcIm1pZGRsZVwiXG4gICAgICBkaXYubWlkZGxlQ2VudGVyKClcbiAgICBlbHNlIGlmIHBvc2l0aW9uID09IFwidG9wXCJcbiAgICAgIGRpdi50b3BDZW50ZXIoKVxuICAgIGRpdi5vbihcImtleXVwXCIsIChldmVudCkgLT4gaWYgZXZlbnQud2hpY2ggPT0gMjcgdGhlbiAkKHRoaXMpLnJlbW92ZSgpKS5maW5kKFwiYnV0dG9uXCIpLmNsaWNrIGNhbGxiYWNrXG5cbiAgQHRvcFN0aWNreTogKGh0bWwsIGJ1dHRvblRleHQgPSBcIkNsb3NlXCIsIGNhbGxiYWNrKSAtPlxuICAgIFV0aWxzLnN0aWNreShodG1sLCBidXR0b25UZXh0LCBjYWxsYmFjaywgXCJ0b3BcIilcblxuXG5cbiAgQG1vZGFsOiAoaHRtbCkgLT5cbiAgICBpZiBodG1sID09IGZhbHNlXG4gICAgICAkKFwiI21vZGFsX2JhY2ssICNtb2RhbFwiKS5yZW1vdmUoKVxuICAgICAgcmV0dXJuXG5cbiAgICAkKFwiYm9keVwiKS5wcmVwZW5kKFwiPGRpdiBpZD0nbW9kYWxfYmFjayc+PC9kaXY+XCIpXG4gICAgJChcIjxkaXYgaWQ9J21vZGFsJz4je2h0bWx9PC9kaXY+XCIpLmFwcGVuZFRvKFwiI2NvbnRlbnRcIikubWlkZGxlQ2VudGVyKCkub24oXCJrZXl1cFwiLCAoZXZlbnQpIC0+IGlmIGV2ZW50LndoaWNoID09IDI3IHRoZW4gJChcIiNtb2RhbF9iYWNrLCAjbW9kYWxcIikucmVtb3ZlKCkpXG5cbiAgQHBhc3N3b3JkUHJvbXB0OiAoY2FsbGJhY2spIC0+XG4gICAgaHRtbCA9IFwiXG4gICAgICA8ZGl2IGlkPSdwYXNzX2Zvcm0nIHRpdGxlPSdVc2VyIHZlcmlmaWNhdGlvbic+XG4gICAgICAgIDxsYWJlbCBmb3I9J3Bhc3N3b3JkJz5QbGVhc2UgcmUtZW50ZXIgeW91ciBwYXNzd29yZDwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0ncGFzc192YWwnIHR5cGU9J3Bhc3N3b3JkJyBuYW1lPSdwYXNzd29yZCcgaWQ9J3Bhc3N3b3JkJyB2YWx1ZT0nJz5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCcgZGF0YS12ZXJpZnk9J3RydWUnPlZlcmlmeTwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIFwiXG5cbiAgICBVdGlscy5tb2RhbCBodG1sXG5cbiAgICAkcGFzcyA9ICQoXCIjcGFzc192YWxcIilcbiAgICAkYnV0dG9uID0gJChcIiNwYXNzX3ZhbGZvcm0gYnV0dG9uXCIpXG5cbiAgICAkcGFzcy5vbiBcImtleXVwXCIsIChldmVudCkgLT5cbiAgICAgIHJldHVybiB0cnVlIHVubGVzcyBldmVudC53aGljaCA9PSAxM1xuICAgICAgJGJ1dHRvbi5vZmYgXCJjbGlja1wiXG4gICAgICAkcGFzcy5vZmYgXCJjaGFuZ2VcIlxuXG4gICAgICBjYWxsYmFjayAkcGFzcy52YWwoKVxuICAgICAgVXRpbHMubW9kYWwgZmFsc2VcblxuICAgICRidXR0b24ub24gXCJjbGlja1wiLCAoZXZlbnQpIC0+XG4gICAgICAkYnV0dG9uLm9mZiBcImNsaWNrXCJcbiAgICAgICRwYXNzLm9mZiBcImNoYW5nZVwiXG5cbiAgICAgIGNhbGxiYWNrICRwYXNzLnZhbCgpIGlmICQoZXZlbnQudGFyZ2V0KS5hdHRyKFwiZGF0YS12ZXJpZnlcIikgPT0gXCJ0cnVlXCJcblxuICAgICAgVXRpbHMubW9kYWwgZmFsc2VcblxuXG5cbiAgIyByZXR1cm5zIGEgR1VJRFxuICBAZ3VpZDogLT5cbiAgIHJldHVybiBAUzQoKStAUzQoKStcIi1cIitAUzQoKStcIi1cIitAUzQoKStcIi1cIitAUzQoKStcIi1cIitAUzQoKStAUzQoKStAUzQoKVxuICBAUzQ6IC0+XG4gICByZXR1cm4gKCAoICggMSArIE1hdGgucmFuZG9tKCkgKSAqIDB4MTAwMDAgKSB8IDAgKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG5cbiAgQGh1bWFuR1VJRDogLT4gcmV0dXJuIEByYW5kb21MZXR0ZXJzKDQpK1wiLVwiK0ByYW5kb21MZXR0ZXJzKDQpK1wiLVwiK0ByYW5kb21MZXR0ZXJzKDQpXG4gIEBzYWZlTGV0dGVycyA9IFwiYWJjZGVmZ2hpamxtbm9wcXJzdHV2d3h5elwiLnNwbGl0KFwiXCIpXG4gIEByYW5kb21MZXR0ZXJzOiAobGVuZ3RoKSAtPlxuICAgIHJlc3VsdCA9IFwiXCJcbiAgICB3aGlsZSBsZW5ndGgtLVxuICAgICAgcmVzdWx0ICs9IFV0aWxzLnNhZmVMZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpVdGlscy5zYWZlTGV0dGVycy5sZW5ndGgpXVxuICAgIHJldHVybiByZXN1bHRcblxuICAjIHR1cm5zIHRoZSBib2R5IGJhY2tncm91bmQgYSBjb2xvciBhbmQgdGhlbiByZXR1cm5zIHRvIHdoaXRlXG4gIEBmbGFzaDogKGNvbG9yPVwicmVkXCIsIHNob3VsZFR1cm5JdE9uID0gbnVsbCkgLT5cblxuICAgIGlmIG5vdCBzaG91bGRUdXJuSXRPbj9cbiAgICAgIFV0aWxzLmJhY2tncm91bmQgY29sb3JcbiAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgVXRpbHMuYmFja2dyb3VuZCBcIlwiXG4gICAgICAsIDEwMDBcblxuICBAYmFja2dyb3VuZDogKGNvbG9yKSAtPlxuICAgIGlmIGNvbG9yP1xuICAgICAgJChcIiNjb250ZW50X3dyYXBwZXJcIikuY3NzIFwiYmFja2dyb3VuZENvbG9yXCIgOiBjb2xvclxuICAgIGVsc2VcbiAgICAgICQoXCIjY29udGVudF93cmFwcGVyXCIpLmNzcyBcImJhY2tncm91bmRDb2xvclwiXG5cbiAgIyBSZXRyaWV2ZXMgR0VUIHZhcmlhYmxlc1xuICAjIGh0dHA6Ly9lam9obi5vcmcvYmxvZy9zZWFyY2gtYW5kLWRvbnQtcmVwbGFjZS9cbiAgQCRfR0VUOiAocSwgcykgLT5cbiAgICB2YXJzID0ge31cbiAgICBwYXJ0cyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnJlcGxhY2UoL1s/Jl0rKFtePSZdKyk9KFteJl0qKS9naSwgKG0sa2V5LHZhbHVlKSAtPlxuICAgICAgICB2YWx1ZSA9IGlmIH52YWx1ZS5pbmRleE9mKFwiI1wiKSB0aGVuIHZhbHVlLnNwbGl0KFwiI1wiKVswXSBlbHNlIHZhbHVlXG4gICAgICAgIHZhcnNba2V5XSA9IHZhbHVlLnNwbGl0KFwiI1wiKVswXTtcbiAgICApXG4gICAgdmFyc1xuXG5cbiAgIyBub3QgY3VycmVudGx5IGltcGxlbWVudGVkIGJ1dCB3b3JraW5nXG4gIEByZXNpemVTY3JvbGxQYW5lOiAtPlxuICAgICQoXCIuc2Nyb2xsX3BhbmVcIikuaGVpZ2h0KCAkKHdpbmRvdykuaGVpZ2h0KCkgLSAoICQoXCIjbmF2aWdhdGlvblwiKS5oZWlnaHQoKSArICQoXCIjZm9vdGVyXCIpLmhlaWdodCgpICsgMTAwKSApXG5cbiAgIyBhc2tzIHVzZXIgaWYgdGhleSB3YW50IHRvIGxvZ291dFxuICBAYXNrVG9Mb2dvdXQ6IC0+IFRhbmdlcmluZS51c2VyLmxvZ291dCgpIGlmIGNvbmZpcm0oXCJXb3VsZCB5b3UgbGlrZSB0byBsb2dvdXQgbm93P1wiKVxuXG4gIEB1cGRhdGVGcm9tU2VydmVyOiAobW9kZWwpIC0+XG5cbiAgICBkS2V5ID0gbW9kZWwuaWQuc3Vic3RyKC01LCA1KVxuXG4gICAgQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgbG9va3VwXCJcblxuICAgIHNvdXJjZURCID0gVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwiZ3JvdXBcIilcbiAgICB0YXJnZXREQiA9IFRhbmdlcmluZS5jb25mLmRiX25hbWVcblxuICAgIHNvdXJjZURLZXkgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpXG5cbiAgICAjIyNcbiAgICBHZXRzIGEgbGlzdCBvZiBkb2N1bWVudHMgb24gYm90aCB0aGUgc2VydmVyIGFuZCBsb2NhbGx5LiBUaGVuIHJlcGxpY2F0ZXMgYWxsIGJ5IGlkLlxuICAgICMjI1xuXG4gICAgJC5hamF4XG4gICAgICB1cmw6IHNvdXJjZURLZXksXG4gICAgICB0eXBlOiBcIlBPU1RcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShrZXlzOmRLZXkpXG4gICAgICBlcnJvcjogKGEsIGIpIC0+IG1vZGVsLnRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgZXJyb3JcIiwgXCIje2F9ICN7Yn1cIlxuICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgIGRvY0xpc3QgPSBkYXRhLnJvd3MucmVkdWNlICgob2JqLCBjdXIpIC0+IG9ialtjdXIuaWRdID0gdHJ1ZSksIHt9XG5cbiAgICAgICAgVGFuZ2VyaW5lLmRiLnF1ZXJ5KFwiI3tUYW5nZXJpbmUuY29uZi5kZXNpZ25fZG9jfS9ieURLZXlcIixcbiAgICAgICAgICBrZXk6IGRLZXlcbiAgICAgICAgKS50aGVuIChyZXNwb25zZSkgLT5cbiAgICAgICAgICBjb25zb2xlLndhcm4gcmVzcG9uc2UgdW5sZXNzIHJlc3BvbnNlLnJvd3M/XG4gICAgICAgICAgZG9jTGlzdCA9IGRhdGEucm93cy5yZWR1Y2UgKChvYmosIGN1cikgLT4gb2JqW2N1ci5pZF0gPSB0cnVlKSwgZG9jTGlzdFxuICAgICAgICAgIGRvY0xpc3QgPSBPYmplY3Qua2V5cyhkb2NMaXN0KVxuICAgICAgICAgICQuY291Y2gucmVwbGljYXRlKFxuICAgICAgICAgICAgc291cmNlREIsXG4gICAgICAgICAgICB0YXJnZXREQiwge1xuICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgbW9kZWwudHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBzdWNjZXNzXCIsIHJlc3BvbnNlXG4gICAgICAgICAgICAgIGVycm9yOiAoYSwgYikgICAgICAtPiBtb2RlbC50cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGRvY19pZHM6IGRvY0xpc3RcbiAgICAgICAgICApXG5cbiAgQGxvYWREZXZlbG9wbWVudFBhY2tzOiAoY2FsbGJhY2spIC0+XG4gICAgJC5hamF4XG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIHVybDogXCJwYWNrcy5qc29uXCJcbiAgICAgIGVycm9yOiAocmVzKSAtPlxuICAgICAgICBjYWxsYmFjayhyZXMpXG4gICAgICBzdWNjZXNzOiAocmVzKSAtPlxuICAgICAgICBUYW5nZXJpbmUuZGIuYnVsa0RvY3MgcmVzLCAoZXJyb3IsIGRvYykgLT5cbiAgICAgICAgICBpZiBlcnJvciB0aGVuIGNhbGxiYWNrKGVycm9yKSBlbHNlIGNhbGxiYWNrKClcblxuXG5cblxuIyBSb2JiZXJ0IGludGVyZmFjZVxuY2xhc3MgUm9iYmVydFxuXG4gIEByZXF1ZXN0OiAob3B0aW9ucykgLT5cblxuICAgIHN1Y2Nlc3MgPSBvcHRpb25zLnN1Y2Nlc3NcbiAgICBlcnJvciAgID0gb3B0aW9ucy5lcnJvclxuXG4gICAgZGVsZXRlIG9wdGlvbnMuc3VjY2Vzc1xuICAgIGRlbGV0ZSBvcHRpb25zLmVycm9yXG5cbiAgICAkLmFqYXhcbiAgICAgIHR5cGUgICAgICAgIDogXCJQT1NUXCJcbiAgICAgIGNyb3NzRG9tYWluIDogdHJ1ZVxuICAgICAgdXJsICAgICAgICAgOiBUYW5nZXJpbmUuY29uZmlnLmdldChcInJvYmJlcnRcIilcbiAgICAgIGRhdGFUeXBlICAgIDogXCJqc29uXCJcbiAgICAgIGRhdGEgICAgICAgIDogb3B0aW9uc1xuICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgc3VjY2VzcyBkYXRhXG4gICAgICBlcnJvcjogKCBkYXRhICkgPT5cbiAgICAgICAgZXJyb3IgZGF0YVxuXG4jIFRyZWUgaW50ZXJmYWNlXG5jbGFzcyBUYW5nZXJpbmVUcmVlXG5cbiAgQG1ha2U6IChvcHRpb25zKSAtPlxuXG4gICAgVXRpbHMud29ya2luZyB0cnVlXG4gICAgc3VjY2VzcyA9IG9wdGlvbnMuc3VjY2Vzc1xuICAgIGVycm9yICAgPSBvcHRpb25zLmVycm9yXG5cbiAgICBkZWxldGUgb3B0aW9ucy5zdWNjZXNzXG4gICAgZGVsZXRlIG9wdGlvbnMuZXJyb3JcblxuICAgIG9wdGlvbnMudXNlciA9IFRhbmdlcmluZS51c2VyLm5hbWUoKVxuXG4gICAgJC5hamF4XG4gICAgICB0eXBlICAgICA6IFwiUE9TVFwiXG4gICAgICBjcm9zc0RvbWFpbiA6IHRydWVcbiAgICAgIHVybCAgICAgIDogVGFuZ2VyaW5lLmNvbmZpZy5nZXQoXCJ0cmVlXCIpICsgXCJtYWtlLyN7VGFuZ2VyaW5lLnNldHRpbmdzLmdldCgnZ3JvdXBOYW1lJyl9XCJcbiAgICAgIGRhdGFUeXBlIDogXCJqc29uXCJcbiAgICAgIGRhdGEgICAgIDogb3B0aW9uc1xuICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgc3VjY2VzcyBkYXRhXG4gICAgICBlcnJvcjogKCBkYXRhICkgPT5cbiAgICAgICAgZXJyb3IgZGF0YSwgSlNPTi5wYXJzZShkYXRhLnJlc3BvbnNlVGV4dClcbiAgICAgIGNvbXBsZXRlOiAtPlxuICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG5cblxuXG4jI1VJIGhlbHBlcnNcbiQgLT5cbiAgIyAjIyMuY2xlYXJfbWVzc2FnZVxuICAjIFRoaXMgbGl0dGxlIGd1eSB3aWxsIGZhZGUgb3V0IGFuZCBjbGVhciBoaW0gYW5kIGhpcyBwYXJlbnRzLiBXcmFwIGhpbSB3aXNlbHkuXG4gICMgYDxzcGFuPiBteSBtZXNzYWdlIDxidXR0b24gY2xhc3M9XCJjbGVhcl9tZXNzYWdlXCI+WDwvYnV0dG9uPmBcbiAgJChcIiNjb250ZW50XCIpLm9uKFwiY2xpY2tcIiwgXCIuY2xlYXJfbWVzc2FnZVwiLCAgbnVsbCwgKGEpIC0+ICQoYS50YXJnZXQpLnBhcmVudCgpLmZhZGVPdXQoMjUwLCAtPiAkKHRoaXMpLmVtcHR5KCkuc2hvdygpICkgKVxuICAkKFwiI2NvbnRlbnRcIikub24oXCJjbGlja1wiLCBcIi5wYXJlbnRfcmVtb3ZlXCIsIG51bGwsIChhKSAtPiAkKGEudGFyZ2V0KS5wYXJlbnQoKS5mYWRlT3V0KDI1MCwgLT4gJCh0aGlzKS5yZW1vdmUoKSApIClcblxuICAjIGRpc3Bvc2FibGUgYWxlcnRzID0gYSBub24tZmFuY3kgYm94XG4gICQoXCIjY29udGVudFwiKS5vbiBcImNsaWNrXCIsXCIuYWxlcnRfYnV0dG9uXCIsIC0+XG4gICAgYWxlcnRfdGV4dCA9IGlmICQodGhpcykuYXR0cihcImRhdGEtYWxlcnRcIikgdGhlbiAkKHRoaXMpLmF0dHIoXCJkYXRhLWFsZXJ0XCIpIGVsc2UgJCh0aGlzKS52YWwoKVxuICAgIFV0aWxzLmRpc3Bvc2FibGVBbGVydCBhbGVydF90ZXh0XG4gICQoXCIjY29udGVudFwiKS5vbiBcImNsaWNrXCIsIFwiLmRpc3Bvc2FibGVfYWxlcnRcIiwgLT5cbiAgICAkKHRoaXMpLnN0b3AoKS5mYWRlT3V0IDEwMCwgLT5cbiAgICAgICQodGhpcykucmVtb3ZlKClcblxuICAjICQod2luZG93KS5yZXNpemUgVXRpbHMucmVzaXplU2Nyb2xsUGFuZVxuICAjIFV0aWxzLnJlc2l6ZVNjcm9sbFBhbmUoKVxuXG4jIEhhbmRsZWJhcnMgcGFydGlhbHNcbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2dyaWRMYWJlbCcsIChpdGVtcyxpdGVtTWFwLGluZGV4KSAtPlxuIyAgXy5lc2NhcGUoaXRlbXNbaXRlbU1hcFtkb25lXV0pXG4gIF8uZXNjYXBlKGl0ZW1zW2l0ZW1NYXBbaW5kZXhdXSlcbilcbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3N0YXJ0Um93JywgKGluZGV4KSAtPlxuICBjb25zb2xlLmxvZyhcImluZGV4OiBcIiArIGluZGV4KVxuICBpZiBpbmRleCA9PSAwXG4gICAgXCI8dHI+XCJcbilcbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2VuZFJvdycsIChpbmRleCkgLT5cbiAgY29uc29sZS5sb2coXCJpbmRleDogXCIgKyBpbmRleClcbiAgaWYgaW5kZXggPT0gMFxuICAgIFwiPC90cj5cIlxuKVxuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdzdGFydENlbGwnLCAoaW5kZXgpIC0+XG4gIGNvbnNvbGUubG9nKFwiaW5kZXg6IFwiICsgaW5kZXgpXG4gIGlmIGluZGV4ID09IDBcbiAgICBcIjx0ZD48L3RkPlwiXG4pXG5cbiMvKlxuIyAgICogVXNlIHRoaXMgdG8gdHVybiBvbiBsb2dnaW5nOlxuIyAgICovXG5IYW5kbGViYXJzLmxvZ2dlci5sb2cgPSAobGV2ZWwpLT5cbiAgaWYgIGxldmVsID49IEhhbmRsZWJhcnMubG9nZ2VyLmxldmVsXG4gICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgW10uY29uY2F0KFtcIkhhbmRsZWJhcnM6IFwiXSwgXy50b0FycmF5KGFyZ3VtZW50cykpKVxuXG4jIy8vIERFQlVHOiAwLCBJTkZPOiAxLCBXQVJOOiAyLCBFUlJPUjogMyxcbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIEhhbmRsZWJhcnMubG9nZ2VyLmxvZyk7XG4jIy8vIFN0ZCBsZXZlbCBpcyAzLCB3aGVuIHNldCB0byAwLCBoYW5kbGViYXJzIHdpbGwgbG9nIGFsbCBjb21waWxhdGlvbiByZXN1bHRzXG5IYW5kbGViYXJzLmxvZ2dlci5sZXZlbCA9IDM7XG5cbiMvKlxuIyAgICogTG9nIGNhbiBhbHNvIGJlIHVzZWQgaW4gdGVtcGxhdGVzOiAne3tsb2cgMCB0aGlzIFwibXlTdHJpbmdcIiBhY2NvdW50TmFtZX19J1xuIyAgICogTG9ncyBhbGwgdGhlIHBhc3NlZCBkYXRhIHdoZW4gbG9nZ2VyLmxldmVsID0gMFxuIyAgICovXG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoXCJkZWJ1Z1wiLCAob3B0aW9uYWxWYWx1ZSktPlxuICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgQ29udGV4dFwiKVxuICBjb25zb2xlLmxvZyhcIj09PT09PT09PT09PT09PT09PT09XCIpXG4gIGNvbnNvbGUubG9nKHRoaXMpXG5cbiAgaWYgb3B0aW9uYWxWYWx1ZVxuICAgIGNvbnNvbGUubG9nKFwiVmFsdWVcIilcbiAgICBjb25zb2xlLmxvZyhcIj09PT09PT09PT09PT09PT09PT09XCIpXG4gICAgY29uc29sZS5sb2cob3B0aW9uYWxWYWx1ZSlcbilcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbW9udGhEcm9wZG93bicsIChtb250aHMsIGN1cnJlbnRNb250aCktPlxuICByZW5kZXJPcHRpb24gPSAobW9udGgsIGN1cnJlbnRNb250aCktPlxuICAgIG91dCA9IFwiPG9wdGlvbiB2YWx1ZT0nXCIgKyBtb250aCArIFwiJ1wiXG4gICAgaWYgbW9udGggPT0gY3VycmVudE1vbnRoXG4gICAgICBvdXQgPSBvdXQgKyBcInNlbGVjdGVkPSdzZWxlY3RlZCdcIlxuICAgIG91dCA9IG91dCArICBcIj5cIiArIG1vbnRoLnRpdGxlaXplKCkgKyBcIjwvb3B0aW9uPlwiXG4gICAgcmV0dXJuIG91dFxuICByZW5kZXJPcHRpb24obW9udGgsIGN1cnJlbnRNb250aCkgZm9yIG1vbnRoIGluIG1vbnRoc1xuKVxuIl19

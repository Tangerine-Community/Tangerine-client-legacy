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
    $("#upload_results").append(t("Utils.message.checkingServer") + '&nbsp' + docList.length + '<br/>');
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
          $("#upload_results").append('Received response from server.<br/>');
          rows = response.rows;
          leftToUpload = [];
          for (i = 0, len = rows.length; i < len; i++) {
            row = rows[i];
            if (row.error != null) {
              leftToUpload.push(row.key);
            }
          }
          if (leftToUpload.length > 0) {
            $("#upload_results").append(t("Utils.message.countTabletResults") + '&nbsp' + leftToUpload.length + '<br/>');
          } else {
            $("#upload_results").append(t("Utils.message.noUpload") + '<br/>');
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
                  return $("#upload_results").append(t("Utils.message.bulkDocsError") + bulkDocsUrl + ' - ' + t("Utils.message.error") + ': ' + errorMessage + '<br/>');
                };
              })(this),
              success: (function(_this) {
                return function() {
                  Utils.sticky(t("Utils.message.resultsUploaded"));
                  $("#upload_results").append(t("Utils.message.resultsUploaded") + '<br/>');
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
        console.log("results: " + JSON.stringify(results));
        return Utils.saveRecordsToFile(JSON.stringify(results));
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

//# sourceMappingURL=data:application/json;base64,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LEdBQVAsR0FBYSxLQUFLLENBQUMsUUFBTixDQUFBLENBQWIsR0FBZ0M7QUFDdEMsV0FBTztFQUxNO0FBTWY7T0FBQSx3Q0FBQTs7a0JBQUEsWUFBQSxDQUFhLEtBQWIsRUFBb0IsWUFBcEI7QUFBQTs7QUFQeUMsQ0FBM0MiLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiNcbiMgU2tpcCBsb2dpY1xuI1xuXG4jIHRoZXNlIGNvdWxkIGVhc2lseSBiZSByZWZhY3RvcmVkIGludG8gb25lLlxuXG5SZXN1bHRPZlF1ZXN0aW9uID0gKG5hbWUpIC0+XG4gIHJldHVyblZpZXcgPSBudWxsXG4jICB2aWV3TWFzdGVyLnN1YnRlc3RWaWV3c1tpbmRleF0ucHJvdG90eXBlVmlldy5xdWVzdGlvblZpZXdzLmZvckVhY2ggKGNhbmRpZGF0ZVZpZXcpIC0+XG4gIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlldy5xdWVzdGlvblZpZXdzLmZvckVhY2ggKGNhbmRpZGF0ZVZpZXcpIC0+XG4gICAgaWYgY2FuZGlkYXRlVmlldy5tb2RlbC5nZXQoXCJuYW1lXCIpID09IG5hbWVcbiAgICAgIHJldHVyblZpZXcgPSBjYW5kaWRhdGVWaWV3XG4gIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIlJlc3VsdE9mUXVlc3Rpb24gY291bGQgbm90IGZpbmQgdmFyaWFibGUgI3tuYW1lfVwiKSBpZiByZXR1cm5WaWV3ID09IG51bGxcbiAgcmV0dXJuIHJldHVyblZpZXcuYW5zd2VyIGlmIHJldHVyblZpZXcuYW5zd2VyXG4gIHJldHVybiBudWxsXG5cblJlc3VsdE9mTXVsdGlwbGUgPSAobmFtZSkgLT5cbiAgcmV0dXJuVmlldyA9IG51bGxcbiMgIHZpZXdNYXN0ZXIuc3VidGVzdFZpZXdzW2luZGV4XS5wcm90b3R5cGVWaWV3LnF1ZXN0aW9uVmlld3MuZm9yRWFjaCAoY2FuZGlkYXRlVmlldykgLT5cbiAgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3LnF1ZXN0aW9uVmlld3MuZm9yRWFjaCAoY2FuZGlkYXRlVmlldykgLT5cbiAgICBpZiBjYW5kaWRhdGVWaWV3Lm1vZGVsLmdldChcIm5hbWVcIikgPT0gbmFtZVxuICAgICAgcmV0dXJuVmlldyA9IGNhbmRpZGF0ZVZpZXdcbiAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiUmVzdWx0T2ZRdWVzdGlvbiBjb3VsZCBub3QgZmluZCB2YXJpYWJsZSAje25hbWV9XCIpIGlmIHJldHVyblZpZXcgPT0gbnVsbFxuXG4gIHJlc3VsdCA9IFtdXG4gIGZvciBrZXksIHZhbHVlIG9mIHJldHVyblZpZXcuYW5zd2VyXG4gICAgcmVzdWx0LnB1c2gga2V5IGlmIHZhbHVlID09IFwiY2hlY2tlZFwiXG4gIHJldHVybiByZXN1bHRcblxuUmVzdWx0T2ZQcmV2aW91cyA9IChuYW1lKSAtPlxuICBpZiB0eXBlb2Ygdm0uY3VycmVudFZpZXcucmVzdWx0ID09ICd1bmRlZmluZWQnXG4gICAgY29uc29sZS5sb2coXCJVc2luZyBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXdcIilcbiAgICByZXR1cm4gVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3Lm1vZGVsLnBhcmVudC5yZXN1bHQuZ2V0VmFyaWFibGUobmFtZSlcbiAgZWxzZVxuICAgIHJldHVybiB2bS5jdXJyZW50Vmlldy5yZXN1bHQuZ2V0VmFyaWFibGUobmFtZSlcblxuUmVzdWx0T2ZHcmlkID0gKG5hbWUpIC0+XG4gIGlmIHR5cGVvZiB2bS5jdXJyZW50Vmlldy5yZXN1bHQgPT0gJ3VuZGVmaW5lZCdcbiAgICBjb25zb2xlLmxvZyhcIlVzaW5nIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1wiKVxuICAgIHJldHVybiBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcubW9kZWwucGFyZW50LnJlc3VsdC5nZXRJdGVtUmVzdWx0Q291bnRCeVZhcmlhYmxlTmFtZShuYW1lLCBcImNvcnJlY3RcIilcbiAgZWxzZVxuICAgIHJldHVybiB2bS5jdXJyZW50Vmlldy5yZXN1bHQuZ2V0VmFyaWFibGUobmFtZSlcbiNcbiMgVGFuZ2VyaW5lIGJhY2tidXR0b24gaGFuZGxlclxuI1xuJC5leHRlbmQoVGFuZ2VyaW5lLFRhbmdlcmluZVZlcnNpb24pXG5UYW5nZXJpbmUub25CYWNrQnV0dG9uID0gKGV2ZW50KSAtPlxuICBpZiBUYW5nZXJpbmUuYWN0aXZpdHkgPT0gXCJhc3Nlc3NtZW50IHJ1blwiXG4gICAgaWYgY29uZmlybSB0KFwiTmF2aWdhdGlvblZpZXcubWVzc2FnZS5pbmNvbXBsZXRlX21haW5fc2NyZWVuXCIpXG4gICAgICBUYW5nZXJpbmUuYWN0aXZpdHkgPSBcIlwiXG4gICAgICB3aW5kb3cuaGlzdG9yeS5iYWNrKClcbiAgICBlbHNlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgZWxzZVxuICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKVxuXG5cblxuIyBFeHRlbmQgZXZlcnkgdmlldyB3aXRoIGEgY2xvc2UgbWV0aG9kLCB1c2VkIGJ5IFZpZXdNYW5hZ2VyXG5CYWNrYm9uZS5WaWV3LnByb3RvdHlwZS5jbG9zZSA9IC0+XG4gIEByZW1vdmUoKVxuICBAdW5iaW5kKClcbiAgQG9uQ2xvc2U/KClcblxuXG5cbiMgUmV0dXJucyBhbiBvYmplY3QgaGFzaGVkIGJ5IGEgZ2l2ZW4gYXR0cmlidXRlLlxuQmFja2JvbmUuQ29sbGVjdGlvbi5wcm90b3R5cGUuaW5kZXhCeSA9ICggYXR0ciApIC0+XG4gIHJlc3VsdCA9IHt9XG4gIEBtb2RlbHMuZm9yRWFjaCAob25lTW9kZWwpIC0+XG4gICAgaWYgb25lTW9kZWwuaGFzKGF0dHIpXG4gICAgICBrZXkgPSBvbmVNb2RlbC5nZXQoYXR0cilcbiAgICAgIHJlc3VsdFtrZXldID0gW10gaWYgbm90IHJlc3VsdFtrZXldP1xuICAgICAgcmVzdWx0W2tleV0ucHVzaChvbmVNb2RlbClcbiAgcmV0dXJuIHJlc3VsdFxuXG4jIFJldHVybnMgYW4gb2JqZWN0IGhhc2hlZCBieSBhIGdpdmVuIGF0dHJpYnV0ZS5cbkJhY2tib25lLkNvbGxlY3Rpb24ucHJvdG90eXBlLmluZGV4QXJyYXlCeSA9ICggYXR0ciApIC0+XG4gIHJlc3VsdCA9IFtdXG4gIEBtb2RlbHMuZm9yRWFjaCAob25lTW9kZWwpIC0+XG4gICAgaWYgb25lTW9kZWwuaGFzKGF0dHIpXG4gICAgICBrZXkgPSBvbmVNb2RlbC5nZXQoYXR0cilcbiAgICAgIHJlc3VsdFtrZXldID0gW10gaWYgbm90IHJlc3VsdFtrZXldP1xuICAgICAgcmVzdWx0W2tleV0ucHVzaChvbmVNb2RlbClcbiAgcmV0dXJuIHJlc3VsdFxuXG5cbiMgVGhpcyBpcyBmb3IgUG91Y2hEQidzIHN0eWxlIG9mIHJldHVybmluZyBkb2N1bWVudHNcbkJhY2tib25lLkNvbGxlY3Rpb24ucHJvdG90eXBlLnBhcnNlID0gKHJlc3VsdCkgLT5cbiAgcmV0dXJuIF8ucGx1Y2sgcmVzdWx0LnJvd3MsICdkb2MnXG5cblxuIyBieSBkZWZhdWx0IGFsbCBtb2RlbHMgd2lsbCBzYXZlIGEgdGltZXN0YW1wIGFuZCBoYXNoIG9mIHNpZ25pZmljYW50IGF0dHJpYnV0ZXNcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5fc2F2ZSA9IEJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5zYXZlXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuc2F2ZSA9IC0+XG4gIEBiZWZvcmVTYXZlPygpXG4gIEBzdGFtcCgpXG4gIEBfc2F2ZS5hcHBseShALCBhcmd1bWVudHMpXG5cbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5zdGFtcCA9IC0+XG4gIEBzZXRcbiAgICBlZGl0ZWRCeSA6IFRhbmdlcmluZT8udXNlcj8ubmFtZSgpIHx8IFwidW5rbm93blwiXG4gICAgdXBkYXRlZCA6IChuZXcgRGF0ZSgpKS50b1N0cmluZygpXG4gICAgZnJvbUluc3RhbmNlSWQgOiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0U3RyaW5nKFwiaW5zdGFuY2VJZFwiKVxuICAgIGNvbGxlY3Rpb24gOiBAdXJsXG4gICwgc2lsZW50OiB0cnVlXG5cblxuI1xuIyBUaGlzIHNlcmllcyBvZiBmdW5jdGlvbnMgcmV0dXJucyBwcm9wZXJ0aWVzIHdpdGggZGVmYXVsdCB2YWx1ZXMgaWYgbm8gcHJvcGVydHkgaXMgZm91bmRcbiMgQGdvdGNoYSBiZSBtaW5kZnVsIG9mIHRoZSBkZWZhdWx0IFwiYmxhbmtcIiB2YWx1ZXMgc2V0IGhlcmVcbiNcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5nZXROdW1iZXIgPSAgICAgICAgKGtleSwgZmFsbGJhY2sgPSAwKSAgLT4gcmV0dXJuIGlmIEBoYXMoa2V5KSB0aGVuIHBhcnNlSW50KEBnZXQoa2V5KSkgZWxzZSBmYWxsYmFja1xuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldEFycmF5ID0gICAgICAgICAoa2V5LCBmYWxsYmFjayA9IFtdKSAtPiByZXR1cm4gaWYgQGhhcyhrZXkpIHRoZW4gQGdldChrZXkpICAgICAgICAgICBlbHNlIGZhbGxiYWNrXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZ2V0U3RyaW5nID0gICAgICAgIChrZXksIGZhbGxiYWNrID0gJycpIC0+IHJldHVybiBpZiBAaGFzKGtleSkgdGhlbiBAZ2V0KGtleSkgICAgICAgICAgIGVsc2UgZmFsbGJhY2tcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5nZXRFc2NhcGVkU3RyaW5nID0gKGtleSwgZmFsbGJhY2sgPSAnJykgLT4gcmV0dXJuIGlmIEBoYXMoa2V5KSB0aGVuIEBlc2NhcGUoa2V5KSAgICAgICAgZWxzZSBmYWxsYmFja1xuIyB0aGlzIHNlZW1zIHRvbyBpbXBvcnRhbnQgdG8gdXNlIGEgZGVmYXVsdFxuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldEJvb2xlYW4gPSAgICAgICAoa2V5KSAtPiByZXR1cm4gaWYgQGhhcyhrZXkpIHRoZW4gKEBnZXQoa2V5KSA9PSB0cnVlIG9yIEBnZXQoa2V5KSA9PSAndHJ1ZScpXG5cblxuI1xuIyBoYW5keSBqcXVlcnkgZnVuY3Rpb25zXG4jXG4oICgkKSAtPlxuXG4gICQuZm4uc2Nyb2xsVG8gPSAoc3BlZWQgPSAyNTAsIGNhbGxiYWNrKSAtPlxuICAgIHRyeVxuICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUge1xuICAgICAgICBzY3JvbGxUb3A6ICQoQCkub2Zmc2V0KCkudG9wICsgJ3B4J1xuICAgICAgICB9LCBzcGVlZCwgbnVsbCwgY2FsbGJhY2tcbiAgICBjYXRjaCBlXG4gICAgICBjb25zb2xlLmxvZyBcImVycm9yXCIsIGVcbiAgICAgIGNvbnNvbGUubG9nIFwiU2Nyb2xsIGVycm9yIHdpdGggJ3RoaXMnXCIsIEBcblxuICAgIHJldHVybiBAXG5cbiAgIyBwbGFjZSBzb21ldGhpbmcgdG9wIGFuZCBjZW50ZXJcbiAgJC5mbi50b3BDZW50ZXIgPSAtPlxuICAgIEBjc3MgXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCJcbiAgICBAY3NzIFwidG9wXCIsICQod2luZG93KS5zY3JvbGxUb3AoKSArIFwicHhcIlxuICAgIEBjc3MgXCJsZWZ0XCIsICgoJCh3aW5kb3cpLndpZHRoKCkgLSBAb3V0ZXJXaWR0aCgpKSAvIDIpICsgJCh3aW5kb3cpLnNjcm9sbExlZnQoKSArIFwicHhcIlxuXG4gICMgcGxhY2Ugc29tZXRoaW5nIG1pZGRsZSBjZW50ZXJcbiAgJC5mbi5taWRkbGVDZW50ZXIgPSAtPlxuICAgIEBjc3MgXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCJcbiAgICBAY3NzIFwidG9wXCIsICgoJCh3aW5kb3cpLmhlaWdodCgpIC0gdGhpcy5vdXRlckhlaWdodCgpKSAvIDIpICsgJCh3aW5kb3cpLnNjcm9sbFRvcCgpICsgXCJweFwiXG4gICAgQGNzcyBcImxlZnRcIiwgKCgkKHdpbmRvdykud2lkdGgoKSAtIHRoaXMub3V0ZXJXaWR0aCgpKSAvIDIpICsgJCh3aW5kb3cpLnNjcm9sbExlZnQoKSArIFwicHhcIlxuXG5cbikoalF1ZXJ5KVxuXG5cblN0cmluZy5wcm90b3R5cGUuc2FmZXR5RGFuY2UgPSAtPiB0aGlzLnJlcGxhY2UoL1xccy9nLCBcIl9cIikucmVwbGFjZSgvW15hLXpBLVowLTlfXS9nLFwiXCIpXG5TdHJpbmcucHJvdG90eXBlLmRhdGFiYXNlU2FmZXR5RGFuY2UgPSAtPiB0aGlzLnJlcGxhY2UoL1xccy9nLCBcIl9cIikudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV8tXS9nLFwiXCIpXG5TdHJpbmcucHJvdG90eXBlLmNvdW50ID0gKHN1YnN0cmluZykgLT4gdGhpcy5tYXRjaChuZXcgUmVnRXhwIHN1YnN0cmluZywgXCJnXCIpPy5sZW5ndGggfHwgMFxuXG5cbk1hdGguYXZlID0gLT5cbiAgcmVzdWx0ID0gMFxuICByZXN1bHQgKz0geCBmb3IgeCBpbiBhcmd1bWVudHNcbiAgcmVzdWx0IC89IGFyZ3VtZW50cy5sZW5ndGhcbiAgcmV0dXJuIHJlc3VsdFxuXG5NYXRoLmlzSW50ICAgID0gLT4gcmV0dXJuIHR5cGVvZiBuID09ICdudW1iZXInICYmIHBhcnNlRmxvYXQobikgPT0gcGFyc2VJbnQobiwgMTApICYmICFpc05hTihuKVxuTWF0aC5kZWNpbWFscyA9IChudW0sIGRlY2ltYWxzKSAtPiBtID0gTWF0aC5wb3coIDEwLCBkZWNpbWFscyApOyBudW0gKj0gbTsgbnVtID0gIG51bSsoYG51bTwwPy0wLjU6KzAuNWApPj4wOyBudW0gLz0gbVxuTWF0aC5jb21tYXMgICA9IChudW0pIC0+IHBhcnNlSW50KG51bSkudG9TdHJpbmcoKS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBcIixcIilcbk1hdGgubGltaXQgICAgPSAobWluLCBudW0sIG1heCkgLT4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihudW0sIG1heCkpXG5cbiMgbWV0aG9kIG5hbWUgc2xpZ2h0bHkgbWlzbGVhZGluZ1xuIyByZXR1cm5zIHRydWUgZm9yIGZhbHN5IHZhbHVlc1xuIyAgIG51bGwsIHVuZGVmaW5lZCwgYW5kICdcXHMqJ1xuIyBvdGhlciBmYWxzZSB2YWx1ZXMgbGlrZVxuIyAgIGZhbHNlLCAwXG4jIHJldHVybiBmYWxzZVxuXy5pc0VtcHR5U3RyaW5nID0gKCBhU3RyaW5nICkgLT5cbiAgcmV0dXJuIHRydWUgaWYgYVN0cmluZyBpcyBudWxsXG4gIHJldHVybiBmYWxzZSB1bmxlc3MgXy5pc1N0cmluZyhhU3RyaW5nKSBvciBfLmlzTnVtYmVyKGFTdHJpbmcpXG4gIGFTdHJpbmcgPSBTdHJpbmcoYVN0cmluZykgaWYgXy5pc051bWJlcihhU3RyaW5nKVxuICByZXR1cm4gdHJ1ZSBpZiBhU3RyaW5nLnJlcGxhY2UoL1xccyovLCAnJykgPT0gJydcbiAgcmV0dXJuIGZhbHNlXG5cbl8uaW5kZXhCeSA9ICggcHJvcGVydHlOYW1lLCBvYmplY3RBcnJheSApIC0+XG4gIHJlc3VsdCA9IHt9XG4gIGZvciBvbmVPYmplY3QgaW4gb2JqZWN0QXJyYXlcbiAgICBpZiBvbmVPYmplY3RbcHJvcGVydHlOYW1lXT9cbiAgICAgIGtleSA9IG9uZU9iamVjdFtwcm9wZXJ0eU5hbWVdXG4gICAgICByZXN1bHRba2V5XSA9IFtdIGlmIG5vdCByZXN1bHRba2V5XT9cbiAgICAgIHJlc3VsdFtrZXldLnB1c2gob25lT2JqZWN0KVxuICByZXR1cm4gcmVzdWx0XG5cblxuY2xhc3MgVXRpbHNcblxuICBAZXhlY3V0ZTogKCBmdW5jdGlvbnMgKSAtPlxuXG4gICAgc3RlcCA9IC0+XG4gICAgICBuZXh0RnVuY3Rpb24gPSBmdW5jdGlvbnMuc2hpZnQoKVxuICAgICAgbmV4dEZ1bmN0aW9uPyhzdGVwKVxuICAgIHN0ZXAoKVxuXG4gIEBjaGFuZ2VMYW5ndWFnZSA6IChjb2RlLCBjYWxsYmFjaykgLT5cbiAgICBpMThuLnNldExuZyBjb2RlLCBjYWxsYmFja1xuXG5cbiAgQHVwbG9hZENvbXByZXNzZWQ6IChkb2NMaXN0KSAtPlxuXG4gICAgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpXG4gICAgYS5ocmVmID0gVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImdyb3VwSG9zdFwiKVxuICAgIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJncm91cEhvc3RcIikgPT0gXCJsb2NhbGhvc3RcIlxuICAgICAgYWxsRG9jc1VybCA9IFwiaHR0cDovLyN7VGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImdyb3VwSG9zdFwiKX0vX2NvcnNfYnVsa19kb2NzL2NoZWNrLyN7VGFuZ2VyaW5lLnNldHRpbmdzLmdyb3VwREJ9XCJcbiAgICBlbHNlXG4gICAgICBhbGxEb2NzVXJsID0gXCIje2EucHJvdG9jb2x9Ly8je2EuaG9zdH0vX2NvcnNfYnVsa19kb2NzL2NoZWNrLyN7VGFuZ2VyaW5lLnNldHRpbmdzLmdyb3VwREJ9XCJcblxuICAgICQoXCIjdXBsb2FkX3Jlc3VsdHNcIikuYXBwZW5kKHQoXCJVdGlscy5tZXNzYWdlLmNoZWNraW5nU2VydmVyXCIpICsgJyZuYnNwJyArIGRvY0xpc3QubGVuZ3RoICsgJzxici8+JylcblxuICAgIHJldHVybiAkLmFqYXhcbiAgICAgIHVybDogYWxsRG9jc1VybFxuICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgZGF0YTpcbiAgICAgICAga2V5czogSlNPTi5zdHJpbmdpZnkoZG9jTGlzdClcbiAgICAgICAgdXNlcjogVGFuZ2VyaW5lLnNldHRpbmdzLnVwVXNlclxuICAgICAgICBwYXNzOiBUYW5nZXJpbmUuc2V0dGluZ3MudXBQYXNzXG4gICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgIGVycm9yTWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5IGVcbiAgICAgICAgYWxlcnQgXCJFcnJvciBjb25uZWN0aW5nXCIgKyBlcnJvck1lc3NhZ2VcbiAgICAgICAgJChcIiN1cGxvYWRfcmVzdWx0c1wiKS5hcHBlbmQoJ0Vycm9yIGNvbm5lY3RpbmcgdG8gOiAnICsgYWxsRG9jc1VybCArICcgLSBFcnJvcjogJyArIGVycm9yTWVzc2FnZSArICc8YnIvPicpXG4gICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+XG4gICAgICAgICQoXCIjdXBsb2FkX3Jlc3VsdHNcIikuYXBwZW5kKCdSZWNlaXZlZCByZXNwb25zZSBmcm9tIHNlcnZlci48YnIvPicpXG4gICAgICAgIHJvd3MgPSByZXNwb25zZS5yb3dzXG4gICAgICAgIGxlZnRUb1VwbG9hZCA9IFtdXG4gICAgICAgIGZvciByb3cgaW4gcm93c1xuICAgICAgICAgIGxlZnRUb1VwbG9hZC5wdXNoKHJvdy5rZXkpIGlmIHJvdy5lcnJvcj9cblxuICAgICAgICBpZiBsZWZ0VG9VcGxvYWQubGVuZ3RoID4gMFxuICAgICAgICAgICQoXCIjdXBsb2FkX3Jlc3VsdHNcIikuYXBwZW5kKHQoXCJVdGlscy5tZXNzYWdlLmNvdW50VGFibGV0UmVzdWx0c1wiKSArICcmbmJzcCcgKyBsZWZ0VG9VcGxvYWQubGVuZ3RoICsgJzxici8+JylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICQoXCIjdXBsb2FkX3Jlc3VsdHNcIikuYXBwZW5kKHQoXCJVdGlscy5tZXNzYWdlLm5vVXBsb2FkXCIpICsgJzxici8+JylcblxuICAgICAgICAjIGlmIGl0J3MgYWxyZWFkeSBmdWxseSB1cGxvYWRlZFxuICAgICAgICAjIG1ha2Ugc3VyZSBpdCdzIGluIHRoZSBsb2dcblxuICAgICAgICBUYW5nZXJpbmUuZGIuYWxsRG9jcyhpbmNsdWRlX2RvY3M6dHJ1ZSxrZXlzOmxlZnRUb1VwbG9hZFxuICAgICAgICApLnRoZW4oIChyZXNwb25zZSkgLT5cbiAgICAgICAgICBkb2NzID0ge1wiZG9jc1wiOnJlc3BvbnNlLnJvd3MubWFwKChlbCktPmVsLmRvYyl9XG4gICAgICAgICAgY29tcHJlc3NlZERhdGEgPSBMWlN0cmluZy5jb21wcmVzc1RvQmFzZTY0KEpTT04uc3RyaW5naWZ5KGRvY3MpKVxuICAgICAgICAgIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKVxuICAgICAgICAgIGEuaHJlZiA9IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJncm91cEhvc3RcIilcbiAgICAgICAgICBpZiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBIb3N0XCIpID09IFwibG9jYWxob3N0XCJcbiAgICAgICAgICAgIGJ1bGtEb2NzVXJsID0gXCJodHRwOi8vI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBIb3N0XCIpfS9fY29yc19idWxrX2RvY3MvdXBsb2FkLyN7VGFuZ2VyaW5lLnNldHRpbmdzLmdyb3VwREJ9XCJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBidWxrRG9jc1VybCA9IFwiI3thLnByb3RvY29sfS8vI3thLmhvc3R9L19jb3JzX2J1bGtfZG9jcy91cGxvYWQvI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ3JvdXBEQn1cIlxuXG4gICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICB0eXBlIDogXCJQT1NUXCJcbiAgICAgICAgICAgIHVybCA6IGJ1bGtEb2NzVXJsXG4gICAgICAgICAgICBkYXRhIDogY29tcHJlc3NlZERhdGFcbiAgICAgICAgICAgIGVycm9yOiAoZSkgPT5cbiAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkgZVxuICAgICAgICAgICAgICBhbGVydCBcIlNlcnZlciBidWxrIGRvY3MgZXJyb3JcIiArIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAkKFwiI3VwbG9hZF9yZXN1bHRzXCIpLmFwcGVuZCh0KFwiVXRpbHMubWVzc2FnZS5idWxrRG9jc0Vycm9yXCIpICsgYnVsa0RvY3NVcmwgKyAnIC0gJyArIHQoXCJVdGlscy5tZXNzYWdlLmVycm9yXCIpICsgJzogJyArIGVycm9yTWVzc2FnZSArICc8YnIvPicpXG4gICAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgICBVdGlscy5zdGlja3kgdChcIlV0aWxzLm1lc3NhZ2UucmVzdWx0c1VwbG9hZGVkXCIpXG4gICAgICAgICAgICAgICQoXCIjdXBsb2FkX3Jlc3VsdHNcIikuYXBwZW5kKHQoXCJVdGlscy5tZXNzYWdlLnJlc3VsdHNVcGxvYWRlZFwiKSsgJzxici8+JylcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIClcblxuXG4gIEB1bml2ZXJzYWxVcGxvYWQ6IC0+XG4gICAgcmVzdWx0cyA9IG5ldyBSZXN1bHRzXG4gICAgcmVzdWx0cy5mZXRjaFxuICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgZG9jTGlzdCA9IHJlc3VsdHMucGx1Y2soXCJfaWRcIilcbiAgICAgICAgVXRpbHMudXBsb2FkQ29tcHJlc3NlZChkb2NMaXN0KVxuXG4gIEBzYXZlRG9jTGlzdFRvRmlsZTogLT5cbiMgICAgVGFuZ2VyaW5lLmRiLmFsbERvY3MoaW5jbHVkZV9kb2NzOnRydWUpLnRoZW4oIChyZXNwb25zZSkgLT5cbiMgICAgICBVdGlscy5zYXZlUmVjb3Jkc1RvRmlsZShKU09OLnN0cmluZ2lmeShyZXNwb25zZSkpXG4jICAgIClcbiAgICByZXN1bHRzID0gbmV3IFJlc3VsdHNcbiAgICByZXN1bHRzLmZldGNoXG4gICAgICBzdWNjZXNzOiAtPlxuICAgICAgICBjb25zb2xlLmxvZyhcInJlc3VsdHM6IFwiICsgSlNPTi5zdHJpbmdpZnkocmVzdWx0cykpXG4gICAgICAgIFV0aWxzLnNhdmVSZWNvcmRzVG9GaWxlKEpTT04uc3RyaW5naWZ5KHJlc3VsdHMpKVxuXG4gIEBjaGVja1Nlc3Npb246ICh1cmwsIG9wdGlvbnMpIC0+XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgJC5hamF4XG4gICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgdXJsOiAgdXJsLFxuICAgICAgYXN5bmM6IHRydWUsXG4gICAgICBkYXRhOiBcIlwiLFxuICAgICAgYmVmb3JlU2VuZDogKHhociktPlxuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgLFxuICAgICAgY29tcGxldGU6IChyZXEpIC0+XG4gICAgICAgIHJlc3AgPSAkLnBhcnNlSlNPTihyZXEucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgaWYgKHJlcS5zdGF0dXMgPT0gMjAwKVxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiTG9nZ2VkIGluLlwiKVxuICAgICAgICAgIGlmIG9wdGlvbnMuc3VjY2Vzc1xuICAgICAgICAgICAgb3B0aW9ucy5zdWNjZXNzKHJlc3ApXG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuZXJyb3IpXG4gICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjpcIiArIHJlcS5zdGF0dXMgKyBcIiByZXNwLmVycm9yOiBcIiArIHJlc3AuZXJyb3IpXG4gICAgICAgICAgb3B0aW9ucy5lcnJvcihyZXEuc3RhdHVzLCByZXNwLmVycm9yLCByZXNwLnJlYXNvbik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhbGVydChcIkFuIGVycm9yIG9jY3VycmVkIGdldHRpbmcgc2Vzc2lvbiBpbmZvOiBcIiArIHJlc3AucmVhc29uKVxuXG4gIEByZXN0YXJ0VGFuZ2VyaW5lOiAobWVzc2FnZSwgY2FsbGJhY2spIC0+XG4gICAgVXRpbHMubWlkQWxlcnQgXCIje21lc3NhZ2UgfHwgJ1Jlc3RhcnRpbmcgVGFuZ2VyaW5lJ31cIlxuICAgIF8uZGVsYXkoIC0+XG4gICAgICBkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgY2FsbGJhY2s/KClcbiAgICAsIDIwMDAgKVxuXG4gIEBvblVwZGF0ZVN1Y2Nlc3M6ICh0b3RhbERvY3MpIC0+XG4gICAgVXRpbHMuZG9jdW1lbnRDb3VudGVyKytcbiAgICBpZiBVdGlscy5kb2N1bWVudENvdW50ZXIgPT0gdG90YWxEb2NzXG4gICAgICBVdGlscy5yZXN0YXJ0VGFuZ2VyaW5lIFwiVXBkYXRlIHN1Y2Nlc3NmdWxcIiwgLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcIlwiLCBmYWxzZVxuICAgICAgICBVdGlscy5hc2tUb0xvZ291dCgpIHVubGVzcyBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiY29udGV4dFwiKSA9PSBcInNlcnZlclwiXG4gICAgICBVdGlscy5kb2N1bWVudENvdW50ZXIgPSBudWxsXG5cblxuICBAbG9nOiAoc2VsZiwgZXJyb3IpIC0+XG4gICAgY2xhc3NOYW1lID0gc2VsZi5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9mdW5jdGlvblxccyooXFx3KykvKVsxXVxuICAgIGNvbnNvbGUubG9nIFwiI3tjbGFzc05hbWV9OiAje2Vycm9yfVwiXG5cbiAgIyBpZiBhcmdzIGlzIG9uZSBvYmplY3Qgc2F2ZSBpdCB0byB0ZW1wb3JhcnkgaGFzaFxuICAjIGlmIHR3byBzdHJpbmdzLCBzYXZlIGtleSB2YWx1ZSBwYWlyXG4gICMgaWYgb25lIHN0cmluZywgdXNlIGFzIGtleSwgcmV0dXJuIHZhbHVlXG4gIEBkYXRhOiAoYXJncy4uLikgLT5cbiAgICBpZiBhcmdzLmxlbmd0aCA9PSAxXG4gICAgICBhcmcgPSBhcmdzWzBdXG4gICAgICBpZiBfLmlzU3RyaW5nKGFyZylcbiAgICAgICAgcmV0dXJuIFRhbmdlcmluZS50ZW1wRGF0YVthcmddXG4gICAgICBlbHNlIGlmIF8uaXNPYmplY3QoYXJnKVxuICAgICAgICBUYW5nZXJpbmUudGVtcERhdGEgPSAkLmV4dGVuZChUYW5nZXJpbmUudGVtcERhdGEsIGFyZylcbiAgICAgIGVsc2UgaWYgYXJnID09IG51bGxcbiAgICAgICAgVGFuZ2VyaW5lLnRlbXBEYXRhID0ge31cbiAgICBlbHNlIGlmIGFyZ3MubGVuZ3RoID09IDJcbiAgICAgIGtleSA9IGFyZ3NbMF1cbiAgICAgIHZhbHVlID0gYXJnc1sxXVxuICAgICAgVGFuZ2VyaW5lLnRlbXBEYXRhW2tleV0gPSB2YWx1ZVxuICAgICAgcmV0dXJuIFRhbmdlcmluZS50ZW1wRGF0YVxuICAgIGVsc2UgaWYgYXJncy5sZW5ndGggPT0gMFxuICAgICAgcmV0dXJuIFRhbmdlcmluZS50ZW1wRGF0YVxuXG5cbiAgQHdvcmtpbmc6IChpc1dvcmtpbmcpIC0+XG4gICAgaWYgaXNXb3JraW5nXG4gICAgICBpZiBub3QgVGFuZ2VyaW5lLmxvYWRpbmdUaW1lcj9cbiAgICAgICAgVGFuZ2VyaW5lLmxvYWRpbmdUaW1lciA9IHNldFRpbWVvdXQoVXRpbHMuc2hvd0xvYWRpbmdJbmRpY2F0b3IsIDMwMDApXG4gICAgZWxzZVxuICAgICAgaWYgVGFuZ2VyaW5lLmxvYWRpbmdUaW1lcj9cbiAgICAgICAgY2xlYXJUaW1lb3V0IFRhbmdlcmluZS5sb2FkaW5nVGltZXJcbiAgICAgICAgVGFuZ2VyaW5lLmxvYWRpbmdUaW1lciA9IG51bGxcblxuICAgICAgJChcIi5sb2FkaW5nX2JhclwiKS5yZW1vdmUoKVxuXG4gIEBzaG93TG9hZGluZ0luZGljYXRvcjogLT5cbiAgICAkKFwiPGRpdiBjbGFzcz0nbG9hZGluZ19iYXInPjxpbWcgY2xhc3M9J2xvYWRpbmcnIHNyYz0naW1hZ2VzL2xvYWRpbmcuZ2lmJz48L2Rpdj5cIikuYXBwZW5kVG8oXCJib2R5XCIpLm1pZGRsZUNlbnRlcigpXG5cbiAgIyBhc2tzIGZvciBjb25maXJtYXRpb24gaW4gdGhlIGJyb3dzZXIsIGFuZCB1c2VzIHBob25lZ2FwIGZvciBjb29sIGNvbmZpcm1hdGlvblxuICBAY29uZmlybTogKG1lc3NhZ2UsIG9wdGlvbnMpIC0+XG4gICAgaWYgbmF2aWdhdG9yLm5vdGlmaWNhdGlvbj8uY29uZmlybT9cbiAgICAgIG5hdmlnYXRvci5ub3RpZmljYXRpb24uY29uZmlybSBtZXNzYWdlLFxuICAgICAgICAoaW5wdXQpIC0+XG4gICAgICAgICAgaWYgaW5wdXQgPT0gMVxuICAgICAgICAgICAgb3B0aW9ucy5jYWxsYmFjayB0cnVlXG4gICAgICAgICAgZWxzZSBpZiBpbnB1dCA9PSAyXG4gICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrIGZhbHNlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3B0aW9ucy5jYWxsYmFjayBpbnB1dFxuICAgICAgLCBvcHRpb25zLnRpdGxlLCBvcHRpb25zLmFjdGlvbitcIixDYW5jZWxcIlxuICAgIGVsc2VcbiAgICAgIGlmIHdpbmRvdy5jb25maXJtIG1lc3NhZ2VcbiAgICAgICAgb3B0aW9ucy5jYWxsYmFjayB0cnVlXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIG9wdGlvbnMuY2FsbGJhY2sgZmFsc2VcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIDBcblxuICAjIHRoaXMgZnVuY3Rpb24gaXMgYSBsb3QgbGlrZSBqUXVlcnkuc2VyaWFsaXplQXJyYXksIGV4Y2VwdCB0aGF0IGl0IHJldHVybnMgdXNlZnVsIG91dHB1dFxuICAjIHdvcmtzIG9uIHRleHRhcmVhcywgaW5wdXQgdHlwZSB0ZXh0IGFuZCBwYXNzd29yZFxuICBAZ2V0VmFsdWVzOiAoIHNlbGVjdG9yICkgLT5cbiAgICB2YWx1ZXMgPSB7fVxuICAgICQoc2VsZWN0b3IpLmZpbmQoXCJpbnB1dFt0eXBlPXRleHRdLCBpbnB1dFt0eXBlPXBhc3N3b3JkXSwgdGV4dGFyZWFcIikuZWFjaCAoIGluZGV4LCBlbGVtZW50ICkgLT5cbiAgICAgIHZhbHVlc1tlbGVtZW50LmlkXSA9IGVsZW1lbnQudmFsdWVcbiAgICByZXR1cm4gdmFsdWVzXG5cbiAgIyBjb252ZXJ0cyB1cmwgZXNjYXBlZCBjaGFyYWN0ZXJzXG4gIEBjbGVhblVSTDogKHVybCkgLT5cbiAgICBpZiB1cmwuaW5kZXhPZj8oXCIlXCIpICE9IC0xXG4gICAgICB1cmwgPSBkZWNvZGVVUklDb21wb25lbnQgdXJsXG4gICAgZWxzZVxuICAgICAgdXJsXG5cbiAgIyBEaXNwb3NhYmxlIGFsZXJ0c1xuICBAdG9wQWxlcnQ6IChhbGVydFRleHQsIGRlbGF5ID0gMjAwMCkgLT5cbiAgICBVdGlscy5hbGVydCBcInRvcFwiLCBhbGVydFRleHQsIGRlbGF5XG5cbiAgQG1pZEFsZXJ0OiAoYWxlcnRUZXh0LCBkZWxheT0yMDAwKSAtPlxuICAgIFV0aWxzLmFsZXJ0IFwibWlkZGxlXCIsIGFsZXJ0VGV4dCwgZGVsYXlcblxuICBAYWxlcnQ6ICggd2hlcmUsIGFsZXJ0VGV4dCwgZGVsYXkgPSAyMDAwICkgLT5cblxuICAgIHN3aXRjaCB3aGVyZVxuICAgICAgd2hlbiBcInRvcFwiXG4gICAgICAgIHNlbGVjdG9yID0gXCIudG9wX2FsZXJ0XCJcbiAgICAgICAgYWxpZ25lciA9ICggJGVsICkgLT4gcmV0dXJuICRlbC50b3BDZW50ZXIoKVxuICAgICAgd2hlbiBcIm1pZGRsZVwiXG4gICAgICAgIHNlbGVjdG9yID0gXCIubWlkX2FsZXJ0XCJcbiAgICAgICAgYWxpZ25lciA9ICggJGVsICkgLT4gcmV0dXJuICRlbC5taWRkbGVDZW50ZXIoKVxuXG5cbiAgICBpZiBVdGlsc1tcIiN7d2hlcmV9QWxlcnRUaW1lclwiXT9cbiAgICAgIGNsZWFyVGltZW91dCBVdGlsc1tcIiN7d2hlcmV9QWxlcnRUaW1lclwiXVxuICAgICAgJGFsZXJ0ID0gJChzZWxlY3RvcilcbiAgICAgICRhbGVydC5odG1sKCAkYWxlcnQuaHRtbCgpICsgXCI8YnI+XCIgKyBhbGVydFRleHQgKVxuICAgIGVsc2VcbiAgICAgICRhbGVydCA9ICQoXCI8ZGl2IGNsYXNzPScje3NlbGVjdG9yLnN1YnN0cmluZygxKX0gZGlzcG9zYWJsZV9hbGVydCc+I3thbGVydFRleHR9PC9kaXY+XCIpLmFwcGVuZFRvKFwiI2NvbnRlbnRcIilcblxuICAgIGFsaWduZXIoJGFsZXJ0KVxuXG4gICAgZG8gKCRhbGVydCwgc2VsZWN0b3IsIGRlbGF5KSAtPlxuICAgICAgY29tcHV0ZWREZWxheSA9ICgoXCJcIiskYWxlcnQuaHRtbCgpKS5tYXRjaCgvPGJyPi9nKXx8W10pLmxlbmd0aCAqIDE1MDBcbiAgICAgIFV0aWxzW1wiI3t3aGVyZX1BbGVydFRpbWVyXCJdID0gc2V0VGltZW91dCAtPlxuICAgICAgICAgIFV0aWxzW1wiI3t3aGVyZX1BbGVydFRpbWVyXCJdID0gbnVsbFxuICAgICAgICAgICRhbGVydC5mYWRlT3V0KDI1MCwgLT4gJCh0aGlzKS5yZW1vdmUoKSApXG4gICAgICAsIE1hdGgubWF4KGNvbXB1dGVkRGVsYXksIGRlbGF5KVxuXG5cblxuICBAc3RpY2t5OiAoaHRtbCwgYnV0dG9uVGV4dCA9IFwiQ2xvc2VcIiwgY2FsbGJhY2ssIHBvc2l0aW9uID0gXCJtaWRkbGVcIikgLT5cbiAgICBkaXYgPSAkKFwiPGRpdiBjbGFzcz0nc3RpY2t5X2FsZXJ0Jz4je2h0bWx9PGJyPjxidXR0b24gY2xhc3M9J2NvbW1hbmQgcGFyZW50X3JlbW92ZSc+I3tidXR0b25UZXh0fTwvYnV0dG9uPjwvZGl2PlwiKS5hcHBlbmRUbyhcIiNjb250ZW50XCIpXG4gICAgaWYgcG9zaXRpb24gPT0gXCJtaWRkbGVcIlxuICAgICAgZGl2Lm1pZGRsZUNlbnRlcigpXG4gICAgZWxzZSBpZiBwb3NpdGlvbiA9PSBcInRvcFwiXG4gICAgICBkaXYudG9wQ2VudGVyKClcbiAgICBkaXYub24oXCJrZXl1cFwiLCAoZXZlbnQpIC0+IGlmIGV2ZW50LndoaWNoID09IDI3IHRoZW4gJCh0aGlzKS5yZW1vdmUoKSkuZmluZChcImJ1dHRvblwiKS5jbGljayBjYWxsYmFja1xuXG4gIEB0b3BTdGlja3k6IChodG1sLCBidXR0b25UZXh0ID0gXCJDbG9zZVwiLCBjYWxsYmFjaykgLT5cbiAgICBVdGlscy5zdGlja3koaHRtbCwgYnV0dG9uVGV4dCwgY2FsbGJhY2ssIFwidG9wXCIpXG5cblxuXG4gIEBtb2RhbDogKGh0bWwpIC0+XG4gICAgaWYgaHRtbCA9PSBmYWxzZVxuICAgICAgJChcIiNtb2RhbF9iYWNrLCAjbW9kYWxcIikucmVtb3ZlKClcbiAgICAgIHJldHVyblxuXG4gICAgJChcImJvZHlcIikucHJlcGVuZChcIjxkaXYgaWQ9J21vZGFsX2JhY2snPjwvZGl2PlwiKVxuICAgICQoXCI8ZGl2IGlkPSdtb2RhbCc+I3todG1sfTwvZGl2PlwiKS5hcHBlbmRUbyhcIiNjb250ZW50XCIpLm1pZGRsZUNlbnRlcigpLm9uKFwia2V5dXBcIiwgKGV2ZW50KSAtPiBpZiBldmVudC53aGljaCA9PSAyNyB0aGVuICQoXCIjbW9kYWxfYmFjaywgI21vZGFsXCIpLnJlbW92ZSgpKVxuXG4gIEBwYXNzd29yZFByb21wdDogKGNhbGxiYWNrKSAtPlxuICAgIGh0bWwgPSBcIlxuICAgICAgPGRpdiBpZD0ncGFzc19mb3JtJyB0aXRsZT0nVXNlciB2ZXJpZmljYXRpb24nPlxuICAgICAgICA8bGFiZWwgZm9yPSdwYXNzd29yZCc+UGxlYXNlIHJlLWVudGVyIHlvdXIgcGFzc3dvcmQ8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J3Bhc3NfdmFsJyB0eXBlPSdwYXNzd29yZCcgbmFtZT0ncGFzc3dvcmQnIGlkPSdwYXNzd29yZCcgdmFsdWU9Jyc+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQnIGRhdGEtdmVyaWZ5PSd0cnVlJz5WZXJpZnk8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICBcIlxuXG4gICAgVXRpbHMubW9kYWwgaHRtbFxuXG4gICAgJHBhc3MgPSAkKFwiI3Bhc3NfdmFsXCIpXG4gICAgJGJ1dHRvbiA9ICQoXCIjcGFzc192YWxmb3JtIGJ1dHRvblwiKVxuXG4gICAgJHBhc3Mub24gXCJrZXl1cFwiLCAoZXZlbnQpIC0+XG4gICAgICByZXR1cm4gdHJ1ZSB1bmxlc3MgZXZlbnQud2hpY2ggPT0gMTNcbiAgICAgICRidXR0b24ub2ZmIFwiY2xpY2tcIlxuICAgICAgJHBhc3Mub2ZmIFwiY2hhbmdlXCJcblxuICAgICAgY2FsbGJhY2sgJHBhc3MudmFsKClcbiAgICAgIFV0aWxzLm1vZGFsIGZhbHNlXG5cbiAgICAkYnV0dG9uLm9uIFwiY2xpY2tcIiwgKGV2ZW50KSAtPlxuICAgICAgJGJ1dHRvbi5vZmYgXCJjbGlja1wiXG4gICAgICAkcGFzcy5vZmYgXCJjaGFuZ2VcIlxuXG4gICAgICBjYWxsYmFjayAkcGFzcy52YWwoKSBpZiAkKGV2ZW50LnRhcmdldCkuYXR0cihcImRhdGEtdmVyaWZ5XCIpID09IFwidHJ1ZVwiXG5cbiAgICAgIFV0aWxzLm1vZGFsIGZhbHNlXG5cblxuXG4gICMgcmV0dXJucyBhIEdVSURcbiAgQGd1aWQ6IC0+XG4gICByZXR1cm4gQFM0KCkrQFM0KCkrXCItXCIrQFM0KCkrXCItXCIrQFM0KCkrXCItXCIrQFM0KCkrXCItXCIrQFM0KCkrQFM0KCkrQFM0KClcbiAgQFM0OiAtPlxuICAgcmV0dXJuICggKCAoIDEgKyBNYXRoLnJhbmRvbSgpICkgKiAweDEwMDAwICkgfCAwICkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKVxuXG4gIEBodW1hbkdVSUQ6IC0+IHJldHVybiBAcmFuZG9tTGV0dGVycyg0KStcIi1cIitAcmFuZG9tTGV0dGVycyg0KStcIi1cIitAcmFuZG9tTGV0dGVycyg0KVxuICBAc2FmZUxldHRlcnMgPSBcImFiY2RlZmdoaWpsbW5vcHFyc3R1dnd4eXpcIi5zcGxpdChcIlwiKVxuICBAcmFuZG9tTGV0dGVyczogKGxlbmd0aCkgLT5cbiAgICByZXN1bHQgPSBcIlwiXG4gICAgd2hpbGUgbGVuZ3RoLS1cbiAgICAgIHJlc3VsdCArPSBVdGlscy5zYWZlTGV0dGVyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqVXRpbHMuc2FmZUxldHRlcnMubGVuZ3RoKV1cbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgIyB0dXJucyB0aGUgYm9keSBiYWNrZ3JvdW5kIGEgY29sb3IgYW5kIHRoZW4gcmV0dXJucyB0byB3aGl0ZVxuICBAZmxhc2g6IChjb2xvcj1cInJlZFwiLCBzaG91bGRUdXJuSXRPbiA9IG51bGwpIC0+XG5cbiAgICBpZiBub3Qgc2hvdWxkVHVybkl0T24/XG4gICAgICBVdGlscy5iYWNrZ3JvdW5kIGNvbG9yXG4gICAgICBzZXRUaW1lb3V0IC0+XG4gICAgICAgIFV0aWxzLmJhY2tncm91bmQgXCJcIlxuICAgICAgLCAxMDAwXG5cbiAgQGJhY2tncm91bmQ6IChjb2xvcikgLT5cbiAgICBpZiBjb2xvcj9cbiAgICAgICQoXCIjY29udGVudF93cmFwcGVyXCIpLmNzcyBcImJhY2tncm91bmRDb2xvclwiIDogY29sb3JcbiAgICBlbHNlXG4gICAgICAkKFwiI2NvbnRlbnRfd3JhcHBlclwiKS5jc3MgXCJiYWNrZ3JvdW5kQ29sb3JcIlxuXG4gICMgUmV0cmlldmVzIEdFVCB2YXJpYWJsZXNcbiAgIyBodHRwOi8vZWpvaG4ub3JnL2Jsb2cvc2VhcmNoLWFuZC1kb250LXJlcGxhY2UvXG4gIEAkX0dFVDogKHEsIHMpIC0+XG4gICAgdmFycyA9IHt9XG4gICAgcGFydHMgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5yZXBsYWNlKC9bPyZdKyhbXj0mXSspPShbXiZdKikvZ2ksIChtLGtleSx2YWx1ZSkgLT5cbiAgICAgICAgdmFsdWUgPSBpZiB+dmFsdWUuaW5kZXhPZihcIiNcIikgdGhlbiB2YWx1ZS5zcGxpdChcIiNcIilbMF0gZWxzZSB2YWx1ZVxuICAgICAgICB2YXJzW2tleV0gPSB2YWx1ZS5zcGxpdChcIiNcIilbMF07XG4gICAgKVxuICAgIHZhcnNcblxuXG4gICMgbm90IGN1cnJlbnRseSBpbXBsZW1lbnRlZCBidXQgd29ya2luZ1xuICBAcmVzaXplU2Nyb2xsUGFuZTogLT5cbiAgICAkKFwiLnNjcm9sbF9wYW5lXCIpLmhlaWdodCggJCh3aW5kb3cpLmhlaWdodCgpIC0gKCAkKFwiI25hdmlnYXRpb25cIikuaGVpZ2h0KCkgKyAkKFwiI2Zvb3RlclwiKS5oZWlnaHQoKSArIDEwMCkgKVxuXG4gICMgYXNrcyB1c2VyIGlmIHRoZXkgd2FudCB0byBsb2dvdXRcbiAgQGFza1RvTG9nb3V0OiAtPiBUYW5nZXJpbmUudXNlci5sb2dvdXQoKSBpZiBjb25maXJtKFwiV291bGQgeW91IGxpa2UgdG8gbG9nb3V0IG5vdz9cIilcblxuICBAdXBkYXRlRnJvbVNlcnZlcjogKG1vZGVsKSAtPlxuXG4gICAgZEtleSA9IG1vZGVsLmlkLnN1YnN0cigtNSwgNSlcblxuICAgIEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGxvb2t1cFwiXG5cbiAgICBzb3VyY2VEQiA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImdyb3VwXCIpXG4gICAgdGFyZ2V0REIgPSBUYW5nZXJpbmUuY29uZi5kYl9uYW1lXG5cbiAgICBzb3VyY2VES2V5ID0gVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcoXCJncm91cFwiLCBcImJ5REtleVwiKVxuXG4gICAgIyMjXG4gICAgR2V0cyBhIGxpc3Qgb2YgZG9jdW1lbnRzIG9uIGJvdGggdGhlIHNlcnZlciBhbmQgbG9jYWxseS4gVGhlbiByZXBsaWNhdGVzIGFsbCBieSBpZC5cbiAgICAjIyNcblxuICAgICQuYWpheFxuICAgICAgdXJsOiBzb3VyY2VES2V5LFxuICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoa2V5czpkS2V5KVxuICAgICAgZXJyb3I6IChhLCBiKSAtPiBtb2RlbC50cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICBkb2NMaXN0ID0gZGF0YS5yb3dzLnJlZHVjZSAoKG9iaiwgY3VyKSAtPiBvYmpbY3VyLmlkXSA9IHRydWUpLCB7fVxuXG4gICAgICAgIFRhbmdlcmluZS5kYi5xdWVyeShcIiN7VGFuZ2VyaW5lLmNvbmYuZGVzaWduX2RvY30vYnlES2V5XCIsXG4gICAgICAgICAga2V5OiBkS2V5XG4gICAgICAgICkudGhlbiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgY29uc29sZS53YXJuIHJlc3BvbnNlIHVubGVzcyByZXNwb25zZS5yb3dzP1xuICAgICAgICAgIGRvY0xpc3QgPSBkYXRhLnJvd3MucmVkdWNlICgob2JqLCBjdXIpIC0+IG9ialtjdXIuaWRdID0gdHJ1ZSksIGRvY0xpc3RcbiAgICAgICAgICBkb2NMaXN0ID0gT2JqZWN0LmtleXMoZG9jTGlzdClcbiAgICAgICAgICAkLmNvdWNoLnJlcGxpY2F0ZShcbiAgICAgICAgICAgIHNvdXJjZURCLFxuICAgICAgICAgICAgdGFyZ2V0REIsIHtcbiAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgIG1vZGVsLnRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgc3VjY2Vzc1wiLCByZXNwb25zZVxuICAgICAgICAgICAgICBlcnJvcjogKGEsIGIpICAgICAgLT4gbW9kZWwudHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBkb2NfaWRzOiBkb2NMaXN0XG4gICAgICAgICAgKVxuXG4gIEBsb2FkRGV2ZWxvcG1lbnRQYWNrczogKGNhbGxiYWNrKSAtPlxuICAgICQuYWpheFxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICB1cmw6IFwicGFja3MuanNvblwiXG4gICAgICBlcnJvcjogKHJlcykgLT5cbiAgICAgICAgY2FsbGJhY2socmVzKVxuICAgICAgc3VjY2VzczogKHJlcykgLT5cbiAgICAgICAgVGFuZ2VyaW5lLmRiLmJ1bGtEb2NzIHJlcywgKGVycm9yLCBkb2MpIC0+XG4gICAgICAgICAgaWYgZXJyb3IgdGhlbiBjYWxsYmFjayhlcnJvcikgZWxzZSBjYWxsYmFjaygpXG5cblxuXG5cbiMgUm9iYmVydCBpbnRlcmZhY2VcbmNsYXNzIFJvYmJlcnRcblxuICBAcmVxdWVzdDogKG9wdGlvbnMpIC0+XG5cbiAgICBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzXG4gICAgZXJyb3IgICA9IG9wdGlvbnMuZXJyb3JcblxuICAgIGRlbGV0ZSBvcHRpb25zLnN1Y2Nlc3NcbiAgICBkZWxldGUgb3B0aW9ucy5lcnJvclxuXG4gICAgJC5hamF4XG4gICAgICB0eXBlICAgICAgICA6IFwiUE9TVFwiXG4gICAgICBjcm9zc0RvbWFpbiA6IHRydWVcbiAgICAgIHVybCAgICAgICAgIDogVGFuZ2VyaW5lLmNvbmZpZy5nZXQoXCJyb2JiZXJ0XCIpXG4gICAgICBkYXRhVHlwZSAgICA6IFwianNvblwiXG4gICAgICBkYXRhICAgICAgICA6IG9wdGlvbnNcbiAgICAgIHN1Y2Nlc3M6ICggZGF0YSApID0+XG4gICAgICAgIHN1Y2Nlc3MgZGF0YVxuICAgICAgZXJyb3I6ICggZGF0YSApID0+XG4gICAgICAgIGVycm9yIGRhdGFcblxuIyBUcmVlIGludGVyZmFjZVxuY2xhc3MgVGFuZ2VyaW5lVHJlZVxuXG4gIEBtYWtlOiAob3B0aW9ucykgLT5cblxuICAgIFV0aWxzLndvcmtpbmcgdHJ1ZVxuICAgIHN1Y2Nlc3MgPSBvcHRpb25zLnN1Y2Nlc3NcbiAgICBlcnJvciAgID0gb3B0aW9ucy5lcnJvclxuXG4gICAgZGVsZXRlIG9wdGlvbnMuc3VjY2Vzc1xuICAgIGRlbGV0ZSBvcHRpb25zLmVycm9yXG5cbiAgICBvcHRpb25zLnVzZXIgPSBUYW5nZXJpbmUudXNlci5uYW1lKClcblxuICAgICQuYWpheFxuICAgICAgdHlwZSAgICAgOiBcIlBPU1RcIlxuICAgICAgY3Jvc3NEb21haW4gOiB0cnVlXG4gICAgICB1cmwgICAgICA6IFRhbmdlcmluZS5jb25maWcuZ2V0KFwidHJlZVwiKSArIFwibWFrZS8je1RhbmdlcmluZS5zZXR0aW5ncy5nZXQoJ2dyb3VwTmFtZScpfVwiXG4gICAgICBkYXRhVHlwZSA6IFwianNvblwiXG4gICAgICBkYXRhICAgICA6IG9wdGlvbnNcbiAgICAgIHN1Y2Nlc3M6ICggZGF0YSApID0+XG4gICAgICAgIHN1Y2Nlc3MgZGF0YVxuICAgICAgZXJyb3I6ICggZGF0YSApID0+XG4gICAgICAgIGVycm9yIGRhdGEsIEpTT04ucGFyc2UoZGF0YS5yZXNwb25zZVRleHQpXG4gICAgICBjb21wbGV0ZTogLT5cbiAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuXG5cblxuIyNVSSBoZWxwZXJzXG4kIC0+XG4gICMgIyMjLmNsZWFyX21lc3NhZ2VcbiAgIyBUaGlzIGxpdHRsZSBndXkgd2lsbCBmYWRlIG91dCBhbmQgY2xlYXIgaGltIGFuZCBoaXMgcGFyZW50cy4gV3JhcCBoaW0gd2lzZWx5LlxuICAjIGA8c3Bhbj4gbXkgbWVzc2FnZSA8YnV0dG9uIGNsYXNzPVwiY2xlYXJfbWVzc2FnZVwiPlg8L2J1dHRvbj5gXG4gICQoXCIjY29udGVudFwiKS5vbihcImNsaWNrXCIsIFwiLmNsZWFyX21lc3NhZ2VcIiwgIG51bGwsIChhKSAtPiAkKGEudGFyZ2V0KS5wYXJlbnQoKS5mYWRlT3V0KDI1MCwgLT4gJCh0aGlzKS5lbXB0eSgpLnNob3coKSApIClcbiAgJChcIiNjb250ZW50XCIpLm9uKFwiY2xpY2tcIiwgXCIucGFyZW50X3JlbW92ZVwiLCBudWxsLCAoYSkgLT4gJChhLnRhcmdldCkucGFyZW50KCkuZmFkZU91dCgyNTAsIC0+ICQodGhpcykucmVtb3ZlKCkgKSApXG5cbiAgIyBkaXNwb3NhYmxlIGFsZXJ0cyA9IGEgbm9uLWZhbmN5IGJveFxuICAkKFwiI2NvbnRlbnRcIikub24gXCJjbGlja1wiLFwiLmFsZXJ0X2J1dHRvblwiLCAtPlxuICAgIGFsZXJ0X3RleHQgPSBpZiAkKHRoaXMpLmF0dHIoXCJkYXRhLWFsZXJ0XCIpIHRoZW4gJCh0aGlzKS5hdHRyKFwiZGF0YS1hbGVydFwiKSBlbHNlICQodGhpcykudmFsKClcbiAgICBVdGlscy5kaXNwb3NhYmxlQWxlcnQgYWxlcnRfdGV4dFxuICAkKFwiI2NvbnRlbnRcIikub24gXCJjbGlja1wiLCBcIi5kaXNwb3NhYmxlX2FsZXJ0XCIsIC0+XG4gICAgJCh0aGlzKS5zdG9wKCkuZmFkZU91dCAxMDAsIC0+XG4gICAgICAkKHRoaXMpLnJlbW92ZSgpXG5cbiAgIyAkKHdpbmRvdykucmVzaXplIFV0aWxzLnJlc2l6ZVNjcm9sbFBhbmVcbiAgIyBVdGlscy5yZXNpemVTY3JvbGxQYW5lKClcblxuIyBIYW5kbGViYXJzIHBhcnRpYWxzXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdncmlkTGFiZWwnLCAoaXRlbXMsaXRlbU1hcCxpbmRleCkgLT5cbiMgIF8uZXNjYXBlKGl0ZW1zW2l0ZW1NYXBbZG9uZV1dKVxuICBfLmVzY2FwZShpdGVtc1tpdGVtTWFwW2luZGV4XV0pXG4pXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdzdGFydFJvdycsIChpbmRleCkgLT5cbiAgY29uc29sZS5sb2coXCJpbmRleDogXCIgKyBpbmRleClcbiAgaWYgaW5kZXggPT0gMFxuICAgIFwiPHRyPlwiXG4pXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdlbmRSb3cnLCAoaW5kZXgpIC0+XG4gIGNvbnNvbGUubG9nKFwiaW5kZXg6IFwiICsgaW5kZXgpXG4gIGlmIGluZGV4ID09IDBcbiAgICBcIjwvdHI+XCJcbilcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignc3RhcnRDZWxsJywgKGluZGV4KSAtPlxuICBjb25zb2xlLmxvZyhcImluZGV4OiBcIiArIGluZGV4KVxuICBpZiBpbmRleCA9PSAwXG4gICAgXCI8dGQ+PC90ZD5cIlxuKVxuXG4jLypcbiMgICAqIFVzZSB0aGlzIHRvIHR1cm4gb24gbG9nZ2luZzpcbiMgICAqL1xuSGFuZGxlYmFycy5sb2dnZXIubG9nID0gKGxldmVsKS0+XG4gIGlmICBsZXZlbCA+PSBIYW5kbGViYXJzLmxvZ2dlci5sZXZlbFxuICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIFtdLmNvbmNhdChbXCJIYW5kbGViYXJzOiBcIl0sIF8udG9BcnJheShhcmd1bWVudHMpKSlcblxuIyMvLyBERUJVRzogMCwgSU5GTzogMSwgV0FSTjogMiwgRVJST1I6IDMsXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBIYW5kbGViYXJzLmxvZ2dlci5sb2cpO1xuIyMvLyBTdGQgbGV2ZWwgaXMgMywgd2hlbiBzZXQgdG8gMCwgaGFuZGxlYmFycyB3aWxsIGxvZyBhbGwgY29tcGlsYXRpb24gcmVzdWx0c1xuSGFuZGxlYmFycy5sb2dnZXIubGV2ZWwgPSAzO1xuXG4jLypcbiMgICAqIExvZyBjYW4gYWxzbyBiZSB1c2VkIGluIHRlbXBsYXRlczogJ3t7bG9nIDAgdGhpcyBcIm15U3RyaW5nXCIgYWNjb3VudE5hbWV9fSdcbiMgICAqIExvZ3MgYWxsIHRoZSBwYXNzZWQgZGF0YSB3aGVuIGxvZ2dlci5sZXZlbCA9IDBcbiMgICAqL1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKFwiZGVidWdcIiwgKG9wdGlvbmFsVmFsdWUpLT5cbiAgY29uc29sZS5sb2coXCJDdXJyZW50IENvbnRleHRcIilcbiAgY29uc29sZS5sb2coXCI9PT09PT09PT09PT09PT09PT09PVwiKVxuICBjb25zb2xlLmxvZyh0aGlzKVxuXG4gIGlmIG9wdGlvbmFsVmFsdWVcbiAgICBjb25zb2xlLmxvZyhcIlZhbHVlXCIpXG4gICAgY29uc29sZS5sb2coXCI9PT09PT09PT09PT09PT09PT09PVwiKVxuICAgIGNvbnNvbGUubG9nKG9wdGlvbmFsVmFsdWUpXG4pXG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ21vbnRoRHJvcGRvd24nLCAobW9udGhzLCBjdXJyZW50TW9udGgpLT5cbiAgcmVuZGVyT3B0aW9uID0gKG1vbnRoLCBjdXJyZW50TW9udGgpLT5cbiAgICBvdXQgPSBcIjxvcHRpb24gdmFsdWU9J1wiICsgbW9udGggKyBcIidcIlxuICAgIGlmIG1vbnRoID09IGN1cnJlbnRNb250aFxuICAgICAgb3V0ID0gb3V0ICsgXCJzZWxlY3RlZD0nc2VsZWN0ZWQnXCJcbiAgICBvdXQgPSBvdXQgKyAgXCI+XCIgKyBtb250aC50aXRsZWl6ZSgpICsgXCI8L29wdGlvbj5cIlxuICAgIHJldHVybiBvdXRcbiAgcmVuZGVyT3B0aW9uKG1vbnRoLCBjdXJyZW50TW9udGgpIGZvciBtb250aCBpbiBtb250aHNcbilcbiJdfQ==

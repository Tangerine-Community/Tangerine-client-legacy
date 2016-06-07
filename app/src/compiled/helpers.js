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
                  $("#upload_results").append(t("Utils.message.universalUploadComplete") + '<br/>');
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

  Utils.cloud_url_with_credentials = function(cloud_url) {
    var cloud_credentials;
    cloud_credentials = "username:password";
    return cloud_url.replace(/http:\/\//, "http://" + cloud_credentials + "@");
  };

  Utils.replicateToServer = function(options, divId) {
    var a, credRepliUrl, opts, replicationURL;
    if (!options) {
      options = {};
    }
    opts = {
      continuous: false,
      withCredentials: true,
      complete: function(result) {
        if (typeof result !== 'undefined' && result !== null && result.ok) {
          return console.log("replicateToServer - onComplete: Replication is fine. ");
        } else {
          return console.log("replicateToServer - onComplete: Replication message: " + result);
        }
      },
      error: function(result) {
        return console.log("error: Replication error: " + JSON.stringify(result));
      },
      timeout: 60000
    };
    _.extend(options, opts);
    a = document.createElement("a");
    a.href = Tangerine.settings.get("groupHost");
    replicationURL = a.protocol + "//" + a.host + "/" + Tangerine.settings.groupDB;
    credRepliUrl = this.cloud_url_with_credentials(replicationURL);
    console.log("credRepliUrl: " + credRepliUrl);
    return Backbone.sync.defaults.db.replicate.to(credRepliUrl, options).on('uptodate', function(result) {
      if (typeof result !== 'undefined' && result.ok) {
        console.log("uptodate: Replication is fine. ");
        options.complete();
        if (typeof options.success !== 'undefined') {
          return options.success();
        }
      } else {
        return console.log("uptodate: Replication error: " + JSON.stringify(result));
      }
    }).on('change', function(info) {
      var doc_count, doc_del_count, doc_written, msg, percentDone, ref, ref1, total_docs;
      console.log("Change: " + JSON.stringify(info));
      doc_count = (ref = options.status) != null ? ref.doc_count : void 0;
      doc_del_count = (ref1 = options.status) != null ? ref1.doc_del_count : void 0;
      total_docs = (doc_count != null) + (doc_del_count != null);
      doc_written = info.docs_written;
      percentDone = Math.floor((doc_written / total_docs) * 100);
      if (!isNaN(percentDone)) {
        msg = "Change: docs_written: " + doc_written + " of " + total_docs + ". Percent Done: " + percentDone + "%<br/>";
      } else {
        msg = "Change: docs_written: " + doc_written + "<br/>";
      }
      console.log("msg: " + msg);
      return $(divId).append(msg);
    }).on('complete', function(info) {
      return console.log("Complete: " + JSON.stringify(info));
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

//# sourceMappingURL=data:application/json;base64,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QUFDLE1BQUQsRUFBUyxZQUFUO0FBQ3pDLE1BQUE7RUFBQSxZQUFBLEdBQWUsU0FBQyxLQUFELEVBQVEsWUFBUjtBQUNiLFFBQUE7SUFBQSxHQUFBLEdBQU0saUJBQUEsR0FBb0IsS0FBcEIsR0FBNEI7SUFDbEMsSUFBRyxLQUFBLEtBQVMsWUFBWjtNQUNFLEdBQUEsR0FBTSxHQUFBLEdBQU0sc0JBRGQ7O0lBRUEsR0FBQSxHQUFNLEdBQUEsR0FBTyxHQUFQLEdBQWEsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFiLEdBQWdDO0FBQ3RDLFdBQU87RUFMTTtBQU1mO09BQUEsd0NBQUE7O2tCQUFBLFlBQUEsQ0FBYSxLQUFiLEVBQW9CLFlBQXBCO0FBQUE7O0FBUHlDLENBQTNDIiwiZmlsZSI6ImhlbHBlcnMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjXG4jIFNraXAgbG9naWNcbiNcblxuIyB0aGVzZSBjb3VsZCBlYXNpbHkgYmUgcmVmYWN0b3JlZCBpbnRvIG9uZS5cblxuUmVzdWx0T2ZRdWVzdGlvbiA9IChuYW1lKSAtPlxuICByZXR1cm5WaWV3ID0gbnVsbFxuIyAgdmlld01hc3Rlci5zdWJ0ZXN0Vmlld3NbaW5kZXhdLnByb3RvdHlwZVZpZXcucXVlc3Rpb25WaWV3cy5mb3JFYWNoIChjYW5kaWRhdGVWaWV3KSAtPlxuICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcucXVlc3Rpb25WaWV3cy5mb3JFYWNoIChjYW5kaWRhdGVWaWV3KSAtPlxuICAgIGlmIGNhbmRpZGF0ZVZpZXcubW9kZWwuZ2V0KFwibmFtZVwiKSA9PSBuYW1lXG4gICAgICByZXR1cm5WaWV3ID0gY2FuZGlkYXRlVmlld1xuICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJSZXN1bHRPZlF1ZXN0aW9uIGNvdWxkIG5vdCBmaW5kIHZhcmlhYmxlICN7bmFtZX1cIikgaWYgcmV0dXJuVmlldyA9PSBudWxsXG4gIHJldHVybiByZXR1cm5WaWV3LmFuc3dlciBpZiByZXR1cm5WaWV3LmFuc3dlclxuICByZXR1cm4gbnVsbFxuXG5SZXN1bHRPZk11bHRpcGxlID0gKG5hbWUpIC0+XG4gIHJldHVyblZpZXcgPSBudWxsXG4jICB2aWV3TWFzdGVyLnN1YnRlc3RWaWV3c1tpbmRleF0ucHJvdG90eXBlVmlldy5xdWVzdGlvblZpZXdzLmZvckVhY2ggKGNhbmRpZGF0ZVZpZXcpIC0+XG4gIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlldy5xdWVzdGlvblZpZXdzLmZvckVhY2ggKGNhbmRpZGF0ZVZpZXcpIC0+XG4gICAgaWYgY2FuZGlkYXRlVmlldy5tb2RlbC5nZXQoXCJuYW1lXCIpID09IG5hbWVcbiAgICAgIHJldHVyblZpZXcgPSBjYW5kaWRhdGVWaWV3XG4gIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIlJlc3VsdE9mUXVlc3Rpb24gY291bGQgbm90IGZpbmQgdmFyaWFibGUgI3tuYW1lfVwiKSBpZiByZXR1cm5WaWV3ID09IG51bGxcblxuICByZXN1bHQgPSBbXVxuICBmb3Iga2V5LCB2YWx1ZSBvZiByZXR1cm5WaWV3LmFuc3dlclxuICAgIHJlc3VsdC5wdXNoIGtleSBpZiB2YWx1ZSA9PSBcImNoZWNrZWRcIlxuICByZXR1cm4gcmVzdWx0XG5cblJlc3VsdE9mUHJldmlvdXMgPSAobmFtZSkgLT5cbiAgaWYgdHlwZW9mIHZtLmN1cnJlbnRWaWV3LnJlc3VsdCA9PSAndW5kZWZpbmVkJ1xuIyAgICBjb25zb2xlLmxvZyhcIlVzaW5nIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1wiKVxuICAgIHJldHVybiBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcubW9kZWwucGFyZW50LnJlc3VsdC5nZXRWYXJpYWJsZShuYW1lKVxuICBlbHNlXG4gICAgcmV0dXJuIHZtLmN1cnJlbnRWaWV3LnJlc3VsdC5nZXRWYXJpYWJsZShuYW1lKVxuXG5SZXN1bHRPZkdyaWQgPSAobmFtZSkgLT5cbiAgaWYgdHlwZW9mIHZtLmN1cnJlbnRWaWV3LnJlc3VsdCA9PSAndW5kZWZpbmVkJ1xuICAgIGNvbnNvbGUubG9nKFwiVXNpbmcgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XCIpXG4gICAgcmV0dXJuIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlldy5tb2RlbC5wYXJlbnQucmVzdWx0LmdldEl0ZW1SZXN1bHRDb3VudEJ5VmFyaWFibGVOYW1lKG5hbWUsIFwiY29ycmVjdFwiKVxuICBlbHNlXG4gICAgcmV0dXJuIHZtLmN1cnJlbnRWaWV3LnJlc3VsdC5nZXRWYXJpYWJsZShuYW1lKVxuI1xuIyBUYW5nZXJpbmUgYmFja2J1dHRvbiBoYW5kbGVyXG4jXG4kLmV4dGVuZChUYW5nZXJpbmUsVGFuZ2VyaW5lVmVyc2lvbilcblRhbmdlcmluZS5vbkJhY2tCdXR0b24gPSAoZXZlbnQpIC0+XG4gIGlmIFRhbmdlcmluZS5hY3Rpdml0eSA9PSBcImFzc2Vzc21lbnQgcnVuXCJcbiAgICBpZiBjb25maXJtIHQoXCJOYXZpZ2F0aW9uVmlldy5tZXNzYWdlLmluY29tcGxldGVfbWFpbl9zY3JlZW5cIilcbiAgICAgIFRhbmdlcmluZS5hY3Rpdml0eSA9IFwiXCJcbiAgICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICBlbHNlXG4gICAgd2luZG93Lmhpc3RvcnkuYmFjaygpXG5cblxuXG4jIEV4dGVuZCBldmVyeSB2aWV3IHdpdGggYSBjbG9zZSBtZXRob2QsIHVzZWQgYnkgVmlld01hbmFnZXJcbkJhY2tib25lLlZpZXcucHJvdG90eXBlLmNsb3NlID0gLT5cbiAgQHJlbW92ZSgpXG4gIEB1bmJpbmQoKVxuICBAb25DbG9zZT8oKVxuXG5cblxuIyBSZXR1cm5zIGFuIG9iamVjdCBoYXNoZWQgYnkgYSBnaXZlbiBhdHRyaWJ1dGUuXG5CYWNrYm9uZS5Db2xsZWN0aW9uLnByb3RvdHlwZS5pbmRleEJ5ID0gKCBhdHRyICkgLT5cbiAgcmVzdWx0ID0ge31cbiAgQG1vZGVscy5mb3JFYWNoIChvbmVNb2RlbCkgLT5cbiAgICBpZiBvbmVNb2RlbC5oYXMoYXR0cilcbiAgICAgIGtleSA9IG9uZU1vZGVsLmdldChhdHRyKVxuICAgICAgcmVzdWx0W2tleV0gPSBbXSBpZiBub3QgcmVzdWx0W2tleV0/XG4gICAgICByZXN1bHRba2V5XS5wdXNoKG9uZU1vZGVsKVxuICByZXR1cm4gcmVzdWx0XG5cbiMgUmV0dXJucyBhbiBvYmplY3QgaGFzaGVkIGJ5IGEgZ2l2ZW4gYXR0cmlidXRlLlxuQmFja2JvbmUuQ29sbGVjdGlvbi5wcm90b3R5cGUuaW5kZXhBcnJheUJ5ID0gKCBhdHRyICkgLT5cbiAgcmVzdWx0ID0gW11cbiAgQG1vZGVscy5mb3JFYWNoIChvbmVNb2RlbCkgLT5cbiAgICBpZiBvbmVNb2RlbC5oYXMoYXR0cilcbiAgICAgIGtleSA9IG9uZU1vZGVsLmdldChhdHRyKVxuICAgICAgcmVzdWx0W2tleV0gPSBbXSBpZiBub3QgcmVzdWx0W2tleV0/XG4gICAgICByZXN1bHRba2V5XS5wdXNoKG9uZU1vZGVsKVxuICByZXR1cm4gcmVzdWx0XG5cblxuIyBUaGlzIGlzIGZvciBQb3VjaERCJ3Mgc3R5bGUgb2YgcmV0dXJuaW5nIGRvY3VtZW50c1xuQmFja2JvbmUuQ29sbGVjdGlvbi5wcm90b3R5cGUucGFyc2UgPSAocmVzdWx0KSAtPlxuICByZXR1cm4gXy5wbHVjayByZXN1bHQucm93cywgJ2RvYydcblxuXG4jIGJ5IGRlZmF1bHQgYWxsIG1vZGVscyB3aWxsIHNhdmUgYSB0aW1lc3RhbXAgYW5kIGhhc2ggb2Ygc2lnbmlmaWNhbnQgYXR0cmlidXRlc1xuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLl9zYXZlID0gQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnNhdmVcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5zYXZlID0gLT5cbiAgQGJlZm9yZVNhdmU/KClcbiAgQHN0YW1wKClcbiAgQF9zYXZlLmFwcGx5KEAsIGFyZ3VtZW50cylcblxuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnN0YW1wID0gLT5cbiAgQHNldFxuICAgIGVkaXRlZEJ5IDogVGFuZ2VyaW5lPy51c2VyPy5uYW1lKCkgfHwgXCJ1bmtub3duXCJcbiAgICB1cGRhdGVkIDogKG5ldyBEYXRlKCkpLnRvU3RyaW5nKClcbiAgICBmcm9tSW5zdGFuY2VJZCA6IFRhbmdlcmluZS5zZXR0aW5ncy5nZXRTdHJpbmcoXCJpbnN0YW5jZUlkXCIpXG4gICAgY29sbGVjdGlvbiA6IEB1cmxcbiAgLCBzaWxlbnQ6IHRydWVcblxuXG4jXG4jIFRoaXMgc2VyaWVzIG9mIGZ1bmN0aW9ucyByZXR1cm5zIHByb3BlcnRpZXMgd2l0aCBkZWZhdWx0IHZhbHVlcyBpZiBubyBwcm9wZXJ0eSBpcyBmb3VuZFxuIyBAZ290Y2hhIGJlIG1pbmRmdWwgb2YgdGhlIGRlZmF1bHQgXCJibGFua1wiIHZhbHVlcyBzZXQgaGVyZVxuI1xuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldE51bWJlciA9ICAgICAgICAoa2V5LCBmYWxsYmFjayA9IDApICAtPiByZXR1cm4gaWYgQGhhcyhrZXkpIHRoZW4gcGFyc2VJbnQoQGdldChrZXkpKSBlbHNlIGZhbGxiYWNrXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZ2V0QXJyYXkgPSAgICAgICAgIChrZXksIGZhbGxiYWNrID0gW10pIC0+IHJldHVybiBpZiBAaGFzKGtleSkgdGhlbiBAZ2V0KGtleSkgICAgICAgICAgIGVsc2UgZmFsbGJhY2tcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5nZXRTdHJpbmcgPSAgICAgICAgKGtleSwgZmFsbGJhY2sgPSAnJykgLT4gcmV0dXJuIGlmIEBoYXMoa2V5KSB0aGVuIEBnZXQoa2V5KSAgICAgICAgICAgZWxzZSBmYWxsYmFja1xuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldEVzY2FwZWRTdHJpbmcgPSAoa2V5LCBmYWxsYmFjayA9ICcnKSAtPiByZXR1cm4gaWYgQGhhcyhrZXkpIHRoZW4gQGVzY2FwZShrZXkpICAgICAgICBlbHNlIGZhbGxiYWNrXG4jIHRoaXMgc2VlbXMgdG9vIGltcG9ydGFudCB0byB1c2UgYSBkZWZhdWx0XG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZ2V0Qm9vbGVhbiA9ICAgICAgIChrZXkpIC0+IHJldHVybiBpZiBAaGFzKGtleSkgdGhlbiAoQGdldChrZXkpID09IHRydWUgb3IgQGdldChrZXkpID09ICd0cnVlJylcblxuXG4jXG4jIGhhbmR5IGpxdWVyeSBmdW5jdGlvbnNcbiNcbiggKCQpIC0+XG5cbiAgJC5mbi5zY3JvbGxUbyA9IChzcGVlZCA9IDI1MCwgY2FsbGJhY2spIC0+XG4gICAgdHJ5XG4gICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSB7XG4gICAgICAgIHNjcm9sbFRvcDogJChAKS5vZmZzZXQoKS50b3AgKyAncHgnXG4gICAgICAgIH0sIHNwZWVkLCBudWxsLCBjYWxsYmFja1xuICAgIGNhdGNoIGVcbiAgICAgIGNvbnNvbGUubG9nIFwiZXJyb3JcIiwgZVxuICAgICAgY29uc29sZS5sb2cgXCJTY3JvbGwgZXJyb3Igd2l0aCAndGhpcydcIiwgQFxuXG4gICAgcmV0dXJuIEBcblxuICAjIHBsYWNlIHNvbWV0aGluZyB0b3AgYW5kIGNlbnRlclxuICAkLmZuLnRvcENlbnRlciA9IC0+XG4gICAgQGNzcyBcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIlxuICAgIEBjc3MgXCJ0b3BcIiwgJCh3aW5kb3cpLnNjcm9sbFRvcCgpICsgXCJweFwiXG4gICAgQGNzcyBcImxlZnRcIiwgKCgkKHdpbmRvdykud2lkdGgoKSAtIEBvdXRlcldpZHRoKCkpIC8gMikgKyAkKHdpbmRvdykuc2Nyb2xsTGVmdCgpICsgXCJweFwiXG5cbiAgIyBwbGFjZSBzb21ldGhpbmcgbWlkZGxlIGNlbnRlclxuICAkLmZuLm1pZGRsZUNlbnRlciA9IC0+XG4gICAgQGNzcyBcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIlxuICAgIEBjc3MgXCJ0b3BcIiwgKCgkKHdpbmRvdykuaGVpZ2h0KCkgLSB0aGlzLm91dGVySGVpZ2h0KCkpIC8gMikgKyAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgKyBcInB4XCJcbiAgICBAY3NzIFwibGVmdFwiLCAoKCQod2luZG93KS53aWR0aCgpIC0gdGhpcy5vdXRlcldpZHRoKCkpIC8gMikgKyAkKHdpbmRvdykuc2Nyb2xsTGVmdCgpICsgXCJweFwiXG5cblxuKShqUXVlcnkpXG5cblxuU3RyaW5nLnByb3RvdHlwZS5zYWZldHlEYW5jZSA9IC0+IHRoaXMucmVwbGFjZSgvXFxzL2csIFwiX1wiKS5yZXBsYWNlKC9bXmEtekEtWjAtOV9dL2csXCJcIilcblN0cmluZy5wcm90b3R5cGUuZGF0YWJhc2VTYWZldHlEYW5jZSA9IC0+IHRoaXMucmVwbGFjZSgvXFxzL2csIFwiX1wiKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teYS16MC05Xy1dL2csXCJcIilcblN0cmluZy5wcm90b3R5cGUuY291bnQgPSAoc3Vic3RyaW5nKSAtPiB0aGlzLm1hdGNoKG5ldyBSZWdFeHAgc3Vic3RyaW5nLCBcImdcIik/Lmxlbmd0aCB8fCAwXG5cblxuTWF0aC5hdmUgPSAtPlxuICByZXN1bHQgPSAwXG4gIHJlc3VsdCArPSB4IGZvciB4IGluIGFyZ3VtZW50c1xuICByZXN1bHQgLz0gYXJndW1lbnRzLmxlbmd0aFxuICByZXR1cm4gcmVzdWx0XG5cbk1hdGguaXNJbnQgICAgPSAtPiByZXR1cm4gdHlwZW9mIG4gPT0gJ251bWJlcicgJiYgcGFyc2VGbG9hdChuKSA9PSBwYXJzZUludChuLCAxMCkgJiYgIWlzTmFOKG4pXG5NYXRoLmRlY2ltYWxzID0gKG51bSwgZGVjaW1hbHMpIC0+IG0gPSBNYXRoLnBvdyggMTAsIGRlY2ltYWxzICk7IG51bSAqPSBtOyBudW0gPSAgbnVtKyhgbnVtPDA/LTAuNTorMC41YCk+PjA7IG51bSAvPSBtXG5NYXRoLmNvbW1hcyAgID0gKG51bSkgLT4gcGFyc2VJbnQobnVtKS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLFwiKVxuTWF0aC5saW1pdCAgICA9IChtaW4sIG51bSwgbWF4KSAtPiBNYXRoLm1heChtaW4sIE1hdGgubWluKG51bSwgbWF4KSlcblxuIyBtZXRob2QgbmFtZSBzbGlnaHRseSBtaXNsZWFkaW5nXG4jIHJldHVybnMgdHJ1ZSBmb3IgZmFsc3kgdmFsdWVzXG4jICAgbnVsbCwgdW5kZWZpbmVkLCBhbmQgJ1xccyonXG4jIG90aGVyIGZhbHNlIHZhbHVlcyBsaWtlXG4jICAgZmFsc2UsIDBcbiMgcmV0dXJuIGZhbHNlXG5fLmlzRW1wdHlTdHJpbmcgPSAoIGFTdHJpbmcgKSAtPlxuICByZXR1cm4gdHJ1ZSBpZiBhU3RyaW5nIGlzIG51bGxcbiAgcmV0dXJuIGZhbHNlIHVubGVzcyBfLmlzU3RyaW5nKGFTdHJpbmcpIG9yIF8uaXNOdW1iZXIoYVN0cmluZylcbiAgYVN0cmluZyA9IFN0cmluZyhhU3RyaW5nKSBpZiBfLmlzTnVtYmVyKGFTdHJpbmcpXG4gIHJldHVybiB0cnVlIGlmIGFTdHJpbmcucmVwbGFjZSgvXFxzKi8sICcnKSA9PSAnJ1xuICByZXR1cm4gZmFsc2VcblxuXy5pbmRleEJ5ID0gKCBwcm9wZXJ0eU5hbWUsIG9iamVjdEFycmF5ICkgLT5cbiAgcmVzdWx0ID0ge31cbiAgZm9yIG9uZU9iamVjdCBpbiBvYmplY3RBcnJheVxuICAgIGlmIG9uZU9iamVjdFtwcm9wZXJ0eU5hbWVdP1xuICAgICAga2V5ID0gb25lT2JqZWN0W3Byb3BlcnR5TmFtZV1cbiAgICAgIHJlc3VsdFtrZXldID0gW10gaWYgbm90IHJlc3VsdFtrZXldP1xuICAgICAgcmVzdWx0W2tleV0ucHVzaChvbmVPYmplY3QpXG4gIHJldHVybiByZXN1bHRcblxuXG5jbGFzcyBVdGlsc1xuXG4gIEBleGVjdXRlOiAoIGZ1bmN0aW9ucyApIC0+XG5cbiAgICBzdGVwID0gLT5cbiAgICAgIG5leHRGdW5jdGlvbiA9IGZ1bmN0aW9ucy5zaGlmdCgpXG4gICAgICBuZXh0RnVuY3Rpb24/KHN0ZXApXG4gICAgc3RlcCgpXG5cbiAgQGNoYW5nZUxhbmd1YWdlIDogKGNvZGUsIGNhbGxiYWNrKSAtPlxuICAgIGkxOG4uc2V0TG5nIGNvZGUsIGNhbGxiYWNrXG5cblxuICBAdXBsb2FkQ29tcHJlc3NlZDogKGRvY0xpc3QpIC0+XG5cbiAgICBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIilcbiAgICBhLmhyZWYgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBIb3N0XCIpXG4gICAgaWYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImdyb3VwSG9zdFwiKSA9PSBcImxvY2FsaG9zdFwiXG4gICAgICBhbGxEb2NzVXJsID0gXCJodHRwOi8vI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBIb3N0XCIpfS9fY29yc19idWxrX2RvY3MvY2hlY2svI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ3JvdXBEQn1cIlxuICAgIGVsc2VcbiAgICAgIGFsbERvY3NVcmwgPSBcIiN7YS5wcm90b2NvbH0vLyN7YS5ob3N0fS9fY29yc19idWxrX2RvY3MvY2hlY2svI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ3JvdXBEQn1cIlxuXG4gICAgJChcIiN1cGxvYWRfcmVzdWx0c1wiKS5hcHBlbmQodChcIlV0aWxzLm1lc3NhZ2UuY2hlY2tpbmdTZXJ2ZXJcIikgKyAnJm5ic3AnICsgZG9jTGlzdC5sZW5ndGggKyAnPGJyLz4nKVxuXG4gICAgcmV0dXJuICQuYWpheFxuICAgICAgdXJsOiBhbGxEb2NzVXJsXG4gICAgICB0eXBlOiBcIlBPU1RcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICBkYXRhOlxuICAgICAgICBrZXlzOiBKU09OLnN0cmluZ2lmeShkb2NMaXN0KVxuICAgICAgICB1c2VyOiBUYW5nZXJpbmUuc2V0dGluZ3MudXBVc2VyXG4gICAgICAgIHBhc3M6IFRhbmdlcmluZS5zZXR0aW5ncy51cFBhc3NcbiAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgZXJyb3JNZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkgZVxuICAgICAgICBhbGVydCBcIkVycm9yIGNvbm5lY3RpbmdcIiArIGVycm9yTWVzc2FnZVxuICAgICAgICAkKFwiI3VwbG9hZF9yZXN1bHRzXCIpLmFwcGVuZCgnRXJyb3IgY29ubmVjdGluZyB0byA6ICcgKyBhbGxEb2NzVXJsICsgJyAtIEVycm9yOiAnICsgZXJyb3JNZXNzYWdlICsgJzxici8+JylcbiAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT5cbiAgICAgICAgJChcIiN1cGxvYWRfcmVzdWx0c1wiKS5hcHBlbmQoJ1JlY2VpdmVkIHJlc3BvbnNlIGZyb20gc2VydmVyLjxici8+JylcbiAgICAgICAgcm93cyA9IHJlc3BvbnNlLnJvd3NcbiAgICAgICAgbGVmdFRvVXBsb2FkID0gW11cbiAgICAgICAgZm9yIHJvdyBpbiByb3dzXG4gICAgICAgICAgbGVmdFRvVXBsb2FkLnB1c2gocm93LmtleSkgaWYgcm93LmVycm9yP1xuXG4gICAgICAgIGlmIGxlZnRUb1VwbG9hZC5sZW5ndGggPiAwXG4gICAgICAgICAgJChcIiN1cGxvYWRfcmVzdWx0c1wiKS5hcHBlbmQodChcIlV0aWxzLm1lc3NhZ2UuY291bnRUYWJsZXRSZXN1bHRzXCIpICsgJyZuYnNwJyArIGxlZnRUb1VwbG9hZC5sZW5ndGggKyAnPGJyLz4nKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgJChcIiN1cGxvYWRfcmVzdWx0c1wiKS5hcHBlbmQodChcIlV0aWxzLm1lc3NhZ2Uubm9VcGxvYWRcIikgKyAnPGJyLz4nKVxuXG4gICAgICAgICMgaWYgaXQncyBhbHJlYWR5IGZ1bGx5IHVwbG9hZGVkXG4gICAgICAgICMgbWFrZSBzdXJlIGl0J3MgaW4gdGhlIGxvZ1xuXG4gICAgICAgIFRhbmdlcmluZS5kYi5hbGxEb2NzKGluY2x1ZGVfZG9jczp0cnVlLGtleXM6bGVmdFRvVXBsb2FkXG4gICAgICAgICkudGhlbiggKHJlc3BvbnNlKSAtPlxuICAgICAgICAgIGRvY3MgPSB7XCJkb2NzXCI6cmVzcG9uc2Uucm93cy5tYXAoKGVsKS0+ZWwuZG9jKX1cbiAgICAgICAgICBjb21wcmVzc2VkRGF0YSA9IExaU3RyaW5nLmNvbXByZXNzVG9CYXNlNjQoSlNPTi5zdHJpbmdpZnkoZG9jcykpXG4gICAgICAgICAgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpXG4gICAgICAgICAgYS5ocmVmID0gVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImdyb3VwSG9zdFwiKVxuICAgICAgICAgIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJncm91cEhvc3RcIikgPT0gXCJsb2NhbGhvc3RcIlxuICAgICAgICAgICAgYnVsa0RvY3NVcmwgPSBcImh0dHA6Ly8je1RhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJncm91cEhvc3RcIil9L19jb3JzX2J1bGtfZG9jcy91cGxvYWQvI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ3JvdXBEQn1cIlxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJ1bGtEb2NzVXJsID0gXCIje2EucHJvdG9jb2x9Ly8je2EuaG9zdH0vX2NvcnNfYnVsa19kb2NzL3VwbG9hZC8je1RhbmdlcmluZS5zZXR0aW5ncy5ncm91cERCfVwiXG5cbiAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIHR5cGUgOiBcIlBPU1RcIlxuICAgICAgICAgICAgdXJsIDogYnVsa0RvY3NVcmxcbiAgICAgICAgICAgIGRhdGEgOiBjb21wcmVzc2VkRGF0YVxuICAgICAgICAgICAgZXJyb3I6IChlKSA9PlxuICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeSBlXG4gICAgICAgICAgICAgIGFsZXJ0IFwiU2VydmVyIGJ1bGsgZG9jcyBlcnJvclwiICsgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICQoXCIjdXBsb2FkX3Jlc3VsdHNcIikuYXBwZW5kKHQoXCJVdGlscy5tZXNzYWdlLmJ1bGtEb2NzRXJyb3JcIikgKyBidWxrRG9jc1VybCArICcgLSAnICsgdChcIlV0aWxzLm1lc3NhZ2UuZXJyb3JcIikgKyAnOiAnICsgZXJyb3JNZXNzYWdlICsgJzxici8+JylcbiAgICAgICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgICAgIFV0aWxzLnN0aWNreSB0KFwiVXRpbHMubWVzc2FnZS5yZXN1bHRzVXBsb2FkZWRcIilcbiAgICAgICAgICAgICAgJChcIiN1cGxvYWRfcmVzdWx0c1wiKS5hcHBlbmQodChcIlV0aWxzLm1lc3NhZ2UudW5pdmVyc2FsVXBsb2FkQ29tcGxldGVcIikrICc8YnIvPicpXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICApXG5cblxuICBAdW5pdmVyc2FsVXBsb2FkOiAtPlxuICAgIHJlc3VsdHMgPSBuZXcgUmVzdWx0c1xuICAgIHJlc3VsdHMuZmV0Y2hcbiAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgIGRvY0xpc3QgPSByZXN1bHRzLnBsdWNrKFwiX2lkXCIpXG4gICAgICAgIFV0aWxzLnVwbG9hZENvbXByZXNzZWQoZG9jTGlzdClcblxuICBAc2F2ZURvY0xpc3RUb0ZpbGU6IC0+XG4jICAgIFRhbmdlcmluZS5kYi5hbGxEb2NzKGluY2x1ZGVfZG9jczp0cnVlKS50aGVuKCAocmVzcG9uc2UpIC0+XG4jICAgICAgVXRpbHMuc2F2ZVJlY29yZHNUb0ZpbGUoSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKVxuIyAgICApXG4gICAgcmVzdWx0cyA9IG5ldyBSZXN1bHRzXG4gICAgcmVzdWx0cy5mZXRjaFxuICAgICAgc3VjY2VzczogLT5cbiMgICAgICAgIGNvbnNvbGUubG9nKFwicmVzdWx0czogXCIgKyBKU09OLnN0cmluZ2lmeShyZXN1bHRzKSlcbiAgICAgICAgVXRpbHMuc2F2ZVJlY29yZHNUb0ZpbGUoSlNPTi5zdHJpbmdpZnkocmVzdWx0cykpXG5cbiAgQGNoZWNrU2Vzc2lvbjogKHVybCwgb3B0aW9ucykgLT5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAkLmFqYXhcbiAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICB1cmw6ICB1cmwsXG4gICAgICBhc3luYzogdHJ1ZSxcbiAgICAgIGRhdGE6IFwiXCIsXG4gICAgICBiZWZvcmVTZW5kOiAoeGhyKS0+XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAsXG4gICAgICBjb21wbGV0ZTogKHJlcSkgLT5cbiAgICAgICAgcmVzcCA9ICQucGFyc2VKU09OKHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICBpZiAocmVxLnN0YXR1cyA9PSAyMDApXG4gICAgICAgICAgY29uc29sZS5sb2coXCJMb2dnZWQgaW4uXCIpXG4gICAgICAgICAgaWYgb3B0aW9ucy5zdWNjZXNzXG4gICAgICAgICAgICBvcHRpb25zLnN1Y2Nlc3MocmVzcClcbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5lcnJvcilcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOlwiICsgcmVxLnN0YXR1cyArIFwiIHJlc3AuZXJyb3I6IFwiICsgcmVzcC5lcnJvcilcbiAgICAgICAgICBvcHRpb25zLmVycm9yKHJlcS5zdGF0dXMsIHJlc3AuZXJyb3IsIHJlc3AucmVhc29uKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGFsZXJ0KFwiQW4gZXJyb3Igb2NjdXJyZWQgZ2V0dGluZyBzZXNzaW9uIGluZm86IFwiICsgcmVzcC5yZWFzb24pXG5cbiMgIEBzdGFydFJlcGxpY2F0aW9uID0gICgpIC0+XG4jICAgIGNyZWRlbnRpYWxzID0gYWNjb3VudC51c2VybmFtZSArIFwiOlwiICsgYWNjb3VudC5wYXNzd29yZDtcbiMgICAgY291Y2hkYiA9ICBcInRyb3VibGV0aWNrZXRzX1wiICsgIGFjY291bnQuc2l0ZTtcbiMgICAgc3ViZG9tYWluID0gIFwidWdcIiArICBhY2NvdW50LnNpdGU7XG4jICAgIHJlbW90ZUNvdWNoID0gXCJodHRwOi8vXCIgKyBjcmVkZW50aWFscyArIFwiQGxvY2FsaG9zdDo1OTg0L1wiICsgY291Y2hkYiArIFwiL1wiO1xuIyAgICBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIilcbiMgICAgYS5ocmVmID0gVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImdyb3VwSG9zdFwiKVxuIyAgICBidWxrRG9jc1VybCA9IFwiI3thLnByb3RvY29sfS8vI3thLmhvc3R9LyN7VGFuZ2VyaW5lLnNldHRpbmdzLmdyb3VwREJ9XCJcbiMgICAgY29uc29sZS5sb2coXCJzdGFydCByZXBsaWNhdGlvbiB3aXRoIFwiICsgcmVtb3RlQ291Y2gpXG4jICAgIG9wdHMgPSB7Y29udGludW91czogZmFsc2UsXG4jICAgICAgd2l0aENyZWRlbnRpYWxzOnRydWUsXG4jICAgICMvL2Nvb2tpZUF1dGg6IHt1c2VybmFtZTphY2NvdW50LnVzZXJuYW1lLCBwYXNzd29yZDphY2NvdW50LnBhc3N3b3JkfSxcbiMgICAgYXV0aDoge3VzZXJuYW1lOmFjY291bnQudXNlcm5hbWUsIHBhc3N3b3JkOmFjY291bnQucGFzc3dvcmR9LFxuIyAgICBjb21wbGV0ZTogQ29jb251dFV0aWxzLm9uQ29tcGxldGUsXG4jICAgIHRpbWVvdXQ6IDYwMDAwfTtcbiMgICAgQmFja2JvbmUuc3luYy5kZWZhdWx0cy5kYi5yZXBsaWNhdGUudG8ocmVtb3RlQ291Y2gsIG9wdHMsIENvY29udXRVdGlscy5SZXBsaWNhdGlvbkVycm9yTG9nKTtcblxuICBAY2xvdWRfdXJsX3dpdGhfY3JlZGVudGlhbHM6IChjbG91ZF91cmwpLT5cbiAgICBjbG91ZF9jcmVkZW50aWFscyA9IFwidXNlcm5hbWU6cGFzc3dvcmRcIlxuICAgIGNsb3VkX3VybC5yZXBsYWNlKC9odHRwOlxcL1xcLy8sXCJodHRwOi8vI3tjbG91ZF9jcmVkZW50aWFsc31AXCIpXG5cbiAgQHJlcGxpY2F0ZVRvU2VydmVyOiAob3B0aW9ucywgZGl2SWQpIC0+XG4gICAgb3B0aW9ucyA9IHt9IGlmICFvcHRpb25zXG4gICAgb3B0cyA9XG4jICAgICAgbGl2ZTp0cnVlXG4gICAgICBjb250aW51b3VzOiBmYWxzZVxuIyAgICAgIGJhdGNoX3NpemU6NVxuIyAgICAgIGZpbHRlcjogZmlsdGVyXG4jICAgICAgYmF0Y2hlc19saW1pdDoxXG4gICAgICB3aXRoQ3JlZGVudGlhbHM6dHJ1ZVxuIyAgICAgIGF1dGg6XG4jICAgICAgICB1c2VybmFtZTphY2NvdW50LnVzZXJuYW1lXG4jICAgICAgICBwYXNzd29yZDphY2NvdW50LnBhc3N3b3JkXG4gICAgICBjb21wbGV0ZTogKHJlc3VsdCkgLT5cbiAgICAgICAgaWYgdHlwZW9mIHJlc3VsdCAhPSAndW5kZWZpbmVkJyAmJiByZXN1bHQgIT0gbnVsbCAmJiByZXN1bHQub2tcbiAgICAgICAgICBjb25zb2xlLmxvZyBcInJlcGxpY2F0ZVRvU2VydmVyIC0gb25Db21wbGV0ZTogUmVwbGljYXRpb24gaXMgZmluZS4gXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbnNvbGUubG9nIFwicmVwbGljYXRlVG9TZXJ2ZXIgLSBvbkNvbXBsZXRlOiBSZXBsaWNhdGlvbiBtZXNzYWdlOiBcIiArIHJlc3VsdFxuICAgICAgZXJyb3I6IChyZXN1bHQpIC0+XG4gICAgICAgIGNvbnNvbGUubG9nIFwiZXJyb3I6IFJlcGxpY2F0aW9uIGVycm9yOiBcIiArIEpTT04uc3RyaW5naWZ5IHJlc3VsdFxuICAgICAgdGltZW91dDogNjAwMDBcbiAgICBfLmV4dGVuZCBvcHRpb25zLCBvcHRzXG5cbiAgICBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIilcbiAgICBhLmhyZWYgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBIb3N0XCIpXG4gICAgcmVwbGljYXRpb25VUkwgPSBcIiN7YS5wcm90b2NvbH0vLyN7YS5ob3N0fS8je1RhbmdlcmluZS5zZXR0aW5ncy5ncm91cERCfVwiXG4gICAgY3JlZFJlcGxpVXJsID0gQGNsb3VkX3VybF93aXRoX2NyZWRlbnRpYWxzKHJlcGxpY2F0aW9uVVJMKVxuICAgIGNvbnNvbGUubG9nKFwiY3JlZFJlcGxpVXJsOiBcIiArIGNyZWRSZXBsaVVybClcbiAgICBCYWNrYm9uZS5zeW5jLmRlZmF1bHRzLmRiLnJlcGxpY2F0ZS50byhjcmVkUmVwbGlVcmwsIG9wdGlvbnMpLm9uKCd1cHRvZGF0ZScsIChyZXN1bHQpIC0+XG4gICAgICBpZiB0eXBlb2YgcmVzdWx0ICE9ICd1bmRlZmluZWQnICYmIHJlc3VsdC5va1xuICAgICAgICBjb25zb2xlLmxvZyBcInVwdG9kYXRlOiBSZXBsaWNhdGlvbiBpcyBmaW5lLiBcIlxuICAgICAgICBvcHRpb25zLmNvbXBsZXRlKClcbiAgICAgICAgaWYgdHlwZW9mIG9wdGlvbnMuc3VjY2VzcyAhPSAndW5kZWZpbmVkJ1xuICAgICAgICAgIG9wdGlvbnMuc3VjY2VzcygpXG4gICAgICBlbHNlXG4gICAgICAgIGNvbnNvbGUubG9nIFwidXB0b2RhdGU6IFJlcGxpY2F0aW9uIGVycm9yOiBcIiArIEpTT04uc3RyaW5naWZ5IHJlc3VsdCkub24oJ2NoYW5nZScsIChpbmZvKS0+XG4gICAgICBjb25zb2xlLmxvZyBcIkNoYW5nZTogXCIgKyBKU09OLnN0cmluZ2lmeSBpbmZvXG4gICAgICBkb2NfY291bnQgPSBvcHRpb25zLnN0YXR1cz8uZG9jX2NvdW50XG4gICAgICBkb2NfZGVsX2NvdW50ID0gb3B0aW9ucy5zdGF0dXM/LmRvY19kZWxfY291bnRcbiAgICAgIHRvdGFsX2RvY3MgPSBkb2NfY291bnQ/ICsgZG9jX2RlbF9jb3VudD9cbiAgICAgIGRvY193cml0dGVuID0gaW5mby5kb2NzX3dyaXR0ZW5cbiAgICAgIHBlcmNlbnREb25lID0gTWF0aC5mbG9vcigoZG9jX3dyaXR0ZW4vdG90YWxfZG9jcykgKiAxMDApXG4gICAgICBpZiAhaXNOYU4gIHBlcmNlbnREb25lXG4gICAgICAgIG1zZyA9IFwiQ2hhbmdlOiBkb2NzX3dyaXR0ZW46IFwiICsgZG9jX3dyaXR0ZW4gKyBcIiBvZiBcIiArICB0b3RhbF9kb2NzICsgXCIuIFBlcmNlbnQgRG9uZTogXCIgKyBwZXJjZW50RG9uZSArIFwiJTxici8+XCJcbiAgICAgIGVsc2VcbiAgICAgICAgbXNnID0gXCJDaGFuZ2U6IGRvY3Nfd3JpdHRlbjogXCIgKyBkb2Nfd3JpdHRlbiArIFwiPGJyLz5cIlxuICAgICAgY29uc29sZS5sb2coXCJtc2c6IFwiICsgbXNnKVxuICAgICAgJChkaXZJZCkuYXBwZW5kIG1zZ1xuICAgICkub24oJ2NvbXBsZXRlJywgKGluZm8pLT5cbiAgICAgIGNvbnNvbGUubG9nIFwiQ29tcGxldGU6IFwiICsgSlNPTi5zdHJpbmdpZnkgaW5mb1xuICAgIClcbiMgICAgQ29jb251dC5tZW51Vmlldy5jaGVja1JlcGxpY2F0aW9uU3RhdHVzKCk7XG5cbiAgQHJlc3RhcnRUYW5nZXJpbmU6IChtZXNzYWdlLCBjYWxsYmFjaykgLT5cbiAgICBVdGlscy5taWRBbGVydCBcIiN7bWVzc2FnZSB8fCAnUmVzdGFydGluZyBUYW5nZXJpbmUnfVwiXG4gICAgXy5kZWxheSggLT5cbiAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICBjYWxsYmFjaz8oKVxuICAgICwgMjAwMCApXG5cbiAgQG9uVXBkYXRlU3VjY2VzczogKHRvdGFsRG9jcykgLT5cbiAgICBVdGlscy5kb2N1bWVudENvdW50ZXIrK1xuICAgIGlmIFV0aWxzLmRvY3VtZW50Q291bnRlciA9PSB0b3RhbERvY3NcbiAgICAgIFV0aWxzLnJlc3RhcnRUYW5nZXJpbmUgXCJVcGRhdGUgc3VjY2Vzc2Z1bFwiLCAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiXCIsIGZhbHNlXG4gICAgICAgIFV0aWxzLmFza1RvTG9nb3V0KCkgdW5sZXNzIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpID09IFwic2VydmVyXCJcbiAgICAgIFV0aWxzLmRvY3VtZW50Q291bnRlciA9IG51bGxcblxuXG4gIEBsb2c6IChzZWxmLCBlcnJvcikgLT5cbiAgICBjbGFzc05hbWUgPSBzZWxmLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL2Z1bmN0aW9uXFxzKihcXHcrKS8pWzFdXG4gICAgY29uc29sZS5sb2cgXCIje2NsYXNzTmFtZX06ICN7ZXJyb3J9XCJcblxuICAjIGlmIGFyZ3MgaXMgb25lIG9iamVjdCBzYXZlIGl0IHRvIHRlbXBvcmFyeSBoYXNoXG4gICMgaWYgdHdvIHN0cmluZ3MsIHNhdmUga2V5IHZhbHVlIHBhaXJcbiAgIyBpZiBvbmUgc3RyaW5nLCB1c2UgYXMga2V5LCByZXR1cm4gdmFsdWVcbiAgQGRhdGE6IChhcmdzLi4uKSAtPlxuICAgIGlmIGFyZ3MubGVuZ3RoID09IDFcbiAgICAgIGFyZyA9IGFyZ3NbMF1cbiAgICAgIGlmIF8uaXNTdHJpbmcoYXJnKVxuICAgICAgICByZXR1cm4gVGFuZ2VyaW5lLnRlbXBEYXRhW2FyZ11cbiAgICAgIGVsc2UgaWYgXy5pc09iamVjdChhcmcpXG4gICAgICAgIFRhbmdlcmluZS50ZW1wRGF0YSA9ICQuZXh0ZW5kKFRhbmdlcmluZS50ZW1wRGF0YSwgYXJnKVxuICAgICAgZWxzZSBpZiBhcmcgPT0gbnVsbFxuICAgICAgICBUYW5nZXJpbmUudGVtcERhdGEgPSB7fVxuICAgIGVsc2UgaWYgYXJncy5sZW5ndGggPT0gMlxuICAgICAga2V5ID0gYXJnc1swXVxuICAgICAgdmFsdWUgPSBhcmdzWzFdXG4gICAgICBUYW5nZXJpbmUudGVtcERhdGFba2V5XSA9IHZhbHVlXG4gICAgICByZXR1cm4gVGFuZ2VyaW5lLnRlbXBEYXRhXG4gICAgZWxzZSBpZiBhcmdzLmxlbmd0aCA9PSAwXG4gICAgICByZXR1cm4gVGFuZ2VyaW5lLnRlbXBEYXRhXG5cblxuICBAd29ya2luZzogKGlzV29ya2luZykgLT5cbiAgICBpZiBpc1dvcmtpbmdcbiAgICAgIGlmIG5vdCBUYW5nZXJpbmUubG9hZGluZ1RpbWVyP1xuICAgICAgICBUYW5nZXJpbmUubG9hZGluZ1RpbWVyID0gc2V0VGltZW91dChVdGlscy5zaG93TG9hZGluZ0luZGljYXRvciwgMzAwMClcbiAgICBlbHNlXG4gICAgICBpZiBUYW5nZXJpbmUubG9hZGluZ1RpbWVyP1xuICAgICAgICBjbGVhclRpbWVvdXQgVGFuZ2VyaW5lLmxvYWRpbmdUaW1lclxuICAgICAgICBUYW5nZXJpbmUubG9hZGluZ1RpbWVyID0gbnVsbFxuXG4gICAgICAkKFwiLmxvYWRpbmdfYmFyXCIpLnJlbW92ZSgpXG5cbiAgQHNob3dMb2FkaW5nSW5kaWNhdG9yOiAtPlxuICAgICQoXCI8ZGl2IGNsYXNzPSdsb2FkaW5nX2Jhcic+PGltZyBjbGFzcz0nbG9hZGluZycgc3JjPSdpbWFnZXMvbG9hZGluZy5naWYnPjwvZGl2PlwiKS5hcHBlbmRUbyhcImJvZHlcIikubWlkZGxlQ2VudGVyKClcblxuICAjIGFza3MgZm9yIGNvbmZpcm1hdGlvbiBpbiB0aGUgYnJvd3NlciwgYW5kIHVzZXMgcGhvbmVnYXAgZm9yIGNvb2wgY29uZmlybWF0aW9uXG4gIEBjb25maXJtOiAobWVzc2FnZSwgb3B0aW9ucykgLT5cbiAgICBpZiBuYXZpZ2F0b3Iubm90aWZpY2F0aW9uPy5jb25maXJtP1xuICAgICAgbmF2aWdhdG9yLm5vdGlmaWNhdGlvbi5jb25maXJtIG1lc3NhZ2UsXG4gICAgICAgIChpbnB1dCkgLT5cbiAgICAgICAgICBpZiBpbnB1dCA9PSAxXG4gICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrIHRydWVcbiAgICAgICAgICBlbHNlIGlmIGlucHV0ID09IDJcbiAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2sgZmFsc2VcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrIGlucHV0XG4gICAgICAsIG9wdGlvbnMudGl0bGUsIG9wdGlvbnMuYWN0aW9uK1wiLENhbmNlbFwiXG4gICAgZWxzZVxuICAgICAgaWYgd2luZG93LmNvbmZpcm0gbWVzc2FnZVxuICAgICAgICBvcHRpb25zLmNhbGxiYWNrIHRydWVcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgb3B0aW9ucy5jYWxsYmFjayBmYWxzZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gMFxuXG4gICMgdGhpcyBmdW5jdGlvbiBpcyBhIGxvdCBsaWtlIGpRdWVyeS5zZXJpYWxpemVBcnJheSwgZXhjZXB0IHRoYXQgaXQgcmV0dXJucyB1c2VmdWwgb3V0cHV0XG4gICMgd29ya3Mgb24gdGV4dGFyZWFzLCBpbnB1dCB0eXBlIHRleHQgYW5kIHBhc3N3b3JkXG4gIEBnZXRWYWx1ZXM6ICggc2VsZWN0b3IgKSAtPlxuICAgIHZhbHVlcyA9IHt9XG4gICAgJChzZWxlY3RvcikuZmluZChcImlucHV0W3R5cGU9dGV4dF0sIGlucHV0W3R5cGU9cGFzc3dvcmRdLCB0ZXh0YXJlYVwiKS5lYWNoICggaW5kZXgsIGVsZW1lbnQgKSAtPlxuICAgICAgdmFsdWVzW2VsZW1lbnQuaWRdID0gZWxlbWVudC52YWx1ZVxuICAgIHJldHVybiB2YWx1ZXNcblxuICAjIGNvbnZlcnRzIHVybCBlc2NhcGVkIGNoYXJhY3RlcnNcbiAgQGNsZWFuVVJMOiAodXJsKSAtPlxuICAgIGlmIHVybC5pbmRleE9mPyhcIiVcIikgIT0gLTFcbiAgICAgIHVybCA9IGRlY29kZVVSSUNvbXBvbmVudCB1cmxcbiAgICBlbHNlXG4gICAgICB1cmxcblxuICAjIERpc3Bvc2FibGUgYWxlcnRzXG4gIEB0b3BBbGVydDogKGFsZXJ0VGV4dCwgZGVsYXkgPSAyMDAwKSAtPlxuICAgIFV0aWxzLmFsZXJ0IFwidG9wXCIsIGFsZXJ0VGV4dCwgZGVsYXlcblxuICBAbWlkQWxlcnQ6IChhbGVydFRleHQsIGRlbGF5PTIwMDApIC0+XG4gICAgVXRpbHMuYWxlcnQgXCJtaWRkbGVcIiwgYWxlcnRUZXh0LCBkZWxheVxuXG4gIEBhbGVydDogKCB3aGVyZSwgYWxlcnRUZXh0LCBkZWxheSA9IDIwMDAgKSAtPlxuXG4gICAgc3dpdGNoIHdoZXJlXG4gICAgICB3aGVuIFwidG9wXCJcbiAgICAgICAgc2VsZWN0b3IgPSBcIi50b3BfYWxlcnRcIlxuICAgICAgICBhbGlnbmVyID0gKCAkZWwgKSAtPiByZXR1cm4gJGVsLnRvcENlbnRlcigpXG4gICAgICB3aGVuIFwibWlkZGxlXCJcbiAgICAgICAgc2VsZWN0b3IgPSBcIi5taWRfYWxlcnRcIlxuICAgICAgICBhbGlnbmVyID0gKCAkZWwgKSAtPiByZXR1cm4gJGVsLm1pZGRsZUNlbnRlcigpXG5cblxuICAgIGlmIFV0aWxzW1wiI3t3aGVyZX1BbGVydFRpbWVyXCJdP1xuICAgICAgY2xlYXJUaW1lb3V0IFV0aWxzW1wiI3t3aGVyZX1BbGVydFRpbWVyXCJdXG4gICAgICAkYWxlcnQgPSAkKHNlbGVjdG9yKVxuICAgICAgJGFsZXJ0Lmh0bWwoICRhbGVydC5odG1sKCkgKyBcIjxicj5cIiArIGFsZXJ0VGV4dCApXG4gICAgZWxzZVxuICAgICAgJGFsZXJ0ID0gJChcIjxkaXYgY2xhc3M9JyN7c2VsZWN0b3Iuc3Vic3RyaW5nKDEpfSBkaXNwb3NhYmxlX2FsZXJ0Jz4je2FsZXJ0VGV4dH08L2Rpdj5cIikuYXBwZW5kVG8oXCIjY29udGVudFwiKVxuXG4gICAgYWxpZ25lcigkYWxlcnQpXG5cbiAgICBkbyAoJGFsZXJ0LCBzZWxlY3RvciwgZGVsYXkpIC0+XG4gICAgICBjb21wdXRlZERlbGF5ID0gKChcIlwiKyRhbGVydC5odG1sKCkpLm1hdGNoKC88YnI+L2cpfHxbXSkubGVuZ3RoICogMTUwMFxuICAgICAgVXRpbHNbXCIje3doZXJlfUFsZXJ0VGltZXJcIl0gPSBzZXRUaW1lb3V0IC0+XG4gICAgICAgICAgVXRpbHNbXCIje3doZXJlfUFsZXJ0VGltZXJcIl0gPSBudWxsXG4gICAgICAgICAgJGFsZXJ0LmZhZGVPdXQoMjUwLCAtPiAkKHRoaXMpLnJlbW92ZSgpIClcbiAgICAgICwgTWF0aC5tYXgoY29tcHV0ZWREZWxheSwgZGVsYXkpXG5cblxuXG4gIEBzdGlja3k6IChodG1sLCBidXR0b25UZXh0ID0gXCJDbG9zZVwiLCBjYWxsYmFjaywgcG9zaXRpb24gPSBcIm1pZGRsZVwiKSAtPlxuICAgIGRpdiA9ICQoXCI8ZGl2IGNsYXNzPSdzdGlja3lfYWxlcnQnPiN7aHRtbH08YnI+PGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBwYXJlbnRfcmVtb3ZlJz4je2J1dHRvblRleHR9PC9idXR0b24+PC9kaXY+XCIpLmFwcGVuZFRvKFwiI2NvbnRlbnRcIilcbiAgICBpZiBwb3NpdGlvbiA9PSBcIm1pZGRsZVwiXG4gICAgICBkaXYubWlkZGxlQ2VudGVyKClcbiAgICBlbHNlIGlmIHBvc2l0aW9uID09IFwidG9wXCJcbiAgICAgIGRpdi50b3BDZW50ZXIoKVxuICAgIGRpdi5vbihcImtleXVwXCIsIChldmVudCkgLT4gaWYgZXZlbnQud2hpY2ggPT0gMjcgdGhlbiAkKHRoaXMpLnJlbW92ZSgpKS5maW5kKFwiYnV0dG9uXCIpLmNsaWNrIGNhbGxiYWNrXG5cbiAgQHRvcFN0aWNreTogKGh0bWwsIGJ1dHRvblRleHQgPSBcIkNsb3NlXCIsIGNhbGxiYWNrKSAtPlxuICAgIFV0aWxzLnN0aWNreShodG1sLCBidXR0b25UZXh0LCBjYWxsYmFjaywgXCJ0b3BcIilcblxuXG5cbiAgQG1vZGFsOiAoaHRtbCkgLT5cbiAgICBpZiBodG1sID09IGZhbHNlXG4gICAgICAkKFwiI21vZGFsX2JhY2ssICNtb2RhbFwiKS5yZW1vdmUoKVxuICAgICAgcmV0dXJuXG5cbiAgICAkKFwiYm9keVwiKS5wcmVwZW5kKFwiPGRpdiBpZD0nbW9kYWxfYmFjayc+PC9kaXY+XCIpXG4gICAgJChcIjxkaXYgaWQ9J21vZGFsJz4je2h0bWx9PC9kaXY+XCIpLmFwcGVuZFRvKFwiI2NvbnRlbnRcIikubWlkZGxlQ2VudGVyKCkub24oXCJrZXl1cFwiLCAoZXZlbnQpIC0+IGlmIGV2ZW50LndoaWNoID09IDI3IHRoZW4gJChcIiNtb2RhbF9iYWNrLCAjbW9kYWxcIikucmVtb3ZlKCkpXG5cbiAgQHBhc3N3b3JkUHJvbXB0OiAoY2FsbGJhY2spIC0+XG4gICAgaHRtbCA9IFwiXG4gICAgICA8ZGl2IGlkPSdwYXNzX2Zvcm0nIHRpdGxlPSdVc2VyIHZlcmlmaWNhdGlvbic+XG4gICAgICAgIDxsYWJlbCBmb3I9J3Bhc3N3b3JkJz5QbGVhc2UgcmUtZW50ZXIgeW91ciBwYXNzd29yZDwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0ncGFzc192YWwnIHR5cGU9J3Bhc3N3b3JkJyBuYW1lPSdwYXNzd29yZCcgaWQ9J3Bhc3N3b3JkJyB2YWx1ZT0nJz5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCcgZGF0YS12ZXJpZnk9J3RydWUnPlZlcmlmeTwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIFwiXG5cbiAgICBVdGlscy5tb2RhbCBodG1sXG5cbiAgICAkcGFzcyA9ICQoXCIjcGFzc192YWxcIilcbiAgICAkYnV0dG9uID0gJChcIiNwYXNzX3ZhbGZvcm0gYnV0dG9uXCIpXG5cbiAgICAkcGFzcy5vbiBcImtleXVwXCIsIChldmVudCkgLT5cbiAgICAgIHJldHVybiB0cnVlIHVubGVzcyBldmVudC53aGljaCA9PSAxM1xuICAgICAgJGJ1dHRvbi5vZmYgXCJjbGlja1wiXG4gICAgICAkcGFzcy5vZmYgXCJjaGFuZ2VcIlxuXG4gICAgICBjYWxsYmFjayAkcGFzcy52YWwoKVxuICAgICAgVXRpbHMubW9kYWwgZmFsc2VcblxuICAgICRidXR0b24ub24gXCJjbGlja1wiLCAoZXZlbnQpIC0+XG4gICAgICAkYnV0dG9uLm9mZiBcImNsaWNrXCJcbiAgICAgICRwYXNzLm9mZiBcImNoYW5nZVwiXG5cbiAgICAgIGNhbGxiYWNrICRwYXNzLnZhbCgpIGlmICQoZXZlbnQudGFyZ2V0KS5hdHRyKFwiZGF0YS12ZXJpZnlcIikgPT0gXCJ0cnVlXCJcblxuICAgICAgVXRpbHMubW9kYWwgZmFsc2VcblxuXG5cbiAgIyByZXR1cm5zIGEgR1VJRFxuICBAZ3VpZDogLT5cbiAgIHJldHVybiBAUzQoKStAUzQoKStcIi1cIitAUzQoKStcIi1cIitAUzQoKStcIi1cIitAUzQoKStcIi1cIitAUzQoKStAUzQoKStAUzQoKVxuICBAUzQ6IC0+XG4gICByZXR1cm4gKCAoICggMSArIE1hdGgucmFuZG9tKCkgKSAqIDB4MTAwMDAgKSB8IDAgKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG5cbiAgQGh1bWFuR1VJRDogLT4gcmV0dXJuIEByYW5kb21MZXR0ZXJzKDQpK1wiLVwiK0ByYW5kb21MZXR0ZXJzKDQpK1wiLVwiK0ByYW5kb21MZXR0ZXJzKDQpXG4gIEBzYWZlTGV0dGVycyA9IFwiYWJjZGVmZ2hpamxtbm9wcXJzdHV2d3h5elwiLnNwbGl0KFwiXCIpXG4gIEByYW5kb21MZXR0ZXJzOiAobGVuZ3RoKSAtPlxuICAgIHJlc3VsdCA9IFwiXCJcbiAgICB3aGlsZSBsZW5ndGgtLVxuICAgICAgcmVzdWx0ICs9IFV0aWxzLnNhZmVMZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpVdGlscy5zYWZlTGV0dGVycy5sZW5ndGgpXVxuICAgIHJldHVybiByZXN1bHRcblxuICAjIHR1cm5zIHRoZSBib2R5IGJhY2tncm91bmQgYSBjb2xvciBhbmQgdGhlbiByZXR1cm5zIHRvIHdoaXRlXG4gIEBmbGFzaDogKGNvbG9yPVwicmVkXCIsIHNob3VsZFR1cm5JdE9uID0gbnVsbCkgLT5cblxuICAgIGlmIG5vdCBzaG91bGRUdXJuSXRPbj9cbiAgICAgIFV0aWxzLmJhY2tncm91bmQgY29sb3JcbiAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgVXRpbHMuYmFja2dyb3VuZCBcIlwiXG4gICAgICAsIDEwMDBcblxuICBAYmFja2dyb3VuZDogKGNvbG9yKSAtPlxuICAgIGlmIGNvbG9yP1xuICAgICAgJChcIiNjb250ZW50X3dyYXBwZXJcIikuY3NzIFwiYmFja2dyb3VuZENvbG9yXCIgOiBjb2xvclxuICAgIGVsc2VcbiAgICAgICQoXCIjY29udGVudF93cmFwcGVyXCIpLmNzcyBcImJhY2tncm91bmRDb2xvclwiXG5cbiAgIyBSZXRyaWV2ZXMgR0VUIHZhcmlhYmxlc1xuICAjIGh0dHA6Ly9lam9obi5vcmcvYmxvZy9zZWFyY2gtYW5kLWRvbnQtcmVwbGFjZS9cbiAgQCRfR0VUOiAocSwgcykgLT5cbiAgICB2YXJzID0ge31cbiAgICBwYXJ0cyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnJlcGxhY2UoL1s/Jl0rKFtePSZdKyk9KFteJl0qKS9naSwgKG0sa2V5LHZhbHVlKSAtPlxuICAgICAgICB2YWx1ZSA9IGlmIH52YWx1ZS5pbmRleE9mKFwiI1wiKSB0aGVuIHZhbHVlLnNwbGl0KFwiI1wiKVswXSBlbHNlIHZhbHVlXG4gICAgICAgIHZhcnNba2V5XSA9IHZhbHVlLnNwbGl0KFwiI1wiKVswXTtcbiAgICApXG4gICAgdmFyc1xuXG5cbiAgIyBub3QgY3VycmVudGx5IGltcGxlbWVudGVkIGJ1dCB3b3JraW5nXG4gIEByZXNpemVTY3JvbGxQYW5lOiAtPlxuICAgICQoXCIuc2Nyb2xsX3BhbmVcIikuaGVpZ2h0KCAkKHdpbmRvdykuaGVpZ2h0KCkgLSAoICQoXCIjbmF2aWdhdGlvblwiKS5oZWlnaHQoKSArICQoXCIjZm9vdGVyXCIpLmhlaWdodCgpICsgMTAwKSApXG5cbiAgIyBhc2tzIHVzZXIgaWYgdGhleSB3YW50IHRvIGxvZ291dFxuICBAYXNrVG9Mb2dvdXQ6IC0+IFRhbmdlcmluZS51c2VyLmxvZ291dCgpIGlmIGNvbmZpcm0oXCJXb3VsZCB5b3UgbGlrZSB0byBsb2dvdXQgbm93P1wiKVxuXG4gIEB1cGRhdGVGcm9tU2VydmVyOiAobW9kZWwpIC0+XG5cbiAgICBkS2V5ID0gbW9kZWwuaWQuc3Vic3RyKC01LCA1KVxuXG4gICAgQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgbG9va3VwXCJcblxuICAgIHNvdXJjZURCID0gVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwiZ3JvdXBcIilcbiAgICB0YXJnZXREQiA9IFRhbmdlcmluZS5jb25mLmRiX25hbWVcblxuICAgIHNvdXJjZURLZXkgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpXG5cbiAgICAjIyNcbiAgICBHZXRzIGEgbGlzdCBvZiBkb2N1bWVudHMgb24gYm90aCB0aGUgc2VydmVyIGFuZCBsb2NhbGx5LiBUaGVuIHJlcGxpY2F0ZXMgYWxsIGJ5IGlkLlxuICAgICMjI1xuXG4gICAgJC5hamF4XG4gICAgICB1cmw6IHNvdXJjZURLZXksXG4gICAgICB0eXBlOiBcIlBPU1RcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShrZXlzOmRLZXkpXG4gICAgICBlcnJvcjogKGEsIGIpIC0+IG1vZGVsLnRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgZXJyb3JcIiwgXCIje2F9ICN7Yn1cIlxuICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgIGRvY0xpc3QgPSBkYXRhLnJvd3MucmVkdWNlICgob2JqLCBjdXIpIC0+IG9ialtjdXIuaWRdID0gdHJ1ZSksIHt9XG5cbiAgICAgICAgVGFuZ2VyaW5lLmRiLnF1ZXJ5KFwiI3tUYW5nZXJpbmUuY29uZi5kZXNpZ25fZG9jfS9ieURLZXlcIixcbiAgICAgICAgICBrZXk6IGRLZXlcbiAgICAgICAgKS50aGVuIChyZXNwb25zZSkgLT5cbiAgICAgICAgICBjb25zb2xlLndhcm4gcmVzcG9uc2UgdW5sZXNzIHJlc3BvbnNlLnJvd3M/XG4gICAgICAgICAgZG9jTGlzdCA9IGRhdGEucm93cy5yZWR1Y2UgKChvYmosIGN1cikgLT4gb2JqW2N1ci5pZF0gPSB0cnVlKSwgZG9jTGlzdFxuICAgICAgICAgIGRvY0xpc3QgPSBPYmplY3Qua2V5cyhkb2NMaXN0KVxuICAgICAgICAgICQuY291Y2gucmVwbGljYXRlKFxuICAgICAgICAgICAgc291cmNlREIsXG4gICAgICAgICAgICB0YXJnZXREQiwge1xuICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgbW9kZWwudHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBzdWNjZXNzXCIsIHJlc3BvbnNlXG4gICAgICAgICAgICAgIGVycm9yOiAoYSwgYikgICAgICAtPiBtb2RlbC50cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGRvY19pZHM6IGRvY0xpc3RcbiAgICAgICAgICApXG5cbiAgQGxvYWREZXZlbG9wbWVudFBhY2tzOiAoY2FsbGJhY2spIC0+XG4gICAgJC5hamF4XG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIHVybDogXCJwYWNrcy5qc29uXCJcbiAgICAgIGVycm9yOiAocmVzKSAtPlxuICAgICAgICBjYWxsYmFjayhyZXMpXG4gICAgICBzdWNjZXNzOiAocmVzKSAtPlxuICAgICAgICBUYW5nZXJpbmUuZGIuYnVsa0RvY3MgcmVzLCAoZXJyb3IsIGRvYykgLT5cbiAgICAgICAgICBpZiBlcnJvciB0aGVuIGNhbGxiYWNrKGVycm9yKSBlbHNlIGNhbGxiYWNrKClcblxuXG5cblxuIyBSb2JiZXJ0IGludGVyZmFjZVxuY2xhc3MgUm9iYmVydFxuXG4gIEByZXF1ZXN0OiAob3B0aW9ucykgLT5cblxuICAgIHN1Y2Nlc3MgPSBvcHRpb25zLnN1Y2Nlc3NcbiAgICBlcnJvciAgID0gb3B0aW9ucy5lcnJvclxuXG4gICAgZGVsZXRlIG9wdGlvbnMuc3VjY2Vzc1xuICAgIGRlbGV0ZSBvcHRpb25zLmVycm9yXG5cbiAgICAkLmFqYXhcbiAgICAgIHR5cGUgICAgICAgIDogXCJQT1NUXCJcbiAgICAgIGNyb3NzRG9tYWluIDogdHJ1ZVxuICAgICAgdXJsICAgICAgICAgOiBUYW5nZXJpbmUuY29uZmlnLmdldChcInJvYmJlcnRcIilcbiAgICAgIGRhdGFUeXBlICAgIDogXCJqc29uXCJcbiAgICAgIGRhdGEgICAgICAgIDogb3B0aW9uc1xuICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgc3VjY2VzcyBkYXRhXG4gICAgICBlcnJvcjogKCBkYXRhICkgPT5cbiAgICAgICAgZXJyb3IgZGF0YVxuXG4jIFRyZWUgaW50ZXJmYWNlXG5jbGFzcyBUYW5nZXJpbmVUcmVlXG5cbiAgQG1ha2U6IChvcHRpb25zKSAtPlxuXG4gICAgVXRpbHMud29ya2luZyB0cnVlXG4gICAgc3VjY2VzcyA9IG9wdGlvbnMuc3VjY2Vzc1xuICAgIGVycm9yICAgPSBvcHRpb25zLmVycm9yXG5cbiAgICBkZWxldGUgb3B0aW9ucy5zdWNjZXNzXG4gICAgZGVsZXRlIG9wdGlvbnMuZXJyb3JcblxuICAgIG9wdGlvbnMudXNlciA9IFRhbmdlcmluZS51c2VyLm5hbWUoKVxuXG4gICAgJC5hamF4XG4gICAgICB0eXBlICAgICA6IFwiUE9TVFwiXG4gICAgICBjcm9zc0RvbWFpbiA6IHRydWVcbiAgICAgIHVybCAgICAgIDogVGFuZ2VyaW5lLmNvbmZpZy5nZXQoXCJ0cmVlXCIpICsgXCJtYWtlLyN7VGFuZ2VyaW5lLnNldHRpbmdzLmdldCgnZ3JvdXBOYW1lJyl9XCJcbiAgICAgIGRhdGFUeXBlIDogXCJqc29uXCJcbiAgICAgIGRhdGEgICAgIDogb3B0aW9uc1xuICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgc3VjY2VzcyBkYXRhXG4gICAgICBlcnJvcjogKCBkYXRhICkgPT5cbiAgICAgICAgZXJyb3IgZGF0YSwgSlNPTi5wYXJzZShkYXRhLnJlc3BvbnNlVGV4dClcbiAgICAgIGNvbXBsZXRlOiAtPlxuICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG5cblxuXG4jI1VJIGhlbHBlcnNcbiQgLT5cbiAgIyAjIyMuY2xlYXJfbWVzc2FnZVxuICAjIFRoaXMgbGl0dGxlIGd1eSB3aWxsIGZhZGUgb3V0IGFuZCBjbGVhciBoaW0gYW5kIGhpcyBwYXJlbnRzLiBXcmFwIGhpbSB3aXNlbHkuXG4gICMgYDxzcGFuPiBteSBtZXNzYWdlIDxidXR0b24gY2xhc3M9XCJjbGVhcl9tZXNzYWdlXCI+WDwvYnV0dG9uPmBcbiAgJChcIiNjb250ZW50XCIpLm9uKFwiY2xpY2tcIiwgXCIuY2xlYXJfbWVzc2FnZVwiLCAgbnVsbCwgKGEpIC0+ICQoYS50YXJnZXQpLnBhcmVudCgpLmZhZGVPdXQoMjUwLCAtPiAkKHRoaXMpLmVtcHR5KCkuc2hvdygpICkgKVxuICAkKFwiI2NvbnRlbnRcIikub24oXCJjbGlja1wiLCBcIi5wYXJlbnRfcmVtb3ZlXCIsIG51bGwsIChhKSAtPiAkKGEudGFyZ2V0KS5wYXJlbnQoKS5mYWRlT3V0KDI1MCwgLT4gJCh0aGlzKS5yZW1vdmUoKSApIClcblxuICAjIGRpc3Bvc2FibGUgYWxlcnRzID0gYSBub24tZmFuY3kgYm94XG4gICQoXCIjY29udGVudFwiKS5vbiBcImNsaWNrXCIsXCIuYWxlcnRfYnV0dG9uXCIsIC0+XG4gICAgYWxlcnRfdGV4dCA9IGlmICQodGhpcykuYXR0cihcImRhdGEtYWxlcnRcIikgdGhlbiAkKHRoaXMpLmF0dHIoXCJkYXRhLWFsZXJ0XCIpIGVsc2UgJCh0aGlzKS52YWwoKVxuICAgIFV0aWxzLmRpc3Bvc2FibGVBbGVydCBhbGVydF90ZXh0XG4gICQoXCIjY29udGVudFwiKS5vbiBcImNsaWNrXCIsIFwiLmRpc3Bvc2FibGVfYWxlcnRcIiwgLT5cbiAgICAkKHRoaXMpLnN0b3AoKS5mYWRlT3V0IDEwMCwgLT5cbiAgICAgICQodGhpcykucmVtb3ZlKClcblxuICAjICQod2luZG93KS5yZXNpemUgVXRpbHMucmVzaXplU2Nyb2xsUGFuZVxuICAjIFV0aWxzLnJlc2l6ZVNjcm9sbFBhbmUoKVxuXG4jIEhhbmRsZWJhcnMgcGFydGlhbHNcbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2dyaWRMYWJlbCcsIChpdGVtcyxpdGVtTWFwLGluZGV4KSAtPlxuIyAgXy5lc2NhcGUoaXRlbXNbaXRlbU1hcFtkb25lXV0pXG4gIF8uZXNjYXBlKGl0ZW1zW2l0ZW1NYXBbaW5kZXhdXSlcbilcbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3N0YXJ0Um93JywgKGluZGV4KSAtPlxuICBjb25zb2xlLmxvZyhcImluZGV4OiBcIiArIGluZGV4KVxuICBpZiBpbmRleCA9PSAwXG4gICAgXCI8dHI+XCJcbilcbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2VuZFJvdycsIChpbmRleCkgLT5cbiAgY29uc29sZS5sb2coXCJpbmRleDogXCIgKyBpbmRleClcbiAgaWYgaW5kZXggPT0gMFxuICAgIFwiPC90cj5cIlxuKVxuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdzdGFydENlbGwnLCAoaW5kZXgpIC0+XG4gIGNvbnNvbGUubG9nKFwiaW5kZXg6IFwiICsgaW5kZXgpXG4gIGlmIGluZGV4ID09IDBcbiAgICBcIjx0ZD48L3RkPlwiXG4pXG5cbiMvKlxuIyAgICogVXNlIHRoaXMgdG8gdHVybiBvbiBsb2dnaW5nOlxuIyAgICovXG5IYW5kbGViYXJzLmxvZ2dlci5sb2cgPSAobGV2ZWwpLT5cbiAgaWYgIGxldmVsID49IEhhbmRsZWJhcnMubG9nZ2VyLmxldmVsXG4gICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgW10uY29uY2F0KFtcIkhhbmRsZWJhcnM6IFwiXSwgXy50b0FycmF5KGFyZ3VtZW50cykpKVxuXG4jIy8vIERFQlVHOiAwLCBJTkZPOiAxLCBXQVJOOiAyLCBFUlJPUjogMyxcbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIEhhbmRsZWJhcnMubG9nZ2VyLmxvZyk7XG4jIy8vIFN0ZCBsZXZlbCBpcyAzLCB3aGVuIHNldCB0byAwLCBoYW5kbGViYXJzIHdpbGwgbG9nIGFsbCBjb21waWxhdGlvbiByZXN1bHRzXG5IYW5kbGViYXJzLmxvZ2dlci5sZXZlbCA9IDM7XG5cbiMvKlxuIyAgICogTG9nIGNhbiBhbHNvIGJlIHVzZWQgaW4gdGVtcGxhdGVzOiAne3tsb2cgMCB0aGlzIFwibXlTdHJpbmdcIiBhY2NvdW50TmFtZX19J1xuIyAgICogTG9ncyBhbGwgdGhlIHBhc3NlZCBkYXRhIHdoZW4gbG9nZ2VyLmxldmVsID0gMFxuIyAgICovXG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoXCJkZWJ1Z1wiLCAob3B0aW9uYWxWYWx1ZSktPlxuICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgQ29udGV4dFwiKVxuICBjb25zb2xlLmxvZyhcIj09PT09PT09PT09PT09PT09PT09XCIpXG4gIGNvbnNvbGUubG9nKHRoaXMpXG5cbiAgaWYgb3B0aW9uYWxWYWx1ZVxuICAgIGNvbnNvbGUubG9nKFwiVmFsdWVcIilcbiAgICBjb25zb2xlLmxvZyhcIj09PT09PT09PT09PT09PT09PT09XCIpXG4gICAgY29uc29sZS5sb2cob3B0aW9uYWxWYWx1ZSlcbilcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbW9udGhEcm9wZG93bicsIChtb250aHMsIGN1cnJlbnRNb250aCktPlxuICByZW5kZXJPcHRpb24gPSAobW9udGgsIGN1cnJlbnRNb250aCktPlxuICAgIG91dCA9IFwiPG9wdGlvbiB2YWx1ZT0nXCIgKyBtb250aCArIFwiJ1wiXG4gICAgaWYgbW9udGggPT0gY3VycmVudE1vbnRoXG4gICAgICBvdXQgPSBvdXQgKyBcInNlbGVjdGVkPSdzZWxlY3RlZCdcIlxuICAgIG91dCA9IG91dCArICBcIj5cIiArIG1vbnRoLnRpdGxlaXplKCkgKyBcIjwvb3B0aW9uPlwiXG4gICAgcmV0dXJuIG91dFxuICByZW5kZXJPcHRpb24obW9udGgsIGN1cnJlbnRNb250aCkgZm9yIG1vbnRoIGluIG1vbnRoc1xuKVxuIl19

var Robbert, TangerineTree, Utils, i, km, sks;

Backbone.View.prototype.close = function() {
  this.remove();
  this.unbind();
  return typeof this.onClose === "function" ? this.onClose() : void 0;
};

Backbone.Collection.prototype.indexBy = function(attr) {
  var key, oneModel, result, _i, _len, _ref;
  result = {};
  _ref = this.models;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    oneModel = _ref[_i];
    if (oneModel.has(attr)) {
      key = oneModel.get(attr);
      if (!(result[key] != null)) result[key] = [];
      result[key].push(oneModel);
    }
  }
  return result;
};

Backbone.Collection.prototype.indexArrayBy = function(attr) {
  var key, oneModel, result, _i, _len, _ref;
  result = [];
  _ref = this.models;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    oneModel = _ref[_i];
    if (oneModel.has(attr)) {
      key = oneModel.get(attr);
      if (!(result[key] != null)) result[key] = [];
      result[key].push(oneModel);
    }
  }
  return result;
};

Backbone.Model.prototype.toHash = function() {
  var key, significantAttributes, value, _ref;
  significantAttributes = {};
  _ref = this.attributes;
  for (key in _ref) {
    value = _ref[key];
    if (!~['_rev', '_id', 'hash', 'updated'].indexOf(key)) {
      significantAttributes[key] = value;
    }
  }
  return b64_sha1(JSON.stringify(significantAttributes));
};

Backbone.Model.prototype.beforeSave = function() {
  this.set("updated", (new Date()).toString());
  return this.set("hash", this.toHash());
};

Backbone.Model.prototype.getNumber = function(key) {
  if (this.has(key)) {
    return parseInt(this.get(key));
  } else {
    return 0;
  }
};

Backbone.Model.prototype.getArray = function(key) {
  if (this.has(key)) {
    return this.get(key);
  } else {
    return [];
  }
};

Backbone.Model.prototype.getString = function(key) {
  if (this.has(key)) {
    return this.get(key);
  } else {
    return "";
  }
};

Backbone.Model.prototype.getEscapedString = function(key) {
  if (this.has(key)) {
    return this.escape(key);
  } else {
    return "";
  }
};

Backbone.Model.prototype.getBoolean = function(key) {
  if (this.has(key)) return this.get(key) === true || this.get(key) === 'true';
};

(function($) {
  $.fn.scrollTo = function(speed, callback) {
    if (speed == null) speed = 250;
    try {
      $('html, body').animate({
        scrollTop: $(this).offset().top + 'px'
      }, speed, null, callback);
    } catch (e) {
      console.log(e);
      console.log("Scroll error with 'this'");
      console.log(this);
    }
    return this;
  };
  $.fn.topCenter = function() {
    this.css("position", "absolute");
    this.css("top", $(window).scrollTop() + "px");
    return this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
  };
  $.fn.middleCenter = function() {
    this.css("position", "absolute");
    this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
    return this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
  };
  $.fn.widthPercentage = function() {
    return Math.round(100 * this.outerWidth() / this.offsetParent().width()) + '%';
  };
  $.fn.heightPercentage = function() {
    return Math.round(100 * this.outerHeight() / this.offsetParent().height()) + '%';
  };
  return $.fn.getStyleObject = function() {
    var camel, camelize, dom, prop, returns, style, val, _i, _j, _len, _len2;
    dom = this.get(0);
    returns = {};
    if (window.getComputedStyle) {
      camelize = function(a, b) {
        return b.toUpperCase();
      };
      style = window.getComputedStyle(dom, null);
      for (_i = 0, _len = style.length; _i < _len; _i++) {
        prop = style[_i];
        camel = prop.replace(/\-([a-z])/g, camelize);
        val = style.getPropertyValue(prop);
        returns[camel] = val;
      }
      return returns;
    }
    if (dom.currentStyle) {
      style = dom.currentStyle;
      for (_j = 0, _len2 = style.length; _j < _len2; _j++) {
        prop = style[_j];
        returns[prop] = style[prop];
      }
      return returns;
    }
    return this.css();
  };
})(jQuery);

$.ajaxSetup({
  statusCode: {
    404: function(xhr, status, message) {
      var code, seeUnauthorized, statusText;
      code = xhr.status;
      statusText = xhr.statusText;
      seeUnauthorized = ~xhr.responseText.indexOf("unauthorized");
      if (seeUnauthorized) {
        Utils.midAlert("Session closed<br>Please log in and try again.");
        return Tangerine.user.logout();
      }
    }
  }
});

km = {
  "0": 48,
  "1": 49,
  "2": 50,
  "3": 51,
  "4": 52,
  "5": 53,
  "6": 54,
  "7": 55,
  "8": 56,
  "9": 57,
  "a": 65,
  "b": 66,
  "c": 67,
  "d": 68,
  "e": 69,
  "f": 70,
  "g": 71,
  "h": 72,
  "i": 73,
  "j": 74,
  "k": 75,
  "l": 76,
  "m": 77,
  "n": 78,
  "o": 79,
  "p": 80,
  "q": 81,
  "r": 82,
  "s": 83,
  "t": 84,
  "u": 85,
  "v": 86,
  "w": 87,
  "x": 88,
  "y": 89,
  "z": 90
};

sks = [
  {
    q: (function() {
      var _results;
      _results = [];
      for (i = 0; i <= 6; i++) {
        _results.push(km["0100ser"[i]]);
      }
      return _results;
    })(),
    i: 0,
    c: function() {
      return Tangerine.settings.save({
        "context": "server"
      }, {
        success: function() {
          return Tangerine.router.navigate("", true);
        }
      });
    }
  }, {
    q: (function() {
      var _results;
      _results = [];
      for (i = 0; i <= 6; i++) {
        _results.push(km["0100mob"[i]]);
      }
      return _results;
    })(),
    i: 0,
    c: function() {
      return Tangerine.settings.save({
        "context": "mobile"
      }, {
        success: function() {
          return Tangerine.router.navigate("", true);
        }
      });
    }
  }, {
    q: (function() {
      var _results;
      _results = [];
      for (i = 0; i <= 6; i++) {
        _results.push(km["0100cla"[i]]);
      }
      return _results;
    })(),
    i: 0,
    c: function() {
      return Tangerine.settings.save({
        "context": "class"
      }, {
        success: function() {
          return Tangerine.router.navigate("", true);
        }
      });
    }
  }
];

$(document).keydown(function(e) {
  var j, sk, _len, _results;
  _results = [];
  for (j = 0, _len = sks.length; j < _len; j++) {
    sk = sks[j];
    _results.push(e.keyCode === sks[j].q[sks[j].i++] ? sks[j].i === sks[j].q.length ? sks[j]['c']() : void 0 : sks[j].i = 0);
  }
  return _results;
});

String.prototype.safetyDance = function() {
  return this.replace(/\s/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
};

String.prototype.databaseSafetyDance = function() {
  return this.replace(/\s/g, "_").replace(/[^a-z0-9_-]/g, "");
};

Math.ave = function() {
  var result, x, _i, _len;
  result = 0;
  for (_i = 0, _len = arguments.length; _i < _len; _i++) {
    x = arguments[_i];
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
  num = num + (num < (0 != null) - {
    0.5: +0.5
  }) >> 0;
  return num /= m;
};

Math.commas = function(num) {
  return parseInt(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

Math.limit = function(min, num, max) {
  return Math.max(min, Math.min(num, max));
};

Utils = (function() {

  function Utils() {}

  Utils.onUpdateSuccess = function() {
    Utils.midAlert("Update successful");
    return _.delay(function() {
      Tangerine.router.navigate("", false);
      Utils.askToLogout();
      return document.location.reload();
    }, 2000);
  };

  Utils.updateTangerine = function(callbacks) {
    if (Tangerine.settings.get("context") === "mobile") {
      $("#version-uuid").html("Updating...");
      return Tangerine.$db.compact({
        success: function() {
          return Tangerine.$db.openDoc("_design/tangerine", {
            success: function(oldDoc) {
              return $.couch.replicate(Tangerine.settings.urlDB("update"), Tangerine.settings.location.update.target, {
                success: function() {
                  return Tangerine.$db.openDoc("_design/tangerine", {
                    conflicts: true,
                    success: function(data) {
                      if (data._conflicts != null) {
                        return Tangerine.$db.removeDoc(oldDoc, {
                          success: function() {
                            return Utils.onUpdateSuccess();
                          },
                          error: function(error) {
                            return Utils.midAlert("Update failed resolving conflict<br>" + error);
                          }
                        });
                      } else {
                        return Utils.onUpdateSuccess();
                      }
                    }
                  });
                },
                error: function(error) {
                  return Utils.midAlert("Update failed replicating<br>" + error);
                }
              }, {
                doc_ids: ["_design/tangerine"]
              });
            },
            error: function(error) {
              return Utils.midAlert("Update failed openning database<br>" + error);
            }
          });
        }
      });
    }
  };

  Utils.log = function(self, error) {
    var className;
    className = self.constructor.toString().match(/function\s*(\w+)/)[1];
    return console.log("" + className + ": " + error);
  };

  Utils.working = function(isWorking) {
    var timer;
    if (isWorking) {
      if (!(Tangerine.loadingTimers != null)) Tangerine.loadingTimers = [];
      return Tangerine.loadingTimers.push(setTimeout(Utils.showLoadingIndicator, 3000));
    } else {
      if (Tangerine.loadingTimers != null) {
        while (timer = Tangerine.loadingTimers.pop()) {
          clearTimeout(timer);
        }
      }
      return $(".loading_bar").remove();
    }
  };

  Utils.showLoadingIndicator = function() {
    return $("<div class='loading_bar'><img class='loading' src='images/loading.gif'></div>").appendTo("body").middleCenter();
  };

  Utils.confirm = function(message, options) {
    var _ref;
    if (((_ref = navigator.notification) != null ? _ref.confirm : void 0) != null) {
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

  Utils.topAlert = function(alert_text, delay) {
    if (delay == null) delay = 2000;
    return $("<div class='disposable_alert'>" + alert_text + "</div>").appendTo("#content").topCenter().delay(delay).fadeOut(250, function() {
      return $(this).remove();
    });
  };

  Utils.midAlert = function(alert_text, delay) {
    if (delay == null) delay = 2000;
    return $("<div class='disposable_alert'>" + alert_text + "</div>").appendTo("#content").middleCenter().delay(delay).fadeOut(250, function() {
      return $(this).remove();
    });
  };

  Utils.sticky = function(html) {
    return $("<div class='sticky_alert'>" + html + "<br><button class='command parent_remove'>close</button></div>").appendTo("#content").middleCenter().on("keyup", function(event) {
      if (event.which === 27) return $(this).remove();
    });
  };

  Utils.passwordPrompt = function(callback) {
    var $button, $pass, d, html;
    html = "      <div id='pass_form' title='User verification'>        <label for='password'>Please re-enter your password</label>        <input id='pass_val' type='password' name='password' id='password' value=''>        <button class='command' >Verify</button>        <button class='command' data-cancel='true'>Cancel</button>      </div>    ";
    d = $.modal(html);
    $pass = $("#pass_val");
    $button = $("#pass_form button");
    $pass.on("change", function(event) {
      $button.off("click");
      $pass.off("change");
      callback($pass.val());
      return $.modal.close();
    });
    return $button.on("click", function(event) {
      $button.off("click");
      $pass.off("change");
      if ($(event.target).attr("data-cancel") === "true") {
        $.modal.close();
        return;
      }
      callback($pass.val());
      return $.modal.close();
    });
  };

  Utils.guid = function() {
    return this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4();
  };

  Utils.S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  Utils.flash = function(color) {
    if (color == null) color = "red";
    $("body").css({
      "backgroundColor": color
    });
    return setTimeout(function() {
      return $("body").css({
        "backgroundColor": "white"
      });
    }, 1000);
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
    if (confirm("Would you like to logout now?")) return Tangerine.user.logout();
  };

  Utils.oldConsoleLog = null;

  Utils.enableConsoleLog = function() {
    if (typeof oldConsoleLog === "undefined" || oldConsoleLog === null) return;
    return window.console.log = oldConsoleLog;
  };

  Utils.disableConsoleLog = function() {
    var oldConsoleLog;
    oldConsoleLog = console.log;
    return window.console.log = $.noop;
  };

  Utils.oldConsoleAssert = null;

  Utils.enableConsoleAssert = function() {
    if (typeof oldConsoleAssert === "undefined" || oldConsoleAssert === null) {
      return;
    }
    return window.console.assert = oldConsoleAssert;
  };

  Utils.disableConsoleAssert = function() {
    var oldConsoleAssert;
    oldConsoleAssert = console.assert;
    return window.console.assert = $.noop;
  };

  return Utils;

})();

Robbert = (function() {

  function Robbert() {}

  Robbert.request = function(options) {
    var error, success,
      _this = this;
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
      success: function(data) {
        return success(data);
      },
      error: function(data) {
        return error(data);
      }
    });
  };

  return Robbert;

})();

TangerineTree = (function() {

  function TangerineTree() {}

  TangerineTree.make = function(options) {
    var error, success,
      _this = this;
    success = options.success;
    error = options.error;
    delete options.success;
    delete options.error;
    options.user = Tangerine.user.name;
    return $.ajax({
      type: "POST",
      crossDomain: true,
      url: Tangerine.config.get("tree") + ("make/" + (Tangerine.settings.get('groupName').split('group-')[1])),
      dataType: "json",
      data: options,
      success: function(data) {
        return success(data);
      },
      error: function(data) {
        return error(data);
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

var Utils, i, km, sks;

Backbone.View.prototype.close = function() {
  this.remove();
  this.unbind();
  return typeof this.onClose === "function" ? this.onClose() : void 0;
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
  return $.fn.middleCenter = function() {
    this.css("position", "absolute");
    this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
    return this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
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
      var settings;
      settings = new Settings({
        "_id": "TangerineSettings"
      });
      return settings.fetch({
        success: function(settings) {
          settings.set({
            "context": "server"
          });
          settings.save();
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
      var settings;
      settings = new Settings({
        "_id": "TangerineSettings"
      });
      return settings.fetch({
        success: function(settings) {
          settings.set({
            "context": "mobile"
          });
          settings.save();
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
      var settings;
      settings = new Settings({
        "_id": "TangerineSettings"
      });
      return settings.fetch({
        success: function(settings) {
          settings.set({
            "context": "class"
          });
          settings.save();
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

Utils = (function() {

  function Utils() {}

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
    $(selector).find("input, textarea").each(function(index, element) {
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

  Utils.topAlert = function(alert_text) {
    return $("<div class='disposable_alert'>" + alert_text + "</div>").appendTo("#content").topCenter().delay(2000).fadeOut(250, function() {
      return $(this).remove();
    });
  };

  Utils.midAlert = function(alert_text) {
    return $("<div class='disposable_alert'>" + alert_text + "</div>").appendTo("#content").middleCenter().delay(2000).fadeOut(250, function() {
      return $(this).remove();
    });
  };

  Utils.S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  Utils.guid = function() {
    return this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4();
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

  return Utils;

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

var PrototypeGridView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

PrototypeGridView = (function(_super) {

  __extends(PrototypeGridView, _super);

  function PrototypeGridView() {
    this.updateMode = __bind(this.updateMode, this);
    this.updateCountdown = __bind(this.updateCountdown, this);
    this.removeUndo = __bind(this.removeUndo, this);
    this.lastHandler = __bind(this.lastHandler, this);
    this.markHandler = __bind(this.markHandler, this);
    PrototypeGridView.__super__.constructor.apply(this, arguments);
  }

  PrototypeGridView.prototype.className = "grid_prototype";

  PrototypeGridView.prototype.events = Tangerine.context.kindle ? {
    'touchstart .grid_element': 'gridClick',
    'click .grid_mode input': 'updateMode',
    'click .start_time': 'startTimer',
    'click .stop_time': 'stopTimer'
  } : {
    'click .grid_element': 'gridClick',
    'click .grid_mode input': 'updateMode',
    'click .start_time': 'startTimer',
    'click .stop_time': 'stopTimer'
  };

  PrototypeGridView.prototype.gridClick = function(event) {
    return this.modeHandlers[this.mode](event);
  };

  PrototypeGridView.prototype.markHandler = function(event) {
    var $target, autoCount, i, index, _ref;
    $target = $(event.target);
    if (this.lastAttempted !== 0 && $target.attr('data-index') > this.lastAttempted) {
      return;
    }
    $target.toggleClass("element_wrong");
    index = $target.attr('data-index');
    this.markRecord.push(index);
    this.gridOutput[index - 1] = this.gridOutput[index - 1] === "correct" ? "incorrect" : "correct";
    console.log(this.autostop);
    if (this.autostop !== 0) {
      autoCount = 0;
      for (i = 0, _ref = this.autostop - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        if (this.gridOutput[i] === "correct") break;
        autoCount++;
      }
      if (this.autostopped === false) {
        if (autoCount === this.autostop) this.autostopTest();
      }
      if (this.autostopped === true && autoCount < this.autostop && this.undoable === true) {
        this.unAutostopTest();
      }
      console.log("\nchecking undoability");
      console.log(this.autostopped === true);
      console.log(autoCount < this.autostop);
      return console.log(this.undoable === true);
    }
  };

  PrototypeGridView.prototype.lastHandler = function(event) {
    var $target, index;
    $target = $(event.target);
    index = $target.attr('data-index');
    if (index - 1 >= this.gridOutput.lastIndexOf("incorrect")) {
      this.$el.find("table.grid .element_last").removeClass("element_last");
      $target.addClass("element_last");
      return this.lastAttempted = index;
    }
  };

  PrototypeGridView.prototype.startTimer = function() {
    this.updateMode(null, "mark");
    this.interval = setInterval(this.updateCountdown, 1000);
    this.startTime = this.getTime();
    this.timeRunning = true;
    this.$el.find("table.disabled").removeClass("disabled");
    return this.updateCountdown();
  };

  PrototypeGridView.prototype.stopTimer = function(event, message) {
    if (message == null) message = false;
    if (this.timeRunning === true) {
      clearInterval(this.interval);
      this.stopTime = this.getTime();
      this.timeRunning = false;
      this.updateCountdown();
      this.updateMode(null, "last");
      if (message) {
        return Utils.topAlert(message);
      } else {
        return Utils.topAlert("Please mark <br>last item attempted");
      }
    }
  };

  PrototypeGridView.prototype.autostopTest = function() {
    clearInterval(this.interval);
    this.stopTime = this.getTime();
    this.autostopped = true;
    this.timeRunning = false;
    this.$el.find(".grid_element").slice(this.autostop - 1, this.autostop).addClass("element_last");
    this.lastAttempted = this.autostop;
    this.timeout = setTimeout(this.removeUndo, 7000);
    return Utils.topAlert("Autostop activated. Discontinue test.");
  };

  PrototypeGridView.prototype.removeUndo = function() {
    this.undoable = false;
    return clearTimeout(this.timeout);
  };

  PrototypeGridView.prototype.unAutostopTest = function() {
    this.interval = setInterval(this.updateCountdown, 1000);
    this.updateCountdown();
    this.autostopped = false;
    this.lastAttempted = 0;
    this.$el.find(".grid_element").slice(this.autostop - 1, this.autostop).removeClass("element_last");
    this.timeRunning = false;
    this.updateMode(null, "mark");
    return Utils.topAlert("Autostop removed. Continue.");
  };

  PrototypeGridView.prototype.updateCountdown = function() {
    this.elapsedTime = this.getTime() - this.startTime;
    this.timeRemaining = this.timer - this.elapsedTime;
    this.$el.find(".timer").html(this.timeRemaining);
    if (this.timeRemaining === 0 && this.timeRunning === true) {
      return this.stopTimer(null, "Time<br><br>Please mark<br>last item attempted");
    }
  };

  PrototypeGridView.prototype.getTime = function() {
    return Math.round((new Date()).getTime() / 1000);
  };

  PrototypeGridView.prototype.updateMode = function(event, mode) {
    if (mode != null) {
      this.mode = mode;
      this.$el.find("#grid_mode :radio[value=" + mode + "]").attr("checked", "checked");
      this.$el.find("#grid_mode").buttonset("refresh").click(this.updateMode);
      return;
    }
    return this.mode = $(event.target).val();
  };

  PrototypeGridView.prototype.initialize = function(options) {
    var i, item, _len, _ref;
    this.markRecord = [];
    this.modeHandlers = {
      mark: this.markHandler,
      last: this.lastHandler,
      disabled: $.noop
    };
    this.model = this.options.model;
    this.parent = this.options.parent;
    this.startTime = 0;
    this.stopTime = 0;
    this.timeElapsed = 0;
    this.lastAttempted = 0;
    this.interval = null;
    this.undoable = true;
    this.timer = this.model.get("timer") || 0;
    this.items = _.compact(this.model.get("items"));
    this.mode = "disabled";
    this.gridOutput = [];
    _ref = this.items;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      item = _ref[i];
      this.gridOutput[i] = 'correct';
    }
    this.columns = this.model.get("columns") || 0;
    this.autostop = parseInt(this.model.get("autostop")) || 0;
    this.autostopped = false;
    return this.gridElement = _.template("<td><div data-label='{{label}}' data-index='{{i}}' class='grid_element'>{{label}}</div></td>");
  };

  PrototypeGridView.prototype.render = function() {
    var done, html, i, _ref;
    done = 0;
    html = "        <div class='timer_wrapper'><button class='start_time time'>Start</button><div class='timer'>" + this.timer + "</div></div>    <table class='grid disabled'>";
    while (true) {
      if (done > this.items.length) break;
      html += "<tr>";
      for (i = 1, _ref = this.columns; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
        if (done < this.items.length) {
          html += this.gridElement({
            label: this.items[done],
            i: done + 1
          });
        }
        done++;
      }
      html += "</tr>";
    }
    html += "</table>        <div class='timer_wrapper'><button class='stop_time time'>Stop</button><div class='timer'>" + this.timer + "</div></div>        <div id='grid_mode' class='question clearfix'>      <label>Input mode</label>      <label for='mark'>Mark</label>      <input name='grid_mode' id='mark' type='radio' value='mark' checked='checked'>      <label for='last_attempted'>Last attempted</label>      <input name='grid_mode' id='last_attempted' type='radio' value='last'>    </div>    ";
    this.$el.html(html);
    this.$el.find("#grid_mode").buttonset();
    return this.trigger("rendered");
  };

  PrototypeGridView.prototype.isValid = function() {
    if (this.lastAttempted === 0) return false;
    if (this.timeRunning === true) return false;
    return true;
  };

  PrototypeGridView.prototype.showErrors = function() {
    if (this.lastAttempted === 0) {
      Utils.midAlert("Please select<br>last item attempted.");
    }
    if (this.timeRuning === true) return Utils.midAlert("Time still running.");
  };

  PrototypeGridView.prototype.getResult = function() {
    var i, item, letterResults, result, _len, _ref;
    letterResults = {};
    _ref = this.items;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      item = _ref[i];
      if (i < this.lastAttempted) {
        letterResults[item] = this.gridOutput[i];
      } else {
        letterResults[item] = "missing";
      }
    }
    return result = {
      "autostopped": this.autostopped,
      "last_attempted": this.lastAttempted,
      "letters_results": letterResults,
      "time_remaining": this.timeRemaining,
      "time_elapsed": this.timeElapsed,
      "mark_record": this.markRecord
    };
  };

  PrototypeGridView.prototype.onClose = function() {
    return clearInterval(this.interval);
  };

  PrototypeGridView.prototype.getSum = function() {
    var counts, i, _i, _len, _ref;
    counts = {
      correct: 0,
      incorrect: 0,
      missing: this.items.length - this.lastAttempted,
      total: this.items.length
    };
    _ref = this.gridOutput;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      if (i === "correct") counts['correct'] += 1;
      if (i === "incorrect") counts['incorrect'] += 1;
    }
    return {
      correct: counts['correct'],
      incorrect: counts['incorrect'],
      missing: counts['missing'],
      total: counts['total']
    };
  };

  return PrototypeGridView;

})(Backbone.View);

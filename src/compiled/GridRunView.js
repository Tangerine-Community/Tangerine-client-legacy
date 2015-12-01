var GridRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

GridRunView = (function(superClass) {
  extend(GridRunView, superClass);

  function GridRunView() {
    this.updateMode = bind(this.updateMode, this);
    this.updateCountdown = bind(this.updateCountdown, this);
    this.removeUndo = bind(this.removeUndo, this);
    this.lastHandler = bind(this.lastHandler, this);
    this.intermediateItemHandler = bind(this.intermediateItemHandler, this);
    this.markHandler = bind(this.markHandler, this);
    this.gridClick = bind(this.gridClick, this);
    return GridRunView.__super__.constructor.apply(this, arguments);
  }

  GridRunView.prototype.className = "grid_prototype";

  GridRunView.prototype.events = Modernizr.touch ? {
    'click .grid_element': 'gridClick',
    'click .end_of_grid_line': 'endOfGridLineClick',
    'click .start_time': 'startTimer',
    'click .stop_time': 'stopTimer',
    'click .restart': 'restartTimer'
  } : {
    'click .end_of_grid_line': 'endOfGridLineClick',
    'click .grid_element': 'gridClick',
    'click .start_time': 'startTimer',
    'click .stop_time': 'stopTimer',
    'click .restart': 'restartTimer'
  };

  GridRunView.prototype.restartTimer = function() {
    if (this.timeRunning) {
      this.stopTimer({
        simpleStop: true
      });
    }
    this.resetVariables();
    return this.$el.find(".element_wrong").removeClass("element_wrong");
  };

  GridRunView.prototype.gridClick = function(event) {
    var base, name;
    event.preventDefault();
    return typeof (base = this.modeHandlers)[name = this.mode] === "function" ? base[name](event) : void 0;
  };

  GridRunView.prototype.markHandler = function(event) {
    var $target, correctionsDisabled, index, indexIsntBelowLastAttempted, lastAttemptedIsntZero, ref, ref1;
    $target = $(event.target);
    index = $target.attr('data-index');
    indexIsntBelowLastAttempted = parseInt(index) > parseInt(this.lastAttempted);
    lastAttemptedIsntZero = parseInt(this.lastAttempted) !== 0;
    correctionsDisabled = this.dataEntry === false && ((ref = this.parent) != null ? (ref1 = ref.parent) != null ? ref1.enableCorrections : void 0 : void 0) === false;
    if (correctionsDisabled && lastAttemptedIsntZero && indexIsntBelowLastAttempted) {
      return;
    }
    this.markElement(index);
    if (this.autostop !== 0) {
      return this.checkAutostop();
    }
  };

  GridRunView.prototype.intermediateItemHandler = function(event) {
    var $target, index;
    this.timeIntermediateCaptured = this.getTime() - this.startTime;
    $target = $(event.target);
    index = $target.attr('data-index');
    this.itemAtTime = index;
    $target.addClass("element_minute");
    return this.updateMode("mark");
  };

  GridRunView.prototype.checkAutostop = function() {
    var autoCount, i, j, ref;
    if (this.timeRunning) {
      autoCount = 0;
      for (i = j = 0, ref = this.autostop - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        if (this.gridOutput[i] === "correct") {
          break;
        }
        autoCount++;
      }
      if (this.autostopped === false) {
        if (autoCount === this.autostop) {
          this.autostopTest();
        }
      }
      if (this.autostopped === true && autoCount < this.autostop && this.undoable === true) {
        return this.unAutostopTest();
      }
    }
  };

  GridRunView.prototype.markElement = function(index, value, mode) {
    var $target, correctionsDisabled, indexIsntBelowLastAttempted, lastAttemptedIsntZero, ref, ref1, ref2, ref3;
    if (value == null) {
      value = null;
    }
    correctionsDisabled = this.dataEntry === false && (((ref = this.parent) != null ? (ref1 = ref.parent) != null ? ref1.enableCorrections : void 0 : void 0) != null) && ((ref2 = this.parent) != null ? (ref3 = ref2.parent) != null ? ref3.enableCorrections : void 0 : void 0) === false;
    lastAttemptedIsntZero = parseInt(this.lastAttempted) !== 0;
    indexIsntBelowLastAttempted = parseInt(index) > parseInt(this.lastAttempted);
    if (correctionsDisabled && lastAttemptedIsntZero && indexIsntBelowLastAttempted) {
      return;
    }
    $target = this.$el.find(".grid_element[data-index=" + index + "]");
    if (mode !== 'populate') {
      this.markRecord.push(index);
    }
    if (!this.autostopped) {
      if (value === null) {
        this.gridOutput[index - 1] = this.gridOutput[index - 1] === "correct" ? "incorrect" : "correct";
        return $target.toggleClass("element_wrong");
      } else {
        this.gridOutput[index - 1] = value;
        if (value === "incorrect") {
          return $target.addClass("element_wrong");
        } else if (value === "correct") {
          return $target.removeClass("element_wrong");
        }
      }
    }
  };

  GridRunView.prototype.endOfGridLineClick = function(event) {
    var $target, i, index, j, k, ref, ref1, ref2, ref3;
    event.preventDefault();
    if (this.mode === "mark") {
      $target = $(event.target);
      if ($target.hasClass("element_wrong")) {
        $target.removeClass("element_wrong");
        index = $target.attr('data-index');
        for (i = j = ref = index, ref1 = index - (this.columns - 1); ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
          this.markElement(i, "correct");
        }
      } else if (!$target.hasClass("element_wrong") && !this.autostopped) {
        $target.addClass("element_wrong");
        index = $target.attr('data-index');
        for (i = k = ref2 = index, ref3 = index - (this.columns - 1); ref2 <= ref3 ? k <= ref3 : k >= ref3; i = ref2 <= ref3 ? ++k : --k) {
          this.markElement(i, "incorrect");
        }
      }
      if (this.autostop !== 0) {
        return this.checkAutostop();
      }
    }
  };

  GridRunView.prototype.lastHandler = function(event, index) {
    var $target;
    if (index != null) {
      $target = this.$el.find(".grid_element[data-index=" + index + "]");
    } else {
      $target = $(event.target);
      index = $target.attr('data-index');
    }
    if (index - 1 >= this.gridOutput.lastIndexOf("incorrect")) {
      this.$el.find(".element_last").removeClass("element_last");
      $target.addClass("element_last");
      return this.lastAttempted = index;
    }
  };

  GridRunView.prototype.floatOn = function() {
    var timer, timerPos;
    timer = this.$el.find('.timer');
    timerPos = timer.offset();
    return $(window).on('scroll', function() {
      var scrollPos;
      scrollPos = $(window).scrollTop();
      if (scrollPos >= timerPos.top) {
        return timer.css({
          position: "fixed",
          top: "10%",
          left: "80%"
        });
      } else {
        return timer.css({
          position: "initial",
          top: "initial",
          left: "initial"
        });
      }
    });
  };

  GridRunView.prototype.floatOff = function() {
    var timer;
    $(window).off('scroll');
    timer = this.$el.find('.timer');
    return timer.css({
      position: "initial",
      top: "initial",
      left: "initial"
    });
  };

  GridRunView.prototype.startTimer = function() {
    if (this.timerStopped === false && this.timeRunning === false) {
      this.interval = setInterval(this.updateCountdown, 1000);
      this.startTime = this.getTime();
      this.timeRunning = true;
      this.updateMode("mark");
      this.enableGrid();
      this.updateCountdown();
      return this.floatOn();
    }
  };

  GridRunView.prototype.enableGrid = function() {
    return this.$el.find("table.disabled, div.disabled").removeClass("disabled");
  };

  GridRunView.prototype.stopTimer = function(event, message) {
    if (message == null) {
      message = false;
    }
    if (this.timeRunning !== true) {
      return;
    }
    if (event != null ? event.target : void 0) {
      this.lastHandler(null, this.items.length);
    }
    clearInterval(this.interval);
    this.stopTime = this.getTime();
    this.timeRunning = false;
    this.timerStopped = true;
    this.floatOff();
    return this.updateCountdown();
  };

  GridRunView.prototype.autostopTest = function() {
    Utils.flash();
    clearInterval(this.interval);
    this.stopTime = this.getTime();
    this.autostopped = true;
    this.timerStopped = true;
    this.timeRunning = false;
    this.$el.find(".grid_element").slice(this.autostop - 1, this.autostop).addClass("element_last");
    this.lastAttempted = this.autostop;
    this.timeout = setTimeout(this.removeUndo, 3000);
    return Utils.topAlert(this.text.autostop);
  };

  GridRunView.prototype.removeUndo = function() {
    this.undoable = false;
    this.updateMode("disabled");
    return clearTimeout(this.timeout);
  };

  GridRunView.prototype.unAutostopTest = function() {
    this.interval = setInterval(this.updateCountdown, 1000);
    this.updateCountdown();
    this.autostopped = false;
    this.lastAttempted = 0;
    this.$el.find(".grid_element").slice(this.autostop - 1, this.autostop).removeClass("element_last");
    this.timeRunning = true;
    this.updateMode("mark");
    return Utils.topAlert(t("GridRunView.message.autostop_cancel"));
  };

  GridRunView.prototype.updateCountdown = function() {
    this.timeElapsed = Math.min(this.getTime() - this.startTime, this.timer);
    this.timeRemaining = this.timer - this.timeElapsed;
    this.$el.find(".timer").html(this.timeRemaining);
    if (this.timeRunning === true && this.captureLastAttempted && this.timeRemaining <= 0) {
      this.stopTimer({
        simpleStop: true
      });
      Utils.background("red");
      _.delay((function(_this) {
        return function() {
          alert(_this.text.touchLastItem);
          return Utils.background("");
        };
      })(this), 1e3);
      this.updateMode(event, "last");
    }
    if (this.captureItemAtTime && !this.gotIntermediate && !this.minuteMessage && this.timeElapsed >= this.captureAfterSeconds) {
      Utils.flash("yellow");
      Utils.midAlert(t("please select the item the child is currently attempting"));
      this.minuteMessage = true;
      return this.mode = "minuteItem";
    }
  };

  GridRunView.prototype.updateMode = function(mode) {
    if (mode == null) {
      mode = null;
    }
    if ((mode === null && this.timeElapsed === 0 && !this.dataEntry) || mode === "disabled") {
      return this.modeButton.setValue(null);
    } else if (mode != null) {
      this.mode = mode;
      return this.modeButton.setValue(this.mode);
    } else {
      return this.mode = this.modeButton.getValue();
    }
  };

  GridRunView.prototype.getTime = function() {
    return Math.round((new Date()).getTime() / 1000);
  };

  GridRunView.prototype.resetVariables = function() {
    var previous;
    this.timer = parseInt(this.model.get("timer")) || 0;
    this.untimed = this.timer === 0 || this.dataEntry;
    this.gotMinuteItem = false;
    this.minuteMessage = false;
    this.itemAtTime = null;
    this.timeIntermediateCaptured = null;
    this.markRecord = [];
    this.timerStopped = false;
    this.startTime = 0;
    this.stopTime = 0;
    this.timeElapsed = 0;
    this.timeRemaining = this.timer;
    this.lastAttempted = 0;
    this.interval = null;
    this.undoable = true;
    this.timeRunning = false;
    this.items = _.compact(this.model.get("items"));
    this.itemMap = [];
    this.mapItem = [];
    if (this.model.has("randomize") && this.model.get("randomize")) {
      this.itemMap = this.items.map(function(value, i) {
        return i;
      });
      this.items.forEach(function(item, i) {
        var temp, tempValue;
        temp = Math.floor(Math.random() * this.items.length);
        tempValue = this.itemMap[temp];
        this.itemMap[temp] = this.itemMap[i];
        return this.itemMap[i] = tempValue;
      }, this);
      this.itemMap.forEach(function(item, i) {
        return this.mapItem[this.itemMap[i]] = i;
      }, this);
    } else {
      this.items.forEach(function(item, i) {
        this.itemMap[i] = i;
        return this.mapItem[i] = i;
      }, this);
    }
    if (!this.captureLastAttempted && !this.captureItemAtTime) {
      this.mode = "mark";
    } else {
      this.mode = "disabled";
    }
    if (this.dataEntry) {
      this.mode = "mark";
    }
    this.gridOutput = this.items.map(function() {
      return 'correct';
    });
    this.columns = parseInt(this.model.get("columns")) || 3;
    this.autostop = this.untimed ? 0 : parseInt(this.model.get("autostop")) || 0;
    this.autostopped = false;
    this.$el.find(".grid_element").removeClass("element_wrong").removeClass("element_last").addClass("disabled");
    this.$el.find("table").addClass("disabled");
    this.$el.find(".timer").html(this.timer);
    if (!this.dataEntry) {
      previous = this.parent.parent.result.getByHash(this.model.get('hash'));
      if (previous) {
        this.captureLastAttempted = previous.capture_last_attempted;
        this.itemAtTime = previous.item_at_time;
        this.timeIntermediateCaptured = previous.time_intermediate_captured;
        this.captureItemAtTime = previous.capture_item_at_time;
        this.autostop = previous.auto_stop;
        this.lastAttempted = previous.attempted;
        this.timeRemaining = previous.time_remain;
        this.markRecord = previous.mark_record;
      }
    }
    if (this.modeButton != null) {
      return this.updateMode(this.mode);
    }
  };

  GridRunView.prototype.i18n = function() {
    return this.text = {
      autostop: t("GridRunView.message.autostop"),
      touchLastItem: t("GridRunView.message.touch_last_item"),
      subtestNotComplete: t("GridRunView.message.subtest_not_complete"),
      inputMode: t("GridRunView.label.input_mode"),
      timeRemaining: t("GridRunView.label.time_remaining"),
      wasAutostopped: t("GridRunView.label.was_autostopped"),
      mark: t("GridRunView.button.mark"),
      start: t("GridRunView.button.start"),
      stop: t("GridRunView.button.stop"),
      restart: t("GridRunView.button.restart"),
      lastAttempted: t("GridRunView.button.last_attempted")
    };
  };

  GridRunView.prototype.initialize = function(options) {
    var fontSizeClass;
    this.i18n();
    if (this.model.get("fontFamily") !== "") {
      this.fontStyle = "style=\"font-family: " + (this.model.get('fontFamily')) + " !important;\"";
    }
    this.captureAfterSeconds = this.model.has("captureAfterSeconds") ? this.model.get("captureAfterSeconds") : 0;
    this.captureItemAtTime = this.model.has("captureItemAtTime") ? this.model.get("captureItemAtTime") : false;
    this.captureLastAttempted = this.model.has("captureLastAttempted") ? this.model.get("captureLastAttempted") : true;
    this.endOfLine = this.model.has("endOfLine") ? this.model.get("endOfLine") : true;
    this.layoutMode = this.model.has("layoutMode") ? this.model.get("layoutMode") : "fixed";
    this.fontSize = this.model.has("fontSize") ? this.model.get("fontSize") : "normal";
    if (this.fontSize === "small") {
      fontSizeClass = "font_size_small";
    } else {
      fontSizeClass = "";
    }
    this.rtl = this.model.getBoolean("rtl");
    if (this.rtl) {
      this.$el.addClass("rtl-grid");
    }
    this.totalTime = this.model.get("timer") || 0;
    this.modeHandlers = {
      "mark": this.markHandler,
      "last": this.lastHandler,
      "minuteItem": this.intermediateItemHandler,
      disabled: $.noop
    };
    this.dataEntry = options.dataEntry;
    this.model = options.model;
    this.parent = options.parent;
    this.resetVariables();
    this.gridElement = _.template("<td><button data-label='{{label}}' data-index='{{i}}' class='grid_element " + fontSizeClass + "' " + (this.fontStyle || "") + ">{{label}}</button></td>");
    this.variableGridElement = _.template("<button data-label='{{label}}' data-index='{{i}}' class='grid_element " + fontSizeClass + "' " + (this.fontStyle || "") + ">{{label}}</button>");
    if (this.layoutMode === "fixed") {
      return this.endOfGridLine = _.template("<td><button data-index='{{i}}' class='end_of_grid_line'>*</button></td>");
    } else {
      return this.endOfGridLine = _.template("");
    }
  };

  GridRunView.prototype.render = function() {
    var $target, buttonConfig, dataEntry, disabling, displayRtl, done, firstRow, gridHTML, html, i, item, j, k, l, len, len1, modeSelector, previous, ref, ref1, ref2, ref3, resetButton, startTimerHTML, stopTimerHTML;
    done = 0;
    startTimerHTML = "<div class='timer_wrapper'><button class='start_time time'>" + this.text.start + "</button><div class='timer'>" + this.timer + "</div></div>";
    if (!this.untimed) {
      disabling = "disabled";
    }
    if (this.rtl) {
      displayRtl = "rtl_mode";
    }
    html = !this.untimed ? startTimerHTML : "";
    gridHTML = "";
    if (this.layoutMode === "fixed") {
      gridHTML += "<table class='grid " + disabling + " " + (displayRtl || '') + "'>";
      firstRow = true;
      while (true) {
        if (done > this.items.length) {
          break;
        }
        gridHTML += "<tr>";
        for (i = j = 1, ref = this.columns; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
          if (done < this.items.length) {
            gridHTML += this.gridElement({
              label: _.escape(this.items[this.itemMap[done]]),
              i: done + 1
            });
          }
          done++;
        }
        if (firstRow) {
          if (done < (this.items.length + 1) && this.endOfLine) {
            gridHTML += "<td></td>";
          }
          firstRow = false;
        } else {
          if (done < (this.items.length + 1) && this.endOfLine) {
            gridHTML += this.endOfGridLine({
              i: done
            });
          }
        }
        gridHTML += "</tr>";
      }
      gridHTML += "</table>";
    } else {
      gridHTML += "<div class='grid " + disabling + " " + (displayRtl || '') + "'>";
      ref1 = this.items;
      for (i = k = 0, len = ref1.length; k < len; i = ++k) {
        item = ref1[i];
        gridHTML += this.variableGridElement({
          "label": _.escape(this.items[this.itemMap[i]]),
          "i": i + 1
        });
      }
      gridHTML += "</div>";
    }
    html += gridHTML;
    stopTimerHTML = "<div class='timer_wrapper'><button class='stop_time time'>" + this.text.stop + "</button></div>";
    resetButton = "<div> <button class='restart command'>" + this.text.restart + "</button> <br> </div>";
    if (this.captureLastAttempted || this.captureItemAtTime) {
      if ((ref2 = this.modeButton) != null) {
        ref2.close();
      }
      buttonConfig = {
        options: [],
        mode: "single"
      };
      buttonConfig.options.push({
        label: this.text.mark,
        value: "mark"
      });
      if (this.captureItemAtTime) {
        buttonConfig.options.push({
          label: t("item at __seconds__ seconds", {
            seconds: this.captureAfterSeconds
          }),
          value: "minuteItem"
        });
      }
      if (this.captureLastAttempted) {
        buttonConfig.options.push({
          label: this.text.lastAttempted,
          value: "last"
        });
      }
      this.modeButton = new ButtonView(buttonConfig);
      this.listenTo(this.modeButton, "change click", this.updateMode);
      modeSelector = "<div class='grid_mode_wrapper question clearfix'> <label>" + this.text.inputMode + "</label><br> <div class='mode-button'></div> </div>";
    }
    dataEntry = "<table class='class_table'> <tr> <td>" + this.text.wasAutostopped + "</td><td><input type='checkbox' class='data_autostopped'></td> </tr> <tr> <td>" + this.text.timeRemaining + "</td><td><input type='number' class='data_time_remain'></td> </tr> </table>";
    html += (!this.untimed ? stopTimerHTML : "") + " " + (!this.untimed ? resetButton : "") + " " + modeSelector + " " + ((this.dataEntry ? dataEntry : void 0) || '');
    this.$el.html(html);
    this.modeButton.setElement(this.$el.find(".mode-button"));
    this.modeButton.render();
    this.trigger("rendered");
    this.trigger("ready");
    if (!this.dataEntry) {
      previous = this.parent.parent.result.getByHash(this.model.get('hash'));
      if (previous) {
        this.markRecord = previous.mark_record;
        ref3 = this.markRecord;
        for (i = l = 0, len1 = ref3.length; l < len1; i = ++l) {
          item = ref3[i];
          this.markElement(item, null, 'populate');
        }
        this.itemAtTime = previous.item_at_time;
        $target = this.$el.find(".grid_element[data-index=" + this.itemAtTime + "]");
        $target.addClass("element_minute");
        this.lastAttempted = previous.attempted;
        $target = this.$el.find(".grid_element[data-index=" + this.lastAttempted + "]");
        return $target.addClass("element_last");
      }
    }
  };

  GridRunView.prototype.isValid = function() {
    var item, ref;
    if (this.timeRunning) {
      this.stopTimer();
    }
    if (parseInt(this.lastAttempted) === this.items.length && this.timeRemaining === 0) {
      item = this.items[this.items.length - 1];
      if (confirm(t("GridRunView.message.last_item_confirm", {
        item: item
      }))) {
        this.updateMode;
        return true;
      } else {
        this.messages = ((ref = this.messages) != null ? ref.push : void 0) ? this.messages.concat([msg]) : [msg];
        this.updateMode("last");
        return false;
      }
    }
    if (this.captureLastAttempted && this.lastAttempted === 0) {
      return false;
    }
    if (this.timeRunning === true) {
      return false;
    }
    if (this.timer !== 0 && this.timeRemaining === this.timer) {
      return false;
    }
    return true;
  };

  GridRunView.prototype.showErrors = function() {
    var messages, noLastItem, timeStillRunning, timerHasntRun;
    messages = this.messages || [];
    this.messages = [];
    timerHasntRun = this.timer !== 0 && this.timeRemaining === this.timer;
    noLastItem = this.captureLastAttempted && this.lastAttempted === 0;
    timeStillRunning = this.timeRuning === true;
    if (timerHasntRun) {
      messages.push(this.text.subtestNotComplete);
    }
    if (noLastItem && !timerHasntRun) {
      messages.push(this.text.touchLastItem);
      this.updateMode("last");
    }
    if (timeStillRunning) {
      messages.push(this.text.timeStillRunning);
    }
    return Utils.midAlert(messages.join("<br>"), 3000);
  };

  GridRunView.prototype.getResult = function() {
    var autostopped, completeResults, i, item, itemResults, j, len, ref, result, timeRemaining;
    completeResults = [];
    itemResults = [];
    if (!this.captureLastAttempted) {
      this.lastAttempted = this.items.length;
    }
    ref = this.items;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      item = ref[i];
      if (this.mapItem[i] < this.lastAttempted) {
        itemResults[i] = {
          itemResult: this.gridOutput[this.mapItem[i]],
          itemLabel: item
        };
      } else {
        itemResults[i] = {
          itemResult: "missing",
          itemLabel: this.items[this.mapItem[i]]
        };
      }
    }
    if (!this.captureLastAttempted) {
      this.lastAttempted = false;
    }
    if (this.dataEntry) {
      autostopped = this.$el.find(".data_autostopped").is(":checked");
      timeRemaining = parseInt(this.$el.find(".data_time_remain").val());
    } else {
      autostopped = this.autostopped;
      timeRemaining = this.timeRemaining;
    }
    result = {
      "capture_last_attempted": this.captureLastAttempted,
      "item_at_time": this.itemAtTime,
      "time_intermediate_captured": this.timeIntermediateCaptured,
      "capture_item_at_time": this.captureItemAtTime,
      "auto_stop": autostopped,
      "attempted": this.lastAttempted,
      "items": itemResults,
      "time_remain": timeRemaining,
      "mark_record": this.markRecord,
      "variable_name": this.model.get("variableName")
    };
    return result;
  };

  GridRunView.prototype.getSkipped = function() {
    var i, item, itemResults, j, len, ref, result;
    itemResults = [];
    ref = this.items;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      item = ref[i];
      itemResults[i] = {
        itemResult: "skipped",
        itemLabel: item
      };
    }
    return result = {
      "capture_last_attempted": "skipped",
      "item_at_time": "skipped",
      "time_intermediate_captured": "skipped",
      "capture_item_at_time": "skipped",
      "auto_stop": "skipped",
      "attempted": "skipped",
      "items": itemResults,
      "time_remain": "skipped",
      "mark_record": "skipped",
      "variable_name": this.model.get("variableName")
    };
  };

  GridRunView.prototype.onClose = function() {
    return clearInterval(this.interval);
  };

  return GridRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0dyaWRSdW5WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFdBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7Ozs7Ozt3QkFFSixTQUFBLEdBQVc7O3dCQUVYLE1BQUEsR0FBVyxTQUFTLENBQUMsS0FBYixHQUF3QjtJQUM5QixxQkFBQSxFQUE0QixXQURFO0lBRTlCLHlCQUFBLEVBQTRCLG9CQUZFO0lBRzlCLG1CQUFBLEVBQXVCLFlBSE87SUFJOUIsa0JBQUEsRUFBdUIsV0FKTztJQUs5QixnQkFBQSxFQUF1QixjQUxPO0dBQXhCLEdBTUQ7SUFDTCx5QkFBQSxFQUE0QixvQkFEdkI7SUFFTCxxQkFBQSxFQUE0QixXQUZ2QjtJQUdMLG1CQUFBLEVBQTRCLFlBSHZCO0lBSUwsa0JBQUEsRUFBNEIsV0FKdkI7SUFLTCxnQkFBQSxFQUE0QixjQUx2Qjs7O3dCQVFQLFlBQUEsR0FBYyxTQUFBO0lBQ1osSUFBK0IsSUFBQyxDQUFBLFdBQWhDO01BQUEsSUFBQyxDQUFBLFNBQUQsQ0FBVztRQUFBLFVBQUEsRUFBVyxJQUFYO09BQVgsRUFBQTs7SUFFQSxJQUFDLENBQUEsY0FBRCxDQUFBO1dBRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsZ0JBQVYsQ0FBMkIsQ0FBQyxXQUE1QixDQUF3QyxlQUF4QztFQUxZOzt3QkFPZCxTQUFBLEdBQVcsU0FBQyxLQUFEO0FBQ1QsUUFBQTtJQUFBLEtBQUssQ0FBQyxjQUFOLENBQUE7MkZBQ3NCO0VBRmI7O3dCQUlYLFdBQUEsR0FBYSxTQUFDLEtBQUQ7QUFDWCxRQUFBO0lBQUEsT0FBQSxHQUFVLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUjtJQUNWLEtBQUEsR0FBUSxPQUFPLENBQUMsSUFBUixDQUFhLFlBQWI7SUFFUiwyQkFBQSxHQUE4QixRQUFBLENBQVMsS0FBVCxDQUFBLEdBQWtCLFFBQUEsQ0FBUyxJQUFDLENBQUEsYUFBVjtJ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K0IsSUFBQyxDQUFBLHdCQUZoQztNQUdBLHNCQUFBLEVBQStCLElBQUMsQ0FBQSxpQkFIaEM7TUFJQSxXQUFBLEVBQWtCLFdBSmxCO01BS0EsV0FBQSxFQUFrQixJQUFDLENBQUEsYUFMbkI7TUFNQSxPQUFBLEVBQWtCLFdBTmxCO01BT0EsYUFBQSxFQUFrQixhQVBsQjtNQVFBLGFBQUEsRUFBa0IsSUFBQyxDQUFBLFVBUm5CO01BU0EsZUFBQSxFQUFrQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxjQUFYLENBVGxCOztBQVVGLFdBQU87RUFwQ0U7O3dCQXNDWCxVQUFBLEdBQVksU0FBQTtBQUNWLFFBQUE7SUFBQSxXQUFBLEdBQWM7QUFFZDtBQUFBLFNBQUEsNkNBQUE7O01BQ0UsV0FBWSxDQUFBLENBQUEsQ0FBWixHQUNFO1FBQUEsVUFBQSxFQUFhLFNBQWI7UUFDQSxTQUFBLEVBQWEsSUFEYjs7QUFGSjtXQUtBLE1BQUEsR0FDRTtNQUFBLHdCQUFBLEVBQStCLFNBQS9CO01BQ0EsY0FBQSxFQUErQixTQUQvQjtNQUVBLDRCQUFBLEVBQStCLFNBRi9CO01BR0Esc0JBQUEsRUFBK0IsU0FIL0I7TUFJQSxXQUFBLEVBQWtCLFNBSmxCO01BS0EsV0FBQSxFQUFrQixTQUxsQjtNQU1BLE9BQUEsRUFBa0IsV0FObEI7TUFPQSxhQUFBLEVBQWtCLFNBUGxCO01BUUEsYUFBQSxFQUFrQixTQVJsQjtNQVNBLGVBQUEsRUFBa0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsY0FBWCxDQVRsQjs7RUFUUTs7d0JBb0JaLE9BQUEsR0FBUyxTQUFBO1dBQ1AsYUFBQSxDQUFjLElBQUMsQ0FBQSxRQUFmO0VBRE87Ozs7R0FqbkJlLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9HcmlkUnVuVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEdyaWRSdW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJncmlkX3Byb3RvdHlwZVwiXG5cbiAgZXZlbnRzOiBpZiBNb2Rlcm5penIudG91Y2ggdGhlbiB7XG4gICAgJ2NsaWNrIC5ncmlkX2VsZW1lbnQnICAgICA6ICdncmlkQ2xpY2snICNjbGlja1xuICAgICdjbGljayAuZW5kX29mX2dyaWRfbGluZScgOiAnZW5kT2ZHcmlkTGluZUNsaWNrJyAjY2xpY2tcbiAgICAnY2xpY2sgLnN0YXJ0X3RpbWUnICA6ICdzdGFydFRpbWVyJ1xuICAgICdjbGljayAuc3RvcF90aW1lJyAgIDogJ3N0b3BUaW1lcidcbiAgICAnY2xpY2sgLnJlc3RhcnQnICAgICA6ICdyZXN0YXJ0VGltZXInXG4gIH0gZWxzZSB7XG4gICAgJ2NsaWNrIC5lbmRfb2ZfZ3JpZF9saW5lJyA6ICdlbmRPZkdyaWRMaW5lQ2xpY2snXG4gICAgJ2NsaWNrIC5ncmlkX2VsZW1lbnQnICAgICA6ICdncmlkQ2xpY2snXG4gICAgJ2NsaWNrIC5zdGFydF90aW1lJyAgICAgICA6ICdzdGFydFRpbWVyJ1xuICAgICdjbGljayAuc3RvcF90aW1lJyAgICAgICAgOiAnc3RvcFRpbWVyJ1xuICAgICdjbGljayAucmVzdGFydCcgICAgICAgICAgOiAncmVzdGFydFRpbWVyJ1xuICB9XG5cbiAgcmVzdGFydFRpbWVyOiAtPlxuICAgIEBzdG9wVGltZXIoc2ltcGxlU3RvcDp0cnVlKSBpZiBAdGltZVJ1bm5pbmdcblxuICAgIEByZXNldFZhcmlhYmxlcygpXG5cbiAgICBAJGVsLmZpbmQoXCIuZWxlbWVudF93cm9uZ1wiKS5yZW1vdmVDbGFzcyBcImVsZW1lbnRfd3JvbmdcIlxuXG4gIGdyaWRDbGljazogKGV2ZW50KSA9PlxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBAbW9kZUhhbmRsZXJzW0Btb2RlXT8oZXZlbnQpXG5cbiAgbWFya0hhbmRsZXI6IChldmVudCkgPT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgaW5kZXggPSAkdGFyZ2V0LmF0dHIoJ2RhdGEtaW5kZXgnKVxuXG4gICAgaW5kZXhJc250QmVsb3dMYXN0QXR0ZW1wdGVkID0gcGFyc2VJbnQoaW5kZXgpID4gcGFyc2VJbnQoQGxhc3RBdHRlbXB0ZWQpXG4gICAgbGFzdEF0dGVtcHRlZElzbnRaZXJvICAgICAgID0gcGFyc2VJbnQoQGxhc3RBdHRlbXB0ZWQpICE9IDBcbiAgICBjb3JyZWN0aW9uc0Rpc2FibGVkICAgICAgICAgPSBAZGF0YUVudHJ5IGlzIGZhbHNlIGFuZCBAcGFyZW50Py5wYXJlbnQ/LmVuYWJsZUNvcnJlY3Rpb25zIGlzIGZhbHNlXG5cbiAgICByZXR1cm4gaWYgY29ycmVjdGlvbnNEaXNhYmxlZCAmJiBsYXN0QXR0ZW1wdGVkSXNudFplcm8gJiYgaW5kZXhJc250QmVsb3dMYXN0QXR0ZW1wdGVkXG5cbiAgICBAbWFya0VsZW1lbnQoaW5kZXgpXG4gICAgQGNoZWNrQXV0b3N0b3AoKSBpZiBAYXV0b3N0b3AgIT0gMFxuXG5cbiAgaW50ZXJtZWRpYXRlSXRlbUhhbmRsZXI6IChldmVudCkgPT5cbiAgICBAdGltZUludGVybWVkaWF0ZUNhcHR1cmVkID0gQGdldFRpbWUoKSAtIEBzdGFydFRpbWVcbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgaW5kZXggPSAkdGFyZ2V0LmF0dHIoJ2RhdGEtaW5kZXgnKVxuICAgIEBpdGVtQXRUaW1lID0gaW5kZXhcbiAgICAkdGFyZ2V0LmFkZENsYXNzIFwiZWxlbWVudF9taW51dGVcIlxuICAgIEB1cGRhdGVNb2RlIFwibWFya1wiXG5cblxuICBjaGVja0F1dG9zdG9wOiAtPlxuICAgIGlmIEB0aW1lUnVubmluZ1xuICAgICAgYXV0b0NvdW50ID0gMFxuICAgICAgZm9yIGkgaW4gWzAuLkBhdXRvc3RvcC0xXVxuICAgICAgICBpZiBAZ3JpZE91dHB1dFtpXSA9PSBcImNvcnJlY3RcIiB0aGVuIGJyZWFrXG4gICAgICAgIGF1dG9Db3VudCsrXG4gICAgICBpZiBAYXV0b3N0b3BwZWQgPT0gZmFsc2VcbiAgICAgICAgaWYgYXV0b0NvdW50ID09IEBhdXRvc3RvcCB0aGVuIEBhdXRvc3RvcFRlc3QoKVxuICAgICAgaWYgQGF1dG9zdG9wcGVkID09IHRydWUgJiYgYXV0b0NvdW50IDwgQGF1dG9zdG9wICYmIEB1bmRvYWJsZSA9PSB0cnVlIHRoZW4gQHVuQXV0b3N0b3BUZXN0KClcblxuICAgICAgICAjIG1vZGUgaXMgdXNlZCBmb3Igb3BlcmF0aW9ucyBsaWtlIHByZS1wb3B1bGF0aW5nIHRoZSBncmlkIHdoZW4gZG9pbmcgY29ycmVjdGlvbnMuXG4gIG1hcmtFbGVtZW50OiAoaW5kZXgsIHZhbHVlID0gbnVsbCwgbW9kZSkgLT5cbiAgICAjIGlmIGxhc3QgYXR0ZW1wdGVkIGhhcyBiZWVuIHNldCwgYW5kIHRoZSBjbGljayBpcyBhYm92ZSBpdCwgdGhlbiBjYW5jZWxcblxuICAgIGNvcnJlY3Rpb25zRGlzYWJsZWQgICAgICAgICA9IEBkYXRhRW50cnkgaXMgZmFsc2UgYW5kIEBwYXJlbnQ/LnBhcmVudD8uZW5hYmxlQ29ycmVjdGlvbnM/IGFuZCBAcGFyZW50Py5wYXJlbnQ/LmVuYWJsZUNvcnJlY3Rpb25zIGlzIGZhbHNlXG4gICAgbGFzdEF0dGVtcHRlZElzbnRaZXJvICAgICAgID0gcGFyc2VJbnQoQGxhc3RBdHRlbXB0ZWQpICE9IDBcbiAgICBpbmRleElzbnRCZWxvd0xhc3RBdHRlbXB0ZWQgPSBwYXJzZUludChpbmRleCkgPiBwYXJzZUludChAbGFzdEF0dGVtcHRlZClcblxuICAgIHJldHVybiBpZiBjb3JyZWN0aW9uc0Rpc2FibGVkIGFuZCBsYXN0QXR0ZW1wdGVkSXNudFplcm8gYW5kIGluZGV4SXNudEJlbG93TGFzdEF0dGVtcHRlZFxuXG4gICAgJHRhcmdldCA9IEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRbZGF0YS1pbmRleD0je2luZGV4fV1cIilcbiAgICBpZiBtb2RlICE9ICdwb3B1bGF0ZSdcbiAgICAgIEBtYXJrUmVjb3JkLnB1c2ggaW5kZXhcblxuICAgIGlmIG5vdCBAYXV0b3N0b3BwZWRcbiAgICAgIGlmIHZhbHVlID09IG51bGwgIyBub3Qgc3BlY2lmeWluZyB0aGUgdmFsdWUsIGp1c3QgdG9nZ2xlXG4gICAgICAgIEBncmlkT3V0cHV0W2luZGV4LTFdID0gaWYgKEBncmlkT3V0cHV0W2luZGV4LTFdID09IFwiY29ycmVjdFwiKSB0aGVuIFwiaW5jb3JyZWN0XCIgZWxzZSBcImNvcnJlY3RcIlxuICAgICAgICAkdGFyZ2V0LnRvZ2dsZUNsYXNzIFwiZWxlbWVudF93cm9uZ1wiXG4gICAgICBlbHNlICMgdmFsdWUgc3BlY2lmaWVkXG4gICAgICAgIEBncmlkT3V0cHV0W2luZGV4LTFdID0gdmFsdWVcbiAgICAgICAgaWYgdmFsdWUgPT0gXCJpbmNvcnJlY3RcIlxuICAgICAgICAgICR0YXJnZXQuYWRkQ2xhc3MgXCJlbGVtZW50X3dyb25nXCJcbiAgICAgICAgZWxzZSBpZiB2YWx1ZSA9PSBcImNvcnJlY3RcIlxuICAgICAgICAgICR0YXJnZXQucmVtb3ZlQ2xhc3MgXCJlbGVtZW50X3dyb25nXCJcblxuICBlbmRPZkdyaWRMaW5lQ2xpY2s6IChldmVudCkgLT5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaWYgQG1vZGUgPT0gXCJtYXJrXCJcbiAgICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcblxuICAgICAgIyBpZiB3aGF0IHdlIGNsaWNrZWQgaXMgYWxyZWFkeSBtYXJrZWQgd3JvbmdcbiAgICAgIGlmICR0YXJnZXQuaGFzQ2xhc3MoXCJlbGVtZW50X3dyb25nXCIpXG4gICAgICAgICMgWUVTLCBtYXJrIGl0IHJpZ2h0XG4gICAgICAgICR0YXJnZXQucmVtb3ZlQ2xhc3MgXCJlbGVtZW50X3dyb25nXCJcbiAgICAgICAgaW5kZXggPSAkdGFyZ2V0LmF0dHIoJ2RhdGEtaW5kZXgnKVxuICAgICAgICBmb3IgaSBpbiBbaW5kZXguLihpbmRleC0oQGNvbHVtbnMtMSkpXVxuICAgICAgICAgIEBtYXJrRWxlbWVudCBpLCBcImNvcnJlY3RcIlxuICAgICAgZWxzZSBpZiAhJHRhcmdldC5oYXNDbGFzcyhcImVsZW1lbnRfd3JvbmdcIikgJiYgIUBhdXRvc3RvcHBlZFxuICAgICAgICAjIE5PLCBtYXJrIGl0IHdyb25nXG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MgXCJlbGVtZW50X3dyb25nXCJcbiAgICAgICAgaW5kZXggPSAkdGFyZ2V0LmF0dHIoJ2RhdGEtaW5kZXgnKVxuICAgICAgICBmb3IgaSBpbiBbaW5kZXguLihpbmRleC0oQGNvbHVtbnMtMSkpXVxuICAgICAgICAgIEBtYXJrRWxlbWVudCBpLCBcImluY29ycmVjdFwiXG5cbiAgICAgIEBjaGVja0F1dG9zdG9wKCkgaWYgQGF1dG9zdG9wICE9IDBcblxuICBsYXN0SGFuZGxlcjogKGV2ZW50LCBpbmRleCkgPT5cbiAgICBpZiBpbmRleD9cbiAgICAgICR0YXJnZXQgPSBAJGVsLmZpbmQoXCIuZ3JpZF9lbGVtZW50W2RhdGEtaW5kZXg9I3tpbmRleH1dXCIpXG4gICAgZWxzZVxuICAgICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgICAgaW5kZXggICA9ICR0YXJnZXQuYXR0cignZGF0YS1pbmRleCcpXG5cbiAgICBpZiBpbmRleCAtIDEgPj0gQGdyaWRPdXRwdXQubGFzdEluZGV4T2YoXCJpbmNvcnJlY3RcIilcbiAgICAgIEAkZWwuZmluZChcIi5lbGVtZW50X2xhc3RcIikucmVtb3ZlQ2xhc3MgXCJlbGVtZW50X2xhc3RcIlxuICAgICAgJHRhcmdldC5hZGRDbGFzcyBcImVsZW1lbnRfbGFzdFwiXG4gICAgICBAbGFzdEF0dGVtcHRlZCA9IGluZGV4XG5cbiAgZmxvYXRPbjogLT5cbiAgICB0aW1lciA9IEAkZWwuZmluZCgnLnRpbWVyJylcbiAgICB0aW1lclBvcyA9IHRpbWVyLm9mZnNldCgpXG4gICAgJCh3aW5kb3cpLm9uICdzY3JvbGwnLCAtPlxuICAgICAgc2Nyb2xsUG9zID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpXG4gICAgICBpZiBzY3JvbGxQb3MgPj0gdGltZXJQb3MudG9wXG4gICAgICAgIHRpbWVyLmNzc1xuICAgICAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCJcbiAgICAgICAgICB0b3A6IFwiMTAlXCJcbiAgICAgICAgICBsZWZ0OiBcIjgwJVwiXG4gICAgICBlbHNlXG4gICAgICAgIHRpbWVyLmNzc1xuICAgICAgICAgIHBvc2l0aW9uOiBcImluaXRpYWxcIlxuICAgICAgICAgIHRvcDogXCJpbml0aWFsXCJcbiAgICAgICAgICBsZWZ0OiBcImluaXRpYWxcIlxuXG4gIGZsb2F0T2ZmOiAtPlxuICAgICQod2luZG93KS5vZmYgJ3Njcm9sbCdcbiAgICB0aW1lciA9IEAkZWwuZmluZCgnLnRpbWVyJylcbiAgICB0aW1lci5jc3NcbiAgICAgIHBvc2l0aW9uOiBcImluaXRpYWxcIlxuICAgICAgdG9wOiBcImluaXRpYWxcIlxuICAgICAgbGVmdDogXCJpbml0aWFsXCJcblxuICBzdGFydFRpbWVyOiAtPlxuICAgIGlmIEB0aW1lclN0b3BwZWQgPT0gZmFsc2UgJiYgQHRpbWVSdW5uaW5nID09IGZhbHNlXG5cbiAgICAgIEBpbnRlcnZhbCA9IHNldEludGVydmFsKCBAdXBkYXRlQ291bnRkb3duLCAxMDAwICkgIyBtYWdpYyBudW1iZXJcbiAgICAgIEBzdGFydFRpbWUgPSBAZ2V0VGltZSgpXG4gICAgICBAdGltZVJ1bm5pbmcgPSB0cnVlXG4gICAgICBAdXBkYXRlTW9kZSBcIm1hcmtcIlxuICAgICAgQGVuYWJsZUdyaWQoKVxuICAgICAgQHVwZGF0ZUNvdW50ZG93bigpXG4gICAgICBAZmxvYXRPbigpXG5cbiAgZW5hYmxlR3JpZDogLT5cbiAgICBAJGVsLmZpbmQoXCJ0YWJsZS5kaXNhYmxlZCwgZGl2LmRpc2FibGVkXCIpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIilcblxuICBzdG9wVGltZXI6IChldmVudCwgbWVzc2FnZSA9IGZhbHNlKSAtPlxuXG4gICAgcmV0dXJuIGlmIEB0aW1lUnVubmluZyAhPSB0cnVlICMgc3RvcCBvbmx5IGlmIG5lZWRlZFxuXG4gICAgaWYgZXZlbnQ/LnRhcmdldFxuICAgICAgQGxhc3RIYW5kbGVyKG51bGwsIEBpdGVtcy5sZW5ndGgpXG5cbiAgICAjIGRvIHRoZXNlIGFsd2F5c1xuICAgIGNsZWFySW50ZXJ2YWwgQGludGVydmFsXG4gICAgQHN0b3BUaW1lID0gQGdldFRpbWUoKVxuICAgIEB0aW1lUnVubmluZyA9IGZhbHNlXG4gICAgQHRpbWVyU3RvcHBlZCA9IHRydWVcbiAgICBAZmxvYXRPZmYoKVxuICAgIEB1cGRhdGVDb3VudGRvd24oKVxuXG4gICAgIyBkbyB0aGVzZSBpZiBpdCdzIG5vdCBhIHNpbXBsZSBzdG9wXG4gICAgI2lmIG5vdCBldmVudD8uc2ltcGxlU3RvcFxuICAgICAgI1V0aWxzLmZsYXNoKClcblxuXG4gIGF1dG9zdG9wVGVzdDogLT5cbiAgICBVdGlscy5mbGFzaCgpXG4gICAgY2xlYXJJbnRlcnZhbCBAaW50ZXJ2YWxcbiAgICBAc3RvcFRpbWUgPSBAZ2V0VGltZSgpXG4gICAgQGF1dG9zdG9wcGVkID0gdHJ1ZVxuICAgIEB0aW1lclN0b3BwZWQgPSB0cnVlXG4gICAgQHRpbWVSdW5uaW5nID0gZmFsc2VcbiAgICBAJGVsLmZpbmQoXCIuZ3JpZF9lbGVtZW50XCIpLnNsaWNlKEBhdXRvc3RvcC0xLEBhdXRvc3RvcCkuYWRkQ2xhc3MgXCJlbGVtZW50X2xhc3RcIiAjanF1ZXJ5IGlzIHdlaXJkIHNvbWV0aW1lc1xuICAgIEBsYXN0QXR0ZW1wdGVkID0gQGF1dG9zdG9wXG4gICAgQHRpbWVvdXQgPSBzZXRUaW1lb3V0KEByZW1vdmVVbmRvLCAzMDAwKSAjIGdpdmUgdGhlbSAzIHNlY29uZHMgdG8gdW5kby4gbWFnaWMgbnVtYmVyXG4gICAgVXRpbHMudG9wQWxlcnQgQHRleHQuYXV0b3N0b3BcblxuICByZW1vdmVVbmRvOiA9PlxuICAgIEB1bmRvYWJsZSA9IGZhbHNlXG4gICAgQHVwZGF0ZU1vZGUgXCJkaXNhYmxlZFwiXG4gICAgY2xlYXJUaW1lb3V0KEB0aW1lb3V0KVxuXG4gIHVuQXV0b3N0b3BUZXN0OiAtPlxuICAgIEBpbnRlcnZhbCA9IHNldEludGVydmFsKEB1cGRhdGVDb3VudGRvd24sMTAwMCApICMgbWFnaWMgbnVtYmVyXG4gICAgQHVwZGF0ZUNvdW50ZG93bigpXG4gICAgQGF1dG9zdG9wcGVkID0gZmFsc2VcbiAgICBAbGFzdEF0dGVtcHRlZCA9IDBcbiAgICBAJGVsLmZpbmQoXCIuZ3JpZF9lbGVtZW50XCIpLnNsaWNlKEBhdXRvc3RvcC0xLEBhdXRvc3RvcCkucmVtb3ZlQ2xhc3MgXCJlbGVtZW50X2xhc3RcIlxuICAgIEB0aW1lUnVubmluZyA9IHRydWVcbiAgICBAdXBkYXRlTW9kZSBcIm1hcmtcIlxuICAgIFV0aWxzLnRvcEFsZXJ0IHQoXCJHcmlkUnVuVmlldy5tZXNzYWdlLmF1dG9zdG9wX2NhbmNlbFwiKVxuXG4gIHVwZGF0ZUNvdW50ZG93bjogPT5cbiAgICAjIHNvbWV0aW1lcyB0aGUgXCJ0aWNrXCIgZG9lc24ndCBoYXBwZW4gd2l0aGluIGEgc2Vjb25kXG4gICAgQHRpbWVFbGFwc2VkID0gTWF0aC5taW4oQGdldFRpbWUoKSAtIEBzdGFydFRpbWUsIEB0aW1lcilcblxuICAgIEB0aW1lUmVtYWluaW5nID0gQHRpbWVyIC0gQHRpbWVFbGFwc2VkXG5cbiAgICBAJGVsLmZpbmQoXCIudGltZXJcIikuaHRtbCBAdGltZVJlbWFpbmluZ1xuXG4gICAgaWYgQHRpbWVSdW5uaW5nIGlzIHRydWUgYW5kIEBjYXB0dXJlTGFzdEF0dGVtcHRlZCBhbmQgQHRpbWVSZW1haW5pbmcgPD0gMFxuICAgICAgICBAc3RvcFRpbWVyKHNpbXBsZVN0b3A6dHJ1ZSlcbiAgICAgICAgVXRpbHMuYmFja2dyb3VuZCBcInJlZFwiXG4gICAgICAgIF8uZGVsYXkoXG4gICAgICAgICAgPT5cbiAgICAgICAgICAgIGFsZXJ0IEB0ZXh0LnRvdWNoTGFzdEl0ZW1cbiAgICAgICAgICAgIFV0aWxzLmJhY2tncm91bmQgXCJcIlxuICAgICAgICAsIDFlMykgIyBtYWdpYyBudW1iZXJcblxuICAgICAgICBAdXBkYXRlTW9kZSBldmVudCwgXCJsYXN0XCJcblxuXG4gICAgaWYgQGNhcHR1cmVJdGVtQXRUaW1lICYmICFAZ290SW50ZXJtZWRpYXRlICYmICFAbWludXRlTWVzc2FnZSAmJiBAdGltZUVsYXBzZWQgPj0gQGNhcHR1cmVBZnRlclNlY29uZHNcbiAgICAgIFV0aWxzLmZsYXNoIFwieWVsbG93XCJcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IHQoXCJwbGVhc2Ugc2VsZWN0IHRoZSBpdGVtIHRoZSBjaGlsZCBpcyBjdXJyZW50bHkgYXR0ZW1wdGluZ1wiKVxuICAgICAgQG1pbnV0ZU1lc3NhZ2UgPSB0cnVlXG4gICAgICBAbW9kZSA9IFwibWludXRlSXRlbVwiXG5cblxuICB1cGRhdGVNb2RlOiAoIG1vZGUgPSBudWxsICkgPT5cbiAgICAjIGRvbnQnIGNoYW5nZSB0aGUgbW9kZSBpZiB0aGUgdGltZSBoYXMgbmV2ZXIgYmVlbiBzdGFydGVkXG4gICAgaWYgKG1vZGU9PW51bGwgJiYgQHRpbWVFbGFwc2VkID09IDAgJiYgbm90IEBkYXRhRW50cnkpIHx8IG1vZGUgPT0gXCJkaXNhYmxlZFwiXG4gICAgICBAbW9kZUJ1dHRvbi5zZXRWYWx1ZSBudWxsXG4gICAgZWxzZSBpZiBtb2RlPyAjIG1hbnVhbGx5IGNoYW5nZSB0aGUgbW9kZVxuICAgICAgQG1vZGUgPSBtb2RlXG4gICAgICBAbW9kZUJ1dHRvbi5zZXRWYWx1ZSBAbW9kZVxuICAgIGVsc2UgIyBoYW5kbGUgYSBjbGljayBldmVudFxuICAgICAgQG1vZGUgPSBAbW9kZUJ1dHRvbi5nZXRWYWx1ZSgpXG5cbiAgZ2V0VGltZTogLT5cbiAgICBNYXRoLnJvdW5kKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgLyAxMDAwKVxuXG4gIHJlc2V0VmFyaWFibGVzOiAtPlxuXG4gICAgQHRpbWVyICAgID0gcGFyc2VJbnQoQG1vZGVsLmdldChcInRpbWVyXCIpKSB8fCAwXG4gICAgQHVudGltZWQgID0gQHRpbWVyID09IDAgfHwgQGRhdGFFbnRyeSAjIERvIG5vdCBzaG93IHRoZSB0aW1lciBpZiBpdCdzIGRpc2FzYmxlZCBvciBkYXRhIGVudHJ5IG1vZGVcblxuICAgIEBnb3RNaW51dGVJdGVtID0gZmFsc2VcbiAgICBAbWludXRlTWVzc2FnZSA9IGZhbHNlXG4gICAgQGl0ZW1BdFRpbWUgPSBudWxsXG5cbiAgICBAdGltZUludGVybWVkaWF0ZUNhcHR1cmVkID0gbnVsbFxuXG4gICAgQG1hcmtSZWNvcmQgPSBbXVxuXG4gICAgQHRpbWVyU3RvcHBlZCA9IGZhbHNlXG5cbiAgICBAc3RhcnRUaW1lID0gMFxuICAgIEBzdG9wVGltZSAgPSAwXG4gICAgQHRpbWVFbGFwc2VkID0gMFxuICAgIEB0aW1lUmVtYWluaW5nID0gQHRpbWVyXG4gICAgQGxhc3RBdHRlbXB0ZWQgPSAwXG5cbiAgICBAaW50ZXJ2YWwgPSBudWxsXG5cbiAgICBAdW5kb2FibGUgPSB0cnVlXG5cbiAgICBAdGltZVJ1bm5pbmcgPSBmYWxzZVxuXG5cbiAgICBAaXRlbXMgICAgPSBfLmNvbXBhY3QoQG1vZGVsLmdldChcIml0ZW1zXCIpKSAjIG1pbGQgc2FuaXRpemF0aW9uLCBoYXBwZW5zIGF0IHNhdmUgdG9vXG5cbiAgICBAaXRlbU1hcCA9IFtdXG4gICAgQG1hcEl0ZW0gPSBbXVxuXG4gICAgaWYgQG1vZGVsLmhhcyhcInJhbmRvbWl6ZVwiKSAmJiBAbW9kZWwuZ2V0KFwicmFuZG9taXplXCIpXG4gICAgICBAaXRlbU1hcCA9IEBpdGVtcy5tYXAgKHZhbHVlLCBpKSAtPiBpXG5cbiAgICAgIEBpdGVtcy5mb3JFYWNoIChpdGVtLCBpKSAtPlxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogQGl0ZW1zLmxlbmd0aClcbiAgICAgICAgdGVtcFZhbHVlID0gQGl0ZW1NYXBbdGVtcF1cbiAgICAgICAgQGl0ZW1NYXBbdGVtcF0gPSBAaXRlbU1hcFtpXVxuICAgICAgICBAaXRlbU1hcFtpXSA9IHRlbXBWYWx1ZVxuICAgICAgLCBAXG5cbiAgICAgIEBpdGVtTWFwLmZvckVhY2ggKGl0ZW0sIGkpIC0+XG4gICAgICAgIEBtYXBJdGVtW0BpdGVtTWFwW2ldXSA9IGlcbiAgICAgICwgQFxuICAgIGVsc2VcbiAgICAgIEBpdGVtcy5mb3JFYWNoIChpdGVtLCBpKSAtPlxuICAgICAgICBAaXRlbU1hcFtpXSA9IGlcbiAgICAgICAgQG1hcEl0ZW1baV0gPSBpXG4gICAgICAsIEBcblxuICAgIGlmICFAY2FwdHVyZUxhc3RBdHRlbXB0ZWQgJiYgIUBjYXB0dXJlSXRlbUF0VGltZVxuICAgICAgQG1vZGUgPSBcIm1hcmtcIlxuICAgIGVsc2VcbiAgICAgIEBtb2RlID0gXCJkaXNhYmxlZFwiXG5cbiAgICBAbW9kZSA9IFwibWFya1wiIGlmIEBkYXRhRW50cnlcblxuICAgIEBncmlkT3V0cHV0ID0gQGl0ZW1zLm1hcCAtPiAnY29ycmVjdCdcbiAgICBAY29sdW1ucyAgPSBwYXJzZUludChAbW9kZWwuZ2V0KFwiY29sdW1uc1wiKSkgfHwgM1xuXG4gICAgQGF1dG9zdG9wID0gaWYgQHVudGltZWQgdGhlbiAwIGVsc2UgKHBhcnNlSW50KEBtb2RlbC5nZXQoXCJhdXRvc3RvcFwiKSkgfHwgMClcbiAgICBAYXV0b3N0b3BwZWQgPSBmYWxzZVxuXG4gICAgQCRlbC5maW5kKFwiLmdyaWRfZWxlbWVudFwiKS5yZW1vdmVDbGFzcyhcImVsZW1lbnRfd3JvbmdcIikucmVtb3ZlQ2xhc3MoXCJlbGVtZW50X2xhc3RcIikuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKVxuICAgIEAkZWwuZmluZChcInRhYmxlXCIpLmFkZENsYXNzKFwiZGlzYWJsZWRcIilcblxuICAgIEAkZWwuZmluZChcIi50aW1lclwiKS5odG1sIEB0aW1lclxuXG4gICAgdW5sZXNzIEBkYXRhRW50cnlcblxuICAgICAgcHJldmlvdXMgPSBAcGFyZW50LnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcbiAgICAgIGlmIHByZXZpb3VzXG5cbiAgICAgICAgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkICAgICA9IHByZXZpb3VzLmNhcHR1cmVfbGFzdF9hdHRlbXB0ZWRcbiAgICAgICAgQGl0ZW1BdFRpbWUgICAgICAgICAgICAgICA9IHByZXZpb3VzLml0ZW1fYXRfdGltZVxuICAgICAgICBAdGltZUludGVybWVkaWF0ZUNhcHR1cmVkID0gcHJldmlvdXMudGltZV9pbnRlcm1lZGlhdGVfY2FwdHVyZWRcbiAgICAgICAgQGNhcHR1cmVJdGVtQXRUaW1lICAgICAgICA9IHByZXZpb3VzLmNhcHR1cmVfaXRlbV9hdF90aW1lXG4gICAgICAgIEBhdXRvc3RvcCAgICAgICAgICAgICAgICAgPSBwcmV2aW91cy5hdXRvX3N0b3BcbiAgICAgICAgQGxhc3RBdHRlbXB0ZWQgICAgICAgICAgICA9IHByZXZpb3VzLmF0dGVtcHRlZFxuICAgICAgICBAdGltZVJlbWFpbmluZyAgICAgICAgICAgID0gcHJldmlvdXMudGltZV9yZW1haW5cbiAgICAgICAgQG1hcmtSZWNvcmQgICAgICAgICAgICAgICA9IHByZXZpb3VzLm1hcmtfcmVjb3JkXG5cbiAgICBAdXBkYXRlTW9kZSBAbW9kZSBpZiBAbW9kZUJ1dHRvbj9cblxuICBpMThuOiAtPlxuXG4gICAgQHRleHQgPVxuICAgICAgYXV0b3N0b3AgICAgICAgICAgIDogdChcIkdyaWRSdW5WaWV3Lm1lc3NhZ2UuYXV0b3N0b3BcIilcbiAgICAgIHRvdWNoTGFzdEl0ZW0gICAgICA6IHQoXCJHcmlkUnVuVmlldy5tZXNzYWdlLnRvdWNoX2xhc3RfaXRlbVwiKVxuICAgICAgc3VidGVzdE5vdENvbXBsZXRlIDogdChcIkdyaWRSdW5WaWV3Lm1lc3NhZ2Uuc3VidGVzdF9ub3RfY29tcGxldGVcIilcblxuICAgICAgaW5wdXRNb2RlICAgICA6IHQoXCJHcmlkUnVuVmlldy5sYWJlbC5pbnB1dF9tb2RlXCIpXG4gICAgICB0aW1lUmVtYWluaW5nICA6IHQoXCJHcmlkUnVuVmlldy5sYWJlbC50aW1lX3JlbWFpbmluZ1wiKVxuICAgICAgd2FzQXV0b3N0b3BwZWQgOiB0KFwiR3JpZFJ1blZpZXcubGFiZWwud2FzX2F1dG9zdG9wcGVkXCIpXG5cbiAgICAgIG1hcmsgICAgICAgICAgOiB0KFwiR3JpZFJ1blZpZXcuYnV0dG9uLm1hcmtcIilcbiAgICAgIHN0YXJ0ICAgICAgICAgOiB0KFwiR3JpZFJ1blZpZXcuYnV0dG9uLnN0YXJ0XCIpXG4gICAgICBzdG9wICAgICAgICAgIDogdChcIkdyaWRSdW5WaWV3LmJ1dHRvbi5zdG9wXCIpXG4gICAgICByZXN0YXJ0ICAgICAgIDogdChcIkdyaWRSdW5WaWV3LmJ1dHRvbi5yZXN0YXJ0XCIpXG4gICAgICBsYXN0QXR0ZW1wdGVkIDogdChcIkdyaWRSdW5WaWV3LmJ1dHRvbi5sYXN0X2F0dGVtcHRlZFwiKVxuXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAaTE4bigpXG5cbiAgICBAZm9udFN0eWxlID0gXCJzdHlsZT1cXFwiZm9udC1mYW1pbHk6ICN7QG1vZGVsLmdldCgnZm9udEZhbWlseScpfSAhaW1wb3J0YW50O1xcXCJcIiBpZiBAbW9kZWwuZ2V0KFwiZm9udEZhbWlseVwiKSAhPSBcIlwiXG5cbiAgICBAY2FwdHVyZUFmdGVyU2Vjb25kcyAgPSBpZiBAbW9kZWwuaGFzKFwiY2FwdHVyZUFmdGVyU2Vjb25kc1wiKSAgdGhlbiBAbW9kZWwuZ2V0KFwiY2FwdHVyZUFmdGVyU2Vjb25kc1wiKSAgZWxzZSAwXG4gICAgQGNhcHR1cmVJdGVtQXRUaW1lICAgID0gaWYgQG1vZGVsLmhhcyhcImNhcHR1cmVJdGVtQXRUaW1lXCIpICAgIHRoZW4gQG1vZGVsLmdldChcImNhcHR1cmVJdGVtQXRUaW1lXCIpICAgIGVsc2UgZmFsc2VcbiAgICBAY2FwdHVyZUxhc3RBdHRlbXB0ZWQgPSBpZiBAbW9kZWwuaGFzKFwiY2FwdHVyZUxhc3RBdHRlbXB0ZWRcIikgdGhlbiBAbW9kZWwuZ2V0KFwiY2FwdHVyZUxhc3RBdHRlbXB0ZWRcIikgZWxzZSB0cnVlXG4gICAgQGVuZE9mTGluZSAgICAgICAgICAgID0gaWYgQG1vZGVsLmhhcyhcImVuZE9mTGluZVwiKSAgICAgICAgICAgIHRoZW4gQG1vZGVsLmdldChcImVuZE9mTGluZVwiKSAgICAgICAgICAgIGVsc2UgdHJ1ZVxuXG4gICAgQGxheW91dE1vZGUgPSBpZiBAbW9kZWwuaGFzKFwibGF5b3V0TW9kZVwiKSB0aGVuIEBtb2RlbC5nZXQoXCJsYXlvdXRNb2RlXCIpIGVsc2UgXCJmaXhlZFwiXG4gICAgQGZvbnRTaXplICAgPSBpZiBAbW9kZWwuaGFzKFwiZm9udFNpemVcIikgICB0aGVuIEBtb2RlbC5nZXQoXCJmb250U2l6ZVwiKSAgIGVsc2UgXCJub3JtYWxcIlxuXG4gICAgaWYgQGZvbnRTaXplID09IFwic21hbGxcIlxuICAgICAgZm9udFNpemVDbGFzcyA9IFwiZm9udF9zaXplX3NtYWxsXCJcbiAgICBlbHNlXG4gICAgICBmb250U2l6ZUNsYXNzID0gXCJcIlxuXG4gICAgQHJ0bCA9IEBtb2RlbC5nZXRCb29sZWFuIFwicnRsXCJcbiAgICBAJGVsLmFkZENsYXNzIFwicnRsLWdyaWRcIiBpZiBAcnRsXG5cbiAgICBAdG90YWxUaW1lID0gQG1vZGVsLmdldChcInRpbWVyXCIpIHx8IDBcblxuICAgIEBtb2RlSGFuZGxlcnMgPVxuICAgICAgXCJtYXJrXCIgICAgICAgOiBAbWFya0hhbmRsZXJcbiAgICAgIFwibGFzdFwiICAgICAgIDogQGxhc3RIYW5kbGVyXG4gICAgICBcIm1pbnV0ZUl0ZW1cIiA6IEBpbnRlcm1lZGlhdGVJdGVtSGFuZGxlclxuICAgICAgZGlzYWJsZWQgICAgIDogJC5ub29wXG5cbiAgICBAZGF0YUVudHJ5ID0gb3B0aW9ucy5kYXRhRW50cnlcblxuICAgIEBtb2RlbCAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCA9IG9wdGlvbnMucGFyZW50XG5cbiAgICBAcmVzZXRWYXJpYWJsZXMoKVxuXG4gICAgQGdyaWRFbGVtZW50ICAgICAgICAgPSBfLnRlbXBsYXRlIFwiPHRkPjxidXR0b24gZGF0YS1sYWJlbD0ne3tsYWJlbH19JyBkYXRhLWluZGV4PSd7e2l9fScgY2xhc3M9J2dyaWRfZWxlbWVudCAje2ZvbnRTaXplQ2xhc3N9JyAje0Bmb250U3R5bGUgfHwgXCJcIn0+e3tsYWJlbH19PC9idXR0b24+PC90ZD5cIlxuICAgIEB2YXJpYWJsZUdyaWRFbGVtZW50ID0gXy50ZW1wbGF0ZSBcIjxidXR0b24gZGF0YS1sYWJlbD0ne3tsYWJlbH19JyBkYXRhLWluZGV4PSd7e2l9fScgY2xhc3M9J2dyaWRfZWxlbWVudCAje2ZvbnRTaXplQ2xhc3N9JyAje0Bmb250U3R5bGUgfHwgXCJcIn0+e3tsYWJlbH19PC9idXR0b24+XCJcblxuICAgIGlmIEBsYXlvdXRNb2RlID09IFwiZml4ZWRcIlxuICAgICAgQGVuZE9mR3JpZExpbmUgPSBfLnRlbXBsYXRlIFwiPHRkPjxidXR0b24gZGF0YS1pbmRleD0ne3tpfX0nIGNsYXNzPSdlbmRfb2ZfZ3JpZF9saW5lJz4qPC9idXR0b24+PC90ZD5cIlxuICAgIGVsc2VcbiAgICAgIEBlbmRPZkdyaWRMaW5lID0gXy50ZW1wbGF0ZSBcIlwiXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgZG9uZSA9IDBcblxuICAgIHN0YXJ0VGltZXJIVE1MID0gXCI8ZGl2IGNsYXNzPSd0aW1lcl93cmFwcGVyJz48YnV0dG9uIGNsYXNzPSdzdGFydF90aW1lIHRpbWUnPiN7QHRleHQuc3RhcnR9PC9idXR0b24+PGRpdiBjbGFzcz0ndGltZXInPiN7QHRpbWVyfTwvZGl2PjwvZGl2PlwiXG5cbiAgICBkaXNhYmxpbmcgPSBcImRpc2FibGVkXCIgdW5sZXNzIEB1bnRpbWVkXG5cbiAgICBkaXNwbGF5UnRsID0gXCJydGxfbW9kZVwiIGlmIEBydGxcblxuICAgIGh0bWwgPSBpZiBub3QgQHVudGltZWQgdGhlbiBzdGFydFRpbWVySFRNTCBlbHNlIFwiXCJcblxuICAgIGdyaWRIVE1MID0gXCJcIlxuXG4gICAgaWYgQGxheW91dE1vZGUgPT0gXCJmaXhlZFwiXG4gICAgICBncmlkSFRNTCArPSBcIjx0YWJsZSBjbGFzcz0nZ3JpZCAje2Rpc2FibGluZ30gI3tkaXNwbGF5UnRsfHwnJ30nPlwiXG4gICAgICBmaXJzdFJvdyA9IHRydWVcbiAgICAgIGxvb3BcbiAgICAgICAgYnJlYWsgaWYgZG9uZSA+IEBpdGVtcy5sZW5ndGhcbiAgICAgICAgZ3JpZEhUTUwgKz0gXCI8dHI+XCJcbiAgICAgICAgZm9yIGkgaW4gWzEuLkBjb2x1bW5zXVxuICAgICAgICAgIGlmIGRvbmUgPCBAaXRlbXMubGVuZ3RoXG4gICAgICAgICAgICBncmlkSFRNTCArPSBAZ3JpZEVsZW1lbnQgeyBsYWJlbCA6IF8uZXNjYXBlKEBpdGVtc1tAaXRlbU1hcFtkb25lXV0pLCBpOiBkb25lKzEgfVxuICAgICAgICAgIGRvbmUrK1xuICAgICAgICAjIGRvbid0IHNob3cgdGhlIHNraXAgcm93IGJ1dHRvbiBmb3IgdGhlIGZpcnN0IHJvd1xuICAgICAgICBpZiBmaXJzdFJvd1xuICAgICAgICAgIGdyaWRIVE1MICs9IFwiPHRkPjwvdGQ+XCIgaWYgZG9uZSA8ICggQGl0ZW1zLmxlbmd0aCArIDEgKSAmJiBAZW5kT2ZMaW5lXG4gICAgICAgICAgZmlyc3RSb3cgPSBmYWxzZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZ3JpZEhUTUwgKz0gQGVuZE9mR3JpZExpbmUoe2k6ZG9uZX0pIGlmIGRvbmUgPCAoIEBpdGVtcy5sZW5ndGggKyAxICkgJiYgQGVuZE9mTGluZVxuXG4gICAgICAgIGdyaWRIVE1MICs9IFwiPC90cj5cIlxuICAgICAgZ3JpZEhUTUwgKz0gXCI8L3RhYmxlPlwiXG4gICAgZWxzZVxuICAgICAgZ3JpZEhUTUwgKz0gXCI8ZGl2IGNsYXNzPSdncmlkICN7ZGlzYWJsaW5nfSAje2Rpc3BsYXlSdGx8fCcnfSc+XCJcbiAgICAgIGZvciBpdGVtLCBpIGluIEBpdGVtc1xuICAgICAgICBncmlkSFRNTCArPSBAdmFyaWFibGVHcmlkRWxlbWVudFxuICAgICAgICAgIFwibGFiZWxcIiA6IF8uZXNjYXBlKEBpdGVtc1tAaXRlbU1hcFtpXV0pXG4gICAgICAgICAgXCJpXCIgICAgIDogaSsxXG4gICAgICBncmlkSFRNTCArPSBcIjwvZGl2PlwiXG4gICAgaHRtbCArPSBncmlkSFRNTFxuICAgIHN0b3BUaW1lckhUTUwgPSBcIjxkaXYgY2xhc3M9J3RpbWVyX3dyYXBwZXInPjxidXR0b24gY2xhc3M9J3N0b3BfdGltZSB0aW1lJz4je0B0ZXh0LnN0b3B9PC9idXR0b24+PC9kaXY+XCJcblxuICAgIHJlc2V0QnV0dG9uID0gXCJcbiAgICAgIDxkaXY+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J3Jlc3RhcnQgY29tbWFuZCc+I3tAdGV4dC5yZXN0YXJ0fTwvYnV0dG9uPlxuICAgICAgICA8YnI+XG4gICAgICA8L2Rpdj5cbiAgICBcIlxuXG4gICAgI1xuICAgICMgTW9kZSBzZWxlY3RvclxuICAgICNcblxuICAgICMgaWYgYW55IG90aGVyIG9wdGlvbiBpcyBhdmFpYWxiZSBvdGhlciB0aGFuIG1hcmssIHRoZW4gc2hvdyB0aGUgc2VsZWN0b3JcbiAgICBpZiBAY2FwdHVyZUxhc3RBdHRlbXB0ZWQgfHwgQGNhcHR1cmVJdGVtQXRUaW1lXG5cbiAgICAgIEBtb2RlQnV0dG9uPy5jbG9zZSgpXG5cbiAgICAgIGJ1dHRvbkNvbmZpZyA9XG4gICAgICAgIG9wdGlvbnMgOiBbXVxuICAgICAgICBtb2RlICAgIDogXCJzaW5nbGVcIlxuXG4gICAgICBidXR0b25Db25maWcub3B0aW9ucy5wdXNoIHtcbiAgICAgICAgbGFiZWwgOiBAdGV4dC5tYXJrXG4gICAgICAgIHZhbHVlIDogXCJtYXJrXCJcbiAgICAgIH1cblxuICAgICAgYnV0dG9uQ29uZmlnLm9wdGlvbnMucHVzaCB7XG4gICAgICAgIGxhYmVsIDogdCggXCJpdGVtIGF0IF9fc2Vjb25kc19fIHNlY29uZHNcIiwgc2Vjb25kcyA6IEBjYXB0dXJlQWZ0ZXJTZWNvbmRzIClcbiAgICAgICAgdmFsdWUgOiBcIm1pbnV0ZUl0ZW1cIlxuICAgICAgfSBpZiBAY2FwdHVyZUl0ZW1BdFRpbWVcblxuICAgICAgYnV0dG9uQ29uZmlnLm9wdGlvbnMucHVzaCB7XG4gICAgICAgIGxhYmVsIDogQHRleHQubGFzdEF0dGVtcHRlZFxuICAgICAgICB2YWx1ZSA6IFwibGFzdFwiXG4gICAgICB9IGlmIEBjYXB0dXJlTGFzdEF0dGVtcHRlZFxuXG4gICAgICBAbW9kZUJ1dHRvbiA9IG5ldyBCdXR0b25WaWV3IGJ1dHRvbkNvbmZpZ1xuICAgICAgQGxpc3RlblRvIEBtb2RlQnV0dG9uLCBcImNoYW5nZSBjbGlja1wiLCBAdXBkYXRlTW9kZVxuICAgICAgbW9kZVNlbGVjdG9yID0gXCJcbiAgICAgICAgPGRpdiBjbGFzcz0nZ3JpZF9tb2RlX3dyYXBwZXIgcXVlc3Rpb24gY2xlYXJmaXgnPlxuICAgICAgICAgIDxsYWJlbD4je0B0ZXh0LmlucHV0TW9kZX08L2xhYmVsPjxicj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdtb2RlLWJ1dHRvbic+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgXCJcblxuICAgIGRhdGFFbnRyeSA9IFwiXG4gICAgICA8dGFibGUgY2xhc3M9J2NsYXNzX3RhYmxlJz5cblxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPiN7QHRleHQud2FzQXV0b3N0b3BwZWR9PC90ZD48dGQ+PGlucHV0IHR5cGU9J2NoZWNrYm94JyBjbGFzcz0nZGF0YV9hdXRvc3RvcHBlZCc+PC90ZD5cbiAgICAgICAgPC90cj5cblxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPiN7QHRleHQudGltZVJlbWFpbmluZ308L3RkPjx0ZD48aW5wdXQgdHlwZT0nbnVtYmVyJyBjbGFzcz0nZGF0YV90aW1lX3JlbWFpbic+PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgIDwvdGFibGU+XG4gICAgXCJcblxuICAgIGh0bWwgKz0gXCJcbiAgICAgICN7aWYgbm90IEB1bnRpbWVkIHRoZW4gc3RvcFRpbWVySFRNTCBlbHNlIFwiXCJ9XG4gICAgICAje2lmIG5vdCBAdW50aW1lZCB0aGVuIHJlc2V0QnV0dG9uIGVsc2UgXCJcIn1cbiAgICAgICN7bW9kZVNlbGVjdG9yfVxuICAgICAgI3soZGF0YUVudHJ5IGlmIEBkYXRhRW50cnkpIHx8ICcnfVxuICAgIFwiXG5cbiAgICBAJGVsLmh0bWwgaHRtbFxuXG4gICAgQG1vZGVCdXR0b24uc2V0RWxlbWVudCBAJGVsLmZpbmQgXCIubW9kZS1idXR0b25cIlxuICAgIEBtb2RlQnV0dG9uLnJlbmRlcigpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgICBAdHJpZ2dlciBcInJlYWR5XCJcblxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG5cbiAgICAgIHByZXZpb3VzID0gQHBhcmVudC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG4gICAgICBpZiBwcmV2aW91c1xuICAgICAgICBAbWFya1JlY29yZCA9IHByZXZpb3VzLm1hcmtfcmVjb3JkXG5cbiAgICAgICAgZm9yIGl0ZW0sIGkgaW4gQG1hcmtSZWNvcmRcbiAgICAgICAgICBAbWFya0VsZW1lbnQgaXRlbSwgbnVsbCwgJ3BvcHVsYXRlJ1xuXG4gICAgICAgIEBpdGVtQXRUaW1lID0gcHJldmlvdXMuaXRlbV9hdF90aW1lXG4gICAgICAgICR0YXJnZXQgPSBAJGVsLmZpbmQoXCIuZ3JpZF9lbGVtZW50W2RhdGEtaW5kZXg9I3tAaXRlbUF0VGltZX1dXCIpXG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MgXCJlbGVtZW50X21pbnV0ZVwiXG5cbiAgICAgICAgQGxhc3RBdHRlbXB0ZWQgPSBwcmV2aW91cy5hdHRlbXB0ZWRcbiAgICAgICAgJHRhcmdldCA9IEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRbZGF0YS1pbmRleD0je0BsYXN0QXR0ZW1wdGVkfV1cIilcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyBcImVsZW1lbnRfbGFzdFwiXG5cbiAgaXNWYWxpZDogLT5cbiAgICAjIFN0b3AgdGltZXIgaWYgc3RpbGwgcnVubmluZy4gSXNzdWUgIzI0MFxuICAgIEBzdG9wVGltZXIoKSBpZiBAdGltZVJ1bm5pbmdcblxuICAgIGlmIHBhcnNlSW50KEBsYXN0QXR0ZW1wdGVkKSBpcyBAaXRlbXMubGVuZ3RoIGFuZCBAdGltZVJlbWFpbmluZyBpcyAwXG5cbiAgICAgIGl0ZW0gPSBAaXRlbXNbQGl0ZW1zLmxlbmd0aC0xXVxuICAgICAgaWYgY29uZmlybSh0KFwiR3JpZFJ1blZpZXcubWVzc2FnZS5sYXN0X2l0ZW1fY29uZmlybVwiLCBpdGVtOml0ZW0pKVxuICAgICAgICBAdXBkYXRlTW9kZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBAbWVzc2FnZXMgPSBpZiBAbWVzc2FnZXM/LnB1c2ggdGhlbiBAbWVzc2FnZXMuY29uY2F0KFttc2ddKSBlbHNlIFttc2ddXG4gICAgICAgIEB1cGRhdGVNb2RlIFwibGFzdFwiXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgcmV0dXJuIGZhbHNlIGlmIEBjYXB0dXJlTGFzdEF0dGVtcHRlZCAmJiBAbGFzdEF0dGVtcHRlZCA9PSAwXG4gICAgIyBtaWdodCBuZWVkIHRvIGxldCBpdCBrbm93IGlmIGl0J3MgdGltZWQgb3IgdW50aW1lZCB0b28gOjpzaHJ1Zzo6XG4gICAgcmV0dXJuIGZhbHNlIGlmIEB0aW1lUnVubmluZyA9PSB0cnVlXG4gICAgcmV0dXJuIGZhbHNlIGlmIEB0aW1lciAhPSAwICYmIEB0aW1lUmVtYWluaW5nID09IEB0aW1lclxuICAgIHRydWVcblxuICBzaG93RXJyb3JzOiAtPlxuICAgIG1lc3NhZ2VzID0gQG1lc3NhZ2VzIHx8IFtdXG4gICAgQG1lc3NhZ2VzID0gW11cblxuICAgIHRpbWVySGFzbnRSdW4gICAgPSBAdGltZXIgIT0gMCAmJiBAdGltZVJlbWFpbmluZyA9PSBAdGltZXJcbiAgICBub0xhc3RJdGVtICAgICAgID0gQGNhcHR1cmVMYXN0QXR0ZW1wdGVkICYmIEBsYXN0QXR0ZW1wdGVkID09IDBcbiAgICB0aW1lU3RpbGxSdW5uaW5nID0gQHRpbWVSdW5pbmcgPT0gdHJ1ZVxuXG4gICAgaWYgdGltZXJIYXNudFJ1blxuICAgICAgbWVzc2FnZXMucHVzaCBAdGV4dC5zdWJ0ZXN0Tm90Q29tcGxldGVcblxuICAgIGlmIG5vTGFzdEl0ZW0gJiYgbm90IHRpbWVySGFzbnRSdW5cbiAgICAgIG1lc3NhZ2VzLnB1c2ggQHRleHQudG91Y2hMYXN0SXRlbVxuICAgICAgQHVwZGF0ZU1vZGUgXCJsYXN0XCJcblxuICAgIGlmIHRpbWVTdGlsbFJ1bm5pbmdcbiAgICAgIG1lc3NhZ2VzLnB1c2ggQHRleHQudGltZVN0aWxsUnVubmluZ1xuXG4gICAgVXRpbHMubWlkQWxlcnQgbWVzc2FnZXMuam9pbihcIjxicj5cIiksIDMwMDAgIyBtYWdpYyBudW1iZXJcblxuICBnZXRSZXN1bHQ6IC0+XG4gICAgY29tcGxldGVSZXN1bHRzID0gW11cbiAgICBpdGVtUmVzdWx0cyA9IFtdXG4gICAgQGxhc3RBdHRlbXB0ZWQgPSBAaXRlbXMubGVuZ3RoIGlmIG5vdCBAY2FwdHVyZUxhc3RBdHRlbXB0ZWRcblxuICAgIGZvciBpdGVtLCBpIGluIEBpdGVtc1xuXG4gICAgICBpZiBAbWFwSXRlbVtpXSA8IEBsYXN0QXR0ZW1wdGVkXG4gICAgICAgIGl0ZW1SZXN1bHRzW2ldID1cbiAgICAgICAgICBpdGVtUmVzdWx0IDogQGdyaWRPdXRwdXRbQG1hcEl0ZW1baV1dXG4gICAgICAgICAgaXRlbUxhYmVsICA6IGl0ZW1cbiAgICAgIGVsc2VcbiAgICAgICAgaXRlbVJlc3VsdHNbaV0gPVxuICAgICAgICAgIGl0ZW1SZXN1bHQgOiBcIm1pc3NpbmdcIlxuICAgICAgICAgIGl0ZW1MYWJlbCA6IEBpdGVtc1tAbWFwSXRlbVtpXV1cblxuICAgIEBsYXN0QXR0ZW1wdGVkID0gZmFsc2UgaWYgbm90IEBjYXB0dXJlTGFzdEF0dGVtcHRlZFxuXG4gICAgaWYgQGRhdGFFbnRyeVxuICAgICAgYXV0b3N0b3BwZWQgPSBAJGVsLmZpbmQoXCIuZGF0YV9hdXRvc3RvcHBlZFwiKS5pcyhcIjpjaGVja2VkXCIpXG4gICAgICB0aW1lUmVtYWluaW5nID0gcGFyc2VJbnQoQCRlbC5maW5kKFwiLmRhdGFfdGltZV9yZW1haW5cIikudmFsKCkpXG4gICAgZWxzZVxuICAgICAgYXV0b3N0b3BwZWQgICA9IEBhdXRvc3RvcHBlZFxuICAgICAgdGltZVJlbWFpbmluZyA9IEB0aW1lUmVtYWluaW5nXG5cbiAgICByZXN1bHQgPVxuICAgICAgXCJjYXB0dXJlX2xhc3RfYXR0ZW1wdGVkXCIgICAgIDogQGNhcHR1cmVMYXN0QXR0ZW1wdGVkXG4gICAgICBcIml0ZW1fYXRfdGltZVwiICAgICAgICAgICAgICAgOiBAaXRlbUF0VGltZVxuICAgICAgXCJ0aW1lX2ludGVybWVkaWF0ZV9jYXB0dXJlZFwiIDogQHRpbWVJbnRlcm1lZGlhdGVDYXB0dXJlZFxuICAgICAgXCJjYXB0dXJlX2l0ZW1fYXRfdGltZVwiICAgICAgIDogQGNhcHR1cmVJdGVtQXRUaW1lXG4gICAgICBcImF1dG9fc3RvcFwiICAgICA6IGF1dG9zdG9wcGVkXG4gICAgICBcImF0dGVtcHRlZFwiICAgICA6IEBsYXN0QXR0ZW1wdGVkXG4gICAgICBcIml0ZW1zXCIgICAgICAgICA6IGl0ZW1SZXN1bHRzXG4gICAgICBcInRpbWVfcmVtYWluXCIgICA6IHRpbWVSZW1haW5pbmdcbiAgICAgIFwibWFya19yZWNvcmRcIiAgIDogQG1hcmtSZWNvcmRcbiAgICAgIFwidmFyaWFibGVfbmFtZVwiIDogQG1vZGVsLmdldChcInZhcmlhYmxlTmFtZVwiKVxuICAgIHJldHVybiByZXN1bHRcblxuICBnZXRTa2lwcGVkOiAtPlxuICAgIGl0ZW1SZXN1bHRzID0gW11cblxuICAgIGZvciBpdGVtLCBpIGluIEBpdGVtc1xuICAgICAgaXRlbVJlc3VsdHNbaV0gPVxuICAgICAgICBpdGVtUmVzdWx0IDogXCJza2lwcGVkXCJcbiAgICAgICAgaXRlbUxhYmVsICA6IGl0ZW1cblxuICAgIHJlc3VsdCA9XG4gICAgICBcImNhcHR1cmVfbGFzdF9hdHRlbXB0ZWRcIiAgICAgOiBcInNraXBwZWRcIlxuICAgICAgXCJpdGVtX2F0X3RpbWVcIiAgICAgICAgICAgICAgIDogXCJza2lwcGVkXCJcbiAgICAgIFwidGltZV9pbnRlcm1lZGlhdGVfY2FwdHVyZWRcIiA6IFwic2tpcHBlZFwiXG4gICAgICBcImNhcHR1cmVfaXRlbV9hdF90aW1lXCIgICAgICAgOiBcInNraXBwZWRcIlxuICAgICAgXCJhdXRvX3N0b3BcIiAgICAgOiBcInNraXBwZWRcIlxuICAgICAgXCJhdHRlbXB0ZWRcIiAgICAgOiBcInNraXBwZWRcIlxuICAgICAgXCJpdGVtc1wiICAgICAgICAgOiBpdGVtUmVzdWx0c1xuICAgICAgXCJ0aW1lX3JlbWFpblwiICAgOiBcInNraXBwZWRcIlxuICAgICAgXCJtYXJrX3JlY29yZFwiICAgOiBcInNraXBwZWRcIlxuICAgICAgXCJ2YXJpYWJsZV9uYW1lXCIgOiBAbW9kZWwuZ2V0KFwidmFyaWFibGVOYW1lXCIpXG5cbiAgb25DbG9zZTogLT5cbiAgICBjbGVhckludGVydmFsKEBpbnRlcnZhbClcblxuIl19

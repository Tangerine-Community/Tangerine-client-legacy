var GridRunItemView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

GridRunItemView = (function(superClass) {
  extend(GridRunItemView, superClass);

  function GridRunItemView() {
    this.onRender = bind(this.onRender, this);
    this.updateMode = bind(this.updateMode, this);
    this.updateCountdown = bind(this.updateCountdown, this);
    this.removeUndo = bind(this.removeUndo, this);
    this.lastHandler = bind(this.lastHandler, this);
    this.intermediateItemHandler = bind(this.intermediateItemHandler, this);
    this.markHandler = bind(this.markHandler, this);
    this.gridClick = bind(this.gridClick, this);
    return GridRunItemView.__super__.constructor.apply(this, arguments);
  }

  GridRunItemView.prototype.className = "gridItem";

  GridRunItemView.prototype.template = JST["Grid"];

  GridRunItemView.prototype.events = Modernizr.touch ? {
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

  GridRunItemView.prototype.restartTimer = function() {
    if (this.timeRunning) {
      this.stopTimer({
        simpleStop: true
      });
    }
    this.resetVariables();
    return this.$el.find(".element_wrong").removeClass("element_wrong");
  };

  GridRunItemView.prototype.gridClick = function(event) {
    var base, name;
    event.preventDefault();
    return typeof (base = this.modeHandlers)[name = this.mode] === "function" ? base[name](event) : void 0;
  };

  GridRunItemView.prototype.markHandler = function(event) {
    var $target, correctionsDisabled, index, indexIsntBelowLastAttempted, lastAttemptedIsntZero, ref;
    $target = $(event.target);
    index = $target.attr('data-index');
    indexIsntBelowLastAttempted = parseInt(index) > parseInt(this.lastAttempted);
    lastAttemptedIsntZero = parseInt(this.lastAttempted) !== 0;
    correctionsDisabled = this.dataEntry === false && ((ref = this.parent) != null ? ref.enableCorrections : void 0) === false;
    if (correctionsDisabled && lastAttemptedIsntZero && indexIsntBelowLastAttempted) {
      return;
    }
    this.markElement(index);
    if (this.autostop !== 0) {
      return this.checkAutostop();
    }
  };

  GridRunItemView.prototype.intermediateItemHandler = function(event) {
    var $target, index;
    this.timeIntermediateCaptured = this.getTime() - this.startTime;
    $target = $(event.target);
    index = $target.attr('data-index');
    this.itemAtTime = index;
    $target.addClass("element_minute");
    return this.updateMode("mark");
  };

  GridRunItemView.prototype.checkAutostop = function() {
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

  GridRunItemView.prototype.markElement = function(index, value, mode) {
    var $target, correctionsDisabled, indexIsntBelowLastAttempted, lastAttemptedIsntZero, ref, ref1;
    if (value == null) {
      value = null;
    }
    correctionsDisabled = this.dataEntry === false && (((ref = this.parent) != null ? ref.enableCorrections : void 0) != null) && ((ref1 = this.parent) != null ? ref1.enableCorrections : void 0) === false;
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

  GridRunItemView.prototype.endOfGridLineClick = function(event) {
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

  GridRunItemView.prototype.lastHandler = function(event, index) {
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

  GridRunItemView.prototype.floatOn = function() {
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

  GridRunItemView.prototype.floatOff = function() {
    var timer;
    $(window).off('scroll');
    timer = this.$el.find('.timer');
    return timer.css({
      position: "initial",
      top: "initial",
      left: "initial"
    });
  };

  GridRunItemView.prototype.startTimer = function() {
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

  GridRunItemView.prototype.enableGrid = function() {
    return this.$el.find("table.disabled, div.disabled").removeClass("disabled");
  };

  GridRunItemView.prototype.stopTimer = function(event, message) {
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

  GridRunItemView.prototype.autostopTest = function() {
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

  GridRunItemView.prototype.removeUndo = function() {
    this.undoable = false;
    this.updateMode("disabled");
    return clearTimeout(this.timeout);
  };

  GridRunItemView.prototype.unAutostopTest = function() {
    this.interval = setInterval(this.updateCountdown, 1000);
    this.updateCountdown();
    this.autostopped = false;
    this.lastAttempted = 0;
    this.$el.find(".grid_element").slice(this.autostop - 1, this.autostop).removeClass("element_last");
    this.timeRunning = true;
    this.updateMode("mark");
    return Utils.topAlert(t("GridRunView.message.autostop_cancel"));
  };

  GridRunItemView.prototype.updateCountdown = function() {
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
      this.updateMode("last");
    }
    if (this.captureItemAtTime && !this.gotIntermediate && !this.minuteMessage && this.timeElapsed >= this.captureAfterSeconds) {
      Utils.flash("yellow");
      Utils.midAlert(t("please select the item the child is currently attempting"));
      this.minuteMessage = true;
      return this.mode = "minuteItem";
    }
  };

  GridRunItemView.prototype.updateMode = function(mode) {
    var ref, ref1, ref2;
    if (mode == null) {
      mode = null;
    }
    if ((mode === null && this.timeElapsed === 0 && !this.dataEntry) || mode === "disabled") {
      return (ref = this.modeButton) != null ? ref.setValue(null) : void 0;
    } else if (mode != null) {
      this.mode = mode;
      return (ref1 = this.modeButton) != null ? ref1.setValue(this.mode) : void 0;
    } else {
      return this.mode = (ref2 = this.modeButton) != null ? ref2.getValue() : void 0;
    }
  };

  GridRunItemView.prototype.getTime = function() {
    return Math.round((new Date()).getTime() / 1000);
  };

  GridRunItemView.prototype.resetVariables = function() {
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
      previous = this.model.parent.result.getByHash(this.model.get('hash'));
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

  GridRunItemView.prototype.i18n = function() {
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
      lastAttempted: t("GridRunView.button.last_attempted"),
      "help": t("SubtestRunView.button.help")
    };
  };

  GridRunItemView.prototype.initialize = function(options) {
    var fontSizeClass, labels;
    Tangerine.progress.currentSubview = this;
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
    if (!options.dataEntry) {
      this.dataEntry = false;
    }
    this.model = options.model;
    this.parent = this.model.parent;
    this.resetVariables();
    this.gridElement = _.template("<td><button data-label='{{label}}' data-index='{{i}}' class='grid_element " + fontSizeClass + "' " + (this.fontStyle || "") + ">{{label}}</button></td>");
    this.variableGridElement = _.template("<button data-label='{{label}}' data-index='{{i}}' class='grid_element " + fontSizeClass + "' " + (this.fontStyle || "") + ">{{label}}</button>");
    if (this.layoutMode === "fixed") {
      this.endOfGridLine = _.template("<td><button data-index='{{i}}' class='end_of_grid_line'>*</button></td>");
    } else {
      this.endOfGridLine = _.template("");
    }
    labels = {};
    labels.text = this.text;
    return this.model.set('labels', labels);
  };

  GridRunItemView.prototype.ui = {
    modeButton: ".mode-button"
  };

  GridRunItemView.prototype.onBeforeRender = function() {
    var buttonConfig, dataEntry, disabling, displayRtl, done, firstRow, gridHTML, html, i, item, j, k, len, modeSelector, model, ref, ref1, ref2, restartButton, startTimerHTML, stopTimerHTML;
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
    restartButton = "<div> <button class='restart command'>" + this.text.restart + "</button> <br> </div>";
    if (this.captureLastAttempted || this.captureItemAtTime) {
      if ((ref2 = this.modeButton) != null) {
        ref2.close();
      }
      model = new Button();
      buttonConfig = {
        options: [],
        mode: "single",
        model: model
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
      this.modeButton = new ButtonItemView(buttonConfig);
      this.listenTo(this.modeButton, "change click", this.updateMode);
      modeSelector = "<div class='grid_mode_wrapper question clearfix'> <label>" + this.text.inputMode + "</label><br> <div class='mode-button'></div> </div>";
    }
    dataEntry = "<table class='class_table'> <tr> <td>" + this.text.wasAutostopped + "</td><td><input type='checkbox' class='data_autostopped'></td> </tr> <tr> <td>" + this.text.timeRemaining + "</td><td><input type='number' class='data_time_remain'></td> </tr> </table>";
    html += (!this.untimed ? stopTimerHTML : "") + " " + (!this.untimed ? restartButton : "") + " " + (modeSelector || '') + " " + ((this.dataEntry ? dataEntry : void 0) || '');
    return this.model.set('grid', html);
  };

  GridRunItemView.prototype.onRender = function() {
    var $target, i, item, j, len, previous, ref, ref1, ref2;
    if ((ref = this.modeButton) != null) {
      ref.setElement(this.$el.find(".mode-button"));
    }
    if ((ref1 = this.modeButton) != null) {
      ref1.render();
    }
    this.trigger("rendered");
    this.trigger("ready");
    if (!this.dataEntry) {
      previous = this.model.parent.result.getByHash(this.model.get('hash'));
      if (previous) {
        this.markRecord = previous.mark_record;
        ref2 = this.markRecord;
        for (i = j = 0, len = ref2.length; j < len; i = ++j) {
          item = ref2[i];
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

  GridRunItemView.prototype.isValid = function() {
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

  GridRunItemView.prototype.testValid = function() {
    if (this.isValid != null) {
      return this.isValid();
    } else {
      return false;
    }
    return true;
  };

  GridRunItemView.prototype.showErrors = function() {
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

  GridRunItemView.prototype.getResult = function() {
    var autostopped, completeResults, hash, i, item, itemResults, j, len, ref, result, subtestResult, timeRemaining;
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
    if (this.model.has("hash")) {
      hash = this.model.get("hash");
    }
    subtestResult = {
      'body': result,
      'meta': {
        'hash': hash
      }
    };
    return subtestResult;
  };

  GridRunItemView.prototype.getSkipped = function() {
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

  GridRunItemView.prototype.onClose = function() {
    return clearInterval(this.interval);
  };

  GridRunItemView.prototype.getSum = function() {
    return {
      correct: 0,
      incorrect: 0,
      missing: 0,
      total: 0
    };
  };

  return GridRunItemView;

})(Backbone.Marionette.ItemView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0dyaWRSdW5JdGVtVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxlQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7Ozs7OzRCQUNKLFNBQUEsR0FBVzs7NEJBQ1gsUUFBQSxHQUFVLEdBQUksQ0FBQSxNQUFBOzs0QkFFZCxNQUFBLEdBQVcsU0FBUyxDQUFDLEtBQWIsR0FBd0I7SUFDOUIscUJBQUEsRUFBNEIsV0FERTtJQUU5Qix5QkFBQSxFQUE0QixvQkFGRTtJQUc5QixtQkFBQSxFQUF1QixZQUhPO0lBSTlCLGtCQUFBLEVBQXVCLFdBSk87SUFLOUIsZ0JBQUEsRUFBdUIsY0FMTztHQUF4QixHQU1EO0lBQ0wseUJBQUEsRUFBNEIsb0JBRHZCO0lBRUwscUJBQUEsRUFBNEIsV0FGdkI7SUFHTCxtQkFBQSxFQUE0QixZQUh2QjtJQUlMLGtCQUFBLEVBQTRCLFdBSnZCO0lBS0wsZ0JBQUEsRUFBNEIsY0FMdkI7Ozs0QkFRUCxZQUFBLEdBQWMsU0FBQTtJQUNaLElBQStCLElBQUMsQ0FBQSxXQUFoQztNQUFBLElBQUMsQ0FBQSxTQUFELENBQVc7UUFBQSxVQUFBLEVBQVcsSUFBWDtPQUFYLEVBQUE7O0lBRUEsSUFBQyxDQUFBLGNBQUQsQ0FBQTtXQUVBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdCQUFWLENBQTJCLENBQUMsV0FBNUIsQ0FBd0MsZUFBeEM7RUFMWTs7NEJBT2QsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUNULFFBQUE7SUFBQSxLQUFLLENBQUMsY0FBTixDQUFBOzJGQUNzQjtFQUZiOzs0QkFJWCxXQUFBLEdBQWEsU0FBQyxLQUFEO0FBQ1gsUUFBQTtJQUFBLE9BQUEsR0FBVSxDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVI7SUFDVixLQUFBLEdBQVEsT0FBTyxDQUFDLElBQVIsQ0FBYSxZQUFiO0lBRVIsMkJBQUEsR0FBOEIsUUFBQSxDQUFTLEtBQVQsQ0FBQSxHQUFrQixRQUFBLENBQVMsSUFBQyxDQUFBLGFBQVY7SUFDaEQscUJBQUEsR0FBOEIsUUFBQSxDQUFTLElBQUMsQ0FBQSxhQUFWLENBQUEsS0FBNEI7SUFDMUQsbUJBQUEsR0FBOEIsSUFBQyxDQUFBLFNBQUQsS0FBYyxLQUFkLHNDQUErQixDQUFFLDJCQUFULEtBQThCO0lBRXBGLElBQVUsbUJBQUEsSUFBdUIscUJBQXZCLElBQWdELDJCQUExRDtBQUFBLGFBQUE7O0lBRUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxLQUFiO0lBQ0EsSUFBb0IsSUFBQyxDQUFBLFFBQUQsS0FBYSxDQUFqQzthQUFBLElBQUMsQ0FBQSxhQUFELENBQUEsRUFBQTs7RUFYVzs7NEJBY2IsdUJBQUEsR0FBeUIsU0FBQyxLQUFEO0FBQ3ZCLFFBQUE7SUFBQSxJQUFDLENBQUEsd0JBQUQsR0FBNEIsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFBLEdBQWEsSUFBQyxDQUFBO0lBQzFDLE9BQUEsR0FBVSxDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVI7SUFDVixLQUFBLEdBQVEsT0FBTyxDQUFDLElBQVIsQ0FBYSxZQUFiO0lBQ1IsSUFBQyxDQUFBLFVBQUQsR0FBYztJQUNkLE9BQU8sQ0FBQyxRQUFSLENBQWlCLGdCQUFqQjtXQUNBLElBQUMsQ0FBQSxVQUFELENBQVksTUFBWjtFQU51Qjs7NEJBUXpCLGFBQUEsR0FBZSxTQUFBO0FBQ2IsUUFBQTtJQUFBLElBQUcsSUFBQyxDQUFBLFdBQUo7TUFDRSxTQUFBLEdBQVk7QUFDWixXQUFTLDRGQUFUO1FBQ0UsSUFBRyxJQUFDLENBQUEsVUFBVyxDQUFBLENBQUEsQ0FBWixLQUFrQixTQUFyQjtBQUFvQyxnQkFBcEM7O1FBQ0EsU0FBQTtBQUZGO01BR0EsSUFBRyxJQUFDLENBQUEsV0FBRCxLQUFnQixLQUFuQjtRQUNFLElBQUcsU0FBQSxLQUFhLElBQUMsQ0FBQSxRQUFqQjtVQUErQixJQUFDLENBQUEsWUFBRCxDQUFBLEVBQS9CO1NBREY7O01BRUEsSUFBRyxJQUFDLENBQUEsV0FBRCxLQUFnQixJQUFoQixJQUF3QixTQUFBLEdBQVksSUFBQyxDQUFBLFFBQXJDLElBQWlELElBQUMsQ0FBQSxRQUFELEtBQWEsSUFBakU7ZUFBMkUsSUFBQyxDQUFBLGNBQUQsQ0FBQSxFQUEzRTtPQVBGOztFQURhOzs0QkFXZixXQUFBLEdBQWEsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFzQixJQUF0QjtBQUdYLFFBQUE7O01BSG1CLFFBQVE7O0lBRzNCLG1CQUFBLEdBQThCLElBQUMsQ0FBQSxTQUFELEtBQWMsS0FBZCxJQUF3Qix3RUFBeEIsd0NBQStELENBQUUsMkJBQVQsS0FBOEI7SUFDcEgscUJBQUEsR0FBOEIsUUFBQSxDQUFTLElBQUMsQ0FBQSxhQUFWLENBQUEsS0FBNEI7SUFDMUQsMkJBQUEsR0FBOEIsUUFBQSxDQUFTLEtBQVQsQ0FBQSxHQUFrQixRQUFBLENBQVMsSUFBQyxDQUFBLGFBQVY7SUFFaEQsSUFBVSxtQkFBQSxJQUF3QixxQkFBeEIsSUFBa0QsMkJBQTVEO0FBQUEsYUFBQTs7SUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsMkJBQUEsR0FBNEIsS0FBNUIsR0FBa0MsR0FBNUM7SUFDVixJQUFHLElBQUEsS0FBUSxVQUFYO01BQ0UsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLEtBQWpCLEVBREY7O0lBR0EsSUFBRyxDQUFJLElBQUMsQ0FBQSxXQUFSO01BQ0UsSUFBRyxLQUFBLEtBQVMsSUFBWjtRQUNFLElBQUMsQ0FBQSxVQUFXLENBQUEsS0FBQSxHQUFNLENBQU4sQ0FBWixHQUEyQixJQUFDLENBQUEsVUFBVyxDQUFBLEtBQUEsR0FBTSxDQUFOLENBQVosS0FBd0IsU0FBNUIsR0FBNEMsV0FBNUMsR0FBNkQ7ZUFDcEYsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsZUFBcEIsRUFGRjtPQUFBLE1BQUE7UUFJRSxJQUFDLENBQUEsVUFBVyxDQUFBLEtBQUEsR0FBTSxDQUFOLENBQVosR0FBdUI7UUFDdkIsSUFBRyxLQUFBLEtBQVMsV0FBWjtpQkFDRSxPQUFPLENBQUMsUUFBUixDQUFpQixlQUFqQixFQURGO1NBQUEsTUFFSyxJQUFHLEtBQUEsS0FBUyxTQUFaO2lCQUNILE9BQU8sQ0FBQyxXQUFSLENBQW9CLGVBQXBCLEVBREc7U0FQUDtPQURGOztFQWJXOzs0QkF3QmIsa0JBQUEsR0FBb0IsU0FBQyxLQUFEO0FBQ2xCLFFBQUE7SUFBQSxLQUFLLENBQUMsY0FBTixDQUFBO0lBQ0EsSUFBRyxJQUFDLENBQUEsSUFBRCxLQUFTLE1BQVo7TUFDRSxPQUFBLEdBQVUsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSO01BR1YsSUFBRyxPQUFPLENBQUMsUUFBUixDQUFpQixlQUFqQixDQUFIO1FBRUUsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsZUFBcEI7UUFDQSxLQUFBLEdBQVEsT0FBTyxDQUFDLElBQVIsQ0FBYSxZQUFiO0FBQ1IsYUFBUyx3SEFBVDtVQUNFLElBQUMsQ0FBQSxXQUFELENBQWEsQ0FBYixFQUFnQixTQUFoQjtBQURGLFNBSkY7T0FBQSxNQU1LLElBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUixDQUFpQixlQUFqQixDQUFELElBQXNDLENBQUMsSUFBQyxDQUFBLFdBQTNDO1FBRUgsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsZUFBakI7UUFDQSxLQUFBLEdBQVEsT0FBTyxDQUFDLElBQVIsQ0FBYSxZQUFiO0FBQ1IsYUFBUywySEFBVDtVQUNFLElBQUMsQ0FBQSxXQUFELENBQWEsQ0FBYixFQUFnQixXQUFoQjtBQURGLFNBSkc7O01BT0wsSUFBb0IsSUFBQyxDQUFBLFFBQUQsS0FBYSxDQUFqQztlQUFBLElBQUMsQ0FBQSxhQUFELENBQUEsRUFBQTtPQWpCRjs7RUFGa0I7OzRCQXFCcEIsV0FBQSxHQUFhLFNBQUMsS0FBRCxFQUFRLEtBQVI7QUFDWCxRQUFBO0lBQUEsSUFBRyxhQUFIO01BQ0UsT0FBQSxHQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLDJCQUFBLEdBQTRCLEtBQTVCLEdBQWtDLEdBQTVDLEVBRFo7S0FBQSxNQUFBO01BR0UsT0FBQSxHQUFVLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUjtNQUNWLEtBQUEsR0FBVSxPQUFPLENBQUMsSUFBUixDQUFhLFlBQWIsRUFKWjs7SUFNQSxJQUFHLEtBQUEsR0FBUSxDQUFSLElBQWEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxXQUFaLENBQXdCLFdBQXhCLENBQWhCO01BQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsZUFBVixDQUEwQixDQUFDLFdBQTNCLENBQXVDLGNBQXZDO01BQ0EsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsY0FBakI7YUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQixNQUhuQjs7RUFQVzs7NEJBWWIsT0FBQSxHQUFTLFNBQUE7QUFDUCxRQUFBO0lBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFFBQVY7SUFDUixRQUFBLEdBQVcsS0FBSyxDQUFDLE1BQU4sQ0FBQTtXQUNYLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxFQUFWLENBQWEsUUFBYixFQUF1QixTQUFBO0FBQ3JCLFVBQUE7TUFBQSxTQUFBLEdBQVksQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFNBQVYsQ0FBQTtNQUNaLElBQUcsU0FBQSxJQUFhLFFBQVEsQ0FBQyxHQUF6QjtlQUNFLEtBQUssQ0FBQyxHQUFOLENBQ0U7VUFBQSxRQUFBLEVBQVUsT0FBVjtVQUNBLEdBQUEsRUFBSyxLQURMO1VBRUEsSUFBQSxFQUFNLEtBRk47U0FERixFQURGO09BQUEsTUFBQTtlQU1FLEtBQUssQ0FBQyxHQUFOLENBQ0U7VUFBQSxRQUFBLEVBQVUsU0FBVjtVQUNBLEdBQUEsRUFBSyxTQURMO1VBRUEsSUFBQSxFQUFNLFNBRk47U0FERixFQU5GOztJQUZxQixDQUF2QjtFQUhPOzs0QkFnQlQsUUFBQSxHQUFVLFNBQUE7QUFDUixRQUFBO0lBQUEsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEdBQVYsQ0FBYyxRQUFkO0lBQ0EsS0FBQSxHQUFRLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFFBQVY7V0FDUixLQUFLLENBQUMsR0FBTixDQUNFO01BQUEsUUFBQSxFQUFVLFNBQVY7TUFDQSxHQUFBLEVBQUssU0FETDtNQUVBLElBQUEsRUFBTSxTQUZOO0tBREY7RUFIUTs7NEJBU1YsVUFBQSxHQUFZLFNBQUE7SUFDVixJQUFHLElBQUMsQ0FBQSxZQUFELEtBQWlCLEtBQWpCLElBQTBCLElBQUMsQ0FBQSxXQUFELEtBQWdCLEtBQTdDO01BQ0UsSUFBQyxDQUFBLFFBQUQsR0FBWSxXQUFBLENBQWEsSUFBQyxDQUFBLGVBQWQsRUFBK0IsSUFBL0I7TUFDWixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxPQUFELENBQUE7TUFDYixJQUFDLENBQUEsV0FBRCxHQUFlO01BQ2YsSUFBQyxDQUFBLFVBQUQsQ0FBWSxNQUFaO01BQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxlQUFELENBQUE7YUFDQSxJQUFDLENBQUEsT0FBRCxDQUFBLEVBUEY7O0VBRFU7OzRCQVVaLFVBQUEsR0FBWSxTQUFBO1dBQ1YsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsOEJBQVYsQ0FBeUMsQ0FBQyxXQUExQyxDQUFzRCxVQUF0RDtFQURVOzs0QkFHWixTQUFBLEdBQVcsU0FBQyxLQUFELEVBQVEsT0FBUjs7TUFBUSxVQUFVOztJQUUzQixJQUFVLElBQUMsQ0FBQSxXQUFELEtBQWdCLElBQTFCO0FBQUEsYUFBQTs7SUFFQSxvQkFBRyxLQUFLLENBQUUsZUFBVjtNQUNFLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBYixFQUFtQixJQUFDLENBQUEsS0FBSyxDQUFDLE1BQTFCLEVBREY7O0lBSUEsYUFBQSxDQUFjLElBQUMsQ0FBQSxRQUFmO0lBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsT0FBRCxDQUFBO0lBQ1osSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUNmLElBQUMsQ0FBQSxZQUFELEdBQWdCO0lBQ2hCLElBQUMsQ0FBQSxRQUFELENBQUE7V0FFQSxJQUFDLENBQUEsZUFBRCxDQUFBO0VBZFM7OzRCQXFCWCxZQUFBLEdBQWMsU0FBQTtJQUNaLEtBQUssQ0FBQyxLQUFOLENBQUE7SUFDQSxhQUFBLENBQWMsSUFBQyxDQUFBLFFBQWY7SUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxPQUFELENBQUE7SUFDWixJQUFDLENBQUEsV0FBRCxHQUFlO0lBQ2YsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7SUFDaEIsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUNmLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGVBQVYsQ0FBMEIsQ0FBQyxLQUEzQixDQUFpQyxJQUFDLENBQUEsUUFBRCxHQUFVLENBQTNDLEVBQTZDLElBQUMsQ0FBQSxRQUE5QyxDQUF1RCxDQUFDLFFBQXhELENBQWlFLGNBQWpFO0lBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBQyxDQUFBO0lBQ2xCLElBQUMsQ0FBQSxPQUFELEdBQVcsVUFBQSxDQUFXLElBQUMsQ0FBQSxVQUFaLEVBQXdCLElBQXhCO1dBQ1gsS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQXJCO0VBVlk7OzRCQVlkLFVBQUEsR0FBWSxTQUFBO0lBQ1YsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUNaLElBQUMsQ0FBQSxVQUFELENBQVksVUFBWjtXQUNBLFlBQUEsQ0FBYSxJQUFDLENBQUEsT0FBZDtFQUhVOzs0QkFLWixjQUFBLEdBQWdCLFNBQUE7SUFDZCxJQUFDLENBQUEsUUFBRCxHQUFZLFdBQUEsQ0FBWSxJQUFDLENBQUEsZUFBYixFQUE4QixJQUE5QjtJQUNaLElBQUMsQ0FBQSxlQUFELENBQUE7SUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlO0lBQ2YsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsZUFBVixDQUEwQixDQUFDLEtBQTNCLENBQWlDLElBQUMsQ0FBQSxRQUFELEdBQVUsQ0FBM0MsRUFBNkMsSUFBQyxDQUFBLFFBQTlDLENBQXVELENBQUMsV0FBeEQsQ0FBb0UsY0FBcEU7SUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlO0lBQ2YsSUFBQyxDQUFBLFVBQUQsQ0FBWSxNQUFaO1dBQ0EsS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFBLENBQUUscUNBQUYsQ0FBZjtFQVJjOzs0QkFVaEIsZUFBQSxHQUFpQixTQUFBO0lBRWYsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBQSxHQUFhLElBQUMsQ0FBQSxTQUF2QixFQUFrQyxJQUFDLENBQUEsS0FBbkM7SUFFZixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQTtJQUUzQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxRQUFWLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsSUFBQyxDQUFBLGFBQTFCO0lBRUEsSUFBRyxJQUFDLENBQUEsV0FBRCxLQUFnQixJQUFoQixJQUF5QixJQUFDLENBQUEsb0JBQTFCLElBQW1ELElBQUMsQ0FBQSxhQUFELElBQWtCLENBQXhFO01BQ0ksSUFBQyxDQUFBLFNBQUQsQ0FBVztRQUFBLFVBQUEsRUFBVyxJQUFYO09BQVg7TUFDQSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQjtNQUNBLENBQUMsQ0FBQyxLQUFGLENBQ0UsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ0UsS0FBQSxDQUFNLEtBQUMsQ0FBQSxJQUFJLENBQUMsYUFBWjtpQkFDQSxLQUFLLENBQUMsVUFBTixDQUFpQixFQUFqQjtRQUZGO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURGLEVBSUUsR0FKRjtNQU1BLElBQUMsQ0FBQSxVQUFELENBQVksTUFBWixFQVRKOztJQVlBLElBQUcsSUFBQyxDQUFBLGlCQUFELElBQXNCLENBQUMsSUFBQyxDQUFBLGVBQXhCLElBQTJDLENBQUMsSUFBQyxDQUFBLGFBQTdDLElBQThELElBQUMsQ0FBQSxXQUFELElBQWdCLElBQUMsQ0FBQSxtQkFBbEY7TUFDRSxLQUFLLENBQUMsS0FBTixDQUFZLFFBQVo7TUFDQSxLQUFLLENBQUMsUUFBTixDQUFlLENBQUEsQ0FBRSwwREFBRixDQUFmO01BQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7YUFDakIsSUFBQyxDQUFBLElBQUQsR0FBUSxhQUpWOztFQXBCZTs7NEJBMkJqQixVQUFBLEdBQVksU0FBRSxJQUFGO0FBRVYsUUFBQTs7TUFGWSxPQUFPOztJQUVuQixJQUFHLENBQUMsSUFBQSxLQUFNLElBQU4sSUFBYyxJQUFDLENBQUEsV0FBRCxLQUFnQixDQUE5QixJQUFtQyxDQUFJLElBQUMsQ0FBQSxTQUF6QyxDQUFBLElBQXVELElBQUEsS0FBUSxVQUFsRTtrREFDYSxDQUFFLFFBQWIsQ0FBc0IsSUFBdEIsV0FERjtLQUFBLE1BRUssSUFBRyxZQUFIO01BQ0gsSUFBQyxDQUFBLElBQUQsR0FBUTtvREFDRyxDQUFFLFFBQWIsQ0FBc0IsSUFBQyxDQUFBLElBQXZCLFdBRkc7S0FBQSxNQUFBO2FBSUgsSUFBQyxDQUFBLElBQUQsMENBQW1CLENBQUUsUUFBYixDQUFBLFdBSkw7O0VBSks7OzRCQVVaLE9BQUEsR0FBUyxTQUFBO1dBQ1AsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFLLElBQUEsSUFBQSxDQUFBLENBQUwsQ0FBWSxDQUFDLE9BQWIsQ0FBQSxDQUFBLEdBQXlCLElBQXBDO0VBRE87OzRCQUdULGNBQUEsR0FBZ0IsU0FBQTtBQUVkLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFZLFFBQUEsQ0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxPQUFYLENBQVQsQ0FBQSxJQUFpQztJQUM3QyxJQUFDLENBQUEsT0FBRCxHQUFZLElBQUMsQ0FBQSxLQUFELEtBQVUsQ0FBVixJQUFlLElBQUMsQ0FBQTtJQUU1QixJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsVUFBRCxHQUFjO0lBRWQsSUFBQyxDQUFBLHdCQUFELEdBQTRCO0lBRTVCLElBQUMsQ0FBQSxVQUFELEdBQWM7SUFFZCxJQUFDLENBQUEsWUFBRCxHQUFnQjtJQUVoQixJQUFDLENBQUEsU0FBRCxHQUFhO0lBQ2IsSUFBQyxDQUFBLFFBQUQsR0FBYTtJQUNiLElBQUMsQ0FBQSxXQUFELEdBQWU7SUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFDLENBQUE7SUFDbEIsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFFakIsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUVaLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFFWixJQUFDLENBQUEsV0FBRCxHQUFlO0lBR2YsSUFBQyxDQUFBLEtBQUQsR0FBWSxDQUFDLENBQUMsT0FBRixDQUFVLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE9BQVgsQ0FBVjtJQUVaLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFDWCxJQUFDLENBQUEsT0FBRCxHQUFXO0lBRVgsSUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxXQUFYLENBQUEsSUFBMkIsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsV0FBWCxDQUE5QjtNQUNFLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsU0FBQyxLQUFELEVBQVEsQ0FBUjtlQUFjO01BQWQsQ0FBWDtNQUVYLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFlLFNBQUMsSUFBRCxFQUFPLENBQVA7QUFDYixZQUFBO1FBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBbEM7UUFDUCxTQUFBLEdBQVksSUFBQyxDQUFBLE9BQVEsQ0FBQSxJQUFBO1FBQ3JCLElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQSxDQUFULEdBQWlCLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQTtlQUMxQixJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBVCxHQUFjO01BSkQsQ0FBZixFQUtFLElBTEY7TUFPQSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBaUIsU0FBQyxJQUFELEVBQU8sQ0FBUDtlQUNmLElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVQsQ0FBVCxHQUF3QjtNQURULENBQWpCLEVBRUUsSUFGRixFQVZGO0tBQUEsTUFBQTtNQWNFLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFlLFNBQUMsSUFBRCxFQUFPLENBQVA7UUFDYixJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBVCxHQUFjO2VBQ2QsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVQsR0FBYztNQUZELENBQWYsRUFHRSxJQUhGLEVBZEY7O0lBbUJBLElBQUcsQ0FBQyxJQUFDLENBQUEsb0JBQUYsSUFBMEIsQ0FBQyxJQUFDLENBQUEsaUJBQS9CO01BQ0UsSUFBQyxDQUFBLElBQUQsR0FBUSxPQURWO0tBQUEsTUFBQTtNQUdFLElBQUMsQ0FBQSxJQUFELEdBQVEsV0FIVjs7SUFLQSxJQUFrQixJQUFDLENBQUEsU0FBbkI7TUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLE9BQVI7O0lBRUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxTQUFBO2FBQUc7SUFBSCxDQUFYO0lBQ2QsSUFBQyxDQUFBLE9BQUQsR0FBWSxRQUFBLENBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsU0FBWCxDQUFULENBQUEsSUFBbUM7SUFFL0MsSUFBQyxDQUFBLFFBQUQsR0FBZSxJQUFDLENBQUEsT0FBSixHQUFpQixDQUFqQixHQUF5QixRQUFBLENBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsVUFBWCxDQUFULENBQUEsSUFBb0M7SUFDekUsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUVmLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGVBQVYsQ0FBMEIsQ0FBQyxXQUEzQixDQUF1QyxlQUF2QyxDQUF1RCxDQUFDLFdBQXhELENBQW9FLGNBQXBFLENBQW1GLENBQUMsUUFBcEYsQ0FBNkYsVUFBN0Y7SUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxPQUFWLENBQWtCLENBQUMsUUFBbkIsQ0FBNEIsVUFBNUI7SUFFQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxRQUFWLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsSUFBQyxDQUFBLEtBQTFCO0lBRUEsSUFBQSxDQUFPLElBQUMsQ0FBQSxTQUFSO01BRUUsUUFBQSxHQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFyQixDQUErQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQS9CO01BQ1gsSUFBRyxRQUFIO1FBRUUsSUFBQyxDQUFBLG9CQUFELEdBQTRCLFFBQVEsQ0FBQztRQUNyQyxJQUFDLENBQUEsVUFBRCxHQUE0QixRQUFRLENBQUM7UUFDckMsSUFBQyxDQUFBLHdCQUFELEdBQTRCLFFBQVEsQ0FBQztRQUNyQyxJQUFDLENBQUEsaUJBQUQsR0FBNEIsUUFBUSxDQUFDO1FBQ3JDLElBQUMsQ0FBQSxRQUFELEdBQTRCLFFBQVEsQ0FBQztRQUNyQyxJQUFDLENBQUEsYUFBRCxHQUE0QixRQUFRLENBQUM7UUFDckMsSUFBQyxDQUFBLGFBQUQsR0FBNEIsUUFBUSxDQUFDO1FBQ3JDLElBQUMsQ0FBQSxVQUFELEdBQTRCLFFBQVEsQ0FBQyxZQVR2QztPQUhGOztJQWNBLElBQXFCLHVCQUFyQjthQUFBLElBQUMsQ0FBQSxVQUFELENBQVksSUFBQyxDQUFBLElBQWIsRUFBQTs7RUFwRmM7OzRCQXNGaEIsSUFBQSxHQUFNLFNBQUE7V0FFSixJQUFDLENBQUEsSUFBRCxHQUNFO01BQUEsUUFBQSxFQUFxQixDQUFBLENBQUUsOEJBQUYsQ0FBckI7TUFDQSxhQUFBLEVBQXFCLENBQUEsQ0FBRSxxQ0FBRixDQURyQjtNQUVBLGtCQUFBLEVBQXFCLENBQUEsQ0FBRSwwQ0FBRixDQUZyQjtNQUlBLFNBQUEsRUFBZ0IsQ0FBQSxDQUFFLDhCQUFGLENBSmhCO01BS0EsYUFBQSxFQUFpQixDQUFBLENBQUUsa0NBQUYsQ0FMakI7TUFNQSxjQUFBLEVBQWlCLENBQUEsQ0FBRSxtQ0FBRixDQU5qQjtNQVFBLElBQUEsRUFBZ0IsQ0FBQSxDQUFFLHlCQUFGLENBUmhCO01BU0EsS0FBQSxFQUFnQixDQUFBLENBQUUsMEJBQUYsQ0FUaEI7TUFVQSxJQUFBLEVBQWdCLENBQUEsQ0FBRSx5QkFBRixDQVZoQjtNQVdBLE9BQUEsRUFBZ0IsQ0FBQSxDQUFFLDRCQUFGLENBWGhCO01BWUEsYUFBQSxFQUFnQixDQUFBLENBQUUsbUNBQUYsQ0FaaEI7TUFhQSxNQUFBLEVBQVMsQ0FBQSxDQUFFLDRCQUFGLENBYlQ7O0VBSEU7OzRCQW1CTixVQUFBLEdBQVksU0FBQyxPQUFEO0FBRVYsUUFBQTtJQUFBLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBbkIsR0FBb0M7SUFDcEMsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUVBLElBQWlGLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsQ0FBQSxLQUE0QixFQUE3RztNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsdUJBQUEsR0FBdUIsQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLENBQUQsQ0FBdkIsR0FBaUQsaUJBQTlEOztJQUVBLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxxQkFBWCxDQUFILEdBQTJDLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLHFCQUFYLENBQTNDLEdBQW1GO0lBQzNHLElBQUMsQ0FBQSxpQkFBRCxHQUEyQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxtQkFBWCxDQUFILEdBQTJDLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLG1CQUFYLENBQTNDLEdBQW1GO0lBQzNHLElBQUMsQ0FBQSxvQkFBRCxHQUEyQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxzQkFBWCxDQUFILEdBQTJDLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLHNCQUFYLENBQTNDLEdBQW1GO0lBQzNHLElBQUMsQ0FBQSxTQUFELEdBQTJCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBSCxHQUEyQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxXQUFYLENBQTNDLEdBQW1GO0lBRTNHLElBQUMsQ0FBQSxVQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsQ0FBSCxHQUFpQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLENBQWpDLEdBQStEO0lBQzdFLElBQUMsQ0FBQSxRQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFVBQVgsQ0FBSCxHQUFpQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxVQUFYLENBQWpDLEdBQStEO0lBRTdFLElBQUcsSUFBQyxDQUFBLFFBQUQsS0FBYSxPQUFoQjtNQUNFLGFBQUEsR0FBZ0Isa0JBRGxCO0tBQUEsTUFBQTtNQUdFLGFBQUEsR0FBZ0IsR0FIbEI7O0lBS0EsSUFBQyxDQUFBLEdBQUQsR0FBTyxJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBa0IsS0FBbEI7SUFDUCxJQUE0QixJQUFDLENBQUEsR0FBN0I7TUFBQSxJQUFDLENBQUEsR0FBRyxDQUFDLFFBQUwsQ0FBYyxVQUFkLEVBQUE7O0lBRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxPQUFYLENBQUEsSUFBdUI7SUFFcEMsSUFBQyxDQUFBLFlBQUQsR0FDRTtNQUFBLE1BQUEsRUFBZSxJQUFDLENBQUEsV0FBaEI7TUFDQSxNQUFBLEVBQWUsSUFBQyxDQUFBLFdBRGhCO01BRUEsWUFBQSxFQUFlLElBQUMsQ0FBQSx1QkFGaEI7TUFHQSxRQUFBLEVBQWUsQ0FBQyxDQUFDLElBSGpCOztJQUtGLElBQUEsQ0FBMEIsT0FBTyxDQUFDLFNBQWxDO01BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxNQUFiOztJQUVBLElBQUMsQ0FBQSxLQUFELEdBQVUsT0FBTyxDQUFDO0lBQ2xCLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUVqQixJQUFDLENBQUEsY0FBRCxDQUFBO0lBRUEsSUFBQyxDQUFBLFdBQUQsR0FBdUIsQ0FBQyxDQUFDLFFBQUYsQ0FBVyw0RUFBQSxHQUE2RSxhQUE3RSxHQUEyRixJQUEzRixHQUE4RixDQUFDLElBQUMsQ0FBQSxTQUFELElBQWMsRUFBZixDQUE5RixHQUFnSCwwQkFBM0g7SUFDdkIsSUFBQyxDQUFBLG1CQUFELEdBQXVCLENBQUMsQ0FBQyxRQUFGLENBQVcsd0VBQUEsR0FBeUUsYUFBekUsR0FBdUYsSUFBdkYsR0FBMEYsQ0FBQyxJQUFDLENBQUEsU0FBRCxJQUFjLEVBQWYsQ0FBMUYsR0FBNEcscUJBQXZIO0lBRXZCLElBQUcsSUFBQyxDQUFBLFVBQUQsS0FBZSxPQUFsQjtNQUNFLElBQUMsQ0FBQSxhQUFELEdBQWlCLENBQUMsQ0FBQyxRQUFGLENBQVcseUVBQVgsRUFEbkI7S0FBQSxNQUFBO01BR0UsSUFBQyxDQUFBLGFBQUQsR0FBaUIsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxFQUFYLEVBSG5COztJQUtBLE1BQUEsR0FBUztJQUNULE1BQU0sQ0FBQyxJQUFQLEdBQWMsSUFBQyxDQUFBO1dBQ2YsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsUUFBWCxFQUFxQixNQUFyQjtFQWhEVTs7NEJBa0RaLEVBQUEsR0FDRTtJQUFBLFVBQUEsRUFBWSxjQUFaOzs7NEJBRUYsY0FBQSxHQUFnQixTQUFBO0FBRWQsUUFBQTtJQUFBLElBQUEsR0FBTztJQUVQLGNBQUEsR0FBaUIsNkRBQUEsR0FBOEQsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFwRSxHQUEwRSw4QkFBMUUsR0FBd0csSUFBQyxDQUFBLEtBQXpHLEdBQStHO0lBRWhJLElBQUEsQ0FBOEIsSUFBQyxDQUFBLE9BQS9CO01BQUEsU0FBQSxHQUFZLFdBQVo7O0lBRUEsSUFBMkIsSUFBQyxDQUFBLEdBQTVCO01BQUEsVUFBQSxHQUFhLFdBQWI7O0lBRUEsSUFBQSxHQUFVLENBQUksSUFBQyxDQUFBLE9BQVIsR0FBcUIsY0FBckIsR0FBeUM7SUFFaEQsUUFBQSxHQUFXO0lBRVgsSUFBRyxJQUFDLENBQUEsVUFBRCxLQUFlLE9BQWxCO01BQ0UsUUFBQSxJQUFZLHFCQUFBLEdBQXNCLFNBQXRCLEdBQWdDLEdBQWhDLEdBQWtDLENBQUMsVUFBQSxJQUFZLEVBQWIsQ0FBbEMsR0FBa0Q7TUFDOUQsUUFBQSxHQUFXO0FBQ1gsYUFBQSxJQUFBO1FBQ0UsSUFBUyxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUF2QjtBQUFBLGdCQUFBOztRQUNBLFFBQUEsSUFBWTtBQUNaLGFBQVMsdUZBQVQ7VUFDRSxJQUFHLElBQUEsR0FBTyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQWpCO1lBQ0UsUUFBQSxJQUFZLElBQUMsQ0FBQSxXQUFELENBQWE7Y0FBRSxLQUFBLEVBQVEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQSxDQUFULENBQWhCLENBQVY7Y0FBNEMsQ0FBQSxFQUFHLElBQUEsR0FBSyxDQUFwRDthQUFiLEVBRGQ7O1VBRUEsSUFBQTtBQUhGO1FBS0EsSUFBRyxRQUFIO1VBQ0UsSUFBMkIsSUFBQSxHQUFPLENBQUUsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLEdBQWdCLENBQWxCLENBQVAsSUFBZ0MsSUFBQyxDQUFBLFNBQTVEO1lBQUEsUUFBQSxJQUFZLFlBQVo7O1VBQ0EsUUFBQSxHQUFXLE1BRmI7U0FBQSxNQUFBO1VBSUUsSUFBd0MsSUFBQSxHQUFPLENBQUUsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLEdBQWdCLENBQWxCLENBQVAsSUFBZ0MsSUFBQyxDQUFBLFNBQXpFO1lBQUEsUUFBQSxJQUFZLElBQUMsQ0FBQSxhQUFELENBQWU7Y0FBQyxDQUFBLEVBQUUsSUFBSDthQUFmLEVBQVo7V0FKRjs7UUFNQSxRQUFBLElBQVk7TUFkZDtNQWVBLFFBQUEsSUFBWSxXQWxCZDtLQUFBLE1BQUE7TUFvQkUsUUFBQSxJQUFZLG1CQUFBLEdBQW9CLFNBQXBCLEdBQThCLEdBQTlCLEdBQWdDLENBQUMsVUFBQSxJQUFZLEVBQWIsQ0FBaEMsR0FBZ0Q7QUFDNUQ7QUFBQSxXQUFBLDhDQUFBOztRQUNFLFFBQUEsSUFBWSxJQUFDLENBQUEsbUJBQUQsQ0FDVjtVQUFBLE9BQUEsRUFBVSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVQsQ0FBaEIsQ0FBVjtVQUNBLEdBQUEsRUFBVSxDQUFBLEdBQUUsQ0FEWjtTQURVO0FBRGQ7TUFJQSxRQUFBLElBQVksU0F6QmQ7O0lBMEJBLElBQUEsSUFBUTtJQUNSLGFBQUEsR0FBZ0IsNERBQUEsR0FBNkQsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFuRSxHQUF3RTtJQUV4RixhQUFBLEdBQWdCLHdDQUFBLEdBRXNCLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FGNUIsR0FFb0M7SUFVcEQsSUFBRyxJQUFDLENBQUEsb0JBQUQsSUFBeUIsSUFBQyxDQUFBLGlCQUE3Qjs7WUFFYSxDQUFFLEtBQWIsQ0FBQTs7TUFFQSxLQUFBLEdBQVksSUFBQSxNQUFBLENBQUE7TUFFWixZQUFBLEdBQ0U7UUFBQSxPQUFBLEVBQVUsRUFBVjtRQUNBLElBQUEsRUFBVSxRQURWO1FBRUEsS0FBQSxFQUFVLEtBRlY7O01BSUYsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFyQixDQUEwQjtRQUN4QixLQUFBLEVBQVEsSUFBQyxDQUFBLElBQUksQ0FBQyxJQURVO1FBRXhCLEtBQUEsRUFBUSxNQUZnQjtPQUExQjtNQUtBLElBR0ssSUFBQyxDQUFBLGlCQUhOO1FBQUEsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFyQixDQUEwQjtVQUN4QixLQUFBLEVBQVEsQ0FBQSxDQUFHLDZCQUFILEVBQWtDO1lBQUEsT0FBQSxFQUFVLElBQUMsQ0FBQSxtQkFBWDtXQUFsQyxDQURnQjtVQUV4QixLQUFBLEVBQVEsWUFGZ0I7U0FBMUIsRUFBQTs7TUFLQSxJQUdLLElBQUMsQ0FBQSxvQkFITjtRQUFBLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBckIsQ0FBMEI7VUFDeEIsS0FBQSxFQUFRLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFEVTtVQUV4QixLQUFBLEVBQVEsTUFGZ0I7U0FBMUIsRUFBQTs7TUFLQSxJQUFDLENBQUEsVUFBRCxHQUFrQixJQUFBLGNBQUEsQ0FBZSxZQUFmO01BRWxCLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLFVBQVgsRUFBdUIsY0FBdkIsRUFBdUMsSUFBQyxDQUFBLFVBQXhDO01BQ0EsWUFBQSxHQUFlLDJEQUFBLEdBRUYsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUZKLEdBRWMsc0RBL0IvQjs7SUFvQ0EsU0FBQSxHQUFZLHVDQUFBLEdBSUEsSUFBQyxDQUFBLElBQUksQ0FBQyxjQUpOLEdBSXFCLGdGQUpyQixHQVFBLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFSTixHQVFvQjtJQUtoQyxJQUFBLElBQ0csQ0FBSSxDQUFJLElBQUMsQ0FBQSxPQUFSLEdBQXFCLGFBQXJCLEdBQXdDLEVBQXpDLENBQUEsR0FBNEMsR0FBNUMsR0FDQSxDQUFJLENBQUksSUFBQyxDQUFBLE9BQVIsR0FBcUIsYUFBckIsR0FBd0MsRUFBekMsQ0FEQSxHQUM0QyxHQUQ1QyxHQUVBLENBQUMsWUFBQSxJQUFnQixFQUFqQixDQUZBLEdBRW9CLEdBRnBCLEdBR0EsQ0FBQyxDQUFjLElBQUMsQ0FBQSxTQUFkLEdBQUEsU0FBQSxHQUFBLE1BQUQsQ0FBQSxJQUE2QixFQUE5QjtXQUVILElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsRUFBbUIsSUFBbkI7RUE5R2M7OzRCQXVIaEIsUUFBQSxHQUFVLFNBQUE7QUFFUixRQUFBOztTQUFXLENBQUUsVUFBYixDQUF3QixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxjQUFWLENBQXhCOzs7VUFDVyxDQUFFLE1BQWIsQ0FBQTs7SUFFQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7SUFDQSxJQUFDLENBQUEsT0FBRCxDQUFTLE9BQVQ7SUFFQSxJQUFBLENBQU8sSUFBQyxDQUFBLFNBQVI7TUFFRSxRQUFBLEdBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQXJCLENBQStCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBL0I7TUFDWCxJQUFHLFFBQUg7UUFDRSxJQUFDLENBQUEsVUFBRCxHQUFjLFFBQVEsQ0FBQztBQUV2QjtBQUFBLGFBQUEsOENBQUE7O1VBQ0UsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFiLEVBQW1CLElBQW5CLEVBQXlCLFVBQXpCO0FBREY7UUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLFFBQVEsQ0FBQztRQUN2QixPQUFBLEdBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsMkJBQUEsR0FBNEIsSUFBQyxDQUFBLFVBQTdCLEdBQXdDLEdBQWxEO1FBQ1YsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsZ0JBQWpCO1FBRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsUUFBUSxDQUFDO1FBQzFCLE9BQUEsR0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSwyQkFBQSxHQUE0QixJQUFDLENBQUEsYUFBN0IsR0FBMkMsR0FBckQ7ZUFDVixPQUFPLENBQUMsUUFBUixDQUFpQixjQUFqQixFQVpGO09BSEY7O0VBUlE7OzRCQXlCVixPQUFBLEdBQVMsU0FBQTtBQUVQLFFBQUE7SUFBQSxJQUFnQixJQUFDLENBQUEsV0FBakI7TUFBQSxJQUFDLENBQUEsU0FBRCxDQUFBLEVBQUE7O0lBRUEsSUFBRyxRQUFBLENBQVMsSUFBQyxDQUFBLGFBQVYsQ0FBQSxLQUE0QixJQUFDLENBQUEsS0FBSyxDQUFDLE1BQW5DLElBQThDLElBQUMsQ0FBQSxhQUFELEtBQWtCLENBQW5FO01BRUUsSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLEdBQWMsQ0FBZDtNQUNkLElBQUcsT0FBQSxDQUFRLENBQUEsQ0FBRSx1Q0FBRixFQUEyQztRQUFBLElBQUEsRUFBSyxJQUFMO09BQTNDLENBQVIsQ0FBSDtRQUNFLElBQUMsQ0FBQTtBQUNELGVBQU8sS0FGVDtPQUFBLE1BQUE7UUFJRSxJQUFDLENBQUEsUUFBRCx1Q0FBd0IsQ0FBRSxjQUFkLEdBQXdCLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixDQUFDLEdBQUQsQ0FBakIsQ0FBeEIsR0FBcUQsQ0FBQyxHQUFEO1FBQ2pFLElBQUMsQ0FBQSxVQUFELENBQVksTUFBWjtBQUNBLGVBQU8sTUFOVDtPQUhGOztJQVdBLElBQWdCLElBQUMsQ0FBQSxvQkFBRCxJQUF5QixJQUFDLENBQUEsYUFBRCxLQUFrQixDQUEzRDtBQUFBLGFBQU8sTUFBUDs7SUFFQSxJQUFnQixJQUFDLENBQUEsV0FBRCxLQUFnQixJQUFoQztBQUFBLGFBQU8sTUFBUDs7SUFDQSxJQUFnQixJQUFDLENBQUEsS0FBRCxLQUFVLENBQVYsSUFBZSxJQUFDLENBQUEsYUFBRCxLQUFrQixJQUFDLENBQUEsS0FBbEQ7QUFBQSxhQUFPLE1BQVA7O1dBQ0E7RUFuQk87OzRCQXFCVCxTQUFBLEdBQVcsU0FBQTtJQUlULElBQUcsb0JBQUg7QUFDRSxhQUFPLElBQUMsQ0FBQSxPQUFELENBQUEsRUFEVDtLQUFBLE1BQUE7QUFHRSxhQUFPLE1BSFQ7O1dBSUE7RUFSUzs7NEJBVVgsVUFBQSxHQUFZLFNBQUE7QUFDVixRQUFBO0lBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELElBQWE7SUFDeEIsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUVaLGFBQUEsR0FBbUIsSUFBQyxDQUFBLEtBQUQsS0FBVSxDQUFWLElBQWUsSUFBQyxDQUFBLGFBQUQsS0FBa0IsSUFBQyxDQUFBO0lBQ3JELFVBQUEsR0FBbUIsSUFBQyxDQUFBLG9CQUFELElBQXlCLElBQUMsQ0FBQSxhQUFELEtBQWtCO0lBQzlELGdCQUFBLEdBQW1CLElBQUMsQ0FBQSxVQUFELEtBQWU7SUFFbEMsSUFBRyxhQUFIO01BQ0UsUUFBUSxDQUFDLElBQVQsQ0FBYyxJQUFDLENBQUEsSUFBSSxDQUFDLGtCQUFwQixFQURGOztJQUdBLElBQUcsVUFBQSxJQUFjLENBQUksYUFBckI7TUFDRSxRQUFRLENBQUMsSUFBVCxDQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBcEI7TUFDQSxJQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosRUFGRjs7SUFJQSxJQUFHLGdCQUFIO01BQ0UsUUFBUSxDQUFDLElBQVQsQ0FBYyxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFwQixFQURGOztXQUdBLEtBQUssQ0FBQyxRQUFOLENBQWUsUUFBUSxDQUFDLElBQVQsQ0FBYyxNQUFkLENBQWYsRUFBc0MsSUFBdEM7RUFsQlU7OzRCQW9CWixTQUFBLEdBQVcsU0FBQTtBQUNULFFBQUE7SUFBQSxlQUFBLEdBQWtCO0lBQ2xCLFdBQUEsR0FBYztJQUNkLElBQWtDLENBQUksSUFBQyxDQUFBLG9CQUF2QztNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBeEI7O0FBR0E7QUFBQSxTQUFBLDZDQUFBOztNQUVFLElBQUcsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVQsR0FBYyxJQUFDLENBQUEsYUFBbEI7UUFDRSxXQUFZLENBQUEsQ0FBQSxDQUFaLEdBQ0U7VUFBQSxVQUFBLEVBQWEsSUFBQyxDQUFBLFVBQVcsQ0FBQSxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBVCxDQUF6QjtVQUNBLFNBQUEsRUFBYSxJQURiO1VBRko7T0FBQSxNQUFBO1FBS0UsV0FBWSxDQUFBLENBQUEsQ0FBWixHQUNFO1VBQUEsVUFBQSxFQUFhLFNBQWI7VUFDQSxTQUFBLEVBQVksSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBVCxDQURuQjtVQU5KOztBQUZGO0lBV0EsSUFBMEIsQ0FBSSxJQUFDLENBQUEsb0JBQS9CO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsTUFBakI7O0lBRUEsSUFBRyxJQUFDLENBQUEsU0FBSjtNQUNFLFdBQUEsR0FBYyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxtQkFBVixDQUE4QixDQUFDLEVBQS9CLENBQWtDLFVBQWxDO01BQ2QsYUFBQSxHQUFnQixRQUFBLENBQVMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsbUJBQVYsQ0FBOEIsQ0FBQyxHQUEvQixDQUFBLENBQVQsRUFGbEI7S0FBQSxNQUFBO01BSUUsV0FBQSxHQUFnQixJQUFDLENBQUE7TUFDakIsYUFBQSxHQUFnQixJQUFDLENBQUEsY0FMbkI7O0lBT0EsTUFBQSxHQUNFO01BQUEsd0JBQUEsRUFBK0IsSUFBQyxDQUFBLG9CQUFoQztNQUNBLGNBQUEsRUFBK0IsSUFBQyxDQUFBLFVBRGhDO01BRUEsNEJBQUEsRUFBK0IsSUFBQyxDQUFBLHdCQUZoQztNQUdBLHNCQUFBLEVBQStCLElBQUMsQ0FBQSxpQkFIaEM7TUFJQSxXQUFBLEVBQWtCLFdBSmxCO01BS0EsV0FBQSxFQUFrQixJQUFDLENBQUEsYUFMbkI7TUFNQSxPQUFBLEVBQWtCLFdBTmxCO01BT0EsYUFBQSxFQUFrQixhQVBsQjtNQVFBLGFBQUEsRUFBa0IsSUFBQyxDQUFBLFVBUm5CO01BU0EsZUFBQSxFQUFrQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxjQUFYLENBVGxCOztJQVVGLElBQTZCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBN0I7TUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxFQUFQOztJQUNBLGFBQUEsR0FDRTtNQUFBLE1BQUEsRUFBUyxNQUFUO01BQ0EsTUFBQSxFQUNFO1FBQUEsTUFBQSxFQUFTLElBQVQ7T0FGRjs7QUFJRixXQUFPO0VBM0NFOzs0QkE2Q1gsVUFBQSxHQUFZLFNBQUE7QUFDVixRQUFBO0lBQUEsV0FBQSxHQUFjO0FBRWQ7QUFBQSxTQUFBLDZDQUFBOztNQUNFLFdBQVksQ0FBQSxDQUFBLENBQVosR0FDRTtRQUFBLFVBQUEsRUFBYSxTQUFiO1FBQ0EsU0FBQSxFQUFhLElBRGI7O0FBRko7V0FLQSxNQUFBLEdBQ0U7TUFBQSx3QkFBQSxFQUErQixTQUEvQjtNQUNBLGNBQUEsRUFBK0IsU0FEL0I7TUFFQSw0QkFBQSxFQUErQixTQUYvQjtNQUdBLHNCQUFBLEVBQStCLFNBSC9CO01BSUEsV0FBQSxFQUFrQixTQUpsQjtNQUtBLFdBQUEsRUFBa0IsU0FMbEI7TUFNQSxPQUFBLEVBQWtCLFdBTmxCO01BT0EsYUFBQSxFQUFrQixTQVBsQjtNQVFBLGFBQUEsRUFBa0IsU0FSbEI7TUFTQSxlQUFBLEVBQWtCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGNBQVgsQ0FUbEI7O0VBVFE7OzRCQW9CWixPQUFBLEdBQVMsU0FBQTtXQUNQLGFBQUEsQ0FBYyxJQUFDLENBQUEsUUFBZjtFQURPOzs0QkFHVCxNQUFBLEdBQVEsU0FBQTtBQU1OLFdBQU87TUFBQyxPQUFBLEVBQVEsQ0FBVDtNQUFXLFNBQUEsRUFBVSxDQUFyQjtNQUF1QixPQUFBLEVBQVEsQ0FBL0I7TUFBaUMsS0FBQSxFQUFNLENBQXZDOztFQU5EOzs7O0dBMXBCb0IsUUFBUSxDQUFDLFVBQVUsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9HcmlkUnVuSXRlbVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBHcmlkUnVuSXRlbVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5NYXJpb25ldHRlLkl0ZW1WaWV3XG4gIGNsYXNzTmFtZTogXCJncmlkSXRlbVwiXG4gIHRlbXBsYXRlOiBKU1RbXCJHcmlkXCJdLFxuXG4gIGV2ZW50czogaWYgTW9kZXJuaXpyLnRvdWNoIHRoZW4ge1xuICAgICdjbGljayAuZ3JpZF9lbGVtZW50JyAgICAgOiAnZ3JpZENsaWNrJyAjY2xpY2tcbiAgICAnY2xpY2sgLmVuZF9vZl9ncmlkX2xpbmUnIDogJ2VuZE9mR3JpZExpbmVDbGljaycgI2NsaWNrXG4gICAgJ2NsaWNrIC5zdGFydF90aW1lJyAgOiAnc3RhcnRUaW1lcidcbiAgICAnY2xpY2sgLnN0b3BfdGltZScgICA6ICdzdG9wVGltZXInXG4gICAgJ2NsaWNrIC5yZXN0YXJ0JyAgICAgOiAncmVzdGFydFRpbWVyJ1xuICB9IGVsc2Uge1xuICAgICdjbGljayAuZW5kX29mX2dyaWRfbGluZScgOiAnZW5kT2ZHcmlkTGluZUNsaWNrJ1xuICAgICdjbGljayAuZ3JpZF9lbGVtZW50JyAgICAgOiAnZ3JpZENsaWNrJ1xuICAgICdjbGljayAuc3RhcnRfdGltZScgICAgICAgOiAnc3RhcnRUaW1lcidcbiAgICAnY2xpY2sgLnN0b3BfdGltZScgICAgICAgIDogJ3N0b3BUaW1lcidcbiAgICAnY2xpY2sgLnJlc3RhcnQnICAgICAgICAgIDogJ3Jlc3RhcnRUaW1lcidcbiAgfVxuXG4gIHJlc3RhcnRUaW1lcjogLT5cbiAgICBAc3RvcFRpbWVyKHNpbXBsZVN0b3A6dHJ1ZSkgaWYgQHRpbWVSdW5uaW5nXG5cbiAgICBAcmVzZXRWYXJpYWJsZXMoKVxuXG4gICAgQCRlbC5maW5kKFwiLmVsZW1lbnRfd3JvbmdcIikucmVtb3ZlQ2xhc3MgXCJlbGVtZW50X3dyb25nXCJcblxuICBncmlkQ2xpY2s6IChldmVudCkgPT5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgQG1vZGVIYW5kbGVyc1tAbW9kZV0/KGV2ZW50KVxuXG4gIG1hcmtIYW5kbGVyOiAoZXZlbnQpID0+XG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIGluZGV4ID0gJHRhcmdldC5hdHRyKCdkYXRhLWluZGV4JylcblxuICAgIGluZGV4SXNudEJlbG93TGFzdEF0dGVtcHRlZCA9IHBhcnNlSW50KGluZGV4KSA+IHBhcnNlSW50KEBsYXN0QXR0ZW1wdGVkKVxuICAgIGxhc3RBdHRlbXB0ZWRJc250WmVybyAgICAgICA9IHBhcnNlSW50KEBsYXN0QXR0ZW1wdGVkKSAhPSAwXG4gICAgY29ycmVjdGlvbnNEaXNhYmxlZCAgICAgICAgID0gQGRhdGFFbnRyeSBpcyBmYWxzZSBhbmQgQHBhcmVudD8uZW5hYmxlQ29ycmVjdGlvbnMgaXMgZmFsc2VcblxuICAgIHJldHVybiBpZiBjb3JyZWN0aW9uc0Rpc2FibGVkICYmIGxhc3RBdHRlbXB0ZWRJc250WmVybyAmJiBpbmRleElzbnRCZWxvd0xhc3RBdHRlbXB0ZWRcblxuICAgIEBtYXJrRWxlbWVudChpbmRleClcbiAgICBAY2hlY2tBdXRvc3RvcCgpIGlmIEBhdXRvc3RvcCAhPSAwXG5cblxuICBpbnRlcm1lZGlhdGVJdGVtSGFuZGxlcjogKGV2ZW50KSA9PlxuICAgIEB0aW1lSW50ZXJtZWRpYXRlQ2FwdHVyZWQgPSBAZ2V0VGltZSgpIC0gQHN0YXJ0VGltZVxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBpbmRleCA9ICR0YXJnZXQuYXR0cignZGF0YS1pbmRleCcpXG4gICAgQGl0ZW1BdFRpbWUgPSBpbmRleFxuICAgICR0YXJnZXQuYWRkQ2xhc3MgXCJlbGVtZW50X21pbnV0ZVwiXG4gICAgQHVwZGF0ZU1vZGUgXCJtYXJrXCJcblxuICBjaGVja0F1dG9zdG9wOiAtPlxuICAgIGlmIEB0aW1lUnVubmluZ1xuICAgICAgYXV0b0NvdW50ID0gMFxuICAgICAgZm9yIGkgaW4gWzAuLkBhdXRvc3RvcC0xXVxuICAgICAgICBpZiBAZ3JpZE91dHB1dFtpXSA9PSBcImNvcnJlY3RcIiB0aGVuIGJyZWFrXG4gICAgICAgIGF1dG9Db3VudCsrXG4gICAgICBpZiBAYXV0b3N0b3BwZWQgPT0gZmFsc2VcbiAgICAgICAgaWYgYXV0b0NvdW50ID09IEBhdXRvc3RvcCB0aGVuIEBhdXRvc3RvcFRlc3QoKVxuICAgICAgaWYgQGF1dG9zdG9wcGVkID09IHRydWUgJiYgYXV0b0NvdW50IDwgQGF1dG9zdG9wICYmIEB1bmRvYWJsZSA9PSB0cnVlIHRoZW4gQHVuQXV0b3N0b3BUZXN0KClcblxuICAgICAgICAjIG1vZGUgaXMgdXNlZCBmb3Igb3BlcmF0aW9ucyBsaWtlIHByZS1wb3B1bGF0aW5nIHRoZSBncmlkIHdoZW4gZG9pbmcgY29ycmVjdGlvbnMuXG4gIG1hcmtFbGVtZW50OiAoaW5kZXgsIHZhbHVlID0gbnVsbCwgbW9kZSkgLT5cbiAgICAjIGlmIGxhc3QgYXR0ZW1wdGVkIGhhcyBiZWVuIHNldCwgYW5kIHRoZSBjbGljayBpcyBhYm92ZSBpdCwgdGhlbiBjYW5jZWxcblxuICAgIGNvcnJlY3Rpb25zRGlzYWJsZWQgICAgICAgICA9IEBkYXRhRW50cnkgaXMgZmFsc2UgYW5kIEBwYXJlbnQ/LmVuYWJsZUNvcnJlY3Rpb25zPyBhbmQgQHBhcmVudD8uZW5hYmxlQ29ycmVjdGlvbnMgaXMgZmFsc2VcbiAgICBsYXN0QXR0ZW1wdGVkSXNudFplcm8gICAgICAgPSBwYXJzZUludChAbGFzdEF0dGVtcHRlZCkgIT0gMFxuICAgIGluZGV4SXNudEJlbG93TGFzdEF0dGVtcHRlZCA9IHBhcnNlSW50KGluZGV4KSA+IHBhcnNlSW50KEBsYXN0QXR0ZW1wdGVkKVxuXG4gICAgcmV0dXJuIGlmIGNvcnJlY3Rpb25zRGlzYWJsZWQgYW5kIGxhc3RBdHRlbXB0ZWRJc250WmVybyBhbmQgaW5kZXhJc250QmVsb3dMYXN0QXR0ZW1wdGVkXG5cbiAgICAkdGFyZ2V0ID0gQCRlbC5maW5kKFwiLmdyaWRfZWxlbWVudFtkYXRhLWluZGV4PSN7aW5kZXh9XVwiKVxuICAgIGlmIG1vZGUgIT0gJ3BvcHVsYXRlJ1xuICAgICAgQG1hcmtSZWNvcmQucHVzaCBpbmRleFxuXG4gICAgaWYgbm90IEBhdXRvc3RvcHBlZFxuICAgICAgaWYgdmFsdWUgPT0gbnVsbCAjIG5vdCBzcGVjaWZ5aW5nIHRoZSB2YWx1ZSwganVzdCB0b2dnbGVcbiAgICAgICAgQGdyaWRPdXRwdXRbaW5kZXgtMV0gPSBpZiAoQGdyaWRPdXRwdXRbaW5kZXgtMV0gPT0gXCJjb3JyZWN0XCIpIHRoZW4gXCJpbmNvcnJlY3RcIiBlbHNlIFwiY29ycmVjdFwiXG4gICAgICAgICR0YXJnZXQudG9nZ2xlQ2xhc3MgXCJlbGVtZW50X3dyb25nXCJcbiAgICAgIGVsc2UgIyB2YWx1ZSBzcGVjaWZpZWRcbiAgICAgICAgQGdyaWRPdXRwdXRbaW5kZXgtMV0gPSB2YWx1ZVxuICAgICAgICBpZiB2YWx1ZSA9PSBcImluY29ycmVjdFwiXG4gICAgICAgICAgJHRhcmdldC5hZGRDbGFzcyBcImVsZW1lbnRfd3JvbmdcIlxuICAgICAgICBlbHNlIGlmIHZhbHVlID09IFwiY29ycmVjdFwiXG4gICAgICAgICAgJHRhcmdldC5yZW1vdmVDbGFzcyBcImVsZW1lbnRfd3JvbmdcIlxuXG4gIGVuZE9mR3JpZExpbmVDbGljazogKGV2ZW50KSAtPlxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBpZiBAbW9kZSA9PSBcIm1hcmtcIlxuICAgICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuXG4gICAgICAjIGlmIHdoYXQgd2UgY2xpY2tlZCBpcyBhbHJlYWR5IG1hcmtlZCB3cm9uZ1xuICAgICAgaWYgJHRhcmdldC5oYXNDbGFzcyhcImVsZW1lbnRfd3JvbmdcIilcbiAgICAgICAgIyBZRVMsIG1hcmsgaXQgcmlnaHRcbiAgICAgICAgJHRhcmdldC5yZW1vdmVDbGFzcyBcImVsZW1lbnRfd3JvbmdcIlxuICAgICAgICBpbmRleCA9ICR0YXJnZXQuYXR0cignZGF0YS1pbmRleCcpXG4gICAgICAgIGZvciBpIGluIFtpbmRleC4uKGluZGV4LShAY29sdW1ucy0xKSldXG4gICAgICAgICAgQG1hcmtFbGVtZW50IGksIFwiY29ycmVjdFwiXG4gICAgICBlbHNlIGlmICEkdGFyZ2V0Lmhhc0NsYXNzKFwiZWxlbWVudF93cm9uZ1wiKSAmJiAhQGF1dG9zdG9wcGVkXG4gICAgICAgICMgTk8sIG1hcmsgaXQgd3JvbmdcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyBcImVsZW1lbnRfd3JvbmdcIlxuICAgICAgICBpbmRleCA9ICR0YXJnZXQuYXR0cignZGF0YS1pbmRleCcpXG4gICAgICAgIGZvciBpIGluIFtpbmRleC4uKGluZGV4LShAY29sdW1ucy0xKSldXG4gICAgICAgICAgQG1hcmtFbGVtZW50IGksIFwiaW5jb3JyZWN0XCJcblxuICAgICAgQGNoZWNrQXV0b3N0b3AoKSBpZiBAYXV0b3N0b3AgIT0gMFxuXG4gIGxhc3RIYW5kbGVyOiAoZXZlbnQsIGluZGV4KSA9PlxuICAgIGlmIGluZGV4P1xuICAgICAgJHRhcmdldCA9IEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRbZGF0YS1pbmRleD0je2luZGV4fV1cIilcbiAgICBlbHNlXG4gICAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgICBpbmRleCAgID0gJHRhcmdldC5hdHRyKCdkYXRhLWluZGV4JylcblxuICAgIGlmIGluZGV4IC0gMSA+PSBAZ3JpZE91dHB1dC5sYXN0SW5kZXhPZihcImluY29ycmVjdFwiKVxuICAgICAgQCRlbC5maW5kKFwiLmVsZW1lbnRfbGFzdFwiKS5yZW1vdmVDbGFzcyBcImVsZW1lbnRfbGFzdFwiXG4gICAgICAkdGFyZ2V0LmFkZENsYXNzIFwiZWxlbWVudF9sYXN0XCJcbiAgICAgIEBsYXN0QXR0ZW1wdGVkID0gaW5kZXhcblxuICBmbG9hdE9uOiAtPlxuICAgIHRpbWVyID0gQCRlbC5maW5kKCcudGltZXInKVxuICAgIHRpbWVyUG9zID0gdGltZXIub2Zmc2V0KClcbiAgICAkKHdpbmRvdykub24gJ3Njcm9sbCcsIC0+XG4gICAgICBzY3JvbGxQb3MgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKClcbiAgICAgIGlmIHNjcm9sbFBvcyA+PSB0aW1lclBvcy50b3BcbiAgICAgICAgdGltZXIuY3NzXG4gICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIlxuICAgICAgICAgIHRvcDogXCIxMCVcIlxuICAgICAgICAgIGxlZnQ6IFwiODAlXCJcbiAgICAgIGVsc2VcbiAgICAgICAgdGltZXIuY3NzXG4gICAgICAgICAgcG9zaXRpb246IFwiaW5pdGlhbFwiXG4gICAgICAgICAgdG9wOiBcImluaXRpYWxcIlxuICAgICAgICAgIGxlZnQ6IFwiaW5pdGlhbFwiXG5cbiAgZmxvYXRPZmY6IC0+XG4gICAgJCh3aW5kb3cpLm9mZiAnc2Nyb2xsJ1xuICAgIHRpbWVyID0gQCRlbC5maW5kKCcudGltZXInKVxuICAgIHRpbWVyLmNzc1xuICAgICAgcG9zaXRpb246IFwiaW5pdGlhbFwiXG4gICAgICB0b3A6IFwiaW5pdGlhbFwiXG4gICAgICBsZWZ0OiBcImluaXRpYWxcIlxuXG5cbiAgc3RhcnRUaW1lcjogLT5cbiAgICBpZiBAdGltZXJTdG9wcGVkID09IGZhbHNlICYmIEB0aW1lUnVubmluZyA9PSBmYWxzZVxuICAgICAgQGludGVydmFsID0gc2V0SW50ZXJ2YWwoIEB1cGRhdGVDb3VudGRvd24sIDEwMDAgKSAjIG1hZ2ljIG51bWJlclxuICAgICAgQHN0YXJ0VGltZSA9IEBnZXRUaW1lKClcbiAgICAgIEB0aW1lUnVubmluZyA9IHRydWVcbiAgICAgIEB1cGRhdGVNb2RlIFwibWFya1wiXG4gICAgICBAZW5hYmxlR3JpZCgpXG4gICAgICBAdXBkYXRlQ291bnRkb3duKClcbiAgICAgIEBmbG9hdE9uKClcblxuICBlbmFibGVHcmlkOiAtPlxuICAgIEAkZWwuZmluZChcInRhYmxlLmRpc2FibGVkLCBkaXYuZGlzYWJsZWRcIikucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKVxuXG4gIHN0b3BUaW1lcjogKGV2ZW50LCBtZXNzYWdlID0gZmFsc2UpIC0+XG5cbiAgICByZXR1cm4gaWYgQHRpbWVSdW5uaW5nICE9IHRydWUgIyBzdG9wIG9ubHkgaWYgbmVlZGVkXG5cbiAgICBpZiBldmVudD8udGFyZ2V0XG4gICAgICBAbGFzdEhhbmRsZXIobnVsbCwgQGl0ZW1zLmxlbmd0aClcblxuICAgICMgZG8gdGhlc2UgYWx3YXlzXG4gICAgY2xlYXJJbnRlcnZhbCBAaW50ZXJ2YWxcbiAgICBAc3RvcFRpbWUgPSBAZ2V0VGltZSgpXG4gICAgQHRpbWVSdW5uaW5nID0gZmFsc2VcbiAgICBAdGltZXJTdG9wcGVkID0gdHJ1ZVxuICAgIEBmbG9hdE9mZigpXG5cbiAgICBAdXBkYXRlQ291bnRkb3duKClcblxuICAgICMgZG8gdGhlc2UgaWYgaXQncyBub3QgYSBzaW1wbGUgc3RvcFxuICAgICNpZiBub3QgZXZlbnQ/LnNpbXBsZVN0b3BcbiAgICAgICNVdGlscy5mbGFzaCgpXG5cblxuICBhdXRvc3RvcFRlc3Q6IC0+XG4gICAgVXRpbHMuZmxhc2goKVxuICAgIGNsZWFySW50ZXJ2YWwgQGludGVydmFsXG4gICAgQHN0b3BUaW1lID0gQGdldFRpbWUoKVxuICAgIEBhdXRvc3RvcHBlZCA9IHRydWVcbiAgICBAdGltZXJTdG9wcGVkID0gdHJ1ZVxuICAgIEB0aW1lUnVubmluZyA9IGZhbHNlXG4gICAgQCRlbC5maW5kKFwiLmdyaWRfZWxlbWVudFwiKS5zbGljZShAYXV0b3N0b3AtMSxAYXV0b3N0b3ApLmFkZENsYXNzIFwiZWxlbWVudF9sYXN0XCIgI2pxdWVyeSBpcyB3ZWlyZCBzb21ldGltZXNcbiAgICBAbGFzdEF0dGVtcHRlZCA9IEBhdXRvc3RvcFxuICAgIEB0aW1lb3V0ID0gc2V0VGltZW91dChAcmVtb3ZlVW5kbywgMzAwMCkgIyBnaXZlIHRoZW0gMyBzZWNvbmRzIHRvIHVuZG8uIG1hZ2ljIG51bWJlclxuICAgIFV0aWxzLnRvcEFsZXJ0IEB0ZXh0LmF1dG9zdG9wXG5cbiAgcmVtb3ZlVW5kbzogPT5cbiAgICBAdW5kb2FibGUgPSBmYWxzZVxuICAgIEB1cGRhdGVNb2RlIFwiZGlzYWJsZWRcIlxuICAgIGNsZWFyVGltZW91dChAdGltZW91dClcblxuICB1bkF1dG9zdG9wVGVzdDogLT5cbiAgICBAaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChAdXBkYXRlQ291bnRkb3duLCAxMDAwICkgIyBtYWdpYyBudW1iZXJcbiAgICBAdXBkYXRlQ291bnRkb3duKClcbiAgICBAYXV0b3N0b3BwZWQgPSBmYWxzZVxuICAgIEBsYXN0QXR0ZW1wdGVkID0gMFxuICAgIEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRcIikuc2xpY2UoQGF1dG9zdG9wLTEsQGF1dG9zdG9wKS5yZW1vdmVDbGFzcyBcImVsZW1lbnRfbGFzdFwiXG4gICAgQHRpbWVSdW5uaW5nID0gdHJ1ZVxuICAgIEB1cGRhdGVNb2RlIFwibWFya1wiXG4gICAgVXRpbHMudG9wQWxlcnQgdChcIkdyaWRSdW5WaWV3Lm1lc3NhZ2UuYXV0b3N0b3BfY2FuY2VsXCIpXG5cbiAgdXBkYXRlQ291bnRkb3duOiA9PlxuICAgICMgc29tZXRpbWVzIHRoZSBcInRpY2tcIiBkb2Vzbid0IGhhcHBlbiB3aXRoaW4gYSBzZWNvbmRcbiAgICBAdGltZUVsYXBzZWQgPSBNYXRoLm1pbihAZ2V0VGltZSgpIC0gQHN0YXJ0VGltZSwgQHRpbWVyKVxuXG4gICAgQHRpbWVSZW1haW5pbmcgPSBAdGltZXIgLSBAdGltZUVsYXBzZWRcblxuICAgIEAkZWwuZmluZChcIi50aW1lclwiKS5odG1sIEB0aW1lUmVtYWluaW5nXG5cbiAgICBpZiBAdGltZVJ1bm5pbmcgaXMgdHJ1ZSBhbmQgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkIGFuZCBAdGltZVJlbWFpbmluZyA8PSAwXG4gICAgICAgIEBzdG9wVGltZXIoc2ltcGxlU3RvcDp0cnVlKVxuICAgICAgICBVdGlscy5iYWNrZ3JvdW5kIFwicmVkXCJcbiAgICAgICAgXy5kZWxheShcbiAgICAgICAgICA9PlxuICAgICAgICAgICAgYWxlcnQgQHRleHQudG91Y2hMYXN0SXRlbVxuICAgICAgICAgICAgVXRpbHMuYmFja2dyb3VuZCBcIlwiXG4gICAgICAgICwgMWUzKSAjIG1hZ2ljIG51bWJlclxuXG4gICAgICAgIEB1cGRhdGVNb2RlIFwibGFzdFwiXG5cblxuICAgIGlmIEBjYXB0dXJlSXRlbUF0VGltZSAmJiAhQGdvdEludGVybWVkaWF0ZSAmJiAhQG1pbnV0ZU1lc3NhZ2UgJiYgQHRpbWVFbGFwc2VkID49IEBjYXB0dXJlQWZ0ZXJTZWNvbmRzXG4gICAgICBVdGlscy5mbGFzaCBcInllbGxvd1wiXG4gICAgICBVdGlscy5taWRBbGVydCB0KFwicGxlYXNlIHNlbGVjdCB0aGUgaXRlbSB0aGUgY2hpbGQgaXMgY3VycmVudGx5IGF0dGVtcHRpbmdcIilcbiAgICAgIEBtaW51dGVNZXNzYWdlID0gdHJ1ZVxuICAgICAgQG1vZGUgPSBcIm1pbnV0ZUl0ZW1cIlxuXG5cbiAgdXBkYXRlTW9kZTogKCBtb2RlID0gbnVsbCApID0+XG4gICAgIyBkb250JyBjaGFuZ2UgdGhlIG1vZGUgaWYgdGhlIHRpbWUgaGFzIG5ldmVyIGJlZW4gc3RhcnRlZFxuICAgIGlmIChtb2RlPT1udWxsICYmIEB0aW1lRWxhcHNlZCA9PSAwICYmIG5vdCBAZGF0YUVudHJ5KSB8fCBtb2RlID09IFwiZGlzYWJsZWRcIlxuICAgICAgQG1vZGVCdXR0b24/LnNldFZhbHVlIG51bGxcbiAgICBlbHNlIGlmIG1vZGU/ICMgbWFudWFsbHkgY2hhbmdlIHRoZSBtb2RlXG4gICAgICBAbW9kZSA9IG1vZGVcbiAgICAgIEBtb2RlQnV0dG9uPy5zZXRWYWx1ZSBAbW9kZVxuICAgIGVsc2UgIyBoYW5kbGUgYSBjbGljayBldmVudFxuICAgICAgQG1vZGUgPSBAbW9kZUJ1dHRvbj8uZ2V0VmFsdWUoKVxuXG4gIGdldFRpbWU6IC0+XG4gICAgTWF0aC5yb3VuZCgobmV3IERhdGUoKSkuZ2V0VGltZSgpIC8gMTAwMClcblxuICByZXNldFZhcmlhYmxlczogLT5cblxuICAgIEB0aW1lciAgICA9IHBhcnNlSW50KEBtb2RlbC5nZXQoXCJ0aW1lclwiKSkgfHwgMFxuICAgIEB1bnRpbWVkICA9IEB0aW1lciA9PSAwIHx8IEBkYXRhRW50cnkgIyBEbyBub3Qgc2hvdyB0aGUgdGltZXIgaWYgaXQncyBkaXNhc2JsZWQgb3IgZGF0YSBlbnRyeSBtb2RlXG5cbiAgICBAZ290TWludXRlSXRlbSA9IGZhbHNlXG4gICAgQG1pbnV0ZU1lc3NhZ2UgPSBmYWxzZVxuICAgIEBpdGVtQXRUaW1lID0gbnVsbFxuXG4gICAgQHRpbWVJbnRlcm1lZGlhdGVDYXB0dXJlZCA9IG51bGxcblxuICAgIEBtYXJrUmVjb3JkID0gW11cblxuICAgIEB0aW1lclN0b3BwZWQgPSBmYWxzZVxuXG4gICAgQHN0YXJ0VGltZSA9IDBcbiAgICBAc3RvcFRpbWUgID0gMFxuICAgIEB0aW1lRWxhcHNlZCA9IDBcbiAgICBAdGltZVJlbWFpbmluZyA9IEB0aW1lclxuICAgIEBsYXN0QXR0ZW1wdGVkID0gMFxuXG4gICAgQGludGVydmFsID0gbnVsbFxuXG4gICAgQHVuZG9hYmxlID0gdHJ1ZVxuXG4gICAgQHRpbWVSdW5uaW5nID0gZmFsc2VcblxuXG4gICAgQGl0ZW1zICAgID0gXy5jb21wYWN0KEBtb2RlbC5nZXQoXCJpdGVtc1wiKSkgIyBtaWxkIHNhbml0aXphdGlvbiwgaGFwcGVucyBhdCBzYXZlIHRvb1xuXG4gICAgQGl0ZW1NYXAgPSBbXVxuICAgIEBtYXBJdGVtID0gW11cblxuICAgIGlmIEBtb2RlbC5oYXMoXCJyYW5kb21pemVcIikgJiYgQG1vZGVsLmdldChcInJhbmRvbWl6ZVwiKVxuICAgICAgQGl0ZW1NYXAgPSBAaXRlbXMubWFwICh2YWx1ZSwgaSkgLT4gaVxuXG4gICAgICBAaXRlbXMuZm9yRWFjaCAoaXRlbSwgaSkgLT5cbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIEBpdGVtcy5sZW5ndGgpXG4gICAgICAgIHRlbXBWYWx1ZSA9IEBpdGVtTWFwW3RlbXBdXG4gICAgICAgIEBpdGVtTWFwW3RlbXBdID0gQGl0ZW1NYXBbaV1cbiAgICAgICAgQGl0ZW1NYXBbaV0gPSB0ZW1wVmFsdWVcbiAgICAgICwgQFxuXG4gICAgICBAaXRlbU1hcC5mb3JFYWNoIChpdGVtLCBpKSAtPlxuICAgICAgICBAbWFwSXRlbVtAaXRlbU1hcFtpXV0gPSBpXG4gICAgICAsIEBcbiAgICBlbHNlXG4gICAgICBAaXRlbXMuZm9yRWFjaCAoaXRlbSwgaSkgLT5cbiAgICAgICAgQGl0ZW1NYXBbaV0gPSBpXG4gICAgICAgIEBtYXBJdGVtW2ldID0gaVxuICAgICAgLCBAXG5cbiAgICBpZiAhQGNhcHR1cmVMYXN0QXR0ZW1wdGVkICYmICFAY2FwdHVyZUl0ZW1BdFRpbWVcbiAgICAgIEBtb2RlID0gXCJtYXJrXCJcbiAgICBlbHNlXG4gICAgICBAbW9kZSA9IFwiZGlzYWJsZWRcIlxuXG4gICAgQG1vZGUgPSBcIm1hcmtcIiBpZiBAZGF0YUVudHJ5XG5cbiAgICBAZ3JpZE91dHB1dCA9IEBpdGVtcy5tYXAgLT4gJ2NvcnJlY3QnXG4gICAgQGNvbHVtbnMgID0gcGFyc2VJbnQoQG1vZGVsLmdldChcImNvbHVtbnNcIikpIHx8IDNcblxuICAgIEBhdXRvc3RvcCA9IGlmIEB1bnRpbWVkIHRoZW4gMCBlbHNlIChwYXJzZUludChAbW9kZWwuZ2V0KFwiYXV0b3N0b3BcIikpIHx8IDApXG4gICAgQGF1dG9zdG9wcGVkID0gZmFsc2VcblxuICAgIEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRcIikucmVtb3ZlQ2xhc3MoXCJlbGVtZW50X3dyb25nXCIpLnJlbW92ZUNsYXNzKFwiZWxlbWVudF9sYXN0XCIpLmFkZENsYXNzKFwiZGlzYWJsZWRcIilcbiAgICBAJGVsLmZpbmQoXCJ0YWJsZVwiKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpXG5cbiAgICBAJGVsLmZpbmQoXCIudGltZXJcIikuaHRtbCBAdGltZXJcblxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG5cbiAgICAgIHByZXZpb3VzID0gQG1vZGVsLnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcbiAgICAgIGlmIHByZXZpb3VzXG5cbiAgICAgICAgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkICAgICA9IHByZXZpb3VzLmNhcHR1cmVfbGFzdF9hdHRlbXB0ZWRcbiAgICAgICAgQGl0ZW1BdFRpbWUgICAgICAgICAgICAgICA9IHByZXZpb3VzLml0ZW1fYXRfdGltZVxuICAgICAgICBAdGltZUludGVybWVkaWF0ZUNhcHR1cmVkID0gcHJldmlvdXMudGltZV9pbnRlcm1lZGlhdGVfY2FwdHVyZWRcbiAgICAgICAgQGNhcHR1cmVJdGVtQXRUaW1lICAgICAgICA9IHByZXZpb3VzLmNhcHR1cmVfaXRlbV9hdF90aW1lXG4gICAgICAgIEBhdXRvc3RvcCAgICAgICAgICAgICAgICAgPSBwcmV2aW91cy5hdXRvX3N0b3BcbiAgICAgICAgQGxhc3RBdHRlbXB0ZWQgICAgICAgICAgICA9IHByZXZpb3VzLmF0dGVtcHRlZFxuICAgICAgICBAdGltZVJlbWFpbmluZyAgICAgICAgICAgID0gcHJldmlvdXMudGltZV9yZW1haW5cbiAgICAgICAgQG1hcmtSZWNvcmQgICAgICAgICAgICAgICA9IHByZXZpb3VzLm1hcmtfcmVjb3JkXG5cbiAgICBAdXBkYXRlTW9kZSBAbW9kZSBpZiBAbW9kZUJ1dHRvbj9cblxuICBpMThuOiAtPlxuXG4gICAgQHRleHQgPVxuICAgICAgYXV0b3N0b3AgICAgICAgICAgIDogdChcIkdyaWRSdW5WaWV3Lm1lc3NhZ2UuYXV0b3N0b3BcIilcbiAgICAgIHRvdWNoTGFzdEl0ZW0gICAgICA6IHQoXCJHcmlkUnVuVmlldy5tZXNzYWdlLnRvdWNoX2xhc3RfaXRlbVwiKVxuICAgICAgc3VidGVzdE5vdENvbXBsZXRlIDogdChcIkdyaWRSdW5WaWV3Lm1lc3NhZ2Uuc3VidGVzdF9ub3RfY29tcGxldGVcIilcblxuICAgICAgaW5wdXRNb2RlICAgICA6IHQoXCJHcmlkUnVuVmlldy5sYWJlbC5pbnB1dF9tb2RlXCIpXG4gICAgICB0aW1lUmVtYWluaW5nICA6IHQoXCJHcmlkUnVuVmlldy5sYWJlbC50aW1lX3JlbWFpbmluZ1wiKVxuICAgICAgd2FzQXV0b3N0b3BwZWQgOiB0KFwiR3JpZFJ1blZpZXcubGFiZWwud2FzX2F1dG9zdG9wcGVkXCIpXG5cbiAgICAgIG1hcmsgICAgICAgICAgOiB0KFwiR3JpZFJ1blZpZXcuYnV0dG9uLm1hcmtcIilcbiAgICAgIHN0YXJ0ICAgICAgICAgOiB0KFwiR3JpZFJ1blZpZXcuYnV0dG9uLnN0YXJ0XCIpXG4gICAgICBzdG9wICAgICAgICAgIDogdChcIkdyaWRSdW5WaWV3LmJ1dHRvbi5zdG9wXCIpXG4gICAgICByZXN0YXJ0ICAgICAgIDogdChcIkdyaWRSdW5WaWV3LmJ1dHRvbi5yZXN0YXJ0XCIpXG4gICAgICBsYXN0QXR0ZW1wdGVkIDogdChcIkdyaWRSdW5WaWV3LmJ1dHRvbi5sYXN0X2F0dGVtcHRlZFwiKVxuICAgICAgXCJoZWxwXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLmhlbHBcIilcblxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3ID0gQFxuICAgIEBpMThuKClcblxuICAgIEBmb250U3R5bGUgPSBcInN0eWxlPVxcXCJmb250LWZhbWlseTogI3tAbW9kZWwuZ2V0KCdmb250RmFtaWx5Jyl9ICFpbXBvcnRhbnQ7XFxcIlwiIGlmIEBtb2RlbC5nZXQoXCJmb250RmFtaWx5XCIpICE9IFwiXCJcblxuICAgIEBjYXB0dXJlQWZ0ZXJTZWNvbmRzICA9IGlmIEBtb2RlbC5oYXMoXCJjYXB0dXJlQWZ0ZXJTZWNvbmRzXCIpICB0aGVuIEBtb2RlbC5nZXQoXCJjYXB0dXJlQWZ0ZXJTZWNvbmRzXCIpICBlbHNlIDBcbiAgICBAY2FwdHVyZUl0ZW1BdFRpbWUgICAgPSBpZiBAbW9kZWwuaGFzKFwiY2FwdHVyZUl0ZW1BdFRpbWVcIikgICAgdGhlbiBAbW9kZWwuZ2V0KFwiY2FwdHVyZUl0ZW1BdFRpbWVcIikgICAgZWxzZSBmYWxzZVxuICAgIEBjYXB0dXJlTGFzdEF0dGVtcHRlZCA9IGlmIEBtb2RlbC5oYXMoXCJjYXB0dXJlTGFzdEF0dGVtcHRlZFwiKSB0aGVuIEBtb2RlbC5nZXQoXCJjYXB0dXJlTGFzdEF0dGVtcHRlZFwiKSBlbHNlIHRydWVcbiAgICBAZW5kT2ZMaW5lICAgICAgICAgICAgPSBpZiBAbW9kZWwuaGFzKFwiZW5kT2ZMaW5lXCIpICAgICAgICAgICAgdGhlbiBAbW9kZWwuZ2V0KFwiZW5kT2ZMaW5lXCIpICAgICAgICAgICAgZWxzZSB0cnVlXG5cbiAgICBAbGF5b3V0TW9kZSA9IGlmIEBtb2RlbC5oYXMoXCJsYXlvdXRNb2RlXCIpIHRoZW4gQG1vZGVsLmdldChcImxheW91dE1vZGVcIikgZWxzZSBcImZpeGVkXCJcbiAgICBAZm9udFNpemUgICA9IGlmIEBtb2RlbC5oYXMoXCJmb250U2l6ZVwiKSAgIHRoZW4gQG1vZGVsLmdldChcImZvbnRTaXplXCIpICAgZWxzZSBcIm5vcm1hbFwiXG5cbiAgICBpZiBAZm9udFNpemUgPT0gXCJzbWFsbFwiXG4gICAgICBmb250U2l6ZUNsYXNzID0gXCJmb250X3NpemVfc21hbGxcIlxuICAgIGVsc2VcbiAgICAgIGZvbnRTaXplQ2xhc3MgPSBcIlwiXG5cbiAgICBAcnRsID0gQG1vZGVsLmdldEJvb2xlYW4gXCJydGxcIlxuICAgIEAkZWwuYWRkQ2xhc3MgXCJydGwtZ3JpZFwiIGlmIEBydGxcblxuICAgIEB0b3RhbFRpbWUgPSBAbW9kZWwuZ2V0KFwidGltZXJcIikgfHwgMFxuXG4gICAgQG1vZGVIYW5kbGVycyA9XG4gICAgICBcIm1hcmtcIiAgICAgICA6IEBtYXJrSGFuZGxlclxuICAgICAgXCJsYXN0XCIgICAgICAgOiBAbGFzdEhhbmRsZXJcbiAgICAgIFwibWludXRlSXRlbVwiIDogQGludGVybWVkaWF0ZUl0ZW1IYW5kbGVyXG4gICAgICBkaXNhYmxlZCAgICAgOiAkLm5vb3BcblxuICAgIEBkYXRhRW50cnkgPSBmYWxzZSB1bmxlc3Mgb3B0aW9ucy5kYXRhRW50cnlcblxuICAgIEBtb2RlbCAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCA9IEBtb2RlbC5wYXJlbnRcblxuICAgIEByZXNldFZhcmlhYmxlcygpXG5cbiAgICBAZ3JpZEVsZW1lbnQgICAgICAgICA9IF8udGVtcGxhdGUgXCI8dGQ+PGJ1dHRvbiBkYXRhLWxhYmVsPSd7e2xhYmVsfX0nIGRhdGEtaW5kZXg9J3t7aX19JyBjbGFzcz0nZ3JpZF9lbGVtZW50ICN7Zm9udFNpemVDbGFzc30nICN7QGZvbnRTdHlsZSB8fCBcIlwifT57e2xhYmVsfX08L2J1dHRvbj48L3RkPlwiXG4gICAgQHZhcmlhYmxlR3JpZEVsZW1lbnQgPSBfLnRlbXBsYXRlIFwiPGJ1dHRvbiBkYXRhLWxhYmVsPSd7e2xhYmVsfX0nIGRhdGEtaW5kZXg9J3t7aX19JyBjbGFzcz0nZ3JpZF9lbGVtZW50ICN7Zm9udFNpemVDbGFzc30nICN7QGZvbnRTdHlsZSB8fCBcIlwifT57e2xhYmVsfX08L2J1dHRvbj5cIlxuXG4gICAgaWYgQGxheW91dE1vZGUgPT0gXCJmaXhlZFwiXG4gICAgICBAZW5kT2ZHcmlkTGluZSA9IF8udGVtcGxhdGUgXCI8dGQ+PGJ1dHRvbiBkYXRhLWluZGV4PSd7e2l9fScgY2xhc3M9J2VuZF9vZl9ncmlkX2xpbmUnPio8L2J1dHRvbj48L3RkPlwiXG4gICAgZWxzZVxuICAgICAgQGVuZE9mR3JpZExpbmUgPSBfLnRlbXBsYXRlIFwiXCJcblxuICAgIGxhYmVscyA9IHt9XG4gICAgbGFiZWxzLnRleHQgPSBAdGV4dFxuICAgIEBtb2RlbC5zZXQoJ2xhYmVscycsIGxhYmVscylcblxuICB1aTpcbiAgICBtb2RlQnV0dG9uOiBcIi5tb2RlLWJ1dHRvblwiXG5cbiAgb25CZWZvcmVSZW5kZXI6IC0+XG5cbiAgICBkb25lID0gMFxuXG4gICAgc3RhcnRUaW1lckhUTUwgPSBcIjxkaXYgY2xhc3M9J3RpbWVyX3dyYXBwZXInPjxidXR0b24gY2xhc3M9J3N0YXJ0X3RpbWUgdGltZSc+I3tAdGV4dC5zdGFydH08L2J1dHRvbj48ZGl2IGNsYXNzPSd0aW1lcic+I3tAdGltZXJ9PC9kaXY+PC9kaXY+XCJcblxuICAgIGRpc2FibGluZyA9IFwiZGlzYWJsZWRcIiB1bmxlc3MgQHVudGltZWRcblxuICAgIGRpc3BsYXlSdGwgPSBcInJ0bF9tb2RlXCIgaWYgQHJ0bFxuXG4gICAgaHRtbCA9IGlmIG5vdCBAdW50aW1lZCB0aGVuIHN0YXJ0VGltZXJIVE1MIGVsc2UgXCJcIlxuXG4gICAgZ3JpZEhUTUwgPSBcIlwiXG5cbiAgICBpZiBAbGF5b3V0TW9kZSA9PSBcImZpeGVkXCJcbiAgICAgIGdyaWRIVE1MICs9IFwiPHRhYmxlIGNsYXNzPSdncmlkICN7ZGlzYWJsaW5nfSAje2Rpc3BsYXlSdGx8fCcnfSc+XCJcbiAgICAgIGZpcnN0Um93ID0gdHJ1ZVxuICAgICAgbG9vcFxuICAgICAgICBicmVhayBpZiBkb25lID4gQGl0ZW1zLmxlbmd0aFxuICAgICAgICBncmlkSFRNTCArPSBcIjx0cj5cIlxuICAgICAgICBmb3IgaSBpbiBbMS4uQGNvbHVtbnNdXG4gICAgICAgICAgaWYgZG9uZSA8IEBpdGVtcy5sZW5ndGhcbiAgICAgICAgICAgIGdyaWRIVE1MICs9IEBncmlkRWxlbWVudCB7IGxhYmVsIDogXy5lc2NhcGUoQGl0ZW1zW0BpdGVtTWFwW2RvbmVdXSksIGk6IGRvbmUrMSB9XG4gICAgICAgICAgZG9uZSsrXG4gICAgICAgICMgZG9uJ3Qgc2hvdyB0aGUgc2tpcCByb3cgYnV0dG9uIGZvciB0aGUgZmlyc3Qgcm93XG4gICAgICAgIGlmIGZpcnN0Um93XG4gICAgICAgICAgZ3JpZEhUTUwgKz0gXCI8dGQ+PC90ZD5cIiBpZiBkb25lIDwgKCBAaXRlbXMubGVuZ3RoICsgMSApICYmIEBlbmRPZkxpbmVcbiAgICAgICAgICBmaXJzdFJvdyA9IGZhbHNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBncmlkSFRNTCArPSBAZW5kT2ZHcmlkTGluZSh7aTpkb25lfSkgaWYgZG9uZSA8ICggQGl0ZW1zLmxlbmd0aCArIDEgKSAmJiBAZW5kT2ZMaW5lXG5cbiAgICAgICAgZ3JpZEhUTUwgKz0gXCI8L3RyPlwiXG4gICAgICBncmlkSFRNTCArPSBcIjwvdGFibGU+XCJcbiAgICBlbHNlXG4gICAgICBncmlkSFRNTCArPSBcIjxkaXYgY2xhc3M9J2dyaWQgI3tkaXNhYmxpbmd9ICN7ZGlzcGxheVJ0bHx8Jyd9Jz5cIlxuICAgICAgZm9yIGl0ZW0sIGkgaW4gQGl0ZW1zXG4gICAgICAgIGdyaWRIVE1MICs9IEB2YXJpYWJsZUdyaWRFbGVtZW50XG4gICAgICAgICAgXCJsYWJlbFwiIDogXy5lc2NhcGUoQGl0ZW1zW0BpdGVtTWFwW2ldXSlcbiAgICAgICAgICBcImlcIiAgICAgOiBpKzFcbiAgICAgIGdyaWRIVE1MICs9IFwiPC9kaXY+XCJcbiAgICBodG1sICs9IGdyaWRIVE1MXG4gICAgc3RvcFRpbWVySFRNTCA9IFwiPGRpdiBjbGFzcz0ndGltZXJfd3JhcHBlcic+PGJ1dHRvbiBjbGFzcz0nc3RvcF90aW1lIHRpbWUnPiN7QHRleHQuc3RvcH08L2J1dHRvbj48L2Rpdj5cIlxuXG4gICAgcmVzdGFydEJ1dHRvbiA9IFwiXG4gICAgICA8ZGl2PlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdyZXN0YXJ0IGNvbW1hbmQnPiN7QHRleHQucmVzdGFydH08L2J1dHRvbj5cbiAgICAgICAgPGJyPlxuICAgICAgPC9kaXY+XG4gICAgXCJcblxuICAgICNcbiAgICAjIE1vZGUgc2VsZWN0b3JcbiAgICAjXG5cbiAgICAjIGlmIGFueSBvdGhlciBvcHRpb24gaXMgYXZhaWFsYmUgb3RoZXIgdGhhbiBtYXJrLCB0aGVuIHNob3cgdGhlIHNlbGVjdG9yXG4gICAgaWYgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkIHx8IEBjYXB0dXJlSXRlbUF0VGltZVxuXG4gICAgICBAbW9kZUJ1dHRvbj8uY2xvc2UoKVxuXG4gICAgICBtb2RlbCA9IG5ldyBCdXR0b24oKVxuXG4gICAgICBidXR0b25Db25maWcgPVxuICAgICAgICBvcHRpb25zIDogW11cbiAgICAgICAgbW9kZSAgICA6IFwic2luZ2xlXCJcbiAgICAgICAgbW9kZWwgICA6IG1vZGVsXG5cbiAgICAgIGJ1dHRvbkNvbmZpZy5vcHRpb25zLnB1c2gge1xuICAgICAgICBsYWJlbCA6IEB0ZXh0Lm1hcmtcbiAgICAgICAgdmFsdWUgOiBcIm1hcmtcIlxuICAgICAgfVxuXG4gICAgICBidXR0b25Db25maWcub3B0aW9ucy5wdXNoIHtcbiAgICAgICAgbGFiZWwgOiB0KCBcIml0ZW0gYXQgX19zZWNvbmRzX18gc2Vjb25kc1wiLCBzZWNvbmRzIDogQGNhcHR1cmVBZnRlclNlY29uZHMgKVxuICAgICAgICB2YWx1ZSA6IFwibWludXRlSXRlbVwiXG4gICAgICB9IGlmIEBjYXB0dXJlSXRlbUF0VGltZVxuXG4gICAgICBidXR0b25Db25maWcub3B0aW9ucy5wdXNoIHtcbiAgICAgICAgbGFiZWwgOiBAdGV4dC5sYXN0QXR0ZW1wdGVkXG4gICAgICAgIHZhbHVlIDogXCJsYXN0XCJcbiAgICAgIH0gaWYgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkXG5cbiAgICAgIEBtb2RlQnV0dG9uID0gbmV3IEJ1dHRvbkl0ZW1WaWV3IGJ1dHRvbkNvbmZpZ1xuXG4gICAgICBAbGlzdGVuVG8gQG1vZGVCdXR0b24sIFwiY2hhbmdlIGNsaWNrXCIsIEB1cGRhdGVNb2RlXG4gICAgICBtb2RlU2VsZWN0b3IgPSBcIlxuICAgICAgICA8ZGl2IGNsYXNzPSdncmlkX21vZGVfd3JhcHBlciBxdWVzdGlvbiBjbGVhcmZpeCc+XG4gICAgICAgICAgPGxhYmVsPiN7QHRleHQuaW5wdXRNb2RlfTwvbGFiZWw+PGJyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J21vZGUtYnV0dG9uJz48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIlxuXG4gICAgZGF0YUVudHJ5ID0gXCJcbiAgICAgIDx0YWJsZSBjbGFzcz0nY2xhc3NfdGFibGUnPlxuXG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+I3tAdGV4dC53YXNBdXRvc3RvcHBlZH08L3RkPjx0ZD48aW5wdXQgdHlwZT0nY2hlY2tib3gnIGNsYXNzPSdkYXRhX2F1dG9zdG9wcGVkJz48L3RkPlxuICAgICAgICA8L3RyPlxuXG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+I3tAdGV4dC50aW1lUmVtYWluaW5nfTwvdGQ+PHRkPjxpbnB1dCB0eXBlPSdudW1iZXInIGNsYXNzPSdkYXRhX3RpbWVfcmVtYWluJz48L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgPC90YWJsZT5cbiAgICBcIlxuXG4gICAgaHRtbCArPSBcIlxuICAgICAgI3tpZiBub3QgQHVudGltZWQgdGhlbiBzdG9wVGltZXJIVE1MIGVsc2UgXCJcIn1cbiAgICAgICN7aWYgbm90IEB1bnRpbWVkIHRoZW4gcmVzdGFydEJ1dHRvbiBlbHNlIFwiXCJ9XG4gICAgICAje21vZGVTZWxlY3RvciB8fCAnJ31cbiAgICAgICN7KGRhdGFFbnRyeSBpZiBAZGF0YUVudHJ5KSB8fCAnJ31cbiAgICBcIlxuICAgIEBtb2RlbC5zZXQoJ2dyaWQnLCBodG1sKVxuXG4jICAgIEAkZWwuaHRtbCBodG1sXG5cbiMgICAgQG1vZGVCdXR0b24uc2V0RWxlbWVudCBAJGVsLmZpbmQgXCIubW9kZS1idXR0b25cIlxuIyAgICBAbW9kZUJ1dHRvbi5yZW5kZXIoKVxuXG5cblxuICBvblJlbmRlcjogPT5cblxuICAgIEBtb2RlQnV0dG9uPy5zZXRFbGVtZW50IEAkZWwuZmluZCBcIi5tb2RlLWJ1dHRvblwiXG4gICAgQG1vZGVCdXR0b24/LnJlbmRlcigpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgICBAdHJpZ2dlciBcInJlYWR5XCJcblxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG5cbiAgICAgIHByZXZpb3VzID0gQG1vZGVsLnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcbiAgICAgIGlmIHByZXZpb3VzXG4gICAgICAgIEBtYXJrUmVjb3JkID0gcHJldmlvdXMubWFya19yZWNvcmRcblxuICAgICAgICBmb3IgaXRlbSwgaSBpbiBAbWFya1JlY29yZFxuICAgICAgICAgIEBtYXJrRWxlbWVudCBpdGVtLCBudWxsLCAncG9wdWxhdGUnXG5cbiAgICAgICAgQGl0ZW1BdFRpbWUgPSBwcmV2aW91cy5pdGVtX2F0X3RpbWVcbiAgICAgICAgJHRhcmdldCA9IEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRbZGF0YS1pbmRleD0je0BpdGVtQXRUaW1lfV1cIilcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyBcImVsZW1lbnRfbWludXRlXCJcblxuICAgICAgICBAbGFzdEF0dGVtcHRlZCA9IHByZXZpb3VzLmF0dGVtcHRlZFxuICAgICAgICAkdGFyZ2V0ID0gQCRlbC5maW5kKFwiLmdyaWRfZWxlbWVudFtkYXRhLWluZGV4PSN7QGxhc3RBdHRlbXB0ZWR9XVwiKVxuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzIFwiZWxlbWVudF9sYXN0XCJcblxuICBpc1ZhbGlkOiAtPlxuICAgICMgU3RvcCB0aW1lciBpZiBzdGlsbCBydW5uaW5nLiBJc3N1ZSAjMjQwXG4gICAgQHN0b3BUaW1lcigpIGlmIEB0aW1lUnVubmluZ1xuXG4gICAgaWYgcGFyc2VJbnQoQGxhc3RBdHRlbXB0ZWQpIGlzIEBpdGVtcy5sZW5ndGggYW5kIEB0aW1lUmVtYWluaW5nIGlzIDBcblxuICAgICAgaXRlbSA9IEBpdGVtc1tAaXRlbXMubGVuZ3RoLTFdXG4gICAgICBpZiBjb25maXJtKHQoXCJHcmlkUnVuVmlldy5tZXNzYWdlLmxhc3RfaXRlbV9jb25maXJtXCIsIGl0ZW06aXRlbSkpXG4gICAgICAgIEB1cGRhdGVNb2RlXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIEBtZXNzYWdlcyA9IGlmIEBtZXNzYWdlcz8ucHVzaCB0aGVuIEBtZXNzYWdlcy5jb25jYXQoW21zZ10pIGVsc2UgW21zZ11cbiAgICAgICAgQHVwZGF0ZU1vZGUgXCJsYXN0XCJcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICByZXR1cm4gZmFsc2UgaWYgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkICYmIEBsYXN0QXR0ZW1wdGVkID09IDBcbiAgICAjIG1pZ2h0IG5lZWQgdG8gbGV0IGl0IGtub3cgaWYgaXQncyB0aW1lZCBvciB1bnRpbWVkIHRvbyA6OnNocnVnOjpcbiAgICByZXR1cm4gZmFsc2UgaWYgQHRpbWVSdW5uaW5nID09IHRydWVcbiAgICByZXR1cm4gZmFsc2UgaWYgQHRpbWVyICE9IDAgJiYgQHRpbWVSZW1haW5pbmcgPT0gQHRpbWVyXG4gICAgdHJ1ZVxuXG4gIHRlc3RWYWxpZDogLT5cbiMgICAgY29uc29sZS5sb2coXCJHcmlkUnVuSXRlbVZpZXcgdGVzdFZhbGlkLlwiKVxuICAgICMgICAgaWYgbm90IEBwcm90b3R5cGVSZW5kZXJlZCB0aGVuIHJldHVybiBmYWxzZVxuICAgICMgICAgY3VycmVudFZpZXcgPSBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXdcbiAgICBpZiBAaXNWYWxpZD9cbiAgICAgIHJldHVybiBAaXNWYWxpZCgpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgdHJ1ZVxuXG4gIHNob3dFcnJvcnM6IC0+XG4gICAgbWVzc2FnZXMgPSBAbWVzc2FnZXMgfHwgW11cbiAgICBAbWVzc2FnZXMgPSBbXVxuXG4gICAgdGltZXJIYXNudFJ1biAgICA9IEB0aW1lciAhPSAwICYmIEB0aW1lUmVtYWluaW5nID09IEB0aW1lclxuICAgIG5vTGFzdEl0ZW0gICAgICAgPSBAY2FwdHVyZUxhc3RBdHRlbXB0ZWQgJiYgQGxhc3RBdHRlbXB0ZWQgPT0gMFxuICAgIHRpbWVTdGlsbFJ1bm5pbmcgPSBAdGltZVJ1bmluZyA9PSB0cnVlXG5cbiAgICBpZiB0aW1lckhhc250UnVuXG4gICAgICBtZXNzYWdlcy5wdXNoIEB0ZXh0LnN1YnRlc3ROb3RDb21wbGV0ZVxuXG4gICAgaWYgbm9MYXN0SXRlbSAmJiBub3QgdGltZXJIYXNudFJ1blxuICAgICAgbWVzc2FnZXMucHVzaCBAdGV4dC50b3VjaExhc3RJdGVtXG4gICAgICBAdXBkYXRlTW9kZSBcImxhc3RcIlxuXG4gICAgaWYgdGltZVN0aWxsUnVubmluZ1xuICAgICAgbWVzc2FnZXMucHVzaCBAdGV4dC50aW1lU3RpbGxSdW5uaW5nXG5cbiAgICBVdGlscy5taWRBbGVydCBtZXNzYWdlcy5qb2luKFwiPGJyPlwiKSwgMzAwMCAjIG1hZ2ljIG51bWJlclxuXG4gIGdldFJlc3VsdDogLT5cbiAgICBjb21wbGV0ZVJlc3VsdHMgPSBbXVxuICAgIGl0ZW1SZXN1bHRzID0gW11cbiAgICBAbGFzdEF0dGVtcHRlZCA9IEBpdGVtcy5sZW5ndGggaWYgbm90IEBjYXB0dXJlTGFzdEF0dGVtcHRlZFxuIyAgICBjb25zb2xlLmxvZyhcIkBsYXN0QXR0ZW1wdGVkOiBcIiArIEBsYXN0QXR0ZW1wdGVkKVxuXG4gICAgZm9yIGl0ZW0sIGkgaW4gQGl0ZW1zXG5cbiAgICAgIGlmIEBtYXBJdGVtW2ldIDwgQGxhc3RBdHRlbXB0ZWRcbiAgICAgICAgaXRlbVJlc3VsdHNbaV0gPVxuICAgICAgICAgIGl0ZW1SZXN1bHQgOiBAZ3JpZE91dHB1dFtAbWFwSXRlbVtpXV1cbiAgICAgICAgICBpdGVtTGFiZWwgIDogaXRlbVxuICAgICAgZWxzZVxuICAgICAgICBpdGVtUmVzdWx0c1tpXSA9XG4gICAgICAgICAgaXRlbVJlc3VsdCA6IFwibWlzc2luZ1wiXG4gICAgICAgICAgaXRlbUxhYmVsIDogQGl0ZW1zW0BtYXBJdGVtW2ldXVxuXG4gICAgQGxhc3RBdHRlbXB0ZWQgPSBmYWxzZSBpZiBub3QgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkXG5cbiAgICBpZiBAZGF0YUVudHJ5XG4gICAgICBhdXRvc3RvcHBlZCA9IEAkZWwuZmluZChcIi5kYXRhX2F1dG9zdG9wcGVkXCIpLmlzKFwiOmNoZWNrZWRcIilcbiAgICAgIHRpbWVSZW1haW5pbmcgPSBwYXJzZUludChAJGVsLmZpbmQoXCIuZGF0YV90aW1lX3JlbWFpblwiKS52YWwoKSlcbiAgICBlbHNlXG4gICAgICBhdXRvc3RvcHBlZCAgID0gQGF1dG9zdG9wcGVkXG4gICAgICB0aW1lUmVtYWluaW5nID0gQHRpbWVSZW1haW5pbmdcblxuICAgIHJlc3VsdCA9XG4gICAgICBcImNhcHR1cmVfbGFzdF9hdHRlbXB0ZWRcIiAgICAgOiBAY2FwdHVyZUxhc3RBdHRlbXB0ZWRcbiAgICAgIFwiaXRlbV9hdF90aW1lXCIgICAgICAgICAgICAgICA6IEBpdGVtQXRUaW1lXG4gICAgICBcInRpbWVfaW50ZXJtZWRpYXRlX2NhcHR1cmVkXCIgOiBAdGltZUludGVybWVkaWF0ZUNhcHR1cmVkXG4gICAgICBcImNhcHR1cmVfaXRlbV9hdF90aW1lXCIgICAgICAgOiBAY2FwdHVyZUl0ZW1BdFRpbWVcbiAgICAgIFwiYXV0b19zdG9wXCIgICAgIDogYXV0b3N0b3BwZWRcbiAgICAgIFwiYXR0ZW1wdGVkXCIgICAgIDogQGxhc3RBdHRlbXB0ZWRcbiAgICAgIFwiaXRlbXNcIiAgICAgICAgIDogaXRlbVJlc3VsdHNcbiAgICAgIFwidGltZV9yZW1haW5cIiAgIDogdGltZVJlbWFpbmluZ1xuICAgICAgXCJtYXJrX3JlY29yZFwiICAgOiBAbWFya1JlY29yZFxuICAgICAgXCJ2YXJpYWJsZV9uYW1lXCIgOiBAbW9kZWwuZ2V0KFwidmFyaWFibGVOYW1lXCIpXG4gICAgaGFzaCA9IEBtb2RlbC5nZXQoXCJoYXNoXCIpIGlmIEBtb2RlbC5oYXMoXCJoYXNoXCIpXG4gICAgc3VidGVzdFJlc3VsdCA9XG4gICAgICAnYm9keScgOiByZXN1bHRcbiAgICAgICdtZXRhJyA6XG4gICAgICAgICdoYXNoJyA6IGhhc2hcbiMgICAgcmV0dXJuIHJlc3VsdFxuICAgIHJldHVybiBzdWJ0ZXN0UmVzdWx0XG5cbiAgZ2V0U2tpcHBlZDogLT5cbiAgICBpdGVtUmVzdWx0cyA9IFtdXG5cbiAgICBmb3IgaXRlbSwgaSBpbiBAaXRlbXNcbiAgICAgIGl0ZW1SZXN1bHRzW2ldID1cbiAgICAgICAgaXRlbVJlc3VsdCA6IFwic2tpcHBlZFwiXG4gICAgICAgIGl0ZW1MYWJlbCAgOiBpdGVtXG5cbiAgICByZXN1bHQgPVxuICAgICAgXCJjYXB0dXJlX2xhc3RfYXR0ZW1wdGVkXCIgICAgIDogXCJza2lwcGVkXCJcbiAgICAgIFwiaXRlbV9hdF90aW1lXCIgICAgICAgICAgICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcInRpbWVfaW50ZXJtZWRpYXRlX2NhcHR1cmVkXCIgOiBcInNraXBwZWRcIlxuICAgICAgXCJjYXB0dXJlX2l0ZW1fYXRfdGltZVwiICAgICAgIDogXCJza2lwcGVkXCJcbiAgICAgIFwiYXV0b19zdG9wXCIgICAgIDogXCJza2lwcGVkXCJcbiAgICAgIFwiYXR0ZW1wdGVkXCIgICAgIDogXCJza2lwcGVkXCJcbiAgICAgIFwiaXRlbXNcIiAgICAgICAgIDogaXRlbVJlc3VsdHNcbiAgICAgIFwidGltZV9yZW1haW5cIiAgIDogXCJza2lwcGVkXCJcbiAgICAgIFwibWFya19yZWNvcmRcIiAgIDogXCJza2lwcGVkXCJcbiAgICAgIFwidmFyaWFibGVfbmFtZVwiIDogQG1vZGVsLmdldChcInZhcmlhYmxlTmFtZVwiKVxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgY2xlYXJJbnRlcnZhbChAaW50ZXJ2YWwpXG5cbiAgZ2V0U3VtOiAtPlxuIyAgICBpZiBAcHJvdG90eXBlVmlldy5nZXRTdW0/XG4jICAgICAgcmV0dXJuIEBwcm90b3R5cGVWaWV3LmdldFN1bSgpXG4jICAgIGVsc2VcbiMgbWF5YmUgYSBiZXR0ZXIgZmFsbGJhY2tcbiMgICAgY29uc29sZS5sb2coXCJUaGlzIHZpZXcgZG9lcyBub3QgcmV0dXJuIGEgc3VtLCBjb3JyZWN0P1wiKVxuICAgIHJldHVybiB7Y29ycmVjdDowLGluY29ycmVjdDowLG1pc3Npbmc6MCx0b3RhbDowfVxuXG4iXX0=

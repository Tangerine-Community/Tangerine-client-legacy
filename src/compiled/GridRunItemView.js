var GridRunItemView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

GridRunItemView = (function(superClass) {
  extend(GridRunItemView, superClass);

  function GridRunItemView() {
    this.updateMode = bind(this.updateMode, this);
    this.updateCountdown = bind(this.updateCountdown, this);
    this.removeUndo = bind(this.removeUndo, this);
    this.lastHandler = bind(this.lastHandler, this);
    this.intermediateItemHandler = bind(this.intermediateItemHandler, this);
    this.markHandler = bind(this.markHandler, this);
    this.gridClick = bind(this.gridClick, this);
    this.onRender = bind(this.onRender, this);
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
    this.model.set('labels', labels);
    this.skippable = this.model.get("skippable") === true || this.model.get("skippable") === "true";
    this.backable = (this.model.get("backButton") === true || this.model.get("backButton") === "true") && this.parent.index !== 0;
    this.parent.displaySkip(this.skippable);
    return this.parent.displayBack(this.backable);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0dyaWRSdW5JdGVtVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxlQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7Ozs7OzRCQUNKLFNBQUEsR0FBVzs7NEJBQ1gsUUFBQSxHQUFVLEdBQUksQ0FBQSxNQUFBOzs0QkFFZCxNQUFBLEdBQVcsU0FBUyxDQUFDLEtBQWIsR0FBd0I7SUFDOUIscUJBQUEsRUFBNEIsV0FERTtJQUU5Qix5QkFBQSxFQUE0QixvQkFGRTtJQUc5QixtQkFBQSxFQUF1QixZQUhPO0lBSTlCLGtCQUFBLEVBQXVCLFdBSk87SUFLOUIsZ0JBQUEsRUFBdUIsY0FMTztHQUF4QixHQU1EO0lBQ0wseUJBQUEsRUFBNEIsb0JBRHZCO0lBRUwscUJBQUEsRUFBNEIsV0FGdkI7SUFHTCxtQkFBQSxFQUE0QixZQUh2QjtJQUlMLGtCQUFBLEVBQTRCLFdBSnZCO0lBS0wsZ0JBQUEsRUFBNEIsY0FMdkI7Ozs0QkFRUCxJQUFBLEdBQU0sU0FBQTtXQUVKLElBQUMsQ0FBQSxJQUFELEdBQ0U7TUFBQSxRQUFBLEVBQXFCLENBQUEsQ0FBRSw4QkFBRixDQUFyQjtNQUNBLGFBQUEsRUFBcUIsQ0FBQSxDQUFFLHFDQUFGLENBRHJCO01BRUEsa0JBQUEsRUFBcUIsQ0FBQSxDQUFFLDBDQUFGLENBRnJCO01BSUEsU0FBQSxFQUFnQixDQUFBLENBQUUsOEJBQUYsQ0FKaEI7TUFLQSxhQUFBLEVBQWlCLENBQUEsQ0FBRSxrQ0FBRixDQUxqQjtNQU1BLGNBQUEsRUFBaUIsQ0FBQSxDQUFFLG1DQUFGLENBTmpCO01BUUEsSUFBQSxFQUFnQixDQUFBLENBQUUseUJBQUYsQ0FSaEI7TUFTQSxLQUFBLEVBQWdCLENBQUEsQ0FBRSwwQkFBRixDQVRoQjtNQVVBLElBQUEsRUFBZ0IsQ0FBQSxDQUFFLHlCQUFGLENBVmhCO01BV0EsT0FBQSxFQUFnQixDQUFBLENBQUUsNEJBQUYsQ0FYaEI7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VCxNQUFBLEdBQVEsU0FBQTtBQU1OLFdBQU87TUFBQyxPQUFBLEVBQVEsQ0FBVDtNQUFXLFNBQUEsRUFBVSxDQUFyQjtNQUF1QixPQUFBLEVBQVEsQ0FBL0I7TUFBaUMsS0FBQSxFQUFNLENBQXZDOztFQU5EOzs7O0dBL3FCb0IsUUFBUSxDQUFDLFVBQVUsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9HcmlkUnVuSXRlbVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBHcmlkUnVuSXRlbVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5NYXJpb25ldHRlLkl0ZW1WaWV3XG4gIGNsYXNzTmFtZTogXCJncmlkSXRlbVwiXG4gIHRlbXBsYXRlOiBKU1RbXCJHcmlkXCJdLFxuXG4gIGV2ZW50czogaWYgTW9kZXJuaXpyLnRvdWNoIHRoZW4ge1xuICAgICdjbGljayAuZ3JpZF9lbGVtZW50JyAgICAgOiAnZ3JpZENsaWNrJyAjY2xpY2tcbiAgICAnY2xpY2sgLmVuZF9vZl9ncmlkX2xpbmUnIDogJ2VuZE9mR3JpZExpbmVDbGljaycgI2NsaWNrXG4gICAgJ2NsaWNrIC5zdGFydF90aW1lJyAgOiAnc3RhcnRUaW1lcidcbiAgICAnY2xpY2sgLnN0b3BfdGltZScgICA6ICdzdG9wVGltZXInXG4gICAgJ2NsaWNrIC5yZXN0YXJ0JyAgICAgOiAncmVzdGFydFRpbWVyJ1xuICB9IGVsc2Uge1xuICAgICdjbGljayAuZW5kX29mX2dyaWRfbGluZScgOiAnZW5kT2ZHcmlkTGluZUNsaWNrJ1xuICAgICdjbGljayAuZ3JpZF9lbGVtZW50JyAgICAgOiAnZ3JpZENsaWNrJ1xuICAgICdjbGljayAuc3RhcnRfdGltZScgICAgICAgOiAnc3RhcnRUaW1lcidcbiAgICAnY2xpY2sgLnN0b3BfdGltZScgICAgICAgIDogJ3N0b3BUaW1lcidcbiAgICAnY2xpY2sgLnJlc3RhcnQnICAgICAgICAgIDogJ3Jlc3RhcnRUaW1lcidcbiAgfVxuXG4gIGkxOG46IC0+XG5cbiAgICBAdGV4dCA9XG4gICAgICBhdXRvc3RvcCAgICAgICAgICAgOiB0KFwiR3JpZFJ1blZpZXcubWVzc2FnZS5hdXRvc3RvcFwiKVxuICAgICAgdG91Y2hMYXN0SXRlbSAgICAgIDogdChcIkdyaWRSdW5WaWV3Lm1lc3NhZ2UudG91Y2hfbGFzdF9pdGVtXCIpXG4gICAgICBzdWJ0ZXN0Tm90Q29tcGxldGUgOiB0KFwiR3JpZFJ1blZpZXcubWVzc2FnZS5zdWJ0ZXN0X25vdF9jb21wbGV0ZVwiKVxuXG4gICAgICBpbnB1dE1vZGUgICAgIDogdChcIkdyaWRSdW5WaWV3LmxhYmVsLmlucHV0X21vZGVcIilcbiAgICAgIHRpbWVSZW1haW5pbmcgIDogdChcIkdyaWRSdW5WaWV3LmxhYmVsLnRpbWVfcmVtYWluaW5nXCIpXG4gICAgICB3YXNBdXRvc3RvcHBlZCA6IHQoXCJHcmlkUnVuVmlldy5sYWJlbC53YXNfYXV0b3N0b3BwZWRcIilcblxuICAgICAgbWFyayAgICAgICAgICA6IHQoXCJHcmlkUnVuVmlldy5idXR0b24ubWFya1wiKVxuICAgICAgc3RhcnQgICAgICAgICA6IHQoXCJHcmlkUnVuVmlldy5idXR0b24uc3RhcnRcIilcbiAgICAgIHN0b3AgICAgICAgICAgOiB0KFwiR3JpZFJ1blZpZXcuYnV0dG9uLnN0b3BcIilcbiAgICAgIHJlc3RhcnQgICAgICAgOiB0KFwiR3JpZFJ1blZpZXcuYnV0dG9uLnJlc3RhcnRcIilcbiAgICAgIGxhc3RBdHRlbXB0ZWQgOiB0KFwiR3JpZFJ1blZpZXcuYnV0dG9uLmxhc3RfYXR0ZW1wdGVkXCIpXG4gICAgICBcImhlbHBcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uaGVscFwiKVxuXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcgPSBAXG4gICAgQGkxOG4oKVxuXG4gICAgQGZvbnRTdHlsZSA9IFwic3R5bGU9XFxcImZvbnQtZmFtaWx5OiAje0Btb2RlbC5nZXQoJ2ZvbnRGYW1pbHknKX0gIWltcG9ydGFudDtcXFwiXCIgaWYgQG1vZGVsLmdldChcImZvbnRGYW1pbHlcIikgIT0gXCJcIlxuXG4gICAgQGNhcHR1cmVBZnRlclNlY29uZHMgID0gaWYgQG1vZGVsLmhhcyhcImNhcHR1cmVBZnRlclNlY29uZHNcIikgIHRoZW4gQG1vZGVsLmdldChcImNhcHR1cmVBZnRlclNlY29uZHNcIikgIGVsc2UgMFxuICAgIEBjYXB0dXJlSXRlbUF0VGltZSAgICA9IGlmIEBtb2RlbC5oYXMoXCJjYXB0dXJlSXRlbUF0VGltZVwiKSAgICB0aGVuIEBtb2RlbC5nZXQoXCJjYXB0dXJlSXRlbUF0VGltZVwiKSAgICBlbHNlIGZhbHNlXG4gICAgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkID0gaWYgQG1vZGVsLmhhcyhcImNhcHR1cmVMYXN0QXR0ZW1wdGVkXCIpIHRoZW4gQG1vZGVsLmdldChcImNhcHR1cmVMYXN0QXR0ZW1wdGVkXCIpIGVsc2UgdHJ1ZVxuICAgIEBlbmRPZkxpbmUgICAgICAgICAgICA9IGlmIEBtb2RlbC5oYXMoXCJlbmRPZkxpbmVcIikgICAgICAgICAgICB0aGVuIEBtb2RlbC5nZXQoXCJlbmRPZkxpbmVcIikgICAgICAgICAgICBlbHNlIHRydWVcblxuICAgIEBsYXlvdXRNb2RlID0gaWYgQG1vZGVsLmhhcyhcImxheW91dE1vZGVcIikgdGhlbiBAbW9kZWwuZ2V0KFwibGF5b3V0TW9kZVwiKSBlbHNlIFwiZml4ZWRcIlxuICAgIEBmb250U2l6ZSAgID0gaWYgQG1vZGVsLmhhcyhcImZvbnRTaXplXCIpICAgdGhlbiBAbW9kZWwuZ2V0KFwiZm9udFNpemVcIikgICBlbHNlIFwibm9ybWFsXCJcblxuICAgIGlmIEBmb250U2l6ZSA9PSBcInNtYWxsXCJcbiAgICAgIGZvbnRTaXplQ2xhc3MgPSBcImZvbnRfc2l6ZV9zbWFsbFwiXG4gICAgZWxzZVxuICAgICAgZm9udFNpemVDbGFzcyA9IFwiXCJcblxuICAgIEBydGwgPSBAbW9kZWwuZ2V0Qm9vbGVhbiBcInJ0bFwiXG4gICAgQCRlbC5hZGRDbGFzcyBcInJ0bC1ncmlkXCIgaWYgQHJ0bFxuXG4gICAgQHRvdGFsVGltZSA9IEBtb2RlbC5nZXQoXCJ0aW1lclwiKSB8fCAwXG5cbiAgICBAbW9kZUhhbmRsZXJzID1cbiAgICAgIFwibWFya1wiICAgICAgIDogQG1hcmtIYW5kbGVyXG4gICAgICBcImxhc3RcIiAgICAgICA6IEBsYXN0SGFuZGxlclxuICAgICAgXCJtaW51dGVJdGVtXCIgOiBAaW50ZXJtZWRpYXRlSXRlbUhhbmRsZXJcbiAgICAgIGRpc2FibGVkICAgICA6ICQubm9vcFxuXG4gICAgQGRhdGFFbnRyeSA9IGZhbHNlIHVubGVzcyBvcHRpb25zLmRhdGFFbnRyeVxuXG4gICAgQG1vZGVsICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ID0gQG1vZGVsLnBhcmVudFxuXG4gICAgQHJlc2V0VmFyaWFibGVzKClcblxuICAgIEBncmlkRWxlbWVudCAgICAgICAgID0gXy50ZW1wbGF0ZSBcIjx0ZD48YnV0dG9uIGRhdGEtbGFiZWw9J3t7bGFiZWx9fScgZGF0YS1pbmRleD0ne3tpfX0nIGNsYXNzPSdncmlkX2VsZW1lbnQgI3tmb250U2l6ZUNsYXNzfScgI3tAZm9udFN0eWxlIHx8IFwiXCJ9Pnt7bGFiZWx9fTwvYnV0dG9uPjwvdGQ+XCJcbiAgICBAdmFyaWFibGVHcmlkRWxlbWVudCA9IF8udGVtcGxhdGUgXCI8YnV0dG9uIGRhdGEtbGFiZWw9J3t7bGFiZWx9fScgZGF0YS1pbmRleD0ne3tpfX0nIGNsYXNzPSdncmlkX2VsZW1lbnQgI3tmb250U2l6ZUNsYXNzfScgI3tAZm9udFN0eWxlIHx8IFwiXCJ9Pnt7bGFiZWx9fTwvYnV0dG9uPlwiXG5cbiAgICBpZiBAbGF5b3V0TW9kZSA9PSBcImZpeGVkXCJcbiAgICAgIEBlbmRPZkdyaWRMaW5lID0gXy50ZW1wbGF0ZSBcIjx0ZD48YnV0dG9uIGRhdGEtaW5kZXg9J3t7aX19JyBjbGFzcz0nZW5kX29mX2dyaWRfbGluZSc+KjwvYnV0dG9uPjwvdGQ+XCJcbiAgICBlbHNlXG4gICAgICBAZW5kT2ZHcmlkTGluZSA9IF8udGVtcGxhdGUgXCJcIlxuXG4gICAgbGFiZWxzID0ge31cbiAgICBsYWJlbHMudGV4dCA9IEB0ZXh0XG4gICAgQG1vZGVsLnNldCgnbGFiZWxzJywgbGFiZWxzKVxuXG4gICAgQHNraXBwYWJsZSA9IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gdHJ1ZSB8fCBAbW9kZWwuZ2V0KFwic2tpcHBhYmxlXCIpID09IFwidHJ1ZVwiXG4gICAgQGJhY2thYmxlID0gKCBAbW9kZWwuZ2V0KFwiYmFja0J1dHRvblwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IFwidHJ1ZVwiICkgYW5kIEBwYXJlbnQuaW5kZXggaXNudCAwXG5cbiMgICAgaWYgQHNraXBwYWJsZSA9PSB0cnVlXG4jICAgIGNvbnNvbGUubG9nKFwiY2hhbmdlOnNraXBwYWJsZVwiKVxuIyAgICAgIEB0cmlnZ2VyICdza2lwcGFibGU6Y2hhbmdlZCdcbiAgICBAcGFyZW50LmRpc3BsYXlTa2lwKEBza2lwcGFibGUpXG5cblxuIyAgICBpZiBAYmFja2FibGUgPT0gdHJ1ZVxuIyAgICBjb25zb2xlLmxvZyhcImNoYW5nZTpiYWNrYWJsZVwiKVxuIyAgICAgIEB0cmlnZ2VyICdiYWNrYWJsZTpjaGFuZ2VkJ1xuICAgIEBwYXJlbnQuZGlzcGxheUJhY2soQGJhY2thYmxlKVxuXG4jICAgIHVpID0ge31cbiMgICAgdWkuc2tpcEJ1dHRvbiA9IFwiPGJ1dHRvbiBjbGFzcz0nc2tpcCBuYXZpZ2F0aW9uJz4je0B0ZXh0LnNraXB9PC9idXR0b24+XCIgaWYgc2tpcHBhYmxlXG4jICAgIHVpLmJhY2tCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J3N1YnRlc3QtYmFjayBuYXZpZ2F0aW9uJz4je0B0ZXh0LmJhY2t9PC9idXR0b24+XCIgaWYgYmFja2FibGVcbiMgICAgdWkudGV4dCA9IEB0ZXh0XG4jICAgIEBtb2RlbC5zZXQoJ3VpJywgdWkpXG5cbiAgdWk6XG4gICAgbW9kZUJ1dHRvbjogXCIubW9kZS1idXR0b25cIlxuXG4gIG9uQmVmb3JlUmVuZGVyOiAtPlxuXG4gICAgZG9uZSA9IDBcblxuICAgIHN0YXJ0VGltZXJIVE1MID0gXCI8ZGl2IGNsYXNzPSd0aW1lcl93cmFwcGVyJz48YnV0dG9uIGNsYXNzPSdzdGFydF90aW1lIHRpbWUnPiN7QHRleHQuc3RhcnR9PC9idXR0b24+PGRpdiBjbGFzcz0ndGltZXInPiN7QHRpbWVyfTwvZGl2PjwvZGl2PlwiXG5cbiAgICBkaXNhYmxpbmcgPSBcImRpc2FibGVkXCIgdW5sZXNzIEB1bnRpbWVkXG5cbiAgICBkaXNwbGF5UnRsID0gXCJydGxfbW9kZVwiIGlmIEBydGxcblxuICAgIGh0bWwgPSBpZiBub3QgQHVudGltZWQgdGhlbiBzdGFydFRpbWVySFRNTCBlbHNlIFwiXCJcblxuICAgIGdyaWRIVE1MID0gXCJcIlxuXG4gICAgaWYgQGxheW91dE1vZGUgPT0gXCJmaXhlZFwiXG4gICAgICBncmlkSFRNTCArPSBcIjx0YWJsZSBjbGFzcz0nZ3JpZCAje2Rpc2FibGluZ30gI3tkaXNwbGF5UnRsfHwnJ30nPlwiXG4gICAgICBmaXJzdFJvdyA9IHRydWVcbiAgICAgIGxvb3BcbiAgICAgICAgYnJlYWsgaWYgZG9uZSA+IEBpdGVtcy5sZW5ndGhcbiAgICAgICAgZ3JpZEhUTUwgKz0gXCI8dHI+XCJcbiAgICAgICAgZm9yIGkgaW4gWzEuLkBjb2x1bW5zXVxuICAgICAgICAgIGlmIGRvbmUgPCBAaXRlbXMubGVuZ3RoXG4gICAgICAgICAgICBncmlkSFRNTCArPSBAZ3JpZEVsZW1lbnQgeyBsYWJlbCA6IF8uZXNjYXBlKEBpdGVtc1tAaXRlbU1hcFtkb25lXV0pLCBpOiBkb25lKzEgfVxuICAgICAgICAgIGRvbmUrK1xuICAgICAgICAjIGRvbid0IHNob3cgdGhlIHNraXAgcm93IGJ1dHRvbiBmb3IgdGhlIGZpcnN0IHJvd1xuICAgICAgICBpZiBmaXJzdFJvd1xuICAgICAgICAgIGdyaWRIVE1MICs9IFwiPHRkPjwvdGQ+XCIgaWYgZG9uZSA8ICggQGl0ZW1zLmxlbmd0aCArIDEgKSAmJiBAZW5kT2ZMaW5lXG4gICAgICAgICAgZmlyc3RSb3cgPSBmYWxzZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZ3JpZEhUTUwgKz0gQGVuZE9mR3JpZExpbmUoe2k6ZG9uZX0pIGlmIGRvbmUgPCAoIEBpdGVtcy5sZW5ndGggKyAxICkgJiYgQGVuZE9mTGluZVxuXG4gICAgICAgIGdyaWRIVE1MICs9IFwiPC90cj5cIlxuICAgICAgZ3JpZEhUTUwgKz0gXCI8L3RhYmxlPlwiXG4gICAgZWxzZVxuICAgICAgZ3JpZEhUTUwgKz0gXCI8ZGl2IGNsYXNzPSdncmlkICN7ZGlzYWJsaW5nfSAje2Rpc3BsYXlSdGx8fCcnfSc+XCJcbiAgICAgIGZvciBpdGVtLCBpIGluIEBpdGVtc1xuICAgICAgICBncmlkSFRNTCArPSBAdmFyaWFibGVHcmlkRWxlbWVudFxuICAgICAgICAgIFwibGFiZWxcIiA6IF8uZXNjYXBlKEBpdGVtc1tAaXRlbU1hcFtpXV0pXG4gICAgICAgICAgXCJpXCIgICAgIDogaSsxXG4gICAgICBncmlkSFRNTCArPSBcIjwvZGl2PlwiXG4gICAgaHRtbCArPSBncmlkSFRNTFxuICAgIHN0b3BUaW1lckhUTUwgPSBcIjxkaXYgY2xhc3M9J3RpbWVyX3dyYXBwZXInPjxidXR0b24gY2xhc3M9J3N0b3BfdGltZSB0aW1lJz4je0B0ZXh0LnN0b3B9PC9idXR0b24+PC9kaXY+XCJcblxuICAgIHJlc3RhcnRCdXR0b24gPSBcIlxuICAgICAgPGRpdj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0ncmVzdGFydCBjb21tYW5kJz4je0B0ZXh0LnJlc3RhcnR9PC9idXR0b24+XG4gICAgICAgIDxicj5cbiAgICAgIDwvZGl2PlxuICAgIFwiXG5cbiAgICAjXG4gICAgIyBNb2RlIHNlbGVjdG9yXG4gICAgI1xuXG4gICAgIyBpZiBhbnkgb3RoZXIgb3B0aW9uIGlzIGF2YWlhbGJlIG90aGVyIHRoYW4gbWFyaywgdGhlbiBzaG93IHRoZSBzZWxlY3RvclxuICAgIGlmIEBjYXB0dXJlTGFzdEF0dGVtcHRlZCB8fCBAY2FwdHVyZUl0ZW1BdFRpbWVcblxuICAgICAgQG1vZGVCdXR0b24/LmNsb3NlKClcblxuICAgICAgbW9kZWwgPSBuZXcgQnV0dG9uKClcblxuICAgICAgYnV0dG9uQ29uZmlnID1cbiAgICAgICAgb3B0aW9ucyA6IFtdXG4gICAgICAgIG1vZGUgICAgOiBcInNpbmdsZVwiXG4gICAgICAgIG1vZGVsICAgOiBtb2RlbFxuXG4gICAgICBidXR0b25Db25maWcub3B0aW9ucy5wdXNoIHtcbiAgICAgICAgbGFiZWwgOiBAdGV4dC5tYXJrXG4gICAgICAgIHZhbHVlIDogXCJtYXJrXCJcbiAgICAgIH1cblxuICAgICAgYnV0dG9uQ29uZmlnLm9wdGlvbnMucHVzaCB7XG4gICAgICAgIGxhYmVsIDogdCggXCJpdGVtIGF0IF9fc2Vjb25kc19fIHNlY29uZHNcIiwgc2Vjb25kcyA6IEBjYXB0dXJlQWZ0ZXJTZWNvbmRzIClcbiAgICAgICAgdmFsdWUgOiBcIm1pbnV0ZUl0ZW1cIlxuICAgICAgfSBpZiBAY2FwdHVyZUl0ZW1BdFRpbWVcblxuICAgICAgYnV0dG9uQ29uZmlnLm9wdGlvbnMucHVzaCB7XG4gICAgICAgIGxhYmVsIDogQHRleHQubGFzdEF0dGVtcHRlZFxuICAgICAgICB2YWx1ZSA6IFwibGFzdFwiXG4gICAgICB9IGlmIEBjYXB0dXJlTGFzdEF0dGVtcHRlZFxuXG4gICAgICBAbW9kZUJ1dHRvbiA9IG5ldyBCdXR0b25JdGVtVmlldyBidXR0b25Db25maWdcblxuICAgICAgQGxpc3RlblRvIEBtb2RlQnV0dG9uLCBcImNoYW5nZSBjbGlja1wiLCBAdXBkYXRlTW9kZVxuICAgICAgbW9kZVNlbGVjdG9yID0gXCJcbiAgICAgICAgPGRpdiBjbGFzcz0nZ3JpZF9tb2RlX3dyYXBwZXIgcXVlc3Rpb24gY2xlYXJmaXgnPlxuICAgICAgICAgIDxsYWJlbD4je0B0ZXh0LmlucHV0TW9kZX08L2xhYmVsPjxicj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdtb2RlLWJ1dHRvbic+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgXCJcblxuICAgIGRhdGFFbnRyeSA9IFwiXG4gICAgICA8dGFibGUgY2xhc3M9J2NsYXNzX3RhYmxlJz5cblxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPiN7QHRleHQud2FzQXV0b3N0b3BwZWR9PC90ZD48dGQ+PGlucHV0IHR5cGU9J2NoZWNrYm94JyBjbGFzcz0nZGF0YV9hdXRvc3RvcHBlZCc+PC90ZD5cbiAgICAgICAgPC90cj5cblxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPiN7QHRleHQudGltZVJlbWFpbmluZ308L3RkPjx0ZD48aW5wdXQgdHlwZT0nbnVtYmVyJyBjbGFzcz0nZGF0YV90aW1lX3JlbWFpbic+PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgIDwvdGFibGU+XG4gICAgXCJcblxuICAgIGh0bWwgKz0gXCJcbiAgICAgICN7aWYgbm90IEB1bnRpbWVkIHRoZW4gc3RvcFRpbWVySFRNTCBlbHNlIFwiXCJ9XG4gICAgICAje2lmIG5vdCBAdW50aW1lZCB0aGVuIHJlc3RhcnRCdXR0b24gZWxzZSBcIlwifVxuICAgICAgI3ttb2RlU2VsZWN0b3IgfHwgJyd9XG4gICAgICAjeyhkYXRhRW50cnkgaWYgQGRhdGFFbnRyeSkgfHwgJyd9XG4gICAgXCJcbiAgICBAbW9kZWwuc2V0KCdncmlkJywgaHRtbClcblxuIyAgICBAJGVsLmh0bWwgaHRtbFxuXG4jICAgIEBtb2RlQnV0dG9uLnNldEVsZW1lbnQgQCRlbC5maW5kIFwiLm1vZGUtYnV0dG9uXCJcbiMgICAgQG1vZGVCdXR0b24ucmVuZGVyKClcblxuXG5cbiAgb25SZW5kZXI6ID0+XG5cbiAgICBAbW9kZUJ1dHRvbj8uc2V0RWxlbWVudCBAJGVsLmZpbmQgXCIubW9kZS1idXR0b25cIlxuICAgIEBtb2RlQnV0dG9uPy5yZW5kZXIoKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgQHRyaWdnZXIgXCJyZWFkeVwiXG5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuXG4gICAgICBwcmV2aW91cyA9IEBtb2RlbC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG4gICAgICBpZiBwcmV2aW91c1xuICAgICAgICBAbWFya1JlY29yZCA9IHByZXZpb3VzLm1hcmtfcmVjb3JkXG5cbiAgICAgICAgZm9yIGl0ZW0sIGkgaW4gQG1hcmtSZWNvcmRcbiAgICAgICAgICBAbWFya0VsZW1lbnQgaXRlbSwgbnVsbCwgJ3BvcHVsYXRlJ1xuXG4gICAgICAgIEBpdGVtQXRUaW1lID0gcHJldmlvdXMuaXRlbV9hdF90aW1lXG4gICAgICAgICR0YXJnZXQgPSBAJGVsLmZpbmQoXCIuZ3JpZF9lbGVtZW50W2RhdGEtaW5kZXg9I3tAaXRlbUF0VGltZX1dXCIpXG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MgXCJlbGVtZW50X21pbnV0ZVwiXG5cbiAgICAgICAgQGxhc3RBdHRlbXB0ZWQgPSBwcmV2aW91cy5hdHRlbXB0ZWRcbiAgICAgICAgJHRhcmdldCA9IEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRbZGF0YS1pbmRleD0je0BsYXN0QXR0ZW1wdGVkfV1cIilcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyBcImVsZW1lbnRfbGFzdFwiXG5cblxuICByZXN0YXJ0VGltZXI6IC0+XG4gICAgQHN0b3BUaW1lcihzaW1wbGVTdG9wOnRydWUpIGlmIEB0aW1lUnVubmluZ1xuXG4gICAgQHJlc2V0VmFyaWFibGVzKClcblxuICAgIEAkZWwuZmluZChcIi5lbGVtZW50X3dyb25nXCIpLnJlbW92ZUNsYXNzIFwiZWxlbWVudF93cm9uZ1wiXG5cbiAgZ3JpZENsaWNrOiAoZXZlbnQpID0+XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIEBtb2RlSGFuZGxlcnNbQG1vZGVdPyhldmVudClcblxuICBtYXJrSGFuZGxlcjogKGV2ZW50KSA9PlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBpbmRleCA9ICR0YXJnZXQuYXR0cignZGF0YS1pbmRleCcpXG5cbiAgICBpbmRleElzbnRCZWxvd0xhc3RBdHRlbXB0ZWQgPSBwYXJzZUludChpbmRleCkgPiBwYXJzZUludChAbGFzdEF0dGVtcHRlZClcbiAgICBsYXN0QXR0ZW1wdGVkSXNudFplcm8gICAgICAgPSBwYXJzZUludChAbGFzdEF0dGVtcHRlZCkgIT0gMFxuICAgIGNvcnJlY3Rpb25zRGlzYWJsZWQgICAgICAgICA9IEBkYXRhRW50cnkgaXMgZmFsc2UgYW5kIEBwYXJlbnQ/LmVuYWJsZUNvcnJlY3Rpb25zIGlzIGZhbHNlXG5cbiAgICByZXR1cm4gaWYgY29ycmVjdGlvbnNEaXNhYmxlZCAmJiBsYXN0QXR0ZW1wdGVkSXNudFplcm8gJiYgaW5kZXhJc250QmVsb3dMYXN0QXR0ZW1wdGVkXG5cbiAgICBAbWFya0VsZW1lbnQoaW5kZXgpXG4gICAgQGNoZWNrQXV0b3N0b3AoKSBpZiBAYXV0b3N0b3AgIT0gMFxuXG5cbiAgaW50ZXJtZWRpYXRlSXRlbUhhbmRsZXI6IChldmVudCkgPT5cbiAgICBAdGltZUludGVybWVkaWF0ZUNhcHR1cmVkID0gQGdldFRpbWUoKSAtIEBzdGFydFRpbWVcbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgaW5kZXggPSAkdGFyZ2V0LmF0dHIoJ2RhdGEtaW5kZXgnKVxuICAgIEBpdGVtQXRUaW1lID0gaW5kZXhcbiAgICAkdGFyZ2V0LmFkZENsYXNzIFwiZWxlbWVudF9taW51dGVcIlxuICAgIEB1cGRhdGVNb2RlIFwibWFya1wiXG5cbiAgY2hlY2tBdXRvc3RvcDogLT5cbiAgICBpZiBAdGltZVJ1bm5pbmdcbiAgICAgIGF1dG9Db3VudCA9IDBcbiAgICAgIGZvciBpIGluIFswLi5AYXV0b3N0b3AtMV1cbiAgICAgICAgaWYgQGdyaWRPdXRwdXRbaV0gPT0gXCJjb3JyZWN0XCIgdGhlbiBicmVha1xuICAgICAgICBhdXRvQ291bnQrK1xuICAgICAgaWYgQGF1dG9zdG9wcGVkID09IGZhbHNlXG4gICAgICAgIGlmIGF1dG9Db3VudCA9PSBAYXV0b3N0b3AgdGhlbiBAYXV0b3N0b3BUZXN0KClcbiAgICAgIGlmIEBhdXRvc3RvcHBlZCA9PSB0cnVlICYmIGF1dG9Db3VudCA8IEBhdXRvc3RvcCAmJiBAdW5kb2FibGUgPT0gdHJ1ZSB0aGVuIEB1bkF1dG9zdG9wVGVzdCgpXG5cbiMgbW9kZSBpcyB1c2VkIGZvciBvcGVyYXRpb25zIGxpa2UgcHJlLXBvcHVsYXRpbmcgdGhlIGdyaWQgd2hlbiBkb2luZyBjb3JyZWN0aW9ucy5cbiAgbWFya0VsZW1lbnQ6IChpbmRleCwgdmFsdWUgPSBudWxsLCBtb2RlKSAtPlxuIyBpZiBsYXN0IGF0dGVtcHRlZCBoYXMgYmVlbiBzZXQsIGFuZCB0aGUgY2xpY2sgaXMgYWJvdmUgaXQsIHRoZW4gY2FuY2VsXG5cbiAgICBjb3JyZWN0aW9uc0Rpc2FibGVkICAgICAgICAgPSBAZGF0YUVudHJ5IGlzIGZhbHNlIGFuZCBAcGFyZW50Py5lbmFibGVDb3JyZWN0aW9ucz8gYW5kIEBwYXJlbnQ/LmVuYWJsZUNvcnJlY3Rpb25zIGlzIGZhbHNlXG4gICAgbGFzdEF0dGVtcHRlZElzbnRaZXJvICAgICAgID0gcGFyc2VJbnQoQGxhc3RBdHRlbXB0ZWQpICE9IDBcbiAgICBpbmRleElzbnRCZWxvd0xhc3RBdHRlbXB0ZWQgPSBwYXJzZUludChpbmRleCkgPiBwYXJzZUludChAbGFzdEF0dGVtcHRlZClcblxuICAgIHJldHVybiBpZiBjb3JyZWN0aW9uc0Rpc2FibGVkIGFuZCBsYXN0QXR0ZW1wdGVkSXNudFplcm8gYW5kIGluZGV4SXNudEJlbG93TGFzdEF0dGVtcHRlZFxuXG4gICAgJHRhcmdldCA9IEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRbZGF0YS1pbmRleD0je2luZGV4fV1cIilcbiAgICBpZiBtb2RlICE9ICdwb3B1bGF0ZSdcbiAgICAgIEBtYXJrUmVjb3JkLnB1c2ggaW5kZXhcblxuICAgIGlmIG5vdCBAYXV0b3N0b3BwZWRcbiAgICAgIGlmIHZhbHVlID09IG51bGwgIyBub3Qgc3BlY2lmeWluZyB0aGUgdmFsdWUsIGp1c3QgdG9nZ2xlXG4gICAgICAgIEBncmlkT3V0cHV0W2luZGV4LTFdID0gaWYgKEBncmlkT3V0cHV0W2luZGV4LTFdID09IFwiY29ycmVjdFwiKSB0aGVuIFwiaW5jb3JyZWN0XCIgZWxzZSBcImNvcnJlY3RcIlxuICAgICAgICAkdGFyZ2V0LnRvZ2dsZUNsYXNzIFwiZWxlbWVudF93cm9uZ1wiXG4gICAgICBlbHNlICMgdmFsdWUgc3BlY2lmaWVkXG4gICAgICAgIEBncmlkT3V0cHV0W2luZGV4LTFdID0gdmFsdWVcbiAgICAgICAgaWYgdmFsdWUgPT0gXCJpbmNvcnJlY3RcIlxuICAgICAgICAgICR0YXJnZXQuYWRkQ2xhc3MgXCJlbGVtZW50X3dyb25nXCJcbiAgICAgICAgZWxzZSBpZiB2YWx1ZSA9PSBcImNvcnJlY3RcIlxuICAgICAgICAgICR0YXJnZXQucmVtb3ZlQ2xhc3MgXCJlbGVtZW50X3dyb25nXCJcblxuICBlbmRPZkdyaWRMaW5lQ2xpY2s6IChldmVudCkgLT5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaWYgQG1vZGUgPT0gXCJtYXJrXCJcbiAgICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcblxuICAgICAgIyBpZiB3aGF0IHdlIGNsaWNrZWQgaXMgYWxyZWFkeSBtYXJrZWQgd3JvbmdcbiAgICAgIGlmICR0YXJnZXQuaGFzQ2xhc3MoXCJlbGVtZW50X3dyb25nXCIpXG4jIFlFUywgbWFyayBpdCByaWdodFxuICAgICAgICAkdGFyZ2V0LnJlbW92ZUNsYXNzIFwiZWxlbWVudF93cm9uZ1wiXG4gICAgICAgIGluZGV4ID0gJHRhcmdldC5hdHRyKCdkYXRhLWluZGV4JylcbiAgICAgICAgZm9yIGkgaW4gW2luZGV4Li4oaW5kZXgtKEBjb2x1bW5zLTEpKV1cbiAgICAgICAgICBAbWFya0VsZW1lbnQgaSwgXCJjb3JyZWN0XCJcbiAgICAgIGVsc2UgaWYgISR0YXJnZXQuaGFzQ2xhc3MoXCJlbGVtZW50X3dyb25nXCIpICYmICFAYXV0b3N0b3BwZWRcbiMgTk8sIG1hcmsgaXQgd3JvbmdcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyBcImVsZW1lbnRfd3JvbmdcIlxuICAgICAgICBpbmRleCA9ICR0YXJnZXQuYXR0cignZGF0YS1pbmRleCcpXG4gICAgICAgIGZvciBpIGluIFtpbmRleC4uKGluZGV4LShAY29sdW1ucy0xKSldXG4gICAgICAgICAgQG1hcmtFbGVtZW50IGksIFwiaW5jb3JyZWN0XCJcblxuICAgICAgQGNoZWNrQXV0b3N0b3AoKSBpZiBAYXV0b3N0b3AgIT0gMFxuXG4gIGxhc3RIYW5kbGVyOiAoZXZlbnQsIGluZGV4KSA9PlxuICAgIGlmIGluZGV4P1xuICAgICAgJHRhcmdldCA9IEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRbZGF0YS1pbmRleD0je2luZGV4fV1cIilcbiAgICBlbHNlXG4gICAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgICBpbmRleCAgID0gJHRhcmdldC5hdHRyKCdkYXRhLWluZGV4JylcblxuICAgIGlmIGluZGV4IC0gMSA+PSBAZ3JpZE91dHB1dC5sYXN0SW5kZXhPZihcImluY29ycmVjdFwiKVxuICAgICAgQCRlbC5maW5kKFwiLmVsZW1lbnRfbGFzdFwiKS5yZW1vdmVDbGFzcyBcImVsZW1lbnRfbGFzdFwiXG4gICAgICAkdGFyZ2V0LmFkZENsYXNzIFwiZWxlbWVudF9sYXN0XCJcbiAgICAgIEBsYXN0QXR0ZW1wdGVkID0gaW5kZXhcblxuICBmbG9hdE9uOiAtPlxuICAgIHRpbWVyID0gQCRlbC5maW5kKCcudGltZXInKVxuICAgIHRpbWVyUG9zID0gdGltZXIub2Zmc2V0KClcbiAgICAkKHdpbmRvdykub24gJ3Njcm9sbCcsIC0+XG4gICAgICBzY3JvbGxQb3MgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKClcbiAgICAgIGlmIHNjcm9sbFBvcyA+PSB0aW1lclBvcy50b3BcbiAgICAgICAgdGltZXIuY3NzXG4gICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIlxuICAgICAgICAgIHRvcDogXCIxMCVcIlxuICAgICAgICAgIGxlZnQ6IFwiODAlXCJcbiAgICAgIGVsc2VcbiAgICAgICAgdGltZXIuY3NzXG4gICAgICAgICAgcG9zaXRpb246IFwiaW5pdGlhbFwiXG4gICAgICAgICAgdG9wOiBcImluaXRpYWxcIlxuICAgICAgICAgIGxlZnQ6IFwiaW5pdGlhbFwiXG5cbiAgZmxvYXRPZmY6IC0+XG4gICAgJCh3aW5kb3cpLm9mZiAnc2Nyb2xsJ1xuICAgIHRpbWVyID0gQCRlbC5maW5kKCcudGltZXInKVxuICAgIHRpbWVyLmNzc1xuICAgICAgcG9zaXRpb246IFwiaW5pdGlhbFwiXG4gICAgICB0b3A6IFwiaW5pdGlhbFwiXG4gICAgICBsZWZ0OiBcImluaXRpYWxcIlxuXG5cbiAgc3RhcnRUaW1lcjogLT5cbiAgICBpZiBAdGltZXJTdG9wcGVkID09IGZhbHNlICYmIEB0aW1lUnVubmluZyA9PSBmYWxzZVxuICAgICAgQGludGVydmFsID0gc2V0SW50ZXJ2YWwoIEB1cGRhdGVDb3VudGRvd24sIDEwMDAgKSAjIG1hZ2ljIG51bWJlclxuICAgICAgQHN0YXJ0VGltZSA9IEBnZXRUaW1lKClcbiAgICAgIEB0aW1lUnVubmluZyA9IHRydWVcbiAgICAgIEB1cGRhdGVNb2RlIFwibWFya1wiXG4gICAgICBAZW5hYmxlR3JpZCgpXG4gICAgICBAdXBkYXRlQ291bnRkb3duKClcbiAgICAgIEBmbG9hdE9uKClcblxuICBlbmFibGVHcmlkOiAtPlxuICAgIEAkZWwuZmluZChcInRhYmxlLmRpc2FibGVkLCBkaXYuZGlzYWJsZWRcIikucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKVxuXG4gIHN0b3BUaW1lcjogKGV2ZW50LCBtZXNzYWdlID0gZmFsc2UpIC0+XG5cbiAgICByZXR1cm4gaWYgQHRpbWVSdW5uaW5nICE9IHRydWUgIyBzdG9wIG9ubHkgaWYgbmVlZGVkXG5cbiAgICBpZiBldmVudD8udGFyZ2V0XG4gICAgICBAbGFzdEhhbmRsZXIobnVsbCwgQGl0ZW1zLmxlbmd0aClcblxuICAgICMgZG8gdGhlc2UgYWx3YXlzXG4gICAgY2xlYXJJbnRlcnZhbCBAaW50ZXJ2YWxcbiAgICBAc3RvcFRpbWUgPSBAZ2V0VGltZSgpXG4gICAgQHRpbWVSdW5uaW5nID0gZmFsc2VcbiAgICBAdGltZXJTdG9wcGVkID0gdHJ1ZVxuICAgIEBmbG9hdE9mZigpXG5cbiAgICBAdXBkYXRlQ291bnRkb3duKClcblxuIyBkbyB0aGVzZSBpZiBpdCdzIG5vdCBhIHNpbXBsZSBzdG9wXG4jaWYgbm90IGV2ZW50Py5zaW1wbGVTdG9wXG4jVXRpbHMuZmxhc2goKVxuXG5cbiAgYXV0b3N0b3BUZXN0OiAtPlxuICAgIFV0aWxzLmZsYXNoKClcbiAgICBjbGVhckludGVydmFsIEBpbnRlcnZhbFxuICAgIEBzdG9wVGltZSA9IEBnZXRUaW1lKClcbiAgICBAYXV0b3N0b3BwZWQgPSB0cnVlXG4gICAgQHRpbWVyU3RvcHBlZCA9IHRydWVcbiAgICBAdGltZVJ1bm5pbmcgPSBmYWxzZVxuICAgIEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRcIikuc2xpY2UoQGF1dG9zdG9wLTEsQGF1dG9zdG9wKS5hZGRDbGFzcyBcImVsZW1lbnRfbGFzdFwiICNqcXVlcnkgaXMgd2VpcmQgc29tZXRpbWVzXG4gICAgQGxhc3RBdHRlbXB0ZWQgPSBAYXV0b3N0b3BcbiAgICBAdGltZW91dCA9IHNldFRpbWVvdXQoQHJlbW92ZVVuZG8sIDMwMDApICMgZ2l2ZSB0aGVtIDMgc2Vjb25kcyB0byB1bmRvLiBtYWdpYyBudW1iZXJcbiAgICBVdGlscy50b3BBbGVydCBAdGV4dC5hdXRvc3RvcFxuXG4gIHJlbW92ZVVuZG86ID0+XG4gICAgQHVuZG9hYmxlID0gZmFsc2VcbiAgICBAdXBkYXRlTW9kZSBcImRpc2FibGVkXCJcbiAgICBjbGVhclRpbWVvdXQoQHRpbWVvdXQpXG5cbiAgdW5BdXRvc3RvcFRlc3Q6IC0+XG4gICAgQGludGVydmFsID0gc2V0SW50ZXJ2YWwoQHVwZGF0ZUNvdW50ZG93biwgMTAwMCApICMgbWFnaWMgbnVtYmVyXG4gICAgQHVwZGF0ZUNvdW50ZG93bigpXG4gICAgQGF1dG9zdG9wcGVkID0gZmFsc2VcbiAgICBAbGFzdEF0dGVtcHRlZCA9IDBcbiAgICBAJGVsLmZpbmQoXCIuZ3JpZF9lbGVtZW50XCIpLnNsaWNlKEBhdXRvc3RvcC0xLEBhdXRvc3RvcCkucmVtb3ZlQ2xhc3MgXCJlbGVtZW50X2xhc3RcIlxuICAgIEB0aW1lUnVubmluZyA9IHRydWVcbiAgICBAdXBkYXRlTW9kZSBcIm1hcmtcIlxuICAgIFV0aWxzLnRvcEFsZXJ0IHQoXCJHcmlkUnVuVmlldy5tZXNzYWdlLmF1dG9zdG9wX2NhbmNlbFwiKVxuXG4gIHVwZGF0ZUNvdW50ZG93bjogPT5cbiMgc29tZXRpbWVzIHRoZSBcInRpY2tcIiBkb2Vzbid0IGhhcHBlbiB3aXRoaW4gYSBzZWNvbmRcbiAgICBAdGltZUVsYXBzZWQgPSBNYXRoLm1pbihAZ2V0VGltZSgpIC0gQHN0YXJ0VGltZSwgQHRpbWVyKVxuXG4gICAgQHRpbWVSZW1haW5pbmcgPSBAdGltZXIgLSBAdGltZUVsYXBzZWRcblxuICAgIEAkZWwuZmluZChcIi50aW1lclwiKS5odG1sIEB0aW1lUmVtYWluaW5nXG5cbiAgICBpZiBAdGltZVJ1bm5pbmcgaXMgdHJ1ZSBhbmQgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkIGFuZCBAdGltZVJlbWFpbmluZyA8PSAwXG4gICAgICBAc3RvcFRpbWVyKHNpbXBsZVN0b3A6dHJ1ZSlcbiAgICAgIFV0aWxzLmJhY2tncm91bmQgXCJyZWRcIlxuICAgICAgXy5kZWxheShcbiAgICAgICAgPT5cbiAgICAgICAgICBhbGVydCBAdGV4dC50b3VjaExhc3RJdGVtXG4gICAgICAgICAgVXRpbHMuYmFja2dyb3VuZCBcIlwiXG4gICAgICAsIDFlMykgIyBtYWdpYyBudW1iZXJcblxuICAgICAgQHVwZGF0ZU1vZGUgXCJsYXN0XCJcblxuXG4gICAgaWYgQGNhcHR1cmVJdGVtQXRUaW1lICYmICFAZ290SW50ZXJtZWRpYXRlICYmICFAbWludXRlTWVzc2FnZSAmJiBAdGltZUVsYXBzZWQgPj0gQGNhcHR1cmVBZnRlclNlY29uZHNcbiAgICAgIFV0aWxzLmZsYXNoIFwieWVsbG93XCJcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IHQoXCJwbGVhc2Ugc2VsZWN0IHRoZSBpdGVtIHRoZSBjaGlsZCBpcyBjdXJyZW50bHkgYXR0ZW1wdGluZ1wiKVxuICAgICAgQG1pbnV0ZU1lc3NhZ2UgPSB0cnVlXG4gICAgICBAbW9kZSA9IFwibWludXRlSXRlbVwiXG5cblxuICB1cGRhdGVNb2RlOiAoIG1vZGUgPSBudWxsICkgPT5cbiMgZG9udCcgY2hhbmdlIHRoZSBtb2RlIGlmIHRoZSB0aW1lIGhhcyBuZXZlciBiZWVuIHN0YXJ0ZWRcbiAgICBpZiAobW9kZT09bnVsbCAmJiBAdGltZUVsYXBzZWQgPT0gMCAmJiBub3QgQGRhdGFFbnRyeSkgfHwgbW9kZSA9PSBcImRpc2FibGVkXCJcbiAgICAgIEBtb2RlQnV0dG9uPy5zZXRWYWx1ZSBudWxsXG4gICAgZWxzZSBpZiBtb2RlPyAjIG1hbnVhbGx5IGNoYW5nZSB0aGUgbW9kZVxuICAgICAgQG1vZGUgPSBtb2RlXG4gICAgICBAbW9kZUJ1dHRvbj8uc2V0VmFsdWUgQG1vZGVcbiAgICBlbHNlICMgaGFuZGxlIGEgY2xpY2sgZXZlbnRcbiAgICAgIEBtb2RlID0gQG1vZGVCdXR0b24/LmdldFZhbHVlKClcblxuICBnZXRUaW1lOiAtPlxuICAgIE1hdGgucm91bmQoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAvIDEwMDApXG5cbiAgcmVzZXRWYXJpYWJsZXM6IC0+XG5cbiAgICBAdGltZXIgICAgPSBwYXJzZUludChAbW9kZWwuZ2V0KFwidGltZXJcIikpIHx8IDBcbiAgICBAdW50aW1lZCAgPSBAdGltZXIgPT0gMCB8fCBAZGF0YUVudHJ5ICMgRG8gbm90IHNob3cgdGhlIHRpbWVyIGlmIGl0J3MgZGlzYXNibGVkIG9yIGRhdGEgZW50cnkgbW9kZVxuXG4gICAgQGdvdE1pbnV0ZUl0ZW0gPSBmYWxzZVxuICAgIEBtaW51dGVNZXNzYWdlID0gZmFsc2VcbiAgICBAaXRlbUF0VGltZSA9IG51bGxcblxuICAgIEB0aW1lSW50ZXJtZWRpYXRlQ2FwdHVyZWQgPSBudWxsXG5cbiAgICBAbWFya1JlY29yZCA9IFtdXG5cbiAgICBAdGltZXJTdG9wcGVkID0gZmFsc2VcblxuICAgIEBzdGFydFRpbWUgPSAwXG4gICAgQHN0b3BUaW1lICA9IDBcbiAgICBAdGltZUVsYXBzZWQgPSAwXG4gICAgQHRpbWVSZW1haW5pbmcgPSBAdGltZXJcbiAgICBAbGFzdEF0dGVtcHRlZCA9IDBcblxuICAgIEBpbnRlcnZhbCA9IG51bGxcblxuICAgIEB1bmRvYWJsZSA9IHRydWVcblxuICAgIEB0aW1lUnVubmluZyA9IGZhbHNlXG5cblxuICAgIEBpdGVtcyAgICA9IF8uY29tcGFjdChAbW9kZWwuZ2V0KFwiaXRlbXNcIikpICMgbWlsZCBzYW5pdGl6YXRpb24sIGhhcHBlbnMgYXQgc2F2ZSB0b29cblxuICAgIEBpdGVtTWFwID0gW11cbiAgICBAbWFwSXRlbSA9IFtdXG5cbiAgICBpZiBAbW9kZWwuaGFzKFwicmFuZG9taXplXCIpICYmIEBtb2RlbC5nZXQoXCJyYW5kb21pemVcIilcbiAgICAgIEBpdGVtTWFwID0gQGl0ZW1zLm1hcCAodmFsdWUsIGkpIC0+IGlcblxuICAgICAgQGl0ZW1zLmZvckVhY2ggKGl0ZW0sIGkpIC0+XG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBAaXRlbXMubGVuZ3RoKVxuICAgICAgICB0ZW1wVmFsdWUgPSBAaXRlbU1hcFt0ZW1wXVxuICAgICAgICBAaXRlbU1hcFt0ZW1wXSA9IEBpdGVtTWFwW2ldXG4gICAgICAgIEBpdGVtTWFwW2ldID0gdGVtcFZhbHVlXG4gICAgICAsIEBcblxuICAgICAgQGl0ZW1NYXAuZm9yRWFjaCAoaXRlbSwgaSkgLT5cbiAgICAgICAgQG1hcEl0ZW1bQGl0ZW1NYXBbaV1dID0gaVxuICAgICAgLCBAXG4gICAgZWxzZVxuICAgICAgQGl0ZW1zLmZvckVhY2ggKGl0ZW0sIGkpIC0+XG4gICAgICAgIEBpdGVtTWFwW2ldID0gaVxuICAgICAgICBAbWFwSXRlbVtpXSA9IGlcbiAgICAgICwgQFxuXG4gICAgaWYgIUBjYXB0dXJlTGFzdEF0dGVtcHRlZCAmJiAhQGNhcHR1cmVJdGVtQXRUaW1lXG4gICAgICBAbW9kZSA9IFwibWFya1wiXG4gICAgZWxzZVxuICAgICAgQG1vZGUgPSBcImRpc2FibGVkXCJcblxuICAgIEBtb2RlID0gXCJtYXJrXCIgaWYgQGRhdGFFbnRyeVxuXG4gICAgQGdyaWRPdXRwdXQgPSBAaXRlbXMubWFwIC0+ICdjb3JyZWN0J1xuICAgIEBjb2x1bW5zICA9IHBhcnNlSW50KEBtb2RlbC5nZXQoXCJjb2x1bW5zXCIpKSB8fCAzXG5cbiAgICBAYXV0b3N0b3AgPSBpZiBAdW50aW1lZCB0aGVuIDAgZWxzZSAocGFyc2VJbnQoQG1vZGVsLmdldChcImF1dG9zdG9wXCIpKSB8fCAwKVxuICAgIEBhdXRvc3RvcHBlZCA9IGZhbHNlXG5cbiAgICBAJGVsLmZpbmQoXCIuZ3JpZF9lbGVtZW50XCIpLnJlbW92ZUNsYXNzKFwiZWxlbWVudF93cm9uZ1wiKS5yZW1vdmVDbGFzcyhcImVsZW1lbnRfbGFzdFwiKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpXG4gICAgQCRlbC5maW5kKFwidGFibGVcIikuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKVxuXG4gICAgQCRlbC5maW5kKFwiLnRpbWVyXCIpLmh0bWwgQHRpbWVyXG5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuXG4gICAgICBwcmV2aW91cyA9IEBtb2RlbC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG4gICAgICBpZiBwcmV2aW91c1xuXG4gICAgICAgIEBjYXB0dXJlTGFzdEF0dGVtcHRlZCAgICAgPSBwcmV2aW91cy5jYXB0dXJlX2xhc3RfYXR0ZW1wdGVkXG4gICAgICAgIEBpdGVtQXRUaW1lICAgICAgICAgICAgICAgPSBwcmV2aW91cy5pdGVtX2F0X3RpbWVcbiAgICAgICAgQHRpbWVJbnRlcm1lZGlhdGVDYXB0dXJlZCA9IHByZXZpb3VzLnRpbWVfaW50ZXJtZWRpYXRlX2NhcHR1cmVkXG4gICAgICAgIEBjYXB0dXJlSXRlbUF0VGltZSAgICAgICAgPSBwcmV2aW91cy5jYXB0dXJlX2l0ZW1fYXRfdGltZVxuICAgICAgICBAYXV0b3N0b3AgICAgICAgICAgICAgICAgID0gcHJldmlvdXMuYXV0b19zdG9wXG4gICAgICAgIEBsYXN0QXR0ZW1wdGVkICAgICAgICAgICAgPSBwcmV2aW91cy5hdHRlbXB0ZWRcbiAgICAgICAgQHRpbWVSZW1haW5pbmcgICAgICAgICAgICA9IHByZXZpb3VzLnRpbWVfcmVtYWluXG4gICAgICAgIEBtYXJrUmVjb3JkICAgICAgICAgICAgICAgPSBwcmV2aW91cy5tYXJrX3JlY29yZFxuXG4gICAgQHVwZGF0ZU1vZGUgQG1vZGUgaWYgQG1vZGVCdXR0b24/XG5cbiAgaXNWYWxpZDogLT5cbiAgICAjIFN0b3AgdGltZXIgaWYgc3RpbGwgcnVubmluZy4gSXNzdWUgIzI0MFxuICAgIEBzdG9wVGltZXIoKSBpZiBAdGltZVJ1bm5pbmdcblxuICAgIGlmIHBhcnNlSW50KEBsYXN0QXR0ZW1wdGVkKSBpcyBAaXRlbXMubGVuZ3RoIGFuZCBAdGltZVJlbWFpbmluZyBpcyAwXG5cbiAgICAgIGl0ZW0gPSBAaXRlbXNbQGl0ZW1zLmxlbmd0aC0xXVxuICAgICAgaWYgY29uZmlybSh0KFwiR3JpZFJ1blZpZXcubWVzc2FnZS5sYXN0X2l0ZW1fY29uZmlybVwiLCBpdGVtOml0ZW0pKVxuICAgICAgICBAdXBkYXRlTW9kZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBAbWVzc2FnZXMgPSBpZiBAbWVzc2FnZXM/LnB1c2ggdGhlbiBAbWVzc2FnZXMuY29uY2F0KFttc2ddKSBlbHNlIFttc2ddXG4gICAgICAgIEB1cGRhdGVNb2RlIFwibGFzdFwiXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgcmV0dXJuIGZhbHNlIGlmIEBjYXB0dXJlTGFzdEF0dGVtcHRlZCAmJiBAbGFzdEF0dGVtcHRlZCA9PSAwXG4gICAgIyBtaWdodCBuZWVkIHRvIGxldCBpdCBrbm93IGlmIGl0J3MgdGltZWQgb3IgdW50aW1lZCB0b28gOjpzaHJ1Zzo6XG4gICAgcmV0dXJuIGZhbHNlIGlmIEB0aW1lUnVubmluZyA9PSB0cnVlXG4gICAgcmV0dXJuIGZhbHNlIGlmIEB0aW1lciAhPSAwICYmIEB0aW1lUmVtYWluaW5nID09IEB0aW1lclxuICAgIHRydWVcblxuICB0ZXN0VmFsaWQ6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwiR3JpZFJ1bkl0ZW1WaWV3IHRlc3RWYWxpZC5cIilcbiAgICAjICAgIGlmIG5vdCBAcHJvdG90eXBlUmVuZGVyZWQgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAjICAgIGN1cnJlbnRWaWV3ID0gVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XG4gICAgaWYgQGlzVmFsaWQ/XG4gICAgICByZXR1cm4gQGlzVmFsaWQoKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHRydWVcblxuICBzaG93RXJyb3JzOiAtPlxuICAgIG1lc3NhZ2VzID0gQG1lc3NhZ2VzIHx8IFtdXG4gICAgQG1lc3NhZ2VzID0gW11cblxuICAgIHRpbWVySGFzbnRSdW4gICAgPSBAdGltZXIgIT0gMCAmJiBAdGltZVJlbWFpbmluZyA9PSBAdGltZXJcbiAgICBub0xhc3RJdGVtICAgICAgID0gQGNhcHR1cmVMYXN0QXR0ZW1wdGVkICYmIEBsYXN0QXR0ZW1wdGVkID09IDBcbiAgICB0aW1lU3RpbGxSdW5uaW5nID0gQHRpbWVSdW5pbmcgPT0gdHJ1ZVxuXG4gICAgaWYgdGltZXJIYXNudFJ1blxuICAgICAgbWVzc2FnZXMucHVzaCBAdGV4dC5zdWJ0ZXN0Tm90Q29tcGxldGVcblxuICAgIGlmIG5vTGFzdEl0ZW0gJiYgbm90IHRpbWVySGFzbnRSdW5cbiAgICAgIG1lc3NhZ2VzLnB1c2ggQHRleHQudG91Y2hMYXN0SXRlbVxuICAgICAgQHVwZGF0ZU1vZGUgXCJsYXN0XCJcblxuICAgIGlmIHRpbWVTdGlsbFJ1bm5pbmdcbiAgICAgIG1lc3NhZ2VzLnB1c2ggQHRleHQudGltZVN0aWxsUnVubmluZ1xuXG4gICAgVXRpbHMubWlkQWxlcnQgbWVzc2FnZXMuam9pbihcIjxicj5cIiksIDMwMDAgIyBtYWdpYyBudW1iZXJcblxuICBnZXRSZXN1bHQ6IC0+XG4gICAgY29tcGxldGVSZXN1bHRzID0gW11cbiAgICBpdGVtUmVzdWx0cyA9IFtdXG4gICAgQGxhc3RBdHRlbXB0ZWQgPSBAaXRlbXMubGVuZ3RoIGlmIG5vdCBAY2FwdHVyZUxhc3RBdHRlbXB0ZWRcbiMgICAgY29uc29sZS5sb2coXCJAbGFzdEF0dGVtcHRlZDogXCIgKyBAbGFzdEF0dGVtcHRlZClcblxuICAgIGZvciBpdGVtLCBpIGluIEBpdGVtc1xuXG4gICAgICBpZiBAbWFwSXRlbVtpXSA8IEBsYXN0QXR0ZW1wdGVkXG4gICAgICAgIGl0ZW1SZXN1bHRzW2ldID1cbiAgICAgICAgICBpdGVtUmVzdWx0IDogQGdyaWRPdXRwdXRbQG1hcEl0ZW1baV1dXG4gICAgICAgICAgaXRlbUxhYmVsICA6IGl0ZW1cbiAgICAgIGVsc2VcbiAgICAgICAgaXRlbVJlc3VsdHNbaV0gPVxuICAgICAgICAgIGl0ZW1SZXN1bHQgOiBcIm1pc3NpbmdcIlxuICAgICAgICAgIGl0ZW1MYWJlbCA6IEBpdGVtc1tAbWFwSXRlbVtpXV1cblxuICAgIEBsYXN0QXR0ZW1wdGVkID0gZmFsc2UgaWYgbm90IEBjYXB0dXJlTGFzdEF0dGVtcHRlZFxuXG4gICAgaWYgQGRhdGFFbnRyeVxuICAgICAgYXV0b3N0b3BwZWQgPSBAJGVsLmZpbmQoXCIuZGF0YV9hdXRvc3RvcHBlZFwiKS5pcyhcIjpjaGVja2VkXCIpXG4gICAgICB0aW1lUmVtYWluaW5nID0gcGFyc2VJbnQoQCRlbC5maW5kKFwiLmRhdGFfdGltZV9yZW1haW5cIikudmFsKCkpXG4gICAgZWxzZVxuICAgICAgYXV0b3N0b3BwZWQgICA9IEBhdXRvc3RvcHBlZFxuICAgICAgdGltZVJlbWFpbmluZyA9IEB0aW1lUmVtYWluaW5nXG5cbiAgICByZXN1bHQgPVxuICAgICAgXCJjYXB0dXJlX2xhc3RfYXR0ZW1wdGVkXCIgICAgIDogQGNhcHR1cmVMYXN0QXR0ZW1wdGVkXG4gICAgICBcIml0ZW1fYXRfdGltZVwiICAgICAgICAgICAgICAgOiBAaXRlbUF0VGltZVxuICAgICAgXCJ0aW1lX2ludGVybWVkaWF0ZV9jYXB0dXJlZFwiIDogQHRpbWVJbnRlcm1lZGlhdGVDYXB0dXJlZFxuICAgICAgXCJjYXB0dXJlX2l0ZW1fYXRfdGltZVwiICAgICAgIDogQGNhcHR1cmVJdGVtQXRUaW1lXG4gICAgICBcImF1dG9fc3RvcFwiICAgICA6IGF1dG9zdG9wcGVkXG4gICAgICBcImF0dGVtcHRlZFwiICAgICA6IEBsYXN0QXR0ZW1wdGVkXG4gICAgICBcIml0ZW1zXCIgICAgICAgICA6IGl0ZW1SZXN1bHRzXG4gICAgICBcInRpbWVfcmVtYWluXCIgICA6IHRpbWVSZW1haW5pbmdcbiAgICAgIFwibWFya19yZWNvcmRcIiAgIDogQG1hcmtSZWNvcmRcbiAgICAgIFwidmFyaWFibGVfbmFtZVwiIDogQG1vZGVsLmdldChcInZhcmlhYmxlTmFtZVwiKVxuICAgIGhhc2ggPSBAbW9kZWwuZ2V0KFwiaGFzaFwiKSBpZiBAbW9kZWwuaGFzKFwiaGFzaFwiKVxuICAgIHN1YnRlc3RSZXN1bHQgPVxuICAgICAgJ2JvZHknIDogcmVzdWx0XG4gICAgICAnbWV0YScgOlxuICAgICAgICAnaGFzaCcgOiBoYXNoXG4jICAgIHJldHVybiByZXN1bHRcbiAgICByZXR1cm4gc3VidGVzdFJlc3VsdFxuXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgaXRlbVJlc3VsdHMgPSBbXVxuXG4gICAgZm9yIGl0ZW0sIGkgaW4gQGl0ZW1zXG4gICAgICBpdGVtUmVzdWx0c1tpXSA9XG4gICAgICAgIGl0ZW1SZXN1bHQgOiBcInNraXBwZWRcIlxuICAgICAgICBpdGVtTGFiZWwgIDogaXRlbVxuXG4gICAgcmVzdWx0ID1cbiAgICAgIFwiY2FwdHVyZV9sYXN0X2F0dGVtcHRlZFwiICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcIml0ZW1fYXRfdGltZVwiICAgICAgICAgICAgICAgOiBcInNraXBwZWRcIlxuICAgICAgXCJ0aW1lX2ludGVybWVkaWF0ZV9jYXB0dXJlZFwiIDogXCJza2lwcGVkXCJcbiAgICAgIFwiY2FwdHVyZV9pdGVtX2F0X3RpbWVcIiAgICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcImF1dG9fc3RvcFwiICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcImF0dGVtcHRlZFwiICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcIml0ZW1zXCIgICAgICAgICA6IGl0ZW1SZXN1bHRzXG4gICAgICBcInRpbWVfcmVtYWluXCIgICA6IFwic2tpcHBlZFwiXG4gICAgICBcIm1hcmtfcmVjb3JkXCIgICA6IFwic2tpcHBlZFwiXG4gICAgICBcInZhcmlhYmxlX25hbWVcIiA6IEBtb2RlbC5nZXQoXCJ2YXJpYWJsZU5hbWVcIilcblxuICBvbkNsb3NlOiAtPlxuICAgIGNsZWFySW50ZXJ2YWwoQGludGVydmFsKVxuXG4gIGdldFN1bTogLT5cbiMgICAgaWYgQHByb3RvdHlwZVZpZXcuZ2V0U3VtP1xuIyAgICAgIHJldHVybiBAcHJvdG90eXBlVmlldy5nZXRTdW0oKVxuIyAgICBlbHNlXG4jIG1heWJlIGEgYmV0dGVyIGZhbGxiYWNrXG4jICAgIGNvbnNvbGUubG9nKFwiVGhpcyB2aWV3IGRvZXMgbm90IHJldHVybiBhIHN1bSwgY29ycmVjdD9cIilcbiAgICByZXR1cm4ge2NvcnJlY3Q6MCxpbmNvcnJlY3Q6MCxtaXNzaW5nOjAsdG90YWw6MH1cblxuIl19

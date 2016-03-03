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
    this.skip = bind(this.skip, this);
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
    var buttonConfig, dataEntry, disabling, displayRtl, done, firstRow, gridHTML, html, i, item, j, l, len, modeSelector, model, ref, ref1, ref2, restartButton, startTimerHTML, stopTimerHTML;
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
      for (i = l = 0, len = ref1.length; l < len; i = ++l) {
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

  GridRunItemView.prototype.onShow = function() {
    var displayCode, displaycodeFixed, error, error1, k, message, name, ref, ref1, v;
    displayCode = this.model.getString("displayCode");
    if (!_.isEmptyString(displayCode)) {
      displaycodeFixed = displayCode;
      if (_.size(Tangerine.displayCode_migrations) > 0) {
        ref = Tangerine.displayCode_migrations;
        for (k in ref) {
          v = ref[k];
          displaycodeFixed = displaycodeFixed.replace(k, v);
        }
      }
      try {
        CoffeeScript["eval"].apply(this, [displaycodeFixed]);
      } catch (error1) {
        error = error1;
        name = (/function (.{1,})\(/.exec(error.constructor.toString())[1]);
        message = error.message;
        alert(name + "\n\n" + message);
        console.log("displaycodeFixed Error: " + message);
      }
    }
    return (ref1 = this.prototypeView) != null ? typeof ref1.updateExecuteReady === "function" ? ref1.updateExecuteReady(true) : void 0 : void 0;
  };

  GridRunItemView.prototype.skip = function() {
    var currentView;
    currentView = Tangerine.progress.currentSubview;
    return this.parent.result.add({
      name: currentView.model.get("name"),
      data: currentView.getSkipped(),
      subtestId: currentView.model.id,
      skipped: true,
      prototype: currentView.model.get("prototype")
    }, {
      success: (function(_this) {
        return function() {
          return _this.parent.reset(1);
        };
      })(this)
    });
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
    var base, name1;
    event.preventDefault();
    return typeof (base = this.modeHandlers)[name1 = this.mode] === "function" ? base[name1](event) : void 0;
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
    var $target, i, index, j, l, ref, ref1, ref2, ref3;
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
        for (i = l = ref2 = index, ref3 = index - (this.columns - 1); ref2 <= ref3 ? l <= ref3 : l >= ref3; i = ref2 <= ref3 ? ++l : --l) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0dyaWRSdW5JdGVtVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxlQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFDSixTQUFBLEdBQVc7OzRCQUNYLFFBQUEsR0FBVSxHQUFJLENBQUEsTUFBQTs7NEJBRWQsTUFBQSxHQUFXLFNBQVMsQ0FBQyxLQUFiLEdBQXdCO0lBQzlCLHFCQUFBLEVBQTRCLFdBREU7SUFFOUIseUJBQUEsRUFBNEIsb0JBRkU7SUFHOUIsbUJBQUEsRUFBdUIsWUFITztJQUk5QixrQkFBQSxFQUF1QixXQUpPO0lBSzlCLGdCQUFBLEVBQXVCLGNBTE87R0FBeEIsR0FNRDtJQUNMLHlCQUFBLEVBQTRCLG9CQUR2QjtJQUVMLHFCQUFBLEVBQTRCLFdBRnZCO0lBR0wsbUJBQUEsRUFBNEIsWUFIdkI7SUFJTCxrQkFBQSxFQUE0QixXQUp2QjtJQUtMLGdCQUFBLEVBQTRCLGNBTHZCOzs7NEJBUVAsSUFBQSxHQUFNLFNBQUE7V0FFSixJQUFDLENBQUEsSUFBRCxHQUNFO01BQUEsUUFBQSxFQUFxQixDQUFBLENBQUUsOEJBQUYsQ0FBckI7TUFDQSxhQUFBLEVBQXFCLENBQUEsQ0FBRSxxQ0FBRixDQURyQjtNQUVBLGtCQUFBLEVBQXFCLENBQUEsQ0FBRSwwQ0FBRixDQUZyQjtNQUlBLFNBQUEsRUFBZ0IsQ0FBQSxDQUFFLDhCQUFGLENBSmhCO01BS0EsYUFBQSxFQUFpQixDQUFBLENBQUUsa0NBQUYsQ0FMakI7TUFNQSxjQUFBLEVBQWlCLENBQUEsQ0FBRSxtQ0FBRixDQU5qQjtNQVFBLElBQUEsRUFBZ0IsQ0FBQSxDQUFFLHlCQUFGLENBUmhCO01BU0EsS0FBQSxFQUFnQixDQUFBLENBQUUsMEJBQUYsQ0FUaEI7TUFVQSxJQUFBLEVBQWdCLENBQUEsQ0FBRSx5QkFBRixDQVZoQjtNQVdBLE9BQUEsRUFBZ0IsQ0FBQSxDQUFFLDRCQUFGLENBWGhC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SmxCO01BS0EsV0FBQSxFQUFrQixTQUxsQjtNQU1BLE9BQUEsRUFBa0IsV0FObEI7TUFPQSxhQUFBLEVBQWtCLFNBUGxCO01BUUEsYUFBQSxFQUFrQixTQVJsQjtNQVNBLGVBQUEsRUFBa0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsY0FBWCxDQVRsQjs7RUFUUTs7NEJBb0JaLE9BQUEsR0FBUyxTQUFBO1dBQ1AsYUFBQSxDQUFjLElBQUMsQ0FBQSxRQUFmO0VBRE87OzRCQUdULE1BQUEsR0FBUSxTQUFBO0FBTU4sV0FBTztNQUFDLE9BQUEsRUFBUSxDQUFUO01BQVcsU0FBQSxFQUFVLENBQXJCO01BQXVCLE9BQUEsRUFBUSxDQUEvQjtNQUFpQyxLQUFBLEVBQU0sQ0FBdkM7O0VBTkQ7Ozs7R0Evc0JvQixRQUFRLENBQUMsVUFBVSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0dyaWRSdW5JdGVtVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEdyaWRSdW5JdGVtVmlldyBleHRlbmRzIEJhY2tib25lLk1hcmlvbmV0dGUuSXRlbVZpZXdcbiAgY2xhc3NOYW1lOiBcImdyaWRJdGVtXCJcbiAgdGVtcGxhdGU6IEpTVFtcIkdyaWRcIl0sXG5cbiAgZXZlbnRzOiBpZiBNb2Rlcm5penIudG91Y2ggdGhlbiB7XG4gICAgJ2NsaWNrIC5ncmlkX2VsZW1lbnQnICAgICA6ICdncmlkQ2xpY2snICNjbGlja1xuICAgICdjbGljayAuZW5kX29mX2dyaWRfbGluZScgOiAnZW5kT2ZHcmlkTGluZUNsaWNrJyAjY2xpY2tcbiAgICAnY2xpY2sgLnN0YXJ0X3RpbWUnICA6ICdzdGFydFRpbWVyJ1xuICAgICdjbGljayAuc3RvcF90aW1lJyAgIDogJ3N0b3BUaW1lcidcbiAgICAnY2xpY2sgLnJlc3RhcnQnICAgICA6ICdyZXN0YXJ0VGltZXInXG4gIH0gZWxzZSB7XG4gICAgJ2NsaWNrIC5lbmRfb2ZfZ3JpZF9saW5lJyA6ICdlbmRPZkdyaWRMaW5lQ2xpY2snXG4gICAgJ2NsaWNrIC5ncmlkX2VsZW1lbnQnICAgICA6ICdncmlkQ2xpY2snXG4gICAgJ2NsaWNrIC5zdGFydF90aW1lJyAgICAgICA6ICdzdGFydFRpbWVyJ1xuICAgICdjbGljayAuc3RvcF90aW1lJyAgICAgICAgOiAnc3RvcFRpbWVyJ1xuICAgICdjbGljayAucmVzdGFydCcgICAgICAgICAgOiAncmVzdGFydFRpbWVyJ1xuICB9XG5cbiAgaTE4bjogLT5cblxuICAgIEB0ZXh0ID1cbiAgICAgIGF1dG9zdG9wICAgICAgICAgICA6IHQoXCJHcmlkUnVuVmlldy5tZXNzYWdlLmF1dG9zdG9wXCIpXG4gICAgICB0b3VjaExhc3RJdGVtICAgICAgOiB0KFwiR3JpZFJ1blZpZXcubWVzc2FnZS50b3VjaF9sYXN0X2l0ZW1cIilcbiAgICAgIHN1YnRlc3ROb3RDb21wbGV0ZSA6IHQoXCJHcmlkUnVuVmlldy5tZXNzYWdlLnN1YnRlc3Rfbm90X2NvbXBsZXRlXCIpXG5cbiAgICAgIGlucHV0TW9kZSAgICAgOiB0KFwiR3JpZFJ1blZpZXcubGFiZWwuaW5wdXRfbW9kZVwiKVxuICAgICAgdGltZVJlbWFpbmluZyAgOiB0KFwiR3JpZFJ1blZpZXcubGFiZWwudGltZV9yZW1haW5pbmdcIilcbiAgICAgIHdhc0F1dG9zdG9wcGVkIDogdChcIkdyaWRSdW5WaWV3LmxhYmVsLndhc19hdXRvc3RvcHBlZFwiKVxuXG4gICAgICBtYXJrICAgICAgICAgIDogdChcIkdyaWRSdW5WaWV3LmJ1dHRvbi5tYXJrXCIpXG4gICAgICBzdGFydCAgICAgICAgIDogdChcIkdyaWRSdW5WaWV3LmJ1dHRvbi5zdGFydFwiKVxuICAgICAgc3RvcCAgICAgICAgICA6IHQoXCJHcmlkUnVuVmlldy5idXR0b24uc3RvcFwiKVxuICAgICAgcmVzdGFydCAgICAgICA6IHQoXCJHcmlkUnVuVmlldy5idXR0b24ucmVzdGFydFwiKVxuICAgICAgbGFzdEF0dGVtcHRlZCA6IHQoXCJHcmlkUnVuVmlldy5idXR0b24ubGFzdF9hdHRlbXB0ZWRcIilcbiAgICAgIFwiaGVscFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5oZWxwXCIpXG5cblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3VidmlldyA9IEBcbiAgICBAaTE4bigpXG5cbiAgICBAZm9udFN0eWxlID0gXCJzdHlsZT1cXFwiZm9udC1mYW1pbHk6ICN7QG1vZGVsLmdldCgnZm9udEZhbWlseScpfSAhaW1wb3J0YW50O1xcXCJcIiBpZiBAbW9kZWwuZ2V0KFwiZm9udEZhbWlseVwiKSAhPSBcIlwiXG5cbiAgICBAY2FwdHVyZUFmdGVyU2Vjb25kcyAgPSBpZiBAbW9kZWwuaGFzKFwiY2FwdHVyZUFmdGVyU2Vjb25kc1wiKSAgdGhlbiBAbW9kZWwuZ2V0KFwiY2FwdHVyZUFmdGVyU2Vjb25kc1wiKSAgZWxzZSAwXG4gICAgQGNhcHR1cmVJdGVtQXRUaW1lICAgID0gaWYgQG1vZGVsLmhhcyhcImNhcHR1cmVJdGVtQXRUaW1lXCIpICAgIHRoZW4gQG1vZGVsLmdldChcImNhcHR1cmVJdGVtQXRUaW1lXCIpICAgIGVsc2UgZmFsc2VcbiAgICBAY2FwdHVyZUxhc3RBdHRlbXB0ZWQgPSBpZiBAbW9kZWwuaGFzKFwiY2FwdHVyZUxhc3RBdHRlbXB0ZWRcIikgdGhlbiBAbW9kZWwuZ2V0KFwiY2FwdHVyZUxhc3RBdHRlbXB0ZWRcIikgZWxzZSB0cnVlXG4gICAgQGVuZE9mTGluZSAgICAgICAgICAgID0gaWYgQG1vZGVsLmhhcyhcImVuZE9mTGluZVwiKSAgICAgICAgICAgIHRoZW4gQG1vZGVsLmdldChcImVuZE9mTGluZVwiKSAgICAgICAgICAgIGVsc2UgdHJ1ZVxuXG4gICAgQGxheW91dE1vZGUgPSBpZiBAbW9kZWwuaGFzKFwibGF5b3V0TW9kZVwiKSB0aGVuIEBtb2RlbC5nZXQoXCJsYXlvdXRNb2RlXCIpIGVsc2UgXCJmaXhlZFwiXG4gICAgQGZvbnRTaXplICAgPSBpZiBAbW9kZWwuaGFzKFwiZm9udFNpemVcIikgICB0aGVuIEBtb2RlbC5nZXQoXCJmb250U2l6ZVwiKSAgIGVsc2UgXCJub3JtYWxcIlxuXG4gICAgaWYgQGZvbnRTaXplID09IFwic21hbGxcIlxuICAgICAgZm9udFNpemVDbGFzcyA9IFwiZm9udF9zaXplX3NtYWxsXCJcbiAgICBlbHNlXG4gICAgICBmb250U2l6ZUNsYXNzID0gXCJcIlxuXG4gICAgQHJ0bCA9IEBtb2RlbC5nZXRCb29sZWFuIFwicnRsXCJcbiAgICBAJGVsLmFkZENsYXNzIFwicnRsLWdyaWRcIiBpZiBAcnRsXG5cbiAgICBAdG90YWxUaW1lID0gQG1vZGVsLmdldChcInRpbWVyXCIpIHx8IDBcblxuICAgIEBtb2RlSGFuZGxlcnMgPVxuICAgICAgXCJtYXJrXCIgICAgICAgOiBAbWFya0hhbmRsZXJcbiAgICAgIFwibGFzdFwiICAgICAgIDogQGxhc3RIYW5kbGVyXG4gICAgICBcIm1pbnV0ZUl0ZW1cIiA6IEBpbnRlcm1lZGlhdGVJdGVtSGFuZGxlclxuICAgICAgZGlzYWJsZWQgICAgIDogJC5ub29wXG5cbiAgICBAZGF0YUVudHJ5ID0gZmFsc2UgdW5sZXNzIG9wdGlvbnMuZGF0YUVudHJ5XG5cbiAgICBAbW9kZWwgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgPSBAbW9kZWwucGFyZW50XG5cbiAgICBAcmVzZXRWYXJpYWJsZXMoKVxuXG4gICAgQGdyaWRFbGVtZW50ICAgICAgICAgPSBfLnRlbXBsYXRlIFwiPHRkPjxidXR0b24gZGF0YS1sYWJlbD0ne3tsYWJlbH19JyBkYXRhLWluZGV4PSd7e2l9fScgY2xhc3M9J2dyaWRfZWxlbWVudCAje2ZvbnRTaXplQ2xhc3N9JyAje0Bmb250U3R5bGUgfHwgXCJcIn0+e3tsYWJlbH19PC9idXR0b24+PC90ZD5cIlxuICAgIEB2YXJpYWJsZUdyaWRFbGVtZW50ID0gXy50ZW1wbGF0ZSBcIjxidXR0b24gZGF0YS1sYWJlbD0ne3tsYWJlbH19JyBkYXRhLWluZGV4PSd7e2l9fScgY2xhc3M9J2dyaWRfZWxlbWVudCAje2ZvbnRTaXplQ2xhc3N9JyAje0Bmb250U3R5bGUgfHwgXCJcIn0+e3tsYWJlbH19PC9idXR0b24+XCJcblxuICAgIGlmIEBsYXlvdXRNb2RlID09IFwiZml4ZWRcIlxuICAgICAgQGVuZE9mR3JpZExpbmUgPSBfLnRlbXBsYXRlIFwiPHRkPjxidXR0b24gZGF0YS1pbmRleD0ne3tpfX0nIGNsYXNzPSdlbmRfb2ZfZ3JpZF9saW5lJz4qPC9idXR0b24+PC90ZD5cIlxuICAgIGVsc2VcbiAgICAgIEBlbmRPZkdyaWRMaW5lID0gXy50ZW1wbGF0ZSBcIlwiXG5cbiAgICBsYWJlbHMgPSB7fVxuICAgIGxhYmVscy50ZXh0ID0gQHRleHRcbiAgICBAbW9kZWwuc2V0KCdsYWJlbHMnLCBsYWJlbHMpXG5cbiAgICBAc2tpcHBhYmxlID0gQG1vZGVsLmdldChcInNraXBwYWJsZVwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gXCJ0cnVlXCJcbiAgICBAYmFja2FibGUgPSAoIEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IHRydWUgfHwgQG1vZGVsLmdldChcImJhY2tCdXR0b25cIikgPT0gXCJ0cnVlXCIgKSBhbmQgQHBhcmVudC5pbmRleCBpc250IDBcblxuIyAgICBpZiBAc2tpcHBhYmxlID09IHRydWVcbiMgICAgY29uc29sZS5sb2coXCJjaGFuZ2U6c2tpcHBhYmxlXCIpXG4jICAgICAgQHRyaWdnZXIgJ3NraXBwYWJsZTpjaGFuZ2VkJ1xuICAgIEBwYXJlbnQuZGlzcGxheVNraXAoQHNraXBwYWJsZSlcblxuXG4jICAgIGlmIEBiYWNrYWJsZSA9PSB0cnVlXG4jICAgIGNvbnNvbGUubG9nKFwiY2hhbmdlOmJhY2thYmxlXCIpXG4jICAgICAgQHRyaWdnZXIgJ2JhY2thYmxlOmNoYW5nZWQnXG4gICAgQHBhcmVudC5kaXNwbGF5QmFjayhAYmFja2FibGUpXG5cbiMgICAgdWkgPSB7fVxuIyAgICB1aS5za2lwQnV0dG9uID0gXCI8YnV0dG9uIGNsYXNzPSdza2lwIG5hdmlnYXRpb24nPiN7QHRleHQuc2tpcH08L2J1dHRvbj5cIiBpZiBza2lwcGFibGVcbiMgICAgdWkuYmFja0J1dHRvbiA9IFwiPGJ1dHRvbiBjbGFzcz0nc3VidGVzdC1iYWNrIG5hdmlnYXRpb24nPiN7QHRleHQuYmFja308L2J1dHRvbj5cIiBpZiBiYWNrYWJsZVxuIyAgICB1aS50ZXh0ID0gQHRleHRcbiMgICAgQG1vZGVsLnNldCgndWknLCB1aSlcblxuICB1aTpcbiAgICBtb2RlQnV0dG9uOiBcIi5tb2RlLWJ1dHRvblwiXG5cbiAgb25CZWZvcmVSZW5kZXI6IC0+XG5cbiAgICBkb25lID0gMFxuXG4gICAgc3RhcnRUaW1lckhUTUwgPSBcIjxkaXYgY2xhc3M9J3RpbWVyX3dyYXBwZXInPjxidXR0b24gY2xhc3M9J3N0YXJ0X3RpbWUgdGltZSc+I3tAdGV4dC5zdGFydH08L2J1dHRvbj48ZGl2IGNsYXNzPSd0aW1lcic+I3tAdGltZXJ9PC9kaXY+PC9kaXY+XCJcblxuICAgIGRpc2FibGluZyA9IFwiZGlzYWJsZWRcIiB1bmxlc3MgQHVudGltZWRcblxuICAgIGRpc3BsYXlSdGwgPSBcInJ0bF9tb2RlXCIgaWYgQHJ0bFxuXG4gICAgaHRtbCA9IGlmIG5vdCBAdW50aW1lZCB0aGVuIHN0YXJ0VGltZXJIVE1MIGVsc2UgXCJcIlxuXG4gICAgZ3JpZEhUTUwgPSBcIlwiXG5cbiAgICBpZiBAbGF5b3V0TW9kZSA9PSBcImZpeGVkXCJcbiAgICAgIGdyaWRIVE1MICs9IFwiPHRhYmxlIGNsYXNzPSdncmlkICN7ZGlzYWJsaW5nfSAje2Rpc3BsYXlSdGx8fCcnfSc+XCJcbiAgICAgIGZpcnN0Um93ID0gdHJ1ZVxuICAgICAgbG9vcFxuICAgICAgICBicmVhayBpZiBkb25lID4gQGl0ZW1zLmxlbmd0aFxuICAgICAgICBncmlkSFRNTCArPSBcIjx0cj5cIlxuICAgICAgICBmb3IgaSBpbiBbMS4uQGNvbHVtbnNdXG4gICAgICAgICAgaWYgZG9uZSA8IEBpdGVtcy5sZW5ndGhcbiAgICAgICAgICAgIGdyaWRIVE1MICs9IEBncmlkRWxlbWVudCB7IGxhYmVsIDogXy5lc2NhcGUoQGl0ZW1zW0BpdGVtTWFwW2RvbmVdXSksIGk6IGRvbmUrMSB9XG4gICAgICAgICAgZG9uZSsrXG4gICAgICAgICMgZG9uJ3Qgc2hvdyB0aGUgc2tpcCByb3cgYnV0dG9uIGZvciB0aGUgZmlyc3Qgcm93XG4gICAgICAgIGlmIGZpcnN0Um93XG4gICAgICAgICAgZ3JpZEhUTUwgKz0gXCI8dGQ+PC90ZD5cIiBpZiBkb25lIDwgKCBAaXRlbXMubGVuZ3RoICsgMSApICYmIEBlbmRPZkxpbmVcbiAgICAgICAgICBmaXJzdFJvdyA9IGZhbHNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBncmlkSFRNTCArPSBAZW5kT2ZHcmlkTGluZSh7aTpkb25lfSkgaWYgZG9uZSA8ICggQGl0ZW1zLmxlbmd0aCArIDEgKSAmJiBAZW5kT2ZMaW5lXG5cbiAgICAgICAgZ3JpZEhUTUwgKz0gXCI8L3RyPlwiXG4gICAgICBncmlkSFRNTCArPSBcIjwvdGFibGU+XCJcbiAgICBlbHNlXG4gICAgICBncmlkSFRNTCArPSBcIjxkaXYgY2xhc3M9J2dyaWQgI3tkaXNhYmxpbmd9ICN7ZGlzcGxheVJ0bHx8Jyd9Jz5cIlxuICAgICAgZm9yIGl0ZW0sIGkgaW4gQGl0ZW1zXG4gICAgICAgIGdyaWRIVE1MICs9IEB2YXJpYWJsZUdyaWRFbGVtZW50XG4gICAgICAgICAgXCJsYWJlbFwiIDogXy5lc2NhcGUoQGl0ZW1zW0BpdGVtTWFwW2ldXSlcbiAgICAgICAgICBcImlcIiAgICAgOiBpKzFcbiAgICAgIGdyaWRIVE1MICs9IFwiPC9kaXY+XCJcbiAgICBodG1sICs9IGdyaWRIVE1MXG4gICAgc3RvcFRpbWVySFRNTCA9IFwiPGRpdiBjbGFzcz0ndGltZXJfd3JhcHBlcic+PGJ1dHRvbiBjbGFzcz0nc3RvcF90aW1lIHRpbWUnPiN7QHRleHQuc3RvcH08L2J1dHRvbj48L2Rpdj5cIlxuXG4gICAgcmVzdGFydEJ1dHRvbiA9IFwiXG4gICAgICA8ZGl2PlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdyZXN0YXJ0IGNvbW1hbmQnPiN7QHRleHQucmVzdGFydH08L2J1dHRvbj5cbiAgICAgICAgPGJyPlxuICAgICAgPC9kaXY+XG4gICAgXCJcblxuICAgICNcbiAgICAjIE1vZGUgc2VsZWN0b3JcbiAgICAjXG5cbiAgICAjIGlmIGFueSBvdGhlciBvcHRpb24gaXMgYXZhaWFsYmUgb3RoZXIgdGhhbiBtYXJrLCB0aGVuIHNob3cgdGhlIHNlbGVjdG9yXG4gICAgaWYgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkIHx8IEBjYXB0dXJlSXRlbUF0VGltZVxuXG4gICAgICBAbW9kZUJ1dHRvbj8uY2xvc2UoKVxuXG4gICAgICBtb2RlbCA9IG5ldyBCdXR0b24oKVxuXG4gICAgICBidXR0b25Db25maWcgPVxuICAgICAgICBvcHRpb25zIDogW11cbiAgICAgICAgbW9kZSAgICA6IFwic2luZ2xlXCJcbiAgICAgICAgbW9kZWwgICA6IG1vZGVsXG5cbiAgICAgIGJ1dHRvbkNvbmZpZy5vcHRpb25zLnB1c2gge1xuICAgICAgICBsYWJlbCA6IEB0ZXh0Lm1hcmtcbiAgICAgICAgdmFsdWUgOiBcIm1hcmtcIlxuICAgICAgfVxuXG4gICAgICBidXR0b25Db25maWcub3B0aW9ucy5wdXNoIHtcbiAgICAgICAgbGFiZWwgOiB0KCBcIml0ZW0gYXQgX19zZWNvbmRzX18gc2Vjb25kc1wiLCBzZWNvbmRzIDogQGNhcHR1cmVBZnRlclNlY29uZHMgKVxuICAgICAgICB2YWx1ZSA6IFwibWludXRlSXRlbVwiXG4gICAgICB9IGlmIEBjYXB0dXJlSXRlbUF0VGltZVxuXG4gICAgICBidXR0b25Db25maWcub3B0aW9ucy5wdXNoIHtcbiAgICAgICAgbGFiZWwgOiBAdGV4dC5sYXN0QXR0ZW1wdGVkXG4gICAgICAgIHZhbHVlIDogXCJsYXN0XCJcbiAgICAgIH0gaWYgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkXG5cbiAgICAgIEBtb2RlQnV0dG9uID0gbmV3IEJ1dHRvbkl0ZW1WaWV3IGJ1dHRvbkNvbmZpZ1xuXG4gICAgICBAbGlzdGVuVG8gQG1vZGVCdXR0b24sIFwiY2hhbmdlIGNsaWNrXCIsIEB1cGRhdGVNb2RlXG4gICAgICBtb2RlU2VsZWN0b3IgPSBcIlxuICAgICAgICA8ZGl2IGNsYXNzPSdncmlkX21vZGVfd3JhcHBlciBxdWVzdGlvbiBjbGVhcmZpeCc+XG4gICAgICAgICAgPGxhYmVsPiN7QHRleHQuaW5wdXRNb2RlfTwvbGFiZWw+PGJyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J21vZGUtYnV0dG9uJz48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIlxuXG4gICAgZGF0YUVudHJ5ID0gXCJcbiAgICAgIDx0YWJsZSBjbGFzcz0nY2xhc3NfdGFibGUnPlxuXG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+I3tAdGV4dC53YXNBdXRvc3RvcHBlZH08L3RkPjx0ZD48aW5wdXQgdHlwZT0nY2hlY2tib3gnIGNsYXNzPSdkYXRhX2F1dG9zdG9wcGVkJz48L3RkPlxuICAgICAgICA8L3RyPlxuXG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+I3tAdGV4dC50aW1lUmVtYWluaW5nfTwvdGQ+PHRkPjxpbnB1dCB0eXBlPSdudW1iZXInIGNsYXNzPSdkYXRhX3RpbWVfcmVtYWluJz48L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgPC90YWJsZT5cbiAgICBcIlxuXG4gICAgaHRtbCArPSBcIlxuICAgICAgI3tpZiBub3QgQHVudGltZWQgdGhlbiBzdG9wVGltZXJIVE1MIGVsc2UgXCJcIn1cbiAgICAgICN7aWYgbm90IEB1bnRpbWVkIHRoZW4gcmVzdGFydEJ1dHRvbiBlbHNlIFwiXCJ9XG4gICAgICAje21vZGVTZWxlY3RvciB8fCAnJ31cbiAgICAgICN7KGRhdGFFbnRyeSBpZiBAZGF0YUVudHJ5KSB8fCAnJ31cbiAgICBcIlxuICAgIEBtb2RlbC5zZXQoJ2dyaWQnLCBodG1sKVxuXG4jICAgIEAkZWwuaHRtbCBodG1sXG5cbiMgICAgQG1vZGVCdXR0b24uc2V0RWxlbWVudCBAJGVsLmZpbmQgXCIubW9kZS1idXR0b25cIlxuIyAgICBAbW9kZUJ1dHRvbi5yZW5kZXIoKVxuXG5cblxuICBvblJlbmRlcjogPT5cblxuICAgIEBtb2RlQnV0dG9uPy5zZXRFbGVtZW50IEAkZWwuZmluZCBcIi5tb2RlLWJ1dHRvblwiXG4gICAgQG1vZGVCdXR0b24/LnJlbmRlcigpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgICBAdHJpZ2dlciBcInJlYWR5XCJcblxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG5cbiAgICAgIHByZXZpb3VzID0gQG1vZGVsLnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcbiAgICAgIGlmIHByZXZpb3VzXG4gICAgICAgIEBtYXJrUmVjb3JkID0gcHJldmlvdXMubWFya19yZWNvcmRcblxuICAgICAgICBmb3IgaXRlbSwgaSBpbiBAbWFya1JlY29yZFxuICAgICAgICAgIEBtYXJrRWxlbWVudCBpdGVtLCBudWxsLCAncG9wdWxhdGUnXG5cbiAgICAgICAgQGl0ZW1BdFRpbWUgPSBwcmV2aW91cy5pdGVtX2F0X3RpbWVcbiAgICAgICAgJHRhcmdldCA9IEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRbZGF0YS1pbmRleD0je0BpdGVtQXRUaW1lfV1cIilcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyBcImVsZW1lbnRfbWludXRlXCJcblxuICAgICAgICBAbGFzdEF0dGVtcHRlZCA9IHByZXZpb3VzLmF0dGVtcHRlZFxuICAgICAgICAkdGFyZ2V0ID0gQCRlbC5maW5kKFwiLmdyaWRfZWxlbWVudFtkYXRhLWluZGV4PSN7QGxhc3RBdHRlbXB0ZWR9XVwiKVxuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzIFwiZWxlbWVudF9sYXN0XCJcblxuICBvblNob3c6IC0+XG4gICAgZGlzcGxheUNvZGUgPSBAbW9kZWwuZ2V0U3RyaW5nKFwiZGlzcGxheUNvZGVcIilcblxuICAgIGlmIG5vdCBfLmlzRW1wdHlTdHJpbmcoZGlzcGxheUNvZGUpXG4jICAgICAgZGlzcGxheWNvZGVGaXhlZCA9IGRpc3BsYXlDb2RlLnJlcGxhY2UoXCJ2bS5jdXJyZW50Vmlldy5zdWJ0ZXN0Vmlld3Nbdm0uY3VycmVudFZpZXcuaW5kZXhdLnByb3RvdHlwZVZpZXdcIixcIlRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1wiKVxuIyAgICAgIGRpc3BsYXljb2RlRml4ZWQgPSBkaXNwbGF5Y29kZUZpeGVkLnJlcGxhY2UoXCJAcHJvdG90eXBlVmlld1wiLFwiVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XCIpXG4gICAgICBkaXNwbGF5Y29kZUZpeGVkID0gZGlzcGxheUNvZGVcbiAgICAgIGlmIF8uc2l6ZShUYW5nZXJpbmUuZGlzcGxheUNvZGVfbWlncmF0aW9ucykgPiAwXG4gICAgICAgIGZvciBrLHYgb2YgVGFuZ2VyaW5lLmRpc3BsYXlDb2RlX21pZ3JhdGlvbnNcbiAgICAgICAgICBkaXNwbGF5Y29kZUZpeGVkID0gZGlzcGxheWNvZGVGaXhlZC5yZXBsYWNlKGssdilcbiAgICAgIHRyeVxuICAgICAgICBDb2ZmZWVTY3JpcHQuZXZhbC5hcHBseShALCBbZGlzcGxheWNvZGVGaXhlZF0pXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICBuYW1lID0gKCgvZnVuY3Rpb24gKC57MSx9KVxcKC8pLmV4ZWMoZXJyb3IuY29uc3RydWN0b3IudG9TdHJpbmcoKSlbMV0pXG4gICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgIGFsZXJ0IFwiI3tuYW1lfVxcblxcbiN7bWVzc2FnZX1cIlxuICAgICAgICBjb25zb2xlLmxvZyBcImRpc3BsYXljb2RlRml4ZWQgRXJyb3I6IFwiICsgbWVzc2FnZVxuXG4gICAgQHByb3RvdHlwZVZpZXc/LnVwZGF0ZUV4ZWN1dGVSZWFkeT8odHJ1ZSlcblxuIyBAdG9kbyBEb2N1bWVudGF0aW9uXG4gIHNraXA6ID0+XG4gICAgY3VycmVudFZpZXcgPSBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXdcbiAgICBAcGFyZW50LnJlc3VsdC5hZGRcbiAgICAgIG5hbWUgICAgICA6IGN1cnJlbnRWaWV3Lm1vZGVsLmdldCBcIm5hbWVcIlxuICAgICAgZGF0YSAgICAgIDogY3VycmVudFZpZXcuZ2V0U2tpcHBlZCgpXG4gICAgICBzdWJ0ZXN0SWQgOiBjdXJyZW50Vmlldy5tb2RlbC5pZFxuICAgICAgc2tpcHBlZCAgIDogdHJ1ZVxuICAgICAgcHJvdG90eXBlIDogY3VycmVudFZpZXcubW9kZWwuZ2V0IFwicHJvdG90eXBlXCJcbiAgICAsXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBAcGFyZW50LnJlc2V0IDFcblxuICByZXN0YXJ0VGltZXI6IC0+XG4gICAgQHN0b3BUaW1lcihzaW1wbGVTdG9wOnRydWUpIGlmIEB0aW1lUnVubmluZ1xuXG4gICAgQHJlc2V0VmFyaWFibGVzKClcblxuICAgIEAkZWwuZmluZChcIi5lbGVtZW50X3dyb25nXCIpLnJlbW92ZUNsYXNzIFwiZWxlbWVudF93cm9uZ1wiXG5cbiAgZ3JpZENsaWNrOiAoZXZlbnQpID0+XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIEBtb2RlSGFuZGxlcnNbQG1vZGVdPyhldmVudClcblxuICBtYXJrSGFuZGxlcjogKGV2ZW50KSA9PlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBpbmRleCA9ICR0YXJnZXQuYXR0cignZGF0YS1pbmRleCcpXG5cbiAgICBpbmRleElzbnRCZWxvd0xhc3RBdHRlbXB0ZWQgPSBwYXJzZUludChpbmRleCkgPiBwYXJzZUludChAbGFzdEF0dGVtcHRlZClcbiAgICBsYXN0QXR0ZW1wdGVkSXNudFplcm8gICAgICAgPSBwYXJzZUludChAbGFzdEF0dGVtcHRlZCkgIT0gMFxuICAgIGNvcnJlY3Rpb25zRGlzYWJsZWQgICAgICAgICA9IEBkYXRhRW50cnkgaXMgZmFsc2UgYW5kIEBwYXJlbnQ/LmVuYWJsZUNvcnJlY3Rpb25zIGlzIGZhbHNlXG5cbiAgICByZXR1cm4gaWYgY29ycmVjdGlvbnNEaXNhYmxlZCAmJiBsYXN0QXR0ZW1wdGVkSXNudFplcm8gJiYgaW5kZXhJc250QmVsb3dMYXN0QXR0ZW1wdGVkXG5cbiAgICBAbWFya0VsZW1lbnQoaW5kZXgpXG4gICAgQGNoZWNrQXV0b3N0b3AoKSBpZiBAYXV0b3N0b3AgIT0gMFxuXG5cbiAgaW50ZXJtZWRpYXRlSXRlbUhhbmRsZXI6IChldmVudCkgPT5cbiAgICBAdGltZUludGVybWVkaWF0ZUNhcHR1cmVkID0gQGdldFRpbWUoKSAtIEBzdGFydFRpbWVcbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgaW5kZXggPSAkdGFyZ2V0LmF0dHIoJ2RhdGEtaW5kZXgnKVxuICAgIEBpdGVtQXRUaW1lID0gaW5kZXhcbiAgICAkdGFyZ2V0LmFkZENsYXNzIFwiZWxlbWVudF9taW51dGVcIlxuICAgIEB1cGRhdGVNb2RlIFwibWFya1wiXG5cbiAgY2hlY2tBdXRvc3RvcDogLT5cbiAgICBpZiBAdGltZVJ1bm5pbmdcbiAgICAgIGF1dG9Db3VudCA9IDBcbiAgICAgIGZvciBpIGluIFswLi5AYXV0b3N0b3AtMV1cbiAgICAgICAgaWYgQGdyaWRPdXRwdXRbaV0gPT0gXCJjb3JyZWN0XCIgdGhlbiBicmVha1xuICAgICAgICBhdXRvQ291bnQrK1xuICAgICAgaWYgQGF1dG9zdG9wcGVkID09IGZhbHNlXG4gICAgICAgIGlmIGF1dG9Db3VudCA9PSBAYXV0b3N0b3AgdGhlbiBAYXV0b3N0b3BUZXN0KClcbiAgICAgIGlmIEBhdXRvc3RvcHBlZCA9PSB0cnVlICYmIGF1dG9Db3VudCA8IEBhdXRvc3RvcCAmJiBAdW5kb2FibGUgPT0gdHJ1ZSB0aGVuIEB1bkF1dG9zdG9wVGVzdCgpXG5cbiMgbW9kZSBpcyB1c2VkIGZvciBvcGVyYXRpb25zIGxpa2UgcHJlLXBvcHVsYXRpbmcgdGhlIGdyaWQgd2hlbiBkb2luZyBjb3JyZWN0aW9ucy5cbiAgbWFya0VsZW1lbnQ6IChpbmRleCwgdmFsdWUgPSBudWxsLCBtb2RlKSAtPlxuIyBpZiBsYXN0IGF0dGVtcHRlZCBoYXMgYmVlbiBzZXQsIGFuZCB0aGUgY2xpY2sgaXMgYWJvdmUgaXQsIHRoZW4gY2FuY2VsXG5cbiAgICBjb3JyZWN0aW9uc0Rpc2FibGVkICAgICAgICAgPSBAZGF0YUVudHJ5IGlzIGZhbHNlIGFuZCBAcGFyZW50Py5lbmFibGVDb3JyZWN0aW9ucz8gYW5kIEBwYXJlbnQ/LmVuYWJsZUNvcnJlY3Rpb25zIGlzIGZhbHNlXG4gICAgbGFzdEF0dGVtcHRlZElzbnRaZXJvICAgICAgID0gcGFyc2VJbnQoQGxhc3RBdHRlbXB0ZWQpICE9IDBcbiAgICBpbmRleElzbnRCZWxvd0xhc3RBdHRlbXB0ZWQgPSBwYXJzZUludChpbmRleCkgPiBwYXJzZUludChAbGFzdEF0dGVtcHRlZClcblxuICAgIHJldHVybiBpZiBjb3JyZWN0aW9uc0Rpc2FibGVkIGFuZCBsYXN0QXR0ZW1wdGVkSXNudFplcm8gYW5kIGluZGV4SXNudEJlbG93TGFzdEF0dGVtcHRlZFxuXG4gICAgJHRhcmdldCA9IEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRbZGF0YS1pbmRleD0je2luZGV4fV1cIilcbiAgICBpZiBtb2RlICE9ICdwb3B1bGF0ZSdcbiAgICAgIEBtYXJrUmVjb3JkLnB1c2ggaW5kZXhcblxuICAgIGlmIG5vdCBAYXV0b3N0b3BwZWRcbiAgICAgIGlmIHZhbHVlID09IG51bGwgIyBub3Qgc3BlY2lmeWluZyB0aGUgdmFsdWUsIGp1c3QgdG9nZ2xlXG4gICAgICAgIEBncmlkT3V0cHV0W2luZGV4LTFdID0gaWYgKEBncmlkT3V0cHV0W2luZGV4LTFdID09IFwiY29ycmVjdFwiKSB0aGVuIFwiaW5jb3JyZWN0XCIgZWxzZSBcImNvcnJlY3RcIlxuICAgICAgICAkdGFyZ2V0LnRvZ2dsZUNsYXNzIFwiZWxlbWVudF93cm9uZ1wiXG4gICAgICBlbHNlICMgdmFsdWUgc3BlY2lmaWVkXG4gICAgICAgIEBncmlkT3V0cHV0W2luZGV4LTFdID0gdmFsdWVcbiAgICAgICAgaWYgdmFsdWUgPT0gXCJpbmNvcnJlY3RcIlxuICAgICAgICAgICR0YXJnZXQuYWRkQ2xhc3MgXCJlbGVtZW50X3dyb25nXCJcbiAgICAgICAgZWxzZSBpZiB2YWx1ZSA9PSBcImNvcnJlY3RcIlxuICAgICAgICAgICR0YXJnZXQucmVtb3ZlQ2xhc3MgXCJlbGVtZW50X3dyb25nXCJcblxuICBlbmRPZkdyaWRMaW5lQ2xpY2s6IChldmVudCkgLT5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaWYgQG1vZGUgPT0gXCJtYXJrXCJcbiAgICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcblxuICAgICAgIyBpZiB3aGF0IHdlIGNsaWNrZWQgaXMgYWxyZWFkeSBtYXJrZWQgd3JvbmdcbiAgICAgIGlmICR0YXJnZXQuaGFzQ2xhc3MoXCJlbGVtZW50X3dyb25nXCIpXG4jIFlFUywgbWFyayBpdCByaWdodFxuICAgICAgICAkdGFyZ2V0LnJlbW92ZUNsYXNzIFwiZWxlbWVudF93cm9uZ1wiXG4gICAgICAgIGluZGV4ID0gJHRhcmdldC5hdHRyKCdkYXRhLWluZGV4JylcbiAgICAgICAgZm9yIGkgaW4gW2luZGV4Li4oaW5kZXgtKEBjb2x1bW5zLTEpKV1cbiAgICAgICAgICBAbWFya0VsZW1lbnQgaSwgXCJjb3JyZWN0XCJcbiAgICAgIGVsc2UgaWYgISR0YXJnZXQuaGFzQ2xhc3MoXCJlbGVtZW50X3dyb25nXCIpICYmICFAYXV0b3N0b3BwZWRcbiMgTk8sIG1hcmsgaXQgd3JvbmdcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyBcImVsZW1lbnRfd3JvbmdcIlxuICAgICAgICBpbmRleCA9ICR0YXJnZXQuYXR0cignZGF0YS1pbmRleCcpXG4gICAgICAgIGZvciBpIGluIFtpbmRleC4uKGluZGV4LShAY29sdW1ucy0xKSldXG4gICAgICAgICAgQG1hcmtFbGVtZW50IGksIFwiaW5jb3JyZWN0XCJcblxuICAgICAgQGNoZWNrQXV0b3N0b3AoKSBpZiBAYXV0b3N0b3AgIT0gMFxuXG4gIGxhc3RIYW5kbGVyOiAoZXZlbnQsIGluZGV4KSA9PlxuICAgIGlmIGluZGV4P1xuICAgICAgJHRhcmdldCA9IEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRbZGF0YS1pbmRleD0je2luZGV4fV1cIilcbiAgICBlbHNlXG4gICAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgICBpbmRleCAgID0gJHRhcmdldC5hdHRyKCdkYXRhLWluZGV4JylcblxuICAgIGlmIGluZGV4IC0gMSA+PSBAZ3JpZE91dHB1dC5sYXN0SW5kZXhPZihcImluY29ycmVjdFwiKVxuICAgICAgQCRlbC5maW5kKFwiLmVsZW1lbnRfbGFzdFwiKS5yZW1vdmVDbGFzcyBcImVsZW1lbnRfbGFzdFwiXG4gICAgICAkdGFyZ2V0LmFkZENsYXNzIFwiZWxlbWVudF9sYXN0XCJcbiAgICAgIEBsYXN0QXR0ZW1wdGVkID0gaW5kZXhcblxuICBmbG9hdE9uOiAtPlxuICAgIHRpbWVyID0gQCRlbC5maW5kKCcudGltZXInKVxuICAgIHRpbWVyUG9zID0gdGltZXIub2Zmc2V0KClcbiAgICAkKHdpbmRvdykub24gJ3Njcm9sbCcsIC0+XG4gICAgICBzY3JvbGxQb3MgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKClcbiAgICAgIGlmIHNjcm9sbFBvcyA+PSB0aW1lclBvcy50b3BcbiAgICAgICAgdGltZXIuY3NzXG4gICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIlxuICAgICAgICAgIHRvcDogXCIxMCVcIlxuICAgICAgICAgIGxlZnQ6IFwiODAlXCJcbiAgICAgIGVsc2VcbiAgICAgICAgdGltZXIuY3NzXG4gICAgICAgICAgcG9zaXRpb246IFwiaW5pdGlhbFwiXG4gICAgICAgICAgdG9wOiBcImluaXRpYWxcIlxuICAgICAgICAgIGxlZnQ6IFwiaW5pdGlhbFwiXG5cbiAgZmxvYXRPZmY6IC0+XG4gICAgJCh3aW5kb3cpLm9mZiAnc2Nyb2xsJ1xuICAgIHRpbWVyID0gQCRlbC5maW5kKCcudGltZXInKVxuICAgIHRpbWVyLmNzc1xuICAgICAgcG9zaXRpb246IFwiaW5pdGlhbFwiXG4gICAgICB0b3A6IFwiaW5pdGlhbFwiXG4gICAgICBsZWZ0OiBcImluaXRpYWxcIlxuXG5cbiAgc3RhcnRUaW1lcjogLT5cbiAgICBpZiBAdGltZXJTdG9wcGVkID09IGZhbHNlICYmIEB0aW1lUnVubmluZyA9PSBmYWxzZVxuICAgICAgQGludGVydmFsID0gc2V0SW50ZXJ2YWwoIEB1cGRhdGVDb3VudGRvd24sIDEwMDAgKSAjIG1hZ2ljIG51bWJlclxuICAgICAgQHN0YXJ0VGltZSA9IEBnZXRUaW1lKClcbiAgICAgIEB0aW1lUnVubmluZyA9IHRydWVcbiAgICAgIEB1cGRhdGVNb2RlIFwibWFya1wiXG4gICAgICBAZW5hYmxlR3JpZCgpXG4gICAgICBAdXBkYXRlQ291bnRkb3duKClcbiAgICAgIEBmbG9hdE9uKClcblxuICBlbmFibGVHcmlkOiAtPlxuICAgIEAkZWwuZmluZChcInRhYmxlLmRpc2FibGVkLCBkaXYuZGlzYWJsZWRcIikucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKVxuXG4gIHN0b3BUaW1lcjogKGV2ZW50LCBtZXNzYWdlID0gZmFsc2UpIC0+XG5cbiAgICByZXR1cm4gaWYgQHRpbWVSdW5uaW5nICE9IHRydWUgIyBzdG9wIG9ubHkgaWYgbmVlZGVkXG5cbiAgICBpZiBldmVudD8udGFyZ2V0XG4gICAgICBAbGFzdEhhbmRsZXIobnVsbCwgQGl0ZW1zLmxlbmd0aClcblxuICAgICMgZG8gdGhlc2UgYWx3YXlzXG4gICAgY2xlYXJJbnRlcnZhbCBAaW50ZXJ2YWxcbiAgICBAc3RvcFRpbWUgPSBAZ2V0VGltZSgpXG4gICAgQHRpbWVSdW5uaW5nID0gZmFsc2VcbiAgICBAdGltZXJTdG9wcGVkID0gdHJ1ZVxuICAgIEBmbG9hdE9mZigpXG5cbiAgICBAdXBkYXRlQ291bnRkb3duKClcblxuIyBkbyB0aGVzZSBpZiBpdCdzIG5vdCBhIHNpbXBsZSBzdG9wXG4jaWYgbm90IGV2ZW50Py5zaW1wbGVTdG9wXG4jVXRpbHMuZmxhc2goKVxuXG5cbiAgYXV0b3N0b3BUZXN0OiAtPlxuICAgIFV0aWxzLmZsYXNoKClcbiAgICBjbGVhckludGVydmFsIEBpbnRlcnZhbFxuICAgIEBzdG9wVGltZSA9IEBnZXRUaW1lKClcbiAgICBAYXV0b3N0b3BwZWQgPSB0cnVlXG4gICAgQHRpbWVyU3RvcHBlZCA9IHRydWVcbiAgICBAdGltZVJ1bm5pbmcgPSBmYWxzZVxuICAgIEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRcIikuc2xpY2UoQGF1dG9zdG9wLTEsQGF1dG9zdG9wKS5hZGRDbGFzcyBcImVsZW1lbnRfbGFzdFwiICNqcXVlcnkgaXMgd2VpcmQgc29tZXRpbWVzXG4gICAgQGxhc3RBdHRlbXB0ZWQgPSBAYXV0b3N0b3BcbiAgICBAdGltZW91dCA9IHNldFRpbWVvdXQoQHJlbW92ZVVuZG8sIDMwMDApICMgZ2l2ZSB0aGVtIDMgc2Vjb25kcyB0byB1bmRvLiBtYWdpYyBudW1iZXJcbiAgICBVdGlscy50b3BBbGVydCBAdGV4dC5hdXRvc3RvcFxuXG4gIHJlbW92ZVVuZG86ID0+XG4gICAgQHVuZG9hYmxlID0gZmFsc2VcbiAgICBAdXBkYXRlTW9kZSBcImRpc2FibGVkXCJcbiAgICBjbGVhclRpbWVvdXQoQHRpbWVvdXQpXG5cbiAgdW5BdXRvc3RvcFRlc3Q6IC0+XG4gICAgQGludGVydmFsID0gc2V0SW50ZXJ2YWwoQHVwZGF0ZUNvdW50ZG93biwgMTAwMCApICMgbWFnaWMgbnVtYmVyXG4gICAgQHVwZGF0ZUNvdW50ZG93bigpXG4gICAgQGF1dG9zdG9wcGVkID0gZmFsc2VcbiAgICBAbGFzdEF0dGVtcHRlZCA9IDBcbiAgICBAJGVsLmZpbmQoXCIuZ3JpZF9lbGVtZW50XCIpLnNsaWNlKEBhdXRvc3RvcC0xLEBhdXRvc3RvcCkucmVtb3ZlQ2xhc3MgXCJlbGVtZW50X2xhc3RcIlxuICAgIEB0aW1lUnVubmluZyA9IHRydWVcbiAgICBAdXBkYXRlTW9kZSBcIm1hcmtcIlxuICAgIFV0aWxzLnRvcEFsZXJ0IHQoXCJHcmlkUnVuVmlldy5tZXNzYWdlLmF1dG9zdG9wX2NhbmNlbFwiKVxuXG4gIHVwZGF0ZUNvdW50ZG93bjogPT5cbiMgc29tZXRpbWVzIHRoZSBcInRpY2tcIiBkb2Vzbid0IGhhcHBlbiB3aXRoaW4gYSBzZWNvbmRcbiAgICBAdGltZUVsYXBzZWQgPSBNYXRoLm1pbihAZ2V0VGltZSgpIC0gQHN0YXJ0VGltZSwgQHRpbWVyKVxuXG4gICAgQHRpbWVSZW1haW5pbmcgPSBAdGltZXIgLSBAdGltZUVsYXBzZWRcblxuICAgIEAkZWwuZmluZChcIi50aW1lclwiKS5odG1sIEB0aW1lUmVtYWluaW5nXG5cbiAgICBpZiBAdGltZVJ1bm5pbmcgaXMgdHJ1ZSBhbmQgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkIGFuZCBAdGltZVJlbWFpbmluZyA8PSAwXG4gICAgICBAc3RvcFRpbWVyKHNpbXBsZVN0b3A6dHJ1ZSlcbiAgICAgIFV0aWxzLmJhY2tncm91bmQgXCJyZWRcIlxuICAgICAgXy5kZWxheShcbiAgICAgICAgPT5cbiAgICAgICAgICBhbGVydCBAdGV4dC50b3VjaExhc3RJdGVtXG4gICAgICAgICAgVXRpbHMuYmFja2dyb3VuZCBcIlwiXG4gICAgICAsIDFlMykgIyBtYWdpYyBudW1iZXJcblxuICAgICAgQHVwZGF0ZU1vZGUgXCJsYXN0XCJcblxuXG4gICAgaWYgQGNhcHR1cmVJdGVtQXRUaW1lICYmICFAZ290SW50ZXJtZWRpYXRlICYmICFAbWludXRlTWVzc2FnZSAmJiBAdGltZUVsYXBzZWQgPj0gQGNhcHR1cmVBZnRlclNlY29uZHNcbiAgICAgIFV0aWxzLmZsYXNoIFwieWVsbG93XCJcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IHQoXCJwbGVhc2Ugc2VsZWN0IHRoZSBpdGVtIHRoZSBjaGlsZCBpcyBjdXJyZW50bHkgYXR0ZW1wdGluZ1wiKVxuICAgICAgQG1pbnV0ZU1lc3NhZ2UgPSB0cnVlXG4gICAgICBAbW9kZSA9IFwibWludXRlSXRlbVwiXG5cblxuICB1cGRhdGVNb2RlOiAoIG1vZGUgPSBudWxsICkgPT5cbiMgZG9udCcgY2hhbmdlIHRoZSBtb2RlIGlmIHRoZSB0aW1lIGhhcyBuZXZlciBiZWVuIHN0YXJ0ZWRcbiAgICBpZiAobW9kZT09bnVsbCAmJiBAdGltZUVsYXBzZWQgPT0gMCAmJiBub3QgQGRhdGFFbnRyeSkgfHwgbW9kZSA9PSBcImRpc2FibGVkXCJcbiAgICAgIEBtb2RlQnV0dG9uPy5zZXRWYWx1ZSBudWxsXG4gICAgZWxzZSBpZiBtb2RlPyAjIG1hbnVhbGx5IGNoYW5nZSB0aGUgbW9kZVxuICAgICAgQG1vZGUgPSBtb2RlXG4gICAgICBAbW9kZUJ1dHRvbj8uc2V0VmFsdWUgQG1vZGVcbiAgICBlbHNlICMgaGFuZGxlIGEgY2xpY2sgZXZlbnRcbiAgICAgIEBtb2RlID0gQG1vZGVCdXR0b24/LmdldFZhbHVlKClcblxuICBnZXRUaW1lOiAtPlxuICAgIE1hdGgucm91bmQoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAvIDEwMDApXG5cbiAgcmVzZXRWYXJpYWJsZXM6IC0+XG5cbiAgICBAdGltZXIgICAgPSBwYXJzZUludChAbW9kZWwuZ2V0KFwidGltZXJcIikpIHx8IDBcbiAgICBAdW50aW1lZCAgPSBAdGltZXIgPT0gMCB8fCBAZGF0YUVudHJ5ICMgRG8gbm90IHNob3cgdGhlIHRpbWVyIGlmIGl0J3MgZGlzYXNibGVkIG9yIGRhdGEgZW50cnkgbW9kZVxuXG4gICAgQGdvdE1pbnV0ZUl0ZW0gPSBmYWxzZVxuICAgIEBtaW51dGVNZXNzYWdlID0gZmFsc2VcbiAgICBAaXRlbUF0VGltZSA9IG51bGxcblxuICAgIEB0aW1lSW50ZXJtZWRpYXRlQ2FwdHVyZWQgPSBudWxsXG5cbiAgICBAbWFya1JlY29yZCA9IFtdXG5cbiAgICBAdGltZXJTdG9wcGVkID0gZmFsc2VcblxuICAgIEBzdGFydFRpbWUgPSAwXG4gICAgQHN0b3BUaW1lICA9IDBcbiAgICBAdGltZUVsYXBzZWQgPSAwXG4gICAgQHRpbWVSZW1haW5pbmcgPSBAdGltZXJcbiAgICBAbGFzdEF0dGVtcHRlZCA9IDBcblxuICAgIEBpbnRlcnZhbCA9IG51bGxcblxuICAgIEB1bmRvYWJsZSA9IHRydWVcblxuICAgIEB0aW1lUnVubmluZyA9IGZhbHNlXG5cblxuICAgIEBpdGVtcyAgICA9IF8uY29tcGFjdChAbW9kZWwuZ2V0KFwiaXRlbXNcIikpICMgbWlsZCBzYW5pdGl6YXRpb24sIGhhcHBlbnMgYXQgc2F2ZSB0b29cblxuICAgIEBpdGVtTWFwID0gW11cbiAgICBAbWFwSXRlbSA9IFtdXG5cbiAgICBpZiBAbW9kZWwuaGFzKFwicmFuZG9taXplXCIpICYmIEBtb2RlbC5nZXQoXCJyYW5kb21pemVcIilcbiAgICAgIEBpdGVtTWFwID0gQGl0ZW1zLm1hcCAodmFsdWUsIGkpIC0+IGlcblxuICAgICAgQGl0ZW1zLmZvckVhY2ggKGl0ZW0sIGkpIC0+XG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBAaXRlbXMubGVuZ3RoKVxuICAgICAgICB0ZW1wVmFsdWUgPSBAaXRlbU1hcFt0ZW1wXVxuICAgICAgICBAaXRlbU1hcFt0ZW1wXSA9IEBpdGVtTWFwW2ldXG4gICAgICAgIEBpdGVtTWFwW2ldID0gdGVtcFZhbHVlXG4gICAgICAsIEBcblxuICAgICAgQGl0ZW1NYXAuZm9yRWFjaCAoaXRlbSwgaSkgLT5cbiAgICAgICAgQG1hcEl0ZW1bQGl0ZW1NYXBbaV1dID0gaVxuICAgICAgLCBAXG4gICAgZWxzZVxuICAgICAgQGl0ZW1zLmZvckVhY2ggKGl0ZW0sIGkpIC0+XG4gICAgICAgIEBpdGVtTWFwW2ldID0gaVxuICAgICAgICBAbWFwSXRlbVtpXSA9IGlcbiAgICAgICwgQFxuXG4gICAgaWYgIUBjYXB0dXJlTGFzdEF0dGVtcHRlZCAmJiAhQGNhcHR1cmVJdGVtQXRUaW1lXG4gICAgICBAbW9kZSA9IFwibWFya1wiXG4gICAgZWxzZVxuICAgICAgQG1vZGUgPSBcImRpc2FibGVkXCJcblxuICAgIEBtb2RlID0gXCJtYXJrXCIgaWYgQGRhdGFFbnRyeVxuXG4gICAgQGdyaWRPdXRwdXQgPSBAaXRlbXMubWFwIC0+ICdjb3JyZWN0J1xuICAgIEBjb2x1bW5zICA9IHBhcnNlSW50KEBtb2RlbC5nZXQoXCJjb2x1bW5zXCIpKSB8fCAzXG5cbiAgICBAYXV0b3N0b3AgPSBpZiBAdW50aW1lZCB0aGVuIDAgZWxzZSAocGFyc2VJbnQoQG1vZGVsLmdldChcImF1dG9zdG9wXCIpKSB8fCAwKVxuICAgIEBhdXRvc3RvcHBlZCA9IGZhbHNlXG5cbiAgICBAJGVsLmZpbmQoXCIuZ3JpZF9lbGVtZW50XCIpLnJlbW92ZUNsYXNzKFwiZWxlbWVudF93cm9uZ1wiKS5yZW1vdmVDbGFzcyhcImVsZW1lbnRfbGFzdFwiKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpXG4gICAgQCRlbC5maW5kKFwidGFibGVcIikuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKVxuXG4gICAgQCRlbC5maW5kKFwiLnRpbWVyXCIpLmh0bWwgQHRpbWVyXG5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuXG4gICAgICBwcmV2aW91cyA9IEBtb2RlbC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG4gICAgICBpZiBwcmV2aW91c1xuXG4gICAgICAgIEBjYXB0dXJlTGFzdEF0dGVtcHRlZCAgICAgPSBwcmV2aW91cy5jYXB0dXJlX2xhc3RfYXR0ZW1wdGVkXG4gICAgICAgIEBpdGVtQXRUaW1lICAgICAgICAgICAgICAgPSBwcmV2aW91cy5pdGVtX2F0X3RpbWVcbiAgICAgICAgQHRpbWVJbnRlcm1lZGlhdGVDYXB0dXJlZCA9IHByZXZpb3VzLnRpbWVfaW50ZXJtZWRpYXRlX2NhcHR1cmVkXG4gICAgICAgIEBjYXB0dXJlSXRlbUF0VGltZSAgICAgICAgPSBwcmV2aW91cy5jYXB0dXJlX2l0ZW1fYXRfdGltZVxuICAgICAgICBAYXV0b3N0b3AgICAgICAgICAgICAgICAgID0gcHJldmlvdXMuYXV0b19zdG9wXG4gICAgICAgIEBsYXN0QXR0ZW1wdGVkICAgICAgICAgICAgPSBwcmV2aW91cy5hdHRlbXB0ZWRcbiAgICAgICAgQHRpbWVSZW1haW5pbmcgICAgICAgICAgICA9IHByZXZpb3VzLnRpbWVfcmVtYWluXG4gICAgICAgIEBtYXJrUmVjb3JkICAgICAgICAgICAgICAgPSBwcmV2aW91cy5tYXJrX3JlY29yZFxuXG4gICAgQHVwZGF0ZU1vZGUgQG1vZGUgaWYgQG1vZGVCdXR0b24/XG5cbiAgaXNWYWxpZDogLT5cbiAgICAjIFN0b3AgdGltZXIgaWYgc3RpbGwgcnVubmluZy4gSXNzdWUgIzI0MFxuICAgIEBzdG9wVGltZXIoKSBpZiBAdGltZVJ1bm5pbmdcblxuICAgIGlmIHBhcnNlSW50KEBsYXN0QXR0ZW1wdGVkKSBpcyBAaXRlbXMubGVuZ3RoIGFuZCBAdGltZVJlbWFpbmluZyBpcyAwXG5cbiAgICAgIGl0ZW0gPSBAaXRlbXNbQGl0ZW1zLmxlbmd0aC0xXVxuICAgICAgaWYgY29uZmlybSh0KFwiR3JpZFJ1blZpZXcubWVzc2FnZS5sYXN0X2l0ZW1fY29uZmlybVwiLCBpdGVtOml0ZW0pKVxuICAgICAgICBAdXBkYXRlTW9kZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBAbWVzc2FnZXMgPSBpZiBAbWVzc2FnZXM/LnB1c2ggdGhlbiBAbWVzc2FnZXMuY29uY2F0KFttc2ddKSBlbHNlIFttc2ddXG4gICAgICAgIEB1cGRhdGVNb2RlIFwibGFzdFwiXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgcmV0dXJuIGZhbHNlIGlmIEBjYXB0dXJlTGFzdEF0dGVtcHRlZCAmJiBAbGFzdEF0dGVtcHRlZCA9PSAwXG4gICAgIyBtaWdodCBuZWVkIHRvIGxldCBpdCBrbm93IGlmIGl0J3MgdGltZWQgb3IgdW50aW1lZCB0b28gOjpzaHJ1Zzo6XG4gICAgcmV0dXJuIGZhbHNlIGlmIEB0aW1lUnVubmluZyA9PSB0cnVlXG4gICAgcmV0dXJuIGZhbHNlIGlmIEB0aW1lciAhPSAwICYmIEB0aW1lUmVtYWluaW5nID09IEB0aW1lclxuICAgIHRydWVcblxuICB0ZXN0VmFsaWQ6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwiR3JpZFJ1bkl0ZW1WaWV3IHRlc3RWYWxpZC5cIilcbiAgICAjICAgIGlmIG5vdCBAcHJvdG90eXBlUmVuZGVyZWQgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAjICAgIGN1cnJlbnRWaWV3ID0gVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XG4gICAgaWYgQGlzVmFsaWQ/XG4gICAgICByZXR1cm4gQGlzVmFsaWQoKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHRydWVcblxuICBzaG93RXJyb3JzOiAtPlxuICAgIG1lc3NhZ2VzID0gQG1lc3NhZ2VzIHx8IFtdXG4gICAgQG1lc3NhZ2VzID0gW11cblxuICAgIHRpbWVySGFzbnRSdW4gICAgPSBAdGltZXIgIT0gMCAmJiBAdGltZVJlbWFpbmluZyA9PSBAdGltZXJcbiAgICBub0xhc3RJdGVtICAgICAgID0gQGNhcHR1cmVMYXN0QXR0ZW1wdGVkICYmIEBsYXN0QXR0ZW1wdGVkID09IDBcbiAgICB0aW1lU3RpbGxSdW5uaW5nID0gQHRpbWVSdW5pbmcgPT0gdHJ1ZVxuXG4gICAgaWYgdGltZXJIYXNudFJ1blxuICAgICAgbWVzc2FnZXMucHVzaCBAdGV4dC5zdWJ0ZXN0Tm90Q29tcGxldGVcblxuICAgIGlmIG5vTGFzdEl0ZW0gJiYgbm90IHRpbWVySGFzbnRSdW5cbiAgICAgIG1lc3NhZ2VzLnB1c2ggQHRleHQudG91Y2hMYXN0SXRlbVxuICAgICAgQHVwZGF0ZU1vZGUgXCJsYXN0XCJcblxuICAgIGlmIHRpbWVTdGlsbFJ1bm5pbmdcbiAgICAgIG1lc3NhZ2VzLnB1c2ggQHRleHQudGltZVN0aWxsUnVubmluZ1xuXG4gICAgVXRpbHMubWlkQWxlcnQgbWVzc2FnZXMuam9pbihcIjxicj5cIiksIDMwMDAgIyBtYWdpYyBudW1iZXJcblxuICBnZXRSZXN1bHQ6IC0+XG4gICAgY29tcGxldGVSZXN1bHRzID0gW11cbiAgICBpdGVtUmVzdWx0cyA9IFtdXG4gICAgQGxhc3RBdHRlbXB0ZWQgPSBAaXRlbXMubGVuZ3RoIGlmIG5vdCBAY2FwdHVyZUxhc3RBdHRlbXB0ZWRcbiMgICAgY29uc29sZS5sb2coXCJAbGFzdEF0dGVtcHRlZDogXCIgKyBAbGFzdEF0dGVtcHRlZClcblxuICAgIGZvciBpdGVtLCBpIGluIEBpdGVtc1xuXG4gICAgICBpZiBAbWFwSXRlbVtpXSA8IEBsYXN0QXR0ZW1wdGVkXG4gICAgICAgIGl0ZW1SZXN1bHRzW2ldID1cbiAgICAgICAgICBpdGVtUmVzdWx0IDogQGdyaWRPdXRwdXRbQG1hcEl0ZW1baV1dXG4gICAgICAgICAgaXRlbUxhYmVsICA6IGl0ZW1cbiAgICAgIGVsc2VcbiAgICAgICAgaXRlbVJlc3VsdHNbaV0gPVxuICAgICAgICAgIGl0ZW1SZXN1bHQgOiBcIm1pc3NpbmdcIlxuICAgICAgICAgIGl0ZW1MYWJlbCA6IEBpdGVtc1tAbWFwSXRlbVtpXV1cblxuICAgIEBsYXN0QXR0ZW1wdGVkID0gZmFsc2UgaWYgbm90IEBjYXB0dXJlTGFzdEF0dGVtcHRlZFxuXG4gICAgaWYgQGRhdGFFbnRyeVxuICAgICAgYXV0b3N0b3BwZWQgPSBAJGVsLmZpbmQoXCIuZGF0YV9hdXRvc3RvcHBlZFwiKS5pcyhcIjpjaGVja2VkXCIpXG4gICAgICB0aW1lUmVtYWluaW5nID0gcGFyc2VJbnQoQCRlbC5maW5kKFwiLmRhdGFfdGltZV9yZW1haW5cIikudmFsKCkpXG4gICAgZWxzZVxuICAgICAgYXV0b3N0b3BwZWQgICA9IEBhdXRvc3RvcHBlZFxuICAgICAgdGltZVJlbWFpbmluZyA9IEB0aW1lUmVtYWluaW5nXG5cbiAgICByZXN1bHQgPVxuICAgICAgXCJjYXB0dXJlX2xhc3RfYXR0ZW1wdGVkXCIgICAgIDogQGNhcHR1cmVMYXN0QXR0ZW1wdGVkXG4gICAgICBcIml0ZW1fYXRfdGltZVwiICAgICAgICAgICAgICAgOiBAaXRlbUF0VGltZVxuICAgICAgXCJ0aW1lX2ludGVybWVkaWF0ZV9jYXB0dXJlZFwiIDogQHRpbWVJbnRlcm1lZGlhdGVDYXB0dXJlZFxuICAgICAgXCJjYXB0dXJlX2l0ZW1fYXRfdGltZVwiICAgICAgIDogQGNhcHR1cmVJdGVtQXRUaW1lXG4gICAgICBcImF1dG9fc3RvcFwiICAgICA6IGF1dG9zdG9wcGVkXG4gICAgICBcImF0dGVtcHRlZFwiICAgICA6IEBsYXN0QXR0ZW1wdGVkXG4gICAgICBcIml0ZW1zXCIgICAgICAgICA6IGl0ZW1SZXN1bHRzXG4gICAgICBcInRpbWVfcmVtYWluXCIgICA6IHRpbWVSZW1haW5pbmdcbiAgICAgIFwibWFya19yZWNvcmRcIiAgIDogQG1hcmtSZWNvcmRcbiAgICAgIFwidmFyaWFibGVfbmFtZVwiIDogQG1vZGVsLmdldChcInZhcmlhYmxlTmFtZVwiKVxuICAgIGhhc2ggPSBAbW9kZWwuZ2V0KFwiaGFzaFwiKSBpZiBAbW9kZWwuaGFzKFwiaGFzaFwiKVxuICAgIHN1YnRlc3RSZXN1bHQgPVxuICAgICAgJ2JvZHknIDogcmVzdWx0XG4gICAgICAnbWV0YScgOlxuICAgICAgICAnaGFzaCcgOiBoYXNoXG4jICAgIHJldHVybiByZXN1bHRcbiAgICByZXR1cm4gc3VidGVzdFJlc3VsdFxuXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgaXRlbVJlc3VsdHMgPSBbXVxuXG4gICAgZm9yIGl0ZW0sIGkgaW4gQGl0ZW1zXG4gICAgICBpdGVtUmVzdWx0c1tpXSA9XG4gICAgICAgIGl0ZW1SZXN1bHQgOiBcInNraXBwZWRcIlxuICAgICAgICBpdGVtTGFiZWwgIDogaXRlbVxuXG4gICAgcmVzdWx0ID1cbiAgICAgIFwiY2FwdHVyZV9sYXN0X2F0dGVtcHRlZFwiICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcIml0ZW1fYXRfdGltZVwiICAgICAgICAgICAgICAgOiBcInNraXBwZWRcIlxuICAgICAgXCJ0aW1lX2ludGVybWVkaWF0ZV9jYXB0dXJlZFwiIDogXCJza2lwcGVkXCJcbiAgICAgIFwiY2FwdHVyZV9pdGVtX2F0X3RpbWVcIiAgICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcImF1dG9fc3RvcFwiICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcImF0dGVtcHRlZFwiICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcIml0ZW1zXCIgICAgICAgICA6IGl0ZW1SZXN1bHRzXG4gICAgICBcInRpbWVfcmVtYWluXCIgICA6IFwic2tpcHBlZFwiXG4gICAgICBcIm1hcmtfcmVjb3JkXCIgICA6IFwic2tpcHBlZFwiXG4gICAgICBcInZhcmlhYmxlX25hbWVcIiA6IEBtb2RlbC5nZXQoXCJ2YXJpYWJsZU5hbWVcIilcblxuICBvbkNsb3NlOiAtPlxuICAgIGNsZWFySW50ZXJ2YWwoQGludGVydmFsKVxuXG4gIGdldFN1bTogLT5cbiMgICAgaWYgQHByb3RvdHlwZVZpZXcuZ2V0U3VtP1xuIyAgICAgIHJldHVybiBAcHJvdG90eXBlVmlldy5nZXRTdW0oKVxuIyAgICBlbHNlXG4jIG1heWJlIGEgYmV0dGVyIGZhbGxiYWNrXG4jICAgIGNvbnNvbGUubG9nKFwiVGhpcyB2aWV3IGRvZXMgbm90IHJldHVybiBhIHN1bSwgY29ycmVjdD9cIilcbiAgICByZXR1cm4ge2NvcnJlY3Q6MCxpbmNvcnJlY3Q6MCxtaXNzaW5nOjAsdG90YWw6MH1cblxuIl19

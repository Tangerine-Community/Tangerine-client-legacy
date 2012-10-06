var ObservationPrintView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ObservationPrintView = (function(_super) {

  __extends(ObservationPrintView, _super);

  function ObservationPrintView() {
    this.saveCurrentSurvey = __bind(this.saveCurrentSurvey, this);
    this.updateObservationIndex = __bind(this.updateObservationIndex, this);
    this.checkSurveyDisplay = __bind(this.checkSurveyDisplay, this);
    this.checkIfOver = __bind(this.checkIfOver, this);
    this.checkWarning = __bind(this.checkWarning, this);
    this.checkObservationPace = __bind(this.checkObservationPace, this);
    this.tick = __bind(this.tick, this);
    ObservationPrintView.__super__.constructor.apply(this, arguments);
  }

  ObservationPrintView.prototype.events = {
    "click .start_time": "startObservations",
    "click .stop_time": "stopObservations",
    "click .done": "completeObservation"
  };

  ObservationPrintView.prototype.initialize = function(options) {
    this.model = this.options.model;
    return this.parent = this.options.parent;
  };

  ObservationPrintView.prototype.initializeSurvey = function() {
    var attributes, i, models;
    if (this.survey != null) this.onClose();
    attributes = $.extend(this.model.get('surveyAttributes'), {
      "_id": this.model.id
    });
    models = (function() {
      var _ref, _results;
      _results = [];
      for (i = 1, _ref = parseInt(this.model.get('totalSeconds') / this.model.get('intervalLength')); 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
        _results.push(new Backbone.Model(attributes));
      }
      return _results;
    }).call(this);
    models.unshift("");
    this.skippableView = new SurveyRunView({
      "model": models[1],
      "parent": this,
      "isObservation": true
    });
    return this.survey = {
      "models": models,
      "results": []
    };
  };

  ObservationPrintView.prototype.initializeFlags = function() {
    this.iAm = {
      "counting": false,
      "recording": false
    };
    this.iHavent = {
      "warned": true
    };
    this.iHave = {
      "runOnce": false,
      "finished": false
    };
    return this.my = {
      "time": {
        "start": 0,
        "elapsed": 0
      },
      "observation": {
        "index": 0,
        "oldIndex": 0,
        "completed": 0,
        "total": parseInt(this.model.get('totalSeconds') / this.model.get('intervalLength'))
      }
    };
  };

  ObservationPrintView.prototype.startObservations = function() {
    if (this.iAm.counting || this.iHave.runOnce) return;
    this.$el.find(".stop_button_wrapper, .next_display, .completed_display").removeClass("confirmation");
    this.$el.find(".start_button_wrapper").addClass("confirmation");
    this.timerInterval = setInterval(this.tick, 1000);
    this.iAm.counting = true;
    this.my.time.start = this.getTime();
    return this.my.time.elapsed = 0;
  };

  ObservationPrintView.prototype.stopObservations = function(e) {
    var fromClick, isntPrematureStop;
    clearInterval(this.timerInterval);
    fromClick = e != null;
    isntPrematureStop = !(e != null);
    if (e != null) this.trigger("showNext");
    if (isntPrematureStop && !this.iHave.finished) {
      if (this.iAm.recording) {
        this.resetObservationFlags();
        this.saveCurrentSurvey();
      }
      this.my.observation.index++;
      this.renderSurvey();
    } else {
      this.$el.find(".stop_button_wrapper").addClass("confirmation");
      Utils.midAlert("Observations finished");
    }
    this.$el.find(".next_display").addClass("confirmation");
    this.iHave.finished = true;
    return this.iHave.runOnce = true;
  };

  ObservationPrintView.prototype.tick = function() {
    this.my.time.elapsed = this.getTime() - this.my.time.start;
    this.checkIfOver();
    this.updateObservationIndex();
    this.updateProgressDisplay();
    this.checkSurveyDisplay();
    this.checkObservationPace();
    return this.checkWarning();
  };

  ObservationPrintView.prototype.checkObservationPace = function() {
    if (this.iAm.recording && this.my.observation.completed < (this.my.observation.index - 1) && this.my.observation.index !== 0) {
      this.iHave.forcedProgression = true;
      this.resetObservationFlags();
      this.saveCurrentSurvey();
      return this.renderSurvey();
    }
  };

  ObservationPrintView.prototype.checkWarning = function() {
    var iShouldWarn, projectedIndex;
    projectedIndex = Math.floor((this.my.time.elapsed + this.warningSeconds) / this.model.get('intervalLength'));
    iShouldWarn = this.my.observation.index < projectedIndex && !this.iHave.finished;
    if (this.iAm.recording && this.iHavent.warned && iShouldWarn && this.my.observation.index !== 0) {
      Utils.midAlert("Observation ending soon");
      return this.iHavent.warned = false;
    }
  };

  ObservationPrintView.prototype.gridWasAutostopped = function() {
    return false;
  };

  ObservationPrintView.prototype.checkIfOver = function() {
    if (this.my.time.elapsed >= this.model.get("totalSeconds")) {
      return this.stopObservations();
    }
  };

  ObservationPrintView.prototype.checkSurveyDisplay = function() {
    if (this.my.observation.oldIndex !== this.my.observation.index && !this.iHave.finished && !this.iAm.recording) {
      this.renderSurvey();
      return this.my.observation.oldIndex = this.my.observation.index;
    }
  };

  ObservationPrintView.prototype.updateObservationIndex = function() {
    this.my.observation.index = Math.floor(this.my.time.elapsed / this.model.get('intervalLength'));
    if (this.my.observation.index > this.survey.models.length - 1) {
      return this.my.observation.index = this.survey.models.length - 1;
    }
  };

  ObservationPrintView.prototype.updateProgressDisplay = function() {
    var timeTillNext;
    this.$el.find(".current_observation").html(this.my.observation.index);
    this.$el.find(".completed_count").html(this.my.observation.completed);
    timeTillNext = Math.max(((this.my.observation.index + 1) * this.model.get('intervalLength')) - this.my.time.elapsed, 0);
    this.$el.find(".time_till_next").html(timeTillNext);
    if (!this.iAm.recording && !this.iHave.finished) {
      return this.$el.find(".next_display, .completed_display").removeClass("confirmation");
    }
  };

  ObservationPrintView.prototype.resetObservationFlags = function() {
    this.iAm.recording = false;
    return this.iHavent.warned = true;
  };

  ObservationPrintView.prototype.getTime = function() {
    return parseInt((new Date()).getTime() / 1000);
  };

  ObservationPrintView.prototype.completeObservation = function(option) {
    if (this.survey.view.isValid()) {
      this.saveCurrentSurvey();
      if (this.iHave.finished) this.trigger("showNext");
    } else {
      this.survey.view.showErrors();
    }
    return this.tick();
  };

  ObservationPrintView.prototype.saveCurrentSurvey = function() {
    this.resetObservationFlags();
    this.my.observation.completed++;
    this.survey.results.push({
      observationNumber: this.survey.view.index,
      data: this.survey.view.getResult(),
      saveTime: this.my.time.elapsed
    });
    this.survey.view.close();
    return this.$el.find(".done").remove();
  };

  ObservationPrintView.prototype.render = function() {
    var totalSeconds;
    this.trigger("hideNext");
    totalSeconds = this.model.get("totalSeconds");
    this.$el.html("      <div class='timer_wrapper'>        <div class='progress clearfix'>          <span class='completed_display confirmation'>Completed <div class='info_box completed_count'>" + this.my.observation.completed + "</div></span>          <span class='next_display confirmation'>Next observation <div class='info_box time_till_next'>" + (this.model.get('intervalLength')) + "</div></span>        </div>        <div>          <div class='start_button_wrapper'><button class='start_time command'>Start</button></div>          <div class='stop_button_wrapper confirmation'><button class='stop_time command'>Abort <i>all</i> observations</button></div>        </div>      </div>      <div id='current_survey'></div>    ");
    return this.trigger("rendered");
  };

  ObservationPrintView.prototype.renderSurvey = function(e) {
    var _this = this;
    if (!this.iAm.counting) return;
    this.iAm.recording = true;
    this.survey.view = new SurveyRunView({
      "model": this.survey.models[this.my.observation.index],
      "parent": this,
      "isObservation": true
    });
    this.survey.view.index = (function() {
      return _this.my.observation.index;
    })();
    this.survey.view.on("rendered subRendered", function() {
      return _this.trigger("subRendered");
    });
    this.survey.view.render();
    this.$el.find("#current_survey").html("<span class='observation_display confirmation'>Observation <div class='info_box current_observation'>" + this.my.observation.index + "</div></span>");
    this.$el.find("#current_survey").append(this.survey.view.el);
    this.$el.find("#current_survey").append("<button class='command done'>Done with <i>this</i> observation</button>");
    return this.$el.find("#current_survey").scrollTo(250, function() {
      if (_this.iHave.forcedProgression) {
        Utils.midAlert("Please continue with the next observation.");
        return _this.iHave.forcedProgression = false;
      } else if (_this.iHave.finished) {
        return Utils.midAlert("Please enter last observation");
      }
    });
  };

  ObservationPrintView.prototype.onClose = function() {
    var _ref;
    if ((_ref = this.survey.view) != null) _ref.close();
    return this.skippableView.close();
  };

  ObservationPrintView.prototype.getResult = function() {
    return {
      "surveys": this.survey.results,
      "variableName": this.model.get("variableName"),
      "totalTime": this.model.get("totalTime"),
      "intervalLength": this.model.get("intervalTime"),
      "completedObservations": this.my.observation.completed
    };
  };

  ObservationPrintView.prototype.getSum = function() {
    return {
      "total": this.my.observation.completed
    };
  };

  ObservationPrintView.prototype.getSkipped = function() {
    var i, skippedResults, viewResult, _ref;
    viewResult = this.skippableView.getSkipped();
    skippedResults = [];
    for (i = 1, _ref = this.survey.models.length - 1; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
      skippedResults.push({
        observationNumber: i,
        data: viewResult,
        saveTime: "skipped"
      });
    }
    return {
      "surveys": skippedResults,
      "variableName": "skipped",
      "totalTime": "skipped",
      "intervalLength": "skipped",
      "completedObservations": "skipped"
    };
  };

  ObservationPrintView.prototype.isValid = function() {
    return this.iHave.finished;
  };

  ObservationPrintView.prototype.showErrors = function() {
    return this.$el.find("messages").html(this.validator.getErrors().join(", "));
  };

  ObservationPrintView.prototype.updateNavigation = function() {
    return Tangerine.nav.setStudent(this.$el.find('#participant_id').val());
  };

  return ObservationPrintView;

})(Backbone.View);

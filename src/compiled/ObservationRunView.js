var ObservationRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ObservationRunView = (function(superClass) {
  extend(ObservationRunView, superClass);

  function ObservationRunView() {
    this.saveCurrentSurvey = bind(this.saveCurrentSurvey, this);
    this.updateObservationIndex = bind(this.updateObservationIndex, this);
    this.checkSurveyDisplay = bind(this.checkSurveyDisplay, this);
    this.checkIfOver = bind(this.checkIfOver, this);
    this.checkWarning = bind(this.checkWarning, this);
    this.checkObservationPace = bind(this.checkObservationPace, this);
    this.tick = bind(this.tick, this);
    return ObservationRunView.__super__.constructor.apply(this, arguments);
  }

  ObservationRunView.prototype.className = "ObservationRunView";

  ObservationRunView.prototype.events = {
    "click .start_time": "startObservations",
    "click .stop_time": "stopObservations",
    "click .done": "completeObservation"
  };

  ObservationRunView.FORCE = 1;

  ObservationRunView.prototype.initialize = function(options) {
    this.model = options.model;
    this.parent = options.parent;
    this.warningSeconds = 5;
    this.initializeFlags();
    return this.initializeSurvey();
  };

  ObservationRunView.prototype.initializeSurvey = function() {
    var attributes, i, models;
    if (this.survey != null) {
      this.onClose();
    }
    attributes = $.extend(this.model.get('surveyAttributes'), {
      "_id": this.model.id
    });
    models = (function() {
      var j, ref, results;
      results = [];
      for (i = j = 1, ref = parseInt(this.model.get('totalSeconds') / this.model.get('intervalLength')); 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        results.push(new Backbone.Model(attributes));
      }
      return results;
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

  ObservationRunView.prototype.initializeFlags = function() {
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

  ObservationRunView.prototype.startObservations = function() {
    if (this.iAm.counting || this.iHave.runOnce) {
      return;
    }
    this.$el.find(".stop_button_wrapper, .next_display, .completed_display").removeClass("confirmation");
    this.$el.find(".start_button_wrapper").addClass("confirmation");
    this.timerInterval = setInterval(this.tick, 1000);
    this.iAm.counting = true;
    this.my.time.start = this.getTime();
    return this.my.time.elapsed = 0;
  };

  ObservationRunView.prototype.stopObservations = function(e) {
    var fromClick, isntPrematureStop;
    clearInterval(this.timerInterval);
    fromClick = e != null;
    isntPrematureStop = e == null;
    if (e != null) {
      this.trigger("showNext");
    }
    if (isntPrematureStop && !this.iHave.finished) {
      if (this.iAm.recording) {
        this.resetObservationFlags();
        this.saveCurrentSurvey();
      }
      this.my.observation.index++;
      this.renderSurvey();
    } else {
      this.$el.find(".stop_button_wrapper").addClass("confirmation");
      Utils.midAlert(t("observations finished"));
    }
    this.$el.find(".next_display").addClass("confirmation");
    this.iHave.finished = true;
    return this.iHave.runOnce = true;
  };

  ObservationRunView.prototype.tick = function() {
    this.my.time.elapsed = this.getTime() - this.my.time.start;
    this.checkIfOver();
    this.updateObservationIndex();
    this.updateProgressDisplay();
    this.checkSurveyDisplay();
    this.checkObservationPace();
    return this.checkWarning();
  };

  ObservationRunView.prototype.checkObservationPace = function() {
    if (this.iAm.recording && this.my.observation.completed < (this.my.observation.index - 1) && this.my.observation.index !== 0) {
      this.iHave.forcedProgression = true;
      this.resetObservationFlags();
      this.saveCurrentSurvey();
      return this.renderSurvey();
    }
  };

  ObservationRunView.prototype.checkWarning = function() {
    var iShouldWarn, projectedIndex;
    projectedIndex = Math.floor((this.my.time.elapsed + this.warningSeconds) / this.model.get('intervalLength'));
    iShouldWarn = this.my.observation.index < projectedIndex && !this.iHave.finished;
    if (this.iAm.recording && this.iHavent.warned && iShouldWarn && this.my.observation.index !== 0) {
      Utils.midAlert(t("observation ending soon"));
      return this.iHavent.warned = false;
    }
  };

  ObservationRunView.prototype.gridWasAutostopped = function() {
    return false;
  };

  ObservationRunView.prototype.checkIfOver = function() {
    if (this.my.time.elapsed >= this.model.get("totalSeconds")) {
      return this.stopObservations();
    }
  };

  ObservationRunView.prototype.checkSurveyDisplay = function() {
    if (this.my.observation.oldIndex !== this.my.observation.index && !this.iHave.finished && !this.iAm.recording) {
      this.renderSurvey();
      return this.my.observation.oldIndex = this.my.observation.index;
    }
  };

  ObservationRunView.prototype.updateObservationIndex = function() {
    this.my.observation.index = Math.floor(this.my.time.elapsed / this.model.get('intervalLength'));
    if (this.my.observation.index > this.survey.models.length - 1) {
      return this.my.observation.index = this.survey.models.length - 1;
    }
  };

  ObservationRunView.prototype.updateProgressDisplay = function() {
    var timeTillNext;
    this.$el.find(".current_observation").html(this.my.observation.index);
    this.$el.find(".completed_count").html(this.my.observation.completed);
    timeTillNext = Math.max(((this.my.observation.index + 1) * this.model.get('intervalLength')) - this.my.time.elapsed, 0);
    this.$el.find(".time_till_next").html(timeTillNext);
    if (!this.iAm.recording && !this.iHave.finished) {
      return this.$el.find(".next_display, .completed_display").removeClass("confirmation");
    }
  };

  ObservationRunView.prototype.resetObservationFlags = function() {
    this.iAm.recording = false;
    return this.iHavent.warned = true;
  };

  ObservationRunView.prototype.getTime = function() {
    return parseInt((new Date()).getTime() / 1000);
  };

  ObservationRunView.prototype.completeObservation = function(option) {
    if (this.survey.view.isValid()) {
      this.saveCurrentSurvey();
      if (this.iHave.finished) {
        this.trigger("showNext");
      }
    } else {
      this.survey.view.showErrors();
    }
    return this.tick();
  };

  ObservationRunView.prototype.saveCurrentSurvey = function() {
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

  ObservationRunView.prototype.render = function() {
    var totalSeconds;
    this.trigger("hideNext");
    totalSeconds = this.model.get("totalSeconds");
    this.$el.html("<div class='timer_wrapper'> <div class='progress clearfix'> <span class='completed_display confirmation'>" + (t('completed')) + " <div class='info_box completed_count'>" + this.my.observation.completed + "</div></span> <span class='next_display confirmation'>" + (t('next observation')) + " <div class='info_box time_till_next'>" + (this.model.get('intervalLength')) + "</div></span> </div> <div> <div class='start_button_wrapper'><button class='start_time command'>" + (t('start')) + "</button></div> <div class='stop_button_wrapper confirmation'><button class='stop_time command'>" + (t('abort all observations')) + "</button></div> </div> </div> <div id='current_survey'></div>");
    this.trigger("rendered");
    return this.trigger("ready");
  };

  ObservationRunView.prototype.renderSurvey = function(e) {
    if (!this.iAm.counting) {
      return;
    }
    this.iAm.recording = true;
    this.survey.view = new SurveyRunView({
      "model": this.survey.models[this.my.observation.index],
      "parent": this,
      "isObservation": true
    });
    this.survey.view.index = (function(_this) {
      return function() {
        return _this.my.observation.index;
      };
    })(this)();
    this.survey.view.on("rendered subRendered", (function(_this) {
      return function() {
        return _this.trigger("subRendered");
      };
    })(this));
    this.survey.view.render();
    this.$el.find("#current_survey").html("<span class='observation_display confirmation'>" + (t('observation')) + " <div class='info_box current_observation'>" + this.my.observation.index + "</div></span>");
    this.$el.find("#current_survey").append(this.survey.view.el);
    this.$el.find("#current_survey").append("<button class='command done'>" + (t('done with this observation')) + "</button>");
    return this.$el.find("#current_survey").scrollTo(250, (function(_this) {
      return function() {
        if (_this.iHave.forcedProgression) {
          Utils.midAlert(t("please continue with the next observation"));
          return _this.iHave.forcedProgression = false;
        } else if (_this.iHave.finished) {
          return Utils.midAlert(t("please enter last observation"));
        }
      };
    })(this));
  };

  ObservationRunView.prototype.onClose = function() {
    var ref;
    if ((ref = this.survey.view) != null) {
      ref.close();
    }
    return this.skippableView.close();
  };

  ObservationRunView.prototype.getResult = function() {
    return {
      "surveys": this.survey.results,
      "variableName": this.model.get("variableName"),
      "totalTime": this.model.get("totalTime"),
      "intervalLength": this.model.get("intervalTime"),
      "completedObservations": this.my.observation.completed
    };
  };

  ObservationRunView.prototype.getSum = function() {
    return {
      "total": this.my.observation.completed
    };
  };

  ObservationRunView.prototype.getSkipped = function() {
    var i, j, ref, skippedResults, viewResult;
    viewResult = this.skippableView.getSkipped();
    skippedResults = [];
    for (i = j = 1, ref = this.survey.models.length - 1; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
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

  ObservationRunView.prototype.isValid = function() {
    return this.iHave.finished;
  };

  ObservationRunView.prototype.showErrors = function() {
    return this.$el.find("messages").html(this.validator.getErrors().join(", "));
  };

  ObservationRunView.prototype.updateNavigation = function() {
    return Tangerine.nav.setStudent(this.$el.find('#participant_id').val());
  };

  return ObservationRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL09ic2VydmF0aW9uUnVuVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxrQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Ozs7OytCQUVKLFNBQUEsR0FBVzs7K0JBRVgsTUFBQSxHQUNFO0lBQUEsbUJBQUEsRUFBc0IsbUJBQXRCO0lBQ0Esa0JBQUEsRUFBc0Isa0JBRHRCO0lBRUEsYUFBQSxFQUFnQixxQkFGaEI7OztFQUlGLGtCQUFDLENBQUEsS0FBRCxHQUFTOzsrQkFFVCxVQUFBLEdBQVksU0FBQyxPQUFEO0lBRVYsSUFBQyxDQUFBLEtBQUQsR0FBVSxPQUFPLENBQUM7SUFDbEIsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFPLENBQUM7SUFFbEIsSUFBQyxDQUFBLGNBQUQsR0FBa0I7SUFFbEIsSUFBQyxDQUFBLGVBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFBO0VBUlU7OytCQVdaLGdCQUFBLEdBQWtCLFNBQUE7QUFDaEIsUUFBQTtJQUFBLElBQWMsbUJBQWQ7TUFBQSxJQUFDLENBQUEsT0FBRCxDQUFBLEVBQUE7O0lBRUEsVUFBQSxHQUFhLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsa0JBQVgsQ0FBVCxFQUF5QztNQUFFLEtBQUEsRUFBUSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQWpCO0tBQXpDO0lBSWIsTUFBQTs7QUFBVTtXQUF1QyxzSkFBdkM7cUJBQUksSUFBQSxRQUFRLENBQUMsS0FBVCxDQUFlLFVBQWY7QUFBSjs7O0lBQ1YsTUFBTSxDQUFDLE9BQVAsQ0FBZSxFQUFmO0lBRUEsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxhQUFBLENBQ25CO01BQUEsT0FBQSxFQUFrQixNQUFPLENBQUEsQ0FBQSxDQUF6QjtNQUNBLFFBQUEsRUFBa0IsSUFEbEI7TUFFQSxlQUFBLEVBQWtCLElBRmxCO0tBRG1C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QUssQ0FBQztFQURBOzsrQkFHVCxVQUFBLEdBQVksU0FBQTtXQUNWLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFVBQVYsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVgsQ0FBQSxDQUFzQixDQUFDLElBQXZCLENBQTRCLElBQTVCLENBQTNCO0VBRFU7OytCQUdaLGdCQUFBLEdBQWtCLFNBQUE7V0FDaEIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFkLENBQXlCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBQTRCLENBQUMsR0FBN0IsQ0FBQSxDQUF6QjtFQURnQjs7OztHQTVRYSxRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9zdWJ0ZXN0L3Byb3RvdHlwZXMvT2JzZXJ2YXRpb25SdW5WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgT2JzZXJ2YXRpb25SdW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJPYnNlcnZhdGlvblJ1blZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICBcImNsaWNrIC5zdGFydF90aW1lXCIgOiBcInN0YXJ0T2JzZXJ2YXRpb25zXCJcbiAgICBcImNsaWNrIC5zdG9wX3RpbWVcIiAgOiBcInN0b3BPYnNlcnZhdGlvbnNcIlxuICAgIFwiY2xpY2sgLmRvbmVcIiA6IFwiY29tcGxldGVPYnNlcnZhdGlvblwiXG5cbiAgQEZPUkNFID0gMVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQG1vZGVsICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ID0gb3B0aW9ucy5wYXJlbnRcblxuICAgIEB3YXJuaW5nU2Vjb25kcyA9IDVcblxuICAgIEBpbml0aWFsaXplRmxhZ3MoKVxuICAgIEBpbml0aWFsaXplU3VydmV5KClcblxuXG4gIGluaXRpYWxpemVTdXJ2ZXk6IC0+XG4gICAgQG9uQ2xvc2UoKSBpZiBAc3VydmV5PyAjIGlmIHdlJ3JlIFJFaW5pdGlhbGl6aW5nIGNsb3NlIHRoZSBvbGQgdmlld3MgZmlyc3RcbiAgICBcbiAgICBhdHRyaWJ1dGVzID0gJC5leHRlbmQoQG1vZGVsLmdldCgnc3VydmV5QXR0cmlidXRlcycpLCB7IFwiX2lkXCIgOiBAbW9kZWwuaWQgfSlcblxuICAgICMgMS1pbmRleGVkIGFycmF5LCBjb252ZW5pZW50IGJlY2F1c2UgdGhlIDB0aCBvYnNlcnZhdGlvbiBkb2Vzbid0IHRha2UgcGxhY2UsIGJ1dCB0aGUgbnRoIGRvZXMuXG4gICAgIyBtYWtlcyBhbiBhcnJheSBvZiBpZGVudGljYWwgbW9kZWxzIGJhc2VkIG9uIHRoZSBhYm92ZSBhdHRyaWJ1dGVzXG4gICAgbW9kZWxzID0gKG5ldyBCYWNrYm9uZS5Nb2RlbCBhdHRyaWJ1dGVzIGZvciBpIGluIFsxLi5wYXJzZUludChAbW9kZWwuZ2V0KCd0b3RhbFNlY29uZHMnKS9AbW9kZWwuZ2V0KCdpbnRlcnZhbExlbmd0aCcpKV0pXG4gICAgbW9kZWxzLnVuc2hpZnQoXCJcIilcbiAgICBcbiAgICBAc2tpcHBhYmxlVmlldyA9IG5ldyBTdXJ2ZXlSdW5WaWV3XG4gICAgICBcIm1vZGVsXCIgICAgICAgICA6IG1vZGVsc1sxXVxuICAgICAgXCJwYXJlbnRcIiAgICAgICAgOiBAXG4gICAgICBcImlzT2JzZXJ2YXRpb25cIiA6IHRydWVcblxuICAgIFxuICAgIEBzdXJ2ZXkgPVxuICAgICAgXCJtb2RlbHNcIiAgICA6IG1vZGVsc1xuICAgICAgXCJyZXN1bHRzXCIgICA6IFtdXG5cbiAgaW5pdGlhbGl6ZUZsYWdzOiAtPlxuICAgIEBpQW0gPVxuICAgICAgXCJjb3VudGluZ1wiIDogZmFsc2VcbiAgICAgIFwicmVjb3JkaW5nXCIgOiBmYWxzZVxuICAgIEBpSGF2ZW50ID1cbiAgICAgIFwid2FybmVkXCIgOiB0cnVlXG4gICAgQGlIYXZlID1cbiAgICAgIFwicnVuT25jZVwiIDogZmFsc2VcbiAgICAgIFwiZmluaXNoZWRcIiA6IGZhbHNlXG4gICAgQG15ID1cbiAgICAgIFwidGltZVwiIDpcbiAgICAgICAgXCJzdGFydFwiICAgOiAwXG4gICAgICAgIFwiZWxhcHNlZFwiIDogMFxuICAgICAgXCJvYnNlcnZhdGlvblwiIDpcbiAgICAgICAgXCJpbmRleFwiICAgICA6IDBcbiAgICAgICAgXCJvbGRJbmRleFwiICA6IDBcbiAgICAgICAgXCJjb21wbGV0ZWRcIiA6IDBcbiAgICAgICAgXCJ0b3RhbFwiICAgICA6IHBhcnNlSW50KCBAbW9kZWwuZ2V0KCd0b3RhbFNlY29uZHMnKSAvIEBtb2RlbC5nZXQoJ2ludGVydmFsTGVuZ3RoJykgKVxuXG5cbiAgc3RhcnRPYnNlcnZhdGlvbnM6IC0+XG4gICAgIyBkb24ndCByZXNwb25kIGZvciB0aGVzZSByZWFzb25zXG4gICAgaWYgQGlBbS5jb3VudGluZyB8fCBAaUhhdmUucnVuT25jZSB0aGVuIHJldHVyblxuXG4gICAgQCRlbC5maW5kKFwiLnN0b3BfYnV0dG9uX3dyYXBwZXIsIC5uZXh0X2Rpc3BsYXksIC5jb21wbGV0ZWRfZGlzcGxheVwiKS5yZW1vdmVDbGFzcyhcImNvbmZpcm1hdGlvblwiKVxuICAgIEAkZWwuZmluZChcIi5zdGFydF9idXR0b25fd3JhcHBlclwiKS5hZGRDbGFzcyhcImNvbmZpcm1hdGlvblwiKVxuICAgIEB0aW1lckludGVydmFsICAgPSBzZXRJbnRlcnZhbCBAdGljaywgMTAwMFxuICAgIEBpQW0uY291bnRpbmcgICAgPSB0cnVlXG4gICAgQG15LnRpbWUuc3RhcnQgICA9IEBnZXRUaW1lKClcbiAgICBAbXkudGltZS5lbGFwc2VkID0gMFxuXG4gIHN0b3BPYnNlcnZhdGlvbnM6IChlKSAtPlxuICAgIGNsZWFySW50ZXJ2YWwgQHRpbWVySW50ZXJ2YWxcbiAgICBmcm9tQ2xpY2sgPSBlP1xuICAgIGlzbnRQcmVtYXR1cmVTdG9wID0gISBlP1xuICAgIGlmIGU/IFxuICAgICAgQHRyaWdnZXIgXCJzaG93TmV4dFwiXG5cbiAgICBpZiBpc250UHJlbWF0dXJlU3RvcCAmJiBub3QgQGlIYXZlLmZpbmlzaGVkXG4gICAgICBpZiBAaUFtLnJlY29yZGluZ1xuICAgICAgICBAcmVzZXRPYnNlcnZhdGlvbkZsYWdzKClcbiAgICAgICAgQHNhdmVDdXJyZW50U3VydmV5KClcbiAgICAgIEBteS5vYnNlcnZhdGlvbi5pbmRleCsrXG4gICAgICBAcmVuZGVyU3VydmV5KClcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIuc3RvcF9idXR0b25fd3JhcHBlclwiKS5hZGRDbGFzcyhcImNvbmZpcm1hdGlvblwiKVxuICAgICAgVXRpbHMubWlkQWxlcnQgdChcIm9ic2VydmF0aW9ucyBmaW5pc2hlZFwiKVxuICAgIEAkZWwuZmluZChcIi5uZXh0X2Rpc3BsYXlcIikuYWRkQ2xhc3MoXCJjb25maXJtYXRpb25cIilcbiAgICBAaUhhdmUuZmluaXNoZWQgPSB0cnVlXG4gICAgQGlIYXZlLnJ1bk9uY2UgPSB0cnVlXG4gICAgXG5cbiAgIyBydW5zIGV2ZXJ5IHNlY29uZCB0aGUgdGltZXIgaXMgcnVubmluZ1xuICB0aWNrOiA9PlxuICAgIEBteS50aW1lLmVsYXBzZWQgPSBAZ2V0VGltZSgpIC0gQG15LnRpbWUuc3RhcnRcbiAgICBAY2hlY2tJZk92ZXIoKVxuICAgIEB1cGRhdGVPYnNlcnZhdGlvbkluZGV4KClcbiAgICBAdXBkYXRlUHJvZ3Jlc3NEaXNwbGF5KClcbiAgICBAY2hlY2tTdXJ2ZXlEaXNwbGF5KClcbiAgICBAY2hlY2tPYnNlcnZhdGlvblBhY2UoKVxuICAgIEBjaGVja1dhcm5pbmcoKVxuXG4gIGNoZWNrT2JzZXJ2YXRpb25QYWNlOiA9PlxuICAgICMgaWYgd2UncmUgc3RpbGwgZW50ZXJpbmcgb2JzZXJ2YXRpb25zIGFuZCBpdCdzIHRpbWUgZm9yIHRoZSBuZXh0IG9uZVxuICAgIGlmIEBpQW0ucmVjb3JkaW5nICYmIEBteS5vYnNlcnZhdGlvbi5jb21wbGV0ZWQgPCAoQG15Lm9ic2VydmF0aW9uLmluZGV4LTEpICYmIEBteS5vYnNlcnZhdGlvbi5pbmRleCAhPSAwICMgc3RhcnRzIGF0IDAsIHRoZW4gZ29lcyB0byAxXG4gICAgICBAaUhhdmUuZm9yY2VkUHJvZ3Jlc3Npb24gPSB0cnVlXG4gICAgICBAcmVzZXRPYnNlcnZhdGlvbkZsYWdzKClcbiAgICAgIEBzYXZlQ3VycmVudFN1cnZleSgpXG4gICAgICBAcmVuZGVyU3VydmV5KClcblxuICBjaGVja1dhcm5pbmc6ID0+XG4gICAgcHJvamVjdGVkSW5kZXggPSBNYXRoLmZsb29yKCAoQG15LnRpbWUuZWxhcHNlZCArIEB3YXJuaW5nU2Vjb25kcykgLyBAbW9kZWwuZ2V0KCdpbnRlcnZhbExlbmd0aCcpIClcbiAgICBpU2hvdWxkV2FybiA9IEBteS5vYnNlcnZhdGlvbi5pbmRleCA8IHByb2plY3RlZEluZGV4ICYmICEgQGlIYXZlLmZpbmlzaGVkXG4gICAgIyBpZiB3ZSdyZSBzdGlsbCBlbnRlcmluZyBvYnNlcnZhdGlvbnMsIHdhcm4gdGhlIHVzZXJcbiAgICBpZiBAaUFtLnJlY29yZGluZyAmJiBAaUhhdmVudC53YXJuZWQgJiYgaVNob3VsZFdhcm4gJiYgQG15Lm9ic2VydmF0aW9uLmluZGV4ICE9IDAgIyBmaXJzdCBvbmUgZG9lc24ndCBjb3VudFxuICAgICAgVXRpbHMubWlkQWxlcnQgdChcIm9ic2VydmF0aW9uIGVuZGluZyBzb29uXCIpXG4gICAgICBAaUhhdmVudC53YXJuZWQgPSBmYWxzZVxuICBcbiAgZ3JpZFdhc0F1dG9zdG9wcGVkOiAtPlxuICAgIHJldHVybiBmYWxzZVxuXG4gIGNoZWNrSWZPdmVyOiA9PlxuICAgIGlmIEBteS50aW1lLmVsYXBzZWQgPj0gQG1vZGVsLmdldChcInRvdGFsU2Vjb25kc1wiKVxuICAgICAgQHN0b3BPYnNlcnZhdGlvbnMoKVxuXG4gIGNoZWNrU3VydmV5RGlzcGxheTogPT5cbiAgICAjIGNoYW5nZSwgbmVlZHMgdG8gZGlzcGxheSBuZXcgc3VydmV5XG4gICAgaWYgQG15Lm9ic2VydmF0aW9uLm9sZEluZGV4ICE9IEBteS5vYnNlcnZhdGlvbi5pbmRleCAmJiAhQGlIYXZlLmZpbmlzaGVkICYmICFAaUFtLnJlY29yZGluZ1xuICAgICAgQHJlbmRlclN1cnZleSgpXG4gICAgICBAbXkub2JzZXJ2YXRpb24ub2xkSW5kZXggPSBAbXkub2JzZXJ2YXRpb24uaW5kZXhcblxuICB1cGRhdGVPYnNlcnZhdGlvbkluZGV4OiA9PlxuICAgIEBteS5vYnNlcnZhdGlvbi5pbmRleCA9IE1hdGguZmxvb3IoICggQG15LnRpbWUuZWxhcHNlZCApIC8gQG1vZGVsLmdldCgnaW50ZXJ2YWxMZW5ndGgnKSApXG4gICAgaWYgQG15Lm9ic2VydmF0aW9uLmluZGV4ID4gQHN1cnZleS5tb2RlbHMubGVuZ3RoIC0gMVxuICAgICAgQG15Lm9ic2VydmF0aW9uLmluZGV4ID0gQHN1cnZleS5tb2RlbHMubGVuZ3RoIC0gMVxuXG4gIHVwZGF0ZVByb2dyZXNzRGlzcGxheTogLT5cbiAgICAjIGJhY2tib25lLmpzLCB5IHUgbm8gaGF2ZSBkYXRhIGJpbmRpbmdzPyBhYnN0cmFjdCBtb3JlXG4gICAgQCRlbC5maW5kKFwiLmN1cnJlbnRfb2JzZXJ2YXRpb25cIikuaHRtbCBAbXkub2JzZXJ2YXRpb24uaW5kZXhcbiAgICBAJGVsLmZpbmQoXCIuY29tcGxldGVkX2NvdW50XCIpLmh0bWwgICAgIEBteS5vYnNlcnZhdGlvbi5jb21wbGV0ZWRcblxuICAgIHRpbWVUaWxsTmV4dCA9IE1hdGgubWF4KCgoQG15Lm9ic2VydmF0aW9uLmluZGV4ICsgMSkgKiBAbW9kZWwuZ2V0KCdpbnRlcnZhbExlbmd0aCcpKSAtIEBteS50aW1lLmVsYXBzZWQsIDApXG4gICAgQCRlbC5maW5kKFwiLnRpbWVfdGlsbF9uZXh0XCIpLmh0bWwgdGltZVRpbGxOZXh0XG5cbiAgICBpZiBub3QgQGlBbS5yZWNvcmRpbmcgJiYgbm90IEBpSGF2ZS5maW5pc2hlZFxuICAgICAgQCRlbC5maW5kKFwiLm5leHRfZGlzcGxheSwgLmNvbXBsZXRlZF9kaXNwbGF5XCIpLnJlbW92ZUNsYXNzIFwiY29uZmlybWF0aW9uXCIgXG5cbiAgcmVzZXRPYnNlcnZhdGlvbkZsYWdzOiAtPlxuICAgIEBpQW0ucmVjb3JkaW5nICA9IGZhbHNlXG4gICAgQGlIYXZlbnQud2FybmVkID0gdHJ1ZVxuXG4gIGdldFRpbWU6IC0+IHBhcnNlSW50KCAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCkgLyAxMDAwIClcblxuICBjb21wbGV0ZU9ic2VydmF0aW9uOiAob3B0aW9uKSAtPlxuXG4gICAgaWYgQHN1cnZleS52aWV3LmlzVmFsaWQoKVxuICAgICAgQHNhdmVDdXJyZW50U3VydmV5KClcbiAgICAgIEB0cmlnZ2VyIFwic2hvd05leHRcIiBpZiBAaUhhdmUuZmluaXNoZWRcbiAgICBlbHNlXG4gICAgICBAc3VydmV5LnZpZXcuc2hvd0Vycm9ycygpXG5cbiAgICBAdGljaygpICMgdXBkYXRlIGRpc3BsYXlzXG5cblxuXG5cbiAgc2F2ZUN1cnJlbnRTdXJ2ZXk6ID0+XG4gICAgQHJlc2V0T2JzZXJ2YXRpb25GbGFncygpXG4gICAgQG15Lm9ic2VydmF0aW9uLmNvbXBsZXRlZCsrXG4gICAgQHN1cnZleS5yZXN1bHRzLnB1c2hcbiAgICAgIG9ic2VydmF0aW9uTnVtYmVyIDogQHN1cnZleS52aWV3LmluZGV4ICMgdmlldydzIGluZGV4XG4gICAgICBkYXRhICAgICAgICAgICAgICA6IEBzdXJ2ZXkudmlldy5nZXRSZXN1bHQoKVxuICAgICAgc2F2ZVRpbWUgICAgICAgICAgOiBAbXkudGltZS5lbGFwc2VkXG4gICAgQHN1cnZleS52aWV3LmNsb3NlKClcbiAgICBAJGVsLmZpbmQoXCIuZG9uZVwiKS5yZW1vdmUoKVxuXG5cbiAgcmVuZGVyOiAtPlxuICAgIEB0cmlnZ2VyIFwiaGlkZU5leHRcIlxuICAgIHRvdGFsU2Vjb25kcyA9IEBtb2RlbC5nZXQoXCJ0b3RhbFNlY29uZHNcIilcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGRpdiBjbGFzcz0ndGltZXJfd3JhcHBlcic+XG4gICAgICAgIDxkaXYgY2xhc3M9J3Byb2dyZXNzIGNsZWFyZml4Jz5cbiAgICAgICAgICA8c3BhbiBjbGFzcz0nY29tcGxldGVkX2Rpc3BsYXkgY29uZmlybWF0aW9uJz4je3QoJ2NvbXBsZXRlZCcpfSA8ZGl2IGNsYXNzPSdpbmZvX2JveCBjb21wbGV0ZWRfY291bnQnPiN7QG15Lm9ic2VydmF0aW9uLmNvbXBsZXRlZH08L2Rpdj48L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9J25leHRfZGlzcGxheSBjb25maXJtYXRpb24nPiN7dCgnbmV4dCBvYnNlcnZhdGlvbicpfSA8ZGl2IGNsYXNzPSdpbmZvX2JveCB0aW1lX3RpbGxfbmV4dCc+I3tAbW9kZWwuZ2V0KCdpbnRlcnZhbExlbmd0aCcpfTwvZGl2Pjwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nc3RhcnRfYnV0dG9uX3dyYXBwZXInPjxidXR0b24gY2xhc3M9J3N0YXJ0X3RpbWUgY29tbWFuZCc+I3t0KCdzdGFydCcpfTwvYnV0dG9uPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9J3N0b3BfYnV0dG9uX3dyYXBwZXIgY29uZmlybWF0aW9uJz48YnV0dG9uIGNsYXNzPSdzdG9wX3RpbWUgY29tbWFuZCc+I3t0KCdhYm9ydCBhbGwgb2JzZXJ2YXRpb25zJyl9PC9idXR0b24+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGlkPSdjdXJyZW50X3N1cnZleSc+PC9kaXY+XG4gICAgXCJcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuXG4gIHJlbmRlclN1cnZleTogKGUpIC0+XG4gICAgaWYgbm90IEBpQW0uY291bnRpbmcgdGhlbiByZXR1cm5cbiAgICBAaUFtLnJlY29yZGluZyA9IHRydWVcbiAgICBcbiAgICBAc3VydmV5LnZpZXcgID0gbmV3IFN1cnZleVJ1blZpZXdcbiAgICAgIFwibW9kZWxcIiAgICAgICAgIDogQHN1cnZleS5tb2RlbHNbQG15Lm9ic2VydmF0aW9uLmluZGV4XVxuICAgICAgXCJwYXJlbnRcIiAgICAgICAgOiBAXG4gICAgICBcImlzT2JzZXJ2YXRpb25cIiA6IHRydWVcbiAgICBAc3VydmV5LnZpZXcuaW5kZXggPSBkbyA9PiBAbXkub2JzZXJ2YXRpb24uaW5kZXggIyBhZGQgYW4gaW5kZXggZm9yIHJlZmVyZW5jZVxuXG4gICAgIyBsaXN0ZW4gZm9yIHJlbmRlciBldmVudHMsIHBhc3MgdGhlbSB1cFxuICAgIEBzdXJ2ZXkudmlldy5vbiBcInJlbmRlcmVkIHN1YlJlbmRlcmVkXCIsID0+IEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4gICAgQHN1cnZleS52aWV3LnJlbmRlcigpXG5cbiAgICBAJGVsLmZpbmQoXCIjY3VycmVudF9zdXJ2ZXlcIikuaHRtbChcIjxzcGFuIGNsYXNzPSdvYnNlcnZhdGlvbl9kaXNwbGF5IGNvbmZpcm1hdGlvbic+I3t0KCdvYnNlcnZhdGlvbicpfSA8ZGl2IGNsYXNzPSdpbmZvX2JveCBjdXJyZW50X29ic2VydmF0aW9uJz4je0BteS5vYnNlcnZhdGlvbi5pbmRleH08L2Rpdj48L3NwYW4+XCIpXG4gICAgQCRlbC5maW5kKFwiI2N1cnJlbnRfc3VydmV5XCIpLmFwcGVuZCBAc3VydmV5LnZpZXcuZWxcbiAgICBAJGVsLmZpbmQoXCIjY3VycmVudF9zdXJ2ZXlcIikuYXBwZW5kIFwiPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBkb25lJz4je3QoJ2RvbmUgd2l0aCB0aGlzIG9ic2VydmF0aW9uJyl9PC9idXR0b24+XCJcbiAgICBcbiAgICBAJGVsLmZpbmQoXCIjY3VycmVudF9zdXJ2ZXlcIikuc2Nyb2xsVG8gMjUwLCA9PiBcbiAgICAgIGlmIEBpSGF2ZS5mb3JjZWRQcm9ncmVzc2lvblxuICAgICAgICBVdGlscy5taWRBbGVydCB0KFwicGxlYXNlIGNvbnRpbnVlIHdpdGggdGhlIG5leHQgb2JzZXJ2YXRpb25cIilcbiAgICAgICAgQGlIYXZlLmZvcmNlZFByb2dyZXNzaW9uID0gZmFsc2VcbiAgICAgIGVsc2UgaWYgQGlIYXZlLmZpbmlzaGVkXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IHQoXCJwbGVhc2UgZW50ZXIgbGFzdCBvYnNlcnZhdGlvblwiKVxuXG5cbiAgb25DbG9zZTogLT5cbiAgICBAc3VydmV5LnZpZXc/LmNsb3NlKClcbiAgICBAc2tpcHBhYmxlVmlldy5jbG9zZSgpXG5cbiAgZ2V0UmVzdWx0OiAtPlxuICAgIHtcbiAgICAgIFwic3VydmV5c1wiICAgICAgICAgICAgICAgOiBAc3VydmV5LnJlc3VsdHNcbiAgICAgIFwidmFyaWFibGVOYW1lXCIgICAgICAgICAgOiBAbW9kZWwuZ2V0KFwidmFyaWFibGVOYW1lXCIpXG4gICAgICBcInRvdGFsVGltZVwiICAgICAgICAgICAgIDogQG1vZGVsLmdldChcInRvdGFsVGltZVwiKVxuICAgICAgXCJpbnRlcnZhbExlbmd0aFwiICAgICAgICA6IEBtb2RlbC5nZXQoXCJpbnRlcnZhbFRpbWVcIilcbiAgICAgIFwiY29tcGxldGVkT2JzZXJ2YXRpb25zXCIgOiBAbXkub2JzZXJ2YXRpb24uY29tcGxldGVkXG4gICAgfVxuXG4gIGdldFN1bTogLT5cbiAgICB7XG4gICAgICBcInRvdGFsXCIgOiBAbXkub2JzZXJ2YXRpb24uY29tcGxldGVkIFxuICAgIH1cblxuICBnZXRTa2lwcGVkOiAtPlxuICAgIHZpZXdSZXN1bHQgPSBAc2tpcHBhYmxlVmlldy5nZXRTa2lwcGVkKClcbiAgICBza2lwcGVkUmVzdWx0cyA9IFtdXG4gICAgZm9yIGkgaW4gWzEuLihAc3VydmV5Lm1vZGVscy5sZW5ndGgtMSldXG4gICAgICBza2lwcGVkUmVzdWx0cy5wdXNoXG4gICAgICAgIG9ic2VydmF0aW9uTnVtYmVyIDogaSAjIHZpZXcncyBpbmRleFxuICAgICAgICBkYXRhICAgICAgICAgICAgICA6IHZpZXdSZXN1bHRcbiAgICAgICAgc2F2ZVRpbWUgICAgICAgICAgOiBcInNraXBwZWRcIlxuXG4gICAgcmV0dXJuIHtcbiAgICAgIFwic3VydmV5c1wiICAgICAgICAgICAgICAgOiBza2lwcGVkUmVzdWx0c1xuICAgICAgXCJ2YXJpYWJsZU5hbWVcIiAgICAgICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcInRvdGFsVGltZVwiICAgICAgICAgICAgIDogXCJza2lwcGVkXCJcbiAgICAgIFwiaW50ZXJ2YWxMZW5ndGhcIiAgICAgICAgOiBcInNraXBwZWRcIlxuICAgICAgXCJjb21wbGV0ZWRPYnNlcnZhdGlvbnNcIiA6IFwic2tpcHBlZFwiXG4gICAgfVxuXG4gIGlzVmFsaWQ6IC0+XG4gICAgQGlIYXZlLmZpbmlzaGVkXG5cbiAgc2hvd0Vycm9yczogLT5cbiAgICBAJGVsLmZpbmQoXCJtZXNzYWdlc1wiKS5odG1sIEB2YWxpZGF0b3IuZ2V0RXJyb3JzKCkuam9pbihcIiwgXCIpXG5cbiAgdXBkYXRlTmF2aWdhdGlvbjogLT5cbiAgICBUYW5nZXJpbmUubmF2LnNldFN0dWRlbnQgQCRlbC5maW5kKCcjcGFydGljaXBhbnRfaWQnKS52YWwoKSJdfQ==

var ObservationRunView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ObservationRunView = (function(_super) {

  __extends(ObservationRunView, _super);

  function ObservationRunView() {
    ObservationRunView.__super__.constructor.apply(this, arguments);
  }

  ObservationRunView.prototype.events = {
    "click .start_time": "startObservations",
    "click .stop_time": "stopObservations"
  };

  ObservationRunView.prototype.initialize = function(options) {
    this.model = this.options.model;
    this.parent = this.options.parent;
    this.initializeFlags();
    return this.initializeSurvey();
  };

  ObservationRunView.prototype.initializeSurvey = function() {
    var attributes, i, model, models, view, views, _len,
      _this = this;
    if (this.survey != null) this.onClose();
    attributes = $.extend(this.model.get('surveyAttributes'), {
      "_id": this.model.id
    });
    models = (function() {
      var _ref, _results;
      _results = [];
      for (i = 0, _ref = parseInt(this.model.get('totalSeconds') / this.model.get('intervalLength')); 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        _results.push(new Backbone.Model(attributes));
      }
      return _results;
    }).call(this);
    views = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = models.length; _i < _len; _i++) {
        model = models[_i];
        _results.push(new SurveyRunView({
          "model": model,
          "parent": this
        }));
      }
      return _results;
    }).call(this);
    for (i = 0, _len = views.length; i < _len; i++) {
      view = views[i];
      view.index = i;
      view.on("rendered", function() {
        return _this.trigger("rendered");
      });
    }
    return this.survey = {
      "models": models,
      "views": views,
      "results": []
    };
  };

  ObservationRunView.prototype.initializeFlags = function() {
    this.iAm = {
      "counting": false
    };
    return this.my = {
      "time": {
        "start": 0,
        "elapsed": 0
      },
      "observation": {
        "index": 0,
        "completed": 0
      }
    };
  };

  ObservationRunView.prototype.startObservations = function() {
    this.timerInterval = setInterval(this.tick, 1000);
    this.iAm.counting = true;
    this.my.time.start = this.getTime();
    return this.my.time.elapsed = 0;
  };

  ObservationRunView.prototype.stopObservations = function() {
    return clearInterval(this.timerInterval);
  };

  ObservationRunView.prototype.tick = function() {
    this.my.time.elapsed = this.getTime() - this.my.time.start;
    this.updateTimeDisplay();
    return this.updateObservationIndex();
  };

  ObservationRunView.prototype.updateObservationIndex = function() {
    return this.my.observation.index = Math.floor(this.my.time.elapsed / this.model.get('intervalLength'));
  };

  ObservationRunView.prototype.updateTimeDisplay = function() {
    return this.$el.find(".timer").html(this.my.time.elapsed);
  };

  ObservationRunView.prototype.getTime = function() {
    return (new Date()).getSeconds;
  };

  ObservationRunView.prototype.completeObservation = function() {
    var current;
    current = this.survey.views[this.my.observation.index];
    if (current.isValid()) {
      this.survey.result.push({
        observationNumber: current.index,
        data: current.getResult()
      });
      current.close();
      this.render();
      return window.scrollTo(0, 0);
    } else {
      return current.showErrors();
    }
  };

  ObservationRunView.prototype.render = function() {
    var startTimerHTML, stopTimerHTML, totalSeconds;
    totalSeconds = this.model.get("totalSeconds");
    startTimerHTML = "<div class='timer_wrapper'><button class='start_time time'>Start</button><div class='timer'>" + totalSeconds + "</div></div>";
    stopTimerHTML = "<div class='timer_wrapper'><button class='stop_time time'>Stop</button><div class='timer'>" + totalSeconds + "</div></div>";
    this.$el.html("      " + startTimerHTML + "      <div id='current_survey'></div>      " + stopTimerHTML + "    ");
    this.renderSurvey();
    return this.trigger("rendered");
  };

  ObservationRunView.prototype.renderSurvey = function() {
    var current;
    current = this.survey.views[this.my.observation.index];
    current.render();
    return this.$el.find("#current_survey").append(current.el);
  };

  ObservationRunView.prototype.onClose = function() {
    var surveyView, _i, _len, _ref, _results;
    _ref = this.survey.views;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      surveyView = _ref[_i];
      _results.push(surveyView.close());
    }
    return _results;
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
    return {};
  };

  ObservationRunView.prototype.isValid = function() {
    return true;
  };

  ObservationRunView.prototype.showErrors = function() {
    return this.$el.find("messages").html(this.validator.getErrors().join(", "));
  };

  ObservationRunView.prototype.updateNavigation = function() {
    return Tangerine.nav.setStudent(this.$el.find('#participant_id').val());
  };

  return ObservationRunView;

})(Backbone.View);

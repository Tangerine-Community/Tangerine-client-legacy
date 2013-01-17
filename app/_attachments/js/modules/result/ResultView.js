var ResultView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ResultView = (function(_super) {

  __extends(ResultView, _super);

  function ResultView() {
    ResultView.__super__.constructor.apply(this, arguments);
  }

  ResultView.prototype.className = "result_view";

  ResultView.prototype.events = {
    'click .save': 'save',
    'click .another': 'another'
  };

  ResultView.prototype.another = function() {
    return Tangerine.router.navigate("restart/" + this.assessment.id, true);
  };

  ResultView.prototype.save = function() {
    var $button;
    this.model.add({
      name: "Assessment complete",
      prototype: "complete",
      data: {
        "comment": this.$el.find('#additional_comments').val() || "",
        "end_time": (new Date()).getTime(),
        "gps": this.gpsData
      },
      subtestId: "result",
      sum: {
        correct: 1,
        incorrect: 0,
        missing: 0,
        total: 1
      }
    });
    if (this.model.save()) {
      Tangerine.activity = "";
      Utils.midAlert("Result saved");
      this.$el.find('.save_status').html("saved");
      this.$el.find('.save_status').removeClass('not_saved');
      this.$el.find('.question').fadeOut(250);
      $button = this.$el.find("button.save");
      return $button.removeClass('save').addClass('another').html("Perform another assessment");
    } else {
      Utils.midAlert("Save error");
      return this.$el.find('.save_status').html("Results may not have saved");
    }
  };

  ResultView.prototype.initialize = function(options) {
    var _this = this;
    this.gpsData = {};
    try {
      navigator.geolocation.getCurrentPosition(function(geo) {
        return _this.gpsData = geo.coords;
      }, function() {
        return _this.gpsData[error] = arguments;
      }, {
        "enableHighAccuracy": true
      });
    } catch (error) {
      this.gpsData = {
        "error": error
      };
    }
    this.model = options.model;
    this.assessment = options.assessment;
    this.saved = false;
    return this.resultSumView = new ResultSumView({
      model: this.model,
      finishCheck: false
    });
  };

  ResultView.prototype.render = function() {
    this.$el.html("      <h2>Assessment complete</h2>      <button class='save command'>Save result</button>      <div class='info_box save_status not_saved'>Not saved yet</div>      <br>      <div class='question'>        <div class='prompt'>Additional comments (optional)</div>        <textarea id='additional_comments' class='full_width'></textarea>      </div>      <div class='label_value'>        <h2>Subtests completed</h2>        <div id='result_sum' class='info_box'></div>      </div>    ");
    this.resultSumView.setElement(this.$el.find("#result_sum"));
    this.resultSumView.render();
    return this.trigger("rendered");
  };

  ResultView.prototype.onClose = function() {
    return this.resultSumView.close();
  };

  return ResultView;

})(Backbone.View);

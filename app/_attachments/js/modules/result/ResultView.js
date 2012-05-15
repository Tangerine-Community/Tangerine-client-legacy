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
    return window.location.reload();
  };

  ResultView.prototype.save = function() {
    if (this.$el.find('#additional_comments').val() !== "") {
      this.model.add({
        name: "Assessment complete",
        data: {
          "comment": this.$el.find('#additional_comments').val()
        },
        subtestId: "result",
        sum: {
          correct: 1,
          incorrect: 0,
          missing: 0,
          total: 1
        }
      });
    }
    if (this.model.save()) {
      Utils.midAlert("Result saved");
      this.$el.find('.save_status').html("saved");
      this.$el.find('.save_status').removeClass('not_saved');
      this.$el.find('button.save').fadeOut(250);
      return this.$el.find('.confirmation').removeClass('confirmation');
    } else {
      Utils.midAlert("Save error");
      return this.$el.find('.save_status').html("Results may not have saved");
    }
  };

  ResultView.prototype.initialize = function(options) {
    this.model = options.model;
    this.assessment = options.assessment;
    this.saved = false;
    return this.resultSumView = new ResultSumView({
      model: this.model
    });
  };

  ResultView.prototype.render = function() {
    console.log(this);
    this.$el.append("<h2>Assessment complete</h2>    <div class='label_value'>      <label>Result</label>      <div class='info_box save_status not_saved'>Not saved yet</div>        <h2>Subtests completed</h2>    ");
    this.resultSumView.render();
    this.$el.append(this.resultSumView.el);
    this.$el.append("      <div class='question'>      <div class='prompt'>Additional comments (optional)</div>      <textarea id='additional_comments full_width'></textarea>      </div>      <button class='save'>Save result</button><br>      <button class='another confirmation'>Perform another assessment</button>    ");
    return this.trigger("rendered");
  };

  ResultView.prototype.onClose = function() {
    return this.resultSumView.close();
  };

  return ResultView;

})(Backbone.View);

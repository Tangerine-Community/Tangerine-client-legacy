var WeekByStudentMenuView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

WeekByStudentMenuView = (function(_super) {

  __extends(WeekByStudentMenuView, _super);

  function WeekByStudentMenuView() {
    WeekByStudentMenuView.__super__.constructor.apply(this, arguments);
  }

  WeekByStudentMenuView.prototype.events = {
    'change .week_selector': 'gotoWeekByStudentReport'
  };

  WeekByStudentMenuView.prototype.gotoWeekByStudentReport = function(event) {
    return Tangerine.router.navigate("report/weekByStudent/" + this.$el.find(event.target).find(":selected").attr("data-subtestId"), true);
  };

  WeekByStudentMenuView.prototype.initialize = function(options) {
    var allSubtests, milisecondsPerWeek,
      _this = this;
    this.parent = options.parent;
    this.klass = this.parent.options.klass;
    this.curricula = this.parent.options.curricula;
    milisecondsPerWeek = 604800000;
    this.currentWeek = Math.round(((new Date()).getTime() - this.klass.get("startDate")) / milisecondsPerWeek);
    allSubtests = new Subtests;
    return allSubtests.fetch({
      success: function(collection) {
        var subtest, subtests, _i, _len;
        subtests = collection.where({
          curriculaId: _this.curricula.id
        });
        _this.weeks = [];
        for (_i = 0, _len = subtests.length; _i < _len; _i++) {
          subtest = subtests[_i];
          _this.weeks[subtest.get('week')] = subtest.id;
        }
        _this.ready = true;
        return _this.render();
      }
    });
  };

  WeekByStudentMenuView.prototype.render = function() {
    var flagForCurrent, html, subtestId, week, _len, _ref;
    if (this.ready) {
      html = "        <select class='week_selector'>          <option disabled='disabled' selected='selected'>Select a week</option>          ";
      _ref = this.weeks;
      for (week = 0, _len = _ref.length; week < _len; week++) {
        subtestId = _ref[week];
        if (subtestId != null) {
          flagForCurrent = this.currentWeek === week ? "**" : '';
          html += "<option data-subtestId='" + subtestId + "'>" + week + flagForCurrent + "</option>";
        }
      }
      html += "</select>";
      return this.$el.html(html);
    } else {
      return this.$el.html("<img src='images/loading.gif' class='loading'>");
    }
  };

  return WeekByStudentMenuView;

})(Backbone.View);

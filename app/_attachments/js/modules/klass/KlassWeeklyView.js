var KlassWeeklyView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassWeeklyView = (function(_super) {

  __extends(KlassWeeklyView, _super);

  function KlassWeeklyView() {
    KlassWeeklyView.__super__.constructor.apply(this, arguments);
  }

  KlassWeeklyView.prototype.events = {
    "click .student_subtest": 'gotoStudentSubtest',
    "click .next_week": "nextWeek",
    "click .prev_week": "prevWeek",
    "click .subtest": "subtest"
  };

  KlassWeeklyView.prototype.subtest = function(event) {
    var id;
    id = $(event.target).attr("data-id");
    return Tangerine.router.navigate("report/" + id, true);
  };

  KlassWeeklyView.prototype.gotoStudentSubtest = function(event) {
    var studentId, subtestId;
    studentId = $(event.target).attr("data-studentId");
    subtestId = $(event.target).attr("data-subtestId");
    return Tangerine.router.navigate("class/result/student/subtest/" + studentId + "/" + subtestId, true);
  };

  KlassWeeklyView.prototype.nextWeek = function() {
    this.currentWeek++;
    return this.render();
  };

  KlassWeeklyView.prototype.prevWeek = function() {
    this.currentWeek--;
    return this.render();
  };

  KlassWeeklyView.prototype.initialize = function(options) {
    var byWeek, week;
    this.currentWeek = options.week || 1;
    this.subtestsByWeek = [];
    week = 1;
    while ((byWeek = options.subtests.where({
        "week": week
      })).length !== 0) {
      this.subtestsByWeek[week] = byWeek;
      week++;
    }
    return this.totalWeeks = week - 1;
  };

  KlassWeeklyView.prototype.render = function() {
    var gridPage, html, i, resultsForThisSubtest, subtest, subtestsThisWeek, _len;
    gridPage = "<table class='info_box_wide '><tbody><tr><th></th>";
    this.options.students.each(function(student) {
      return gridPage += "<th>" + (student.get("name")) + "</th>";
    });
    gridPage += "</tr>";
    subtestsThisWeek = this.subtestsByWeek[this.currentWeek];
    for (i = 0, _len = subtestsThisWeek.length; i < _len; i++) {
      subtest = subtestsThisWeek[i];
      gridPage += "<tr>";
      resultsForThisSubtest = new KlassResults(this.options.results.where({
        "subtestId": subtest.id
      }));
      gridPage += "<td><div class='subtest' data-id='" + subtest.id + "'>" + (subtest.get('name')) + "</div></td>";
      this.options.students.each(function(student) {
        var marker, studentResult;
        studentResult = resultsForThisSubtest.where({
          "studentId": student.id
        });
        marker = studentResult.length === 0 ? "?" : "O";
        return gridPage += "<td><div class='student_subtest command' data-taken='true' data-studentId='" + student.id + "' data-subtestId='" + subtest.id + "'>" + marker + "</div></td>";
      });
      gridPage += "</tr>";
    }
    gridPage += "</tbody></table>";
    html = "      <h1>Class Status</h1>      <h2>Week " + this.currentWeek + "</h2>      " + gridPage + "<br>            <button class='prev_week command'>Previous</button> <button class='next_week command'>Next</button>       ";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return KlassWeeklyView;

})(Backbone.View);

var KlassWeeklyView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassWeeklyView = (function(_super) {

  __extends(KlassWeeklyView, _super);

  function KlassWeeklyView() {
    KlassWeeklyView.__super__.constructor.apply(this, arguments);
  }

  KlassWeeklyView.prototype.events = {
    "click .next_week": "nextWeek",
    "click .prev_week": "prevWeek",
    "click .back": "back",
    "click .student_subtest": "gotoStudentSubtest"
  };

  KlassWeeklyView.prototype.back = function() {
    return Tangerine.router.navigate("class", true);
  };

  KlassWeeklyView.prototype.gotoStudentSubtest = function(event) {
    var studentId, subtestId;
    studentId = $(event.target).attr("data-studentId");
    subtestId = $(event.target).attr("data-subtestId");
    return Tangerine.router.navigate("class/result/student/subtest/" + studentId + "/" + subtestId, true);
  };

  KlassWeeklyView.prototype.nextWeek = function() {
    if (this.currentWeek < this.subtestsByWeek.length - 1) {
      this.currentWeek++;
      this.render();
      return Tangerine.router.navigate("class/" + this.options.klass.id + "/" + this.currentWeek);
    }
  };

  KlassWeeklyView.prototype.prevWeek = function() {
    if (this.currentWeek > 1) {
      this.currentWeek--;
      return this.render();
    }
  };

  KlassWeeklyView.prototype.initialize = function(options) {
    var byWeek, week;
    this.currentWeek = options.week || 1;
    this.subtestsByWeek = [];
    week = 1;
    while ((byWeek = options.subtests.where({
        "week": week
      })).length !== 0) {
      if (byWeek !== 0) this.subtestsByWeek[week] = byWeek;
      this.subtestsByWeek[week].sort(function(a, b) {
        return a.get("name").toLowerCase() > b.get("name").toLowerCase();
      });
      week++;
    }
    return this.totalWeeks = week - 1;
  };

  KlassWeeklyView.prototype.render = function() {
    var cell, column, gridPage, i, j, marker, resultsForThisStudent, row, student, studentResult, subtest, subtestsThisWeek, _i, _j, _len, _len2, _len3, _len4, _len5, _ref, _ref2;
    this.table = [];
    subtestsThisWeek = this.subtestsByWeek[this.currentWeek];
    _ref = this.options.students.models;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      student = _ref[i];
      this.table[i] = [];
      resultsForThisStudent = new KlassResults(this.options.results.where({
        "studentId": student.id
      }));
      for (j = 0, _len2 = subtestsThisWeek.length; j < _len2; j++) {
        subtest = subtestsThisWeek[j];
        studentResult = resultsForThisStudent.where({
          "subtestId": subtest.id
        });
        marker = studentResult.length === 0 ? "?" : "&#x2714;";
        this.table[i].push({
          "content": marker,
          "taken": studentResult.length !== 0,
          "studentId": student.id,
          "studentName": student.get("name"),
          "subtestId": subtest.id
        });
      }
    }
    gridPage = "<table class='info_box_wide '><tbody><tr><th></th>";
    for (_i = 0, _len3 = subtestsThisWeek.length; _i < _len3; _i++) {
      subtest = subtestsThisWeek[_i];
      gridPage += "<th><div class='week_subtest_report' data-id='" + subtest.id + "'>" + (subtest.get('name')) + "</div></th>";
    }
    gridPage += "</tr>";
    _ref2 = this.table;
    for (_j = 0, _len4 = _ref2.length; _j < _len4; _j++) {
      row = _ref2[_j];
      gridPage += "<tr><td><div class='student' data-studentId='" + row[0].studentId + "'>" + row[0].studentName + "</div></td>";
      for (column = 0, _len5 = row.length; column < _len5; column++) {
        cell = row[column];
        gridPage += "<td><div class='student_subtest command' data-taken='" + cell.taken + "' data-studentId='" + cell.studentId + "' data-subtestId='" + cell.subtestId + "'>" + cell.content + "</div></td>";
      }
      gridPage += "</tr>";
    }
    gridPage += "</tbody></table>";
    this.$el.html("      <h1>" + (t('class status')) + "</h1>      <h2>" + (t('week')) + " " + this.currentWeek + "</h2>      " + gridPage + "<br>            <button class='prev_week command'>" + (t('previous')) + "</button> <button class='next_week command'>" + (t('next')) + "</button><br><br>      <button class='back navigation'>" + (t('back')) + "</button>       ");
    return this.trigger("rendered");
  };

  return KlassWeeklyView;

})(Backbone.View);

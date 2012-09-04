var KlassPartlyView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassPartlyView = (function(_super) {

  __extends(KlassPartlyView, _super);

  function KlassPartlyView() {
    KlassPartlyView.__super__.constructor.apply(this, arguments);
  }

  KlassPartlyView.prototype.events = {
    "click .next_part": "nextPart",
    "click .prev_part": "prevPart",
    "click .back": "back",
    "click .student_subtest": "gotoStudentSubtest"
  };

  KlassPartlyView.prototype.back = function() {
    return Tangerine.router.navigate("class", true);
  };

  KlassPartlyView.prototype.gotoStudentSubtest = function(event) {
    var studentId, subtestId;
    studentId = $(event.target).attr("data-studentId");
    subtestId = $(event.target).attr("data-subtestId");
    return Tangerine.router.navigate("class/result/student/subtest/" + studentId + "/" + subtestId, true);
  };

  KlassPartlyView.prototype.nextPart = function() {
    if (this.currentPart < this.subtestsByPart.length - 1) {
      this.currentPart++;
      this.render();
      return Tangerine.router.navigate("class/" + this.options.klass.id + "/" + this.currentPart);
    }
  };

  KlassPartlyView.prototype.prevPart = function() {
    if (this.currentPart > 1) {
      this.currentPart--;
      return this.render();
    }
  };

  KlassPartlyView.prototype.initialize = function(options) {
    var byPart, part;
    this.currentPart = options.part || 1;
    this.subtestsByPart = [];
    part = 1;
    while ((byPart = options.subtests.where({
        "part": part
      })).length !== 0) {
      if (byPart !== 0) this.subtestsByPart[part] = byPart;
      this.subtestsByPart[part].sort(function(a, b) {
        return a.get("name").toLowerCase() > b.get("name").toLowerCase();
      });
      part++;
    }
    return this.totalParts = part - 1;
  };

  KlassPartlyView.prototype.render = function() {
    var cell, column, gridPage, i, j, marker, resultsForThisStudent, row, student, studentResult, subtest, subtestsThisPart, _i, _j, _len, _len2, _len3, _len4, _len5, _ref, _ref2;
    this.table = [];
    subtestsThisPart = this.subtestsByPart[this.currentPart];
    _ref = this.options.students.models;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      student = _ref[i];
      this.table[i] = [];
      resultsForThisStudent = new KlassResults(this.options.results.where({
        "studentId": student.id
      }));
      for (j = 0, _len2 = subtestsThisPart.length; j < _len2; j++) {
        subtest = subtestsThisPart[j];
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
    gridPage = "<table class='info_box_wide'><tbody><tr><th></th>";
    for (_i = 0, _len3 = subtestsThisPart.length; _i < _len3; _i++) {
      subtest = subtestsThisPart[_i];
      gridPage += "<th><div class='part_subtest_report' data-id='" + subtest.id + "'>" + (subtest.get('name')) + "</div></th>";
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
    this.$el.html("      <h1>" + (t('class status')) + "</h1>      <h2>" + (t('assessment')) + " " + this.currentPart + "</h2>      " + gridPage + "<br>            <button class='prev_part command'>" + (t('previous')) + "</button> <button class='next_part command'>" + (t('next')) + "</button><br><br>      <button class='back navigation'>" + (t('back')) + "</button>       ");
    return this.trigger("rendered");
  };

  return KlassPartlyView;

})(Backbone.View);

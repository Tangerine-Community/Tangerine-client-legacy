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
    "click .student_subtest": "gotoStudentSubtest",
    "keyup #current_part": "gotoAssessment",
    "keyup #search_student_name": "filterStudents"
  };

  KlassPartlyView.prototype.filterStudents = function() {
    var val;
    val = this.$el.find("#search_student_name").val();
    this.search = val;
    return this.updateGridPage();
  };

  KlassPartlyView.prototype.gotoAssessment = function() {
    var val;
    val = this.$el.find("#current_part").val();
    if (val === "") return;
    this.currentPart = parseInt(val);
    console.log(this.$el.find("#current_part").val());
    return this.updateGridPage();
  };

  KlassPartlyView.prototype.update = function() {
    this.render();
    return Tangerine.router.navigate("class/" + this.options.klass.id + "/" + this.currentPart);
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
      return this.update();
    }
  };

  KlassPartlyView.prototype.prevPart = function() {
    if (this.currentPart > 1) {
      this.currentPart--;
      return this.update();
    }
  };

  KlassPartlyView.prototype.initialize = function(options) {
    var byPart, part;
    this.search = "";
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

  KlassPartlyView.prototype.updateGridPage = function() {
    return this.$el.find("#grid_container").html(this.getGridPage());
  };

  KlassPartlyView.prototype.getGridPage = function() {
    var cell, column, gridPage, i, j, resultsForThisStudent, row, student, studentResult, subtest, subtestsThisPart, table, taken, takenClass, _i, _j, _len, _len2, _len3, _len4, _len5, _ref;
    table = [];
    subtestsThisPart = this.subtestsByPart[this.currentPart];
    _ref = this.options.students.models;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      student = _ref[i];
      table[i] = [];
      resultsForThisStudent = new KlassResults(this.options.results.where({
        "studentId": student.id
      }));
      for (j = 0, _len2 = subtestsThisPart.length; j < _len2; j++) {
        subtest = subtestsThisPart[j];
        studentResult = resultsForThisStudent.where({
          "subtestId": subtest.id
        });
        taken = studentResult.length !== 0;
        if (~student.get("name").toLowerCase().indexOf(this.search.toLowerCase()) || this.search === "") {
          table[i].push({
            "content": taken ? "&#x2714;" : "?",
            "taken": taken,
            "studentId": student.id,
            "studentName": student.get("name"),
            "subtestId": subtest.id
          });
        }
      }
    }
    gridPage = "<table class='info_box_wide'><tbody><tr><th></th>";
    for (_i = 0, _len3 = subtestsThisPart.length; _i < _len3; _i++) {
      subtest = subtestsThisPart[_i];
      gridPage += "<th><div class='part_subtest_report' data-id='" + subtest.id + "'>" + (subtest.get('name')) + "</div></th>";
    }
    gridPage += "</tr>";
    for (_j = 0, _len4 = table.length; _j < _len4; _j++) {
      row = table[_j];
      if ((row != null) && row.length) {
        gridPage += "<tr><td><div class='student' data-studentId='" + row[0].studentId + "'>" + row[0].studentName + "</div></td>";
        for (column = 0, _len5 = row.length; column < _len5; column++) {
          cell = row[column];
          takenClass = cell.taken ? " subtest_taken" : "";
          gridPage += "<td><div class='student_subtest command " + takenClass + "' data-taken='" + cell.taken + "' data-studentId='" + cell.studentId + "' data-subtestId='" + cell.subtestId + "'>" + cell.content + "</div></td>";
        }
        gridPage += "</tr>";
      }
    }
    gridPage += "</tbody></table>";
    return gridPage;
  };

  KlassPartlyView.prototype.render = function() {
    var gridPage;
    gridPage = this.getGridPage();
    this.$el.html("      <h1>" + (t('assessment status')) + "</h1>      <input id='search_student_name' placeholder='" + (t('search student name')) + "' type='text'>      <div id='grid_container'>" + gridPage + "</div><br>      <h2>" + (t('current assessment')) + " </h2>            <button class='prev_part command'>&lt;</button> <input type='number' value='" + this.currentPart + "' id='current_part'> <button class='next_part command'>&gt;</button><br><br>      <button class='back navigation'>" + (t('back')) + "</button>       ");
    return this.trigger("rendered");
  };

  return KlassPartlyView;

})(Backbone.View);

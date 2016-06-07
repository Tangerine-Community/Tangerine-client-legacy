var KlassPartlyView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassPartlyView = (function(superClass) {
  extend(KlassPartlyView, superClass);

  function KlassPartlyView() {
    return KlassPartlyView.__super__.constructor.apply(this, arguments);
  }

  KlassPartlyView.prototype.className = "KlassPartlyView";

  KlassPartlyView.prototype.events = {
    "click .next_part": "nextPart",
    "click .prev_part": "prevPart",
    "click .back": "back",
    "click .student_subtest": "gotoStudentSubtest",
    "keyup #current_part": "gotoAssessment",
    "keyup #search_student_name": "filterStudents",
    "focus #search_student_name": "scrollToName"
  };

  KlassPartlyView.prototype.scrollToName = function() {
    return this.$el.find("#search_student_name").scrollTo();
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
    if (val === "") {
      return;
    }
    this.currentPart = parseInt(val);
    return this.updateGridPage();
  };

  KlassPartlyView.prototype.update = function() {
    this.render();
    return Tangerine.router.navigate("class/" + this.klass.id + "/" + this.currentPart);
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
    if (this.currentPart < this.lastPart) {
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
    this.klass = options.klass;
    this.students = options.students;
    this.results = options.results;
    this.search = "";
    this.currentPart = options.part || 1;
    this.subtestsByPart = [];
    this.subtestsByPart = options.subtests.indexBy("part");
    return this.lastPart = Math.max.apply(this, _.compact(options.subtests.pluck("part"))) || 1;
  };

  KlassPartlyView.prototype.updateGridPage = function() {
    return this.$el.find("#grid_container").html(this.getGridPage());
  };

  KlassPartlyView.prototype.getGridPage = function() {
    var background, cell, column, gridPage, i, j, k, l, len, len1, len2, len3, len4, m, n, o, p, partTest, q, recency, ref, resultsForThisStudent, row, search, student, studentResult, subtest, subtestsThisPart, table, taken, takenClass;
    table = [];
    subtestsThisPart = this.subtestsByPart[this.currentPart];
    if (subtestsThisPart == null) {
      return "No subtests for this assessment.";
    }
    ref = this.students.models;
    for (i = l = 0, len = ref.length; l < len; i = ++l) {
      student = ref[i];
      table[i] = [];
      resultsForThisStudent = new KlassResults(this.results.where({
        "studentId": student.id
      }));
      for (j = m = 0, len1 = subtestsThisPart.length; m < len1; j = ++m) {
        subtest = subtestsThisPart[j];
        studentResult = resultsForThisStudent.where({
          "subtestId": subtest.id
        });
        taken = studentResult.length !== 0;
        if (~student.get("name").toLowerCase().indexOf(this.search.toLowerCase()) || this.search === "") {
          for (k = n = 6; n >= 0; k = --n) {
            partTest = this.currentPart - k;
            search = resultsForThisStudent.where({
              "part": partTest,
              "itemType": subtest.get("itemType")
            });
            if (search.length) {
              recency = k;
            }
          }
          background = recency <= 2 ? "" : recency <= 4 ? "rgb(229, 208, 149)" : "rgb(222, 156, 117)";
          table[i].push({
            "content": taken ? "&#x2714;" : "?",
            "taken": taken,
            "studentId": student.id,
            "studentName": student.get("name"),
            "subtestId": subtest.id,
            "background": background
          });
        }
      }
    }
    gridPage = "<table class='info_box_wide'><tbody><tr><th></th>";
    for (o = 0, len2 = subtestsThisPart.length; o < len2; o++) {
      subtest = subtestsThisPart[o];
      gridPage += "<th><div class='part_subtest_report' data-id='" + subtest.id + "'>" + (subtest.get('name')) + "</div></th>";
    }
    gridPage += "</tr>";
    for (p = 0, len3 = table.length; p < len3; p++) {
      row = table[p];
      if ((row != null) && row.length) {
        gridPage += "<tr><td><div class='student' data-studentId='" + row[0].studentId + "'>" + row[0].studentName + "</div></td>";
        for (column = q = 0, len4 = row.length; q < len4; column = ++q) {
          cell = row[column];
          takenClass = cell.taken ? " subtest_taken" : "";
          gridPage += "<td><div class='student_subtest command " + takenClass + "' data-taken='" + cell.taken + "' data-studentId='" + cell.studentId + "' data-subtestId='" + cell.subtestId + "' style='background-color:" + cell.background + " !important;'>" + cell.content + "</div></td>";
        }
        gridPage += "</tr>";
      }
    }
    gridPage += "</tbody></table>";
    if (_.flatten(table).length === 0) {
      gridPage = "<p class='grey'>No students found.</p>";
    }
    return gridPage;
  };

  KlassPartlyView.prototype.render = function() {
    var gridPage;
    gridPage = this.getGridPage();
    this.$el.html("<h1>" + (t('assessment status')) + "</h1> <input id='search_student_name' style='width: 92% !important' placeholder='" + (t('search student name')) + "' type='text'> <div id='grid_container'>" + gridPage + "</div><br> <h2>" + (t('current assessment')) + " </h2> <button class='prev_part command'>&lt;</button> <input type='number' value='" + this.currentPart + "' id='current_part'> <button class='next_part command'>&gt;</button><br><br> <button class='back navigation'>" + (t('back')) + "</button>");
    return this.trigger("rendered");
  };

  return KlassPartlyView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMva2xhc3MvS2xhc3NQYXJ0bHlWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGVBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7NEJBRUosU0FBQSxHQUFZOzs0QkFFWixNQUFBLEdBQ0U7SUFBQSxrQkFBQSxFQUFvQyxVQUFwQztJQUNBLGtCQUFBLEVBQW9DLFVBRHBDO0lBRUEsYUFBQSxFQUFvQyxNQUZwQztJQUdBLHdCQUFBLEVBQW9DLG9CQUhwQztJQUlBLHFCQUFBLEVBQW9DLGdCQUpwQztJQUtBLDRCQUFBLEVBQW9DLGdCQUxwQztJQU1BLDRCQUFBLEVBQW9DLGNBTnBDOzs7NEJBUUYsWUFBQSxHQUFjLFNBQUE7V0FDWixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxzQkFBVixDQUFpQyxDQUFDLFFBQWxDLENBQUE7RUFEWTs7NEJBR2QsY0FBQSxHQUFnQixTQUFBO0FBQ2QsUUFBQTtJQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxzQkFBVixDQUFpQyxDQUFDLEdBQWxDLENBQUE7SUFDTixJQUFDLENBQUEsTUFBRCxHQUFVO1dBQ1YsSUFBQyxDQUFBLGNBQUQsQ0FBQTtFQUhjOzs0QkFLaEIsY0FBQSxHQUFnQixTQUFBO0FBQ2QsUUFBQTtJQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxlQUFWLENBQTBCLENBQUMsR0FBM0IsQ0FBQTtJQUNOLElBQUcsR0FBQSxLQUFPLEVBQVY7QUFBa0IsYUFBbEI7O0lBQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxRQUFBLENBQVMsR0FBVDtXQUNmLElBQUMsQ0FBQSxjQUFELENBQUE7RUFKYzs7NEJBT2hCLE1BQUEsR0FBUSxTQUFBO0lBRU4sSUFBQyxDQUFBLE1BQUQsQ0FBQTtXQUNBLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBMEIsUUFBQSxHQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFB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QUFDLEtBQVIsR0FBbUIsZ0JBQW5CLEdBQXlDO1VBQ3RELFFBQUEsSUFBWSwwQ0FBQSxHQUEyQyxVQUEzQyxHQUFzRCxnQkFBdEQsR0FBc0UsSUFBSSxDQUFDLEtBQTNFLEdBQWlGLG9CQUFqRixHQUFxRyxJQUFJLENBQUMsU0FBMUcsR0FBb0gsb0JBQXBILEdBQXdJLElBQUksQ0FBQyxTQUE3SSxHQUF1Siw0QkFBdkosR0FBbUwsSUFBSSxDQUFDLFVBQXhMLEdBQW1NLGdCQUFuTSxHQUFtTixJQUFJLENBQUMsT0FBeE4sR0FBZ087QUFGOU87UUFHQSxRQUFBLElBQVksUUFMZDs7QUFERjtJQU9BLFFBQUEsSUFBWTtJQUVaLElBQUcsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFWLENBQWdCLENBQUMsTUFBakIsS0FBMkIsQ0FBOUI7TUFDRSxRQUFBLEdBQVcseUNBRGI7O0FBR0EsV0FBTztFQXZESTs7NEJBMERiLE1BQUEsR0FBUSxTQUFBO0FBRU4sUUFBQTtJQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsV0FBRCxDQUFBO0lBRVgsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsTUFBQSxHQUNILENBQUMsQ0FBQSxDQUFFLG1CQUFGLENBQUQsQ0FERyxHQUNxQixtRkFEckIsR0FFb0UsQ0FBQyxDQUFBLENBQUUscUJBQUYsQ0FBRCxDQUZwRSxHQUU4RiwwQ0FGOUYsR0FJbUIsUUFKbkIsR0FJNEIsaUJBSjVCLEdBS0gsQ0FBQyxDQUFBLENBQUUsb0JBQUYsQ0FBRCxDQUxHLEdBS3NCLHFGQUx0QixHQU9zRSxJQUFDLENBQUEsV0FQdkUsR0FPbUYsK0dBUG5GLEdBUXlCLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBRCxDQVJ6QixHQVFvQyxXQVI5QztXQVdBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQWZNOzs7O0dBOUhvQixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9rbGFzcy9LbGFzc1BhcnRseVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBLbGFzc1BhcnRseVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJLbGFzc1BhcnRseVZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICBcImNsaWNrIC5uZXh0X3BhcnRcIiAgICAgICAgICAgICAgICA6IFwibmV4dFBhcnRcIlxuICAgIFwiY2xpY2sgLnByZXZfcGFydFwiICAgICAgICAgICAgICAgIDogXCJwcmV2UGFydFwiXG4gICAgXCJjbGljayAuYmFja1wiICAgICAgICAgICAgICAgICAgICAgOiBcImJhY2tcIlxuICAgIFwiY2xpY2sgLnN0dWRlbnRfc3VidGVzdFwiICAgICAgICAgIDogXCJnb3RvU3R1ZGVudFN1YnRlc3RcIlxuICAgIFwia2V5dXAgI2N1cnJlbnRfcGFydFwiICAgICAgICAgICAgIDogXCJnb3RvQXNzZXNzbWVudFwiXG4gICAgXCJrZXl1cCAjc2VhcmNoX3N0dWRlbnRfbmFtZVwiICAgICAgOiBcImZpbHRlclN0dWRlbnRzXCJcbiAgICBcImZvY3VzICNzZWFyY2hfc3R1ZGVudF9uYW1lXCIgICAgICA6IFwic2Nyb2xsVG9OYW1lXCJcblxuICBzY3JvbGxUb05hbWU6IC0+XG4gICAgQCRlbC5maW5kKFwiI3NlYXJjaF9zdHVkZW50X25hbWVcIikuc2Nyb2xsVG8oKVxuXG4gIGZpbHRlclN0dWRlbnRzOiAtPlxuICAgIHZhbCA9IEAkZWwuZmluZChcIiNzZWFyY2hfc3R1ZGVudF9uYW1lXCIpLnZhbCgpXG4gICAgQHNlYXJjaCA9IHZhbFxuICAgIEB1cGRhdGVHcmlkUGFnZSgpXG5cbiAgZ290b0Fzc2Vzc21lbnQ6IC0+XG4gICAgdmFsID0gQCRlbC5maW5kKFwiI2N1cnJlbnRfcGFydFwiKS52YWwoKVxuICAgIGlmIHZhbCA9PSBcIlwiIHRoZW4gcmV0dXJuXG4gICAgQGN1cnJlbnRQYXJ0ID0gcGFyc2VJbnQodmFsKVxuICAgIEB1cGRhdGVHcmlkUGFnZSgpXG5cblxuICB1cGRhdGU6IC0+XG5cbiAgICBAcmVuZGVyKClcbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiY2xhc3MvI3tAa2xhc3MuaWR9LyN7QGN1cnJlbnRQYXJ0fVwiXG5cbiAgYmFjazogLT5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiY2xhc3NcIiwgdHJ1ZVxuXG4gIGdvdG9TdHVkZW50U3VidGVzdDogKGV2ZW50KSAtPlxuICAgIHN0dWRlbnRJZCA9ICQoZXZlbnQudGFyZ2V0KS5hdHRyKFwiZGF0YS1zdHVkZW50SWRcIilcbiAgICBzdWJ0ZXN0SWQgPSAkKGV2ZW50LnRhcmdldCkuYXR0cihcImRhdGEtc3VidGVzdElkXCIpXG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImNsYXNzL3Jlc3VsdC9zdHVkZW50L3N1YnRlc3QvI3tzdHVkZW50SWR9LyN7c3VidGVzdElkfVwiLCB0cnVlXG5cbiAgbmV4dFBhcnQ6IC0+XG4gICAgaWYgQGN1cnJlbnRQYXJ0IDwgQGxhc3RQYXJ0XG4gICAgICBAY3VycmVudFBhcnQrK1xuICAgICAgQHVwZGF0ZSgpXG5cbiAgcHJldlBhcnQ6IC0+IFxuICAgIGlmIEBjdXJyZW50UGFydCA+IDFcbiAgICAgIEBjdXJyZW50UGFydC0tIFxuICAgICAgQHVwZGF0ZSgpXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAa2xhc3MgPSBvcHRpb25zLmtsYXNzXG4gICAgQHN0dWRlbnRzID0gb3B0aW9ucy5zdHVkZW50c1xuICAgIEByZXN1bHRzID0gb3B0aW9ucy5yZXN1bHRzXG5cbiAgICBAc2VhcmNoID0gXCJcIlxuICAgIEBjdXJyZW50UGFydCA9IG9wdGlvbnMucGFydCB8fCAxXG4gICAgQHN1YnRlc3RzQnlQYXJ0ID0gW11cblxuICAgIEBzdWJ0ZXN0c0J5UGFydCA9IG9wdGlvbnMuc3VidGVzdHMuaW5kZXhCeSBcInBhcnRcIlxuXG4gICAgQGxhc3RQYXJ0ID0gTWF0aC5tYXguYXBwbHkoQCwgXy5jb21wYWN0KG9wdGlvbnMuc3VidGVzdHMucGx1Y2soXCJwYXJ0XCIpKSkgfHwgMVxuXG4gIHVwZGF0ZUdyaWRQYWdlOi0+XG4gICAgQCRlbC5maW5kKFwiI2dyaWRfY29udGFpbmVyXCIpLmh0bWwgQGdldEdyaWRQYWdlKClcblxuICBnZXRHcmlkUGFnZTogLT5cbiAgICB0YWJsZSA9IFtdXG4gICAgc3VidGVzdHNUaGlzUGFydCA9IEBzdWJ0ZXN0c0J5UGFydFtAY3VycmVudFBhcnRdXG4gICAgcmV0dXJuIFwiTm8gc3VidGVzdHMgZm9yIHRoaXMgYXNzZXNzbWVudC5cIiBpZiBub3Qgc3VidGVzdHNUaGlzUGFydD9cblxuICAgIGZvciBzdHVkZW50LCBpIGluIEBzdHVkZW50cy5tb2RlbHNcbiAgICAgIHRhYmxlW2ldID0gW11cblxuICAgICAgcmVzdWx0c0ZvclRoaXNTdHVkZW50ID0gbmV3IEtsYXNzUmVzdWx0cyBAcmVzdWx0cy53aGVyZSBcInN0dWRlbnRJZFwiIDogc3R1ZGVudC5pZFxuXG4gICAgICBmb3Igc3VidGVzdCwgaiBpbiBzdWJ0ZXN0c1RoaXNQYXJ0XG4gICAgICAgIHN0dWRlbnRSZXN1bHQgPSByZXN1bHRzRm9yVGhpc1N0dWRlbnQud2hlcmUgXCJzdWJ0ZXN0SWRcIiA6IHN1YnRlc3QuaWRcbiAgICAgICAgdGFrZW4gPSBzdHVkZW50UmVzdWx0Lmxlbmd0aCAhPSAwXG4gICAgICAgIGlmIH5zdHVkZW50LmdldChcIm5hbWVcIikudG9Mb3dlckNhc2UoKS5pbmRleE9mKEBzZWFyY2gudG9Mb3dlckNhc2UoKSkgfHwgQHNlYXJjaCA9PSBcIlwiXG5cbiAgICAgICAgICAjIGNvdW50IGJhY2sgdG8gZm9yd2FyZCB0byBnZXQgcmVjZW5jeSBvZiBsYXN0IHJlc3VsdCBmb3IgY29sb3IgY29kaW5nXG4gICAgICAgICAgZm9yIGsgaW4gWzYuLjBdXG4gICAgICAgICAgICBwYXJ0VGVzdCA9IEBjdXJyZW50UGFydCAtIGtcbiAgICAgICAgICAgIHNlYXJjaCA9IHJlc3VsdHNGb3JUaGlzU3R1ZGVudC53aGVyZShcInBhcnRcIiA6IHBhcnRUZXN0LCBcIml0ZW1UeXBlXCIgOiBzdWJ0ZXN0LmdldChcIml0ZW1UeXBlXCIpKVxuICAgICAgICAgICAgcmVjZW5jeSA9IGsgaWYgc2VhcmNoLmxlbmd0aFxuXG4gICAgICAgICAgYmFja2dyb3VuZCA9XG4gICAgICAgICAgICBpZiByZWNlbmN5IDw9IDJcbiAgICAgICAgICAgICAgXCJcIlxuICAgICAgICAgICAgZWxzZSBpZiByZWNlbmN5IDw9IDRcbiAgICAgICAgICAgICAgXCJyZ2IoMjI5LCAyMDgsIDE0OSlcIlxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBcInJnYigyMjIsIDE1NiwgMTE3KVwiXG5cbiAgICAgICAgICB0YWJsZVtpXS5wdXNoXG4gICAgICAgICAgICBcImNvbnRlbnRcIiAgIDogaWYgdGFrZW4gdGhlbiBcIiYjeDI3MTQ7XCIgZWxzZSBcIj9cIlxuICAgICAgICAgICAgXCJ0YWtlblwiICAgICA6IHRha2VuXG4gICAgICAgICAgICBcInN0dWRlbnRJZFwiIDogc3R1ZGVudC5pZFxuICAgICAgICAgICAgXCJzdHVkZW50TmFtZVwiIDogc3R1ZGVudC5nZXQoXCJuYW1lXCIpXG4gICAgICAgICAgICBcInN1YnRlc3RJZFwiIDogc3VidGVzdC5pZFxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCIgOiBiYWNrZ3JvdW5kXG5cblxuICAgICMgbWFrZSBoZWFkZXJzXG4gICAgZ3JpZFBhZ2UgPSBcIjx0YWJsZSBjbGFzcz0naW5mb19ib3hfd2lkZSc+PHRib2R5Pjx0cj48dGg+PC90aD5cIlxuICAgIGZvciBzdWJ0ZXN0IGluIHN1YnRlc3RzVGhpc1BhcnRcbiAgICAgIGdyaWRQYWdlICs9IFwiPHRoPjxkaXYgY2xhc3M9J3BhcnRfc3VidGVzdF9yZXBvcnQnIGRhdGEtaWQ9JyN7c3VidGVzdC5pZH0nPiN7c3VidGVzdC5nZXQoJ25hbWUnKX08L2Rpdj48L3RoPlwiXG4gICAgZ3JpZFBhZ2UgKz0gXCI8L3RyPlwiXG4gICAgZm9yIHJvdyBpbiB0YWJsZVxuICAgICAgaWYgcm93PyAmJiByb3cubGVuZ3RoXG4gICAgICAgIGdyaWRQYWdlICs9IFwiPHRyPjx0ZD48ZGl2IGNsYXNzPSdzdHVkZW50JyBkYXRhLXN0dWRlbnRJZD0nI3tyb3dbMF0uc3R1ZGVudElkfSc+I3tyb3dbMF0uc3R1ZGVudE5hbWV9PC9kaXY+PC90ZD5cIlxuICAgICAgICBmb3IgY2VsbCwgY29sdW1uIGluIHJvd1xuICAgICAgICAgIHRha2VuQ2xhc3MgPSBpZiBjZWxsLnRha2VuIHRoZW4gXCIgc3VidGVzdF90YWtlblwiIGVsc2UgXCJcIlxuICAgICAgICAgIGdyaWRQYWdlICs9IFwiPHRkPjxkaXYgY2xhc3M9J3N0dWRlbnRfc3VidGVzdCBjb21tYW5kICN7dGFrZW5DbGFzc30nIGRhdGEtdGFrZW49JyN7Y2VsbC50YWtlbn0nIGRhdGEtc3R1ZGVudElkPScje2NlbGwuc3R1ZGVudElkfScgZGF0YS1zdWJ0ZXN0SWQ9JyN7Y2VsbC5zdWJ0ZXN0SWR9JyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjoje2NlbGwuYmFja2dyb3VuZH0gIWltcG9ydGFudDsnPiN7Y2VsbC5jb250ZW50fTwvZGl2PjwvdGQ+XCJcbiAgICAgICAgZ3JpZFBhZ2UgKz0gXCI8L3RyPlwiXG4gICAgZ3JpZFBhZ2UgKz0gXCI8L3Rib2R5PjwvdGFibGU+XCJcblxuICAgIGlmIF8uZmxhdHRlbih0YWJsZSkubGVuZ3RoID09IDBcbiAgICAgIGdyaWRQYWdlID0gXCI8cCBjbGFzcz0nZ3JleSc+Tm8gc3R1ZGVudHMgZm91bmQuPC9wPlwiXG5cbiAgICByZXR1cm4gZ3JpZFBhZ2VcblxuXG4gIHJlbmRlcjogLT5cbiAgICBcbiAgICBncmlkUGFnZSA9IEBnZXRHcmlkUGFnZSgpXG4gICAgXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8aDE+I3t0KCdhc3Nlc3NtZW50IHN0YXR1cycpfTwvaDE+XG4gICAgICA8aW5wdXQgaWQ9J3NlYXJjaF9zdHVkZW50X25hbWUnIHN0eWxlPSd3aWR0aDogOTIlICFpbXBvcnRhbnQnIHBsYWNlaG9sZGVyPScje3QoJ3NlYXJjaCBzdHVkZW50IG5hbWUnKX0nIHR5cGU9J3RleHQnPlxuXG4gICAgICA8ZGl2IGlkPSdncmlkX2NvbnRhaW5lcic+I3tncmlkUGFnZX08L2Rpdj48YnI+XG4gICAgICA8aDI+I3t0KCdjdXJyZW50IGFzc2Vzc21lbnQnKX0gPC9oMj5cbiAgICAgIFxuICAgICAgPGJ1dHRvbiBjbGFzcz0ncHJldl9wYXJ0IGNvbW1hbmQnPiZsdDs8L2J1dHRvbj4gPGlucHV0IHR5cGU9J251bWJlcicgdmFsdWU9JyN7QGN1cnJlbnRQYXJ0fScgaWQ9J2N1cnJlbnRfcGFydCc+IDxidXR0b24gY2xhc3M9J25leHRfcGFydCBjb21tYW5kJz4mZ3Q7PC9idXR0b24+PGJyPjxicj5cbiAgICAgIDxidXR0b24gY2xhc3M9J2JhY2sgbmF2aWdhdGlvbic+I3t0KCdiYWNrJyl9PC9idXR0b24+IFxuICAgICAgXCJcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIiJdfQ==

var KlassView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassView = (function(superClass) {
  extend(KlassView, superClass);

  function KlassView() {
    return KlassView.__super__.constructor.apply(this, arguments);
  }

  KlassView.prototype.className = "KlassView";

  KlassView.prototype.initialize = function(options) {
    var allAssessments;
    this.klass = options.klass;
    this.assessments = this.klass.assessments;
    this.results = [];
    allAssessments = new KlassAssessments;
    return allAssessments.fetch({
      success: (function(_this) {
        return function(assessmentCollection) {
          var results;
          _this.assessments = assessmentCollection.where({
            klassId: _this.klass.id
          });
          results = new Results;
          return results.fetch({
            success: function(resultCollection) {
              var assessment, i, len, ref;
              ref = _this.assessments;
              for (i = 0, len = ref.length; i < len; i++) {
                assessment = ref[i];
                assessment.results = resultCollection.where({
                  assessmentId: assessment.id
                });
              }
              return _this.render();
            }
          });
        };
      })(this)
    });
  };

  KlassView.prototype.render = function() {
    var assessment, grade, html, i, len, ref, ref1, stream, year;
    year = this.klass.get("year") || "";
    grade = this.klass.get("grade") || "";
    stream = this.klass.get("stream") || "";
    html = "<h1>" + (t('class')) + " " + stream + "</h1> <table> <tr><td>School year</td><td>" + year + "</td></tr> <tr><td>" + (t('grade')) + "</td><tr>" + grade + "</td></tr> </table> </div> <ul class='assessment_list'>";
    ref = this.assessments;
    for (i = 0, len = ref.length; i < len; i++) {
      assessment = ref[i];
      html += "<li data-id='" + assessment.id + "'>" + (assessment.get('name')) + " - " + ((ref1 = assessment.get('results')) != null ? ref1.length : void 0) + "</li>";
    }
    html += "</ul>";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return KlassView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMva2xhc3MvS2xhc3NWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFNBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7c0JBRUosU0FBQSxHQUFZOztzQkFFWixVQUFBLEdBQVksU0FBRSxPQUFGO0FBQ1YsUUFBQTtJQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUN0QixJQUFDLENBQUEsT0FBRCxHQUFlO0lBQ2YsY0FBQSxHQUFpQixJQUFJO1dBQ3JCLGNBQWMsQ0FBQyxLQUFmLENBQ0U7TUFBQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLG9CQUFEO0FBQ1AsY0FBQTtVQUFBLEtBQUMsQ0FBQSxXQUFELEdBQWUsb0JBQW9CLENBQUMsS0FBckIsQ0FBMkI7WUFBRSxPQUFBLEVBQVUsS0FBQyxDQUFBLEtBQUssQ0FBQyxFQUFuQjtXQUEzQjtVQUNmLE9BQUEsR0FBVSxJQUFJO2lCQUNkLE9BQU8sQ0FBQyxLQUFSLENBQ0U7WUFBQSxPQUFBLEVBQVMsU0FBQyxnQkFBRDtBQUNQLGtCQUFBO0FBQUE7QUFBQSxtQkFBQSxxQ0FBQTs7Z0JBQ0UsVUFBVSxDQUFDLE9BQVgsR0FBcUIsZ0JBQWdCLENBQUMsS0FBakIsQ0FBdUI7a0JBQUUsWUFBQSxFQUFlLFVBQVUsQ0FBQyxFQUE1QjtpQkFBdkI7QUFEdkI7cUJBRUEsS0FBQyxDQUFBLE1BQUQsQ0FBQTtZQUhPLENBQVQ7V0FERjtRQUhPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO0tBREY7RUFMVTs7c0JBZVosTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsSUFBQSxHQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBQSxJQUF3QjtJQUNqQyxLQUFBLEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsT0FBWCxDQUFBLElBQXdCO0lBQ2pDLE1BQUEsR0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLENBQUEsSUFBd0I7SUFDakMsSUFBQSxHQUFPLE1BQUEsR0FDRixDQUFDLENBQUEsQ0FBRSxPQUFGLENBQUQsQ0FERSxHQUNVLEdBRFYsR0FDYSxNQURiLEdBQ29CLDRDQURwQixHQUd5QixJQUh6QixHQUc4QixxQkFIOUIsR0FJSSxDQUFDLENBQUEsQ0FBRSxPQUFGLENBQUQsQ0FKSixHQUlnQixXQUpoQixHQUkyQixLQUozQixHQUlpQztBQUl4QztBQUFBLFNBQUEscUNBQUE7O01BQ0UsSUFBQSxJQUFRLGVBQUEsR0FBZ0IsVUFBVSxDQUFDLEVBQTNCLEdBQThCLElBQTlCLEdBQWlDLENBQUMsVUFBVSxDQUFDLEdBQVgsQ0FBZSxNQUFmLENBQUQsQ0FBakMsR0FBd0QsS0FBeEQsR0FBNEQsa0RBQTBCLENBQUUsZUFBNUIsQ0FBNUQsR0FBK0Y7QUFEekc7SUFFQSxJQUFBLElBQVE7SUFFUixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxJQUFWO1dBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBakJNOzs7O0dBbkJjLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL2tsYXNzL0tsYXNzVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEtsYXNzVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIktsYXNzVmlld1wiXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cbiAgICBAa2xhc3MgPSBvcHRpb25zLmtsYXNzXG4gICAgQGFzc2Vzc21lbnRzID0gQGtsYXNzLmFzc2Vzc21lbnRzXG4gICAgQHJlc3VsdHMgICAgID0gW11cbiAgICBhbGxBc3Nlc3NtZW50cyA9IG5ldyBLbGFzc0Fzc2Vzc21lbnRzXG4gICAgYWxsQXNzZXNzbWVudHMuZmV0Y2hcbiAgICAgIHN1Y2Nlc3M6IChhc3Nlc3NtZW50Q29sbGVjdGlvbikgPT5cbiAgICAgICAgQGFzc2Vzc21lbnRzID0gYXNzZXNzbWVudENvbGxlY3Rpb24ud2hlcmUgeyBrbGFzc0lkIDogQGtsYXNzLmlkIH1cbiAgICAgICAgcmVzdWx0cyA9IG5ldyBSZXN1bHRzXG4gICAgICAgIHJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAocmVzdWx0Q29sbGVjdGlvbikgPT5cbiAgICAgICAgICAgIGZvciBhc3Nlc3NtZW50IGluIEBhc3Nlc3NtZW50c1xuICAgICAgICAgICAgICBhc3Nlc3NtZW50LnJlc3VsdHMgPSByZXN1bHRDb2xsZWN0aW9uLndoZXJlIHsgYXNzZXNzbWVudElkIDogYXNzZXNzbWVudC5pZCB9XG4gICAgICAgICAgICBAcmVuZGVyKClcblxuICByZW5kZXI6IC0+XG4gICAgeWVhciAgID0gQGtsYXNzLmdldChcInllYXJcIikgICB8fCBcIlwiXG4gICAgZ3JhZGUgID0gQGtsYXNzLmdldChcImdyYWRlXCIpICB8fCBcIlwiXG4gICAgc3RyZWFtID0gQGtsYXNzLmdldChcInN0cmVhbVwiKSB8fCBcIlwiXG4gICAgaHRtbCA9IFwiXG4gICAgPGgxPiN7dCgnY2xhc3MnKX0gI3tzdHJlYW19PC9oMT5cbiAgICA8dGFibGU+XG4gICAgICA8dHI+PHRkPlNjaG9vbCB5ZWFyPC90ZD48dGQ+I3t5ZWFyfTwvdGQ+PC90cj5cbiAgICAgIDx0cj48dGQ+I3t0KCdncmFkZScpfTwvdGQ+PHRyPiN7Z3JhZGV9PC90ZD48L3RyPlxuICAgIDwvdGFibGU+XG4gICAgPC9kaXY+XG4gICAgPHVsIGNsYXNzPSdhc3Nlc3NtZW50X2xpc3QnPlwiXG4gICAgZm9yIGFzc2Vzc21lbnQgaW4gQGFzc2Vzc21lbnRzXG4gICAgICBodG1sICs9IFwiPGxpIGRhdGEtaWQ9JyN7YXNzZXNzbWVudC5pZH0nPiN7YXNzZXNzbWVudC5nZXQgJ25hbWUnfSAtICN7YXNzZXNzbWVudC5nZXQoJ3Jlc3VsdHMnKT8ubGVuZ3RofTwvbGk+XCJcbiAgICBodG1sICs9IFwiPC91bD5cIlxuXG4gICAgQCRlbC5odG1sIGh0bWxcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiJdfQ==

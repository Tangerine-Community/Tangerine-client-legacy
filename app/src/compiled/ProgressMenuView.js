var ProgressMenuView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ProgressMenuView = (function(superClass) {
  extend(ProgressMenuView, superClass);

  function ProgressMenuView() {
    return ProgressMenuView.__super__.constructor.apply(this, arguments);
  }

  ProgressMenuView.prototype.className = "ProgressMenuView";

  ProgressMenuView.prototype.events = {
    'change .student_selector': 'gotoProgressTable'
  };

  ProgressMenuView.prototype.gotoProgressTable = function(event) {
    return Tangerine.router.navigate("report/progress/" + this.$el.find(event.target).find(":selected").attr("data-studentId") + ("/" + this.klass.id), true);
  };

  ProgressMenuView.prototype.initialize = function(options) {
    var allStudents;
    this.parent = options.parent;
    this.klass = this.parent.options.klass;
    this.curricula = this.parent.options.curricula;
    allStudents = new Students;
    return allStudents.fetch({
      success: (function(_this) {
        return function(collection) {
          _this.students = collection.where({
            klassId: _this.klass.id
          });
          _this.ready = true;
          return _this.render();
        };
      })(this)
    });
  };

  ProgressMenuView.prototype.render = function() {
    var html, i, len, ref, student;
    if (this.ready) {
      if (this.students.length === 0) {
        this.$el.html("Please add students to this class.");
        return;
      }
      html = "<select class='student_selector'> <option disabled='disabled' selected='selected'>" + (t('select a student')) + "</option> <option data-studentId='all'>" + (t("all students")) + "</option>";
      ref = this.students;
      for (i = 0, len = ref.length; i < len; i++) {
        student = ref[i];
        html += "<option data-studentId='" + student.id + "'>" + (student.get('name')) + "</option>";
      }
      html += "</select>";
      return this.$el.html(html);
    } else {
      return this.$el.html("<img src='images/loading.gif' class='loading'>");
    }
  };

  return ProgressMenuView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVwb3J0L1Byb2dyZXNzTWVudVZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsZ0JBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7NkJBRUosU0FBQSxHQUFZOzs2QkFFWixNQUFBLEdBQ0U7SUFBQSwwQkFBQSxFQUE2QixtQkFBN0I7Ozs2QkFFRixpQkFBQSxHQUFtQixTQUFDLEtBQUQ7V0FDakIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFqQixDQUEwQixrQkFBQSxHQUFxQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsTUFBaEIsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixXQUE3QixDQUF5QyxDQUFDLElBQTFDLENBQStDLGdCQUEvQyxDQUFyQixHQUF3RixDQUFBLEdBQUEsR0FBSSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVgsQ0FBbEgsRUFBbUksSUFBbkk7RUFEaUI7OzZCQUduQixVQUFBLEdBQVksU0FBQyxPQUFEO0FBRVYsUUFBQTtJQUFBLElBQUMsQ0FBQSxNQUFELEdBQWEsT0FBTyxDQUFDO0lBRXJCLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDN0IsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUU3QixXQUFBLEdBQWMsSUFBSTtXQUNsQixXQUFXLENBQUMsS0FBWixDQUNFO01BQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxVQUFEO1VBQ1AsS0FBQyxDQUFBLFFBQUQsR0FBWSxVQUFVLENBQUMsS0FBWCxDQUNWO1lBQUEsT0FBQSxFQUFVLEtBQUMsQ0FBQSxLQUFLLENBQUMsRUFBakI7V0FEVTtVQUVaLEtBQUMsQ0FBQSxLQUFELEdBQVM7aUJBQ1QsS0FBQyxDQUFBLE1BQUQsQ0FBQTtRQUpPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO0tBREY7RUFSVTs7NkJBZVosTUFBQSxHQUFRLFNBQUE7QUFFTixRQUFBO0lBQUEsSUFBRyxJQUFDLENBQUEsS0FBSjtNQUdFLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLEtBQW9CLENBQXZCO1FBQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsb0NBQVY7QUFDQSxlQUZGOztNQUlBLElBQUEsR0FBTyxvRkFBQSxHQUU4QyxDQUFDLENBQUEsQ0FBRSxrQkFBRixDQUFELENBRjlDLEdBRXFFLHlDQUZyRSxHQUcyQixDQUFDLENBQUEsQ0FBRSxjQUFGLENBQUQsQ0FIM0IsR0FHOEM7QUFHckQ7QUFBQSxXQUFBLHFDQUFBOztRQUNFLElBQUEsSUFBUSwwQkFBQSxHQUEyQixPQUFPLENBQUMsRUFBbkMsR0FBc0MsSUFBdEMsR0FBeUMsQ0FBQyxPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosQ0FBRCxDQUF6QyxHQUE4RDtBQUR4RTtNQUVBLElBQUEsSUFBUTthQUVSLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQVYsRUFqQkY7S0FBQSxNQUFBO2FBbUJFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdEQUFWLEVBbkJGOztFQUZNOzs7O0dBekJxQixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9yZXBvcnQvUHJvZ3Jlc3NNZW51Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFByb2dyZXNzTWVudVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJQcm9ncmVzc01lbnVWaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2NoYW5nZSAuc3R1ZGVudF9zZWxlY3RvcicgOiAnZ290b1Byb2dyZXNzVGFibGUnXG5cbiAgZ290b1Byb2dyZXNzVGFibGU6IChldmVudCkgLT5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwicmVwb3J0L3Byb2dyZXNzL1wiICsgQCRlbC5maW5kKGV2ZW50LnRhcmdldCkuZmluZChcIjpzZWxlY3RlZFwiKS5hdHRyKFwiZGF0YS1zdHVkZW50SWRcIikgKyBcIi8je0BrbGFzcy5pZH1cIiwgdHJ1ZVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQHBhcmVudCAgICA9IG9wdGlvbnMucGFyZW50XG5cbiAgICBAa2xhc3MgICAgID0gQHBhcmVudC5vcHRpb25zLmtsYXNzXG4gICAgQGN1cnJpY3VsYSA9IEBwYXJlbnQub3B0aW9ucy5jdXJyaWN1bGFcblxuICAgIGFsbFN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgYWxsU3R1ZGVudHMuZmV0Y2hcbiAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuICAgICAgICBAc3R1ZGVudHMgPSBjb2xsZWN0aW9uLndoZXJlIFxuICAgICAgICAgIGtsYXNzSWQgOiBAa2xhc3MuaWRcbiAgICAgICAgQHJlYWR5ID0gdHJ1ZVxuICAgICAgICBAcmVuZGVyKClcblxuICByZW5kZXI6IC0+XG5cbiAgICBpZiBAcmVhZHlcblxuICAgICAgIyBxdWljayBkYXRhIGNoZWNrXG4gICAgICBpZiBAc3R1ZGVudHMubGVuZ3RoID09IDBcbiAgICAgICAgQCRlbC5odG1sIFwiUGxlYXNlIGFkZCBzdHVkZW50cyB0byB0aGlzIGNsYXNzLlwiXG4gICAgICAgIHJldHVyblxuXG4gICAgICBodG1sID0gXCJcbiAgICAgICAgPHNlbGVjdCBjbGFzcz0nc3R1ZGVudF9zZWxlY3Rvcic+XG4gICAgICAgICAgPG9wdGlvbiBkaXNhYmxlZD0nZGlzYWJsZWQnIHNlbGVjdGVkPSdzZWxlY3RlZCc+I3t0KCdzZWxlY3QgYSBzdHVkZW50Jyl9PC9vcHRpb24+XG4gICAgICAgICAgPG9wdGlvbiBkYXRhLXN0dWRlbnRJZD0nYWxsJz4je3QoXCJhbGwgc3R1ZGVudHNcIil9PC9vcHRpb24+XG4gICAgICBcIlxuXG4gICAgICBmb3Igc3R1ZGVudCBpbiBAc3R1ZGVudHNcbiAgICAgICAgaHRtbCArPSBcIjxvcHRpb24gZGF0YS1zdHVkZW50SWQ9JyN7c3R1ZGVudC5pZH0nPiN7c3R1ZGVudC5nZXQoJ25hbWUnKX08L29wdGlvbj5cIlxuICAgICAgaHRtbCArPSBcIjwvc2VsZWN0PlwiXG4gICAgICAgICAgXG4gICAgICBAJGVsLmh0bWwgaHRtbFxuICAgIGVsc2VcbiAgICAgIEAkZWwuaHRtbCBcIjxpbWcgc3JjPSdpbWFnZXMvbG9hZGluZy5naWYnIGNsYXNzPSdsb2FkaW5nJz5cIlxuIl19

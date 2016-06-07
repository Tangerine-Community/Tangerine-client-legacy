var MasteryCheckMenuView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MasteryCheckMenuView = (function(superClass) {
  extend(MasteryCheckMenuView, superClass);

  function MasteryCheckMenuView() {
    return MasteryCheckMenuView.__super__.constructor.apply(this, arguments);
  }

  MasteryCheckMenuView.prototype.className = "MasteryCheckMenuView";

  MasteryCheckMenuView.prototype.events = {
    'change .student_selector': 'gotoMasteryCheckReport'
  };

  MasteryCheckMenuView.prototype.gotoMasteryCheckReport = function(event) {
    return Tangerine.router.navigate("report/masteryCheck/" + this.$el.find(event.target).find(":selected").attr("data-studentId"), true);
  };

  MasteryCheckMenuView.prototype.initialize = function(options) {
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

  MasteryCheckMenuView.prototype.render = function() {
    var html, i, len, ref, student;
    if (this.ready) {
      if (this.students.length === 0) {
        this.$el.html("Please add students to this class.");
        return;
      }
      html = "<select class='student_selector'> <option disabled='disabled' selected='selected'>" + (t('select a student')) + "</option>";
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

  return MasteryCheckMenuView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVwb3J0L01hc3RlcnlDaGVja01lbnVWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLG9CQUFBO0VBQUE7OztBQUFNOzs7Ozs7O2lDQUVKLFNBQUEsR0FBWTs7aUNBRVosTUFBQSxHQUNFO0lBQUEsMEJBQUEsRUFBNkIsd0JBQTdCOzs7aUNBRUYsc0JBQUEsR0FBd0IsU0FBQyxLQUFEO1dBQ3RCLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBMEIsc0JBQUEsR0FBeUIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsS0FBSyxDQUFDLE1BQWhCLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsV0FBN0IsQ0FBeUMsQ0FBQyxJQUExQyxDQUErQyxnQkFBL0MsQ0FBbkQsRUFBcUgsSUFBckg7RUFEc0I7O2lDQUd4QixVQUFBLEdBQVksU0FBQyxPQUFEO0FBQ1YsUUFBQTtJQUFBLElBQUMsQ0FBQSxNQUFELEdBQWEsT0FBTyxDQUFDO0lBQ3JCLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDN0IsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUM3QixXQUFBLEdBQWMsSUFBSTtXQUNsQixXQUFXLENBQUMsS0FBWixDQUNFO01BQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxVQUFEO1VBQ1AsS0FBQyxDQUFBLFFBQUQsR0FBWSxVQUFVLENBQUMsS0FBWCxDQUNWO1lBQUEsT0FBQSxFQUFVLEtBQUMsQ0FBQSxLQUFLLENBQUMsRUFBakI7V0FEVTtVQUVaLEtBQUMsQ0FBQSxLQUFELEdBQVM7aUJBQ1QsS0FBQyxDQUFBLE1BQUQsQ0FBQTtRQUpPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO0tBREY7RUFMVTs7aUNBWVosTUFBQSxHQUFRLFNBQUE7QUFFTixRQUFBO0lBQUEsSUFBRyxJQUFDLENBQUEsS0FBSjtNQUdFLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLEtBQW9CLENBQXZCO1FBQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsb0NBQVY7QUFDQSxlQUZGOztNQUlBLElBQUEsR0FBTyxvRkFBQSxHQUU4QyxDQUFDLENBQUEsQ0FBRSxrQkFBRixDQUFELENBRjlDLEdBRXFFO0FBRTVFO0FBQUEsV0FBQSxxQ0FBQTs7UUFDRSxJQUFBLElBQVEsMEJBQUEsR0FBMkIsT0FBTyxDQUFDLEVBQW5DLEdBQXNDLElBQXRDLEdBQXlDLENBQUMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLENBQUQsQ0FBekMsR0FBOEQ7QUFEeEU7TUFFQSxJQUFBLElBQVE7YUFFUixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxJQUFWLEVBZkY7S0FBQSxNQUFBO2FBaUJFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdEQUFWLEVBakJGOztFQUZNOzs7O0dBdEJ5QixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9yZXBvcnQvTWFzdGVyeUNoZWNrTWVudVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBNYXN0ZXJ5Q2hlY2tNZW51VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIk1hc3RlcnlDaGVja01lbnVWaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2NoYW5nZSAuc3R1ZGVudF9zZWxlY3RvcicgOiAnZ290b01hc3RlcnlDaGVja1JlcG9ydCdcblxuICBnb3RvTWFzdGVyeUNoZWNrUmVwb3J0OiAoZXZlbnQpIC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcInJlcG9ydC9tYXN0ZXJ5Q2hlY2svXCIgKyBAJGVsLmZpbmQoZXZlbnQudGFyZ2V0KS5maW5kKFwiOnNlbGVjdGVkXCIpLmF0dHIoXCJkYXRhLXN0dWRlbnRJZFwiKSwgdHJ1ZVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBwYXJlbnQgICAgPSBvcHRpb25zLnBhcmVudFxuICAgIEBrbGFzcyAgICAgPSBAcGFyZW50Lm9wdGlvbnMua2xhc3NcbiAgICBAY3VycmljdWxhID0gQHBhcmVudC5vcHRpb25zLmN1cnJpY3VsYVxuICAgIGFsbFN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgYWxsU3R1ZGVudHMuZmV0Y2hcbiAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuICAgICAgICBAc3R1ZGVudHMgPSBjb2xsZWN0aW9uLndoZXJlIFxuICAgICAgICAgIGtsYXNzSWQgOiBAa2xhc3MuaWRcbiAgICAgICAgQHJlYWR5ID0gdHJ1ZVxuICAgICAgICBAcmVuZGVyKClcblxuICByZW5kZXI6IC0+XG5cbiAgICBpZiBAcmVhZHlcblxuICAgICAgIyBxdWljayBkYXRhIGNoZWNrXG4gICAgICBpZiBAc3R1ZGVudHMubGVuZ3RoID09IDBcbiAgICAgICAgQCRlbC5odG1sIFwiUGxlYXNlIGFkZCBzdHVkZW50cyB0byB0aGlzIGNsYXNzLlwiXG4gICAgICAgIHJldHVyblxuXG4gICAgICBodG1sID0gXCJcbiAgICAgICAgPHNlbGVjdCBjbGFzcz0nc3R1ZGVudF9zZWxlY3Rvcic+XG4gICAgICAgICAgPG9wdGlvbiBkaXNhYmxlZD0nZGlzYWJsZWQnIHNlbGVjdGVkPSdzZWxlY3RlZCc+I3t0KCdzZWxlY3QgYSBzdHVkZW50Jyl9PC9vcHRpb24+XG4gICAgICAgICAgXCJcbiAgICAgIGZvciBzdHVkZW50IGluIEBzdHVkZW50c1xuICAgICAgICBodG1sICs9IFwiPG9wdGlvbiBkYXRhLXN0dWRlbnRJZD0nI3tzdHVkZW50LmlkfSc+I3tzdHVkZW50LmdldCgnbmFtZScpfTwvb3B0aW9uPlwiXG4gICAgICBodG1sICs9IFwiPC9zZWxlY3Q+XCJcbiAgICAgICAgICBcbiAgICAgIEAkZWwuaHRtbCBodG1sXG4gICAgZWxzZVxuICAgICAgQCRlbC5odG1sIFwiPGltZyBzcmM9J2ltYWdlcy9sb2FkaW5nLmdpZicgY2xhc3M9J2xvYWRpbmcnPlwiIl19

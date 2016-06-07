var StudentEditView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

StudentEditView = (function(superClass) {
  extend(StudentEditView, superClass);

  function StudentEditView() {
    return StudentEditView.__super__.constructor.apply(this, arguments);
  }

  StudentEditView.prototype.className = "StudentEditView";

  StudentEditView.prototype.events = {
    'click .done': 'done',
    'click .back': 'back'
  };

  StudentEditView.prototype.initialize = function(options) {
    this.student = options.student;
    return this.klasses = options.klasses;
  };

  StudentEditView.prototype.done = function() {
    var klassId;
    klassId = this.$el.find("#klass_select option:selected").attr("data-id");
    if (klassId === "null") {
      klassId = null;
    }
    this.student.set({
      name: this.$el.find("#name").val(),
      gender: this.$el.find("#gender").val(),
      age: this.$el.find("#age").val(),
      klassId: klassId
    });
    this.student.save();
    return this.back();
  };

  StudentEditView.prototype.back = function() {
    return window.history.back();
  };

  StudentEditView.prototype.render = function() {
    var age, gender, html, i, klass, klassId, len, name, ref;
    name = this.student.get("name") || "";
    gender = this.student.get("gender") || "";
    age = this.student.get("age") || "";
    klassId = this.student.get("klassId");
    html = "<h1>" + (t('edit student')) + "</h1> <button class='back navigation'>" + (t('back')) + "</button><br> <div class='info_box'> <div class='label_value'> <label for='name'>Full name</label> <input id='name' value='" + name + "'> </div> <div class='label_value'> <label for='gender'>" + (t('gender')) + "</label> <input id='gender' value='" + gender + "'> </div> <div class='label_value'> <label for='age'>" + (t('age')) + "</label> <input id='age' value='" + age + "'> </div> <div class='label_value'> <label for='klass_select'>" + (t('class')) + "</label><br> <select id='klass_select'>";
    html += "<option data-id='null' " + (klassId === null ? "selected='selected'" : void 0) + ">" + (t('none')) + "</option>";
    ref = this.klasses.models;
    for (i = 0, len = ref.length; i < len; i++) {
      klass = ref[i];
      html += "<option data-id='" + klass.id + "' " + (klass.id === klassId ? "selected='selected'" : void 0) + ">" + (klass.get('year')) + " - " + (klass.get('grade')) + " - " + (klass.get('stream')) + "</option>";
    }
    html += "</select> </div> <button class='done command'>" + (t('done')) + "</button> </div>";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return StudentEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3R1ZGVudC9TdHVkZW50RWRpdFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsZUFBQTtFQUFBOzs7QUFBTTs7Ozs7Ozs0QkFFSixTQUFBLEdBQVc7OzRCQUVYLE1BQUEsR0FDRTtJQUFBLGFBQUEsRUFBZ0IsTUFBaEI7SUFDQSxhQUFBLEVBQWdCLE1BRGhCOzs7NEJBR0YsVUFBQSxHQUFZLFNBQUUsT0FBRjtJQUNWLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FBTyxDQUFDO1dBQ25CLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FBTyxDQUFDO0VBRlQ7OzRCQUlaLElBQUEsR0FBTSxTQUFBO0FBQ0osUUFBQTtJQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSwrQkFBVixDQUEwQyxDQUFDLElBQTNDLENBQWdELFNBQWhEO0lBQ1YsSUFBa0IsT0FBQSxLQUFXLE1BQTdCO01BQUEsT0FBQSxHQUFVLEtBQVY7O0lBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQ0U7TUFBQSxJQUFBLEVBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsT0FBVixDQUFrQixDQUFDLEdBQW5CLENBQUEsQ0FBVjtNQUNBLE1BQUEsRUFBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxTQUFWLENBQW9CLENBQUMsR0FBckIsQ0FBQSxDQURWO01BRUEsR0FBQSxFQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE1BQVYsQ0FBaUIsQ0FBQyxHQUFsQixDQUFBLENBRlY7TUFHQSxPQUFBLEVBQVUsT0FIVjtLQURGO0lBS0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQUE7V0FDQSxJQUFDLENBQUEsSUFBRCxDQUFBO0VBVEk7OzRCQVdOLElBQUEsR0FBTSxTQUFBO1dBQ0osTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFmLENBQUE7RUFESTs7NEJBR04sTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsSUFBQSxHQUFTLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLE1BQWIsQ0FBQSxJQUEwQjtJQUNuQyxNQUFBLEdBQVMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsUUFBYixDQUFBLElBQTBCO0lBQ25DLEdBQUEsR0FBUyxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxLQUFiLENBQUEsSUFBMEI7SUFFbkMsT0FBQSxHQUFVLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLFNBQWI7SUFDVixJQUFBLEdBQU8sTUFBQSxHQUNGLENBQUMsQ0FBQSxDQUFFLGNBQUYsQ0FBRCxDQURFLEdBQ2lCLHdDQURqQixHQUUwQixDQUFDLENBQUEsQ0FBRSxNQUFGLENBQUQsQ0FGMUIsR0FFcUMsNkhBRnJDLEdBTXVCLElBTnZCLEdBTTRCLDBEQU41QixHQVNrQixDQUFDLENBQUEsQ0FBRSxRQUFGLENBQUQsQ0FUbEIsR0FTK0IscUNBVC9CLEdBVXlCLE1BVnpCLEdBVWdDLHVEQVZoQyxHQWFlLENBQUMsQ0FBQSxDQUFFLEtBQUYsQ0FBRCxDQWJmLEdBYXlCLGtDQWJ6QixHQWNzQixHQWR0QixHQWMwQixnRUFkMUIsR0FpQndCLENBQUMsQ0FBQSxDQUFFLE9BQUYsQ0FBRCxDQWpCeEIsR0FpQm9DO0lBRTNDLElBQUEsSUFBUSx5QkFBQSxHQUF5QixDQUFJLE9BQUEsS0FBVyxJQUFkLEdBQXdCLHFCQUF4QixHQUFBLE1BQUQsQ0FBekIsR0FBd0UsR0FBeEUsR0FBMEUsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFELENBQTFFLEdBQXFGO0FBQzdGO0FBQUEsU0FBQSxxQ0FBQTs7TUFDRSxJQUFBLElBQVEsbUJBQUEsR0FBb0IsS0FBSyxDQUFDLEVBQTFCLEdBQTZCLElBQTdCLEdBQWdDLENBQUksS0FBSyxDQUFDLEVBQU4sS0FBWSxPQUFmLEdBQTRCLHFCQUE1QixHQUFBLE1BQUQsQ0FBaEMsR0FBbUYsR0FBbkYsR0FBcUYsQ0FBQyxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsQ0FBRCxDQUFyRixHQUF1RyxLQUF2RyxHQUEyRyxDQUFDLEtBQUssQ0FBQyxHQUFOLENBQVUsT0FBVixDQUFELENBQTNHLEdBQThILEtBQTlILEdBQWtJLENBQUMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFWLENBQUQsQ0FBbEksR0FBc0o7QUFEaEs7SUFHQSxJQUFBLElBQVEsZ0RBQUEsR0FHd0IsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFELENBSHhCLEdBR21DO0lBSTNDLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQVY7V0FDQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFyQ007Ozs7R0ExQm9CLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N0dWRlbnQvU3R1ZGVudEVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU3R1ZGVudEVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJTdHVkZW50RWRpdFZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmRvbmUnIDogJ2RvbmUnXG4gICAgJ2NsaWNrIC5iYWNrJyA6ICdiYWNrJ1xuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG4gICAgQHN0dWRlbnQgPSBvcHRpb25zLnN0dWRlbnRcbiAgICBAa2xhc3NlcyA9IG9wdGlvbnMua2xhc3Nlc1xuXG4gIGRvbmU6IC0+XG4gICAga2xhc3NJZCA9IEAkZWwuZmluZChcIiNrbGFzc19zZWxlY3Qgb3B0aW9uOnNlbGVjdGVkXCIpLmF0dHIoXCJkYXRhLWlkXCIpXG4gICAga2xhc3NJZCA9IG51bGwgaWYga2xhc3NJZCA9PSBcIm51bGxcIlxuICAgIEBzdHVkZW50LnNldFxuICAgICAgbmFtZSAgICA6IEAkZWwuZmluZChcIiNuYW1lXCIpLnZhbCgpXG4gICAgICBnZW5kZXIgIDogQCRlbC5maW5kKFwiI2dlbmRlclwiKS52YWwoKVxuICAgICAgYWdlICAgICA6IEAkZWwuZmluZChcIiNhZ2VcIikudmFsKClcbiAgICAgIGtsYXNzSWQgOiBrbGFzc0lkXG4gICAgQHN0dWRlbnQuc2F2ZSgpXG4gICAgQGJhY2soKVxuXG4gIGJhY2s6IC0+XG4gICAgd2luZG93Lmhpc3RvcnkuYmFjaygpXG5cbiAgcmVuZGVyOiAtPlxuICAgIG5hbWUgICA9IEBzdHVkZW50LmdldChcIm5hbWVcIikgICB8fCBcIlwiXG4gICAgZ2VuZGVyID0gQHN0dWRlbnQuZ2V0KFwiZ2VuZGVyXCIpIHx8IFwiXCJcbiAgICBhZ2UgICAgPSBAc3R1ZGVudC5nZXQoXCJhZ2VcIikgICAgfHwgXCJcIlxuXG4gICAga2xhc3NJZCA9IEBzdHVkZW50LmdldChcImtsYXNzSWRcIilcbiAgICBodG1sID0gXCJcbiAgICA8aDE+I3t0KCdlZGl0IHN0dWRlbnQnKX08L2gxPlxuICAgIDxidXR0b24gY2xhc3M9J2JhY2sgbmF2aWdhdGlvbic+I3t0KCdiYWNrJyl9PC9idXR0b24+PGJyPlxuICAgIDxkaXYgY2xhc3M9J2luZm9fYm94Jz5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nbmFtZSc+RnVsbCBuYW1lPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSduYW1lJyB2YWx1ZT0nI3tuYW1lfSc+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nZ2VuZGVyJz4je3QoJ2dlbmRlcicpfTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0nZ2VuZGVyJyB2YWx1ZT0nI3tnZW5kZXJ9Jz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdhZ2UnPiN7dCgnYWdlJyl9PC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdhZ2UnIHZhbHVlPScje2FnZX0nPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2tsYXNzX3NlbGVjdCc+I3t0KCdjbGFzcycpfTwvbGFiZWw+PGJyPlxuICAgICAgICA8c2VsZWN0IGlkPSdrbGFzc19zZWxlY3QnPlwiXG4gICAgaHRtbCArPSBcIjxvcHRpb24gZGF0YS1pZD0nbnVsbCcgI3tpZiBrbGFzc0lkID09IG51bGwgdGhlbiBcInNlbGVjdGVkPSdzZWxlY3RlZCdcIn0+I3t0KCdub25lJyl9PC9vcHRpb24+XCJcbiAgICBmb3Iga2xhc3MgaW4gQGtsYXNzZXMubW9kZWxzXG4gICAgICBodG1sICs9IFwiPG9wdGlvbiBkYXRhLWlkPScje2tsYXNzLmlkfScgI3tpZiBrbGFzcy5pZCA9PSBrbGFzc0lkIHRoZW4gXCJzZWxlY3RlZD0nc2VsZWN0ZWQnXCJ9PiN7a2xhc3MuZ2V0ICd5ZWFyJ30gLSAje2tsYXNzLmdldCAnZ3JhZGUnfSAtICN7a2xhc3MuZ2V0ICdzdHJlYW0nfTwvb3B0aW9uPlwiXG5cbiAgICBodG1sICs9IFwiXG4gICAgICAgIDwvc2VsZWN0PlxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uIGNsYXNzPSdkb25lIGNvbW1hbmQnPiN7dCgnZG9uZScpfTwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICAgIFwiXG4gICAgXG4gICAgQCRlbC5odG1sIGh0bWxcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuIl19

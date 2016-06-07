var StudentListElementView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

StudentListElementView = (function(superClass) {
  extend(StudentListElementView, superClass);

  function StudentListElementView() {
    return StudentListElementView.__super__.constructor.apply(this, arguments);
  }

  StudentListElementView.prototype.className = "student_list_element";

  StudentListElementView.prototype.tagName = "li";

  StudentListElementView.prototype.events = {
    'click .edit': 'edit',
    'click .remove': 'toggleRemove',
    'click .remove_cancel': 'toggleRemove',
    'click .remove_delete': 'removeStudent'
  };

  StudentListElementView.prototype.initialize = function(options) {
    this.student = options.student;
    return this.students = options.students;
  };

  StudentListElementView.prototype.edit = function() {
    return Tangerine.router.navigate("class/student/" + this.student.id, true);
  };

  StudentListElementView.prototype.toggleRemove = function() {
    return this.$el.find(".remove_confirm, .remove").toggle();
  };

  StudentListElementView.prototype.removeStudent = function() {
    this.student.set({
      klassId: null
    }).save();
    return this.students.remove(this.student);
  };

  StudentListElementView.prototype.render = function() {
    this.$el.html((this.student.get('name')) + " " + (this.student.get('gender')) + " " + (this.student.get('age')) + " <img src='images/icon_edit.png' class='edit' title='Edit'> <img src='images/icon_delete.png' class='remove' title='Remove'> <div class='remove_confirm confirmation'> <div class='menu_box'> " + (t('remove student')) + "<br> <button class='remove_delete command_red'>" + (t('remove')) + "</button> <button class='remove_cancel command'>" + (t('cancel')) + "</button> </div> </div>");
    return this.trigger("rendered");
  };

  return StudentListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3R1ZGVudC9TdHVkZW50TGlzdEVsZW1lbnRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLHNCQUFBO0VBQUE7OztBQUFNOzs7Ozs7O21DQUVKLFNBQUEsR0FBVzs7bUNBQ1gsT0FBQSxHQUFVOzttQ0FFVixNQUFBLEdBQ0U7SUFBQSxhQUFBLEVBQXlCLE1BQXpCO0lBQ0EsZUFBQSxFQUF5QixjQUR6QjtJQUVBLHNCQUFBLEVBQXlCLGNBRnpCO0lBR0Esc0JBQUEsRUFBeUIsZUFIekI7OzttQ0FLRixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLE9BQUQsR0FBVyxPQUFPLENBQUM7V0FDbkIsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFPLENBQUM7RUFGVjs7bUNBSVosSUFBQSxHQUFTLFNBQUE7V0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLGdCQUFBLEdBQWlCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBcEQsRUFBMEQsSUFBMUQ7RUFBSDs7bUNBQ1QsWUFBQSxHQUFjLFNBQUE7V0FBRyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSwwQkFBVixDQUFxQyxDQUFDLE1BQXRDLENBQUE7RUFBSDs7bUNBQ2QsYUFBQSxHQUFlLFNBQUE7SUFDYixJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYTtNQUFBLE9BQUEsRUFBVSxJQUFWO0tBQWIsQ0FBNEIsQ0FBQyxJQUE3QixDQUFBO1dBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLElBQUMsQ0FBQSxPQUFsQjtFQUZhOzttQ0FJZixNQUFBLEdBQVEsU0FBQTtJQUNOLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUNHLENBQUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsTUFBYixDQUFELENBQUEsR0FBcUIsR0FBckIsR0FDQSxDQUFDLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLFFBQWIsQ0FBRCxDQURBLEdBQ3VCLEdBRHZCLEdBRUEsQ0FBQyxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxLQUFiLENBQUQsQ0FGQSxHQUVvQixnTUFGcEIsR0FPSSxDQUFDLENBQUEsQ0FBRSxnQkFBRixDQUFELENBUEosR0FPeUIsaURBUHpCLEdBUThDLENBQUMsQ0FBQSxDQUFFLFFBQUYsQ0FBRCxDQVI5QyxHQVEyRCxrREFSM0QsR0FTMEMsQ0FBQyxDQUFBLENBQUUsUUFBRixDQUFELENBVDFDLEdBU3VELHlCQVYxRDtXQWVBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQWhCTTs7OztHQXJCMkIsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvc3R1ZGVudC9TdHVkZW50TGlzdEVsZW1lbnRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU3R1ZGVudExpc3RFbGVtZW50VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwic3R1ZGVudF9saXN0X2VsZW1lbnRcIlxuICB0YWdOYW1lIDogXCJsaVwiXG5cbiAgZXZlbnRzIDpcbiAgICAnY2xpY2sgLmVkaXQnICAgICAgICAgIDogJ2VkaXQnXG4gICAgJ2NsaWNrIC5yZW1vdmUnICAgICAgICA6ICd0b2dnbGVSZW1vdmUnXG4gICAgJ2NsaWNrIC5yZW1vdmVfY2FuY2VsJyA6ICd0b2dnbGVSZW1vdmUnXG4gICAgJ2NsaWNrIC5yZW1vdmVfZGVsZXRlJyA6ICdyZW1vdmVTdHVkZW50J1xuICBcbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQHN0dWRlbnQgPSBvcHRpb25zLnN0dWRlbnRcbiAgICBAc3R1ZGVudHMgPSBvcHRpb25zLnN0dWRlbnRzXG4gIFxuICBlZGl0OiAgICAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiY2xhc3Mvc3R1ZGVudC8je0BzdHVkZW50LmlkfVwiLCB0cnVlXG4gIHRvZ2dsZVJlbW92ZTogLT4gQCRlbC5maW5kKFwiLnJlbW92ZV9jb25maXJtLCAucmVtb3ZlXCIpLnRvZ2dsZSgpXG4gIHJlbW92ZVN0dWRlbnQ6IC0+IFxuICAgIEBzdHVkZW50LnNldChrbGFzc0lkIDogbnVsbCkuc2F2ZSgpXG4gICAgQHN0dWRlbnRzLnJlbW92ZShAc3R1ZGVudClcblxuICByZW5kZXI6IC0+XG4gICAgQCRlbC5odG1sIFwiXG4gICAgICAje0BzdHVkZW50LmdldCAnbmFtZSd9XG4gICAgICAje0BzdHVkZW50LmdldCAnZ2VuZGVyJ31cbiAgICAgICN7QHN0dWRlbnQuZ2V0ICdhZ2UnfVxuICAgICAgPGltZyBzcmM9J2ltYWdlcy9pY29uX2VkaXQucG5nJyBjbGFzcz0nZWRpdCcgdGl0bGU9J0VkaXQnPlxuICAgICAgPGltZyBzcmM9J2ltYWdlcy9pY29uX2RlbGV0ZS5wbmcnIGNsYXNzPSdyZW1vdmUnIHRpdGxlPSdSZW1vdmUnPlxuICAgICAgPGRpdiBjbGFzcz0ncmVtb3ZlX2NvbmZpcm0gY29uZmlybWF0aW9uJz5cbiAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICN7dCgncmVtb3ZlIHN0dWRlbnQnKX08YnI+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz0ncmVtb3ZlX2RlbGV0ZSBjb21tYW5kX3JlZCc+I3t0KCdyZW1vdmUnKX08L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdyZW1vdmVfY2FuY2VsIGNvbW1hbmQnPiN7dCgnY2FuY2VsJyl9PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgXCJcbiAgICBcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiJdfQ==

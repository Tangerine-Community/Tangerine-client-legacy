var Students,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Students = (function(superClass) {
  extend(Students, superClass);

  function Students() {
    return Students.__super__.constructor.apply(this, arguments);
  }

  Students.prototype.model = Student;

  Students.prototype.url = "student";

  Students.prototype.pouch = {
    viewOptions: {
      key: 'student'
    }
  };

  Students.prototype.comparator = function(model) {
    return model.get("name").toLowerCase();
  };

  return Students;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3R1ZGVudC9TdHVkZW50cy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxRQUFBO0VBQUE7OztBQUFNOzs7Ozs7O3FCQUVKLEtBQUEsR0FBTzs7cUJBQ1AsR0FBQSxHQUFLOztxQkFFTCxLQUFBLEdBQ0U7SUFBQSxXQUFBLEVBQ0U7TUFBQSxHQUFBLEVBQU0sU0FBTjtLQURGOzs7cUJBR0YsVUFBQSxHQUFZLFNBQUMsS0FBRDtXQUNWLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixDQUFpQixDQUFDLFdBQWxCLENBQUE7RUFEVTs7OztHQVRTLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N0dWRlbnQvU3R1ZGVudHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdHVkZW50cyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICBtb2RlbDogU3R1ZGVudFxuICB1cmw6IFwic3R1ZGVudFwiXG5cbiAgcG91Y2g6XG4gICAgdmlld09wdGlvbnM6XG4gICAgICBrZXkgOiAnc3R1ZGVudCdcblxuICBjb21wYXJhdG9yOiAobW9kZWwpIC0+XG4gICAgbW9kZWwuZ2V0KFwibmFtZVwiKS50b0xvd2VyQ2FzZSgpXG4iXX0=

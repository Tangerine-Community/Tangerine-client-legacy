var Assessments,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Assessments = (function(superClass) {
  extend(Assessments, superClass);

  function Assessments() {
    return Assessments.__super__.constructor.apply(this, arguments);
  }

  Assessments.prototype.model = Assessment;

  Assessments.prototype.url = 'assessment';

  Assessments.prototype.pouch = {
    viewOptions: {
      key: 'assessment'
    }
  };

  Assessments.prototype.comparator = function(model) {
    return model.get("name");
  };

  return Assessments;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYXNzZXNzbWVudC9Bc3Nlc3NtZW50cy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxXQUFBO0VBQUE7OztBQUFNOzs7Ozs7O3dCQUNKLEtBQUEsR0FBTzs7d0JBQ1AsR0FBQSxHQUFLOzt3QkFDTCxLQUFBLEdBQ0U7SUFBQSxXQUFBLEVBQ0U7TUFBQSxHQUFBLEVBQU0sWUFBTjtLQURGOzs7d0JBR0YsVUFBQSxHQUFhLFNBQUMsS0FBRDtXQUNYLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVjtFQURXOzs7O0dBUFcsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvYXNzZXNzbWVudC9Bc3Nlc3NtZW50cy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFzc2Vzc21lbnRzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuICBtb2RlbDogQXNzZXNzbWVudFxuICB1cmw6ICdhc3Nlc3NtZW50J1xuICBwb3VjaDpcbiAgICB2aWV3T3B0aW9uczpcbiAgICAgIGtleSA6ICdhc3Nlc3NtZW50J1xuXG4gIGNvbXBhcmF0b3IgOiAobW9kZWwpIC0+XG4gICAgbW9kZWwuZ2V0IFwibmFtZVwiXG4iXX0=

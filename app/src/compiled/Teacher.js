var Teacher,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Teacher = (function(superClass) {
  extend(Teacher, superClass);

  function Teacher() {
    return Teacher.__super__.constructor.apply(this, arguments);
  }

  Teacher.prototype.url = "teacher";

  return Teacher;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvdGVhY2hlci9UZWFjaGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLE9BQUE7RUFBQTs7O0FBQU07Ozs7Ozs7b0JBQ0osR0FBQSxHQUFNOzs7O0dBRGMsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvdGVhY2hlci9UZWFjaGVyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgVGVhY2hlciBleHRlbmRzIEJhY2tib25lLk1vZGVsXG4gIHVybCA6IFwidGVhY2hlclwiIl19

var Student,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Student = (function(_super) {

  __extends(Student, _super);

  function Student() {
    Student.__super__.constructor.apply(this, arguments);
  }

  Student.prototype.url = "student";

  Student.prototype.defaults = {
    gender: "Not entered",
    age: "Not entered",
    name: "Not entered",
    klassId: null
  };

  Student.prototype.initialize = function() {};

  return Student;

})(Backbone.Model);

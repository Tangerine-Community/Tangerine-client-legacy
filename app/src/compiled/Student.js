var Student,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Student = (function(superClass) {
  extend(Student, superClass);

  function Student() {
    return Student.__super__.constructor.apply(this, arguments);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3R1ZGVudC9TdHVkZW50LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLE9BQUE7RUFBQTs7O0FBQU07Ozs7Ozs7b0JBRUosR0FBQSxHQUFNOztvQkFFTixRQUFBLEdBQ0U7SUFBQSxNQUFBLEVBQVUsYUFBVjtJQUNBLEdBQUEsRUFBVSxhQURWO0lBRUEsSUFBQSxFQUFVLGFBRlY7SUFHQSxPQUFBLEVBQVUsSUFIVjs7O29CQUtGLFVBQUEsR0FBWSxTQUFBLEdBQUE7Ozs7R0FWUSxRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9zdHVkZW50L1N0dWRlbnQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdHVkZW50IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuICB1cmwgOiBcInN0dWRlbnRcIlxuXG4gIGRlZmF1bHRzIDpcbiAgICBnZW5kZXIgIDogXCJOb3QgZW50ZXJlZFwiXG4gICAgYWdlICAgICA6IFwiTm90IGVudGVyZWRcIlxuICAgIG5hbWUgICAgOiBcIk5vdCBlbnRlcmVkXCJcbiAgICBrbGFzc0lkIDogbnVsbFxuXG4gIGluaXRpYWxpemU6IC0+Il19

var Klass,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Klass = (function(_super) {

  __extends(Klass, _super);

  function Klass() {
    Klass.__super__.constructor.apply(this, arguments);
  }

  Klass.prototype.url = "klass";

  Klass.prototype.initialize = function() {};

  Klass.prototype.destroy = function() {
    var allResults, allStudents, klassId;
    klassId = this.id;
    allStudents = new Students;
    allStudents.fetch({
      success: function(studentCollection) {
        var student, students, _i, _len, _results;
        students = studentCollection.where({
          "klassId": klassId
        });
        _results = [];
        for (_i = 0, _len = students.length; _i < _len; _i++) {
          student = students[_i];
          _results.push(student.save({
            "klassId": ""
          }));
        }
        return _results;
      }
    });
    allResults = new Results;
    allResults.fetch({
      success: function(resultCollection) {
        var result, results, _i, _len, _results;
        results = resultCollection.where({
          "klassId": klassId
        });
        _results = [];
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          result = results[_i];
          _results.push(result.destroy());
        }
        return _results;
      }
    });
    return Klass.__super__.destroy.call(this);
  };

  return Klass;

})(Backbone.Model);

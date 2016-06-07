var Klass,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Klass = (function(superClass) {
  extend(Klass, superClass);

  function Klass() {
    return Klass.__super__.constructor.apply(this, arguments);
  }

  Klass.prototype.url = "klass";

  Klass.prototype.initialize = function() {};

  Klass.prototype.destroy = function() {
    var allResults, allStudents, klassId;
    klassId = this.id;
    allStudents = new Students;
    allStudents.fetch({
      success: function(studentCollection) {
        var i, len, results1, student, students;
        students = studentCollection.where({
          "klassId": klassId
        });
        results1 = [];
        for (i = 0, len = students.length; i < len; i++) {
          student = students[i];
          results1.push(student.save({
            "klassId": ""
          }));
        }
        return results1;
      }
    });
    allResults = new Results;
    allResults.fetch({
      success: function(resultCollection) {
        var i, len, result, results, results1;
        results = resultCollection.where({
          "klassId": klassId
        });
        results1 = [];
        for (i = 0, len = results.length; i < len; i++) {
          result = results[i];
          results1.push(result.destroy());
        }
        return results1;
      }
    });
    return Klass.__super__.destroy.call(this);
  };

  Klass.prototype.calcCurrentPart = function() {
    var milliseconds, millisecondsPerDay, millisecondsPerHour, millisecondsPerMinute, millisecondsPerWeek;
    milliseconds = 1000;
    millisecondsPerMinute = 60 * milliseconds;
    millisecondsPerHour = 60 * millisecondsPerMinute;
    millisecondsPerDay = 24 * millisecondsPerHour;
    millisecondsPerWeek = 7 * millisecondsPerDay;
    return Math.round(((new Date()).getTime() - this.get("startDate")) / millisecondsPerWeek);
  };

  return Klass;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMva2xhc3MvS2xhc3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsS0FBQTtFQUFBOzs7QUFBTTs7Ozs7OztrQkFDSixHQUFBLEdBQU07O2tCQUVOLFVBQUEsR0FBWSxTQUFBLEdBQUE7O2tCQUtaLE9BQUEsR0FBUyxTQUFBO0FBRVAsUUFBQTtJQUFBLE9BQUEsR0FBVSxJQUFDLENBQUE7SUFHWCxXQUFBLEdBQWMsSUFBSTtJQUNsQixXQUFXLENBQUMsS0FBWixDQUNFO01BQUEsT0FBQSxFQUFTLFNBQUMsaUJBQUQ7QUFDUCxZQUFBO1FBQUEsUUFBQSxHQUFXLGlCQUFpQixDQUFDLEtBQWxCLENBQXdCO1VBQUEsU0FBQSxFQUFZLE9BQVo7U0FBeEI7QUFDWDthQUFBLDBDQUFBOzt3QkFDRSxPQUFPLENBQUMsSUFBUixDQUNFO1lBQUEsU0FBQSxFQUFZLEVBQVo7V0FERjtBQURGOztNQUZPLENBQVQ7S0FERjtJQU9BLFVBQUEsR0FBYSxJQUFJO0lBQ2pCLFVBQVUsQ0FBQyxLQUFYLENBQ0U7TUFBQSxPQUFBLEVBQVMsU0FBQyxnQkFBRDtBQUNQLFlBQUE7UUFBQSxPQUFBLEdBQVUsZ0JBQWdCLENBQUMsS0FBakIsQ0FBdUI7VUFBQSxTQUFBLEVBQVksT0FBWjtTQUF2QjtBQUNWO2FBQUEseUNBQUE7O3dCQUNFLE1BQU0sQ0FBQyxPQUFQLENBQUE7QUFERjs7TUFGTyxDQUFUO0tBREY7V0FNQSxpQ0FBQTtFQXBCTzs7a0JBc0JULGVBQUEsR0FBaUIsU0FBQTtBQUNmLFFBQUE7SUFBQSxZQUFBLEdBQXdCO0lBQ3hCLHFCQUFBLEdBQXdCLEVBQUEsR0FBSztJQUM3QixtQkFBQSxHQUF3QixFQUFBLEdBQUs7SUFDN0Isa0JBQUEsR0FBd0IsRUFBQSxHQUFLO0lBQzdCLG1CQUFBLEdBQXdCLENBQUEsR0FBSztBQUM3QixXQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxDQUFLLElBQUEsSUFBQSxDQUFBLENBQUwsQ0FBWSxDQUFDLE9BQWIsQ0FBQSxDQUFBLEdBQXlCLElBQUMsQ0FBQSxHQUFELENBQUssV0FBTCxDQUExQixDQUFBLEdBQStDLG1CQUExRDtFQU5ROzs7O0dBOUJDLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL2tsYXNzL0tsYXNzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgS2xhc3MgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuICB1cmwgOiBcImtsYXNzXCJcbiAgXG4gIGluaXRpYWxpemU6IC0+XG4gICAgIyBnZXQgc3R1ZGVudHNcbiAgICAjIGdldCBhc3Nlc3NtZW50IGNvbGxlY3Rpb25cblxuXG4gIGRlc3Ryb3k6IC0+XG5cbiAgICBrbGFzc0lkID0gQGlkXG5cbiAgICAjIHVubGluayBhbGwgc3R1ZGVudHNcbiAgICBhbGxTdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgIGFsbFN0dWRlbnRzLmZldGNoXG4gICAgICBzdWNjZXNzOiAoc3R1ZGVudENvbGxlY3Rpb24pIC0+XG4gICAgICAgIHN0dWRlbnRzID0gc3R1ZGVudENvbGxlY3Rpb24ud2hlcmUgXCJrbGFzc0lkXCIgOiBrbGFzc0lkXG4gICAgICAgIGZvciBzdHVkZW50IGluIHN0dWRlbnRzXG4gICAgICAgICAgc3R1ZGVudC5zYXZlXG4gICAgICAgICAgICBcImtsYXNzSWRcIiA6IFwiXCJcblxuICAgIGFsbFJlc3VsdHMgPSBuZXcgUmVzdWx0c1xuICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgIHN1Y2Nlc3M6IChyZXN1bHRDb2xsZWN0aW9uKSAtPlxuICAgICAgICByZXN1bHRzID0gcmVzdWx0Q29sbGVjdGlvbi53aGVyZSBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzXG4gICAgICAgICAgcmVzdWx0LmRlc3Ryb3koKVxuXG4gICAgc3VwZXIoKVxuXG4gIGNhbGNDdXJyZW50UGFydDogLT5cbiAgICBtaWxsaXNlY29uZHMgICAgICAgICAgPSAxMDAwXG4gICAgbWlsbGlzZWNvbmRzUGVyTWludXRlID0gNjAgKiBtaWxsaXNlY29uZHNcbiAgICBtaWxsaXNlY29uZHNQZXJIb3VyICAgPSA2MCAqIG1pbGxpc2Vjb25kc1Blck1pbnV0ZVxuICAgIG1pbGxpc2Vjb25kc1BlckRheSAgICA9IDI0ICogbWlsbGlzZWNvbmRzUGVySG91clxuICAgIG1pbGxpc2Vjb25kc1BlcldlZWsgICA9IDcgICogbWlsbGlzZWNvbmRzUGVyRGF5XG4gICAgcmV0dXJuIE1hdGgucm91bmQoKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgLSBAZ2V0KFwic3RhcnREYXRlXCIpKSAvIG1pbGxpc2Vjb25kc1BlcldlZWspXG4iXX0=

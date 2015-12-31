var Questions,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Questions = (function(superClass) {
  extend(Questions, superClass);

  function Questions() {
    return Questions.__super__.constructor.apply(this, arguments);
  }

  Questions.prototype.initialize = function() {
    return console.log("init Question.");
  };

  Questions.prototype.model = Question;

  Questions.prototype.url = "question";

  Questions.prototype.comparator = function(subtest) {
    return subtest.get("order");
  };

  Questions.prototype.ensureOrder = function() {
    var i, j, len, model, ordered, ref, results, subtest, test;
    test = ((function() {
      var j, len, ref, results;
      ref = this.models;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        model = ref[j];
        results.push(model.get("order"));
      }
      return results;
    }).call(this)).join("");
    ordered = ((function() {
      var j, len, ref, results;
      ref = this.models;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        model = ref[i];
        results.push(i);
      }
      return results;
    }).call(this)).join("");
    if (test !== ordered) {
      ref = this.models;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        subtest = ref[i];
        subtest.set("order", i);
        results.push(subtest.save());
      }
      return results;
    }
  };

  return Questions;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcXVlc3Rpb24vUXVlc3Rpb25zLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFNBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7c0JBRUosVUFBQSxHQUFZLFNBQUE7V0FDVixPQUFPLENBQUMsR0FBUixDQUFZLGdCQUFaO0VBRFU7O3NCQUtaLEtBQUEsR0FBUTs7c0JBQ1IsR0FBQSxHQUFROztzQkFFUixVQUFBLEdBQVksU0FBQyxPQUFEO1dBQ1YsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaO0VBRFU7O3NCQUlaLFdBQUEsR0FBYSxTQUFBO0FBQ1gsUUFBQTtJQUFBLElBQUEsR0FBTzs7QUFBQztBQUFBO1dBQUEscUNBQUE7O3FCQUFBLEtBQUssQ0FBQyxHQUFOLENBQVUsT0FBVjtBQUFBOztpQkFBRCxDQUF5QyxDQUFDLElBQTFDLENBQStDLEVBQS9DO0lBQ1AsT0FBQSxHQUFVOztBQUFDO0FBQUE7V0FBQSw2Q0FBQTs7cUJBQUE7QUFBQTs7aUJBQUQsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxFQUFoQztJQUNWLElBQUcsSUFBQSxLQUFRLE9BQVg7QUFDRTtBQUFBO1dBQUEsNkNBQUE7O1FBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBQXFCLENBQXJCO3FCQUNBLE9BQU8sQ0FBQyxJQUFSLENBQUE7QUFGRjtxQkFERjs7RUFIVzs7OztHQWRTLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3F1ZXN0aW9uL1F1ZXN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFF1ZXN0aW9ucyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICBpbml0aWFsaXplOiAoKSAtPlxuICAgIGNvbnNvbGUubG9nKFwiaW5pdCBRdWVzdGlvbi5cIilcbiMgICAgQXNzaWduIHRoZSBEZWZlcnJlZCBpc3N1ZWQgYnkgZmV0Y2goKSBhcyBhIHByb3BlcnR5XG4jICAgIEBkZWZlcnJlZCA9IEBmZXRjaCgpO1xuXG4gIG1vZGVsIDogUXVlc3Rpb25cbiAgdXJsICAgOiBcInF1ZXN0aW9uXCJcblxuICBjb21wYXJhdG9yOiAoc3VidGVzdCkgLT5cbiAgICBzdWJ0ZXN0LmdldCBcIm9yZGVyXCJcblxuICAjIGNhbGwgdGhpcyBhZnRlciB5b3UgbG9hZCB0aGUgY29sbGVjdGlvbiB5b3UncmUgZ29pbmcgdG8gYmUgd29ya2luZyB3aXRoXG4gIGVuc3VyZU9yZGVyOiAtPlxuICAgIHRlc3QgPSAobW9kZWwuZ2V0KFwib3JkZXJcIikgZm9yIG1vZGVsIGluIEBtb2RlbHMpLmpvaW4oXCJcIilcbiAgICBvcmRlcmVkID0gKGkgZm9yIG1vZGVsLGkgaW4gQG1vZGVscykuam9pbihcIlwiKVxuICAgIGlmIHRlc3QgIT0gb3JkZXJlZFxuICAgICAgZm9yIHN1YnRlc3QsIGkgaW4gQG1vZGVsc1xuICAgICAgICBzdWJ0ZXN0LnNldCBcIm9yZGVyXCIsIGlcbiAgICAgICAgc3VidGVzdC5zYXZlKClcbiJdfQ==

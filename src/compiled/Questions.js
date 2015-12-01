var Questions,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Questions = (function(superClass) {
  extend(Questions, superClass);

  function Questions() {
    return Questions.__super__.constructor.apply(this, arguments);
  }

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcXVlc3Rpb24vUXVlc3Rpb25zLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFNBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7c0JBRUosS0FBQSxHQUFROztzQkFDUixHQUFBLEdBQVE7O3NCQUVSLFVBQUEsR0FBWSxTQUFDLE9BQUQ7V0FDVixPQUFPLENBQUMsR0FBUixDQUFZLE9BQVo7RUFEVTs7c0JBSVosV0FBQSxHQUFhLFNBQUE7QUFDWCxRQUFBO0lBQUEsSUFBQSxHQUFPOztBQUFDO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxPQUFWO0FBQUE7O2lCQUFELENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsRUFBL0M7SUFDUCxPQUFBLEdBQVU7O0FBQUM7QUFBQTtXQUFBLDZDQUFBOztxQkFBQTtBQUFBOztpQkFBRCxDQUEwQixDQUFDLElBQTNCLENBQWdDLEVBQWhDO0lBQ1YsSUFBRyxJQUFBLEtBQVEsT0FBWDtBQUNFO0FBQUE7V0FBQSw2Q0FBQTs7UUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosRUFBcUIsQ0FBckI7cUJBQ0EsT0FBTyxDQUFDLElBQVIsQ0FBQTtBQUZGO3FCQURGOztFQUhXOzs7O0dBVFMsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvcXVlc3Rpb24vUXVlc3Rpb25zLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUXVlc3Rpb25zIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG4gIG1vZGVsIDogUXVlc3Rpb25cbiAgdXJsICAgOiBcInF1ZXN0aW9uXCJcblxuICBjb21wYXJhdG9yOiAoc3VidGVzdCkgLT5cbiAgICBzdWJ0ZXN0LmdldCBcIm9yZGVyXCJcblxuICAjIGNhbGwgdGhpcyBhZnRlciB5b3UgbG9hZCB0aGUgY29sbGVjdGlvbiB5b3UncmUgZ29pbmcgdG8gYmUgd29ya2luZyB3aXRoXG4gIGVuc3VyZU9yZGVyOiAtPlxuICAgIHRlc3QgPSAobW9kZWwuZ2V0KFwib3JkZXJcIikgZm9yIG1vZGVsIGluIEBtb2RlbHMpLmpvaW4oXCJcIilcbiAgICBvcmRlcmVkID0gKGkgZm9yIG1vZGVsLGkgaW4gQG1vZGVscykuam9pbihcIlwiKVxuICAgIGlmIHRlc3QgIT0gb3JkZXJlZFxuICAgICAgZm9yIHN1YnRlc3QsIGkgaW4gQG1vZGVsc1xuICAgICAgICBzdWJ0ZXN0LnNldCBcIm9yZGVyXCIsIGlcbiAgICAgICAgc3VidGVzdC5zYXZlKClcbiJdfQ==

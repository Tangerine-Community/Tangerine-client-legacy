var Subtests,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Subtests = (function(superClass) {
  extend(Subtests, superClass);

  function Subtests() {
    return Subtests.__super__.constructor.apply(this, arguments);
  }

  Subtests.prototype.model = Subtest;

  Subtests.prototype.pouch = {
    viewOptions: {
      key: 'subtest'
    }
  };

  Subtests.prototype.comparator = function(subtest) {
    if (subtest.has("curriculumId")) {
      return (parseInt(subtest.get("part")) * 100) + parseInt(subtest.get("order"));
    } else {
      return parseInt(subtest.get("order"));
    }
  };

  Subtests.prototype.ensureOrder = function() {
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

  return Subtests;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9TdWJ0ZXN0cy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxRQUFBO0VBQUE7OztBQUFNOzs7Ozs7O3FCQUVKLEtBQUEsR0FBTzs7cUJBQ1AsS0FBQSxHQUNFO0lBQUEsV0FBQSxFQUNFO01BQUEsR0FBQSxFQUFNLFNBQU47S0FERjs7O3FCQUlGLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFDVixJQUFHLE9BQU8sQ0FBQyxHQUFSLENBQVksY0FBWixDQUFIO0FBQ0UsYUFBTyxDQUFDLFFBQUEsQ0FBUyxPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosQ0FBVCxDQUFBLEdBQThCLEdBQS9CLENBQUEsR0FBc0MsUUFBQSxDQUFTLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWixDQUFULEVBRC9DO0tBQUEsTUFBQTtBQUdFLGFBQU8sUUFBQSxDQUFTLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWixDQUFULEVBSFQ7O0VBRFU7O3FCQU9aLFdBQUEsR0FBYSxTQUFBO0FBQ1gsUUFBQTtJQUFBLElBQUEsR0FBTzs7QUFBQztBQUFBO1dBQUEscUNBQUE7O3FCQUFBLEtBQUssQ0FBQyxHQUFOLENBQVUsT0FBVjtBQUFBOztpQkFBRCxDQUF5QyxDQUFDLElBQTFDLENBQStDLEVBQS9DO0lBQ1AsT0FBQSxHQUFVOztBQUFDO0FBQUE7V0FBQSw2Q0FBQTs7cUJBQUE7QUFBQTs7aUJBQUQsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxFQUFoQztJQUNWLElBQUcsSUFBQSxLQUFRLE9BQVg7QUFDRTtBQUFBO1dBQUEsNkNBQUE7O1FBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBQXFCLENBQXJCO3FCQUNBLE9BQU8sQ0FBQyxJQUFSLENBQUE7QUFGRjtxQkFERjs7RUFIVzs7OztHQWZRLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvU3VidGVzdHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdWJ0ZXN0cyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cbiAgXG4gIG1vZGVsOiBTdWJ0ZXN0XG4gIHBvdWNoOlxuICAgIHZpZXdPcHRpb25zOlxuICAgICAga2V5IDogJ3N1YnRlc3QnXG5cblxuICBjb21wYXJhdG9yOiAoc3VidGVzdCkgLT5cbiAgICBpZiBzdWJ0ZXN0LmhhcyhcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgcmV0dXJuIChwYXJzZUludChzdWJ0ZXN0LmdldChcInBhcnRcIikpKjEwMCkgKyBwYXJzZUludChzdWJ0ZXN0LmdldChcIm9yZGVyXCIpKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBwYXJzZUludChzdWJ0ZXN0LmdldChcIm9yZGVyXCIpKVxuXG4gICMgY2FsbCB0aGlzIGFmdGVyIHlvdSBsb2FkIHRoZSBjb2xsZWN0aW9uIHlvdSdyZSBnb2luZyB0byBiZSB3b3JraW5nIHdpdGhcbiAgZW5zdXJlT3JkZXI6IC0+XG4gICAgdGVzdCA9IChtb2RlbC5nZXQoXCJvcmRlclwiKSBmb3IgbW9kZWwgaW4gQG1vZGVscykuam9pbihcIlwiKVxuICAgIG9yZGVyZWQgPSAoaSBmb3IgbW9kZWwsaSBpbiBAbW9kZWxzKS5qb2luKFwiXCIpXG4gICAgaWYgdGVzdCAhPSBvcmRlcmVkXG4gICAgICBmb3Igc3VidGVzdCwgaSBpbiBAbW9kZWxzXG4gICAgICAgIHN1YnRlc3Quc2V0IFwib3JkZXJcIiwgaVxuICAgICAgICBzdWJ0ZXN0LnNhdmUoKVxuICBcbiJdfQ==

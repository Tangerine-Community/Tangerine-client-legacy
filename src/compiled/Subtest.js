var Subtest,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Subtest = (function(superClass) {
  extend(Subtest, superClass);

  function Subtest() {
    return Subtest.__super__.constructor.apply(this, arguments);
  }

  Subtest.prototype.url = "subtest";

  return Subtest;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9TdWJ0ZXN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLE9BQUE7RUFBQTs7O0FBQU07Ozs7Ozs7b0JBRUosR0FBQSxHQUFLOzs7O0dBRmUsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvc3VidGVzdC9TdWJ0ZXN0LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU3VidGVzdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cbiAgdXJsOiBcInN1YnRlc3RcIlxuXG4iXX0=

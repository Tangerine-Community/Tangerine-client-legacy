var ResultPreview,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ResultPreview = (function(superClass) {
  extend(ResultPreview, superClass);

  function ResultPreview() {
    return ResultPreview.__super__.constructor.apply(this, arguments);
  }

  return ResultPreview;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVzdWx0L1Jlc3VsdFByZXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsYUFBQTtFQUFBOzs7QUFBTTs7Ozs7Ozs7O0dBQXNCLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3Jlc3VsdC9SZXN1bHRQcmV2aWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUmVzdWx0UHJldmlldyBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cbiJdfQ==

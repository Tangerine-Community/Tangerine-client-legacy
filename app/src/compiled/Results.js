var Results,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Results = (function(superClass) {
  extend(Results, superClass);

  function Results() {
    return Results.__super__.constructor.apply(this, arguments);
  }

  Results.prototype.url = 'result';

  Results.prototype.model = Result;

  Results.prototype.pouch = {
    viewOptions: {
      key: 'result'
    }
  };

  Results.prototype.comparator = function(model) {
    return model.get('start_time') || 0;
  };

  Results.prototype.fetch = function(options) {
    if (options == null) {
      options = {};
    }
    if (options.include_docs == null) {
      options.include_docs = true;
    }
    return Results.__super__.fetch.call(this, options);
  };

  return Results;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVzdWx0L1Jlc3VsdHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsT0FBQTtFQUFBOzs7QUFBTTs7Ozs7OztvQkFDSixHQUFBLEdBQU07O29CQUNOLEtBQUEsR0FBUTs7b0JBRVIsS0FBQSxHQUNFO0lBQUEsV0FBQSxFQUNFO01BQUEsR0FBQSxFQUFNLFFBQU47S0FERjs7O29CQUdGLFVBQUEsR0FBWSxTQUFDLEtBQUQ7V0FDVixLQUFLLENBQUMsR0FBTixDQUFVLFlBQVYsQ0FBQSxJQUEyQjtFQURqQjs7b0JBSVosS0FBQSxHQUFPLFNBQUMsT0FBRDtJQUNMLElBQW9CLGVBQXBCO01BQUEsT0FBQSxHQUFVLEdBQVY7O0lBQ0EsSUFBbUMsNEJBQW5DO01BQUEsT0FBTyxDQUFDLFlBQVIsR0FBdUIsS0FBdkI7O1dBQ0EsbUNBQU0sT0FBTjtFQUhLOzs7O0dBWmEsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvcmVzdWx0L1Jlc3VsdHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSZXN1bHRzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuICB1cmwgOiAncmVzdWx0J1xuICBtb2RlbCA6IFJlc3VsdFxuXG4gIHBvdWNoOlxuICAgIHZpZXdPcHRpb25zOlxuICAgICAga2V5IDogJ3Jlc3VsdCdcblxuICBjb21wYXJhdG9yOiAobW9kZWwpIC0+XG4gICAgbW9kZWwuZ2V0KCdzdGFydF90aW1lJykgfHwgMFxuXG4gICMgQnkgZGVmYXVsdCBpbmNsdWRlIHRoZSBkb2NzXG4gIGZldGNoOiAob3B0aW9ucykgLT5cbiAgICBvcHRpb25zID0ge30gdW5sZXNzIG9wdGlvbnM/XG4gICAgb3B0aW9ucy5pbmNsdWRlX2RvY3MgPSB0cnVlIHVubGVzcyBvcHRpb25zLmluY2x1ZGVfZG9jcz9cbiAgICBzdXBlcihvcHRpb25zKVxuIl19

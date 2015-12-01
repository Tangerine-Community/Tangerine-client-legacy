var ResultPreviews,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ResultPreviews = (function(superClass) {
  extend(ResultPreviews, superClass);

  function ResultPreviews() {
    return ResultPreviews.__super__.constructor.apply(this, arguments);
  }

  ResultPreviews.prototype.url = 'result';

  ResultPreviews.prototype.model = ResultPreview;

  ResultPreviews.prototype.pouch = {
    viewOptions: {
      include_docs: false,
      key: 'result'
    }
  };

  ResultPreviews.prototype.parse = function(response) {
    var models;
    models = _.pluck(response.rows, 'value');
    return models;
  };

  ResultPreviews.prototype.comparator = 'startTime';

  ResultPreviews.prototype.fetch = function(options) {
    if (options == null) {
      options = {};
    }
    if (options.include_docs == null) {
      options.include_docs = true;
    }
    return ResultPreviews.__super__.fetch.call(this, options);
  };

  return ResultPreviews;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVzdWx0L1Jlc3VsdFByZXZpZXdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGNBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7MkJBRUosR0FBQSxHQUFNOzsyQkFDTixLQUFBLEdBQVE7OzJCQUVSLEtBQUEsR0FDRTtJQUFBLFdBQUEsRUFDRTtNQUFBLFlBQUEsRUFBYyxLQUFkO01BQ0EsR0FBQSxFQUFNLFFBRE47S0FERjs7OzJCQUlGLEtBQUEsR0FBTyxTQUFDLFFBQUQ7QUFDTCxRQUFBO0lBQUEsTUFBQSxHQUFTLENBQUMsQ0FBQyxLQUFGLENBQVEsUUFBUSxDQUFDLElBQWpCLEVBQXVCLE9BQXZCO0FBQ1QsV0FBTztFQUZGOzsyQkFJUCxVQUFBLEdBQVk7OzJCQUdaLEtBQUEsR0FBTyxTQUFDLE9BQUQ7SUFDTCxJQUFvQixlQUFwQjtNQUFBLE9BQUEsR0FBVSxHQUFWOztJQUNBLElBQW1DLDRCQUFuQztNQUFBLE9BQU8sQ0FBQyxZQUFSLEdBQXVCLEtBQXZCOztXQUNBLDBDQUFNLE9BQU47RUFISzs7OztHQWpCb0IsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvcmVzdWx0L1Jlc3VsdFByZXZpZXdzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUmVzdWx0UHJldmlld3MgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbiAgdXJsIDogJ3Jlc3VsdCdcbiAgbW9kZWwgOiBSZXN1bHRQcmV2aWV3XG5cbiAgcG91Y2g6XG4gICAgdmlld09wdGlvbnM6XG4gICAgICBpbmNsdWRlX2RvY3M6IGZhbHNlXG4gICAgICBrZXkgOiAncmVzdWx0J1xuXG4gIHBhcnNlOiAocmVzcG9uc2UpIC0+XG4gICAgbW9kZWxzID0gXy5wbHVjayByZXNwb25zZS5yb3dzLCAndmFsdWUnXG4gICAgcmV0dXJuIG1vZGVsc1xuXG4gIGNvbXBhcmF0b3I6ICdzdGFydFRpbWUnXG5cbiAgIyBCeSBkZWZhdWx0IGluY2x1ZGUgdGhlIGRvY3NcbiAgZmV0Y2g6IChvcHRpb25zKSAtPlxuICAgIG9wdGlvbnMgPSB7fSB1bmxlc3Mgb3B0aW9ucz9cbiAgICBvcHRpb25zLmluY2x1ZGVfZG9jcyA9IHRydWUgdW5sZXNzIG9wdGlvbnMuaW5jbHVkZV9kb2NzP1xuICAgIHN1cGVyKG9wdGlvbnMpXG4iXX0=

var KlassResults,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassResults = (function(superClass) {
  extend(KlassResults, superClass);

  function KlassResults() {
    return KlassResults.__super__.constructor.apply(this, arguments);
  }

  KlassResults.prototype.url = "result";

  KlassResults.prototype.model = KlassResult;

  KlassResults.prototype.pouch = {
    viewOptions: {
      key: 'result'
    }
  };

  KlassResults.prototype.initialize = function(options) {
    if (options == null) {
      options = {};
    }
    if (!((options.showOld != null) && options.showOld === true)) {
      return this.on("all", (function(_this) {
        return function(event) {
          var i, j, len, len1, ref, result, resultId, results, toRemove;
          toRemove = [];
          ref = _this.models;
          for (i = 0, len = ref.length; i < len; i++) {
            result = ref[i];
            if (result.has("old")) {
              toRemove.push(result.id);
            }
          }
          results = [];
          for (j = 0, len1 = toRemove.length; j < len1; j++) {
            resultId = toRemove[j];
            results.push(_this.remove(resultId, {
              silent: true
            }));
          }
          return results;
        };
      })(this));
    }
  };

  return KlassResults;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMva2xhc3MvS2xhc3NSZXN1bHRzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFlBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7eUJBRUosR0FBQSxHQUFLOzt5QkFDTCxLQUFBLEdBQU87O3lCQUNQLEtBQUEsR0FDRTtJQUFBLFdBQUEsRUFDRTtNQUFBLEdBQUEsRUFBTSxRQUFOO0tBREY7Ozt5QkFHRixVQUFBLEdBQVksU0FBQyxPQUFEOztNQUFDLFVBQVU7O0lBQ3JCLElBQUEsQ0FBQSxDQUFPLHlCQUFBLElBQW9CLE9BQU8sQ0FBQyxPQUFSLEtBQW1CLElBQTlDLENBQUE7YUFDRSxJQUFDLENBQUEsRUFBRCxDQUFJLEtBQUosRUFBVyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUNULGNBQUE7VUFBQSxRQUFBLEdBQVc7QUFDWDtBQUFBLGVBQUEscUNBQUE7O1lBQ0UsSUFBMkIsTUFBTSxDQUFDLEdBQVAsQ0FBVyxLQUFYLENBQTNCO2NBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxNQUFNLENBQUMsRUFBckIsRUFBQTs7QUFERjtBQUVBO2VBQUEsNENBQUE7O3lCQUNFLEtBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixFQUFrQjtjQUFBLE1BQUEsRUFBUSxJQUFSO2FBQWxCO0FBREY7O1FBSlM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsRUFERjs7RUFEVTs7OztHQVJhLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL2tsYXNzL0tsYXNzUmVzdWx0cy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEtsYXNzUmVzdWx0cyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICB1cmw6IFwicmVzdWx0XCJcbiAgbW9kZWw6IEtsYXNzUmVzdWx0XG4gIHBvdWNoOlxuICAgIHZpZXdPcHRpb25zOlxuICAgICAga2V5IDogJ3Jlc3VsdCdcblxuICBpbml0aWFsaXplOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgIHVubGVzcyBvcHRpb25zLnNob3dPbGQ/ICYmIG9wdGlvbnMuc2hvd09sZCA9PSB0cnVlXG4gICAgICBAb24gXCJhbGxcIiwgKGV2ZW50KSA9PlxuICAgICAgICB0b1JlbW92ZSA9IFtdXG4gICAgICAgIGZvciByZXN1bHQgaW4gQG1vZGVsc1xuICAgICAgICAgIHRvUmVtb3ZlLnB1c2ggcmVzdWx0LmlkIGlmIHJlc3VsdC5oYXMoXCJvbGRcIilcbiAgICAgICAgZm9yIHJlc3VsdElkIGluIHRvUmVtb3ZlXG4gICAgICAgICAgQHJlbW92ZShyZXN1bHRJZCwgc2lsZW50OiB0cnVlKSBcbiJdfQ==

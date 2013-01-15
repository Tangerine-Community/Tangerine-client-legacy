var KlassResults,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassResults = (function(_super) {

  __extends(KlassResults, _super);

  function KlassResults() {
    KlassResults.__super__.constructor.apply(this, arguments);
  }

  KlassResults.prototype.url = "result";

  KlassResults.prototype.model = KlassResult;

  KlassResults.prototype.initialize = function(options) {
    var _this = this;
    if (!((options.showOld != null) && options.showOld === true)) {
      return this.on("all", function(event) {
        var result, resultId, toRemove, _i, _j, _len, _len2, _ref, _results;
        toRemove = [];
        _ref = _this.models;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          result = _ref[_i];
          if (result.has("old")) toRemove.push(result.id);
        }
        _results = [];
        for (_j = 0, _len2 = toRemove.length; _j < _len2; _j++) {
          resultId = toRemove[_j];
          _results.push(_this.remove(resultId, {
            silent: true
          }));
        }
        return _results;
      });
    }
  };

  return KlassResults;

})(Backbone.Collection);

var KlassResults,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassResults = (function(_super) {

  __extends(KlassResults, _super);

  function KlassResults() {
    KlassResults.__super__.constructor.apply(this, arguments);
  }

  KlassResults.prototype.url = "result";

  KlassResults.prototype.model = Result;

  return KlassResults;

})(Backbone.Collection);

var KlassResult,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassResult = (function(_super) {

  __extends(KlassResult, _super);

  function KlassResult() {
    KlassResult.__super__.constructor.apply(this, arguments);
  }

  KlassResult.prototype.url = "result";

  KlassResult.prototype.initialize = function(options) {
    this.studentId = options.studentId;
    this.klassId = options.klassId;
    this.subtestId = options.subtestId;
    return this.set({
      'timestamp': (new Date()).getTime(),
      'studentId': this.studentId,
      'subtestId': this.subtestId,
      'klassId': this.klassId
    });
  };

  KlassResult.prototype.add = function(subtestDataElement) {
    return this.save({
      'subtestData': subtestDataElement
    });
  };

  return KlassResult;

})(Backbone.Model);

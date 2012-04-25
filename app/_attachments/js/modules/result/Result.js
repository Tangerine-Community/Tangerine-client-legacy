var Result,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Result = (function(_super) {
  var defaults;

  __extends(Result, _super);

  function Result() {
    Result.__super__.constructor.apply(this, arguments);
  }

  Result.prototype.url = "/result";

  defaults = {
    assessment: "none",
    subtestData: []
  };

  Result.prototype.initialize = function(options) {
    var _ref, _ref2;
    return this.set({
      assessment: (_ref = options != null ? options.assessment : void 0) != null ? _ref : defaults.assessment,
      subtestData: (_ref2 = options != null ? options.subtestData : void 0) != null ? _ref2 : defaults.subtestData
    });
  };

  Result.prototype.add = function(name, data) {
    var subtestDataElement;
    subtestDataElement = {
      "name": name,
      "data": data
    };
    return this.set('subtestData', this.get('subtestData').push(subtestDataElement));
  };

  return Result;

})(Backbone.Model);

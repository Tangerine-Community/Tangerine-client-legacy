var Log,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Log = (function(_super) {

  __extends(Log, _super);

  function Log() {
    Log.__super__.constructor.apply(this, arguments);
  }

  Log.prototype.url = "log";

  Log.prototype.defaults = {
    type: "none",
    event: "none",
    timestamp: 0,
    user: "no one"
  };

  Log.prototype.initialize = function(options) {
    this.set({
      options: options,
      timestamp: (new Date()).getTime(),
      user: Tangerine.user.name
    });
    return this.save();
  };

  return Log;

})(Backbone.Model);

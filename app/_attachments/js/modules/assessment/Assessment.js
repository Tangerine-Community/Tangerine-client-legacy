var Assessment,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Assessment = (function(_super) {

  __extends(Assessment, _super);

  function Assessment() {
    Assessment.__super__.constructor.apply(this, arguments);
  }

  Assessment.prototype.url = '/assessment';

  Assessment.prototype.defaults = {
    name: "Untitled",
    group: "default",
    author: "admin",
    subtests: []
  };

  Assessment.prototype.initialize = function(options) {
    var _ref, _ref2, _ref3, _ref4;
    return this.set({
      name: (_ref = options != null ? options.name : void 0) != null ? _ref : this.defaults.name,
      group: (_ref2 = options != null ? options.group : void 0) != null ? _ref2 : this.defaults.group,
      author: (_ref3 = options != null ? options.author : void 0) != null ? _ref3 : this.defaults.author,
      subtests: (_ref4 = options != null ? options.subtests : void 0) != null ? _ref4 : this.defaults.subtests
    });
  };

  Assessment.prototype.fetch = function(options) {
    Assessment.__super__.fetch.call(this, options);
    return subtests;
  };

  return Assessment;

})(Backbone.Model);

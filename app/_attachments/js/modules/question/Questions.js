var Questions,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Questions = (function(_super) {

  __extends(Questions, _super);

  function Questions() {
    Questions.__super__.constructor.apply(this, arguments);
  }

  Questions.prototype.model = Question;

  Questions.prototype.url = "question";

  Questions.prototype.comparator = function(subtest) {
    return subtest.get("order");
  };

  return Questions;

})(Backbone.Collection);

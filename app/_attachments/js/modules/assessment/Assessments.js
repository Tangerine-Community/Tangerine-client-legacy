var AssessmentCollection,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentCollection = (function(_super) {

  __extends(AssessmentCollection, _super);

  function AssessmentCollection() {
    AssessmentCollection.__super__.constructor.apply(this, arguments);
  }

  AssessmentCollection.prototype.model = Assessment;

  AssessmentCollection.prototype.url = '/assessment';

  AssessmentCollection.prototype.initialize = function(options) {
    if (options != null ? options.group : void 0) {
      return this.group = options.group;
    }
  };

  return AssessmentCollection;

})(Backbone.Collection);

var Assessment,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Assessment = (function(_super) {

  __extends(Assessment, _super);

  function Assessment() {
    this.superFetch = __bind(this.superFetch, this);
    Assessment.__super__.constructor.apply(this, arguments);
  }

  Assessment.prototype.url = 'assessment';

  Assessment.prototype.defaults = {
    name: "Untitled",
    group: "default"
  };

  Assessment.prototype.initialize = function(options) {
    if (options == null) options = {};
    return this.subtests = new Subtests;
  };

  Assessment.prototype.fetch = function(options) {
    var allAssessments,
      _this = this;
    if (options.name != null) options.name = Utils.cleanURL(options.name);
    allAssessments = new Assessments;
    return allAssessments.fetch({
      success: function(collection) {
        var allSubtests, assessment, results, _i, _len;
        results = collection.where({
          "name": options.name
        });
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          assessment = results[_i];
          if (Tangerine.context.server) {
            if (~Tangerine.user.groups.indexOf(assessment.get("group"))) {
              _this.constructor(assessment.attributes);
            }
          } else {
            _this.constructor(assessment.attributes);
          }
        }
        allSubtests = new Subtests;
        return allSubtests.fetch({
          success: function(collection) {
            _this.subtests = new Subtests(collection.where({
              'assessmentId': _this.id
            }));
            _this.subtests.maintainOrder();
            return options.success(_this);
          }
        });
      }
    });
  };

  Assessment.prototype.superFetch = function(options) {
    var allSubtests,
      _this = this;
    return Assessment.__super__.fetch.call(this, {
      success: function(model) {}
    }, allSubtests = new Subtests, allSubtests.fetch({
      success: function(collection) {
        _this.subtests = new Subtests(collection.where({
          'assessmentId': _this.id
        }));
        _this.subtests.maintainOrder();
        return options.success(_this);
      }
    }));
  };

  return Assessment;

})(Backbone.Model);

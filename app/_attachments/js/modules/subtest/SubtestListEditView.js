var SubtestListEditView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SubtestListEditView = (function(_super) {

  __extends(SubtestListEditView, _super);

  function SubtestListEditView() {
    this.deleteSubtest = __bind(this.deleteSubtest, this);
    this.render = __bind(this.render, this);
    SubtestListEditView.__super__.constructor.apply(this, arguments);
  }

  SubtestListEditView.prototype.tagName = "ul";

  SubtestListEditView.prototype.initialize = function(options) {
    this.assessment = options.assessment;
    return this.views = [];
  };

  SubtestListEditView.prototype.render = function() {
    var _this = this;
    this.closeViews();
    this.assessment.subtests.sort();
    return this.assessment.subtests.each(function(subtest) {
      var oneView;
      oneView = new SubtestListElementView({
        "subtest": subtest,
        "group": _this.assessment.get("group")
      });
      _this.views.push(oneView);
      oneView.render();
      oneView.on("subtest:delete", _this.deleteSubtest);
      return _this.$el.append(oneView.el);
    });
  };

  SubtestListEditView.prototype.deleteSubtest = function(subtest) {
    this.assessment.subtests.remove(subtest);
    return subtest.destroy();
  };

  SubtestListEditView.prototype.closeViews = function() {
    var view, _i, _len, _ref;
    _ref = this.views;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      view.close();
    }
    return this.views = [];
  };

  return SubtestListEditView;

})(Backbone.View);

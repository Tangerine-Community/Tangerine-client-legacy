var CurriculaListView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

CurriculaListView = (function(_super) {

  __extends(CurriculaListView, _super);

  function CurriculaListView() {
    this.render = __bind(this.render, this);
    CurriculaListView.__super__.constructor.apply(this, arguments);
  }

  CurriculaListView.prototype.tagName = "ul";

  CurriculaListView.prototype.initialize = function(options) {
    var _base;
    this.views = [];
    this.curricula = options.curricula;
    return typeof (_base = this.curricula).on === "function" ? _base.on("all", this.render) : void 0;
  };

  CurriculaListView.prototype.render = function() {
    var _this = this;
    this.closeViews;
    this.curricula.each(function(curriculum) {
      var view;
      view = new CurriculumListElementView({
        "curriculum": curriculum
      });
      view.render();
      _this.$el.append(view.el);
      return _this.views.push(view);
    });
    return this.trigger("rendered");
  };

  CurriculaListView.prototype.onClose = function() {
    return this.closeViews();
  };

  CurriculaListView.prototype.closeViews = function() {
    var view, _i, _len, _ref, _results;
    _ref = this.views;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      _results.push(typeof view.close === "function" ? view.close() : void 0);
    }
    return _results;
  };

  return CurriculaListView;

})(Backbone.View);

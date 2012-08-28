var CurriculumListElementView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

CurriculumListElementView = (function(_super) {

  __extends(CurriculumListElementView, _super);

  function CurriculumListElementView() {
    CurriculumListElementView.__super__.constructor.apply(this, arguments);
  }

  CurriculumListElementView.prototype.tagName = "li";

  CurriculumListElementView.prototype.events = {
    'click div': 'gotoDetails'
  };

  CurriculumListElementView.prototype.gotoDetails = function() {
    return Tangerine.router.navigate("curriculum/" + this.curriculum.id, true);
  };

  CurriculumListElementView.prototype.initialize = function(options) {
    this.curriculum = options.curriculum;
    this.subtests = options.subtests;
    return window.te = this.$el;
  };

  CurriculumListElementView.prototype.render = function() {
    var name;
    name = this.curriculum.escape('name');
    this.$el.html("<div><span class='icon_ryte'> </span> " + name + "</div>");
    return this.trigger("rendered");
  };

  return CurriculumListElementView;

})(Backbone.View);

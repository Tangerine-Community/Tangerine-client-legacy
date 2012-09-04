var CurriculumView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

CurriculumView = (function(_super) {

  __extends(CurriculumView, _super);

  function CurriculumView() {
    CurriculumView.__super__.constructor.apply(this, arguments);
  }

  CurriculumView.prototype.events = {
    "click .back": "goBack"
  };

  CurriculumView.prototype.goBack = function() {
    return history.back();
  };

  CurriculumView.prototype.initialize = function(options) {};

  CurriculumView.prototype.render = function() {
    this.$el.html("    <button class='navigation back'>" + (t('back')) + "</button>    <h1>" + (this.options.curriculum.get('name')) + "</h1>        <div class='label_value'>      <label>" + (t('total subtests')) + "</label><br>      <div class='info_box'>" + this.options.subtests.length + "</div>    </div>        <div class='label_value'>      <label>" + (t('total assessments')) + "</label><br>      <div class='info_box'>" + this.options.parts + "</div>    </div>    <div class='label_value'>      <label>" + (t('download key')) + "</label><br>      <div class='info_box'>" + (this.options.curriculum.id.substr(-5, 5)) + "</div>    </div>    </table>");
    return this.trigger("rendered");
  };

  return CurriculumView;

})(Backbone.View);

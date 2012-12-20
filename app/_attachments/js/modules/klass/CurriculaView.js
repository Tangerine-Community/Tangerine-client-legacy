var CurriculaView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

CurriculaView = (function(_super) {

  __extends(CurriculaView, _super);

  function CurriculaView() {
    CurriculaView.__super__.constructor.apply(this, arguments);
  }

  CurriculaView.prototype.events = {
    'click .import': 'gotoImport',
    'click .back': 'goBack'
  };

  CurriculaView.prototype.goBack = function() {
    return history.back();
  };

  CurriculaView.prototype.gotoImport = function() {
    return Tangerine.router.navigate("curriculumImport", true);
  };

  CurriculaView.prototype.initialize = function(options) {
    var _this = this;
    this.subView = new CurriculaListView({
      curricula: options.curricula
    });
    return options.curricula.on("all", function() {
      return _this.subView.render();
    });
  };

  CurriculaView.prototype.render = function() {
    this.$el.html("    <button class='back navigation'>" + (t('back')) + "</button><br>    <button class='command import'>" + (t('import')) + "</button>    <br>    <div id='klass_list'></div>    ");
    this.subView.setElement(this.$el.find('#klass_list'));
    return this.trigger("rendered");
  };

  CurriculaView.prototype.onClose = function() {
    var _ref;
    return (_ref = this.subView) != null ? _ref.close() : void 0;
  };

  return CurriculaView;

})(Backbone.View);

var KlassListElementView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassListElementView = (function(_super) {

  __extends(KlassListElementView, _super);

  function KlassListElementView() {
    this.render = __bind(this.render, this);
    KlassListElementView.__super__.constructor.apply(this, arguments);
  }

  KlassListElementView.prototype.tagName = "li";

  KlassListElementView.prototype.events = {
    'click .run': 'run',
    'click .edit': 'edit',
    'click .delete': 'toggleDelete',
    'click .delete_cancel': 'toggleDelete',
    'click .delete_delete': 'delete'
  };

  KlassListElementView.prototype.initialize = function(options) {
    if (options.klass.has("curriculumId")) {
      this.curriculum = new Curriculum({
        "_id": options.klass.get("curriculumId" || "")
      });
      return this.curriculum.fetch({
        success: this.render
      });
    } else {
      return this.curriculum = new Curriculum;
    }
  };

  KlassListElementView.prototype.edit = function() {
    return Tangerine.router.navigate("class/edit/" + this.options.klass.id, true);
  };

  KlassListElementView.prototype.results = function() {
    return Tangerine.router.navigate("class/results/" + this.options.klass.id, true);
  };

  KlassListElementView.prototype.run = function() {
    return Tangerine.router.navigate("class/" + this.options.klass.id, true);
  };

  KlassListElementView.prototype.toggleDelete = function() {
    return this.$el.find(".delete_confirm").toggle();
  };

  KlassListElementView.prototype["delete"] = function() {
    return this.options.klass.collection.get(this.options.klass).destroy();
  };

  KlassListElementView.prototype.render = function() {
    var klass;
    klass = this.options.klass;
    return this.$el.html("      <small>Year:</small> " + (klass.get('year')) + " -      <small>Grade:</small> " + (klass.get('grade')) + " -      <small>Stream:</small>" + (klass.get('stream')) + "<br>      <small>Curriculum:</small>" + (this.curriculum.escape('name' || "")) + "<br>      <img src='images/icon_run.png' class='run'>      <img src='images/icon_results.png' class='results'>      <img src='images/icon_edit.png' class='edit'>      <img src='images/icon_delete.png' class='delete'>      <div class='delete_confirm confirmation'>      <div class='menu_box'>        Confirm<br>        <button class='delete_delete command_red'>Delete</button>        <button class='delete_cancel command'>Cancel</button>      </div>      </div>    ");
  };

  return KlassListElementView;

})(Backbone.View);

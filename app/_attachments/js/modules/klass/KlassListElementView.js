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
    'click .results': 'showReportSelect',
    'change #report': 'getReportMenu',
    'click .cancel_report': 'cancelReport',
    'click .edit': 'edit',
    'click .delete': 'toggleDelete',
    'click .delete_cancel': 'toggleDelete',
    'click .delete_delete': 'delete'
  };

  KlassListElementView.prototype.initialize = function(options) {
    this.availableReports = Tangerine.config.reports;
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

  KlassListElementView.prototype.getReportMenu = function(event) {
    var _ref;
    if ((_ref = this.subMenuView) != null) _ref.close();
    this.subMenuView = new window[$(event.target).find(":selected").attr("data-menu_view")]({
      parent: this
    });
    this.$el.find("#report_menu_container").append("<div class='report_menu'></div>");
    this.subMenuView.setElement(this.$el.find("#report_menu_container .report_menu"));
    return this.subMenuView.render();
  };

  KlassListElementView.prototype.showReportSelect = function() {
    return this.$el.find(".report_select_container").removeClass("confirmation");
  };

  KlassListElementView.prototype.cancelReport = function() {
    var _ref;
    this.$el.find('div#report_menu').empty();
    this.$el.find('#report :nth-child(1)').attr('selected', 'selected');
    this.$el.find(".report_select_container").addClass("confirmation");
    return (_ref = this.subMenuView) != null ? _ref.close() : void 0;
  };

  KlassListElementView.prototype.onClose = function() {
    var _ref;
    return (_ref = this.subMenuView) != null ? _ref.close() : void 0;
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
    var klass, report;
    klass = this.options.klass;
    this.$el.html("      <table>        <tr><td><small>" + (t('year')) + "</small></td><td>" + (klass.get('year')) + "</td></tr>        <tr><td><small>" + (t('grade')) + "</small></td><td>" + (klass.get('grade')) + "</td></tr>        <tr><td><small>" + (t('stream')) + "</small></td><td>" + (klass.get('stream')) + "</td></tr>        <tr><td><small>" + (t('curriculum')) + "</small></td><td>" + (this.curriculum.escape('name' || "")) + "</td></tr>      </table>      <img src='images/icon_run.png'     class='run'>      <img src='images/icon_results.png' class='results'>      <img src='images/icon_edit.png'    class='edit'>      <img src='images/icon_delete.png'  class='delete'>      <div class='report_select_container confirmation'>        <div class='menu_box'>          <select id='report'>            <option selected='selected' disabled='disabled'>" + (t('select report type')) + "</option>            " + (((function() {
      var _i, _len, _ref, _results;
      _ref = this.availableReports;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        report = _ref[_i];
        _results.push("<option data-menu_view='" + report.menuView + "'>" + (t(report.name)) + "</option>");
      }
      return _results;
    }).call(this)).join("")) + "          </select>        </div>        <div id='report_menu_container'></div>        <button class='command cancel_report'>" + (t('cancel')) + "</button>      </div>      <div class='delete_confirm confirmation'>        <div class='menu_box'>          " + (t('confirm')) + "<br>          <button class='delete_delete command_red'>" + (t('delete')) + "</button>          <button class='delete_cancel command'>" + (t('cancel')) + "</button>        </div>      </div>    ");
    return this.trigger("rendered");
  };

  return KlassListElementView;

})(Backbone.View);

var MasteryCheckMenuView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

MasteryCheckMenuView = (function(_super) {

  __extends(MasteryCheckMenuView, _super);

  function MasteryCheckMenuView() {
    MasteryCheckMenuView.__super__.constructor.apply(this, arguments);
  }

  MasteryCheckMenuView.prototype.events = {
    'change .student_selector': 'gotoMasteryCheckReport'
  };

  MasteryCheckMenuView.prototype.gotoMasteryCheckReport = function(event) {
    return Tangerine.router.navigate("report/masteryCheck/" + this.$el.find(event.target).find(":selected").attr("data-studentId"), true);
  };

  MasteryCheckMenuView.prototype.initialize = function(options) {
    var allStudents,
      _this = this;
    this.parent = options.parent;
    this.klass = this.parent.options.klass;
    this.curricula = this.parent.options.curricula;
    allStudents = new Students;
    return allStudents.fetch({
      success: function(collection) {
        _this.students = collection.where({
          klassId: _this.klass.id
        });
        _this.ready = true;
        return _this.render();
      }
    });
  };

  MasteryCheckMenuView.prototype.render = function() {
    var html, student, _i, _len, _ref;
    if (this.ready) {
      html = "        <select class='student_selector'>          <option disabled='disabled' selected='selected'>" + (t('select a student')) + "</option>          ";
      _ref = this.students;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        student = _ref[_i];
        html += "<option data-studentId='" + student.id + "'>" + (student.get('name')) + "</option>";
      }
      html += "</select>";
      return this.$el.html(html);
    } else {
      return this.$el.html("<img src='images/loading.gif' class='loading'>");
    }
  };

  return MasteryCheckMenuView;

})(Backbone.View);

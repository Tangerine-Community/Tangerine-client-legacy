var StudentListElementView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

StudentListElementView = (function(_super) {

  __extends(StudentListElementView, _super);

  function StudentListElementView() {
    StudentListElementView.__super__.constructor.apply(this, arguments);
  }

  StudentListElementView.prototype.tagName = "li";

  StudentListElementView.prototype.className = "student_list_element";

  StudentListElementView.prototype.events = {
    'click .results': 'results',
    'click .edit': 'edit',
    'click .remove': 'toggleRemove',
    'click .remove_cancel': 'toggleRemove',
    'click .remove_delete': 'removeStudent'
  };

  StudentListElementView.prototype.initialize = function(options) {
    this.student = options.student;
    return this.students = options.students;
  };

  StudentListElementView.prototype.results = function() {
    return Tangerine.router.navigate("report/studentToDate/" + this.student.id, true);
  };

  StudentListElementView.prototype.edit = function() {
    return Tangerine.router.navigate("class/student/" + this.student.id, true);
  };

  StudentListElementView.prototype.toggleRemove = function() {
    return this.$el.find(".remove_confirm, .remove").toggle();
  };

  StudentListElementView.prototype.removeStudent = function() {
    this.student.set({
      klassId: null
    }).save();
    return this.students.remove(this.student);
  };

  StudentListElementView.prototype.render = function() {
    this.$el.html("      " + (this.student.get('name')) + "      " + (this.student.get('gender')) + "      " + (this.student.get('age')) + "      <img src='images/icon_results.png' class='results' title='Results'>      <img src='images/icon_edit.png' class='edit' title='Edit'>      <img src='images/icon_delete.png' class='remove' title='Remove'>      <div class='remove_confirm confirmation'>        <div class='menu_box'>          " + (t('remove student')) + "<br>          <button class='remove_delete command_red'>" + (t('remove')) + "</button>          <button class='remove_cancel command'>" + (t('cancel')) + "</button>        </div>      </div>    ");
    return this.trigger("rendered");
  };

  return StudentListElementView;

})(Backbone.View);

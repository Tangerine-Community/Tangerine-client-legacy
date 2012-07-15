var StudentEditView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

StudentEditView = (function(_super) {

  __extends(StudentEditView, _super);

  function StudentEditView() {
    StudentEditView.__super__.constructor.apply(this, arguments);
  }

  StudentEditView.prototype.events = {
    'click .done': 'done',
    'click .back': 'back'
  };

  StudentEditView.prototype.initialize = function(options) {
    this.student = options.student;
    return this.klasses = options.klasses;
  };

  StudentEditView.prototype.done = function() {
    var klassId;
    klassId = this.$el.find("#klass_select option:selected").attr("data-id");
    if (klassId === "null") klassId = null;
    this.student.set({
      name: this.$el.find("#name").val(),
      gender: this.$el.find("#gender").val(),
      age: this.$el.find("#age").val(),
      klassId: klassId
    });
    this.student.save();
    return this.back();
  };

  StudentEditView.prototype.back = function() {
    return window.history.back();
  };

  StudentEditView.prototype.render = function() {
    var age, gender, html, klass, klassId, name, _i, _len, _ref;
    name = this.student.get("name") || "";
    gender = this.student.get("gender") || "";
    age = this.student.get("age") || "";
    klassId = this.student.get("klassId");
    html = "    <h1>Edit Student</h1>    <button class='back navigation'>Back</button><br>    <div class='info_box'>      <div class='label_value'>        <label for='name'>Name</label>        <input id='name' value='" + name + "'>      </div>      <div class='label_value'>        <label for='gender'>Gender</label>        <input id='gender' value='" + gender + "'>      </div>      <div class='label_value'>        <label for='age'>Age</label>        <input id='age' value='" + age + "'>      </div>      <div class='label_value'>        <label for='klass_select'>Class</label>        <select id='klass_select'>";
    html += "<option data-id='null' " + (klassId === null ? "selected='selected'" : void 0) + ">None</option>";
    _ref = this.klasses.models;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      klass = _ref[_i];
      html += "<option data-id='" + klass.id + "' " + (klass.id === klassId ? "selected='selected'" : void 0) + ">" + (klass.get('year')) + " - " + (klass.get('grade')) + " - " + (klass.get('stream')) + "</option>";
    }
    html += "        </select>      </div>      <button class='done command'>Done</button>    </div>    ";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return StudentEditView;

})(Backbone.View);

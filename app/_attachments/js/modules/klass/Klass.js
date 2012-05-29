var Klass, KlassAssessments, KlassEditView, KlassListElementView, KlassMenuView, KlassView, Klasses, KlassesView, RegisterTeacherView, Student, StudentEditView, StudentListElementView, Students,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Student = (function(_super) {

  __extends(Student, _super);

  function Student() {
    Student.__super__.constructor.apply(this, arguments);
  }

  Student.prototype.url = "student";

  Student.prototype.defaults = {
    gender: "Not entered",
    age: "Not entered",
    name: "Not entered",
    klassId: null
  };

  Student.prototype.initialize = function() {};

  return Student;

})(Backbone.Model);

Students = (function(_super) {

  __extends(Students, _super);

  function Students() {
    Students.__super__.constructor.apply(this, arguments);
  }

  Students.prototype.model = Student;

  Students.prototype.url = "student";

  return Students;

})(Backbone.Collection);

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

KlassAssessments = (function(_super) {

  __extends(KlassAssessments, _super);

  function KlassAssessments() {
    KlassAssessments.__super__.constructor.apply(this, arguments);
  }

  KlassAssessments.prototype.model = Assessment;

  KlassAssessments.prototype.url = 'assessment';

  KlassAssessments.prototype.comparator = function(model) {
    return model.get("week");
  };

  return KlassAssessments;

})(Backbone.Collection);

KlassMenuView = (function(_super) {

  __extends(KlassMenuView, _super);

  function KlassMenuView() {
    KlassMenuView.__super__.constructor.apply(this, arguments);
  }

  KlassMenuView.prototype.events = {
    'click .registration': 'gotoKlasses'
  };

  KlassMenuView.prototype.gotoKlasses = function() {
    return Tangerine.router.navigate("classes", true);
  };

  KlassMenuView.prototype.initialize = function(options) {};

  KlassMenuView.prototype.render = function() {
    this.$el.html("        <button class='collect command'>Collect</button>    <button class='manage command'>Manage</button>    <button class='reports command'>Reports</button>    <button class='advice command'>Advice</button>    <button class='registration command'>Class Registration</button>        ");
    return this.trigger("rendered");
  };

  return KlassMenuView;

})(Backbone.View);

Klass = (function(_super) {

  __extends(Klass, _super);

  function Klass() {
    Klass.__super__.constructor.apply(this, arguments);
  }

  Klass.prototype.url = "klass";

  Klass.prototype.defaults = {
    startTime: -1
  };

  Klass.prototype.initialize = function() {};

  return Klass;

})(Backbone.Model);

KlassView = (function(_super) {

  __extends(KlassView, _super);

  function KlassView() {
    KlassView.__super__.constructor.apply(this, arguments);
  }

  KlassView.prototype.initialize = function(options) {
    var allAssessments,
      _this = this;
    this.klass = options.klass;
    this.assessments = this.klass.assessments;
    this.results = [];
    allAssessments = new KlassAssessments;
    return allAssessments.fetch({
      success: function(assessmentCollection) {
        var results;
        _this.assessments = assessmentCollection.where({
          klassId: _this.klass.id
        });
        results = new Results;
        return results.fetch({
          success: function(resultCollection) {
            var assessment, _i, _len, _ref;
            _ref = _this.assessments;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              assessment = _ref[_i];
              assessment.results = resultCollection.where({
                assessmentId: assessment.id
              });
            }
            return _this.render();
          }
        });
      }
    });
  };

  KlassView.prototype.render = function() {
    var assessment, grade, html, stream, year, _i, _len, _ref, _ref2;
    year = this.klass.get("year") || "";
    grade = this.klass.get("grade") || "";
    stream = this.klass.get("stream") || "";
    html = "    <h1>Class: " + stream + "</h1>    <div>      Year: " + year + "<br>      Grade: " + grade + "    </div>    <ul class='assessment_list'>";
    _ref = this.assessments;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      assessment = _ref[_i];
      html += "<li data-id='" + assessment.id + "'>" + (assessment.get('name')) + " - " + ((_ref2 = assessment.get('results')) != null ? _ref2.length : void 0) + "</li>";
    }
    html += "</ul>";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return KlassView;

})(Backbone.View);

KlassEditView = (function(_super) {

  __extends(KlassEditView, _super);

  function KlassEditView() {
    this.renderStudents = __bind(this.renderStudents, this);
    this.registerStudent = __bind(this.registerStudent, this);
    KlassEditView.__super__.constructor.apply(this, arguments);
  }

  KlassEditView.prototype.events = {
    'click .back': 'back',
    'click .save': 'basicInfoSave',
    'click .basic_info_edit': 'basicInfoEdit',
    'click .add_student': 'addStudentToggle',
    'click .add_student_cancel': 'addStudentToggle',
    'click .add_student_add': 'addStudent',
    'click .register_student': 'registerStudentToggle',
    'click .register_student_cancel': 'registerStudentToggle',
    'click .register_student_save': 'registerStudent'
  };

  KlassEditView.prototype.addStudentToggle = function() {
    return this.$el.find(".add_student_form, .add_student").toggle();
  };

  KlassEditView.prototype.registerStudentToggle = function() {
    return this.$el.find(".register_student_form, .register_student").toggle();
  };

  KlassEditView.prototype.addStudent = function() {
    var newStudent, studentId;
    studentId = this.$el.find("#add_student_select option:selected").attr("data-id");
    newStudent = this.allStudents.get(studentId);
    newStudent.set({
      klassId: this.klass.id
    });
    newStudent.save();
    this.students.add(newStudent);
    return this.addStudentToggle();
  };

  KlassEditView.prototype.registerStudent = function() {
    this.students.create({
      name: this.$el.find("#register_student_name").val(),
      gender: this.$el.find("#register_student_gender").val(),
      age: this.$el.find("#register_student_age").val(),
      klassId: this.klass.id
    }, {
      wait: true
    });
    this.registerStudentToggle();
    return this.$el.find("#register_student_form input").val();
  };

  KlassEditView.prototype.basicInfoEdit = function() {
    return this.$el.find(".basic_info").toggle();
  };

  KlassEditView.prototype.basicInfoSave = function() {
    var inputs, newDate;
    inputs = this.$el.find("#startDate").val().split("/");
    newDate = new Date();
    newDate.setFullYear(inputs[0]);
    newDate.setMonth(inputs[1]);
    newDate.setDate(inputs[2]);
    this.klass.set({
      year: this.$el.find("#year").val(),
      grade: this.$el.find("#grade").val(),
      stream: this.$el.find("#stream").val(),
      startTime: newDate.getTime()
    });
    this.klass.save();
    return this.render();
  };

  KlassEditView.prototype.back = function() {
    return window.history.back();
  };

  KlassEditView.prototype.initialize = function(options) {
    this.klass = options.klass;
    this.students = options.students;
    this.allStudents = options.allStudents;
    this.students.on("add remove change", this.renderStudents);
    return this.views = [];
  };

  KlassEditView.prototype.closeViews = function() {
    var view, _i, _len, _ref;
    _ref = this.views;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      view.close();
    }
    return this.views = [];
  };

  KlassEditView.prototype.renderStudents = function() {
    var $ul, double, isInClass, student, studentOptionList, view, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
    $ul = $("<ul>").addClass("student_list");
    this.closeViews();
    _ref = this.students.models;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      student = _ref[_i];
      view = new StudentListElementView({
        student: student,
        students: this.students
      });
      this.views.push(view);
      view.render();
      view.on("change", this.renderStudents);
      $ul.append(view.el);
    }
    this.$el.find("#student_list_wrapper").html($ul);
    studentOptionList = "<option disabled='disabled' selected='selected'>(Name) - (Age)</option>";
    _ref2 = this.allStudents.models;
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      student = _ref2[_j];
      isInClass = false;
      _ref3 = this.students.models;
      for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
        double = _ref3[_k];
        if (double.id === student.id) isInClass = true;
      }
      if (!isInClass) {
        studentOptionList += "<option data-id='" + student.id + "'>" + (student.get('name')) + " - " + (student.get('age')) + "</option>";
      }
    }
    return this.$el.find("#add_student_select").html(studentOptionList);
  };

  KlassEditView.prototype.render = function() {
    var grade, startDate, stream, year;
    year = this.klass.get("year") || "";
    grade = this.klass.get("grade") || "";
    stream = this.klass.get("stream") || "";
    startDate = new Date(this.klass.get("startDate"));
    this.$el.html("    <button class='back navigation'>Back</button>    <h1>Class Editor</h1>    <h2>Basic info</h2>    <div class='info_box basic_info'>      <div class='label_value'>        <label for='year'>Year</label> " + year + "      </div>      <div class='label_value'>        <label for='grade'>Grade</label> " + grade + "      </div>      <div class='label_value'>        <label for='stream'>Stream</label> " + stream + "      </div>      <div class='label_value'>        <label for='start_time'>Start date</label> " + (startTime.getFullYear() + "/" + (startTime.getMonth() + 1) + "/" + startTime.getDate()) + "      </div>      <button class='basic_info_edit command'>Edit</button>    </div>    <div class='menu_box basic_info confirmation'>      <div class='label_value'>        <label for='year'>Year</label>        <input id='year' value='" + year + "'>      </div>      <div class='label_value'>        <label for='grade'>Grade</label>        <input id='grade' value='" + grade + "'>      </div>      <div class='label_value'>        <label for='stream'>Stream</label>        <input id='stream' value='" + stream + "'>      </div>      <div class='label_value'>        <label for='start_date'>Start</label>        <input id='startDate' value='" + (startTime.getFullYear() + "/" + (startTime.getMonth() + 1) + "/" + startTime.getDate()) + "'>      </div>            <div class='menu_box'>        <button class='save command'>Save</button>      </div>    </div>        <h2>Students</h2>    <div id='student_list_wrapper'></div>    <button class='add_student command'>Add student</button>    <div class='add_student_form menu_box confirmation'>      <div class='label_value'>        <label for='add_student_select'>Select a student</label>        <select id='add_student_select'>        </select>      </div>            <button class='add_student_add command'>Add</button><button class='add_student_cancel command'>Cancel</button>    </div>    <button class='register_student command'>Register students</button>    <div class='register_student_form menu_box confirmation'>      <h2>Register New Student</h2>      <div class='label_value'>        <label for='register_student_name'>Name</label>        <input id='register_student_name' value=''>      </div>      <div class='label_value'>        <label for='register_student_gender'>Gender</label>        <input id='register_student_gender' value=''>      </div>      <div class='label_value'>        <label for='register_student_age'>Age</label>        <input id='register_student_age' value=''>      </div>      <button class='register_student_save command'>Save</button>      <button class='register_student_cancel command'>Cancel</button>    </div>    ");
    this.renderStudents();
    return this.trigger("rendered");
  };

  return KlassEditView;

})(Backbone.View);

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
    return Tangerine.router.navigate("student/results/" + this.student.id, true);
  };

  StudentListElementView.prototype.edit = function() {
    return Tangerine.router.navigate("student/edit/" + this.student.id, true);
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
    return this.$el.html("      " + (this.student.get('name')) + "      " + (this.student.get('gender')) + "      " + (this.student.get('age')) + "      <button class='results command'>Results</button>      <button class='edit command'>Edit</button>      <button class='remove command'>Remove</button>      <div class='remove_confirm confirmation'>Remove student? <button class='remove_delete command'>Remove</button><button class='remove_cancel command'>cancel</button></div>    ");
  };

  return StudentListElementView;

})(Backbone.View);

KlassesView = (function(_super) {

  __extends(KlassesView, _super);

  function KlassesView() {
    this.render = __bind(this.render, this);
    KlassesView.__super__.constructor.apply(this, arguments);
  }

  KlassesView.prototype.initialize = function(options) {
    this.views = [];
    this.klasses = options.klasses;
    return this.klasses.on("add remove change", this.render);
  };

  KlassesView.prototype.events = {
    'click .add': 'toggleAddForm',
    'click .cancel': 'toggleAddForm',
    'click .save': 'saveNewKlass',
    'click .goto_class': 'gotoKlass'
  };

  KlassesView.prototype.saveNewKlass = function() {
    return this.klasses.create({
      year: this.$el.find("#year").val(),
      grade: this.$el.find("#grade").val(),
      stream: this.$el.find("#stream").val(),
      startTime: (new Date()).getTime()
    });
  };

  KlassesView.prototype.gotoKlass = function(event) {
    return Tangerine.router.navigate("class/edit/" + $(event.target).attr("data-id"));
  };

  KlassesView.prototype.toggleAddForm = function() {
    this.$el.find("#add_form, .add").toggle();
    return this.$el.find("#year").focus();
  };

  KlassesView.prototype.renderKlasses = function() {
    var $ul, klass, view, _i, _len, _ref;
    this.closeViews();
    $ul = $("<ul>").addClass("klass_list");
    _ref = this.klasses.models;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      klass = _ref[_i];
      view = new KlassListElementView({
        klass: klass
      });
      view.render();
      this.views.push(view);
      $ul.append(view.el);
    }
    return this.$el.append($ul);
  };

  KlassesView.prototype.render = function() {
    var html;
    html = "      <h1>Classes</h1>      <div id='klass_list_wrapper'>      </div>      <div id='add_form' class='confirmation menu_box'>        <div class='label_value'>          <label for='year'>Year</label>          <input id='year'>        </div>        <div class='label_value'>          <label for='grade'>Grade</label>          <input id='grade'>        </div>        <div class='label_value'>          <label for='stream'>Stream</label>          <input id='stream'>        </div>        <button class='command save'>Save</button><button class='command cancel'>Cancel</button>      </div>      <div id='klass_list_wrapper'></div>      <button class='add command'>Add</button>    ";
    this.$el.html(html);
    this.renderKlasses();
    return this.trigger("rendered");
  };

  KlassesView.prototype.closeViews = function() {
    var view, _i, _len, _ref, _results;
    _ref = this.views != null;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      _results.push(view.close());
    }
    return _results;
  };

  KlassesView.prototype.onClose = function() {
    return this.closeViews();
  };

  return KlassesView;

})(Backbone.View);

KlassListElementView = (function(_super) {

  __extends(KlassListElementView, _super);

  function KlassListElementView() {
    KlassListElementView.__super__.constructor.apply(this, arguments);
  }

  KlassListElementView.prototype.tagName = "li";

  KlassListElementView.prototype.events = {
    'click .edit': 'edit',
    'click .results': 'results',
    'click .delete': 'toggleDelete',
    'click .delete_cancel': 'toggleDelete',
    'click .delete_delete': 'delete'
  };

  KlassListElementView.prototype.initialize = function(options) {
    return console.log(this);
  };

  KlassListElementView.prototype.edit = function() {
    return Tangerine.router.navigate("class/edit/" + this.options.klass.id, true);
  };

  KlassListElementView.prototype.results = function() {
    return Tangerine.router.navigate("class/results/" + this.options.klass.id, true);
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
    return this.$el.html("      " + (klass.get('year')) + " - " + (klass.get('grade')) + " - " + (klass.get('stream')) + "<br>      <button class='results command'>Show</button>      <button class='results command'>Results</button>      <button class='edit command'>Edit</button>      <button class='delete command'>Delete</button>      <div class='delete_confirm confirmation'>Are you sure? <button class='delete_delete'>Delete</button><button class='delete_cancel'>Cancel</button></div>    ");
  };

  return KlassListElementView;

})(Backbone.View);

Klasses = (function(_super) {

  __extends(Klasses, _super);

  function Klasses() {
    Klasses.__super__.constructor.apply(this, arguments);
  }

  Klasses.prototype.model = Klass;

  Klasses.prototype.url = 'klass';

  return Klasses;

})(Backbone.Collection);

RegisterTeacherView = (function(_super) {

  __extends(RegisterTeacherView, _super);

  function RegisterTeacherView() {
    RegisterTeacherView.__super__.constructor.apply(this, arguments);
  }

  RegisterTeacherView.prototype.events = {
    'click .register': 'register'
  };

  RegisterTeacherView.prototype.initialize = function(options) {
    return this.model = options.model;
  };

  RegisterTeacherView.prototype.register = function() {
    this.model.set({
      name: this.$el.find("#name").val(),
      school: this.$el.find("#school").val(),
      village: this.$el.find("#village").val(),
      district: this.$el.find("#district").val(),
      region: this.$el.find("#region").val()
    });
    return this.model.save();
  };

  RegisterTeacherView.prototype.render = function() {
    this.$el.html("    <h1>Register</h1>    <div class='label_value'>      <label for='name'>Name</label>      <input id='name'>    </div>    <div class='label_value'>      <label for='school'>School</label>      <input id='school'>    </div>    <div class='label_value'>      <label for='school'>Village</label>      <input id='school'>    </div>    <div class='label_value'>      <label for='district'>District</label>      <input id='district'>    </div>    <div class='label_value'>      <label for='region'>Region</label>      <input id='region'>    </div>    <button class='register'>Register</button>    ");
    return this.trigger("rendered");
  };

  return RegisterTeacherView;

})(Backbone.View);

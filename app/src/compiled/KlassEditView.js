var KlassEditView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassEditView = (function(superClass) {
  extend(KlassEditView, superClass);

  function KlassEditView() {
    this.renderStudents = bind(this.renderStudents, this);
    this.onSubviewRendered = bind(this.onSubviewRendered, this);
    this.registerStudent = bind(this.registerStudent, this);
    return KlassEditView.__super__.constructor.apply(this, arguments);
  }

  KlassEditView.prototype.className = "KlassEditView";

  KlassEditView.prototype.events = {
    'click .back': 'back',
    'click .save': 'basicInfoSave',
    'click .basic_info_edit': 'basicInfoToggle',
    'click .basic_info_cancel': 'basicInfoToggle',
    'change #teacher_select': 'teacherSelect',
    'click .add_student': 'addStudentToggle',
    'click .add_student_cancel': 'addStudentToggle',
    'click .add_student_add': 'addStudent',
    'click .register_student': 'registerStudentToggle',
    'click .register_student_cancel': 'registerStudentToggle',
    'click .register_student_save': 'registerStudent'
  };

  KlassEditView.prototype.teacherSelect = function(event) {
    var teacherId;
    teacherId = this.$el.find("#teacher_select option:selected").attr("data-teacherId");
    return this.klass.set("teacherId", teacherId);
  };

  KlassEditView.prototype.addStudentToggle = function() {
    this.$el.find(".register_student_form input").val("");
    return this.$el.find(".add_student_form, .add_student").toggle();
  };

  KlassEditView.prototype.registerStudentToggle = function() {
    this.$el.find(".register_student_form, .register_student").toggle();
    if (this.$el.find(".register_student_form").is(":visible")) {
      this.$el.find(".register_student_form").scrollTo();
    }
    return this.$el.find("#register_student_name ,#register_student_gender, #register_student_age").val("");
  };

  KlassEditView.prototype.addStudent = function() {
    var newStudent, studentId;
    if (this.$el.find("#add_student_select option:selected").val() === "_none") {
      return alert("Please select a student, or cancel.");
    } else {
      studentId = this.$el.find("#add_student_select option:selected").attr("data-id");
      newStudent = this.allStudents.get(studentId);
      return newStudent.save({
        klassId: this.klass.id
      }, {
        success: (function(_this) {
          return function() {
            _this.students.add(newStudent);
            return _this.addStudentToggle();
          };
        })(this)
      });
    }
  };

  KlassEditView.prototype.registerStudent = function() {
    var student;
    student = new Student;
    return student.save({
      name: this.$el.find("#register_student_name").val(),
      gender: this.$el.find("#register_student_gender").val(),
      age: this.$el.find("#register_student_age").val(),
      klassId: this.klass.id
    }, {
      success: (function(_this) {
        return function() {
          _this.students.add(student);
          return _this.registerStudentToggle();
        };
      })(this)
    });
  };

  KlassEditView.prototype.basicInfoToggle = function() {
    var $basicInfo;
    this.$el.find(".basic_info").toggle();
    $basicInfo = $(this.$el.find(".basic_info")[1]);
    if ($basicInfo.is(":visible")) {
      $basicInfo.scrollTo();
      this.$el.find("#year").focus();
    }
    this.$el.find("#school_name").val(this.klass.getString("schoolName"));
    this.$el.find("#year").val(this.klass.getString("year"));
    this.$el.find("#grade").val(this.klass.getString("grade"));
    return this.$el.find("#stream").val(this.klass.getString("stream"));
  };

  KlassEditView.prototype.basicInfoSave = function() {
    var inputs, newDate;
    inputs = this.$el.find("#start_date").val().split("/");
    newDate = new Date();
    newDate.setFullYear(parseInt(inputs[0]));
    newDate.setMonth(parseInt(inputs[1]) - 1);
    newDate.setDate(parseInt(inputs[2]));
    return this.klass.save({
      schoolName: this.$el.find("#school_name").val(),
      year: this.$el.find("#year").val(),
      grade: this.$el.find("#grade").val(),
      stream: this.$el.find("#stream").val(),
      startDate: newDate.getTime()
    }, {
      success: (function(_this) {
        return function() {
          return _this.render();
        };
      })(this),
      error: (function(_this) {
        return function() {
          return Utils.midAlert("Save error<br>Please try again.");
        };
      })(this)
    });
  };

  KlassEditView.prototype.back = function() {
    return window.history.back();
  };

  KlassEditView.prototype.initialize = function(options) {
    this.klass = options.klass;
    this.students = options.students;
    this.allStudents = options.allStudents;
    this.teachers = options.teachers;
    this.students.on("add remove change", this.renderStudents);
    return this.views = [];
  };

  KlassEditView.prototype.closeViews = function() {
    var i, len, ref, view;
    ref = this.views;
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      view.close();
    }
    return this.views = [];
  };

  KlassEditView.prototype.onSubviewRendered = function() {
    return this.trigger("subRendered");
  };

  KlassEditView.prototype.renderStudents = function() {
    var $ul, i, len, ref, student, view;
    $ul = $("<ul>").addClass("student_list");
    this.closeViews();
    ref = this.students.models;
    for (i = 0, len = ref.length; i < len; i++) {
      student = ref[i];
      view = new StudentListElementView({
        student: student,
        students: this.students
      });
      this.views.push(view);
      view.on("rendered", this.onSubviewRendered);
      view.render();
      view.on("change", this.renderStudents);
      $ul.append(view.el);
    }
    return this.$el.find("#student_list_wrapper").html($ul);

    /*
     * Add student feature
    studentOptionList = "<option value='_none' disabled='disabled' selected='selected'>(#{$.t('name')}) - (#{$.t('age')})</option>"
    for student in @allStudents.models
      isInClass = false
      for double in @students.models
        if double.id == student.id then isInClass = true
      if not isInClass
        studentOptionList += "<option data-id='#{student.id}'>#{student.get 'name'} - #{student.get 'age'}</option>"
    
    @$el.find("#add_student_select").html studentOptionList
     */
  };

  KlassEditView.prototype.render = function() {
    var grade, htmlInfoTeacher, htmlTeacherSelect, schoolName, startDate, stream, teacher, teacherName, year;
    schoolName = this.klass.getString("schoolName");
    year = this.klass.getString("year");
    grade = this.klass.getString("grade");
    stream = this.klass.getString("stream");
    startDate = new Date(this.klass.getNumber("startDate"));
    if (this.klass.get("teacherId") === "admin") {
      teacherName = "admin";
    } else {
      teacherName = this.teachers.get(this.klass.get('teacherId')) && this.teachers.get(this.klass.get('teacherId')).has('name') ? this.teachers.get(this.klass.get('teacherId')).get('name') : "unknown";
    }
    if (Tangerine.user.isAdmin()) {
      htmlInfoTeacher = "<tr><td><label>Teacher</label></td><td>" + teacherName + "</td></tr>";
    }
    if (Tangerine.user.isAdmin()) {
      htmlTeacherSelect = "<label>Teacher</label><br> <select id='teacher_select'> " + ((function() {
        var i, len, ref, results;
        ref = this.teachers.models;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          teacher = ref[i];
          results.push("<option " + (teacher.id === this.klass.get('teacherId') ? "selected='selected' " : "") + " data-teacherId='" + teacher.id + "'>" + (teacher.get('name')) + "</option>");
        }
        return results;
      }).call(this)) + " </select>";
    }
    this.$el.html("<button class='back navigation'>" + (t('back')) + "</button> <h1>" + (t('class editor')) + "</h1> <h2>" + (t('basic info')) + "</h2> <table class='info_box basic_info'> <tr><td><label>School name</label></td><td>" + schoolName + "</td></tr> " + (htmlInfoTeacher || "") + " <tr><td><label>School year</label></td><td>" + year + "</td></tr> <tr><td><label>" + (t('grade')) + "</label></td><td>" + grade + "</td></tr> <tr><td><label>" + (t('stream')) + "</label></td><td>" + stream + "</td></tr> <tr><td><label>" + (t('starting date')) + "</label></td><td>" + (startDate.getFullYear() + "/" + (startDate.getMonth() + 1) + "/" + startDate.getDate()) + "</td></tr> <tr><td colspan='2'><button class='basic_info_edit command'>" + (t('edit')) + "</button></td></tr> </table> <div class='basic_info confirmation'> <div class='menu_box'> <div class='label_value'> <label for='school_name'>School name</label> <input id='school_name' value='" + schoolName + "'> </div> <div class='label_value'> " + (htmlTeacherSelect || "") + " </div> <div class='label_value'> <label for='year'>School year</label> <input id='year' value='" + year + "'> </div> <div class='label_value'> <label for='grade'>" + (t('grade')) + "</label> <input id='grade' value='" + grade + "'> </div> <div class='label_value'> <label for='stream'>" + (t('stream')) + "</label> <input id='stream' value='" + stream + "'> </div> <div class='label_value'> <label for='start_date'>" + (t('starting date')) + "</label> <input id='start_date' value='" + (startDate.getFullYear() + "/" + (startDate.getMonth() + 1) + "/" + startDate.getDate()) + "'> </div> <button class='save command'>" + (t('save')) + "</button> <button class='basic_info_cancel command'>" + (t('cancel')) + "</button> </div> </div> <h2>" + (t('students').capitalize()) + "</h2> <div id='student_list_wrapper'></div> <!-- add student feature --> <!--button class='add_student command'>Add student</button> <div class='add_student_form menu_box confirmation'> <div class='label_value'> <label for='add_student_select'>" + (t('add student')) + "</label><br> <select id='add_student_select'> </select> </div> <button class='add_student_add command'>" + (t('add')) + "</button><button class='add_student_cancel command'>" + (t('cancel')) + "</button> </div--> <button class='register_student command'>" + ($.t("register student")) + "</button> <div class='register_student_form menu_box confirmation'> <h2>" + (t('register student')) + "</h2> <div class='label_value'> <label for='register_student_name'>Full name</label> <input id='register_student_name' value=''> </div> <div class='label_value'> <label for='register_student_gender'>" + (t('gender')) + "</label> <input id='register_student_gender' value=''> </div> <div class='label_value'> <label for='register_student_age'>" + (t('age')) + "</label> <input id='register_student_age' value=''> </div> <button class='register_student_save command'>" + (t('save')) + "</button> <button class='register_student_cancel command'>" + (t('cancel')) + "</button> </div>");
    this.trigger("rendered");
    return this.renderStudents();
  };

  return KlassEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMva2xhc3MvS2xhc3NFZGl0Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxhQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7OzswQkFFSixTQUFBLEdBQVk7OzBCQUVaLE1BQUEsR0FDRTtJQUFBLGFBQUEsRUFBbUMsTUFBbkM7SUFDQSxhQUFBLEVBQW1DLGVBRG5DO0lBRUEsd0JBQUEsRUFBbUMsaUJBRm5DO0lBR0EsMEJBQUEsRUFBbUMsaUJBSG5DO0lBS0Esd0JBQUEsRUFBbUMsZUFMbkM7SUFPQSxvQkFBQSxFQUFtQyxrQkFQbkM7SUFRQSwyQkFBQSxFQUFtQyxrQkFSbkM7SUFTQSx3QkFBQSxFQUFtQyxZQVRuQztJQVVBLHlCQUFBLEVBQW1DLHVCQVZuQztJQVdBLGdDQUFBLEVBQW1DLHVCQVhuQztJQVlBLDhCQUFBLEVBQW1DLGlCQVpuQzs7OzBCQWVGLGFBQUEsR0FBZSxTQUFDLEtBQUQ7QUFDYixRQUFBO0lBQUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlDQUFWLENBQTRDLENBQUMsSUFBN0MsQ0FBa0QsZ0JBQWxEO1dBQ1osSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsV0FBWCxFQUF3QixTQUF4QjtFQUZhOzswQkFJZixnQkFBQSxHQUFrQixTQUFBO0lBQ2hCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLDhCQUFWLENBQXlDLENBQUMsR0FBMUMsQ0FBOEMsRUFBOUM7V0FDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQ0FBVixDQUE0QyxDQUFDLE1BQTdDLENBQUE7RUFGZ0I7OzBCQUlsQixxQkFBQSxHQUF1QixTQUFBO0lBQ3JCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLDJDQUFWLENBQXNELENBQUMsTUFBdkQsQ0FBQTtJQUVBLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsd0JBQVYsQ0FBbUMsQ0FBQyxFQUFwQyxDQUF1QyxVQUF2QyxDQUFIO01BQTJELElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHdCQUFWLENBQW1DLENBQUMsUUFBcEMsQ0FBQSxFQUEzRDs7V0FDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSx5RUFBVixDQUFvRixDQUFDLEdBQXJGLENBQXlGLEVBQXpGO0VBSnFCOzswQkFNdkIsVUFBQSxHQUFZLFNBQUE7QUFDVixRQUFBO0lBQUEsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxxQ0FBVixDQUFnRCxDQUFDLEdBQWpELENBQUEsQ0FBQSxLQUEwRCxPQUE3RDthQUNFLEtBQUEsQ0FBTyxxQ0FBUCxFQURGO0tBQUEsTUFBQTtNQUdFLFNBQUEsR0FBWSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxxQ0FBVixDQUFnRCxDQUFDLElBQWpELENBQXNELFNBQXREO01BQ1osVUFBQSxHQUFhLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixTQUFqQjthQUNiLFVBQVUsQ0FBQyxJQUFYLENBQ0U7UUFBQSxPQUFBLEVBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFqQjtPQURGLEVBR0U7UUFBQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtZQUNQLEtBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFVBQWQ7bUJBQ0EsS0FBQyxDQUFBLGdCQUFELENBQUE7VUFGTztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtPQUhGLEVBTEY7O0VBRFU7OzBCQWFaLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFFBQUE7SUFBQSxPQUFBLEdBQVUsSUFBSTtXQUNkLE9BQU8sQ0FBQyxJQUFSLENBQ0U7TUFBQSxJQUFBLEVBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsd0JBQVYsQ0FBbUMsQ0FBQyxHQUFwQyxDQUFBLENBQVY7TUFDQSxNQUFBLEVBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsMEJBQVYsQ0FBcUMsQ0FBQyxHQUF0QyxDQUFBLENBRFY7TUFFQSxHQUFBLEVBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsdUJBQVYsQ0FBa0MsQ0FBQyxHQUFuQyxDQUFBLENBRlY7TUFHQSxPQUFBLEVBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUhqQjtLQURGLEVBTUU7TUFBQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ1AsS0FBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsT0FBZDtpQkFDQSxLQUFDLENBQUEscUJBQUQsQ0FBQTtRQUZPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO0tBTkY7RUFGZTs7MEJBY2pCLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFFBQUE7SUFBQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxhQUFWLENBQXdCLENBQUMsTUFBekIsQ0FBQTtJQUVBLFVBQUEsR0FBYSxDQUFBLENBQUUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsYUFBVixDQUF5QixDQUFBLENBQUEsQ0FBM0I7SUFFYixJQUFHLFVBQVUsQ0FBQyxFQUFYLENBQWMsVUFBZCxDQUFIO01BQ0UsVUFBVSxDQUFDLFFBQVgsQ0FBQTtNQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBa0IsQ0FBQyxLQUFuQixDQUFBLEVBRkY7O0lBSUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsY0FBVixDQUF5QixDQUFDLEdBQTFCLENBQThCLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFpQixZQUFqQixDQUE5QjtJQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBa0IsQ0FBQyxHQUFuQixDQUE4QixJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBaUIsTUFBakIsQ0FBOUI7SUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxRQUFWLENBQW1CLENBQUMsR0FBcEIsQ0FBOEIsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQWlCLE9BQWpCLENBQTlCO1dBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsU0FBVixDQUFvQixDQUFDLEdBQXJCLENBQThCLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFpQixRQUFqQixDQUE5QjtFQVplOzswQkFjakIsYUFBQSxHQUFlLFNBQUE7QUFDYixRQUFBO0lBQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGFBQVYsQ0FBd0IsQ0FBQyxHQUF6QixDQUFBLENBQThCLENBQUMsS0FBL0IsQ0FBcUMsR0FBckM7SUFDVCxPQUFBLEdBQWMsSUFBQSxJQUFBLENBQUE7SUFDZCxPQUFPLENBQUMsV0FBUixDQUFvQixRQUFBLENBQVMsTUFBTyxDQUFBLENBQUEsQ0FBaEIsQ0FBcEI7SUFDQSxPQUFPLENBQUMsUUFBUixDQUFpQixRQUFBLENBQVMsTUFBTyxDQUFBLENBQUEsQ0FBaEIsQ0FBQSxHQUFzQixDQUF2QztJQUNBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFFBQUEsQ0FBUyxNQUFPLENBQUEsQ0FBQSxDQUFoQixDQUFoQjtXQUdBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUNFO01BQUEsVUFBQSxFQUFhLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGNBQVYsQ0FBeUIsQ0FBQyxHQUExQixDQUFBLENBQWI7TUFDQSxJQUFBLEVBQWEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsT0FBVixDQUFrQixDQUFDLEdBQW5CLENBQUEsQ0FEYjtNQUVBLEtBQUEsRUFBYSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxRQUFWLENBQW1CLENBQUMsR0FBcEIsQ0FBQSxDQUZiO01BR0EsTUFBQSxFQUFhLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFNBQVYsQ0FBb0IsQ0FBQyxHQUFyQixDQUFBLENBSGI7TUFJQSxTQUFBLEVBQWEsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUpiO0tBREYsRUFPRTtNQUFBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ1AsS0FBQyxDQUFBLE1BQUQsQ0FBQTtRQURPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO01BRUEsS0FBQSxFQUFPLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDTCxLQUFLLENBQUMsUUFBTixDQUFlLGlDQUFmO1FBREs7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRlA7S0FQRjtFQVJhOzswQkFvQmYsSUFBQSxHQUFNLFNBQUE7V0FDSixNQUFNLENBQUMsT0FBTyxDQUFDLElBQWYsQ0FBQTtFQURJOzswQkFHTixVQUFBLEdBQVksU0FBRSxPQUFGO0lBQ1YsSUFBQyxDQUFBLEtBQUQsR0FBZSxPQUFPLENBQUM7SUFDdkIsSUFBQyxDQUFBLFFBQUQsR0FBZSxPQUFPLENBQUM7SUFDdkIsSUFBQyxDQUFBLFdBQUQsR0FBZSxPQUFPLENBQUM7SUFDdkIsSUFBQyxDQUFBLFFBQUQsR0FBZSxPQUFPLENBQUM7SUFFdkIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxFQUFWLENBQWEsbUJBQWIsRUFBa0MsSUFBQyxDQUFBLGNBQW5DO1dBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUztFQVJDOzswQkFXWixVQUFBLEdBQVksU0FBQTtBQUNWLFFBQUE7QUFBQTtBQUFBLFNBQUEscUNBQUE7O01BQ0UsSUFBSSxDQUFDLEtBQUwsQ0FBQTtBQURGO1dBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUztFQUhDOzswQkFLWixpQkFBQSxHQUFtQixTQUFBO1dBQ2pCLElBQUMsQ0FBQSxPQUFELENBQVMsYUFBVDtFQURpQjs7MEJBR25CLGNBQUEsR0FBZ0IsU0FBQTtBQUNkLFFBQUE7SUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFFBQVYsQ0FBbUIsY0FBbkI7SUFFTixJQUFDLENBQUEsVUFBRCxDQUFBO0FBQ0E7QUFBQSxTQUFBLHFDQUFBOztNQUNFLElBQUEsR0FBVyxJQUFBLHNCQUFBLENBQ1Q7UUFBQSxPQUFBLEVBQVUsT0FBVjtRQUNBLFFBQUEsRUFBVyxJQUFDLENBQUEsUUFEWjtPQURTO01BR1gsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWjtNQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsVUFBUixFQUFvQixJQUFDLENBQUEsaUJBQXJCO01BQ0EsSUFBSSxDQUFDLE1BQUwsQ0FBQTtNQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsUUFBUixFQUFrQixJQUFDLENBQUEsY0FBbkI7TUFDQSxHQUFHLENBQUMsTUFBSixDQUFXLElBQUksQ0FBQyxFQUFoQjtBQVJGO1dBVUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsdUJBQVYsQ0FBa0MsQ0FBQyxJQUFuQyxDQUF3QyxHQUF4Qzs7QUFFQTs7Ozs7Ozs7Ozs7O0VBaEJjOzswQkE2QmhCLE1BQUEsR0FBUSxTQUFBO0FBRU4sUUFBQTtJQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBaUIsWUFBakI7SUFDYixJQUFBLEdBQWEsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQWlCLE1BQWpCO0lBQ2IsS0FBQSxHQUFhLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFpQixPQUFqQjtJQUNiLE1BQUEsR0FBYSxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBaUIsUUFBakI7SUFFYixTQUFBLEdBQWlCLElBQUEsSUFBQSxDQUFLLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFpQixXQUFqQixDQUFMO0lBRWpCLElBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsV0FBWCxDQUFBLEtBQTJCLE9BQTlCO01BQ0UsV0FBQSxHQUFjLFFBRGhCO0tBQUEsTUFBQTtNQUdFLFdBQUEsR0FDSyxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxXQUFYLENBQWQsQ0FBQSxJQUEwQyxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxXQUFYLENBQWQsQ0FBc0MsQ0FBQyxHQUF2QyxDQUEyQyxNQUEzQyxDQUE3QyxHQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBZCxDQUFzQyxDQUFDLEdBQXZDLENBQTJDLE1BQTNDLENBREYsR0FHRSxVQVBOOztJQVNBLElBRUssU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFmLENBQUEsQ0FGTDtNQUFBLGVBQUEsR0FBa0IseUNBQUEsR0FDeUIsV0FEekIsR0FDcUMsYUFEdkQ7O0lBSUEsSUFLSyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQWYsQ0FBQSxDQUxMO01BQUEsaUJBQUEsR0FBb0IsMERBQUEsR0FHakI7O0FBQUM7QUFBQTthQUFBLHFDQUFBOzt1QkFBQyxVQUFBLEdBQVUsQ0FBSSxPQUFPLENBQUMsRUFBUixLQUFjLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBakIsR0FBOEMsc0JBQTlDLEdBQTBFLEVBQTNFLENBQVYsR0FBd0YsbUJBQXhGLEdBQTJHLE9BQU8sQ0FBQyxFQUFuSCxHQUFzSCxJQUF0SCxHQUF5SCxDQUFDLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixDQUFELENBQXpILEdBQThJO0FBQS9JOzttQkFBRCxDQUhpQixHQUcySyxhQUgvTDs7SUFPQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxrQ0FBQSxHQUN1QixDQUFDLENBQUEsQ0FBRSxNQUFGLENBQUQsQ0FEdkIsR0FDa0MsZ0JBRGxDLEdBRUwsQ0FBQyxDQUFBLENBQUUsY0FBRixDQUFELENBRkssR0FFYyxZQUZkLEdBR0wsQ0FBQyxDQUFBLENBQUUsWUFBRixDQUFELENBSEssR0FHWSx1RkFIWixHQUtxQyxVQUxyQyxHQUtnRCxhQUxoRCxHQU1QLENBQUMsZUFBQSxJQUFtQixFQUFwQixDQU5PLEdBTWdCLDhDQU5oQixHQU9xQyxJQVByQyxHQU8wQyw0QkFQMUMsR0FRUSxDQUFDLENBQUEsQ0FBRSxPQUFGLENBQUQsQ0FSUixHQVFvQixtQkFScEIsR0FRdUMsS0FSdkMsR0FRNkMsNEJBUjdDLEdBU1EsQ0FBQyxDQUFBLENBQUUsUUFBRixDQUFELENBVFIsR0FTcUIsbUJBVHJCLEdBU3dDLE1BVHhDLEdBUytDLDRCQVQvQyxHQVVRLENBQUMsQ0FBQSxDQUFFLGVBQUYsQ0FBRCxDQVZSLEdBVTRCLG1CQVY1QixHQVU4QyxDQUFDLFNBQVMsQ0FBQyxXQUFWLENBQUEsQ0FBQSxHQUF3QixHQUF4QixHQUE0QixDQUFDLFNBQVMsQ0FBQyxRQUFWLENBQUEsQ0FBQSxHQUFxQixDQUF0QixDQUE1QixHQUFxRCxHQUFyRCxHQUF5RCxTQUFTLENBQUMsT0FBVixDQUFBLENBQTFELENBVjlDLEdBVTRILHlFQVY1SCxHQVdxRCxDQUFDLENBQUEsQ0FBRSxNQUFGLENBQUQsQ0FYckQsR0FXZ0Usa01BWGhFLEdBa0I2QixVQWxCN0IsR0FrQndDLHNDQWxCeEMsR0FxQkgsQ0FBQyxpQkFBQSxJQUFxQixFQUF0QixDQXJCRyxHQXFCc0Isa0dBckJ0QixHQXlCc0IsSUF6QnRCLEdBeUIyQix5REF6QjNCLEdBNEJnQixDQUFDLENBQUEsQ0FBRSxPQUFGLENBQUQsQ0E1QmhCLEdBNEI0QixvQ0E1QjVCLEdBNkJ1QixLQTdCdkIsR0E2QjZCLDBEQTdCN0IsR0FnQ2lCLENBQUMsQ0FBQSxDQUFFLFFBQUYsQ0FBRCxDQWhDakIsR0FnQzhCLHFDQWhDOUIsR0FpQ3dCLE1BakN4QixHQWlDK0IsOERBakMvQixHQW9DcUIsQ0FBQyxDQUFBLENBQUUsZUFBRixDQUFELENBcENyQixHQW9DeUMseUNBcEN6QyxHQXFDMkIsQ0FBQyxTQUFTLENBQUMsV0FBVixDQUFBLENBQUEsR0FBd0IsR0FBeEIsR0FBNEIsQ0FBQyxTQUFTLENBQUMsUUFBVixDQUFBLENBQUEsR0FBcUIsQ0FBdEIsQ0FBNUIsR0FBcUQsR0FBckQsR0FBeUQsU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUExRCxDQXJDM0IsR0FxQ3lHLHlDQXJDekcsR0F3Q3dCLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBRCxDQXhDeEIsR0F3Q21DLHNEQXhDbkMsR0F3Q3dGLENBQUMsQ0FBQSxDQUFFLFFBQUYsQ0FBRCxDQXhDeEYsR0F3Q3FHLDhCQXhDckcsR0E0Q0wsQ0FBQyxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsVUFBZCxDQUFBLENBQUQsQ0E1Q0ssR0E0Q3VCLHNQQTVDdkIsR0FrRDJCLENBQUMsQ0FBQSxDQUFFLGFBQUYsQ0FBRCxDQWxEM0IsR0FrRDZDLHlHQWxEN0MsR0FzRGlDLENBQUMsQ0FBQSxDQUFFLEtBQUYsQ0FBRCxDQXREakMsR0FzRDJDLHNEQXREM0MsR0FzRGdHLENBQUMsQ0FBQSxDQUFFLFFBQUYsQ0FBRCxDQXREaEcsR0FzRDZHLDhEQXREN0csR0EwRGdDLENBQUMsQ0FBQyxDQUFDLENBQUYsQ0FBSSxrQkFBSixDQUFELENBMURoQyxHQTBEeUQsMEVBMUR6RCxHQTRESCxDQUFDLENBQUEsQ0FBRSxrQkFBRixDQUFELENBNURHLEdBNERvQix5TUE1RHBCLEdBa0VnQyxDQUFDLENBQUEsQ0FBRSxRQUFGLENBQUQsQ0FsRWhDLEdBa0U2Qyw0SEFsRTdDLEdBc0U2QixDQUFDLENBQUEsQ0FBRSxLQUFGLENBQUQsQ0F0RTdCLEdBc0V1QywyR0F0RXZDLEdBeUV1QyxDQUFDLENBQUEsQ0FBRSxNQUFGLENBQUQsQ0F6RXZDLEdBeUVrRCw0REF6RWxELEdBMEV5QyxDQUFDLENBQUEsQ0FBRSxRQUFGLENBQUQsQ0ExRXpDLEdBMEVzRCxrQkExRWhFO0lBOEVBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtXQUVBLElBQUMsQ0FBQSxjQUFELENBQUE7RUE3R007Ozs7R0FsSmtCLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL2tsYXNzL0tsYXNzRWRpdFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBLbGFzc0VkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiS2xhc3NFZGl0Vmlld1wiXG5cbiAgZXZlbnRzOiBcbiAgICAnY2xpY2sgLmJhY2snICAgICAgICAgICAgICAgICAgICA6ICdiYWNrJ1xuICAgICdjbGljayAuc2F2ZScgICAgICAgICAgICAgICAgICAgIDogJ2Jhc2ljSW5mb1NhdmUnXG4gICAgJ2NsaWNrIC5iYXNpY19pbmZvX2VkaXQnICAgICAgICAgOiAnYmFzaWNJbmZvVG9nZ2xlJ1xuICAgICdjbGljayAuYmFzaWNfaW5mb19jYW5jZWwnICAgICAgIDogJ2Jhc2ljSW5mb1RvZ2dsZSdcblxuICAgICdjaGFuZ2UgI3RlYWNoZXJfc2VsZWN0JyAgICAgICAgIDogJ3RlYWNoZXJTZWxlY3QnXG4gICAgXG4gICAgJ2NsaWNrIC5hZGRfc3R1ZGVudCcgICAgICAgICAgICAgOiAnYWRkU3R1ZGVudFRvZ2dsZSdcbiAgICAnY2xpY2sgLmFkZF9zdHVkZW50X2NhbmNlbCcgICAgICA6ICdhZGRTdHVkZW50VG9nZ2xlJ1xuICAgICdjbGljayAuYWRkX3N0dWRlbnRfYWRkJyAgICAgICAgIDogJ2FkZFN0dWRlbnQnXG4gICAgJ2NsaWNrIC5yZWdpc3Rlcl9zdHVkZW50JyAgICAgICAgOiAncmVnaXN0ZXJTdHVkZW50VG9nZ2xlJ1xuICAgICdjbGljayAucmVnaXN0ZXJfc3R1ZGVudF9jYW5jZWwnIDogJ3JlZ2lzdGVyU3R1ZGVudFRvZ2dsZSdcbiAgICAnY2xpY2sgLnJlZ2lzdGVyX3N0dWRlbnRfc2F2ZScgICA6ICdyZWdpc3RlclN0dWRlbnQnXG5cblxuICB0ZWFjaGVyU2VsZWN0OiAoZXZlbnQpIC0+XG4gICAgdGVhY2hlcklkID0gQCRlbC5maW5kKFwiI3RlYWNoZXJfc2VsZWN0IG9wdGlvbjpzZWxlY3RlZFwiKS5hdHRyKFwiZGF0YS10ZWFjaGVySWRcIilcbiAgICBAa2xhc3Muc2V0IFwidGVhY2hlcklkXCIsIHRlYWNoZXJJZFxuXG4gIGFkZFN0dWRlbnRUb2dnbGU6IC0+IFxuICAgIEAkZWwuZmluZChcIi5yZWdpc3Rlcl9zdHVkZW50X2Zvcm0gaW5wdXRcIikudmFsKFwiXCIpXG4gICAgQCRlbC5maW5kKFwiLmFkZF9zdHVkZW50X2Zvcm0sIC5hZGRfc3R1ZGVudFwiKS50b2dnbGUoKVxuXG4gIHJlZ2lzdGVyU3R1ZGVudFRvZ2dsZTogLT4gXG4gICAgQCRlbC5maW5kKFwiLnJlZ2lzdGVyX3N0dWRlbnRfZm9ybSwgLnJlZ2lzdGVyX3N0dWRlbnRcIikudG9nZ2xlKClcbiAgICAjIHNjcm9sbCB0byBuZXcgZm9ybSBpZiBpdCdzIHZpc3NpYmxlXG4gICAgaWYgQCRlbC5maW5kKFwiLnJlZ2lzdGVyX3N0dWRlbnRfZm9ybVwiKS5pcyhcIjp2aXNpYmxlXCIpIHRoZW4gQCRlbC5maW5kKFwiLnJlZ2lzdGVyX3N0dWRlbnRfZm9ybVwiKS5zY3JvbGxUbygpXG4gICAgQCRlbC5maW5kKFwiI3JlZ2lzdGVyX3N0dWRlbnRfbmFtZSAsI3JlZ2lzdGVyX3N0dWRlbnRfZ2VuZGVyLCAjcmVnaXN0ZXJfc3R1ZGVudF9hZ2VcIikudmFsKFwiXCIpXG5cbiAgYWRkU3R1ZGVudDogLT5cbiAgICBpZiBAJGVsLmZpbmQoXCIjYWRkX3N0dWRlbnRfc2VsZWN0IG9wdGlvbjpzZWxlY3RlZFwiKS52YWwoKSA9PSBcIl9ub25lXCJcbiAgICAgIGFsZXJ0IChcIlBsZWFzZSBzZWxlY3QgYSBzdHVkZW50LCBvciBjYW5jZWwuXCIpXG4gICAgZWxzZVxuICAgICAgc3R1ZGVudElkID0gQCRlbC5maW5kKFwiI2FkZF9zdHVkZW50X3NlbGVjdCBvcHRpb246c2VsZWN0ZWRcIikuYXR0cihcImRhdGEtaWRcIilcbiAgICAgIG5ld1N0dWRlbnQgPSBAYWxsU3R1ZGVudHMuZ2V0IHN0dWRlbnRJZFxuICAgICAgbmV3U3R1ZGVudC5zYXZlXG4gICAgICAgIGtsYXNzSWQgOiBAa2xhc3MuaWRcbiAgICAgICxcbiAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICBAc3R1ZGVudHMuYWRkIG5ld1N0dWRlbnRcbiAgICAgICAgICBAYWRkU3R1ZGVudFRvZ2dsZSgpXG5cbiAgcmVnaXN0ZXJTdHVkZW50OiA9PlxuICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudFxuICAgIHN0dWRlbnQuc2F2ZVxuICAgICAgbmFtZSAgICA6IEAkZWwuZmluZChcIiNyZWdpc3Rlcl9zdHVkZW50X25hbWVcIikudmFsKClcbiAgICAgIGdlbmRlciAgOiBAJGVsLmZpbmQoXCIjcmVnaXN0ZXJfc3R1ZGVudF9nZW5kZXJcIikudmFsKClcbiAgICAgIGFnZSAgICAgOiBAJGVsLmZpbmQoXCIjcmVnaXN0ZXJfc3R1ZGVudF9hZ2VcIikudmFsKClcbiAgICAgIGtsYXNzSWQgOiBAa2xhc3MuaWRcbiAgICAsIFxuICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgQHN0dWRlbnRzLmFkZCBzdHVkZW50XG4gICAgICAgIEByZWdpc3RlclN0dWRlbnRUb2dnbGUoKVxuICAgICAgICBcbiAgICBcblxuICBiYXNpY0luZm9Ub2dnbGU6IC0+XG4gICAgQCRlbC5maW5kKFwiLmJhc2ljX2luZm9cIikudG9nZ2xlKClcbiAgICBcbiAgICAkYmFzaWNJbmZvID0gJChAJGVsLmZpbmQoXCIuYmFzaWNfaW5mb1wiKVsxXSlcbiAgICBcbiAgICBpZiAkYmFzaWNJbmZvLmlzKFwiOnZpc2libGVcIilcbiAgICAgICRiYXNpY0luZm8uc2Nyb2xsVG8oKVxuICAgICAgQCRlbC5maW5kKFwiI3llYXJcIikuZm9jdXMoKVxuXG4gICAgQCRlbC5maW5kKFwiI3NjaG9vbF9uYW1lXCIpLnZhbCBAa2xhc3MuZ2V0U3RyaW5nKFwic2Nob29sTmFtZVwiKVxuICAgIEAkZWwuZmluZChcIiN5ZWFyXCIpLnZhbCAgICAgICAgQGtsYXNzLmdldFN0cmluZyhcInllYXJcIilcbiAgICBAJGVsLmZpbmQoXCIjZ3JhZGVcIikudmFsICAgICAgIEBrbGFzcy5nZXRTdHJpbmcoXCJncmFkZVwiKVxuICAgIEAkZWwuZmluZChcIiNzdHJlYW1cIikudmFsICAgICAgQGtsYXNzLmdldFN0cmluZyhcInN0cmVhbVwiKVxuICBcbiAgYmFzaWNJbmZvU2F2ZTogLT5cbiAgICBpbnB1dHMgPSBAJGVsLmZpbmQoXCIjc3RhcnRfZGF0ZVwiKS52YWwoKS5zcGxpdChcIi9cIilcbiAgICBuZXdEYXRlID0gbmV3IERhdGUoKVxuICAgIG5ld0RhdGUuc2V0RnVsbFllYXIocGFyc2VJbnQoaW5wdXRzWzBdKSlcbiAgICBuZXdEYXRlLnNldE1vbnRoKHBhcnNlSW50KGlucHV0c1sxXSkgLSAxKVxuICAgIG5ld0RhdGUuc2V0RGF0ZShwYXJzZUludChpbnB1dHNbMl0pKVxuXG4gICAgXG4gICAgQGtsYXNzLnNhdmVcbiAgICAgIHNjaG9vbE5hbWUgOiBAJGVsLmZpbmQoXCIjc2Nob29sX25hbWVcIikudmFsKClcbiAgICAgIHllYXIgICAgICAgOiBAJGVsLmZpbmQoXCIjeWVhclwiKS52YWwoKVxuICAgICAgZ3JhZGUgICAgICA6IEAkZWwuZmluZChcIiNncmFkZVwiKS52YWwoKVxuICAgICAgc3RyZWFtICAgICA6IEAkZWwuZmluZChcIiNzdHJlYW1cIikudmFsKClcbiAgICAgIHN0YXJ0RGF0ZSAgOiBuZXdEYXRlLmdldFRpbWUoKVxuICAgICxcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIEByZW5kZXIoKVxuICAgICAgZXJyb3I6ID0+XG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU2F2ZSBlcnJvcjxicj5QbGVhc2UgdHJ5IGFnYWluLlwiXG5cbiAgYmFjazogLT5cbiAgICB3aW5kb3cuaGlzdG9yeS5iYWNrKClcbiAgICBcbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cbiAgICBAa2xhc3MgICAgICAgPSBvcHRpb25zLmtsYXNzXG4gICAgQHN0dWRlbnRzICAgID0gb3B0aW9ucy5zdHVkZW50c1xuICAgIEBhbGxTdHVkZW50cyA9IG9wdGlvbnMuYWxsU3R1ZGVudHNcbiAgICBAdGVhY2hlcnMgICAgPSBvcHRpb25zLnRlYWNoZXJzXG5cbiAgICBAc3R1ZGVudHMub24gXCJhZGQgcmVtb3ZlIGNoYW5nZVwiLCBAcmVuZGVyU3R1ZGVudHNcblxuICAgIEB2aWV3cyA9IFtdXG5cblxuICBjbG9zZVZpZXdzOiAtPlxuICAgIGZvciB2aWV3IGluIEB2aWV3c1xuICAgICAgdmlldy5jbG9zZSgpXG4gICAgQHZpZXdzID0gW11cblxuICBvblN1YnZpZXdSZW5kZXJlZDogPT5cbiAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuICByZW5kZXJTdHVkZW50czogPT5cbiAgICAkdWwgPSAkKFwiPHVsPlwiKS5hZGRDbGFzcyhcInN0dWRlbnRfbGlzdFwiKVxuXG4gICAgQGNsb3NlVmlld3MoKVxuICAgIGZvciBzdHVkZW50IGluIEBzdHVkZW50cy5tb2RlbHNcbiAgICAgIHZpZXcgPSBuZXcgU3R1ZGVudExpc3RFbGVtZW50Vmlld1xuICAgICAgICBzdHVkZW50IDogc3R1ZGVudFxuICAgICAgICBzdHVkZW50cyA6IEBzdHVkZW50c1xuICAgICAgQHZpZXdzLnB1c2ggdmlld1xuICAgICAgdmlldy5vbiBcInJlbmRlcmVkXCIsIEBvblN1YnZpZXdSZW5kZXJlZFxuICAgICAgdmlldy5yZW5kZXIoKVxuICAgICAgdmlldy5vbiBcImNoYW5nZVwiLCBAcmVuZGVyU3R1ZGVudHNcbiAgICAgICR1bC5hcHBlbmQgdmlldy5lbFxuXG4gICAgQCRlbC5maW5kKFwiI3N0dWRlbnRfbGlzdF93cmFwcGVyXCIpLmh0bWwgJHVsXG4gICAgXG4gICAgIyMjXG4gICAgIyBBZGQgc3R1ZGVudCBmZWF0dXJlXG4gICAgc3R1ZGVudE9wdGlvbkxpc3QgPSBcIjxvcHRpb24gdmFsdWU9J19ub25lJyBkaXNhYmxlZD0nZGlzYWJsZWQnIHNlbGVjdGVkPSdzZWxlY3RlZCc+KCN7JC50KCduYW1lJyl9KSAtICgjeyQudCgnYWdlJyl9KTwvb3B0aW9uPlwiXG4gICAgZm9yIHN0dWRlbnQgaW4gQGFsbFN0dWRlbnRzLm1vZGVsc1xuICAgICAgaXNJbkNsYXNzID0gZmFsc2VcbiAgICAgIGZvciBkb3VibGUgaW4gQHN0dWRlbnRzLm1vZGVsc1xuICAgICAgICBpZiBkb3VibGUuaWQgPT0gc3R1ZGVudC5pZCB0aGVuIGlzSW5DbGFzcyA9IHRydWVcbiAgICAgIGlmIG5vdCBpc0luQ2xhc3NcbiAgICAgICAgc3R1ZGVudE9wdGlvbkxpc3QgKz0gXCI8b3B0aW9uIGRhdGEtaWQ9JyN7c3R1ZGVudC5pZH0nPiN7c3R1ZGVudC5nZXQgJ25hbWUnfSAtICN7c3R1ZGVudC5nZXQgJ2FnZSd9PC9vcHRpb24+XCJcblxuICAgIEAkZWwuZmluZChcIiNhZGRfc3R1ZGVudF9zZWxlY3RcIikuaHRtbCBzdHVkZW50T3B0aW9uTGlzdFxuICAgICMjI1xuXG4gIHJlbmRlcjogLT5cblxuICAgIHNjaG9vbE5hbWUgPSBAa2xhc3MuZ2V0U3RyaW5nIFwic2Nob29sTmFtZVwiXG4gICAgeWVhciAgICAgICA9IEBrbGFzcy5nZXRTdHJpbmcgXCJ5ZWFyXCJcbiAgICBncmFkZSAgICAgID0gQGtsYXNzLmdldFN0cmluZyBcImdyYWRlXCJcbiAgICBzdHJlYW0gICAgID0gQGtsYXNzLmdldFN0cmluZyBcInN0cmVhbVwiXG5cbiAgICBzdGFydERhdGUgID0gbmV3IERhdGUgQGtsYXNzLmdldE51bWJlciBcInN0YXJ0RGF0ZVwiXG5cbiAgICBpZiBAa2xhc3MuZ2V0KFwidGVhY2hlcklkXCIpID09IFwiYWRtaW5cIlxuICAgICAgdGVhY2hlck5hbWUgPSBcImFkbWluXCJcbiAgICBlbHNlIFxuICAgICAgdGVhY2hlck5hbWUgPSBcbiAgICAgICAgaWYgQHRlYWNoZXJzLmdldChAa2xhc3MuZ2V0KCd0ZWFjaGVySWQnKSkgJiYgQHRlYWNoZXJzLmdldChAa2xhc3MuZ2V0KCd0ZWFjaGVySWQnKSkuaGFzKCduYW1lJylcbiAgICAgICAgICBAdGVhY2hlcnMuZ2V0KEBrbGFzcy5nZXQoJ3RlYWNoZXJJZCcpKS5nZXQoJ25hbWUnKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgXCJ1bmtub3duXCJcblxuICAgIGh0bWxJbmZvVGVhY2hlciA9IFwiXG4gICAgICA8dHI+PHRkPjxsYWJlbD5UZWFjaGVyPC9sYWJlbD48L3RkPjx0ZD4je3RlYWNoZXJOYW1lfTwvdGQ+PC90cj5cbiAgICBcIiBpZiBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcblxuICAgIGh0bWxUZWFjaGVyU2VsZWN0ID0gXCJcbiAgICAgIDxsYWJlbD5UZWFjaGVyPC9sYWJlbD48YnI+XG4gICAgICA8c2VsZWN0IGlkPSd0ZWFjaGVyX3NlbGVjdCc+XG4gICAgICAjeyhcIjxvcHRpb24gI3tpZiB0ZWFjaGVyLmlkID09IEBrbGFzcy5nZXQoJ3RlYWNoZXJJZCcpIHRoZW4gXCJzZWxlY3RlZD0nc2VsZWN0ZWQnIFwiIGVsc2UgXCJcIn0gZGF0YS10ZWFjaGVySWQ9JyN7dGVhY2hlci5pZH0nPiN7dGVhY2hlci5nZXQoJ25hbWUnKX08L29wdGlvbj5cIikgZm9yIHRlYWNoZXIgaW4gQHRlYWNoZXJzLm1vZGVsc31cbiAgICAgIDwvc2VsZWN0PlxuICAgIFwiIGlmIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgPGJ1dHRvbiBjbGFzcz0nYmFjayBuYXZpZ2F0aW9uJz4je3QoJ2JhY2snKX08L2J1dHRvbj5cbiAgICA8aDE+I3t0KCdjbGFzcyBlZGl0b3InKX08L2gxPlxuICAgIDxoMj4je3QoJ2Jhc2ljIGluZm8nKX08L2gyPlxuICAgIDx0YWJsZSBjbGFzcz0naW5mb19ib3ggYmFzaWNfaW5mbyc+XG4gICAgICA8dHI+PHRkPjxsYWJlbD5TY2hvb2wgbmFtZTwvbGFiZWw+PC90ZD48dGQ+I3tzY2hvb2xOYW1lfTwvdGQ+PC90cj5cbiAgICAgICN7aHRtbEluZm9UZWFjaGVyIHx8IFwiXCJ9XG4gICAgICA8dHI+PHRkPjxsYWJlbD5TY2hvb2wgeWVhcjwvbGFiZWw+PC90ZD48dGQ+I3t5ZWFyfTwvdGQ+PC90cj5cbiAgICAgIDx0cj48dGQ+PGxhYmVsPiN7dCgnZ3JhZGUnKX08L2xhYmVsPjwvdGQ+PHRkPiN7Z3JhZGV9PC90ZD48L3RyPlxuICAgICAgPHRyPjx0ZD48bGFiZWw+I3t0KCdzdHJlYW0nKX08L2xhYmVsPjwvdGQ+PHRkPiN7c3RyZWFtfTwvdGQ+PC90cj5cbiAgICAgIDx0cj48dGQ+PGxhYmVsPiN7dCgnc3RhcnRpbmcgZGF0ZScpfTwvbGFiZWw+PC90ZD48dGQ+I3tzdGFydERhdGUuZ2V0RnVsbFllYXIoKStcIi9cIisoc3RhcnREYXRlLmdldE1vbnRoKCkrMSkrXCIvXCIrc3RhcnREYXRlLmdldERhdGUoKX08L3RkPjwvdHI+XG4gICAgICA8dHI+PHRkIGNvbHNwYW49JzInPjxidXR0b24gY2xhc3M9J2Jhc2ljX2luZm9fZWRpdCBjb21tYW5kJz4je3QoJ2VkaXQnKX08L2J1dHRvbj48L3RkPjwvdHI+XG4gICAgPC90YWJsZT5cbiAgICA8ZGl2IGNsYXNzPSdiYXNpY19pbmZvIGNvbmZpcm1hdGlvbic+XG4gICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J3NjaG9vbF9uYW1lJz5TY2hvb2wgbmFtZTwvbGFiZWw+XG4gICAgICAgICAgPGlucHV0IGlkPSdzY2hvb2xfbmFtZScgdmFsdWU9JyN7c2Nob29sTmFtZX0nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgICN7aHRtbFRlYWNoZXJTZWxlY3QgfHwgXCJcIn1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSd5ZWFyJz5TY2hvb2wgeWVhcjwvbGFiZWw+XG4gICAgICAgICAgPGlucHV0IGlkPSd5ZWFyJyB2YWx1ZT0nI3t5ZWFyfSc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nZ3JhZGUnPiN7dCgnZ3JhZGUnKX08L2xhYmVsPlxuICAgICAgICAgIDxpbnB1dCBpZD0nZ3JhZGUnIHZhbHVlPScje2dyYWRlfSc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nc3RyZWFtJz4je3QoJ3N0cmVhbScpfTwvbGFiZWw+XG4gICAgICAgICAgPGlucHV0IGlkPSdzdHJlYW0nIHZhbHVlPScje3N0cmVhbX0nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J3N0YXJ0X2RhdGUnPiN7dCgnc3RhcnRpbmcgZGF0ZScpfTwvbGFiZWw+XG4gICAgICAgICAgPGlucHV0IGlkPSdzdGFydF9kYXRlJyB2YWx1ZT0nI3tzdGFydERhdGUuZ2V0RnVsbFllYXIoKStcIi9cIisoc3RhcnREYXRlLmdldE1vbnRoKCkrMSkrXCIvXCIrc3RhcnREYXRlLmdldERhdGUoKX0nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIFxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdzYXZlIGNvbW1hbmQnPiN7dCgnc2F2ZScpfTwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSdiYXNpY19pbmZvX2NhbmNlbCBjb21tYW5kJz4je3QoJ2NhbmNlbCcpfTwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgXG4gICAgPGgyPiN7dCgnc3R1ZGVudHMnKS5jYXBpdGFsaXplKCl9PC9oMj5cbiAgICA8ZGl2IGlkPSdzdHVkZW50X2xpc3Rfd3JhcHBlcic+PC9kaXY+XG4gICAgPCEtLSBhZGQgc3R1ZGVudCBmZWF0dXJlIC0tPlxuICAgIDwhLS1idXR0b24gY2xhc3M9J2FkZF9zdHVkZW50IGNvbW1hbmQnPkFkZCBzdHVkZW50PC9idXR0b24+XG4gICAgPGRpdiBjbGFzcz0nYWRkX3N0dWRlbnRfZm9ybSBtZW51X2JveCBjb25maXJtYXRpb24nPlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdhZGRfc3R1ZGVudF9zZWxlY3QnPiN7dCgnYWRkIHN0dWRlbnQnKX08L2xhYmVsPjxicj5cbiAgICAgICAgPHNlbGVjdCBpZD0nYWRkX3N0dWRlbnRfc2VsZWN0Jz5cbiAgICAgICAgPC9zZWxlY3Q+XG4gICAgICA8L2Rpdj4gICAgICBcbiAgICAgIDxidXR0b24gY2xhc3M9J2FkZF9zdHVkZW50X2FkZCBjb21tYW5kJz4je3QoJ2FkZCcpfTwvYnV0dG9uPjxidXR0b24gY2xhc3M9J2FkZF9zdHVkZW50X2NhbmNlbCBjb21tYW5kJz4je3QoJ2NhbmNlbCcpfTwvYnV0dG9uPlxuICAgIDwvZGl2LS0+XG5cblxuICAgIDxidXR0b24gY2xhc3M9J3JlZ2lzdGVyX3N0dWRlbnQgY29tbWFuZCc+I3skLnQoXCJyZWdpc3RlciBzdHVkZW50XCIpfTwvYnV0dG9uPlxuICAgIDxkaXYgY2xhc3M9J3JlZ2lzdGVyX3N0dWRlbnRfZm9ybSBtZW51X2JveCBjb25maXJtYXRpb24nPlxuICAgICAgPGgyPiN7dCgncmVnaXN0ZXIgc3R1ZGVudCcpfTwvaDI+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J3JlZ2lzdGVyX3N0dWRlbnRfbmFtZSc+RnVsbCBuYW1lPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdyZWdpc3Rlcl9zdHVkZW50X25hbWUnIHZhbHVlPScnPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J3JlZ2lzdGVyX3N0dWRlbnRfZ2VuZGVyJz4je3QoJ2dlbmRlcicpfTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0ncmVnaXN0ZXJfc3R1ZGVudF9nZW5kZXInIHZhbHVlPScnPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J3JlZ2lzdGVyX3N0dWRlbnRfYWdlJz4je3QoJ2FnZScpfTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0ncmVnaXN0ZXJfc3R1ZGVudF9hZ2UnIHZhbHVlPScnPlxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uIGNsYXNzPSdyZWdpc3Rlcl9zdHVkZW50X3NhdmUgY29tbWFuZCc+I3t0KCdzYXZlJyl9PC9idXR0b24+XG4gICAgICA8YnV0dG9uIGNsYXNzPSdyZWdpc3Rlcl9zdHVkZW50X2NhbmNlbCBjb21tYW5kJz4je3QoJ2NhbmNlbCcpfTwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICAgIFwiXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICAgIEByZW5kZXJTdHVkZW50cygpXG4iXX0=

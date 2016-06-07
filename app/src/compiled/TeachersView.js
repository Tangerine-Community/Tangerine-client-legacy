var TeachersView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

TeachersView = (function(superClass) {
  extend(TeachersView, superClass);

  function TeachersView() {
    return TeachersView.__super__.constructor.apply(this, arguments);
  }

  TeachersView.prototype.className = "TeachersView";

  TeachersView.prototype.events = {
    "click .edit_in_place": "editInPlace",
    "focusout .editing": "editing",
    "keyup    .editing": "editing",
    "keydown  .editing": "editing",
    'click    .change_password': "changePassword",
    'change   .show_password': "showPassword",
    'click    .save_password': 'savePassword',
    'click    .back': 'goBack'
  };

  TeachersView.prototype.goBack = function() {
    return window.history.back();
  };

  TeachersView.prototype.initialize = function(options) {
    this.teachers = options.teachers;
    this.users = options.users;
    this.usersByTeacherId = this.users.indexBy("teacherId");
    return this.teacherProperties = [
      {
        "key": "name",
        "editable": true,
        "headerless": true
      }, {
        "key": "first",
        "label": "First",
        "editable": true,
        "escaped": true
      }, {
        "key": "last",
        "label": "Last",
        "editable": true,
        "escaped": true
      }, {
        "key": "gender",
        "label": "Gender",
        "editable": true
      }, {
        "key": "school",
        "label": "School name",
        "editable": true
      }, {
        "key": "contact",
        "label": "Contact Information",
        "editable": true
      }
    ];
  };

  TeachersView.prototype.showPassword = function(event) {
    var $target, teacherId;
    $target = $(event.target);
    teacherId = $target.attr("data-teacherId");
    if (this.$el.find("." + teacherId + "_password").attr("type") === "password") {
      return this.$el.find("." + teacherId + "_password").attr("type", "text");
    } else {
      return this.$el.find("." + teacherId + "_password").attr("type", "password");
    }
  };

  TeachersView.prototype.changePassword = function(event) {
    var $target, teacherId;
    $target = $(event.target);
    teacherId = $target.attr("data-teacherId");
    this.$el.find("." + teacherId + "_menu").toggleClass("confirmation");
    this.$el.find("." + teacherId).scrollTo();
    return this.$el.find("." + teacherId + "_password").focus();
  };

  TeachersView.prototype.savePassword = function(event) {
    var $target, teacherId, teacherModel, userModel;
    $target = $(event.target);
    teacherId = $target.attr("data-teacherId");
    teacherModel = this.teachers.get(teacherId);
    userModel = this.usersByTeacherId[teacherId][0];
    userModel.setPassword(this.$el.find("." + teacherId + "_password").val());
    return userModel.save(null, {
      success: (function(_this) {
        return function() {
          Utils.midAlert("Teacher's password saved");
          _this.$el.find("." + teacherId + "_password").val("");
          return _this.$el.find("." + teacherId + "_menu").toggleClass("confirmation");
        };
      })(this),
      error: (function(_this) {
        return function() {
          return Utils.midAlert("Save error");
        };
      })(this)
    });
  };

  TeachersView.prototype.render = function() {
    var backButton, deleteButton, html, teacherTable;
    teacherTable = this.getTeacherTable();
    deleteButton = Tangerine.settings.get("context") === "server" ? "<button class='command_red delete'>Delete</button>" : "";
    if (Tangerine.settings.get("context") !== "server") {
      backButton = "<button class='navigation back'>" + (t('back')) + "</button>";
    }
    html = (backButton || '') + " <h1>Teachers</h1> <div id='teacher_table_container'> " + teacherTable + " </div>";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  TeachersView.prototype.updateTable = function() {
    return this.$el.find("#teacher_table_container").html(this.getTeacherTable());
  };

  TeachersView.prototype.getTeacherTable = function() {
    var html, i, j, len, len1, prop, ref, ref1, teacher;
    html = "";
    ref = this.teachers.models;
    for (i = 0, len = ref.length; i < len; i++) {
      teacher = ref[i];
      html += "<table class='class_table teachers " + teacher.id + "' > <tbody>";
      ref1 = this.teacherProperties;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        prop = ref1[j];
        html += this.propCookRow(prop, teacher);
      }
      html += "<tr class='last'><th><button class='change_password command' data-teacherId='" + teacher.id + "'>Change Password</button><br> <div class='" + teacher.id + "_menu confirmation'> <div class='menu_box'> <input type='password' class='" + teacher.id + "_password'> <table><tr> <th style='padding:0;'><label for='" + teacher.id + "_show_password'>Show password</label></th> <th style='padding:10px'><input type='checkbox' id='" + teacher.id + "_show_password' class='show_password' data-teacherId='" + teacher.id + "'></th> </tr></table> <button class='save_password command' data-teacherId='" + teacher.id + "'>Save</button> </div> </div> </th> </tr> </tbody> </table>";
    }
    return html;
  };

  TeachersView.prototype.propCookRow = function(prop, teacher) {
    var header;
    if (prop.headerless) {
      prop.tagName = "th";
    } else {
      header = "<th>" + prop.label + "</th>";
    }
    return "<tr>" + (header || "") + (this.propCook(prop, teacher)) + "</tr>";
  };

  TeachersView.prototype.propCook = function(prop, teacher) {
    var editOrNot, numberOrNot, tagName, value;
    value = prop.key != null ? teacher.get(prop.key) : "&nbsp;";
    value = prop.escape ? teacher.escape(prop.key) : value;
    if (value == null) {
      value = "_";
    }
    tagName = prop.tagName || "td";
    editOrNot = prop.editable ? "edit_in_place" : "";
    numberOrNot = _.isNumber(value) ? "data-isNumber='true'" : "data-isNumber='false'";
    return "<" + tagName + " class='" + editOrNot + "'><span data-teacherId='" + teacher.id + "' data-key='" + prop.key + "' data-value='" + value + "' " + editOrNot + " " + numberOrNot + ">" + value + "</div></" + tagName + ">";
  };

  TeachersView.prototype.editInPlace = function(event) {
    var $span, $target, $td, $textarea, classes, guid, isNumber, key, margins, oldValue, teacher, teacherId, transferVariables;
    if (this.alreadyEditing) {
      return;
    }
    this.alreadyEditing = true;
    $span = $(event.target);
    if ($span.prop("tagName") === "TD") {
      $span = $span.find("span");
      if ($span.length === 0) {
        return;
      }
    }
    $td = $span.parent();
    this.$oldSpan = $span.clone();
    if ($span.prop("tagName") === "TEXTAREA") {
      return;
    }
    guid = Utils.guid();
    key = $span.attr("data-key");
    isNumber = $span.attr("data-isNumber") === "true";
    teacherId = $span.attr("data-teacherId");
    teacher = this.teachers.get(teacherId);
    oldValue = isNumber ? teacher.getNumber(key) : teacher.getString(key);
    $target = $(event.target);
    classes = ($target.attr("class") || "").replace("settings", "");
    margins = $target.css("margin");
    if (key === 'items') {
      oldValue = oldValue.join(" ");
    }
    transferVariables = "data-isNumber='" + isNumber + "' data-key='" + key + "' data-teacherId='" + teacherId + "' ";
    $td.html("<textarea id='" + guid + "' " + transferVariables + " class='editing " + classes + "' style='margin:" + margins + "'>" + oldValue + "</textarea>");
    $textarea = $("#" + guid);
    return $textarea.focus();
  };

  TeachersView.prototype.editing = function(event) {
    var $target, $td, attributes, isNumber, key, newValue, oldValue, teacher, teacherId;
    $target = $(event.target);
    $td = $target.parent();
    if (event.which === 27 || event.type === "focusout") {
      $target.remove();
      $td.html(this.$oldSpan);
      this.alreadyEditing = false;
      return;
    }
    if (!(event.which === 13 && event.type === "keydown")) {
      return true;
    }
    this.alreadyEditing = false;
    key = $target.attr("data-key");
    isNumber = $target.attr("data-isNumber") === "true";
    teacherId = $target.attr("data-teacherId");
    teacher = this.teachers.get(teacherId);
    oldValue = teacher.get(key);
    newValue = $target.val();
    newValue = isNumber ? parseInt(newValue) : newValue;
    if (key === "items") {
      newValue = newValue.replace(/\s+/g, ' ');
      if (/\t|,/.test(newValue)) {
        alert("Please remember\n\nGrid items are space \" \" delimited");
      }
      newValue = _.compact(newValue.split(" "));
    }
    if (String(newValue) !== String(oldValue)) {
      attributes = {};
      attributes[key] = newValue;
      teacher.save(attributes, {
        success: (function(_this) {
          return function() {
            Utils.topAlert("Teacher saved");
            return teacher.fetch({
              success: function() {
                return _this.updateTable();
              }
            });
          };
        })(this),
        error: (function(_this) {
          return function() {
            return teacher.fetch({
              success: function() {
                _this.updateTable();
                return alert("Please try to save again, it didn't work that time.");
              }
            });
          };
        })(this)
      });
    }
    return false;
  };

  return TeachersView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvdGVhY2hlci9UZWFjaGVyc1ZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsWUFBQTtFQUFBOzs7QUFBTTs7Ozs7Ozt5QkFFSixTQUFBLEdBQVc7O3lCQUVYLE1BQUEsR0FDRTtJQUFBLHNCQUFBLEVBQTBCLGFBQTFCO0lBQ0EsbUJBQUEsRUFBc0IsU0FEdEI7SUFFQSxtQkFBQSxFQUFzQixTQUZ0QjtJQUdBLG1CQUFBLEVBQXNCLFNBSHRCO0lBSUEsMkJBQUEsRUFBOEIsZ0JBSjlCO0lBS0EseUJBQUEsRUFBNEIsY0FMNUI7SUFNQSx5QkFBQSxFQUE0QixjQU41QjtJQU9BLGdCQUFBLEVBQW1CLFFBUG5COzs7eUJBU0YsTUFBQSxHQUFRLFNBQUE7V0FDTixNQUFNLENBQUMsT0FBTyxDQUFDLElBQWYsQ0FBQTtFQURNOzt5QkFHUixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFPLENBQUM7SUFDcEIsSUFBQyxDQUFBLEtBQUQsR0FBWSxPQUFPLENBQUM7SUFFcEIsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFlLFdBQWY7V0FFcEIsSUFBQyxDQUFBLGlCQUFELEdBQ0U7TUFDRTtRQUNFLEtBQUEsRUFBYSxNQURmO1FBRUUsVUFBQSxFQUFhLElBRmY7UUFHRSxZQUFBLEVBQWUsSUFIakI7T0FERixFQU1FO1FBQ0UsS0FBQSxFQUFhLE9BRGY7UUFFRSxPQUFBLEVBQWEsT0FGZjtRQUdFLFVBQUEsRUFBYSxJQUhmO1FBSUUsU0FBQSxFQUFhLElBSmY7T0FORixFQVlFO1FBQ0UsS0FBQSxFQUFhLE1BRGY7UUFFRSxPQUFBLEVBQWEsTUFGZjtRQUdFLFVBQUEsRUFBYSxJQUhmO1FBSUUsU0FBQSxFQUFhLElBSmY7T0FaRixFQWtCRTtRQUNFLEtBQUEsRUFBYSxRQURmO1FBRUUsT0FBQSxFQUFhLFFBRmY7UUFHRSxVQUFBLEVBQWEs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QUFBLElBQUEsQ0FBVDtRQUtBLEtBQUEsRUFBTyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNMLE9BQU8sQ0FBQyxLQUFSLENBQ0U7Y0FBQSxPQUFBLEVBQVMsU0FBQTtnQkFDUCxLQUFDLENBQUEsV0FBRCxDQUFBO3VCQUdBLEtBQUEsQ0FBTSxxREFBTjtjQUpPLENBQVQ7YUFERjtVQURLO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxQO09BREYsRUFIRjs7QUFrQkEsV0FBTztFQXREQTs7OztHQXRPZ0IsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvdGVhY2hlci9UZWFjaGVyc1ZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBUZWFjaGVyc1ZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIlRlYWNoZXJzVmlld1wiXG5cbiAgZXZlbnRzIDpcbiAgICBcImNsaWNrIC5lZGl0X2luX3BsYWNlXCIgIDogXCJlZGl0SW5QbGFjZVwiXG4gICAgXCJmb2N1c291dCAuZWRpdGluZ1wiIDogXCJlZGl0aW5nXCJcbiAgICBcImtleXVwICAgIC5lZGl0aW5nXCIgOiBcImVkaXRpbmdcIlxuICAgIFwia2V5ZG93biAgLmVkaXRpbmdcIiA6IFwiZWRpdGluZ1wiXG4gICAgJ2NsaWNrICAgIC5jaGFuZ2VfcGFzc3dvcmQnIDogXCJjaGFuZ2VQYXNzd29yZFwiXG4gICAgJ2NoYW5nZSAgIC5zaG93X3Bhc3N3b3JkJyA6IFwic2hvd1Bhc3N3b3JkXCJcbiAgICAnY2xpY2sgICAgLnNhdmVfcGFzc3dvcmQnIDogJ3NhdmVQYXNzd29yZCdcbiAgICAnY2xpY2sgICAgLmJhY2snIDogJ2dvQmFjaydcblxuICBnb0JhY2s6IC0+XG4gICAgd2luZG93Lmhpc3RvcnkuYmFjaygpXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQHRlYWNoZXJzID0gb3B0aW9ucy50ZWFjaGVyc1xuICAgIEB1c2VycyAgICA9IG9wdGlvbnMudXNlcnNcblxuICAgIEB1c2Vyc0J5VGVhY2hlcklkID0gQHVzZXJzLmluZGV4QnkoXCJ0ZWFjaGVySWRcIilcblxuICAgIEB0ZWFjaGVyUHJvcGVydGllcyA9IFxuICAgICAgW1xuICAgICAgICB7XG4gICAgICAgICAgXCJrZXlcIiAgICAgIDogXCJuYW1lXCJcbiAgICAgICAgICBcImVkaXRhYmxlXCIgOiB0cnVlXG4gICAgICAgICAgXCJoZWFkZXJsZXNzXCIgOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImtleVwiICAgICAgOiBcImZpcnN0XCJcbiAgICAgICAgICBcImxhYmVsXCIgICAgOiBcIkZpcnN0XCJcbiAgICAgICAgICBcImVkaXRhYmxlXCIgOiB0cnVlXG4gICAgICAgICAgXCJlc2NhcGVkXCIgIDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJrZXlcIiAgICAgIDogXCJsYXN0XCJcbiAgICAgICAgICBcImxhYmVsXCIgICAgOiBcIkxhc3RcIlxuICAgICAgICAgIFwiZWRpdGFibGVcIiA6IHRydWVcbiAgICAgICAgICBcImVzY2FwZWRcIiAgOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImtleVwiICAgICAgOiBcImdlbmRlclwiXG4gICAgICAgICAgXCJsYWJlbFwiICAgIDogXCJHZW5kZXJcIlxuICAgICAgICAgIFwiZWRpdGFibGVcIiA6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwia2V5XCIgICAgICA6IFwic2Nob29sXCJcbiAgICAgICAgICBcImxhYmVsXCIgICAgOiBcIlNjaG9vbCBuYW1lXCJcbiAgICAgICAgICBcImVkaXRhYmxlXCIgOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImtleVwiICAgICAgOiBcImNvbnRhY3RcIlxuICAgICAgICAgIFwibGFiZWxcIiAgICA6IFwiQ29udGFjdCBJbmZvcm1hdGlvblwiXG4gICAgICAgICAgXCJlZGl0YWJsZVwiIDogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgXVxuXG4gIHNob3dQYXNzd29yZDogKGV2ZW50KSAtPlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICB0ZWFjaGVySWQgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLXRlYWNoZXJJZFwiKVxuICAgIGlmIEAkZWwuZmluZChcIi4je3RlYWNoZXJJZH1fcGFzc3dvcmRcIikuYXR0cihcInR5cGVcIikgPT0gXCJwYXNzd29yZFwiXG4gICAgICBAJGVsLmZpbmQoXCIuI3t0ZWFjaGVySWR9X3Bhc3N3b3JkXCIpLmF0dHIoXCJ0eXBlXCIsIFwidGV4dFwiKVxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIi4je3RlYWNoZXJJZH1fcGFzc3dvcmRcIikuYXR0cihcInR5cGVcIiwgXCJwYXNzd29yZFwiKVxuXG5cbiAgY2hhbmdlUGFzc3dvcmQ6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgdGVhY2hlcklkID0gJHRhcmdldC5hdHRyKFwiZGF0YS10ZWFjaGVySWRcIilcbiAgICBAJGVsLmZpbmQoXCIuI3t0ZWFjaGVySWR9X21lbnVcIikudG9nZ2xlQ2xhc3MoXCJjb25maXJtYXRpb25cIilcbiAgICBAJGVsLmZpbmQoXCIuI3t0ZWFjaGVySWR9XCIpLnNjcm9sbFRvKClcbiAgICBAJGVsLmZpbmQoXCIuI3t0ZWFjaGVySWR9X3Bhc3N3b3JkXCIpLmZvY3VzKClcblxuICBzYXZlUGFzc3dvcmQ6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgdGVhY2hlcklkID0gJHRhcmdldC5hdHRyKFwiZGF0YS10ZWFjaGVySWRcIilcblxuICAgIHRlYWNoZXJNb2RlbCA9IEB0ZWFjaGVycy5nZXQodGVhY2hlcklkKVxuICAgIHVzZXJNb2RlbCAgICA9IEB1c2Vyc0J5VGVhY2hlcklkW3RlYWNoZXJJZF1bMF1cbiAgICB1c2VyTW9kZWwuc2V0UGFzc3dvcmQgQCRlbC5maW5kKFwiLiN7dGVhY2hlcklkfV9wYXNzd29yZFwiKS52YWwoKVxuICAgIHVzZXJNb2RlbC5zYXZlIG51bGwsXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBVdGlscy5taWRBbGVydCBcIlRlYWNoZXIncyBwYXNzd29yZCBzYXZlZFwiXG4gICAgICAgIEAkZWwuZmluZChcIi4je3RlYWNoZXJJZH1fcGFzc3dvcmRcIikudmFsKFwiXCIpXG4gICAgICAgIEAkZWwuZmluZChcIi4je3RlYWNoZXJJZH1fbWVudVwiKS50b2dnbGVDbGFzcyhcImNvbmZpcm1hdGlvblwiKVxuICAgICAgZXJyb3I6ID0+XG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU2F2ZSBlcnJvclwiXG5cblxuXG4gIHJlbmRlcjogLT5cblxuICAgIHRlYWNoZXJUYWJsZSA9IEBnZXRUZWFjaGVyVGFibGUoKVxuXG4gICAgZGVsZXRlQnV0dG9uID0gaWYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgPT0gXCJzZXJ2ZXJcIiB0aGVuIFwiPGJ1dHRvbiBjbGFzcz0nY29tbWFuZF9yZWQgZGVsZXRlJz5EZWxldGU8L2J1dHRvbj5cIiBlbHNlIFwiXCJcblxuICAgIGJhY2tCdXR0b24gPSBcIlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBiYWNrJz4je3QoJ2JhY2snKX08L2J1dHRvbj5cbiAgICBcIiB1bmxlc3MgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgaXMgXCJzZXJ2ZXJcIlxuXG4gICAgaHRtbCA9IFwiXG5cbiAgICAgICN7YmFja0J1dHRvbnx8Jyd9XG5cbiAgICAgIDxoMT5UZWFjaGVyczwvaDE+XG5cbiAgICAgIDxkaXYgaWQ9J3RlYWNoZXJfdGFibGVfY29udGFpbmVyJz5cbiAgICAgICAgI3t0ZWFjaGVyVGFibGV9XG4gICAgICA8L2Rpdj5cblxuICAgIFwiXG5cbiAgICBAJGVsLmh0bWwgaHRtbFxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gIHVwZGF0ZVRhYmxlOiAtPiBAJGVsLmZpbmQoXCIjdGVhY2hlcl90YWJsZV9jb250YWluZXJcIikuaHRtbCBAZ2V0VGVhY2hlclRhYmxlKClcblxuICBnZXRUZWFjaGVyVGFibGU6IC0+XG5cbiAgICBodG1sID0gXCJcIlxuXG4gICAgZm9yIHRlYWNoZXIgaW4gQHRlYWNoZXJzLm1vZGVsc1xuXG4gICAgICBodG1sICs9IFwiXG4gICAgICA8dGFibGUgY2xhc3M9J2NsYXNzX3RhYmxlIHRlYWNoZXJzICN7dGVhY2hlci5pZH0nID5cbiAgICAgICAgPHRib2R5PlxuICAgICAgXCIgIFxuXG4gICAgICBmb3IgcHJvcCBpbiBAdGVhY2hlclByb3BlcnRpZXNcbiAgICAgICAgaHRtbCArPSBAcHJvcENvb2tSb3cocHJvcCwgdGVhY2hlcilcblxuICAgICAgaHRtbCArPSBcIlxuICAgICAgICAgIDx0ciBjbGFzcz0nbGFzdCc+PHRoPjxidXR0b24gY2xhc3M9J2NoYW5nZV9wYXNzd29yZCBjb21tYW5kJyBkYXRhLXRlYWNoZXJJZD0nI3t0ZWFjaGVyLmlkfSc+Q2hhbmdlIFBhc3N3b3JkPC9idXR0b24+PGJyPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPScje3RlYWNoZXIuaWR9X21lbnUgY29uZmlybWF0aW9uJz5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSdwYXNzd29yZCcgY2xhc3M9JyN7dGVhY2hlci5pZH1fcGFzc3dvcmQnPlxuICAgICAgICAgICAgICAgIDx0YWJsZT48dHI+XG4gICAgICAgICAgICAgICAgICA8dGggc3R5bGU9J3BhZGRpbmc6MDsnPjxsYWJlbCBmb3I9JyN7dGVhY2hlci5pZH1fc2hvd19wYXNzd29yZCc+U2hvdyBwYXNzd29yZDwvbGFiZWw+PC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT0ncGFkZGluZzoxMHB4Jz48aW5wdXQgdHlwZT0nY2hlY2tib3gnIGlkPScje3RlYWNoZXIuaWR9X3Nob3dfcGFzc3dvcmQnIGNsYXNzPSdzaG93X3Bhc3N3b3JkJyBkYXRhLXRlYWNoZXJJZD0nI3t0ZWFjaGVyLmlkfSc+PC90aD5cbiAgICAgICAgICAgICAgICA8L3RyPjwvdGFibGU+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nc2F2ZV9wYXNzd29yZCBjb21tYW5kJyBkYXRhLXRlYWNoZXJJZD0nI3t0ZWFjaGVyLmlkfSc+U2F2ZTwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8L3RoPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgIDwvdGJvZHk+XG4gICAgICA8L3RhYmxlPlxuICAgICAgXCJcblxuICAgIHJldHVybiBodG1sXG5cblxuICBwcm9wQ29va1JvdzogKHByb3AsIHRlYWNoZXIpIC0+XG5cbiAgICBpZiBwcm9wLmhlYWRlcmxlc3NcbiAgICAgIHByb3AudGFnTmFtZSA9IFwidGhcIlxuICAgIGVsc2VcbiAgICAgIGhlYWRlciA9IFwiPHRoPiN7cHJvcC5sYWJlbH08L3RoPlwiIFxuXG4gICAgXCI8dHI+I3toZWFkZXJ8fFwiXCJ9I3tAcHJvcENvb2socHJvcCwgdGVhY2hlcil9PC90cj5cIlxuXG4gIHByb3BDb29rOiAocHJvcCwgdGVhY2hlciktPlxuXG4gICAgIyBjb29rIHRoZSB2YWx1ZVxuICAgIHZhbHVlID0gaWYgcHJvcC5rZXk/ICAgdGhlbiB0ZWFjaGVyLmdldChwcm9wLmtleSkgICAgZWxzZSBcIiZuYnNwO1wiXG4gICAgdmFsdWUgPSBpZiBwcm9wLmVzY2FwZSB0aGVuIHRlYWNoZXIuZXNjYXBlKHByb3Aua2V5KSBlbHNlIHZhbHVlXG4gICAgdmFsdWUgPSBcIl9cIiBpZiBub3QgdmFsdWU/XG5cbiAgICAjIGNhbGN1bGF0ZSB0YWdcbiAgICB0YWdOYW1lID0gcHJvcC50YWdOYW1lIHx8IFwidGRcIlxuXG4gICAgIyB3aGF0IGlzIGl0XG4gICAgZWRpdE9yTm90ICAgPSBpZiBwcm9wLmVkaXRhYmxlIHRoZW4gXCJlZGl0X2luX3BsYWNlXCIgZWxzZSBcIlwiXG5cbiAgICBudW1iZXJPck5vdCA9IGlmIF8uaXNOdW1iZXIodmFsdWUpIHRoZW4gXCJkYXRhLWlzTnVtYmVyPSd0cnVlJ1wiIGVsc2UgXCJkYXRhLWlzTnVtYmVyPSdmYWxzZSdcIiBcblxuICAgIHJldHVybiBcIjwje3RhZ05hbWV9IGNsYXNzPScje2VkaXRPck5vdH0nPjxzcGFuIGRhdGEtdGVhY2hlcklkPScje3RlYWNoZXIuaWR9JyBkYXRhLWtleT0nI3twcm9wLmtleX0nIGRhdGEtdmFsdWU9JyN7dmFsdWV9JyAje2VkaXRPck5vdH0gI3tudW1iZXJPck5vdH0+I3t2YWx1ZX08L2Rpdj48LyN7dGFnTmFtZX0+XCJcblxuXG4gIGVkaXRJblBsYWNlOiAoZXZlbnQpIC0+XG5cbiAgICByZXR1cm4gaWYgQGFscmVhZHlFZGl0aW5nXG4gICAgQGFscmVhZHlFZGl0aW5nID0gdHJ1ZVxuXG4gICAgIyBzYXZlIHN0YXRlXG4gICAgIyByZXBsYWNlIHdpdGggdGV4dCBhcmVhXG4gICAgIyBvbiBzYXZlLCBzYXZlIGFuZCByZS1yZXBsYWNlXG4gICAgJHNwYW4gPSAkKGV2ZW50LnRhcmdldClcblxuICAgIGlmICRzcGFuLnByb3AoXCJ0YWdOYW1lXCIpID09IFwiVERcIlxuICAgICAgJHNwYW4gPSAkc3Bhbi5maW5kKFwic3BhblwiKVxuICAgICAgcmV0dXJuIGlmICRzcGFuLmxlbmd0aCA9PSAwXG4gICAgJHRkICA9ICRzcGFuLnBhcmVudCgpXG5cbiAgICBAJG9sZFNwYW4gPSAkc3Bhbi5jbG9uZSgpXG5cbiAgICByZXR1cm4gaWYgJHNwYW4ucHJvcChcInRhZ05hbWVcIikgPT0gXCJURVhUQVJFQVwiXG5cbiAgICBndWlkICAgICAgICAgPSBVdGlscy5ndWlkKClcblxuICAgIGtleSAgICAgICAgICA9ICRzcGFuLmF0dHIoXCJkYXRhLWtleVwiKVxuICAgIGlzTnVtYmVyICAgICA9ICRzcGFuLmF0dHIoXCJkYXRhLWlzTnVtYmVyXCIpID09IFwidHJ1ZVwiXG5cbiAgICB0ZWFjaGVySWQgICAgPSAkc3Bhbi5hdHRyKFwiZGF0YS10ZWFjaGVySWRcIilcbiAgICB0ZWFjaGVyICAgICAgPSBAdGVhY2hlcnMuZ2V0KHRlYWNoZXJJZClcbiAgICBvbGRWYWx1ZSAgICAgPSBcbiAgICAgIGlmIGlzTnVtYmVyIFxuICAgICAgICB0ZWFjaGVyLmdldE51bWJlcihrZXkpXG4gICAgICBlbHNlXG4gICAgICAgIHRlYWNoZXIuZ2V0U3RyaW5nKGtleSlcblxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBjbGFzc2VzID0gKCR0YXJnZXQuYXR0cihcImNsYXNzXCIpIHx8IFwiXCIpLnJlcGxhY2UoXCJzZXR0aW5nc1wiLFwiXCIpXG4gICAgbWFyZ2lucyA9ICR0YXJnZXQuY3NzKFwibWFyZ2luXCIpXG5cbiAgICAjc3BlY2lhbCBjYXNlXG4gICAgb2xkVmFsdWUgPSBvbGRWYWx1ZS5qb2luIFwiIFwiIGlmIGtleSA9PSAnaXRlbXMnXG5cbiAgICB0cmFuc2ZlclZhcmlhYmxlcyA9IFwiZGF0YS1pc051bWJlcj0nI3tpc051bWJlcn0nIGRhdGEta2V5PScje2tleX0nIGRhdGEtdGVhY2hlcklkPScje3RlYWNoZXJJZH0nIFwiXG5cbiAgICAjIHNldHMgd2lkdGgvaGVpZ2h0IHdpdGggc3R5bGUgYXR0cmlidXRlXG4gICAgJHRkLmh0bWwoXCI8dGV4dGFyZWEgaWQ9JyN7Z3VpZH0nICN7dHJhbnNmZXJWYXJpYWJsZXN9IGNsYXNzPSdlZGl0aW5nICN7Y2xhc3Nlc30nIHN0eWxlPSdtYXJnaW46I3ttYXJnaW5zfSc+I3tvbGRWYWx1ZX08L3RleHRhcmVhPlwiKVxuICAgICMgc3R5bGU9J3dpZHRoOiN7b2xkV2lkdGh9cHg7IGhlaWdodDogI3tvbGRIZWlnaHR9cHg7J1xuICAgICR0ZXh0YXJlYSA9ICQoXCIjI3tndWlkfVwiKVxuICAgICR0ZXh0YXJlYS5mb2N1cygpXG5cbiAgZWRpdGluZzogKGV2ZW50KSAtPlxuXG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgICR0ZCA9ICR0YXJnZXQucGFyZW50KClcblxuICAgIGlmIGV2ZW50LndoaWNoID09IDI3IG9yIGV2ZW50LnR5cGUgPT0gXCJmb2N1c291dFwiXG4gICAgICAkdGFyZ2V0LnJlbW92ZSgpXG4gICAgICAkdGQuaHRtbChAJG9sZFNwYW4pXG4gICAgICBAYWxyZWFkeUVkaXRpbmcgPSBmYWxzZVxuICAgICAgcmV0dXJuXG5cbiAgICAjIGFjdCBub3JtYWwsIHVubGVzcyBpdCdzIGFuIGVudGVyIGtleSBvbiBrZXlkb3duXG4gICAgcmV0dXJuIHRydWUgdW5sZXNzIGV2ZW50LndoaWNoID09IDEzIGFuZCBldmVudC50eXBlID09IFwia2V5ZG93blwiXG5cbiAgICBAYWxyZWFkeUVkaXRpbmcgPSBmYWxzZVxuXG4gICAga2V5ICAgICAgICAgID0gJHRhcmdldC5hdHRyKFwiZGF0YS1rZXlcIilcbiAgICBpc051bWJlciAgICAgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLWlzTnVtYmVyXCIpID09IFwidHJ1ZVwiXG5cbiAgICB0ZWFjaGVySWQgICAgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLXRlYWNoZXJJZFwiKVxuICAgIHRlYWNoZXIgICAgICA9IEB0ZWFjaGVycy5nZXQodGVhY2hlcklkKVxuICAgIG9sZFZhbHVlICAgICA9IHRlYWNoZXIuZ2V0KGtleSlcblxuICAgIG5ld1ZhbHVlID0gJHRhcmdldC52YWwoKVxuICAgIG5ld1ZhbHVlID0gaWYgaXNOdW1iZXIgdGhlbiBwYXJzZUludChuZXdWYWx1ZSkgZWxzZSBuZXdWYWx1ZVxuXG4gICAgI3NwZWNpYWwgY2FzZVxuXG4gICAgIyB0aGlzIGlzIG5vdCBEUlkuIHJlcGVhdGVkIGluIGdyaWQgcHJvdG90eXBlLlxuICAgIGlmIGtleSA9PSBcIml0ZW1zXCJcbiAgICAgICMgY2xlYW4gd2hpdGVzcGFjZSwgZ2l2ZSByZW1pbmRlciBpZiB0YWJzIG9yIGNvbW1hcyBmb3VuZCwgY29udmVydCBiYWNrIHRvIGFycmF5XG4gICAgICBuZXdWYWx1ZSA9IG5ld1ZhbHVlLnJlcGxhY2UoL1xccysvZywgJyAnKVxuICAgICAgaWYgL1xcdHwsLy50ZXN0KG5ld1ZhbHVlKSB0aGVuIGFsZXJ0IFwiUGxlYXNlIHJlbWVtYmVyXFxuXFxuR3JpZCBpdGVtcyBhcmUgc3BhY2UgXFxcIiBcXFwiIGRlbGltaXRlZFwiXG4gICAgICBuZXdWYWx1ZSA9IF8uY29tcGFjdCBuZXdWYWx1ZS5zcGxpdChcIiBcIilcblxuICAgICMgSWYgdGhlcmUgd2FzIGEgY2hhbmdlLCBzYXZlIGl0XG4gICAgaWYgU3RyaW5nKG5ld1ZhbHVlKSAhPSBTdHJpbmcob2xkVmFsdWUpXG4gICAgICBhdHRyaWJ1dGVzID0ge31cbiAgICAgIGF0dHJpYnV0ZXNba2V5XSA9IG5ld1ZhbHVlXG4gICAgICB0ZWFjaGVyLnNhdmUgYXR0cmlidXRlcyxcbiAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICBVdGlscy50b3BBbGVydCBcIlRlYWNoZXIgc2F2ZWRcIlxuICAgICAgICAgIHRlYWNoZXIuZmV0Y2ggXG4gICAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgICBAdXBkYXRlVGFibGUoKVxuICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICB0ZWFjaGVyLmZldGNoIFxuICAgICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgICAgQHVwZGF0ZVRhYmxlKClcbiAgICAgICAgICAgICAgIyBpZGVhbGx5IHdlIHdvdWxkbid0IGhhdmUgdG8gc2F2ZSB0aGlzIGJ1dCBjb25mbGljdHMgaGFwcGVuIHNvbWV0aW1lc1xuICAgICAgICAgICAgICAjIEBUT0RPIG1ha2UgdGhlIG1vZGVsIHRyeSBhZ2FpbiB3aGVuIHVuc3VjY2Vzc2Z1bC5cbiAgICAgICAgICAgICAgYWxlcnQgXCJQbGVhc2UgdHJ5IHRvIHNhdmUgYWdhaW4sIGl0IGRpZG4ndCB3b3JrIHRoYXQgdGltZS5cIlxuICAgIFxuICAgICMgdGhpcyBlbnN1cmVzIHdlIGRvIG5vdCBpbnNlcnQgYSBuZXdsaW5lIGNoYXJhY3RlciB3aGVuIHdlIHByZXNzIGVudGVyXG4gICAgcmV0dXJuIGZhbHNlXG4iXX0=

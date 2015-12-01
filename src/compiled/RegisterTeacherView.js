var RegisterTeacherView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

RegisterTeacherView = (function(superClass) {
  extend(RegisterTeacherView, superClass);

  function RegisterTeacherView() {
    return RegisterTeacherView.__super__.constructor.apply(this, arguments);
  }

  RegisterTeacherView.prototype.className = "RegisterTeacherView";

  RegisterTeacherView.prototype.events = {
    'click .register': 'register',
    'click .cancel': 'cancel'
  };

  RegisterTeacherView.prototype.initialize = function(options) {
    this.name = options.name;
    this.pass = options.pass;
    return this.fields = ["first", "last", "gender", "school", "contact"];
  };

  RegisterTeacherView.prototype.cancel = function() {
    return Tangerine.router.login();
  };

  RegisterTeacherView.prototype.register = function() {
    return this.validate((function(_this) {
      return function() {
        return _this.saveUser();
      };
    })(this));
  };

  RegisterTeacherView.prototype.validate = function(callback) {
    var element, errors, i, len, ref;
    errors = false;
    ref = this.fields;
    for (i = 0, len = ref.length; i < len; i++) {
      element = ref[i];
      if (_.isEmpty(this[element].val())) {
        this.$el.find("#" + element + "_message").html("Please fill out this field.");
        errors = true;
      } else {
        this.$el.find("#" + element + "_message").html("");
      }
    }
    if (errors) {
      return Utils.midAlert("Please correct the errors on this page.");
    } else {
      return callback();
    }
  };

  RegisterTeacherView.prototype.saveUser = function() {
    var couchUserDoc, element, i, len, ref, teacher, teacherDoc;
    teacherDoc = {
      "name": this.name
    };
    ref = this.fields;
    for (i = 0, len = ref.length; i < len; i++) {
      element = ref[i];
      teacherDoc[element] = this[element].val();
    }
    couchUserDoc = {
      "name": this.name
    };
    teacher = new Teacher(teacherDoc);
    return teacher.save({
      "_id": Utils.humanGUID()
    }, {
      success: (function(_this) {
        return function() {
          return Tangerine.user.save({
            "teacherId": teacher.id
          }, {
            success: function() {
              Utils.midAlert("New teacher registered");
              return Tangerine.user.login(_this.name, _this.pass, {
                success: function() {
                  return Tangerine.router.landing();
                }
              });
            },
            error: function(error) {
              return Utils.midAlert("Registration error<br>" + error, 5000);
            }
          });
        };
      })(this)
    });
  };

  RegisterTeacherView.prototype.render = function() {
    var element, i, len, ref, x;
    this.$el.html("<h1>Register new teacher</h1> <table> <tr> <td class='small_grey'><b>Username</b></td> <td class='small_grey'>" + this.name + "</td> <td class='small_grey'><b>Password</b></td> <td class='small_grey'>" + (((function() {
      var i, len, ref, results;
      ref = this.pass;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        x = ref[i];
        results.push("*");
      }
      return results;
    }).call(this)).join('')) + "</td> </tr> </table> <div class='label_value'> <label for='first'>First name</label> <div id='first_message' class='messages'></div> <input id='first'> </div> <div class='label_value'> <label for='last'>Last Name</label> <div id='last_message' class='messages'></div> <input id='last'> </div> <div class='label_value'> <label for='gender'>Gender</label> <div id='gender_message' class='messages'></div> <input id='gender'> </div> <div class='label_value'> <label for='school'>School name</label> <div id='school_message' class='messages'></div> <input id='school'> </div> <div class='label_value'> <label for='contact'>Email address or mobile phone number</label> <div type='email' id='contact_message' class='messages'></div> <input id='contact'> </div> <button class='register command'>Register</button> <button class='cancel command'>Cancel</button>");
    ref = this.fields;
    for (i = 0, len = ref.length; i < len; i++) {
      element = ref[i];
      this[element] = this.$el.find("#" + element);
    }
    return this.trigger("rendered");
  };

  return RegisterTeacherView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvdGVhY2hlci9SZWdpc3RlclRlYWNoZXJWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLG1CQUFBO0VBQUE7OztBQUFNOzs7Ozs7O2dDQUVKLFNBQUEsR0FBWTs7Z0NBRVosTUFBQSxHQUNFO0lBQUEsaUJBQUEsRUFBb0IsVUFBcEI7SUFDQSxlQUFBLEVBQWtCLFFBRGxCOzs7Z0NBR0YsVUFBQSxHQUFZLFNBQUUsT0FBRjtJQUNWLElBQUMsQ0FBQSxJQUFELEdBQVEsT0FBTyxDQUFDO0lBQ2hCLElBQUMsQ0FBQSxJQUFELEdBQVEsT0FBTyxDQUFDO1dBQ2hCLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxPQUFELEVBQVUsTUFBVixFQUFrQixRQUFsQixFQUE0QixRQUE1QixFQUFzQyxTQUF0QztFQUhBOztnQ0FLWixNQUFBLEdBQVEsU0FBQTtXQUNOLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBakIsQ0FBQTtFQURNOztnQ0FHUixRQUFBLEdBQVUsU0FBQTtXQUNSLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO2VBQUcsS0FBQyxDQUFBLFFBQUQsQ0FBQTtNQUFIO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWO0VBRFE7O2dDQUdWLFFBQUEsR0FBVSxTQUFDLFFBQUQ7QUFFUixRQUFBO0lBQUEsTUFBQSxHQUFTO0FBQ1Q7QUFBQSxTQUFBLHFDQUFBOztNQUNFLElBQUcsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFFLENBQUEsT0FBQSxDQUFRLENBQUMsR0FBWCxDQUFBLENBQVYsQ0FBSDtRQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLEdBQUEsR0FBSSxPQUFKLEdBQVksVUFBdEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyw2QkFBdEM7UUFDQSxNQUFBLEdBQVMsS0FGWDtPQUFBLE1BQUE7UUFJRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxHQUFBLEdBQUksT0FBSixHQUFZLFVBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsRUFBdEMsRUFKRjs7QUFERjtJQU1BLElBQUcsTUFBSDthQUNFLEtBQUssQ0FBQyxRQUFOLENBQWUseUNBQWYsRUFERjtLQUFBLE1BQUE7YUFHRSxRQUFBLENBQUEsRUFIRjs7RUFUUTs7Z0NBY1YsUUFBQSxHQUFVLFNBQUE7QUFFUixRQUFBO0lBQUEsVUFBQSxHQUNFO01BQUEsTUFBQSxFQUFTLElBQUMsQ0FBQSxJQUFWOztBQUVGO0FBQUEsU0FBQSxxQ0FBQTs7TUFBQyxVQUFXLENBQUEsT0FBQSxDQUFYLEdBQXNCLElBQUUsQ0FBQSxPQUFBLENBQVEsQ0FBQyxHQUFYLENBQUE7QUFBdkI7SUFFQSxZQUFBLEdBQ0U7TUFBQSxNQUFBLEVBQVMsSUFBQyxDQUFBLElBQVY7O0lBRUYsT0FBQSxHQUFjLElBQUEsT0FBQSxDQUFRLFVBQVI7V0FDZCxPQUFPLENBQUMsSUFBUixDQUNFO01BQUEsS0FBQSxFQUFRLEtBQUssQ0FBQyxTQUFOLENBQUEsQ0FBUjtLQURGLEVBR0U7TUFBQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNQLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBZixDQUNFO1lBQUEsV0FBQSxFQUFjLE9BQU8sQ0FBQyxFQUF0QjtXQURGLEVBR0U7WUFBQSxPQUFBLEVBQVMsU0FBQTtjQUNQLEtBQUssQ0FBQyxRQUFOLENBQWUsd0JBQWY7cUJBQ0EsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFmLENBQXFCLEtBQUMsQ0FBQSxJQUF0QixFQUE0QixLQUFDLENBQUEsSUFBN0IsRUFBbUM7Z0JBQUEsT0FBQSxFQUFTLFNBQUE7eUJBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFqQixDQUFBO2dCQUFILENBQVQ7ZUFBbkM7WUFGTyxDQUFUO1lBR0EsS0FBQSxFQUFPLFNBQUMsS0FBRDtxQkFDTCxLQUFLLENBQUMsUUFBTixDQUFlLHdCQUFBLEdBQXlCLEtBQXhDLEVBQWlELElBQWpEO1lBREssQ0FIUDtXQUhGO1FBRE87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7S0FIRjtFQVhROztnQ0F5QlYsTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsZ0hBQUEsR0FLcUIsSUFBQyxDQUFBLElBTHRCLEdBSzJCLDJFQUwzQixHQU9vQixDQUFDOztBQUFDO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQUE7QUFBQTs7aUJBQUQsQ0FBb0IsQ0FBQyxJQUFyQixDQUEwQixFQUExQixDQUFELENBUHBCLEdBT21ELHMxQkFQN0Q7QUFxQ0E7QUFBQSxTQUFBLHFDQUFBOztNQUNFLElBQUUsQ0FBQSxPQUFBLENBQUYsR0FBYSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxHQUFBLEdBQUksT0FBZDtBQURmO1dBRUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBeENNOzs7O0dBMUR3QixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy90ZWFjaGVyL1JlZ2lzdGVyVGVhY2hlclZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSZWdpc3RlclRlYWNoZXJWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiUmVnaXN0ZXJUZWFjaGVyVmlld1wiXG5cbiAgZXZlbnRzIDpcbiAgICAnY2xpY2sgLnJlZ2lzdGVyJyA6ICdyZWdpc3RlcidcbiAgICAnY2xpY2sgLmNhbmNlbCcgOiAnY2FuY2VsJ1xuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG4gICAgQG5hbWUgPSBvcHRpb25zLm5hbWVcbiAgICBAcGFzcyA9IG9wdGlvbnMucGFzc1xuICAgIEBmaWVsZHMgPSBbXCJmaXJzdFwiLCBcImxhc3RcIiwgXCJnZW5kZXJcIiwgXCJzY2hvb2xcIiwgXCJjb250YWN0XCJdXG5cbiAgY2FuY2VsOiAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubG9naW4oKVxuXG4gIHJlZ2lzdGVyOiAtPlxuICAgIEB2YWxpZGF0ZSA9PiBAc2F2ZVVzZXIoKVxuXG4gIHZhbGlkYXRlOiAoY2FsbGJhY2spIC0+XG5cbiAgICBlcnJvcnMgPSBmYWxzZVxuICAgIGZvciBlbGVtZW50IGluIEBmaWVsZHNcbiAgICAgIGlmIF8uaXNFbXB0eShAW2VsZW1lbnRdLnZhbCgpKVxuICAgICAgICBAJGVsLmZpbmQoXCIjI3tlbGVtZW50fV9tZXNzYWdlXCIpLmh0bWwgXCJQbGVhc2UgZmlsbCBvdXQgdGhpcyBmaWVsZC5cIlxuICAgICAgICBlcnJvcnMgPSB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIEAkZWwuZmluZChcIiMje2VsZW1lbnR9X21lc3NhZ2VcIikuaHRtbCBcIlwiXG4gICAgaWYgZXJyb3JzIFxuICAgICAgVXRpbHMubWlkQWxlcnQgXCJQbGVhc2UgY29ycmVjdCB0aGUgZXJyb3JzIG9uIHRoaXMgcGFnZS5cIlxuICAgIGVsc2VcbiAgICAgIGNhbGxiYWNrKClcblxuICBzYXZlVXNlcjogLT5cblxuICAgIHRlYWNoZXJEb2MgPSBcbiAgICAgIFwibmFtZVwiIDogQG5hbWVcblxuICAgICh0ZWFjaGVyRG9jW2VsZW1lbnRdID0gQFtlbGVtZW50XS52YWwoKSkgZm9yIGVsZW1lbnQgaW4gQGZpZWxkc1xuXG4gICAgY291Y2hVc2VyRG9jID0gXG4gICAgICBcIm5hbWVcIiA6IEBuYW1lXG5cbiAgICB0ZWFjaGVyID0gbmV3IFRlYWNoZXIgdGVhY2hlckRvY1xuICAgIHRlYWNoZXIuc2F2ZSBcbiAgICAgIFwiX2lkXCIgOiBVdGlscy5odW1hbkdVSUQoKVxuICAgICxcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIFRhbmdlcmluZS51c2VyLnNhdmVcbiAgICAgICAgICBcInRlYWNoZXJJZFwiIDogdGVhY2hlci5pZFxuICAgICAgICAsXG4gICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiTmV3IHRlYWNoZXIgcmVnaXN0ZXJlZFwiXG4gICAgICAgICAgICBUYW5nZXJpbmUudXNlci5sb2dpbiBAbmFtZSwgQHBhc3MsIHN1Y2Nlc3M6IC0+IFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG4gICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiUmVnaXN0cmF0aW9uIGVycm9yPGJyPiN7ZXJyb3J9XCIsIDUwMDBcblxuXG4gIHJlbmRlcjogLT5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxoMT5SZWdpc3RlciBuZXcgdGVhY2hlcjwvaDE+XG4gICAgICA8dGFibGU+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQgY2xhc3M9J3NtYWxsX2dyZXknPjxiPlVzZXJuYW1lPC9iPjwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzPSdzbWFsbF9ncmV5Jz4je0BuYW1lfTwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzPSdzbWFsbF9ncmV5Jz48Yj5QYXNzd29yZDwvYj48L3RkPlxuICAgICAgICAgIDx0ZCBjbGFzcz0nc21hbGxfZ3JleSc+I3soXCIqXCIgZm9yIHggaW4gQHBhc3MpLmpvaW4oJycpfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICA8L3RhYmxlPlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdmaXJzdCc+Rmlyc3QgbmFtZTwvbGFiZWw+XG4gICAgICAgIDxkaXYgaWQ9J2ZpcnN0X21lc3NhZ2UnIGNsYXNzPSdtZXNzYWdlcyc+PC9kaXY+XG4gICAgICAgIDxpbnB1dCBpZD0nZmlyc3QnPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xhc3QnPkxhc3QgTmFtZTwvbGFiZWw+XG4gICAgICAgIDxkaXYgaWQ9J2xhc3RfbWVzc2FnZScgY2xhc3M9J21lc3NhZ2VzJz48L2Rpdj5cbiAgICAgICAgPGlucHV0IGlkPSdsYXN0Jz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdnZW5kZXInPkdlbmRlcjwvbGFiZWw+XG4gICAgICAgIDxkaXYgaWQ9J2dlbmRlcl9tZXNzYWdlJyBjbGFzcz0nbWVzc2FnZXMnPjwvZGl2PlxuICAgICAgICA8aW5wdXQgaWQ9J2dlbmRlcic+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nc2Nob29sJz5TY2hvb2wgbmFtZTwvbGFiZWw+XG4gICAgICAgIDxkaXYgaWQ9J3NjaG9vbF9tZXNzYWdlJyBjbGFzcz0nbWVzc2FnZXMnPjwvZGl2PlxuICAgICAgICA8aW5wdXQgaWQ9J3NjaG9vbCc+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nY29udGFjdCc+RW1haWwgYWRkcmVzcyBvciBtb2JpbGUgcGhvbmUgbnVtYmVyPC9sYWJlbD5cbiAgICAgICAgPGRpdiB0eXBlPSdlbWFpbCcgaWQ9J2NvbnRhY3RfbWVzc2FnZScgY2xhc3M9J21lc3NhZ2VzJz48L2Rpdj5cbiAgICAgICAgPGlucHV0IGlkPSdjb250YWN0Jz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGJ1dHRvbiBjbGFzcz0ncmVnaXN0ZXIgY29tbWFuZCc+UmVnaXN0ZXI8L2J1dHRvbj4gPGJ1dHRvbiBjbGFzcz0nY2FuY2VsIGNvbW1hbmQnPkNhbmNlbDwvYnV0dG9uPlxuICAgIFwiXG4gICAgZm9yIGVsZW1lbnQgaW4gQGZpZWxkc1xuICAgICAgQFtlbGVtZW50XSA9IEAkZWwuZmluZChcIiNcIitlbGVtZW50KVxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4iXX0=

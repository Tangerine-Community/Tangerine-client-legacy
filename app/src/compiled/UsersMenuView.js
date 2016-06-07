var UsersMenuView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

UsersMenuView = (function(superClass) {
  extend(UsersMenuView, superClass);

  function UsersMenuView() {
    return UsersMenuView.__super__.constructor.apply(this, arguments);
  }

  UsersMenuView.prototype.className = "UsersMenuView";

  UsersMenuView.prototype.events = {
    "click .admin": "selectAdmin",
    "click .reader": "selectReader",
    "click #add_admin": "addAdmin",
    "click #remove_admin": "removeAdmin",
    "click #add_reader": "addReader",
    "click #remove_reader": "removeReader"
  };

  UsersMenuView.prototype.selectAdmin = function(event) {
    return this.$el.find("#selected_admin").val($(event.target).attr("data-name"));
  };

  UsersMenuView.prototype.selectReader = function(event) {
    return this.$el.find("#selected_reader").val($(event.target).attr("data-name"));
  };

  UsersMenuView.prototype.addAdmin = function() {
    var user;
    user = this.$el.find("#selected_admin").val();
    return this.useRobbert("add_admin", user);
  };

  UsersMenuView.prototype.removeAdmin = function() {
    var user;
    user = this.$el.find("#selected_admin").val();
    return this.useRobbert("remove_admin", user);
  };

  UsersMenuView.prototype.addReader = function() {
    var user;
    user = this.$el.find("#selected_reader").val();
    return this.useRobbert("add_reader", user);
  };

  UsersMenuView.prototype.removeReader = function() {
    var user;
    user = this.$el.find("#selected_reader").val();
    return this.useRobbert("remove_reader", user);
  };

  UsersMenuView.prototype.useRobbert = function(action, user) {
    return Utils.passwordPrompt((function(_this) {
      return function(auth_p) {
        return Robbert.request({
          "action": action,
          "user": user,
          "group": Tangerine.settings.get("groupName"),
          "auth_u": Tangerine.user.get("name"),
          "auth_p": auth_p,
          success: function(response) {
            Utils.midAlert(response.message);
            return Tangerine.user.fetch({
              success: function() {
                return _this.render();
              }
            });
          },
          error: function(error) {
            return Utils.midAlert("Server error\n\n" + error[1] + "\n" + error[2]);
          }
        });
      };
    })(this));
  };

  UsersMenuView.prototype.initialize = function() {};

  UsersMenuView.prototype.render = function() {
    var admin, adminOptions, admins, html, reader, readerOptions, readers;
    admins = Tangerine.user.dbAdmins;
    readers = Tangerine.user.dbReaders;
    adminOptions = ((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = admins.length; i < len; i++) {
        admin = admins[i];
        results.push("<li data-name='" + (_.escape(admin)) + "' class='admin icon'>" + (_.escape(admin)) + "</li>");
      }
      return results;
    })()).join("");
    readerOptions = readers.length > 0 ? ((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = readers.length; i < len; i++) {
        reader = readers[i];
        results.push("<li data-name='" + (_.escape(reader)) + "' class='reader icon'>" + (_.escape(reader)) + "</li>");
      }
      return results;
    })()).join("") : "<span class='grey'>No members yet.</span>";
    html = "<h1>Users</h1> <table> <tr> <th>Admins</th> <th>Members</th> </tr> <tr> <td> <input id='selected_admin'  value=''> <button id='add_admin' class='command'>+</button> <button id='remove_admin' class='command'>-</button> </td> <td> <input id='selected_reader' value=''> <button id='add_reader' class='command'>+</button> <button id='remove_reader' class='command'>-</button> </td> </tr> <tr> <td> <ul id='member_select' multiple='multiple' size='5'> " + adminOptions + " </ul> </td> <td> <ul id='reader_select' multiple='multiple' size='5'> " + readerOptions + " </ul> </td> </tr>";
    return this.$el.html(html);
  };

  return UsersMenuView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvdXNlci9Vc2Vyc01lbnVWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGFBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7MEJBRUosU0FBQSxHQUFXOzswQkFFWCxNQUFBLEdBQ0U7SUFBQSxjQUFBLEVBQWlCLGFBQWpCO0lBQ0EsZUFBQSxFQUFrQixjQURsQjtJQUVBLGtCQUFBLEVBQXlCLFVBRnpCO0lBR0EscUJBQUEsRUFBeUIsYUFIekI7SUFJQSxtQkFBQSxFQUF5QixXQUp6QjtJQUtBLHNCQUFBLEVBQXlCLGNBTHpCOzs7MEJBT0YsV0FBQSxHQUFhLFNBQUUsS0FBRjtXQUNYLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBQTRCLENBQUMsR0FBN0IsQ0FBaUMsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxJQUFoQixDQUFxQixXQUFyQixDQUFqQztFQURXOzswQkFHYixZQUFBLEdBQWMsU0FBRSxLQUFGO1dBQ1osSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsa0JBQVYsQ0FBNkIsQ0FBQyxHQUE5QixDQUFrQyxDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVIsQ0FBZSxDQUFDLElBQWhCLENBQXFCLFdBQXJCLENBQWxDO0VBRFk7OzBCQUdkLFFBQUEsR0FBVSxTQUFBO0FBQ1IsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVixDQUE0QixDQUFDLEdBQTdCLENBQUE7V0FDUCxJQUFDLENBQUEsVUFBRCxDQUFZLFdBQVosRUFBeUIsSUFBekI7RUFGUTs7MEJBSVYsV0FBQSxHQUFhLFNBQUE7QUFDWCxRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBQTRCLENBQUMsR0FBN0IsQ0FBQTtXQUNQLElBQUMsQ0FBQSxVQUFELENBQVksY0FBWixFQUE0QixJQUE1QjtFQUZXOzswQkFJYixTQUFBLEdBQVcsU0FBQTtBQUNULFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsa0JBQVYsQ0FBNkIsQ0FBQyxHQUE5QixDQUFBO1dBQ1AsSUFBQyxDQUFBLFVBQUQsQ0FBWSxZQUFaLEVBQTBCLElBQTFCO0VBRlM7OzBCQUlYLFlBQUEsR0FBYyxTQUFBO0FBQ1osUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxrQkFBVixDQUE2QixDQUFDLEdBQTlCLENBQUE7V0FDUCxJQUFDLENBQUEsVUFBRCxDQUFZLGVBQVosRUFBNkIsSUFBN0I7RUFGWTs7MEJBSWQsVUFBQSxHQUFhLFNBQUMsTUFBRCxFQUFTLElBQVQ7V0FDWCxLQUFLLENBQUMsY0FBTixDQUFxQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUUsTUFBRjtlQUNqQixPQUFPLENBQUMsT0FBUixDQUNFO1VBQUEsUUFBQSxFQUFXLE1BQVg7VUFDQSxNQUFBLEVBQVcsSUFEWDtVQUVBLE9BQUEsRUFBVyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQW5CLENBQXVCLFdBQXZCLENBRlg7VUFHQSxRQUFBLEVBQVcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFmLENBQW1CLE1BQW5CLENBSFg7VUFJQSxRQUFBLEVBQVcsTUFKWDtVQUtBLE9BQUEsRUFBVSxTQUFFLFFBQUY7WUFDUixLQUFLLENBQUMsUUFBTixDQUFlLFFBQVEsQ0FBQyxPQUF4QjttQkFDQSxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQWYsQ0FBcUI7Y0FBQSxPQUFBLEVBQVMsU0FBQTt1QkFDNUIsS0FBQyxDQUFBLE1BQUQsQ0FBQTtjQUQ0QixDQUFUO2FBQXJCO1VBRlEsQ0FMVjtVQVNBLEtBQUEsRUFBUSxTQUFDLEtBQUQ7bUJBQ04sS0FBSyxDQUFDLFFBQU4sQ0FBZSxrQkFBQSxHQUFtQixLQUFNLENBQUEsQ0FBQSxDQUF6QixHQUE0QixJQUE1QixHQUFnQyxLQUFNLENBQUEsQ0FBQSxDQUFyRDtVQURNLENBVFI7U0FERjtNQURpQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckI7RUFEVzs7MEJBZWIsVUFBQSxHQUFZLFNBQUEsR0FBQTs7MEJBRVosTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsTUFBQSxHQUFVLFNBQVMsQ0FBQyxJQUFJLENBQUM7SUFDekIsT0FBQSxHQUFVLFNBQVMsQ0FBQyxJQUFJLENBQUM7SUFFekIsWUFBQSxHQUFnQjs7QUFBQztXQUFBLHdDQUFBOztxQkFBQSxpQkFBQSxHQUFpQixDQUFDLENBQUMsQ0FBQyxNQUFGLENBQVMsS0FBVCxDQUFELENBQWpCLEdBQWtDLHVCQUFsQyxHQUF3RCxDQUFDLENBQUMsQ0FBQyxNQUFGLENBQVMsS0FBVCxDQUFELENBQXhELEdBQXlFO0FBQXpFOztRQUFELENBQXFHLENBQUMsSUFBdEcsQ0FBMkcsRUFBM0c7SUFDaEIsYUFBQSxHQUFtQixPQUFPLENBQUMsTUFBUixHQUFpQixDQUFwQixHQUEyQjs7QUFBQztXQUFBLHlDQUFBOztxQkFBQSxpQkFBQSxHQUFpQixDQUFDLENBQUMsQ0FBQyxNQUFGLENBQVMsTUFBVCxDQUFELENBQWpCLEdBQW1DLHdCQUFuQyxHQUEwRCxDQUFDLENBQUMsQ0FBQyxNQUFGLENBQVMsTUFBVCxDQUFELENBQTFELEdBQTRFO0FBQTVFOztRQUFELENBQTBHLENBQUMsSUFBM0csQ0FBZ0gsRUFBaEgsQ0FBM0IsR0FBb0o7SUFFcEssSUFBQSxHQUFPLGljQUFBLEdBc0JHLFlBdEJILEdBc0JnQix5RUF0QmhCLEdBMkJHLGFBM0JILEdBMkJpQjtXQU14QixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxJQUFWO0VBeENNOzs7O0dBbkRrQixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy91c2VyL1VzZXJzTWVudVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBVc2Vyc01lbnVWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJVc2Vyc01lbnVWaWV3XCJcblxuICBldmVudHM6XG4gICAgXCJjbGljayAuYWRtaW5cIiA6IFwic2VsZWN0QWRtaW5cIlxuICAgIFwiY2xpY2sgLnJlYWRlclwiIDogXCJzZWxlY3RSZWFkZXJcIlxuICAgIFwiY2xpY2sgI2FkZF9hZG1pblwiICAgICA6IFwiYWRkQWRtaW5cIlxuICAgIFwiY2xpY2sgI3JlbW92ZV9hZG1pblwiICA6IFwicmVtb3ZlQWRtaW5cIlxuICAgIFwiY2xpY2sgI2FkZF9yZWFkZXJcIiAgICA6IFwiYWRkUmVhZGVyXCJcbiAgICBcImNsaWNrICNyZW1vdmVfcmVhZGVyXCIgOiBcInJlbW92ZVJlYWRlclwiXG5cbiAgc2VsZWN0QWRtaW46ICggZXZlbnQgKSAtPlxuICAgIEAkZWwuZmluZChcIiNzZWxlY3RlZF9hZG1pblwiKS52YWwgJChldmVudC50YXJnZXQpLmF0dHIoXCJkYXRhLW5hbWVcIilcblxuICBzZWxlY3RSZWFkZXI6ICggZXZlbnQgKSAtPlxuICAgIEAkZWwuZmluZChcIiNzZWxlY3RlZF9yZWFkZXJcIikudmFsICQoZXZlbnQudGFyZ2V0KS5hdHRyKFwiZGF0YS1uYW1lXCIpXG5cbiAgYWRkQWRtaW46IC0+XG4gICAgdXNlciA9IEAkZWwuZmluZChcIiNzZWxlY3RlZF9hZG1pblwiKS52YWwoKVxuICAgIEB1c2VSb2JiZXJ0IFwiYWRkX2FkbWluXCIsIHVzZXJcblxuICByZW1vdmVBZG1pbjogLT5cbiAgICB1c2VyID0gQCRlbC5maW5kKFwiI3NlbGVjdGVkX2FkbWluXCIpLnZhbCgpXG4gICAgQHVzZVJvYmJlcnQgXCJyZW1vdmVfYWRtaW5cIiwgdXNlclxuXG4gIGFkZFJlYWRlcjogLT5cbiAgICB1c2VyID0gQCRlbC5maW5kKFwiI3NlbGVjdGVkX3JlYWRlclwiKS52YWwoKVxuICAgIEB1c2VSb2JiZXJ0IFwiYWRkX3JlYWRlclwiLCB1c2VyXG5cbiAgcmVtb3ZlUmVhZGVyOiAtPlxuICAgIHVzZXIgPSBAJGVsLmZpbmQoXCIjc2VsZWN0ZWRfcmVhZGVyXCIpLnZhbCgpXG4gICAgQHVzZVJvYmJlcnQgXCJyZW1vdmVfcmVhZGVyXCIsIHVzZXJcblxuICB1c2VSb2JiZXJ0IDogKGFjdGlvbiwgdXNlcikgLT5cbiAgICBVdGlscy5wYXNzd29yZFByb21wdCAoIGF1dGhfcCApID0+XG4gICAgICAgIFJvYmJlcnQucmVxdWVzdFxuICAgICAgICAgIFwiYWN0aW9uXCIgOiBhY3Rpb25cbiAgICAgICAgICBcInVzZXJcIiAgIDogdXNlclxuICAgICAgICAgIFwiZ3JvdXBcIiAgOiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBOYW1lXCIpICMgd2l0aG91dCBncm91cCBwcmVmaXhcbiAgICAgICAgICBcImF1dGhfdVwiIDogVGFuZ2VyaW5lLnVzZXIuZ2V0KFwibmFtZVwiKVxuICAgICAgICAgIFwiYXV0aF9wXCIgOiBhdXRoX3BcbiAgICAgICAgICBzdWNjZXNzIDogKCByZXNwb25zZSApID0+XG4gICAgICAgICAgICBVdGlscy5taWRBbGVydCByZXNwb25zZS5tZXNzYWdlXG4gICAgICAgICAgICBUYW5nZXJpbmUudXNlci5mZXRjaCBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgICBAcmVuZGVyKClcbiAgICAgICAgICBlcnJvciA6IChlcnJvcikgPT5cbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU2VydmVyIGVycm9yXFxuXFxuI3tlcnJvclsxXX1cXG4je2Vycm9yWzJdfVwiXG5cbiAgaW5pdGlhbGl6ZTogLT5cblxuICByZW5kZXI6IC0+XG4gICAgYWRtaW5zICA9IFRhbmdlcmluZS51c2VyLmRiQWRtaW5zXG4gICAgcmVhZGVycyA9IFRhbmdlcmluZS51c2VyLmRiUmVhZGVyc1xuXG4gICAgYWRtaW5PcHRpb25zICA9IChcIjxsaSBkYXRhLW5hbWU9JyN7Xy5lc2NhcGUoYWRtaW4pfScgY2xhc3M9J2FkbWluIGljb24nPiN7Xy5lc2NhcGUoYWRtaW4pfTwvbGk+XCIgZm9yIGFkbWluIGluIGFkbWlucykuam9pbihcIlwiKVxuICAgIHJlYWRlck9wdGlvbnMgPSBpZiByZWFkZXJzLmxlbmd0aCA+IDAgdGhlbiAoXCI8bGkgZGF0YS1uYW1lPScje18uZXNjYXBlKHJlYWRlcil9JyBjbGFzcz0ncmVhZGVyIGljb24nPiN7Xy5lc2NhcGUocmVhZGVyKX08L2xpPlwiIGZvciByZWFkZXIgaW4gcmVhZGVycykuam9pbihcIlwiKSBlbHNlIFwiPHNwYW4gY2xhc3M9J2dyZXknPk5vIG1lbWJlcnMgeWV0Ljwvc3Bhbj5cIlxuXG4gICAgaHRtbCA9IFwiXG4gICAgICA8aDE+VXNlcnM8L2gxPlxuICAgICAgPHRhYmxlPlxuICAgICAgPHRyPlxuICAgICAgICA8dGg+QWRtaW5zPC90aD5cbiAgICAgICAgPHRoPk1lbWJlcnM8L3RoPlxuICAgICAgPC90cj5cbiAgICAgIDx0cj5cbiAgICAgICAgPHRkPlxuICAgICAgICAgIDxpbnB1dCBpZD0nc2VsZWN0ZWRfYWRtaW4nICB2YWx1ZT0nJz5cbiAgICAgICAgICA8YnV0dG9uIGlkPSdhZGRfYWRtaW4nIGNsYXNzPSdjb21tYW5kJz4rPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBpZD0ncmVtb3ZlX2FkbWluJyBjbGFzcz0nY29tbWFuZCc+LTwvYnV0dG9uPlxuICAgICAgICA8L3RkPlxuICAgICAgICA8dGQ+XG4gICAgICAgICAgPGlucHV0IGlkPSdzZWxlY3RlZF9yZWFkZXInIHZhbHVlPScnPlxuICAgICAgICAgIDxidXR0b24gaWQ9J2FkZF9yZWFkZXInIGNsYXNzPSdjb21tYW5kJz4rPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBpZD0ncmVtb3ZlX3JlYWRlcicgY2xhc3M9J2NvbW1hbmQnPi08L2J1dHRvbj5cbiAgICAgICAgPC90ZD5cbiAgICAgIDwvdHI+XG4gICAgICA8dHI+XG4gICAgICAgIDx0ZD5cbiAgICAgICAgICA8dWwgaWQ9J21lbWJlcl9zZWxlY3QnIG11bHRpcGxlPSdtdWx0aXBsZScgc2l6ZT0nNSc+XG4gICAgICAgICAgICAje2FkbWluT3B0aW9uc31cbiAgICAgICAgICA8L3VsPlxuICAgICAgICA8L3RkPlxuICAgICAgICA8dGQ+XG4gICAgICAgICAgPHVsIGlkPSdyZWFkZXJfc2VsZWN0JyBtdWx0aXBsZT0nbXVsdGlwbGUnIHNpemU9JzUnPlxuICAgICAgICAgICAgI3tyZWFkZXJPcHRpb25zfVxuICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvdGQ+XG4gICAgICA8L3RyPlxuICAgIFwiXG5cbiAgICBAJGVsLmh0bWwgaHRtbFxuIl19

var GroupsView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

GroupsView = (function(superClass) {
  extend(GroupsView, superClass);

  function GroupsView() {
    return GroupsView.__super__.constructor.apply(this, arguments);
  }

  GroupsView.prototype.className = "GroupsView";

  GroupsView.prototype.events = {
    'click .account': 'gotoAccount',
    'click .goto': 'gotoGroup'
  };

  GroupsView.prototype.gotoAccount = function() {
    return Tangerine.router.navigate("account", true);
  };

  GroupsView.prototype.gotoGroup = function(event) {
    var group;
    group = $(event.target).attr("data-group");
    return window.location = Tangerine.settings.urlIndex(group, "assessments");
  };

  GroupsView.prototype.render = function() {
    var group, groups, html, i, j, len;
    groups = Tangerine.user.get("groups") || [];
    html = "<button class='account navigation'>Account</button> <h1>Groups</h1>";
    if (groups.length === 0) {
      html += "You are not yet a member of a group. Go to Account to join a group.";
    } else {
      for (i = j = 0, len = groups.length; j < len; i = ++j) {
        group = groups[i];
        html += "<button class='command goto' data-group='" + (_.escape(group)) + "'>" + group + "</button>";
      }
    }
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return GroupsView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvdXNlci9Hcm91cHNWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFVBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7dUJBRUosU0FBQSxHQUFXOzt1QkFFWCxNQUFBLEdBQ0U7SUFBQSxnQkFBQSxFQUFtQixhQUFuQjtJQUNBLGFBQUEsRUFBbUIsV0FEbkI7Ozt1QkFHRixXQUFBLEdBQWEsU0FBQTtXQUNYLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBMEIsU0FBMUIsRUFBcUMsSUFBckM7RUFEVzs7dUJBR2IsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUNULFFBQUE7SUFBQSxLQUFBLEdBQVEsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxJQUFoQixDQUFxQixZQUFyQjtXQUNSLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBbkIsQ0FBNEIsS0FBNUIsRUFBbUMsYUFBbkM7RUFGVDs7dUJBSVgsTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsTUFBQSxHQUFTLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBZixDQUFtQixRQUFuQixDQUFBLElBQWdDO0lBQ3pDLElBQUEsR0FBTztJQUtQLElBQUcsTUFBTSxDQUFDLE1BQVAsS0FBaUIsQ0FBcEI7TUFDRSxJQUFBLElBQVEsc0VBRFY7S0FBQSxNQUFBO0FBR0UsV0FBQSxnREFBQTs7UUFDRSxJQUFBLElBQVEsMkNBQUEsR0FBMkMsQ0FBQyxDQUFDLENBQUMsTUFBRixDQUFTLEtBQVQsQ0FBRCxDQUEzQyxHQUE0RCxJQUE1RCxHQUFnRSxLQUFoRSxHQUFzRTtBQURoRixPQUhGOztJQU1BLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQVY7V0FDQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFkTTs7OztHQWZlLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3VzZXIvR3JvdXBzVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEdyb3Vwc1ZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIkdyb3Vwc1ZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmFjY291bnQnIDogJ2dvdG9BY2NvdW50J1xuICAgICdjbGljayAuZ290bycgICAgOiAnZ290b0dyb3VwJ1xuXG4gIGdvdG9BY2NvdW50OiAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJhY2NvdW50XCIsIHRydWVcblxuICBnb3RvR3JvdXA6IChldmVudCkgLT5cbiAgICBncm91cCA9ICQoZXZlbnQudGFyZ2V0KS5hdHRyKFwiZGF0YS1ncm91cFwiKVxuICAgIHdpbmRvdy5sb2NhdGlvbiA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxJbmRleChncm91cCwgXCJhc3Nlc3NtZW50c1wiKVxuXG4gIHJlbmRlcjogLT5cbiAgICBncm91cHMgPSBUYW5nZXJpbmUudXNlci5nZXQoXCJncm91cHNcIikgfHwgW11cbiAgICBodG1sID0gXCJcbiAgICAgIDxidXR0b24gY2xhc3M9J2FjY291bnQgbmF2aWdhdGlvbic+QWNjb3VudDwvYnV0dG9uPlxuICAgICAgPGgxPkdyb3VwczwvaDE+XG4gICAgXCJcblxuICAgIGlmIGdyb3Vwcy5sZW5ndGggPT0gMFxuICAgICAgaHRtbCArPSBcIllvdSBhcmUgbm90IHlldCBhIG1lbWJlciBvZiBhIGdyb3VwLiBHbyB0byBBY2NvdW50IHRvIGpvaW4gYSBncm91cC5cIlxuICAgIGVsc2UgXG4gICAgICBmb3IgZ3JvdXAsIGkgaW4gZ3JvdXBzXG4gICAgICAgIGh0bWwgKz0gXCI8YnV0dG9uIGNsYXNzPSdjb21tYW5kIGdvdG8nIGRhdGEtZ3JvdXA9JyN7Xy5lc2NhcGUoZ3JvdXApfSc+I3tncm91cH08L2J1dHRvbj5cIlxuXG4gICAgQCRlbC5odG1sIGh0bWxcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiJdfQ==

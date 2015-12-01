var CsvMenuView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CsvMenuView = (function(superClass) {
  extend(CsvMenuView, superClass);

  function CsvMenuView() {
    return CsvMenuView.__super__.constructor.apply(this, arguments);
  }

  CsvMenuView.prototype.className = "CsvMenuView";

  CsvMenuView.prototype.initialize = function(options) {
    var groupName, klassId;
    klassId = options.parent.options.klass.id;
    groupName = Tangerine.settings.get("groupName");
    return document.location = "http://databases.tangerinecentral.org/_csv/class/" + groupName + "/" + klassId;
  };

  return CsvMenuView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVwb3J0L0Nzdk1lbnVWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFdBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7d0JBRUosU0FBQSxHQUFZOzt3QkFFWixVQUFBLEdBQVksU0FBQyxPQUFEO0FBQ1YsUUFBQTtJQUFBLE9BQUEsR0FBWSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDekMsU0FBQSxHQUFZLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBbkIsQ0FBdUIsV0FBdkI7V0FDWixRQUFRLENBQUMsUUFBVCxHQUFvQixtREFBQSxHQUFvRCxTQUFwRCxHQUE4RCxHQUE5RCxHQUFpRTtFQUgzRTs7OztHQUpZLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3JlcG9ydC9Dc3ZNZW51Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIENzdk1lbnVWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiQ3N2TWVudVZpZXdcIlxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIGtsYXNzSWQgICA9IG9wdGlvbnMucGFyZW50Lm9wdGlvbnMua2xhc3MuaWRcbiAgICBncm91cE5hbWUgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBOYW1lXCIpXG4gICAgZG9jdW1lbnQubG9jYXRpb24gPSBcImh0dHA6Ly9kYXRhYmFzZXMudGFuZ2VyaW5lY2VudHJhbC5vcmcvX2Nzdi9jbGFzcy8je2dyb3VwTmFtZX0vI3trbGFzc0lkfVwiXG4iXX0=

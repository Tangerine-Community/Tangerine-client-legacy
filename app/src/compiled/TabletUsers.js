var TabletUsers,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

TabletUsers = (function(superClass) {
  extend(TabletUsers, superClass);

  function TabletUsers() {
    return TabletUsers.__super__.constructor.apply(this, arguments);
  }

  TabletUsers.prototype.model = TabletUser;

  TabletUsers.prototype.url = 'user';

  TabletUsers.prototype.pouch = {
    viewOptions: {
      key: 'user'
    }
  };

  return TabletUsers;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvdXNlci9UYWJsZXRVc2Vycy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxXQUFBO0VBQUE7OztBQUFNOzs7Ozs7O3dCQUNKLEtBQUEsR0FBTzs7d0JBQ1AsR0FBQSxHQUFNOzt3QkFDTixLQUFBLEdBQ0U7SUFBQSxXQUFBLEVBQ0U7TUFBQSxHQUFBLEVBQU0sTUFBTjtLQURGOzs7OztHQUpzQixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy91c2VyL1RhYmxldFVzZXJzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgVGFibGV0VXNlcnMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG4gIG1vZGVsOiBUYWJsZXRVc2VyXG4gIHVybCA6ICd1c2VyJ1xuICBwb3VjaDpcbiAgICB2aWV3T3B0aW9uczpcbiAgICAgIGtleSA6ICd1c2VyJ1xuIl19

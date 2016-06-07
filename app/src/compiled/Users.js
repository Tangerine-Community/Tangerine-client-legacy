var Users,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Users = (function(superClass) {
  extend(Users, superClass);

  function Users() {
    return Users.__super__.constructor.apply(this, arguments);
  }

  Users.prototype.url = "user";

  Users.prototype.model = User;

  return Users;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvdXNlci9Vc2Vycy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxLQUFBO0VBQUE7OztBQUFNOzs7Ozs7O2tCQUNKLEdBQUEsR0FBUTs7a0JBQ1IsS0FBQSxHQUFROzs7O0dBRlUsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvdXNlci9Vc2Vycy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFVzZXJzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuICB1cmwgICA6IFwidXNlclwiXG4gIG1vZGVsIDogVXNlciJdfQ==

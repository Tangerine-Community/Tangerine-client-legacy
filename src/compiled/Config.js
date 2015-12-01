var Config,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Config = (function(superClass) {
  extend(Config, superClass);

  function Config() {
    return Config.__super__.constructor.apply(this, arguments);
  }

  Config.prototype.url = "config";

  Config.prototype.save = null;

  Config.prototype.getDefault = function(key) {
    return this.get("defaults")[key];
  };

  return Config;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvY29uZmlnL0NvbmZpZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxNQUFBO0VBQUE7OztBQUFNOzs7Ozs7O21CQUVKLEdBQUEsR0FBTTs7bUJBRU4sSUFBQSxHQUFPOzttQkFFUCxVQUFBLEdBQVksU0FBQyxHQUFEO1dBQ1YsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMLENBQWlCLENBQUEsR0FBQTtFQURQOzs7O0dBTk8sUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvY29uZmlnL0NvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIENvbmZpZyBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cbiAgdXJsIDogXCJjb25maWdcIlxuXG4gIHNhdmUgOiBudWxsXG5cbiAgZ2V0RGVmYXVsdDogKGtleSkgLT5cbiAgICBAZ2V0KFwiZGVmYXVsdHNcIilba2V5XVxuXG4iXX0=

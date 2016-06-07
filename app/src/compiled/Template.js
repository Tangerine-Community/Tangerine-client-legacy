var Template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Template = (function(superClass) {
  extend(Template, superClass);

  function Template() {
    return Template.__super__.constructor.apply(this, arguments);
  }

  Template.prototype.url = "template";

  return Template;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvdGVtcGxhdGUvVGVtcGxhdGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsUUFBQTtFQUFBOzs7QUFBTTs7Ozs7OztxQkFDTCxHQUFBLEdBQU07Ozs7R0FEZ0IsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvdGVtcGxhdGUvVGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBUZW1wbGF0ZSBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdHVybCA6IFwidGVtcGxhdGVcIiJdfQ==

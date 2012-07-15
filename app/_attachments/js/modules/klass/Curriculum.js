var Curriculum,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Curriculum = (function(_super) {

  __extends(Curriculum, _super);

  function Curriculum() {
    Curriculum.__super__.constructor.apply(this, arguments);
  }

  Curriculum.prototype.url = "curriculum";

  return Curriculum;

})(Backbone.Model);

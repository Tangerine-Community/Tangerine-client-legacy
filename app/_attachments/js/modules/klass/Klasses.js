var Klasses,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Klasses = (function(_super) {

  __extends(Klasses, _super);

  function Klasses() {
    Klasses.__super__.constructor.apply(this, arguments);
  }

  Klasses.prototype.model = Klass;

  Klasses.prototype.url = 'klass';

  return Klasses;

})(Backbone.Collection);

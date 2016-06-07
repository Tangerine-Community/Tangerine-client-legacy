var Curriculum,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Curriculum = (function(superClass) {
  extend(Curriculum, superClass);

  function Curriculum() {
    return Curriculum.__super__.constructor.apply(this, arguments);
  }

  Curriculum.prototype.url = "curriculum";

  return Curriculum;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvY3VycmljdWx1bS9DdXJyaWN1bHVtLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFVBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7dUJBRUosR0FBQSxHQUFNOzs7O0dBRmlCLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL2N1cnJpY3VsdW0vQ3VycmljdWx1bS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEN1cnJpY3VsdW0gZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG4gIHVybCA6IFwiY3VycmljdWx1bVwiXG4iXX0=

var Curricula,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Curricula = (function(superClass) {
  extend(Curricula, superClass);

  function Curricula() {
    return Curricula.__super__.constructor.apply(this, arguments);
  }

  Curricula.prototype.url = "curriculum";

  Curricula.prototype.model = Curriculum;

  Curricula.prototype.pouch = {
    viewOptions: {
      key: 'curriculum'
    }
  };

  return Curricula;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvY3VycmljdWx1bS9DdXJyaWN1bGEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsU0FBQTtFQUFBOzs7QUFBTTs7Ozs7OztzQkFFSixHQUFBLEdBQU07O3NCQUNOLEtBQUEsR0FBUTs7c0JBQ1IsS0FBQSxHQUNFO0lBQUEsV0FBQSxFQUNFO01BQUEsR0FBQSxFQUFNLFlBQU47S0FERjs7Ozs7R0FMb0IsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvY3VycmljdWx1bS9DdXJyaWN1bGEuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDdXJyaWN1bGEgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbiAgdXJsIDogXCJjdXJyaWN1bHVtXCJcbiAgbW9kZWwgOiBDdXJyaWN1bHVtXG4gIHBvdWNoOlxuICAgIHZpZXdPcHRpb25zOlxuICAgICAga2V5IDogJ2N1cnJpY3VsdW0nXG4iXX0=

var Question,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Question = (function(superClass) {
  extend(Question, superClass);

  function Question() {
    return Question.__super__.constructor.apply(this, arguments);
  }

  Question.prototype.url = "question";

  Question.prototype.config = {
    types: ["multiple", "single", "open"]
  };

  Question.prototype["default"] = {
    order: 0,
    prompt: "Is this an example question?",
    hint: "[hint or answer]",
    type: "single",
    otherWriteIn: false,
    options: [],
    linkedGridScore: 0,
    skipLink: null,
    skipRequirement: null
  };

  Question.prototype.initialize = function(options) {};

  return Question;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcXVlc3Rpb24vUXVlc3Rpb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLElBQUEsUUFBQTtFQUFBOzs7QUFBTTs7Ozs7OztxQkFFSixHQUFBLEdBQUs7O3FCQUVMLE1BQUEsR0FDRTtJQUFBLEtBQUEsRUFBUSxDQUFFLFVBQUYsRUFBYyxRQUFkLEVBQXdCLE1BQXhCLENBQVI7OztxQkFFRixVQUFBLEdBQ0U7SUFBQSxLQUFBLEVBQVMsQ0FBVDtJQUNBLE1BQUEsRUFBUyw4QkFEVDtJQUVBLElBQUEsRUFBUyxrQkFGVDtJQUtBLElBQUEsRUFBTyxRQUxQO0lBUUEsWUFBQSxFQUFlLEtBUmY7SUFTQSxPQUFBLEVBQWUsRUFUZjtJQVlBLGVBQUEsRUFBa0IsQ0FabEI7SUFlQSxRQUFBLEVBQWtCLElBZmxCO0lBZ0JBLGVBQUEsRUFBa0IsSUFoQmxCOzs7cUJBa0JGLFVBQUEsR0FBWSxTQUFFLE9BQUYsR0FBQTs7OztHQTFCUyxRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9xdWVzdGlvbi9RdWVzdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMgQFRPRE8gSSB0aGluayB0aGlzIGNhbiBiZSByZW1vdmVkLiB1cmwgc2hvdWxkIHN0YXkgXG5jbGFzcyBRdWVzdGlvbiBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cbiAgdXJsOiBcInF1ZXN0aW9uXCJcblxuICBjb25maWc6XG4gICAgdHlwZXMgOiBbIFwibXVsdGlwbGVcIiwgXCJzaW5nbGVcIiwgXCJvcGVuXCIgXVxuXG4gIGRlZmF1bHQ6XG4gICAgb3JkZXIgIDogMFxuICAgIHByb21wdCA6IFwiSXMgdGhpcyBhbiBleGFtcGxlIHF1ZXN0aW9uP1wiXG4gICAgaGludCAgIDogXCJbaGludCBvciBhbnN3ZXJdXCJcblxuICAgICMgbWFpbiBxdWVzdGlvbiB0eXBlc1xuICAgIHR5cGUgOiBcInNpbmdsZVwiXG5cbiAgICAjIHF1ZXN0aW9uIGZlYXR1cmVzXG4gICAgb3RoZXJXcml0ZUluIDogZmFsc2VcbiAgICBvcHRpb25zICAgICAgOiBbXSAjIHRyaWNreSBiaXQsIGNvbnRhaW5zIGBsYWJlbGAsYHZhbHVlYCBwcm9wZXJ0eVxuXG4gICAgIyBvdXRzaWRlIHJlcXVpcmVtZW50c1xuICAgIGxpbmtlZEdyaWRTY29yZSA6IDBcblxuICAgICMgV2l0aGluIHN1YnRlc3QgcmVxdWlyZW1lbnRzXG4gICAgc2tpcExpbmsgICAgICAgIDogbnVsbFxuICAgIHNraXBSZXF1aXJlbWVudCA6IG51bGxcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKS0+XG4gICAgXG4gICAgXG4iXX0=

var Klasses,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Klasses = (function(superClass) {
  extend(Klasses, superClass);

  function Klasses() {
    return Klasses.__super__.constructor.apply(this, arguments);
  }

  Klasses.prototype.model = Klass;

  Klasses.prototype.url = 'klass';

  Klasses.prototype.pouch = {
    viewOptions: {
      key: 'klass'
    }
  };

  return Klasses;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMva2xhc3MvS2xhc3Nlcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxPQUFBO0VBQUE7OztBQUFNOzs7Ozs7O29CQUNKLEtBQUEsR0FBUTs7b0JBQ1IsR0FBQSxHQUFROztvQkFDUixLQUFBLEdBQ0U7SUFBQSxXQUFBLEVBQ0U7TUFBQSxHQUFBLEVBQU0sT0FBTjtLQURGOzs7OztHQUprQixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9rbGFzcy9LbGFzc2VzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgS2xhc3NlcyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cbiAgbW9kZWwgOiBLbGFzc1xuICB1cmwgICA6ICdrbGFzcydcbiAgcG91Y2g6XG4gICAgdmlld09wdGlvbnM6XG4gICAgICBrZXkgOiAna2xhc3MnXG4iXX0=

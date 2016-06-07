var CurriculaListView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CurriculaListView = (function(superClass) {
  extend(CurriculaListView, superClass);

  function CurriculaListView() {
    this.render = bind(this.render, this);
    return CurriculaListView.__super__.constructor.apply(this, arguments);
  }

  CurriculaListView.prototype.className = "CurriculaListView";

  CurriculaListView.prototype.tagName = "ul";

  CurriculaListView.prototype.initialize = function(options) {
    var base;
    this.views = [];
    this.curricula = options.curricula;
    return typeof (base = this.curricula).on === "function" ? base.on("all", this.render) : void 0;
  };

  CurriculaListView.prototype.render = function() {
    if (this.curricula.length === 0) {
      return;
    }
    this.$el.html("<h1>Curricula</h1>");
    this.closeViews;
    this.curricula.each((function(_this) {
      return function(curriculum) {
        var view;
        view = new CurriculumListElementView({
          "curriculum": curriculum
        });
        view.render();
        _this.$el.append(view.el);
        return _this.views.push(view);
      };
    })(this));
    return this.trigger("rendered");
  };

  CurriculaListView.prototype.onClose = function() {
    return this.closeViews();
  };

  CurriculaListView.prototype.closeViews = function() {
    var i, len, ref, results, view;
    ref = this.views;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      results.push(typeof view.close === "function" ? view.close() : void 0);
    }
    return results;
  };

  return CurriculaListView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvY3VycmljdWx1bS9DdXJyaWN1bGFMaXN0Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxpQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7OzhCQUVKLFNBQUEsR0FBVzs7OEJBQ1gsT0FBQSxHQUFTOzs4QkFFVCxVQUFBLEdBQVksU0FBQyxPQUFEO0FBQ1YsUUFBQTtJQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDVCxJQUFDLENBQUEsU0FBRCxHQUFhLE9BQU8sQ0FBQztrRUFDWCxDQUFDLEdBQUksT0FBTyxJQUFDLENBQUE7RUFIYjs7OEJBTVosTUFBQSxHQUFRLFNBQUE7SUFDTixJQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxLQUFxQixDQUEvQjtBQUFBLGFBQUE7O0lBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsb0JBQVY7SUFDQSxJQUFDLENBQUE7SUFDRCxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLFVBQUQ7QUFDZCxZQUFBO1FBQUEsSUFBQSxHQUFXLElBQUEseUJBQUEsQ0FDVDtVQUFBLFlBQUEsRUFBZSxVQUFmO1NBRFM7UUFFWCxJQUFJLENBQUMsTUFBTCxDQUFBO1FBQ0EsS0FBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksSUFBSSxDQUFDLEVBQWpCO2VBQ0EsS0FBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWjtNQUxjO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQjtXQU9BLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQVhNOzs4QkFhUixPQUFBLEdBQVMsU0FBQTtXQUNQLElBQUMsQ0FBQSxVQUFELENBQUE7RUFETzs7OEJBR1QsVUFBQSxHQUFZLFNBQUE7QUFDVixRQUFBO0FBQUE7QUFBQTtTQUFBLHFDQUFBOztzREFDRSxJQUFJLENBQUM7QUFEUDs7RUFEVTs7OztHQTNCa0IsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvY3VycmljdWx1bS9DdXJyaWN1bGFMaXN0Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEN1cnJpY3VsYUxpc3RWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJDdXJyaWN1bGFMaXN0Vmlld1wiXG4gIHRhZ05hbWU6IFwidWxcIlxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEB2aWV3cyA9IFtdXG4gICAgQGN1cnJpY3VsYSA9IG9wdGlvbnMuY3VycmljdWxhXG4gICAgQGN1cnJpY3VsYS5vbj8gXCJhbGxcIiwgQHJlbmRlclxuXG5cbiAgcmVuZGVyOiA9PlxuICAgIHJldHVybiBpZiBAY3VycmljdWxhLmxlbmd0aCA9PSAwIFxuICAgIEAkZWwuaHRtbCBcIjxoMT5DdXJyaWN1bGE8L2gxPlwiXG4gICAgQGNsb3NlVmlld3NcbiAgICBAY3VycmljdWxhLmVhY2ggKGN1cnJpY3VsdW0pID0+XG4gICAgICB2aWV3ID0gbmV3IEN1cnJpY3VsdW1MaXN0RWxlbWVudFZpZXdcbiAgICAgICAgXCJjdXJyaWN1bHVtXCIgOiBjdXJyaWN1bHVtXG4gICAgICB2aWV3LnJlbmRlcigpXG4gICAgICBAJGVsLmFwcGVuZCB2aWV3LmVsXG4gICAgICBAdmlld3MucHVzaCB2aWV3XG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgXG4gIG9uQ2xvc2U6IC0+XG4gICAgQGNsb3NlVmlld3MoKVxuICBcbiAgY2xvc2VWaWV3czogLT5cbiAgICBmb3IgdmlldyBpbiBAdmlld3NcbiAgICAgIHZpZXcuY2xvc2U/KClcbiAgIl19

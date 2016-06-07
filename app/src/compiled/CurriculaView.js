var CurriculaView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CurriculaView = (function(superClass) {
  extend(CurriculaView, superClass);

  function CurriculaView() {
    return CurriculaView.__super__.constructor.apply(this, arguments);
  }

  CurriculaView.prototype.className = "CurriculaView";

  CurriculaView.prototype.events = {
    'click .import': 'gotoImport',
    'click .back': 'goBack'
  };

  CurriculaView.prototype.goBack = function() {
    return history.back();
  };

  CurriculaView.prototype.gotoImport = function() {
    return Tangerine.router.navigate("curriculumImport", true);
  };

  CurriculaView.prototype.initialize = function(options) {
    return this.subView = new CurriculaListView({
      curricula: options.curricula
    });
  };

  CurriculaView.prototype.render = function() {
    this.$el.html("<button class='back navigation'>" + (t('back')) + "</button><br> <button class='command import'>" + (t('import')) + "</button> <br> <div id='curricula_list'></div>");
    this.subView.setElement(this.$el.find('#curricula_list'));
    this.subView.render();
    return this.trigger("rendered");
  };

  CurriculaView.prototype.onClose = function() {
    var ref;
    return (ref = this.subView) != null ? ref.close() : void 0;
  };

  return CurriculaView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvY3VycmljdWx1bS9DdXJyaWN1bGFWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGFBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7MEJBRUosU0FBQSxHQUFZOzswQkFFWixNQUFBLEdBQ0U7SUFBQSxlQUFBLEVBQWtCLFlBQWxCO0lBQ0EsYUFBQSxFQUFrQixRQURsQjs7OzBCQUdGLE1BQUEsR0FBUSxTQUFBO1dBQUcsT0FBTyxDQUFDLElBQVIsQ0FBQTtFQUFIOzswQkFFUixVQUFBLEdBQVksU0FBQTtXQUNWLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBMEIsa0JBQTFCLEVBQThDLElBQTlDO0VBRFU7OzBCQUdaLFVBQUEsR0FBWSxTQUFDLE9BQUQ7V0FDVixJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsaUJBQUEsQ0FDYjtNQUFBLFNBQUEsRUFBWSxPQUFPLENBQUMsU0FBcEI7S0FEYTtFQURMOzswQkFJWixNQUFBLEdBQVEsU0FBQTtJQUNOLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGtDQUFBLEdBQ3lCLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBRCxDQUR6QixHQUNvQywrQ0FEcEMsR0FFd0IsQ0FBQyxDQUFBLENBQUUsUUFBRixDQUFELENBRnhCLEdBRXFDLGdEQUYvQztJQU9BLElBQUMsQ0FBQSxPQUFPLENBQUMsVUFBVCxDQUFvQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVixDQUFwQjtJQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBO1dBRUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBWE07OzBCQWFSLE9BQUEsR0FBUyxTQUFBO0FBQ1AsUUFBQTs2Q0FBUSxDQUFFLEtBQVYsQ0FBQTtFQURPOzs7O0dBOUJpQixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9jdXJyaWN1bHVtL0N1cnJpY3VsYVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDdXJyaWN1bGFWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiQ3VycmljdWxhVmlld1wiXG5cbiAgZXZlbnRzIDpcbiAgICAnY2xpY2sgLmltcG9ydCcgOiAnZ290b0ltcG9ydCdcbiAgICAnY2xpY2sgLmJhY2snICAgOiAnZ29CYWNrJ1xuXG4gIGdvQmFjazogLT4gaGlzdG9yeS5iYWNrKClcblxuICBnb3RvSW1wb3J0OiAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJjdXJyaWN1bHVtSW1wb3J0XCIsIHRydWVcblxuICBpbml0aWFsaXplOiAob3B0aW9ucyApLT5cbiAgICBAc3ViVmlldyA9IG5ldyBDdXJyaWN1bGFMaXN0Vmlld1xuICAgICAgY3VycmljdWxhIDogb3B0aW9ucy5jdXJyaWN1bGFcblxuICByZW5kZXI6IC0+XG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8YnV0dG9uIGNsYXNzPSdiYWNrIG5hdmlnYXRpb24nPiN7dCgnYmFjaycpfTwvYnV0dG9uPjxicj5cbiAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQgaW1wb3J0Jz4je3QoJ2ltcG9ydCcpfTwvYnV0dG9uPlxuICAgICAgPGJyPlxuICAgICAgPGRpdiBpZD0nY3VycmljdWxhX2xpc3QnPjwvZGl2PlxuICAgIFwiXG5cbiAgICBAc3ViVmlldy5zZXRFbGVtZW50IEAkZWwuZmluZCgnI2N1cnJpY3VsYV9saXN0JylcbiAgICBAc3ViVmlldy5yZW5kZXIoKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgb25DbG9zZTogLT5cbiAgICBAc3ViVmlldz8uY2xvc2UoKSJdfQ==

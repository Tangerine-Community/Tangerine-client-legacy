var KlassMenuView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassMenuView = (function(superClass) {
  extend(KlassMenuView, superClass);

  function KlassMenuView() {
    return KlassMenuView.__super__.constructor.apply(this, arguments);
  }

  KlassMenuView.prototype.className = "KlassMenuView";

  KlassMenuView.prototype.events = {
    'click .registration': 'gotoKlasses'
  };

  KlassMenuView.prototype.gotoKlasses = function() {
    return Tangerine.router.navigate("class", true);
  };

  KlassMenuView.prototype.initialize = function(options) {};

  KlassMenuView.prototype.render = function() {
    this.$el.html("<h1>Tangerine Class</h1> <button class='collect command'>Collect</button> <button class='manage command'>Manage</button> <button class='reports command'>Reports</button> <button class='advice command'>Advice</button> <button class='registration command'>Class Registration</button>");
    return this.trigger("rendered");
  };

  return KlassMenuView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMva2xhc3MvS2xhc3NNZW51Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxhQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzBCQUVKLFNBQUEsR0FBWTs7MEJBRVosTUFBQSxHQUNFO0lBQUEscUJBQUEsRUFBd0IsYUFBeEI7OzswQkFFRixXQUFBLEdBQWEsU0FBQTtXQUNYLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBMEIsT0FBMUIsRUFBbUMsSUFBbkM7RUFEVzs7MEJBR2IsVUFBQSxHQUFZLFNBQUUsT0FBRixHQUFBOzswQkFFWixNQUFBLEdBQVEsU0FBQTtJQUNOLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLDJSQUFWO1dBU0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBVk07Ozs7R0Faa0IsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMva2xhc3MvS2xhc3NNZW51Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEtsYXNzTWVudVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJLbGFzc01lbnVWaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5yZWdpc3RyYXRpb24nIDogJ2dvdG9LbGFzc2VzJ1xuXG4gIGdvdG9LbGFzc2VzOiAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJjbGFzc1wiLCB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cblxuICByZW5kZXI6IC0+XG4gICAgQCRlbC5odG1sIFwiXG4gICAgPGgxPlRhbmdlcmluZSBDbGFzczwvaDE+XG4gICAgPGJ1dHRvbiBjbGFzcz0nY29sbGVjdCBjb21tYW5kJz5Db2xsZWN0PC9idXR0b24+XG4gICAgPGJ1dHRvbiBjbGFzcz0nbWFuYWdlIGNvbW1hbmQnPk1hbmFnZTwvYnV0dG9uPlxuICAgIDxidXR0b24gY2xhc3M9J3JlcG9ydHMgY29tbWFuZCc+UmVwb3J0czwvYnV0dG9uPlxuICAgIDxidXR0b24gY2xhc3M9J2FkdmljZSBjb21tYW5kJz5BZHZpY2U8L2J1dHRvbj5cbiAgICA8YnV0dG9uIGNsYXNzPSdyZWdpc3RyYXRpb24gY29tbWFuZCc+Q2xhc3MgUmVnaXN0cmF0aW9uPC9idXR0b24+XG4gICAgXG4gICAgXCJcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiJdfQ==

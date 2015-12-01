var CurriculumListElementView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CurriculumListElementView = (function(superClass) {
  extend(CurriculumListElementView, superClass);

  function CurriculumListElementView() {
    this["delete"] = bind(this["delete"], this);
    return CurriculumListElementView.__super__.constructor.apply(this, arguments);
  }

  CurriculumListElementView.prototype.className = "CurriculumListElementView";

  CurriculumListElementView.prototype.tagName = "li";

  CurriculumListElementView.prototype.events = {
    'click .toggle_menu': 'toggleMenu',
    'click .duplicate': 'duplicate',
    'click .delete': 'deleteToggle',
    'click .delete_cancel': 'deleteToggle',
    'click .delete_confirm': 'delete'
  };

  CurriculumListElementView.prototype.initialize = function(options) {
    this.curriculum = options.curriculum;
    return this.subtests = options.subtests;
  };

  CurriculumListElementView.prototype.duplicate = function() {
    var newName;
    newName = "Copy of " + this.curriculum.get("name");
    return this.curriculum.duplicate({
      name: newName
    }, null, null, (function(_this) {
      return function(curriculum) {
        return _this.curriculum.trigger("new", curriculum);
      };
    })(this));
  };

  CurriculumListElementView.prototype.toggleMenu = function() {
    this.$el.find(".sp_down, .sp_right").toggleClass('sp_down').toggleClass('sp_right');
    return this.$el.find(".menu").fadeToggle(150);
  };

  CurriculumListElementView.prototype.deleteToggle = function() {
    this.$el.find(".delete_confirm").fadeToggle(250);
    return false;
  };

  CurriculumListElementView.prototype["delete"] = function() {
    return this.curriculum.destroy();
  };

  CurriculumListElementView.prototype.render = function() {
    var deleteButton, deleteConfirm, downloadKey, duplicateButton, editButton, menu, name, toggleButton;
    toggleButton = "<div class='toggle_menu sp_right'><div> </div></div>";
    editButton = "<a href='#curriculum/" + this.curriculum.id + "'><img class='link_icon edit' title='Edit' src='images/icon_edit.png'></a>";
    duplicateButton = "<img class='link_icon duplicate' title='Duplicate' src='images/icon_duplicate.png'>";
    deleteButton = "<img class='delete link_icon' title='Delete' src='images/icon_delete.png'>";
    deleteConfirm = "<span class='delete_confirm'><div class='menu_box'>Confirm <button class='delete_yes command_red'>Delete</button> <button class='delete_cancel command'>Cancel</button></div></span>";
    downloadKey = "<span class='download_key small_grey'>Download key <b>" + (this.curriculum.id.substr(-5, 5)) + "</b></span>";
    name = "<span class='toggle_menu'>" + (this.curriculum.escape('name')) + "</span>";
    if (Tangerine.user.isAdmin()) {
      menu = editButton + " " + duplicateButton + " " + deleteButton + " " + downloadKey + " " + deleteConfirm;
    }
    if (!Tangerine.user.isAdmin()) {
      menu = editButton + " " + downloadKey;
    }
    this.$el.html("<div> " + toggleButton + " " + name + " </div> <div> <div class='confirmation menu'> " + menu + " </div> </div>");
    return this.trigger("rendered");
  };

  return CurriculumListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvY3VycmljdWx1bS9DdXJyaWN1bHVtTGlzdEVsZW1lbnRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLHlCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7c0NBRUosU0FBQSxHQUFZOztzQ0FDWixPQUFBLEdBQVM7O3NDQUVULE1BQUEsR0FDRTtJQUFBLG9CQUFBLEVBQXVCLFlBQXZCO0lBQ0Esa0JBQUEsRUFBdUIsV0FEdkI7SUFFQSxlQUFBLEVBQTBCLGNBRjFCO0lBR0Esc0JBQUEsRUFBMEIsY0FIMUI7SUFJQSx1QkFBQSxFQUEwQixRQUoxQjs7O3NDQVNGLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFDVixJQUFDLENBQUEsVUFBRCxHQUFjLE9BQU8sQ0FBQztXQUN0QixJQUFDLENBQUEsUUFBRCxHQUFZLE9BQU8sQ0FBQztFQUZWOztzQ0FJWixTQUFBLEdBQVcsU0FBQTtBQUNULFFBQUE7SUFBQSxPQUFBLEdBQVUsVUFBQSxHQUFhLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFnQixNQUFoQjtXQUN2QixJQUFDLENBQUEsVUFBVSxDQUFDLFNBQVosQ0FBc0I7TUFBRSxJQUFBLEVBQU8sT0FBVDtLQUF0QixFQUEwQyxJQUExQyxFQUFnRCxJQUFoRCxFQUFzRCxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsVUFBRDtlQUNwRCxLQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBb0IsS0FBcEIsRUFBMkIsVUFBM0I7TUFEb0Q7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXREO0VBRlM7O3NDQUtYLFVBQUEsR0FBWSxTQUFBO0lBQ1YsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUscUJBQVYsQ0FBZ0MsQ0FBQyxXQUFqQyxDQUE2QyxTQUE3QyxDQUF1RCxDQUFDLFdBQXhELENBQW9FLFVBQXBFO1dBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsT0FBVixDQUFrQixDQUFDLFVBQW5CLENBQThCLEdBQTlCO0VBRlU7O3NDQUlaLFlBQUEsR0FBYyxTQUFBO0lBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsaUJBQVYsQ0FBNEIsQ0FBQyxVQUE3QixDQUF3QyxHQUF4QztXQUE4QztFQUFqRDs7c0NBR2QsU0FBQSxHQUFRLFNBQUE7V0FFTixJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQTtFQUZNOztzQ0FLUixNQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7SUFBQSxZQUFBLEdBQWtCO0lBQ2xCLFVBQUEsR0FBa0IsdUJBQUEsR0FBd0IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxFQUFwQyxHQUF1QztJQUN6RCxlQUFBLEdBQWtCO0lBQ2xCLFlBQUEsR0FBa0I7SUFDbEIsYUFBQSxHQUFrQjtJQUNsQixXQUFBLEdBQWtCLHdEQUFBLEdBQXdELENBQUMsSUFBQyxDQUFBLFVBQVUsQ0FBQyxFQUFFLENBQUMsTUFBZixDQUFzQixDQUFDLENBQXZCLEVBQXlCLENBQXpCLENBQUQsQ0FBeEQsR0FBcUY7SUFFdkcsSUFBQSxHQUFPLDRCQUFBLEdBQTRCLENBQUMsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLE1BQW5CLENBQUQsQ0FBNUIsR0FBd0Q7SUFDL0QsSUFNSyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQWYsQ0FBQSxDQU5MO01BQUEsSUFBQSxHQUNJLFVBQUQsR0FBWSxHQUFaLEdBQ0MsZUFERCxHQUNpQixHQURqQixHQUVDLFlBRkQsR0FFYyxHQUZkLEdBR0MsV0FIRCxHQUdhLEdBSGIsR0FJQyxjQUxKOztJQVFBLElBR0ssQ0FBSSxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQWYsQ0FBQSxDQUhUO01BQUEsSUFBQSxHQUNJLFVBQUQsR0FBWSxHQUFaLEdBQ0MsWUFGSjs7SUFLQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxRQUFBLEdBRUosWUFGSSxHQUVTLEdBRlQsR0FHSixJQUhJLEdBR0MsZ0RBSEQsR0FPRixJQVBFLEdBT0csZ0JBUGI7V0FZQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFsQ007Ozs7R0FwQzhCLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL2N1cnJpY3VsdW0vQ3VycmljdWx1bUxpc3RFbGVtZW50Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEN1cnJpY3VsdW1MaXN0RWxlbWVudFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJDdXJyaWN1bHVtTGlzdEVsZW1lbnRWaWV3XCJcbiAgdGFnTmFtZTogXCJsaVwiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAudG9nZ2xlX21lbnUnIDogJ3RvZ2dsZU1lbnUnXG4gICAgJ2NsaWNrIC5kdXBsaWNhdGUnICAgOiAnZHVwbGljYXRlJ1xuICAgICdjbGljayAuZGVsZXRlJyAgICAgICAgIDogJ2RlbGV0ZVRvZ2dsZSdcbiAgICAnY2xpY2sgLmRlbGV0ZV9jYW5jZWwnICA6ICdkZWxldGVUb2dnbGUnXG4gICAgJ2NsaWNrIC5kZWxldGVfY29uZmlybScgOiAnZGVsZXRlJ1xuXG5cblxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBjdXJyaWN1bHVtID0gb3B0aW9ucy5jdXJyaWN1bHVtXG4gICAgQHN1YnRlc3RzID0gb3B0aW9ucy5zdWJ0ZXN0c1xuXG4gIGR1cGxpY2F0ZTogLT5cbiAgICBuZXdOYW1lID0gXCJDb3B5IG9mIFwiICsgQGN1cnJpY3VsdW0uZ2V0KFwibmFtZVwiKVxuICAgIEBjdXJyaWN1bHVtLmR1cGxpY2F0ZSB7IG5hbWUgOiBuZXdOYW1lIH0sIG51bGwsIG51bGwsIChjdXJyaWN1bHVtKSA9PiBcbiAgICAgIEBjdXJyaWN1bHVtLnRyaWdnZXIgXCJuZXdcIiwgY3VycmljdWx1bVxuXG4gIHRvZ2dsZU1lbnU6IC0+XG4gICAgQCRlbC5maW5kKFwiLnNwX2Rvd24sIC5zcF9yaWdodFwiKS50b2dnbGVDbGFzcygnc3BfZG93bicpLnRvZ2dsZUNsYXNzKCdzcF9yaWdodCcpXG4gICAgQCRlbC5maW5kKFwiLm1lbnVcIikuZmFkZVRvZ2dsZSgxNTApXG5cbiAgZGVsZXRlVG9nZ2xlOiAtPiBAJGVsLmZpbmQoXCIuZGVsZXRlX2NvbmZpcm1cIikuZmFkZVRvZ2dsZSgyNTApOyBmYWxzZVxuXG4gICMgZGVlcCBub24tZ2VybmVyaWMgZGVsZXRlXG4gIGRlbGV0ZTogPT5cbiAgICAjIHJlbW92ZSBmcm9tIGNvbGxlY3Rpb25cbiAgICBAY3VycmljdWx1bS5kZXN0cm95KClcblxuXG4gIHJlbmRlcjogLT5cbiAgICB0b2dnbGVCdXR0b24gICAgPSBcIjxkaXYgY2xhc3M9J3RvZ2dsZV9tZW51IHNwX3JpZ2h0Jz48ZGl2PiA8L2Rpdj48L2Rpdj5cIlxuICAgIGVkaXRCdXR0b24gICAgICA9IFwiPGEgaHJlZj0nI2N1cnJpY3VsdW0vI3tAY3VycmljdWx1bS5pZH0nPjxpbWcgY2xhc3M9J2xpbmtfaWNvbiBlZGl0JyB0aXRsZT0nRWRpdCcgc3JjPSdpbWFnZXMvaWNvbl9lZGl0LnBuZyc+PC9hPlwiXG4gICAgZHVwbGljYXRlQnV0dG9uID0gXCI8aW1nIGNsYXNzPSdsaW5rX2ljb24gZHVwbGljYXRlJyB0aXRsZT0nRHVwbGljYXRlJyBzcmM9J2ltYWdlcy9pY29uX2R1cGxpY2F0ZS5wbmcnPlwiXG4gICAgZGVsZXRlQnV0dG9uICAgID0gXCI8aW1nIGNsYXNzPSdkZWxldGUgbGlua19pY29uJyB0aXRsZT0nRGVsZXRlJyBzcmM9J2ltYWdlcy9pY29uX2RlbGV0ZS5wbmcnPlwiXG4gICAgZGVsZXRlQ29uZmlybSAgID0gXCI8c3BhbiBjbGFzcz0nZGVsZXRlX2NvbmZpcm0nPjxkaXYgY2xhc3M9J21lbnVfYm94Jz5Db25maXJtIDxidXR0b24gY2xhc3M9J2RlbGV0ZV95ZXMgY29tbWFuZF9yZWQnPkRlbGV0ZTwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSdkZWxldGVfY2FuY2VsIGNvbW1hbmQnPkNhbmNlbDwvYnV0dG9uPjwvZGl2Pjwvc3Bhbj5cIlxuICAgIGRvd25sb2FkS2V5ICAgICA9IFwiPHNwYW4gY2xhc3M9J2Rvd25sb2FkX2tleSBzbWFsbF9ncmV5Jz5Eb3dubG9hZCBrZXkgPGI+I3tAY3VycmljdWx1bS5pZC5zdWJzdHIoLTUsNSl9PC9iPjwvc3Bhbj5cIlxuXG4gICAgbmFtZSA9IFwiPHNwYW4gY2xhc3M9J3RvZ2dsZV9tZW51Jz4je0BjdXJyaWN1bHVtLmVzY2FwZSgnbmFtZScpfTwvc3Bhbj5cIlxuICAgIG1lbnUgPSBcIlxuICAgICAgI3tlZGl0QnV0dG9ufVxuICAgICAgI3tkdXBsaWNhdGVCdXR0b259XG4gICAgICAje2RlbGV0ZUJ1dHRvbn1cbiAgICAgICN7ZG93bmxvYWRLZXl9XG4gICAgICAje2RlbGV0ZUNvbmZpcm19XG4gICAgXCIgaWYgVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG5cbiAgICBtZW51ID0gXCJcbiAgICAgICN7ZWRpdEJ1dHRvbn1cbiAgICAgICN7ZG93bmxvYWRLZXl9XG4gICAgXCIgaWYgbm90IFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8ZGl2PlxuICAgICAgICAje3RvZ2dsZUJ1dHRvbn1cbiAgICAgICAgI3tuYW1lfVxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdjb25maXJtYXRpb24gbWVudSc+XG4gICAgICAgICAgI3ttZW51fVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgXCJcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCIiXX0=

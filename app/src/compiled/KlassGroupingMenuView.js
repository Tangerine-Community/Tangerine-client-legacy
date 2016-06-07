var KlassGroupingMenuView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassGroupingMenuView = (function(superClass) {
  extend(KlassGroupingMenuView, superClass);

  function KlassGroupingMenuView() {
    return KlassGroupingMenuView.__super__.constructor.apply(this, arguments);
  }

  KlassGroupingMenuView.prototype.className = "KlassGroupingMenuView";

  KlassGroupingMenuView.prototype.events = {
    'change .part_selector': 'gotoKlassGroupingReport'
  };

  KlassGroupingMenuView.prototype.gotoKlassGroupingReport = function(event) {
    return Tangerine.router.navigate(("report/klassGrouping/" + this.klass.id + "/") + this.$el.find(event.target).find(":selected").attr("data-part"), true);
  };

  KlassGroupingMenuView.prototype.initialize = function(options) {
    this.parent = options.parent;
    this.klass = this.parent.options.klass;
    this.curricula = this.parent.options.curricula;
    this.currentPart = this.klass.calcCurrentPart();
    this.students = new Students;
    return this.students.fetch({
      klassId: this.klass.id,
      success: (function(_this) {
        return function() {
          var allSubtests;
          allSubtests = new Subtests;
          return allSubtests.fetch({
            success: function(collection) {
              var i, len, part, subtest, subtests;
              subtests = collection.where({
                curriculaId: _this.curricula.id
              });
              _this.parts = [];
              for (i = 0, len = subtests.length; i < len; i++) {
                subtest = subtests[i];
                part = subtest.get('part');
                if (_this.parts[part] == null) {
                  _this.parts[part] = {};
                }
                _this.parts[part]["id"] = subtest.id;
                if (_this.parts[part]["name"] != null) {
                  _this.parts[part]["name"] += " " + subtest.get("name");
                } else {
                  _this.parts[part]["name"] = subtest.get("name");
                }
                _this.parts[part]["reportType"] = subtest.get("reportType");
              }
              _this.ready = true;
              return _this.render();
            }
          });
        };
      })(this)
    });
  };

  KlassGroupingMenuView.prototype.render = function() {
    var flagForCurrent, html, i, len, part, ref, subtest;
    if (this.ready) {
      if ((this.students == null) || this.students.length === 0) {
        this.$el.html("Please add students to this class.");
        return;
      }
      html = "<select class='part_selector'> <option disabled='disabled' selected='selected'>Select an assessment</option>";
      ref = this.parts;
      for (part = i = 0, len = ref.length; i < len; part = ++i) {
        subtest = ref[part];
        if ((subtest != null ? subtest.id : void 0) != null) {
          flagForCurrent = this.currentPart === part ? "**" : '';
          html += "<option data-part='" + part + "' data-subtestId='" + subtest.id + "'>" + flagForCurrent + " " + part + " " + subtest.name + "</option>";
        }
      }
      html += "</select>";
      return this.$el.html(html);
    } else {
      return this.$el.html("<img src='images/loading.gif' class='loading'>");
    }
  };

  return KlassGroupingMenuView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVwb3J0L0tsYXNzR3JvdXBpbmdNZW51Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxxQkFBQTtFQUFBOzs7QUFBTTs7Ozs7OztrQ0FFSixTQUFBLEdBQVc7O2tDQUVYLE1BQUEsR0FDRTtJQUFBLHVCQUFBLEVBQTBCLHlCQUExQjs7O2tDQUVGLHVCQUFBLEdBQXlCLFNBQUMsS0FBRDtXQUN2QixTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLENBQUEsdUJBQUEsR0FBd0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUEvQixHQUFrQyxHQUFsQyxDQUFBLEdBQXVDLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxNQUFoQixDQUF1QixDQUFDLElBQXhCLENBQTZCLFdBQTdCLENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsV0FBL0MsQ0FBakUsRUFBOEgsSUFBOUg7RUFEdUI7O2tDQUd6QixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLE1BQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUM3QixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQzdCLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLEtBQUssQ0FBQyxlQUFQLENBQUE7SUFFZixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUk7V0FDaEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQ0U7TUFBQSxPQUFBLEVBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFqQjtNQUNBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDUCxjQUFBO1VBQUEsV0FBQSxHQUFjLElBQUk7aUJBQ2xCLFdBQVcsQ0FBQyxLQUFaLENBQ0U7WUFBQSxPQUFBLEVBQVMsU0FBQyxVQUFEO0FBQ1Asa0JBQUE7Y0FBQSxRQUFBLEdBQVcsVUFBVSxDQUFDLEtBQVgsQ0FDVDtnQkFBQSxXQUFBLEVBQWMsS0FBQyxDQUFBLFNBQVMsQ0FBQyxFQUF6QjtlQURTO2NBRVgsS0FBQyxDQUFBLEtBQUQsR0FBUztBQUNULG1CQUFBLDBDQUFBOztnQkFFRSxJQUFBLEdBQU8sT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaO2dCQUVQLElBQWlDLHlCQUFqQztrQkFBQSxLQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBUCxHQUF1QixHQUF2Qjs7Z0JBQ0EsS0FBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBLENBQU0sQ0FBQSxJQUFBLENBQWIsR0FBdUIsT0FBTyxDQUFDO2dCQUUvQixJQUFHLGlDQUFIO2tCQUNFLEtBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxDQUFNLENBQUEsTUFBQSxDQUFiLElBQXdCLEdBQUEsR0FBTSxPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosRUFEaEM7aUJBQUEsTUFBQTtrQkFHRSxLQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBTSxDQUFBLE1BQUEsQ0FBYixHQUF1QixPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosRUFIekI7O2dCQUlBLEtBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxDQUFNLENBQUEsWUFBQSxDQUFiLEdBQTZCLE9BQU8sQ0FBQyxHQUFSLENBQVksWUFBWjtBQVgvQjtjQWFBLEtBQUMsQ0FBQSxLQUFELEdBQVM7cUJBQ1QsS0FBQyxDQUFBLE1BQUQsQ0FBQTtZQWxCTyxDQUFUO1dBREY7UUFGTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEVDtLQURGO0VBUFU7O2tDQWdDWixNQUFBLEdBQVEsU0FBQTtBQUVOLFFBQUE7SUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFKO01BR0UsSUFBTyx1QkFBSixJQUFrQixJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsS0FBb0IsQ0FBekM7UUFDRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxvQ0FBVjtBQUNBLGVBRkY7O01BSUEsSUFBQSxHQUFPO0FBSVA7QUFBQSxXQUFBLG1EQUFBOztRQUNFLElBQUcsK0NBQUg7VUFDRSxjQUFBLEdBQW9CLElBQUMsQ0FBQSxXQUFELEtBQWdCLElBQW5CLEdBQTZCLElBQTdCLEdBQXVDO1VBQ3hELElBQUEsSUFBUSxxQkFBQSxHQUFzQixJQUF0QixHQUEyQixvQkFBM0IsR0FBK0MsT0FBTyxDQUFDLEVBQXZELEdBQTBELElBQTFELEdBQThELGNBQTlELEdBQTZFLEdBQTdFLEdBQWdGLElBQWhGLEdBQXFGLEdBQXJGLEdBQXdGLE9BQU8sQ0FBQyxJQUFoRyxHQUFxRyxZQUYvRzs7QUFERjtNQUlBLElBQUEsSUFBUTthQUVSLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQVYsRUFqQkY7S0FBQSxNQUFBO2FBbUJFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdEQUFWLEVBbkJGOztFQUZNOzs7O0dBMUMwQixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9yZXBvcnQvS2xhc3NHcm91cGluZ01lbnVWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgS2xhc3NHcm91cGluZ01lbnVWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJLbGFzc0dyb3VwaW5nTWVudVZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2hhbmdlIC5wYXJ0X3NlbGVjdG9yJyA6ICdnb3RvS2xhc3NHcm91cGluZ1JlcG9ydCdcblxuICBnb3RvS2xhc3NHcm91cGluZ1JlcG9ydDogKGV2ZW50KSAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJyZXBvcnQva2xhc3NHcm91cGluZy8je0BrbGFzcy5pZH0vXCIgKyBAJGVsLmZpbmQoZXZlbnQudGFyZ2V0KS5maW5kKFwiOnNlbGVjdGVkXCIpLmF0dHIoXCJkYXRhLXBhcnRcIiksIHRydWVcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAcGFyZW50ICAgID0gb3B0aW9ucy5wYXJlbnRcbiAgICBAa2xhc3MgICAgID0gQHBhcmVudC5vcHRpb25zLmtsYXNzXG4gICAgQGN1cnJpY3VsYSA9IEBwYXJlbnQub3B0aW9ucy5jdXJyaWN1bGFcbiAgICBAY3VycmVudFBhcnQgPSBAa2xhc3MuY2FsY0N1cnJlbnRQYXJ0KClcblxuICAgIEBzdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgIEBzdHVkZW50cy5mZXRjaFxuICAgICAga2xhc3NJZCA6IEBrbGFzcy5pZFxuICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgPT5cbiAgICAgICAgICAgIHN1YnRlc3RzID0gY29sbGVjdGlvbi53aGVyZSBcbiAgICAgICAgICAgICAgY3VycmljdWxhSWQgOiBAY3VycmljdWxhLmlkXG4gICAgICAgICAgICBAcGFydHMgPSBbXVxuICAgICAgICAgICAgZm9yIHN1YnRlc3QgaW4gc3VidGVzdHNcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHBhcnQgPSBzdWJ0ZXN0LmdldCgncGFydCcpXG5cbiAgICAgICAgICAgICAgQHBhcnRzW3BhcnRdICAgICAgICAgPSB7fSBpZiBub3QgQHBhcnRzW3BhcnRdP1xuICAgICAgICAgICAgICBAcGFydHNbcGFydF1bXCJpZFwiXSAgID0gc3VidGVzdC5pZFxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgaWYgQHBhcnRzW3BhcnRdW1wibmFtZVwiXT8gXG4gICAgICAgICAgICAgICAgQHBhcnRzW3BhcnRdW1wibmFtZVwiXSArPSBcIiBcIiArIHN1YnRlc3QuZ2V0KFwibmFtZVwiKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHBhcnRzW3BhcnRdW1wibmFtZVwiXSA9IHN1YnRlc3QuZ2V0KFwibmFtZVwiKVxuICAgICAgICAgICAgICBAcGFydHNbcGFydF1bXCJyZXBvcnRUeXBlXCJdID0gc3VidGVzdC5nZXQoXCJyZXBvcnRUeXBlXCIpXG5cbiAgICAgICAgICAgIEByZWFkeSA9IHRydWVcbiAgICAgICAgICAgIEByZW5kZXIoKVxuXG4gIHJlbmRlcjogLT5cblxuICAgIGlmIEByZWFkeVxuXG4gICAgICAjIHF1aWNrIGRhdGEgY2hlY2tcbiAgICAgIGlmIG5vdCBAc3R1ZGVudHM/IG9yIEBzdHVkZW50cy5sZW5ndGggPT0gMFxuICAgICAgICBAJGVsLmh0bWwgXCJQbGVhc2UgYWRkIHN0dWRlbnRzIHRvIHRoaXMgY2xhc3MuXCJcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGh0bWwgPSBcIlxuICAgICAgICA8c2VsZWN0IGNsYXNzPSdwYXJ0X3NlbGVjdG9yJz5cbiAgICAgICAgICA8b3B0aW9uIGRpc2FibGVkPSdkaXNhYmxlZCcgc2VsZWN0ZWQ9J3NlbGVjdGVkJz5TZWxlY3QgYW4gYXNzZXNzbWVudDwvb3B0aW9uPlxuICAgICAgICAgIFwiXG4gICAgICBmb3Igc3VidGVzdCwgcGFydCBpbiBAcGFydHNcbiAgICAgICAgaWYgc3VidGVzdD8uaWQ/XG4gICAgICAgICAgZmxhZ0ZvckN1cnJlbnQgPSBpZiBAY3VycmVudFBhcnQgPT0gcGFydCB0aGVuIFwiKipcIiBlbHNlICcnXG4gICAgICAgICAgaHRtbCArPSBcIjxvcHRpb24gZGF0YS1wYXJ0PScje3BhcnR9JyBkYXRhLXN1YnRlc3RJZD0nI3tzdWJ0ZXN0LmlkfSc+I3tmbGFnRm9yQ3VycmVudH0gI3twYXJ0fSAje3N1YnRlc3QubmFtZX08L29wdGlvbj5cIlxuICAgICAgaHRtbCArPSBcIjwvc2VsZWN0PlwiXG4gICAgICAgICAgXG4gICAgICBAJGVsLmh0bWwgaHRtbFxuICAgIGVsc2VcbiAgICAgIEAkZWwuaHRtbCBcIjxpbWcgc3JjPSdpbWFnZXMvbG9hZGluZy5naWYnIGNsYXNzPSdsb2FkaW5nJz5cIiJdfQ==

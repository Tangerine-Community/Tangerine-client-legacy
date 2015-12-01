var KlassSubtestRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassSubtestRunView = (function(superClass) {
  extend(KlassSubtestRunView, superClass);

  function KlassSubtestRunView() {
    this.onPrototypeRendered = bind(this.onPrototypeRendered, this);
    return KlassSubtestRunView.__super__.constructor.apply(this, arguments);
  }

  KlassSubtestRunView.prototype.className = "KlassSubtestRunView";

  KlassSubtestRunView.prototype.events = {
    'click .done': 'done',
    'click .cancel': 'cancel',
    'click .subtest_help': 'toggleHelp'
  };

  KlassSubtestRunView.prototype.toggleHelp = function() {
    return this.$el.find(".enumerator_help").fadeToggle(250);
  };

  KlassSubtestRunView.prototype.initialize = function(options) {
    this.linkedResult = options.linkedResult;
    this.student = options.student;
    this.subtest = options.subtest;
    this.questions = options.questions;
    this.prototype = this.subtest.get("prototype");
    this.protoViews = Tangerine.config.get("prototypeViews");
    this.prototypeRendered = false;
    if (this.prototype === "grid") {
      return this.result = new KlassResult({
        prototype: "grid",
        startTime: (new Date()).getTime(),
        itemType: this.subtest.get("itemType"),
        reportType: this.subtest.get("reportType"),
        studentId: this.student.id,
        subtestId: this.subtest.id,
        part: this.subtest.get("part"),
        klassId: this.student.get("klassId"),
        timeAllowed: this.subtest.get("timer")
      });
    } else if (this.prototype === "survey") {
      this.result = new KlassResult({
        prototype: "survey",
        startTime: (new Date()).getTime(),
        studentId: this.student.id,
        subtestId: this.subtest.id,
        part: this.subtest.get("part"),
        klassId: this.student.get("klassId"),
        itemType: this.subtest.get("itemType"),
        reportType: this.subtest.get("reportType")
      });
      this.questions.sort();
      return this.render();
    }
  };

  KlassSubtestRunView.prototype.render = function() {
    var enumeratorHelp, studentDialog;
    enumeratorHelp = (this.subtest.get("enumeratorHelp") || "") !== "" ? "<button class='subtest_help command'>help</button><div class='enumerator_help'>" + (this.subtest.get('enumeratorHelp')) + "</div>" : "";
    studentDialog = (this.subtest.get("studentDialog") || "") !== "" ? "<div class='student_dialog'>" + (this.subtest.get('studentDialog')) + "</div>" : "";
    this.$el.html("<h2>" + (this.subtest.get('name')) + "</h2> " + enumeratorHelp + " " + studentDialog);
    this.prototypeView = new window[this.protoViews[this.subtest.get('prototype')]['run']]({
      model: this.subtest,
      parent: this
    });
    this.prototypeView.on("rendered", this.onPrototypeRendered);
    this.prototypeView.render();
    this.$el.append(this.prototypeView.el);
    this.prototypeRendered = true;
    this.$el.append("<button class='done navigation'>Done</button> <button class='cancel navigation'>Cancel</button>");
    return this.trigger("rendered");
  };

  KlassSubtestRunView.prototype.onPrototypeRendered = function() {
    return this.trigger("rendered");
  };

  KlassSubtestRunView.prototype.getGridScore = function() {
    var result;
    if (this.linkedResult.get("subtestData") == null) {
      return false;
    }
    result = this.linkedResult.get("subtestData")['attempted'] || 0;
    return result;
  };

  KlassSubtestRunView.prototype.gridWasAutostopped = function() {
    var ref;
    return ((ref = this.linkedResult.get("subtestData")) != null ? ref['auto_stop'] : void 0) || 0;
  };

  KlassSubtestRunView.prototype.onClose = function() {
    var ref;
    return (ref = this.prototypeView) != null ? typeof ref.close === "function" ? ref.close() : void 0 : void 0;
  };

  KlassSubtestRunView.prototype.isValid = function() {
    if (!this.prototypeRendered) {
      return false;
    }
    if (this.prototypeView.isValid != null) {
      return this.prototypeView.isValid();
    } else {
      return false;
    }
    return true;
  };

  KlassSubtestRunView.prototype.getSkipped = function() {
    if (this.prototypeView.getSkipped != null) {
      return this.prototypeView.getSkipped();
    } else {
      throw "Prototype skipping not implemented";
    }
  };

  KlassSubtestRunView.prototype.cancel = function() {
    if (this.student.id === "test") {
      history.back();
      return;
    }
    return Tangerine.router.navigate("class/" + (this.student.get('klassId')) + "/" + (this.subtest.get('part')), true);
  };

  KlassSubtestRunView.prototype.done = function() {
    if (this.student.id === "test") {
      history.back();
      return;
    }
    if (this.isValid()) {
      return Tangerine.$db.view(Tangerine.design_doc + "/resultsByStudentSubtest", {
        key: [this.student.id, this.subtest.id],
        success: (function(_this) {
          return function(data) {
            var datum, i, len, rows;
            rows = data.rows;
            for (i = 0, len = rows.length; i < len; i++) {
              datum = rows[i];
              Tangerine.$db.saveDoc($.extend(datum.value, {
                "old": true
              }));
            }
            return _this.result.add(_this.prototypeView.getResult(), function() {
              return Tangerine.router.navigate("class/" + (_this.student.get('klassId')) + "/" + (_this.subtest.get('part')), true);
            });
          };
        })(this)
      });
    } else {
      return this.prototypeView.showErrors();
    }
  };

  return KlassSubtestRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMva2xhc3MvS2xhc3NTdWJ0ZXN0UnVuVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxtQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7O2dDQUVKLFNBQUEsR0FBWTs7Z0NBRVosTUFBQSxHQUNFO0lBQUEsYUFBQSxFQUF3QixNQUF4QjtJQUNBLGVBQUEsRUFBd0IsUUFEeEI7SUFFQSxxQkFBQSxFQUF3QixZQUZ4Qjs7O2dDQUlGLFVBQUEsR0FBWSxTQUFBO1dBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsa0JBQVYsQ0FBNkIsQ0FBQyxVQUE5QixDQUF5QyxHQUF6QztFQUFIOztnQ0FFWixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsT0FBTyxDQUFDO0lBQ3hCLElBQUMsQ0FBQSxPQUFELEdBQWdCLE9BQU8sQ0FBQztJQUN4QixJQUFDLENBQUEsT0FBRCxHQUFnQixPQUFPLENBQUM7SUFDeEIsSUFBQyxDQUFBLFNBQUQsR0FBZ0IsT0FBTyxDQUFDO0lBRXhCLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsV0FBYjtJQUViLElBQUMsQ0FBQSxVQUFELEdBQWMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFqQixDQUFxQixnQkFBckI7SUFFZCxJQUFDLENBQUEsaUJBQUQsR0FBcUI7SUFHckIsSUFBRyxJQUFDLENBQUEsU0FBRCxLQUFjLE1BQWpCO2FBQ0UsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLFdBQUEsQ0FDWjtRQUFBLFNBQUEsRUFBZSxNQUFmO1FBQ0EsU0FBQSxFQUFlLENBQUssSUFBQSxJQUFBLENBQUEsQ0FBTCxDQUFZLENBQUMsT0FBYixDQUFBLENBRGY7UUFFQSxRQUFBLEVBQWUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsVUFBYixDQUZmO1FBR0EsVUFBQSxFQUFlLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLFlBQWIsQ0FIZjtRQUlBLFNBQUEsRUFBZSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBSnhCO1FBS0EsU0FBQSxFQUFlLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFMeEI7UUFNQSxJQUFBLEVBQWUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsTUFBYixDQU5mO1FBT0EsT0FBQSxFQUFlLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLFNBQWIsQ0FQZjtRQVFBLFdBQUEsRUFBZSxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxPQUFiLENBUmY7T0FEWSxFQURoQjtLQUFBLE1BV0ssSUFBRyxJQUFDLENBQUEsU0FBRCxLQUFjLFFBQWpCO01BQ0gsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLFdBQUEsQ0FDWjtRQUFBLFNBQUEsRUFBZSxRQUFmO1FBQ0EsU0FBQSxFQUFlLENBQUssSUFBQSxJQUFBLENBQUEsQ0FBTCxDQUFZLENBQUMsT0FBYixDQUFBLENBRGY7UUFFQSxTQUFBLEVBQWUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUZ4QjtRQUdBLFNBQUEsRUFBZSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBSHhCO1FBSUEsSUFBQSxFQUFlLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLE1BQWIsQ0FKZjtRQUtBLE9BQUEsRUFBZSxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxTQUFiLENBTGY7UUFNQSxRQUFBLEVBQWUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsVUFBYixDQU5mO1FBT0EsVUFBQSxFQUFlLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLFlBQWIsQ0FQZjtPQURZO01BU2QsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBWEc7O0VBeEJLOztnQ0FzQ1osTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsY0FBQSxHQUFvQixDQUFDLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLGdCQUFiLENBQUEsSUFBa0MsRUFBbkMsQ0FBQSxLQUEwQyxFQUE3QyxHQUFxRCxpRkFBQSxHQUFpRixDQUFDLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLGdCQUFiLENBQUQsQ0FBakYsR0FBZ0gsUUFBckssR0FBa0w7SUFDbk0sYUFBQSxHQUFvQixDQUFDLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLGVBQWIsQ0FBQSxJQUFrQyxFQUFuQyxDQUFBLEtBQTBDLEVBQTdDLEdBQXFELDhCQUFBLEdBQThCLENBQUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsZUFBYixDQUFELENBQTlCLEdBQTRELFFBQWpILEdBQThIO0lBRS9JLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE1BQUEsR0FDSCxDQUFDLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLE1BQWIsQ0FBRCxDQURHLEdBQ2tCLFFBRGxCLEdBRU4sY0FGTSxHQUVTLEdBRlQsR0FHTixhQUhKO0lBT0EsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxNQUFPLENBQUEsSUFBQyxDQUFBLFVBQVcsQ0FBQSxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxXQUFiLENBQUEsQ0FBMEIsQ0FBQSxLQUFBLENBQXRDLENBQVAsQ0FDbkI7TUFBQSxLQUFBLEVBQU8sSUFBQyxDQUFBLE9BQVI7TUFDQSxNQUFBLEVBQVEsSUFEUjtLQURtQjtJQUdyQixJQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsVUFBbEIsRUFBOEIsSUFBQyxDQUFBLG1CQUEvQjtJQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFBO0lBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksSUFBQyxDQUFBLGFBQWEsQ0FBQyxFQUEzQjtJQUNBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtJQUVyQixJQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBWSxpR0FBWjtXQUVBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQXJCTTs7Z0NBdUJSLG1CQUFBLEdBQXFCLFNBQUE7V0FDbkIsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBRG1COztnQ0FHckIsWUFBQSxHQUFjLFNBQUE7QUFDWixRQUFBO0lBQUEsSUFBb0IsNENBQXBCO0FBQUEsYUFBTyxNQUFQOztJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsWUFBWSxDQUFDLEdBQWQsQ0FBa0IsYUFBbEIsQ0FBaUMsQ0FBQSxXQUFBLENBQWpDLElBQWlEO0FBQzFELFdBQU87RUFISzs7Z0NBS2Qsa0JBQUEsR0FBb0IsU0FBQTtBQUFHLFFBQUE7c0VBQWtDLENBQUEsV0FBQSxXQUFsQyxJQUFrRDtFQUFyRDs7Z0NBRXBCLE9BQUEsR0FBUyxTQUFBO0FBQ1AsUUFBQTtxRkFBYyxDQUFFO0VBRFQ7O2dDQUdULE9BQUEsR0FBUyxTQUFBO0lBQ1AsSUFBRyxDQUFJLElBQUMsQ0FBQSxpQkFBUjtBQUErQixhQUFPLE1BQXRDOztJQUNBLElBQUcsa0NBQUg7QUFDRSxhQUFPLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLEVBRFQ7S0FBQSxNQUFBO0FBR0UsYUFBTyxNQUhUOztXQUlBO0VBTk87O2dDQVFULFVBQUEsR0FBWSxTQUFBO0lBQ1YsSUFBRyxxQ0FBSDtBQUNFLGFBQU8sSUFBQyxDQUFBLGFBQWEsQ0FBQyxVQUFmLENBQUEsRUFEVDtLQUFBLE1BQUE7QUFHRSxZQUFNLHFDQUhSOztFQURVOztnQ0FNWixNQUFBLEdBQVEsU0FBQTtJQUNOLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULEtBQWUsTUFBbEI7TUFDRSxPQUFPLENBQUMsSUFBUixDQUFBO0FBQ0EsYUFGRjs7V0FJQSxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFFBQUEsR0FBUSxDQUFDLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLFNBQWIsQ0FBRCxDQUFSLEdBQWlDLEdBQWpDLEdBQW1DLENBQUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsTUFBYixDQUFELENBQTdELEVBQXNGLElBQXRGO0VBTE07O2dDQU9SLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsS0FBZSxNQUFsQjtNQUNFLE9BQU8sQ0FBQyxJQUFSLENBQUE7QUFDQSxhQUZGOztJQUlBLElBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFIO2FBRUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFkLENBQXNCLFNBQVMsQ0FBQyxVQUFYLEdBQXNCLDBCQUEzQyxFQUNFO1FBQUEsR0FBQSxFQUFNLENBQUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFWLEVBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUF0QixDQUFOO1FBQ0EsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsSUFBRDtBQUNQLGdCQUFBO1lBQUEsSUFBQSxHQUFPLElBQUksQ0FBQztBQUNaLGlCQUFBLHNDQUFBOztjQUNFLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBZCxDQUFzQixDQUFDLENBQUMsTUFBRixDQUFTLEtBQUssQ0FBQyxLQUFmLEVBQXNCO2dCQUFBLEtBQUEsRUFBTSxJQUFOO2VBQXRCLENBQXRCO0FBREY7bUJBR0EsS0FBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksS0FBQyxDQUFBLGFBQWEsQ0FBQyxTQUFmLENBQUEsQ0FBWixFQUF3QyxTQUFBO3FCQUN0QyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFFBQUEsR0FBUSxDQUFDLEtBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLFNBQWIsQ0FBRCxDQUFSLEdBQWlDLEdBQWpDLEdBQW1DLENBQUMsS0FBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsTUFBYixDQUFELENBQTdELEVBQXNGLElBQXRGO1lBRHNDLENBQXhDO1VBTE87UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFQ7T0FERixFQUZGO0tBQUEsTUFBQTthQVlFLElBQUMsQ0FBQSxhQUFhLENBQUMsVUFBZixDQUFBLEVBWkY7O0VBTEk7Ozs7R0ExRzBCLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL2tsYXNzL0tsYXNzU3VidGVzdFJ1blZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBLbGFzc1N1YnRlc3RSdW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiS2xhc3NTdWJ0ZXN0UnVuVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAuZG9uZScgICAgICAgICA6ICdkb25lJ1xuICAgICdjbGljayAuY2FuY2VsJyAgICAgICA6ICdjYW5jZWwnXG4gICAgJ2NsaWNrIC5zdWJ0ZXN0X2hlbHAnIDogJ3RvZ2dsZUhlbHAnXG5cbiAgdG9nZ2xlSGVscDogLT4gQCRlbC5maW5kKFwiLmVudW1lcmF0b3JfaGVscFwiKS5mYWRlVG9nZ2xlKDI1MClcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAbGlua2VkUmVzdWx0ID0gb3B0aW9ucy5saW5rZWRSZXN1bHRcbiAgICBAc3R1ZGVudCAgICAgID0gb3B0aW9ucy5zdHVkZW50XG4gICAgQHN1YnRlc3QgICAgICA9IG9wdGlvbnMuc3VidGVzdFxuICAgIEBxdWVzdGlvbnMgICAgPSBvcHRpb25zLnF1ZXN0aW9uc1xuXG4gICAgQHByb3RvdHlwZSA9IEBzdWJ0ZXN0LmdldChcInByb3RvdHlwZVwiKVxuXG4gICAgQHByb3RvVmlld3MgPSBUYW5nZXJpbmUuY29uZmlnLmdldChcInByb3RvdHlwZVZpZXdzXCIpXG5cbiAgICBAcHJvdG90eXBlUmVuZGVyZWQgPSBmYWxzZVxuXG5cbiAgICBpZiBAcHJvdG90eXBlID09IFwiZ3JpZFwiXG4gICAgICBAcmVzdWx0ID0gbmV3IEtsYXNzUmVzdWx0XG4gICAgICAgIHByb3RvdHlwZSAgICA6IFwiZ3JpZFwiXG4gICAgICAgIHN0YXJ0VGltZSAgICA6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgICAgaXRlbVR5cGUgICAgIDogQHN1YnRlc3QuZ2V0KFwiaXRlbVR5cGVcIilcbiAgICAgICAgcmVwb3J0VHlwZSAgIDogQHN1YnRlc3QuZ2V0KFwicmVwb3J0VHlwZVwiKVxuICAgICAgICBzdHVkZW50SWQgICAgOiBAc3R1ZGVudC5pZFxuICAgICAgICBzdWJ0ZXN0SWQgICAgOiBAc3VidGVzdC5pZFxuICAgICAgICBwYXJ0ICAgICAgICAgOiBAc3VidGVzdC5nZXQoXCJwYXJ0XCIpXG4gICAgICAgIGtsYXNzSWQgICAgICA6IEBzdHVkZW50LmdldChcImtsYXNzSWRcIilcbiAgICAgICAgdGltZUFsbG93ZWQgIDogQHN1YnRlc3QuZ2V0KFwidGltZXJcIilcbiAgICBlbHNlIGlmIEBwcm90b3R5cGUgPT0gXCJzdXJ2ZXlcIlxuICAgICAgQHJlc3VsdCA9IG5ldyBLbGFzc1Jlc3VsdFxuICAgICAgICBwcm90b3R5cGUgICAgOiBcInN1cnZleVwiXG4gICAgICAgIHN0YXJ0VGltZSAgICA6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgICAgc3R1ZGVudElkICAgIDogQHN0dWRlbnQuaWRcbiAgICAgICAgc3VidGVzdElkICAgIDogQHN1YnRlc3QuaWRcbiAgICAgICAgcGFydCAgICAgICAgIDogQHN1YnRlc3QuZ2V0KFwicGFydFwiKVxuICAgICAgICBrbGFzc0lkICAgICAgOiBAc3R1ZGVudC5nZXQoXCJrbGFzc0lkXCIpXG4gICAgICAgIGl0ZW1UeXBlICAgICA6IEBzdWJ0ZXN0LmdldChcIml0ZW1UeXBlXCIpXG4gICAgICAgIHJlcG9ydFR5cGUgICA6IEBzdWJ0ZXN0LmdldChcInJlcG9ydFR5cGVcIilcbiAgICAgIEBxdWVzdGlvbnMuc29ydCgpXG4gICAgICBAcmVuZGVyKClcblxuXG4gIHJlbmRlcjogLT5cbiAgICBlbnVtZXJhdG9ySGVscCA9IGlmIChAc3VidGVzdC5nZXQoXCJlbnVtZXJhdG9ySGVscFwiKSB8fCBcIlwiKSAhPSBcIlwiIHRoZW4gXCI8YnV0dG9uIGNsYXNzPSdzdWJ0ZXN0X2hlbHAgY29tbWFuZCc+aGVscDwvYnV0dG9uPjxkaXYgY2xhc3M9J2VudW1lcmF0b3JfaGVscCc+I3tAc3VidGVzdC5nZXQgJ2VudW1lcmF0b3JIZWxwJ308L2Rpdj5cIiBlbHNlIFwiXCJcbiAgICBzdHVkZW50RGlhbG9nICA9IGlmIChAc3VidGVzdC5nZXQoXCJzdHVkZW50RGlhbG9nXCIpICB8fCBcIlwiKSAhPSBcIlwiIHRoZW4gXCI8ZGl2IGNsYXNzPSdzdHVkZW50X2RpYWxvZyc+I3tAc3VidGVzdC5nZXQgJ3N0dWRlbnREaWFsb2cnfTwvZGl2PlwiIGVsc2UgXCJcIlxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8aDI+I3tAc3VidGVzdC5nZXQgJ25hbWUnfTwvaDI+XG4gICAgICAje2VudW1lcmF0b3JIZWxwfVxuICAgICAgI3tzdHVkZW50RGlhbG9nfVxuICAgIFwiXG5cbiAgICAjIFVzZSBwcm90b3R5cGUgc3BlY2lmaWMgdmlld3MgaGVyZVxuICAgIEBwcm90b3R5cGVWaWV3ID0gbmV3IHdpbmRvd1tAcHJvdG9WaWV3c1tAc3VidGVzdC5nZXQgJ3Byb3RvdHlwZSddWydydW4nXV1cbiAgICAgIG1vZGVsOiBAc3VidGVzdFxuICAgICAgcGFyZW50OiBAXG4gICAgQHByb3RvdHlwZVZpZXcub24gXCJyZW5kZXJlZFwiLCBAb25Qcm90b3R5cGVSZW5kZXJlZFxuICAgIEBwcm90b3R5cGVWaWV3LnJlbmRlcigpXG4gICAgQCRlbC5hcHBlbmQgQHByb3RvdHlwZVZpZXcuZWxcbiAgICBAcHJvdG90eXBlUmVuZGVyZWQgPSB0cnVlXG5cbiAgICBAJGVsLmFwcGVuZCBcIjxidXR0b24gY2xhc3M9J2RvbmUgbmF2aWdhdGlvbic+RG9uZTwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSdjYW5jZWwgbmF2aWdhdGlvbic+Q2FuY2VsPC9idXR0b24+XCJcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gIG9uUHJvdG90eXBlUmVuZGVyZWQ6ID0+XG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgZ2V0R3JpZFNjb3JlOiAtPiBcbiAgICByZXR1cm4gZmFsc2UgaWYgbm90IEBsaW5rZWRSZXN1bHQuZ2V0KFwic3VidGVzdERhdGFcIik/ICMgbm8gcmVzdWx0IGZvdW5kXG4gICAgcmVzdWx0ID0gQGxpbmtlZFJlc3VsdC5nZXQoXCJzdWJ0ZXN0RGF0YVwiKVsnYXR0ZW1wdGVkJ10gfHwgMCBcbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgZ3JpZFdhc0F1dG9zdG9wcGVkOiAtPiBAbGlua2VkUmVzdWx0LmdldChcInN1YnRlc3REYXRhXCIpP1snYXV0b19zdG9wJ10gfHwgMFxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQHByb3RvdHlwZVZpZXc/LmNsb3NlPygpXG5cbiAgaXNWYWxpZDogLT5cbiAgICBpZiBub3QgQHByb3RvdHlwZVJlbmRlcmVkIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgaWYgQHByb3RvdHlwZVZpZXcuaXNWYWxpZD9cbiAgICAgIHJldHVybiBAcHJvdG90eXBlVmlldy5pc1ZhbGlkKClcbiAgICBlbHNlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB0cnVlXG5cbiAgZ2V0U2tpcHBlZDogLT5cbiAgICBpZiBAcHJvdG90eXBlVmlldy5nZXRTa2lwcGVkP1xuICAgICAgcmV0dXJuIEBwcm90b3R5cGVWaWV3LmdldFNraXBwZWQoKVxuICAgIGVsc2VcbiAgICAgIHRocm93IFwiUHJvdG90eXBlIHNraXBwaW5nIG5vdCBpbXBsZW1lbnRlZFwiXG5cbiAgY2FuY2VsOiAtPlxuICAgIGlmIEBzdHVkZW50LmlkID09IFwidGVzdFwiXG4gICAgICBoaXN0b3J5LmJhY2soKVxuICAgICAgcmV0dXJuXG5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiY2xhc3MvI3tAc3R1ZGVudC5nZXQoJ2tsYXNzSWQnKX0vI3tAc3VidGVzdC5nZXQoJ3BhcnQnKX1cIiwgdHJ1ZVxuXG4gIGRvbmU6IC0+XG4gICAgaWYgQHN0dWRlbnQuaWQgPT0gXCJ0ZXN0XCJcbiAgICAgIGhpc3RvcnkuYmFjaygpXG4gICAgICByZXR1cm5cblxuICAgIGlmIEBpc1ZhbGlkKClcbiAgICAgICMgR2F1cmFudGVlIHNpbmdsZSBcIm5ld1wiIHJlc3VsdFxuICAgICAgVGFuZ2VyaW5lLiRkYi52aWV3IFwiI3tUYW5nZXJpbmUuZGVzaWduX2RvY30vcmVzdWx0c0J5U3R1ZGVudFN1YnRlc3RcIixcbiAgICAgICAga2V5IDogW0BzdHVkZW50LmlkLEBzdWJ0ZXN0LmlkXVxuICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgICByb3dzID0gZGF0YS5yb3dzXG4gICAgICAgICAgZm9yIGRhdHVtIGluIHJvd3NcbiAgICAgICAgICAgIFRhbmdlcmluZS4kZGIuc2F2ZURvYyAkLmV4dGVuZChkYXR1bS52YWx1ZSwgXCJvbGRcIjp0cnVlKVxuICAgICAgICAgICMgc2F2ZSB0aGlzIHJlc3VsdFxuICAgICAgICAgIEByZXN1bHQuYWRkIEBwcm90b3R5cGVWaWV3LmdldFJlc3VsdCgpLCA9PlxuICAgICAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImNsYXNzLyN7QHN0dWRlbnQuZ2V0KCdrbGFzc0lkJyl9LyN7QHN1YnRlc3QuZ2V0KCdwYXJ0Jyl9XCIsIHRydWVcbiAgICBlbHNlXG4gICAgICBAcHJvdG90eXBlVmlldy5zaG93RXJyb3JzKCkiXX0=

var AssessmentsView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AssessmentsView = (function(superClass) {
  extend(AssessmentsView, superClass);

  function AssessmentsView() {
    this.render = bind(this.render, this);
    return AssessmentsView.__super__.constructor.apply(this, arguments);
  }

  AssessmentsView.prototype.className = "AssessmentsView";

  AssessmentsView.prototype.tagName = "section";

  AssessmentsView.prototype.events = {
    "click .toggle_archived": "toggleArchived"
  };

  AssessmentsView.prototype.toggleArchived = function(event) {
    var $container;
    if (this.archivedIsVisible) {
      this.archivedIsVisible = false;
      $container = this.$el.find(".archived_list").addClass("confirmation");
      return this.$el.find(".toggle_archived").html("Show");
    } else {
      this.archivedIsVisible = true;
      $container = this.$el.find(".archived_list").removeClass("confirmation");
      return this.$el.find(".toggle_archived").html("Hide");
    }
  };

  AssessmentsView.prototype.initialize = function(options) {
    this.assessments = options.assessments;
    this.subviews = [];
    return this.archivedIsVisible = false;
  };

  AssessmentsView.prototype.render = function(event) {
    var htmlList, i, len, ref, results, view;
    this.closeViews();
    if (this.assessments.length === 0) {
      return this.$el.html("<p class='grey'>No assessments.</p>");
    }
    this.subviews = [];
    htmlList = "";
    this.assessments.each((function(_this) {
      return function(assessment) {
        var newView;
        newView = new AssessmentListElementView({
          "model": assessment,
          "showAll": _this.showAll
        });
        _this.subviews.push(newView);
        return htmlList += "<li class='AssessmentListElementView' id='" + assessment.id + "'></li>";
      };
    })(this));
    this.$el.html("<ul class='active_list assessment_list'> " + htmlList + " </ul>");
    ref = this.subviews;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      results.push(view.setElement(this.$el.find("#" + view.model.id)).render());
    }
    return results;
  };

  AssessmentsView.prototype.closeViews = function() {
    var i, len, ref, view;
    ref = this.subviews;
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      view.close();
    }
    return this.subviews = [];
  };

  AssessmentsView.prototype.onClose = function() {
    return this.closeViews();
  };

  return AssessmentsView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYXNzZXNzbWVudC9Bc3Nlc3NtZW50c1ZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLElBQUEsZUFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7OzRCQUVKLFNBQUEsR0FBWTs7NEJBQ1osT0FBQSxHQUFVOzs0QkFFVixNQUFBLEdBQ0U7SUFBQSx3QkFBQSxFQUEyQixnQkFBM0I7Ozs0QkFFRixjQUFBLEdBQWdCLFNBQUMsS0FBRDtBQUVkLFFBQUE7SUFBQSxJQUFHLElBQUMsQ0FBQSxpQkFBSjtNQUNFLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtNQUNyQixVQUFBLEdBQWEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsZ0JBQVYsQ0FBMkIsQ0FBQyxRQUE1QixDQUFxQyxjQUFyQzthQUNiLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGtCQUFWLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsTUFBbkMsRUFIRjtLQUFBLE1BQUE7TUFLRSxJQUFDLENBQUEsaUJBQUQsR0FBcUI7TUFDckIsVUFBQSxHQUFhLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdCQUFWLENBQTJCLENBQUMsV0FBNUIsQ0FBd0MsY0FBeEM7YUFDYixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxrQkFBVixDQUE2QixDQUFDLElBQTlCLENBQW1DLE1BQW5DLEVBUEY7O0VBRmM7OzRCQVdoQixVQUFBLEdBQVksU0FBQyxPQUFEO0lBRVYsSUFBQyxDQUFBLFdBQUQsR0FBZSxPQUFPLENBQUM7SUFFdkIsSUFBQyxDQUFBLFFBQUQsR0FBcUI7V0FDckIsSUFBQyxDQUFBLGlCQUFELEdBQXFCO0VBTFg7OzRCQVFaLE1BQUEsR0FBUSxTQUFDLEtBQUQ7QUFFTixRQUFBO0lBQUEsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUdBLElBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLEtBQXVCLENBQTFCO0FBQ0UsYUFBTyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxxQ0FBVixFQURUOztJQUdBLElBQUMsQ0FBQSxRQUFELEdBQWE7SUFDYixRQUFBLEdBQVc7SUFFWCxJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBa0IsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLFVBQUQ7QUFFaEIsWUFBQTtRQUFBLE9BQUEsR0FBYyxJQUFBLHlCQUFBLENBQ1o7VUFBQSxPQUFBLEVBQWMsVUFBZDtVQUNBLFNBQUEsRUFBYyxLQUFDLENBQUEsT0FEZjtTQURZO1FBSWQsS0FBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsT0FBZjtlQUNBLFFBQUEsSUFBWSw0Q0FBQSxHQUE2QyxVQUFVLENBQUMsRUFBeEQsR0FBMkQ7TUFQdkQ7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCO0lBU0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsMkNBQUEsR0FFSixRQUZJLEdBRUssUUFGZjtBQU1BO0FBQUE7U0FBQSxxQ0FBQTs7bUJBQ0UsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsR0FBQSxHQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBekIsQ0FBaEIsQ0FBK0MsQ0FBQyxNQUFoRCxDQUFBO0FBREY7O0VBMUJNOzs0QkE2QlIsVUFBQSxHQUFZLFNBQUE7QUFDVixRQUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBOztNQUNFLElBQUksQ0FBQyxLQUFMLENBQUE7QUFERjtXQUVBLElBQUMsQ0FBQSxRQUFELEdBQVk7RUFIRjs7NEJBS1osT0FBQSxHQUFTLFNBQUE7V0FDUCxJQUFDLENBQUEsVUFBRCxDQUFBO0VBRE87Ozs7R0E3RG1CLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL2Fzc2Vzc21lbnQvQXNzZXNzbWVudHNWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyBEaXNwbGF5cyBhIGdyb3VwIGhlYWRlciBhbmQgYSBsaXN0IG9mIGFzc2Vzc21lbnRzXG4jIGV2ZW50c1xuIyByZS1yZW5kZXJzIG9uIEBhc3Nlc3NtZW50cyBcImFkZCBkZXN0cm95XCJcbiNcbmNsYXNzIEFzc2Vzc21lbnRzVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIkFzc2Vzc21lbnRzVmlld1wiXG4gIHRhZ05hbWUgOiBcInNlY3Rpb25cIlxuXG4gIGV2ZW50cyA6IFxuICAgIFwiY2xpY2sgLnRvZ2dsZV9hcmNoaXZlZFwiIDogXCJ0b2dnbGVBcmNoaXZlZFwiXG5cbiAgdG9nZ2xlQXJjaGl2ZWQ6IChldmVudCkgLT5cblxuICAgIGlmIEBhcmNoaXZlZElzVmlzaWJsZVxuICAgICAgQGFyY2hpdmVkSXNWaXNpYmxlID0gZmFsc2VcbiAgICAgICRjb250YWluZXIgPSBAJGVsLmZpbmQoXCIuYXJjaGl2ZWRfbGlzdFwiKS5hZGRDbGFzcyBcImNvbmZpcm1hdGlvblwiXG4gICAgICBAJGVsLmZpbmQoXCIudG9nZ2xlX2FyY2hpdmVkXCIpLmh0bWwgXCJTaG93XCJcbiAgICBlbHNlXG4gICAgICBAYXJjaGl2ZWRJc1Zpc2libGUgPSB0cnVlXG4gICAgICAkY29udGFpbmVyID0gQCRlbC5maW5kKFwiLmFyY2hpdmVkX2xpc3RcIikucmVtb3ZlQ2xhc3MgXCJjb25maXJtYXRpb25cIlxuICAgICAgQCRlbC5maW5kKFwiLnRvZ2dsZV9hcmNoaXZlZFwiKS5odG1sIFwiSGlkZVwiXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAYXNzZXNzbWVudHMgPSBvcHRpb25zLmFzc2Vzc21lbnRzXG5cbiAgICBAc3Vidmlld3MgICAgICAgICAgPSBbXSAjIHVzZWQgdG8ga2VlcCB0cmFjayBvZiB2aWV3cyB0byBjbG9zZVxuICAgIEBhcmNoaXZlZElzVmlzaWJsZSA9IGZhbHNlICMgdG9nZ2xlZFxuXG5cbiAgcmVuZGVyOiAoZXZlbnQpID0+XG5cbiAgICBAY2xvc2VWaWV3cygpXG5cbiAgICAjIGVzY2FwZSBpZiBubyBhc3Nlc3NtZW50cyBpbiBub24tcHVibGljIGxpc3RcbiAgICBpZiBAYXNzZXNzbWVudHMubGVuZ3RoIGlzIDBcbiAgICAgIHJldHVybiBAJGVsLmh0bWwgXCI8cCBjbGFzcz0nZ3JleSc+Tm8gYXNzZXNzbWVudHMuPC9wPlwiXG5cbiAgICBAc3Vidmlld3MgID0gW11cbiAgICBodG1sTGlzdCA9IFwiXCJcblxuICAgIEBhc3Nlc3NtZW50cy5lYWNoIChhc3Nlc3NtZW50KSA9PlxuXG4gICAgICBuZXdWaWV3ID0gbmV3IEFzc2Vzc21lbnRMaXN0RWxlbWVudFZpZXdcbiAgICAgICAgXCJtb2RlbFwiICAgICA6IGFzc2Vzc21lbnRcbiAgICAgICAgXCJzaG93QWxsXCIgICA6IEBzaG93QWxsXG5cbiAgICAgIEBzdWJ2aWV3cy5wdXNoIG5ld1ZpZXdcbiAgICAgIGh0bWxMaXN0ICs9IFwiPGxpIGNsYXNzPSdBc3Nlc3NtZW50TGlzdEVsZW1lbnRWaWV3JyBpZD0nI3thc3Nlc3NtZW50LmlkfSc+PC9saT5cIlxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8dWwgY2xhc3M9J2FjdGl2ZV9saXN0IGFzc2Vzc21lbnRfbGlzdCc+XG4gICAgICAgICN7aHRtbExpc3R9XG4gICAgICA8L3VsPlxuICAgIFwiXG5cbiAgICBmb3IgdmlldyBpbiBAc3Vidmlld3NcbiAgICAgIHZpZXcuc2V0RWxlbWVudChAJGVsLmZpbmQoXCIjI3t2aWV3Lm1vZGVsLmlkfVwiKSkucmVuZGVyKClcblxuICBjbG9zZVZpZXdzOiAtPlxuICAgIGZvciB2aWV3IGluIEBzdWJ2aWV3c1xuICAgICAgdmlldy5jbG9zZSgpXG4gICAgQHN1YnZpZXdzID0gW11cblxuICBvbkNsb3NlOiAtPlxuICAgIEBjbG9zZVZpZXdzKCkiXX0=

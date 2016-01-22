var AssessmentsMenuView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AssessmentsMenuView = (function(superClass) {
  extend(AssessmentsMenuView, superClass);

  function AssessmentsMenuView() {
    this.render = bind(this.render, this);
    this.syncTablets = bind(this.syncTablets, this);
    return AssessmentsMenuView.__super__.constructor.apply(this, arguments);
  }

  AssessmentsMenuView.prototype.className = "AssessmentsMenuView";

  AssessmentsMenuView.prototype.events = {
    'click .import': 'import',
    'click .universal_upload': 'universalUpload',
    'click .sync_tablets': 'syncTablets',
    'click .results': 'results',
    'click .emergency_sync': 'emergencySync'
  };

  AssessmentsMenuView.prototype.syncTablets = function() {
    return this.tabletManager.sync();
  };

  AssessmentsMenuView.prototype.results = function() {
    return Tangerine.router.navigate("dashboard", true);
  };

  AssessmentsMenuView.prototype.universalUpload = function() {
    return Utils.universalUpload();
  };

  AssessmentsMenuView.prototype.emergencySync = function() {
    return Utils.replicateToServer(null, null);
  };

  AssessmentsMenuView.prototype.apk = function() {
    return TangerineTree.make({
      success: function(data) {
        var a;
        a = document.createElement("a");
        a.href = Tangerine.settings.config.get("tree");
        return Utils.sticky("<h1>APK link</h1><p>" + a.host + "/apk/" + data.token + "</p>");
      },
      error: function(xhr, response) {
        return Utils.sticky(response.error);
      }
    });
  };

  AssessmentsMenuView.prototype.gotoGroups = function() {
    return Tangerine.router.navigate("groups", true);
  };

  AssessmentsMenuView.prototype["import"] = function() {
    return Tangerine.router.navigate("import", true);
  };

  AssessmentsMenuView.prototype.i18n = function() {
    return this.text = {
      "new": t("AssessmentMenuView.button.new"),
      apk: t("AssessmentMenuView.button.apk"),
      groups: t("AssessmentMenuView.button.groups"),
      universal_upload: t("AssessmentMenuView.button.universal_upload"),
      emergency_sync: t("AssessmentMenuView.button.emergency_sync"),
      sync_tablets: t("AssessmentMenuView.button.sync_tablets"),
      results: t("AssessmentMenuView.button.results"),
      save: t("AssessmentMenuView.button.save"),
      cancel: t("AssessmentMenuView.button.cancel"),
      assessment: t("AssessmentMenuView.label.assessment"),
      assessments: t("AssessmentMenuView.label.assessments"),
      curriculum: t("AssessmentMenuView.label.curriculum")
    };
  };

  AssessmentsMenuView.prototype.initialize = function(options) {
    var key, value;
    this.i18n();
    this.tabletManager = new TabletManagerView({
      docTypes: ["result"],
      callbacks: {
        completePull: (function(_this) {
          return function() {
            return _this.tabletManager.pushDocs();
          };
        })(this)
      }
    });
    for (key in options) {
      value = options[key];
      this[key] = value;
    }
    this.assessments.each((function(_this) {
      return function(assessment) {
        return assessment.on("new", _this.addAssessment);
      };
    })(this));
    return this.assessmentsView = new AssessmentsView({
      "assessments": this.assessments,
      "parent": this
    });
  };

  AssessmentsMenuView.prototype.render = function() {
    var apkButton, emergencySyncButton, groupHandle, groupsButton, html, isAdmin, newButton, resultsButton, syncTabletsButton, uploadButton;
    isAdmin = Tangerine.user.isAdmin();
    newButton = "<button class='new command'>" + this.text["new"] + "</button>";
    apkButton = "<button class='apk navigation'>" + this.text.apk + "</button>";
    groupsButton = "<button class='navigation groups'>" + this.text.groups + "</button>";
    uploadButton = "<button class='command universal_upload'>" + this.text.universal_upload + "</button>";
    emergencySyncButton = "<button class='command emergency_sync'>" + this.text.emergency_sync + "</button>";
    syncTabletsButton = "<button class='command sync_tablets'>" + this.text.sync_tablets + "</button>";
    resultsButton = "<button class='navigation results'>" + this.text.results + "</button>";
    groupHandle = "<h2 class='settings grey' data-attribtue='groupHandle'>" + (Tangerine.settings.getEscapedString('groupHandle') || Tangerine.settings.get('groupName')) + "</h2>";
    html = "<section> <h1>" + this.text.assessments + "</h1>";
    html += "<div id='assessments_container'></div> </section> <br> " + syncTabletsButton + " " + uploadButton + " " + emergencySyncButton;
    this.$el.html(html);
    this.assessmentsView.setElement(this.$el.find("#assessments_container"));
    return this.assessmentsView.render();
  };

  AssessmentsMenuView.prototype.closeViews = function() {
    return this.assessmentsView.close();
  };

  AssessmentsMenuView.prototype.onClose = function() {
    return this.closeViews();
  };

  return AssessmentsMenuView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYXNzZXNzbWVudC9Bc3Nlc3NtZW50c01lbnVWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLG1CQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7O2dDQUVKLFNBQUEsR0FBVzs7Z0NBRVgsTUFBQSxHQUNFO0lBQUEsZUFBQSxFQUF1QixRQUF2QjtJQUNBLHlCQUFBLEVBQTRCLGlCQUQ1QjtJQUVBLHFCQUFBLEVBQXdCLGFBRnhCO0lBR0EsZ0JBQUEsRUFBMEIsU0FIMUI7SUFJQSx1QkFBQSxFQUFpQyxlQUpqQzs7O2dDQU1GLFdBQUEsR0FBYSxTQUFBO1dBQ1gsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQUE7RUFEVzs7Z0NBR2IsT0FBQSxHQUFTLFNBQUE7V0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFdBQTFCLEVBQXVDLElBQXZDO0VBQUg7O2dDQUVULGVBQUEsR0FBaUIsU0FBQTtXQUFHLEtBQUssQ0FBQyxlQUFOLENBQUE7RUFBSDs7Z0NBRWpCLGFBQUEsR0FBZSxTQUFBO1dBQUcsS0FBSyxDQUFDLGlCQUFOLENBQXdCLElBQXhCLEVBQTZCLElBQTdCO0VBQUg7O2dDQUVmLEdBQUEsR0FBSyxTQUFBO1dBQ0gsYUFBYSxDQUFDLElBQWQsQ0FDRTtNQUFBLE9BQUEsRUFBUyxTQUFDLElBQUQ7QUFDUCxZQUFBO1FBQUEsQ0FBQSxHQUFJLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCO1FBQ0osQ0FBQyxDQUFDLElBQUYsR0FBUyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUExQixDQUE4QixNQUE5QjtlQUNULEtBQUssQ0FBQyxNQUFOLENBQWEsc0JBQUEsR0FBdUIsQ0FBQyxDQUFDLElBQXpCLEdBQThCLE9BQTlCLEdBQXFDLElBQUksQ0FBQyxLQUExQyxHQUFnRCxNQUE3RDtNQUhPLENBQVQ7TUFJQSxLQUFBLEVBQU8sU0FBQyxHQUFELEVBQU0sUUFBTjtlQUNMLEtB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LElBQUksQ0FBQyxPQUE1QyxHQUFvRDtJQUNwRSxXQUFBLEdBQWdCLHlEQUFBLEdBQXlELENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxnQkFBbkIsQ0FBb0MsYUFBcEMsQ0FBQSxJQUFzRCxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQW5CLENBQXVCLFdBQXZCLENBQXZELENBQXpELEdBQW9KO0lBRXBLLElBQUEsR0FBTyxnQkFBQSxHQUVHLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FGVCxHQUVxQjtJQUc1QixJQUFBLElBQVEseURBQUEsR0FJSixpQkFKSSxHQUljLEdBSmQsR0FLSixZQUxJLEdBS1MsR0FMVCxHQU1KO0lBR0osSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsSUFBVjtJQUVBLElBQUMsQ0FBQSxlQUFlLENBQUMsVUFBakIsQ0FBNkIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsd0JBQVYsQ0FBN0I7V0FDQSxJQUFDLENBQUEsZUFBZSxDQUFDLE1BQWpCLENBQUE7RUE3Qk07O2dDQWlDUixVQUFBLEdBQVksU0FBQTtXQUNWLElBQUMsQ0FBQSxlQUFlLENBQUMsS0FBakIsQ0FBQTtFQURVOztnQ0FHWixPQUFBLEdBQVMsU0FBQTtXQUNQLElBQUMsQ0FBQSxVQUFELENBQUE7RUFETzs7OztHQXZHdUIsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvYXNzZXNzbWVudC9Bc3Nlc3NtZW50c01lbnVWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXNzZXNzbWVudHNNZW51VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiQXNzZXNzbWVudHNNZW51Vmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAuaW1wb3J0JyAgICAgIDogJ2ltcG9ydCdcbiAgICAnY2xpY2sgLnVuaXZlcnNhbF91cGxvYWQnIDogJ3VuaXZlcnNhbFVwbG9hZCdcbiAgICAnY2xpY2sgLnN5bmNfdGFibGV0cycgOiAnc3luY1RhYmxldHMnXG4gICAgJ2NsaWNrIC5yZXN1bHRzJyAgICAgICAgOiAncmVzdWx0cydcbiAgICAnY2xpY2sgLmVtZXJnZW5jeV9zeW5jJyAgICAgICAgOiAnZW1lcmdlbmN5U3luYydcblxuICBzeW5jVGFibGV0czogPT5cbiAgICBAdGFibGV0TWFuYWdlci5zeW5jKClcblxuICByZXN1bHRzOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiZGFzaGJvYXJkXCIsIHRydWVcblxuICB1bml2ZXJzYWxVcGxvYWQ6IC0+IFV0aWxzLnVuaXZlcnNhbFVwbG9hZCgpXG5cbiAgZW1lcmdlbmN5U3luYzogLT4gVXRpbHMucmVwbGljYXRlVG9TZXJ2ZXIobnVsbCxudWxsKVxuXG4gIGFwazogLT5cbiAgICBUYW5nZXJpbmVUcmVlLm1ha2VcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIilcbiAgICAgICAgYS5ocmVmID0gVGFuZ2VyaW5lLnNldHRpbmdzLmNvbmZpZy5nZXQoXCJ0cmVlXCIpXG4gICAgICAgIFV0aWxzLnN0aWNreShcIjxoMT5BUEsgbGluazwvaDE+PHA+I3thLmhvc3R9L2Fway8je2RhdGEudG9rZW59PC9wPlwiKVxuICAgICAgZXJyb3I6ICh4aHIsIHJlc3BvbnNlKSAtPlxuICAgICAgICBVdGlscy5zdGlja3kgcmVzcG9uc2UuZXJyb3JcblxuICBnb3RvR3JvdXBzOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiZ3JvdXBzXCIsIHRydWVcblxuICBpbXBvcnQ6ICAgICAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiaW1wb3J0XCIsIHRydWVcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIFwibmV3XCIgICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLm5ld1wiKVxuICAgICAgYXBrICAgICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLmFwa1wiKVxuICAgICAgZ3JvdXBzICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLmdyb3Vwc1wiKVxuICAgICAgdW5pdmVyc2FsX3VwbG9hZCA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnVuaXZlcnNhbF91cGxvYWRcIilcbiAgICAgIGVtZXJnZW5jeV9zeW5jIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uZW1lcmdlbmN5X3N5bmNcIilcbiAgICAgIHN5bmNfdGFibGV0cyAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5zeW5jX3RhYmxldHNcIilcbiAgICAgIHJlc3VsdHMgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5yZXN1bHRzXCIpXG4gICAgICBzYXZlICAgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uc2F2ZVwiKVxuICAgICAgY2FuY2VsICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLmNhbmNlbFwiKVxuICAgICAgYXNzZXNzbWVudCAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmxhYmVsLmFzc2Vzc21lbnRcIilcbiAgICAgIGFzc2Vzc21lbnRzIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5hc3Nlc3NtZW50c1wiKVxuICAgICAgY3VycmljdWx1bSAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmxhYmVsLmN1cnJpY3VsdW1cIilcblxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQGkxOG4oKVxuXG4gICAgQHRhYmxldE1hbmFnZXIgPSBuZXcgVGFibGV0TWFuYWdlclZpZXdcbiAgICAgIGRvY1R5cGVzIDogW1wicmVzdWx0XCJdXG4gICAgICBjYWxsYmFja3M6XG4gICAgICAgIGNvbXBsZXRlUHVsbDogPT4gQHRhYmxldE1hbmFnZXIucHVzaERvY3MoKVxuXG4gICAgQFtrZXldID0gdmFsdWUgZm9yIGtleSwgdmFsdWUgb2Ygb3B0aW9uc1xuICAgICAgXG4gICAgQGFzc2Vzc21lbnRzLmVhY2ggKGFzc2Vzc21lbnQpID0+IGFzc2Vzc21lbnQub24gXCJuZXdcIiwgQGFkZEFzc2Vzc21lbnRcblxuICAgIEBhc3Nlc3NtZW50c1ZpZXcgPSBuZXcgQXNzZXNzbWVudHNWaWV3XG4gICAgICBcImFzc2Vzc21lbnRzXCIgOiBAYXNzZXNzbWVudHNcbiAgICAgIFwicGFyZW50XCIgICAgICA6IEBcblxuXG4gIHJlbmRlcjogPT5cbiAgICBpc0FkbWluID0gVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG4gICAgXG4gICAgbmV3QnV0dG9uICAgICA9IFwiPGJ1dHRvbiBjbGFzcz0nbmV3IGNvbW1hbmQnPiN7QHRleHQubmV3fTwvYnV0dG9uPlwiXG4gICAgYXBrQnV0dG9uICAgICA9IFwiPGJ1dHRvbiBjbGFzcz0nYXBrIG5hdmlnYXRpb24nPiN7QHRleHQuYXBrfTwvYnV0dG9uPlwiXG4gICAgZ3JvdXBzQnV0dG9uICA9IFwiPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBncm91cHMnPiN7QHRleHQuZ3JvdXBzfTwvYnV0dG9uPlwiXG4gICAgdXBsb2FkQnV0dG9uICA9IFwiPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCB1bml2ZXJzYWxfdXBsb2FkJz4je0B0ZXh0LnVuaXZlcnNhbF91cGxvYWR9PC9idXR0b24+XCJcbiAgICBlbWVyZ2VuY3lTeW5jQnV0dG9uICA9IFwiPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBlbWVyZ2VuY3lfc3luYyc+I3tAdGV4dC5lbWVyZ2VuY3lfc3luY308L2J1dHRvbj5cIlxuICAgIHN5bmNUYWJsZXRzQnV0dG9uID0gXCI8YnV0dG9uIGNsYXNzPSdjb21tYW5kIHN5bmNfdGFibGV0cyc+I3tAdGV4dC5zeW5jX3RhYmxldHN9PC9idXR0b24+XCJcbiAgICByZXN1bHRzQnV0dG9uID0gXCI8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIHJlc3VsdHMnPiN7QHRleHQucmVzdWx0c308L2J1dHRvbj5cIlxuICAgIGdyb3VwSGFuZGxlICAgPSBcIjxoMiBjbGFzcz0nc2V0dGluZ3MgZ3JleScgZGF0YS1hdHRyaWJ0dWU9J2dyb3VwSGFuZGxlJz4je1RhbmdlcmluZS5zZXR0aW5ncy5nZXRFc2NhcGVkU3RyaW5nKCdncm91cEhhbmRsZScpIHx8IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoJ2dyb3VwTmFtZScpfTwvaDI+XCJcblxuICAgIGh0bWwgPSBcIlxuICAgICAgPHNlY3Rpb24+XG4gICAgICAgIDxoMT4je0B0ZXh0LmFzc2Vzc21lbnRzfTwvaDE+XG4gICAgXCJcblxuICAgIGh0bWwgKz0gXCJcbiAgICAgICAgPGRpdiBpZD0nYXNzZXNzbWVudHNfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDxicj5cbiAgICAgICN7c3luY1RhYmxldHNCdXR0b259XG4gICAgICAje3VwbG9hZEJ1dHRvbn1cbiAgICAgICN7ZW1lcmdlbmN5U3luY0J1dHRvbn1cbiAgICBcIlxuXG4gICAgQCRlbC5odG1sIGh0bWxcblxuICAgIEBhc3Nlc3NtZW50c1ZpZXcuc2V0RWxlbWVudCggQCRlbC5maW5kKFwiI2Fzc2Vzc21lbnRzX2NvbnRhaW5lclwiKSApXG4gICAgQGFzc2Vzc21lbnRzVmlldy5yZW5kZXIoKVxuXG5cbiAgIyBWaWV3TWFuYWdlclxuICBjbG9zZVZpZXdzOiAtPlxuICAgIEBhc3Nlc3NtZW50c1ZpZXcuY2xvc2UoKVxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQGNsb3NlVmlld3MoKVxuIl19

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
    'click .emergency_sync': 'emergencySync',
    'click .save_to_disk': 'saveToDisk'
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

  AssessmentsMenuView.prototype.saveToDisk = function() {
    return Utils.saveDocListToFile();
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
      save_to_disk: t("AssessmentMenuView.button.save_to_disk"),
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
    var apkButton, emergencySyncButton, groupHandle, groupsButton, html, isAdmin, newButton, resultsButton, saveToDiskButton, syncTabletsButton, uploadButton;
    isAdmin = Tangerine.user.isAdmin();
    newButton = "<button class='new command'>" + this.text["new"] + "</button>";
    apkButton = "<button class='apk navigation'>" + this.text.apk + "</button>";
    groupsButton = "<button class='navigation groups'>" + this.text.groups + "</button>";
    uploadButton = "<button class='command universal_upload'>" + this.text.universal_upload + "</button>";
    emergencySyncButton = "<button class='command emergency_sync'>" + this.text.emergency_sync + "</button>";
    syncTabletsButton = "<button class='command sync_tablets'>" + this.text.sync_tablets + "</button>";
    resultsButton = "<button class='navigation results'>" + this.text.results + "</button>";
    saveToDiskButton = "<button class='command save_to_disk'>" + this.text.save_to_disk + "</button>";
    groupHandle = "<h2 class='settings grey' data-attribtue='groupHandle'>" + (Tangerine.settings.getEscapedString('groupHandle') || Tangerine.settings.get('groupName')) + "</h2>";
    html = "<section> <h1>" + this.text.assessments + "</h1>";
    html += "<div id='assessments_container'></div> </section> <br> " + syncTabletsButton + " " + uploadButton + " " + saveToDiskButton;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYXNzZXNzbWVudC9Bc3Nlc3NtZW50c01lbnVWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLG1CQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7O2dDQUVKLFNBQUEsR0FBVzs7Z0NBRVgsTUFBQSxHQUNFO0lBQUEsZUFBQSxFQUF1QixRQUF2QjtJQUNBLHlCQUFBLEVBQTRCLGlCQUQ1QjtJQUVBLHFCQUFBLEVBQXdCLGFBRnhCO0lBR0EsZ0JBQUEsRUFBMEIsU0FIMUI7SUFJQSx1QkFBQSxFQUFpQyxlQUpqQztJQUtBLHFCQUFBLEVBQStCLFlBTC9COzs7Z0NBT0YsV0FBQSxHQUFhLFNBQUE7V0FDWCxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBQTtFQURXOztnQ0FHYixPQUFBLEdBQVMsU0FBQTtXQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBMEIsV0FBMUIsRUFBdUMsSUFBdkM7RUFBSDs7Z0NBRVQsZUFBQSxHQUFpQixTQUFBO1dBQUcsS0FBSyxDQUFDLGVBQU4sQ0FBQTtFQUFIOztnQ0FFakIsYUFBQSxHQUFlLFNBQUE7V0FBRyxLQUFLLENBQUMsaUJBQU4sQ0FBd0IsSUFBeEIsRUFBNkIsSUFBN0I7RUFBSDs7Z0NBRWYsR0FBQSxHQUFLLFNBQUE7V0FDSCxhQUFhLENBQUMsSUFBZCxDQUNFO01BQUEsT0FBQSxFQUFTLFNBQUMsSUFBRDtBQUNQLFlBQUE7UUFBQSxDQUFBLEdBQUksUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBdkI7UUFDSixDQUFDLENBQUMsSUFBRixHQUFTLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQTFCLENBQThCLE1BQTlCO2VBQ1QsS0FBSyxDQUFDLE1BQU4sQ0FBYSxzQkFBQSxHQUF1QixDQUFDLENBQUMsSUFBekIsR0FBOEIsT0FBOUIsR0FBcUMsSUFBSSxDQUFDLEtBQTFDLEdBQWdELE1BQTdEO01BSE8sQ0FBVDtNQUlBLEtBQUEsRUFBTyxTQUFDLEdBQUQsRUFBTSxRQUFOO2VBQ0wsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFRLENBQUMsS0FBdEI7TUFESyxDQUpQO0tBREY7RUFERzs7Z0NBU0wsVUFBQSxHQUFZLFNBQUE7V0FDVixLQUFLLENBQUMsaUJBQU4sQ0FBQTtFQURVOztnQ0FHWixVQUFBLEdBQVksU0FBQTtXQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBMEIsUUFBMUIsRUFBb0MsSUFBcEM7RUFBSDs7Z0NBRVosU0FBQSxHQUFZLFNBQUE7V0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFFBQTFCLEVBQW9DLElBQXBDO0VBQUg7O2dDQUVaLElBQUEsR0FBTSxTQUFBO1dBQ0osSUFBQyxDQUFBLElBQUQsR0FDRTtNQUFBLEtBQUEsRUFBbUIsQ0FBQSxDQUFFLCtCQUFGLENBQW5CO01BQ0EsR0FBQSxFQUFtQixDQUFBLENBQUUsK0JBQUYsQ0FEbkI7TUFFQSxNQUFBLEVBQW1CLENBQUEsQ0FBRSxrQ0FBRixDQUZuQjtNQUdBLGdCQUFBLEVBQW1CLENBQUEsQ0FBRSw0Q0FBRixDQUhuQjtNQUlBLGNBQUEsRUFBaUIsQ0FBQSxDQUFFLDBDQUFGLENBSmpCO01BS0EsWUFBQSxFQUFtQixDQUFBLENBQUUsd0NBQUYsQ0FMbkI7TUFNQSxPQUFBLEVBQW1CLENBQUEsQ0FBRSxtQ0FBRixDQU5uQjtNQU9BLElBQUEsRUFBbUIsQ0FBQSxDQUFFLGdDQUFGLENBUG5CO01BUUEsTUFBQSxFQUFtQixDQUFBLENBQUUsa0NBQUYsQ0FSbkI7TUFTQSxZQUFBLEVBQWdCLENBQUEsQ0FBRSx3Q0FBRixDQVRoQjtNQVVBLFVBQUEsRUFBYyxDQUFBLENBQUUscUNBQUYsQ0FWZDtNQVdBLFdBQUEsRUFBYyxDQUFBLENBQUUsc0NBQUYsQ0FYZDtNQVlBLFVBQUEsRUFBYyxDQUFBLENBQUUscUNBQUYsQ0FaZDs7RUFGRTs7Z0NBZ0JOLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFFVixRQUFBO0lBQUEsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUVBLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsaUJBQUEsQ0FDbkI7TUFBQSxRQUFBLEVBQVcsQ0FBQyxRQUFELENBQVg7TUFDQSxTQUFBLEVBQ0U7UUFBQSxZQUFBLEVBQWMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsYUFBYSxDQUFDLFFBQWYsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkO09BRkY7S0FEbUI7QUFLckIsU0FBQSxjQUFBOztNQUFBLElBQUUsQ0FBQSxHQUFBLENBQUYsR0FBUztBQUFUO0lBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxVQUFEO2VBQWdCLFVBQVUsQ0FBQyxFQUFYLENBQWMsS0FBZCxFQUFxQixLQUFDLENBQUEsYUFBdEI7TUFBaEI7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCO1dBRUEsSUFBQyxDQUFBLGVBQUQsR0FBdUIsSUFBQSxlQUFBLENBQ3JCO01BQUEsYUFBQSxFQUFnQixJQUFDLENBQUEsV0FBakI7TUFDQSxRQUFBLEVBQWdCLElBRGhCO0tBRHFCO0VBYmI7O2dDQWtCWixNQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7SUFBQSxPQUFBLEdBQVUsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFmLENBQUE7SUFFVixTQUFBLEdBQWdCLDhCQUFBLEdBQStCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBRCxDQUFwQyxHQUF5QztJQUN6RCxTQUFBLEdBQWdCLGlDQUFBLEdBQWtDLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBeEMsR0FBNEM7SUFDNUQsWUFBQSxHQUFnQixvQ0FBQSxHQUFxQyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQTNDLEdBQWtEO0lBQ2xFLFlBQUEsR0FBZ0IsMkNBQUEsR0FBNEMsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBbEQsR0FBbUU7SUFDbkYsbUJBQUEsR0FBdUIseUNBQUEsR0FBMEMsSUFBQyxDQUFBLElBQUksQ0FBQyxjQUFoRCxHQUErRDtJQUN0RixpQkFBQSxHQUFvQix1Q0FBQSxHQUF3QyxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQTlDLEdBQTJEO0lBQy9FLGFBQUEsR0FBZ0IscUNBQUEsR0FBc0MsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUE1QyxHQUFvRDtJQUNwRSxnQkFBQSxHQUFtQix1Q0FBQSxHQUF3QyxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQTlDLEdBQTJEO0lBQzlFLFdBQUEsR0FBZ0IseURBQUEsR0FBeUQsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGdCQUFuQixDQUFvQyxhQUFwQyxDQUFBLElBQXNELFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBbkIsQ0FBdUIsV0FBdkIsQ0FBdkQsQ0FBekQsR0FBb0o7SUFFcEssSUFBQSxHQUFPLGdCQUFBLEdBRUcsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUZULEdBRXFCO0lBRzVCLElBQUEsSUFBUSx5REFBQSxHQUlKLGlCQUpJLEdBSWMsR0FKZCxHQUtKLFlBTEksR0FLUyxHQUxULEdBTUo7SUFHSixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxJQUFWO0lBRUEsSUFBQyxDQUFBLGVBQWUsQ0FBQyxVQUFqQixDQUE2QixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSx3QkFBVixDQUE3QjtXQUNBLElBQUMsQ0FBQSxlQUFlLENBQUMsTUFBakIsQ0FBQTtFQTlCTTs7Z0NBa0NSLFVBQUEsR0FBWSxTQUFBO1dBQ1YsSUFBQyxDQUFBLGVBQWUsQ0FBQyxLQUFqQixDQUFBO0VBRFU7O2dDQUdaLE9BQUEsR0FBUyxTQUFBO1dBQ1AsSUFBQyxDQUFBLFVBQUQsQ0FBQTtFQURPOzs7O0dBNUd1QixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9hc3Nlc3NtZW50L0Fzc2Vzc21lbnRzTWVudVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBc3Nlc3NtZW50c01lbnVWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJBc3Nlc3NtZW50c01lbnVWaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5pbXBvcnQnICAgICAgOiAnaW1wb3J0J1xuICAgICdjbGljayAudW5pdmVyc2FsX3VwbG9hZCcgOiAndW5pdmVyc2FsVXBsb2FkJ1xuICAgICdjbGljayAuc3luY190YWJsZXRzJyA6ICdzeW5jVGFibGV0cydcbiAgICAnY2xpY2sgLnJlc3VsdHMnICAgICAgICA6ICdyZXN1bHRzJ1xuICAgICdjbGljayAuZW1lcmdlbmN5X3N5bmMnICAgICAgICA6ICdlbWVyZ2VuY3lTeW5jJ1xuICAgICdjbGljayAuc2F2ZV90b19kaXNrJyAgICAgICAgOiAnc2F2ZVRvRGlzaydcblxuICBzeW5jVGFibGV0czogPT5cbiAgICBAdGFibGV0TWFuYWdlci5zeW5jKClcblxuICByZXN1bHRzOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiZGFzaGJvYXJkXCIsIHRydWVcblxuICB1bml2ZXJzYWxVcGxvYWQ6IC0+IFV0aWxzLnVuaXZlcnNhbFVwbG9hZCgpXG5cbiAgZW1lcmdlbmN5U3luYzogLT4gVXRpbHMucmVwbGljYXRlVG9TZXJ2ZXIobnVsbCxudWxsKVxuXG4gIGFwazogLT5cbiAgICBUYW5nZXJpbmVUcmVlLm1ha2VcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIilcbiAgICAgICAgYS5ocmVmID0gVGFuZ2VyaW5lLnNldHRpbmdzLmNvbmZpZy5nZXQoXCJ0cmVlXCIpXG4gICAgICAgIFV0aWxzLnN0aWNreShcIjxoMT5BUEsgbGluazwvaDE+PHA+I3thLmhvc3R9L2Fway8je2RhdGEudG9rZW59PC9wPlwiKVxuICAgICAgZXJyb3I6ICh4aHIsIHJlc3BvbnNlKSAtPlxuICAgICAgICBVdGlscy5zdGlja3kgcmVzcG9uc2UuZXJyb3JcblxuICBzYXZlVG9EaXNrOiAtPlxuICAgIFV0aWxzLnNhdmVEb2NMaXN0VG9GaWxlKClcblxuICBnb3RvR3JvdXBzOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiZ3JvdXBzXCIsIHRydWVcblxuICBpbXBvcnQ6ICAgICAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiaW1wb3J0XCIsIHRydWVcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIFwibmV3XCIgICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLm5ld1wiKVxuICAgICAgYXBrICAgICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLmFwa1wiKVxuICAgICAgZ3JvdXBzICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLmdyb3Vwc1wiKVxuICAgICAgdW5pdmVyc2FsX3VwbG9hZCA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnVuaXZlcnNhbF91cGxvYWRcIilcbiAgICAgIGVtZXJnZW5jeV9zeW5jIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uZW1lcmdlbmN5X3N5bmNcIilcbiAgICAgIHN5bmNfdGFibGV0cyAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5zeW5jX3RhYmxldHNcIilcbiAgICAgIHJlc3VsdHMgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5yZXN1bHRzXCIpXG4gICAgICBzYXZlICAgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uc2F2ZVwiKVxuICAgICAgY2FuY2VsICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLmNhbmNlbFwiKVxuICAgICAgc2F2ZV90b19kaXNrICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnNhdmVfdG9fZGlza1wiKVxuICAgICAgYXNzZXNzbWVudCAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmxhYmVsLmFzc2Vzc21lbnRcIilcbiAgICAgIGFzc2Vzc21lbnRzIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5hc3Nlc3NtZW50c1wiKVxuICAgICAgY3VycmljdWx1bSAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmxhYmVsLmN1cnJpY3VsdW1cIilcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBpMThuKClcblxuICAgIEB0YWJsZXRNYW5hZ2VyID0gbmV3IFRhYmxldE1hbmFnZXJWaWV3XG4gICAgICBkb2NUeXBlcyA6IFtcInJlc3VsdFwiXVxuICAgICAgY2FsbGJhY2tzOlxuICAgICAgICBjb21wbGV0ZVB1bGw6ID0+IEB0YWJsZXRNYW5hZ2VyLnB1c2hEb2NzKClcblxuICAgIEBba2V5XSA9IHZhbHVlIGZvciBrZXksIHZhbHVlIG9mIG9wdGlvbnNcbiAgICAgIFxuICAgIEBhc3Nlc3NtZW50cy5lYWNoIChhc3Nlc3NtZW50KSA9PiBhc3Nlc3NtZW50Lm9uIFwibmV3XCIsIEBhZGRBc3Nlc3NtZW50XG5cbiAgICBAYXNzZXNzbWVudHNWaWV3ID0gbmV3IEFzc2Vzc21lbnRzVmlld1xuICAgICAgXCJhc3Nlc3NtZW50c1wiIDogQGFzc2Vzc21lbnRzXG4gICAgICBcInBhcmVudFwiICAgICAgOiBAXG5cblxuICByZW5kZXI6ID0+XG4gICAgaXNBZG1pbiA9IFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuICAgIFxuICAgIG5ld0J1dHRvbiAgICAgPSBcIjxidXR0b24gY2xhc3M9J25ldyBjb21tYW5kJz4je0B0ZXh0Lm5ld308L2J1dHRvbj5cIlxuICAgIGFwa0J1dHRvbiAgICAgPSBcIjxidXR0b24gY2xhc3M9J2FwayBuYXZpZ2F0aW9uJz4je0B0ZXh0LmFwa308L2J1dHRvbj5cIlxuICAgIGdyb3Vwc0J1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gZ3JvdXBzJz4je0B0ZXh0Lmdyb3Vwc308L2J1dHRvbj5cIlxuICAgIHVwbG9hZEJ1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgdW5pdmVyc2FsX3VwbG9hZCc+I3tAdGV4dC51bml2ZXJzYWxfdXBsb2FkfTwvYnV0dG9uPlwiXG4gICAgZW1lcmdlbmN5U3luY0J1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgZW1lcmdlbmN5X3N5bmMnPiN7QHRleHQuZW1lcmdlbmN5X3N5bmN9PC9idXR0b24+XCJcbiAgICBzeW5jVGFibGV0c0J1dHRvbiA9IFwiPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBzeW5jX3RhYmxldHMnPiN7QHRleHQuc3luY190YWJsZXRzfTwvYnV0dG9uPlwiXG4gICAgcmVzdWx0c0J1dHRvbiA9IFwiPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiByZXN1bHRzJz4je0B0ZXh0LnJlc3VsdHN9PC9idXR0b24+XCJcbiAgICBzYXZlVG9EaXNrQnV0dG9uID0gXCI8YnV0dG9uIGNsYXNzPSdjb21tYW5kIHNhdmVfdG9fZGlzayc+I3tAdGV4dC5zYXZlX3RvX2Rpc2t9PC9idXR0b24+XCJcbiAgICBncm91cEhhbmRsZSAgID0gXCI8aDIgY2xhc3M9J3NldHRpbmdzIGdyZXknIGRhdGEtYXR0cmlidHVlPSdncm91cEhhbmRsZSc+I3tUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0RXNjYXBlZFN0cmluZygnZ3JvdXBIYW5kbGUnKSB8fCBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KCdncm91cE5hbWUnKX08L2gyPlwiXG5cbiAgICBodG1sID0gXCJcbiAgICAgIDxzZWN0aW9uPlxuICAgICAgICA8aDE+I3tAdGV4dC5hc3Nlc3NtZW50c308L2gxPlxuICAgIFwiXG5cbiAgICBodG1sICs9IFwiXG4gICAgICAgIDxkaXYgaWQ9J2Fzc2Vzc21lbnRzX2NvbnRhaW5lcic+PC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgICA8YnI+XG4gICAgICAje3N5bmNUYWJsZXRzQnV0dG9ufVxuICAgICAgI3t1cGxvYWRCdXR0b259XG4gICAgICAje3NhdmVUb0Rpc2tCdXR0b259XG4gICAgXCJcblxuICAgIEAkZWwuaHRtbCBodG1sXG5cbiAgICBAYXNzZXNzbWVudHNWaWV3LnNldEVsZW1lbnQoIEAkZWwuZmluZChcIiNhc3Nlc3NtZW50c19jb250YWluZXJcIikgKVxuICAgIEBhc3Nlc3NtZW50c1ZpZXcucmVuZGVyKClcblxuXG4gICMgVmlld01hbmFnZXJcbiAgY2xvc2VWaWV3czogLT5cbiAgICBAYXNzZXNzbWVudHNWaWV3LmNsb3NlKClcblxuICBvbkNsb3NlOiAtPlxuICAgIEBjbG9zZVZpZXdzKClcbiJdfQ==

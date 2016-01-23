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
    return Utils.saveRecordsToFile();
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
      sync_tablets: t("AssessmentMenuView.button.sync_tablets"),
      results: t("AssessmentMenuView.button.results"),
      save: t("AssessmentMenuView.button.save"),
      cancel: t("AssessmentMenuView.button.cancel"),
      assessment: t("AssessmentMenuView.label.assessment"),
      assessments: t("AssessmentMenuView.label.assessments"),
      curriculum: t("AssessmentMenuView.label.curriculum"),
      save_to_disk: t("AssessmentMenuView.label.save_to_disk")
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
    var apkButton, groupHandle, groupsButton, html, isAdmin, newButton, resultsButton, saveToDiskButton, syncTabletsButton, uploadButton;
    isAdmin = Tangerine.user.isAdmin();
    newButton = "<button class='new command'>" + this.text["new"] + "</button>";
    apkButton = "<button class='apk navigation'>" + this.text.apk + "</button>";
    groupsButton = "<button class='navigation groups'>" + this.text.groups + "</button>";
    uploadButton = "<button class='command universal_upload'>" + this.text.universal_upload + "</button>";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYXNzZXNzbWVudC9Bc3Nlc3NtZW50c01lbnVWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLG1CQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7O2dDQUVKLFNBQUEsR0FBVzs7Z0NBRVgsTUFBQSxHQUNFO0lBQUEsZUFBQSxFQUF1QixRQUF2QjtJQUNBLHlCQUFBLEVBQTRCLGlCQUQ1QjtJQUVBLHFCQUFBLEVBQXdCLGFBRnhCO0lBR0EsZ0JBQUEsRUFBMEIsU0FIMUI7SUFJQSxxQkFBQSxFQUErQixZQUovQjs7O2dDQU1GLFdBQUEsR0FBYSxTQUFBO1dBQ1gsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQUE7RUFEVzs7Z0NBR2IsT0FBQSxHQUFTLFNBQUE7V0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFdBQTFCLEVBQXVDLElBQXZDO0VBQUg7O2dDQUVULGVBQUEsR0FBaUIsU0FBQTtXQUFHLEtBQUssQ0FBQyxlQUFOLENBQUE7RUFBSDs7Z0NBRWpCLEdBQUEsR0FBSyxTQUFBO1dBQ0gsYUFBYSxDQUFDLElBQWQsQ0FDRTtNQUFBLE9BQUEsRUFBUyxTQUFDLElBQUQ7QUFDUCxZQUFBO1FBQUEsQ0FBQSxHQUFJLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCO1FBQ0osQ0FBQyxDQUFDLElBQUYsR0FBUyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUExQixDQUE4QixNQUE5QjtlQUNULEtBQUssQ0FBQyxNQUFOLENBQWEsc0JBQUEsR0FBdUIsQ0FBQyxDQUFDLElBQXpCLEdBQThCLE9BQTlCLEdBQXFDLElBQUksQ0FBQyxLQUExQyxHQUFnRCxNQUE3RDtNQUhPLENBQVQ7TUFJQSxLQUFBLEVBQU8sU0FBQyxHQUFELEVBQU0sUUFBTjtlQUNMLEtBQUssQ0FBQyxNQUFOLENBQWEsUUFBUSxDQUFDLEtBQXRCO01BREssQ0FKUDtLQURGO0VBREc7O2dDQVNMLFVBQUEsR0FBWSxT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MkQ7SUFDOUUsV0FBQSxHQUFnQix5REFBQSxHQUF5RCxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsZ0JBQW5CLENBQW9DLGFBQXBDLENBQUEsSUFBc0QsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFuQixDQUF1QixXQUF2QixDQUF2RCxDQUF6RCxHQUFvSjtJQUVwSyxJQUFBLEdBQU8sZ0JBQUEsR0FFRyxJQUFDLENBQUEsSUFBSSxDQUFDLFdBRlQsR0FFcUI7SUFHNUIsSUFBQSxJQUFRLHlEQUFBLEdBSUosaUJBSkksR0FJYyxHQUpkLEdBS0osWUFMSSxHQUtTLEdBTFQsR0FNSjtJQUdKLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQVY7SUFFQSxJQUFDLENBQUEsZUFBZSxDQUFDLFVBQWpCLENBQTZCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHdCQUFWLENBQTdCO1dBQ0EsSUFBQyxDQUFBLGVBQWUsQ0FBQyxNQUFqQixDQUFBO0VBN0JNOztnQ0FpQ1IsVUFBQSxHQUFZLFNBQUE7V0FDVixJQUFDLENBQUEsZUFBZSxDQUFDLEtBQWpCLENBQUE7RUFEVTs7Z0NBR1osT0FBQSxHQUFTLFNBQUE7V0FDUCxJQUFDLENBQUEsVUFBRCxDQUFBO0VBRE87Ozs7R0F2R3VCLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL2Fzc2Vzc21lbnQvQXNzZXNzbWVudHNNZW51Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFzc2Vzc21lbnRzTWVudVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIkFzc2Vzc21lbnRzTWVudVZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmltcG9ydCcgICAgICA6ICdpbXBvcnQnXG4gICAgJ2NsaWNrIC51bml2ZXJzYWxfdXBsb2FkJyA6ICd1bml2ZXJzYWxVcGxvYWQnXG4gICAgJ2NsaWNrIC5zeW5jX3RhYmxldHMnIDogJ3N5bmNUYWJsZXRzJ1xuICAgICdjbGljayAucmVzdWx0cycgICAgICAgIDogJ3Jlc3VsdHMnXG4gICAgJ2NsaWNrIC5zYXZlX3RvX2Rpc2snICAgICAgICA6ICdzYXZlVG9EaXNrJ1xuXG4gIHN5bmNUYWJsZXRzOiA9PlxuICAgIEB0YWJsZXRNYW5hZ2VyLnN5bmMoKVxuXG4gIHJlc3VsdHM6IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJkYXNoYm9hcmRcIiwgdHJ1ZVxuXG4gIHVuaXZlcnNhbFVwbG9hZDogLT4gVXRpbHMudW5pdmVyc2FsVXBsb2FkKClcblxuICBhcGs6IC0+XG4gICAgVGFuZ2VyaW5lVHJlZS5tYWtlXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpXG4gICAgICAgIGEuaHJlZiA9IFRhbmdlcmluZS5zZXR0aW5ncy5jb25maWcuZ2V0KFwidHJlZVwiKVxuICAgICAgICBVdGlscy5zdGlja3koXCI8aDE+QVBLIGxpbms8L2gxPjxwPiN7YS5ob3N0fS9hcGsvI3tkYXRhLnRva2VufTwvcD5cIilcbiAgICAgIGVycm9yOiAoeGhyLCByZXNwb25zZSkgLT5cbiAgICAgICAgVXRpbHMuc3RpY2t5IHJlc3BvbnNlLmVycm9yXG5cbiAgc2F2ZVRvRGlzazogLT5cbiAgICBVdGlscy5zYXZlUmVjb3Jkc1RvRmlsZSgpXG5cbiAgZ290b0dyb3VwczogLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImdyb3Vwc1wiLCB0cnVlXG5cbiAgaW1wb3J0OiAgICAgLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImltcG9ydFwiLCB0cnVlXG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICBcIm5ld1wiICAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5uZXdcIilcbiAgICAgIGFwayAgICAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5hcGtcIilcbiAgICAgIGdyb3VwcyAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5ncm91cHNcIilcbiAgICAgIHVuaXZlcnNhbF91cGxvYWQgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi51bml2ZXJzYWxfdXBsb2FkXCIpXG4gICAgICBzeW5jX3RhYmxldHMgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uc3luY190YWJsZXRzXCIpXG4gICAgICByZXN1bHRzICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24ucmVzdWx0c1wiKVxuICAgICAgc2F2ZSAgICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnNhdmVcIilcbiAgICAgIGNhbmNlbCAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5jYW5jZWxcIilcbiAgICAgIGFzc2Vzc21lbnQgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5hc3Nlc3NtZW50XCIpXG4gICAgICBhc3Nlc3NtZW50cyA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcubGFiZWwuYXNzZXNzbWVudHNcIilcbiAgICAgIGN1cnJpY3VsdW0gIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5jdXJyaWN1bHVtXCIpXG4gICAgICBzYXZlX3RvX2Rpc2sgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5zYXZlX3RvX2Rpc2tcIilcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBpMThuKClcblxuICAgIEB0YWJsZXRNYW5hZ2VyID0gbmV3IFRhYmxldE1hbmFnZXJWaWV3XG4gICAgICBkb2NUeXBlcyA6IFtcInJlc3VsdFwiXVxuICAgICAgY2FsbGJhY2tzOlxuICAgICAgICBjb21wbGV0ZVB1bGw6ID0+IEB0YWJsZXRNYW5hZ2VyLnB1c2hEb2NzKClcblxuICAgIEBba2V5XSA9IHZhbHVlIGZvciBrZXksIHZhbHVlIG9mIG9wdGlvbnNcbiAgICAgIFxuICAgIEBhc3Nlc3NtZW50cy5lYWNoIChhc3Nlc3NtZW50KSA9PiBhc3Nlc3NtZW50Lm9uIFwibmV3XCIsIEBhZGRBc3Nlc3NtZW50XG5cbiAgICBAYXNzZXNzbWVudHNWaWV3ID0gbmV3IEFzc2Vzc21lbnRzVmlld1xuICAgICAgXCJhc3Nlc3NtZW50c1wiIDogQGFzc2Vzc21lbnRzXG4gICAgICBcInBhcmVudFwiICAgICAgOiBAXG5cblxuICByZW5kZXI6ID0+XG4gICAgaXNBZG1pbiA9IFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuICAgIFxuICAgIG5ld0J1dHRvbiAgICAgPSBcIjxidXR0b24gY2xhc3M9J25ldyBjb21tYW5kJz4je0B0ZXh0Lm5ld308L2J1dHRvbj5cIlxuICAgIGFwa0J1dHRvbiAgICAgPSBcIjxidXR0b24gY2xhc3M9J2FwayBuYXZpZ2F0aW9uJz4je0B0ZXh0LmFwa308L2J1dHRvbj5cIlxuICAgIGdyb3Vwc0J1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gZ3JvdXBzJz4je0B0ZXh0Lmdyb3Vwc308L2J1dHRvbj5cIlxuICAgIHVwbG9hZEJ1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgdW5pdmVyc2FsX3VwbG9hZCc+I3tAdGV4dC51bml2ZXJzYWxfdXBsb2FkfTwvYnV0dG9uPlwiXG4gICAgc3luY1RhYmxldHNCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgc3luY190YWJsZXRzJz4je0B0ZXh0LnN5bmNfdGFibGV0c308L2J1dHRvbj5cIlxuICAgIHJlc3VsdHNCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gcmVzdWx0cyc+I3tAdGV4dC5yZXN1bHRzfTwvYnV0dG9uPlwiXG4gICAgc2F2ZVRvRGlza0J1dHRvbiA9IFwiPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBzYXZlX3RvX2Rpc2snPiN7QHRleHQuc2F2ZV90b19kaXNrfTwvYnV0dG9uPlwiXG4gICAgZ3JvdXBIYW5kbGUgICA9IFwiPGgyIGNsYXNzPSdzZXR0aW5ncyBncmV5JyBkYXRhLWF0dHJpYnR1ZT0nZ3JvdXBIYW5kbGUnPiN7VGFuZ2VyaW5lLnNldHRpbmdzLmdldEVzY2FwZWRTdHJpbmcoJ2dyb3VwSGFuZGxlJykgfHwgVGFuZ2VyaW5lLnNldHRpbmdzLmdldCgnZ3JvdXBOYW1lJyl9PC9oMj5cIlxuXG4gICAgaHRtbCA9IFwiXG4gICAgICA8c2VjdGlvbj5cbiAgICAgICAgPGgxPiN7QHRleHQuYXNzZXNzbWVudHN9PC9oMT5cbiAgICBcIlxuXG4gICAgaHRtbCArPSBcIlxuICAgICAgICA8ZGl2IGlkPSdhc3Nlc3NtZW50c19jb250YWluZXInPjwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuICAgICAgPGJyPlxuICAgICAgI3tzeW5jVGFibGV0c0J1dHRvbn1cbiAgICAgICN7dXBsb2FkQnV0dG9ufVxuICAgICAgI3tzYXZlVG9EaXNrQnV0dG9ufVxuICAgIFwiXG5cbiAgICBAJGVsLmh0bWwgaHRtbFxuXG4gICAgQGFzc2Vzc21lbnRzVmlldy5zZXRFbGVtZW50KCBAJGVsLmZpbmQoXCIjYXNzZXNzbWVudHNfY29udGFpbmVyXCIpIClcbiAgICBAYXNzZXNzbWVudHNWaWV3LnJlbmRlcigpXG5cblxuICAjIFZpZXdNYW5hZ2VyXG4gIGNsb3NlVmlld3M6IC0+XG4gICAgQGFzc2Vzc21lbnRzVmlldy5jbG9zZSgpXG5cbiAgb25DbG9zZTogLT5cbiAgICBAY2xvc2VWaWV3cygpXG4iXX0=

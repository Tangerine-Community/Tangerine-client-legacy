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
    'click .results': 'results'
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
    var apkButton, groupHandle, groupsButton, html, isAdmin, newButton, resultsButton, syncTabletsButton, uploadButton;
    isAdmin = Tangerine.user.isAdmin();
    newButton = "<button class='new command'>" + this.text["new"] + "</button>";
    apkButton = "<button class='apk navigation'>" + this.text.apk + "</button>";
    groupsButton = "<button class='navigation groups'>" + this.text.groups + "</button>";
    uploadButton = "<button class='command universal_upload'>" + this.text.universal_upload + "</button>";
    syncTabletsButton = "<button class='command sync_tablets'>" + this.text.sync_tablets + "</button>";
    resultsButton = "<button class='navigation results'>" + this.text.results + "</button>";
    groupHandle = "<h2 class='settings grey' data-attribtue='groupHandle'>" + (Tangerine.settings.getEscapedString('groupHandle') || Tangerine.settings.get('groupName')) + "</h2>";
    html = "<section> <h1>" + this.text.assessments + "</h1>";
    html += "<div id='assessments_container'></div> </section> <br> " + syncTabletsButton + " " + uploadButton;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYXNzZXNzbWVudC9Bc3Nlc3NtZW50c01lbnVWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLG1CQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7O2dDQUVKLFNBQUEsR0FBVzs7Z0NBRVgsTUFBQSxHQUNFO0lBQUEsZUFBQSxFQUF1QixRQUF2QjtJQUNBLHlCQUFBLEVBQTRCLGlCQUQ1QjtJQUVBLHFCQUFBLEVBQXdCLGFBRnhCO0lBR0EsZ0JBQUEsRUFBMEIsU0FIMUI7OztnQ0FLRixXQUFBLEdBQWEsU0FBQTtXQUNYLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFBO0VBRFc7O2dDQUdiLE9BQUEsR0FBUyxTQUFBO1dBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFqQixDQUEwQixXQUExQixFQUF1QyxJQUF2QztFQUFIOztnQ0FFVCxlQUFBLEdBQWlCLFNBQUE7V0FBRyxLQUFLLENBQUMsZUFBTixDQUFBO0VBQUg7O2dDQUVqQixHQUFBLEdBQUssU0FBQTtXQUNILGFBQWEsQ0FBQyxJQUFkLENBQ0U7TUFBQSxPQUFBLEVBQVMsU0FBQyxJQUFEO0FBQ1AsWUFBQTtRQUFBLENBQUEsR0FBSSxRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QjtRQUNKLENBQUMsQ0FBQyxJQUFGLEdBQVMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBMUIsQ0FBOEIsTUFBOUI7ZUFDVCxLQUFLLENBQUMsTUFBTixDQUFhLHNCQUFBLEdBQXVCLENBQUMsQ0FBQyxJQUF6QixHQUE4QixPQUE5QixHQUFxQyxJQUFJLENBQUMsS0FBMUMsR0FBZ0QsTUFBN0Q7TUFITyxDQUFUO01BSUEsS0FBQSxFQUFPLFNBQUMsR0FBRCxFQUFNLFFBQU47ZUFDTCxLQUFLLENBQUMsTUFBTixDQUFhLFFBQVEsQ0FBQyxLQUF0QjtNQURLLENBSlA7S0FERjtFQURHOztnQ0FTTCxVQUFBLEdBQVksU0FBQTtXQUFHLFNBQVMsQ0FBQyxNQUFN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QUFBLElBQUksQ0FBQyxXQUZULEdBRXFCO0lBRzVCLElBQUEsSUFBUSx5REFBQSxHQUlKLGlCQUpJLEdBSWMsR0FKZCxHQUtKO0lBR0osSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsSUFBVjtJQUVBLElBQUMsQ0FBQSxlQUFlLENBQUMsVUFBakIsQ0FBNkIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsd0JBQVYsQ0FBN0I7V0FDQSxJQUFDLENBQUEsZUFBZSxDQUFDLE1BQWpCLENBQUE7RUEzQk07O2dDQStCUixVQUFBLEdBQVksU0FBQTtXQUNWLElBQUMsQ0FBQSxlQUFlLENBQUMsS0FBakIsQ0FBQTtFQURVOztnQ0FHWixPQUFBLEdBQVMsU0FBQTtXQUNQLElBQUMsQ0FBQSxVQUFELENBQUE7RUFETzs7OztHQWpHdUIsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvYXNzZXNzbWVudC9Bc3Nlc3NtZW50c01lbnVWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXNzZXNzbWVudHNNZW51VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiQXNzZXNzbWVudHNNZW51Vmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAuaW1wb3J0JyAgICAgIDogJ2ltcG9ydCdcbiAgICAnY2xpY2sgLnVuaXZlcnNhbF91cGxvYWQnIDogJ3VuaXZlcnNhbFVwbG9hZCdcbiAgICAnY2xpY2sgLnN5bmNfdGFibGV0cycgOiAnc3luY1RhYmxldHMnXG4gICAgJ2NsaWNrIC5yZXN1bHRzJyAgICAgICAgOiAncmVzdWx0cydcblxuICBzeW5jVGFibGV0czogPT5cbiAgICBAdGFibGV0TWFuYWdlci5zeW5jKClcblxuICByZXN1bHRzOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiZGFzaGJvYXJkXCIsIHRydWVcblxuICB1bml2ZXJzYWxVcGxvYWQ6IC0+IFV0aWxzLnVuaXZlcnNhbFVwbG9hZCgpXG5cbiAgYXBrOiAtPlxuICAgIFRhbmdlcmluZVRyZWUubWFrZVxuICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKVxuICAgICAgICBhLmhyZWYgPSBUYW5nZXJpbmUuc2V0dGluZ3MuY29uZmlnLmdldChcInRyZWVcIilcbiAgICAgICAgVXRpbHMuc3RpY2t5KFwiPGgxPkFQSyBsaW5rPC9oMT48cD4je2EuaG9zdH0vYXBrLyN7ZGF0YS50b2tlbn08L3A+XCIpXG4gICAgICBlcnJvcjogKHhociwgcmVzcG9uc2UpIC0+XG4gICAgICAgIFV0aWxzLnN0aWNreSByZXNwb25zZS5lcnJvclxuXG4gIGdvdG9Hcm91cHM6IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJncm91cHNcIiwgdHJ1ZVxuXG4gIGltcG9ydDogICAgIC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJpbXBvcnRcIiwgdHJ1ZVxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgXCJuZXdcIiAgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24ubmV3XCIpXG4gICAgICBhcGsgICAgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uYXBrXCIpXG4gICAgICBncm91cHMgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uZ3JvdXBzXCIpXG4gICAgICB1bml2ZXJzYWxfdXBsb2FkIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24udW5pdmVyc2FsX3VwbG9hZFwiKVxuICAgICAgc3luY190YWJsZXRzICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnN5bmNfdGFibGV0c1wiKVxuICAgICAgcmVzdWx0cyAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnJlc3VsdHNcIilcbiAgICAgIHNhdmUgICAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5zYXZlXCIpXG4gICAgICBjYW5jZWwgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uY2FuY2VsXCIpXG4gICAgICBhc3Nlc3NtZW50ICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcubGFiZWwuYXNzZXNzbWVudFwiKVxuICAgICAgYXNzZXNzbWVudHMgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmxhYmVsLmFzc2Vzc21lbnRzXCIpXG4gICAgICBjdXJyaWN1bHVtICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcubGFiZWwuY3VycmljdWx1bVwiKVxuXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAaTE4bigpXG5cbiAgICBAdGFibGV0TWFuYWdlciA9IG5ldyBUYWJsZXRNYW5hZ2VyVmlld1xuICAgICAgZG9jVHlwZXMgOiBbXCJyZXN1bHRcIl1cbiAgICAgIGNhbGxiYWNrczpcbiAgICAgICAgY29tcGxldGVQdWxsOiA9PiBAdGFibGV0TWFuYWdlci5wdXNoRG9jcygpXG5cbiAgICBAW2tleV0gPSB2YWx1ZSBmb3Iga2V5LCB2YWx1ZSBvZiBvcHRpb25zXG4gICAgICBcbiAgICBAYXNzZXNzbWVudHMuZWFjaCAoYXNzZXNzbWVudCkgPT4gYXNzZXNzbWVudC5vbiBcIm5ld1wiLCBAYWRkQXNzZXNzbWVudFxuXG4gICAgQGFzc2Vzc21lbnRzVmlldyA9IG5ldyBBc3Nlc3NtZW50c1ZpZXdcbiAgICAgIFwiYXNzZXNzbWVudHNcIiA6IEBhc3Nlc3NtZW50c1xuICAgICAgXCJwYXJlbnRcIiAgICAgIDogQFxuXG5cbiAgcmVuZGVyOiA9PlxuICAgIGlzQWRtaW4gPSBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcbiAgICBcbiAgICBuZXdCdXR0b24gICAgID0gXCI8YnV0dG9uIGNsYXNzPSduZXcgY29tbWFuZCc+I3tAdGV4dC5uZXd9PC9idXR0b24+XCJcbiAgICBhcGtCdXR0b24gICAgID0gXCI8YnV0dG9uIGNsYXNzPSdhcGsgbmF2aWdhdGlvbic+I3tAdGV4dC5hcGt9PC9idXR0b24+XCJcbiAgICBncm91cHNCdXR0b24gID0gXCI8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIGdyb3Vwcyc+I3tAdGV4dC5ncm91cHN9PC9idXR0b24+XCJcbiAgICB1cGxvYWRCdXR0b24gID0gXCI8YnV0dG9uIGNsYXNzPSdjb21tYW5kIHVuaXZlcnNhbF91cGxvYWQnPiN7QHRleHQudW5pdmVyc2FsX3VwbG9hZH08L2J1dHRvbj5cIlxuICAgIHN5bmNUYWJsZXRzQnV0dG9uID0gXCI8YnV0dG9uIGNsYXNzPSdjb21tYW5kIHN5bmNfdGFibGV0cyc+I3tAdGV4dC5zeW5jX3RhYmxldHN9PC9idXR0b24+XCJcbiAgICByZXN1bHRzQnV0dG9uID0gXCI8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIHJlc3VsdHMnPiN7QHRleHQucmVzdWx0c308L2J1dHRvbj5cIlxuICAgIGdyb3VwSGFuZGxlICAgPSBcIjxoMiBjbGFzcz0nc2V0dGluZ3MgZ3JleScgZGF0YS1hdHRyaWJ0dWU9J2dyb3VwSGFuZGxlJz4je1RhbmdlcmluZS5zZXR0aW5ncy5nZXRFc2NhcGVkU3RyaW5nKCdncm91cEhhbmRsZScpIHx8IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoJ2dyb3VwTmFtZScpfTwvaDI+XCJcblxuICAgIGh0bWwgPSBcIlxuICAgICAgPHNlY3Rpb24+XG4gICAgICAgIDxoMT4je0B0ZXh0LmFzc2Vzc21lbnRzfTwvaDE+XG4gICAgXCJcblxuICAgIGh0bWwgKz0gXCJcbiAgICAgICAgPGRpdiBpZD0nYXNzZXNzbWVudHNfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDxicj5cbiAgICAgICN7c3luY1RhYmxldHNCdXR0b259XG4gICAgICAje3VwbG9hZEJ1dHRvbn1cbiAgICBcIlxuXG4gICAgQCRlbC5odG1sIGh0bWxcblxuICAgIEBhc3Nlc3NtZW50c1ZpZXcuc2V0RWxlbWVudCggQCRlbC5maW5kKFwiI2Fzc2Vzc21lbnRzX2NvbnRhaW5lclwiKSApXG4gICAgQGFzc2Vzc21lbnRzVmlldy5yZW5kZXIoKVxuXG5cbiAgIyBWaWV3TWFuYWdlclxuICBjbG9zZVZpZXdzOiAtPlxuICAgIEBhc3Nlc3NtZW50c1ZpZXcuY2xvc2UoKVxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQGNsb3NlVmlld3MoKVxuIl19

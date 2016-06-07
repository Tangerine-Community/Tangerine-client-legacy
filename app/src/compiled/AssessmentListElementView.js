var AssessmentListElementView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

AssessmentListElementView = (function(superClass) {
  extend(AssessmentListElementView, superClass);

  function AssessmentListElementView() {
    this.assessmentDelete = bind(this.assessmentDelete, this);
    this.updateResultCount = bind(this.updateResultCount, this);
    this.update = bind(this.update, this);
    this.ghostLogin = bind(this.ghostLogin, this);
    return AssessmentListElementView.__super__.constructor.apply(this, arguments);
  }

  AssessmentListElementView.prototype.className = "AssessmentListElementView";

  AssessmentListElementView.prototype.tagName = "li";

  AssessmentListElementView.prototype.events = Modernizr.touch ? {
    'click .assessment_menu_toggle': 'assessmentMenuToggle',
    'click .admin_name': 'assessmentMenuToggle',
    'click .sp_assessment_delete': 'assessmentDeleteToggle',
    'click .sp_assessment_delete_cancel': 'assessmentDeleteToggle',
    'click .sp_assessment_delete_confirm': 'assessmentDelete',
    'click .sp_copy': 'copyTo',
    'click .sp_duplicate': 'duplicate',
    'click .sp_update': 'update',
    'click .sp_print': 'togglePrint',
    'click .archive': 'archive',
    'click a': 'respondToLink',
    'change #print_format': 'print'
  } : {
    'click .assessment_menu_toggle': 'assessmentMenuToggle',
    'click .admin_name': 'assessmentMenuToggle',
    'click .sp_assessment_delete': 'assessmentDeleteToggle',
    'click .sp_assessment_delete_cancel': 'assessmentDeleteToggle',
    'click .sp_assessment_delete_confirm': 'assessmentDelete',
    'click .sp_copy': 'copyTo',
    'click .sp_duplicate': 'duplicate',
    'click .sp_update': 'update',
    'click .sp_print': 'togglePrint',
    'click .archive': 'archive',
    'change #print_format': 'print'
  };

  AssessmentListElementView.prototype.blankResultCount = "-";

  AssessmentListElementView.prototype.initialize = function(options) {
    this.model = options.model;
    this.parent = options.parent;
    return this.isAdmin = Tangerine.user.isAdmin();
  };

  AssessmentListElementView.prototype.respondToLink = function(event) {
    var $target, route;
    $target = $(event.target);
    route = $target.attr("href");
    return Tangerine.router.navigate(route, true);
  };

  AssessmentListElementView.prototype.ghostLogin = function() {
    return Tangerine.user.ghostLogin(Tangerine.settings.upUser, Tangerine.settings.upPass);
  };

  AssessmentListElementView.prototype.update = function() {
    Utils.midAlert("Verifying connection");
    Utils.working(true);
    return this.model.verifyConnection({
      error: (function(_this) {
        return function() {
          Utils.working(false);
          Utils.midAlert("Verifying connection<br>Please retry update.");
          return _.delay(function() {
            return _this.ghostLogin();
          }, 5000);
        };
      })(this),
      success: (function(_this) {
        return function() {
          Utils.working(false);
          _this.model.on("status", function(message) {
            if (message === "import lookup") {
              return Utils.midAlert("Update starting");
            } else if (message === "import success") {
              Utils.midAlert("Updated");
              Utils.working(false);
              return _this.model.fetch({
                success: function() {
                  return _this.render();
                }
              });
            } else if (message === "import error") {
              Utils.working(false);
              return Utils.midAlert("Update failed");
            }
          });
          Utils.working(true);
          return Utils.updateFromServer(_this.model);
        };
      })(this)
    });
  };

  AssessmentListElementView.prototype.togglePrint = function() {
    return this.$el.find(".print_format_wrapper").toggle();
  };

  AssessmentListElementView.prototype.print = function() {
    var format;
    format = this.$el.find("#print_format option:selected").attr("data-format");
    if (format === "cancel") {
      this.$el.find(".print_format_wrapper").toggle();
      this.$el.find("#print_format").val("reset");
      return;
    }
    return Tangerine.router.navigate("print/" + this.model.id + "/" + format, true);
  };

  AssessmentListElementView.prototype.updateResultCount = function() {};

  AssessmentListElementView.prototype.assessmentMenuToggle = function() {
    this.$el.find('.assessment_menu_toggle').toggleClass('sp_down').toggleClass('sp_right');
    return this.$el.find('.assessment_menu').toggle();
  };

  AssessmentListElementView.prototype.assessmentDeleteToggle = function() {
    this.$el.find(".sp_assessment_delete_confirm").toggle();
    return false;
  };

  AssessmentListElementView.prototype.assessmentDelete = function() {
    return this.model.destroy();
  };

  AssessmentListElementView.prototype.spriteListLink = function() {
    var i, len, name, names, result, tagName;
    tagName = arguments[0], names = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    result = "";
    for (i = 0, len = names.length; i < len; i++) {
      name = names[i];
      result += "<" + tagName + " class='sp_" + (name.underscore()) + "'><a href='#" + name + "/" + this.model.id + "'>" + (name.underscore().titleize()) + "</a></" + tagName + ">";
    }
    return result;
  };

  AssessmentListElementView.prototype.spriteEvents = function() {
    var i, len, name, names, result, tagName;
    tagName = arguments[0], names = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    result = "";
    for (i = 0, len = names.length; i < len; i++) {
      name = names[i];
      result += "<" + tagName + "><button class='sp_" + (name.underscore()) + "' title='" + (name.underscore().titleize()) + "'>" + (name.underscore().titleize()) + "</button></" + tagName + "> ";
    }
    return result;
  };

  AssessmentListElementView.prototype.ul = function(options) {
    var html;
    html = "<ul " + (options.cssClass ? "class='" + options.cssClass + "'" : '') + ">";
    html += this.spriteListLink.apply(this, ["li"].concat(options.links));
    html += options.other || '';
    return html += "</ul>";
  };

  AssessmentListElementView.prototype.render = function() {
    var adminName, name, resultCount, selected, toggleButton;
    toggleButton = "<div class='assessment_menu_toggle sp_right'><div></div></div>";
    name = "<button class='name clickable'>" + (this.model.get('name')) + "</button>";
    adminName = "<button class='admin_name clickable'>" + (this.model.get('name')) + "</button>";
    resultCount = "<span class='result_count no_help'>Results <b>" + this.resultCount + "</b></span>";
    selected = " selected='selected'";
    if (this.isAdmin) {
      this.$el.html(("<div> " + toggleButton + " " + adminName + " </div>") + this.ul({
        cssClass: "assessment_menu",
        links: ["runMar", "results", "update", "delete"],
        other: deleteConfirm
      }));
    } else {
      this.$el.html("<div class='non_admin'> " + (this.spriteListLink("span", 'runMar')) + name + " " + (this.spriteListLink("span", 'results')) + " </div>");
    }
    return this.trigger("rendered");
  };

  return AssessmentListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYXNzZXNzbWVudC9Bc3Nlc3NtZW50TGlzdEVsZW1lbnRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLHlCQUFBO0VBQUE7Ozs7O0FBQU07Ozs7Ozs7Ozs7O3NDQUVKLFNBQUEsR0FBWTs7c0NBRVosT0FBQSxHQUFVOztzQ0FFVixNQUFBLEdBQVcsU0FBUyxDQUFDLEtBQWIsR0FBd0I7SUFDOUIsK0JBQUEsRUFBd0Msc0JBRFY7SUFFOUIsbUJBQUEsRUFBd0Msc0JBRlY7SUFHOUIsNkJBQUEsRUFBd0Msd0JBSFY7SUFJOUIsb0NBQUEsRUFBd0Msd0JBSlY7SUFLOUIscUNBQUEsRUFBd0Msa0JBTFY7SUFNOUIsZ0JBQUEsRUFBd0MsUUFOVjtJQU85QixxQkFBQSxFQUF3QyxXQVBWO0lBUTlCLGtCQUFBLEVBQXdDLFFBUlY7SUFTOUIsaUJBQUEsRUFBd0MsYUFUVjtJQVU5QixnQkFBQSxFQUF3QyxTQVZWO0lBVzlCLFNBQUEsRUFBWSxlQVhrQjtJQWE5QixzQkFBQSxFQUFxQyxPQWJQO0dBQXhCLEdBY0Q7SUFDTCwrQkFBQSxFQUF3QyxzQkFEbkM7SUFFTCxtQkFBQSxFQUF3QyxzQkFGbkM7SUFHTCw2QkFBQSxFQUF3Qyx3QkFIbkM7SUFJTCxvQ0FBQSxFQUF3Qyx3QkFKbkM7SUFLTCxxQ0FBQSxFQUF3QyxrQkFMbkM7SUFNTCxnQkFBQSxFQUF3QyxRQU5uQztJQU9MLHFCQUFBLEVBQXdDLFdBUG5DO0lBUUwsa0JBQUEsRUFBd0MsUUFSbkM7SUFTTCxpQkFBQSxFQUF3QyxhQVRuQztJQVVMLGdCQUFBLEVBQXdDLFNBVm5DO0lBWUwsc0JBQUEsRUFBcUMsT0FaaEM7OztzQ0FlUCxnQkFBQSxHQUFrQjs7c0NBRWxCLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFJVixJQUFDLENBQUEsS0FBRCxHQUFZLE9BQU8sQ0FBQztJQUNwQixJQUFDLENBQUEsTUFBRCxHQUFZLE9BQU8sQ0FBQztXQUdwQixJQUFDLENBQUEsT0FB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R0FLTixJQUFDLENBQUEsRUFBRCxDQUNGO1FBQUEsUUFBQSxFQUFVLGlCQUFWO1FBRUEsS0FBQSxFQUFRLENBQUMsUUFBRCxFQUFXLFNBQVgsRUFBcUIsUUFBckIsRUFBOEIsUUFBOUIsQ0FGUjtRQUdBLEtBQUEsRUFBUSxhQUhSO09BREUsQ0FMSixFQURGO0tBQUEsTUFBQTtNQWtCRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSwwQkFBQSxHQUVMLENBQUMsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsTUFBaEIsRUFBdUIsUUFBdkIsQ0FBRCxDQUZLLEdBRStCLElBRi9CLEdBRW9DLEdBRnBDLEdBRXNDLENBQUMsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsTUFBaEIsRUFBdUIsU0FBdkIsQ0FBRCxDQUZ0QyxHQUV5RSxTQUZuRixFQWxCRjs7V0F5QkEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBckNNOzs7O0dBckk4QixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9hc3Nlc3NtZW50L0Fzc2Vzc21lbnRMaXN0RWxlbWVudFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBc3Nlc3NtZW50TGlzdEVsZW1lbnRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiQXNzZXNzbWVudExpc3RFbGVtZW50Vmlld1wiXG5cbiAgdGFnTmFtZSA6IFwibGlcIlxuXG4gIGV2ZW50czogaWYgTW9kZXJuaXpyLnRvdWNoIHRoZW4ge1xuICAgICdjbGljayAuYXNzZXNzbWVudF9tZW51X3RvZ2dsZScgICAgICAgOiAnYXNzZXNzbWVudE1lbnVUb2dnbGUnXG4gICAgJ2NsaWNrIC5hZG1pbl9uYW1lJyAgICAgICAgICAgICAgICAgICA6ICdhc3Nlc3NtZW50TWVudVRvZ2dsZSdcbiAgICAnY2xpY2sgLnNwX2Fzc2Vzc21lbnRfZGVsZXRlJyAgICAgICAgIDogJ2Fzc2Vzc21lbnREZWxldGVUb2dnbGUnXG4gICAgJ2NsaWNrIC5zcF9hc3Nlc3NtZW50X2RlbGV0ZV9jYW5jZWwnICA6ICdhc3Nlc3NtZW50RGVsZXRlVG9nZ2xlJ1xuICAgICdjbGljayAuc3BfYXNzZXNzbWVudF9kZWxldGVfY29uZmlybScgOiAnYXNzZXNzbWVudERlbGV0ZSdcbiAgICAnY2xpY2sgLnNwX2NvcHknICAgICAgICAgICAgICAgICAgICAgIDogJ2NvcHlUbydcbiAgICAnY2xpY2sgLnNwX2R1cGxpY2F0ZScgICAgICAgICAgICAgICAgIDogJ2R1cGxpY2F0ZSdcbiAgICAnY2xpY2sgLnNwX3VwZGF0ZScgICAgICAgICAgICAgICAgICAgIDogJ3VwZGF0ZSdcbiAgICAnY2xpY2sgLnNwX3ByaW50JyAgICAgICAgICAgICAgICAgICAgIDogJ3RvZ2dsZVByaW50J1xuICAgICdjbGljayAuYXJjaGl2ZScgICAgICAgICAgICAgICAgICAgICAgOiAnYXJjaGl2ZSdcbiAgICAnY2xpY2sgYScgOiAncmVzcG9uZFRvTGluaydcblxuICAgICdjaGFuZ2UgI3ByaW50X2Zvcm1hdCcgICAgICAgICAgICAgOiAncHJpbnQnXG4gIH0gZWxzZSB7XG4gICAgJ2NsaWNrIC5hc3Nlc3NtZW50X21lbnVfdG9nZ2xlJyAgICAgICA6ICdhc3Nlc3NtZW50TWVudVRvZ2dsZSdcbiAgICAnY2xpY2sgLmFkbWluX25hbWUnICAgICAgICAgICAgICAgICAgIDogJ2Fzc2Vzc21lbnRNZW51VG9nZ2xlJ1xuICAgICdjbGljayAuc3BfYXNzZXNzbWVudF9kZWxldGUnICAgICAgICAgOiAnYXNzZXNzbWVudERlbGV0ZVRvZ2dsZSdcbiAgICAnY2xpY2sgLnNwX2Fzc2Vzc21lbnRfZGVsZXRlX2NhbmNlbCcgIDogJ2Fzc2Vzc21lbnREZWxldGVUb2dnbGUnXG4gICAgJ2NsaWNrIC5zcF9hc3Nlc3NtZW50X2RlbGV0ZV9jb25maXJtJyA6ICdhc3Nlc3NtZW50RGVsZXRlJ1xuICAgICdjbGljayAuc3BfY29weScgICAgICAgICAgICAgICAgICAgICAgOiAnY29weVRvJ1xuICAgICdjbGljayAuc3BfZHVwbGljYXRlJyAgICAgICAgICAgICAgICAgOiAnZHVwbGljYXRlJ1xuICAgICdjbGljayAuc3BfdXBkYXRlJyAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xuICAgICdjbGljayAuc3BfcHJpbnQnICAgICAgICAgICAgICAgICAgICAgOiAndG9nZ2xlUHJpbnQnXG4gICAgJ2NsaWNrIC5hcmNoaXZlJyAgICAgICAgICAgICAgICAgICAgICA6ICdhcmNoaXZlJ1xuXG4gICAgJ2NoYW5nZSAjcHJpbnRfZm9ybWF0JyAgICAgICAgICAgICA6ICdwcmludCdcbiAgfVxuXG4gIGJsYW5rUmVzdWx0Q291bnQ6IFwiLVwiXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4jICAgIGNvbnNvbGUubG9nIFwibGlzdCBlbGVtZW50IHZpZXcgcmVuZGVyXCJcblxuICAgICMgYXJndW1lbnRzXG4gICAgQG1vZGVsICAgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgICA9IG9wdGlvbnMucGFyZW50XG5cbiAgICAjIHN3aXRjaGVzIGFuZCB0aGluZ3NcbiAgICBAaXNBZG1pbiAgICAgPSBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcblxuICByZXNwb25kVG9MaW5rOiAoZXZlbnQpIC0+XG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIHJvdXRlICAgPSAkdGFyZ2V0LmF0dHIoXCJocmVmXCIpXG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZShyb3V0ZSwgdHJ1ZSlcblxuICBnaG9zdExvZ2luOiA9PlxuICAgIFRhbmdlcmluZS51c2VyLmdob3N0TG9naW4gVGFuZ2VyaW5lLnNldHRpbmdzLnVwVXNlciwgVGFuZ2VyaW5lLnNldHRpbmdzLnVwUGFzc1xuXG4gIHVwZGF0ZTogPT5cbiAgICBVdGlscy5taWRBbGVydCBcIlZlcmlmeWluZyBjb25uZWN0aW9uXCJcbiAgICBVdGlscy53b3JraW5nIHRydWVcblxuICAgIEBtb2RlbC52ZXJpZnlDb25uZWN0aW9uXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICBVdGlscy5taWRBbGVydCBcIlZlcmlmeWluZyBjb25uZWN0aW9uPGJyPlBsZWFzZSByZXRyeSB1cGRhdGUuXCJcbiAgICAgICAgXy5kZWxheSA9PlxuICAgICAgICAgIEBnaG9zdExvZ2luKClcbiAgICAgICAgLCA1MDAwXG5cbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgQG1vZGVsLm9uIFwic3RhdHVzXCIsIChtZXNzYWdlKSA9PlxuICAgICAgICAgIGlmIG1lc3NhZ2UgPT0gXCJpbXBvcnQgbG9va3VwXCJcbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiVXBkYXRlIHN0YXJ0aW5nXCJcbiAgICAgICAgICBlbHNlIGlmIG1lc3NhZ2UgPT0gXCJpbXBvcnQgc3VjY2Vzc1wiXG4gICAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlVwZGF0ZWRcIlxuICAgICAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICAgICAgQG1vZGVsLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgICAgICAgQHJlbmRlcigpXG4gICAgICAgICAgZWxzZSBpZiBtZXNzYWdlID09IFwiaW1wb3J0IGVycm9yXCJcbiAgICAgICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiVXBkYXRlIGZhaWxlZFwiXG4gICAgICAgIFV0aWxzLndvcmtpbmcgdHJ1ZVxuICAgICAgICBVdGlscy51cGRhdGVGcm9tU2VydmVyIEBtb2RlbFxuXG4gIHRvZ2dsZVByaW50OiAtPlxuICAgIEAkZWwuZmluZChcIi5wcmludF9mb3JtYXRfd3JhcHBlclwiKS50b2dnbGUoKVxuXG4gIHByaW50OiAtPlxuICAgIGZvcm1hdCA9IEAkZWwuZmluZChcIiNwcmludF9mb3JtYXQgb3B0aW9uOnNlbGVjdGVkXCIpLmF0dHIoXCJkYXRhLWZvcm1hdFwiKVxuXG4gICAgaWYgZm9ybWF0ID09IFwiY2FuY2VsXCJcbiAgICAgIEAkZWwuZmluZChcIi5wcmludF9mb3JtYXRfd3JhcHBlclwiKS50b2dnbGUoKVxuICAgICAgQCRlbC5maW5kKFwiI3ByaW50X2Zvcm1hdFwiKS52YWwoXCJyZXNldFwiKVxuICAgICAgcmV0dXJuXG5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwicHJpbnQvI3tAbW9kZWwuaWR9LyN7Zm9ybWF0fVwiLCB0cnVlXG5cblxuICB1cGRhdGVSZXN1bHRDb3VudDogPT5cbiAgICAjQHJlc3VsdENvdW50ID0gTWF0aC5jb21tYXMgQG1vZGVsLnJlc3VsdENvdW50XG4gICAgI0AkZWwuZmluZChcIi5yZXN1bHRfY291bnRcIikuaHRtbCBcIlJlc3VsdHMgPGI+I3tAcmVzdWx0Q291bnR9PC9iPlwiIFxuXG4gIGFzc2Vzc21lbnRNZW51VG9nZ2xlOiAtPlxuICAgIEAkZWwuZmluZCgnLmFzc2Vzc21lbnRfbWVudV90b2dnbGUnKS50b2dnbGVDbGFzcygnc3BfZG93bicpLnRvZ2dsZUNsYXNzKCdzcF9yaWdodCcpXG4gICAgQCRlbC5maW5kKCcuYXNzZXNzbWVudF9tZW51JykudG9nZ2xlKClcblxuICBhc3Nlc3NtZW50RGVsZXRlVG9nZ2xlOiAtPlxuICAgIEAkZWwuZmluZChcIi5zcF9hc3Nlc3NtZW50X2RlbGV0ZV9jb25maXJtXCIpLnRvZ2dsZSgpOyBmYWxzZVxuXG4gICMgZGVlcCBub24tZ2VybmVyaWMgZGVsZXRlXG4gIGFzc2Vzc21lbnREZWxldGU6ID0+XG4gICAgIyByZW1vdmVzIGZyb20gY29sbGVjdGlvblxuICAgIEBtb2RlbC5kZXN0cm95KClcblxuICBzcHJpdGVMaXN0TGluazogKCB0YWdOYW1lLCBuYW1lcy4uLiApIC0+XG4gICAgcmVzdWx0ID0gXCJcIlxuICAgIGZvciBuYW1lIGluIG5hbWVzXG4gICAgICByZXN1bHQgKz0gXCI8I3t0YWdOYW1lfSBjbGFzcz0nc3BfI3tuYW1lLnVuZGVyc2NvcmUoKX0nPjxhIGhyZWY9JyMje25hbWV9LyN7QG1vZGVsLmlkfSc+I3tuYW1lLnVuZGVyc2NvcmUoKS50aXRsZWl6ZSgpfTwvYT48LyN7dGFnTmFtZX0+XCJcbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgc3ByaXRlRXZlbnRzOiAoIHRhZ05hbWUsIG5hbWVzLi4uKSAtPlxuICAgIHJlc3VsdCA9IFwiXCJcbiAgICBmb3IgbmFtZSBpbiBuYW1lc1xuICAgICAgcmVzdWx0ICs9IFwiPCN7dGFnTmFtZX0+PGJ1dHRvbiBjbGFzcz0nc3BfI3tuYW1lLnVuZGVyc2NvcmUoKX0nIHRpdGxlPScje25hbWUudW5kZXJzY29yZSgpLnRpdGxlaXplKCl9Jz4je25hbWUudW5kZXJzY29yZSgpLnRpdGxlaXplKCl9PC9idXR0b24+PC8je3RhZ05hbWV9PiBcIlxuICAgIHJldHVybiByZXN1bHRcblxuICB1bDogKG9wdGlvbnMpLT5cbiAgICBcbiAgICBodG1sID0gXCI8dWwgI3tpZiBvcHRpb25zLmNzc0NsYXNzIHRoZW4gXCJjbGFzcz0nI3tvcHRpb25zLmNzc0NsYXNzfSdcIiBlbHNlICcnfT5cIlxuICAgIGh0bWwgKz0gQHNwcml0ZUxpc3RMaW5rLmFwcGx5IEAsIFtcImxpXCJdLmNvbmNhdChvcHRpb25zLmxpbmtzKVxuICAgIGh0bWwgKz0gb3B0aW9ucy5vdGhlciB8fCAnJ1xuICAgIGh0bWwgKz0gXCI8L3VsPlwiXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgIyBjb21tYW5kc1xuXG4gICAgIyBpbmRpY2F0b3JzIGFuZCB2YXJpYWJsZXNcblxuICAgIHRvZ2dsZUJ1dHRvbiAgICAgPSBcIjxkaXYgY2xhc3M9J2Fzc2Vzc21lbnRfbWVudV90b2dnbGUgc3BfcmlnaHQnPjxkaXY+PC9kaXY+PC9kaXY+XCJcbiAgICBuYW1lICAgICAgICAgICAgID0gXCI8YnV0dG9uIGNsYXNzPSduYW1lIGNsaWNrYWJsZSc+I3tAbW9kZWwuZ2V0KCduYW1lJyl9PC9idXR0b24+XCJcbiAgICBhZG1pbk5hbWUgICAgICAgID0gXCI8YnV0dG9uIGNsYXNzPSdhZG1pbl9uYW1lIGNsaWNrYWJsZSc+I3tAbW9kZWwuZ2V0KCduYW1lJyl9PC9idXR0b24+XCJcbiAgICByZXN1bHRDb3VudCAgICAgID0gXCI8c3BhbiBjbGFzcz0ncmVzdWx0X2NvdW50IG5vX2hlbHAnPlJlc3VsdHMgPGI+I3tAcmVzdWx0Q291bnR9PC9iPjwvc3Bhbj5cIlxuICAgIHNlbGVjdGVkICAgICAgICAgPSBcIiBzZWxlY3RlZD0nc2VsZWN0ZWQnXCJcblxuICAgIGlmIEBpc0FkbWluXG4gICAgICBAJGVsLmh0bWwgXCJcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAje3RvZ2dsZUJ1dHRvbn1cbiAgICAgICAgICAje2FkbWluTmFtZX1cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIiArIEB1bFxuICAgICAgICBjc3NDbGFzczogXCJhc3Nlc3NtZW50X21lbnVcIlxuIyAgICAgICAgbGlua3MgOiBbXCJydW5cIixcInJ1bk1hclwiLCBcInJlc3VsdHNcIixcInVwZGF0ZVwiLFwiZGVsZXRlXCJdXG4gICAgICAgIGxpbmtzIDogW1wicnVuTWFyXCIsIFwicmVzdWx0c1wiLFwidXBkYXRlXCIsXCJkZWxldGVcIl1cbiAgICAgICAgb3RoZXIgOiBkZWxldGVDb25maXJtXG4gICAgZWxzZVxuIyAgICAgIGNvbnNvbGUubG9nIFwiZ290IGhlcmVcIlxuIyAgICAgIEAkZWwuaHRtbCBcIlxuIyAgICAgICAgPGRpdiBjbGFzcz0nbm9uX2FkbWluJz5cbiMgICAgICAgICAgI3tAc3ByaXRlTGlzdExpbmsoXCJzcGFuXCIsJ3J1bicpfSN7bmFtZX0gI3tAc3ByaXRlTGlzdExpbmsoXCJzcGFuXCIsJ3J1bk1hcicpfSN7bmFtZX0gI3tAc3ByaXRlTGlzdExpbmsoXCJzcGFuXCIsJ3Jlc3VsdHMnKX1cbiMgICAgICAgIDwvZGl2PlxuIyAgICAgIFwiXG4gICAgICBAJGVsLmh0bWwgXCJcbiAgICAgICAgPGRpdiBjbGFzcz0nbm9uX2FkbWluJz5cbiAgICAgICAgICAje0BzcHJpdGVMaXN0TGluayhcInNwYW5cIiwncnVuTWFyJyl9I3tuYW1lfSAje0BzcHJpdGVMaXN0TGluayhcInNwYW5cIiwncmVzdWx0cycpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIFwiXG5cblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuIl19

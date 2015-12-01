var KlassSubtestResultView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassSubtestResultView = (function(superClass) {
  extend(KlassSubtestResultView, superClass);

  function KlassSubtestResultView() {
    return KlassSubtestResultView.__super__.constructor.apply(this, arguments);
  }

  KlassSubtestResultView.prototype.className = "KlassSubtestResultView";

  KlassSubtestResultView.prototype.events = {
    "click .run": "checkRun",
    "click .back": "back",
    "click .show_itemized": "showItemized"
  };

  KlassSubtestResultView.prototype.initialize = function(options) {
    this.allResults = options.allResults;
    this.results = options.results;
    this.result = this.results[0];
    this.previous = options.previous;
    this.subtest = options.subtest;
    return this.student = options.student;
  };

  KlassSubtestResultView.prototype.gotoRun = function() {
    return Tangerine.router.navigate("class/run/" + this.student.id + "/" + this.subtest.id, true);
  };

  KlassSubtestResultView.prototype.checkRun = function() {
    var gridLinkId, hasGridLink, result, subtest;
    hasGridLink = this.subtest.has("gridLinkId") && this.subtest.get("gridLinkId") !== "";
    if (!hasGridLink) {
      this.gotoRun();
      return;
    }
    gridLinkId = this.subtest.get("gridLinkId");
    result = this.allResults.where({
      "subtestId": gridLinkId,
      "studentId": this.student.id
    });
    if (result.length === 0) {
      subtest = new Subtest({
        "_id": gridLinkId
      });
      subtest.fetch({
        success: (function(_this) {
          return function() {
            return Utils.midAlert("Please complete<br><b>" + (subtest.escape("name")) + "</b><br>for<br><b>" + (_this.student.escape('name')) + "</b><br>before this test.", 5000);
          };
        })(this)
      });
      return;
    }
    return this.gotoRun();
  };

  KlassSubtestResultView.prototype.showItemized = function() {
    return this.$el.find(".itemized").fadeToggle();
  };

  KlassSubtestResultView.prototype.back = function() {
    return Tangerine.router.navigate("class/" + (this.student.get("klassId")) + "/" + (this.subtest.get("part")), true);
  };

  KlassSubtestResultView.prototype.render = function() {
    var base, datum, i, j, key, len, ref, ref1, resultHTML, runButton, taken, timestamp, value;
    if (this.result != null) {
      this.results = this.results[0];
      resultHTML = "<button class='command show_itemized'>" + (t('itemized results')) + "</button><table class='itemized confirmation'><tbody><tr><th>Item</th><th>Result</th></tr>";
      if (this.subtest.get("prototype") === "grid") {
        ref = this.result.get("subtestData").items;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          datum = ref[i];
          resultHTML += "<tr><td>" + datum.itemLabel + "</td><td>" + (t(datum.itemResult)) + "</td></tr>";
        }
      } else if (this.subtest.get("prototype") === "survey") {
        ref1 = this.result.get("subtestData");
        for (key in ref1) {
          value = ref1[key];
          resultHTML += "<tr><td>" + key + "</td><td>" + (t(value)) + "</td></tr>";
        }
      }
      resultHTML += "</tbody></table><br>";
      timestamp = new Date(this.result.get("startTime"));
      if (this.previous > 0) {
        taken = "<tr> <td><label>Taken last</label></td><td>" + (timestamp.getFullYear()) + "/" + (timestamp.getMonth() + 1) + "/" + (timestamp.getDate()) + "</td> </tr> <tr> <td><label>Previous attempts</label></td><td>" + this.previous + "</td> </tr>";
      }
    }
    if ((this.result == null) || (typeof (base = this.result).get === "function" ? base.get("reportType") : void 0) !== "progress") {
      runButton = "<div class='menu_box'> <img src='images/icon_run.png' class='run clickable'> </div><br>";
    }
    this.$el.html("<h1>Result</h1> <table><tbody> <tr> <td><label>Assessment</label></td> <td>" + (this.subtest.get("part")) + "</td> </tr> <tr> <td><label>Student</label></td> <td>" + (this.student.escape("name")) + "</td> </tr> <tr> <td><label>Subtest</label></td> <td>" + (this.subtest.escape("name")) + "</td> </tr> " + (taken || "") + " </tbody></table> " + (resultHTML || "") + " " + (runButton || "") + " <button class='navigation back'>Back</button>");
    return this.trigger("rendered");
  };

  return KlassSubtestResultView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMva2xhc3MvS2xhc3NTdWJ0ZXN0UmVzdWx0Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxzQkFBQTtFQUFBOzs7QUFBTTs7Ozs7OzttQ0FFSixTQUFBLEdBQVc7O21DQUVYLE1BQUEsR0FDRTtJQUFBLFlBQUEsRUFBeUIsVUFBekI7SUFDQSxhQUFBLEVBQXlCLE1BRHpCO0lBRUEsc0JBQUEsRUFBeUIsY0FGekI7OzttQ0FJRixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLFVBQUQsR0FBYyxPQUFPLENBQUM7SUFDdEIsSUFBQyxDQUFBLE9BQUQsR0FBVyxPQUFPLENBQUM7SUFDbkIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUE7SUFDbkIsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFPLENBQUM7SUFDcEIsSUFBQyxDQUFBLE9BQUQsR0FBVyxPQUFPLENBQUM7V0FDbkIsSUFBQyxDQUFBLE9BQUQsR0FBVyxPQUFPLENBQUM7RUFOVDs7bUNBUVosT0FBQSxHQUFTLFNBQUE7V0FDUCxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFlBQUEsR0FBYSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQXRCLEdBQXlCLEdBQXpCLEdBQTRCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBL0QsRUFBcUUsSUFBckU7RUFETzs7bUNBR1QsUUFBQSxHQUFVLFNBQUE7QUFDUixRQUFBO0lBQUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLFlBQWIsQ0FBQSxJQUE4QixJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxZQUFiLENBQUEsS0FBOEI7SUFDMUUsSUFBRyxDQUFJLFdBQVA7TUFDRSxJQUFDLENBQUEsT0FBRCxDQUFBO0FBQ0EsYUFGRjs7SUFJQSxVQUFBLEdBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsWUFBYjtJQUViLE1B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QSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSw2RUFBQSxHQUtDLENBQUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsTUFBYixDQUFELENBTEQsR0FLdUIsdURBTHZCLEdBU0MsQ0FBQyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsTUFBaEIsQ0FBRCxDQVRELEdBUzBCLHVEQVQxQixHQWFDLENBQUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLE1BQWhCLENBQUQsQ0FiRCxHQWEwQixjQWIxQixHQWVMLENBQUMsS0FBQSxJQUFTLEVBQVYsQ0FmSyxHQWVRLG9CQWZSLEdBaUJQLENBQUMsVUFBQSxJQUFjLEVBQWYsQ0FqQk8sR0FpQlcsR0FqQlgsR0FrQlAsQ0FBQyxTQUFBLElBQWEsRUFBZCxDQWxCTyxHQWtCVSxnREFsQnBCO1dBc0JBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQXJETTs7OztHQTdDMkIsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMva2xhc3MvS2xhc3NTdWJ0ZXN0UmVzdWx0Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEtsYXNzU3VidGVzdFJlc3VsdFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIktsYXNzU3VidGVzdFJlc3VsdFZpZXdcIlxuXG4gIGV2ZW50czogXG4gICAgXCJjbGljayAucnVuXCIgICAgICAgICAgIDogXCJjaGVja1J1blwiXG4gICAgXCJjbGljayAuYmFja1wiICAgICAgICAgIDogXCJiYWNrXCJcbiAgICBcImNsaWNrIC5zaG93X2l0ZW1pemVkXCIgOiBcInNob3dJdGVtaXplZFwiXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQGFsbFJlc3VsdHMgPSBvcHRpb25zLmFsbFJlc3VsdHNcbiAgICBAcmVzdWx0cyA9IG9wdGlvbnMucmVzdWx0c1xuICAgIEByZXN1bHQgPSBAcmVzdWx0c1swXVxuICAgIEBwcmV2aW91cyA9IG9wdGlvbnMucHJldmlvdXNcbiAgICBAc3VidGVzdCA9IG9wdGlvbnMuc3VidGVzdFxuICAgIEBzdHVkZW50ID0gb3B0aW9ucy5zdHVkZW50XG5cbiAgZ290b1J1bjogLT5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiY2xhc3MvcnVuLyN7QHN0dWRlbnQuaWR9LyN7QHN1YnRlc3QuaWR9XCIsIHRydWVcblxuICBjaGVja1J1bjogLT5cbiAgICBoYXNHcmlkTGluayA9IEBzdWJ0ZXN0LmhhcyhcImdyaWRMaW5rSWRcIikgJiYgQHN1YnRlc3QuZ2V0KFwiZ3JpZExpbmtJZFwiKSAhPSBcIlwiXG4gICAgaWYgbm90IGhhc0dyaWRMaW5rXG4gICAgICBAZ290b1J1bigpXG4gICAgICByZXR1cm5cblxuICAgIGdyaWRMaW5rSWQgPSBAc3VidGVzdC5nZXQoXCJncmlkTGlua0lkXCIpXG5cbiAgICByZXN1bHQgPSBAYWxsUmVzdWx0cy53aGVyZSBcbiAgICAgIFwic3VidGVzdElkXCIgOiBncmlkTGlua0lkXG4gICAgICBcInN0dWRlbnRJZFwiIDogQHN0dWRlbnQuaWRcblxuICAgIGlmIHJlc3VsdC5sZW5ndGggPT0gMFxuICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IFwiX2lkXCIgOiBncmlkTGlua0lkXG4gICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJQbGVhc2UgY29tcGxldGU8YnI+PGI+I3tzdWJ0ZXN0LmVzY2FwZShcIm5hbWVcIil9PC9iPjxicj5mb3I8YnI+PGI+I3tAc3R1ZGVudC5lc2NhcGUoJ25hbWUnKX08L2I+PGJyPmJlZm9yZSB0aGlzIHRlc3QuXCIsIDUwMDBcbiAgICAgIHJldHVyblxuXG4gICAgQGdvdG9SdW4oKVxuXG4gIHNob3dJdGVtaXplZDogLT4gQCRlbC5maW5kKFwiLml0ZW1pemVkXCIpLmZhZGVUb2dnbGUoKVxuXG4gIGJhY2s6IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJjbGFzcy8je0BzdHVkZW50LmdldChcImtsYXNzSWRcIil9LyN7QHN1YnRlc3QuZ2V0KFwicGFydFwiKX1cIiwgdHJ1ZVxuXG4gIHJlbmRlcjogLT5cblxuICAgIGlmIEByZXN1bHQ/XG4gICAgICBAcmVzdWx0cyA9IEByZXN1bHRzWzBdXG5cbiAgICAgIHJlc3VsdEhUTUwgPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgc2hvd19pdGVtaXplZCc+I3t0KCdpdGVtaXplZCByZXN1bHRzJyl9PC9idXR0b24+PHRhYmxlIGNsYXNzPSdpdGVtaXplZCBjb25maXJtYXRpb24nPjx0Ym9keT48dHI+PHRoPkl0ZW08L3RoPjx0aD5SZXN1bHQ8L3RoPjwvdHI+XCJcbiAgICAgIGlmIEBzdWJ0ZXN0LmdldChcInByb3RvdHlwZVwiKSA9PSBcImdyaWRcIlxuICAgICAgICBmb3IgZGF0dW0sIGkgaW4gQHJlc3VsdC5nZXQoXCJzdWJ0ZXN0RGF0YVwiKS5pdGVtc1xuICAgICAgICAgIHJlc3VsdEhUTUwgKz0gXCI8dHI+PHRkPiN7ZGF0dW0uaXRlbUxhYmVsfTwvdGQ+PHRkPiN7dChkYXR1bS5pdGVtUmVzdWx0KX08L3RkPjwvdHI+XCJcbiAgICAgIGVsc2UgaWYgQHN1YnRlc3QuZ2V0KFwicHJvdG90eXBlXCIpID09IFwic3VydmV5XCJcbiAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgQHJlc3VsdC5nZXQoXCJzdWJ0ZXN0RGF0YVwiKVxuICAgICAgICAgIHJlc3VsdEhUTUwgKz0gXCI8dHI+PHRkPiN7a2V5fTwvdGQ+PHRkPiN7dCh2YWx1ZSl9PC90ZD48L3RyPlwiXG4gICAgICByZXN1bHRIVE1MICs9IFwiPC90Ym9keT48L3RhYmxlPjxicj5cIlxuXG4gICAgICB0aW1lc3RhbXAgPSBuZXcgRGF0ZShAcmVzdWx0LmdldChcInN0YXJ0VGltZVwiKSlcblxuICAgICAgdGFrZW4gPSBcIlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPjxsYWJlbD5UYWtlbiBsYXN0PC9sYWJlbD48L3RkPjx0ZD4je3RpbWVzdGFtcC5nZXRGdWxsWWVhcigpfS8je3RpbWVzdGFtcC5nZXRNb250aCgpKzF9LyN7dGltZXN0YW1wLmdldERhdGUoKX08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPjxsYWJlbD5QcmV2aW91cyBhdHRlbXB0czwvbGFiZWw+PC90ZD48dGQ+I3tAcHJldmlvdXN9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgIFwiIGlmIEBwcmV2aW91cyA+IDBcblxuICAgIHJ1bkJ1dHRvbiA9IFwiXG4gICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgIDxpbWcgc3JjPSdpbWFnZXMvaWNvbl9ydW4ucG5nJyBjbGFzcz0ncnVuIGNsaWNrYWJsZSc+XG4gICAgICA8L2Rpdj48YnI+XG4gICAgXCIgaWYgbm90IEByZXN1bHQ/IHx8IEByZXN1bHQuZ2V0PyhcInJlcG9ydFR5cGVcIikgIT0gXCJwcm9ncmVzc1wiXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxoMT5SZXN1bHQ8L2gxPlxuICAgICAgPHRhYmxlPjx0Ym9keT5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZD48bGFiZWw+QXNzZXNzbWVudDwvbGFiZWw+PC90ZD5cbiAgICAgICAgICA8dGQ+I3tAc3VidGVzdC5nZXQoXCJwYXJ0XCIpfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+PGxhYmVsPlN0dWRlbnQ8L2xhYmVsPjwvdGQ+XG4gICAgICAgICAgPHRkPiN7QHN0dWRlbnQuZXNjYXBlKFwibmFtZVwiKX08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPjxsYWJlbD5TdWJ0ZXN0PC9sYWJlbD48L3RkPlxuICAgICAgICAgIDx0ZD4je0BzdWJ0ZXN0LmVzY2FwZShcIm5hbWVcIil9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgI3t0YWtlbiB8fCBcIlwifVxuICAgICAgPC90Ym9keT48L3RhYmxlPlxuICAgICAgI3tyZXN1bHRIVE1MIHx8IFwiXCJ9XG4gICAgICAje3J1bkJ1dHRvbiB8fCBcIlwifVxuICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBiYWNrJz5CYWNrPC9idXR0b24+XG4gICAgXCJcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIiJdfQ==

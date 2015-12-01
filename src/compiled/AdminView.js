var AdminView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AdminView = (function(superClass) {
  extend(AdminView, superClass);

  function AdminView() {
    this.render = bind(this.render, this);
    return AdminView.__super__.constructor.apply(this, arguments);
  }

  AdminView.prototype.className = "AdminView";

  AdminView.prototype.events = {
    "click .update ": "update"
  };

  AdminView.prototype.update = function(event) {
    var $target, group;
    $target = $(event.target);
    group = $target.attr("data-group");
    return Utils.updateTangerine(null, {
      targetDB: group
    });
  };

  AdminView.prototype.getVersionNumber = function(group) {
    return $.ajax("/" + group + "/_design/" + Tangerine.design_doc + "/js/version.js", {
      dataType: "text",
      success: (function(_this) {
        return function(result) {
          console.log(result);
          return _this.$el.find("#" + group + "-version").html(result.match(/"(.*)"/)[1]);
        };
      })(this)
    });
  };

  AdminView.prototype.initialize = function(options) {
    return this.groups = options.groups;
  };

  AdminView.prototype.render = function() {
    var group, sortTable;
    sortTable = _.after(this.groups.length, function() {
      return $("table#active-groups").tablesorter({
        widgets: ['zebra'],
        sortList: [[5, 1]]
      });
    });
    this.$el.html("<h2>Group Activity</h2> <table id='active-groups' class='class_table'> <thead> " + (_(["Name", "Last Complete Result", "Total Assessments", "Total Results", "Version", "Last Result"]).map(function(header) {
      return "<th>" + header + "</th>";
    }).join("")) + " </thead> <tbody> " + (((function() {
      var i, len, ref, results;
      ref = this.groups;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        group = ref[i];
        results.push("<tr id='" + group + "'> <td> " + group + "<br> </td> <td class='last-result'>...</td> <td class='total-assessments'>...</td> <td class='total-results'>...</td> <td class='version'><div>...</div><button class='update command' data-group='" + group + "'>Update</button></td> <td class='last-timestamp'>...</td> </tr>");
      }
      return results;
    }).call(this)).join('')) + " </tbody> </table>");
    $("table#active-groups").tablesorter({
      widgets: ['zebra'],
      sortList: [[5, 1]]
    });
    _(this.groups).each((function(_this) {
      return function(group) {
        var $group;
        $group = _this.$el.find("#" + group);
        return $.ajax("/" + group + "/_design/" + Tangerine.design_doc + "/js/version.js", {
          dataType: "text",
          success: function(result) {
            $group.find(".version div").html(result.match(/"(.*)"/)[1]);
            return $.couch.db(group).view(Tangerine.design_doc + "/resultCount", {
              group: true,
              success: (function(_this) {
                return function(resultCounts) {
                  var groupTotalResults, resultCount;
                  $group.find(".total-assessments").html(resultCounts.rows.length);
                  groupTotalResults = 0;
                  while ((resultCount = resultCounts.rows.pop())) {
                    groupTotalResults += parseInt(resultCount.value);
                  }
                  $group.find(".total-results").html("<button class='results navigation'><a href='/" + group + "/_design/" + Tangerine.design_doc + "/index.html#dashboard'>" + groupTotalResults + "</a></button>");
                  return ($.couch.db(group).view(Tangerine.design_doc + "/completedResultsByEndTime", {
                    limit: 1,
                    descending: true,
                    success: function(result) {
                      if (result.rows[0] && result.rows[0].key) {
                        $group.find(".last-timestamp").html(moment(new Date(result.rows[0].key)).format("YYYY-MMM-DD HH:mm"));
                        return $group.find(".last-result").html(moment(result.rows[0].key).fromNow());
                      }
                    },
                    error: function() {
                      return console.log("Could not retrieve view 'completedResultsByEndTime' for " + group);
                    }
                  })).complete(function() {
                    return sortTable();
                  });
                };
              })(this)
            });
          }
        });
      };
    })(this));
    return this.trigger("rendered");
  };

  return AdminView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYWRtaW4vQWRtaW5WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFNBQUE7RUFBQTs7OztBQUFNOzs7Ozs7OztzQkFFSixTQUFBLEdBQVk7O3NCQUVaLE1BQUEsR0FFRTtJQUFBLGdCQUFBLEVBQW1CLFFBQW5COzs7c0JBRUYsTUFBQSxHQUFRLFNBQUMsS0FBRDtBQUNOLFFBQUE7SUFBQSxPQUFBLEdBQVUsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSO0lBQ1YsS0FBQSxHQUFRLE9BQU8sQ0FBQyxJQUFSLENBQWEsWUFBYjtXQUNSLEtBQUssQ0FBQyxlQUFOLENBQXNCLElBQXRCLEVBQ0U7TUFBQSxRQUFBLEVBQVcsS0FBWDtLQURGO0VBSE07O3NCQU1SLGdCQUFBLEdBQWtCLFNBQUMsS0FBRDtXQUNoQixDQUFDLENBQUMsSUFBRixDQUFPLEdBQUEsR0FBSSxLQUFKLEdBQVUsV0FBVixHQUFxQixTQUFTLENBQUMsVUFBL0IsR0FBMEMsZ0JBQWpELEVBQ0U7TUFBQSxRQUFBLEVBQVUsTUFBVjtNQUNBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtVQUNQLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWjtpQkFDQSxLQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxHQUFBLEdBQUksS0FBSixHQUFVLFVBQXBCLENBQThCLENBQUMsSUFBL0IsQ0FBb0MsTUFBTSxDQUFDLEtBQVAsQ0FBYSxRQUFiLENBQXVCLENBQUEsQ0FBQSxDQUEzRDtRQUZPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURUO0tBREY7RUFEZ0I7O3NCQVFsQixVQUFBLEdBQVksU0FBRSxPQUFGO1dBQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFPLENBQUM7RUFEUjs7c0JBR1osTUFBQSxHQUFRLFNBQUE7QUFFTixRQUFBO0lBQUEsU0FBQSxHQUFZLENBQUMsQ0FBQyxLQUFGLENBQVEsSUFBQyxDQUFBLE1BQU0s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QUFEO3NCQUNQLElBQUcsTUFBTSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQVosSUFBbUIsTUFBTSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxHQUFyQzt3QkFDRSxNQUFNLENBQUMsSUFBUCxDQUFZLGlCQUFaLENBQThCLENBQUMsSUFBL0IsQ0FBb0MsTUFBQSxDQUFXLElBQUEsSUFBQSxDQUFLLE1BQU0sQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBcEIsQ0FBWCxDQUFvQyxDQUFDLE1BQXJDLENBQTRDLG1CQUE1QyxDQUFwQzsrQkFDQSxNQUFNLENBQUMsSUFBUCxDQUFZLGNBQVosQ0FBMkIsQ0FBQyxJQUE1QixDQUFpQyxNQUFBLENBQU8sTUFBTSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxHQUF0QixDQUEwQixDQUFDLE9BQTNCLENBQUEsQ0FBakMsRUFGRjs7b0JBRE8sQ0FGVDtvQkFPQSxLQUFBLEVBQU8sU0FBQTs2QkFDTCxPQUFPLENBQUMsR0FBUixDQUFZLDBEQUFBLEdBQTJELEtBQXZFO29CQURLLENBUFA7bUJBREQsQ0FBRCxDQVdDLENBQUMsUUFYRixDQVdXLFNBQUE7MkJBQUcsU0FBQSxDQUFBO2tCQUFILENBWFg7Z0JBUk87Y0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFQ7YUFERjtVQUpPLENBRFQ7U0FERjtNQUhjO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQjtXQWlDQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUF4RU07Ozs7R0F6QmMsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvYWRtaW4vQWRtaW5WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQWRtaW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiQWRtaW5WaWV3XCJcblxuICBldmVudHM6XG4gICAgI1wiY2hhbmdlICNncm91cEJ5XCI6IFwidXBkYXRlXCJcbiAgICBcImNsaWNrIC51cGRhdGUgXCIgOiBcInVwZGF0ZVwiIFxuXG4gIHVwZGF0ZTogKGV2ZW50KSAtPlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBncm91cCA9ICR0YXJnZXQuYXR0cihcImRhdGEtZ3JvdXBcIilcbiAgICBVdGlscy51cGRhdGVUYW5nZXJpbmUgbnVsbCxcbiAgICAgIHRhcmdldERCIDogZ3JvdXBcblxuICBnZXRWZXJzaW9uTnVtYmVyOiAoZ3JvdXApIC0+XG4gICAgJC5hamF4IFwiLyN7Z3JvdXB9L19kZXNpZ24vI3tUYW5nZXJpbmUuZGVzaWduX2RvY30vanMvdmVyc2lvbi5qc1wiLFxuICAgICAgZGF0YVR5cGU6IFwidGV4dFwiXG4gICAgICBzdWNjZXNzOiAocmVzdWx0KSA9PlxuICAgICAgICBjb25zb2xlLmxvZyByZXN1bHRcbiAgICAgICAgQCRlbC5maW5kKFwiIyN7Z3JvdXB9LXZlcnNpb25cIikuaHRtbCByZXN1bHQubWF0Y2goL1wiKC4qKVwiLylbMV1cblxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG4gICAgQGdyb3VwcyA9IG9wdGlvbnMuZ3JvdXBzXG5cbiAgcmVuZGVyOiA9PlxuXG4gICAgc29ydFRhYmxlID0gXy5hZnRlciBAZ3JvdXBzLmxlbmd0aCwgLT5cbiAgICAgICQoXCJ0YWJsZSNhY3RpdmUtZ3JvdXBzXCIpLnRhYmxlc29ydGVyXG4gICAgICAgIHdpZGdldHM6IFsnemVicmEnXVxuICAgICAgICBzb3J0TGlzdDogW1s1LDFdXVxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8aDI+R3JvdXAgQWN0aXZpdHk8L2gyPlxuICAgICAgPHRhYmxlIGlkPSdhY3RpdmUtZ3JvdXBzJyBjbGFzcz0nY2xhc3NfdGFibGUnPlxuICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgI3tfKFtcbiAgICAgICAgICAgIFwiTmFtZVwiXG4gICAgICAgICAgICBcIkxhc3QgQ29tcGxldGUgUmVzdWx0XCJcbiAgICAgICAgICAgIFwiVG90YWwgQXNzZXNzbWVudHNcIlxuICAgICAgICAgICAgXCJUb3RhbCBSZXN1bHRzXCJcbiAgICAgICAgICAgIFwiVmVyc2lvblwiXG4gICAgICAgICAgICBcIkxhc3QgUmVzdWx0XCJcbiAgICAgICAgICBdKS5tYXAoIChoZWFkZXIpIC0+IFwiPHRoPiN7aGVhZGVyfTwvdGg+XCIpLmpvaW4oXCJcIil9XG4gICAgICAgIDwvdGhlYWQ+XG4gICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAjeyhcIjx0ciBpZD0nI3tncm91cH0nPlxuICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgI3tncm91cH08YnI+XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgIDx0ZCBjbGFzcz0nbGFzdC1yZXN1bHQnPi4uLjwvdGQ+XG4gICAgICAgICAgICAgIDx0ZCBjbGFzcz0ndG90YWwtYXNzZXNzbWVudHMnPi4uLjwvdGQ+XG4gICAgICAgICAgICAgIDx0ZCBjbGFzcz0ndG90YWwtcmVzdWx0cyc+Li4uPC90ZD5cbiAgICAgICAgICAgICAgPHRkIGNsYXNzPSd2ZXJzaW9uJz48ZGl2Pi4uLjwvZGl2PjxidXR0b24gY2xhc3M9J3VwZGF0ZSBjb21tYW5kJyBkYXRhLWdyb3VwPScje2dyb3VwfSc+VXBkYXRlPC9idXR0b24+PC90ZD5cbiAgICAgICAgICAgICAgPHRkIGNsYXNzPSdsYXN0LXRpbWVzdGFtcCc+Li4uPC90ZD5cbiAgICAgICAgICAgIDwvdHI+XCIgZm9yIGdyb3VwIGluIEBncm91cHMpLmpvaW4oJycpfVxuICAgICAgICA8L3Rib2R5PlxuICAgICAgPC90YWJsZT5cbiAgICBcIlxuXG4gICAgJChcInRhYmxlI2FjdGl2ZS1ncm91cHNcIikudGFibGVzb3J0ZXJcbiAgICAgICAgd2lkZ2V0czogWyd6ZWJyYSddXG4gICAgICAgIHNvcnRMaXN0OiBbWzUsMV1dXG5cbiAgICBfKEBncm91cHMpLmVhY2ggKGdyb3VwKSA9PlxuXG4gICAgICAkZ3JvdXAgPSBAJGVsLmZpbmQoXCIjI3tncm91cH1cIilcbiAgICAgICQuYWpheCBcIi8je2dyb3VwfS9fZGVzaWduLyN7VGFuZ2VyaW5lLmRlc2lnbl9kb2N9L2pzL3ZlcnNpb24uanNcIixcbiAgICAgICAgZGF0YVR5cGU6IFwidGV4dFwiXG4gICAgICAgIHN1Y2Nlc3M6IChyZXN1bHQpIC0+XG4gICAgICAgICAgJGdyb3VwLmZpbmQoXCIudmVyc2lvbiBkaXZcIikuaHRtbCByZXN1bHQubWF0Y2goL1wiKC4qKVwiLylbMV1cblxuXG4gICAgICAgICAgJC5jb3VjaC5kYihncm91cCkudmlldyBUYW5nZXJpbmUuZGVzaWduX2RvYyArIFwiL3Jlc3VsdENvdW50XCIsXG4gICAgICAgICAgICBncm91cDogdHJ1ZVxuICAgICAgICAgICAgc3VjY2VzczogKHJlc3VsdENvdW50cykgPT5cblxuICAgICAgICAgICAgICAkZ3JvdXAuZmluZChcIi50b3RhbC1hc3Nlc3NtZW50c1wiKS5odG1sIHJlc3VsdENvdW50cy5yb3dzLmxlbmd0aFxuXG4gICAgICAgICAgICAgIGdyb3VwVG90YWxSZXN1bHRzID0gMFxuICAgICAgICAgICAgICBncm91cFRvdGFsUmVzdWx0cyArPSBwYXJzZUludChyZXN1bHRDb3VudC52YWx1ZSkgd2hpbGUgKHJlc3VsdENvdW50ID0gcmVzdWx0Q291bnRzLnJvd3MucG9wKCkpXG4gICAgICAgICAgICAgICRncm91cC5maW5kKFwiLnRvdGFsLXJlc3VsdHNcIikuaHRtbCBcIjxidXR0b24gY2xhc3M9J3Jlc3VsdHMgbmF2aWdhdGlvbic+PGEgaHJlZj0nLyN7Z3JvdXB9L19kZXNpZ24vI3tUYW5nZXJpbmUuZGVzaWduX2RvY30vaW5kZXguaHRtbCNkYXNoYm9hcmQnPiN7Z3JvdXBUb3RhbFJlc3VsdHN9PC9hPjwvYnV0dG9uPlwiXG5cbiAgICAgICAgICAgICAgKCQuY291Y2guZGIoZ3JvdXApLnZpZXcgVGFuZ2VyaW5lLmRlc2lnbl9kb2MgKyBcIi9jb21wbGV0ZWRSZXN1bHRzQnlFbmRUaW1lXCIsXG4gICAgICAgICAgICAgICAgbGltaXQ6IDFcbiAgICAgICAgICAgICAgICBkZXNjZW5kaW5nOiB0cnVlXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3VsdCkgPT5cbiAgICAgICAgICAgICAgICAgIGlmIHJlc3VsdC5yb3dzWzBdIGFuZCByZXN1bHQucm93c1swXS5rZXlcbiAgICAgICAgICAgICAgICAgICAgJGdyb3VwLmZpbmQoXCIubGFzdC10aW1lc3RhbXBcIikuaHRtbCBtb21lbnQobmV3IERhdGUocmVzdWx0LnJvd3NbMF0ua2V5KSkuZm9ybWF0KFwiWVlZWS1NTU0tREQgSEg6bW1cIilcbiAgICAgICAgICAgICAgICAgICAgJGdyb3VwLmZpbmQoXCIubGFzdC1yZXN1bHRcIikuaHRtbCBtb21lbnQocmVzdWx0LnJvd3NbMF0ua2V5KS5mcm9tTm93KClcblxuICAgICAgICAgICAgICAgIGVycm9yOiAoKSA9PlxuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgXCJDb3VsZCBub3QgcmV0cmlldmUgdmlldyAnY29tcGxldGVkUmVzdWx0c0J5RW5kVGltZScgZm9yICN7Z3JvdXB9XCJcblxuICAgICAgICAgICAgICApLmNvbXBsZXRlID0+IHNvcnRUYWJsZSgpXG5cblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuIl19

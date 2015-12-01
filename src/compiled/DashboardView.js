var DashboardView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DashboardView = (function(superClass) {
  extend(DashboardView, superClass);

  function DashboardView() {
    this.renderResults = bind(this.renderResults, this);
    this.render = bind(this.render, this);
    this.update = bind(this.update, this);
    this.syntaxHighlight = bind(this.syntaxHighlight, this);
    this.showResult = bind(this.showResult, this);
    return DashboardView.__super__.constructor.apply(this, arguments);
  }

  DashboardView.prototype.className = "DashboardView";

  DashboardView.prototype.events = {
    "change #groupBy": "update",
    "change #assessment": "update",
    "change #shiftHours": "update",
    "click .result": "showResult"
  };

  DashboardView.prototype.showResult = function(event) {
    var resultDetails, resultId;
    resultDetails = $("#resultDetails");
    if (resultDetails.is(":visible")) {
      return resultDetails.hide();
    } else {
      resultId = $(event.target).text();
      return $.couch.db(document.location.pathname.match(/^\/(.*?)\//).pop()).openDoc(resultId, {
        success: (function(_this) {
          return function(result) {
            resultDetails.html("<pre>" + (_this.syntaxHighlight(result)) + "</pre>");
            resultDetails.css({
              top: $(event.target).position().top + 30,
              width: 400,
              left: 50
            });
            return resultDetails.show();
          };
        })(this)
      });
    }
  };

  DashboardView.prototype.syntaxHighlight = function(json) {
    window.json = json;
    if (typeof json !== 'string') {
      json = JSON.stringify(json, void 0, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
      var cls;
      cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  };

  DashboardView.prototype.update = function() {
    return Tangerine.router.navigate("dashboard/groupBy/" + ($("#groupBy").val()) + "/assessment/" + ($("#assessment").val()) + "/shiftHours/" + ($("#shiftHours").val()), true);
  };

  DashboardView.prototype.initialize = function(options) {
    this.groupBy = options.groupBy;
    this.key = options.assessment;
    return this.shiftHours = options.shiftHours || 0;
  };

  DashboardView.prototype.render = function() {
    if (this.key === "All") {
      return $.couch.db(Tangerine.db_name).view(Tangerine.design_doc + "/dashboardResults", {
        reduce: false,
        success: this.renderResults
      });
    } else {
      return $.couch.db(Tangerine.db_name).view(Tangerine.design_doc + "/dashboardResults", {
        key: this.key,
        reduce: false,
        success: this.renderResults
      });
    }
  };

  DashboardView.prototype.renderResults = function(result) {
    var dates, propertiesToGroupBy, tableRows;
    tableRows = {};
    dates = {};
    propertiesToGroupBy = {};
    if (this.groupBy == null) {
      this.groupBy = _.keys(result.rows[0].value)[0];
    }
    _.each(result.rows, (function(_this) {
      return function(row) {
        var displayDate, leftColumn, sortingDate;
        leftColumn = row.value[_this.groupBy];
        sortingDate = row.value.startTime ? moment(row.value.startTime).add("h", _this.shiftHours).format("YYYYMMDD") : "Unknown";
        displayDate = row.value.startTime ? moment(row.value.startTime).add("h", _this.shiftHours).format("Do MMM") : "Unknown";
        dates[sortingDate] = displayDate;
        if (tableRows[leftColumn] == null) {
          tableRows[leftColumn] = {};
        }
        if (tableRows[leftColumn][sortingDate] == null) {
          tableRows[leftColumn][sortingDate] = [];
        }
        return tableRows[leftColumn][sortingDate].push("<div style='padding-top:10px;'> <table> " + (_.map(row.value, function(value, key) {
          propertiesToGroupBy[key] = true;
          if (key === "startTime") {
            value = moment(value).add("h", _this.shiftHours).format("YYYY-MM-DD HH:mm");
          }
          if (key === "resultId") {
            value = "<button class='result'>" + value + "</button>";
          }
          return "<tr><td>" + key + "</td><td>" + value + "</td></tr>";
        }).join("")) + " </table> </div> <hr/>");
      };
    })(this));
    this.$el.html("<h1>" + Tangerine.db_name + "</h1> Assessment: <select id='assessment'> </select> <br/> Value used for grouping: <select id='groupBy'> " + (_.map(propertiesToGroupBy, (function(_this) {
      return function(value, key) {
        return "<option " + (key === _this.groupBy ? "selected='true'" : '') + "> " + key + " </option>";
      };
    })(this))) + " </select> <br/> <br/> <button onClick='$(\"#advancedOptions\").toggle()'>Advanced Options</button> <div style='display:none' id='advancedOptions'> Current time in your timezone (" + (jstz.determine().name()) + ") is " + (moment().format("YYYY-MM-DD HH:mm")) + "<br/> Shift time values by <input id='shiftHours' type='number' value='" + this.shiftHours + "'></input> hours to handle correct timezone.<br/> Shifted time: " + (moment().add("h", this.shiftHours).format("YYYY-MM-DD HH:mm")) + " <br/> </div> <table id='results' class='tablesorter'> <thead> <th>" + this.groupBy + "</th> " + (_(dates).keys().sort().map(function(sortingDate) {
      return "<th class='" + sortingDate + "'>" + dates[sortingDate] + "</th>";
    }).join("")) + " </thead> <tbody> " + (_.map(tableRows, function(dataForDates, leftColumn) {
      return "<tr> <td>" + leftColumn + "</td> " + (_(dates).keys().sort().map(function(sortingDate) {
        return "<td class='" + sortingDate + "'> " + (dataForDates[sortingDate] ? "<button class='sort-value' onClick='$(this).siblings().toggle()'>" + dataForDates[sortingDate].length + "</button> <div style='display:none'> " + (dataForDates[sortingDate].join("")) + " </div>" : "") + " </td>";
      }).join("")) + " </tr>";
    }).join("")) + " </tbody> </table> <div id='resultDetails'> </div> <style> #resultDetails{ position:absolute; background-color:black; display:none; } pre { font-size: 75%; outline: 1px solid #ccc; padding: 5px; margin: 5px; text-shadow: none; overflow-wrap:break-word; } .string { color: green; } .number { color: darkorange; } .boolean { color: blue; } .null { color: magenta; } .key { color: red; } </style>");
    this.$el.find("table#results").tablesorter({
      widgets: ['zebra'],
      sortList: [[0, 0]],
      textExtraction: function(node) {
        var sortValue;
        sortValue = $(node).find(".sort-value").text();
        if (sortValue !== "") {
          return sortValue;
        } else {
          return $(node).text();
        }
      }
    });
    this.$el.find("#advancedOptions").append("Select which dates to show<br/>");
    _(dates).keys().sort().map((function(_this) {
      return function(sortingDate) {
        var dateCheckbox, displayDate;
        displayDate = dates[sortingDate];
        dateCheckbox = $("<label for='" + sortingDate + "'>" + displayDate + "</label><input name='" + sortingDate + "' id='" + sortingDate + "' type='checkbox' checked='true'/>");
        dateCheckbox.click(function() {
          return $("." + sortingDate).toggle();
        });
        return _this.$el.find("#advancedOptions").append(dateCheckbox);
      };
    })(this));
    $.couch.db(Tangerine.db_name).view(Tangerine.design_doc + "/dashboardResults", {
      group: true,
      success: (function(_this) {
        return function(result) {
          $("select#assessment").html("<option>All</option>" + _.map(result.rows, function(row) {
            return "<option value='" + row.key + "' " + (row.key === _this.key ? "selected='true'" : "") + ">" + row.key + "</option>";
          }).join(""));
          return _.each(result.rows, function(row) {
            if (row.key == null) {
              return;
            }
            return $.couch.db(Tangerine.db_name).openDoc(row.key, {
              success: function(result) {
                return $("option[value=" + row.key + "]").html(result.name);
              },
              error: function(result) {
                return $("option[value=" + row.key + "]").html("Unknown assessment");
              }
            });
          });
        };
      })(this)
    });
    return this.trigger("rendered");
  };

  return DashboardView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVzdWx0L0Rhc2hib2FyZFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsYUFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7OzswQkFFSixTQUFBLEdBQVk7OzBCQUVaLE1BQUEsR0FDRTtJQUFBLGlCQUFBLEVBQW1CLFFBQW5CO0lBQ0Esb0JBQUEsRUFBc0IsUUFEdEI7SUFFQSxvQkFBQSxFQUFzQixRQUZ0QjtJQUdBLGVBQUEsRUFBaUIsWUFIakI7OzswQkFLRixVQUFBLEdBQVksU0FBQyxLQUFEO0FBQ1YsUUFBQTtJQUFBLGFBQUEsR0FBZ0IsQ0FBQSxDQUFFLGdCQUFGO0lBQ2hCLElBQUcsYUFBYSxDQUFDLEVBQWQsQ0FBaUIsVUFBakIsQ0FBSDthQUNFLGFBQWEsQ0FBQyxJQUFkLENBQUEsRUFERjtLQUFBLE1BQUE7TUFHRSxRQUFBLEdBQVcsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxJQUFoQixDQUFBO2FBQ1gsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFSLENBQVcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBM0IsQ0FBaUMsWUFBakMsQ0FBOEMsQ0FBQyxHQUEvQyxDQUFBLENBQVgsQ0FBZ0UsQ0FBQyxPQUFqRSxDQUF5RSxRQUF6RSxFQUNFO1FBQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsTUFBRDtZQUNQLGFBQWEsQ0FBQyxJQUFkLENBQW1CLE9BQUEsR0FBTyxDQUFDLEtBQUMsQ0FBQSxlQUFELENBQWlCLE1BQWpCLENBQUQsQ0FBUCxHQUFpQyxRQUFwRDtZQUNBLGFBQWEsQ0FBQyxHQUFkLENBQ0U7Y0FBQSxHQUFBLEVBQUssQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxRQUFoQixDQUFBLENBQTBCLENBQUMsR0FBM0IsR0FBaUMsRUFBdEM7Y0FDQSxLQUFBLEVBQU8sR0FEUDtjQUVBLElBQUEsRUFBTSxFQUZOO2FB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QyxvQkFBbkM7Y0FESyxDQUZQO2FBREY7VUFGa0IsQ0FBcEI7UUFMTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEVDtLQURGO1dBZ0JBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQXRKYTs7OztHQWhFVyxRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9yZXN1bHQvRGFzaGJvYXJkVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIERhc2hib2FyZFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJEYXNoYm9hcmRWaWV3XCJcblxuICBldmVudHM6XG4gICAgXCJjaGFuZ2UgI2dyb3VwQnlcIjogXCJ1cGRhdGVcIlxuICAgIFwiY2hhbmdlICNhc3Nlc3NtZW50XCI6IFwidXBkYXRlXCJcbiAgICBcImNoYW5nZSAjc2hpZnRIb3Vyc1wiOiBcInVwZGF0ZVwiXG4gICAgXCJjbGljayAucmVzdWx0XCI6IFwic2hvd1Jlc3VsdFwiXG5cbiAgc2hvd1Jlc3VsdDogKGV2ZW50KSA9PlxuICAgIHJlc3VsdERldGFpbHMgPSAkKFwiI3Jlc3VsdERldGFpbHNcIilcbiAgICBpZiByZXN1bHREZXRhaWxzLmlzKFwiOnZpc2libGVcIilcbiAgICAgIHJlc3VsdERldGFpbHMuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgcmVzdWx0SWQgPSAkKGV2ZW50LnRhcmdldCkudGV4dCgpXG4gICAgICAkLmNvdWNoLmRiKGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lLm1hdGNoKC9eXFwvKC4qPylcXC8vKS5wb3AoKSkub3BlbkRvYyByZXN1bHRJZCxcbiAgICAgICAgc3VjY2VzczogKHJlc3VsdCkgPT5cbiAgICAgICAgICByZXN1bHREZXRhaWxzLmh0bWwgXCI8cHJlPiN7QHN5bnRheEhpZ2hsaWdodChyZXN1bHQpfTwvcHJlPlwiXG4gICAgICAgICAgcmVzdWx0RGV0YWlscy5jc3NcbiAgICAgICAgICAgIHRvcDogJChldmVudC50YXJnZXQpLnBvc2l0aW9uKCkudG9wICsgMzBcbiAgICAgICAgICAgIHdpZHRoOiA0MDBcbiAgICAgICAgICAgIGxlZnQ6IDUwXG4gICAgICAgICAgcmVzdWx0RGV0YWlscy5zaG93KClcblxuICBzeW50YXhIaWdobGlnaHQ6IChqc29uKSA9PlxuICAgIHdpbmRvdy5qc29uID0ganNvblxuICAgIGlmICh0eXBlb2YganNvbiAhPSAnc3RyaW5nJylcbiAgICAgICBqc29uID0gSlNPTi5zdHJpbmdpZnkoanNvbiwgdW5kZWZpbmVkLCAyKVxuICAgIGpzb24gPSBqc29uLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIHJldHVybiBqc29uLnJlcGxhY2UgLyhcIihcXFxcdVthLXpBLVowLTldezR9fFxcXFxbXnVdfFteXFxcXFwiXSkqXCIoXFxzKjopP3xcXGIodHJ1ZXxmYWxzZXxudWxsKVxcYnwtP1xcZCsoPzpcXC5cXGQqKT8oPzpbZUVdWytcXC1dP1xcZCspPykvZywgKG1hdGNoKSAtPlxuICAgICAgY2xzID0gJ251bWJlcidcbiAgICAgIGlmICgvXlwiLy50ZXN0KG1hdGNoKSlcbiAgICAgICAgaWYgKC86JC8udGVzdChtYXRjaCkpXG4gICAgICAgICAgY2xzID0gJ2tleSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNscyA9ICdzdHJpbmcnXG4gICAgICBlbHNlIGlmICgvdHJ1ZXxmYWxzZS8udGVzdChtYXRjaCkpXG4gICAgICAgIGNscyA9ICdib29sZWFuJ1xuICAgICAgZWxzZSBpZiAoL251bGwvLnRlc3QobWF0Y2gpKVxuICAgICAgICBjbHMgPSAnbnVsbCdcbiAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XCInICsgY2xzICsgJ1wiPicgKyBtYXRjaCArICc8L3NwYW4+J1xuXG4gIHVwZGF0ZTogPT5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlKFwiZGFzaGJvYXJkL2dyb3VwQnkvI3skKFwiI2dyb3VwQnlcIikudmFsKCl9L2Fzc2Vzc21lbnQvI3skKFwiI2Fzc2Vzc21lbnRcIikudmFsKCl9L3NoaWZ0SG91cnMvI3skKFwiI3NoaWZ0SG91cnNcIikudmFsKCl9XCIsIHRydWUpXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQGdyb3VwQnkgICAgPSBvcHRpb25zLmdyb3VwQnlcbiAgICBAa2V5ICAgICAgICA9IG9wdGlvbnMuYXNzZXNzbWVudFxuICAgIEBzaGlmdEhvdXJzID0gb3B0aW9ucy5zaGlmdEhvdXJzIHx8IDBcblxuXG4gIHJlbmRlcjogPT5cblxuICAgIGlmIEBrZXkgaXMgXCJBbGxcIlxuICAgICAgJC5jb3VjaC5kYihUYW5nZXJpbmUuZGJfbmFtZSkudmlldyBcIiN7VGFuZ2VyaW5lLmRlc2lnbl9kb2N9L2Rhc2hib2FyZFJlc3VsdHNcIixcbiAgICAgICAgcmVkdWNlOiBmYWxzZVxuICAgICAgICBzdWNjZXNzOiBAcmVuZGVyUmVzdWx0c1xuICAgIGVsc2VcbiAgICAgICQuY291Y2guZGIoVGFuZ2VyaW5lLmRiX25hbWUpLnZpZXcgXCIje1RhbmdlcmluZS5kZXNpZ25fZG9jfS9kYXNoYm9hcmRSZXN1bHRzXCIsXG4gICAgICAgIGtleTogQGtleVxuICAgICAgICByZWR1Y2U6IGZhbHNlXG4gICAgICAgIHN1Y2Nlc3M6IEByZW5kZXJSZXN1bHRzXG5cbiAgcmVuZGVyUmVzdWx0czogKHJlc3VsdCkgPT5cbiAgICB0YWJsZVJvd3MgPSB7fVxuICAgIGRhdGVzID0ge31cbiAgICBwcm9wZXJ0aWVzVG9Hcm91cEJ5ID0ge31cblxuICAgICMgRmluZCB0aGUgZmlyc3QgcG9zc2libGUgZ3JvdXBpbmcgdmFyaWFibGUgYW5kIHVzZSBpdCBpZiBub3QgZGVmaW5lZFxuICAgIEBncm91cEJ5ID0gXy5rZXlzKHJlc3VsdC5yb3dzWzBdLnZhbHVlKVswXSB1bmxlc3MgQGdyb3VwQnk/XG5cbiAgICBfLmVhY2ggcmVzdWx0LnJvd3MsIChyb3cpID0+XG4gICAgICBsZWZ0Q29sdW1uID0gcm93LnZhbHVlW0Bncm91cEJ5XVxuICAgICAgc29ydGluZ0RhdGUgPSBpZiByb3cudmFsdWUuc3RhcnRUaW1lIHRoZW4gbW9tZW50KHJvdy52YWx1ZS5zdGFydFRpbWUpLmFkZChcImhcIixAc2hpZnRIb3VycykuZm9ybWF0KFwiWVlZWU1NRERcIikgZWxzZSBcIlVua25vd25cIlxuICAgICAgZGlzcGxheURhdGUgPSBpZiByb3cudmFsdWUuc3RhcnRUaW1lIHRoZW4gbW9tZW50KHJvdy52YWx1ZS5zdGFydFRpbWUpLmFkZChcImhcIixAc2hpZnRIb3VycykuZm9ybWF0KFwiRG8gTU1NXCIpIGVsc2UgXCJVbmtub3duXCJcbiAgICAgIGRhdGVzW3NvcnRpbmdEYXRlXSA9IGRpc3BsYXlEYXRlXG4gICAgICB0YWJsZVJvd3NbbGVmdENvbHVtbl0gPSB7fSB1bmxlc3MgdGFibGVSb3dzW2xlZnRDb2x1bW5dP1xuICAgICAgdGFibGVSb3dzW2xlZnRDb2x1bW5dW3NvcnRpbmdEYXRlXSA9IFtdIHVubGVzcyB0YWJsZVJvd3NbbGVmdENvbHVtbl1bc29ydGluZ0RhdGVdP1xuICAgICAgdGFibGVSb3dzW2xlZnRDb2x1bW5dW3NvcnRpbmdEYXRlXS5wdXNoIFwiXG4gICAgICAgIDxkaXYgc3R5bGU9J3BhZGRpbmctdG9wOjEwcHg7Jz5cbiAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgI3tcbiAgICAgICAgICAgIF8ubWFwKHJvdy52YWx1ZSwgKHZhbHVlLGtleSkgPT5cbiAgICAgICAgICAgICAgcHJvcGVydGllc1RvR3JvdXBCeVtrZXldID0gdHJ1ZVxuICAgICAgICAgICAgICB2YWx1ZSA9IG1vbWVudCh2YWx1ZSkuYWRkKFwiaFwiLEBzaGlmdEhvdXJzKS5mb3JtYXQoXCJZWVlZLU1NLUREIEhIOm1tXCIpIGlmIGtleSBpcyBcInN0YXJ0VGltZVwiXG4gICAgICAgICAgICAgIHZhbHVlID0gXCI8YnV0dG9uIGNsYXNzPSdyZXN1bHQnPiN7dmFsdWV9PC9idXR0b24+XCIgaWYga2V5IGlzIFwicmVzdWx0SWRcIlxuICAgICAgICAgICAgICBcIjx0cj48dGQ+I3trZXl9PC90ZD48dGQ+I3t2YWx1ZX08L3RkPjwvdHI+XCJcbiAgICAgICAgICAgICkuam9pbihcIlwiKVxuICAgICAgICAgIH1cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGhyLz5cbiAgICAgIFwiXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8aDE+I3tUYW5nZXJpbmUuZGJfbmFtZX08L2gxPlxuICAgICAgQXNzZXNzbWVudDpcbiAgICAgIDxzZWxlY3QgaWQ9J2Fzc2Vzc21lbnQnPlxuICAgICAgPC9zZWxlY3Q+XG4gICAgICA8YnIvPlxuICAgICAgVmFsdWUgdXNlZCBmb3IgZ3JvdXBpbmc6XG4gICAgICA8c2VsZWN0IGlkPSdncm91cEJ5Jz5cbiAgICAgICAgI3tcbiAgICAgICAgICBfLm1hcCBwcm9wZXJ0aWVzVG9Hcm91cEJ5LCAodmFsdWUsa2V5KSA9PlxuICAgICAgICAgICAgXCI8b3B0aW9uICN7aWYga2V5IGlzIEBncm91cEJ5IHRoZW4gXCJzZWxlY3RlZD0ndHJ1ZSdcIiBlbHNlICcnfT5cbiAgICAgICAgICAgICAgI3trZXl9XG4gICAgICAgICAgICA8L29wdGlvbj5cIlxuICAgICAgICB9XG4gICAgICA8L3NlbGVjdD5cbiAgICAgIDxici8+XG4gICAgICA8YnIvPlxuICAgICAgPGJ1dHRvbiBvbkNsaWNrPSckKFxcXCIjYWR2YW5jZWRPcHRpb25zXFxcIikudG9nZ2xlKCknPkFkdmFuY2VkIE9wdGlvbnM8L2J1dHRvbj5cbiAgICAgIDxkaXYgc3R5bGU9J2Rpc3BsYXk6bm9uZScgaWQ9J2FkdmFuY2VkT3B0aW9ucyc+XG4gICAgICBDdXJyZW50IHRpbWUgaW4geW91ciB0aW1lem9uZSAoI3tqc3R6LmRldGVybWluZSgpLm5hbWUoKX0pIGlzICN7IG1vbWVudCgpLmZvcm1hdChcIllZWVktTU0tREQgSEg6bW1cIikgfTxici8+XG4gICAgICBTaGlmdCB0aW1lIHZhbHVlcyBieSA8aW5wdXQgaWQ9J3NoaWZ0SG91cnMnIHR5cGU9J251bWJlcicgdmFsdWU9JyN7QHNoaWZ0SG91cnN9Jz48L2lucHV0PiBob3VycyB0byBoYW5kbGUgY29ycmVjdCB0aW1lem9uZS48YnIvPlxuICAgICAgU2hpZnRlZCB0aW1lOiAjeyBtb21lbnQoKS5hZGQoXCJoXCIsQHNoaWZ0SG91cnMpLmZvcm1hdChcIllZWVktTU0tREQgSEg6bW1cIil9XG4gICAgICA8YnIvPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDx0YWJsZSBpZD0ncmVzdWx0cycgY2xhc3M9J3RhYmxlc29ydGVyJz5cbiAgICAgICAgPHRoZWFkPlxuICAgICAgICAgIDx0aD4je0Bncm91cEJ5fTwvdGg+XG4gICAgICAgICAgI3tcbiAgICAgICAgICAgIF8oZGF0ZXMpLmtleXMoKS5zb3J0KCkubWFwKCAoc29ydGluZ0RhdGUpIC0+XG4gICAgICAgICAgICAgIFwiPHRoIGNsYXNzPScje3NvcnRpbmdEYXRlfSc+I3tkYXRlc1tzb3J0aW5nRGF0ZV19PC90aD5cIlxuICAgICAgICAgICAgKS5qb2luKFwiXCIpXG4gICAgICAgICAgfVxuICAgICAgICA8L3RoZWFkPlxuICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgI3tcbiAgICAgICAgICAgIF8ubWFwKHRhYmxlUm93cywgKGRhdGFGb3JEYXRlcywgbGVmdENvbHVtbikgLT5cbiAgICAgICAgICAgICAgXCI8dHI+XG4gICAgICAgICAgICAgICAgPHRkPiN7bGVmdENvbHVtbn08L3RkPlxuICAgICAgICAgICAgICAgICN7XG4gICAgICAgICAgICAgICAgICBfKGRhdGVzKS5rZXlzKCkuc29ydCgpLm1hcCggKHNvcnRpbmdEYXRlKSAtPlxuICAgICAgICAgICAgICAgICAgICBcIjx0ZCBjbGFzcz0nI3tzb3J0aW5nRGF0ZX0nPlxuICAgICAgICAgICAgICAgICAgICAgICN7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBkYXRhRm9yRGF0ZXNbc29ydGluZ0RhdGVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nc29ydC12YWx1ZScgb25DbGljaz0nJCh0aGlzKS5zaWJsaW5ncygpLnRvZ2dsZSgpJz4je2RhdGFGb3JEYXRlc1tzb3J0aW5nRGF0ZV0ubGVuZ3RofTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9J2Rpc3BsYXk6bm9uZSc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAje2RhdGFGb3JEYXRlc1tzb3J0aW5nRGF0ZV0uam9pbihcIlwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcIlxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cIlxuICAgICAgICAgICAgICAgICAgKS5qb2luKFwiXCIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICA8L3RyPlwiXG4gICAgICAgICAgICApLmpvaW4oXCJcIilcbiAgICAgICAgICB9XG4gICAgICAgIDwvdGJvZHk+XG4gICAgICA8L3RhYmxlPlxuICAgICAgPGRpdiBpZD0ncmVzdWx0RGV0YWlscyc+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxzdHlsZT5cbiAgICAgICAgI3Jlc3VsdERldGFpbHN7XG4gICAgICAgICAgcG9zaXRpb246YWJzb2x1dGU7XG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjpibGFjaztcbiAgICAgICAgICBkaXNwbGF5Om5vbmU7XG4gICAgICAgIH1cbiAgICAgICAgcHJlIHtcbiAgICAgICAgICBmb250LXNpemU6IDc1JTtcbiAgICAgICAgICBvdXRsaW5lOiAxcHggc29saWQgI2NjYzsgXG4gICAgICAgICAgcGFkZGluZzogNXB4OyBcbiAgICAgICAgICBtYXJnaW46IDVweDsgXG4gICAgICAgICAgdGV4dC1zaGFkb3c6IG5vbmU7XG4gICAgICAgICAgb3ZlcmZsb3ctd3JhcDpicmVhay13b3JkO1xuICAgICAgICB9XG4gICAgICAgIC5zdHJpbmcgeyBjb2xvcjogZ3JlZW47IH1cbiAgICAgICAgLm51bWJlciB7IGNvbG9yOiBkYXJrb3JhbmdlOyB9XG4gICAgICAgIC5ib29sZWFuIHsgY29sb3I6IGJsdWU7IH1cbiAgICAgICAgLm51bGwgeyBjb2xvcjogbWFnZW50YTsgfVxuICAgICAgICAua2V5IHsgY29sb3I6IHJlZDsgfVxuICAgICAgPC9zdHlsZT5cbiAgICBcIlxuXG4gICAgQCRlbC5maW5kKFwidGFibGUjcmVzdWx0c1wiKS50YWJsZXNvcnRlclxuICAgICAgd2lkZ2V0czogWyd6ZWJyYSddXG4gICAgICBzb3J0TGlzdDogW1swLDBdXVxuwqDCoMKgwqDCoMKgdGV4dEV4dHJhY3Rpb246IChub2RlKSAtPlxuICAgICAgICBzb3J0VmFsdWUgPSAkKG5vZGUpLmZpbmQoXCIuc29ydC12YWx1ZVwiKS50ZXh0KClcbiAgICAgICAgaWYgc29ydFZhbHVlICE9IFwiXCJcbiAgICAgICAgICBzb3J0VmFsdWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICQobm9kZSkudGV4dCgpXG5cbiAgICBAJGVsLmZpbmQoXCIjYWR2YW5jZWRPcHRpb25zXCIpLmFwcGVuZCBcIlNlbGVjdCB3aGljaCBkYXRlcyB0byBzaG93PGJyLz5cIlxuICAgIF8oZGF0ZXMpLmtleXMoKS5zb3J0KCkubWFwKCAoc29ydGluZ0RhdGUpID0+XG4gICAgICBkaXNwbGF5RGF0ZSA9IGRhdGVzW3NvcnRpbmdEYXRlXVxuICAgICAgZGF0ZUNoZWNrYm94ID0gJChcIjxsYWJlbCBmb3I9JyN7c29ydGluZ0RhdGV9Jz4je2Rpc3BsYXlEYXRlfTwvbGFiZWw+PGlucHV0IG5hbWU9JyN7c29ydGluZ0RhdGV9JyBpZD0nI3tzb3J0aW5nRGF0ZX0nIHR5cGU9J2NoZWNrYm94JyBjaGVja2VkPSd0cnVlJy8+XCIpXG4gICAgICBkYXRlQ2hlY2tib3guY2xpY2sgLT5cbiAgICAgICAgJChcIi4je3NvcnRpbmdEYXRlfVwiKS50b2dnbGUoKVxuICAgICAgQCRlbC5maW5kKFwiI2FkdmFuY2VkT3B0aW9uc1wiKS5hcHBlbmQgZGF0ZUNoZWNrYm94XG4gICAgKVxuXG4gICAgJC5jb3VjaC5kYihUYW5nZXJpbmUuZGJfbmFtZSkudmlldyBcIiN7VGFuZ2VyaW5lLmRlc2lnbl9kb2N9L2Rhc2hib2FyZFJlc3VsdHNcIixcbiAgICAgIGdyb3VwOiB0cnVlXG4gICAgICBzdWNjZXNzOiAocmVzdWx0KSA9PlxuICAgICAgICAkKFwic2VsZWN0I2Fzc2Vzc21lbnRcIikuaHRtbCBcIjxvcHRpb24+QWxsPC9vcHRpb24+XCIgK1xuICAgICAgICBfLm1hcChyZXN1bHQucm93cywgKHJvdykgPT5cbiAgICAgICAgICBcIjxvcHRpb24gdmFsdWU9JyN7cm93LmtleX0nICN7aWYgcm93LmtleSBpcyBAa2V5IHRoZW4gXCJzZWxlY3RlZD0ndHJ1ZSdcIiBlbHNlIFwiXCJ9PiN7cm93LmtleX08L29wdGlvbj5cIlxuICAgICAgICApLmpvaW4oXCJcIilcbiAgICAgICAgXy5lYWNoIHJlc3VsdC5yb3dzLCAocm93KSA9PlxuICAgICAgICAgIHJldHVybiB1bmxlc3Mgcm93LmtleT9cbiAgICAgICAgICAkLmNvdWNoLmRiKFRhbmdlcmluZS5kYl9uYW1lKS5vcGVuRG9jIHJvdy5rZXksXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzdWx0KSA9PlxuICAgICAgICAgICAgICAkKFwib3B0aW9uW3ZhbHVlPSN7cm93LmtleX1dXCIpLmh0bWwgcmVzdWx0Lm5hbWVcbiAgICAgICAgICAgIGVycm9yOiAocmVzdWx0KSA9PlxuICAgICAgICAgICAgICAkKFwib3B0aW9uW3ZhbHVlPSN7cm93LmtleX1dXCIpLmh0bWwgXCJVbmtub3duIGFzc2Vzc21lbnRcIlxuXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiJdfQ==

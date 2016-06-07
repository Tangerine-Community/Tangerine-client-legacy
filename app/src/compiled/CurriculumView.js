var CurriculumView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CurriculumView = (function(superClass) {
  extend(CurriculumView, superClass);

  function CurriculumView() {
    return CurriculumView.__super__.constructor.apply(this, arguments);
  }

  CurriculumView.prototype.className = "CurriculumView";

  CurriculumView.prototype.events = {
    "click .back": "goBack",
    "click .delete": "deleteCurriculum",
    "click .delete_subtest": "deleteSubtest",
    "click .edit_in_place": "editInPlace",
    'click .new_subtest': "newSubtest",
    "focusout .editing": "editing",
    "keyup    .editing": "editing",
    "keydown  .editing": "editing"
  };

  CurriculumView.prototype.initialize = function(options) {
    this.curriculum = options.curriculum;
    this.subtests = options.subtests;
    this.questions = options.questions;
    this.questionsBySubtestId = this.questions.indexBy("subtestId");
    this.totalAssessments = Math.max.apply(Math, this.subtests.pluck("part"));
    this.subtestsByPart = this.subtests.indexArrayBy("part");
    return this.subtestProperties = {
      "grid": [
        {
          "key": "part",
          "label": "Assessment",
          "editable": true
        }, {
          "key": "name",
          "label": "Name",
          "editable": true,
          "escaped": true
        }, {
          "key": "timer",
          "label": "Time<br>allowed",
          "editable": true
        }, {
          "key": "reportType",
          "label": "Report",
          "editable": true
        }, {
          "key": "items",
          "label": "Items",
          "count": true,
          "editable": true
        }
      ],
      "survey": [
        {
          "key": "part",
          "label": "Assessment",
          "editable": true
        }, {
          "key": "name",
          "label": "Name",
          "editable": true
        }, {
          "key": "reportType",
          "label": "Report",
          "editable": true
        }
      ]
    };
  };

  CurriculumView.prototype.render = function() {
    var deleteButton, html, newButtons, subtestTable;
    subtestTable = this.getSubtestTable();
    deleteButton = Tangerine.settings.get("context") === "server" ? "<button class='command_red delete'>Delete</button>" : "";
    if (Tangerine.settings.get("context") === "server") {
      newButtons = "<button class='command new_subtest' data-prototype='grid'>New Grid Subtest</button><br> <button class='command new_subtest' data-prototype='survey'>New Survey Subtest</button>";
    }
    html = "<button class='navigation back'>" + (t('back')) + "</button> <h1>" + (this.curriculum.get('name')) + "</h1> <div class='small_grey'>Download key <b>" + (this.curriculum.id.substr(-5, 5)) + "</b></div> <div id='subtest_table_container'> " + subtestTable + " </div> " + (newButtons || "") + " <br><br> " + deleteButton;
    this.$el.html(html);
    return this.trigger("rendered");
  };

  CurriculumView.prototype.updateTable = function() {
    return this.$el.find("#subtest_table_container").html(this.getSubtestTable());
  };

  CurriculumView.prototype.getSubtestTable = function() {
    var bodyHtml, headerHtml, html, i, items, j, len, len1, part, prompts, prop, question, ref, ref1, subtest, subtests;
    html = "<table class='subtests'>";
    html += "<tbody>";
    this.subtestsByPart = this.subtests.indexArrayBy("part");
    ref = this.subtestsByPart;
    for (part in ref) {
      subtests = ref[part];
      html += "<tr><td>&nbsp;</td></tr>";
      for (i = 0, len = subtests.length; i < len; i++) {
        subtest = subtests[i];
        headerHtml = bodyHtml = "";
        ref1 = this.subtestProperties[subtest.get("prototype")];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          prop = ref1[j];
          headerHtml += "<th>" + prop.label + "</th>";
          bodyHtml += this.propCook(prop, subtest);
        }
        html += "<tr>" + headerHtml + "</tr>";
        html += "<tr>" + bodyHtml;
        if (Tangerine.settings.get("context") === "server") {
          html += "<td> <a href='#class/subtest/" + subtest.id + "'><img class='link_icon edit' title='Edit' src='images/icon_edit.png'></a> <img class='link_icon delete_subtest' title='Delete' data-subtestId='" + subtest.id + "' src='images/icon_delete.png'> <a href='#class/run/test/" + subtest.id + "'><img class='link_icon testRun' title='Test run' src='images/icon_run.png'></a> </td> </tr>";
        }
        if (subtest.get("prototype") === "grid") {
          items = subtest.get("items").join(" ");
          html += "<tr><td colspan='" + this.subtestProperties['grid'].length + "'>" + items + "</td></tr>";
        }
        if (subtest.get("prototype") === "survey" && (this.questionsBySubtestId[subtest.id] != null)) {
          prompts = ((function() {
            var k, len2, ref2, results;
            ref2 = this.questionsBySubtestId[subtest.id];
            results = [];
            for (k = 0, len2 = ref2.length; k < len2; k++) {
              question = ref2[k];
              results.push(question.get("prompt"));
            }
            return results;
          }).call(this)).join(", ");
          html += "<tr><td colspan='" + this.subtestProperties['survey'].length + "'>" + prompts + "</td></tr>";
        }
      }
    }
    html += "</tbody> </table>";
    return html;
  };

  CurriculumView.prototype.propCook = function(prop, subtest) {
    var editOrNot, numberOrNot, value;
    value = prop.key != null ? subtest.get(prop.key) : "&nbsp;";
    value = prop.escape ? subtest.escape(prop.key) : value;
    if (prop.count != null) {
      value = value.length;
    }
    if (value == null) {
      value = "";
    }
    editOrNot = prop.editable && Tangerine.settings.get("context") === "server" ? "class='edit_in_place'" : "";
    numberOrNot = _.isNumber(value) ? "data-isNumber='true'" : "data-isNumber='false'";
    return "<td class='edit_in_place'><span data-subtestId='" + subtest.id + "' data-key='" + prop.key + "' data-value='" + value + "' " + editOrNot + " " + numberOrNot + ">" + value + "</div></td>";
  };

  CurriculumView.prototype.editInPlace = function(event) {
    var $span, $target, $td, $textarea, classes, guid, isNumber, key, margins, oldValue, subtest, subtestId, transferVariables;
    if (this.alreadyEditing) {
      return;
    }
    this.alreadyEditing = true;
    $span = $(event.target);
    if ($span.prop("tagName") === "TD") {
      $span = $span.find("span");
      if ($span.length === 0) {
        return;
      }
    }
    $td = $span.parent();
    this.$oldSpan = $span.clone();
    if ($span.prop("tagName") === "TEXTAREA") {
      return;
    }
    guid = Utils.guid();
    key = $span.attr("data-key");
    isNumber = $span.attr("data-isNumber") === "true";
    subtestId = $span.attr("data-subtestId");
    subtest = this.subtests.get(subtestId);
    oldValue = subtest.get(key);
    $target = $(event.target);
    classes = ($target.attr("class") || "").replace("settings", "");
    margins = $target.css("margin");
    if (key === 'items') {
      oldValue = oldValue.join(" ");
    }
    transferVariables = "data-isNumber='" + isNumber + "' data-key='" + key + "' data-subtestId='" + subtestId + "' ";
    $td.html("<textarea id='" + guid + "' " + transferVariables + " class='editing " + classes + "' style='margin:" + margins + "'>" + oldValue + "</textarea>");
    $textarea = $("#" + guid);
    return $textarea.focus();
  };

  CurriculumView.prototype.editing = function(event) {
    var $target, $td, attributes, isNumber, key, newValue, oldValue, subtest, subtestId;
    $target = $(event.target);
    $td = $target.parent();
    if (event.which === 27 || event.type === "focusout") {
      $target.remove();
      $td.html(this.$oldSpan);
      this.alreadyEditing = false;
      return;
    }
    if (!(event.which === 13 && event.type === "keydown")) {
      return true;
    }
    this.alreadyEditing = false;
    key = $target.attr("data-key");
    isNumber = $target.attr("data-isNumber") === "true";
    subtestId = $target.attr("data-subtestId");
    subtest = this.subtests.get(subtestId);
    oldValue = subtest.get(key);
    newValue = $target.val();
    newValue = isNumber ? parseInt(newValue) : newValue;
    if (key === "items") {
      newValue = newValue.replace(/\s+/g, ' ');
      if (/\t|,/.test(newValue)) {
        alert("Please remember\n\nGrid items are space \" \" delimited");
      }
      newValue = _.compact(newValue.split(" "));
    }
    if (String(newValue) !== String(oldValue)) {
      attributes = {};
      attributes[key] = newValue;
      subtest.save(attributes, {
        success: (function(_this) {
          return function() {
            Utils.midAlert("Subtest saved");
            return subtest.fetch({
              success: function() {
                return _this.updateTable();
              }
            });
          };
        })(this),
        error: (function(_this) {
          return function() {
            return subtest.fetch({
              success: function() {
                _this.updateTable();
                return alert("Please try to save again, it didn't work that time.");
              }
            });
          };
        })(this)
      });
    }
    return false;
  };

  CurriculumView.prototype.goBack = function() {
    if (Tangerine.settings.get("context") === "server") {
      return Tangerine.router.navigate("assessments", true);
    } else if (Tangerine.settings.get("context") === "class") {
      return Tangerine.router.navigate("class", true);
    }
  };

  CurriculumView.prototype.deleteCurriculum = function() {
    if (confirm("Delete curriculum\n" + (this.curriculum.get('name')) + "?")) {
      return this.curriculum.destroy((function(_this) {
        return function() {
          return Tangerine.router.navigate("assessments", true);
        };
      })(this));
    }
  };

  CurriculumView.prototype.newSubtest = function(event) {
    var guid, protoTemps, prototype, subtest, subtestAttributes;
    prototype = $(event.target).attr("data-prototype");
    guid = Utils.guid();
    subtestAttributes = {
      "_id": guid,
      "curriculumId": this.curriculum.id,
      "prototype": prototype,
      "captureLastAttempted": false,
      "endOfLine": false
    };
    protoTemps = Tangerine.templates.get("prototypes");
    subtestAttributes = $.extend(protoTemps[prototype], subtestAttributes);
    subtest = new Subtest(subtestAttributes);
    return subtest.save(null, {
      success: function() {
        return Tangerine.router.navigate("class/subtest/" + guid, true);
      },
      error: function() {
        return alert("Please try again. There was a problem creating the new subtest.");
      }
    });
  };

  CurriculumView.prototype.deleteSubtest = function(event) {
    var subtest, subtestId;
    subtestId = $(event.target).attr("data-subtestId");
    subtest = this.subtests.get(subtestId);
    if (confirm("Delete subtest\n" + (subtest.get('name')) + "?")) {
      return subtest.destroy({
        success: (function(_this) {
          return function() {
            _this.subtests.remove(subtestId);
            return _this.updateTable();
          };
        })(this),
        error: (function(_this) {
          return function() {
            return alert("Please try again, could not delete subtest.");
          };
        })(this)
      });
    }
  };

  return CurriculumView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvY3VycmljdWx1bS9DdXJyaWN1bHVtVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsSUFBQSxjQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzJCQUVKLFNBQUEsR0FBVzs7MkJBRVgsTUFBQSxHQUNFO0lBQUEsYUFBQSxFQUEwQixRQUExQjtJQUNBLGVBQUEsRUFBMEIsa0JBRDFCO0lBRUEsdUJBQUEsRUFBMEIsZUFGMUI7SUFHQSxzQkFBQSxFQUEwQixhQUgxQjtJQUlBLG9CQUFBLEVBQTBCLFlBSjFCO0lBTUEsbUJBQUEsRUFBc0IsU0FOdEI7SUFPQSxtQkFBQSxFQUFzQixTQVB0QjtJQVFBLG1CQUFBLEVBQXNCLFNBUnRCOzs7MkJBVUYsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUdWLElBQUMsQ0FBQSxVQUFELEdBQWMsT0FBTyxDQUFDO0lBQ3RCLElBQUMsQ0FBQSxRQUFELEdBQWMsT0FBTyxDQUFDO0lBQ3RCLElBQUMsQ0FBQSxTQUFELEdBQWMsT0FBTyxDQUFDO0lBQ3RCLElBQUMsQ0FBQSxvQkFBRCxHQUF3QixJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBbUIsV0FBbkI7SUFHeEIsSUFBQyxDQUFBLGdCQUFELEdBQXFCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBVCxDQUFlLElBQWYsRUFBcUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQWdCLE1BQWhCLENBQXJCO0lBQ3JCLElBQUMsQ0FBQSxjQUFELEdBQXFCLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixNQUF2QjtXQUNyQixJQUFDLENBQUEsaUJBQUQsR0FDRTtNQUFBLE1BQUEsRUFBUztRQUNQO1VBQ0UsS0FBQSxFQUFhLE1BRGY7VUFFRSxPQUFBLEVBQWEsWUFGZjtVQUdFLFVBQUEsRUFBYSxJQUhmO1NBRE8sRUFNUDtVQUNFLEtBQUEsRUFBYSxNQURmO1VBRUUsT0FBQSxFQUFhLE1BRmY7VUFHRSxVQUFBLEVBQWEsSUFIZjtVQUlFLFNB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QUMsR0FBUixDQUFZLE1BQVosQ0FBRCxDQUFsQixHQUF1QyxHQUEvQyxDQUFIO2FBQ0UsT0FBTyxDQUFDLE9BQVIsQ0FDRTtRQUFBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO1lBQ1AsS0FBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLFNBQWpCO21CQUNBLEtBQUMsQ0FBQSxXQUFELENBQUE7VUFGTztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtRQUdBLEtBQUEsRUFBTyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNMLEtBQUEsQ0FBTSw2Q0FBTjtVQURLO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhQO09BREYsRUFERjs7RUFIYTs7OztHQW5UWSxRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9jdXJyaWN1bHVtL0N1cnJpY3VsdW1WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyBIYXJyeSBQb3R0ZXJcbmNsYXNzIEN1cnJpY3VsdW1WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJDdXJyaWN1bHVtVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgIFwiY2xpY2sgLmJhY2tcIiAgICAgICAgICAgOiBcImdvQmFja1wiXG4gICAgXCJjbGljayAuZGVsZXRlXCIgICAgICAgICA6IFwiZGVsZXRlQ3VycmljdWx1bVwiXG4gICAgXCJjbGljayAuZGVsZXRlX3N1YnRlc3RcIiA6IFwiZGVsZXRlU3VidGVzdFwiXG4gICAgXCJjbGljayAuZWRpdF9pbl9wbGFjZVwiICA6IFwiZWRpdEluUGxhY2VcIlxuICAgICdjbGljayAubmV3X3N1YnRlc3QnICAgIDogXCJuZXdTdWJ0ZXN0XCJcblxuICAgIFwiZm9jdXNvdXQgLmVkaXRpbmdcIiA6IFwiZWRpdGluZ1wiXG4gICAgXCJrZXl1cCAgICAuZWRpdGluZ1wiIDogXCJlZGl0aW5nXCJcbiAgICBcImtleWRvd24gIC5lZGl0aW5nXCIgOiBcImVkaXRpbmdcIlxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgIyBhcmd1bWVudHNcbiAgICBAY3VycmljdWx1bSA9IG9wdGlvbnMuY3VycmljdWx1bVxuICAgIEBzdWJ0ZXN0cyAgID0gb3B0aW9ucy5zdWJ0ZXN0c1xuICAgIEBxdWVzdGlvbnMgID0gb3B0aW9ucy5xdWVzdGlvbnNcbiAgICBAcXVlc3Rpb25zQnlTdWJ0ZXN0SWQgPSBAcXVlc3Rpb25zLmluZGV4QnkgXCJzdWJ0ZXN0SWRcIlxuXG4gICAgIyBwcmltYXJpZXNcbiAgICBAdG90YWxBc3Nlc3NtZW50cyAgPSBNYXRoLm1heC5hcHBseSBNYXRoLCBAc3VidGVzdHMucGx1Y2soXCJwYXJ0XCIpXG4gICAgQHN1YnRlc3RzQnlQYXJ0ICAgID0gQHN1YnRlc3RzLmluZGV4QXJyYXlCeSBcInBhcnRcIlxuICAgIEBzdWJ0ZXN0UHJvcGVydGllcyA9IFxuICAgICAgXCJncmlkXCIgOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImtleVwiICAgICAgOiBcInBhcnRcIlxuICAgICAgICAgIFwibGFiZWxcIiAgICA6IFwiQXNzZXNzbWVudFwiXG4gICAgICAgICAgXCJlZGl0YWJsZVwiIDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJrZXlcIiAgICAgIDogXCJuYW1lXCJcbiAgICAgICAgICBcImxhYmVsXCIgICAgOiBcIk5hbWVcIlxuICAgICAgICAgIFwiZWRpdGFibGVcIiA6IHRydWVcbiAgICAgICAgICBcImVzY2FwZWRcIiAgOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImtleVwiICAgICAgOiBcInRpbWVyXCJcbiAgICAgICAgICBcImxhYmVsXCIgICAgOiBcIlRpbWU8YnI+YWxsb3dlZFwiXG4gICAgICAgICAgXCJlZGl0YWJsZVwiIDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJrZXlcIiAgICAgIDogXCJyZXBvcnRUeXBlXCJcbiAgICAgICAgICBcImxhYmVsXCIgICAgOiBcIlJlcG9ydFwiXG4gICAgICAgICAgXCJlZGl0YWJsZVwiIDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJrZXlcIiAgICAgIDogXCJpdGVtc1wiXG4gICAgICAgICAgXCJsYWJlbFwiICAgIDogXCJJdGVtc1wiXG4gICAgICAgICAgXCJjb3VudFwiICAgIDogdHJ1ZVxuICAgICAgICAgIFwiZWRpdGFibGVcIiA6IHRydWVcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFwic3VydmV5XCIgOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImtleVwiIDogXCJwYXJ0XCJcbiAgICAgICAgICBcImxhYmVsXCIgOiBcIkFzc2Vzc21lbnRcIlxuICAgICAgICAgIFwiZWRpdGFibGVcIiA6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwia2V5XCIgOiBcIm5hbWVcIlxuICAgICAgICAgIFwibGFiZWxcIiA6IFwiTmFtZVwiXG4gICAgICAgICAgXCJlZGl0YWJsZVwiIDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJrZXlcIiAgICAgIDogXCJyZXBvcnRUeXBlXCJcbiAgICAgICAgICBcImxhYmVsXCIgICAgOiBcIlJlcG9ydFwiXG4gICAgICAgICAgXCJlZGl0YWJsZVwiIDogdHJ1ZVxuICAgICAgICB9XG4gICAgICBdXG5cblxuICByZW5kZXI6IC0+XG5cbiAgICBzdWJ0ZXN0VGFibGUgPSBAZ2V0U3VidGVzdFRhYmxlKClcblxuICAgIGRlbGV0ZUJ1dHRvbiA9IGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpID09IFwic2VydmVyXCIgdGhlbiBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmRfcmVkIGRlbGV0ZSc+RGVsZXRlPC9idXR0b24+XCIgZWxzZSBcIlwiXG5cbiAgICBuZXdCdXR0b25zID0gXCJcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBuZXdfc3VidGVzdCcgZGF0YS1wcm90b3R5cGU9J2dyaWQnPk5ldyBHcmlkIFN1YnRlc3Q8L2J1dHRvbj48YnI+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQgbmV3X3N1YnRlc3QnIGRhdGEtcHJvdG90eXBlPSdzdXJ2ZXknPk5ldyBTdXJ2ZXkgU3VidGVzdDwvYnV0dG9uPlxuICAgIFwiIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpID09IFwic2VydmVyXCJcblxuICAgIGh0bWwgPSBcIlxuXG4gICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIGJhY2snPiN7dCgnYmFjaycpfTwvYnV0dG9uPlxuICAgICAgPGgxPiN7QGN1cnJpY3VsdW0uZ2V0KCduYW1lJyl9PC9oMT5cblxuICAgICAgPGRpdiBjbGFzcz0nc21hbGxfZ3JleSc+RG93bmxvYWQga2V5IDxiPiN7QGN1cnJpY3VsdW0uaWQuc3Vic3RyKC01LDUpfTwvYj48L2Rpdj5cbiAgICAgIFxuICAgICAgPGRpdiBpZD0nc3VidGVzdF90YWJsZV9jb250YWluZXInPlxuICAgICAgICAje3N1YnRlc3RUYWJsZX1cbiAgICAgIDwvZGl2PlxuXG4gICAgICAje25ld0J1dHRvbnMgfHwgXCJcIn1cbiAgICAgIDxicj48YnI+XG5cbiAgICAgICN7ZGVsZXRlQnV0dG9ufVxuXG4gICAgXCJcblxuICAgIEAkZWwuaHRtbCBodG1sXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgdXBkYXRlVGFibGU6IC0+IEAkZWwuZmluZChcIiNzdWJ0ZXN0X3RhYmxlX2NvbnRhaW5lclwiKS5odG1sIEBnZXRTdWJ0ZXN0VGFibGUoKVxuXG4gIGdldFN1YnRlc3RUYWJsZTogLT5cblxuICAgIGh0bWwgPSBcIjx0YWJsZSBjbGFzcz0nc3VidGVzdHMnPlwiXG5cbiAgICBodG1sICs9IFwiXG4gICAgICA8dGJvZHk+XG4gICAgXCJcbiAgICBAc3VidGVzdHNCeVBhcnQgPSBAc3VidGVzdHMuaW5kZXhBcnJheUJ5IFwicGFydFwiXG4gICAgZm9yIHBhcnQsIHN1YnRlc3RzIG9mIEBzdWJ0ZXN0c0J5UGFydFxuICAgICAgaHRtbCArPSBcIjx0cj48dGQ+Jm5ic3A7PC90ZD48L3RyPlwiXG4gICAgICBmb3Igc3VidGVzdCBpbiBzdWJ0ZXN0c1xuICAgICAgICBoZWFkZXJIdG1sID0gYm9keUh0bWwgPSBcIlwiXG5cbiAgICAgICAgZm9yIHByb3AgaW4gQHN1YnRlc3RQcm9wZXJ0aWVzW3N1YnRlc3QuZ2V0KFwicHJvdG90eXBlXCIpXVxuICAgICAgICAgIGhlYWRlckh0bWwgKz0gXCI8dGg+I3twcm9wLmxhYmVsfTwvdGg+XCJcbiAgICAgICAgICBib2R5SHRtbCArPSBAcHJvcENvb2socHJvcCwgc3VidGVzdClcblxuICAgICAgICBodG1sICs9IFwiPHRyPiN7aGVhZGVySHRtbH08L3RyPlwiXG4gICAgICAgIGh0bWwgKz0gXCI8dHI+I3tib2R5SHRtbH1cIlxuXG5cbiAgICAgICAgIyBhZGQgYnV0dG9ucyBmb3Igc2VydmVyc2lkZSBlZGl0aW5nXG4gICAgICAgIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpID09IFwic2VydmVyXCJcbiAgICAgICAgICBodG1sICs9IFwiXG4gICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgIDxhIGhyZWY9JyNjbGFzcy9zdWJ0ZXN0LyN7c3VidGVzdC5pZH0nPjxpbWcgY2xhc3M9J2xpbmtfaWNvbiBlZGl0JyB0aXRsZT0nRWRpdCcgc3JjPSdpbWFnZXMvaWNvbl9lZGl0LnBuZyc+PC9hPlxuICAgICAgICAgICAgICA8aW1nIGNsYXNzPSdsaW5rX2ljb24gZGVsZXRlX3N1YnRlc3QnIHRpdGxlPSdEZWxldGUnIGRhdGEtc3VidGVzdElkPScje3N1YnRlc3QuaWR9JyBzcmM9J2ltYWdlcy9pY29uX2RlbGV0ZS5wbmcnPlxuICAgICAgICAgICAgICA8YSBocmVmPScjY2xhc3MvcnVuL3Rlc3QvI3tzdWJ0ZXN0LmlkfSc+PGltZyBjbGFzcz0nbGlua19pY29uIHRlc3RSdW4nIHRpdGxlPSdUZXN0IHJ1bicgc3JjPSdpbWFnZXMvaWNvbl9ydW4ucG5nJz48L2E+XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgXCJcblxuICAgICAgICAjIHF1aWNrIHByZXZpZXdzIG9mIHN1YnRlc3QgY29udGVudHNcbiAgICAgICAgaWYgc3VidGVzdC5nZXQoXCJwcm90b3R5cGVcIikgPT0gXCJncmlkXCJcbiAgICAgICAgICBpdGVtcyA9IHN1YnRlc3QuZ2V0KFwiaXRlbXNcIikuam9pbiBcIiBcIlxuICAgICAgICAgIGh0bWwgKz0gXCI8dHI+PHRkIGNvbHNwYW49JyN7QHN1YnRlc3RQcm9wZXJ0aWVzWydncmlkJ10ubGVuZ3RofSc+I3tpdGVtc308L3RkPjwvdHI+XCJcbiAgICAgICAgXG4gICAgICAgIGlmIHN1YnRlc3QuZ2V0KFwicHJvdG90eXBlXCIpID09IFwic3VydmV5XCIgJiYgQHF1ZXN0aW9uc0J5U3VidGVzdElkW3N1YnRlc3QuaWRdP1xuICAgICAgICAgIHByb21wdHMgPSAocXVlc3Rpb24uZ2V0KFwicHJvbXB0XCIpIGZvciBxdWVzdGlvbiBpbiBAcXVlc3Rpb25zQnlTdWJ0ZXN0SWRbc3VidGVzdC5pZF0pLmpvaW4oXCIsIFwiKVxuICAgICAgICAgIGh0bWwgKz0gXCI8dHI+PHRkIGNvbHNwYW49JyN7QHN1YnRlc3RQcm9wZXJ0aWVzWydzdXJ2ZXknXS5sZW5ndGh9Jz4je3Byb21wdHN9PC90ZD48L3RyPlwiXG5cblxuICAgIGh0bWwgKz0gXCJcbiAgICAgIDwvdGJvZHk+XG4gICAgPC90YWJsZT5cbiAgICBcIlxuXG4gICAgcmV0dXJuIGh0bWxcblxuICBwcm9wQ29vazogKHByb3AsIHN1YnRlc3QpLT5cblxuICAgICMgY29vayB0aGUgdmFsdWVcbiAgICB2YWx1ZSA9IGlmIHByb3Aua2V5PyAgIHRoZW4gc3VidGVzdC5nZXQocHJvcC5rZXkpICAgIGVsc2UgXCImbmJzcDtcIlxuICAgIHZhbHVlID0gaWYgcHJvcC5lc2NhcGUgdGhlbiBzdWJ0ZXN0LmVzY2FwZShwcm9wLmtleSkgZWxzZSB2YWx1ZVxuICAgIHZhbHVlID0gdmFsdWUubGVuZ3RoIGlmIHByb3AuY291bnQ/XG4gICAgdmFsdWUgPSBcIlwiIGlmIG5vdCB2YWx1ZT9cblxuICAgICMgd2hhdCBpcyBpdFxuICAgIGVkaXRPck5vdCAgID0gaWYgcHJvcC5lZGl0YWJsZSAmJiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiY29udGV4dFwiKSA9PSBcInNlcnZlclwiIHRoZW4gXCJjbGFzcz0nZWRpdF9pbl9wbGFjZSdcIiBlbHNlIFwiXCJcblxuICAgIG51bWJlck9yTm90ID0gaWYgXy5pc051bWJlcih2YWx1ZSkgdGhlbiBcImRhdGEtaXNOdW1iZXI9J3RydWUnXCIgZWxzZSBcImRhdGEtaXNOdW1iZXI9J2ZhbHNlJ1wiIFxuXG4gICAgcmV0dXJuIFwiPHRkIGNsYXNzPSdlZGl0X2luX3BsYWNlJz48c3BhbiBkYXRhLXN1YnRlc3RJZD0nI3tzdWJ0ZXN0LmlkfScgZGF0YS1rZXk9JyN7cHJvcC5rZXl9JyBkYXRhLXZhbHVlPScje3ZhbHVlfScgI3tlZGl0T3JOb3R9ICN7bnVtYmVyT3JOb3R9PiN7dmFsdWV9PC9kaXY+PC90ZD5cIlxuXG5cbiAgZWRpdEluUGxhY2U6IChldmVudCkgLT5cblxuICAgIHJldHVybiBpZiBAYWxyZWFkeUVkaXRpbmdcbiAgICBAYWxyZWFkeUVkaXRpbmcgPSB0cnVlXG5cbiAgICAjIHNhdmUgc3RhdGVcbiAgICAjIHJlcGxhY2Ugd2l0aCB0ZXh0IGFyZWFcbiAgICAjIG9uIHNhdmUsIHNhdmUgYW5kIHJlLXJlcGxhY2VcbiAgICAkc3BhbiA9ICQoZXZlbnQudGFyZ2V0KVxuXG4gICAgaWYgJHNwYW4ucHJvcChcInRhZ05hbWVcIikgPT0gXCJURFwiXG4gICAgICAkc3BhbiA9ICRzcGFuLmZpbmQoXCJzcGFuXCIpXG4gICAgICByZXR1cm4gaWYgJHNwYW4ubGVuZ3RoID09IDBcbiAgICAkdGQgID0gJHNwYW4ucGFyZW50KClcblxuICAgIEAkb2xkU3BhbiA9ICRzcGFuLmNsb25lKClcblxuICAgIHJldHVybiBpZiAkc3Bhbi5wcm9wKFwidGFnTmFtZVwiKSA9PSBcIlRFWFRBUkVBXCJcblxuICAgIGd1aWQgICAgICAgICA9IFV0aWxzLmd1aWQoKVxuXG4gICAga2V5ICAgICAgICAgID0gJHNwYW4uYXR0cihcImRhdGEta2V5XCIpXG4gICAgaXNOdW1iZXIgICAgID0gJHNwYW4uYXR0cihcImRhdGEtaXNOdW1iZXJcIikgPT0gXCJ0cnVlXCJcblxuICAgIHN1YnRlc3RJZCAgICA9ICRzcGFuLmF0dHIoXCJkYXRhLXN1YnRlc3RJZFwiKVxuICAgIHN1YnRlc3QgICAgICA9IEBzdWJ0ZXN0cy5nZXQoc3VidGVzdElkKVxuICAgIG9sZFZhbHVlICAgICA9IHN1YnRlc3QuZ2V0KGtleSlcblxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBjbGFzc2VzID0gKCR0YXJnZXQuYXR0cihcImNsYXNzXCIpIHx8IFwiXCIpLnJlcGxhY2UoXCJzZXR0aW5nc1wiLFwiXCIpXG4gICAgbWFyZ2lucyA9ICR0YXJnZXQuY3NzKFwibWFyZ2luXCIpXG5cbiAgICAjc3BlY2lhbCBjYXNlXG4gICAgb2xkVmFsdWUgPSBvbGRWYWx1ZS5qb2luIFwiIFwiIGlmIGtleSA9PSAnaXRlbXMnXG5cbiAgICB0cmFuc2ZlclZhcmlhYmxlcyA9IFwiZGF0YS1pc051bWJlcj0nI3tpc051bWJlcn0nIGRhdGEta2V5PScje2tleX0nIGRhdGEtc3VidGVzdElkPScje3N1YnRlc3RJZH0nIFwiXG5cbiAgICAjIHNldHMgd2lkdGgvaGVpZ2h0IHdpdGggc3R5bGUgYXR0cmlidXRlXG4gICAgJHRkLmh0bWwoXCI8dGV4dGFyZWEgaWQ9JyN7Z3VpZH0nICN7dHJhbnNmZXJWYXJpYWJsZXN9IGNsYXNzPSdlZGl0aW5nICN7Y2xhc3Nlc30nIHN0eWxlPSdtYXJnaW46I3ttYXJnaW5zfSc+I3tvbGRWYWx1ZX08L3RleHRhcmVhPlwiKVxuICAgICMgc3R5bGU9J3dpZHRoOiN7b2xkV2lkdGh9cHg7IGhlaWdodDogI3tvbGRIZWlnaHR9cHg7J1xuICAgICR0ZXh0YXJlYSA9ICQoXCIjI3tndWlkfVwiKVxuICAgICR0ZXh0YXJlYS5mb2N1cygpXG5cbiAgZWRpdGluZzogKGV2ZW50KSAtPlxuXG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgICR0ZCA9ICR0YXJnZXQucGFyZW50KClcblxuICAgIGlmIGV2ZW50LndoaWNoID09IDI3IG9yIGV2ZW50LnR5cGUgPT0gXCJmb2N1c291dFwiXG4gICAgICAkdGFyZ2V0LnJlbW92ZSgpXG4gICAgICAkdGQuaHRtbChAJG9sZFNwYW4pXG4gICAgICBAYWxyZWFkeUVkaXRpbmcgPSBmYWxzZVxuICAgICAgcmV0dXJuXG5cbiAgICAjIGFjdCBub3JtYWwsIHVubGVzcyBpdCdzIGFuIGVudGVyIGtleSBvbiBrZXlkb3duXG4gICAgcmV0dXJuIHRydWUgdW5sZXNzIGV2ZW50LndoaWNoID09IDEzIGFuZCBldmVudC50eXBlID09IFwia2V5ZG93blwiXG5cbiAgICBAYWxyZWFkeUVkaXRpbmcgPSBmYWxzZVxuXG4gICAga2V5ICAgICAgICAgID0gJHRhcmdldC5hdHRyKFwiZGF0YS1rZXlcIilcbiAgICBpc051bWJlciAgICAgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLWlzTnVtYmVyXCIpID09IFwidHJ1ZVwiXG5cbiAgICBzdWJ0ZXN0SWQgICAgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLXN1YnRlc3RJZFwiKVxuICAgIHN1YnRlc3QgICAgICA9IEBzdWJ0ZXN0cy5nZXQoc3VidGVzdElkKVxuICAgIG9sZFZhbHVlICAgICA9IHN1YnRlc3QuZ2V0KGtleSlcblxuICAgIG5ld1ZhbHVlID0gJHRhcmdldC52YWwoKVxuICAgIG5ld1ZhbHVlID0gaWYgaXNOdW1iZXIgdGhlbiBwYXJzZUludChuZXdWYWx1ZSkgZWxzZSBuZXdWYWx1ZVxuXG4gICAgI3NwZWNpYWwgY2FzZVxuXG4gICAgIyB0aGlzIGlzIG5vdCBEUlkuIHJlcGVhdGVkIGluIGdyaWQgcHJvdG90eXBlLlxuICAgIGlmIGtleSA9PSBcIml0ZW1zXCJcbiAgICAgICMgY2xlYW4gd2hpdGVzcGFjZSwgZ2l2ZSByZW1pbmRlciBpZiB0YWJzIG9yIGNvbW1hcyBmb3VuZCwgY29udmVydCBiYWNrIHRvIGFycmF5XG4gICAgICBuZXdWYWx1ZSA9IG5ld1ZhbHVlLnJlcGxhY2UoL1xccysvZywgJyAnKVxuICAgICAgaWYgL1xcdHwsLy50ZXN0KG5ld1ZhbHVlKSB0aGVuIGFsZXJ0IFwiUGxlYXNlIHJlbWVtYmVyXFxuXFxuR3JpZCBpdGVtcyBhcmUgc3BhY2UgXFxcIiBcXFwiIGRlbGltaXRlZFwiXG4gICAgICBuZXdWYWx1ZSA9IF8uY29tcGFjdCBuZXdWYWx1ZS5zcGxpdChcIiBcIilcblxuICAgICMgSWYgdGhlcmUgd2FzIGEgY2hhbmdlLCBzYXZlIGl0XG4gICAgaWYgU3RyaW5nKG5ld1ZhbHVlKSAhPSBTdHJpbmcob2xkVmFsdWUpXG4gICAgICBhdHRyaWJ1dGVzID0ge31cbiAgICAgIGF0dHJpYnV0ZXNba2V5XSA9IG5ld1ZhbHVlXG4gICAgICBzdWJ0ZXN0LnNhdmUgYXR0cmlidXRlcyxcbiAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlN1YnRlc3Qgc2F2ZWRcIlxuICAgICAgICAgIHN1YnRlc3QuZmV0Y2ggXG4gICAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgICBAdXBkYXRlVGFibGUoKVxuICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICBzdWJ0ZXN0LmZldGNoIFxuICAgICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgICAgQHVwZGF0ZVRhYmxlKClcbiAgICAgICAgICAgICAgIyBpZGVhbGx5IHdlIHdvdWxkbid0IGhhdmUgdG8gc2F2ZSB0aGlzIGJ1dCBjb25mbGljdHMgaGFwcGVuIHNvbWV0aW1lc1xuICAgICAgICAgICAgICAjIEBUT0RPIG1ha2UgdGhlIG1vZGVsIHRyeSBhZ2FpbiB3aGVuIHVuc3VjY2Vzc2Z1bC5cbiAgICAgICAgICAgICAgYWxlcnQgXCJQbGVhc2UgdHJ5IHRvIHNhdmUgYWdhaW4sIGl0IGRpZG4ndCB3b3JrIHRoYXQgdGltZS5cIlxuICAgIFxuICAgICMgdGhpcyBlbnN1cmVzIHdlIGRvIG5vdCBpbnNlcnQgYSBuZXdsaW5lIGNoYXJhY3RlciB3aGVuIHdlIHByZXNzIGVudGVyXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgZ29CYWNrOiAtPiBcbiAgICBpZiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiY29udGV4dFwiKSA9PSBcInNlcnZlclwiIFxuICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImFzc2Vzc21lbnRzXCIsIHRydWVcbiAgICBlbHNlIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpID09IFwiY2xhc3NcIlxuICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImNsYXNzXCIsIHRydWVcblxuICBkZWxldGVDdXJyaWN1bHVtOiAtPlxuICAgIGlmIGNvbmZpcm0oXCJEZWxldGUgY3VycmljdWx1bVxcbiN7QGN1cnJpY3VsdW0uZ2V0KCduYW1lJyl9P1wiKVxuICAgICAgQGN1cnJpY3VsdW0uZGVzdHJveSA9PiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiYXNzZXNzbWVudHNcIiwgdHJ1ZVxuXG4gICNcbiAgIyBTdWJ0ZXN0IG5ldyBhbmQgZGVzdHJveVxuICAjXG4gIG5ld1N1YnRlc3Q6IChldmVudCkgLT5cbiAgICBwcm90b3R5cGUgPSAkKGV2ZW50LnRhcmdldCkuYXR0cihcImRhdGEtcHJvdG90eXBlXCIpXG4gICAgZ3VpZCA9IFV0aWxzLmd1aWQoKVxuXG4gICAgc3VidGVzdEF0dHJpYnV0ZXMgPSBcbiAgICAgIFwiX2lkXCIgICAgICAgICAgOiBndWlkXG4gICAgICBcImN1cnJpY3VsdW1JZFwiIDogQGN1cnJpY3VsdW0uaWRcbiAgICAgIFwicHJvdG90eXBlXCIgICAgOiBwcm90b3R5cGVcbiAgICAgIFwiY2FwdHVyZUxhc3RBdHRlbXB0ZWRcIiA6IGZhbHNlXG4gICAgICBcImVuZE9mTGluZVwiIDogZmFsc2VcblxuICAgIHByb3RvVGVtcHMgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldCBcInByb3RvdHlwZXNcIlxuICAgIHN1YnRlc3RBdHRyaWJ1dGVzID0gJC5leHRlbmQocHJvdG9UZW1wc1twcm90b3R5cGVdLCBzdWJ0ZXN0QXR0cmlidXRlcylcblxuICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBzdWJ0ZXN0QXR0cmlidXRlc1xuICAgIHN1YnRlc3Quc2F2ZSBudWxsLFxuICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImNsYXNzL3N1YnRlc3QvI3tndWlkfVwiLCB0cnVlXG4gICAgICBlcnJvcjogLT5cbiAgICAgICAgYWxlcnQgXCJQbGVhc2UgdHJ5IGFnYWluLiBUaGVyZSB3YXMgYSBwcm9ibGVtIGNyZWF0aW5nIHRoZSBuZXcgc3VidGVzdC5cIlxuXG4gIGRlbGV0ZVN1YnRlc3Q6IChldmVudCkgLT5cbiAgICBzdWJ0ZXN0SWQgPSAkKGV2ZW50LnRhcmdldCkuYXR0cihcImRhdGEtc3VidGVzdElkXCIpXG4gICAgc3VidGVzdCA9IEBzdWJ0ZXN0cy5nZXQoc3VidGVzdElkKVxuICAgIGlmIGNvbmZpcm0oXCJEZWxldGUgc3VidGVzdFxcbiN7c3VidGVzdC5nZXQoJ25hbWUnKX0/XCIpXG4gICAgICBzdWJ0ZXN0LmRlc3Ryb3lcbiAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICBAc3VidGVzdHMucmVtb3ZlKHN1YnRlc3RJZClcbiAgICAgICAgICBAdXBkYXRlVGFibGUoKVxuICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICBhbGVydCBcIlBsZWFzZSB0cnkgYWdhaW4sIGNvdWxkIG5vdCBkZWxldGUgc3VidGVzdC5cIlxuIl19

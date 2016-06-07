var QuestionsEditListElementView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

QuestionsEditListElementView = (function(superClass) {
  extend(QuestionsEditListElementView, superClass);

  function QuestionsEditListElementView() {
    this.copy = bind(this.copy, this);
    this.getSurveys = bind(this.getSurveys, this);
    return QuestionsEditListElementView.__super__.constructor.apply(this, arguments);
  }

  QuestionsEditListElementView.prototype.className = "question_list_element";

  QuestionsEditListElementView.prototype.tagName = "li";

  QuestionsEditListElementView.prototype.events = {
    'click .edit': 'edit',
    'click .show_copy': 'showCopy',
    'change .copy_select': 'copy',
    'click .delete': 'toggleDelete',
    'click .delete_cancel': 'toggleDelete',
    'click .delete_delete': 'delete'
  };

  QuestionsEditListElementView.prototype.showCopy = function(event) {
    var $copy;
    $copy = this.$el.find(".copy_container");
    $copy.html("Copy to <select class='copy_select'><option disabled='disabled' selected='selected'>Loading...</option></select>");
    return this.getSurveys();
  };

  QuestionsEditListElementView.prototype.getSurveys = function() {
    var url;
    url = Tangerine.settings.get("context") === "server" ? Tangerine.settings.urlView("group", "subtestsByAssessmentId") : Tangerine.settings.urlView("local", "subtestsByAssessmentId");
    return $.ajax({
      "url": url,
      "type": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "data": JSON.stringify({
        keys: [this.question.get("assessmentId")]
      }),
      "success": (function(_this) {
        return function(data) {
          var row, subtests;
          subtests = _.compact((function() {
            var i, len, ref, results;
            ref = data.rows;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              row = ref[i];
              results.push(row.value.prototype === "survey" ? row.value : void 0);
            }
            return results;
          })());
          console.log(subtests);
          return _this.populateSurveySelect(subtests);
        };
      })(this)
    });
  };

  QuestionsEditListElementView.prototype.populateSurveySelect = function(subtests) {
    var htmlOptions, subtest;
    subtests.push({
      _id: 'cancel',
      name: this.text.cancel_button
    });
    subtests.unshift({
      _id: '',
      name: this.text.select
    });
    htmlOptions = ((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = subtests.length; i < len; i++) {
        subtest = subtests[i];
        results.push("<option data-subtestId='" + subtest._id + "' " + (subtest.attrs || "") + ">" + subtest.name + "</option>");
      }
      return results;
    })()).join("");
    return this.$el.find(".copy_select").html(htmlOptions);
  };

  QuestionsEditListElementView.prototype.copy = function(event) {
    var $target, newQuestion, subtestId;
    $target = $(event.target).find("option:selected");
    subtestId = $target.attr("data-subtestId");
    if (subtestId === "cancel") {
      this.$el.find(".copy_container").empty();
      return;
    }
    newQuestion = this.question.clone();
    return newQuestion.save({
      "_id": Utils.guid(),
      "subtestId": subtestId
    }, {
      success: (function(_this) {
        return function() {
          if (subtestId === _this.question.get("subtestId")) {
            Utils.midAlert("Question duplicated");
            return _this.trigger("duplicate");
          } else {
            Tangerine.router.navigate("subtest/" + subtestId, true);
            return Utils.midAlert("Question copied to " + ($target.html()));
          }
        };
      })(this),
      error: function() {
        return Utils.midAlert("Copy error");
      }
    });
  };

  QuestionsEditListElementView.prototype.edit = function(event) {
    this.trigger("question-edit", this.question.id);
    return false;
  };

  QuestionsEditListElementView.prototype.toggleDelete = function() {
    return this.$el.find(".delete_confirm").fadeToggle(250);
  };

  QuestionsEditListElementView.prototype["delete"] = function(event) {
    this.question.collection.remove(this.question.id);
    this.question.destroy();
    this.trigger("deleted");
    return false;
  };

  QuestionsEditListElementView.prototype.initialize = function(options) {
    this.text = {
      "edit": t("QuestionsEditListElementView.help.edit"),
      "delete": t("QuestionsEditListElementView.help.delete"),
      "copy": t("QuestionsEditListElementView.help.copy_to"),
      "cancel_button": t("QuestionsEditListElementView.button.cancel"),
      "delete_button": t("QuestionsEditListElementView.button.delete"),
      "select": t("QuestionsEditListElementView.label.select"),
      "loading": t("QuestionsEditListElementView.label.loading"),
      "delete_confirm": t("QuestionsEditListElementView.label.delete_confirm")
    };
    this.question = options.question;
    return this.$el.attr("data-id", this.question.id);
  };

  QuestionsEditListElementView.prototype.render = function() {
    this.$el.html("<table> <tr> <td> <img src='images/icon_drag.png' width='36' height='36' class='sortable_handle'> </td> <td> <span>" + (this.question.get('prompt')) + "</span> <span>[<small>" + (this.question.get('name')) + ", " + (this.question.get('type')) + "</small>]</span> <img src='images/icon_edit.png' width='36' height='36' class='link_icon edit' title='" + this.text.edit + "'> <img src='images/icon_copy_to.png' width='36' height='36' class='link_icon show_copy' title='" + this.text.copy + "'> <span class='copy_container'></span> <img src='images/icon_delete.png' width='36' height='36' class='link_icon delete' title='" + this.text["delete"] + "'><br> <div class='confirmation delete_confirm'> <div class='menu_box'>" + this.text.delete_confirm + "<br><button class='delete_delete command_red'>Delete</button><button class='delete_cancel command'>" + this.text.cancel_button + "</button> </div> </td> </tr> </table>");
    return this.trigger("rendered");
  };

  return QuestionsEditListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcXVlc3Rpb24vUXVlc3Rpb25zRWRpdExpc3RFbGVtZW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsSUFBQSw0QkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozt5Q0FFSixTQUFBLEdBQVk7O3lDQUNaLE9BQUEsR0FBVTs7eUNBRVYsTUFBQSxHQUNFO0lBQUEsYUFBQSxFQUF1QixNQUF2QjtJQUNBLGtCQUFBLEVBQXVCLFVBRHZCO0lBRUEscUJBQUEsRUFBd0IsTUFGeEI7SUFJQSxlQUFBLEVBQXlCLGNBSnpCO0lBS0Esc0JBQUEsRUFBeUIsY0FMekI7SUFNQSxzQkFBQSxFQUF5QixRQU56Qjs7O3lDQVNGLFFBQUEsR0FBVSxTQUFDLEtBQUQ7QUFDUixRQUFBO0lBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWO0lBQ1IsS0FBSyxDQUFDLElBQU4sQ0FBVyxrSEFBWDtXQUdBLElBQUMsQ0FBQSxVQUFELENBQUE7RUFMUTs7eUNBT1YsVUFBQSxHQUFZLFNBQUE7QUFFVixRQUFBO0lBQUEsR0FBQSxHQUNLLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBbkIsQ0FBdUIsU0FBdkIsQ0FBQSxLQUFxQyxRQUF4QyxHQUNFLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBMkIsT0FBM0IsRUFBb0Msd0JBQXBDLENBREYsR0FHRSxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQW5CLENBQTJCLE9BQTNCLEVBQW9DLHdCQUFwQztXQUVKLENBQUMsQ0FBQyxJQUFGLENBQ0U7TUFBQSxLQUFBLEVBQWdCLEdBQWhCO01BQ0EsTUFBQSxFQUFnQixNQURoQjtNQUVBLFVBQUEsRUFBZ0IsTUFGaEI7TUFHQSxhQUFBLEVBQWdCLGtCQUhoQjtNQUlBLE1BQUEsRUFBZ0IsSUFBSSxDQUFDLFNBQUwsQ0FDZDtRQUFBLElBQUEsRUFBTyxDQUFDLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLGNBQWQs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LENBQUMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxDQUFELENBUDdFLEdBT21HLHdHQVBuRyxHQVNxRixJQUFDLENBQUEsSUFBSSxDQUFDLElBVDNGLEdBU2dHLGtHQVRoRyxHQVU2RixJQUFDLENBQUEsSUFBSSxDQUFDLElBVm5HLEdBVXdHLG1JQVZ4RyxHQVl5RixJQUFDLENBQUEsSUFBSSxDQUFDLFFBQUQsQ0FaOUYsR0FZc0cseUVBWnRHLEdBY3dCLElBQUMsQ0FBQSxJQUFJLENBQUMsY0FkOUIsR0FjNkMscUdBZDdDLEdBY2tKLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFkeEosR0Fjc0ssdUNBZGhMO1dBb0JBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQXJCTTs7OztHQWxHaUMsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvcXVlc3Rpb24vUXVlc3Rpb25zRWRpdExpc3RFbGVtZW50Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMgUHJvdmlkZXMgYW4gXCJsaVwiIHRhZyBmb3IgdGhlIHF1ZXN0aW9ucyBlZGl0IHZpZXdcbmNsYXNzIFF1ZXN0aW9uc0VkaXRMaXN0RWxlbWVudFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJxdWVzdGlvbl9saXN0X2VsZW1lbnRcIlxuICB0YWdOYW1lIDogXCJsaVwiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAuZWRpdCcgICAgICAgIDogJ2VkaXQnXG4gICAgJ2NsaWNrIC5zaG93X2NvcHknICAgOiAnc2hvd0NvcHknXG4gICAgJ2NoYW5nZSAuY29weV9zZWxlY3QnIDogJ2NvcHknXG5cbiAgICAnY2xpY2sgLmRlbGV0ZScgICAgICAgIDogJ3RvZ2dsZURlbGV0ZSdcbiAgICAnY2xpY2sgLmRlbGV0ZV9jYW5jZWwnIDogJ3RvZ2dsZURlbGV0ZSdcbiAgICAnY2xpY2sgLmRlbGV0ZV9kZWxldGUnIDogJ2RlbGV0ZSdcblxuXG4gIHNob3dDb3B5OiAoZXZlbnQpIC0+XG4gICAgJGNvcHkgPSBAJGVsLmZpbmQoXCIuY29weV9jb250YWluZXJcIilcbiAgICAkY29weS5odG1sIFwiXG4gICAgICBDb3B5IHRvIDxzZWxlY3QgY2xhc3M9J2NvcHlfc2VsZWN0Jz48b3B0aW9uIGRpc2FibGVkPSdkaXNhYmxlZCcgc2VsZWN0ZWQ9J3NlbGVjdGVkJz5Mb2FkaW5nLi4uPC9vcHRpb24+PC9zZWxlY3Q+XG4gICAgXCJcbiAgICBAZ2V0U3VydmV5cygpXG5cbiAgZ2V0U3VydmV5czogPT5cblxuICAgIHVybCA9IFxuICAgICAgaWYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgaXMgXCJzZXJ2ZXJcIlxuICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwic3VidGVzdHNCeUFzc2Vzc21lbnRJZFwiKVxuICAgICAgZWxzZVxuICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImxvY2FsXCIsIFwic3VidGVzdHNCeUFzc2Vzc21lbnRJZFwiKVxuXG4gICAgJC5hamF4XG4gICAgICBcInVybFwiICAgICAgICAgOiB1cmxcbiAgICAgIFwidHlwZVwiICAgICAgICA6IFwiUE9TVFwiXG4gICAgICBcImRhdGFUeXBlXCIgICAgOiBcImpzb25cIlxuICAgICAgXCJjb250ZW50VHlwZVwiIDogXCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgIFwiZGF0YVwiICAgICAgICA6IEpTT04uc3RyaW5naWZ5XG4gICAgICAgIGtleXMgOiBbQHF1ZXN0aW9uLmdldChcImFzc2Vzc21lbnRJZFwiKV1cbiAgICAgIFwic3VjY2Vzc1wiIDogKGRhdGEpID0+XG4gICAgICAgIHN1YnRlc3RzID0gXy5jb21wYWN0KChyb3cudmFsdWUgaWYgcm93LnZhbHVlLnByb3RvdHlwZSA9PSBcInN1cnZleVwiKSBmb3Igcm93IGluIGRhdGEucm93cylcbiAgICAgICAgY29uc29sZS5sb2cgc3VidGVzdHNcbiAgICAgICAgQHBvcHVsYXRlU3VydmV5U2VsZWN0IHN1YnRlc3RzXG5cbiAgcG9wdWxhdGVTdXJ2ZXlTZWxlY3QgOiAoc3VidGVzdHMpIC0+XG4gICAgXG4gICAgc3VidGVzdHMucHVzaCAgICBfaWQgOiAnY2FuY2VsJywgbmFtZSA6IEB0ZXh0LmNhbmNlbF9idXR0b25cbiAgICBzdWJ0ZXN0cy51bnNoaWZ0IF9pZCA6ICcnLCAgICAgICBuYW1lIDogQHRleHQuc2VsZWN0XG5cbiAgICBodG1sT3B0aW9ucyA9IChcIjxvcHRpb24gZGF0YS1zdWJ0ZXN0SWQ9JyN7c3VidGVzdC5faWR9JyAje3N1YnRlc3QuYXR0cnMgfHwgXCJcIn0+I3tzdWJ0ZXN0Lm5hbWV9PC9vcHRpb24+XCIgZm9yIHN1YnRlc3QgaW4gc3VidGVzdHMpLmpvaW4oXCJcIilcbiAgICBAJGVsLmZpbmQoXCIuY29weV9zZWxlY3RcIikuaHRtbCBodG1sT3B0aW9uc1xuXG4gIGNvcHk6IChldmVudCkgPT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpLmZpbmQoXCJvcHRpb246c2VsZWN0ZWRcIilcbiAgICBzdWJ0ZXN0SWQgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLXN1YnRlc3RJZFwiKVxuICAgIGlmIHN1YnRlc3RJZCA9PSBcImNhbmNlbFwiXG4gICAgICBAJGVsLmZpbmQoXCIuY29weV9jb250YWluZXJcIikuZW1wdHkoKVxuICAgICAgcmV0dXJuXG4gICAgbmV3UXVlc3Rpb24gPSBAcXVlc3Rpb24uY2xvbmUoKVxuICAgIG5ld1F1ZXN0aW9uLnNhdmVcbiAgICAgIFwiX2lkXCIgICAgICAgOiBVdGlscy5ndWlkKClcbiAgICAgIFwic3VidGVzdElkXCIgOiBzdWJ0ZXN0SWRcbiAgICAsXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBpZiBzdWJ0ZXN0SWQgPT0gQHF1ZXN0aW9uLmdldChcInN1YnRlc3RJZFwiKVxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0KFwiUXVlc3Rpb24gZHVwbGljYXRlZFwiKVxuICAgICAgICAgIEB0cmlnZ2VyIFwiZHVwbGljYXRlXCIgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwic3VidGVzdC8je3N1YnRlc3RJZH1cIiwgdHJ1ZSAjIHRoaXMgd2lsbCBndWFyYW50ZWUgdGhhdCBpdCBhc3N1cmVzIHRoZSBvcmRlciBvZiB0aGUgdGFyZ2V0IHN1YnRlc3RcbiAgICAgICAgICBVdGlscy5taWRBbGVydChcIlF1ZXN0aW9uIGNvcGllZCB0byAjeyR0YXJnZXQuaHRtbCgpfVwiKVxuICAgICAgZXJyb3I6IC0+XG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0KFwiQ29weSBlcnJvclwiKVxuXG4gIGVkaXQ6IChldmVudCkgLT5cbiAgICBAdHJpZ2dlciBcInF1ZXN0aW9uLWVkaXRcIiwgQHF1ZXN0aW9uLmlkXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgdG9nZ2xlRGVsZXRlOiAtPlxuICAgIEAkZWwuZmluZChcIi5kZWxldGVfY29uZmlybVwiKS5mYWRlVG9nZ2xlKDI1MClcblxuICBkZWxldGU6IChldmVudCkgLT5cbiAgICBAcXVlc3Rpb24uY29sbGVjdGlvbi5yZW1vdmUoQHF1ZXN0aW9uLmlkKVxuICAgIEBxdWVzdGlvbi5kZXN0cm95KClcbiAgICBAdHJpZ2dlciBcImRlbGV0ZWRcIlxuICAgIHJldHVybiBmYWxzZVxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG4gICAgQHRleHQgPSBcbiAgICAgIFwiZWRpdFwiICAgICAgICAgIDogdChcIlF1ZXN0aW9uc0VkaXRMaXN0RWxlbWVudFZpZXcuaGVscC5lZGl0XCIpXG4gICAgICBcImRlbGV0ZVwiICAgICAgICA6IHQoXCJRdWVzdGlvbnNFZGl0TGlzdEVsZW1lbnRWaWV3LmhlbHAuZGVsZXRlXCIpXG4gICAgICBcImNvcHlcIiAgICAgICAgICA6IHQoXCJRdWVzdGlvbnNFZGl0TGlzdEVsZW1lbnRWaWV3LmhlbHAuY29weV90b1wiKVxuICAgICAgXCJjYW5jZWxfYnV0dG9uXCIgOiB0KFwiUXVlc3Rpb25zRWRpdExpc3RFbGVtZW50Vmlldy5idXR0b24uY2FuY2VsXCIpXG4gICAgICBcImRlbGV0ZV9idXR0b25cIiA6IHQoXCJRdWVzdGlvbnNFZGl0TGlzdEVsZW1lbnRWaWV3LmJ1dHRvbi5kZWxldGVcIilcbiAgICAgIFwic2VsZWN0XCIgICAgICAgIDogdChcIlF1ZXN0aW9uc0VkaXRMaXN0RWxlbWVudFZpZXcubGFiZWwuc2VsZWN0XCIpXG4gICAgICBcImxvYWRpbmdcIiAgICAgICA6IHQoXCJRdWVzdGlvbnNFZGl0TGlzdEVsZW1lbnRWaWV3LmxhYmVsLmxvYWRpbmdcIilcbiAgICAgIFwiZGVsZXRlX2NvbmZpcm1cIiA6IHQoXCJRdWVzdGlvbnNFZGl0TGlzdEVsZW1lbnRWaWV3LmxhYmVsLmRlbGV0ZV9jb25maXJtXCIpXG5cbiAgICBAcXVlc3Rpb24gPSBvcHRpb25zLnF1ZXN0aW9uXG4gICAgQCRlbC5hdHRyKFwiZGF0YS1pZFwiLCBAcXVlc3Rpb24uaWQpXG5cbiAgcmVuZGVyOiAtPlxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPHRhYmxlPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGltZyBzcmM9J2ltYWdlcy9pY29uX2RyYWcucG5nJyB3aWR0aD0nMzYnIGhlaWdodD0nMzYnIGNsYXNzPSdzb3J0YWJsZV9oYW5kbGUnPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPHNwYW4+I3tAcXVlc3Rpb24uZ2V0ICdwcm9tcHQnfTwvc3Bhbj4gPHNwYW4+WzxzbWFsbD4je0BxdWVzdGlvbi5nZXQgJ25hbWUnfSwgI3tAcXVlc3Rpb24uZ2V0ICd0eXBlJ308L3NtYWxsPl08L3NwYW4+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIDxpbWcgc3JjPSdpbWFnZXMvaWNvbl9lZGl0LnBuZycgd2lkdGg9JzM2JyBoZWlnaHQ9JzM2JyBjbGFzcz0nbGlua19pY29uIGVkaXQnIHRpdGxlPScje0B0ZXh0LmVkaXR9Jz5cbiAgICAgICAgICAgIDxpbWcgc3JjPSdpbWFnZXMvaWNvbl9jb3B5X3RvLnBuZycgd2lkdGg9JzM2JyBoZWlnaHQ9JzM2JyBjbGFzcz0nbGlua19pY29uIHNob3dfY29weScgdGl0bGU9JyN7QHRleHQuY29weX0nPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9J2NvcHlfY29udGFpbmVyJz48L3NwYW4+XG4gICAgICAgICAgICA8aW1nIHNyYz0naW1hZ2VzL2ljb25fZGVsZXRlLnBuZycgd2lkdGg9JzM2JyBoZWlnaHQ9JzM2JyBjbGFzcz0nbGlua19pY29uIGRlbGV0ZScgdGl0bGU9JyN7QHRleHQuZGVsZXRlfSc+PGJyPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz0nY29uZmlybWF0aW9uIGRlbGV0ZV9jb25maXJtJz5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPiN7QHRleHQuZGVsZXRlX2NvbmZpcm19PGJyPjxidXR0b24gY2xhc3M9J2RlbGV0ZV9kZWxldGUgY29tbWFuZF9yZWQnPkRlbGV0ZTwvYnV0dG9uPjxidXR0b24gY2xhc3M9J2RlbGV0ZV9jYW5jZWwgY29tbWFuZCc+I3tAdGV4dC5jYW5jZWxfYnV0dG9ufTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgIDwvdGFibGU+XG4gICAgICBcIlxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuIl19

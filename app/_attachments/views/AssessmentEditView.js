var AssessmentEditView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentEditView = (function(_super) {

  __extends(AssessmentEditView, _super);

  function AssessmentEditView() {
    this.makeSortable = __bind(this.makeSortable, this);
    this.render = __bind(this.render, this);
    this.initialize = __bind(this.initialize, this);
    AssessmentEditView.__super__.constructor.apply(this, arguments);
  }

  AssessmentEditView.prototype.el = '#content';

  AssessmentEditView.prototype.initialize = function(options) {
    if (options == null) options = {};
    this.model = options.model;
    return this.config = Tangerine.config.Subtest;
  };

  AssessmentEditView.prototype.events = {
    "click button.back_to_assessments": "gotoAssessments",
    "click img.show_delete_subtest_confirm": "showConfirmDeleteSubtest",
    "click button.delete_subtest_yes": "deleteSubtestAffirmative",
    "click button.delete_subtest_cancel": "deleteSubtestNegative",
    "click img#add_subtest_form": "addSubtestForm",
    "click img.save_this_subtest": "saveThisSubtest",
    "click li#save_all_new_subtests": "saveAllNewSubtests",
    "change form.newSubtest select": "subtestTypeSelected",
    "change #edit-archive": "updateArchive"
  };

  AssessmentEditView.prototype.render = function() {
    var _this = this;
    this.$el.html("    <button id='back_to_asssessments'>Back to Assessments</button>    <div id='edit_assessment'>      <h1>" + (this.model.get("name")) + "</h1>      <div>        <label for='edit-archive'>Archived</label><br>        <input type='checkbox' id='edit-archive' name='archived' value='" + (this.model.get("archived" === true) ? "checked" : "") + "'></input><br/>      </div>      <h2>Subtests</h2>      <ul id='subtest_list'>        " + (_.map(this.model.get("urlPathsForPages"), function(subtestId) {
      return _this.renderSubtestItem(subtestId);
    }).join("")) + "      </ul>      <ul id='new_subtest_list'>        <li><img src='images/icon_add.png' class='icon_add' id='add_subtest_form'></li>        <li id='save_all_new_subtests'><button>Save All Subtests</button></li>      </ul>    </div>    ");
    return this.makeSortable();
  };

  AssessmentEditView.prototype.renderSubtestItem = function(subtestId) {
    return "    <li data-subtest='" + subtestId + "' id='" + subtestId + "'>      <img src='images/icon_draggable.png'>      " + subtestId + "      <a href='#edit/assessment/" + this.model.id + "/subtest/" + subtestId + "'><img class='icon_edit' src='images/icon_edit.png'></a>      <img class='icon_delete show_delete_subtest_confirm' src='images/icon_delete.png'>      <span class='delete_confirm'>Are you sure? <button data-subtest='" + subtestId + "' class='delete_subtest_yes'>Yes</button><button class='delete_subtest_cancel'>Cancel</button></span>    </li>    ";
  };

  AssessmentEditView.prototype.addSubtestForm = function() {
    return $('ul#new_subtest_list').prepend("      <li class='new_subtest''>        <input name='_id' class='_id' type='text' placeholder='Subtest Name'>        <select name='pageType' class='pageType'>          <option>Select a type</option>          " + (_.map(this.config.pageTypes, function(pageType) {
      return "<option>" + pageType + "</option>";
    }).join("")) + "        </select>        <img src='images/icon_add.png' class='icon_add save_this_subtest'>        <img src='images/icon_delete.png' class='parent_remove'>      </li>");
  };

  AssessmentEditView.prototype.updateSaveAllButton = function() {
    if ($('li.new_subtest').length > 1) {
      return $("li#save_all_subtests").show();
    } else {
      return $("li#save_all_subtests").hide();
    }
  };

  AssessmentEditView.prototype.saveAllNewSubtests = function() {
    var subtests;
    return subtests = $("li.new_subtest").each(function(index, element) {
      return this.saveNewSubtest({
        _id: $("input._id", element).val(),
        pageType: $("select.pageType option:selected", element).val(),
        toRemove: element
      });
    });
  };

  AssessmentEditView.prototype.saveThisSubtest = function(event) {
    var targetParent;
    targetParent = $(event.target).parent();
    return this.saveNewSubtest({
      _id: $("input._id", targetParent).val(),
      pageType: $("select.pageType option:selected", targetParent).val(),
      toRemove: targetParent
    });
  };

  AssessmentEditView.prototype.saveNewSubtest = function(options) {
    var pageType, subtest, toRemove, _id,
      _this = this;
    _id = options._id;
    pageType = options.pageType;
    toRemove = options.toRemove;
    subtest = new Subtest({
      _id: _id,
      pageType: pageType,
      pageId: _id.substring(_id.lastIndexOf(".") + 1)
    });
    subtest.set(_.reduce(this.config.pageTypeProperties[pageType], function(result, property) {
      result[property] = "";
      return result;
    }, {}));
    subtest.save(null, {
      success: function() {
        _this.model.set({
          urlPathsForPages: _this.model.get("urlPathsForPages").concat([subtest.id])
        });
        return _this.model.save(null, {
          success: function() {
            $("ul#subtest_list").append(_this.renderSubtestItem(_id)).sortable('refresh');
            return $(options.toRemove).remove();
          },
          error: function() {
            console.log("assessment save error");
            return $(toRemove).append("<span class='error'>Error while updating " + (this.model.get("name")) + " <img src='images/icon_close.png' class='parent_remove'></span>");
          }
        });
      },
      error: function() {
        console.log("subtest save error");
        return $(toRemove).append("<span class='error'>Invalid new subtest <img src='images/icon_close.png' class='parent_remove'></span>");
      }
    });
    return this.updateSaveAllButton();
  };

  AssessmentEditView.prototype.showConfirmDeleteSubtest = function(event) {
    return $(event.target).parent().find(".delete_confirm").fadeIn(250);
  };

  AssessmentEditView.prototype.deleteSubtestNegative = function(event) {
    return $(event.target).parent().fadeOut(250);
  };

  AssessmentEditView.prototype.deleteSubtestAffirmative = function(event) {
    var subtest_id;
    subtest_id = $(event.target).attr("data-subtest");
    console.log([subtest_id, event]);
    this.model.set({
      urlPathsForPages: _.without(this.model.get("urlPathsForPages"), subtest_id)
    });
    return this.model.save(null, {
      success: function() {
        return $(event.target).parent().parent().fadeOut(250);
      },
      error: function() {
        return $("div.message").append("<span class='error'>Error saving changes <img src='images/icon_close.png' class='clear_message'></span>");
      }
    });
  };

  AssessmentEditView.prototype.updateArchive = function() {
    return this.model.save({
      archived: $("#edit-archive").is(":checked")
    }, {
      success: function() {
        $("#edit-archive").effect("highlight", {
          color: "#F7C942"
        }, 2000);
        return $("div.message").html("Saved").show().fadeOut(3000);
      },
      error: function() {
        return $("div.message").html("Error saving changes").show().fadeOut(3000);
      }
    });
  };

  AssessmentEditView.prototype.subtestTypeSelected = function() {
    return $("form.newSubtest input[name='_id']").val(this.model.id + "." + $("form.newSubtest option:selected").val());
  };

  AssessmentEditView.prototype.makeSortable = function() {
    var _this = this;
    return $("ul#subtest_list", this.el).sortable({
      update: function() {
        _this.model.set({
          urlPathsForPages: _.map($("li a"), function(subtest) {
            return $(subtest).text();
          })
        });
        return _this.model.save(null, {
          success: function() {
            $("ul").effect("highlight", {
              color: "#F7C942"
            }, 2000);
            return $("div.message").html("Saved").show().fadeOut(3000);
          },
          error: function() {
            return $("div.message").html("Error saving changes").show().fadeOut(3000);
          }
        });
      }
    });
  };

  AssessmentEditView.prototype.gotoAssessments = function() {
    return Tangerine.router.navigate("manage", true);
  };

  AssessmentEditView.prototype.clearNewSubtest = function() {
    $("form.newSubtest input[name='_id']").val("");
    return $("form.newSubtest select").val("");
  };

  return AssessmentEditView;

})(Backbone.View);

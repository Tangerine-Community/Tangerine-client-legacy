var SubtestListElementView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SubtestListElementView = (function(_super) {

  __extends(SubtestListElementView, _super);

  function SubtestListElementView() {
    SubtestListElementView.__super__.constructor.apply(this, arguments);
  }

  SubtestListElementView.prototype.tagName = "li";

  SubtestListElementView.prototype.className = "subtest_element";

  SubtestListElementView.prototype.events = {
    'click .icon_edit': 'edit',
    "click .icon_delete": "toggleDeleteConfirm",
    "click .delete_cancel": "toggleDeleteConfirm",
    "click .delete_delete": "delete",
    "click .icon_copy": "openCopyMenu",
    "click .do_copy": "doCopy",
    "click .cancel_copy": "cancelCopy"
  };

  SubtestListElementView.prototype.toggleDeleteConfirm = function() {
    this.$el.find(".delete_confirm").fadeToggle(250);
    return false;
  };

  SubtestListElementView.prototype["delete"] = function() {
    this.trigger("subtest:delete", this.model);
    return false;
  };

  SubtestListElementView.prototype.edit = function() {
    return Tangerine.router.navigate("subtest/" + this.model.id, true);
  };

  SubtestListElementView.prototype.initialize = function(options) {
    this.model = options.subtest;
    this.group = options.group;
    return this.$el.attr("data-id", this.model.id);
  };

  SubtestListElementView.prototype.openCopyMenu = function() {
    this.$el.find(".copy_menu").removeClass("confirmation");
    this.$el.find(".copy_select").append("<option disabled='disabled' selected='selected'>Loading assessments...</option>");
    return this.fetchAssessments();
  };

  SubtestListElementView.prototype.fetchAssessments = function() {
    var allAssessments,
      _this = this;
    this.groupAssessments = [];
    allAssessments = new Assessments;
    return allAssessments.fetch({
      success: function(collection) {
        _this.groupAssessments = collection.where({
          "group": _this.group
        });
        return _this.populateAssessmentSelector();
      }
    });
  };

  SubtestListElementView.prototype.populateAssessmentSelector = function() {
    var $select, assessment, optionList, _i, _len, _ref;
    optionList = "";
    _ref = this.groupAssessments;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      assessment = _ref[_i];
      optionList += "<option data-assessmentId='" + assessment.id + "'>" + (assessment.get("name")) + "</option>";
    }
    return $select = this.$el.find(".copy_select").html(optionList);
  };

  SubtestListElementView.prototype.doCopy = function(e) {
    this.model.copyTo(this.$el.find(".copy_select :selected").attr('data-assessmentId'));
    return this.$el.find(".copy_menu").addClass("confirmation");
  };

  SubtestListElementView.prototype.cancelCopy = function() {
    return this.$el.find(".copy_menu").addClass("confirmation");
  };

  SubtestListElementView.prototype.render = function() {
    var copyIcon, copyMenu, deleteConfirm, iconDelete, iconDrag, iconEdit, prototype, subtestName;
    subtestName = this.model.get("name");
    prototype = "<span class='small_grey'>" + (this.model.get("prototype")) + "</span>";
    iconDrag = "<img src='images/icon_drag.png' title='Drag to reorder' class='icon sortable_handle'>";
    iconEdit = "<img src='images/icon_edit.png' title='Edit' class='icon icon_edit'>";
    iconDelete = "<img src='images/icon_delete.png' title='Delete' class='icon icon_delete'>";
    copyIcon = "<img src='images/icon_copy_to.png' title='Copy to...' class='icon icon_copy'>";
    copyMenu = "<div class='confirmation copy_menu'><select class='copy_select'></select><br><button class='do_copy command'>Copy</button> <button class='cancel_copy command'>Cancel</button></div>";
    deleteConfirm = "<br><span class='delete_confirm'><div class='menu_box'>Confirm <button class='delete_delete command_red'>Delete</button> <button class='delete_cancel command'>Cancel</button></div></span>";
    this.$el.html("      <table><tr>      <td>" + iconDrag + "</td>      <td>        " + subtestName + "        " + prototype + "        " + iconEdit + "        " + copyIcon + "        " + iconDelete + "        " + deleteConfirm + "        " + copyMenu + "      </td>      </tr></table>    ");
    return this.trigger("rendered");
  };

  return SubtestListElementView;

})(Backbone.View);

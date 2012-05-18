var SubtestListElementView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SubtestListElementView = (function(_super) {

  __extends(SubtestListElementView, _super);

  function SubtestListElementView() {
    SubtestListElementView.__super__.constructor.apply(this, arguments);
  }

  SubtestListElementView.prototype.tagName = "li";

  SubtestListElementView.prototype.className = "subtestElement";

  SubtestListElementView.prototype.events = {
    'click .icon_edit': 'edit',
    "click .icon_delete": "showDeleteConfirm",
    "click .delete_cancel": "hideDeleteConfirm",
    "click .delete_delete": "delete"
  };

  SubtestListElementView.prototype.showDeleteConfirm = function(event) {
    this.$el.find(".delete_confirm").show(250);
    return false;
  };

  SubtestListElementView.prototype.hideDeleteConfirm = function(event) {
    this.$el.find(".delete_confirm").hide(250);
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
    this.model = options.model;
    return this.$el.attr("data-id", this.model.id);
  };

  SubtestListElementView.prototype.render = function() {
    var deleteConfirm, iconDelete, iconDrag, iconEdit, prototype, subtestName;
    subtestName = this.model.get("name");
    prototype = "[" + (this.model.get("prototype")) + "]";
    iconDrag = "<img src='images/icon_drag.png' class='sortable_handle'>";
    iconEdit = "<img src='images/icon_edit.png' class='icon_edit'>";
    iconDelete = "<img src='images/icon_delete.png' class='icon_delete'>";
    deleteConfirm = "<span class='delete_confirm'><button data-subtest='" + this.model.id + "' class='delete_delete command'>Delete</button><button class='delete_cancel command'>Cancel</button></span>";
    this.$el.html("      " + iconDrag + "      " + subtestName + "      " + prototype + "      " + iconEdit + "      " + iconDelete + "      " + deleteConfirm + "    ");
    return this.trigger("rendered");
  };

  return SubtestListElementView;

})(Backbone.View);

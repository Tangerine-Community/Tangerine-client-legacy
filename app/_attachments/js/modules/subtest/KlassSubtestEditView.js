var KlassSubtestEditView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassSubtestEditView = (function(_super) {

  __extends(KlassSubtestEditView, _super);

  function KlassSubtestEditView() {
    this.goBack = __bind(this.goBack, this);
    KlassSubtestEditView.__super__.constructor.apply(this, arguments);
  }

  KlassSubtestEditView.prototype.className = "subtest_edit";

  KlassSubtestEditView.prototype.events = {
    'click .back_button': 'goBack',
    'click .save_subtest': 'save'
  };

  KlassSubtestEditView.prototype.onClose = function() {
    var _base;
    return typeof (_base = this.prototypeEditor).close === "function" ? _base.close() : void 0;
  };

  KlassSubtestEditView.prototype.initialize = function(options) {
    var _this = this;
    this.model = options.model;
    this.curriculum = options.curriculum;
    this.config = Tangerine.templates.get("subtest");
    this.prototypeViews = Tangerine.config.get("prototypeViews");
    this.prototypeEditor = new window[this.prototypeViews[this.model.get('prototype')]['edit']]({
      model: this.model,
      parent: this
    });
    return this.prototypeEditor.on("edit-save", function() {
      return _this.save({
        options: {
          editSave: true
        }
      });
    });
  };

  KlassSubtestEditView.prototype.goBack = function() {
    return history.back();
  };

  KlassSubtestEditView.prototype.save = function(event) {
    var isEditSave, prototype, _base, _base2, _ref;
    isEditSave = (event != null ? (_ref = event.options) != null ? _ref.editSave : void 0 : void 0) === true;
    prototype = this.model.get("prototype");
    this.model.set({
      name: this.$el.find("#name").val(),
      part: parseInt(this.$el.find("#part").val()),
      reportType: this.$el.find("#report_type").val(),
      itemType: this.$el.find("#item_type").val()
    });
    if (typeof (_base = this.prototypeEditor).save === "function") {
      _base.save({
        "options": {
          "isEditSave": isEditSave
        }
      });
    }
    if ((this.prototypeEditor.isValid != null) && this.prototypeEditor.isValid() === false && !isEditSave) {
      Utils.midAlert("There are errors on this page");
      return typeof (_base2 = this.prototypeEditor).showErrors === "function" ? _base2.showErrors() : void 0;
    } else {
      if (this.model.save()) {
        Utils.midAlert("Subtest Saved");
        if (!isEditSave) return setTimeout(this.goBack, 1000);
      } else {
        console.log("save error");
        return Utils.midAlert("Save error");
      }
    }
  };

  KlassSubtestEditView.prototype.render = function() {
    var curriculumName, itemType, name, part, reportType, _base;
    curriculumName = this.curriculum.escape("name");
    name = this.model.escape("name");
    part = this.model.getNumber("part");
    reportType = this.model.escape("reportType");
    itemType = this.model.escape("itemType");
    this.$el.html("      <button class='back_button navigation'>Back</button><br>      <h1>Subtest Editor</h1>      <table class='basic_info'>        <tr>          <th>Curriculum</th>          <td>" + curriculumName + "</td>        </tr>      </table>      <button class='save_subtest command'>Done</button>      <div class='label_value'>        <label for='name'>Name</label>        <input id='name' value='" + name + "'>      </div>      <div class='label_value'>        <label for='report_type'>Report Type</label>        <input id='report_type' value='" + reportType + "'>      </div>      <div class='label_value'>        <label for='item_type'>Item Type</label>        <input id='item_type' value='" + itemType + "'>      </div>      <div class='label_value'>        <label for='part'>Assessment Number</label><br>        <input type='number' id='part' value='" + part + "'>      </div>      <div id='prototype_attributes'></div>      <button class='save_subtest command'>Done</button>      ");
    this.prototypeEditor.setElement(this.$el.find('#prototype_attributes'));
    if (typeof (_base = this.prototypeEditor).render === "function") {
      _base.render();
    }
    return this.trigger("rendered");
  };

  return KlassSubtestEditView;

})(Backbone.View);

var SubtestEditView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SubtestEditView = (function(_super) {

  __extends(SubtestEditView, _super);

  function SubtestEditView() {
    this.goBack = __bind(this.goBack, this);
    SubtestEditView.__super__.constructor.apply(this, arguments);
  }

  SubtestEditView.prototype.className = "subtest_edit";

  SubtestEditView.prototype.events = {
    'click .back_button': 'goBack',
    'click .save_subtest': 'save',
    'keydown input': 'hijackEnter'
  };

  SubtestEditView.prototype.hijackEnter = function(event) {
    if (event.which === 13) return this.save();
  };

  SubtestEditView.prototype.onClose = function() {
    var _base;
    return typeof (_base = this.prototypeEditor).close === "function" ? _base.close() : void 0;
  };

  SubtestEditView.prototype.initialize = function(options) {
    this.model = options.model;
    this.config = Tangerine.config.subtest;
    this.prototypeViews = Tangerine.config.prototypeViews;
    return this.prototypeEditor = new window[this.prototypeViews[this.model.get('prototype')]['edit']]({
      model: this.model,
      parent: this
    });
  };

  SubtestEditView.prototype.goBack = function() {
    return Tangerine.router.navigate("edit-id/" + this.model.get("assessmentId"), true);
  };

  SubtestEditView.prototype.save = function() {
    var prototype, _base;
    prototype = this.model.get("prototype");
    this.model.set({
      name: this.$el.find("#subtest_name").val(),
      enumeratorHelp: this.$el.find("#subtest_help").val(),
      studentDialog: this.$el.find("#subtest_dialog").val(),
      skippable: this.$el.find("#skip_radio input:radio[name=skippable]:checked").val() === "true"
    });
    if (typeof (_base = this.prototypeEditor).save === "function") _base.save();
    if (this.model.save()) {
      Utils.midAlert("Subtest Saved");
      return setTimeout(this.goBack, 1000);
    } else {
      console.log("save error");
      return Utils.midAlert("Save error");
    }
  };

  SubtestEditView.prototype.render = function() {
    var dialog, help, name, prototype, skippable, _base;
    name = Utils.encode(this.model.get("name"));
    prototype = this.model.get("prototype");
    help = this.model.get("enumeratorHelp") || "";
    dialog = this.model.get("studentDialog") || "";
    skippable = this.model.get("skippable") === true || this.model.get("skippable") === "true";
    this.$el.html("      <button class='back_button navigation'>Back</button><br>      <h1>Subtest Editor</h1>      <button class='save_subtest command'>Done</button>      <div id='subtest_edit_form'>        <div class='label_value'>          <label for='subtest_name'>Name</label>          <input id='subtest_name' value='" + name + "'>        </div>        <div class='label_value'>          <label for='subtest_prototype' title='This is a basic type of subtest. (e.g. Survey, Grid, Location, Id, Consent)'>Prototype</label>" + prototype + "        </div>        <div class='label_value'>          <label>Skippable</label>          <div id='skip_radio'>            <label for='skip_true'>Yes</label><input name='skippable' type='radio' value='true' id='skip_true' " + (skippable ? 'checked' : void 0) + ">            <label for='skip_false'>No</label><input name='skippable' type='radio' value='false' id='skip_false' " + (!skippable ? 'checked' : void 0) + ">          </div>        </div>        <div class='label_value'>          <label for='subtest_help'>Enumerator help</label>          <textarea id='subtest_help' class='richtext'>" + help + "</textarea>        </div>        <div class='label_value'>          <label for='subtest_dialog'>Student Dialog</label>          <textarea id='subtest_dialog' class='richtext'>" + dialog + "</textarea>        </div>        <div id='prototype_attributes'></div>      </div>      <button class='save_subtest command'>Done</button>");
    this.prototypeEditor.setElement(this.$el.find('#prototype_attributes'));
    if (typeof (_base = this.prototypeEditor).render === "function") {
      _base.render();
    }
    this.$el.find("#skip_radio").buttonset();
    return this.trigger("rendered");
  };

  return SubtestEditView;

})(Backbone.View);

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
    'click .save_subtest': 'saveSubtest',
    'click .richtext_edit': 'richtextEdit',
    'click .richtext_save': 'richtextSave',
    'click .richtext_cancel': 'richtextCancel'
  };

  SubtestEditView.prototype.richtextConfig = [
    {
      "key": "enumerator",
      "attributeName": "enumeratorHelp"
    }, {
      "key": "dialog",
      "attributeName": "studentDialog"
    }, {
      "key": "transition",
      "attributeName": "transitionComment"
    }
  ];

  SubtestEditView.prototype.initialize = function(options) {
    var _this = this;
    this.richtextKeys = _.pluck(this.richtextConfig, "key");
    this.model = options.model;
    this.assessment = options.assessment;
    this.config = Tangerine.config.subtest;
    this.prototypeViews = Tangerine.config.get("prototypeViews");
    this.prototypeEditor = new window[this.prototypeViews[this.model.get('prototype')]['edit']]({
      model: this.model,
      parent: this
    });
    return this.prototypeEditor.on("question-edit", function(questionId) {
      return _this.save({
        questionSave: false,
        success: function() {
          return Tangerine.router.navigate("question/" + questionId, true);
        }
      });
    });
  };

  SubtestEditView.prototype.getRichtextConfig = function(event) {
    var $target, attributeName, dataKey;
    if (_.isString(event)) {
      dataKey = event;
    } else {
      $target = $(event.target);
      dataKey = $target.parent().attr("data-richtextKey") || $target.parent().parent().attr("data-richtextKey");
    }
    attributeName = _.where(this.richtextConfig, {
      "key": dataKey
    })[0].attributeName;
    return {
      "dataKey": dataKey,
      "attributeName": attributeName
    };
  };

  SubtestEditView.prototype.richtextEdit = function(event) {
    var config;
    config = this.getRichtextConfig(event);
    this.$el.find("." + config.dataKey + "_preview, ." + config.dataKey + "_edit, ." + config.dataKey + "_buttons").fadeToggle(250);
    return this.$el.find("textarea#" + config.dataKey + "_textarea").html(this.model.escape(config.attributeName) || "").cleditor();
  };

  SubtestEditView.prototype.richtextSave = function(event) {
    var config, newAttributes,
      _this = this;
    config = this.getRichtextConfig(event);
    newAttributes = {};
    newAttributes[config.attributeName] = this.$el.find("textarea#" + config.dataKey + "_textarea").val();
    this.model.save;
    return this.model.save(newAttributes, {
      success: function() {
        return _this.richtextCancel(config.dataKey);
      },
      error: function() {
        return alert("Save error. Please try again.");
      }
    });
  };

  SubtestEditView.prototype.richtextCancel = function(event) {
    var $preview, cleditor, config;
    config = this.getRichtextConfig(event);
    $preview = $("div." + config.dataKey + "_preview");
    $preview.html(this.model.get(config.attributeName) || "");
    $preview.fadeIn(250);
    this.$el.find("button." + config.dataKey + "_edit, ." + config.dataKey + "_buttons").fadeToggle(250);
    cleditor = this.$el.find("#" + config.dataKey + "_textarea").cleditor()[0];
    cleditor.$area.insertBefore(cleditor.$main);
    cleditor.$area.removeData("cleditor");
    return cleditor.$main.remove();
  };

  SubtestEditView.prototype.saveSubtest = function() {
    return this.save();
  };

  SubtestEditView.prototype.save = function(options) {
    var prototype, _base,
      _this = this;
    if (options == null) options = {};
    options.prototypeSave = options.prototypeSave != null ? options.prorotypeSave : true;
    prototype = this.model.get("prototype");
    this.model.set({
      name: this.$el.find("#subtest_name").val(),
      skippable: this.$el.find("#skip_radio input:radio[name=skippable]:checked").val() === "true",
      enumeratorHelp: this.$el.find("#enumerator_textarea").val(),
      studentDialog: this.$el.find("#dialog_textarea").val(),
      transitionComment: this.$el.find("#transition_textarea").val()
    });
    this.prototypeEditor.save(options);
    if (this.prototypeEditor.isValid() === false && !isEditSave) {
      Utils.midAlert("There are errors on this page");
      return typeof (_base = this.prototypeEditor).showErrors === "function" ? _base.showErrors() : void 0;
    } else {
      return this.model.save(null, {
        success: function() {
          if (options.success) return options.success();
          Utils.midAlert("Subtest Saved");
          return setTimeout(_this.goBack, 1000);
        },
        error: function() {
          if (options.error != null) return options.error();
          return Utils.midAlert("Save error");
        }
      });
    }
  };

  SubtestEditView.prototype.render = function() {
    var assessmentName, dialog, enummerator, name, prototype, skippable, transition, _base;
    assessmentName = this.assessment.escape("name");
    name = this.model.escape("name");
    prototype = this.model.get("prototype");
    enummerator = this.model.get("enumeratorHelp") || "";
    dialog = this.model.get("studentDialog") || "";
    transition = this.model.get("transitionComment") || "";
    skippable = this.model.getBoolean("skippable");
    this.$el.html("      <h1>Subtest Editor</h1>      <table class='basic_info'>        <tr>          <th>Assessment</th>          <td>" + assessmentName + "</td>        </tr>      </table>      <button class='save_subtest command'>Done</button>      <div id='subtest_edit_form' class='edit_form'>        <div class='label_value'>          <label for='subtest_name'>Name</label>          <input id='subtest_name' value='" + name + "'>        </div>        <div class='label_value'>          <label for='subtest_prototype' title='This is a basic type of subtest. (e.g. Survey, Grid, Location, Id, Consent). This property is set in assessment builder when you add a subtest. It is unchangeable.'>Prototype</label><br>          <div class='info_box'>" + prototype + "</div>        </div>        <div class='label_value'>          <label>Skippable</label><br>          <div class='menu_box'>            <div id='skip_radio' class='buttonset'>              <label for='skip_true'>Yes</label><input name='skippable' type='radio' value='true' id='skip_true' " + (skippable ? 'checked' : void 0) + ">              <label for='skip_false'>No</label><input name='skippable' type='radio' value='false' id='skip_false' " + (!skippable ? 'checked' : void 0) + ">            </div>          </div>        </div>        <div class='label_value' data-richtextKey='enumerator'>          <label for='enumerator_textarea' title='If text is supplied, a help button will appear at the top of the subtest as a reference for the enumerator. If you are pasting from word it is recommended to paste into a plain text editor first, and then into this box.'>Enumerator help <button class='richtext_edit command'>Edit</button></label>          <div class='info_box_wide enumerator_preview'>" + enummerator + "</div>          <textarea id='enumerator_textarea' class='confirmation'>" + enummerator + "</textarea>          <div class='enumerator_buttons confirmation'>            <button class='richtext_save command'>Save</button>            <button class='richtext_cancel command'>Cancel</button>          </div>        </div>        <div class='label_value' data-richtextKey='dialog'>          <label for='dialog_textarea' title='Generally this is a script that will be read to the student. If you are pasting from word it is recommended to paste into a plain text editor first, and then into this box.'>Student Dialog <button class='richtext_edit command'>Edit</button></label>          <div class='info_box_wide dialog_preview'>" + dialog + "</div>          <textarea id='dialog_textarea' class='confirmation'>" + dialog + "</textarea>          <div class='dialog_buttons confirmation'>            <button class='richtext_save command'>Save</button>            <button class='richtext_cancel command'>Cancel</button>          </div>        </div>        <div class='label_value' data-richtextKey='transition'>          <label for='transition_testarea' title='This will be displayed with a grey background above the next button, similar to the student dialog text. If you are pasting from Word it is recommended to paste into a plain text editor first, and then into this box.'>Transition Comment <button class='richtext_edit command'>Edit</button></label>          <div class='info_box_wide transition_preview'>" + transition + "</div>          <textarea id='transition_textarea' class='confirmation'>" + transition + "</textarea>          <div class='transition_buttons confirmation'>            <button class='richtext_save command'>Save</button>            <button class='richtext_cancel command'>Cancel</button>          </div>        </div>      </div>      <div id='prototype_attributes'></div>      <button class='save_subtest command'>Done</button>      ");
    this.prototypeEditor.setElement(this.$el.find('#prototype_attributes'));
    if (typeof (_base = this.prototypeEditor).render === "function") {
      _base.render();
    }
    return this.trigger("rendered");
  };

  SubtestEditView.prototype.onClose = function() {
    var _base;
    return typeof (_base = this.prototypeEditor).close === "function" ? _base.close() : void 0;
  };

  SubtestEditView.prototype.goBack = function() {
    return Tangerine.router.navigate("edit/" + this.model.get("assessmentId"), true);
  };

  return SubtestEditView;

})(Backbone.View);

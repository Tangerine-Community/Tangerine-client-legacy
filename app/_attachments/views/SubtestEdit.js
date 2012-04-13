var SubtestEdit,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SubtestEdit = (function(_super) {

  __extends(SubtestEdit, _super);

  function SubtestEdit() {
    this.render = __bind(this.render, this);
    SubtestEdit.__super__.constructor.apply(this, arguments);
  }

  SubtestEdit.prototype.initialize = function() {
    return this.config = Tangerine.config.Subtest;
  };

  SubtestEdit.prototype.el = '#content';

  SubtestEdit.prototype.events = {
    "click button.delete_subtest_element_cancel": 'hideDeleteSubtestElementConfirm',
    "click button.delete_subtest_element_yes": 'deleteSubtestElement',
    "click img.delete_subtest_element_show_confirm": 'showDeleteSubtestElementConfirm',
    "click img.append_subtest_element": 'appendSubtestElement',
    'click button#return_to_assessment': 'returnToAssessment',
    "click form#subtestEdit button:contains(Save)": "save",
    "click button:contains(Import a subtest)": "showImportSubtestForm",
    "click button#subtest_import_confirm": "importSubtest",
    "click button#subtest_import_cancel": "hideImportSubtestForm"
  };

  SubtestEdit.prototype.deleteSubtestElement = function(event) {
    var parent, self;
    parent = $(event.target).parent().parent();
    self = this;
    return parent.fadeOut(250, function() {
      $(this).remove();
      self.save();
      return self.render();
    });
  };

  SubtestEdit.prototype.showDeleteSubtestElementConfirm = function(event) {
    return $(event.target).parent().find("span.delete_subtest_element_confirm").show(250);
  };

  SubtestEdit.prototype.hideDeleteSubtestElementConfirm = function(event) {
    return $(event.target).parent().fadeOut(250);
  };

  SubtestEdit.prototype.returnToAssessment = function() {
    return Tangerine.router.navigate("edit/assessment/" + this.assessment_id, true);
  };

  SubtestEdit.prototype.showImportSubtestForm = function() {
    var _this = this;
    $("#import-from").show();
    this.existingSubtests = new SubtestCollection();
    return this.existingSubtests.fetch({
      success: function() {
        return $("form#import-from select").append(_this.existingSubtests.filter(function(subtest) {
          return subtest.get("pageType") === _this.model.get("pageType");
        }).map(function(subtest) {
          return "<option>" + (subtest.get("_id")) + "</option>";
        }).join(""));
      }
    });
  };

  SubtestEdit.prototype.hideImportSubtestForm = function() {
    return $("#import-from").hide();
  };

  SubtestEdit.prototype.importSubtest = function() {
    var sourceSubtest;
    sourceSubtest = this.existingSubtests.get($("form#import-from select option:selected").val());
    Utils.disposableAlert("Subtest imported");
    $("#import-from").fadeOut(250);
    return this.populateForm(sourceSubtest.toJSON());
  };

  SubtestEdit.prototype.importSubtest = function() {
    var sourceSubtest;
    sourceSubtest = this.existingSubtests.get($("form#import-from select option:selected").val());
    Utils.disposableAlert("Subtest imported");
    $("#import-from").fadeOut(250);
    return this.populateForm(sourceSubtest.toJSON());
  };

  SubtestEdit.prototype.render = function() {
    this.$el.html("      <div id='subtest_edit'>        <button id='return_to_assessment'>Return to assessment</button>        <button>Import a subtest</button>        <div style='display:none' class='message'></div>        <h1>" + (this.model.get("pageType")) + "</h1>        <form style='display:none' id='import-from'>          Select an existing subtest and it will fill in all blank elements below with that subtest's contents          <div>            <select id='existing-subtests'></select>          </div>          <button id='subtest_import_confirm'>Import</button><button id='subtest_import_cancel'>Cancel</button>        </form>        " + (this.subtestEditForm()) + "      </div>      ");
    $("textarea.html").cleditor();
    return this.populateForm(this.model.toJSON());
  };

  SubtestEdit.prototype.subtestEditForm = function() {
    var _this = this;
    return "<form id='subtestEdit'>      <ul id='subtest_edit_list'>    " + _.chain(this.model.attributes).map(function(value, key) {
      var formElement, label, object;
      if (_.include(_this.config.ignore, key)) return null;
      label = "<label for='" + key + "'>" + (key.underscore().humanize()) + "</label>";
      formElement = _.include(_this.config.htmlTextarea, key) ? "<textarea class='html' id='" + key + "' name='" + key + "'></textarea>" : _.include(_this.config.boolean, key) ? "<input id='" + key + "' name='" + key + "' type='checkbox'></input>" : _.include(_this.config.number, key) ? "<input id='" + key + "' name='" + key + "' type='number'></input>" : key === "pageType" ? "<select id='" + key + "' name='" + key + "'>                  " + (_.map(_this.config.pageTypes, function(type) {
        return "<option value=" + type + ">                        " + (type.underscore().humanize()) + "                      </option>";
      }).join("")) + "                </select>" : _.include(_this.config.textarea, key) ? "<textarea id='" + key + "' name='" + key + "'></textarea>" : _.include(_this.config.object, key) || typeof value === "object" ? (label = "", object = {}, object[key] = value, "<div id='object_wrapper_" + key + "'>" + (Utils.json2Form(object)) + "<img src='images/icon_add.png' class='icon_add append_subtest_element' data-element='" + key + "'></div>") : "<input id='" + key + "' name='" + key + "' type='text'></input>";
      return "<li>" + label + formElement + "</li>";
    }).compact().value().join("") + "      </ul>      <button type='button'>Save</button>    </form>";
  };

  SubtestEdit.prototype.appendSubtestElement = function(event) {
    var key, last, object;
    key = $(event.target).attr("data-element");
    object = this.model.attributes[key];
    if (_.isArray(object)) {
      last = this.zeroOut(_.last(this.model.attributes[key]));
      object.push(last);
      this.model.set(key, object);
    } else {
      this.model.set(key, [object, object]);
    }
    object = {};
    object[key] = this.model.attributes[key];
    return $("div#object_wrapper_" + key).html(Utils.json2Form(object));
  };

  SubtestEdit.prototype.zeroOut = function(last) {
    var key, value;
    if (_.isObject(last)) {
      last = _.clone(last);
      for (key in last) {
        value = last[key];
        last[key] = "";
      }
    } else {
      last = "";
    }
    return last;
  };

  SubtestEdit.prototype.populateForm = function(subtestAttributes) {
    _.each(subtestAttributes, function(value, key) {
      var currentValue;
      currentValue = $('#' + key, this.el).val();
      if (!currentValue || currentValue === '<br>') {
        if (key === 'items') {
          return $('#items', this.el).val(value.join(' '));
        } else if (key === 'includeAutostop' && value === 'on') {
          return $('#includeAutostop', this.el).prop("checked", true);
        } else if (typeof value === 'object') {
          return $('#' + key, this.el).val(JSON.stringify(value, void 0, 2));
        } else {
          return $('#' + key, this.el).val(value);
        }
      }
    });
    return _.each($("textarea.html", this.el).cleditor(), function(cleditor) {
      return cleditor.updateFrame();
    });
  };

  SubtestEdit.prototype.save = function() {
    var result;
    result = $('form#subtestEdit').toObject({
      skipEmpty: false
    });
    if (result.items) result.items = result.items.split(" ");
    if ($('#includeAutostop').length) {
      result.includeAutostop = $('#includeAutostop').prop("checked");
    }
    this.model.set(result);
    return this.model.save(null, {
      success: function() {
        $("form#subtestEdit").effect("highlight", {
          color: "#F7C942"
        }, 2000);
        return $("div.message").html("Saved").show().fadeOut(3000);
      },
      error: function() {
        return $("div.message").html("Error saving changes").show().fadeOut(3000);
      }
    });
  };

  return SubtestEdit;

})(Backbone.View);

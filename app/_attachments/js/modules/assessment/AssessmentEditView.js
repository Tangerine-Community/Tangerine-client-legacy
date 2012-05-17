var AssessmentEditView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentEditView = (function(_super) {

  __extends(AssessmentEditView, _super);

  function AssessmentEditView() {
    this.render = __bind(this.render, this);
    this.deleteSubtest = __bind(this.deleteSubtest, this);
    this.updateModel = __bind(this.updateModel, this);
    this.save = __bind(this.save, this);
    AssessmentEditView.__super__.constructor.apply(this, arguments);
  }

  AssessmentEditView.prototype.className = 'assessmentEditView';

  AssessmentEditView.prototype.events = {
    'click #archive_buttons input': 'save',
    'click .back': 'back',
    'click .new_subtest_button': 'showNewSubtestForm',
    'click .new_subtest_cancel': 'hideNewSubtestForm',
    'click .new_subtest_save': 'saveNewSubtest',
    'change #basic input': 'showSave',
    'click .assessment_save': 'save'
  };

  AssessmentEditView.prototype.save = function() {
    this.updateModel();
    if (this.model.save()) {
      Utils.midAlert("Assessment saved");
      Tangerine.router.navigate("edit/" + this.model.get("name"), true);
      return this.render();
    }
  };

  AssessmentEditView.prototype.showSave = function() {
    return this.$el.find('.assessment_save').fadeIn(250);
  };

  AssessmentEditView.prototype.back = function() {
    return Tangerine.router.navigate("", true);
  };

  AssessmentEditView.prototype.updateModel = function() {
    return this.model.set({
      archived: this.$el.find("#archive_buttons input:checked").val(),
      name: this.$el.find("#assessment_name").val(),
      dKey: this.$el.find("#assessment_d_key").val(),
      assessmentId: this.model.id
    });
  };

  AssessmentEditView.prototype.showNewSubtestForm = function() {
    return this.$el.find(".new_subtest_form").fadeIn(250);
  };

  AssessmentEditView.prototype.hideNewSubtestForm = function() {
    return this.$el.find(".new_subtest_form").fadeOut(250);
  };

  AssessmentEditView.prototype.saveNewSubtest = function() {
    var newAttributes, newSubtest, prototypeTemplate, useType, useTypeTemplate;
    newAttributes = Tangerine.config.subtestTemplate;
    prototypeTemplate = Tangerine.config.prototypeTemplates[this.$el.find("#subtest_type_select").val()];
    useType = this.$el.find("#subtest_type_select :selected").attr('data-template');
    useTypeTemplate = Tangerine.config.subtestTemplates[this.$el.find("#subtest_type_select").val()][useType];
    newAttributes = $.extend(newAttributes, prototypeTemplate);
    newAttributes = $.extend(newAttributes, useTypeTemplate);
    newAttributes = $.extend(newAttributes, {
      name: this.$el.find("#new_subtest_name").val(),
      assessmentId: this.model.id,
      order: this.model.subtests.length
    });
    return newSubtest = this.model.subtests.create(newAttributes);
  };

  AssessmentEditView.prototype.deleteSubtest = function(model) {
    this.model.subtests.remove(model);
    return model.destroy();
  };

  AssessmentEditView.prototype.initialize = function(options) {
    console.log("new assessment says");
    console.log(options.model.attributes.name);
    this.views = [];
    this.model = options.model;
    return this.model.subtests.on("change remove", this.render);
  };

  AssessmentEditView.prototype.render = function() {
    var arch, archiveChecked, key, notArchiveChecked, subKey, subValue, subtestTypeSelect, unorderedList, value, _ref,
      _this = this;
    arch = this.model.get('archived');
    console.log("the name is " + this.model.get("name"));
    archiveChecked = arch === true || arch === 'true' ? "checked" : "";
    notArchiveChecked = archiveChecked ? "" : "checked";
    this.$el.html("      <button class='back navigation'>Back</button>        <h1>Assessment Builder</h1>      <div id='basic'>        <label for='assessment_name'>Name</label>        <input id='assessment_name' value='" + (this.model.get("name")) + "'>        <button class='assessment_save confirmation'>Save</button>        <label for='assessment_d_key'>Download Key</label>        <div class='info_box'>" + (this.model.id.substr(-5, 5)) + "</div>      </div>      <div id='archive_buttons'>        <input type='radio' id='archive_false' name='archive' value='false' " + notArchiveChecked + "><label for='archive_false'>Active</label>        <input type='radio' id='archive_true'  name='archive' value='true'  " + archiveChecked + "><label for='archive_true'>Archived</label>      </div>      <h2>Subtests</h2>      <button class='new_subtest_button command'>New</button>      <div class='new_subtest_form confirmation'>        <div class='label_value'>          <label for='new_subtest_type'>Type</label>          <div id='subtest_type'></div>        </div>        <div class='label_value'>          <label for='new_subtest_name'>Name</label>          <input type='text' id='new_subtest_name'>        </div>        <button class='new_subtest_save command'>Save</button><button class='new_subtest_cancel command'>cancel</button>      </div>    ");
    subtestTypeSelect = "<select id='subtest_type_select'>      <option value='' disabled='disabled' selected='selected'>Please select a subtest type</option>";
    _ref = Tangerine.config.subtestTemplates;
    for (key in _ref) {
      value = _ref[key];
      subtestTypeSelect += "<optgroup label='" + key + "'>";
      for (subKey in value) {
        subValue = value[subKey];
        subtestTypeSelect += "<option value='" + key + "' data-template='" + subKey + "'>" + subKey + "</option>";
      }
      subtestTypeSelect += "</optgroup>";
    }
    subtestTypeSelect += "</select>";
    this.$el.find("#subtest_type").html(subtestTypeSelect);
    this.$el.find("#archive_buttons").buttonset();
    unorderedList = $('<ul>').attr('id', 'subtest_list');
    this.closeViews();
    this.views = [];
    this.model.subtests.sort();
    this.model.subtests.each(function(subtest) {
      var oneView;
      oneView = new SubtestListElementView({
        model: subtest
      });
      _this.views.push(oneView);
      oneView.render();
      oneView.on("subtest:delete", _this.deleteSubtest);
      return unorderedList.append(oneView.el);
    });
    this.$el.append(unorderedList);
    this.$el.find("#subtest_list").sortable({
      handle: '.sortable_handle',
      update: function(event, ui) {
        var i, id, li, _len, _ref2, _results;
        _ref2 = (function() {
          var _i, _len, _ref2, _results2;
          _ref2 = this.$el.find("#subtest_list li");
          _results2 = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            li = _ref2[_i];
            _results2.push($(li).attr("data-id"));
          }
          return _results2;
        }).call(_this);
        _results = [];
        for (i = 0, _len = _ref2.length; i < _len; i++) {
          id = _ref2[i];
          _results.push(_this.model.subtests.get(id).set({
            "order": i
          }, {
            silent: true
          }).save(null, {
            silent: true
          }));
        }
        return _results;
      }
    });
    return this.trigger("rendered");
  };

  AssessmentEditView.prototype.onClose = function() {
    return this.closeViews();
  };

  AssessmentEditView.prototype.closeViews = function() {
    var view, _i, _len, _ref, _results;
    _ref = this.views;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      _results.push(view.close());
    }
    return _results;
  };

  return AssessmentEditView;

})(Backbone.View);

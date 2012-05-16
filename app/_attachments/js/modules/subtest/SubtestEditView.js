var SubtestEditView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SubtestEditView = (function(_super) {

  __extends(SubtestEditView, _super);

  function SubtestEditView() {
    this.renderQuestions = __bind(this.renderQuestions, this);
    SubtestEditView.__super__.constructor.apply(this, arguments);
  }

  SubtestEditView.prototype.className = "subtest_edit";

  SubtestEditView.prototype.events = {
    'click .back_button': 'goBack',
    'click .save_subtest': 'save',
    'keydown': 'hijackEnter',
    'click .add_question': 'toggleAddQuestion',
    'click .add_question_cancel': 'toggleAddQuestion',
    'click .add_question_add': 'addQuestion'
  };

  SubtestEditView.prototype.hijackEnter = function(event) {
    if (event.which === 13) return this.save();
  };

  SubtestEditView.prototype.toggleAddQuestion = function() {
    this.$el.find("#add_question_form").fadeToggle(250);
    return false;
  };

  SubtestEditView.prototype.addQuestion = function() {
    var newAttributes, nq;
    newAttributes = $.extend(Tangerine.config.questionTemplate, {
      subtestId: this.model.id,
      assessmentId: this.model.get("assessmentId"),
      order: this.model.questions.length,
      prompt: this.$el.find('#question_prompt').val(),
      name: this.$el.find('#question_name').val()
    });
    nq = this.model.questions.create(newAttributes);
    this.renderQuestions();
    this.$el.find("#add_question_form input").val('');
    return false;
  };

  SubtestEditView.prototype.closeSubViews = function() {
    var subView, _i, _len, _ref, _results;
    _ref = this.subViews;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subView = _ref[_i];
      _results.push(subView.close());
    }
    return _results;
  };

  SubtestEditView.prototype.onClose = function() {
    var _ref;
    this.closeSubViews();
    return (_ref = this.questionsListEdit) != null ? _ref.close() : void 0;
  };

  SubtestEditView.prototype.initialize = function(options) {
    var _this = this;
    this.subViews = [];
    this.questionsEditView = null;
    this.model = options.model;
    this.config = Tangerine.config.subtest;
    if (this.model.get("prototype") === 'survey') {
      this.model.questions = new Questions;
      return this.model.questions.fetch({
        success: function(collection, response) {
          _this.model.questions = new Questions(collection.where({
            subtestId: _this.model.id
          }));
          _this.questionsEditView = new QuestionsEditView({
            questions: _this.model.questions
          });
          _this.model.questions.on("change", _this.renderQuestions);
          return _this.renderQuestions();
        }
      });
    }
  };

  SubtestEditView.prototype.renderQuestions = function() {
    var _ref, _ref2;
    if ((_ref = this.questionsEditView) != null) _ref.render();
    return this.$el.find("#question_list_wrapper").append((_ref2 = this.questionsEditView) != null ? _ref2.el : void 0);
  };

  SubtestEditView.prototype.goBack = function() {
    return Tangerine.router.navigate("edit-id/" + this.model.get("assessmentId"), true);
  };

  SubtestEditView.prototype.save = function() {
    var prototype, question, _i, _len, _ref;
    prototype = this.model.get("prototype");
    this.model.set({
      name: this.$el.find("#subtest_name").val(),
      enumeratorHelp: this.$el.find("#subtest_help").val(),
      studentDialog: this.$el.find("#subtest_dialog").val(),
      skippable: this.$el.find("#skip_radio input:radio[name=skippable]:checked").val()
    });
    if (prototype === 'grid') {
      if (/\t|,/.test(this.$el.find("#subtest_items").val())) {
        Utils.topAlert("Please remember<br><br>Grid items are<br>space \" \" delimited");
      }
      this.model.set({
        timer: this.$el.find("#subtest_timer").val(),
        items: _.compact(this.$el.find("#subtest_items").val().split(" ")),
        columns: this.$el.find("#subtest_columns").val(),
        autostop: this.$el.find("#subtest_autostop").val()
      });
    }
    if (prototype === 'location') {
      this.model.set({
        "provinceText": this.$el.find("#subtest_province_text").val(),
        "districtText": this.$el.find("#subtest_district_text").val(),
        "nameText": this.$el.find("#subtest_name_text").val(),
        "schoolIdText": this.$el.find("#subtest_school_id_text").val()
      });
    }
    if (prototype === 'survey') {
      this.model.set({
        gridLinkId: this.$el.find("#link_select option:selected").val()
      });
      _ref = this.model.questions.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        question = _ref[_i];
        question.save();
      }
    }
    if (this.model.save()) Utils.midAlert("Subtest Saved");
    return false;
  };

  SubtestEditView.prototype.render = function() {
    var autostop, columns, dialog, districtText, gridLinkId, help, items, name, nameText, prototype, provinceText, schoolIdText, skippable, subtests, timer,
      _this = this;
    name = this.model.get("name");
    prototype = this.model.get("prototype");
    help = this.model.get("enumeratorHelp") || "";
    dialog = this.model.get("studentDialog") || "";
    skippable = this.model.get("skippable") === true || this.model.get("skippable") === "true";
    this.$el.html("      <button class='back_button navigation'>back</button><br>      <button class='save_subtest command'>Save Subtest</button>      <form id='subtest_edit_form'>        <div class='label_value'>          <label for='subtest_name'>Name</label>          <input id='subtest_name' value='" + name + "'>        </div>        <div class='label_value'>          <label for='subtest_prototype' title='This is a basic type of subtest. (e.g. Survey, Grid, Location, Id, Consent)'>Prototype</label>" + prototype + "        </div>        <div class='label_value'>          <label>Skippable</label>          <div id='skip_radio'>            <label for='skip_true'>Yes</label><input name='skippable' type='radio' value='true' id='skip_true' " + (skippable ? 'checked' : void 0) + ">            <label for='skip_false'>No</label><input name='skippable' type='radio' value='false' id='skip_false' " + (!skippable ? 'checked' : void 0) + ">          </div>        </div>        <div class='label_value'>          <label for='subtest_help'>Enumerator help</label>          <textarea id='subtest_help' class='richtext'>" + help + "</textarea>        </div>        <div class='label_value'>          <label for='subtest_dialog'>Student Dialog</label>          <textarea id='subtest_dialog' class='richtext'>" + dialog + "</textarea>        </div>        <div id='prototype_attributes'></div>      </form>      <button class='save_subtest command'>Save Subtest</button>");
    if (prototype === "grid") {
      timer = this.model.get("timer") || 0;
      items = this.model.get("items").join(" ");
      columns = this.model.get("columns") || 0;
      autostop = this.model.get("autostop") || 0;
      this.$el.find("#prototype_attributes").html("        <div class='label_value'>          <label for='subtest_items'>Grid Items (space delimited)</label>          <textarea id='subtest_items'>" + items + "</textarea>        </div>        <div class='label_value'>          <label for='subtest_columns'>Columns</label>          <input id='subtest_columns' value='" + columns + "' type='number'>        </div>        <div class='label_value'>          <label for='subtest_autostop'>Autostop</label>          <input id='subtest_autostop' value='" + autostop + "' type='number'>        </div>        <div class='label_value'>          <label for='subtest_timer'>Timer</label>          <input id='subtest_timer' value='" + timer + "' type='number'>        </div>");
    }
    if (prototype === "survey") {
      gridLinkId = this.model.get("gridLinkId") || "";
      this.$el.find("#prototype_attributes").html("        <div id='grid_link'></div>        <div id='questions'>          <h2>Questions</h2>          <div id='question_list_wrapper'></div>          <button class='add_question command'>Add Question</button>          <div id='add_question_form' class='confirmation'>            <div class='menu_box'>              <h2>New Question</h2>              <label for='question_prompt'>Prompt</label>              <input id='question_prompt'>              <label for='question_name'>Data name</label>              <input id='question_name'>              <button class='add_question_add command'>Add</button><button class='add_question_cancel command'>Cancel</button>            </div>          </div>         </div>");
      this.renderQuestions();
      subtests = new Subtests;
      subtests.fetch({
        success: function(collection) {
          var linkSelect, subtest, _i, _len;
          collection = collection.where({
            assessmentId: _this.model.get("assessmentId"),
            prototype: 'grid'
          });
          linkSelect = "            <div class='label_value'>              <label for='link_select'>Linked to grid</label>              <select id='link_select'>              <option value=''>None</option>";
          for (_i = 0, _len = collection.length; _i < _len; _i++) {
            subtest = collection[_i];
            linkSelect += "<option value='" + subtest.id + "' " + (gridLinkId === subtest.id ? 'selected' : '') + ">" + (subtest.get('name')) + "</option>";
          }
          linkSelect += "</select></div>";
          return _this.$el.find('#grid_link').html(linkSelect);
        }
      });
    }
    if (prototype === "location") {
      provinceText = this.model.get("provinceText") || "";
      districtText = this.model.get("districtText") || "";
      nameText = this.model.get("nameText") || "";
      schoolIdText = this.model.get("schoolIdText") || "";
      this.$el.find("#prototype_attributes").html("        <div class='label_value'>          <label for='subtest_province_text'>&quot;Province&quot; label</label>          <input id='subtest_province_text' value='" + provinceText + "'>        </div>        <div class='label_value'>          <label for='subtest_district_text'>&quot;District&quot; label</label>          <input id='subtest_district_text' value='" + districtText + "'>        </div>        <div class='label_value'>          <label for='subtest_name_text'>&quot;School Name&quot; label</label>          <input id='subtest_name_text' value='" + nameText + "'>        </div>        <div class='label_value'>          <label for='subtest_school_id_text'>&quot;School ID&quot; label</label>          <input id='subtest_school_id_text' value='" + schoolIdText + "'>        </div>      ");
    }
    this.$el.find("#skip_radio").buttonset();
    return this.trigger("rendered");
  };

  return SubtestEditView;

})(Backbone.View);

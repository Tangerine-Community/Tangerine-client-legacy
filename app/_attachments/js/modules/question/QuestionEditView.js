var QuestionEditView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

QuestionEditView = (function(_super) {

  __extends(QuestionEditView, _super);

  function QuestionEditView() {
    this.updateModel = __bind(this.updateModel, this);
    this.goBack = __bind(this.goBack, this);
    QuestionEditView.__super__.constructor.apply(this, arguments);
  }

  QuestionEditView.prototype.className = "question_list_element";

  QuestionEditView.prototype.events = {
    'click .back': 'goBack',
    'click .done': 'done',
    'click .add_option': 'addOption',
    'click .delete_option': 'showDeleteConfirm',
    'click .delete_cancel': 'hideDeleteConfirm',
    'click .delete_delete': 'deleteOption',
    'click #question_type input:radio': 'changeQuestionType',
    'keypress': 'hijackEnter',
    'change .option_select': 'templateFill',
    'keypress .option_value': 'quickAddWithEnter',
    'keypress .option_label': 'quickFocusValue'
  };

  QuestionEditView.prototype.quickAddWithEnter = function(event) {
    if ((event.keyCode != null) && event.keyCode !== 13) return true;
    return this.addOption();
  };

  QuestionEditView.prototype.quickFocusValue = function(event) {
    if ((event.keyCode != null) && event.keyCode !== 13) return true;
    return $(event.target).parent().find(".option_value").focus();
  };

  QuestionEditView.prototype.templateFill = function(event) {
    var index;
    index = $(event.target).find("option:selected").attr('data-index');
    this.question.set("options", Tangerine.templates.optionTemplates[index].options);
    this.$el.find('#option_list_wrapper').html(this.getOptionList());
    return false;
  };

  QuestionEditView.prototype.goBack = function() {
    Tangerine.router.navigate("subtest/" + (this.question.get('subtestId')), true);
    return false;
  };

  QuestionEditView.prototype.initialize = function(options) {
    this.question = options.question;
    this.subtest = options.subtest;
    return this.assessment = options.assessment;
  };

  QuestionEditView.prototype.getOptionList = function() {
    var html, i, option, options, _len;
    options = this.question.get("options");
    html = "<div id='option_list_wrapper'>      <h2>Options</h2>      <div class='menu_box'>        <ul class='option_list'>";
    for (i = 0, _len = options.length; i < _len; i++) {
      option = options[i];
      html += "      <li class='question'>        <table><tr><td>          <img src='images/icon_drag.png' class='sortable_handle'>        </td>        <td>          <div style='display: block;'>            <div class='option_label_value'>              <label class='edit' for='options." + i + ".label'>Label</label>              <input id='options." + i + ".label' value='" + (_.escape(option.label)) + "' placeholder='Option label' class='option_label'><br>              <label class='edit' for='options." + i + ".value' title='Allowed characters&#58; A-Z, a-z, 0-9, and underscores.'>Value</label>              <input id='options." + i + ".value' value='" + (_.escape(option.value)) + "' placeholder='Option value' class='option_value'><br>            </div>            <img src='images/icon_delete.png' class='delete_option' data-index='" + i + "'>            <div class='confirmation delete_confirm_" + i + "'>              <button class='delete_delete command_red' data-index='" + i + "'>Delete</button>              <button data-index='" + i + "' class='delete_cancel command'>Cancel</button>            </div>          </div>        </td></tr></table>      </li>      ";
    }
    return html += "</ul>      <button class='add_option command'>Add option</button>      </div>    </div>";
  };

  QuestionEditView.prototype.addOption = function() {
    var optionListElements, options;
    this.updateModel();
    options = this.question.get("options");
    options.push({
      label: "",
      value: ""
    });
    this.question.set("options", options);
    this.$el.find('#option_list_wrapper').html(this.getOptionList());
    optionListElements = this.$el.find("#option_list_wrapper li");
    if (optionListElements.length !== 0) {
      return $(optionListElements.last()).scrollTo().find("input:first").focus();
    }
  };

  QuestionEditView.prototype.render = function() {
    var assessmentName, checkOrRadio, hint, i, linkedGridScore, name, option, optionHTML, options, prompt, skipLogic, skippable, subtestName, type, _len, _ref,
      _this = this;
    assessmentName = this.assessment.escape("name");
    subtestName = this.subtest.escape("name");
    name = this.question.escape("name") || "";
    prompt = this.question.escape("prompt") || "";
    hint = this.question.escape("hint") || "";
    skipLogic = this.question.escape("skipLogic") || "";
    type = this.question.get("type");
    options = this.question.get("options");
    linkedGridScore = this.question.get("linkedGridScore") || 0;
    skippable = this.question.get("skippable") === true || this.question.get("skippable") === "true";
    checkOrRadio = type === "multiple" ? "checkbox" : "radio";
    this.$el.html("      <button class='back navigation'>Back</button>      <h1>Question Editor</h1>      <table class='basic_info'>        <tr>          <th>Subtest</th>          <td>" + subtestName + "</td>        </tr>        <tr>          <th>Assessment</th>          <td>" + assessmentName + "</td>        </tr>      </table>      <button class='done command'>Done</button>      <div class='edit_form'>        <div class='label_value'>          <label for='name'>Variable name</label>          <input id='name' type='text' value='" + name + "'>        </div>        <div class='label_value'>          <label for='prompt'>Prompt</label>          <input id='prompt' type='text' value='" + prompt + "'>        </div>        <div class='label_value'>          <label for='hint'>Hint</label>          <input id='hint' type='text' value='" + hint + "'>        </div>        <div class='label_value'>          <label for='skip-logic'>Skip if <span style='font-size: small;font-weight:normal'>example: ResultOfQuestion(\"maze1\") isnt \"2\"</span></label>          <input id='skip-logic' type='text' value='" + skipLogic + "'>        </div>        <div class='label_value'>          <label>Skippable</label>          <div id='skip_radio' class='buttonset'>            <label for='skip_true'>Yes</label><input name='skippable' type='radio' value='true' id='skip_true' " + (skippable ? 'checked' : void 0) + ">            <label for='skip_false'>No</label><input name='skippable' type='radio' value='false' id='skip_false' " + (!skippable ? 'checked' : void 0) + ">          </div>        </div>        <div class='label_value'>          <label for='linked_grid_score'>Items attempted required on linked grid</label>          <input id='linked_grid_score' type='number' value='" + linkedGridScore + "'>        </div>        <div class='label_value' id='question_type' class='question_type'>          <label>Question Type</label>          <div class='buttonset'>            <label for='single'>single</label>            <input id='single' name='type' type='radio' value='single' " + (type === 'single' ? 'checked' : void 0) + ">            <label for='multiple'>multiple</label>            <input id='multiple' name='type'  type='radio' value='multiple' " + (type === 'multiple' ? 'checked' : void 0) + ">            <label for='open'>open</label>            <input id='open' name='type'  type='radio' value='open' " + (type === 'open' ? 'checked' : void 0) + ">          </div>        </div>        ");
    if (type !== "open") {
      optionHTML = "        <div class='label_value'>        <label for='question_template_select'>Fill from template</label><br>        <div class='menu_box'>          <select id='question_template_select' class='option_select'>            <option disabled selected>Select template</option>        ";
      _ref = Tangerine.templates.optionTemplates;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        option = _ref[i];
        optionHTML += "<option data-index='" + i + "' class='template_option'>" + option.name + "</option>";
      }
      optionHTML += "</select>        </div>        <div id='option_list_wrapper'>" + (this.getOptionList()) + "</div>        ";
      this.$el.append(optionHTML);
      this.$el.find(".option_list").sortable({
        handle: '.sortable_handle',
        start: function(event, ui) {
          return ui.item.addClass("drag_shadow");
        },
        stop: function(event, ui) {
          return ui.item.removeClass("drag_shadow");
        },
        update: function(event, ui) {
          return _this.updateModel();
        }
      });
    }
    this.$el.append("<button class='done command'>Done</button>      </div>      ");
    return this.trigger("rendered");
  };

  QuestionEditView.prototype.hijackEnter = function(event) {
    if (event.which === 13) {
      this.$el.find(event.target).blur();
      return false;
    }
  };

  QuestionEditView.prototype.changeQuestionType = function(event) {
    var $target;
    $target = $(event.target);
    if (($target.val() !== "open" && this.question.get("type") === "open") || ($target.val() === "open" && this.question.get("type") !== "open")) {
      this.updateModel();
      this.question.set("type", $target.val());
      this.question.set("options", []);
      return this.render();
    }
  };

  QuestionEditView.prototype.done = function() {
    this.updateModel();
    if (this.question.save()) {
      Utils.midAlert("Question Saved");
      setTimeout(this.goBack, 500);
    } else {
      Utils.midAlert("Save error");
    }
    return false;
  };

  QuestionEditView.prototype.updateModel = function() {
    var i, label, last, li, optionListElements, options, value, _i, _len;
    this.question.set({
      "prompt": this.$el.find("#prompt").val(),
      "name": this.$el.find("#name").val().safetyDance(),
      "hint": this.$el.find("#hint").val(),
      "skipLogic": this.$el.find("#skip-logic").val(),
      "linkedGridScore": parseInt(this.$el.find("#linked_grid_score").val()),
      "type": this.$el.find("#question_type input:checked").val(),
      "skippable": this.$el.find("#skip_radio input:radio[name=skippable]:checked").val() === "true"
    });
    options = [];
    i = 0;
    optionListElements = this.$el.find(".option_list li");
    for (_i = 0, _len = optionListElements.length; _i < _len; _i++) {
      li = optionListElements[_i];
      label = $(li).find(".option_label").val();
      value = $(li).find(".option_value").val().safetyDance();
      if ((label != null) || (value != null)) {
        options[i] = {
          label: label,
          value: value
        };
        i++;
      }
    }
    if (options.length !== 0) {
      last = options.pop();
      if (last.label !== "" && last.value !== "") options.push(last);
    }
    return this.question.set("options", options);
  };

  QuestionEditView.prototype.showDeleteConfirm = function(event) {
    return this.$el.find(".delete_confirm_" + (this.$el.find(event.target).attr('data-index'))).fadeIn(250);
  };

  QuestionEditView.prototype.hideDeleteConfirm = function(event) {
    return this.$el.find(".delete_confirm_" + (this.$el.find(event.target).attr('data-index'))).fadeOut(250);
  };

  QuestionEditView.prototype.deleteOption = function(event) {
    var options;
    this.updateModel();
    options = this.question.get("options");
    options.splice(this.$el.find(event.target).attr('data-index'), 1);
    this.question.set("options", options);
    this.question.save();
    this.render(false);
    return false;
  };

  return QuestionEditView;

})(Backbone.View);

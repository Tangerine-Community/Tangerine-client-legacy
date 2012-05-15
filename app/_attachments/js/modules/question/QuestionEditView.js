var QuestionEditView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

QuestionEditView = (function(_super) {

  __extends(QuestionEditView, _super);

  function QuestionEditView() {
    this.updateModel = __bind(this.updateModel, this);
    QuestionEditView.__super__.constructor.apply(this, arguments);
  }

  QuestionEditView.prototype.className = "question_list_element";

  QuestionEditView.prototype.tagName = "li";

  QuestionEditView.prototype.events = {
    'click .back': 'back',
    'click .save': 'save',
    'click .add_option': 'addOption',
    'click .delete_option': 'showDeleteConfirm',
    'click .delete_cancel': 'hideDeleteConfirm',
    'click .delete_delete': 'deleteOption',
    'click input:radio': 'changeQuestionType',
    'click .delete_question': 'deleteQuestion',
    'keypress': 'hijackEnter'
  };

  QuestionEditView.prototype.back = function() {
    Tangerine.router.navigate("subtest/" + (this.model.get('subtestId')), true);
    return false;
  };

  QuestionEditView.prototype.initialize = function(options) {
    this.parent = options.parent;
    return this.model = options.model;
  };

  QuestionEditView.prototype.getOptionList = function() {
    var html, i, option, options, _len;
    options = this.model.get("options");
    html = "<div id='option_list_wrapper'>      <h2>Options</h2><ul class='option_list'>";
    for (i = 0, _len = options.length; i < _len; i++) {
      option = options[i];
      html += "      <li class='question'>        <img src='images/icon_drag.png' class='sortable_handle'>        <div class='option_label_value'>          <label class='edit' for='" + this.cid + "_options." + i + ".label'>Label</label>          <input id='" + this.cid + "_options." + i + ".label' value='" + option.label + "' placeholder='Option label' class='option_label'><br>          <label class='edit' for='" + this.cid + "_options." + i + ".value'>Value</label>          <input id='" + this.cid + "_options." + i + ".value' value='" + option.value + "' placeholder='Option value' class='option_value'>        </div>        <img src='images/icon_delete.png' class='delete_option' data-index='" + i + "'>        <div class='confirmation delete_confirm_" + i + "'><button class='delete_delete' data-index='" + i + "'>Delete</button><button data-index='" + i + "' class='delete_cancel'>Cancel</button></div>      </li>      ";
    }
    return html += "</ul>      <button class='add_option command'>Add option</button>          </div>";
  };

  QuestionEditView.prototype.addOption = function() {
    var options;
    this.updateModel();
    options = this.model.get("options");
    options.push({
      label: "",
      value: ""
    });
    this.model.set("options", options);
    return this.$el.find('#option_list_wrapper').html(this.getOptionList());
  };

  QuestionEditView.prototype.render = function() {
    var checkOrRadio, hint, linkedGridScore, name, options, prompt, type,
      _this = this;
    name = this.model.get("name") || "";
    prompt = this.model.get("prompt") || "";
    hint = this.model.get("hint") || "";
    type = this.model.get("type");
    options = this.model.get("options");
    linkedGridScore = this.model.get("linkedGridScore") || 0;
    checkOrRadio = type === "multiple" ? "checkbox" : "radio";
    this.$el.html("      <button class='back navigation'>Back</button>      <h1>Question Editor</h1>      <div class='edit_form question'>        <div class='label_value'>          <label for='" + this.cid + "_name'>Data name</label>          <input id='" + this.cid + "_name' type='text' value='" + name + "'>        </div>        <div class='label_value'>          <label for='" + this.cid + "_prompt'>Prompt</label>          <input id='" + this.cid + "_prompt' type='text' value='" + prompt + "'>        </div>        <div class='label_value'>          <label for='" + this.cid + "_hint'>Hint</label>          <input id='" + this.cid + "_hint' type='text' value='" + hint + "'>        </div>        <div class='label_value'>          <label for='" + this.cid + "_linked_grid_score'>Linked grid score</label>          <input id='" + this.cid + "_linked_grid_score' type='number' value='" + linkedGridScore + "'>        </div>        <div class='label_value' id='" + this.cid + "_question_type' class='question_type'>          <label>Question Type</label>          <label for='" + this.cid + "_single'>single</label>          <input id='" + this.cid + "_single' name='" + this.cid + "_type' type='radio' value='single' " + (type === 'single' ? 'checked' : void 0) + ">          <label for='" + this.cid + "_multiple'>multiple</label>          <input id='" + this.cid + "_multiple' name='" + this.cid + "_type'  type='radio' value='multiple' " + (type === 'multiple' ? 'checked' : void 0) + ">          <label for='" + this.cid + "_open'>open</label>          <input id='" + this.cid + "_open' name='" + this.cid + "_type'  type='radio' value='open' " + (type === 'open' ? 'checked' : void 0) + ">        </div>        ");
    if (type !== "open") {
      this.$el.append("      <div class='label_value'>      <label for='" + this.cid + "_question_template_select'>Fill from template</label>      <select id='" + this.cid + "_question_template_select'>        <option disabled selected>Select template</option>      </select>            " + (this.getOptionList()) + "      ");
      this.$el.find(".option_list").sortable({
        handle: '.sortable_handle',
        update: function(event, ui) {
          return _this.updateModel();
        }
      });
    }
    this.$el.append("<button class='save command'>Save</button><button class='delete_question command'>Delete</button>      </div>      ");
    this.$el.find("#" + this.cid + "_question_type").buttonset();
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
    if (($target.val() !== "open" && this.model.get("type") === "open") || ($target.val() === "open" && this.model.get("type") !== "open")) {
      this.model.set("type", $target.val());
      this.model.set("options", []);
      return this.render(false);
    }
  };

  QuestionEditView.prototype.save = function() {
    var alertText;
    this.updateModel();
    if (this.model.save()) {
      alertText = "Question Saved";
      if (this.saveMessage) {
        alertText += this.saveMessage;
        this.saveMessage = '';
      }
      Utils.midAlert(alertText);
    }
    this.savedMessage = "";
    window.onbeforeunload = null;
    return false;
  };

  QuestionEditView.prototype.deleteQuestion = function() {
    this.parent.questions.remove(this.model);
    this.model.destroy();
    this.parentView.render();
    return false;
  };

  QuestionEditView.prototype.updateModel = function() {
    var i, label, li, optionListElements, options, value, _i, _len;
    this.model.set({
      "prompt": this.$el.find("#" + this.cid + "_prompt").val(),
      "name": this.$el.find("#" + this.cid + "_name").val(),
      "hint": this.$el.find("#" + this.cid + "_hint").val(),
      "linkedGridScore": this.$el.find("#" + this.cid + "_linked_grid_score").val(),
      "type": this.$el.find("#" + this.cid + "_question_type input:checked").val()
    });
    options = [];
    i = 0;
    optionListElements = this.$el.find(".option_list li");
    for (_i = 0, _len = optionListElements.length; _i < _len; _i++) {
      li = optionListElements[_i];
      label = $(li).find(".option_label").val();
      value = $(li).find(".option_value").val();
      if ((label != null) || (value != null)) {
        options[i] = {
          label: label,
          value: value
        };
        i++;
      }
    }
    return this.model.set("options", options);
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
    options = this.model.get("options");
    options.splice(this.$el.find(event.target).attr('data-index'), 1);
    this.model.set("options", options);
    this.model.save();
    this.render(false);
    return false;
  };

  return QuestionEditView;

})(Backbone.View);

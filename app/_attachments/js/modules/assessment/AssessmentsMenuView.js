var AssessmentsMenuView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentsMenuView = (function(_super) {

  __extends(AssessmentsMenuView, _super);

  function AssessmentsMenuView() {
    this.newSave = __bind(this.newSave, this);
    this.addToCollection = __bind(this.addToCollection, this);
    this.render = __bind(this.render, this);
    AssessmentsMenuView.__super__.constructor.apply(this, arguments);
  }

  AssessmentsMenuView.prototype.events = {
    'keypress .new_name': 'newSave',
    'click .new_save': 'newSave',
    'click .new_cancel': 'newToggle',
    'click .new': 'newToggle',
    'click .import': 'import',
    'click .groups': 'gotoGroups'
  };

  AssessmentsMenuView.prototype.gotoGroups = function() {
    return Tangerine.router.navigate("groups", true);
  };

  AssessmentsMenuView.prototype["import"] = function() {
    return Tangerine.router.navigate("import", true);
  };

  AssessmentsMenuView.prototype.initialize = function(options) {
    var _this = this;
    this.assessments = options.assessments;
    this.assessments.each(function(assessment) {
      return assessment.on("new", _this.addToCollection);
    });
    this.isAdmin = Tangerine.user.isAdmin();
    this.curriculaListView = new CurriculaListView({
      "curricula": options.curricula
    });
    this.assessmentsView = new AssessmentsView({
      "assessments": this.assessments,
      "parent": this
    });
    return this.usersMenuView = new UsersMenuView;
  };

  AssessmentsMenuView.prototype.render = function() {
    var groupsButton, html, importButton, newButton;
    newButton = "<button class='new command'>New</button>";
    importButton = "<button class='import command'>Import</button>";
    groupsButton = "<button class='navigation groups'>Groups</button>";
    html = "      " + (Tangerine.settings.get("context") === "server" ? groupsButton : "") + "      <h1>Assessments</h1>    ";
    if (this.isAdmin) {
      html += "        " + (Tangerine.settings.get("context") === "server" ? newButton : "") + "        " + (Tangerine.settings.get("context") === "mobile" ? importButton : "") + "        <div class='new_form confirmation'>          <div class='menu_box_wide'>            <input type='text' class='new_name' placeholder='Name'>            <select id='new_type'>              <option value='assessment'>Assessment</option>              <option value='curriculum'>Curriculum</option>            </select><br>            <button class='new_save command'>Save</button> <button class='new_cancel command'>Cancel</button>          </div>        </div>        <div id='assessments_container'></div>        <div id='users_menu_container' class='UsersMenuView'></div>      ";
    } else {
      html += "<div id='assessments_container'></div>";
    }
    this.$el.html(html);
    this.assessmentsView.setElement(this.$el.find("#assessments_container"));
    this.assessmentsView.render();
    this.usersMenuView.setElement(this.$el.find("#users_menu_container"));
    this.usersMenuView.render();
    this.trigger("rendered");
  };

  AssessmentsMenuView.prototype.addToCollection = function(newAssessment) {
    this.assessments.add(newAssessment);
    return newAssessment.on("new", this.addToCollection);
  };

  AssessmentsMenuView.prototype.newToggle = function() {
    this.$el.find('.new_form, .new').fadeToggle(250);
    return false;
  };

  AssessmentsMenuView.prototype.newSave = function(event) {
    var name, newId, newObject, newType,
      _this = this;
    if (event.type !== "click" && event.which !== 13) return true;
    name = this.$el.find('.new_name').val();
    newType = this.$el.find("#new_type option:selected").val();
    newId = Utils.guid();
    if (name.length === 0) {
      Utils.midAlert("<span class='error'>Could not save <img src='images/icon_close.png' class='clear_message'></span>");
      return false;
    }
    if (newType === "assessment") {
      newObject = new Assessment({
        "name": name,
        "_id": newId,
        "assessmentId": newId,
        "archived": false
      });
    } else if (newType === "curriculum") {
      newObject = new Curriculum({
        "name": name,
        "_id": newId,
        "curriculumId": newId
      });
    }
    newObject.save(null, {
      success: function() {
        _this.addToCollection(newObject);
        _this.$el.find('.new_form, .new').fadeToggle(250, function() {
          return _this.$el.find('.new_name').val("");
        });
        return Utils.midAlert("" + name + " saved");
      },
      error: function() {
        _this.addToCollection(newObject);
        _this.$el.find('.new_form, .new').fadeToggle(250, function() {
          return _this.$el.find('.new_name').val("");
        });
        return Utils.midAlert("Please try again. Error saving.");
      }
    });
    return false;
  };

  AssessmentsMenuView.prototype.closeViews = function() {
    return this.assessmentsView.close();
  };

  AssessmentsMenuView.prototype.onClose = function() {
    return this.closeViews();
  };

  return AssessmentsMenuView;

})(Backbone.View);

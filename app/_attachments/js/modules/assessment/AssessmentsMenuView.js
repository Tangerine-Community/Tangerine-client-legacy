var AssessmentsMenuView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentsMenuView = (function(_super) {

  __extends(AssessmentsMenuView, _super);

  function AssessmentsMenuView() {
    this.newAssessmentSave = __bind(this.newAssessmentSave, this);
    this.addToCollection = __bind(this.addToCollection, this);
    this.render = __bind(this.render, this);
    AssessmentsMenuView.__super__.constructor.apply(this, arguments);
  }

  AssessmentsMenuView.prototype.events = {
    'keypress .new_assessment_name': 'newAssessmentSave',
    'click .new_assessment_save': 'newAssessmentSave',
    'click .new_assessment_cancel': 'newAssessmentToggle',
    'click .new_assessment': 'newAssessmentToggle',
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
    var group, view, _i, _len, _ref, _results,
      _this = this;
    this.assessments = options.assessments;
    this.group = options.group;
    this.assessments.each(function(assessment) {
      return assessment.on("new", _this.addToCollection);
    });
    this.isAdmin = Tangerine.user.isAdmin();
    this.sections = [this.group, "public"];
    if (this.group === "public") this.sections.pop();
    this.curriculaListView = new CurriculaListView({
      "curricula": options.curricula
    });
    this.groupViews = [];
    if (Tangerine.settings.context === "server") {
      _ref = this.sections;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        view = new AssessmentsView({
          "group": group,
          "homeGroup": this.group,
          "assessments": this.assessments,
          "parent": this
        });
        _results.push(this.groupViews.push(view));
      }
      return _results;
    } else if (Tangerine.settings.context === "mobile") {
      return this.listView = new AssessmentsView({
        "group": false,
        "homeGroup": this.group,
        "assessments": this.assessments,
        "parent": this
      });
    }
  };

  AssessmentsMenuView.prototype.render = function() {
    var groupsButton, html, i, importButton, newButton, view, _len, _ref;
    newButton = "<button class='new_assessment command'>New</button>";
    importButton = "<button class='import command'>Import</button>";
    groupsButton = "<button class='navigation groups'>Groups</button>";
    html = "      " + (Tangerine.settings.context === "server" ? groupsButton : "") + "      <h1>Assessments</h1>      ";
    if (this.isAdmin) {
      html += "        " + (Tangerine.settings.context === "server" ? newButton : "") + "        " + (Tangerine.settings.context === "mobile" ? importButton : "") + "        <div class='new_assessment_form confirmation'>          <div class='menu_box_wide'>            <input type='text' class='new_assessment_name' placeholder='Assessment Name'>            <button class='new_assessment_save command'>Save</button> <button class='new_assessment_cancel command'>Cancel</button>          </div>        </div>      ";
    }
    this.$el.html(html);
    if (Tangerine.settings.context === "server") {
      _ref = this.groupViews;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        view = _ref[i];
        view.render();
        this.$el.append(view.el);
      }
    } else if (Tangerine.settings.context === "mobile") {
      this.listView.render();
      this.$el.append(this.listView.el);
    }
    this.trigger("rendered");
  };

  AssessmentsMenuView.prototype.addToCollection = function(newAssessment) {
    this.assessments.add(newAssessment);
    return newAssessment.on("new", this.addToCollection);
  };

  AssessmentsMenuView.prototype.newAssessmentToggle = function() {
    this.$el.find('.new_assessment_form, .new_assessment').fadeToggle(250);
    return false;
  };

  AssessmentsMenuView.prototype.newAssessmentSave = function(event) {
    var name, newAssessment, newId,
      _this = this;
    if (event.type !== "click" && event.which !== 13) return true;
    name = this.$el.find('.new_assessment_name').val();
    if (name.length !== 0) {
      newId = Utils.guid();
      newAssessment = new Assessment;
      newAssessment.save({
        "_id": newId,
        "assessmentId": newId,
        "archived": false,
        "name": name,
        "group": this.group
      }, {
        success: function(assessment) {
          _this.assessments.add(newAssessment);
          _this.$el.find('.new_assessment_form, .new_assessment').fadeToggle(250, function() {
            return _this.$el.find('.new_assessment_name').val("");
          });
          return Utils.midAlert("" + name + " saved");
        }
      });
    } else {
      Utils.midAlert("<span class='error'>Could not save <img src='images/icon_close.png' class='clear_message'></span>");
    }
    return false;
  };

  AssessmentsMenuView.prototype.closeViews = function() {
    var view, _base, _i, _len, _ref, _results;
    if (typeof (_base = this.curriculaListView).close === "function") {
      _base.close();
    }
    _ref = this.groupViews;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      _results.push(view.close());
    }
    return _results;
  };

  AssessmentsMenuView.prototype.onClose = function() {
    return this.closeViews();
  };

  return AssessmentsMenuView;

})(Backbone.View);

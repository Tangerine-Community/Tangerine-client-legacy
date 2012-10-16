var AssessmentListView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentListView = (function(_super) {

  __extends(AssessmentListView, _super);

  function AssessmentListView() {
    this.newAssessmentSave = __bind(this.newAssessmentSave, this);
    this.render = __bind(this.render, this);
    this.refresh = __bind(this.refresh, this);
    AssessmentListView.__super__.constructor.apply(this, arguments);
  }

  AssessmentListView.prototype.events = {
    'keypress .new_assessment_name': 'newAssessmentSave',
    'click .new_assessment_save': 'newAssessmentSave',
    'click .new_assessment_cancel': 'newAssessmentToggle',
    'click .new_assessment': 'newAssessmentToggle',
    'click .import': 'import',
    'click .groups': 'gotoGroups'
  };

  AssessmentListView.prototype.gotoGroups = function() {
    return Tangerine.router.navigate("groups", true);
  };

  AssessmentListView.prototype["import"] = function() {
    return Tangerine.router.navigate("import", true);
  };

  AssessmentListView.prototype.initialize = function(options) {
    var group, view, _i, _len, _ref, _results;
    this.assessments = options.assessments;
    this.group = options.group;
    this.curriculaListView = new CurriculaListView({
      "curricula": options.curricula
    });
    this.isAdmin = Tangerine.user.isAdmin();
    this.views = [];
    this.publicViews = [];
    this.sections = [this.group, "public"];
    this.groupViews = [];
    if (Tangerine.settings.context === "server") {
      _ref = this.sections;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        view = new AssessmentsView({
          "group": group,
          "allAssessments": this.assessments,
          "parent": this
        });
        _results.push(this.groupViews.push(view));
      }
      return _results;
    } else if (Tangerine.settings.context === "mobile") {
      return this.listView = new AssessmentsView({
        "group": false,
        "allAssessments": this.assessments,
        "parent": this
      });
    }
  };

  AssessmentListView.prototype.refresh = function() {
    var _this = this;
    this.assessments = new Assessments;
    return this.assessments.fetch({
      success: function(assessments) {
        var view, _i, _len, _ref, _results;
        _ref = _this.groupViews;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          view = _ref[_i];
          view.allAssessments = assessments;
          _results.push(view.refresh(true));
        }
        return _results;
      }
    });
  };

  AssessmentListView.prototype.render = function() {
    var assessment, groupsButton, html, i, importButton, newButton, oneView, publicList, view, _i, _len, _len2, _ref, _ref2, _ref3, _ref4, _ref5;
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
        this.$el.append("<h2>" + (this.sections[i].titleize()) + " (" + view.assessments.length + ")</h2><ul id='group_" + view.cid + "' class='assessment_list'></ul>");
        view.setElement(this.$el.find("#group_" + view.cid));
        view.render();
      }
    } else if (Tangerine.settings.context === "mobile") {
      this.$el.append("<ul class='assessment_list'></ul>");
      this.listView.setElement(this.$el.find("ul.assessment_list"));
      this.listView.render();
    }
    this.trigger("rendered");
    return;
    if (this.isAdmin && Tangerine.settings.context === "server") {
      this.$el.append("<h2>Public assessments</h2>");
      if (((_ref2 = this.public) != null ? (_ref3 = _ref2.models) != null ? _ref3.length : void 0 : void 0) > 0) {
        publicList = $('<ul>').addClass('public_list assessment_list');
        _ref5 = (_ref4 = this.public) != null ? _ref4.models : void 0;
        for (_i = 0, _len2 = _ref5.length; _i < _len2; _i++) {
          assessment = _ref5[_i];
          oneView = new AssessmentListElementView({
            model: assessment,
            parent: this,
            isPublic: true
          });
          this.publicViews.push(oneView);
          oneView.render();
          publicList.append(oneView.el);
        }
      } else {
        this.$el.append("<p>No assessments available.</p>");
      }
      this.$el.append(publicList);
      if (this.options.curricula.length !== 0) {
        this.curriculaListView.render();
        this.$el.append("<h2>Curricula</h2>");
        this.$el.append(this.curriculaListView.el);
      }
    }
    return this.trigger("rendered");
  };

  AssessmentListView.prototype.newAssessmentToggle = function() {
    this.$el.find('.new_assessment_form, .new_assessment').fadeToggle(250);
    return false;
  };

  AssessmentListView.prototype.newAssessmentSave = function(event) {
    var name, newAssessment, newId,
      _this = this;
    if (event.type !== "click" && event.which !== 13) return true;
    name = this.$el.find('.new_assessment_name').val();
    if (name.length !== 0) {
      newId = Utils.guid();
      newAssessment = new Assessment({
        'name': name,
        'group': this.group,
        '_id': newId,
        'assessmentId': newId
      });
      newAssessment.save(null, {
        success: function() {
          _this.refresh();
          return _this.$el.find('.new_assessment_form, .new_assessment').fadeToggle(250, function() {
            return _this.$el.find('.new_assessment_name').val("");
          });
        }
      });
      Utils.midAlert("" + name + " saved");
    } else {
      Utils.midAlert("<span class='error'>Could not save <img src='images/icon_close.png' class='clear_message'></span>");
    }
    return false;
  };

  AssessmentListView.prototype.closeViews = function() {
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

  AssessmentListView.prototype.onClose = function() {
    return this.closeViews();
  };

  return AssessmentListView;

})(Backbone.View);

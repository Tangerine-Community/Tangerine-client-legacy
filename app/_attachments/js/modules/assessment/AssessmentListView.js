var AssessmentListView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentListView = (function(_super) {

  __extends(AssessmentListView, _super);

  function AssessmentListView() {
    this.render = __bind(this.render, this);
    AssessmentListView.__super__.constructor.apply(this, arguments);
  }

  AssessmentListView.prototype.events = {
    'submit form': 'newAssessmentSave',
    'click .new_assessment_save': 'newAssessmentSave',
    'click .new_assessment_cancel': 'newAssessmentHide',
    'click .add_assessment': 'newAssessmentShow'
  };

  AssessmentListView.prototype.newAssessmentShow = function() {
    return this.$el.find('.new_assessment_form').show(250);
  };

  AssessmentListView.prototype.newAssessmentHide = function() {
    return this.$el.find('.new_assessment_form').fadeOut(250);
  };

  AssessmentListView.prototype.newAssessmentValid = function() {
    return this.$el.find('.new_assessment_name').val() !== "";
  };

  AssessmentListView.prototype.newAssessmentSave = function() {
    var newAssessment;
    if (this.newAssessmentValid) {
      return newAssessment = new Assessment({
        'name': this.$el.find('.new_assessment_name')
      });
    } else {
      return this.$el.find('messages').append("<span class='error'>Error saving changes <img src='images/icon_close.png' class='clear_message'></span>");
    }
  };

  AssessmentListView.prototype.initialize = function(options) {
    var _this = this;
    this.isAdmin = Tangerine.user.isAdmin;
    this.views = [];
    this.collection = new Assessments(null, {
      group: Tangerine.user.group,
      comparator: function(a, b) {
        if (a.name > b.name) {
          return 1;
        } else {
          return -1;
        }
      }
    });
    this.collection.on("change", this.render);
    return this.collection.fetch({
      success: function() {
        _this.collection.filter(function(a, b, c) {
          return function() {
            return true;
          };
        });
        return _this.collection.trigger("change");
      }
    });
  };

  AssessmentListView.prototype.initializeSubmenu = function() {
    console.log("test");
    if (this.isAdmin) {
      return $("nav#submenu").html("<button data-submenu='new'>new</button>");
    }
  };

  AssessmentListView.prototype.submenuHandler = function(event) {
    var submenu;
    submenu = $(event.target).attr("data-submenu");
    console.log("test");
    console.log(submenu);
    if (submenu === "new") return this.newAssessmentShow();
  };

  AssessmentListView.prototype.render = function() {
    var assessment, oneView, unorderedList, _i, _len, _ref;
    this.closeViews();
    this.views = [];
    this.$el.html("      <h2>Assessments</h2>      <form class='new_assessment_form'>        <input type='text' class='new_assessment_name' placeholder='Assessment Name'>        <button class='new_assessment_save'>Save</button>        <button class='new_assessment_cancel'>Cancel</button>      </form>      ");
    unorderedList = $('<ul>').addClass('assessment_list');
    _ref = this.collection.models;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      assessment = _ref[_i];
      oneView = new AssessmentElementView({
        model: assessment
      });
      this.views.push(oneView);
      oneView.render();
      unorderedList.append(oneView.el);
    }
    this.$el.append(unorderedList);
    return this.trigger("rendered");
  };

  AssessmentListView.prototype.closeViews = function() {
    return _.each(this.views, function(view) {
      return view.close;
    });
  };

  AssessmentListView.prototype.onClose = function() {
    return this.closeViews();
  };

  return AssessmentListView;

})(Backbone.View);

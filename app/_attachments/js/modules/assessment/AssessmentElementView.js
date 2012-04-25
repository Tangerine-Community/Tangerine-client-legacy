var AssessmentElementView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentElementView = (function(_super) {

  __extends(AssessmentElementView, _super);

  function AssessmentElementView() {
    AssessmentElementView.__super__.constructor.apply(this, arguments);
  }

  AssessmentElementView.prototype.tagName = "li";

  AssessmentElementView.prototype.events = {
    'click .link_icon': 'navigate',
    'click .assessment_menu_toggle': 'assessmentMenuToggle',
    'click .assessment_delete': 'assessmentDeleteShow',
    'click .assessment_delete_cancel': 'assessmentDeleteShow',
    'click .assessment_delete_confirm': 'assessmentDeleteHide'
  };

  AssessmentElementView.prototype.initialize = function(options) {
    this.isAdmin = Tangerine.user.isAdmin;
    return this.model = options.model;
  };

  AssessmentElementView.prototype.navigate = function(event) {
    var whereTo;
    whereTo = $(event.target).attr('data-href');
    return Tangerine.router.navigate(whereTo, true);
  };

  AssessmentElementView.prototype.assessmentMenuToggle = function() {
    var toggleChar;
    toggleChar = this.$el.find('.assessment_menu_toggle');
    if (toggleChar.html() === '&gt; ') {
      toggleChar.html('&nabla; ');
    } else {
      toggleChar.html("&gt; ");
    }
    return this.$el.find('.assessment_menu').toggle(250);
  };

  AssessmentElementView.prototype.assessmentDeleteShow = function() {
    return this.$el.find(".assessment_delete_confirm").show(250);
  };

  AssessmentElementView.prototype.assessmentDeleteHide = function() {
    return this.$el.find(".assessment_delete_confirm").fadeOut(250);
  };

  AssessmentElementView.prototype.render = function() {
    var deleteButton, editButton, name, resultCount, resultsButton, runButton, subtestCount;
    deleteButton = "<img data-href='delete' class='assessment_delete' src='images/icon_delete.png'><span class='assessment_delete_confirm'>Are you sure? <button class='assessment_delete_yes'>Yes</button> <button class='assessment_delete_cancel'>Cancel</button></span>";
    editButton = "<img data-href='edit/" + (this.model.get('id')) + "' class='link_icon' src='images/icon_edit.png'>";
    resultsButton = "<img data-href='results' class='link_icon' src='images/icon_result.png'>";
    runButton = "<img data-href='run/" + (this.model.get('id')) + "' class='link_icon' src='images/icon_run.png'>";
    name = "<span class='name'>" + (this.model.get('name')) + "</span>";
    resultCount = "<span class='resultCount'>" + (this.model.get('resultCount') || '0') + " results</span>";
    subtestCount = this.model.get('urlPathsForPages').length;
    if (this.isAdmin) {
      return this.$el.html("        <div>          <span class='assessment_menu_toggle clickable'>&gt; </span>            " + name + "             " + resultCount + "        </div>        <div class='assessment_menu'>          " + runButton + "          " + resultsButton + "          " + editButton + "          " + deleteButton + "        </div>");
    } else {
      return this.$el.html("<div>" + runButton + name + " " + resultsButton + resultCount + "</div>");
    }
  };

  return AssessmentElementView;

})(Backbone.View);

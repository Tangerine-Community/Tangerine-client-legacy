var AssessmentListElementView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentListElementView = (function(_super) {

  __extends(AssessmentListElementView, _super);

  function AssessmentListElementView() {
    AssessmentListElementView.__super__.constructor.apply(this, arguments);
  }

  AssessmentListElementView.prototype.tagName = "li";

  AssessmentListElementView.prototype.events = {
    'click .link_icon': 'navigate',
    'click .assessment_menu_toggle': 'assessmentMenuToggle',
    'click .admin_name': 'assessmentMenuToggle',
    'click .assessment_delete': 'assessmentDeleteToggle',
    'click .assessment_delete_cancel': 'assessmentDeleteToggle',
    'click .assessment_delete_confirm': 'assessmentDelete',
    'click .copy': 'copyToGroup',
    'click .duplicate': 'duplicate'
  };

  AssessmentListElementView.prototype.initialize = function(options) {
    this.parent = options.parent;
    this.isAdmin = Tangerine.user.isAdmin();
    this.isPublic = options.isPublic;
    return this.model = options.model;
  };

  AssessmentListElementView.prototype.navigate = function(event) {
    var whereTo;
    whereTo = this.$el.find(event.target).attr('data-href');
    return Tangerine.router.navigate(whereTo, true);
  };

  AssessmentListElementView.prototype.duplicate = function() {
    var newName,
      _this = this;
    newName = "Copy of " + this.model.get("name");
    return this.model.duplicate({
      name: newName
    }, null, null, function() {
      _this.render();
      return _this.parent.refresh();
    });
  };

  AssessmentListElementView.prototype.copyToGroup = function() {
    var _this = this;
    return this.model.duplicate({
      group: Tangerine.user.groups[0]
    }, null, null, function() {
      _this.render();
      return _this.parent.refresh();
    });
  };

  AssessmentListElementView.prototype.assessmentMenuToggle = function() {
    this.$el.find('.assessment_menu_toggle').toggleClass('icon_down');
    return this.$el.find('.assessment_menu').fadeToggle(250);
  };

  AssessmentListElementView.prototype.assessmentDeleteToggle = function() {
    this.$el.find(".assessment_delete_confirm").fadeToggle(250);
    return false;
  };

  AssessmentListElementView.prototype.assessmentDelete = function() {
    var _this = this;
    return this.$el.fadeOut(250, function() {
      var assessmentId, questions, subtests;
      _this.parent.collection.remove(_this.model);
      assessmentId = _this.model.id;
      subtests = new Subtests;
      subtests.fetch({
        success: function(collection) {
          var model, _i, _len, _ref, _results;
          _ref = collection.where({
            "assessmentId": assessmentId
          });
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            model = _ref[_i];
            _results.push(model.destroy());
          }
          return _results;
        }
      });
      questions = new Questions;
      questions.fetch({
        success: function(collection) {
          var model, _i, _len, _ref, _results;
          _ref = collection.where({
            "assessmentId": assessmentId
          });
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            model = _ref[_i];
            _results.push(model.destroy());
          }
          return _results;
        }
      });
      _this.model.destroy();
      return false;
    });
  };

  AssessmentListElementView.prototype.render = function() {
    var adminName, archiveClass, copyButton, deleteButton, duplicateButton, editButton, html, name, resultCount, resultsButton, runButton, toggleButton;
    archiveClass = this.model.get('archived') === true || this.model.get('archived') === 'true' ? " archived_assessment" : "";
    copyButton = "<button class='copy command'>Copy to group</button>";
    toggleButton = "<span class='assessment_menu_toggle icon_ryte'> </span>";
    deleteButton = "<img class='assessment_delete' src='images/icon_delete.png'> <span class='assessment_delete_confirm'>Confirm <button class='assessment_delete_yes'>Delete</button> <button class='assessment_delete_cancel'>Cancel</button></span>";
    duplicateButton = "<button class='duplicate command'>Duplicate</button>";
    editButton = "<img class='link_icon' data-href='edit/" + (this.model.get('name')) + "' src='images/icon_edit.png'>";
    resultsButton = "<img class='link_icon' data-href='results/" + (this.model.get('name')) + "' src='images/icon_result.png'>";
    runButton = "<img class='link_icon' data-href='run/" + (this.model.get('name')) + "' src='images/icon_run.png'>";
    name = "<span class='name clickable '>" + (this.model.get('name')) + "</span>";
    adminName = "<span class='admin_name clickable " + archiveClass + "'>" + (this.model.get('name')) + "</span>";
    resultCount = "<span class='resultCount'>" + (this.model.get('resultCount') || '0') + " results</span>";
    if (this.isAdmin) {
      html = "        <div>          " + toggleButton + "          " + adminName + "         </div>      ";
      if (Tangerine.context.mobile) {
        html += "          <div class='assessment_menu'>            " + runButton + "            " + resultsButton + "            " + deleteButton + "          </div>        ";
      } else {
        if (this.isPublic) {
          html += "            <div class='assessment_menu'>              " + copyButton + "            </div>          ";
        } else {
          html += "            <div class='assessment_menu'>              " + runButton + "              " + resultsButton + "              " + editButton + "              " + duplicateButton + "              " + deleteButton + "            </div>          ";
        }
      }
    } else {
      html = "<div>" + runButton + name + " " + resultsButton + "</div>";
    }
    return this.$el.html(html);
  };

  return AssessmentListElementView;

})(Backbone.View);

var ManageView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ManageView = (function(_super) {

  __extends(ManageView, _super);

  function ManageView() {
    this.newAssessment = __bind(this.newAssessment, this);
    this.render = __bind(this.render, this);
    ManageView.__super__.constructor.apply(this, arguments);
  }

  ManageView.prototype.initialize = function() {};

  ManageView.prototype.el = $('#content');

  ManageView.prototype.events = {
    "click button:contains(Update Tangerine)": "updateTangerine",
    "click button:contains(Update Result Views)": "updateResultViews",
    "click button:contains(Initialize Database)": "initializeDatabase",
    "click button:contains(Add New Assessment)": "showAssessmentForm",
    "click form.newAssessment button:contains(Add)": "newAssessment",
    "click #manage-assessments button:contains(Delete)": "revealDelete",
    "click #manage-assessments .confirm button:contains(Yes)": "delete"
  };

  ManageView.prototype.render = function(assessmentCollection) {
    var _this = this;
    this.assessmentCollection = assessmentCollection;
    this.el.html("      <h1>Manage</h1>      <div id='message'></div>      <button>Update Result Views</button><br/>      <!--      <button>Update Tangerine</button><br/>      <button>New Assessment</button><br/>      -->      <button>Add New Assessment</button>      <form class='newAssessment' style='display:none'>        <label for='_id'>Assessment Name</label>        <input type='text' name='name' value=''></input>        <button>Add</button>      </form>      <br/>      <h2>Existing Assessments:</h2>      <table id='manage-assessments'></table>    ");
    return $.couch.allDbs({
      success: function(databases) {
        _this.databases = databases;
        return _this.assessmentCollection.each(function(assessment) {
          return _this.addAssessmentToList(assessment);
        });
      }
    });
  };

  ManageView.prototype.addAssessmentToList = function(assessment) {
    var assessmentName, assessmentResultDatabaseName;
    assessmentName = assessment.get("name");
    assessmentResultDatabaseName = assessmentName.toLowerCase().dasherize();
    return $("#manage-assessments").append("      <tr data-assessment='" + assessment.id + "'>        <td>" + assessmentName + "</td>        " + (!_.include(this.databases, assessmentResultDatabaseName) ? "<td>            <button href='" + assessmentResultDatabaseName + "'>Initialize Database</button>          </td>" : void 0) + "        <td>          <a href='#results/" + assessmentResultDatabaseName + "'>Results</a>        </td>        <td>          <a href='#edit/assessment/" + assessment.id + "'>Edit</a>        </td>        <td>          <button>Delete</button>          <span class='confirm' style='background-color:red; display:none'>            Are you sure?            <button data-assessment='" + assessment.id + "'>Yes</button>          </span>        </td>      </tr>    ");
  };

  ManageView.prototype.revealDelete = function(event) {
    return $(event.target).next(".confirm").show().fadeOut(5000);
  };

  ManageView.prototype["delete"] = function(event) {
    var assessment;
    assessment = this.assessmentCollection.get($(event.target).attr("data-assessment"));
    return assessment.destroy({
      success: function() {
        return $("tr[data-assessment='" + assessment.id + "']").fadeOut(function() {
          return $(this).remove();
        });
      }
    });
  };

  ManageView.prototype.showAssessmentForm = function() {
    return this.el.find("form.newAssessment").fadeIn();
  };

  ManageView.prototype.newAssessment = function() {
    var assessment, messages, name,
      _this = this;
    name = $("input[name=name]").val();
    if (name.match(/[^A-Za-z ]/)) {
      messages = $("<span class='error'>Invalid character for assessment</span>");
      $('button:contains(Add)').after(messages);
      messages.fadeOut(2000., function() {
        return messages.remove();
      });
      return;
    }
    assessment = new Assessment({
      name: name,
      _id: $.enumerator + "." + name,
      urlPathsForPages: []
    });
    return assessment.save(null, {
      success: function() {
        _this.addAssessmentToList(assessment);
        _this.assessmentCollection.add(assessment);
        messages = $("<span class='error'>" + (assessment.get("name")) + " added</span>");
        $('button:contains(Add)').after(messages);
        messages.fadeOut(2000., function() {
          return messages.remove();
        });
        Utils.createResultsDatabase(assessment.targetDatabase());
        return Utils.createResultViews(assessment.targetDatabase());
      },
      error: function() {
        messages = $("<span class='error'>Invalid new assessment</span>");
        $('button:contains(Add)').after(messages);
        return messages.fadeOut(2000., function() {
          return messages.remove();
        });
      }
    });
  };

  ManageView.prototype.updateTangerine = function(event) {
    var source, target;
    source = "http://" + Tangerine.cloud.target + "/" + Tangerine.config.db_name;
    target = "http://" + Tangerine.config.user_with_database_create_permission + ":" + Tangerine.config.password_with_database_create_permission + "@localhost:" + Tangerine.port + "/" + Tangerine.config.db_name;
    $("#content").prepend("<span id='message'>Updating from: " + source + "</span>");
    return $.couch.replicate(source, target, {
      success: function() {
        $("#message").html("Finished");
        return Tangerine.router.navigate("logout", true);
      }
    });
  };

  ManageView.prototype.updateResultViews = function(event) {
    return this.assessmentCollection.each(function(assessment) {
      return Utils.createResultViews(assessment.get("name").toLowerCase().dasherize());
    });
  };

  ManageView.prototype.initializeDatabase = function(event) {
    var databaseName;
    databaseName = $(event.target).attr("href");
    Utils.createResultsDatabase(databaseName);
    $("#message").html("Database '" + databaseName + "' Initialized");
    return $(event.target).hide();
  };

  return ManageView;

})(Backbone.View);

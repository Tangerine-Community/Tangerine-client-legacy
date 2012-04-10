var ManageView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ManageView = (function(_super) {

  __extends(ManageView, _super);

  function ManageView() {
    this.addNewAssessment = __bind(this.addNewAssessment, this);
    this.updateAssessmentList = __bind(this.updateAssessmentList, this);
    this.render = __bind(this.render, this);
    ManageView.__super__.constructor.apply(this, arguments);
  }

  ManageView.prototype.el = '#content';

  ManageView.prototype.events = {
    "click button#show_import_from_cloud": "showImportFromCloud",
    "click button#import_from_cloud_confirm": "importFromCloud",
    "click button#import_from_cloud_cancel": "hideImportFromCloud",
    "click img#show_new_assessment_form": "showNewAssessmentForm",
    "click button#add_new_assessment": "addNewAssessment",
    "click button#hide_new_assessment_form": "hideNewAssessmentForm",
    "click img.delete_assessment_confirm": "showConfirmDelete",
    "click button.delete_assessment_yes": "deleteAfirmative",
    "click button.delete_assessment_no": "deleteNegative"
  };

  ManageView.prototype.initialize = function(options) {
    this.temp = {};
    this.collection = options.collection;
    return this.collection.on("add remove", this.updateAssessmentList);
  };

  ManageView.prototype.showImportFromCloud = function() {
    return $("form#import_from_cloud").show();
  };

  ManageView.prototype.hideImportFromCloud = function() {
    return $("form#import_from_cloud").hide();
  };

  ManageView.prototype.importFromCloud = function() {
    return Utils.importAssessmentFromIris($("#import_from_cloud_dkey").val());
  };

  ManageView.prototype.render = function() {
    this.$el.html("    <div id='manage'>      <button id='show_import_from_cloud'>Import assessment</button>      <form id='import_from_cloud'>        <label for='import_from_cloud_dkey'>Download key <input type='text' id='import_from_cloud_dkey'></label>        <button id='import_from_cloud_confirm'>Import</button><button id='import_from_cloud_cancel'>Cancel</button>      </form>      <div id='message'></div>      <h1>Assessments</h1>      <ul id='assessment_list'></ul>      <form id='new_assessment'>        <input type='text' id='new_assessment_name' placeholder='Assessment name'><button id='add_new_assessment'>Add</button><button id='hide_new_assessment_form'>Cancel</button>        <span id='assessment_name_error'></span>      </form>      <img id='show_new_assessment_form' class='icon' src='images/icon_add.png'><br>    </div>    ");
    return this.updateAssessmentList();
  };

  ManageView.prototype.updateAssessmentList = function() {
    var _this = this;
    $("#new_assessment_name").val('');
    this.temp.html = "";
    this.collection.each(function(assessment) {
      var archiveStatus, docName, safeDocName;
      docName = assessment.get("name");
      console.log("is archived");
      console.log(assessment.get("archived"));
      archiveStatus = assessment.get("archived") ? " class='archived_assessment' " : "";
      safeDocName = docName.toLowerCase().dasherize();
      return _this.temp.html += "      <li id='" + safeDocName + "'><span" + archiveStatus + ">" + (assessment.get("name")) + "</span>         <a href='#results/" + docName + "'><img class='icon' src='images/icon_result.png'></a>        <a href='#edit/assessment/" + assessment.id + "'><img class='icon' src='images/icon_edit.png'></a>         <img class='icon_delete delete_assessment_confirm' src='images/icon_delete.png'>        <span class='delete_confirm'>Are you sure? <button data-docName='" + (Tangerine.user.get('name')) + "." + docName + "'class='delete_assessment_yes'>Yes</button><button class='delete_assessment_no'>No</button></span>      </li>";
    });
    return $("ul#assessment_list").html(this.temp.html);
  };

  ManageView.prototype.showNewAssessmentForm = function() {
    $("form#new_assessment", this.el).show();
    return $("input#new_assessment_name", this.el).focus();
  };

  ManageView.prototype.hideNewAssessmentForm = function() {
    return $("form#new_assessment", this.el).hide();
  };

  ManageView.prototype.addNewAssessment = function() {
    var assessment, name,
      _this = this;
    name = $('input#new_assessment_name').val();
    if (name.match(/[^A-Za-z ]/)) {
      $('#assessment_name_error').html('Invalid character for assessment.');
      return;
    } else {
      $('#assessment_name_error').empty();
    }
    assessment = new Assessment({
      name: name,
      _id: Tangerine.user.get("name") + "." + name,
      urlPathsForPages: [],
      subtests: []
    });
    return assessment.save(null, {
      success: function() {
        console.log("saved assessment, adding to collection");
        _this.collection.add(assessment);
        return _this.hideNewAssessmentForm();
      },
      error: function() {
        var messages;
        console.log("error saving assessment");
        $('#assessment_name_error').html('error');
        messages = $("<span class='error'>Invalid new assessment</span>");
        $('button:contains(Add)').after(messages);
        return messages.fadeOut(2000., function() {
          return messages.remove();
        });
      }
    });
  };

  ManageView.prototype.showConfirmDelete = function(event) {
    return $(event.target).parent().find(".delete_confirm").fadeIn(250);
  };

  ManageView.prototype.deleteAfirmative = function(event) {
    var assessment,
      _this = this;
    console.log("trying to get " + $(event.target).attr("data-docName"));
    assessment = this.collection.get($(event.target).attr("data-docName"));
    return assessment.destroy({
      success: function() {
        _this.collection.remove(assessment);
        return $(event.target).parent().parent().fadeOut(250);
      },
      error: function() {
        return $(event.target).parent().fadeOut(250);
      }
    });
  };

  ManageView.prototype.deleteNegative = function(event) {
    return $(event.target).parent().fadeOut(250);
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

  ManageView.prototype.initializeDatabase = function(event) {
    var databaseName;
    databaseName = $(event.target).attr("href");
    Utils.createResultsDatabase(databaseName);
    $("#message").html("Database '" + databaseName + "' Initialized");
    return $(event.target).hide();
  };

  return ManageView;

})(Backbone.View);

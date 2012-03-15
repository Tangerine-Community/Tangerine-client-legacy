var Router, assessmentCollection, config, startApp,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
  _this = this;

Router = (function(_super) {

  __extends(Router, _super);

  function Router() {
    Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.routes = {
    "assessment/:id": "assessment",
    "result/:database_name/:id": "result",
    "results/tabular/:database_name": "tabular_results",
    "results/tabular/:database_name/*options": "tabular_results",
    "results/:database_name": "results",
    "print/:id": "print",
    "student_printout/:id": "student_printout",
    "login": "login",
    "logout": "logout",
    "manage": "manage",
    "edit/assessment/:assessment_id/subtest/:subtest_id": "editSubtest",
    "edit/assessment/:assessment_id": "editAssessment",
    "assessments": "assessments",
    "": "assessments"
  };

  Router.prototype.editSubtest = function(assessment_id, subtest_id) {
    return this.verify_logged_in({
      success: function() {
        var assessment;
        assessment = new Assessment({
          _id: assessment_id
        });
        return assessment.fetch({
          success: function() {
            if (Tangerine.subtestEdit == null) {
              Tangerine.subtestEdit = new SubtestEdit();
            }
            Tangerine.subtestEdit.assessment = assessment;
            Tangerine.subtestEdit.model = new Subtest({
              _id: subtest_id
            });
            return Tangerine.subtestEdit.model.fetch({
              success: function() {
                return Tangerine.subtestEdit.render();
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.editAssessment = function(assessment_id) {
    return this.verify_logged_in({
      success: function() {
        var assessment;
        assessment = new Assessment({
          _id: assessment_id
        });
        return assessment.fetch({
          success: function() {
            if (Tangerine.assessmentEdit == null) {
              Tangerine.assessmentEdit = new AssessmentEdit();
            }
            Tangerine.assessmentEdit.model = new Assessment(assessment.attributes);
            return Tangerine.assessmentEdit.render();
          }
        });
      }
    });
  };

  Router.prototype.results = function(database_name) {
    return this.verify_logged_in({
      success: function() {
        if (Tangerine.resultsView == null) {
          Tangerine.resultsView = new ResultsView();
        }
        Tangerine.resultsView.databaseName = database_name;
        return Tangerine.resultsView.render();
      }
    });
  };

  Router.prototype.tabular_results = function(database_name) {
    return this.verify_logged_in({
      success: function() {
        var limit, view;
        view = "reports/fields";
        limit = 10000000;
        $("#content").html("Loading maximum of " + limit + " items from view: " + view + " from " + database_name);
        return $.couch.db(database_name).view(view, {
          reduce: true,
          group: true,
          success: function(result) {
            var uniqueFields;
            uniqueFields = _.pluck(result.rows, "key");
            return $.couch.db(database_name).view(view, {
              reduce: false,
              limit: limit,
              success: function(tableResults) {
                var options;
                if (Tangerine.resultsView == null) {
                  Tangerine.resultsView = new ResultsView();
                }
                options = jQuery.deparam.querystring(jQuery.param.fragment());
                Tangerine.resultsView.uniqueFields = uniqueFields;
                Tangerine.resultsView.tableResults = tableResults;
                return Tangerine.resultsView.renderTable(options);
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.result = function(database_name, id) {
    return this.verify_logged_in({
      success: function() {
        var _this = this;
        return $.couch.db(database_name).openDoc(id, {
          success: function(doc) {
            if (Tangerine.resultView == null) {
              Tangerine.resultView = new ResultView();
            }
            Tangerine.resultView.model = new Result(doc);
            return $("#content").html(Tangerine.resultView.render());
          }
        });
      }
    });
  };

  Router.prototype.manage = function() {
    return this.verify_logged_in({
      success: function(session) {
        var assessmentCollection;
        assessmentCollection = new AssessmentCollection();
        return assessmentCollection.fetch({
          success: function() {
            if (Tangerine.manageView == null) {
              Tangerine.manageView = new ManageView();
            }
            return Tangerine.manageView.render(assessmentCollection);
          }
        });
      }
    });
  };

  Router.prototype.assessments = function() {
    return this.verify_logged_in({
      success: function() {
        console.log("SUCCESS! logged in and setting up assessments");
        $('#current-student-id').html("");
        if (Tangerine.assessmentListView == null) {
          Tangerine.assessmentListView = new AssessmentListView();
        }
        return Tangerine.assessmentListView.render();
      }
    });
  };

  Router.prototype.login = function() {
    if (Tangerine.loginView == null) Tangerine.loginView = new LoginView();
    return Tangerine.loginView.render();
  };

  Router.prototype.logout = function() {
    return $.couch.logout({
      success: function() {
        $.enumerator = null;
        $('#enumerator').html("Not logged in");
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.assessment = function(id) {
    return this.verify_logged_in({
      success: function() {
        $('#enumerator').html($.enumerator);
        if (Tangerine.assessment != null) location.reload();
        Tangerine.assessment = new Assessment({
          _id: id
        });
        return Tangerine.assessment.fetch({
          success: function() {
            return Tangerine.assessment.render();
          }
        });
      }
    });
  };

  Router.prototype.verify_logged_in = function(options) {
    console.log("verifying logged in");
    return $.couch.session({
      success: function(session) {
        Tangerine.router.targetroute = document.location.hash;
        if (!$.enumerator) {
          console.log("sending back to login");
          Tangerine.router.navigate("login", true);
          return;
        }
        $('#enumerator').html($.enumerator);
        return options.success(session);
      }
    });
  };

  Router.prototype.print = function(id) {
    return Assessment.load(id, function(assessment) {
      return assessment.toPaper(function(result) {
        var style;
        style = "          body{            font-family: Arial;          }          .page-break{            display: block;            page-break-before: always;          }          input{            height: 50px;              border: 1px          }        ";
        $("body").html(result);
        return $("link").remove();
      });
    });
  };

  Router.prototype.student_printout = function(id) {
    return Assessment.load(id, function(assessment) {
      return assessment.toPaper(function(result) {
        var style;
        style = "          <style>            body{              font-family: Arial;              font-size: 200%;            }            .page-break{              display: none;            }            input{              height: 50px;                border: 1px;            }            .subtest.ToggleGridWithTimer{              page-break-after: always;              display:block;              padding: 15px;            }            .subtest, button, h1{              display:none;            }            .grid{              display: inline;              margin: 5px;            }          </style>        ";
        $("style").remove();
        $("body").html(result + style);
        $("span:contains(*)").parent().remove();
        $("link").remove();
        return $('.grid').each(function(index) {
          if (index % 10 === 0) {
            return $(this).nextAll().andSelf().slice(0, 10).wrapAll('<div class="grid-row"></div>');
          }
        });
      });
    });
  };

  return Router;

})(Backbone.Router);

startApp = function() {
  Tangerine.router = new Router();
  Tangerine.loginView;
  Tangerine.manageView;
  Tangerine.assessmentListView;
  Tangerine.resultView;
  Tangerine.resultsView;
  Tangerine.assessment;
  return Backbone.history.start();
};

config = new Backbone.Model({
  _id: "Config"
});

config.fetch({
  success: function() {
    return Tangerine.config = config.toJSON();
  }
}, assessmentCollection = new AssessmentCollection(), assessmentCollection.fetch({
  success: function() {
    assessmentCollection.each(function(assessment) {
      return $.couch.db(assessment.targetDatabase()).info({
        error: function(a, b, errorType) {
          if (errorType === "no_db_file") {
            return Utils.createResultsDatabase(assessment.targetDatabase());
          }
        }
      });
    });
    return _this.startApp();
  }
}));

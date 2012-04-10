var Router,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Router = (function(_super) {

  __extends(Router, _super);

  function Router() {
    Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.routes = {
    "login": "login",
    "logout": "logout",
    "": "assessments",
    "assessments": "assessments",
    "assessment/:id": "assessment",
    "manage": "manage",
    "edit/assessment/:assessment_id": "editAssessment",
    "edit/assessment/:assessment_id/subtest/:subtest_id": "editSubtest",
    "results/tabular/:assessment_id": "tabular_results",
    "results/tabular/:assessment_id/*options": "tabular_results",
    "results/:assessmentId/*enumerator": "results",
    "print/:id": "print",
    "student_printout/:id": "student_printout"
  };

  Router.prototype.editSubtest = function(assessment_id, subtest_id) {
    assessment_id = Utils.cleanURL(assessment_id);
    subtest_id = Utils.cleanURL(subtest_id);
    return Tangerine.user.verify({
      isAdmin: function() {
        Tangerine.subtestEdit.assessment_id = assessment_id;
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
  };

  Router.prototype.editAssessment = function(assessment_id) {
    assessment_id = Utils.cleanURL(assessment_id);
    return Tangerine.user.verify({
      isAdmin: function() {
        var assessment;
        assessment = new Assessment({
          _id: assessment_id
        });
        return assessment.fetch({
          success: function() {
            Tangerine.assessmentEditView.model = assessment;
            return Tangerine.assessmentEditView.render();
          }
        });
      }
    });
  };

  Router.prototype.results = function(assessmentId, enumerator) {
    return Tangerine.user.verify({
      isUser: function() {
        var resultCollection;
        resultCollection = new ResultCollection();
        return resultCollection.fetch({
          success: function() {
            if (Tangerine.resultsView == null) {
              Tangerine.resultsView = new ResultsView();
            }
            Tangerine.resultsView.assessment = new Assessment({
              _id: Utils.cleanURL(assessmentId)
            });
            return Tangerine.resultsView.assessment.fetch({
              success: function() {
                if (enumerator) {
                  Tangerine.resultsView.results = resultCollection.filter(function(result) {
                    return result.get("assessmentId") === assessmentId && result.get("enumerator") === enumerator;
                  });
                }
                return Tangerine.resultsView.render();
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.tabular_results = function(assessment_id) {
    return this.verify_logged_in({
      success: function() {
        var limit, view;
        view = "reports/fields";
        limit = 10000000;
        $("#content").html("Loading maximum of " + limit + " items from view: " + view + " from " + assessment_id);
        return $.couch.db(Tangerine.database_name).view(view, {
          reduce: true,
          group: true,
          success: function(result) {
            var uniqueFields;
            uniqueFields = _.pluck(result.rows, "key");
            return $.couch.db(Tangerine.database_name).view(view, {
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

  Router.prototype.result = function(id) {
    return this.verify_logged_in({
      success: function() {
        if (Tangerine.resultView == null) Tangerine.resultView = new ResultView();
        Tangerine.resultView.model = new Result(id);
        return Tangerine.resultView.model.fetch({
          success: function() {
            return $("#content").html(Tangerine.resultView.render());
          }
        });
      }
    });
  };

  Router.prototype.manage = function() {
    return Tangerine.user.verify({
      isAdmin: function() {
        return Tangerine.assessmentCollection.fetch({
          success: function() {
            return Tangerine.manageView.render(Tangerine.assessmentCollection);
          }
        });
      }
    });
  };

  Router.prototype.assessments = function() {
    return Tangerine.user.verify({
      isUser: function() {
        if (Tangerine.assessmentListView == null) {
          Tangerine.assessmentListView = new AssessmentListView();
        }
        return Tangerine.assessmentListView.render();
      },
      unregistered: function() {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.login = function() {
    return Tangerine.loginView.render();
  };

  Router.prototype.logout = function() {
    return Tangerine.user.logout();
  };

  Router.prototype.assessment = function(id) {
    return Tangerine.user.verify({
      isUser: function() {
        if ((Tangerine.assessment != null) || ($.assessment != null)) {
          location.reload();
        }
        Tangerine.assessment = new Assessment({
          _id: decodeURIComponent(id)
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
    var _this = this;
    return $.couch.session({
      success: function(session) {
        Tangerine.enumerator = session.userCtx.name;
        Tangerine.userRoles = _.values(session.userCtx.roles);
        Tangerine.router.targetroute = document.location.hash;
        if (!session.userCtx.name) {
          Tangerine.router.navigate("login", true);
          return;
        }
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

$(function() {
  Tangerine.router = new Router();
  Tangerine.assessmentCollection = new AssessmentCollection();
  Tangerine.manageView = new ManageView({
    collection: Tangerine.assessmentCollection
  });
  Tangerine.assessmentEditView = new AssessmentEditView();
  Tangerine.subtestEdit = new SubtestEdit();
  Tangerine.user = new User();
  Tangerine.loginView = new LoginView(Tangerine.user);
  Tangerine.nav = new Navigation({
    user: Tangerine.user,
    router: Tangerine.router
  });
  Backbone.history.start();
  $("#content").on("click", ".clear_message", null, function(a) {
    return $(a.target).parent().fadeOut(250, function() {
      return $(this).empty().show();
    });
  });
  $("#content").on("click", ".parent_remove", null, function(a) {
    return $(a.target).parent().fadeOut(250, function() {
      return $(this).remove();
    });
  });
  $(".ajax_loading").ajaxStart(function() {
    return $("#corner_logo").attr("src", "images/spin_orange.gif");
  });
  $(".ajax_loading").ajaxStop(function() {
    return $("#corner_logo").attr("src", "images/corner_logo.png");
  });
  return $('#main_nav button').click(function(event) {
    return Tangerine.router.navigate($(event.target).attr("href"), true);
  });
});

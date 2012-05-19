var Router,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Router = (function(_super) {

  __extends(Router, _super);

  function Router() {
    Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.routes = {
    'login': 'login',
    'logout': 'logout',
    'account': 'account',
    'test': 'test',
    'setup': 'setup',
    '': 'assessments',
    'assessments': 'assessments',
    'dashboard': 'dashboard',
    'edit-id/:id': 'editId',
    'run/:name': 'run',
    'edit/:name': 'edit',
    'csv/:id': 'csv',
    'results/:name': 'results',
    'import': 'import',
    'subtest/:id': 'editSubtest',
    'question/:id': 'editQuestion'
  };

  Router.prototype.test = function() {
    return console.log("insert tests");
  };

  Router.prototype.setup = function() {
    return Tangerine.device.fetch({
      success: function(model) {
        var view;
        view = new DeviceView({
          model: model
        });
        return vm.show(view);
      }
    });
  };

  Router.prototype.dashboard = function() {
    return Tangerine.user.verify({
      isAdmin: function() {
        var dashboard;
        dashboard = new DashboardView;
        return vm.show(dashboard);
      },
      isUser: function() {
        return Tangerine.router.navigate("assessments", true);
      }
    });
  };

  Router.prototype["import"] = function() {
    return Tangerine.user.verify({
      isRegistered: function() {
        var view;
        view = new AssessmentImportView;
        return vm.show(view);
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.assessments = function() {
    return Tangerine.user.verify({
      isRegistered: function() {
        var assessments;
        assessments = new AssessmentListView;
        return vm.show(assessments);
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.editId = function(id) {
    id = Utils.cleanURL(id);
    return Tangerine.user.verify({
      isAdmin: function() {
        var assessment;
        assessment = new Assessment({
          _id: id
        });
        return assessment.superFetch({
          success: function(model) {
            var view;
            console.log("model name");
            console.log(model.attributes.name);
            console.log(model);
            view = new AssessmentEditView({
              model: model
            });
            return vm.show(view);
          },
          error: function(details) {
            var name, view;
            name = Utils.cleanURL(name);
            view = new ErrorView({
              message: "There was an error loading the assessment '" + name + "'",
              details: details
            });
            return vm.show(view);
          }
        });
      },
      isUser: function() {
        return Tangerine.router.navigate("", true);
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.edit = function(name) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var assessment;
        assessment = new Assessment;
        return assessment.fetch({
          name: name,
          success: function(model) {
            var view;
            view = new AssessmentEditView({
              model: model
            });
            return vm.show(view);
          },
          error: function(details) {
            var view;
            name = Utils.cleanURL(name);
            view = new ErrorView({
              message: "There was an error loading the assessment '" + name + "'",
              details: details
            });
            return vm.show(view);
          }
        });
      },
      isUser: function() {
        return Tangerine.router.navigate("", true);
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.run = function(name) {
    return Tangerine.user.verify({
      isRegistered: function() {
        var assessment;
        assessment = new Assessment;
        return assessment.fetch({
          name: name,
          success: function(model) {
            var view;
            view = new AssessmentRunView({
              model: model
            });
            return vm.show(view);
          }
        });
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.results = function(name) {
    return Tangerine.user.verify({
      isRegistered: function() {
        var assessment;
        assessment = new Assessment;
        return assessment.fetch({
          name: name,
          success: function(model) {
            var view;
            view = new ResultsView({
              assessment: model
            });
            return vm.show(view);
          }
        });
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.csv = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var view;
        view = new CSVView({
          assessmentId: id
        });
        return vm.show(view);
      },
      isUser: function() {
        return $("#content").html("<h1>You're not an admin user</h1><p>How did you get here?</p>");
      }
    });
  };

  Router.prototype.editSubtest = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var subtest;
        id = Utils.cleanURL(id);
        subtest = new Subtest({
          _id: id
        });
        return subtest.fetch({
          success: function(model, response) {
            var view;
            view = new SubtestEditView({
              model: model
            });
            return vm.show(view);
          }
        });
      },
      isUser: function() {
        return Tangerine.router.navigate("", true);
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.editQuestion = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var question;
        id = Utils.cleanURL(id);
        question = new Question({
          _id: id
        });
        return question.fetch({
          success: function(model, response) {
            var view;
            view = new QuestionEditView({
              model: model
            });
            return vm.show(view);
          }
        });
      },
      isUser: function() {
        return Tangerine.router.navigate("", true);
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.login = function() {
    return Tangerine.user.verify({
      isRegistered: function() {
        return Tangerine.router.navigate("", true);
      },
      isUnregistered: function() {
        var view;
        view = new LoginView;
        return vm.show(view);
      }
    });
  };

  Router.prototype.logout = function() {
    Tangerine.user.logout();
    return Tangerine.router.navigate("login", true);
  };

  Router.prototype.account = function() {
    return Tangerine.user.verify({
      isRegistered: function() {
        var view;
        view = new AccountView({
          model: Tangerine.user
        });
        return vm.show(view);
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  return Router;

})(Backbone.Router);

$(function() {
  window.vm = new ViewManager();
  Tangerine.router = new Router();
  Tangerine.user = new User();
  Tangerine.nav = new NavigationView({
    user: Tangerine.user,
    router: Tangerine.router
  });
  return Backbone.history.start();
});

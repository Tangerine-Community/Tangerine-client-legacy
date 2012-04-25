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
    '': 'dashboard',
    'dashboard': 'dashboard',
    'assessment/:name': 'assessment',
    'assessment/:name/run': 'run',
    'assessment/:name/edit': 'edit',
    'assessment/:name/results': 'results',
    "assessments": "assessments"
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

  Router.prototype.assessments = function() {
    return Tangerine.user.verify({
      isUser: function() {
        var assessments;
        assessments = new AssessmentListView;
        return vm.show(assessments);
      }
    });
  };

  Router.prototype.run = function(name) {};

  Router.prototype.login = function() {
    var loginView;
    loginView = new LoginView({
      model: Tangerine.user
    });
    return vm.show(loginView);
  };

  Router.prototype.logout = function() {
    Tangerine.user.logout();
    return Tangerine.router.navigate("login", true);
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
  $("#content").on("click", ".alert_button", function() {
    var alert_text;
    alert_text = $(this).attr("data-alert") ? $(this).attr("data-alert") : $(this).val();
    return Utils.disposableAlert(alert_text);
  });
  return $("#content").on("click", ".disposable_alert", function() {
    return $(this).stop().fadeOut(250, function() {
      return $(this).remove();
    });
  });
});

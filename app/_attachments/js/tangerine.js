var AssessmentElement, AssessmentList, DashboardView, Router, ViewManager, vm,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ViewManager = (function(_super) {

  __extends(ViewManager, _super);

  function ViewManager() {
    ViewManager.__super__.constructor.apply(this, arguments);
  }

  ViewManager.prototype.show = function(view) {
    var _ref,
      _this = this;
    if ((_ref = this.currentView) != null) _ref.close();
    this.currentView = view;
    this.currentView.on("rendered", function() {
      return $("#content").html(_this.currentView.el);
    });
    return this.currentView.trigger("rendered");
  };

  return ViewManager;

})(Backbone.View);

vm = new ViewManager;

AssessmentElement = (function(_super) {

  __extends(AssessmentElement, _super);

  function AssessmentElement() {
    AssessmentElement.__super__.constructor.apply(this, arguments);
  }

  AssessmentElement.prototype.tagName = "li";

  AssessmentElement.prototype.events = {
    'click .link_icon': 'navigate',
    'click .assessment_menu_toggle': 'assessmentMenuToggle'
  };

  AssessmentElement.prototype.initialize = function(options) {
    this.isAdmin = options.isAdmin;
    return this.model = options.model;
  };

  AssessmentElement.prototype.navigate = function(event) {
    var whereTo;
    whereTo = $(event.target).attr('data-href');
    return Tangerine.router.navigate(whereTo, true);
  };

  AssessmentElement.prototype.assessmentMenuToggle = function() {
    var toggleChar;
    toggleChar = this.$el.find('.assessment_menu_toggle');
    if (toggleChar.html() === '&gt; ') {
      toggleChar.html('&nabla; ');
    } else {
      toggleChar.html("&gt; ");
    }
    return this.$el.find('.assessment_menu').toggle(250);
  };

  AssessmentElement.prototype.render = function() {
    var deleteButton, editButton, name, resultCount, resultsButton, runButton, subtestCount;
    deleteButton = "<img data-href='delete' class='link_icon' src='images/icon_delete.png'>";
    editButton = "<img data-href='edit/' class='link_icon' src='images/icon_edit.png'>";
    resultsButton = "<img data-href='results' class='link_icon' src='images/icon_result.png'>";
    runButton = "<img data-href='run' class='link_icon' src='images/icon_run.png'>";
    name = "<span class='name'>" + (this.model.get('name')) + "</span>";
    resultCount = "<span class='resultCount'>" + (this.model.get('resultCount') || '0') + " results</span>";
    subtestCount = this.model.get('urlPathsForPages').length;
    if (this.isAdmin) {
      return this.$el.html("        <div>          <span class='assessment_menu_toggle clickable'>&gt; </span>            " + name + "             " + resultCount + "        </div>        <div class='assessment_menu'>          " + runButton + "          " + resultsButton + "          " + editButton + "          " + deleteButton + "        </div>");
    } else {
      return this.$el.html("<div>" + runButton + name + " " + resultsButton + resultCount + "</div>");
    }
  };

  return AssessmentElement;

})(Backbone.View);

AssessmentList = (function(_super) {

  __extends(AssessmentList, _super);

  function AssessmentList() {
    AssessmentList.__super__.constructor.apply(this, arguments);
  }

  AssessmentList.prototype.tagName = "ul";

  AssessmentList.prototype.className = "assessmentList";

  AssessmentList.prototype.events = {
    'submit form': 'newAssessmentSave',
    'click .new_assessment_save': 'newAssessmentSave',
    'click .new_assessment_cancel': 'newAssessmentHide',
    'click .add_assessment': 'newAssessmentShow'
  };

  AssessmentList.prototype.newAssessmentShow = function() {
    return this.$el.find('.new_assessment_form').show(250);
  };

  AssessmentList.prototype.newAssessmentHide = function() {
    return this.$el.find('.new_assessment_form').fadeOut(250);
  };

  AssessmentList.prototype.newAssessmentValid = function() {
    return this.$el.find('.new_assessment_name').val() !== "";
  };

  AssessmentList.prototype.newAssessmentSave = function() {
    var newAssessment;
    if (this.newAssessmentValid) {
      return newAssessment = new Assessment({
        'name': this.$el.find('.new_assessment_name')
      });
    } else {
      return this.$el.find('messages').append("<span class='error'>Error saving changes <img src='images/icon_close.png' class='clear_message'></span>");
    }
  };

  AssessmentList.prototype.initialize = function(options) {
    this.isAdmin = Tangerine.user.isAdmin;
    if (options.submenu !== false) this.initializeSubmenu();
    this.views = [];
    this.collection = new AssessmentCollection(null, {
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
    return this.collection.fetch;
  };

  return AssessmentList;

})(Backbone.View);

ViewManager = (function(_super) {

  __extends(ViewManager, _super);

  function ViewManager() {
    ViewManager.__super__.constructor.apply(this, arguments);
  }

  ViewManager.prototype.show = function(view) {
    var _ref,
      _this = this;
    if ((_ref = this.currentView) != null) _ref.close();
    this.currentView = view;
    this.currentView.on("rendered", function() {
      return $("#content").html(_this.currentView.el);
    });
    return this.currentView.trigger("rendered");
  };

  return ViewManager;

})(Backbone.View);

vm = new ViewManager;

AssessmentElement = (function(_super) {

  __extends(AssessmentElement, _super);

  function AssessmentElement() {
    AssessmentElement.__super__.constructor.apply(this, arguments);
  }

  AssessmentElement.prototype.tagName = "li";

  AssessmentElement.prototype.events = {
    'click .link_icon': 'navigate',
    'click .assessment_menu_toggle': 'assessmentMenuToggle'
  };

  AssessmentElement.prototype.initialize = function(options) {
    this.isAdmin = options.isAdmin;
    return this.model = options.model;
  };

  AssessmentElement.prototype.navigate = function(event) {
    var whereTo;
    whereTo = $(event.target).attr('data-href');
    return Tangerine.router.navigate(whereTo, true);
  };

  AssessmentElement.prototype.assessmentMenuToggle = function() {
    var toggleChar;
    toggleChar = this.$el.find('.assessment_menu_toggle');
    if (toggleChar.html() === '&gt; ') {
      toggleChar.html('&nabla; ');
    } else {
      toggleChar.html("&gt; ");
    }
    return this.$el.find('.assessment_menu').toggle(250);
  };

  AssessmentElement.prototype.render = function() {
    var deleteButton, editButton, name, resultCount, resultsButton, runButton, subtestCount;
    deleteButton = "<img data-href='delete' class='link_icon' src='images/icon_delete.png'>";
    editButton = "<img data-href='edit/' class='link_icon' src='images/icon_edit.png'>";
    resultsButton = "<img data-href='results' class='link_icon' src='images/icon_result.png'>";
    runButton = "<img data-href='run' class='link_icon' src='images/icon_run.png'>";
    name = "<span class='name'>" + (this.model.get('name')) + "</span>";
    resultCount = "<span class='resultCount'>" + (this.model.get('resultCount') || '0') + " results</span>";
    subtestCount = this.model.get('urlPathsForPages').length;
    if (this.isAdmin) {
      return this.$el.html("        <div>          <span class='assessment_menu_toggle clickable'>&gt; </span>            " + name + "             " + resultCount + "        </div>        <div class='assessment_menu'>          " + runButton + "          " + resultsButton + "          " + editButton + "          " + deleteButton + "        </div>");
    } else {
      return this.$el.html("<div>" + runButton + name + " " + resultsButton + resultCount + "</div>");
    }
  };

  return AssessmentElement;

})(Backbone.View);

AssessmentList = (function(_super) {

  __extends(AssessmentList, _super);

  function AssessmentList() {
    this.render = __bind(this.render, this);
    AssessmentList.__super__.constructor.apply(this, arguments);
  }

  AssessmentList.prototype.tagName = "ul";

  AssessmentList.prototype.className = "assessmentList";

  AssessmentList.prototype.events = {
    'submit form': 'newAssessmentSave',
    'click .new_assessment_save': 'newAssessmentSave',
    'click .new_assessment_cancel': 'newAssessmentHide',
    'click .add_assessment': 'newAssessmentShow'
  };

  AssessmentList.prototype.newAssessmentShow = function() {
    return this.$el.find('.new_assessment_form').show(250);
  };

  AssessmentList.prototype.newAssessmentHide = function() {
    return this.$el.find('.new_assessment_form').fadeOut(250);
  };

  AssessmentList.prototype.newAssessmentValid = function() {
    return this.$el.find('.new_assessment_name').val() !== "";
  };

  AssessmentList.prototype.newAssessmentSave = function() {
    var newAssessment;
    if (this.newAssessmentValid) {
      return newAssessment = new Assessment({
        'name': this.$el.find('.new_assessment_name')
      });
    } else {
      return this.$el.find('messages').append("<span class='error'>Error saving changes <img src='images/icon_close.png' class='clear_message'></span>");
    }
  };

  AssessmentList.prototype.initialize = function(options) {
    var _this = this;
    this.isAdmin = Tangerine.user.isAdmin;
    if (options.submenu !== false) this.initializeSubmenu();
    this.views = [];
    this.collection = new AssessmentCollection(null, {
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

  AssessmentList.prototype.initializeSubmenu = function() {
    if (this.isAdmin) {
      return $("nav#main_nav").html("<button data-submenu='new'>new</button>");
    }
  };

  AssessmentList.prototype.submenuHandler = function(event) {
    var submenu;
    submenu = $(event.target).attr("data-submenu");
    if (submenu === "new") return this.newAssessmentShow();
  };

  AssessmentList.prototype.render = function() {
    var assessment, lastView, _i, _len, _ref;
    this.closeViews();
    this.views = [];
    this.$el.html("      <form class='new_assessment_form'>        <input type='text' class='new_assessment_name' placeholder='Assessment Name'>        <button class='new_assessment_save'>Save</button>        <button class='new_assessment_cancel'>Cancel</button>      </form>");
    _ref = this.collection.models;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      assessment = _ref[_i];
      lastView = new AssessmentElement({
        model: assessment,
        isAdmin: this.isAdmin
      });
      this.views.push(lastView);
      lastView.render();
      this.$el.append(lastView.el);
    }
    return this.trigger("rendered");
  };

  AssessmentList.prototype.closeViews = function() {
    return _.each(this.views, function(view) {
      return view.close;
    });
  };

  AssessmentList.prototype.onClose = function() {
    return this.closeViews();
  };

  return AssessmentList;

})(Backbone.View);

DashboardView = (function(_super) {

  __extends(DashboardView, _super);

  function DashboardView() {
    DashboardView.__super__.constructor.apply(this, arguments);
  }

  DashboardView.prototype.initialize = function() {
    this.assessments = new AssessmentList({
      isAdmin: Tangerine.user.isAdmin,
      submenu: false
    });
    this.assessments.setElement("#dash_assessments");
    return this.render();
  };

  DashboardView.prototype.render = function() {
    this.$el.html("      <h1>dashboard</h1>      <div id='dash_assessments'></div>      <div id='dash_user'></div>      <div id='dash_group'></div>      ");
    this.assessments.render();
    return this.trigger("rendered");
  };

  return DashboardView;

})(Backbone.View);

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
    "assessments": "assessments",
    "manage": "manage",
    "edit/assessment/:assessment_id": "editAssessment",
    "edit/assessment/:assessment_id/subtest/:subtest_id": "editSubtest",
    "results/tabular/:assessment_id": "tabular_results",
    "results/tabular/:assessment_id/*options": "tabular_results",
    "results/:assessmentId/:enumerator": "results",
    "results/:assessmentId": "adminResults",
    "print/:id": "print",
    "student_printout/:id": "student_printout"
  };

  Router.prototype.dashboard = function() {
    return Tangerine.user.verify({
      isAdmin: function() {
        var dashboard;
        dashboard = new DashboardView();
        return vm.show(dashboard);
      },
      isUser: function() {
        return Tangerine.router.navigate("assessments");
      }
    });
  };

  Router.prototype.assessments = function() {
    var assessments;
    Tangerine.user.verify();
    assessments = new AssessmentList;
    return vm.show(assessments);
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
    assessmentId = Utils.cleanURL(assessmentId);
    enumerator = Utils.cleanURL(enumerator);
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
              _id: assessmentId
            });
            return Tangerine.resultsView.assessment.fetch({
              success: function() {
                Tangerine.resultsView.results = resultCollection.filter(function(result) {
                  return result.get("assessmentId") === assessmentId && result.get("enumerator") === enumerator;
                });
                return Tangerine.resultsView.render();
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.adminResults = function(assessmentId) {
    assessmentId = Utils.cleanURL(assessmentId);
    return Tangerine.user.verify({
      isAdmin: function() {
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
                Tangerine.resultsView.isAdmin = true;
                Tangerine.resultsView.results = resultCollection.filter(function(result) {
                  return result.get("assessmentId") === assessmentId;
                });
                return Tangerine.resultsView.render();
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.tabular_results = function(assessmentId) {
    assessmentId = Utils.cleanURL(assessmentId);
    return Tangerine.user.verify({
      isUser: function() {
        return Tangerine.csvView = new CSVView({
          assessmentId: assessmentId
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

  Router.prototype.zzassessments = function() {
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
  var _this = this;
  Tangerine.router = new Router();
  Tangerine.assessmentCollection = new AssessmentCollection();
  Tangerine.manageView = new ManageView({
    collection: Tangerine.assessmentCollection
  });
  Tangerine.assessmentEditView = new AssessmentEditView();
  Tangerine.subtestEdit = new SubtestEditView();
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
  $("#content").on("click", ".alert_button", function() {
    var alert_text;
    alert_text = $(this).attr("data-alert") ? $(this).attr("data-alert") : $(this).val();
    return Utils.disposableAlert(alert_text);
  });
  $("#content").on("click", ".disposable_alert", function() {
    return $(this).stop().fadeOut(250, function() {
      var _this = this;
      $(this).remove();
      return {
        success: function() {
          _this.collection.filter(function(a, b, c) {
            return function() {
              return true;
            };
          });
          return _this.collection.trigger("change");
        }
      };
    });
  });
  return {
    initializeSubmenu: function() {
      if (this.isAdmin) {
        return $("nav#main_nav").html("<button data-submenu='new'>new</button>");
      }
    },
    submenuHandler: function(event) {
      var submenu;
      submenu = $(event.target).attr("data-submenu");
      if (submenu === "new") return this.newAssessmentShow();
    },
    render: function() {
      var assessment, lastView, _i, _len, _ref;
      _this.closeViews();
      _this.views = [];
      _this.$el.html("      <form class='new_assessment_form'>        <input type='text' class='new_assessment_name' placeholder='Assessment Name'>        <button class='new_assessment_save'>Save</button>        <button class='new_assessment_cancel'>Cancel</button>      </form>");
      _ref = _this.collection.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        assessment = _ref[_i];
        lastView = new AssessmentElement({
          model: assessment,
          isAdmin: _this.isAdmin
        });
        _this.views.push(lastView);
        lastView.render();
        _this.$el.append(lastView.el);
      }
      return _this.trigger("rendered");
    },
    closeViews: function() {
      return _.each(this.views, function(view) {
        return view.close;
      });
    },
    onClose: function() {
      return this.closeViews();
    }
  };
});

DashboardView = (function(_super) {

  __extends(DashboardView, _super);

  function DashboardView() {
    DashboardView.__super__.constructor.apply(this, arguments);
  }

  DashboardView.prototype.initialize = function() {
    this.assessments = new AssessmentList({
      isAdmin: Tangerine.user.isAdmin,
      submenu: false
    });
    return this.render();
  };

  DashboardView.prototype.render = function() {
    this.$el.html("      <h1>dashboard</h1>      <div id='dash_assessments'></div>      <div id='dash_user'></div>      <div id='dash_group'></div>      ");
    return this.trigger("rendered");
  };

  return DashboardView;

})(Backbone.View);

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
        return Tangerine.router.navigate("assessments");
      }
    });
  };

  Router.prototype.assessments = function() {
    var assessments;
    Tangerine.user.verify();
    assessments = new AssessmentList;
    return vm.show(assessments);
  };

  Router.prototype.login = function() {
    var loginView;
    loginView = LoginView();
    return vm.show(loginView);
  };

  Router.prototype.logout = function() {
    Tangerine.user.logout();
    return Tangerine.router.navigate("login", true);
  };

  return Router;

})(Backbone.Router);

$(function() {
  Tangerine.router = new Router();
  Tangerine.user = new User();
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

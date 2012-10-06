var NavigationView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

NavigationView = (function(_super) {

  __extends(NavigationView, _super);

  function NavigationView() {
    this.handleMenu = __bind(this.handleMenu, this);
    this.initialize = __bind(this.initialize, this);
    NavigationView.__super__.constructor.apply(this, arguments);
  }

  NavigationView.prototype.el = '#navigation';

  NavigationView.prototype.events = Modernizr.touch ? {
    'touchstart div#logout_link': 'logout',
    'touchstart button': 'submenuHandler',
    'touchstart #corner_logo': 'logoClick',
    'touchstart #enumerator': 'enumeratorClick'
  } : {
    'click div#logout_link': 'logout',
    'click button': 'submenuHandler',
    'click #corner_logo': 'logoClick',
    'click #enumerator': 'enumeratorClick'
  };

  NavigationView.prototype.enumeratorClick = function() {
    return Tangerine.router.navigate("account", true);
  };

  NavigationView.prototype.logoClick = function() {
    if (this.user.isAdmin()) {
      Tangerine.activity = "";
      return this.router.navigate('', true);
    } else {
      if (Tangerine.activity === "assessment run") {
        if (confirm("Assessment not finished. Continue to main screen?")) {
          Tangerine.activity = "";
          return this.router.navigate('', true);
        }
      } else {
        return this.router.navigate('', true);
      }
    }
  };

  NavigationView.prototype.logout = function() {
    if (this.user.isAdmin()) {
      Tangerine.activity = "";
      return this.router.navigate('logout', true);
    } else {
      if (Tangerine.activity === "assessment run") {
        if (confirm("Assessment not finished. Continue to logout?")) {
          Tangerine.activity = "";
          return this.router.navigate('logout', true);
        }
      } else {
        if (confirm("Are you sure you want to logout?")) {
          Tangerine.activity = "";
          return this.router.navigate('logout', true);
        }
      }
    }
  };

  NavigationView.prototype.onClose = function() {};

  NavigationView.prototype.initialize = function(options) {
    this.render();
    this.user = options.user;
    this.router = options.router;
    this.router.on('all', this.handleMenu);
    return this.user.on('change:authentication', this.handleMenu);
  };

  NavigationView.prototype.submenuHandler = function(event) {
    var _base;
    return typeof (_base = vm.currentView).submenuHandler === "function" ? _base.submenuHandler(event) : void 0;
  };

  NavigationView.prototype.closeSubmenu = function() {
    return this.$el.find("main_nav").empty();
  };

  NavigationView.prototype.render = function() {
    var updateButton;
    updateButton = Tangerine.user.isAdmin() && Tangerine.settings.context !== "server" ? "<a href='#update'>" + (t('update')) + "</a>" : "";
    this.$el.html("    <img id='corner_logo' src='images/corner_logo.png'>    <div id='logout_link'>" + (t('logout')) + "</div>    <div id='enumerator_box'>      " + (t('enumerator')) + "      <div id='enumerator'>" + (Tangerine.user.name || "") + "</div>    </div>    <div id='current_student'>      Student ID      <div id='current_student_id'></div>    </div>    <div id='version'>    version <br/>    <span id='version-uuid'>" + Tangerine.version + "</span><br/>    " + updateButton + "    </div>    ");
    $("body").ajaxStart(function() {
      return $("#corner_logo").attr("src", "images/spin_orange.gif");
    });
    return $("body").ajaxStop(function() {
      return $("#corner_logo").attr("src", "images/corner_logo.png");
    });
  };

  NavigationView.prototype.setStudent = function(id) {
    if (id === "") {
      this.$el.find('#current_student_id').fadeOut(250, function(a) {
        return $(a).html("");
      });
      return this.$el.find("#current_student").fadeOut(250);
    } else {
      return this.$el.find('#current_student_id').html(id).parent().fadeIn(250);
    }
  };

  NavigationView.prototype.handleMenu = function(event) {
    var _this = this;
    $('#enumerator').html(this.user.name);
    if (~window.location.toString().indexOf("name=")) {
      this.$el.find("#logout_link").hide();
    } else {
      this.$el.find("#logout_link").show();
    }
    return this.user.verify({
      isRegistered: function() {
        _this.render();
        return $('#navigation').fadeIn(250);
      },
      isUnregistered: function() {
        _this.render();
        return $('#navigation').fadeOut(250);
      }
    });
  };

  return NavigationView;

})(Backbone.View);

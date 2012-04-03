var Navigation,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Navigation = (function(_super) {

  __extends(Navigation, _super);

  function Navigation() {
    this.handleMenu = __bind(this.handleMenu, this);
    this.initialize = __bind(this.initialize, this);
    Navigation.__super__.constructor.apply(this, arguments);
  }

  Navigation.prototype.el = "#navigation";

  Navigation.prototype.initialize = function(options) {
    this.render();
    this.user = options.user;
    this.router = options.router;
    this.user.on('change', this.handleMenu);
    this.user.trigger('change');
    return this.router.on('all', this.handleNavigation);
  };

  Navigation.prototype.render = function() {
    return this.$el.html("    <img id='corner_logo' src='images/corner_logo.png'>    <span id='version'></span>    <nav id='main_nav'>      <a id='collect_link' href='#assessments'>COLLECT</a>      <a id='manage_link' href='#manage'>MANAGE</a>    </nav>    <div id='session_info'>      <div id='student_id_box'>        Student ID <div id='current-student-id'>none</div>      </div>      <div id='enumerator_box'>        Enumerator <a id='logout_link' href='#logout'>LOGOUT</a>        <div id='enumerator'></div>      </div>    </div>    ");
  };

  Navigation.prototype.handleMenu = function() {
    this.user.verify();
    $("#enumerator").html(this.user.get("name"));
    if (this.user.isAdmin()) {
      $("#main_nav a").hide();
      $("#navigation").show();
      return $("#collect_link, #manage_link, #logout_link").show();
    } else if (!this.user.isVerified()) {
      return $("#navigation").hide();
    } else {
      $("#main_nav a").hide();
      $("#navigation").show();
      return $("#collect_link, #logout_link").show();
    }
  };

  Navigation.prototype.handleNavigation = function() {
    if (window.location.href.toLowerCase().indexOf("assessment") !== -1) {
      $("nav#main_nav a").removeClass("border_on");
      $("#collect_link").addClass("border_on");
    }
    if (window.location.href.toLowerCase().indexOf("manage") !== -1) {
      $("nav#main_nav a").removeClass("border_on");
      return $("#manage_link").addClass("border_on");
    }
  };

  return Navigation;

})(Backbone.View);

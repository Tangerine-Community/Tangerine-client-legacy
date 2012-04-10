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

  Navigation.prototype.el = '#navigation';

  Navigation.prototype.events = {
    'click span#collect_link': 'collect',
    'click span#manage_link': 'manage',
    'click span#logout_link': 'logout'
  };

  Navigation.prototype.initialize = function(options) {
    this.render();
    this.user = options.user;
    this.router = options.router;
    this.user.on('change', this.handleMenu);
    this.user.trigger('change');
    return this.router.on('all', this.handleNavigation);
  };

  Navigation.prototype.render = function() {
    return this.$el.html("    <img id='corner_logo' src='images/corner_logo.png'>    <span id='version'></span>    <nav id='main_nav'>      <span id='collect_link' class='nav_link'>COLLECT</span>      <span id='manage_link' class='nav_link'>MANAGE</span>    </nav>    <div id='session_info'>      <div id='student_id_box'>        Student ID <div id='current-student-id'>none</div>      </div>      <div id='enumerator_box'>        Enumerator <span id='logout_link' class='nav_link'>LOGOUT</span>        <div id='enumerator'></div>      </div>    </div>    ");
  };

  Navigation.prototype.collect = function() {
    return this.router.navigate('assessments', true);
  };

  Navigation.prototype.manage = function() {
    return this.router.navigate('manage', true);
  };

  Navigation.prototype.logout = function() {
    return this.router.navigate('logout', true);
  };

  Navigation.prototype.handleMenu = function() {
    $('#enumerator').html(this.user.get('name'));
    $('#collect_link, #manage_link').hide();
    return this.user.verify({
      isAdmin: function() {
        return $('#manage_link').show();
      },
      isUser: function() {
        $('#navigation').show();
        return $('#collect_link').show();
      },
      unregistered: function() {
        return $('#navigation').hide();
      }
    });
  };

  Navigation.prototype.handleNavigation = function() {
    if (window.location.href.toLowerCase().indexOf("assessment") !== -1) {
      $("nav#main_nav span").removeClass("border_on");
      $("#collect_link").addClass("border_on");
    }
    if (window.location.href.toLowerCase().indexOf("manage") !== -1) {
      $("nav#main_nav span").removeClass("border_on");
      return $("#manage_link").addClass("border_on");
    }
  };

  return Navigation;

})(Backbone.View);

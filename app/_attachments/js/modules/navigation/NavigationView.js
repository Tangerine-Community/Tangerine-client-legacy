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

  NavigationView.prototype.events = {
    'click span#collect_link': 'collect',
    'click span#manage_link': 'manage',
    'click span#logout_link': 'logout',
    'click button': 'submenuHandler'
  };

  NavigationView.prototype.initialize = function(options) {
    this.render();
    this.user = options.user;
    this.router = options.router;
    this.user.on('change', this.handleMenu);
    return this.user.trigger('change');
  };

  NavigationView.prototype.submenuHandler = function(event) {
    var _base;
    console.log("trying to handle");
    console.log(vm.currentView.submenuHandler != null);
    return typeof (_base = vm.currentView).submenuHandler === "function" ? _base.submenuHandler(event) : void 0;
  };

  NavigationView.prototype.closeSubmenu = function() {
    return this.$el.find("main_nav").empty();
  };

  NavigationView.prototype.render = function() {
    return this.$el.html("    <img id='corner_logo' src='images/corner_logo.png'>    <span id='version'></span>    <nav id='submenu'></nav>    <div id='enumerator_box'>      Enumerator <span id='logout_link'>LOGOUT</span>      <div id='enumerator'></div>    </div>    ");
  };

  NavigationView.prototype.collect = function() {
    return this.router.navigate('assessments', true);
  };

  NavigationView.prototype.manage = function() {
    return this.router.navigate('manage', true);
  };

  NavigationView.prototype.logout = function() {
    return this.router.navigate('logout', true);
  };

  NavigationView.prototype.handleMenu = function() {
    $('#enumerator').html(this.user.get('name'));
    $('#collect_link, #manage_link').hide();
    return this.user.verify({
      isAdmin: function() {
        return $('#navigation').show();
      },
      isUser: function() {
        return $('#navigation').show();
      },
      unregistered: function() {
        return $('#navigation').hide();
      }
    });
  };

  return NavigationView;

})(Backbone.View);

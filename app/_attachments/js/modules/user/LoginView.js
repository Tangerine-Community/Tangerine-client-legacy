var LoginView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

LoginView = (function(_super) {

  __extends(LoginView, _super);

  function LoginView() {
    this.render = __bind(this.render, this);
    LoginView.__super__.constructor.apply(this, arguments);
  }

  LoginView.prototype.className = 'login_view';

  LoginView.prototype.events = {
    "click button.login": "login",
    "keypress input": "keyHandler"
  };

  LoginView.prototype.initialize = function(options) {
    var _this = this;
    this.user = Tangerine.user;
    this.user.on("login", this.goOn);
    this.user.on("pass-error", function(error) {
      return _this.passError(error);
    });
    return this.user.on("name-error", function(error) {
      return _this.nameError(error);
    });
  };

  LoginView.prototype.goOn = function() {
    return Tangerine.router.navigate("", true);
  };

  LoginView.prototype.render = function() {
    var nameName, parentWidth, width;
    nameName = Tangerine.settings.contextualize({
      server: "User name",
      mobile: "Enumerator name",
      klass: "Teacher name"
    });
    width = $('#content').width();
    parentWidth = $('#content').offsetParent().width();
    this.oldWidth = 100 * width / parentWidth;
    $("#content").css("width", "100%");
    this.$el.html("      <img src='images/tangerine_logo.png' id='login_logo'>      <label for='name'>" + nameName + "</label>      <div id='name_message' class='messages'></div>      <input type='text' id='name'>      <label for='pass'>" + (t('password')) + "</label>      <div id='pass_message' class='messages'></div>      <input id='pass' type='password'>      <button class='login'>" + (t('login')) + "</button>    ");
    this.nameMsg = this.$el.find("#name_message");
    this.passMsg = this.$el.find("#pass_message");
    return this.trigger("rendered");
  };

  LoginView.prototype.onClose = function() {
    return $("#content").css("width", this.oldWidth + "%");
  };

  LoginView.prototype.keyHandler = function(event) {
    if (event.which) {
      if (event.which !== 13) {
        return true;
      } else {
        return this.login();
      }
    } else {
      return true;
    }
  };

  LoginView.prototype.login = function(event) {
    var name, pass;
    name = this.$el.find("#name");
    pass = this.$el.find("#pass");
    this.clearErrors();
    if (name.val() === "") this.nameError("Please enter a name.");
    if (pass.val() === "") this.passError("Please enter a password.");
    if (this.errors === 0) return this.user.login(name.val(), pass.val());
  };

  LoginView.prototype.passError = function(error) {
    this.errors++;
    this.passMsg.html(error);
    return this.$el.find("#pass").focus();
  };

  LoginView.prototype.nameError = function(error) {
    this.errors++;
    this.nameMsg.html(error);
    return this.$el.find("#name").focus();
  };

  LoginView.prototype.clearErrors = function() {
    this.nameMsg.html("");
    this.passMsg.html("");
    return this.errors = 0;
  };

  return LoginView;

})(Backbone.View);

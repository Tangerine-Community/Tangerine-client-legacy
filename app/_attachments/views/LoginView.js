var LoginView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

LoginView = (function(_super) {

  __extends(LoginView, _super);

  function LoginView() {
    this.renderMessages = __bind(this.renderMessages, this);
    this.render = __bind(this.render, this);
    LoginView.__super__.constructor.apply(this, arguments);
  }

  LoginView.prototype.initialize = function(model) {
    this.model = model;
    return this.model.on("change:messages", this.renderMessages);
  };

  LoginView.prototype.el = '#content';

  LoginView.prototype.render = function() {
    return this.$el.html("      <div id='login_wrapper'>        <img src='images/tangerine_logo.png'>        <div id='login_message'></div>        <form id='login_form'>          <label for='login_name'>Enumerator Name</label>          <input id='login_username' name='login_username'>          <label for='login_password'>Password</label>          <input id='login_password' name='login_username' type='password'>          <input id='login_button' type='submit' value='Login'>        </form>      </div>    ");
  };

  LoginView.prototype.events = {
    "submit form#login_form": "login"
  };

  LoginView.prototype.login = function() {
    var values;
    values = Utils.getValues("#login_form");
    return this.model.login(values["login_username"], values["login_password"]);
  };

  LoginView.prototype.renderMessages = function() {
    var html, message, messages, _i, _len;
    messages = this.model.get("messages") || [];
    html = "<ul>";
    for (_i = 0, _len = messages.length; _i < _len; _i++) {
      message = messages[_i];
      html += "<li>" + message + "</li>";
    }
    html += "</ul>";
    return $("#login_message").html(html);
  };

  return LoginView;

})(Backbone.View);

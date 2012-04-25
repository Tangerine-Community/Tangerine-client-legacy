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

  LoginView.prototype.className = 'login_view';

  LoginView.prototype.events = {
    "click button": "login",
    "submit form": "login",
    "keypress": "login"
  };

  LoginView.prototype.initialize = function(options) {
    this.model = options.model;
    this.model.on("change:messages", this.renderMessages);
    return this.render();
  };

  LoginView.prototype.render = function() {
    this.$el.html("      <img src='images/tangerine_logo.png'>      <div class='messages'></div>      <label for='login_username'>Enumerator Name</label>      <input id='login_username' name='login_username'>      <label for='login_password'>Password</label>      <input id='login_password' name='login_username' type='password'>      <button>Login</button>    ");
    return this.trigger("rendered");
  };

  LoginView.prototype.login = function(event) {
    var values;
    if ((event.which != null) && event.which === 13) {
      values = Utils.getValues(this.el);
      if (values['login_password'] === "") {
        this.$el.find('#login_password').focus();
        return;
      }
      return this.model.login(values["login_username"], values["login_password"]);
    }
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
    return this.$el.find(".messages").html(html);
  };

  return LoginView;

})(Backbone.View);

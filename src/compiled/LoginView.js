var LoginView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

LoginView = (function(superClass) {
  extend(LoginView, superClass);

  function LoginView() {
    this.onClose = bind(this.onClose, this);
    this.afterRender = bind(this.afterRender, this);
    this.render = bind(this.render, this);
    this.recenter = bind(this.recenter, this);
    return LoginView.__super__.constructor.apply(this, arguments);
  }

  LoginView.prototype.className = 'LoginView';

  LoginView.prototype.events = Modernizr.touch ? {
    'keypress input': 'keyHandler',
    'change input': 'onInputChange',
    'change select#name': 'onSelectChange',
    'click .mode': 'updateMode',
    'click button': 'action',
    'click .recent': 'showRecent',
    'blur .recent': 'blurRecent',
    'keyup #new_name': 'checkNewName'
  } : {
    'keypress input': 'keyHandler',
    'change input': 'onInputChange',
    'change select#name': 'onSelectChange',
    'click .mode': 'updateMode',
    'click button': 'action',
    'click .recent': 'showRecent',
    'blur .recent': 'blurRecent',
    'keyup #new_name': 'checkNewName'
  };

  LoginView.prototype.initialize = function(options) {
    $(window).on('orientationchange scroll resize', this.recenter);
    this.mode = "login";
    this.i18n();
    this.users = options.users;
    this.user = Tangerine.user;
    this.listenTo(this.user, "login", this.goOn);
    this.listenTo(this.user, "pass-error", this.passError);
    this.listenTo(this.user, "name-error", this.nameError);
    this.oldBackground = $("body").css("background");
    $("body").css("background", "white");
    return $("#footer").hide();
  };

  LoginView.prototype.checkNewName = function(event) {
    var $target, name;
    $target = $(event.target);
    name = $target.val().toLowerCase() || '';
    if (name.length > 4 && indexOf.call(this.users.pluck("name"), name) >= 0) {
      return this.nameError(this.text['error_name_taken']);
    } else {
      return this.clearErrors();
    }
  };

  LoginView.prototype.onInputChange = function(event) {
    var $target, type;
    $target = $(event.target);
    type = $target.attr("type");
    if (!(type === 'text' || (type == null))) {
      return;
    }
    return $target.val($target.val().toLowerCase());
  };

  LoginView.prototype.showRecent = function() {
    return this.$el.find("#name").autocomplete({
      source: this.user.recentUsers(),
      minLength: 0
    }).autocomplete("search", "");
  };

  LoginView.prototype.blurRecent = function() {
    this.$el.find("#name").autocomplete("close");
    return this.initAutocomplete();
  };

  LoginView.prototype.initAutocomplete = function() {
    return this.$el.find("#name").autocomplete({
      source: this.users.pluck("name")
    });
  };

  LoginView.prototype.recenter = function() {
    return this.$el.middleCenter();
  };

  LoginView.prototype.i18n = function() {
    return this.text = {
      "login": t('LoginView.button.login'),
      "sign_up": t('LoginView.button.sign_up'),
      "login_tab": t('LoginView.label.login'),
      "sign_up_tab": t('LoginView.label.sign_up'),
      "user": _(t('LoginView.label.user')).escape(),
      "teacher": _(t('LoginView.label.teacher')).escape(),
      "enumerator": _(t('LoginView.label.enumerator')).escape(),
      "password": t('LoginView.label.password'),
      "password_confirm": t('LoginView.label.password_confirm'),
      "error_name": t('LoginView.message.error_name_empty'),
      "error_pass": t('LoginView.message.error_password_empty'),
      "error_name_taken": t('LoginView.message.error_name_taken')
    };
  };

  LoginView.prototype.onSelectChange = function(event) {
    var $target;
    $target = $(event.target);
    if ($target.val() === "*new") {
      return this.updateMode("signup");
    } else {
      return this.$el.find("#pass").focus();
    }
  };

  LoginView.prototype.goOn = function() {
    return Tangerine.router.navigate("", true);
  };

  LoginView.prototype.updateMode = function(event) {
    var $login, $signup, $target;
    $target = $(event.target);
    this.mode = $target.attr('data-mode');
    $target.parent().find(".selected").removeClass("selected");
    $target.addClass("selected");
    $login = this.$el.find(".login");
    $signup = this.$el.find(".signup");
    switch (this.mode) {
      case "login":
        $login.show();
        $signup.hide();
        break;
      case "signup":
        $login.hide();
        $signup.show();
    }
    return this.$el.find("input")[0].focus();
  };

  LoginView.prototype.render = function() {
    var html, nameName;
    nameName = this.text.user;
    nameName = nameName.titleize();
    html = "<img src='images/login_logo.png' id='login_logo'> <div class='tab_container'> <div class='tab mode selected first' data-mode='login'>" + this.text.login_tab + "</div><div class='tab mode last' data-mode='signup'>" + this.text.sign_up_tab + "</div> </div> <div class='login'> <section> <div class='messages name_message'></div> <table><tr> <td><input id='name' class='tablet-name' placeholder='" + nameName + "'></td> <td><img src='images/icon_recent.png' class='recent clickable'></td> </tr></table> <div class='messages pass_message'></div> <input id='pass' type='password' placeholder='" + this.text.password + "'> <button class='login'>" + this.text.login + "</button> </section> </div> <div class='signup' style='display:none;'> <section> <div class='messages name_message'></div> <input id='new_name' class='tablet-name' type='text' placeholder='" + nameName + "'> <div class='messages pass_message'></div> <input id='new_pass_1' type='password' placeholder='" + this.text.password + "'> <input id='new_pass_2' type='password' placeholder='" + this.text.password_confirm + "'> <button class='sign_up'>" + this.text.sign_up + "</button> </section> </div>";
    this.$el.html(html);
    this.initAutocomplete();
    this.nameMsg = this.$el.find(".name_message");
    this.passMsg = this.$el.find(".pass_message");
    return this.trigger("rendered");
  };

  LoginView.prototype.afterRender = function() {
    return this.recenter();
  };

  LoginView.prototype.onClose = function() {
    $("#footer").show();
    $("body").css("background", this.oldBackground);
    return $(window).off('orientationchange scroll resize', this.recenter);
  };

  LoginView.prototype.keyHandler = function(event) {
    var char, isSpecial, key;
    key = {
      ENTER: 13,
      TAB: 9,
      BACKSPACE: 8
    };
    $('.messages').html('');
    char = event.which;
    if (char != null) {
      isSpecial = char === key.ENTER || event.keyCode === key.TAB || event.keyCode === key.BACKSPACE;
      if (!/[a-zA-Z0-9]/.test(String.fromCharCode(char)) && !isSpecial) {
        return false;
      }
      if (char === key.ENTER) {
        return this.action();
      }
    } else {
      return true;
    }
  };

  LoginView.prototype.action = function() {
    if (this.mode === "login") {
      this.login();
    }
    if (this.mode === "signup") {
      this.signup();
    }
    return false;
  };

  LoginView.prototype.signup = function() {
    var $name, $pass1, $pass2, name, pass1, pass2;
    name = ($name = this.$el.find("#new_name")).val().toLowerCase();
    pass1 = ($pass1 = this.$el.find("#new_pass_1")).val();
    pass2 = ($pass2 = this.$el.find("#new_pass_2")).val();
    if (pass1 !== pass2) {
      this.passError(this.text.pass_mismatch);
    }
    return this.user.signup(name, pass1);
  };

  LoginView.prototype.login = function() {
    var $name, $pass, name, pass;
    name = ($name = this.$el.find("#name")).val();
    pass = ($pass = this.$el.find("#pass")).val();
    this.clearErrors();
    if (name === "") {
      this.nameError(this.text.error_name);
    }
    if (pass === "") {
      this.passError(this.text.error_pass);
    }
    if (this.errors === 0) {
      this.user.login(name, pass);
    }
    return false;
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

})(Backbone.Marionette.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvdXNlci9Mb2dpblZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsU0FBQTtFQUFBOzs7OztBQUFNOzs7Ozs7Ozs7OztzQkFFSixTQUFBLEdBQVc7O3NCQUVYLE1BQUEsR0FDSyxTQUFTLENBQUMsS0FBYixHQUNFO0lBQUEsZ0JBQUEsRUFBdUIsWUFBdkI7SUFDQSxjQUFBLEVBQXVCLGVBRHZCO0lBRUEsb0JBQUEsRUFBdUIsZ0JBRnZCO0lBR0EsYUFBQSxFQUFrQixZQUhsQjtJQUlBLGNBQUEsRUFBa0IsUUFKbEI7SUFLQSxlQUFBLEVBQWtCLFlBTGxCO0lBTUEsY0FBQSxFQUF1QixZQU52QjtJQU9BLGlCQUFBLEVBQXVCLGNBUHZCO0dBREYsR0FVRTtJQUFBLGdCQUFBLEVBQXVCLFlBQXZCO0lBQ0EsY0FBQSxFQUF1QixlQUR2QjtJQUVBLG9CQUFBLEVBQXVCLGdCQUZ2QjtJQUdBLGFBQUEsRUFBdUIsWUFIdkI7SUFJQSxjQUFBLEVBQXVCLFFBSnZCO0lBS0EsZUFBQSxFQUF1QixZQUx2QjtJQU1BLGNBQUEsRUFBdUIsWUFOdkI7SUFPQSxpQkFBQSxFQUF1QixjQVB2Qjs7O3NCQVNKLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFDVixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsRUFBVixDQUFhLGlDQUFiLEVBQWdELElBQUMsQ0FBQSxRQUFqRDtJQUNBLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFDUixJQUFDLENBQUEsSUFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUM7SUFDakIsSUFBQyxDQUFBLElBQUQsR0FBUSxTQUFTLENBQUM7SUFFbEIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsSUFBWCxFQUFpQixPQUFqQixFQUEwQixJQUFDLENBQUEsSUFBM0I7SUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxJQUFYLEVBQWlCLFlBQWpCLEVBQStCLElBQUMsQ0FB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QixFQUFBOztJQUNBLElBQWdDLElBQUEsS0FBUSxFQUF4QztNQUFBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUFqQixFQUFBOztJQUVBLElBQUcsSUFBQyxDQUFBLE1BQUQsS0FBVyxDQUFkO01BQ0UsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQVksSUFBWixFQUFrQixJQUFsQixFQURGOztBQUlBLFdBQU87RUFiRjs7c0JBZVAsU0FBQSxHQUFXLFNBQUMsS0FBRDtJQUNULElBQUMsQ0FBQSxNQUFEO0lBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsS0FBZDtXQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBa0IsQ0FBQyxLQUFuQixDQUFBO0VBSFM7O3NCQUtYLFNBQUEsR0FBVyxTQUFDLEtBQUQ7SUFDVCxJQUFDLENBQUEsTUFBRDtJQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLEtBQWQ7V0FDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxPQUFWLENBQWtCLENBQUMsS0FBbkIsQ0FBQTtFQUhTOztzQkFLWCxXQUFBLEdBQWEsU0FBQTtJQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLEVBQWQ7SUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxFQUFkO1dBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtFQUhDOzs7O0dBaFBTLFFBQVEsQ0FBQyxVQUFVLENBQUMiLCJmaWxlIjoibW9kdWxlcy91c2VyL0xvZ2luVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIExvZ2luVmlldyBleHRlbmRzIEJhY2tib25lLk1hcmlvbmV0dGUuVmlld1xuXG4gIGNsYXNzTmFtZTogJ0xvZ2luVmlldydcblxuICBldmVudHM6XG4gICAgaWYgTW9kZXJuaXpyLnRvdWNoXG4gICAgICAna2V5cHJlc3MgaW5wdXQnICAgICA6ICdrZXlIYW5kbGVyJ1xuICAgICAgJ2NoYW5nZSBpbnB1dCcgICAgICAgOiAnb25JbnB1dENoYW5nZSdcbiAgICAgICdjaGFuZ2Ugc2VsZWN0I25hbWUnIDogJ29uU2VsZWN0Q2hhbmdlJ1xuICAgICAgJ2NsaWNrIC5tb2RlJyAgIDogJ3VwZGF0ZU1vZGUnXG4gICAgICAnY2xpY2sgYnV0dG9uJyAgOiAnYWN0aW9uJ1xuICAgICAgJ2NsaWNrIC5yZWNlbnQnIDogJ3Nob3dSZWNlbnQnXG4gICAgICAnYmx1ciAucmVjZW50JyAgICAgICA6ICdibHVyUmVjZW50J1xuICAgICAgJ2tleXVwICNuZXdfbmFtZScgICAgOiAnY2hlY2tOZXdOYW1lJ1xuICAgIGVsc2VcbiAgICAgICdrZXlwcmVzcyBpbnB1dCcgICAgIDogJ2tleUhhbmRsZXInXG4gICAgICAnY2hhbmdlIGlucHV0JyAgICAgICA6ICdvbklucHV0Q2hhbmdlJ1xuICAgICAgJ2NoYW5nZSBzZWxlY3QjbmFtZScgOiAnb25TZWxlY3RDaGFuZ2UnXG4gICAgICAnY2xpY2sgLm1vZGUnICAgICAgICA6ICd1cGRhdGVNb2RlJ1xuICAgICAgJ2NsaWNrIGJ1dHRvbicgICAgICAgOiAnYWN0aW9uJ1xuICAgICAgJ2NsaWNrIC5yZWNlbnQnICAgICAgOiAnc2hvd1JlY2VudCdcbiAgICAgICdibHVyIC5yZWNlbnQnICAgICAgIDogJ2JsdXJSZWNlbnQnXG4gICAgICAna2V5dXAgI25ld19uYW1lJyAgICA6ICdjaGVja05ld05hbWUnXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgJCh3aW5kb3cpLm9uKCdvcmllbnRhdGlvbmNoYW5nZSBzY3JvbGwgcmVzaXplJywgQHJlY2VudGVyKVxuICAgIEBtb2RlID0gXCJsb2dpblwiXG4gICAgQGkxOG4oKVxuICAgIEB1c2VycyA9IG9wdGlvbnMudXNlcnNcbiAgICBAdXNlciA9IFRhbmdlcmluZS51c2VyXG4gICAgXG4gICAgQGxpc3RlblRvIEB1c2VyLCBcImxvZ2luXCIsIEBnb09uXG4gICAgQGxpc3RlblRvIEB1c2VyLCBcInBhc3MtZXJyb3JcIiwgQHBhc3NFcnJvclxuICAgIEBsaXN0ZW5UbyBAdXNlciwgXCJuYW1lLWVycm9yXCIsIEBuYW1lRXJyb3JcbiAgICBcbiAgICBAb2xkQmFja2dyb3VuZCA9ICQoXCJib2R5XCIpLmNzcyhcImJhY2tncm91bmRcIilcbiAgICAkKFwiYm9keVwiKS5jc3MoXCJiYWNrZ3JvdW5kXCIsIFwid2hpdGVcIilcbiAgICAkKFwiI2Zvb3RlclwiKS5oaWRlKClcblxuICBjaGVja05ld05hbWU6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgbmFtZSA9ICggJHRhcmdldC52YWwoKS50b0xvd2VyQ2FzZSgpIHx8ICcnIClcbiAgICBpZiBuYW1lLmxlbmd0aCA+IDQgYW5kIG5hbWUgaW4gQHVzZXJzLnBsdWNrKFwibmFtZVwiKVxuICAgICAgQG5hbWVFcnJvcihAdGV4dFsnZXJyb3JfbmFtZV90YWtlbiddKVxuICAgIGVsc2VcbiAgICAgIEBjbGVhckVycm9ycygpXG5cblxuICBvbklucHV0Q2hhbmdlOiAoZXZlbnQpIC0+XG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIHR5cGUgPSAkdGFyZ2V0LmF0dHIoXCJ0eXBlXCIpXG4gICAgcmV0dXJuIHVubGVzcyB0eXBlIGlzICd0ZXh0JyBvciBub3QgdHlwZT9cblxuICAgICR0YXJnZXQudmFsKCR0YXJnZXQudmFsKCkudG9Mb3dlckNhc2UoKSlcblxuICBzaG93UmVjZW50OiAtPlxuICAgIEAkZWwuZmluZChcIiNuYW1lXCIpLmF1dG9jb21wbGV0ZShcbiAgICAgIHNvdXJjZTogQHVzZXIucmVjZW50VXNlcnMoKVxuICAgICAgbWluTGVuZ3RoOiAwXG4gICAgKS5hdXRvY29tcGxldGUoXCJzZWFyY2hcIiwgXCJcIilcblxuICBibHVyUmVjZW50OiAtPlxuICAgIEAkZWwuZmluZChcIiNuYW1lXCIpLmF1dG9jb21wbGV0ZShcImNsb3NlXCIpXG4gICAgQGluaXRBdXRvY29tcGxldGUoKVxuXG4gIGluaXRBdXRvY29tcGxldGU6IC0+XG4gICAgQCRlbC5maW5kKFwiI25hbWVcIikuYXV0b2NvbXBsZXRlXG4gICAgICBzb3VyY2U6IEB1c2Vycy5wbHVjayhcIm5hbWVcIilcblxuICByZWNlbnRlcjogPT5cbiAgICBAJGVsLm1pZGRsZUNlbnRlcigpXG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICBcImxvZ2luXCIgICAgICA6IHQoJ0xvZ2luVmlldy5idXR0b24ubG9naW4nKVxuICAgICAgXCJzaWduX3VwXCIgICAgOiB0KCdMb2dpblZpZXcuYnV0dG9uLnNpZ25fdXAnKVxuXG4gICAgICBcImxvZ2luX3RhYlwiICA6IHQoJ0xvZ2luVmlldy5sYWJlbC5sb2dpbicpXG4gICAgICBcInNpZ25fdXBfdGFiXCIgIDogdCgnTG9naW5WaWV3LmxhYmVsLnNpZ25fdXAnKVxuXG4gICAgICBcInVzZXJcIiAgICAgICA6IF8odCgnTG9naW5WaWV3LmxhYmVsLnVzZXInKSkuZXNjYXBlKClcbiAgICAgIFwidGVhY2hlclwiICAgIDogXyh0KCdMb2dpblZpZXcubGFiZWwudGVhY2hlcicpKS5lc2NhcGUoKVxuICAgICAgXCJlbnVtZXJhdG9yXCIgOiBfKHQoJ0xvZ2luVmlldy5sYWJlbC5lbnVtZXJhdG9yJykpLmVzY2FwZSgpXG4gICAgICBcInBhc3N3b3JkXCIgICA6IHQoJ0xvZ2luVmlldy5sYWJlbC5wYXNzd29yZCcpXG4gICAgICBcInBhc3N3b3JkX2NvbmZpcm1cIiA6IHQoJ0xvZ2luVmlldy5sYWJlbC5wYXNzd29yZF9jb25maXJtJylcbiAgICAgIFwiZXJyb3JfbmFtZVwiIDogdCgnTG9naW5WaWV3Lm1lc3NhZ2UuZXJyb3JfbmFtZV9lbXB0eScpXG4gICAgICBcImVycm9yX3Bhc3NcIiA6IHQoJ0xvZ2luVmlldy5tZXNzYWdlLmVycm9yX3Bhc3N3b3JkX2VtcHR5JylcbiAgICAgIFwiZXJyb3JfbmFtZV90YWtlblwiIDogdCgnTG9naW5WaWV3Lm1lc3NhZ2UuZXJyb3JfbmFtZV90YWtlbicpXG5cblxuICBvblNlbGVjdENoYW5nZTogKGV2ZW50KSAtPlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBpZiAkdGFyZ2V0LnZhbCgpID09IFwiKm5ld1wiXG4gICAgICBAdXBkYXRlTW9kZSBcInNpZ251cFwiXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI3Bhc3NcIikuZm9jdXMoKVxuXG4gIGdvT246IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJcIiwgdHJ1ZVxuXG4gIHVwZGF0ZU1vZGU6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgQG1vZGUgPSAkdGFyZ2V0LmF0dHIoJ2RhdGEtbW9kZScpXG4gICAgJHRhcmdldC5wYXJlbnQoKS5maW5kKFwiLnNlbGVjdGVkXCIpLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWRcIilcbiAgICAkdGFyZ2V0LmFkZENsYXNzKFwic2VsZWN0ZWRcIilcbiAgICAkbG9naW4gID0gQCRlbC5maW5kKFwiLmxvZ2luXCIpXG4gICAgJHNpZ251cCA9IEAkZWwuZmluZChcIi5zaWdudXBcIilcblxuICAgIHN3aXRjaCBAbW9kZVxuICAgICAgd2hlbiBcImxvZ2luXCJcbiAgICAgICAgJGxvZ2luLnNob3coKVxuICAgICAgICAkc2lnbnVwLmhpZGUoKVxuICAgICAgd2hlbiBcInNpZ251cFwiXG4gICAgICAgICRsb2dpbi5oaWRlKClcbiAgICAgICAgJHNpZ251cC5zaG93KClcblxuICAgIEAkZWwuZmluZChcImlucHV0XCIpWzBdLmZvY3VzKClcblxuICByZW5kZXI6ID0+XG5cbiAgICBuYW1lTmFtZSA9ICBAdGV4dC51c2VyXG5cbiAgICBuYW1lTmFtZSA9IG5hbWVOYW1lLnRpdGxlaXplKClcblxuICAgIGh0bWwgPSBcIlxuICAgICAgPGltZyBzcmM9J2ltYWdlcy9sb2dpbl9sb2dvLnBuZycgaWQ9J2xvZ2luX2xvZ28nPlxuXG4gICAgICA8ZGl2IGNsYXNzPSd0YWJfY29udGFpbmVyJz5cbiAgICAgICAgPGRpdiBjbGFzcz0ndGFiIG1vZGUgc2VsZWN0ZWQgZmlyc3QnIGRhdGEtbW9kZT0nbG9naW4nPiN7QHRleHQubG9naW5fdGFifTwvZGl2PjxkaXYgY2xhc3M9J3RhYiBtb2RlIGxhc3QnIGRhdGEtbW9kZT0nc2lnbnVwJz4je0B0ZXh0LnNpZ25fdXBfdGFifTwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9J2xvZ2luJz5cbiAgICAgICAgPHNlY3Rpb24+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdtZXNzYWdlcyBuYW1lX21lc3NhZ2UnPjwvZGl2PlxuICAgICAgICAgIDx0YWJsZT48dHI+XG4gICAgICAgICAgICA8dGQ+PGlucHV0IGlkPSduYW1lJyBjbGFzcz0ndGFibGV0LW5hbWUnIHBsYWNlaG9sZGVyPScje25hbWVOYW1lfSc+PC90ZD5cbiAgICAgICAgICAgIDx0ZD48aW1nIHNyYz0naW1hZ2VzL2ljb25fcmVjZW50LnBuZycgY2xhc3M9J3JlY2VudCBjbGlja2FibGUnPjwvdGQ+XG4gICAgICAgICAgPC90cj48L3RhYmxlPlxuXG4gICAgICAgICAgPGRpdiBjbGFzcz0nbWVzc2FnZXMgcGFzc19tZXNzYWdlJz48L2Rpdj5cbiAgICAgICAgICA8aW5wdXQgaWQ9J3Bhc3MnIHR5cGU9J3Bhc3N3b3JkJyBwbGFjZWhvbGRlcj0nI3tAdGV4dC5wYXNzd29yZH0nPlxuXG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbG9naW4nPiN7QHRleHQubG9naW59PC9idXR0b24+XG5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9J3NpZ251cCcgc3R5bGU9J2Rpc3BsYXk6bm9uZTsnPlxuICAgICAgICA8c2VjdGlvbj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9J21lc3NhZ2VzIG5hbWVfbWVzc2FnZSc+PC9kaXY+XG4gICAgICAgICAgPGlucHV0IGlkPSduZXdfbmFtZScgY2xhc3M9J3RhYmxldC1uYW1lJyB0eXBlPSd0ZXh0JyBwbGFjZWhvbGRlcj0nI3tuYW1lTmFtZX0nPlxuXG4gICAgICAgICAgPGRpdiBjbGFzcz0nbWVzc2FnZXMgcGFzc19tZXNzYWdlJz48L2Rpdj5cbiAgICAgICAgICA8aW5wdXQgaWQ9J25ld19wYXNzXzEnIHR5cGU9J3Bhc3N3b3JkJyBwbGFjZWhvbGRlcj0nI3tAdGV4dC5wYXNzd29yZH0nPlxuXG4gICAgICAgICAgPGlucHV0IGlkPSduZXdfcGFzc18yJyB0eXBlPSdwYXNzd29yZCcgcGxhY2Vob2xkZXI9JyN7QHRleHQucGFzc3dvcmRfY29uZmlybX0nPlxuXG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nc2lnbl91cCc+I3tAdGV4dC5zaWduX3VwfTwvYnV0dG9uPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cbiAgICBcIlxuXG4gICAgQCRlbC5odG1sIGh0bWxcblxuICAgIEBpbml0QXV0b2NvbXBsZXRlKClcblxuICAgIEBuYW1lTXNnID0gQCRlbC5maW5kKFwiLm5hbWVfbWVzc2FnZVwiKVxuICAgIEBwYXNzTXNnID0gQCRlbC5maW5kKFwiLnBhc3NfbWVzc2FnZVwiKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgYWZ0ZXJSZW5kZXI6ID0+XG4gICAgQHJlY2VudGVyKClcblxuICBvbkNsb3NlOiA9PlxuICAgICQoXCIjZm9vdGVyXCIpLnNob3coKVxuICAgICQoXCJib2R5XCIpLmNzcyhcImJhY2tncm91bmRcIiwgQG9sZEJhY2tncm91bmQpXG4gICAgJCh3aW5kb3cpLm9mZignb3JpZW50YXRpb25jaGFuZ2Ugc2Nyb2xsIHJlc2l6ZScsIEByZWNlbnRlcilcblxuICBrZXlIYW5kbGVyOiAoZXZlbnQpIC0+XG5cbiAgICBrZXkgPVxuICAgICAgRU5URVIgICAgIDogMTNcbiAgICAgIFRBQiAgICAgICA6IDlcbiAgICAgIEJBQ0tTUEFDRSA6IDhcblxuICAgICQoJy5tZXNzYWdlcycpLmh0bWwoJycpXG4gICAgY2hhciA9IGV2ZW50LndoaWNoXG4gICAgaWYgY2hhcj9cbiAgICAgIGlzU3BlY2lhbCA9XG4gICAgICAgIGNoYXIgaXMga2V5LkVOVEVSICAgICAgICAgICAgICBvclxuICAgICAgICBldmVudC5rZXlDb2RlIGlzIGtleS5UQUIgICAgICAgb3JcbiAgICAgICAgZXZlbnQua2V5Q29kZSBpcyBrZXkuQkFDS1NQQUNFXG4gICAgICAjIEFsbG93IHVwcGVyIGNhc2UgaGVyZSBidXQgbWFrZSBpdCBzbyBpdCdzIG5vdCBsYXRlclxuICAgICAgcmV0dXJuIGZhbHNlIGlmIG5vdCAvW2EtekEtWjAtOV0vLnRlc3QoU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyKSkgYW5kIG5vdCBpc1NwZWNpYWxcbiAgICAgIHJldHVybiBAYWN0aW9uKCkgaWYgY2hhciBpcyBrZXkuRU5URVJcbiAgICBlbHNlXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gIGFjdGlvbjogLT5cbiAgICBAbG9naW4oKSAgaWYgQG1vZGUgaXMgXCJsb2dpblwiXG4gICAgQHNpZ251cCgpIGlmIEBtb2RlIGlzIFwic2lnbnVwXCJcbiAgICByZXR1cm4gZmFsc2VcblxuICBzaWdudXA6IC0+XG4gICAgbmFtZSAgPSAoJG5hbWUgID0gQCRlbC5maW5kKFwiI25ld19uYW1lXCIpKS52YWwoKS50b0xvd2VyQ2FzZSgpXG4gICAgcGFzczEgPSAoJHBhc3MxID0gQCRlbC5maW5kKFwiI25ld19wYXNzXzFcIikpLnZhbCgpXG4gICAgcGFzczIgPSAoJHBhc3MyID0gQCRlbC5maW5kKFwiI25ld19wYXNzXzJcIikpLnZhbCgpXG5cbiAgICBAcGFzc0Vycm9yKEB0ZXh0LnBhc3NfbWlzbWF0Y2gpIGlmIHBhc3MxIGlzbnQgcGFzczJcblxuICAgIEB1c2VyLnNpZ251cCBuYW1lLCBwYXNzMVxuXG5cbiAgbG9naW46IC0+XG4gICAgbmFtZSA9ICgkbmFtZSA9IEAkZWwuZmluZChcIiNuYW1lXCIpKS52YWwoKVxuICAgIHBhc3MgPSAoJHBhc3MgPSBAJGVsLmZpbmQoXCIjcGFzc1wiKSkudmFsKClcblxuICAgIEBjbGVhckVycm9ycygpXG5cbiAgICBAbmFtZUVycm9yKEB0ZXh0LmVycm9yX25hbWUpIGlmIG5hbWUgPT0gXCJcIlxuICAgIEBwYXNzRXJyb3IoQHRleHQuZXJyb3JfcGFzcykgaWYgcGFzcyA9PSBcIlwiXG5cbiAgICBpZiBAZXJyb3JzID09IDBcbiAgICAgIEB1c2VyLmxvZ2luIG5hbWUsIHBhc3NcblxuXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgcGFzc0Vycm9yOiAoZXJyb3IpIC0+XG4gICAgQGVycm9ycysrXG4gICAgQHBhc3NNc2cuaHRtbCBlcnJvclxuICAgIEAkZWwuZmluZChcIiNwYXNzXCIpLmZvY3VzKClcblxuICBuYW1lRXJyb3I6IChlcnJvcikgLT5cbiAgICBAZXJyb3JzKytcbiAgICBAbmFtZU1zZy5odG1sIGVycm9yXG4gICAgQCRlbC5maW5kKFwiI25hbWVcIikuZm9jdXMoKVxuXG4gIGNsZWFyRXJyb3JzOiAtPlxuICAgIEBuYW1lTXNnLmh0bWwgXCJcIlxuICAgIEBwYXNzTXNnLmh0bWwgXCJcIlxuICAgIEBlcnJvcnMgPSAwXG4iXX0=

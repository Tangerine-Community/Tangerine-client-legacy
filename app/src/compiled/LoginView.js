var LoginView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

LoginView = (function(superClass) {
  extend(LoginView, superClass);

  function LoginView() {
    this.onBeforeDestroy = bind(this.onBeforeDestroy, this);
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

  LoginView.prototype.onBeforeDestroy = function() {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvdXNlci9Mb2dpblZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsU0FBQTtFQUFBOzs7OztBQUFNOzs7Ozs7Ozs7OztzQkFFSixTQUFBLEdBQVc7O3NCQUVYLE1BQUEsR0FDSyxTQUFTLENBQUMsS0FBYixHQUNFO0lBQUEsZ0JBQUEsRUFBdUIsWUFBdkI7SUFDQSxjQUFBLEVBQXVCLGVBRHZCO0lBRUEsb0JBQUEsRUFBdUIsZ0JBRnZCO0lBR0EsYUFBQSxFQUFrQixZQUhsQjtJQUlBLGNBQUEsRUFBa0IsUUFKbEI7SUFLQSxlQUFBLEVBQWtCLFlBTGxCO0lBTUEsY0FBQSxFQUF1QixZQU52QjtJQU9BLGlCQUFBLEVBQXVCLGNBUHZCO0dBREYsR0FVRTtJQUFBLGdCQUFBLEVBQXVCLFlBQXZCO0lBQ0EsY0FBQSxFQUF1QixlQUR2QjtJQUVBLG9CQUFBLEVBQXVCLGdCQUZ2QjtJQUdBLGFBQUEsRUFBdUIsWUFIdkI7SUFJQSxjQUFBLEVBQXVCLFFBSnZCO0lBS0EsZUFBQSxFQUF1QixZQUx2QjtJQU1BLGNBQUEsRUFBdUIsWUFOdkI7SUFPQSxpQkFBQSxFQUF1QixjQVB2Qjs7O3NCQVNKLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFDVixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsRUFBVixDQUFhLGlDQUFiLEVBQWdELElBQUMsQ0FBQSxRQUFqRDtJQUNBLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFDUixJQUFDLENBQUEsSUFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUM7SUFDakIsSUFBQyxDQUFBLElBQUQsR0FBUSxTQUFTLENBQUM7SUFFbEIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsSUFBWCxFQUFpQixPQUFqQixFQUEwQixJQUFDLENBQUEsSUFBM0I7SUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxJQUFYLEVBQWlCLFlBQWpCLEVBQStCLElBQUMsQ0FB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QWpCLEVBQUE7O0lBQ0EsSUFBZ0MsSUFBQSxLQUFRLEVBQXhDO01BQUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLFVBQWpCLEVBQUE7O0lBRUEsSUFBRyxJQUFDLENBQUEsTUFBRCxLQUFXLENBQWQ7TUFDRSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBWSxJQUFaLEVBQWtCLElBQWxCLEVBREY7O0FBSUEsV0FBTztFQWJGOztzQkFlUCxTQUFBLEdBQVcsU0FBQyxLQUFEO0lBQ1QsSUFBQyxDQUFBLE1BQUQ7SUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxLQUFkO1dBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsT0FBVixDQUFrQixDQUFDLEtBQW5CLENBQUE7RUFIUzs7c0JBS1gsU0FBQSxHQUFXLFNBQUMsS0FBRDtJQUNULElBQUMsQ0FBQSxNQUFEO0lBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsS0FBZDtXQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBa0IsQ0FBQyxLQUFuQixDQUFBO0VBSFM7O3NCQUtYLFdBQUEsR0FBYSxTQUFBO0lBQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsRUFBZDtJQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLEVBQWQ7V0FDQSxJQUFDLENBQUEsTUFBRCxHQUFVO0VBSEM7Ozs7R0FoUFMsUUFBUSxDQUFDLFVBQVUsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3VzZXIvTG9naW5WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTG9naW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuTWFyaW9uZXR0ZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiAnTG9naW5WaWV3J1xuXG4gIGV2ZW50czpcbiAgICBpZiBNb2Rlcm5penIudG91Y2hcbiAgICAgICdrZXlwcmVzcyBpbnB1dCcgICAgIDogJ2tleUhhbmRsZXInXG4gICAgICAnY2hhbmdlIGlucHV0JyAgICAgICA6ICdvbklucHV0Q2hhbmdlJ1xuICAgICAgJ2NoYW5nZSBzZWxlY3QjbmFtZScgOiAnb25TZWxlY3RDaGFuZ2UnXG4gICAgICAnY2xpY2sgLm1vZGUnICAgOiAndXBkYXRlTW9kZSdcbiAgICAgICdjbGljayBidXR0b24nICA6ICdhY3Rpb24nXG4gICAgICAnY2xpY2sgLnJlY2VudCcgOiAnc2hvd1JlY2VudCdcbiAgICAgICdibHVyIC5yZWNlbnQnICAgICAgIDogJ2JsdXJSZWNlbnQnXG4gICAgICAna2V5dXAgI25ld19uYW1lJyAgICA6ICdjaGVja05ld05hbWUnXG4gICAgZWxzZVxuICAgICAgJ2tleXByZXNzIGlucHV0JyAgICAgOiAna2V5SGFuZGxlcidcbiAgICAgICdjaGFuZ2UgaW5wdXQnICAgICAgIDogJ29uSW5wdXRDaGFuZ2UnXG4gICAgICAnY2hhbmdlIHNlbGVjdCNuYW1lJyA6ICdvblNlbGVjdENoYW5nZSdcbiAgICAgICdjbGljayAubW9kZScgICAgICAgIDogJ3VwZGF0ZU1vZGUnXG4gICAgICAnY2xpY2sgYnV0dG9uJyAgICAgICA6ICdhY3Rpb24nXG4gICAgICAnY2xpY2sgLnJlY2VudCcgICAgICA6ICdzaG93UmVjZW50J1xuICAgICAgJ2JsdXIgLnJlY2VudCcgICAgICAgOiAnYmx1clJlY2VudCdcbiAgICAgICdrZXl1cCAjbmV3X25hbWUnICAgIDogJ2NoZWNrTmV3TmFtZSdcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAkKHdpbmRvdykub24oJ29yaWVudGF0aW9uY2hhbmdlIHNjcm9sbCByZXNpemUnLCBAcmVjZW50ZXIpXG4gICAgQG1vZGUgPSBcImxvZ2luXCJcbiAgICBAaTE4bigpXG4gICAgQHVzZXJzID0gb3B0aW9ucy51c2Vyc1xuICAgIEB1c2VyID0gVGFuZ2VyaW5lLnVzZXJcbiAgICBcbiAgICBAbGlzdGVuVG8gQHVzZXIsIFwibG9naW5cIiwgQGdvT25cbiAgICBAbGlzdGVuVG8gQHVzZXIsIFwicGFzcy1lcnJvclwiLCBAcGFzc0Vycm9yXG4gICAgQGxpc3RlblRvIEB1c2VyLCBcIm5hbWUtZXJyb3JcIiwgQG5hbWVFcnJvclxuICAgIFxuICAgIEBvbGRCYWNrZ3JvdW5kID0gJChcImJvZHlcIikuY3NzKFwiYmFja2dyb3VuZFwiKVxuICAgICQoXCJib2R5XCIpLmNzcyhcImJhY2tncm91bmRcIiwgXCJ3aGl0ZVwiKVxuICAgICQoXCIjZm9vdGVyXCIpLmhpZGUoKVxuXG4gIGNoZWNrTmV3TmFtZTogKGV2ZW50KSAtPlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBuYW1lID0gKCAkdGFyZ2V0LnZhbCgpLnRvTG93ZXJDYXNlKCkgfHwgJycgKVxuICAgIGlmIG5hbWUubGVuZ3RoID4gNCBhbmQgbmFtZSBpbiBAdXNlcnMucGx1Y2soXCJuYW1lXCIpXG4gICAgICBAbmFtZUVycm9yKEB0ZXh0WydlcnJvcl9uYW1lX3Rha2VuJ10pXG4gICAgZWxzZVxuICAgICAgQGNsZWFyRXJyb3JzKClcblxuXG4gIG9uSW5wdXRDaGFuZ2U6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgdHlwZSA9ICR0YXJnZXQuYXR0cihcInR5cGVcIilcbiAgICByZXR1cm4gdW5sZXNzIHR5cGUgaXMgJ3RleHQnIG9yIG5vdCB0eXBlP1xuXG4gICAgJHRhcmdldC52YWwoJHRhcmdldC52YWwoKS50b0xvd2VyQ2FzZSgpKVxuXG4gIHNob3dSZWNlbnQ6IC0+XG4gICAgQCRlbC5maW5kKFwiI25hbWVcIikuYXV0b2NvbXBsZXRlKFxuICAgICAgc291cmNlOiBAdXNlci5yZWNlbnRVc2VycygpXG4gICAgICBtaW5MZW5ndGg6IDBcbiAgICApLmF1dG9jb21wbGV0ZShcInNlYXJjaFwiLCBcIlwiKVxuXG4gIGJsdXJSZWNlbnQ6IC0+XG4gICAgQCRlbC5maW5kKFwiI25hbWVcIikuYXV0b2NvbXBsZXRlKFwiY2xvc2VcIilcbiAgICBAaW5pdEF1dG9jb21wbGV0ZSgpXG5cbiAgaW5pdEF1dG9jb21wbGV0ZTogLT5cbiAgICBAJGVsLmZpbmQoXCIjbmFtZVwiKS5hdXRvY29tcGxldGVcbiAgICAgIHNvdXJjZTogQHVzZXJzLnBsdWNrKFwibmFtZVwiKVxuXG4gIHJlY2VudGVyOiA9PlxuICAgIEAkZWwubWlkZGxlQ2VudGVyKClcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIFwibG9naW5cIiAgICAgIDogdCgnTG9naW5WaWV3LmJ1dHRvbi5sb2dpbicpXG4gICAgICBcInNpZ25fdXBcIiAgICA6IHQoJ0xvZ2luVmlldy5idXR0b24uc2lnbl91cCcpXG5cbiAgICAgIFwibG9naW5fdGFiXCIgIDogdCgnTG9naW5WaWV3LmxhYmVsLmxvZ2luJylcbiAgICAgIFwic2lnbl91cF90YWJcIiAgOiB0KCdMb2dpblZpZXcubGFiZWwuc2lnbl91cCcpXG5cbiAgICAgIFwidXNlclwiICAgICAgIDogXyh0KCdMb2dpblZpZXcubGFiZWwudXNlcicpKS5lc2NhcGUoKVxuICAgICAgXCJ0ZWFjaGVyXCIgICAgOiBfKHQoJ0xvZ2luVmlldy5sYWJlbC50ZWFjaGVyJykpLmVzY2FwZSgpXG4gICAgICBcImVudW1lcmF0b3JcIiA6IF8odCgnTG9naW5WaWV3LmxhYmVsLmVudW1lcmF0b3InKSkuZXNjYXBlKClcbiAgICAgIFwicGFzc3dvcmRcIiAgIDogdCgnTG9naW5WaWV3LmxhYmVsLnBhc3N3b3JkJylcbiAgICAgIFwicGFzc3dvcmRfY29uZmlybVwiIDogdCgnTG9naW5WaWV3LmxhYmVsLnBhc3N3b3JkX2NvbmZpcm0nKVxuICAgICAgXCJlcnJvcl9uYW1lXCIgOiB0KCdMb2dpblZpZXcubWVzc2FnZS5lcnJvcl9uYW1lX2VtcHR5JylcbiAgICAgIFwiZXJyb3JfcGFzc1wiIDogdCgnTG9naW5WaWV3Lm1lc3NhZ2UuZXJyb3JfcGFzc3dvcmRfZW1wdHknKVxuICAgICAgXCJlcnJvcl9uYW1lX3Rha2VuXCIgOiB0KCdMb2dpblZpZXcubWVzc2FnZS5lcnJvcl9uYW1lX3Rha2VuJylcblxuXG4gIG9uU2VsZWN0Q2hhbmdlOiAoZXZlbnQpIC0+XG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIGlmICR0YXJnZXQudmFsKCkgPT0gXCIqbmV3XCJcbiAgICAgIEB1cGRhdGVNb2RlIFwic2lnbnVwXCJcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIjcGFzc1wiKS5mb2N1cygpXG5cbiAgZ29PbjogLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcIlwiLCB0cnVlXG5cbiAgdXBkYXRlTW9kZTogKGV2ZW50KSAtPlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBAbW9kZSA9ICR0YXJnZXQuYXR0cignZGF0YS1tb2RlJylcbiAgICAkdGFyZ2V0LnBhcmVudCgpLmZpbmQoXCIuc2VsZWN0ZWRcIikucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKVxuICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKVxuICAgICRsb2dpbiAgPSBAJGVsLmZpbmQoXCIubG9naW5cIilcbiAgICAkc2lnbnVwID0gQCRlbC5maW5kKFwiLnNpZ251cFwiKVxuXG4gICAgc3dpdGNoIEBtb2RlXG4gICAgICB3aGVuIFwibG9naW5cIlxuICAgICAgICAkbG9naW4uc2hvdygpXG4gICAgICAgICRzaWdudXAuaGlkZSgpXG4gICAgICB3aGVuIFwic2lnbnVwXCJcbiAgICAgICAgJGxvZ2luLmhpZGUoKVxuICAgICAgICAkc2lnbnVwLnNob3coKVxuXG4gICAgQCRlbC5maW5kKFwiaW5wdXRcIilbMF0uZm9jdXMoKVxuXG4gIHJlbmRlcjogPT5cblxuICAgIG5hbWVOYW1lID0gIEB0ZXh0LnVzZXJcblxuICAgIG5hbWVOYW1lID0gbmFtZU5hbWUudGl0bGVpemUoKVxuXG4gICAgaHRtbCA9IFwiXG4gICAgICA8aW1nIHNyYz0naW1hZ2VzL2xvZ2luX2xvZ28ucG5nJyBpZD0nbG9naW5fbG9nbyc+XG5cbiAgICAgIDxkaXYgY2xhc3M9J3RhYl9jb250YWluZXInPlxuICAgICAgICA8ZGl2IGNsYXNzPSd0YWIgbW9kZSBzZWxlY3RlZCBmaXJzdCcgZGF0YS1tb2RlPSdsb2dpbic+I3tAdGV4dC5sb2dpbl90YWJ9PC9kaXY+PGRpdiBjbGFzcz0ndGFiIG1vZGUgbGFzdCcgZGF0YS1tb2RlPSdzaWdudXAnPiN7QHRleHQuc2lnbl91cF90YWJ9PC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbG9naW4nPlxuICAgICAgICA8c2VjdGlvbj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9J21lc3NhZ2VzIG5hbWVfbWVzc2FnZSc+PC9kaXY+XG4gICAgICAgICAgPHRhYmxlPjx0cj5cbiAgICAgICAgICAgIDx0ZD48aW5wdXQgaWQ9J25hbWUnIGNsYXNzPSd0YWJsZXQtbmFtZScgcGxhY2Vob2xkZXI9JyN7bmFtZU5hbWV9Jz48L3RkPlxuICAgICAgICAgICAgPHRkPjxpbWcgc3JjPSdpbWFnZXMvaWNvbl9yZWNlbnQucG5nJyBjbGFzcz0ncmVjZW50IGNsaWNrYWJsZSc+PC90ZD5cbiAgICAgICAgICA8L3RyPjwvdGFibGU+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdtZXNzYWdlcyBwYXNzX21lc3NhZ2UnPjwvZGl2PlxuICAgICAgICAgIDxpbnB1dCBpZD0ncGFzcycgdHlwZT0ncGFzc3dvcmQnIHBsYWNlaG9sZGVyPScje0B0ZXh0LnBhc3N3b3JkfSc+XG5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdsb2dpbic+I3tAdGV4dC5sb2dpbn08L2J1dHRvbj5cblxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nc2lnbnVwJyBzdHlsZT0nZGlzcGxheTpub25lOyc+XG4gICAgICAgIDxzZWN0aW9uPlxuXG4gICAgICAgICAgPGRpdiBjbGFzcz0nbWVzc2FnZXMgbmFtZV9tZXNzYWdlJz48L2Rpdj5cbiAgICAgICAgICA8aW5wdXQgaWQ9J25ld19uYW1lJyBjbGFzcz0ndGFibGV0LW5hbWUnIHR5cGU9J3RleHQnIHBsYWNlaG9sZGVyPScje25hbWVOYW1lfSc+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdtZXNzYWdlcyBwYXNzX21lc3NhZ2UnPjwvZGl2PlxuICAgICAgICAgIDxpbnB1dCBpZD0nbmV3X3Bhc3NfMScgdHlwZT0ncGFzc3dvcmQnIHBsYWNlaG9sZGVyPScje0B0ZXh0LnBhc3N3b3JkfSc+XG5cbiAgICAgICAgICA8aW5wdXQgaWQ9J25ld19wYXNzXzInIHR5cGU9J3Bhc3N3b3JkJyBwbGFjZWhvbGRlcj0nI3tAdGV4dC5wYXNzd29yZF9jb25maXJtfSc+XG5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdzaWduX3VwJz4je0B0ZXh0LnNpZ25fdXB9PC9idXR0b24+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuICAgIFwiXG5cbiAgICBAJGVsLmh0bWwgaHRtbFxuXG4gICAgQGluaXRBdXRvY29tcGxldGUoKVxuXG4gICAgQG5hbWVNc2cgPSBAJGVsLmZpbmQoXCIubmFtZV9tZXNzYWdlXCIpXG4gICAgQHBhc3NNc2cgPSBAJGVsLmZpbmQoXCIucGFzc19tZXNzYWdlXCIpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICBhZnRlclJlbmRlcjogPT5cbiAgICBAcmVjZW50ZXIoKVxuXG4gIG9uQmVmb3JlRGVzdHJveTogPT5cbiAgICAkKFwiI2Zvb3RlclwiKS5zaG93KClcbiAgICAkKFwiYm9keVwiKS5jc3MoXCJiYWNrZ3JvdW5kXCIsIEBvbGRCYWNrZ3JvdW5kKVxuICAgICQod2luZG93KS5vZmYoJ29yaWVudGF0aW9uY2hhbmdlIHNjcm9sbCByZXNpemUnLCBAcmVjZW50ZXIpXG5cbiAga2V5SGFuZGxlcjogKGV2ZW50KSAtPlxuXG4gICAga2V5ID1cbiAgICAgIEVOVEVSICAgICA6IDEzXG4gICAgICBUQUIgICAgICAgOiA5XG4gICAgICBCQUNLU1BBQ0UgOiA4XG5cbiAgICAkKCcubWVzc2FnZXMnKS5odG1sKCcnKVxuICAgIGNoYXIgPSBldmVudC53aGljaFxuICAgIGlmIGNoYXI/XG4gICAgICBpc1NwZWNpYWwgPVxuICAgICAgICBjaGFyIGlzIGtleS5FTlRFUiAgICAgICAgICAgICAgb3JcbiAgICAgICAgZXZlbnQua2V5Q29kZSBpcyBrZXkuVEFCICAgICAgIG9yXG4gICAgICAgIGV2ZW50LmtleUNvZGUgaXMga2V5LkJBQ0tTUEFDRVxuICAgICAgIyBBbGxvdyB1cHBlciBjYXNlIGhlcmUgYnV0IG1ha2UgaXQgc28gaXQncyBub3QgbGF0ZXJcbiAgICAgIHJldHVybiBmYWxzZSBpZiBub3QgL1thLXpBLVowLTldLy50ZXN0KFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhcikpIGFuZCBub3QgaXNTcGVjaWFsXG4gICAgICByZXR1cm4gQGFjdGlvbigpIGlmIGNoYXIgaXMga2V5LkVOVEVSXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIHRydWVcblxuICBhY3Rpb246IC0+XG4gICAgQGxvZ2luKCkgIGlmIEBtb2RlIGlzIFwibG9naW5cIlxuICAgIEBzaWdudXAoKSBpZiBAbW9kZSBpcyBcInNpZ251cFwiXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgc2lnbnVwOiAtPlxuICAgIG5hbWUgID0gKCRuYW1lICA9IEAkZWwuZmluZChcIiNuZXdfbmFtZVwiKSkudmFsKCkudG9Mb3dlckNhc2UoKVxuICAgIHBhc3MxID0gKCRwYXNzMSA9IEAkZWwuZmluZChcIiNuZXdfcGFzc18xXCIpKS52YWwoKVxuICAgIHBhc3MyID0gKCRwYXNzMiA9IEAkZWwuZmluZChcIiNuZXdfcGFzc18yXCIpKS52YWwoKVxuXG4gICAgQHBhc3NFcnJvcihAdGV4dC5wYXNzX21pc21hdGNoKSBpZiBwYXNzMSBpc250IHBhc3MyXG5cbiAgICBAdXNlci5zaWdudXAgbmFtZSwgcGFzczFcblxuXG4gIGxvZ2luOiAtPlxuICAgIG5hbWUgPSAoJG5hbWUgPSBAJGVsLmZpbmQoXCIjbmFtZVwiKSkudmFsKClcbiAgICBwYXNzID0gKCRwYXNzID0gQCRlbC5maW5kKFwiI3Bhc3NcIikpLnZhbCgpXG5cbiAgICBAY2xlYXJFcnJvcnMoKVxuXG4gICAgQG5hbWVFcnJvcihAdGV4dC5lcnJvcl9uYW1lKSBpZiBuYW1lID09IFwiXCJcbiAgICBAcGFzc0Vycm9yKEB0ZXh0LmVycm9yX3Bhc3MpIGlmIHBhc3MgPT0gXCJcIlxuXG4gICAgaWYgQGVycm9ycyA9PSAwXG4gICAgICBAdXNlci5sb2dpbiBuYW1lLCBwYXNzXG5cblxuICAgIHJldHVybiBmYWxzZVxuXG4gIHBhc3NFcnJvcjogKGVycm9yKSAtPlxuICAgIEBlcnJvcnMrK1xuICAgIEBwYXNzTXNnLmh0bWwgZXJyb3JcbiAgICBAJGVsLmZpbmQoXCIjcGFzc1wiKS5mb2N1cygpXG5cbiAgbmFtZUVycm9yOiAoZXJyb3IpIC0+XG4gICAgQGVycm9ycysrXG4gICAgQG5hbWVNc2cuaHRtbCBlcnJvclxuICAgIEAkZWwuZmluZChcIiNuYW1lXCIpLmZvY3VzKClcblxuICBjbGVhckVycm9yczogLT5cbiAgICBAbmFtZU1zZy5odG1sIFwiXCJcbiAgICBAcGFzc01zZy5odG1sIFwiXCJcbiAgICBAZXJyb3JzID0gMFxuIl19

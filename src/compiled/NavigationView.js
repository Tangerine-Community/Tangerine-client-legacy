var NavigationView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

NavigationView = (function(superClass) {
  extend(NavigationView, superClass);

  function NavigationView() {
    this.handleMenu = bind(this.handleMenu, this);
    this.initialize = bind(this.initialize, this);
    this.userMenuOut = bind(this.userMenuOut, this);
    this.userMenuIn = bind(this.userMenuIn, this);
    this.calcWhoAmI = bind(this.calcWhoAmI, this);
    return NavigationView.__super__.constructor.apply(this, arguments);
  }

  NavigationView.prototype.el = '#navigation';

  NavigationView.prototype.events = Modernizr.touch ? {
    'click #logout': 'logout',
    'click #navigation-logo': 'logoClick',
    'click #username': 'gotoAccount'
  } : {
    'click #logout': 'logout',
    'click #navigation-logo': 'logoClick',
    'click #username': 'gotoAccount'
  };

  NavigationView.prototype.calcWhoAmI = function() {
    return this.whoAmI = "User";
  };

  NavigationView.prototype.refreshDropDownPosition = function() {
    var $ul, userPosistion;
    userPosistion = this.$el.find("#username-container").position();
    $ul = this.$el.find("#username-dropdown");
    return $ul.css({
      left: Math.min(userPosistion.left, $(window).width() - $ul.width())
    });
  };

  NavigationView.prototype.userMenuIn = function() {
    this.refreshDropDownPosition();
    return this.$el.find("#username-dropdown").show();
  };

  NavigationView.prototype.userMenuOut = function() {
    this.refreshDropDownPosition();
    return this.$el.find("#username-dropdown").hide();
  };

  NavigationView.prototype.gotoAccount = function() {
    if (this.user.isAdmin()) {
      return Tangerine.router.navigate("account", true);
    }
  };

  NavigationView.prototype.logoClick = function() {
    if (this.user.isAdmin()) {
      Tangerine.activity = "";
      return this.router.landing(true);
    } else {
      if (Tangerine.activity === "assessment run") {
        if (confirm(this.text.incomplete_main)) {
          return this.router.landing(true);
        }
      } else {
        return this.router.landing(true);
      }
    }
  };

  NavigationView.prototype.logout = function() {
    if (this.user.isAdmin()) {
      Tangerine.activity = "";
      return Tangerine.user.logout();
    } else {
      if (Tangerine.activity === "assessment run") {
        if (confirm(this.text.incomplete_logout)) {
          Tangerine.activity = "";
          return Tangerine.user.logout();
        }
      } else {
        if (confirm(this.text.confirm_logout)) {
          Tangerine.activity = "";
          return Tangerine.user.logout();
        }
      }
    }
  };

  NavigationView.prototype.onClose = function() {};

  NavigationView.prototype.initialize = function(options) {
    this.$el.addClass("NavigationView");
    this.i18n();
    this.render();
    this.user = options.user;
    this.router = options.router;
    this.calcWhoAmI();
    this.router.on('all', this.handleMenu);
    return this.user.on('login logout', this.handleMenu);
  };

  NavigationView.prototype.i18n = function() {
    return this.text = {
      "logout": t('NavigationView.button.logout'),
      "account_button": t('NavigationView.button.account'),
      "settings_button": t('NavigationView.button.settings'),
      "user": t('NavigationView.label.user'),
      "teacher": t('NavigationView.label.teacher'),
      "enumerator": t('NavigationView.label.enumerator'),
      "student_id": t('NavigationView.label.student_id'),
      "version": t('NavigationView.label.version'),
      "account": t('NavigationView.help.account'),
      "logo": t('NavigationView.help.logo'),
      "incomplete_logout": t("NavigationView.message.incomplete_logout"),
      "confirm_logout": t("NavigationView.message.logout_confirm"),
      "incomplete_main": t("NavigationView.message.incomplete_main_screen")
    };
  };

  NavigationView.prototype.render = function() {
    var ref;
    this.$el.html("<img id='navigation-logo' src='images/navigation-logo.png' title='" + this.text.logo + "'> <ul> <li id='student-container' class='hidden'> <label>" + this.text.student_id + "</label> <div id='student-id'></div> </li> <li id='username-container'> <label title='" + this.text.account + "'>" + this.whoAmI + "</label> <div id='username'>" + (Tangerine.user.name() || "") + "</div> <ul id='username-dropdown'> <li><a href='#account'>" + this.text.account_button + "</a></li> <li><a href='#settings'>" + this.text.settings_button + "</a></li> </ul> </li> <li id='logout'>" + this.text.logout + "</li> </ul>");
    if ((ref = this.user) != null ? typeof ref.isAdmin === "function" ? ref.isAdmin() : void 0 : void 0) {
      this.$el.find("#username-container").hover(this.userMenuIn, this.userMenuOut);
    }
    $(document).ajaxStart(function() {
      if ($("#navigation-logo").attr("src") !== "images/navigation-logo-spin.gif") {
        return $("#navigation-logo").attr("src", "images/navigation-logo-spin.gif");
      }
    });
    return $(document).ajaxStop(function() {
      if ($("#navigation-logo").attr("src") !== "images/navigation-logo.png") {
        return $("#navigation-logo").attr("src", "images/navigation-logo.png");
      }
    });
  };

  NavigationView.prototype.setStudent = function(id) {
    if (id === "") {
      this.$el.find("#student-container").addClass("hidden");
      return this.$el.find('#student-id').html("");
    } else {
      this.$el.find("#student-container").removeClass("hidden");
      return this.$el.find('#student-id').html(id);
    }
  };

  NavigationView.prototype.handleMenu = function(event) {
    this.calcWhoAmI();
    $("#username_label").html(this.whoAmI);
    $('#username').html(this.user.name());
    if (~window.location.toString().indexOf("name=")) {
      this.$el.find("#logout_link").hide();
    } else {
      this.$el.find("#logout_link").show();
    }
    return this.user.verify({
      isAuthenticated: (function(_this) {
        return function() {
          _this.render();
          return $('#navigation').fadeIn(250);
        };
      })(this),
      isUnregistered: (function(_this) {
        return function() {
          _this.render();
          return $('#navigation').fadeOut(250);
        };
      })(this)
    });
  };

  return NavigationView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvbmF2aWdhdGlvbi9OYXZpZ2F0aW9uVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxjQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OzJCQUVKLEVBQUEsR0FBSzs7MkJBRUwsTUFBQSxHQUFXLFNBQVMsQ0FBQyxLQUFiLEdBQXdCO0lBQzlCLGVBQUEsRUFBbUIsUUFEVztJQUU5Qix3QkFBQSxFQUFnQyxXQUZGO0lBRzlCLGlCQUFBLEVBQTBCLGFBSEk7R0FBeEIsR0FJRDtJQUNMLGVBQUEsRUFBb0IsUUFEZjtJQUVMLHdCQUFBLEVBQWdDLFdBRjNCO0lBR0wsaUJBQUEsRUFBMEIsYUFIckI7OzsyQkFNUCxVQUFBLEdBQVksU0FBQTtXQUVWLElBQUMsQ0FBQSxNQUFELEdBQVU7RUFGQTs7MkJBSVosdUJBQUEsR0FBeUIsU0FBQTtBQUN2QixRQUFBO0lBQUEsYUFBQSxHQUFnQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxxQkFBVixDQUFnQyxDQUFDLFFBQWpDLENBQUE7SUFDaEIsR0FBQSxHQUFNLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLG9CQUFWO1dBQ04sR0FBRyxDQUFDLEdBQUosQ0FDRTtNQUFBLElBQUEsRUFBTyxJQUFJLENBQUMsR0FBTCxDQUFTLGFBQWEsQ0FBQyxJQUF2QixFQUE2QixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsS0FBVixDQUFBLENBQUEsR0FBb0IsR0FBRyxDQUFDLEtBQUosQ0FBQSxDQUFqRCxDQUFQO0tBREY7RUFIdUI7OzJCQU16QixVQUFBLEdBQVksU0FBQTtJQUFJLElBQUMsQ0FBQSx1QkFBRCxDQUFBO1dBQTRCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLG9CQUFWLENBQStCLENBQUMsSUFBaEMsQ0FBQTtFQUFoQzs7MkJBRVosV0FBQSxHQUFhLFNBQUE7SUFBRyxJQUFDLENBQUEsdUJBQUQsQ0FBQTtXQUE0QixJQUFDLENBQUEsR0FB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QyxJQUExQixDQUFBLEVBQXJEO0tBQUEsTUFBQTtNQUE0RixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxjQUFWLENBQXlCLENBQUMsSUFBMUIsQ0FBQSxFQUE1Rjs7V0FFQSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FDRTtNQUFBLGVBQUEsRUFBaUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2YsS0FBQyxDQUFBLE1BQUQsQ0FBQTtpQkFDQSxDQUFBLENBQUcsYUFBSCxDQUFrQixDQUFDLE1BQW5CLENBQTBCLEdBQTFCO1FBRmU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO01BR0EsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDZCxLQUFDLENBQUEsTUFBRCxDQUFBO2lCQUNBLENBQUEsQ0FBRyxhQUFILENBQWtCLENBQUMsT0FBbkIsQ0FBMkIsR0FBM0I7UUFGYztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIaEI7S0FERjtFQVZVOzs7O0dBdkplLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL25hdmlnYXRpb24vTmF2aWdhdGlvblZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBOYXZpZ2F0aW9uVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBlbCA6ICcjbmF2aWdhdGlvbidcblxuICBldmVudHM6IGlmIE1vZGVybml6ci50b3VjaCB0aGVuIHtcbiAgICAnY2xpY2sgI2xvZ291dCcgIDogJ2xvZ291dCdcbiAgICAnY2xpY2sgI25hdmlnYXRpb24tbG9nbycgICAgICA6ICdsb2dvQ2xpY2snXG4gICAgJ2NsaWNrICN1c2VybmFtZScgICAgICAgOiAnZ290b0FjY291bnQnXG4gIH0gZWxzZSB7XG4gICAgJ2NsaWNrICNsb2dvdXQnICAgOiAnbG9nb3V0J1xuICAgICdjbGljayAjbmF2aWdhdGlvbi1sb2dvJyAgICAgIDogJ2xvZ29DbGljaydcbiAgICAnY2xpY2sgI3VzZXJuYW1lJyAgICAgICA6ICdnb3RvQWNjb3VudCdcbiAgfVxuXG4gIGNhbGNXaG9BbUk6ID0+XG4gICAgIyB3aG8gYW0gSVxuICAgIEB3aG9BbUkgPSBcIlVzZXJcIlxuXG4gIHJlZnJlc2hEcm9wRG93blBvc2l0aW9uOiAtPlxuICAgIHVzZXJQb3Npc3Rpb24gPSBAJGVsLmZpbmQoXCIjdXNlcm5hbWUtY29udGFpbmVyXCIpLnBvc2l0aW9uKClcbiAgICAkdWwgPSBAJGVsLmZpbmQoXCIjdXNlcm5hbWUtZHJvcGRvd25cIilcbiAgICAkdWwuY3NzXG4gICAgICBsZWZ0IDogTWF0aC5taW4odXNlclBvc2lzdGlvbi5sZWZ0LCAkKHdpbmRvdykud2lkdGgoKSAtICR1bC53aWR0aCgpKVxuXG4gIHVzZXJNZW51SW46ID0+ICBAcmVmcmVzaERyb3BEb3duUG9zaXRpb24oKTsgQCRlbC5maW5kKFwiI3VzZXJuYW1lLWRyb3Bkb3duXCIpLnNob3coKVxuXG4gIHVzZXJNZW51T3V0OiA9PiBAcmVmcmVzaERyb3BEb3duUG9zaXRpb24oKTsgQCRlbC5maW5kKFwiI3VzZXJuYW1lLWRyb3Bkb3duXCIpLmhpZGUoKVxuXG4gIGdvdG9BY2NvdW50OiAtPlxuICAgIGlmIEB1c2VyLmlzQWRtaW4oKVxuICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImFjY291bnRcIiwgdHJ1ZVxuXG4gIGxvZ29DbGljazogLT4gXG4gICAgaWYgQHVzZXIuaXNBZG1pbigpXG4gICAgICBUYW5nZXJpbmUuYWN0aXZpdHkgPSBcIlwiXG4gICAgICBAcm91dGVyLmxhbmRpbmcodHJ1ZSlcbiAgICBlbHNlXG4gICAgICBpZiBUYW5nZXJpbmUuYWN0aXZpdHkgPT0gXCJhc3Nlc3NtZW50IHJ1blwiXG4gICAgICAgIGlmIGNvbmZpcm0gQHRleHQuaW5jb21wbGV0ZV9tYWluXG4gICAgICAgICAgQHJvdXRlci5sYW5kaW5nKHRydWUpXG4gICAgICBlbHNlXG4gICAgICAgICAgQHJvdXRlci5sYW5kaW5nKHRydWUpXG5cbiAgbG9nb3V0OiAtPlxuICAgIGlmIEB1c2VyLmlzQWRtaW4oKVxuICAgICAgVGFuZ2VyaW5lLmFjdGl2aXR5ID0gXCJcIlxuICAgICAgVGFuZ2VyaW5lLnVzZXIubG9nb3V0KClcbiAgICBlbHNlXG4gICAgICBpZiBUYW5nZXJpbmUuYWN0aXZpdHkgPT0gXCJhc3Nlc3NtZW50IHJ1blwiXG4gICAgICAgIGlmIGNvbmZpcm0gQHRleHQuaW5jb21wbGV0ZV9sb2dvdXRcbiAgICAgICAgICBUYW5nZXJpbmUuYWN0aXZpdHkgPSBcIlwiXG4gICAgICAgICAgVGFuZ2VyaW5lLnVzZXIubG9nb3V0KClcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgY29uZmlybSBAdGV4dC5jb25maXJtX2xvZ291dFxuICAgICAgICAgIFRhbmdlcmluZS5hY3Rpdml0eSA9IFwiXCJcbiAgICAgICAgICBUYW5nZXJpbmUudXNlci5sb2dvdXQoKVxuXG4gIG9uQ2xvc2U6IC0+ICMgZG8gbm90aGluZ1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSA9PlxuXG4gICAgQCRlbC5hZGRDbGFzcyBcIk5hdmlnYXRpb25WaWV3XCJcblxuICAgIEBpMThuKClcbiAgICBAcmVuZGVyKClcblxuICAgIEB1c2VyICAgPSBvcHRpb25zLnVzZXJcbiAgICBAcm91dGVyID0gb3B0aW9ucy5yb3V0ZXJcblxuICAgIEBjYWxjV2hvQW1JKClcblxuICAgIEByb3V0ZXIub24gJ2FsbCcsIEBoYW5kbGVNZW51XG4gICAgQHVzZXIub24gICAnbG9naW4gbG9nb3V0JywgQGhhbmRsZU1lbnVcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cblxuICAgICAgXCJsb2dvdXRcIiAgICAgICAgICAgIDogdCgnTmF2aWdhdGlvblZpZXcuYnV0dG9uLmxvZ291dCcpXG5cbiAgICAgIFwiYWNjb3VudF9idXR0b25cIiAgICA6IHQoJ05hdmlnYXRpb25WaWV3LmJ1dHRvbi5hY2NvdW50JylcbiAgICAgIFwic2V0dGluZ3NfYnV0dG9uXCIgICA6IHQoJ05hdmlnYXRpb25WaWV3LmJ1dHRvbi5zZXR0aW5ncycpXG5cbiAgICAgIFwidXNlclwiICAgICAgICAgICAgICA6IHQoJ05hdmlnYXRpb25WaWV3LmxhYmVsLnVzZXInKVxuICAgICAgXCJ0ZWFjaGVyXCIgICAgICAgICAgIDogdCgnTmF2aWdhdGlvblZpZXcubGFiZWwudGVhY2hlcicpXG4gICAgICBcImVudW1lcmF0b3JcIiAgICAgICAgOiB0KCdOYXZpZ2F0aW9uVmlldy5sYWJlbC5lbnVtZXJhdG9yJylcbiAgICAgIFwic3R1ZGVudF9pZFwiICAgICAgICA6IHQoJ05hdmlnYXRpb25WaWV3LmxhYmVsLnN0dWRlbnRfaWQnKVxuICAgICAgXCJ2ZXJzaW9uXCIgICAgICAgICAgIDogdCgnTmF2aWdhdGlvblZpZXcubGFiZWwudmVyc2lvbicpXG5cbiAgICAgIFwiYWNjb3VudFwiICAgICAgICAgICA6IHQoJ05hdmlnYXRpb25WaWV3LmhlbHAuYWNjb3VudCcpXG4gICAgICBcImxvZ29cIiAgICAgICAgICAgICAgOiB0KCdOYXZpZ2F0aW9uVmlldy5oZWxwLmxvZ28nKVxuXG4gICAgICBcImluY29tcGxldGVfbG9nb3V0XCIgOiB0KFwiTmF2aWdhdGlvblZpZXcubWVzc2FnZS5pbmNvbXBsZXRlX2xvZ291dFwiKVxuICAgICAgXCJjb25maXJtX2xvZ291dFwiICAgIDogdChcIk5hdmlnYXRpb25WaWV3Lm1lc3NhZ2UubG9nb3V0X2NvbmZpcm1cIilcbiAgICAgIFwiaW5jb21wbGV0ZV9tYWluXCIgICA6IHQoXCJOYXZpZ2F0aW9uVmlldy5tZXNzYWdlLmluY29tcGxldGVfbWFpbl9zY3JlZW5cIilcblxuICByZW5kZXI6IC0+XG5cbiAgICBAJGVsLmh0bWwgXCJcblxuICAgICAgPGltZyBpZD0nbmF2aWdhdGlvbi1sb2dvJyBzcmM9J2ltYWdlcy9uYXZpZ2F0aW9uLWxvZ28ucG5nJyB0aXRsZT0nI3tAdGV4dC5sb2dvfSc+XG5cbiAgICAgIDx1bD5cblxuICAgICAgICA8bGkgaWQ9J3N0dWRlbnQtY29udGFpbmVyJyBjbGFzcz0naGlkZGVuJz5cblxuICAgICAgICAgIDxsYWJlbD4je0B0ZXh0LnN0dWRlbnRfaWR9PC9sYWJlbD5cbiAgICAgICAgICA8ZGl2IGlkPSdzdHVkZW50LWlkJz48L2Rpdj5cblxuICAgICAgICA8L2xpPlxuXG4gICAgICAgIDxsaSBpZD0ndXNlcm5hbWUtY29udGFpbmVyJz5cblxuICAgICAgICAgIDxsYWJlbCB0aXRsZT0nI3tAdGV4dC5hY2NvdW50fSc+I3tAd2hvQW1JfTwvbGFiZWw+XG4gICAgICAgICAgPGRpdiBpZD0ndXNlcm5hbWUnPiN7VGFuZ2VyaW5lLnVzZXIubmFtZSgpIHx8IFwiXCJ9PC9kaXY+XG4gICAgICBcbiAgICAgICAgICA8dWwgaWQ9J3VzZXJuYW1lLWRyb3Bkb3duJz5cbiAgICAgICAgICAgIDxsaT48YSBocmVmPScjYWNjb3VudCc+I3tAdGV4dC5hY2NvdW50X2J1dHRvbn08L2E+PC9saT5cbiAgICAgICAgICAgIDxsaT48YSBocmVmPScjc2V0dGluZ3MnPiN7QHRleHQuc2V0dGluZ3NfYnV0dG9ufTwvYT48L2xpPlxuICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgPC9saT5cblxuICAgICAgICA8bGkgaWQ9J2xvZ291dCc+I3tAdGV4dC5sb2dvdXR9PC9saT5cblxuICAgICAgPC91bD5cbiAgICAgIFxuICAgIFwiXG5cbiAgICAjIHNldCB1cCB1c2VyIG1lbnVcbiAgICBpZiBAdXNlcj8uaXNBZG1pbj8oKVxuICAgICAgQCRlbC5maW5kKFwiI3VzZXJuYW1lLWNvbnRhaW5lclwiKS5ob3ZlciBAdXNlck1lbnVJbiwgQHVzZXJNZW51T3V0XG5cbiAgICAjIFNwaW4gdGhlIGxvZ28gb24gYWpheCBjYWxsc1xuICAgICQoZG9jdW1lbnQpLmFqYXhTdGFydCAtPiBcbiAgICAgIGlmICQoXCIjbmF2aWdhdGlvbi1sb2dvXCIpLmF0dHIoXCJzcmNcIikgaXNudCBcImltYWdlcy9uYXZpZ2F0aW9uLWxvZ28tc3Bpbi5naWZcIlxuICAgICAgICAkKFwiI25hdmlnYXRpb24tbG9nb1wiKS5hdHRyIFwic3JjXCIsIFwiaW1hZ2VzL25hdmlnYXRpb24tbG9nby1zcGluLmdpZlwiXG4gICAgJChkb2N1bWVudCkuYWpheFN0b3AgLT5cbiAgICAgIGlmICQoXCIjbmF2aWdhdGlvbi1sb2dvXCIpLmF0dHIoXCJzcmNcIikgaXNudCBcImltYWdlcy9uYXZpZ2F0aW9uLWxvZ28ucG5nXCJcbiAgICAgICAgJChcIiNuYXZpZ2F0aW9uLWxvZ29cIikuYXR0ciBcInNyY1wiLCBcImltYWdlcy9uYXZpZ2F0aW9uLWxvZ28ucG5nXCJcblxuICBzZXRTdHVkZW50OiAoIGlkICkgLT5cbiAgICBpZiBpZCA9PSBcIlwiXG4gICAgICBAJGVsLmZpbmQoXCIjc3R1ZGVudC1jb250YWluZXJcIikuYWRkQ2xhc3MoXCJoaWRkZW5cIilcbiAgICAgIEAkZWwuZmluZCgnI3N0dWRlbnQtaWQnKS5odG1sKFwiXCIpXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI3N0dWRlbnQtY29udGFpbmVyXCIpLnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpXG4gICAgICBAJGVsLmZpbmQoJyNzdHVkZW50LWlkJykuaHRtbChpZClcblxuXG4gICMgQWRtaW5zIGdldCBhIG1hbmFnZSBidXR0b24gXG4gICMgdHJpZ2dlcmVkIG9uIHVzZXIgY2hhbmdlc1xuICBoYW5kbGVNZW51OiAoZXZlbnQpID0+XG4gICAgQGNhbGNXaG9BbUkoKVxuXG4gICAgJChcIiN1c2VybmFtZV9sYWJlbFwiKS5odG1sIEB3aG9BbUlcblxuICAgICQoJyN1c2VybmFtZScpLmh0bWwgQHVzZXIubmFtZSgpXG5cbiAgICAjIEBUT0RPIFRoaXMgbmVlZHMgZml4aW5nXG4gICAgaWYgfndpbmRvdy5sb2NhdGlvbi50b1N0cmluZygpLmluZGV4T2YoXCJuYW1lPVwiKSB0aGVuIEAkZWwuZmluZChcIiNsb2dvdXRfbGlua1wiKS5oaWRlKCkgZWxzZSAgQCRlbC5maW5kKFwiI2xvZ291dF9saW5rXCIpLnNob3coKVxuXG4gICAgQHVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6ID0+XG4gICAgICAgIEByZW5kZXIoKVxuICAgICAgICAkKCAnI25hdmlnYXRpb24nICkuZmFkZUluKDI1MClcbiAgICAgIGlzVW5yZWdpc3RlcmVkOiA9PlxuICAgICAgICBAcmVuZGVyKClcbiAgICAgICAgJCggJyNuYXZpZ2F0aW9uJyApLmZhZGVPdXQoMjUwKVxuXG5cbiJdfQ==

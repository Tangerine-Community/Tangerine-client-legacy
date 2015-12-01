var ConsentRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ConsentRunView = (function(superClass) {
  extend(ConsentRunView, superClass);

  function ConsentRunView() {
    this.onConsentChange = bind(this.onConsentChange, this);
    return ConsentRunView.__super__.constructor.apply(this, arguments);
  }

  ConsentRunView.prototype.className = "ConsentRunView";

  ConsentRunView.prototype.events = {
    'click #non_consent_confirm': 'noConsent'
  };

  ConsentRunView.prototype.onConsentChange = function() {
    if (this.consentButton.answer === "yes") {
      return this.clearMessages();
    } else {
      return this.showNonConsent();
    }
  };

  ConsentRunView.prototype.i18n = function() {
    return this.text = {
      defaultConsent: t("ConsentRunView.label.default_consent_prompt"),
      confirmNonconsent: t("ConsentRunView.label.confirm_nonconsent"),
      confirm: t("ConsentRunView.button.confirm"),
      yes: t("ConsentRunView.button.yes_continue"),
      no: t("ConsentRunView.button.no_stop"),
      select: t("ConsentRunView.message.select")
    };
  };

  ConsentRunView.prototype.initialize = function(options) {
    this.i18n();
    this.confirmedNonConsent = false;
    this.model = options.model;
    this.parent = options.parent;
    return this.dataEntry = options.dataEntry;
  };

  ConsentRunView.prototype.render = function() {
    var answer, previous;
    this.$el.html("<div class='question'> <label>" + (this.model.get('prompt') || this.text.defaultConsent) + "</label> <div class='messages'></div> <div class='non_consent_form confirmation'> <div>" + this.text.confirmNonconsent + "</div> <button id='non_consent_confirm' class='command'>" + this.text.confirm + "</button> </div> <div class='consent-button'></div> </div>");
    if (!this.dataEntry) {
      previous = this.parent.parent.result.getByHash(this.model.get('hash'));
      if (previous) {
        answer = previous.consent;
      }
    }
    this.consentButton = new ButtonView({
      options: [
        {
          label: this.text.yes,
          value: "yes"
        }, {
          label: this.text.no,
          value: "no"
        }
      ],
      mode: "single",
      dataEntry: false,
      answer: answer || ""
    });
    this.consentButton.setElement(this.$el.find(".consent-button"));
    this.consentButton.on("change", this.onConsentChange);
    this.consentButton.render();
    this.trigger("rendered");
    return this.trigger("ready");
  };

  ConsentRunView.prototype.isValid = function() {
    if (this.confirmedNonConsent === false) {
      if (this.consentButton.answer === "yes") {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  ConsentRunView.prototype.showNonConsent = function() {
    return this.$el.find(".non_consent_form").show(250);
  };

  ConsentRunView.prototype.clearMessages = function() {
    this.$el.find(".non_consent_form").hide(250);
    return this.$el.find(".messages").html("");
  };

  ConsentRunView.prototype.noConsent = function() {
    this.confirmedNonConsent = true;
    this.parent.abort();
    return false;
  };

  ConsentRunView.prototype.getSkipped = function() {
    return {
      "consent": "skipped"
    };
  };

  ConsentRunView.prototype.showErrors = function() {
    var answer;
    answer = this.consentButton.answer;
    if (answer === "no") {
      Utils.midAlert(this.text.confirm);
      return this.showNonConsent();
    } else if (answer === void 0) {
      return $(".messages").html(this.text.select);
    }
  };

  ConsentRunView.prototype.getResult = function() {
    return {
      "consent": this.consentButton.answer
    };
  };

  ConsentRunView.prototype.onClose = function() {
    var ref;
    return (ref = this.consentButton) != null ? typeof ref.close === "function" ? ref.close() : void 0 : void 0;
  };

  return ConsentRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0NvbnNlbnRSdW5WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGNBQUE7RUFBQTs7OztBQUFNOzs7Ozs7OzsyQkFFSixTQUFBLEdBQVk7OzJCQUVaLE1BQUEsR0FDRTtJQUFBLDRCQUFBLEVBQStCLFdBQS9COzs7MkJBRUYsZUFBQSxHQUFpQixTQUFBO0lBQ2YsSUFBRyxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsS0FBeUIsS0FBNUI7YUFDRSxJQUFDLENBQUEsYUFBRCxDQUFBLEVBREY7S0FBQSxNQUFBO2FBR0UsSUFBQyxDQUFBLGNBQUQsQ0FBQSxFQUhGOztFQURlOzsyQkFNakIsSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsSUFBRCxHQUNFO01BQUEsY0FBQSxFQUFvQixDQUFBLENBQUUsNkNBQUYsQ0FBcEI7TUFDQSxpQkFBQSxFQUFvQixDQUFBLENBQUUseUNBQUYsQ0FEcEI7TUFFQSxPQUFBLEVBQW9CLENBQUEsQ0FBRSwrQkFBRixDQUZwQjtNQUdBLEdBQUEsRUFBb0IsQ0FBQSxDQUFFLG9DQUFGLENBSHBCO01BSUEsRUFBQSxFQUFvQixDQUFBLENBQUUsK0JBQUYsQ0FKcEI7TUFLQSxNQUFBLEVBQW9CLENBQUEsQ0FBRSwrQkFBRixDQUxwQjs7RUFGRTs7MkJBU04sVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUVWLElBQUMsQ0FBQSxJQUFELENBQUE7SUFFQSxJQUFDLENBQUEsbUJBQUQsR0FBdUI7SUFDdkIsSUFBQyxDQUFBLEtBQUQsR0FBVSxPQUFPLENBQUM7SUFDbEIsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFPLENBQUM7V0FDbEIsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUM7RUFQWDs7MkJBVVosTUFBQSxHQUFRLFNBQUE7QUFFTixRQUFBO0lBQUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsZ0NBQUEsR0FFRSxDQUFDLElBQUMs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O01BQUEsU0FBQSxFQUFZLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBM0I7O0VBREU7OzJCQUdYLE9BQUEsR0FBUyxTQUFBO0FBQ1AsUUFBQTtxRkFBYyxDQUFFO0VBRFQ7Ozs7R0F0R2tCLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9Db25zZW50UnVuVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIENvbnNlbnRSdW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiQ29uc2VudFJ1blZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgI25vbl9jb25zZW50X2NvbmZpcm0nIDogJ25vQ29uc2VudCdcblxuICBvbkNvbnNlbnRDaGFuZ2U6ID0+XG4gICAgaWYgQGNvbnNlbnRCdXR0b24uYW5zd2VyIGlzIFwieWVzXCJcbiAgICAgIEBjbGVhck1lc3NhZ2VzKClcbiAgICBlbHNlXG4gICAgICBAc2hvd05vbkNvbnNlbnQoKVxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgZGVmYXVsdENvbnNlbnQgICAgOiB0KFwiQ29uc2VudFJ1blZpZXcubGFiZWwuZGVmYXVsdF9jb25zZW50X3Byb21wdFwiKVxuICAgICAgY29uZmlybU5vbmNvbnNlbnQgOiB0KFwiQ29uc2VudFJ1blZpZXcubGFiZWwuY29uZmlybV9ub25jb25zZW50XCIpXG4gICAgICBjb25maXJtICAgICAgICAgICA6IHQoXCJDb25zZW50UnVuVmlldy5idXR0b24uY29uZmlybVwiKVxuICAgICAgeWVzICAgICAgICAgICAgICAgOiB0KFwiQ29uc2VudFJ1blZpZXcuYnV0dG9uLnllc19jb250aW51ZVwiKVxuICAgICAgbm8gICAgICAgICAgICAgICAgOiB0KFwiQ29uc2VudFJ1blZpZXcuYnV0dG9uLm5vX3N0b3BcIilcbiAgICAgIHNlbGVjdCAgICAgICAgICAgIDogdChcIkNvbnNlbnRSdW5WaWV3Lm1lc3NhZ2Uuc2VsZWN0XCIpXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAaTE4bigpXG5cbiAgICBAY29uZmlybWVkTm9uQ29uc2VudCA9IGZhbHNlXG4gICAgQG1vZGVsICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ID0gb3B0aW9ucy5wYXJlbnRcbiAgICBAZGF0YUVudHJ5ID0gb3B0aW9ucy5kYXRhRW50cnlcblxuICBcbiAgcmVuZGVyOiAtPlxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8ZGl2IGNsYXNzPSdxdWVzdGlvbic+XG4gICAgICAgIDxsYWJlbD4je0Btb2RlbC5nZXQoJ3Byb21wdCcpIHx8IEB0ZXh0LmRlZmF1bHRDb25zZW50fTwvbGFiZWw+XG4gICAgICAgIDxkaXYgY2xhc3M9J21lc3NhZ2VzJz48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbm9uX2NvbnNlbnRfZm9ybSBjb25maXJtYXRpb24nPlxuICAgICAgICAgIDxkaXY+I3tAdGV4dC5jb25maXJtTm9uY29uc2VudH08L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uIGlkPSdub25fY29uc2VudF9jb25maXJtJyBjbGFzcz0nY29tbWFuZCc+I3tAdGV4dC5jb25maXJtfTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nY29uc2VudC1idXR0b24nPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgXCJcblxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG5cbiAgICAgIHByZXZpb3VzID0gQHBhcmVudC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG4gICAgICBhbnN3ZXIgPSBwcmV2aW91cy5jb25zZW50IGlmIHByZXZpb3VzXG5cbiAgICBAY29uc2VudEJ1dHRvbiA9IG5ldyBCdXR0b25WaWV3XG4gICAgICBvcHRpb25zIDogW1xuICAgICAgICB7IGxhYmVsIDogQHRleHQueWVzLCB2YWx1ZSA6IFwieWVzXCIgfVxuICAgICAgICB7IGxhYmVsIDogQHRleHQubm8sICB2YWx1ZSA6IFwibm9cIiB9XG4gICAgICBdXG4gICAgICBtb2RlICAgICAgOiBcInNpbmdsZVwiXG4gICAgICBkYXRhRW50cnkgOiBmYWxzZVxuICAgICAgYW5zd2VyICAgIDogYW5zd2VyIG9yIFwiXCJcbiAgICBcbiAgICBAY29uc2VudEJ1dHRvbi5zZXRFbGVtZW50IEAkZWwuZmluZChcIi5jb25zZW50LWJ1dHRvblwiKVxuICAgIEBjb25zZW50QnV0dG9uLm9uIFwiY2hhbmdlXCIsIEBvbkNvbnNlbnRDaGFuZ2VcbiAgICBAY29uc2VudEJ1dHRvbi5yZW5kZXIoKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4gIFxuICBpc1ZhbGlkOiAtPlxuICAgIGlmIEBjb25maXJtZWROb25Db25zZW50IGlzIGZhbHNlXG4gICAgICBpZiBAY29uc2VudEJ1dHRvbi5hbnN3ZXIgaXMgXCJ5ZXNcIlxuICAgICAgICB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIGZhbHNlXG4gICAgZWxzZVxuICAgICAgdHJ1ZVxuXG4gIHNob3dOb25Db25zZW50OiAtPlxuICAgIEAkZWwuZmluZChcIi5ub25fY29uc2VudF9mb3JtXCIpLnNob3coMjUwKVxuXG4gIGNsZWFyTWVzc2FnZXM6IC0+XG4gICAgQCRlbC5maW5kKFwiLm5vbl9jb25zZW50X2Zvcm1cIikuaGlkZSgyNTApXG4gICAgQCRlbC5maW5kKFwiLm1lc3NhZ2VzXCIpLmh0bWwgXCJcIlxuXG4gIG5vQ29uc2VudDogLT5cbiAgICBAY29uZmlybWVkTm9uQ29uc2VudCA9IHRydWVcbiAgICBAcGFyZW50LmFib3J0KClcbiAgICByZXR1cm4gZmFsc2VcbiAgXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgcmV0dXJuIFwiY29uc2VudFwiIDogXCJza2lwcGVkXCJcbiAgXG4gIHNob3dFcnJvcnM6IC0+XG4gICAgYW5zd2VyID0gQGNvbnNlbnRCdXR0b24uYW5zd2VyIFxuICAgIGlmIGFuc3dlciA9PSBcIm5vXCJcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IEB0ZXh0LmNvbmZpcm1cbiAgICAgIEBzaG93Tm9uQ29uc2VudCgpXG4gICAgZWxzZSBpZiBhbnN3ZXIgPT0gdW5kZWZpbmVkXG4gICAgICAkKFwiLm1lc3NhZ2VzXCIpLmh0bWwgQHRleHQuc2VsZWN0XG5cbiAgZ2V0UmVzdWx0OiAtPlxuICAgIHJldHVybiBcImNvbnNlbnRcIiA6IEBjb25zZW50QnV0dG9uLmFuc3dlclxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQGNvbnNlbnRCdXR0b24/LmNsb3NlPygpXG4iXX0=

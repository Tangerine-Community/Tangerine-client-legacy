var PrototypeConsentView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

PrototypeConsentView = (function(_super) {

  __extends(PrototypeConsentView, _super);

  function PrototypeConsentView() {
    PrototypeConsentView.__super__.constructor.apply(this, arguments);
  }

  PrototypeConsentView.prototype.events = {
    'click #non_consent_confirm': 'noConsent',
    'click #consent_yes': 'clearMessages',
    'click #consent_no': 'showNonConsent'
  };

  PrototypeConsentView.prototype.initialize = function(options) {
    this.confirmedNonConsent = false;
    this.model = this.options.model;
    return this.parent = this.options.parent;
  };

  PrototypeConsentView.prototype.render = function() {
    this.$el.html("    <form>      <div class='question'>        <p>Does the child consent?</p>        <div class='messages'></div>        <div class='non_consent_form confirmation'>          <div>Click to confirm the child does not consent</div>          <button id='non_consent_confirm'>Confirm</button>        </div>        <div id='consent_options'>          <label for='consent_yes'>Yes, continue</label>          <input id='consent_yes' type='radio' name='child_consents' value='yes'>          <label for='consent_no'>No, stop</label>          <input id='consent_no' type='radio' name='child_consents' value='no'>        </div>      </div>    </form>    ");
    this.$el.find('#consent_options').buttonset();
    return this.trigger("rendered");
  };

  PrototypeConsentView.prototype.isValid = function() {
    if (this.confirmedNonConsent === false) {
      if (this.$el.find("input[name=child_consents]:checked").val() === "yes") {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  PrototypeConsentView.prototype.showNonConsent = function() {
    return this.$el.find(".non_consent_form").show(250);
  };

  PrototypeConsentView.prototype.clearMessages = function() {
    this.$el.find(".non_consent_form").hide(250);
    return this.$el.find(".messages").html("");
  };

  PrototypeConsentView.prototype.noConsent = function() {
    this.confirmedNonConsent = true;
    this.parent.abort();
    return false;
  };

  PrototypeConsentView.prototype.showErrors = function() {
    var answer;
    answer = this.$el.find("input[name=child_consents]:checked").val();
    if (answer === "no") {
      Utils.midAlert("Please confirm that<br>the child does not consent");
      return this.showNonConsent;
    } else if (answer === void 0) {
      return $(".messages").html("Please select one");
    }
  };

  return PrototypeConsentView;

})(Backbone.View);

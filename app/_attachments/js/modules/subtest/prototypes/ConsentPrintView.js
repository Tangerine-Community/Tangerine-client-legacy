var ConsentPrintView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ConsentPrintView = (function(_super) {

  __extends(ConsentPrintView, _super);

  function ConsentPrintView() {
    ConsentPrintView.__super__.constructor.apply(this, arguments);
  }

  ConsentPrintView.prototype.initialize = function(options) {
    this.confirmedNonConsent = false;
    this.model = this.options.model;
    return this.parent = this.options.parent;
  };

  ConsentPrintView.prototype.render = function() {
    this.$el.html("    <form>      <div class='question'>        <label>" + (this.model.get('prompt') || 'Does the child consent?') + "</label>        <div class='messages'></div>        <div class='non_consent_form confirmation'>          <div>Click to confirm consent not obtained.</div>          <button id='non_consent_confirm'>Confirm</button>        </div>        <div id='consent_options' class='buttonset'>          <label for='consent_yes'>Yes, continue</label>          <input id='consent_yes' type='radio' name='participant_consents' value='yes'>          <label for='consent_no'>No, stop</label>          <input id='consent_no' type='radio' name='participant_consents' value='no'>        </div>      </div>    </form>    ");
    return this.trigger("rendered");
  };

  return ConsentPrintView;

})(Backbone.View);

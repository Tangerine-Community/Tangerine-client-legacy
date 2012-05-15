var AccountView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AccountView = (function(_super) {

  __extends(AccountView, _super);

  function AccountView() {
    AccountView.__super__.constructor.apply(this, arguments);
  }

  AccountView.prototype.initialize = function(options) {
    return this.model = options.model;
  };

  AccountView.prototype.render = function() {
    this.$el.html("      <h2>Account</h2>      <div class='label_value'>        <label>Name</label>        <p>" + this.model.name + "</p>      </div>      <div class='label_value'>        <label>Roles</label>        <p>" + (this.model.roles.join(", ")) + "</p>      </div>      <div class='label_value'>        <label>Group</label>        <p>" + (this.model.groups.join(", ")) + "</p>      </div>      <button class='command confirmation'>Report a bug</button>      <div class='confirmation' id='bug'>        <label for='where'>What broke?        <input id='where' placeholder='where'>        <label for='where'>What happened?        <input id='where' placeholder='what'>        <label for='where'>What should have happened?        <input id='should' placeholder='should'>        <button>Send</button>      </div>      ");
    return this.trigger("rendered");
  };

  return AccountView;

})(Backbone.View);

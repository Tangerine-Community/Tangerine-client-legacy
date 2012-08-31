var RegisterTeacherView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

RegisterTeacherView = (function(_super) {

  __extends(RegisterTeacherView, _super);

  function RegisterTeacherView() {
    RegisterTeacherView.__super__.constructor.apply(this, arguments);
  }

  RegisterTeacherView.prototype.events = {
    'click .register': 'register'
  };

  RegisterTeacherView.prototype.initialize = function(options) {
    return this.model = options.model;
  };

  RegisterTeacherView.prototype.register = function() {
    this.model.set({
      name: this.$el.find("#name").val(),
      school: this.$el.find("#school").val(),
      village: this.$el.find("#village").val(),
      district: this.$el.find("#district").val(),
      region: this.$el.find("#region").val()
    });
    return this.model.save();
  };

  RegisterTeacherView.prototype.render = function() {
    this.$el.html("    <h1>Register</h1>    <div class='label_value'>      <label for='role'>Role</label>      <input id='role'>    </div>    <div class='label_value'>      <label for='name'>Name</label>      <input id='name'>    </div>    <div class='label_value'>      <label for='school'>School</label>      <input id='school'>    </div>    <div class='label_value'>      <label for='school'>Village</label>      <input id='school'>    </div>    <div class='label_value'>      <label for='district'>District</label>      <input id='district'>    </div>    <div class='label_value'>      <label for='region'>Region</label>      <input id='region'>    </div>    <button class='register'>Register</button>    ");
    return this.trigger("rendered");
  };

  return RegisterTeacherView;

})(Backbone.View);

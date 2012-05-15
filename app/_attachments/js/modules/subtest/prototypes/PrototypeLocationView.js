var PrototypeLocationView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

PrototypeLocationView = (function(_super) {

  __extends(PrototypeLocationView, _super);

  function PrototypeLocationView() {
    PrototypeLocationView.__super__.constructor.apply(this, arguments);
  }

  PrototypeLocationView.prototype.initialize = function(options) {
    this.model = this.options.model;
    return this.parent = this.options.parent;
  };

  PrototypeLocationView.prototype.render = function() {
    var districtText, nameText, provinceText, schoolIdText;
    provinceText = this.model.get("provinceText");
    districtText = this.model.get("districtText");
    nameText = this.model.get("nameText");
    schoolIdText = this.model.get("schoolIdText");
    this.$el.html("    <form>      <div class='label_value'>        <label for='province'>" + provinceText + "</label>        <input id='province' name='province' value=''>      </div>      <div class='label_value'>        <label for='district'>" + districtText + "</label>        <input id='district' name='district' value=''>      </div>      <div class='label_value'>        <label for='name'>" + nameText + "</label>        <input id='name' name='name' value=''>      </div>      <div class='label_value'>        <label for='school_id'>" + schoolIdText + "</label>        <input id='school_id' name='school_id' value=''>      </div>    <form>    ");
    return this.trigger("rendered");
  };

  PrototypeLocationView.prototype.isValid = function() {
    var input, _i, _len, _ref;
    this.$el.find(".message").remove();
    _ref = this.$el.find("input");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      input = _ref[_i];
      if ($(input).val() === "") return false;
    }
    return true;
  };

  PrototypeLocationView.prototype.showErrors = function() {
    var input, _i, _len, _ref, _results;
    _ref = this.$el.find("input");
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      input = _ref[_i];
      if ($(input).val() === "") {
        _results.push($(input).after(" <span class='message'>" + ($('label[for=' + $(input).attr('id') + ']').text()) + " cannot be empty</span>"));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  PrototypeLocationView.prototype.getSum = function() {
    var $input, counts, input, _i, _len, _ref;
    counts = {
      correct: 0,
      incorrect: 0,
      missing: 0,
      total: 0
    };
    _ref = this.$el.find("input");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      input = _ref[_i];
      $input = $(input);
      if (($input.val() || "") !== "") counts['correct'] += 1;
      if (false) counts['incorrect'] += 0;
      if (($input.val() || "") === "") counts['missing'] += 1;
      if (true) counts['total'] += 1;
    }
    return {
      correct: counts['correct'],
      incorrect: counts['incorrect'],
      missing: counts['missing'],
      total: counts['total']
    };
  };

  return PrototypeLocationView;

})(Backbone.View);

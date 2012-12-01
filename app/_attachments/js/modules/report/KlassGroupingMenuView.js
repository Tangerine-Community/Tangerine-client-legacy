var PartByStudentMenuView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

PartByStudentMenuView = (function(_super) {

  __extends(PartByStudentMenuView, _super);

  function PartByStudentMenuView() {
    PartByStudentMenuView.__super__.constructor.apply(this, arguments);
  }

  PartByStudentMenuView.prototype.events = {
    'change .part_selector': 'gotoPartByStudentReport'
  };

  PartByStudentMenuView.prototype.gotoPartByStudentReport = function(event) {
    return Tangerine.router.navigate("report/partByStudent/" + this.$el.find(event.target).find(":selected").attr("data-subtestId"), true);
  };

  PartByStudentMenuView.prototype.initialize = function(options) {
    var allSubtests, milisecondsPerPart,
      _this = this;
    this.parent = options.parent;
    this.klass = this.parent.options.klass;
    this.curricula = this.parent.options.curricula;
    milisecondsPerPart = 604800000;
    this.currentPart = Math.round(((new Date()).getTime() - this.klass.get("startDate")) / milisecondsPerPart);
    allSubtests = new Subtests;
    return allSubtests.fetch({
      success: function(collection) {
        var subtest, subtests, _i, _len;
        subtests = collection.where({
          curriculaId: _this.curricula.id
        });
        _this.parts = [];
        for (_i = 0, _len = subtests.length; _i < _len; _i++) {
          subtest = subtests[_i];
          _this.parts[subtest.get('part')] = subtest.id;
        }
        _this.ready = true;
        return _this.render();
      }
    });
  };

  PartByStudentMenuView.prototype.render = function() {
    var flagForCurrent, html, part, subtestId, _len, _ref;
    if (this.ready) {
      html = "        <select class='part_selector'>          <option disabled='disabled' selected='selected'>Select an assessment</option>          ";
      _ref = this.parts;
      for (part = 0, _len = _ref.length; part < _len; part++) {
        subtestId = _ref[part];
        if (subtestId != null) {
          flagForCurrent = this.currentPart === part ? "**" : '';
          html += "<option data-subtestId='" + subtestId + "'>" + part + flagForCurrent + "</option>";
        }
      }
      html += "</select>";
      return this.$el.html(html);
    } else {
      return this.$el.html("<img src='images/loading.gif' class='loading'>");
    }
  };

  return PartByStudentMenuView;

})(Backbone.View);

var LocationEditView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

LocationEditView = (function(_super) {

  __extends(LocationEditView, _super);

  function LocationEditView() {
    LocationEditView.__super__.constructor.apply(this, arguments);
  }

  LocationEditView.prototype.initialize = function(options) {
    return this.model = options.model;
  };

  LocationEditView.prototype.save = function() {
    return this.model.set({
      "provinceText": this.$el.find("#subtest_province_text").val(),
      "districtText": this.$el.find("#subtest_district_text").val(),
      "nameText": this.$el.find("#subtest_name_text").val(),
      "schoolIdText": this.$el.find("#subtest_school_id_text").val()
    });
  };

  LocationEditView.prototype.render = function() {
    var districtText, nameText, provinceText, schoolIdText;
    provinceText = this.model.get("provinceText") || "";
    districtText = this.model.get("districtText") || "";
    nameText = this.model.get("nameText") || "";
    schoolIdText = this.model.get("schoolIdText") || "";
    return this.$el.html("      <div class='label_value'>        <label for='subtest_province_text'>&quot;Province&quot; label</label>        <input id='subtest_province_text' value='" + provinceText + "'>      </div>      <div class='label_value'>        <label for='subtest_district_text'>&quot;District&quot; label</label>        <input id='subtest_district_text' value='" + districtText + "'>      </div>      <div class='label_value'>        <label for='subtest_name_text'>&quot;School Name&quot; label</label>        <input id='subtest_name_text' value='" + nameText + "'>      </div>      <div class='label_value'>        <label for='subtest_school_id_text'>&quot;School ID&quot; label</label>        <input id='subtest_school_id_text' value='" + schoolIdText + "'>      </div>    ");
  };

  return LocationEditView;

})(Backbone.View);

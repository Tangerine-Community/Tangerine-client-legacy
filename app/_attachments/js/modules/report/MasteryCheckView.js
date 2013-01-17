var MasteryCheckView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

MasteryCheckView = (function(_super) {

  __extends(MasteryCheckView, _super);

  function MasteryCheckView() {
    MasteryCheckView.__super__.constructor.apply(this, arguments);
  }

  MasteryCheckView.prototype.className = "MasteryCheckView";

  MasteryCheckView.prototype.events = {
    "click .back": "goBack"
  };

  MasteryCheckView.prototype.goBack = function() {
    return history.back();
  };

  MasteryCheckView.prototype.initialize = function(options) {
    this.subtests = options.subtests;
    this.results = options.results;
    this.student = options.student;
    this.klass = options.klass;
    this.resultsByPart = this.results.indexBy("part");
    return this.lastPart = Math.max.apply(this, this.results.pluck("part"));
  };

  MasteryCheckView.prototype.render = function() {
    var html, part, result, subtestName, _i, _len, _ref, _ref2;
    html = "      <h1>Mastery check report</h1>      <h2>Student " + (this.student.get("name")) + "</h2>      <table>    ";
    for (part = 1, _ref = this.lastPart; 1 <= _ref ? part <= _ref : part >= _ref; 1 <= _ref ? part++ : part--) {
      if (this.resultsByPart[part] === void 0) continue;
      html += "        <tr><th>Assessment " + part + "</th></tr>        <tr>";
      _ref2 = this.resultsByPart[part];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        result = _ref2[_i];
        subtestName = this.subtests.get(result.get('subtestId')).get('name');
        html += "          <td>            " + (result.get("itemType").titleize()) + " correct<br>            " + subtestName + "          </td>          <td>" + (result.get("correct")) + "/" + (result.get("total")) + "</td>";
      }
    }
    html += "    </table>    <button class='navigation back'>" + (t('back')) + "</button>    ";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return MasteryCheckView;

})(Backbone.View);

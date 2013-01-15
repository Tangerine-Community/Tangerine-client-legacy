var KlassSubtestResultView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassSubtestResultView = (function(_super) {

  __extends(KlassSubtestResultView, _super);

  function KlassSubtestResultView() {
    KlassSubtestResultView.__super__.constructor.apply(this, arguments);
  }

  KlassSubtestResultView.prototype.className = "KlassSubtestResultView";

  KlassSubtestResultView.prototype.events = {
    "click .run": "gotoRun",
    "click .back": "back",
    "click .show_itemized": "showItemized"
  };

  KlassSubtestResultView.prototype.initialize = function(options) {
    this.result = options.result;
    return this.previous = options.previous;
  };

  KlassSubtestResultView.prototype.showItemized = function() {
    return this.$el.find(".itemized").fadeToggle();
  };

  KlassSubtestResultView.prototype.gotoRun = function() {
    return Tangerine.router.navigate("class/run/" + this.options.student.id + "/" + this.options.subtest.id, true);
  };

  KlassSubtestResultView.prototype.back = function() {
    return Tangerine.router.navigate("class/" + (this.options.student.get("klassId")) + "/" + (this.options.subtest.get("part")), true);
  };

  KlassSubtestResultView.prototype.render = function() {
    var correctItems, datum, i, percentageCorrect, resultHTML, subtestItems, taken, timestamp, totalItems, _len, _ref;
    subtestItems = this.options.subtest.get("items");
    resultHTML = "<br>";
    taken = "";
    if (this.result.length !== 0) {
      this.result = this.result[0];
      correctItems = this.result.get("correct");
      totalItems = this.result.get("total");
      percentageCorrect = (correctItems / totalItems) * 100;
      /*
            if percentageCorrect < (parseFloat(Tangerine.settings.generalThreshold)*100)
              resultHTML += "<div class='info_box'><b>Warning</b><br>Student's #{Math.decimals(percentageCorrect,2)}% score is less than threshold of #{Math.decimals(Tangerine.settings.generalThreshold*100, 2)}%</div><br>"
      */
      resultHTML += "<button class='command show_itemized'>" + (t('itemized results')) + "</button><table class='itemized confirmation'><tbody><tr><th>Item</th><th>Result</th></tr>";
      _ref = this.result.get("subtestData").items;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        datum = _ref[i];
        resultHTML += "<tr><td>" + datum.itemLabel + "</td><td>" + (t(datum.itemResult)) + "</td></tr>";
      }
      resultHTML += "</tbody></table><br>";
      timestamp = new Date(this.result.get("startTime"));
      taken += "        <tr>          <td><label>Taken last</label></td><td>" + (timestamp.getFullYear()) + "/" + (timestamp.getMonth() + 1) + "/" + (timestamp.getDate()) + "</td>        </tr>      ";
      if (this.previous > 0) {
        taken += "        <tr>          <td><label>Previous attempts</label></td><td>" + this.previous + "</td>        </tr>      ";
      }
    }
    this.$el.html("      <h1>Result</h1>      <table><tbody>        <tr>          <td><label>Assessment</label></td>          <td>" + (this.options.subtest.get("part")) + "</td>        </tr>        <tr>          <td><label>Student</label></td>          <td>" + (this.options.student.escape("name")) + "</td>        </tr>        <tr>          <td><label>Subtest</label></td>          <td>" + (this.options.subtest.escape("name")) + "</td>        </tr>        " + taken + "      </tbody></table>      " + resultHTML + "      <div class='menu_box'>        <img src='images/icon_run.png' class='run'>      </div><br>      <button class='navigation back'>Back</button>    ");
    return this.trigger("rendered");
  };

  return KlassSubtestResultView;

})(Backbone.View);

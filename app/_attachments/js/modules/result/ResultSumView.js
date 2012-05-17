var ResultSumView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ResultSumView = (function(_super) {

  __extends(ResultSumView, _super);

  function ResultSumView() {
    ResultSumView.__super__.constructor.apply(this, arguments);
  }

  ResultSumView.prototype.className = "info_box";

  ResultSumView.prototype.events = {
    'click .details': 'toggleDetails'
  };

  ResultSumView.prototype.toggleDetails = function() {
    return this.$el.find('.detail_box').toggle(250);
  };

  ResultSumView.prototype.initialize = function(options) {
    return this.model = options.model;
  };

  ResultSumView.prototype.render = function() {
    var datum, html, i, spark_id, _len, _len2, _ref, _ref2;
    html = "<div>        " + (moment(new Date(this.model.get('timestamp'))).format('YYYY-MMM-DD HH:mm')) + "        (" + (moment(new Date(this.model.get('timestamp'))).fromNow()) + ")        <button class='details command'>details</button>      </div>      <div class='confirmation detail_box'>";
    _ref = this.model.get("subtestData");
    for (i = 0, _len = _ref.length; i < _len; i++) {
      datum = _ref[i];
      html += "<div><span id='" + this.cid + "_@{datum.name}_" + i + "'></span>" + datum.name + " - items " + datum.sum.total + "</div>";
    }
    html += "      </div>    ";
    this.$el.html(html);
    _ref2 = this.model.get("subtestData");
    for (i = 0, _len2 = _ref2.length; i < _len2; i++) {
      datum = _ref2[i];
      spark_id = "" + this.cid + "_@{datum.name}_" + i;
      $("#" + this.cid + "_").sparkline([datum.sum.correct, datum.sum.incorrect, datum.sum.missing], {
        type: 'pie',
        width: '50',
        height: '50',
        sliceColors: ["#6f6", "#c66", "#ccc"]
      });
    }
    return this.trigger("rendered");
  };

  return ResultSumView;

})(Backbone.View);

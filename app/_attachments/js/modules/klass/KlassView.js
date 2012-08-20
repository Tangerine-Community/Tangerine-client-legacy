var KlassView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassView = (function(_super) {

  __extends(KlassView, _super);

  function KlassView() {
    KlassView.__super__.constructor.apply(this, arguments);
  }

  KlassView.prototype.initialize = function(options) {
    var allAssessments,
      _this = this;
    this.klass = options.klass;
    this.assessments = this.klass.assessments;
    this.results = [];
    allAssessments = new KlassAssessments;
    return allAssessments.fetch({
      success: function(assessmentCollection) {
        var results;
        _this.assessments = assessmentCollection.where({
          klassId: _this.klass.id
        });
        results = new Results;
        return results.fetch({
          success: function(resultCollection) {
            var assessment, _i, _len, _ref;
            _ref = _this.assessments;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              assessment = _ref[_i];
              assessment.results = resultCollection.where({
                assessmentId: assessment.id
              });
            }
            return _this.render();
          }
        });
      }
    });
  };

  KlassView.prototype.render = function() {
    var assessment, grade, html, stream, year, _i, _len, _ref, _ref2;
    year = this.klass.get("year") || "";
    grade = this.klass.get("grade") || "";
    stream = this.klass.get("stream") || "";
    html = "    <h1>" + (t('class')) + " " + stream + "</h1>    <table>      <tr><td>" + (t('year')) + "</td><td>" + year + "</td></tr>      <tr><td>" + (t('grade')) + "</td><tr>" + grade + "</td></tr>    </table>    </div>    <ul class='assessment_list'>";
    _ref = this.assessments;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      assessment = _ref[_i];
      html += "<li data-id='" + assessment.id + "'>" + (assessment.get('name')) + " - " + ((_ref2 = assessment.get('results')) != null ? _ref2.length : void 0) + "</li>";
    }
    html += "</ul>";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return KlassView;

})(Backbone.View);

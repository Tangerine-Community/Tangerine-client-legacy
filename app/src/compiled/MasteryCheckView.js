var MasteryCheckView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MasteryCheckView = (function(superClass) {
  extend(MasteryCheckView, superClass);

  function MasteryCheckView() {
    return MasteryCheckView.__super__.constructor.apply(this, arguments);
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
    this.lastPart = Math.max.apply(this, this.results.pluck("part"));
    if (!isFinite(this.lastPart)) {
      return this.lastPart = 0;
    }
  };

  MasteryCheckView.prototype.render = function() {
    var html, htmlWarning, i, j, len, part, ref, ref1, result, subtestName;
    html = "<h1>Mastery check report</h1> <h2>Student " + (this.student.get("name")) + "</h2>";
    htmlWarning = "<p>No test data for this type of report. Return to the <a href='#class'>class menu</a> and click the <img src='images/icon_run.png'> icon to collect data.</p>";
    if (this.results.length === 0) {
      this.$el.html(html + " " + htmlWarning);
      this.trigger("rendered");
      return;
    }
    html += "<table>";
    for (part = i = 1, ref = this.lastPart; 1 <= ref ? i <= ref : i >= ref; part = 1 <= ref ? ++i : --i) {
      if (this.resultsByPart[part] == null) {
        continue;
      }
      html += "<tr><th>Assessment " + part + "</th></tr> <tr>";
      ref1 = this.resultsByPart[part];
      for (j = 0, len = ref1.length; j < len; j++) {
        result = ref1[j];
        subtestName = this.subtests.get(result.get('subtestId')).get('name');
        html += "<td> " + (result.get("itemType").titleize()) + " correct<br> " + subtestName + " </td> <td>" + (result.get("correct")) + "/" + (result.get("total")) + "</td>";
      }
    }
    html += "</table> <button class='navigation back'>" + (t('back')) + "</button>";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return MasteryCheckView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVwb3J0L01hc3RlcnlDaGVja1ZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsZ0JBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7NkJBRUosU0FBQSxHQUFZOzs2QkFFWixNQUFBLEdBQ0U7SUFBQSxhQUFBLEVBQWdCLFFBQWhCOzs7NkJBRUYsTUFBQSxHQUFRLFNBQUE7V0FBRyxPQUFPLENBQUMsSUFBUixDQUFBO0VBQUg7OzZCQUVSLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFFVixJQUFDLENBQUEsUUFBRCxHQUFZLE9BQU8sQ0FBQztJQUNwQixJQUFDLENBQUEsT0FBRCxHQUFZLE9BQU8sQ0FBQztJQUNwQixJQUFDLENBQUEsT0FBRCxHQUFZLE9BQU8sQ0FBQztJQUNwQixJQUFDLENBQUEsS0FBRCxHQUFZLE9BQU8sQ0FBQztJQUVwQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBaUIsTUFBakI7SUFFakIsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQVQsQ0FBZSxJQUFmLEVBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxDQUFlLE1BQWYsQ0FBbEI7SUFDWixJQUFpQixDQUFJLFFBQUEsQ0FBUyxJQUFDLENBQUEsUUFBVixDQUFyQjthQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksRUFBWjs7RUFWVTs7NkJBWVosTUFBQSxHQUFRLFNBQUE7QUFFTixRQUFBO0lBQUEsSUFBQSxHQUFPLDRDQUFBLEdBRVEsQ0FBQyxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxNQUFiLENBQUQsQ0FGUixHQUU4QjtJQU1yQyxXQUFBLEdBQWM7SUFFZCxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxLQUFtQixDQUF0QjtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUNJLElBQUQsR0FBTSxHQUFOLEdBQ0MsV0FGSjtNQUlBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtBQUNBLGFBTkY7O0lBVUEsSUFBQSxJQUFRO0FBQ1IsU0FBWSw4RkFBWjtNQUVFLElBQU8sZ0NBQVA7QUFBa0MsaUJBQWxDOztNQUNBLElBQUEsSUFBUSxxQkFBQSxHQUNlLElBRGYsR0FDb0I7QUFHNUI7QUFBQSxXQUFBLHNDQUFBOztRQUNFLFdBQUEsR0FBYyxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFNLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBZCxDQUFzQyxDQUFDLEdBQXZDLENBQTJDLE1BQTNDO1FBQ2QsSUFBQSxJQUFRLE9BQUEsR0FFSCxDQUFDLE1BQU0sQ0FBQyxHQUFQLENBQVcsVUFBWCxDQUFzQixDQUFDLFFBQXZCLENBQUEsQ0FBRCxDQUZHLEdBRWdDLGVBRmhDLEdBR0YsV0FIRSxHQUdVLGFBSFYsR0FLRCxDQUFDLE1BQU0sQ0FBQyxHQUFQLENBQVcsU0FBWCxDQUFELENBTEMsR0FLc0IsR0FMdEIsR0FLd0IsQ0FBQyxNQUFNLENBQUMsR0FBUCxDQUFXLE9BQVgsQ0FBRCxDQUx4QixHQUs2QztBQVB2RDtBQVBGO0lBZ0JBLElBQUEsSUFBUSwyQ0FBQSxHQUV5QixDQUFDLENBQUEsQ0FBRSxNQUFGLENBQUQsQ0FGekIsR0FFb0M7SUFFNUMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsSUFBVjtXQUVBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQTdDTTs7OztHQXJCcUIsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvcmVwb3J0L01hc3RlcnlDaGVja1ZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBNYXN0ZXJ5Q2hlY2tWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiTWFzdGVyeUNoZWNrVmlld1wiXG5cbiAgZXZlbnRzIDpcbiAgICBcImNsaWNrIC5iYWNrXCIgOiBcImdvQmFja1wiXG4gICAgXG4gIGdvQmFjazogLT4gaGlzdG9yeS5iYWNrKClcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBzdWJ0ZXN0cyA9IG9wdGlvbnMuc3VidGVzdHNcbiAgICBAcmVzdWx0cyAgPSBvcHRpb25zLnJlc3VsdHNcbiAgICBAc3R1ZGVudCAgPSBvcHRpb25zLnN0dWRlbnRcbiAgICBAa2xhc3MgICAgPSBvcHRpb25zLmtsYXNzXG5cbiAgICBAcmVzdWx0c0J5UGFydCA9IEByZXN1bHRzLmluZGV4QnkgXCJwYXJ0XCJcblxuICAgIEBsYXN0UGFydCA9IE1hdGgubWF4LmFwcGx5KEAsIEByZXN1bHRzLnBsdWNrKFwicGFydFwiKSlcbiAgICBAbGFzdFBhcnQgPSAwIGlmIG5vdCBpc0Zpbml0ZShAbGFzdFBhcnQpXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgaHRtbCA9IFwiXG4gICAgICA8aDE+TWFzdGVyeSBjaGVjayByZXBvcnQ8L2gxPlxuICAgICAgPGgyPlN0dWRlbnQgI3tAc3R1ZGVudC5nZXQoXCJuYW1lXCIpfTwvaDI+XG4gICAgXCJcblxuICAgICNcbiAgICAjIEVtcHR5IHdhcm5pbmdcbiAgICAjXG4gICAgaHRtbFdhcm5pbmcgPSBcIjxwPk5vIHRlc3QgZGF0YSBmb3IgdGhpcyB0eXBlIG9mIHJlcG9ydC4gUmV0dXJuIHRvIHRoZSA8YSBocmVmPScjY2xhc3MnPmNsYXNzIG1lbnU8L2E+IGFuZCBjbGljayB0aGUgPGltZyBzcmM9J2ltYWdlcy9pY29uX3J1bi5wbmcnPiBpY29uIHRvIGNvbGxlY3QgZGF0YS48L3A+XCJcblxuICAgIGlmIEByZXN1bHRzLmxlbmd0aCA9PSAwXG4gICAgICBAJGVsLmh0bWwgXCJcbiAgICAgICAgI3todG1sfVxuICAgICAgICAje2h0bWxXYXJuaW5nfVxuICAgICAgXCJcbiAgICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgICAgcmV0dXJuXG5cblxuXG4gICAgaHRtbCArPSBcIjx0YWJsZT5cIlxuICAgIGZvciBwYXJ0IGluIFsxLi5AbGFzdFBhcnRdXG5cbiAgICAgIGlmIG5vdCBAcmVzdWx0c0J5UGFydFtwYXJ0XT8gdGhlbiBjb250aW51ZVxuICAgICAgaHRtbCArPSBcIlxuICAgICAgICA8dHI+PHRoPkFzc2Vzc21lbnQgI3twYXJ0fTwvdGg+PC90cj5cbiAgICAgICAgPHRyPlwiXG5cbiAgICAgIGZvciByZXN1bHQgaW4gQHJlc3VsdHNCeVBhcnRbcGFydF1cbiAgICAgICAgc3VidGVzdE5hbWUgPSBAc3VidGVzdHMuZ2V0KHJlc3VsdC5nZXQoJ3N1YnRlc3RJZCcpKS5nZXQoJ25hbWUnKVxuICAgICAgICBodG1sICs9IFwiXG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgI3tyZXN1bHQuZ2V0KFwiaXRlbVR5cGVcIikudGl0bGVpemUoKX0gY29ycmVjdDxicj5cbiAgICAgICAgICAgICN7c3VidGVzdE5hbWV9XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8dGQ+I3tyZXN1bHQuZ2V0KFwiY29ycmVjdFwiKX0vI3tyZXN1bHQuZ2V0KFwidG90YWxcIil9PC90ZD5cIlxuICAgICAgXG4gICAgaHRtbCArPSBcIlxuICAgIDwvdGFibGU+XG4gICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBiYWNrJz4je3QoJ2JhY2snKX08L2J1dHRvbj5cbiAgICBcIlxuICAgIEAkZWwuaHRtbCBodG1sXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiJdfQ==

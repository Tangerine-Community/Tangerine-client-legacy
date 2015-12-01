var ResultSumView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ResultSumView = (function(superClass) {
  extend(ResultSumView, superClass);

  function ResultSumView() {
    return ResultSumView.__super__.constructor.apply(this, arguments);
  }

  ResultSumView.prototype.className = "info_box";

  ResultSumView.prototype.events = {
    'click .details': 'toggleDetails'
  };

  ResultSumView.prototype.toggleDetails = function() {
    return this.$el.find('.detail_box').toggle(250);
  };

  ResultSumView.prototype.i18n = function() {
    return this.text = {
      resume: t("ResultSumView.button.resume"),
      noResults: t("ResultSumView.message.no_results")
    };
  };

  ResultSumView.prototype.initialize = function(options) {
    var j, len, prototype, ref, ref1, results, subtest;
    this.i18n();
    this.result = options.model;
    this.finishCheck = options.finishCheck;
    this.finished = ((ref = _.last(this.result.attributes.subtestData)) != null ? ref.data.end_time : void 0) != null ? true : false;
    this.studentId = "";
    ref1 = this.result.attributes.subtestData;
    results = [];
    for (j = 0, len = ref1.length; j < len; j++) {
      subtest = ref1[j];
      prototype = subtest.prototype;
      if (prototype === "id") {
        this.studentId = subtest.data.participant_id;
        break;
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  ResultSumView.prototype.render = function() {
    var datum, html, i, itemPlural, j, len, ref, ref1, sum;
    html = "<div class='detail_box'>";
    if (!(this.finished || !this.finishCheck)) {
      html += "<div><a href='#resume/" + (this.result.get('assessmentId')) + "/" + this.result.id + "'><button class='command'>" + this.text.resume + "</button></a></div>";
    }
    html += "<table>";
    ref = this.result.get("subtestData");
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      datum = ref[i];
      sum = ((ref1 = datum.data.items) != null ? ref1.length : void 0) || Object.keys(datum.data).length;
      itemPlural = sum > 1 ? "s" : "";
      html += "<tr><td>" + datum.name + "</td><td>" + sum + " item" + itemPlural + "</td></tr>";
    }
    html += "</div>";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return ResultSumView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVzdWx0L1Jlc3VsdFN1bVZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsYUFBQTtFQUFBOzs7QUFBTTs7Ozs7OzswQkFFSixTQUFBLEdBQVk7OzBCQUVaLE1BQUEsR0FDRTtJQUFBLGdCQUFBLEVBQW1CLGVBQW5COzs7MEJBRUYsYUFBQSxHQUFlLFNBQUE7V0FDYixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxhQUFWLENBQXdCLENBQUMsTUFBekIsQ0FBZ0MsR0FBaEM7RUFEYTs7MEJBSWYsSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsSUFBRCxHQUNFO01BQUEsTUFBQSxFQUFZLENBQUEsQ0FBRSw2QkFBRixDQUFaO01BQ0EsU0FBQSxFQUFZLENBQUEsQ0FBRSxrQ0FBRixDQURaOztFQUZFOzswQkFLTixVQUFBLEdBQVksU0FBRSxPQUFGO0FBRVYsUUFBQTtJQUFBLElBQUMsQ0FBQSxJQUFELENBQUE7SUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLE9BQU8sQ0FBQztJQUNsQixJQUFDLENBQUEsV0FBRCxHQUFlLE9BQU8sQ0FBQztJQUN2QixJQUFDLENBQUEsUUFBRCxHQUFlLGlHQUFILEdBQStELElBQS9ELEdBQXlFO0lBRXJGLElBQUMsQ0FBQSxTQUFELEdBQWE7QUFDYjtBQUFBO1NBQUEsc0NBQUE7O01BQ0UsU0FBQSxHQUFZLE9BQU8sQ0FBQztNQUNwQixJQUFHLFNBQUEsS0FBYSxJQUFoQjtRQUNFLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDLElBQUksQ0FBQztBQUMxQixjQUZGO09BQUEsTUFBQTs2QkFBQTs7QUFGRjs7RUFUVTs7MEJBZVosTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsSUFBQSxHQUFPO0lBQ1AsSUFBQSxDQUFBLENBQWdKLElBQUMsQ0FBQSxRQUFELElBQWEsQ0FBQyxJQUFDLENBQUEsV0FBL0osQ0FBQTtNQUFBLElBQUEsSUFBUSx3QkFBQSxHQUF3QixDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLGNBQVosQ0FBRCxDQUF4QixHQUFxRCxHQUFyRCxHQUF3RCxJQUFDLENBQUEsTUFBTSxDQUFDLEVBQWhFLEdBQW1FLDRCQUFuRSxHQUErRixJQUFDLENBQUEsSUFBSSxDQUFDLE1BQXJHLEdBQTRHLHNCQUFwSDs7SUFDQSxJQUFBLElBQVE7QUFDUjtBQUFBLFNBQUEsNkNBQUE7O01BQ0UsR0FBQSw0Q0FBc0IsQ0FBRSxnQkFBbEIsSUFBNEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFLLENBQUMsSUFBbEIsQ0FBdUIsQ0FBQztNQUMxRCxVQUFBLEdBQWdCLEdBQUEsR0FBTSxDQUFULEdBQWdCLEdBQWhCLEdBQXlCO01BQ3RDLElBQUEsSUFBUSxVQUFBLEdBQVcsS0FBSyxDQUFDLElBQWpCLEdBQXNCLFdBQXRCLEdBQWlDLEdBQWpDLEdBQXFDLE9BQXJDLEdBQTRDLFVBQTVDLEdBQXVEO0FBSGpFO0lBSUEsSUFBQSxJQUFRO0lBSVIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsSUFBVjtXQUVBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQWRNOzs7O0dBL0JrQixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9yZXN1bHQvUmVzdWx0U3VtVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFJlc3VsdFN1bVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJpbmZvX2JveFwiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAuZGV0YWlscycgOiAndG9nZ2xlRGV0YWlscydcblxuICB0b2dnbGVEZXRhaWxzOiAtPlxuICAgIEAkZWwuZmluZCgnLmRldGFpbF9ib3gnKS50b2dnbGUoMjUwKVxuXG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICByZXN1bWUgICAgOiB0KFwiUmVzdWx0U3VtVmlldy5idXR0b24ucmVzdW1lXCIpXG4gICAgICBub1Jlc3VsdHMgOiB0KFwiUmVzdWx0U3VtVmlldy5tZXNzYWdlLm5vX3Jlc3VsdHNcIilcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuXG4gICAgQGkxOG4oKVxuXG4gICAgQHJlc3VsdCA9IG9wdGlvbnMubW9kZWxcbiAgICBAZmluaXNoQ2hlY2sgPSBvcHRpb25zLmZpbmlzaENoZWNrXG4gICAgQGZpbmlzaGVkID0gaWYgXy5sYXN0KEByZXN1bHQuYXR0cmlidXRlcy5zdWJ0ZXN0RGF0YSk/LmRhdGEuZW5kX3RpbWU/IHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG5cbiAgICBAc3R1ZGVudElkID0gXCJcIlxuICAgIGZvciBzdWJ0ZXN0IGluIEByZXN1bHQuYXR0cmlidXRlcy5zdWJ0ZXN0RGF0YVxuICAgICAgcHJvdG90eXBlID0gc3VidGVzdC5wcm90b3R5cGVcbiAgICAgIGlmIHByb3RvdHlwZSA9PSBcImlkXCJcbiAgICAgICAgQHN0dWRlbnRJZCA9IHN1YnRlc3QuZGF0YS5wYXJ0aWNpcGFudF9pZFxuICAgICAgICBicmVha1xuXG4gIHJlbmRlcjogLT5cbiAgICBodG1sID0gXCI8ZGl2IGNsYXNzPSdkZXRhaWxfYm94Jz5cIlxuICAgIGh0bWwgKz0gXCI8ZGl2PjxhIGhyZWY9JyNyZXN1bWUvI3tAcmVzdWx0LmdldCgnYXNzZXNzbWVudElkJyl9LyN7QHJlc3VsdC5pZH0nPjxidXR0b24gY2xhc3M9J2NvbW1hbmQnPiN7QHRleHQucmVzdW1lfTwvYnV0dG9uPjwvYT48L2Rpdj5cIiB1bmxlc3MgQGZpbmlzaGVkIHx8ICFAZmluaXNoQ2hlY2tcbiAgICBodG1sICs9IFwiPHRhYmxlPlwiXG4gICAgZm9yIGRhdHVtLCBpIGluIEByZXN1bHQuZ2V0KFwic3VidGVzdERhdGFcIilcbiAgICAgIHN1bSA9IGRhdHVtLmRhdGEuaXRlbXM/Lmxlbmd0aCBvciBPYmplY3Qua2V5cyhkYXR1bS5kYXRhKS5sZW5ndGhcbiAgICAgIGl0ZW1QbHVyYWwgPSBpZiBzdW0gPiAxIHRoZW4gXCJzXCIgZWxzZSBcIlwiXG4gICAgICBodG1sICs9IFwiPHRyPjx0ZD4je2RhdHVtLm5hbWV9PC90ZD48dGQ+I3tzdW19IGl0ZW0je2l0ZW1QbHVyYWx9PC90ZD48L3RyPlwiXG4gICAgaHRtbCArPSBcIlxuICAgICAgPC9kaXY+XG4gICAgXCJcblxuICAgIEAkZWwuaHRtbCBodG1sXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuIl19

Tangerine.ReportWarnings = {
  KlassToDateView: function(rawData) {
    var bucketKey, html, percentages, ref, result;
    result = [];
    ref = rawData.percentages;
    for (bucketKey in ref) {
      percentages = ref[bucketKey];
      html = "";
      if (this.nUnderX(0.2, 0.75, percentages)) {
        html += "<p>More than 20% of students got less than 75% on the " + bucketKey + " assessment. Re-teach the " + bucketKey + " component of the lesson during the next lesson.</p>";
      }
      result.push({
        "html": html
      });
    }
    return result;
  },
  StudentToDateView: function(rawData) {
    var bucketKey, html, percentage, ref, result;
    result = [];
    ref = rawData.percentages;
    for (bucketKey in ref) {
      percentage = ref[bucketKey];
      html = "";
      if ((_.flatten(percentage) / 100) < .75) {
        html += "<p>" + rawData.studentName + " got less than 75% on the " + bucketKey + " assessment. Re-teach the " + bucketKey + " component from applicable lessons during the next lesson.</p>";
      }
      result.push({
        "html": html
      });
    }
    return result;
  },
  nUnderX: function(n, x, percentages) {
    var i, len, percentage, totalCount, underCount;
    underCount = 0;
    totalCount = 0;
    for (i = 0, len = percentages.length; i < len; i++) {
      percentage = percentages[i];
      totalCount++;
      if (percentage / 100 < x) {
        underCount++;
      }
    }
    return (underCount / totalCount) > n;
  }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVwb3J0L1JlcG9ydFdhcm5pbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLENBQUMsY0FBVixHQUVFO0VBQUEsZUFBQSxFQUFrQixTQUFDLE9BQUQ7QUFDaEIsUUFBQTtJQUFBLE1BQUEsR0FBUztBQUNUO0FBQUEsU0FBQSxnQkFBQTs7TUFDRSxJQUFBLEdBQU87TUFDUCxJQUFHLElBQUMsQ0FBQSxPQUFELENBQVMsR0FBVCxFQUFjLElBQWQsRUFBb0IsV0FBcEIsQ0FBSDtRQUNFLElBQUEsSUFBUSx3REFBQSxHQUF5RCxTQUF6RCxHQUFtRSw0QkFBbkUsR0FBK0YsU0FBL0YsR0FBeUcsdURBRG5IOztNQUVBLE1BQU0sQ0FBQyxJQUFQLENBQ0U7UUFBQSxNQUFBLEVBQVMsSUFBVDtPQURGO0FBSkY7QUFNQSxXQUFPO0VBUlMsQ0FBbEI7RUFVQSxpQkFBQSxFQUFvQixTQUFDLE9BQUQ7QUFDbEIsUUFBQTtJQUFBLE1BQUEsR0FBUztBQUNUO0FBQUEsU0FBQSxnQkFBQTs7TUFDRSxJQUFBLEdBQU87TUFDUCxJQUFHLENBQUMsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxVQUFWLENBQUEsR0FBc0IsR0FBdkIsQ0FBQSxHQUE4QixHQUFqQztRQUNFLElBQUEsSUFBUSxLQUFBLEdBQU0sT0FBTyxDQUFDLFdBQWQsR0FBMEIsNEJBQTFCLEdBQXNELFNBQXRELEdBQWdFLDRCQUFoRSxHQUE0RixTQUE1RixHQUFzRyxpRUFEaEg7O01BRUEsTUFBTSxDQUFDLElBQVAsQ0FDRTtRQUFBLE1BQUEsRUFBUyxJQUFUO09BREY7QUFKRjtBQU1BLFdBQU87RUFSVyxDQVZwQjtFQW9CQSxPQUFBLEVBQVUsU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLFdBQVA7QUFDUixRQUFBO0lBQUEsVUFBQSxHQUFhO0lBQ2IsVUFBQSxHQUFhO0FBQ2IsU0FBQSw2Q0FBQTs7TUFDRSxVQUFBO01BQ0EsSUFBZ0IsVUFBQSxHQUFhLEdBQWIsR0FBbUIsQ0FBbkM7UUFBQSxVQUFBLEdBQUE7O0FBRkY7QUFHQSxXQUFPLENBQUMsVUFBQSxHQUFhLFVBQWQsQ0FBQSxHQUE0QjtFQU4zQixDQXBCViIsImZpbGUiOiJtb2R1bGVzL3JlcG9ydC9SZXBvcnRXYXJuaW5ncy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlRhbmdlcmluZS5SZXBvcnRXYXJuaW5ncyA9XG5cbiAgS2xhc3NUb0RhdGVWaWV3IDogKHJhd0RhdGEpIC0+XG4gICAgcmVzdWx0ID0gW11cbiAgICBmb3IgYnVja2V0S2V5LCBwZXJjZW50YWdlcyBvZiByYXdEYXRhLnBlcmNlbnRhZ2VzXG4gICAgICBodG1sID0gXCJcIlxuICAgICAgaWYgQG5VbmRlclggMC4yLCAwLjc1LCBwZXJjZW50YWdlc1xuICAgICAgICBodG1sICs9IFwiPHA+TW9yZSB0aGFuIDIwJSBvZiBzdHVkZW50cyBnb3QgbGVzcyB0aGFuIDc1JSBvbiB0aGUgI3tidWNrZXRLZXl9IGFzc2Vzc21lbnQuIFJlLXRlYWNoIHRoZSAje2J1Y2tldEtleX0gY29tcG9uZW50IG9mIHRoZSBsZXNzb24gZHVyaW5nIHRoZSBuZXh0IGxlc3Nvbi48L3A+XCJcbiAgICAgIHJlc3VsdC5wdXNoXG4gICAgICAgIFwiaHRtbFwiIDogaHRtbFxuICAgIHJldHVybiByZXN1bHRcblxuICBTdHVkZW50VG9EYXRlVmlldyA6IChyYXdEYXRhKSAtPlxuICAgIHJlc3VsdCA9IFtdXG4gICAgZm9yIGJ1Y2tldEtleSwgcGVyY2VudGFnZSBvZiByYXdEYXRhLnBlcmNlbnRhZ2VzXG4gICAgICBodG1sID0gXCJcIlxuICAgICAgaWYgKF8uZmxhdHRlbihwZXJjZW50YWdlKS8xMDApIDwgLjc1XG4gICAgICAgIGh0bWwgKz0gXCI8cD4je3Jhd0RhdGEuc3R1ZGVudE5hbWV9IGdvdCBsZXNzIHRoYW4gNzUlIG9uIHRoZSAje2J1Y2tldEtleX0gYXNzZXNzbWVudC4gUmUtdGVhY2ggdGhlICN7YnVja2V0S2V5fSBjb21wb25lbnQgZnJvbSBhcHBsaWNhYmxlIGxlc3NvbnMgZHVyaW5nIHRoZSBuZXh0IGxlc3Nvbi48L3A+XCJcbiAgICAgIHJlc3VsdC5wdXNoXG4gICAgICAgIFwiaHRtbFwiIDogaHRtbFxuICAgIHJldHVybiByZXN1bHRcblxuICBuVW5kZXJYIDogKG4sIHgsIHBlcmNlbnRhZ2VzKSAtPlxuICAgIHVuZGVyQ291bnQgPSAwXG4gICAgdG90YWxDb3VudCA9IDBcbiAgICBmb3IgcGVyY2VudGFnZSBpbiBwZXJjZW50YWdlc1xuICAgICAgdG90YWxDb3VudCsrXG4gICAgICB1bmRlckNvdW50KysgaWYgcGVyY2VudGFnZSAvIDEwMCA8IHhcbiAgICByZXR1cm4gKHVuZGVyQ291bnQgLyB0b3RhbENvdW50KSA+IG5cbiAgICAiXX0=

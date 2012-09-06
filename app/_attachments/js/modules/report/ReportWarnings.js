
Tangerine.ReportWarnings = {
  KlassToDateView: function(rawData) {
    var bucketKey, html, percentages, result, _ref;
    result = [];
    _ref = rawData.percentages;
    for (bucketKey in _ref) {
      percentages = _ref[bucketKey];
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
  nUnderX: function(n, x, percentages) {
    var percentage, totalCount, underCount, _i, _len;
    underCount = 0;
    totalCount = 0;
    for (_i = 0, _len = percentages.length; _i < _len; _i++) {
      percentage = percentages[_i];
      totalCount++;
      if (percentage / 100 < x) underCount++;
    }
    return (underCount / totalCount) > n;
  }
};

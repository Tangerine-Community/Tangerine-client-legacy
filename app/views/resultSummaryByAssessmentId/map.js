
(function(doc) {
  var result, subtest, _i, _len, _ref;
  if (doc.collection === 'result') {
    result = {};
    if (doc.timestamp != null) result.timestamp = doc.timestamp;
    _ref = doc.subtestData;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subtest = _ref[_i];
      if (subtest.prototype === "id") {
        result.participant_id = subtest.data.participant_id;
      }
      if (subtest.prototype === "complete") {
        result.end_time = subtest.data.end_time;
      }
    }
    result.start_time = doc.start_time;
    return emit(doc.assessmentId, result);
  }
});

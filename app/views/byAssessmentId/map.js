function(doc) {
  if (doc.collection) return emit(doc.assessmentId, doc);
}

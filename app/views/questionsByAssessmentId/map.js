function(doc) {
  if (doc.collection == 'question') {
    emit(doc.assessmentId, doc);
  }
}

function(doc) {
  if (doc.collection == 'subtest') {
	if (doc.assessmentId)
	{    
		emit(doc.assessmentId, doc);
	} else if (doc.curriculumId)
	{
		emit(doc.curriculumId, doc);
	}
  }
}

function(doc) {
	if (doc.collection == 'question') {
		if (doc.assessmentId)
		{
			emit(doc.assessmentId, doc);
		} else if (doc.curriculumId)
		{
			emit(doc.curriculumId, doc);
		}
	}
}

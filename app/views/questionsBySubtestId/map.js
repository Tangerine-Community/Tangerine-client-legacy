function(doc) {
	if (doc.collection == 'question') {
		if (doc.subtestId)
		{
			emit(doc.subtestId, doc);
		}
	}
}

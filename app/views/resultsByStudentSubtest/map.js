function (doc) {
	if (doc.collection == "result")
	{
		emit([doc.studentId, doc.subtestId], doc);
	}
}
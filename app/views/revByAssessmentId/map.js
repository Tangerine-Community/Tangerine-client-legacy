function(doc)
{
	if ( doc.collection && doc.collection != "result")
	{
		if (doc.assessmentId)
		{
			emit( doc.assessmentId, {
				"_id" : doc._id,
				"_rev" : doc._rev 
			});
		} else if (doc.curriculumId) {
			emit( doc.curriculumId, {
				"_id" : doc._id,
				"_rev" : doc._rev 
			});
		}
	}
}
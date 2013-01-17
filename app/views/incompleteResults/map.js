function (doc)
{
	if (doc.collection != "result")
		return;

	var notComplete = true;

	for ( var i in doc.subtestData )
	{
		subtest = doc.subtestData[i];
		if ( subtest['prototype'] === "complete" )
		{
			notComplete = false;
		}
	}

	if (notComplete)
	{
		emit(doc.assessmentId,null);
	}
	
}
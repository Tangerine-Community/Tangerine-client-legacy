function( doc )
{
  if ( doc.collection && doc.collection != "result")
  {
	if (doc.assessmentId)
	{
		emit( doc.assessmentId.substr(-5,5), null );
	} else if (doc.curriculumId) {
		emit( doc.curriculumId.substr(-5,5), null );
	}
  }
}
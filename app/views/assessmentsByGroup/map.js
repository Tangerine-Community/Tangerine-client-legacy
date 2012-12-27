function( doc )
{
  if ( doc.collection == "assessment")
  {
    emit( doc.group, doc );
  }
}
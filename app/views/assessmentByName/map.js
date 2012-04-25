function( doc )
{
  if (doc.collection == "assessment")
    emit(doc.name, doc);
}
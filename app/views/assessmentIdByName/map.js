function( doc )
{
  if (doc.collection == "assessment")
    emit(doc.name.toLowerCase(), {id:doc._id,name:doc.name,group:doc.group});
}
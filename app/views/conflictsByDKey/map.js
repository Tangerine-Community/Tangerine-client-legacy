function( doc )
{

  var docId = (doc.assessmentId || doc.curriculumId);
  if ( doc._conflicts && doc.collection != "result" && docId )
  {

    var dKey = docId.substr(-5,5);

    var result = [];

    emit( dKey, {
      "_id"        : doc._id,
      "_rev"       : doc._rev,
    });

    for (var i = 0; i < doc._conflicts.length; i++)
    {
      emit( dKey, {
        "_id"        : doc._id,
        "_rev"       : doc._conflicts[i]
      });
    }

  }

}


function( doc, req )
{
  if (doc.dKeys)
  {
    for ( var i = 0; i < doc.dKeys.length ; i++ )
    {
      if ( doc.dKeys[i] == req.query.dKey )
        return true;
    }
  }
  return false;
}
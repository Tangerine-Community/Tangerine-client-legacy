
(function(doc, req) {
  if (doc.assessment === req.query.assessment) return true;
  return false;
});

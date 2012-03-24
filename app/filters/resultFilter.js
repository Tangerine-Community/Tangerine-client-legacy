
(function(doc, req) {
  if (doc.assessmentId === req.query.assessmentId) return true;
  return false;
});

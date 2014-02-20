function(doc) {
  if (doc.lessonText){
    match = doc.lessonText.match(/[^\"]*\.mp3/g)
    if (match){
      for(i=0;i<match.length;i++){
        emit(match[i], doc._id);
      }
    }
  }
}

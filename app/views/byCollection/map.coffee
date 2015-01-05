(doc) -> emit(doc.collection, { "_rev" : doc._rev }) if doc.collection

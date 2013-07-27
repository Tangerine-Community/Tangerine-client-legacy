(doc) ->

  return unless doc.collection is "teacher"

  utils = require("views/lib/utils")

  exportValue = utils.exportValue
  pair        = utils.pair

  teacher = [
    pair "username" , doc.name
    pair "id"       , doc._id
    pair "gender"   , doc.gender
    pair "first"    , doc.first
    pair "last"     , doc.last
    pair "school"   , doc.school
    pair "contact"  , doc.contact
    pair "tabletId" , doc.fromInstanceId
  ]

  emit(doc.name,[ pair("info", teacher ) ])

# Communicates with the location view
class Loc


  # criteria can be some appropriate combination of county: "", zone: "", school: "".
  # if it's {key:""} then it will look up "key-YOURKEY"
  @query: (criteria, callback, context) ->
    if not criteria?
      key = "counties"
    else if criteria.key?
      key = "key-#{criteria.key}"
    else if criteria.parents?
      key = "parents-#{criteria.parents}"
    else
      key = Loc.getKey criteria

    @_query(key, callback, context)

  @_query: (key, callback, context) ->
    $.couch.db(Tangerine.db_name).view "#{Tangerine.design_doc}/location",
      key : key
      error: -> console.error arguments
      success: (res) ->
        if res.rows.length is 0
          callback.apply context, [null]
        else
          callback.apply context, [res.rows[0].value]


  @getKey: (criteria) ->
    criteriaArray = []
    criteriaArray.push("county-#{criteria.county}") if criteria.county?
    criteriaArray.push("zone-#{criteria.zone}")     if criteria.zone?
    criteriaArray.push("school-#{criteria.school}") if criteria.school?
    return criteriaArray.join("-")


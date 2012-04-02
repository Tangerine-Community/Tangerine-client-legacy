class MapReduce

  # Only install this on cloud not on data collection devices
  @mapFields: (doc, req) ->

    #recursion!
    concatNodes: (parent,object) ->
      if object instanceof Array
        for value, index in object
          if typeof object != "string"
            concatNodes(parent+"."+index,value)
      else
        typeofobject = typeof object

        if typeofobject == "boolean" or typeofobject == "string" or typeofobject == "number"
          emitDoc = {
            studentID: doc.DateTime?["student-id"]
            fieldname: parent
          }
          if typeofobject == "boolean"
            emitDoc.result = if object then "true" else "false"
          if typeofobject == "string" or typeofobject == "number"
            emitDoc.result = object
          emit doc.assessment, emitDoc
        else
          for key,value of object
            prefix  = (if parent == "" then key else parent + "." + key)
            concatNodes(prefix,value)

    concatNodes("",doc) unless (doc.type? and doc.type is "replicationLog")

  @reduceFields: (keys, values, rereduce) ->
    rv = []
    for key,value of values
      fieldAndResult = {}
      fieldAndResult[value.fieldname] = value.result
      rv.push fieldAndResult
    return rv


class Utils

  @sudo: (options) ->
    credentials = 
      name: Tangerine.config.user_with_database_create_permission,
      password: Tangerine.config.password_with_database_create_permission
    options = _.extend(options, credentials);
    $.couch.login options

  # this function is a lot like jQuery.serializeArray, except that it returns useful output
  @getValues: ( selector ) ->
    values = {}
    $(selector + " input").each ( index, element ) -> 
      values[element.id] = element.value
    return values

  @okBox: ( title, message ) ->
    console.log [title, message]
  
  # Admins get a manage button 
  # triggered on user changes
  # @TODO this might not be the right place for this. Another View?
  @handleMenu: ->

    Tangerine.user.verify()

    $('#enumerator').html Tangerine.user.get("name")
    # The order of the if statements is important. Maybe it shouldn't be.
    # admin user
    if Tangerine.user.isAdmin()
      $( "#main_nav a" ).hide()
      $( "#navigation" ).show()
      $( "#collect_link, #manage_link, #logout_link" ).show()

    #not logged in
    else if not Tangerine.user.isVerified()
      $( "#navigation" ).hide()

    #regular user
    else
      $( "#main_nav a" ).hide()
      $( "#navigation" ).show()
      $( "#collect_link, #logout_link" ).show()

  # Hide and show navigation pane
  # Triggered on page changes
  # @TODO this might not be the right place for this. Another View?
  @handleNavigation: ->
    if window.location.href.toLowerCase().indexOf("assessment") != -1
      $("nav#main_nav a").removeClass("border_on")
      $("#collect_link").addClass("border_on")    
    if window.location.href.toLowerCase().indexOf("manage") != -1
      $("nav#main_nav a").removeClass("border_on")
      $("#manage_link").addClass("border_on")



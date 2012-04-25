# extend every view
Backbone.View.prototype.close = ->
  @remove()
  @unbind()
  @onClose?()

# handy jquery function, places content top and center
jQuery.fn.topCenter = ->
  @css("position","absolute");
  @css("top", $(window).scrollTop() + "px");
  @css("left", (($(window).width() - @outerWidth()) / 2) + $(window).scrollLeft() + "px");

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
    $(selector).find("input, textarea").each ( index, element ) -> 
      values[element.id] = element.value
    return values

  @cleanURL: (url) ->
    if url.indexOf?("%") != -1 
      url = decodeURIComponent url
    else
      url

  # Should this go another place?
  @importAssessmentFromIris: (dKey) ->
    repOps = 
      'filter' : 'tangerine/downloadFilter'
      'create_target' : true
      'query_params' :
        'dKey' : dKey
    $.couch.replicate Tangerine.iris.host + "/tangerine", "tangerine", { success: (a, b) -> console.log [" success",a, b];}, repOps
    # console.log @importSubtestsFromIris() 

  # Disposable alert
  # @param pause miliseconds to leave message on screen, 0 means it will stay until clicked
  @disposableAlert: (alert_text, opt) ->
    $("<div class='disposable_alert'>#{alert_text}</div>").appendTo("#content").topCenter().delay(2000).fadeOut(250, -> $(this).remove())

class Context

  on: (callbacks, options={}) ->
    if String(window.location).indexOf("iriscouch") != -1
      callbacks.isServer(options)
    else
      callbacks.isTablet(options)

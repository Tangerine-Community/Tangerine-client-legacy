# extend every view
Backbone.View.prototype.close = ->
  @remove()
  @unbind()
  @onClose?()

#
# handy jquery functions
#
( ($) -> 

  $.fn.scrollTo = ->
    try
      $('html, body').animate {
        scrollTop: $(@).offset().top + 'px'
        }, 250
    catch e
      console.log e
      console.log "Scroll error with 'this'"
      console.log @

    return @

  # place something top and center
  $.fn.topCenter = ->
    @css "position", "absolute"
    @css "top", $(window).scrollTop() + "px"
    @css "left", (($(window).width() - @outerWidth()) / 2) + $(window).scrollLeft() + "px"

  # place something middle center
  $.fn.middleCenter = ->
    @css "position", "absolute"
    @css "top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px"
    @css "left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px"

)(jQuery)




String.prototype.safeToSave = ->
  this.replace(/\s|-/g, "_").replace(/[^a-zA-Z0-9_'""]/g,"")

String.prototype.htmlSafe = ->
  $("<div/>").text(this).html().replace(/'/g, "&#39;").replace(/"/g, "&#34;")

Math.ave = ->
  result = 0
  result += x for x in arguments
  result /= arguments.length
  return result


class Utils

  @round: (num, decimals) -> Math.round( num * Math.pow( 10, decimals ) ) / Math.pow( 10, decimals)
  # asks for confirmation in the browser, and uses phonegap for cool confirmation
  @confirm: (message, options) ->
    if navigator.notification?.confirm?
      navigator.notification.confirm message, 
        (input) ->
          if input == 1
            options.callback true
          else if input == 2
            options.callback false
          else
            options.callback input
      , options.title, options.action+",Cancel"
    else
      if window.confirm message
        options.callback true
        return true
      else
        options.callback false
        return false
    return 0

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

  # Disposable alerts
  @topAlert: (alert_text) ->
    $("<div class='disposable_alert'>#{alert_text}</div>").appendTo("#content").topCenter().delay(2000).fadeOut(250, -> $(this).remove())

  @midAlert: (alert_text) ->
    $("<div class='disposable_alert'>#{alert_text}</div>").appendTo("#content").middleCenter().delay(2000).fadeOut(250, -> $(this).remove())

  @S4: ->
   return ( ( ( 1 + Math.random() ) * 0x10000 ) | 0 ).toString(16).substring(1)

  @guid: ->
   return @S4()+@S4()+"-"+@S4()+"-"+@S4()+"-"+@S4()+"-"+@S4()+@S4()+@S4()

  @flash: ->
    $("body").css "backgroundColor" : "red"
    setTimeout ->
      $("body").css "backgroundColor" : "white"
    , 1000

  @$_GET: (q,s) ->
    vars = {}
    parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m,key,value) ->
        value = if ~value.indexOf("#") then value.split("#")[0] else value
        vars[key] = value.split("#")[0];
    )
    vars

  @resizeScrollPane: ->
    $(".scroll_pane").height( $(window).height() - ( $("#navigation").height() + $("#footer").height() + 100) ) 

##UI helpers
$ ->
  # ###.clear_message
  # This little guy will fade out and clear him and his parents. Wrap him wisely.
  # `<span> my message <button class="clear_message">X</button>`
  $("#content").on("click", ".clear_message",  null, (a) -> $(a.target).parent().fadeOut(250, -> $(this).empty().show() ) )
  $("#content").on("click", ".parent_remove", null, (a) -> $(a.target).parent().fadeOut(250, -> $(this).remove() ) )

  # disposable alerts = a non-fancy box
  $("#content").on "click",".alert_button", ->
    alert_text = if $(this).attr("data-alert") then $(this).attr("data-alert") else $(this).val()
    Utils.disposableAlert alert_text
  $("#content").on "click", ".disposable_alert", ->
    $(this).stop().fadeOut 250, ->
      $(this).remove()
  
  # $(window).resize Utils.resizeScrollPane
  # Utils.resizeScrollPane()

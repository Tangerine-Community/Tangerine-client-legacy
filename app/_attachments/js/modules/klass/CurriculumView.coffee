class CurriculumView extends Backbone.View

  className: "CurriculumView"

  events:
    "click .back"           : "goBack"
    "click .delete"         : "deleteCurriculum"
    "click .delete_subtest" : "deleteSubtest"
    "click .edit_in_place"  : "editInPlace"
    "click .edit"           : "gotoEdit"
    'click .new_subtest'    : "newSubtest"



  deleteSubtest: (event) ->
    subtestId = $(event.target).attr("data-subtestId")
    subtest = @subtests.get(subtestId)
    if confirm("Delete subtest\n#{subtest.get('name')}?")
      subtest.destroy
        success: =>
          @subtests.remove(subtestId)
          @updateTable()
        error: =>
          alert "Please try again, could not delete subtest."

  newSubtest: ->
    guid = Utils.guid()

    subtestAttributes = 
      "_id"          : guid
      "curriculumId" : @curriculum.id
      "prototype"    : "grid"
      "captureLastAttempted" : false,
      "endOfLine" : false,

    subtestAttributes = $.extend(Tangerine.templates.prototypeTemplates["grid"], subtestAttributes)

    subtest = new Subtest subtestAttributes
    subtest.save null,
      success: ->
        Tangerine.router.navigate "class/subtest/#{guid}", true
      error: ->
        alert "Please try again. There was a problem creating the new subtest."

  deleteCurriculum: ->
    if confirm("Delete curriculum\n#{@curriculum.get('name')}?")
      group = @curriculum.get("group")
      @curriculum.destroy => Tangerine.router.navigate "assessments/#{group}", true
          
      

  gotoEdit: (event) ->
    subtestId = $(event.target).attr("data-subtestId")
    Tangerine.router.navigate "class/subtest/#{subtestId}", true

  editInPlace: (event) ->

    $td = $(event.target)

    guid      = Utils.guid()

    previousHTML = $td.html()
    key          = $td.attr("data-key")
    subtest      = @subtests.get($td.attr("data-subtestId"))
    oldValue     = subtest.get(key)
    isNumber     = $td.attr("data-isNumber") == "true"

    #special case
    oldValue = oldValue.join " " if key == 'items'

    $td.html "<input id='#{guid}' value='#{oldValue}'>"

    $input = $("##{guid}")
    $input.focus()
    $input.on "blur keyup", (event) =>

      if event.which == 27 
        $input.off "blur keyup"
        $td.empty().html(previousHTML)
        return

      # act normal, unless it's an enter key
      return true if event.which != 13

      # escape if escape
      $input.off "blur keyup"

      newValue = $input.val()
      newValue = if isNumber then parseInt(newValue) else newValue

      #special case
      if key == "items"
        # clean whitespace, give reminder if tabs or commas found, convert back to array
        newValue = newValue.replace(/\s+/g, ' ')
        if /\t|,/.test(newValue) then alert "Please remember\n\nGrid items are space \" \" delimited"
        newValue = _.compact newValue.split(" ")



      # If there was a change
      if String(newValue) != String(oldValue)
        attributes = {}
        attributes[key] = newValue
        subtest.save attributes,
          success: =>
            $td.empty().html(oldValue)
            subtest.fetch 
              success: =>
                @updateTable()
          error: =>
            subtest.fetch 
              success: =>
                @updateTable()
                alert "Please try to save again, it didn't work that time."



  goBack: -> history.back()

  initialize: (options) ->
    
    # arguments
    @curriculum = options.curriculum
    @subtests = options.subtests
    
    # primaries
    @totalAssessments  = Math.max.apply Math, @subtests.pluck("part")
    @subtestsByPart    = @subtests.indexArrayBy "part"
    @subtestProperties = 
      [
        {
          "key"      : null
          "label"    : "Assessment"
          "editable" : true
        },
        {
          "key"      : "name"
          "label"    : "Name"
          "editable" : true
          "escaped"  : true
        },
        {
          "key"      : "items"
          "label"    : "Items"
          "count"    : true
          "editable" : true
        },
        {
          "key"      : "timer"
          "label"    : "Time<br>allowed"
          "editable" : true
        },
        {
          "key"      : "part"
          "label"    : "Assessment"
          "editable" : true
        },
        {
          "key"      : "reportType"
          "label"    : "Report"
          "editable" : true
        }
      ]

  updateTable: ->
    @$el.find("#subtest_table_container").html @getSubtestTable()

  getSubtestTable: ->
    
    html = "<table class='subtests'>"
      
      
    html += "
      <thead>
        <tr>
    "
    for prop in @subtestProperties
      html += "<th>#{prop.label}</th>"

    html += "
        </tr>
      </thead>
    "


    html += "
      <tbody>
    "
    @subtestsByPart = @subtests.indexArrayBy "part"
    for part, subtests of @subtestsByPart
      html += "<tr class='auto_fixed'><th>#{part}</th></tr>"

      for subtest in subtests


        html += "<tr>"
        for prop in @subtestProperties

          # cook the value
          value = if prop.key?   then subtest.get(prop.key)    else "&nbsp;"
          value = if prop.escape then subtest.escape(prop.key) else value
          value = value.length if prop.count?
          value = "" if not value?

          # what is it
          editOrNot   = if prop.editable && Tangerine.settings.context == "server" then "class='edit_in_place'" else ""

          numberOrNot = if _.isNumber(value) then "data-isNumber='true'" else "data-isNumber='false'" 

          html += "<td data-subtestId='#{subtest.id}' data-key='#{prop.key}' data-value='#{value}' #{editOrNot} #{numberOrNot}>#{value}</td>"

        # add buttons for serverside editing
        if Tangerine.settings.context == "server"
          html += "
            <td>
              <img class='link_icon edit' title='Edit' data-subtestId='#{subtest.id}' src='images/icon_edit.png'>
              <img class='link_icon delete_subtest' title='Delete' data-subtestId='#{subtest.id}' src='images/icon_delete.png'>
            </td>"

        html += "</tr>"

    html += "
      </tbody>
    </table>
    "

    return html


  render: ->

    subtestTable = @getSubtestTable()

    deleteButton = if Tangerine.settings.context == "server" then "<button class='command_red delete'>Delete</button>" else ""

    html = "

      <button class='navigation back'>#{t('back')}</button>
      <h1>#{@options.curriculum.get('name')}</h1>

      <div class='small_grey'>Download key <b>#{@curriculum.id.substr(-5,5)}</b></div>
      
      <div id='subtest_table_container'>
        #{subtestTable}
      </div>
      <button class='command new_subtest'>New Subtest</button>
      <br><br>
      
      #{deleteButton}


    "

    @$el.html html
    @trigger "rendered"
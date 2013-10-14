class AssessmentListElementView extends Backbone.View

  className : "AssessmentListElementView"

  tagName : "li"

  events: if Modernizr.touch then {
    'touchstart .assessment_menu_toggle'       : 'assessmentMenuToggle'
    'touchstart .admin_name'                   : 'assessmentMenuToggle'
    'touchstart .sp_assessment_delete'         : 'assessmentDeleteToggle'
    'touchstart .sp_assessment_delete_cancel'  : 'assessmentDeleteToggle'
    'touchstart .sp_assessment_delete_confirm' : 'assessmentDelete'
    'touchstart .sp_copy'                      : 'copyTo'
    'touchstart .sp_duplicate'                 : 'duplicate'
    'touchstart .sp_update'                    : 'update'
    'touchstart .sp_print'                     : 'togglePrint'
    'touchstart .archive'                      : 'archive'
    'touchstart a' : 'respondToLink'

    'change #print_format'             : 'print'
  } else {
    'click .assessment_menu_toggle'       : 'assessmentMenuToggle'
    'click .admin_name'                   : 'assessmentMenuToggle'
    'click .sp_assessment_delete'         : 'assessmentDeleteToggle'
    'click .sp_assessment_delete_cancel'  : 'assessmentDeleteToggle'
    'click .sp_assessment_delete_confirm' : 'assessmentDelete'
    'click .sp_copy'                      : 'copyTo'
    'click .sp_duplicate'                 : 'duplicate'
    'click .sp_update'                    : 'update'
    'click .sp_print'                     : 'togglePrint'
    'click .archive'                      : 'archive'

    'change #print_format'             : 'print'
  }

  blankResultCount: "-"

  initialize: (options) ->

    # events
    # options.model.on "resultCount", @updateResultCount

    #arguments
    @model    = options.model
    @parent   = options.parent

    # switches and things
    @isAdmin     = Tangerine.user.isAdmin()

  respondToLink: (event) ->
    $target = $(event.target)
    route   = $target.attr("href")
    Tangerine.router.navigate(route, true)


  duplicate: ->
    newName = "Copy of " + @model.get("name")
    @model.duplicate { name : newName }, null, null, (assessment) => 
      @model.trigger "new", assessment

  copyTo: (group) ->
    @model.replicate group, =>
      window.location = Tangerine.settings.urlIndex(group, "assessments")

  ghostLogin: =>
    Tangerine.user.ghostLogin Tangerine.settings.upUser, Tangerine.settings.upPass

  update: =>
    Utils.midAlert "Verifying connection"
    Utils.working true

    @model.verifyConnection
      error: =>
        Utils.working false
        Utils.midAlert "Verifying connection<br>Please retry update."
        _.delay =>
          @ghostLogin()
        , 5000

      success: =>
        Utils.working false
        @model.on "status", (message) =>
          if message == "import lookup"
            Utils.midAlert "Update starting"
          else if message == "import success"
            Utils.midAlert "Updated"
            Utils.working false
            @model.fetch
              success: =>
                @render()
          else if message == "import error"
            Utils.working false
            Utils.midAlert "Update failed"
        Utils.working true
        @model.updateFromServer()

  togglePrint: ->
    @$el.find(".print_format_wrapper").fadeToggle(150)

  print: ->
    format = @$el.find("#print_format option:selected").attr("data-format")

    if format == "cancel"
      @$el.find(".print_format_wrapper").fadeToggle 150, =>
        @$el.find("#print_format").val("reset")
      return

    Tangerine.router.navigate "print/#{@model.id}/#{format}", true


  updateResultCount: =>
    #@resultCount = Math.commas @model.resultCount
    #@$el.find(".result_count").html "Results <b>#{@resultCount}</b>" 

  archive: ->
    result = @$el.find(".archive :selected").val() == "true"
    if result == true
      @$el.find(".admin_name").addClass "archived_assessment"
    else
      @$el.find(".admin_name").removeClass "archived_assessment"
    
    @model.save
      archived : result
    return true

  assessmentMenuToggle: ->
    @$el.find('.assessment_menu_toggle').toggleClass('sp_down').toggleClass('sp_right')
    @$el.find('.assessment_menu').fadeToggle(250)

  assessmentDeleteToggle: ->
    @$el.find(".sp_assessment_delete_confirm").fadeToggle(250); false

  # deep non-gerneric delete
  assessmentDelete: =>
    # remove from collection
    @model.destroy()

  spriteListLink: ( tagName, names... ) ->
    result = ""
    for name in names
      result += "<#{tagName} class='sp_#{name.underscore()}'><a href='##{name}/#{@model.id}'>#{name.underscore().titleize()}</a></#{tagName}>"
    return result

  spriteEvents: ( tagName, names...) ->
    result = ""
    for name in names
      result += "<#{tagName}><div class='sp_#{name.underscore()}' title='#{name.underscore().titleize()}'>#{name.underscore().titleize()}</div></#{tagName}>"
    return result

  ul: (options)->
    
    html = "<ul #{if options.cssClass then "class='#{options.cssClass}'" else ''}>"
    html += @spriteListLink.apply @, ["li"].concat(options.links)
    html += options.other || ''
    html += "</ul>"

  render: ->

    isArchived = @model.getBoolean('archived')

    # do not display archived assessments for enumerators
    return if not @isAdmin and isArchived and Tangerine.settings.get("context") == "mobile"
    
    # commands

    # indicators and variables
    archiveClass     = if isArchived then " archived_assessment" else ""

    toggleButton     = "<div class='assessment_menu_toggle sp_right'><div></div></div>"
    name             = "<span class='name clickable'>#{@model.get('name')}</span>"
    adminName        = "<span class='admin_name clickable #{archiveClass}'>#{@model.get('name')}</span>"
    adminResultCount = "<label class='result_count small_grey no_help' title='Result count. Click to update.'>Results <b>#{@resultCount}</b></label>"
    resultCount      = "<span class='result_count no_help'>Results <b>#{@resultCount}</b></span>"
    selected         = " selected='selected'"

    deleteConfirm   = "<span class='sp_assessment_delete_confirm confirmation'><div class='menu_box'>Confirm <button class='sp_assessment_delete_yes command_red'>Delete</button> <button class='sp_assessment_delete_cancel command'>Cancel</button></div></span>"

    printSelector   = "
      <div class='print_format_wrapper confirmation'>
        <select id='print_format'>
        <option disabled='disabled' selected='selected' value='reset'>Select a print format</option>
        #{("<option data-format='#{format.key}'>#{format.name}</option>") for format in Tangerine.settings.config.get("printFormats")}
        <option data-format='cancel'>Cancel</option>
        </select>
      </div>
    "


    downloadKey   = "<li class='download_key small_grey'>Download key <b>#{@model.id.substr(-5,5)}</b></li>"
    archiveSwitch = "
      <select class='archive'>
        <option value='false' #{if isArchived then selected else ''}>Active</option>
        <option value='true'  #{if isArchived then selected else ''}>Archived</option>
      </select>
    "

    if @isAdmin && "server" is Tangerine.settings.get("context")
      # admin standard
      @$el.html "
        <div>
          #{toggleButton}
          #{adminName}
        </div>
        #{@ul
          cssClass : "assessment_menu"
          links : ["run", "dataEntry", "results", "edit", "sync", "print" ]
          other : @spriteEvents("li", "duplicate", "assessment_delete") + downloadKey
        }
        <div class='sub_menus'>
          #{deleteConfirm}
          #{printSelector}
        </div>
        "

    else if @isAdmin && "satellite" is Tangerine.settings.get("context")

      @$el.html "
        <div>
          #{toggleButton}
          #{adminName}
        </div>

        #{@ul 
          cssClass: "assessment_menu"
          links : ["run","results","edit","sync","print"]
          other : @spriteEvents("li", "duplicate", "assessment_delete") + downloadKey
        }
        <div class='sub_menus'>
          #{deleteConfirm}
          #{printSelector}
        </div>
      "
    

    else if @isAdmin
      @$el.html "
        <div>
          #{toggleButton}
          #{adminName}
        </div>
      " + @ul 
          cssClass: "assessment_menu"
          links : ["run","results","update","delete"]
          other : deleteConfirm

    
    else
      @$el.html "
        <div class='non_admin'>
          #{@spriteListLink("span",'run')}#{name} #{@spriteListLink("span",'results')}
        </div>
      "


    @trigger "rendered"

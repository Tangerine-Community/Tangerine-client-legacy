class KlassesView extends Backbone.View

  className : "KlassesView"

  events :
    'click .add'        : 'toggleAddForm'
    'click .cancel'     : 'toggleAddForm'
    'click .save'       : 'saveNewKlass'
    'click .goto_class' : 'gotoKlass'
    'click .curricula'  : 'gotoCurricula'
    'click .pull_data'  : 'pullData' 

  initialize: ( options ) ->
    @views = []
    @klasses   = options.klasses
    @curricula = options.curricula
    @teachers  = options.teachers
    
    @klasses.on "add remove change", @render

  pullData: ->
    @tablets = # if you can think of a better idea I'd like to see it
      checked    : 0
      complete   : 0
      successful : 0
      okCount    : 0
      ips        : []
      result     : 0
    Utils.midAlert "Please wait, detecting tablets."
    Utils.working true
    @randomIdDoc = hex_sha1(""+Math.random())
    Tangerine.$db.saveDoc 
      "_id" : @randomIdDoc
    ,
      success: (doc) =>
        @randomDoc = doc
        for local in [0..15]
          do (local) =>
            ip = Tangerine.settings.subnetIP(local)
            req = $.ajax
              url: Tangerine.settings.urlSubnet(ip)
              dataType: "jsonp"
              contentType: "application/json;charset=utf-8",
              timeout: 10000
            req.complete (xhr, error) =>
              @tablets.checked++
              if parseInt(xhr.status) == 200
                @tablets.okCount++
                @tablets.ips.push ip
              @updatePull()
      error: ->
        Utils.working false
        Utils.midAlert "Internal database error"

  updatePull: =>
    return if @tablets.checked < 16

    if @tablets.okCount > 1
      # -1 because one of them will be this computer
      @tablets.okCount--
      Utils.midAlert "Pulling from #{@tablets.okCount} tablets."
      for ip in @tablets.ips
        do (ip) =>
          # see if our random document is on the server we just found
          selfReq = $.ajax
            "url"         : Tangerine.settings.urlSubnet(ip) + "/" + @randomIdDoc
            "dataType"    : "jsonp"
            "timeout"     : 10000
            "contentType" : "application/json;charset=utf-8",
          selfReq.success (data, xhr, error) =>
            # if found self then do nothing
          selfReq.complete (xhr, error) => do (xhr) =>
            return if parseInt(xhr.status) == 200
            # if not, then we found another tablet
            viewReq = $.ajax
              "url"      : Tangerine.settings.urlSubnet(ip) + "/_design/tangerine/_view/byCollection"
              "dataType" : "jsonp"
              "contentType" : "application/json;charset=utf-8",
              "data"     : 
                include_docs : false
                keys : JSON.stringify(['result', 'klass', 'student','curriculum', 'teacher'])
            viewReq.success (data) =>
              docList = (datum.id for datum in data.rows)
              $.couch.replicate(
                Tangerine.settings.urlSubnet(ip),
                Tangerine.settings.urlDB("local"),
                  success:      =>
                    @tablets.complete++
                    @tablets.successful++
                    @updatePullResult()
                  error: (a, b) =>
                    @tablets.complete++
                    @updatePullResult()
                ,
                  doc_ids: docList
              )
    else
      Utils.working false
      Utils.midAlert "Cannot detect tablets"
      Tangerine.$db.removeDoc 
        "_id"  : @randomDoc.id
        "_rev" : @randomDoc.rev

  updatePullResult: =>
    if @tablets.complete == @tablets.okCount
      Utils.working false
      Utils.midAlert "Pull finished.<br>#{@tablets.successful} out of #{@tablets.okCount} successful.", 5000
      Tangerine.$db.removeDoc 
        "_id"  : @randomDoc.id
        "_rev" : @randomDoc.rev
      @klasses.fetch success: => @renderKlasses()

  gotoCurricula: ->
    Tangerine.router.navigate "curricula", true

  saveNewKlass: ->
    errors = []
    errors.push " - No school name." if $.trim(@$el.find("#school_name").val()) == ""
    errors.push " - No year."   if $.trim(@$el.find("#year").val())   == "" 
    errors.push " - No grade."  if $.trim(@$el.find("#grade").val())  == "" 
    errors.push " - No stream." if $.trim(@$el.find("#stream").val()) == "" 
    errors.push " - No curriculum selected." if @$el.find("#curriculum option:selected").val() == "_none" 
    
    
    if errors.length == 0
      teacherId = if Tangerine.user.has("teacherId")
        Tangerine.user.get("teacherId")
      else
        "admin"
      @klasses.create
        teacherId    : teacherId
        schoolName   : @$el.find("#school_name").val()
        year         : @$el.find("#year").val()
        grade        : @$el.find("#grade").val()
        stream       : @$el.find("#stream").val()
        curriculumId : @$el.find("#curriculum option:selected").attr("data-id")
        startDate    : (new Date()).getTime()
    else
      alert ("Please correct the following errors:\n\n#{errors.join('\n')}")

  gotoKlass: (event) ->
    Tangerine.router.navigate "class/edit/"+$(event.target).attr("data-id")

  toggleAddForm: ->
    @$el.find("#add_form, .add").toggle()
    if not Tangerine.user.isAdmin()
      schoolName = @teachers.get(Tangerine.user.get("teacherId")).get("school")
      @$el.find("#school_name").val(schoolName)
      @$el.find("#year").focus()
    else
      @$el.find("#school_name").focus()
    if @$el.find("#add_form").is(":visible") then @$el.find("#add_form").scrollTo()

  renderKlasses: ->
    @closeViews()

    $ul = $("<ul>").addClass("klass_list")
    for klass in @klasses.models
      view = new KlassListElementView
        klass      : klass
        curricula  : @curricula
      view.on "rendered", @onSubviewRendered
      view.render()
      @views.push view
      $ul.append view.el
    @$el.find("#klass_list_wrapper").empty()
    @$el.find("#klass_list_wrapper").append $ul

  onSubviewRendered: =>
    @trigger "subRendered"

  render: =>

    curriculaOptionList = "<option value='_none' disabled='disabled' selected='selected'>#{t('select a curriculum')}</option>"
    for curricula in @curricula.models
      curriculaOptionList += "<option data-id='#{curricula.id}'>#{curricula.get 'name'}</option>"

    adminPanel = "
      <h1>Admin menu</h1>
      <button class='pull_data command'>Pull data</button>
    " if Tangerine.user.isAdmin()


    @$el.html "
      #{adminPanel || ""}
      <h1>#{t('classes')}</h1>
      <div id='klass_list_wrapper'></div>

      <button class='add command'>#{t('add')}</button>
      <div id='add_form' class='confirmation'>
        <div class='menu_box'> 
          <div class='label_value'>
            <label for='school_name'>School name</label>
            <input id='school_name'>
          </div>
          <div class='label_value'>
            <label for='year'>School year</label>
            <input id='year'>
          </div>
          <div class='label_value'>
            <label for='grade'>#{t('grade')}</label>
            <input id='grade'>
          </div>
          <div class='label_value'>
            <label for='stream'>#{t('stream')}</label>
            <input id='stream'>
          </div>
          <div class='label_value'>
            <label for='curriculum'>#{t('curriculum')}</label><br>
            <select id='curriculum'>#{curriculaOptionList}</select>
          </div>
          <button class='command save'>#{t('save')}</button><button class='command cancel'>#{t('cancel')}</button>
        </div>
      </div>
      <button class='command curricula'>#{t('all curricula')}</button>
    "
    
    
    @renderKlasses()
    
    @trigger "rendered"

  closeViews: ->
    for view in @views?
      view.close()
    @views = []

  onClose: ->
    @closeViews()
class KlassesView extends Backbone.View

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
    
    @klasses.on "add remove change", @render

  pullData: ->
    @tablets =
      checked : 0
      okCount : 0
      ips     : []
      result  : 0
    Utils.midAlert "Please wait, detecting tablets."
    for local in [0..255]
      do (local) =>
        ip = Tangerine.settings.subnetIP(local)
        $.ajax
          url: Tangerine.settings.urlSubnet(ip)
          dataType: "jsonp"
          contentType: "application/json;charset=utf-8",
          timeout: 30000
          complete:  (xhr, error) =>
            @tablets.checked++
            if xhr.status == 200
              @tablets.okCount++
              @tablets.ips.push ip
            @updatePull()

    updatePull: ->
      return if @tablets.checked < 256

      if @available.tablets.okCount > 0
        Utils.midAlert "Pulling from #{@tablets.okCount} tablets."
        for ip in @tablets.ips
          do (ip) =>
            $.ajax
              "url"      : Tangerine.settings.urlSubnet(ip) + "_design/tangerine/_view/byCollection"
              "dataType" : "jsonp"
              "data"     : keys : JSON.stringify(['result', 'klass', 'student','curriculum'])
              success : (data) =>
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
        Utils.midAlert "Cannot detect tablets"
      return false

  updatePullResult: ->
    if @tablets.complete == @tablets.okCount
      Utils.midAlert "Pull finished.<br>#{@tablets.successful} out of #{tablets.okCount} successful.", 5000

  gotoCurricula: ->
    Tangerine.router.navigate "curricula", true

  saveNewKlass: ->
    errors = []
    errors.push " - No year."   if $.trim(@$el.find("#year").val())   == "" 
    errors.push " - No grade."  if $.trim(@$el.find("#grade").val())  == "" 
    errors.push " - No stream." if $.trim(@$el.find("#stream").val()) == "" 
    errors.push " - No curriculum selected." if @$el.find("#curriculum option:selected").val() == "_none" 
    
    
    if errors.length == 0
      @klasses.create
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
    @$el.find("#year").focus()
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
            <label for='year'>#{t('year')}</label>
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
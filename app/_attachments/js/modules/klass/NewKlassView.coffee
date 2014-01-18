class NewKlassView extends Backbone.View

  events :
    "click .klass_save"    : "save"
    "click .klass_cancel"  : "cancel"
    "change .klass_select" : "onSelectChange"

  initialize: (options) ->
    @[key] = value for key, value of options
    @klass = new Klass
    @result = new Result
    if @selector is true
      @updateSelector()

  onSelectChange: (event) ->
    $target = $(event.target)
    klassId = $target.val()
    @klass  = @klasses.get(klassId)
    @selected = true

  save: =>
 
    return @trigger("save") unless @inWorkflow

    ignored = "_rev _id collection editedBy hash updated".split(" ")
    @updateModel() unless @selected
    return if @errors? and @errors.length isnt 0
    klassAttributes = _(@klass.attributes).omit(ignored)
    console.log "saving these"
    console.log klassAttributes
    @result.save
      tripId     : @tripId
      workflowId : @workflowId
      subtestId  : @klass.id
      subtestData : [
        {
          prototype : "survey"
          data : klassAttributes
          timestamp : (new Date).getTime()
        }
      ]
    ,
      success: =>
        if @selected
          console.log "triggering subview done"
          @trigger "subViewDone"
        else
          @klass.save null,
            success: =>
              console.log "triggering save"
              @trigger "save"

  cancel: -> @trigger "cancel"

  collectionFilter: -> true # is overriden if supplied in options

  updateSelector: (options={}) ->
    @curricula = new Curricula()
    @curricula.fetch
      error: -> Utils.midAlert("Could not fetch available curricula.")
      success: =>

        @klasses = new Klasses()
        @klasses.fetch
          error: -> Utils.midAlert("Could not fetch collection of classes.")
          success: (collection) =>

            @klasses = new Klasses collection.filter @collectionFilter
            
            html = "
              <select id='#{@cid}_klass_select' class='klass_select'>
               <option selected='selected' disabled='disabled'>List of classes</option>
            "
            @klasses.each (klass) ->
              html += "<option value='#{klass.id}'>#{klass.get("schoolName")} - #{klass.get("year")} - #{klass.get("grade")} - #{klass.get("stream")}</option>"
            
            $("##{@cid}_klass_selector").html html

            options.success?()

  render: ->

    return @updateSelector( success: => @render()) unless @curricula?

    htmlSelector = "
      <div>
        <h2>Select class</h2>
        <div id='#{@cid}_klass_selector'></div>
      </div>
      <span class='centered'>or</span>
    "


    curriculaOptionList = "<option data-id='_none' disabled='disabled' selected='selected'>#{t('select a curriculum')}</option>"
    for curriculum in @curricula.models
      curriculaOptionList += "<option data-id='#{curriculum.id}'>#{curriculum.get 'name'}</option>"

    controls = "
      <button class='command klass_save'>Save</button><button class='command klass_cancel'>Cancel</button>
    "

    curriculum = "
          <div class='label_value'>
            <label for='curriculum'>#{t('curriculum')}</label><br>
            <select id='curriculum'>#{curriculaOptionList}</select>
          </div>
    " if @curriculumSelector


    @$el.html "
      #{htmlSelector || ''}
      <div>
        <h2>Create new class</h2>
        <div class='label_value'>
          <label for='zone'>Zone</label>
          <input id='zone'>
        </div>
        <div class='label_value'>
          <label for='school_name'>School name</label>
          <input id='school_name'>
        </div>
        <div class='label_value'>
          <label for='class'>Class</label>
          <input id='class'>
        </div>
        <div class='label_value'>
          <label for='year'>Year</label>
          <input id='year'>
        </div>
        <div class='label_value'>
          <label for='grade'>Grade</label>
          <input id='grade'>
        </div>
        <div class='label_value'>
          <label for='stream'>Stream</label>
          <input id='stream'>
        </div>
        <div class='label_value'>
          <label for='teacher'>Teacher</label>
          <input id='teacher'>
        </div>
        <div class='label_value'>
          <label for='books'>Book count</label>
          <input id='books'>
        </div>
        <div id='gps-container' class='GpsRunView'></div>
        #{curriculum || ''}
        #{controls || ''}
      </div>
    "

    @gpsView = new GpsRunView
    @gpsView.setElement @$el.find "#gps-container"
    @gpsView.render()

    @trigger "rendered"

  getResult: => @result

  getModel:  => @klass

  updateModel: =>

    zone       = $.trim(@$el.find("#zone").val())
    schoolName = $.trim(@$el.find("#school_name").val())
    sClass     = $.trim(@$el.find("#class").val())
    year       = $.trim(@$el.find("#year").val())
    grade      = $.trim(@$el.find("#grade").val())
    stream     = $.trim(@$el.find("#stream").val())
    teacher    = $.trim(@$el.find("#teacher").val())
    books      = $.trim(@$el.find("#books").val())

    curriculum = @$el.find("#curriculum option:selected").attr("data-id")

    gpsPosition = @gpsView?.getResult?() || {}

    @errors = []
    @errors.push " - No zone."                if _.isEmptyString zone
    @errors.push " - No school name."         if _.isEmptyString schoolName
    @errors.push " - No class."               if _.isEmptyString sClass
    @errors.push " - No year."                if _.isEmptyString year
    @errors.push " - No grade."               if _.isEmptyString grade
    @errors.push " - No stream."              if _.isEmptyString stream
    @errors.push " - No teacher."             if _.isEmptyString teacher
    @errors.push " - No book count."          if _.isEmptyString books

    @errors.push " - No curriculum selected." if curriculum == "_none" 
    
    for klass in @klasses.models
      if klass.get("year")   == year && 
         klass.get("grade")  == grade &&
         klass.get("stream") == stream
        @errors.push " - Duplicate year, grade, stream."

    if @errors.length isnt 0
      alert ("Please correct the following errors:\n\n#{@errors.join('\n')}")
      return

    teacherId = Tangerine.user.getString "teacherId", "admin"

    @klass.set
      zone         : zone
      schoolName   : schoolName
      sClass       : sClass
      year         : year
      grade        : grade
      stream       : stream
      teacher      : teacher
      books        : books
      gpsPosition  : gpsPosition
      curriculumId : @$el.find("#curriculum option:selected").attr("data-id")
      startDate    : (new Date()).getTime()

    return @klass

class NewKlassView extends Backbone.View

  events: ->
    "click .klass_save" : "save"
    "click .class_cancel" : "cancel"

  save   : -> @trigger "save"
  cancel : -> @trigger "cancel"

  collectionFilter: -> true # is overriden if supplied in options

  initialize: (options) ->
    @[key] = value for key, value of options

    if true#@selector is true
      @updateSelector()

  updateSelector: ->
    @curricula = new Curricula()
    @curricula.fetch
      error: -> Utils.midAlert("Could not fetch available curricula.")
      success: =>

        @collection = new Klasses()
        @collection.fetch
          error: -> Utils.midAlert("Could not fetch collection of classes.")
          success: (collection) =>

            @collection = new Klasses collection.filter @collectionFilter
            
            html = "
              <select id='#{@cid}_klass_select'>
            "
            @collection.each (klass) ->
              html += "<option value='#{klass.id}'>#{klass.get("schoolName")} - #{klass.get("year")} - #{klass.get("grade")} - #{klass.get("stream")}</option>"
            
            $("##{@cid}_klass_selector").html html

  render: ->
    

    htmlSelector = "
      <div>
        <h2>Select class</h2>
        <div id='#{@cid}_klass_selector'></div>
      </div>
      <span class='centered'>or</span>
    "


    curriculaOptionList = "<option data-id='_none' disabled='disabled' selected='selected'>#{t('select a curriculum')}</option>"
    for curricula in @curricula.models
      curriculaOptionList += "<option data-id='#{curricula.id}'>#{curricula.get 'name'}</option>"

    controls = "
      <button class='command klass_save'>Save</button><button class='command klass_cancel'>Cancel</button>
    "

    @$el.html "
      #{htmlSelector || ''}
      <div>
        <h2>Create new class</h2>
        <div class='label_value'>
          <label for='school_name'>School name</label>
          <input id='school_name'>
        </div>
        <div class='label_value'>
          <label for='year'>School year</label>
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
          <label for='curriculum'>Curiculum</label><br>
          <select id='curriculum'>#{curriculaOptionList}</select>
        </div>
        #{controls||''}
      </div>
    "

    @trigger "rendered"

  getModel: ->

    schoolName = $.trim(@$el.find("#school_name").val())
    year       = $.trim(@$el.find("#year").val())
    grade      = $.trim(@$el.find("#grade").val())
    stream     = $.trim(@$el.find("#stream").val())
    curriculum = @$el.find("#curriculum option:selected").attr("data-id")

    errors = []
    errors.push " - No school name."         if schoolName == ""
    errors.push " - No year."                if year       == "" 
    errors.push " - No grade."               if grade      == "" 
    errors.push " - No stream."              if stream     == "" 
    errors.push " - No curriculum selected." if curriculum == "_none" 
    
    for klass in @klasses.models
      if klass.get("year")   == year && 
         klass.get("grade")  == grade &&
         klass.get("stream") == stream
        errors.push " - Duplicate year, grade, stream."

    if errors.length == 0
      alert ("Please correct the following errors:\n\n#{errors.join('\n')}")
      return

    teacherId = Tangerine.user.getString "teacherId", "admin"

    return new Klass
      teacherId    : teacherId
      schoolName   : schoolName
      year         : year
      grade        : grade
      stream       : stream
      curriculumId : @$el.find("#curriculum option:selected").attr("data-id")
      startDate    : (new Date()).getTime()


class LocationRunView extends Backbone.View

  className: "LocationRunView"

  events:
    "click .school_list li" : "autofill"
    "keyup input"  : "showOptions"
    "click .clear" : "clearInputs"
    "change select" : "onSelectChange"

  initialize: (options) ->
    
    @model  = @options.model
    @parent = @options.parent
    
    @limit  = @options.limit

    @levels       = @model.get("levels")         || []
    @locationCols = @model.get("locationCols")  || []
    @locations    = @model.get("locations")      || []

    @selectedLocation = []

    @levels = @levels.slice(0, @limit) if @limit?

    if @levels.length == 1 && @levels[0] == ""
      @levels = []
    if @locationCols.length == 1 && @locationCols[0] == ""
      @locationCols = []
    if @locations.length == 1 && @locations[0] == ""
      @locations = []

    @levelColMap = []
    for level, i in @levels
      @levelColMap[i] = _.indexOf @locationCols, level
    @levelColMap = @levelColMap.slice(0, @limit) if @limit?

    #Push all locations oto the Haystack
    @haystack = []
    for location, i in @locations
      @haystack[i] = []
      for locationData in location
        @haystack[i].push locationData.toLowerCase()

    template = "<li data-index='{{i}}'>"
    for level, i in @levels
      template += "{{level_#{i}}}"
      template += " - " unless i == @levels.length-1
    template += "</li>"
    
    @li = _.template(template)

  clearInputs: ->
    @resetSelects(0)
    ""

  resetSelects: (index) ->
    for i in [index..@levels.length-1]
      @$el.find("#level_#{i}").html = "<option selected='selected' value='' disabled='disabled'>Please select a #{@levels[i]}</option>"
      @$el.find("#level_#{i}").val("")
      if i isnt 0 then @$el.find("#level_#{i}").attr("disabled", true)

  autofill: (event) ->
    @$el.find(".autofill").fadeOut(250)
    index = $(event.target).attr("data-index")
    location = @locations[index]
    for level, i in @levels
      @$el.find("#level_#{i}").val(location[i])


  showOptions: (event) ->
    needle = $(event.target).val().toLowerCase()
    field = parseInt($(event.target).attr('data-level'))
    # hide if others are showing
    for otherField in [0..@haystack.length]
      @$el.find("#autofill_#{otherField}").hide()

    atLeastOne = false
    results = []
    for stack, i in @haystack
      isThere = ~@haystack[i][field].indexOf(needle)
      results.push i if isThere
      atLeastOne = true if isThere
    
    for stack, i in @haystack
      for otherField, j in stack
        if j == field
          continue
        isThere = ~@haystack[i][j].indexOf(needle)
        results.push i if isThere && !~results.indexOf(i)
        atLeastOne = true if isThere
    
    if atLeastOne
      html = ""
      for result in results
        html += @getLocationLi result
      @$el.find("#autofill_#{field}").fadeIn(250)
      @$el.find("#school_list_#{field}").html html

    else
      @$el.find("#autofill_#{field}").fadeOut(250)

  getLocationLi: (i) ->
    templateInfo = "i" : i
    for location, j in @locations[i]
      templateInfo["level_" + j] = location
    return @li templateInfo

  render: ->
    schoolListElements = ""

    html = "
      <button class='clear command'>#{t('clear')}</button>
      "

    if @typed
      for level, i in @levels
        html += "
          <div class='label_value'>
            <label for='level_#{i}'>#{level}</label><br>
            <input data-level='#{i}' id='level_#{i}' value=''>
          </div>
          <div id='autofill_#{i}' class='autofill' style='display:none'>
            <h2>#{t('select one from autofill list')}</h2>
            <ul class='school_list' id='school_list_#{i}'>
            </ul>
          </div>
      "
    else
      for level, i in @levels
        levelOptions = @getOptions(i)

        isDisabled = i isnt 0 && "disabled='disabled'"

        html += "
          <div class='label_value'>
            <label for='level_#{i}'>#{level}</label><br>
            <select id='level_#{i}' data-level='#{i}' #{isDisabled||''}>
              #{levelOptions}
            </select>
          </div>
        "
    @$el.html html

    @trigger "rendered"
    @trigger "ready"

  onSelectChange: (event) ->
    $target = $(event.target)
    levelChanged = parseInt($target.attr("data-level"))
    newValue = $target.val()
    nextLevel = levelChanged + 1
    if levelChanged isnt @levels.length-1
      @resetSelects(nextLevel+1)
      @$el.find("#level_#{nextLevel}").removeAttr("disabled")
      @$el.find("#level_#{nextLevel}").html @getOptions(nextLevel)
      @selectedLocation = []
    else
      levelVals = []
      for level, i in @levels
        levelVals.push @$el.find("#level_#{i}").val()

      matchCount = 0
      expectedCount = levelVals.length
      levelColMap = @levelColMap
      @selectedLocation = _.find(@locations, (arr) ->
        matchCount = 0
        for level, i in levelVals
          if arr[levelColMap[i]] is levelVals[i] then matchCount += 1
        return matchCount == expectedCount
      )
    ""


  getOptions: (index)->

    targetIndex = @levelColMap[index]

    doneOptions = []
    currentOptions = []
    levelOptions = ''

    parentValues = []
    for i in [0..index]
      break if i is index
      parentValues.push @$el.find("#level_#{i}").val()

    for location, i in @locations

      unless ~doneOptions.indexOf location[targetIndex]

        isNotChild = index is 0
        isValidChild = true
        for i in [0..Math.max(index-1,0)]

          if parentValues[i] isnt location[@levelColMap[i]]
            isValidChild = false
            break

        if isNotChild or isValidChild

          doneOptions.push location[targetIndex]
          currentOptions.push _(location[targetIndex]).escape()
    

    for locationName in _.sortBy(currentOptions, (el) -> return el)
      levelOptions += "
        <option value='#{locationName}'>#{locationName}</option>
      "

    return "
      <option selected='selected' value='' disabled='disabled'>Please select a #{@levels[index]}</option>
    " + levelOptions



  getResult: (filtered = false)->
    if filtered
      return {
        "labels"   : (level.replace(/[\s-]/g,"_") for level in @levels)
        "location" : (@$el.find("#level_#{i}").val() for level, i in @levels)
      }
    else
      return {
        "labels"   : (column.replace(/[\s-]/g,"_") for column in @locationCols)
        "location" : (@selectedLocation)
      }

  getSkipped: ->
    return {
      "labels"   : (column.replace(/[\s-]/g,"_") for column in @locationCols)
      "location" : ("skipped" for locationCols in @locationCols)
    }


  isValid: ->
    @$el.find(".message").remove()
    inputs = @$el.find("input")
    selects = @$el.find("select")
    elements = if selects.length > 0 then selects else inputs
    for input, i in elements
      return false if _($(input).val()).isEmptyString()

    return false if @selectedLocation == []
    true

  showErrors: ->
    inputs = @$el.find("input")
    selects = @$el.find("select")
    elements = if selects.length > 0 then selects else inputs
    for input in elements
      if _($(input).val()).isEmptyString()
        $(input).after " <span class='message'>#{$('label[for='+$(input).attr('id')+']').text()} must be filled.</span>"

  getSum: ->
    counts =
      correct   : 0
      incorrect : 0
      missing   : 0
      total     : 0
      
    for input in @$el.find("input")
      $input = $(input)
      counts['correct']   += 1 if ($input.val()||"") != ""
      counts['incorrect'] += 0 if false
      counts['missing']   += 1 if ($input.val()||"") == ""
      counts['total']     += 1 if true

    return {
      correct   : counts['correct']
      incorrect : counts['incorrect']
      missing   : counts['missing']
      total     : counts['total']
    }

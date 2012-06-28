class LocationRunView extends Backbone.View

  events:
    "click #school_list li" : "autofill"
    "keyup input" : "showOptions"
    "click clear" : "clearInputs"

  initialize: (options) ->
    @model  = @options.model
    @parent = @options.parent
    @haystack = []
    @li = _.template "<li style='display:none;' data-index='{{i}}'>{{province}} - {{name}} - {{district}} - {{id}}</li>"
    for school, i in @model.get "schools"
      @haystack[i] = school.join("").toLowerCase()

  clearInputs: ->
    @$el.find("#school_id, #district, #province, #name").val("")

  autofill: (event) ->
    @$el.find("#autofill").fadeOut(250)
    index = $(event.target).attr("data-index")
    school = @model.get("schools")[index]
    name     = school[2]
    district = school[1]
    id       = school[3]
    province = school[0]
    @$el.find("#school_id").val(id)
    @$el.find("#district").val(district)
    @$el.find("#province").val(province)
    @$el.find("#name").val(name)

  showOptions: (event) ->
    needle = $(event.target).val().toLowerCase()
    atLeastOne = false
    for li, i in $("#school_list li")
      isThere = ~@haystack[i].indexOf(needle)
      $(li).css("display", "block") if     isThere
      $(li).css("display", "none")  if not isThere
      atLeastOne = true if isThere
    
    @$el.find("#autofill").fadeIn(250)  if     atLeastOne
    @$el.find("#autofill").fadeOut(250) if not atLeastOne
    
    return true

  render: ->
    provinceText = @model.get "provinceText"
    districtText = @model.get "districtText"
    nameText     = @model.get "nameText"
    schoolIdText = @model.get "schoolIdText"

    schoolListElements = ""

    for school, i in @model.get "schools"
      schoolListElements += @li
        i        : i
        province : school[0]
        district : school[1]
        name     : school[2]
        id       : school[3]

    @$el.html "
    <form>
      <div class='label_value'>
        <label for='province'>#{provinceText}</label>
        <input id='province' name='province' value=''>
      </div>
      <div class='label_value'>
        <label for='district'>#{districtText}</label>
        <input id='district' name='district' value=''>
      </div>
      <div class='label_value'>
        <label for='name'>#{nameText}</label>
        <input id='name' name='name' value=''>
      </div>
      <div class='label_value'>
        <label for='school_id'>#{schoolIdText}</label>
        <input id='school_id' name='school_id' value=''>
      </div>
      <button class='clear command'>Clear</button>
    <form>
    <div id='autofill' style='display:none'>
      <h2>Select one from autofill list</h2>
      <ul id='school_list'>
        #{schoolListElements}
      </ul>
    </div>
    "

    @trigger "rendered"

  isValid: ->
    @$el.find(".message").remove()
    for input in @$el.find("input")
      return false if $(input).val() == ""
    true

  showErrors: ->
    for input in @$el.find("input")
      if $(input).val() == ""
        $(input).after " <span class='message'>#{$('label[for='+$(input).attr('id')+']').text()} cannot be empty</span>"

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
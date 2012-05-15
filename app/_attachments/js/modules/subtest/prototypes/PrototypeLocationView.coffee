class PrototypeLocationView extends Backbone.View

  initialize: (options) ->
    @model  = @options.model
    @parent = @options.parent
  
  
  render: ->
    
    provinceText = @model.get "provinceText"
    districtText = @model.get "districtText"
    nameText     = @model.get "nameText"
    schoolIdText = @model.get "schoolIdText"
    
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
    <form>
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
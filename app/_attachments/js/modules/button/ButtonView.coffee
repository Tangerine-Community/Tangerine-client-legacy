class ButtonView extends Backbone.View
  
  className : "ButtonView"

  events : 
      if Modernizr.touch
        "click .button"           : "onClick"
        "change .answer_selector" : "onChange"
      else
        "touchstart .button"      : "onClick"
        "change .answer_selector" : "onChange"

  onChange: (event) ->
    value = _.map($(event.target).find("option:selected"), (x) -> $(x).attr('data-answer'))

  onClick : (event) ->

    $target = $(event.target  )

    value         = $target.attr('data-value')
    checkedBefore = $target.hasClass("selected")

    if @mode == "hybrid"

      @$el.find(".button").removeClass "selected"

      if not checkedBefore
        $target.addClass "selected"
        @answer = ""
      else
        @answer = value

    else if @mode == "single"

      @$el.find(".button").removeClass "selected"

      $target.addClass "selected"
      @answer = value

    else if @mode == "multiple"

      @answer = {} if not _.isObject(@answer)

      if checkedBefore
        $target.removeClass "selected"
      else 
        $target.addClass "selected"

      @answer[value] =
        if checkedBefore
          "checked"
        else
          "unchecked"



  initialize : ( options ) ->
    @mode    = options.mode
    @options = options.options
    @answer  = {}

  render : ->

    if @options.length < 8 && @mode != "multiple"

      htmlOptions = ""

      for option, i in @options

        styleClass = 
          if i == 0
            "left"
          else if i == @options.length-1
            "right"
          else
            ""

        value = option.value
        label = option.label

        htmlOptions += "<div class='button #{styleClass}' data-value='#{value}'>#{label}</div>" 

    else

      selectMultiple = 
        if @mode == "multiple"
          "multiple='multiple'"
        else
          ''

      firstOption =
        if @mode != "multiple"
          "<option data-answer='NONE' selected='selected'>Please select an answer</option>"
        else
          ""

      htmlOptions = "
        <select class='answer_selector' #{selectMultiple}>
          #{firstOption}
          #{("<option data-answer='#{option.value}'>#{option.label}</option>" for option in @options).join('')}
        </select>
      " if Tangerine.settings.get("context") == "server"

    @$el.html("
      #{htmlOptions}
    ").addClass(@className) # Why do I have to do this?

    @trigger "rendered"


class ButtonView extends Backbone.View

  className : "ButtonView"

  events : 
    if Modernizr.touch
      "click .button" : "onClick"
    else
      "click .button" : "onClick"

  onChange: (event) ->

    value = _.map($(event.target).find("option:selected"), (x) -> $(x).attr('data-answer'))
    @trigger "change", @el

  onClick: (event) ->
    event.preventDefault()

    $target = $(event.target)

    value         = $target.attr('data-value')
    checkedBefore = $target.hasClass("selected")

    if @mode is "hybrid"

      @$el.find(".button").removeClass "selected"

      if not checkedBefore
        $target.addClass "selected"
        @answer = ""
      else
        @answer = value

    else if @mode is "single"

      @$el.find(".button").removeClass "selected"

      $target.addClass "selected"
      @answer = value

    else if @mode is "multiple"

      if checkedBefore
        $target.removeClass "selected"
      else 
        $target.addClass "selected"

      @answer[value] =
        if checkedBefore
          "unchecked"
        else
          "checked"

    @trigger "change", @el

  initialize: ( options ) ->
    @mode       = options.mode
    @options    = options.options
    @dataEntry  = options.dataEntry
    @fontFamily = options.fontFamily

    if options.answer?
      @answer = options.answer
    else
      @answer = "" if @mode is "single" or @mode is "open"
      if @mode is "multiple"
        @answer = {}
        for option in @options
          @answer[option.value] = "unchecked"

  render : ->

    fontStyle = "style=\"font-family: #{@fontFamily} !important;\"" if @fontFamily isnt "" 

    data = null

    htmlOptions = ""

    for option, i in @options

      styleClass = 
        if i is 0
          "left"
        else if i is @options.length-1
          "right"
        else
          ""

      value = option.value
      label = option.label

      if data != null
        if @mode is "multiple"
          answerValue = data[@parent.name][value]
          selectedClass =
            if answerValue is "checked"
              "selected"
            else
              ""
          # Special case for displaying results for "single" mode, since the actual value is not saved.
        else if @mode is "single"
          answerValue = data[@parent.name]
          selectedClass =
            if answerValue is value
              "selected"
            else
              ""
      else
        selectedClass =
          if @mode is "multiple" and @answer[value] is "checked"
            "selected"
          else if @mode is "single" and @answer is value
            "selected"
          else
            ""


      htmlOptions += "<button class='button #{styleClass} #{selectedClass}' #{fontStyle||''} data-value='#{value}'>#{label}</button>"

    @$el.html("
      #{htmlOptions}
    ").addClass(@className) # Why do I have to do this?

    @trigger "rendered"


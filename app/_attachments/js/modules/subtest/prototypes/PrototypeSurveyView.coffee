class PrototypeSurveyView extends Backbone.View

  initialize: (options) ->
    @model         = @options.model
    @parent        = @options.parent
    @questionViews = []
    @questions     = []
    questions      = new Questions
    questions.fetch
      success: (collection) =>
        filteredCollection = collection.where { subtestId : @model.id }
        @questions = new Questions filteredCollection
        @render()

  isValid: ->
    @names = {}
    @filled = {}

    for field in @$el.find("input:radio, input:checkbox")
      @names[$(field).attr("name")]  = 1
      @filled[$(field).attr("name")] = 1 if $(field).is(":checked")

    for field in $("textarea")
      @names[$(field).attr('name')] = 1
      @filled[$(field).attr('name')] = 1 if $(field).val() != "" 

    if _.keys(@names).length != _.keys(@filled).length then return false

    true
    

  getResult: ->
    result = {}
    for p in @$el.find("input:radio, input:checkbox")
      point = $(p)
      if result[point.attr("name")]?
          if point.is(":checked")
            result[point.attr("name")][point.val()] = "checked"
          else
            result[point.attr("name")][point.val()] = "unchecked"
      else
          result[point.attr("name")] = {}
          if point.is(":checked")
            result[point.attr("name")][point.val()] = "checked"
          else
            result[point.attr("name")][point.val()] = "unchecked"

    for p in @$el.find("textarea")
      point = $(p)
      result[point.attr('name')] = point.val()
    result

  getSum: ->
    counts =
      correct   : 0
      incorrect : 0
      missing   : 0
      total     : 0

    for p in @$el.find("input:radio, input:checkbox, textarea")
      $p = $(p)
      counts['correct']   += 1 if ($p.val() == "1" || $p.val() == "correct")
      counts['incorrect'] += 1 if ($p.val() == "0" || $p.val() == "incorrect")
      counts['missing']   += 1 if (($p.val()||"") == "" ||
                                    $p.val()      == "99" ||
                                    $p.val()      == "9" ||
                                    $p.val()      == "8" ||
                                    $p.val() == ".")
      counts['total']     += 1 if true

    return {
      correct :   counts['correct']
      incorrect : counts['incorrect']
      missing :   counts['missing']
      total :     counts['total']
    }

  showErrors: ->
    @$el.find('.message').remove()

    filledKeys = _.keys @filled
    first = true
    for key, value of @names
      if !~filledKeys.indexOf(key)
        $input = @$el.find("input[name='#{key}']")
        if first
          $input.parent().scrollTo()
          first = false
        $input.parent().prepend("<div class='message'>Please select one</div>")
        
    if _.keys(@names).length != _.keys(@filled).length
      Utils.midAlert "Please fill in all questions"

  render: ->
    @resetViews()
    @$el.html "<form>"
    if @questions.models?
      for question in @questions.models
        # skip the rest if score not high enough
        required = parseInt(question.get("linkedGridScore")) || 0
        if (required != 0 && @parent.getGridScore() < required)
          @$el.append "<input type='hidden' name='#{question.get 'name'}' value='not_asked'>"
        else
          oneView = new QuestionView 
            model : question
            parent : @
          oneView.render()
          @questionViews.push oneView
          @$el.append oneView.el

    @$el.append "</form>"
    @trigger "rendered"
      
  onClose:->
    @resetViews()
  
  resetViews:->
    for qv in @questionViews
      qv.close()
    @questionViews = []

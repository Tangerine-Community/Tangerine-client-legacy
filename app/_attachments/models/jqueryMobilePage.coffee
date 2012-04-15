footerMessage = "Good effort, let's go onto the next page"

# This disables the "Go" button from submitting the form on Android keyboards
$('form').live 'submit', (event,ui) ->
  return false

$('button:contains(Skip assessment)').live 'click', (event,ui) ->
  page = $.assessment.currentPage
  page.nextPage.render()
  page.lastResult = {skipped: true}

class JQueryMobilePage
  # TODO convert all subclassed classes to use the options constructor, get rid of deserialize, load, etc.
  constructor: (options) ->
    @pageId = options?.pageId || ""
    @pageType = options?.pageType || this.constructor.toString().match(/function +(.*?)\(/)[1]
    @allowSkip = options?.allowSkip? && options.allowSkip

  render: ->
    @assessment.currentPage = this
    $('div#content').html(JQueryMobilePage.template(this))
    $("##{@pageId}").trigger("pageshow")
    window.scrollTo(0,0)
    _.each $('button:contains(Next)'), (button) =>
      new MBP.fastButton button, =>
        @renderNextPage()

    $(".enumerator-help").wrapInner("<div/>")
    $(".enumerator-help").prepend("<div class='enumerator-help-header'>Help</div>")
    $(".enumerator-help").accordion
      collapsible: true
      active: false

  renderNextPage: ->
    validationResult = @validate()
    unless validationResult is true
      $("##{@pageId} div.validation-message").html("").stop(true,true).show().html(validationResult).fadeOut(5000)
      return
    @results() # Saves the current result to @lastResult
    @nextPage.render()

  #url: ->
  #  return "#{@urlScheme}://#{@urlPath}"

  propertiesForSerialization: -> [
    "pageId"
    "pageType"
    "urlPath"
    "urlScheme"
  ]

  name: ->
    # Insert spaces and do proper casing
    @pageId.underscore().titleize()

  toJSON: ->
    object = {}
    for property in @propertiesForSerialization()
      object[property] = this[property]
    return object

  load: (data) ->
    for property in @propertiesForSerialization()
      this[property] = data[property]

  save: ->
    switch @urlScheme
      when "localstorage"
        return @saveToLocalStorage()
      else
        throw "URL type not yet implemented: #{@urlScheme}"

  saveToLocalStorage: ->
    throw "Can't save page '#{@pageId}' to localStorage: No urlPath!" unless @urlPath?
    localStorage[@urlPath] = JSON.stringify(this)

  saveToCouchDB: (callback) ->
    @loading = true
    @urlScheme = "http"
    @urlPath = @urlPath.substring(@urlPath.indexOf("/")+1)
    url = $.couchDBDatabasePath + @urlPath
    $.ajax
      url: url,
      async: true,
      type: 'PUT',
      dataType: 'json',
      data: JSON.stringify(this),
      success: (result) =>
        @revision = result.rev
      error: ->
        throw "Could not PUT to #{url}"
      complete: =>
        @loading = false
        callback() if callback?

  deleteFromLocalStorage: ->
    localStorage.removeItem(@urlPath)

  deleteFromCouchDB: ->
    url =  @urlPath + "?rev=#{@revision}"
    $.ajax
      url: url
      type: 'DELETE',
      complete: ->
        callback() if callback?
      error: ->
        throw "Error deleting #{url}"

  toPaper: ->
    @content

#TODO Fix this
# Should not need these separate deserialize just use the last generic one and the constructor
JQueryMobilePage.deserialize = (pageObject) ->
  switch pageObject.pageType
    when "UntimedSubtest"
      return UntimedSubtest.deserialize(pageObject)
    when "UntimedSubtestLinked"
      return UntimedSubtestLinked.deserialize(pageObject)
    when "PhonemePage"
      return PhonemePage.deserialize(pageObject)
    else
      if not window[pageObject.pageType]? then throw new Error "Subtest type '#{pageObject.pageType}' does not exist"
      result = new window[pageObject.pageType](pageObject)
      result.load(pageObject)
      return result

JQueryMobilePage.loadFromLocalStorage = (urlPath) ->
  jqueryMobilePage = JQueryMobilePage.deserialize(JSON.parse(localStorage[urlPath]))
  jqueryMobilePage.urlScheme = "localstorage"
  return jqueryMobilePage

JQueryMobilePage.loadFromHTTP = (options, callback) ->
  throw "Must pass 'url' option to loadFromHTTP, received: #{options}" unless options.url?
  if options.url.match(/http/)
    urlPath = options.url.substring(options.url.lastIndexOf("://")+3)
  else
    urlPath = Utils.cleanURL options.url

  $.ajax $.extend options,
    type     : 'GET'
    dataType : 'json'
    success  : (result, a, b) ->
      jqueryMobilePage = $.extend JQueryMobilePage.deserialize(result),
        urlPath   : urlPath
        urlScheme : "http"
        revision  : result._rev
      callback jqueryMobilePage
    error    : ->
      throw new Error "Subtest '#{urlPath}' failed to load."



JQueryMobilePage.loadFromCouchDB = (urlPath, callback) ->
  return JQueryMobilePage.loadFromHTTP({url:$.couchDBDatabasePath+urlPath}, callback)

JQueryMobilePage.template = Handlebars.compile "
<div data-role='page' id='{{{pageId}}'>
  <div data-role='header'>
    <h1>{{name}}</h1>
  </div><!-- /header -->
  <div data-role='content'>	
    {{#if allowSkip}}
      <button>Skip assessment</button>
    {{/if}}
    {{{controls}}}
    {{{content}}}
  </div><!-- /content -->
  <div data-role='footer'>
    <div class='validation-message'></div>
    {{footerMessage}}
    <button href='\#{{nextPage}}'>Next</button>
  </div><!-- /footer -->
</div><!-- /page -->
"

class AssessmentPage extends JQueryMobilePage
  addTimer: (options) ->
    @timer = new Timer
      page: this
      startTime: options.seconds
      onStop: options.onStop

##
# By default we expect all input fields to be filled
##
  validate: ->
    for inputElement in $("div##{@pageId} form input")
      if $(inputElement).val() == ""
        return "'#{$("label[for="+inputElement.id+"]").html()}' is empty"
    return true

  results: ->
    unless @assessment.currentPage.pageId == @pageId
      return @lastResult
    @lastResult = null

    objectData = {}
    $.each $("div##{@pageId} form").serializeArray(), () ->
      if this.value?
        value = this.value
      else
        value = ''

      if objectData[this.name]?
        unless objectData[this.name].push
          objectData[this.name] = [objectData[this.name]]

        objectData[this.name].push value
      else
        objectData[this.name] = value

    @lastResult = objectData
    return @lastResult

AssessmentPage.validateCurrentPageUpdateNextButton = ->
  return unless $.assessment?
  passedValidation = ($.assessment.currentPage.validate() is true)
  $("div##{$.assessment.currentPage.pageId} button:contains(Next)").toggleClass("passedValidation", passedValidation)

setInterval(AssessmentPage.validateCurrentPageUpdateNextButton, 800)

# Show validation errors in a dialog page
$('div.ui-footer button').live 'click', (event,ui) ->
  validationResult = $.assessment.currentPage.validate()
  if validationResult is true
    button = $(event.currentTarget)
    $.mobile.changePage(button.attr("href"))
  else
    $("#_infoPage div[data-role='content']").html(
      "Please fix the following before proceeding:<br/>" +
      validationResult
    )
    $.mobile.changePage("#_infoPage")

class StudentInformationPage extends AssessmentPage
  constructor: (options) ->
    super(options)
    @questions = options.questions ? options.radioButtons
    @enumeratorHelp = options.enumeratorHelp
    @studentDialog = options.studentDialog
    # Create some id friendly attributes
    for question in @questions
      question.name = question.label.replace(/[^a-zA-Z0-9]/g," ").toLowerCase().dasherize()
      if question.options?
        question.options = for option in question.options
          {
            id : question.name + "-"+ option.toLowerCase().dasherize()
            label: option
          }
    if options.timer
      @includeTimer = true
      @addTimer
        seconds: options.timer
        onStop: ->
          $.assessment.flash()
    @content = StudentInformationPage.template(this)
        


  validate: ->
    names = ($(fieldset).attr("data-name") for fieldset in $("div##{@pageId} form fieldset"))
    for name in names
      question = $("input[name=#{name}]")
      continue if question.attr("type") == 'text' and question.val() != ""
      unless question.is(":checked")
        return $("input[name=#{name}]").first().parent().find("legend").html() + " is not complete"
    return true

StudentInformationPage.template = Handlebars.compile "
  <div class='enumerator-help'>{{enumeratorHelp}}</div>
  <div class='student-dialog'>{{{studentDialog}}}</div>
  {{#if includeTimer}}
    <div class='timer'>
      <button class='timer-button'>start</button>
      <button class='timer-button'>stop</button>
      <span class='timer-seconds'></span>
    </div>

  {{/if}}
  <form>
    {{#questions}}
      <fieldset data-name='{{name}}' data-type='{{orientation}}' data-role='controlgroup'>
        <legend>{{label}}</legend>
        {{#if options}}
          {{#options}}
            <label for='{{id}}'>{{label}}</label>
            <input type='radio' name='{{../name}}' value='{{label}}' id='{{id}}'></input>
          {{/options}}
        {{else}}
          <input type='{{type}}' name='{{../name}}' id='{{id}}'></input>
        {{/if}}
      </fieldset>
    {{/questions}}
  </form>
"
class SchoolPage extends AssessmentPage
  constructor: (options) ->
    super(options)
    @schools = options.schools
    @selectNameText = options.selectNameText

    #TODO change these to be generic eg level1, level2 or something
    properties = ["name","district","province","schoolId"]
  
    # Load from the object
    for property in properties
      this[property + "Text"] = options[property + "Text"]

    listAttributes = ""
    for dataAttribute in properties
      listAttributes += "data-#{dataAttribute}='{{#{dataAttribute}}}' "

    listElement = "<li style='display:none' #{listAttributes}>{{district}} - {{province}} - {{name}}</li>"

    inputElements = ""
    for dataAttribute in properties
      inputElements += "
      <div data-role='fieldcontain'>
        <label for='#{dataAttribute}'>{{#{dataAttribute}Text}}</label>
        <input type='text' name='#{dataAttribute}' id='#{dataAttribute}'></input>
      </div>
      "

    template = "
      <div>
        <h4>
          {{selectSchoolText}}
        </h4>
      </div>
      <form id='{{pageId}}-form'>
        #{inputElements}
      </form>
      <ul>
        {{#schools}}
          #{listElement}
        {{/schools}}
      </ul>
    "
    @schoolTemplate = Handlebars.compile template

    @content = @schoolTemplate(this)

    $("div##{@pageId} form##{@pageId}-form input").live "propertychange keyup input paste", (event) =>
      currentName = $(event.target).val()
      for school in $("div##{@pageId} li")
        school = $(school)
        school.hide()
        school.show() if school.html().match(new RegExp(currentName, "i"))

    $("div##{@pageId} li").live "click", (eventData) =>
      $(school).hide() for school in $ "div##{@pageId} li"
      selectedElement = $(eventData.currentTarget)
      for dataAttribute in ["name","province","district","schoolId"]
        $("div##{@pageId} form input##{dataAttribute}").val(selectedElement.attr("data-#{dataAttribute}"))

  propertiesForSerialization: ->
    properties = super()
    properties.push("schools")
    properties.push("selectNameText")
    properties.push(property+"Text") for property in ["name","province","district","schoolId"]
    return properties



  validate: ->
    for inputElement in $("div##{@pageId} form input")
      if $(inputElement).val() == ""
        return "'#{$("label[for="+inputElement.id+"]").html()}' is empty"
    return true

SchoolPage.deserialize = (pageObject) ->
  schoolPage = new SchoolPage(pageObject)
  schoolPage.load(pageObject)
  schoolPage.content = schoolPage.template(schoolPage._schoolTemplate(),schoolPage)
  return schoolPage

#TODO Internationalize
class DateTimePage extends AssessmentPage

  load: (data) ->
    dateTime = new Date()
    year = dateTime.getFullYear()
    month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][dateTime.getMonth()]
    day = dateTime.getDate()
    minutes = dateTime.getMinutes()
    minutes = "0" + minutes if minutes < 10
    time = dateTime.getHours() + ":" + minutes
    $('input#student-id').live "change", ->
      $("#student-id-message").html ""
      $('input#student-id').val $('input#student-id').val().toUpperCase()

      isValid = Checkdigit.isValidIdentifier($('input#student-id').val())
      $("#student-id-message").html(isValid) unless isValid == true
    $('button:contains(Create New ID)').live "click", ->

      $("#student-id-message").html ""
      $('#student-id').val Checkdigit.randomIdentifier()

    @content = "
      <form>
        <div data-role='fieldcontain'>
          <label for='student-id'>Student Identifier</label>
          <input type='text' name='student-id' id='student-id' />
          <div id='student-id-message'></div>
          <button style='display:block' type='button'>Create New ID</button>
        </div>
        <div data-role='fieldcontain'>
          <label for='year'>Year:</label>
          <input type='number' name='year' id='year' value='#{year}' />
        </div>
        <div data-role='fieldcontain'>
          <label for='month'>Month:</label>
          <input type='text' name='month' id='month' value='#{month}'/>
        </div>
        <div data-role='fieldcontain'>
          <label for='day'>Day:</label>
          <input type='number' name='day' id='day' value='#{day}' />
        </div>
        <div data-role='fieldcontain'>
          <label for='time'>Time:</label>
          <input type='text' name='time' id='time' value='#{time}' />
        </div>
      </form>
      "

  validate: ->
    isValid = Checkdigit.isValidIdentifier($('input#student-id').val())
    return isValid unless isValid == true
    if isValid then $("#current-student-id").html($('input#student-id').val())
    super()

#TODO Internationalize
class StudentIdPage extends AssessmentPage

  load: (data) ->
    dateTime = new Date()
    year = dateTime.getFullYear()
    month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][dateTime.getMonth()]
    day = dateTime.getDate()
    minutes = dateTime.getMinutes()
    minutes = "0" + minutes if minutes < 10
    time = dateTime.getHours() + ":" + minutes

    @content = "
      <form class='student_id_page'>
        <div>
          <label for='student_id'>Student Identifier</label>
          <input type='text' name='student_id' id='student_id'>
        </div>
        <div>
          <label for='year'>Year</label>
          <input type='number' name='year' id='year' value='#{year}'>
        </div>
        <div>
          <label for='month'>Month</label>
          <input type='text' name='month' id='month' value='#{month}'>
        </div>
        <div>
          <label for='day'>Day</label>
          <input type='number' name='day' id='day' value='#{day}'>
        </div>
        <div>
          <label for='time'>Time</label>
          <input type='text' name='time' id='time' value='#{time}'>
        </div>
      </form>
      "

  validate: ->
    $("#current-student-id").html($('input#student_id').val())
    super()

class ResultsPage extends AssessmentPage
  constructor: (options) ->
    super(options)
    @content = Handlebars.compile "
      <div class='message'>
        You have finished assessment <span class='randomIdForSubject'></span>. Thank the child with a small gift. Please write <span class='randomIdForSubject'></span> on the writing sample.
      </div>
      <div data-role='collapsible' data-collapsed='true' class='results'>
        <h3>Results</h3>
        <div>
        </div>
        <form>
          <label for='comment'>Comments (if any):</label>
          <textarea style='width:80%' id='comment' name='resultComment'></textarea>
        </form>
      </div>
      <div id='result_message'>
      </div>
      <div id='result_controls'>
        <button type='button' id='save_results_button'>Save Results</button>
      </div>
    "

  load: (data) ->
    super(data)

    $("div##{@pageId}").live "pageshow", =>

      $("div##{@pageId} div span[class='randomIdForSubject']").html $("#current-student-id").text()

      $("button:contains(Next)").hide()

      Tangerine.resultView ?= new ResultView()
      Tangerine.resultView.model = new Result($.assessment.results())
      $("div##{@pageId} div[data-role='content'] div.results div").html Tangerine.resultView.render()
      $('.sparkline').sparkline 'html',
        type:'pie'
        sliceColors:['black','#F7C942','orangered']

      $("#save_results_button").live "click", ->
        $.assessment.saveResults (model, results) =>
          $("#results_message").html "Results Saved"
          $("#save_results_button").hide()
          $("#result_controls").html "<button id='another_assessment'>Start another assessment</button>"

      $('#another_assessment').live "click", ->
        location.reload(true)

class TextPage extends AssessmentPage
  propertiesForSerialization: ->
    properties = super()
    properties.push("content")
    return properties

class ConsentPage extends TextPage
  constructor: (options) ->
    super(options)
    $('#save-reset').live "click", ->
      $.assessment.saveResults()
      $.assessment.reset()
      

  validate: ->
    if $("div##{@pageId} input#consent-yes:checked").length > 0
      return true
    else if $("div##{@pageId} input#consent-no:checked").length > 0
      return "Click to confirm that the child has not consented <button id='save-reset'>Confirm</button>"
    else
      return "You must answer the consent question"



class UntimedSubtest extends AssessmentPage
  constructor: (options) ->
    @questions = options.questions
    @answerOptions = options.answerOptions ? ["Correct", "Incorrect", "No response"]
    super(options)
    @footerMessage = footerMessage
    @content = "
      <div class='enumerator-help'>#{options.enumeratorHelp}</div>
      <div class='student-dialog'>#{options.studentDialog}</div>
      <form>" + (for question,index in @questions
        questionSanitized = question.replace(/[^a-zA-Z0-9]/g," ").toLowerCase().dasherize()
        "
        <div data-role='fieldcontain'>
            <fieldset data-role='controlgroup' data-type='horizontal'>
              <legend>#{question}</legend>
        " +
        (for answer in @answerOptions
          answerSanitized = answer.replace(/[^a-zA-Z0-9]/g," ").toLowerCase().dasherize()
          "
          <label for='#{questionSanitized}-#{answerSanitized}'>#{answer}</label>
          <input type='radio' data-question-index='#{index}' name='#{questionSanitized}' id='#{questionSanitized}-#{answerSanitized}' value='#{answer}' />
          "
        ).join("") +
        "
            </fieldset>
        </div>
        "
      ).join("") + "</form>"

  propertiesForSerialization: ->
    properties = super()
    properties.push("questions")
    return properties

  validate: ->
    if _.size(@results()) == @questions.length
      return true
    else "Only #{_.size(@results())} out of the #{@questions.length} questions were answered"


UntimedSubtest.deserialize = (pageObject) ->
  untimedSubtest = new UntimedSubtest(pageObject)
  untimedSubtest.load(pageObject)
  return untimedSubtest

class UntimedSubtestLinked extends UntimedSubtest
  constructor: (options) ->
    @linkedToPageId = options.linkedToPageId
    @questionIndices = options.questionIndices
    @footerMessage = footerMessage
    super(options)

    linkedPageName = @linkedToPageId.underscore().titleize()
    @content += "<div id='#{@pageId}-not-enough-progress-message' style='display:hidden'>Not enough progress was made on #{linkedPageName} to show questions from #{@name()}. Continue by pressing Next.</div>"

    $("##{@pageId}").live 'pageshow', (eventData) =>
      attemptedOnLinkedPage = $.assessment.result(@linkedToPageId).attempted
      @numberInputFieldsShown = 0
      for inputElement,index in $("##{@pageId} input[type='radio']")
        if attemptedOnLinkedPage < @questionIndices[$(inputElement).attr("data-question-index")]
          $(inputElement).parents("div[data-role='fieldcontain']").hide()
        else
          $(inputElement).parents("div[data-role='fieldcontain']").show()
          @numberInputFieldsShown++
      $("div##{@pageId}-not-enough-progress-message").toggle(@numberInputFieldsShown == 0)

      

  propertiesForSerialization: ->
    properties = super()
    properties = properties.concat(["questions","linkedToPageId","questionIndices"])
    return properties

  validate: ->
    # Each question has three radio buttons, so divide by 3
    numberOfQuestionsShown = @numberInputFieldsShown / 3

    numberOfQuestionsAnswered = _.size(@results())
    if numberOfQuestionsAnswered == numberOfQuestionsShown
      return true
    else "Only #{numberOfQuestionsAnswered} out of the #{numberOfQuestionsShown} questions were answered"


UntimedSubtestLinked.deserialize = (pageObject) ->
  untimedSubtest = new UntimedSubtestLinked(pageObject)
  untimedSubtest.load(pageObject)
  return untimedSubtest



class PhonemePage extends AssessmentPage
  constructor: (@words) ->
    super()
    @subtestId = "phonemic-awareness"
    @footerMessage = footerMessage
    phonemeIndex = 1
    @content = "<form id='#{@subtestId}'>" + (for item,index in @words
      wordName = "#{@subtestId}.#{item.word}.identified-number"
      "
      <div data-role='fieldcontain'>
          <fieldset data-role='controlgroup' data-type='horizontal'>
            <legend>#{item["word"]}</legend>
            <fieldset data-role='controlgroup' data-type='horizontal'>
              <legend>Number of phonemes: #{item["number-of-sounds"]}</legend>
      " +
      (for answer in ["Correct", "Incorrect"]
        "
        <label for='#{wordName}-#{answer}'>#{answer}</label>
        <input type='radio' name='#{wordName}' id='#{wordName}-#{answer}' value='#{answer}' />
        "
      ).join("") +
      "
        </fieldset>
        <fieldset data-role='controlgroup' data-type='horizontal'>
          <legend>Phonemes identified</legend>
      " +
      (for phoneme in item["phonemes"]
        phonemeName = "#{@subtestId}.#{item.word}.phoneme-#{phoneme}"
        "
            <label for='#{phonemeName}'>#{phoneme}</label>
            <input type='checkbox' name='#{phonemeName}' id='#{phonemeName}' value='Correct'/>
        "
      ).join("") +  "
            </fieldset>
          </fieldset>
      </div>
      "
    ).join("") + "</form>"

  propertiesForSerialization: ->
    properties = super()
    properties.push("words")
    return properties

  results: ->
    unless @assessment.currentPage.pageId == @pageId
      return @lastResult
    @lastResult = null
    @lastResult = $("form##{@subtestId}").toObject({skipEmpty:false})

    return @lastResult

  validate: ->
    return true
    results = @results()
    for item,index in @words
      unless results[@subtestId + "-number-phonemes" + (index+1)]?
        return "You must select Correct or Incorrect for item ##{index+1}: <b>#{item["word"]}</b>"
    return true


PhonemePage.deserialize = (pageObject) ->
  page = new PhonemePage(pageObject.words)
  page.load(pageObject)
  return page


class ToggleGridWithTimer extends AssessmentPage
  constructor: (options) ->
    # TODO switch to use items instead of letters
    @letters = options.items ? options.letters
    if options?.numberOfColumns
      @numberOfColumns = options.numberOfColumns
    else
      if @letters.length > 80
        @numberOfColumns = 10
      else
        @numberOfColumns = 5

    if options.includeAutostop?
      @includeAutostop = options.includeAutostop
    else
      @includeAutostop = true

    @autostopAmount = options.autostopAmount || @letters.length/10

    @footerMessage = footerMessage
    super(options)
    @addTimer
      seconds: options?.seconds || 60
      onStop: ->
        $('input[name=mode][value=last-item]').prop('checked', true)
        $.assessment.flash()

    result = "<table><tr>"
    for letter,index in @letters
      result += "<td class='grid columns-#{@numberOfColumns}'><span class='grid-text' >#{letter}</span></td>"
      if ((index+1) % @numberOfColumns == 0)
        result += "<td class='toggle-row grid #{"toggle-row-portrait" unless ((index+1) % @numberOfColumns == 0)}'><span class='grid-text '>*</span></td></tr><tr>"
    result += "</tr></table>"

    @content =  "
      <div class='enumerator-help'>#{options.enumeratorHelp}</div>
      <div class='student-dialog'>#{options.studentDialog}</div>
      <div class='timer'>
        <button class='timer-button'>start</button><span class='timer-seconds'></span>
      </div>
      <div class='toggle-grid-with-timer' data-role='content'>
        <form>
          <div class='grid-width'>
            #{result}
          </div>
        </form>
      </div>
      <small>
      <fieldset data-type='horizontal'>
        <legend>Mode</legend>
        <label for='correctIncorrectMode'>Correct/Incorrect</label><input id='correctIncorrectMode' name='mode' type='radio' value='correct-incorrect' checked='true'>
        <label for='lastItemMode'>Last Item</label><input id='lastItemMode' name='mode' type='radio' value='last-item'>
      </fieldset>
      </small>
      <div class='timer'>
        <button class='timer-button'>stop</button><span class='timer-seconds'></span>
      </div>
      <button>reset timer</button>
      <span id='confirm-reset' style='display:none;padding:5px;background-color:red;border:solid 1px'>Are you sure?<button>Yes, reset</button><button>No</button></span>
      "
    
    
    $("##{@pageId}").live "pageshow", (eventData) =>
      # Start with first grid, downsize each grid until it fits. Then set all to new size
      gridWidth = $("##{@pageId} .grid:first").width()
      fontSize = $("##{@pageId} .grid:first span").css('font-size')
      fontSize = fontSize.substr(0,fontSize.indexOf("px")) # Strip the px
      for letterSpan in $("##{@pageId} .grid span")
        letterSpan = $(letterSpan)
        letterSpan.css('font-size', "#{fontSize}px")
        safetyCounter = 0
        while letterSpan.width() > gridWidth and safetyCounter < 100
          letterSpan.css('font-size', "#{fontSize--}px")
          safetyCounter++
      $("##{@pageId} .grid span").css('font-size', "#{fontSize}px")

    # Use the right event type for touchscreens vs mouse
    selectEvent = if ('ontouchstart' of document.documentElement) then "touchstart" else "click"

    $("##{@pageId} button:contains(reset timer)").live selectEvent, (eventData) =>
      $("#confirm-reset").stop(true,true).show().fadeOut(5000)

    $("##{@pageId} button:contains(No)").live selectEvent, (eventData) =>
      $("#confirm-reset").hide()

    $("##{@pageId} button:contains(Yes, reset)").live selectEvent, (eventData) =>
      $('input[name=mode][value=correct-incorrect]').prop('checked', true)
      @wasReset = true
      @timer.stop()
      @timer.reset()
      $("#confirm-reset").hide()

    $("##{@pageId} .grid").live selectEvent, (eventData) =>
      return unless @timer.started
      target = $(eventData.currentTarget)
      if $('input[name=mode]:checked').val() == "last-item"
        return if target.hasClass("toggle-row")
        for gridItem,index in $("##{@pageId} .grid:not(.toggle-row)")
          lastSelectedIndex = index if $(gridItem).hasClass("selected")
          lastAttemptedIndex = index if gridItem == eventData.currentTarget
        return if lastAttemptedIndex < lastSelectedIndex
        $("##{@pageId} .grid").removeClass('last-attempted')
        target.toggleClass('last-attempted')
      else
        for gridItem,index in $("##{@pageId} .grid:not(.toggle-row)")
          lastAttemptedIndex = index if $(gridItem).hasClass("last-attempted")
          lastSelectedIndex = index if gridItem == eventData.currentTarget
        return if lastAttemptedIndex < lastSelectedIndex
        target.toggleClass("selected")

    $("##{@pageId} .grid.toggle-row").live selectEvent, (eventData) =>
      toggleRow = $(eventData.currentTarget)
      for gridItem in toggleRow.prevAll()
        gridItem = $(gridItem)
        break if gridItem.hasClass("toggle-row") and gridItem.css("display") != "none"
        # We want to be able to handle mistaken rowtoggles - so keep track of what was already selected so we can revert
        if toggleRow.hasClass("selected")
          # Need to turn everthing on
          gridItem.addClass("selected rowtoggled") unless gridItem.hasClass("selected")
        else
          # Need to turn off only non toggled
          gridItem.removeClass("selected rowtoggled") if gridItem.hasClass("rowtoggled")

  results: ->
    unless @assessment.currentPage.pageId == @pageId
      return @lastResult

    @lastResult = {}

    # Check if the first 10% are all wrong, if so auto_stop
    items = $("##{@pageId} .grid:not(.toggle-row)")
    @autoStopItems = items[0..@autostopAmount-1]
    if @includeAutostop and _.select(@autoStopItems, (item) -> $(item).hasClass("selected")).length == @autostopAmount
      @lastResult.auto_stop = true
      # Only set do this stuff the first time
      unless @autostop
        $(_.last(@autoStopItems)).toggleClass("last-attempted", true)
        @timer.stop()
        $.assessment.flash()
        @autostop = true
    else
      @autostop = false

    @lastResult.was_reset = true if @wasReset?
    @lastResult.time_remain = @timer.seconds
    return @lastResult unless @timer.hasStartedAndStopped() #optimization
    @lastResult.items = new Array()
    # Initialize to all wrong
    @lastResult.items[index] = false for gridItem,index in $("##{@pageId} .grid:not(.toggle-row)")
    @lastResult.attempted = null
    for gridItem,index in $("##{@pageId} .grid:not(.toggle-row)")
      gridItem = $(gridItem)
      @lastResult.items[index] = true unless gridItem.hasClass("selected")
      if gridItem.hasClass("last-attempted")
        @lastResult.attempted = index + 1
        if @autostop
          $(".validation-message").html("First #{@autostopAmount} incorrect - autostop.")
        else
          $(".validation-message ").html("")
        return @lastResult
      else
        $(".validation-message ").html("Select last item attempted")

    return @lastResult

  validate: ->
    results = @results()
    if results.time_remain == 60 or results.time_remain == undefined
      return "The timer must be started"
    if @timer.running
      return "The timer is still running"
    if results.time_remain == 0
      return true
    else if results.attempted?
      return true
    else
      return "The last letter attempted has not been selected"


class Dictation extends AssessmentPage
  constructor: (options) ->
    @message = options.message
    @footerMessage = footerMessage
    super(options)

    @content =  "#{@message}<br/><input name='result' type='text'></input>"

  propertiesForSerialization: ->
    properties = super()
    properties.push("message")
    return properties

  results: ->
    unless @assessment.currentPage.pageId == @pageId
      return @lastResult

    @lastResult = {}
    enteredData = $("div##{@pageId} input[type=text]").val()

    if enteredData.match(/boys/i)
      @lastResult["Wrote boys correctly"] = 2
    else
      if enteredData.match(/bo|oy|by/i)
        @lastResult["Wrote boys correctly"] = 1

    if enteredData.match(/bikes/i)
      @lastResult["Wrote bikes correctly"] = 2
    else
      if enteredData.match(/bi|ik|kes/i)
        @lastResult["Wrote bikes correctly"] = 1

    numberOfSpaces = enteredData.split(" ").length - 1
    if numberOfSpaces >= 8
      @lastResult["Used appropriate spacing between words"] = 2
    else
      if numberOfSpaces > 3 and numberOfSpaces < 8
        @lastResult["Used appropriate spacing between words"] = 1
      else
        @lastResult["Used appropriate spacing between words"] = 0

    # TODO
    @lastResult["Used appropriate direction of text (left to right)"] = 2

    if enteredData.match(/The/)
      @lastResult["Used capital letter for the word 'The'"] = 2
    else
      @lastResult["Used capital letter for the word 'The'"] = 0

    if enteredData.match(/\. *$/)
      @lastResult["Used full stop (.) at end of sentence."] = 2
    else
      @lastResult["Used full stop (.) at end of sentence."] = 0
    return @lastResult

  validate: ->
    return true

Dictation.deserialize = (pageObject) ->
  dictationPage = new Dictation(pageObject)
  dictationPage.load(pageObject)
  return dictationPage

class Interview extends AssessmentPage
  constructor: (options) ->
    @questions = options.questions
    super(options)
    for question in @questions
      question.options = _.map(question.options, (option) ->
        text: option
        id: (question.name + "-" + option.replace(/[^a-zA-Z0-9]/g,"")).toLowerCase()
      )
      if question.onChange?
        question.onChange = Handlebars.compile(question.onChange)(question)
    @content = Interview.template(this)

  validate: ->
    names = ($(fieldset).attr("data-name") for fieldset in $("div##{@pageId} form fieldset"))
    for name in names
      question = $("input[name=#{name}]")
      continue if question.attr("type") == 'text' and question.val() != ""
      unless question.is(":checked")
        return $("input[name=#{name}]").first().parent().find("legend").html() + " is not complete"
    return true

#TODO add support for onchange
Interview.template = Handlebars.compile "
  <form>
    {{#questions}}
      <fieldset data-name='{{name}}' {{#if onChange}}onChange=\"{{{onChange}}}\"{{/if}}   data-type='{{type}}' data-role='controlgroup'>
        <legend>{{label}}</legend>
        {{#options}}
          <label for='{{id}}'>{{text}}</label>
          <input type='{{#if ../multiple}}checkbox{{else}}radio{{/if}}' name='{{../name}}' value='{{text}}' id='{{id}}'></input>
        {{/options}}
      </fieldset>
    {{/questions}}
  </form>
"

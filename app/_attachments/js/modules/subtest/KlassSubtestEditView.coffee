class KlassSubtestEditView extends Backbone.View

  className: "subtest_edit"

  events :
    'click .back_button'  : 'goBack'
    'click .save_subtest' : 'save'
    'blur #subtest_items' : 'cleanWhitespace'

  cleanWhitespace: ->
    @$el.find("#subtest_items").val( @$el.find("#subtest_items").val().replace(/\s+/g, ' ') )

  onClose: ->
    @prototypeEditor.close?()

  initialize: ( options ) ->
    @model      = options.model
    @curriculum = options.curriculum
    @config     = Tangerine.templates.get "subtest"

    @prototypeViews  = Tangerine.config.get "prototypeViews"
    @prototypeEditor = new window[@prototypeViews[@model.get 'prototype']['edit']]
      model: @model
      parent: @
    @prototypeEditor.on "edit-save", => @save options:editSave:true
      
  goBack: =>
    history.back()

  save: (event) ->

    @model.save
      name           : @$el.find("#name").val()
      part           : parseInt( @$el.find("#part").val() )
      reportType     : @$el.find("#report_type").val()
      itemType       : @$el.find("#item_type").val()
      scoreTarget    : @$el.find("#score_target").val()
      scoreSpread    : @$el.find("#score_spread").val()
      order          : @$el.find("#order").val()

      endOfLine : @$el.find("#end_of_line input:checked").val() == "true"
      randomize : @$el.find("#randomize input:checked").val() == "true"
      timer     : parseInt( @$el.find("#subtest_timer").val() )
      items     : _.compact( @$el.find("#subtest_items").val().split(" ") ) # mild sanitization, happens at read too
      columns   : parseInt( @$el.find("#subtest_columns").val() )
    ,
      success: =>
        Utils.midAlert "Subtest Saved"
      error: =>
        Utils.midAlert "Save error"

  render: ->

    curriculumName = @curriculum.escape "name"
    name           = @model.escape "name"
    part           = @model.getNumber "part"
    reportType     = @model.escape "reportType"
    itemType       = @model.escape "itemType"

    scoreTarget    = @model.getNumber "scoreTarget"
    scoreSpread    = @model.getNumber "scoreSpread"
    order          = @model.getNumber "order"

    endOfLine    = if @model.has("endOfLine") then @model.get("endOfLine") else true
    randomize    = if @model.has("randomize") then @model.get("randomize") else false

    items        = @model.get("items").join " "
    timer        = @model.get("timer")        || 0
    columns      = @model.get("columns")      || 0


    @$el.html "
      <button class='back_button navigation'>Back</button><br>
      <h1>Subtest Editor</h1>
      <table class='basic_info'>
        <tr>
          <th>Curriculum</th>
          <td>#{curriculumName}</td>
        </tr>
      </table>

      <button class='save_subtest command'>Done</button>

      <div class='label_value'>
        <label for='name'>Name</label>
        <input id='name' value='#{name}'>
      </div>

      <div class='label_value'>
        <label for='report_type'>Report Type</label>
        <input id='report_type' value='#{reportType}'>
      </div>

      <div class='label_value'>
        <label for='item_type'>Item Type</label>
        <input id='item_type' value='#{itemType}'>
      </div>

      <div class='label_value'>
        <label for='part'>Assessment Number</label><br>
        <input type='number' id='part' value='#{part}'>
      </div>

      <div class='label_value'>
        <label for='score_target'>Target score</label><br>
        <input type='number' id='score_target' value='#{scoreTarget}'>
      </div>

      <div class='label_value'>
        <label for='score_spread'>Score spread</label><br>
        <input type='number' id='score_spread' value='#{scoreSpread}'>
      </div>

      <div class='label_value'>
        <label for='order'>Order</label><br>
        <input type='number' id='order' value='#{order}'>
      </div>

      <div class='label_value'>
        <label for='subtest_items' title='These items are space delimited. Pasting text from other applications may insert tabs and new lines. Whitespace will be automatically corrected.'>Grid Items</label>
        <textarea id='subtest_items'>#{items}</textarea>
      </div>

      <label>Randomize items</label><br>
      <div class='menu_box'>
        <div id='randomize' class='buttonset'>
          <label for='randomize_true'>Yes</label><input name='randomize' type='radio' value='true' id='randomize_true' #{'checked' if randomize}>
          <label for='randomize_false'>No</label><input name='randomize' type='radio' value='false' id='randomize_false' #{'checked' if not randomize}>
        </div>
      </div><br>

      <label>Mark entire line button</label><br>
      <div class='menu_box'>
        <div id='end_of_line' class='buttonset'>
          <label for='end_of_line_true'>Yes</label><input name='end_of_line' type='radio' value='true' id='end_of_line_true' #{'checked' if endOfLine}>
          <label for='end_of_line_false'>No</label><input name='end_of_line' type='radio' value='false' id='end_of_line_false' #{'checked' if not endOfLine}>
        </div>
      </div>

      <div class='label_value'>
        <label for='subtest_columns' title='Number of columns in which to display the grid items.'>Columns</label><br>
        <input id='subtest_columns' value='#{columns}' type='number'>
      </div>

      <div class='label_value'>
        <label for='subtest_timer' title='Seconds to give the child to complete the test. Setting this value to 0 will make the test untimed.'>Timer</label><br>
        <input id='subtest_timer' value='#{timer}' type='number'>
      </div>

      <button class='save_subtest command'>Done</button>
      "

    @trigger "rendered"


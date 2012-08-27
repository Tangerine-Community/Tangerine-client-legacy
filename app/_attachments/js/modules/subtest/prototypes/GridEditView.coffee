class GridEditView extends Backbone.View

  events:
    'blur #subtest_items' : 'cleanWhitespace'

  cleanWhitespace: ->
    @$el.find("#subtest_items").val( @$el.find("#subtest_items").val().replace(/\s+/g, ' ') )

  initialize: ( options ) ->
    @model = options.model

  save: ->
    # validation can be done on models, perhaps there is a better palce to do it
    if /\t|,/.test(@$el.find("#subtest_items").val()) then alert "Please remember\n\nGrid items are space \" \" delimited"

    @model.set
      captureMinuteItem: @$el.find("#capture_minute_item input:checked").val() == "true"
      randomize: @$el.find("#randomize input:checked").val() == "true"
      timer    : parseInt( @$el.find("#subtest_timer").val() )
      items    : _.compact( @$el.find("#subtest_items").val().split(" ") ) # mild sanitization, happens at read too
      columns  : parseInt( @$el.find("#subtest_columns").val() )
      autostop : parseInt( @$el.find("#subtest_autostop").val() )
      variableName : @$el.find("#subtest_variable_name").val().replace(/\s/g, "_").replace(/[^a-zA-Z0-9_]/g,"")


  render: ->
    timer        = @model.get("timer") || 0
    items        = @model.get("items").join " "
    columns      = @model.get("columns") || 0
    autostop     = @model.get("autostop") || 0
    variableName = @model.get("variableName") || ""
    randomize    = if @model.has("randomize") then @model.get("randomize") else false
    minuteItem   = if @model.has("captureMinuteItem") then @model.get("captureMinuteItem") else false


    @$el.html "
      <div class='label_value'>
        <label for='subtest_variable_name'>Variable name</label>
        <input id='subtest_variable_name' value='#{variableName}'>
      </div>
      <div class='label_value'>
        <label for='subtest_items' title='These items are space delimited. Pasting text from other applications may insert tabs and new lines. Whitespace will be automatically corrected.'>Grid Items</label>
        <textarea id='subtest_items'>#{items}</textarea>
      </div>

      <div class='label_value'>
        <label>Randomize items</label><br>
        <div class='menu_box'>
          <div id='randomize' class='buttonset'>
            <label for='randomize_true'>Yes</label><input name='randomize' type='radio' value='true' id='randomize_true' #{'checked' if randomize}>
            <label for='randomize_false'>No</label><input name='randomize' type='radio' value='false' id='randomize_false' #{'checked' if not randomize}>
          </div>
        </div>
        <br>
        <label>Capture item at 60 seconds</label><br>
        <div class='menu_box'>
          <div id='capture_minute_item' class='buttonset'>
            <label for='capture_minute_item_true'>Yes</label><input name='capture_minute_item' type='radio' value='true' id='capture_minute_item_true' #{'checked' if minuteItem}>
            <label for='capture_minute_item_false'>No</label><input name='capture_minute_item' type='radio' value='false' id='capture_minute_item_false' #{'checked' if not minuteItem}>
          </div>
        </div>
      </div>

      <div class='label_value'>
        <label for='subtest_columns'>Columns</label>
        <input id='subtest_columns' value='#{columns}' type='number'>
      </div>
      <div class='label_value'>
        <label for='subtest_autostop'>Autostop</label>
        <input id='subtest_autostop' value='#{autostop}' type='number'>
      </div>
      <div class='label_value'>
        <label for='subtest_timer'>Timer</label>
        <input id='subtest_timer' value='#{timer}' type='number'>
      </div>"
    
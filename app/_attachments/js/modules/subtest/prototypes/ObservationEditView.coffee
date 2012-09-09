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
      timer        : parseInt( @$el.find("#subtest_timer").val() )
      items        : @$el.find("#subtest_items").val().split("")
      variableName : @$el.find("#subtest_variable_name").val().replace(/\s/g, "_").replace(/[^a-zA-Z0-9_]/g,"")


  render: ->
    timer        = @model.get("timer") || 0
    columns      = @model.get("columns") || 0
    variableName = @model.get("variableName") || ""

    @$el.html "
      <div class='label_value'>
        <label for='subtest_variable_name'>Variable name</label>
        <input id='subtest_variable_name' value='#{variableName}'>

        <br>

        <label>Capture item at specified number of seconds</label><br>
        <div class='menu_box'>
          <div id='capture_item_at_time' class='buttonset'>
            <label for='capture_item_at_time_true'>Yes</label><input name='capture_item_at_time' type='radio' value='true' id='capture_item_at_time_true' #{'checked' if captureItemAtTime}>
            <label for='capture_item_at_time_false'>No</label><input name='capture_item_at_time' type='radio' value='false' id='capture_item_at_time_false' #{'checked' if not captureItemAtTime}>
          </div>
          <div class='label_value'>
            <label for='capture_after_seconds' title='After this number of seconds has passed the enumerator will be instructed to mark the item currently being attempted, and then resume.'>Seconds</label>
            <input id='capture_after_seconds' value='#{captureAfterSeconds}' type='number'>
          </div>
        </div>

        <br>

        <label>Capture last item attempted</label><br>
        <div class='menu_box'>
          <div id='capture_last_attempted' class='buttonset'>
            <label for='capture_last_attempted_true'>Yes</label><input name='capture_last_attempted' type='radio' value='true' id='capture_last_attempted_true' #{'checked' if captureLastAttempted}>
            <label for='capture_last_attempted_false'>No</label><input name='capture_last_attempted' type='radio' value='false' id='capture_last_attempted_false' #{'checked' if not captureLastAttempted}>
          </div>
        </div>

        <br>

        <label>Mark entire line button</label><br>
        <div class='menu_box'>
          <div id='end_of_line' class='buttonset'>
            <label for='end_of_line_true'>Yes</label><input name='end_of_line' type='radio' value='true' id='end_of_line_true' #{'checked' if endOfLine}>
            <label for='end_of_line_false'>No</label><input name='end_of_line' type='radio' value='false' id='end_of_line_false' #{'checked' if not endOfLine}>
          </div>
        </div>


      </div>

      <div class='label_value'>
        <label for='subtest_columns' title='Number of columns in which to display the grid items.'>Columns</label>
        <input id='subtest_columns' value='#{columns}' type='number'>
      </div>
      <div class='label_value'>
        <label for='subtest_autostop' title='Number of incorrect items in a row from the beginning, after which, the test automatically stops. If the item that triggered the autostop was an enumerator error, the enumerator has 3 seconds to undo any incorrect item and resume the test. Otherwise, the test is stopped but may still be reset completely.'>Autostop</label>
        <input id='subtest_autostop' value='#{autostop}' type='number'>
      </div>
      <div class='label_value'>
        <label for='subtest_timer' title='Seconds to give the child to complete the test. Setting this value to 0 will make the test untimed.'>Timer</label>
        <input id='subtest_timer' value='#{timer}' type='number'>
      </div>"
    
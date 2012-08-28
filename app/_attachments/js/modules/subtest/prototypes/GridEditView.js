var GridEditView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

GridEditView = (function(_super) {

  __extends(GridEditView, _super);

  function GridEditView() {
    GridEditView.__super__.constructor.apply(this, arguments);
  }

  GridEditView.prototype.events = {
    'blur #subtest_items': 'cleanWhitespace'
  };

  GridEditView.prototype.cleanWhitespace = function() {
    return this.$el.find("#subtest_items").val(this.$el.find("#subtest_items").val().replace(/\s+/g, ' '));
  };

  GridEditView.prototype.initialize = function(options) {
    return this.model = options.model;
  };

  GridEditView.prototype.save = function() {
    if (/\t|,/.test(this.$el.find("#subtest_items").val())) {
      alert("Please remember\n\nGrid items are space \" \" delimited");
    }
    return this.model.set({
      captureLastAttempted: this.$el.find("#capture_last_attempted input:checked").val() === "true",
      endOfLine: this.$el.find("#end_of_line input:checked").val() === "true",
      captureItemAtTime: this.$el.find("#capture_item_at_time input:checked").val() === "true",
      captureAfterSeconds: parseInt(this.$el.find("#capture_after_seconds").val()),
      randomize: this.$el.find("#randomize input:checked").val() === "true",
      timer: parseInt(this.$el.find("#subtest_timer").val()),
      items: _.compact(this.$el.find("#subtest_items").val().split(" ")),
      columns: parseInt(this.$el.find("#subtest_columns").val()),
      autostop: parseInt(this.$el.find("#subtest_autostop").val()),
      variableName: this.$el.find("#subtest_variable_name").val().replace(/\s/g, "_").replace(/[^a-zA-Z0-9_]/g, "")
    });
  };

  GridEditView.prototype.render = function() {
    var autostop, captureAfterSeconds, captureItemAtTime, captureLastAttempted, columns, endOfLine, items, randomize, timer, variableName;
    timer = this.model.get("timer") || 0;
    items = this.model.get("items").join(" ");
    columns = this.model.get("columns") || 0;
    autostop = this.model.get("autostop") || 0;
    variableName = this.model.get("variableName") || "";
    randomize = this.model.has("randomize") ? this.model.get("randomize") : false;
    captureItemAtTime = this.model.has("captureItemAtTime") ? this.model.get("captureItemAtTime") : false;
    captureAfterSeconds = this.model.has("captureAfterSeconds") ? this.model.get("captureAfterSeconds") : 0;
    captureLastAttempted = this.model.has("captureLastAttempted") ? this.model.get("captureMinuteItem") : true;
    endOfLine = this.model.has("endOfLine") ? this.model.get("endOfLine") : true;
    return this.$el.html("      <div class='label_value'>        <label for='subtest_variable_name'>Variable name</label>        <input id='subtest_variable_name' value='" + variableName + "'>      </div>      <div class='label_value'>        <label for='subtest_items' title='These items are space delimited. Pasting text from other applications may insert tabs and new lines. Whitespace will be automatically corrected.'>Grid Items</label>        <textarea id='subtest_items'>" + items + "</textarea>      </div>      <div class='label_value'>        <label>Randomize items</label><br>        <div class='menu_box'>          <div id='randomize' class='buttonset'>            <label for='randomize_true'>Yes</label><input name='randomize' type='radio' value='true' id='randomize_true' " + (randomize ? 'checked' : void 0) + ">            <label for='randomize_false'>No</label><input name='randomize' type='radio' value='false' id='randomize_false' " + (!randomize ? 'checked' : void 0) + ">          </div>        </div>        <br>        <label>Capture item at specified number of seconds</label><br>        <div class='menu_box'>          <div id='capture_item_at_time' class='buttonset'>            <label for='capture_item_at_time_true'>Yes</label><input name='capture_item_at_time' type='radio' value='true' id='capture_item_at_time_true' " + (captureItemAtTime ? 'checked' : void 0) + ">            <label for='capture_item_at_time_false'>No</label><input name='capture_item_at_time' type='radio' value='false' id='capture_item_at_time_false' " + (!captureItemAtTime ? 'checked' : void 0) + ">          </div>          <div class='label_value'>            <label for='capture_after_seconds' title='After this number of seconds has passed the enumerator will be instructed to mark the item currently being attempted, and then resume.'>Seconds</label>            <input id='capture_after_seconds' value='" + captureAfterSeconds + "' type='number'>          </div>        </div>        <br>        <label>Capture last item attempted</label><br>        <div class='menu_box'>          <div id='capture_last_attempted' class='buttonset'>            <label for='capture_last_attempted_true'>Yes</label><input name='capture_last_attempted' type='radio' value='true' id='capture_last_attempted_true' " + (captureLastAttempted ? 'checked' : void 0) + ">            <label for='capture_last_attempted_false'>No</label><input name='capture_last_attempted' type='radio' value='false' id='capture_last_attempted_false' " + (!captureLastAttempted ? 'checked' : void 0) + ">          </div>        </div>        <br>        <label>Mark entire line button</label><br>        <div class='menu_box'>          <div id='end_of_line' class='buttonset'>            <label for='end_of_line_true'>Yes</label><input name='end_of_line' type='radio' value='true' id='end_of_line_true' " + (endOfLine ? 'checked' : void 0) + ">            <label for='end_of_line_false'>No</label><input name='end_of_line' type='radio' value='false' id='end_of_line_false' " + (!endOfLine ? 'checked' : void 0) + ">          </div>        </div>      </div>      <div class='label_value'>        <label for='subtest_columns' title='Number of columns in which to display the grid items.'>Columns</label>        <input id='subtest_columns' value='" + columns + "' type='number'>      </div>      <div class='label_value'>        <label for='subtest_autostop' title='Number of incorrect items in a row from the beginning, after which, the test automatically stops. If the item that triggered the autostop was an enumerator error, the enumerator has 3 seconds to undo any incorrect item and resume the test. Otherwise, the test is stopped but may still be reset completely.'>Autostop</label>        <input id='subtest_autostop' value='" + autostop + "' type='number'>      </div>      <div class='label_value'>        <label for='subtest_timer' title='Seconds to give the child to complete the test. Setting this value to 0 will make the test untimed.'>Timer</label>        <input id='subtest_timer' value='" + timer + "' type='number'>      </div>");
  };

  return GridEditView;

})(Backbone.View);

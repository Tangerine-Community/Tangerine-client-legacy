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
      captureMinuteItem: this.$el.find("#capture_minute_item input:checked").val() === "true",
      randomize: this.$el.find("#randomize input:checked").val() === "true",
      timer: parseInt(this.$el.find("#subtest_timer").val()),
      items: _.compact(this.$el.find("#subtest_items").val().split(" ")),
      columns: parseInt(this.$el.find("#subtest_columns").val()),
      autostop: parseInt(this.$el.find("#subtest_autostop").val()),
      variableName: this.$el.find("#subtest_variable_name").val().replace(/\s/g, "_").replace(/[^a-zA-Z0-9_]/g, "")
    });
  };

  GridEditView.prototype.render = function() {
    var autostop, columns, items, minuteItem, randomize, timer, variableName;
    timer = this.model.get("timer") || 0;
    items = this.model.get("items").join(" ");
    columns = this.model.get("columns") || 0;
    autostop = this.model.get("autostop") || 0;
    variableName = this.model.get("variableName") || "";
    randomize = this.model.has("randomize") ? this.model.get("randomize") : false;
    minuteItem = this.model.has("captureMinuteItem") ? this.model.get("captureMinuteItem") : false;
    return this.$el.html("      <div class='label_value'>        <label for='subtest_variable_name'>Variable name</label>        <input id='subtest_variable_name' value='" + variableName + "'>      </div>      <div class='label_value'>        <label for='subtest_items' title='These items are space delimited. Pasting text from other applications may insert tabs and new lines. Whitespace will be automatically corrected.'>Grid Items</label>        <textarea id='subtest_items'>" + items + "</textarea>      </div>      <div class='label_value'>        <label>Randomize items</label><br>        <div class='menu_box'>          <div id='randomize' class='buttonset'>            <label for='randomize_true'>Yes</label><input name='randomize' type='radio' value='true' id='randomize_true' " + (randomize ? 'checked' : void 0) + ">            <label for='randomize_false'>No</label><input name='randomize' type='radio' value='false' id='randomize_false' " + (!randomize ? 'checked' : void 0) + ">          </div>        </div>        <br>        <label>Capture item at 60 seconds</label><br>        <div class='menu_box'>          <div id='capture_minute_item' class='buttonset'>            <label for='capture_minute_item_true'>Yes</label><input name='capture_minute_item' type='radio' value='true' id='capture_minute_item_true' " + (minuteItem ? 'checked' : void 0) + ">            <label for='capture_minute_item_false'>No</label><input name='capture_minute_item' type='radio' value='false' id='capture_minute_item_false' " + (!minuteItem ? 'checked' : void 0) + ">          </div>        </div>      </div>      <div class='label_value'>        <label for='subtest_columns'>Columns</label>        <input id='subtest_columns' value='" + columns + "' type='number'>      </div>      <div class='label_value'>        <label for='subtest_autostop'>Autostop</label>        <input id='subtest_autostop' value='" + autostop + "' type='number'>      </div>      <div class='label_value'>        <label for='subtest_timer'>Timer</label>        <input id='subtest_timer' value='" + timer + "' type='number'>      </div>");
  };

  return GridEditView;

})(Backbone.View);

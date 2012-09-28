class DatetimePrintView extends Backbone.View

  className: "datetime"

  initialize: (options) ->
    @model  = @options.model
    @parent = @options.parent
  
  render: ->

    @$el.html "
      <form>
          <table>
            <tr>
              <td><label for='year'>Year</label><input id='year' name='year' value='#{year}'></td>
              <td><label for='month'>Month</label><input id='month' type='month' name='month' value='#{month}'></td>
              <td><label for='day'>Day</label><input id='day' type='day' name='day' value='#{day}'></td>
            </tr>
          </table>
          <label for='time'>Time</label><br><input type='text' id='time' name='time' value='#{time}'>
      </form>
      "
    @trigger "rendered"

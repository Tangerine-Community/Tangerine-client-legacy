# Provides an "li" tag for the questions edit view
class QuestionsEditListElementView extends Backbone.View
  tagName : "li"
  className : "question_list_element"

  events:
    'click .edit'          : 'edit'
    'click .delete'        : 'toggleDelete'
    'click .delete_cancel' : 'toggleDelete'
    'click .delete_delete' : 'delete'

  edit: (event) ->
    Tangerine.router.navigate "question/#{@question.id}", true
    return false

  toggleDelete: ->
    @$el.find(".delete_confirm").fadeToggle(250)

  delete: (event) ->
    @question.collection.remove(@question.id)
    @question.destroy()
    @trigger "deleted"
    return false

  initialize: ( options ) ->
    @question = options.question
    @$el.attr("data-id", @question.id)

  render: ->
    @$el.html "
      <table>
        <tr>
          <td>
            <img src='images/icon_drag.png' class='sortable_handle'>
          </td>
          <td>
            <span>#{@question.get 'prompt'}</span> <span>[<small>#{@question.get 'name'}, #{@question.get 'type'}</small>]</span>
            <button class='edit command'>Edit</button>
            <button class='delete command'>Delete</button>
            <div class='confirmation delete_confirm'>
            Are you sure? <button class='delete_delete'>Delete</button><button class='delete_cancel'>Cancel</button>
            </div>
          </td>
        </tr>
      </table>
      "
    @trigger "rendered"

# Provides an "li" tag for the questions edit view
class QuestionsEditListElementView extends Backbone.View
  tagName : "li"
  className : "question_list_element"

  events:
    'click .edit'   : 'edit'
    'click .delete' : 'delete'

  edit: (event) ->
    Tangerine.router.navigate "question/#{@question.id}", true
    return false

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
      <img src='images/icon_drag.png' class='sortable_handle'>
      <span>#{@question.get 'prompt'}</span> <span>[<small>#{@question.get 'name'}, #{@question.get 'type'}</small>]</span>
      <button class='edit command'>Edit</button>
      <button class='delete command'>Delete</button>
      "
    @trigger "rendered"

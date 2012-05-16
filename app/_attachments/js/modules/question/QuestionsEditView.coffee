class QuestionsEditView extends Backbone.View

  tagName : "ul"
  className : "questions_edit_view"
  
  events :
    'click .edit' : 'edit'
    'click .delete' : 'delete'

  edit: (event) ->
    id = $(event.target).parent().attr('data-id')
    Tangerine.router.navigate "question/#{id}", true
    return false

  delete: (event) ->
    id = $(event.target).parent().attr('data-id')
    @questions.get(id).destroy() 
    return false

  initialize: ( options ) ->
    @questions = options.questions

  render: ->
    html = ""
    for question, i in @questions.models
      html += "
        <li class='question_list_element' data-id='#{question.id}'>
          <img src='images/icon_drag.png' class='sortable_handle'>
            <span>#{question.get 'prompt'}</span> <span>[#{question.get 'name'}]</span>
            <button class='edit command'>Edit</button>
            <button class='delete command'>Delete</button>
        </li>
      "

    @$el.html html

    # make it sortable
    @$el.sortable
      handle : '.sortable_handle'
      update : (event, ui) =>
        for id, i in ($(li).attr("data-id") for li in @$el.find("li.question_list_element"))
          oneQuestion = @questions.get(id)
          @questions.get(id).set({"order":i},{silent:true}).save(null,{silent:true})

# Provides an "li" tag for the questions edit view
class QuestionsEditListElementView extends Backbone.View

  className : "question_list_element"
  tagName : "li"

  events:
    'click .edit'        : 'edit'
    'click .show_copy'   : 'showCopy'
    'change .copy_select' : 'copy'

    'click .delete' : 'delete'


  showCopy: (event) ->
    $copy = @$el.find(".copy_container")
    $copy.html "
      <label id='copy-to-#{@cid}'>Copy to</label> <select class='copy_select' id='copy-to-#{@cid}'><option disabled='disabled' selected='selected'>Loading...</option></select>
    "
    @getSurveys()

  getSurveys: =>
    if Tangerine.settings.get("context") is "server"
      url = Tangerine.settings.urlView("group", "subtestsByAssessmentId")
    else
      url = Tangerine.settings.urlView("local", "subtestsByAssessmentId")
    $.ajax
      "url"         : url
      "type"        : "POST"
      "dataType"    : "json"
      "contentType" : "application/json"
      "data"        : JSON.stringify
        keys : [ @question.get("assessmentId") ]
      "success" : ( data ) =>
        subtests = _.compact( data.rows.map (row) -> ( {"id":row.value._id,"name":row.value.name} if row.value.prototype is "survey" ) )
        @populateSurveySelect subtests

  populateSurveySelect : (subtests) ->
    subtests.push    id : 'cancel', name : @text.cancel_button
    subtests.unshift id : '',       name : @text.select
    htmlOptions = ("<option data-subtestId='#{subtest.id}'>#{subtest.name}</option>" for subtest in subtests).join("")
    @$el.find(".copy_select").html htmlOptions

  copy: (event) =>
    $target = $(event.target).find("option:selected")
    subtestId = $target.attr("data-subtestId")
    if subtestId == "cancel"
      @$el.find(".copy_container").empty()
      return
    newQuestion = @question.clone()
    newQuestion.save
      "_id"       : Utils.guid()
      "subtestId" : subtestId
    ,
      success: =>
        if subtestId == @question.get("subtestId")
          Utils.midAlert("Question duplicated")
          @trigger "duplicate" 
        else
          Tangerine.router.navigate "subtest/#{subtestId}", true # this will guarantee that it assures the order of the target subtest
          Utils.midAlert("Question copied to #{$target.html()}")
      error: ->
        Utils.midAlert("Copy error")

  edit: (event) ->
    @trigger "question-edit", @question.id
    return false

  delete: (event) ->
    if confirm(@text.delete_confirm)
      @question.collection.remove(@question.id)
      @question.destroy()
      @trigger "deleted"
  
  initialize: ( options ) ->
    @text = 
      "edit"          : t("QuestionsEditListElementView.help.edit")
      "delete"        : t("QuestionsEditListElementView.help.delete")
      "copy"          : t("QuestionsEditListElementView.help.copy_to")
      "cancel_button" : t("QuestionsEditListElementView.button.cancel")
      "delete_button" : t("QuestionsEditListElementView.button.delete")
      "select"        : t("QuestionsEditListElementView.label.select")
      "loading"       : t("QuestionsEditListElementView.label.loading")
      "delete_confirm" : t("QuestionsEditListElementView.label.delete_confirm")

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
            
            <img src='images/icon_edit.png' class='link_icon edit' title='#{@text.edit}'>
            <img src='images/icon_copy_to.png' class='link_icon show_copy' title='#{@text.copy}'>
            <span class='copy_container'></span>
            <img src='images/icon_delete.png' class='link_icon delete' title='#{@text.delete}'><br>
          </td>
        </tr>
      </table>
      "
    @trigger "rendered"

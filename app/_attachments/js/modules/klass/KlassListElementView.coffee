class KlassListElementView extends Backbone.View

  tagName: "li"

  events:
    'click .run'           : 'run'
    'click .results'       : 'showReportSelect'
    'change #report'       : 'getReportMenu'
    'click .cancel_report' : 'cancelReport'
    'click .edit'          : 'edit'
    'click .delete'        : 'toggleDelete'
    'click .delete_cancel' : 'toggleDelete'
    'click .delete_delete' : 'delete'

  initialize: (options) ->
    @availableReports = Tangerine.config.reports
    if options.klass.has "curriculumId"
      @curriculum = new Curriculum 
          "_id" : options.klass.get "curriculumId" || ""
      @curriculum.fetch
        success : @render

    else
      @curriculum = new Curriculum 

  edit: ->
    Tangerine.router.navigate "class/edit/" + @options.klass.id, true

  getReportMenu: (event) ->
    @subMenuView?.close()
    @subMenuView = new window[$(event.target).find(":selected").attr("data-menu_view")]
      parent : @
    @$el.find("#report_menu_container").append("<div class='report_menu'></div>")
    @subMenuView.setElement @$el.find("#report_menu_container .report_menu")
    @subMenuView.render()

  showReportSelect: -> @$el.find(".report_select_container").removeClass "confirmation"

  cancelReport: ->
    @$el.find('div#report_menu').empty()
    @$el.find('#report :nth-child(1)').attr('selected', 'selected')
    @$el.find(".report_select_container").addClass "confirmation"
    @subMenuView?.close()

  onClose: ->
    @subMenuView?.close()

    
  run: ->
    Tangerine.router.navigate "class/" + @options.klass.id, true
  
  toggleDelete: -> @$el.find(".delete_confirm").toggle()
  
  delete: ->
    @options.klass.collection.get(@options.klass).destroy()
  
  render: =>
    klass = @options.klass
    @$el.html "
      <table>
        <tr><td><small>#{t('year')}</small></td><td>#{klass.get 'year'}</td></tr>
        <tr><td><small>#{t('grade')}</small></td><td>#{klass.get 'grade'}</td></tr>
        <tr><td><small>#{t('stream')}</small></td><td>#{klass.get 'stream'}</td></tr>
        <tr><td><small>#{t('curriculum')}</small></td><td>#{@curriculum.escape 'name' || ""}</td></tr>
      </table>
      <img src='images/icon_run.png'     class='run'>
      <img src='images/icon_results.png' class='results'>
      <img src='images/icon_edit.png'    class='edit'>
      <img src='images/icon_delete.png'  class='delete'>
      <div class='report_select_container confirmation'>
        <div class='menu_box'>
          <select id='report'>
            <option selected='selected' disabled='disabled'>#{t('select report type')}</option>
            #{("<option data-menu_view='#{report.menuView}'>#{t(report.name)}</option>" for report in @availableReports).join("")}
          </select>
        </div>
        <div id='report_menu_container'></div>
        <button class='command cancel_report'>#{t('cancel')}</button>
      </div>
      <div class='delete_confirm confirmation'>
        <div class='menu_box'>
          #{t('confirm')}<br>
          <button class='delete_delete command_red'>#{t('delete')}</button>
          <button class='delete_cancel command'>#{t('cancel')}</button>
        </div>
      </div>
    "

    @trigger "rendered"



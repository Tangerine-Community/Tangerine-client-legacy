class PanelsEditView extends Backbone.View

  initialize: (settings) ->

    @settings = settings
    @subViews = []

    views = []
    for key, value of window
      views.push key
    
    views = views.filter (name) -> !!~name.indexOf("View")

    @panelViews = views.filter (name) -> window[name].hasPanels

  render: ->

    html = ""
    @panelViews.forEach (viewName) => 
      panels = @settings.getArray "#{viewName}-panels"
      view = new PanelEditView panels: panels, panelViewName : viewName
      @subViews.push view
      @listenTo view, "change", => 
        @settings.set "#{viewName}-panels", view.panels
      html += "<div id='view-#{view.cid}'></div>"

    @$el.html html

    for view in @subViews
      view.setElement(@$el.find("#view-#{view.cid}")).render()

  onClose: ->
    for view in @subViews
      view.close()

class PanelEditView extends Backbone.View

  events : 
    "change input"  : "handleChange"
    "click .add"    : "add"
    "click .remove" : "remove"

  handleChange: ->

    @result = []
    for panel, index in @panels
      name = @$el.find("#name-#{index}").val()
      viewNames = @$el.find("#view-names-#{index}").val().split(/\s*,\s*/)
      console.log viewNames
      @result.push
        name: name
        views: viewNames
    @panels = @result

    @trigger "change"

  initialize: (options) ->
    @panelViewName = options.panelViewName
    @panels        = options.panels

  template:
    list: (panels) -> 
      "
        <ol>
          #{(@listElement(panel:panel, index: index) for panel, index in panels).join('')}
        </ol>
      "

    listElement: (values) ->
      "
        <li>
          <label for='name-#{values.index}'>Name</label>
          <input id='name-#{values.index}' class='name' data-index='#{values.index}' value='#{values.panel.name}'>

          <label for='view-names-#{values.index}'>Views</label>
          <input id='view-names-#{values.index}' data-index='#{values.index}' class='view-names' value='#{values.panel.views.join(', ')}'>

          <input type='button' class='remove command' data-index='#{values.index}' value='Remove'>
        </li>
      " 

    addButton: ->
      "<input type='button' class='add command' value='Add'>"

  add: ->
    @panels.push name: "name", views: ["views"]
    @render()
    @trigger "change"

  remove: (event) ->
    index = $(event.target).attr "data-index"
    @panels.splice(index,1)
    @render()
    @trigger "change"

  render: ->
    @$el.html "
      <h2>#{@panelViewName}</h2>
      #{@template.list(@panels)}
      #{@template.addButton()}
    "


  ###
  panels: [
    {
      name : "Workflows"
      views : ["WorkflowMenuView"]
    },
    {
      name : "Sync"
      views : ["SyncManagerView", "BandwidthCheckView"]
    },
    {
      name : "Schools"
      views : ["BandwidthCheckView", "ValidObservationView"]
    }
  ]
  ###

class SettingsView extends Backbone.View

  className : "SettingsView"

  events: 
    'click .save' : 'save'
    'click .back' : 'goBack'

  goBack: ->
    window.history.back()

  initialize: (options) ->
    @settings = Tangerine.settings

  save: ->
    @settings.save
      groupHandle : @$el.find('#group_handle').val()
      context     : @$el.find('#context').val()
      language    : @$el.find('#language').val()
      groupName   : @$el.find("#group_name").val()
      groupHost   : @$el.find("#group_host").val()
      upPass      : @$el.find("#up_pass").val()
      dashboard   : @$el.find("#dashboard").val()
      log         : @$el.find("#log").val().split(/[\s,]+/)
      verifiableAttribute     : @$el.find("#verifiable-attribute").val()
      verifiableAttributeName : @$el.find("#verifiable-attribute-name ").val()
    ,
      success: =>
        Utils.midAlert "Settings saved"
      error: ->
        Utils.midAlert "Error. Settings weren't saved"

  render: ->
    context                 = @settings.getEscapedString "context"
    language                = @settings.getEscapedString "language"
    groupName               = @settings.getEscapedString "groupName"
    groupHandle             = @settings.getEscapedString "groupHandle"
    groupHost               = @settings.getEscapedString "groupHost"
    upPass                  = @settings.getEscapedString "upPass"
    dashboard               = @settings.getEscapedString "dashboard"    upPass                  = @settings.getEscapedString "upPass"


    verifiableAttribute     = @settings.getEscapedString "verifiableAttribute"

    verifiableAttributeName = @settings.getEscapedString "verifiableAttributeName"

    log = _.escape( @settings.getArray("log").join(", ") )

    @$el.html "
    <button class='back nav-button'>Back</button>
    <h1>#{t("settings")}</h1> 
    <p><img src='images/icon_warn.png' title='Warning'>Please be careful with the following settings.</p>
    <section>
      <div class='label_value'>
        <label for='context'>Context</label><br>
        <input id='context' type='text' value='#{context}'>
      </div>
      <div class='label_value'>
        <label for='language'>Language code</label><br>
        <input id='language' type='text' value='#{language}'>
      </div>
      <div class='label_value'>
        <label for='group_handle' title='A human readable name. Only for display purposes. Any change here will not affect the address of the group or any internal functionality.'>Group handle</label><br>
        <input id='group_handle' type='text' value='#{groupHandle}'>
      </div>
      <div class='label_value'>
        <label for='group_name'>Group name</label><br>
        <input id='group_name' type='text' value='#{groupName}'>
      </div>
      <div class='label_value'>
        <label for='group_host'>Group host</label><br>
        <input id='group_host' type='text' value='#{groupHost}'>
      </div>
      <div class='label_value'>
        <label for='up_pass'>Upload password</label><br>
        <input id='up_pass' type='text' value='#{upPass}'>
      </div>
      <div class='label_value'>
        <label for='log' title='app, ui, db, err'>Log events</label><br>
        <input id='log' value='#{log}'>
      </div>
      <div class='label_value'>
        <label for='dashboard'>Dashboard</label><br>
        <input id='dashboard' type='text' value='#{dashboard}'>
      </div>

    </section><br>

    <section>
      <div class='label_value'>
        <label for='verifiable-attribute' title='This field, if it's not empty, will call verify the attribute at signup with the server.'>Verifiable attribute</label><br>
        <input id='verifiable-attribute' value='#{verifiableAttribute}'>
      </div>
      <div class='label_value'>
        <label for='verifiable-attribute-name' title='Label.'>Verifiable attribute's human readable name</label><br>
        <input id='verifiable-attribute-name' value='#{verifiableAttributeName}'>
      </div>
    </section>

    <section>
      <div id='panels-edit-view'></div>
    </section>
    
    <button class='command save'>Save</button>
    "
    
    @subView = new PanelsEditView Tangerine.settings
    @subView.setElement(@$el.find("#panels-edit-view")).render()

    @trigger "rendered"
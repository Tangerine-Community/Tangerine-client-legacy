class KlassListElementView extends Backbone.View

  tagName: "li"

  events:
    'click .run'           : 'run'
    'click .edit'          : 'edit'
    'click .delete'        : 'toggleDelete'
    'click .delete_cancel' : 'toggleDelete'
    'click .delete_delete' : 'delete'
  
  initialize: (options) ->
    
    if options.klass.has "curriculumId"
      @curriculum = new Curriculum 
          "_id" : options.klass.get "curriculumId" || ""
      @curriculum.fetch
        success : @render
  
    else
      @curriculum = new Curriculum 


  edit: ->
    Tangerine.router.navigate "class/edit/" + @options.klass.id, true

  results: ->
    Tangerine.router.navigate "class/results/" + @options.klass.id, true
  
  run: ->
    Tangerine.router.navigate "class/" + @options.klass.id, true
  
  toggleDelete: -> @$el.find(".delete_confirm").toggle()
  
  delete: ->
    @options.klass.collection.get(@options.klass).destroy()
  
  render: =>
    klass = @options.klass
    @$el.html "
      <small>Year:</small> #{klass.get 'year'} -
      <small>Grade:</small> #{klass.get 'grade'} -
      <small>Stream:</small>#{klass.get 'stream'}<br>
      <small>Curriculum:</small>#{@curriculum.escape 'name' || ""}<br>

      <img src='images/icon_run.png' class='run'>
      <img src='images/icon_results.png' class='results'>
      <img src='images/icon_edit.png' class='edit'>
      <img src='images/icon_delete.png' class='delete'>
      <div class='delete_confirm confirmation'>
      <div class='menu_box'>
        Confirm<br>
        <button class='delete_delete command_red'>Delete</button>
        <button class='delete_cancel command'>Cancel</button>
      </div>
      </div>
    "



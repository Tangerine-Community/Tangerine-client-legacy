class WorkflowStep extends Backbone.ChildModel

  getName: ->
    if @type() is "assessment"
      return @get("name")
    return @get("_id")

  getType: -> @getString("type")

  getViewClass: -> @get("viewClass")

  getViewOptions: -> @get("viewOptions")

  getTypeModel: -> @model if @model?

  getTypesId: -> @getString("typesId")

  getUserType: -> @getString("userType")

  fetch: ( options = {} ) ->
    options.error   = $.noop unless options.error?
    options.success = $.noop unless options.success?
    if @get("type") is "assessment"
      @model = new Assessment "_id" : @get("typesId")
      @model.fetch
        error   : -> console.log "Had trouble fetching #{@get("typesId")}"; options.error()
        success : ->
          options.success()
    else if @get("type") is "curriculum"
      @model = new curriculum "_id" : @get("typesId")
      @model.fetch
        error   : -> console.log "Had trouble fetching #{@get("typesId")}"; options.error()
        success : ->
          options.success()

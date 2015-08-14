# displays heirarchical dropdowns based on geography from Loc
class LocView extends Backbone.View

  events :
    "change select" : "onChange"

  onChange: (event) ->
    # clear subsequent select boxes
    $(event.target).closest("div").nextAll().remove()

    index = parseInt($(event.target).attr('data-index'))
    @renderOne( index + 1 ) unless index + 1 is @levels.length
    @trigger "change"

  initialize: (options={}) ->
    @showTitles = if options.showTitles? then options.showTitles else true
    @levels = options.levels || ["county", "zone", "school"]
    @addedOptions = if options.addedOptions? then options.addedOptions else false
    @selected = options.selected || []
    @render()

  value: ->
    result = {}
    for level, i in @levels
      if @$el.find("[data-index='#{i}']").length isnt 0
        result[level] = @$el.find("[data-index='#{i}']").val()
    return result

  renderOne: (index) ->
    if index is 0
      criteria = null
    else
      criteria = @value()

    Loc.query criteria, (res) ->
      if @addedOptions
        res = @addedOptions[index].concat res

      htmlOptions = res.map (el) ->
        if @selected[index]? and el.id is @selected[index]
          selected = "selected='selected'"
        "<option value='#{el.id}' #{selected||''}>#{el.name}</option>"
      , @

      title = @levels[index].titleize() if @showTitles

      noPreSelection = not @selected[index]?
      if noPreSelection
        selected = "selected='selected'"

      @$el.append "
        <div>
          <label>#{title || ''}
            <select data-index='#{index}'>
              <option #{selected||''} disabled='disabled'>Select...</option>
              #{htmlOptions}
            </select>
          </label>
        </div>
        <br>
      "
      if @selected.length isnt 0
        if index + 1 is @selected.length
          @selected = []
        else
          @renderOne(index+1)
    , @



  render: ->
    @renderOne(0)


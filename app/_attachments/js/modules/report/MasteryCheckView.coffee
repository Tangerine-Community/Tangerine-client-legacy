class MasteryCheckView extends Backbone.View

  className : "MasteryCheckView"

  events :
    "click .back" : "goBack"
    
  goBack: -> history.back()

  initialize: (options) ->

    @results = options.results
    @student = options.student
    @klass   = options.klass

    @resultsByPart = @results.indexBy "part"
    @lastPart = Math.max.apply @, @results.pluck("part")

  render: ->
    html = "
      <h1>Mastery check report</h1>
      <h2>Student #{@student.get("name")}</h2>
      <table>
    "
    for part in [1..@lastPart]
      if @resultsByPart[part] == undefined then continue
      html += "
        <tr><th>Assessment #{part}</th></tr>
        <tr>"

      for result in @resultsByPart[part]
        html += "
          <td>#{result.get("itemType").titleize()} correct</td>
          <td>#{result.get("correct")}/#{result.get("total")}</td>"
      
    html += "
    </table>
    <button class='navigation back'>#{t('back')}</button>
    "
    @$el.html html

    @trigger "rendered"

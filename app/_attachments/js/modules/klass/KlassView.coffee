class KlassView extends Backbone.View

  initialize: ( options ) ->
    @klass = options.klass
    @assessments = @klass.assessments
    @results     = []
    allAssessments = new KlassAssessments
    allAssessments.fetch
      success: (assessmentCollection) =>
        @assessments = assessmentCollection.where { klassId : @klass.id }
        results = new Results
        results.fetch
          success: (resultCollection) =>
            for assessment in @assessments
              assessment.results = resultCollection.where { assessmentId : assessment.id }
            @render()

  render: ->
    year   = @klass.get("year")   || ""
    grade  = @klass.get("grade")  || ""
    stream = @klass.get("stream") || ""
    html = "
    <h1>Class: #{stream}</h1>
    <div>
      Year: #{year}<br>
      Grade: #{grade}
    </div>
    <ul class='assessment_list'>"
    for assessment in @assessments
      html += "<li data-id='#{assessment.id}'>#{assessment.get 'name'} - #{assessment.get('results')?.length}</li>"
    html += "</ul>"

    @$el.html html
    @trigger "rendered"

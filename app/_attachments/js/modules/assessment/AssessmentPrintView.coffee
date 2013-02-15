class AssessmentPrintView extends Backbone.View

  className: "AssessmentPrintView"
  
  initialize: (options) ->
    @abortAssessment = false
    @index = 0
    @model = options.model
    @format = options.format

    Tangerine.activity = "assessment print"
    @subtestViews = []
    @model.subtests.sort()
    @model.subtests.each ( subtest ) =>
      subtestView = new SubtestPrintView
        model  : subtest
        parent : @
        format : @format
      subtestView.on "rendered", ( view ) =>
        view?.afterRender?()
      @subtestViews.push subtestView
  
  render: ->
    if @model.subtests.length == 0
      @$el.append "<h1>Oops...</h1><p>This assessment is blank. Perhaps you meant to add some subtests.</p>"
    else
      @$el.addClass("format-#{@format}").append "
        <style>
          body{
            font-size: 100%;
          }
          #prototype_wrapper .print-page{
            size: 11in 8.5in; 
            height: 11in;
            width: 8.5in;
            margin: 0;
            page-break-after: always;
            overflow: hidden;
          }
          #prototype_wrapper .print-page table{
            table-layout: fixed;
          }
          .format-stimuli table td{
            overflow: hidden;
            text-align: center;
            padding: 1%;
            font-family: Andika;
          }
          .format-stimuli{
            font-family: Andika;
          }
        </style>
      "
      _.each @subtestViews , (subtestView) =>

        subtestView.render()
        @$el.append subtestView.el

    @trigger "rendered"

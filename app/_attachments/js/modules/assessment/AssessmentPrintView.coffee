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
      @$el.append "
        <style>
          body{
            font-size: 100%;
            font-family: Andika;
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
          #prototype_wrapper .print-page table td{
            overflow: hidden;
            text-align: center;
            padding: 1%;
            font-family: Andika;
          }

        </style>
      "

      _.each @subtestViews , (subtestView) =>

        subtestView.render()
        @$el.append subtestView.el

    @trigger "rendered"

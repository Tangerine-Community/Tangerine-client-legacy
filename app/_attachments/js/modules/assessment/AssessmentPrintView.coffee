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
        <div class='print-page #{@format}'>
          <h2>#{@model.get("name").titleize()}</h2>
          <h3>
            #{
              if @model.has "updated"
                "Last Updated: #{moment(@model.get "updated")}"
              else
                ""
            }
          </h3>
          <table class='marking-table'>
            <tr>
              <td style='vertical-align:middle'>Enumerator Name</td><td class='marking-area'></td>
            </tr>
          </table>
        </div>
        <hr/>
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
            @bottom-right {
              content: counter(page) \" of \" counter(pages);
            }
          }
          #prototype_wrapper .print-page.backup{
            page-break-before: always;
            overflow: visible;
            height:auto;
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
          .print-question-option{
            display:block;
          }
          table.marking-table{
            border-collapse: separate;
            border-spacing:10px;

          }
          td.marking-area, .free-text{
            margin: 10px;
            width: 4in;
            height: 1in;
            border: solid 1px;
          }
          .subtest-title{
            font-style:italic;
            padding-bottom:20px;
            color:gray;
          }
          .survey-questions .stimuli-question{
            padding-bottom: 3%;
          }
          .free-text{
            margin-left:0px;
            margin-top:0px;
            margin-bottom:0px;
          }
          .print-question-option{
            text-indent:20px;
            margin-right:10px;
          }
          .backup-question{
            border: solid 1px;
            margin-top: 10px;
            page-break-inside: avoid;
          }
          .checkbox{
            border: solid 1px;
            height: .25in;
            width: .25in;
          }
          .print-question-label{
            vertical-align: middle;
          }
          .student-dialog{
            background-color: #EEEEEE;
          }
          .format-backup .item{
            font-size:150%;
            border: solid 1px;
            padding: 5px;
          }
        </style>
      "
      _.each @subtestViews , (subtestView) =>

        subtestView.render()
        @$el.append subtestView.el

    @trigger "rendered"

  afterRender: =>
    alert("Hiding header and footers, press browser back button if you need to return")
    $('#navigation').hide()
    $('#footer').hide()
    print()

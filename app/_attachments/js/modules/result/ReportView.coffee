# Taylor's class!
class ReportView extends Backbone.View
  
  initialize: ( options ) ->
    @table = 
      'studentId' : []
      'correct' : []
      'incorrect' : []
      'missing' : []
    
    @assessmentId = options.assessmentId
    console.log "Initializing ReportView: " + @assessmentId
    
    allResults = new Results
    allResults.fetch
      success: (collection) =>
        console.log collection
        @results = collection.where {assessmentId : @assessmentId}
        
        for result in @results
          for subtestKey, subtestValue of result.attributes.subtestData
            if subtestValue.name == "Student ID"
              @table.studentId.push subtestValue.data.student_id
              @table.correct.push 0
              @table.incorrect.push 0
              @table.missing.push 0
            else if subtestValue.data.letters_results?
              @table.correct[@table.correct.lastIndexOf(0)] = @table.correct[@table.correct.lastIndexOf(0)] + subtestValue.sum.correct
              @table.incorrect[@table.incorrect.lastIndexOf(0)] = @table.incorrect[@table.incorrect.lastIndexOf(0)] + subtestValue.sum.incorrect
              @table.missing[@table.missing.lastIndexOf(0)] = @table.missing[@table.missing.lastIndexOf(0)] + subtestValue.sum.missing
            
        console.log @table
  
  
  
  
  render: ->
    
      
      
    @trigger "rendered"
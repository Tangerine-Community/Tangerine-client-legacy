# Taylor's class!
class ReportView extends Backbone.View
  
  initialize: ( options ) ->
    @assessmentId = options.assessmentId
    console.log "Initializing ReportView: " + @assessmentId
    
    allResults = new Results
    allResults.fetch
      success: (collection) =>
        console.log collection
        @grids = collection.where
          assessmentId : @assessmentId
          prototype    : "grid"
          console.log @grids
          for grid in @grids
            console.log grid
            
  render: ->
    
      
      
    @trigger "rendered"
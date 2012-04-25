class Subtest extends Backbone.Model
  
  url: "/subtest"
  
  defaults =
    assessment : new Assessment
  
  initialize: (options) ->
    @set
      assessment  : options?.assessment ? @defaults.assessment
  
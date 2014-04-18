

describe "Testing Environment", ->
  it "should have mock-ajax installed", ->
    expect(jasmine.Ajax.isInstalled).toBeTruthy()

describe "Assessment", ->

  assessmentName = "Testing assessment"
  assessmentId = "testAssessment"

  beforeEach ->
    @assessment = new Assessment
      "_id"          : assessmentId
      "name"         : assessmentName
      "archived"     : false
      "assessmentId" : assessmentId
      "sequences"    : []

  it "should return a name", ->
    expect(@assessment.get('name')).toEqual assessmentName

  it "should have the same assessmentId as _id", ->
    expect(@assessment.id).toEqual @assessment.get("assessmentId")

  it "should have a sequence array", ->
    expect(@assessment.get("sequences")).toEqual []

describe "Assessments", ->

  assessmentName = "Testing assessment"
  assessmentId = "testAssessment"

  beforeEach ->

    jasmine.Ajax.installMock()

    @assessments = new Assessments((new Assessment
      "_id"          : assessmentId+i
      "name"         : assessmentName+i
      "archived"     : false
      "assessmentId" : assessmentId+i
      "sequences"    : []
    ) for i in [0..9])

  afterEach ->
    jasmine.Ajax.uninstallMock()

  it "should return 10 models", ->
    expect(@assessments.length).toEqual(@assessments.models.length)

  it "should request the assessment collection", ->
    assessments = new Assessments
    assessments.fetch()
    mostRecent = mostRecentAjaxRequest()

    expect(JSON.parse(mostRecent.params).keys[0]).toEqual "assessment"

describe "Load Tangerine", ->

  beforeEach (done) => 
    if Tangerine.settings?
      done()
    else
      Tangerine.boot =>
        done()

  describe "fetch assessments", ->

    beforeEach (done) ->
      @assessments = new Assessments
      @assessments.fetch
        success: ->
          done()

    it "gets some assessments", ->
      expect(@assessments.length).toBeGreaterThan(0)


  describe "make assessments menu", ->

    beforeEach (done) =>
      @assessments = new Assessments
      @assessments.fetch
        success: =>
          @assessmentsView = new AssessmentsView
            assessments : @assessments
            parent      : @
          @assessmentsView.render()

          done()

    it "should be rendered", ->
      console.log(@assessmentsView.el)
      expect(@assessments.length).toBeGreaterThan(0)

(() ->
  'use strict'

  if Mocha.process.browser
    dbs = 'testdb' + Math.random()
  else
    dbs = Mocha.process.env.TEST_DB

  Backbone.history.start()
  Tangerine.addRegions siteNav: "#siteNav"
  Tangerine.addRegions mainRegion: "#content"
  Tangerine.addRegions dashboardRegion: "#dashboard"

  Backbone.Model.prototype.idAttribute = '_id'

  $.i18n.init
    fallbackLng : false
    lng         : Tangerine.settings.get "language"
    resStore    : Tangerine.locales,
  ,
    (err, t) ->
      window.t = t

  tests = (dbName)->
#    // async method takes an array of s of signature:
#    // `function (cb) {}`
#    // each function is called and `callback` is called when all
#    // functions are done.
#    // each function calls `cb` to signal completion
#    // cb is called with error as the first arguments (if any)
#    // Once all functions are completed (or upon err)
#    // callback is called `callback(err)`
    async = (functions, callback) ->
      series(functions) ->
        callback = callback || () ->
        if !functions.length
          return callback()

        fn = functions.shift();
        fn.call(fn, (err)->
          if err
            callback(err)
            return
          series(functions)
        )
      series(functions)

    describe 'Should get the assessment', ()->
      this.timeout(10000);

      dbs = [];

      before( 'Setup Tangerine and Pouch',(done) ->
        this.$container = $("#view-test-container");
        this.$fixture = $("<div>", { id: "fixture" });
        this.timeout(5000);

        pouchName = dbName;
        dbs = [dbName];
        #    // create db
        Tangerine.db = new PouchDB(pouchName, {adapter: 'memory'}, (err) ->
#          console.log("Before: Created Pouch: " + pouchName)
          if (err)
            console.log("Before: I got an error: " + err)
            return done(err)
          else
            return done()
        )
        Backbone.sync = BackbonePouch.sync
          db: Tangerine.db
          fetch: 'view'
          view: 'tangerine/byCollection'
          viewOptions:
            include_docs : true
      )

      after('Teardown Pouch', (done) ->
        console.log("after")
        this.$container.empty();
        delete this.$fixture;

        this.timeout(15000);
        pouchName = dbName;
        dbs = [dbName];

        result = Tangerine.db.destroy((er) ->
          ).then( (er) ->
#            console.log("After: Destroyed db: " + JSON.stringify(result) + " er: " + JSON.stringify er)
            done()
          ).catch( (er) ->
            console.log("After: Problem destroying db: " + er)
            done(er)
          )
      )

      it('Populate pouch with Assessments', (done)->

        db = Tangerine.db
        db.get "initialized", (error, doc) ->

#          return done() unless error

          # Save views
          db.put(
            _id: "_design/tangerine"
            views:
##
#        Used for replication.
#        Will give one key for all documents associated with an assessment or curriculum.
##
              byDKey:
                map: ((doc) ->
                  return if doc.collection is "result"

                  if doc.curriculumId
                    id = doc.curriculumId
                    # Do not replicate klasses
                    return if doc.collection is "klass"
                  else
                    id = doc.assessmentId

                  emit id.substr(-5,5), null
                ).toString()

              byCollection:
                map : ( (doc) ->

                  return unless doc.collection

                  emit doc.collection, null

                  # Belongs to relationship
                  if doc.collection is 'subtest'
                    emit "subtest-#{doc.assessmentId}"

# Belongs to relationship
                  else if doc.collection is 'question'
                    emit "question-#{doc.subtestId}"

                  else if doc.collection is 'result'
                    result = _id : doc._id
                    doc.subtestData.forEach (subtest) ->
                      if subtest.prototype is "id" then result.participantId = subtest.data.participant_id
                      if subtest.prototype is "complete" then result.endTime = subtest.data.end_time
                    result.startTime = doc.start_time
                    emit "result-#{doc.assessmentId}", result

                ).toString()
          ).then ->

            packNumber = 0

            doOne = ->

              paddedPackNumber = ("0000" + packNumber).slice(-4)
#              console.log("paddedPackNumber: " + paddedPackNumber)
              $.ajax
                dataType: "json"
                url: "../src/js/init/pack#{paddedPackNumber}.json"
                error: (res) ->
#                  console.log("We're done. No more files to process. res.status: " + res.status)
                  console.log("If you get an error starting with 'Error loading resource file', it's probably ok." )
                  console.log("We're done. No more files to process." )
                  done()
                success: (res) ->
                  packNumber++
#                  console.log("yes! uploaded paddedPackNumber: " + paddedPackNumber)

                  db.bulkDocs res.docs, (error, doc) ->
                    if error
                      return alert "could not save initialization document: #{error}"
                    doOne()

            doOne() # kick it off
      )

      it('Should return the expected assessment', (done)->
        id = "5edd67d0-9579-6c8d-5bb5-03a33b4556a6"
        assessment = new Assessment "_id" : id
        assessment.deepFetch({
          error:(err) ->
            console.log "Catch Error: " + JSON.stringify err
            done(err)
          success: (record) ->
#            console.log("assessment: " + JSON.stringify assessment)
            Tangerine.assessment = assessment
            expect(assessment.get("name")).to.equal('01. LTTP2 2015 - Student');
            done()
        })
#        }).then( (assessment) ->
#          Tangerine.assessment = assessment
#          expect(assessment.name).to.equal('01. LTTP2 2015 - Student');
#          done()
#        ).catch( (err) ->
#          console.log "Catch Error: " + JSON.stringify err
#          done(err)
#        )
      )

      it('Should make the view', (done)->
        this.$fixture.empty().appendTo(this.$container);
        id = "5edd67d0-9579-6c8d-5bb5-03a33b4556a6"
        assessment = new Assessment "_id" : id
        assessment.deepFetch({
          error: (err)->
            console.log "Catch Error: " + JSON.stringify err
            done(err)
          success: (record) ->
#            console.log "assessment subtests: " + JSON.stringify(assessment.subtests)
#            expect(assessment.get("name")).to.equal('01. LTTP2 2015 - Student');
            Tangerine.assessment = assessment
#            console.log("assessment: " + JSON.stringify assessment.doc)
            viewOptions =
              model: assessment
              el: this.$fixture
            view = new AssessmentCompositeView viewOptions
#            serializedData = view.serializeData();
#            console.log("serializedData:" + JSON.stringify(serializedData))
            view.once("render", () ->
#              console.log("view.$el.text():" + view.$el.text())
              console.log("view.$el.html():" + view.$el.html())
              expect(view.$el.text()).to.contain("01. LTTP2 2015 - Student");
            )
            view.render();
            done()
        })
      )

  dbs.split(',').forEach((db) ->
#    dbType = /^http/.test(db) ? 'http' : 'local'
    tests db
  )

)()

(() ->
  'use strict'

  if Mocha.process.browser
    dbs = 'testdb' + Math.random()
  else
    dbs = Mocha.process.env.TEST_DB

  Tangerine = {}

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

      before( 'Setup Pouch',(done) ->
        this.timeout(5000);
        pouchName = dbName;
        dbs = [dbName];
        #    // create db
        Tangerine.db = new PouchDB(pouchName, {adapter: 'memory'}, (err) ->
          console.log("Before: Created Pouch: " + pouchName)
          if (err)
            console.log("Before: I got an error: " + err)
            return done(err)
          else
            return done()
        )
      )


      after('Teardown Pouch', (done) ->

        this.timeout(15000);
        pouchName = dbName;
        dbs = [dbName];

        result = Tangerine.db.destroy((er) ->
          ).then( (er) ->
            console.log("After: Destroyed db: " + JSON.stringify(result) + " er: " + JSON.stringify er)
            done()
          ).catch( (er) ->
            console.log("After: Problem destroying db: " + er)
            done(er)
          )

#        console.log("delete dbName" + dbName)
#        indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.oIndexedDB || window.msIndexedDB;
#        console.log("indexedDB: " + indexedDB);
#        req = indexedDB.deleteDatabase(dbName)
#        .then( (er) ->
#          console.log("After2: Destroyed db: " + JSON.stringify(result) + " er: " + JSON.stringify er)
#          done()
#        ).catch( (er) ->
#        console.log("After2: Problem destroying db: " + er)
#        done(er)
#        )
#        Mocha.executeScript('window.localStorage.clear();');

#        page.evaluate(() ->
        console.log("clear locastorage" + dbName)
        localStorage.clear();
#        )
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
#        Backbone.history.start()
        console.log("Setting up Backbone sync ")
        Backbone.sync = BackbonePouch.sync
          db: Tangerine.db
          fetch: 'view'
          view: 'tangerine/byCollection'
          viewOptions:
            include_docs : true

        Backbone.Model.prototype.idAttribute = '_id'

        id = "70f8af3b-e1da-3a75-d84e-a7da4be99116"
        assessment = new Assessment "_id" : id
#        console.log("querying id: " + id)
        assessment.deepFetch().then( (assessment) ->
          expect(assessment.name).to.equal('setHint');
          done()
        ).catch( (err) ->
          console.log "Catch Error: " + JSON.stringify err
          done(err)
        )
      )


#          success : ->
#            console.log("assessment: " + JSON.stringify assessment)
#            expect(assessment.get('name')).to.equal('setHint');
#            done()
#          error: (model, err, cb) ->
#            console.log "Error: " + JSON.stringify err
#            done(err)
#      )

  dbs.split(',').forEach((db) ->
#    dbType = /^http/.test(db) ? 'http' : 'local'
    tests db
  )

)()


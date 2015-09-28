(() ->
  'use strict'
#  envVars = require('system').env
#  PouchDB = require('pouchdb');
#  require('pouchdb-all-dbs')(PouchDB);
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

    describe  'Should get the assessment', ()->
      this.timeout(10000);

      dbs = [];

      before( 'Setup Pouch',(done) ->
        this.timeout(5000);
        pouchName = dbName;
        dbs = [dbName];
        #    // create db
        console.log("creating Tangerine.db")
        Tangerine.db = new PouchDB(pouchName, (err) ->
          console.log("Created Pouch: " + pouchName)
          if (err)
            console.log("i got an error: " + err)
            return done(err)
          else
            return done()

          #          it('init pouch db', (done)->
          #            this.timeout(15000);
#          result = checkDatabase(Tangerine.db, done)
          #          console.log("checkDatabase: " + JSON.stringify  result)
          #          )
        )
      )

      after('Teardown Pouch', (done) ->

        this.timeout(15000);
        pouchName = dbName;
        dbs = [dbName];
        after = (err) ->
          new PouchDB(pouchName).destroy((er) ->
            if (er)
              console.log("i got an error: " + er)
              done(er)
            else
              console.log("we can wrap this thing up: " + err)
              done(err)
            )

        PouchDB.allDbs( (err, dbs) ->
          if (err)
            return after(err)
          #      // check if pouchName exists in _all_db
          dbs.some( (dbname)->
            if (dbname != pouchName)
              console.log("pouchName: " + pouchName + " dbname: " + dbname)
              new PouchDB(dbname).destroy((er) ->
                if (er)
                  console.log("while deleting i got an error: " + er)
#                  done(er)
                else
                  console.log("good: " + er)
#                  done(err)
              )
            else
              return dbname == pouchName
          ).should.equal(true, 'pouch exists in allDbs database, dbs are ' + JSON.stringify(dbs) + ', tested against ' + pouchName)
          after()
        )
      )

      it('Populate pouch with Assessments', (done)->
#        result = checkDatabase(Tangerine.db, done)

# Local tangerine database handle
        db = Tangerine.db
        db.get "initialized", (error, doc) ->

          return done() unless error

          console.log "initializing database"

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
              console.log("paddedPackNumber: " + paddedPackNumber)
              $.ajax
                dataType: "json"
                url: "../src/js/init/pack#{paddedPackNumber}.json"
                error: (res) ->
                  console.log("We're done. No more files to process. res.status: " + res.status)
                  done()
                success: (res) ->
                  packNumber++
                  console.log("yes! uploaded paddedPackNumber: " + paddedPackNumber)

                  db.bulkDocs res.docs, (error, doc) ->
                    if error
                      return alert "could not save initialization document: #{error}"
                    doOne()

            doOne() # kick it off

      )

      it('Query an Assessment', (done)->
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
        console.log("querying id: " + id)
        assessment.deepFetch
          success : ->
            console.log("assessment: " + JSON.stringify assessment)
            done()
          error: (model, err, cb) ->
            console.log "Error: " + JSON.stringify err
            done(err)
      )

#      it('new Pouch registered in allDbs', (done)->
#        this.timeout(15000);
#        pouchName = dbName;
#        dbs = [dbName];
#        after = (err) ->
#          new PouchDB(pouchName).destroy((er) ->
#            if (er)
#              console.log("i got an error: " + err)
#              done(er)
#            else
#              console.log("we can wrap this thing up: " + err)
#              done(err)
#          )
#
#    #    // create db
#        Tangerine.db = new PouchDB(pouchName, (err) ->
#          console.log("Created Pouch: " + pouchName)
#          if (err)
#            console.log("i got an error: " + err)
#            return after(err)
#
##          it('init pouch db', (done)->
##            this.timeout(15000);
#          result = checkDatabase(Tangerine.db, done)
##          console.log("checkDatabase: " + JSON.stringify  result)
##          )
#
#          PouchDB.allDbs( (err, dbs) ->
#            if (err)
#              return after(err)
#
#    #      // check if pouchName exists in _all_db
#            dbs.some( (dbname)->
#              console.log("pouchName: " + pouchName + " dbname: " + dbname)
#              return dbname == pouchName
#            ).should.equal(true, 'pouch exists in allDbs database, dbs are ' + JSON.stringify(dbs) + ', tested against ' + pouchName)
#            after()
#          )
#        )
#      )

      describe('Give it some context',  ()->
        describe('maybe a bit more context here', () ->
          it('should run here few assertions',  () ->
          )
        )
      )

  dbs.split(',').forEach((db) ->
#    dbType = /^http/.test(db) ? 'http' : 'local'
    tests db
  )

)()


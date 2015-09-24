(() ->
  'use strict'
#  envVars = require('system').env
#  PouchDB = require('pouchdb');
#  require('pouchdb-all-dbs')(PouchDB);
  if Mocha.process.browser
    dbs = 'testdb' + Math.random()
  else
    dbs = Mocha.process.env.TEST_DB

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

      afterEach( () ->
  #    // Remove old allDbs to prevent DOM exception
        return Promise.all(dbs.map( (db)->
          console.log("gonna destroy db:" + db)
          return new PouchDB(db).destroy()
        )).then(() ->
          console.log("PouchDB.resetAllDbs");
          return PouchDB.resetAllDbs()
        )
      )

      it('new Pouch registered in allDbs', (done)->
        this.timeout(15000);
        pouchName = dbName;
        dbs = [dbName];
        after = (err) ->
          new PouchDB(pouchName).destroy((er) ->
            if (er)
              done(er)
            else
              done(err)
          )

    #    // create db
        new PouchDB(pouchName, (err) ->
          console.log("Created Pouch: " + pouchName)
          if (err)
            return after(err)

#          checkDatabase(pouchName)
          it('init pouch db', (done)->
            result = checkDatabase(pouchName)
            console.log("checkDatabase: " + result)
          )

          PouchDB.allDbs( (err, dbs) ->
            if (err)
              return after(err)

    #      // check if pouchName exists in _all_db
            dbs.some( (dbname)->
              console.log("pouchName: " + pouchName + " dbname: " + dbname)
              return dbname == pouchName
            ).should.equal(true, 'pouch exists in allDbs database, dbs are ' + JSON.stringify(dbs) + ', tested against ' + pouchName)
            after()
          )
        )
      )

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

# Tangerine

![Tangerine](http://www.tangerinecentral.org/sites/default/files/tangerine-logo-150.png)

[![Build Status](https://travis-ci.org/Tangerine-Community/Tangerine-client.svg)](https://travis-ci.org/Tangerine-Community/Tangerine-client)

[![Stories in Ready](https://badge.waffle.io/Tangerine-Community/Tangerine-client.png?label=ready&title=Ready)](https://waffle.io/Tangerine-Community/Tangerine-client)

## Assess students with tablets or your phone

Tangerine is an application for assessing students on any scale, country-level, district-level or classroom-level.
Tangerine is designed for [Early Grade Reading Assessments](https://www.eddataglobal.org/reading/) but flexible and powerful enough to handle any survey's requirements.

Please visit the [wiki](https://github.com/Tangerine-Community/Tangerine/wiki) for the most up to date development guides
and references and [Tangerine Central](http://www.tanerinecentral.org) for much more information and news.

Alternatively put, Tangerine is a [CouchApp](http://couchapp.org/page/index) that uses
[Apache CouchDB](http://couchdb.apache.org/) built with [Backbone.js](http://backbonejs.org/), [LessCSS](http://lesscss.org/) written in [CoffeeScript](http://coffeescript.org/) augmented with [Sinatra](http://www.sinatrarb.com/) and PHP.

## Getting Started

_The following is a list of tools useful for Tangerine. Related: See the guide for setting up a
[Tangerine server](https://github.com/Tangerine-Community/Tangerine/wiki/Tangerine-Server).

[Node.js](https://nodejs.org/en/)

[Bower](http://bower.io)

Then clone this repo.

    git clone https://github.com/Tangerine-Community/Tangerine-client.git
	
Use the correct branch - for stable development, stick to master. For recent development, use develop

### Init the source code

    npm install
    bower install

These commands read the relevant node and ruby dependencies and installs all of the necessary libraries.

There's a postinstall script that runs when npm install is done that will add the android platform and then run gulp init.

### Start the app

To launch the app, run the npm start target, which uses the [http-server](https://www.npmjs.com/package/http-server)
and runs ./scripts/listen.rb to compile changed coffeescript files and other useful tasks.

    npm start
    
If you're doing application development, you'll want to run the debug gulp target

    npm run debug
    
When in debug, the app generates index-dev.html. View the app at http://localhost:8080/index-dev.html

### View the app

To view the app with minimised javascript, open http://localhost:8080

Sourcemaps are now available; therefore, you should be able to debug with them, although it is better to use the debug target (described above).

### Generate an APK
This requires [installing the Android SDK Tools](http://developer.android.com/sdk/installing/index.html?pkg=tools). 

    npm build:apk

### Other useful targets

View package.json for other useful npm targets:

 - npm listen turns on the changes listener and compiles coffeescript files.
 - npm run build:apk will generate a debug APK.
 - npm test will run mocha-phantomjs tests and watch for changes to coffeescript files.
 - npm run testW will run tests using mocha-phantomjs, displaying output on command line and watch for changes to coffeescript files.
 - npm run testWatch will run mocha tests in the browser at http://localhost:9000/test/ and watch for changes to coffeescript files.
 - npm run debug will copy files into www/compiled and build index-dev.html. Use this when using chrome debugger until gulp 
   handles sourcemaps better (https://github.com/terinjokes/gulp-uglify/issues/105). It's a little wonky; it may fail the first time it is run. Try again.
   
## Bootstrapping

Preload.js in the scripts dir will download assessments. Enter the username and password on the commandline:

    node preload.js T_ADMIN=user T_PASS=pass
    
## Resolving issues

Fork the repository and update your fork

    git remote show Tangerine-Community
    git checkout master
    git pull Tangerine-Community master

Get the id of the issue you’re fixing

    git checkout -b iss85

Fix the bug and commit the change. Submit a pull request.

## Resolving merge conflicts

Sometimes you will get a conflict when attempting to merge your update with master. Here's a solution:

 - Update your fork's master
 
        git checkout master
        git pull Tangerine-Community master
        
 - Merge your code into master
 
        git merge name-of-your-bugfix-fork
        
 - Fix the errors. 
 - Add them to git
 
        git add .
        
 - Commit       
    
## Clearing your pouch instance

Sometimes you need to start with a fresh pouch. Paste this to your javascript console and it will delete your tangerine pouch.

    var db = new PouchDB('tangerine');
      db.destroy().then(function () {
        // success
      }).catch(function (error) {
        console.log(error);
      });

## Testing

The tests run in mocha/phantomjs. The pouch runs in a in-memory container. 

This requires that you have the Grunt CLI installed globally.

```
npm install -g grunt-cli
```

To run the tests, use the following command.

```
npm test
```

To run the tests in a browser, compile the src code, compile the test, start the test server, and then navigate to http://127.0.0.1:9000/test/index.html

```
npm start
npm test
npm run testInBrowser 
```


## Dependencies

Using http://greenkeeper.io/ to manage dependencies.

## Tangerine API

Tangerine.progress is an object that contains status of the application: index, currentView, etc.

----

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.

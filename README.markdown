![Tangerine](https://github.com/Tangerine-Community/Tangerine/raw/develop/app/_attachments/images/tangerine_logo.png)

A tablet/phone application for assessing students

Tangerine is a couchapp (http://couchapp.org/page/index) that uses 
couchdb (http://couchdb.apache.org/) for a more streamlined process

# Getting Started - Mac
(Done using snow leopard, but Lion shouldn't be too different)

## 1. Using the tutorial at 
    http://moncefbelyamani.com/how-to-install-xcode-homebrew-git-rvm-ruby-on-mac/
install xCode, homebrew, git, rvm, and ruby. Get couchapp and couchdb from the sites above. 

## 2. Use the command
    brew doctor
to make sure everything is correct. When you have all the above installed 
and brew reports "Raring to Brew" you should be ready to move on.
Some known problems that can occur:
- Problem with the pathing of redundant config files. 
        Solved by moving them away from the root directory. 
- Error running 'make'
        Run all the updates for brew, git, ruby, etc.

## 3. Install additional programs:
Ruby
    rvm install 1.9.3
Watchr
    gem install watchr
rake
    gem install rake

## 4. Run couchapp:
    sudo env ARCHFLAGS="-arch i386 -arch x86_64" pip install couchapp

## 5. Build couchdb using one of the commands:
    build/bin/couchdb
    ~/build-couchdb/build/bin/couchdb
Note building couchdb may take upwards of an hour

## 6. Using github create a local clone of the tangerine repository
Note that the cloud version can be found at tangerine.iriscouch.com/tangerine

## 7. Install coffeescript (http://coffeescript.org) and node (http://nodejs.org)

## 8. Troubleshooting
- With couchdb running, go to the localhost server and add /_util to the url. Register as an admin. 
- You may need to get couchapprc and couchappignore from someone. 

## 9. At this point you should be ready to begin developing. 
With couchdb running, run watchr using 
    watchr file.watchr
and use
    couchapp push
to push tangerine to your localhost server!

----

Copyright (C) 2012  Michael McKay

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

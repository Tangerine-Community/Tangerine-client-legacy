var express = require('express');
var methodOverride = require('method-override')
var http = require('http');
var request = require('request');
var bodyParser = require('body-parser');
var SuperLogin = require('superlogin');
var dbString = 'http://admin:password@localhost:5984'
var nano = require('nano')(dbString);
var profilesDB = nano.db.use('profiles');
var _ = require('underscore');
var nodemailer = require('nodemailer');
var path = require('path')

var config = {
  dbServer: {
    protocol: 'http://',
    host: 'localhost:5984',
    user: 'admin',
    password: 'password',
    userDB: 'superlogin-users',
    couchAuthDB: '_users'
  },
  mailer: {
    fromEmail: 'no-reply@tangerinecentral.org',
    transport: require('nodemailer-sendgrid-transport'),
    options: {
        auth: {
          api_key: '' 
        }
    }
  },
  userDBs: {
    // These databases will be set up automatically for each new user
    defaultDBs: {
      // Private databases are personal to each user. They will be prefixed with your setting below and postfixed with $USERNAME.
      private: ['user']
    }
  }
}

// Initialize SuperLogin
var superlogin = new SuperLogin(config);

var app = express();
app.set('port', process.env.PORT || 80);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use('/', express.static(path.join(__dirname, '../app/src')));
app.use('/auth', superlogin.router);
http.createServer(app).listen(app.get('port'));
console.log('hello world');


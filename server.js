
/**
 * Module dependencies.
 *
 * Routs
 *  Views
 * 		index
 * 	API
 * 		tracker
 * 		-locations
 * 		-location
 *
 */

var express = require('express'),
  ht = require('http'),
  path = require('path'),
  io = require('socket.io');
  // engine = require('ejs-locals');

var app = express();

var passport = require('passport')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
        clientID: "446579420581-4p5cu6gd2sketrc1gagqnpecq8sprj70.apps.googleusercontent.com",
        clientSecret: "xgVnZBjDAjG66xCbPTXGBxnl",
        callbackURL: "http://127.0.0.1:3000/auth/google/return"
  },
  function(accessToken, refreshToken, profile, done) {
        process.nextTick(
                function () {
                        return done(null, profile.id);
                });

  }
));
passport.serializeUser(function(user, done) {
  console.log(user);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);

  // use ejs-locals for all ejs templates:
  // app.engine('ejs', engine);
  // app.set('views', __dirname + '/public/web');
  // app.set('view engine', 'ejs');
  app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	return next();
  });
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, '/public')));
});

require('./db');


app.configure('development', function(){
  app.use(express.errorHandler());
});

//Routes
app.get('/', function(req, res) {
  res.sendfile( __dirname + '/public/web/index.html');
});
require('./routes')(app);

//===============================





//Start server
var http = ht.Server(app);

http.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

var ioApp = io(http);

ioApp.on('connection', function(socket){
  console.log("Connected!");
  socket.on('chat msg', function(msg){
    console.log(msg);
    ioApp.emit('chat msg', msg);
  });
}); 

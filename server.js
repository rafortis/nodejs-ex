//  Express + mongoose 
var express = require('express'),
  app = express(),
  morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose'); // ORM

// Domain
var Level = require('./domain/Level');

// REST router
var router = express.Router();

Object.assign = require('object-assign');
app.use(morgan('combined'));
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
  mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || undefined,
  mongoURLLabel = "";

if (process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
    mongoPassword = process.env[mongoServiceName + '_PASSWORD']
  mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase;

  }
}

// Initialize connection once
if (mongoURL != undefined) {
  // DATABASE SETUP
  mongoose.connect(mongoURL); // connect to our database

  // Handle the connection event
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));

  db.once('openUri', function () {
    console.log("DB connection alive");
  });
}

// middleware to use for all requests
router.use(function (req, res, next) {
  // do logging
  console.log('Something is happening.');
  next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
  res.json({ message: 'cmr backend' });
});

// on routes that end in /bears
// ----------------------------------------------------
router.route('/levels')

  // create a bear (accessed at POST http://localhost:8080/bears)
  .post(function (req, res) {
    levelDTO = req.body;
    console.log(JSON.stringify(levelDTO));
    var level = new Level(levelDTO);
    console.log(JSON.stringify(level));
    level.save(function (err) {
      if (err)
        res.send(err);
      else
        res.json({ message: 'Level created!', levelNumber: level.levelNumber });
    });


  })

  // get all the bears (accessed at GET http://localhost:8080/api/levels)
  .get(function (req, res) {
    Level.find(function (err, levels) {
      if (err)
        res.send(err);

      res.json(levels);
    });
  });

router.route('/levels-count')
  .get(function (req, res) {
    Level.count(function (err, count) {
      if (err)
        res.send(err);

      res.json({ "levelsCount": count });
    });
  });


// on routes that end in /levels/:id
// ----------------------------------------------------
router.route('/levels/:id')

  // get the bear with that id
  .get(function (req, res) {
    Level.findOne({ "levelNumber": req.params.id}, function (err, level) {
      if (err)
        res.send(err);
      res.json(level);
    });
  })

  // update the bear with this id
  .put(function (req, res) {
    Level.findOneAndUpdate({ "levelNumber": req.params.id}, req.body, function (err, level) {

      if (err)
        res.send(err);

      level.name = req.body.name;
      level.save(function (err) {
        if (err)
          res.send(err);

        res.json({ message: 'Level updated!' });
      });

    });
  })

  // delete the bear with this id
  .delete(function (req, res) {
    Level.findOneAndRemove({
      "levelNumber": req.params.id
    }, function (err, level) {
      if (err)
        res.send(err);

      res.json({ message: 'Successfully deleted' });
    });
  });


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

// error handling
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

module.exports = app;

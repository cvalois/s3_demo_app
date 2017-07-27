// Node Standard Library
var http = require('http');
var path = require('path');
var zlib = require('zlib');
var fs   = require('fs');

// Node minimal webserver
var express = require('express');

// Node AWS SDK
// homepage: http://aws.amazon.com/sdk-for-node-js/
var aws = require('aws-sdk');

// Multer is a node.js middleware for handling multipart/form-data.
// homepage: https://github.com/expressjs/multer
var multer  = require('multer')


// Initialize Express Application
var app = express();

// Set Application Defaults
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('port', process.argv[2] || 3000);
app.use(express.static(path.join(__dirname, 'assets')));
app.use(multer({
  dest: './uploads/'
}));

// Scality S3 Credentials
var ACCESS_KEY     = "accessKey1";
var SECRET_KEY     = "verySecretKey1";


// Configure credentials to be used by
// the node AWS-SDK for all REST calls
aws.config.update({accessKeyId: ACCESS_KEY , secretAccessKey: SECRET_KEY});
aws.config.update({ s3ForcePathStyle: true }); // added this



// Set Scality S3 endpoint used by the node AWS-SDK

var ep = new aws.Endpoint('http://localhost:32768/');

//var s3 = new aws.S3({endpoint: ep});
var s3 = new aws.S3({endpoint: ep, s3ForcePathStyle: true});






//s3ForcePathStyle: true

/*****************************
     Application Router
*****************************/

// GET Requests

app.get('/', function(req, res){
  res.render('index.html');
});

app.get('/list_buckets', function(req, res) {

  s3.listBuckets(function(err, data) {
    if (err) {
      res.write(JSON.stringify(err));
      res.end();
    }
    else {
      var bucketList = [];
      for(var i in data.Buckets) {
        var bucket = data.Buckets[i];
        bucketList.push(bucket);
      }
      res.write(JSON.stringify(bucketList));
      res.end();
    }
  });
});

app.get("/:bucket/list_objects", function(req, res) {



  s3.listObjects({Bucket: req.params.bucket}, function(err, data) {
    if (err) {
      res.write(JSON.stringify(err));
      res.end();
    }
    else {
      res.write(JSON.stringify(data["Contents"]));
      res.end();
    }
  });
});

// POST Requests

app.post("/:bucket/new_bucket", function(req, res) {
  var bucket = req.params.bucket;
  var s3 = new aws.S3({
    endpoint: ep,
    params: {
      Bucket: bucket,
      Key: ''
    }



  });



  s3.createBucket(function(err) {
    if (err) {
      res.write(JSON.stringify(err));
      res.end();
    }
    else {
      s3.upload({Body: 'We have created a new object in '+bucket+' at '+Date()}, function() {
        res.write(JSON.stringify({Body: 'We have created a new object in '+bucket+' at '+Date()}));
        res.end();
      });
    }
  });
});

app.post("/add_object", function(req, res) {
  var FILEPATH = req.files["new_file"].path;
  var FILENAME = req.files["new_file"].originalname;
  var bucket   = req.body.bucket;

  aws.config.update({accessKeyId: ACCESS_KEY , secretAccessKey: SECRET_KEY});


  //var ep = new aws.Endpoint('http://localhost:8000/');
  var ep = new aws.Endpoint('http://localhost:32768/');
  
  var body = fs.readFileSync(FILEPATH);




  var s3obj = new aws.S3({
    endpoint: ep,
    params: {
      Bucket: bucket,
      Key: FILENAME

    }


 });



  s3obj.putObject({
    Body: body,
    ContentType: req.files["new_file"].mimetype,
    ContentEncoding: req.files["new_file"].encoding,
    ContentLength: req.files["new_file"].size
  }).
    on('httpUploadProgress', function(evt) {
      console.log(evt);
    }).send(function(err, data) {
      if (err) {
        console.log(err);
        res.status(500).send();
      } else{
        res.status(200).send(JSON.stringify(data));
      }
    });
});

// DELETE Requests

app.delete("/:bucket", function(req, res){
  var params = {
    Bucket: req.params.bucket
  };
  s3.deleteBucket(params, function(err, data) {
    if (err) {
      res.status(404);
      res.write(JSON.stringify(err));
      res.end();
    } else{
      res.write(JSON.stringify(data));
      res.end();
    }
  });
});

app.delete("/:bucket/:key", function(req, res) {
  var bucket = req.params.bucket;
  var key    = req.params.key;

  var params = {
    Bucket: bucket,
    Key: key
  };

  s3.deleteObject(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
      res.status(500).send();
    } else {
      res.status(200).send(JSON.stringify(data));
    }
  });
});

/*****************************
    End Application Router
*****************************/


// Host/Port used by Express Framework
// Default is set to port 3000. Optional
// argument can be passed to node application
// at runtime:
//
// $ node S3_api.js 8001
//
app.listen(app.get('port'));

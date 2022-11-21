const express = require("express");
const path = require("path");
const mongojs = require("mongojs");
const bodyParser = require("body-parser");
var cors = require("cors");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: true }));

var databaseUrl = "flightDB";
var collections = ["flights"];
var db = mongojs(databaseUrl, collections);

app.get("/api", function (req, res) {
  res.send("Our Sample API is up...");
});

app.get("/getflights", function (req, res) {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET");
  db.flights.find({}, function (err, flights) {
    if (err || flights.length == 0) res.end("No flights found");
    else {
      res.writeHead(200, { "Content-Type": "application/json" }); // Sending data via json

      // Send all records in flights
      str = JSON.stringify(flights);
      res.end(str);
    }
  });
});

app.get("/getflightByID", function (req, res) {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET");
  var fid = req.query.id;
  db.flights.findOne({ fid: fid }, function (err, flights) {
    if (err || flights.length == 0) res.end("No flights found");
    else {
      res.writeHead(200, { "Content-Type": "application/json" }); // Sending data via json
      console.log(flights);
      // Send all records in flights
      str = JSON.stringify(flights);
      res.end(str);
    }
  });
});

app.get("/getflightIDs", function (req, res) {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET");
  console.log("Inside Function");
  db.flights.distinct("fid", {}, function (err, flights) {
    res.writeHead(200, { "Content-Type": "application/json" }); // Sending data via json
    console.log("Inside command");
    console.log(flights);
    // Send all records in flights
    str = JSON.stringify(flights);
    res.end(str);
  });
});

app.get("/getflightsByDate", function (req, res) {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET");
  var date = req.query.dot;
  var from = req.query.from;
  var to = req.query.to;
  if (!date || !from || !to) {
    res.end("Enter all valid parameters");
  } else {
    db.flights.find({ from: from, to: to, dot: date }, function (err, flights) {
      //   console.log(flights);

      res.writeHead(200, { "Content-Type": "application/json" }); // Sending data via json

      // Send all records in flights
      str = JSON.stringify(flights);
      res.end(str);
      // }
    });
  }
});

app.post("/addflight", function (req, res) {
  //   console.log("POST: ");
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST");

  if (!req.body) {
    res.end("Enter details");
  } else {
    console.log(req.body);
    // console.log(req.body.flight);
    var jsonData = req.body;
    // console.log(jsonData);
    db.flights.save(
      {
        fid: jsonData.id,
        fname: jsonData.name,
        from: jsonData.from,
        to: jsonData.to,
        dot: jsonData.dot,
        n_business: jsonData.num_business,
        n_eco: jsonData.num_eco,
        n_pre_eco: jsonData.num_pre_eco,
        total: jsonData.num_business + jsonData.num_eco + jsonData.num_pre_eco,
        status: "on-time",
        stime: jsonData.stime,
        etime: jsonData.etime,
      },
      function (err, saved) {
        // Query in MongoDB via Mongo JS Module
        if (err || !saved) res.end("Flight not saved");
        else res.end("Flight saved");
      }
    );
  }
});

app.post("/modifyStatus", function (req, res) {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST");

  if (!req.body) {
    res.end("Enter details");
  } else {
    var toSet = {
      stime: "",
      etime: "",
      dot: "",
      from: "",
      to: "",
      status: "",
    };
    // console.log(req.body);
    var jsonData = req.body;
    var id = jsonData.id;
    delete jsonData.id;
    // db.flights.find({fid:id}, function(err,flights){

    // })

    Object.keys(jsonData).forEach((key) => {
      if (!(key in toSet)) {
        delete jsonData[key];
      }
    });
    console.log(jsonData);
    if (JSON.stringify(jsonData) != "{}") {
      db.flights.findAndModify(
        {
          query: { fid: id },
          update: { $set: jsonData },
        },
        function (err, doc, lastErrorObj) {
          if (err) {
            res.end("Could not modify data");
          } else {
            res.end("Updated Successfully");
          }
        }
      );
    } else {
      res.end("Enter Valid details");
    }
  }
});

app.post("/deleteflightByID", function (req, res) {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET");
  var fid = req.body.id;
  console.log(fid);
  db.flights.remove({ fid: fid }, true, function (err) {
    console.log("inside delete function");
    if (err) {
      res.writeHead(300, { "Content-Type": "application/json" });
      var str = JSON.stringify("No Flights found");
      res.end(str);
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      var str = JSON.stringify("Removed successfully");
      res.end(str);
    }
  });
});
// Launch server
app.listen(1212);

/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

let tableName = "venue-dev";

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

// Read all active venues
app.get("/venues", function (req, res) {
  const params = {
    TableName: tableName,
    FilterExpression: "#active_status = :status",
    ExpressionAttributeValues: { ":status": 1 },
    ExpressionAttributeNames: { "#active_status": "status" },
  };
  db.scan(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message, url: req.url });
    } else {
      res.json({
        statusCode: 200,
        url: req.url,
        data: result.Items,
      });
    }
  });
});

// Read all featured venues
app.get("/venues/featured", function (req, res) {
  const params = {
    TableName: tableName,
    FilterExpression: "#active_status = :status",
    ExpressionAttributeValues: { ":status": 4 },
    ExpressionAttributeNames: { "#active_status": "status" },
  };

  db.scan(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message, url: req.url });
    } else {
      res.json({
        statusCode: 200,
        url: req.url,
        data: result.Items,
      });
    }
  });
});

// get all venues from search query
app.post("/venues/search", function (req, res) {
  const params = {
    TableName: tableName,
    FilterExpression:
      "(contains(#attribute, :value) AND (#active_status = :active) ) OR ( #attribute = :value)",
    ExpressionAttributeValues: {
      ":value": req.body.value,
      ":active": 1,
    },
    ExpressionAttributeNames: {
      "#attribute": req.body.attribute,
      "#active_status": "status",
    },
  };

  db.scan(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message, url: req.url });
    } else {
      res.json({
        statusCode: 200,
        url: req.url,
        data: result.Items,
      });
    }
  });
});

// create a venue
app.post("/venues", function (req, res) {
  const params = {
    TableName: tableName,
    Item: req.body,
  };

  db.put(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message, url: req.url });
    } else {
      res.json({
        statusCode: 200,
        url: req.url,
        data: result.Item,
      });
    }
  });
});

// get a venue by id
app.get("/venues/:id", function (req, res) {
  let params = {
    TableName: tableName,
    Key: {
      id: req.params.id,
    },
  };
  db.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message, url: req.url });
    } else {
      res.json({
        statusCode: 200,
        url: req.url,
        data: result.Item,
      });
    }
  });
});

// update a venue by id
app.put("/venues/:id", function (req, res) {
  let params = {
    TableName: tableName,
    Key: {
      id: req.params.id,
    },
  };
  db.update(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message, url: req.url });
    } else {
      res.json({
        statusCode: 200,
        url: req.url,
        data: result.Item,
      });
    }
  });
});

app.listen(3000, function () {
  console.log("App started");
});

module.exports = app;

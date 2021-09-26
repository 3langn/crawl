"use strict";
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

var common = require("./common");
const crawlerMogiDotVN = require("./crawlerRealEstate/crawlerMogiDotVN");

app.use(bodyParser.json());

app.get("/HealthCheck", function (req, res) {
  res.status(200).send(`HealthCheck ok ${new Date()}`);
});

app.get("/getitemmogi", function (req, res) {
  //"https://mogi.vn/mua-nha-dat"
  //"https://raovat.vnexpress.net/mua-ban-nha-dat"
  https: var start = new Date() - 1;
  crawlerMogiDotVN
    .crawlPage("https://raovat.vnexpress.net/mua-ban-nha-dat")
    .then((data) => {
      res.status(200).send(data);
      common.addLog("Execution time: " + (start - (new Date() - 1)) + "ms");
    });
});

var port = process.env.PORT || 8001;
app.listen(port, function () {
  console.log(`start listen at 0.0.0.0:${port}`);
});

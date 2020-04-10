/**
 * Routes Definitions
 */

var express = require('express');
var router = express.Router();

router.get("/", (req, res, next) => {
    res.render("form", { title: "Jingle Wallet v1.0" });
  });

  module.exports = router;
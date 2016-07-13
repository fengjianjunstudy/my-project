var express = require('express');
var router = express.Router();
var db = require('../db.json');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express2',list:db });
});

module.exports = router;
'use strict';
let path = require('path');
var express = require('express');
var router = express.Router();
const db = require(path.join(__dirname,'../db'));
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('user',{logined:req.session.logined,list:db.list});
});
router.get('/login',(req,res) => {
  res.render('login');
});
router.post('/login',(req,res) => {
  let {user_name,password} = req.body;
  if(user_name === 'fjj_321' && password === 'feng870615'){
    if(!req.session.logined){
      req.session.logined = true;
    }
    res.redirect('/users')
  }else {
    res.redirect('/users/login')
  }
});
router.get('/update/:id?',(req,res) => {
  if(req.session.logined) {
    let id = 'my'+req.query.id,
        user = id?db.find(id):undefined;
    res.render('user-form',{logined:req.session.logined,user:user});
  }else{
    res.redirect('/users/login');
  }
});
router.post('/update',(req,res) => {
  if(req.session.logined) {
    let {user_id,user_name,email} = req.body;
    if(user_id) {

      db.update(user_id,{user_name:user_name,email:email});
    }else{
      db.add({user_name:user_name,email:email});
    }
    res.redirect('/users');
  }else{
    res.redirect('/users/login');
  }
});
router.get('/del/:id?',(req,res) => {
  if(req.query.id) {
    db.delete('my'+req.query.id);
  }
  res.redirect('/users')
});
router.get('/loginout',(req,res) => {
  req.session.logined = false;
  res.redirect('/users');
});
module.exports = router;

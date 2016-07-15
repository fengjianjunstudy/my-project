'use strict';
let path = require('path');
var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const db = require(path.join(__dirname,'../db'));
const User = require('../models/user');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('user',{logined:req.session.logined,list:db.list});
});
//登陆
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
//编辑及添加
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
//删除
router.get('/del/:id?',(req,res) => {
  if(req.query.id) {
    db.delete('my'+req.query.id);
  }
  res.redirect('/users')
});
//退出
router.get('/loginout',(req,res) => {
  req.session.logined = false;
  res.redirect('/users');
});
//注册
router.get('/reg',(req,res) => {
  res.render('reg',{err:req.flash('err'),success:req.flash('success')});
});
router.post('/reg',(req,res) => {
  let {userName,password,repwd,email} = req.body;
  if(password !== repwd) {
    req.flash('err',false);
    res.redirect('/users/reg');
  }
  let md5 = crypto.createHash('md5'),
      ps = md5.update(password).digest('hex');
  let newUser = new User(userName,ps,email);
  User.get(newUser.userName,(err,user) => {
    if(user) {
      req.flash('err',"用户已经存在");
      return res.redirect('/users/login')
    }
    newUser.save((err,user) => {
      if(user) {
        return res.redirect('/users/login')
      }
    });
  })

});
module.exports = router;

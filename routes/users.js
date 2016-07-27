'use strict';
let path = require('path');
var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const db = require(path.join(__dirname,'../db'));
const User = require('../models/user');
const Article = require('../models/article');
const Comment = require('../models/comment');
//const multer = require('multer');
//let upload = multer({
//  dest:'./public/images',
//  rename:function(fieldname,filename) {
//    return fieldname;
//  }
//});

/* GET users listing. */
router.get('/',checkLogin,function(req, res) {
  let articleList = [];
  //let userName = req.session.user.userName;
  let query ={};
  Article.get(query,(err,docs) => {
    if(err) {
      //return console.log(err);
    }
    articleList = docs;
    res.render('user',{title:'用户界面',user:req.session.user,err:req.flash('err').toString(),success:req.flash('success').toString(),list:articleList});
  });

});
//登陆
router.get('/login',checkNotLogin,loginGetFn);
router.post('/login',loginPostFn);
//编辑及添加
router.get('/update/:id?',checkLogin,updateGetFn);
router.post('/update',checkLogin,updatePostFn);
//删除
router.get('/del/:id?',checkLogin,delGetFn);
//退出
router.get('/loginout',checkLogin,loginOutFn);
//注册
router.get('/reg',checkNotLogin,regGetFn);
router.post('/reg',regPostFn);
//文章发表
router.get('/article',checkLogin,articleGetFn);
router.post('/article',[checkLogin,multipartMiddleware],articlePostFn);

//编辑文章
router.get('/edit/:userName/:time/:title',checkLogin,editGetFn);
router.post('/edit',[checkLogin,multipartMiddleware],editPostFn);

//删除文章
router.get('/del/:userName/:time/:title',checkLogin,delGetFn);
//查看文章
router.get('/:userName/:time/:title',checkLogin,checkArticleFn);

//留言
router.post('/comments',[checkLogin,multipartMiddleware],commentPostFn);

function regPostFn(req,res) {
  let {userName,password,repwd,email} = req.body;
  if(password !== repwd) {
    req.flash('err','两次密码不一致！');
    return res.redirect('/users/reg');
  }
  let md5 = crypto.createHash('md5'),
      ps = md5.update(password).digest('hex');
  let newUser = new User(userName,ps,email);
  User.get(newUser.userName,(err,user) => {
    if(user) {
      req.flash('err',"用户已经存在");
      return res.redirect('/users/login');
    }
    newUser.save((err,user) => {
      if(err) {
        req.flash('err',err);
        return res.redirect('/users/reg');
      }
      req.session.user = user;
      req.flash('success','注册成功');
      res.redirect('/users/login');
    });
  })
}

function regGetFn(req,res) {
  res.render('reg',{title:'注册界面',err:req.flash('err').toString(),success:req.flash('success').toString()});
}

function delGetFn(req,res) {
  if(req.query.id) {
    db.delete('my'+req.query.id);
  }
  res.redirect('/users')
}

function updatePostFn(req,res) {
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
}

function updateGetFn(req,res) {
  let id = 'my'+req.query.id,
      user = id?db.find(id):undefined;
  res.render('user-form',{title:'新建或者更新界面',user:user,err:req.flash('err').toString(),success:req.flash('success').toString()});
}

function loginPostFn(req,res) {
  let {user_name,password} = req.body;
  let md5 = crypto.createHash('md5');
  let pwd = md5.update(password).digest('hex');
  User.get(user_name,(err,user) => {
    if(!user) {
      req.flash('err','用户不存在');
      return res.redirect('/users/login');
    }
    if(user.password !== pwd) {
      req.flash('err','密码不正确');
      return res.redirect('/users/login');
    }
    if(!req.session.logined){
      req.session.logined = true;
    }
    req.session.user = user;
    req.flash('success','登陆成功')
    res.redirect('/users')
  });
}

function loginGetFn(req,res) {
  res.render('login',{title:'登陆',err:req.flash('err').toString(),success:req.flash('success').toString()});
}

function loginOutFn(req,res) {
  req.session.logined = false;
  req.flash('success','退出成功');
  req.session.user = null;
  res.redirect('/users');
}

function checkLogin(req,res,next) {
  if(!req.session.user) {
    req.flash('err','未登录');
    return res.redirect('/users/login');
  }
  next();
}

function checkNotLogin(req,res,next) {
  if(req.session.user) {
    req.flash('err','已经登录');
    return res.redirect('/users')
  }
  next();
}

function articleGetFn(req,res) {
  res.render('articlePost',{title:'发表文章',user:req.session.user,err:req.flash('err').toString(),success:req.flash('success').toString()});
}

function articlePostFn(req,res) {
  let user = req.session.user;
  let {title,content} = req.body;
  //let imgFile = req.files.imgFile; //上传图片
  let newArticle = new Article(user.userName,title,content);
  newArticle.save((err) => {
    if(err) {
      req.flash('err',err);
      res.redirect('/users')
    }
  });
  req.flash('success','发表成功');
  res.redirect('/users');
}

function checkArticleFn(req,res) {
  req.params.time = Number(req.params.time);
  Article.getOne(req.params,true,(err,doc) => {
    if(err) {
      req.flash('err',err);
    }
    if(doc) {
      let time;
      let date = new Date(doc.time);

      time = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      doc.formatTime = time;
      req.flash('success','预览成功');
      res.render('article',{title:'文章页',article:doc,err:req.flash('err').toString(),success:req.flash('success').toString(),user:req.session.user});
    }
  })
}

function editGetFn(req,res) {
  let query = req.params;
  query.time = Number(query.time);
  Article.getOne(query,false,(err,article) => {
    if(err) {
      req.flash('err',err);
    }
    req.flash('success','进入编辑状态');
    res.render('articleEdit',{title:'编辑文章',err:req.flash('err').toString(),success:req.flash('success').toString(),user:req.session.user,article:article})
  })
}

function editPostFn(req,res) {
  let article = req.body;
  article.time = Number(article.time);
  Article.update(article,(err,result) => {
    if(err) {
      req.flash('err','更新失败');
    }
    req.flash('success','更新成功');
    res.redirect('/users')
  })


}

function delGetFn(req,res) {
  let filter = req.params;
  filter.time = Number(filter.time);
  Article.deleteOne(filter,(err,result) => {
    if(err) {
      req.flash('err','删除失败');
    }
    req.flash('success','删除成功');
    res.redirect('/users')
  });
}

function commentPostFn(req,res) {
  let filter = {
    userName:req.body.userName,
    time:Number(req.body.time),
    title:req.body.title
  };
  let comment = new Comment(req.body.name,req.body.content);
  comment.save(filter,(err,result) => {
    if(err) {
      req.flash('err','评论失败');
    }else{
      req.flash('success','评论成功');
    }
    res.redirect('/users/'+filter.userName+'/'+filter.time+'/'+filter.title);
  })

}
module.exports = router;

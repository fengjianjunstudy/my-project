/**
 * Created by fengjj on 2016/7/25.
 */
let mongodb = require('./db.js');
let markdown = require('markdown').markdown;
class Article {
    constructor(userName,title,content,imgFile) {
        this.userName = userName;
        this.title = title;
        this.content = content;
        this.imgFile = imgFile;
    }
    save(callback) {
        let time = new Date();
        let newArticle = {
            userName:this.userName,
            title:this.title,
            content:this.content,
            imgFile:this.imgFile,
            time:time.getTime()
        }
        console.log(newArticle)
        mongodb.open((err,db) => {
            if(err) {
                return callback(err)
            }
            db.collection('article',(err,collection) => {
                if(err) {
                    mongodb.close();
                    return callback(err);
                }
                collection.insert(newArticle,(err,article) => {
                    mongodb.close();
                    if(err) {

                        callback(err);
                    }
                })
            })
        })

    }
    static get(query,callback) {
        mongodb.open((err,db) => {
            if(err) {
                return callback(err)
            }
            db.collection('article',(err,collection) => {
                if(err) {
                    mongodb.close();
                    return callback(err);
                }
                collection.find(query).sort({time:-1}).toArray((err,docs) => {
                    mongodb.close();
                    if(err) {
                        return callback(err);
                    }
                    docs.forEach((doc) => {
                        if(doc.content) {
                            doc.content = markdown.toHTML(doc.content);
                        }
                    })
                    callback(null,docs);
                })
            })
        })
    }
    static getOne(query,callback) {
        console.log(query);
        mongodb.open((err,db) => {
            if(err) {
                return callback(err)
            }
            db.collection('article',(err,collection) => {
                if(err) {
                    mongodb.close();
                    return callback(err);
                }
                collection.findOne(query,(err,result) => {
                    mongodb.close();
                    if(err) {
                        return callback(err);
                    }
                    if(result && result.content) {
                        result.content = markdown.toHTML(result.content);
                    }
                    callback(null,result);
                })
            })
        })
    }
}
module.exports = Article;
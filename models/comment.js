/**
 * Created by fengjj on 2016/7/27.
 */
'use strict';
let mongodb = require('./db.js');
class Comment{
    constructor(name,content) {
        this.name = name;
        this.content = content;
    }
    save(filter,callback) {
        let comment = {
            name:this.name,
            content:this.content,
            time:new Date().getTime()
        }
        mongodb.open((err,db) => {
            if(err) {
                return callback(err);
            }
            db.collection('article',(err,collection) => {
                if(err) {
                    mongodb.close();
                    return callback(err);
                }
                collection.updateOne(filter,{ $push: { comments:comment} },(err,result) => {
                    mongodb.close();
                    if(err) {
                        return callback(err);
                    }
                    callback(null,result);
                });
            });
        });
    }
}
module.exports = Comment;
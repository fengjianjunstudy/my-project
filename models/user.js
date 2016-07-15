/**
 * Created by fengjj on 2016/7/15.
 */
'use strict';
let mongodb = require('./db.js');

class User{
    constructor(userName,password,email) {
        this.userName = userName;
        this.password = password;
        this.email = email;
    }
    save(callback) {
        let user = {
            userName:this.userName,
            password:this.password,
            email:this.email
        }
       mongodb.open((err,db) => {
           if(err) {
               return callback(err);
           }
           db.collection('users',(err,collection) => {

                if(err) {
                    return callback(err);
                }
               collection.insert(user,(err,user) => {
                   mongodb.close();
                   if(err) {
                       return callback(err);
                   }
                   callback(err,user[0]);
               })

           });
       });
    }
    static get(userName,callback) {
        mongodb.open((err,db) => {
            if(err) {
                mongodb.close();
                return callback(err);
            }
            db.collection('users',(err,collection) => {
                if(err) {
                    mongodb.close();
                    return callback(err);
                }
                collection.findOne({
                    userName:userName
                },(err,user) => {
                    mongodb.close();
                    if(err) {
                        return callback(err);
                    }
                    callback(null,user)
                });

            });

        })
    }
}
module.exports = User;
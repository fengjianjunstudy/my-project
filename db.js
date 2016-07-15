/**
 * Created by fengjj on 2016/7/11.
 */
'use strict';

const path = require('path');
const DB_PATH = path.join(__dirname,'/db.json');
const fs = require('fs');
let dataList = JSON.parse(fs.readFileSync(DB_PATH));
module.exports = {
    add(user) {
        user.id ='my'+dataList.length;
        dataList.push(user);
        this.store();
    },
    delete(id) {
        dataList = dataList.filter((user) => {
            return user.id !== id;
        });
        this.store();
    },
    update(id,user) {
        dataList = dataList.map((u) => {
            if(u.id === id) {
                let keys = Object.keys(user);
                for(let k of keys) {
                    u[k] = user[k];
                }
            }
            return u;
        });
        this.store();
    },
    find(id) {
        return dataList.filter((user) => {
            if(user.id === id){
                return user;
            }
        })[0];
    },
    get list() {
        return dataList;
    },
    store() {
        fs.writeFile(DB_PATH,JSON.stringify(dataList),function() {
            console.log('successful');
        });
    }
}

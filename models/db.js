/**
 * Created by fengjj on 2016/7/14.
 */
'use strict';
let setting = require('../setting');
let {Db,Connection,Server} = require('mongodb');
module.exports = new Db(setting.db,new Server(setting.host,setting.port),{safe:true});

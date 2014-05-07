        var utils = {};
        /*
                //opserator 设置为true则使用自定义参数如："_type=json&pageNum=1&pageSize=10&model="+model+"&"+params
                需要使用ajax jqmobi 或jquery都可以
                params 参数格式
                ： address=xx&name=xx
        */
        //跨域全局设置  
        //跨域调用只能写域名或id
            //本地测试使用机器名，手机跨域测试不能使用机器名
            utils.data = {};
            utils.data.mainUrl = 'http://192.168.1.172:8080/ips_v4/webservice/rest/';
            utils.data.resourceManagerUrl = utils.data.mainUrl + 'RESTResrouceService/';
            utils.data.workorderUrl = utils.data.mainUrl + 'RESTWorkOrder/';


            utils.wsJsonP = function(url,params,successFun,errorFun) {
                var model = "jsonp";
                $.ajax({
                        type : "get",
                        async: false,
                        /*url : "http://192.168.1.192:8080/ips_v4/webservice/rest/RESTResrouceService/getODFList",
                        dataType : "jsonp",
                        data :"address="+val+"&_type=json",*/

                        //url : "http://192.168.1.192:8080/ips_v4/webservice/rest/RESTResrouceService/getString",
                        url : url,
                        dataType : "jsonp",
                        //pageNum=? 填写在param里
                        data : "_type=json&model="+model+"&"+params,
                        jsonp: "callback",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(默认为:callback)
                        //回调函数为jsonp_callback 此处已在 appframework.min.js 中修改 不加上后面的数字 另外在java中返回的字符为 jsonp_callback(json)
                        // jsonpCallback:"jsonpCallback",//自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名  
                        success : successFun || function(result){
                            alert('调用成功！');
                        },
                        error : errorFun || function (error) {
                            alert('网络异常，调用失败！' + error);
                            $.ui.hideMask();
                        }
                });
            }
            utils.wsJsonPUUID = function (url,params,successFun,errorFun) {
                console.log('URL['+url+']'+'PARAMS['+params+']');
                if (myPhoneGapApi.utils.getConnection()) {
                    console.log('--------网络查询--------------');
                    dbDataBase.jsonpUUID(url,params,successFun,errorFun);
                } else {
                    console.log('--------离线查询--------------');
                    utils.localDBHandle(url,params,successFun,errorFun);
                }
            }
            utils.downloadDB = function(){
                dbDataBase.downloadDB();
            }
            utils.localDBHandle = function (url,params,successFun,errorFun) {
                var isSupportOffline = false;//是否支持离线查询
                //过滤url使得其他不支持的url提示 不支持离线下载
                var mapUrl = {
                    ODF2 : /getODFList/g,
                    BOX : /getBOXList/g,
                    TER : /getTERList/g
                };
                //ws端口方法名
                var mapPortsUrl = {
                    ODF2 : /getODFPortsList/g,
                    BOX : /getBOXPortsList/g
                };
                //匹配基本资源
                $.each(mapUrl,function(key,val){
                    if (val.test(url)) {
                        console.log(val+'资本资源匹配成功：'+url);
                        isSupportOffline = true;
                        return false;
                    } 
                });
                //匹配端口资源
                $.each(mapPortsUrl,function(key,val){
                    if (val.test(url)) {
                        console.log(val+'端口资源匹配成功：'+url);
                        isSupportOffline = true;
                        return false;
                    } 
                });
                if (!isSupportOffline) {
                    alert('不支持离线下载！');
                    $.ui.hideMask();
                    window.history.back();
                    return false;
                }
                dbDataBase.getRes(url,params,successFun,errorFun);
            }

            utils.parseDate = function(str,format){
                var date = new Date(0);
                var get = function(part){
                    var idx = format.indexOf(part);
                    return (idx == -1) ? null : parseInt(str.substr(idx, part.length).replace(/^0/,''));
                }
                var mapp = {
                     'yyyy' : 'setFullYear'
                    ,'yy'   : 'setYear'
                    ,'MM'   : 'setMonth'
                    ,'M'    : 'setMonth'
                    ,'dd'   : 'setDate'
                    ,'HH'   : 'setHours'
                    ,'hh'   : 'setHours'
                    ,'mm'   : 'setMinutes'
                    ,'ss'   : 'setSeconds'
                };
                for(var attr in mapp){
                    var n = get(attr);
                    var f = mapp[attr];
                    if( n != null ){
                        if( attr == 'MM' ){
                            n--;
                        }
                        date[f](n);
                    }
                };
                return date;
            };
            utils.formatDate = function(date,format){
                var fill = function(num){
                    return (['00','01','02','03','04','05','06','07','08','09','10','11','12'][num]||num);
                }
                var isJavaDateObject = function(date){
                    return date != null && 
                        typeof(date) == 'object' 
                        && date.date != undefined
                        && date.day != undefined
                        && date.hours != undefined
                        && date.minutes != undefined
                        && date.month != undefined
                        //&& date.nanos != undefined
                        && date.seconds != undefined
                        && date.time != undefined
                        && date.timezoneOffset != undefined
                        && date.year != undefined;
                }
                if( date == undefined ) {
                    return date;
                }
                else if( date instanceof Date ){
                    return format
                        .replace(/yyyy/g, date.getFullYear())
                        .replace(/MM/g, fill(date.getMonth()+1))
                        .replace(/dd/g, fill(date.getDate()))
                        .replace(/HH/, fill(date.getHours()))
                        .replace(/mm/, fill(date.getMinutes()))
                        .replace(/ss/, fill(date.getSeconds()));
                }
                else if( isJavaDateObject(date) ){
                    return utils.formatDate(new Date(date.time), format);
                }
                else{
                    throw 'arguments[0] must be a date object.';
                }
            };
            utils.date = function(_date, _format) {
                var date = _format ? utils.parseDate(_date, _format) : (_date || new Date());
                    date.add = function(_field, num){
                        var field = _field.substr(0,1).toUpperCase() + _field.substr(1).toLowerCase();
                        if( !this['get' + field] ) {
                            throw '[utils.addDate]unexpect field:' + _field;
                        }
                        var date = this.clone();
                            date['set'+field]( date['get'+field]() + num );
                        return date;
                    }
                    date.trans = function(org, dst) {
                        return utils.date( utils.parseDate( utils.formatDate(this, org), dst ) );
                    }
                    date.format = function(format) {
                        return utils.formatDate(this, format);
                    }
                    date.isToday = function(){
                        return this.getDate() == new Date().getDate();
                    }
                    date.clone = function(){
                        return utils.date(new Date(this.getTime()));
                    }
                return date;
            };
            //获取url中的参数，输入参数名name，和地址urlOrParams
            //urlOrParams的形式可以   如 ： url？address=abc&call=bbb 或者只有  ？后面的参数
            utils.getParamter = function (name, urlOrParams) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                var r = urlOrParams.substr(urlOrParams.indexOf('?')+1).match(reg);
                if (r != null) {
                    var reVal = unescape(r[2]);
                    if (!isNaN(reVal) && reVal != '') {
                        reVal = parseInt(reVal);
                    }
                    return reVal == '' ? null : reVal;
                } 
                return null;
                
            }
        //html5数据库
        var date = new Date();
        var dbDataBase = {};
            dbDataBase.uuid = null;
            dbDataBase.today = (date.getYear()+1900)+'-'+(date.getMonth()+1)+'-'+date.getDate()+'';
        var db = window.openDatabase("chinaMobile","1.0","中国东莞移动本地数据库，保存查询以后的数据",1024*1024*30);
            dbDataBase.myDeviceReadyListenerOnLine = function () {
                dbDataBase.newDB();
                db.transaction(function(tx){
                    tx.executeSql("insert into dbDataBaseMsg values(1,'version','1.0')",[],null,null);
                    tx.executeSql("insert into dbDataBaseMsg values(2,'loginUUID','')",[],null,null);
                });
            };
           
            dbDataBase.newDB = function () {
                //dbDataBase.DropTableRes();
                dbDataBase.CreateTable();
                
             
            }
            dbDataBase.DropTable = function (tableName) {
                db.transaction(function(tx){
                    tx.executeSql("Drop TABLE "+tableName);
                });
            }
            dbDataBase.DropTableRes = function () {
                console.log('---------------删除数据库表---------------');
                db.transaction(function(tx){
                    tx.executeSql("Drop TABLE ResBOX");
                    tx.executeSql("Drop TABLE ResBOXPort");
                    tx.executeSql("Drop TABLE ResODF");
                    tx.executeSql("Drop TABLE ResODFPort");
                    tx.executeSql("Drop TABLE ResTERPort");
                    tx.executeSql("Drop TABLE ResLink");
                });
            }
            dbDataBase.CreateTable = function () {
                db.transaction(function(tx){
                    tx.executeSql("create table if not exists dbDataBaseMsg (id int unique, type text, value text)");
                    tx.executeSql("create table if not exists ResBOX (id int unique, address text, version text, insertdate text, userid text, importtype text," +
                                   " updatedate text, ADDRESSLEVEL1 text, ADDRESSLEVEL2 text, ADDRESSLEVEL3 text, ADDRESSLEVEL4 text, ADDRESSLEVEL5 text, ADDRESSLEVEL6 text, " +
                                   " ADDRESSLEVEL7 text)");
                    tx.executeSql("create table if not exists ResBOXPort (id int unique, baseid text, name text, version text, insertdate text, userid text, importtype text, " +
                                   " updatedate text, boxName text, installaddress text, support_floor text, portName text)");
                    tx.executeSql("create table if not exists ResODF (id int unique, address text, version text, insertdate text, userid text, importtype text,  " +
                                   " updatedate text, ADDRESSLEVEL1 text, ADDRESSLEVEL2 text, ADDRESSLEVEL3 text, ADDRESSLEVEL4 text, ADDRESSLEVEL5 text)");
                    tx.executeSql("create table if not exists ResODFPort (id int unique, baseid text, version text, insertdate text, userid text, importtype text, " +
                                   " updatedate text, odfName text, installaddress text, support_building text, X text, Y text, portName text)");
                    tx.executeSql("create table if not exists ResTERPort (id int unique, address text, version text, insertdate text, userid text, importtype text,  " +
                                   " updatedate text, ADDRESSLEVEL1 text, ADDRESSLEVEL2 text, ADDRESSLEVEL3 text, ADDRESSLEVEL4 text, ADDRESSLEVEL5 text, ADDRESSLEVEL6 text, " +
                                   " ADDRESSLEVEL7 text)");
                    tx.executeSql("create table if not exists ResLink (id int unique, splitterId text, odfId text, boxId text, terminalId text, version text,  " +
                                   " company text, official text)");
                });
            }
            dbDataBase.DeleteTableDateWhere = function (tableName,whereValue) {
                db.transaction(function(tx){
                    tx.executeSql("Delete from "+ tableName + " where " + whereValue);
                });
            };
            dbDataBase.DeleteTableDate = function (tableName) {
                db.transaction(function(tx){
                    tx.executeSql("Delete from "+tableName );
                    });
                };
            dbDataBase.InsertData = function (tableName,val) {
                db.transaction(function(tx){
                    var sql = "insert into "+ tableName + " values("+ val +")";
                    tx.executeSql(sql,[],null,function(tx,error){
                        console.log(error);
                        console.log(sql);
                    });
                });
            };
            dbDataBase.getData = function (sql,callback) {
                var returnData = [];
                var that = this;

                db.transaction(function(tx){

                    tx.executeSql(sql ,[],function(tx,rel){

                        for(var i=0;i<rel.rows.length;i++) {
                            var value = rel.rows.item(i);
                            returnData.push(value);
                        }
                        if(callback){
                            callback.call(that,returnData);
                        }
                    },function(tx,error){
                        console.log(error);
                        console.log(sql);
                    });
                });
            }
            dbDataBase.getRes = function (url,params,successFun,errorFun) {
                //ws基本资源
                var mapRes = {
                    ODF2 :  dbDataBase.getResODF,
                    BOX  :  dbDataBase.getResBOX,
                    TER :  dbDataBase.getResTER,
                    ODF2PORT :  dbDataBase.getResODFPort,
                    BOXPORT :  dbDataBase.getResBOXPort
                };
                var mapUrl = {
                    ODF2 : /getODFList/g,
                    BOX  : /getBOXList/g, 
                    TER : /getTERList/g, 
                    ODF2PORT : /getODFPortsList/g,
                    BOXPORT : /getBOXPortsList/g 
                };
                //根据url获取对应方法
                $.each(mapUrl, function (key,val) {
                    if (val.test(url)) {
                        //对应的方法
                        mapRes[key](params,successFun,errorFun);
                        return false;
                    }
                });
            }
            //把java代码搬到js  ResourcementServ   getODFResourcesList
            dbDataBase.getResODF = function (params,successFun,errorFun) {
                var paramAddress = getParamter('address');
                var _where = "";
                var _orderby = " order by insertdate desc"; 
                if (paramAddress) {
                    _where += " where address like '%" + paramAddress + "%' ";
                }
                _where += _orderby;
                dbDataBase.getPagination('select * from ResODF ' + _where, getParamter('pageNum'), getParamter('pageSize'), successFun);
                function getParamter(val) {
                    return utils.getParamter(val,params);
                }
            }
            //getDisBoxResources
            dbDataBase.getResBOX = function (params,successFun,errorFun) {
                var paramAddress = getParamter('address');
                var _where = "";
                var _orderby = " order by insertdate desc"; 
                if (paramAddress) {
                    _where += " where address like '%" + paramAddress + "%' ";
                }
                _where += _orderby;
                dbDataBase.getPagination('select * from ResBOX ' +_where, getParamter('pageNum'), getParamter('pageSize'), successFun);
                function getParamter(val) {
                    return utils.getParamter(val,params);
                }
            }
            dbDataBase.getResTER = function (params,successFun,errorFun) {
                var paramAddress = getParamter('address');
                var _where = "";
                var _orderby = " order by t.insertdate desc"; 
                if (paramAddress) {
                    _where += " where t.address like '%" + paramAddress + "%' ";
                }
                _where += _orderby;
                dbDataBase.getPagination('select tL.company, tL.official, t.* from ResTERPort as t left join ResLink as tL on t.id = tL.terminalId' + _where, getParamter('pageNum'), getParamter('pageSize'), successFun);
                function getParamter(val) {
                    return utils.getParamter(val,params);
                }
            }
            dbDataBase.getResODFPort = function (params,successFun,errorFun) {

                var paramPortName = getParamter('portName');
                var paramBaseid = getParamter('baseId');
                var _where = "";
                var _orderby = " order by t.insertdate desc, t.X";
                if (paramPortName) {
                    if (_where) {
                        _where += " and t.portName like '%" + paramPortName + "%' ";
                    } else {
                        _where += " where t.portName like '%" + paramPortName + "%' ";
                    }
                }
                if (paramBaseid) {
                    if (_where) {
                        _where += " and t.baseid = " + paramBaseid;
                    } else {
                        _where += " where t.baseid = " + paramBaseid;
                    }
                }
                _where += _orderby;
                dbDataBase.getPagination('select tL.company, tL.official, t.* from ResODFPort as t left join ResLink as tL on t.id = tL.odfId' + _where, getParamter('pageNum'), getParamter('pageSize'), successFun);
                function getParamter(val) {
                    return utils.getParamter(val,params);
                }
            }
            dbDataBase.getResBOXPort = function (params,successFun,errorFun) {
                var paramPortName = getParamter('portName');
                var paramBaseid = getParamter('baseId');
                var _where = "";
                var _orderby = " order by t.insertdate desc, t.portName";
                if (paramPortName) {
                    if (_where) {
                        _where += " and t.portName like '%" + paramPortName + "%' ";
                    } else {
                        _where += " where t.portName like '%" + paramPortName + "%' ";
                    }
                }
                if (paramBaseid) {
                    if (_where) {
                        _where += " and t.baseid = " + paramBaseid;
                    } else {
                        _where += " where t.baseid = " + paramBaseid;
                    }
                }
                _where += _orderby;
                dbDataBase.getPagination('select tL.company, tL.official, t.* from ResBOXPort as t left join ResLink as tL on t.id = tL.boxId' + _where, getParamter('pageNum'), getParamter('pageSize'), successFun);
                function getParamter(val) {
                    return utils.getParamter(val,params);
                }
            }
            dbDataBase.getPagination = function (sql, pageNum, pageSize, func) {
                var _sql = sql + " limit " + pageSize + " offset " + pageSize * (pageNum -1);
                console.log(_sql);
                var _countSql = "select count(1) as count from (" + sql +")";
                var _count = 0;
                dbDataBase.getData(_countSql,function(result){
                    _count = result[0].count;
                });
                function aopFunc (result) {
                    pagination.PSize = pageSize;
                    pagination.PStart = pageNum;
                    pagination.PTotal = parseInt((_count + pageSize - 1) / pageSize);
                    pagination.IStart = pageSize * (pageNum - 1);
                    pagination.ITotal = _count;

                    pagination.items = result;
                    console.log('查询结果：');
                    console.log(pagination);
                    func(pagination);
                }
                dbDataBase.getData( _sql, aopFunc);
                //console.log(func);
            }
            //下载资源表
            dbDataBase.downloadDB = function () {
                if (!confirm('资源包比较大，请在wifi下进行下载！,是否继续？')) {
                    return false;
                }
                if (!myPhoneGapApi.utils.getConnection()) {
                    alert('请检查网络状况！');
                    return false;
                }
                //ws基本资源方法名
                var mapUrl = {
                    ODF2 : 'getODFList',
                    BOX : 'getBOXList',
                    TER : 'getTERList'
                };
                //ws端口方法名
                var mapPortsUrl = {
                    ODF2 : 'getODFPortsList',
                    BOX : 'getBOXPortsList'
                };
                var linkUrl = 'getResLink';
                var param = "pageNum=1&pageSize=999";
                //下载资源，下完一个再执行另一个，不能同时执行
                dbDataBase.DropTableRes();
                dbDataBase.newDB();//重新生成数据
                db.transaction(function(tx){
                    var type = 'ODF2';
                    //下载odf2基本资源
                    utils.wsJsonPUUID(utils.data.resourceManagerUrl + mapUrl[type],param,function(result){
                       //console.log(result.items);
                        $.each(result.items,function(i,item){
                            dbDataBase.InsertData('ResODF',"'" + item.id + "', '" + item.address + "', '" + item.version + "', '" + utils.formatDate(item.insertdate,'yyyy/MM/dd') + "', '" + item.userid + "', '" 
                                                     + item.importtype + "', '" + utils.formatDate(item.updatedate,'yyyy/MM/dd') + "', '" + item.ADDRESSLEVEL1 + "', '" + item.ADDRESSLEVEL2 + "', '"
                                                      + item.ADDRESSLEVEL3 + "', '" + item.ADDRESSLEVEL4 + "', '" + item.ADDRESSLEVEL5 + "'");
                        });
                        //下载ODF2端口资源
                        utils.wsJsonPUUID(utils.data.resourceManagerUrl + mapPortsUrl[type],param,function(result){
                           // console.log(result.items);
                            $.each(result.items,function(i,item){
                                dbDataBase.InsertData('ResODFPort',"'" + item.id +"', '" + item.baseid + "', '" + item.version + "', '" + 
                                                    utils.formatDate(item.insertdate,'yyyy/MM/dd') + "', '" + item.userid + "', '" 
                                                    + item.importtype + "', '" + utils.formatDate(item.updatedate,'yyyy/MM/dd') +  "', '" + item.odfName + "', '" + item.installAddress  + "', '" + 
                                                    item.SUPPORT_BUILDING + "', '" + item.x + "', '" + item.y + "', '" + item.portName +  "'");
                            });
                            type = 'BOX';
                            //下载楼道配线箱基本资源
                            utils.wsJsonPUUID(utils.data.resourceManagerUrl + mapUrl[type],param,function(result){
                                //console.log(result.items);
                                $.each(result.items,function(i,item){
                                    dbDataBase.InsertData('ResBOX',"'" + item.id + "', '" + item.address + "', '" + item.version + "', '" + utils.formatDate(item.insertdate,'yyyy/MM/dd') + "', '" + item.userid + "', '" 
                                                        + item.importtype + "', '" + utils.formatDate(item.updatedate,'yyyy/MM/dd') + "', '" + item.ADDRESSLEVEL1 + "', '" + item.ADDRESSLEVEL2 + "', '"
                                                        + item.ADDRESSLEVEL3 + "', '" + item.ADDRESSLEVEL4 + "', '" + item.ADDRESSLEVEL5 + "', '" + item.ADDRESSLEVEL6 + "', '" + 
                                                        item.ADDRESSLEVEL7 + "'");
                                });
                                //下载楼道配线箱端口资源
                                utils.wsJsonPUUID(utils.data.resourceManagerUrl + mapPortsUrl[type],param,function(result){
                                   // console.log(result.items);
                                    $.each(result.items,function(i,item){
                                        dbDataBase.InsertData('ResBOXPort',"'" + item.id +"', '" + item.baseid + "', '" + item.name + "', '" + item.version + "', '" + 
                                                            utils.formatDate(item.insertdate,'yyyy/MM/dd') + "', '" + item.userid + "', '" 
                                                            + item.importtype + "', '" + utils.formatDate(item.updatedate,'yyyy/MM/dd') +  "', '" + item.boxName + "', '" + item.installAddress  + "', '" + 
                                                            item.SUPPORT_FLOOR + "', '" + item.portName +  "'");
                                    });
                                    //下载用户皮线光纤资源
                                    type = "TER";
                                    utils.wsJsonPUUID(utils.data.resourceManagerUrl + mapUrl[type],param,function(result){
                                        $.each(result.items,function(i,item){
                                            dbDataBase.InsertData('ResTERPort',"'" + item.id +"', '" + item.address + "', '" + item.version + "', '" + 
                                                                utils.formatDate(item.insertdate,'yyyy/MM/dd') + "', '" + item.userid + "', '" 
                                                                + item.importtype + "', '" + utils.formatDate(item.updatedate,'yyyy/MM/dd') +  "', '" + item.ADDRESSLEVEL1 + "', '" + item.ADDRESSLEVEL2 + "', '"
                                                                + item.ADDRESSLEVEL3 + "', '" + item.ADDRESSLEVEL4 + "', '" + item.ADDRESSLEVEL5 + "', '" + item.ADDRESSLEVEL6 + "', '" + 
                                                                item.ADDRESSLEVEL7 + "'");
                                        });
                                        //下载链路表
                                        utils.wsJsonPUUID(utils.data.resourceManagerUrl + linkUrl,param,function(result){
                                            $.each(result.data,function(i,item){
                                                dbDataBase.InsertData('ResLink',"'" + item.id +"', '" + item.splitterId + "', '" + item.odfId + "', '" + 
                                                                    item.boxId + "', '" + item.terminalId + "', '" 
                                                                    + item.version + "', '" + item.company + "', '" + item.official +  "'");
                                            });
                                            $.ui.hideMask();
                                            alert('下载完毕！');
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
               
            }
            dbDataBase.setUUID = function (uuid) {
                dbDataBase.DeleteTableDateWhere('dbDataBaseMsg','type = "loginUUID"');
                var values = "'2','loginUUID','" + uuid +"'";
                dbDataBase.InsertData('dbDataBaseMsg',values);
            }
            dbDataBase.jsonpUUID = function (url,params,successFun,errorFun) {
                dbDataBase.getData("select * from dbDataBaseMsg where type = 'loginUUID'",function(result){
                    $.ui.showMask('请稍后');
                    //处理连接超时的问题
                    var aopFunc = function(result){
                        
                        if (result == null) {
                            alert('连接时间过长！请重新登陆！');
                            $.ui.hideMask();
                            return false;
                        }
                        successFun(result);
                    };
                    utils.wsJsonP(url,params+"&uuid="+result[0].value,aopFunc,errorFun);
                    
                });
            }
           
            dbDataBase.findTest = function () {
                db.transaction(function(tx){
                    tx.executeSql("select * from ResODF",[],function(tx,rel){
                        for(var i=0;i<rel.rows.length;i++) {
                            document.write("ID:" + rel.rows.item(i).id + "\taddress:" + rel.rows.item(i).insertdate + "<br/>");
                        }
                    });
                });
            };
        
        //网络判断
        var myPhoneGapApi = {};
           
            myPhoneGapApi.data = {};
            //无用
            myPhoneGapApi.data.debug = true;//是否电脑调试  true表示用电脑调试/电脑上正常连接 false表示用电脑不能用在线查询/手机上线使用
            myPhoneGapApi.data.line = true;//联网查询设置
            myPhoneGapApi.utils = {};
            myPhoneGapApi.utils.checkConnection = function () {
                var networkState = navigator.network.connection.type; 
                var isOnNet  = false;
                /*var states = {};  
                states[Connection.UNKNOWN]  = 'Unknown connection';//未知连接  
                states[Connection.ETHERNET] = 'Ethernet connection';//以太网  
                states[Connection.WIFI]     = 'WiFi connection';//wifi    
                states[Connection.CELL_2G]  = 'Cell 2G connection';//2G  
                states[Connection.CELL_3G]  = 'Cell 3G connection';//3G  
                states[Connection.CELL_4G]  = 'Cell 4G connection';//4G  
                states[Connection.CELL]     = 'Cell generic connection';//蜂窝网络  
                states[Connection.NONE]     = 'No network connection';  
                alert('Connection type: ' + states[networkState] + 'type:'+ networkState);  */
                if (networkState == Connection.NONE || networkState == Connection.UNKNOWN) {
                    isOnNet = false;
                } else {
                    isOnNet = true;
                }
                return isOnNet;
            };
            myPhoneGapApi.utils.setNetWork = function (control) {
                if (control) {
                    alert('联网查询');
                } else {
                    alert('离线查询');
                }
                //control true 手机联网 false 永远在线，不检查网络是否成功连接
                myPhoneGapApi.data.line = control;
            }

            myPhoneGapApi.utils.getConnection = function () {
                var flag = true;
                //桌面版不需要判断
                /*if (myPhoneGapApi.date.isOnPhone && !myPhoneGapApi.utils.checkConnection()) {
                    flag = false;
                    alert('网络异常，请重新连接网络！');
                    return false;
                }*/
               /* if (!myPhoneGapApi.data.debug) {
                    try {
                        myPhoneGapApi.utils.checkConnection();
                    } catch (e){
                        console.log(e.message);
                        //alert('网络异常，请重新连接网络！');
                        flag = false;
                    }
                }*/
                //联网状态下需要判断有没有连接上网络
                if (myPhoneGapApi.data.line) {
                    if (!myPhoneGapApi.data.debug) {//控制pc调试
                        try {
                            myPhoneGapApi.utils.checkConnection();
                        } catch (e){
                            console.log(e.message);
                            //alert('网络异常，请重新连接网络！');
                            flag = false;
                        }
                    }   
                } else {
                    flag = false;
                }
                return flag;
            };
        //分页类
        var pagination = {};
            pagination.IStart = '';
            pagination.items = {};
            pagination.ITotal = '';
            pagination.PStart = '';
            pagination.PTotal = '';
		var scanner = {};
              scanner.utils = {};
              scanner.utils.myScanner = function () {
                  sina.barcodeScanner.scan(function(reuslt){
                      			var url = utils.data.resourceManagerUrl + 'getBarcodeToLink';
                                var param = 'barcode='+result.text+"&format="+result.format;
                                $.ui.showMask('请稍后');
                                utils.wsJsonPUUID(url,param,function(result){
                                    //console.log(result);
                                    if (result.state == 'success') {
                                        alert(JSON.stringify(link));
                                        link.fn.getDetailFromBarCode(result.data);
                                    } else {
                                        //当进行了扫描后
                                        manager.utils.callManager();
                                        alert(result.message);
                                        $.ui.hideMask();
                                    }
                                   
                                },function(error){
                                    //当进行了扫描后错误
                                    manager.utils.callManager();
                                    alert("error:"+error);
                                    $.ui.hideMask();
                                });
                         
                  	}, function(error) {
                        alert("Scanning failed: " + error);
                    });
              };
			

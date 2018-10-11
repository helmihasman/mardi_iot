var express = require('express');
var multer  =   require('multer');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var session = require('express-session');
var expressValidator = require('express-validator');
var methodOverride = require('method-override');
var fs = require('fs');

var nodemailer = require('nodemailer'); //for sending email

var request = require('request');

var Client = require('ibmiotf');

var connection  = require('express-myconnection');
var mysql = require('mysql');

var routes = require('./routes/index');
var users = require('./routes/users');
//var customers = require('./routes/customers');
//var admin_users = require('./routes/admin_users');

var app = express();

//var mysql = require("mysql");
var app_ex = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var https = require('http');

var crypto = require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Store = require('express-session').Store;

var gcm = require('node-gcm');
//var apn = require('apn'); 
//var gcm = require('node-gcm-service');
//var apnConnection = new apn.Connection({production : false});
//
//var deviceID = "exoB6Ml0m8s:APA91bFTZ5RF2sFvN2UVXq_1O8lWxbKOytidybJ7WkvZJB9--XTEhYVEZ4ZpNkWIFjtROkf93u7ZvSXByYk1fl25GwGWdYof5jMleYdSLd81uD0VuWXvNfuBYLfe3GpoFGFGD0X3jWUl";
//var apnDevice = new apn.Device(deviceID);
//
//var apnNotification = new apn.Notification();
//apnNotification.alert = '{Your message here}';
//apnNotification.badge = 10;
//apnNotification.contentAvailable = true;
//
//apnConnection.pushNotification(apnNotification, apnDevice);

var transporter = nodemailer.createTransport({
  host: 'mail.mmdt.cc',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: 'helmi@mmdt.cc',
        pass: 'Mdtsuccess99'
    }
});

//var transporter = nodemailer.createTransport({
//  service: 'gmail',
//  auth: {
//    user: 'youremail@gmail.com',
//    pass: 'yourpassword'
//  }
//});

var mailOptionsUnauthorized = {
  from: 'helmi@mmdt.cc',
  to: 'helmi@mmdt.cc',
  subject: 'Notification of Unauthorised Movement from DLM Healthcare',
  html: 'Dear Sir/Madam,<br/><br/> There is unauthorised movements of item that is pending your kind action<br/><br/> <a href="https://dlm-iot.mybluemix.net/admin_unauthorized">Click here to access</a> <br/><br/>Thank you.'
};

var mailOptionsTrigger = {
  from: 'helmi@mmdt.cc',
  to: 'helmi@mmdt.cc,ammar@mmdt.cc',
  subject: 'Notification of Tamperred Pin from DLM Healthcare',
  html: 'Dear Sir/Madam,<br/><br/> A tamperred pin has been detected and is pending your kind action<br/><br/> <a href="https://dlm-iot.mybluemix.net/admin_assets">Click here to access</a> <br/><br/>Thank you.'
};


app.use(function(req, res, next){
  res.io = io;
  next();
});

//http.listen(80);
//var port = app.settings.port;
//var port2 = app.get('port');
http.listen(process.env.PORT || 3000, function(){
//  console.log('listening on **:'+process.env.PORT);
// console.log('listening on **:'+port);
// console.log('listening on **$:'+port2);
});


var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now()+'.jpg');
  }
});
var upload = multer({ storage : storage}).single('assets_img');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret:"secretpass123456"}));
app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});
app.use(flash());
app.use(expressValidator());
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/uploads', express.static(process.cwd() + '/uploads'));

app.use('/', routes);
app.use('/users', users);
//app.use('/customers', customers);
//app.use('/admin_users', admin_users);

//passport
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


app.use(methodOverride(function(req, res){
 if (req.body && typeof req.body == 'object' && '_method' in req.body) 
   { 
      var method = req.body._method;
      delete req.body._method;
      return method;
    } 
  }));

/*-----------------------------------------
 * Connection peer, register as middleware
 * type koneksi:single,pool and request
 -----------------------------------------*/
//app.use(
//   connection(mysql,{
//       host:'us-cdbr-iron-east-04.cleardb.net',
//       user:'b753688ff4397b',
//       password:'a2c32182',
//       port:3306,
//       database:'ad_4a07813f131a943'
//   },'pool')
//);

//var connect_mysql = mysql.createPool({
//     host:'us-cdbr-iron-east-04.cleardb.net',
//     user:'b753688ff4397b',
//     password:'a2c32182',
//     port:3306,
//     database:'ad_4a07813f131a943'
//});

//var con = mysql.createConnection({
//    host: "us-cdbr-iron-east-04.cleardb.net",
//    user: "b753688ff4397b",
//    password: "a2c32182",
//    database: "ad_4a07813f131a943"
//});

//Mardi compose
var con = mysql.createConnection({
    host: "sl-us-south-1-portal.9.dblayer.com",
    user: "admin",
    password: "WCURUBBOZVDJNTEM",
    port:60646,
    database: "compose"
});




//function checkConnection(){
//  con.connect(function(error){
//   if(!!error){
//       console.log(error);
//       checkConnection();
//   }
//   else{
//       console.log('Connecteded');
//   }
//});
//}

//checkConnection();

con.connect(function(error){
   if(!!error){
       console.log(error);
       
   }
   else{
       console.log('Connecteded');
   }
});

//setInterval(function(){ 
//       con.query('SELECT 1',function(err,rows){
//         if(!!err){
//            console.log(err);
//            
//            }
//            else{
//                console.log('Connecteded');
//            }
//         
//       });
//}, 10000);


app.post("/login", passport.authenticate('local', {

    successRedirect: '/',

    failureRedirect: '/login',

    failureFlash: true

}), function(req, res, info){
    
    res.render('login',{'message' :req.flash('message')});

});

//app.get('/set_space', function (req, res){
////  try {
////    var data = fs.readFileSync('/Users/helmi/Documents/tag2.txt', 'utf8');
////    console.log();
////    console.log(data);    
////} catch(e) {
////    console.log('Error:', e.stack);
////}
//var readline = 0;
//var lineReader = require('readline').createInterface({
//  input: require('fs').createReadStream('/Users/helmi/Documents/tag_9_600.txt')
//});
//
//lineReader.on('line', function (line) {
//  //console.log('Line from file:', line);
//  //var arr = line.split(",");
//  var result = line;
//
//    // add spaces after every 4 digits (make sure there's no trailing whitespace)
//    var str = line;
//    str = str.replace(/(\S{4})/g,'$1 ');
//    str = str.substring(0, str.length - 1);   // if you do not want the final a
//    str = str+", Baby Gown";
//    
//    //var m = line.match(/^(\d\d)(?:([2-90]\d|1)(?:(\d\d\d)(\d+)?)?)?$/);
//
////    if(m){
////        result = m[1] + " ";
////        if(m[4]){
////            result += m[4].split(/(\d{4})/).join(" ");
////            result = result.replace(/\s+/g, " ");
////        }
////        
////       
////    }
//     console.log(str);
//
//}).on('close', function (err) {
//        console.log('Stream has been destroyed and file has been closed');
//    });;
//
//
//});
//

app.get('/read_text', function (req, res){
//  try {
//    var data = fs.readFileSync('/Users/helmi/Documents/tag2.txt', 'utf8');
//    console.log();
//    console.log(data);    
//} catch(e) {
//    console.log('Error:', e.stack);
//}
var readline = 0;
var readno = 0;
var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('/Users/helmi/Documents/tag_catagory_090418.txt')
});

lineReader.on('line', function (line) {
  //console.log('Line from file:', line);
  var arr = line.split(",");
  //console.log('uuid:', arr[0]);
  //console.log('category:', arr[1]);
  
    var d = createDateAsUTC(new Date());
    //d.setMinutes(d.getMinutes()+480);
    var ddate = d.getDate();
    var dmonth = d.getMonth()+1;
    var dyear = d.getFullYear();
   

    if(ddate < 10){
        ddate = "0"+ddate;
    }
    if(dmonth < 10){
        dmonth = "0"+dmonth;
    }

   
    var newdate;
    newdate = "2017-12-08";
    
//     con.query("SELECT linen_uuid from linen where linen_uuid = '"+arr[0]+"'",function(error,rows,fields){
//                if(!!error){
//                    console.log('Error in the query '+error);
//                }
//                else{
//                    if(rows.length === 0){
                        con.query("INSERT INTO m_linen(linen_uuid, linen_category,linen_purchase_date,linen_last_updated) values ('"+arr[0]+"','"+arr[1]+"','"+newdate+"','"+newdate+"')",function(error,rows,fields){
                            if(!!error){
                                console.log('Error in the query '+error);
                            }
                            else{
                                //console.log('Successful query fff\n');
                                //console.log(rows);
                                //res.render('report_linen_print',{title:"Report",data:rows});
                                readline++;
                                console.log("readline-- "+readline);
                            }
                        });
//                    }
//                    else{
//                        readno++;
//                        console.log("readno-- "+readno);
//                    }
//                }
//            });
  
  
}).on('close', function (err) {
        console.log('Stream has been destroyed and file has been closed');
    });;


});

//app.get('/search_text', function (req, res){
////  try {
////    var data = fs.readFileSync('/Users/helmi/Documents/tag2.txt', 'utf8');
////    console.log();
////    console.log(data);    
////} catch(e) {
////    console.log('Error:', e.stack);
////}
//var readline = 0;
//var lineReader = require('readline').createInterface({
//  input: require('fs').createReadStream('/Users/helmi/Documents/tag_catagory_300318.txt')
//});
//
//lineReader.on('line', function (line) {
//  //console.log('Line from file:', line);
//  var arr = line.split(",");
//  //console.log('uuid:', arr[0]);
//  //console.log('category:', arr[1]);
//  
//    var d = createDateAsUTC(new Date());
//    //d.setMinutes(d.getMinutes()+480);
//    var ddate = d.getDate();
//    var dmonth = d.getMonth()+1;
//    var dyear = d.getFullYear();
//   
//
//    if(ddate < 10){
//        ddate = "0"+ddate;
//    }
//    if(dmonth < 10){
//        dmonth = "0"+dmonth;
//    }
//
//   
//    var newdate;
//    newdate = "2017-12-08";
//    
//  
//  con.query("SELECT * FROM m_linen where linen_uuid = '"+arr[0]+"'",function(error,rows,fields){
//                if(!!error){
//                    console.log('Error in the query '+error);
//                }
//                else{
//                    if(rows.length === 0){
//                        console.log("tagid -- "+arr[0]);
//                    }
//                    //console.log('Successful query fff\n');
//                    //console.log(rows);
//                    //res.render('report_linen_print',{title:"Report",data:rows});
//                    readline++;
//                    console.log("readline-- "+readline);
//                }
//            });
//}).on('close', function (err) {
//        console.log('Stream has been destroyed and file has been closed');
//    });;
//
//
//});

app.get('/get_duplicate', function (req, res){
//  try {
//    var data = fs.readFileSync('/Users/helmi/Documents/tag2.txt', 'utf8');
//    console.log();
//    console.log(data);    
//} catch(e) {
//    console.log('Error:', e.stack);
//}
var readline = 0;
var arrayll = [];
var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('/Users/helmi/Documents/tag_catagory_300318.txt')
});

lineReader.on('line', function (line) {
  //console.log('Line from file:', line);
  var arr = line.split(",");
  //console.log('uuid:', arr[0]);
  //console.log('category:', arr[1]);
  
    var d = createDateAsUTC(new Date());
    //d.setMinutes(d.getMinutes()+480);
    var ddate = d.getDate();
    var dmonth = d.getMonth()+1;
    var dyear = d.getFullYear();
   

    if(ddate < 10){
        ddate = "0"+ddate;
    }
    if(dmonth < 10){
        dmonth = "0"+dmonth;
    }

   
    var newdate;
    newdate = "2017-12-08";
    
  arrayll.push(arr[0].toString());
  

}).on('close', function (err) {
    
    console.log('Stream has been destroyed and file has been closed');
    console.log("gupadp--"+find_duplicate_in_array(arrayll));
    });;


});

function find_duplicate_in_array(arra1) {
 for ( var i = 0; i < arra1.length; i++){

for (var j = i+1; j< arra1.length; j++){

if (arra1 [i] === arra1 [j]){

console.log(arra1[i]);
}
}

}
  }


app.get('/linen_list',function(req,res){

//pillow case
//var id_linen = 'E280 1170 0000 0209 41BF 492A';

//bedsheet
//var id_linen = 'E280 1170 0000 0209 84D9 C007';

//towel
//var id_linen = 'E280 1170 0000 0209 84E4 BAC9';

//gown
//var id_linen = 'E280 1170 0000 0209 84E4 594F';

//blanket
//var id_linen = 'E280 1170 0000 0209 84D9 51DC';

var linen_list = ['E280 1170 0000 0209 41BF 780B','E280 1170 0000 0209 41BF 492C','E280 1170 0000 0209 41BF 5912',
                  'E280 1170 0000 0209 41BF 6004','E280 1170 0000 0209 41BF 9121'];

//var time = ['2018-02-01 11:30:00 AM','2018-02-01 12:30:00 AM','2018-02-01 10:30:00 AM',
//            '2018-02-02 11:40:00 AM','2018-02-02 12:00:00 AM','2018-02-02 12:30:00 AM',
//            '2018-02-03 11:20:00 AM','2018-02-03 12:30:00 AM','2018-02-03 12:30:00 AM',
//            '2018-02-04 10:30:00 AM','2018-02-04 11:40:00 AM','2018-02-04 10:30:00 AM',
//            '2018-02-05 10:30:00 AM','2018-02-05 11:20:00 AM','2018-02-05 11:30:00 AM',
//            '2018-02-06 09:30:00 AM','2018-02-06 11:30:00 AM','2018-02-06 10:30:00 AM',
//            '2018-02-07 11:30:00 AM','2018-02-07 10:45:00 AM','2018-02-07 10:30:00 AM',
//            '2018-02-08 10:40:00 AM','2018-02-08 11:30:00 AM','2018-02-08 12:10:00 AM',
//            '2018-02-09 11:30:00 AM','2018-02-09 11:30:00 AM','2018-02-09 12:30:00 AM',
//            '2018-02-10 10:30:00 AM','2018-02-10 10:30:00 AM','2018-02-10 11:20:00 AM',
//            '2018-02-11 11:50:00 AM','2018-02-11 11:20:00 AM','2018-02-11 10:30:00 AM',
//            '2018-02-12 10:45:00 AM','2018-02-12 12:20:00 AM','2018-02-12 11:30:00 AM',
//            '2018-02-13 11:50:00 AM','2018-02-13 10:20:00 AM','2018-02-13 10:30:00 AM',
//            '2018-02-14 10:40:00 AM','2018-02-14 11:20:00 AM','2018-02-14 10:20:00 AM',
//            '2018-02-15 10:50:00 AM','2018-02-15 10:25:00 AM','2018-02-15 12:30:00 AM',
//            '2018-02-16 10:20:00 AM','2018-02-16 12:10:00 AM','2018-02-16 12:30:00 AM',
//            '2018-02-17 12:50:00 AM','2018-02-17 10:20:00 AM','2018-02-17 10:30:00 AM',
//            '2018-02-18 10:55:00 AM','2018-02-18 09:20:00 AM','2018-02-18 10:30:00 AM',
//            '2018-02-19 12:45:00 AM','2018-02-19 08:20:00 AM','2018-02-19 10:30:00 AM',
//            '2018-02-20 11:32:00 AM','2018-02-20 12:20:00 AM','2018-02-20 10:30:00 AM',
//            '2018-02-21 11:50:00 AM','2018-02-21 11:20:00 AM','2018-02-21 10:30:00 AM',
//            '2018-02-22 11:50:00 AM','2018-02-22 11:40:00 AM','2018-02-22 12:30:00 AM',
//            '2018-02-23 12:50:00 AM','2018-02-23 10:20:00 AM','2018-02-23 10:30:00 AM',
//            '2018-02-24 10:50:00 AM','2018-02-24 10:20:00 AM','2018-02-24 10:30:00 AM',
//            '2018-02-25 11:50:00 AM','2018-02-25 11:20:00 AM','2018-02-25 10:30:00 AM',
//            '2018-02-26 11:50:00 AM','2018-02-26 11:40:00 AM','2018-02-26 11:30:00 AM',
//            '2018-02-27 11:45:00 AM','2018-02-27 11:20:00 AM','2018-02-27 12:30:00 AM',
//            '2018-02-28 11:50:00 AM','2018-02-28 11:20:00 AM','2018-02-28 10:30:00 AM',
//            '2018-02-29 11:50:00 AM','2018-02-29 10:20:00 AM','2018-02-29 10:30:00 AM',
//            '2018-02-30 12:30:00 AM','2018-02-30 11:20:00 AM','2018-02-30 10:30:00 AM',
//            '2018-02-31 12:30:00 AM','2018-02-31 11:20:00 AM','2018-02-31 10:30:00 AM'];

//var time = ['2018-07-01 11:30:00 AM','2018-07-01 12:30:00 AM','2018-07-01 10:30:00 AM',
//            '2018-07-02 11:40:00 AM','2018-07-02 12:00:00 AM','2018-07-02 12:30:00 AM',
//            '2018-07-03 11:20:00 AM','2018-07-03 12:30:00 AM','2018-07-03 12:30:00 AM',
//            '2018-07-04 10:30:00 AM','2018-07-04 11:40:00 AM','2018-07-04 10:30:00 AM',
//            '2018-07-05 10:30:00 AM','2018-07-05 11:20:00 AM','2018-07-05 11:30:00 AM',
//            '2018-07-06 09:30:00 AM','2018-07-06 11:30:00 AM','2018-07-06 10:30:00 AM',
//            '2018-07-07 11:30:00 AM','2018-07-07 10:45:00 AM','2018-07-07 10:30:00 AM',
//            '2018-07-08 10:40:00 AM','2018-07-08 11:30:00 AM','2018-07-08 12:10:00 AM',
//            '2018-07-09 11:30:00 AM','2018-07-09 11:30:00 AM','2018-07-09 12:30:00 AM',
//            '2018-07-10 10:30:00 AM','2018-07-10 10:30:00 AM','2018-07-10 11:20:00 AM'];
        
var time = ['2018-02-01 11:30:00 PM','2018-02-01 12:30:00 PM',
            '2018-02-02 11:40:00 PM','2018-02-02 12:00:00 PM',
            '2018-02-03 11:20:00 PM','2018-02-03 12:30:00 PM',
            '2018-02-04 10:30:00 PM','2018-02-04 11:40:00 PM',
            '2018-02-05 10:30:00 PM','2018-02-05 11:20:00 PM',
            '2018-02-06 09:30:00 PM','2018-02-06 11:30:00 PM',
            '2018-02-07 11:30:00 PM','2018-02-07 10:45:00 PM',
            '2018-02-08 10:40:00 PM','2018-02-08 11:30:00 PM',
            '2018-02-09 11:30:00 PM','2018-02-09 11:30:00 PM',
            '2018-02-10 10:30:00 PM','2018-02-10 10:30:00 PM',
            '2018-02-11 11:50:00 PM','2018-02-11 11:20:00 PM',
            '2018-02-12 10:45:00 PM','2018-02-12 12:20:00 PM',
            '2018-02-13 11:50:00 PM','2018-02-13 10:20:00 PM',
            '2018-02-14 10:40:00 PM','2018-02-14 11:20:00 PM',
            '2018-02-15 10:50:00 PM','2018-02-15 10:25:00 PM',
            '2018-02-16 10:20:00 PM','2018-02-16 12:10:00 PM',
            '2018-02-17 12:50:00 PM','2018-02-17 10:20:00 PM',
            '2018-02-18 10:55:00 PM','2018-02-18 09:20:00 PM',
            '2018-02-19 12:45:00 PM','2018-02-19 08:20:00 PM',
            '2018-02-20 11:32:00 PM','2018-02-20 12:20:00 PM',
            '2018-02-21 11:50:00 PM','2018-02-21 11:20:00 PM',
            '2018-02-22 11:50:00 PM','2018-02-22 11:40:00 PM',
            '2018-02-23 12:50:00 PM','2018-02-23 10:20:00 PM',
            '2018-02-24 10:50:00 PM','2018-02-24 10:20:00 PM',
            '2018-02-25 11:50:00 PM','2018-02-25 11:20:00 PM',
            '2018-02-26 11:50:00 PM','2018-02-26 11:40:00 PM',
            '2018-02-27 11:45:00 PM','2018-02-27 11:20:00 PM',
            '2018-02-28 11:50:00 PM','2018-02-28 11:20:00 PM',
            '2018-02-29 11:50:00 PM','2018-02-29 11:20:00 PM',
            '2018-02-30 11:50:00 PM','2018-02-30 11:20:00 PM',
            '2018-02-31 11:50:00 PM','2018-02-31 11:20:00 PM'];
        
//var time = ['2018-07-01 11:30:00 PM','2018-07-01 12:30:00 PM',
//            '2018-07-02 11:40:00 PM','2018-07-02 12:00:00 PM',
//            '2018-07-03 11:20:00 PM','2018-07-03 12:30:00 PM',
//            '2018-07-04 10:30:00 PM','2018-07-04 11:40:00 PM',
//            '2018-07-05 10:30:00 PM','2018-07-05 11:20:00 PM',
//            '2018-07-06 09:30:00 PM','2018-07-06 11:30:00 PM',
//            '2018-07-07 11:30:00 PM','2018-07-07 10:45:00 PM',
//            '2018-07-08 10:40:00 PM','2018-07-08 11:30:00 PM',
//            '2018-07-09 11:30:00 PM','2018-07-09 11:30:00 PM',
//            '2018-07-10 10:30:00 PM','2018-07-10 10:30:00 PM'];
        
var round = 9;
var count = 0;
var clean = '0';
var soil = '1';

    for(var j=0;j<time.length;j++){
        for(var i=0;i<linen_list.length;i++){
        con.query("INSERT INTO m_linen_record(id_linen, time,clean,soil) values ('"+linen_list[i]+"','"+time[j]+"','"+clean+"','"+soil+"')",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                   console.log(count++);
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                    //res.render('report_linen_print',{title:"Report",data:rows});
                   
                }
            });
            }
        }
});


app.get('/update_linen_status',isAuthenticated,function(req,res){
   
   con.query("SELECT * FROM m_linen",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
//           if(req.session.passport.user.user_right !== "Administrator"){
//                res.render('admin_users_update_2',{title:"User",data:rows});
//            }
//            else{
//                res.render('admin_users_update',{title:"Admin Users",data:rows});
//            }
            for(var i=0;i<rows.length;i++){
                con.query("SELECT * FROM m_linen_record where id_linen = '"+rows[i].linen_uuid+"' order by time desc limit 1",function(error,rows,fields){
                    if(!!error){
                        console.log('Error in the query '+error);
                    }
                    else{
                        
                        var clean = rows[0].clean;
                        var soil = rows[0].soil;
                        var status;
                        
                        if(clean === '1' || clean === 1){
                            status = 'clean';
                        }
                        else if(soil === '1' || soil === 1){
                            status = 'clean';
                        }
                        
                        con.query("UPDATE m_linen set linen_status = '"+status+"', linen_last_updated = '"+rows[0].time+"' where linen_uuid = '"+rows[i].linen_uuid+"'",function(error,rows,fields){
                            if(!!error){
                                console.log('Error in the query '+error);
                            }
                            else{
                               

                                }
                                });
                                
                        
                            

                    }
                });
                
                con.query("SELECT count(clean) as cycle from m_linen_record where id_linen = '"+rows[i].linen_uuid+"'",function(error,rows,fields){
                            if(!!error){
                                console.log('Error in the query '+error);
                            }
                            else{
                                    con.query("UPDATE m_linen set linen_cycle = '"+rows[0].cycle+"' where linen_uuid = '"+rows[i].linen_uuid+"'",function(error,rows,fields){
                                        if(!!error){
                                            console.log('Error in the query '+error);
                                        }
                                        else{

                                            
                                            }
                                            });
                                            
                                }
                                });
            }
            res.redirect('/'); 
       }
   }); 
});


//Print function
app.get('/print_linen/:month/:year', function (req, res){

            var dmonth = req.params.month;
    var dyear = req.params.year;
    var month_name = "";
            //console.log("dmonth--"+dmonth);

            if(dmonth === "1"){
                month_name = "January";
            }
            else if(dmonth === "2"){
                month_name = "February";
            }
            else if(dmonth === "3"){
                month_name = "March";
            }
            else if(dmonth === "4"){
                month_name = "April";
            }
            else if(dmonth === "5"){
                month_name = "May";
            }
            else if(dmonth === "6"){
                month_name = "June";
            }
            else if(dmonth === "7"){
                month_name = "July";
            }
            else if(dmonth === "8"){
                month_name = "August";
            }
            else if(dmonth === "9"){
                month_name = "September";
            }
            else if(dmonth === "10"){
                month_name = "October";
            }
            else if(dmonth === "11"){
                month_name = "November";
            }
            else if(dmonth === "12"){
                month_name = "December";
            }

            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year;
                                         var dt_month = daytime[i].month;
                                         var dt_day = daytime[i].day;
                                         var year_s = rows[k].year_s;
                                         var month_s = rows[k].month_s;
                                         var day_s = rows[k].day_s;

                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil,clean:rows[k].clean});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen_print',{title:"Report",data:record_table,month:dmonth,year:dyear,month_name:month_name});
                        }
                    });
//  con.query("SELECT sum(soil) as soil,sum(clean) as clean,year(time) as year_s, month(time) as month_s, day(time) as day_s FROM linen_record GROUP BY year(time),month(time),day(time) order by time desc",function(error,rows,fields){
//                if(!!error){
//                    console.log('Error in the query '+error);
//                }
//                else{
//                    //console.log('Successful query fff\n');
//                    //console.log(rows);
//                    res.render('report_linen_print',{title:"Report",data:rows});
//                }
//            });
});

app.get('/print_linen_monthly', function (req, res){
    
            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s from m_linen_record group by year(time),month(time) order by year(time),month(time) desc",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid group by year(m_linen_record.time),month(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year;
                                         var dt_month = daytime[i].month;
                                         
                                         var year_s = rows[k].year_s;
                                         var month_s = rows[k].month_s;
                                         

                                         if((dt_year === year_s) && (dt_month === month_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil,clean:rows[k].clean});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         
                                         record_list = { year:daytime[i].year,month:newmonth,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen_print_monthly',{title:"Report",data:record_table});
                        }
                    });
                    
//  con.query("SELECT sum(soil) as soil,sum(clean) as clean,year(time) as year_s, month(time) as month_s, day(time) as day_s FROM linen_record GROUP BY month(time) order by year(time),month(time) desc",function(error,rows,fields){
//                if(!!error){
//                    console.log('Error in the query '+error);
//                }
//                else{
//                    //console.log('Successful query fff\n');
//                    //console.log(rows);
//                    res.render('report_linen_print_monthly',{title:"Report",data:rows});
//                }
//            });
});

app.get('/report_linen_clean_print/:month/:year', function (req, res){
    
    var dmonth = req.params.month;
    var dyear = req.params.year;
    var month_name = "";
            //console.log("dmonth--"+dmonth);

            if(dmonth === "1"){
                month_name = "January";
            }
            else if(dmonth === "2"){
                month_name = "February";
            }
            else if(dmonth === "3"){
                month_name = "March";
            }
            else if(dmonth === "4"){
                month_name = "April";
            }
            else if(dmonth === "5"){
                month_name = "May";
            }
            else if(dmonth === "6"){
                month_name = "June";
            }
            else if(dmonth === "7"){
                month_name = "July";
            }
            else if(dmonth === "8"){
                month_name = "August";
            }
            else if(dmonth === "9"){
                month_name = "September";
            }
            else if(dmonth === "10"){
                month_name = "October";
            }
            else if(dmonth === "11"){
                month_name = "November";
            }
            else if(dmonth === "12"){
                month_name = "December";
            }
            
    
    var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         var dt_day = daytime[i].day.toString();
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         var day_s = rows[k].day_s.toString();

                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen_clean_print',{title:"Report",data:record_table,month:dmonth,year:dyear,month_name:month_name});
                        }
                    });
    
//  con.query("SELECT sum(clean) as tag_count,time FROM linen_record where clean='1' group by time order by time desc",function(error,rows,fields){
//                if(!!error){
//                    console.log('Error in the query '+error);
//                }
//                else{
//                    //console.log('Successful query fff\n');
//                    //console.log(rows);
//                    for(var i=0; i<rows.length;i++){
//                        //dateFormatChange("");
//                        rows[i].new_date = dateFormatChange(rows[i].time);
//
//                    }
//                    res.render('report_linen_clean_print',{title:"Report",data:rows});
//                }
//            });
});

app.get('/report_linen_soil_print/:month/:year', function (req, res){
    
            var dmonth = req.params.month;
    var dyear = req.params.year;
    var month_name = "";
            //console.log("dmonth--"+dmonth);

            if(dmonth === "1"){
                month_name = "January";
            }
            else if(dmonth === "2"){
                month_name = "February";
            }
            else if(dmonth === "3"){
                month_name = "March";
            }
            else if(dmonth === "4"){
                month_name = "April";
            }
            else if(dmonth === "5"){
                month_name = "May";
            }
            else if(dmonth === "6"){
                month_name = "June";
            }
            else if(dmonth === "7"){
                month_name = "July";
            }
            else if(dmonth === "8"){
                month_name = "August";
            }
            else if(dmonth === "9"){
                month_name = "September";
            }
            else if(dmonth === "10"){
                month_name = "October";
            }
            else if(dmonth === "11"){
                month_name = "November";
            }
            else if(dmonth === "12"){
                month_name = "December";
            }
    
            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         var dt_day = daytime[i].day.toString();
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         var day_s = rows[k].day_s.toString();

                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen_soil_print',{title:"Report",data:record_table,month:dmonth,year:dyear,month_name:month_name});
                        }
                    });
    
//  con.query("SELECT sum(soil) as tag_count,time FROM linen_record where soil='1' group by time order by time desc",function(error,rows,fields){
//                if(!!error){
//                    console.log('Error in the query '+error);
//                }
//                else{
//                    //console.log('Successful query fff\n');
//                    //console.log(rows);
//                    for(var i=0; i<rows.length;i++){
//                        //dateFormatChange("");
//                        rows[i].new_date = dateFormatChange(rows[i].time);
//
//                    }
//                    res.render('report_linen_soil_print',{title:"Report",data:rows});
//                }
//            });
});

app.get('/report_linen_pending_print/:month/:year', function (req, res){
    
    var dmonth = req.params.month;
    var dyear = req.params.year;
    var month_name = "";
            //console.log("dmonth--"+dmonth);

            if(dmonth === "1"){
                month_name = "January";
            }
            else if(dmonth === "2"){
                month_name = "February";
            }
            else if(dmonth === "3"){
                month_name = "March";
            }
            else if(dmonth === "4"){
                month_name = "April";
            }
            else if(dmonth === "5"){
                month_name = "May";
            }
            else if(dmonth === "6"){
                month_name = "June";
            }
            else if(dmonth === "7"){
                month_name = "July";
            }
            else if(dmonth === "8"){
                month_name = "August";
            }
            else if(dmonth === "9"){
                month_name = "September";
            }
            else if(dmonth === "10"){
                month_name = "October";
            }
            else if(dmonth === "11"){
                month_name = "November";
            }
            else if(dmonth === "12"){
                month_name = "December";
            }
    
            var total_pending = 0;
            //console.log("SELECT * FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where linen_record.time='"+id+"'");
            con.query("SELECT sum(soil) as soil, sum(clean) as clean,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where year(time) = '"+dyear+"' and month(time) = '"+dmonth+"' group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time) order by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time)",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);

                    for(var i=0;i<rows.length;i++){
                        var newmonth,newday;
                        if(rows[i].month_s < 10){
                            newmonth = "0"+rows[i].month_s;
                        }
                        else{
                            newmonth = rows[i].month_s;
                        }

                        if(rows[i].day_s < 10){
                            newday = "0"+rows[i].day_s;
                        }
                        else{
                            newday = rows[i].day_s;
                        }
                        rows[i].new_date = newday+"-"+newmonth+"-"+rows[i].year_s;
                        rows[i].pending = rows[i].clean - rows[i].soil;
                        total_pending += rows[i].pending;
                    }
                    //console.log(rows);
                    console.log("total pending == "+total_pending);
                    res.render('report_linen_pending_print',{title:"Report",data:rows,dmonth:dmonth,dyear:dyear,month_name:month_name,total_pending:total_pending,linen_type:v_linen_type});
                }
            });
    
});

app.get('/print_asset/:type', function (req, res){
    
 v_item_type = req.sanitize( 'type' ).escape();
 if(v_item_type === "BEMS"){
            
            con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id left join m_zone on m_assets.assets_last_location = m_zone.zone_id where assets_inventory_type='BEMS'",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                    for(var i=0; i<rows.length;i++){
                        //dateFormatChange("");
                        rows[i].new_date = dateFormatChangeNew(rows[i].assets_last_datetime);

                    }
                    res.render('report_item_print',{title:"Report",data:rows});
                }
            });
            
        }
        else if(v_item_type === "FEMS"){
            
            con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id left join m_zone on m_assets.assets_last_location = m_zone.zone_id where assets_inventory_type='FEMS'",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                    for(var i=0; i<rows.length;i++){
                        //dateFormatChange("");
                        rows[i].new_date = dateFormatChangeNew(rows[i].assets_last_datetime);

                    }
                    res.render('report_item_print',{title:"Report",data:rows});
                }
            });
            
        }
        else{
            
            con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id left join m_zone on m_assets.assets_last_location = m_zone.zone_id",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                    res.render('report_item_print',{title:"Report",data:rows});
                }
            });
            
        }
});

app.get('/linen_clean_detail/:day/:month/:year',isAuthenticated,function(req,res){
    var day = req.params.day;
    var month = req.params.month;
    var year = req.params.year;
    
        var daytime = [];
        var type_list = [];
        var record_list;
        var record_table = [];
        
        //console.log("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,time FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' group by time,linen.linen_category");
                    con.query("SELECT time from m_linen_record where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' and clean='1' group by time order by time desc",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            for(var i=0;i<rows.length;i++){
                              daytime.push({ time:rows[i].time});
                            }
                           //console.log("daytime-- "+JSON.stringify(daytime));
                        }
                    });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,time FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' group by time,m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_timeline = daytime[i].time.toString();
                                         
                                         var row_timeline = rows[k].time.toString();
                                         
                                         //console.log("dt_timeline-- "+dt_timeline+" row_timeline-- "+row_timeline);
                                         if(dt_timeline === row_timeline){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newdatetime = dateFormatChange(daytime[i].time);

                                         
                                         record_list = { datetime:newdatetime,time:daytime[i].time,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               var new_date = day+"-"+month+"-"+year;
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen_clean_detail',{title:"Report",data:record_table,new_date:new_date,day:day,month:month,year:year});
                        }
                    });
    
        

});

app.get('/linen_soil_detail/:day/:month/:year',isAuthenticated,function(req,res){
    var day = req.params.day;
    var month = req.params.month;
    var year = req.params.year;
    
        var daytime = [];
        var type_list = [];
        var record_list;
        var record_table = [];

                    //console.log("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,time FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' group by time,linen.linen_category");
                    con.query("SELECT time from m_linen_record where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' and soil='1' group by time order by time desc",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            for(var i=0;i<rows.length;i++){
                              daytime.push({ time:rows[i].time});
                            }
                           //console.log("daytime-- "+JSON.stringify(daytime));
                        }
                    });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,time FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' group by time,m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_timeline = daytime[i].time.toString();
                                         
                                         var row_timeline = rows[k].time.toString();
                                         
                                         //console.log("dt_timeline-- "+dt_timeline+" row_timeline-- "+row_timeline);
                                         if(dt_timeline === row_timeline){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newdatetime = dateFormatChange(daytime[i].time);

                                         
                                         record_list = { datetime:newdatetime,time:daytime[i].time,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               var new_date = day+"-"+month+"-"+year;
                               console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen_soil_detail',{title:"Report",data:record_table,new_date:new_date,day:day,month:month,year:year});
                        }
                    });

});

app.get('/report_linen_clean_detail_print/:day/:month/:year',isAuthenticated,function(req,res){
   var day = req.params.day;
    var month = req.params.month;
    var year = req.params.year;
    
        var daytime = [];
        var type_list = [];
        var record_list;
        var record_table = [];

                    //console.log("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,time FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' group by time,linen.linen_category");
                    con.query("SELECT time from m_linen_record where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' and clean='1' group by time order by time desc",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            for(var i=0;i<rows.length;i++){
                              daytime.push({ time:rows[i].time});
                            }
                           //console.log("daytime-- "+JSON.stringify(daytime));
                        }
                    });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,time FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' group by time,m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_timeline = daytime[i].time.toString();
                                         
                                         var row_timeline = rows[k].time.toString();
                                         
                                         //console.log("dt_timeline-- "+dt_timeline+" row_timeline-- "+row_timeline);
                                         if(dt_timeline === row_timeline){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newdatetime = dateFormatChange(daytime[i].time);

                                         
                                         record_list = { datetime:newdatetime,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               var new_date = day+"-"+month+"-"+year;
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen_clean_detail_print',{title:"Report",data:record_table,new_date:new_date});
                        }
                    });  

});

app.get('/report_linen_soil_detail_print/:day/:month/:year',isAuthenticated,function(req,res){
    
    var day = req.params.day;
    var month = req.params.month;
    var year = req.params.year;
    
        var daytime = [];
        var type_list = [];
        var record_list;
        var record_table = [];

                    //console.log("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,time FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' group by time,linen.linen_category");
                    con.query("SELECT time from m_linen_record where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' and soil='1' group by time order by time desc",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            for(var i=0;i<rows.length;i++){
                              daytime.push({ time:rows[i].time});
                            }
                           //console.log("daytime-- "+JSON.stringify(daytime));
                        }
                    });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,time FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' group by time,m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_timeline = daytime[i].time.toString();
                                         
                                         var row_timeline = rows[k].time.toString();
                                         
                                         //console.log("dt_timeline-- "+dt_timeline+" row_timeline-- "+row_timeline);
                                         if(dt_timeline === row_timeline){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newdatetime = dateFormatChange(daytime[i].time);

                                         
                                         record_list = { datetime:newdatetime,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               var new_date = day+"-"+month+"-"+year;
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen_soil_detail_print',{title:"Linen",data:record_table,new_date:new_date});
                        }
                    });
    

});

app.get('/linen_soil_detail_view/:day/:month/:year',isAuthenticated,function(req,res){
    var day = req.params.day;
    var month = req.params.month;
    var year = req.params.year;
    
        var daytime = [];
        var type_list = [];
        var record_list;
        var record_table = [];

                    //console.log("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,time FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' group by time,linen.linen_category");
                    con.query("SELECT time from m_linen_record where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' and soil='1' group by time order by time desc",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            for(var i=0;i<rows.length;i++){
                              daytime.push({ time:rows[i].time});
                            }
                           //console.log("daytime-- "+JSON.stringify(daytime));
                        }
                    });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,time FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' group by time,m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_timeline = daytime[i].time;
                                         
                                         var row_timeline = rows[k].time;
                                         
                                         //console.log("dt_timeline-- "+dt_timeline+" row_timeline-- "+row_timeline);
                                         if(dt_timeline === row_timeline){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil,clean:rows[k].clean});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newdatetime = dateFormatChange(daytime[i].time);

                                         
                                         record_list = { datetime:newdatetime,time:rows[k].time,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               var new_date = day+"-"+month+"-"+year;
                               console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('linen_soil_detail_view',{title:"Linen",data:record_table,new_date:new_date,day:day,month:month,year:year});
                        }
                    });

});

app.get('/linen_clean_detail_view/:day/:month/:year',isAuthenticated,function(req,res){
    var day = req.params.day;
    var month = req.params.month;
    var year = req.params.year;
    
        var daytime = [];
        var type_list = [];
        var record_list;
        var record_table = [];
        
        //console.log("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,time FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' group by time,linen.linen_category");
                    con.query("SELECT time from m_linen_record where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' and clean='1' group by time order by time desc",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            for(var i=0;i<rows.length;i++){
                              daytime.push({ time:rows[i].time});
                            }
                           //console.log("daytime-- "+JSON.stringify(daytime));
                        }
                    });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,time FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' group by time,m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_timeline = daytime[i].time;
                                         
                                         var row_timeline = rows[k].time;
                                         
                                         //console.log("dt_timeline-- "+dt_timeline+" row_timeline-- "+row_timeline);
                                         if(dt_timeline === row_timeline){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil,clean:rows[k].clean});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                             var newdatetime = dateFormatChange(dt_timeline);

                                         
                                         record_list = { datetime:newdatetime,time:row_timeline,list:type_list};
                                         }

                                         

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               var new_date = day+"-"+month+"-"+year;
                               console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('linen_clean_detail_view',{title:"Linen",data:record_table,new_date:new_date,day:day,month:month,year:year});
                        }
                    });
    
        

});

app.get('/linen_iron_detail_view/:day/:month/:year',isAuthenticated,function(req,res){
    var day = req.params.day;
    var month = req.params.month;
    var year = req.params.year;
    
        var daytime = [];
        var type_list = [];
        var record_list;
        var record_table = [];
        
        //console.log("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,time FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' group by time,linen.linen_category");
                    con.query("SELECT time from m_linen_record where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' and housekeeping='1' group by time order by time desc",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            for(var i=0;i<rows.length;i++){
                              daytime.push({ time:rows[i].time});
                            }
                           //console.log("daytime-- "+JSON.stringify(daytime));
                        }
                    });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,sum(housekeeping) as iron,linen_category,time FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where year(time) = '"+year+"' and month(time) = '"+month+"' and day(time) = '"+day+"' group by time,m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_timeline = daytime[i].time;
                                         
                                         var row_timeline = rows[k].time;
                                         
                                         //console.log("dt_timeline-- "+dt_timeline+" row_timeline-- "+row_timeline);
                                         if(dt_timeline === row_timeline){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil,clean:rows[k].clean,iron:rows[k].iron});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                             var newdatetime = dateFormatChange(dt_timeline);

                                         
                                         record_list = { datetime:newdatetime,time:row_timeline,list:type_list};
                                         }

                                         

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               var new_date = day+"-"+month+"-"+year;
                               console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('linen_iron_detail_view',{title:"Linen",data:record_table,new_date:new_date,day:day,month:month,year:year});
                        }
                    });
    
        

});


app.get('/logout', function (req, res){
    
    var d = new Date();
            var ddate = d.getDate();
            var dmonth = d.getMonth()+1;
            var dyear = d.getFullYear();
            var dhour = d.getHours();
            var dminutes = d.getMinutes();
            var dseconds = d.getSeconds();

            if(ddate < 10){
                ddate = "0"+ddate;
            }
            if(dmonth < 10){
                dmonth = "0"+dmonth;
            }

            if(dhour < 10){
                dhour = "0"+dhour;
            }
            if(dminutes < 10){
                dminutes = "0"+dminutes;
            }
            if(dseconds < 10){
                dseconds = "0"+dseconds;
            }

                
            var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;
            
           con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','User Logout','"+newdate+"')",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   
                  //console.log(daytime);
               }
           });
           
           
  req.session.destroy(function (err) {
    res.redirect('/'); 
  });
});

//sending email
app.get('/send_email',function(req,res){
   transporter.sendMail(mailOptionsUnauthorized, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
});

//Users function
app.get('/admin_users',isAuthenticated,function(req,res){
   con.query("SELECT * FROM m_users",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_users',{title:"Admin Users",data:rows});
       }
   }); 
});

app.get('/admin_users/update/:users_id',isAuthenticated,function(req,res){
    var users_id = req.params.users_id;
   con.query("SELECT * FROM m_users WHERE users_id = ?",[users_id],function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           if(req.session.passport.user.user_right !== "Administrator"){
                res.render('admin_users_update_2',{title:"User",data:rows});
            }
            else{
                res.render('admin_users_update',{title:"Admin Users",data:rows});
            }
       }
   }); 
});

app.delete('/admin_users/delete/:users_id',isAuthenticated,function(req,res){
    var users_id = req.params.users_id;
   con.query("DELETE FROM m_users WHERE users_id = ?",[users_id],function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           var d = new Date();
            var ddate = d.getDate();
            var dmonth = d.getMonth()+1;
            var dyear = d.getFullYear();
            var dhour = d.getHours();
            var dminutes = d.getMinutes();
            var dseconds = d.getSeconds();

            if(ddate < 10){
                ddate = "0"+ddate;
            }
            if(dmonth < 10){
                dmonth = "0"+dmonth;
            }

            if(dhour < 10){
                dhour = "0"+dhour;
            }
            if(dminutes < 10){
                dminutes = "0"+dminutes;
            }
            if(dseconds < 10){
                dseconds = "0"+dseconds;
            }

                
            var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;
            
           con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Delete user with ID "+users_id+"','"+newdate+"')",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   
                  //console.log(daytime);
               }
           });
           
           req.flash('msg_info', 'Delete users success'); 
           res.redirect('/admin_users');
       }
   }); 
});

app.post('/admin_users/add',isAuthenticated,function(req,res){
    
        v_username = req.sanitize( 'username' ).escape().trim(); 
        v_name = req.sanitize( 'name' ).escape().trim();
        v_password = req.sanitize( 'password' ).escape().trim();
        v_email = req.sanitize( 'email' ).escape();
        v_phone_no = req.sanitize( 'phone_no' ).escape();
        v_staff_id = req.sanitize( 'staff_id' ).escape();
        v_account_expiry = req.sanitize( 'account_expiry' ).escape();
        v_user_role = req.sanitize( 'user_role' ).escape();
        v_user_right = req.sanitize( 'user_right' ).escape();
 
        var users_info = {
            username: v_username,
            name: v_name,
            password: v_password,
            email : v_email,
            phone_no : v_phone_no,
            staff_id : v_staff_id,
            account_expiry : v_account_expiry,
            user_role : v_user_role,
            user_right : v_user_right
        };
        con.query("INSERT INTO m_users SET ?",users_info,function(error,rows,fields){
            if(error)
                {
                    var errors_detail  = ("Error Insert : %s ",error );   
                    req.flash('msg_error', errors_detail); 
                    res.render('admin_users/admin_users_add', 
                    { 
                        username: req.param('username'), 
                        name: req.param('name'),
                        password: req.param('password'),
                        email: req.param('email'),
                        phone_no: req.param('phone_no'), 
                        staff_id: req.param('staff_id'),
                        account_expiry: req.param('account_expiry'),
                        user_role: req.param('user_role'),
                        user_right: req.param('user_right')
                    });
                }else{
                        var d = new Date();
                        var ddate = d.getDate();
                        var dmonth = d.getMonth()+1;
                        var dyear = d.getFullYear();
                        var dhour = d.getHours();
                        var dminutes = d.getMinutes();
                        var dseconds = d.getSeconds();

                        if(ddate < 10){
                            ddate = "0"+ddate;
                        }
                        if(dmonth < 10){
                            dmonth = "0"+dmonth;
                        }

                        if(dhour < 10){
                            dhour = "0"+dhour;
                        }
                        if(dminutes < 10){
                            dminutes = "0"+dminutes;
                        }
                        if(dseconds < 10){
                            dseconds = "0"+dseconds;
                        }


                        var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                       con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Add New User','"+newdate+"')",function(error,rows,fields){
                           if(!!error){
                               console.log('Error in the query '+error);
                           }
                           else{

                              //console.log(daytime);
                           }
                       });
                    req.flash('msg_info', 'Add users success'); 
                    res.redirect('/admin_users');
                }     
   }); 
});

app.post('/admin_users/update/:users_id',isAuthenticated,function(req,res){
    if(req.session.passport.user.user_right === "Administrator"){
        var users_id = req.params.users_id;
//        v_users_id = req.sanitize( 'users_id' ).escape().trim();
        v_username = req.sanitize( 'username' ).escape().trim(); 
        v_name = req.sanitize( 'name' ).escape().trim();
        v_password = req.sanitize( 'password' ).escape().trim();
        v_email = req.sanitize( 'email' ).escape();
        v_phone_no = req.sanitize( 'phone_no' ).escape();
        v_staff_id = req.sanitize( 'staff_id' ).escape();
        v_account_expiry = req.sanitize( 'account_expiry' ).escape();
        v_user_role = req.sanitize( 'user_role' ).escape();
        v_user_right = req.sanitize( 'user_right' ).escape();
 
        var users_info = {
            username: v_username,
            name: v_name,
            password: v_password,
            email : v_email,
            phone_no : v_phone_no,
            staff_id : v_staff_id,
            account_expiry : v_account_expiry,
            user_role : v_user_role,
            user_right : v_user_right
        };
   con.query("Update m_users SET ? WHERE users_id ="+users_id,users_info,function(error,rows,fields){
            if(error)
                {
                    var errors_detail  = ("Error Insert : %s ",error );   
                    req.flash('msg_error', errors_detail); 
                    res.render('/admin_users/update/'+users_id, 
                    { 
                        username: req.param('username'), 
                        users_id: req.param('users_id'),
                        name: req.param('name'),
                        password: req.param('password'),
                        email: req.param('email'),
                        phone_no: req.param('phone_no'), 
                        staff_id: req.param('staff_id'),
                        account_expiry: req.param('account_expiry'),
                        user_role: req.param('user_role'),
                        user_right: req.param('user_right')
                    });
                }else{
                    
                    var d = new Date();
                    var ddate = d.getDate();
                    var dmonth = d.getMonth()+1;
                    var dyear = d.getFullYear();
                    var dhour = d.getHours();
                    var dminutes = d.getMinutes();
                    var dseconds = d.getSeconds();

                    if(ddate < 10){
                        ddate = "0"+ddate;
                    }
                    if(dmonth < 10){
                        dmonth = "0"+dmonth;
                    }

                    if(dhour < 10){
                        dhour = "0"+dhour;
                    }
                    if(dminutes < 10){
                        dminutes = "0"+dminutes;
                    }
                    if(dseconds < 10){
                        dseconds = "0"+dseconds;
                    }


                    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                   con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Update user with ID "+users_id+"','"+newdate+"')",function(error,rows,fields){
                       if(!!error){
                           console.log('Error in the query '+error);
                       }
                       else{

                          //console.log(daytime);
                       }
                   });
           
           
                    req.flash('msg_info', 'Update users success'); 
                    if(req.session.passport.user.user_right === "Linen Operator"){
                        res.redirect('/dashboard_linen');
                    }
                    else if(req.session.passport.user.user_right === "Environment"){
                        res.redirect('/environment');
                    }
                    else{
                        res.redirect('/admin_users');
                    }
                }     
        }); 
    }
    
    else{
        
        var users_id = req.params.users_id;
//        v_users_id = req.sanitize( 'users_id' ).escape().trim();
        v_username = req.sanitize( 'username' ).escape().trim(); 
        v_name = req.sanitize( 'name' ).escape().trim();
        v_password = req.sanitize( 'password' ).escape().trim();
        v_email = req.sanitize( 'email' ).escape();
        v_phone_no = req.sanitize( 'phone_no' ).escape();
        v_staff_id = req.sanitize( 'staff_id' ).escape();
        v_account_expiry = req.sanitize( 'account_expiry' ).escape();
       
       
        var users_info = {
            username: v_username,
            name: v_name,
            password: v_password,
            email : v_email,
            phone_no : v_phone_no,
            staff_id : v_staff_id,
            account_expiry : v_account_expiry
            
        };
        
        
   con.query("Update m_users SET ? WHERE users_id ="+users_id,users_info,function(error,rows,fields){
            if(error)
                {
                    var errors_detail  = ("Error Insert : %s ",error );   
                    req.flash('msg_error', errors_detail); 
                    res.render('/admin_users/update/'+users_id, 
                    { 
                        username: req.param('username'), 
                        users_id: req.param('users_id'),
                        name: req.param('name'),
                        password: req.param('password'),
                        email: req.param('email'),
                        phone_no: req.param('phone_no'), 
                        staff_id: req.param('staff_id'),
                        account_expiry: req.param('account_expiry')
                    });
                }else{
                    
                    var d = new Date();
                    var ddate = d.getDate();
                    var dmonth = d.getMonth()+1;
                    var dyear = d.getFullYear();
                    var dhour = d.getHours();
                    var dminutes = d.getMinutes();
                    var dseconds = d.getSeconds();

                    if(ddate < 10){
                        ddate = "0"+ddate;
                    }
                    if(dmonth < 10){
                        dmonth = "0"+dmonth;
                    }

                    if(dhour < 10){
                        dhour = "0"+dhour;
                    }
                    if(dminutes < 10){
                        dminutes = "0"+dminutes;
                    }
                    if(dseconds < 10){
                        dseconds = "0"+dseconds;
                    }


                    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                   con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Update user details','"+newdate+"')",function(error,rows,fields){
                       if(!!error){
                           console.log('Error in the query '+error);
                       }
                       else{

                          //console.log(daytime);
                       }
                   });
           
           
                    req.flash('msg_info', 'Update users success'); 
                    if(req.session.passport.user.user_right === "Linen Operator"){
                        res.redirect('/dashboard_linen');
                    }
                    else if(req.session.passport.user.user_right === "Environment"){
                        res.redirect('/environment');
                    }
                    else{
                        res.redirect('/');
                    }
                }
                
        }); 
    
    }
});

app.get('/admin_audit',isAuthenticated,function(req,res){
   con.query("SELECT * FROM m_audit left join m_users on m_audit.user_id = m_users.users_id",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
            for(var i=0; i<rows.length;i++){
                        //dateFormatChange("");
                        rows[i].new_date = dateFormatChangeNew(rows[i].action_timestamp);

                    }
           res.render('admin_audit',{title:"Audit Trail",data:rows});
       }
   }); 
});


//Zone function
app.get('/admin_zone',isAuthenticated,function(req,res){
   con.query("SELECT * FROM m_zone",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_zone',{title:"Admin Zone",data:rows});
       }
   }); 
});

app.get('/admin_zone/update/:zone_id',isAuthenticated,function(req,res){
    var zone_id = req.params.zone_id;
   con.query("SELECT * FROM m_zone WHERE zone_id = ?",[zone_id],function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_zone_update',{title:"Admin Zone",data:rows});
       }
   }); 
});

app.delete('/admin_zone/delete/:zone_id',isAuthenticated,function(req,res){
    var zone_id = req.params.zone_id;
   con.query("DELETE FROM m_zone WHERE zone_id = ?",[zone_id],function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           
            var d = new Date();
            var ddate = d.getDate();
            var dmonth = d.getMonth()+1;
            var dyear = d.getFullYear();
            var dhour = d.getHours();
            var dminutes = d.getMinutes();
            var dseconds = d.getSeconds();

            if(ddate < 10){
                ddate = "0"+ddate;
            }
            if(dmonth < 10){
                dmonth = "0"+dmonth;
            }

            if(dhour < 10){
                dhour = "0"+dhour;
            }
            if(dminutes < 10){
                dminutes = "0"+dminutes;
            }
            if(dseconds < 10){
                dseconds = "0"+dseconds;
            }

                
            var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;
            
           con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Delete zone with ID "+zone_id+"','"+newdate+"')",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   
                  //console.log(daytime);
               }
           });
           
           req.flash('msg_info', 'Delete users success'); 
           res.redirect('/admin_zone');
       }
   }); 
});

app.post('/admin_zone/add',isAuthenticated,function(req,res){
    
        v_zone_name = req.sanitize( 'zone_name' ).escape().trim(); 
        v_reader_name = req.sanitize( 'reader_name' ).escape().trim();
 
        var zone_info = {
            zone_name: v_zone_name,
            zone_reader_id: v_reader_name
        };
        con.query("INSERT INTO m_zone SET ?",zone_info,function(error,rows,fields){
            if(error)
                {
                    var errors_detail  = ("Error Insert : %s ",error );   
                    req.flash('msg_error', errors_detail); 
                    res.render('admin_zone/admin_zone_add', 
                    { 
                        zone_name: req.param('zone_name'), 
                        zone_reader_id: req.param('reader_name')
                    });
                }else{
                    
                    var d = new Date();
                    var ddate = d.getDate();
                    var dmonth = d.getMonth()+1;
                    var dyear = d.getFullYear();
                    var dhour = d.getHours();
                    var dminutes = d.getMinutes();
                    var dseconds = d.getSeconds();

                    if(ddate < 10){
                        ddate = "0"+ddate;
                    }
                    if(dmonth < 10){
                        dmonth = "0"+dmonth;
                    }

                    if(dhour < 10){
                        dhour = "0"+dhour;
                    }
                    if(dminutes < 10){
                        dminutes = "0"+dminutes;
                    }
                    if(dseconds < 10){
                        dseconds = "0"+dseconds;
                    }


                    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                   con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Add new Zone','"+newdate+"')",function(error,rows,fields){
                       if(!!error){
                           console.log('Error in the query '+error);
                       }
                       else{

                          //console.log(daytime);
                       }
                   });
           
           
                    req.flash('msg_info', 'Add zone success'); 
                    res.redirect('/admin_zone');
                }     
   }); 
});

app.post('/admin_zone/update/:zone_id',isAuthenticated,function(req,res){
        var zone_id = req.params.zone_id;
//        v_users_id = req.sanitize( 'users_id' ).escape().trim();
        v_zone_name = req.sanitize( 'zone_name' ).escape().trim(); 
        v_reader_name = req.sanitize( 'reader_name' ).escape().trim();
 
        var zone_info = {
            zone_name: v_zone_name,
            zone_reader_id: v_reader_name
        };
   con.query("Update m_zone SET ? WHERE zone_id ="+zone_id,zone_info,function(error,rows,fields){
            if(error)
                {
                    var errors_detail  = ("Error Insert : %s ",error );   
                    req.flash('msg_error', errors_detail); 
                    res.render('admin_zone/admin_zone_update', 
                    { 
                        zone_name: req.param('zone_name'), 
                        zone_reader_id: req.param('reader_name')
                    });
                }else{
                    
                    var d = new Date();
                    var ddate = d.getDate();
                    var dmonth = d.getMonth()+1;
                    var dyear = d.getFullYear();
                    var dhour = d.getHours();
                    var dminutes = d.getMinutes();
                    var dseconds = d.getSeconds();

                    if(ddate < 10){
                        ddate = "0"+ddate;
                    }
                    if(dmonth < 10){
                        dmonth = "0"+dmonth;
                    }

                    if(dhour < 10){
                        dhour = "0"+dhour;
                    }
                    if(dminutes < 10){
                        dminutes = "0"+dminutes;
                    }
                    if(dseconds < 10){
                        dseconds = "0"+dseconds;
                    }


                    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                   con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Update Zone with ID "+zone_id+"','"+newdate+"')",function(error,rows,fields){
                       if(!!error){
                           console.log('Error in the query '+error);
                       }
                       else{

                          //console.log(daytime);
                       }
                   });
           
           
                    req.flash('msg_info', 'Update zone success'); 
                    res.redirect('/admin_zone');
                }     
   }); 
});


//Department function
app.get('/admin_department',isAuthenticated,function(req,res){
   con.query("SELECT * FROM m_department",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_department',{title:"Admin Department",data:rows});
       }
   }); 
});

app.get('/admin_department/update/:dept_id',isAuthenticated,function(req,res){
    var dept_id = req.params.dept_id;
   con.query("SELECT * FROM m_department WHERE dept_id = ?",[dept_id],function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_department_update',{title:"Admin Department",data:rows});
       }
   }); 
});

app.post('/admin_department/add',isAuthenticated,function(req,res){
    
        v_dept_code = req.sanitize( 'dept_code' ).escape().trim(); 
        v_dept_desc = req.sanitize( 'dept_desc' ).escape().trim();
        v_pic_name = req.sanitize( 'pic_name' ).escape().trim();
        v_email = req.sanitize( 'email' ).escape();
        
 
        var dept_info = {
            dept_code: v_dept_code,
            dept_desc: v_dept_desc,
            dept_pic_name: v_pic_name,
            dept_email : v_email
        };
        con.query("INSERT INTO m_department SET ?",dept_info,function(error,rows,fields){
            if(error)
                {
                    var errors_detail  = ("Error Insert : %s ",error );   
                    req.flash('msg_error', errors_detail); 
                    res.render('admin_department_add', 
                    { 
                        dept_code: req.param('dept_code'), 
                        dept_desc: req.param('dept_desc'),
                        pic_name: req.param('pic_name'),
                        email: req.param('email')
                    });
                }else{
                    
                    var d = new Date();
                    var ddate = d.getDate();
                    var dmonth = d.getMonth()+1;
                    var dyear = d.getFullYear();
                    var dhour = d.getHours();
                    var dminutes = d.getMinutes();
                    var dseconds = d.getSeconds();

                    if(ddate < 10){
                        ddate = "0"+ddate;
                    }
                    if(dmonth < 10){
                        dmonth = "0"+dmonth;
                    }

                    if(dhour < 10){
                        dhour = "0"+dhour;
                    }
                    if(dminutes < 10){
                        dminutes = "0"+dminutes;
                    }
                    if(dseconds < 10){
                        dseconds = "0"+dseconds;
                    }


                    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                   con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Add new Department','"+newdate+"')",function(error,rows,fields){
                       if(!!error){
                           console.log('Error in the query '+error);
                       }
                       else{

                          //console.log(daytime);
                       }
                   });
                   
                   
                    req.flash('msg_info', 'Add department success'); 
                    res.redirect('/admin_department');
                }     
   }); 
});

app.post('/admin_department/update/:dept_id',isAuthenticated,function(req,res){
        var dept_id = req.params.dept_id;
        
        v_dept_code = req.sanitize( 'dept_code' ).escape().trim(); 
        v_dept_desc = req.sanitize( 'dept_desc' ).escape().trim();
        v_pic_name = req.sanitize( 'pic_name' ).escape().trim();
        v_email = req.sanitize( 'email' ).escape();
        
 
        var dept_info = {
            dept_code: v_dept_code,
            dept_desc: v_dept_desc,
            dept_pic_name: v_pic_name,
            dept_email : v_email
        };
   con.query("Update m_department SET ? WHERE dept_id ="+dept_id,dept_info,function(error,rows,fields){
            if(error)
                {
                    var errors_detail  = ("Error Insert : %s ",error );   
                    req.flash('msg_error', errors_detail); 
                    res.render('admin_users/admin_department_update', 
                    { 
                        dept_code: req.param('dept_code'), 
                        dept_desc: req.param('dept_desc'),
                        pic_name: req.param('pic_name'),
                        email: req.param('email')
                    });
                }else{
                    
                    var d = new Date();
                    var ddate = d.getDate();
                    var dmonth = d.getMonth()+1;
                    var dyear = d.getFullYear();
                    var dhour = d.getHours();
                    var dminutes = d.getMinutes();
                    var dseconds = d.getSeconds();

                    if(ddate < 10){
                        ddate = "0"+ddate;
                    }
                    if(dmonth < 10){
                        dmonth = "0"+dmonth;
                    }

                    if(dhour < 10){
                        dhour = "0"+dhour;
                    }
                    if(dminutes < 10){
                        dminutes = "0"+dminutes;
                    }
                    if(dseconds < 10){
                        dseconds = "0"+dseconds;
                    }


                    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                   con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Update Department with ID "+dept_id+"','"+newdate+"')",function(error,rows,fields){
                       if(!!error){
                           console.log('Error in the query '+error);
                       }
                       else{

                          //console.log(daytime);
                       }
                   });
           
           
                    req.flash('msg_info', 'Update department success'); 
                    res.redirect('/admin_department');
                }     
   }); 
});

app.delete('/admin_department/delete/:dept_id',isAuthenticated,function(req,res){
    var dept_id = req.params.dept_id;
   con.query("DELETE FROM m_department WHERE dept_id = ?",[dept_id],function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           
           var d = new Date();
            var ddate = d.getDate();
            var dmonth = d.getMonth()+1;
            var dyear = d.getFullYear();
            var dhour = d.getHours();
            var dminutes = d.getMinutes();
            var dseconds = d.getSeconds();

            if(ddate < 10){
                ddate = "0"+ddate;
            }
            if(dmonth < 10){
                dmonth = "0"+dmonth;
            }

            if(dhour < 10){
                dhour = "0"+dhour;
            }
            if(dminutes < 10){
                dminutes = "0"+dminutes;
            }
            if(dseconds < 10){
                dseconds = "0"+dseconds;
            }

                
            var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;
            
           con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Delete Department with ID "+dept_id+"','"+newdate+"')",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   
                  //console.log(daytime);
               }
           });
           
           
           req.flash('msg_info', 'Delete department success'); 
           res.redirect('/admin_department');
       }
   }); 
});

//Gateway function
app.get('/admin_gateway_add',isAuthenticated,function(req,res){
   con.query("SELECT * FROM m_zone",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_gateway_add',{title:"Add Admin Gateway",data:rows});
       }
   }); 
});

app.get('/admin_gateway',isAuthenticated,function(req,res){
   con.query("SELECT * FROM m_gateway left join m_zone on m_gateway.gateway_location = m_zone.zone_id",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_gateway',{title:"Admin Gateway",data:rows});
       }
   }); 
});

app.get('/admin_gateway/update/:gateway_id',isAuthenticated,function(req,res){
    var gateway_id = req.params.gateway_id;
    var zone;
    con.query("SELECT * FROM m_zone",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           zone = rows;
           //res.render('admin_gateway_add',{title:"Add Admin Gateway",data:rows});
       }
   }); 
   
   con.query("SELECT * FROM m_gateway WHERE gateway_id = ?",[gateway_id],function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_gateway_update',{title:"Admin Gateway",data:rows,zone:zone});
       }
   }); 
});

app.post('/admin_gateway/add',isAuthenticated,function(req,res){
    
        v_gateway_desc = req.sanitize( 'gateway_desc' ).escape().trim(); 
        v_gateway_name = req.sanitize( 'gateway_name' ).escape().trim();
        v_gateway_location = req.sanitize( 'gateway_location' ).escape().trim();
        v_ip_address = req.sanitize( 'ip_address' ).escape().trim();
        v_mac_address = req.sanitize( 'mac_address' ).escape().trim();
        
    //console.log('rfid ='+v_gateway_desc);
    //console.log('dept desc ='+v_gateway_name);
    //console.log('asset no ='+v_gateway_location);
    //console.log('dept code ='+v_ip_address);
        
 
        var gateway_info = {
            gateway_desc: v_gateway_desc,
            gateway_name: v_gateway_name,
            gateway_location: v_gateway_location,
            gateway_ip_add : v_ip_address,
            gateway_mac_add : v_mac_address
        };
        con.query("INSERT INTO m_gateway SET ?",gateway_info,function(error,rows,fields){
            if(error)
                {
                    var errors_detail  = ("Error Insert : %s ",error );   
                    req.flash('msg_error', errors_detail); 
                    res.render('admin_gateway_add', 
                    { 
                        gateway_desc: req.param('gateway_desc'), 
                        gateway_name: req.param('gateway_name'),
                        gateway_location: req.param('gateway_location'),
                        ip_address: req.param('ip_address'),
                        mac_address: req.param('mac_address')
                    });
                }else{
                    
                    var d = new Date();
                    var ddate = d.getDate();
                    var dmonth = d.getMonth()+1;
                    var dyear = d.getFullYear();
                    var dhour = d.getHours();
                    var dminutes = d.getMinutes();
                    var dseconds = d.getSeconds();

                    if(ddate < 10){
                        ddate = "0"+ddate;
                    }
                    if(dmonth < 10){
                        dmonth = "0"+dmonth;
                    }

                    if(dhour < 10){
                        dhour = "0"+dhour;
                    }
                    if(dminutes < 10){
                        dminutes = "0"+dminutes;
                    }
                    if(dseconds < 10){
                        dseconds = "0"+dseconds;
                    }


                    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                   con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Add new Gateway','"+newdate+"')",function(error,rows,fields){
                       if(!!error){
                           console.log('Error in the query '+error);
                       }
                       else{

                          //console.log(daytime);
                       }
                   });
           
           
                    req.flash('msg_info', 'Add gateway success'); 
                    res.redirect('/admin_gateway');
                }     
   }); 
});

app.post('/admin_gateway/update/:gateway_id',isAuthenticated,function(req,res){
        var gateway_id = req.params.gateway_id;
        
        v_gateway_desc = req.sanitize( 'gateway_desc' ).escape().trim(); 
        v_gateway_name = req.sanitize( 'gateway_name' ).escape().trim();
        v_gateway_location = req.sanitize( 'gateway_location' ).escape().trim();
        v_ip_address = req.sanitize( 'ip_address' ).escape().trim();
        v_mac_address = req.sanitize( 'mac_address' ).escape().trim();
        
 
        var gateway_info = {
            gateway_desc: v_gateway_desc,
            gateway_name: v_gateway_name,
            gateway_location: v_gateway_location,
            gateway_ip_add : v_ip_address,
            gateway_mac_add : v_mac_address
        };
        
   con.query("Update m_gateway SET ? WHERE gateway_id ="+gateway_id,gateway_info,function(error,rows,fields){
            if(error)
                {
                    var errors_detail  = ("Error Insert : %s ",error );   
                    req.flash('msg_error', errors_detail); 
                    res.render('admin_users/admin_gateway_update', 
                    { 
                        gateway_desc: req.param('gateway_desc'), 
                        gateway_name: req.param('gateway_name'),
                        gateway_location: req.param('gateway_location'),
                        ip_address: req.param('ip_address'),
                        mac_address: req.param('mac_address')
                    });
                }else{
                    
                    var d = new Date();
                    var ddate = d.getDate();
                    var dmonth = d.getMonth()+1;
                    var dyear = d.getFullYear();
                    var dhour = d.getHours();
                    var dminutes = d.getMinutes();
                    var dseconds = d.getSeconds();

                    if(ddate < 10){
                        ddate = "0"+ddate;
                    }
                    if(dmonth < 10){
                        dmonth = "0"+dmonth;
                    }

                    if(dhour < 10){
                        dhour = "0"+dhour;
                    }
                    if(dminutes < 10){
                        dminutes = "0"+dminutes;
                    }
                    if(dseconds < 10){
                        dseconds = "0"+dseconds;
                    }


                    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                   con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Update Gateway with ID "+gateway_id+"','"+newdate+"')",function(error,rows,fields){
                       if(!!error){
                           console.log('Error in the query '+error);
                       }
                       else{

                          //console.log(daytime);
                       }
                   });
           
           
                    req.flash('msg_info', 'Update gateway success'); 
                    res.redirect('/admin_gateway');
                }     
   }); 
});

app.delete('/admin_gateway/delete/:gateway_id',isAuthenticated,function(req,res){
    var gateway_id = req.params.gateway_id;
   con.query("DELETE FROM m_gateway WHERE gateway_id = ?",[gateway_id],function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           
           var d = new Date();
            var ddate = d.getDate();
            var dmonth = d.getMonth()+1;
            var dyear = d.getFullYear();
            var dhour = d.getHours();
            var dminutes = d.getMinutes();
            var dseconds = d.getSeconds();

            if(ddate < 10){
                ddate = "0"+ddate;
            }
            if(dmonth < 10){
                dmonth = "0"+dmonth;
            }

            if(dhour < 10){
                dhour = "0"+dhour;
            }
            if(dminutes < 10){
                dminutes = "0"+dminutes;
            }
            if(dseconds < 10){
                dseconds = "0"+dseconds;
            }

                
            var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;
            
           con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Delete Gateway with ID "+gateway_id+"','"+newdate+"')",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   
                  //console.log(daytime);
               }
           });
           
           
           req.flash('msg_info', 'Delete gateway success'); 
           res.redirect('/admin_gateway');
       }
   }); 
});


//Assets function
app.get('/admin_assets_add',isAuthenticated,function(req,res){
    
    var department=[];
    var zone=[];
   con.query("SELECT * from m_department",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           console.log("deeeeepp="+JSON.stringify(rows));
           department = rows;
       }
   }); 
   
   con.query("SELECT * from m_zone",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           console.log("deeeeepp zone="+rows);
           zone = rows;
           console.log("deeeeepp="+JSON.stringify(department));
           res.render('admin_assets_add',{title:"Add Assets",department:department,zone:zone});
       }
   }); 
});

app.get('/assets',isAuthenticated,function(req,res){
   con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('assets',{title:"Assets",data:rows});
       }
   }); 
});

app.get('/maintenance_assets',isAuthenticated,function(req,res){
   con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id where assets_warranty_end < NOW() + INTERVAL 180 DAY",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('maintenance_assets',{title:"Assets",data:rows});
       }
   }); 
});

app.get('/admin_assets',isAuthenticated,function(req,res){
   con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_assets',{title:"Admin Assets",data:rows});
       }
   }); 
});

app.get('/admin_assets/id/:id',isAuthenticated,function(req,res){
   var id = req.params.id;
   con.query("SELECT * FROM m_history left join m_zone on m_history.history_last_location = m_zone.zone_id left join m_assets on m_history.history_tag_id = m_assets.assets_rfid left join m_department on m_assets.assets_dept_code = m_department.dept_id where m_history.history_tag_id='"+id+"' order by m_history.history_date_time_move desc",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           for(var i=0; i<rows.length;i++){
               //dateFormatChange("");
               rows[i].new_date = dateFormatChangeNew(rows[i].history_date_time_move);
               
           }
           res.render('admin_assets_history',{title:"Admin Assets",data:rows});
       }
   }); 
});

app.get('/admin_assets/update/:assets_id',isAuthenticated,function(req,res){
    var assets_id = req.params.assets_id;
    var department=[];
    var zone=[];
   con.query("SELECT * from m_department",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           department = rows;
       }
   }); 
   
   con.query("SELECT * from m_zone",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           zone = rows;
          
       }
   }); 
   
   con.query("SELECT * FROM m_assets WHERE assets_id = ?",[assets_id],function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_assets_update',{title:"Admin Assets",data:rows,department:department,zone:zone});
       }
   }); 
});

app.get('/admin_assets/update_image/:assets_id',isAuthenticated,function(req,res){
    var assets_id = req.params.assets_id;
   con.query("SELECT * FROM m_assets WHERE assets_id = ?",[assets_id],function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_assets_update_image',{title:"Admin Assets",data:rows});
       }
   }); 
});

app.post('/admin_assets/add',isAuthenticated,function(req,res){
    
    upload(req,res,function(err) {
        //console.log("get select from body ="+req.body.dept_code);
        v_rfid = req.sanitize( 'rfid' ).escape(); 
        v_inventory_type = req.sanitize( 'inventory_type' ).escape();
        v_asset_no = req.sanitize( 'asset_no' ).escape();
        v_dept_code = req.sanitize( 'dept_code' ).escape();
        v_zone_rfid = req.sanitize( 'zone_rfid' ).escape();
        v_room_code = req.sanitize( 'room_code' ).escape();
        v_room_desc = req.sanitize( 'room_desc' ).escape(); 
        v_item_desc = req.sanitize( 'item_desc' ).escape();
        v_manufacturer = req.sanitize( 'manufacturer' ).escape();
        v_make = req.sanitize( 'make' ).escape();
        v_model = req.sanitize( 'model' ).escape();
        v_brand = req.sanitize( 'brand' ).escape(); 
        v_serial_no = req.sanitize( 'serial_no' ).escape();
        v_supplier = req.sanitize( 'supplier' ).escape();
        v_type_code = req.sanitize( 'type_code' ).escape();
        v_warranty_start = req.sanitize( 'warranty_start' ).escape();
        v_warranty_end = req.sanitize( 'warranty_end' ).escape(); 
        v_acceptance_date = req.sanitize( 'acceptance_date' ).escape();
        v_task_code = req.sanitize( 'task_code' ).escape();
        v_frequency = req.sanitize( 'frequency' ).escape();
        v_order_no = req.sanitize( 'order_no' ).escape();
        v_warranty = req.sanitize( 'warranty' ).escape(); 
        v_variation = req.sanitize( 'variation' ).escape();
        v_asset_owner = req.sanitize( 'asset_owner' ).escape();
        if(err) {
            return res.end("Error uploading file."+err);
        }
//        res.end("File is uploaded."+req.file.path);
        filepath = req.file.path;
        
        var assets_info = {
            assets_rfid: v_rfid,
            assets_inventory_type: v_inventory_type,
            assets_no: v_asset_no,
            assets_dept_code: v_dept_code,
            assets_zone : v_zone_rfid,
            assets_room_code : v_room_code,
            assets_room_desc: v_room_desc,
            assets_item_desc: v_item_desc,
            assets_manufacturer: v_manufacturer,
            assets_make : v_make,
            assets_model : v_model,
            assets_brand : v_brand,
            assets_serial_no: v_serial_no,
            assets_supplier: v_supplier,
            assets_type_code: v_type_code,
            assets_warranty_start : v_warranty_start,
            assets_warranty_end : v_warranty_end,
            assets_acceptance_date : v_acceptance_date,
            assets_task_code : v_task_code,
            assets_frequency: v_frequency,
            assets_order_no: v_order_no,
            assets_warranty: v_warranty,
            assets_variation : v_variation,
            assets_owner : v_asset_owner,
            assets_img_path : filepath
        };
        con.query("INSERT INTO m_assets SET ?",assets_info,function(error,rows,fields){
            if(error)
                {
                    var errors_detail  = ("Error Insert : %s ",error );   
                    req.flash('msg_error', errors_detail); 
                    res.render('admin_assets_add', 
                    { 
                        rfid: req.param('rfid'), 
                        inventory_type: req.param('inventory_type'),
                        asset_no: req.param('asset_no'),
                        dept_code: req.param('dept_code'),
                        zone_rfid: req.param('zone_rfid'),
                        room_code: req.param('room_code'), 
                        room_desc: req.param('room_desc'),
                        item_desc: req.param('item_desc'),
                        manufacturer: req.param('manufacturer'),
                        make: req.param('make'),
                        model: req.param('model'),
                        brand: req.param('brand'), 
                        serial_no: req.param('serial_no'),
                        supplier: req.param('supplier'),
                        type_code: req.param('type_code'),
                        warranty_start: req.param('warranty_start'),
                        warranty_end: req.param('warranty_end'),
                        acceptance_date: req.param('acceptance_date'),
                        task_code: req.param('task_code'), 
                        frequency: req.param('frequency'),
                        order_no: req.param('order_no'),
                        warranty: req.param('warranty'),
                        variation: req.param('variation'),
                        asset_owner: req.param('asset_owner')
                    });
                }else{
                    
                    var d = new Date();
                    var ddate = d.getDate();
                    var dmonth = d.getMonth()+1;
                    var dyear = d.getFullYear();
                    var dhour = d.getHours();
                    var dminutes = d.getMinutes();
                    var dseconds = d.getSeconds();

                    if(ddate < 10){
                        ddate = "0"+ddate;
                    }
                    if(dmonth < 10){
                        dmonth = "0"+dmonth;
                    }

                    if(dhour < 10){
                        dhour = "0"+dhour;
                    }
                    if(dminutes < 10){
                        dminutes = "0"+dminutes;
                    }
                    if(dseconds < 10){
                        dseconds = "0"+dseconds;
                    }


                    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                   con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Add new Asset','"+newdate+"')",function(error,rows,fields){
                       if(!!error){
                           console.log('Error in the query '+error);
                       }
                       else{

                          //console.log(daytime);
                       }
                   });
           
           
                    req.flash('msg_info', 'Add gateway success'); 
                    res.redirect('/admin_assets');
                }     
      }); 
    });      
});

app.post('/admin_assets/update/:assets_id',isAuthenticated,function(req,res){
        var assets_id = req.params.assets_id;
        
        upload(req,res,function(err) {
        v_rfid = req.sanitize( 'rfid' ).escape(); 
        v_inventory_type = req.sanitize( 'inventory_type' ).escape();
        v_asset_no = req.sanitize( 'asset_no' ).escape();
        v_dept_code = req.sanitize( 'dept_code' ).escape();
        v_zone_rfid = req.sanitize( 'zone_rfid' ).escape();
        v_room_code = req.sanitize( 'room_code' ).escape();
        v_room_desc = req.sanitize( 'room_desc' ).escape(); 
        v_item_desc = req.sanitize( 'item_desc' ).escape();
        v_manufacturer = req.sanitize( 'manufacturer' ).escape();
        v_make = req.sanitize( 'make' ).escape();
        v_model = req.sanitize( 'model' ).escape();
        v_brand = req.sanitize( 'brand' ).escape(); 
        v_serial_no = req.sanitize( 'serial_no' ).escape();
        v_supplier = req.sanitize( 'supplier' ).escape();
        v_type_code = req.sanitize( 'type_code' ).escape();
        v_warranty_start = req.sanitize( 'warranty_start' ).escape();
        v_warranty_end = req.sanitize( 'warranty_end' ).escape(); 
        v_acceptance_date = req.sanitize( 'acceptance_date' ).escape();
        v_task_code = req.sanitize( 'task_code' ).escape();
        v_frequency = req.sanitize( 'frequency' ).escape();
        v_order_no = req.sanitize( 'order_no' ).escape();
        v_warranty = req.sanitize( 'warranty' ).escape(); 
        v_variation = req.sanitize( 'variation' ).escape();
        v_asset_owner = req.sanitize( 'asset_owner' ).escape();
        if(err) {
            return res.end("Error uploading file."+err);
        }
//        res.end("File is uploaded."+req.file.path);
//        filepath = req.file.path;
        
        var assets_info = {
            assets_rfid: v_rfid,
            assets_inventory_type: v_inventory_type,
            assets_no: v_asset_no,
            assets_dept_code: v_dept_code,
            assets_zone : v_zone_rfid,
            assets_room_code : v_room_code,
            assets_room_desc: v_room_desc,
            assets_item_desc: v_item_desc,
            assets_manufacturer: v_manufacturer,
            assets_make : v_make,
            assets_model : v_model,
            assets_brand : v_brand,
            assets_serial_no: v_serial_no,
            assets_supplier: v_supplier,
            assets_type_code: v_type_code,
            assets_warranty_start : v_warranty_start,
            assets_warranty_end : v_warranty_end,
            assets_acceptance_date : v_acceptance_date,
            assets_task_code : v_task_code,
            assets_frequency: v_frequency,
            assets_order_no: v_order_no,
            assets_warranty: v_warranty,
            assets_variation : v_variation,
            assets_owner : v_asset_owner
        };
        con.query("Update m_assets SET ? WHERE assets_id ="+assets_id,assets_info,function(error,rows,fields){
            if(error)
                {
                    var errors_detail  = ("Error Insert : %s ",error );   
                    req.flash('msg_error', errors_detail); 
                    res.render('admin_assets_update', 
                    { 
                        rfid: req.param('rfid'), 
                        inventory_type: req.param('inventory_type'),
                        asset_no: req.param('asset_no'),
                        dept_code: req.param('dept_code'),
                        zone_rfid: req.param('zone_rfid'),
                        room_code: req.param('room_code'), 
                        room_desc: req.param('room_desc'),
                        item_desc: req.param('item_desc'),
                        manufacturer: req.param('manufacturer'),
                        make: req.param('make'),
                        model: req.param('model'),
                        brand: req.param('brand'), 
                        serial_no: req.param('serial_no'),
                        supplier: req.param('supplier'),
                        type_code: req.param('type_code'),
                        warranty_start: req.param('warranty_start'),
                        warranty_end: req.param('warranty_end'),
                        acceptance_date: req.param('acceptance_date'),
                        task_code: req.param('task_code'), 
                        frequency: req.param('frequency'),
                        order_no: req.param('order_no'),
                        warranty: req.param('warranty'),
                        variation: req.param('variation'),
                        asset_owner: req.param('asset_owner')
                    });
                }else{
                    
                    var d = new Date();
                    var ddate = d.getDate();
                    var dmonth = d.getMonth()+1;
                    var dyear = d.getFullYear();
                    var dhour = d.getHours();
                    var dminutes = d.getMinutes();
                    var dseconds = d.getSeconds();

                    if(ddate < 10){
                        ddate = "0"+ddate;
                    }
                    if(dmonth < 10){
                        dmonth = "0"+dmonth;
                    }

                    if(dhour < 10){
                        dhour = "0"+dhour;
                    }
                    if(dminutes < 10){
                        dminutes = "0"+dminutes;
                    }
                    if(dseconds < 10){
                        dseconds = "0"+dseconds;
                    }


                    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                   con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Update Asset with ID "+v_asset_no+"','"+newdate+"')",function(error,rows,fields){
                       if(!!error){
                           console.log('Error in the query '+error);
                       }
                       else{

                          //console.log(daytime);
                       }
                   });
           
           
                    req.flash('msg_info', 'Update assets success'); 
                    res.redirect('/admin_assets');
                }     
      }); 
    });      
});

app.post('/admin_assets/update_image/:assets_id/uploads/:image_path',isAuthenticated,function(req,res){
        var assets_id = req.params.assets_id;
        var image_path = req.params.image_path;
        fs.unlinkSync('uploads/'+image_path);
        
        upload(req,res,function(err) {
        
        if(err) {
            return res.end("Error uploading file."+err);
        }
//        res.end("File is uploaded."+req.file.path);
        filepath = req.file.path;
        
        var assets_info = {
            assets_img_path: filepath
        };
        con.query("Update m_assets SET ? WHERE assets_id ="+assets_id,assets_info,function(error,rows,fields){
            if(error)
                {
                    var errors_detail  = ("Error Insert : %s ",error );   
                    req.flash('msg_error', errors_detail); 
                    
                }else{
                    
                    var d = new Date();
                    var ddate = d.getDate();
                    var dmonth = d.getMonth()+1;
                    var dyear = d.getFullYear();
                    var dhour = d.getHours();
                    var dminutes = d.getMinutes();
                    var dseconds = d.getSeconds();

                    if(ddate < 10){
                        ddate = "0"+ddate;
                    }
                    if(dmonth < 10){
                        dmonth = "0"+dmonth;
                    }

                    if(dhour < 10){
                        dhour = "0"+dhour;
                    }
                    if(dminutes < 10){
                        dminutes = "0"+dminutes;
                    }
                    if(dseconds < 10){
                        dseconds = "0"+dseconds;
                    }


                    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                   con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Update Asset Image with ID "+assets_id+"','"+newdate+"')",function(error,rows,fields){
                       if(!!error){
                           console.log('Error in the query '+error);
                       }
                       else{

                          //console.log(daytime);
                       }
                   });
           
           
                    req.flash('msg_info', 'Update assets success'); 
                    res.redirect('/admin_assets');
                }     
      }); 
    });      
});

app.delete('/admin_assets/delete/:assets_id',isAuthenticated,function(req,res){
    var assets_id = req.params.assets_id;
   con.query("DELETE FROM m_assets WHERE assets_id = ?",[assets_id],function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           
           var d = new Date();
            var ddate = d.getDate();
            var dmonth = d.getMonth()+1;
            var dyear = d.getFullYear();
            var dhour = d.getHours();
            var dminutes = d.getMinutes();
            var dseconds = d.getSeconds();

            if(ddate < 10){
                ddate = "0"+ddate;
            }
            if(dmonth < 10){
                dmonth = "0"+dmonth;
            }

            if(dhour < 10){
                dhour = "0"+dhour;
            }
            if(dminutes < 10){
                dminutes = "0"+dminutes;
            }
            if(dseconds < 10){
                dseconds = "0"+dseconds;
            }

                
            var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;
            
           con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Delete Asset with ID "+assets_id+"','"+newdate+"')",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   
                  //console.log(daytime);
               }
           });
           
           
           req.flash('msg_info', 'Delete assets success'); 
           res.redirect('/admin_assets');
       }
   }); 
});


//Assets Monitoring
app.get('/admin_monitoring',isAuthenticated,function(req,res){
   con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id left join m_zone on m_assets.assets_last_location = m_zone.zone_id",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_monitoring',{title:"Admin Monitoring",data:rows});
       }
   }); 
});

app.get('/admin_unauthorized',isAuthenticated,function(req,res){
//   con.query("SELECT * FROM history left join assets on history.history_tag_id = assets.assets_rfid left join zone on history.history_last_location = zone.zone_id where history.history_assigned_loc != history.history_last_location order by history.history_date_time_move desc limit 100",function(error,rows,fields){
//       if(!!error){
//           console.log('Error in the query '+error);
//       }
//       else{
//           //console.log('Successful query\n');
//           //console.log(rows);
//           res.render('admin_unauthorized',{title:"Admin Unauthorized",data:rows});
//       }
//   }); 

    //"SELECT * FROM unauthorized left join assets on unauthorized.un_tag_id = assets.assets_rfid left join zone on unauthorized.un_last_location = zone.zone_id where unauthorized.un_assigned_loc != unauthorized.un_last_location order by unauthorized.un_date_time_move desc limit 100";
    con.query("SELECT * FROM m_unauthorized left join m_assets on m_unauthorized.un_tag_id = m_assets.assets_rfid left join m_zone on m_unauthorized.un_last_location = m_zone.zone_id order by m_unauthorized.un_date_time_move desc limit 100",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           for(var i=0; i<rows.length;i++){
                //dateFormatChange("");
                rows[i].new_date = dateFormatChangeNew(rows[i].un_date_time_move);

            }
           res.render('admin_unauthorized',{title:"Admin Unauthorized",data:rows});
       }
   }); 
});


//Search functions
app.post('/admin_users/search',isAuthenticated,function(req,res){
        v_name = req.sanitize( 'name' ).escape(); 
        v_staff_id = req.sanitize( 'staff_id' ).escape();
        v_status = req.sanitize( 'status' ).escape();
    
    //console.log("name="+v_name);
    //console.log("staff_id="+v_staff_id);
    //console.log("status="+v_status);
    var sql_query;
     if(v_name!==null || v_name==' '){
         sql_query = "SELECT * FROM m_users WHERE name like '%"+v_name+"%'";
     }
     else if(v_staff_id!==null || v_staff_id==' '){
         sql_query = "SELECT * FROM m_users WHERE staff_id = '"+v_staff_id+"'";
     }
     else if(v_status!==null || v_status==' '){
         sql_query = "SELECT * FROM m_users WHERE staff_id = '"+v_status+"'";
     }
     //console.log("sql_query="+sql_query);
   con.query(sql_query,function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_users',{title:"Admin Users",data:rows});
       }
   }); 
});

app.get('/search',isAuthenticated,function(req,res){
   con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id left join m_zone on m_assets.assets_last_location = m_zone.zone_id",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('search',{title:"Search",data:rows});
       }
   }); 
});

//not using
app.get('/search/:id',isAuthenticated,function(req,res){
    
    var zone=[];
    con.query("SELECT * FROM m_zone",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           zone=rows;
       }
   }); 
   
   var id = req.params.id;
   var url_string = encodeURI(id);
   
    var d = new Date();
    var ddate = d.getDate();
    var dmonth = d.getMonth()+1;
    var dyear = d.getFullYear();
    var dhour = d.getHours();
    var dminutes = d.getMinutes();
    var dseconds = d.getSeconds();

    if(ddate < 10){
        ddate = "0"+ddate;
    }
    if(dmonth < 10){
        dmonth = "0"+dmonth;
    }

    if(dhour < 10){
        dhour = "0"+dhour;
    }
    if(dminutes < 10){
        dminutes = "0"+dminutes;
    }
    if(dseconds < 10){
        dseconds = "0"+dseconds;
    }


    var newdate = ddate+"-"+dmonth+"-"+dyear+" "+dhour+":"+dminutes+":"+dseconds;
    var url_date = encodeURI(newdate);
    
    var newMonth = dyear+"-"+dmonth;
//   console.log('https://2ebe9a26-77dc-4a2a-8d04-f0e71aa7be33-bluemix.cloudant.com/iotp_um8ctw_dlm_'+newMonth+'/_design/sort_addr_date/_view/sort_addr_date?limit=100&reduce=false&inclusive_end=true&start_key=%5B+'+url_string+'%2C+++%22'+url_date+'%22%5D&descending=true'); 
   request('https://2ebe9a26-77dc-4a2a-8d04-f0e71aa7be33-bluemix.cloudant.com/iotp_um8ctw_dlm_'+newMonth+'/_design/sort_addr_date/_view/sort_addr_date?limit=100&reduce=false&inclusive_end=true&start_key=%5B+'+url_string+'%2C+++%22'+url_date+'%22%5D&descending=true', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var json_string = JSON.parse(body);
//        var user_data = json_string;
//        var time = json_string.rows[0].value.payload.gateway.date.date;
//        var array_size = json_string.rows[0].value.payload.tag.length;
//        var spayload = JSON.parse(payload.tag[0]);
//        console.log("linen="+JSON.stringify(json_string)); 
//        console.log("payload="+JSON.stringify(json_string.rows[0].value.data.d.date));
//        console.log("payload="+JSON.stringify(json_string.rows[0].value.data.d.addr));
        
        var arraySend = [];
        for(var i=0; i<json_string.rows.length;i++){
            for(var j=0; j<zone.length;j++){
               if(json_string.rows[i].value.data.d.reader_id === zone[j].zone_reader_id){
                    json_string.rows[i].value.data.d.location = zone[j].zone_name;
                } 
            }
            
//            if(json_string.rows[i].value.data.d.reader_id === zone[i].zone_reader_id){
//            json_string.rows[i].value.data.d.location = zone[i].zone_name;
//             }
            arraySend.push(json_string.rows[i].value.data.d);
        }
//        console.log("array="+JSON.stringify(arraySend));
//        console.log("payload="+JSON.stringify(spayload));
//        res.render('linen',{title:"Linen",data:user_data});
        res.render('search_details',{title:"Search",data:arraySend});
     }
     else{
         console.log("error="+error);
     }
    });
});

//linen
app.get('/linen',isAuthenticated,function(req,res){
//   request('https://2ebe9a26-77dc-4a2a-8d04-f0e71aa7be33-bluemix.cloudant.com/linen/_design/sort/_view/sort?reduce=false&descending=true', function (error, response, body) {
//    if (!error && response.statusCode == 200) {
//        var json_string = JSON.parse(body);
////        var user_data = json_string;
////        var time = json_string.rows[0].value.payload.gateway.date.date;
////        var array_size = json_string.rows[0].value.payload.tag.length;
////        var spayload = JSON.parse(payload.tag[0]);
//        console.log("linen="+JSON.stringify(json_string)); // Print the google web page.
//        console.log("payload="+JSON.stringify(json_string.rows[0].value.payload.tag));
//        var arraySend = [];
//        for(var i=0; i<json_string.rows.length;i++){
//            arraySend.push(json_string.rows[i].value.payload);
//        }
//        console.log("array="+arraySend);
////        console.log("payload="+JSON.stringify(spayload));
////        res.render('linen',{title:"Linen",data:user_data});
//        res.render('linen',{title:"Linen",data:arraySend});
//     }
//     else{
//         console.log("error="+error);
//     }
//    });

            con.query("SELECT sum(soil) as soil,sum(clean) as clean,time FROM m_linen_record group by time order by year(time),month(time),day(time)",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                    for(var i=0; i<rows.length;i++){
                        //dateFormatChange("");
                        rows[i].new_date = dateFormatChange(rows[i].time);

                    }
                    res.render('linen',{title:"Linen",data:rows});
                }
            });



});

app.get('/linen_clean',isAuthenticated,function(req,res){
    
            var d = new Date();
            //d.setMinutes(d.getMinutes()+480);

            var dmonth = d.getMonth()+1;
            var dyear = d.getFullYear();
            var month_name = "";
            //console.log("dmonth--"+dmonth);

            if(dmonth === 1){
                month_name = "January";
            }
            else if(dmonth === 2){
                month_name = "February";
            }
            else if(dmonth === 3){
                month_name = "March";
            }
            else if(dmonth === 4){
                month_name = "April";
            }
            else if(dmonth === 5){
                month_name = "May";
            }
            else if(dmonth === 6){
                month_name = "June";
            }
            else if(dmonth === 7){
                month_name = "July";
            }
            else if(dmonth === 8){
                month_name = "August";
            }
            else if(dmonth === 9){
                month_name = "September";
            }
            else if(dmonth === 10){
                month_name = "October";
            }
            else if(dmonth === 11){
                month_name = "November";
            }
            else if(dmonth === 12){
                month_name = "December";
            }

            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         var dt_day = daytime[i].day.toString();
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         var day_s = rows[k].day_s.toString();

                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('linen_clean',{title:"Linen",data:record_table,dmonth:dmonth,dyear:dyear,month_name:month_name});
                        }
                    });
//            con.query("SELECT sum(soil) as soil,sum(clean) as clean,time FROM linen_record group by time order by time desc",function(error,rows,fields){
//                if(!!error){
//                    console.log('Error in the query '+error);
//                }
//                else{
//                    //console.log('Successful query fff\n');
//                    //console.log(rows);
//                    for(var i=0; i<rows.length;i++){
//                        //dateFormatChange("");
//                        rows[i].new_date = dateFormatChange(rows[i].time);
//
//                    }
//                    res.render('linen_clean',{title:"Linen",data:rows});
//                }
//            });



});

app.post('/linen_clean',isAuthenticated,function(req,res){
    
            var v_month = req.sanitize( 'month_select' ); 
            var v_year = req.sanitize( 'year_select' );
            var month_name = "";
            //console.log("type of--"+typeof v_month);
            
            var newmonth = String(v_month);
            if(newmonth === "1"){
                month_name = "January";
            }
            else if(newmonth === "2"){
                month_name = "February";
            }
            else if(newmonth === "3"){
                month_name = "March";
            }
            else if(newmonth === "4"){
                month_name = "April";
            }
            else if(newmonth === "5"){
                month_name = "May";
            }
            else if(newmonth === "6"){
                month_name = "June";
            }
            else if(newmonth === "7"){
                month_name = "July";
            }
            else if(newmonth === "8"){
                month_name = "August";
            }
            else if(newmonth === "9"){
                month_name = "September";
            }
            else if(newmonth === "10"){
                month_name = "October";
            }
            else if(newmonth === "11"){
                month_name = "November";
            }
            else if(newmonth === "12"){
                month_name = "December";
            }

            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+v_month+"' and year(time) = '"+v_year+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where month(time) = '"+v_month+"' and year(time) = '"+v_year+"' group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         var dt_day = daytime[i].day.toString();
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         var day_s = rows[k].day_s.toString();

                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('linen_clean',{title:"Linen",data:record_table,dmonth:v_month,dyear:v_year,month_name:month_name});
                        }
                    });
//            con.query("SELECT sum(soil) as soil,sum(clean) as clean,time FROM linen_record group by time order by time desc",function(error,rows,fields){
//                if(!!error){
//                    console.log('Error in the query '+error);
//                }
//                else{
//                    //console.log('Successful query fff\n');
//                    //console.log(rows);
//                    for(var i=0; i<rows.length;i++){
//                        //dateFormatChange("");
//                        rows[i].new_date = dateFormatChange(rows[i].time);
//
//                    }
//                    res.render('linen_clean',{title:"Linen",data:rows});
//                }
//            });



});

app.get('/linen_soil',isAuthenticated,function(req,res){
    
        var d = new Date();
        //d.setMinutes(d.getMinutes()+480);
        
        var dmonth = d.getMonth()+1;
        var dyear = d.getFullYear();
        var month_name = "";
        //console.log("dmonth--"+dmonth);
        
        if(dmonth === 1){
            month_name = "January";
        }
        else if(dmonth === 2){
            month_name = "February";
        }
        else if(dmonth === 3){
            month_name = "March";
        }
        else if(dmonth === 4){
            month_name = "April";
        }
        else if(dmonth === 5){
            month_name = "May";
        }
        else if(dmonth === 6){
            month_name = "June";
        }
        else if(dmonth === 7){
            month_name = "July";
        }
        else if(dmonth === 8){
            month_name = "August";
        }
        else if(dmonth === 9){
            month_name = "September";
        }
        else if(dmonth === 10){
            month_name = "October";
        }
        else if(dmonth === 11){
            month_name = "November";
        }
        else if(dmonth === 12){
            month_name = "December";
        }
        


            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    //console.log("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM linen_record where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' left join linen on linen_record.id_linen = linen.linen_uuid group by year(linen_record.time),month(linen_record.time),day(linen_record.time),linen.linen_category");
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                        
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         var dt_day = daytime[i].day.toString();
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         var day_s = rows[k].day_s.toString();
                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('linen_soil',{title:"Linen",data:record_table,dmonth:dmonth,dyear:dyear,month_name:month_name});
                        }
                    });

});

app.post('/linen_soil',isAuthenticated,function(req,res){
    
            var v_month = req.sanitize( 'month_select' ); 
            var v_year = req.sanitize( 'year_select' );
            var month_name = "";
            //console.log("type of--"+typeof v_month);
            
            var newmonth = String(v_month);
            if(newmonth === "1"){
                month_name = "January";
            }
            else if(newmonth === "2"){
                month_name = "February";
            }
            else if(newmonth === "3"){
                month_name = "March";
            }
            else if(newmonth === "4"){
                month_name = "April";
            }
            else if(newmonth === "5"){
                month_name = "May";
            }
            else if(newmonth === "6"){
                month_name = "June";
            }
            else if(newmonth === "7"){
                month_name = "July";
            }
            else if(newmonth === "8"){
                month_name = "August";
            }
            else if(newmonth === "9"){
                month_name = "September";
            }
            else if(newmonth === "10"){
                month_name = "October";
            }
            else if(newmonth === "11"){
                month_name = "November";
            }
            else if(newmonth === "12"){
                month_name = "December";
            }

            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+v_month+"' and year(time) = '"+v_year+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where month(time) = '"+v_month+"' and year(time) = '"+v_year+"' group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                        
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         var dt_day = daytime[i].day.toString();
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         var day_s = rows[k].day_s.toString();
                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil,clean:rows[k].clean});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                           //console.log("month_name---"+month_name);
                            res.render('linen_soil',{title:"Linen",data:record_table,dmonth:v_month,dyear:v_year,month_name:month_name});
                        }
                    });

});

app.get('/linen_iron',isAuthenticated,function(req,res){
    
            var d = new Date();
            //d.setMinutes(d.getMinutes()+480);

            var dmonth = d.getMonth()+1;
            var dyear = d.getFullYear();
            var month_name = "";
            //console.log("dmonth--"+dmonth);

            if(dmonth === 1){
                month_name = "January";
            }
            else if(dmonth === 2){
                month_name = "February";
            }
            else if(dmonth === 3){
                month_name = "March";
            }
            else if(dmonth === 4){
                month_name = "April";
            }
            else if(dmonth === 5){
                month_name = "May";
            }
            else if(dmonth === 6){
                month_name = "June";
            }
            else if(dmonth === 7){
                month_name = "July";
            }
            else if(dmonth === 8){
                month_name = "August";
            }
            else if(dmonth === 9){
                month_name = "September";
            }
            else if(dmonth === 10){
                month_name = "October";
            }
            else if(dmonth === 11){
                month_name = "November";
            }
            else if(dmonth === 12){
                month_name = "December";
            }

            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,sum(housekeeping) as iron,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         var dt_day = daytime[i].day.toString();
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         var day_s = rows[k].day_s.toString();

                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil,clean:rows[k].clean,iron:rows[k].iron});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('linen_iron',{title:"Linen",data:record_table,dmonth:dmonth,dyear:dyear,month_name:month_name});
                        }
                    });
//            con.query("SELECT sum(soil) as soil,sum(clean) as clean,time FROM linen_record group by time order by time desc",function(error,rows,fields){
//                if(!!error){
//                    console.log('Error in the query '+error);
//                }
//                else{
//                    //console.log('Successful query fff\n');
//                    //console.log(rows);
//                    for(var i=0; i<rows.length;i++){
//                        //dateFormatChange("");
//                        rows[i].new_date = dateFormatChange(rows[i].time);
//
//                    }
//                    res.render('linen_clean',{title:"Linen",data:rows});
//                }
//            });



});

app.post('/linen_iron',isAuthenticated,function(req,res){
    
            var v_month = req.sanitize( 'month_select' ); 
            var v_year = req.sanitize( 'year_select' );
            var month_name = "";
            //console.log("type of--"+typeof v_month);
            
            var newmonth = String(v_month);
            if(newmonth === "1"){
                month_name = "January";
            }
            else if(newmonth === "2"){
                month_name = "February";
            }
            else if(newmonth === "3"){
                month_name = "March";
            }
            else if(newmonth === "4"){
                month_name = "April";
            }
            else if(newmonth === "5"){
                month_name = "May";
            }
            else if(newmonth === "6"){
                month_name = "June";
            }
            else if(newmonth === "7"){
                month_name = "July";
            }
            else if(newmonth === "8"){
                month_name = "August";
            }
            else if(newmonth === "9"){
                month_name = "September";
            }
            else if(newmonth === "10"){
                month_name = "October";
            }
            else if(newmonth === "11"){
                month_name = "November";
            }
            else if(newmonth === "12"){
                month_name = "December";
            }

            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+v_month+"' and year(time) = '"+v_year+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,sum(housekeeping) as iron,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where month(time) = '"+v_month+"' and year(time) = '"+v_year+"' group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         var dt_day = daytime[i].day.toString();
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         var day_s = rows[k].day_s.toString();

                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil,clean:rows[k].clean,iron:rows[k].iron});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('linen_iron',{title:"Linen",data:record_table,dmonth:v_month,dyear:v_year,month_name:month_name});
                        }
                    });
//            con.query("SELECT sum(soil) as soil,sum(clean) as clean,time FROM linen_record group by time order by time desc",function(error,rows,fields){
//                if(!!error){
//                    console.log('Error in the query '+error);
//                }
//                else{
//                    //console.log('Successful query fff\n');
//                    //console.log(rows);
//                    for(var i=0; i<rows.length;i++){
//                        //dateFormatChange("");
//                        rows[i].new_date = dateFormatChange(rows[i].time);
//
//                    }
//                    res.render('linen_clean',{title:"Linen",data:rows});
//                }
//            });



});

app.get('/linen/:id',isAuthenticated,function(req,res){
    var id = req.params.id;
    var url_string = encodeURI(id);
    

        //console.log("SELECT * FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where linen_record.time='"+id+"'");
        con.query("SELECT * FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where m_linen_record.time='"+id+"'",function(error,rows,fields){
            if(!!error){
                console.log('Error in the query '+error);
            }
            else{
                //console.log('Successful query fff\n');
                //console.log(rows);
                var new_date = dateFormatChange(id);
                res.render('linen_details',{title:"Linen",data:rows,new_date:new_date});
            }
        });

});

app.get('/linen_report_view/:id',isAuthenticated,function(req,res){
    var id = req.params.id;
    var url_string = encodeURI(id);
    

        //console.log("SELECT * FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where linen_record.time='"+id+"'");
        con.query("SELECT * FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where m_linen_record.time='"+id+"'",function(error,rows,fields){
            if(!!error){
                console.log('Error in the query '+error);
            }
            else{
                //console.log('Successful query fff\n');
                //console.log(rows);
                var new_date = dateFormatChange(id);
                res.render('linen_details_report',{title:"Report",data:rows,new_date:new_date,id:id});
            }
        });

});

app.get('/linen_report_view_print/:id',isAuthenticated,function(req,res){
    var id = req.params.id;
    var url_string = encodeURI(id);
    

        //console.log("SELECT * FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where linen_record.time='"+id+"'");
        con.query("SELECT * FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where m_linen_record.time='"+id+"'",function(error,rows,fields){
            if(!!error){
                console.log('Error in the query '+error);
            }
            else{
                //console.log('Successful query fff\n');
                //console.log(rows);
                var new_date = dateFormatChange(id);
                res.render('linen_details_report_print',{title:"Report",data:rows,new_date:new_date,id:id});
            }
        });

});

app.get('/linen_pending',isAuthenticated,function(req,res){
    
        var d = new Date();
        //d.setMinutes(d.getMinutes()+480);
        
        var dmonth = d.getMonth()+1;
        var dyear = d.getFullYear();
        var month_name = "";
        //console.log("dmonth--"+dmonth);
        
        if(dmonth === 1){
            month_name = "January";
        }
        else if(dmonth === 2){
            month_name = "February";
        }
        else if(dmonth === 3){
            month_name = "March";
        }
        else if(dmonth === 4){
            month_name = "April";
        }
        else if(dmonth === 5){
            month_name = "May";
        }
        else if(dmonth === 6){
            month_name = "June";
        }
        else if(dmonth === 7){
            month_name = "July";
        }
        else if(dmonth === 8){
            month_name = "August";
        }
        else if(dmonth === 9){
            month_name = "September";
        }
        else if(dmonth === 10){
            month_name = "October";
        }
        else if(dmonth === 11){
            month_name = "November";
        }
        else if(dmonth === 12){
            month_name = "December";
        }
    
        var total_pending = 0;
        //console.log("SELECT * FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where linen_record.time='"+id+"'");
        con.query("SELECT sum(soil) as soil, sum(clean) as clean,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where year(time) = '"+dyear+"' and month(time) = '"+dmonth+"' group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time) order by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time)",function(error,rows,fields){
            if(!!error){
                console.log('Error in the query '+error);
            }
            else{
                //console.log('Successful query fff\n');
                //console.log(rows);
                
                for(var i=0;i<rows.length;i++){
                    var newmonth,newday;
                    if(rows[i].month_s < 10){
                        newmonth = "0"+rows[i].month_s;
                    }
                    else{
                        newmonth = rows[i].month_s;
                    }

                    if(rows[i].day_s < 10){
                        newday = "0"+rows[i].day_s;
                    }
                    else{
                        newday = rows[i].day_s;
                    }
                    rows[i].new_date = newday+"-"+newmonth+"-"+rows[i].year_s;
                    rows[i].pending = rows[i].clean - rows[i].soil;
                    total_pending += rows[i].pending;
                }
                //console.log(rows);
                console.log("total pending == "+total_pending);
                res.render('linen_pending',{title:"Linen",data:rows,dmonth:dmonth,dyear:dyear,month_name:month_name,total_pending:total_pending});
            }
        });

});

app.post('/linen_pending',isAuthenticated,function(req,res){
    
            var v_month = req.sanitize( 'month_select' ); 
            var v_year = req.sanitize( 'year_select' );
            var month_name = "";
            //console.log("type of--"+typeof v_month);
            
            var newmonth = String(v_month);
            if(newmonth === "1"){
                month_name = "January";
            }
            else if(newmonth === "2"){
                month_name = "February";
            }
            else if(newmonth === "3"){
                month_name = "March";
            }
            else if(newmonth === "4"){
                month_name = "April";
            }
            else if(newmonth === "5"){
                month_name = "May";
            }
            else if(newmonth === "6"){
                month_name = "June";
            }
            else if(newmonth === "7"){
                month_name = "July";
            }
            else if(newmonth === "8"){
                month_name = "August";
            }
            else if(newmonth === "9"){
                month_name = "September";
            }
            else if(newmonth === "10"){
                month_name = "October";
            }
            else if(newmonth === "11"){
                month_name = "November";
            }
            else if(newmonth === "12"){
                month_name = "December";
            }
    
        var total_pending = 0;
        //console.log("SELECT * FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where linen_record.time='"+id+"'");
        con.query("SELECT sum(soil) as soil, sum(clean) as clean,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where year(time) = '"+v_year+"' and month(time) = '"+v_month+"' group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time) order by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time)",function(error,rows,fields){
            if(!!error){
                console.log('Error in the query '+error);
            }
            else{
                //console.log('Successful query fff\n');
                //console.log(rows);
                
                for(var i=0;i<rows.length;i++){
                    var newmonth,newday;
                    if(rows[i].month_s < 10){
                        newmonth = "0"+rows[i].month_s;
                    }
                    else{
                        newmonth = rows[i].month_s;
                    }

                    if(rows[i].day_s < 10){
                        newday = "0"+rows[i].day_s;
                    }
                    else{
                        newday = rows[i].day_s;
                    }
                    rows[i].new_date = newday+"-"+newmonth+"-"+rows[i].year_s;
                    rows[i].pending = rows[i].clean - rows[i].soil;
                    total_pending += rows[i].pending;
                }
                //console.log(rows);
                console.log("total pending == "+total_pending);
                res.render('linen_pending',{title:"Linen",data:rows,dmonth:v_month,dyear:v_year,month_name:month_name,total_pending:total_pending});
            }
        });

});

app.get('/report_linen_details/:id',isAuthenticated,function(req,res){
    var id = req.params.id;
    var url_string = encodeURI(id);
    
//   request('https://2ebe9a26-77dc-4a2a-8d04-f0e71aa7be33-bluemix.cloudant.com/linen/_design/sort/_view/sort?limit=20&reduce=false&keys=%5B%22'+url_string+'%22%5D', function (error, response, body) {
//    if (!error && response.statusCode == 200) {
//        var json_string = JSON.parse(body);
////        var user_data = json_string;
////        var time = json_string.rows[0].value.payload.gateway.date.date;
////        var array_size = json_string.rows[0].value.payload.tag.length;
////        var spayload = JSON.parse(payload.tag[0]);
//        //console.log("linen="+JSON.stringify(json_string)); // Print the google web page.
//        //console.log("payload="+JSON.stringify(json_string.rows[0].value.payload.tag));
//        var arraySend = [];
//        for(var i=0; i<json_string.rows.length;i++){
//            arraySend.push(json_string.rows[i].value.payload);
//        }
//        //console.log("array="+arraySend);
////        console.log("payload="+JSON.stringify(spayload));
////        res.render('linen',{title:"Linen",data:user_data});
//        res.render('report_linen_details',{title:"Report",data:arraySend});
//     }
//     else{
//         console.log("error="+error);
//     }
//    });

         con.query("SELECT * FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where m_linen_record.time='"+id+"'",function(error,rows,fields){
            if(!!error){
                console.log('Error in the query '+error);
            }
            else{
                //console.log('Successful query fff\n');
                //console.log(rows);
                res.render('report_linen_details',{title:"Report",data:rows});
            }
        });
});

app.get('/admin_linen',isAuthenticated,function(req,res){
   con.query("SELECT * FROM m_linen",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_linen',{title:"Admin Linen",data:rows});
       }
   }); 
});

app.post('/linen/add',isAuthenticated,function(req,res){
    
        v_tag_id = req.sanitize( 'tag_id' ).escape().trim(); 
        v_category = req.sanitize( 'category' ).escape().trim();
        v_purchase_date = req.sanitize( 'purchase_date' ).escape().trim();
        v_color = req.sanitize( 'color' ).escape().trim();
        v_size = req.sanitize( 'size' ).escape().trim();
        
        
        var linen_info = {
            linen_uuid: v_tag_id,
            linen_category: v_category,
            linen_purchase_date: v_purchase_date,
            linen_color : v_color,
            linen_size : v_size
        };
        
        con.query("INSERT INTO m_linen SET ?",linen_info,function(error,rows,fields){
            if(error)
                {
                    var errors_detail  = ("Error Insert : %s ",error );   
                    req.flash('msg_error', errors_detail); 
                    res.render('admin_linen_add', 
                    { 
                        tag_id: req.param('tag_id'), 
                        category: req.param('category'),
                        escape: req.param('escape'),
                        color: req.param('color'),
                        size: req.param('size')
                    });
                }else{
                    
                    var d = new Date();
                    var ddate = d.getDate();
                    var dmonth = d.getMonth()+1;
                    var dyear = d.getFullYear();
                    var dhour = d.getHours();
                    var dminutes = d.getMinutes();
                    var dseconds = d.getSeconds();

                    if(ddate < 10){
                        ddate = "0"+ddate;
                    }
                    if(dmonth < 10){
                        dmonth = "0"+dmonth;
                    }

                    if(dhour < 10){
                        dhour = "0"+dhour;
                    }
                    if(dminutes < 10){
                        dminutes = "0"+dminutes;
                    }
                    if(dseconds < 10){
                        dseconds = "0"+dseconds;
                    }


                    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                   con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Add New Linen','"+newdate+"')",function(error,rows,fields){
                       if(!!error){
                           console.log('Error in the query '+error);
                       }
                       else{

                          //console.log(daytime);
                       }
                   });
                   
                    req.flash('msg_info', 'Add linen success'); 
                    res.redirect('/admin_linen');
                }     
   }); 
});

app.get('/admin_linen/update/:linen_id',isAuthenticated,function(req,res){
    var linen_id = req.params.linen_id;
   con.query("SELECT * FROM m_linen WHERE linen_id = ?",[linen_id],function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('admin_linen_update',{title:"Admin Linen",data:rows});
       }
   }); 
});

app.post('/admin_linen/update/:linen_id',isAuthenticated,function(req,res){
        var linen_id = req.params.linen_id;
        
        v_tag_id = req.sanitize( 'tag_id' ).escape().trim(); 
        v_category = req.sanitize( 'category' ).escape().trim();
        v_purchase_date = req.sanitize( 'purchase_date' ).escape().trim();
        v_color = req.sanitize( 'color' ).escape().trim();
        v_size = req.sanitize( 'size' ).escape().trim();
        
 
        var linen_info = {
            linen_uuid: v_tag_id,
            linen_category: v_category,
            linen_purchase_date: v_purchase_date,
            linen_color : v_color,
            linen_size : v_size
        };
        
   con.query("Update m_linen SET ? WHERE linen_id ="+linen_id,linen_info,function(error,rows,fields){
            if(error)
                {
                    var errors_detail  = ("Error Insert : %s ",error );   
                    req.flash('msg_error', errors_detail); 
                    res.render('admin_linen/admin_linen_update', 
                    { 
                        tag_id: req.param('tag_id'), 
                        category: req.param('category'),
                        purchase_date: req.param('purchase_date'),
                        color: req.param('color'),
                        size: req.param('size')
                    });
                }else{
                    
                    var d = new Date();
                    var ddate = d.getDate();
                    var dmonth = d.getMonth()+1;
                    var dyear = d.getFullYear();
                    var dhour = d.getHours();
                    var dminutes = d.getMinutes();
                    var dseconds = d.getSeconds();

                    if(ddate < 10){
                        ddate = "0"+ddate;
                    }
                    if(dmonth < 10){
                        dmonth = "0"+dmonth;
                    }

                    if(dhour < 10){
                        dhour = "0"+dhour;
                    }
                    if(dminutes < 10){
                        dminutes = "0"+dminutes;
                    }
                    if(dseconds < 10){
                        dseconds = "0"+dseconds;
                    }


                    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                   con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Update Linen with ID "+linen_id+"','"+newdate+"')",function(error,rows,fields){
                       if(!!error){
                           console.log('Error in the query '+error);
                       }
                       else{

                          //console.log(daytime);
                       }
                   });
                   
                   
                    req.flash('msg_info', 'Update linen success'); 
                    res.redirect('/admin_linen');
                }     
   }); 
});

app.delete('/admin_linen/delete/:linen',isAuthenticated,function(req,res){
    var linen = req.params.linen;
   con.query("DELETE FROM m_linen WHERE linen_id = ?",[linen],function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           
           var d = new Date();
                    var ddate = d.getDate();
                    var dmonth = d.getMonth()+1;
                    var dyear = d.getFullYear();
                    var dhour = d.getHours();
                    var dminutes = d.getMinutes();
                    var dseconds = d.getSeconds();

                    if(ddate < 10){
                        ddate = "0"+ddate;
                    }
                    if(dmonth < 10){
                        dmonth = "0"+dmonth;
                    }

                    if(dhour < 10){
                        dhour = "0"+dhour;
                    }
                    if(dminutes < 10){
                        dminutes = "0"+dminutes;
                    }
                    if(dseconds < 10){
                        dseconds = "0"+dseconds;
                    }


                    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;

                   con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+req.session.passport.user.users_id+"','Delete Linen with ID "+linen+"','"+newdate+"')",function(error,rows,fields){
                       if(!!error){
                           console.log('Error in the query '+error);
                       }
                       else{

                          //console.log(daytime);
                       }
                   });
                   
                   
           req.flash('msg_info', 'Delete linen success'); 
           res.redirect('/admin_linen');
       }
   }); 
});

app.get('/test_linen',isAuthenticated,function(req,res){

    var daytime = [];
    var type_list = [];
    var record_list;
    var record_table = [];

    con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record group by year(time),month(time),day(time)",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           for(var i=0;i<rows.length;i++){
          daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
           }
          //console.log(daytime);
       }
   });
            con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                   for(var i=0;i<daytime.length;i++){
                       if(rows.length!==0){
                            for(var k=0;k<rows.length;k++){
                                 //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                 var dt_year = daytime[i].year.toString();
                                 var dt_month = daytime[i].month.toString();
                                 var dt_day = daytime[i].day.toString();
                                 var year_s = rows[k].year_s.toString();
                                 var month_s = rows[k].month_s.toString();
                                 var day_s = rows[k].day_s.toString();
                                 
                                 if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                     type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                     //console.log("attendace ="+JSON.stringify(type_list[k]));
                                 }
                                 
                                 var newmonth,newday;
                                 if(daytime[i].month < 10){
                                     newmonth = "0"+daytime[i].month;
                                 }
                                 else{
                                     newmonth = daytime[i].month;
                                 }
                                 
                                 if(daytime[i].day < 10){
                                     newday = "0"+daytime[i].day;
                                 }
                                 else{
                                     newday = daytime[i].day;
                                 }
                                 record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                 //employee_list.push(attendance_list);
                               }
                       }
                       type_list = [];
                       record_table.push(record_list);
                       //console.log("record_table - "+JSON.stringify(record_table));
                   }
                    res.render('test_linen',{title:"Linen",data:record_table});
                }
            });



});


app.post('/pillowcase/edit',isAuthenticated,function(req,res){
    
        v_pillowcase = req.sanitize( 'pillowcase_q' ); 
        
        con.query("Update m_linen_count set pillow_case = '"+v_pillowcase+"' where count_id = '1'",function(error,rows,fields){
       
        res.redirect('/dashboard_linen');
                    
   }); 
});

app.post('/gown/edit',isAuthenticated,function(req,res){
    
        v_gown = req.sanitize( 'gown_q' ); 
        
        con.query("Update m_linen_count set gown = '"+v_gown+"' where count_id = '1'",function(error,rows,fields){
       
        res.redirect('/dashboard_linen');
                    
   }); 
});

app.post('/blanket/edit',isAuthenticated,function(req,res){
    
        v_blanket = req.sanitize( 'blanket_q' ); 
        
        con.query("Update m_linen_count set blanket = '"+v_blanket+"' where count_id = '1'",function(error,rows,fields){
       
        res.redirect('/dashboard_linen');
                    
   }); 
});

app.post('/bed/edit',isAuthenticated,function(req,res){
    
        v_bed = req.sanitize( 'bed_q' ); 
        
        con.query("Update m_linen_count set bedsheet = '"+v_bed+"' where count_id = '1'",function(error,rows,fields){
       
        res.redirect('/dashboard_linen');
                    
   }); 
});

//report
app.post('/report',isAuthenticated,function(req,res){
    
        v_item_type = req.sanitize( 'item_type' ).escape();
        v_linen_type = req.sanitize( 'linen_type' ).escape();
        
//        alert("item type= "+v_item_type);
//        alert("linen type="+v_linen_type);
        //console.log('rfid ='+v_item_type);
        //console.log('dept desc ='+v_linen_type);
        
        if(v_item_type === "BEMS" && v_linen_type==="0"){
            
            con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id left join m_zone on m_assets.assets_last_location = m_zone.zone_id where assets_inventory_type='BEMS'",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                    res.render('report_item',{title:"Report",data:rows,type:"BEMS"});
                }
            });
            
        }
        else if(v_item_type === "FEMS" && v_linen_type==="0"){
            
            con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id left join m_zone on m_assets.assets_last_location = m_zone.zone_id where assets_inventory_type='FEMS'",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                    res.render('report_item',{title:"Report",data:rows,type:"FEMS"});
                }
            });
            
        }
        
        else if(v_item_type === "0" && v_linen_type === "soiled"){
//            request('https://2ebe9a26-77dc-4a2a-8d04-f0e71aa7be33-bluemix.cloudant.com/linen/_design/sort_type/_view/sort_type?reduce=false&keys=%5B%22Soil+linen%22%5D', function (error, response, body) {
//            if (!error && response.statusCode == 200) {
//                var json_string = JSON.parse(body);
//        //        var user_data = json_string;
//        //        var time = json_string.rows[0].value.payload.gateway.date.date;
//        //        var array_size = json_string.rows[0].value.payload.tag.length;
//        //        var spayload = JSON.parse(payload.tag[0]);
//                //console.log("linen="+JSON.stringify(json_string)); // Print the google web page.
//                //console.log("payload="+JSON.stringify(json_string.rows[0].value.payload.tag));
//                var arraySend = [];
//                for(var i=0; i<json_string.rows.length;i++){
//                    arraySend.push(json_string.rows[i].value.payload);
//                }
//                //console.log("array="+arraySend);
//        //        console.log("payload="+JSON.stringify(spayload));
//        //        res.render('linen',{title:"Linen",data:user_data});
//                res.render('report_linen',{title:"Report",data:arraySend});
//             }
//             else{
//                 console.log("error="+error);
//             }
//            });

            con.query("SELECT count(*) as tag_count,time,type FROM m_linen_record where type='Soil linen' group by time",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                    res.render('report_linen',{title:"Report",data:rows});
                }
            });
        }
        
        else if(v_item_type === "0" && v_linen_type === "clean"){
//            request('https://2ebe9a26-77dc-4a2a-8d04-f0e71aa7be33-bluemix.cloudant.com/linen/_design/sort_type/_view/sort_type?reduce=false&keys=%5B%22Clean+linen%22%5D', function (error, response, body) {
//            if (!error && response.statusCode == 200) {
//                var json_string = JSON.parse(body);
//        //        var user_data = json_string;
//        //        var time = json_string.rows[0].value.payload.gateway.date.date;
//        //        var array_size = json_string.rows[0].value.payload.tag.length;
//        //        var spayload = JSON.parse(payload.tag[0]);
//                //console.log("linen="+JSON.stringify(json_string)); // Print the google web page.
//                //console.log("payload="+JSON.stringify(json_string.rows[0].value.payload.tag));
//                var arraySend = [];
//                for(var i=0; i<json_string.rows.length;i++){
//                    arraySend.push(json_string.rows[i].value.payload);
//                }
//                //console.log("array="+arraySend);
//        //        console.log("payload="+JSON.stringify(spayload));
//        //        res.render('linen',{title:"Linen",data:user_data});
//                res.render('report_linen',{title:"Report",data:arraySend});
//             }
//             else{
//                 console.log("error="+error);
//             }
//            });

        con.query("SELECT count(*) as tag_count,time,type FROM m_linen_record where type='Clean linen' group by time",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                    res.render('report_linen',{title:"Report",data:rows});
                }
            });
        }
        
        else if(v_item_type === "0" && v_linen_type === "daily"){
            
//        console.log("step 4");
        con.query("SELECT sum(soil) as soil,sum(clean) as clean,year(time) as year_s, month(time) as month_s, day(time) as day_s FROM m_linen_record GROUP BY day(time) order by time desc",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                    res.render('report_linen',{title:"Report",data:rows});
                }
            });
        }
        
        else {
            req.flash('msg_error', "Please select only one type of report to show");
            res.redirect('/report');
            //console.log("Please select only one type of report to show");
        }
        

        
});

app.post('/report_home_asset',isAuthenticated,function(req,res){
    
        v_item_type = req.sanitize( 'item_type' ).escape();
       
        
//        alert("item type= "+v_item_type);
//        alert("linen type="+v_linen_type);
        //console.log('rfid ='+v_item_type);
        //console.log('dept desc ='+v_linen_type);
        
        if(v_item_type === "BEMS"){
            
            con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id left join m_zone on m_assets.assets_last_location = m_zone.zone_id where assets_inventory_type='BEMS'",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                    for(var i=0; i<rows.length;i++){
                        //dateFormatChange("");
                        rows[i].new_date = dateFormatChangeNew(rows[i].assets_last_datetime);

                    }
                    res.render('report_item',{title:"Report",data:rows,type:"BEMS"});
                }
            });
            
        }
        else if(v_item_type === "FEMS"){
            
            con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id left join m_zone on m_assets.assets_last_location = m_zone.zone_id where assets_inventory_type='FEMS'",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                    for(var i=0; i<rows.length;i++){
                        //dateFormatChange("");
                        rows[i].new_date = dateFormatChangeNew(rows[i].assets_last_datetime);

                    }
                    res.render('report_item',{title:"Report",data:rows,type:"FEMS"});
                }
            });
            
        }

        
});

app.post('/report_home_linen',isAuthenticated,function(req,res){
    
       
        v_linen_type = req.sanitize( 'linen_type' ).escape();
        
//        alert("item type= "+v_item_type);
//        alert("linen type="+v_linen_type);
        //console.log('rfid ='+v_item_type);
        //console.log('dept desc ='+v_linen_type);
            var d = new Date();
            //d.setMinutes(d.getMinutes()+480);

            var dmonth = d.getMonth()+1;
            var dyear = d.getFullYear();
            var month_name = "";
            //console.log("dmonth--"+dmonth);

            if(dmonth === 1){
                month_name = "January";
            }
            else if(dmonth === 2){
                month_name = "February";
            }
            else if(dmonth === 3){
                month_name = "March";
            }
            else if(dmonth === 4){
                month_name = "April";
            }
            else if(dmonth === 5){
                month_name = "May";
            }
            else if(dmonth === 6){
                month_name = "June";
            }
            else if(dmonth === 7){
                month_name = "July";
            }
            else if(dmonth === 8){
                month_name = "August";
            }
            else if(dmonth === 9){
                month_name = "September";
            }
            else if(dmonth === 10){
                month_name = "October";
            }
            else if(dmonth === 11){
                month_name = "November";
            }
            else if(dmonth === 12){
                month_name = "December";
            }
        
        if(v_linen_type === "soiled"){
            
            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         var dt_day = daytime[i].day.toString();
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         var day_s = rows[k].day_s.toString();

                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen_soil',{title:"Report",data:record_table,dmonth:dmonth,dyear:dyear,month_name:month_name,linen_type:v_linen_type});
                        }
                    });

        }
        
        else if(v_linen_type === "clean"){
            
            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         var dt_day = daytime[i].day.toString();
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         var day_s = rows[k].day_s.toString();

                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen_clean',{title:"Report",data:record_table,dmonth:dmonth,dyear:dyear,month_name:month_name,linen_type:v_linen_type});
                        }
                    });

        }
        
        else if(v_linen_type === "pending"){
            
           var d = new Date();
            //d.setMinutes(d.getMinutes()+480);

            var dmonth = d.getMonth()+1;
            var dyear = d.getFullYear();
            var month_name = "";
            //console.log("dmonth--"+dmonth);

            if(dmonth === 1){
                month_name = "January";
            }
            else if(dmonth === 2){
                month_name = "February";
            }
            else if(dmonth === 3){
                month_name = "March";
            }
            else if(dmonth === 4){
                month_name = "April";
            }
            else if(dmonth === 5){
                month_name = "May";
            }
            else if(dmonth === 6){
                month_name = "June";
            }
            else if(dmonth === 7){
                month_name = "July";
            }
            else if(dmonth === 8){
                month_name = "August";
            }
            else if(dmonth === 9){
                month_name = "September";
            }
            else if(dmonth === 10){
                month_name = "October";
            }
            else if(dmonth === 11){
                month_name = "November";
            }
            else if(dmonth === 12){
                month_name = "December";
            }

            var total_pending = 0;
            //console.log("SELECT * FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where linen_record.time='"+id+"'");
            con.query("SELECT sum(soil) as soil, sum(clean) as clean,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where year(time) = '"+dyear+"' and month(time) = '"+dmonth+"' group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time) order by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time)",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);

                    for(var i=0;i<rows.length;i++){
                        var newmonth,newday;
                        if(rows[i].month_s < 10){
                            newmonth = "0"+rows[i].month_s;
                        }
                        else{
                            newmonth = rows[i].month_s;
                        }

                        if(rows[i].day_s < 10){
                            newday = "0"+rows[i].day_s;
                        }
                        else{
                            newday = rows[i].day_s;
                        }
                        rows[i].new_date = newday+"-"+newmonth+"-"+rows[i].year_s;
                        rows[i].pending = rows[i].clean - rows[i].soil;
                        total_pending += rows[i].pending;
                    }
                    //console.log(rows);
                    console.log("total pending == "+total_pending);
                    res.render('report_linen_pending',{title:"Report",data:rows,dmonth:dmonth,dyear:dyear,month_name:month_name,total_pending:total_pending,linen_type:v_linen_type});
                }
            });

        }
        
        else if(v_linen_type === "daily"){
            
            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where month(time) = '"+dmonth+"' and year(time) = '"+dyear+"' group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         var dt_day = daytime[i].day.toString();
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         var day_s = rows[k].day_s.toString();

                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen',{title:"Report",data:record_table,dmonth:dmonth,dyear:dyear,month_name:month_name,linen_type:v_linen_type});
                        }
                    });

        }
        
        else if(v_linen_type === "monthly"){
            
            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s from m_linen_record group by year(time),month(time) order by year(time) desc,month(time) desc",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid group by year(m_linen_record.time),month(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year;
                                         var dt_month = daytime[i].month;
                                         
                                         var year_s = rows[k].year_s;
                                         var month_s = rows[k].month_s;
                                         

                                         if((dt_year === year_s) && (dt_month === month_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil,clean:rows[k].clean});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         
                                         record_list = { year:daytime[i].year,month:newmonth,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen_monthly',{title:"Report",data:record_table});
                        }
                    });
            

        }
        
        else {
            req.flash('msg_error', "Please select only one type of report to show");
            res.redirect('/report');
            //console.log("Please select only one type of report to show");
        }
        

        
});

app.post('/report_home_linen_sort',isAuthenticated,function(req,res){
    
       
        v_linen_type = req.sanitize( 'linen_type' ).escape();
        var v_month = req.sanitize( 'month_select' ); 
        var v_year = req.sanitize( 'year_select' );
        var month_name = "";
        
//        alert("item type= "+v_item_type);
//        alert("linen type="+v_linen_type);
        //console.log('rfid ='+v_item_type);
        //console.log('dept desc ='+v_linen_type);
            var newmonth = String(v_month);
            if(newmonth === "1"){
                month_name = "January";
            }
            else if(newmonth === "2"){
                month_name = "February";
            }
            else if(newmonth === "3"){
                month_name = "March";
            }
            else if(newmonth === "4"){
                month_name = "April";
            }
            else if(newmonth === "5"){
                month_name = "May";
            }
            else if(newmonth === "6"){
                month_name = "June";
            }
            else if(newmonth === "7"){
                month_name = "July";
            }
            else if(newmonth === "8"){
                month_name = "August";
            }
            else if(newmonth === "9"){
                month_name = "September";
            }
            else if(newmonth === "10"){
                month_name = "October";
            }
            else if(newmonth === "11"){
                month_name = "November";
            }
            else if(newmonth === "12"){
                month_name = "December";
            }
        
        if(v_linen_type === "soiled"){
            
            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+v_month+"' and year(time) = '"+v_year+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         var dt_day = daytime[i].day.toString();
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         var day_s = rows[k].day_s.toString();

                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen_soil',{title:"Report",data:record_table,dmonth:v_month,dyear:v_year,month_name:month_name,linen_type:v_linen_type});
                        }
                    });

        }
        
        else if(v_linen_type === "clean"){
            
            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+v_month+"' and year(time) = '"+v_year+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         var dt_day = daytime[i].day.toString();
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         var day_s = rows[k].day_s.toString();

                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen_clean',{title:"Report",data:record_table,dmonth:v_month,dyear:v_year,month_name:month_name,linen_type:v_linen_type});
                        }
                    });

//        con.query("SELECT sum(clean) as tag_count,time FROM linen_record where clean='1' group by time order by time desc",function(error,rows,fields){
//                if(!!error){
//                    console.log('Error in the query '+error);
//                }
//                else{
//                    //console.log('Successful query fff\n');
//                    //console.log(rows);
//                    for(var i=0; i<rows.length;i++){
//                        //dateFormatChange("");
//                        rows[i].new_date = dateFormatChange(rows[i].time);
//
//                    }
//                    res.render('report_linen_clean',{title:"Report",data:rows});
//                }
//            });
        }
        
        else if(v_linen_type === "pending"){

            var total_pending = 0;
            //console.log("SELECT * FROM linen_record left join linen on linen_record.id_linen = linen.linen_uuid where linen_record.time='"+id+"'");
            con.query("SELECT sum(soil) as soil, sum(clean) as clean,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid where month(time) = '"+v_month+"' and year(time) = '"+v_year+"' group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time) order by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time)",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query fff\n');
                    //console.log(rows);

                    for(var i=0;i<rows.length;i++){
                        var newmonth,newday;
                        if(rows[i].month_s < 10){
                            newmonth = "0"+rows[i].month_s;
                        }
                        else{
                            newmonth = rows[i].month_s;
                        }

                        if(rows[i].day_s < 10){
                            newday = "0"+rows[i].day_s;
                        }
                        else{
                            newday = rows[i].day_s;
                        }
                        rows[i].new_date = newday+"-"+newmonth+"-"+rows[i].year_s;
                        rows[i].pending = rows[i].clean - rows[i].soil;
                        total_pending += rows[i].pending;
                    }
                    //console.log(rows);
                    console.log("total pending == "+total_pending);
                    res.render('report_linen_pending',{title:"Report",data:rows,dmonth:v_month,dyear:v_year,month_name:month_name,total_pending:total_pending,linen_type:v_linen_type});
                }
            });

        }
        
        else if(v_linen_type === "daily"){
            
            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s,day(time) as day_s from m_linen_record where month(time) = '"+v_month+"' and year(time) = '"+v_year+"' group by year(time),month(time),day(time) order by year(time),month(time),day(time)",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s,day:rows[i].day_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s,day(time) as day_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid group by year(m_linen_record.time),month(m_linen_record.time),day(m_linen_record.time),linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         var dt_day = daytime[i].day.toString();
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         var day_s = rows[k].day_s.toString();

                                         if((dt_year === year_s) && (dt_month === month_s) && (dt_day === day_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth,newday;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         if(daytime[i].day < 10){
                                             newday = "0"+daytime[i].day;
                                         }
                                         else{
                                             newday = daytime[i].day;
                                         }
                                         record_list = { year:daytime[i].year,month:newmonth,day:newday,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen',{title:"Report",data:record_table,dmonth:v_month,dyear:v_year,month_name:month_name,linen_type:v_linen_type});
                        }
                    });

        }
        
        else if(v_linen_type === "monthly"){
            
            var daytime = [];
            var type_list = [];
            var record_list;
            var record_table = [];

            con.query("SELECT year(time) as year_s,month(time) as month_s from m_linen_record group by year(time),month(time) order by time desc",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   for(var i=0;i<rows.length;i++){
                  daytime.push({ year:rows[i].year_s,month:rows[i].month_s});
                   }
                  //console.log(daytime);
               }
           });
                    con.query("SELECT sum(soil) as soil, sum(clean) as clean,linen_category,year(time) as year_s,month(time) as month_s FROM m_linen_record left join m_linen on m_linen_record.id_linen = m_linen.linen_uuid group by year(m_linen_record.time),month(m_linen_record.time),m_linen.linen_category",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            //console.log('Successful query fff\n');
                            //console.log(rows);
                           for(var i=0;i<daytime.length;i++){
                               if(rows.length!==0){
                                    for(var k=0;k<rows.length;k++){
                                         //console.log("emp="+employee[i].employee_id+" att_emp="+attendance[k].employee_id);
                                         var dt_year = daytime[i].year.toString();
                                         var dt_month = daytime[i].month.toString();
                                         
                                         var year_s = rows[k].year_s.toString();
                                         var month_s = rows[k].month_s.toString();
                                         

                                         if((dt_year === year_s) && (dt_month === month_s)){
                                             type_list.push({ category:rows[k].linen_category,soil:rows[k].soil.toString(),clean:rows[k].clean.toString()});
                                             //console.log("attendace ="+JSON.stringify(type_list[k]));
                                         }

                                         var newmonth;
                                         if(daytime[i].month < 10){
                                             newmonth = "0"+daytime[i].month;
                                         }
                                         else{
                                             newmonth = daytime[i].month;
                                         }

                                         
                                         record_list = { year:daytime[i].year,month:newmonth,list:type_list};

                                         //employee_list.push(attendance_list);
                                       }
                               }
                               type_list = [];
                               record_table.push(record_list);
                               //console.log("record_table - "+JSON.stringify(record_table));
                           }
                            res.render('report_linen_monthly',{title:"Report",data:record_table});
                        }
                    });
            
//        console.log("step 4");
//        con.query("SELECT sum(soil) as soil,sum(clean) as clean,year(time) as year_s, month(time) as month_s, day(time) as day_s FROM linen_record GROUP BY month(time) order by year(time),month(time) desc",function(error,rows,fields){
//                if(!!error){
//                    console.log('Error in the query '+error);
//                }
//                else{
//                    //console.log('Successful query fff\n');
//                    //console.log(rows);
//                    res.render('report_linen_monthly',{title:"Report",data:rows});
//                }
//            });
        }
        
        else {
            req.flash('msg_error', "Please select only one type of report to show");
            res.redirect('/report');
            //console.log("Please select only one type of report to show");
        }
        

        
});


//Dashboard
app.get('/', isAuthenticated,function(req,res){
    if(req.session.passport.user.user_right === "Linen Operator"){
        res.redirect('/dashboard_linen');
    }
    else if(req.session.passport.user.user_right === "Environment"){
        res.redirect('/environment');
    }
    
    var passedVariable = decodeURIComponent(req.query.data);
    //console.log("passedvariable="+passedVariable);
    var passedMessage = decodeURIComponent(req.query.message);
    //console.log("passedvariable="+passedMessage);
//    var json_data = JSON.parse('[{"assets_id":71,"assets_rfid":"36010232","assets_inventory_type":"FEMS","assets_no":"125","assets_zone":"32","assets_room_code":"123","assets_room_desc":"123","assets_item_desc":"Wheelchair","assets_manufacturer":"123","assets_make":"123","assets_model":"123","assets_brand":"123","assets_serial_no":"123","assets_supplier":"123","assets_type_code":"123","assets_warranty_start":"2017-07-30T16:00:00.000Z","assets_warranty_end":"2018-07-30T16:00:00.000Z","assets_task_code":"123","assets_frequency":"123","assets_order_no":"123","assets_warranty":"123","assets_variation":"123","assets_owner":"Admin","assets_acceptance_date":"2017-07-31","assets_img_path":"uploads/assets_img-1500976562234.jpg","assets_dept_code":"2","assets_last_location":"32","assets_last_datetime":"2017-07-26T03:27:24.000Z","assets_last_map":"uploads/map/icu_smc2.png"},{"assets_id":81,"assets_rfid":"36010495","assets_inventory_type":"FEMS","assets_no":"126","assets_zone":"32","assets_room_code":"123","assets_room_desc":"123","assets_item_desc":"Wheelchair","assets_manufacturer":"123","assets_make":"123","assets_model":"123","assets_brand":"123","assets_serial_no":"123","assets_supplier":"123","assets_type_code":"123","assets_warranty_start":"2017-07-30T16:00:00.000Z","assets_warranty_end":"2018-07-30T16:00:00.000Z","assets_task_code":"123","assets_frequency":"123","assets_order_no":"123","assets_warranty":"123","assets_variation":"123","assets_owner":"Admin","assets_acceptance_date":"2017-07-31","assets_img_path":"uploads/assets_img-1500976625471.jpg","assets_dept_code":"1","assets_last_location":"2","assets_last_datetime":"2017-08-14T01:48:27.000Z","assets_last_map":"uploads/map/icu_smc2.png"}]');
    if(passedVariable!== 'undefined'){
    var json_data = JSON.parse(passedVariable);
    //console.log("passedvariable2x="+json_data[0].assets_id);
}
    
//    console.log('kkkkkkk = '+JSON.stringify(req.session.passport.user.username));
    var assets_volume;
    var active_gateway;
    var monitoring;
    var movements;
    var graph_data;
    var maintenance;
   con.query("SELECT COUNT(assets_id) as assets_volume FROM m_assets",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
//           console.log(rows[0].assets_volume);
           assets_volume = rows[0].assets_volume;
//           console.log(assets_volume);
//           res.render('dashboard',{title:"Dashboard",data:rows});
       }
   }); 
   
   con.query("SELECT COUNT(assets_id) as maintenance FROM m_assets where assets_warranty_end < NOW() + INTERVAL 180 DAY",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
//           console.log(rows[0].assets_volume);
           maintenance = rows[0].maintenance;
           //console.log("maintenance="+maintenance);
//           res.render('dashboard',{title:"Dashboard",data:rows});
       }
   }); 
   
   con.query("SELECT COUNT(*) as movements FROM m_unauthorized",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
          // console.log('Successful query\n');
//           console.log(rows[0].assets_volume);
           //monitoring = 0;
           monitoring = rows[0].movements;  //real use, set to 0 first for testing
//           console.log(rows);
//           res.render('dashboard',{title:"Dashboard",data:rows});
       }
   });
   
   con.query("SELECT * FROM m_unauthorized left join m_assets on m_unauthorized.un_tag_id = m_assets.assets_rfid left join m_zone on m_unauthorized.un_last_location = m_zone.zone_id order by m_unauthorized.un_date_time_move desc limit 5",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
//           console.log(rows[0].assets_volume);s
          for(var i=0; i<rows.length;i++){
                //dateFormatChange("");
                rows[i].new_date = dateFormatChangeNew(rows[i].un_date_time_move);

            }
          // console.log(rows);
           movements = rows; //stop first for testing
          // movements = [];
           //console.log("dataaa="+JSON.stringify(rows));
//           res.render('dashboard',{title:"Dashboard",data:rows});
       }
   });
   
   con.query("SELECT count(*) as number,year(history_date_time_move) as year_s, month(history_date_time_move) as month_s, day(history_date_time_move) as day_s FROM m_history where history_assigned_loc != history_last_location GROUP BY year(history_date_time_move),month(history_date_time_move),day(history_date_time_move) ORDER BY year(history_date_time_move) desc,month(history_date_time_move) desc,day(history_date_time_move) desc limit 7",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
//           console.log(rows[0].assets_volume);
           graph_data = rows;
           //console.log("dataaa="+JSON.stringify(graph_data));
//           res.render('dashboard',{title:"Dashboard",data:rows});
       }
   });
   
   con.query("SELECT COUNT(gateway_id) as gateway_volume FROM m_gateway",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
//           console.log(rows[0].gateway_volume);
           active_gateway = rows[0].gateway_volume;
           //console.log("movements-- "+movements);
//           res.render('dashboard',{title:"Dashboard",data:rows});
        res.render('dashboard',{title:"Dashboard",assets_volume:assets_volume,active_gateway:active_gateway,monitoring:monitoring,movements:movements,data:passedVariable,graph_data:graph_data,maintenance:maintenance});
       }
   });

});


app.post('/',isAuthenticated,function(req,res){
        
        v_search_query = req.sanitize('search_query').escape(); 
        var d = new Date();
        //d.setMinutes(d.getMinutes()+480);
        var ddate = d.getDate();
        var dmonth = d.getMonth()+1;
        var dyear = d.getFullYear();
        
        con.query("SELECT assets_item_desc,assets_img_path,assets_last_datetime,assets_rfid,assets_last_location FROM m_assets WHERE assets_item_desc like '%"+v_search_query+"%' and year(assets_last_datetime) = '"+dyear+"' and month(assets_last_datetime) = '"+dmonth+"' and day(assets_last_datetime) = '"+ddate+"'",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           if(rows.length === 0){
                    con.query("SELECT assets_item_desc,assets_img_path,assets_last_datetime,assets_rfid,assets_last_location FROM m_assets WHERE assets_rfid = ? and year(assets_last_datetime) = '"+dyear+"' and month(assets_last_datetime) = '"+dmonth+"' and day(assets_last_datetime) = '"+ddate+"'",[v_search_query],function(error,rows,fields){
                    if(!!error){
                        console.log('Error in the query '+error);
                    }
                    else{
                        if(rows.length === 0){
                                    con.query("SELECT * FROM m_zone WHERE zone_name like '%"+v_search_query+"%'",function(error,rows,fields){
                                    if(!!error){
                                        console.log('Error in the query 22-'+error);
                                        req.flash('msg_info', 'No results found');  
                                        res.redirect('/');
                                    }
                                    else{
                                        if(rows.length !== 0){
                                            con.query("SELECT assets_item_desc,assets_img_path,assets_last_datetime,assets_rfid,assets_last_location FROM m_assets WHERE assets_last_location = ? and year(assets_last_datetime) = '"+dyear+"' and month(assets_last_datetime) = '"+dmonth+"' and day(assets_last_datetime) = '"+ddate+"'",[rows[0].zone_id],function(error,rows,fields){
                                            if(!!error){
                                                console.log('Error in the query '+error);
                                            }
                                            else{
                                                if(rows.length === 0){
                                                  req.flash('msg_info', 'No results found');  
                                                  res.redirect('/');

                                                }
                                                else{
                                                    //console.log('Successful query\n');
                                                    console.log("query 3="+rows);
                                                    //console.log("search query="+v_search_query);
                                                     
                                                    var string = encodeURIComponent(JSON.stringify(rows));
                                                    console.log("encode string="+string);
                                                    req.flash('msg_info', rows.length+' record(s) found');
                                                    res.redirect('/?data='+string);
                                                    
                                                }

                                            }
                                            });
                                       
                                        }
                                        else{
                                             req.flash('msg_info', 'No results found');  
                                             res.redirect('/');
                                        }
                                    }
                                });


                        }
                        else{
                            //console.log('Successful query\n');
                            //console.log("query 2="+rows);
                            //console.log("search query="+v_search_query);
                             
                            var string = encodeURIComponent(JSON.stringify(rows));
                            //console.log("encode string="+string);
                            req.flash('msg_info', rows.length+' record(s) found');
                            res.redirect('/?data='+string);
                           
                        }

                    }
                });
               
           }
           else{
               //console.log('Successful query\n');
               //console.log("query 1="+rows);
               //console.log("search query="+v_search_query);
                
               var string = encodeURIComponent(JSON.stringify(rows));
               //console.log("encode string="+string);
               req.flash('msg_info', rows.length+' record(s) found');
               res.redirect('/?data='+string);
               
           }
           
       }
   });
   
        
        
 
        
});

app.get('/map_view/:id',isAuthenticated,function(req,res){
     var id = req.params.id;
   //console.log("SELECT * FROM assets where assets_rfid='"+id+"'");
   con.query("SELECT * FROM m_assets where assets_rfid='"+id+"'",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.render('map_view',{title:"Map View",data:rows});
       }
   }); 
});


//Dashboard Linen
app.get('/dashboard_linen', isAuthenticated,function(req,res){
    
//    console.log('kkkkkkk = '+JSON.stringify(req.session.passport.user.username));
    var pillow_case;
    var patient_gown;
    var blanket;
    var bed_sheet;
    var graph_data;
    var graph_data2;
    var top_data;
    
    //SELECT COUNT(linen_id) as pillow_case FROM linen where linen_category='Pillow Case'
   con.query("SELECT * FROM m_linen_count",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
//           console.log(rows[0].assets_volume);
           pillow_case = rows[0].pillow_case;
           patient_gown = rows[0].gown;
           blanket = rows[0].blanket;
           bed_sheet = rows[0].bedsheet;
//           console.log(assets_volume);
//           res.render('dashboard',{title:"Dashboard",data:rows});
       }
   }); 
   
   con.query("SELECT count(linen_uuid) as number,linen_category from m_linen group by linen_category",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           top_data = rows;
       }
   }); 
   
//   con.query("SELECT COUNT(linen_id) as patient_gown FROM linen where linen_category='Patient Gown'",function(error,rows,fields){
//       if(!!error){
//           console.log('Error in the query '+error);
//       }
//       else{
//           //console.log('Successful query\n');
////           console.log(rows[0].assets_volume);
//           patient_gown = rows[0].patient_gown;
////           console.log(rows);
////           res.render('dashboard',{title:"Dashboard",data:rows});
//       }
//   });
   
//   con.query("SELECT COUNT(linen_id) as blanket FROM linen where linen_category='Blanket'",function(error,rows,fields){
//       if(!!error){
//           console.log('Error in the query '+error);
//       }
//       else{
//           //console.log('Successful query\n');
////           console.log(rows[0].assets_volume);
//           blanket = rows[0].blanket;
////           console.log(rows);
////           res.render('dashboard',{title:"Dashboard",data:rows});
//       }
//   });
   
//   con.query("SELECT COUNT(linen_id) as bed_sheet FROM linen where linen_category='Bed Sheet'",function(error,rows,fields){
//       if(!!error){
//           console.log('Error in the query '+error);
//       }
//       else{
//           //console.log('Successful query\n');
////           console.log(rows[0].assets_volume);
//           bed_sheet = rows[0].bed_sheet;
////           console.log(rows);
////           res.render('dashboard',{title:"Dashboard",data:rows});
//       }
//   });
    //SELECT WEEKOFYEAR(time) AS period, sum(soil) as soil,sum(clean) as clean FROM linen_record WHERE year(time)='2018' GROUP BY period
   con.query("SELECT MONTH(time) AS month, WEEK(time) AS week, sum(soil) as soil,sum(clean) as clean FROM m_linen_record where year(time)='2018' GROUP BY MONTH(time),WEEK(time)",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
//           console.log(rows[0].assets_volume);
           graph_data = rows;
           //console.log("graph_data="+JSON.stringify(rows));
//           res.render('dashboard',{title:"Dashboard",data:rows});
       }
   });
   
   con.query("SELECT WEEKOFYEAR(time) AS period, sum(soil) as soil,sum(clean) as clean FROM m_linen_record WHERE year(time)='2017' GROUP BY period",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
//           console.log(rows[0].assets_volume);
           graph_data2 = rows;
           //console.log("graph_data="+JSON.stringify(rows));
//           res.render('dashboard',{title:"Dashboard",data:rows});
       }
   });
   
   con.query("SELECT sum(soil) as soil, sum(clean) as clean,sum(housekeeping) as iron,time FROM m_linen_record group by time order by time desc limit 5",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful querytt\n');
           //console.log(rows);
           for(var i=0; i<rows.length;i++){
               //dateFormatChange("");
               rows[i].new_date = dateFormatChange(rows[i].time);
               
           }
           res.render('dashboard_linen',{title:"Dashboard Linen",pillow_case:pillow_case,patient_gown:patient_gown,blanket:blanket,bed_sheet:bed_sheet,linen_scanned:rows,graph_data:graph_data,graph_data2:graph_data2,top_data:top_data});
//           console.log(rows);
//           res.render('dashboard',{title:"Dashboard",data:rows});
       }
   });



});

app.get('/dashboard_linen_2', isAuthenticated,function(req,res){
    
//    console.log('kkkkkkk = '+JSON.stringify(req.session.passport.user.username));
    var pillow_case;
    var patient_gown;
    var blanket;
    var bed_sheet;
    var graph_data;
    
    //SELECT COUNT(linen_id) as pillow_case FROM linen where linen_category='Pillow Case'
   con.query("SELECT * FROM m_linen_count",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
//           console.log(rows[0].assets_volume);
           pillow_case = rows[0].pillow_case;
           patient_gown = rows[0].gown;
           blanket = rows[0].blanket;
           bed_sheet = rows[0].bedsheet;
//           console.log(assets_volume);
//           res.render('dashboard',{title:"Dashboard",data:rows});
       }
   }); 
   
//   con.query("SELECT COUNT(linen_id) as patient_gown FROM linen where linen_category='Patient Gown'",function(error,rows,fields){
//       if(!!error){
//           console.log('Error in the query '+error);
//       }
//       else{
//           //console.log('Successful query\n');
////           console.log(rows[0].assets_volume);
//           patient_gown = rows[0].patient_gown;
////           console.log(rows);
////           res.render('dashboard',{title:"Dashboard",data:rows});
//       }
//   });
   
//   con.query("SELECT COUNT(linen_id) as blanket FROM linen where linen_category='Blanket'",function(error,rows,fields){
//       if(!!error){
//           console.log('Error in the query '+error);
//       }
//       else{
//           //console.log('Successful query\n');
////           console.log(rows[0].assets_volume);
//           blanket = rows[0].blanket;
////           console.log(rows);
////           res.render('dashboard',{title:"Dashboard",data:rows});
//       }
//   });
   
//   con.query("SELECT COUNT(linen_id) as bed_sheet FROM linen where linen_category='Bed Sheet'",function(error,rows,fields){
//       if(!!error){
//           console.log('Error in the query '+error);
//       }
//       else{
//           //console.log('Successful query\n');
////           console.log(rows[0].assets_volume);
//           bed_sheet = rows[0].bed_sheet;
////           console.log(rows);
////           res.render('dashboard',{title:"Dashboard",data:rows});
//       }
//   });
   
   con.query("SELECT WEEKOFYEAR(time) AS period, sum(soil) as soil,sum(clean) as clean FROM m_linen_record WHERE time >= CURDATE() - INTERVAL 4 WEEK and year(time)='2018' GROUP BY period",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
//           console.log(rows[0].assets_volume);
           graph_data = rows;
           //console.log("graph_data="+JSON.stringify(rows));
//           res.render('dashboard',{title:"Dashboard",data:rows});
       }
   });
   
   con.query("SELECT sum(soil) as soil, sum(clean) as clean,time FROM m_linen_record group by time order by time desc limit 5",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful querytt\n');
           //console.log(rows);
           for(var i=0; i<rows.length;i++){
               //dateFormatChange("");
               rows[i].new_date = dateFormatChange(rows[i].time);
               
           }
           res.render('dashboard_linen_2',{title:"Dashboard Linen",pillow_case:pillow_case,patient_gown:patient_gown,blanket:blanket,bed_sheet:bed_sheet,linen_scanned:rows,graph_data:graph_data});
//           console.log(rows);
//           res.render('dashboard',{title:"Dashboard",data:rows});
       }
   });
   
//   request('https://2ebe9a26-77dc-4a2a-8d04-f0e71aa7be33-bluemix.cloudant.com/linen/_design/sort/_view/sort?limit=5&reduce=false&descending=true', function (error, response, body) {
//    if (!error && response.statusCode == 200) {
//        var json_string = JSON.parse(body);
//
//        var arraySend = [];
//        for(var i=0; i<json_string.rows.length;i++){
//            arraySend.push(json_string.rows[i].value.payload);
//        }
//        console.log("array="+arraySend);
////        console.log("payload="+JSON.stringify(spayload));
////        res.render('linen',{title:"Linen",data:user_data});
//        res.render('dashboard_linen',{title:"Dashboard Linen",pillow_case:pillow_case,patient_gown:patient_gown,blanket:blanket,bed_sheet:bed_sheet,linen_scanned:arraySend});
//     }
//     else{
//         console.log("error="+error);
//     }
//    });

});


//Dashboard Environment
app.get('/environment', isAuthenticated,function(req,res){
    
//    console.log('kkkkkkk = '+JSON.stringify(req.session.passport.user.username));


   con.query("SELECT count(*) as number,avg(temp_env) as avg_temp,avg(humidity_env) as avg_humidity,avg(air_q_env) as avg_air_q,avg(co2_env) as avg_co2,avg(co_env) as avg_co,avg(tvoc_env) as avg_tvoc,year(timestamp_env) as year_s, month(timestamp_env) as month_s, day(timestamp_env) as day_s, location_env FROM m_environment_record GROUP BY year(timestamp_env),month(timestamp_env),day(timestamp_env), location_env order by year(timestamp_env) desc,month(timestamp_env) desc,day(timestamp_env) desc limit 7",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
//           console.log(rows[0].gateway_volume);
//           active_gateway = rows[0].gateway_volume;
           console.log(rows);
//           res.render('dashboard',{title:"Dashboard",data:rows});
        res.render('environment',{title:"Environment",graph_data:rows});
       }
   });

});

app.get('/environment_detail',isAuthenticated,function(req,res){
    var d = new Date();
        
    //d.setMinutes(d.getMinutes()+480);
    var dmonth = d.getMonth()+1;
    var dyear = d.getFullYear();

        var month_name = "";
        //console.log("dmonth--"+dmonth);
        
        if(dmonth === 1){
            month_name = "January";
        }
        else if(dmonth === 2){
            month_name = "February";
        }
        else if(dmonth === 3){
            month_name = "March";
        }
        else if(dmonth === 4){
            month_name = "April";
        }
        else if(dmonth === 5){
            month_name = "May";
        }
        else if(dmonth === 6){
            month_name = "June";
        }
        else if(dmonth === 7){
            month_name = "July";
        }
        else if(dmonth === 8){
            month_name = "August";
        }
        else if(dmonth === 9){
            month_name = "September";
        }
        else if(dmonth === 10){
            month_name = "October";
        }
        else if(dmonth === 11){
            month_name = "November";
        }
        else if(dmonth === 12){
            month_name = "December";
        }
   
     con.query("SELECT * FROM m_environment_record where month(timestamp_env) = '"+dmonth+"' and year(timestamp_env) = '"+dyear+"' order by timestamp_env desc",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           for(var i=0; i<rows.length;i++){
               //dateFormatChange("");
               rows[i].new_date = dateFormatChangeNew(rows[i].timestamp_env);
               
           }
           res.render('environment_detail',{title:"Environment",data:rows,month_name:month_name,dyear:dyear});
       }
   }); 
//    var d = new Date();
//    var dmonth = d.getMonth()+1;
//    var dyear = d.getFullYear();
//
//    if(dmonth < 10){
//        dmonth = "0"+dmonth;
//    }
//    
//    var newDate = dyear+'-'+dmonth;
//                                 
//                                 
//   request('https://2ebe9a26-77dc-4a2a-8d04-f0e71aa7be33-bluemix.cloudant.com/iotp_um8ctw_dlm_'+newDate+'/_design/sort_event/_view/sort_event?limit=100&reduce=false&keys=%5B%22sensor%22%5D', function (error, response, body) {
//    if (!error && response.statusCode == 200) {
//        var json_string = JSON.parse(body);
////        var user_data = json_string;
////        var time = json_string.rows[0].value.payload.gateway.date.date;
////        var array_size = json_string.rows[0].value.payload.tag.length;
////        var spayload = JSON.parse(payload.tag[0]);
//        //console.log("environment="+JSON.stringify(json_string)); // Print the google web page.
//        //console.log("payload="+JSON.stringify(json_string.rows[0].value.data.d));
//        var arraySend = [];
//        for(var i=0; i<json_string.rows.length;i++){
//            arraySend.push(json_string.rows[i].value.data.d);
//        }
//        //console.log("array="+arraySend);
////        console.log("payload="+JSON.stringify(spayload));
////        res.render('linen',{title:"Linen",data:user_data});
//        res.render('environment_detail',{title:"Environment",data:arraySend});
//     }
//     else{
//         console.log("error="+error);
//     }
//    });

});

app.post('/environment_detail',isAuthenticated,function(req,res){
            var v_month = req.sanitize( 'month_select' ); 
            var v_year = req.sanitize( 'year_select' );
            var month_name = "";
            //console.log("type of--"+typeof v_month);
            
            var newmonth = String(v_month);
            if(newmonth === "1"){
                month_name = "January";
            }
            else if(newmonth === "2"){
                month_name = "February";
            }
            else if(newmonth === "3"){
                month_name = "March";
            }
            else if(newmonth === "4"){
                month_name = "April";
            }
            else if(newmonth === "5"){
                month_name = "May";
            }
            else if(newmonth === "6"){
                month_name = "June";
            }
            else if(newmonth === "7"){
                month_name = "July";
            }
            else if(newmonth === "8"){
                month_name = "August";
            }
            else if(newmonth === "9"){
                month_name = "September";
            }
            else if(newmonth === "10"){
                month_name = "October";
            }
            else if(newmonth === "11"){
                month_name = "November";
            }
            else if(newmonth === "12"){
                month_name = "December";
            }
   
     con.query("SELECT * FROM m_environment_record where month(timestamp_env) = '"+v_month+"' and year(timestamp_env) = '"+v_year+"' order by timestamp_env desc",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           for(var i=0; i<rows.length;i++){
               //dateFormatChange("");
               rows[i].new_date = dateFormatChangeNew(rows[i].timestamp_env);
               
           }
           res.render('environment_detail',{title:"Environment",data:rows,month_name:month_name,dyear:v_year});
       }
   }); 


});

app.get('/environment_notifcation',isAuthenticated,function(req,res){
    var d = new Date();
        
    //d.setMinutes(d.getMinutes()+480);
    var dmonth = d.getMonth()+1;
    var dyear = d.getFullYear();
   
     con.query("SELECT * FROM m_notification_env where month(timestamp_env) = '"+dmonth+"' and year(timestamp_env) = '"+dyear+"' order by timestamp_env desc",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           for(var i=0; i<rows.length;i++){
               //dateFormatChange("");
               rows[i].new_date = dateFormatChangeNew(rows[i].timestamp_env);
               
           }
           res.render('environment_notification',{title:"Environment",data:rows});
       }
   }); 


});

//maps
//app.get('/map',function(req,res){
////   connect_mysql.query("SELECT * FROM monitoring",function(error,rows,fields){
////       if(!!error){
////           console.log('Error in the query');
////       }
////       else{
////           console.log('Successful query\n');
////           console.log(rows);
//           res.render('map',{title:"Maps"});
////       }
////   }); 
//});

//------------------------- REST API -------------------------------
app.get('/api/v1/assets',function(req,res){
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
   con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id left join m_zone on m_assets.assets_last_location = m_zone.zone_id",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.status(200).send(rows);
       }
   }); 
});

app.post('/api/v1/farm/:username',function(req,res){
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    var username = req.params.username;
    var farm = '';
    
    con.query("SELECT farm FROM user where username = '"+username+"'",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           farm = rows[0].farm;
           con.query("SELECT * FROM farm where farm_name = '"+farm+"'",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    //console.log('Successful query\n');
                    //console.log(rows);
                    var result = {result:"1",action:"farm_data",farm_name:rows[0].farm_name,farm_address:rows[0].farm_address,farm_location:rows[0].farm_location,no_of_animal:rows[0].no_of_animal,total_milking:rows[0].total_milking,total_dry:rows[0].total_dry,no_of_heifers:rows[0].no_of_heifers,no_of_bulls:rows[0].no_of_bulls}
                    res.status(200).send(rows[0].farm_name);
                }
            });
       }
   }); 
    
});

app.get('/api/v1/assets/unauthorized',function(req,res){
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
   con.query("SELECT *,un_date_time_move as history_date_time_move FROM m_unauthorized left join m_assets on m_unauthorized.un_tag_id = m_assets.assets_rfid left join m_zone on m_unauthorized.un_last_location = m_zone.zone_id order by m_unauthorized.un_date_time_move desc limit 100",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.status(200).send(rows);
       }
   }); 
});

app.get('/api/v1/assets/id/:id',function(req,res){
     // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    var id = req.params.id;
   con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id left join m_zone on m_assets.assets_last_location = m_zone.zone_id where m_assets.assets_rfid='"+id+"'",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.status(200).send(rows);
       }
   }); 
});

app.get('/api/v1/assets/location/:location',function(req,res){
     // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    var location = req.params.location;
   con.query("SELECT * FROM m_assets left join m_department on m_assets.assets_dept_code = m_department.dept_id left join m_zone on m_assets.assets_last_location = m_zone.zone_reader_id where m_zone.zone_name='"+location+"'",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.status(200).send(rows);
       }
   }); 
});

app.get('/api/v1/history/:id',function(req,res){
//    var zone=[];
//    con.query("SELECT * FROM zone",function(error,rows,fields){
//       if(!!error){
//           console.log('Error in the query '+error);
//       }
//       else{
//           //console.log('Successful query\n');
//           //console.log(rows);
//           zone=rows;
//       }
//   }); 
     // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
//   var id = req.params.id;
//   var url_string = encodeURI(id);
//   
//    var d = new Date();
//    var ddate = d.getDate();
//    var dmonth = d.getMonth()+1;
//    var dyear = d.getFullYear();
//    var dhour = d.getHours();
//    var dminutes = d.getMinutes();
//    var dseconds = d.getSeconds();
//
//    if(ddate < 10){
//        ddate = "0"+ddate;
//    }
//    if(dmonth < 10){
//        dmonth = "0"+dmonth;
//    }
//
//    if(dhour < 10){
//        dhour = "0"+dhour;
//    }
//    if(dminutes < 10){
//        dminutes = "0"+dminutes;
//    }
//    if(dseconds < 10){
//        dseconds = "0"+dseconds;
//    }
//
//    var newdate = ddate+"-"+dmonth+"-"+dyear+" "+dhour+":"+dminutes+":"+dseconds;
//    var url_date = encodeURI(newdate);
//    
//    var newMonth = dyear+"-"+dmonth;
////   console.log('https://2ebe9a26-77dc-4a2a-8d04-f0e71aa7be33-bluemix.cloudant.com/iotp_um8ctw_dlm_'+newMonth+'/_design/sort_addr_date/_view/sort_addr_date?limit=100&reduce=false&inclusive_end=true&start_key=%5B+'+url_string+'%2C+++%22'+url_date+'%22%5D&descending=true'); 
//   request('https://2ebe9a26-77dc-4a2a-8d04-f0e71aa7be33-bluemix.cloudant.com/iotp_um8ctw_dlm_'+newMonth+'/_design/sort_addr_date/_view/sort_addr_date?limit=50&reduce=false&inclusive_end=true&start_key=%5B+'+url_string+'%2C+++%22'+url_date+'%22%5D', function (error, response, body) {
//    if (!error && response.statusCode == 200) {
//        var json_string = JSON.parse(body);
//
//        var arraySend = [];
//        for(var i=0; i<json_string.rows.length;i++){
//            for(var j=0; j<zone.length;j++){
//               if(json_string.rows[i].value.data.d.reader_id === zone[j].zone_reader_id){
//                    json_string.rows[i].value.data.d.location = zone[j].zone_name;
//                } 
//            }
//            
////            if(json_string.rows[i].value.data.d.reader_id === zone[i].zone_reader_id){
////            json_string.rows[i].value.data.d.location = zone[i].zone_name;
////             }
//            arraySend.push(json_string.rows[i].value.data.d);
//        }
//
//        res.status(200).send(arraySend);
//     }
//     else{
//         console.log("error="+error);
//     }
//    });
   var id = req.params.id;
   con.query("SELECT history.history_date_time_move,zone.zone_name,history.history_tag_id FROM m_history left join m_zone on m_history.history_last_location = m_zone.zone_id left join m_assets on m_history.history_tag_id = m_assets.assets_rfid where m_history.history_tag_id='"+id+"' order by m_history.history_date_time_move desc",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           res.status(200).send(rows);
       }
   });
});

app.get('/api/v1/user/u/:username/p/:pass/gcm/:gcm_id',function(req,res){
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    var username = req.params.username;
    var pass = req.params.pass;
    var gcm_id = req.params.gcm_id;
    
   con.query("SELECT * FROM m_users where username='"+username+"' and password='"+pass+"'",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else if(rows.length===0){
           res.status(200).send("Incorrect username or password");
       }
       else{
           con.query("UPDATE m_users set user_gcm_id ='"+gcm_id+"' where username='"+username+"'",function(error,rows,fields){
            });
           //console.log('Successful query\n');
           //console.log(rows);
           res.status(200).send(rows);
       }
   }); 
});

app.get('/api/v1/user/u/:username/p/:pass',function(req,res){
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    var username = req.params.username;
    var pass = req.params.pass;
//    var gcm_id = req.params.gcm_id;
    
   con.query("SELECT * FROM m_users where username='"+username+"' and password='"+pass+"'",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else if(rows.length===0){
           res.status(200).send("Incorrect username or password");
       }
       else{
//           con.query("UPDATE users set user_gcm_id ='"+gcm_id+"' where username='"+username+"'",function(error,rows,fields){
//            });
           //console.log('Successful query\n');
           //console.log(rows);
           res.status(200).send(rows);
       }
   }); 
});

app.get('/api/v1/getlinen_d',function(req,res){
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    var requestData = {
            _id: "2017-06-21 99:99:99",
            payload: {
              date: "2017-06-21 16:48:40",
              tag: [
                "9999"
              ],
              type: "Soil Linen"
            }
          };
//        var requestData = '"{\r\n \"_id\": \"2017-08-07 02:11:34 AM\",\r\n \"payload\": {\r\n  \"date\": \"2017-08-07 02:11:34 AM\",\r\n  \"tag\": [\r\n   \"3008 33B2 DDD9 0140 0000 0000 \",\r\n   \"E200 6806 0000 0000 0000 0000 \",\r\n   \"3008 33B2 0000 0006 0000 0000 \",\r\n   \"0000 0000 0000 2014 0000 0011 \",\r\n   \"1000 0000 0000 0000 0000 0002 \",\r\n   \"AAAA 0000 0012 D600 AAAA AAAA \",\r\n  ],\r\n  \"type\": \"Clean linen\"\r\n }\r\n}"';
//        var requestData = '{"_id": "2017-08-07 02:11:34 AM","payload": {"date": "2017-08-07 02:11:34 AM",  "tag": [  "3008 33B2 DDD9 0140 0000 0000 ",   "E200 6806 0000 0000 0000 0000 ",   "3008 33B2 0000 0006 0000 0000 ",   "0000 0000 0000 2014 0000 0011 ",   "1000 0000 0000 0000 0000 0002 ",   "AAAA 0000 0012 D600 AAAA AAAA "  ],  "type": "Clean linen" }}';
//        var requestData = [  "3008 33B2 DDD9 0140 0000 0000 ",   "E200 6806 0000 0000 0000 0000 ",   "3008 33B2 0000 0006 0000 0000 ",   "0000 0000 0000 2014 0000 0011 ",   "1000 0000 0000 0000 0000 0002 ",   "AAAA 0000 0012 D600 AAAA AAAA "  ];
//         requestData = requestData.replace(/(?:\r\n|\r|\n|)/g, '');
//         requestData = requestData.replace(/\\"/g, '/"/');
//         requestData = requestData.replace(/,  ]/g, ']');
//         requestData = requestData.replace(/"{/g, '{');
//         requestData = requestData.replace(/}"/g, '}');
          //console.log("request=--"+requestData);
//          
//          var json_parse = JSON.parse(requestData);
//          console.log(json_parse);
    request({
            url: "http://localhost:3000/api/v1/linen_d",
            method: "POST",
            json: true,   // <--Very important!!!
            body:requestData
        }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
//        var json_string = JSON.parse(body);
//        res.status(200).send(json_string);
     }
     else{
         console.log("error="+error);
     }
    });
});

app.post('/api/v1/linen_d',function(req,res){
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
//    console.log(req.body);      // your JSON
//    res.send(req.body);    // echo the result back

//    var d = createDateAsUTC(new Date());
//    d.setMinutes(d.getMinutes()+480);
//    var ddate = d.getDate();
//    var dmonth = d.getMonth()+1;
//    var dyear = d.getFullYear();
//    var dhour = d.getHours();
//    var dminutes = d.getMinutes();
//    var dseconds = d.getSeconds();
//
//    if(ddate < 10){
//        ddate = "0"+ddate;
//    }
//    if(dmonth < 10){
//        dmonth = "0"+dmonth;
//    }
//
//    if(dhour < 10){
//        dhour = "0"+dhour;
//    }
//    if(dminutes < 10){
//        dminutes = "0"+dminutes;
//    }
//    if(dseconds < 10){
//        dseconds = "0"+dseconds;
//    }
//    
//    var newdate;
//    if(dhour < 12){
//        newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds+" AM";
//    }
//    else{
//        newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds+" PM";
//    }
    
    
    //console.log("request="+JSON.stringify(req.body));
    //console.log("request="+JSON.stringify(req.body.payload.date));

     var linen_list = req.body;
     //console.log("request="+JSON.stringify(linen_list.payload.tag));
     var tag = linen_list.payload.tag;
     var type = linen_list.payload.type;
     
     
     
    
    for(var i=0;i< tag.length;i++){
        console.log("type-- "+type);
        if(type === "Soil Linen"){
        con.query("INSERT INTO m_linen_record(id_linen,time,clean,soil) values ('"+tag[i]+"','"+req.body.payload.date+"','0','1')",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                    res.send(error);
                }
                else{
                    //res.send("OK");
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                }
            });
        }
        else{
         con.query("INSERT INTO m_linen_record(id_linen,time,clean,soil) values ('"+tag[i]+"','"+req.body.payload.date+"','1','0')",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                    res.send(error);
                }
                else{
                    //res.send("OK");
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                }
            });
        }
        //console.log(linen_list[i]);
    }
    res.send("OK");

});

//not using
app.get('/api/v1/getlinen',function(req,res){
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

//    var requestData = {
//            _id: "2018-03-13 02:11:34 AM",
//            payload: {
//              date: "2018-03-13 02:11:34 AM",
//              tag: [
//                "E280 1170 0000 0209 41BF 9044",
//                "E280 1170 0000 0209 41BF 4441",
//                "E280 1170 0000 0209 41BF 4442",
//                "E280 1170 0000 0209 41BF 4443",
//                "E280 1170 0000 0209 41BF 4444",
//                "E280 1170 0000 0209 41BF 4445",
//                "E280 1170 0000 0209 41BF 4446"
//              ],
//              type: "soil"
//            }
//          };
//          
     //var requestData = {"payload":{"date":"2018-03-15 09:46:30 AM","tag":["E280 1170 0000 0208 8D00 A299","E280 1170 0000 0208 8D00 C3DD","E280 1170 0000 0208 8D01 B90A","E280 1170 0000 0208 8D01 99C3"],"type":"soil"}}
     var requestData = {"payload":{"type":"clean","tag":["E280 1170 0000 0208 8D00 E48E","E280 1170 0000 0208 8D01 F2FA","E280 1170 0000 0208 8D02 52EC","E280 1170 0000 0208 8D02 02BE","E280 1170 0000 0208 8D02 31D5","E280 1170 0000 0208 8D01 3AB3","E280 1170 0000 0208 8D02 41D5","E280 1170 0000 0208 8D00 EBB7","E280 1170 0000 0208 8D01 E111","E280 1170 0000 0208 8D02 1D11","E280 1170 0000 0208 8D02 2BE9","E280 1170 0000 0208 8D01 D81B","E280 1170 0000 0208 8D00 FC76","E280 1170 0000 0208 8D02 3AAE","E280 1170 0000 0208 8D01 4AB4","E280 1170 0000 0208 8D00 B38F","E280 1170 0000 0208 8D01 88D0","E280 1170 0000 0208 8D02 2495","E280 1170 0000 0208 8D02 438E","E280 1170 0000 0208 8D02 0D04","E280 1170 0000 0208 8D01 B001","E280 1170 0000 0208 8D02 2423","E280 1170 0000 0208 8D01 EB5A","E280 1170 0000 0208 8D01 68D1","1000 0000 0000 0000 0000 0027","3008 33B2 DDD9 0140 0000 0000","3031 3032 3030 3030 3530 3030 3632 3830 3030 3030 3130 322D 3034 3030 3400","E280 1170 0000 0209 41BF 6013"]}}; 
//        var requestData = '"{\r\n \"_id\": \"2017-08-07 02:11:34 AM\",\r\n \"payload\": {\r\n  \"date\": \"2017-08-07 02:11:34 AM\",\r\n  \"tag\": [\r\n   \"3008 33B2 DDD9 0140 0000 0000 \",\r\n   \"E200 6806 0000 0000 0000 0000 \",\r\n   \"3008 33B2 0000 0006 0000 0000 \",\r\n   \"0000 0000 0000 2014 0000 0011 \",\r\n   \"1000 0000 0000 0000 0000 0002 \",\r\n   \"AAAA 0000 0012 D600 AAAA AAAA \",\r\n  ],\r\n  \"type\": \"Clean linen\"\r\n }\r\n}"';
        //var requestData = '{"_id": "2018-03-13 02:11:34 AM","payload": {"date": "2018-03-13 02:11:34 AM",  "tag": [  "3008 33B2 DDD9 0140 0000 0000 ",   "E200 6806 0000 0000 0000 0000 ",   "3008 33B2 0000 0006 0000 0000 ",   "0000 0000 0000 2014 0000 0011 ",   "1000 0000 0000 0000 0000 0002 ",   "AAAA 0000 0012 D600 AAAA AAAA "  ],  "type": "clean" }}';
//        var requestData = ["999111"];
//         requestData = requestData.replace(/(?:\r\n|\r|\n|)/g, '');
//         requestData = requestData.replace(/\\"/g, '/"/');
//         requestData = requestData.replace(/,  ]/g, ']');
//         requestData = requestData.replace(/"{/g, '{');
//         requestData = requestData.replace(/}"/g, '}');
          //console.log("request=--"+requestData);
//          
//          var json_parse = JSON.parse(requestData);
//          console.log(json_parse);
    request({
            url: "http://localhost:3000/api/v1/linen",
            method: "POST",
            json: true,   // <--Very important!!!
            body:requestData
        }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
//        var json_string = JSON.parse(body);
//        res.status(200).send(json_string);
     }
     else{
         console.log("error="+error);
     }
    });
});

app.post('/api/v1/linen',function(req,res){
    
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
//    console.log(req.body);      // your JSON
//    res.send(req.body);    // echo the result back

//    var d = createDateAsUTC(new Date());
//    d.setMinutes(d.getMinutes()+480);
//    var ddate = d.getDate();
//    var dmonth = d.getMonth()+1;
//    var dyear = d.getFullYear();
//    var dhour = d.getHours();
//    var dminutes = d.getMinutes();
//    var dseconds = d.getSeconds();
//
//    if(ddate < 10){
//        ddate = "0"+ddate;
//    }
//    if(dmonth < 10){
//        dmonth = "0"+dmonth;
//    }
//
//    if(dhour < 10){
//        dhour = "0"+dhour;
//    }
//    if(dminutes < 10){
//        dminutes = "0"+dminutes;
//    }
//    if(dseconds < 10){
//        dseconds = "0"+dseconds;
//    }
//    
//    var newdate;
//    if(dhour < 12){
//        newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds+" AM";
//    }
//    else{
//        newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds+" PM";
//    }
    
    //console.log("nnn isddeed");
    //console.log("request="+JSON.stringify(req.body));
    //console.log("request="+JSON.stringify(req.body.payload.date));

     var linen_list = req.body;
     //console.log("request="+JSON.stringify(linen_list.payload.tag));
     var tag = linen_list.payload.tag;
     var type = linen_list.payload.type;
     
     var d = createDateAsUTC(new Date());
    d.setMinutes(d.getMinutes()+480);
    var ddate = d.getDate();
    var dmonth = d.getMonth()+1;
    var dyear = d.getFullYear();
    var dhour = d.getHours();
    var dminutes = d.getMinutes();
    var dseconds = d.getSeconds();

    if(ddate < 10){
        ddate = "0"+ddate;
    }
    if(dmonth < 10){
        dmonth = "0"+dmonth;
    }

    if(dhour < 10){
        dhour = "0"+dhour;
    }
    if(dminutes < 10){
        dminutes = "0"+dminutes;
    }
    if(dseconds < 10){
        dseconds = "0"+dseconds;
    }
    
    var newdate;
    newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;
     
     
//     console.log(linen_list);
//     console.log(tag);
//     console.log(type);
    
    for(var i=0;i< tag.length;i++){
        console.log("type-- "+type);
        if(type === "soil"){
        con.query("INSERT INTO m_linen_record(id_linen,time,soil) values ('"+tag[i]+"','"+newdate+"','1')",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query1 '+error);
                    res.send("error1="+error);
                }
                else{
                    //res.send("OK");
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                }
            });
        }
        else if(type === "clean"){
         con.query("INSERT INTO m_linen_record(id_linen,time,clean) values ('"+tag[i]+"','"+newdate+"','1')",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query2 '+error);
                    res.send("error2="+error);
                }
                else{
                    //res.send("OK");
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                }
            });
        }
        else if(type === "housekeeping"){
         con.query("INSERT INTO m_linen_record(id_linen,time,housekeeping) values ('"+tag[i]+"','"+newdate+"','1')",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query3 '+error);
                    res.send("error3="+error);
                }
                else{
                    //res.send("OK");
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                }
            });
        }
        else if(type === "reject"){
         con.query("INSERT INTO m_linen_record(id_linen,time,reject) values ('"+tag[i]+"','"+newdate+"','1')",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query4 '+error);
                    res.send("error4="+error);
                }
                else{
                    //res.send("OK");
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                }
            });
        }
        else if(type === "new"){
         con.query("INSERT INTO m_linen_record(id_linen,time,newlinen) values ('"+tag[i]+"','"+newdate+"','1')",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query5 '+error);
                    res.send("error5="+error);
                }
                else{
                    //res.send("OK");
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                }
            });
        }
        else if(type === "ward"){
         var ward_name = linen_list.payload.ward_name;
         con.query("INSERT INTO m_linen_record(id_linen,time,ward,ward_name) values ('"+tag[i]+"','"+newdate+"','1','"+ward_name+"')",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query6 '+error);
                    res.send("error6="+error);
                }
                else{
                    //res.send("OK");
                    //console.log('Successful query fff\n');
                    //console.log(rows);
                }
            });
        }
        //console.log(linen_list[i]);
    }
    res.status(200).send(tag);
//    // Website you wish to allow to connect
//    res.setHeader('Access-Control-Allow-Origin', '*');
//
//    // Request methods you wish to allow
//    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//
//    // Request headers you wish to allow
//    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//
//    // Set to true if you need the website to include cookies in the requests sent
//    // to the API (e.g. in case you use sessions)
//    res.setHeader('Access-Control-Allow-Credentials', true);
////    console.log(req.body);      // your JSON
////    res.send(req.body);    // echo the result back
//
//    var d = createDateAsUTC(new Date());
//    d.setMinutes(d.getMinutes()+480);
//    var ddate = d.getDate();
//    var dmonth = d.getMonth()+1;
//    var dyear = d.getFullYear();
//    var dhour = d.getHours();
//    var dminutes = d.getMinutes();
//    var dseconds = d.getSeconds();
//
//    if(ddate < 10){
//        ddate = "0"+ddate;
//    }
//    if(dmonth < 10){
//        dmonth = "0"+dmonth;
//    }
//
//    if(dhour < 10){
//        dhour = "0"+dhour;
//    }
//    if(dminutes < 10){
//        dminutes = "0"+dminutes;
//    }
//    if(dseconds < 10){
//        dseconds = "0"+dseconds;
//    }
//    
//    var newdate;
//    if(dhour < 12){
//        newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds+" AM";
//    }
//    else{
//        newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds+" PM";
//    }
//    
//    
//    //console.log("request="+JSON.stringify(req.body));
////          
////    var json_parse = JSON.parse(requestData);
////    console.log(json_parse);
//          
////    console.log("readlinen="+JSON.stringify(req.body.payload.tag));
////    var linen_list = req.body.payload.tag;
//     var linen_list = req.body;
//    
//    for(var i=0;i< linen_list.length;i++){
//         con.query("INSERT INTO linen_record(id_linen,time,clean,soil) values ('"+linen_list[i]+"','"+newdate+"','1','0')",function(error,rows,fields){
//                if(!!error){
//                    console.log('Error in the query '+error);
//                    res.send(error);
//                }
//                else{
//                    //res.send("OK");
//                    //console.log('Successful query fff\n');
//                    //console.log(rows);
//                }
//            });
//    }
//    
//    res.status(200).send(linen_list);
    
//    var requestData = {
//            _id: newdate,
//            payload: {
//              date: newdate,
//              tag: linen_list,
//              type: "Clean linen"
//            }
//          };
//          
//          console.log(requestData);

//    res.status(200).send(linen_list);

        
            
//    request({
//            url: "https://2ebe9a26-77dc-4a2a-8d04-f0e71aa7be33-bluemix:5955f41a11cafa7f0fdab3d9ea320dc239fdc37b8970d4d97d80de78c5ba9779@2ebe9a26-77dc-4a2a-8d04-f0e71aa7be33-bluemix.cloudant.com/linen/",
//            method: "POST",
//            json: true,   // <--Very important!!!
//            body: requestData
//        }, function (error, response, body){
//            if (!error && response.statusCode === 200) {
//                res.status(200).send(linen_list);
//             }
//             else{
//                 res.send(error);
//                 console.log("error+="+error);
//             }
//        });
});

app.get('/api/v1/timestamp',function(req,res){
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    var d = createDateAsUTC(new Date());
    d.setMinutes(d.getMinutes()+480);
    var ddate = d.getDate();
    var dmonth = d.getMonth()+1;
    var dyear = d.getFullYear();
    var dhour = d.getHours();
    var dminutes = d.getMinutes();
    var dseconds = d.getSeconds();

    if(ddate < 10){
        ddate = "0"+ddate;
    }
    if(dmonth < 10){
        dmonth = "0"+dmonth;
    }

    if(dhour < 10){
        dhour = "0"+dhour;
    }
    if(dminutes < 10){
        dminutes = "0"+dminutes;
    }
    if(dseconds < 10){
        dseconds = "0"+dseconds;
    }

    var newdate = ddate+"-"+dmonth+"-"+dyear+" "+dhour+":"+dminutes+":"+dseconds;
    var timezone = d.getTimezoneOffset();
//    console.log("timezone="+timezone);
//    console.log("timezone+minute ="+d.getMinutes()+d.getTimezoneOffset());
    res.status(200).send(newdate);
    

});

//-------------------------REST API------------------------------------

//-------------------------PUSH NOTIFICATION----------------------------

app.get('/push_notification', function(req, res){
    //        con.query("SELECT user_gcm_id from users where status user_right='Administrator' OR user_right='Assets Operator'",function(error,rows,fields){
//            });
    
        var gcm_id = [];
        con.query("SELECT user_gcm_id from m_users where user_right='Administrator'",function(error,rows,fields){
//            console.log("rows="+JSON.stringify(rows));
               for(var i=0; i<rows.length;i++){
            
                gcm_id.push(rows[i].user_gcm_id);
            }
            //console.log("rows gcm id="+JSON.stringify(gcm_id));
            
            var message = new gcm.Message({data: {message: 'message from it'}});
                    var regTokens = gcm_id; 
//                    var regTokens = ['exoB6Ml0m8s:APA91bFTZ5RF2sFvN2UVXq_1O8lWxbKOytidybJ7WkvZJB9--XTEhYVEZ4ZpNkWIFjtROkf93u7ZvSXByYk1fl25GwGWdYof5jMleYdSLd81uD0VuWXvNfuBYLfe3GpoFGFGD0X3jWUl']; //device id
                    //var regTokens = 'exoB6Ml0m8s:APA91bFTZ5RF2sFvN2UVXq_1O8lWxbKOytidybJ7WkvZJB9--XTEhYVEZ4ZpNkWIFjtROkf93u7ZvSXByYk1fl25GwGWdYof5jMleYdSLd81uD0VuWXvNfuBYLfe3GpoFGFGD0X3jWUl';
                    var sender = new gcm.Sender('AIzaSyDUBUAM9ixcvRUTAQhP8avktBzvH551SWY'); //server key
                    sender.send(message, { registrationTokens: regTokens }, function (err, response) {

                            if (err){
                                    
                                    console.log('error message '+error);
                                    console.error(err);
                                   // callback('error message');

                            } else 	{
                                    //console.log('success message');
                                    //console.log(response);
                                    //callback('success message');
                            }

                    }); 
            
            
            });

            
//	var message = new gcm.Message({data: {message: 'send messagegeg'}});
//                    var regTokens = ['exoB6Ml0m8s:APA91bFTZ5RF2sFvN2UVXq_1O8lWxbKOytidybJ7WkvZJB9--XTEhYVEZ4ZpNkWIFjtROkf93u7ZvSXByYk1fl25GwGWdYof5jMleYdSLd81uD0VuWXvNfuBYLfe3GpoFGFGD0X3jWUl']; //device id
//                    //var regTokens = 'exoB6Ml0m8s:APA91bFTZ5RF2sFvN2UVXq_1O8lWxbKOytidybJ7WkvZJB9--XTEhYVEZ4ZpNkWIFjtROkf93u7ZvSXByYk1fl25GwGWdYof5jMleYdSLd81uD0VuWXvNfuBYLfe3GpoFGFGD0X3jWUl';
//                    var sender = new gcm.Sender('AIzaSyDUBUAM9ixcvRUTAQhP8avktBzvH551SWY'); //server key
//                    sender.send(message, { registrationTokens: regTokens }, function (err, response) {
//
//                            if (err){
//                                    
//                                    console.log('error message');
//                                    console.error(err);
//                                   // callback('error message');
//
//                            } else 	{
//                                    console.log('success message');
//                                    console.log(response);
//                                    //callback('success message');
//                            }
//
//                    }); 
});

function createDateAsUTC(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
}

function dateFormatChange(dates){
        //console.log("dates-- "+dates);
        
        var newdate = dates.split(" ");
        //console.log("datesplit-- ");
        var newhour = newdate[1].split(":");
        //console.log("newhour-- ");
        var hhour,daytime;
        //console.log(newhour[0]);
        if(newhour[0] > 12){
            hhour = newhour[0]-12;
            if(hhour < 10){
            hhour = "0"+hhour;
            }
            daytime = "PM";
        }
        else{
            hhour = newhour[0];
            daytime = "AM";
        }
        
        var getdate = newdate[0]+" "+hhour+":"+newhour[1]+":"+newhour[2]+" "+daytime;
        //console.log("getdate--"+getdate);
        var d = new Date(getdate);
        
        //d.setMinutes(d.getMinutes()+480);
        var ddate = d.getDate();
        var dmonth = d.getMonth()+1;
        var dyear = d.getFullYear();
        var dhour = d.getHours();
        var dminutes = d.getMinutes();
        var dseconds = d.getSeconds();

        if(ddate < 10){
            ddate = "0"+ddate;
        }
        
        if(dmonth < 10){
            dmonth = "0"+dmonth;
        }
        
        if(dhour < 10){
            dhour = "0"+dhour;
        }
        
        if(dminutes < 10){
            dminutes = "0"+dminutes;
        }
        
        if(dseconds < 10){
            dseconds = "0"+dseconds;
        }
        
        var newdate;
        if(newhour[0] < 12){
            newdate = ddate+"-"+dmonth+"-"+dyear+" "+hhour+":"+dminutes+":"+dseconds+" AM";
        }
        else{
            newdate = ddate+"-"+dmonth+"-"+dyear+" "+hhour+":"+dminutes+":"+dseconds+" PM";
        }
        
        return newdate;
    }
    
function dateFormatChangeNew(dates) {
        
        var d = new Date(dates);
        
        //d.setMinutes(d.getMinutes()+480);
        var ddate = d.getDate();
        var dmonth = d.getMonth()+1;
        var dyear = d.getFullYear();
        var dhour = d.getHours();
        var dminutes = d.getMinutes();
        var dseconds = d.getSeconds();

        if(ddate < 10){
            ddate = "0"+ddate;
        }
        
        if(dmonth < 10){
            dmonth = "0"+dmonth;
        }
        
        if(dhour < 10){
            dhour = "0"+dhour;
        }
        
        if(dminutes < 10){
            dminutes = "0"+dminutes;
        }
        
        if(dseconds < 10){
            dseconds = "0"+dseconds;
        }
        

        var newdate;
        if(dhour < 12){
            newdate = ddate+"-"+dmonth+"-"+dyear+" "+dhour+":"+dminutes+":"+dseconds+" AM";
        }
        else{
            dhour = dhour-12;
            if(dhour < 10){
            dhour = "0"+dhour;
            }
            newdate = ddate+"-"+dmonth+"-"+dyear+" "+dhour+":"+dminutes+":"+dseconds+" PM";
        }
        
        return newdate;
    }

//----------------------------PUSH NOTIFICATION------------------------------

var appClientConfig = {
    "org": 'um8ctw',
    "id": Date.now()+"",
    "auth-key": 'a-um8ctw-nxnfkepxwy',
    "auth-token": 'ewco+AvOOItsISLUa@',
    "type" : "shared" // make this connection as shared subscription
  };
  var appClient = new Client.IotfApplication(appClientConfig);

  appClient.connect();

  appClient.on("connect", function () {

      appClient.subscribeToDeviceEvents();
  });

  appClient.on("error", function (err) {
      console.log("Error : "+err);
  });


appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
    
//    if(eventType === "reader"){
//        var json_string = JSON.parse(payload);
//        console.log("json stirng="+JSON.stringify(json_string));
//    }
    
    
    if(eventType === "event"){
    var json_string = JSON.parse(payload);
    //console.log("json stirng="+JSON.stringify(json_string));
    
    con.query('SELECT zone_id from m_zone where zone_reader_id = "'+json_string.d.reader_id+'"',function(err,rows){
        if(rows !== undefined){
        if(rows.length !== 0){
         var last_zone = rows[0].zone_id;
         //console.log("zone idd="+last_zone);
         var assets_last_map;
         if(last_zone === '2' || last_zone === 2){
             assets_last_map = 'uploads/map/icu_smc3_icu1.png';
         }
         if(last_zone === '12' || last_zone === 12){
             assets_last_map = 'uploads/map/icu_smc3_icu2.png';
         }
         if(last_zone === '32' || last_zone === 32){
             assets_last_map = 'uploads/map/icu_smc3_icu3.png';
         }
         
         //console.log("assets_last_map="+assets_last_map);
         con.query('UPDATE m_assets set assets_last_datetime="'+json_string.d.date+'",assets_last_location="'+last_zone+'",trigger_id="'+json_string.d.trigger_source+'",assets_last_map="'+assets_last_map+'",assets_rssi="'+json_string.d.rssi+'",battery="'+json_string.d.batt+'" where assets_rfid ="'+json_string.d.addr+'"',function(err,rows){
         
         });
         
//       }
//    }
//    });
   
//    con.query('UPDATE assets set assets_last_datetime="'+json_string.d.date+'",assets_last_location="'+last_zone+'" where assets_rfid ="'+json_string.d.addr+'"',function(err,rows){
//         
//    });
    
//    con.query('UPDATE assets set assets_last_datetime="'+json_string.d.date+'" where assets_rfid ="'+json_string.d.addr+'"',function(err,rows){
//         
//    });
    
    con.query('SELECT * FROM m_assets where assets_rfid = "'+json_string.d.addr+'"',function(err,rows){
            if(err) throw err;
            for(var i=0;i< rows.length; i++){
            
            var d = new Date(rows[0].assets_last_datetime);
                var ddate = d.getDate();
                var dmonth = d.getMonth()+1;
                var dyear = d.getFullYear();
                var dhour = d.getHours();
                var dminutes = d.getMinutes();
                var dseconds = d.getSeconds();

                if(ddate < 10){
                    ddate = "0"+ddate;
                }
                if(dmonth < 10){
                    dmonth = "0"+dmonth;
                }

                if(dhour < 10){
                    dhour = "0"+dhour;
                }
                if(dminutes < 10){
                    dminutes = "0"+dminutes;
                }
                if(dseconds < 10){
                    dseconds = "0"+dseconds;
                }

                
            var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;
                
            var asset_rfid = rows[i].assets_rfid;
            var asset_no = rows[i].assets_no;
            var assets_zone = rows[i].assets_zone;
            var assets_last_location = rows[i].assets_last_location;
            
            var rssi = rows[i].assets_rssi;
            var trigger_id = rows[i].trigger_id;
            var email_send = rows[i].email_send;
            
            
            //------------------UNAUTHORIZED TRIGGER----------------------
            if(trigger_id === "1"){
            //console.log("unauthorized-- "+asset_rfid);
            con.query('SELECT * FROM m_unauthorized where un_tag_id="'+asset_rfid+'"',function(err,rows){
                if(err) throw err;
                else{
                    if(rows.length === 0){
                        con.query('INSERT into m_unauthorized (un_tag_id,un_assets_id,un_assigned_loc,un_last_location,un_date_time_move) values ("'+asset_rfid+'","'+asset_no+'","'+assets_zone+'","'+assets_last_location+'","'+newdate+'")',function(err,rows){
                            if(err) throw err;
                          }); 
                    }
                }
              }); 
             
            }
            
            
             //----------------SENDING EMAIL TRIGGER-------------------------
//            if(trigger_id === "1" && email_send === "0"){
//               transporter.sendMail(mailOptionsTrigger, function(error, info){
//                if (error) {
//                  console.log(error);
//                  next();
//                } else {
//                  console.log(json_string.d.addr+' Email sent: ' + info.response);
//                   con.query('UPDATE assets set email_send="1" where assets_rfid ="'+json_string.d.addr+'"',function(err,rows){
//         
//                     });
//                  next();
//                }
//              });
//          }

            //----------------SENDING EMAIL TRIGGER-------------------------
            
            
             //--------------OFF FOR HISTORY & MONITORING------------------------
             if((assets_last_location !== null || assets_last_location !== 'null') && rssi > -80){
            con.query('SELECT * from m_history where history_tag_id ="'+asset_rfid+'" order by history_date_time_move desc limit 1',function(err,rows){
                  if(err) throw err;
                  else{
                      
                   if(rows.length === 0){
//                       console.log("in here 1");
                        con.query('INSERT into m_history (history_tag_id,history_assets_id,history_assigned_loc,history_last_location,history_date_time_move) values ("'+asset_rfid+'","'+asset_no+'","'+assets_zone+'","'+assets_last_location+'","'+newdate+'")',function(err,rows){
                       if(err) throw err;
                     });  
                  }
                  
                  else{
                      
                      var previous_location = rows[0].history_last_location;
//                      console.log("asset last location="+assets_last_location+"  previous location="+previous_location);
                      if(assets_last_location !== previous_location){
//                          console.log("in here 2");
                         con.query('INSERT into m_history (history_tag_id,history_assets_id,history_assigned_loc,history_last_location,history_date_time_move) values ("'+asset_rfid+'","'+asset_no+'","'+assets_zone+'","'+assets_last_location+'","'+newdate+'")',function(err,rows){
                             if(err) throw err;
                           });  
//                              transporter.sendMail(mailOptionsUnauthorized, function(error, info){
//                              if (error) {
//                                console.log(error);
//                                next();
//                              } else {
//                                console.log('Email sent: ' + info.response);
//                                next();
//                              }
//                            });

                              io.emit('unauthorized', 'Asset '+asset_rfid+' is at '+assets_last_location+' on '+newdate);
                               
                           }
                  }
                  
               }
                }); 
                
            
            }
             //--------------OFF FOR HISTORY & MONITORING------------------------
                 }
                });
               
                }
             }
             });
            }
            
//    if(eventType === "reader"){
//    var json_string = JSON.parse(payload);
//    //console.log("json stirng="+JSON.stringify(json_string));
//    
//    con.query('SELECT zone_id from zone where zone_reader_id = "'+json_string.d.reader_id+'"',function(err,rows){
//        if(rows !== undefined){
//        if(rows.length !== 0){
//         var last_zone = rows[0].zone_id;
//         //console.log("zone idd="+last_zone);
//         var assets_last_map;
//         if(last_zone === '64' || last_zone === 64){
//             assets_last_map = 'uploads/map/icu_smc3_icu1.png';
//         }
//         if(last_zone === '71' || last_zone === 71){
//             assets_last_map = 'uploads/map/icu_smc3_icu2.png';
//         }
//         //console.log("assets_last_map="+assets_last_map);
//         con.query('UPDATE assets set assets_last_datetime="'+json_string.d.date+'",assets_last_location="'+last_zone+'",trigger_id="'+json_string.d.trigger_source+'",assets_last_map="'+assets_last_map+'",assets_rssi="'+json_string.d.rssi+'",battery="'+json_string.d.batt+'" where assets_rfid ="'+json_string.d.addr+'"',function(err,rows){
//         
//         });
//
//    
//    con.query('SELECT * FROM assets where assets_rfid = "'+json_string.d.addr+'"',function(err,rows){
//            if(err) throw err;
//            for(var i=0;i< rows.length; i++){
//            
//            var d = new Date(rows[0].assets_last_datetime);
//                var ddate = d.getDate();
//                var dmonth = d.getMonth()+1;
//                var dyear = d.getFullYear();
//                var dhour = d.getHours();
//                var dminutes = d.getMinutes();
//                var dseconds = d.getSeconds();
//
//                if(ddate < 10){
//                    ddate = "0"+ddate;
//                }
//                if(dmonth < 10){
//                    dmonth = "0"+dmonth;
//                }
//
//                if(dhour < 10){
//                    dhour = "0"+dhour;
//                }
//                if(dminutes < 10){
//                    dminutes = "0"+dminutes;
//                }
//                if(dseconds < 10){
//                    dseconds = "0"+dseconds;
//                }
//
//                
//            var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;
//                
//            var asset_rfid = rows[i].assets_rfid;
//            var asset_no = rows[i].assets_no;
//            var assets_zone = rows[i].assets_zone;
//            var assets_last_location = rows[i].assets_last_location;
//            
//            var rssi = rows[i].assets_rssi;
//            var trigger_id = rows[i].trigger_id;
//            var email_send = rows[i].email_send;
//            
//            
//            //------------------UNAUTHORIZED TRIGGER----------------------
//            if(trigger_id === "1"){
//            //console.log("unauthorized-- "+asset_rfid);
//            con.query('SELECT * FROM unauthorized where un_tag_id="'+asset_rfid+'"',function(err,rows){
//                if(err) throw err;
//                else{
//                    if(rows.length === 0){
//                        con.query('INSERT into unauthorized (un_tag_id,un_assets_id,un_assigned_loc,un_last_location,un_date_time_move) values ("'+asset_rfid+'","'+asset_no+'","'+assets_zone+'","'+assets_last_location+'","'+newdate+'")',function(err,rows){
//                            if(err) throw err;
//                          }); 
//                    }
//                }
//              }); 
//             
//            }
//            
//            
//             //----------------SENDING EMAIL TRIGGER-------------------------
////            if(trigger_id === "1" && email_send === "0"){
////               transporter.sendMail(mailOptionsTrigger, function(error, info){
////                if (error) {
////                  console.log(error);
////                  next();
////                } else {
////                  console.log(json_string.d.addr+' Email sent: ' + info.response);
////                   con.query('UPDATE assets set email_send="1" where assets_rfid ="'+json_string.d.addr+'"',function(err,rows){
////         
////                     });
////                  next();
////                }
////              });
////          }
//
//            //----------------SENDING EMAIL TRIGGER-------------------------
//            
//            
//             //--------------OFF FOR HISTORY & MONITORING------------------------
//             if((assets_last_location !== null || assets_last_location !== 'null') && rssi > -80){
//            con.query('SELECT * from history where history_tag_id ="'+asset_rfid+'" order by history_date_time_move desc limit 1',function(err,rows){
//                  if(err) throw err;
//                  else{
//                      
//                   if(rows.length === 0){
////                       console.log("in here 1");
//                        con.query('INSERT into history (history_tag_id,history_assets_id,history_assigned_loc,history_last_location,history_date_time_move) values ("'+asset_rfid+'","'+asset_no+'","'+assets_zone+'","'+assets_last_location+'","'+newdate+'")',function(err,rows){
//                       if(err) throw err;
//                     });  
//                  }
//                  
//                  else{
//                      
//                      var previous_location = rows[0].history_last_location;
////                      console.log("asset last location="+assets_last_location+"  previous location="+previous_location);
//                      if(assets_last_location !== previous_location){
////                          console.log("in here 2");
//                         con.query('INSERT into history (history_tag_id,history_assets_id,history_assigned_loc,history_last_location,history_date_time_move) values ("'+asset_rfid+'","'+asset_no+'","'+assets_zone+'","'+assets_last_location+'","'+newdate+'")',function(err,rows){
//                             if(err) throw err;
//                           });  
////                              transporter.sendMail(mailOptionsUnauthorized, function(error, info){
////                              if (error) {
////                                console.log(error);
////                                next();
////                              } else {
////                                console.log('Email sent: ' + info.response);
////                                next();
////                              }
////                            });
//
//                              io.emit('unauthorized', 'Asset '+asset_rfid+' is at '+assets_last_location+' on '+newdate);
//                               
//                           }
//                  }
//                  
//               }
//                }); 
//                
//            
//            }
//             //--------------OFF FOR HISTORY & MONITORING------------------------
//                 }
//                });
//               
//                }
//             }
//             });
//            }
            
    if(eventType === "sensor"){
          var json_sensor = JSON.parse(payload);
          //console.log("sensor=="+JSON.stringify(json_sensor));
          //var temp_t = json_sensor.d.temperature.split("C");
          //var temp = temp_t[0];
          con.query('UPDATE m_environment set temp_env="'+json_sensor.d.temperature+'",humidity_env="'+json_sensor.d.humidity+'", air_q_env="'+json_sensor.d.dust_level+'",co_env="'+json_sensor.d.CO+'",co2_env="'+json_sensor.d.co2+'",tvoc_env="'+json_sensor.d.tvoc+'",timestamp_env="'+json_sensor.d.date+'" where reader_id ="'+json_sensor.d.reader+'"',function(err,rows){
         
            });
            
            var location = "";
            if(json_sensor.d.reader === "sensor_1"){
                location = "ICU";
            }
            else if(json_sensor.d.reader === "sensor_2"){
                location = "ICU 2";
            }
            else if(json_sensor.d.reader === "sensor_3"){
                location = "LAB 2";
            }
            
            
            if(json_sensor.d.temperature < 19 || json_sensor.d.temperature > 22){
                con.query('INSERT INTO m_notification_env(temp_env,humidity_env,air_q_env,co2_env,co_env,timestamp_env,location_env,reader_id,tvoc_env) values("'+json_sensor.d.temperature+'","'+json_sensor.d.humidity+'","'+json_sensor.d.dust_level+'","'+json_sensor.d.co2+'","'+json_sensor.d.CO+'","'+json_sensor.d.date+'","'+location+'","'+json_sensor.d.reader+'","'+json_sensor.d.tvoc+'")',function(err,rows){
                    if(err) {
                        throw err;
                        console.log("Error : "+err);
                    }
                    else{
                        //console.log("success1");
                    }
            });
            }
            
            if(json_sensor.d.humidity < 50 || json_sensor.d.humidity > 65){
                con.query('INSERT INTO m_notification_env(temp_env,humidity_env,air_q_env,co2_env,co_env,timestamp_env,location_env,reader_id,tvoc_env) values("'+json_sensor.d.temperature+'","'+json_sensor.d.humidity+'","'+json_sensor.d.dust_level+'","'+json_sensor.d.co2+'","'+json_sensor.d.CO+'","'+json_sensor.d.date+'","'+location+'","'+json_sensor.d.reader+'","'+json_sensor.d.tvoc+'")',function(err,rows){
                    if(err) {
                        throw err;
                        console.log("Error : "+err);
                    }
                    else{
                        //console.log("success2");
                    }
            });
            }
          con.query('INSERT INTO m_environment_record(temp_env,humidity_env,air_q_env,co2_env,co_env,timestamp_env,location_env,reader_id,tvoc_env) values("'+json_sensor.d.temperature+'","'+json_sensor.d.humidity+'","'+json_sensor.d.dust_level+'","'+json_sensor.d.co2+'","'+json_sensor.d.CO+'","'+json_sensor.d.date+'","'+location+'","'+json_sensor.d.reader+'","'+json_sensor.d.tvoc+'")',function(err,rows){
                    if(err) {
                        throw err;
                        console.log("Error : "+err);
                    }
                    else{
                        //console.log("success3");
                    }
            });
      }
                

});

app.get('/map', isAuthenticated, function(req, res, next) {
    //console.log('map connected **');
  res.render('map', { title: 'Map' });
});

 var dateNow;
 setInterval(function(){ 
       dateNow = new Date();
  }, 20000);
  
  
io.on('connection', function (socket) {
//    console.log('a client connected');
    var d = new Date();
    //d.setMinutes(d.getMinutes()+480);
    var ddate = d.getDate();
    var dmonth = d.getMonth()+1;
    var dyear = d.getFullYear();
    
    con.query("SELECT assets_item_desc,assets_img_path,assets_no,assets_zone,assets_rfid,assets_last_datetime,assets_last_location FROM m_assets where assets_last_location = '2' and year(assets_last_datetime) = '"+dyear+"' and month(assets_last_datetime) = '"+dmonth+"' and day(assets_last_datetime) = '"+ddate+"'",function(err,rows){
         if(err) throw err;

         socket.emit('showrows', rows);
       });
       
    setInterval(function(){ 
       con.query('SELECT assets_item_desc,assets_img_path,assets_no,assets_zone,assets_rfid,assets_last_datetime,assets_last_location FROM m_assets where assets_last_location = "2" and year(assets_last_datetime) = "'+dyear+'" and month(assets_last_datetime) = "'+dmonth+'" and day(assets_last_datetime) = "'+ddate+'"',function(err,rows){
         if(err) throw err;

         socket.emit('showrows', rows);
       });
       }, 20000);

 });

io.on('connection', function (socket) {
//    console.log('a client connected');

     var d = new Date();
    //d.setMinutes(d.getMinutes()+480);
    var ddate = d.getDate();
    var dmonth = d.getMonth()+1;
    var dyear = d.getFullYear();
    
    con.query('SELECT assets_item_desc,assets_img_path,assets_no,assets_zone,assets_rfid,assets_last_datetime,assets_last_location FROM m_assets where assets_last_location = "12" and year(assets_last_datetime) = "'+dyear+'" and month(assets_last_datetime) = "'+dmonth+'" and day(assets_last_datetime) = "'+ddate+'"',function(err,rows){
         if(err) throw err;
//         console.log('Data received from Db:\n');
//         console.log("data from db="+JSON.stringify(rows));
         socket.emit('showrows2', rows);
       });
    setInterval(function(){ 
       con.query('SELECT assets_item_desc,assets_img_path,assets_no,assets_zone,assets_rfid,assets_last_datetime,assets_last_location FROM m_assets where assets_last_location = "12" and year(assets_last_datetime) = "'+dyear+'" and month(assets_last_datetime) = "'+dmonth+'" and day(assets_last_datetime) = "'+ddate+'"',function(err,rows){
         if(err) throw err;
//         console.log('Data received from Db:\n');
//         console.log("data from db="+JSON.stringify(rows));
         socket.emit('showrows2', rows);
       });
       }, 20000);

 });
 
io.on('connection', function (socket) {
//    console.log('a client connected');
    var d = new Date();
    //d.setMinutes(d.getMinutes()+480);
    var ddate = d.getDate();
    var dmonth = d.getMonth()+1;
    var dyear = d.getFullYear();
    
    con.query('SELECT assets_item_desc,assets_img_path,assets_no,assets_zone,assets_rfid,assets_last_datetime,assets_last_location FROM m_assets where assets_last_location = "32" and year(assets_last_datetime) = "'+dyear+'" and month(assets_last_datetime) = "'+dmonth+'" and day(assets_last_datetime) = "'+ddate+'"',function(err,rows){
         if(err) throw err;
//         console.log('Data received from Db:\n');
//         console.log("data from db="+JSON.stringify(rows));
         socket.emit('showrows3', rows);
       });
    setInterval(function(){ 
       con.query('SELECT assets_item_desc,assets_img_path,assets_no,assets_zone,assets_rfid,assets_last_datetime,assets_last_location FROM m_assets where assets_last_location = "32" and year(assets_last_datetime) = "'+dyear+'" and month(assets_last_datetime) = "'+dmonth+'" and day(assets_last_datetime) = "'+ddate+'"',function(err,rows){
         if(err) throw err;
//         console.log('Data received from Db:\n');
//         console.log("data from db="+JSON.stringify(rows));
         socket.emit('showrows3', rows);
       });
       }, 20000);

 });
 
io.on('connection', function (socket) {
//    console.log('a client connected');
    con.query('SELECT * FROM m_environment',function(err,rows){
         if(err) throw err;
         //console.log('Data received from Db:\n');
         //console.log("data from db="+JSON.stringify(rows));
         socket.emit('environment', rows);
       });
       
    setInterval(function(){ 
       con.query('SELECT * FROM m_environment',function(err,rows){
         if(err) throw err;
         //console.log('Data received from Db:\n');
         //console.log("data from db="+JSON.stringify(rows));
         socket.emit('environment', rows);
       });
       }, 60000);

 });
 
io.on('connection', function (socket) {
//    console.log('a client connected');
    con.query('SELECT * FROM m_notification_env order by timestamp_env desc limit 5',function(err,rows){
         if(err) throw err;
//         console.log('Data received from Db:\n');
//         console.log("data from db="+JSON.stringify(rows));
         socket.emit('notification', rows);
       });
       
    setInterval(function(){ 
       con.query('SELECT * FROM m_notification_env order by timestamp_env desc limit 5',function(err,rows){
         if(err) throw err;
//         console.log('Data received from Db:\n');
//         console.log("repeat data from db="+JSON.stringify(rows));
         socket.emit('notification', rows);
       });
       }, 10000);

 });
 
 
passport.use('local', new LocalStrategy({

  usernameField: 'username',

  passwordField: 'password',

  passReqToCallback: true //passback entire req to call back
} , function (req, username, password, done){


      if(!username || !password ) { return done(null, false, req.flash('message','All fields are required.')); }

      var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';

      con.query("select * from m_users where username = ?", [username], function(err, rows){

          console.log("errrr1-"+err); //console.log(rows);

        if (err) return done(req.flash('message',err));

        if(!rows.length){ return done(null, false, req.flash('message','Invalid username or password.')); }

//        salt = salt+''+password;
//
//        var encPassword = crypto.createHash('sha1').update(salt).digest('hex');

        var encPassword = password;
        var dbPassword  = rows[0].password;
        var db_user_id  = rows[0].users_id;

        if(!(dbPassword === encPassword)){

            return done(null, false, req.flash('message','Invalid username or password.'));

         }
         
         if(dbPassword === encPassword){
            var d = new Date();
            var ddate = d.getDate();
            var dmonth = d.getMonth()+1;
            var dyear = d.getFullYear();
            var dhour = d.getHours();
            var dminutes = d.getMinutes();
            var dseconds = d.getSeconds();

            if(ddate < 10){
                ddate = "0"+ddate;
            }
            if(dmonth < 10){
                dmonth = "0"+dmonth;
            }

            if(dhour < 10){
                dhour = "0"+dhour;
            }
            if(dminutes < 10){
                dminutes = "0"+dminutes;
            }
            if(dseconds < 10){
                dseconds = "0"+dseconds;
            }

                
            var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;
            
         con.query("INSERT INTO m_audit(user_id,user_action,action_timestamp) values ('"+db_user_id+"','User Login','"+newdate+"')",function(error,rows,fields){
               if(!!error){
                   console.log('Error in the query '+error);
               }
               else{
                   
                  //console.log(daytime);
               }
           });
       }
         
//         console.log("rowwww = "+JSON.stringify(rows[0]));
        return done(null, rows[0]);

      });

    }

));

passport.serializeUser(function(user, done){
//    console.log("rowwwwss = "+JSON.stringify(user));
    done(null, user);

});

passport.deserializeUser(function(user, done){
    done(null, user);
    
});



function isAuthenticated(req, res, next) {

  if (req.isAuthenticated())

    return next();

  res.redirect('/login');

}
 
 
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


//http.listen(3000, function(){
//  console.log('listening on *:3000');
//});
//app.listen(1337);

//module.exports = app;
module.exports = {app: app, server: http};

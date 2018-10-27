// # node_haste

// Route:

// app.get("/test",function(req,res)
// {	
// 	res.end("ok");
// });

// # Express

// * Results per URL for complete test *

// URL#1 (): Average Click Time 3,030 ms, 7,786 Clicks, 0 Errors 

// Total Number of Clicks: 7,786 (0 Errors)
// Average Click Time of all URLs: 3,030 ms 

// ###########################################################################

// # Haste

// * Results per URL for complete test *

// URL#1 (): Average Click Time 2,437 ms, 9,675 Clicks, 0 Errors 

// Total Number of Clicks: 9,675 (0 Errors)
// Average Click Time of all URLs: 2,437 ms 

// ##########################################################################

// Note***: 

// Node Framework to allow developers to write less codes
// Its a testing version 2.0.
// Next version will be a major change that will increase the performance of the framework as it will have c++ thread modules as nodeAddons support
// and other image processing libraries with c++ native addons.

// Please join us to improve the framework and to make it best framework in the world.
// To join team please mail to sudeepdasgupta25@gmail.com or sudeep@pounze.com

// Following are the tutorials of the framework

// Directory Structure

// 1) controllers: it will have controller files
// 2) middlwares: It will have middleware files
// 3) views : It will have html files
// 4) templates: It will have views javascript files to bind data to html files
// 5) common_templates: It has a common_templates.js file which is included in all template files.
// 6) cns : Its a framework directory.
// 7) error_files: It has html files , redesign the html file to set 404, 500 and other errors html files
// 8) UserView: It will consists all static files
// 9) blockusers: It has a file that consists of blocked ip address

// Code Examples:

// Create a file in the root directory named server.js for example

// Require this file

// required to set global root directory as the framework uses absolute path internally not relative

// This framework is for those who want performance along with ease to use

global.__rootdir = __dirname;

const haste = require('./cns/Haste.js');

// this method is used to initialize the haste constructor

var app = haste.init();

// HTTP2 Server HOST

const option = {
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.crt')
};

var server = app.Http2Server('127.0.0.1',3000,option,function(server)
{
	console.log("Server started in port 3000");
});

// HTTP 

var server = app.HttpServer('127.0.0.1',3000,function(server)
{
	console.log("Server started in port 3000");
});

// HTTPS

const option = {
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.crt')
};

var server = app.HttpsServer('127.0.0.1',3000,option,function(server)
{
	console.log("Server started in port 3000");
});

// to set global default method

app.DefaultMethod(function(req,res)
{
	
});

// Cortex is a special functionality with lets you make seperate controllers

// To set middlewares for cortex whether api specific or global

// Global middlewares

app.createGlobalCortexMiddlewares(["CortexMiddleware1","CortexMiddleware2"]);

// api specific

app.cortexMiddleware([
	{
		cortex:"TestHttp2Controllers",
		mapping:"samples",
		middlewares:["CortexSingleMiddleware"]
	}
]);

// there is also a method which lets you create routes

app.route("/sudeep",__dirname+"/routes/Auth.js");

// Auth.js

const router = require("../cns/HasteNew.js").routes;


// creates apis with routes 

// /sudeep/name/$id

// You can also create middlewares for those routes

const router = require("../cns/HasteNew.js").routes;

router.get("/name/$id",function(req,res,input)
{
	res.end("get working routes");
}).middlewares(["TestHttp2Middlware"]).where({'$id':'[0-9]{2}'});

router.post("/name",function(req,res,input)
{
	res.end("post working routes");
}).middlewares(["TestHttp2Middlware"]);

exports.router = router;

// you can creat simple routes with method specific

app.get("/",function(req,res,input)
{
	app.views('http2',req,res,input);
});

app.post("/",function(req,res,input)
{
	res.end("post");
});

app.put("/",function(req,res,input)
{
	res.end("put");
});

app.delete("/",function(req,res,input)
{
	res.end("delete");
});

// you can create views

app.views('http2',req,res,input);

// Here http2 is a file specified in templates folder where you will call a method like , Here index in html page specified in view folder

const haste = require('../cns/HasteNew.js');
const SessionCheck = require('../lib/SessionCheck.js');

async function init(req,res,data,commongData)
{
	haste.renderPage(req,res,commongData,'index',true,null,null,true);
}

exports.init = init;

// You can push files with http2 push

app.get("/",function(req,res,input)
{
	app.views('http2',req,res,input);
})
.pushFile(
[
	"/bower_components/bootstrap/dist/css/bootstrap.min.css",
	"/bower_components/font-awesome/css/font-awesome.min.css",
	"/bower_components/Ionicons/css/ionicons.min.css",
	"/dist/css/AdminLTE.min.css",
	"/bower_components/jquery/dist/jquery.min.js",
	"/bower_components/bootstrap/dist/js/bootstrap.min.js",
	"/UserView/js/angular.min.js"
]);

// you can specify dynamic variables

app.put("/$id",function(req,res,input)
{
	res.end(JSON.stringify(input));
}).where({'$id':'[0-9]{2}'});

// You can terminate program

die({name:"sudeep"});

// To create middlewares, it return two method one with new additional data and other is boolean true or false

function init(req,res,input)
{
	//console.log(input);

	input.middleware1 = "ok";

	return [true,input];
}

exports.init = init;

// To create worker, you can create method like this to use parallelism of node and distribute task to different cpu cores and then join response
global.__rootdir = __dirname;

const haste = require('./cns/HasteNew.js');
var MongoClient = require('mongodb').MongoClient;

var data = [
	{
		name:"Sudeep"
	},
	{
		name:"Abhik"
	},
	{
		name:"Abhishek"
	},
	{
		name:"sasa"
	},
	{
		name:"454545"
	}
];

var database = null;
var db = null;

async function run()
{
	var url = "mongodb://localhost:27017/";

	database = await MongoClient.connect(url,{ useNewUrlParser: true });

	db = database.db("tripkle");

	haste.worker.run(data,3,dataMethod,function(cb)
	{
		console.log(cb);
	});
}

run();

async function dataMethod(data)
{
	if(data != undefined)
	{
		var callback =  await db.collection("tripkleErrLogs").find().toArray();

		haste.worker.send(callback);
	}
}

// To do a task with distribution system with out forking child process folowwing is the way

var data = [
	{
		name:"Sudeep"
	},
	{
		name:"Abhik"
	},
	{
		name:"Abhishek"
	},
	{
		name:"sasa"
	},
	{
		name:"454545"
	}
];

var database = null;
var db = null;

async function runData()
{
	var url = "mongodb://localhost:27017/";

	database = await MongoClient.connect(url,{ useNewUrlParser: true });

	db = database.db("tripkle");

	console.log("ok");

	var callback = await haste.task.distribute(data,3,dataMethod);

	console.log(callback);
}

runData();

async function dataMethod(data)
{
	var callback =  await db.collection("tripkleErrLogs").findOne({});

	return callback._id;
}

// To use pub sub it has inbuilt pub with sub with help of redis

// Publisher

async function Publisher()
{
	RedisPS.config = {
		url:""
	};

	RedisPS.pub.createClient();

	RedisPS.subscribe("sample_topic");

	var data = await RedisPS.onMessage();
}

Publisher();

// Subscriber

async function Subscriber()
{
	RedisPS.config = {
		url:""
	};

	RedisPS.sub.createClient();

	RedisPS.publish("sample_topic","Hello World");
}

Subscriber();

// It has also compression methods available like gzip, deflate

haste.compress.gzip(data,function(cb)
{
	console.log(cb);
});

haste.compress.deflate(data,function(cb)
{
	console.log(cb);
});

haste.compress.DeflateRaw(data,function(cb)
{
	console.log(cb);
});

// TO make http1.1 request

var RequestOpt = {
	protocol:"http",
	message:{
		name:"hello"
	},
	options:{
		host: 'www.google.com',
	    port: 443,
	    path: '/upload',
	    method: 'POST'
	}
};

haste.RemoteRequest(RequestOpt,function(cb)
{
	console.log(cb);
});

// TO make http2 request

var RequestOpt = {
	url:"http://www.pounze.com",
	options:{
	    ":path": '/upload',
	    ":method": 'POST'
	}
};

haste.http2RemoteRequest(RequestOpt,function(cb)
{
	console.log(cb);
});

// for encryption

"encryption Type","message","format"

haste.Hash("sha1","Hello World","hex");

// available-encryption tecnique

// sha256
// sha512
// sha1
// md5

// available format

// hex
// base64

// format Date

haste.formatDate(new Date(),"YYYYMMDD","-");

// IPC

ipc.fork(__dirname+"/lib/sub.js");

ipc.onMessage(function(cb)
{
	console.log(cb);
});

ipc.send("hello");

// otehr side

ipc.parentSend("world");

ipc.parentOnMessage(function(db)
{
	console.log(db);
})

// file reader

haste.fileReader(__dirname+"sample.html",function(cb)
{
	console.log(cb);
});

// file copy

haste.fileCopy(source,destination,function(cb)
{
	console.log(cb);
});

// write logs

haste.writeLogs(__dirname+"logs",data,function(data)
{
	console.log(data);
});

// check auth 401

if(Haste.checkAuth(req))
{

}

// send 401 authorization message

haste.sendAuthorization(req,res,"Please enter username and password");

// get user agent

haste.getUserAgent(req,function(cb)
{
	console.log(cb);
});

// set cookie

haste.setCookies({
	session:"dasdsnakdjkashdjkashjdsa"
});

// get cookie

haste.getCookies(req);

// 401 authorization

haste.Authorization(req);

// in-memory session, it will clear if server is restrat or crashed, better to use redis over this

haste.session.set(key,value);

haste.session.get(key);

haste.session.del(key);

haste.session.destroy();

// 

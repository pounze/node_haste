global.__rootdir = __dirname;

const haste = require('./cns/HasteNew.js');

const path = require('path');

const fs = require('fs');

var app = haste.init();

app.requiredModules([
	'mongodb',
	'redis',
	'soap'
]);

const option = {
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.crt')
};

var server = app.Http2Server('127.0.0.1',3000,option,function(server)
{
	console.log("Server started in port 3000");
});

app.DefaultMethod(function(req,res)
{
	
});

app.createGlobalCortexMiddlewares(["CortexMiddleware1","CortexMiddleware2"]);

app.cortexMiddleware([
	{
		cortex:"TestHttp2Controllers",
		mapping:"samples",
		middlewares:["CortexSingleMiddleware"]
	}
]);

app.route("/sudeep",__dirname+"/routes/Auth.js");


// app.post("/",function(stream,headers)
// {
// 	stream.end("http2 working fine");
// }).middlewares(["TestHttp2Middlware"]);

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

app.put("/$id",function(req,res,input)
{
	res.end(JSON.stringify(input));
}).where({'$id':'[0-9]{2}'});

app.delete("/$id",function(req,res,input)
{
	res.end(JSON.stringify(input));
}).where({'$id':'[0-9]{2}'});

app.post("/","TestHttp2Controllers").middlewares(["TestHttp2Middlware"]);

app.get("/$id/sudeep/$name",function(req,res,input)
{
   try
   {
   	die({name:"sudeep"});
   }
   catch(e)
   {
   	console.log(e);
   	app.views('http2',req,res,input);
   }
}).where({'$id':'[0-9]{2}','$name':'[a-zA-Z]+'});


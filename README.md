# node_haste

Route:

app.get("/test",function(req,res)
{	
	res.end("ok");
});

# Express

* Results per URL for complete test *

URL#1 (): Average Click Time 3,030 ms, 7,786 Clicks, 0 Errors 

Total Number of Clicks: 7,786 (0 Errors)
Average Click Time of all URLs: 3,030 ms 

###########################################################################

# Haste

* Results per URL for complete test *

URL#1 (): Average Click Time 2,437 ms, 9,675 Clicks, 0 Errors 

Total Number of Clicks: 9,675 (0 Errors)
Average Click Time of all URLs: 2,437 ms 

##########################################################################

Note***: 

Node Framework to allow developers to write less codes
Its a testing version 1.0 that has routing, middlewares, Authorization, RemoteRequest, socket support, mysql wrapper class, hashing etc.
Next version will be a major change that will increase the performance of the framework as it will have c++ thread modules as nodeAddons support
and other image processing libraries with c++ native addons.

Please join us to improve the framework and to make it best framework in the world.
To join team please mail to sudeepdasgupta25@gmail.com

Following are the tutorials of the framework

Directory Structure

1) controllers: it will have controller files
2) middlwares: It will have middleware files
3) views : It will have html files
4) templates: It will have views javascript files to bind data to html files
5) common_templates: It has a common_templates.js file which is included in all template files.
6) cns : Its a framework directory.
7) error_files: It has html files , redesign the html file to set 404, 500 and other errors html files
8) UserView: It will consists all static files
9) blockusers: It has a file that consists of blocked ip address

Code Examples:

Create a file in the root directory named server.js for example

Require this file

const haste = require('./cns/Haste.js');

// this method is used to initialize the haste constructor

var app = haste.__init__();

// this method creates an http server

app.HttpServer('127.0.0.1',8100,function(server)
{
  // for websocket support;
   
  // including the websocket.io
  // you can use any other websocket library also
  
	var io = require('socket.io').listen(server);
  
  // creating a socket connection method
  
	io.on('connection', function(socket)
	{
  
    // socket on change method
		socket.on('message', function(data)
		{
    
    // this method is used if you want to push the input data of the client side to the controller
    
			app.webSocket(data,function(data)
			{
				socket.emit("callback",{status:true,msg:data});
			});
		});

		socket.on('disconnect',function(msg)
	    {
	    	console.log("disconnected");
	    });

	    socket.on('end',function()
	    {
	    	console.log('Server closed');
	    });
	});
});

// this method is used to allow directories for static files and direct access folders

app.AllowDirectories(['UserView/']);

// this is a get request route method

app.get('/$id/student/$name',function(req,res,input)
{

  // here you can see input variable which is an oject and consists of parse get request
 // middleware method consists of array of name of middlewares
 // where method is used to bind the regex with input variables
 
}).middlewares(['TestMiddlware']).where({'$name':'[a-z]+','$id':'[0-9]{2}'});

// this is a post request route method

app.post('/done',function(req,res,input)
{
	console.log(input);
});



app.get('/',function(req,res,input)
{
	res.end('I am the best');
});

// here it is a get request method but instead of sending input data to function it sends to controller file name InternalServerTest

app.get('/testinterna','InternalServerTest');

// this method is used to close the haste constructor

app.close();

// for 401 authorization

//this method is used to check if the reqeust has send username and password for authorization

haste.checkAuth(req);

// this method is used to parse 401 request and return an array with username and password 

var call = haste.Authorization(req);

// to send authorization of 401 to client side to ask for username and password

haste.sendAuthorization(msg,res);

/*
 *****
 ***** 
 following is the example of complete 401 authorization 
*/

if(!haste.checkAuth(req))
{
  let msg = "Please enter username and password";
  haste.sendAuthorization(msg,res);
}
else
{
  var call = haste.Authorization(req);

  if(call[0] == 'root' && call[1] == 'kai') 
  {
    // if username and password match do some stuffs
  }
}

// to get browser data user agent
haste.getUserAgent(req);

// to set cookie
haste.setCookies(object,res);

// to get cookie
haste.getCookies(req);

// mysql query tutorials

let parameters = {
  query:"SELECT * FROM hotels WHERE hotel_id = ?",
  match:[2]
};

haste.mySQL.query(parameters,function(err,data)
{
  console.log(JSON.stringify(data));
});
// there are several methods of msyql, documentation will be updated in the official site very soon

// to call views

app.get('/',function(req,res,input)
{
// here test is the view name that lies in template folder test.js
// I am awesome is any new data you want to sent to that views

  app.views('test',req,res,'I am awesome');
});

// to write logs

haste.writeLogs('./file.log','Hello Sudeep',function(callback)
{
  console.log(callback);
});

// to copy file from one folder to another 

haste.fileCopy(path,pathDir); // this can be used for file uploading

// to read files

haste.fileReader(path);

// to formate date

haste.formatDate(date);

// to encrypt 

haste.Hash(method,string,encoding);

// method has four types {sha256,sha512,sha1,md5}
// encoding has two {hex,base64}

// to make an http request

haste.RemoteRequest(object);

object = {
  protocol:'http',
  message:'I am noob',
  options: {}
};
  
// enjoy coding version 1.1 will be updated with in a week that will have session handling and better error handling with improved performance.

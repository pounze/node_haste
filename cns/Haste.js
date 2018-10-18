/*

  Haste Framework copy right 2017

  By Pounze It Solution Pvt Ltd

  Developed @author Sudeep Dasgupta

  email: sudeep.dasgupta@pounze.com or sudeep.ignition@gmail.com

  Join us to make this framework the best among all other frameworks

  current version: 1.2

  next version will be in c++ Thread module will be implemented as node Addons library for concurrency

*/



/*

  Modules and libraries are initialized

*/

const fs = require('fs');

const http = require('http');

const https = require('https');

const http2 = require("http2");

const url_module = require('url');

const PATHNAME = require('path');

const cluster = require('cluster');

const qs = require('querystring');

const stream = require('stream');

const config = require(__dirname+'/config.js');

var viewsObj = require('../common_templates/common_templates.js');

const sessionObj = require(__dirname+'/session.js');


/*

  haste method is declared where Library constructor is called

*/


var haste = function(params)
{
    return new Library(params);
};

var Library = function(params)
{

  this.input = {};

  this.staticPath = [];

  this.globalGETObject = {};
  
  this.globalPOSTObject = {};

  this.globalObject = {};

  this.cacheDocFile = {};

  this.req = {};

  this.res = {};

  this.cookieStatus = false;

  this.defaultMethod;

  this.maintainanceStat = undefined;

  this.server = null;

  this.AllowModules = {};

  var date = new Date();

  this.header404 = {
    'Keep-Alive':' timeout=5, max=500',
	'Server': 'Node Server',
	'Developed-By':'Pounze It-Solution Pvt Limited',
	'Cache-Control':'no-store, no-cache, must-revalidate',
	'Pragma': 'public,max-age=31536000',
	'Content-Type':'text/html',
	'Expires':date
  };

  this.header500 = {
    'Keep-Alive':' timeout=5, max=500',
	'Server': 'Node Server',
	'Developed-By':'Pounze It-Solution Pvt Limited',
	'Cache-Control':'no-store, no-cache, must-revalidate',
	'Pragma': 'public,max-age=31536000',
	'Content-Type':'text/html',
	'Expires':date
  };

  this.header403 = {
    'Keep-Alive':' timeout=5, max=500',
    'Server': 'Node Server',
    'Developed-By':'Pounze It-Solution Pvt Limited',
    'Cache-Control':'no-store, no-cache, must-revalidate',
    'Pragma': 'public,max-age=31536000',
    'Content-Type':'text/html',
    'Expires':date
  };

  return this;

};

/*

    Haste method is called and Library constructor is initialized

*/

var hasteObj = haste();

haste.fn = Library.prototype = 
{
	HttpServer:async function(ip,port,callback = null)
    {
    	return handleHttpServer(ip,port,callback).catch(function(error)
    	{
    		console.error(error);
    	});
    },
    HttpsServer:async function(ip,port,options,callback = null)
    {
    	return handleHttpsServer(ip,port,options,callback).catch(function(error)
    	{
    		console.error(error);
    	});
    },
    DefaultMethod:async function(callback)
    {
      defaultMethod = callback;
    },
    dependencies:{},
    get:function(uri,argument)
    {
        // get method for get routers

        hasteObj.globalGETObject[uri] = {
            "uri":uri,
            "request_type":"GET",
            "argument":argument,
            "regex":uri
        };

        this.requestType = "GET";

        this.path = uri;

        return this;
    },
    post:function(uri,argument)
    {
        // post method for post routers

        hasteObj.globalPOSTObject[uri] = {
            "uri":uri,
            "request_type":"POST",
            "argument":argument,
            "regex":uri
        };

        this.requestType = "POST";

        this.path = uri;

        return this;
    },
    put:async function(uri,argument)
    {

    },
    delete:async function(uri,argument)
    {

    },
    middlewares:function(middleware)
    {   
      try
      {
      	if(this.requestType == "GET")
      	{
      		hasteObj.globalGETObject[this.path].middleware = middleware;
      	}
      	else if(this.requestType == "POST")
      	{
      		hasteObj.globalPOSTObject[this.path].middleware = middleware;
      	}
      }
      catch(e)
      {
      	console.error(e);
      }

      return this;
    },
    where:function(regex)
    {

      try
      {
      	// checking for regular expression match

	    if(this.requestType == "GET")
	    {
	    	hasteObj.globalGETObject[this.path].regexExp = regex;

	     	hasteObj.globalGETObject[this.path]['regex'] = hasteObj.globalGETObject[this.path]['uri'];

	     	for(regex in hasteObj.globalGETObject[this.path]['regexExp'])
	      	{
	        	hasteObj.globalGETObject[this.path]['regex'] = hasteObj.globalGETObject[this.path]['regex'].replace(regex,hasteObj.globalGETObject[this.path]['regexExp'][regex]);
	      	}
	    }
	    else if(this.requestType == "POST")
	    {
	    	hasteObj.globalPOSTObject[this.path].regexExp = regex;

	     	hasteObj.globalPOSTObject[this.path]['regex'] = hasteObj.globalPOSTObject[this.path]['uri'];

	     	for(regex in hasteObj.globalPOSTObject[this.path]['regexExp'])
	      	{
	        	hasteObj.globalPOSTObject[this.path]['regex'] = hasteObj.globalPOSTObject[this.path]['regex'].replace(regex,hasteObj.globalPOSTObject[this.path]['regexExp'][regex]);
	      	}
	    }

      }
      catch(e)
      {
      	console.error(e);
      }

      return this;

    },
    views:async function(file,req,res,data)
    {

      /*
        views get file and send data
      */

	    try
	    {

	      var commongData = await viewsObj.init(req,res,data);

	      var stat = await fileStat('./templates/'+file+'.js');

	      if(stat != undefined && stat.isFile())
	      { 

	        var modifiedDate = new Date(stat.mtimeMs).getTime();

	        if(!hasteObj.res.headersSent)
	        {
	        	if(typeof(hasteObj.req.headers['if-none-match']) == 'undefined')
	            {
	              hasteObj.res.setHeader('ETag',modifiedDate);
	              hasteObj.res.statusCode = 200;
	            }
	            else
	            {
	              hasteObj.res.setHeader('ETag',modifiedDate);
	              if(hasteObj.req.headers['if-none-match'] != modifiedDate)
	              {
	                hasteObj.res.statusCode = 200;
	              }
	              else
	              {
	                hasteObj.res.statusCode = 304;
	              }
	            }
	        }

	        var views = require('../templates/'+file+'.js');

	        await views.init(req,res,data,commongData);

	      }
	      else
	      {
	        console.error('View template page name must be a javascript file');
	      }
	    }
	    catch(e)
	    {
	        if(!hasteObj.res.headersSent)
	        {
	          hasteObj.res.writeHead(500,hasteObj.header500);
	        }
	        
	        var readerStream = await readFiles('./error_files/'+config.errorPages.InternalServerError);

	        readerStream.on('error', function(error)
			{
		        hasteObj.res.writeHead(404, 'Not Found');
		       	hasteObj.res.end();
		    });

	        readerStream.pipe(res);

	        res.on("end",function()
	        {
	          readerStream.destroy();
	        });

	        console.error(e);

	    }

    },
    AllowDirectories:function(path)
    {

        // allow folders to get accessed
        hasteObj.staticPath = path;
    },
    close:function()
    {

        // closing the haste object

        exports.init = null;

        delete hasteObj;

        delete Library;

        delete this.haste;

        delete this.staticPath;

        delete this.globalGETObject;

        delete this.globalPOSTObject;

        delete this.globalObject;

        delete this.input;

        delete this;

        delete this.input;

        delete this.request;

        delete this.response;

        delete this.cookieStatus;

    },
    webSocket:function(input,callback)
    {

        // method for realtime application using websocket.io and sending data to controller

        if(typeof(input["cortex"]) != 'undefined' && typeof(input["cortex"]) == 'string' && input["cortex"] != '')
        {
            fs.stat('./controllers/'+input["cortex"]+'.js',function(err,data)
            {
                if(err)
                {
                	callback(false);
                    console.error('controller does not exists');
                }

                var controller = require('../controllers/'+input["cortex"]+'.js');

                var callbackData = controller.init(null,null,input);

                callback(callbackData);

            });

        }   
        else
        {
        	callback(false);
            console.error('cortex field must be string');
        }

        return this;

    }
};

async function modules(req,res,hasteObj,obj)
{

  try
  {
  	/*

        checking for middleware if array or string 

        if array then multiple middleware

        else single middleware

    */

    var success = 0;

    if(typeof(hasteObj.globalObject[obj]["middleware"]) != 'undefined')
    {
        if(typeof(hasteObj.globalObject[obj]["middleware"]) == 'object' && Array.isArray(hasteObj.globalObject[obj]["middleware"]))
        {
            let middlewareLen = hasteObj.globalObject[obj]["middleware"].length;

            for(var j=0;j<middlewareLen;j++)
            {

              // iterating thoough the middleware

              try
              {
                // checking if the middleware file exists or not

                var middlewarestat = await fileStat('./middlewares/'+hasteObj.globalObject[obj]["middleware"][j]+'.js');
                
                // if the middleware is a file

                if(middlewarestat != undefined && middlewarestat.isFile())
                {
                    // then invoke the middleware main method

                  var middlewareFile = require('../middlewares/'+hasteObj.globalObject[obj]["middleware"][j]+'.js');

                  var middlewareCallbacks = middlewareFile.init(req,res,hasteObj.input);

                  if(middlewareCallbacks != undefined && middlewareCallbacks[0] != undefined && !middlewareCallbacks[0])
                  {

                    // if middleware callback is false then request is stopped here

                    hasteObj.res.setHeader('Content-Type','application/json');

                    hasteObj.res.end(JSON.stringify(middlewareCallbacks[1]));

                    return false;

                  }
                  else
                  {
                    hasteObj.input[hasteObj.globalObject[obj]["middleware"][j]] = middlewareCallbacks[1];
                    success += 1;
                  }
                }
                else
                {
                  console.error('Middlware must be a javascript file');
                }
              }
              catch(e)
              {
                // if file is not found of the middleware then 500 internal server error is thrown

                if(!hasteObj.res.headersSent)
                {
                  hasteObj.res.writeHead(500,hasteObj.header500);
                }
                
                var readerStream = await readFiles('./error_files/'+config.errorPages.InternalServerError);

                readerStream.on('error', function(error)
			    {
		            hasteObj.res.writeHead(404, 'Not Found');
		        	hasteObj.res.end();
		        });

                readerStream.pipe(res);

                res.on("end",function()
                {
                  readerStream.destroy();
                });

                console.error(e);
                return false;

              }
            }

            if(success == middlewareLen)
            {
              	executeMethod(req,res,hasteObj,obj).catch(function(error)
      			{
      				console.error(error);
      			});
            }
        }
        else if(typeof(hasteObj.globalObject[obj]["middleware"]) == 'string')
        {
            let middlewarestat = await fileStat('./middlewares/'+hasteObj.globalObject[obj]["middleware"]+'.js');

            if(middlewarestat != undefined && middlewarestat.isFile())
            {

              let middlewareFile = require('../middlewares/'+hasteObj.globalObject[obj]["middleware"]+'.js');

              let middlewareCallbacks = middlewareFile.init(req,res,hasteObj.input).catch(function(err)
              {
              	console.error(err);
              });

              if(middlewareCallbacks != undefined && middlewareCallbacks[0] != undefined && !middlewareCallbacks[0])
              {
                hasteObj.res.setHeader('Content-Type','application/json');
                hasteObj.res.end(JSON.stringify(middlewareCallbacks[1]));
                return false;
              }
              else
              {
                hasteObj.input[hasteObj.globalObject[obj]["middleware"]] = middlewareCallbacks[1];
                executeMethod(req,res,hasteObj,obj).catch(function(error)
      			{
      				console.error(error);
      			});
              }
            }
            else
            {
              console.error('Middlware must be a javascript file');
            }
        }
        else
        {
            console.error("Middleware must be string or array");
        }
    }  
    else
    {
        executeMethod(req,res,hasteObj,obj).catch(function(error)
		{
			console.error(error);
		});
    }
  }
  catch(e)
  {
  	console.error(e);
  }   
}

async function executeMethod(req,res,hasteObj,obj)
{

  /*
    checking if the second argument is string or function

    if string then it is passed to 

    else callback is given to method

  */

  if(typeof(hasteObj.globalObject[obj]["argument"]) == 'function')
  {
    hasteObj.globalObject[obj]["argument"](req,res,hasteObj.input);
  }
  else if(typeof(hasteObj.globalObject[obj]["argument"]) == 'string')
  {
    try
    {

     var stat = await fileStat('./controllers/'+hasteObj.globalObject[obj]["argument"]+'.js');

     if(stat.isFile())
     {
        var controller = require('../controllers/'+hasteObj.globalObject[obj]["argument"]+'.js');

        controller.init(req,res,hasteObj.input).catch(function(err)
        {
        	console.error(err);
        });
     }
     else
     {
        console.error('Controller must me a javascript file');
   	  }

    }
    catch(e)
    {
      console.error(e);

      if(!hasteObj.res.headersSent)
      {
        hasteObj.res.writeHead(500,hasteObj.header500);
      }
     
      var readerStream = await readFiles('./error_files/'+config.errorPages.InternalServerError);

      readerStream.on('error', function(error)
	  {
        hasteObj.res.writeHead(404, 'Not Found');
       	hasteObj.res.end();
      });

      readerStream.pipe(res);

      res.on("end",function()
      {
        readerStream.destroy();
      });

      console.error(e);
      
      return false;
    }
  }
  else
  {
    console.error('Route\'s second argument must me function of string ' + typeof(hasteObj.argument[i]) + ' given');
  }

}

async function executeModules()
{
	if(hasteObj.dependencies["multiparty"] != undefined)
	{
		this.AllowModules.multiparty = require("multiparty");
	}

	if(config.compression != undefined && config.compression.gzip != undefined && config.compression.gzip == false)
	{
		this.AllowModules.zlib = require('zlib');
	}
}

async function handleHttpsServer(ip,port,options,callback)
{
	return new Promise((resolve,reject)=>{

		try
		{
			if(typeof(ip) != 'string' || typeof(port) != 'number')
			{
				console.error("IP and PORT cannot be empty",null);
			}

			var cpuCount = null;

			if(cluster.isMaster)
			{
				if(typeof(config.server.cpuCores) != 'undefined' && typeof(config.server.cpuCores) == 'number')
		        {
		           cpuCount = config.server.cpuCores;
		        }
		        else
		        {
		           cpuCount = require('os').cpus().length;
		        }

		        for(var i=0;i<cpuCount;i++)
		        {
		            cluster.fork();
		        }

		        cluster.on('exit',()=>{
		           cluster.fork();
		        });
			}
			else
			{
				hasteObj.server = https.createServer(options);

				hasteObj.server.on('request', (req, res) => {
				  	process.nextTick(function()
					{
						handleRequest(req,res);
					});
				});

				/*
		            Http server configurations
		        */

		        hasteObj.server.on('connection',function(socket)
		        { 
		           socket.setTimeout(config.server.socketTimeout);
		        });

		        hasteObj.server.setTimeout(config.server.setTimeout);

		        hasteObj.server.setMaxListeners(config.server.maxListeners);

		        hasteObj.server.on('clientError', (err, socket) => {
		           socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
		        });

		        /*

		           Server listening and closing the server

		        */

		       	hasteObj.server.listen(port,ip);

		        if(callback == null)
		        {
		        	resolve(hasteObj.server);
		        }
		        else
		        {
		        	callback(hasteObj.server);
		        }
			}
		}
		catch(e)
		{
			reject(e);
		}
	});
}

async function handleHttpServer(ip,port,callback)
{
	return new Promise((resolve,reject)=>{

		try
		{
			if(typeof(ip) != 'string' || typeof(port) != 'number')
			{
				console.error("IP and PORT cannot be empty",null);
			}

			var cpuCount = null;

			if(cluster.isMaster)
			{
				if(typeof(config.server.cpuCores) != 'undefined' && typeof(config.server.cpuCores) == 'number')
		        {
		           cpuCount = config.server.cpuCores;
		        }
		        else
		        {
		           cpuCount = require('os').cpus().length;
		        }

		        for(var i=0;i<cpuCount;i++)
		        {
		            cluster.fork();
		        }

		        cluster.on('exit',()=>{
		           cluster.fork();
		        });
			}
			else
			{
				hasteObj.server = http.createServer();

				hasteObj.server.on('request', (req, res) => {
				  	process.nextTick(function()
					{
						handleRequest(req,res);
					});
				});

				/*
		            Http server configurations
		        */

		        hasteObj.server.on('connection',function(socket)
		        { 
		           socket.setTimeout(config.server.socketTimeout);
		        });

		        hasteObj.server.setTimeout(config.server.setTimeout);

		        hasteObj.server.setMaxListeners(config.server.maxListeners);

		        hasteObj.server.on('clientError', (err, socket) => {
		           socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
		        });

		        /*

		           Server listening and closing the server

		        */

		       	hasteObj.server.listen(port,ip);

		        if(callback == null)
		        {
		        	resolve(hasteObj.server);
		        }
		        else
		        {
		        	callback(hasteObj.server);
		        }
			}
		}
		catch(e)
		{
			reject(e);
		}
	});
}

async function getIpAddress(req,res)
{
    /*

        Requiring IP address to get use ip address 

    */

    let getIpObject = require('../blockusers/IpAddress.js');

    let ip;

    if (hasteObj.req.headers['x-forwarded-for'])
    {
        ip = hasteObj.req.headers['x-forwarded-for'].split(",")[0];
    }
    else if(hasteObj.req.connection && hasteObj.req.connection.remoteAddress)
    {
        ip = hasteObj.req.connection.remoteAddress;
    } 
    else
    {
        ip = hasteObj.req.ip;
    }

    /*
        matching the ip address and status
    */

    if(getIpObject[ip])
    {
        if(!hasteObj.res.headersSent)
        {
          hasteObj.res.writeHead(404,hasteObj.header404);
        }

        hasteObj.res.end('Something went wrong');
        return false;
    }
}

async function defaultHeaders(statuCode,headers)
{
	if(!hasteObj.res.headersSent)
	{
		hasteObj.res.writeHead(statuCode,headers);
	}
}

async function handleRequest(req,res)
{
	try
	{
		if(typeof(defaultMethod) != 'undefined')
      	{
        	defaultMethod(req,res);
      	}

		hasteObj.req = req;
	    hasteObj.res = res;

	    session.currentSession = '';

	    getIpAddress(hasteObj.req,hasteObj.res);

	    var heapUsuage = data = null;

	    heapUsuage = process.memoryUsage();

	    if(config.server.showHeapUsuage)
	    {
	     	console.error('Heap used '+heapUsuage['heapUsed'] +' | Heap total size: '+heapUsuage['heapTotal']);
	    }

	    if(heapUsuage['heapUsed'] > heapUsuage['heapTotal'])
	    {
	      data = {
	        status:false,
	        msg:'Server is to busy'
	      };
	      hasteObj.res.end(JSON.stringify(data));
	    }

	    hasteObj.req.on('error',function()
	    {
	      console.error('Error in server');
	      return false;
	    });

	    hasteObj.req.on("end", function()
	    {
	      // request ended normally
	    });

	    if(config.server.maintainance)
	    {
	      if(!hasteObj.res.headersSent)
	      {
	        hasteObj.res.setHeader("Keep-Alive","timeout=5, max=500");
	        hasteObj.res.setHeader("Server","Node Server");
	        hasteObj.res.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
	        hasteObj.res.setHeader("Content-Type","text/html");
	      }
	      
	      var stat = await fileStat('./error_files/'+config.errorPages.MaintainancePage);

	      if(stat == undefined)
	      {
	      	return;
	      }

	      var modifiedDate = new Date(stat.mtimeMs).getTime();

	      if(typeof(hasteObj.req.headers['if-none-match']) == 'undefined')
	      {
	        hasteObj.res.setHeader('ETag',modifiedDate);
	        hasteObj.res.statusCode = 200;
	      }
	      else
	      {
	        hasteObj.res.setHeader('ETag',modifiedDate);
	        if(hasteObj.req.headers['if-none-match'] != modifiedDate)
	        {
	          hasteObj.res.statusCode = 200;
	        }
	        else
	        {
	          hasteObj.res.statusCode = 304;
	        }
	      }

	      var readerStream = await readFiles('./error_files/'+config.errorPages.MaintainancePage);

	      readerStream.on('error', function(error)
	      {
            hasteObj.res.writeHead(404, 'Not Found');
        	hasteObj.res.end();
          });

	      readerStream.pipe(hasteObj.res);

	      hasteObj.res.on("end",function()
	      {
	        readerStream.destroy();
	      });

	      return false;
	    }

	  
        let requestMethod = hasteObj.req.method;

      	let requestUri = url_module.parse(hasteObj.req.url).pathname;

      	let ext = (/[.]/.exec(requestUri)) ? /[^.]+$/.exec(requestUri) : undefined;

      	let myExp;

      	let notMatchCount = 0;

      	let tempMapping = '';

      	let uriListLen = 0;

      	/*

          getting global object length to know if any routes is created

        */

        if(requestMethod == "GET")
        {
        	uriListLen = Object.keys(hasteObj.globalGETObject).length;

        	hasteObj.globalObject = hasteObj.globalGETObject;
        }
        else if(requestMethod == "POST")
        {
        	uriListLen = Object.keys(hasteObj.globalPOSTObject).length;

        	hasteObj.globalObject = hasteObj.globalPOSTObject;
        }

        /*

          if length is zero error is thrown to created a route

        */

        if(uriListLen == 0)
        {
          hasteObj.res.setHeader("Keep-Alive","timeout=5, max=500");
	      hasteObj.res.setHeader("Server","Node Server");
		  hasteObj.res.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
      	  res.end("Please create a route");
          console.error('Please create a route');
          return false;
        }

      	/*
	        Cortex Concept for accessing apis more directly and easily
	    */

	    if(requestUri == '/cortex')
      	{
      		if(requestMethod == 'POST')
      		{
      			var parseCb = await parsePOST(hasteObj.req).catch(function(error)
      			{
      				console.error(error);
      			});
      		}
      		else if(requestMethod == "GET")
      		{
      			hasteObj.res.setHeader("Keep-Alive","timeout=5, max=500");
			    hasteObj.res.setHeader("Server","Node Server");
			    hasteObj.res.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
      			res.end("Cortex method does not support GET request");
      			console.error("Cortex method does not support GET request");
      			return;
      		}
      		else
      		{
      			var parseCb = {
      				status:false
      			};
      		}
	        
	        if(parseCb != undefined && parseCb.status)
	        {
	          hasteObj.input['requestData'] = parseCb.data;

	          try
	          {
	            if(requestMethod == 'POST')
	            {
	            	var mapping = hasteObj.input['requestData']['mapping'];
	            	var cortex = hasteObj.input['requestData']['cortex'];
	            }
	            else
	            {
	            	var mapping = hasteObj.input['query']['mapping'];
	            	var cortex = hasteObj.input['query']['cortex'];
	            }

	            if(cortex == undefined || cortex == "" || cortex == null)
	            {
	            	console.error("No cortex method found");
	            	return;
	            }

	            if(typeof(mapping) != 'undefined' && mapping != '')
	            {
	              tempMapping = mapping.split('.');
	              tempMapping = tempMapping.join('/');
	            }

	            var stat = await fileStat('./controllers/'+tempMapping+'/'+cortex+'.js');

	            if(stat != undefined && stat.isFile())
	            {
	              var controller = require('../controllers/'+tempMapping+'/'+cortex+'.js');

	              controller.init(req,res,hasteObj.input);
	            }
	            else
	            {
	              console.error('Controller must me a javascript file'); 
	            }

	          }
	          catch(e)
	          {

	            if(!hasteObj.res.headersSent)
	            {
	              hasteObj.res.writeHead(404,hasteObj.header404);
	            }
	            
	            var readerStream = await readFiles('./error_files/'+config.errorPages.PageNotFound);

	            readerStream.on('error', function(error)
		      	{
		            hasteObj.res.writeHead(404, 'Not Found');
	            	hasteObj.res.end();
	          	});

	            readerStream.pipe(res);

	            res.on("end",function()
	            {
	              readerStream.destroy();
	            });

	            console.error(e);
	            return false;

	          }
	        }
	        else
	        {
	          hasteObj.res.writeHead(500,hasteObj.header500);

	          hasteObj.res.end(JSON.stringify({status:false,msg:"Failed to parse request"}));

	          return; 
	        }

	        return false;
      	}


      	/*

        	checking for extention of the request

      	*/



      	if(ext == undefined)
      	{
	        /*

	          if extention is undefined then its url api request else static file request

	        */

	        /*

	          Iterating through the whole object

	        */

	        for(obj in hasteObj.globalObject)
	        {
	          /*
	            Iterating through object in to match uri and parse request accordingly            
	          */

	            myExp = new RegExp('^'+hasteObj.globalObject[obj]["regex"]+'$');

	            if(requestUri.match(myExp) && requestMethod == hasteObj.globalObject[obj]['request_type'])
	            {
	              let requestUriArr = requestUri.split('/');

	              let matchedArr = hasteObj.globalObject[obj]["uri"].split('/');

	              let matchedArrLen = matchedArr.length;

	              for(let mat=1;mat<matchedArrLen;mat++)
	              {
	                hasteObj.input[matchedArr[mat]] = requestUriArr[mat];
	              }

	              switch(requestMethod)
	              {

	                case "GET":

		                var parseCb = await parseGET(hasteObj.req).catch(function(error)
		      			{
		      				console.error(error);
		      			});

		                if(parseCb != undefined && parseCb.status)
		                {
		                    hasteObj.input['requestData'] = parseCb.data;

		                    modules(hasteObj.req,hasteObj.res,hasteObj,obj).catch(function(error)
			      			{
			      				console.error(error);
			      			});
		                }
		                else
		                {
		                    hasteObj.res.writeHead(500,hasteObj.header500);

		                    hasteObj.res.end(JSON.stringify({status:false,msg:"Failed to parse request"}));
		                }

		                break;

	                case "POST":

	                  	var parseCb = await parsePOST(hasteObj.req).catch(function(error)
		      			{
		      				console.error(error);
		      			});

	                  	if(parseCb != undefined && parseCb.status)
		                {
		                    hasteObj.input['requestData'] = parseCb.data;

		                    modules(hasteObj.req,hasteObj.res,hasteObj,obj).catch(function(error)
			      			{
			      				console.error(error);
			      			});
		                }
	                  	else
	                  	{
	                    	hasteObj.res.writeHead(500,hasteObj.header500);

	                    	hasteObj.res.end(JSON.stringify({status:false,msg:"Failed to parse request"}));
	                  	}

	                  	break;

	                default:
	                	hasteObj.res.writeHead(404,hasteObj.header404);
	                    hasteObj.res.end(JSON.stringify({status:false,msg:"Failed to parse request"}));
	                	console.error('Invalid Request');
	              }
	              break;

	            }
	            else
	            {
	              notMatchCount += 1;
	            }
	        }


	        /*

	          If no match is found then 404 error is thrown

	        */

	        if(notMatchCount == uriListLen)
	        {
	            if(!hasteObj.res.headersSent)
	            {
	              hasteObj.res.writeHead(404,hasteObj.header404);
	            }

	            var readerStream = await readFiles('./error_files/'+config.errorPages.PageNotFound);

	            readerStream.on('error', function(error)
		      	{
		            hasteObj.res.writeHead(404, 'Not Found');
	            	hasteObj.res.end();
	          	});

	           readerStream.pipe(hasteObj.res);

	           hasteObj.res.on("end",function()
	           {
	             readerStream.destroy();
	           });

	           return false;
	        }
      	}
      	else
      	{
	        try
	        {
	          // checking for static files and have access to that folder

	          let staticFilelength = (hasteObj.staticPath == '') ? 0 : hasteObj.staticPath.length;

	          let notMatchCount = 0;

	          for(var i=0; i<staticFilelength; i++)
	          {
	            url = hasteObj.staticPath[i].replace('/',"\\/");

	            myExp = new RegExp(url+"[a-z0-9A-Z\.]*","i");

	            if(requestUri.match(myExp))
	            {
	              switch(PATHNAME.extname(ext['input']))
	              {
	                case '.css': hasteObj.res.setHeader("Content-Type", "text/css");

	                break;

	                case '.ico' : hasteObj.res.setHeader("Content-Type","image/ico");

	                break;

	                case '.js' : hasteObj.res.setHeader("Content-Type", "text/javascript");

	                break;

	                case '.jpeg' : hasteObj.res.setHeader("Content-Type", "image/jpg");

	                break;

	                case '.jpg' : hasteObj.res.setHeader("Content-Type", "image/jpg");

	                break;

	                case '.png' : hasteObj.res.setHeader("Content-Type", "image/png");

	                break;

	                case '.gif' : hasteObj.res.setHeader("Content-Type", "image/gif");

	                break;

	                case '.json' : hasteObj.res.setHeader("Content-Type", "application/json");

	                break;

	                case '.pdf' : hasteObj.res.setHeader("Content-Type", "application/pdf");

	                break;

	                case '.ttf' : hasteObj.res.setHeader("Content-Type", "application/octet-stream");

	                break;

	                case '.html' : hasteObj.res.setHeader("Content-Type", "text/html");

	                break;

	                case '.woff' : hasteObj.res.setHeader("Content-Type", "application/x-font-woff");

	                break;

	                default : 
	                	hasteObj.res.setHeader("Content-Type", "text/plain");
	                	continue;

	              }

	              var stat = await fileStat('./'+requestUri);

	              if(stat != undefined && stat.isFile())
	              {
	                if(!hasteObj.res.headersSent)
	                {
	                	var now = new Date();
		                now.setDate(now.getDate()+14);
		                hasteObj.res.setHeader("Keep-Alive","timeout=5, max=500");
		                hasteObj.res.setHeader("Server","Node Server");
		                hasteObj.res.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
		                hasteObj.res.setHeader("Expires",now);

		                var modifiedDate = new Date(stat.mtimeMs).getTime();
		                hasteObj.res.setHeader('ETag',modifiedDate);
	                }

	                if(typeof(hasteObj.req.headers['if-none-match']) == 'undefined')
	                {
	                  
	                  hasteObj.res.statusCode = 200;
	                }
	                else
	                {
	                  if(hasteObj.req.headers['if-none-match'] != modifiedDate)
	                  {
	                    hasteObj.res.statusCode = 200;
	                  }
	                  else
	                  {
	                    hasteObj.res.statusCode = 304;
	                  }
	                }

	                readerStream = await readFiles('./'+requestUri);

	                readerStream.on('error', function(error)
				    {
			            hasteObj.res.writeHead(404, 'Not Found');
		            	hasteObj.res.end();
			        });
	                
	                if(config.compression.gzip == false)
	                {
	                  readerStream.pipe(hasteObj.res);
	                  hasteObj.res.on("end",function()
	                  {
	                    readerStream.destroy();
	                  });
	                }
	                else
	                {
	                  hasteObj.res.setHeader('content-encoding','gzip');
	                  readerStream.pipe(hasteObj.AllowModules.zlib.createGzip()).pipe(hasteObj.res);
	                  hasteObj.res.on("end",function()
	                  {
	                    readerStream.destroy();
	                  });
	                }
	              }
	              else
	              {
	                if(!hasteObj.res.headersSent)
	                {
	                  hasteObj.res.writeHead(404,hasteObj.header404);
	                }
	                
	                var readerStream = await readFiles('./error_files/'+config.errorPages.PageNotFound);

	                readerStream.on('error', function(error)
				    {
			            hasteObj.res.writeHead(404, 'Not Found');
		            	hasteObj.res.end();
			        });

	                readerStream.pipe(hasteObj.res);
	                hasteObj.res.on("end",function()
	                {
	                  readerStream.destroy();
	                });
	              }

	              break;

	            }
	            else
	            {
	              notMatchCount += 1;
	            }
	          }

	          // if no match found 404 error is thrown

	          if(notMatchCount == staticFilelength)
	          {

	            if(!hasteObj.res.headersSent)
	            {
	              hasteObj.res.writeHead(403,hasteObj.header403);
	            }
	            
	            var readerStream = await readFiles('./error_files/'+config.errorPages.DirectoryAccess);

	            readerStream.on('error', function(error)
		      	{
		            hasteObj.res.writeHead(404, 'Not Found');
	            	hasteObj.res.end();
	          	});

	            readerStream.pipe(hasteObj.res);

	            hasteObj.res.on("end",function()
	            {
	                readerStream.destroy();
	            });

	            return false;
	          }

	        }
	        catch(e)
	        {
	          console.error(e);
	          if(!hasteObj.res.headersSent)
	          {
	            hasteObj.res.writeHead(500,hasteObj.header500);
	          }
	          
		      var readerStream = await readFiles('./error_files/'+config.errorPages.InternalServerError);

		      readerStream.on('error', function(error)
		      {
	            hasteObj.res.writeHead(404, 'Not Found');
            	hasteObj.res.end();
	          });

		      readerStream.pipe(hasteObj.res);

		      hasteObj.res.on("end",function()
		      {
		        readerStream.destroy();
		      });

		      return false;
	        }
      	}
	}
	catch(e)
	{
		console.error(e);
	}
}

async function readFiles(fileName)
{
	return new Promise((resolve,reject)=>{
		try
		{
			var readerStream = fs.createReadStream(fileName);
    		resolve(readerStream);
		}
		catch(e)
		{
			reject(e);
			console.error(e);
		}
	});
}

async function parseGET(req)
{
  // parse get request
  return new Promise((resolve,reject)=>{
    try
    {
    	var url_parsed = url_module.parse(hasteObj.req.url,true);
    	resolve({status:true,data:url_parsed['query']});  
    }
    catch(e)
    {
    	console.error(e);
    	reject({status:false,msg:"Failed to parse get request"});
    	console.error("Failed to parse get request");
    }
  });
}

async function parsePOST(req)
{
	return new Promise((resolve,reject)=>{

		if(typeof(hasteObj.req.headers['content-type']) != 'undefined')
        {
          // parse post request 

          if((hasteObj.req.method == 'POST' &&  hasteObj.req.headers['content-type'].match(/(multipart\/form\-data\;)/g)))
          {
            try
            {
              var form = new this.AllowModules.multiparty.Form();

              form.parse(req,function(err,fields,files)
              {
              	if(err)
              	{
              		reject(err);
              		console.error(err);
              		return;
              	}

                var bindkey = {
                  fields:fields,
                  files:files
                };

                resolve({status:true,data:bindkey});

              });

            }
            catch(e)
            {
              reject({status:false,msg:'Please install multiparty {npm install multiparty}'});
              console.error('Please install multiparty {npm install multiparty}');
            }

          }
          else
          {
            var body = '';
            hasteObj.req.on('data',function(data)
            {
              body += data;
            });

            hasteObj.req.on('end',function()
            {
              if(hasteObj.req.headers['content-type'] == 'application/json')
              {
                try
                {
                  var jsonData = JSON.parse(body);
                  resolve({status:true,data:jsonData});
                }
                catch(e)
                {
                  console.error(e);
                  reject({status:false,msg:e.stack.toString()});
                  console.error(e.stack.toString());
                }
              }
              else
              {
                resolve({status:true,data:qs.parse(body)});
              }
            });
          }
        }
        else
        {
        	reject({status:false,msg:'No content-type header is present in the request'});
        	console.error('No content-type header is present in the request');
        }
	});
}

async function fileStat(filePath)
{
	return new Promise((resolve,reject)=>{
		fs.stat(filePath,function(err,result)
		{
			if(err)
			{
				reject(err);
			}
			else
			{
				resolve(result);
			}
		});
	});	
}

function GlobalException(message,stack)
{
   this.message = message;
   this.stack = stack;
}

async function closeConnection(message)
{
	if(message !== "Exception")
	{
		console.log("Server is closing gracefully");
		if(hasteObj.server != null)
		{
			hasteObj.server.close();
		}
		console.log("#######################################################################");
		console.log("Server closed");
		process.exit(0);
	}
}

let session = {
  currentSession:'',
  set:function(key,value)
  {
    // if cookie is not undefined

    if(typeof(hasteObj.req.headers.cookie) != 'undefined')
    {
      // getting the number of session cookie

      var sessionCookie = hasteObj.req.headers.cookie;
      sessionCookie = sessionCookie.split(';');
      var sessionCookieLen = sessionCookie.length;
      var nullCount = 0;

      // iterating through the session

      for(var i=0;i<sessionCookieLen;i++)
      {
        // spliting the session into array

        sessionCookie[i] = sessionCookie[i].split('=');
        sessionKey = sessionCookie[i][0].trim();

        // if the hastssid cookie is found

        if(sessionKey === 'HASTESSID')
        {
          // if the session value is undefined

          if(typeof(sessionObj[sessionCookie[i][1]]) == 'undefined')
          {
            // then creating object

            sessionObj[sessionCookie[i][1]] = {};
          }
          // and setting value to it

          sessionObj[sessionCookie[i][1]]['time'] = new Date();
          sessionObj[sessionCookie[i][1]][key] = value;
          break;
        }
        else
        {
          // else incrementing the nullCount
          nullCount += 1;
        }
      }

      // if nullCount == sessionCookieLen

      if(nullCount == sessionCookieLen)
      {
        // creating session new id

        if(session.currentSession == '')
        {
          session.currentSession = makeid();

          // if object is undefined then creating new object

          if(sessionObj[session.currentSession] == undefined)
          {
            sessionObj[session.currentSession] = {};
          }
        }
        // setting value to the object
        sessionObj[session.currentSession][key] = value;
        sessionObj[session.currentSession]['time'] = new Date();
        hasteObj.res.setHeader('Set-Cookie','HASTESSID='+session.currentSession);
      }
    }
    else
    {
      if(session.currentSession == '')
      {
        // creating session new id

        session.currentSession = makeid();

        if(sessionObj[session.currentSession] == undefined)
        {
          sessionObj[session.currentSession] = {};
        }

        sessionObj[session.currentSession][key] = value;
        sessionObj[session.currentSession]['time'] = new Date();
      }
      else
      {
        sessionObj[session.currentSession][key] = value;
        sessionObj[session.currentSession]['time'] = new Date();
      }

      hasteObj.res.setHeader('Set-Cookie','HASTESSID='+session.currentSession);
    }
  },
  get:function(key)
  {
    // getting the cookie headers
    var sessionValue = hasteObj.req.headers.cookie;

    // if the cookie header is not empty

    if(sessionValue != '')
    {
      // if cookie is not undefined

      if(typeof(hasteObj.req.headers.cookie) != 'undefined')
      {
        // getting the length of the cookie

        var sessionCookie = hasteObj.req.headers.cookie;
        sessionCookie = sessionCookie.split(';');
        var sessionCookieLen = sessionCookie.length;
        var nullCount = 0;

        // iterating through it

        for(var i=0;i<sessionCookieLen;i++)
        {
          sessionCookie[i] = sessionCookie[i].split('=');
          sessionKey = sessionCookie[i][0].trim();

          if(sessionKey === 'HASTESSID')
          {
            if(typeof(sessionObj[sessionCookie[i][1]]) != 'undefined')
            {
              sessionObj[sessionCookie[i][1]]['time'] = new Date();
              return sessionObj[sessionCookie[i][1]][key];
            }
            else
            {
              return null;
            }

            break;
          }
          else
          {
            nullCount += 1;
          }
        }

        // if none cookie is matched then null is returned

        if(nullCount == sessionCookieLen)
        {
          return null;
        }
      }
      else
      {
        // if cookie is undefined and current session is not undefined then it is returned else null

        if(sessionObj[this.currentSession] != undefined)
        {
          sessionObj[this.currentSession]['time'] = new Date();
          return sessionObj[this.currentSession][key];
        }
        else
        {
          return null;
        }
      }
    }
    else
    {
      return null;
    }
  },
  del:function(key)
  {
    var sessionValue = hasteObj.req.headers.cookie;
    if(sessionValue != '')
    {
      // if cookie is found
      if(typeof(hasteObj.req.headers.cookie) != 'undefined')
      {
        var sessionCookie = hasteObj.req.headers.cookie;
        sessionCookie = sessionCookie.split(';');
        var sessionCookieLen = sessionCookie.length;
        var nullCount = 0;

        for(var i=0;i<sessionCookieLen;i++)
        {
          sessionCookie[i] = sessionCookie[i].split('=');
          sessionKey = sessionCookie[i][0].trim();

          if(sessionKey === 'HASTESSID')
          {
            if(typeof(sessionObj[sessionCookie[i][1]]) != 'undefined')
            {
              sessionObj[sessionCookie[i][1]][key] = null;
              delete sessionObj[sessionCookie[i][1]][key];
              sessionObj[sessionCookie[i][1]]['time'] = new Date();
              return true;
            }
            else
            {
              return false;
            }

            break;
          }
          else
          {
            nullCount += 1;
          }
        }

        if(nullCount == sessionCookieLen)
        {
          return false;
        }
      }
      else
      {
        return false;
      }
    }
    else
    {
      return false;
    }
  },
  destroy:function()
  {
    var sessionValue = hasteObj.req.headers.cookie;
    if(sessionValue != '')
    {
      // if cookie is found
      if(typeof(hasteObj.req.headers.cookie) != 'undefined')
      {
        var sessionCookie = hasteObj.req.headers.cookie;
        sessionCookie = sessionCookie.split(';');
        var sessionCookieLen = sessionCookie.length;
        var nullCount = 0;

        for(var i=0;i<sessionCookieLen;i++)
        {
          sessionCookie[i] = sessionCookie[i].split('=');
          sessionKey = sessionCookie[i][0].trim();

          if(sessionKey === 'HASTESSID')
          {
            if(typeof(sessionObj[sessionCookie[i][1]]) != 'undefined')
            {
              sessionObj[sessionCookie[i][1]] = null;
              delete sessionObj[sessionCookie[i][1]];
              hasteObj.res.setHeader('Set-Cookie','HASTESSID=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
              
              return true;
            }
            else
            {
              return false;
            }

            break;
          }
          else
          {
            nullCount += 1;
          }
        }

        if(nullCount == sessionCookieLen)
        {
          return false;
        }
      }
      else
      {

        // if session is undefined but current session is not undefined then it is deleted else return false

       if(typeof(sessionObj[this.currentSession]) != 'undefined')
        {
          sessionObj[this.currentSession] = null;
          delete sessionObj[this.currentSession];
          this.currentSession = '';
          hasteObj.res.setHeader('Set-Cookie','HASTESSID=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
          return true;
        }
        else
        {
          return false;
        }
      }
    }
    else
    {
      // if session is empty and current session is not undefined
      
      if(typeof(sessionObj[this.currentSession]) != 'undefined')
      {
        sessionObj[this.currentSession] = null;
        delete sessionObj[this.currentSession];
        this.currentSession = '';
        hasteObj.res.setHeader('Set-Cookie','HASTESSID=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
        return true;
      }
      else
      {
        return false;
      }
    }
  },
  clearSession:function()
  {
    setInterval(function()
    {
      var date = new Date();
      for(var key in sessionObj)
      {
        if(config.server.sessionTimeout == undefined || typeof(config.server.sessionTimeout) != 'number' || config.server.sessionTimeout == '')
        {
          if(Math.round((date - sessionObj[key]['time'])/1000) > 30)
          {
            sessionObj[key] = null;
            delete sessionObj[key];
          }
        }
        else
        {
          if(Math.round((date - sessionObj[key]['time'])/1000) > parseInt(config.server.sessionTimeout))
          {
            sessionObj[key] = null;
            delete sessionObj[key];
          }
        }
      }
    },960000);
  }
};

async function writeLogs(path,data,callback = null)
{
    return new Promise((resolve,reject)=>{
    	fs.open(path, 'w', function(err, fd)
	    {
	        if(err)
	        {
	            reject({err:err,status:false});
	        }

	        fs.write(fd, data,function(err)
	        {
	            if(err)
	            {
	                reject({err:err,status:false});
	            }
	            else
	            {
	                fs.close(fd, function()
	                {
	                    resolve({msg:'Write successfully',status:true});
	                });
	            }
	        });
	    });
    }); 
}

async function Authorization(req)
{
    return new Promise((resolve,reject)=>{
    	try
	    {
	        let auth = hasteObj.req.headers['authorization'].split(' ')[1];

	        let decodedHeader = new Buffer(auth, 'base64').toString();

	        decodedHeader = decodedHeader.split(':');

	        resolve(decodedHeader);

	    }
	    catch(e)
	    {
	        reject(e);
	    }
    });
}



// getting cookies

async function getCookies(req)
{
    return new Promise((resolve,reject)=>{
    	try
    	{
    		var list = {},rc = hasteObj.req.headers.cookie;

		    rc && rc.split(';').forEach(function( cookie )
		    {
		        var parts = cookie.split('=');
		        
		        list[parts.shift().trim()] = decodeURI(parts.join('='));
		    });

		    resolve(list);
    	}
    	catch(e)
    	{
    		reject(e);
    	}
    });
}

// setting cookies



async function setCookies(cookies)
{
    return new Promise((resolve,reject)=>{
    	try
    	{
    		var list = [ ];

		    for (var key in cookies)
		    {
		        list.push(key + '=' + encodeURIComponent(cookies[key]));
		    }

		    hasteObj.cookieStatus = list.join('; ');

		    resolve({"Set-Cookie":list.join('; ')});
    	}
    	catch(e)
    	{
    		reject(e);
    	}
    });
}



// getting userAgents browser details



async function getUserAgent(req)
{
    return new Promise((resolve,reject)=>{
    	try
    	{
    		if(typeof(hasteObj.req.headers['user-agent']) != 'undefined' && hasteObj.req.headers['user-agent'] != '')
	        {
	            resolve(hasteObj.req.headers['user-agent']);
	        }
	        else
	        {
	            reject(null);
	        }
    	}
    	catch(e)
    	{
    		reject(e);
    	}
    });
}


// send response for 401 authorization


async function sendAuthorization(msg)
{
    return new Promise(async ()=>{
    	try
    	{
    		if(!hasteObj.res.headersSent)
	        {
	          hasteObj.res.writeHead(401,{
	            'Keep-Alive':' timeout=5, max=500',
	            'Server': 'Node Server',
	            'Developed-By':'Pounze It-Solution Pvt Limited',
	            'Content-Type':'text/html',
	            'WWW-Authenticate':'Basic realm="'+msg+'"'
	          });
	        }
	        
	        var readerStream = await readFiles('./error_files/'+config.errorPages.NotAuthorized);

	        readerStream.on('error', function(error)
		    {
	            hasteObj.res.writeHead(404, 'Not Found');
	        	hasteObj.res.end();
	        });

	        readerStream.pipe(hasteObj.res);

	        hasteObj.res.on("end",function()
	        {
	          readerStream.destroy();
	        });
    	}
    	catch(e)
    	{
    		reject(e);
    	}
    });
}



// checking for 401 authorization username and password



function checkAuth(req)
{
    try
    {
    	if(typeof(hasteObj.req.headers['authorization']) == 'undefined')
	    {
	        return false;
	    }
	    else
	    {
	        return true;
	    }
    }
    catch(e)
    {
    	return false;
    	console.error(e);
    }
}

async function renderPage(Render,page,code = null,headers = null,compression = null)
{
	// zip compression

	if(compression != null)
	{
	    hasteObj.res.setHeader('content-encoding','gzip');
	}

	/*

   		It checks for array if find and replace is array or not

  	*/

  	if(typeof(Render) == 'object' && !Array.isArray(Render))
  	{
  		try
    	{
    		/*
		        Checks for file existence using synchronous file reader

		    */

	      	var stat = await fileStat('./views/'+page+'.html');

	      	var data = [];

	      	var regexData;

	      	/*
		        verifies if its file or directory
		    */

		    if(stat.isFile())
		    {
		    	var modifiedDate = new Date(stat.mtimeMs).getTime();

		        /*

		          If it is file then readstream

		        */

		        var readerStream = fs.createReadStream('./views/'+page+'.html');

				var data = [];

				readerStream.on('error', function(error)
			    {
		            hasteObj.res.writeHead(404, 'Not Found');
		          	hasteObj.res.end();
		        });

		        readerStream.on('data',function(chunk)
		        {
		          data.push(chunk);
		          // activating zip compression for html pages, javascript, images, and css   
		        });

			    readerStream.on('end',function()
			    {
			    	data = Buffer.concat(data).toString();
	    	
			        for(var key in Render)
			        { 
			            regexData = new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),"g");
			            data = data.replace(regexData, Render[key]);
			        }

			    	if(headers == null)
		          	{

			            if(!hasteObj.res.headersSent)
			            {
			              hasteObj.res.setHeader("Keep-Alive","timeout=5, max=500");
			              hasteObj.res.setHeader("Server","Node Server");
			              hasteObj.res.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
			              hasteObj.res.setHeader('Cache-Control','public,max-age=31536000');
			              hasteObj.res.setHeader('Pragma','public,max-age=315360008');
			              hasteObj.res.setHeader('Content-Type','text/html');
			              hasteObj.res.setHeader('Expires',new Date());
			              hasteObj.res.setHeader('ETag',modifiedDate);
			            }

			            if(hasteObj.cookieStatus)
			            {
			              hasteObj.res.setHeader("Set-Cookie",hasteObj.cookieStatus);
			            }

			            if(hasteObj.maintainanceStat != config.server.maintainance)
			            {
			              hasteObj.maintainanceStat = config.server.maintainance;
			              hasteObj.res.statusCode = 200;
			            }
			            else
			            {
			              if(typeof(hasteObj.req.headers['if-none-match']) == 'undefined')
			              {
			                hasteObj.res.statusCode = 200;
			              }
			              else
			              {
			                if(hasteObj.req.headers['if-none-match'] != modifiedDate)
			                {
			                  hasteObj.res.statusCode = 200;
			                }
			                else
			                {
			                  hasteObj.res.statusCode = 304;
			                }
			              }
			            }
			        }
			        else
			        {
			          hasteObj.res.writeHead(code,headers);
			        }

			        hasteObj.res.end(data);
			    });

			    hasteObj.res.on("end",function()
			    {
			      readerStream.destroy();
			    });
		    }
		    else
			{
			    console.error('View template page name must be a javascript file');
			}
    	}
    	catch(e)
    	{
    		if(!hasteObj.res.headersSent)
	        {
	          hasteObj.res.writeHead(500,hasteObj.header500);
	        }
	       
	        var readerStream = await readFiles('./error_files/'+config.errorPages.InternalServerError);

	        readerStream.pipe(hasteObj.res);

	        hasteObj.res.on("end",function()
	        {
	          readerStream.destroy();
	        });

	        console.error(e);
    	}
  	}
  	else
  	{
  		console.error('Render variable must be an object');
  	} 
}

// method to copy file from temp folder use for file uploading

async function fileCopy(path,pathDir)
{
    return new Promise((reject,resolve)=>{

    	fs.readFile(path,function(error, data)
	    {
	    	if(error)
	    	{
	    		reject(false);
	    		return;
	    	}

		    fs.writeFile(pathDir,data,function(error)
		    {
		        if(error)
		        {
		          reject(false);
		          return;
		        }

		        resolve(true);

		    });

	    });

    });
}



// filereader to read  files in buffers



async function fileReader(path)
{
    return new Promise((resolve,reject)=>{

    	var data = '';

	    readerStream = fs.createReadStream(path);

	    readerStream.on('data',function(chunk)
	    {
	      data += chunk;
	    });

	    readerStream.on('end',function()
	    {
	    	resolve(data);
	      	readerStream.destroy();
	    });

	    readerStream.on('error',function(error)
	    {
	    	reject(error);
	      	readerStream.destroy();
	    });
    });
}



// formatting dates



function formatDate(date)
{

    try
    {
    	month = '' + (date.getMonth() + 1),

	    day = '' + date.getDate(),

	    year = date.getFullYear(),

	    hour = date.getHours(),

	    min = date.getMinutes(),

	    sec = date.getSeconds();


	    if (month.length < 2) month = '0' + month;

	    if (day.length < 2) day = '0' + day;

	    if (hour.length < 2) hour = '0' + hour;

	    if (min.length < 2) min = '0' + min;

	    if (sec.length < 2) sec = '0' + sec;



	    return [year, month, day].join('-')+' '+hour+':'+min+':'+sec;
    }
    catch(e)
    {
    	console.error(e);
    }
}



// hash method to encypt data



function Hash(method,string,encoding)
{
    try
    {
    	var crypto = require('crypto');

	    var hash = '';

	    if(method == 'sha256')
	    {
	      if(encoding == 'hex')
	      {
	        hash = crypto.createHash('sha256').update(string).digest('hex');
	      }
	      else if(encoding == 'base64')
	      {
	        hash = crypto.createHash('sha256').update(string).digest('base64');
	      }
	    }
	    else if(method == 'sha512')
	    {
	      const key = 'IgN!TiOn11!1234567890!@#$%^&*()';
	      
	      if(encoding == 'hex')
	      {
	        hash = crypto.createHmac('sha512', key).update(string).digest('hex');
	      }
	      else if(encoding == 'base64')
	      {
	        hash = crypto.createHmac('sha512', key).update(string).digest('base64');
	      }
	    }
	    else if(method == 'sha1')
	    {
	      if(encoding == 'hex')
	      {
	        hash = crypto.createHash('sha1').update(string).digest('hex');
	      }
	      else if(encoding == 'base64')
	      {
	        hash = crypto.createHash('sha1').update(string).digest('base64');
	      }
	    }
	    else if(method == 'md5')
	    {
	      if(encoding == 'hex')
	      {
	        hash = crypto.createHash('md5').update(string).digest('hex');
	      }
	      else if(encoding == 'base64')
	      {
	        hash = crypto.createHash('md5').update(string).digest('base64');
	      }
	    }
	    else
	    {
	      hash = 'Please select a valid hashing method';
	    } 

	    return hash;
    }
    catch(e)
    {
    	console.error(e);
    }
}



// method to make http client request to other server



function RemoteRequest(params,callback)
{
	return new Promise((resolve,reject)=>{

		var postData = '';

	    var data = '';

	    if(params.protocol == 'http')
	    {

	      if(typeof(params.message) != 'undefined')
	      {
	        postData = params.message;
	      }

	      var req = http.request(params.options,function(res)
	      {

	        // on data event is fired call back is append into data variable

	        res.on('data', function(chunk)
	        {
	           data += chunk;

	        });

	        // after ending the request

	        res.on('end',function()
	        {
	          resolve(data);

	           // console.error('No more data in response.');
	        });

	      });

	      req.on('error',function(e)
	      {
	        reject(`problem with request: ${e.message}`);
	      });

	      // write data to request body

	      req.write(JSON.stringify(postData));

	      req.end();

	    }

	    if(params.protocol == 'https')
	    {

	      if(typeof(params.message) != 'undefined')
	      {
	        postData = params.message;
	      }

	      var req = https.request(params.options,function(res)
	      {
	        // on data event is fired call back is append into data variable

	        res.on('data', function(chunk)
	        {
	           data += chunk;
	        });

	        // after ending the request
	        res.on('end',function()
	        {
	          resolve(data);
	           // console.error('No more data in response.');
	        });

	      });

	      req.on('error',function(e)
	      {
	        reject(`problem with request: ${e.message}`);
	      });

	      // write data to request body

	      req.write(JSON.stringify(postData));

	      req.end();

	    }
	});	
}

/*
  create unique session id
*/
function makeid()
{
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"+(new Date).getTime();

  for (var i = 0; i < 30; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

/*
  session object, this session object sets value in memory not in file so reseting server will delete all sessions
*/



/*
  compression library
*/

var compress = {
  gzip:function(data)
  {
    var zlib = require('zlib');
    hasteObj.res.setHeader('content-encoding','gzip');

    zlib.gzip(data, function (_, result)
    { 
      hasteObj.res.end(result);              
    });
  },
  deflate:function(data)
  {
    var zlib = require('zlib');
    hasteObj.res.setHeader('content-encoding','deflate');
    zlib.deflate(data, function (_, result)
    { 
      hasteObj.res.end(result);                 
    });
  },
  DeflateRaw:function(data)
  {
    var zlib = require('zlib');
    hasteObj.res.setHeader('content-encoding','deflate');
    zlib.deflateRaw(data, function (_, result)
    { 
      hasteObj.res.end(result);                 
    });
  }
}; 

session.clearSession();

process.on('uncaughtException', error => {
  console.warn(`Uncaught exception: ${error.toString()}`)
  closeConnection("Exception")
})
process.on('SIGINT', signal => {
  console.warn(`Received ${signal} signal.`)
  closeConnection("CtrlC")
})
process.on('exit', code => {
  console.warn(`About to exit with code ${code}.`)
  closeConnection("exit")
})

exports.init = haste;

exports.defaultHeaders = defaultHeaders;

exports.renderPage = renderPage;

exports.fileCopy = fileCopy;

exports.fileReader = fileReader;

exports.formatDate = formatDate;

exports.Hash = Hash;

exports.RemoteRequest = RemoteRequest;

exports.writeLogs = writeLogs;

exports.Authorization = Authorization;

exports.checkAuth = checkAuth;

exports.sendAuthorization = sendAuthorization;

exports.getCookies = getCookies;

exports.setCookies = setCookies;

exports.getUserAgent = getUserAgent;

exports.session = session;

exports.compress = compress;

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

const viewsObj = require('../common_templates/common_templates.js');

const sessionObj = require(__dirname+'/session.js');

const mimeList = require('./MimeList.js');

const CachedFiles = require('./CachedFiles.js');


/*

  haste method is declared where Library constructor is called

*/


var haste = function(params)
{
  if(typeof(__rootdir) == 'undefined')
  {
    console.error("__rootdir must be defined as __dirname in the app.js | server.js or what ever root file");
    process.exit(1);
    return;
  }

  if(config.cache.staticFiles)
  {
    try
    {
      CachedFiles.staticFiles.File404 = {
        fileStat:fs.statSync(__rootdir+"/error_files/404.html"),
        data:fs.readFileSync(__rootdir+"/error_files/404.html")
      };

      CachedFiles.staticFiles.File401 = {
        fileStat:fs.statSync(__rootdir+"/error_files/401.html"),
        data:fs.readFileSync(__rootdir+"/error_files/401.html")
      };

      CachedFiles.staticFiles.File403 = {
        fileStat:fs.statSync(__rootdir+"/error_files/403.html"),
        data:fs.readFileSync(__rootdir+"/error_files/403.html")
      };

      CachedFiles.staticFiles.File500 = {
        fileStat:fs.statSync(__rootdir+"/error_files/500.html"),
        data:fs.readFileSync(__rootdir+"/error_files/500.html")
      };
    }
    catch(e)
    {
      console.log(e);
      return;
    }
  }

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

  this.socket = null;

  this.AllowModules = {};

  var date = new Date();

  date.setMonth(date.getMonth() + 1);

  this.header404 = {
  	'Server': 'Node Server',
  	'Developed-By':'Pounze It-Solution Pvt Limited',
  	'Content-Type':'text/html',
    'Cache-Control':'public, max-age=350000',
    'Pragma':'public, max-age=350000',
    'Expires':date
  };

  this.header500 = {
  	'Server': 'Node Server',
  	'Developed-By':'Pounze It-Solution Pvt Limited',
  	'Content-Type':'text/html',
    'Cache-Control':'public, max-age=350000',
    'Pragma':'public, max-age=350000',
    'Expires':date
  };

  this.header403 = {
    'Server': 'Node Server',
    'Developed-By':'Pounze It-Solution Pvt Limited',
    'Content-Type':'text/html',
    'Cache-Control':'public, max-age=350000',
    'Pragma':'public, max-age=350000',
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
  HttpsServer:function(ip,port,options,callback = null)
  {
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

        hasteObj.server.on('request', function(req, res)
        {
          handleRequest(req,res);
        });

        hasteObj.server.on('connection',function(socket)
        { 
          socket.timeout = config.server.socketTimeout;
          socket.setTimeout(config.server.socketTimeout);

          hasteObj.socket = socket;

          hasteObj.socket.on('timeout', () => {
            hasteObj.socket.end();
          });
        });

        hasteObj.server.setMaxListeners(config.server.maxListeners);

        hasteObj.server.on('clientError', (err, socket) => {
           hasteObj.socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });

        /*

           Server listening and closing the server

        */

        hasteObj.server.listen(port,ip);

        if(callback != null)
        {
          callback(hasteObj.server);
        }
      }
    }
    catch(e)
    {
      if(callback != null)
      {
        callback(e);
      }
    }
  },
  HttpServer:function(ip,port,callback = null)
  {
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

        /*
            Http server configurations
        */

        hasteObj.server.on('request', function(req, res)
        {
          handleRequest(req,res);
        });

        hasteObj.server.on('connection',function(socket)
        { 
          socket.timeout = config.server.socketTimeout;
          socket.setTimeout(config.server.socketTimeout);

          hasteObj.socket = socket;

          hasteObj.socket.on('timeout', () => {
            hasteObj.socket.end();
          });
        });

        hasteObj.server.setMaxListeners(config.server.maxListeners);

        hasteObj.server.on('clientError', (err, socket) => {
           hasteObj.socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });

        /*

           Server listening and closing the server

        */

        hasteObj.server.listen(port,ip);

        if(callback != null)
        {
          callback(hasteObj.server);
        }
      }
    }
    catch(e)
    {
      if(callback != null)
      {
        callback(e);
      }
    }
  },
  DefaultMethod:function(callback)
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
  put:function(uri,argument)
  {

  },
  delete:function(uri,argument)
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
  views:function(file,req,res,data)
  {
    /*
      views get file and send data
    */
    try
    {
      var commongData = viewsObj.init(req,res,data);

      fs.stat(__rootdir+'/templates/'+file+'.js',function(err,stat)
      {
        if(err)
        {
          renderErrorFiles(404);
          return;
        }

        if(stat != undefined && stat.isFile())
        { 
          var modifiedDate = new Date(stat.mtimeMs).getTime();

          if(!res.headersSent)
          {
            if(typeof(req.headers['if-none-match']) == 'undefined')
            {
              res.setHeader('ETag',modifiedDate);
              res.statusCode = 200;
            }
            else
            {
              res.setHeader('ETag',modifiedDate);

              if(req.headers['if-none-match'] != modifiedDate)
              {
                res.statusCode = 200;
              }
              else
              {
                res.statusCode = 304;
              }
            }
          }

          var views = require(__rootdir+'/templates/'+file+'.js');

          views.init(req,res,data,commongData);
        }
        else
        {
          console.error('View template page name must be a javascript file');
        }
      });
    }
    catch(e)
    {
      console.error(e);

      renderErrorFiles(500);
    }

  },
  BlockDirectories:function(path)
  {
    // allow folders to get accessed
    hasteObj.staticPath = path;
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

function modules(req,res,obj)
{

  try
  {
  	/*

      checking for middleware if array or string 

      if array then multiple middleware

      else single middleware

    */

    if(typeof(hasteObj.globalObject[obj]["middleware"]) != 'undefined')
    {
      if(typeof(hasteObj.globalObject[obj]["middleware"]) == 'object' && Array.isArray(hasteObj.globalObject[obj]["middleware"]))
      {
        let middlewareLen = hasteObj.globalObject[obj]["middleware"].length;

        for(var j=0;j<middlewareLen;j++)
        {
          processMiddlewares(req,res,obj,j,middlewareLen);   
        }
      }
      else if(typeof(hasteObj.globalObject[obj]["middleware"]) == 'string')
      {
        fs.stat(__rootdir+'/middlewares/'+hasteObj.globalObject[obj]["middleware"]+'.js',function(err,middlewarestat)
        {
          if(stat)
          {
            renderErrorFiles(req,res,404);
            return;
          }

          if(middlewarestat != undefined && middlewarestat.isFile())
          {
            let middlewareFile = require(__rootdir+'/middlewares/'+hasteObj.globalObject[obj]["middleware"]+'.js');

            let middlewareCallbacks = middlewareFile.init(req,res,hasteObj.input);

            if(middlewareCallbacks != undefined && middlewareCallbacks[0] != undefined && !middlewareCallbacks[0])
            {
              res.setHeader('Content-Type','application/json');
              res.end(JSON.stringify(middlewareCallbacks[1]));
              return false;
            }
            else
            {
              hasteObj.input[hasteObj.globalObject[obj]["middleware"]] = middlewareCallbacks[1];
              executeMethod(req,res,obj);
            }
          }
          else
          {
            console.error('Middlware must be a javascript file');
          }

        });
      }
      else
      {
        console.error("Middleware must be string or array");
      }
    }  
    else
    {
      executeMethod(req,res,obj);
    }
  }
  catch(e)
  {
  	console.error(e);
  }   
}

function processMiddlewares(req,res,obj,j,middlewareLen)
{
  try
  {
    // checking if the middleware file exists or not

    fs.stat(__rootdir+'/middlewares/'+hasteObj.globalObject[obj]["middleware"][j]+'.js',function(err,middlewarestat)
    {
      if(err)
      {
        renderErrorFiles(req,res,404);
        return;
      }

      // if the middleware is a file

      if(middlewarestat != undefined && middlewarestat.isFile())
      {
        // then invoke the middleware main method

        var middlewareFile = require(__rootdir+'/middlewares/'+hasteObj.globalObject[obj]["middleware"][j]+'.js');

        var middlewareCallbacks = middlewareFile.init(req,res,hasteObj.input);

        if(middlewareCallbacks != undefined && middlewareCallbacks[0] != undefined && !middlewareCallbacks[0])
        {
          // if middleware callback is false then request is stopped here

          res.setHeader('Content-Type','application/json');

          res.end(JSON.stringify(middlewareCallbacks[1]));

        }
        else
        {
          hasteObj.input[hasteObj.globalObject[obj]["middleware"][j]] = middlewareCallbacks[1];
        }

        if((j + 1) == middlewareLen)
        {
          executeMethod(req,res,obj);
        }
      }
      else
      {
        console.error('Middlware must be a javascript file');
      }

    });
  }
  catch(e)
  {
    // if file is not found of the middleware then 500 internal server error is thrown

    console.error(e);

    renderErrorFiles(req,res,500);
  }
}

function executeMethod(req,res,obj)
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

     fs.stat(__rootdir+'/controllers/'+hasteObj.globalObject[obj]["argument"]+'.js',function(err,stat)
     {
        if(err)
        {
          renderErrorFiles(req,res,404);
          return;
        }

        if(stat.isFile())
        {
          var controller = require(__rootdir+'/controllers/'+hasteObj.globalObject[obj]["argument"]+'.js');

          controller.init(req,res,hasteObj.input);
        }
        else
        {
          console.error('Controller must me a javascript file');
        }
     });

    }
    catch(e)
    {
      console.error(e);

      renderErrorFiles(req,res,500);
    }
  }
  else
  {
    console.error('Route\'s second argument must me function of string ' + typeof(hasteObj.argument[i]) + ' given');
  }

}

function executeModules()
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

function getIpAddress(req,res)
{
  /*
    Requiring IP address to get use ip address 
  */

  let getIpObject = require('../blockusers/IpAddress.js');

  let ip;

  if (req.headers['x-forwarded-for'])
  {
    ip = req.headers['x-forwarded-for'].split(",")[0];
  }
  else if(req.connection && req.connection.remoteAddress)
  {
    ip = req.connection.remoteAddress;
  } 
  else
  {
    ip = req.ip;
  }

  /*
      matching the ip address and status
  */

  if(getIpObject[ip])
  {
    if(!res.headersSent)
    {
      res.writeHead(404,hasteObj.header404);
    }

    res.end('Something went wrong');
    return false;
  }
}

function serveStaticFiles(req,res,requestUri,ext)
{
  fs.exists(requestUri, function (exist)
  {
    if(!exist)
    {
      // if the file is not found, return 404
      res.statusCode = 404;
      res.end(`File ${requestUri} not found!`);
      return;
    }

    fs.stat(requestUri,function(err,stat)
    {
      if(err)
      {
        renderErrorFiles(req,res,404);
        return;
      }

      var modifiedDate = new Date(stat.mtimeMs).getTime();

      if(!res.headersSent)
      {
        res.setHeader("Server","Node Server");
        res.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
        res.setHeader('ETag',modifiedDate);
      }

      if(typeof(req.headers['if-none-match']) != 'undefined')
      {
        if(req.headers['if-none-match'] == modifiedDate)
        {
          res.statusCode = 304;
        }
      }

      var fileName = PATHNAME.basename(requestUri);

      CachedFiles.staticFiles[fileName] = {};

      CachedFiles.staticFiles[fileName].stat = stat;

      fs.readFile(requestUri,function(err,data)
      {
        if(err)
        {
          renderErrorFiles(req,res,500);
          return;
        }

        CachedFiles.staticFiles[fileName].data = data;

        res.end(data);
      });

    });

  });
}

function handleRequest(req,res)
{
	try
	{
		if(typeof(defaultMethod) != 'undefined')
  	{
    	defaultMethod(req,res);
  	}

    session.currentSession = '';

    getIpAddress(req,res);

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

      res.end(JSON.stringify(data));
    }

    req.on('error',function()
    {
      console.error('Error in server');
      return false;
    });

    req.on("end", function()
    {
      // request ended normally
    });

    if(config.server.maintainance)
    {
      if(!res.headersSent)
      {
        res.setHeader("Server","Node Server");
        res.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
        res.setHeader("Content-Type","text/html");
      }
      
      var readerStream = fs.createReadStream(__rootdir+'/error_files/'+config.errorPages.MaintainancePage);

      readerStream.on('error', function(error)
      {
        res.writeHead(404, 'Not Found');
      	res.end();
      });

      readerStream.on('open', function()
      {
        readerStream.pipe(res);
      });

      readerStream.on('end',function()
      {
        readerStream.destroy();
      });

      return false;
    }

    let requestMethod = req.method;

  	let requestUri = url_module.parse(req.url).pathname;

  	let ext = (/[.]/.exec(requestUri)) ? /[^.]+$/.exec(requestUri) : undefined;

  	let myExp;

  	let notMatchCount = 0;

  	let tempMapping = '';

  	let uriListLen = 0;

    if(ext != undefined)
    {
      try
      {
        // checking for static files and have access to that folder

        var blockDirectory = false;

        if(hasteObj.staticPath.length > 0)
        {
          for(var i in hasteObj.staticPath)
          {
            url = hasteObj.staticPath[i].replace('/',"\\/");

            myExp = new RegExp(url+"[a-z0-9A-Z\.]*","i");

            var formatNotFound = false;

            if(requestUri.match(myExp))
            {
              blockDirectory = true;
              break;
            }
          }
        }

        if(blockDirectory == true || mimeList[PATHNAME.extname(ext['input'])] == undefined)
        {
          renderErrorFiles(req,res,403);
        }
        else
        {
          var fileName = PATHNAME.basename(requestUri);

          if(config.cache.staticFiles)
          {
            if(CachedFiles.staticFiles[fileName] == undefined)
            {
              serveStaticFiles(req,res,__rootdir+requestUri,ext);
            }
            else
            {
              var modifiedDate = new Date(CachedFiles.staticFiles[fileName].stat.mtimeMs).getTime();

              if(!res.headersSent)
              {
                res.setHeader("Server","Node Server");
                res.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
                res.setHeader('ETag',modifiedDate);
              }

              if(typeof(req.headers['if-none-match']) != 'undefined')
              {
                if(req.headers['if-none-match'] == modifiedDate)
                {
                  res.statusCode = 304;
                }
              }

              res.end(CachedFiles.staticFiles[fileName].data);
            }
          } 
          else
          {
            serveStaticFiles(req,res,__rootdir+requestUri,ext);
          }
        }
      }
      catch(e)
      {
        console.error(e);

        renderErrorFiles(req,res,500);
      }

      return;
    }

    /*
      Cortex Concept for accessing apis more directly and easily
    */

    if(requestUri == '/cortex')
    {
      if(requestMethod == 'POST')
      {
        parsePOST(req,res);
      }
      else
      {
        res.setHeader("Server","Node Server");
        res.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
        res.end("Cortex method does not support other request method");
        console.error("Cortex method does not support other request method");
      }

      return;
    }

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
      res.setHeader("Server","Node Server");
      res.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
  	  res.end("Please create a route");
      console.error('Please create a route');
      return false;
    }

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

          if(requestMethod == "GET")
          {
            parseGET(req,res,obj);
          }
          else if(requestMethod == "POST")
          {
            parsePOST(req,res,obj);
          }
          else
          {
            res.end("server not available, for other rest methods");
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
        renderErrorFiles(req,res,404);
      }
    }
	}
	catch(e)
	{
		console.error(e);
	}
}

function parseGET(req,res,obj)
{
  // parse get request
  try
  {
    var url_parsed = url_module.parse(req.url,true);
    
    hasteObj.input['requestData'] = url_parsed['query'];

    modules(req,res,obj);

  }
  catch(e)
  {
    console.error(e);
    console.error("Failed to parse get request");
  }
}

function parsePOST(req,res,obj)
{
	if(typeof(req.headers['content-type']) != 'undefined')
  {
    // parse post request 

    if((req.method == 'POST' &&  req.headers['content-type'].match(/(multipart\/form\-data\;)/g)))
    {
      try
      {
        var form = new hasteObj.AllowModules.multiparty.Form();

        form.parse(req,function(err,fields,files)
        {
          if(err)
          {
            console.error(err);
            return;
          }

          var bindkey = {
            fields:fields,
            files:files
          };

          hasteObj.input['requestData'] = bindkey;

          if(obj == undefined)
          {
            processRequest(req,res);
          }
          else
          {
            modules(req,res,obj);
          }

        });

      }
      catch(e)
      {
        console.error('Please install multiparty {npm install multiparty}');
      }

    }
    else
    {
      var body = '';
      req.on('data',function(data)
      {
        body += data;
      });

      req.on('end',function()
      {
        if(req.headers['content-type'] == 'application/json')
        {
          try
          {
            var jsonData = JSON.parse(body);

            hasteObj.input['requestData'] = jsonData;

            if(obj == undefined)
            {
              processRequest(req,res,);
            }
            else
            {
              modules(req,res,obj);
            }
          }
          catch(e)
          {
            console.error(e);
          }
        }
        else
        {
          hasteObj.input['requestData'] = qs.parse(body);

          if(obj == undefined)
          {
            processRequest(req,res);
          }
          else
          {
            modules(req,res,obj);
          }
        }
      });
    }
  }
  else
  {
    console.error('No content-type header is present in the request');
  }
}

function processRequest(req,res)
{
  if(req.method == 'POST')
  {
    var mapping = hasteObj.input['requestData']['mapping'];
    var cortex = hasteObj.input['requestData']['cortex'];
  }
  else
  {
    var mapping = hasteObj.input['query']['mapping'];
    var cortex = hasteObj.input['query']['cortex'];
  }

  var tempMapping = '';

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

  fs.stat(__rootdir+'/controllers/'+tempMapping+'/'+cortex+'.js',function(err,stat)
  { 
    if(err)
    {
      console.error('Controller must me a javascript file'); 
      return;
    }

    var controller = require(__rootdir+'/controllers/'+tempMapping+'/'+cortex+'.js');

    controller.init(req,res,hasteObj.input);

  });
}

function GlobalException(message,stack)
{
  this.message = message;
  this.stack = stack;
}

function closeConnection(message)
{
	if(message !== "Exception")
	{
		console.log("Server is closing gracefully");
		if(hasteObj.server != null)
		{
			hasteObj.server.close();
		}

    if(hasteObj.socket != null)
    {
      hasteObj.socket.end();
    }

		console.log("#######################################################################");
		console.log("Server closed");
		process.exit(0);
	}
}



function renderPage(req,res,Render,page,code = null,headers = null,compression = null)
{
  // zip compression

  if(compression != null)
  {
    res.setHeader('content-encoding','gzip');
  }

  if(typeof(Render) == 'object' && !Array.isArray(Render))
  {
    try
    {
      /*
        Checks for file existence using synchronous file reader
      */

      if(config.cache.Document)
      {
        if(CachedFiles.staticFiles[page] == undefined)
        {
          serveDocumentFile(req,res,Render,page,code,headers,compression);
        }
        else
        {
          var modifiedDate = new Date(CachedFiles.staticFiles[page].stat.mtimeMs).getTime();

          if(headers == null)
          {
            if(!res.headersSent)
            {
              res.setHeader("Server","Node Server");
              res.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
              res.setHeader('Content-Type','text/html');
              res.setHeader('ETag',modifiedDate);
            }

            if(hasteObj.cookieStatus)
            {
              res.setHeader("Set-Cookie",hasteObj.cookieStatus);
            }

            if(hasteObj.maintainanceStat != config.server.maintainance)
            {
              hasteObj.maintainanceStat = config.server.maintainance;
            }
            else
            {
              if(typeof(req.headers['if-none-match']) != 'undefined')
              {
                if(req.headers['if-none-match'] == modifiedDate)
                {
                  res.statusCode = 304;
                }
              }
            }
          }

          res.end(CachedFiles.staticFiles[page].data);
        }
      }
      else
      {
        serveDocumentFile(req,res,Render,page,code,headers,compression);
      }
    }
    catch(e)
    {
      console.log(e);
    }
  }
  else
  {
    console.error('Render variable must be an object');
  }
}

function serveDocumentFile(req,res,Render,page,code,headers,compression)
{
  let pathname = PATHNAME.join(__rootdir, "/views/"+page+'.html');

  fs.stat(pathname, function(err,stat)
  {
    if(err)
    {
      renderErrorFiles(req,res,404);  
      return;
    }

    var modifiedDate = new Date(stat.mtimeMs).getTime();

    CachedFiles.staticFiles[page] = {
      stat:stat
    };

    if(stat.isDirectory())
    {
      pathname += '/index.html';
    }

    var data = '';

    var readerStream = fs.createReadStream(pathname);

    readerStream.on('data', function(chunk)
    {
      data += chunk;
    });

    readerStream.on('end',function()
    {
      CachedFiles.staticFiles[page].data = data;

      readerStream.destroy();

      for(var key in Render)
      { 
        regexData = new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),"g");

        data = data.replace(regexData, Render[key]);
      }

      data = Buffer.from(data, "binary");

      if(headers == null)
      {

        if(!res.headersSent)
        {
          res.setHeader("Server","Node Server");
          res.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
          res.setHeader('Content-Type','text/html');
          res.setHeader('ETag',modifiedDate);
        }

        if(hasteObj.cookieStatus)
        {
          res.setHeader("Set-Cookie",hasteObj.cookieStatus);
        }

        if(hasteObj.maintainanceStat != config.server.maintainance)
        {
          hasteObj.maintainanceStat = config.server.maintainance;
        }
        else
        {
          if(typeof(req.headers['if-none-match']) != 'undefined')
          {
            if(req.headers['if-none-match'] == modifiedDate)
            {
              res.statusCode = 304;
            }
          }
        }
      }
      else
      {
        res.writeHead(code,headers);
      }

      res.end(data);
    });

    readerStream.on('error',function()
    {
      renderErrorFiles(req,res,404);
    });

  });
}

function renderErrorFiles(req,res,statusCode)
{
  if(statusCode === 404)
  {
    if(!res.headersSent)
    {
      res.writeHead(statusCode,hasteObj.header404);
    }

    if(config.cache.staticFiles)
    {
      res.end(CachedFiles.staticFiles.File404.data);
    } 
    else
    {
      fs.readFile(__rootdir+'/error_files/'+config.errorPages.PageNotFound, function(err, data)
      {
        if(err)
        {
          console.error(err);
        }
        else
        {
          res.end(data);
        }
      });
    }
  }
  else if(statusCode === 500)
  {
    if(!res.headersSent)
    {
      res.writeHead(statusCode,hasteObj.header500);
    }

    if(config.cache.staticFiles)
    {
      res.end(CachedFiles.staticFiles.File500.data);
    } 
    else
    {
      fs.readFile(__rootdir+'/error_files/'+config.errorPages.InternalServerError, function(err, data)
      {
        if(err)
        {
          console.error(err);
        }
        else
        {
          res.end(data);
        }
      });
    }
  }
  else if(statusCode === 403)
  {
    if(!res.headersSent)
    {
      res.writeHead(statusCode,hasteObj.header403);
    }

    if(config.cache.staticFiles)
    {
      res.end(CachedFiles.staticFiles.File403.data);
    } 
    else
    {
      fs.readFile(__rootdir+'/error_files/'+config.errorPages.DirectoryAccess, function(err, data)
      {
        if(err)
        {
          console.error(err);
        }
        else
        {
          res.end(data);
        }
      });
    }
  }
}


let session = {
  currentSession:'',
  set:function(key,value)
  {
    // if cookie is not undefined

    if(typeof(req.headers.cookie) != 'undefined')
    {
      // getting the number of session cookie

      var sessionCookie = req.headers.cookie;
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
        res.setHeader('Set-Cookie','HASTESSID='+session.currentSession);
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

      res.setHeader('Set-Cookie','HASTESSID='+session.currentSession);
    }
  },
  get:function(key)
  {
    // getting the cookie headers
    var sessionValue = req.headers.cookie;

    // if the cookie header is not empty

    if(sessionValue != '')
    {
      // if cookie is not undefined

      if(typeof(req.headers.cookie) != 'undefined')
      {
        // getting the length of the cookie

        var sessionCookie = req.headers.cookie;
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
    var sessionValue = req.headers.cookie;
    if(sessionValue != '')
    {
      // if cookie is found
      if(typeof(req.headers.cookie) != 'undefined')
      {
        var sessionCookie = req.headers.cookie;
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
    var sessionValue = req.headers.cookie;
    if(sessionValue != '')
    {
      // if cookie is found
      if(typeof(req.headers.cookie) != 'undefined')
      {
        var sessionCookie = req.headers.cookie;
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
              res.setHeader('Set-Cookie','HASTESSID=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
              
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
          res.setHeader('Set-Cookie','HASTESSID=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
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
        res.setHeader('Set-Cookie','HASTESSID=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
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

exports.renderPage = renderPage;

exports.executeModules = executeModules;

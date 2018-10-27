/*

  Haste Framework copy right 2018

  By Pounze It Solution Pvt Ltd

  Developed @author Sudeep Dasgupta

  email: sudeep@pounze.com or sudeep.ignition@gmail.com

  Join us to make this framework the best among all other frameworks

  current version: 2.0

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

const zlib = require('zlib');

const net = require('net');

const fork = require('child_process').fork;

/*

  haste method is declared where Library constructor is called

*/

function die(obj = null)
{
  if(obj === null)
  {
    throw new GlobalException("");
  }
  else
  {
    throw new GlobalException(obj);
  }
}

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

      CachedFiles.staticFiles.File503 = {
        fileStat:fs.statSync(__rootdir+"/error_files/maintainance.html"),
        data:fs.readFileSync(__rootdir+"/error_files/maintainance.html")
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

  this.staticPath = [];

  this.globalGETObject = {};
  
  this.globalPOSTObject = {};

  this.globalPUTObject = {};
  
  this.globalDELETEObject = {};

  this.cacheDocFile = {};

  this.http2 = {};

  this.http2.constants = {};

  this.filesList = [];

  this.cookieStatus = false;

  this.defaultMethod;

  this.maintainanceStat = undefined;

  this.server = null;

  this.socket = null;

  this.AllowModules = {};

  this.GlobalCortexMiddlewares = [];

  this.CortexMiddlewares = [];

  this.rootPath = null;

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

  this.header503 = {
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
  Http2Server:function(ip,port,options,callback = null)
  {
    var version = process.version.replace("v","");

    version = version.split(".");

    if(version[0] < 10)
    {
      console.error('Http/2 not support by this nodeJS, kindly update to latest http2 support nodejs');
      process.exit(1);
      return;
    }

    hasteObj.http2 = require('http2');

    hasteObj.http2.constants = {
      HTTP2_HEADER_METHOD,
      HTTP2_HEADER_PATH,
      HTTP2_HEADER_STATUS,
      HTTP2_HEADER_CONTENT_TYPE
    } = http2.constants;

    try
    {
      if(typeof(ip) != 'string' || typeof(port) != 'number')
      {
        console.error("IP and PORT cannot be empty",null);
        return;
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
        if(typeof(options) != 'object')
        {
          console.error("Options must be valid object with certificates");
          return;
        }

        hasteObj.server = http2.createSecureServer(options);

        hasteObj.server.on('request', function(req, res)
        {
          handleRequest(req,res);
        });

        hasteObj.server.on('error', function(err)
        {
          console.error(err)
        });

        hasteObj.server.listen(port,ip);

        callback(hasteObj.server);
      }

      return hasteObj.server;
    }
    catch(e)
    {
      if(callback != null)
      {
        callback(e);
      }
    }
  },
  HttpsServer:function(ip,port,options,callback = null)
  {
    try
    {
      if(typeof(ip) != 'string' || typeof(port) != 'number')
      {
        console.error("IP and PORT cannot be empty",null);
        return;
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
        if(typeof(options) != 'object')
        {
          console.error("Options must be valid object with certificates");
          return;
        }

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

        return hasteObj.server;
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
        return;
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

        return hasteObj.server;
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
  route:function(rootPath,fileName)
  {
    fs.exists(fileName, function (exist)
    {
      if(!exist)
      {
        res.statusCode = 404;
        res.end(`File ${requestUri} not found!`);
        return;
      }

      hasteObj.rootPath = rootPath;

      const routerObject = require(fileName);

      routerObject.router;

    });

  },
  pushFile:function(filesList)
  {
    if(this.requestType === "GET")
    {
      hasteObj.globalGETObject[this.path].filesList = filesList;
    }
    else if(this.requestType === "POST")
    {
      hasteObj.globalPOSTObject[this.path].filesList = filesList;
    }
    else if(this.requestType === "PUT")
    {
      hasteObj.globalPUTObject[this.path].filesList = filesList;
    }
    else
    {
      hasteObj.globalDELETEObject[this.path].filesList = filesList;
    }
  },
  push:function(Msg)
  {
    if(this.requestType === "GET")
    {
      hasteObj.globalGETObject[this.path].Msg = Msg;
    }
    else if(this.requestType === "POST")
    {
      hasteObj.globalPOSTObject[this.path].Msg = Msg;
    }
    else if(this.requestType === "PUT")
    {
      hasteObj.globalPUTObject[this.path].Msg = Msg;
    }
    else
    {
      hasteObj.globalDELETEObject[this.path].Msg = Msg;
    }
  },
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
    // put method for put routers

    hasteObj.globalPUTObject[uri] = {
      "uri":uri,
      "request_type":"PUT",
      "argument":argument,
      "regex":uri
    };

    this.requestType = "PUT";

    this.path = uri;

    return this;
  },
  delete:function(uri,argument)
  {
    // delete method for delete routers

    hasteObj.globalDELETEObject[uri] = {
      "uri":uri,
      "request_type":"DELETE",
      "argument":argument,
      "regex":uri
    };

    this.requestType = "DELETE";

    this.path = uri;

    return this;
  },
  cortexMiddleware:function(middlewareList)
  {
    try
    {
      if(typeof(middlewareList) != 'object' && !Array.isArray(middlewareList))
      {
        console.error("Cortex middlewares must be array");
        return;
      }

      hasteObj.CortexMiddlewares = middlewareList;
    }
    catch(e)
    {
      console.error(e);
    }
  },
  createGlobalCortexMiddlewares:function(middlewares)
  {
    try
    {
      if(typeof(middlewares) != 'object' && !Array.isArray(middlewares))
      {
        console.error("Cortex global middleware must be array");
        return;
      }

      hasteObj.GlobalCortexMiddlewares = middlewares;
    }
    catch(e)
    {
      console.error(e);
    }
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
      else if(this.requestType == "PUT")
      {
        hasteObj.globalPUTObject[this.path].middleware = middleware;
      }
      else
      {
        hasteObj.globalDELETEObject[this.path].middleware = middleware;
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
      else if(this.requestType == "PUT")
      {
        hasteObj.globalPUTObject[this.path].regexExp = regex;

        hasteObj.globalPUTObject[this.path]['regex'] = hasteObj.globalPUTObject[this.path]['uri'];

        for(regex in hasteObj.globalPUTObject[this.path]['regexExp'])
        {
          hasteObj.globalPUTObject[this.path]['regex'] = hasteObj.globalPUTObject[this.path]['regex'].replace(regex,hasteObj.globalPUTObject[this.path]['regexExp'][regex]);
        }
      }
      else
      {
        hasteObj.globalDELETEObject[this.path].regexExp = regex;

        hasteObj.globalDELETEObject[this.path]['regex'] = hasteObj.globalDELETEObject[this.path]['uri'];

        for(regex in hasteObj.globalDELETEObject[this.path]['regexExp'])
        {
          hasteObj.globalDELETEObject[this.path]['regex'] = hasteObj.globalDELETEObject[this.path]['regex'].replace(regex,hasteObj.globalDELETEObject[this.path]['regexExp'][regex]);
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
          renderErrorFiles(req,res,404,null,null);
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

      renderErrorFiles(req,res,500,null,null);
    }

  },
  BlockDirectories:function(path)
  {
    // allow folders to get accessed
    hasteObj.staticPath = path;
  }
};

let routes = {
  get:function(path,callback)
  {
    haste.fn.get(hasteObj.rootPath+path,callback);

    return this;
  },
  post:function(path,callback)
  {
    haste.fn.post(hasteObj.rootPath+path,callback);

    return this;
  },
  put:function(path,callback)
  {
    haste.fn.put(hasteObj.rootPath+path,callback);

    return this;
  },
  delete:function(path,callback)
  {
    haste.fn.delete(hasteObj.rootPath+path,callback);

    return this;
  },
  middlewares:function(middleware)
  {
    haste.fn.middlewares(middleware);

    return this;
  },
  where:function(regex)
  {
    haste.fn.where(regex);

    return this;
  }
};

function cloneObject(obj)
{
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}

async function modules(req,res,obj)
{

  try
  {
  	/*

      checking for middleware if array or string 

      if array then multiple middleware

      else single middleware

    */

    if(typeof(req.globalObject[obj]["middleware"]) != 'undefined')
    {
      if(typeof(req.globalObject[obj]["middleware"]) == 'object' && Array.isArray(req.globalObject[obj]["middleware"]))
      {
        let middlewareLen = req.globalObject[obj]["middleware"].length;

        for(var j=0;j<middlewareLen;j++)
        {
          var middlewareCallback = await processMiddlewares(req,res,obj,j);   

          if(!middlewareCallback)
          {
            break;
          }
        }

        if(parseInt(j) == middlewareLen)
        {
          executeMethod(req,res,obj);
        }
      }
      else if(typeof(req.globalObject[obj]["middleware"]) == 'string')
      {
        fs.stat(__rootdir+'/middlewares/'+req.globalObject[obj]["middleware"]+'.js',function(err,middlewarestat)
        {
          if(err)
          {
            renderErrorFiles(req,res,404);
            return;
          }

          if(middlewarestat != undefined && middlewarestat.isFile())
          {
            let middlewareFile = require(__rootdir+'/middlewares/'+req.globalObject[obj]["middleware"]+'.js');

            let middlewareCallbacks = middlewareFile.init(req,res,req.input);

            if(middlewareCallbacks != undefined && middlewareCallbacks[0] != undefined && !middlewareCallbacks[0])
            {
              res.setHeader('Content-Type','application/json');
              res.end(JSON.stringify(cloneObject(middlewareCallbacks[1])));
              return false;
            }
            else
            {
              req.input[req.globalObject[obj]["middleware"]] = cloneObject(middlewareCallbacks[1]);
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

function processMiddlewares(req,res,obj,j)
{
  try
  {
    // checking if the middleware file exists or not

    return new Promise((resolve,reject)=>{
      fs.stat(__rootdir+'/middlewares/'+req.globalObject[obj]["middleware"][j]+'.js',function(err,middlewarestat)
      {
        if(err)
        {
          resolve(false);
          renderErrorFiles(req,res,404);
          return;
        }

        // if the middleware is a file

        if(middlewarestat != undefined && middlewarestat.isFile())
        {
          // then invoke the middleware main method

          var middlewareFile = require(__rootdir+'/middlewares/'+req.globalObject[obj]["middleware"][j]+'.js');

          var middlewareCallbacks = middlewareFile.init(req,res,req.input);

          if(middlewareCallbacks != undefined && middlewareCallbacks[0] != undefined && !middlewareCallbacks[0])
          {
            // if middleware callback is false then request is stopped here

            res.setHeader('Content-Type','application/json');

            res.end(JSON.stringify(cloneObject(middlewareCallbacks[1])));

            resolve(false);
          }
          else
          {
            req.input[req.globalObject[obj]["middleware"][j]] = cloneObject(middlewareCallbacks[1]);

            resolve(true);
          }
        }
        else
        {
          console.error('Middlware must be a javascript file');

          resolve(false);
        }

      });
    });
  }
  catch(e)
  {
    // if file is not found of the middleware then 500 internal server error is thrown

    console.error(e);

    renderErrorFiles(req,res,500);

    resolve(false);
  }
}

function executeMethod(req,res,obj)
{

  /*
    checking if the second argument is string or function

    if string then it is passed to 

    else callback is given to method

  */

  if(typeof(req.globalObject[obj]["argument"]) == 'function')
  {
    req.globalObject[obj]["argument"](req,res,req.input);
  }
  else if(typeof(req.globalObject[obj]["argument"]) == 'string')
  {
    try
    {

     fs.stat(__rootdir+'/controllers/'+req.globalObject[obj]["argument"]+'.js',function(err,stat)
     {
        if(err)
        {
          renderErrorFiles(req,res,404);
          return;
        }

        if(stat.isFile())
        {
          var controller = require(__rootdir+'/controllers/'+req.globalObject[obj]["argument"]+'.js');

          controller.init(req,res,req.input);
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

function executeModules(modulesList)
{
  try
  {
    for(var index in modulesList)
    {
      if(modulesList[index] === "multiparty")
      {
        this.AllowModules.multiparty = require("multiparty");
      }

      if(modulesList[index] === "socket.io")
      {
        this.AllowModules.socketIO = require("socket.io");
      }

      if(modulesList[index] === "redis")
      {
        this.AllowModules.redis = require("redis");
      }

      if(modulesList[index] === "node-quic")
      {
        this.AllowModules.nodeQuic = require("node-quic");
      } 
    }
  }
  catch(e)
  {
    console.error(e);
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
      res.statusCode = 404;
      res.end(`File ${requestUri} not found!`);
      return;
    }

    fs.stat(requestUri,function(err,stat)
    {
      if(err)
      {
        res.statusCode = 404;
        res.end(`File ${requestUri} not found!`);
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

      var fileName = Buffer.from(requestUri, 'utf8').toString('hex');

      CachedFiles.staticFiles[fileName] = {};

      CachedFiles.staticFiles[fileName].stat = stat;

      fs.readFile(requestUri,function(err,data)
      {
        if(err)
        {
          res.statusCode = 500;
          res.end("Internal Server Error");
          return;
        }

        CachedFiles.staticFiles[fileName].data = data;

        if(config.compression.gzip)
        {
          res.setHeader("Content-Encoding","gzip");

          zlib.gzip(data, function (_, result)
          { 
            res.write(result);
            res.end();                          
          });
        }
        else
        {
          res.end(data);     
        }
      });

    });

  });
  
}

async function handleRequest(req,res)
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

      return;
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

    let requestMethod = req.method;

  	let requestUri = url_module.parse(req.url).pathname;

  	let ext = (/[.]/.exec(requestUri)) ? /[^.]+$/.exec(requestUri) : undefined;

  	let myExp;

  	let notMatchCount = 0;

  	let tempMapping = '';

  	let uriListLen = 0;

    req.input = new Object();

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
          var fileName = Buffer.from(requestUri, 'utf8').toString('hex');

          if(config.cache.staticFiles)
          {
            if(CachedFiles.staticFiles[fileName] == undefined)
            {
              serveStaticFiles(req,res,__rootdir+requestUri,ext,null,null);
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

              if(config.compression.gzip)
              {
                res.setHeader("Content-Encoding","gzip");

                zlib.gzip(CachedFiles.staticFiles[fileName].data, function (_, result)
                { 
                  res.write(result);
                  res.end();                          
                });
              }
              else
              {
                res.end(CachedFiles.staticFiles[fileName].data);     
              }
            }
          } 
          else
          {
            serveStaticFiles(req,res,__rootdir+requestUri,ext,null,null);
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

    if(config.server.maintainance)
    {
      renderErrorFiles(req,res,503);
      
      return false;
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

    	req.globalObject = hasteObj.globalGETObject;
    }
    else if(requestMethod == "POST")
    {
    	uriListLen = Object.keys(hasteObj.globalPOSTObject).length;

    	req.globalObject = hasteObj.globalPOSTObject;
    }
    else if(requestMethod == "PUT")
    {
      uriListLen = Object.keys(hasteObj.globalPUTObject).length;

      req.globalObject = hasteObj.globalPUTObject;
    }
    else if(requestMethod == "DELETE")
    {
      uriListLen = Object.keys(hasteObj.globalDELETEObject).length;

      req.globalObject = hasteObj.globalDELETEObject;
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

      for(obj in req.globalObject)
      {
        /*
          Iterating through object in to match uri and parse request accordingly            
        */

        myExp = new RegExp('^'+req.globalObject[obj]["regex"]+'$','i');

        if(requestUri.match(myExp) && requestMethod == req.globalObject[obj]['request_type'])
        {

          req.currentObject = req.globalObject[obj];

          let requestUriArr = requestUri.split('/');

          let matchedArr = req.globalObject[obj]["uri"].split('/');

          let matchedArrLen = matchedArr.length;

          for(let mat=1;mat<matchedArrLen;mat++)
          {
            req.input[matchedArr[mat]] = requestUriArr[mat];
          }

          if(requestMethod == "GET")
          {
            parseGET(req,res,obj);
          }
          else if(requestMethod == "POST")
          {
            parsePOST(req,res,obj);
          }
          else if(requestMethod == "PUT")
          {
            parsePUT(req,res,obj);
          }
          else if(requestMethod == "DELETE")
          {
            parseDELETE(req,res,obj);
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

function pushFilesStreams(req,res,fileName)
{
  return new Promise((resolve,reject)=>{

    fs.exists(__rootdir+fileName,function(exists)
    {
      if(!exists)
      {
        renderErrorFiles(req,res,404);
        resolve(false);
        return;
      }

      res.stream.pushStream({ ':path': fileName }, (err, pushStreams, headers) => {

        if(err)
        {
          console.error(err);
          resolve(false);
          return;
        }

        pushStreams.on("error",function(err)
        {
          resolve(false);
        });

        const fd = fs.openSync(__rootdir+fileName, 'r');

        var data = fs.readFileSync(__rootdir+fileName);

        const stat = fs.fstatSync(fd);

        const headersObj = {
          'content-length': stat.size,
          'last-modified': stat.mtime.toUTCString(),
          'content-type': mimeList[PATHNAME.extname(fileName)]
        };

        pushStreams.end(data);

        resolve(true);

      });
      
    });
  })
}

function parseGET(req,res,obj)
{
  // parse get request
  try
  {
    var url_parsed = url_module.parse(req.url,true);
    
    req.input['requestData'] = url_parsed['query'];

    modules(req,res,obj);

  }
  catch(e)
  {
    console.error(e);
    console.error("Failed to parse get request");
  }
}

function parsePUT(req,res,obj)
{
  // parse get request
  try
  {
    if(typeof(req.headers['content-type']) != 'undefined')
    {
      // parse put request 

      if(req.headers['content-type'].match(/(multipart\/form\-data\;)/g))
      {
        try
        {
          var form = new hasteObj.AllowModules.multiparty.Form();

          form.parse(req,async function(err,fields,files)
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

            req.input['requestData'] = bindkey;

            if(obj == undefined)
            {
              var middlewareLen = hasteObj.GlobalCortexMiddlewares.length;

              if(middlewareLen == 0)
              {
                processRequest(req,res);
                return;
              }

              for(var j in hasteObj.GlobalCortexMiddlewares)
              {
                var middlewareStat = await processGlobalMiddlewares(req,res,j);

                if(!middlewareStat)
                {
                  break;
                }
              }

              if((parseInt(j) + 1) == middlewareLen)
              {
                if(hasteObj.CortexMiddlewares.length == 0)
                {
                  processRequest(req,res);
                  return;
                }

                let mapping = req.input['requestData']['mapping'];
                let cortex = req.input['requestData']['cortex'];

                let cortexMiddlewareLen = hasteObj.CortexMiddlewares.length;

                let foundMiddleware = false;

                for(var i in hasteObj.CortexMiddlewares)
                {
                  if(cortex === hasteObj.CortexMiddlewares[i].cortex && mapping === hasteObj.CortexMiddlewares[i].mapping)
                  {
                    foundMiddleware = true;
                    break;
                  }
                }

                if(foundMiddleware)
                {
                  let cortexMiddlewares = hasteObj.CortexMiddlewares[i].middlewares;

                  let cortexMiddlewaresListLen = cortexMiddlewares.length;

                  for(var j in cortexMiddlewares)
                  {
                    var middlewareStat = await processCortexMiddlewares(req,res,cortexMiddlewares[j]);

                    if(!middlewareStat)
                    {
                      break;
                    }
                  }

                  if((parseInt(j) + 1) == cortexMiddlewaresListLen)
                  {
                    processRequest(req,res,obj);
                  }
                }
                else
                {
                  if((parseInt(i) + 1) === cortexMiddlewareLen)
                  {
                    renderErrorFiles(req,res,404);
                  }
                }
              }
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

        req.on('end',async function()
        {
          if(req.headers['content-type'] == 'application/json')
          {
            try
            {
              var jsonData = JSON.parse(body);

              req.input['requestData'] = jsonData;

              if(obj == undefined)
              {
                var middlewareLen = hasteObj.GlobalCortexMiddlewares.length;

                if(middlewareLen == 0)
                {
                  processRequest(req,res);
                  return;
                }

                for(var j in hasteObj.GlobalCortexMiddlewares)
                {
                  var middlewareStat = await processGlobalMiddlewares(req,res,j);

                  if(!middlewareStat)
                  {
                    break;
                  }
                }

                if((parseInt(j) + 1) == middlewareLen)
                {
                  if(hasteObj.CortexMiddlewares.length == 0)
                  {
                    processRequest(req,res);
                    return;
                  }

                  let mapping = req.input['requestData']['mapping'];
                  let cortex = req.input['requestData']['cortex'];

                  let cortexMiddlewareLen = hasteObj.CortexMiddlewares.length;

                  let foundMiddleware = false;

                  for(var i in hasteObj.CortexMiddlewares)
                  {
                    if(cortex === hasteObj.CortexMiddlewares[i].cortex && mapping === hasteObj.CortexMiddlewares[i].mapping)
                    {
                      foundMiddleware = true;
                      break;
                    }
                  }

                  if(foundMiddleware)
                  {
                    let cortexMiddlewares = hasteObj.CortexMiddlewares[i].middlewares;

                    let cortexMiddlewaresListLen = cortexMiddlewares.length;

                    for(var j in cortexMiddlewares)
                    {
                      var middlewareStat = await processCortexMiddlewares(req,res,cortexMiddlewares[j]);

                      if(!middlewareStat)
                      {
                        break;
                      }
                    }

                    if((parseInt(j) + 1) == cortexMiddlewaresListLen)
                    {
                      processRequest(req,res,obj);
                    }
                  }
                  else
                  {
                    if((parseInt(i) + 1) === cortexMiddlewareLen)
                    {
                      renderErrorFiles(req,res,404);
                    }
                  }
                }
              }
              else
              {
                modules(req,res,obj);
              }
            }
            catch(e)
            {
              console.error(e);
              req.end(req.headers['content-type'] + " currently not supported");
            }
          }
          else if(req.headers['content-type'] == "application/x-www-form-urlencoded")
          {
            req.input['requestData'] = qs.parse(body);

            if(obj == undefined)
            {
              var middlewareLen = hasteObj.GlobalCortexMiddlewares.length;

              if(middlewareLen == 0)
              {
                processRequest(req,res);
                return;
              }

              for(var j in hasteObj.GlobalCortexMiddlewares)
              {
                var middlewareStat = await processGlobalMiddlewares(req,res,j);

                if(!middlewareStat)
                {
                  break;
                }
              }

              if((parseInt(j) + 1) == middlewareLen)
              {
                if(hasteObj.CortexMiddlewares.length == 0)
                {
                  processRequest(req,res);
                  return;
                }

                let mapping = req.input['requestData']['mapping'];
                let cortex = req.input['requestData']['cortex'];

                let cortexMiddlewareLen = hasteObj.CortexMiddlewares.length;

                let foundMiddleware = false;

                for(var i in hasteObj.CortexMiddlewares)
                {
                  if(cortex === hasteObj.CortexMiddlewares[i].cortex && mapping === hasteObj.CortexMiddlewares[i].mapping)
                  {
                    foundMiddleware = true;
                    break;
                  }
                }

                if(foundMiddleware)
                {
                  let cortexMiddlewares = hasteObj.CortexMiddlewares[i].middlewares;

                  let cortexMiddlewaresListLen = cortexMiddlewares.length;

                  for(var j in cortexMiddlewares)
                  {
                    var middlewareStat = await processCortexMiddlewares(req,res,cortexMiddlewares[j]);

                    if(!middlewareStat)
                    {
                      break;
                    }
                  }

                  if((parseInt(j) + 1) == cortexMiddlewaresListLen)
                  {
                    processRequest(req,res,obj);
                  }
                }
                else
                {
                  if((parseInt(i) + 1) === cortexMiddlewareLen)
                  {
                    renderErrorFiles(req,res,404);
                  }
                }
              }
            }
            else
            {
              modules(req,res,obj);
            }
          }
          else
          {
            req.end(req.headers['content-type'] + " currently not supported");
          }
        });
      }
    }
    else
    {
      res.end('No content-type header is present in the request');
      console.error('No content-type header is present in the request');
    }

  }
  catch(e)
  {
    console.error(e);
    console.error("Failed to parse get request");
  }
}

function parseDELETE(req,res,obj)
{
  // parse get request
  try
  {
    if(typeof(req.headers['content-type']) != 'undefined')
    {
      // parse delete request 

      if(req.headers['content-type'].match(/(multipart\/form\-data\;)/g))
      {
        try
        {
          var form = new hasteObj.AllowModules.multiparty.Form();

          form.parse(req,async function(err,fields,files)
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

            req.input['requestData'] = bindkey;

            if(obj == undefined)
            {
              var middlewareLen = hasteObj.GlobalCortexMiddlewares.length;

              if(middlewareLen == 0)
              {
                processRequest(req,res);
                return;
              }

              for(var j in hasteObj.GlobalCortexMiddlewares)
              {
                var middlewareStat = await processGlobalMiddlewares(req,res,j);

                if(!middlewareStat)
                {
                  break;
                }
              }

              if((parseInt(j) + 1) == middlewareLen)
              {
                if(hasteObj.CortexMiddlewares.length == 0)
                {
                  processRequest(req,res);
                  return;
                }

                let mapping = req.input['requestData']['mapping'];
                let cortex = req.input['requestData']['cortex'];

                let cortexMiddlewareLen = hasteObj.CortexMiddlewares.length;

                let foundMiddleware = false;

                for(var i in hasteObj.CortexMiddlewares)
                {
                  if(cortex === hasteObj.CortexMiddlewares[i].cortex && mapping === hasteObj.CortexMiddlewares[i].mapping)
                  {
                    foundMiddleware = true;
                    break;
                  }
                }

                if(foundMiddleware)
                {
                  let cortexMiddlewares = hasteObj.CortexMiddlewares[i].middlewares;

                  let cortexMiddlewaresListLen = cortexMiddlewares.length;

                  for(var j in cortexMiddlewares)
                  {
                    var middlewareStat = await processCortexMiddlewares(req,res,cortexMiddlewares[j]);

                    if(!middlewareStat)
                    {
                      break;
                    }
                  }

                  if((parseInt(j) + 1) == cortexMiddlewaresListLen)
                  {
                    processRequest(req,res,obj);
                  }
                }
                else
                {
                  if((parseInt(i) + 1) === cortexMiddlewareLen)
                  {
                    renderErrorFiles(req,res,404);
                  }
                }
              }
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

        req.on('end',async function()
        {
          if(req.headers['content-type'] == 'application/json')
          {
            try
            {
              var jsonData = JSON.parse(body);

              req.input['requestData'] = jsonData;

              if(obj == undefined)
              {
                var middlewareLen = hasteObj.GlobalCortexMiddlewares.length;

                if(middlewareLen == 0)
                {
                  processRequest(req,res);
                  return;
                }

                for(var j in hasteObj.GlobalCortexMiddlewares)
                {
                  var middlewareStat = await processGlobalMiddlewares(req,res,j);

                  if(!middlewareStat)
                  {
                    break;
                  }
                }

                if((parseInt(j) + 1) == middlewareLen)
                {
                  if(hasteObj.CortexMiddlewares.length == 0)
                  {
                    processRequest(req,res);
                    return;
                  }

                  let mapping = req.input['requestData']['mapping'];
                  let cortex = req.input['requestData']['cortex'];

                  let cortexMiddlewareLen = hasteObj.CortexMiddlewares.length;

                  let foundMiddleware = false;

                  for(var i in hasteObj.CortexMiddlewares)
                  {
                    if(cortex === hasteObj.CortexMiddlewares[i].cortex && mapping === hasteObj.CortexMiddlewares[i].mapping)
                    {
                      foundMiddleware = true;
                      break;
                    }
                  }

                  if(foundMiddleware)
                  {
                    let cortexMiddlewares = hasteObj.CortexMiddlewares[i].middlewares;

                    let cortexMiddlewaresListLen = cortexMiddlewares.length;

                    for(var j in cortexMiddlewares)
                    {
                      var middlewareStat = await processCortexMiddlewares(req,res,cortexMiddlewares[j]);

                      if(!middlewareStat)
                      {
                        break;
                      }
                    }

                    if((parseInt(j) + 1) == cortexMiddlewaresListLen)
                    {
                      processRequest(req,res,obj);
                    }
                  }
                  else
                  {
                    if((parseInt(i) + 1) === cortexMiddlewareLen)
                    {
                      renderErrorFiles(req,res,404);
                    }
                  }
                }
              }
              else
              {
                modules(req,res,obj);
              }
            }
            catch(e)
            {
              console.error(e);
              req.end(req.headers['content-type'] + " currently not supported");
            }
          }
          else if(req.headers['content-type'] == "application/x-www-form-urlencoded")
          {
            req.input['requestData'] = qs.parse(body);

            if(obj == undefined)
            {
              var middlewareLen = hasteObj.GlobalCortexMiddlewares.length;

              if(middlewareLen == 0)
              {
                processRequest(req,res);
                return;
              }

              for(var j in hasteObj.GlobalCortexMiddlewares)
              {
                var middlewareStat = await processGlobalMiddlewares(req,res,j);

                if(!middlewareStat)
                {
                  break;
                }
              }

              if((parseInt(j) + 1) == middlewareLen)
              {
                if(hasteObj.CortexMiddlewares.length == 0)
                {
                  processRequest(req,res);
                  return;
                }

                let mapping = req.input['requestData']['mapping'];
                let cortex = req.input['requestData']['cortex'];

                let cortexMiddlewareLen = hasteObj.CortexMiddlewares.length;

                let foundMiddleware = false;

                for(var i in hasteObj.CortexMiddlewares)
                {
                  if(cortex === hasteObj.CortexMiddlewares[i].cortex && mapping === hasteObj.CortexMiddlewares[i].mapping)
                  {
                    foundMiddleware = true;
                    break;
                  }
                }

                if(foundMiddleware)
                {
                  let cortexMiddlewares = hasteObj.CortexMiddlewares[i].middlewares;

                  let cortexMiddlewaresListLen = cortexMiddlewares.length;

                  for(var j in cortexMiddlewares)
                  {
                    var middlewareStat = await processCortexMiddlewares(req,res,cortexMiddlewares[j]);

                    if(!middlewareStat)
                    {
                      break;
                    }
                  }

                  if((parseInt(j) + 1) == cortexMiddlewaresListLen)
                  {
                    processRequest(req,res,obj);
                  }
                }
                else
                {
                  if((parseInt(i) + 1) === cortexMiddlewareLen)
                  {
                    renderErrorFiles(req,res,404);
                  }
                }
              }
            }
            else
            {
              modules(req,res,obj);
            }
          }
          else
          {
            req.end(req.headers['content-type'] + " currently not supported");
          }
        });
      }
    }
    else
    {
      res.end('No content-type header is present in the request');
      console.error('No content-type header is present in the request');
    }

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

    if(req.headers['content-type'].match(/(multipart\/form\-data\;)/g))
    {
      try
      {
        var form = new hasteObj.AllowModules.multiparty.Form();

        form.parse(req,async function(err,fields,files)
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

          req.input['requestData'] = bindkey;

          if(obj == undefined)
          {
            var middlewareLen = hasteObj.GlobalCortexMiddlewares.length;

            if(middlewareLen == 0)
            {
              processRequest(req,res);
              return;
            }

            for(var j in hasteObj.GlobalCortexMiddlewares)
            {
              var middlewareStat = await processGlobalMiddlewares(req,res,j);

              if(!middlewareStat)
              {
                break;
              }
            }

            if((parseInt(j) + 1) == middlewareLen)
            {
              if(hasteObj.CortexMiddlewares.length == 0)
              {
                processRequest(req,res);
                return;
              }

              let mapping = req.input['requestData']['mapping'];
              let cortex = req.input['requestData']['cortex'];

              let cortexMiddlewareLen = hasteObj.CortexMiddlewares.length;

              let foundMiddleware = false;

              for(var i in hasteObj.CortexMiddlewares)
              {
                if(cortex === hasteObj.CortexMiddlewares[i].cortex && mapping === hasteObj.CortexMiddlewares[i].mapping)
                {
                  foundMiddleware = true;
                  break;
                }
              }

              if(foundMiddleware)
              {
                let cortexMiddlewares = hasteObj.CortexMiddlewares[i].middlewares;

                let cortexMiddlewaresListLen = cortexMiddlewares.length;

                for(var j in cortexMiddlewares)
                {
                  var middlewareStat = await processCortexMiddlewares(req,res,cortexMiddlewares[j]);

                  if(!middlewareStat)
                  {
                    break;
                  }
                }

                if((parseInt(j) + 1) == cortexMiddlewaresListLen)
                {
                  processRequest(req,res,obj);
                }
              }
              else
              {
                if((parseInt(i) + 1) === cortexMiddlewareLen)
                {
                  renderErrorFiles(req,res,404);
                }
              }
            }
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

      req.on('end',async function()
      {
        if(req.headers['content-type'] == 'application/json')
        {
          try
          {
            var jsonData = JSON.parse(body);

            req.input['requestData'] = jsonData;

            if(obj == undefined)
            {
              var middlewareLen = hasteObj.GlobalCortexMiddlewares.length;

              if(middlewareLen == 0)
              {
                processRequest(req,res);
                return;
              }

              for(var j in hasteObj.GlobalCortexMiddlewares)
              {
                var middlewareStat = await processGlobalMiddlewares(req,res,j);

                if(!middlewareStat)
                {
                  break;
                }
              }

              if((parseInt(j) + 1) == middlewareLen)
              {
                if(hasteObj.CortexMiddlewares.length == 0)
                {
                  processRequest(req,res);
                  return;
                }

                let mapping = req.input['requestData']['mapping'];
                let cortex = req.input['requestData']['cortex'];

                let cortexMiddlewareLen = hasteObj.CortexMiddlewares.length;

                let foundMiddleware = false;

                for(var i in hasteObj.CortexMiddlewares)
                {
                  if(cortex === hasteObj.CortexMiddlewares[i].cortex && mapping === hasteObj.CortexMiddlewares[i].mapping)
                  {
                    foundMiddleware = true;
                    break;
                  }
                }

                if(foundMiddleware)
                {
                  let cortexMiddlewares = hasteObj.CortexMiddlewares[i].middlewares;

                  let cortexMiddlewaresListLen = cortexMiddlewares.length;

                  for(var j in cortexMiddlewares)
                  {
                    var middlewareStat = await processCortexMiddlewares(req,res,cortexMiddlewares[j]);

                    if(!middlewareStat)
                    {
                      break;
                    }
                  }

                  if((parseInt(j) + 1) == cortexMiddlewaresListLen)
                  {
                    processRequest(req,res,obj);
                  }
                }
                else
                {
                  if((parseInt(i) + 1) === cortexMiddlewareLen)
                  {
                    renderErrorFiles(req,res,404);
                  }
                }
              }
            }
            else
            {
              modules(req,res,obj);
            }
          }
          catch(e)
          {
            console.error(e);
            req.end(req.headers['content-type'] + " currently not supported");
          }
        }
        else if(req.headers['content-type'] == "application/x-www-form-urlencoded")
        {
          req.input['requestData'] = qs.parse(body);

          if(obj == undefined)
          {
            var middlewareLen = hasteObj.GlobalCortexMiddlewares.length;

            if(middlewareLen == 0)
            {
              processRequest(req,res);
              return;
            }

            for(var j in hasteObj.GlobalCortexMiddlewares)
            {
              var middlewareStat = await processGlobalMiddlewares(req,res,j);

              if(!middlewareStat)
              {
                break;
              }
            }

            if((parseInt(j) + 1) == middlewareLen)
            {
              if(hasteObj.CortexMiddlewares.length == 0)
              {
                processRequest(req,res);
                return;
              }

              let mapping = req.input['requestData']['mapping'];
              let cortex = req.input['requestData']['cortex'];

              let cortexMiddlewareLen = hasteObj.CortexMiddlewares.length;

              let foundMiddleware = false;

              for(var i in hasteObj.CortexMiddlewares)
              {
                if(cortex === hasteObj.CortexMiddlewares[i].cortex && mapping === hasteObj.CortexMiddlewares[i].mapping)
                {
                  foundMiddleware = true;
                  break;
                }
              }

              if(foundMiddleware)
              {
                let cortexMiddlewares = hasteObj.CortexMiddlewares[i].middlewares;

                let cortexMiddlewaresListLen = cortexMiddlewares.length;

                for(var j in cortexMiddlewares)
                {
                  var middlewareStat = await processCortexMiddlewares(req,res,cortexMiddlewares[j]);

                  if(!middlewareStat)
                  {
                    break;
                  }
                }

                if((parseInt(j) + 1) == cortexMiddlewaresListLen)
                {
                  processRequest(req,res,obj);
                }
              }
              else
              {
                if((parseInt(i) + 1) === cortexMiddlewareLen)
                {
                  renderErrorFiles(req,res,404);
                }
              }
            }
          }
          else
          {
            modules(req,res,obj);
          }
        }
        else
        {
          req.end(req.headers['content-type'] + " currently not supported");
        }
      });
    }
  }
  else
  {
    res.end('No content-type header is present in the request');
    console.error('No content-type header is present in the request');
  }
}

async function processCortexMiddlewares(req,res,middleware)
{
  try
  {
    // checking if the middleware file exists or not

    return new Promise((resolve,reject)=>{
      fs.stat(__rootdir+'/middlewares/'+middleware+'.js',function(err,middlewarestat)
      {
        if(err)
        {
          resolve(false);
          renderErrorFiles(req,res,404);
          return;
        }

        // if the middleware is a file

        if(middlewarestat != undefined && middlewarestat.isFile())
        {
          // then invoke the middleware main method

          var middlewareFile = require(__rootdir+'/middlewares/'+middleware+'.js');

          var middlewareCallbacks = middlewareFile.init(req,res,req.input);

          if(middlewareCallbacks != undefined && middlewareCallbacks[0] != undefined && !middlewareCallbacks[0])
          {
            // if middleware callback is false then request is stopped here

            res.setHeader('Content-Type','application/json');

            res.end(JSON.stringify(cloneObject(middlewareCallbacks[1])));

            resolve(false);
            
          }
          else
          {
            req.input[middleware] = cloneObject(middlewareCallbacks[1]);

            resolve(true);
          }
        }
        else
        {
          resolve(false);

          console.error('Middlware must be a javascript file');
        }

      });
    }); 
  }
  catch(e)
  {
    // if file is not found of the middleware then 500 internal server error is thrown

    resolve(false);

    console.error(e);

    renderErrorFiles(req,res,500);
  }
}

async function processGlobalMiddlewares(req,res,j)
{
  try
  {
    // checking if the middleware file exists or not

    return new Promise((resolve,reject)=>{
      fs.stat(__rootdir+'/middlewares/'+hasteObj.GlobalCortexMiddlewares[j]+'.js',function(err,middlewarestat)
      {
        if(err)
        {
          resolve(false);
          renderErrorFiles(req,res,404);
          return;
        }

        // if the middleware is a file

        if(middlewarestat != undefined && middlewarestat.isFile())
        {
          // then invoke the middleware main method

          var middlewareFile = require(__rootdir+'/middlewares/'+hasteObj.GlobalCortexMiddlewares[j]+'.js');

          var middlewareCallbacks = middlewareFile.init(req,res,req.input);

          if(middlewareCallbacks != undefined && middlewareCallbacks[0] != undefined && !middlewareCallbacks[0])
          {
            // if middleware callback is false then request is stopped here

            res.setHeader('Content-Type','application/json');

            res.end(JSON.stringify(cloneObject(middlewareCallbacks[1])));

            resolve(false);
            
          }
          else
          {
            req.input[hasteObj.GlobalCortexMiddlewares[j]] = cloneObject(middlewareCallbacks[1]);

            resolve(true);
          }
        }
        else
        {
          resolve(false);

          console.error('Middlware must be a javascript file');
        }

      });
    }); 
  }
  catch(e)
  {
    // if file is not found of the middleware then 500 internal server error is thrown

    resolve(false);

    console.error(e);

    renderErrorFiles(req,res,500);
  }
}

function processRequest(req,res)
{
  var mapping = req.input['requestData']['mapping'];
  var cortex = req.input['requestData']['cortex'];

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

    controller.init(req,res,req.input);

  });
}

function GlobalException(object)
{
  this.globalObject = object;
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



async function renderPage(req,res,Render,page,pushFile = false,code = null,headers = null,compression = null)
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

      if(req.currentObject.filesList.length > 0)
      {
        var count = 0;

        for(var index in req.currentObject.filesList)
        {
          await pushFilesStreams(req,res,req.currentObject.filesList[index]);

          count += 1;
        }

        if(count === req.currentObject.filesList.length)
        {
          setTimeout(function()
          {
            renderDocument(req,res,Render,page,pushFile,code,headers,compression);
          },0);
        }
      }
      else
      {
        renderDocument(req,res,Render,page,pushFile,code,headers,compression);
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

function renderDocument(req,res,Render,page,pushFile,code,headers,compression)
{
  if(config.cache.Document)
  {
    if(CachedFiles.documentFiles[page] == undefined)
    {
      serveDocumentFile(req,res,Render,page,pushFile,code,headers,compression);
    }
    else
    {
      var modifiedDate = new Date(CachedFiles.documentFiles[page].stat.mtimeMs).getTime();

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

      if(compression != null)
      {
        zlib.gzip(CachedFiles.documentFiles[page].data, function (_, result)
        {
          if(pushFile !== false)
          {
            res.stream.end(result);
          }
          else
          {
            res.write(result);
            res.end();  
          }                     
        });
      }
      else
      {
        if(pushFile !== false)
        {
          res.stream.end(CachedFiles.documentFiles[page].data);  
        }
        else
        {
          res.write(CachedFiles.documentFiles[page].data);
          res.end();  
        }   
      }
    }
  }
  else
  {
    serveDocumentFile(req,res,Render,page,pushFile,code,headers,compression);
  }
}


function serveDocumentFile(req,res,Render,page,pushFile,code,headers,compression)
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

    CachedFiles.documentFiles[page] = {
      stat:stat
    };

    var data = '';

    var readerStream = fs.createReadStream(pathname);

    readerStream.on('data', function(chunk)
    {
      data += chunk;
    });

    readerStream.on('end',function()
    {
      CachedFiles.documentFiles[page].data = data;

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

      if(compression != null)
      {
        zlib.gzip(data, function (_, result)
        { 
          if(pushFile !== false)
          {
            res.stream.end(result);  
          }
          else
          {
            res.write(result);
            res.end();  
          }                        
        });
      }
      else
      {
        if(pushFile !== false)
        {
          res.stream.end(data);  
        }
        else
        {
          res.end(data);  
        } 
      }
    });

    readerStream.on('error',function()
    {
      renderErrorFiles(req,res,404);
    });

  });
}

function renderErrorFiles(req,res,statusCode,stream = null,headers = null,pathname = null)
{
  if(statusCode === 404)
  {
    if(stream == null)
    {
      if(!res.headersSent)
      {
        res.writeHead(statusCode,hasteObj.header404);
      }
    }
    else
    {
      hasteObj.header404[[hasteObj.http2.constants.HTTP2_HEADER_STATUS]] = 200;
      stream.respond(hasteObj.header404);
    }

    if(config.cache.staticFiles)
    {
      if(stream == null)
      {
        res.end(CachedFiles.staticFiles.File404.data);
      }
      else
      {
        stream.end(CachedFiles.staticFiles.File404.data);
      }
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
          if(stream == null)
          {
            res.end(data);
          }
          else
          {
            stream.end(data);
          }
        }
      });
    }
  }
  else if(statusCode === 500)
  {
    if(stream == null)
    {
      if(!res.headersSent)
      {
        res.writeHead(statusCode,hasteObj.header500);
      }
    }
    else
    {
      hasteObj.header500[[hasteObj.http2.constants.HTTP2_HEADER_STATUS]] = 200;
      stream.respond(hasteObj.header500);
    }

    if(config.cache.staticFiles)
    {
      if(stream == null)
      {
        res.end(CachedFiles.staticFiles.File500.data);
      }
      else
      {
        stream.end(CachedFiles.staticFiles.File500.data);
      }
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
          if(stream == null)
          {
            res.end(data);
          }
          else
          {
            stream.end(data);
          }
        }
      });
    }
  }
  else if(statusCode === 403)
  {
    if(stream == null)
    {
      if(!res.headersSent)
      {
        res.writeHead(statusCode,hasteObj.header403);
      }
    }
    else
    {
      hasteObj.header403[[hasteObj.http2.constants.HTTP2_HEADER_STATUS]] = 403;
      stream.respond(hasteObj.header403);
    }

    if(config.cache.staticFiles)
    {
      if(stream == null)
      {
        res.end(CachedFiles.staticFiles.File403.data);
      }
      else
      {
        stream.end(CachedFiles.staticFiles.File403.data);
      }
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
          if(stream == null)
          {
            res.end(data);
          }
          else
          {
            stream.end(data);
          }
        }
      });
    }
  }
  else if(statusCode === 503)
  {
    if(stream == null)
    {
      if(!res.headersSent)
      {
        res.writeHead(statusCode,hasteObj.header503);
      }
    }

    if(config.cache.staticFiles)
    {
      if(stream == null)
      {
        res.end(CachedFiles.staticFiles.File503.data);
      }
      else
      {
        hasteObj.header503[[hasteObj.http2.constants.HTTP2_HEADER_STATUS]] = 503;

        stream.respond(hasteObj.header503);

        stream.end(CachedFiles.staticFiles.File503.data);
      }
    } 
    else
    {
      fs.exists(pathname,function(exists)
      {
        if(!exists)
        {
          hasteObj.header503[[hasteObj.http2.constants.HTTP2_HEADER_STATUS]] = 404;
          stream.respond(hasteObj.header404);
          stream.end("File not found");
          return;
        }

        if(fs.statSync(pathname).isDirectory())
        {
          pathname += '/error_files/'+config.errorPages.MaintainancePage;
        }

        fs.readFile(pathname, function(err, data)
        {
          if(err)
          {
            stream.respond(hasteObj.header500);
            stream.end(data);
          }
          else
          {
            if(stream == null)
            {
              res.writeHead(statusCode,hasteObj.header503);
              res.end(data);
            }
            else
            {
              hasteObj.header503[[hasteObj.http2.constants.HTTP2_HEADER_STATUS]] = 503;
              stream.respond(hasteObj.header503);
              stream.end(data);
            }
          }
        });

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

async function Authorization(req)
{
  return new Promise((resolve,reject)=>{
    try
    {
      let auth = req.headers['authorization'].split(' ')[1];

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
      var list = {},rc = req.headers.cookie;

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



async function getUserAgent(req,callback)
{
  if(callback != undefined && typeof(callback) == "function")
  { 
    try
    {
      if(typeof(req.headers['user-agent']) != 'undefined' && req.headers['user-agent'] != '')
      {
        callback(req.headers['user-agent']);
      }
      else
      {
        callback(null);
      }
    }
    catch(e)
    {
      callback(e);
    }
  }
  else
  {
    return new Promise((resolve,reject)=>{
      try
      {
        if(typeof(req.headers['user-agent']) != 'undefined' && req.headers['user-agent'] != '')
        {
          resolve(req.headers['user-agent']);
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
}


// send response for 401 authorization


async function sendAuthorization(req,res,msg)
{
  try
  {
    if(!res.headersSent)
    {
      res.writeHead(401,{
        'Keep-Alive':' timeout=5, max=500',
        'Server': 'Node Server',
        'Developed-By':'Pounze It-Solution Pvt Limited',
        'Content-Type':'text/html',
        'WWW-Authenticate':'Basic realm="'+msg+'"'
      });
    }
    
    var readerStream = fs.createReadStream('./error_files/'+config.errorPages.NotAuthorized);

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
  }
  catch(e)
  {
    reject(e);
  }
}



// checking for 401 authorization username and password



function checkAuth(req)
{
  try
  {
    if(typeof(req.headers['authorization']) == 'undefined')
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

async function writeLogs(path,data,callback)
{
  if(callback != undefined && typeof(callback) != "function")
  {
    fs.open(path, 'w', function(err, fd)
    {
      if(err)
      {
        callback({err:err,status:false});
      }

      fs.write(fd, data,function(err)
      {
        if(err)
        {
          callback({err:err,status:false});
        }
        else
        {
          fs.close(fd, function()
          {
            callback({msg:'Write successfully',status:true});
          });
        }
      });
    });
  }
  else
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
}

// method to copy file from temp folder use for file uploading

async function fileCopy(path,pathDir,callback)
{
  if(callback != undefined && typeof(callback) != "function")
  {
    fs.readFile(path,function(error, data)
    {
      if(error)
      {
        callback(false);
        return;
      }

      fs.writeFile(pathDir,data,function(error)
      {
        if(error)
        {
          callback(false);
          return;
        }

        callback(true);

      });

    });
  }
  else
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
}

// default headers method

async function defaultHeaders(res,statuCode,headers)
{
  if(!res.headersSent)
  {
    res.writeHead(statuCode,headers);
  }
}

// filereader to read  files in buffers



async function fileReader(path,callback)
{
  if(callback != undefined && typeof(callback) == "function")
  {
    var data = '';

    readerStream = fs.createReadStream(path);

    readerStream.on('data',function(chunk)
    {
      data += chunk;
    });

    readerStream.on('end',function()
    {
      callback(data);
      readerStream.destroy();
    });

    readerStream.on('error',function(error)
    {
      callback(error);
      readerStream.destroy();
    });
  }
  else
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
}

// IPC 

let ipc = {
  fork:function(fileName)
  {
    ipc.ipcObject = fork(fileName);
  },
  onMessage:function(callback)
  {
    ipc.ipcObject.on('message', function(response)
    {
      if(typeof(callback) === "function")
      {
        callback(response);
      }
      else
      {
        return new Promise((resolve,reject)=>{
          resolve(response);
        });
      }
    });
  },
  send:function(obj)
  {
    ipc.ipcObject.send(obj);
  },
  parentSend:function(input)
  {
    process.send(input);
  },
  parentOnMessage:function(callback)
  {
    process.on('message', function(response)
    {
      if(typeof(callback) === "function")
      {
        callback(response);
      }
      else
      {
        return new Promise((resolve,reject)=>{
          resolve(response);
        });
      }
    });
  }
};

// task distributor

let taskDistributor = {
  distribute:async function(data,splitCount,method,callback)
  {
    var splitData = [];

    var joinData = [];

    for(var i = 0;i<splitCount;i++)
    {
      splitData[i] = [];
    }

    for(var index in data)
    {
      splitData[index % splitCount].push(data[index]);
    }

    for(var i = 0;i<splitCount;i++)
    {
      var finalData = await method(splitData[i]).catch(function(e)
      {
        console.log(e);
      });

      joinData.push(finalData);
    }

    if(typeof(callback) === "function")
    {
      callback(joinData);
    }
    else
    {
      return new Promise((resolve,reject)=>{
        resolve(joinData);
      });
    }
  }
};

// 

let worker = {
  workers:[],
  run:function(data,workerCount,method,callback)
  {
    try
    {
      var splitData = [];

      var joinData = [];

      // Fork workers
      for (let i=0;i<workerCount;i++)
      {
        splitData[i] = [];
      }

      for(var index in data)
      {
        splitData[index % workerCount].push(data[index]);
      }

      worker.startWorker(data,workerCount,method,splitData,joinData,callback)
    }
    catch(e)
    {
      console.error(e);
    }
  },
  startWorker:function(data,workerCount,method,splitData,joinData,callback)
  {
    try
    {
      if(cluster.isMaster)
      {
        worker.masterProcess(data,workerCount,splitData,joinData,callback);
      }
      else
      {
        method(splitData[cluster.worker.id - 1]);
      }
    }
    catch(e)
    {
      console.log(e);
    }
  },
  masterProcess:function(data,workerCount,splitData,joinData,callback)
  {
    try
    {
      for (let i=0;i<workerCount;i++)
      {
        const clusterWorker = cluster.fork();
        worker.workers.push(clusterWorker);
      }

      var joinClusterData = [];

      for(var index in worker.workers)
      {
        worker.workers[index].on('message', function(message)
        {
          joinClusterData.push(message);

          if(joinClusterData.length === workerCount)
          {
            if(typeof(callback) === "function")
            {
              callback(joinClusterData);
            }
            else
            {
              return new Promise((resolve,reject)=>{
                resolve(joinClusterData);
              }); 
            }
          } 
        });
      }
    }
    catch(e)
    {
      console.error(e);
    }
  },
  send:function(callbackData)
  {
    process.send(callbackData);
  }
};

// formatting dates

function formatDate(date,format,delimiter)
{

  try
  {
    let month = '' + (date.getMonth() + 1),

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

    if(format == "DDMMYYYY")
    {
      var dateArray = [day,month,year];
    }
    else if(format == "MMDDYYYY")
    {
      var dateArray = [month,day,year];
    }
    else if(format == "YYYYMMDD")
    {
      var dateArray = [year,month,day];
    }
    else
    {
      var dateArray = [year,day,month];
    } 

    if(delimiter !== undefined && delimiter === "/")
    {
      return dateArray.join('/')+' '+hour+':'+min+':'+sec;
    }
    else if(delimiter !== undefined && delimiter === "-")
    {
      return dateArray.join('-')+' '+hour+':'+min+':'+sec;
    }
    else
    {
      return dateArray.join('/')+' '+hour+':'+min+':'+sec;
    }
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

// http remote Request client

async function http2RemoteRequest(params,callback)
{
  try
  {
    if(params.url == undefined || params.url == "")
    {
      console.error("Url cannot be empty");
      return;
    }

    if(params.options == undefined || params.options == "")
    {
      console.error("Options cannot be empty");
      return;
    }

    const clientSession = http2.connect(params.url);

    const req = clientSession.request(params.options);

    var responseHeaders = {};

    var data = [];

    req.on('response', (resHeaders) => {
      responseHeaders = resHeaders;
    });

    req.on('data', (chunk) => {
      data.push(chunk);
    });

    req.on('end', () => {
      data = Buffer.concat(data);

      clientSession.destroy();

      if(typeof(callback) == "function")
      {
        callback(data);
      }
      else
      {
        return new Promise((resolve,reject)=>{
          resolve(data);
        }); 
      }
    });
  }
  catch(e)
  {
    console.error(e);
  }
}


// method to make http client request to other server

async function RemoteRequest(params,callback)
{
  try
  {
    var postData = '';

    var data = [];

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
          data.push(chunk);
        });

        // after ending the request

        res.on('end',function()
        {
          data = Buffer.concat(data);
          
          if(typeof(callback) == "function")
          {
            callback(data);
          }
          else
          {
            return new Promise((resolve,reject)=>{
              resolve(data);
            }); 
          }

           // console.error('No more data in response.');
        });

      });

      req.on('error',function(e)
      {
        callback(`problem with request: ${e.message}`);
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
          if(typeof(callback) == "function")
          {
            callback(data);
          }
          else
          {
            return new Promise((resolve,reject)=>{
              resolve(data);
            }); 
          }
           // console.error('No more data in response.');
        });

      });

      req.on('error',function(e)
      {
        callback(`problem with request: ${e.message}`);
      });

      // write data to request body

      req.write(JSON.stringify(postData));

      req.end();

    }
  }
  catch(e)
  {
    console.error(e);
  }
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
  compression library
*/

var compress = {
  gzip:function(data,callback)
  {
    zlib.gzip(data, function (_, result)
    { 
      if(callback != undefined && typeof(callback) == "function")
      {
        callback(result);
      }
      else
      { 
        return new Promise((resolve,reject)=>{
          resolve(result);
        });
      }           
    });
  },
  deflate:function(data,callback)
  {
    zlib.deflate(data, function (_, result)
    { 
      if(callback != undefined && typeof(callback) == "function")
      {
        callback(result);
      }
      else
      { 
        return new Promise((resolve,reject)=>{
          resolve(result);
        });
      }               
    });
  },
  DeflateRaw:function(data,callback)
  {
    zlib.deflateRaw(data, function (_, result)
    { 
      if(callback != undefined && typeof(callback) == "function")
      {
        callback(result);
      }
      else
      { 
        return new Promise((resolve,reject)=>{
          resolve(result);
        });
      }              
    });
  }
}; 

let RedisPS = {
  config:{},
  pub:{
    createClient:function()
    {
      Redis.publisher = hasteObj.redis.createClient(Redis.config.url); 
    },
    onMessage:function(callback)
    {
      Redis.publisher.on('message', function(chan, msg)
      {  
        if(typeof(callback) === "function")
        {
          callback(chan, msg);
        } 
        else
        {
          return new Promise((resolve,reject)=>{
            resolve(chan, msg);
          });
        }
      });
    },
    subscribe:function(topicName)
    {
      Redis.publisher.subscribe(topicName);
    }
  },
  sub:
  {
    createClient:function()
    {
      Redis.subscriber = hasteObj.redis.createClient(Redis.config.url);
    },
    publish:function(topic,msg)
    {
      Redis.subscriber.publish(topic, msg);  
    }
  }
};

session.clearSession();

process.on('uncaughtException', error => {
  if(config.Misc.Exception === true)
  {
    console.warn(`Uncaught exception: ${error.toString()}`);
    closeConnection("Exception")
  }
});

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

exports.defaultHeaders = defaultHeaders;

exports.fileCopy = fileCopy;

exports.fileReader = fileReader;

exports.formatDate = formatDate;

exports.Hash = Hash;

exports.RemoteRequest = RemoteRequest;

exports.http2RemoteRequest = http2RemoteRequest;

exports.writeLogs = writeLogs;

exports.Authorization = Authorization;

exports.checkAuth = checkAuth;

exports.sendAuthorization = sendAuthorization;

exports.getCookies = getCookies;

exports.setCookies = setCookies;

exports.getUserAgent = getUserAgent;

exports.session = session;

exports.compress = compress;

exports.routes = routes;

exports.RedisPS = RedisPS;

exports.task = taskDistributor;

exports.worker = worker;

global.die = die;

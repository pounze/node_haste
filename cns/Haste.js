/*
	Haste Framework copy right 2017

	By Pounze It Solution Pvt Ltd

	Developed @author Sudeep Dasgupta

	email: sudeep.dasgupta@pounze.com or sudeep.ignition@gmail.com

	Join us to make this framework the best among all other frameworks
	
	current version: 1.0

	next version in 1.1 c++ Thread module will be implemented as node Addons library for concurrency
*/



/*
	Modules and libraries are initialized
*/

const fs = require('fs');
const http = require('http');
const https = require('https');
const url_module = require('url');
const PATHNAME = require('path');
const cluster = require('cluster');
const qs = require('querystring');
const config = require('./config.js');

/*
	haste method is declared where Library constructor is called
*/


var haste = function(params)
{
    return new Library(params);
};

/*
	Library constructor variables are initialized
*/

var Library = function(params)
{
  this.count = 0;
  this.input = {};
  this.staticPath = [];
  this.globalObject = {};
  return this;
};

/*
    Haste method is called and Library constructor is initialized
*/

var hasteObj = haste();

/*
    Library protyping is used to add more methods and objects to haste.fn Object
*/

haste.fn = Library.prototype = 
{

    /*
        Http method to create Http Server
    */

    HttpServer:function(ip,port,callback = null)
    {
        /*
            If ip and port is defined
        */

       if(typeof(ip) != 'undefined' && typeof(port) != 'undefined' && ip != '' && port != '')
       {

        /*
            checking for CPU cores and creating child process accordingly
        */

        var cpuCount = null;
        if(cluster.isMaster)
        {
          cpuCount = require('os').cpus().length;
          
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
         /*
            Http server is created
         */
          var server = http.createServer(haste.fn.handleRequest);

          /*
            Http server configurations
          */
          server.on('connection',function(socket)
          { 
            socket.setTimeout(config.server.socketTimeout);
          });

          server.setTimeout(config.server.setTimeout);

          server.setMaxListeners(config.server.maxListeners);

          server.on('clientError', (err, socket) => {
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
          });

          /*
            Server listening and closing the server
          */

          server.listen(port,ip);
          server.close();

          /*
            sending server object as callback
          */

          if(callback != null && typeof(callback) == 'function')
          {
            callback(server);
          }
          else
          {
            return server;
          }
        }
      }
      else
      {
        console.error('Please enter Ip address and port');
        return false;
      }
    },
    HttpsServer:function(ip,port,callback = null)
    {
        /*
            https server is created
        */

        /*
            checking for ip address and port
        */

      if(typeof(ip) != 'undefined' && typeof(port) != 'undefined' && ip != '' && port != '')
      {

        /*
            Checking for CPU cores and creating child process accordingly
        */

        var cpuCount = null;
        if(cluster.isMaster)
        {
          cpuCount = require('os').cpus().length;
          
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

          /*
            Https server is created
          */
          var server = https.createServer(haste.fn.handleRequest);

          /*
            Server confugurations
          */
          server.on('connection',function(socket)
          { 
            socket.setTimeout(config.server.socketTimeout);
          });

          server.setTimeout(config.server.setTimeout);

          server.setMaxListeners(config.server.maxListeners);

          server.on('clientError', (err, socket) => {
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
          });

          /*
            Server listening and closing the server
          */

          server.listen(port,ip);
          server.close();

          /*
            sending server object as callback
          */

          if(callback != null && typeof(callback) == 'function')
          {
            callback(server);
          }
          else
          {
            return server;
          }
        }
      }
      else
      {
        console.error('Please enter Ip address and port');
        return false;
      }
    },
    getIpAddress:function(req,res)
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
            res.writeHead(404,{
              'Cache-Control':'public,max-age=31536000',
              'Keep-Alive':' timeout=5, max=500',
              'Expires':new Date(),
              'Server': 'Node Server',
              'Developed-By':'Pounze It-Solution Pvt Limited',
              'Pragma': 'public,max-age=31536000'
            });
            res.end('Something went wrong');
            return false;
        }
    },
    handleRequest:function(req,res)
    {
        /*
            Main method of the entire framework

            this methods handles all https and http request

        */

        /*
            Checking for heap memory total and used
        */

        haste.fn.getIpAddress(req,res);

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
            process.exit();
        }

        /*
            request object methods
        */
        req.on('error',function()
        {
            console.error('Error in server');
            return false;
        });

        req.on("end", function()
        {
          // request ended normally
        });


        /*
            this checked is responsible for server maintainance
            if mantainance object is set true then 
            maintanance html page is shown to user
        */

        if(config.server.maintainance)
        {
            res.writeHead(303,{
              'Cache-Control':'public,max-age=31536000',
              'Keep-Alive':' timeout=5, max=500',
              'Expires':new Date(),
              'Server': 'Node Server',
              'Developed-By':'Pounze It-Solution Pvt Limited',
              'Pragma': 'public,max-age=31536000'
            });

            var readerStream = fs.createReadStream('./error_files/'+config.errorPages.MaintainancePage);
            readerStream.pipe(res);
            
            return false;
        }
        /*
          getting global object length to know if any routes is created
        */

        let uriListLen = Object.keys(hasteObj.globalObject).length;

        /*
          if length is zero error is thrown to created a route
        */

        if(uriListLen == 0)
        {
          console.error('Please create a route');
          return false;
        }

      let requestMethod = req.method;
      let requestUri = url_module.parse(req.url).pathname;
      let ext = (/[.]/.exec(requestUri)) ? /[^.]+$/.exec(requestUri) : undefined;
      let myExp;
      let notMatchCount = 0;

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
            
          */
            myExp = new RegExp(hasteObj.globalObject[obj]["regex"]);
            if(requestUri.match(myExp))
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
                  haste.fn.parseGet(req,function(data)
                  {
                      hasteObj.input['requestData'] = data;
                  });
                break;
                case "POST":
                  haste.fn.parsePost(req,function(data)
                  {
                      hasteObj.input['requestData'] = data;
                  });
                break;
                default:
                console.error('Invalid Request');
              }


              /*
                checking for middleware if array or string 
                if array then multiple middleware
                else single middleware
              */

              if(typeof(hasteObj.globalObject[obj]["middleware"]) == 'object' && Array.isArray(hasteObj.globalObject[obj]["middleware"]))
              {
                  let middlewareLen = hasteObj.globalObject[obj]["middleware"].length;
                  for(var j=0;j<middlewareLen;j++)
                  {

                    // iterating thoough the middleware

                    try
                    {

                      // checking if the middleware file exists or not

                      var middlewarestat = fs.statSync('./middlewares/'+hasteObj.globalObject[obj]["middleware"][j]+'.js');

                      // if the middleware is a file

                      if(middlewarestat.isFile())
                      {

                          // then invoke the middleware main method

                        var middlewareFile = require('../middlewares/'+hasteObj.globalObject[obj]["middleware"][j]+'.js');
                        var middlewareCallbacks = middlewareFile.main(req,res,hasteObj.input);
                        if(!middlewareCallbacks[0])
                        {
                          // if middleware callback is false then request is stopped here

                          res.setHeader('Content-Type','application/json');
                          res.end(JSON.stringify(middlewareCallbacks[1]));
                          return false;
                        }
                        else
                        {
                          hasteObj.input[hasteObj.globalObject[obj]["middleware"][j]] = middlewareCallbacks[1];
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

                      res.writeHead(500,{
                        'Cache-Control':'public,max-age=31536000',
                        'Keep-Alive':' timeout=5, max=500',
                        'Expires':new Date(),
                        'Server': 'Node Server',
                        'Developed-By':'Pounze It-Solution Pvt Limited',
                        'Pragma': 'public,max-age=31536000'
                      });

                      var readerStream = fs.createReadStream('./error_files/'+config.errorPages.InternalServerError);
                      readerStream.pipe(res);
                      console.error(e);
                    }
                  }
              }
              else if(typeof(hasteObj.globalObject[obj]["middleware"]) == 'string')
              {
                  let middlewarestat = fs.statSync('./middlewares/'+hasteObj.globalObject[obj]["middleware"]+'.js');
                  if(middlewarestat.isFile())
                  {
                    let middlewareFile = require('../middlewares/'+hasteObj.globalObject[obj]["middleware"]+'.js');
                    let middlewareCallbacks = middlewareFile.main(req,res,hasteObj.input);
                    if(!middlewareCallbacks[0])
                    {
                      res.setHeader('Content-Type','application/json');
                      res.end(JSON.stringify(middlewareCallbacks[1]));
                      return false;
                    }
                    else
                    {
                      hasteObj.input[hasteObj.globalObject[obj]["middleware"]] = middlewareCallbacks[1];
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

              /*
                checking if the second argument is string or function

                if string then it is passed to controller
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
                     var stat = fs.statSync('./controllers/'+hasteObj.globalObject[obj]["argument"]+'.js');
                      
                      if(stat.isFile())
                      {
                        var controller = require('../controllers/'+hasteObj.globalObject[obj]["argument"]+'.js');
                        controller.main(req,res,hasteObj.input);
                      }
                      else
                      {
                        console.error('Controller must me a javascript file'); 
                      }
                  }
                  catch(e)
                  {
                      res.writeHead(500,{
                        'Cache-Control':'public,max-age=31536000',
                        'Keep-Alive':' timeout=5, max=500',
                        'Expires':new Date(),
                        'Server': 'Node Server',
                        'Developed-By':'Pounze It-Solution Pvt Limited',
                        'Pragma': 'public,max-age=31536000'
                      });

                      var readerStream = fs.createReadStream('./error_files/'+config.errorPages.InternalServerError);
                      readerStream.pipe(res);
                      console.error(e);
                  }
              }
              else
              {
                console.error('Route\'s second argument must me function of string ' + typeof(hasteObj.argument[i]) + ' given');
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
            res.writeHead(404,{
              'Cache-Control':'public,max-age=31536000',
              'Keep-Alive':' timeout=5, max=500',
              'Expires':new Date(),
              'Server': 'Node Server',
              'Developed-By':'Pounze It-Solution Pvt Limited',
              'Pragma': 'public,max-age=31536000'
            });
           var readerStream = fs.createReadStream('./error_files/'+config.errorPages.PageNotFound);
           readerStream.pipe(res);
           return false;
        }
      }
      else
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
              case '.css': res.setHeader("Content-Type", "text/css");
              break;
              case '.ico' : res.setHeader("Content-Type","image/ico");
              break;
              case '.js' : res.setHeader("Content-Type", "text/javascript");
              break;
              case '.jpeg' : res.setHeader("Content-Type", "image/jpg");
              break;
              case '.jpg' : res.setHeader("Content-Type", "image/jpg");
              break;
              case '.png' : res.setHeader("Content-Type", "image/png");
              break;
              case '.gif' : res.setHeader("Content-Type", "image/gif");
              break;
              case '.json' : res.setHeader("Content-Type", "application/json");
              break;
              case '.pdf' : res.setHeader("Content-Type", "application/pdf");
              break;
              case '.ttf' : res.setHeader("Content-Type", "application/octet-stream");
              break;
              case '.html' : res.setHeader("Content-Type", "text/html");
              break;
              case '.woff' : res.setHeader("Content-Type", "application/x-font-woff");
              break;
              default : res.setHeader("Content-Type", "text/plain");
            }

            res.writeHead(200,{
              'Cache-Control':'public,max-age=31536000',
              'Keep-Alive':' timeout=5, max=500',
              'Expires':new Date(),
              'Server': 'Node Server',
              'Developed-By':'Pounze It-Solution Pvt Limited',
              'Pragma': 'public,max-age=31536000'
            });

            readerStream = fs.createReadStream('./'+requestUri);
            readerStream.pipe(res);

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
          res.writeHead(403,{
            'Cache-Control':'public,max-age=31536000',
            'Keep-Alive':' timeout=5, max=500',
            'Expires':new Date(),
            'Server': 'Node Server',
            'Developed-By':'Pounze It-Solution Pvt Limited',
            'Pragma': 'public,max-age=31536000'
            });

            var readerStream = fs.createReadStream('./error_files/'+config.errorPages.DirectoryAccess);
            readerStream.pipe(res);
            return false;
        }
      }

      
    },
    get:function(uri,argument)
    {
        // get method for get routers
        
        hasteObj.globalObject[uri] = {
            "uri":uri,
            "request_type":"GET",
            "argument":argument,
            "regex":uri
        };
        hasteObj.count += 1;
        return this;
    },
    post:function(uri,argument)
    {

        // post method for post routers
        hasteObj.globalObject[uri] = {
            "uri":uri,
            "request_type":"POST",
            "argument":argument,
            "regex":uri
        };
        hasteObj.count += 1;
        return this;
    },
    middlewares:function(middleware)
    {   
        // adding middle wares

        let localCount = 0;

        for(key in hasteObj.globalObject)
        {
            localCount += 1;

            if(localCount == hasteObj.count)
            {
                hasteObj.globalObject[key].middleware = middleware;
            }
        }
        return this;
    },
    where:function(regex)
    {
      // checking for regular expression match

      let localCount = 0;

      for(key in hasteObj.globalObject)
      {
          localCount += 1;

          if(localCount == hasteObj.count)
          {
              hasteObj.globalObject[key].regexExp = regex;
          }
      }

      hasteObj.globalObject[key]['regex'] = hasteObj.globalObject[key]['uri'];

      for(regex in hasteObj.globalObject[key]['regexExp'])
      {
          hasteObj.globalObject[key]['regex'] = hasteObj.globalObject[key]['regex'].replace(regex,hasteObj.globalObject[key]['regexExp'][regex]);
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
        var common_templates_stat = fs.statSync('./common_templates/common_templates.js');

        if(common_templates_stat.isFile())
        {
            var views = require('../common_templates/common_templates.js');
            views.main(req,res,data);

            try
            {
                var stat = fs.statSync('./templates/'+file+'.js');

                if(stat.isFile())
                {
                  var views = require('../templates/'+file+'.js');
                  views.main(req,res,data);
                }
                else
                {
                  console.error('View template page name must be a javascript file');
                }
            }
            catch(e)
            {
                res.writeHead(500,{
                  'Cache-Control':'public,max-age=31536000',
                  'Keep-Alive':' timeout=5, max=500',
                  'Expires':new Date(),
                  'Server': 'Node Server',
                  'Developed-By':'Pounze It-Solution Pvt Limited',
                  'Pragma': 'public,max-age=31536000'
                });

                var readerStream = fs.createReadStream('./error_files/'+config.errorPages.InternalServerError);
                readerStream.pipe(res);

                console.error(e);
            }
        }
      }
      catch(e)
      {
        res.writeHead(500,{
          'Cache-Control':'public,max-age=31536000',
          'Keep-Alive':' timeout=5, max=500',
          'Expires':new Date(),
          'Server': 'Node Server',
          'Developed-By':'Pounze It-Solution Pvt Limited',
          'Pragma': 'public,max-age=31536000'
        });

        var readerStream = fs.createReadStream('./error_files/'+config.errorPages.InternalServerError);
        readerStream.pipe(res);

        console.error(e);
      }
    },
    AllowDirectories:function(path)
    {
        // allow folders to get accessed

        hasteObj.staticPath = path;
    },
    parseGet:function(req,callback)
    {
        // parse get request
        var url_parsed = url_module.parse(req.url,true);
        callback(url_parsed['query']);
    },
    parsePost:function(req,callback)
    {

        // parse post request 

        if((req.method == 'POST' &&  req.headers['content-type'].match(/(multipart\/form\-data\;)/g)))
        {
          callback({msg:'Please parse the multipart form data using multiparty or some other libraries'});
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
              callback(JSON.parse(body));
            }
            else
            {
              callback(qs.parse(body));
            }
          });
        }
    },
    close:function()
    {
        // closing the haste object

        exports.__init__ = null;
        delete hasteObj;
        delete Library;
        delete this.haste;
        delete this.staticPath;
        delete this.globalObject;
        delete this.input;
        delete this;
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
                    console.error('controller does not exists');
                    throw err;
                }

                var controller = require('../controllers/'+input["cortex"]+'.js');
                var callbackData = controller.main(null,null,input);
                callback(callbackData);
            });
        }   
        else
        {
            console.error('cortex field must be string');
            callback(false);
        }

        return this;
    }
};


// method to write logs

function writeLogs(path,data,callback = null)
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

// method for 401 authorization

function Authorization(req)
{
    try
    {
        let auth = req.headers['authorization'].split(' ')[1];
        let decodedHeader = new Buffer(auth, 'base64').toString();
        decodedHeader = decodedHeader.split(':');
        return decodedHeader;
    }
    catch(e)
    {
        console.error(e);
        return false;
    }
}

// getting cookies

function getCookies(req)
{
    var list = {},rc = req.headers.cookie;

    rc && rc.split(';').forEach(function( cookie )
    {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

// setting cookies

function setCookies(cookies,res)
{
    var list = [ ];
    for (var key in cookies)
    {
        list.push(key + '=' + encodeURIComponent(cookies[key]));
    }

    hasteObj.cookieStatus = list.join('; ');
    return {"Set-Cookie":list.join('; ')};
}

// getting userAgents browser details

function getUserAgent(req)
{
    try
    {
        if(typeof(req.headers['user-agent']) != 'undefined' && req.headers['user-agent'] != '')
        {
            return req.headers['user-agent'];
        }
        else
        {
            return null;
        }
    }
    catch(e)
    {
        console.error(e);
        process.exit();
    }
}

// send response for 401 authorization

function sendAuthorization(msg,res)
{
    try
    {
        res.writeHead(401,{
          'Cache-Control':'public,max-age=31536000',
          'Keep-Alive':' timeout=5, max=500',
          'Expires':new Date(),
          'Server': 'Node Server',
          'Developed-By':'Pounze It-Solution Pvt Limited',
          'Pragma': 'public,max-age=31536000',
          'WWW-Authenticate':'Basic realm="'+msg+'"'
        });

        var readerStream = fs.createReadStream('./error_files/'+config.errorPages.NotAuthorized);
        readerStream.pipe(res);
    }
    catch(e)
    {
        console.error(e);
        process.exit();
    }
}

// checking for 401 authorization username and password

function checkAuth(req)
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

function renderPage(find,replace,req,res,page,code = null,headers = null)
{
    /*
    It checks for array if find and replace is array or not
  */

  if(Array.isArray(find) && Array.isArray(replace))
  {
    try
    {

      /*
        Checks for file existence using synchronous file reader
      */

      var stat = fs.statSync('./views/'+page+'.html');
      var data = '';

      /*
        verifies if its file or directory
      */

      if(stat.isFile())
      {

        /*
          If it is file then readstream
        */
        
        var readerStream = fs.createReadStream('./views/'+page+'.html');
        readerStream.on('data',function(chunk)
        {
          data += chunk;
          // activating zip compression for html pages, javascript, images, and css   
        });

        /*
          readstream on end method
        */

        readerStream.on('end',function()
        {

          /*
            find string and replacing it
          */
          var findLen = find.length;
          var replaceLength = replace.length;
          if(findLen == replaceLength)
          {
            for(var i=0; i<findLen; i++)
            {
              data = data.replace(find[i],replace[i]);
            }
            if(headers == null)
            {
                if(!hasteObj.cookieStatus)
                {
                    res.writeHead(200,{
                      'Content-Length':data.length,
                      'Cache-Control':'public,max-age=31536000',
                      'Keep-Alive':' timeout=5, max=500',
                      'Expires':new Date(),
                      'Server': 'Node Server',
                      'Developed-By':'Pounze It-Solution Pvt Limited',
                      'Pragma': 'public,max-age=31536000',
                      'Content-Type':'text/html; charset=UTF-8'
                    });
                }
                else
                {
                    res.writeHead(200,{
                      'Content-Length':data.length,
                      'Cache-Control':'public,max-age=31536000',
                      'Keep-Alive':' timeout=5, max=500',
                      'Expires':new Date(),
                      'Server': 'Node Server',
                      'Developed-By':'Pounze It-Solution Pvt Limited',
                      'Pragma': 'public,max-age=31536000',
                      'Content-Type':'text/html; charset=UTF-8',
                      "Set-Cookie":hasteObj.cookieStatus
                    });
                }
            }
            else
            {
                res.writeHead(code,headers);
            }
            
            res.end(data);
          }
          else
          {
            console.error('find and replace array length must be same');
          }
        });

        readerStream.on('error',function()
        {
         res.writeHead(404,{
              'Cache-Control':'public,max-age=31536000',
              'Keep-Alive':' timeout=5, max=500',
              'Expires':new Date(),
              'Server': 'Node Server',
              'Developed-By':'Pounze It-Solution Pvt Limited',
              'Pragma': 'public,max-age=31536000'
         });
          var readerStream = fs.createReadStream('./error_files/'+config.errorPages.PageNotFound);
           readerStream.pipe(res);
        });
      }
      else
      {
        console.error('View template page name must be a javascript file');
      }
    }
    catch(e)
    {
        res.writeHead(500,{
          'Cache-Control':'public,max-age=31536000',
          'Keep-Alive':' timeout=5, max=500',
          'Expires':new Date(),
          'Server': 'Node Server',
          'Developed-By':'Pounze It-Solution Pvt Limited',
          'Pragma': 'public,max-age=31536000'
        });

        var readerStream = fs.createReadStream('./error_files/'+config.errorPages.InternalServerError);
        readerStream.pipe(res);
      console.error(e);
    }
  }
  else
  {
    console.error('find and replace must be array');
  }
}

// method to copy file from temp folder use for file uploading

function fileCopy(path,pathDir,callback)
{
    fs.readFile(path,function(error, data)
    {
      fs.writeFile(pathDir,data,function(error)
      {
        if(error)
        {
          throw error;
          callback(false);
        }
        callback(true);
      });
    });
    callback(true);
}

// filereader to read  files in buffers

function fileReader(path,callback)
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
    });

    readerStream.on('error',function()
    {
      callback('Failed to get content');
    });
}

// formatting dates

function formatDate(date,callback)
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

    callback([year, month, day].join('-')+' '+hour+':'+min+':'+sec);
}

// hash method to encypt data

function Hash(method,string,encoding,callback)
{
    console.error(string);
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

    callback(hash);
}

// method to make http client request to other server

function RemoteRequest(params,callback)
{
    var postData = '';
    var data = '';
    if(params.protocol == 'http')
    {
      const http = require('http');
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
          callback(data);
           // console.error('No more data in response.');
        });
      });

      req.on('error',function(e)
      {
        console.error(`problem with request: ${e.message}`);
      });

      // write data to request body
      req.write(JSON.stringify(postData));
      req.end();
    }

    if(params.protocol == 'https')
    {
      const https = require('https');
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
          callback(data);
           // console.error('No more data in response.');
        });
      });

      req.on('error',function(e)
      {
        console.error(`problem with request: ${e.message}`);
      });

      // write data to request body

      req.write(JSON.stringify(postData));
      req.end();

    }
}

/*
    mysql object for executing mysql queries

*/

let mySQL = {
    poolQuery:function(parameters,callback)
    {
        const mysql = require('mysql');
        if(parameters.match == '' || typeof(parameters.match) == 'undefined')
        {
            var queryString = '';
        }
        else
        {
            var queryString = parameters.match;
        }

        const pool = mysql.createPool({
            connectionLimit: 2000, //important
            host: config.mySQL.host,
            user: config.mySQL.username,
            password: config.mySQL.password,
            database: config.mySQL.db,
            debug: false
        });

        pool.getConnection(function(error, connection)
        {
            if (error)
            {
                connection.release();
                //throw erroror;
                callback(error,null);
                return false;
            }

            if(queryString != '')
            {
                connection.query(parameters.query,[queryString], function(error, rows, fields)
                {
                    if (error)
                    {
                        connection.release();
                        //throw erroror;
                        callback(error,null);
                        return false;
                    }
                    connection.release();
                    callback(error,rows);
                });
            }
            else
            {
                connection.query(parameters.query, function(error, rows, fields)
                {
                    if (error)
                    {
                        connection.release();
                        //throw erroror;
                        callback(error,null);
                        return false;
                    }

                    connection.release();
                    callback(error,rows);
                });
            }
        });
    },
    BulkQuery:function(parameters,callback)
    {
        const mysql = require('mysql');
        if(parameters.match == '' || typeof(parameters.match) == 'undefined')
        {
            var queryString = '';
        }
        else
        {
            var queryString = parameters.match;
        }

        const connection = mysql.createConnection({
            host: config.mySQL.host,
            user: config.mySQL.username,
            password: config.mySQL.password,
            database: config.mySQL.db
        });

        connection.connect(function(error){
            if(error)
            {
                callback(error,null);
            }
        }); 

        // if you want to start transaction processing system

        if(parameters.transaction == true && typeof(parameters.transaction) != 'undefined')
        {
            connection.beginTransaction(function(error){
                if(error)
                {   
                    callback(error,null);
                }
            });
            if(queryString != '')
            {
                connection.query(parameters.query,[queryString],function(error,rows,fields){
                    if(error)
                    {
                        connection.rollback(function(){
                            callback(error,null);
                        });
                        return false;
                    }
                    connection.commit(function(error){
                        if (error) { 
                          connection.rollback(function() {
                            callback(error,null);
                          });
                        }
                        connection.end();
                        
                    });
                    connection.on('end',function()
                    {
                        callback(error,rows);
                    });
                });
            }
            else
            {
                connection.query(parameters.query,function(error,rows,fields){
                    if(error)
                    {
                        connection.rollback(function(){
                            callback(error,null);
                        });
                        return false;
                    }
                    connection.commit(function(error){
                        if (error) { 
                          connection.rollback(function() {
                            callback(error,null);
                          });
                        }
                        connection.end();
                        
                    });
                    connection.on('end',function()
                    {
                        callback(error,rows);
                    });
                });
            }
        }
        else
        {
            // else without transaction processing system
            
            if(queryString != '')
            {
                connection.query(parameters.query,[queryString],function(error,rows,fields){
                    if(error)
                    {
                        callback(error,null);
                        return false;
                    }
                    connection.end();
                    connection.on('end',function()
                    {
                        callback(error,rows);
                    });
                });
            }
            else
            {
                connection.query(parameters.query,function(error,rows,fields){
                    if(error)
                    {
                        callback(error,null);
                        return false;
                    }
                    connection.end();
                    connection.on('end',function()
                    {
                        callback(error,rows);
                    });
                });
            }
        }
    },
    query:function(parameters,callback)
    {
        const mysql = require('mysql');
        if(parameters.match == '' || typeof(parameters.match) == 'undefined')
        {
            var queryString = '';
        }
        else
        {
            var queryString = parameters.match;
        }

        const connection = mysql.createConnection({
            host: config.mySQL.host,
            user: config.mySQL.username,
            password: config.mySQL.password,
            database: config.mySQL.db
        });

        connection.connect(function(error)
        {
            if(error)
            {
                callback(error,null);
                return false;
            }
        }); 

        if(parameters.transaction == true && typeof(parameters.transaction) != 'undefined')
        {
            connection.beginTransaction(function(error)
            {
                if(error)
                {   
                    callback(error,null);
                    return false;
                }
            });
            if(queryString != '')
            {
                connection.query(parameters.query,queryString,function(error,rows,fields){
                    if(error)
                    {
                        connection.rollback(function(){
                            callback(error,null);
                        });
                        return false;
                    }
                    connection.commit(function(err)
                    {
                        if (error)
                        { 
                          connection.rollback(function()
                          {
                            callback(error,null);
                          });
                        }
                        connection.end();
                        
                    });
                    connection.on('end',function()
                    {
                        callback(error,rows);
                    });
                });
            }
            else
            {
                connection.query(parameters.query,function(error,rows,fields)
                {
                    if(error)
                    {
                        connection.rollback(function()
                        {
                            callback(error,null);
                        });
                        return false;
                    }
                    connection.commit(function(error)
                    {
                        if (error)
                        { 
                          connection.rollback(function()
                          {
                            callback(error,null);
                          });
                        }
                        connection.end();
                        
                    });
                    connection.on('end',function()
                    {
                        callback(error,rows);
                    });
                });
            }
        }
        else
        {
            // else without transaction processing system
        
            if(queryString != '')
            {
                connection.query(parameters.query,queryString,function(error,rows,fields)
                {
                    if(error)
                    {
                        callback(error);
                        return false;
                    }
                    connection.end();
                    connection.on('end',function()
                    {
                        callback(error,rows);
                    });
                });
            }
            else
            {
                connection.query(parameters.query,function(error,rows,fields)
                {
                    if(error)
                    {
                        callback(error);
                        return false;
                    }
                    connection.end();
                    connection.on('end',function()
                    {
                        callback(error,rows);
                    });
                });
            }
        }
    }
}

exports.__init__ = haste;
exports.renderPage = renderPage;
exports.mySQL = mySQL;

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
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

const url_module = require('url');

const PATHNAME = require('path');

const cluster = require('cluster');

const qs = require('querystring');

const config = require(__dirname+'/config.js');

const sessionObj = require(__dirname+'/session.js');

const stream = require('stream');



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

  this.input = {};

  this.staticPath = [];

  this.globalObject = {};

  this.request = {};

  this.response = {};

  this.cookieStatus = false;

  this.defaultMethod;

  this.maintainanceStat = undefined;

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

    HttpsServer:function(ip,port,options,callback = null)
    {

      // var options = {
      //   key: key,
      //   cert: cert,
      //   ca: ca
      // };

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



          /*

            Https server is created

          */

          var server = https.createServer(options,haste.fn.handleRequest);


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
    DefaultMethod:function(callback)
    {
      defaultMethod = callback;
    },
    getIpAddress:function(req,res)

    {

        /*

            Requiring IP address to get use ip address 

        */



        let getIpObject = require('../blockusers/IpAddress.js');

        let ip;



        if (hasteObj.request.headers['x-forwarded-for'])

        {

            ip = hasteObj.request.headers['x-forwarded-for'].split(",")[0];

        }

        else if(hasteObj.request.connection && hasteObj.request.connection.remoteAddress)

        {

            ip = hasteObj.request.connection.remoteAddress;

        } 

        else

        {

            ip = hasteObj.request.ip;

        }



        /*

            matching the ip address and status

        */



        if(getIpObject[ip])

        {

            if(!hasteObj.response.headersSent)
            {
              hasteObj.response.writeHead(404,{
                'Keep-Alive':' timeout=5, max=500',
                'Server': 'Node Server',
                'Developed-By':'Pounze It-Solution Pvt Limited'
              });
            }

            hasteObj.response.end('Something went wrong');

            return false;

        }

    },

    handleRequest: async function(req,res)
    {
      if(typeof(defaultMethod) != 'undefined')
      {
        defaultMethod(req,res);
      }
        hasteObj.request = req;
        hasteObj.response = res;
        session.currentSession = '';

        /*

            Main method of the entire framework



            this methods handles all https and http request



        */



        /*

            Checking for heap memory total and used

        */



        haste.fn.getIpAddress(hasteObj.request,hasteObj.response);



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
          hasteObj.response.end(JSON.stringify(data));

        }



        /*

            request object methods

        */

        hasteObj.request.on('error',function()
        {
          console.error('Error in server');
          return false;
        });



        hasteObj.request.on("end", function()

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
          if(!hasteObj.response.headersSent)
          {
            hasteObj.response.setHeader("Keep-Alive","timeout=5, max=500");
            hasteObj.response.setHeader("Server","Node Server");
            hasteObj.response.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
            hasteObj.response.setHeader("Content-Type","text/html");
          }
          
          var stat = fs.statSync('./error_files/'+config.errorPages.MaintainancePage);

          var modifiedDate = new Date(stat.mtimeMs).getTime();

          if(typeof(hasteObj.request.headers['if-modified-since']) == 'undefined')
          {
            hasteObj.response.setHeader('Last-Modified',modifiedDate);
            hasteObj.response.statusCode = 200;
          }
          else
          {
            hasteObj.response.setHeader('Last-Modified',modifiedDate);
            if(hasteObj.request.headers['if-modified-since'] < modifiedDate)
            {
              hasteObj.response.statusCode = 200;
            }
            else
            {
              hasteObj.response.statusCode = 304;
            }
          }

          var readerStream = fs.createReadStream('./error_files/'+config.errorPages.MaintainancePage);

          readerStream.pipe(hasteObj.response);

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



      let requestMethod = hasteObj.request.method;

      let requestUri = url_module.parse(hasteObj.request.url).pathname;

      let ext = (/[.]/.exec(requestUri)) ? /[^.]+$/.exec(requestUri) : undefined;

      let myExp;

      let notMatchCount = 0;

      let tempMapping = '';

      /*
        Cortex Concept for accessing apis more directly and easily
      */


      if(requestMethod == 'POST' && requestUri == '/cortex')
      {
        var parseCb = await haste.fn.parsePost(hasteObj.request);

        if(parseCb.status)
        {
          hasteObj.input['requestData'] = parseCb.data;

          try
          {

            if(typeof(hasteObj.input['requestData']['mapping']) != 'undefined' && hasteObj.input['requestData']['mapping'] != '')
            {
              tempMapping = hasteObj.input['requestData']['mapping'].split('.');
              tempMapping = tempMapping.join('/');
            }

           var stat = fs.statSync('./controllers/'+tempMapping+'/'+hasteObj.input['requestData']['cortex']+'.js');

            if(stat.isFile())
            {
              var controller = require('../controllers/'+tempMapping+'/'+hasteObj.input['requestData']['cortex']+'.js');

              controller.main(req,res,hasteObj.input);
            }
            else
            {
              console.error('Controller must me a javascript file'); 
            }

          }

          catch(e)

          {

            if(!hasteObj.response.headersSent)
            {
              hasteObj.response.writeHead(404,{
                'Keep-Alive':' timeout=5, max=500',
                'Server': 'Node Server',
                'Developed-By':'Pounze It-Solution Pvt Limited',
                'Cache-Control':'public,max-age=31536000',
                'Pragma': 'public,max-age=31536000'
              });
            }
            



            var readerStream = fs.createReadStream('./error_files/'+config.errorPages.PageNotFound);

            readerStream.pipe(res);

            console.error(e);
            return false;

          }
        }
        else
        {
          hasteObj.response.writeHead(500,{
            'Keep-Alive':' timeout=5, max=500',
            'Server': 'Node Server',
            'Developed-By':'Pounze It-Solution Pvt Limited',
            'Cache-Control':'public,max-age=31536000',
            'Pragma': 'public,max-age=31536000'
          });
          hasteObj.response.end(JSON.stringify({status:false,msg:"Failed to parse request"}));
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

                  var parseCb = await haste.fn.parseGet(hasteObj.request);

                  if(parseCb.status)
                  {
                    hasteObj.input['requestData'] = parseCb.data;

                    haste.fn.modules(hasteObj.request,hasteObj.response,hasteObj,obj);
                  }
                  else
                  {
                    hasteObj.response.writeHead(500,{
                      'Keep-Alive':' timeout=5, max=500',
                      'Server': 'Node Server',
                      'Developed-By':'Pounze It-Solution Pvt Limited',
                      'Cache-Control':'public,max-age=31536000',
                      'Pragma': 'public,max-age=31536000'
                    });

                    hasteObj.response.end(JSON.stringify({status:false,msg:"Failed to parse request"}));
                    return; 
                  }

                break;

                case "POST":

                  var parseCb = await haste.fn.parsePost(hasteObj.request);

                  if(parseCb.status)
                  {
                    hasteObj.input['requestData'] = parseCb.data;

                    haste.fn.modules(hasteObj.request,hasteObj.response,hasteObj,obj);
                  }
                  else
                  {
                    hasteObj.response.writeHead(500,{
                      'Keep-Alive':' timeout=5, max=500',
                      'Server': 'Node Server',
                      'Developed-By':'Pounze It-Solution Pvt Limited',
                      'Cache-Control':'public,max-age=31536000',
                      'Pragma': 'public,max-age=31536000'
                    });

                    hasteObj.response.end(JSON.stringify({status:false,msg:"Failed to parse request"}));
                    return;
                  }

                break;

                default:

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

            if(!hasteObj.response.headersSent)
            {
              hasteObj.response.writeHead(404,{
                'Keep-Alive':' timeout=5, max=500',
                'Server': 'Node Server',
                'Developed-By':'Pounze It-Solution Pvt Limited',
                'Cache-Control':'public,max-age=31536000',
                'Pragma': 'public,max-age=31536000'
              });
            }

           var readerStream = fs.createReadStream('./error_files/'+config.errorPages.PageNotFound);

           readerStream.pipe(hasteObj.response);

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

                case '.css': hasteObj.response.setHeader("Content-Type", "text/css");

                break;

                case '.ico' : hasteObj.response.setHeader("Content-Type","image/ico");

                break;

                case '.js' : hasteObj.response.setHeader("Content-Type", "text/javascript");

                break;

                case '.jpeg' : hasteObj.response.setHeader("Content-Type", "image/jpg");

                break;

                case '.jpg' : hasteObj.response.setHeader("Content-Type", "image/jpg");

                break;

                case '.png' : hasteObj.response.setHeader("Content-Type", "image/png");

                break;

                case '.gif' : hasteObj.response.setHeader("Content-Type", "image/gif");

                break;

                case '.json' : hasteObj.response.setHeader("Content-Type", "application/json");

                break;

                case '.pdf' : hasteObj.response.setHeader("Content-Type", "application/pdf");

                break;

                case '.ttf' : hasteObj.response.setHeader("Content-Type", "application/octet-stream");

                break;

                case '.html' : hasteObj.response.setHeader("Content-Type", "text/html");

                break;

                case '.woff' : hasteObj.response.setHeader("Content-Type", "application/x-font-woff");

                break;

                default : hasteObj.response.setHeader("Content-Type", "text/plain");

              }

              var stat = fs.statSync('./'+requestUri);

              if(stat.isFile())
              {
                var now = new Date();
                now.setDate(now.getDate()+14);
                hasteObj.response.setHeader("Keep-Alive","timeout=5, max=500");
                hasteObj.response.setHeader("Server","Node Server");
                hasteObj.response.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
                hasteObj.response.setHeader("Expire",now);

                var modifiedDate = new Date(stat.mtimeMs).getTime();

                if(typeof(hasteObj.request.headers['if-modified-since']) == 'undefined')
                {
                  hasteObj.response.setHeader('Last-Modified',modifiedDate);
                  hasteObj.response.statusCode = 200;
                }
                else
                {
                  hasteObj.response.setHeader('Last-Modified',modifiedDate);
                  if(hasteObj.request.headers['if-modified-since'] < modifiedDate)
                  {
                    hasteObj.response.statusCode = 200;
                  }
                  else
                  {
                    hasteObj.response.statusCode = 304;
                  }
                }

                readerStream = fs.createReadStream('./'+requestUri);
                
                if(config.compression.gzip == false)
                {
                  readerStream.pipe(hasteObj.response);
                }
                else
                {
                  var zlib = require('zlib');
                  hasteObj.response.setHeader('content-encoding','gzip');
                  readerStream.pipe(zlib.createGzip()).pipe(hasteObj.response);
                }
              }
              else
              {
                if(!hasteObj.response.headersSent)
                {
                  hasteObj.response.writeHead(404,{
                    'Keep-Alive':' timeout=5, max=500',
                    'Server': 'Node Server',
                    'Developed-By':'Pounze It-Solution Pvt Limited',
                    'Cache-Control':'public,max-age=31536000',
                    'Pragma': 'public,max-age=31536000',
                    'Content-Type':'text/html'
                  });
                }
                
                var readerStream = fs.createReadStream('./error_files/'+config.errorPages.PageNotFound);

                readerStream.pipe(hasteObj.response);
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

            if(!hasteObj.response.headersSent)
            {
              hasteObj.response.writeHead(403,{
                'Keep-Alive':' timeout=5, max=500',
                'Server': 'Node Server',
                'Developed-By':'Pounze It-Solution Pvt Limited',
                'Cache-Control':'public,max-age=31536000',
                'Pragma': 'public,max-age=31536000',
                'Content-Type':'text/html'
              });
            }
            



              var readerStream = fs.createReadStream('./error_files/'+config.errorPages.DirectoryAccess);

              readerStream.pipe(hasteObj.response);

              return false;

          }
        }
        catch(e)
        {
          if(!hasteObj.response.headersSent)
          {
            hasteObj.response.writeHead(500,{
              'Keep-Alive':' timeout=5, max=500',
              'Server': 'Node Server',
              'Developed-By':'Pounze It-Solution Pvt Limited',
              'Cache-Control':'public,max-age=31536000',
              'Pragma': 'public,max-age=31536000',
              'Content-Type':'text/html'
            });
          }
          

         var readerStream = fs.createReadStream('./error_files/'+config.errorPages.InternalServerError);

         readerStream.pipe(hasteObj.response);

         return false;
        }

      }



      

    },

    modules:function(req,res,hasteObj,obj)

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



                    hasteObj.response.setHeader('Content-Type','application/json');

                    hasteObj.response.end(JSON.stringify(middlewareCallbacks[1]));

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



                if(!hasteObj.response.headersSent)
                {
                  hasteObj.response.writeHead(500,{
                    'Keep-Alive':' timeout=5, max=500',
                    'Server': 'Node Server',
                    'Developed-By':'Pounze It-Solution Pvt Limited',
                    'Cache-Control':'public,max-age=31536000',
                    'Pragma': 'public,max-age=31536000',
                    'Content-Type':'text/html'
                  });
                }
                



                var readerStream = fs.createReadStream('./error_files/'+config.errorPages.InternalServerError);

                readerStream.pipe(res);

                console.error(e);
                return false;

              }

            }

            if(success == middlewareLen)
            {
              haste.fn.executeMethod(req,res,hasteObj,obj);
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

                hasteObj.response.setHeader('Content-Type','application/json');

                hasteObj.response.end(JSON.stringify(middlewareCallbacks[1]));

                return false;

              }

              else

              {

                hasteObj.input[hasteObj.globalObject[obj]["middleware"]] = middlewareCallbacks[1];

                haste.fn.executeMethod(req,res,hasteObj,obj);

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

        haste.fn.executeMethod(req,res,hasteObj,obj);

      }    

    },

    executeMethod:function(req,res,hasteObj,obj)

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

          if(!hasteObj.response.headersSent)
          {
            hasteObj.response.writeHead(500,{
              'Keep-Alive':' timeout=5, max=500',
              'Server': 'Node Server',
              'Developed-By':'Pounze It-Solution Pvt Limited',
              'Cache-Control':'public,max-age=31536000',
              'Pragma': 'public,max-age=31536000',
              'Content-Type':'text/html'
            });
          }
          



          var readerStream = fs.createReadStream('./error_files/'+config.errorPages.InternalServerError);

          readerStream.pipe(res);

          console.error(e);
          return false;

        }

      }

      else

      {

        console.error('Route\'s second argument must me function of string ' + typeof(hasteObj.argument[i]) + ' given');

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

        this.path = uri;

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

        this.path = uri;

        return this;

    },

    middlewares:function(middleware)

    {   

      hasteObj.globalObject[this.path].middleware = middleware;

      return this;

    },

    where:function(regex)

    {

      // checking for regular expression match

      hasteObj.globalObject[this.path].regexExp = regex;

      hasteObj.globalObject[this.path]['regex'] = hasteObj.globalObject[this.path]['uri'];


      for(regex in hasteObj.globalObject[this.path]['regexExp'])
      {
        hasteObj.globalObject[this.path]['regex'] = hasteObj.globalObject[this.path]['regex'].replace(regex,hasteObj.globalObject[this.path]['regexExp'][regex]);
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

        var common_templates_stat = fs.statSync('./common_templates/common_templates.js');



        if(common_templates_stat.isFile())

        {

            var views = require('../common_templates/common_templates.js');

            var commongData = await views.main(req,res,data);



            try
            {

              var stat = fs.statSync('./templates/'+file+'.js');

              var modifiedDate = new Date(stat.mtimeMs).getTime();

              if(stat.isFile())

              {

                if(typeof(hasteObj.request.headers['if-modified-since']) == 'undefined')
                {
                  hasteObj.response.setHeader('Last-Modified',modifiedDate);
                  hasteObj.response.statusCode = 200;
                }
                else
                {
                  hasteObj.response.setHeader('Last-Modified',modifiedDate);
                  if(hasteObj.request.headers['if-modified-since'] < modifiedDate)
                  {
                    hasteObj.response.statusCode = 200;
                  }
                  else
                  {
                    hasteObj.response.statusCode = 304;
                  }
                }


                var views = require('../templates/'+file+'.js');

                views.main(req,res,data,commongData);

              }

              else

              {

                console.error('View template page name must be a javascript file');

              }
            }
            catch(e)
            {
                if(!hasteObj.response.headersSent)
                {
                  hasteObj.response.writeHead(500,{
                    'Keep-Alive':' timeout=5, max=500',
                    'Server': 'Node Server',
                    'Developed-By':'Pounze It-Solution Pvt Limited',
                    'Cache-Control':'public,max-age=31536000',
                    'Pragma': 'public,max-age=31536000',
                    'Content-Type':'text/html'
                  });
                }
                



                var readerStream = fs.createReadStream('./error_files/'+config.errorPages.InternalServerError);

                readerStream.pipe(res);



                console.error(e);

            }

        }

      }

      catch(e)

      {

        if(!hasteObj.response.headersSent)
        {
          hasteObj.response.writeHead(500,{
            'Keep-Alive':' timeout=5, max=500',
            'Server': 'Node Server',
            'Developed-By':'Pounze It-Solution Pvt Limited',
            'Cache-Control':'public,max-age=31536000',
            'Pragma': 'public,max-age=31536000',
            'Content-Type':'text/html'
          });
        }
        



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

    parseGet: async function(req)
    {
      // parse get request
      return new Promise((resolve,reject)=>{
        var url_parsed = url_module.parse(hasteObj.request.url,true);

        resolve({status:true,data:url_parsed['query']});  
      });
    },

    parsePost: async function(req)

    {

      return new Promise((resolve,reject)=>{
        if(typeof(hasteObj.request.headers['content-type']) != 'undefined')

        {

          // parse post request 



          if((hasteObj.request.method == 'POST' &&  hasteObj.request.headers['content-type'].match(/(multipart\/form\-data\;)/g)))
          {

            try

            {

              const multiparty = require('multiparty');

              var form = new multiparty.Form();

              form.parse(req,function(err,fields,files)

              {

                var bindkey = {

                  fields:fields,

                  files:files

                };

                resolve({status:true,data:bindkey});

              });

            }

            catch(e)

            {
              resolve({status:false});
              console.error('Please install multiparty {npm install multiparty}');

            }

          }

          else

          {

            var body = '';

            hasteObj.request.on('data',function(data)

            {

              body += data;

            });

            hasteObj.request.on('end',function()

            {

              if(hasteObj.request.headers['content-type'] == 'application/json')

              {
                try
                {
                  var jsonData = JSON.parse(body);
                  resolve({status:true,data:jsonData});
                }
                catch(e)
                {
                  resolve({status:false});
                }
              }

              else

              {
                resolve({status:true,data:qs.parse(body)});

              }

            });

          }

        }
      });
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

        let auth = hasteObj.request.headers['authorization'].split(' ')[1];

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

    var list = {},rc = hasteObj.request.headers.cookie;



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

        if(typeof(hasteObj.request.headers['user-agent']) != 'undefined' && hasteObj.request.headers['user-agent'] != '')

        {

            return hasteObj.request.headers['user-agent'];

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
        if(!hasteObj.response.headersSent)
        {
          hasteObj.response.writeHead(401,{
            'Keep-Alive':' timeout=5, max=500',
            'Server': 'Node Server',
            'Developed-By':'Pounze It-Solution Pvt Limited',
            'Content-Type':'text/html',
            'WWW-Authenticate':'Basic realm="'+msg+'"'
          });
        }
        



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

    if(typeof(hasteObj.request.headers['authorization']) == 'undefined')

    {

        return false;

    }

    else

    {

        return true;

    }

}



function renderPage(Render,req,res,page,code = null,headers = null,compression = null)

{
  // zip compression

  if(compression != null)
  {
    hasteObj.response.setHeader('content-encoding','gzip');
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



      var stat = fs.statSync('./views/'+page+'.html');

      var modifiedDate = new Date(stat.mtimeMs).getTime();

      var data = '';

      var regexData;



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

          for(var key in Render)
          { 
            regexData = new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),"g");
            data = data.replace(regexData, Render[key]);
          }

          if(headers == null)

            {

                if(!hasteObj.response.headersSent)
                {
                  hasteObj.response.setHeader("Keep-Alive","timeout=5, max=500");
                  hasteObj.response.setHeader("Server","Node Server");
                  hasteObj.response.setHeader("Developed-By","Pounze It-Solution Pvt Limited");
                  hasteObj.response.setHeader('Content-Length',data.length);
                  hasteObj.response.setHeader('Content-Type','text/html; charset=UTF-8');
                }

                if(hasteObj.cookieStatus)
                {
                  hasteObj.response.setHeader("Set-Cookie",hasteObj.cookieStatus);
                }


                if(hasteObj.maintainanceStat != config.server.maintainance)
                {
                  hasteObj.maintainanceStat = config.server.maintainance;
                  hasteObj.response.statusCode = 200;
                }
                else
                {
                  if(typeof(hasteObj.request.headers['if-modified-since']) == 'undefined')
                  {
                    hasteObj.response.setHeader('Last-Modified',modifiedDate);
                    hasteObj.response.statusCode = 200;
                  }
                  else
                  {
                    hasteObj.response.setHeader('Last-Modified',modifiedDate);
                    if(hasteObj.request.headers['if-modified-since'] < modifiedDate)
                    {
                      hasteObj.response.statusCode = 200;
                    }
                    else
                    {
                      hasteObj.response.statusCode = 304;
                    }
                  }
                }
            }
            else
            {
              hasteObj.response.writeHead(code,headers);

            }

            if(compression != null)
            {
              var zlib = require('zlib');
              zlib.gzip(data, function (_, result)
              { 
                hasteObj.response.write(result);
                hasteObj.response.end();                 
              });
            }
            else
            {
              hasteObj.response.end(data);
            }

        });



        readerStream.on('error',function()

        {

          if(!hasteObj.response.headersSent)
          {
            hasteObj.response.writeHead(404,{
              'Keep-Alive':' timeout=5, max=500',
              'Server': 'Node Server',
              'Developed-By':'Pounze It-Solution Pvt Limited',
              'Cache-Control':'public,max-age=31536000',
              'Pragma': 'public,max-age=31536000'
           });
          }
         

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
        if(!hasteObj.response.headersSent)
        {
          hasteObj.response.writeHead(500,{
            'Keep-Alive':' timeout=5, max=500',
            'Server': 'Node Server',
            'Developed-By':"Pounze It-Solution Pvt Limited",
            'Cache-Control':'public,max-age=31536000',
            'Pragma': 'public,max-age=31536000'
          });
        }
        



        var readerStream = fs.createReadStream('./error_files/'+config.errorPages.InternalServerError);

        readerStream.pipe(res);

      console.error(e);

    }

  }

  else

  {

    console.error('Render variable must be an object');

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



function Hash(method,string,encoding)

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

};


let session = {
  currentSession:'',
  set:function(key,value)
  {
    // if cookie is not undefined

    if(typeof(hasteObj.request.headers.cookie) != 'undefined')
    {
      // getting the number of session cookie

      var sessionCookie = hasteObj.request.headers.cookie;
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
        hasteObj.response.setHeader('Set-Cookie','HASTESSID='+session.currentSession);
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

      hasteObj.response.setHeader('Set-Cookie','HASTESSID='+session.currentSession);
    }
  },
  get:function(key)
  {
    // getting the cookie headers
    var sessionValue = hasteObj.request.headers.cookie;

    // if the cookie header is not empty

    if(sessionValue != '')
    {
      // if cookie is not undefined

      if(typeof(hasteObj.request.headers.cookie) != 'undefined')
      {
        // getting the length of the cookie

        var sessionCookie = hasteObj.request.headers.cookie;
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
    var sessionValue = hasteObj.request.headers.cookie;
    if(sessionValue != '')
    {
      // if cookie is found
      if(typeof(hasteObj.request.headers.cookie) != 'undefined')
      {
        var sessionCookie = hasteObj.request.headers.cookie;
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
    var sessionValue = hasteObj.request.headers.cookie;
    if(sessionValue != '')
    {
      // if cookie is found
      if(typeof(hasteObj.request.headers.cookie) != 'undefined')
      {
        var sessionCookie = hasteObj.request.headers.cookie;
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
              hasteObj.response.setHeader('Set-Cookie','HASTESSID=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
              
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
          hasteObj.response.setHeader('Set-Cookie','HASTESSID=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
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
        hasteObj.response.setHeader('Set-Cookie','HASTESSID=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
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
    hasteObj.response.setHeader('content-encoding','gzip');

    zlib.gzip(data, function (_, result)
    { 
      hasteObj.response.end(result);              
    });
  },
  deflate:function(data)
  {
    var zlib = require('zlib');
    hasteObj.response.setHeader('content-encoding','deflate');
    zlib.deflate(data, function (_, result)
    { 
      hasteObj.response.end(result);                 
    });
  },
  DeflateRaw:function(data)
  {
    var zlib = require('zlib');
    hasteObj.response.setHeader('content-encoding','deflate');
    zlib.deflateRaw(data, function (_, result)
    { 
      hasteObj.response.end(result);                 
    });
  }
}; 


// methods and objects exported

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

exports.session = session;

exports.compress = compress;

//=====================================================================================================================================

// the end | Contact and join Pounze Developer Community
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
    this.uri = [];
    this.argument = [];
    this.getArgument = [];
    this.postArgument = [];
    this.request_type = [];
    this.count = 0;
    this.input = {};
    this.staticPath = [];
    this.middleware;
    this.regexExp = [];
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
	    console.log('Please enter Ip address and port');
	    process.exit(0);
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
	    console.log('Please enter Ip address and port');
	    process.exit(0);
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
			process.exit(0);
		}
	},
	handleRequest:async function(req,res)
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
			console.log('Heap used '+heapUsuage['heapUsed'] +' | Heap total size: '+heapUsuage['heapTotal']);
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
			console.log('Error in server');
			process.exit(0);
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
			Checking for routes created
		*/

	  if(hasteObj.uri.length == 0)
	  {
	    console.log('Please create a route');
	    return false;
	  }

	  /*
		setting variables and objectes
	  */

	  let requestMethod = req.method;
  	  let requestUri = url_module.parse(req.url).pathname;
  	  let ext = (/[.]/.exec(requestUri)) ? /[^.]+$/.exec(requestUri) : undefined;
  	  let uriListLen = hasteObj.uri.length;
  	  let url = null;
  	  let myExp = null;
  	  let Pagecount = 0;
  	  let key = {};
  	  let requestUriSplit = null;
	  let UriSplit = null;
	  let requestUriSplitLen = null;
	  let UriSplitLen = null;
	  let urlMatchRegex = null;

	  /*
		checking for file extension if existed
	  */

  	  if(ext == undefined)
  	  {

  	  	/*
			if there is no extension then it is path
  	  	*/


  	  	// getting thr regular expression length set in where method

  	  	let regexLen = hasteObj.regexExp.length;


  	  	/// checking if the regex length is greater than 0

  	  	if(regexLen > 0)
	    {

	    	/*
				iterating with the regex match
	    	*/

	      for(let i=0;i<regexLen;i++)
	      {
	        /*
	          replacing the url with the regex
	        */

	        if(hasteObj.regexExp[i] != null)
	        {
	          for(let value in hasteObj.regexExp[i])
	          {
	            /*
	              mathching the url and replacing the value
	            */
	            if(hasteObj.regexExp[i].hasOwnProperty(value))
	            {
	              hasteObj.uri[i] = hasteObj.uri[i].replace(value,hasteObj.regexExp[i][value]);  
	            }

	            /*
	              setting the key and value;
	            */
	            key[hasteObj.regexExp[i][value]] = value;
	          }
	        }
	      }
	    }

	    /*
			end of the regex section
	    */


	    /*
			iterating with the url collection array
	    */


  	  	for(let i=0; i<uriListLen; i++)
    	{

    		/*
				replacing the uri with the back slash
    		*/

    		url = hasteObj.uri[i].replace('/',"\\/");
	        url = '^'+url+'$';
	        myExp = new RegExp(url);

	        /*
				creating a regular expression of the urls
	        */

	        if(requestUri.match(myExp) && hasteObj.request_type[i] == requestMethod)
	        {

	        	/*
					If the url match with regular expression then it matched with the route set else 404 page is thrown
	        	*/

	        	if(regexLen > 0)
		        {

		        	/*
						regex length is greater than 0 then getting the regex variables set in the url

						eg: www.pounze.com/5

						and regex key  is $id and value is [0-9]{2}

						then input data will be $id = 5
		        	*/

		          requestUriSplit = requestUri.split('/');
		          UriSplit = hasteObj.uri[i].split('/');
		          requestUriSplitLen = requestUriSplit.length;
		          UriSplitLen = UriSplit.length;

		          /*
						if matched then input object is updated with the regex key and value
		          */
		          
		          if(requestUriSplitLen == UriSplitLen)
		          {
		            for(var k=0;k<requestUriSplitLen;k++)
		            {
		              if(UriSplit[k] != '')
		              {
		                urlMatchRegex = new RegExp(UriSplit[k]);
		                if(requestUriSplit[k].match(urlMatchRegex) && typeof(key[UriSplit[k]]) != 'undefined')
		                {
		                  hasteObj.input[key[UriSplit[k]]] = requestUriSplit[k];
		                }
		              }
		            }
		          }
		          else
		          {
		            console.log('regular expression and $id expression length must be same');
		          }
		        }

		        /*
					end of regex section
		        */

		        delete key;

		        // deleting the key

		        // checking for request method type

		        //whether get or post request

	        	switch(requestMethod)
		        {
		          case "GET":
		          hasteObj.input['requestData'] = await haste.fn.parseGet(req);
		          break;
		          case "POST":
		          hasteObj.input['requestData'] = await haste.fn.parsePost(req);
		          break;
		          default:
		          console.log('Invalid Request');
		        }

		        // getting the values of parse reqeust of post and get request

		        // checking for middleware set for the routes

		        if(hasteObj.middleware[i] != null)
				{

					// if it not set to null

				  if(Array.isArray(hasteObj.middleware[i]))
				  {

				  	// checking if the middle ware is array of any other format

				    var middlewareLen = hasteObj.middleware[i].length;

				    // getting the lenth of the middleware

				    for(var j=0;j<middlewareLen;j++)
				    {

				    	// iterating thoough the middleware

				      try
				      {

				      	// checking if the middleware file exists or not

				        var middlewarestat = fs.statSync('./middlewares/'+hasteObj.middleware[i][j]+'.js');

				        // if the middleware is a file

				        if(middlewarestat.isFile())
				        {

				        	// then invoke the middleware main method

				          var middlewareFile = require('../middlewares/'+hasteObj.middleware[i][j]+'.js');
				          var middlewareCallbacks = middlewareFile.main(req,res,hasteObj.input);
				          if(!middlewareCallbacks[0])
				          {
				          	// if middleware callback is false then request is stopped here

				            console.log(middlewareCallbacks[1]);
				            process.exit(0);
				          }
				          else
				          {
				            hasteObj.input[hasteObj.middleware[i][j]] = middlewareCallbacks[1];
				          }
				        }
				        else
				        {
				          console.log('Middlware must be a javascript file');
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
				        console.log(e);
				      }
				    }
				  }
				  else if(typeof(hasteObj.middleware[i]) == 'string')
				  {

				  	// if middlware is string then its a single middlware then checking if its file

				  	// then invoking the middleware main method

				    var middlewarestat = fs.statSync('./middlewares/'+hasteObj.middleware[i]+'.js');
				    if(middlewarestat.isFile())
				    {
				      var middlewareFile = require('../middlewares/'+hasteObj.middleware[i]+'.js');
				      var middlewareCallbacks = middlewareFile.main(req,res,hasteObj.input);
				      if(!middlewareCallbacks[0])
				      {
				        console.log(middlewareCallbacks[1]);
				        process.exit(0);
				      }
				      else
				      {
				        hasteObj.input[hasteObj.middleware[i]] = middlewareCallbacks[1];
				      }
				    }
				    else
				    {
				      console.log('Middlware must be a javascript file');
				    }
				  }
				  else
				  {
				    console.log('Middlware parameter must me array or string');
				  }
				}

				// if the argument is not array and its function then invoking the method directly else 

				// checks for controller exists if its exists then invoke controller main method

		        if(typeof(hasteObj.argument[i]) == 'function')
		        {
		          hasteObj.argument[i](req,res,hasteObj.input);
		        }
		        else if(typeof(hasteObj.argument[i]) == 'string')
		        {
		        	try
			        {
			           var stat = fs.statSync('./controllers/'+hasteObj.argument[i]+'.js');
			            
			            if(stat.isFile())
			            {
			              var controller = require('../controllers/'+hasteObj.argument[i]+'.js');
			              controller.main(req,res,hasteObj.input);
			            }
			            else
			            {
			              console.log('Controller must me a javascript file'); 
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
			            console.log(e);
			        }
		        }
		        else
		        {
		          console.log('Route\'s second argument must me function of string ' + typeof(hasteObj.argument[i]) + ' given');
		        }
	        }
	        else
	        {
	        	Pagecount += 1;
	        }	
    	}
    	if(Pagecount == uriListLen)
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
	      }
	      else
	      {
	        notMatchCount += 1;
	      }
	    }

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
				      console.log('View template page name must be a javascript file');
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

				    console.log(e);
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

		    console.log(e);
		  }
	},
	AllowDirectories:function(path)
	{
		// allow folders to get accessed

		hasteObj.staticPath = path;
	},
	parseGet:async function(req)
	{
		// parse get request

		return new Promise((solve,reject)=>{
		   var url_parsed = url_module.parse(req.url,true);
		   solve(url_parsed['query']);
		});
	},
	parsePost:async function(req)
	{

		// parse post request 

		return new Promise((solve,reject)=>{
		    if((req.method == 'POST' &&  req.headers['content-type'].match(/(multipart\/form\-data\;)/g)))
		    {
		      solve({msg:'Please parse the multipart form data using multiparty or some other libraries'});
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
		          solve(JSON.parse(body));
		        }
		        else
		        {
		          solve(qs.parse(body));
		        }
		      });
		    }
		});
	},
	get:function(uri,argument)
	{
		// get method for get routers

		hasteObj.request_type.push("GET");
		hasteObj.count += 1;
		hasteObj.uri.push(uri);
		hasteObj.argument.push(argument);
		return this;
	},
	post:function(uri,argument)
	{

		// post method for post routers

		hasteObj.request_type.push("POST");
		hasteObj.count += 1;
		hasteObj.uri.push(uri);
		hasteObj.argument.push(argument);
		return this;
	},
	request:function(uri,argument)
	{

		// for all kinds of http requests

		hasteObj.request_type.push("BOTH");
		hasteObj.count += 1;
		hasteObj.uri.push(uri);
		hasteObj.argument.push(argument);
		return this;
	},
	middlewares:function(middleware)
	{	
		// adding middle wares

		hasteObj.middleware = middleware;
		return this;
	},
	where:function(regex)
	{

		// method for regular expression match

		if(typeof(regex) != 'object')
		{
			console.log('argument in where method must be object {}');
			return false;
		}
		hasteObj.regexExp.push(regex);
		return this;
	},
	close:function()
	{
		// closing the haste object

		exports.__init__ = null;
		delete hasteObj;
		delete Library;
		delete haste;
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
					console.log('controller does not exists');
					throw err;
				}

				var controller = require('../controllers/'+input["cortex"]+'.js');
				var callbackData = controller.main(null,null,input);
				callback(callbackData);
			});
		}	
		else
		{
			console.log('cortex field must be string');
			callback(false);
		}

		return this;
	}
};

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
		console.log(e);
		process.exit(0);
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
		console.log(e);
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
		console.log(e);
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
            console.log('find and replace array length must be same');
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
        console.log('View template page name must be a javascript file');
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
      console.log(e);
    }
  }
  else
  {
    console.log('find and replace must be array');
  }
}

// method to copy file from temp folder use for file uploading

async function fileCopy(path,pathDir)
{
	return new Promise((solve,reject)=>{
	    fs.readFile(path,function(error, data){
	      fs.writeFile(pathDir,data,function(error){
	        if(error)
	        {
	          throw error;
	          solve(false);
	        }
	        solve(true);
	      });
	    });
	    solve(true);
	  });
}

// filereader to read  files in buffers

async function fileReader(path)
{
	return new Promise((solve,reject)=>{
	    var data = '';
	    readerStream = fs.createReadStream(path);

	    readerStream.on('data',function(chunk)
	    {
	      data += chunk;
	    });

	    readerStream.on('end',function()
	    {
	      solve(data);
	    });

	    readerStream.on('error',function()
	    {
	      solve('Failed to get content');
	    });
	  });
}

// formatting dates


async function formatDate(date)
{
	return new Promise((solve,reject)=>{
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

	    solve([year, month, day].join('-')+' '+hour+':'+min+':'+sec);
	  });
}

// hash method to encypt data

async function Hash(method,string,encoding)
{
	return new Promise((solve,reject)=>{
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
    solve(hash);
  });
}

// method to make http client request to other server

async function RemoteRequest(params)
{
	return new Promise((solve,reject)=>{
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
	          solve(data);
	           // console.log('No more data in response.');
	        });
	      });

	      req.on('error',function(e)
	      {
	        console.log(`problem with request: ${e.message}`);
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
	          solve(data);
	           // console.log('No more data in response.');
	        });
	      });

	      req.on('error',function(e)
	      {
	        console.log(`problem with request: ${e.message}`);
	      });

	      // write data to request body

	      req.write(JSON.stringify(postData));
	      req.end();

	    }
	 });
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
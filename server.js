const haste = require('./cns/Haste.js');

var app = haste.__init__();

app.HttpServer('127.0.0.1',8100,function(server)
{
	haste.writeLogs('./file.log','Hello Sudeep',function(callback)
	{
		console.log(callback);
	});

	var io = require('socket.io').listen(server);
	io.on('connection', function(socket)
	{
		socket.on('message', function(data)
		{
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

app.AllowDirectories(['UserView/']);

app.get('/$id/student/$name',function(req,res,input)
{
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
			console.log(haste.getUserAgent(req));
			let object = {
				name:'Sudeep',
				Expires:'Thu, 31 Aug 2017 00:00:00 GMT',
				HttpOnly:true,
				Path:'/'
			};

			console.log(haste.setCookies(object,res));

			let parameters = {
				query:"SELECT * FROM hotels WHERE hotel_id = ?",
				match:[2]
			};

			haste.mySQL.query(parameters,function(err,data)
			{
				console.log(JSON.stringify(data));
				app.views('test',req,res,'I am awesome');
			});
		}
		else
		{
			res.end('Username and password is incorrect');
		}
	}

}).middlewares(['TestMiddlware']).where({'$name':'[a-z]+','$id':'[0-9]{2}'});

app.post('/done',function(req,res,input)
{
	console.log(input);
});

app.get('/',function(req,res,input)
{
	res.end('I am the best');
});

app.get('/testinterna','InternalServerTest');

app.close();
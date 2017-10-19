/*
	@author Sudeep Dasgupta

	server and whole framework configuration file
*/

module.exports = {
	mySQL:{
		host:'localhost',
		username:'root',
		password:'',
		db:'tripkle'
	},
	mongoDB:{

	},
	redis:{
		
	},
	server:{
		maintainance:false,
		setTimeout:12000,
		showHeapUsuage:false,
		maxListeners:0,
		socketTimeout:0,
		cpuCores:'',
		sessionTimeout:5
	},
	log:{
		path:'',
	},
	errorPages:{
		PageNotFound:"404.html",
		InternalServerError:"500.html",
		NotAuthorized:"401.html",
		DirectoryAccess:"403.html",
		MaintainancePage:"maintainance.html"
	}	
};
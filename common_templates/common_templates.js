const fs = require('fs');
const session = require('../cns/Haste.js').session;

function main(req,res,input)
{
	var header = fs.readFileSync('./views/commonPages/header.html').toString();
	var name = session.get('fullName');
	var	designation = session.get('designation');

	var find = ['[@header]','[@name]','[@designation]'];
	var replace = [header,name,designation];

	return {
		find:find,
		replace:replace
	};
}

exports.main = main;
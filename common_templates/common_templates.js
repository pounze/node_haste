const fs = require('fs');
const session = require('../cns/Haste.js').session;

function main(req,res,input)
{
	var header = fs.readFileSync('./views/commonPages/header.html').toString();
	var name = session.get('fullName');
	var	designation = session.get('designation');

	return {
		'[@header]':header,
		'[@name]':name,
		'[@designation]':designation
	};
}

exports.main = main;

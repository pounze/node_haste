const haste = require('../cns/Haste.js');

function main(req,res,data)
{
	var find = ['{name}'];
	var replace = ["George"];
	haste.renderPage(find,replace,req,res,'index');
}

exports.main = main;
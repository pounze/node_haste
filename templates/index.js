const haste = require('../cns/Haste.js');

function main(req,res,data,commongData)
{
	haste.renderPage(commongData,req,res,'index',null,null,null);
}

exports.main = main;
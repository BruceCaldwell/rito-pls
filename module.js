(function() {
	var $ = module.exports = function() {};

	var configDefaults = require(__dirname + '/ritopls.json'),
		eventEmitter = require('events').EventEmitter,
		fs = require('fs');

	var apiDir = __dirname + '/api',
		classDir = __dirname + '/classes',
		utilsDir = __dirname + '/utils';

	/* === File Includes === */

	module.classes = {};
	module.utils = {};

	// Utilities
	var utilFiles = fs.readdirSync(utilsDir);
	utilFiles.forEach(function(f) {
		var utilGroup = require(utilsDir + '/' + f);

		for(var prop in utilGroup)
			if(utilGroup.hasOwnProperty(prop))
				module.utils[prop] = utilGroup[prop];
	});

	// Classes
	var classFiles = fs.readdirSync(classDir);
	classFiles.forEach(function(f) {
		module.classes[f.toLowerCase().replace(/.js$/, '')] = require(classDir + '/' + f);
	});

	// API
	var apiFiles = fs.readdirSync(apiDir);
	apiFiles.forEach(function(f) {
		require(apiDir + '/' + f);
	});
})();
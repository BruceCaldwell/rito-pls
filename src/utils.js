ritoPls = exports;
ritoPlsUtils = {};

(function ($) {
	$.utils = {};
	/*
		Utilities class
		For functions that are needed in many places, to reduce redundancy
	 */
	var chunkSize = require(__dirname + '/config.json').chunkSize;

	$.utils.fixNames = function (users, extra) {
		if (users instanceof Array) {
			users.forEach(function (el, id) {
				users[id] = $.utils.fixNames(el);
			});
		}

		else {
			users = users.toString().trim().replace(/\s+/g, '').toLowerCase();

			if (extra) users = extra(users);
		}

		return users;
	};

	$.utils.chunkArray = function (array) {
		return [].concat.apply([],
			array.map(function (elem, i) {
				return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
			}));
	};

	$.utils.maybeParseJson = function (json, func) {
		try {
			var obj = JSON.parse(json);

			if (func) func(obj);
		}
		catch (err) {
			if (func) func(json);
		}

		if (obj) return obj;

		return json;
	};

	$.utils.removeArrayElement = function (array, index) {
		array.splice(index, 1);

		return array;
	};
})(ritoPlsUtils);
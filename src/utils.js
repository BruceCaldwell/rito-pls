(function () {
	/*
		Utilities class
		For functions that are needed in many places, to reduce redundancy
	 */
	exports.fixNames = function (users, extra) {
		if (users instanceof Array) {
			users.forEach(function (el, id) {
				users[id] = exports.fixNames(el);
			});
		}

		else {
			users = users.toString().trim().replace(/\s+/g, '').toLowerCase();

			if (extra) users = extra(users);
		}

		return users;
	};

	exports.chunkArray = function (array) {
		return [].concat.apply([],
			array.map(function (elem, i) {
				return i % ritoPlsConfig.chunkSize ? [] : [array.slice(i, i + ritoPlsConfig.chunkSize)];
			}));
	};

	exports.maybeParseJson = function (json, func) {
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

	exports.removeArrayElement = function (array, index) {
		array.splice(index, 1);

		return array;
	};
})();
(function () {
	var https = require('https');

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

	/*
		Internal HTTP request function for requests to the Riot API
	 */
	exports.doReqRiot = function (uri, func, reg) {
		var opts = {
			host: reg + '.api.pvp.net',
			port: 443, // HTTPS
			path: '/api/lol' + uri
		};

		// API Key added here, with support for other GET variables before this one.
		if (opts.path.indexOf('?') !== -1) opts.path = opts.path + '&api_key=' + ritoPlsConfig.apiKey;
		else opts.path = opts.path + '?api_key=' + ritoPlsConfig.apiKey;

		var con = https.get(opts,function (res) {
			if (res.statusCode === 200) {
				var data = '';

				res.on('data', function (r) {
					data += r;
				});

				res.on('end', function () {
					func(JSON.parse(data));
				});
			}

			else if (res.statusCode === 404) {
				con.abort();
				func({});
			}

			else {
				con.abort();
				func({
					error: true,
					code: res.statusCode,
					path: opts.path
				});
			}

		}).on('error', function (err) {
				if (!ritoPlsConfig.ignoreFatal)
					throw 'ritopls: Fatal Error: Node.js HTTP Error: ' + err;
			});
	};
})();
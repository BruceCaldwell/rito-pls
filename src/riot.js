(function ($) {
	$.riot = {};
	/*
		HTTP Requests to Riot API Class
		Interfaces to API documented here: `https://developer.riotgames.com/api/methods`
	 */

	var http = require('http'),
		utils = $.utils,
		apiKey = $.config.apiKey,
		ignoreFatal = $.config.ignoreFatal;

	/*
		Internal HTTP request function for requests to the Riot API
	 */
	var doReqRiot = function (uri, func) {
		var opts = {
			host: 'prod.api.pvp.net',
			port: 80, // HTTPS
			path: '/api/lol' + uri
		};

		// API Key added here, with support for other GET variables before this one.
		if (opts.path.indexOf('?') !== -1) opts.path = opts.path + '&api_key=' + apiKey;
		else opts.path = opts.path + '?api_key=' + apiKey;

		var con = http.get(opts,function (res) {
			if (res.statusCode === 200) {
				var data = '';

				res.on('data', function (r) {
					data += r;
				});

				res.on('end', function () {
					func(JSON.parse(data));
				});
			}

			else {
				con.abort();
				func({
					error: true,
					code: res.statusCode
				});
			}

		}).on('error', function (err) {
				if (!ignoreFatal)
					throw 'ritopos: Fatal Error: Node.js HTTP Error: ' + err;
			});
	};

	$.riot.summoner = function (slug, id, reg, func) {
		var uri;

		switch (slug) {
			case 'summary':
			case 'stats':
				uri = '/' + reg + '/v1.3/stats/by-summoner/' + id + '/summary';
				break;
			case 'ranked':
				uri = '/' + reg + '/v1.3/stats/by-summoner/' + id + '/ranked';
				break;
			case 'recent':
			case 'games':
				uri = '/' + reg + '/v1.3/game/by-summoner/' + id + '/recent';
				break;
			case 'leagues':
			case 'elo':
				uri = '/' + reg + '/v2.3/league/by-summoner/' + id + '/entry';
				break;
			case 'teams':
				uri = '/' + reg + '/v2.2/team/by-summoner/' + id;
				break;
		}

		if (uri) doReqRiot(uri, func);
		else func(false);
	};

	/*
		Retrieve Summoner IDs from Riot servers based on username and region
	 */
	$.riot.basicObjsByName = function (users, reg, func) {
		users = utils.fixNames(users, encodeURIComponent);

		var getVar = users.join(),
			baseURI = '/' + reg + '/v1.4/summoner/by-name/';

		doReqRiot(baseURI + getVar, func);
	};

	$.riot.basicObjsById = function (ids, reg, func) {
		var getVar = ids.join(),
			baseURI = '/' + reg + '/v1.4/summoner/';

		doReqRiot(baseURI + getVar, func);
	};

	/*
		Retrieves a Summoner's Runes
	 */
	$.riot.runes = function (ids, reg, func) {
		if (ids instanceof Array)
			ids = ids.join();

		var uri = '/' + reg + '/v1.4/summoner/' + ids + '/runes';

		doReqRiot(uri, func);
	};

	/*
		Retrieves a Summoner's Masteries
	 */
	$.riot.masteries = function (ids, reg, func) {
		if (ids instanceof Array)
			ids = ids.join();

		var uri = '/' + reg + '/v1.4/summoner/' + ids + '/masteries';

		doReqRiot(uri, func);
	};

	/*
		Retrieves stats for a specific team (to perhaps be used in the future for LCS teams)
	 */
	$.riot.teamStats = function (ids, reg, func) {
		if (ids instanceof Array)
			ids = ids.join();

		var uri = '/' + reg + '/v2.2/team/' + ids;

		doReqRiot(uri, func);
	};
})(ritoPlsUtils);
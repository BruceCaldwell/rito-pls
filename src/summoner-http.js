(function () {
	/*
		HTTP Requests to Riot API Class
		Interfaces to API documented here: `https://developer.riotgames.com/api/methods`
	 */

	var utils = require(__dirname + '/utils.js');

	exports.summoner = function (slug, id, reg, func) {
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
				uri = '/' + reg + '/v2.4/league/by-summoner/' + id + '/entry';
				break;
			case 'teams':
				uri = '/' + reg + '/v2.3/team/by-summoner/' + id;
				break;
		}

		if (uri) utils.doReqRiot(uri, func, reg);
		else func(false);
	};

	/*
		Retrieve Summoner IDs from Riot servers based on username and region
	 */
	exports.basicObjsByName = function (users, reg, func) {
		users = utils.fixNames(users, encodeURIComponent);

		var getVar = users.join(),
			baseURI = '/' + reg + '/v1.4/summoner/by-name/';

		utils.doReqRiot(baseURI + getVar, func, reg);
	};

	exports.basicObjsById = function (ids, reg, func) {
		var getVar = ids.join(),
			baseURI = '/' + reg + '/v1.4/summoner/';

		utils.doReqRiot(baseURI + getVar, func, reg);
	};

	/*
		Retrieves a Summoner's Runes
	 */
	exports.runes = function (ids, reg, func) {
		if (ids instanceof Array)
			ids = ids.join();

		var uri = '/' + reg + '/v1.4/summoner/' + ids + '/runes';

		utils.doReqRiot(uri, func, reg);
	};

	/*
		Retrieves a Summoner's Masteries
	 */
	exports.masteries = function (ids, reg, func) {
		if (ids instanceof Array)
			ids = ids.join();

		var uri = '/' + reg + '/v1.4/summoner/' + ids + '/masteries';

		utils.doReqRiot(uri, func, reg);
	};

	/*
		Retrieves stats for a specific team (to perhaps be used in the future for LCS teams)
	 */
	exports.teamStats = function (ids, reg, func) {
		if (ids instanceof Array)
			ids = ids.join();

		var uri = '/' + reg + '/v2.2/team/' + ids;

		utils.doReqRiot(uri, func, reg);
	};
})();
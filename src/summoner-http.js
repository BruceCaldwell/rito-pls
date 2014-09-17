(function () {
	/*
		HTTP Requests to Riot API Class
		Interfaces to API documented here: `https://developer.riotgames.com/api/methods`
	 */

	var utils = require(__dirname + '/utils.js');

	var versions = {
		'champion': 'v1.2',
		'game': 'v1.3',
		'league': 'v2.5',
		'status': 'v1.0',
		'match': 'v2.2',
		'matchhistory': 'v2.2',
		'stats': 'v1.3',
		'summoner': 'v1.4',
		'team': 'v2.4'
	};

	exports.summoner = function (slug, id, reg, func) {
		var uri;

		switch (slug) {
			case 'summary':
			case 'stats':
				uri = '/' + reg + '/' + versions.stats + '/stats/by-summoner/' + id + '/summary';
				break;
			case 'ranked':
				uri = '/' + reg + '/' + versions.stats + '/stats/by-summoner/' + id + '/ranked';
				break;
			case 'recent':
			case 'games':
				uri = '/' + reg + '/' + versions.game + '/game/by-summoner/' + id + '/recent';
				break;
			case 'leagues':
			case 'elo':
				uri = '/' + reg + '/' + versions.league + '/league/by-summoner/' + id + '/entry';
				break;
			case 'teams':
				uri = '/' + reg + '/' + versions.team + '/team/by-summoner/' + id;
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
			baseURI = '/' + reg + '/' + versions.summoner + '/summoner/by-name/';

		utils.doReqRiot(baseURI + getVar, func, reg);
	};

	exports.basicObjsById = function (ids, reg, func) {
		var getVar = ids.join(),
			baseURI = '/' + reg + '/' + versions.summoner + '/summoner/';

		utils.doReqRiot(baseURI + getVar, func, reg);
	};

	/*
		Retrieves a Summoner's Runes
	 */
	exports.runes = function (ids, reg, func) {
		if (ids instanceof Array)
			ids = ids.join();

		var uri = '/' + reg + '/' + versions.summoner + '/summoner/' + ids + '/runes';

		utils.doReqRiot(uri, func, reg);
	};

	/*
		Retrieves a Summoner's Masteries
	 */
	exports.masteries = function (ids, reg, func) {
		if (ids instanceof Array)
			ids = ids.join();

		var uri = '/' + reg + '/' + versions.summoner + '/summoner/' + ids + '/masteries';

		utils.doReqRiot(uri, func, reg);
	};

	/*
		Retrieves stats for a specific team (to perhaps be used in the future for LCS teams)
	 */
	exports.teamStats = function (ids, reg, func) {
		if (ids instanceof Array)
			ids = ids.join();

		var uri = '/' + reg + '/' + versions.team + '/team/' + ids;

		utils.doReqRiot(uri, func, reg);
	};
})();
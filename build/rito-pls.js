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
(function ($) {
	$.sql = {};
	/*
		MySQL Class
		Grabs data like IDs & Basic Summoner Info, and Runes & Masteries
	 */
	var mysql = require('mysql'), // TODO `npm install mysql` on server this ends up on
		utils = $.utils,
		sql = require(__dirname + '/config.json').sql;

	var con = mysql.createConnection(sql);

	con.connect(function (err) {
		if (err) throw 'Error: Could not connect to SQL database!';

		var doQuery = function (query, func) {
			con.query(query, function (err, res) {
				if (err) func(false);
				else if (!res[0] || !res[0].value)
					func(false);
				else
					utils.maybeParseJson(res[0].value, func);
			});
		};

		(function setup() {
			var sql = "CREATE TABLE IF NOT EXISTS `user_cache_meta` ("
				+ "`riot_id` varchar(100) COLLATE utf8_unicode_ci NOT NULL,"
				+ "`region` varchar(5) COLLATE utf8_unicode_ci NOT NULL,"
				+ "`data_name` varchar(20) COLLATE utf8_unicode_ci NOT NULL,"
				+ "`value` longtext COLLATE utf8_unicode_ci NOT NULL,"
				+ "UNIQUE KEY `riot_id_UNIQUE` (`riot_id`,`region`,`data_name`)"
				+ ") ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;";

			doQuery(sql, function () {

			});
		})();

		/*
			GET
		*/
		$.sql.get = function (slug, id, reg, func) {
			var sql, inserts;

			switch (slug) {
				case 'recent':
					slug = 'games';
					sql = 'SELECT ?? FROM ?? WHERE ??=? AND ??=? AND ??=?';
					inserts = ['value', 'user_cache_meta', 'riot_id', id, 'region', reg, 'data_name', slug];
					break;
				case 'stats':
					slug = 'summary';
					sql = 'SELECT ?? FROM ?? WHERE ??=? AND ??=? AND ??=?';
					inserts = ['value', 'user_cache_meta', 'riot_id', id, 'region', reg, 'data_name', slug];
					break;
				case 'runes':
				case 'masteries':
				case 'leagues':
				case 'ranked':
				case 'summary':
				case 'games':
				case 'teams':
					sql = 'SELECT ?? FROM ?? WHERE ??=? AND ??=? AND ??=?';
					inserts = ['value', 'user_cache_meta', 'riot_id', id, 'region', reg, 'data_name', slug];
					break;
				default:
					func(false);
					return;
					break;
			}

			if (sql && inserts) doQuery(mysql.format(sql, inserts), func);
			else func(false);
		};

		/*
			REMOVE
		 */

		$.sql.removeSummonerInfo = function (id, reg) {
			var sql = 'DELETE FROM ?? WHERE ??=? AND ??=?',
				insert = ['user_cache_meta', 'riot_id', id, 'region', reg];

			sql = mysql.format(sql, insert);

			doQuery(sql, function (r) {
			});
		};

		/*
			INSERT
		 */

		$.sql.add = exports.insert = function (slug, id, reg, data) {
			var sql, inserts;
			switch (slug) {
				case 'recent':
					slug = 'games';
					sql = 'INSERT INTO ?? (??, ??, ??, ??) VALUES (?, ?, ?, ?)';
					inserts = ['user_cache_meta', 'riot_id', 'region', 'data_name', 'value', id, reg, slug, JSON.stringify(data)];
					break;
				case 'stats':
					slug = 'summary';
					sql = 'INSERT INTO ?? (??, ??, ??, ??) VALUES (?, ?, ?, ?)';
					inserts = ['user_cache_meta', 'riot_id', 'region', 'data_name', 'value', id, reg, slug, JSON.stringify(data)];
					break;
				case 'runes':
				case 'masteries':
				case 'leagues':
				case 'ranked':
				case 'summary':
				case 'games':
				case 'teams':
					sql = 'INSERT INTO ?? (??, ??, ??, ??) VALUES (?, ?, ?, ?)';
					inserts = ['user_cache_meta', 'riot_id', 'region', 'data_name', 'value', id, reg, slug, JSON.stringify(data)];
					break;
			}
		};
	});
})(ritoPlsUtils);
(function ($) {
	$.riot = {};
	/*
		HTTP Requests to Riot API Class
		Interfaces to API documented here: `https://developer.riotgames.com/api/methods`
	 */

	var http = require('http'),
		utils = $.utils,
		apiKey = require(__dirname + '/config.json').apiKey,
		ignoreFatal = require(__dirname + '/config.json').ignoreFatal;

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
					throw 'Node.js HTTP Error: ' + err;
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
(function ($) {
	$.cache = {};
	/*
		Caching of Summer IDs and other details
		Interfaces to direct memory (through the userIdCache Object and MySQL) and automatically handles flushing cache when required
	 */
	var utils = $.utils,
		removeSummonerInfo = $.sql.removeSummonerInfo,
		config = require(__dirname + '/config.json').caching,
		userBasicCache = {
			na: {},
			br: {},
			euw: {},
			eune: {},
			lan: {},
			las: {},
			oce: {}
		};

	/*
		Adds an ID to the userIdCache object
	 */
	$.cache.add = function (usr, reg, obj) {
		obj.timeAdded = new Date().getTime();
		obj.timeChecked = new Date().getTime();
		obj.region = reg;
		userBasicCache[reg][utils.fixNames(usr)] = obj;
	};

	/*
		Returns an ID for a cached User, if it exists.
	 */
	$.cache.getUserBasic = function (usr, reg) {
		usr = utils.fixNames(usr);

		if (userBasicCache[reg].hasOwnProperty(usr)) {
			return userBasicCache[reg][usr];
		}

		return false;
	};

	$.cache.getOldUsers = function () {
		var oldUserEntries = [];

		for (var region in userBasicCache) {
			if (userBasicCache.hasOwnProperty(region)) {
				for (var username in userBasicCache[region]) {
					if (userBasicCache[region].hasOwnProperty(username)) {
						var user = userBasicCache[region][username];

						if (new Date().getTime() - user.timeChecked > config.allowedTimeSQL) { // 15 mins
							oldUserEntries.push(user);
						}
					}
				}
			}
		}

		return oldUserEntries;
	};

	$.cache.bringUserDateUp = function (user, reg) {
		user = utils.fixNames(user);

		if (userBasicCache[reg].hasOwnProperty(user)) userBasicCache[reg][user].timeChecked = new Date().getTime();
	};

	// Flushing cache of old entries in userIdCache
	setInterval(function () {
		var time = new Date().getTime();

		for (var region in userBasicCache) {
			if (userBasicCache.hasOwnProperty(region)) {
				for (var user in userBasicCache[region]) {
					if (userBasicCache[region].hasOwnProperty(user)) {
						var o = userBasicCache[region][user];

						if (time - o.timeAdded > config.allowedTimeBasic) { // If it's older than 12 hours
							removeSummonerInfo(userBasicCache[region][user].id, userBasicCache[region][user].region);
							delete userBasicCache[region][user];
						}
					}
				}
			}
		}
	}, config.checkTimeBasic); // Every Hour
})(ritoPlsUtils);
(function ($) {
	$.get = {};
	/*
		Data API
		The file where all of the bullshit that goes along with getting Summoner Data comes in
	 */
	var getRiot = $.riot,
		cache = $.cache,
		utils = $.utils,
		sql = $.sql,
		config = require(__dirname + '/config.json');

	/*
		Initializing variables
	 */

	// This is so that we're not constantly making new objects that take up huge amounts of space
	jsonObj = '{"na":{"ids":[],"name":"na"},"br":{"ids":[],"name":"br"},"euw":{"ids":[],"name":"na"},"eune":{"ids":[],"name":"na"},"lan":{"ids":[],"name":"lan"},"las":{"ids":[],"name":"las"},"oce":{"ids":[],"name":"oce"},"kr":{"ids":[],"name":"kr"},"ru":{"ids":[],"name":"ru"},"tr":{"ids":[],"name":"tr"}}';

	var requestedIds = JSON.parse(jsonObj),
		requestedRunes = JSON.parse(jsonObj),
		requestedMasteries = JSON.parse(jsonObj),
		requestedTeams = JSON.parse(jsonObj);

	/*
		Module functions (to be called outside of this file)
	 */
	$.get.basicByName = function (name, reg, func) {
		var basic;
		if ((basic = cache.getUserBasic((name = utils.fixNames(name)), reg))) func(basic);
		else requestedIds[reg].ids.push({name: name, func: func});
	};

	$.get.runes = function (id, reg, func) {
		sql.get('runes', id, reg, function (r) {
			if (!r) requestedRunes[reg].ids.push({id: id, func: func});
			else func(r);
		});
	};

	$.get.masteries = function (id, reg, func) {
		sql.get('masteries', id, reg, function (r) {
			if (!r) requestedMasteries[reg].ids.push({id: id, func: func});
			else func(r);
		});
	};

	$.get.teams = function (id, reg, func) {
		sql.get('teams', id, reg, function (r) {
			if (!r) requestedTeams[reg].ids.push({id: id, func: func});
			else func(r);
		});
	};

	$.get.ranked = function (id, reg, func) {
		retrieve('ranked', id, reg, func);
	};

	$.get.summary = function (id, reg, func) {
		retrieve('summary', id, reg, func);
	};

	$.get.games = function (id, reg, func) {
		retrieve('games', id, reg, func);
	};

	$.get.leagues = function (id, reg, func) {
		retrieve('leagues', id, reg, func);
	};

	var retrieve = function (slug, id, reg, func) {
		sql.get(slug, id, reg, function (r) {
			if (!r) {
				getRiot.summoner(slug, id, reg, function (r) {
					if (r) sql.add(slug, id, reg, r);
					func(r);
				});
			}
			else func(r);
		})
	};

	/*
		CRON-style API requests
	 */
	var getInfo = function (reg, type) {
		var chunkedArray = utils.chunkArray(reg.ids);

		chunkedArray.forEach(function (arr) {
			var list = [];

			arr.forEach(function (i) {
				if (type === 'ids')
					list.push(encodeURIComponent(i.name));
				else
					list.push(encodeURIComponent(i.id));
			});

			switch (type) {
				case 'ids':
					getRiot.basicObjsByName(list, reg.name, function (obj) {
						if (!obj) obj = {};

						arr.forEach(function (i) {
							if (obj.hasOwnProperty(i.name)) {
								cache.add(i.name, reg.name, obj[i.name]);
								i.func(obj[i.name]);
							}
							else
								i.func(false);
						});
					});
					break;

				case 'runes':
					getRiot.runes(list, reg.name, function (obj) {
						if (!obj) obj = {};

						arr.forEach(function (i) {
							if (obj.hasOwnProperty(i.id)) {
								sql.add('runes', i.id, reg.name, obj[i.id]);
								i.func(obj[i.id]);
							}
							else
								i.func(false);
						});
					});
					break;

				case 'masteries':
					getRiot.masteries(list, reg.name, function (obj) {
						if (!obj) obj = {};

						arr.forEach(function (i) {
							if (obj.hasOwnProperty(i.id)) {
								sql.add('masteries', i.id, reg.name, obj[i.id]);
								i.func(obj[i.id]);
							}
							else
								i.func(false);
						});
					});
					break;

				case 'teams':
					getRiot.teamStats(list, reg.name, function (obj) {
						if (!obj) obj = {};

						arr.forEach(function (i) {
							if (obj.hasOwnProperty(i.id)) {
								sql.add('teams', i.id, reg.name, obj[i.id]);
								i.func(obj[i.id]);
							}
							else
								i.func(false);
						});
					});
					break;
			}
		});
	};

	setInterval(function () {
		var regions = ['na', 'br', 'euw', 'eune', 'lan', 'las', 'oce', 'kr', 'ru', 'tr'];

		regions.forEach(function (r) {
			if (requestedIds[r].ids.length > 0)
				getInfo(requestedIds[r], 'ids');

			if (requestedRunes[r].ids.length > 0)
				getInfo(requestedRunes[r], 'runes');

			if (requestedMasteries[r].ids.length > 0)
				getInfo(requestedMasteries[r], 'masteries');

			if (requestedTeams[r].ids.length > 0)
				getInfo(requestedMasteries[r], 'teams');
		});

		requestedIds = JSON.parse(jsonObj);
		requestedRunes = JSON.parse(jsonObj);
		requestedMasteries = JSON.parse(jsonObj);
		requestedTeams = JSON.parse(jsonObj);

	}, config.chunkTiming); // Every 1 second

	/*
		Cache flushing when entries are old
	 */
	setInterval(function () {
		var oldUsers = cache.getOldUsers();

		oldUsers.forEach(function (u) {
			cache.bringUserDateUp(u.name, u.region);
			sql.removeSummonerInfo(u.id, u.region);
		});
	}, config.caching.checkTimeSQL); // Every 1 min
})(ritoPlsUtils);
(function ($) {
	var utils = $.utils,
		get = $.get,
		util = require('util'),
		EventEmitter = require('events').EventEmitter;

	var eventEmitter = exports.Emitter = new EventEmitter;
	eventEmitter.setMaxListeners(0); // This could possibly go well over the suggested maximum. Put at infinite after testing to make sure stray listeners are removed.

	ritoPls.getFullSummonerByName = function (name, reg) {
		name = utils.fixNames(name);

		var interactions = new EventEmitter;

		var emitReady = function (r) {
			interactions.emit('ready', r);
			removeListeners();
		};

		var emitError = function (err) {
			interactions.emit('error', err);
			removeListeners();
		};

		var removeListeners = function () {
			eventEmitter.removeListener(name + '-ready', emitReady);
			eventEmitter.removeListener(name + '-error', emitError);
			interactions.removeAllListeners(); // So we don't have stray listeners here too
		};

		eventEmitter.on(name + '-ready', emitReady);
		eventEmitter.on(name + '-error', emitError);

		Summoner(name, reg);

		return interactions;
	};

	ritoPls.getBasicInfoByName = function (name, reg) {

	};

	var Summoner = function (name, reg) {
		var errors = {
			id: {id: 0, desc: 'Failed to retrieve summoner basic info object.'},
			runes: {id: 1, desc: 'Failed to retrieve summoner runes.'},
			masteries: {id: 2, desc: 'Failed to retrieve summoner masteries.'},
			ranked: {id: 3, desc: 'Failed to retrieve summoner ranked stats.'},
			summary: {id: 4, desc: 'Failed to retrieve summoner stats summary.'},
			games: {id: 5, desc: 'Failed to retrieve summoner recent games.'},
			leagues: {id: 6, desc: 'Failed to retrieve summoner league info.'}
		};

		name = utils.fixNames(name);

		get.basicByName(name, reg, function (obj) {
			if (!obj || !obj.name) eventEmitter.emit(name + '-error', errors.id);

			var user = JSON.parse(JSON.stringify(obj));
			// We need to wait for all of the additional details for the User before returning
			var waitingOn = ['runes', 'masteries', 'ranked', 'summary', 'games', 'leagues'];

			var doneWith = function (i) {
				var theIndex = waitingOn.indexOf(i);

				if (theIndex !== -1) waitingOn = utils.removeArrayElement(waitingOn, theIndex);

				if (waitingOn.length === 0)
					eventEmitter.emit(name + '-ready', user);
			};

			get.runes(user.id, reg, function (r) {
				if (!r || r.error) eventEmitter.emit(name + '-error', errors.runes);
				else {
					user.runes = r;
					doneWith('runes');
				}
			});

			get.masteries(user.id, reg, function (r) {
				if (!r || r.error) eventEmitter.emit(name + '-error', errors.masteries);
				else {
					user.masteries = r;
					doneWith('masteries');
				}
			});

			get.ranked(user.id, reg, function (r) {
				if (!r || r.error) eventEmitter.emit(name + '-error', errors.ranked);
				else {
					user.ranked = r;
					doneWith('ranked');
				}
			});

			get.summary(user.id, reg, function (r) {
				if (!r || r.error) eventEmitter.emit(name + '-error', errors.summary);
				else {
					user.summary = r;
					doneWith('summary');
				}
			});

			get.games(user.id, reg, function (r) {
				if (!r || r.error) eventEmitter.emit(name + '-error', errors.games);
				else {
					user.games = r.games;
					doneWith('games');
				}
			});

			get.leagues(user.id, reg, function (r) {
				if (!r || r.error) eventEmitter.emit(name + '-error', errors.leagues);
				else {
					user.leagues = r;
					doneWith('leagues');
				}
			});

		});
	};
})(ritoPlsUtils);
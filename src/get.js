(function () {
	/*
		Data API
		The file where all of the bullshit that goes along with getting Summoner Data comes in
	 */
	var userInfo = require(__dirname + '/summoner-http.js'),
		cache = require(__dirname + '/cache.js'),
		utils = require(__dirname + '/utils.js'),
		sql = require(__dirname + '/cache-sql.js');

	/*
		Initializing variables
	 */

	// This is so that we're not constantly making new objects that take up huge amounts of space
	jsonObj = '{"na":{"ids":[],"name":"na"},"br":{"ids":[],"name":"br"},"euw":{"ids":[],"name":"euw"},"eune":{"ids":[],"name":"eune"},"lan":{"ids":[],"name":"lan"},"las":{"ids":[],"name":"las"},"oce":{"ids":[],"name":"oce"},"kr":{"ids":[],"name":"kr"},"ru":{"ids":[],"name":"ru"},"tr":{"ids":[],"name":"tr"}}';

	var requestedIds = JSON.parse(jsonObj),
		requestedRunes = JSON.parse(jsonObj),
		requestedMasteries = JSON.parse(jsonObj),
		requestedTeams = JSON.parse(jsonObj),
		requestedBasic = JSON.parse(jsonObj);

	/*
		Module functions (to be called outside of this file)
	 */
	exports.basicByName = function (name, reg, func) {
		var basic;
		if ((basic = cache.getUserBasic((name = utils.fixNames(name)), reg))) func(basic);
		else requestedIds[reg].ids.push({name: name, func: func});
	};

	exports.basicById = function (id, reg, func) {
		requestedBasic[reg].ids.push({id: id, func: func});
	};

	exports.runes = function (id, reg, func) {
		sql.get('runes', id, reg, function (r) {
			if (!r) requestedRunes[reg].ids.push({id: id, func: func});
			else func(r);
		});
	};

	exports.masteries = function (id, reg, func) {
		sql.get('masteries', id, reg, function (r) {
			if (!r) requestedMasteries[reg].ids.push({id: id, func: func});
			else func(r);
		});
	};

	exports.teams = function (id, reg, func) {
		sql.get('teams', id, reg, function (r) {
			if (!r) requestedTeams[reg].ids.push({id: id, func: func});
			else func(r);
		});
	};

	exports.ranked = function (id, reg, func) {
		retrieve('ranked', id, reg, func);
	};

	exports.summary = function (id, reg, func) {
		retrieve('summary', id, reg, func);
	};

	exports.games = function (id, reg, func) {
		retrieve('games', id, reg, func);
	};

	exports.leagues = function (id, reg, func) {
		retrieve('leagues', id, reg, func);
	};

	var retrieve = function (slug, id, reg, func) {
		sql.get(slug, id, reg, function (r) {
			userInfo.summoner(slug, id, reg, function (r) {
				if (r) sql.add(slug, id, reg, r);
				func(r);
			});
		});
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
					userInfo.basicObjsByName(list, reg.name, function (obj) {
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

				case 'basicbyid':
					userInfo.basicObjsById(list, reg.name, function (obj) {
						if (!obj) obj = {};

						arr.forEach(function (i) {
							if (obj.hasOwnProperty(i.id)) {
								cache.add(obj[i.id].name, reg.name, obj[i.id]);
								i.func(obj[i.id]);
							}
							else
								i.func(false);
						});
					});
					break;

				case 'runes':
					userInfo.runes(list, reg.name, function (obj) {
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
					userInfo.masteries(list, reg.name, function (obj) {
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
					userInfo.teamStats(list, reg.name, function (obj) {
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

			if (requestedBasic[r].ids.length > 0)
				getInfo(requestedBasic[r], 'basicbyid');
		});

		requestedIds = JSON.parse(jsonObj);
		requestedRunes = JSON.parse(jsonObj);
		requestedMasteries = JSON.parse(jsonObj);
		requestedTeams = JSON.parse(jsonObj);
		requestedBasic = JSON.parse(jsonObj);

	}, ritoPlsConfig.chunkTiming); // Every 1 second

	/*
		Cache flushing when entries are old
	 */
	setInterval(function () {
		var oldUsers = cache.getOldUsers();

		oldUsers.forEach(function (u) {
			cache.bringUserDateUp(u.name, u.region);
			sql.removeSummonerInfo(u.id, u.region);
		});
	}, ritoPlsConfig.caching.checkTimeSQL); // Every 1 min
})();
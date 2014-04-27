(function () {
	/*
		MySQL Class
		Grabs data like IDs & Basic Summoner Info, and Runes & Masteries
	 */
	var mysql = require('mysql'), // TODO `npm install mysql` on server this ends up on
		utils = require(__dirname + '/utils.js'),
		sql = ritoPlsConfig.sql;

	var con;

	var connect = function (func) {
		con = mysql.createConnection(sql);

		con.connect(function (err) {
			setup();

			if (err) throw 'ritopls: Fatal Error: Could not connect to SQL database!';
			else func();
		});
	};

	var doQuery = function (query, func) {
		var theQuery = function () {
			con.query(query, function (err, res) {
				if (err) func(false);
				else if (!res[0] || !res[0].value)
					func(false);
				else
					utils.maybeParseJson(res[0].value, func);
			});
		};

		if (con === undefined) connect(theQuery);
		else theQuery();
	};

	var setup = function () {
		var sql = "CREATE TABLE IF NOT EXISTS `user_cache_meta` ("
			+ "`riot_id` varchar(100) COLLATE utf8_unicode_ci NOT NULL,"
			+ "`region` varchar(5) COLLATE utf8_unicode_ci NOT NULL,"
			+ "`data_name` varchar(20) COLLATE utf8_unicode_ci NOT NULL,"
			+ "`value` longtext COLLATE utf8_unicode_ci NOT NULL,"
			+ "UNIQUE KEY `riot_id_UNIQUE` (`riot_id`,`region`,`data_name`)"
			+ ") ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;";

		doQuery(sql, function () {

		});
	}

	/*
		GET
	*/
	exports.get = function (slug, id, reg, func) {
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

	exports.removeSummonerInfo = function (id, reg) {
		var sql = 'DELETE FROM ?? WHERE ??=? AND ??=?',
			insert = ['user_cache_meta', 'riot_id', id, 'region', reg];

		sql = mysql.format(sql, insert);

		doQuery(sql, function (r) {
		});
	};

	/*
		INSERT
	 */

	exports.add = exports.insert = function (slug, id, reg, data) {
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

		if (sql && inserts) doQuery(mysql.format(sql, inserts), function () {
		});
	};
})();
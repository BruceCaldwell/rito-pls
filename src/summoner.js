(function () {
	var utils = require(__dirname + '/utils.js'),
		get = require(__dirname + '/get.js');

	module.exports = function (name, reg, eventEmitter) {
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

			var emitError = function (slug, err) {
				err.error = errors[slug];
				eventEmitter.emit(name + '-error', err);
			};

			get.runes(user.id, reg, function (r) {
				if (!r || r.error) emitError('runes', r);
				else {
					user.runes = r;
					doneWith('runes');
				}
			});

			get.masteries(user.id, reg, function (r) {
				if (!r || r.error) emitError('masteries', r);
				else {
					user.masteries = r;
					doneWith('masteries');
				}
			});

			get.ranked(user.id, reg, function (r) {
				if (!r || r.error) emitError('ranked', r);
				else {
					user.ranked = r;
					doneWith('ranked');
				}
			});

			get.summary(user.id, reg, function (r) {
				if (!r || r.error) emitError('summary', r);
				else {
					user.summary = r;
					doneWith('summary');
				}
			});

			get.games(user.id, reg, function (r) {
				if (!r || r.error) emitError('games', r);
				else {
					user.games = r.games;
					doneWith('games');
				}
			});

			get.leagues(user.id, reg, function (r) {
				if (!r || r.error) emitError('leagues', r);
				else {
					user.leagues = r;
					doneWith('leagues');
				}
			});

		});
	};
})();
(function () {
	ritoPlsConfig = require(__dirname + '/ritopls.json'); // Global config var

	var utils = require(__dirname + '/utils.js'),
		get = require(__dirname + '/get.js'),
		Summoner = require(__dirname + '/summoner.js'),
		EventEmitter = require('events').EventEmitter;

	var eventEmitter = new EventEmitter;
	eventEmitter.setMaxListeners(0); // This could possibly go well over the suggested maximum. Put at infinite after testing to make sure stray listeners are removed.

	var RitoPls = function (config) {
		if (config) {
			for (var i in config) {
				if (config.hasOwnProperty(i))
					ritoPlsConfig[i] = config[i];
			}
		}
	};

	RitoPls.getSummonerByName = function (name, reg) {
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

		Summoner(name, reg, eventEmitter);

		return interactions;
	};

	RitoPls.getBasicByName = function (name, reg) {
		var interactions = new EventEmitter;

		get.basicByName(name, reg, function (obj) {
			if (!obj || !obj.name) {
				interactions.emit('ready', {id: 0, desc: 'Failed to retrieve summoner basic info object.'});
				interactions.removeAllListeners();
			}
			else {
				interactions.emit('error', obj);
				interactions.removeAllListeners();
			}
		});

		return interactions;
	};

	RitoPls.prototype.getById = function (slug, id, reg) {
		if (!(slug instanceof Array)) slug = [slug];

		var interactions = new EventEmitter,
			user = {},
			waitingOn = [];

		var errors = {
			id: {id: 0, desc: 'Failed to retrieve summoner basic info object.'},
			runes: {id: 1, desc: 'Failed to retrieve summoner runes.'},
			masteries: {id: 2, desc: 'Failed to retrieve summoner masteries.'},
			ranked: {id: 3, desc: 'Failed to retrieve summoner ranked stats.'},
			summary: {id: 4, desc: 'Failed to retrieve summoner stats summary.'},
			games: {id: 5, desc: 'Failed to retrieve summoner recent games.'},
			leagues: {id: 6, desc: 'Failed to retrieve summoner league info.'}
		};

		var doneWith = function (i) {
			var theIndex = waitingOn.indexOf(i);

			if (theIndex !== -1) waitingOn = utils.removeArrayElement(waitingOn, theIndex);

			if (waitingOn.length === 0) {
				interactions.emit('ready', user);
				interactions.removeAllListeners();
			}
		};

		var emitError = function (slug) {
			interactions.emit('error', errors[slug]);
		};

		slug.forEach(function (i) {
			switch (i) {
				case 'basic':
					waitingOn.push('basic');

					get.basicById(id, reg, function (r) {
						if (!r || r.error) emitError('id');
						else {
							for (var i in r) {
								if (r.hasOwnProperty(i)) {
									user[i] = r[i];
								}
							}
							doneWith('basic');
						}
					});
					break;

				case 'runes':
					waitingOn.push('runes');

					get.runes(id, reg, function (r) {
						if (!r || r.error) emitError('runes');
						else {
							user.runes = r;
							doneWith('runes');
						}
					});
					break;

				case 'masteries':
					waitingOn.push('masteries');

					get.masteries(id, reg, function (r) {
						if (!r || r.error) emitError('masteries');
						else {
							user.masteries = r;
							doneWith('masteries');
						}
					});
					break;

				case 'ranked':
					waitingOn.push('ranked');

					get.ranked(id, reg, function (r) {
						if (!r || r.error) emitError('ranked');
						else {
							user.ranked = r;
							doneWith('ranked');
						}
					});
					break;

				case 'summary':
					waitingOn.push('summary');

					get.summary(id, reg, function (r) {
						if (!r || r.error) emitError('summary');
						else {
							user.summary = r;
							doneWith('summary');
						}
					});
					break;

				case 'games':
					waitingOn.push('games');

					get.games(id, reg, function (r) {
						if (!r || r.error) emitError('games');
						else {
							user.summary = r;
							doneWith('games');
						}
					});
					break;

				case 'leagues':
					waitingOn.push('leagues');

					get.leagues(id, reg, function (r) {
						if (!r || r.error) emitError('leagues');
						else {
							user.leagues = r;
							doneWith('leagues');
						}
					});
					break;
			}
		});

		return interactions;
	};

	RitoPls.staticAPI = require(__dirname + '/static-http.js');

	module.exports = RitoPls;
})();
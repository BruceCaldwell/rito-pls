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
			if (!obj || !obj.name) interactions.emit('ready', {id: 0, desc: 'Failed to retrieve summoner basic info object.'});
			else interactions.emit('error', obj);
		});

		return interactions;
	};

	module.exports = RitoPls;
})();
(function () {
	var utils = require(__dirname + '/utils.js');

	var version = 'v1.2';

	exports.getChampionData = function (reg, func, flags, id, byId) {
		var uri = '/static-data/' + reg + '/' + version + '/champion';

		if (id) uri += '/' + id.toString();

		if (!flags || !(flags instanceof Array)) flags = [];
		uri += '?champData=' + flags.join(',');

		if (byId) uri += '&dataById=1';

		utils.doReqRiot(uri, func, reg);
	};

	exports.getItemData = function (reg, func, flags, id) {
		var uri = '/static-data/' + reg + '/' + version + '/item';

		if (id) uri += '/' + id.toString();

		if (!flags || !(flags instanceof Array)) flags = [];
		uri += '?itemListData=' + flags.join(',');

		utils.doReqRiot(uri, func, reg);
	};

	exports.getMasteryData = function (reg, func, flags, id) {
		var uri = '/static-data/' + reg + '/' + version + '/mastery';

		if (id) uri += '/' + id.toString();

		if (!flags || !(flags instanceof Array)) flags = [];
		uri += '?masteryListData=' + flags.join(',');

		utils.doReqRiot(uri, func, reg);
	};

	exports.getRealmData = function (reg, func) {
		var uri = '/static-data/' + reg + '/' + version + '/realm';

		utils.doReqRiot(uri, func, reg);
	};

	exports.getRuneData = function (reg, func, flags, id) {
		var uri = '/static-data/' + reg + '/' + version + '/rune';

		if (id) uri += '/' + id.toString();

		if (!flags || !(flags instanceof Array)) flags = [];
		uri += '?runeData=' + flags.join(',');

		utils.doReqRiot(uri, func, reg);
	};

	exports.getSummonerSpellData = function (reg, func, flags, id) {
		var uri = '/static-data/' + reg + '/' + version + '/summoner-spell';

		if (id) uri += '/' + id.toString();

		if (!flags || !(flags instanceof Array)) flags = [];
		uri += '?spellData=' + flags.join(',');

		utils.doReqRiot(uri, func, reg);
	};
});
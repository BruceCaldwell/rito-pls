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
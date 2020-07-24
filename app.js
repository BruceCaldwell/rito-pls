const request = require('request');


module.exports = function ritoPls(config) {
  this.CONF = config;
  if (!this.CONF || !this.CONF.apikey || !this.CONF.region) {
    throw new Error('Invalid Configuration.');
  }

  this.cacheSenders = [];
  this.cacheListeners = [];
};

module.exports.EventHandler = {
  // Public Methods
  addCacheSender: function(callback) {
    this.cacheSenders.push(callback);
  },
  addCacheListener: function(callback) {
    this.cacheListeners.push(callback);
  },

  // callback receives:
  //   eventId
  //   params
  //   data (listeners only)

  // Private Methods

  /**
   * Determines if there is a cache for eventId and params and returns cache value.
   *
   * @param String eventId Internal event descriptor
   * @param Mixed  params  Event parameters
   */
  isCached: async function (eventId, params) {
    for(let i = 0; i < this.cacheSenders.length; i++) {
      let cb = this.cacheSenders[i];
      let data = cb(eventId, params);
      if (data && data.then) data = await data;
      if (data) return data;
    }
    return false;
  },
  /**
   * Sends data to caching fucntions
   *
   * @param String eventId Internal event descriptor
   * @param Mixed  params  Event parameters
   * @param Mixed  data    Riot api data
   */
  doCache: function (eventId, params, data) {
    for(let i = 0; i < this.cacheListeners.length; i++) {
      let cb = this.cacheListeners[i];
      cb(eventId, params, data);
    }
  }
};

module.exports.Account = {
  getByPuuid: async (puuid) => {
    let cache = await isCached('Account.getByPuuid', { puuid });
    if (cache) return cache;

    let data = await request(`https://${this.CONF.region}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}?api_key=${this.CONF.apikey}`);
    doCache('Account.getByPuuid', { puuid }, data);
    return data;
  },

  getByRiotId: async (name, tag) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${encodeURI(tag)}?api_key=${this.CONF.apikey}`);
  },

  getActiveShardsByGame: async (game, puuid) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/riot/account/v1/active-shards/by-game/${game}/by-puuid/${puuid}?api_key=${this.CONF.apikey}`);
  }
};

module.exports.ChampionMasteries = {
  getBySummoner: async (encryptedSummonerId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
  },

  getByChampion: async (encryptedSummonerId, championId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${encryptedSummonerId}/by-champion/${championId}?api_key=${this.CONF.apikey}`);
  },

  getScores: async (encryptedSummonerId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
  }
};

module.exports.Champion = {
  getRotations: async() => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=${this.CONF.apikey}`);
  },
};

module.exports.Clash = {
  getPlayerBySummoner: async(summonerId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/clash/v1/players/by-summoner/${summonerId}?api_key=${this.CONF.apikey}`);
  },

  getTeam: async(teamId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/clash/v1/teams/${teamId}?api_key=${this.CONF.apikey}`);
  },

  getTournaments: async() => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/clash/v1/tournaments?api_key=${this.CONF.apikey}`);
  },

  getTournamentsByTeam: async(teamId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/clash/v1/tournaments/by-team/${teamId}?api_key=${this.CONF.apikey}`);
  },

  getTournament: async(tournamentId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/clash/v1/tournaments/${tournamentId}?api_key=${this.CONF.apikey}`);
  },
};

module.exports.LeagueExp = {
  getEntries: async(queue, tier, division) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/league-exp/v4/entries/${queue}/${tier}/${division}?api_key=${this.CONF.apikey}`);
  },
};

module.exports.League = {
  getChallengerLeaguesByQueue: async(queue) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${queue}?api_key=${this.CONF.apikey}`);
  },

  getEntriesBySummonerId: async(encryptedSummonerId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
  },

  getEntries: async(queue, tier, division) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/league/v4/entries/${queue}/${tier}/${division}?api_key=${this.CONF.apikey}`);
  },

  getGrandMasterLeaguesByQueue: async(queue) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/league/v4/grandmasterleagues/by-queue/${queue}?api_key=${this.CONF.apikey}`);
  },

  getLeagueById: async(leagueId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/league/v4/leagues/${leagueId}?api_key=${this.CONF.apikey}`);
  },

  getMasterLeaguesByQueue: async(queue) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/league/v4/masterleagues/by-queue/${queue}?api_key=${this.CONF.apikey}`);
  },
};

module.exports.LolStatus = {
  getByShard: async() => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/status/v3/shard-data?api_key=${this.CONF.apikey}`);
  },
};

module.exports.LorRanked = {
  getMasterTierLeaderboard: async() => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lor/ranked/v1/leaderboards?api_key=${this.CONF.apikey}`);
  },
};

module.exports.Match = {
  getById: async(matchId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/match/v4/matches/${matchId}?api_key=${this.CONF.apikey}`);
  },

  getByAccount: async(encryptedAccountId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/match/v4/matchlists/by-account/${encryptedAccountId}?api_key=${this.CONF.apikey}`);
  },

  getTimelines: async(matchId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/match/v4/timelines/by-match/${matchId}?api_key=${this.CONF.apikey}`);
  },

  getIdByTournamentCode: async(tournamentCode) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/match/v4/matches/by-tournament-code/${tournamentCode}/ids?api_key=${this.CONF.apikey}`);
  },

  getByTournamentCode: async(matchId, tournamentCode) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/match/v4/matches/${matchId}/by-tournament-code/${tournamentCode}?api_key=${this.CONF.apikey}`);
  },
};

module.exports.Spectator = {
  getBySummoner: async(encryptedSummonerId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
  },

  getFeaturedGames: async() => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/spectator/v4/featured-games?api_key=${this.CONF.apikey}`);
  },
};


module.exports.Summoner = {
  getByAccount: async(encryptedAccountId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/summoner/v4/summoners/by-account/${encryptedAccountId}?api_key=${this.CONF.apikey}`);
  },

  getByName: async(summonerName) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${this.CONF.apikey}`);
  },

  getByPuuid: async(encryptedPUUID) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encryptedPUUID}?api_key=${this.CONF.apikey}`);
  },

  getBySummonerID: async(encryptedSummonerId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/summoner/v4/summoners/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
  },
};

module.exports.TftLeague = {
  getChallenger: async() => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/tft/league/v1/challenger?api_key=${this.CONF.apikey}`);
  },

  getEntiresBySummoner: async(encryptedSummonerId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/tft/league/v1/entries/by-summoner/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
  },

  getEntires: async(tier, division) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/tft/league/v1/entries/${tier}/${division}?api_key=${this.CONF.apikey}`);
  },

  getGrandMaster: async() => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/tft/league/v1/grandmaster?api_key=${this.CONF.apikey}`);
  },

  getById: async(leagueId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/tft/league/v1/leagues/${leagueId}?api_key=${this.CONF.apikey}`);
  },

  getMaster: async() => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/tft/league/v1/master?api_key=${this.CONF.apikey}`);
  },
};

module.exports.TftMatch = {
  getByPuuid: async(puuid) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?api_key=${this.CONF.apikey}`);
  },

  getById: async(matchId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/tft/match/v1/matches/${matchId}?api_key=${this.CONF.apikey}`);
  },
};

module.exports.TftSummoner = {
  getByAccount: async(encryptedAccountId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/tft/summoner/v1/summoners/by-account/${encryptedAccountId}?api_key=${this.CONF.apikey}`);
  },

  getByName: async(summonerName) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/tft/summoner/v1/summoners/by-name/${summonerName}?api_key=${this.CONF.apikey}`);
  },

  getByPuuid: async(encryptedPUUID) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${encryptedPUUID}?api_key=${this.CONF.apikey}`);
  },

  getById: async(encryptedSummonerId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/tft/summoner/v1/summoners/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
  },
};

module.exports.ThirdPartyCode = {
  getBySummoner: async(encryptedSummonerId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/platform/v4/third-party-code/by-summoner/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
  },
};

module.exports.TournamentStub = {
  createCode: async(tournamentId, tournamentCodeParameters, count) => {
    return await request.post(`https://${this.CONF.region}.api.riotgames.com/lol/tournament-stub/v4/codes?api_key=${this.CONF.apikey}&tournamentId=${tournamentId}${count ? '&count=' + count : ''}`, { json: tournamentCodeParameters });
  },

  getByCode: async(tournamentCode) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/tournament-stub/v4/lobby-events/by-code/${tournamentCode}?api_key=${this.CONF.apikey}`);
  },

  createProvider: async(providerRegistrationParameters) => {
    return await request.post(`https://${this.CONF.region}.api.riotgames.com/lol/tournament-stub/v4/providers?api_key=${this.CONF.apikey}`, { json: providerRegistrationParameters });
  },

  create: async(tournamentRegistrationParameters) => {
    return await request.post(`https://${this.CONF.region}.api.riotgames.com/lol/tournament-stub/v4/tournaments?api_key=${this.CONF.apikey}`, { json: tournamentRegistrationParameters });
  },
};

module.exports.Tournament = {
  createCode: async(tournamentId, tournamentCodeParameters, count) => {
    return await request.post(`https://${this.CONF.region}.api.riotgames.com/lol/tournament/v4/codes?api_key=${this.CONF.apikey}&tournamentId=${tournamentId}${count ? '&count=' + count : ''}`, { json: tournamentCodeParameters });
  },

  getByCode: async(tournamentCode) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/tournament/v4/codes/${tournamentCode}?api_key=${this.CONF.apikey}`);
  },

  updateCode: async(tournamentCode, tournamentCodeUpdateParameters) => {
    return await request.put(`https://${this.CONF.region}.api.riotgames.com/lol/tournament/v4/codes/${tournamentCode}?api_key=${this.CONF.apikey}`, { json: tournamentCodeUpdateParameters });
  },

  getLobbyByCode: async(tournamentCode) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/lol/tournament/v4/lobby-events/by-code/${tournamentCode}?api_key=${this.CONF.apikey}`);
  },

  createProvider: async(providerRegistrationParameters) => {
    return await request.post(`https://${this.CONF.region}.api.riotgames.com/lol/tournament/v4/providers?api_key=${this.CONF.apikey}`, { json: providerRegistrationParameters });
  },

  create: async(tournamentRegistrationParameters) => {
    return await request.post(`https://${this.CONF.region}.api.riotgames.com/lol/tournament/v4/tournaments?api_key=${this.CONF.apikey}`, { json: tournamentRegistrationParameters });
  },
};

module.exports.ValContent = {
  getContent: async() => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/val/content/v1/contents?api_key=${this.CONF.apikey}`);
  },
};

module.exports.ValMatch = {
  getById: async(matchId) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/val/match/v1/matches/${matchId}?api_key=${this.CONF.apikey}`);
  },

  getByPuuid: async(puuid) => {
    return await request(`https://${this.CONF.region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}?api_key=${this.CONF.apikey}`);
  },
};

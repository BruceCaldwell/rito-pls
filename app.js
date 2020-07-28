const request = require('request-promise-native');

const RitoPls = function(config) {
  this.CONF = config;
  if (!this.CONF || !this.CONF.apikey || !this.CONF.region) {
    throw new Error('Invalid Configuration.');
  }

  this.cacheSenders = [];
  this.cacheListeners = [];

  this.EventHandler = {
    // Public Methods
    addCacheSender: function(callback) {
      this.cacheSenders.push(callback);
    },

    addCacheListener: function(callback) {
      this.cacheListeners.push(callback);
    },

    // Private Methods

    /**
     * Determines if there is a cache for eventId and params and returns cache value.
     *
     * @param String eventId Internal event descriptor
     * @param Mixed  params  Event parameters
     */
    isCached: async (eventId, params) => {
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
    doCache: (eventId, params, data) => {
      for(let i = 0; i < this.cacheListeners.length; i++) {
        let cb = this.cacheListeners[i];
        cb(eventId, params, data);
      }
    }
  };

  // Account
  this.Account = {
    getByPuuid: async (puuid) => {
      let cache = await this.EventHandler.isCached('Account.getByPuuid', { puuid });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Account.getByPuuid', { puuid }, data);
      return data;
    },

    getByRiotId: async (name, tag) => {
      let cache = await this.EventHandler.isCached('Account.getByRiotId', { name, tag });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${encodeURIComponent(tag)}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Account.getByRiotId', { name, tag }, data);
      return data;
    },

    getActiveShardsByGame: async (game, puuid) => {
      let cache = await this.EventHandler.isCached('Account.getActiveShardsByGame', { game, puuid });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/riot/account/v1/active-shards/by-game/${game}/by-puuid/${puuid}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Account.getActiveShardsByGame', { game, puuid }, data);
      return data;
    }
  };

  // ChampionMasteries
  this.ChampionMasteries = {
    getBySummoner: async (encryptedSummonerId) => {
      let cache = await this.EventHandler.isCached('ChampionMasteries.getBySummoner', { encryptedSummonerId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('ChampionMasteries.getBySummoner', { encryptedSummonerId }, data);
      return data;
    },

    getByChampion: async (encryptedSummonerId, championId) => {
      let cache = await this.EventHandler.isCached('ChampionMasteries.getByChampion', { encryptedSummonerId, championId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${encryptedSummonerId}/by-champion/${championId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('ChampionMasteries.getByChampion', { encryptedSummonerId, championId }, data);
      return data;
    },

    getScores: async (encryptedSummonerId) => {
      let cache = await this.EventHandler.isCached('ChampionMasteries.getScores', { encryptedSummonerId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('ChampionMasteries.getScores', { encryptedSummonerId }, data);
      return data;
    }
  };

  // Champion
  this.Champion = {
    getRotations: async() => {
      let cache = await this.EventHandler.isCached('Champion.getRotations', {  });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Champion.getRotations', {  }, data);
      return data;
    },
  };

  // Clash
  this.Clash = {
    getPlayerBySummoner: async(summonerId) => {
      let cache = await this.EventHandler.isCached('Clash.getPlayerBySummoner', { summonerId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/clash/v1/players/by-summoner/${summonerId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Clash.getPlayerBySummoner', { summonerId }, data);
      return data;
    },

    getTeam: async(teamId) => {
      let cache = await this.EventHandler.isCached('Clash.getTeam', { teamId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/clash/v1/teams/${teamId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Clash.getTeam', { teamId }, data);
      return data;
    },

    getTournaments: async() => {
      let cache = await this.EventHandler.isCached('Clash.getTournaments', {  });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/clash/v1/tournaments?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Clash.getTournaments', {  }, data);
      return data;
    },

    getTournamentsByTeam: async(teamId) => {
      let cache = await this.EventHandler.isCached('Clash.getTournamentsByTeam', { teamId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/clash/v1/tournaments/by-team/${teamId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Clash.getTournamentsByTeam', { teamId }, data);
      return data;
    },

    getTournament: async(tournamentId) => {
      let cache = await this.EventHandler.isCached('Clash.getTournament', { tournamentId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/clash/v1/tournaments/${tournamentId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Clash.getTournament', { tournamentId }, data);
      return data;
    },
  };

  // LeagueExp
  this.LeagueExp = {
    getEntries: async(queue, tier, division) => {
      let cache = await this.EventHandler.isCached('LeagueExp.getEntries', { queue, tier, division });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/league-exp/v4/entries/${queue}/${tier}/${division}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('LeagueExp.getEntries', { queue, tier, division }, data);
      return data;
    },
  };

  // League
  this.League = {
    getChallengerLeaguesByQueue: async(queue) => {
      let cache = await this.EventHandler.isCached('League.getChallengerLeaguesByQueue', { queue });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${queue}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('League.getChallengerLeaguesByQueue', { queue }, data);
      return data;
    },

    getEntriesBySummonerId: async(encryptedSummonerId) => {
      let cache = await this.EventHandler.isCached('League.getEntriesBySummonerId', { encryptedSummonerId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('League.getEntriesBySummonerId', { encryptedSummonerId }, data);
      return data;
    },

    getEntries: async(queue, tier, division) => {
      let cache = await this.EventHandler.isCached('League.getEntries', { queue, tier, division });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/league/v4/entries/${queue}/${tier}/${division}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('League.getEntries', { queue, tier, division }, data);
      return data;
    },

    getGrandMasterLeaguesByQueue: async(queue) => {
      let cache = await this.EventHandler.isCached('League.getGrandMasterLeaguesByQueue', { queue });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/league/v4/grandmasterleagues/by-queue/${queue}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('League.getGrandMasterLeaguesByQueue', { queue }, data);
      return data;
    },

    getLeagueById: async(leagueId) => {
      let cache = await this.EventHandler.isCached('League.getLeagueById', { leagueId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/league/v4/leagues/${leagueId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('League.getLeagueById', { leagueId }, data);
      return data;
    },

    getMasterLeaguesByQueue: async(queue) => {
      let cache = await this.EventHandler.isCached('League.getMasterLeaguesByQueue', { queue });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/league/v4/masterleagues/by-queue/${queue}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('League.getMasterLeaguesByQueue', { queue }, data);
      return data;
    },
  };

  // LolStatus
  this.LolStatus = {
    getByShard: async() => {
      let cache = await this.EventHandler.isCached('LolStatus.getByShard', {  });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/status/v3/shard-data?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('LolStatus.getByShard', {  }, data);
      return data;
    },
  };

  // LorRanked
  this.LorRanked = {
    getMasterTierLeaderboard: async() => {
      let cache = await this.EventHandler.isCached('LorRanked.getMasterTierLeaderboard', {  });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lor/ranked/v1/leaderboards?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('LorRanked.getMasterTierLeaderboard', {  }, data);
      return data;
    },
  };

  // Match
  this.Match = {
    getById: async(matchId) => {
      let cache = await this.EventHandler.isCached('Match.getById', { matchId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/match/v4/matches/${matchId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Match.getById', { matchId }, data);
      return data;
    },

    getByAccount: async(encryptedAccountId) => {
      let cache = await this.EventHandler.isCached('Match.getByAccount', { encryptedAccountId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/match/v4/matchlists/by-account/${encryptedAccountId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Match.getByAccount', { encryptedAccountId }, data);
      return data;
    },

    getTimelines: async(matchId) => {
      let cache = await this.EventHandler.isCached('Match.getTimelines', { matchId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/match/v4/timelines/by-match/${matchId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Match.getTimelines', { matchId }, data);
      return data;
    },

    getIdByTournamentCode: async(tournamentCode) => {
      let cache = await this.EventHandler.isCached('Match.getIdByTournamentCode', { tournamentCode });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/match/v4/matches/by-tournament-code/${tournamentCode}/ids?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Match.getIdByTournamentCode', { tournamentCode }, data);
      return data;
    },

    getByTournamentCode: async(matchId, tournamentCode) => {
      let cache = await this.EventHandler.isCached('Match.getByTournamentCode', { matchId, tournamentCode });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/match/v4/matches/${matchId}/by-tournament-code/${tournamentCode}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Match.getByTournamentCode', { matchId, tournamentCode }, data);
      return data;
    },
  };

  // Spectator
  this.Spectator = {
    getBySummoner: async(encryptedSummonerId) => {
      let cache = await this.EventHandler.isCached('Spectator.getBySummoner', { encryptedSummonerId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Spectator.getBySummoner', { encryptedSummonerId }, data);
      return data;
    },

    getFeaturedGames: async() => {
      let cache = await this.EventHandler.isCached('Spectator.getFeaturedGames', {  });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/spectator/v4/featured-games?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Spectator.getFeaturedGames', {  }, data);
      return data;
    },
  };

  // Summoner
  this.Summoner = {
    getByAccount: async(encryptedAccountId) => {
      let cache = await this.EventHandler.isCached('Summoner.getByAccount', { encryptedAccountId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/summoner/v4/summoners/by-account/${encryptedAccountId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Summoner.getByAccount', { encryptedAccountId }, data);
      return data;
    },

    getByName: async(summonerName) => {
      let cache = await this.EventHandler.isCached('Summoner.getByName', { summonerName });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Summoner.getByName', { summonerName }, data);
      return data;
    },

    getByPuuid: async(encryptedPUUID) => {
      let cache = await this.EventHandler.isCached('Summoner.getByPuuid', { encryptedPUUID });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encryptedPUUID}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Summoner.getByPuuid', { encryptedPUUID }, data);
      return data;
    },

    getBySummonerID: async(encryptedSummonerId) => {
      let cache = await this.EventHandler.isCached('Summoner.getBySummonerID', { encryptedSummonerId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/summoner/v4/summoners/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Summoner.getBySummonerID', { encryptedSummonerId }, data);
      return data;
    },
  };

  // TftLeague
  this.TftLeague = {
    getChallenger: async() => {
      let cache = await this.EventHandler.isCached('TftLeague.getChallenger', {  });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/tft/league/v1/challenger?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('TftLeague.getChallenger', {  }, data);
      return data;
    },

    getEntiresBySummoner: async(encryptedSummonerId) => {
      let cache = await this.EventHandler.isCached('TftLeague.getEntiresBySummoner', { encryptedSummonerId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/tft/league/v1/entries/by-summoner/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('TftLeague.getEntiresBySummoner', { encryptedSummonerId }, data);
      return data;
    },

    getEntires: async(tier, division) => {
      let cache = await this.EventHandler.isCached('TftLeague.getEntires', { tier, division });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/tft/league/v1/entries/${tier}/${division}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('TftLeague.getEntires', { tier, division }, data);
      return data;
    },

    getGrandMaster: async() => {
      let cache = await this.EventHandler.isCached('TftLeague.getGrandMaster', {  });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/tft/league/v1/grandmaster?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('TftLeague.getGrandMaster', {  }, data);
      return data;
    },

    getById: async(leagueId) => {
      let cache = await this.EventHandler.isCached('TftLeague.getById', { leagueId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/tft/league/v1/leagues/${leagueId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('TftLeague.getById', { leagueId }, data);
      return data;
    },

    getMaster: async() => {
      let cache = await this.EventHandler.isCached('TftLeague.getMaster', {  });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/tft/league/v1/master?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('TftLeague.getMaster', {  }, data);
      return data;
    },
  };

  // TftMatch
  this.TftMatch = {
    getByPuuid: async(puuid) => {
      let cache = await this.EventHandler.isCached('TftMatch.getByPuuid', { puuid });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('TftMatch.getByPuuid', { puuid }, data);
      return data;
    },

    getById: async(matchId) => {
      let cache = await this.EventHandler.isCached('TftMatch.getById', { matchId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/tft/match/v1/matches/${matchId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('TftMatch.getById', { matchId }, data);
      return data;
    },
  };

  // TftSummoner
  this.TftSummoner = {
    getByAccount: async(encryptedAccountId) => {
      let cache = await this.EventHandler.isCached('TftSummoner.getByAccount', { encryptedAccountId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/tft/summoner/v1/summoners/by-account/${encryptedAccountId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('TftSummoner.getByAccount', { encryptedAccountId }, data);
      return data;
    },

    getByName: async(summonerName) => {
      let cache = await this.EventHandler.isCached('TftSummoner.getByName', { summonerName });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/tft/summoner/v1/summoners/by-name/${summonerName}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('TftSummoner.getByName', { summonerName }, data);
      return data;
    },

    getByPuuid: async(encryptedPUUID) => {
      let cache = await this.EventHandler.isCached('TftSummoner.getByPuuid', { encryptedPUUID });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${encryptedPUUID}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('TftSummoner.getByPuuid', { encryptedPUUID }, data);
      return data;
    },

    getById: async(encryptedSummonerId) => {
      let cache = await this.EventHandler.isCached('TftSummoner.getById', { encryptedSummonerId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/tft/summoner/v1/summoners/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('TftSummoner.getById', { encryptedSummonerId }, data);
      return data;
    },
  };

  // ThirdPartyCode
  this.ThirdPartyCode = {
    getBySummoner: async(encryptedSummonerId) => {
      let cache = await this.EventHandler.isCached('ThirdPartyCode.getBySummoner', { encryptedSummonerId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/platform/v4/third-party-code/by-summoner/${encryptedSummonerId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('ThirdPartyCode.getBySummoner', { encryptedSummonerId }, data);
      return data;
    },
  };

  // TournamentStub
  this.TournamentStub = {
    createCode: async(tournamentId, tournamentCodeParameters, count) => {
      return await request.post(`https://${this.CONF.region}.api.riotgames.com/lol/tournament-stub/v4/codes?api_key=${this.CONF.apikey}&tournamentId=${tournamentId}${count ? '&count=' + count : ''}`, { json: tournamentCodeParameters });
    },

    getByCode: async(tournamentCode) => {
      let cache = await this.EventHandler.isCached('TournamentStub.getByCode', { tournamentCode });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/tournament-stub/v4/lobby-events/by-code/${tournamentCode}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('TournamentStub.getByCode', { tournamentCode }, data);
      return data;
    },

    createProvider: async(providerRegistrationParameters) => {
      return await request.post(`https://${this.CONF.region}.api.riotgames.com/lol/tournament-stub/v4/providers?api_key=${this.CONF.apikey}`, { json: providerRegistrationParameters });
    },

    create: async(tournamentRegistrationParameters) => {
      return await request.post(`https://${this.CONF.region}.api.riotgames.com/lol/tournament-stub/v4/tournaments?api_key=${this.CONF.apikey}`, { json: tournamentRegistrationParameters });
    },
  };

  // Tournament
  this.Tournament = {
    createCode: async(tournamentId, tournamentCodeParameters, count) => {
      return await request.post(`https://${this.CONF.region}.api.riotgames.com/lol/tournament/v4/codes?api_key=${this.CONF.apikey}&tournamentId=${tournamentId}${count ? '&count=' + count : ''}`, { json: tournamentCodeParameters });
    },

    getByCode: async(tournamentCode) => {
      let cache = await this.EventHandler.isCached('Tournament.getByCode', { tournamentCode });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/lol/tournament/v4/codes/${tournamentCode}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Tournament.getByCode', { tournamentCode }, data);
      return data;
    },

    updateCode: async(tournamentCode, tournamentCodeUpdateParameters) => {
      return await request.put(`https://${this.CONF.region}.api.riotgames.com/lol/tournament/v4/codes/${tournamentCode}?api_key=${this.CONF.apikey}`, { json: tournamentCodeUpdateParameters });
    },

    getLobbyByCode: async(tournamentCode) => {
      let cache = await this.EventHandler.isCached('Tournament.getLobbyByCode', { tournamentCode });
      if (cache) return cache;

      let data = await  request(`https://${this.CONF.region}.api.riotgames.com/lol/tournament/v4/lobby-events/by-code/${tournamentCode}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('Tournament.getLobbyByCode', { tournamentCode }, data);
      return data;
    },

    createProvider: async(providerRegistrationParameters) => {
      return await request.post(`https://${this.CONF.region}.api.riotgames.com/lol/tournament/v4/providers?api_key=${this.CONF.apikey}`, { json: providerRegistrationParameters });
    },

    create: async(tournamentRegistrationParameters) => {
      return await request.post(`https://${this.CONF.region}.api.riotgames.com/lol/tournament/v4/tournaments?api_key=${this.CONF.apikey}`, { json: tournamentRegistrationParameters });
    },
  };

  // ValContent
  this.ValContent = {
    getContents: async() => {
      let cache = await this.EventHandler.isCached('ValContent.getContents', {  });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/val/content/v1/contents?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('ValContent.getContents', {  }, data);
      return data;
    },
  };

  // ValMatch
  this.ValMatch = {
    getById: async(matchId) => {
      let cache = await this.EventHandler.isCached('ValMatch.getById', { matchId });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/val/match/v1/matches/${matchId}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('ValMatch.getById', { matchId }, data);
      return data;
    },

    getByPuuid: async(puuid) => {
      let cache = await this.EventHandler.isCached('ValMatch.getByPuuid', { puuid });
      if (cache) return cache;

      let data = await request(`https://${this.CONF.region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}?api_key=${this.CONF.apikey}`);
      this.EventHandler.doCache('ValMatch.getByPuuid', { puuid }, data);
      return data;
    },
  };
};

module.exports = RitoPls;

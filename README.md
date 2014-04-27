RitoPls
========

### Version 0.1.0 / 140427

#### Node.js module that makes retrieving and caching data from the [Riot API](https://developer.riotgames.com/) simple.

Because there are restrictions to how many connections can be made to the Riot API, caching and asynchronous (aggregated) HTTP requests are a must. Node.js is great at handling asynchonous code and serves RitoPls's purpose well.

## What does it do?

RitoPls provides a complete layer between Node.js HTTP Webserver or TCP Port and the Riot API, with both in-memory of basic Summoner objects and database (SQL) caching of JSON objects retrieved from the Riot API. This takes care of the hard part (getting the data) so you can focus on the important stuff, like making sure your server is protected behind a firewall.

## Installation

RitoPls can be installed via [**npm**](www.npmjs.org), either by cloning this repository into your home folder, or directly:

```
npm install rito-pls
```

## Usage

``` js
var RitoPls = require('rito-pls'),
	ritoPls = new RitoPls(config);
```

The RitoPls constructor takes an Object as its only parameter. The `ritopls.json` file shows all of the default properties, but there are two required properties:

* `apiKey` - Your Riot API Key. You can get one from https://developer.riotgames.com/
* `sql` - Object for connecting to SQL database
	* `host` - Host IP / domain of the SQL database
	* `user` - SQL User to connect with
	* `password` - Password for above user
	* `database` - The database for RitoPls to store its cached data in

_**TIP:** You can make a `ritopls.json` file, and `require()` it here instead of having this object clutter up your code._

## Public Methods

_**TIP:** All of the module's methods are asynchronous by nature, and responses are automatically cached (and flushed after the time periods set in the config object)._

### getSummonerByName(name, region)

#### Arguments

* `name` - The Summoner name to search for. This will be sanitized by the module.
* `region` - The region to search in. Supports one of the following: `na, br, euw, eune, lan, las, oce, kr, ru, tr`

#### Explanation

This is your main function. If you never used another method other than this one, you'd still be okay. Returns an EventEmitter object, which you can access like this:

``` js
var request = ritoPls.getSummonerByName('dyrus', 'na');

request.on('ready', function(data) {

});

request.on('error', function(err) {

});
```

The `data` property returned by the 'ready' event has the following properties:

* `name` - The Summoner's "pretty" name, as shown in the client
* `id` - Their Riot ID
* `runes` - Array of Runes Objects
* `masteries` - Array of Masteries Objects
* `ranked` - Summoner's ranked stats
* `summary` - Summoner's stats summaries for all queues they've been a part of
* `leagues` - Summoner's league info (where you'll get their LP and YOLOq rank)

### getBasicByName(name, reg)

#### Arguments

* `name` - The Summoner name to search for. This will be sanitized by the module.
* `region` - The region to search in. Supports one of the following: `na, br, euw, eune, lan, las, oce, kr, ru, tr`

#### Explanation

This is the function you want to use for looking up summoners when you don't want all of the extra info (such as when you're showing another Summoner's games). Returns an EventEmmiter object, which you can access like this:

``` js
var request = ritoPls.getBasicByname('theoddone', 'na');

request.on('ready', function(data) {

});

request.on('error', function(err) {

});
```
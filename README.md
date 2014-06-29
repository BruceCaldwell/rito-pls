rito-pls
========

### Version 1.5.1 / 140629

[![NPM](https://nodei.co/npm/rito-pls.png?downloads=true)](https://nodei.co/npm/rito-pls/)

#### Node.js module that makes retrieving and caching data from the [Riot API](https://developer.riotgames.com/) simple.

**rito-pls now fully supports the Static Data API.**

**See the [WIKI](https://github.com/BruceCaldwell/rito-pls/wiki) for info on using the API functions. There are a lot of them.**

## What does it do?

RitoPls provides a complete layer between Node.js HTTP Webserver or TCP Port and the Riot API, with both in-memory of basic Summoner objects and database (SQL) caching of JSON objects retrieved from the Riot API. This takes care of the hard part (getting the data) so you can focus on the important stuff, like making sure your server is protected behind a firewall.

## Installation

RitoPls can be installed via [**npm**](www.npmjs.org), either by cloning this repository into your home folder, or directly:

```
npm install rito-pls
```

## Basic Usage

``` js
var RitoPls = require('rito-pls'),
	ritoPls = new RitoPls(config);
```

## API Documentation

API documentation is available in the [GitHub Wiki](https://github.com/BruceCaldwell/rito-pls/wiki).
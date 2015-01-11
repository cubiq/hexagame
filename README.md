# Hexagame Word Puzzle

**Hexagame** is an Open Source HTML5 word game developed by [Matteo Spinelli](http://cubiq.org/).

## Basic rules

1. Compose words by selecting a minimum of three nearby tiles.
2. Click (or tap) on the last selected tile to confirm the word.
3. Find as many words as you can in the given time frame (3 minutes per level).

You have a limited number of *swaps*. Swaps let you rearrange the tiles position.

1. To change a tile position click (or tap) and hold on it and drag on a nearby tile.
2. Release to confirm.
3. You have a limited number of swaps available. Use them wisely.


## Client side

To get better performance on tablets and mobile devices the UI is built out of HTML elements and CSS, this is *not* a canvas game. The game does not use any JS framework, it's all hand crafted custom code. This makes the whole game resides comfortably in just 15kb (minified+compressed).

## Server side

Server side the game uses PHP for very simple tasks (the leader boards mostly). The only dependency is [Google OAuth2 library](http://code.google.com/p/google-api-php-client/) (not included in this repo) needed for user's sign in. More sign in gateways will be added in the future (twitter, facebook, ...).

To add the OAuth PHP client to Hexagame, move the client `src` directory inside Hexagame `libs` directory and rename it `google` (`./hexagame/libs/google/...`).

You also need to rename the `config-test.php` file to `config.php` and fill the `$config` variable inside (it should self explanatory).

## Compatibility

The game is in beta stage and the list of supported browsers/platforms is still limited:

* **Desktop**
	* Chrome (best performance overall)
	* Safari (smoothest animations)
	* Firefox (works, low framerate)
	* Opera (works, low framerate)
	* Internet Explorer 9+ (glitches, need debug but good performance)

* **Tablet**
	* iPad (small glitches)
	* Android (doesn't work, need work)

* **Mobile**
	* No mobile device supported. Android and iPhone planned. Possibly other webkit based devices. I don't think the WinPhone 7.5 browser can handle this, maybe WP8.


## Database structure

A mysql database is needed for the leader boards. The DB structure is as follow:

	CREATE TABLE `users` (
	  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
	  `name` varchar(32) NOT NULL DEFAULT '',
	  `email` varchar(128) NOT NULL DEFAULT '',
	  PRIMARY KEY (`id`),
	  KEY `name` (`name`),
	  KEY `email` (`email`)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8;

	CREATE TABLE `sessions` (
	  `id` char(40) NOT NULL DEFAULT '',
	  `user_id` int(11) unsigned NOT NULL DEFAULT '0',
	  `token` text NOT NULL,
	  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	  PRIMARY KEY (`id`),
	  KEY `user_id` (`user_id`)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8;

	CREATE TABLE `scoreboards` (
	  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
	  `user_id` int(10) unsigned NOT NULL DEFAULT '0',
	  `time` bigint(20) unsigned NOT NULL DEFAULT '0',
	  `language` char(5) NOT NULL DEFAULT '',
	  `platform` tinyint(4) NOT NULL DEFAULT '0',
	  `score` int(10) unsigned NOT NULL DEFAULT '0',
	  `words` smallint(5) unsigned NOT NULL DEFAULT '0',
	  `letters` mediumint(8) unsigned NOT NULL DEFAULT '0',
	  `level` smallint(5) unsigned NOT NULL DEFAULT '0',
	  PRIMARY KEY (`id`),
	  KEY `user_id` (`user_id`),
	  KEY `score` (`score`),
	  KEY `language` (`language`),
	  KEY `user_id_2` (`user_id`,`score`)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8;

	CREATE TABLE `leaderboards` (
	  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
	  `rank` int(10) unsigned NOT NULL DEFAULT '0',
	  `user_id` int(11) unsigned NOT NULL DEFAULT '0',
	  `language` char(5) NOT NULL DEFAULT '',
	  `platform` tinyint(4) NOT NULL DEFAULT '0',
	  `score` int(10) unsigned NOT NULL DEFAULT '0',
	  `words` smallint(5) unsigned NOT NULL DEFAULT '0',
	  `letters` mediumint(8) unsigned NOT NULL DEFAULT '0',
	  `level` smallint(5) unsigned NOT NULL DEFAULT '0',
	  PRIMARY KEY (`id`),
	  KEY `user_id` (`user_id`),
	  KEY `score` (`score`),
	  KEY `rank` (`rank`)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8;

Please note that the DB structure will likely change.


## Dictionaries

The game is a word puzzle so it is based on a word list. The dictionary files are not included in the repo but you can download them from <http://hexaga.me/dict/wordlist.zip>. In the archive you'll find the post-processed word lists for the following languages:

* US English
* UK English
* Italian is ready but disabled in beta phase

If you want to contribute with other languages please follow these rules:

* It is not a simple dictionary but a word list. We need all verb forms (infinite, present, future, past, etc), plural and singular, male and female, adjectives in simple, superlative, comparative, diminutive, and so on.
* Include the most commonly used words only and some neologism. Ideally the word list shouldn't exceed ~1mb uncompressed. The US dictionary for example is just 350kb, while Italian is 950kb.
* Include only words 3 to 8 characters long.
* If possible accented vowels should be converted into the not-accented counter part (e.g.: è = e). When not applicable, please contact me before proceeding.


## TO-DO

* Optimize iPad version
* Fix IE glitches
* Add tutorial and instructions
* Add *Options* page (to change language and preferences)
* Add Audio
* Add android tablet compatibility
* Add mobile compatibility
* Add more sign in gateways (twitter, facebook, ...)


## Quick reference to build a local working environment

1. Download the [wordlist](http://lab.cubiq.org/wordlist.zip), unzip and place it in the `dict` folder.
2. Rename `config-test.php` to `config.php`.
3. Add audio files in the Audio folder (not provided in this repo)

You should be ready to go. If you want to add the leader boards and user login you also need.

1. Create the `hexagame` Mysql database with the given structure.
2. Access the [Google API console](https://code.google.com/apis/console#access) and register you application/domain.
3. Download the [OAuth PHP client](http://code.google.com/p/google-api-php-client/), copy the `src` directory inside the Hexagame `lib` directory and rename it `google`.
4. Fill the `$config` variable.
5. Change the return URL in the `login.js` file (inside the `googleSignIn` function).


## License

Although the code is MIT licensed, the name *Hexagame*, the logo and the icons are copyrighted materials owned by Matteo Spinelli. The code is offered for educational purposes.

var fs = require('fs');
var config = require('./config.js');

var _file_target = config.log_file;
var map = {};
var word_no_prefix = ['.', ',', ';', '?', '!'];
var newline_token = '#~$EOL^%(';
var starter_words = [];


module.exports = {

	generate_string: function(seed = '') {
		var word = starter_words[Math.floor(Math.random() * starter_words.length)];
		if (seed != '') {
			var seed_word = '';
			var seed_words = seed.split(' ');
			seed_words.sort(function(a, b) { return b.length - a.length; });
			for (var i = 0; i < seed_words.length; i++) {
				if (seed_word == '' && starter_words.indexOf(seed_words[i]) >= 0) {
					word = seed_word = seed_words[i];
				}
			}
		}
		var string = word;
		var newline = false;
		while (!newline) {
			word = random_key(map[word]);
			if (word == newline_token) {
				newline = true;
			}
			else {
				if (!word_no_prefix.includes(word)) string += ' ';
				string += word;
			}
		}
		console.log('vombot says : ' + string);
		return string;
	},

	get_word_data: function(word) {
		return map[word];
	},

	initialize: function() {
		console.log('initializing markov log.....');
		fs.readFile(_file_target, 'utf8', (err, data) => {
			data.split(/\r?\n/).forEach((line)=>{
				map_append(line);
			});
		}, () => {
			console.log('...markov log processed!');
		});
	},

	log_chat: function(data) {
		if (data.startsWith('!')) return false;
		fs.writeFileSync(_file_target, data, { flag: 'a+'});
		map_append(data);
		return true;
	},

	map_get: function() {
		return map;
	},

	random: function() {
	   var keys = Object.keys(map);
		return map[keys[keys.length * Math.random() << 0]];
	},

	random_seed: function() {
		var seed_pool = map[''];
	   var keys = Object.keys(map);
		return keys[keys.length * Math.random() << 0];
	}

}

var map_append = function(data) {
	//console.log(process.memoryUsage());
	data = data.replace(/\r?\n/g, ' ' + newline_token + ' ');
	var new_map = data.split(' ');
	// only process lines with more than one word
	if (new_map.length <= 3) {
		return false;
	}
	console.log(data);
	//var new_map = data.split(/ /);
	var previous_word = '';
	new_map.forEach((word, index, new_map) => {
		if (index === 0 && !starter_words.includes(word)) starter_words.push(word);
		word_append(previous_word, word);
		previous_word = word;
		if (index === new_map.length - 1) {
			word_append(previous_word, newline_token);
		}
	});
};

var word_append = function(word, descendant) {
	if (typeof map[word] === "undefined") map[word] = {};
	map[word][descendant] = ++map[word][descendant] || 1;
};

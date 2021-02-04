var colors = require('colors/safe');
var fs = require('fs');
var http = require('http');
var url = require('url');
var config = require('./config.js');
var markov = require('./markov.js');


module.exports = {

	initialize: function() {

		http.createServer(function(req, res) {

			var request = url.parse(req.url, true);
			var uri = request.pathname.split('/');

			if (uri[1] == 'word') {
				var word = uri[2].trim();
				console.log(colors.cyan('http requested word: ' + word));
				var word_data = markov.get_word_data(word);
				if (word_data !== undefined) {
					console.log(word_data);
				}
				else {
					console.log('word not in markov map');
					word_data = {};
				}
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.end(JSON.stringify(word_data));
			}

			else if (req.method == 'POST' && uri[1] == 'logline') {
				let post_data = '';
				// concatenate data into single string
				req.on('data', function (data) {
					post_data += data;
					if (post_data.length > 2000) {
						console.log('request too long wow');
						req.connection.destroy();
						return false;
					}
				});
				// process incoming data
				req.on('end', function () {
					console.log(post_data);
					try {
						post_data = JSON.parse(post_data);
					}
					catch(e) {
						console.log('bad json data');
						res.writeHead(404)
						res.end('malformed JSON object in POST request');
						return false;
					}
					if (post_data.log_key != config.log_key) {
						console.log('logline failed to log: inferior log_key attempted');
						res.end('need a better log_key wow ;-;');
						return false;
					}
					if (typeof post_data.line != "undefined") {
						let line = post_data.line;
						console.log(colors.red('log line: ' + line));
						markov.log_chat(line + "\r\n");	
						res.end('logline logged');
					}
					else {
						console.log('log line is undefined; not save');
						res.writeHead(404);
						res.end();
					}
				});
			}

			else {
				res.writeHead(404);
				res.end();
			}


		}).listen(config.http_port, config.http_ip);
		console.log(colors.cyan('http server running at ' + config.http_ip + ':' + config.http_port));
	}

};


var http = require('./lib/http_server.js');
var markov = require('./lib/markov.js');

markov.initialize('markov_log.txt');
http.initialize();

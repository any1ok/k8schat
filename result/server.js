var express = require('express'),
    async = require('async'),
    { Pool } = require('pg'),
    cookieParser = require('cookie-parser'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);
    path = require('path')

var port = process.env.PORT || 4000;

io.on('connection', function (socket) {

  socket.emit('message', { text : 'Welcome!' });

  socket.on('subscribe', function (data) {
    socket.join(data.channel);
  });
});
var pool = new Pool({
  connectionString: 'postgres://postgres:postgres@db/postgres'
});

async.retry(
  {times: 1000, interval: 1000},
  function(callback) {
    pool.connect(function(err, client, done) {
      if (err) {
        console.error("Waiting for db");
      }
      callback(err, client);
    });
  },
  function(err, client) {
    if (err) {
      return console.error("Giving up");
    }
    console.log("Connected to db");
    getVotes(client);
  }
);

//function getVotes(client) {
function getVotes(client) {
  client.query('SELECT vote as chat, id  FROM votes ㅁ', [], function(err, result) {
    if (err) {
      console.error("Error performing query: " + err);
    } else {
      // var votes = collectVotesFromResult(result);  
      
      chat = collectVotesFromResult(result.rows)

      io.sockets.emit("scores", JSON.stringify(chat));
    }

    setTimeout(function() {getVotes(client) }, 1000);
  });

}
back = []
function collectVotesFromResult(result) {
  
  var newChat = result.filter(function(item) {
    return !back.some(function(backItem) {
      return backItem.id === item.id; // ID를 기준으로 비교
    });
  });
  back = result
  return newChat
}

app.use(cookieParser());
app.use(express.urlencoded());
// app.use(express.static(__dirname + '/views'));

app.get('/', function (req, res) {
  back = []
  res.sendFile(path.resolve(__dirname + '/views/chat.html'));
});

server.listen(port, function () {

  var port = server.address().port;
  console.log('App running on port ' + port);
});

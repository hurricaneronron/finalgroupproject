const express = require("express");
const mongoose = require('mongoose');
const path = require("path");
var bodyparser = require('body-parser');

//socket
const http = require('http')
const socketIO = require("socket.io")
const PORT = process.env.PORT || 3001;
const ioPORT = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);
const io = socketIO(server)

io.on("connection", socket => {
  console.log("Socket is connected...")

  socket.on('update page', (page) => {
    console.log("the value of 'page' = " + page)
    io.sockets.emit('update page', page)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  })
})

server.listen(ioPORT, function() {
  console.log(`🌎 ==> Server now on port ${ioPORT}!`);
});

//end socket
mongoose.connect('mongodb://localhost/myusersDB')

app.use(bodyparser.urlencoded({extended: true}))
app.use(bodyparser.json())
app.use(require('./routes/apiroutes'))

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// Send every request to the React app
// Define any API routes before this runs
app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});
app.listen(PORT, function() {
  console.log(`🌎 ==> Server now on port ${PORT}!`);
});

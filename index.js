const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const clients = {};

io.on("connection", (socket) => {
  // When a new client connects, store their socket id and IP address
  clients[socket.id] = socket.request.connection.remoteAddress;

  socket.on("disconnect", () => {
    // When a client disconnects, remove them from the clients object
    delete clients[socket.id];
  });

  // Send the client their own address
  socket.emit("yourAddress", clients[socket.id]);

  // Send the client the addresses of other clients
  const otherClients = Object.entries(clients)
    .filter(([id, _]) => id !== socket.id)
    .map(([_, address]) => address);

  socket.emit("otherAddresses", otherClients);
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

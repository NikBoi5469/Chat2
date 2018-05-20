/*
  Description: This module will be directly called by the server event handler
               when a socket connection is closed or lost. It can calso be called
               by a client to have the connection severed.
*/

const name = 'disconnect';

exports.run = async (core, server, socket, data) => {
  if (socket.channel) {
    server.broadcast({
      cmd: 'onlineRemove',
      name,
      nick: socket.nick
    }, { channel: socket.channel });
  }

  socket.terminate();
};

exports.info = {
  name,
  description: 'Event handler or force disconnect (if your into that kind of thing)'
};
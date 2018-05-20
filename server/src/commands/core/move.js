/*
  Description: Generates a semi-unique channel name then broadcasts it to each client
*/

const name = 'move';

exports.run = async (core, server, socket, data) => {
  if (server._police.frisk(socket.remoteAddress, 6)) {
    server.reply({
      cmd: 'warn',
      name,
      text: 'You are changing channels too fast. Wait a moment before trying again.'
    }, socket);

    return;
  }

  if (typeof data.channel !== 'string') {
    return;
  }

  if (data.channel === socket.channel) {
    // They are trying to rejoin the channel
    return;
  }

  const currentNick = socket.nick.toLowerCase();
  let userExists = server.findSockets({
    channel: data.channel,
    nick: (targetNick) => targetNick.toLowerCase() === currentNick
  });

  if (userExists.length > 0) {
    // That nickname is already in that channel
    return;
  }

  let peerList = server.findSockets({ channel: socket.channel });

  if (peerList.length > 1) {
    var rmObj = {
      cmd: 'onlineRemove',
      name
    };

    for (let i = 0, l = peerList.length; i < l; i++) {
      rmObj.nick = peerList[i].nick;
      server.reply(rmObj, socket);

      if (socket.nick !== peerList[i].nick) {
        rmObj.nick = socket.nick;
        server.reply(rmObj, peerList[i]);
      }
    }
  }

  let newPeerList = server.findSockets({ channel: data.channel });
  let moveAnnouncement = {
    cmd: 'onlineAdd',
    name,
    nick: socket.nick,
    trip: socket.trip || 'null',
    hash: server.getSocketHash(socket)
  };
  let nicks = [];

  for (let i = 0, l = newPeerList.length; i < l; i++) {
    server.reply(moveAnnouncement, newPeerList[i]);
    nicks.push(newPeerList[i].nick);
  }

  nicks.push(socket.nick);

  server.reply({
    cmd: 'onlineSet',
    name,
    nicks
  }, socket);

  socket.channel = data.channel;
};

exports.requiredData = ['channel'];

exports.info = {
  name,
  usage: `${name} {channel}`,
  description: 'This will change the current channel to the new one provided'
};
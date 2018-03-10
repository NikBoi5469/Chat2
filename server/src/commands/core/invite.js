/*

*/

'use strict';

function verifyNickname(nick) {
	return /^[a-zA-Z0-9_]{1,24}$/.test(nick);
}

exports.run = async (core, server, socket, data) => {
	let targetNick = String(data.nick);

	if (!verifyNickname(targetNick)) {
		// Not a valid nickname? Chances are we won't find them
		return;
	}

	if (targetNick == socket.nick) {
		// TODO: reply with something witty? They invited themself
		return;
	}

	if (server._police.frisk(socket.remoteAddress, 2)) {
		server.reply({
			cmd: 'warn',
			text: 'You are sending invites too fast. Wait a moment before trying again.'
		}, socket);

		return;
	}

	let channel = Math.random().toString(36).substr(2, 8);

	let payload = {
		cmd: 'info',
		text: `${socket.nick} invited you to ?${channel}`
	};
	let inviteSent = server.broadcast( payload, { channel: socket.channel, nick: targetNick });

	if (!inviteSent) {
		server.reply({
			cmd: 'warn',
			text: 'Could not find user in channel'
		}, socket);

		return;
	}

	server.reply({
		cmd: 'info',
		text: `You invited ${targetNick} to ?${channel}`
	}, socket);

	core.managers.stats.increment('invites-sent');
};

exports.requiredData = ['nick'];

exports.info = {
	name: 'invite',
	usage: 'invite {nick}',
	description: 'Generates a unique (more or less) room name and passes it to two clients'
};

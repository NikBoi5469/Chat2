/*

*/

'use strict';

exports.run = async (core, server, socket, data) => {
	if (socket.uType != 'admin') {
		// ignore if not admin
		return;
	}

	let loadResult = core.managers.dynamicImports.reloadDirCache('src/commands');
	loadResult += core.commands.loadCommands();

	if (loadResult == '')
		loadResult = 'Commands reloaded without errors!';

	server.reply({
		cmd: 'info',
		text: loadResult
	}, socket);

	server.broadcast({
		cmd: 'info',
		text: loadResult
	}, { uType: 'mod' });
};

exports.info = {
	name: 'reload',
	usage: 'reload',
	description: '(Re)loads any new commands into memory, outputs errors if any'
};

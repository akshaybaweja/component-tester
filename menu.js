'use strict';
const path = require('path');
const {
	app,
	Menu,
	shell,
	BrowserWindow
} = require('electron');
const {
	is,
	appMenu,
	aboutMenuItem,
	openUrlMenuItem,
	openNewGitHubIssue,
	debugInfo
} = require('electron-util');
const config = require('./config');

const refreshSerialPorts = () => {
	const currentWindow = BrowserWindow.getFocusedWindow();
	currentWindow.webContents.send('refreshSerialPorts');
};

const helpSubmenu = [
	openUrlMenuItem({
		label: 'Website',
		url: 'http://ctester.akshaybaweja.com'
	}),
	openUrlMenuItem({
		label: 'Source Code',
		url: 'https://github.com/akshaybaweja/component-tester'
	}),
	{
		label: 'Report an Issue…',
		click() {
			const body = `
<!-- Please succinctly describe your issue and steps to reproduce it. -->


---

${debugInfo()}`;

			openNewGitHubIssue({
				user: 'akshaybaweja',
				repo: 'component-tester',
				body
			});
		}
	}
];

if (!is.macos) {
	helpSubmenu.push({
		type: 'separator'
	}, aboutMenuItem({
		icon: path.join(__dirname, 'static', 'icon.png'),
		text: 'Designed by Akshay Baweja'
	}));
}

const debugSubmenu = [{
	label: 'Show Settings',
	click() {
		config.openInEditor();
	}
},
{
	label: 'Show App Data',
	click() {
		shell.openItem(app.getPath('userData'));
	}
},
{
	type: 'separator'
},
{
	label: 'Delete Settings',
	click() {
		config.clear();
		app.relaunch();
		app.quit();
	}
},
{
	label: 'Delete App Data',
	click() {
		shell.moveItemToTrash(app.getPath('userData'));
		app.relaunch();
		app.quit();
	}
}];

const macosTemplate = [
	appMenu([openUrlMenuItem({
		label: 'Designed by Akshay Baweja',
		url: 'https://akshaybaweja.com'
	})]),
	{
		role: 'fileMenu',
		submenu: [{
			label: 'Refresh Serial Ports',
			accelerator: 'Command+E',
			click() {
				refreshSerialPorts();
			}
		},
		{
			type: 'separator'
		},
		{
			role: 'close'
		}]
	},
	{
		role: 'windowMenu'
	},
	{
		role: 'help',
		submenu: helpSubmenu
	}
];

// Linux and Windows
const otherTemplate = [{
	role: 'fileMenu',
	submenu: [{
		label: 'Refresh Serial Ports',
		accelerator: 'Control+E',
		click() {
			refreshSerialPorts();
		}
	},
	{
		type: 'separator'
	},
	openUrlMenuItem({
		label: 'Designed by Akshay Baweja',
		url: 'https://akshaybaweja.com'
	}),
	{
		type: 'separator'
	},
	{
		role: 'quit'
	}]
},
{
	role: 'help',
	submenu: helpSubmenu
}];

const template = process.platform === 'darwin' ? macosTemplate : otherTemplate;

if (is.development) {
	template.push({
		label: 'Debug',
		submenu: debugSubmenu
	});
}

module.exports = Menu.buildFromTemplate(template);

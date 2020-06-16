'use strict';
const path = require('path');
const {
	app,
	BrowserWindow,
	Menu,
	ipcMain,
	Notification,
	TouchBar
} = require('electron');

// Uncomment before publishing
// const {autoUpdater} = require('electron-updater');

const {
	is
} = require('electron-util');
const unhandled = require('electron-unhandled');
const debug = require('electron-debug');
const contextMenu = require('electron-context-menu');
const config = require('./config');
const menu = require('./menu');
const packageJson = require('./package.json');

// Serial Port Require
const serialport = require('serialport');

unhandled();
debug();
contextMenu();

app.setAppUserModelId(packageJson.build.appId);

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, TWENTY_FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow;
let port;

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar
const initTest = () => {
	console.log("Test karlo fraaaaaaaand")
}

// TouchBar Test Button
const testTouchbarButton = new TouchBarButton({
	label: "Begin Test",
	click: initTest,
	enabled: true,
})

const componentName = new TouchBarLabel({
	label: "Capacitor",
	textColor: "#FFFF00"
})

const componentValue = new TouchBarLabel({
	label: "100nF",
	textColor: "#FFFFFF"
})

const componetInfo = new TouchBarLabel({
	label: "1 -||- 2",
	textColor: "#aad576"
})

const touchBar = new TouchBar({
	items: [
		new TouchBarSpacer({ size: 'small' }),
		testTouchbarButton,
		new TouchBarSpacer({ size: 'large' }),
		componentName,
		new TouchBarSpacer({ size: 'small' }),
		componentValue,
		new TouchBarSpacer({ size: 'small' }),
		componetInfo
	]
})

const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		show: false,
		fullscreen: true,
		minHeight: 800,
		minWidth: 800,
		webPreferences: {
			nodeIntegration: true,
			devTools: true,
			scrollBounce: true
		}
	});

	win.on('ready-to-show', () => {
		win.show();
	});

	win.on('closed', () => {
		// Dereference the window
		// For multiple windows store them in an array
		mainWindow = undefined;
	});

	await win.loadFile(path.join(__dirname, 'index.html'));
	win.setTouchBar(touchBar);
	return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}
		mainWindow.show();
	}
});

app.on('window-all-closed', () => {
	if (!is.macos) {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

(async () => {
	await app.whenReady();
	Menu.setApplicationMenu(menu);
	mainWindow = await createMainWindow();

	serialport.list().then(data => {
		let noPortDetected = new Notification({
			title: "No Device Detected",
			body: "Connect your device and try again"
		})
		if (data.length === 0) {
			console.error('No ports discovered')
			noPortDetected.show();
		}
		for (let i = 0; i < data.length; i++) {
			mainWindow.webContents.send('newPortName', data[i].path);
		}
	});
})();

ipcMain.on('selectedportName', (event, arg) => {
	if (arg != 'Select Serial Port') {
		port = new serialport(arg, {
			baudRate: 9600
		})
		port.on('error', (err) => {
			let serialPortError = new Notification({
				title: "Serial Port Error",
				body: err.message
			})
			serialPortError.show();
			console.error('Error: ', err.message)
		})
		port.on('data', (data) => {
			console.log('Data:', data)
		})
	} else {
		if (port.isOpen) {
			port.close();
		}
		port = undefined
	}
})

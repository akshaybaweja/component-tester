'use strict';
const path = require('path');
const {
	app,
	BrowserWindow,
	Menu,
	ipcMain,
	Notification,
	TouchBar,
	screen
} = require('electron');

// Uncomment before publishing
const {autoUpdater} = require('electron-updater');

const {
	is
} = require('electron-util');
const unhandled = require('electron-unhandled');
const debug = require('electron-debug');
const contextMenu = require('electron-context-menu');
const config = require('./config');
const menu = require('./menu');

// Serial Port Require
const SerialPort = require('serialport');

unhandled();
debug();
contextMenu();

const appId = 'com.akshaybaweja.ctester';
app.setAppUserModelId(appId);

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
if (!is.development) {
	const FOUR_HOURS = 1000 * 60 * 60 * 4;
	setInterval(() => {
		autoUpdater.checkForUpdates();
	}, FOUR_HOURS);

	autoUpdater.checkForUpdates();
}

// Prevent window from being garbage collected
let mainWindow;
let port;
let componentID = null;
let probeColors = [null, null, null];

// Touchbar Support
const {
	TouchBarLabel,
	TouchBarButton,
	TouchBarSpacer
} = TouchBar;

// TouchBar Test Button
const touchbarTestButton = new TouchBarButton({
	label: 'TEST',
	click: beginTest,
	backgroundColor: '#FFFFF'
});

const touchbarTurnOffTester = new TouchBarButton({
	label: 'Switch OFF',
	click: switchOFFtester
});

const touchbarComponentName = new TouchBarLabel({
	label: 'Select a Serial Port to begin',
	textColor: '#FFFF00'
});

const touchbarComponentValue = new TouchBarLabel({
	label: '',
	textColor: '#FFFFFF'
});

const touchbarComponetInfo = new TouchBarLabel({
	label: '',
	textColor: '#FFFFFF'
});

const touchbarVersionInfo = new TouchBarLabel({
	label: 'v0.0.0',
	textColor: '#F0F0F0'
});

const preTouchBar = new TouchBar({
	escapeItem: touchbarComponentName
});

const touchBar = new TouchBar({
	items: [
		touchbarTestButton,
		new TouchBarSpacer({
			size: 'small'
		}),
		touchbarComponentName,
		new TouchBarSpacer({
			size: 'small'
		}),
		touchbarComponentValue,
		new TouchBarSpacer({
			size: 'small'
		}),
		touchbarComponetInfo,
		new TouchBarSpacer({
			size: 'flexible'
		}),
		touchbarTurnOffTester
	],
	escapeItem: touchbarVersionInfo
});

const communicate = async portCommand => {
	return new Promise(resolve => {
		let bufferData = null;
		port.write('\n\r' + portCommand + '\r\n');
		port.once('data', data => {
			bufferData = Buffer.from(data).toString();
			port.flush();
			resolve(bufferData.trim());
		});
	});
};

const setPinout = async () => {
	await communicate(config.get('serialCommands.getPinout')).then(result => {
		result = result.split('').map(pin => {
			switch (pin) {
				case 'A':
					return 'Anode(+)';
				case 'C':
					return (componentID === '20' ? 'Cathode(-)' : 'Collector');
				case 'E':
					return 'Emitter';
				case 'B':
					return 'Base';
				case 'G':
					return 'Gate';
				case 'S':
					return 'Source';
				case 'D':
					return 'Drain';
				case 'x':
					return 'ACTIVE';
				case '1':
					return (componentID === '33' ? 'MT1' : 'B1');
				case '2':
					return (componentID === '33' ? 'MT2' : 'B2');
				case '-':
					return '';
				default: return null;
			}
		});

		const probeIcons = probeColors.map(color => {
			switch (color) {
				case 'R':
					return '🔴';
				case 'G':
					return '🟢';
				case 'B':
					return '⚫️';
				case 'Y':
					return '🟡';
				case 'W':
					return '⚪️';
				default:
					return '⚠️';
			}
		});

		const probeHexCodes = probeColors.map(color => {
			switch (color) {
				case 'R':
					return '#FF0000';
				case 'G':
					return '#55a630';
				case 'B':
					return '#212529';
				case 'Y':
					return '#ffd23f';
				case 'W':
					return '#fffcf2';
				default:
					return '#98c1d9';
			}
		});

		let pinout = '';
		const htmlPinout = [null, null, null];
		let flag = false;

		switch (componentID) {
			case '10':
			case '11':
			case '12':
				probeIcons.forEach((probe, index) => {
					if (result[index] === 'ACTIVE') {
						htmlPinout[index] = {
							text: result[index],
							hexCode: probeHexCodes[index],
							open: false
						};
						pinout += probe;

						if (flag === false) {
							pinout += ' ' + config.get('components')[componentID].symbol + ' ';
							flag = true;
						}
					} else {
						htmlPinout[index] = {
							text: '',
							hexCode: probeHexCodes[index],
							open: true
						};
					}
				});
				break;
			case '20':
				probeIcons.forEach((probe, index) => {
					if (result[index] === '') {
						htmlPinout[index] = {
							text: '',
							hexCode: probeHexCodes[index],
							open: true
						};
					} else {
						pinout += probe + ' ' + result[index] + '  ';
						htmlPinout[index] = {
							text: result[index],
							hexCode: probeHexCodes[index],
							open: false
						};
					}
				});
				break;
			default:
				probeIcons.forEach((probe, index) => {
					pinout += probe + result[index] + ' ';
					htmlPinout[index] = {
						text: result[index],
						hexCode: probeHexCodes[index],
						open: false
					};
				});
		}

		touchbarComponetInfo.label = pinout;
		mainWindow.webContents.send('setPinout', htmlPinout);
	});
};

const getProperties = async serialCommands => {
	await setPinout();
	if (serialCommands !== undefined) {
		for (const serialCommand of serialCommands) {
			// eslint-disable-next-line no-await-in-loop
			await communicate(serialCommand.command).then(result => {
				if (result !== 'N/A' && result !== 'ERR') {
					result = result.replace(/R$/, 'Ω');
				}

				if (serialCommand.description === 'VALUE') {
					touchbarComponentValue.label = result;
					mainWindow.webContents.send('componentValue', result);
				} else if (serialCommand.description === 'TYPE') {
					if (componentID === '31') {
						mainWindow.webContents.send('componentName', result);
						touchbarComponentName.label = result;
					} else {
						mainWindow.webContents.send('addComponentType', result);
						touchbarComponentName.label = touchbarComponentName.label + ' ' + result;
					}
				} else if (serialCommand.main) {
					touchbarComponentValue.label = serialCommand.description + ' ' + result;
					mainWindow.webContents.send('componentValue', result);
					mainWindow.webContents.send('componentValueLabel', serialCommand.description);
				} else if (result !== 'N/A' && result !== 'ERR') {
					mainWindow.send('addParameter', serialCommand.description, result);
				}
			});
		}
	}
};

const updateComponentNames = componentName => {
	touchbarComponentName.label = componentName;
	mainWindow.webContents.send('componentName', componentName);
};

const resetFields = () => {
	mainWindow.webContents.send('disableComponentValueLabel');
	mainWindow.webContents.send('componentName', '');
	mainWindow.webContents.send('componentValue', '');

	touchbarComponentName.label = '';
	touchbarComponentValue.label = '';
	touchbarComponetInfo.label = '';

	mainWindow.webContents.send('resetParaBoxes');
	mainWindow.webContents.send('resetPinout');
};

function beginTest() {
	touchbarTestButton.label = 'Testing...';
	mainWindow.webContents.send('setTestButtonText', 'T E S T I N G . . .');
	mainWindow.webContents.send('disableTestButton');
	resetFields();

	communicate(config.get('serialCommands.beginTest'))
		.then(serialData => {
			if (serialData === 'OK') {
				touchbarTestButton.label = 'Test Again';
				mainWindow.webContents.send('setTestButtonText', 'T E S T  ↺');
				mainWindow.webContents.send('enableTestButton');
				mainWindow.webContents.send('showInfoBox');

				communicate(config.get('serialCommands.getComponent'))
					.then(componentType => {
						componentID = componentType;
						updateComponentNames(config.get('components')[componentType].name);
						if (componentType !== '0') {
							getProperties(config.get('components')[componentType].serialCommands);
						}
					});
			} else if (serialData === 'ERR') {
				const testError = new Notification({
					title: 'Error testing Component',
					body: 'Try disconnecting and reconnecting the device.'
				});
				testError.show();
			}
		});
}

function switchOFFtester() {
	if (port.isOpen) {
		port.close();
	}
}

let w = 800;
let h = 600;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		show: false,
		minWidth: 800,
		minHeight: 600,
		width: w,
		height: h,
		webPreferences: {
			nodeIntegration: true,
			devTools: false,
			scrollBounce: true
		},
		minimizable: true,
		fullscreenable: true,
		titleBarStyle: 'hiddenInset'
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
	win.setTouchBar(preTouchBar);
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

const populateSerialPorts = () => {
	SerialPort.list().then(ports => {
		const noPortDetected = new Notification({
			title: 'No Device Detected',
			body: 'Connect your device and try again'
		});

		if (ports.length === 0) {
			noPortDetected.show();
		}

		for (port of ports) {
			mainWindow.webContents.send('newPortName', port.path);
		}
	});
};

(async () => {
	await app.whenReady().then(() => {
		w = screen.getPrimaryDisplay().workAreaSize.width;
		h = screen.getPrimaryDisplay().workAreaSize.height;
	});
	Menu.setApplicationMenu(menu);
	mainWindow = await createMainWindow();
	mainWindow.webContents.send('swVersion', app.getVersion());
	populateSerialPorts();
})();

ipcMain.on('selectedportName', (_, arg) => {
	if (arg !== 'Select Serial Port') {
		port = new SerialPort(arg, {
			baudRate: 9600,
			parser: new SerialPort.parsers.Readline(),
			autoOpen: false
		});

		port.on('error', err => {
			const serialPortError = new Notification({
				title: 'Serial Port Error',
				body: err.message
			});
			serialPortError.show();
		});

		port.open();
		port.on('open', () => {
			touchbarComponentName.label = '';
			mainWindow.setTouchBar(touchBar);
			mainWindow.webContents.send('showTestButton');
		});

		port.on('close', () => {
			app.relaunch();
			app.exit();
		});

		communicate(config.get('serialCommands.getVersion'))
			.then(getVersion => {
				mainWindow.webContents.send('version', getVersion);
				touchbarVersionInfo.label = getVersion;

				communicate(config.get('serialCommands.getProbeColors'))
					.then(result => {
						probeColors = result.split('');
					});
			});
	}
});

ipcMain.on('beginTest', () => {
	beginTest();
});

ipcMain.on('reloadSerialPorts', () => {
	populateSerialPorts();
});

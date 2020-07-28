const ipc = require('electron').ipcRenderer;
const option = document.querySelector('#serial-port-list');
const testButton = document.querySelector('#testButton');
const infoBox = document.querySelector('.main');
const componentName = document.querySelector('#component-name');
const switchOffButton = document.querySelector('#switchOffButton');
const testBtnGrp = document.querySelector('.testButtonGroup');

// Calls to Backend
option.addEventListener('change', () => {
	ipc.send('selectedportName', option.value);
});

testButton.addEventListener('click', () => {
	ipc.send('beginTest');
});

switchOffButton.addEventListener('click', () => {
	ipc.send('switchOffTester');
});

// Calls from Backend
ipc.on('newPortName', (_, arg) => {
	option.append(new Option(arg, arg));
});

ipc.on('version', (_, arg) => {
	document.querySelector('#version-number').innerHTML = arg;
});

ipc.on('swVersion', (_, arg) => {
	document.querySelector('#sw-version').innerHTML = arg;
});

ipc.on('componentName', (_, arg) => {
	componentName.innerHTML = arg;
});

ipc.on('addComponentType', (_, arg) => {
	componentName.innerHTML = componentName.innerHTML + ' ' + arg;
});

ipc.on('componentValue', (_, arg) => {
	document.querySelector('#component-value').innerHTML = arg;
});

ipc.on('componentValueLabel', (_, arg) => {
	document.querySelector('#component-value-label').style.display = 'block';
	document.querySelector('#component-value-label').innerHTML = arg;
});

ipc.on('disableComponentValueLabel', () => {
	document.querySelector('#component-value-label').style.display = 'none';
});

ipc.on('showTestButton', () => {
	testBtnGrp.style.visibility = 'visible';
});

ipc.on('hideTestButton', () => {
	testBtnGrp.style.visibility = 'hidden';
});

ipc.on('setTestButtonText', (_, arg) => {
	testButton.textContent = arg;
});

ipc.on('disableTestButton', () => {
	testButton.disabled = true;
	switchOffButton.disabled = true;
});

ipc.on('enableTestButton', () => {
	testButton.disabled = false;
	switchOffButton.disabled = false;
});

ipc.on('showInfoBox', () => {
	infoBox.style.visibility = 'visible';
});

ipc.on('hideInfoBox', () => {
	infoBox.style.visibility = 'hidden';
});

ipc.on('addParameter', (_, name, value) => {
	document.querySelector('.otherInfo').style.display = 'block';
	let flag = false;
	document.querySelectorAll('.badges .info').forEach(node => {
		if (node.style.display === 'none' && !flag) {
			node.style.display = 'inline';
			node.innerHTML = name + ' ' + value;
			flag = true;
		}
	});
});

ipc.on('resetParaBoxes', () => {
	document.querySelectorAll('.info').forEach(node => {
		node.innerHTML = '';
		node.style.display = 'none';
	});
	document.querySelector('.otherInfo').style.display = 'none';
});

ipc.on('resetParaBoxes', () => {
	document.querySelectorAll('.info').forEach(node => {
		node.innerHTML = '';
		node.style.display = 'none';
	});
	document.querySelector('.otherInfo').style.display = 'none';
});

ipc.on('setPinout', (_, pins) => {
	document.querySelector('.pinout').style.display = 'block';
	pins.forEach((pin, index) => {
		document.querySelector('#pin' + (index + 1) + '_base').style.fill = pin.hexCode;
		document.querySelector('#pin' + (index + 1) + '_text').textContent = pin.text;
		if (!pin.open) {
			document.querySelector('#pin' + (index + 1) + '_open').style.display = 'none';
		}
	});
});

ipc.on('resetPinout', () => {
	document.querySelector('.pinout').style.display = 'none';
	[0, 1, 2].forEach((_pin, index) => {
		document.querySelector('#pin' + (index + 1) + '_base').style.fill = '#f7f7f9';
		document.querySelector('#pin' + (index + 1) + '_text').textContent = '';
		document.querySelector('#pin' + (index + 1) + '_open').style.display = 'inline';
	});
});

ipc.on('refreshSerialPorts', () => {
	while (option.length > 1) {
		option.remove(option.length - 1);
	}

	ipc.send('reloadSerialPorts');
});

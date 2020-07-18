'use strict';
const Store = require('electron-store');

module.exports = new Store({
	defaults: {
		serialCommands: {
			getVersion: 'VER',
			beginTest: 'PROBE',
			getComponent: 'COMP',
			turnOFFTester: 'OFF',
			getComponentQty: 'QTY',
			getPinout: 'PIN',
			getProbeColors: 'PROBE_ID'
		},
		components: {
			0: {
				name: 'NO, UNKNOWN or DAMAGED PART'
			},
			10: {
				name: 'RESISTOR',
				serialCommands: [{
					command: 'R',
					description: 'VALUE'
				}],
				symbol: '⏤[          ]⏤'
			},
			11: {
				name: 'CAPACITOR',
				serialCommands: [{
					command: 'C',
					description: 'VALUE'
				}, {
					command: 'ESR',
					description: 'Equivalent Series Resistance'
				}],
				symbol: '⏤||⏤'
			},
			12: {
				name: 'INDUCTOR',
				serialCommands: [{
					command: 'L',
					description: 'VALUE'
				}],
				symbol: '⏤oooo⏤'
			},
			20: {
				name: 'DIODE',
				serialCommands: [{
					command: 'V_F',
					description: 'Forward Voltage',
					main: true
				}, {
					command: 'C_D',
					description: 'Diode Capacitance'
				}, {
					command: 'I_R',
					description: 'Reverse Current'
				}]
			},
			30: {
				name: 'BJT',
				serialCommands: [{
					command: 'TYPE',
					description: 'TYPE'
				}, {
					command: 'h_FE',
					description: 'Gain',
					main: true
				}, {
					command: 'V_BE',
					description: 'Base-Emitter Voltage'
				}, {
					command: 'I_CEO',
					description: 'Collector Current'
				}]
			},
			31: {
				name: 'FET',
				serialCommands: [{
					command: 'TYPE',
					description: 'TYPE'
				}, {
					command: 'V_TH',
					description: 'Threshold Voltage',
					main: true
				}, {
					command: 'C_GS',
					description: 'Gate-Source Capacitance'
				}, {
					command: 'I_DSS',
					description: 'Drain Current'
				}, {
					command: 'R_DS',
					description: 'Drain-Source Resistance'
				}, {
					command: 'V_F',
					description: 'Forward Voltage'
				}]
			},
			32: {
				name: 'IGBT',
				serialCommands: [{
					command: 'TYPE',
					description: 'TYPE'
				}, {
					command: 'C_GE',
					description: 'Gate-Emitter Capacitance'
				}, {
					command: 'V_F',
					description: 'Forward Voltage',
					main: true
				}]
			},
			33: {
				name: 'TRIAC',
				serialCommands: [{
					command: 'V_GT',
					description: 'Gate Trigger Voltage',
					main: true
				}]
			},
			34: {
				name: 'THYRISTOR',
				serialCommands: [{
					command: 'V_GT',
					description: 'Gate Trigger Voltage',
					main: true
				}]
			},
			35: {
				name: 'PUT',
				serialCommands: [{
					command: 'V_T',
					description: 'ON-State Voltage',
					main: true
				}, {
					command: 'V_F',
					description: 'Forward Voltage'
				}]
			},
			36: {
				name: 'UJT',
				serialCommands: [{
					command: 'V_GT',
					description: 'Gate Trigger Voltage',
					main: true
				}]
			}
		}
	}
});

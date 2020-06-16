const ipc = require('electron').ipcRenderer;
const option = document.getElementById('serial-port-list');

ipc.on("newPortName", (event, arg) => {
	option.appendChild(new Option(arg, arg))
})

option.addEventListener("change", () => {
	ipc.send('selectedportName', option.value)
})

const {ipcRenderer, shell} = require('electron')
const app = require('electron').remote.app
const nedb = require('nedb')
const path = require('path')
const db = new nedb({ filename: path.join(app.getPath('userData'), 'preferences.db') });
db.loadDatabase()

const apiKey = document.getElementById("apiKey")
const time = document.getElementById("time")
const form = document.getElementById("form")
const link = document.getElementById("attribution")

document.body.onload = () => {
	updateSettings()
};

link.onclick = function(event) {
  shell.openExternal(event.target.href)
  return false
}

form.onsubmit = function(event) {
	apiKey.blur()
	time.blur()
  db.update({ name: 'Settings'}, { $set: {apiKey: apiKey.value, time: time.value} }, { upsert: true }, () => {
    ipcRenderer.send('preferences', true)
  });
	return false
}

function updateSettings() {
  db.find({ name: 'Settings' }, (err, docs) => {
    apiKey.value = docs[0].apiKey;
    time.value = docs[0].time;
  });
}

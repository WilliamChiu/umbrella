const request = require('request')
const Forecast = require('forecast')
const schedule = require('node-schedule')

const {ipcRenderer} = require('electron')
const app = require('electron').remote.app
const nedb = require('nedb')
const path = require('path')
const db = new nedb({ filename: path.join(app.getPath('userData'), 'preferences.db') })
db.loadDatabase()

var forecast
var coords
var time
var apiKey
var job

updateSettings()

ipcRenderer.on('update', (preferences) => {
	db.loadDatabase()
	updateSettings()
})

function updateSettings() {
  db.find({ name: 'Settings' }, (err, docs) => {
  	console.log(docs)
    if (docs[0] && docs[0].time && docs[0].apiKey) {
    	time = docs[0].time.split(":")
    	apiKey = docs[0].apiKey
	    forecast = new Forecast({
		  service: 'darksky',
		  key: apiKey
		})
		if (!job) {
			job = schedule.scheduleJob({hour: time[0], minute: time[1]}, function(){
				// Initialize 
				forecast.get(coords, (err, weather) => {
					let title = weather.currently.precipProbability > 0.2 ? 'Umbrella' : 'No Umbrella'
					new Notification(title)
				})
			})
		}
		else {
			job.reschedule({hour: time[0], minute: time[1]}, function(){
				// Initialize 
				forecast.get(coords, (err, weather) => {
					let title = weather.currently.precipProbability > 0.2 ? 'Umbrella' : 'No Umbrella'
					new Notification(title)
				})
			})
		}
	}
	else {
		new Notification('Hi! Welcome to Umbrella.', {body: 'Please adjust your preferences.'})
	}
  })
}

request.get('http://freegeoip.net/json/', function(err, res, data) { 
    data = JSON.parse(data)
    coords = [data.latitude, data.longitude]
})
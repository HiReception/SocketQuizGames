var ReactDOM = require("react-dom");
var React = require("react");
var socket = require("socket.io-client")();
var soundManager = require("soundmanager2").soundManager;

import DisplayContainer from "./display/display-container";

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return "";
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

socket.on("connect_timeout", function() {
	console.log("connection timeout");
});

socket.on("connect", function() {
	console.log("connected");
	socket.emit("display request", {
		gameCode: getParameterByName("gamecode")
	});
});

socket.on("connect_error", function(err) {
	console.log("connection error: " + err);
});




socket.on("accepted", function() {
	ReactDOM.render(<DisplayContainer socket={socket}/>, document.getElementById("display-panel"));

	soundManager.setup({

		onready: function() {
			// SM2 has loaded, API ready to use e.g., createSound() etc.
		},

		ontimeout: function() {
			// Uh-oh. No HTML5 support, SWF missing, Flash blocked or other issue
		}

	});
	// pre-question: pre-question ambience
	// read-question: question-reading background
	// start-clock: three hits
	// clock-bed: think music
	// end-clock-early: end sound of think music
	// order-bed: order-revealing background
	// answer1: 1st answer
	// answer2: 2nd answer
	// answer3: 3rd answer
	// answer4: 4th answer
	// light-answer: single/double answer reveal ($100-1,000 win)
	// correct-reveal: show correct players sound
	// fastest-reveal: fastest reveal cue ($32,000 win)
	//soundManager.createSound({id: "final-think", url: "./sounds/finalThink.mp3", autoLoad: true});
	//soundManager.createSound({id: "daily-double", url: "./sounds/dailyDouble.wav", autoLoad: true});
	//soundManager.createSound({id: "final-reveal", url: "./sounds/finalReveal.wav", autoLoad: true});
});

socket.on("play sound", function(id) {
	soundManager.play(id);
});
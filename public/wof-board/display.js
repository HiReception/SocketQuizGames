var React = require("react");
var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var soundManager = require("soundmanager2").soundManager;

import DisplayContainer from './display/display-container';

var wheelTurnInterval = 50;

var relativePointerArray = [35, 0, -35];


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
	// TODO
	console.log("connection timeout");
});

socket.on("connect", function() {
	socket.emit("display request", {
		gameCode: getParameterByName("gamecode")
	});
});

socket.on("connect_error", function(err) {
	// TODO
	console.log("connection error: " + err);
});


socket.on("accepted", function() {
	ReactDOM.render((
		<DisplayContainer
			wheelTurnInterval={wheelTurnInterval}
			relativePointerArray={relativePointerArray}
			socket={socket}
			soundManager={soundManager}/>
	), document.getElementById("display-panel"));

	soundManager.setup({

		onready: function() {
			// SM2 has loaded, API ready to use e.g., createSound() etc.
		},

		ontimeout: function() {
			// Uh-oh. No HTML5 support, SWF missing, Flash blocked or other issue
		}



	});

	soundManager.createSound({id: "ding", url: "./sounds/ding.wav", autoLoad: true});
	soundManager.createSound({id: "buzzer", url: "./sounds/buzzer.mp3", autoLoad: true});
	soundManager.createSound({id: "showPuzzle", url: "./sounds/showPuzzle.wav", autoLoad: true});
	soundManager.createSound({id: "bonusThink", url: "./sounds/bonusThink.wav", autoLoad: true});
	soundManager.createSound({id: "backgroundBed", url: "./sounds/backgroundBed.mp3", autoLoad: true, volume: 50, onfinish: () => {
		soundManager.play("backgroundBed");
	}});
	soundManager.createSound({id: "solvePuzzle", url: "./sounds/solvePuzzle.mp3", autoLoad: true, onfinish: () => {
		soundManager.play("backgroundBed");
	}})
	soundManager.createSound({id: "bankrupt", url: "./sounds/bankrupt.mp3", autoLoad: true});
	soundManager.createSound({id: "loseATurn", url: "./sounds/loseATurn.wav", autoLoad: true});
	soundManager.createSound({id: "noConsonants", url: "./sounds/noConsonants.mp3", autoLoad: true});
	soundManager.createSound({id: "topDollar", url: "./sounds/topDollar.mp3", autoLoad: true});
	soundManager.createSound({id: "click", url: "./sounds/click.wav", autoLoad: true});


});

socket.on("play sound", function(id) {
	soundManager.play(id);
});

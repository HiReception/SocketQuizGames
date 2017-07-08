var React = require("react");
var ReactDOM = require("react-dom");
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


socket.emit("display request", {
	gameCode: getParameterByName("gamecode")
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

	soundManager.createSound({id: "buzz-in", url: "./sounds/buzzin.wav", autoLoad: true});
	soundManager.createSound({id: "correct", url: "./sounds/correct.wav", autoLoad: true});
	soundManager.createSound({id: "incorrect", url: "./sounds/incorrect.wav", autoLoad: true});
});

socket.on("play sound", function(id) {
	soundManager.play(id);
});



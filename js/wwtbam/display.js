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


var clockInterruptible = false;

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
	soundManager.createSound({id: "explainff", url: "./sounds/classic/explainff.mp3", autoLoad: true, onplay: function() {
		soundManager.stop("order-bed");
	}});
	soundManager.createSound({id: "read-question", url: "./sounds/classic/read-question.mp3", autoLoad: true, onplay: function() {
		soundManager.stop("explainff");
	}});
	soundManager.createSound({id: "start-clock", url: "./sounds/classic/start-clock.mp3", autoLoad: true});
	soundManager.createSound({id: "clock-bed", url: "./sounds/classic/clock-bed.mp3", autoLoad: true, onplay: function() {
		soundManager.stop("read-question");
		clockInterruptible = true;
		console.log("clock now interruptible");
		setTimeout(() => {
			clockInterruptible = false;
			console.log("clock no longer interruptible");
		}, 20000);
	}});

	soundManager.createSound({id: "end-clock-early", url: "./sounds/classic/end-clock-early.mp3", autoLoad: true, onplay: function() {
		soundManager.stop("clock-bed");
	}});
	soundManager.createSound({id: "order-bed", url: "./sounds/classic/order-bed.mp3", autoLoad: true});
	soundManager.createSound({id: "answer1", url: "./sounds/classic/answer1.mp3", autoLoad: true});
	soundManager.createSound({id: "answer2", url: "./sounds/classic/answer2.mp3", autoLoad: true});
	soundManager.createSound({id: "answer3", url: "./sounds/classic/answer3.mp3", autoLoad: true});
	soundManager.createSound({id: "answer4", url: "./sounds/classic/answer4.mp3", autoLoad: true});
	soundManager.createSound({id: "light-answer", url: "./sounds/classic/light-answer.mp3", autoLoad: true});
	soundManager.createSound({id: "correct-reveal", url: "./sounds/classic/correct-reveal.mp3", autoLoad: true, onplay: function() {
		soundManager.stop("order-bed");
	}});
	soundManager.createSound({id: "fastest-reveal", url: "./sounds/classic/fastest-reveal.mp3", autoLoad: true});
});

socket.on("play sound", function(id) {
	if (!(id === "end-clock-early" && !clockInterruptible)) {
		soundManager.play(id);
	}
});
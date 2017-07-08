var React = require("react");
var ReactDOM = require("react-dom");
var PropTypes = require("prop-types");
var socket = require("socket.io-client")();
var $ = require("jquery");
import HostPanel from "./host/host-panel";


function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return "";
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const playerColours = ["#EB0C29", "#FF8400", "#007A21", "#00FF44", "#870096", "#1F2DF0", "#05ABE3", "#E305DF"];

function shuffle(a) {
	var j, x, i;
	for (i = a.length; i; i--) {
		j = Math.floor(Math.random() * i);
		x = a[i - 1];
		a[i - 1] = a[j];
		a[j] = x;
	}
}


var gameCode = getParameterByName("gamecode");

socket.on("connect_timeout", function() {
	// TODO
	console.log("connection timeout");
});

socket.on("connect", function() {
	socket.emit("host request", {
		gameCode: gameCode,
	});
});

socket.on("connect_error", function(err) {
	// TODO
	console.log("connection error: " + err);
});

socket.on("game details", function(details) {
	socket.emit("send question", {
		type: "buzz-in",
		open: true
	});

	var state;
	if ($.isEmptyObject(details.gameState)) {
		shuffle(playerColours);
		state = {
			players: [],
			detailPlayerName: "",
			playerAnswering: {},
			buzzersOpen: false,
			playerColours: playerColours,
		};
		socket.emit("set state", state);
	} else {
		state = details.gameState;
	}
	ReactDOM.render((
		<HostPanel
			gameCode={details.gameCode}
			gameTitle={details.gameTitle}
			receivedState={state}
			socket={socket}/>
	), document.getElementById("host-panel"));
});
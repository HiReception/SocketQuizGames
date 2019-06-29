var React = require("react");
var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var $ = require("jquery");
import PlayerPanel from "./player/player-panel.js";

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	
	if (!results[2]) return "";

	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
	
var gameCode = getParameterByName("gamecode");
var screenName = getParameterByName("name");


// TODO add back button to header bar
// TODO add Page button to header bar, to get attention of host

socket.on("connect_timeout", function() {
	console.log("connection timeout");
});

socket.on("connect", function() {
	socket.emit("join request", {
		screenName: screenName,
		gameCode: gameCode,
	});
});

socket.on("connect_error", function(err) {
	console.log("connection error: " + err);
});

socket.on("accepted", function({state, id}) {
	console.log("state received:");
	console.log(state);
	$("#header-bar").text(screenName);
	ReactDOM.render(<PlayerPanel id={id} receivedState={state} socket={socket}/>, document.getElementById("question-window"));
});
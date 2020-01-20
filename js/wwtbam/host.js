import React from "react";
const ReactDOM = require("react-dom");
const io = require("socket.io-client");
const socket = io();
const $ = require("jquery");

import HostConsole from "./host/host-console";

import initialState from "./initial-state";

const gameCode = getParameterByName("gamecode");


socket.on("connect_timeout", function() {
	console.log("connection timeout");
});

socket.on("connect", function() {
	console.log("connected");
	socket.emit("host request", {
		gameCode: gameCode,
	});
});

socket.on("connect_error", function(err) {
	console.log("connection error: " + err);
});

socket.on("game details", (details) => {
	$("#game-code").text(details.gameCode);
	$("#game-title").text(details.gameTitle);
	let state;
	if ($.isEmptyObject(details.gameState)) {
		state = initialState;
		socket.emit("set state", state);
	} else {
		state = details.gameState;
	}
	ReactDOM.render(<HostConsole receivedState={state} socket={socket}/>,
		document.getElementById("main-panel"));
});

function getParameterByName(name, url) {
	if (!url) {
		url = window.location.href;
	}
	const filteredName = name.replace(/[\[\]]/g, "\\$&");
	const regex = new RegExp(`[?&]${ filteredName }(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);
	if (!results) {
		return null;
	}
	if (!results[2]) {
		return "";
	}
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

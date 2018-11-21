import React from "react";
const ReactDOM = require("react-dom");
const io = require("socket.io-client");
const socket = io();
const $ = require("jquery");


import HostConsole from "./host/host-console";

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
	console.log("Game Details received");
	console.log(details);
	$("#game-code").text(details.gameCode);
	$("#game-title").text(details.gameTitle);
	let state;
	if ($.isEmptyObject(details.gameState)) {
		state = {
			players: [],
			detailPlayerName: "",

			questions: [],
			currentQuestion: 0,
			currentPanel: "NoQuestionPanel",
			newPanelKey: 0,

			questionRecapped: false,
			numAnswersRevealed: 0,
			fullAnswerRevealed: false,

			playerPanelHidden: false,

			correctPlayersRevealed: false,
			fastestCorrectRevealed: false,
			fastestFlashOn: false,

			buzzersPending: false,
			buzzersOpen: false,
			playerStats: [],
		};
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

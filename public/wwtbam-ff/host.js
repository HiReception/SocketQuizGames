import React from "react";
const ReactDOM = require("react-dom");
const io = require("socket.io-client");
const socket = io();
const $ = require("jquery");

const ReactCSSTransitionReplace = require("react-css-transition-replace");
const ReactCSSTransitionGroup = require("react-addons-css-transition-group");

import HostConsole from "./host/host-console";

const gameCode = getParameterByName("gamecode");


socket.emit("host request", {
	gameCode: gameCode,
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

			numAnswersRevealed: 0,
			fullAnswerRevealed: false,

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

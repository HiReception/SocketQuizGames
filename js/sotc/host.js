var React = require("react");
var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var $ = require("jquery");

import HostConsole from "./host/host-console";

var gameCode = getParameterByName("gamecode");




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

socket.on("game details", function(details) {
	console.log("Game Details received");
	console.log(details);
	$("#game-code").text(details.gameCode);
	$("#game-title").text(details.gameTitle);
	var state;
	if ($.isEmptyObject(details.gameState)) {
		state = {
			players: [],
			detailPlayerName: "",

			carryOverChampion: "",
			carryOverPrizes: [],
			carryOverScore: 0,
			carryOverDecisionMade: false,
			carryOverDecisionStaying: false,
			winnersBoardState: [],
			winnersBoardStarted: false,
			winnersBoardCompleted: false,

			currentRound: 0,
			playerAnswering: "",

			items: [],
			currentItemNo: 0,
			currentItemType: "NoQuestionPanel",
			currentItemOver: false,
			newPanelKey: 0,

			prefix: "",
			suffix: "",
			startingScore: 0,
			standardCorrectAmount: 0,
			standardIncorrectAmount: 0,

			// gift shop and cash card related fields
			sellingPrice: 0,
			bonusMoney: 0,
			playerPurchasing: "",
			cashCardSuits: [],
			availableToBuy: true,
			selectedSuit: -1,
			selSuitRevealed: false,
			majorPrizeRevealed: false,
			eligibleToBuy: [],
			
			// fame game related
			lockedOutPlayerNames: [],
			fameGamesCompleted: 0,
			fameGameBoard: [],
			fameGameBoardShowing: false,
			fameGameCurrentSelection: -1,
			fameGameWildCardDecision: -1,
			fameGameMoneyRevealed: false,

			timerStarted: false,
			timeRemaining: 0,

			// fast money related fields
			fmStarted: false,
			fmTimeRemaining: 0,
			fmClockRunning: false,

			bonusPrizes: [],

			buzzersOpen: false,
		};
		socket.emit("set state", state);
	} else {
		state = details.gameState;
	}
	ReactDOM.render(<HostConsole receivedState={state} socket={socket}/>, document.getElementById("main-panel"));
	
});

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return "";
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
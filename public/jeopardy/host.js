var React = require("react");
var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var $ = require("jquery");
var ReactCSSTransitionReplace = require("react-css-transition-replace");
var ReactCSSTransitionGroup = require("react-addons-css-transition-group");

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

			currentRound: 0,
			cluesLeft: 0,
			selectingPlayer: "",
			playerAnswering: {},

			currentPanel: "NoQuestionPanel",
			newPanelKey: 0,

			finalEligiblePlayers: [],

			rounds: [],
			final: {},

			currentCatNo: 0,
			currentClueNo: 0,
			currentClueValue: 0,

			prefix: "",
			suffix: "",

			wrongPlayerNames: [],
			ddWagerEntered: false,
			ddWagerSubmittable: false,
			ddWager: 0,
			buzzersOpen: false,

			finalCategoryVisible: false,
			finalClueVisible: false,
			finalWagers: [],
			finalWageringOpen: false,
			allFinalWagersIn: false,
			finalRespondingOpen: false,
			finalRespondingOver: false,
			finalRespondingTimeRemaining: 30,
			finalResponses: [],
			finalFocusPlayerNumber: 0,
			finalFocusPlayerName: "",
			finalFocusResponse: "",
			finalFocusMode: "response",
			finalFocusCorrect: false,
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
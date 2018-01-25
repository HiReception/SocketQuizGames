var ReactDOM = require("react-dom");
var React = require("react");
var socket = require("socket.io-client")();
var $ = require("jquery");

import HostConsole from "./host/host-console";


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

var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var consonants = "BCDFGHJKLMNPQRSTVWXYZ";
var vowels = "AEIOU";

var bonusRoundConsonants = 5;
var bonusRoundVowels = 1;




socket.on("connect_timeout", function() {
	console.log("connection timeout");
});

socket.on("connect", function() {
	console.log("connected");
	socket.emit("host request", {
		gameCode: gameCode
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
			currentPanel: "NoPuzzlePanel",
			puzzles: [],
			bonus: {},
			wheels: [],
			currentRound: -1,
			spinning: false,
			spinCount: 0,
			spinRotation: 0,
			spinTime: 0,
			wheelAngle: 0,
			relativePointerArray: [35, 0, -35],

			currentBoard: [],
			usedLetters: "",
			lastLetterCalled: "",
			numberOfMatchesLast: 0,
			currentPuzzleSolved: false,
			currentFinalBoard: [],
			currentAnswer: "",
			currentCategory: "",
			uncalledConsonantsInPuzzle: "",

			bonusConsonantsLeft: bonusRoundConsonants,
			bonusVowelsLeft: bonusRoundVowels,
			selectedLetters: [],
			bonusAnswerRevealed: false,
			bonusSecondsRemaining: 10,
			bonusClockStarted: false,

			players: [{
				totalScore: 0,
				roundScore: 0,
				colour: "#ff0000"
			},{
				totalScore: 0,
				roundScore: 0,
				colour: "#ffff00"
			},{
				totalScore: 0,
				roundScore: 0,
				colour: "#0000ff"
			}],
			currentPlayer: 0,
			selectingConsonant: false
		};
		socket.emit("set state", state);
	} else {
		state = details.gameState;
	}
	ReactDOM.render((
		<HostConsole
			receivedState={state}
			socket={socket}
			letters={letters}
			consonants={consonants}
			vowels={vowels}/>
	), document.getElementById("question-panel"));
	
});
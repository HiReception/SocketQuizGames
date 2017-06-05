var React = require("react");
var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var $ = require("jquery");


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
			wheelAngle: 0,

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
	ReactDOM.render(<HostConsole receivedState={state}/>, document.getElementById("question-panel"));
	
});

class HostConsole extends React.Component {
	constructor(props) {
		super(props);
		this.state = props.receivedState;

		this.render = this.render.bind(this);
		this.changeCurrentPanel = this.changeCurrentPanel.bind(this);
		this.goToNextRound = this.goToNextRound.bind(this);
		this.setGameData = this.setGameData.bind(this);
		this.setGameState = this.setGameState.bind(this);
		this.receiveNewState = this.receiveNewState.bind(this);
		this.goToNextPlayer = this.goToNextPlayer.bind(this);
		this.setPlayerRoundScore = this.setPlayerRoundScore.bind(this);
		this.setPlayerTotalScore = this.setPlayerTotalScore.bind(this);
	}

	changeCurrentPanel(panelName) {
		this.setGameState({
			currentPanel: panelName,
			newPanelKey: this.state.newPanelKey + 1
		});
	}

	goToNextRound() {
		if (this.state.currentRound === this.state.puzzles.length - 1) {
			this.setGameState({
				currentPanel: "BonusRoundPanel",
				newPanelKey: this.state.newPanelKey + 1,
				currentBoard: this.state.bonus.finalBoard.map(function(row) {
					return Array.prototype.map.call(row, function(l) {
						return letters.includes(l) ? "_" : l;
					}).join("");
				}),
				usedLetters: "",
				lastLetterCalled: "",
				numberOfMatchesLast: 0,
				currentPuzzleSolved: false,
				currentFinalBoard: this.state.bonus.finalBoard,
				currentAnswer: this.state.bonus.answer,
				currentCategory: this.state.bonus.category
			});
		} else {
			var newPuzzle = this.state.puzzles[this.state.currentRound + 1];
			console.log("Setting puzzle to:");
			console.log(newPuzzle);
			var thisPanel = this;
			this.setGameState({
				currentRound: this.state.currentRound + 1,
				currentPanel: "PuzzleBoardPanel",
				newPanelKey: this.state.newPanelKey + 1,
				currentBoard: newPuzzle.finalBoard.map(function(row) {
					return Array.prototype.map.call(row, function(l) {
						return letters.includes(l) ? "_" : l;
					}).join("");
				}),
				usedLetters: "",
				lastLetterCalled: "",
				numberOfMatchesLast: 0,
				currentPuzzleSolved: false,
				currentFinalBoard: newPuzzle.finalBoard,
				currentAnswer: newPuzzle.answer,
				currentCategory: newPuzzle.category,
				uncalledConsonantsInPuzzle: consonants.split("").filter(function(l) {
					return !thisPanel.state.usedLetters.includes(l) 
					&& thisPanel.state.currentFinalBoard.some(function(row) {
						return row.includes(l);
					});
				})
			});
		}
	}

	setPlayerRoundScore(player, score) {
		var newPlayers = this.state.players;
		newPlayers[player].roundScore = score;
		this.setGameState({
			players: newPlayers
		});
	}

	setPlayerTotalScore(player, score) {
		var newPlayers = this.state.players;
		newPlayers[player].totalScore = score;
		this.setGameState({
			players: newPlayers
		});
	}

	setGameState(changedItems) {
		this.setState(changedItems);
		socket.emit("set state", changedItems);
	}

	setGameData(newPuzzles, newBonus, newWheels) {
		console.log(newPuzzles, newBonus);
		this.setGameState({
			puzzles: newPuzzles,
			bonus: newBonus,
			wheels: newWheels,
			currentRound: 0,
			currentPanel: newPuzzles ? "PuzzleBoardPanel" : "BonusRoundPanel",
			currentBoard: (newPuzzles ? newPuzzles[0] : newBonus).finalBoard.map(function(row) {
				return Array.prototype.map.call(row, function(l) {
					return letters.includes(l) ? "_" : l;
				}).join("");
			}),
			usedLetters: "",
			lastLetterCalled: "",
			numberOfMatchesLast: 0,
			currentPuzzleSolved: false,
			currentFinalBoard: newPuzzles ? newPuzzles[0].finalBoard : newBonus.finalBoard,
			currentAnswer: newPuzzles ? newPuzzles[0].answer : newBonus.answer,
			currentCategory: newPuzzles ? newPuzzles[0].category : newBonus.category
		});
	}

	goToNextPlayer() {
		this.setGameState({
			currentPlayer: (this.state.currentPlayer + 1) % this.state.players.length
		});
	}

	receiveNewState(state) {
		console.log("new state received:");
		console.log(state);

		var oldState = this.state;

		this.setState(state);

		if (state.currentWedge !== oldState.currentWedge) {
			if (state.currentWedge === "Bankrupt") {
				this.setPlayerRoundScore(state.currentPlayer, 0);
			}
			if (state.currentWedge === "Bankrupt" || state.currentWedge === "Lose a Turn") {
				this.goToNextPlayer();
			} else {
				this.setGameState({
					selectingConsonant: true
				});
			}
		}

		this.setGameState({
			lastLetterCalled: ""
		});

	}

	componentDidMount() {
		//socket.on("new player", this.handleNewPlayer);
		socket.on("new game state", this.receiveNewState);
	}

	componentWillUnmount() {
		//socket.removeListener("new player", this.handleNewPlayer);
		socket.removeListener("new game state", this.receiveNewState);
	}

	setSelectingPlayer(screenName) {
		console.log("HostConsole.setSelectingPlayer called with screenName " + screenName);
		this.setGameState({
			selectingPlayer: screenName
		});
	}

	render() {
		// render player list panel
		var mainPanel;

		switch (this.state.currentPanel) {
		case "NoPuzzlePanel":
			mainPanel = (
				<NoPuzzlePanel
					key={this.state.newPanelKey}
					setGameData={this.setGameData}
				/>
			);
			break;

		case "NextRoundPanel":
			mainPanel = (
				<NextRoundPanel
					key={this.state.newPanelKey}
					lastRound={this.state.currentRound === this.state.puzzles.length - 1}
					callback={this.goToNextRound}
				/>
			);
			break;

		case "PuzzleBoardPanel":
			mainPanel = (
				<PuzzleBoardPanel
					key={this.state.newPanelKey}
					puzzle={this.state.puzzles[this.state.currentRound]}
					setGameState={this.setGameState}
					goToNextPlayer={this.goToNextPlayer}
					setPlayerRoundScore={this.setPlayerRoundScore}
					gameState={this.state}
				/>
			);
			break;

		case "BonusRoundPanel":
			mainPanel = (
				<BonusRoundPanel
					key={this.state.newPanelKey}
					bonus={this.state.bonus}
					consonantsToSelect={bonusRoundConsonants}
					vowelsToSelect={bonusRoundVowels}
					setGameState={this.setGameState}
					gameState={this.state}
				/>
			);
			break;
		}

		return (
			<div className="main-panel">
				{mainPanel}
			</div>
		);
	}
}


// starting panel, with field to upload puzzle file
class NoPuzzlePanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			playerNameList: []
		};
		this.processFile = this.processFile.bind(this);
	}
	processFile() {
		var selectedFile = document.getElementById("questionFile").files[0];
		var reader = new FileReader();
		var thisPanel = this;
		reader.onload = function() {
			console.log("reader.onload called");
			var fileText = reader.result;
			var fileObject = JSON.parse(fileText);
			var puzzles = fileObject.puzzles;
			var bonus = fileObject.bonus;
			var wheels = fileObject.wheels;
			thisPanel.props.setGameData(puzzles, bonus, wheels);
			
		};
		reader.readAsText(selectedFile);
		console.log("readAsText called");
		// TODO show loading graphic until processing is done
	}
	render() {
		// TODO make an option to either upload own file or use one of the internal test games
		var fileInput = <input type="file" required={true} multiple={false} id="questionFile"/>;
		return (
			<div className="no-question-panel">
				
				<div className="upload-file-dialog">{fileInput}</div>
				<div className="add-question-button" href="#" onClick={this.processFile}><p>Go</p></div>
			</div>
		);
	}
}


// starting panel, with field to upload question file
var NextRoundPanel = React.createClass({
	propTypes: {
		lastRound: React.PropTypes.bool,
		callback: React.PropTypes.func
	},
	handleKeyPress: function(event) {
		var eventDetails = event;
		console.log(eventDetails.key);
		if (eventDetails.key === "Enter") {
			this.props.callback();
		}
	},
	render: function() {
		var buttonText = this.props.lastRound ? "Go to Bonus Round" : "Go to Next Round";
		return (
			<div tabIndex="0" onKeyDown={this.handleKeyPress} className="no-question-panel">
				<div className="add-question-button" href="#" onClick={this.props.callback}><p>{buttonText}</p></div>
			</div>
		);
	}
});

var PuzzleBoardGrid = React.createClass({
	propTypes: {
		currentBoard: React.PropTypes.array
	},
	render: function() {
		var boardRows = this.props.currentBoard.map(function(row, rowIndex) { 
			var rowCells = Array.prototype.map.call(row, function(cell, cellIndex) {
				var classModifier = "";
				if (cell === "@") {
					classModifier = " invisible";
				} else if (cell === " ") {
					classModifier = " shaded";
				} else if (cell === "_") {
					classModifier = " blank";
				}
				return <div className={"puzzle-board-cell" + classModifier} key={cellIndex}>{cell}</div>;
			});
			return <div key={rowIndex} className="puzzle-board-row">{rowCells}</div>;
		});
		return <div className="current-board-panel">{boardRows}</div>;
	}
});


// panel showing category, current board, correct answer, and letters both available and called
var PuzzleBoardPanel = React.createClass({
	propTypes: {
		roundNo: React.PropTypes.number,
		setGameState: React.PropTypes.func,
		goToNextPlayer: React.PropTypes.func,
		setPlayerRoundScore: React.PropTypes.func,
		gameState: React.PropTypes.object
	},
	selectLetter: function(letter) {
		if (!this.props.gameState.usedLetters || !this.props.gameState.usedLetters.includes(letter)) {
			this.props.setGameState({
				usedLetters: this.props.gameState.usedLetters + letter
			});
			var newBoard = this.props.gameState.currentBoard;
			var numberOfMatches = 0;
			for (var row = 0; row < this.props.gameState.currentBoard.length; row++) {
				for (var col = 0; col < this.props.gameState.currentBoard[row].length; col++) {
					if (this.props.gameState.currentBoard[row][col] === "_"
						&& this.props.gameState.currentFinalBoard[row][col] === letter) {
						newBoard[row] = newBoard[row].substring(0, col) + letter + newBoard[row].substring(col + 1);
						numberOfMatches++;
					}
				}
			}

			if (numberOfMatches === 0) {
				this.props.goToNextPlayer();
			} else if (vowels.includes(letter)) {
				// deduct $50 for buying a vowel
				this.props.setPlayerRoundScore(this.props.gameState.currentPlayer,
					this.props.gameState.players[this.props.gameState.currentPlayer].roundScore - 50);
			} else {
				// give the value of the current wedge to the player
				this.props.setPlayerRoundScore(this.props.gameState.currentPlayer,
					this.props.gameState.players[this.props.gameState.currentPlayer].roundScore
					+ this.props.gameState.currentWedge);
			}
			this.props.setGameState({
				currentBoard: newBoard,
				lastLetterCalled: letter,
				numberOfMatchesLast: numberOfMatches,
				selectingConsonant: false,
				currentWedge: ""
			});
		}
	},
	solvePuzzle: function() {
		this.props.setGameState({
			currentBoard: this.props.gameState.currentFinalBoard,
			currentPuzzleSolved: true
		});
	},
	spinWheel: function() {
		this.props.setGameState({
			spinning: true
		});
	},
	goToNextRound: function() {
		this.props.setGameState({
			currentPanel: "NextRoundPanel",
		});
	},

	handleKeyPress: function(event) {
		var eventDetails = event;
		console.log(eventDetails.key);
		if (eventDetails.key === "Enter") {
			if (this.props.gameState.currentPuzzleSolved) {
				this.goToNextRound();
			} else {
				this.solvePuzzle();
			}
			
		} else if (letters.includes(eventDetails.key.toUpperCase()) && eventDetails.key.length === 1) {
			this.selectLetter(eventDetails.key.toUpperCase());
		}
	},

	render: function() {
		var letterButtons = [];
		var statusText;
		if (this.props.gameState.spinning) {
			statusText = "Player " + (+this.props.gameState.currentPlayer + 1) + " is spinning";
		} else if (this.props.gameState.selectingConsonant && this.props.gameState.currentWedge !== "") {
			statusText = "Player " + (+this.props.gameState.currentPlayer + 1) + " has landed on " +
				this.props.gameState.currentWedge;
		} else if (this.props.gameState.lastLetterCalled === ""
			&& (this.props.gameState.currentWedge === "Bankrupt" || this.props.gameState.currentWedge === "Lose a Turn")) {
			var previousPlayer = this.props.gameState.currentPlayer === 0 ?
				this.props.gameState.players.length - 1 :
				this.props.gameState.currentPlayer - 1;
			statusText = "Player " + (previousPlayer + 1) + " has landed on " + this.props.gameState.currentWedge;
		} else if (this.props.gameState.lastLetterCalled !== "") {
			if (this.props.gameState.numberOfMatchesLast === 0) {
				statusText = "No " + this.props.gameState.lastLetterCalled + "s";
			} else if (this.props.gameState.numberOfMatchesLast === 1) {
				statusText = "1 " + this.props.gameState.lastLetterCalled;
			} else {
				statusText = this.props.gameState.numberOfMatchesLast + " " + this.props.gameState.lastLetterCalled + "s";
			}
		} else {
			statusText = "Choose a letter below";
		}

		for (var i = 0; i < letters.length; i++) {
			var l = letters[i];
			var active = true;
			if (this.props.gameState.usedLetters && this.props.gameState.usedLetters.includes(l)) {
				active = false;
			} else if (consonants.includes(l) && !this.props.gameState.selectingConsonant) {
				active = false;
			} else if (vowels.includes(l) && this.props.gameState.selectingConsonant) {
				active = false;
			} else if (vowels.includes(l)
				&& this.props.gameState.players[this.props.gameState.currentPlayer].roundScore < 50) {
				active = false;
			} else if (this.props.gameState.spinning || this.props.gameState.currentPuzzleSolved) {
				active = false;
			}

			if (active) {
				letterButtons.push((
					<PuzzleLetterButton
						key={i}
						letter={l}
						onClick={this.selectLetter}
						active={true}
					/>
				));
			} else {
				letterButtons.push((
					<PuzzleLetterButton
						key={i}
						letter={l}
						active={false}
					/>
				));
			}
			
		}

		var solveButton;
		var passButton = null;
		var spinButton = null;
		if (this.props.gameState.currentPuzzleSolved) {
			solveButton = <div className="add-question-button" href="#" onClick={this.goToNextRound}><p>Continue</p></div>;
		} else {
			var solveDisabled = this.props.gameState.spinning || this.props.gameState.selectingConsonant;
			if (solveDisabled) {
				solveButton = (
					<div
						className="add-question-button disabled"
						href="#">
						<p>Solve</p>
					</div>
				);
			} else {
				solveButton = (
					<div
						className="add-question-button"
						href="#"
						onClick={this.solvePuzzle}>
						<p>Solve</p>
					</div>
				);
			}
			
			var spinDisabled = this.props.gameState.spinning || this.props.gameState.selectingConsonant;
			if (spinDisabled) {
				spinButton = (
					<div 
						className="add-question-button disabled"
						href="#">
						<p>Spin</p>
					</div>
				);
			} else {
				spinButton = (
					<div 
						className="add-question-button"
						href="#"
						onClick={this.spinWheel}>
						<p>Spin</p>
					</div>
				);
			}

			var passDisabled = this.props.gameState.spinning;
			if (passDisabled) {
				passButton = (
					<div
						className="add-question-button disabled"
						href="#">
						<p>Pass</p>
					</div>
				);
			} else {
				passButton = (
					<div
						className="add-question-button"
						href="#"
						onClick={this.props.goToNextPlayer}>
						<p>Pass</p>
					</div>
				);
			}
		}

		var playerPanels = [];
		for (var p in this.props.gameState.players) {
			var playerText = this.props.gameState.currentPlayer == p ?
				"*" + this.props.gameState.players[p].roundScore + "*" :
				this.props.gameState.players[p].roundScore;
			playerPanels.push((
				<div key={p} className="player-panel" style={{
					backgroundColor: this.props.gameState.players[p].colour
				}}>
					<div className="player-panel-inner">
						<p className="player-panel" style={{
							color: "white"
						}}>
							{playerText}
						</p>
					</div>
				</div>
			));
		}

		return (
			<div tabIndex="0" onKeyDown={this.handleKeyPress} className="puzzle-board-panel">
				<PuzzleBoardGrid currentBoard={this.props.gameState.currentBoard}/>
				<div className="puzzle-category-panel">
					<p className="puzzle-category-panel">
						{this.props.gameState.currentCategory.toUpperCase()}
					</p>
				</div>
				<div className="puzzle-solution-panel">
					<p className="puzzle-solution-panel">
						{this.props.gameState.currentAnswer}
					</p>
				</div>
				<div className="status-panel">
					<p className="status-panel">
						{statusText}
					</p>
				</div>
				<div className="player-row">
					{playerPanels}
				</div>
				<div className="letter-button-panel">
					{letterButtons}
				</div>
				<div className="button-row">
					{solveButton}
					{spinButton}
					{passButton}
				</div>
			</div>
		);
	}
});

var PuzzleLetterButton = React.createClass({
	propTypes: {
		letter: React.PropTypes.string,
		onClick: React.PropTypes.func,
		active: React.PropTypes.bool
	},
	onClick: function(letter) {
		this.props.onClick(letter);
	},
	render: function() {
		if (this.props.active) {
			return (
				<div className="letter-button" href="#" onClick={this.onClick.bind(this, this.props.letter)}>
					<p>{this.props.letter}</p>
				</div>
			);
		} else {
			return (
				<div className="letter-button inactive" href="#">
					<p>{this.props.letter}</p>
				</div>
			);
		}
		
	}
});

var BonusRoundPanel = React.createClass({
	propTypes: {
		bonus: React.PropTypes.object,
		consonantsToSelect: React.PropTypes.number,
		vowelsToSelect: React.PropTypes.number,
		gameState: React.PropTypes.object,
		setGameState: React.PropTypes.func
	},
	getInitialState: function() {
		return {};
	},
	solvePuzzle: function() {
		clearInterval(this.state.timer);
		this.props.setGameState({
			currentBoard: this.props.gameState.currentFinalBoard,
			currentPuzzleSolved: true,
			bonusAnswerRevealed: true
		});
	},
	revealCorrectAnswer: function() {
		clearInterval(this.state.timer);
		this.props.setGameState({
			currentBoard: this.props.gameState.currentFinalBoard,
			bonusAnswerRevealed: true
		});
	},
	handleKeyPress: function(event) {
		var eventDetails = event;
		console.log(eventDetails.key);
		if (eventDetails.key === "Enter") {
			if (!this.props.gameState.bonusClockStarted) {
				this.startClock();
			} else if (!this.props.gameState.currentPuzzleSolved) {
				this.solvePuzzle();
			}
			
		} else if (letters.includes(eventDetails.key.toUpperCase()) && eventDetails.key.length === 1) {
			this.selectLetter(eventDetails.key.toUpperCase());
		}
	},
	startClock: function() {
		this.props.setGameState({
			bonusClockStarted: true
		});
		var thisPanel = this;
		var timer = setInterval(function() {
			if (thisPanel.props.gameState.bonusSecondsRemaining > 1) {
				thisPanel.props.setGameState({
					bonusSecondsRemaining: thisPanel.props.gameState.bonusSecondsRemaining - 1
				});
			} else {
				console.log("time up");
				clearInterval(thisPanel.state.timer);
			}
			
		}, 1000);
		this.setState({
			timer: timer
		});
	},
	selectLetter: function(letter) {
		if (!this.props.gameState.selectedLetters.includes(letter)) {
			var newSelectedLetters = this.props.gameState.selectedLetters;
			newSelectedLetters.push(letter);
			var newVowelsLeft = this.props.gameState.bonusVowelsLeft;
			var newConsonantsLeft = this.props.gameState.bonusConsonantsLeft;
			if (vowels.includes(letter) && newVowelsLeft > 0) {
				newVowelsLeft--;
				this.props.setGameState({
					selectedLetters: newSelectedLetters,
					bonusVowelsLeft: newVowelsLeft
				});
			} else if (consonants.includes(letter) && newConsonantsLeft > 0) {
				newConsonantsLeft--;
				this.props.setGameState({
					selectedLetters: newSelectedLetters,
					bonusConsonantsLeft: newConsonantsLeft
				});
			}

			if (newVowelsLeft === 0 && newConsonantsLeft === 0) {
				this.revealSelectedLetters(newSelectedLetters);
			}
		}
		
	},
	revealSelectedLetters: function(selectedLetters) {
		var newBoard = this.props.gameState.currentBoard;
		for (var i in selectedLetters) {
			var letter = selectedLetters[i];
			for (var row = 0; row < this.props.gameState.currentBoard.length; row++) {
				for (var col = 0; col < this.props.gameState.currentBoard[row].length; col++) {
					if (this.props.gameState.currentBoard[row][col] === "_" 
						&& this.props.gameState.currentFinalBoard[row][col] === letter) {
						newBoard[row] = newBoard[row].substring(0, col) + letter + newBoard[row].substring(col + 1);
					}
				}
			}
		}
		this.props.setGameState({
			currentBoard: newBoard,
		});
	},
	render: function() {
		
		var statusText;
		if (this.props.gameState.bonusConsonantsLeft > 0 && this.props.gameState.bonusVowelsLeft > 0) {
			statusText = "Choose " + this.props.gameState.bonusConsonantsLeft 
				+ " consonant(s) and " + this.props.gameState.bonusVowelsLeft + " vowel(s)";
		} else if (this.props.gameState.bonusConsonantsLeft > 0) {
			statusText = "Choose " + this.props.gameState.bonusConsonantsLeft + " consonant(s)";
		} else if (this.props.gameState.bonusVowelsLeft > 0) {
			statusText = "Choose " + this.props.gameState.bonusVowelsLeft + " vowel(s)";
		} else if (this.props.gameState.bonusClockStarted && this.props.gameState.bonusSecondsRemaining > 0) {
			statusText = this.props.gameState.bonusSecondsRemaining + " second(s) remaining";
		} else if (this.props.gameState.bonusClockStarted) {
			statusText = "Time Up";
		} else {
			statusText = "Click the button below to start the clock";
		}
		var letterButtons = [];
		for (var i = 0; i < letters.length; i++) {
			var l = letters[i];
			var active = true;
			if ((vowels.includes(l) && this.props.gameState.bonusVowelsLeft === 0)
				|| (consonants.includes(l) && this.props.gameState.bonusConsonantsLeft === 0)
				|| (this.props.gameState.selectedLetters.includes(l))) {
				active = false;
			}
			letterButtons.push((
				<PuzzleLetterButton
					key={i}
					letter={l}
					onClick={this.selectLetter}
					active={active}
				/>
			));
		}

		var solveButtonRow;
		if (this.props.gameState.bonusAnswerRevealed) {
			solveButtonRow = (
				<div className="solve-button-panel">
					<div className="add-question-button" href="#" onClick={this.goToNextRound}>
						<p>Continue</p>
					</div>
				</div>
			);
		} else if (!this.props.gameState.bonusClockStarted) {
			if (this.props.gameState.bonusConsonantsLeft !== 0 || this.props.gameState.bonusVowelsLeft !== 0) {
				solveButtonRow = (
					<div className="solve-button-panel">
						<div className="add-question-button inactive" href="#">
							<p>Start Clock</p>
						</div>
					</div>
				);
			} else {
				solveButtonRow = (
					<div className="solve-button-panel">
						<div className="add-question-button" href="#" onClick={this.startClock}>
							<p>Start Clock</p>
						</div>
					</div>
				);
			}
			
		} else {
			solveButtonRow = (
				<div className="solve-button-panel">
					<div className="add-question-button" href="#" onClick={this.solvePuzzle}>
						<p>Solve</p>
					</div>
					<div className="cancel-question-button" href="#" onClick={this.revealCorrectAnswer}>
						<p>Reveal Answer</p>
					</div>
				</div>);
		}

		return (
			<div className="puzzle-board-panel" tabIndex="0" onKeyDown={this.handleKeyPress}>
				<PuzzleBoardGrid currentBoard={this.props.gameState.currentBoard}/>
				<div className="puzzle-category-panel">
					<p className="puzzle-category-panel">
						{this.props.gameState.currentCategory.toUpperCase()}
					</p>
				</div>
				<div className="puzzle-solution-panel">
					<p className="puzzle-solution-panel">
						{this.props.gameState.currentAnswer}
					</p>
				</div>
				<div className="status-panel">
					<p className="status-panel">
						{statusText}
					</p>
				</div>
				<div className="letter-button-panel">
					{letterButtons}
				</div>
				{solveButtonRow}
			</div>
		);
	}
});
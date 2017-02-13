var React = require("react");
var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var $ = require("jquery");

var players = [];

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return "";
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}


var gameTitle = getParameterByName("gametitle");

var currentRound = 0;

var puzzles = [];
var bonus = {};

var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var consonants = "BCDFGHJKLMNPQRSTVWXYZ";
var vowels = "AEIOU";

var bonusRoundConsonants = 5;
var bonusRoundVowels = 1;




socket.emit("start game", {
	gameTitle: gameTitle,
	type: "wof-board"
});

socket.on("game details", function(details) {
	console.log("Game Details received");
	console.log(details);
	$("#game-code").text(details.gameCode);
	$("#game-title").text(details.gameTitle);
	ReactDOM.render(<NoPuzzlePanel/>, document.getElementById("question-panel"));
});

socket.on("new player", function(playerDetails) {
	console.log("new player:");
	console.log(playerDetails);
	playerDetails.score = 0;
	players.push(playerDetails);
});


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
		reader.onload = function() {
			console.log("reader.onload called");
			var fileText = reader.result;
			var fileObject = JSON.parse(fileText);
			puzzles = fileObject.puzzles;
			bonus = fileObject.bonus;
			socket.emit("set state", {
				puzzles: puzzles,
				bonus: bonus,
				currentRound: currentRound,
				currentPanel: "PuzzleBoardPanel"
			});
			if (puzzles.length !== 0) {
				ReactDOM.render(<PuzzleBoardPanel roundNo={currentRound}/>, document.getElementById("question-panel"));
			} else {
				ReactDOM.render((
					<BonusRoundPanel
						consonantsToSelect={bonusRoundConsonants}
						vowelsToSelect={bonusRoundVowels}
					/>
				), document.getElementById("question-panel"));
			}
			
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
	nextRound: function() {
		currentRound += 1;
		if (currentRound === puzzles.length) {
			socket.emit("set state", {
				currentPanel: "BonusRoundPanel"
			});
			ReactDOM.render((
				<BonusRoundPanel
					consonantsToSelect={bonusRoundConsonants}
					vowelsToSelect={bonusRoundVowels}
				/>
			), document.getElementById("question-panel"));
		} else {
			socket.emit("set state", {
				currentRound: currentRound,
				currentPanel: "PuzzleBoardPanel"
			});
			ReactDOM.render(<PuzzleBoardPanel roundNo={currentRound}/>, document.getElementById("question-panel"));
		}
	},
	render: function() {
		var buttonText = currentRound === puzzles.length - 1 ? "Go to Bonus Round" : "Go to Round " + (currentRound + 2);
		return (
			<div className="no-question-panel">
				<div className="add-question-button" href="#" onClick={this.nextRound}><p>{buttonText}</p></div>
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
	getInitialState: function() {
		console.log(this.props.roundNo);
		console.log(puzzles);
		return {
			currentBoard: puzzles[this.props.roundNo].finalBoard.map(function(row) {
				return Array.prototype.map.call(row, function(l) {
					return letters.includes(l) ? "_" : l;
				}).join("");
			}),
			usedLetters: "",
			lastLetterCalled: "",
			numberOfMatchesLast: 0,
			solved: false,
			finalBoard: puzzles[this.props.roundNo].finalBoard,
			answer: puzzles[this.props.roundNo].answer,
			category: puzzles[this.props.roundNo].category
		};
	},
	propTypes: {
		roundNo: React.PropTypes.number
	},
	selectLetter: function(letter) {
		if (!this.state.usedLetters.includes(letter)) {
			this.setState({
				usedLetters: this.state.usedLetters + letter
			});
			var newBoard = this.state.currentBoard;
			var numberOfMatches = 0;
			for (var row = 0; row < this.state.currentBoard.length; row++) {
				for (var col = 0; col < this.state.currentBoard[row].length; col++) {
					if (this.state.currentBoard[row][col] === "_" && this.state.finalBoard[row][col] === letter) {
						newBoard[row] = newBoard[row].substring(0, col) + letter + newBoard[row].substring(col + 1);
						numberOfMatches++;
					}
				}
				console.log(newBoard[row]);
			}
			this.setState({
				currentBoard: newBoard,
				lastLetterCalled: letter,
				numberOfMatchesLast: numberOfMatches
			});
		}
	},
	solvePuzzle: function() {
		this.setState({
			currentBoard: this.state.finalBoard,
			solved: true
		});
	},
	goToNextRound: function() {
		ReactDOM.render(<NextRoundPanel/>, document.getElementById("question-panel"));
	},
	render: function() {
		var letterButtons = [];
		var statusText;
		if (this.state.lastLetterCalled !== "") {
			if (this.state.numberOfMatchesLast === 0) {
				statusText = "No " + this.state.lastLetterCalled + "s";
			} else if (this.state.numberOfMatchesLast === 1) {
				statusText = "1 " + this.state.lastLetterCalled;
			} else {
				statusText = this.state.numberOfMatchesLast + " " + this.state.lastLetterCalled + "s";
			}
		} else {
			statusText = "Choose a letter below";
		}

		for (var i = 0; i < letters.length; i++) {
			var l = letters[i];
			letterButtons.push((
				<PuzzleLetterButton
					key={i}
					letter={l}
					onClick={this.selectLetter}
					active={!this.state.usedLetters.includes(l)}
				/>
			));
		}

		var solveButton;
		if (this.state.solved) {
			solveButton = <div className="add-question-button" href="#" onClick={this.goToNextRound}><p>Continue</p></div>;
		} else {
			solveButton = <div className="add-question-button" href="#" onClick={this.solvePuzzle}><p>Solve</p></div>;
		}
		console.log(this.state.currentBoard);
		return (
			<div className="puzzle-board-panel">
				<PuzzleBoardGrid currentBoard={this.state.currentBoard}/>
				<div className="puzzle-category-panel">
					<p className="puzzle-category-panel">
						{this.state.category.toUpperCase()}
					</p>
				</div>
				<div className="puzzle-solution-panel">
					<p className="puzzle-solution-panel">
						{this.state.answer}
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
				<div className="solve-button-panel">
					{solveButton}
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
		consonantsToSelect: React.PropTypes.number,
		vowelsToSelect: React.PropTypes.number
	},
	getInitialState: function() {
		return {
			currentBoard: bonus.finalBoard.map(function(row) {
				return Array.prototype.map.call(row, function(l) {
					return letters.includes(l) ? "_" : l;
				}).join("");
			}),
			consonantsLeft: this.props.consonantsToSelect,
			vowelsLeft: this.props.vowelsToSelect,
			selectedLetters: [],
			solved: false,
			answerRevealed: false,
			finalBoard: bonus.finalBoard,
			answer: bonus.answer,
			category: bonus.category,
			secondsRemaining: 10,
			clockStarted: false
		};
	},
	solvePuzzle: function() {
		this.setState({
			currentBoard: this.state.finalBoard,
			solved: true,
			answerRevealed: true
		});
	},
	revealCorrectAnswer: function() {
		this.setState({
			currentBoard: this.state.finalBoard,
			answerRevealed: true
		});
	},
	startClock: function() {
		this.setState({
			clockStarted: true
		});
		var thisPanel = this;
		var timer = setInterval(function() {
			if (thisPanel.state.secondsRemaining > 1) {
				thisPanel.setState({
					secondsRemaining: thisPanel.state.secondsRemaining - 1
				});
			} else {
				console.log("time up");
				clearInterval(timer);
			}
			
		}, 1000);
	},
	selectLetter: function(letter) {
		if (!this.state.selectedLetters.includes(letter)) {
			var newSelectedLetters = this.state.selectedLetters;
			newSelectedLetters.push(letter);
			var newVowelsLeft = this.state.vowelsLeft;
			var newConsonantsLeft = this.state.consonantsLeft;
			if (vowels.includes(letter)) {
				newVowelsLeft--;
				this.setState({
					selectedLetters: newSelectedLetters,
					vowelsLeft: newVowelsLeft
				});
			} else {
				newConsonantsLeft--;
				this.setState({
					selectedLetters: newSelectedLetters,
					consonantsLeft: newConsonantsLeft
				});
			}

			if (newVowelsLeft === 0 && newConsonantsLeft === 0) {
				this.revealSelectedLetters(newSelectedLetters);
			}
		}
		
	},
	revealSelectedLetters: function(selectedLetters) {
		console.log(selectedLetters);
		for (var i in selectedLetters) {
			var letter = selectedLetters[i];
			console.log(letter);
			var newBoard = this.state.currentBoard;
			var numberOfMatches = 0;
			for (var row = 0; row < this.state.currentBoard.length; row++) {
				for (var col = 0; col < this.state.currentBoard[row].length; col++) {
					if (this.state.currentBoard[row][col] === "_" && this.state.finalBoard[row][col] === letter) {
						newBoard[row] = newBoard[row].substring(0, col) + letter + newBoard[row].substring(col + 1);
						numberOfMatches++;
					}
				}
				console.log(newBoard[row]);
			}
			this.setState({
				currentBoard: newBoard,
				lastLetterCalled: letter,
				numberOfMatchesLast: numberOfMatches
			});
		}
	},
	render: function() {
		
		var statusText;
		if (this.state.consonantsLeft > 0 && this.state.vowelsLeft > 0) {
			statusText = "Choose " + this.state.consonantsLeft + " consonant(s) and " + this.state.vowelsLeft + " vowel(s)";
		} else if (this.state.consonantsLeft > 0) {
			statusText = "Choose " + this.state.consonantsLeft + " consonant(s)";
		} else if (this.state.vowelsLeft > 0) {
			statusText = "Choose " + this.state.vowelsLeft + " vowel(s)";
		} else if (this.state.clockStarted && this.state.secondsRemaining > 0) {
			statusText = this.state.secondsRemaining + " second(s) remaining";
		} else if (this.state.clockStarted) {
			statusText = "Time Up";
		} else {
			statusText = "Click the button below to start the clock";
		}
		var letterButtons = [];
		for (var i = 0; i < letters.length; i++) {
			var l = letters[i];
			var active = true;
			if ((vowels.includes(l) && this.state.vowelsLeft === 0)
				|| (consonants.includes(l) && this.state.consonantsLeft === 0)
				|| (this.state.selectedLetters.includes(l))) {
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
		if (this.state.answerRevealed) {
			solveButtonRow = (
				<div className="solve-button-panel">
					<div className="add-question-button" href="#" onClick={this.goToNextRound}>
						<p>Continue</p>
					</div>
				</div>
			);
		} else if (!this.state.clockStarted) {
			if (this.state.consonantsLeft !== 0 || this.state.vowelsLeft !== 0) {
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
		console.log(this.state.currentBoard);
		return (
			<div className="puzzle-board-panel">
				<PuzzleBoardGrid currentBoard={this.state.currentBoard}/>
				<div className="puzzle-category-panel">
					<p className="puzzle-category-panel">
						{this.state.category.toUpperCase()}
					</p>
				</div>
				<div className="puzzle-solution-panel">
					<p className="puzzle-solution-panel">
						{this.state.answer}
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
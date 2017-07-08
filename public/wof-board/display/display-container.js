var React = require("react");
var PropTypes = require("prop-types");
var io = require("socket.io-client");
var SoundManager = require("soundmanager2").SoundManager;

import PuzzleBoardPanel from "./puzzle-board-panel";

export default class DisplayContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentPanel: "NoPuzzlePanel",
			puzzles: [],
			bonus: {},
			wheels: [],
			currentRound: -2,
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

			bonusConsonantsLeft: 0,
			bonusVowelsLeft: 0,
			selectedLetters: [],
			bonusAnswerRevealed: false,
			bonusSecondsRemaining: 10,
			bonusClockStarted: false,

			displayedBoard: [],

			players: [{
				score: 0,
				colour: "#ff0000"
			},{
				score: 0,
				colour: "#ffff00"
			},{
				score: 0,
				colour: "#0000ff"
			}],
			currentPlayer: 0,
			selectingConsonant: false
		};
	}

	handleNewState = (state) => {
		console.log(state);
		console.log(this.state);
		// connecting before puzzles are loaded
		if (state.currentPanel === "NoPuzzlePanel") {
			this.setState({
				displayedBoard: ["@           @","             ","             ","@           @"]
			});

		// new puzzle revealed (except where game is re-connecting mid-game)
		} else if (this.state.currentRound !== -2
			&& 
				(state.currentRound !== this.state.currentRound || 
				(state.currentPanel === "BonusRoundPanel" && this.state.currentPanel !== "BonusRoundPanel"))) {
			// play puzzle reveal chime
			this.props.soundManager.stop("backgroundBed");
			this.props.soundManager.play("showPuzzle");
			this.updateBoardByCell(this.state.displayedBoard, state.currentBoard);

		// initial connection
		} else if (this.state.currentBoard.length === 0) {
			this.setState({
				displayedBoard: state.currentBoard
			});

		// puzzle just solved
		} else if (state.currentPuzzleSolved && !this.state.currentPuzzleSolved && !state.bonusAnswerRevealed) {
			// play solve theme, and stop playing bonus round think music (if it was playing)
			this.props.soundManager.stop("bonusThink");
			this.props.soundManager.play("solvePuzzle");
			this.updateBoardByCell(this.state.displayedBoard, state.currentBoard);

		} else if (state.uncalledConsonantsInPuzzle.length === 0 && this.state.uncalledConsonantsInPuzzle.length > 0) {
			this.props.soundManager.play("noConsonants");


		// bonus puzzle just solved
		} else if (state.bonusPuzzleSolved && !this.state.bonusPuzzleSolved) {
			// play solve theme, and stop playing bonus round think music (if it was playing)
			this.props.soundManager.stop("bonusThink");
			this.props.soundManager.play("solvePuzzle");
			this.updateBoardByCell(this.state.displayedBoard, state.currentBoard);

		// just moved to NextRoundPanel
		} else if (state.currentPanel === "NextRoundPanel" && state.currentPanel !== this.state.currentPanel) {
			this.updateBoardByCell(this.state.displayedBoard, 
				["@           @","             ","             ","@           @"]);


		// new letter called with no matches (or passed)
		} else if (state.currentPlayer !== this.state.currentPlayer && state.currentWedge !== "Bankrupt" && state.currentWedge !== "Lose a Turn") {
			// play buzzer
			console.log("buzzing");
			this.props.soundManager.play("buzzer");

		// bonus round answer revealed (not solved)
		} else if (state.bonusAnswerRevealed && !this.state.bonusAnswerRevealed) {
			this.updateBoardByCell(this.state.displayedBoard, state.currentBoard);

		// change in current board that isn't a solve - i.e. selection of letter in puzzle
		} else if (state.currentBoard !== this.state.currentBoard && !state.currentPuzzleSolved && !state.bonusAnswerRevealed) {
			this.lightUpChanges(this.state.displayedBoard, state.currentBoard);

		// start of bonus round timer
		} else if (state.bonusClockStarted && !this.state.bonusClockStarted) {
			// begin playing bonus round think music
			console.log("starting bonus timer");
			this.props.soundManager.play("bonusThink");




		// all other cases
		} else {
			this.setState({
				displayedBoard: state.currentBoard
			});
		}


		// spinning wheel
		if (state.spinning && !this.state.spinning) {
			this.spin();
		}
		this.setState(state);
	}

	replaceChar = (string, pos, newChar) => {
		var endStart = (+newChar.length + +pos);
		return string.substr(0, pos) + newChar + string.substr(endStart);
	}

	setGameState = (state) => {
		this.setState(state);
		this.props.socket.emit("set state", state);
	}

	updateBoardByCell = (oldBoard, newBoard) => {
		var changeCoordinates = [];
		var newDisplayBoard = oldBoard;
		for (var col in oldBoard[0]) {
			for (var row in oldBoard) {
				if (oldBoard[row][col] !== newBoard[row][col]) {
					changeCoordinates.push({row: row, col: col});
				}
			}
		}

		var currentChange = 0;
		var thisPanel = this;
		var change = function() {
			var r = changeCoordinates[currentChange].row;
			var c = changeCoordinates[currentChange].col;
			newDisplayBoard[r] = thisPanel.replaceChar(newDisplayBoard[r], c, newBoard[r][c]);
			thisPanel.setState({
				displayedBoard: newDisplayBoard
			});
			currentChange++;
			if (changeCoordinates.length > currentChange) {
				setTimeout(change, 25);
			}
		};
		if (changeCoordinates.length > 0) {
			change();
		}
	}

	lightUpChanges = (oldBoard, newBoard) => {
		var changeCoordinates = [];
		var newDisplayBoard = oldBoard;
		for (var col in oldBoard[0]) {
			for (var row in oldBoard) {
				if (oldBoard[row][col] !== newBoard[row][col]) {
					changeCoordinates.push({row: row, col: col});
				}
			}
		}

		var currentChange = 0;
		var thisPanel = this;
		var change = function() {
			var r = changeCoordinates[currentChange].row;
			var c = changeCoordinates[currentChange].col;
			newDisplayBoard[r] = thisPanel.replaceChar(newDisplayBoard[r], c, "*");
			// play ding sound
			thisPanel.props.soundManager.play("ding");
			thisPanel.setState({
				displayedBoard: newDisplayBoard
			});
			setTimeout(function() {thisPanel.cellLightToLetter(r, c, newBoard[r][c]);}, 1500);
			currentChange++;
			if (changeCoordinates.length > currentChange) {
				setTimeout(change, 1000);
			}
		};
		if (changeCoordinates.length > 0) {
			change();
		}
		
	}


	cellLightToLetter = (row, col, letter) => {
		var newDisplayBoard = this.state.displayedBoard;
		newDisplayBoard[row] = this.replaceChar(newDisplayBoard[row], col, letter);
		this.setState({
			displayedBoard: newDisplayBoard
		});
	}

	spin = () => {
		var thisPanel = this;
		var maxAngleIncrement = Math.random() * 5 + 5;
		var angleIncrement = 0;
		this.setState({
			spinning: true
		});
		var startWheel = setInterval(function() {
			thisPanel.setState({
				wheelAngle: (((thisPanel.state.wheelAngle + angleIncrement) % 360) + 360) % 360
			});
			
			//var pointedWedge = wedgeArray.length - Math.floor(((angle - wedgeSpan/2 + 360) % 360) / wedgeSpan) - 1;
			//ReactDOM.render(<div>{wedgeValueArray[pointedWedge]}</div>, document.getElementById("angle-panel"));

			angleIncrement += maxAngleIncrement / 10;
			if (angleIncrement >= maxAngleIncrement) {
				clearInterval(startWheel);

				var slowDownAmount = 1/Math.floor(Math.random() * 15 + 15);
				var slowDownWheel = setInterval(function() {

					thisPanel.setState({
						wheelAngle: (((thisPanel.state.wheelAngle + angleIncrement) % 360) + 360) % 360
					});
					
					//var pointedWedge = wedgeArray.length - Math.floor(((angle - wedgeSpan/2 + 360) % 360) / wedgeSpan) - 1;
					//ReactDOM.render(<div>{wedgeValueArray[pointedWedge]}</div>, document.getElementById("angle-panel"));

					angleIncrement -= slowDownAmount;
					if (angleIncrement <= 0) {
						clearInterval(slowDownWheel);
						thisPanel.finishSpin();
					}
			
				}, thisPanel.props.wheelTurnInterval);
			}
		}, this.props.wheelTurnInterval);
	}

	finishSpin = () => {

		var thisPanel = this;
		var wedges = [];
		if (this.state.currentRound < this.state.wheels.length) {
			wedges = this.state.wheels[this.state.currentRound];
		} else {
			wedges = this.state.wheels[this.state.wheels.length - 1];
		}
		var wedgeSpan = 360 / wedges.length;
		var playerLandedWedges = this.props.relativePointerArray.map(function(angle) {
			return wedges.length
			- Math.floor(((thisPanel.state.wheelAngle - wedgeSpan/2 + angle + 360) % 360) / wedgeSpan) - 1;
		});

		if (wedges[playerLandedWedges[this.state.currentPlayer]].value === "Bankrupt") {
			this.props.soundManager.play("bankrupt");
		} else if (wedges[playerLandedWedges[this.state.currentPlayer]].value === "Lose a Turn") {
			this.props.soundManager.play("loseATurn");
		} else {
			const wedgeValues = wedges.filter((wedge) => {
				return !isNaN(parseFloat(wedge.value)) && isFinite(wedge.value);
			}).map((wedge) => {
				return wedge.value;
			});
			if (wedges[playerLandedWedges[this.state.currentPlayer]].value === Math.max(...wedgeValues)) {
				this.props.soundManager.play("topDollar");
			}
		}

		this.setGameState({
			spinning: false,
			currentWedge: wedges[playerLandedWedges[this.state.currentPlayer]].value,
			wheelAngle: this.state.wheelAngle
		});
	}

	componentDidMount = () => {
		this.props.socket.on("new game state", this.handleNewState);
	}

	componentWillUnmount = () => {
		this.props.socket.removeListener("new game state", this.handleNewState);
	}

	render = () => {
		var mainPanel;

		switch (this.state.currentPanel) {
		case "NoPuzzlePanel":
		case "NextRoundPanel":
		case "PuzzleBoardPanel":
		case "BonusRoundPanel":
			mainPanel = (
				<PuzzleBoardPanel
					key={this.state.newPanelKey}
					puzzle={this.state.puzzles[this.state.currentRound]}
					gameState={this.state}
				/>
			);
			break;
		}

		return (
			<div id="display-panel" className="content">
				<div id="question-panel" className="content">
					{mainPanel}
				</div>
			</div>
		);
	}
}

DisplayContainer.propTypes = {
	socket: PropTypes.instanceOf(io.Socket),
	wheelTurnInterval: PropTypes.number,
	relativePointerArray: PropTypes.array,
	soundManager: PropTypes.instanceOf(SoundManager),
};
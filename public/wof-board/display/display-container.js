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
		// connecting before puzzles are loaded
		if (state.currentPanel === "NoPuzzlePanel") {
			console.log("Connecting before puzzles are loaded");
			this.setState({
				displayedBoard: ["@           @","             ","             ","@           @"]
			});

		// new puzzle revealed (except where game is re-connecting mid-game)
		} else if (this.state.currentRound !== -2
			&& 
				(state.currentRound !== this.state.currentRound || 
				(state.currentPanel === "BonusRoundPanel" && this.state.currentPanel !== "BonusRoundPanel"))) {
			// play puzzle reveal chime
			console.log("Revealing Puzzle");
			this.props.soundManager.stop("backgroundBed");
			this.props.soundManager.play("showPuzzle");
			this.updateBoardByCell(this.state.displayedBoard, state.currentBoard);

		// initial connection
		} else if (this.state.currentBoard.length === 0) {
			console.log("Initial Connection")
			this.setState({
				displayedBoard: state.currentBoard
			});

		// puzzle just solved
		} else if (state.currentPuzzleSolved && !this.state.currentPuzzleSolved && !state.bonusAnswerRevealed) {
			console.log("Puzzle Solved")
			// play solve theme, and stop playing bonus round think music (if it was playing)
			this.props.soundManager.stop("bonusThink");
			this.props.soundManager.play("solvePuzzle");
			this.updateBoardByCell(this.state.displayedBoard, state.currentBoard);

		} else if (state.uncalledConsonantsInPuzzle.length === 0 && this.state.uncalledConsonantsInPuzzle.length > 0) {
			console.log("No Consonants Left");
			this.props.soundManager.play("noConsonants");


		// bonus puzzle just solved
		} else if (state.bonusAnswerRevealed && !this.state.bonusAnswerRevealed && state.currentPuzzleSolved) {
			console.log("Bonus Puzzle Solved");
			// play solve theme, and stop playing bonus round think music (if it was playing)
			this.props.soundManager.stop("bonusThink");
			this.props.soundManager.play("solvePuzzle");
			this.updateBoardByCell(this.state.displayedBoard, state.currentBoard);

		// just moved to NextRoundPanel
		} else if (state.currentPanel === "NextRoundPanel" && state.currentPanel !== this.state.currentPanel) {
			console.log("Move to NextRoundPanel");
			this.updateBoardByCell(this.state.displayedBoard, 
				["@           @","             ","             ","@           @"]);


		// new letter called with no matches (or passed)
		} else if (state.currentPlayer !== this.state.currentPlayer && state.currentWedge !== "Bankrupt" && state.currentWedge !== "Lose a Turn") {
			console.log("Playing Buzzer");
			// play buzzer
			this.props.soundManager.play("buzzer");

		// bonus round answer revealed (not solved)
		} else if (state.bonusAnswerRevealed && !this.state.bonusAnswerRevealed) {
			console.log("Revealing Unsolved Bonus Puzzle");
			this.updateBoardByCell(this.state.displayedBoard, state.currentBoard);


		// start of bonus round timer
		} else if (state.bonusClockStarted && !this.state.bonusClockStarted) {
			console.log("Starting Bonus Round Think Music")
			// begin playing bonus round think music
			this.props.soundManager.play("bonusThink");

		// change in current board that isn't a solve - i.e. selection of letter in puzzle
		} else if (state.currentBoard !== this.state.currentBoard && !state.currentPuzzleSolved && !state.bonusAnswerRevealed) {
			console.log("Lighting Up Changes");
			this.lightUpChanges(this.state.displayedBoard, state.currentBoard);





		// all other cases
		} else {
			this.setState({
				displayedBoard: state.currentBoard
			});
		}


		// spinning wheel
		if (state.spinCount > this.state.spinCount) {
			this.spin();
		}
		this.setState(state);
	}

	replaceChar = (string, pos, newChar) => {
		var endStart = (+newChar.length + +pos);
		return string.substr(0, pos) + newChar + string.substr(endStart);
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
		var change = () => {
			var r = changeCoordinates[currentChange].row;
			var c = changeCoordinates[currentChange].col;
			newDisplayBoard[r] = this.replaceChar(newDisplayBoard[r], c, newBoard[r][c]);
			this.setState({
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
		var change = () => {
			var r = changeCoordinates[currentChange].row;
			var c = changeCoordinates[currentChange].col;
			newDisplayBoard[r] = this.replaceChar(newDisplayBoard[r], c, "*");
			// play ding sound
			this.props.soundManager.play("ding");
			this.setState({
				displayedBoard: newDisplayBoard
			});
			setTimeout(() => this.cellLightToLetter(r, c, newBoard[r][c]), 1500);
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
		setTimeout(this.finishSpin, this.state.spinTime);
	}

	finishSpin = () => {
		var wedges = [];
		if (this.state.currentRound < this.state.wheels.length) {
			wedges = this.state.wheels[this.state.currentRound];
		} else {
			wedges = this.state.wheels[this.state.wheels.length - 1];
		}
		var wedgeSpan = 360 / wedges.length;
		var playerLandedWedges = this.state.relativePointerArray.map((angle) => {
			return wedges.length
			- Math.floor(((this.state.wheelAngle - wedgeSpan/2 + angle + 360) % 360) / wedgeSpan) - 1;
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
	soundManager: PropTypes.instanceOf(SoundManager),
};
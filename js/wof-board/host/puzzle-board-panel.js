var React = require("react");
var PropTypes = require("prop-types");

import PuzzleLetterButton from "./puzzle-letter-button";
import PuzzleBoardGrid from "./puzzle-board-grid";

// panel showing category, current board, correct answer, and letters both available and called
export default class PuzzleBoardPanel extends React.Component {
	selectLetter = (letter) => {
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
			} else if (this.props.vowels.includes(letter)) {
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
	}
	solvePuzzle = () => {
		this.props.setGameState({
			currentBoard: this.props.gameState.currentFinalBoard,
			currentPuzzleSolved: true
		});
	}
	letterSelectable = (l) => {
		const {gameState, consonants, vowels} = this.props;
		if (gameState.usedLetters && gameState.usedLetters.includes(l)) {
			return false;
		} else if (consonants.includes(l) && !gameState.selectingConsonant) {
			return false;
		} else if (vowels.includes(l) && gameState.selectingConsonant) {
			return false;
		} else if (vowels.includes(l)
			&& gameState.players[gameState.currentPlayer].roundScore < 50) {
			return false;
		} else if (gameState.spinning || gameState.currentPuzzleSolved) {
			return false;
		}

		return true;
	}
	spinWheel = () => {
		const rotation = Math.random() * 450 + 270; // random number between 270 degrees (3/4 of a rotation) and 720 degrees (2 rotations)
		const spinForce = Math.random() * 0.03 + 0.06 // random number between 0.06 and 0.09 degrees per millisecond (for a 720deg spin, duration will be between 8 seconds and 12 seconds)
		const newAngle = this.props.gameState.wheelAngle + rotation;

		var wedges = [];
		if (this.props.gameState.currentRound < this.props.gameState.wheels.length) {
			wedges = this.props.gameState.wheels[this.props.gameState.currentRound];
		} else {
			wedges = this.props.gameState.wheels[this.props.gameState.wheels.length - 1];
		}
		var wedgeSpan = 360 / wedges.length;
		var playerLandedWedges = this.props.gameState.relativePointerArray.map((angle) => {
			return wedges.length
			- Math.floor(((newAngle - wedgeSpan/2 + angle + 360) % 360) / wedgeSpan) - 1;
		});

		this.props.setGameState({
			spinning: true,
			spinCount: this.props.gameState.spinCount + 1,
			spinRotation: rotation,
			spinTime: rotation/spinForce,
			currentWedge: wedges[playerLandedWedges[this.props.gameState.currentPlayer]].value,
			wheelAngle: newAngle,
		});

		setTimeout(() => {

			this.props.setGameState({
				spinning: false,
				lastLetterCalled: "",
			});

			if (this.props.gameState.currentWedge === "Bankrupt") {
				this.props.setPlayerRoundScore(this.props.gameState.currentPlayer, 0);
			}
			if (this.props.gameState.currentWedge === "Bankrupt" || this.props.gameState.currentWedge === "Lose a Turn") {
				this.props.goToNextPlayer();
			} else {
				this.props.setGameState({
					selectingConsonant: true
				});
			}
		}, rotation/spinForce);
	}
	goToNextRound = () => {
		this.props.setGameState({
			currentPanel: "NextRoundPanel",
		});
	}

	handleKeyPress = (event) => {
		var eventDetails = event;
		if (eventDetails.key === "Enter") {
			if (this.props.gameState.currentPuzzleSolved) {
				this.goToNextRound();
			} else if (!this.props.gameState.spinning && !this.props.gameState.selectingConsonant) {
				this.solvePuzzle();
			}
			
		} else if (this.props.letters.includes(eventDetails.key.toUpperCase())
			&& eventDetails.key.length === 1
			&& this.letterSelectable(eventDetails.key.toUpperCase())) {
			this.selectLetter(eventDetails.key.toUpperCase());
		}
	}

	render = () => {
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

		var actionRow;
		if (this.props.gameState.currentPuzzleSolved) {
			actionRow = (
				<div className="button-row">
					<div
						className="add-question-button"
						onClick={this.goToNextRound}>
						<p>Continue</p>
					</div>
				</div>
			);
		} else {
			const solveDisabled = this.props.gameState.spinning || this.props.gameState.selectingConsonant;
			const passDisabled = this.props.gameState.spinning;

			actionRow = (
				<div className="button-row">
					<div
						className={`add-question-button${solveDisabled ? " disabled" : ""}`}
						onClick={solveDisabled ? null : this.solvePuzzle}>
						<p>Solve</p>
					</div>
					<div 
						className={`add-question-button${solveDisabled ? " disabled" : ""}`}
						onClick={solveDisabled ? null : this.spinWheel}>
						<p>Spin</p>
					</div>
					<div
						className={`add-question-button${passDisabled ? " disabled" : ""}`}
						onClick={passDisabled ? null : this.props.goToNextPlayer}>
						<p>Pass</p>
					</div>
				</div>
			);
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
					{this.props.gameState.players.map((p, i) => (
						<div key={i} className="player-panel" style={{backgroundColor: p.colour}}>
							<div className="player-panel-inner">
								<p className="player-panel" style={{color: "white"}}>
									{this.props.gameState.currentPlayer == i ? "*" + p.roundScore + "*" : p.roundScore}
								</p>
							</div>
						</div>
					))}
				</div>
				<div className="letter-button-panel">
					{Array.prototype.map.call(this.props.letters, (l, i) => (
						<PuzzleLetterButton
							key={i}
							letter={l}
							onClick={this.letterSelectable(l) ? this.selectLetter : null}
							active={this.letterSelectable(l)}/>
					))}
				</div>
				{actionRow}
			</div>
		);
	}
}

PuzzleBoardPanel.propTypes = {
	roundNo: PropTypes.number,
	setGameState: PropTypes.func,
	goToNextPlayer: PropTypes.func,
	setPlayerRoundScore: PropTypes.func,
	gameState: PropTypes.object,
	letters: PropTypes.string,
	consonants: PropTypes.string,
	vowels: PropTypes.string,
};

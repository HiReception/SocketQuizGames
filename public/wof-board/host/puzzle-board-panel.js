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
	spinWheel = () => {
		this.props.setGameState({
			spinning: true
		});
	}
	goToNextRound = () => {
		this.props.setGameState({
			currentPanel: "NextRoundPanel",
		});
	}

	handleKeyPress = (event) => {
		var eventDetails = event;
		console.log(eventDetails.key);
		if (eventDetails.key === "Enter") {
			if (this.props.gameState.currentPuzzleSolved) {
				this.goToNextRound();
			} else {
				this.solvePuzzle();
			}
			
		} else if (this.props.letters.includes(eventDetails.key.toUpperCase()) && eventDetails.key.length === 1) {
			this.selectLetter(eventDetails.key.toUpperCase());
		}
	}

	render = () => {
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

		for (var i = 0; i < this.props.letters.length; i++) {
			var l = this.props.letters[i];
			var active = true;
			if (this.props.gameState.usedLetters && this.props.gameState.usedLetters.includes(l)) {
				active = false;
			} else if (this.props.consonants.includes(l) && !this.props.gameState.selectingConsonant) {
				active = false;
			} else if (this.props.vowels.includes(l) && this.props.gameState.selectingConsonant) {
				active = false;
			} else if (this.props.vowels.includes(l)
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

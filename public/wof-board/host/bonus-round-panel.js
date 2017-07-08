var React = require("react");
var PropTypes = require("prop-types");

import PuzzleBoardGrid from "./puzzle-board-grid";
import PuzzleLetterButton from "./puzzle-letter-button";

export default class BonusRoundPanel extends React.Component {

	solvePuzzle = () => {
		clearInterval(this.state.timer);
		this.props.setGameState({
			currentBoard: this.props.gameState.currentFinalBoard,
			currentPuzzleSolved: true,
			bonusAnswerRevealed: true
		});
	}
	revealCorrectAnswer = () => {
		clearInterval(this.state.timer);
		this.props.setGameState({
			currentBoard: this.props.gameState.currentFinalBoard,
			bonusAnswerRevealed: true
		});
	}
	handleKeyPress = (event) => {
		var eventDetails = event;
		console.log(eventDetails.key);
		if (eventDetails.key === "Enter") {
			if (!this.props.gameState.bonusClockStarted) {
				this.startClock();
			} else if (!this.props.gameState.currentPuzzleSolved) {
				this.solvePuzzle();
			}
			
		} else if (this.props.letters.includes(eventDetails.key.toUpperCase()) && eventDetails.key.length === 1) {
			this.selectLetter(eventDetails.key.toUpperCase());
		}
	}
	startClock = () => {
		this.props.setGameState({
			bonusClockStarted: true
		});
		var thisPanel = this;
		var timer = setInterval(function() {
			thisPanel.props.setGameState({
				bonusSecondsRemaining: thisPanel.props.gameState.bonusSecondsRemaining - 1
			});
			if (thisPanel.props.gameState.bonusSecondsRemaining <= 0) {
				console.log("time up");
				clearInterval(thisPanel.state.timer);
			}
			
		}, 1000);
		this.setState({
			timer: timer
		});
	}
	selectLetter = (letter) => {
		if (!this.props.gameState.selectedLetters.includes(letter)) {
			var newSelectedLetters = this.props.gameState.selectedLetters;
			newSelectedLetters.push(letter);
			var newVowelsLeft = this.props.gameState.bonusVowelsLeft;
			var newConsonantsLeft = this.props.gameState.bonusConsonantsLeft;
			if (this.props.vowels.includes(letter) && newVowelsLeft > 0) {
				newVowelsLeft--;
				this.props.setGameState({
					selectedLetters: newSelectedLetters,
					bonusVowelsLeft: newVowelsLeft
				});
			} else if (this.props.consonants.includes(letter) && newConsonantsLeft > 0) {
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
		
	}
	revealSelectedLetters = (selectedLetters) => {
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
	}
	render = () => {
		
		var statusText;
		if (this.props.gameState.bonusPuzzleSolved) {
			statusText = "Congratulations!";
		} else if (this.props.gameState.bonusPuzzleRevealed) {
			statusText = "Bonus Round Lost";
		} else if (this.props.gameState.bonusConsonantsLeft > 0 && this.props.gameState.bonusVowelsLeft > 0) {
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
		for (var i = 0; i < this.props.letters.length; i++) {
			var l = this.props.letters[i];
			var active = true;
			if ((this.props.vowels.includes(l) && this.props.gameState.bonusVowelsLeft === 0)
				|| (this.props.consonants.includes(l) && this.props.gameState.bonusConsonantsLeft === 0)
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
}

BonusRoundPanel.propTypes = {
	bonus: PropTypes.object,
	consonantsToSelect: PropTypes.number,
	vowelsToSelect: PropTypes.number,
	gameState: PropTypes.object,
	setGameState: PropTypes.func,
	letters: PropTypes.string,
	consonants: PropTypes.string,
	vowels: PropTypes.string,
};
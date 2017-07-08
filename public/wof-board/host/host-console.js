var React = require("react");
const io = require("socket.io-client");
var PropTypes = require("prop-types");

import NoPuzzlePanel from "./no-puzzle-panel";
import NextRoundPanel from "./next-round-panel";
import PuzzleBoardPanel from "./puzzle-board-panel";
import BonusRoundPanel from "./bonus-round-panel";


export default class HostConsole extends React.Component {
	constructor(props) {
		super(props);
		this.state = props.receivedState;
	}

	changeCurrentPanel = (panelName) => {
		this.setGameState({
			currentPanel: panelName,
			newPanelKey: this.state.newPanelKey + 1
		});
	}

	goToNextRound = () => {
		if (this.state.currentRound === this.state.puzzles.length - 1) {
			this.setGameState({
				currentPanel: "BonusRoundPanel",
				newPanelKey: this.state.newPanelKey + 1,
				currentBoard: this.state.bonus.finalBoard.map((row) => {
					return Array.prototype.map.call(row, (l) => {
						return this.props.letters.includes(l) ? "_" : l;
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
			this.setGameState({
				currentRound: this.state.currentRound + 1,
				currentPanel: "PuzzleBoardPanel",
				newPanelKey: this.state.newPanelKey + 1,
				currentBoard: newPuzzle.finalBoard.map((row) => {
					return Array.prototype.map.call(row, (l) => {
						return this.props.letters.includes(l) ? "_" : l;
					}).join("");
				}),
				usedLetters: "",
				lastLetterCalled: "",
				numberOfMatchesLast: 0,
				currentPuzzleSolved: false,
				currentFinalBoard: newPuzzle.finalBoard,
				currentAnswer: newPuzzle.answer,
				currentCategory: newPuzzle.category,
				uncalledConsonantsInPuzzle: this.props.consonants.split("").filter((l) => {
					return !this.state.usedLetters.includes(l) 
					&& newPuzzle.finalBoard.some((row) => {
						return row.includes(l);
					});
				})
			});
		}
	}

	setPlayerRoundScore = (player, score) => {
		var newPlayers = this.state.players;
		newPlayers[player].roundScore = score;
		this.setGameState({
			players: newPlayers
		});
	}

	setPlayerTotalScore = (player, score) => {
		var newPlayers = this.state.players;
		newPlayers[player].totalScore = score;
		this.setGameState({
			players: newPlayers
		});
	}

	setGameState = (changedItems) => {
		this.setState(changedItems);
		this.props.socket.emit("set state", changedItems);
	}

	setGameData = (newPuzzles, newBonus, newWheels) => {
		console.log(newPuzzles, newBonus);
		this.setGameState({
			puzzles: newPuzzles,
			bonus: newBonus,
			wheels: newWheels,
		});
		this.goToNextRound();
	}

	goToNextPlayer = () => {
		this.setGameState({
			currentPlayer: (this.state.currentPlayer + 1) % this.state.players.length,
			selectingConsonant: false,
		});
	}

	receiveNewState = (state) => {
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

	componentDidMount = () => {
		//socket.on("new player", this.handleNewPlayer);
		this.props.socket.on("new game state", this.receiveNewState);
	}

	componentWillUnmount = () => {
		//socket.removeListener("new player", this.handleNewPlayer);
		this.props.socket.removeListener("new game state", this.receiveNewState);
	}

	render = () => {
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
					letters={this.props.letters}
					consonants={this.props.consonants}
					vowels={this.props.vowels}
				/>
			);
			break;

		case "BonusRoundPanel":
			mainPanel = (
				<BonusRoundPanel
					key={this.state.newPanelKey}
					bonus={this.state.bonus}
					consonantsToSelect={this.props.bonusRoundConsonants}
					vowelsToSelect={this.props.bonusRoundVowels}
					setGameState={this.setGameState}
					gameState={this.state}
					letters={this.props.letters}
					consonants={this.props.consonants}
					vowels={this.props.vowels}
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

HostConsole.propTypes = {
	receivedState: PropTypes.object,
	socket: PropTypes.instanceOf(io.Socket),
	bonusRoundConsonants: PropTypes.number,
	bonusRoundVowels: PropTypes.number,
	letters: PropTypes.string,
	consonants: PropTypes.string,
	vowels: PropTypes.string,
};
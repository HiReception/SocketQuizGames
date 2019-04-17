const PropTypes = require("prop-types");
const io = require("socket.io-client");
import React, { Component } from "react";

import FFQuestionPanel from "./ff-question-panel";
import NextRoundPanel from "./next-round-panel";
import NoQuestionPanel from "./no-question-panel";
import PlayerDetailsPanel from "./player-details-panel";
import PlayerListing from "./player-listing";
import PlayerResultsPanel from "./player-results-panel";
import FFQuestionResultsPanel from "./ff-question-results-panel";
import PostMainGamePanel from "./post-main-game-panel";
import PreMainGamePanel from "./pre-main-game-panel";
import MainQuestionPanel from "./main-question-panel";
import LightsDownPanel from "./lights-down-panel";

import PlayerPanelToggleBar from "../../common/player-panel-bar";

export default class HostConsole extends Component {
	constructor(props) {
		super(props);
		this.state = props.receivedState;
	}

	componentDidMount = () => {
		this.props.socket.on("new player", this.handleNewPlayer);
	}

	componentWillUnmount = () => {
		this.props.socket.removeListener("new player", this.handleNewPlayer);
	}

	changeCurrentPanel = (panelName) => {
		this.setGameState({
			currentPanel: panelName,
			newPanelKey: this.state.newPanelKey + 1,
		});
	}

	togglePlayerPanel = () => {
		this.setState({
			playerPanelHidden: !this.state.playerPanelHidden,
		});
	}

	activateLifeline = (llName) => {
		if (this.state.mainGameLifelinesAvailable.includes(llName)) {
			switch (llName) {
			case "50:50":
				this.perform5050();
			// TODO add more lifelines:
				// phone a friend
				// ask the audience
				// double dip
				// ask the expert/three wise men (effectively just phone a friend with different music)
				// plus-one (does nothing within the game code)
			}

			// remove this lifeline from the available ones
			// (a single type of lifeline can potentially be used multiple times; only remove one at a time)
			const newLifelines = this.state.mainGameLifelinesAvailable;
			newLifelines.splice(newLifelines.indexOf(llName), 1);

			this.setGameState({
				mainGameLifelinesAvailable: newLifelines,
			});
		}
	}

	perform5050 = () => {
		const newQuestions = this.state.mainGameQuestionStack;
		const newCurrentQ = newQuestions[this.state.mainGameQuestionNo - 1];
		

		// pick random integer between 0 and 2 (inclusive) to decide which of the three incorrect answers to retain
		var randNo = Math.floor(Math.random() * 2);
		// if correct answer's index is below or equal to random number, add one to random integer
		if (newCurrentQ.options.findIndex(o => o.key === newCurrentQ.correctResponse) <= randNo) {
			randNo = randNo + 1;
		}

		// mark two answers not at random integer index AND not correct as disabled;
		newCurrentQ.options.forEach((o, index) => {
			if (o.key !== newCurrentQ.correctResponse && index !== randNo) {
				o.disabled = true;
			}
		});

		newQuestions[this.state.mainGameQuestionNo - 1] = newCurrentQ;

		this.setGameState({
			mainGameQuestionStack: newQuestions
		});
	}

	activatePAF = () => {

	}

	beginPAFtimer = () => {

	}

	endPAFCall = () => {

	}

	activateATA = () => {

	}

	beginATAVoting = () => {

	}

	endATAVoting = () => {
		
	}

	handleNewPlayer = (screenName) => {
		var newPlayer = {
			screenName: screenName,
			score: 0,
			hidden: false,
			playedMainGame: false,
		};
		const newPlayers = this.state.players;

		newPlayers.push(newPlayer);
		this.setGameState({
			players: newPlayers,
		});
	}

	formatNumber = (number) => {
		return this.state.prefix + number.toLocaleString(this.state.locale, {minimumFractionDigits: 0}) + this.state.suffix;
	}

	changePlayerScore = (screenName, newScore) => {
		const newPlayers = this.state.players;
		newPlayers.find((player) => {
			return player.screenName === screenName;
		}).score = newScore;
		this.setGameState({
			players: newPlayers,
		});
	}

	showPlayerDetails = (name, event) => {
		console.log(`showPlayerDetails(${ name },${ event }) called`);
		this.setGameState({
			detailPlayerName: name,
		});
	}

	clearPlayerDetails = () => {
		this.setGameState({
			detailPlayerName: "",
		});
	}

	hidePlayer = (playerName) => {
		const newPlayers = this.state.players;
		newPlayers.find((player) => {
			return player.screenName === playerName;
		}).hidden = true;
		this.setGameState({
			players: newPlayers,
		});
	}

	unhidePlayer = (playerName) => {
		const newPlayers = this.state.players;
		newPlayers.find((player) => {
			return player.screenName === playerName;
		}).hidden = false;
		this.setGameState({
			players: newPlayers,
		});
	}

	toggleMoneyTree = () => {
		this.setGameState({
			mainGameMoneyTreeVisible: !this.state.mainGameMoneyTreeVisible
		});
	}

	beginMainGame = () => {
		const questionDeck = this.state.mainGameMoneyTree.map((level, index) => {
			const availableQuestions = this.state.mainGameQuestions.filter(q => q.valueLevel == index + 1);
			return availableQuestions[Math.floor(Math.random() * (availableQuestions.length))];
		});
		this.setGameState({
			currentPanel: "LightsDownPanel",
			mainGameQuestionStack: questionDeck,
			mainGameQuestionNo: 1,
		});
	}

	beginQuestion = () => {
		this.setGameState({
			currentPanel: "MainQuestionPanel",
		});
	}

	goToNextFF = () => {
		var newPlayers = this.state.players;
		newPlayers.forEach(p => {
			if (p.screenName === this.state.mainGamePlayer.screenName) {
				p.score += this.state.mainGameWinnings;
			}
		});

		this.setGameState({
			players: newPlayers,
			mainGamePlayer: {},
			mainGameWinnings: 0,
			mainGameWinningsString: "",
			mainGameQuestionStack: [],
			mainGameChosenAnswer: "",
			mainGameCorrectRevealed: false,
			mainGameOptionsShown: 0,
			mainGameQuestionNo: 1,
			currentPanel: "FFQuestionPanel",
			ffCurrentQuestion: this.state.ffCurrentQuestion + 1,
		});
	}

	goToNextRound = () => {
		this.setGameState({
			ffCurrentQuestion: this.state.ffCurrentQuestion + 1,
			currentPanel: "FFQuestionPanel",
			newPanelKey: this.state.newPanelKey + 1,
		});
	}

	setGameState = (changedItems) => {
		console.log("setGameState called");
		this.setState(changedItems);
		this.props.socket.emit("set state", changedItems);
	}

	setGameData = (configuration, mainQuestions, ffQuestions) => {
		console.log(ffQuestions);

		this.setGameState({
			ffQuestions: ffQuestions,
			mainGameQuestions: mainQuestions,
			mainGameMoneyTree: configuration.levels,
			prefix: configuration.prefix || "",
			suffix: configuration.suffix || "",
			ffCurrentQuestion: 0,
			players: this.state.players,
			currentPanel: "FFQuestionPanel",
			newPanelKey: this.state.newPanelKey + 1,
			mainGameStartingLifelines: configuration.lifelines,
		});
	}

	render = () => {
		const { players, detailPlayerName, currentPanel,
			newPanelKey, ffCurrentQuestion, ffQuestions, playerPanelHidden } = this.state;
		// render player list panel
		let playerPanel;
		if (detailPlayerName === "") {
			const nonHiddenPlayers = players.filter((player) => {
				return !player.hidden;
			});
			if (nonHiddenPlayers.length !== 0) {
				const playersByScore = nonHiddenPlayers.sort((p1, p2) => {
					return p1.score > p2.score;
				});

				const list = playersByScore.map((player) => {
					const waiting = ffQuestions.length > 0 && !ffQuestions[ffCurrentQuestion].answers.some((a) => {
						return a.screenName === player.screenName;
					});
					return (
						<PlayerListing
							onClick={this.showPlayerDetails.bind(this, player.screenName)}
							player={player}
							key={player}
							waitingForAnswer={waiting}
							formatNumber={this.formatNumber}/>
					);
				});
				playerPanel = <div>{list}</div>;
			} else {
				playerPanel = <div><p className='no-players'>No Players</p></div>;
			}
		} else {
			const player = players.find((player) => {
				return player.screenName === detailPlayerName;
			});
			playerPanel = (<PlayerDetailsPanel
				player={player}
				clearPlayerDetails={this.clearPlayerDetails}
				hidden={player.hidden}
				hidePlayer={this.hidePlayer}
				unhidePlayer={this.unhidePlayer}
				changePlayerScore={this.changePlayerScore}/>);
		}


		let mainPanel;
		switch (currentPanel) {
		case "NoQuestionPanel":
			mainPanel = (
				<NoQuestionPanel
					key={newPanelKey}
					setGameData={this.setGameData}/>
			);
			break;

		case "NextRoundPanel":
			mainPanel = (
				<NextRoundPanel
					key={newPanelKey}
					lastRound={ffCurrentQuestion === ffQuestions.length - 1}
					callback={this.goToNextRound}
					socket={this.props.socket}/>
			);
			break;

		case "FFQuestionPanel":
			mainPanel = (<FFQuestionPanel
				key={newPanelKey}
				players={players}
				changePlayerScore={this.changePlayerScore}
				gameState={this.state}
				setGameState={this.setGameState}
				question={ffQuestions[ffCurrentQuestion]}
				socket={this.props.socket}/>);
			break;

		case "FFQuestionResultsPanel":
			mainPanel = (<FFQuestionResultsPanel
				key={newPanelKey}
				question={ffQuestions[ffCurrentQuestion]}
				gameState={this.state}
				setGameState={this.setGameState}
				socket={this.props.socket}/>);
			break;

		case "PlayerResultsPanel":
			mainPanel = (<PlayerResultsPanel
				key={newPanelKey}
				gameState={this.state}
				setGameState={this.setGameState}
				socket={this.props.socket}/>);
			break;

		case "PreMainGamePanel":
			mainPanel = (<PreMainGamePanel
				key={newPanelKey}
				incomingPlayerName={this.state.mainGamePlayer.screenName}
				moneyTreeVisible={this.state.mainGameMoneyTreeVisible}
				toggleMoneyTree={this.toggleMoneyTree}
				beginMainGame={this.beginMainGame}
				socket={this.props.socket}/>);
			break;

		case "LightsDownPanel":
			mainPanel = (<LightsDownPanel
				key={newPanelKey}
				playerName={this.state.mainGamePlayer.screenName}
				questionNo={this.state.mainGameQuestionNo}
				questionValue={this.state.mainGameMoneyTree[this.state.mainGameQuestionNo - 1].textValue}
				moneyTreeVisible={this.state.mainGameMoneyTreeVisible}
				toggleMoneyTree={this.toggleMoneyTree}
				beginQuestion={this.beginQuestion}
				socket={this.props.socket}/>);
			break;

		case "MainQuestionPanel":
			mainPanel = (<MainQuestionPanel
				key={newPanelKey}
				question={this.state.mainGameQuestionStack[this.state.mainGameQuestionNo - 1]}
				setGameState={this.setGameState}
				gameState={this.state}
				socket={this.props.socket}
				formatNumber={this.formatNumber}
				activateLifeline={this.activateLifeline}/>);
			break;

		case "PostMainGamePanel":
			mainPanel = (<PostMainGamePanel
				key={newPanelKey}
				departingPlayerName={this.state.mainGamePlayer.screenName}
				departingPlayerWinnings={this.state.mainGameWinningsString}
				callback={this.goToNextFF}
				socket={this.props.socket}/>);
			break;
		default:
			mainPanel = null;
			break;
		}

		return (
			<div>
				<div className='main-panel'>
					<div id='player-list' className={`content${
							playerPanelHidden ? " hidden" : "" }`}>
						{playerPanel}
					</div>
					<div
						id='question-panel'
						className='content'>
						{mainPanel}
					</div>
				</div>
				<PlayerPanelToggleBar
					currentlyHidden={playerPanelHidden}
					toggle={this.togglePlayerPanel}/>
			</div>
		);
	}
}

HostConsole.propTypes = {
	receivedState: PropTypes.object,
	socket: PropTypes.instanceOf(io.Socket),
};
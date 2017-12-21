const PropTypes = require("prop-types");
const io = require("socket.io-client");
import React, { Component } from "react";

import OpenQuestionPanel from "./open-question-panel";
import NextRoundPanel from "./next-round-panel";
import NoQuestionPanel from "./no-question-panel";
import PlayerDetailsPanel from "./player-details-panel";
import PlayerListing from "./player-listing";
import PlayerResultsPanel from "./player-results-panel";
import QuestionResultsPanel from "./question-results-panel";

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

	handleNewPlayer = (screenName) => {
		console.log("new player:");
		console.log(screenName);
		var newPlayer = {
			screenName: screenName,
			score: 0,
			hidden: false,
			correctAnswers: 0,
			aggregateTime: 0.0,
			currentQuestionAnswer: "",
			answeredCurrentQuestion: false,
			answeredCurrentQuestionCorrectly: false,
			currentQuestionTime: 0.0,
		};
		const newPlayers = this.state.players;

		newPlayers.push(newPlayer);
		this.setGameState({
			players: newPlayers,
		});
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

	goToNextRound = () => {
		this.setGameState({
			currentQuestion: this.state.currentQuestion + 1,
			currentPanel: "OpenQuestionPanel",
			newPanelKey: this.state.newPanelKey + 1,
		});
	}

	setGameState = (changedItems) => {
		console.log("setGameState called");
		this.setState(changedItems);
		this.props.socket.emit("set state", changedItems);
	}

	setGameData = (questions) => {
		console.log(questions);

		this.setGameState({
			questions: questions,
			currentQuestion: 0,
			players: this.state.players,
			currentPanel: "OpenQuestionPanel",
			newPanelKey: this.state.newPanelKey + 1,
		});
	}

	render = () => {
		const { players, detailPlayerName, currentPanel,
			newPanelKey, currentQuestion, questions } = this.state;
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
					const waiting = questions.length > 0 && !questions[currentQuestion].answers.some((a) => {
						return a.screenName === player.screenName;
					});
					return (
						<PlayerListing
							onClick={this.showPlayerDetails.bind(this, player.screenName)}
							player={player}
							key={player}
							waitingForAnswer={waiting}/>
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
					lastRound={currentQuestion === questions.length - 1}
					callback={this.goToNextRound}/>
			);
			break;

		case "OpenQuestionPanel":
			mainPanel = (<OpenQuestionPanel
				key={newPanelKey}
				players={players}
				changePlayerScore={this.changePlayerScore}
				gameState={this.state}
				setGameState={this.setGameState}
				question={questions[currentQuestion]}
				socket={this.props.socket}/>);
			break;

		// TODO QuestionResultsPanel
		case "QuestionResultsPanel":
			mainPanel = (<QuestionResultsPanel
				key={newPanelKey}
				question={questions[currentQuestion]}
				gameState={this.state}
				setGameState={this.setGameState}/>);
			break;
		// TODO PlayerResultsPanel
		case "PlayerResultsPanel":
			mainPanel = (<PlayerResultsPanel
				key={newPanelKey}
				gameState={this.state}
				setGameState={this.setGameState}/>);
			break;
		default:
			mainPanel = null;
			break;
		}

		return (
			<div>
				<div className='main-panel'>
					<div id='player-list' className={`content${
							this.state.playerPanelHidden ? " hidden" : "" }`}>
						{playerPanel}
					</div>
					<div
						id='question-panel'
						className='content'>
						{mainPanel}
					</div>
				</div>
				<PlayerPanelToggleBar
					currentlyHidden={this.state.playerPanelHidden}
					toggle={this.togglePlayerPanel}/>
			</div>
		);
	}
}

HostConsole.propTypes = {
	receivedState: PropTypes.object,
	socket: PropTypes.instanceOf(io.Socket),
};
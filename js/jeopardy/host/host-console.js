const React = require("react");
const io = require("socket.io-client");
const PropTypes = require("prop-types");
const $ = require("jquery");

import PlayerDetailsPanel from "./player-details-panel";
import PlayerListing from "./player-listing";
import NextRoundPanel from "./next-round-panel";
import SelectQuestionPanel from "./select-question-panel";
import NoQuestionPanel from "./no-question-panel";
import OpenQuestionPanel from "./open-question-panel";
import FinalJeopardyPanel from "./final-jeopardy-panel";
import PlayerPanelToggleBar from "../../common/player-panel-bar";


export default class HostConsole extends React.Component {
	constructor(props) {
		super(props);
		const newState = props.receivedState;
		newState.playerPanelHidden = true;
		this.state = newState;
	}

	componentDidMount = () => {
		this.props.socket.on("new player", this.handleNewPlayer);
	}

	componentWillUnmount = () => {
		this.props.socket.removeListener("new player", this.handleNewPlayer);
	}

	togglePlayerPanel = () => {
		this.setState({
			playerPanelHidden: !this.state.playerPanelHidden,
		});
	}

	setAnsweringPlayer = (screenName) => {
		console.log(`HostConsole setting answering player to ${ screenName}`);
		this.setGameState({
			playerAnswering: this.state.players.find((player) => {
				return player.screenName === screenName;
			}),
		});
	}

	clearAnsweringPlayer = () => {
		this.setGameState({
			playerAnswering: {},
		});
	}

	showClue = (catNo, clueNo, clueValue) => {
		console.log(catNo);
		this.setGameState({
			currentCatNo: catNo,
			currentClueNo: clueNo,
			currentClueValue: clueValue,
			currentPanel: "OpenQuestionPanel",
			newPanelKey: this.state.newPanelKey + 1,
		});
	}

	endClue = () => {
		const newRounds = this.state.rounds;
		newRounds[this.state.currentRound].categories[this.state.currentCatNo]
			.clues[this.state.currentClueNo].active = false;
		const newCluesLeft = this.state.cluesLeft - 1;
		this.setGameState({
			buzzersOpen: false,
			rounds: newRounds,
			cluesLeft: newCluesLeft,
			currentPanel: newCluesLeft === 0 ?
				"NextRoundPanel" : "SelectQuestionPanel",
			newPanelKey: this.state.newPanelKey + 1,
			playerAnswering: {},
			wrongPlayerNames: [],
			ddWagerEntered: false,
			ddWagerSubmittable: false,
		});
	}

	changeCurrentPanel = (panelName) => {
		this.setGameState({
			currentPanel: panelName,
			newPanelKey: this.state.newPanelKey + 1,
		});
	}

	handleNewPlayer = (screenName) => {
		console.log("new player:");
		console.log(screenName);
		const newPlayer = {
			screenName: screenName,
			score: 0,
			hidden: false
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
		if (this.state.currentRound === this.state.rounds.length - 1) {
			this.setGameState({
				finalEligiblePlayers: this.state.players.filter((player) => {
					return player.score > 0;
				}).sort((p1, p2) => {
					return p1.score < p2.score; // sort Final players so that responses are revealed in ascending order of score going in
				}),
				currentPanel: "FinalJeopardyPanel",
				newPanelKey: this.state.newPanelKey + 1,
			});
		} else {
			const newRound = this.state.rounds[this.state.currentRound + 1];
			const playersToSort = this.state.players;
			playersToSort.sort((p1, p2) => {
				return p1.score < p2.score;
			});
			this.setGameState({
				selectingPlayer: playersToSort[0].screenName,
				currentRound: this.state.currentRound + 1,
				cluesLeft: [].concat(...newRound.categories.map((cat) => {
					return cat.clues;
				})).length,
				currentPanel: "SelectQuestionPanel",
				newPanelKey: this.state.newPanelKey + 1,
			});
		}
	}

	setGameState = (changedItems) => {
		console.log("setGameState called");
		this.setState(changedItems);
		this.props.socket.emit("set state", changedItems);
	}

	setGameData = (rounds, final, firstSelectingPlayer, prefix, suffix) => {
		console.log(rounds, final, firstSelectingPlayer, prefix, suffix);
		this.setGameState({
			prefix: prefix,
			suffix: suffix,
			rounds: rounds,
			final: final,
			players: this.state.players,
			currentRound: 0,
			currentPanel: rounds.length > 0 ?
				"SelectQuestionPanel" : "FinalJeopardyPanel",
			newPanelKey: this.state.newPanelKey + 1,
			selectingPlayer: firstSelectingPlayer,
			cluesLeft: [].concat(...rounds[0].categories.map((cat) => {
				return cat.clues;
			})).length,
		});
	}


	setSelectingPlayer = (screenName) => {
		console.log(`HostConsole.setSelectingPlayer called with screenName "
			+ ${ screenName}`);
		this.setGameState({
			selectingPlayer: screenName,
		});
	}

	render = () => {
		// render player list panel
		let playerPanel;
		if (this.state.detailPlayerName === "") {
			const nonHiddenPlayers = this.state.players.filter((player) => {
				return !player.hidden;
			});
			if (nonHiddenPlayers.length !== 0) {
				const playersByScore = nonHiddenPlayers.sort((p1, p2) => {
					return p1.score < p2.score;
				});
				const list = [];
				for (let i = 0; i < playersByScore.length; i++) {
					const player = playersByScore[i];
					list.push((
						<PlayerListing
							onClick={this.showPlayerDetails.bind(this, player.screenName)}
							player={player}
							key={i}
							answering={!$.isEmptyObject(this.state.playerAnswering) &&
								this.state.playerAnswering.screenName === player.screenName}
							lockedOut={!$.isEmptyObject(this.state.playerAnswering) &&
								this.state.playerAnswering.screenName !== player.screenName}
							selecting={this.state.selectingPlayer === player.screenName}
							prefix={this.state.prefix}
							suffix={this.state.suffix}/>));
				}
				playerPanel = <div>{list}</div>;
			} else {
				playerPanel = <div><p className='no-players'>No Players</p></div>;
			}
		} else {
			const player = this.state.players.find((player) => {
				return player.screenName === this.state.detailPlayerName;
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
		switch (this.state.currentPanel) {
		case "NoQuestionPanel":
			mainPanel = (
				<NoQuestionPanel
					key={this.state.newPanelKey}
					players={this.state.players}
					setGameData={this.setGameData}
					socket={this.props.socket}/>
			);
			break;

		case "NextRoundPanel":
			mainPanel = (
				<NextRoundPanel
					key={this.state.newPanelKey}
					lastRound={this.state.currentRound === this.state.rounds.length - 1}
					callback={this.goToNextRound}/>
			);
			break;

		case "SelectQuestionPanel":
			mainPanel = (
				<SelectQuestionPanel
					key={this.state.newPanelKey}
					round={this.state.rounds[this.state.currentRound]}
					callback={this.showClue}
					prefix={this.state.prefix}
					suffix={this.state.suffix}/>
			);
			break;
		case "DailyDoublePanel":
		case "OpenQuestionPanel": {
			const selectingPlayer = this.state.players.find((player) => {
				return player.screenName === this.state.selectingPlayer;
			});
			console.log(selectingPlayer);
			mainPanel = (<OpenQuestionPanel
				key={this.state.newPanelKey}
				catName={this.state.rounds[this.state.currentRound]
					.categories[this.state.currentCatNo].name}
				clue={this.state.rounds[this.state.currentRound]
					.categories[this.state.currentCatNo]
					.clues[this.state.currentClueNo]}
				players={this.state.players}
				value={this.state.currentClueValue}
				endClue={this.endClue}
				changePlayerScore={this.changePlayerScore}
				ddMaxWager={Math.max(...this.state.rounds[this.state.currentRound]
					.values.amounts)}
				selectingPlayer={selectingPlayer}
				setSelectingPlayer={this.setSelectingPlayer}
				setAnsweringPlayer={this.setAnsweringPlayer}
				clearAnsweringPlayer={this.clearAnsweringPlayer}
				gameState={this.state}
				setGameState={this.setGameState}
				prefix={this.state.prefix}
				suffix={this.state.suffix}
				socket={this.props.socket}/>);
			break;
		}
		// FinalJeopardyResponsePanel is only on Display,
		// so host shows normal Final panel in that scenario
		case "FinalJeopardyPanel":
		case "FinalJeopardyResponsePanel":
			mainPanel = (
				<FinalJeopardyPanel
					key={this.state.newPanelKey}
					final={this.state.final}
					changePlayerScore={this.changePlayerScore}
					eligiblePlayers={this.state.finalEligiblePlayers}
					gameState={this.state}
					setGameState={this.setGameState}
					prefix={this.state.prefix}
					suffix={this.state.suffix}
					socket={this.props.socket}/>
			);
			break;
		default:
			mainPanel = null;
			break;
		}

		return (
			<div className="panel-bar-ctr">
				<div className='main-panel'>
					<div
						id='player-list'
						className={`content${
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
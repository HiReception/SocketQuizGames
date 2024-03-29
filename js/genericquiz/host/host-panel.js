var $ = require("jquery");
var React = require("react");
var PropTypes = require("prop-types");
const io = require("socket.io-client");

import PlayerPanelToggleBar from "../../common/player-panel-bar";
import PlayerDetailsPanel from "./player-details-panel";
import PlayerListing from "./player-listing";
import OpenQuestionPanel from "./open-question-panel";

export default class HostPanel extends React.Component {
	constructor(props) {
		super(props);
		const newState = props.receivedState;
		newState.playerPanelHidden = true;
		this.state = newState;
	}

	handleNewPlayer = ({screenName, id}) => {
		var newPlayer = {
			id: id,
			screenName: screenName,
			colour: this.state.playerColours[this.state.players.length % this.state.playerColours.length],
			score: isNaN(this.state.startingScore) ? 0 : this.state.startingScore,
			hidden: false,
		};
		
		var newPlayers = this.state.players;

		newPlayers.push(newPlayer);
		this.setGameState({
			players: newPlayers
		});
	}

	setStartingScore = (event) => {
		this.setGameState({
			startingScore: event.target.value,
		});
	}

	setCorrectPoints = (event) => {
		this.setGameState({
			correctPoints: event.target.value,
		});
	}

	setIncorrectPoints = (event) => {
		this.setGameState({
			incorrectPoints: event.target.value,
		});
	}

	setGameState = (newState) => {
		this.setState(newState);

		this.props.socket.emit("set state", newState);
	}

	handleNewAnswer = (details) => {
		if (this.state.buzzersOpen) {

			var newPlayerAnswering = this.state.players.find(function(p) {
				return p.id === details.player;
			});
			if (!newPlayerAnswering.hidden) {
				this.setGameState({
					buzzersOpen: false,
					playerAnswering: newPlayerAnswering
				});

				this.props.socket.emit("play sound", "buzz-in");
			}

		}
	}

	showPlayerDetails = (id) => {
		this.setGameState({
			detailPlayerID: id,
		});
	}

	clearPlayerDetails = () => {
		this.setGameState({
			detailPlayerID: "",
		});
	}

	hidePlayer = (id) => {
		const newPlayers = this.state.players;
		newPlayers.find((player) => {
			return player.id === id;
		}).hidden = true;
		this.setGameState({
			players: newPlayers,
		});
	}

	unhidePlayer = (id) => {
		const newPlayers = this.state.players;
		newPlayers.find((player) => {
			return player.id === id;
		}).hidden = false;
		this.setGameState({
			players: newPlayers,
		});
	}

	changePlayerScore = (id, newScore) => {
		const newPlayers = this.state.players;
		newPlayers.find((player) => {
			return player.id === id;
		}).score = newScore;
		this.setGameState({
			players: newPlayers,
		});
	}

	toggleBuzzers = () => {
		this.setGameState({
			buzzersOpen: !(this.state.buzzersOpen),
			playerAnswering: {}
		});
	}

	modifyScore = (id, scoreChange) => {
		var newPlayers = this.state.players;
		newPlayers.map(function(p) {
			if (p.id === id) {
				p.score += scoreChange;
			}
		});

		this.setGameState({
			players: newPlayers
		});
	}

	togglePlayerPanel = () => {
		this.setGameState({
			playerPanelHidden: !this.state.playerPanelHidden,
		});
	}


	componentDidMount = () => {
		this.props.socket.on("new player", this.handleNewPlayer);
		this.props.socket.on("new answer", this.handleNewAnswer);
	}

	componentWillUnmount = () => {
		this.props.socket.removeListener("new player", this.handleNewPlayer);
		this.props.socket.removeListener("new answer", this.handleNewAnswer);
	}

	render = () => {
		// render player list panel
		let playerPanel;
		let playerPanelContent;
		if (this.state.detailPlayerID === "") {
			const nonHiddenPlayers = this.state.players.filter((player) => {
				return !player.hidden;
			});
			if (nonHiddenPlayers.length !== 0) {
				const playersByScore = nonHiddenPlayers.sort((p1, p2) => {
					return p1.score < p2.score;
				});
				const list = playersByScore.map((player) => {
					return (
						<PlayerListing
							onClick={this.showPlayerDetails.bind(this, player.id)}
							player={player}
							key={player.id}
							answering={!$.isEmptyObject(this.state.playerAnswering) &&
								this.state.playerAnswering.id === player.id}
							lockedOut={!$.isEmptyObject(this.state.playerAnswering) &&
								this.state.playerAnswering.id !== player.id}
							selecting={this.state.selectingPlayer === player.id}
							prefix={this.state.prefix}
							suffix={this.state.suffix}/>);
				});
				playerPanelContent = list;
				
			} else {
				playerPanelContent = <div key={0} className="no-players"><p className='no-players'>No Players</p></div>;
			}
			playerPanel = (
				<div>
					{playerPanelContent}
				</div>
			);
		} else {
			const player = this.state.players.find((player) => {
				return player.id === this.state.detailPlayerID;
			});
			playerPanel = (<PlayerDetailsPanel
				player={player}
				clearPlayerDetails={this.clearPlayerDetails}
				hidden={player.hidden}
				hidePlayer={this.hidePlayer}
				unhidePlayer={this.unhidePlayer}
				changePlayerScore={this.changePlayerScore}/>);
		}

		return (
			<div>
				<div id="body-header" className="header">
					<p id="game-title">{this.props.gameTitle}</p>
					<p id="game-code">{this.props.gameCode}</p>
				</div>
				<div className="host-panel">
					<div id="player-list" className={`content${ this.state.playerPanelHidden ?  " hidden" : ""}`}>
						{playerPanel}
					</div>
					<div id="body-panel">
						<div id="question-panel" className="content">
							<OpenQuestionPanel
								modifyScore={this.modifyScore}
								toggleBuzzers={this.toggleBuzzers}
								buzzersOpen={this.state.buzzersOpen}
								playerAnswering={this.state.playerAnswering}
								socket={this.props.socket}
								startingScore={parseInt(this.state.startingScore)}
								setStartingScore={this.setStartingScore}
								correctPoints={parseInt(this.state.correctPoints)}
								setCorrectPoints={this.setCorrectPoints}
								incorrectPoints={parseInt(this.state.incorrectPoints)}
								setIncorrectPoints={this.setIncorrectPoints}/>
						</div>
					</div>
				</div>
				<PlayerPanelToggleBar
					currentlyHidden={this.state.playerPanelHidden}
					toggle={this.togglePlayerPanel}/>

			</div>
		);
	}
}

HostPanel.propTypes = {
	gameCode: PropTypes.string,
	gameTitle: PropTypes.string,
	receivedState: PropTypes.object,
	socket: PropTypes.instanceOf(io.Socket),
};
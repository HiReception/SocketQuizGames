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

	handleNewPlayer = (screenName) => {
		var newPlayer = {
			screenName: screenName,
			colour: this.state.playerColours[this.state.players.length % this.state.playerColours.length],
			score: isNaN(this.state.startingScore) ? 0 : this.state.startingScore,
		};
		
		var newPlayers = this.state.players;

		newPlayers.push(newPlayer);
		this.setGameState({
			players: newPlayers
		});
	}

	setStartingScore = (event) => {
		console.log("event = ");
		console.log(event);
		this.setGameState({
			startingScore: event.target.value,
		});
	}

	setCorrectPoints = (event) => {
		console.log("event = ");
		console.log(event);
		this.setGameState({
			correctPoints: event.target.value,
		});
	}

	setIncorrectPoints = (event) => {
		console.log("event = ");
		console.log(event);
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
				return p.screenName === details.player;
			});
			this.setGameState({
				buzzersOpen: false,
				playerAnswering: newPlayerAnswering
			});

			this.props.socket.emit("play sound", "buzz-in");
		}
	}

	showPlayerDetails = (name) => {
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

	changePlayerScore = (screenName, newScore) => {
		const newPlayers = this.state.players;
		newPlayers.find((player) => {
			return player.screenName === screenName;
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

	modifyScore = (screenName, scoreChange) => {
		var newPlayers = this.state.players;
		newPlayers.map(function(p) {
			if (p.screenName === screenName) {
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
		if (this.state.detailPlayerName === "") {
			const nonHiddenPlayers = this.state.players.filter((player) => {
				return !player.hidden;
			});
			if (nonHiddenPlayers.length !== 0) {
				const playersByScore = nonHiddenPlayers.sort((p1, p2) => {
					return p1.score < p2.score;
				});
				const list = playersByScore.map((player, index) => {
					return (
						<PlayerListing
							onClick={this.showPlayerDetails.bind(this, player.screenName)}
							player={player}
							key={index}
							answering={!$.isEmptyObject(this.state.playerAnswering) &&
								this.state.playerAnswering.screenName === player.screenName}
							lockedOut={!$.isEmptyObject(this.state.playerAnswering) &&
								this.state.playerAnswering.screenName !== player.screenName}
							selecting={this.state.selectingPlayer === player.screenName}
							prefix={this.state.prefix}
							suffix={this.state.suffix}/>);
				});
				console.log(list);
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
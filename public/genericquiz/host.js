var React = require("react");
var ReactDOM = require("react-dom");
var PropTypes = require("prop-types");
var socket = require("socket.io-client")();
var $ = require("jquery");
import PlayerPanelToggleBar from "../common/player-panel-bar";

var players = [];

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return "";
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const playerColours = ["#EB0C29", "#FF8400", "#007A21", "#00FF44", "#870096", "#1F2DF0", "#05ABE3", "#E305DF"];

function shuffle(a) {
	var j, x, i;
	for (i = a.length; i; i--) {
		j = Math.floor(Math.random() * i);
		x = a[i - 1];
		a[i - 1] = a[j];
		a[j] = x;
	}
}


var gameCode = getParameterByName("gamecode");

shuffle(playerColours);

socket.on("connect_timeout", function() {
	console.log("connection timeout");
});

socket.on("connect", function() {
	console.log("connected");
	socket.emit("host request", {
		gameCode: gameCode,
	});
});

socket.on("connect_error", function(err) {
	console.log("connection error: " + err);
});

socket.on("game details", function(details) {
	socket.emit("send question", {
		type: "buzz-in",
		open: true
	});

	console.log("Game Details received");
	console.log(details);
	var state;
	if ($.isEmptyObject(details.gameState)) {
		state = {
			players: [],
			detailPlayerName: "",
			playerAnswering: {},
			buzzersOpen: false
		};
		socket.emit("set state", state);
	} else {
		state = details.gameState;
	}
	ReactDOM.render(<HostPanel gameCode={details.gameCode} gameTitle={details.gameTitle} receivedState={state} socket={socket}/>, document.getElementById("host-panel"));
});

class HostPanel extends React.Component {
	constructor(props) {
		super(props);
		const newState = props.receivedState;
		newState.playerPanelHidden = true;
		this.state = newState;
	}

	handleNewPlayer = (playerDetails) => {
		console.log("new player:");
		console.log(playerDetails);
		playerDetails.colour = playerColours[this.state.players.length % playerColours.length];
		playerDetails.score = 0;
		var newPlayers = this.state.players;

		newPlayers.push(playerDetails);
		this.setGameState({
			players: newPlayers
		});
	}

	setGameState = (newState) => {
		this.setState(newState);

		socket.emit("set state", newState);
	}

	handleNewAnswer = (details) => {
		if (this.state.buzzersOpen) {
			console.log("new answer:");
			console.log(details);
			console.log(this);

			var newPlayerAnswering = this.state.players.find(function(p) {
				console.log(p.screenName + " vs " + details.player.screenName);
				return p.screenName === details.player.screenName;
			});
			this.setGameState({
				buzzersOpen: false,
				playerAnswering: newPlayerAnswering
			});

			socket.emit("play sound", "buzz-in");
		}
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
		console.log(this);
		this.setGameState({
			buzzersOpen: !(this.state.buzzersOpen),
			playerAnswering: {}
		});
	}

	modifyScore = (screenName, scoreChange) => {
		var newPlayers = this.state.players;
		console.log(this);
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
		socket.on("new player", this.handleNewPlayer);
		socket.on("new answer", this.handleNewAnswer);
	}

	componentWillUnmount = () => {
		socket.removeListener("new player", this.handleNewPlayer);
		socket.removeListener("new answer", this.handleNewAnswer);
	}

	render = () => {
		var playerCountString = players.length === 1 ? "1 Player" : players.length + " Players";
		var playerList = [];
		if (this.state.players.length != 0) {
			var playersByScore = this.state.players.sort(function(a,b) {
				return a.score > b.score;
			});

			for (var i = 0; i < playersByScore.length; i++) {
				var p = playersByScore[i];
				var answering = this.state.playerAnswering === p;
				playerList.push(<PlayerListing player={p} answering={answering} key={i} onClick={this.showPlayerDetails.bind(this, p.screenName)}/>);
			}
			
		}

		// render player list panel
		let playerPanel;
		console.log(this.state.detailPlayerName);
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

		return (
			<div>
				<div id="body-header" className="header">
					<p id="game-title">{this.props.gameTitle}</p>
					<p id="game-code">{this.props.gameCode}</p>
				</div>
				<div className="host-panel">
					<div id="player-list" className={`content${ this.state.playerPanelHidden ?  ' hidden' : ''}`}>
						{playerPanel}
					</div>
					<div id="body-panel">
						<div id="question-panel" className="content">
							<OpenQuestionPanel
								modifyScore={this.modifyScore}
								toggleBuzzers={this.toggleBuzzers}
								buzzersOpen={this.state.buzzersOpen}
								playerAnswering={this.state.playerAnswering}/>
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

class PlayerDetailsPanel extends React.Component {

	constructor(props) {
		super(props);
		this.openScoreDialog = this.openScoreDialog.bind(this);
	}

	openScoreDialog = () => {
		let validNumber = false;
		let newScore = "";
		while (!validNumber) {
			newScore = prompt(`Enter a new score for ${ this.props.player.screenName
			} (current score ${ this.props.player.score })`,
				this.props.player.score.toString());
			if (!isNaN(parseInt(newScore, 10))) {
				this.props.changePlayerScore(this.props.player.screenName,
					parseInt(newScore, 10));
				validNumber = true;
			}
		}
	}
	render = () => {
		let hideButton;
		if (this.props.player.hidden) {
			hideButton = (
				<div
					className='add-question-button'
					href='#'
					onClick={() => this.props.unhidePlayer(this.props.player.screenName)}>
					<p>Unhide Player</p>
				</div>
			);
		} else {
			hideButton = (
				<div
					className='cancel-question-button'
					href='#'
					onClick={() => this.props.hidePlayer(this.props.player.screenName)}>
					<p>Hide Player</p>
				</div>
			);
		}
		return (
			<div className='player-details-panel'>
				<div className='player-details-name'>
					<p className='player-details-name'>{this.props.player.screenName}</p>
				</div>
				<div className='player-details-score'>
					<p className='player-details-score'>{this.props.player.score}</p>
				</div>
				<div
					className='add-question-button'
					href='#'
					onClick={this.openScoreDialog}>
					<p>Change Score</p>
				</div>
				{hideButton}
				<div
					className='player-details-back'
					href='#'
					onClick={() => this.props.clearPlayerDetails(this)}>
					<p className='player-details-back'>Back</p>
				</div>
			</div>
		);
	}
}

PlayerDetailsPanel.propTypes = {
	player: PropTypes.object,
	clearPlayerDetails: PropTypes.func,
	hidePlayer: PropTypes.func,
	unhidePlayer: PropTypes.func,
	changePlayerScore: PropTypes.func,
};

class PlayerListing extends React.Component {
	render = () => {
		var scoreString = this.props.player.score;

		var className = "playerListingDetails";

		console.log(scoreString);

		if (this.props.answering) {
			return (
				<div className="playerListing" onClick={this.props.onClick}>
					<div className="playerListingName" style={{backgroundColor: "#FFFFFF"}}>
						<p className="playerListingName" style={{color: this.props.player.colour}}>
							{this.props.player.screenName}
						</p>
					</div>
					<div className="playerListingDetails" style={{backgroundColor: "#FFFFFF"}}>
						<p className={className} style={{color: this.props.player.colour}}>{scoreString}</p>
					</div>
				</div>
			);
		} else {
			return (
				<div className="playerListing"  onClick={this.props.onClick}>
					<div className="playerListingName" style={{backgroundColor: this.props.player.colour}}>
						<p className="playerListingName" style={{color: "#FFFFFF"}}>{this.props.player.screenName}</p>
					</div>
					<div className="playerListingDetails" style={{backgroundColor: this.props.player.colour}}>
						<p className={className} style={{color: "#FFFFFF"}}>{scoreString}</p>
					</div>
				</div>
			);
		}
	}
}

PlayerListing.propTypes = {
	player: PropTypes.object,
	answering: PropTypes.bool,
	onClick: PropTypes.func,
};


class OpenQuestionPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			correctValue: 1,
			incorrectValue: 1
		};

		console.log(this.state);
	}

	setCorrectValue = (event) => {
		this.setState({
			correctValue: parseInt(event.target.value)
		});
	}

	setIncorrectValue = (event) => {
		this.setState({
			incorrectValue: parseInt(event.target.value)
		});
	}



	wrongAnswer = () => {
		if (!$.isEmptyObject(this.props.playerAnswering)) {
			this.props.modifyScore(this.props.playerAnswering.screenName, this.state.incorrectValue * -1);
			this.openBuzzers();
		}
		socket.emit("play sound", "incorrect");
	}

	rightAnswer = () => {
		if (!$.isEmptyObject(this.props.playerAnswering)) {
			this.props.modifyScore(this.props.playerAnswering.screenName, this.state.correctValue);
			this.openBuzzers();
		}
		socket.emit("play sound", "correct");
	}

	openBuzzers = () => {
		if (!this.props.buzzersOpen) {
			this.props.toggleBuzzers();
		}
	}

	closeBuzzers = () => {
		if (this.props.buzzersOpen) {
			this.props.toggleBuzzers();
		}
		
		
	}

	render = () => {

		var buzzerPanel;


		// Buzzers closed
		if (!this.props.buzzersOpen && $.isEmptyObject(this.props.playerAnswering)) {
			buzzerPanel = (
				<div className="buzzer-panel">
					<div className="add-question-button" onClick={this.openBuzzers}>
						<p>Open Response Lines</p>
					</div>
				</div>
			);

		// Buzzers open
		} else if ($.isEmptyObject(this.props.playerAnswering)) {

			buzzerPanel = (
				<div className="buzzer-panel">
					<div className="cancel-question-button" onClick={this.closeBuzzers}>
						<p>Close Response Lines</p>
					</div>
				</div>
			);



		// Player answering
		} else {
			buzzerPanel = (
				<div className="buzzer-panel">
					<p className="buzzer-panel">{this.props.playerAnswering.screenName} is answering</p>
					<div className="button-row">
						<div className="add-question-button" onClick={this.rightAnswer}>
							<p>Correct</p>
						</div>
						<div className="add-question-button" onClick={this.wrongAnswer}>
							<p>Incorrect</p>
						</div>
					</div>
				</div>
			);
		}


		return (
			<div id="open-question-panel">
				<div className="score-input-panel">
					<div className="button-row">
						<p>Points added for correct answer:</p>
						<input type="number" onChange={this.setCorrectValue} value={this.state.correctValue}/>
					</div>
					<div className="button-row">
						<p>Points deducted for incorrect answer:</p>
						<input type="number" onChange={this.setIncorrectValue} value={this.state.incorrectValue}/>
					</div>
				</div>
				{buzzerPanel}
			</div>
		);
	}
}

OpenQuestionPanel.propTypes = {
	modifyScore: PropTypes.func,
	toggleBuzzers: PropTypes.func,
	buzzersOpen: PropTypes.bool,
	playerAnswering: PropTypes.object
};


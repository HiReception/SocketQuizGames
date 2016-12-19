var React = require("react");
var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var $ = require("jquery");

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


var gameTitle = getParameterByName("gametitle");

shuffle(playerColours);

socket.emit("start game", {
	gameTitle: gameTitle,
	type: "genericquiz"
});

socket.on("game details", function(details) {
	console.log("Game Details received");
	console.log(details);
	socket.emit("send question", {
		type: "buzz-in",
		open: true
	});
	ReactDOM.render(<HostPanel gameCode={details.gameCode} gameTitle={details.gameTitle}/>, document.getElementById("host-panel"));
});

class HostPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			players: [],
			playerAnswering: {},
			buzzersOpen: false
		};

		console.log(this.state);
		this.render = this.render.bind(this);
		this.handleNewPlayer = this.handleNewPlayer.bind(this);
		this.handleNewAnswer = this.handleNewAnswer.bind(this);
		this.toggleBuzzers = this.toggleBuzzers.bind(this);
		this.modifyScore = this.modifyScore.bind(this);
	}

	handleNewPlayer(playerDetails) {
		console.log("new player:");
		console.log(playerDetails);
		playerDetails.colour = playerColours[this.state.players.length % playerColours.length];
		playerDetails.score = 0;
		var newPlayers = this.state.players;

		newPlayers.push(playerDetails);
		this.setState({
			players: newPlayers
		});

		socket.emit("set state", {
			players: newPlayers
		});

		socket.emit("send private message", {
			screenName: playerDetails.screenName,
			message: {
				type: "colour",
				colour: playerDetails.colour
			}
		});

	}

	handleNewAnswer(details) {
		if (this.state.buzzersOpen) {
			console.log("new answer:");
			console.log(details);
			console.log(this);

			var newPlayerAnswering = this.state.players.find(function(p) {
				console.log(p.screenName + " vs " + details.player.screenName);
				return p.screenName === details.player.screenName;
			});
			this.setState({
				buzzersOpen: false,
				playerAnswering: newPlayerAnswering
			});

			socket.emit("set state", {
				playerAnswering: newPlayerAnswering
			});

			socket.emit("play sound", "buzz-in");
		}
	}

	toggleBuzzers() {
		console.log(this);
		this.setState({
			buzzersOpen: !(this.state.buzzersOpen),
			playerAnswering: {}
		});
		
		socket.emit("set state", {
			playerAnswering: {}
		});
	}

	modifyScore(screenName, scoreChange) {
		var newPlayers = this.state.players;
		console.log(this);
		newPlayers.map(function(p) {
			if (p.screenName === screenName) {
				p.score += scoreChange;
			}
		});

		this.setState({
			players: newPlayers
		});

		socket.emit("set state", {
			players: newPlayers
		});
	}


	componentDidMount() {
		socket.on("new player", this.handleNewPlayer);
		socket.on("new answer", this.handleNewAnswer);
	}

	componentWillUnmount() {
		socket.removeListener("new player", this.handleNewPlayer);
		socket.removeListener("new answer", this.handleNewAnswer);
	}

	render() {
		var playerCountString = players.length === 1 ? "1 Player" : players.length + " Players";
		var playerList = [];
		if (this.state.players.length != 0) {
			var playersByScore = this.state.players.sort(function(a,b) {
				return a.score > b.score;
			});

			for (var i = 0; i < playersByScore.length; i++) {
				var p = playersByScore[i];
				var answering = this.state.playerAnswering === p;
				playerList.push(<PlayerListing player={p} answering={answering} key={i}/>);
			}
			
		}

		return (
			<div className="host-panel">
				<div id="sidebar">
					<div id="sidebar-header" className="header">
						<p id="player-count">{playerCountString}</p>
					</div>
					
					<div id="player-list" className="content">
						{playerList}
					</div>
				</div>
				<div id="body-panel">
					<div id="body-header" className="header">
						<p id="game-title">{this.props.gameTitle}</p>
						<p id="game-code">{this.props.gameCode}</p>
					</div>

					<div id="question-panel" className="content">
						<OpenQuestionPanel
							modifyScore={this.modifyScore}
							toggleBuzzers={this.toggleBuzzers}
							buzzersOpen={this.state.buzzersOpen}
							playerAnswering={this.state.playerAnswering}/>
					</div>
				</div>
			</div>
		);
	}
}

var PlayerListing = React.createClass({
	propTypes: {
		player: React.PropTypes.object,
		answering: React.PropTypes.bool
	},
	render: function() {
		var scoreString = this.props.player.score;

		var className = "playerListingDetails";

		console.log(scoreString);

		if (this.props.answering) {
			return (
				<div className="playerListing">
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
				<div className="playerListing">
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
});


class OpenQuestionPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			correctValue: 1,
			incorrectValue: 1
		};

		console.log(this.state);
		
		this.render = this.render.bind(this);
		this.setCorrectValue = this.setCorrectValue.bind(this);
		this.setIncorrectValue = this.setIncorrectValue.bind(this);
		this.closeBuzzers = this.closeBuzzers.bind(this);
		this.openBuzzers = this.openBuzzers.bind(this);
		this.wrongAnswer = this.wrongAnswer.bind(this);
		this.rightAnswer = this.rightAnswer.bind(this);
	}

	setCorrectValue(event) {
		this.setState({
			correctValue: parseInt(event.target.value)
		});
	}

	setIncorrectValue(event) {
		this.setState({
			incorrectValue: parseInt(event.target.value)
		});
	}



	wrongAnswer() {
		if (!$.isEmptyObject(this.props.playerAnswering)) {
			this.props.modifyScore(this.props.playerAnswering.screenName, this.state.incorrectValue * -1);
			this.openBuzzers();
		}
		socket.emit("play sound", "incorrect");
	}

	rightAnswer() {
		if (!$.isEmptyObject(this.props.playerAnswering)) {
			this.props.modifyScore(this.props.playerAnswering.screenName, this.state.correctValue);
			this.openBuzzers();
		}
		socket.emit("play sound", "correct");
	}

	openBuzzers() {
		if (!this.props.buzzersOpen) {
			this.props.toggleBuzzers();
		}
	}

	closeBuzzers() {
		if (this.props.buzzersOpen) {
			this.props.toggleBuzzers();
		}
		
		
	}

	render() {

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
	modifyScore: React.PropTypes.func,
	toggleBuzzers: React.PropTypes.func,
	buzzersOpen: React.PropTypes.bool,
	playerAnswering: React.PropTypes.object
};


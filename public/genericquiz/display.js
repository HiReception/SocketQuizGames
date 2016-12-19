var React = require("react");
var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var soundManager = require("soundmanager2").soundManager;



function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return "";
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}


socket.emit("display request", {
	gameCode: getParameterByName("gamecode")
});

socket.on("accepted", function() {
	ReactDOM.render(<DisplayContainer/>, document.getElementById("display-panel"));
	soundManager.setup({

		onready: function() {
			// SM2 has loaded, API ready to use e.g., createSound() etc.
		},

		ontimeout: function() {
			// Uh-oh. No HTML5 support, SWF missing, Flash blocked or other issue
		}

	});

	soundManager.createSound({id: "buzz-in", url: "./sounds/buzzin.wav", autoLoad: true});
	soundManager.createSound({id: "correct", url: "./sounds/correct.wav", autoLoad: true});
	soundManager.createSound({id: "incorrect", url: "./sounds/incorrect.wav", autoLoad: true});
});

socket.on("play sound", function(id) {
	soundManager.play(id);
});

class DisplayContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			buzzersOpen: false,
			players: [],

			playerAnswering: {},
		};
		
		this.render = this.render.bind(this);
		var thisPanel = this;

		socket.on("new game state", function(state) {
			console.log("new state received");
			console.log(state);
			thisPanel.setState(state);
		});
	}

	render() {
		var questionPanel;
		var playerPanel;

		if (this.state.players.length != 0) {
			var list = [];
			for (var i = 0; i < this.state.players.length; i++) {
				var p = this.state.players[i];

				// light this display up if they are answering the question
				var answering = this.state.playerAnswering.screenName === p.screenName;

				list.push((<PlayerListing
					player={p}
					key={i}
					answering={answering}
				/>));
			}
			playerPanel = <div className="playerContainer">{list}</div>;
		} else {
			playerPanel = <div className="playerContainer"/>;
		}

		return (
			<div id="display-panel" className="content">
				<div id="question-panel" className="content">
					{questionPanel}
				</div>		
				<div id="player-list" className="content">
					{playerPanel}
				</div>
			</div>
		);
	}
}

var PlayerListing = React.createClass({
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
var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var React = require("react");
var $ = require("jquery");
import BuzzInQuestion from "../common/buzz-in-question";
import Message from "../common/player-message";
import EmptyPanel from "../common/empty-panel";
import WagerQuestion from "./player/wager-question";
import FinalQuestion from "./player/final-question";

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	
	if (!results[2]) return "";

	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
	
var gameCode = getParameterByName("gamecode");
var screenName = getParameterByName("name");


// TODO add back button to header bar
// TODO add Page button to header bar, to get attention of host



socket.on("connect_timeout", function() {
	console.log("connection timeout");
});

socket.on("connect", function() {
	socket.emit("join request", {
		screenName: screenName,
		gameCode: gameCode,
	});
});

socket.on("connect_error", function(err) {
	console.log("connection error: " + err);
});

socket.on("accepted", function({state, id}) {
	$("#header-bar").text(screenName);
	console.log(state);
	ReactDOM.render(<PlayerPanel receivedState={state} socket={socket} playerID={id}/>, document.getElementById("question-window"));
});

class PlayerPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = props.receivedState;
	}

	handleNewState = (newState) => {
		console.log("new state");
		console.log(newState);
		this.setState(newState);
	}

	componentDidMount = () => {
		this.props.socket.on("new game state", this.handleNewState);
	}

	componentWillUnmount = () => {
		this.props.socket.removeListener("new game state", this.handleNewState);
	}

	render = () => {
		var input;
		if (this.state.currentPanel !== "FinalJeopardyPanel" && this.state.currentPanel !== "FinalJeopardyResponsePanel" && this.state.currentPanel !== "PostGamePanel") {
			input = <BuzzInQuestion socket={this.props.socket}/>;
		} else {
			if (this.state.finalWageringOpen
				&& this.state.finalEligiblePlayers.some((p) => p.id === this.props.playerID)
				&& (!this.state.finalWagers || !this.state.finalWagers.some(w => w.id === this.props.playerID))) {
				const me = this.state.players.find(p => p.id === this.props.playerID);
				input = (
					<WagerQuestion
						balance={me.score}
						category={this.state.final.category}
						prefix={this.state.prefix}
						suffix={this.state.suffix}
						socket={this.props.socket}
					/>
				);
			} else if ((this.state.finalRespondingOpen || this.state.finalRespondingOver)
				&& this.state.finalEligiblePlayers.some(p => p.id === this.props.playerID)
				&& (!this.state.finalResponses || !this.state.finalResponses.some(r => r.id === this.props.playerID))) {
				input = <FinalQuestion body={this.state.final.answer} socket={this.props.socket} timeUp={this.state.finalRespondingOver}/>;
			} else {
				input = <EmptyPanel/>;
			}
		}
		return (
			<div className="playerBody">
				{input}
			</div>
		);
	}
}
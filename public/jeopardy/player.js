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

socket.on("accepted", function(state) {
	$("#header-bar").text(screenName);
	console.log(state);
	ReactDOM.render(<PlayerPanel receivedState={state} socket={socket}/>, document.getElementById("question-window"))
});

socket.on("end of final", function() {
	/* TODO
		retrieve whatever's in the input field
		send that as the response
		replace the FinalJeopardyPanel with EmptyPanel
	*/
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
		if (this.state.currentPanel !== "FinalJeopardyPanel" && this.state.currentPanel !== "FinalJeopardyResponsePanel") {
			input = <BuzzInQuestion socket={this.props.socket}/>;
		} else {
			if (this.state.finalWageringOpen && (!this.state.finalWagers || !this.state.finalWagers.some((wager) => {
				console.log(`wager name: ${wager.screenName} vs ${screenName}`)
				return wager.screenName === screenName;
			}))) {
				const me = this.state.players.find(p => { return p.screenName === screenName; });
				input = (
					<WagerQuestion
						balance={me.score}
						category={this.state.final.category}
						prefix={this.state.prefix}
						suffix={this.state.suffix}
						socket={this.props.socket}
					/>
				);
			} else if (this.state.finalRespondingOpen && (!this.state.finalResponses || !this.state.finalResponses.some(response => { return response.screenName === screenName; }))) {
				input = <FinalQuestion body={this.state.final.answer} socket={this.props.socket}/>;
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
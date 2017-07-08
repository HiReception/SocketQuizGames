var React = require("react");
var PropTypes = require("prop-types");
const io = require("socket.io-client");

import PlayerListing from "./player-listing";
import NoQuestionPanel from "./no-question-panel";
import SelectQuestionPanel from "./select-question-panel";
import DailyDoublePanel from "./daily-double-panel";
import FinalJeopardyPanel from "./final-jeopardy-panel";
import FinalJeopardyResponsePanel from "./final-jeopardy-response-panel";

export default class DisplayContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentRound: 0,
			buzzersOpen: false,
			rounds: [],
			players: [],

			final: {},
			finalCategoryVisible: false,
			finalClueVisible: false,
			finalFocusScreenName: "",
			finalFocusResponse: "",
			finalFocusResponseVisible: false,
			finalFocusWager: "",
			finalFocusWagerVisible: false,

			
			currentPanel: "NoQuestionPanel",
			currentClue: {},

			playerAnswering: {},

			dailyDoublePlaySound: true,

			prefix: "",
			suffix: "",
		};
	}

	onNewState = (state) => {
		if (this.state.currentPanel === "DailyDoublePanel") {
			this.setState({
				dailyDoublePlaySound: false
			});
		} else {
			this.setState({
				dailyDoublePlaySound: true
			});
		}
		console.log("new state received");
		console.log(state);
		this.setState(state);
	}

	componentDidMount = () => {
		this.props.socket.on("new game state", this.onNewState);
	}

	componentWillUnmount = () => {
		this.props.socket.removeHandler("new game state", this.onNewState);
	}

	render = () => {
		var questionPanel;

		switch (this.state.currentPanel) {
		case "NoQuestionPanel":
			questionPanel = <NoQuestionPanel/>;
			break;
		case "SelectQuestionPanel":
			questionPanel = (
				<SelectQuestionPanel
					round={this.state.rounds[this.state.currentRound]}
					prefix={this.state.prefix}
					suffix={this.state.suffix}
				/>
			);
			break;
		case "OpenQuestionPanel":
			questionPanel = (<OpenQuestionPanel
				clue={this.state.currentClue}
			/>);
			break;
		case "DailyDoublePanel":
			questionPanel = <DailyDoublePanel playSound={this.state.playSound}/>;
			break;
		case "FinalJeopardyPanel":
			questionPanel = (
				<FinalJeopardyPanel
					final={this.state.final}
					categoryVisible={this.state.finalCategoryVisible}
					clueVisible={this.state.finalClueVisible}
					revealTone={false}
					thinkMusicPlaying={false}
				/>
			);
			break;
		case "FinalJeopardyResponsePanel":
			questionPanel = (
				<FinalJeopardyResponsePanel
					screenName={this.state.finalFocusScreenName}
					response={this.state.finalFocusResponse}
					responseVisible={this.state.finalFocusResponseVisible}
					wager={this.state.finalFocusWager}
					wagerVisible={this.state.finalFocusWagerVisible}
				/>
			);
			break;
		}

		var playerPanel;
		var thisPanel = this;
		var nonHiddenPlayers = this.state.players.filter(function(p) {
			return !p.hidden;
		});

		if (nonHiddenPlayers.length != 0) {
			var list = [];
			for (var i = 0; i < nonHiddenPlayers.length; i++) {
				var p = nonHiddenPlayers[i];
				// light this display up if they are answering the question
				var answering = this.state.playerAnswering.screenName === p.screenName;

				// player is "locked out" if someone ELSE is answering, so grey them out
				var lockedOut = this.state.playerAnswering.hasOwnProperty("screenName")
					&& this.state.playerAnswering.screenName !== p.screenName;

				list.push((<PlayerListing
					player={p}
					key={i}
					prefix={this.state.prefix}
					suffix={this.state.suffix}
					answering={answering}
					lockedOut={lockedOut}
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

DisplayContainer.propTypes = {
	socket: PropTypes.instanceOf(io.Socket),
};
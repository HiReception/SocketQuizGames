var React = require("react");
var PropTypes = require("prop-types");
const io = require("socket.io-client");

import OpenQuestionPanel from "./open-question-panel";
import NoQuestionPanel from "./no-question-panel";
import QuestionResultsPanel from "./question-results-panel";
import PlayerResultsPanel from "./player-results-panel";

export default class DisplayContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			players: [],
			detailPlayerName: "",

			questions: [],
			currentQuestion: 0,
			currentPanel: "NoQuestionPanel",
			newPanelKey: 0,

			numAnswersRevealed: 0,
			fullAnswerRevealed: false,

			playerPanelHidden: false,

			correctPlayersRevealed: false,
			fastestCorrectRevealed: false,
			fastestFlashOn: false,

			buzzersOpen: false,
			playerStats: [],
		};
	}

	onNewState = (state) => {
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
		const question = this.state.questions[this.state.currentQuestion];
		var questionPanel;

		switch (this.state.currentPanel) {
		case "NoQuestionPanel":
		case "NextRoundPanel":
			questionPanel = <NoQuestionPanel/>;
			break;
		case "OpenQuestionPanel":
			questionPanel = (<OpenQuestionPanel
				question={question}
				questionVisble={true}
				answersVisible={this.state.buzzersOpen}
			/>);
			break;
		case "QuestionResultsPanel":
			questionPanel = (<QuestionResultsPanel question={question} fullAnswerRevealed={this.state.fullAnswerRevealed} numAnswersRevealed={this.state.numAnswersRevealed}/>);
			break;
		case "PlayerResultsPanel":
			questionPanel = (
				<PlayerResultsPanel
					question={question} players={this.state.players} correctPlayersRevealed={this.state.correctPlayersRevealed} fastestCorrectRevealed={this.state.fastestCorrectRevealed}
				/>
			);
			break;
		}

		return (
			<div id="display-panel" className="content">
				<div id="question-panel" className="content">
					{questionPanel}
				</div>
			</div>
		);
	}
}

DisplayContainer.propTypes = {
	socket: PropTypes.instanceOf(io.Socket),
};
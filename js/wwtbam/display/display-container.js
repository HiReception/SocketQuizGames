var React = require("react");
var PropTypes = require("prop-types");
const io = require("socket.io-client");

import FFQuestionPanel from "./ff-question-panel";
import NoQuestionPanel from "./no-question-panel";
import FFQuestionResultsPanel from "./ff-question-results-panel";
import PlayerResultsPanel from "./player-results-panel";

export default class DisplayContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			players: [],
			detailPlayerID: "",

			ffQuestions: [],
			ffCurrentQuestion: 0,
			currentPanel: "NoQuestionPanel",
			newPanelKey: 0,

			ffNumAnswersRevealed: 0,
			ffFullAnswerRevealed: false,

			playerPanelHidden: false,

			ffCorrectPlayersRevealed: false,
			ffFastestCorrectRevealed: false,
			ffFastestFlashOn: false,

			ffBuzzersOpen: false,
			playerStats: [],
		};
	}

	onNewState = (state) => {
		this.setState(state);
	}

	componentDidMount = () => {
		this.props.socket.on("new game state", this.onNewState);
	}

	componentWillUnmount = () => {
		this.props.socket.removeHandler("new game state", this.onNewState);
	}

	render = () => {
		const question = this.state.ffQuestions[this.state.ffCurrentQuestion];
		var questionPanel;

		switch (this.state.currentPanel) {
		case "NoQuestionPanel":
		case "NextRoundPanel":
			questionPanel = <NoQuestionPanel/>;
			break;
		case "FFQuestionPanel":
			questionPanel = (<FFQuestionPanel
				question={question}
				questionVisble={true}
				answersVisible={this.state.ffBuzzersOpen}
			/>);
			break;
		case "FFQuestionResultsPanel":
			questionPanel = (
				<FFQuestionResultsPanel
					question={question}
					ffFullAnswerRevealed={this.state.ffFullAnswerRevealed}
					ffNumAnswersRevealed={this.state.ffNumAnswersRevealed}
					ffQuestionRecapped={this.state.ffQuestionRecapped}
				/>
			);
			break;
		case "PlayerResultsPanel":
			questionPanel = (
				<PlayerResultsPanel
					question={question} players={this.state.players} ffCorrectPlayersRevealed={this.state.ffCorrectPlayersRevealed} ffFastestCorrectRevealed={this.state.ffFastestCorrectRevealed}
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
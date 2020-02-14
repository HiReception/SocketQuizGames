var React = require("react");
var PropTypes = require("prop-types");
const io = require("socket.io-client");

import FFQuestionPanel from "./ff-question-panel";
import NoQuestionPanel from "./no-question-panel";
import FFQuestionResultsPanel from "./ff-question-results-panel";
import PlayerResultsPanel from "./player-results-panel";
import PreMainGamePanel from "./pre-main-game-panel";
import LightsDownPanel from "./lights-down-panel";
import MainQuestionPanel from "./main-question-panel";
import PostMainGamePanel from "./post-main-game-panel";

import initialState from "../initial-state";

export default class DisplayContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = initialState;
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

	formatNumber = (number) => {
		return this.state.prefix + number.toLocaleString(this.state.locale, {minimumFractionDigits: 0}) + this.state.suffix;
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
					question={question}
					players={this.state.players}
					ffCorrectPlayersRevealed={this.state.ffCorrectPlayersRevealed}
					ffFastestCorrectRevealed={this.state.ffFastestCorrectRevealed}
				/>
			);
			break;
		case "PreMainGamePanel":
			// TODO
			questionPanel = (
				<PreMainGamePanel
					moneyTreeVisible={this.state.mainGameMoneyTreeVisible}
					moneyTree={this.state.mainGameMoneyTree}
					startingLifelines={this.state.mainGameStartingLifelines}
					lifelinesAvailable={this.state.mainGameLifelinesAvailable}
				/>
			);
			break;
		case "LightsDownPanel":
			// TODO
			questionPanel = (
				<LightsDownPanel
					moneyTreeVisible={this.state.mainGameMoneyTreeVisible}
					moneyTree={this.state.mainGameMoneyTree}
					currentQuestionNo={this.state.mainGameQuestionNo}
					startingLifelines={this.state.mainGameStartingLifelines}
					lifelinesAvailable={this.state.mainGameLifelinesAvailable}
				/>
			);
			break;
		case "MainQuestionPanel":
			questionPanel = (
				<MainQuestionPanel
					question={this.state.mainGameQuestionStack[this.state.mainGameQuestionNo - 1]}
					gameState={this.state}
					formatNumber={this.formatNumber}
				/>
			);
			break;
		case "PostMainGamePanel":
			questionPanel = (
				<PostMainGamePanel
					winningsString={this.state.mainGameWinningsString}
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
const React = require("react");
const PropTypes = require("prop-types");

export default class FameGameQuestion extends React.Component {
	render = () => {
		let buzzerPanel;

		// People still able to answer, timer not yet started
		if (this.props.playerAnswering === "" && !this.props.questionOver && !this.props.timerStarted) {
			let eligibleString;
			if (this.props.eligiblePlayers.length > 1) {
				eligibleString = `${this.props.eligiblePlayers.length} players able to answer`;
			} else {
				eligibleString = `Only ${this.props.eligiblePlayers[0]} able to answer`;
			}
			buzzerPanel = (
				<div className="buzzer-panel">
					<p className="buzzer-panel">{eligibleString}</p>
					<div className="add-question-button" onClick={this.props.startTimer}>
						<p>Start Timer</p>
					</div>
				</div>
			);
		}
		// People still able to answer, timer started but not elapsed
		else if (this.props.playerAnswering === "" && !this.props.questionOver && this.props.timerStarted && this.props.timeRemaining > 0) {
			buzzerPanel = (
				<div className="buzzer-panel">
					<p className="buzzer-panel">{this.props.timeRemaining/1000} seconds left to buzz in</p>
				</div>
			);
		
		}
		// Player Answering
		else if (this.props.playerAnswering !== "" && !this.props.questionOver) {
			buzzerPanel = (
				<div className="buzzer-panel">
					<p className="buzzer-panel">{this.props.playerAnswering} is Answering</p>
					<div className="button-row">
						<div className="add-question-button" onClick={this.props.playerRight}>
							<p>Correct</p>
						</div>
						<div className="add-question-button" onClick={this.props.cancelBuzz}>
							<p>Cancel</p>
						</div>
						<div className="add-question-button" onClick={this.props.playerWrong}>
							<p>Incorrect</p>
						</div>
					</div>
				</div>
			);
		}
		// Question Over
		else {
			buzzerPanel = (
				<div className="buzzer-panel">
					<p className="buzzer-panel">Question Over</p>
					<div className="add-question-button" onClick={this.props.nextItem}>
						<p>Continue</p>
					</div>
				</div>
			);
		}

		const body = this.props.question.body ? this.props.question.body : "No Question Body";
		const correct = this.props.question.correct ? this.props.question.correct : "No Correct Answer";

		return (
			<div id='open-question-panel'>
				<div className='open-question-header'>
					<p className='open-question-category'>Fame Game Question</p>
				</div>
				<div className='open-question-clue'>
					<p className='open-question-clue'>
						{body}
					</p>
				</div>
				<div className='open-question-correct'>
					<p className='open-question-correct'>
						{correct}
					</p>
				</div>
				{buzzerPanel}
			</div>
		);
	}
}

FameGameQuestion.propTypes = {
	question: PropTypes.object,
	eligiblePlayers: PropTypes.array,
	playerAnswering: PropTypes.string,
	timerStarted: PropTypes.bool,
	timeRemaining: PropTypes.number,
	questionOver: PropTypes.bool,
	playerRight: PropTypes.func,
	playerWrong: PropTypes.func,
	cancelBuzz: PropTypes.func,
	startTimer: PropTypes.func,
	nextItem: PropTypes.func,
};

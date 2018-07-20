const React = require("react");
const PropTypes = require("prop-types");

export default class StandardQuestion extends React.Component {
	render = () => {
		let buzzerPanel;

		// No answers, timer not yet started
		if (this.props.playerAnswering === "" && !this.props.answered && !this.props.timerStarted) {
			buzzerPanel = (
				<div className="buzzer-panel">
					<p className="buzzer-panel">Nobody Answering</p>
					<div className="add-question-button" onClick={this.props.startTimer}>
						<p>Start Timer</p>
					</div>
				</div>
			);
		}
		// No answers, timer started but not elapsed
		else if (this.props.playerAnswering === "" && !this.props.answered && this.props.timerStarted && this.props.timeRemaining > 0) {
			buzzerPanel = (
				<div className="buzzer-panel">
					<p className="buzzer-panel">{this.props.timeRemaining} seconds left to buzz in</p>
				</div>
			);
		
		}
		// Player Answering
		else if (this.props.playerAnswering !== "" && !this.props.answered) {
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
					<p className='open-question-category'>Standard Question</p>
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

StandardQuestion.propTypes = {
	question: PropTypes.object,
	playerAnswering: PropTypes.string,
	timerStarted: PropTypes.bool,
	timeRemaining: PropTypes.number,
	answered: PropTypes.bool,
	playerRight: PropTypes.func,
	playerWrong: PropTypes.func,
	cancelBuzz: PropTypes.func,
	startTimer: PropTypes.func,
	nextItem: PropTypes.func,
};

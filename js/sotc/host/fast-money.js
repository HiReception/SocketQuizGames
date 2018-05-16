const React = require("react");
const PropTypes = require("prop-types");
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {faPlay, faPause} from "@fortawesome/fontawesome-free-solid";

export default class FastMoney extends React.Component {
	render = () => {
		if (!this.props.fmStarted) {
			return (
				<div id='open-question-panel'>
					<div className='fast-money-header'>
						<div className="fast-money-title">
							<p className='fast-money-title'>FAST MONEY</p>
						</div>
						<div className="fast-money-clock">
							<p className='fast-money-clock'>{Math.floor(this.props.fmTimeRemaining/60000)}:{Math.floor(this.props.fmTimeRemaining/1000 % 60)}</p>
						</div>
						<div className="fast-money-empty">
						</div>
					</div>
					<div className='open-question-clue'>
						<p className='open-question-clue'>
							{this.props.fmTimeRemaining/1000} second Fast Money next
						</p>
						<div className="add-question-button" onClick={this.props.startLockTimer}>
							<p>Start Fast Money</p>
						</div>
					</div>
				</div>
			);
		} else {
			let fmHeaderButton;
			if (this.props.fmTimeRemaining <= 0) {
				// fmHeaderButton contains an exclamation mark and does nothing
				fmHeaderButton = (
					<div className="fast-money-button over">
						<p>!</p>
					</div>
				);
			} else if (this.props.fmClockRunning) {
				// fmHeaderButton contains a pause symbol and stops the clock
				fmHeaderButton = (
					<div className="fast-money-button pause" onClick={this.props.pauseFastMoneyTimer}>
						<p><FontAwesomeIcon icon={faPause}/></p>
					</div>
				);
			} else {
				// fmHeaderButton contains a play symbol and resumes the clock
				fmHeaderButton = (
					<div className="fast-money-button play" onClick={this.props.startFastMoneyTimer}>
						<p><FontAwesomeIcon icon={faPlay}/></p>
					</div>
				);
			}
			let buzzerPanel;
			// No answers or question answered, fast money time over
			if ((this.props.playerAnswering === "" || this.props.answered) && this.props.fmTimeRemaining <= 0) {
				buzzerPanel = (
					<div className="buzzer-panel">
						<p className="buzzer-panel">Fast Money Over</p>
						<div className="add-question-button" onClick={this.props.nextItem}>
							<p>Continue</p>
						</div>
					</div>
				);
			}
			// No answers, question timer not yet started
			else if (this.props.playerAnswering === "" && !this.props.answered && !this.props.timerStarted) {
				buzzerPanel = (
					<div className="buzzer-panel">
						<p className="buzzer-panel">Nobody Answering</p>
						<div className="add-question-button" onClick={this.props.startLockTimer}>
							<p>Start Timer</p>
						</div>
					</div>
				);
			}
			// No answers, question timer started but not elapsed
			else if (this.props.playerAnswering === "" && !this.props.answered && this.props.timerStarted && this.props.locktimeRemaining > 0) {
				buzzerPanel = (
					<div className="buzzer-panel">
						<p className="buzzer-panel">{this.props.locktimeRemaining} seconds left to buzz in</p>
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
						<div className="add-question-button" onClick={this.props.nextQuestion}>
							<p>Continue</p>
						</div>
					</div>
				);
			}

			return (
				<div id='open-question-panel'>
					<div className='fast-money-header'>
						<div className="fast-money-title">
							<p className='fast-money-title'>FAST MONEY</p>
						</div>
						<div className="fast-money-clock">
							<p className='fast-money-clock'>{Math.floor(this.props.fmTimeRemaining/60000)}:{Math.floor(this.props.fmTimeRemaining/1000 % 60)}</p>
						</div>
						{fmHeaderButton}
					</div>
					<div className='open-question-clue'>
						<p className='open-question-clue'>
							{this.props.question.body}
						</p>
					</div>
					<div className='open-question-correct'>
						<p className='open-question-correct'>
							{this.props.question.correct}
						</p>
					</div>
					{buzzerPanel}
				</div>
			);
		}
	}
}

FastMoney.propTypes = {
	fmTimeRemaining: PropTypes.number,
	fmClockRunning: PropTypes.bool,
	question: PropTypes.object,
	playerAnswering: PropTypes.string,
	lockTimerStarted: PropTypes.bool,
	lockTimeRemaining: PropTypes.number,
	answered: PropTypes.bool,
	playerRight: PropTypes.func,
	playerWrong: PropTypes.func,
	cancelBuzz: PropTypes.func,
	startLockTimer: PropTypes.func,
	startFastMoneyTimer: PropTypes.func,
	pauseFastMoneyTimer: PropTypes.func,
	nextQuestion: PropTypes.func,
	nextItem: PropTypes.func,
};

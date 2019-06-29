var React = require("react");
var PropTypes = require("prop-types");
var $ = require("jquery");
const io = require("socket.io-client");

export default class OpenQuestionPanel extends React.Component {
	constructor(props) {
		super(props);

	}

	wrongAnswer = () => {
		if (!$.isEmptyObject(this.props.playerAnswering)) {
			this.props.modifyScore(this.props.playerAnswering.id, this.props.incorrectPoints * -1);
			this.openBuzzers();
		}
		this.props.socket.emit("play sound", "incorrect");
	}

	rightAnswer = () => {
		if (!$.isEmptyObject(this.props.playerAnswering)) {
			this.props.modifyScore(this.props.playerAnswering.id, this.props.correctPoints);
			this.openBuzzers();
		}
		this.props.socket.emit("play sound", "correct");
	}

	openBuzzers = () => {
		if (!this.props.buzzersOpen) {
			this.props.toggleBuzzers();
		}
	}

	closeBuzzers = () => {
		if (this.props.buzzersOpen) {
			this.props.toggleBuzzers();
		}
		
		
	}

	render = () => {

		var buzzerPanel;


		// Buzzers closed
		if (!this.props.buzzersOpen && $.isEmptyObject(this.props.playerAnswering)) {
			buzzerPanel = (
				<div className="buzzer-panel">
					<div className="add-question-button" onClick={this.openBuzzers}>
						<p>Open Response Lines</p>
					</div>
				</div>
			);

		// Buzzers open
		} else if ($.isEmptyObject(this.props.playerAnswering)) {

			buzzerPanel = (
				<div className="buzzer-panel">
					<div className="cancel-question-button" onClick={this.closeBuzzers}>
						<p>Close Response Lines</p>
					</div>
				</div>
			);



		// Player answering
		} else {
			buzzerPanel = (
				<div className="buzzer-panel">
					<p className="buzzer-panel">{this.props.playerAnswering.screenName} is answering</p>
					<div className="button-row">
						<div className="add-question-button" onClick={this.rightAnswer}>
							<p>Correct</p>
						</div>
						<div className="add-question-button" onClick={this.wrongAnswer}>
							<p>Incorrect</p>
						</div>
					</div>
				</div>
			);
		}


		return (
			<div id="open-question-panel">
				<div className="score-input-panel">
					<div className="button-row">
						<p>Starting Score for new players:</p>
						<input type="number" onChange={this.props.setStartingScore} value={this.props.startingScore}/>
					</div>
					<div className="button-row">
						<p>Points added for correct answer:</p>
						<input type="number" onChange={this.props.setCorrectPoints} value={this.props.correctPoints}/>
					</div>
					<div className="button-row">
						<p>Points deducted for incorrect answer:</p>
						<input type="number" onChange={this.props.setIncorrectPoints} value={this.props.incorrectPoints}/>
					</div>
				</div>
				{buzzerPanel}
			</div>
		);
	}
}

OpenQuestionPanel.propTypes = {
	modifyScore: PropTypes.func,
	toggleBuzzers: PropTypes.func,
	buzzersOpen: PropTypes.bool,
	playerAnswering: PropTypes.object,
	socket: PropTypes.instanceOf(io.Socket),
	startingScore: PropTypes.number,
	setStartingScore: PropTypes.func,
	correctPoints: PropTypes.number,
	setCorrectPoints: PropTypes.func,
	incorrectPoints: PropTypes.number,
	setIncorrectPoints: PropTypes.func,
};


const PropTypes = require("prop-types");
const io = require("socket.io-client");
import React, { Component } from "react";

// TODO
export default class FFQuestionResultsPanel extends Component {
	constructor(props) {
		super(props);
	}
	revealAnswer = () => {
		const numOptions = this.props.question.options.length;
		const numRevealed = this.props.gameState.ffNumAnswersRevealed;
		if (this.props.question.type === "sequence") {
			if (numOptions > numRevealed) {
				this.setGameState({
					ffNumAnswersRevealed: numRevealed + 1,
					ffFullAnswerRevealed: (numRevealed + 1 === numOptions),
				});
				this.props.socket.emit("play sound", "answer" + (numRevealed + 1));
			}
		} else {
			this.setGameState({
				ffFullAnswerRevealed: true,
			});
			this.props.socket.emit("play sound", "light-answer");
		}
	}

	recapQuestion = () => {
		this.setGameState({
			ffQuestionRecapped: true,
		})
		this.props.socket.emit("play sound", "order-bed");
	}

	goToPlayerResults = () => {
		this.setGameState({
			ffNumAnswersRevealed: 0,
			ffFullAnswerRevealed: false,
			ffQuestionRecapped: false,
			currentPanel: "PlayerResultsPanel",
		});
	}

	setGameState = (state) => {
		this.setState(state);
		this.props.setGameState(state);
	}

	// TODO
	render = () => {
		const { question, gameState } = this.props;
		let buzzerPanel;


		const header = (
			<div className='open-question-header'>
				<p className='open-question-header'>{question.type}</p>
			</div>
		);

		const questionPanel = (
			<div className='open-question-body'>
				<p className='open-question-body'>
					{gameState.ffQuestionRecapped ? question.body : ""}
				</p>
			</div>
		);

		var optionOrder;
		if (question.type === "sequence") {
			optionOrder = question.correctResponse.split("").map((key) => {
				return question.options.find((o) => { return o.key === key; });
			});
		} else {
			optionOrder = question.options;
		}

		const options = optionOrder.map((option, index) => {
			const correctLit = question.type !== "sequence" && question.correctResponse.includes(option.key) && gameState.ffFullAnswerRevealed;
			return <div key={option.key} className={`open-question-option${correctLit ? " correct" : ""}`}>
				<div className={`open-question-option-icon${correctLit ? " correct" : ""}`}>
					{(question.type !== "sequence" || this.props.gameState.ffNumAnswersRevealed - 1 >= index) ? option.key : ""}
				</div>



				<p className={`open-question-option${correctLit ? " correct" : ""}`}>
					{(question.type !== "sequence" || this.props.gameState.ffNumAnswersRevealed - 1 >= index) ? option.text : ""}
				</p>
			</div>;
		});

		const optionsPanel = (
			<div className='open-question-options'>
				{options}
			</div>
		);
		if (!gameState.ffQuestionRecapped && question.type === "sequence") {
			buzzerPanel = (
				<div className='buzzer-panel'>
					<div className='add-question-button' onClick={this.recapQuestion}>
						<p>Show Correct Order Panel</p>
					</div>
				</div>
			);
		} else if (gameState.ffFullAnswerRevealed) {
			buzzerPanel = (
				<div className='buzzer-panel'>
					<div className='add-question-button' onClick={this.goToPlayerResults}>
						<p>Go to Player Results</p>
					</div>
				</div>
			);
		} else {
			if (question.type === "sequence") {
				buzzerPanel = (
					<div className='buzzer-panel'>
						<div className='add-question-button' onClick={this.revealAnswer}>
							<p>Reveal Next Answer in Sequence</p>
						</div>
					</div>
				);
			} else {
				buzzerPanel = (
					<div className='buzzer-panel'>
						<div className='add-question-button' onClick={this.revealAnswer}>
							<p>Reveal Correct Response</p>
						</div>
					</div>
				);
			}
			
		}

		return (
			<div id='open-question-panel'>
				<div className='column'>
					{header}
					{questionPanel}
					{optionsPanel}
					{buzzerPanel}
				</div>
			</div>
		);
	}
}

FFQuestionResultsPanel.propTypes = {
	question: PropTypes.object,
	gameState: PropTypes.object,
	setGameState: PropTypes.func,
	socket: PropTypes.instanceOf(io.Socket),
};
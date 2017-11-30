const io = require("socket.io-client");
const PropTypes = require("prop-types");
import React, { Component } from "react";

export default class OpenQuestionPanel extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount = () => {
		this.props.socket.on("new answer", this.handleNewAnswer);
	}

	componentWillUnmount = () => {
		this.props.socket.removeListener("new answer", this.handleNewAnswer);
	}

	handleNewAnswer = (details) => {
		if (this.props.gameState.buzzersOpen &&
			details.player.screenName !== "") {
			console.log("new answer:");
			console.log(details);
			console.log(this);

			const newQuestions = this.props.gameState.questions;
			newQuestions[this.props.gameState.currentQuestion].answers.push({
				screenName: details.player,
				answer: details.answer,
				timeTaken: details.time,
			})

			this.props.setGameState({
				questions: newQuestions,
			});
		}
	}

	goToResultsPanel = () => {
		this.props.setGameState({
			currentPanel: "QuestionResultsPanel",
		});
	}

	openBuzzers = () => {
		if (!this.props.gameState.buzzersOpen) {
			this.setGameState({
				buzzersOpen: true,
			});
		}
		this.props.socket.emit("send question", this.props.question);
	}

	setGameState = (state) => {
		this.setState(state);
		this.props.setGameState(state);
	}
	// TODO
	render = () => {
		const { question, gameState, players } = this.props;
		let buzzerPanel;


		const header = (
			<div className='open-question-header'>
				<p className='open-question-header'>{question.type}</p>
			</div>
		);

		const questionPanel = (
			<div className='open-question-body'>
				<p className='open-question-body'>
					{question.body}
				</p>
			</div>
		);

		const options = question.options.map((option) => {
			return <div key={option.key} className='open-question-option'>
				<div className='open-question-option-icon'>
					{option.key}
				</div>
				<p className='open-question-option'>
					{gameState.buzzersOpen ?
						option.text : ""}
				</p>
			</div>;
		});

		const optionsPanel = (
			<div className='open-question-options'>
				{options}
			</div>
		);

		if (gameState.buzzersOpen) {
			const numRemainingPlayers = players.filter((p) => {
				return !question.answers.some((a) => {
					return a.screenName === p.screenName;
				});
			}).length;
			buzzerPanel = (
				<div className='buzzer-panel'>
					<p className='buzzer-panel'>Waiting on {numRemainingPlayers} players</p>
					<div className='add-question-button' onClick={this.goToResultsPanel}>
						<p>End Question and Go To Results</p>
					</div>
				</div>
			);
		} else {
			
			buzzerPanel = (
				<div className='buzzer-panel'>
					<div className='add-question-button' onClick={this.openBuzzers}>
						<p>Open Response Lines</p>
					</div>
				</div>
			);
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

OpenQuestionPanel.propTypes = {
	question: PropTypes.object,
	players: PropTypes.array,
	changePlayerScore: PropTypes.func,
	setGameState: PropTypes.func,
	gameState: PropTypes.object,
	socket: PropTypes.instanceOf(io.Socket),
};
const PropTypes = require("prop-types");
const io = require("socket.io-client");
import React, { Component } from "react";

export default class PlayerResultsPanel extends Component {
	constructor(props) {
		super(props);
		this.state = props.gameState;
	}

	setGameState = (state) => {
		this.setState(state);
		this.props.setGameState(state);
	}

	revealCorrectPlayers = () => {
		const question = this.state.ffQuestions[this.state.ffCurrentQuestion];
		const anyCorrectAnswer = question.answers.find((a) => a.answer === question.correctResponse);
		this.setGameState({
			ffCorrectPlayersRevealed: true,
		});
		if (anyCorrectAnswer) {
			this.props.socket.emit("play sound", {id: "correct-reveal"});
		}
	}

	revealFastestCorrect = () => {
		const q = this.state.ffQuestions[this.state.ffCurrentQuestion];
		const correctAnswers = q.answers.filter((a) => a.answer === q.correctResponse);
		var fastestCorrectTime, fastestCorrectPlayer;
		if (correctAnswers.length > 0) {
			fastestCorrectTime = Math.min.apply(Math,correctAnswers.map((a) => a.timeTaken));
			const fastestCorrectAnswer = correctAnswers
				.find((a) => a.timeTaken === fastestCorrectTime);
			fastestCorrectPlayer = fastestCorrectAnswer.id;
		} else {
			fastestCorrectTime = 0;
			fastestCorrectPlayer = "";
		}


		this.setGameState({
			ffFastestCorrectRevealed: true,
			ffFastestCorrectPlayer: fastestCorrectPlayer,
			ffFastestCorrectTime: fastestCorrectTime,
		});
		this.props.socket.emit("play sound", {id: "fastest-reveal"});
	}

	prepareMainGame = () => {
		this.setGameState({
			mainGamePlayer: this.props.gameState.players.find(p => p.id === this.state.ffFastestCorrectPlayer),
			currentPanel: "PreMainGamePanel",
			ffCorrectPlayersRevealed: false,
			ffFastestCorrectRevealed: false,
			mainGameWinnings: 0,
			mainGameWinningsString: "",
			mainGameOptionsShown: 0,
			mainGameChosenAnswer: "",
			mainGameQuestionStack: [],
			mainGameLifelinesAvailable: this.props.gameState.mainGameStartingLifelines,
		});
	}

	prepareDoOver = () => {
		// TODO
	}

	render = () => {
		const q = this.state.ffQuestions[this.state.ffCurrentQuestion];
		const correctAnswers = q.answers.filter((a) => a.answer === q.correctResponse);
		const numCorrectAnswerers = correctAnswers.length;

		const playerLozenges = this.state.players.map((player, index) => {
			const answer = q.answers.find((a) => { return a.id === player.id; });
			var fastest, lit, timeString;
			if (typeof answer !== "undefined") {
				fastest = player.id === this.state.ffFastestCorrectPlayer && this.state.ffFastestCorrectRevealed;
				lit = (answer.answer === q.correctResponse && this.state.ffCorrectPlayersRevealed);
				timeString = (answer.timeTaken / 1000).toFixed(2);
			} else {
				fastest = false;
				lit = false; 
				timeString = "";
			}
			const timeVisible = this.state.ffCorrectPlayersRevealed;
			return (
				<div key={index} className={`player-result${fastest ? " fastest" : (lit ? " lit" : "")}`}>
					<p key="name" className={`player-result-name${lit ? " lit" : ""}`}>
						{player.screenName}
					</p>
					<p key="time" className={`player-result-time${lit ? " lit" : ""}${timeVisible ? "" : " invisible"}`}>
						{timeString}
					</p>
				</div>
			);
		});
		var buttonFunction, buttonLabel, headerText;
		if (this.state.ffFastestCorrectRevealed) {
			buttonFunction = this.prepareMainGame;
			buttonLabel = "End Question";
			headerText = `Fastest Correct Answer: ${this.state.players.find(p => p.id == this.state.ffFastestCorrectPlayer).screenName}, ${(this.state.ffFastestCorrectTime / 1000).toFixed(2)}s`;
		} else if (this.state.ffCorrectPlayersRevealed && numCorrectAnswerers === 0) {
			buttonFunction = this.prepareDoOver;
			buttonLabel = "End Question";
			headerText = "No Correct Answerers";
		} else if (this.state.ffCorrectPlayersRevealed) {
			buttonFunction = this.revealFastestCorrect;
			buttonLabel = "Show Fastest Correct Answerer";
			headerText = `${numCorrectAnswerers} players answered correctly`;
		} else {
			buttonFunction = this.revealCorrectPlayers;
			buttonLabel = "Show Correct Responders";
			headerText = "Correct Response: " + q.correctResponse;
		}

		return (
			<div key="results" className="question-results-panel">
				<div key="header" className="question-results-header">
					<p>{headerText}</p>
				</div>
				<div key="players" className="question-results-players">
					{playerLozenges}
				</div>
				<div key="advance" className="question-results-advance">
					<div className='add-question-button' onClick={buttonFunction}>
						<p>{buttonLabel}</p>
					</div>
				</div>
			</div>
		);
	}
}

PlayerResultsPanel.propTypes = {
	gameState: PropTypes.object,
	setGameState: PropTypes.func,
	socket: PropTypes.instanceOf(io.Socket),
};


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
		const question = this.state.questions[this.state.currentQuestion];
		const newPlayers = this.state.players.map((p) => {
			var newP = p;
			const pAnswer = question.answers.find((a) => a.id === p.id);
			if (pAnswer && pAnswer.answer === question.correctResponse) {
				newP.score++;
			}
			return newP;
		});
		const anyCorrectAnswer = question.answers.find((a) => a.answer === question.correctResponse);
		this.setGameState({
			correctPlayersRevealed: true,
			players: newPlayers,
		});
		if (anyCorrectAnswer) {
			this.props.socket.emit("play sound", "correct-reveal");
		}
	}

	revealFastestCorrect = () => {
		this.setGameState({
			fastestCorrectRevealed: true
		});
		this.props.socket.emit("play sound", "fastest-reveal");
	}

	endRound = () => {
		this.setGameState({
			currentPanel: "NextRoundPanel",
			correctPlayersRevealed: false,
			fastestCorrectRevealed: false,
		});
	}

	render = () => {
		const q = this.state.questions[this.state.currentQuestion];
		const correctAnswers = q.answers.filter((a) => a.answer === q.correctResponse);
		const numCorrectAnswerers = correctAnswers.length;
		var fastestCorrectTime, fastestCorrectPlayer;
		if (correctAnswers.length > 0) {
			fastestCorrectTime = Math.min.apply(Math,correctAnswers.map((a) => a.timeTaken));
			const fastestCorrectAnswer = correctAnswers.find((a) => {return a.timeTaken === fastestCorrectTime;});
			fastestCorrectPlayer = fastestCorrectAnswer.id;
		} else {
			fastestCorrectTime = 0;
			fastestCorrectPlayer = "";
		}

		const playerLozenges = this.state.players.map((player, index) => {
			const answer = q.answers.find((a) => { return a.id === player.id; });
			var fastest, lit, timeString;
			if (typeof answer !== "undefined") {
				fastest = player.id === fastestCorrectPlayer && this.state.fastestCorrectRevealed;
				lit = (answer.answer === q.correctResponse && this.state.correctPlayersRevealed);
				timeString = (answer.timeTaken / 1000).toFixed(2);
			} else {
				fastest = false;
				lit = false; 
				timeString = "";
			}
			const timeVisible = this.state.correctPlayersRevealed;
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
		if (this.state.fastestCorrectRevealed) {
			buttonFunction = this.endRound;
			buttonLabel = "End Question";
			headerText = `Fastest Correct Answer: ${this.state.players.find(p => p.id == fastestCorrectPlayer).screenName}, ${(fastestCorrectTime / 1000).toFixed(2)}s`;
		} else if (this.state.correctPlayersRevealed && numCorrectAnswerers === 0) {
			buttonFunction = this.endRound;
			buttonLabel = "End Question";
			headerText = "No Correct Answerers";
		} else if (this.state.correctPlayersRevealed) {
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


const PropTypes = require("prop-types");
import React, { Component } from "react";

// TODO
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
		this.setGameState({
			correctPlayersRevealed: true
		})
	}

	revealFastestCorrect = () => {
		this.setGameState({
			fastestCorrectRevealed: true,
			fastestFlashOn: true,
		})
		setInterval(this.flashWinner, 250);
	}

	flashWinner = () => {
		this.setGameState({
			fastestFlashOn: !this.state.fastestFlashOn,
		})
	}

	endRound = () => {
		this.setGameState({
			currentPanel: "NextRoundPanel",
			correctPlayersRevealed: false,
			fastestCorrectRevealed: false,
		})
	}

	render = () => {
		const q = this.state.questions[this.state.currentQuestion];
		const correctAnswers = q.answers.filter((a) => a.answer === q.correctResponse);
		const numCorrectAnswerers = correctAnswers.length;
		const fastestCorrectTime = Math.min.apply(Math,correctAnswers.map((a) => a.timeTaken))
		const fastestCorrectPlayer = q.answers.filter((a) => a.answer === q.correctResponse).find((a) => a.timeTaken === fastestCorrectTime).screenName;
		const playerLozenges = this.state.players.map((player) => {
			const answer = q.answers.filter((a) => a.screenName === player.screenName);
			const fastest = player.screenName = fastestCorrectPlayer && this.state.fastestFlashOn;
			const lit = answer.answer === (q.correctResponse && this.state.correctPlayersRevealed) && (!fastest || this.state.fastestFlashOn);
			const timeVisible = this.state.correctPlayersRevealed
			return (
				<div className={`player-result${lit ? " lit" : ""}`}>
					<p className={`player-result-name${lit ? " lit" : ""}`}>
						{player.screenName}
					</p>
					<p className={`player-result-time${lit ? " lit" : ""}${timeVisible ? "" : " invisible"}`}>
						{(answer.timeTaken.toDouble / 1000).toFixed(2)}
					</p>
				</div>
			);
		})
		var buttonFunction, buttonLabel, headerText;
		if (this.state.fastestCorrectRevealed) {
			buttonFunction = this.endRound;
			buttonLabel = "End Question"
			headerText = `Fastest Correct Answer: ${fastestCorrectPlayer.screenName}, ${(fastestCorrectTime.toDouble / 1000).toFixed(2)}s`
		} else if (this.state.correctPlayersRevealed && numCorrectAnswerers === 0) {
			buttonFunction = this.endRound;
			buttonLabel = "End Question"
			headerText = "No Correct Answerers"
		} else if (this.state.correctPlayersRevealed) {
			buttonFunction = this.revealFastestCorrect;
			buttonLabel = "Show Fastest Correct Answerer"
			headerText = `${numCorrectAnswerers} players answered correctly`
		} else {
			buttonFunction = this.revealCorrectPlayers;
			buttonLabel = "Show Correct Responders";
			headerText = "Correct Response: " + q.correctResponse;
		}

		return (
			<div className="question-results-panel">
				<div className="question-results-header">
					{headerText}
				</div>
				<div className="question-results-players">
					{playerLozenges}
				</div>
				<div className="question-results-advance">
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
};


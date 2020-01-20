const io = require("socket.io-client");
const PropTypes = require("prop-types");
import React, { Component } from "react";

export default class MainQuestionPanel extends Component {
	constructor(props) {
		super(props);

		this.state = {
			// default, lifelines, statistics
			buzzerPanelMode: "default",
		};
	}

	componentDidMount = () => {
		//this.props.socket.emit("play sound", "read-question");
		this.props.socket.on("new answer", this.handleNewAnswer);
	}

	componentWillUnmount = () => {
		this.props.socket.removeListener("new answer", this.handleNewAnswer);
	}

	handleNewAnswer = (details) => {
		if (this.props.gameState.ataVotesOpen && !this.props.gameState.ataVotesFinished && 
			details.player !== "") {

			const newATAVotes = this.props.gameState.ataVotes;

			newATAVotes.push({
				id: details.player,
				answer: details.answer,
			});

			this.props.setGameState({
				ataVotes: newATAVotes,
			});
		}
	}

	lastSafeHaven = () => {
		// find all safe havens that player has passed
		const passedSafeHavens = this.props.gameState.mainGameMoneyTree
			.filter((level, index) => level.safeHaven && index + 1 < this.props.gameState.mainGameQuestionNo);
		// if player has passed (a) safe haven(s), return the latest one
		if (passedSafeHavens.length > 0) {
			return passedSafeHavens[passedSafeHavens.length - 1];
		} else {
			// otherwise, return 0 (a player loses everything if they answer incorrectly)
			return {value: 0, textValue: this.props.formatNumber(0)};
		}
	}

	lockInAnswer = (option) => {
		if (this.props.gameState.mainGameOptionsShown === this.props.question.options.length
			&& !option.disabled && this.props.gameState.mainGameChosenAnswer == "" && this.props.gameState.mainGameActiveLifeline == "") {
			this.setGameState({
				mainGameChosenAnswer: option.key,
			});
		}
		
	}

	revealNextOption = () => {
		this.props.setGameState({
			mainGameOptionsShown: this.props.gameState.mainGameOptionsShown + 1,
		});

		if (this.props.gameState.mainGameOptionsShown + 1 == this.props.question.options.length) {
			this.setState({
				buzzerPanelMode: "default",
			});
		}
	}

	revealCorrectAnswer = () => {
		this.setGameState({
			mainGameCorrectRevealed: true,
		});
	}
	
	showLifelinePanel = () => {
		this.setState({
			buzzerPanelMode: "lifelines"
		});
	}

	walkAway = () => {
		this.setGameState({
			mainGameChosenAnswer: "Walk"
		});
	}

	concludeMainGame = () => {
		var winningsString, winnings;
		const {gameState, question} = this.props;
		// if player walked away
		if (gameState.mainGameChosenAnswer == "Walk") {
			// if on the first question
			if (gameState.mainGameQuestionNo == 1) {
				// winnings amount is zero
				winnings = 0;
				winningsString =  this.props.formatNumber(0);
			} else {
				// otherwise, winnings amount is value of previous question
				winnings = gameState.mainGameMoneyTree[gameState.mainGameQuestionNo - 2].value;
				winningsString = gameState.mainGameMoneyTree[gameState.mainGameQuestionNo - 2].textValue;
			}
		}
		// otherwise if player answered correctly on the final question
		else if (gameState.mainGameChosenAnswer == question.correctResponse && gameState.mainGameQuestionNo == gameState.mainGameMoneyTree.length) {
			// winnings amount is equal to current question's value
			winnings = gameState.mainGameMoneyTree[gameState.mainGameQuestionNo - 1].value;
			winningsString = gameState.mainGameMoneyTree[gameState.mainGameQuestionNo - 1].textValue;
		}
		// otherwise (answered incorrectly)
		else {
			// winnings amount is value of last safe haven
			winnings = this.lastSafeHaven().value;
			winningsString = this.lastSafeHaven().textValue;
		}
		this.setGameState({
			currentPanel: "PostMainGamePanel",
			mainGameWinningsString: winningsString,
			mainGameWinnings: winnings 
		});
	}

	nextQuestion = () => {
		this.setGameState({
			currentPanel: "LightsDownPanel",
			mainGameQuestionNo: this.props.gameState.mainGameQuestionNo + 1,
			mainGameChosenAnswer: "",
			mainGameCorrectRevealed: false,
			mainGameOptionsShown: 0,
		});
	}

	showStatisticsPanel = () => {
		this.setState({
			buzzerPanelMode: "statistics"
		});
	}

	showDefaultPanel = () => {
		this.setState({
			buzzerPanelMode: "default"
		});
	}

	setGameState = (state) => {
		this.setState(state);
		this.props.setGameState(state);
	}
	render = () => {
		const { question, gameState } = this.props;
		let buzzerPanel;

		const questionPanel = (
			<div className='open-question-body'>
				<p className='open-question-body'>
					{question.body}
				</p>
			</div>
		);

		const options = question.options.map((option, index) => {			
			if (gameState.mainGameOptionsShown <= index || option.disabled) {
				return (
					<div key={option.key} className='open-question-option'>
					</div>
				);
			}

			var className = "open-question-option";

			if (gameState.mainGameCorrectRevealed && question.correctResponse === option.key) {
				className += " correct";
			} else if (gameState.mainGameChosenAnswer === option.key 
				&& (!gameState.mainGameCorrectRevealed || question.correctResponse !== option.key)) {
				className += " orange";
			}

			

			return (
				<div key={option.key} className={className} onClick={() => this.lockInAnswer(option)}>
					<div className='open-question-option-icon'>
						{option.key}
					</div>
					<p className='open-question-option'>
						{option.text}
					</p>
				</div>
			);
		});

		const optionsPanel = (
			<div className='open-question-options'>
				{options}
			</div>
		);

		if (gameState.mainGameOptionsShown !== question.options.length) {
			buzzerPanel = (
				<div className='buzzer-panel'>
					<div className='add-question-button' onClick={this.revealNextOption}>
						<p>Reveal Next Option</p>
					</div>
				</div>
			);
		}
		else if (gameState.mainGameActiveLifeline !== "") {
			switch (gameState.mainGameActiveLifeline) {
			case "Ask The Audience":
				if (!gameState.ataVotesOpen) {
					buzzerPanel = (
						<div className='buzzer-panel'>
							<p className='buzzer-panel'>Ask the Audience activated</p>
							<div className="button-row">
								<div className='add-question-button' onClick={this.props.beginATAVoting}>
									<p>Begin Voting</p>
								</div>
							</div>
						</div>
					);
				} else if (!gameState.ataVotesFinished) {
					buzzerPanel = (
						<div className='buzzer-panel'>
							<p className='buzzer-panel'>Audience voting open - {gameState.ataVotes.length} answers received</p>
							<div className="button-row">
								<div className='add-question-button' onClick={this.props.endATAVoting}>
									<p>End Voting and Show Results</p>
								</div>
							</div>
						</div>
					);
				} else {
					buzzerPanel = (
						<div className='buzzer-panel'>
							<p className='buzzer-panel'>
								Ask the Audience results ({gameState.ataVotes.length} total): <br/>
								{question.options.map(o => {
									const optionCount = gameState.ataVotes.filter(v => v.answer == o.key).length;
									const optionPct = gameState.ataVotes.length > 0 ? Math.round((optionCount/gameState.ataVotes.length) * 100) : 0;
									return `${o.key}: ${optionPct}%`;
								}).join(" - ")}
							</p>
							<div className="button-row">
								<div className='add-question-button' onClick={this.props.dismissLifeline}>
									<p>Dismiss Results</p>
								</div>
							</div>
						</div>
					);
				}
				break;
			case "Phone a Friend":
				// TODO
				break;
			}
		}
		else if (gameState.mainGameChosenAnswer === "") {
			switch (this.state.buzzerPanelMode) {
			case "default":
				buzzerPanel = (
					<div className='buzzer-panel'>
						<p className='buzzer-panel'>Select an answer above to lock it in</p>
						<div className="button-row">
							<div className='add-question-button' onClick={this.showLifelinePanel}>
								<p>Lifelines</p>
							</div>
							<div className='add-question-button' onClick={this.showStatisticsPanel}>
								<p>Statistics</p>
							</div>
							<div className='add-question-button' onClick={this.walkAway}>
								<p>Walk</p>
							</div>
						</div>
						
					</div>
				);
				break;
			case "lifelines":
				buzzerPanel = (
					<div className='buzzer-panel'>
						<div className='button-row'>
							{/* TODO show all available lifelines as buttons, plus Back button to return to default*/}
							{gameState.mainGameLifelinesAvailable.map((l,i) => (
								<div className='add-question-button' key={i} onClick={() => this.props.activateLifeline(l)}>
									<p>{l}</p>
								</div>
							))}
						</div>
						<div className='add-question-button' onClick={this.showDefaultPanel}>
							<p>Back</p>
						</div>
					</div>
				);
				
				break;
			case "statistics":
				// TODO show the following information in coloured blocks and symbols:
				// Number of correct answers away from winning top prize (dark blue, bullseye)
				// Amount player can leave with by walking away (orange, pile of coins/chips)
				// Amount player will go to if question is answered correctly (green, tick)
				// Amount player will leave with if question is answered incorrectly - i.e. last safe haven achieved (red, cross)
				// Amount player will lose if question is answered incorrectly - i.e. walkaway amount minus last safe haven (teal, down arrow)
				// At the bottom, Back button to return to default

				buzzerPanel = (
					<div className='buzzer-panel'>
						<p className='buzzer-panel'>
							Q's left: {gameState.mainGameMoneyTree.length - gameState.mainGameQuestionNo + 1} -
							Walk: {gameState.mainGameQuestionNo == 1 ? this.props.formatNumber(0) 
								: gameState.mainGameMoneyTree[gameState.mainGameQuestionNo - 2].textValue}<br/>
							Right: {gameState.mainGameMoneyTree[gameState.mainGameQuestionNo - 1].textValue} -
							Wrong: {this.lastSafeHaven().textValue} - 
							Risk: {gameState.mainGameQuestionNo == 1 ? this.props.formatNumber(0) 
								: this.props.formatNumber(gameState.mainGameMoneyTree[gameState.mainGameQuestionNo - 2].value - this.lastSafeHaven().value)}
						</p>
						<div className='add-question-button' onClick={this.showDefaultPanel}>
							<p>Back</p>
						</div>
					</div>
				);

				break;
			}
		} else if (gameState.mainGameChosenAnswer === "Walk") {
			if (gameState.mainGameCorrectRevealed) {
				buzzerPanel = (
					<div className='buzzer-panel'>
						<p className='buzzer-panel'>Correct Answer was {question.correctResponse}</p>
						<div className='add-question-button' onClick={this.concludeMainGame}>
							<p>Conclude Main Game</p>
						</div>
					</div>
				);
			} else {
				buzzerPanel = (
					<div className='buzzer-panel'>
						<p className='buzzer-panel'>Player has Walked Away<br/>
						(Correct Answer was {question.correctResponse})</p>
						<div className='add-question-button' onClick={this.revealCorrectAnswer}>
							<p>Reveal Correct Answer</p>
						</div>
					</div>
				);
			}
		} else if (!gameState.mainGameCorrectRevealed) {
			buzzerPanel = (
				<div className='buzzer-panel'>
					<p className='buzzer-panel'>Correct Answer is {question.correctResponse}<br/>
					(Player is {question.correctResponse === gameState.mainGameChosenAnswer ? "Correct" : "Incorrect"})</p>
					<div className='add-question-button' onClick={this.revealCorrectAnswer}>
						<p>Reveal Correct Answer and Result</p>
					</div>
				</div>
			);
		} else if (question.correctResponse === gameState.mainGameChosenAnswer) {
			buzzerPanel = (
				<div className='buzzer-panel'>
					<p className='buzzer-panel'>Player is Correct</p>
					<div className='add-question-button' onClick={this.nextQuestion}>
						<p>Go to Next Question</p>
					</div>
				</div>
			);
		} else {
			buzzerPanel = (
				<div className='buzzer-panel'>
					<p className='buzzer-panel'>Player is Incorrect</p>
					<div className='add-question-button' onClick={this.concludeMainGame}>
						<p>Conclude Main Game</p>
					</div>
				</div>
			);
		}



		return (
			<div id='open-question-panel'>
				<div className='column'>
					<div className='open-question-header'>
						<p className='open-question-header'>
							QUESTION {gameState.mainGameQuestionNo} - {gameState.mainGameMoneyTree[gameState.mainGameQuestionNo - 1].textValue}
						</p>
					</div>
					{questionPanel}
					{optionsPanel}
					{buzzerPanel}
				</div>
			</div>
		);
	}
}

MainQuestionPanel.propTypes = {
	question: PropTypes.object,
	setGameState: PropTypes.func,
	gameState: PropTypes.object,
	socket: PropTypes.instanceOf(io.Socket),
	formatNumber: PropTypes.func,
	activateLifeline: PropTypes.func,
	dismissLifeline: PropTypes.func,
	beginATAVoting: PropTypes.func,
	endATAVoting: PropTypes.func,
};
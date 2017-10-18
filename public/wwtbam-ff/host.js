import React, { Component } from "react";
const ReactDOM = require("react-dom");
const socket = require("socket.io-client")();
const $ = require("jquery");
const fs = require("fs");
const PropTypes = require("prop-types");
const ReactCSSTransitionReplace = require("react-css-transition-replace");
const ReactCSSTransitionGroup = require("react-addons-css-transition-group");

const gameCode = getParameterByName("gamecode");


socket.emit("host request", {
	gameCode: gameCode,
});

socket.on("game details", (details) => {
	console.log("Game Details received");
	console.log(details);
	$("#game-code").text(details.gameCode);
	$("#game-title").text(details.gameTitle);
	let state;
	if ($.isEmptyObject(details.gameState)) {
		state = {
			players: [],
			detailPlayerName: "",

			questions: [],
			currentQuestion: 0,
			currentPanel: "NoQuestionPanel",
			newPanelKey: 0,

			buzzersOpen: false,
			playerStats: [],
		};
		socket.emit("set state", state);
	} else {
		state = details.gameState;
	}
	ReactDOM.render(<HostConsole receivedState={state}/>,
		document.getElementById("main-panel"));
});


class HostConsole extends Component {
	constructor(props) {
		super(props);
		this.state = props.receivedState;
	}

	componentDidMount = () => {
		socket.on("new player", this.handleNewPlayer);
	}

	componentWillUnmount = () => {
		socket.removeListener("new player", this.handleNewPlayer);
	}

	changeCurrentPanel = (panelName) => {
		this.setGameState({
			currentPanel: panelName,
			newPanelKey: this.state.newPanelKey + 1,
		});
	}

	handleNewPlayer = (screenName) => {
		console.log("new player:");
		console.log(screenName);
		var newPlayer = {
			screenName: screenName,
			score: 0,
			hidden: false,
			correctAnswers: 0,
			aggregateTime: 0.0,
			currentQuestionAnswer: "",
			answeredCurrentQuestion: false,
			answeredCurrentQuestionCorrectly: false,
			currentQuestionTime: 0.0,
		};
		const newPlayers = this.state.players;

		newPlayers.push(newPlayer);
		this.setGameState({
			players: newPlayers,
		});
	}

	changePlayerScore = (screenName, newScore) => {
		const newPlayers = this.state.players;
		newPlayers.find((player) => {
			return player.screenName === screenName;
		}).score = newScore;
		this.setGameState({
			players: newPlayers,
		});
	}

	showPlayerDetails = (name, event) => {
		console.log(`showPlayerDetails(${ name },${ event }) called`);
		this.setGameState({
			detailPlayerName: name,
		});
	}

	clearPlayerDetails = () => {
		this.setGameState({
			detailPlayerName: "",
		});
	}

	hidePlayer = (playerName) => {
		const newPlayers = this.state.players;
		newPlayers.find((player) => {
			return player.screenName === playerName;
		}).hidden = true;
		this.setGameState({
			players: newPlayers,
		});
	}

	unhidePlayer = (playerName) => {
		const newPlayers = this.state.players;
		newPlayers.find((player) => {
			return player.screenName === playerName;
		}).hidden = false;
		this.setGameState({
			players: newPlayers,
		});
	}

	goToNextRound = () => {
		this.setGameState({
			currentQuestion: this.state.currentQuestion + 1,
			currentPanel: "OpenQuestionPanel",
			newPanelKey: this.state.newPanelKey + 1,
		});
	}

	setGameState = (changedItems) => {
		console.log("setGameState called");
		this.setState(changedItems);
		socket.emit("set state", changedItems);
	}

	setGameData = (questions) => {
		console.log(questions);

		this.setGameState({
			questions: questions,
			currentQuestion: 0,
			players: this.state.players,
			currentPanel: "OpenQuestionPanel",
			newPanelKey: this.state.newPanelKey + 1,
		});
	}

	render = () => {
		const { players, detailPlayerName, playerAnswering, currentPanel,
			newPanelKey, currentRound, rounds, questions,
			currentQuestion } = this.state;
		// render player list panel
		let playerPanel;
		if (detailPlayerName === "") {
			const nonHiddenPlayers = players.filter((player) => {
				return !player.hidden;
			});
			const playerCountString = nonHiddenPlayers.length === 1 ? "1 Player" :
				`${nonHiddenPlayers.length } Players`;
			$("#player-count").text(playerCountString);
			if (nonHiddenPlayers.length !== 0) {
				const playersByScore = nonHiddenPlayers.sort((p1, p2) => {
					return p1.score > p2.score;
				});
				const list = playersByScore.map((player) => {
					return (
						<PlayerListing
							onClick={this.showPlayerDetails.bind(this, player.screenName)}
							player={player}
							key={player}
							waitingForAnswer={!player.answeredCurrentQuestion}/>
					);
				});
				playerPanel = <div>{list}</div>;
			} else {
				playerPanel = <div><p className='no-players'>No Players</p></div>;
			}
		} else {
			const player = players.find((player) => {
				return player.screenName === detailPlayerName;
			});
			playerPanel = (<PlayerDetailsPanel
				player={player}
				clearPlayerDetails={this.clearPlayerDetails}
				hidden={player.hidden}
				hidePlayer={this.hidePlayer}
				unhidePlayer={this.unhidePlayer}
				changePlayerScore={this.changePlayerScore}/>);
		}


		let mainPanel;
		switch (currentPanel) {
		case "NoQuestionPanel":
			mainPanel = (
				<NoQuestionPanel
					key={newPanelKey}
					setGameData={this.setGameData}/>
			);
			break;

		case "NextRoundPanel":
			mainPanel = (
				<NextRoundPanel
					key={newPanelKey}
					lastRound={currentRound === rounds.length - 1}
					callback={this.goToNextRound}/>
			);
			break;

		case "OpenQuestionPanel":
			mainPanel = (<OpenQuestionPanel
				key={newPanelKey}
				players={players}
				changePlayerScore={this.changePlayerScore}
				gameState={this.state}
				setGameState={this.setGameState}
				question={questions[currentQuestion]}/>);
			break;

		// TODO QuestionResultsPanel
		case "QuestionResultsPanel":

			break;
		// TODO PlayerResultsPanel
		case "PlayerResultsPanel":

			break;
		default:
			mainPanel = null;
			break;
		}

		return (
			<div className='main-panel'>
				<div id='player-list' className='content'>
					{playerPanel}
				</div>
				<div
					id='question-panel'
					className='content'>
					{mainPanel}
				</div>
			</div>
		);
	}
}

HostConsole.propTypes = {
	receivedState: PropTypes.object,
};

class PlayerDetailsPanel extends Component {
	openScoreDialog = () => {
		let validNumber = false;
		let newScore = "";
		while (!validNumber) {
			newScore = prompt(`Enter a new score for ${ this.props.player.screenName
			} (current score ${ this.props.player.score })`,
				this.props.player.score.toString());
			if (!isNaN(parseInt(newScore, 10))) {
				this.props.changePlayerScore(this.props.player.screenName,
					parseInt(newScore, 10));
				validNumber = true;
			}
		}
	}
	render = () => {
		let hideButton;
		if (this.props.player.hidden) {
			hideButton = (
				<div
					className='add-question-button'
					href='#'
					onClick={this.props.unhidePlayer(this.props.player.screenName)}>
					<p>Unhide Player</p>
				</div>
			);
		} else {
			hideButton = (
				<div
					className='cancel-question-button'
					href='#'
					onClick={this.props.hidePlayer(this.props.player.screenName)}>
					<p>Hide Player</p>
				</div>
			);
		}
		return (
			<div className='player-details-panel'>
				<div className='player-details-name'>
					<p className='player-details-name'>{this.props.player.screenName}</p>
				</div>
				<div className='player-details-score'>
					<p className='player-details-score'>{this.props.player.score}</p>
				</div>
				<div
					className='add-question-button'
					href='#'
					onClick={this.openScoreDialog}>
					<p>Change Score</p>
				</div>
				{hideButton}
				<div
					className='player-details-back'
					href='#'
					onClick={this.props.clearPlayerDetails}>
					<p className='player-details-back'>Back</p>
				</div>
			</div>
		);
	}
}

PlayerDetailsPanel.propTypes = {
	player: PropTypes.object,
	clearPlayerDetails: PropTypes.func,
	hidePlayer: PropTypes.func,
	unhidePlayer: PropTypes.func,
	changePlayerScore: PropTypes.func,
};


class PlayerListing extends Component {
	render = () => {
		const scoreString = this.props.player.score;
		let classExt = "";
		if (this.props.player.score < 0) {
			classExt += " negative";
		}

		if (this.props.waitingForAnswer) {
			classExt += " waiting";
		}

		console.log(scoreString);

		return (
			<div className={`playerListing${ classExt}`} onClick={this.props.onClick}>
				<div className={`playerListingName${ classExt}`}>
					<p className={`playerListingName${ classExt}`}>
						{this.props.player.screenName}
					</p>
				</div>
				<div className={`playerListingDetails${ classExt}`}>
					<p className={`playerListingDetails${ classExt}`}>{scoreString}</p>
				</div>
			</div>
		);
	}
}

PlayerListing.propTypes = {
	player: PropTypes.object,
	answering: PropTypes.bool,
	waitingForAnswer: PropTypes.bool,
};


// starting panel, with field to upload question file
class NoQuestionPanel extends Component {
	constructor(props) {
		super(props);
		const testFiles = fs.readdirSync("public/wwtbam-ff/testgames");
		this.state = {
			gameUsed: "upload",
			testFiles: testFiles,
			testFileSelected: `testgames/${ testFiles[0]}`,
		};
	}
	processFile = () => {
		if (!(this.state.anyFieldsEmpty)) {
			let selectedFile;
			if (this.state.gameUsed === "upload") {
				selectedFile = document.getElementById("questionFile").files[0];
				const reader = new FileReader();
				reader.onload = (event) => {
					this.loadGameData(JSON.parse(event.target.result));
				};
				reader.readAsText(selectedFile);
				console.log("readAsText called");
				// TODO show loading graphic until processing is done
			} else {
				console.log(this.state.testFileSelected);
				$.ajax({
					type: "GET",
					url: this.state.testFileSelected,
					success: this.loadGameData,
				});
			}
		}
	}
	loadGameData = (fileObject) => {
		console.log("reader.onload called");
		console.log(fileObject);
		const questions = fileObject.questions.map((question, index) => {
			const newQuestion = question;
			newQuestion.questionNo = index + 1;
			return newQuestion;
		});
		this.props.setGameData(questions);
	}
	changeGameUsed = (event) => {
		this.setState({
			gameUsed: event.target.value,
		});
	}
	changeTestFile = (event) => {
		console.log("changeTestFile called");
		console.log(event);
		this.setState({
			testFileSelected: event.target.value,
		});
	}
	render = () => {
		const gameTypeRadioGroup = (
			<div className='game-type-radio-group'>
				<label>
					<input type='radio' value='upload'
						checked={this.state.gameUsed === "upload"}
						onChange={this.changeGameUsed}/>
					<p>Upload your own file</p>
				</label>
				<label>
					<input type='radio' value='testfile'
						checked={this.state.gameUsed === "testfile"}
						onChange={this.changeGameUsed}/>
					<p>Use an Internal Test Game</p>
				</label>
			</div>
		);

		let fileInputSection;

		if (this.state.gameUsed === "upload") {
			fileInputSection = (
				<input
					type='file'
					required multiple={false}
					id='questionFile'/>
			);
		} else {
			const testGameOptions = this.state.testFiles.map((file) => {
				return (
					<option
						value={`testgames/${ file }`}
						key={file}>
						{file}
					</option>
				);
			});
			fileInputSection = (
				<select onChange={this.changeTestFile}>
					{testGameOptions}
				</select>
			);
		}
		return (
			<div className='no-question-panel'>
				{gameTypeRadioGroup}
				<div className='upload-file-dialog'>{fileInputSection}</div>
				<div
					className='add-question-button'
					href='#'
					onClick={this.processFile}><p>Go</p></div>
			</div>
		);
	}
}

NoQuestionPanel.propTypes = {
	setGameData: PropTypes.func,
	gameState: PropTypes.object,
};


// panel for between questions
class NextRoundPanel extends Component {
	render = () => {
		const buttonText = "Go to Next Question";
		let button = null;
		if (!this.props.lastRound) {
			button = (
				<div
					className='add-question-button'
					href='#'
					onClick={this.props.callback}>
					<p>{buttonText}</p>
				</div>
			);
		}

		return (
			<div className='no-question-panel'>
				{button}
			</div>
		);
	}
}

NextRoundPanel.propTypes = {
	lastRound: PropTypes.bool,
	callback: PropTypes.func,
};


class OpenQuestionPanel extends Component {
	constructor(props) {
		super(props);
		const playerStats = this.props.players.map((player) => {
			return {
				name: player.screenName,
				currentQuestionAnswer: "",
				answeredCurrentQuestion: false,
				answeredCurrentQuestionCorrectly: false,
				currentQuestionTime: 0.0,
			};
		});
		this.state = {
			buzzersOpen: false,
			playerStats: playerStats,
		};
	}

	componentDidMount = () => {
		socket.on("new answer", this.handleNewAnswer);
	}

	componentWillUnmount = () => {
		socket.removeListener("new answer", this.handleNewAnswer);
	}

	handleNewAnswer = (details) => {
		if (this.props.gameState.buzzersOpen &&
			details.player.screenName !== "") {
			console.log("new answer:");
			console.log(details);
			console.log(this);

			const newPlayers = this.props.players;
			const answerer = newPlayers.find((player) => {
				return player.screenName === details.player.screenName;
			});
			answerer.currentQuestionAnswer = details.submittedAnswer;
			answerer.answeredCurrentQuestion = true;
			answerer.currentQuestionTime = details.timeTaken;
			answerer.answeredCurrentQuestionCorrectly =
				(details.submittedAnswer === this.props.question.correctAnswer);

			this.props.setGameState({
				players: newPlayers,
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
		socket.emit("send question", this.props.question);
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
			const numRemainingPlayers = players.filter((p) => {return !p.answeredCurrentQuestion;}).length;
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
};


// TODO
class QuestionResultsPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fullAnswerRevealed: false,
			numAnswersRevealed: 0,
			correctRespondersRevealed: false,
		};
	}
	revealAnswer = () => {
		const numOptions = this.props.question.options.length;
		const numRevealed = this.state.numAnswersRevealed;
		if (this.props.question.type === "ordered-choice") {
			if (numOptions > numRevealed) {
				this.setState({
					numAnswersRevealed: numRevealed + 1,
					fullAnswerRevealed: (numRevealed + 1 === numOptions),
				});
			}
		} else {
			this.setState({
				fullAnswersRevealed: true,
			});
		}
	}
	render = () => {
		return null;
	}
}

QuestionResultsPanel.propTypes = {
	question: PropTypes.object,
	players: PropTypes.array,
};

// TODO
class PlayerResultsPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			answersRevealed: false,
			winnerRevealed: false,
		};
	}
}

PlayerResultsPanel.propTypes = {
	players: PropTypes.array,
};

function getParameterByName(name, url) {
	if (!url) {
		url = window.location.href;
	}
	const filteredName = name.replace(/[\[\]]/g, "\\$&");
	const regex = new RegExp(`[?&]${ filteredName }(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);
	if (!results) {
		return null;
	}
	if (!results[2]) {
		return "";
	}
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

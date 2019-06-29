const React = require("react");
const PropTypes = require("prop-types");
const io = require("socket.io-client");

export default class FinalJeopardyPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = props.gameState;
	}
	componentDidMount = () => {
		this.props.socket.on("new answer", this.handleNewAnswer);

		this.props.socket.on("new message", this.handleNewMessage);
	}
	componentWillUnmount = () => {
		this.props.socket.removeListener("new answer", this.handleNewAnswer);

		this.props.socket.removeListener("new message", this.handleNewMessage);
	}
	handleNewAnswer = (details) => {
		console.log("new answer:");
		console.log(details);
		if (!this.state.finalResponses.some(resp => resp.id === details.player)) {
			const newResponses = this.state.finalResponses;
			newResponses.push({
				id: details.player,
				response: details.answer,
			});

			// if time is up and all responses are now in, allow reveal of responses to proceed
			if (this.state.finalRespondingOver && newResponses.length === this.state.finalEligiblePlayers.length) {
				this.setGameState({
					finalFocusMode: "pending",
				});
			}

			this.setGameState({
				finalResponses: newResponses,
			});
		}
	}
	handleNewMessage = (message) => {
		console.log("new message:");
		console.log(message);
		if (message.details.type === "wager" && this.state.finalWageringOpen &&
			!this.state.finalWagers.some((wager) => {
				return wager.id === message.player;
			})) {
			const newWagers = this.state.finalWagers;
			newWagers.push({
				id: message.player,
				wager: message.details.wager,
			});
			this.setGameState({
				finalWagers: newWagers,
				allFinalWagersIn: newWagers.length === this.props.eligiblePlayers.length,
			});
		}
	}
	setGameState = (state) => {
		this.setState(state);
		this.props.setGameState(state);
	}
	showCategory = () => {
		this.setGameState({
			finalCategoryVisible: true,
			finalWageringOpen: true,
			allFinalWagersIn: this.props.eligiblePlayers.length === 0,
		});
		// console.log("Final Eligible Players:");
		// console.log(this.props.eligiblePlayers);
		// this.props.eligiblePlayers.map((player) => {
		// 	console.log("About to send wager message to " + player.screenName);
		// 	this.props.socket.emit("send private message", {
		// 		screenName: player.screenName,
		// 		message: {
		// 			type: "wager",
		// 			balance: player.score,
		// 			category: this.props.final.category,
		// 			prefix: this.props.prefix,
		// 			suffix: this.props.suffix,
		// 		},
		// 	});
		// });
		// send message to display to play reveal tone
		this.props.socket.emit("play sound", "final-reveal");
	}
	showClue = () => {
		this.setGameState({
			finalClueVisible: true,
		});
		// send message to display to play reveal tone
		this.props.socket.emit("play sound", "final-reveal");
	}
	openResponses = () => {
		this.setGameState({
			finalRespondingOpen: true,
		});
		// this.props.eligiblePlayers.map((player) => {
		// 	this.props.socket.emit("send private message", {
		// 		screenName: player.screenName,
		// 		message: {
		// 			type: "final",
		// 			questionBody: this.props.final.answer,
		// 		},
		// 	});
		// });
		this.props.socket.emit("play sound", "final-think");
		// send message to display to start think music
		const timer = setInterval(() => {
			if (this.state.finalRespondingTimeRemaining > 1) {
				this.setGameState({
					finalRespondingTimeRemaining: this.state.finalRespondingTimeRemaining - 1,
				});
			} else {
				console.log("time up");
				clearInterval(timer);
				this.closeResponses();
				
			}
		}, 1000);
	}


	goToFirstFocus = () => {
		let finalFocusResponse;
		if (this.state.finalEligiblePlayers.length > 0) {
			const firstFocusID = this.state.finalEligiblePlayers[0].id;

			if (this.state.finalResponses.some((resp) => {
				console.log(resp);
				return resp.id === firstFocusID;
			})) {
				finalFocusResponse = this.state.finalResponses.find((resp) => {
					return resp.id === firstFocusID;
				}).response;
			} else {
				finalFocusResponse = "";
			}

			console.log("Final Wagers:");
			console.log(this.state.finalWagers);

			var firstFocusWagerValue;

			if (this.state.finalWagers.some((wag) => {
				console.log(wag);
				return wag.id === firstFocusID;
			})) {
				firstFocusWagerValue = this.state.finalWagers.find((wag) => {
					console.log(`wager name = ${ wag.id } vs ${ firstFocusID }`);
					return wag.id === firstFocusID;
				}).wager;
			} else {
				firstFocusWagerValue = 0;
			}

			this.setGameState({
				currentPanel: "FinalJeopardyResponsePanel",
				finalFocusPlayerID: firstFocusID,
				finalFocusMode: "response",
				finalFocusWager: this.props.prefix + firstFocusWagerValue + this.props.suffix,
				finalFocusResponse: finalFocusResponse,
				finalFocusResponseVisible: true,
				finalFocusWagerVisible: false,
			});
		} else {
			this.setGameState({
				currentPanel: "FinalJeopardyResponsePanel",
				finalFocusMode: "no-eligible",
			});
		}

	}

	closeResponses = () => {
		if (this.state.finalResponses.length === this.state.finalEligiblePlayers.length) {
			this.setGameState({
				finalFocusMode: "pending",
			});
		}
		this.setGameState({
			finalRespondingOver: true,
			finalRespondingOpen: false,
		});
	}
	nextFocus = () => {
		// if last player's response and wager has been revealed, end game
		if (this.state.finalFocusPlayerNumber ===
			this.props.eligiblePlayers.length - 1) {
			this.props.endGame();
		} else {
			const finalFocusPlayerNumber = this.state.finalFocusPlayerNumber + 1;
			const finalFocusPlayerID = this.props.eligiblePlayers[finalFocusPlayerNumber].id;
			this.setGameState({
				finalFocusPlayerNumber: finalFocusPlayerNumber,
				finalFocusPlayerID: finalFocusPlayerID,
				finalFocusMode: "response",
			});

			let finalFocusResponse;
			if (this.state.finalResponses.some((resp) => {
				return resp.id === finalFocusPlayerID + 1;
			})) {
				finalFocusResponse = this.state.finalResponses.find((resp) => {
					return resp.id === finalFocusPlayerID + 1;
				}).response;
			} else {
				finalFocusResponse = "";
			}
			this.setGameState({
				finalFocusResponse: finalFocusResponse,
			});

			// send message to display to go to next response
			this.props.socket.emit("set state", {
				finalFocusPlayerID: finalFocusPlayerID,
				finalFocusWager: this.props.prefix +
					this.state.finalWagers.find((player) => {
						return player.id === finalFocusPlayerID;
					}).wager + this.props.suffix,
				finalFocusResponse: finalFocusResponse,
				finalFocusResponseVisible: true,
				finalFocusWagerVisible: false,
			});
		}
	}
	wrongAnswer = () => {
		this.props.changePlayerScore(this.state.finalFocusPlayerID,
			this.props.eligiblePlayers.find((player) => {
				return player.id === this.state.finalFocusPlayerID;
			}).score -
				this.state.finalWagers.find((player) => {
					return player.id === this.state.finalFocusPlayerID;
				}).wager);
		this.setGameState({
			finalFocusMode: "wager",
			finalFocusCorrect: false,
			finalFocusWagerVisible: true,
		});
	}
	rightAnswer = () => {
		this.props.changePlayerScore(this.state.finalFocusPlayerID,
			this.props.eligiblePlayers.find((player) => {
				return player.id === this.state.finalFocusPlayerID;
			}).score +
				this.state.finalWagers.find((player) => {
					return player.id === this.state.finalFocusPlayerID;
				}).wager);
		this.setGameState({
			finalFocusMode: "wager",
			finalFocusCorrect: true,
			finalFocusWagerVisible: true,
		});
	}

	render = () => {
		let categoryPanel;
		if (!this.state.finalCategoryVisible) {
			categoryPanel = (
				<div className='final-jeopardy-category'>
					<div className='add-question-button' onClick={this.showCategory}>
						<p>Show Category and Open Wagers</p>
					</div>
				</div>
			);
		} else {
			categoryPanel = (
				<div className='final-jeopardy-category'>
					<p className='final-jeopardy-category'>{this.props.final.category}</p>
				</div>
			);
		}

		let cluePanel;
		if (!this.state.finalCategoryVisible) {
			cluePanel = <div className='final-jeopardy-clue'/>;
		} else if (!this.state.allFinalWagersIn) {
			cluePanel = (
				<div className='final-jeopardy-clue'>
					<p className='final-jeopardy-clue'>
						Waiting on wager from {this.props.eligiblePlayers.length -
							this.state.finalWagers.length} contestant(s)
					</p>
				</div>
			);
		} else if (!this.state.finalClueVisible) {
			cluePanel = (
				<div className='final-jeopardy-clue'>
					<p className='final-jeopardy-clue'>
						All Wagers In
					</p>
					<div className='add-question-button' onClick={this.showClue}>
						<p>Show Clue</p>
					</div>
				</div>
			);
		} else {
			cluePanel = (
				<div className='final-jeopardy-clue'>
					<p className='final-jeopardy-clue'>
						{this.props.final.answer}
					</p>
				</div>
			);
		}


		let correctPanel;
		if (!this.state.finalClueVisible) {
			correctPanel = <div className='final-jeopardy-correct'/>;
		} else if (!this.state.finalRespondingOpen && !this.state.finalRespondingOver) {
			correctPanel = (
				<div className='final-jeopardy-correct'>
					<div className='add-question-button' onClick={this.openResponses}>
						<p>Open Responses and Start Clock</p>
					</div>
				</div>
			);
		} else if (!this.state.finalRespondingOver) {
			correctPanel = (
				<div className='final-jeopardy-correct'>
					<p className='final-jeopardy-correct'>
						{this.state.finalRespondingTimeRemaining} second(s) remaining
					</p>
				</div>
			);
		} else if (this.state.finalFocusMode === "not-ready") {
			correctPanel = (
				<div className='final-jeopardy-correct'>
					<p className='final-jeopardy-correct'>
						Finalising Responses...
					</p>
				</div>
			);
		} else if (this.state.finalFocusMode === "pending") {
			correctPanel = (
				<div className='final-jeopardy-correct'>
					<p className='final-jeopardy-correct'>
						Time Up
					</p>
					<div className='add-question-button' onClick={this.goToFirstFocus}>
						<p>Go to First Response</p>
					</div>
				</div>
			);
		} else {
			correctPanel = (
				<div className='final-jeopardy-correct'>
					<p className='final-jeopardy-correct'>
						Correct response:<br/>
						{this.props.final.correct}
					</p>
				</div>
			);
		}


		let responsePanel;
		if (!this.state.finalRespondingOver || this.state.finalFocusMode === "pending" || this.state.finalFocusMode === "not-ready") {
			responsePanel = <div className='final-jeopardy-response'/>;
		} else if (this.state.finalFocusMode === "no-eligible") {
			responsePanel = (
				<div className='final-jeopardy-response'>
					<p className="final-jeopardy-response">
						No Eligible Players
					</p>
					<div className='add-question-button' onClick={this.props.endGame}>
						<p>Continue</p>
					</div>
				</div>
			);
		} else if (this.state.finalFocusMode === "response") {
			console.log(this.state.finalResponses);
			console.log(this.state.finalFocusResponse);
			const focusName = this.state.players.find(p => p.id == this.state.finalFocusPlayerID).screenName;
			responsePanel = (
				<div className='final-jeopardy-response'>
					<div className='button-row space-between'>
						<p className='final-jeopardy-response left'>
							{focusName} responded:
						</p>
						<div className='button-row recursive'>
							<div className='add-question-button' onClick={this.rightAnswer}>
								<p>Correct</p>
							</div>
							<div className='add-question-button' onClick={this.wrongAnswer}>
								<p>Incorrect</p>
							</div>
						</div>
					</div>
					<p className='final-jeopardy-response'>
						{this.state.finalFocusResponse}
					</p>
				</div>
			);
		} else {
			console.log(this.state.finalWagers);
			const currentWager = this.state.finalWagers.find(wager => wager.id === this.state.finalFocusPlayerID).wager;
			console.log(currentWager);
			const focusName = this.state.players.find(p => p.id == this.state.finalFocusPlayerID).screenName;
			responsePanel = (
				<div className='final-jeopardy-response'>
					<div className='button-row space-between'>
						<p className='final-jeopardy-response left'>
							{focusName} wagered:
						</p>
						<div className='button-row recursive'>
							<div className='add-question-button' onClick={this.nextFocus}>
								<p>Next</p>
							</div>
						</div>
					</div>
					<p className='final-jeopardy-response'>
						{this.props.prefix}{currentWager}{this.props.suffix}
					</p>
				</div>
			);
		}

		return (
			<div id='open-question-panel'>
				<div className='final-jeopardy-header'>
					<p className='final-jeopardy-header'>Final JEOPARDY!</p>
				</div>
				{categoryPanel}
				{cluePanel}
				{correctPanel}
				{responsePanel}
			</div>
		);
	}
}

FinalJeopardyPanel.propTypes = {
	eligiblePlayers: PropTypes.array,
	final: PropTypes.object,
	changePlayerScore: PropTypes.func,
	socket: PropTypes.instanceOf(io.Socket),
	prefix: PropTypes.string,
	suffix: PropTypes.string,
	gameState: PropTypes.object,
	setGameState: PropTypes.func,
	endGame: PropTypes.func,
};


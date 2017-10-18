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
		if (this.state.finalRespondingOpen && !this.state.finalRespondingOver &&
			!this.state.finalResponses.some((resp) => {
				return resp.screenName === details.screenName;
			})) {
			const newResponses = this.state.finalResponses;
			newResponses.push({
				screenName: details.player,
				response: details.answer,
			});
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
				return wager.screenName === message.player.screenName;
			})) {
			const newWagers = this.state.finalWagers;
			newWagers.push({
				screenName: message.player,
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
		});

		this.props.eligiblePlayers.map((player) => {
			this.props.socket.emit("send private message", {
				screenName: player.screenName,
				message: {
					type: "wager",
					balance: player.score,
					category: this.props.final.category,
					prefix: this.props.prefix,
					suffix: this.props.suffix,
				},
			});
		});
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
		this.props.eligiblePlayers.map((player) => {
			this.props.socket.emit("send private message", {
				screenName: player.screenName,
				message: {
					type: "final",
					questionBody: this.props.final.answer,
				},
			});
		});
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
	closeResponses = () => {
		let finalFocusResponse;

		const firstFocusName = this.state.finalEligiblePlayers[0].screenName;

		if (this.state.finalResponses.some((resp) => {
			console.log(resp);
			return resp.screenName === firstFocusName;
		})) {
			finalFocusResponse = this.state.finalResponses.find((resp) => {
				return resp.screenName === firstFocusName;
			}).response;
		} else {
			finalFocusResponse = "";
		}

		console.log("Final Wagers:");
		console.log(this.state.finalWagers);

		var firstFocusWagerValue;

		if (this.state.finalWagers.some((wag) => {
			console.log(wag);
			return wag.screenName === firstFocusName;
		})) {
			firstFocusWagerValue = this.state.finalWagers.find((wag) => {
				console.log(`wager name = ${ wag.screenName } vs ${ firstFocusName }`)
				return wag.screenName === firstFocusName;
			}).wager;
		} else {
			firstFocusWagerValue = 0;
		}

		this.setGameState({
			currentPanel: "FinalJeopardyResponsePanel",
			finalFocusPlayerName: firstFocusName,
			finalFocusMode: "response",
			finalFocusWager: this.props.prefix + firstFocusWagerValue + this.props.suffix,
			finalFocusResponse: finalFocusResponse,
			finalFocusResponseVisible: true,
			finalFocusWagerVisible: false,
			finalRespondingOver: true,
			finalRespondingOpen: false,
		});
	}
	nextFocus = () => {
		if (this.state.finalFocusPlayerNumber ===
			this.props.eligiblePlayers.length - 1) {
			// TODO proceed to end of game screen
		} else {
			const finalFocusPlayerNumber = this.state.finalFocusPlayerNumber + 1;
			const finalFocusPlayerName = this.props.eligiblePlayers[finalFocusPlayerNumber]
			.screenName;
			this.setGameState({
				finalFocusPlayerNumber: finalFocusPlayerNumber,
				finalFocusPlayerName: finalFocusPlayerName,
				finalFocusMode: "response",
			});

			let finalFocusResponse;
			if (this.state.finalResponses.some((resp) => {
				return resp.screenName === finalFocusPlayerName + 1;
			})) {
				finalFocusResponse = this.state.finalResponses.find((resp) => {
					return resp.screenName === finalFocusPlayerName + 1;
				}).response;
			} else {
				finalFocusResponse = "";
			}
			this.setGameState({
				finalFocusResponse: finalFocusResponse,
			});

			// send message to display to go to next response
			this.props.socket.emit("set state", {
				finalFocusPlayerName: finalFocusPlayerName,
				finalFocusWager: this.props.prefix +
					this.state.finalWagers.find((player) => {
						return player.screenName === finalFocusPlayerName;
					}).wager + this.props.suffix,
				finalFocusResponse: finalFocusResponse,
				finalFocusResponseVisible: true,
				finalFocusWagerVisible: false,
			});
		}
	}
	wrongAnswer = () => {
		this.props.changePlayerScore(this.state.finalFocusPlayerName,
			this.props.eligiblePlayers.find((player) => {
				return player.screenName === this.state.finalFocusPlayerName;
			}).score -
				this.state.finalWagers.find((player) => {
					return player.screenName === this.state.finalFocusPlayerName;
				}).wager);
		this.setGameState({
			finalFocusMode: "wager",
			finalFocusCorrect: false,
			finalFocusWagerVisible: true,
		});
	}
	rightAnswer = () => {
		this.props.changePlayerScore(this.state.finalFocusPlayerName,
			this.props.eligiblePlayers.find((player) => {
				return player.screenName === this.state.finalFocusPlayerName;
			}).score +
				this.state.finalWagers.find((player) => {
					return player.screenName === this.state.finalFocusPlayerName;
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
		if (!this.state.finalRespondingOver) {
			responsePanel = <div className='final-jeopardy-response'/>;
		} else if (this.state.finalFocusMode === "response") {
			console.log(this.state.finalResponses);
			console.log(this.state.finalFocusResponse);
			responsePanel = (
				<div className='final-jeopardy-response'>
					<div className='button-row space-between'>
						<p className='final-jeopardy-response left'>
							{this.state.finalFocusPlayerName} responded:
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
			const currentWager = this.state.finalWagers.find((wager) => {
				console.log(`${wager.screenName } vs ${ this.state.finalFocusPlayerName}`);
				return wager.screenName === this.state.finalFocusPlayerName;
			}).wager;
			console.log(currentWager);
			responsePanel = (
				<div className='final-jeopardy-response'>
					<div className='button-row space-between'>
						<p className='final-jeopardy-response left'>
							{this.state.finalFocusPlayerName} wagered:
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
};

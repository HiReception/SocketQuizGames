const React = require("react");
const PropTypes = require("prop-types");
const io = require("socket.io-client");

class FinalJeopardyPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			finalCategoryVisible: false,
			clueVisible: false,
			wagers: [],
			wageringOpen: false,
			allWagersIn: false,
			respondingOpen: false,
			respondingOver: false,
			respondingTimeRemaining: 30,
			responses: [],
			focusPlayerNumber: 0,
			focusPlayerName: this.props.eligiblePlayers[0].screenName,
			focusResponse: "",
			focusMode: "response",
			focusCorrect: false,
		};
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
		if (this.state.respondingOpen && !this.state.respondingOver &&
			!this.state.responses.some((resp) => {
				return resp.screenName === details.screenName;
			})) {
			const newResponses = this.state.responses;
			newResponses.push({
				screenName: details.player.screenName,
				response: details.answer,
			});
			this.setState({
				responses: newResponses,
			});
		}
	}
	handleNewMessage = (message) => {
		console.log("new message:");
		console.log(message);
		if (message.details.type === "wager" && this.state.wageringOpen &&
			!this.state.wagers.some((wager) => {
				return wager.screenName === message.player.screenName;
			})) {
			const newWagers = this.state.wagers;
			newWagers.push({
				screenName: message.player.screenName,
				wager: message.details.wager,
			});
			this.setState({
				wagers: newWagers,
				allWagersIn: newWagers.length === this.props.eligiblePlayers.length,
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
			wageringOpen: true,
		});
		this.props.socket.emit("set state", {
			finalCategoryVisible: true,
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
		this.setState({
			clueVisible: true,
		});
		this.props.socket.emit("set state", {
			finalClueVisible: true,
		});
		// send message to display to play reveal tone
		this.props.socket.emit("play sound", "final-reveal");
	}
	openResponses = () => {
		this.setState({
			respondingOpen: true,
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
			if (this.state.respondingTimeRemaining > 1) {
				this.setState({
					respondingTimeRemaining: this.state.respondingTimeRemaining - 1,
				});
			} else {
				console.log("time up");
				this.closeResponses();
				clearInterval(timer);
			}
		}, 1000);
	}
	closeResponses = () => {
		this.setState({
			respondingOver: true,
			respondingOpen: false,
		});
		let focusResponse;

		if (this.state.responses.some((resp) => {
			console.log(resp);
			return resp.screenName === this.state.focusPlayerName;
		})) {
			focusResponse = this.state.responses.find((resp) => {
				return resp.screenName === this.state.focusPlayerName;
			}).response;
		} else {
			focusResponse = "";
		}

		this.setState({
			focusResponse: focusResponse,
		});

		this.props.socket.emit("set state", {
			currentPanel: "FinalJeopardyResponsePanel",
			finalFocusScreenName: this.state.focusPlayerName,
			finalFocusWager: this.props.prefix + this.state.wagers.find((player) => {
				return player.screenName === this.state.focusPlayerName;
			}).wager + this.props.suffix,
			finalFocusResponse: focusResponse,
			finalFocusResponseVisible: true,
			finalFocusWagerVisible: false,
		});
	}
	nextFocus = () => {
		if (this.state.focusPlayerNumber ===
			this.props.eligiblePlayers.length - 1) {
			// TODO proceed to end of game screen
		} else {
			const focusPlayerNumber = this.state.focusPlayerNumber + 1;
			const focusPlayerName = this.props.eligiblePlayers[focusPlayerNumber]
			.screenName;
			this.setGameState({
				focusPlayerNumber: focusPlayerNumber,
				focusPlayerName: focusPlayerName,
				focusMode: "response",
			});

			let focusResponse;
			if (this.state.responses.some((resp) => {
				return resp.screenName === focusPlayerName + 1;
			})) {
				focusResponse = this.state.responses.find((resp) => {
					return resp.screenName === focusPlayerName + 1;
				}).response;
			} else {
				focusResponse = "";
			}
			this.setGameState({
				focusResponse: focusResponse,
			});

			// send message to display to go to next response
			this.props.socket.emit("set state", {
				finalFocusScreenName: focusPlayerName,
				finalFocusWager: this.props.prefix +
					this.state.wagers.find((player) => {
						return player.screenName === focusPlayerName;
					}).wager + this.props.suffix,
				finalFocusResponse: focusResponse,
				finalFocusResponseVisible: true,
				finalFocusWagerVisible: false,
			});
		}
	}
	wrongAnswer = () => {
		this.props.changePlayerScore(this.state.focusPlayerName,
			this.props.eligiblePlayers.find((player) => {
				return player.screenName === this.state.focusPlayerName;
			}).score -
				this.state.wagers.find((player) => {
					return player.screenName === this.state.focusPlayerName;
				}).wager);
		this.setGameState({
			focusMode: "wager",
			focusCorrect: false,
			finalFocusWagerVisible: true,
		});
	}
	rightAnswer = () => {
		this.props.changePlayerScore(this.state.focusPlayerName,
			this.props.eligiblePlayers.find((player) => {
				return player.screenName === this.state.focusPlayerName;
			}).score +
				this.state.wagers.find((player) => {
					return player.screenName === this.state.focusPlayerName;
				}).wager);
		this.setGameState({
			focusMode: "wager",
			focusCorrect: true,
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
		} else if (!this.state.allWagersIn) {
			cluePanel = (
				<div className='final-jeopardy-clue'>
					<p className='final-jeopardy-clue'>
						Waiting on wager from {this.props.eligiblePlayers.length -
							this.state.wagers.length} contestant(s)
					</p>
				</div>
			);
		} else if (!this.state.clueVisible) {
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
		if (!this.state.clueVisible) {
			correctPanel = <div className='final-jeopardy-correct'/>;
		} else if (!this.state.respondingOpen && !this.state.respondingOver) {
			correctPanel = (
				<div className='final-jeopardy-correct'>
					<div className='add-question-button' onClick={this.openResponses}>
						<p>Open Responses and Start Clock</p>
					</div>
				</div>
			);
		} else if (!this.state.respondingOver) {
			correctPanel = (
				<div className='final-jeopardy-correct'>
					<p className='final-jeopardy-correct'>
						{this.state.respondingTimeRemaining} second(s) remaining
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
		if (!this.state.respondingOver) {
			responsePanel = <div className='final-jeopardy-response'/>;
		} else if (this.state.focusMode === "response") {
			console.log(this.state.responses);
			console.log(this.state.focusResponse);
			responsePanel = (
				<div className='final-jeopardy-response'>
					<div className='button-row space-between'>
						<p className='final-jeopardy-response left'>
							{this.state.focusPlayerName} responded:
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
						{this.state.focusResponse}
					</p>
				</div>
			);
		} else {
			console.log(this.state.wagers);
			const currentWager = this.state.wagers.find((wager) => {
				console.log(`${wager.screenName } vs ${ this.state.focusPlayerName}`);
				return wager.screenName === this.state.focusPlayerName;
			}).wager;
			console.log(currentWager);
			responsePanel = (
				<div className='final-jeopardy-response'>
					<div className='button-row space-between'>
						<p className='final-jeopardy-response left'>
							{this.state.focusPlayerName} wagered:
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
	setGameState: PropTypes.func,
};

module.exports = FinalJeopardyPanel;

const React = require("react");
const PropTypes = require("prop-types");
const $ = require("jquery");
const io = require("socket.io-client");

export default class OpenQuestionPanel extends React.Component {

	componentWillMount = () => {
		if (this.props.clue.dailyDouble) {
			this.setGameState({
				playerAnswering: this.props.players.find((player) => {
					return player.id === this.props.selectingPlayer.id;
				}),
			});
		}
	}

	componentDidMount = () => {
		if (this.props.clue.dailyDouble) {
			this.setGameState({
				currentPanel: "DailyDoublePanel",
				buzzersOpen: true,
				ddWagerEntered: false,
				ddWagerSubmittable: false,
			});
			this.props.socket.emit("play sound", "daily-double");
		} else {
			this.setGameState({
				currentPanel: "OpenQuestionPanel",
				currentClue: this.props.clue,
			});
		}
		this.props.socket.on("new answer", this.handleNewAnswer);
	}

	componentWillUnmount = () => {
		this.props.socket.removeListener("new answer", this.handleNewAnswer);
	}

	handleNewAnswer = (details) => {
		if (this.props.gameState.buzzersOpen &&
			details.player !== "" &&
			!this.props.gameState.wrongPlayerIDs.includes(details.player)
			&& !this.props.clue.dailyDouble) {
			this.setGameState({
				playerAnswering: this.props.players.find((player) => {
					return player.id === details.player;
				}),
				buzzersOpen: false,
				buzzingTimerRunning: false, // cancel any post-question timer that may be running
			});
		}
	}

	wrongAnswer = () => {
		if (!$.isEmptyObject(this.props.gameState.playerAnswering)) {
			this.props.changePlayerScore(this.props.gameState.playerAnswering.id,
				this.props.gameState.playerAnswering.score - (this.props.clue.dailyDouble ? this.props.gameState.ddWager : this.props.gameState.currentClueValue));
			this.props.clearAnsweringPlayer();
			if (this.props.clue.dailyDouble) {
				this.props.endClue();
			} else {
				const newWrongPlayerIDs = this.props.gameState.wrongPlayerIDs;
				newWrongPlayerIDs.push(this.props.gameState.playerAnswering.id);
				this.setGameState({
					wrongPlayerIDs: newWrongPlayerIDs,
				});
				this.openBuzzers();
			}
		}
	}

	rightAnswer = () => {
		if (!$.isEmptyObject(this.props.gameState.playerAnswering)) {
			this.props.changePlayerScore(this.props.gameState.playerAnswering.id,
				this.props.gameState.playerAnswering.score + (this.props.clue.dailyDouble ? this.props.gameState.ddWager : this.props.gameState.currentClueValue));
			this.props.setSelectingPlayer(this.props.gameState.playerAnswering.id);
			this.props.clearAnsweringPlayer();
			this.props.endClue();
		}
	}

	openBuzzers = () => {
		if (!this.props.gameState.buzzersOpen) {
			this.props.clearAnsweringPlayer();
			// if any players left that can answer, set timer on buzz
			if (this.props.gameState.players.filter(p => !p.hidden).length > this.props.gameState.wrongPlayerIDs.length) {
				this.props.startBuzzingTimer(3000);
			} else {
				this.setGameState({
					buzzingTimeOver: true,
				});
			}
			
		}
	}

	goToSelectPanel = () => {
		this.props.endClue();
	}

	changeDDWager = (event) => {
		const newWager = parseInt(event.target.value, 10);
		this.setGameState({
			ddWager: newWager,
			ddWagerSubmittable: (newWager >= 0 &&
				newWager <= Math.max(this.props.ddMaxWager,
					this.props.gameState.playerAnswering.score)),
		});
	}

	enterDDWager = () => {
		if (this.props.gameState.ddWagerSubmittable) {
			this.setGameState({
				ddWagerEntered: true,
				value: this.props.gameState.ddWager,
			});
		}
	}

	setGameState = (state) => {
		this.props.setGameState(state);
	}

	render = () => {
		let header;
		let cluePanel;
		let correctPanel;
		let buzzerPanel;


		// Standard clue, buzzers not opened yet
		if (!this.props.gameState.buzzersOpen && !this.props.gameState.buzzingTimeOver &&
			$.isEmptyObject(this.props.gameState.playerAnswering)) {
			header = (
				<div className='open-question-header'>
					<p className='open-question-category'>{this.props.catName}</p>
					<p className='open-question-value'>
						{this.props.prefix}{this.props.gameState.currentClueValue}{this.props.suffix}
					</p>
				</div>
			);

			cluePanel = (
				<div className='open-question-clue'>
					<p className='open-question-clue'>
						{this.props.clue.answer}
					</p>
				</div>
			);

			correctPanel = (
				<div className='open-question-correct'>
					<p className='open-question-correct'>
						Correct Response:<br/>
						{this.props.clue.correct}
					</p>
				</div>
			);

			buzzerPanel = (
				<div className='buzzer-panel'>
					<div className='add-question-button' onClick={this.openBuzzers}>
						<p>Open Response Lines</p>
					</div>
				</div>
			);

		// Daily Double, wager not yet entered
		} else if (this.props.clue.dailyDouble && !this.props.gameState.ddWagerEntered) {
			this.props.socket.emit("set state", {
				currentPanel: "DailyDoublePanel",
			});
			header = (
				<div className='open-question-header'>
					<p className='open-question-category'>{this.props.catName}</p>
					<p className='open-question-value' />
				</div>
			);

			cluePanel = (
				<div className='open-question-clue daily-double'>
					<p className='open-question-clue daily-double'>
						DAILY DOUBLE
					</p>
				</div>
			);

			correctPanel = (
				<div className='open-question-correct daily-double' />
			);


			const wagerEntry = (
				<input type='number'
					className='daily-double-wager'
					onChange={this.changeDDWager}
					id='daily-double-wager'/>
			);
			buzzerPanel = (
				<div className='buzzer-panel'>
					<p className='buzzer-panel'>
						Enter Wager for {this.props.gameState.playerAnswering.screenName}
						(Maximum of {this.props.prefix}
							{Math.max(this.props.ddMaxWager,
								this.props.gameState.playerAnswering.score)}
							{this.props.suffix})
					</p>
					<div className='button-row'>
						{wagerEntry}
						<div className='add-question-button' onClick={this.enterDDWager}>
							<p>Submit</p>
						</div>
					</div>
				</div>
			);

		// Standard clue, buzzers open
		} else if ($.isEmptyObject(this.props.gameState.playerAnswering)) {
			header = (
				<div className='open-question-header'>
					<p className='open-question-category'>{this.props.catName}</p>
					<p className='open-question-value'>
						{this.props.prefix}{this.props.gameState.currentClueValue}{this.props.suffix}
					</p>
				</div>
			);

			cluePanel = (
				<div className='open-question-clue'>
					<p className='open-question-clue'>
						{this.props.clue.answer}
					</p>
				</div>
			);

			correctPanel = (
				<div className='open-question-correct'>
					<p className='open-question-correct'>
						Correct Response:<br/>
						{this.props.clue.correct}
					</p>
				</div>
			);

			if (this.props.gameState.players.filter(p => !p.hidden).length == this.props.gameState.wrongPlayerIDs.length) {
				buzzerPanel = (
					<div className='buzzer-panel'>
						<p className='buzzer-panel'>No Players Left to Answer</p>
						<div className='add-question-button' onClick={this.goToSelectPanel}>
							<p>End Question and Return</p>
						</div>
					</div>
				);
			} else if (this.props.gameState.buzzingTimeOver) {
				buzzerPanel = (
					<div className='buzzer-panel'>
						<p className='buzzer-panel'>Time is Up</p>
						<div className='add-question-button' onClick={this.goToSelectPanel}>
							<p>End Question and Return</p>
						</div>
					</div>
				);
			} else {
				buzzerPanel = (
					<div className='buzzer-panel'>
						<p className='buzzer-panel'>Response Lines are Open</p>
						<p className='buzzer-panel'>{this.props.gameState.buzzingTimeRemaining / 1000} seconds remaining</p>
					</div>
				);
			}

			


		// Player answering, either Daily Double or not
		} else {
			if (this.props.clue.dailyDouble) {
				this.props.socket.emit("set state", {
					currentPanel: "OpenQuestionPanel",
					currentClue: this.props.clue,
				});
			}

			header = (
				<div className='open-question-header'>
					<p className='open-question-category'>{this.props.catName}</p>
					<p className='open-question-value'>
						{this.props.prefix}{this.props.gameState.currentClueValue}{this.props.suffix}
					</p>
				</div>
			);

			cluePanel = (
				<div className='open-question-clue'>
					<p className='open-question-clue'>
						{this.props.clue.answer}
					</p>
				</div>
			);

			correctPanel = (
				<div className='open-question-correct'>
					<p className='open-question-correct'>
						Correct Response:<br/>
						{this.props.clue.correct}
					</p>
				</div>
			);

			buzzerPanel = (
				<div className='buzzer-panel'>
					<p className='buzzer-panel'>
						{this.props.gameState.playerAnswering.screenName} is answering
					</p>
					<div className='button-row'>
						<div className='add-question-button' onClick={this.rightAnswer}>
							<p>Correct</p>
						</div>
						<div className='add-question-button' onClick={this.wrongAnswer}>
							<p>Incorrect</p>
						</div>
					</div>
				</div>
			);
		}


		return (
			<div id='open-question-panel'>
				{header}
				{cluePanel}
				{correctPanel}
				{buzzerPanel}
			</div>
		);
	}
}

OpenQuestionPanel.propTypes = {
	players: PropTypes.array,
	catName: PropTypes.string,
	clue: PropTypes.object,
	value: PropTypes.number,
	endClue: PropTypes.func,
	changePlayerScore: PropTypes.func,
	ddMaxWager: PropTypes.number,
	selectingPlayer: PropTypes.object,
	setSelectingPlayer: PropTypes.func,
	setAnsweringPlayer: PropTypes.func,
	clearAnsweringPlayer: PropTypes.func,
	setGameState: PropTypes.func,
	gameState: PropTypes.object,
	socket: PropTypes.instanceOf(io.Socket),
	prefix: PropTypes.string,
	suffix: PropTypes.string,
	startBuzzingTimer: PropTypes.func,
};

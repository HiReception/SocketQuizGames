const React = require("react");
const PropTypes = require("prop-types");
const $ = require("jquery");
const io = require("socket.io-client");

export default class OpenQuestionPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = props.gameState;
	}

	componentWillMount = () => {
		console.log("componentWillMount called");
		if (this.props.clue.dailyDouble) {
			console.log(`Setting answering player to 
				${ this.props.selectingPlayer.screenName}`);
			this.props.setAnsweringPlayer(this.props.selectingPlayer.screenName);
		}
	}

	componentDidMount = () => {
		if (this.props.clue.dailyDouble) {
			this.props.setGameState({
				currentPanel: "DailyDoublePanel",
			});
			this.props.socket.emit("play sound", "daily-double");
		} else {
			this.props.setGameState({
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
		console.log("new answer received (Open outer): ");
		console.log(details);
		if (this.state.buzzersOpen &&
			details.player !== "" &&
			!this.state.wrongPlayerNames.includes(details.player)) {
			console.log("new answer (Open inner):");
			console.log(details);
			this.setGameState({
				playerAnswering: this.props.players.find((player) => {
					return player.screenName === details.player;
				}),
				buzzersOpen: false,
			});
			console.log(details.player);
			this.props.setAnsweringPlayer(details.player);
		}
	}

	wrongAnswer = () => {
		if (!$.isEmptyObject(this.state.playerAnswering)) {
			this.props.changePlayerScore(this.state.playerAnswering.screenName,
				this.state.playerAnswering.score - this.state.currentClueValue);
			this.props.clearAnsweringPlayer();
			if (this.props.clue.dailyDouble) {
				this.props.endClue();
			} else {
				const newWrongPlayerNames = this.state.wrongPlayerNames;
				console.log(newWrongPlayerNames);
				newWrongPlayerNames.push(this.state.playerAnswering.screenName);
				this.setGameState({
					wrongPlayerNames: newWrongPlayerNames,
				});
				this.openBuzzers();
			}
		}
	}

	rightAnswer = () => {
		console.log("this.state.playerAnswering = ");
		console.log(this.state.playerAnswering);
		if (!$.isEmptyObject(this.state.playerAnswering)) {
			this.props.changePlayerScore(this.state.playerAnswering.screenName,
				this.state.playerAnswering.score + this.state.currentClueValue);
			this.props.setSelectingPlayer(this.state.playerAnswering.screenName);
			this.props.clearAnsweringPlayer();
			this.props.endClue();
		}
	}

	openBuzzers = () => {
		if (!this.state.buzzersOpen) {
			this.props.clearAnsweringPlayer();
			this.setGameState({
				playerAnswering: {},
				buzzersOpen: true,
			});
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
					this.state.playerAnswering.score)),
		});
	}

	enterDDWager = () => {
		if (this.state.ddWagerSubmittable) {
			this.setGameState({
				ddWagerEntered: true,
				value: this.state.ddWager,
			});
		}
	}

	setGameState = (state) => {
		this.setState(state);
		this.props.setGameState(state);
	}

	render = () => {
		let header;
		let cluePanel;
		let correctPanel;
		let buzzerPanel;


		// Standard clue, buzzers not opened yet
		if (!this.state.buzzersOpen &&
			$.isEmptyObject(this.state.playerAnswering)) {
			header = (
				<div className='open-question-header'>
					<p className='open-question-category'>{this.props.catName}</p>
					<p className='open-question-value'>
						{this.props.prefix}{this.state.currentClueValue}{this.props.suffix}
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
		} else if (this.props.clue.dailyDouble && !this.state.ddWagerEntered) {
			this.props.setGameState({
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
						Enter Wager for {this.state.playerAnswering.screenName} <nbsp/>
						(Maximum of {this.props.prefix}
							{Math.max(this.props.ddMaxWager,
								this.state.playerAnswering.score)}
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
		} else if ($.isEmptyObject(this.state.playerAnswering)) {
			header = (
				<div className='open-question-header'>
					<p className='open-question-category'>{this.props.catName}</p>
					<p className='open-question-value'>
						{this.props.prefix}{this.state.currentClueValue}{this.props.suffix}
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
					<p className='buzzer-panel'>Response Lines are Open</p>
					<div className='add-question-button' onClick={this.goToSelectPanel}>
						<p>End Question and Return</p>
					</div>
				</div>
			);


		// Player answering, either Daily Double or not
		} else {
			if (this.props.clue.dailyDouble) {
				this.props.setGameState({
					currentPanel: "OpenQuestionPanel",
					currentClue: this.props.clue,
				});
			}

			header = (
				<div className='open-question-header'>
					<p className='open-question-category'>{this.props.catName}</p>
					<p className='open-question-value'>
						{this.props.prefix}{this.state.currentClueValue}{this.props.suffix}
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
						{this.state.playerAnswering.screenName} is answering
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
};

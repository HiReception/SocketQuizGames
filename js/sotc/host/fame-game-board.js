const React = require("react");
const PropTypes = require("prop-types");

export default class FameGameBoard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			facesIntroduced: props.first ? false : true,
			moneyToBeRevealedThisRound: (props.last && props.moneyRevealed) ? true : false
		};
	}

	finishIntro = () => {
		this.setState({facesIntroduced: true});
	}

	concludeRound = () => {
		const prize = this.props.boardState[this.props.currentSelection].prize;
		const name = this.props.playerSelecting;
		if (prize.prizeValue) {
			this.props.addToPrizes(name, prize);
		} else if (prize.prizeOption && this.props.wildCardDecision === 0) {
			this.props.addToPrizes(name, {
				name: "Wild Card Money",
				prizeValue: prize.prizeOption,
			});
		} else if (prize.scoreValue) {
			this.props.addToScore(name, prize.scoreValue);
		}

		// add whatever prize/money was won to the current player
		if (this.state.moneyToBeRevealedThisRound) {
			this.props.revealMoney();
		} else {
			this.props.nextItem();
		}
	}


	render = () => {
		let contentPanel;

		// if faces need to be introduced
		if (this.props.first && !this.state.facesIntroduced) {
			// show all names and comments in scrollable pane
			contentPanel = (
				<div className="fame-game-names">
					<p className="buzzer-panel">Tonight's Famous Faces:</p>
					<div className="fame-game-intro-container">
						{this.props.boardState.map((option, i) => (
							<div key={i} className="fame-game-intro">
								<p className="fame-game-intro-name">{option.face.name}</p>
								<p className="fame-game-intro-comment">{option.face.comment}</p>
							</div>
						))}
					</div>
					<div className="add-question-button" onClick={this.finishIntro}>
						<p>Continue</p>
					</div>
				</div>
			);
		}
		// money has been revealed (in the last round)
		else if (this.props.last && this.props.moneyRevealed) {
			// List all previously unrevealed money and the faces they were behind
			var unrevealedMoneyString;
			const unrevealedMoneyOptions = this.props.boardState.filter(o => !o.selected && (o.prize.wildCard || o.prize.scoreValue))
				.sort((a,b) => (a.prize.scoreValue || 0) - (b.prize.scoreValue || 0));

			if (unrevealedMoneyOptions.length > 0) {
				unrevealedMoneyString = unrevealedMoneyOptions.map((o) => 
					`${o.prize.scoreValue ? this.props.formatCurrency(o.prize.scoreValue) : "Wild"} Card was behind ${o.face.name}`
				).join("\n");

			} else {
				unrevealedMoneyString = "All Money Cards and Wild Cards found";
			}

			contentPanel = (
				<div className="fame-game-names">
					<p className="buzzer-panel">{unrevealedMoneyString}</p>
				</div>
			);
		}
		// no selection made yet
		else if (this.props.currentSelection === -1) {
			const numRows = Math.ceil(Math.sqrt(this.props.boardState.length));

			// Show button for all faces (disabled if selected)
			contentPanel = (
				<div className="fame-game-names">
					<p className="buzzer-panel">{this.props.playerSelecting} is selecting a face:</p>
					{[...Array(numRows).keys()].map((r) => (
						<div key={r} className={`fame-game-names-row${r % 2 !== 0 ? " reverse" : ""}`}>
							{this.props.boardState.slice(r*numRows, (r+1)*numRows).map((option, i) => (
								<div key={i} className={`fame-game-name${option.selected ? " inactive" : ""}`}
									onClick={() => this.props.selectFace((r * numRows) + i)}>
									<p>{option.face.name}</p>
								</div>
							))}
						</div>
					))}
				</div>
			);
		}
		// selection made, prize or money
		else if (!this.props.boardState[this.props.currentSelection].prize.wildCard) {
			// Announce prize behind face, with button to either Go to next item or Reveal money
			const selection = this.props.boardState[this.props.currentSelection];
			const buttonString = this.state.moneyToBeRevealedThisRound ? "Reveal Undiscovered Money Cards" : "Continue";
			contentPanel = (
				<div className="fame-game-wild-card">
					<p className="buzzer-panel">Behind {selection.face.name} is:</p>
					<p className="buzzer-panel">{selection.prize.name}</p>
					<p className="buzzer-panel">Value: {this.props.formatCurrency(selection.prize.prizeValue || selection.prize.scoreValue)}</p>

					<div className="add-question-button" onClick={this.concludeRound}>
						<p>{buttonString}</p>
					</div>
				</div>
			);
			
		}
		// selection made, wild card, prize taken
		else if (this.props.wildCardDecision === 0) {
			// Announce that player has taken prize
			const prizeOption = this.props.boardState[this.props.currentSelection].prize.prizeOptionString;
			const btnString = this.state.moneyToBeRevealedThisRound ? "Reveal Undiscovered Money Cards" : "Continue";
			contentPanel = (
				<div className="fame-game-wild-card">
					<p className="buzzer-panel">{this.props.playerSelecting} has taken the {prizeOption}</p>

					<div className="add-question-button" onClick={this.concludeRound}>
						<p>{btnString}</p>
					</div>
				</div>
			);
		}
		// selection made, wild card, no decision
		else {
			// List options for Wild Card
			contentPanel = (
				<div className="fame-game-wild-card">
					<p className="buzzer-panel">Behind {this.props.boardState[this.props.currentSelection].face.name} is the Wild Card!</p>
					<p className="buzzer-panel">{this.props.playerSelecting} can choose between:</p>

					<div className="add-question-button" onClick={() => this.props.setWildCardDecision(0)}>
						<p>{this.props.boardState[this.props.currentSelection].prize.prizeOptionString}</p>
					</div>
					<div className="add-question-button" onClick={() => this.props.setWildCardDecision(1)}>
						<p>Pick Again</p>
					</div>
				</div>
			);
		}

		return (
			<div className='fame-game-board'>
				{contentPanel}
			</div>
		);
	}
}

FameGameBoard.propTypes = {
	playerSelecting: PropTypes.string,
	boardState: PropTypes.array,
	currentSelection: PropTypes.number,
	wildCardDecision: PropTypes.number,
	first: PropTypes.bool,
	last: PropTypes.bool,
	moneyRevealed: PropTypes.bool,
	addToPrizes: PropTypes.func,
	addToScore: PropTypes.func,
	selectFace: PropTypes.func,
	revealMoney: PropTypes.func,
	setWildCardDecision: PropTypes.func,
	nextItem: PropTypes.func,
	formatCurrency: PropTypes.func,
};

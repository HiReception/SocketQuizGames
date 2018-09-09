const React = require("react");
const PropTypes = require("prop-types");

export default class BoardBonus extends React.Component {
	awardPrize = () => {
		// add whatever prize was won to the carry over champion's bonus haul
		this.props.addBonusPrize(this.props.champion, this.props.prizeWon);
		
		// reveal the location of every major prize card and win card - even if the
		// player won a major prize (since it's possible for there to be more than one
		// each of major prizes and/or win cards)
		this.props.revealMajorPrize();
	}

	render = () => {
		let contentPanel;
		const numRows = 3;
		const optionsPerRow = 4;
		contentPanel = (
			<div className="winners-board-container">
				{[...Array(numRows).keys()].map((r) => (
					<div key={r} className="winners-board-option-row">
						{this.props.boardState.slice(r*optionsPerRow, (r+1)*optionsPerRow).map((option, i) => {
							const optionNo = (r*optionsPerRow)+i+1;
							const revealed = (option.selected) || ((option.requiresWin || option.winCard) && this.props.majorPrizeRevealed);
							if (revealed && option.prizeValue) {
								return (
									<div key={i} className={`winners-board-option revealed prize${option.requiresWin ? " major" : ""}`}>
										<p>{option.name}</p>
										<p>{this.props.formatCurrency(option.prizeValue)}</p>
									</div>
								);
							} else if (revealed && option.winCard) {
								return (
									<div key={i} className={"winners-board-option revealed win"}>
										<p>WIN</p>
									</div>
								);
							} else if (option.inactive) {
								return (
									<div key={i} className={"winners-board-option inactive"}></div>
								);
							} else {
								return (
									<div
										key={i}
										className={`winners-board-option ${this.props.boardGameFinished ? "inactive" : ""}`}
										onClick={() => this.props.selectWBNumber(optionNo)}>
										<p>{optionNo}</p>
									</div>
								);
							}
						})}
					</div>
				))}
			</div>
		);


		let endGameButton;
		let gameStateText;
		if (this.props.majorPrizeRevealed) {
			const winCardLocations = this.props.boardState.map((o,i) => o.winCard ? i + 1 : "x").filter(i => !isNaN(i));
			const majorLocations = this.props.boardState.map((o,i) => o.requiresWin ? i + 1 : "x").filter(i => !isNaN(i));
			gameStateText = `Win Card(s) Behind: ${winCardLocations.join(", ")} - Major Prize(s) Behind: ${majorLocations.join(", ")}`;
			endGameButton = (
				<div className="add-question-button" onClick={this.props.goToDecision}>
					<p>Continue</p>
				</div>
			);
		} else if (this.props.boardGameFinished) {
			gameStateText = `${this.props.champion} wins ${this.props.prizeWon.name}`;
			endGameButton = (
				<div className="add-question-button" onClick={this.awardPrize}>
					<p>Reveal Major Prize(s) and Win Card(s)</p>
				</div>
			);
		} else {
			gameStateText = "Select a number from the board";
			endGameButton = null;
		}

		return (
			<div className="board-bonus">
				<div className="board-bonus-header">
					<p>CASH CARD</p>
				</div>
				{contentPanel}
				<div className="board-bonus-bottom">
					<p>{gameStateText}</p>
					{endGameButton}
				</div>
			</div>
		);
	}
}

BoardBonus.propTypes = {
	champion: PropTypes.string,
	previouslyWonPrizes: PropTypes.array,
	boardState: PropTypes.array,
	winCardFound: PropTypes.bool,
	boardGameFinished: PropTypes.bool,
	prizeWon: PropTypes.object,
	majorPrizeRevealed: PropTypes.bool,
	selectWBNumber: PropTypes.func,
	addBonusPrize: PropTypes.func,
	revealMajorPrize: PropTypes.func,
	goToDecision: PropTypes.func,
	formatCurrency: PropTypes.func,
};

const React = require("react");
const PropTypes = require("prop-types");

export default class CashCard extends React.Component {
	awardPrize = () => {
		const prize = this.props.suits[this.props.selectedSuit].prize;
		if (this.props.playerPurchasing) {
			const name = this.props.playerPurchasing;
			// add whatever prize/money was won to the player that bought in
			if (prize.prizeValue) {
				this.props.addToPrizes(name, prize);
			} else if (prize.moneyValue) {
				this.props.addToScore(name, prize.moneyValue);
			}

			// if the player didn't pick the major prize, show where it was - otherwise, go to the next item
			if (!prize.major) {
				this.props.revealMajorPrize();
			} else {
				this.props.nextItem();
			}
		}
	}

	render = () => {
		let contentPanel;
		if (!this.props.availableToBuy) {
			const numRows = 2;
			// board of four suits, showing symbol if not revealed (different colour if selected)
			contentPanel = (
				
				<div className="cash-card-suit-container">
					{[...Array(numRows).keys()].map((r) => (
						<div key={r} className="cash-card-suit-row">
							{this.props.suits.slice(r*numRows, (r+1)*numRows).map((s, i) => {
								const suitNo = (r*numRows)+i;
								const revealed = (this.props.selectedSuit === suitNo && this.props.selSuitRevealed) || (s.prize.major && this.props.majorPrizeRevealed);
								if (revealed) {
									let prizeClass;
									let prizeContent;
									if (s.prize.major) {
										prizeClass = "major";
										prizeContent = <p>{s.prize.shortName}</p>;
									} else if (s.prize.prizeValue) {
										prizeClass = "prize";
										prizeContent = <p>PRIZE</p>;
									} else if (s.prize.scoreValue) {
										prizeClass = "score";
										prizeContent = <p>${s.prize.scoreValue}</p>;
									} else {
										prizeClass = "generic";
										prizeContent = s.prize.slotImage ? <img src={s.prize.slotImage}/> : <p>{s.prize.shortName}</p>;
									}
									return (
										<div key={i} className={`cash-card-suit revealed ${prizeClass}`}>
											{prizeContent}
										</div>
									);
								} else {
									const selectedString = this.props.selectedSuit === suitNo ? " selected" : (this.props.selectedSuit !== -1 ? " inactive " : "");
									return (
										<div key={i} className={`cash-card-suit concealed${selectedString}`} onClick={() => this.props.selectCashCardSuit(suitNo)}>
											<p>{s.suitSymbol}</p>
										</div>
									);
								}
							})}
						</div>
					))}
				</div>
			);
		} else {
			// price can only be altered if more than one person is eligible to buy - i.e. there's a tie for the lead
			const priceTogglable = this.props.availableToBuy && this.props.eligibleToBuy.length > 1;
			contentPanel = (
				<div className="cash-card-sell-container">
					<div className="cash-card-prize-desc">
						<p>Prizes on Offer:</p>
						{this.props.prizes.map(p => (
							<div key={p.shortName} className="cash-card-prize">
								<p>{p.shortName}</p>
								<p>{p.description}</p>
								<p>Value: ${p.prizeValue || p.scoreValue}</p>
							</div>
						))}
						
					</div>
					<div className="cash-card-variable-panel">
						<div className="cash-card-variable">
							<input type="text" value={this.props.currentPrice} onChange={this.props.setPrice} disabled={!priceTogglable}/>
							<p>Current Price</p>
						</div>
					</div>
				</div>
			);
		}

		let bottomPanel;

		
		

		// if nobody has purchased, the leader (or one of the co-leaders) will play hypothetically;
		const hypo = !this.props.playerPurchasing;
		const playerName = this.props.playerPurchasing || this.props.eligibleToBuy[0];

		if (this.props.majorPrizeRevealed) {
			const suitName = this.props.suits.find(s => s.prize.major).name;
			// major prize revealed, end of game
			bottomPanel = (
				<div className="cash-card-bottom">
					<p>Major Prize was behind {suitName}</p>
					<div className="add-question-button" onClick={this.props.nextItem}>
						<p>Continue</p>
					</div>
				</div>
			);
		} else if (this.props.selSuitRevealed) {
			// prize behind selected suit revealed, if major prize then end of game
			const prize = this.props.suits[this.props.selectedSuit].prize.shortName || "";
			const wonMajorPrize = this.props.suits[this.props.selectedSuit].prize.major || false;
			bottomPanel = (
				<div className="cash-card-bottom">
					<p>{playerName} {hypo ? "would have won" : "wins"} {prize}</p>
					<div className="add-question-button" onClick={this.awardPrize}>
						<p>{wonMajorPrize ? "Continue" : "Reveal Major Prize"}</p>
					</div>
				</div>
			);
		} else if (this.props.selectedSuit !== -1) {
			// suit selected
			bottomPanel = (
				<div className="cash-card-bottom">
					<p>{playerName} playing{hypo ? " hypothetically" : ""}</p>
					<div className="add-question-button" onClick={this.props.revealSelectedSuit}>
						<p>Reveal Prize</p>
					</div>
				</div>
			);
		} else if (!this.props.availableToBuy) {
			// playing (either from buy-in or hypothetically)
			bottomPanel = (
				<div className="cash-card-bottom">
					<p>{playerName} playing{hypo ? " hypothetically" : ""}</p>
					<p>Select a suit</p>
				</div>
			);
		} else {
			// on offer - variable price if tie for lead, else fixed price
			bottomPanel = (
				<div className="cash-card-bottom">
					<p>Able to buy:</p>
					<p>{this.props.eligibleToBuy.join(", ")}</p>
					<div className="cancel-question-button" onClick={this.props.callNoSale}>
						<p>No Buy-In</p>
					</div>
				</div>
			);
		}


		return (
			<div className="cash-card">
				<div className="cash-card-header">
					<p>CASH CARD</p>
				</div>
				{contentPanel}
				{bottomPanel}
			</div>
		);
	}
}

CashCard.propTypes = {
	suits: PropTypes.array,
	prizes: PropTypes.array,
	eligibleToBuy: PropTypes.array,
	currentPrice: PropTypes.number,
	availableToBuy: PropTypes.bool,
	playerPurchasing: PropTypes.string,
	selectedSuit: PropTypes.number,
	selSuitRevealed: PropTypes.bool,
	majorPrizeRevealed: PropTypes.bool,
	setPrice: PropTypes.func,
	callNoSale: PropTypes.func,
	selectCashCardSuit: PropTypes.func,
	revealSelectedSuit: PropTypes.func,
	revealMajorPrize: PropTypes.func,
	addToPrizes: PropTypes.func,
	addToScore: PropTypes.func,
	nextItem: PropTypes.func,
};

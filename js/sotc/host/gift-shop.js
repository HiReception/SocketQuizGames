const React = require("react");
const PropTypes = require("prop-types");

export default class GiftShop extends React.Component {
	confirmSale = () => {
		// add original prize to player's total
		this.props.addToPrizes(this.props.playerPurchasing, {
			name: this.props.prize.shortName,
			prizeValue: this.props.prize.retailPrice,
		});
		// if any bonus money provided, add to player's total as well
		if (this.props.bonusMoney > 0) {
			this.props.addToPrizes(this.props.playerPurchasing, {
				name: "Gift Shop Bonus Money",
				prizeValue: this.props.bonusMoney,
			});
		}
		this.props.deductFromScore(this.props.playerPurchasing, this.props.currentPrice);
		this.props.nextItem();
	}


	render = () => {
		let bottomPanel;

		if (this.props.playerPurchasing) {
			// item purchased, button confirms sale
			bottomPanel = (
				<div className="gift-shop-end-button">
					<p>{this.props.playerPurchasing} has purchased</p>
					<div className="add-question-button" onClick={this.confirmSale}>
						<p>Continue</p>
					</div>
				</div>
			);
		} else if (this.props.available) {
			// item not yet purchased, button calls No Sale
			bottomPanel = (
				<div className="gift-shop-end-button">
					<p>Able to buy:</p>
					<p>{this.props.eligibleToBuy.join(", ")}</p>
					<div className="cancel-question-button" onClick={this.props.callNoSale}>
						<p>No Sale</p>
					</div>
				</div>
			);
		} else {
			// No Sale called, button goes to next item
			bottomPanel = (
				<div className="gift-shop-end-button">
					<p>No Sale called</p>
					<div className="add-question-button" onClick={this.props.nextItem}>
						<p>Continue</p>
					</div>
				</div>
			);
		}

		return (
			<div className="gift-shop">
				<div className="gift-shop-header">
					<p>Gift Shop</p>
				</div>
				<div className="gift-shop-prize-desc">
					<p>{this.props.prize.shortName}</p>
					<p>{this.props.prize.description}</p>
					<p>Normally priced at {this.props.formatCurrency(this.props.prize.retailPrice)}</p>
					<p>Starting price: {this.props.formatCurrency(this.props.prize.startingPrice)}</p>
				</div>
				<div className="gift-shop-variable-panel">
					<div className="gift-shop-variable">
						<input type="number" value={this.props.currentPrice} onChange={(e) => this.props.setPrice(e.target.value)} disabled={!this.props.available}/>
						<p>Current Price</p>
					</div>
					<div className="gift-shop-variable">
						<input type="number" value={this.props.bonusMoney} onChange={(e) => this.props.setBonus(e.target.value)} disabled={!this.props.available}/>
						<p>Bonus Money</p>
					</div>
					
				</div>
				{bottomPanel}

				
			</div>
		);
	}
}

GiftShop.propTypes = {
	prize: PropTypes.object,
	currentPrice: PropTypes.number,
	bonusMoney: PropTypes.number,
	eligibleToBuy: PropTypes.array,
	available: PropTypes.bool,
	playerPurchasing: PropTypes.string,
	setPrice: PropTypes.func,
	setBonus: PropTypes.func,
	callNoSale: PropTypes.func,
	deductFromScore: PropTypes.func,
	addToPrizes: PropTypes.func,
	nextItem: PropTypes.func,
};

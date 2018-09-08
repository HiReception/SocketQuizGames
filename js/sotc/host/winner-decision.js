const React = require("react");
const PropTypes = require("prop-types");

export default class WinnerDecision extends React.Component {
	render = () => {
		if (!this.props.decisionMade) {
			const safePrizesTotal = this.props.safePrizes.map(p => p.prizeValue).reduce((a,b) => a + b, 0);
			const bonusPrizesTotal = this.props.bonusPrizesWon.map(p => p.prizeValue).reduce((a,b) => a + b, 0);
			const bonusLeftTotal = this.props.bonusPrizesLeft.map(p => p.prizeValue).reduce((a,b) => a + b, 0);
			return (
				<div className="decision">
					<div className="decision-heading">
						<p>What will {this.props.champion} do?</p>
					</div>
					<div className="decision-summary-ctr">
						<h2>Guaranteed Prizes Won: {this.props.formatCurrency(safePrizesTotal)}</h2>
						{this.props.safePrizes.map((p,i) => (
							<p key={i}>{p.name} - {this.props.formatCurrency(p.prizeValue)}</p>
						))}
						<h2>Total Bonus Prizes Won: {this.props.formatCurrency(bonusPrizesTotal)}</h2>
						{this.props.bonusPrizesWon.map((p,i) => (
							<p key={i}>{p.name} - {this.props.formatCurrency(p.prizeValue)}</p>
						))}
						<h2>Bonus Prizes Still Available: {this.props.formatCurrency(bonusLeftTotal)}</h2>
						{this.props.bonusPrizesLeft.map((p,i) => (
							<p key={i}>{p.name} - {this.props.formatCurrency(p.prizeValue)}</p>
						))}
					</div>
					<div className="decision-button">
						<div className="add-question-button" onClick={() => this.props.makeDecision(true)}>
							<p>Come Back</p>
						</div>
						<div className="cancel-question-button" onClick={() => this.props.makeDecision(false)}>
							<p>Retire</p>
						</div>
					</div>
				</div>
			);
		} else {
			const decisionMessage = this.props.playerStaying ? `${this.props.champion} is coming back!` : `${this.props.champion} is retiring!`;
			return (
				<div className="decision">
					<div className="decision-made">
						<p>{decisionMessage}</p>
					</div>
					<div className="decision-button">
						<div className="add-question-button" onClick={this.props.followOnGame}>
							<p>New Game With Same Players (coming soon)</p>
						</div>
					</div>
					
				</div>
			);
		}
		
	}
}

WinnerDecision.propTypes = {
	champion: PropTypes.string,
	decisionMade: PropTypes.bool,
	playerStaying: PropTypes.bool,
	makeDecision: PropTypes.func,
	safePrizes: PropTypes.array,
	bonusPrizesWon: PropTypes.array,
	bonusPrizesLeft: PropTypes.array,
	formatCurrency: PropTypes.func,
	followOnGame: PropTypes.func,
};

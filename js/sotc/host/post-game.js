const React = require("react");
const PropTypes = require("prop-types");

export default class PostGame extends React.Component {
	render = () => {
		if (this.props.leaderOrLeaders.length > 1) {
			return (
				<div className="post-game">
					<div className="post-game-winner">
						<p>It's a tie!</p>
						<p>
							{this.props.leaderOrLeaders.map(p => p.screenName).join(", ")} all level on
							{this.props.formatCurrency(this.props.leaderOrLeaders[0].score)}
						</p>
						<div className="add-question-button" onClick={this.props.goToTiebreaker}>
							<p>Go to Tiebreaker Question</p>
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="post-game">
					<div className="post-game-winner">
						<p>{this.props.leaderOrLeaders[0].screenName} wins the game!</p>
					</div>
					
					<div className="post-game-summary-ctr">
						{this.props.players.map(p => (
							<div key={p} className="post-game-prize-summary">
								<p>{p.screenName}'s prizes:</p>
								{p.prizes.map(prize => (
									<p>{prize.shortName} ({this.formatCurrency(prize.prizeValue)})</p>
								))}
								<p>Total: {this.formatCurrency(p.prizes.reduce((total, prize) => total + prize.prizeValue, 0))}</p>
							</div>
						))}
					</div>
					<div className="post-game-button">
						<div className="add-question-button" onClick={this.props.goToEndgame}>
							<p>Go to Endgame</p>
						</div>
					</div>
					
				</div>
			);
		}
		
	}
}

PostGame.propTypes = {
	leaderOrLeaders: PropTypes.array,
	goToTiebreaker: PropTypes.func,
	goToEndgame: PropTypes.func,
	formatCurrency: PropTypes.func,
};

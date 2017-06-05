const React = require("react");
const PropTypes = require("prop-types");

class PlayerDetailsPanel extends React.Component {

	constructor(props) {
		super(props);
		this.openScoreDialog = this.openScoreDialog.bind(this);
	}

	openScoreDialog = () => {
		let validNumber = false;
		let newScore = "";
		while (!validNumber) {
			newScore = prompt(`Enter a new score for ${ this.props.player.screenName
			} (current score ${ this.props.player.score })`,
				this.props.player.score.toString());
			if (!isNaN(parseInt(newScore, 10))) {
				this.props.changePlayerScore(this.props.player.screenName,
					parseInt(newScore, 10));
				validNumber = true;
			}
		}
	}
	render = () => {
		let hideButton;
		if (this.props.player.hidden) {
			hideButton = (
				<div
					className='add-question-button'
					href='#'
					onClick={() => this.props.unhidePlayer(this.props.player.screenName)}>
					<p>Unhide Player</p>
				</div>
			);
		} else {
			hideButton = (
				<div
					className='cancel-question-button'
					href='#'
					onClick={() => this.props.hidePlayer(this.props.player.screenName)}>
					<p>Hide Player</p>
				</div>
			);
		}
		return (
			<div className='player-details-panel'>
				<div className='player-details-name'>
					<p className='player-details-name'>{this.props.player.screenName}</p>
				</div>
				<div className='player-details-score'>
					<p className='player-details-score'>{this.props.player.score}</p>
				</div>
				<div
					className='add-question-button'
					href='#'
					onClick={this.openScoreDialog}>
					<p>Change Score</p>
				</div>
				{hideButton}
				<div
					className='player-details-back'
					href='#'
					onClick={() => this.props.clearPlayerDetails(this)}>
					<p className='player-details-back'>Back</p>
				</div>
			</div>
		);
	}
}

PlayerDetailsPanel.propTypes = {
	player: PropTypes.object,
	clearPlayerDetails: PropTypes.func,
	hidePlayer: PropTypes.func,
	unhidePlayer: PropTypes.func,
	changePlayerScore: PropTypes.func,
};

module.exports = PlayerDetailsPanel;

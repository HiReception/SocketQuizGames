const React = require("react");
const PropTypes = require("prop-types");

export default class PlayerListing extends React.Component {
	render = () => {
		const scoreString = this.props.prefix + this.props.player.score +
			this.props.suffix;
		let classExt = "";
		if (this.props.player.score < 0) {
			classExt += " negative";
		}

		if (this.props.answering) {
			classExt += " answering";
		} else if (this.props.lockedOut) {
			classExt += " locked";
		}


		return (
			<div className={`playerListing${ classExt}`} onClick={this.props.onClick}>
				<div className={`playerListingName${ classExt}`}>
					<p className={`playerListingName${ classExt}`}>
						{this.props.player.screenName}
						{this.props.selecting ? "*" : ""}
					</p>
				</div>
				<div className={`playerListingDetails${ classExt}`}>
					<p className={`playerListingDetails${ classExt}`}>{scoreString}</p>
				</div>
			</div>
		);
	}
}

PlayerListing.propTypes = {
	player: PropTypes.object,
	answering: PropTypes.bool,
	lockedOut: PropTypes.bool,
	selecting: PropTypes.bool,
	prefix: PropTypes.string,
	suffix: PropTypes.string,
	onClick: PropTypes.func,
};

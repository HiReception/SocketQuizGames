var React = require("react");
var PropTypes = require("prop-types");

export default class PlayerListing extends React.Component {
	render = () => {
		var scoreString = this.props.prefix + this.props.player.score + this.props.suffix;

		var className = this.props.player.score < 0 ? "playerListingDetails negative" : "playerListingDetails";

		var classModifier = "";
		if (this.props.lockedOut) {
			classModifier = "locked-out";
		} else if (this.props.answering) {
			classModifier = "answering";
		}
		
		return (
			<div className={"playerListing " + classModifier}>
				<div className={"playerListingName " + classModifier}>
					<p className={"playerListingName " + classModifier}>{this.props.player.screenName}</p>
				</div>
				<div className={"playerListingDetails " + classModifier}>
					<p className={className}>{scoreString}</p>
				</div>
			</div>
		);
	}
}

PlayerListing.propTypes = {
	player: PropTypes.object,
	answering: PropTypes.bool,
	lockedOut: PropTypes.bool,
	prefix: PropTypes.string,
	suffix: PropTypes.string,
};
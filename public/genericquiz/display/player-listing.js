var React = require("react");
var PropTypes = require("prop-types");

export default class PlayerListing extends React.Component {
	render = () => {
		var scoreString = this.props.player.score;

		var className = "playerListingDetails";

		if (this.props.answering) {
			return (
				<div className="playerListing">
					<div className="playerListingName" style={{backgroundColor: "#FFFFFF"}}>
						<p className="playerListingName" style={{color: this.props.player.colour}}>
							{this.props.player.screenName}
						</p>
					</div>
					<div className="playerListingDetails" style={{backgroundColor: "#FFFFFF"}}>
						<p className={className} style={{color: this.props.player.colour}}>{scoreString}</p>
					</div>
				</div>
			);
		} else {
			return (
				<div className="playerListing">
					<div className="playerListingName" style={{backgroundColor: this.props.player.colour}}>
						<p className="playerListingName" style={{color: "#FFFFFF"}}>{this.props.player.screenName}</p>
					</div>
					<div className="playerListingDetails" style={{backgroundColor: this.props.player.colour}}>
						<p className={className} style={{color: "#FFFFFF"}}>{scoreString}</p>
					</div>
				</div>
			);
		}
		
		
	}
}

PlayerListing.propTypes = {
	player: PropTypes.object,
	answering: PropTypes.bool,
};
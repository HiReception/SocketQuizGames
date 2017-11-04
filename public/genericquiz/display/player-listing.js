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
						<h1 className="playerListingName" style={{color: this.props.player.colour}}>
							{this.props.player.screenName}
						</h1>
					</div>
					<div className="playerListingDetails" style={{backgroundColor: "#FFFFFF"}}>
						<h1 className={className} style={{color: this.props.player.colour}}>{scoreString}</h1>
					</div>
				</div>
			);
		} else {
			return (
				<div className="playerListing">
					<div className="playerListingName" style={{backgroundColor: this.props.player.colour}}>
						<h1 className="playerListingName" style={{color: "#FFFFFF"}}>{this.props.player.screenName}</h1>
					</div>
					<div className="playerListingDetails" style={{backgroundColor: this.props.player.colour}}>
						<h1 className={className} style={{color: "#FFFFFF"}}>{scoreString}</h1>
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
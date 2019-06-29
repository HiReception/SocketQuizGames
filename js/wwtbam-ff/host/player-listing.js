const PropTypes = require("prop-types");
import React, { Component } from "react";

export default class PlayerListing extends Component {
	render = () => {
		const scoreString = this.props.player.score;
		let classExt = "";
		if (this.props.player.score < 0) {
			classExt += " negative";
		}

		if (this.props.waitingForAnswer) {
			classExt += " waiting";
		}

		return (
			<div className={`playerListing${ classExt}`} onClick={this.props.onClick}>
				<div className={`playerListingName${ classExt}`}>
					<p className={`playerListingName${ classExt}`}>
						{this.props.player.screenName}
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
	waitingForAnswer: PropTypes.bool,
};

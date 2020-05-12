const PropTypes = require("prop-types");
const io = require("socket.io-client");
import React, { Component } from "react";

// panel for between end of a player's main game and the Fastest Finger to find a new player
export default class PostMainGamePanel extends Component {
	render = () => {

		return (
			<div className='no-question-panel'>
				<p>{this.props.departingPlayerName} finishes with a total of {this.props.departingPlayerWinnings}</p>
				<div
					className='add-question-button'
					href='#'
					onClick={this.props.callback}>
					<p>New Fastest Finger Game</p>
				</div>
			</div>
		);
	}

	componentDidMount = () => {
		this.props.socket.emit("play sound", {id: "walkoff"});
	}
}

PostMainGamePanel.propTypes = {
	departingPlayerName: PropTypes.string,
	departingPlayerWinnings: PropTypes.string,
	callback: PropTypes.func,
	socket: PropTypes.instanceOf(io.Socket),
};
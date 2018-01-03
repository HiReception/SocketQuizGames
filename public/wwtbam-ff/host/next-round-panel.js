const PropTypes = require("prop-types");
const io = require("socket.io-client");
import React, { Component } from "react";

// panel for between questions
export default class NextRoundPanel extends Component {
	render = () => {
		const buttonText = "Go to Next Question";
		let button = null;
		if (!this.props.lastRound) {
			button = (
				<div
					className='add-question-button'
					href='#'
					onClick={this.props.callback}>
					<p>{buttonText}</p>
				</div>
			);
		}

		return (
			<div className='no-question-panel'>
				{button}
			</div>
		);
	}

	componentDidMount = () => {
		this.props.socket.emit("play sound", "pre-question");
	}
}

NextRoundPanel.propTypes = {
	lastRound: PropTypes.bool,
	callback: PropTypes.func,
	socket: PropTypes.instanceOf(io.Socket),
};
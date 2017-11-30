const PropTypes = require("prop-types");
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
}

NextRoundPanel.propTypes = {
	lastRound: PropTypes.bool,
	callback: PropTypes.func,
};
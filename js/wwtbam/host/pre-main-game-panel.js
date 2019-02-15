const PropTypes = require("prop-types");
const io = require("socket.io-client");
import React, { Component } from "react";

// panel for between Fastest Finger question and winner's main game
export default class PostMainGamePanel extends Component {
	render = () => {
		var treeButtonText = this.props.moneyTreeVisible ? "Hide Money Tree on Display" : "Show Money Tree on Display";
		return (
			<div className='no-question-panel'>
				<p>{this.props.incomingPlayerName} is the next contestant to play the main game</p>
				<div
					className='add-question-button'
					href='#'
					onClick={this.props.toggleMoneyTree}>
					<p>{treeButtonText}</p>
				</div>
				<div
					className='add-question-button'
					href='#'
					onClick={this.props.beginMainGame}>
					<p>Begin Main Game</p>
				</div>
			</div>
		);
	}

	componentDidMount = () => {
		this.props.socket.emit("play sound", "walkoff");
	}
}

PostMainGamePanel.propTypes = {
	incomingPlayerName: PropTypes.string,
	moneyTreeVisible: PropTypes.bool,
	toggleMoneyTree: PropTypes.func,
	beginMainGame: PropTypes.func,
	socket: PropTypes.instanceOf(io.Socket),
};
const PropTypes = require("prop-types");
const io = require("socket.io-client");
import React, { Component } from "react";

// panel for between Fastest Finger question and winner's main game
export default class LightsDownPanel extends Component {
	render = () => {
		var treeButtonText = this.props.moneyTreeVisible ? "Hide Money Tree on Display" : "Show Money Tree on Display";
		return (
			<div className='no-question-panel'>
				<p>{this.props.playerName} is about to see Question {this.props.questionNo} for {this.props.questionValue}</p>
				<div
					className='add-question-button'
					href='#'
					onClick={this.props.toggleMoneyTree}>
					<p>{treeButtonText}</p>
				</div>
				<div
					className='add-question-button'
					href='#'
					onClick={this.props.beginQuestion}>
					<p>Begin Question</p>
				</div>
			</div>
		);
	}
}

LightsDownPanel.propTypes = {
	playerName: PropTypes.string,
	questionNo: PropTypes.number,
	questionValue: PropTypes.string,
	moneyTreeVisible: PropTypes.bool,
	toggleMoneyTree: PropTypes.func,
	beginQuestion: PropTypes.func,
	socket: PropTypes.instanceOf(io.Socket),
};
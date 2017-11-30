const PropTypes = require("prop-types");
import React, { Component } from "react";

// TODO
export default class PlayerResultsPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			answersRevealed: false,
			winnerRevealed: false,
		};
	}
}

PlayerResultsPanel.propTypes = {
	players: PropTypes.array,
};


var React = require("react");
var PropTypes = require("prop-types");

// starting panel, with field to upload question file
export default class NextRoundPanel extends React.Component {
	handleKeyPress = (event) => {
		var eventDetails = event;
		console.log(eventDetails.key);
		if (eventDetails.key === "Enter") {
			this.props.callback();
		}
	}
	render = () => {
		var buttonText = this.props.lastRound ? "Go to Bonus Round" : "Go to Next Round";
		return (
			<div tabIndex="0" onKeyDown={this.handleKeyPress} className="no-question-panel">
				<div className="add-question-button" href="#" onClick={this.props.callback}><p>{buttonText}</p></div>
			</div>
		);
	}
}

NextRoundPanel.propTypes = {
	lastRound: PropTypes.bool,
	callback: PropTypes.func
};
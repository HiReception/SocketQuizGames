const React = require("react");
const PropTypes = require("prop-types");

// starting panel, with field to upload question file
class NextRoundPanel extends React.Component {
	render() {
		const buttonText = this.props.lastRound ?
			"Go to Final Jeopardy!" : "Go to Next Round";
		return (
			<div className='no-question-panel'>
				<div
					className='add-question-button'
					href='#'
					onClick={this.props.callback}>
					<p>{buttonText}</p>
				</div>
			</div>
		);
	}
}

NextRoundPanel.propTypes = {
	lastRound: PropTypes.bool,
	callback: PropTypes.func,
};

module.exports = NextRoundPanel;

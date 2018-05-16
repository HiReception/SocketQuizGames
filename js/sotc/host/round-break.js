const React = require("react");
const PropTypes = require("prop-types");

export default class CashCard extends React.Component {
	render = () => {
		return (
			<div className="round-break">
				<p>End of Round {this.props.currentRound}</p>
				<div className="add-question-button" onClick={this.props.nextItem}>
					<p>Go to Round {this.props.currentRound + 1}</p>
				</div>
			</div>
		);
	}
}

CashCard.propTypes = {
	currentRound: PropTypes.number,
	nextItem: PropTypes.func,
};

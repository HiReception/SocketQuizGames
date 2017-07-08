var React = require("react");
var PropTypes = require("prop-types");

export default class FinalJeopardyResponsePanel extends React.Component {
	render = () => {
		return (
			<div className="final-response">
				<div className="final-response-name">
					<p className="final-response-name">
						{this.props.screenName}
					</p>
				</div>
				<div className="final-response-question">
					<p className="final-response-question">
						{this.props.responseVisible ? this.props.response : ""}
					</p>
				</div>
				<div className="final-response-wager">
					<p className="final-response-wager">
						{this.props.wagerVisible ? this.props.wager : ""}
					</p>
				</div>
			</div>
		);
	}
}

FinalJeopardyResponsePanel.propTypes = {
	player: PropTypes.object,
	responseVisible: PropTypes.bool,
	wagerVisible: PropTypes.bool,
	response: PropTypes.string,
	wager: PropTypes.string
};
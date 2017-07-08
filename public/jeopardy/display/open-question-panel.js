var React = require("react");
var PropTypes = require("prop-types");

export default class OpenQuestionPanel extends React.Component {
	render = () => {
		return (
			<div id="open-question-panel">
				<div className="open-question-clue">
					<p className="open-question-clue">
						{this.props.clue.answer}
					</p>
				</div>
			</div>
		);
	}
}

OpenQuestionPanel.propTypes = {
	clue: PropTypes.object
};
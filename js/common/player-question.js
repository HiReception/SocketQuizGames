var React = require("react");
var PropTypes = require("prop-types");

export default class Question extends React.Component {
	render = () => {
		return (
			<div className="playerQuestion">
				<div className="playerQuestionDetails">Question {this.props.questionNo}</div>
				<p className="playerQuestion">{this.props.body}</p>
				{this.props.children}
			</div>
		);
	}
}

Question.propTypes = {
	questionNo: PropTypes.number,
	body: PropTypes.string,
};
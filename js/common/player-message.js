var React = require("react");
var PropTypes = require("prop-types");

export default class Message extends React.Component {
	render = () => {
		return (
			<div className="playerQuestion">
				<p className="playerQuestion">{this.props.primary}</p>
				<p className="playerQuestionDetails">{this.props.secondary}</p>
				{this.props.children}
			</div>
		);
	}
}

Message.propTypes = {
	primary: PropTypes.string,
	secondary: PropTypes.string,
	children: PropTypes.array,
};
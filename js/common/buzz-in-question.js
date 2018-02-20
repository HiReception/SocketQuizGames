var React = require("react");
var PropTypes = require("prop-types");
const io = require("socket.io-client");

export default class BuzzInQuestion extends React.Component {
	submitAnswer = () => {
		this.props.socket.emit("send answer", {
			questionNo: this.props.questionNo,
		});
	}

	render = () => {
		return (
			<div className="playerQuestion">
				<div onClick={this.submitAnswer} className="buzzer"/>
			</div>
		);
	}
}

BuzzInQuestion.propTypes = {
	questionNo: PropTypes.string,
	socket: PropTypes.instanceOf(io.Socket),
};
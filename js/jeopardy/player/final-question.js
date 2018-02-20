var React = require("react");
var io = require("socket.io-client");
var PropTypes = require("prop-types");
import Question from "../../common/player-question";
import SubmitButton from "../../common/submit-button";

export default class FinalQuestion extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			input: "",
			invalidInput: true
		};
	}

	inputChange = (event) => {
		this.setState({
			input: event.target.value,
			invalidInput: (event.target.value === "" ? true : false)
		});
	}

	submitAnswer = () => {
		if (!this.state.invalidInput) {
			this.props.socket.emit("send answer", {
				questionNo: 1,
				submittedAnswer: this.state.input
			});
		}
		
		
	}

	render = () => {
		var submitFunction = this.submitAnswer;
		return (
			<Question questionNo={this.props.questionNo} body={this.props.body}>
				<input type="text" value={this.state.input} 
					onChange={this.inputChange}/>
				<SubmitButton selector={submitFunction} invalidInput={this.state.invalidInput} text="Submit"/>
			</Question>
		);
	}
}

FinalQuestion.propTypes = {
	questionNo: PropTypes.number,
	body: PropTypes.string,
	socket: PropTypes.instanceOf(io.Socket),
}
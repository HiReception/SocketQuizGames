var React = require("react");
var io = require("socket.io-client");
var PropTypes = require("prop-types");
import SubmitButton from "../../common/submit-button";

export default class WagerQuestion extends React.Component {
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
			invalidInput: (isNaN(parseInt(event.target.value))
				|| parseInt(event.target.value) < 0
				|| parseInt(event.target.value) > this.props.balance)
		});
	}

	submitAnswer = () => {
		if (!this.state.invalidInput) {
			this.props.socket.emit("send message to host", {
				type: "wager",
				wager: parseInt(this.state.input)
			});
		}
		
		
	}

	render = () => {
		var submitFunction = this.submitAnswer;
		return (
			<div className="playerQuestion">
				<div className="playerQuestionDetails">Final Jeopardy Category:</div>
				<p className="playerQuestion">{this.props.category}</p>
				<div className="playerQuestionDetails">Enter your wager below (maximum of {this.props.prefix}{this.props.balance}{this.props.suffix}):</div>
				<input type="number" value={this.state.input} 
					onChange={this.inputChange}/>
				<SubmitButton selector={submitFunction} invalidInput={this.state.invalidInput} text="Submit"/>
			</div>
		);
	}
}

WagerQuestion.propTypes = {
	balance: PropTypes.number,
	category: PropTypes.string,
	socket: PropTypes.instanceOf(io.Socket),
};
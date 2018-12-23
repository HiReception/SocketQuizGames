import React, { Component } from "react";
const ReactDOM = require("react-dom");
const socket = require("socket.io-client")();
const $ = require("jquery");
const PropTypes = require("prop-types");

function getParameterByName(name, url) {
	if (!url) {
		url = window.location.href;
	}
	name = name.replace(/[\[\]]/g, "\\$&");
	let regex = new RegExp(`[?&]${ name }(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);
	if (!results) {
		return null;
	}

	if (!results[2]) {
		return "";
	}

	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const gameCode = getParameterByName("gamecode");
const screenName = getParameterByName("name");


// TODO add back button to header bar
// TODO add Page button to header bar, to get attention of host


socket.on("connect_timeout", () => {
	console.log("connection timeout");
});

socket.on("connect", () => {
	console.log("connected");
	socket.emit("join request", {
		screenName: screenName,
		gameCode: gameCode,
	});
});

socket.on("connect_error", (err) => {
	console.log(`connection error: ${ err}`);
});

socket.on("accepted", (state) => {
	$("#header-bar").text(screenName);
	ReactDOM.render(<PlayerPanel receivedState={state} socket={socket}/>, document.getElementById("question-window"));
});



class PlayerPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = props.receivedState;
	}

	handleNewState = (newState) => {
		console.log("new state");
		console.log(newState);
		this.setState(newState);
	}

	componentDidMount = () => {
		socket.on("new game state", this.handleNewState);
	}

	componentWillUnmount = () => {
		socket.removeListener("new game state", this.handleNewState);
	}

	render = () => {
		var input;
		const currentQ = this.state.ffQuestions[this.state.ffCurrentQuestion];
		if (this.state.ffBuzzersOpen && !currentQ.answers.some((answer) => { return answer.screenName === screenName; })) {
			const optionButtons = currentQ.options.map((option) => {
				return (
					<AnswerButton
						key={option.key}
						answerKey={option.key}
						body={option.text}/>

				);
			});

			console.log("question type = " + currentQ.type);
			switch (currentQ.type) {
			case "sequence":
				input = (
					<OrderedChoiceQuestion
						questionNo={parseInt(currentQ.questionNo, 10)}
						body={currentQ.body}>
						{optionButtons}
					</OrderedChoiceQuestion>
				);
				break;
			case "double-answer":
				input = (
					<MultipleAnswerQuestion
						questionNo={parseInt(currentQ.questionNo, 10)}
						body={currentQ.body}
						numCorrectAnswers={2}>
						{optionButtons}
					</MultipleAnswerQuestion>
				);
				break;
			case "single-answer":
				input = (
					<MultipleChoiceQuestion
						questionNo={parseInt(currentQ.questionNo, 10)}
						body={currentQ.body}>
						{optionButtons}
					</MultipleChoiceQuestion>
				);
				break;
			default:
				input = <EmptyPanel/>;
			}
		} else {
			input = <EmptyPanel/>;
		}
		return (
			<div className="playerBody">
				{input}
			</div>
		);
	}
}





class Message extends Component {
	render() {
		return (
			<div className='playerQuestion'>
				<p className='playerQuestion'>{this.props.primary}</p>
				<p className='playerQuestionDetails'>{this.props.secondary}</p>
				{this.props.children}
			</div>
		);
	}
}

Message.propTypes = {
	primary: PropTypes.string,
	secondary: PropTypes.string,
	children: PropTypes.node,
};


class Question extends Component {
	render() {
		return (
			<div className='playerQuestion'>
				<div className='playerQuestionDetails'>
					Question {this.props.questionNo}
				</div>
				<p className='playerQuestion'>{this.props.body}</p>
				{this.props.children}
			</div>
		);
	}
}

Question.propTypes = {
	questionNo: PropTypes.number,
	body: PropTypes.string,
	children: PropTypes.node,
};


class OrderedChoiceQuestion extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentAnswer: "",
			invalidInput: true,
			clearable: false,
		};
	}
	componentWillMount = () => {
		this.setState({
			timeReceived: new Date(),
		});
	}

	selectOption = (option) => {
		console.log("selectOption called");
		if (!this.state.currentAnswer.includes(option.props.answerKey)) {
			this.setState({
				currentAnswer: this.state.currentAnswer + option.props.answerKey,
				clearable: true,
				invalidInput: !(this.state.currentAnswer.length + 1 ===
					this.props.children.length),
			});
		}
	}

	clearAnswer = () => {
		console.log("clearAnswer called");
		if (this.state.clearable) {
			this.setState({
				currentAnswer: "",
				invalidInput: true,
				clearable: false,
			});
		}
	}

	submitAnswer = () => {
		if (!this.state.invalidInput) {
			const timeAnswered = new Date();
			const timeTaken = timeAnswered.getTime() -
				this.state.timeReceived.getTime();
			socket.emit("send answer", {
				questionNo: this.props.questionNo,
				submittedAnswer: this.state.currentAnswer,
				timeTaken: timeTaken,
			});
			console.log(`Answered with ${ this.state.currentAnswer}`);
			// TODO produce toast to represent successful answering
		}
	}

	render = () => {
		const selectFunction = this.selectOption;
		console.log(this.props.children);
		const options = React.Children.map(this.props.children, (child) => {
			console.log(`name = ${ child.type.name}`);
			if (child.type.name === "AnswerButton") {
				console.log("adding onClick");
				return (
					<AnswerButton
						key={child.key}
						answerKey={child.props.answerKey}
						body={child.props.body}
						active={!this.state.currentAnswer
							.includes(child.props.answerKey)}
						selector={selectFunction}/>
				);
			}
			return child;
		});
		const selectedOptions = options.map((option, index) => {
			console.log(`i = ${ index }, currentAnswer.length = ` +
				`${ this.state.currentAnswer.length}`);
			if (this.state.currentAnswer.length > index) {
				return (
					<div className='selected-option' key={index}>
						<p className='selected-option'>{this.state.currentAnswer[index]}</p>
					</div>
				);
			}
			return (
				<div className='selected-option blank' key={index}/>
			);
		});

		const selectedPanel = (<div className='selected-panel'>
			{selectedOptions}
		</div>);

		console.log(options);

		return (
			<Question questionNo={this.props.questionNo} body={this.props.body}>
				{options}
				{selectedPanel}
				<div className='button-row'>
					<ClearButton
						text='Clear'
						selector={this.clearAnswer}
						empty={this.state.currentAnswer.length === 0}/>
					<SubmitButton
						text='Submit'
						selector={this.submitAnswer}
						invalidInput={this.state.currentAnswer.length !== options.length}/>
				</div>
			</Question>
		);
	}
}

OrderedChoiceQuestion.propTypes = {
	questionNo: PropTypes.number,
	body: PropTypes.string,
	children: PropTypes.node,
};



class MultipleAnswerQuestion extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentAnswer: "",
			invalidInput: true,
			clearable: false,
		};
	}
	componentWillMount = () => {
		this.setState({
			timeReceived: new Date(),
		});
	}

	selectOption = (option) => {
		console.log("selectOption called");
		if (!this.state.currentAnswer.includes(option.props.answerKey)) {
			this.setState({
				currentAnswer: this.state.currentAnswer + option.props.answerKey,
				clearable: true,
				invalidInput: !(this.state.currentAnswer.length + 1 ===
					this.props.numCorrectAnswers),
			});
		}
	}

	clearAnswer = () => {
		console.log("clearAnswer called");
		if (this.state.clearable) {
			this.setState({
				currentAnswer: "",
				invalidInput: true,
				clearable: false,
			});
		}
	}

	submitAnswer = () => {
		if (!this.state.invalidInput) {
			const timeAnswered = new Date();
			const timeTaken = timeAnswered.getTime() -
				this.state.timeReceived.getTime();
			socket.emit("send answer", {
				questionNo: this.props.questionNo,
				submittedAnswer: this.state.currentAnswer.split("").sort().join(""),
				timeTaken: timeTaken,
			});
			console.log(`Answered with ${ this.state.currentAnswer.split("").sort().join("") }`);
			// TODO produce toast to represent successful answering
		}
	}

	render = () => {
		const selectFunction = this.selectOption;
		console.log(this.props.children);
		const options = React.Children.map(this.props.children, (child) => {
			console.log(`name = ${ child.type.name}`);
			if (child.type.name === "AnswerButton") {
				console.log("adding onClick");
				return (
					<AnswerButton
						key={child.key}
						answerKey={child.props.answerKey}
						body={child.props.body}
						active={!this.state.currentAnswer
							.includes(child.props.answerKey) && this.state.currentAnswer.length < this.props.numCorrectAnswers}
						selector={selectFunction}/>
				);
			}
			return child;
		});
		const selectedOptions = Array(this.props.numCorrectAnswers).fill().map((option, index) => {
			console.log(`i = ${ index }, currentAnswer.length = ` +
				`${ this.state.currentAnswer.length}`);
			if (this.state.currentAnswer.length > index) {
				return (
					<div className='selected-option' key={index}>
						<p className='selected-option'>{this.state.currentAnswer[index]}</p>
					</div>
				);
			}
			return (
				<div className='selected-option blank' key={index}/>
			);
		});

		const selectedPanel = (<div className='selected-panel'>
			{selectedOptions}
		</div>);

		console.log(options);

		return (
			<Question questionNo={this.props.questionNo} body={this.props.body}>
				{options}
				{selectedPanel}
				<div className='button-row'>
					<ClearButton
						text='Clear'
						selector={this.clearAnswer}
						empty={this.state.currentAnswer.length === 0}/>
					<SubmitButton
						text='Submit'
						selector={this.submitAnswer}
						invalidInput={this.state.invalidInput}/>
				</div>
			</Question>
		);
	}
}

MultipleAnswerQuestion.propTypes = {
	questionNo: PropTypes.number,
	body: PropTypes.string,
	children: PropTypes.node,
	numCorrectAnswers: PropTypes.number,
};



class AnswerButton extends Component {
	select = () => {
		if (this.props.active) {
			this.props.selector(this);
		}
	}

	render = () => {
		const classExt = this.props.active ? "" : " inactive";
		return (
			<div
				onClick={this.select}
				className={`playerOption${ classExt }`}>
				<div
					className={`playerOptionIcon${ classExt }`}>
					{this.props.answerKey}
				</div>
				<p className={`playerOption${ classExt }`}>
					{this.props.body}
				</p>
			</div>
		);
	}
}

AnswerButton.propTypes = {
	answerKey: PropTypes.string,
	body: PropTypes.string,
	active: PropTypes.bool,
	selector: PropTypes.func,
};

AnswerButton.defaultProps = {
	active: true,
};


class MultipleChoiceQuestion extends Component {
	componentWillMount = () => {
		this.setState({
			timeReceived: new Date(),
		});
	}

	selectAnswer = (option) => {
		console.log("selectAnswer called");
		const timeAnswered = new Date();
		const timeTaken = timeAnswered.getTime() -
			this.state.timeReceived.getTime();
		socket.emit("send answer", {
			questionNo: this.props.questionNo,
			submittedAnswer: option.props.answerKey,
			timeTaken: timeTaken,
		});
		console.log(`Answered with ${ option.props.answerKey}`);
		// TODO produce toast to represent successful answering
	}

	render = () => {
		const selectFunction = this.selectAnswer;
		console.log(this.props.children);
		const options = React.Children.map(this.props.children, (child) => {
			console.log(`name = ${ child.type.name}`);
			if (child.type.name === "AnswerButton") {
				console.log("adding onClick");
				return (
					<AnswerButton
						key={child.key}
						answerKey={child.props.answerKey}
						body={child.props.body}
						selector={selectFunction}/>
				);
			}
			return child;
		});
		console.log(options);

		return (
			<Question questionNo={this.props.questionNo} body={this.props.body}>
				{options}
			</Question>
		);
	}
}

MultipleChoiceQuestion.propTypes = {
	questionNo: PropTypes.number,
	body: PropTypes.string,
	children: PropTypes.node,
};

class SubmitButton extends Component {
	select = () => {
		this.props.selector(this);
	}

	render = () => {
		const className = this.props.invalidInput ?
			"submitButton disabled" : "submitButton";
		return (
			<div onClick={this.select} className={className}>
				<p>{this.props.text}</p>
			</div>

		);
	}
}

SubmitButton.propTypes = {
	text: PropTypes.string,
	selector: PropTypes.func,
	invalidInput: PropTypes.bool,
};


class ClearButton extends Component {
	select = () => {
		if (!this.props.empty) {
			this.props.selector(this);
		}
	}

	render = () => {
		const className = this.props.empty ? "clearButton disabled" : "clearButton";
		return (
			<div onClick={this.select} className={className}>
				<p>{this.props.text}</p>
			</div>

		);
	}
}

ClearButton.propTypes = {
	text: PropTypes.string,
	selector: PropTypes.func,
	empty: PropTypes.bool,
};


class EmptyPanel extends Component {
	render = () => {
		return (
			<div className='logo' />
		);
	}
}

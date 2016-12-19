var React = require("react");
var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var $ = require("jquery");

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	
	if (!results[2]) return "";

	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
	
var gameCode = getParameterByName("gamecode");
var screenName = getParameterByName("name");


// TODO add back button to header bar
// TODO add Page button to header bar, to get attention of host

socket.emit("join request", {
	screenName: screenName,
	gameCode: gameCode,
});

socket.on("accepted", function(newPlayerDetails) {
	console.log("new player details received:");
	console.log(JSON.stringify(newPlayerDetails));
	document.getElementById("question-window").style.backgroundColor = newPlayerDetails.colour;
	$("#header-bar").text(screenName);
});

socket.on("room not found", function() {
	console.log("received message room not found");
	// TODO send Message saying that the room was not found, with a back button (or a button that leads to /join)
});

socket.on("name taken", function() {
	console.log("received message name taken");
	// TODO send Message saying that the screen name is taken, with a back button (or a button that leads to /join)
});

socket.on("new message", function(message) {
	console.log("new message received: ");
	console.log(message);
	if (message.type === "wager") {
		ReactDOM.render((
			<WagerQuestion
				balance={message.balance}
				category={message.category}
				prefix={message.prefix}
				suffix={message.suffix}
			/>
		), document.getElementById("question-window"));
	} else if (message.type === "final") {
		ReactDOM.render((
			<FinalQuestion
				body={message.questionBody}
			/>
		), document.getElementById("question-window"));
	} else {
		ReactDOM.render(<Message primary={message.primary} secondary={message.secondary}/>,
			document.getElementById("question-window"));
	}
	
});



socket.on("new question", function(question) {
	console.log("New question received, type " + question.type);
	console.log(question);
	if (question.type === "final") {
		ReactDOM.render((
			<FinalQuestion
				body={question.questionBody}
			/>
		), document.getElementById("question-window"));
	} else if (question.type === "buzz-in") {
		ReactDOM.render(<BuzzInQuestion/>, document.getElementById("question-window"));
	}
});

socket.on("end of final", function() {
	/* TODO
		retrieve whatever's in the input field
		send that as the response
		replace the FinalJeopardyPanel with EmptyPanel
	*/
});

var Message = React.createClass({
	render: function() {
		return (
			<div className="playerQuestion">
				<p className="playerQuestion">{this.props.primary}</p>
				<p className="playerQuestionDetails">{this.props.secondary}</p>
				{this.props.children}
			</div>
		);
	}
});

var Question = React.createClass({
	propTypes: {
		questionNo: React.PropTypes.number,
		body: React.PropTypes.string
	},

	render: function() {
		return (
			<div className="playerQuestion">
				<div className="playerQuestionDetails">Question {this.props.questionNo}</div>
				<p className="playerQuestion">{this.props.body}</p>
				{this.props.children}
			</div>
		);
	}
});

var BuzzInQuestion = React.createClass({
	submitAnswer: function() {
		socket.emit("send answer", {
			questionNo: this.props.questionNo,
		});
	},
	render: function() {
		return (
			<div className="playerQuestion">
				<div onClick={this.submitAnswer} className="buzzer"/>
			</div>
		);
	}
});

var SubmitButton = React.createClass({
	propTypes: {
		text: React.PropTypes.string,
		selector: React.PropTypes.func,
		invalidInput: React.PropTypes.bool
	},

	select: function() {
		this.props.selector(this);
	},

	render: function() {
		var className = this.props.invalidInput ? "submitButton disabled" : "submitButton";
		return (
			<div onClick={this.select} className={className}>
				<p>{this.props.text}</p>
			</div>

		);
	}
});

var FinalQuestion = React.createClass({
	propTypes: {
		questionNo: React.PropTypes.number,
		body: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			input: "",
			invalidInput: true
		};
	},

	inputChange: function(event) {
		this.setState({
			input: event.target.value,
			invalidInput: (event.target.value === "" ? true : false)
		});
	},

	submitAnswer: function() {
		console.log("selectAnswer called");
		var answer = this.state.input;
		if (!this.state.invalidInput) {
			socket.emit("send answer", {
				questionNo: 1,
				submittedAnswer: this.state.input
			});

			console.log("Answered with " + answer);
			// TODO produce toast to represent successful answering
			ReactDOM.render(<EmptyPanel></EmptyPanel>, document.getElementById("question-window"));
		}
		
		
	},

	render: function() {
		var submitFunction = this.submitAnswer;
		return (
			<Question questionNo={this.props.questionNo} body={this.props.body}>
				<input type="text" value={this.state.input} 
					onChange={this.inputChange}/>
				<SubmitButton selector={submitFunction} invalidInput={this.state.invalidInput} text="Submit"/>
			</Question>
		);
	}
});

var WagerQuestion = React.createClass({
	propTypes: {
		balance: React.PropTypes.number,
		category: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			input: "",
			invalidInput: true
		};
	},

	inputChange: function(event) {
		this.setState({
			input: event.target.value,
			invalidInput: (isNaN(parseInt(event.target.value))
				|| parseInt(event.target.value) < 0
				|| parseInt(event.target.value) > this.props.balance)
		});
	},

	submitAnswer: function() {
		console.log("submitAnswer called");
		var answer = this.state.input;
		if (!this.state.invalidInput) {
			socket.emit("send message to host", {
				type: "wager",
				wager: parseInt(this.state.input)
			});

			console.log("Answered with " + answer);
			// TODO produce toast to represent successful answering
			ReactDOM.render(<EmptyPanel></EmptyPanel>, document.getElementById("question-window"));
		}
		
		
	},

	render: function() {
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
});

var EmptyPanel = React.createClass({
	render: function() {
		return (
			<div className="logo">
			</div>
		);
	}
});
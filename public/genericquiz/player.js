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
	if (message.type === "colour") {
		document.getElementById("question-window").style.backgroundColor = message.colour;
	}
	ReactDOM.render(<Message primary={message.primary} secondary={message.secondary}/>,
		document.getElementById("question-window"));
	
});



socket.on("new question", function(question) {
	console.log("New question received, type " + question.type);
	console.log(question);
	if (question.type === "buzz-in") {
		ReactDOM.render(<BuzzInQuestion/>, document.getElementById("question-window"));
	}
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
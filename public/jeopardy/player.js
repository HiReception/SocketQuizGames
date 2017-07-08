var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var $ = require("jquery");
import BuzzInQuestion from "../common/buzz-in-question";
import Message from "../common/player-message";
import WagerQuestion from "./player/wager-question";
import FinalQuestion from "./player/final-question";

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



socket.on("connect_timeout", function() {
	console.log("connection timeout");
});

socket.on("connect", function() {
	socket.emit("join request", {
		screenName: screenName,
		gameCode: gameCode,
	});
});

socket.on("connect_error", function(err) {
	console.log("connection error: " + err);
});

socket.on("accepted", function(newPlayerDetails) {
	document.getElementById("question-window").style.backgroundColor = newPlayerDetails.colour;
	$("#header-bar").text(screenName);
});

socket.on("new message", function(message) {
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
	if (question.type === "final") {
		ReactDOM.render((
			<FinalQuestion
				body={question.questionBody}
			/>
		), document.getElementById("question-window"));
	} else if (question.type === "buzz-in") {
		ReactDOM.render(<BuzzInQuestion socket={socket}/>, document.getElementById("question-window"));
	}
});

socket.on("end of final", function() {
	/* TODO
		retrieve whatever's in the input field
		send that as the response
		replace the FinalJeopardyPanel with EmptyPanel
	*/
});
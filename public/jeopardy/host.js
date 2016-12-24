var React = require("react");
var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var $ = require("jquery");

var players = [];

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return "";
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}


var gameTitle = getParameterByName("gametitle");

var prefix = "";
var suffix = "";

var currentRound = 0;
var cluesLeft = 0;
var buzzersOpen = false;

var rounds = [];
var final = {};

var selectingPlayer = "";


socket.emit("start game", {
	gameTitle: gameTitle,
	type: "jeopardy"
});

socket.on("game details", function(details) {
	console.log("Game Details received");
	console.log(details);
	$("#game-code").text(details.gameCode);
	$("#game-title").text(details.gameTitle);
	ReactDOM.render(<NoQuestionPanel/>, document.getElementById("question-panel"));
	renderPlayerList();
});

socket.on("new player", function(playerDetails) {
	console.log("new player:");
	console.log(playerDetails);
	playerDetails.score = 0;
	players.push(playerDetails);
	renderPlayerList();
});




function renderPlayerList() {
	var playerCountString = players.length === 1 ? "1 Player" : players.length + " Players";
	$("#player-count").text(playerCountString);
	if (players.length != 0) {
		var playersByScore = players.sort(function(a,b) {
			return a.score > b.score;
		});
		var list = [];
		for (var i = 0; i < playersByScore.length; i++) {
			var p = playersByScore[i];
			list.push(<PlayerListing player={p} key={i}/>);
		}
		socket.emit("set state", {
			players: players
		});
		ReactDOM.render(<div>{list}</div>, document.getElementById("player-list"));
	}
	
}

var PlayerListing = React.createClass({
	render: function() {
		console.log(rounds);
		var scoreString = prefix + this.props.player.score + suffix;

		var className = this.props.player.score < 0 ? "playerListingDetails negative" : "playerListingDetails";

		console.log(scoreString);
		
		return (
			<div className="playerListing">
				<div className="playerListingName">
					<p className="playerListingName">{this.props.player.screenName}</p>
				</div>
				<div className="playerListingDetails">
					<p className={className}>{scoreString}</p>
				</div>
			</div>
		);
	}
});

// starting panel, with field to upload question file
class NoQuestionPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			playerNameList: [],
			selectedFirstPlayer: {},
			anyFieldsEmpty: true,
		};
		var thisPanel = this;

		this.processFile = this.processFile.bind(this);
		this.changeFirstPlayer = this.changeFirstPlayer.bind(this);

		socket.on("new player", function(playerDetails) {
			var playerNameListCopy = thisPanel.state.playerNameList;
			playerNameListCopy.push(playerDetails.screenName);
			thisPanel.setState({
				playerNameList: playerNameListCopy,
				selectedFirstPlayer: playerNameListCopy.length > 0 ? players[0] : {},
				anyFieldsEmpty: !(playerNameListCopy.length > 0)
			});
			console.log(thisPanel.state.playerNameList);
		});
	}
	processFile() {
		if (!(this.state.anyFieldsEmpty)) {
			selectingPlayer = this.state.selectedFirstPlayer;
			var selectedFile = document.getElementById("questionFile").files[0];
			var reader = new FileReader();
			reader.onload = function() {
				console.log("reader.onload called");
				var fileText = reader.result;
				var fileObject = JSON.parse(fileText);
				rounds = fileObject.rounds;
				prefix = fileObject.properties.prefix;
				suffix = fileObject.properties.suffix;
				// TODO error handling
				final = fileObject.final;
				for (var round = 0; round < rounds.length; round++) {
					for (var cat = 0; cat < rounds[round].categories.length; cat++) {
						for (var clue = 0; clue < rounds[round].categories[cat].clues.length; clue++) {
							rounds[round].categories[cat].clues[clue].active = true;
						}
					}
				}
				cluesLeft = [].concat.apply([], rounds[currentRound].categories.map(function(c){return c.clues;})).length;
				socket.emit("send question", {
					type: "buzz-in",
					open: true
				});
				renderPlayerList();
				socket.emit("set state", {
					prefix: prefix,
					suffix: suffix,
					rounds: rounds,
					final: final,
					players: players,
					currentRound: currentRound,
					currentPanel: "SelectQuestionPanel"
				});
				if (rounds.length !== 0) {
					ReactDOM.render(<SelectQuestionPanel roundNo={currentRound}/>, document.getElementById("question-panel"));
				} else {
					ReactDOM.render(<FinalJeopardyPanel/>, document.getElementById("question-panel"));
				}
				
			};
			reader.readAsText(selectedFile);
			console.log("readAsText called");
			// TODO show loading graphic until processing is done
		}
		
	}
	changeFirstPlayer(event) {
		var player = players.find(function(p) {return p.screenName === event.target.value; });
		this.setState({
			selectedFirstPlayer: player,
			anyFieldsEmpty: false
		});
	}
	render() {
		var fileInput = <input type="file" required={true} multiple={false} id="questionFile"/>;
		var startingPlayerOptions = [];
		console.log(this.state.playerNameList);
		for (var i = 0; i < this.state.playerNameList.length; i++) {
			startingPlayerOptions.push((
				<option
					value={this.state.playerNameList[i]}
					key={i}
					onChange={this.changeFirstPlayer}>
					{this.state.playerNameList[i]}
				</option>
			));
		}
		return (
			<div className="no-question-panel">
				
				<div className="upload-file-dialog">{fileInput}</div>
				<div className="upload-file-dialog">
					<p>Who will make the first selection of the game?</p>
					<select>
						{startingPlayerOptions}
					</select>
				</div>
				<div className="add-question-button" href="#" onClick={this.processFile}><p>Go</p></div>
			</div>
		);
	}
}


// starting panel, with field to upload question file
var NextRoundPanel = React.createClass({
	nextRound: function() {
		currentRound += 1;
		if (currentRound === rounds.length) {
			socket.emit("set state", {
				currentPanel: "FinalJeopardyPanel"
			});
			ReactDOM.render(<FinalJeopardyPanel/>, document.getElementById("question-panel"));
		} else {
			cluesLeft = [].concat.apply([], rounds[currentRound].categories.map(function(c){return c.clues;})).length;
			socket.emit("set state", {
				currentRound: currentRound,
				currentPanel: "SelectQuestionPanel"
			});
			ReactDOM.render(<SelectQuestionPanel/>, document.getElementById("question-panel"));
		}
	},
	render: function() {
		var buttonText = currentRound === rounds.length - 1 ? "Go to Final Jeopardy!" : "Go to Round " + (currentRound + 2);
		return (
			<div className="no-question-panel">
				<div className="add-question-button" href="#" onClick={this.nextRound}><p>{buttonText}</p></div>
			</div>
		);
	}
});


// panel showing which categories and clues are unasked (with buttons to show them)
var SelectQuestionPanel = React.createClass({
	render: function() {
		var round = rounds[currentRound];
		var catGroups = [];
		for (var i = 0; i < round.categories.length; i++) {
			catGroups.push(<CategoryGroup catNo={i} key={i} values={round.values.amounts}/>);
		}
		return (
			<div className="select-question-panel">
				{catGroups}
			</div>
		);
	}
});


var CategoryGroup = React.createClass({
	propTypes: {
		catNo: React.PropTypes.number,
		values: React.PropTypes.array
	},
	render: function() {
		var clueButtons = [];
		for (var i = 0; i < rounds[currentRound].categories[this.props.catNo].clues.length; i++) {
			clueButtons.push(<ClueButton catNo={this.props.catNo} clueNo={i} key={i} value={this.props.values[i]}/>);
		}

		return (
			<div className="category-group">
				<div className="category-header">
					<p className="category-header">{rounds[currentRound].categories[this.props.catNo].name}</p>
				</div>
				<div className="category-clue-group">
					{clueButtons}
				</div>
			</div>
		);
	}
});

var ClueButton = React.createClass({
	propTypes: {
		catNo: React.PropTypes.number,
		clueNo: React.PropTypes.number,
		value: React.PropTypes.number
	},
	onClick: function() {

		ReactDOM.render(<OpenQuestionPanel catNo={this.props.catNo} clueNo={this.props.clueNo} value={this.props.value}/>,
			document.getElementById("question-panel"));
		
	},
	render: function() {
		console.log(rounds[currentRound]);
		if (rounds[currentRound].categories[this.props.catNo].clues[this.props.clueNo].active) {
			return (
				<div 
					className="clue-button active"
					onClick={this.onClick}>
					<p className="clue-button">{prefix}{this.props.value}{suffix}</p>
				</div>
			);
		} else {
			return (
				<div 
					className="clue-button inactive">
				</div>
			);
		}
	}
});

class OpenQuestionPanel extends React.Component {
	constructor(props) {
		super(props);
		var dailyDouble = rounds[currentRound].categories[this.props.catNo].clues[this.props.clueNo].dailyDouble;
		this.state = {
			playerAnswering: dailyDouble ? selectingPlayer : {},
			value: rounds[currentRound].values.amounts[this.props.clueNo],
			dailyDouble: dailyDouble,
			ddWagerEntered: false,
			ddWagerSubmittable: false,
			ddWager: 0,
			ddMaxWager: (dailyDouble ? Math.max(selectingPlayer.score, Math.max(...rounds[currentRound].values.amounts)) : 0)
		};

		console.log(this.state);

		if (dailyDouble) {
			socket.emit("set state", {
				currentPanel: "DailyDoublePanel"
			});
			socket.emit("play sound", "daily-double");
		} else {
			socket.emit("set state", {
				currentPanel: "OpenQuestionPanel",
				currentCatNo: this.props.catNo,
				currentClueNo: this.props.clueNo
			});
		}
		
		this.render = this.render.bind(this);
		this.goToSelectPanel = this.goToSelectPanel.bind(this);
		this.openBuzzers = this.openBuzzers.bind(this);
		this.wrongAnswer = this.wrongAnswer.bind(this);
		this.rightAnswer = this.rightAnswer.bind(this);
		this.handleNewAnswer = this.handleNewAnswer.bind(this);
		this.changeDDWager = this.changeDDWager.bind(this);
		this.enterDDWager = this.enterDDWager.bind(this);
	}

	handleNewAnswer(details) {
		if (buzzersOpen) {
			buzzersOpen = false;
			console.log("new answer:");
			console.log(details);
			console.log(this);
			this.setState({
				playerAnswering: players.find(function(p) {
					return p.screenName === details.player.screenName;
				})
			});

			socket.emit("set state", {
				playerAnswering: players.find(function(p) {
					return p.screenName === details.player.screenName;
				})
			});
		}
	}

	componentDidMount() {
		socket.on("new answer", this.handleNewAnswer);
	}

	componentWillUnmount() {
		socket.removeListener("new answer", this.handleNewAnswer);
	}

	wrongAnswer() {
		if (!$.isEmptyObject(this.state.playerAnswering)) {
			this.state.playerAnswering.score -= this.state.value;
			renderPlayerList();
			if (this.state.dailyDouble) {
				this.goToSelectPanel();
			} else {
				this.openBuzzers();
			}
			
		}
	}

	rightAnswer() {
		console.log("this.state.playerAnswering = ");
		console.log(this.state.playerAnswering);
		if (!$.isEmptyObject(this.state.playerAnswering)) {
			this.state.playerAnswering.score += this.state.value;
			renderPlayerList();
			selectingPlayer = this.state.playerAnswering;
			this.goToSelectPanel();
		}
	}

	openBuzzers() {
		if (!buzzersOpen) {
			buzzersOpen = true;
			this.setState({playerAnswering: {}});
			socket.emit("set state", {
				playerAnswering: {}
			});
		
		}
	}

	goToSelectPanel() {
		if (buzzersOpen) {
			buzzersOpen = false;
		}
		renderPlayerList();
		rounds[currentRound].categories[this.props.catNo].clues[this.props.clueNo].active = false;
		cluesLeft--;

		socket.emit("set state", {
			rounds: rounds,
			playerAnswering: {}
		});
		

		if (cluesLeft === 0) {
			socket.emit("set state", {
				currentPanel: "NoQuestionPanel"
			});
			ReactDOM.render(<NextRoundPanel/>, document.getElementById("question-panel"));
		} else {
			socket.emit("set state", {
				currentPanel: "SelectQuestionPanel"
			});
			ReactDOM.render(<SelectQuestionPanel questionCurrentlyOpen={true}/>, document.getElementById("question-panel"));
		}
		
	}

	changeDDWager(event) {
		var newWager = parseInt(event.target.value);
		this.setState({
			ddWager: newWager,
			ddWagerSubmittable: (newWager >= 0 && newWager <= this.state.ddMaxWager)
		});
	}

	enterDDWager() {
		if (this.state.ddWagerSubmittable) {
			this.setState({
				ddWagerEntered: true,
				value: this.state.ddWager
			});
		}
	}

	render() {
		console.log(this.props.clueNo);
		var clue = rounds[currentRound].categories[this.props.catNo].clues[this.props.clueNo];
		console.log(clue);

		var header;
		var cluePanel;
		var correctPanel;
		var buzzerPanel;


		// Standard clue, buzzers not opened yet
		if (!buzzersOpen && $.isEmptyObject(this.state.playerAnswering)) {
			
			header = (
				<div className="open-question-header">
					<p className="open-question-category">{rounds[currentRound].categories[this.props.catNo].name}</p>
					<p className="open-question-value">
						{prefix}{this.state.value}{suffix}
					</p>
				</div>
			);

			cluePanel = (
				<div className="open-question-clue">
					<p className="open-question-clue">
						{clue.answer}
					</p>
				</div>
			);

			correctPanel = (
				<div className="open-question-correct">
					<p className="open-question-correct">
						Correct Response:<br/>
						{clue.correct}
					</p>
				</div>
			);

			buzzerPanel = (
				<div className="buzzer-panel">
					<div className="add-question-button" onClick={this.openBuzzers}>
						<p>Open Response Lines</p>
					</div>
				</div>
			);

		// Daily Double, wager not yet entered
		} else if (this.state.dailyDouble && !this.state.ddWagerEntered) {
			socket.emit("set state", {
				currentPanel: "DailyDoublePanel"
			});
			header = (
				<div className="open-question-header">
					<p className="open-question-category">{rounds[currentRound].categories[this.props.catNo].name}</p>
					<p className="open-question-value"></p>
				</div>
			);

			cluePanel = (
				<div className="open-question-clue daily-double">
					<p className="open-question-clue daily-double">
						DAILY DOUBLE
					</p>
				</div>
			);

			correctPanel = (
				<div className="open-question-correct daily-double">
				</div>
			);


			var wagerEntry = (
				<input type="number" className="daily-double-wager" onChange={this.changeDDWager} id="daily-double-wager"/>
			);
			buzzerPanel = (
				<div className="buzzer-panel">
					<p className="buzzer-panel">Enter Wager for {this.state.playerAnswering.screenName} (Maximum of ${this.state.ddMaxWager})</p>
					<div className="button-row">
						{wagerEntry}
						<div className="add-question-button" onClick={this.enterDDWager}>
							<p>Submit</p>
						</div>
					</div>
				</div>
			);

		// Standard clue, buzzers open
		} else if ($.isEmptyObject(this.state.playerAnswering)) {
			header = (
				<div className="open-question-header">
					<p className="open-question-category">{rounds[currentRound].categories[this.props.catNo].name}</p>
					<p className="open-question-value">
						{prefix}{this.state.value}{suffix}
					</p>
				</div>
			);

			cluePanel = (
				<div className="open-question-clue">
					<p className="open-question-clue">
						{clue.answer}
					</p>
				</div>
			);

			correctPanel = (
				<div className="open-question-correct">
					<p className="open-question-correct">
						Correct Response:<br/>
						{clue.correct}
					</p>
				</div>
			);

			buzzerPanel = (
				<div className="buzzer-panel">
					<p className="buzzer-panel">Response Lines are Open</p>
					<div className="add-question-button" onClick={this.goToSelectPanel}>
						<p>End Question and Return</p>
					</div>
				</div>
			);



		// Player answering, either Daily Double or not
		} else {
			if (this.state.dailyDouble) {
				socket.emit("set state", {
					currentPanel: "OpenQuestionPanel",
					currentCatNo: this.props.catNo,
					currentClueNo: this.props.clueNo
				});
			}
			
			header = (
				<div className="open-question-header">
					<p className="open-question-category">{rounds[currentRound].categories[this.props.catNo].name}</p>
					<p className="open-question-value">
						{prefix}{this.state.value}{suffix}
					</p>
				</div>
			);

			cluePanel = (
				<div className="open-question-clue">
					<p className="open-question-clue">
						{clue.answer}
					</p>
				</div>
			);

			correctPanel = (
				<div className="open-question-correct">
					<p className="open-question-correct">
						Correct Response:<br/>
						{clue.correct}
					</p>
				</div>
			);

			buzzerPanel = (
				<div className="buzzer-panel">
					<p className="buzzer-panel">{this.state.playerAnswering.screenName} is answering</p>
					<div className="button-row">
						<div className="add-question-button" onClick={this.rightAnswer}>
							<p>Correct</p>
						</div>
						<div className="add-question-button" onClick={this.wrongAnswer}>
							<p>Incorrect</p>
						</div>
					</div>
				</div>
			);
		}


		return (
			<div id="open-question-panel">
				{header}
				{cluePanel}
				{correctPanel}
				{buzzerPanel}
			</div>
		);
	}
}

OpenQuestionPanel.propTypes = {
	catNo: React.PropTypes.number,
	clueNo: React.PropTypes.number,
	value: React.PropTypes.number
};

class FinalJeopardyPanel extends React.Component {
	constructor(props) {
		super(props);

		var eligiblePlayers = players.filter(function(p) {return p.score > 0;}).sort(function(a,b) {return a.score < b.score;});
		this.state = {
			categoryVisible: false,
			clueVisible: false,
			eligiblePlayers: eligiblePlayers,
			wagers: [],
			wageringOpen: false,
			allWagersIn: false,
			respondingOpen: false,
			respondingOver: false,
			respondingTimeRemaining: 30,
			responses: [],
			focusPlayerNumber: 0,
			focusPlayerName: eligiblePlayers[0].screenName,
			focusMode: "response",
			focusCorrect: false
		};
		
		this.render = this.render.bind(this);
		this.wrongAnswer = this.wrongAnswer.bind(this);
		this.rightAnswer = this.rightAnswer.bind(this);
		this.showCategory = this.showCategory.bind(this);
		this.showClue = this.showClue.bind(this);
		this.openResponses = this.openResponses.bind(this);
		this.closeResponses = this.closeResponses.bind(this);
		this.nextFocus = this.nextFocus.bind(this);

		var thisPanel = this;

		socket.on("new answer", function(details) {
			console.log("new answer:");
			console.log(details);
			if (thisPanel.state.respondingOpen && !thisPanel.state.respondingOver
				&& !thisPanel.state.responses.some(function(r) { return r.screenName === details.screenName; })) {
				var newResponses = thisPanel.state.responses;
				newResponses.push({
					screenName: details.player.screenName,
					response: details.answer
				});
				thisPanel.setState({
					responses: newResponses
				});
			}
		});

		socket.on("new message", function(message) {
			console.log("new message:");
			console.log(message);
			if (message.details.type === "wager" && thisPanel.state.wageringOpen
				&& !thisPanel.state.wagers.some(function(w) { return w.screenName === message.player.screenName; })) {
				var newWagers = thisPanel.state.wagers;
				newWagers.push({
					screenName: message.player.screenName,
					wager: message.details.wager
				});
				thisPanel.setState({
					wagers: newWagers,
					allWagersIn: newWagers.length === thisPanel.state.eligiblePlayers.length
				});
			}
		});
	}
	showCategory() {
		this.setState({
			categoryVisible: true,
			wageringOpen: true
		});
		socket.emit("set state", {
			finalCategoryVisible: true
		});


		this.state.eligiblePlayers.map(function(p) {
			socket.emit("send private message", {
				screenName: p.screenName,
				message: {
					type: "wager",
					balance: p.score,
					category: final.category,
					prefix: prefix,
					suffix: suffix
				}
			});
		});
		// send message to display to play reveal tone
		socket.emit("play sound", "final-reveal");
	}
	showClue() {
		this.setState({
			clueVisible: true
		});
		socket.emit("set state", {
			finalClueVisible: true
		});
		// send message to display to play reveal tone
		socket.emit("play sound", "final-reveal");
	}
	openResponses() {
		this.setState({
			respondingOpen: true
		});
		this.state.eligiblePlayers.map(function(p) {
			socket.emit("send private message", {
				screenName: p.screenName,
				message: {
					type: "final",
					questionBody: final.answer
				}
			});
		});
		socket.emit("play sound", "final-think");
		// send message to display to start think music
		var thisPanel = this;
		var timer = setInterval(function() {
			if (thisPanel.state.respondingTimeRemaining > 1) {
				thisPanel.setState({
					respondingTimeRemaining: thisPanel.state.respondingTimeRemaining - 1
				});
			} else {
				console.log("time up");
				thisPanel.closeResponses();
				clearInterval(timer);
			}
			
		}, 1000);
	}
	closeResponses() {
		var thisPanel = this;
		this.setState({
			respondingOver: true,
			respondingOpen: false
		});
		var focusResponse;
		if (this.state.responses.some(function(r) {
			return r.screenName === thisPanel.state.focusPlayerName;
		})) {
			focusResponse = this.state.responses.find(function(r) {
				return r.screenName === thisPanel.state.focusPlayerName;
			}).response;
		} else {
			focusResponse = "";
		}
		socket.emit("set state", {
			currentPanel: "FinalJeopardyResponsePanel",
			finalFocusScreenName: thisPanel.state.focusPlayerName,
			finalFocusWager: prefix + thisPanel.state.wagers.find(function(p) {
				return p.screenName === thisPanel.state.focusPlayerName;
			}).wager + suffix,
			finalFocusResponse: focusResponse,
			finalFocusResponseVisible: true,
			finalFocusWagerVisible: false
		});
	}
	nextFocus() {
		if (this.state.focusPlayerNumber === this.state.eligiblePlayers.length - 1) {
			// TODO proceed to end of game screen
		} else {
			var thisPanel = this;
			this.setState({
				focusPlayerNumber: this.state.focusPlayerNumber + 1,
				focusPlayerName: this.state.eligiblePlayers[this.state.focusPlayerNumber + 1].screenName,
				focusMode: "response"
			});

			var focusResponse;
			if (this.state.responses.some(function(r) {
				return r.screenName === thisPanel.state.focusPlayerName;
			})) {
				focusResponse = this.state.responses.find(function(r) {
					return r.screenName === thisPanel.state.focusPlayerName;
				}).response;
			} else {
				focusResponse = "";
			}

			// send message to display to go to next response
			socket.emit("set state", {
				finalFocusScreenName: thisPanel.state.focusPlayerName,
				finalFocusWager: prefix + thisPanel.state.wagers.find(function(p) {
					return p.screenName === thisPanel.state.focusPlayerName;
				}).wager + suffix,
				finalFocusResponse: focusResponse,
				finalFocusResponseVisible: true,
				finalFocusWagerVisible: false
			});
		}
		
	}
	wrongAnswer() {
		var thisPanel = this;
		players.find(function(p) {return p.screenName === thisPanel.state.focusPlayerName;}).score 
			-= this.state.wagers.find(function(p) {return p.screenName === thisPanel.state.focusPlayerName;}).wager;
		this.setState({
			focusMode: "wager",
			focusCorrect: false
		});
		renderPlayerList();
		// send message to display to show wager

		socket.emit("set state", {
			finalFocusWagerVisible: true
		});
	}
	rightAnswer() {
		var thisPanel = this;
		players.find(function(p) {return p.screenName === thisPanel.state.focusPlayerName;}).score 
			+= this.state.wagers.find(function(p) {return p.screenName === thisPanel.state.focusPlayerName;}).wager;
		this.setState({
			focusMode: "wager",
			focusCorrect: true
		});
		renderPlayerList();
		// send message to display to show wager
		socket.emit("set state", {
			finalFocusWagerVisible: true
		});
	}
	render() {

		var categoryPanel;
		if (!this.state.categoryVisible) {
			categoryPanel = (
				<div className="final-jeopardy-category">
					<div className="add-question-button" onClick={this.showCategory}>
						<p>Show Category and Open Wagers</p>
					</div>
				</div>
			);
		} else {
			categoryPanel = (
				<div className="final-jeopardy-category">
					<p className="final-jeopardy-category">{final.category}</p>
				</div>
			);
		}

		var cluePanel;
		if (!this.state.categoryVisible) {
			cluePanel = <div className="final-jeopardy-clue"/>;
		} else if (!this.state.allWagersIn) {
			cluePanel = (
				<div className="final-jeopardy-clue">
					<p className="final-jeopardy-clue">
						Waiting on wager from {this.state.eligiblePlayers.length - this.state.wagers.length} contestant(s)
					</p>
				</div>
			);
		} else if (!this.state.clueVisible) {
			cluePanel = (
				<div className="final-jeopardy-clue">
					<p className="final-jeopardy-clue">
						All Wagers In
					</p>
					<div className="add-question-button" onClick={this.showClue}>
						<p>Show Clue</p>
					</div>
				</div>
			);
		} else {
			cluePanel = (
				<div className="final-jeopardy-clue">
					<p className="final-jeopardy-clue">
						{final.answer}
					</p>
				</div>
			);
		}



		var correctPanel;
		if (!this.state.clueVisible) {
			correctPanel = <div className="final-jeopardy-correct"/>;
		} else if (!this.state.respondingOpen && !this.state.respondingOver) {
			correctPanel = (
				<div className="final-jeopardy-correct">
					<div className="add-question-button" onClick={this.openResponses}>
						<p>Open Responses and Start Clock</p>
					</div>
				</div>
			);
		} else if (!this.state.respondingOver) {
			correctPanel = (
				<div className="final-jeopardy-correct">
					<p className="final-jeopardy-correct">
						{this.state.respondingTimeRemaining} second(s) remaining
					</p>
				</div>
			);
		} else {
			correctPanel = (
				<div className="final-jeopardy-correct">
					<p className="final-jeopardy-correct">
						Correct response:<br/>
						{final.correct}
					</p>
				</div>
			);
		}
		


		var responsePanel;
		var thisPanel = this;
		if (!this.state.respondingOver) {
			responsePanel = <div className="final-jeopardy-response"/>;
		} else if (this.state.focusMode === "response") {
			console.log(this.state.responses);
			console.log(this.state.finalFocusResponse);
			responsePanel = (
				<div className="final-jeopardy-response">
					<div className="button-row space-between">
						<p className="final-jeopardy-response left">{this.state.focusPlayerName} responded:</p>
						<div className="button-row recursive">
							<div className="add-question-button" onClick={this.rightAnswer}>
								<p>Correct</p>
							</div>
							<div className="add-question-button" onClick={this.wrongAnswer}>
								<p>Incorrect</p>
							</div>
						</div>
					</div>
					<p className="final-jeopardy-response">
						{this.state.finalFocusResponse}
					</p>
				</div>
			);
		} else {
			console.log(this.state.wagers);
			var wager = this.state.wagers.find(function(w) {
				console.log(w.screenName + " vs " + thisPanel.state.focusPlayerName);
				return w.screenName === thisPanel.state.focusPlayerName;
			}).wager;
			console.log(wager);
			responsePanel = (
				<div className="final-jeopardy-response">
					<div className="button-row space-between">
						<p className="final-jeopardy-response left">{this.state.focusPlayerName} wagered:</p>
						<div className="button-row recursive">
							<div className="add-question-button" onClick={this.nextFocus}>
								<p>Next</p>
							</div>
						</div>
					</div>
					<p className="final-jeopardy-response">
						{prefix}{wager}{suffix}
					</p>
				</div>
			);
		}		

		return (
			<div id="open-question-panel">
				<div className="final-jeopardy-header">
					<p className="final-jeopardy-header">Final JEOPARDY!</p>
				</div>
				{categoryPanel}
				{cluePanel}
				{correctPanel}
				{responsePanel}
			</div>
		);
	}
}
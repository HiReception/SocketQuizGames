var React = require("react");
var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var $ = require("jquery");
var fs = require("fs");
var ReactCSSTransitionReplace = require("react-css-transition-replace");
var ReactCSSTransitionGroup = require("react-addons-css-transition-group");

var gameTitle = getParameterByName("gametitle");

var prefix = "";
var suffix = "";




socket.emit("start game", {
	gameTitle: gameTitle,
	type: "jeopardy"
});

socket.on("game details", function(details) {
	console.log("Game Details received");
	console.log(details);
	$("#game-code").text(details.gameCode);
	$("#game-title").text(details.gameTitle);
	ReactDOM.render(<HostConsole/>, document.getElementById("main-panel"));
});


class HostConsole extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			players: [],
			detailPlayerName: "",

			currentRound: 0,
			cluesLeft: 0,
			selectingPlayer: "",
			playerAnswering: {},

			currentPanel: "NoQuestionPanel",
			newPanelKey: 0,

			finalEligiblePlayers: [],

			rounds: [],
			final: {},

			currentCatNo: 0,
			currentClueNo: 0,
			currentClueValue: 0
		};

		this.render = this.render.bind(this);
		this.showClue = this.showClue.bind(this);
		this.endClue = this.endClue.bind(this);
		this.changeCurrentPanel = this.changeCurrentPanel.bind(this);
		this.handleNewPlayer = this.handleNewPlayer.bind(this);
		this.changePlayerScore = this.changePlayerScore.bind(this);
		this.showPlayerDetails = this.showPlayerDetails.bind(this);
		this.clearPlayerDetails = this.clearPlayerDetails.bind(this);
		this.hidePlayer = this.hidePlayer.bind(this);
		this.unhidePlayer = this.unhidePlayer.bind(this);
		this.goToNextRound = this.goToNextRound.bind(this);
		this.setGameData = this.setGameData.bind(this);
		this.setSelectingPlayer = this.setSelectingPlayer.bind(this);
		this.setAnsweringPlayer = this.setAnsweringPlayer.bind(this);
		this.clearAnsweringPlayer = this.clearAnsweringPlayer.bind(this);
	}

	setAnsweringPlayer(screenName) {
		console.log("HostConsole setting answering player to " + screenName);
		this.setState({
			playerAnswering: this.state.players.find(function(p) {
				return p.screenName === screenName;
			})
		});
	}

	clearAnsweringPlayer() {
		this.setState({
			playerAnswering: {}
		});
	}

	showClue(catNo, clueNo, clueValue) {
		console.log(catNo);
		this.setState({
			currentCatNo: catNo,
			currentClueNo: clueNo,
			currentClueValue: clueValue,
			currentPanel: "OpenQuestionPanel",
			newPanelKey: this.state.newPanelKey + 1
		});
	}

	endClue() {
		var newRounds = this.state.rounds;
		newRounds[this.state.currentRound].categories[this.state.currentCatNo].clues[this.state.currentClueNo].active = false;
		var newCluesLeft = this.state.cluesLeft - 1;
		this.setState({
			rounds: newRounds,
			cluesLeft: newCluesLeft,
			currentPanel: newCluesLeft === 0 ? "NextRoundPanel" : "SelectQuestionPanel",
			newPanelKey: this.state.newPanelKey + 1
		});
	}

	changeCurrentPanel(panelName) {
		this.setState({
			currentPanel: panelName,
			newPanelKey: this.state.newPanelKey + 1
		});
	}

	handleNewPlayer(playerDetails) {
		console.log("new player:");
		console.log(playerDetails);
		playerDetails.score = 0;
		playerDetails.hidden = false;
		var newPlayers = this.state.players;

		newPlayers.push(playerDetails);
		this.setState({
			players: newPlayers
		});
	}

	changePlayerScore(screenName, newScore) {
		var newPlayers = this.state.players;
		newPlayers.find(function(p) {return p.screenName === screenName;}).score = newScore;
		this.setState({
			players: newPlayers
		});
		socket.emit("set state", {
			players: newPlayers
		});
	}

	showPlayerDetails(name, event) {
		console.log("showPlayerDetails(" + name + "," + event + ") called");
		this.setState({
			detailPlayerName: name
		});
	}

	clearPlayerDetails() {
		this.setState({
			detailPlayerName: ""
		});
	}

	hidePlayer(playerName) {
		var newPlayers = this.state.players;
		newPlayers.find(function(p) {return p.screenName === playerName;}).hidden = true;
		this.setState({
			players: newPlayers
		});
		socket.emit("set state", {
			players: newPlayers
		});
	}

	unhidePlayer(playerName) {
		var newPlayers = this.state.players;
		newPlayers.find(function(p) {return p.screenName === playerName;}).hidden = false;
		this.setState({
			players: newPlayers
		});
		socket.emit("set state", {
			players: newPlayers
		});
	}

	goToNextRound() {
		if (this.state.currentRound === this.state.rounds.length - 1) {
			this.setState({
				finalEligiblePlayers: this.state.players.filter(function(p) {return p.score > 0;}),
				currentPanel: "FinalJeopardyPanel",
				newPanelKey: this.state.newPanelKey + 1
			});
		} else {
			var newRound = this.state.rounds[this.state.currentRound + 1];
			this.setState({
				currentRound: this.state.currentRound + 1,
				cluesLeft: [].concat.apply([], newRound.categories.map(function(c){return c.clues;})).length,
				currentPanel: "SelectQuestionPanel",
				newPanelKey: this.state.newPanelKey + 1
			});
		}
	}

	setGameData(rounds, final, firstSelectingPlayer) {
		console.log(rounds, final, firstSelectingPlayer);
		this.setState({
			rounds: rounds,
			final: final,
			currentPanel: rounds.length > 0 ? "SelectQuestionPanel" : "FinalJeopardyPanel",
			newPanelKey: this.state.newPanelKey + 1,
			selectingPlayer: firstSelectingPlayer,
			cluesLeft: [].concat.apply([], rounds[0].categories.map(function(c){return c.clues;})).length
		});
		socket.emit("set state", {
			prefix: prefix,
			suffix: suffix,
			rounds: rounds,
			final: final,
			players: this.state.players,
			currentRound: 0,
			currentPanel: "SelectQuestionPanel"
		});
	}

	componentDidMount() {
		socket.on("new player", this.handleNewPlayer);
	}

	componentWillUnmount() {
		socket.removeListener("new player", this.handleNewPlayer);
	}

	setSelectingPlayer(screenName) {
		console.log("HostConsole.setSelectingPlayer called");
		this.setState({
			selectingPlayer: screenName
		});
	}

	render() {
		// render player list panel
		var playerPanel;
		var thisPanel = this;
		if (this.state.detailPlayerName === "") {
			var nonHiddenPlayers = this.state.players.filter(function(p) {return !p.hidden;});
			var playerCountString = nonHiddenPlayers.length === 1 ? "1 Player" : nonHiddenPlayers.length + " Players";
			$("#player-count").text(playerCountString);
			if (nonHiddenPlayers.length != 0) {
				var playersByScore = nonHiddenPlayers.sort(function(a,b) {
					return a.score > b.score;
				});
				var list = [];
				for (var i = 0; i < playersByScore.length; i++) {
					var p = playersByScore[i];
					list.push((
						<PlayerListing
							onClick={this.showPlayerDetails.bind(this, p.screenName)}
							player={p} 
							key={i}
							answering={!$.isEmptyObject(this.state.playerAnswering)
								&& this.state.playerAnswering.screenName === p.screenName}
							lockedOut={!$.isEmptyObject(this.state.playerAnswering)
								&& this.state.playerAnswering.screenName !== p.screenName}
							selecting={this.state.selectingPlayer === p.screenName}
						/>));
				}
				socket.emit("set state", {
					players: this.state.players
				});
				playerPanel = <div>{list}</div>;
			} else {
				playerPanel = <div><p className="no-players">No Players</p></div>;
			}
		} else {
			var player = this.state.players.find(function(p) {
				return p.screenName === thisPanel.state.detailPlayerName;
			});
			playerPanel = (<PlayerDetailsPanel
				player={player}
				clearPlayerDetails={this.clearPlayerDetails}
				hidden={player.hidden}
				hidePlayer={this.hidePlayer}
				unhidePlayer={this.unhidePlayer}
				changePlayerScore={this.changePlayerScore}
			/>);
		}



		var mainPanel;
		switch (this.state.currentPanel) {
		case "NoQuestionPanel":
			mainPanel = <NoQuestionPanel key={this.state.newPanelKey} players={this.state.players} setGameData={this.setGameData}/>;
			break;

		case "NextRoundPanel":
			mainPanel = (
				<NextRoundPanel
					key={this.state.newPanelKey}
					lastRound={this.state.currentRound === this.state.rounds.length - 1}
					callback={this.goToNextRound}
				/>
			);
			break;

		case "SelectQuestionPanel":
			mainPanel = (
				<SelectQuestionPanel 
					key={this.state.newPanelKey}
					round={this.state.rounds[this.state.currentRound]}
					callback={this.showClue}
				/>
			);
			socket.emit("set state", {
				currentPanel: "SelectQuestionPanel"
			});
			break;

		case "OpenQuestionPanel":
			var selectingPlayer = this.state.players.find(function(p) {return p.screenName === thisPanel.state.selectingPlayer;});
			console.log(selectingPlayer);
			mainPanel = (<OpenQuestionPanel
				key={this.state.newPanelKey}
				catName={this.state.rounds[this.state.currentRound].categories[this.state.currentCatNo].name}
				clue={this.state.rounds[this.state.currentRound]
					.categories[this.state.currentCatNo]
					.clues[this.state.currentClueNo]}
				players={this.state.players}
				value={this.state.currentClueValue}
				endClue={this.endClue}
				changePlayerScore={this.changePlayerScore}
				ddMaxWager={Math.max(...this.state.rounds[this.state.currentRound].values.amounts)}
				selectingPlayer={selectingPlayer}
				setSelectingPlayer={this.setSelectingPlayer}
				setAnsweringPlayer={this.setAnsweringPlayer}
				clearAnsweringPlayer={this.clearAnsweringPlayer}
			/>);
			break;

		case "FinalJeopardyPanel":
			mainPanel = (
				<FinalJeopardyPanel
					key={this.state.newPanelKey}
					final={this.state.final}
					changePlayerScore={this.changePlayerScore}
					eligiblePlayers={this.state.finalEligiblePlayers}
				/>
			);
			break;

		}

		return (
			<div className="main-panel">
				<div id="player-list" className="content">
					{playerPanel}
				</div>
				<ReactCSSTransitionGroup
					component="div"
					id="question-panel"
					className="content"
					transitionName={this.state.currentPanel === "SelectQuestionPanel" ? "mainpanel-reverse" : "mainpanel"}
					transitionEnterTimeout={0}
					transitionLeaveTimeout={0}>
					{mainPanel}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}


var PlayerDetailsPanel = React.createClass({
	propTypes: {
		player: React.PropTypes.object,
		clearPlayerDetails: React.PropTypes.func,
		hidePlayer: React.PropTypes.func,
		unhidePlayer: React.PropTypes.func,
		changePlayerScore: React.PropTypes.func
	},
	openScoreDialog: function() {
		var validNumber = false;
		var newScore = "";
		while (!validNumber) {
			newScore = prompt("Enter a new score for " + this.props.player.screenName +
			" (current score " + this.props.player.score + ")", this.props.player.score.toString());
			if (!isNaN(parseInt(newScore))) {
				this.props.changePlayerScore(this.props.player.screenName, parseInt(newScore));
				validNumber = true;
			}
		}
	},
	render: function() {
		var hideButton;
		if (this.props.player.hidden) {
			hideButton = (
				<div
					className="add-question-button"
					href="#"
					onClick={this.props.unhidePlayer.bind(this, this.props.player.screenName)}>
					<p>Unhide Player</p>
				</div>
			);
		} else {
			hideButton = (
				<div
					className="cancel-question-button"
					href="#"
					onClick={this.props.hidePlayer.bind(this, this.props.player.screenName)}>
					<p>Hide Player</p>
				</div>
			);
		}
		return (
			<div className="player-details-panel">
				<div className="player-details-name"><p className="player-details-name">{this.props.player.screenName}</p></div>
				<div className="player-details-score"><p className="player-details-score">{this.props.player.score}</p></div>
				<div className="add-question-button" href="#" onClick={this.openScoreDialog}><p>Change Score</p></div>
				{hideButton}
				<div className="player-details-back" href="#" onClick={this.props.clearPlayerDetails}>
					<p className="player-details-back">Back</p>
				</div>
			</div>
		);
	}
});


var PlayerListing = React.createClass({
	render: function() {
		var scoreString = prefix + this.props.player.score + suffix;
		var classExt = "";
		if (this.props.player.score < 0) {
			classExt += " negative";
		}

		if (this.props.answering) {
			classExt += " answering";
		} else if (this.props.lockedOut) {
			classExt += " locked";
		}

		console.log(scoreString);
		
		return (
			<div className={"playerListing" + classExt} onClick={this.props.onClick}>
				<div className={"playerListingName" + classExt}>
					<p className={"playerListingName" + classExt}>
						{this.props.player.screenName}
						{this.props.selecting ? "*" : ""}
					</p>
				</div>
				<div className={"playerListingDetails" + classExt}>
					<p className={"playerListingDetails" + classExt}>{scoreString}</p>
				</div>
			</div>
		);
	}
});

// starting panel, with field to upload question file
class NoQuestionPanel extends React.Component {
	constructor(props) {
		super(props);
		console.log(props);
		console.log(props.players);
		var playerNameList = props.players.map(function(p) {console.log(p); return p.screenName;});
		console.log(playerNameList);
		var testFiles = fs.readdirSync("public/jeopardy/testgames");
		this.state = {
			playerNameList: playerNameList,
			selectedFirstPlayer: props.players.length > 0 ? props.players[0].screenName : "",
			anyFieldsEmpty: props.players.length > 0 ? false : true,
			gameUsed: "upload",
			testFiles: testFiles,
			testFileSelected: "testgames/" + testFiles[0]
		};

		this.processFile = this.processFile.bind(this);
		this.changeFirstPlayer = this.changeFirstPlayer.bind(this);
		this.changeGameUsed = this.changeGameUsed.bind(this);
		this.changeTestFile = this.changeTestFile.bind(this);
		this.loadGameData = this.loadGameData.bind(this);
	}
	componentWillReceiveProps(newProps) {
		console.log(newProps);
		console.log(newProps.players);
		var playerNameList = newProps.players.map(function(p) {console.log(p); return p.screenName;});
		console.log(playerNameList);
		this.setState({
			playerNameList: playerNameList,
			selectedFirstPlayer: newProps.players.length > 0 ? newProps.players[0].screenName : "",
			anyFieldsEmpty: newProps.players.length > 0 ? false : true
		});
	}
	processFile() {
		if (!(this.state.anyFieldsEmpty)) {
			var selectedFile;
			if (this.state.gameUsed === "upload") {
				selectedFile = document.getElementById("questionFile").files[0];
				var reader = new FileReader();
				var thisPanel = this;
				reader.onload = function(event) {thisPanel.loadGameData(JSON.parse(event.target.result));};
				reader.readAsText(selectedFile);
				console.log("readAsText called");
				// TODO show loading graphic until processing is done
			} else {
				console.log(this.state.testFileSelected);
				$.ajax({
					type:    "GET",
					url:     this.state.testFileSelected,
					success: this.loadGameData
				});
			}
		}
		
	}
	loadGameData(fileObject) {
		console.log("reader.onload called");
		console.log(fileObject);
		var rounds = fileObject.rounds;
		var final = fileObject.final;
		prefix = fileObject.properties.prefix;
		suffix = fileObject.properties.suffix;
		// TODO error handling
		for (var round = 0; round < rounds.length; round++) {
			for (var cat = 0; cat < rounds[round].categories.length; cat++) {
				for (var clue = 0; clue < rounds[round].categories[cat].clues.length; clue++) {
					rounds[round].categories[cat].clues[clue].active = true;
				}
			}
		}
		
		socket.emit("send question", {
			type: "buzz-in",
			open: true
		});
		this.props.setGameData(rounds, final, this.state.selectedFirstPlayer);
	}
	changeGameUsed(event) {
		this.setState({
			gameUsed: event.target.value
		});
	}
	changeFirstPlayer(event) {
		this.setState({
			selectedFirstPlayer: event.target.value,
			anyFieldsEmpty: false
		});
	}
	changeTestFile(event) {
		console.log("changeTestFile called");
		console.log(event);
		this.setState({
			testFileSelected: event.target.value
		});
	}
	render() {
		var gameTypeRadioGroup = (
			<div className="game-type-radio-group">
				<label>
					<input type="radio" value="upload"
						checked={this.state.gameUsed === "upload"}
						onChange={this.changeGameUsed}/>
					<p>Upload your own file</p>
				</label>
				<label>
					<input type="radio" value="testfile"
						checked={this.state.gameUsed === "testfile"}
						onChange={this.changeGameUsed}/>
					<p>Use an Internal Test Game</p>
				</label>
			</div>
		);

		var fileInputSection;

		if (this.state.gameUsed === "upload") {
			fileInputSection = <input type="file" required={true} multiple={false} id="questionFile"/>;
		} else {
			var testGameOptions = [];
			for (var f in this.state.testFiles) {
				testGameOptions.push((
					<option
						value={"testgames/" + this.state.testFiles[f]}
						key={f}>
						{this.state.testFiles[f]}
					</option>
				));
			}
			fileInputSection = (
				<select onChange={this.changeTestFile}>
					{testGameOptions}
				</select>
			);

		}

		var startingPlayerOptions = [];
		console.log(this.state.playerNameList);
		for (var i = 0; i < this.state.playerNameList.length; i++) {
			startingPlayerOptions.push((
				<option
					value={this.state.playerNameList[i]}
					key={i}>
					{this.state.playerNameList[i]}
				</option>
			));
		}
		return (
			<div className="no-question-panel">
				{gameTypeRadioGroup}
				<div className="upload-file-dialog">{fileInputSection}</div>
				<div className="upload-file-dialog">
					<p>Who will make the first selection of the game?</p>
					<select onChange={this.changeFirstPlayer}>
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
	render: function() {
		var buttonText = this.props.lastRound ? "Go to Final Jeopardy!" : "Go to Next Round";
		return (
			<div className="no-question-panel">
				<div className="add-question-button" href="#" onClick={this.props.callback}><p>{buttonText}</p></div>
			</div>
		);
	}
});


// panel showing which categories and clues are unasked (with buttons to show them)
var SelectQuestionPanel = React.createClass({
	propTypes: {
		round: React.PropTypes.object,
		callback: React.PropTypes.func
	},
	render: function() {
		var catGroups = [];
		for (var i = 0; i < this.props.round.categories.length; i++) {
			catGroups.push((
				<CategoryGroup
					catNo={i}
					category={this.props.round.categories[i]}
					key={i}
					values={this.props.round.values.amounts}
					callback={this.props.callback}
				/>
			));
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
		category: React.PropTypes.object,
		values: React.PropTypes.array,
		callback: React.PropTypes.func
	},
	render: function() {
		var clueButtons = [];
		for (var i = 0; i < this.props.category.clues.length; i++) {
			clueButtons.push((
				<ClueButton
					active={this.props.category.clues[i].active}
					catNo={this.props.catNo}
					clueNo={i}
					key={i}
					value={this.props.values[i]}
					callback={this.props.callback}
				/>
			));
		}

		return (
			<div className="category-group">
				<div className="category-header">
					<p className="category-header">{this.props.category.name}</p>
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
		active: React.PropTypes.bool,
		catNo: React.PropTypes.number,
		clueNo: React.PropTypes.number,
		value: React.PropTypes.number,
		callback: React.PropTypes.func
	},
	onClick: function() {
		this.props.callback(this.props.catNo, this.props.clueNo, this.props.value);
	},
	render: function() {
		if (this.props.active) {
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
		var dailyDouble = this.props.clue.dailyDouble;
		console.log(props.selectingPlayer);
		this.state = {
			playerAnswering: dailyDouble ? props.selectingPlayer : {},
			wrongPlayerNames: [],
			value: props.value,
			dailyDouble: dailyDouble,
			ddWagerEntered: false,
			ddWagerSubmittable: false,
			ddWager: 0,
			buzzersOpen: false,
			
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
				currentClue: this.props.clue
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
		if (this.state.buzzersOpen 
			&& details.player.screenName !== "" 
			&& !this.state.wrongPlayerNames.includes(details.player.screenName)) {
			
			console.log("new answer:");
			console.log(details);
			console.log(this);
			this.setState({
				playerAnswering: this.props.players.find(function(p) {
					return p.screenName === details.player.screenName;
				}),
				buzzersOpen: false
			});



			socket.emit("set state", {
				playerAnswering: this.props.players.find(function(p) {
					return p.screenName === details.player.screenName;
				})
			});

			this.props.setAnsweringPlayer(details.player.screenName);
		}
	}

	componentWillMount() {
		console.log("componentWillMount called");
		if (this.state.dailyDouble) {
			console.log("Setting answering player to " + this.props.selectingPlayer.screenName);
			this.props.setAnsweringPlayer(this.props.selectingPlayer.screenName);
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
			this.props.changePlayerScore(this.state.playerAnswering.screenName,
				this.state.playerAnswering.score - this.state.value);
			this.props.clearAnsweringPlayer();
			if (this.state.dailyDouble) {
				this.props.endClue();
			} else {
				var newWrongPlayerNames = this.state.wrongPlayerNames;
				console.log(newWrongPlayerNames);
				newWrongPlayerNames.push(this.state.playerAnswering.screenName);
				this.setState({
					wrongPlayerNames: newWrongPlayerNames
				});
				this.openBuzzers();
			}
		}
	}

	rightAnswer() {
		console.log("this.state.playerAnswering = ");
		console.log(this.state.playerAnswering);
		if (!$.isEmptyObject(this.state.playerAnswering)) {
			this.props.changePlayerScore(this.state.playerAnswering.screenName,
				this.state.playerAnswering.score + this.state.value);
			this.props.setSelectingPlayer(this.state.playerAnswering.screenName);
			this.props.clearAnsweringPlayer();
			this.props.endClue();
		}
	}

	openBuzzers() {
		if (!this.state.buzzersOpen) {
			this.props.clearAnsweringPlayer();
			this.setState({
				playerAnswering: {},
				buzzersOpen: true
			});
			socket.emit("set state", {
				playerAnswering: {}
			});
		
		}
	}

	goToSelectPanel() {
		this.props.endClue();
	}

	changeDDWager(event) {
		var newWager = parseInt(event.target.value);
		this.setState({
			ddWager: newWager,
			ddWagerSubmittable: (newWager >= 0 && newWager <= Math.max(this.props.ddMaxWager, this.state.playerAnswering.score))
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

		var header;
		var cluePanel;
		var correctPanel;
		var buzzerPanel;


		// Standard clue, buzzers not opened yet
		if (!this.state.buzzersOpen && $.isEmptyObject(this.state.playerAnswering)) {
			
			header = (
				<div className="open-question-header">
					<p className="open-question-category">{this.props.catName}</p>
					<p className="open-question-value">
						{prefix}{this.state.value}{suffix}
					</p>
				</div>
			);

			cluePanel = (
				<div className="open-question-clue">
					<p className="open-question-clue">
						{this.props.clue.answer}
					</p>
				</div>
			);

			correctPanel = (
				<div className="open-question-correct">
					<p className="open-question-correct">
						Correct Response:<br/>
						{this.props.clue.correct}
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
					<p className="open-question-category">{this.props.catName}</p>
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
					<p className="buzzer-panel">
						Enter Wager for {this.state.playerAnswering.screenName} <nbsp/>
						(Maximum of ${Math.max(this.props.ddMaxWager, this.state.playerAnswering.score)})
					</p>
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
					<p className="open-question-category">{this.props.catName}</p>
					<p className="open-question-value">
						{prefix}{this.state.value}{suffix}
					</p>
				</div>
			);

			cluePanel = (
				<div className="open-question-clue">
					<p className="open-question-clue">
						{this.props.clue.answer}
					</p>
				</div>
			);

			correctPanel = (
				<div className="open-question-correct">
					<p className="open-question-correct">
						Correct Response:<br/>
						{this.props.clue.correct}
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
					currentClue: this.props.clue
				});
			}
			
			header = (
				<div className="open-question-header">
					<p className="open-question-category">{this.props.catName}</p>
					<p className="open-question-value">
						{prefix}{this.state.value}{suffix}
					</p>
				</div>
			);

			cluePanel = (
				<div className="open-question-clue">
					<p className="open-question-clue">
						{this.props.clue.answer}
					</p>
				</div>
			);

			correctPanel = (
				<div className="open-question-correct">
					<p className="open-question-correct">
						Correct Response:<br/>
						{this.props.clue.correct}
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
	players: React.PropTypes.array,
	catName: React.PropTypes.string,
	clue: React.PropTypes.object,
	value: React.PropTypes.number,
	endClue: React.PropTypes.func,
	changePlayerScore: React.PropTypes.func,
	ddMaxWager: React.PropTypes.number,
	selectingPlayer: React.PropTypes.object,
	setSelectingPlayer: React.PropTypes.func,
	setAnsweringPlayer: React.PropTypes.func,
	clearAnsweringPlayer: React.PropTypes.func
};

class FinalJeopardyPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			categoryVisible: false,
			clueVisible: false,
			wagers: [],
			wageringOpen: false,
			allWagersIn: false,
			respondingOpen: false,
			respondingOver: false,
			respondingTimeRemaining: 30,
			responses: [],
			focusPlayerNumber: 0,
			focusPlayerName: this.props.eligiblePlayers[0].screenName,
			focusResponse: "",
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
					allWagersIn: newWagers.length === thisPanel.props.eligiblePlayers.length
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

		var thisPanel = this;
		this.props.eligiblePlayers.map(function(p) {
			socket.emit("send private message", {
				screenName: p.screenName,
				message: {
					type: "wager",
					balance: p.score,
					category: thisPanel.props.final.category,
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
		var thisPanel = this;
		this.props.eligiblePlayers.map(function(p) {
			socket.emit("send private message", {
				screenName: p.screenName,
				message: {
					type: "final",
					questionBody: thisPanel.props.final.answer
				}
			});
		});
		socket.emit("play sound", "final-think");
		// send message to display to start think music
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
			console.log(r);
			return r.screenName === thisPanel.state.focusPlayerName;
		})) {
			focusResponse = this.state.responses.find(function(r) {
				return r.screenName === thisPanel.state.focusPlayerName;
			}).response;
		} else {
			focusResponse = "";
		}

		this.setState({
			focusResponse: focusResponse
		});

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
		if (this.state.focusPlayerNumber === this.props.eligiblePlayers.length - 1) {
			// TODO proceed to end of game screen
		} else {
			var thisPanel = this;
			this.setState({
				focusPlayerNumber: this.state.focusPlayerNumber + 1,
				focusPlayerName: this.props.eligiblePlayers[this.state.focusPlayerNumber + 1].screenName,
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
			this.setState({
				focusResponse: focusResponse
			});

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
		this.props.changePlayerScore(this.state.focusPlayerName,
			this.props.eligiblePlayers.find(function(p) {return p.screenName === thisPanel.state.focusPlayerName;}).score
				- this.state.wagers.find(function(p) {return p.screenName === thisPanel.state.focusPlayerName;}).wager);
		this.setState({
			focusMode: "wager",
			focusCorrect: false
		});
		// send message to display to show wager

		socket.emit("set state", {
			finalFocusWagerVisible: true
		});
	}
	rightAnswer() {
		var thisPanel = this;
		this.props.changePlayerScore(this.state.focusPlayerName,
			this.props.eligiblePlayers.find(function(p) {return p.screenName === thisPanel.state.focusPlayerName;}).score
				+ this.state.wagers.find(function(p) {return p.screenName === thisPanel.state.focusPlayerName;}).wager);
		this.setState({
			focusMode: "wager",
			focusCorrect: true
		});
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
					<p className="final-jeopardy-category">{this.props.final.category}</p>
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
						Waiting on wager from {this.props.eligiblePlayers.length - this.state.wagers.length} contestant(s)
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
						{this.props.final.answer}
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
						{this.props.final.correct}
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
			console.log(this.state.focusResponse);
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
						{this.state.focusResponse}
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

FinalJeopardyPanel.propTypes = {
	eligiblePlayers: React.PropTypes.array,
	final: React.PropTypes.object,
	changePlayerScore: React.PropTypes.func
};



function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return "";
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
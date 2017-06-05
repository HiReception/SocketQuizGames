var React = require("react");
var PropTypes = require("prop-types");
var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var soundManager = require("soundmanager2").soundManager;


function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return "";
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}


socket.emit("display request", {
	gameCode: getParameterByName("gamecode")
});

socket.on("accepted", function() {
	ReactDOM.render(<DisplayContainer/>, document.getElementById("display-panel"));

	soundManager.setup({

		onready: function() {
			// SM2 has loaded, API ready to use e.g., createSound() etc.
		},

		ontimeout: function() {
			// Uh-oh. No HTML5 support, SWF missing, Flash blocked or other issue
		}

	});

	soundManager.createSound({id: "final-think", url: "./sounds/finalThink.mp3", autoLoad: true});
	soundManager.createSound({id: "daily-double", url: "./sounds/dailyDouble.wav", autoLoad: true});
	soundManager.createSound({id: "final-reveal", url: "./sounds/finalReveal.wav", autoLoad: true});
});

socket.on("play sound", function(id) {
	soundManager.play(id);
});


class DisplayContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentRound: 0,
			buzzersOpen: false,
			rounds: [],
			players: [],

			final: {},
			finalCategoryVisible: false,
			finalClueVisible: false,
			finalFocusScreenName: "",
			finalFocusResponse: "",
			finalFocusResponseVisible: false,
			finalFocusWager: "",
			finalFocusWagerVisible: false,

			
			currentPanel: "NoQuestionPanel",
			currentClue: {},

			playerAnswering: {},

			dailyDoublePlaySound: true,

			prefix: "",
			suffix: "",
		};
		
		this.render = this.render.bind(this);
		var thisPanel = this;

		socket.on("new game state", function(state) {
			if (thisPanel.state.currentPanel === "DailyDoublePanel") {
				thisPanel.setState({
					dailyDoublePlaySound: false
				});
			} else {
				thisPanel.setState({
					dailyDoublePlaySound: true
				});
			}
			console.log("new state received");
			console.log(state);
			thisPanel.setState(state);
		});
	}

	render() {
		var questionPanel;

		switch (this.state.currentPanel) {
		case "NoQuestionPanel":
			questionPanel = <NoQuestionPanel/>;
			break;
		case "SelectQuestionPanel":
			questionPanel = (
				<SelectQuestionPanel
					round={this.state.rounds[this.state.currentRound]}
					prefix={this.state.prefix}
					suffix={this.state.suffix}
				/>
			);
			break;
		case "OpenQuestionPanel":
			questionPanel = (<OpenQuestionPanel
				clue={this.state.currentClue}
			/>);
			break;
		case "DailyDoublePanel":
			questionPanel = <DailyDoublePanel playSound={this.state.playSound}/>;
			break;
		case "FinalJeopardyPanel":
			questionPanel = (
				<FinalJeopardyPanel
					final={this.state.final}
					categoryVisible={this.state.finalCategoryVisible}
					clueVisible={this.state.finalClueVisible}
					revealTone={false}
					thinkMusicPlaying={false}
				/>
			);
			break;
		case "FinalJeopardyResponsePanel":
			questionPanel = (
				<FinalJeopardyResponsePanel
					screenName={this.state.finalFocusScreenName}
					response={this.state.finalFocusResponse}
					responseVisible={this.state.finalFocusResponseVisible}
					wager={this.state.finalFocusWager}
					wagerVisible={this.state.finalFocusWagerVisible}
				/>
			);
			break;
		}

		var playerPanel;
		var thisPanel = this;
		var nonHiddenPlayers = this.state.players.filter(function(p) {
			return !p.hidden;
		});

		if (nonHiddenPlayers.length != 0) {
			var list = [];
			for (var i = 0; i < nonHiddenPlayers.length; i++) {
				var p = nonHiddenPlayers[i];
				// light this display up if they are answering the question
				var answering = this.state.playerAnswering.screenName === p.screenName;

				// player is "locked out" if someone ELSE is answering, so grey them out
				var lockedOut = this.state.playerAnswering.hasOwnProperty("screenName")
					&& this.state.playerAnswering.screenName !== p.screenName;

				list.push((<PlayerListing
					player={p}
					key={i}
					prefix={this.state.prefix}
					suffix={this.state.suffix}
					answering={answering}
					lockedOut={lockedOut}
				/>));
			}
			playerPanel = <div className="playerContainer">{list}</div>;
		} else {
			playerPanel = <div className="playerContainer"/>;
		}

		return (
			<div id="display-panel" className="content">
				<div id="question-panel" className="content">
					{questionPanel}
				</div>		
				<div id="player-list" className="content">
					{playerPanel}
				</div>
			</div>
		);
	}
}

var PlayerListing = React.createClass({
	render: function() {
		var scoreString = this.props.prefix + this.props.player.score + this.props.suffix;

		var className = this.props.player.score < 0 ? "playerListingDetails negative" : "playerListingDetails";

		console.log(scoreString);

		var classModifier = "";
		if (this.props.lockedOut) {
			classModifier = "locked-out";
		} else if (this.props.answering) {
			classModifier = "answering";
		}
		
		return (
			<div className={"playerListing " + classModifier}>
				<div className={"playerListingName " + classModifier}>
					<p className={"playerListingName " + classModifier}>{this.props.player.screenName}</p>
				</div>
				<div className={"playerListingDetails " + classModifier}>
					<p className={className}>{scoreString}</p>
				</div>
			</div>
		);
	}
});

// starting panel, with field to upload question file
var NoQuestionPanel = React.createClass({
	render: function() {
		return (
			<div className="no-question-panel">
				<div>
					<p className="handwriting">Doyle's</p>
					<img src="images/white logo.png"/>
				</div>
			</div>
		);
	}
});

// panel showing which categories and clues are unasked (with buttons to show them)
var SelectQuestionPanel = React.createClass({
	render: function() {
		var catGroups = [];
		for (var i = 0; i < this.props.round.categories.length; i++) {
			catGroups.push((
				<CategoryGroup
					category={this.props.round.categories[i]}
					key={i}
					values={this.props.round.values.amounts}
					prefix={this.props.prefix}
					suffix={this.props.suffix}/>));
		}

		return (
			<div className="select-question-panel">
				{catGroups}
			</div>
		);
	},
	componentDidMount: function() {
		//textFit($("div.category-header"), {multiLine: false});
		//textFit($("div.clue-button"));
	}
});


var CategoryGroup = React.createClass({
	propTypes: {
		category: PropTypes.object,
		values: PropTypes.array,
		prefix: PropTypes.string,
		suffix: PropTypes.string
	},
	render: function() {
		var clueButtons = [];
		// only show the category name if there are any clues left in it
		var showCategoryName = this.props.category.clues.some(function(clue) {
			return clue.active;
		});
		for (var i = 0; i < this.props.category.clues.length; i++) {
			clueButtons.push((
					<ClueButton
						clue={this.props.category.clues[i]}
						key={i}
						value={this.props.values[i]}
						prefix={this.props.prefix}
						suffix={this.props.suffix}/>
				));
		}

		if (showCategoryName) {
			var header = (
				<div className="category-header">
						<p className="category-header">{this.props.category.name}</p>
				</div>
			);
			
			return (
				<div className="category-group">
					{header}
					<div className="category-clue-group">
						{clueButtons}
					</div>
				</div>
			);
		} else {
			return (
				<div className="category-group">
					<div className="category-header">
					</div>
					<div className="category-clue-group">
						{clueButtons}
					</div>
				</div>
			);
		}
		
	}
});

var ClueButton = React.createClass({
	propTypes: {
		clue: PropTypes.object,
		prefix: PropTypes.string,
		suffix: PropTypes.string,
		value: PropTypes.number
	},
	render: function() {
		if (this.props.clue.active) {
			var button = (
				<div 
					className="clue-button active">
					<p className="clue-button">{this.props.prefix}{this.props.value}{this.props.suffix}</p>
				</div>
			);
			return button;
		} else {
			return (
				<div 
					className="clue-button inactive">
					<p className="clue-button"/>
				</div>
			);
		}
		
	}
});



class OpenQuestionPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			playerAnswering: -1
		};
		
		this.render = this.render.bind(this);
	}
	render() {
		console.log(this.props.clue);

		return (
			<div id="open-question-panel">
				<div className="open-question-clue">
					<p className="open-question-clue">
						{this.props.clue.answer}
					</p>
				</div>
			</div>
		);
	}
}

OpenQuestionPanel.propTypes = {
	clue: PropTypes.object
};



var DailyDoublePanel = React.createClass({
	render: function() {
		return (
			<div className="daily-double-panel">
				<div>
					<p className="daily">Daily</p>
					<p className="double">DOUBLE</p>
				</div>
			</div>
		);
	}
});

var FinalJeopardyPanel = React.createClass({
	propTypes: {
		final: PropTypes.object,
		categoryVisible: PropTypes.bool,
		clueVisible: PropTypes.bool,
		revealTone: PropTypes.bool,
		thinkMusicPlaying: PropTypes.bool
	},
	getDefaultProps: function() {
		return {
			categoryVisible: false,
			clueVisible: false,
			revealTone: false,
			thinkMusicPlaying: false,
		};
	},
	render: function() {
		var categoryPanel;
		if (this.props.categoryVisible) {
			categoryPanel = (
				<div className="final-jeopardy-category">
					<p className="final-jeopardy-category">
						{this.props.final.category}
					</p>
				</div>
			);
		} else {
			categoryPanel = <FinalJeopardyLogo/>;
		}

		var cluePanel;
		if (this.props.clueVisible) {
			cluePanel = (
				<div className="final-jeopardy-clue">
					<p className="final-jeopardy-clue">
						{this.props.final.answer}
					</p>
				</div>
			);
		} else {
			cluePanel = <FinalJeopardyLogo/>;
		}

		return (
			<div className="final-jeopardy-panel">
				<div className="final-jeopardy-row">
					<div className="final-jeopardy-blank"/>
					{categoryPanel}
				</div>
				<div className="final-jeopardy-row">
					<div className="final-jeopardy-blank"/>
					{cluePanel}
				</div>
			</div>
		);
	}
});

var FinalJeopardyLogo = React.createClass({
	render: function() {
		return (
			<div className="final-jeopardy-logo">
				<div>
					<p className="handwriting">Final</p>
					<img src="images/white logo.png"/>
				</div>
			</div>
		);
	}
});

var FinalJeopardyResponsePanel = React.createClass({
	propTypes: {
		player: PropTypes.object,
		responseVisible: PropTypes.bool,
		wagerVisible: PropTypes.bool,
		response: PropTypes.string,
		wager: PropTypes.string
	},
	render: function() {
		return (
			<div className="final-response">
				<div className="final-response-name">
					<p className="final-response-name">
						{this.props.screenName}
					</p>
				</div>
				<div className="final-response-question">
					<p className="final-response-question">
						{this.props.responseVisible ? this.props.response : ""}
					</p>
				</div>
				<div className="final-response-wager">
					<p className="final-response-wager">
						{this.props.wagerVisible ? this.props.wager : ""}
					</p>
				</div>
			</div>
		);
	}
});
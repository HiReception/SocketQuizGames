var React = require("react");
var ReactDOM = require("react-dom");
var socket = require("socket.io-client")();
var soundManager = require("soundmanager2").soundManager;

var wheelTurnInterval = 50;

var relativePointerArray = [35, 0, -35];


function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return "";
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}


socket.on("connect_timeout", function() {
	console.log("connection timeout");
});

socket.on("connect", function() {
	console.log("connected");
	socket.emit("display request", {
		gameCode: getParameterByName("gamecode")
	});
});

socket.on("connect_error", function(err) {
	console.log("connection error: " + err);
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

	soundManager.createSound({id: "ding", url: "./sounds/ding.wav", autoLoad: true});
	soundManager.createSound({id: "buzzer", url: "./sounds/buzzer.mp3", autoLoad: true});
	soundManager.createSound({id: "showPuzzle", url: "./sounds/showPuzzle.wav", autoLoad: true});

});

socket.on("play sound", function(id) {
	soundManager.play(id);
});


class DisplayContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentPanel: "NoPuzzlePanel",
			puzzles: [],
			bonus: {},
			wheels: [],
			currentRound: -2,
			spinning: false,
			wheelAngle: 0,

			currentBoard: [],
			usedLetters: "",
			lastLetterCalled: "",
			numberOfMatchesLast: 0,
			currentPuzzleSolved: false,
			currentFinalBoard: [],
			currentAnswer: "",
			currentCategory: "",

			bonusConsonantsLeft: 0,
			bonusVowelsLeft: 0,
			selectedLetters: [],
			bonusAnswerRevealed: false,
			bonusSecondsRemaining: 10,
			bonusClockStarted: false,

			displayedBoard: [],

			players: [{
				score: 0,
				colour: "#ff0000"
			},{
				score: 0,
				colour: "#ffff00"
			},{
				score: 0,
				colour: "#0000ff"
			}],
			currentPlayer: 0,
			selectingConsonant: false
		};
		
		this.render = this.render.bind(this);
		this.updateBoardByCell = this.updateBoardByCell.bind(this);
		this.lightUpChanges = this.lightUpChanges.bind(this);
		this.cellLightToLetter = this.cellLightToLetter.bind(this);
		this.spin = this.spin.bind(this);
		this.finishSpin = this.finishSpin.bind(this);
		var thisPanel = this;

		socket.on("new game state", function(state) {
			console.log("new state received");
			// connecting before puzzles are loaded
			if (state.currentPanel === "NoPuzzlePanel") {
				thisPanel.setState({
					displayedBoard: ["@           @","             ","             ","@           @"]
				});

			// new puzzle revealed (except where game is re-connecting mid-game)
			} else if (thisPanel.state.currentRound !== -2
				&& 
					(state.currentRound !== thisPanel.state.currentRound || 
					(state.currentPanel === "BonusRoundPanel" && thisPanel.state.currentPanel !== "BonusRoundPanel"))) {
				// play puzzle reveal chime
				soundManager.play("showPuzzle");
				thisPanel.updateBoardByCell(thisPanel.state.displayedBoard, state.currentBoard);

			// initial connection
			} else if (thisPanel.state.currentBoard.length === 0) {
				thisPanel.setState({
					displayedBoard: state.currentBoard
				});

			// puzzle just solved
			} else if (state.currentPuzzleSolved && !thisPanel.state.currentPuzzleSolved && !state.bonusAnswerRevealed) {
				// TODO play solve theme
				thisPanel.updateBoardByCell(thisPanel.state.displayedBoard, state.currentBoard);

			// just moved to NextRoundPanel
			} else if (state.currentPanel === "NextRoundPanel" && state.currentPanel !== thisPanel.state.currentPanel) {
				thisPanel.updateBoardByCell(thisPanel.state.displayedBoard, 
					["@           @","             ","             ","@           @"]);


			// new letter called with no matches
			} else if (state.lastLetterCalled !== thisPanel.state.lastLetterCalled
				&& state.numberOfMatchesLast === 0
				&& state.lastLetterCalled) {
				// play buzzer
				soundManager.play("buzzer");


			// change in current board that isn't a solve - i.e. selection of letter in puzzle
			} else if (state.currentBoard !== thisPanel.state.currentBoard && !state.currentPuzzleSolved) {
				thisPanel.lightUpChanges(thisPanel.state.displayedBoard, state.currentBoard);

			



			// all other cases
			} else {
				thisPanel.setState({
					displayedBoard: state.currentBoard
				});
			}


			// spinning wheel
			if (state.spinning && !thisPanel.state.spinning) {
				thisPanel.spin();
			}
			console.log(state);
			thisPanel.setState(state);
		});
	}

	setGameState(state) {
		this.setState(state);
		socket.emit("set state", state);
	}

	updateBoardByCell(oldBoard, newBoard) {
		var changeCoordinates = [];
		var newDisplayBoard = oldBoard;
		for (var col in oldBoard[0]) {
			for (var row in oldBoard) {
				if (oldBoard[row][col] !== newBoard[row][col]) {
					changeCoordinates.push({row: row, col: col});
				}
			}
		}

		var currentChange = 0;
		var thisPanel = this;
		var change = function() {
			var r = changeCoordinates[currentChange].row;
			var c = changeCoordinates[currentChange].col;
			newDisplayBoard[r] = replaceChar(newDisplayBoard[r], c, newBoard[r][c]);
			thisPanel.setState({
				displayedBoard: newDisplayBoard
			});
			currentChange++;
			if (changeCoordinates.length > currentChange) {
				setTimeout(change, 25);
			}
		};
		if (changeCoordinates.length > 0) {
			change();
		}
	}

	lightUpChanges(oldBoard, newBoard) {
		console.log("Boards at call of lightUpChanges(): ");
		console.log(oldBoard);
		console.log(newBoard);
		var changeCoordinates = [];
		var newDisplayBoard = oldBoard;
		for (var col in oldBoard[0]) {
			for (var row in oldBoard) {
				if (oldBoard[row][col] !== newBoard[row][col]) {
					console.log("Change found at [" + row + "][" + col + "]: " + oldBoard[row][col] + " vs " + newBoard[row][col]);
					changeCoordinates.push({row: row, col: col});
				}
			}
		}

		var currentChange = 0;
		var thisPanel = this;
		var change = function() {
			console.log("change: currentChange = " + currentChange);
			var r = changeCoordinates[currentChange].row;
			var c = changeCoordinates[currentChange].col;
			console.log("r = " + r + " c = " + c);
			newDisplayBoard[r] = replaceChar(newDisplayBoard[r], c, "*");
			// play ding sound
			soundManager.play("ding");
			thisPanel.setState({
				displayedBoard: newDisplayBoard
			});
			setTimeout(function() {thisPanel.cellLightToLetter(r, c, newBoard[r][c]);}, 1500);
			currentChange++;
			if (changeCoordinates.length > currentChange) {
				setTimeout(change, 1000);
			}
		};
		if (changeCoordinates.length > 0) {
			change();
		}
		
	}


	cellLightToLetter(row, col, letter) {
		var newDisplayBoard = this.state.displayedBoard;
		newDisplayBoard[row] = replaceChar(newDisplayBoard[row], col, letter);
		this.setState({
			displayedBoard: newDisplayBoard
		});
	}

	spin() {
		var thisPanel = this;
		var maxAngleIncrement = Math.random() * 5 + 5;
		console.log("maxAngleIncrement = " + maxAngleIncrement);
		var angleIncrement = 0;
		this.setState({
			spinning: true
		});
		var startWheel = setInterval(function() {
			thisPanel.setState({
				wheelAngle: (((thisPanel.state.wheelAngle + angleIncrement) % 360) + 360) % 360
			});
			
			//var pointedWedge = wedgeArray.length - Math.floor(((angle - wedgeSpan/2 + 360) % 360) / wedgeSpan) - 1;
			//ReactDOM.render(<div>{wedgeValueArray[pointedWedge]}</div>, document.getElementById("angle-panel"));

			angleIncrement += maxAngleIncrement / 10;
			if (angleIncrement >= maxAngleIncrement) {
				clearInterval(startWheel);

				var slowDownAmount = 1/Math.floor(Math.random() * 15 + 15);
				var slowDownWheel = setInterval(function() {

					thisPanel.setState({
						wheelAngle: (((thisPanel.state.wheelAngle + angleIncrement) % 360) + 360) % 360
					});
					
					//var pointedWedge = wedgeArray.length - Math.floor(((angle - wedgeSpan/2 + 360) % 360) / wedgeSpan) - 1;
					//ReactDOM.render(<div>{wedgeValueArray[pointedWedge]}</div>, document.getElementById("angle-panel"));

					angleIncrement -= slowDownAmount;
					if (angleIncrement <= 0) {
						clearInterval(slowDownWheel);
						console.log(thisPanel.state.wheelAngle);
						thisPanel.finishSpin();
					}
			
				}, wheelTurnInterval);
			}
		}, wheelTurnInterval);
	}

	finishSpin() {

		var thisPanel = this;
		var wedges = [];
		if (this.state.currentRound < this.state.wheels.length) {
			wedges = this.state.wheels[this.state.currentRound];
		} else {
			wedges = this.state.wheels[this.state.wheels.length - 1];
		}
		var wedgeSpan = 360 / wedges.length;
		var playerLandedWedges = relativePointerArray.map(function(angle) {
			return wedges.length
			- Math.floor(((thisPanel.state.wheelAngle - wedgeSpan/2 + angle + 360) % 360) / wedgeSpan) - 1;
		});

		this.setGameState({
			spinning: false,
			currentWedge: wedges[playerLandedWedges[this.state.currentPlayer]].value,
			wheelAngle: this.state.wheelAngle
		});
	}

	render() {
		var mainPanel;

		switch (this.state.currentPanel) {
		case "NoPuzzlePanel":
		case "NextRoundPanel":
		case "PuzzleBoardPanel":
		case "BonusRoundPanel":
			mainPanel = (
				<PuzzleBoardPanel
					key={this.state.newPanelKey}
					puzzle={this.state.puzzles[this.state.currentRound]}
					gameState={this.state}
				/>
			);
			break;
		}

		return (
			<div id="display-panel" className="content">
				<div id="question-panel" className="content">
					{mainPanel}
				</div>
			</div>
		);
	}
}


var PuzzleBoardGrid = React.createClass({
	propTypes: {
		currentBoard: React.PropTypes.array
	},
	render: function() {
		var boardRows = this.props.currentBoard.map(function(row, rowIndex) { 
			var rowCells = Array.prototype.map.call(row, function(cell, cellIndex) {
				var classModifier = "";
				if (cell === "@") {
					return null;
				} else if (cell === " ") {
					classModifier = " shaded";
				} else if (cell === "_") {
					classModifier = " blank";
				} else if (cell === "*") {
					classModifier = " lit";
				}
				return <div className={"puzzle-board-cell" + classModifier} key={cellIndex}>{cell}</div>;
			});
			return <div key={rowIndex} className="puzzle-board-row">{rowCells}</div>;
		});
		return <div className="current-board-panel">{boardRows}</div>;
	}
});


// panel showing category, current board, correct answer, and letters both available and called
var PuzzleBoardPanel = React.createClass({
	render: function() {
		var categoryPanel = null;
		if (this.props.gameState.currentPanel === "PuzzleBoardPanel") {
			categoryPanel = (
				<div className="puzzle-category-panel">
					<p className="puzzle-category-panel">
						{this.props.gameState.currentCategory.toUpperCase()}
					</p>
				</div>
			);
		} else if (this.props.gameState.currentPanel === "BonusRoundPanel") {
			categoryPanel = (
				<div className="bonus-category-panel">
					<p className="called-letters">
						{this.props.gameState.selectedLetters}
					</p>
					<p className="puzzle-category-panel">
						{this.props.gameState.currentCategory.toUpperCase()}
					</p>
				</div>
			);
		}

		var wheelContainer = null;
		if (this.props.gameState.currentPanel === "PuzzleBoardPanel") {
			var wedges = [];
			if (this.props.gameState.currentRound < this.props.gameState.wheels.length) {
				wedges = this.props.gameState.wheels[this.props.gameState.currentRound];
			} else {
				wedges = this.props.gameState.wheels[this.props.gameState.wheels.length - 1];
			}

			wheelContainer = (
				<WheelContainer
					wedges={wedges}
					angle={this.props.gameState.wheelAngle}
					currentPlayer={this.props.gameState.currentPlayer}/>
			);
		}

		var playerPanels = [];
		for (var p in this.props.gameState.players) {
			playerPanels.push((
				<div key={p} className="player-panel" style={{
					backgroundColor: this.props.gameState.players[p].colour
				}}>
					<div className="player-panel-inner">
						<p className="player-panel" style={{
							color: "white"
						}}>
							{this.props.gameState.players[p].roundScore}
						</p>
					</div>
				</div>
			));
		}


		

		return (
			<div className="puzzle-board-panel">
			<div className="player-row">
				{playerPanels}
			</div>
				<div className="above-puzzle-board" id="above-puzzle-board">
					{wheelContainer}
				</div>
				<PuzzleBoardGrid currentBoard={this.props.gameState.displayedBoard}/>
				<div className="below-puzzle-board">
					{categoryPanel}
				</div>
			</div>
		);
	}
});

var WheelContainer = React.createClass({
	propTypes: {
		wedges: React.PropTypes.array,
		angle: React.PropTypes.number,
		currentPlayer: React.PropTypes.number
	},
	getInitialState: function() {
		return {
			diameter: 100
		};
	},
	render: function() {
		var newHeightWidth = this.state.diameter * 4/3;
		return (
			<div id="wheel-viewport" className="wheel-viewport">
				<div id="wheel-container" className="wheel-container"
				style={{
					top: newHeightWidth/-24 + "px",
					height: newHeightWidth + "px",
					width: newHeightWidth + "px",
					backgroundImage: "url(lit-pointers/" + this.props.currentPlayer + ".png)"
				}}>
					<WheelPanel
						wedges={this.props.wedges}
						diameter={this.state.diameter}
						angle={this.props.angle}/>
				</div>
			</div>
		);
	},
	componentDidMount: function() {
		this.updateDimensions();
		window.addEventListener("resize", this.updateDimensions);
	},
	componentWillUnmount: function() {
		window.removeEventListener("resize", this.updateDimensions);
	},
	updateDimensions: function() {
		var node = ReactDOM.findDOMNode(this);
		if (node) {
			var diameter = node.clientHeight * 2;
			this.setState({
				diameter: diameter
			});
		}
		
	}
});

function replaceChar(string, pos, newChar) {
	var endStart = (+newChar.length + +pos);
	return string.substr(0, pos) + newChar + string.substr(endStart);
}

var WheelPanel = React.createClass({
	propTypes: {
		wedges: React.PropTypes.array,
		wheelTurnInterval: React.PropTypes.number,
		spinCallback: React.PropTypes.func,
		diameter: React.PropTypes.number,
		angle: React.PropTypes.number
	},
	getInitialState: function() {
		return {
			currentlySpinning: false
		};
	},
	render: function() {
		
		var visibleWedges = [];
		var wedgeImageHeight = this.props.diameter * 10/9;
		var wedgeImageWidth = wedgeImageHeight * 0.15;
		var wedgeSpan = 360.0 / this.props.wedges.length;
    
		// add pointed-to wedge to list of visible ones
		for (var w in this.props.wedges) {
			var rotate = this.props.angle + (wedgeSpan * w);
			var rotateString = "rotate(" + rotate + "deg)";
			visibleWedges.push((
				<img
					key={w}
					className="wedge"
					src={wedgeFilename(this.props.wedges[w])}
					style={{
						"height": wedgeImageHeight,
						"width": wedgeImageWidth,
						"top": -(wedgeImageHeight - this.props.diameter) / 2,
						"left": (this.props.diameter - wedgeImageWidth) / 2,
						"WebkitTransform": rotateString,
						"MozTransform": rotateString,
						"OTransform": rotateString,
						"msTransform": rotateString,
						"transform": rotateString
					}}
				/>
			));
		}
    
		
		return (
			<div className="wheel" id="wheel"
				style={{
					"height": this.props.diameter,
					"width": this.props.diameter
				}}>
				{visibleWedges}
			</div>
		);
	}
});

function wedgeFilename(wedge) {
	if (wedge.value === "Bankrupt") {
		return "wedges/bankrupt.png";
	} else if (wedge.value === "Lose a Turn") {
		return "wedges/lat-" + wedge.colour + ".png";
	} else {
		return "wedges/" + wedge.value + "-" + wedge.colour + ".png";
	}
}
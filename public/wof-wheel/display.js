var React = require("react");
var ReactDOM = require("react-dom");
var soundManager = require("soundmanager2").soundManager;

soundManager.setup({

	onready: function() {
		// SM2 has loaded, API ready to use e.g., createSound() etc.
	},

	ontimeout: function() {
		// Uh-oh. No HTML5 support, SWF missing, Flash blocked or other issue
	}

});

var round1Array = [
	{value: 750, 			colour: "silver"},
	{value: "Lose a Turn", 	colour: "teal"},
	{value: 200, 			colour: "yellow"},
	{value: 165, 			colour: "pink"},
	{value: 110, 			colour: "purple"},
	{value: 200, 			colour: "orange"},
	{value: 310, 			colour: "blue"},
	{value: 230, 			colour: "pink"},
	{value: 150, 			colour: "yellow"},
	{value: 200, 			colour: "teal"},
	{value: 250, 			colour: "orange"},
	{value: "Bankrupt"},
	{value: 150, 			colour: "blue"},
	{value: 120, 			colour: "pink"},
	{value: 300, 			colour: "yellow"},
	{value: 200, 			colour: "teal"},
	{value: 155, 			colour: "purple"},
	{value: 220, 			colour: "orange"},
	{value: 120, 			colour: "blue"},
	{value: 275, 			colour: "pink"},
	{value: 110, 			colour: "yellow"},
	{value: 165, 			colour: "teal"},
	{value: 150, 			colour: "purple"},
	{value: 130, 			colour: "orange"}
];

var round2Array = [
	{value: 1500, 			colour: "silver"},
	{value: 385,		 	colour: "teal"},
	{value: 230, 			colour: "yellow"},
	{value: 530, 			colour: "pink"},
	{value: 500, 			colour: "blue"},
	{value: "Lose a Turn",	colour: "orange"},
	{value: 610, 			colour: "purple"},
	{value: 375, 			colour: "pink"},
	{value: 310, 			colour: "yellow"},
	{value: 180, 			colour: "teal"},
	{value: "Bankrupt"},
	{value: 310,			colour: "orange"},
	{value: 430, 			colour: "purple"},
	{value: 230, 			colour: "teal"},
	{value: 385, 			colour: "yellow"},
	{value: 310, 			colour: "pink"},
	{value: 430, 			colour: "blue"},
	{value: 145, 			colour: "orange"},
	{value: 180, 			colour: "purple"},
	{value: 230, 			colour: "teal"},
	{value: 500, 			colour: "blue"},
	{value: 450, 			colour: "yellow"},
	{value: 180, 			colour: "pink"},
	{value: 150, 			colour: "blue"}
];

var round4Array = [
	{value: 2500, 			colour: "silver"},
	{value: 295,		 	colour: "teal"},
	{value: "Lose a Turn",	colour: "yellow"},
	{value: 385, 			colour: "pink"},
	{value: 220, 			colour: "purple"},
	{value: 595,			colour: "orange"},
	{value: "Bankrupt"},
	{value: 295, 			colour: "blue"},
	{value: 375, 			colour: "pink"},
	{value: 180, 			colour: "orange"},
	{value: "Lose a Turn",	colour: "teal"},
	{value: 385,			colour: "yellow"},
	{value: 295, 			colour: "blue"},
	{value: 510, 			colour: "pink"},
	{value: 375, 			colour: "orange"},
	{value: 770, 			colour: "purple"},
	{value: 460, 			colour: "teal"},
	{value: 640, 			colour: "yellow"},
	{value: "Bankrupt"},
	{value: 295, 			colour: "purple"},
	{value: 580, 			colour: "teal"},
	{value: 280, 			colour: "pink"},
	{value: 220, 			colour: "blue"},
	{value: 265, 			colour: "orange"}
];


var relativePointerArray = [35, 0, -35];

var wheelTurnInterval = 50;


var containerHeightWidth = 0;

document.getElementById("container").style.height = containerHeightWidth + "px";
document.getElementById("container").style.width = containerHeightWidth + "px";
document.getElementById("container").style.top = containerHeightWidth/-24 + "px";

var WheelPanel = React.createClass({
	propTypes: {
		angle: React.PropTypes.number,
		round: React.PropTypes.number
	},
	getInitialState: function() {
		var wedgeArray;
		switch(this.props.round) {
		case 1:
			wedgeArray = round1Array;
			break;
		case 2:
			wedgeArray = round2Array;
			break;
		case 3:
			wedgeArray = round2Array;
			break;
		case 4: 
			wedgeArray = round4Array;
			break;
		default: 
			wedgeArray = round1Array;
			break;
		}
		return {
			currentAngle: this.props.angle,
			currentlySpinning: false,
			diameter: 0,
			wedgeArray: wedgeArray
		};
	},
	updateDimensions: function() {
		var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		this.setState({
			diameter: viewportHeight * 2
		});
		containerHeightWidth = viewportHeight * (8/3);

		document.getElementById("container").style.height = containerHeightWidth + "px";
		document.getElementById("container").style.width = containerHeightWidth + "px";
		document.getElementById("container").style.top = containerHeightWidth/-24 + "px";
	},
	componentWillMount: function() {
		this.updateDimensions();
	},
	componentDidMount: function() {
		window.addEventListener("resize", this.updateDimensions);
	},
	componentWillUnmount: function() {
		window.removeEventListener("resize", this.updateDimensions);
	},
	spin: function() {
		var thisPanel = this;
		var maxAngleIncrement = Math.random() * 5 + 5;
		console.log("maxAngleIncrement = " + maxAngleIncrement);
		var angleIncrement = 0;
		this.setState({
			currentlySpinning: true
		});
		var startWheel = setInterval(function() {
			thisPanel.setState({
				currentAngle: (((thisPanel.state.currentAngle + angleIncrement) % 360) + 360) % 360
			});
			
			//var pointedWedge = wedgeArray.length - Math.floor(((angle - wedgeSpan/2 + 360) % 360) / wedgeSpan) - 1;
			//ReactDOM.render(<div>{wedgeValueArray[pointedWedge]}</div>, document.getElementById("angle-panel"));

			angleIncrement += maxAngleIncrement / 10;
			if (angleIncrement >= maxAngleIncrement) {
				clearInterval(startWheel);

				var slowDownAmount = 1/Math.floor(Math.random() * 15 + 15);
				var slowDownWheel = setInterval(function() {

					thisPanel.setState({
						currentAngle: (((thisPanel.state.currentAngle + angleIncrement) % 360) + 360) % 360
					});
					
					//var pointedWedge = wedgeArray.length - Math.floor(((angle - wedgeSpan/2 + 360) % 360) / wedgeSpan) - 1;
					//ReactDOM.render(<div>{wedgeValueArray[pointedWedge]}</div>, document.getElementById("angle-panel"));

					angleIncrement -= slowDownAmount;
					if (angleIncrement <= 0) {
						clearInterval(slowDownWheel);
						console.log(thisPanel.state.currentAngle);
						thisPanel.handlePostSpin();
					}
			
				}, wheelTurnInterval);
			}
		}, wheelTurnInterval);
	},
	handlePostSpin: function() {
		var thisPanel = this;
		this.setState({
			currentlySpinning: false
		});
		var wedgeSpan = 360 / this.state.wedgeArray.length;
		var playerLandedWedges = relativePointerArray.map(function(angle) {
			return thisPanel.state.wedgeArray.length
			- Math.floor(((thisPanel.state.currentAngle - wedgeSpan/2 + angle + 360) % 360) / wedgeSpan) - 1;
		});
		
		for (var i in playerLandedWedges) {
			console.log("Player " + i + " landed on Wedge #" + playerLandedWedges[i]
				+ ", with a value of " + this.state.wedgeArray[playerLandedWedges[i]].value);
		}
	},
	render: function() {
		
		var visibleWedges = [];
		var wedgeImageHeight = this.state.diameter * 10/9;
		var wedgeImageWidth = wedgeImageHeight * 0.15;
		var wedgeSpan = 360.0 / this.state.wedgeArray.length;
    
		// add pointed-to wedge to list of visible ones
		for (var w in this.state.wedgeArray) {
			var rotate = this.state.currentAngle + (wedgeSpan * w);
			var rotateString = "rotate(" + rotate + "deg)";
			visibleWedges.push((
				<img
					key={w}
					className="wedge"
					src={wedgeFilename(this.state.wedgeArray[w])}
					style={{
						"height": wedgeImageHeight,
						"width": wedgeImageWidth,
						"top": -(wedgeImageHeight - this.state.diameter) / 2,
						"left": (this.state.diameter - wedgeImageWidth) / 2,
						"WebkitTransform": rotateString,
						"MozTransform": rotateString,
						"OTransform": rotateString,
						"msTransform": rotateString,
						"transform": rotateString
					}}
				/>
			));
		}
    
		var spinButton = null;

		if (!this.state.currentlySpinning) {
			spinButton = (
				<div
					onClick={this.spin}
					className="spin-button"
					style={{
						"left": this.state.diameter/2 - 75,
						"top": (this.state.diameter/2) - containerHeightWidth/12 - 50 - 25
					}}>
					Spin
				</div>
			);
		}
		
		return (
			<div className="wheel"
				style={{
					"height": this.state.diameter,
					"width": this.state.diameter
				}}>
				{visibleWedges}
				{spinButton}
			</div>
		);
	}
});

ReactDOM.render(<WheelPanel angle={0} round={1}/>, document.getElementById("wheel-panel"));

function wedgeFilename(wedge) {
	if (wedge.value === "Bankrupt") {
		return "wedges/bankrupt.png";
	} else if (wedge.value === "Lose a Turn") {
		return "wedges/lat-" + wedge.colour + ".png";
	} else {
		return "wedges/" + wedge.value + "-" + wedge.colour + ".png";
	}
}
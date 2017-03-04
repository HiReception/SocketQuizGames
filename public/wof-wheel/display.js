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

var wedgeArray = round2Array;



var diameter = 500;


var WheelPanel = React.createClass({
	propTypes: {
		angle: React.PropTypes.number
	},
	render: function() {
		var visibleWedges = [];
		var wedgeImageHeight = diameter * 10/9;
		var wedgeImageWidth = wedgeImageHeight * 0.15;
		var wedgeSpan = 360.0 / wedgeArray.length;
    
		// add pointed-to wedge to list of visible ones
		for (var w in wedgeArray) {
			var rotate = this.props.angle + (wedgeSpan * w);
			var rotateString = "rotate(" + rotate + "deg)";
			visibleWedges.push((
				<img
					key={w}
					className="wedge"
					src={wedgeFilename(wedgeArray[w])}
					style={{
						"height": wedgeImageHeight,
						"width": wedgeImageWidth,
						"WebkitTransform": rotateString,
						"MozTransform": rotateString,
						"OTransform": rotateString,
						"msTransform": rotateString,
						"transform": rotateString
					}}
				/>
			));
		}
    
		
		return <div className="wheel">{visibleWedges}</div>;
	}
});
var angle = 0;
ReactDOM.render(<WheelPanel angle={angle}/>, document.getElementById("wheel-panel"));

var spin = function() {
	var maxAngleIncrement = Math.random() * 5 + 5;
	console.log("maxAngleIncrement = " + maxAngleIncrement);
	var angleIncrement = 0;
	var startWheel = setInterval(function() {
		var wedgeSpan = 360 / wedgeArray.length;
		angle += angleIncrement;
		angle = ((angle % 360) + 360) % 360;
		ReactDOM.render(<WheelPanel angle={angle}/>, document.getElementById("wheel-panel"));
		
		//var pointedWedge = wedgeArray.length - Math.floor(((angle - wedgeSpan/2 + 360) % 360) / wedgeSpan) - 1;
		//ReactDOM.render(<div>{wedgeValueArray[pointedWedge]}</div>, document.getElementById("angle-panel"));

		angleIncrement += maxAngleIncrement / 10;
		if (angleIncrement >= maxAngleIncrement) {
			clearInterval(startWheel);

			var slowDownAmount = 1/Math.floor(Math.random() * 10 + 10);
			var slowDownWheel = setInterval(function() {

				var wedgeSpan = 360 / wedgeArray.length;

				angle += angleIncrement;
				angle = ((angle % 360) + 360) % 360;
				ReactDOM.render(<WheelPanel angle={angle}/>, document.getElementById("wheel-panel"));
				
				//var pointedWedge = wedgeArray.length - Math.floor(((angle - wedgeSpan/2 + 360) % 360) / wedgeSpan) - 1;
				//ReactDOM.render(<div>{wedgeValueArray[pointedWedge]}</div>, document.getElementById("angle-panel"));

				angleIncrement -= slowDownAmount;
				if (angleIncrement <= 0) {
					clearInterval(slowDownWheel);
					console.log(angle);
					var landedWedge = wedgeArray.length - Math.floor(((angle - wedgeSpan/2 + 360) % 360) / wedgeSpan) - 1;
					handlePostSpin(landedWedge);
				}
		
			}, 100);


		}
  
	}, 100);
	
};

function handlePostSpin(landedWedge) {
	console.log("You landed on Wedge #" + landedWedge + ", with a value of " + wedgeArray[landedWedge].value);
}



document.getElementById("wheel-panel").addEventListener("click", spin);


function wedgeFilename(wedge) {
	if (wedge.value === "Bankrupt") {
		return "wedges/bankrupt.png";
	} else if (wedge.value === "Lose a Turn") {
		return "wedges/lat-" + wedge.colour + ".png";
	} else {
		return "wedges/" + wedge.value + "-" + wedge.colour + ".png";
	}
}
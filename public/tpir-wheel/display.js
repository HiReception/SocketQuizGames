var React = require("react");
var PropTypes = require("prop-types");
var ReactDOM = require("react-dom");
var soundManager = require("soundmanager2").soundManager;

soundManager.setup({

	onready: function() {
		// SM2 has loaded, API ready to use e.g., createSound() etc.
		soundManager.createSound({id: "beep", url: "./sounds/beep.mp3", autoLoad: true});
		soundManager.createSound({id: "click", url: "./sounds/click.wav", autoLoad: true});
	},

	ontimeout: function() {
		// Uh-oh. No HTML5 support, SWF missing, Flash blocked or other issue
	}

});



var wedgeArray = ["wedges/0.PNG", "wedges/1.PNG", "wedges/2.PNG", "wedges/3.PNG", "wedges/4.PNG",
	"wedges/5.PNG", "wedges/6.PNG", "wedges/7.PNG", "wedges/8.PNG", "wedges/9.PNG",
	"wedges/10.PNG", "wedges/11.PNG", "wedges/12.PNG", "wedges/13.PNG", "wedges/14.PNG",
	"wedges/15.PNG", "wedges/16.PNG", "wedges/17.PNG", "wedges/18.PNG", "wedges/19.PNG"];

var wedgeValueArray = [100, 15, 80, 35, 60, 20, 40, 75, 55, 95, 50, 85, 30, 65, 10, 45, 70, 25, 90, 5];

/*
var wedgeArray = [
	"wedges-wof/750-silver.PNG",
	"wedges-wof/lat-teal.PNG",
	"wedges-wof/200-yellow.PNG",
	"wedges-wof/165-pink.PNG",
	"wedges-wof/110-purple.PNG",
	"wedges-wof/200-orange.PNG",
	"wedges-wof/310-blue.PNG",
	"wedges-wof/230-pink.PNG",
	"wedges-wof/150-yellow.PNG",
	"wedges-wof/200-teal.PNG",
	"wedges-wof/250-orange.PNG",
	"wedges-wof/bankrupt.PNG",
	"wedges-wof/150-blue.PNG",
	"wedges-wof/120-pink.PNG",
	"wedges-wof/300-yellow.PNG",
	"wedges-wof/200-teal.PNG",
	"wedges-wof/155-purple.PNG",
	"wedges-wof/220-orange.PNG",
	"wedges-wof/120-blue.PNG",
	"wedges-wof/275-pink.PNG",
	"wedges-wof/110-yellow.PNG",
	"wedges-wof/165-teal.PNG",
	"wedges-wof/150-purple.PNG",
	"wedges-wof/130-orange.PNG",
];

var wedgeValueArray = [750, "LAT", 200, 165, 110, 200, 310, 230,
150, 200, 250, "BR", 150, 120, 300, 200, 155, 220, 120, 275, 110,
165, 150, 130];
*/



var standardWedgeHeight = 75;

class WheelPanel extends React.Component {
	render = () => {
		var visibleWedges = [];
		var wedgeSpan = 360.0 / wedgeArray.length;
		var angleOffCentre = this.props.angle % wedgeSpan;
		var currentWedge = (Math.floor(((this.props.angle)/wedgeSpan)) * -1) % wedgeArray.length + wedgeArray.length;
    
		// add pointed-to wedge to list of visible ones
		var currentHeight = Math.cos(angleOffCentre/180*Math.PI);
		visibleWedges.push((
			<div
				key={currentWedge}
				className="wedge"
				style={{
					"height": standardWedgeHeight * currentHeight,
					"backgroundImage": "url(" + wedgeArray[currentWedge % wedgeArray.length] + ")"
				}}
			/>
		));
    
		// add wedges above pointed-to wedge
		for (var a = angleOffCentre + wedgeSpan; a < angleOffCentre + 90; a += wedgeSpan) {
			var w = Math.floor((a/wedgeSpan)) + currentWedge;
			var h = Math.cos(a/180*Math.PI);
			visibleWedges.unshift((
				<div
					key={w}
					className="wedge"
					style={{
						"height": standardWedgeHeight * h,
						"backgroundImage": "url(" + wedgeArray[w % wedgeArray.length] + ")"
					}}
				/>
			));
		}
		
		// add wedges below pointed-to wedge
		for (a = angleOffCentre - wedgeSpan; a > angleOffCentre - 90 - wedgeSpan; a -= wedgeSpan) {
			w = Math.floor((a/wedgeSpan)) + currentWedge;
			h = Math.cos(a/180*Math.PI);
			visibleWedges.push((
				<div
					key={w}
					className="wedge"
					style={{
						"height": standardWedgeHeight * h,
						"backgroundImage": "url(" + wedgeArray[((w % wedgeArray.length) + wedgeArray.length) % wedgeArray.length] + ")"
					}}
				/>
			));
		}
		
		return <div className="vert">{visibleWedges}</div>;
	}
}

WheelPanel.propTypes = {
	angle: PropTypes.number,
};


var angle = 0;
ReactDOM.render(<WheelPanel angle={angle}/>, document.getElementById("wheel-panel"));

var spin = function() {
	var maxAngleIncrement = Math.random() * 5 + 10;
	console.log("maxAngleIncrement = " + maxAngleIncrement);
	var angleIncrement = 0;
	var startWheel = setInterval(function() {
		var wedgeSpan = 360 / wedgeArray.length;

		if ((angle + wedgeSpan/2) % wedgeSpan < angleIncrement) {
			soundManager.play("beep", {
				multiShotEvents: true
			});
		}
		/*
		if ((angle + wedgeSpan/2) % wedgeSpan/4 < angleIncrement) {
			soundManager.play("click", {
				multiShotEvents: true
			});
		}*/

		

		angle -= angleIncrement;
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
				if ((angle + wedgeSpan/2) % wedgeSpan < angleIncrement) {
					soundManager.play("beep", {
						multiShotEvents: true
					});
				}
				/*
				if ((angle + wedgeSpan/2) % wedgeSpan/4 < angleIncrement) {
					soundManager.play("click", {
						multiShotEvents: true
					});
				}*/


				angle -= angleIncrement;
				angle = ((angle % 360) + 360) % 360;
				ReactDOM.render(<WheelPanel angle={angle}/>, document.getElementById("wheel-panel"));
				
				//var pointedWedge = wedgeArray.length - Math.floor(((angle - wedgeSpan/2 + 360) % 360) / wedgeSpan) - 1;
				//ReactDOM.render(<div>{wedgeValueArray[pointedWedge]}</div>, document.getElementById("angle-panel"));

				angleIncrement -= slowDownAmount;
				if (angleIncrement <= 0) {
					clearInterval(slowDownWheel);
				}
		
			}, 100);


		}
  
	}, 100);
	
};



document.getElementById("pointer-panel").addEventListener("click", spin);



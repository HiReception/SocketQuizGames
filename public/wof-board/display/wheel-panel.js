var React = require("react");
var PropTypes = require("prop-types");

export default class WheelPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentlySpinning: false
		};
	}
	wedgeFilename = (wedge) => {
		if (wedge.value === "Bankrupt") {
			return "wedges/bankrupt.png";
		} else if (wedge.value === "Lose a Turn") {
			return "wedges/lat-" + wedge.colour + ".png";
		} else {
			return "wedges/" + wedge.value + "-" + wedge.colour + ".png";
		}
	}
	render = () => {
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
					src={this.wedgeFilename(this.props.wedges[w])}
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
}

WheelPanel.propTypes = {
	wedges: PropTypes.array,
	wheelTurnInterval: PropTypes.number,
	spinCallback: PropTypes.func,
	diameter: PropTypes.number,
	angle: PropTypes.number
};
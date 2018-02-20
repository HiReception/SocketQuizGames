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
		const wedgeImageHeight = this.props.diameter * 10/9;
		const wedgeImageWidth = wedgeImageHeight * 0.15;
		const wedgeSpan = 360.0 / this.props.wedges.length;
		
		return (
			<div className="wheel" id="wheel"
				style={{
					"height": this.props.diameter,
					"width": this.props.diameter,
					"WebkitTransform": `rotate(${this.props.angle}deg)`,
					"MozTransform": `rotate(${this.props.angle}deg)`,
					"OTransform": `rotate(${this.props.angle}deg)`,
					"msTransform": `rotate(${this.props.angle}deg)`,
					"transform": `rotate(${this.props.angle}deg)`,
					"WebkitTransition": `transform ${this.props.spinDuration/1000}s`,
					"transition": `transform ${this.props.spinDuration/1000}s`,
				}}>
				{this.props.wedges.map((w, index) => {
					const rotate = (wedgeSpan * index);
					const rotateString = "rotate(" + rotate + "deg)";
					return (
						<img
							key={index}
							className="wedge"
							src={this.wedgeFilename(w)}
							style={{
								"height": wedgeImageHeight,
								"width": wedgeImageWidth,
								"top": -(wedgeImageHeight - this.props.diameter) / 2,
								"left": (this.props.diameter - wedgeImageWidth) / 2,
								"WebkitTransform": rotateString,
								"MozTransform": rotateString,
								"OTransform": rotateString,
								"msTransform": rotateString,
								"transform": rotateString,
							}}
						/>
					);
				})}
			</div>
		);
	}
}

WheelPanel.propTypes = {
	wedges: PropTypes.array,
	wheelTurnInterval: PropTypes.number,
	spinCallback: PropTypes.func,
	diameter: PropTypes.number,
	angle: PropTypes.number,
	spinDuration: PropTypes.number,
};
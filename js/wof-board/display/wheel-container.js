var React = require("react");
var PropTypes = require("prop-types");
var ReactDOM = require("react-dom");

import WheelPanel from "./wheel-panel";

export default class WheelContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			diameter: 100
		};
	}
	render = () => {
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
						angle={this.props.angle}
						spinDuration={this.props.spinDuration}/>
				</div>
			</div>
		);
	}
	componentDidMount = () => {
		this.updateDimensions();
		window.addEventListener("resize", this.updateDimensions);
	}
	componentWillUnmount = () => {
		window.removeEventListener("resize", this.updateDimensions);
	}
	updateDimensions = () => {
		var node = ReactDOM.findDOMNode(this);
		if (node) {
			var diameter = node.clientHeight * 2;
			this.setState({
				diameter: diameter
			});
		}
		
	}
}

WheelContainer.propTypes = {
	wedges: PropTypes.array,
	angle: PropTypes.number,
	currentPlayer: PropTypes.number,
	spinDuration: PropTypes.number,
}
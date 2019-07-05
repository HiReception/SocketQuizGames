var React = require("react");
var PropTypes = require("prop-types");
import {Group, Rect, Text} from "react-konva";
import {Motion, spring} from "react-motion";

export default class DailyDoublePanel extends React.Component {
	render = () => {
		const startingDetails = {
			x: this.props.startingLeft,
			y: this.props.startingTop,
			height: this.props.startingHeight,
			width: this.props.startingWidth,
			rotation: 0,
		};

		// TODO rotation of some sort as panel grows to fill board
		return (
			<Motion defaultStyle={startingDetails}
				style={{x: spring(0), y: spring(0), height: spring(this.props.height), width: spring(this.props.width), rotation: spring(360)}}>
				{({x, y, height, width}) => {
					
					const dailyFont = "Brush Script Standard Medium";
					const doubleFont = "Oswald Bold";

					const dailyHeight = 0.3 * height;
					const dailyTop = 0.2 * height;
					
					const doubleHeight = 0.4 * height;
					const doubleTop = 0.45 * height;

					return (
						<Group x={x} y={y}>
							<Rect height={height} width={width} x={0} y={0} fill="maroon" stroke="black" strokeWidth={2}/>
							
							<Text x={0}
								y={doubleTop}
								height={doubleHeight} width={width} wrap="none"
								fontSize={doubleHeight} fontFamily={doubleFont}
								fill="white" align="center"
								text="DOUBLE"/>
							<Text x={0}
								y={dailyTop}
								height={dailyHeight} width={width} wrap="none"
								fontSize={dailyHeight} fontFamily={dailyFont}
								fill="orange" align="center"
								text="Daily"/>
						</Group>
					);
				}}
			</Motion>
		);
	}
}

DailyDoublePanel.propTypes = {
	startingLeft: PropTypes.number,
	startingTop: PropTypes.number,
	startingHeight: PropTypes.number,
	startingWidth: PropTypes.number,
	height: PropTypes.number,
	width: PropTypes.number,
};
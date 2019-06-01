var React = require("react");
var PropTypes = require("prop-types");
import {Group, Rect, Text} from "react-konva";
import gf from "./general_functions";

export default class ClueButton extends React.Component {
	render = () => {
		const fontFamily = "Oswald Bold";
		const fontStyle = "";
		const valueString = `${this.props.prefix}${this.props.value}${this.props.suffix}`;
		const textHeightMargin = 0.25 * this.props.height;
		const textHeight = this.props.height - 2*textHeightMargin;
		const textWidthMargin = 0.1 * this.props.width;
		const textWidth = this.props.width - 2*textWidthMargin;

		return (
			<Group x={0} y={this.props.top}>
				<Rect height={this.props.height} width={this.props.width} x={0} y={0} fill="#0B1885" stroke="black" strokeWidth={2}/>
				<Text x={textWidthMargin + gf.textHorizontalSpacing(valueString, fontFamily, textHeight, textWidth, fontStyle)}
					y={textHeightMargin}
					height={textHeight} wrap="none"
					fontSize={textHeight} fontFamily={fontFamily} fontStyle={fontStyle}
					fill="orange" align="center"
					scaleX={gf.textScale(valueString, fontFamily, textHeight, textWidth, fontStyle)}
					text={valueString} visible={this.props.clue.active}/>
			</Group>
		);
		
	}
}

ClueButton.propTypes = {
	clue: PropTypes.object,
	prefix: PropTypes.string,
	suffix: PropTypes.string,
	value: PropTypes.number,
	height: PropTypes.number,
	width: PropTypes.number,
	top: PropTypes.number,
};
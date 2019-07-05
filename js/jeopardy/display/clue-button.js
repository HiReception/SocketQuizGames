var React = require("react");
var PropTypes = require("prop-types");
import {Group, Rect, Text} from "react-konva";
import gf from "./general_functions";

export default class ClueButton extends React.Component {
	render = () => {
		const fontFamily = "Oswald Bold";
		const fontStyle = "";
		const valueString = `${this.props.prefix}${this.props.value}${this.props.suffix}`;
		const buttonBorder = 0.01 * this.props.height;
		const textBoxHeight = this.props.height - 2 * buttonBorder;
		const textBoxWidth = this.props.width - 2 * buttonBorder;
		const textHeightMargin = 0.25 * textBoxHeight;
		const textHeight = textBoxHeight - 2*textHeightMargin;
		const textWidthMargin = 0.1 * textBoxWidth;
		const textWidth = textBoxWidth - 2*textWidthMargin;
		

		return (
			<Group x={0} y={this.props.top}>
				<Rect height={this.props.height} width={this.props.width} x={0} y={0} fill="black"/>
				<Rect height={textBoxHeight} width={textBoxWidth} x={buttonBorder} y={buttonBorder} fill="#0B1885"/>
				{/* <Rect x={textWidthMargin + gf.textHorizontalSpacing(valueString, fontFamily, textHeight, textWidth, fontStyle)}
					y={textHeightMargin}
					height={textHeight}
					stroke="grey" align="center"
					width={textWidth - 2 * gf.textHorizontalSpacing(valueString, fontFamily, textHeight, textWidth, fontStyle)}
					visible={this.props.clue.active}/> */}
				<Text x={buttonBorder + textWidthMargin + gf.textHorizontalSpacing(valueString, fontFamily, textHeight, textWidth, fontStyle)}
					y={buttonBorder + textHeightMargin}
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
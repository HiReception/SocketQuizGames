var React = require("react");
var PropTypes = require("prop-types");
import gf from "./general_functions";
import {Group, Rect, Text} from "react-konva";
import {Motion, spring} from "react-motion";

export default class OpenQuestionPanel extends React.Component {
	
	render = () => {
		const startingDetails = this.props.clue.dailyDouble ?
		{
			x: 0,
			y: 0,
			height: this.props.height,
			width: this.props.width,
		} :
		{
			x: this.props.startingLeft,
			y: this.props.startingTop,
			height: this.props.startingHeight,
			width: this.props.startingWidth,
		};

		const fontFamily = "Korinna Bold";
		const fontStyle = "";
		const clueString = this.props.clue.answer.toUpperCase();
		const defaultNumLines = 8;
		return (
			<Motion defaultStyle={startingDetails}
				style={{x: spring(0), y: spring(0), height: spring(this.props.height), width: spring(this.props.width)}}>
				{({x, y, height, width}) => {
					
					const textHeightMargin = 0.2 * height;
					
					
					const textHeight = height - 2*textHeightMargin;
					const textWidthMargin = 0.1 * width;
					const textWidth = width - 2*textWidthMargin;
					const calculatedNumLines = gf.numLines(clueString, fontFamily, textHeight/defaultNumLines, textWidth);
					const textSize = textHeight/Math.max(defaultNumLines, calculatedNumLines);
					const splitClue = gf.splitClue(clueString, fontFamily, textSize, textWidth);
					const finalNumLines = splitClue.split("\n").length;
					const vertSpacing = finalNumLines >= defaultNumLines ? 0 : (textHeight - (textSize * finalNumLines))/2;

					
					// TODO implement Motion from starting parameters, unless this clue is a Daily Double
					return (
						<Group x={x} y={y}>
							<Rect height={height} width={width} x={0} y={0} fill="#0B1885" stroke="black" strokeWidth={2}/>
							<Text x={textWidthMargin}
								y={textHeightMargin + vertSpacing}
								height={textHeight} width={textWidth} wrap="none"
								fontSize={textSize} fontFamily={fontFamily} fontStyle={fontStyle}
								fill="white" align="center"
								text={splitClue}/>
						</Group>
					);
				}}
			</Motion>
		);
		
	}
}

OpenQuestionPanel.propTypes = {
	clue: PropTypes.object,
	startingLeft: PropTypes.number,
	startingTop: PropTypes.number,
	startingHeight: PropTypes.number,
	startingWidth: PropTypes.number,
	height: PropTypes.number,
	width: PropTypes.number,
};
var React = require("react");
var PropTypes = require("prop-types");
import gf from "./general_functions";
import FinalJeopardyLogo from "./final-jeopardy-logo";
import {Text, Group, Rect} from "react-konva";

export default class FinalJeopardyPanel extends React.Component {
	render = () => {
		const {height, width} = this.props;
		var contentPanel;
		if (this.props.clueVisible) {
			const fontFamily = "Korinna Bold";
			const clueString = this.props.final.answer.toUpperCase();
			const textHeightMargin = 0.2 * height;
			const defaultNumLines = 8;
			
			const textHeight = height - 2*textHeightMargin;
			const textWidthMargin = 0.1 * width;
			const textWidth = width - 2*textWidthMargin;
			const calculatedNumLines = gf.numLines(clueString, fontFamily, textHeight/defaultNumLines, textWidth);
			const textSize = textHeight/Math.max(defaultNumLines, calculatedNumLines);
			const splitClue = gf.splitClue(clueString, fontFamily, textSize, textWidth);
			const finalNumLines = splitClue.split("\n").length;
			const vertSpacing = finalNumLines >= defaultNumLines ? 0 : (textHeight - (textSize * finalNumLines))/2;

			contentPanel = (
				<Text x={textWidthMargin}
						y={textHeightMargin + vertSpacing}
						height={textHeight} width={textWidth} wrap="none"
						fontSize={textSize} fontFamily={fontFamily}
						fill="white" align="center"
						text={splitClue}/>
			);
		} else if (this.props.categoryVisible) {
			const fontFamily = "Oswald Bold";
			const textHeightMargin = 0.25 * height;
			const textHeight = (height - 2 * textHeightMargin) / 2;
			const textWidthMargin = 0.1 * width;
			const textWidth = width - 2*textWidthMargin;

			const splitCategory = gf.splitLongString(this.props.final.category.toUpperCase(), fontFamily, textHeight, textWidth);


			contentPanel = (
				<Text x={textWidthMargin + gf.textHorizontalSpacing(splitCategory, fontFamily, textHeight, textWidth)}
						y={textHeightMargin + gf.textVerticalSpacing(splitCategory, textHeight)}
						height={textHeight * 2} wrap="none" textAlign="center"
						fontSize={textHeight} fontFamily={fontFamily}
						fill="white" align="center"
						scaleX={gf.textScale(splitCategory, fontFamily, textHeight, textWidth)}
						text={splitCategory}/>
			);
		} else {
			contentPanel = <FinalJeopardyLogo height={height} width={width}/>;
		}

		return (
			<Group x={0} y={0} height={height} width={width}>
				<Rect height={height} width={width} x={0} y={0} fill="#0B1885" stroke="black" strokeWidth={2}/>
				{contentPanel}
			</Group>

		);


	}
}

FinalJeopardyPanel.propTypes = {
	final: PropTypes.object,
	categoryVisible: PropTypes.bool,
	clueVisible: PropTypes.bool,
	height: PropTypes.number,
	width: PropTypes.number,
};
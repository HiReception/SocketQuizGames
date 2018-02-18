var React = require("react");
var PropTypes = require("prop-types");
import {Text, Group, Rect} from "react-konva";
import gf from "./general_functions";

export default class FinalJeopardyResponsePanel extends React.Component {
	render = () => {
		const {height, width, screenName, response, wager} = this.props;
		const panelWidthMargin = 0.02 * width;
		const panelWidth = width - (2*panelWidthMargin);
		const panelHeightMargin = 0.02 * height;
		const textHeightMargin = 0.05 * height;
		const textWidthMargin = 0.02 * width;
		const textWidth = panelWidth - 2*textWidthMargin;
		const fontFamily = "Rock Salt";


		const nameTerritory = 0.2 * height;
		const namePanelHeight = nameTerritory - 2*panelHeightMargin;
		const nameTextHeight = namePanelHeight - 2*textHeightMargin;

		const responseTerritory = 0.6 * height;
		const responsePanelHeight = responseTerritory - 2*panelHeightMargin;
		const responseTextHeight = responsePanelHeight - 2*textHeightMargin;
		const defaultNumLines = 4;
		const calculatedNumLines = gf.numLines(response, fontFamily, responseTextHeight/defaultNumLines, textWidth);
		const textSize = responseTextHeight/Math.max(defaultNumLines, calculatedNumLines);
		const splitClue = gf.splitClue(response, fontFamily, textSize, textWidth);
		const finalNumLines = splitClue.split("\n").length;
		const vertSpacing = finalNumLines >= defaultNumLines ? 0 : (responseTextHeight - (textSize * finalNumLines))/2;

		const wagerTerritory = 0.2 * height;
		const wagerPanelHeight = wagerTerritory - 2*panelHeightMargin;
		const wagerTextHeight = wagerPanelHeight - 2*textHeightMargin;




		return (
			<Group x={0} y={0} height={height} width={width}>
				<Rect height={height} width={width} x={0} y={0} fill="brown" stroke="black" strokeWidth={2}/>

				<Group x={panelWidthMargin} y={panelHeightMargin}>
					<Rect height={namePanelHeight} width={panelWidth} x={0} y={0} fill="#0B1885" stroke="black" strokeWidth={10}/>
					<Text x={textWidthMargin + gf.textHorizontalSpacing(screenName, fontFamily, nameTextHeight, textWidth)}
						y={textHeightMargin}
						height={nameTextHeight} wrap="none"
						fontSize={nameTextHeight} fontFamily={fontFamily}
						fill="white" align="center"
						scaleX={gf.textScale(screenName, fontFamily, nameTextHeight, textWidth)}
						text={screenName}/>
				</Group>

				<Group x={panelWidthMargin} y={panelHeightMargin + nameTerritory}>
					<Rect height={responsePanelHeight} width={panelWidth} x={0} y={0} fill="#0B1885" stroke="black" strokeWidth={10}/>
					<Text x={textWidthMargin}
						y={textHeightMargin + vertSpacing}
						height={responseTextHeight} width={textWidth} wrap="none"
						fontSize={textSize} fontFamily={fontFamily}
						fill="white" align="center"
						text={splitClue}/>
				</Group>


				<Group x={panelWidthMargin} y={panelHeightMargin + nameTerritory + responseTerritory}>
					<Rect height={wagerPanelHeight} width={panelWidth} x={0} y={0} fill="#0B1885" stroke="black" strokeWidth={10}/>
					<Text x={textWidthMargin + gf.textHorizontalSpacing(wager, fontFamily, nameTextHeight, textWidth)}
						y={textHeightMargin}
						height={wagerTextHeight} wrap="none"
						fontSize={wagerTextHeight} fontFamily={fontFamily}
						fill="white" align="center"
						scaleX={gf.textScale(wager, fontFamily, wagerTextHeight, textWidth)}
						text={wager} visible={this.props.wagerVisible}/>
				</Group>


			</Group>
			
		);
	}
}

FinalJeopardyResponsePanel.propTypes = {
	screenName: PropTypes.string,
	responseVisible: PropTypes.bool,
	wagerVisible: PropTypes.bool,
	response: PropTypes.string,
	wager: PropTypes.string,
	height: PropTypes.number,
	width: PropTypes.number,
};
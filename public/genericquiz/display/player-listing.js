var React = require("react");
var PropTypes = require("prop-types");
import {Text, Rect, Group} from "react-konva";
import {Motion, spring} from "react-motion";

export default class PlayerListing extends React.Component {
	constructor(props) {
		super(props);
	}

	textWidth = (text, font, size) => {
		var c=document.createElement("canvas");
		var cctx=c.getContext("2d");
		cctx.font = size + "px " + font;
		return cctx.measureText(text).width;
	}

	textScale = (text, font, size, width) => {
		const textWidth = this.textWidth(text, font, size);
		if (textWidth <= width) {
			return 1;
		} else {
			return width / textWidth;
		}
	}

	textHorizontalSpacing = (text, font, size, width) => {
		const textWidth = this.textWidth(text, font, size);
		if (textWidth >= width) {
			return 0;
		} else {
			return (width - textWidth)/2;
		}
	}

	render = () => {
		const nameWidthRatio = 0.8;
		const {top, height, width, player, answering} = this.props;
		const scoreString = player.score.toString();

		const heightMargin = 0.1 * height;
		const rectHeight = height - heightMargin * 2;
		const widthMargin = 0.05 * width;
		const rectWidth = width - widthMargin * 2;

		const textHeightMargin = 0.1 * rectHeight;
		const textHeight = rectHeight - textHeightMargin * 2;
		const textWidthMargin = 0.05 * rectWidth;
		const textWidth = rectWidth - textWidthMargin * 2;

		const nameFont = "Verdana";
		const scoreFont = "Impact";

		const nameWidth = nameWidthRatio * rectWidth;
		const nameTextWidth = textWidth * nameWidthRatio;
		const nameTextWidthMargin = (nameWidth - nameTextWidth)/2;
		const scoreWidth = (1 - nameWidthRatio) * rectWidth;
		const scoreTextWidth = textWidth * (1-nameWidthRatio);
		const scoreTextWidthMargin = (scoreWidth - scoreTextWidth)/2;

		const offScreenX = -width;

		return (
			<Motion defaultStyle={{x: offScreenX, y: top + heightMargin}}
				style={{x: spring(widthMargin), y: spring(top + heightMargin)}}>
				{({x, y}) => (
					<Group x={x} y={y} height={rectHeight} width={rectWidth}>
						<Rect fill={answering ? "white" : player.colour} x={0} y={0} stroke="black" strokeWidth="1"
							height={rectHeight} width={nameWidth} shadowColor="black"/>

						<Rect fill={answering ? "white" : player.colour} x={nameWidthRatio * rectWidth} y={0} stroke="black" strokeWidth="1"
							height={rectHeight} width={scoreWidth} shadowColor="black"/>

						<Text x={nameTextWidthMargin + this.textHorizontalSpacing(player.screenName, nameFont, textHeight, nameTextWidth)}
							y={textHeightMargin} height={textHeight} fontSize={textHeight} wrap="none"
							scaleX={this.textScale(player.screenName, nameFont, textHeight, nameTextWidth)} align="left" shadowColor="black"
							fontFamily={nameFont} fill={answering ? player.colour : "white"} text={player.screenName}/>

						<Text x={nameWidth + scoreTextWidthMargin + this.textHorizontalSpacing(scoreString, scoreFont, textHeight, scoreTextWidth)}
							y={textHeightMargin} height={textHeight} fontSize={textHeight} wrap="none"
							scaleX={this.textScale(scoreString, scoreFont, textHeight, scoreTextWidth)} align="left" shadowColor="black"
							fontFamily={scoreFont} fill={answering ? player.colour : "white"} text={scoreString}/>
					</Group>
				)}
			</Motion>
		);
	}
}

PlayerListing.propTypes = {
	player: PropTypes.object,
	answering: PropTypes.bool,
};
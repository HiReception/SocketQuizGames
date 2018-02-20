var React = require("react");
var PropTypes = require("prop-types");
import {Text, Group, Rect} from "react-konva";
import gf from "./general_functions";
import {Motion, spring} from "react-motion";

export default class PlayerListing extends React.Component {
	render = () => {
		return (
			<Motion defaultStyle={{x: this.props.left, y: this.props.top + this.props.height, height: this.props.height, width: this.props.width}}
				style={{x: spring(this.props.left), y: spring(this.props.top), height: spring(this.props.height), width: spring(this.props.width)}}>
				{({x, y, height, width}) => {

					const scoreString = this.props.prefix + this.props.player.score + this.props.suffix;

					const hMargin = 10;
					const wMargin = 10;
					const panelHeight = height - (2 * hMargin);
					const panelWidth = width - (2 * wMargin);

					const nameHeight = 0.5 * panelHeight;
					const scoreHeight = panelHeight - nameHeight;
					const nameTextHeight = 0.5 * nameHeight;
					const scoreTextHeight = 0.8 * scoreHeight;
					const nameTextHMargin = (nameHeight - nameTextHeight)/2;
					const scoreTextHMargin = (scoreHeight - scoreTextHeight)/2;

					const nameFont = "Verdana";
					const scoreFont = "Oswald Bold";

					const backgroundColour = this.props.answering ? "blue" : (this.props.lockedOut ? "grey" : "#0B1885");
					const scoreColour = this.props.player.score < 0 ? "red" : "white";
					
					return (
						<Group x={x} y={y} height={height} width={width}>
							<Rect x={wMargin} y={hMargin} height={nameHeight} width={panelWidth} fill={backgroundColour} stroke="black" strokeWidth={1}/>
							<Rect x={wMargin} y={hMargin + nameHeight} height={scoreHeight} width={panelWidth} fill={backgroundColour} stroke="black" strokeWidth={1}/>
							<Text text={this.props.player.screenName} fill="white" fontFamily={nameFont} fontSize={nameTextHeight}
							textAlign="center" height={nameTextHeight} scaleX={gf.textScale(this.props.player.screenName, nameFont, nameTextHeight, panelWidth)}
							x={wMargin + gf.textHorizontalSpacing(this.props.player.screenName, nameFont, nameTextHeight, panelWidth)} y={hMargin + nameTextHMargin}/>
							<Text text={scoreString} fill={scoreColour} fontFamily={scoreFont} fontSize={scoreTextHeight}
							textAlign="center"
							x={wMargin + gf.textHorizontalSpacing(scoreString, scoreFont, scoreTextHeight, panelWidth)} y={hMargin + nameHeight + scoreTextHMargin}
							height={scoreTextHeight} scaleX={gf.textScale(scoreString, scoreFont, scoreTextHeight, panelWidth)}/>
						</Group>
					);
				}}
			</Motion>
		);
	}
}

PlayerListing.propTypes = {
	player: PropTypes.object,
	answering: PropTypes.bool,
	lockedOut: PropTypes.bool,
	prefix: PropTypes.string,
	suffix: PropTypes.string,
	left: PropTypes.number,
	width: PropTypes.number,
	top: PropTypes.number,
	height: PropTypes.number,
};